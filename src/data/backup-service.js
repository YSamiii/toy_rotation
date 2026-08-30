import { canonicalKey, normalizeToy, normalizeWishlistItem } from './schema.js';
import { repairFakePersonalPlaceholderBindings, runMigrations } from './store.js';
import { findDuplicates } from '../domain/duplicate-engine.js';
import { reconcileSplitSetChildren, reconcileOrphanedSplitOwnership, repairLegacyChildImageBindings, validateSetGraph } from '../domain/set-service.js';

export async function exportBackup(store, imageRepository) {
  const state = structuredClone(store.state);
  const imageRefs = state.toys.map(toy => toy.imageRef).filter(ref => ref?.kind === 'personal' || ref?.kind === 'catalog');
  const images = {};
  for (const ref of imageRefs) {
    const dataUrl = await imageRepository.resolve(ref);
    if (dataUrl) images[`${ref.kind}:${ref.id}`] = dataUrl;
  }
  return { format: 'toy-rotation-clean-baseline-backup', schemaVersion: state.schemaVersion, exportedAt: new Date().toISOString(), state, images };
}

export async function restoreBackup(payload, store, imageRepository, { catalog = null, onStage = () => {}, trace:existingTrace = null } = {}) {
  const trace = existingTrace || createRestoreTrace();
  const stage = (name, detail = {}) => {
    trace.mark(name, detail);
    onStage({ name, detail, timing:trace.snapshot() });
  };
  try {
    stage('backup_validation_start', { phase:'start' });
    validateBackupEnvelope(payload);
    stage('backup_validation_end', { phase:'end', imageCount:Object.keys(payload.images || {}).length, toyCount:(payload.state?.toys || []).length });

    // Everything below operates on a detached staging graph. No store mutation
    // or durable state write is allowed before reconciliation and validation.
    stage('detached_staging_start', { phase:'start' });
    const staged = prepareRestoreState(payload.state, catalog, stage);
    stage('detached_staging_end', { phase:'end', toyCount:staged.state.toys.length });

    // Imports are local IndexedDB writes only. They are batched so iPhone Safari
    // can paint progress between writes; restore never probes remote catalog/CDN
    // images here. A failed import still leaves the live store untouched.
    stage('backup_image_import_start', { phase:'start' });
    await importBackupImages(payload.images || {}, imageRepository, stage);
    stage('backup_image_import_end', { phase:'end' });
    // Keep this inside detached staging: old backups may contain the exact
    // generated placeholder SVG incorrectly bound as a personal photo.
    stage('fake_personal_placeholder_repair_start', { phase:'start' });
    const fakePersonalPlaceholderRepair=await repairFakePersonalPlaceholderBindings(staged.state, { images:imageRepository, catalog });
    staged.summary.fakePersonalPlaceholderRepair=fakePersonalPlaceholderRepair;
    stage('fake_personal_placeholder_repair_end', { phase:'end', changed:fakePersonalPlaceholderRepair.changed });
    stage('image_metadata_validation_start', { phase:'start' });
    validateImageReferences(staged.state, payload.images || {});
    stage('image_metadata_validation_end', { phase:'end' });

    // Completion is recorded only in the state that is about to be atomically
    // committed. If persistence throws, AppStore.commit leaves live state alone.
    staged.state.catalogState ||= {};
    staged.state.catalogState.syncMetadata ||= {};
    staged.state.catalogState.syncMetadata.restorePipelineR12A = {
      completedAt:new Date().toISOString(),
      repairedDuplicates:staged.summary.repairedDuplicates,
      remappedIdentities:staged.summary.remappedIdentities,
      repairedHistoricalReferences:staged.summary.historicalReferenceRepair,
      fakePersonalPlaceholderRepair:staged.summary.fakePersonalPlaceholderRepair,
      validated:true,
      timing:trace.snapshot()
    };
    if (typeof store.commit !== 'function') throw new Error('restoreTransactionUnavailable');
    stage('atomic_commit_start', { phase:'start' });
    store.commit(staged.state, 'restore', { onStage:stage });
    stage('atomic_commit_end', { phase:'end', toyCount:store.state?.toys?.length ?? staged.state.toys.length });
    stage('persistence_complete', { phase:'end' });
    trace.complete();
    onStage({ name:'restore_complete', detail:staged.summary, timing:trace.snapshot() });
    return { ...staged.summary, timing:trace.snapshot() };
  } catch (error) {
    trace.mark('restore_failed', { success:false, errorName:error?.name || 'Error', errorMessage:error?.message || 'restoreFailed' });
    trace.fail(error);
    onStage({ name:'restore_failed', detail:{ code:error?.message || 'restoreFailed' }, timing:trace.snapshot() });
    throw error;
  }
}

export function prepareRestoreState(input, catalog = null, onStage = () => {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('invalidBackupState');
  // Preserve legacy identity provenance only for historical-event repair. It
  // cannot create a new ownership record.
  const legacyReferenceIndex = buildLegacyReferenceIndex(input.toys || []);
  onStage('migrations_start', { phase:'start' });
  const state = runMigrations(input);
  onStage('migrations_end', { phase:'end', schemaVersion:state.schemaVersion });
  onStage('identity_normalization_start', { phase:'start' });
  state.toys = (state.toys || []).map(normalizeToy);
  state.wishlist = (state.wishlist || []).map(normalizeWishlistItem);
  onStage('identity_normalization_end', { phase:'end', toyCount:state.toys.length, wishlistCount:state.wishlist.length });
  state.catalogState ||= {};
  state.catalogState.tombstones ||= {};
  state.catalogState.adminEdits ||= {};
  state.catalogState.syncMetadata ||= {};

  // A user-confirmed administrator merge is a durable canonical redirect.
  // Apply only exact repository redirects during staging; this never invokes
  // fuzzy identity matching and cannot turn a related variant into a merge.
  const catalogIdentityRedirects = applyCatalogRedirects(state, catalog);

  const definitions = new Map((catalog?.active || []).map(row => [canonicalKey(row.canonicalKey), row]));
  const before = state.toys.length;
  onStage('parent_child_reconciliation_start', { phase:'start', catalogDefinitions:definitions.size });
  const orphanLifecycle = reconcileOrphanedSplitOwnership(state, definitions);
  const reconciliation = reconcileSplitSetChildren(state, definitions);
  const legacyChildImageBindings = repairLegacyChildImageBindings(state, catalog);
  onStage('parent_child_reconciliation_end', { phase:'end', merged:reconciliation.merged || 0, remapped:reconciliation.remapped || 0 });
  onStage('same_child_merge_start', { phase:'start' });
  onStage('same_child_merge_end', { phase:'end', merged:reconciliation.merged || 0 });
  onStage('historical_reference_repair_start', { phase:'start', roundCount:(state.rotationHistory || []).length });
  const historicalReferenceRepair = repairHistoricalReferences(state, { legacyReferenceIndex, reconciliation });
  onStage('historical_reference_repair_end', {
    phase:'end', remapped:historicalReferenceRepair.remapped,
    markedMissing:historicalReferenceRepair.markedMissing,
    affectedRounds:historicalReferenceRepair.affectedRounds
  });
  onStage('state_validation_start', { phase:'start' });
  const validation = validateRestoredState(state, catalog);
  onStage('state_validation_end', { phase:'end', ...validation });
  return {
    state,
    summary:{
      inputToyCount:before,
      outputToyCount:state.toys.length,
      repairedDuplicates:Math.max(0, before - state.toys.length),
      remappedIdentities:reconciliation.remapped || 0,
      parentChildReconciliation:reconciliation,
      legacyChildImageBindings,
      orphanLifecycle,
      historicalReferenceRepair,
      catalogIdentityRedirects,
      validation
    }
  };
}

function applyCatalogRedirects(state, catalog) {
  if (!catalog?.getByKey) return { remappedToys:0, remappedWishlist:0 };
  let remappedToys=0, remappedWishlist=0;
  for (const toy of state.toys || []) {
    const target=catalog.getByKey(toy.canonicalKey);
    if (!target || canonicalKey(target.canonicalKey) === canonicalKey(toy.canonicalKey)) continue;
    toy.legacyCanonicalKeys=[...new Set([...(toy.legacyCanonicalKeys || []),canonicalKey(toy.canonicalKey)])];
    toy.canonicalKey=target.canonicalKey;
    remappedToys++;
  }
  for (const item of state.wishlist || []) {
    const requested=item.canonicalKey || item.catalogKey || item.catalogId;
    const target=catalog.getByKey(requested);
    if (!target || canonicalKey(target.canonicalKey) === canonicalKey(requested)) continue;
    item.canonicalKey=target.canonicalKey;
    item.catalogId=target.canonicalKey;
    if (item.catalogSnapshot) {
      item.catalogSnapshot.legacyCanonicalKeys=[...new Set([...(item.catalogSnapshot.legacyCanonicalKeys || []),canonicalKey(requested)])];
      item.catalogSnapshot.canonicalKey=target.canonicalKey;
    }
    remappedWishlist++;
  }
  return { remappedToys, remappedWishlist };
}

function validateBackupEnvelope(payload) {
  if (!payload || payload.format !== 'toy-rotation-clean-baseline-backup') throw new Error('unsupportedBackup');
  if (!payload.state || typeof payload.state !== 'object' || Array.isArray(payload.state)) throw new Error('invalidBackupState');
  if (payload.images != null && (typeof payload.images !== 'object' || Array.isArray(payload.images))) throw new Error('invalidBackupImages');
}

// Current ownership and active set relationships are fatal because committing
// them would corrupt today's Library. Historical events are repairable: their
// toy may have been deliberately deleted or safely merged years earlier.
function validateRestoredState(state, catalog) {
  const ids = new Set();
  for (const toy of state.toys || []) {
    if (!toy.id || ids.has(toy.id)) throw new Error('restoreDuplicateToyId');
    ids.add(toy.id);
    if (!canonicalKey(toy.canonicalKey)) throw new Error('restoreMissingCanonicalIdentity');
  }
  if (!validateSetGraph(state.toys || [])) throw new Error('restoreInvalidSetGraph');
  const remainingSameChild = findDuplicates(state.toys || []).filter(row => row.kind === 'same_child_legacy_duplicate');
  if (remainingSameChild.length) throw new Error('restoreUnresolvedLegacyDuplicate');
  for (const round of state.rotationHistory || []) {
    // repairHistoricalReferences must remove or mark unresolved historical
    // pointers before this fatal validation pass.
    if ((round.toyIds || []).some(id => !ids.has(id))) throw new Error('restoreUnrepairedHistoricalReference');
    if (round.toyId && !ids.has(round.toyId)) throw new Error('restoreUnrepairedHistoricalReference');
  }
  const catalogKeys = new Set((catalog?.active || []).flatMap(row => [row.canonicalKey, ...(row.legacyCanonicalKeys || [])]).map(canonicalKey));
  const unresolvedWishlist = (state.wishlist || []).filter(item => {
    const key = canonicalKey(item.canonicalKey || item.catalogKey || item.catalogId);
    return !key || (catalogKeys.size && !catalogKeys.has(key) && !item.catalogSnapshot);
  });
  if (unresolvedWishlist.length) throw new Error('restoreOrphanWishlistReference');
  return { toyCount:ids.size, setGraph:true, legacyDuplicateCount:0, wishlistReferences:true };
}

export function repairHistoricalReferences(state, { legacyReferenceIndex = new Map(), reconciliation = {} } = {}) {
  const currentById = new Map((state.toys || []).map(toy => [toy.id, toy]));
  const currentByKey = new Map();
  for (const toy of state.toys || []) {
    for (const key of [toy.canonicalKey, ...(toy.legacyCanonicalKeys || [])].map(canonicalKey).filter(Boolean)) {
      // Do not guess when a legacy canonical identity maps to multiple current toys.
      if (currentByKey.has(key) && currentByKey.get(key).id !== toy.id) currentByKey.set(key, null);
      else currentByKey.set(key, toy);
    }
  }
  const idMap = new Map();
  for (const execution of reconciliation.mergeExecutions || []) {
    if (execution.status === 'merged' && execution.duplicateId && execution.primaryId) idMap.set(execution.duplicateId, execution.primaryId);
  }
  const diagnostics = []; let remapped = 0; let markedMissing = 0; let affectedRounds = 0;
  for (const round of state.rotationHistory || []) {
    const ids = Array.isArray(round.toyIds) ? round.toyIds : [];
    const repairedIds = []; const seen = new Set(); const missing = [];
    for (const originalId of ids) {
      const result = resolveHistoricalToyReference(originalId, currentById, currentByKey, idMap, legacyReferenceIndex);
      if (result.toyId) {
        if (!seen.has(result.toyId)) repairedIds.push(result.toyId);
        seen.add(result.toyId);
        if (result.toyId !== originalId) {
          remapped++;
          diagnostics.push({ originalToyId:originalId, remappedToyId:result.toyId, action:'remapped', reason:result.reason, historyEntryId:round.id || null, at:round.at || null });
        }
      } else {
        markedMissing++; missing.push(originalId);
        diagnostics.push({ originalToyId:originalId, remappedToyId:null, action:'marked_missing', reason:'historical_toy_missing', historyEntryId:round.id || null, at:round.at || null });
      }
    }
    let singular = null;
    if (round.toyId) singular = resolveHistoricalToyReference(round.toyId, currentById, currentByKey, idMap, legacyReferenceIndex);
    const changed = missing.length || ids.some((id, index) => repairedIds[index] !== id) || Boolean(round.toyId && singular?.toyId !== round.toyId);
    if (!changed) continue;
    affectedRounds++;
    round.toyIds = repairedIds;
    if (round.toyId) {
      if (singular?.toyId) {
        const originalSingularId = round.toyId;
        round.toyId = singular.toyId;
        if (singular.toyId !== originalSingularId) {
          remapped++;
          diagnostics.push({ originalToyId:originalSingularId, remappedToyId:singular.toyId, action:'remapped', reason:singular.reason, historyEntryId:round.id || null, at:round.at || null });
        }
      } else {
        const originalSingularId = round.toyId;
        missing.push(originalSingularId);
        markedMissing++;
        diagnostics.push({ originalToyId:originalSingularId, remappedToyId:null, action:'marked_missing', reason:'historical_toy_missing', historyEntryId:round.id || null, at:round.at || null });
        delete round.toyId;
      }
    }
    if (missing.length) {
      round.historicalReferenceStatus = 'historical_toy_missing';
      round.historicalMissingToyIds = [...new Set([...(round.historicalMissingToyIds || []), ...missing])];
    }
  }
  const summary = { remapped, markedMissing, affectedRounds, diagnostics };
  state.catalogState ||= {}; state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.restoreHistoricalReferenceRepair = { repairedAt:new Date().toISOString(), ...summary };
  return summary;
}

function resolveHistoricalToyReference(originalId, currentById, currentByKey, idMap, legacyReferenceIndex) {
  if (currentById.has(originalId)) return { toyId:originalId, reason:'current_toy_id' };
  const mergedId = idMap.get(originalId);
  if (mergedId && currentById.has(mergedId)) return { toyId:mergedId, reason:'merge_remap' };
  const keys = legacyReferenceIndex.get(String(originalId)) || [];
  const candidates = [...new Set(keys.map(key => currentByKey.get(canonicalKey(key))).filter(Boolean))];
  if (candidates.length === 1) return { toyId:candidates[0].id, reason:'legacy_canonical_identity' };
  return { toyId:null, reason:'historical_toy_missing' };
}

function buildLegacyReferenceIndex(toys) {
  const index = new Map();
  for (const toy of toys || []) {
    const keys = [toy.canonicalKey, toy.catalogKey, toy.catalogId, toy.key, ...(toy.legacyCanonicalKeys || [])].map(canonicalKey).filter(Boolean);
    const ids = [toy.id, toy.legacyId, toy.legacyToyId, toy.originalId, toy.userMetadata?.legacyId].filter(value => value != null).map(String);
    for (const id of ids) index.set(id, [...new Set([...(index.get(id) || []), ...keys])]);
  }
  return index;
}

function validateImageReferences(state, backupImages) {
  const backupKeys = new Set(Object.keys(backupImages || {}));
  for (const toy of state.toys || []) {
    const ref = toy.imageRef;
    if (!ref || ['placeholder','generated','remote'].includes(ref.kind)) continue;
    if (!['personal','catalog'].includes(ref.kind) || !ref.id) throw new Error('restoreInvalidImageReference');
    // Restore validates only durable reference shape and backup ownership. It
    // deliberately does not decode blobs, fetch remote URLs, or probe a CDN.
    const backupKey = `${ref.kind}:${ref.id}`;
    if (backupKeys.size && backupKeys.has(backupKey) && !backupImages[backupKey]) throw new Error('restoreMissingImageAsset');
  }
}

async function importBackupImages(images, repository, stage) {
  const entries = Object.entries(images).filter(([key, value]) => key && value);
  for (let index = 0; index < entries.length; index++) {
    const [key, dataUrl] = entries[index];
    const [kind, ...rest] = key.split(':'); const id = rest.join(':');
    if (kind === 'catalog') await repository.importCatalog(id, dataUrl);
    else if (kind === 'personal') await repository.importPersonal(id, dataUrl);
    else await repository.importPersonal(key, dataUrl); // v1 backup compatibility
    if (index % 3 === 2 || index === entries.length - 1) {
      stage('local_image_import_progress', { phase:'progress', completed:index + 1, total:entries.length });
      await yieldToUi();
    }
  }
}

function yieldToUi() { return new Promise(resolve => setTimeout(resolve, 0)); }

export function createRestoreTrace() {
  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const trace = { startedAt:new Date().toISOString(), stages:[], status:'running', latestStage:'started' };
  const now = () => Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt);
  const snapshot = () => ({ startedAt:trace.startedAt, status:trace.status, latestStage:trace.latestStage, completedAtMs:trace.completedAtMs, failedAtMs:trace.failedAtMs, error:trace.error, stages:trace.stages.map(stage => ({ ...stage })) });
  const publish = () => { globalThis.__TOY_ROTATION_RESTORE_TIMING__ = snapshot(); };
  trace.mark = (name, detail = {}) => {
    const atMs=now(); const previous=trace.stages.at(-1);
    trace.latestStage=name;
    trace.stages.push({ name, timestamp:new Date().toISOString(), atMs, sincePreviousMs:previous ? atMs - previous.atMs : atMs, success:detail.success !== false, detail });
    publish();
  };
  trace.snapshot = snapshot;
  trace.complete = () => { trace.status='complete'; trace.completedAtMs=now(); publish(); };
  trace.fail = error => { trace.status='failed'; trace.error=error?.message || 'restoreFailed'; trace.failedAtMs=now(); publish(); };
  publish(); return trace;
}
