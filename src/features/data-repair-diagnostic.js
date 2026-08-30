import { canonicalKey } from '../data/schema.js';
import { deriveExplicitChildren } from '../domain/set-service.js';

const CURRENT_STORE_KEY = 'toyRotation.cleanBaseline';
const LEGACY_STORE_KEYS = ['toyRotationV04', 'toyRotationV032', 'toyRotationV03', 'toyRotationV02'];
const LEGACY_TOMBSTONE_KEYS = [
  'toyRotationCatalogDeletedV0934', 'toyRotationHiddenCatalogKeysV0927',
  'toyRotationHiddenCatalogTombstonesV0929', 'toyRotationHiddenCatalogAuthoritativeV0930',
  'toyRotationCatalogHiddenV0933', 'toyRotationCatalogPendingHideV0933',
  'toyRotationCatalogOverridesV095'
];

// Diagnostic-only selectors. They do not participate in identity,
// reconciliation, restoration, or catalog rendering.
export function isBallDropDiagnosticRecord(record = {}) {
  const text = searchable(record);
  const key = canonicalKey(record.canonicalKey || record.catalogKey || record.key);
  return key === 'lovevery-inspector-1' || key === 'lovevery-inspector-part-1' ||
    text.includes('投球盒') || text.includes('ball drop box');
}

export function isMideerDinosaurParent(record = {}) {
  const text = searchable(record);
  const brand = String(record.brand || '').toLowerCase();
  const setKind = record.set?.kind || (record.isSet ? 'parent' : 'none');
  const productMatch = (text.includes('恐龙') || text.includes('dinosaur')) &&
    (text.includes('6合1') || text.includes('6 in 1') || text.includes('6-in-1') || text.includes('my first puzzle'));
  return brand === 'mideer' && setKind !== 'child' && productMatch;
}

export function diagnosticLifecycleSnapshot(state, phase, reason = '') {
  const toys = state?.toys || [];
  const ballDrop = toys.filter(isBallDropDiagnosticRecord);
  const parent = toys.find(isMideerDinosaurParent) || null;
  const children = parent ? toys.filter(toy => isRelatedChild(toy, parent)) : [];
  return {
    at:new Date().toISOString(), phase, reason,
    schemaVersion:state?.schemaVersion ?? null,
    totalToyRecords:toys.length,
    ballDropRecords:ballDrop.length,
    ballDropIds:ballDrop.map(toy => toy.id),
    mideerDinosaurParentRecords:parent ? 1 : 0,
    mideerDinosaurChildRecords:children.length,
    mideerDinosaurParentId:parent?.id || null,
    mideerDinosaurChildIds:children.map(toy => toy.id)
  };
}

export function buildDataRepairDiagnostic({ store, catalog, release, lifecycle = [], startupTrace = null, restoreTiming = null }) {
  const currentState = store.state;
  const currentToys = currentState.toys || [];
  const persistedState = parseStorage(CURRENT_STORE_KEY);
  const legacyStates = LEGACY_STORE_KEYS.map(key => ({ key, value:parseStorage(key) })).filter(entry => entry.value);
  const legacyToys = legacyStates.flatMap(entry => (entry.value.toys || []).map(record => ({ storageKey:entry.key, record })));
  const activeCatalog = catalog?.active || [];

  const ballCurrent = currentToys.filter(isBallDropDiagnosticRecord);
  const ballLegacy = legacyToys.filter(entry => isBallDropDiagnosticRecord(entry.record));
  const ballCatalog = activeCatalog.filter(isBallDropDiagnosticRecord);

  const currentParent = currentToys.find(isMideerDinosaurParent) || null;
  const persistedParent = (persistedState?.toys || []).find(isMideerDinosaurParent) || null;
  const legacyParents = legacyToys.filter(entry => isMideerDinosaurParent(entry.record));
  const catalogParent = activeCatalog.find(isMideerDinosaurParent) || null;
  const currentChildren = currentParent ? currentToys.filter(toy => isRelatedChild(toy, currentParent)) : [];
  const persistedChildren = persistedParent ? (persistedState?.toys || []).filter(toy => isRelatedChild(toy, persistedParent)) : [];
  const historicalChildren = legacyParents.flatMap(({ storageKey, record:parent }) => legacyToys
    .filter(entry => entry.storageKey === storageKey && isRelatedChild(entry.record, parent)));
  const childDefinitions = buildChildDefinitions(catalogParent, currentParent);
  const restoration = explainRestoration({
    parent:currentParent, currentChildren, childDefinitions,
    historicalChildren:historicalChildren.map(entry => entry.record),
    repairMarker:currentState.catalogState?.syncMetadata?.parentChildDataRepair
  });

  const syncMetadata = scrub(currentState.catalogState?.syncMetadata || {});
  const currentTombstones = currentState.catalogState?.tombstones || {};
  const legacyTombstones = LEGACY_TOMBSTONE_KEYS.map(key => ({ key, value:scrub(parseStorage(key)) })).filter(entry => entry.value);
  const relevantTombstones = Object.fromEntries(Object.entries(currentTombstones)
    .filter(([key, value]) => relevantIdentityText(key, value))
    .map(([key, value]) => [key, scrub(value)]));

  const persistenceSnapshot = diagnosticLifecycleSnapshot(persistedState || {}, 'persistence_readback', CURRENT_STORE_KEY);
  const currentSnapshot = diagnosticLifecycleSnapshot(currentState, 'export_current_store', 'administrator_export');

  return scrub({
    format:'toy-rotation-data-repair-diagnostic',
    diagnosticVersion:1,
    release:release || null,
    exportedAt:new Date().toISOString(),
    safety:{ includesImageBlobs:false, mutatesAppData:false, runsRepairAlgorithms:false },
    ballDropBox:{
      currentRecords:ballCurrent.map(recordProjection),
      persistedRecords:(persistedState?.toys || []).filter(isBallDropDiagnosticRecord).map(recordProjection),
      legacyRecords:ballLegacy.map(entry => ({ storageKey:entry.storageKey, ...recordProjection(entry.record) })),
      catalogRecords:ballCatalog.map(recordProjection),
      relevantTombstones,
      migrationMarkers:syncMetadata,
      mergeDiagnostics:collectMergeDiagnostics([...ballCurrent, ...ballLegacy.map(entry => entry.record)]),
      countComparison:{
        legacy:ballLegacy.length,
        currentStore:ballCurrent.length,
        persistedStore:persistenceSnapshot.ballDropRecords,
        lifecycle:(lifecycle || []).map(entry => ({ phase:entry.phase, reason:entry.reason, at:entry.at, count:entry.ballDropRecords, ids:entry.ballDropIds }))
      }
    },
    mideerDinosaurSixInOne:{
      currentParent:currentParent ? fullRecord(currentParent) : null,
      persistedParent:persistedParent ? fullRecord(persistedParent) : null,
      currentChildRecords:currentChildren.map(fullRecord),
      persistedChildRecords:persistedChildren.map(fullRecord),
      historicalParents:legacyParents.map(entry => ({ storageKey:entry.storageKey, record:fullRecord(entry.record) })),
      historicalChildRecords:historicalChildren.map(entry => ({ storageKey:entry.storageKey, record:fullRecord(entry.record) })),
      catalogSeedParent:catalogParent ? fullRecord(catalogParent) : null,
      catalogSeedChildDefinitions:childDefinitions.map(fullRecord),
      deletedOrTombstonedChildReferences:collectDeletedChildReferences({ currentState, legacyTombstones, parent:currentParent || catalogParent, childDefinitions }),
      restorationEligibility:restoration
    },
    migrationLifecycle:{
      recordedRuntimeStages:[...(lifecycle || []), persistenceSnapshot, currentSnapshot],
      currentSchemaVersion:currentState.schemaVersion,
      currentSyncMetadata:syncMetadata,
      persistedSyncMetadata:scrub(persistedState?.catalogState?.syncMetadata || {}),
      storageSnapshots:[
        storageSummary(CURRENT_STORE_KEY, persistedState),
        ...legacyStates.map(entry => storageSummary(entry.key, entry.value))
      ],
      interpretation:{
        ballDropReappearedStage:findIncreaseStage(lifecycle, 'ballDropRecords'),
        mideerChildrenDisappearedStage:findDecreaseStage(lifecycle, 'mideerDinosaurChildRecords'),
        storeMatchesPersistence:currentSnapshot.totalToyRecords === persistenceSnapshot.totalToyRecords &&
          currentSnapshot.ballDropRecords === persistenceSnapshot.ballDropRecords &&
          currentSnapshot.mideerDinosaurChildRecords === persistenceSnapshot.mideerDinosaurChildRecords
      }
    },
    startupTiming:scrub(startupTrace),
    restoreTiming:scrub(restoreTiming)
  });
}

function recordProjection(record = {}) {
  return {
    id:record.id || null, legacyId:record.legacyId || record.legacyToyId || null,
    canonicalKey:record.canonicalKey || record.catalogKey || null,
    legacyCanonicalKey:record.legacyCanonicalKey || null,
    legacyCanonicalKeys:record.legacyCanonicalKeys || [],
    brand:record.brand || null, name:record.name || record.productName || null,
    nameZh:record.nameZh || record.names?.zh || null, nameEn:record.nameEn || record.names?.en || null,
    aliases:record.aliases || [], catalogId:record.catalogId || null,
    parentSetId:record.parentSetId || record.set?.parentId || null,
    parentCanonicalKey:record.parentCanonicalKey || record.set?.parentCanonicalKey || null,
    childId:record.childId || (record.set?.kind === 'child' ? record.id : null),
    childCanonicalKey:record.childCanonicalKey || (record.set?.kind === 'child' ? record.canonicalKey : null),
    set:record.set || null,
    setFlags:{ isSet:!!record.isSet, isSetContainer:!!record.isSetContainer, isSetChild:!!record.isSetChild, kind:record.set?.kind || null, rotationMode:record.set?.rotationMode || null },
    imageRef:record.imageRef || null,
    imageSource:record.imageSource || record.imageRef?.imageSource || record.imageRef?.source || record.imageRef?.kind || null,
    migrationMarkers:record.migrationMarkers || record.migration || null,
    reconciliationMarkers:record.reconciliationMarkers || null,
    mergeDiagnostics:record.mergeDiagnostics || [],
    tombstone:record.tombstone || null, deleted:record.deleted === true, deletedAt:record.deletedAt || null,
    record:fullRecord(record)
  };
}

function fullRecord(record) { return scrub(structuredClone(record)); }

function explainRestoration({ parent, currentChildren, childDefinitions, historicalChildren, repairMarker }) {
  if (!parent) return { decision:'skipped', reason:'parent_not_found', eligible:false };
  const expectedKeys = childDefinitions.map(child => canonicalKey(child.canonicalKey));
  const currentKeys = currentChildren.map(child => canonicalKey(child.canonicalKey));
  const missingKeys = expectedKeys.filter(key => !currentKeys.includes(key));
  const intentionalKeys = (parent.set?.intentionalRemovedChildKeys || []).map(canonicalKey);
  const eligibleKeys = missingKeys.filter(key => !intentionalKeys.includes(key));
  const ghostChildIds = (parent.set?.childIds || []).filter(id => !currentChildren.some(child => child.id === id));
  const legacyEvidence = historicalChildren.map(child => ({ id:child.id || null, canonicalKey:child.canonicalKey || child.catalogKey || null, set:child.set || null }));
  const matchingRepair = (repairMarker?.repairs || []).find(item => item.parentId === parent.id || canonicalKey(item.parentCanonicalKey) === canonicalKey(parent.canonicalKey));
  let decision = 'eligible_but_not_recorded'; let reason = 'stable_plan_and_historical_proof_present';
  if (childDefinitions.length < 2) { decision='skipped'; reason='no_stable_multi_child_plan'; }
  else if (!missingKeys.length) { decision='not_needed'; reason='all_expected_children_present'; }
  else if (!eligibleKeys.length) { decision='skipped'; reason='all_missing_children_marked_intentionally_removed'; }
  else if (!ghostChildIds.length && !legacyEvidence.length) { decision='skipped'; reason='no_stale_child_ids_or_legacy_ownership_proof'; }
  else if (matchingRepair?.restored > 0) { decision='executed'; reason='parentChildDataRepair_marker_records_restoration'; }
  return {
    eligible:['eligible_but_not_recorded','executed'].includes(decision), decision, reason,
    expectedChildKeys:expectedKeys, currentChildKeys:currentKeys, missingChildKeys:missingKeys,
    intentionalRemovedChildKeys:intentionalKeys, eligibleMissingChildKeys:eligibleKeys,
    ghostChildIds, legacyOwnershipEvidence:legacyEvidence, recordedRepair:matchingRepair || null,
    guardSource:'read-only diagnostic reproduction of R10 restoration guards'
  };
}

function buildChildDefinitions(catalogParent, currentParent) {
  const parent = currentParent || catalogParent;
  const definition = catalogParent || currentParent;
  if (!parent || !definition) return [];
  const probe = { ...parent, set:{ ...(parent.set || {}), kind:'parent', rotationMode:'split' } };
  return deriveExplicitChildren(probe, definition).map((child, index) => ({
    ...child, canonicalKey:child.canonicalKey || `${parent.canonicalKey}:part-${index + 1}`,
    set:{ ...(child.set || {}), kind:'child', parentId:parent.id, parentCanonicalKey:parent.canonicalKey, partIndex:index + 1, rotationMode:'split' }
  }));
}

function collectDeletedChildReferences({ currentState, legacyTombstones, parent, childDefinitions }) {
  const keys = new Set([parent?.canonicalKey, ...(childDefinitions || []).map(child => child.canonicalKey)].map(canonicalKey).filter(Boolean));
  const current = Object.entries(currentState.catalogState?.tombstones || {}).filter(([key]) => keys.has(canonicalKey(key)));
  const intentional = parent?.set?.intentionalRemovedChildKeys || [];
  return { currentCatalogTombstones:Object.fromEntries(current), legacyTombstoneStores:legacyTombstones, intentionalRemovedChildKeys:intentional };
}

function collectMergeDiagnostics(records) {
  return records.map(record => ({ id:record.id || null, canonicalKey:record.canonicalKey || null, diagnostics:record.mergeDiagnostics || [], migrationMarkers:record.migrationMarkers || null })).filter(item => item.diagnostics.length || item.migrationMarkers);
}

function storageSummary(key, state) {
  if (!state) return { key, present:false };
  return { key, present:true, ...diagnosticLifecycleSnapshot(state, 'storage_snapshot', key), syncMetadata:scrub(state.catalogState?.syncMetadata || {}) };
}

function findIncreaseStage(lifecycle, field) {
  for (let index=1; index<(lifecycle || []).length; index++) {
    if ((lifecycle[index][field] || 0) > (lifecycle[index - 1][field] || 0)) return { before:lifecycle[index - 1], after:lifecycle[index] };
  }
  return null;
}

function findDecreaseStage(lifecycle, field) {
  for (let index=1; index<(lifecycle || []).length; index++) {
    if ((lifecycle[index][field] || 0) < (lifecycle[index - 1][field] || 0)) return { before:lifecycle[index - 1], after:lifecycle[index] };
  }
  return null;
}

function isRelatedChild(child = {}, parent = {}) {
  if ((child.set?.kind || '') !== 'child') return false;
  if (child.set?.parentId && child.set.parentId === parent.id) return true;
  if (canonicalKey(child.set?.parentCanonicalKey) === canonicalKey(parent.canonicalKey)) return true;
  if ((child.set?.legacyParentIds || []).includes(parent.id)) return true;
  return canonicalKey(child.set?.setName) === canonicalKey(parent.productName || parent.name);
}

function searchable(record = {}) {
  return [record.canonicalKey, record.catalogKey, record.productName, record.name, record.nameZh, record.nameEn,
    record.names?.zh, record.names?.en, ...(record.aliases || [])].filter(Boolean).join(' ').normalize('NFKC').toLowerCase();
}

function relevantIdentityText(key, value) {
  const text = `${key} ${JSON.stringify(value || {})}`.toLowerCase();
  return text.includes('lovevery-inspector-1') || text.includes('投球盒') || text.includes('ball drop') ||
    text.includes('mideer') && (text.includes('dinosaur') || text.includes('恐龙'));
}

function parseStorage(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (error) { return { parseError:String(error?.message || error) }; }
}

function scrub(value, key = '') {
  if (value == null || typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (/^(data:|blob:)/i.test(value) || value.length > 20000) return '<omitted-image-or-large-payload>';
    return value;
  }
  if (Array.isArray(value)) return value.map(item => scrub(item, key));
  if (typeof value !== 'object') return String(value);
  const output = {};
  for (const [childKey, childValue] of Object.entries(value)) {
    if (/(blob|imageData|photoData|dataUrl|base64|rawImage|rawBytes)/i.test(childKey)) { output[childKey] = '<omitted-image-payload>'; continue; }
    output[childKey] = scrub(childValue, childKey);
  }
  return output;
}
