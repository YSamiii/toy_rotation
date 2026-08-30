import { canonicalKey, unique } from '../data/schema.js';

export function identityTokens(toy = {}) {
  const keys = unique([toy.canonicalKey, toy.catalogKey, toy.catalogId, toy.key].map(canonicalKey));
  const names = unique([
    toy.productName, toy.name, toy.nameEn, toy.nameZh, toy.names?.en, toy.names?.zh,
    ...(toy.aliases || [])
  ].flatMap(identityNameForms).map(normalizeName));
  const brand = normalizeBrand(toy.brand);
  return { keys, names, brand, brandedNames:names.map(name => `${brand}|${name}`) };
}

// A catalog child can carry its English and Chinese names together in one
// display string ("First Puzzle 第一块拼图"), while an older ownership row
// retained only one language.  Keep the complete original name *and* its
// complete script-specific forms.  This is not substring matching: it merely
// makes the two durable aliases of the same named product available to the
// existing identity engine.
function identityNameForms(value) {
  const text = String(value || '').normalize('NFKC').trim();
  if (!text) return [];
  const latin = text.match(/[A-Za-z0-9]+(?:[\s'’&+\-]+[A-Za-z0-9]+)*/g) || [];
  // Numbers are identity-bearing for numbered sibling children (for example
  // 恐龙拼图 1–6); never erase them while extracting a complete Chinese name.
  // Do not emit a numeric-only “Chinese” alias. Product series such as
  // “6-in-1” otherwise collapse unrelated exact identities to the same `61`
  // token (for example Mideer Animal Family, Construction, and Dinosaurs).
  const chinese = /[\u4e00-\u9fff]/.test(text) ? (text.match(/[\u4e00-\u9fff0-9]+/g) || []) : [];
  return [text, latin.join(' ').trim(), chinese.join('').trim()].filter(Boolean);
}

export function sameCatalogIdentity(a, b) {
  if (differentSetEntities(a, b)) return false;
  const left = identityTokens(a); const right = identityTokens(b);
  if (left.keys.some(key => right.keys.includes(key))) return true;
  if (distinctSku(a, b)) return false;
  if (!left.brand || left.brand !== right.brand) return false;
  return left.names.some(name => right.names.includes(name));
}

export function distinctSku(a = {}, b = {}) {
  const left = normalizedSku(a); const right = normalizedSku(b);
  return Boolean(left && right && left !== right);
}

export function differentSetEntities(a = {}, b = {}) {
  const roleA = a.set?.kind || 'none'; const roleB = b.set?.kind || 'none';
  if ((roleA === 'parent' && roleB === 'child') || (roleA === 'child' && roleB === 'parent')) return true;
  return isDirectSetRelation(a, b) || isDirectSetRelation(b, a);
}

// Identity and substitution deliberately have no shared classification.  This
// function is the single set-aware identity vocabulary used by reconciliation,
// duplicate review, and the admin maintenance centre.
export function classifySetRelationship(a = {}, b = {}) {
  if (isDirectSetRelation(a, b) || isDirectSetRelation(b, a)) return 'parent_child_relation';
  if (a.set?.kind === 'child' && b.set?.kind === 'child' && sharesParentIdentity(a, b)) return 'sibling_child';
  return 'unrelated';
}

export function parentIdentityTokens(toy = {}) {
  const set = toy.set || {};
  return unique([
    set.parentCanonicalKey,
    ...(set.legacyParentIds || []),
    toy.parentCanonicalKey,
    toy.parentKitKey,
    toy.parentSetId,
    toy.parentId
  ].map(canonicalKey));
}

function isDirectSetRelation(child, parent) {
  if (child.set?.kind !== 'child' || parent.set?.kind !== 'parent') return false;
  if (child.set.parentId && child.set.parentId === parent.id) return true;
  if ((child.set.legacyParentIds || []).includes(parent.id)) return true;
  const parentKeys = unique([parent.canonicalKey, ...(parent.legacyCanonicalKeys || [])].map(canonicalKey));
  const childKey = canonicalKey(child.canonicalKey);
  return parentKeys.some(parentKey => parentIdentityTokens(child).includes(parentKey) || (parentKey && childKey && childKey.startsWith(`${parentKey}-`)));
}

function sharesParentIdentity(a, b) {
  const left = parentIdentityTokens(a); const right = parentIdentityTokens(b);
  if (left.some(token => right.includes(token))) return true;
  if (a.set?.parentId && b.set?.parentId && a.set.parentId === b.set.parentId) return true;
  // A parent display name is only a legacy fallback after the brand has also
  // matched.  It is never used to connect arbitrary same-brand toys.
  const sameBrand = normalizeBrand(a.brand) && normalizeBrand(a.brand) === normalizeBrand(b.brand);
  return sameBrand && normalizeName(a.set?.setName) && normalizeName(a.set?.setName) === normalizeName(b.set?.setName);
}

export function findOwnedToy(source, toys = []) {
  return toys.find(toy => sameCatalogIdentity(source, toy)) || null;
}

export function findWishlistItem(source, wishlist = []) {
  return wishlist.find(item => sameCatalogIdentity(source, item.catalogSnapshot || item)) || null;
}

export function resolveCatalogReference(reference, catalog = []) {
  const direct = catalog.find(toy => identityTokens(reference).keys.some(key => identityTokens(toy).keys.includes(key)));
  return direct || catalog.find(toy => sameCatalogIdentity(reference, toy)) || null;
}

export function reconcilePersonalDuplicates(state) {
  const toys = state.toys || []; const removedToPrimary = new Map(); const kept = [];
  for (const toy of toys) {
    const primary = kept.find(candidate => sameCatalogIdentity(candidate, toy));
    if (!primary) { kept.push(toy); continue; }
    mergeToy(primary, toy); removedToPrimary.set(toy.id, primary.id);
  }
  if (!removedToPrimary.size) return { merged:0, idMap:removedToPrimary };
  state.toys = kept;
  remapReferences(state, removedToPrimary);
  return { merged:removedToPrimary.size, idMap:removedToPrimary };
}

export function mergePersonalToyPair(state, primaryId, duplicateId) {
  const primary = (state.toys || []).find(toy => toy.id === primaryId);
  const duplicate = (state.toys || []).find(toy => toy.id === duplicateId);
  if (!primary || !duplicate || primary === duplicate || !sameCatalogIdentity(primary, duplicate)) return { merged:false };
  mergeToy(primary, duplicate);
  state.toys = state.toys.filter(toy => toy.id !== duplicate.id);
  remapReferences(state, new Map([[duplicate.id, primary.id]]));
  return { merged:true, toy:primary };
}

function remapReferences(state, idMap) {
  for (const round of state.rotationHistory || []) {
    round.toyIds = unique((round.toyIds || []).map(id => idMap.get(id) || id));
    if (round.toyId) round.toyId = idMap.get(round.toyId) || round.toyId;
  }
  for (const toy of state.toys || []) {
    if (toy.set?.parentId) toy.set.parentId = idMap.get(toy.set.parentId) || toy.set.parentId;
    if (toy.set?.childIds) toy.set.childIds = unique(toy.set.childIds.map(id => idMap.get(id) || id));
  }
}

function mergeToy(primary, duplicate) {
  const preferred = imageRank(duplicate.imageRef) > imageRank(primary.imageRef) ? duplicate.imageRef : primary.imageRef;
  const alternatives = uniqueRefs([...(primary.alternateImageRefs || []), ...(duplicate.alternateImageRefs || []), primary.imageRef, duplicate.imageRef].filter(ref => ref && ref !== preferred));
  Object.assign(primary, {
    productName:primary.productName || duplicate.productName,
    names:{ en:primary.names?.en || duplicate.names?.en || '', zh:primary.names?.zh || duplicate.names?.zh || '' },
    aliases:unique([...(primary.aliases || []), ...(duplicate.aliases || []), duplicate.productName]),
    skillCodes:unique([...(primary.skillCodes || []), ...(duplicate.skillCodes || [])]),
    playMechanics:unique([...(primary.playMechanics || []), ...(duplicate.playMechanics || [])]),
    imageRef:preferred, alternateImageRefs:alternatives,
    interest:primary.interest ?? duplicate.interest ?? null,
    rotationValue:primary.rotationValue !== 'medium' ? primary.rotationValue : (duplicate.rotationValue || 'medium'),
    shelfMode:primary.permanentSource === 'user' || duplicate.permanentSource === 'user' || primary.shelfMode === 'permanent' || duplicate.shelfMode === 'permanent' ? 'permanent' : 'rotate',
    permanentSource:primary.permanentSource === 'user' || duplicate.permanentSource === 'user' ? 'user' : (primary.permanentSource || duplicate.permanentSource || null),
    permanentSetAt:primary.permanentSource === 'user' ? primary.permanentSetAt : duplicate.permanentSource === 'user' ? duplicate.permanentSetAt : null,
    status:primary.status === 'active' || duplicate.status === 'active' ? 'active' : 'stored',
    hidden:Boolean(primary.hidden && duplicate.hidden), archived:Boolean(primary.archived && duplicate.archived),
    purchaseDate:primary.purchaseDate || duplicate.purchaseDate || '',
    purchaseMetadata:{ ...(duplicate.purchaseMetadata || {}), ...(primary.purchaseMetadata || {}) },
    storageLocation:primary.storageLocation || duplicate.storageLocation || '',
    notes:[primary.notes, duplicate.notes].filter(Boolean).join('\n'),
    feedbackHistory:uniqueObjects([...(primary.feedbackHistory || []), ...(duplicate.feedbackHistory || [])]),
    usageHistory:uniqueObjects([...(primary.usageHistory || []), ...(duplicate.usageHistory || [])]),
    userMetadata:{ ...(duplicate.userMetadata || {}), ...(primary.userMetadata || {}) },
    lastActivatedAt:latest(primary.lastActivatedAt, duplicate.lastActivatedAt),
    createdAt:earliest(primary.createdAt, duplicate.createdAt), updatedAt:new Date().toISOString()
  });
  primary.mergeDiagnostics = unique([...(primary.mergeDiagnostics || []), ...(duplicate.mergeDiagnostics || [])]);
}
function uniqueRefs(refs) { const seen=new Set(); return refs.filter(ref=>{const key=JSON.stringify(ref);if(seen.has(key))return false;seen.add(key);return true;}); }
function uniqueObjects(values) { const seen=new Set(); return values.filter(value=>{const key=JSON.stringify(value);if(seen.has(key))return false;seen.add(key);return true;}); }
function imageRank(ref) { return { personal:4, catalog:3, remote:2, placeholder:1 }[ref?.kind] || 0; }
function normalizeName(value) { return String(value || '').normalize('NFKC').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, ''); }
function normalizeBrand(value) { return String(value === 'other_unspecified' ? '' : value || '').normalize('NFKC').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, ''); }
function normalizedSku(toy) { return String(toy?.sku || toy?.productCode || toy?.modelNumber || toy?.variantCode || '').normalize('NFKC').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, ''); }
function latest(a,b){return !a?b:!b?a:new Date(a)>new Date(b)?a:b;}
function earliest(a,b){return !a?b:!b?a:new Date(a)<new Date(b)?a:b;}
