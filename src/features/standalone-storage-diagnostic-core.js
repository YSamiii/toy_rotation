// Pure, dependency-free helpers for the standalone recovery page.  This file
// intentionally imports neither the App Store nor any catalog/runtime module.
export const PRIMARY_KEY = 'toyRotation.cleanBaseline';
export const LEGACY_KEYS = ['toyRotationV04', 'toyRotationV032', 'toyRotationV03', 'toyRotationV02'];
export const IMAGE_DB = 'toyRotationPhotosV04';
export const STARTUP_MARKER_KEY = 'toyRotation.startupDiagnostic';
export const RECOVERY_STAGING_KEY = 'toyRotation.cleanBaseline.recoveryStaging';

export function inspectRawPersistence(key, raw) {
  const base={ key, exists:raw !== null && raw !== undefined, rawLength:typeof raw === 'string' ? raw.length : 0, rawState:raw == null ? 'missing' : raw === '' ? 'empty' : 'non_empty', parseStatus:'not_attempted', parseError:null, counts:emptyCounts(), structural:{ settings:false, backupMetadata:false, schemaVersion:null } };
  if (raw == null || raw === '') return { ...base, parseStatus:raw == null ? 'missing' : 'empty' };
  try {
    const value=JSON.parse(raw);
    if (!value || typeof value !== 'object') return { ...base, parseStatus:'non_object' };
    return { ...base, parseStatus:'success', counts:rawCounts(value), structural:{ settings:!!value.settings, backupMetadata:hasBackupMetadata(value), schemaVersion:value.schemaVersion ?? null } };
  } catch (error) { return { ...base, parseStatus:'error', parseError:String(error?.message || error) }; }
}

export function rawCounts(value) {
  return {
    toys:Array.isArray(value?.toys) ? value.toys.length : 0,
    profile:value?.profile?.childName || value?.profile?.childBirthDate || value?.settings?.childName || value?.settings?.childBirthDate ? 1 : 0,
    rotationHistory:Array.isArray(value?.rotationHistory) ? value.rotationHistory.length : Array.isArray(value?.history) ? value.history.length : 0,
    wishlist:Array.isArray(value?.wishlist) ? value.wishlist.length : 0,
    drafts:Array.isArray(value?.drafts) ? value.drafts.length : 0
  };
}

export function classifyRawPersistence({ current, legacy=[] } = {}) {
  const currentPopulated=isPopulated(current);
  const legacyPopulated=legacy.find(isPopulated);
  if (currentPopulated) return { code:'A', label:'persistent_data_present_app_startup_or_hydration_failure', sourceKey:current.key, recoveryAvailable:false };
  if (legacyPopulated) return { code:'B', label:'recoverable_legacy_persistence_found', sourceKey:legacyPopulated.key, recoveryAvailable:true };
  return { code:'C', label:'primary_state_unavailable_or_possibly_overwritten', sourceKey:null, recoveryAvailable:false };
}

function emptyCounts() { return { toys:0, profile:0, rotationHistory:0, wishlist:0, drafts:0 }; }
function isPopulated(record) { const counts=record?.counts || emptyCounts(); return record?.parseStatus === 'success' && (counts.toys > 0 || counts.profile > 0 || counts.rotationHistory > 0 || counts.wishlist > 0); }
function hasBackupMetadata(value) { return Object.keys(value || {}).some(key=>/backup|restore/i.test(key)) || !!value?.catalogState?.backupMetadata; }
