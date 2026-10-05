import { AGE_SAFETY_STATUSES, catalogSafetyStatus, crossAgeApprovalFor, withCatalogSafety } from '../domain/catalog-safety.js';
import { rotationAgeEligibility } from '../domain/rotation-engine.js';
import { childAgeMonths } from '../domain/profile-service.js';

// Read-only owner inventory for evidence-based Catalog safety review. This
// export deliberately omits child profile, notes, photos, and local toy IDs.
export const CATALOG_SAFETY_AUDIT_VERSION = 'v0.11.6';
const PRIORITY_BRANDS = new Set(['mideer', 'lovevery', 'hape', 'learning resources', 'lego duplo', 'lego / duplo', 'vtech', 'brio']);

export function buildCatalogSafetyAudit({ state = {}, catalog, build = {}, generatedAt = new Date().toISOString() } = {}) {
  const rows = Array.isArray(catalog) ? catalog : catalog?.active || [];
  const age=childAgeMonths(state.profile?.childBirthDate, new Date(generatedAt).getTime());
  const profile=state.profile?.developmentProfile || {};
  const resolve = reference => catalog?.resolve?.(reference) || rows.find(row =>
    [reference?.canonicalKey, reference?.catalogId].includes(row.canonicalKey) || reference?.catalogId === row.id) || null;
  const owned = mappedRows(state.toys || [], resolve, state, age, profile);
  const wishlist = mappedRows(state.wishlist || [], resolve, state, age, profile);
  const rotation = mappedRows((state.toys || []).filter(toy =>
    !toy.hidden && !toy.archived && toy.set?.kind !== 'parent'
    && toy.rotationParticipation !== 'paused' && toy.permanentSource !== 'user'), resolve, state, age, profile);
  const frequent = rows.filter(row => row.minAgeMonths >= 18 && row.minAgeMonths <= 36
    && PRIORITY_BRANDS.has(String(row.brand || '').toLowerCase())).map(row=>safetyRow(row,null,state,age,profile));
  return {
    auditVersion:CATALOG_SAFETY_AUDIT_VERSION,
    buildId:String(build.buildId || ''), generatedAt,
    catalog:{ total:rows.length, statusDistribution:distribution(rows.map(safetyRow)), frequent18To36:frequent },
    owned, wishlist, rotationCandidates:rotation
  };
}

function mappedRows(items, resolve, state, age, profile) {
  const mapped = items.map(item=>({item,row:resolve(item)})).filter(pair=>pair.row)
    .map(({item,row})=>safetyRow(row,item,state,age,profile));
  return { total:items.length, mappedToCatalog:mapped.length, unmapped:items.length-mapped.length,
    statusDistribution:distribution(mapped), items:mapped };
}

function safetyRow(row, reference, state, age, profile) {
  const safety = row.userMetadata?.safety || {};
  const ageSafetyStatus = catalogSafetyStatus(row);
  const projected = { ...withCatalogSafety(reference || row,row), canonicalKey:row.canonicalKey, minAgeMonths:row.minAgeMonths };
  const approval=crossAgeApprovalFor(state,projected);
  const decision=rotationAgeEligibility({ ...projected, crossAgeApproval:approval },age,profile);
  return {
    canonicalKey:String(row.canonicalKey || ''), productName:String(row.productName || ''),
    brand:String(row.brand || ''), sku:String(row.sku || row.setNumber || '') || null,
    recommendedMinAgeMonths:row.minAgeMonths ?? null, ageSafetyStatus,
    childAgeMonths:age, crossAgeApproval:approval ? { approved:true, approvedAt:approval.approvedAt,
      canonicalKey:approval.canonicalKey, sourceRecommendedMinAgeMonths:approval.sourceRecommendedMinAgeMonths } : { approved:false },
    eligibilityResult:decision.eligible ? 'ELIGIBLE' : 'BLOCKED', eligibilityReason:decision.reason,
    hardMinAgeMonths:ageSafetyStatus === 'UNKNOWN' ? null : safety.hardMinAgeMonths ?? null,
    smallParts:ageSafetyStatus === 'UNKNOWN' ? 'unknown' : safety.smallParts ?? 'unknown',
    requiresStandingStability:ageSafetyStatus === 'UNKNOWN' ? 'unknown' : safety.requiresStandingStability ?? 'unknown',
    warningType:ageSafetyStatus === 'UNKNOWN' ? null : safety.warningType || null,
    safetySource:ageSafetyStatus === 'UNKNOWN' ? null : safety.safetySource,
    evidenceNote:ageSafetyStatus === 'UNKNOWN' ? null : safety.evidenceNote,
    safetyNotes:ageSafetyStatus === 'UNKNOWN' ? null : safety.safetyNotes || null,
    safetyVerifiedAt:ageSafetyStatus === 'UNKNOWN' ? null : safety.safetyVerifiedAt
  };
}

function distribution(items) {
  return Object.fromEntries(AGE_SAFETY_STATUSES.map(status =>
    [status, items.filter(item => item.ageSafetyStatus === status).length]));
}
