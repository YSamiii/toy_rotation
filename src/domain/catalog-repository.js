import { canonicalKey, normalizeCatalogToy } from '../data/schema.js';
import { reconcileSplitSetChildren, restoreMissingSplitSetChildren, establishParentChildOwnership, repairChildImageProvenance, repairLegacyChildImageBindings, reconcileOrphanedSplitOwnership } from './set-service.js';
import { catalogImageRef, deriveCatalogMechanics } from './catalog-presentation.js';
import { resolveCatalogReference, sameCatalogIdentity } from './identity-service.js';
import { compare, exactProductIdentityKey } from './duplicate-engine.js';
import { catalogImageAsset } from '../data/catalog-image-assets.js';
import { validateChildImageProvenance } from './set-service.js';
import { catalogReviewMetadata, isPublicCatalogVisible } from '../data/hape-final-resolution-review.js';

export class CatalogRepository {
  #base = []; #remote = []; #serverEdits = {}; #active = []; #byKey = new Map(); #mergedInto = new Map(); #childByParentPart = new Map(); #store;
  constructor(store, { baseUrl = '' } = {}) { this.#store = store; this.baseUrl = String(baseUrl || '').replace(/\/$/, ''); }
  async hydrate({ onStage = () => {} } = {}) {
    // Built-in catalog data is all that the first interactive catalog needs.
    // Remote learned rows and overrides refresh after it is available and never
    // hold the application shell hostage to a backend request.
    onStage('catalog_static_load_start');
    const [remote, base, candidates] = await Promise.all([
      fetchJson('./catalog-remote.json'), fetchJson('./catalog-base.json'), fetchJson('./catalog-candidates.json')
    ]);
    this.#remote = entries(remote);
    this.applyBase([...entries(base), ...entries(candidates)]);
    onStage('catalog_static_load_end', { activeCatalogCount:this.#active.length });
    if (this.baseUrl) void this.#hydrateServer(onStage);
    return this.#active;
  }
  async #hydrateServer(onStage) {
    try {
      onStage('remote_catalog_request_start');
      const [learned, overrides] = await Promise.all([
        fetchJson(`${this.baseUrl}/learned-catalog`, { timeoutMs:4500 }),
        fetchJson(`${this.baseUrl}/catalog-overrides`, { timeoutMs:4500 })
      ]);
      this.#remote = [...this.#remote, ...entries(learned)];
      this.#serverEdits = overrides?.overrides || {};
      this.#rebuild(); this.ensureSetChildren();
      onStage('remote_catalog_request_end', { activeCatalogCount:this.#active.length });
    } catch { onStage('remote_catalog_request_end', { status:'unavailable' }); }
  }
  get active() { return this.#active; }
  getByKey(key) {
    const requested=canonicalKey(key);
    return this.#byKey.get(requested) || this.#byKey.get(this.#mergedInto.get(requested)) || null;
  }
  reviewMetadata(reference) { return catalogReviewMetadata(typeof reference === 'string' ? reference : reference?.canonicalKey); }
  resolve(reference) {
    // Historical child ownerships may still use `parent-N` or retain the
    // current key only in legacyCanonicalKeys. Resolve every explicit key
    // through the same repository before applying any broader identity logic.
    for (const key of [reference?.canonicalKey, reference?.catalogKey, reference?.catalogId, ...(reference?.legacyCanonicalKeys || [])]) {
      const match=this.getByKey(key); if (match && safeExplicitCatalogMatch(reference,match,key)) return match;
    }
    // Nested Catalog children are not top-level `active` rows. An exact parent
    // identity plus exact part index is therefore the only safe structural
    // bridge for an old child key; it cannot cross a parent, sibling, or SKU.
    const parent=canonicalKey(reference?.set?.parentCanonicalKey || reference?.parentCanonicalKey);
    const part=childPartIndex(reference);
    if (parent && part > 0) {
      const match=this.#childByParentPart.get(`${parent}|${part}`); if (match) return match;
    }
    return resolveCatalogReference(reference, this.#active);
  }
  // Recognition is an input to the same Catalog identity layer as every other
  // entry point.  This method classifies only with the existing identity
  // engine; it never imports substitution or recommendation scores.
  resolveRecognition(reference = {}) {
    const exact = this.resolve(reference);
    if (exact) return { kind:'catalog_match', catalog:exact };
    const requestedKey=canonicalKey(reference.canonicalKey || reference.catalogKey || `${reference.brand || ''}-${reference.productName || reference.name || ''}`);
    const tombstone=this.#store.state.catalogState?.tombstones?.[requestedKey];
    if (tombstone && !tombstone.mergedInto) return { kind:'tombstoned', canonicalKey:requestedKey, tombstone };
    // This is deliberately a review state rather than a new AI duplicate
    // heuristic.  In normal cases existing identity resolution above wins;
    // this branch preserves the existing duplicate engine's explicit strong
    // conflict result when it is not safe to resolve a canonical identity.
    const conflicts=this.#active.map(candidate => compare(reference, candidate))
      .filter(match => match.kind === 'strong_probable_duplicate');
    if (conflicts.length) return { kind:'duplicate_review_required', conflicts };
    return { kind:'genuinely_new', canonicalKey:requestedKey };
  }
  registerLearnedCandidate(input = {}, { candidateImageRef = null, provenance = 'ai_recognition' } = {}) {
    const decision=this.resolveRecognition(input);
    if (decision.kind === 'catalog_match') return { created:false, catalog:decision.catalog, decision };
    if (decision.kind !== 'genuinely_new') return { created:false, catalog:null, decision };
    const row=normalizeCatalogToy({
      ...input,
      id:decision.canonicalKey,
      canonicalKey:decision.canonicalKey,
      imageRef:{ kind:'placeholder' },
      candidateImageRef,
      source:'learned',
      reviewStatus:'pending',
      provenance,
      createdAt:new Date().toISOString()
    });
    let catalog=row;
    this.#store.update(state => {
      state.catalogState ||= { tombstones:{}, adminEdits:{}, imageRefsByKey:{}, imageRefsByIdentity:{}, learnedEntries:[], syncMetadata:{} };
      state.catalogState.learnedEntries ||= [];
      const existing=state.catalogState.learnedEntries.find(item => sameCatalogIdentity(item,row));
      if (existing) { catalog=normalizeCatalogToy(existing); return; }
      state.catalogState.learnedEntries.push(row);
    }, 'catalog-learned-create');
    this.#rebuild();
    return { created:catalog === row, catalog:this.resolve(catalog) || catalog, decision };
  }
  pendingLearned() { return this.#active.filter(item => item.source === 'learned' && item.reviewStatus === 'pending'); }
  // Learned candidates live in the one active catalog. Approval is an admin
  // state transition on that same record, not an AI-specific second catalog.
  approveLearnedCandidate(key) {
    const canonical=canonicalKey(key); let approved=null;
    this.#store.update(state => {
      state.catalogState ||= { tombstones:{}, adminEdits:{}, imageRefsByKey:{}, imageRefsByIdentity:{}, learnedEntries:[], syncMetadata:{} };
      const entry=(state.catalogState.learnedEntries || []).find(item => canonicalKey(item.canonicalKey) === canonical);
      if (!entry) return;
      entry.reviewStatus='approved';
      state.catalogState.adminEdits[canonical] = { ...(state.catalogState.adminEdits[canonical] || {}), reviewStatus:'approved' };
      approved=entry;
    }, 'catalog-learned-approve');
    this.#rebuild();
    return approved ? this.resolve(approved) : null;
  }
  search({ query = '', brand = '', categoryCode = '', skillCode = '', playMechanic = '', includeReview = true } = {}) {
    const text = String(query).trim().toLowerCase();
    return this.#active.filter(toy => (includeReview || isPublicCatalogVisible(toy)) && (!brand || toy.brand === brand) && (!categoryCode || toy.categoryCode === categoryCode) && (!skillCode || toy.skillCodes.includes(skillCode)) && (!playMechanic || toy.playMechanics.includes(playMechanic)) && (!text || [toy.brand, toy.productName, ...toy.aliases].join(' ').toLowerCase().includes(text)));
  }
  applyRemote(entriesValue) { this.#remote = entries(entriesValue); this.#rebuild(); this.ensureSetChildren(); }
  applyBase(entriesValue) { this.#base = entries(entriesValue); this.#rebuild(); this.ensureSetChildren(); }
  applyServerEdits(value) { this.#serverEdits = value?.overrides || value || {}; this.#rebuild(); this.ensureSetChildren(); }
  refresh() { this.#rebuild(); }
  deleteStandardToy(key) {
    const canonical = canonicalKey(key); if (!canonical) return;
    this.#store.update(state => { state.catalogState.tombstones[canonical] = { deletedAt: new Date().toISOString() }; }, 'catalog-delete');
    this.#rebuild();
  }
  updateAdminEdit(key, patch) { const canonical = canonicalKey(key); this.#store.update(state => { state.catalogState.adminEdits[canonical] = { ...(state.catalogState.adminEdits[canonical] || {}), ...patch }; }, 'catalog-edit'); this.#rebuild(); }
  mergeReferences(key, targetKey) {
    const from = canonicalKey(key), to = canonicalKey(targetKey); if (!from || !to || from === to) return;
    const source = this.#byKey.get(from), target = this.#byKey.get(to);
    this.#store.update(state => {
      for (const toy of state.toys || []) if (canonicalKey(toy.canonicalKey) === from) { toy.canonicalKey = to; toy.legacyCanonicalKeys=[...new Set([...(toy.legacyCanonicalKeys || []),from])]; }
      for (const item of state.wishlist || []) if (canonicalKey(item.canonicalKey) === from) { item.canonicalKey = to; item.catalogId = to; if (item.catalogSnapshot) { item.catalogSnapshot.canonicalKey=to; item.catalogSnapshot.legacyCanonicalKeys=[...new Set([...(item.catalogSnapshot.legacyCanonicalKeys || []),from])]; } }
      for (const round of state.rotationHistory || []) if (canonicalKey(round.canonicalKey || round.catalogKey) === from) { round.canonicalKey=to; round.catalogKey=to; }
      state.catalogState.learnedEntries = (state.catalogState.learnedEntries || []).filter(item => canonicalKey(item.canonicalKey) !== from);
      const sourceImage=state.catalogState.imageRefsByKey?.[from];
      state.catalogState.adminEdits[to] = { ...(state.catalogState.adminEdits[to] || {}), aliases:[...new Set([...(target?.aliases || []), ...(source?.aliases || []), source?.productName, source?.names?.zh, key].filter(Boolean))], legacyCanonicalKeys:[...new Set([...(target?.legacyCanonicalKeys || []), ...(state.catalogState.adminEdits[to]?.legacyCanonicalKeys || []),from])], alternateImageRefs:[...new Set([...(target?.alternateImageRefs || []), ...(source?.alternateImageRefs || []), source?.imageRef, sourceImage].filter(Boolean).map(value=>JSON.stringify(value)))].map(value=>JSON.parse(value)) };
      if (state.catalogState.imageRefsByKey?.[from]) delete state.catalogState.imageRefsByKey[from];
      state.catalogState.tombstones[from] = { deletedAt:new Date().toISOString(), mergedInto:to };
    }, 'catalog-merge');
    this.#rebuild();
  }
  ensureSetChildren() {
    // A legacy failed delete can leave every generated child as kind:none;
    // legacyParentIds is therefore also an ownership-reconciliation trigger.
    if (!(this.#store.state.toys || []).some(toy => toy.set?.kind === 'parent' || toy.set?.kind === 'child' || (toy.set?.legacyParentIds || []).length)) return;
    const definitions = new Map(this.#active.map(toy => [toy.canonicalKey, toy]));
    this.#store.update(state => {
      state.toys ||= [];
      const orphanLifecycle = reconcileOrphanedSplitOwnership(state, definitions);
      // Repair only when the legacy store or stale child IDs proves a previous
      // migration removed owned split children. This runs before the normal
      // split reconciler so a formerly-whole parent can safely re-enter the
      // one canonical set pipeline.
      const repair = restoreMissingSplitSetChildren(state, definitions, legacyToyRows());
      const result = reconcileSplitSetChildren(state, definitions);
      const ownership = establishParentChildOwnership(state);
      const imageProvenance = repairChildImageProvenance(state);
      const legacyChildImageBindings = repairLegacyChildImageBindings(state, this);
      state.catalogState.syncMetadata ||= {};
      const pending = (result.residualDuplicateChildren || 0) > 0;
      state.catalogState.syncMetadata.parentChildReconciliationV12 = { reconciledAt:new Date().toISOString(), pending, executionRequired:pending, ...result, remainingCandidates:result.residualDuplicateChildren || 0 };
      state.catalogState.syncMetadata.parentChildDataRepair = { repairedAt:new Date().toISOString(), ...repair };
      state.catalogState.syncMetadata.parentChildIntegrityV12 = { repairedAt:new Date().toISOString(), ...ownership, ...imageProvenance, orphanLifecycle, legacyChildImageBindings };
    }, 'set-child-migration');
  }
  repairSetStructure() { this.ensureSetChildren(); return this.#store.state.catalogState?.syncMetadata?.parentChildReconciliationV12 || null; }
  #rebuild() {
    const { tombstones = {}, adminEdits = {}, imageRefsByKey = {}, imageRefsByIdentity = {}, learnedEntries = [], remoteEntries = [] } = this.#store.state.catalogState;
    const merged = new Map();
    const allRows=[...this.#base, ...this.#remote, ...entries(learnedEntries), ...entries(remoteEntries)];
    const tombstonedIdentities = new Set(allRows.map(normalizeCatalogToy).filter(toy => { const record=tombstones[canonicalKey(toy.canonicalKey)]; return record && !record.mergedInto; }).map(exactProductIdentityKey).filter(Boolean));
    for (const raw of allRows) {
      const toy = normalizeCatalogToy(raw); const key = canonicalKey(toy.canonicalKey); const previous = merged.get(key); const combined = previous ? normalizeCatalogToy({ ...previous, ...toy, aliases:[...(previous.aliases || []), ...(toy.aliases || [])], legacyCanonicalKeys:[...(previous.legacyCanonicalKeys || []), ...(toy.legacyCanonicalKeys || [])], names:{ ...previous.names, ...toy.names }, children:toy.children?.length ? toy.children : previous.children }) : toy; const serverEdit = this.#serverEdits[key] || {};
      if (!key || tombstones[key] || serverEdit.hidden === true || serverEdit.deleted === true) continue;
      const serverToy = normalizeCatalogToy({ ...combined, ...serverEdit, productName:serverEdit.productName || serverEdit.name || combined.productName, names:{ ...combined.names, en:serverEdit.nameEn || serverEdit.name || combined.names?.en, zh:serverEdit.nameZh || combined.names?.zh } });
      const legacyImage = imageRefsByKey[key] || imageRefsByIdentity[catalogIdentity(serverToy)];
      // One resolver supplies Catalog, Wishlist and Catalog→Library. User and
      // admin-confirmed catalog refs deliberately outrank the static backfill;
      // personal Toy Library refs never enter this pipeline.
      const asset = catalogImageAsset(key);
      const edited = normalizeCatalogToy({ ...serverToy, ...(asset ? { imageRef:asset } : {}), ...(legacyImage ? { imageRef:legacyImage } : {}), ...(adminEdits[key] || {}) });
      merged.set(key, { ...edited, playMechanics:deriveCatalogMechanics(edited), imageRef:catalogImageRef(edited) });
    }
    // Existing administrator merges are durable redirects. The source stays
    // tombstoned while the target advertises the old canonical key for every
    // resolver, duplicate guard, rebuild, and Restore validation path.
    this.#mergedInto = new Map(Object.entries(tombstones).filter(([,record]) => record?.mergedInto).map(([from,record]) => [canonicalKey(from),canonicalKey(record.mergedInto)]));
    for (const [from,to] of this.#mergedInto) if (merged.has(to)) {
      const target=merged.get(to);
      merged.set(to, normalizeCatalogToy({ ...target, legacyCanonicalKeys:[...(target.legacyCanonicalKeys || []),from] }));
    }
    this.#active = consolidateCatalog([...merged.values()].filter(toy => !tombstonedIdentities.has(exactProductIdentityKey(toy)))).sort(catalogSort);
    this.#byKey = new Map();
    this.#childByParentPart = new Map();
    for (const toy of this.#active) for (const key of [toy.canonicalKey, ...(toy.legacyCanonicalKeys || [])]) this.#byKey.set(canonicalKey(key), toy);
    for (const parent of this.#active) {
      for (const [index, rawChild] of (parent.children || []).entries()) {
        const child = catalogChildPresentation(parent, rawChild, index);
        for (const key of [child.canonicalKey, ...(child.legacyCanonicalKeys || [])]) if (!this.#byKey.has(canonicalKey(key))) this.#byKey.set(canonicalKey(key), child);
        const parentKey=canonicalKey(child.set?.parentCanonicalKey); const part=childPartIndex(child);
        if (parentKey && part > 0 && !this.#childByParentPart.has(`${parentKey}|${part}`)) this.#childByParentPart.set(`${parentKey}|${part}`,child);
      }
    }
  }
}
function catalogChildPresentation(parent, rawChild = {}, index = 0) {
  const source = {
    ...rawChild,
    canonicalKey:rawChild.canonicalKey || rawChild.key || `${parent.canonicalKey}:part-${index + 1}`,
    brand:rawChild.brand || parent.brand,
    minAgeMonths:rawChild.minAgeMonths ?? parent.minAgeMonths,
    maxAgeMonths:rawChild.maxAgeMonths ?? parent.maxAgeMonths,
    set:{ ...(rawChild.set || {}), kind:'child', parentCanonicalKey:parent.canonicalKey, partIndex:rawChild.set?.partIndex || index + 1, rotationMode:'split' }
  };
  let child = normalizeCatalogToy(source);
  if (child.imageRef?.kind === 'catalog') child = normalizeCatalogToy({ ...child, imageRef:{ ...child.imageRef, imageOwnerCanonicalKey:child.canonicalKey } });
  if (!validateChildImageProvenance(child, parent).accepted) child = normalizeCatalogToy({ ...source, imageRef:{ kind:'placeholder' } });
  const asset = catalogImageAsset(child.canonicalKey);
  if (asset) child = normalizeCatalogToy({ ...child, imageRef:{ ...asset, imageOwnerCanonicalKey:child.canonicalKey } });
  return { ...child, imageRef:catalogImageRef(child) };
}
function sameImageRef(a, b) { return Boolean(a && b) && JSON.stringify(a) === JSON.stringify(b); }
function childPartIndex(value) {
  const explicit=Number(value?.set?.partIndex ?? value?.partIndex);
  if (Number.isInteger(explicit) && explicit > 0) return explicit;
  const match=String(value?.canonicalKey || value?.catalogKey || '').match(/(?:-|:)(?:part-?)?(\d+)$/i);
  return Number(match?.[1] || 0);
}
function safeExplicitCatalogMatch(reference, match, requestedKey) {
  if (match?.set?.kind !== 'child' || reference?.set?.kind !== 'child') return true;
  const referenceParent=canonicalKey(reference.set?.parentCanonicalKey || reference.parentCanonicalKey);
  const matchParent=canonicalKey(match.set?.parentCanonicalKey);
  const referencePart=childPartIndex(reference); const matchPart=childPartIndex(match);
  if (referenceParent && referencePart > 0) return referenceParent === matchParent && referencePart === matchPart;
  return canonicalKey(requestedKey) === canonicalKey(match.canonicalKey)
    || (match.legacyCanonicalKeys || []).some(key=>canonicalKey(key) === canonicalKey(requestedKey));
}
function legacyToyRows() {
  if (typeof localStorage === 'undefined') return [];
  for (const key of ['toyRotationV04','toyRotationV032','toyRotationV03','toyRotationV02']) {
    try { const value=JSON.parse(localStorage.getItem(key) || 'null'); if (Array.isArray(value?.toys)) return value.toys; } catch { /* ignore malformed legacy storage */ }
  }
  return [];
}
async function fetchJson(url, { timeoutMs = 4500 } = {}) {
  const controller = typeof AbortController === 'undefined' ? null : new AbortController();
  const timeout = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    // Do not add a timestamp: it bypasses the pre-cached local catalog in PWA
    // mode and turns every launch into a network dependency.
    const response = await fetch(url, { cache:'no-cache', signal:controller?.signal });
    return response.ok ? response.json() : [];
  } catch { return []; }
  finally { if (timeout) clearTimeout(timeout); }
}
function entries(value) { return Array.isArray(value) ? value : Array.isArray(value?.entries) ? value.entries : Array.isArray(value?.catalog) ? value.catalog : Array.isArray(value?.items) ? value.items : []; }
function catalogIdentity(toy) { return `${String(toy.brand === 'other_unspecified' ? '' : toy.brand || '').trim().toLowerCase()}|${String(toy.productName || toy.names?.en || '').normalize('NFKC').trim().toLowerCase()}`; }
function catalogSort(a,b) { const brand=a.brand.localeCompare(b.brand); if(brand)return brand; if(a.brand==='Lovevery')return Number(a.catalogSortOrder||999999)-Number(b.catalogSortOrder||999999)||Number(a.minAgeMonths||0)-Number(b.minAgeMonths||0)||a.productName.localeCompare(b.productName); return a.productName.localeCompare(b.productName); }
function consolidateCatalog(rows) {
  const groups=new Map();
  for(const row of rows){const identity=exactProductIdentityKey(row)||`key:${row.canonicalKey}`;if(!groups.has(identity))groups.set(identity,[]);groups.get(identity).push(row);}
  return [...groups.values()].map(group=>{
    if(group.length===1)return group[0];
    const preferred=[...group].sort((a,b)=>catalogRichness(b)-catalogRichness(a))[0];
    return normalizeCatalogToy({ ...preferred, aliases:[...new Set(group.flatMap(item=>[...(item.aliases||[]),item.productName,item.names?.zh]).filter(Boolean))], legacyCanonicalKeys:[...new Set(group.flatMap(item=>[item.canonicalKey,...(item.legacyCanonicalKeys||[])]).filter(key=>canonicalKey(key)!==canonicalKey(preferred.canonicalKey)))], children:group.sort((a,b)=>(b.children?.length||0)-(a.children?.length||0))[0].children, alternateImageRefs:[...new Map(group.flatMap(item=>[item.imageRef,...(item.alternateImageRefs||[])]).filter(Boolean).map(ref=>[JSON.stringify(ref),ref])).values()] });
  });
}
function catalogRichness(toy){return (toy.children?.length||0)*20+(toy.imageRef?.kind==='catalog'?15:toy.imageRef?.kind==='remote'?5:0)+(toy.aliases?.length||0)+(toy.names?.zh?3:0);}
