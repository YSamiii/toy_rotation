import { canonicalKey, normalizeToy } from '../data/schema.js';
import { mergePersonalToyPair, parentIdentityTokens } from './identity-service.js';
import { auditIdentityRelationships, findDuplicates } from './duplicate-engine.js';

export function validateSetGraph(toys) {
  const byId = new Map(toys.map(toy => [toy.id,toy]));
  return toys.filter(toy => toy.set?.kind === 'child').every(child => byId.has(child.set.parentId) && byId.get(child.set.parentId).set.kind === 'parent');
}
export function splitExplicitSet(parent, children) {
  if (parent.set?.kind !== 'parent' || parent.set.rotationMode !== 'split') return { parent, children: [] };
  const created = children.map((child, index) => normalizeToy({ ...child, id: crypto.randomUUID(), canonicalKey: child.canonicalKey || `${parent.canonicalKey}:part-${index+1}`, brand: child.brand || parent.brand, minAgeMonths: child.minAgeMonths ?? parent.minAgeMonths, maxAgeMonths: child.maxAgeMonths ?? parent.maxAgeMonths, imageRef:child.imageRef || childImageRef(parent, child, index), set: { kind:'child', parentId:parent.id, parentCanonicalKey:parent.canonicalKey, setName:parent.productName, partIndex:index + 1, childIds:[], rotationMode:'split', ownershipSource:'generated_from_set', generatedFromParentId:parent.id, ownershipGroupId:parent.id, detachedFromSet:false } }));
  parent.set.childIds = created.map(child => child.id); return { parent, children: created };
}

// Split only where the catalog/AI explicitly marks a split set.  A generic set is
// never guessed into child toys; that would create false inventory records.
export function deriveExplicitChildren(parent, definition = {}) {
  if (parent.set?.kind !== 'parent' || parent.set.rotationMode !== 'split') return [];
  const supplied = Array.isArray(definition.children) ? definition.children : [];
  if (supplied.length) return supplied.map((child, index) => ({ ...child, imageRef:child.imageRef?.kind && child.imageRef.kind !== 'placeholder' ? child.imageRef : childImageRef(parent, child, index) }));
  const known = knownMultiPuzzleChildren(parent, definition);
  if (known.length) return known;
  const count = parseExplicitChildCount(definition, parent);
  if (!count) return [];
  const baseName = parent.productName || definition.name || 'Puzzle set';
  return Array.from({ length: count }, (_, index) => ({
    canonicalKey: `${parent.canonicalKey}:part-${index + 1}`,
    productName: `${baseName} · ${index + 1}`,
    names: parent.names,
    brand: parent.brand,
    categoryCode: parent.categoryCode,
    skillCodes: parent.skillCodes,
    playMechanics: parent.playMechanics,
    minAgeMonths: parent.minAgeMonths,
    maxAgeMonths: parent.maxAgeMonths,
    imageRef: childImageRef(parent, { productName:`${baseName} ${index + 1}` }, index),
  }));
}

function knownMultiPuzzleChildren(parent, definition) {
  const text = [parent.brand, parent.productName, parent.names?.en, parent.names?.zh, definition.productName, definition.name, definition.nameZh].filter(Boolean).join(' ');
  if (!/mideer/i.test(text) || !/puzzle|拼图/i.test(text)) return [];
  if (/busy\s*vehicles|忙碌车辆|车辆拼图|交通工具拼图/i.test(text)) {
    return [['汽车拼图','Car puzzle'],['警车拼图','Police car puzzle'],['冰淇淋车拼图','Ice cream truck puzzle'],['垃圾车拼图','Garbage truck puzzle'],['运输车拼图','Dump truck puzzle'],['校车拼图','School bus puzzle']].map((names,index)=>childDefinition(parent,names,index));
  }
  if (/my\s*first\s*puzzle|第一套拼图/i.test(text)) {
    const dinosaur = /dinosaur|恐龙/i.test(text);
    return Array.from({length:6},(_,index)=>childDefinition(parent,[`${dinosaur?'恐龙拼图':'小拼图'} ${index+1}`,`${dinosaur?'Dinosaur puzzle':'Small puzzle'} ${index+1}`],index));
  }
  return [];
}

function childDefinition(parent, [nameZh, nameEn], index) {
  const child = { canonicalKey:`${parent.canonicalKey}:puzzle-${index+1}`, productName:nameEn, names:{en:nameEn,zh:nameZh}, brand:parent.brand, categoryCode:'puzzles_matching', skillCodes:['fine_motor','hand_eye','matching','visual_spatial'], playMechanics:['jigsaw'], minAgeMonths:parent.minAgeMonths, maxAgeMonths:parent.maxAgeMonths };
  return { ...child, imageRef:childImageRef(parent, child, index) };
}

function childImageRef(parent, child, index) {
  // A split child must never depend on a runtime search URL.  Until a verified
  // child asset is curated, render an explicit child placeholder; the catalog
  // image audit then reports it as incomplete rather than pretending it is a
  // usable shared image.
  return { kind:'generated', label:child.productName || child.names?.en || `${parent.productName} ${index + 1}`, brand:child.brand || parent.brand, source:'missing-child-catalog-metadata', assetState:'placeholder', verificationStatus:'missing_metadata' };
}

export function parseExplicitChildCount(definition = {}, parent = {}) {
  const explicit = Number(definition.childCount || definition.puzzleCount);
  if (Number.isInteger(explicit) && explicit > 1 && explicit <= 24) return explicit;
  const value = [definition.productName, definition.name, definition.nameZh, parent.productName, parent.names?.zh]
    .filter(Boolean).join(' ');
  const match = value.match(/(?:\b|\s)(\d{1,2})\s*(?:[- ]?in[- ]?1|合\s*1|款)/i);
  const count = Number(match?.[1]);
  return Number.isInteger(count) && count > 1 && count <= 24 ? count : 0;
}

export function ensureSplitSetChildren(toys, definitionsByKey) {
  toys ||= [];
  const existingByKey = new Map(toys.map(toy => [canonicalKey(toy.canonicalKey), toy]));
  const additions = [];
  for (const parent of toys.filter(toy => toy.set?.kind === 'parent' && toy.set.rotationMode === 'split')) {
    const definition = definitionsByKey.get(parent.canonicalKey) || parent;
    const supplied = deriveExplicitChildren(parent, definition);
    const { children: planned } = splitExplicitSet(parent, supplied);
    const childIds = [];
    const intentionallyRemoved = new Set((parent.set?.intentionalRemovedChildKeys || []).map(canonicalKey));
    for (const child of planned) {
      const key = canonicalKey(child.canonicalKey);
      if (intentionallyRemoved.has(key)) continue;
      const existing = existingByKey.get(key) || chooseBestChild(findHistoricalChildMatches(toys, parent, child), parent, child);
      if (existing) { childIds.push(existing.id); continue; }
      additions.push(child); existingByKey.set(key, child); childIds.push(child.id);
    }
    parent.set.childIds = childIds;
  }
  return additions;
}

// Repairs a *previously split* ownership set that an older migration removed.
// This is intentionally separate from duplicate reconciliation: it never
// classifies identities and never merges rows. A repair is permitted only when
// a stable catalog split plan and retained historical evidence both exist.
export function restoreMissingSplitSetChildren(state, definitionsByKey, legacyToys = []) {
  state.toys ||= [];
  const existing = state.toys;
  const legacy = (legacyToys || []).map(normalizeToy);
  const restored = [];
  const repairs = [];
  for (const parent of existing.filter(toy => toy.set?.kind === 'parent')) {
    const definition = definitionsByKey.get(canonicalKey(parent.canonicalKey));
    const planned = restorationPlan(parent, definition);
    if (planned.length < 2) continue;
    const currentChildren = existing.filter(toy => isChildOfParent(toy, parent));
    const missing = planned.filter(child => !currentChildren.some(row => canonicalKey(row.canonicalKey) === canonicalKey(child.canonicalKey)));
    if (!missing.length) continue;
    const intentional = new Set((parent.set?.intentionalRemovedChildKeys || []).map(canonicalKey));
    const eligible = missing.filter(child => !intentional.has(canonicalKey(child.canonicalKey)));
    if (!eligible.length) continue;
    const ghostChildIds = (parent.set?.childIds || []).filter(id => !existing.some(toy => toy.id === id));
    const legacyMatches = eligible.flatMap(child => legacy.filter(row => reliableLegacyChildFor(row, parent, child)));
    // A catalog saying that a kit has parts is not proof that this user owned
    // every part. The stale child IDs or legacy ownership rows are the proof
    // that a migration, rather than a user action, removed them.
    if (!ghostChildIds.length && !legacyMatches.length) continue;
    const childIds = [...currentChildren.map(child => child.id)];
    for (const child of eligible) {
      const historical = chooseBestChild(legacy.filter(row => reliableLegacyChildFor(row, parent, child)), parent, child);
      const restoredChild = historical ? restoreHistoricalChild(historical, parent, child) : createRestoredChild(parent, child);
      if (existing.some(row => row.id === restoredChild.id)) restoredChild.id = crypto.randomUUID();
      existing.push(restoredChild); restored.push(restoredChild); childIds.push(restoredChild.id);
    }
    parent.set.rotationMode = 'split';
    parent.set.childIds = [...new Set(childIds)];
    repairs.push({ parentId:parent.id, parentCanonicalKey:parent.canonicalKey, expected:planned.length, existing:currentChildren.length, restored:eligible.length, proof:legacyMatches.length ? 'legacy_ownership' : 'stale_child_ids' });
  }
  return { restored:restored.length, parents:repairs.length, repairs };
}

const STRUCTURE_MIGRATION_DAMAGE_WINDOW = Object.freeze({
  start:Date.parse('2026-08-22T00:00:00.000Z'),
  end:Date.parse('2026-08-25T00:00:00.000Z')
});

// This classifier is deliberately separate from identity reconciliation. It
// answers whether an owned set's *structure* may have been damaged by the
// known Clean Baseline migration window; it never decides that two products
// are the same and never mutates user data.
export function classifyStructureMigrationDamage(state, definitionsByKey) {
  const toys = state.toys || [];
  const candidates = [];
  for (const parent of toys.filter(toy => toy.set?.kind === 'parent' || toy.set?.kind === 'whole')) {
    const definition = definitionsByKey.get(canonicalKey(parent.canonicalKey));
    const planned = stableRestorationPlan(parent, definition);
    const currentChildren = toys.filter(toy => isChildOfParent(toy, parent));
    const reasons = [];
    if (!definition || planned.length < 2) reasons.push('catalog_structure_not_stable');
    if (!catalogDefinesSplitParent(definition)) reasons.push('catalog_not_split_parent');
    if (!isStructureConflict(parent, currentChildren)) reasons.push('no_structure_conflict');
    if ((parent.set?.intentionalRemovedChildKeys || []).length) reasons.push('intentional_child_deletion');
    if (hasReliableWholeChoice(parent)) reasons.push('explicit_keep_whole_choice');
    if (!withinKnownMigrationWindow(state, parent)) reasons.push('outside_known_migration_window');
    const qualifies = reasons.length === 0;
    if (qualifies || isStructureConflict(parent, currentChildren)) candidates.push({
      kind:qualifies ? 'probable_structure_migration_damage' : 'not_structure_migration_damage',
      parentId:parent.id,
      parentCanonicalKey:canonicalKey(parent.canonicalKey),
      expectedChildCount:planned.length,
      currentChildCount:currentChildren.length,
      status:qualifies ? 'needs_confirmation' : 'ineligible',
      reasons
    });
  }
  return candidates;
}

// A caller (later the data-repair UI) must explicitly confirm an ambiguous
// candidate. This keeps legitimate whole-set ownership intact while providing
// one authoritative, idempotent repair for confirmed migration damage.
export function repairStructureMigrationDamage(state, definitionsByKey, { confirmedParentIds = [], confirmedParentKeys = [] } = {}) {
  state.toys ||= [];
  const confirmedIds = new Set(confirmedParentIds.map(String));
  const confirmedKeys = new Set(confirmedParentKeys.map(canonicalKey));
  const classifications = classifyStructureMigrationDamage(state, definitionsByKey);
  const repaired = [];
  const needsConfirmation = [];
  for (const candidate of classifications.filter(item => item.kind === 'probable_structure_migration_damage')) {
    const confirmed = confirmedIds.has(String(candidate.parentId)) || confirmedKeys.has(candidate.parentCanonicalKey);
    if (!confirmed) { needsConfirmation.push(candidate); continue; }
    const parent = state.toys.find(toy => toy.id === candidate.parentId);
    const definition = definitionsByKey.get(candidate.parentCanonicalKey);
    const planned = stableRestorationPlan(parent, definition);
    if (!parent || planned.length !== candidate.expectedChildCount) continue;
    const created = planned.map(plan => createStructureRepairChild(parent, plan));
    state.toys.push(...created);
    parent.set = {
      ...(parent.set || {}), kind:'parent', rotationMode:'split',
      childIds:created.map(child => child.id), intentionalRemovedChildKeys:[]
    };
    repaired.push({
      kind:'probable_structure_migration_damage', parentId:parent.id,
      parentCanonicalKey:candidate.parentCanonicalKey,
      previousChildCount:0, restoredChildCount:created.length,
      childCanonicalKeys:created.map(child => child.canonicalKey)
    });
  }
  return { repairedParents:repaired.length, restoredChildren:repaired.reduce((sum,item)=>sum+item.restoredChildCount,0), repaired, needsConfirmation };
}

function stableRestorationPlan(parent, definition) {
  if (!parent || !catalogDefinesSplitParent(definition)) return [];
  const planned = restorationPlan(parent, definition);
  if (planned.length < 2) return [];
  const keys = planned.map(child => canonicalKey(child.canonicalKey));
  if (keys.some(key => !key) || new Set(keys).size !== keys.length) return [];
  return planned;
}

function catalogDefinesSplitParent(definition) {
  return Boolean(definition && definition.set?.kind === 'parent' && definition.set?.rotationMode === 'split');
}

function isStructureConflict(parent, currentChildren) {
  return currentChildren.length === 0 && (parent.set?.kind === 'whole' || parent.set?.rotationMode === 'whole') && !(parent.set?.childIds || []).length;
}

function hasReliableWholeChoice(parent) {
  const metadata = parent.userMetadata || {};
  const choice = metadata.setStructureChoice || metadata.setManagementMode || metadata.structurePreference;
  const source = metadata.setStructureChoiceSource || metadata.structurePreferenceSource;
  return metadata.keepWholeSet === true || (choice === 'whole' && ['user','manual','explicit'].includes(source));
}

function withinKnownMigrationWindow(state, parent) {
  const values = [parent.updatedAt, parent.userMetadata?.structureChangedAt];
  const metadata = state.catalogState?.syncMetadata || {};
  for (const [key, marker] of Object.entries(metadata)) {
    if (!/^parentChild(ReconciliationV(?:8|9|10|11|12)|DataRepair)$/.test(key) || !marker || typeof marker !== 'object') continue;
    values.push(marker.startedAt, marker.reconciledAt, marker.repairedAt, marker.migratedAt);
  }
  return values.some(value => {
    const time = Date.parse(value || '');
    return Number.isFinite(time) && time >= STRUCTURE_MIGRATION_DAMAGE_WINDOW.start && time < STRUCTURE_MIGRATION_DAMAGE_WINDOW.end;
  });
}

function createStructureRepairChild(parent, plan) {
  // Catalog structure fields are safe to restore. Personal ownership fields
  // intentionally come from an empty record and are never copied from parent.
  return normalizeToy({
    id:crypto.randomUUID(), canonicalKey:plan.canonicalKey, brand:plan.brand,
    productName:plan.productName, names:plan.names, aliases:plan.aliases,
    categoryCode:plan.categoryCode, skillCodes:plan.skillCodes,
    playMechanics:plan.playMechanics, operationCode:plan.operationCode,
    goalCodes:plan.goalCodes, sceneCodes:plan.sceneCodes,
    imageRef:plan.imageRef, minAgeMonths:plan.minAgeMonths,
    maxAgeMonths:plan.maxAgeMonths, status:'stored',
    set:{ kind:'child', parentId:parent.id, parentCanonicalKey:parent.canonicalKey,
      setName:parent.productName, partIndex:plan.set?.partIndex || partIndexFromKey(plan.canonicalKey),
      childIds:[], rotationMode:'split', ownershipSource:'generated_from_set', generatedFromParentId:parent.id, ownershipGroupId:parent.id, detachedFromSet:false },
    mergeDiagnostics:['data-repair: probable_structure_migration_damage']
  });
}

function restorationPlan(parent, definition) {
  if (!definition) return [];
  const probe = { ...parent, set:{ ...parent.set, kind:'parent', rotationMode:'split' } };
  const supplied = deriveExplicitChildren(probe, definition);
  return supplied.map((child,index) => normalizeToy({ ...child, id:`repair-plan-${index + 1}`, canonicalKey:child.canonicalKey || `${parent.canonicalKey}:part-${index + 1}`, brand:child.brand || parent.brand, set:{ kind:'child', parentId:parent.id, parentCanonicalKey:parent.canonicalKey, setName:parent.productName, partIndex:index + 1, childIds:[], rotationMode:'split' } }));
}

function isChildOfParent(toy, parent) {
  if (toy.set?.kind !== 'child') return false;
  return toy.set.parentId === parent.id || canonicalKey(toy.set.parentCanonicalKey) === canonicalKey(parent.canonicalKey) || (toy.set.legacyParentIds || []).includes(parent.id);
}

function reliableLegacyChildFor(row, parent, child) {
  if (row.set?.kind !== 'child') return false;
  if (!isChildOfParent(row, parent) && canonicalKey(row.set?.setName) !== canonicalKey(parent.productName)) return false;
  if (String(row.brand || '') !== String(parent.brand || '')) return false;
  const expectedKey = canonicalKey(child.canonicalKey);
  const rowKeys = uniqueCanonicalKeys([row.canonicalKey, ...(row.legacyCanonicalKeys || [])]);
  if (rowKeys.includes(expectedKey)) return true;
  const expectedPart = Number(child.set?.partIndex || partIndexFromKey(child.canonicalKey));
  const rowPart = Number(row.set?.partIndex || partIndexFromKey(row.canonicalKey));
  if (expectedPart && rowPart) return expectedPart === rowPart;
  return childNameTokens(row).some(name => childNameTokens(child).includes(name));
}

function createRestoredChild(parent, plan) {
  return normalizeToy({ ...plan, id:crypto.randomUUID(), imageRef:plan.imageRef, status:'stored', set:{ kind:'child', parentId:parent.id, parentCanonicalKey:parent.canonicalKey, setName:parent.productName, partIndex:plan.set?.partIndex || partIndexFromKey(plan.canonicalKey), childIds:[], rotationMode:'split', ownershipSource:'generated_from_set', generatedFromParentId:parent.id, ownershipGroupId:parent.id, detachedFromSet:false }, mergeDiagnostics:['data-repair: restored_missing_split_child'] });
}

function restoreHistoricalChild(historical, parent, plan) {
  const parentCover = sameImageRef(historical.imageRef, parent.imageRef);
  return normalizeToy({ ...historical, canonicalKey:plan.canonicalKey, legacyCanonicalKeys:[...(historical.legacyCanonicalKeys || []), historical.canonicalKey, plan.canonicalKey], productName:historical.productName || plan.productName, names:{ ...plan.names, ...historical.names }, imageRef:parentCover ? plan.imageRef : historical.imageRef, set:{ kind:'child', parentId:parent.id, parentCanonicalKey:parent.canonicalKey, legacyParentIds:[...(historical.set?.legacyParentIds || []), historical.set?.parentId].filter(Boolean), setName:parent.productName, partIndex:plan.set?.partIndex || partIndexFromKey(plan.canonicalKey), childIds:[], rotationMode:'split', ownershipSource:'generated_from_set', generatedFromParentId:parent.id, ownershipGroupId:parent.id, detachedFromSet:false }, mergeDiagnostics:[...(historical.mergeDiagnostics || []), 'data-repair: restored_missing_split_child'] });
}

// The set graph has one authoritative parent and one record per child
// canonical key.  This repairs historical duplicate child rows without ever
// treating a parent kit itself as a child duplicate.
export function reconcileSplitSetChildren(state, definitionsByKey) {
  state.toys ||= [];
  const additions = ensureSplitSetChildren(state.toys, definitionsByKey);
  if (additions.length) state.toys.push(...additions);
  let merged = 0; let remapped = 0;
  for (const parent of state.toys.filter(toy => toy.set?.kind === 'parent' && toy.set.rotationMode === 'split')) {
    const definition = definitionsByKey.get(parent.canonicalKey) || parent;
    const planned = splitExplicitSet(parent, deriveExplicitChildren(parent, definition)).children;
    const childIds = [];
    for (const child of planned) {
      const matches = findHistoricalChildMatches(state.toys, parent, child);
      if (!matches.length) continue;
      const primary = chooseBestChild(matches, parent, child);
      const primaryOldKey = primary.canonicalKey;
      if (canonicalKey(primaryOldKey) !== canonicalKey(child.canonicalKey)) remapped++;
      primary.canonicalKey = canonicalKey(child.canonicalKey);
      primary.legacyCanonicalKeys = uniqueCanonicalKeys([...(primary.legacyCanonicalKeys || []), primaryOldKey, child.canonicalKey]);
      primary.set = childSetLink(primary.set, parent, child);
      primary.imageRef = prefersChildImage(primary, child, parent) ? primary.imageRef : child.imageRef;
      for (const duplicate of matches) {
        if (duplicate.id === primary.id) continue;
        // A stale copied kit cover is not a child photo.  Do not let the generic
        // personal-image preference put that parent image back onto the child.
        if (sameImageRef(duplicate.imageRef, parent.imageRef)) duplicate.imageRef = { kind:'placeholder' };
        if (canonicalKey(duplicate.canonicalKey) !== canonicalKey(child.canonicalKey)) remapped++;
        duplicate.legacyCanonicalKeys = uniqueCanonicalKeys([...(duplicate.legacyCanonicalKeys || []), duplicate.canonicalKey, child.canonicalKey]);
        duplicate.canonicalKey = canonicalKey(child.canonicalKey);
        duplicate.set = childSetLink(duplicate.set, parent, child);
        selectOwnedChildImage(primary, duplicate, parent, child);
        primary.legacyCanonicalKeys = uniqueCanonicalKeys([...(primary.legacyCanonicalKeys || []), duplicate.canonicalKey, ...(duplicate.legacyCanonicalKeys || [])]);
        const mergedResult = mergePersonalToyPair(state, primary.id, duplicate.id);
        if (mergedResult.merged) {
          primary.mergeDiagnostics = [...new Set([...(primary.mergeDiagnostics || []), `R8: same_child_legacy_duplicate:${duplicate.id}`])];
          merged++;
        }
      }
      childIds.push(primary.id);
    }
    parent.set.childIds = [...new Set(childIds)];
  }
  // Definitions repair known split kits. A second pass covers genuine legacy
  // ownership rows even where a previous app used an old parent UUID or did
  // not preserve the catalog child key. It requires the same resolved parent
  // AND same child identity; it never folds a parent, sibling, or variant.
  const legacy = reconcileLegacyChildOwnership(state);
  merged += legacy.merged;
  const audit = auditSetIntegrity(state.toys);
  const residualDuplicateChildren = findDuplicates(state.toys)
    .filter(item => item.kind === 'same_child_legacy_duplicate').length;
  return {
    added:additions.length, merged, remapped,
    parents:audit.parents, children:audit.children,
    legacyDuplicateChildren:legacy.detected,
    queuedDuplicateChildren:legacy.queued,
    attemptedDuplicateChildren:legacy.attempted,
    failedDuplicateChildren:legacy.failed,
    residualDuplicateChildren,
    mergeExecutions:legacy.executions,
    siblingExcluded:legacy.siblingExcluded,
    variantExcluded:legacy.variantExcluded,
    unresolved:audit.unresolved,
    issues:audit.issues
  };
}

// Catalog structure must never itself create ownership.  This repair only
// removes legacy records where the stored evidence proves they were generated
// from a now-deleted split parent.  In particular, the old detachedFromSet
// flag alone is *not* considered independent ownership: an earlier delete
// path wrote it for every generated child it failed to cascade.
export function reconcileOrphanedSplitOwnership(state, definitionsByKey) {
  state.toys ||= [];
  const plans = splitChildPlanIndex(definitionsByKey);
  const activeParentIds = new Set(state.toys.filter(toy => toy.set?.kind === 'parent').map(toy => toy.id));
  const activeParentKeys = new Set(state.toys.filter(toy => toy.set?.kind === 'parent').map(toy => canonicalKey(toy.canonicalKey)));
  const removed = []; const classifications = []; let backfilled = 0; let independent = 0; let detached = 0; let unknown = 0;
  for (const toy of state.toys) {
    const plan = planForToy(toy, plans);
    if (!plan) continue;
    const set = toy.set || {};
    const linkedParentStillActive = activeParentIds.has(set.parentId) || activeParentIds.has(set.generatedFromParentId) || activeParentKeys.has(canonicalKey(set.parentCanonicalKey));
    if (linkedParentStillActive) continue;
    const classification = classifyOrphanedSplitChild(toy, plan);
    classifications.push({ id:toy.id, canonicalKey:toy.canonicalKey, parentCanonicalKey:plan.parentCanonicalKey, classification:classification.kind, reason:classification.reason });
    if (classification.kind === 'independent_ownership') { independent++; continue; }
    if (classification.kind === 'explicitly_detached') { detached++; continue; }
    if (classification.kind === 'unknown_legacy_provenance') { unknown++; continue; }
    // Persist the inferred provenance in the historical archive before the
    // active ownership is removed.  This is both audit evidence and the
    // idempotent tombstone preventing any future catalog hydration from
    // treating the row as independently owned.
    toy.set = { ...set, ownershipSource:'generated_from_set', generatedFromParentId:set.generatedFromParentId || set.parentId || (set.legacyParentIds || [])[0] || null, ownershipGroupId:set.ownershipGroupId || set.parentId || (set.legacyParentIds || [])[0] || null, parentCanonicalKey:plan.parentCanonicalKey, detachedFromSet:false };
    backfilled++; removed.push(toy);
  }
  if (removed.length) {
    archiveRemovedOwnerships(state, removed, 'orphaned_generated_child_repair');
    const removedIds = new Set(removed.map(toy => toy.id));
    state.toys = state.toys.filter(toy => !removedIds.has(toy.id));
    preserveDeletedReferences(state, removedIds);
  }
  return { scanned:classifications.length, removed:removed.length, backfilled, independent, detached, unknown, classifications };
}

function splitChildPlanIndex(definitionsByKey) {
  const index = new Map();
  for (const raw of definitionsByKey?.values?.() || []) {
    const isSplit = raw?.set?.rotationMode === 'split' || raw?.set?.kind === 'parent' || raw?.rotationRule === 'split';
    if (!isSplit) continue;
    const parent = normalizeToy({ ...raw, id:raw.id || `catalog:${canonicalKey(raw.canonicalKey || raw.key)}`, canonicalKey:raw.canonicalKey || raw.key, productName:raw.productName || raw.name, names:raw.names || { en:raw.name || '', zh:raw.nameZh || '' }, set:{ ...(raw.set || {}), kind:'parent', rotationMode:'split' } });
    if (!parent.canonicalKey || parent.set?.rotationMode !== 'split') continue;
    // splitExplicitSet assigns the same stable `parent:part-N` canonical
    // identity used when ownership was originally generated. Raw catalog
    // child rows intentionally need not repeat that key.
    const children = splitExplicitSet(parent, deriveExplicitChildren(parent, raw)).children;
    for (const [indexPosition, child] of children.entries()) {
      const keys = uniqueCanonicalKeys([child.canonicalKey, ...(child.legacyCanonicalKeys || [])]);
      const plan = { parentCanonicalKey:canonicalKey(parent.canonicalKey), partIndex:Number(child.set?.partIndex || partIndexFromKey(child.canonicalKey) || indexPosition + 1), keys };
      for (const key of keys) index.set(key, plan);
    }
  }
  return index;
}
function planForToy(toy, plans) {
  for (const key of uniqueCanonicalKeys([toy.canonicalKey, ...(toy.legacyCanonicalKeys || [])])) if (plans.has(key)) return plans.get(key);
  return null;
}
function hasIndependentOwnershipEvidence(toy) {
  const set = toy.set || {};
  if (set.detachedFromParentOwnershipId || set.ownershipSource === 'detached_from_set') return { kind:'explicitly_detached', reason:'explicit_preserve_transition' };
  if (['manual','catalog','ai_independent','user_added','separate_purchase'].includes(set.ownershipSource)) return { kind:'independent_ownership', reason:`explicit_source:${set.ownershipSource}` };
  if (toy.purchaseDate || Object.keys(toy.purchaseMetadata || {}).length || toy.userMetadata?.independentOwnership === true) return { kind:'independent_ownership', reason:'independent_purchase_or_user_metadata' };
  return null;
}
function classifyOrphanedSplitChild(toy, plan) {
  const independent = hasIndependentOwnershipEvidence(toy);
  if (independent) return independent;
  const set = toy.set || {};
  const expectedPart = Number(plan.partIndex || 0);
  const actualPart = Number(set.partIndex || partIndexFromKey(toy.canonicalKey) || 0);
  const catalogPlanMatch = planForToy(toy, new Map(plan.keys.map(key => [key, plan]))) === plan;
  const legacyParentEvidence = Boolean(set.parentId || set.generatedFromParentId || set.parentCanonicalKey || (set.legacyParentIds || []).length);
  if (catalogPlanMatch && legacyParentEvidence && (!expectedPart || !actualPart || expectedPart === actualPart)) return { kind:'generated_from_deleted_parent', reason:'catalog_split_identity_plus_legacy_parent_link' };
  return { kind:'unknown_legacy_provenance', reason:'catalog_split_identity_without_proven_parent_ownership' };
}
function archiveRemovedOwnerships(state, toys, reason) {
  state.catalogState ||= {}; state.catalogState.removedOwnerships ||= {};
  for (const toy of toys) if (!state.catalogState.removedOwnerships[toy.id]) state.catalogState.removedOwnerships[toy.id] = {
    removedAt:new Date().toISOString(), reason, canonicalKey:toy.canonicalKey,
    parentCanonicalKey:toy.set?.parentCanonicalKey || null, ownership:{ ...(toy.set || {}) },
    preservedUserData:{ interest:toy.interest, shelfMode:toy.shelfMode, purchaseDate:toy.purchaseDate, purchaseMetadata:toy.purchaseMetadata, notes:toy.notes, userMetadata:toy.userMetadata, imageRef:toy.imageRef }
  };
}
function preserveDeletedReferences(state, removedIds) {
  for (const round of state.rotationHistory || []) {
    const missing = (round.toyIds || []).filter(id => removedIds.has(id));
    if (missing.length) { round.toyIds = (round.toyIds || []).filter(id => !removedIds.has(id)); round.historicalMissingToyIds = [...new Set([...(round.historicalMissingToyIds || []), ...missing])]; }
    if (removedIds.has(round.toyId)) { round.historicalMissingToyIds = [...new Set([...(round.historicalMissingToyIds || []), round.toyId])]; delete round.toyId; }
  }
}

export function reconcileLegacyChildOwnership(state) {
  const all = state.toys || [];
  const parentsByLegacyIdentity = new Map();
  for (const parent of all.filter(toy => toy.set?.kind === 'parent')) {
    for (const key of [parent.id, parent.canonicalKey, ...(parent.legacyCanonicalKeys || []), ...(parent.set?.legacyParentIds || [])].map(value => String(value || '')).filter(Boolean)) parentsByLegacyIdentity.set(key, parent);
  }
  for (const toy of all) {
    if (toy.set?.kind !== 'child') continue;
    const resolvedParent = [toy.set?.parentId, ...(toy.set?.legacyParentIds || []), toy.set?.parentCanonicalKey].map(key => parentsByLegacyIdentity.get(key)).find(Boolean);
    if (resolvedParent) {
      toy.set.parentId = resolvedParent.id;
      toy.set.parentCanonicalKey = canonicalKey(resolvedParent.canonicalKey);
      toy.set.legacyParentIds = [...new Set([...(toy.set.legacyParentIds || []), resolvedParent.id])];
      toy.set.setName ||= resolvedParent.productName;
    }
  }
  // The Duplicate/Identity Engine is the only classifier.  Earlier builds
  // detected the pair here but then rebuilt a second queue from a different
  // parent-token grouping, so a detected pair could never reach merge.
  const queue = findDuplicates(all).filter(item =>
    item.kind === 'same_child_legacy_duplicate' &&
    item.a?.set?.kind === 'child' && item.b?.set?.kind === 'child'
  );
  let merged = 0, attempted = 0, failed = 0;
  const executions = [];
  for (const item of queue) {
    const left = state.toys.find(toy => toy.id === item.a.id);
    const right = state.toys.find(toy => toy.id === item.b.id);
    if (!left || !right) continue;
    attempted++;
    const parent = resolveSharedParent(left, right, state.toys, parentsByLegacyIdentity);
    const primary = chooseCurrentCanonicalChild([left, right], parent);
    const duplicate = primary.id === left.id ? right : left;
    const primaryImageBefore = primary.imageRef;
    if (parent && sameImageRef(duplicate.imageRef, parent.imageRef)) duplicate.imageRef = { kind:'placeholder' };
    if (parent) selectOwnedChildImage(primary, duplicate, parent);
    primary.legacyCanonicalKeys = uniqueCanonicalKeys([...(primary.legacyCanonicalKeys || []), duplicate.canonicalKey, ...(duplicate.legacyCanonicalKeys || [])]);
    const mergedResult = mergePersonalToyPair(state, primary.id, duplicate.id);
    if (!mergedResult.merged) {
      failed++;
      executions.push({ kind:item.kind, primaryId:primary.id, duplicateId:duplicate.id, status:'failed' });
      continue;
    }
    if (parent && isParentCover(primary.imageRef, state.toys) && !sameImageRef(primaryImageBefore, parent.imageRef)) primary.imageRef = primaryImageBefore;
    primary.mergeDiagnostics = [...new Set([...(primary.mergeDiagnostics || []), `root-trace: same_child_legacy_duplicate:${duplicate.id}`])];
    executions.push({ kind:item.kind, primaryId:primary.id, duplicateId:duplicate.id, status:'merged' });
    merged++;
  }
  const relations = auditIdentityRelationships(state.toys || []);
  return { detected:queue.length, queued:queue.length, attempted, merged, failed, executions,
    siblingExcluded:relations.filter(item => item.kind === 'sibling_child').length,
    variantExcluded:relations.filter(item => item.kind === 'related_variant').length };
}

export function auditSetIntegrity(toys = []) {
  const parents = toys.filter(toy => toy.set?.kind === 'parent');
  const children = toys.filter(toy => toy.set?.kind === 'child');
  const byId = new Map(toys.map(toy => [toy.id, toy]));
  const issues = [];
  for (const child of children) {
    const parent = byId.get(child.set?.parentId);
    if (!parent || parent.set?.kind !== 'parent') issues.push({ type:'orphan_child', child });
    else if (sameImageRef(child.imageRef, parent.imageRef)) issues.push({ type:'parent_image_on_child', child, parent });
  }
  // Identity conflicts have one home: the duplicate/identity workflow.  Do
  // not echo them as a set-structure problem, which previously made a single
  // legacy child duplicate appear twice in Admin.
  return { parents:parents.length, children:children.length, unresolved:issues.length, issues };
}

function findHistoricalChildMatches(toys, parent, child) {
  return toys.filter(toy => toy.id !== parent.id && toy.set?.kind !== 'parent' && isHistoricalChildMatch(toy, parent, child));
}
function isHistoricalChildMatch(toy, parent, child) {
  const childKeys = new Set(uniqueCanonicalKeys([child.canonicalKey, ...(child.legacyCanonicalKeys || [])]));
  const toyKeys = uniqueCanonicalKeys([toy.canonicalKey, ...(toy.legacyCanonicalKeys || [])]);
  if (toyKeys.some(key => childKeys.has(key))) return true;
  // A known part index is a hard sibling boundary.  Mideer 6-in-1 rows often
  // share parent imagery, category, and name prefixes; none of those facts can
  // turn part 1 into part 2.
  const toyPart = Number(toy.set?.partIndex || partIndexFromKey(toy.canonicalKey));
  const childPart = Number(child.set?.partIndex || partIndexFromKey(child.canonicalKey));
  if (toyPart && childPart && toyPart !== childPart) return false;
  const parentKey = canonicalKey(parent.canonicalKey);
  // Legacy builds used several parent representations.  A child can therefore
  // still belong to this kit even if its old parent UUID changed during an
  // earlier migration.  Keep this relation test deliberately narrow: parent
  // name/set name is only accepted together with a matching brand and child
  // name below, never as a generic same-brand duplicate signal.
  const parentNames = childNameTokens({ productName:parent.productName, names:parent.names, aliases:[parent.set?.setName] });
  const legacySetNames = childNameTokens({ productName:toy.set?.setName, aliases:[toy.parentName, toy.parentKitName] });
  const namedParentLink = parentNames.some(name => legacySetNames.includes(name));
  const parentLegacyIds = new Set([parent.id, ...(parent.set?.legacyParentIds || [])]);
  const parentKeys = new Set([parentKey, ...(parent.legacyCanonicalKeys || []).map(canonicalKey)]);
  const linkedParent = parentLegacyIds.has(toy.set?.parentId) || (toy.set?.legacyParentIds || []).some(id => parentLegacyIds.has(id)) || [...parentIdentityTokens(toy)].some(key => parentKeys.has(key)) || toyKeys.some(key => [...parentKeys].some(parentIdentity => key.startsWith(`${parentIdentity}-`))) || namedParentLink;
  if (!linkedParent) return false;
  if (String(toy.brand || '') !== String(child.brand || parent.brand || '')) return false;
  const toyNames = childNameTokens(toy);
  const childNames = childNameTokens(child);
  // The old partial-token test was the over-merge source: "Dinosaur puzzle"
  // matched every "Dinosaur puzzle N".  A legacy name fallback now requires
  // a complete normalized child name, never a prefix/substring.
  return toyNames.some(token => childNames.includes(token));
}
function partIndexFromKey(key) { const match = canonicalKey(key).match(/(?:part|puzzle)-(\d+)$/); return Number(match?.[1] || 0); }
function childNameTokens(toy = {}) {
  return [...new Set([toy.productName, toy.name, toy.nameEn, toy.nameZh, toy.names?.en, toy.names?.zh, ...(toy.aliases || [])]
    .flatMap(imageNameForms).map(value => canonicalKey(value)).filter(value => value && value.length >= 4))];
}
function chooseBestChild(rows, parent, child) {
  return [...rows].sort((a,b) => childRecordScore(b,parent,child)-childRecordScore(a,parent,child) || String(a.createdAt || '').localeCompare(String(b.createdAt || '')))[0] || null;
}
function chooseCurrentCanonicalChild(rows, parent) {
  // The catalog plan is not available in this final legacy-only pass. When a
  // pair itself proves the bilingual current identity, retain its explicit
  // part key as the canonical survivor; otherwise preserve the established
  // image/user-data scoring unchanged.
  const hasBilingualIdentity = rows.some(isBilingualChildIdentity);
  if (hasBilingualIdentity) {
    const explicit = rows.filter(row => {
      const part=Number(row.set?.partIndex || 0);
      return part && new RegExp(`(?:part|puzzle)-${part}$`).test(canonicalKey(row.canonicalKey));
    });
    if (explicit.length === 1) return explicit[0];
  }
  return chooseBestChild(rows, parent, null);
}
function childRecordScore(toy, parent, child) {
  const sameAsParent = parent ? sameImageRef(toy.imageRef, parent.imageRef) : false;
  const imageQuality = sameAsParent ? 0 : ({personal:40,catalog:30,remote:20,placeholder:0}[toy.imageRef?.kind] || 0);
  const formalChild = toy.set?.kind === 'child' ? 100 : 0;
  const linkedParent = parent && (toy.set?.parentId === parent.id || canonicalKey(toy.set?.parentCanonicalKey) === canonicalKey(parent.canonicalKey)) ? 30 : 0;
  const exactChildKey = child && canonicalKey(toy.canonicalKey) === canonicalKey(child.canonicalKey) ? 20 : 0;
  // When a legacy numeric key and the current explicit part key identify the
  // same child, preserve the current canonical record as survivor. Image/user
  // data from the legacy row is still merged into it below.
  const declaredPart = Number(toy.set?.partIndex || 0);
  const currentPartKey = declaredPart && isBilingualChildIdentity(child) && new RegExp(`(?:part|puzzle)-${declaredPart}$`).test(canonicalKey(toy.canonicalKey)) ? 25 : 0;
  return formalChild + linkedParent + exactChildKey + currentPartKey + imageQuality + (toy.interest ? 2 : 0) + (toy.notes ? 2 : 0);
}
function isBilingualChildIdentity(child) {
  const text = String(child?.productName || '');
  return /[A-Za-z]/.test(text) && /[\u4e00-\u9fff]/.test(text);
}
function prefersChildImage(primary, planned, parent) {
  const sameAsParent = sameImageRef(primary.imageRef, parent.imageRef);
  if (sameAsParent) return false;
  return childImagePriority(primary.imageRef) >= childImagePriority(planned.imageRef);
}
function childImagePriority(ref) {
  if (!ref || ref.kind === 'placeholder' || ref.kind === 'generated') return 0;
  if (ref.kind === 'personal') return 4;
  if (ref.kind === 'catalog' || ref.verificationStatus === 'verified_real' || ref.verificationStatus === 'verified') return 3;
  if (ref.kind === 'remote') return 2;
  return 0;
}

// Legacy image mapping is presentation-only and must not promote a kit cover
// to a child.  A legacy remote ref is accepted only if its provenance names
// this child (or an already-attested canonical identity); a parent/set query
// is rejected even when it happens to include the same part number.
function selectOwnedChildImage(primary, duplicate, parent, plan = null) {
  const candidates = [primary, duplicate];
  const identity = childImageIdentity(candidates, plan);
  const owned = candidates
    .map(row => ({ row, ref:row.imageRef, owned:isOwnedChildImageRef(row.imageRef, identity, parent) }))
    .filter(item => item.owned)
    .sort((a,b) => childImagePriority(b.ref) - childImagePriority(a.ref));
  if (owned.length) {
    const selected = owned[0];
    primary.imageRef = stampChildImageOwner(selected.ref, primary.canonicalKey);
    if (selected.row.id === duplicate.id) duplicate.imageRef = { kind:'placeholder' };
  } else if (looksLikeParentSetImage(primary.imageRef, parent) || looksLikeParentSetImage(duplicate.imageRef, parent)) {
    // Clear both rows before generic ownership merge chooses an otherwise
    // higher-ranked remote ref. Neither ref has child provenance.
    if (looksLikeParentSetImage(primary.imageRef, parent)) primary.imageRef = { kind:'placeholder' };
    if (looksLikeParentSetImage(duplicate.imageRef, parent)) duplicate.imageRef = { kind:'placeholder' };
    primary.imageRef = plan?.imageRef || { kind:'placeholder' };
  }
}
function childImageIdentity(rows, plan) {
  return [...new Set([...rows, plan].filter(Boolean).flatMap(row => [row.productName, row.names?.en, row.names?.zh, ...(row.aliases || [])])
    .flatMap(imageNameForms).map(canonicalKey).filter(value => value && value.length >= 4))];
}
function imageNameForms(value) {
  const text = String(value || '').normalize('NFKC').trim(); if (!text) return [];
  const latin = (text.match(/[A-Za-z0-9]+(?:[\s'’&+\-]+[A-Za-z0-9]+)*/g) || []).join(' ');
  const chinese = (text.match(/[\u4e00-\u9fff0-9]+/g) || []).join('');
  return [text, latin, chinese].filter(Boolean);
}
function imageRefText(ref) { return decodeURIComponent(String(ref?.catalogImageRef || ref?.imageSourceIdentity || ref?.imageOwnerCanonicalKey || ref?.url || '')).replace(/\+/g, ' '); }
function looksLikeParentSetImage(ref, parent) {
  const text = canonicalKey(imageRefText(ref));
  const parentNames = imageNameForms(parent?.productName).map(canonicalKey);
  return Boolean(text && parentNames.some(name => name && text.includes(name)));
}
function isOwnedChildImageRef(ref, identity, parent) {
  if (!ref || ref.kind === 'placeholder' || ref.kind === 'generated') return false;
  if (ref.kind === 'personal') return !sameImageRef(ref, parent?.imageRef);
  const owner = canonicalKey(ref.imageOwnerCanonicalKey || ref.imageSourceIdentity || ref.catalogImageRef || '');
  if (owner && identity.includes(owner)) return true;
  const text = canonicalKey(imageRefText(ref));
  return Boolean(text && !looksLikeParentSetImage(ref, parent) && identity.some(name => name && text.includes(name)));
}
function stampChildImageOwner(ref, canonical) {
  if (!ref || ref.kind === 'personal') return ref;
  return { ...ref, imageOwnerCanonicalKey:canonicalKey(canonical) };
}
function sameImageRef(a, b) { return JSON.stringify(a || null) === JSON.stringify(b || null); }
function uniqueCanonicalKeys(values) { return [...new Set(values.map(canonicalKey).filter(Boolean))]; }
function isParentCover(ref, toys) { return (toys || []).some(toy => toy.set?.kind === 'parent' && sameImageRef(toy.imageRef, ref)); }
function resolveSharedParent(a, b, toys, index) {
  const keys = [...parentIdentityTokens(a), ...parentIdentityTokens(b), a.set?.parentId, b.set?.parentId].filter(Boolean);
  const indexed = keys.map(key => index.get(key) || index.get(canonicalKey(key))).find(Boolean);
  if (indexed) return indexed;
  const setName = canonicalKey(a.set?.setName || b.set?.setName);
  return (toys || []).find(toy => toy.set?.kind === 'parent' && canonicalKey(toy.productName) === setName) || null;
}

function childSetLink(previous = {}, parent, plan = {}) {
  return {
    kind:'child', parentId:parent.id, parentCanonicalKey:parent.canonicalKey,
    legacyParentIds:[...(previous.legacyParentIds || []), previous.parentId].filter(Boolean),
    setName:parent.productName, partIndex:plan.set?.partIndex || previous.partIndex || null,
    childIds:[], rotationMode:'split', ownershipSource:previous.ownershipSource || null,
    generatedFromParentId:previous.generatedFromParentId || null,
    ownershipGroupId:previous.ownershipGroupId || null,
    detachedFromSet:previous.detachedFromSet === true
  };
}

// Ownership provenance is intentionally separate from catalog structure.  A
// catalog child never becomes user-owned merely because it exists in children[].
// Legacy rows receive a generated marker only when the parent itself retained
// the exact child id and no independent/detached evidence exists.
export function establishParentChildOwnership(state) {
  const toys = state.toys || [];
  const parents = toys.filter(toy => toy.set?.kind === 'parent');
  let markedGenerated = 0, preservedIndependent = 0;
  for (const child of toys.filter(toy => toy.set?.kind === 'child')) {
    const parent = parents.find(candidate => isChildOfParent(child, candidate));
    if (!parent) continue;
    const classification = classifyChildOwnershipForParent(toys, parent, child);
    if (classification.kind !== 'generated_from_this_parent') { preservedIndependent++; continue; }
    if (child.set?.ownershipSource === 'generated_from_set' && child.set?.generatedFromParentId === parent.id && child.set?.detachedFromSet !== true) continue;
    child.set.ownershipSource = 'generated_from_set';
    child.set.generatedFromParentId = parent.id;
    child.set.ownershipGroupId = parent.id;
    child.set.detachedFromSet = false;
    child.set.detachedFromParentOwnershipId = null;
    child.set.detachedAt = null;
    markedGenerated++;
  }
  return { markedGenerated, preservedIndependent };
}

export function linkedChildrenForParent(toys = [], parent) {
  return (toys || []).filter(child => classifyChildOwnershipForParent(toys, parent, child).kind === 'generated_from_this_parent');
}

export function independentChildrenForParent(toys = [], parent) {
  return (toys || []).filter(child => {
    const classification = classifyChildOwnershipForParent(toys, parent, child);
    return classification.kind === 'independent_ownership' || classification.kind === 'explicitly_detached';
  });
}

// This is the single runtime classifier used by the delete modal and action.
// Old builds wrote detachedFromSet + independent onto generated split children;
// those two ambiguous fields can never override a provable exact parent-child
// relationship. A new explicit-preserve transition has its own durable marker.
export function classifyChildOwnershipForParent(toys = [], parent = {}, child = {}) {
  if (child.set?.kind !== 'child' || !isChildOfParent(child, parent)) return { kind:'unrelated', reason:'not_child_of_parent' };
  const explicit = explicitIndependentEvidence(child);
  if (explicit) return explicit;
  const parentKeys = new Set(uniqueCanonicalKeys([parent.canonicalKey, ...(parent.legacyCanonicalKeys || [])]));
  const parentIds = new Set([parent.id, ...(parent.set?.legacyParentIds || [])].filter(Boolean));
  const childKeys = uniqueCanonicalKeys([child.canonicalKey, ...(child.legacyCanonicalKeys || [])]);
  const canonicalLink = canonicalKey(child.set?.parentCanonicalKey);
  const exactCanonicalParent = parentKeys.has(canonicalLink);
  const historicalParentLink = [child.set?.parentId, child.set?.generatedFromParentId, ...(child.set?.legacyParentIds || [])].some(id => parentIds.has(id));
  const plannedChild = (parent.set?.childIds || []).includes(child.id) || childKeys.some(key => parentKeys.has(key.replace(/(?:-|:)(?:part|puzzle)-\d+$/, '')));
  const hasPart = Number(child.set?.partIndex || partIndexFromKey(child.canonicalKey)) > 0;
  if ((exactCanonicalParent || historicalParentLink) && plannedChild && hasPart) return { kind:'generated_from_this_parent', reason:'exact_parent_identity_plus_split_child_plan' };
  if (child.set?.ownershipSource === 'generated_from_set' && child.set?.generatedFromParentId === parent.id && child.set?.detachedFromSet !== true) return { kind:'generated_from_this_parent', reason:'current_generated_ownership_link' };
  return { kind:'independent_ownership', reason:'no_provable_generated_ownership' };
}

export function isIndependentChildOwnership(child = {}) {
  return Boolean(explicitIndependentEvidence(child));
}
function explicitIndependentEvidence(child = {}) {
  const source = child.set?.ownershipSource;
  if (child.set?.detachedFromParentOwnershipId || source === 'detached_from_set') return { kind:'explicitly_detached', reason:'explicit_parent_delete_preserve' };
  if (['manual','catalog','ai_independent','user_added','separate_purchase'].includes(source)) return { kind:'independent_ownership', reason:`explicit_source:${source}` };
  if (child.purchaseDate || Object.keys(child.purchaseMetadata || {}).length || child.userMetadata?.independentOwnership === true) return { kind:'independent_ownership', reason:'independent_purchase_or_user_metadata' };
  return null;
}

// State repair rejects, rather than merely hides, unprovable child images.
// A remote/catalog legacy ref must name its exact owner canonical identity;
// parent tokens, a nearby part number, or a sibling reference are never proof.
export function validateChildImageProvenance(child, parent, siblings = []) {
  const ref = child?.imageRef;
  if (!ref || ref.kind === 'placeholder' || ref.kind === 'generated') return { accepted:false, kind:'placeholder', reason:'no_child_image' };
  if (ref.kind === 'personal') {
    if (sameImageRef(ref, parent?.imageRef) || siblings.some(item => sameImageRef(ref, item.imageRef))) return { accepted:false, kind:'parent_or_sibling', reason:'personal_ref_shared_with_non_child' };
    return { accepted:true, kind:'personal', reason:'personal_child_image' };
  }
  const owner = canonicalKey(ref.imageOwnerCanonicalKey || ref.ownerCanonicalKey || ref.catalogOwnerCanonicalKey || '');
  const childKeys = uniqueCanonicalKeys([child.canonicalKey, ...(child.legacyCanonicalKeys || [])]);
  if (!owner) return { accepted:false, kind:'unknown', reason:'missing_owner_identity' };
  if (!childKeys.includes(owner)) return { accepted:false, kind:'parent_or_sibling', reason:'owner_identity_does_not_equal_child' };
  if (sameImageRef(ref, parent?.imageRef) || siblings.some(item => sameImageRef(ref, item.imageRef))) return { accepted:false, kind:'parent_or_sibling', reason:'ref_shared_with_parent_or_sibling' };
  return { accepted:true, kind:'same_child_legacy', reason:'owner_identity_equals_child' };
}

export function repairChildImageProvenance(state) {
  const toys = state.toys || [];
  const parents = toys.filter(toy => toy.set?.kind === 'parent');
  const report = { cleared:0, parentOrSibling:0, unknown:0, retainedPersonal:0, retainedSameChild:0 };
  for (const child of toys.filter(toy => toy.set?.kind === 'child')) {
    const parent = parents.find(candidate => isChildOfParent(child, candidate));
    const siblings = toys.filter(other => other.id !== child.id && parent && isChildOfParent(other, parent));
    const verdict = validateChildImageProvenance(child, parent, siblings);
    if (verdict.accepted) {
      if (verdict.kind === 'personal') report.retainedPersonal++;
      else report.retainedSameChild++;
      child.alternateImageRefs = (child.alternateImageRefs || []).filter(ref => validateChildImageProvenance({ ...child, imageRef:ref }, parent, siblings).accepted);
      continue;
    }
    if (child.imageRef?.kind !== 'placeholder') { child.imageRef = { kind:'placeholder' }; report.cleared++; }
    child.alternateImageRefs = [];
    if (verdict.kind === 'parent_or_sibling') report.parentOrSibling++; else report.unknown++;
  }
  return report;
}

// Historical reconciliation could stamp an owner key onto an unaudited Bing
// or same-series remote URL. That proves which row carried the reference, not
// that the bytes are a verified image of that child. Remove only the stale
// ownership-level binding; the presentation resolver will then inherit the
// current shared Catalog image without converting it into a personal photo.
export function repairLegacyChildImageBindings(state, catalog = null) {
  const toys = state.toys || [];
  const parents = toys.filter(toy => toy.set?.kind === 'parent');
  const report = {
    examined:0, changed:0, retainedPersonal:0, retainedVerifiedCatalog:0,
    clearedSearchDerived:0, clearedStaleLegacyRemote:0,
    clearedParentOrSet:0, clearedSibling:0, clearedUnknown:0,
    catalogInheritanceReady:0
  };
  for (const child of toys.filter(toy => toy.set?.kind === 'child')) {
    report.examined++;
    const parent = parents.find(candidate => isChildOfParent(child, candidate));
    const siblings = toys.filter(other => other.id !== child.id && parent && isChildOfParent(other, parent));
    const currentCatalog = catalog?.resolve?.(child) || null;
    if (sameCatalogChildForImageRepair(child, currentCatalog) && isVerifiedOrStableChildImage(currentCatalog.imageRef)) report.catalogInheritanceReady++;
    const ref = child.imageRef;
    if (ref?.kind === 'personal') { report.retainedPersonal++; continue; }
    if (!ref || ref.kind === 'placeholder' || ref.kind === 'generated') continue;
    const verdict = validateChildImageProvenance(child, parent, siblings);
    if (verdict.accepted && isVerifiedOrStableChildImage(ref)) { report.retainedVerifiedCatalog++; continue; }

    if (isSearchOrTransientChildImage(ref)) report.clearedSearchDerived++;
    else if (parent && sameImageRef(ref, parent.imageRef)) report.clearedParentOrSet++;
    else if (siblings.some(item => sameImageRef(ref, item.imageRef))) report.clearedSibling++;
    else if (ref.kind === 'remote' && verdict.accepted) report.clearedStaleLegacyRemote++;
    else report.clearedUnknown++;
    child.imageRef = { kind:'placeholder' };
    child.alternateImageRefs = (child.alternateImageRefs || []).filter(candidate => candidate?.kind === 'personal' || isVerifiedOrStableChildImage(candidate));
    report.changed++;
  }
  return report;
}

function sameCatalogChildForImageRepair(child, catalogChild) {
  if (child?.set?.kind !== 'child' || catalogChild?.set?.kind !== 'child') return false;
  const childKeys = uniqueCanonicalKeys([child.canonicalKey, ...(child.legacyCanonicalKeys || [])]);
  const catalogKeys = uniqueCanonicalKeys([catalogChild.canonicalKey, ...(catalogChild.legacyCanonicalKeys || [])]);
  if (childKeys.some(key => catalogKeys.includes(key))) return true;
  const childParent = canonicalKey(child.set?.parentCanonicalKey);
  const catalogParent = canonicalKey(catalogChild.set?.parentCanonicalKey);
  const childPart = Number(child.set?.partIndex || partIndexFromKey(child.canonicalKey));
  const catalogPart = Number(catalogChild.set?.partIndex || partIndexFromKey(catalogChild.canonicalKey));
  return Boolean(childParent && childParent === catalogParent && childPart > 0 && childPart === catalogPart);
}

function isVerifiedOrStableChildImage(ref) {
  if (!ref || ['placeholder','generated','personal'].includes(ref.kind) || isSearchOrTransientChildImage(ref)) return false;
  if (ref.kind === 'catalog') return true;
  return ['verified','verified_real','manually_confirmed'].includes(ref.verificationStatus)
    || ['verified_real','stable_remote','manually_confirmed'].includes(ref.assetState)
    || ['official_cdn','stable_retailer','manually_confirmed'].includes(ref.imageSourceType);
}

function isSearchOrTransientChildImage(ref) {
  const value = String(ref?.catalogImageRef || ref?.url || '');
  return /(?:bing\.net\/th|bing\.com\/images|google(?:usercontent)?\.com\/search|[?&](?:token|expires|signature)=|^(?:blob|data):)/i.test(value)
    || ['search-fallback','missing-catalog-metadata'].includes(ref?.source);
}
