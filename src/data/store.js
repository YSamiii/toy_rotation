import { SCHEMA_VERSION, canonicalKey, emptyState, normalizeToy, normalizeWishlistItem } from './schema.js';
import { reconcilePersonalDuplicates, sameCatalogIdentity } from '../domain/identity-service.js';

const LEGACY_KEYS = ['toyRotationV04','toyRotationV032','toyRotationV03','toyRotationV02'];
export const STORE_KEY = 'toyRotation.cleanBaseline';
export const STORE_SHADOW_KEY = 'toyRotation.cleanBaseline.lastKnownGood';
export const STORE_RECOVERY_STAGING_KEY = 'toyRotation.cleanBaseline.recoveryStaging';
export const STORE_COMMIT_STAGING_KEY = 'toyRotation.cleanBaseline.commitStaging';
export const STORE_SNAPSHOT_KEYS = Object.freeze([
  'toyRotation.cleanBaseline.snapshot-1',
  'toyRotation.cleanBaseline.snapshot-2',
  'toyRotation.cleanBaseline.snapshot-3'
]);
export const STORE_HEALTH_KEY = 'toyRotation.cleanBaseline.persistenceHealth';

// Deliberately conservative: a legacy record is removable only when every
// user-owned component is already represented by the canonical state.
export function classifyLegacyRedundancy(canonical = {}, legacy = {}) {
  const same = value => JSON.stringify(value ?? null);
  const fields=['toys','wishlist','profile','rotationHistory','settings','drafts'];
  const mismatches=fields.filter(field=>same(canonical[field])!==same(legacy[field]));
  const canonicalImages=new Set((canonical.toys||[]).map(toy=>JSON.stringify(toy.imageRef||null)));
  const legacyImages=(legacy.toys||[]).map(toy=>JSON.stringify(toy.imageRef||null));
  if (legacyImages.some(ref=>!canonicalImages.has(ref))) mismatches.push('imageRefs');
  const extra=Object.keys(legacy).filter(key=>!['schemaVersion',...fields].includes(key));
  if (extra.some(key=>legacy[key] != null)) mismatches.push('legacyMetadata');
  return mismatches.length ? { classification: mismatches.length === 1 ? 'PARTIALLY_REDUNDANT' : 'HAS_UNIQUE_DATA', safeToRemove:false, mismatches } : { classification:'SAFE_TO_REMOVE', safeToRemove:true, mismatches:[] };
}

// A missing key is a legitimate first run. A storage exception or malformed
// JSON is not.  Keeping those outcomes distinct prevents boot from replacing a
// real library with an empty default snapshot after a failed local read.
function readStoredJson(key, storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem?.(key);
    if (raw == null || raw === '') return { key, status:'missing', raw:null, value:null };
    try { return { key, status:'valid', raw, value:JSON.parse(raw) }; }
    catch (error) { return { key, status:'malformed', raw, value:null, error:String(error?.message || error) }; }
  } catch (error) { return { key, status:'unavailable', raw:null, value:null, error:String(error?.message || error) }; }
}
function stateCounts(state) {
  return {
    toys:Array.isArray(state?.toys) ? state.toys.length : 0,
    profile:state?.profile?.childName || state?.profile?.childBirthDate ? 1 : 0,
    wishlist:Array.isArray(state?.wishlist) ? state.wishlist.length : 0,
    rotationHistory:Array.isArray(state?.rotationHistory) ? state.rotationHistory.length : 0,
    drafts:Array.isArray(state?.drafts) ? state.drafts.length : 0
  };
}
function populated(state) { const counts=stateCounts(state); return counts.toys > 0 || counts.profile > 0 || counts.wishlist > 0 || counts.rotationHistory > 0; }
function hydrationLostRawData(raw, hydrated) {
  const before=stateCounts(raw), after=stateCounts(hydrated);
  return (before.toys > 0 && after.toys === 0) || (before.profile > 0 && after.profile === 0) || (before.rotationHistory > 0 && after.rotationHistory === 0);
}
function usableState(value) { return value && typeof value === 'object' && (Array.isArray(value.toys) || value.schemaVersion != null || value.profile != null || value.settings != null); }
function validatePersistableState(state) {
  if (!usableState(state)) throw new Error('persistence_invalid_state');
  const serialized=JSON.stringify(state);
  const parsed=JSON.parse(serialized);
  if (!usableState(parsed) || hydrationLostRawData(state, parsed)) throw new Error('persistence_validation_failed');
  return { serialized, parsed };
}

// LocalStorage has no multi-key transaction. This protocol therefore never
// destroys the last readable current state before a fully validated staging
// payload exists, and keeps three independent last-known-good generations.
function persistState(next, storage = globalThis.localStorage) {
  const { serialized, parsed }=validatePersistableState(next);
  const before=readStoredJson(STORE_KEY, storage);
  const generation=Date.now();
  const staging={ generation, committedAt:new Date().toISOString(), state:parsed, counts:stateCounts(parsed) };
  storage.setItem(STORE_COMMIT_STAGING_KEY, JSON.stringify(staging));
  const staged=readStoredJson(STORE_COMMIT_STAGING_KEY, storage);
  if (staged.status !== 'valid' || staged.value?.generation !== generation || !usableState(staged.value?.state) || hydrationLostRawData(parsed, staged.value.state)) throw new Error('persistence_staging_readback_failed');

  // Rotate only validated snapshots. Never promote malformed state into the
  // recovery ring. Existing current becomes snapshot-1 before current moves.
  if (before.status === 'valid' && usableState(before.value)) {
    const snapshot2=readStoredJson(STORE_SNAPSHOT_KEYS[1], storage);
    const snapshot1=readStoredJson(STORE_SNAPSHOT_KEYS[0], storage);
    if (snapshot2.status === 'valid' && usableState(snapshot2.value)) storage.setItem(STORE_SNAPSHOT_KEYS[2], snapshot2.raw);
    if (snapshot1.status === 'valid' && usableState(snapshot1.value)) storage.setItem(STORE_SNAPSHOT_KEYS[1], snapshot1.raw);
    storage.setItem(STORE_SNAPSHOT_KEYS[0], before.raw);
    if (populated(before.value)) storage.setItem(STORE_SHADOW_KEY, before.raw);
  }
  storage.setItem(STORE_KEY, serialized);
  const verified=readStoredJson(STORE_KEY, storage);
  if (verified.status !== 'valid' || !usableState(verified.value) || hydrationLostRawData(parsed, verified.value)) throw new Error('persistence_current_readback_failed');
  try {
    storage.setItem(STORE_HEALTH_KEY, JSON.stringify({
      lastSuccessfulPersistAt:new Date().toISOString(), lastPersistedToyCount:stateCounts(parsed).toys,
      lastSnapshotAt:new Date().toISOString(), lastSnapshotToyCount:stateCounts(before.value).toys,
      persistenceHealth:'healthy', activeSnapshotGeneration:generation
    }));
  } catch { /* state is already verified; health telemetry never invalidates it */ }
}

export class AppStore {
  #state; #listeners = new Set(); #revision = 0; #persistence; #diagnostic=null; #save;
  constructor(state, persistence = { writable:true, status:'ready', diagnostic:null }, { safeSave = persistState } = {}) { this.#state = state; this.#persistence = persistence; this.#save=safeSave; }
  get state() { return this.#state; }
  get revision() { return this.#revision; }
  get persistence() { return structuredClone(this.#persistence); }
  get canPersist() { return this.#persistence.writable === true; }
  attemptSafeQuotaRecovery() {
    const diagnostic=this.#persistence.diagnostic;
    if (this.#persistence.status !== 'safe_commit_failure' || diagnostic?.classification?.code !== 'Q') return { ok:false, reason:'not_quota_recovery' };
    const storage=globalThis.localStorage;
    // Only rebuildable caches and a stale write staging record are candidates;
    // canonical, shadow, snapshots, overrides, legacy data and IndexedDB are untouched.
    for (const key of [STORE_COMMIT_STAGING_KEY,'toyRotationRemoteCatalogV0115','toyRotationRemoteCatalogMetaV0115','toyRotationRemoteCatalogNewKeysV0115','toyRotation.startupDiagnostic']) storage.removeItem(key);
    try { this.#save(this.#state); this.#persistence={ writable:true,status:'ready',diagnostic:null }; return { ok:true }; }
    catch (error) { return { ok:false, reason:'quota_persists', error:String(error?.message || error) }; }
  }
  attachDiagnostic(diagnostic) { this.#diagnostic=diagnostic; }
  subscribe(listener) { this.#listeners.add(listener); return () => this.#listeners.delete(listener); }
  update(mutator, reason = 'update') { const before=this.#state; try { const next = structuredClone(before); mutator(next); next.schemaVersion = SCHEMA_VERSION; if (!this.canPersist) throw new Error('storage_recovery_required'); this.#diagnostic?.storeUpdate(reason,before,next); this.#save(next); this.#state = next; this.#revision++; for (const listener of this.#listeners) { listener(next, reason); this.#diagnostic?.subscriberFired(reason,next); } } catch(error) { this.#diagnostic?.storeUpdateFailed(reason,before,error); throw error; } }
  replace(next, reason = 'replace') { const prepared=runMigrations(next); if (!this.canPersist) throw new Error('storage_recovery_required'); persistState(prepared); this.#state = prepared; this.#revision++; for (const listener of this.#listeners) listener(this.#state, reason); }
  // Restore uses this path so a failed persistence write cannot leave memory
  // and durable storage on different versions of the user's database.
  commit(next, reason = 'commit', { onStage = () => {} } = {}) {
    onStage('commit_prepare_start');
    const prepared = runMigrations(next);
    onStage('commit_prepare_end', { schemaVersion:prepared.schemaVersion, toyCount:(prepared.toys || []).length });
    onStage('local_storage_persistence_start');
    if (!this.canPersist) throw new Error('storage_recovery_required');
    this.#diagnostic?.storeUpdate(reason,this.#state,prepared); this.#save(prepared);
    onStage('local_storage_persistence_end');
    onStage('store_state_replace_start');
    this.#state = prepared;
    this.#revision++;
    onStage('store_state_replace_end', { revision:this.#revision });
    onStage('ui_refresh_start', { listeners:this.#listeners.size });
    for (const listener of this.#listeners) { listener(this.#state, reason); this.#diagnostic?.subscriberFired(reason,this.#state); }
    onStage('ui_refresh_end');
  }
}

export function bootStore({ onStage = () => {}, diagnosticMode = globalThis.window?.TOY_ROTATION_CONFIG?.PERSISTENCE_DIAGNOSTIC_MODE === true } = {}) {
  onStage('store_persistence_read_start');
  const current = readStoredJson(STORE_KEY);
  const legacyRecords = LEGACY_KEYS.map(key => readStoredJson(key));
  const legacy = legacyRecords.find(record => record.status === 'valid' && usableState(record.value) && populated(record.value)) || null;
  onStage('store_persistence_read_end', { status:current.status, existing:current.status === 'valid', legacyKey:legacy?.key || null });

  // Never turn a read failure into a first-run write.  The rendered recovery
  // state is intentionally non-persistent until the original storage can be
  // inspected or restored explicitly.
  if (current.status === 'malformed' || current.status === 'unavailable' || (current.status === 'valid' && !usableState(current.value))) {
    const state=emptyState();
    const diagnostic=buildPersistenceSnapshot({ current, legacyRecords, mode:current.status === 'valid' ? 'safe_invalid_shape' : 'safe_read_failure' });
    onStage('store_persistence_safe_mode', diagnostic);
    return new AppStore(state, { writable:false, status:'safe_read_failure', diagnostic, recovery:null });
  }
  if (current.status === 'missing' && legacyRecords.some(record => record.status === 'malformed' || record.status === 'unavailable')) {
    const state=emptyState();
    const diagnostic=buildPersistenceSnapshot({ current, legacyRecords, mode:'safe_legacy_read_failure' });
    onStage('store_persistence_safe_mode', diagnostic);
    return new AppStore(state, { writable:false, status:'safe_legacy_read_failure', diagnostic, recovery:null });
  }

  onStage('migrations_start');
  let state;
  let recovery=null;
  try {
    const currentLooksEmpty=current.status === 'valid' && usableState(current.value) && !populated(current.value);
    if (current.status === 'valid' && usableState(current.value) && !(currentLooksEmpty && legacy)) state=runMigrations(current.value);
    else if (legacy) { state=runMigrations(legacy.value); recovery={ sourceKey:legacy.key, reason:currentLooksEmpty ? 'legacy_populated_current_empty' : 'legacy_populated_current_missing' }; }
    // First run is the *only* legitimate empty write. It is guarded by a
    // confirmed missing primary key and readable legacy probes.
    else if (current.status === 'missing') state=emptyState();
    else throw new Error('persistence_unknown_source');
  } catch (error) {
    const diagnostic=buildPersistenceSnapshot({ current, legacyRecords, mode:'safe_migration_failure' });
    onStage('store_persistence_safe_mode', { ...diagnostic, error:String(error?.message || error) });
    return new AppStore(emptyState(), { writable:false, status:'safe_migration_failure', diagnostic:{ ...diagnostic, error:String(error?.message || error) }, recovery:null });
  }
  const rawSource=recovery ? legacy?.value : current.value;
  if (rawSource && hydrationLostRawData(rawSource, state)) {
    const diagnostic=buildPersistenceSnapshot({ current, legacyRecords, mode:'safe_hydration_loss', hydratedState:state });
    onStage('store_persistence_safe_mode', diagnostic);
    return new AppStore(state, { writable:false, status:'safe_hydration_loss', diagnostic, recovery:null });
  }
  onStage('migrations_end', { schemaVersion:state.schemaVersion });
  if (diagnosticMode) {
    const diagnostic=buildPersistenceSnapshot({ current, legacyRecords, mode:recovery ? 'diagnostic_staged_recovery' : 'diagnostic_read_only', hydratedState:state, recovery });
    onStage('store_persistence_diagnostic_mode', diagnostic);
    return new AppStore(state, { writable:false, status:recovery ? 'diagnostic_staged_recovery' : 'diagnostic_read_only', diagnostic, recovery, diagnosticMode:true });
  }
  // A normal migration is safe to persist only after a valid source was read,
  // or after a populated legacy state was staged.  First run still writes one
  // default state; it never overwrites a malformed/unavailable source.
  try { persistState(state); }
  catch (error) {
    const diagnostic=buildPersistenceSnapshot({ current, legacyRecords, mode:'safe_commit_failure', hydratedState:state, recovery });
    diagnostic.classification={ code:'Q', label:'quota_write_failure', detail:'canonical_valid_but_write_failed' };
    onStage('store_persistence_safe_mode', { ...diagnostic, error:String(error?.message || error) });
    return new AppStore(state, { writable:false, status:'safe_commit_failure', diagnostic:{ ...diagnostic, error:String(error?.message || error) }, recovery:null });
  }
  const diagnostic=buildPersistenceSnapshot({ current, legacyRecords, mode:recovery ? 'legacy_recovered' : 'ready', hydratedState:state });
  return new AppStore(state, { writable:true, status:recovery ? 'legacy_recovered' : 'ready', recovery, diagnostic });
}

// Explicit, user-confirmed clean start. It preserves every legacy/current
// artifact and only creates a new current snapshot after the caller has shown
// confirmation. This is never invoked during startup.
export function startFreshStore({ storage = globalThis.localStorage } = {}) {
  const current=readStoredJson(STORE_KEY, storage);
  const snapshot={ capturedAt:new Date().toISOString(), current:{ status:current.status, raw:current.raw }, legacy:LEGACY_KEYS.map(key=>{ const record=readStoredJson(key, storage); return { key, status:record.status, raw:record.raw }; }) };
  try { storage.setItem(`toyRotation.cleanBaseline.preFresh.${Date.now()}`, JSON.stringify(snapshot)); } catch {}
  const state=emptyState();
  persistState(state, storage);
  return state;
}

export function buildPersistenceSnapshot({ current = readStoredJson(STORE_KEY), legacyRecords = LEGACY_KEYS.map(key => readStoredJson(key)), mode='ready', hydratedState=null, recovery=null } = {}) {
  const shadow=readStoredJson(STORE_SHADOW_KEY);
  const staging=readStoredJson(STORE_RECOVERY_STAGING_KEY);
  const classification=classifyPersistence({ current, legacyRecords, hydratedState, recovery });
  return {
    diagnosticVersion:1,
    capturedAt:new Date().toISOString(),
    currentOrigin:globalThis.location?.origin || null,
    persistence:{ key:STORE_KEY, status:current.status, rawBytes:current.raw?.length || 0, counts:stateCounts(current.value), error:current.error || null },
    shadow:{ key:STORE_SHADOW_KEY, status:shadow.status, rawBytes:shadow.raw?.length || 0, counts:stateCounts(shadow.value), error:shadow.error || null },
    recoveryStaging:{ key:STORE_RECOVERY_STAGING_KEY, status:staging.status, sourceKey:staging.value?.sourceKey || null, stagedAt:staging.value?.stagedAt || null, counts:stateCounts(staging.value?.state), error:staging.error || null },
    legacy:legacyRecords.map(record => ({ key:record.key, status:record.status, rawBytes:record.raw?.length || 0, counts:stateCounts(record.value), error:record.error || null })),
    hydrated:hydratedState ? { counts:stateCounts(hydratedState), schemaVersion:hydratedState.schemaVersion || null } : null,
    recovery,
    recoveryExecuted:staging.status === 'valid' && !!staging.value?.sourceKey && current.status === 'valid' && populated(current.value),
    classification,
    mode
  };
}

function classifyPersistence({ current, legacyRecords, hydratedState, recovery }) {
  const legacy=legacyRecords.find(record=>record.status === 'valid' && usableState(record.value) && populated(record.value));
  if (recovery || (current.status === 'missing' || (current.status === 'valid' && !populated(current.value))) && legacy) {
    return { code:'B', label:'legacy_data_detected_current_empty', actionable:true, sourceKey:legacy?.key || recovery?.sourceKey || null };
  }
  if (current.status === 'valid' && usableState(current.value) && populated(current.value)) {
    if (hydratedState && hydrationLostRawData(current.value, hydratedState)) return { code:'A', label:'raw_data_present_hydration_loss', actionable:false, sourceKey:STORE_KEY };
    return { code:'A', label:'raw_data_present', actionable:false, sourceKey:STORE_KEY };
  }
  return { code:'C', label:'no_readable_populated_local_state', actionable:false, sourceKey:null };
}

// This is intentionally the only recovery write path used by the diagnostic
// build.  It first writes a detached staging record, validates the staged
// payload, and never deletes the source legacy key.  A second invocation sees
// the populated current state and does nothing.
export function applyDetectedLegacyRecovery({ storage = globalThis.localStorage } = {}) {
  const current=readStoredJson(STORE_KEY, storage);
  const legacyRecords=LEGACY_KEYS.map(key=>readStoredJson(key, storage));
  const legacy=legacyRecords.find(record=>record.status === 'valid' && usableState(record.value) && populated(record.value));
  if (current.status === 'valid' && usableState(current.value) && populated(current.value)) return { ok:true, status:'already_recovered', recovery:null };
  if (!legacy) return { ok:false, status:'no_safe_legacy_source' };
  const staged=runMigrations(legacy.value);
  if (hydrationLostRawData(legacy.value, staged) || !populated(staged)) return { ok:false, status:'staging_validation_failed' };
  const staging={ sourceKey:legacy.key, stagedAt:new Date().toISOString(), state:staged, counts:stateCounts(staged) };
  storage.setItem(STORE_RECOVERY_STAGING_KEY, JSON.stringify(staging));
  const verified=readStoredJson(STORE_RECOVERY_STAGING_KEY, storage);
  if (verified.status !== 'valid' || !usableState(verified.value?.state) || hydrationLostRawData(legacy.value, verified.value.state)) return { ok:false, status:'staging_readback_failed' };
  persistState(verified.value.state, storage);
  const materialized=readStoredJson(STORE_KEY, storage);
  if (materialized.status !== 'valid' || hydrationLostRawData(verified.value.state, materialized.value)) return { ok:false, status:'materialization_validation_failed' };
  return { ok:true, status:'recovered', recovery:{ sourceKey:legacy.key, reason:'legacy_populated_current_empty' }, counts:stateCounts(materialized.value) };
}

export function runMigrations(input) {
  let state = structuredClone(input || emptyState());
  if ((state.schemaVersion || 0) < 1) state = migrateV1(state);
  if ((state.schemaVersion || 0) < 2) state = migrateV2(state);
  if ((state.schemaVersion || 0) < 3) state = migrateV3(state);
  if ((state.schemaVersion || 0) < 4) state = migrateV4(state);
  if ((state.schemaVersion || 0) < 5) state = migrateV5(state);
  if ((state.schemaVersion || 0) < 6) state = migrateV6(state);
  if ((state.schemaVersion || 0) < 7) state = migrateV7(state);
  if ((state.schemaVersion || 0) < 8) state = migrateV8(state);
  if ((state.schemaVersion || 0) < 9) state = migrateV9(state);
  if ((state.schemaVersion || 0) < 10) state = migrateV10(state);
  if ((state.schemaVersion || 0) < 11) state = migrateV11(state);
  if ((state.schemaVersion || 0) < 12) state = migrateV12(state);
  return state;
}

function migrateLegacy() {
  const legacy = LEGACY_KEYS.map(key => parse(localStorage.getItem(key))).find(Boolean);
  return runMigrations(migrateV1(legacy || emptyState()));
}
function migrateV1(legacy) {
  const base = emptyState();
  const settings = legacy.settings || {};
  return {
    ...base, schemaVersion: 1,
    settings: { ...base.settings, language: settings.language || 'system', theme: settings.theme || 'system', rotationSize: Number(settings.rotationSize || 6), rotationDays: Number(settings.rotationDays || 7), onboardingDone: !!settings.onboardingDone },
    profile: { childName: settings.childName || '', childBirthDate: settings.childBirthDate || '' },
    toys: (legacy.toys || []).map(normalizeToy), drafts: legacy.drafts || [], wishlist: (legacy.wishlist || []).map(normalizeWishlistItem),
    rotationHistory: legacy.rotationHistory || legacy.history || [], lastRotationAt: legacy.lastRotationAt || null,
    catalogState: { tombstones: migrateTombstones(), adminEdits: parse(localStorage.getItem('toyRotationCatalogOverridesV095')) || {}, ...migrateCatalogImageRefs(), syncMetadata: {} }
  };
}
function migrateV3(state) {
  const base = emptyState();
  const settings = state.settings || {};
  const rotationDays = Math.max(1, Math.min(90, Number(settings.rotationDays) || base.settings.rotationDays));
  const rotationSize = Math.max(1, Math.min(50, Number(settings.rotationSize) || base.settings.rotationSize));
  return { ...state, schemaVersion: 3, settings:{ ...base.settings, ...settings, rotationDays, rotationSize }, profile:{ ...base.profile, ...(state.profile || {}) }, lastRotationAt: state.lastRotationAt || state.rotationHistory?.[0]?.at || null, catalogState:{ ...base.catalogState, ...(state.catalogState || {}), imageRefsByKey: state.catalogState?.imageRefsByKey || migrateCatalogImageRefs().imageRefsByKey } };
}
function migrateV2(state) {
  const base = emptyState();
  const existingCatalog = state.catalogState || {};
  const tombstones = Object.fromEntries(Object.entries(existingCatalog.tombstones || {}).map(([key, value]) => [String(key), typeof value === 'object' ? value : { deletedAt: new Date().toISOString(), migrated: true }]));
  return {
    ...base,
    ...state,
    schemaVersion: 2,
    settings: { ...base.settings, ...(state.settings || {}) },
    profile: { ...base.profile, childName:state.profile?.childName ?? state.settings?.childName ?? '', childBirthDate:state.profile?.childBirthDate ?? state.settings?.childBirthDate ?? '', ...(state.profile || {}) },
    toys: (state.toys || []).map(normalizeToy),
    wishlist: (state.wishlist || []).map(normalizeWishlistItem),
    drafts: state.drafts || [],
    rotationHistory: state.rotationHistory || [],
    catalogState: { tombstones, adminEdits: existingCatalog.adminEdits || {}, imageRefsByKey: existingCatalog.imageRefsByKey || migrateCatalogImageRefs().imageRefsByKey, imageRefsByIdentity: existingCatalog.imageRefsByIdentity || migrateCatalogImageRefs().imageRefsByIdentity, syncMetadata: existingCatalog.syncMetadata || {} }
  };
}
function migrateV4(state) {
  const base = emptyState();
  const migratedImages = migrateCatalogImageRefs();
  const existing = state.catalogState || {};
  return { ...state, schemaVersion:4, catalogState:{ ...base.catalogState, ...existing, imageRefsByKey:{ ...migratedImages.imageRefsByKey, ...(existing.imageRefsByKey || {}) }, imageRefsByIdentity:{ ...migratedImages.imageRefsByIdentity, ...(existing.imageRefsByIdentity || {}) } } };
}
function migrateV5(state) {
  const legacy = typeof localStorage === 'undefined' ? null : LEGACY_KEYS.map(key => parse(localStorage.getItem(key))).find(Boolean);
  const legacyToys = (legacy?.toys || []).map(normalizeToy);
  state.toys = (state.toys || []).map(current => {
    const normalized = normalizeToy(current);
    const old = legacyToys.find(item => item.id === normalized.id) || legacyToys.find(item => sameCatalogIdentity(item, normalized));
    if (!old) return normalized;
    const lostImage = !normalized.imageRef || normalized.imageRef.kind === 'placeholder';
    return normalizeToy({ ...old, ...normalized, imageRef:lostImage ? old.imageRef : normalized.imageRef, aliases:[...(old.aliases || []), ...(normalized.aliases || [])], notes:normalized.notes || old.notes });
  });
  const legacyWishlist = legacy?.wishlist || [];
  state.wishlist = (state.wishlist || []).map(item => {
    const old = legacyWishlist.find(value => value.id === item.id) || legacyWishlist.find(value => canonicalKey(value.canonicalKey || value.catalogKey) === canonicalKey(item.canonicalKey));
    return normalizeWishlistItem({ ...(old || {}), ...item, catalogSnapshot:item.catalogSnapshot || old });
  });
  const reconciliation = reconcilePersonalDuplicates(state);
  state.catalogState ||= emptyState().catalogState;
  state.catalogState.tombstones = { ...migrateTombstones(), ...(state.catalogState.tombstones || {}) };
  sanitizeCatalogImageRefs(state.catalogState);
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.featureParityV5 = { migratedAt:new Date().toISOString(), restoredLegacyImages:state.toys.filter(toy=>toy.imageRef?.kind==='personal').length, reconciledDuplicates:reconciliation.merged };
  state.schemaVersion = 5;
  return state;
}
function migrateV6(state) {
  state.catalogState ||= emptyState().catalogState;
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.featureParityV6 = { migratedAt:new Date().toISOString(), personalImageRecoveryPending:true };
  state.schemaVersion = 6;
  return state;
}
function migrateV7(state) {
  state.catalogState ||= emptyState().catalogState;
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.imageAuditV7 = { startedAt:new Date().toISOString(), pending:true, missingToyIds:[] };
  state.schemaVersion = 7;
  return state;
}
function migrateV8(state) {
  state.toys = (state.toys || []).map(normalizeToy);
  state.catalogState ||= emptyState().catalogState;
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.parentChildReconciliationV8 = { startedAt:new Date().toISOString(), pending:true, added:0, merged:0, remapped:0 };
  state.schemaVersion = 8;
  return state;
}
function migrateV9(state) {
  // R5 is intentionally only a marker migration.  The catalog definitions are
  // loaded asynchronously, so the actual idempotent parent/child reconciliation
  // runs once the single CatalogRepository pipeline has hydrated.
  state.toys = (state.toys || []).map(normalizeToy);
  state.catalogState ||= emptyState().catalogState;
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.parentChildReconciliationV9 = { startedAt:new Date().toISOString(), pending:true, added:0, merged:0, remapped:0 };
  state.schemaVersion = 9;
  return state;
}
function migrateV10(state) {
  state.toys = (state.toys || []).map(normalizeToy);
  state.catalogState ||= emptyState().catalogState;
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.parentChildReconciliationV10 = {
    startedAt:new Date().toISOString(), pending:true, parents:0, children:0,
    legacyDuplicateChildren:0, merged:0, remapped:0, siblingExcluded:0,
    variantExcluded:0, unresolved:0
  };
  state.schemaVersion = 10;
  return state;
}
function migrateV11(state) {
  state.toys = (state.toys || []).map(normalizeToy);
  state.catalogState ||= emptyState().catalogState;
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.residualIdentityReconciliationV11 = { startedAt:new Date().toISOString(), pending:true, reason:'legacy parent references normalized as child relationships' };
  state.catalogState.syncMetadata.catalogImageAuditV11 = { startedAt:new Date().toISOString(), pending:true };
  state.schemaVersion = 11;
  return state;
}
function migrateV12(state) {
  // R8 deliberately reopens the asynchronous set migration.  R7 could mark
  // its diagnostic complete before the hydrated catalog definitions had
  // actually committed an ownership merge.  Normalisation is idempotent; the
  // repository performs the one authoritative, persisted reconciliation.
  state.toys = (state.toys || []).map(normalizeToy);
  state.catalogState ||= emptyState().catalogState;
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.parentChildReconciliationV12 = {
    startedAt:new Date().toISOString(), pending:true, executionRequired:true,
    parents:0, children:0, legacyDuplicateChildren:0, merged:0, remapped:0,
    siblingExcluded:0, variantExcluded:0, unresolved:0, erroneouslyRemovedChildren:0
  };
  state.catalogState.syncMetadata.catalogImageAuditV12 = { startedAt:new Date().toISOString(), pending:true };
  state.schemaVersion = 12;
  return state;
}

export async function recoverLegacyPersonalImages({ store, images, catalog }) {
  const marker = store.state.catalogState?.syncMetadata?.featureParityV6;
  if (marker?.personalImageRecoveryCompletedAt) return marker;
  const legacyStates = typeof localStorage === 'undefined' ? [] : LEGACY_KEYS.map(key => parse(localStorage.getItem(key))).filter(Boolean);
  const legacyToys = legacyStates.flatMap(state => state.toys || []);
  const updates = new Map();
  let restored = 0; let catalogFallbacks = 0; let unresolved = 0;
  for (const current of store.state.toys || []) {
    const currentRaw = await safelyResolve(images, current.imageRef);
    if (currentRaw && current.imageRef?.kind === 'personal') continue;
    const candidates = legacyToys.filter(old => old.id === current.id || sameCatalogIdentity(old, current));
    const legacyIds = uniqueImageIds(candidates.flatMap(old => [old.photoId, old.personalPhotoId, old.imageRef?.kind === 'personal' ? old.imageRef.id : null]));
    let recovered = null;
    for (const id of legacyIds) {
      const raw = await safelyResolve(images, { kind:'personal', id });
      if (raw) { recovered = await images.savePersonal(raw); break; }
    }
    if (recovered) { updates.set(current.id, recovered); restored++; continue; }
    const catalogToy = catalog?.resolve?.(current) || catalog?.getByKey?.(current.canonicalKey);
    if (!currentRaw && catalogToy?.imageRef) {
      const fallback = await images.copyToPersonal(catalogToy.imageRef).catch(() => null);
      if (fallback) { updates.set(current.id, fallback); catalogFallbacks++; continue; }
    }
    if (!currentRaw) unresolved++;
  }
  const completedAt = new Date().toISOString();
  store.update(state => {
    for (const toy of state.toys || []) if (updates.has(toy.id)) toy.imageRef = updates.get(toy.id);
    state.catalogState.syncMetadata.featureParityV6 = { migratedAt:marker?.migratedAt || completedAt, personalImageRecoveryCompletedAt:completedAt, restored, catalogFallbacks, unresolved };
  }, 'legacy-personal-image-recovery');
  return store.state.catalogState.syncMetadata.featureParityV6;
}
function uniqueImageIds(values) { return [...new Set(values.map(value => String(value || '')).filter(value => value && !value.startsWith('catalog:') && !value.startsWith('catalog-photo:')))]; }
async function safelyResolve(images, ref) { try { return await images.resolve(ref); } catch { return null; } }

// R12 stores a generated catalog fallback as a data SVG.  A historical build
// accidentally persisted that fallback through the personal-photo path.  Do
// not treat "SVG" as evidence: a user may deliberately upload an SVG.  This
// detector requires the complete, immutable structural signature of *our*
// 520x520 fallback template, leaving the two text payloads variable.
const GENERATED_PERSONAL_PLACEHOLDER_SIGNATURE = {
  version:'generatedCatalogFallback-v1', width:520, height:520,
  prefix:'<svg xmlns="http://www.w3.org/2000/svg" width="520" height="520" viewBox="0 0 520 520"><rect width="520" height="520" rx="48" fill="#f5efff"/><rect x="36" y="36" width="448" height="448" rx="36" fill="#fff" stroke="#d6c6f5" stroke-width="8"/><circle cx="260" cy="180" r="72" fill="#8e63dc"/><path d="M222 180h76M260 142v76" stroke="#fff" stroke-width="18" stroke-linecap="round"/><text x="260" y="320" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="28" fill="#3a3151">',
  between:'</text><text x="260" y="365" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" fill="#6b6280">',
  suffix:'</text></svg>'
};

function decodeSvgDataUrl(raw) {
  if (typeof raw !== 'string' || !raw.startsWith('data:image/svg+xml')) return null;
  const comma=raw.indexOf(',');
  if (comma < 0) return null;
  const payload=raw.slice(comma + 1);
  try { return /;base64/i.test(raw.slice(0, comma)) ? atob(payload) : decodeURIComponent(payload); }
  catch { return null; }
}

export function isGeneratedCatalogPlaceholderPersonal(raw) {
  const svg=decodeSvgDataUrl(raw);
  if (!svg) return false;
  const { prefix, between, suffix }=GENERATED_PERSONAL_PLACEHOLDER_SIGNATURE;
  if (!svg.startsWith(prefix) || !svg.endsWith(suffix)) return false;
  const text=svg.slice(prefix.length, -suffix.length);
  const split=text.indexOf(between);
  if (split < 1 || text.indexOf(between, split + 1) !== -1) return false;
  // Generated labels are escaped plain text only; markup here means this is
  // not an app fallback and must remain a user-owned image.
  const brand=text.slice(0, split); const label=text.slice(split + between.length);
  return brand.length <= 34 * 6 && label.length <= 52 * 6 && !/[<>]/.test(brand + label);
}

export function classifyPersonalImageAsset(raw) {
  const svg=decodeSvgDataUrl(raw);
  const mimeType=typeof raw === 'string' ? (raw.match(/^data:([^;,]+)/i)?.[1] || null) : null;
  const result={
    mimeType, dataUrlPrefix:typeof raw === 'string' ? raw.slice(0, 64) : null,
    dimensions:svg ? { width:520, height:520 } : null,
    provenance:'stored_personal_asset',
    placeholderSignature:null
  };
  if (isGeneratedCatalogPlaceholderPersonal(raw)) return { ...result, classification:'generated_placeholder_mislabeled_personal', placeholderSignature:GENERATED_PERSONAL_PLACEHOLDER_SIGNATURE.version };
  // Any readable user image, including an SVG that does not exactly match our
  // template, is protected. Only unreadable or non-image legacy bytes remain
  // unknown and are never automatically cleared.
  if (typeof raw === 'string' && /^data:image\//i.test(raw)) return { ...result, classification:'real_user_personal_image' };
  return { ...result, classification:'unknown_personal_provenance' };
}

function catalogImageAvailability(toy, catalog) {
  const catalogToy=catalog?.resolve?.(toy) || catalog?.getByKey?.(toy?.canonicalKey) || null;
  const ref=catalogToy?.imageRef;
  const sameChild=!catalogToy ? false : (toy?.set?.kind === 'child' ? sameCatalogChildForDynamicImage(toy,catalogToy) : sameCatalogIdentity(toy,catalogToy));
  const stable=Boolean(ref && !['placeholder','generated'].includes(ref.kind) && !ref.generated && ref.assetState !== 'placeholder' && ref.source !== 'search-fallback' && ref.source !== 'missing-catalog-metadata' && (ref.kind === 'catalog' || ['verified','verified_real','manually_confirmed','stable'].includes(ref.verificationStatus) || ref.stable === true));
  return { catalogToy, ref, sameChild, available:Boolean(sameChild && stable) };
}

// Mutates only the ownership-level binding. The underlying blob is deliberately
// retained: this repair must not delete user data, and an unreferenced legacy
// asset is safer than a destructive cleanup. Calling again is a no-op.
export async function repairFakePersonalPlaceholderBindings(state, { images, catalog, mutate = true } = {}) {
  const rows=[]; let genuine=0; let fake=0; let unknown=0; let changed=0; let preserved=0;
  for (let index=0; index<(state?.toys || []).length; index++) {
    const toy=state.toys[index]; const ref=toy.imageRef;
    if (ref?.kind !== 'personal') continue;
    const raw=await safelyResolve(images,ref);
    const classified=classifyPersonalImageAsset(raw);
    const catalogInfo=catalogImageAvailability(toy,catalog);
    const row={
      toyId:toy.id, canonicalKey:toy.canonicalKey, imageRefId:ref.id,
      setKind:toy.set?.kind || null, parentCanonicalKey:toy.set?.parentCanonicalKey || null,
      ...classified,
      catalogVerifiedOrStableSameIdentity:catalogInfo.available,
      catalogCanonicalKey:catalogInfo.catalogToy?.canonicalKey || null,
      catalogImageRef:catalogInfo.ref || null
    };
    rows.push(row);
    if (classified.classification === 'generated_placeholder_mislabeled_personal') {
      fake++;
      if (mutate) { toy.imageRef={ kind:'placeholder' }; changed++; }
    } else if (classified.classification === 'real_user_personal_image') { genuine++; preserved++; }
    else unknown++;
    if (index % 8 === 7) await yieldMainThread();
  }
  const summary={
    auditedAt:new Date().toISOString(), signature:GENERATED_PERSONAL_PLACEHOLDER_SIGNATURE.version,
    personalImageTotal:rows.length, realUserPersonalImage:genuine,
    generatedPlaceholderMislabeledPersonal:fake, unknownPersonalProvenance:unknown,
    realUserImagesPreserved:preserved, changed,
    rows
  };
  state.catalogState ||= {}; state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.fakePersonalPlaceholderRepairV121=summary;
  return summary;
}

export async function auditToyLibraryImages({ store, images, catalog }) {
  const legacyStates = typeof localStorage === 'undefined' ? [] : LEGACY_KEYS.map(key => parse(localStorage.getItem(key))).filter(Boolean);
  const legacyToys = legacyStates.flatMap(state => state.toys || []);
  const records = await images.listPersonalRecords?.().catch(() => []) || [];
  const updates = new Map(); const missingToyIds = []; const recoveredRecordIds = new Set(); const knownRecordIds = new Set(); let verified = 0; let restored = 0; let catalogFallbacks = 0;
  const currentToys = store.state.toys || [];
  for (let index=0; index<currentToys.length; index++) {
    const current=currentToys[index];
    const candidates=legacyToys.filter(old=>legacyToyMatches(old,current));
    const ids=uniqueImageIds(candidates.flatMap(old=>legacyImageIds(old)).concat(legacyImageIds(current)));
    const matchingRecords=records.filter(record=>recordMatchesImage(record, ids, [current.id, ...candidates.map(item=>item.id)]));
    for (const record of matchingRecords) knownRecordIds.add(record.id);
    const currentRaw=await safelyResolve(images,current.imageRef);
    if (currentRaw) { verified++; if (current.imageRef?.kind === 'personal') knownRecordIds.add(String(current.imageRef.id)); continue; }
    const raw=matchingRecords[0]?.raw || await images.findLegacyPersonal(ids,current.id).catch(()=>null);
    if (raw) {
      updates.set(current.id,await images.savePersonal(raw)); restored++;
      if (matchingRecords[0]) recoveredRecordIds.add(matchingRecords[0].id);
      continue;
    }
    const catalogToy=catalog?.resolve?.(current);
    // Child Catalog images remain shared presentation data. The historical
    // audit must not snapshot them into the personal-image namespace after a
    // stale ownership binding has been repaired.
    if (current.set?.kind === 'child') {
      if (sameCatalogChildForDynamicImage(current,catalogToy)) catalogFallbacks++;
      else missingToyIds.push(current.id);
      continue;
    }
    if (catalogToy && sameCatalogIdentity(current,catalogToy)) {
      const fallback=await images.copyToPersonal(catalogToy.imageRef).catch(()=>null);
      if (fallback) { updates.set(current.id,fallback); catalogFallbacks++; continue; }
    }
    missingToyIds.push(current.id);
    if (index % 8 === 7) await yieldMainThread();
  }
  const orphanRecordIds=records.filter(record=>!knownRecordIds.has(record.id) && !recoveredRecordIds.has(record.id)).map(record=>record.id);
  const auditedAt=new Date().toISOString();
  store.update(state=>{
    for(const toy of state.toys || []) if(updates.has(toy.id)) toy.imageRef=updates.get(toy.id);
    state.catalogState.syncMetadata.imageAuditV7={auditedAt,totalToyCount:currentToys.length,verified,restored,catalogFallbacks,missingToyIds,orphanRecordIds,orphanImageCount:orphanRecordIds.length,unrecoverableCount:missingToyIds.length,pending:missingToyIds.length>0};
  },'toy-library-image-audit');
  return store.state.catalogState.syncMetadata.imageAuditV7;
}

// Catalog images are intentionally audited separately from personal photos.
// A missing catalog asset must never be counted as a failed Toy Library image
// migration (and vice versa).  The audit uses the final active catalog so base,
// remote and administrator edits are inspected through the same pipeline that
// the UI uses.
export async function auditStandardCatalogImages({ store, catalog, verifyRemote = verifyRemoteImage }) {
  const rows = catalog?.active || [];
  const byStatus = {
    verifiedRealImage:[], stableRemoteImage:[], manuallyConfirmedImage:[], placeholder:[],
    broken:[], remoteFetchFailure:[], identityMismatch:[], missingMetadata:[], noImage:[]
  };
  for (let index = 0; index < rows.length; index++) {
    const toy = rows[index];
    const ref = toy.imageRef;
    let status;
    if (!ref || ref.kind === 'placeholder') status = 'noImage';
    else if (ref.catalogKey && canonicalKey(ref.catalogKey) !== canonicalKey(toy.canonicalKey)) status = 'identityMismatch';
    else if (ref.kind === 'catalog' && !ref.id) status = 'broken';
    else if (ref.kind === 'remote' && !ref.url) status = 'broken';
    else if (ref.kind === 'generated' || ref.assetState === 'placeholder' || ref.generated || ref.source === 'search-fallback' || ref.source === 'missing-catalog-metadata') status = 'placeholder';
    else if (ref.verificationStatus === 'manually_confirmed') status = 'manuallyConfirmedImage';
    else if (ref.kind === 'remote') {
      const reachable = await verifyRemote(ref.url);
      status = reachable === false ? 'remoteFetchFailure' : ['verified','verified_real'].includes(ref.verificationStatus) ? 'verifiedRealImage' : 'stableRemoteImage';
    } else status = ref.verificationStatus === 'manually_confirmed' ? 'manuallyConfirmedImage' : 'verifiedRealImage';
    byStatus[status].push(toy.canonicalKey);
    if (index % 8 === 7) await yieldMainThread();
  }
  const auditedAt = new Date().toISOString();
  const result = {
    auditedAt, totalCatalogCount:rows.length, pending:false,
    verifiedRealImage:byStatus.verifiedRealImage.length,
    stableRemoteImage:byStatus.stableRemoteImage.length,
    manuallyConfirmedImage:byStatus.manuallyConfirmedImage.length,
    placeholder:byStatus.placeholder.length,
    broken:byStatus.broken.length,
    remoteFetchFailure:byStatus.remoteFetchFailure.length,
    identityMismatch:byStatus.identityMismatch.length,
    missingMetadata:byStatus.placeholder.length + byStatus.missingMetadata.length,
    noImage:byStatus.noImage.length,
    ...Object.fromEntries(Object.entries(byStatus).map(([status, keys]) => [`${status}Keys`, keys]))
  };
  store.update(state => {
    state.catalogState.syncMetadata ||= {};
    state.catalogState.syncMetadata.catalogImageAuditV12 = result;
  }, 'standard-catalog-image-audit');
  return store.state.catalogState.syncMetadata.catalogImageAuditV12;
}

function verifyRemoteImage(url) {
  if (!url || typeof Image === 'undefined') return Promise.resolve(null);
  return new Promise(resolve => {
    const image = new Image(); let settled = false;
    const complete = value => { if (settled) return; settled = true; clearTimeout(timer); resolve(value); };
    const timer = setTimeout(() => complete(false), 5000);
    image.onload = () => complete(true); image.onerror = () => complete(false); image.src = url;
  });
}
function legacyImageIds(toy = {}) { return [toy.photoId,toy.personalPhotoId,toy.imageId,toy.localImageId,toy.photoKey,toy.imageKey,toy.imageRef?.kind==='personal'?toy.imageRef.id:null]; }
function sameCatalogChildForDynamicImage(child, catalogChild) {
  if (child?.set?.kind !== 'child' || catalogChild?.set?.kind !== 'child') return false;
  const left=[child.canonicalKey,...(child.legacyCanonicalKeys||[])].map(canonicalKey).filter(Boolean);
  const right=[catalogChild.canonicalKey,...(catalogChild.legacyCanonicalKeys||[])].map(canonicalKey).filter(Boolean);
  if (left.some(key=>right.includes(key))) return true;
  const parentA=canonicalKey(child.set?.parentCanonicalKey), parentB=canonicalKey(catalogChild.set?.parentCanonicalKey);
  const part=value=>Number(value?.set?.partIndex || canonicalKey(value?.canonicalKey).match(/(?:part|puzzle)-(\d+)$/)?.[1] || 0);
  return Boolean(parentA && parentA===parentB && part(child)>0 && part(child)===part(catalogChild));
}
function legacyToyMatches(old, current) {
  const legacy = normalizeToy(old);
  return old.id === current.id || sameCatalogIdentity(legacy,current) || sameLegacyChildIdentity(legacy,current);
}
function sameLegacyChildIdentity(a, b) {
  if (a.set?.kind === 'parent' || b.set?.kind === 'parent') return false;
  const parentA=canonicalKey(a.set?.parentCanonicalKey); const parentB=canonicalKey(b.set?.parentCanonicalKey);
  const sameParent=Boolean(parentA && parentB && parentA===parentB) || Boolean(a.set?.parentId && b.set?.parentId && a.set.parentId===b.set.parentId);
  if (!sameParent || a.brand !== b.brand) return false;
  const names=toyNameTokens(a); return names.some(name=>toyNameTokens(b).includes(name));
}
function toyNameTokens(toy = {}) { return [...new Set([toy.productName,toy.names?.en,toy.names?.zh,...(toy.aliases || [])].map(canonicalKey).filter(value=>value.length>=4))]; }
function recordMatchesImage(record, ids, toyIds) {
  const recordId=String(record.id || '').toLowerCase(); const metadata=String(record.metadata || '');
  return ids.some(id=>recordId.includes(String(id).toLowerCase())) || toyIds.some(id=>recordId.includes(String(id).toLowerCase()) || metadata.includes(String(id).toLowerCase()));
}
function yieldMainThread() { return new Promise(resolve=>setTimeout(resolve,0)); }
function migrateTombstones() {
  if (typeof localStorage === 'undefined') return {};
  const storageKeys = ['toyRotationCatalogDeletedV0934','toyRotationHiddenCatalogKeysV0927','toyRotationHiddenCatalogTombstonesV0929','toyRotationHiddenCatalogAuthoritativeV0930','toyRotationCatalogHiddenV0933','toyRotationCatalogPendingHideV0933'];
  const values = storageKeys.flatMap(storageKey => tombstoneKeys(parse(localStorage.getItem(storageKey))));
  const overrides = parse(localStorage.getItem('toyRotationCatalogOverridesV095')) || {};
  for (const [key, value] of Object.entries(overrides)) if (value?.hidden === true || value?.deleted === true || value?.mergeInto) values.push(key);
  return Object.fromEntries(uniqueCanonical(values).map(key => [key, { deletedAt: new Date().toISOString(), migrated: true }]));
}
function tombstoneKeys(value) {
  if (!value) return [];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(tombstoneKeys);
  if (typeof value !== 'object') return [];
  const explicit = [value.key, value.canonicalKey, ...(Array.isArray(value.keys) ? value.keys : [])].filter(Boolean);
  return explicit.length ? explicit : Object.entries(value).filter(([,entry]) => entry === true || entry?.hidden === true || entry?.deleted === true || entry?.mergeInto).map(([key]) => key);
}
function uniqueCanonical(values) { return [...new Set(values.map(canonicalKey).filter(Boolean))]; }
function sanitizeCatalogImageRefs(catalogState) {
  const maps = [catalogState.imageRefsByKey || {}, catalogState.imageRefsByIdentity || {}];
  const usage = new Map();
  for (const map of maps) for (const ref of Object.values(map)) if (ref?.id) usage.set(ref.id, (usage.get(ref.id) || 0) + 1);
  for (const map of maps) for (const [key, ref] of Object.entries(map)) if (ref?.id && usage.get(ref.id) > 2) delete map[key];
}
function migrateCatalogImageRefs() {
  if (typeof localStorage === 'undefined') return { imageRefsByKey:{}, imageRefsByIdentity:{} };
  const confirmed = parse(localStorage.getItem('toyCatalogConfirmedPhotosV1')) || {};
  const registry = parse(localStorage.getItem('toyRotationCatalogMediaV0946')) || {};
  const idsByKey = { ...(registry.byKey || {}), ...confirmed };
  const assignments = [...Object.entries(idsByKey), ...Object.entries(registry.byIdentity || {})].map(([,id]) => String(id || '')).filter(Boolean);
  const usage = assignments.reduce((counts,id) => counts.set(id,(counts.get(id)||0)+1), new Map());
  const imageRefsByKey = Object.fromEntries(Object.entries(idsByKey)
    .filter(([key, id]) => canonicalKey(key) && id && usage.get(String(id)) <= 2)
    .map(([key, id]) => [canonicalKey(key), { kind:'catalog', id:String(id) }]));
  const imageRefsByIdentity = Object.fromEntries(Object.entries(registry.byIdentity || {})
    .filter(([, id]) => id && usage.get(String(id)) <= 2)
    .map(([identity, id]) => [String(identity), { kind:'catalog', id:String(id) }]));
  return { imageRefsByKey, imageRefsByIdentity };
}
function parse(value) { try { return value ? JSON.parse(value) : null; } catch { return null; } }
