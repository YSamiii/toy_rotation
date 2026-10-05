export const AGE_SAFETY_STATUSES = Object.freeze([
  'VERIFIED_NO_EXTRA_GATE', 'NO_DOCUMENTED_HARD_GATE', 'SMALL_PARTS_GATE', 'GROSS_MOTOR_GATE',
  'OTHER_HARD_GATE', 'UNKNOWN'
]);

// A Catalog review is usable only when its identity, source, evidence and
// date travel together. Incomplete or contradictory reviews remain UNKNOWN.
export function catalogSafetyStatus(row) {
  const safety = row?.userMetadata?.safety;
  const status = safety?.ageSafetyStatus;
  if (!AGE_SAFETY_STATUSES.includes(status) || status === 'UNKNOWN'
      || !/^https:\/\//i.test(String(safety.safetySource || ''))
      || !/^\d{4}-\d{2}-\d{2}$/.test(String(safety.safetyVerifiedAt || ''))
      || !String(safety.evidenceNote || '').trim()) return 'UNKNOWN';
  if (status === 'SMALL_PARTS_GATE' && safety.smallParts !== true) return 'UNKNOWN';
  if (status === 'GROSS_MOTOR_GATE' && safety.requiresStandingStability !== true) return 'UNKNOWN';
  if (status === 'OTHER_HARD_GATE' && !(Number(safety.hardMinAgeMonths) > 0)) return 'UNKNOWN';
  if (status === 'VERIFIED_NO_EXTRA_GATE' && (safety.smallParts === true || safety.chokingSmallParts === true
      || safety.requiresStandingStability === true || Number(safety.hardMinAgeMonths) > 0
      || Number(safety.safetyMinAgeMonths) > 0)) return 'UNKNOWN';
  if (status === 'NO_DOCUMENTED_HARD_GATE' && (safety.smallParts === true || safety.chokingSmallParts === true
      || safety.requiresStandingStability === true || Number(safety.hardMinAgeMonths) > 0
      || Number(safety.safetyMinAgeMonths) > 0
      || safety.warningType)) return 'UNKNOWN';
  return status;
}

// Approval is local to one persisted owner state and one canonical product.
// A changed Catalog age invalidates an old approval until the parent reviews it again.
export function crossAgeApprovalFor(state, toy) {
  const key = String(toy?.canonicalKey || '');
  const record = state?.crossAgeApprovals?.[key];
  return validCrossAgeApproval(toy, record) ? record : null;
}

export function validCrossAgeApproval(toy, record) {
  const key = String(toy?.canonicalKey || '');
  return record?.approved === true && record.canonicalKey === key
    && record.sourceRecommendedMinAgeMonths === toy.minAgeMonths
    && /^\d{4}-\d{2}-\d{2}T/.test(String(record.approvedAt || ''));
}

export function setCrossAgeApproval(state, toy, approved, { now = new Date().toISOString(), note = '' } = {}) {
  const key = String(toy?.canonicalKey || '');
  if (!key || !Number.isFinite(toy?.minAgeMonths)) return false;
  state.crossAgeApprovals ||= {};
  if (!approved) { delete state.crossAgeApprovals[key]; return true; }
  state.crossAgeApprovals[key] = {
    approved:true, approvedAt:now, canonicalKey:key,
    sourceRecommendedMinAgeMonths:toy.minAgeMonths,
    ...(note ? { note:String(note).slice(0,240) } : {})
  };
  return true;
}

// An explicit "not now" lives beside approvals, but never satisfies the
// approval predicate used by Rotation.
export function declineCrossAgeApproval(state, toy, { now = new Date().toISOString() } = {}) {
  const key = String(toy?.canonicalKey || '');
  if (!key || !Number.isFinite(toy?.minAgeMonths)) return false;
  state.crossAgeApprovals ||= {};
  state.crossAgeApprovals[key] = {
    approved:false, decidedAt:now, canonicalKey:key,
    sourceRecommendedMinAgeMonths:toy.minAgeMonths
  };
  return true;
}

export function crossAgeChoiceFor(state, toy) {
  const key = String(toy?.canonicalKey || '');
  const record = state?.crossAgeApprovals?.[key];
  if (validCrossAgeApproval(toy, record)) return 'allowed';
  if (record?.approved === false && record.canonicalKey === key
      && record.sourceRecommendedMinAgeMonths === toy?.minAgeMonths) return 'declined';
  return 'pending';
}

export function redirectCrossAgeApproval(state, from, to) {
  const approvals = state?.crossAgeApprovals;
  if (!approvals || !from || !to || from === to || !approvals[from]) return false;
  const source = approvals[from];
  const target = approvals[to];
  approvals[to] = target?.approved ? target : { ...source, canonicalKey:to };
  delete approvals[from];
  return true;
}

export function reconcileCrossAgeApprovals(state, resolve) {
  let changed=0;
  for (const key of Object.keys(state?.crossAgeApprovals || {})) {
    const current=resolve(key)?.canonicalKey;
    if (current && redirectCrossAgeApproval(state,key,current)) changed++;
  }
  return changed;
}

// Overlay current Catalog facts for one planning pass; never overwrite the
// persisted Library item or any user-authored metadata.
export function withCatalogSafety(toy, catalogRow) {
  const userMetadata={ ...toy.userMetadata };
  if (catalogSafetyStatus(catalogRow) === 'UNKNOWN') delete userMetadata.safety;
  else userMetadata.safety=catalogRow.userMetadata.safety;
  return { ...toy, userMetadata };
}
