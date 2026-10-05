import { assess } from './substitution-engine.js';
import { developmentFit } from './development-fit.js';
import { catalogSafetyStatus, validCrossAgeApproval } from './catalog-safety.js';
import { prerequisitesSatisfied } from './early-rotation-baseline.js';

const GENERIC_MECHANICS = new Set(['fine_motor_general', 'construction_general', 'pretend_play_general', 'sensory_general']);

// One scoring pipeline: hard eligibility → base value → recent history → real
// substitution/mechanics → small category/skill preferences.  Preferences
// rank candidates; they never reduce the requested count when valid toys remain.
export function generateRotation(input) {
  return selectRotation(input).selected;
}

export function selectRotation({ toys = [], history = [], childAgeMonths, size = 6, now = Date.now(), childDevelopmentProfile = {}, developmentFeedbackHistory = [] }) {
  const requestedRotationCount = Math.max(1, Number(size) || 6);
  const classified = classifyCandidates(toys, childAgeMonths, childDevelopmentProfile);
  const candidates = classified.eligible
    .map((toy, index) => ({ toy, ...baseScore(toy, childAgeMonths, now, history, childDevelopmentProfile, developmentFeedbackHistory), index }))
    .sort((a, b) => b.score - a.score || a.toy.productName.localeCompare(b.toy.productName));
  const selected = [];
  const selectedCandidateScores = [];
  const relations = new Map();
  const diversity = { brandPenaltyApplied:0, groupPenaltyApplied:0, recencyPenaltyApplied:0 };
  const stretchTarget = requestedRotationCount >= 3 ? Math.max(1, Math.round(requestedRotationCount * 0.25)) : 0;
  const stretchCap = Math.max(1, Math.ceil(requestedRotationCount * 0.30));

  while (selected.length < requestedRotationCount && candidates.length) {
    const stretchCount = selectedCandidateScores.filter(item => item.developmentKind === 'good_challenge').length;
    const remaining = requestedRotationCount - selected.length;
    const availableStretch = candidates.filter(entry => entry.development.kind === 'good_challenge');
    const availableOther = candidates.filter(entry => entry.development.kind !== 'good_challenge');
    const forceStretch = stretchCount < stretchTarget && remaining <= stretchTarget - stretchCount && availableStretch.length;
    const allowed = forceStretch ? availableStretch : stretchCount >= stretchCap && availableOther.length ? availableOther : candidates;
    const next = allowed
      .map(entry => {
        const adjustment = diversityAdjustment(entry.toy, selected, history, relations);
        return { entry, candidateIndex:candidates.indexOf(entry), adjustment, adjusted: entry.score + adjustment.value };
      })
      .sort((a, b) => b.adjusted - a.adjusted || a.entry.toy.productName.localeCompare(b.entry.toy.productName))[0];
    selected.push(next.entry.toy);
    selectedCandidateScores.push({
      id:next.entry.toy.id,
      canonicalKey:next.entry.toy.canonicalKey || null,
      brand:normalizedBrand(next.entry.toy),
      ownershipGroup:ownershipGroupKey(next.entry.toy),
      brandPenalty:next.adjustment.brandPenalty,
      groupPenalty:next.adjustment.groupPenalty,
      recencyPenalty:next.entry.recencyPenalty,
      developmentFit:next.entry.development.score,
      developmentKind:next.entry.development.kind,
      challengeLevel:next.entry.development.challengeLevel,
      progressionLevel:next.entry.development.progressionLevel,
      finalScore:next.adjusted
    });
    diversity.brandPenaltyApplied += next.adjustment.brandPenalty;
    diversity.groupPenaltyApplied += next.adjustment.groupPenalty;
    diversity.recencyPenaltyApplied += next.entry.recencyPenalty;
    // `next` is a scored projection, not an element of `candidates`.  Removing
    // it by object identity used to return -1 and silently remove the final
    // candidate instead, allowing the same toy to be selected repeatedly.
    candidates.splice(next.candidateIndex, 1);
  }

  const selectedIds = new Set(selected.map(toy => toy.id));
  const selectedRotationCount = selected.length;
  const permanentCount = classified.customPermanent.length;
  const shortageCount = Math.max(0, requestedRotationCount - selectedRotationCount);
  return {
    selected,
    diagnostics: {
      requestedRotationCount,
      selectedRotationCount,
      permanentCount,
      totalShelfCount:selectedRotationCount + permanentCount,
      eligibleRotationCount:classified.eligible.length,
      selectedBrandCounts:countBy(selected, toy => normalizedBrand(toy)),
      selectedOwnershipGroupCounts:countBy(selected.filter(toy => ownershipGroupKey(toy)), ownershipGroupKey),
      previousRotationOverlap:overlapCount(selectedIds, history[0]?.toyIds || []),
      recent3RotationOverlap:overlapCount(selectedIds, history.slice(0, 3).flatMap(round => round.toyIds || [])),
      brandDiversityPenaltyApplied:diversity.brandPenaltyApplied,
      groupDiversityPenaltyApplied:diversity.groupPenaltyApplied,
      recencyPenaltyApplied:diversity.recencyPenaltyApplied,
      selectedCandidateScores,
      stretchTarget,
      selectedStretchCount:selectedCandidateScores.filter(item => item.developmentKind === 'good_challenge').length,
      // Backwards-compatible aliases for older Admin diagnostics and backups.
      requestedCount:requestedRotationCount,
      selectedCount:selectedRotationCount,
      uniqueSelectedCount:selectedIds.size,
      eligibleCount:classified.eligible.length,
      shortageCount,
      shortageReason:shortageCount ? 'eligible_pool_exhausted' : null,
      exclusionSummary:{
        totalToys:toys.length,
        excludedByStatus:0,
        excludedHiddenOrArchived:classified.hiddenOrArchived,
        excludedParentContainers:classified.parentContainers,
        excludedByAgeRule:classified.ageRule,
        permanentToys:permanentCount,
        eligibleRotationCandidates:classified.eligible.length,
        scoredCandidates:classified.eligible.length,
        rankedCandidates:classified.eligible.length,
        duplicateRemovals:0,
        parentChildGroupConflictRemovals:0,
        cooldownOrRecentlyUsedRemovals:0,
        diversityCategoryBalanceRemovals:0,
        interestOrRotationRuleRemovals:0
      }
    }
  };
}

export function persistRotationSelection(state, { selected, diagnostics, now = new Date().toISOString() }) {
  clearManualShelfOverrides(state);
  const ids = new Set(selected.map(toy => toy.id));
  const permanentIds = new Set(currentShelfCollections(state).permanent.map(toy => toy.id));
  for (const toy of state.toys || []) {
    if (toy.hidden || toy.archived || isRotationPaused(toy) || toy.set?.kind === 'parent') {
      if (toy.status === 'active') toy.status = 'stored';
      continue;
    }
    toy.status = ids.has(toy.id) || permanentIds.has(toy.id) ? 'active' : 'stored';
    if (ids.has(toy.id)) toy.lastActivatedAt = now;
  }
  const normalizedDiagnostics = withShelfCounts(diagnostics, ids.size, permanentIds.size, 0);
  state.lastRotationAt = now;
  state.rotationHistory ||= [];
  state.rotationHistory.unshift({ id:crypto.randomUUID(), at:now, toyIds:[...ids], mechanisms:selected.flatMap(toy => toy.playMechanics || []), rotationDiagnostics:normalizedDiagnostics });
  return { selectedIds:ids, selectedCount:ids.size, permanentIds, totalShelfCount:ids.size + permanentIds.size };
}

// A newly generated rotation has one authoritative shelf plan: its latest
// rotationHistory.toyIds.  This idempotently removes old active flags that
// survived a prior runtime, without changing the plan or touching history.
export function normalizeCurrentShelf(state) {
  const shelf = currentShelfCollections(state);
  const ids = new Set([...shelf.rotation.map(toy => toy.id), ...shelf.permanent.map(toy => toy.id), ...shelf.manual.map(toy => toy.id)]);
  let changed = 0;
  for (const toy of state.toys || []) {
    const nextStatus = !toy.hidden && !toy.archived && toy.set?.kind !== 'parent' && ids.has(toy.id) ? 'active' : 'stored';
    if (toy.status !== nextStatus) { toy.status = nextStatus; changed++; }
  }
  return { changed, normalizedIds:[...ids], rotationIds:shelf.rotation.map(toy => toy.id), permanentIds:shelf.permanent.map(toy => toy.id), manualIds:shelf.manual.map(toy => toy.id) };
}

export function isUserCustomPermanent(toy = {}) {
  return toy.shelfMode === 'permanent' && toy.permanentSource === 'user';
}
export function isRotationPaused(toy = {}) { return toy.rotationParticipation === 'paused'; }

export function setRotationParticipation(state, toyId, participation, { childAgeMonths, now = new Date().toISOString(), pauseReason = '', pauseReasonCode = '' } = {}) {
  const toy = (state.toys || []).find(item => item.id === toyId);
  if (!toy || toy.set?.kind === 'parent') return { changed:false, reason:toy?.set?.kind === 'parent' ? 'parent_container' : 'not_found' };
  const paused = participation === 'paused';
  if (paused) {
    toy.rotationParticipation = 'paused'; toy.pauseReason = String(pauseReason || '').slice(0,240); toy.pauseReasonCode = String(pauseReasonCode || '').slice(0,80); toy.pauseUpdatedAt = now;
    if (isUserCustomPermanent(toy)) { toy.shelfMode = 'rotate'; toy.permanentSource = null; toy.permanentSetAt = null; }
    toy.manualShelfMode = null; toy.manualShelfUpdatedAt = null;
    const plan = state.rotationHistory?.[0];
    if (plan?.toyIds?.includes(toy.id)) { plan.toyIds = plan.toyIds.filter(id => id !== toy.id); refillCurrentRotation(state, { childAgeMonths, now }); }
    else { normalizeCurrentShelf(state); refreshLatestDiagnostics(state, childAgeMonths); }
  } else {
    toy.rotationParticipation = 'active'; toy.pauseUpdatedAt = now;
    normalizeCurrentShelf(state); refreshLatestDiagnostics(state, childAgeMonths);
  }
  return { changed:true, paused, shelf:currentShelfCollections(state) };
}

export function currentShelfCollections(state = {}) {
  const toys = state.toys || [];
  const byId = new Map(toys.map(toy => [toy.id, toy]));
  const permanent = toys.filter(toy => isShelfVisible(toy) && !isRotationPaused(toy) && isUserCustomPermanent(toy));
  const permanentIds = new Set(permanent.map(toy => toy.id));
  const manual = toys.filter(toy => isShelfVisible(toy) && !permanentIds.has(toy.id) && toy.manualShelfMode === 'on_shelf');
  const manualIds = new Set(manual.map(toy => toy.id));
  const seen = new Set();
  const rotation = (state.rotationHistory?.[0]?.toyIds || [])
    .map(id => byId.get(id))
    .filter(toy => toy && isShelfVisible(toy) && !isRotationPaused(toy) && !permanentIds.has(toy.id) && !manualIds.has(toy.id) && toy.manualShelfMode !== 'stored' && !seen.has(toy.id) && seen.add(toy.id));
  return { rotation, permanent, manual, rotationIds:rotation.map(toy => toy.id), permanentIds:permanent.map(toy => toy.id), manualIds:manual.map(toy => toy.id), totalShelfCount:rotation.length + permanent.length + manual.length };
}

export function setCustomPermanent(state, toyId, permanent, { childAgeMonths, now = new Date().toISOString() } = {}) {
  const toy = (state.toys || []).find(item => item.id === toyId);
  if (!toy || toy.set?.kind === 'parent') return { changed:false, reason:toy?.set?.kind === 'parent' ? 'parent_container' : 'not_found' };
  const plan = state.rotationHistory?.[0] || null;
  if (permanent) {
    toy.rotationParticipation = 'active'; toy.pauseReasonCode = null; toy.pauseUpdatedAt = null;
    toy.shelfMode = 'permanent';
    toy.permanentSource = 'user';
    toy.permanentSetAt = now;
    toy.manualShelfMode = null;
    toy.status = 'active';
    toy.lastActivatedAt ||= now;
    if (plan) {
      plan.toyIds = (plan.toyIds || []).filter(id => id !== toy.id);
      refillCurrentRotation(state, { childAgeMonths, now });
    } else normalizeCurrentShelf(state);
  } else {
    toy.shelfMode = 'rotate';
    toy.permanentSource = null;
    toy.permanentSetAt = null;
    normalizeCurrentShelf(state);
    refreshLatestDiagnostics(state, childAgeMonths);
  }
  return { changed:true, permanent:isUserCustomPermanent(toy), shelf:currentShelfCollections(state) };
}

// Manual shelf controls are a current-round override, deliberately separate
// from both the persisted rotation plan and long-lived user permanents. A new
// generated rotation clears these overrides, just as the pre-RC2 status toggle
// was superseded by the next rotation; Current Shelf never reads status alone.
export function setManualShelfState(state, toyId, mode, { childAgeMonths, now = new Date().toISOString() } = {}) {
  const toy = (state.toys || []).find(item => item.id === toyId);
  if (!toy || toy.set?.kind === 'parent' || isUserCustomPermanent(toy) || isRotationPaused(toy)) return { changed:false, reason:!toy ? 'not_found' : 'not_manual_eligible' };
  const nextMode = mode === 'on_shelf' ? 'on_shelf' : mode === 'stored' ? 'stored' : null;
  if (toy.manualShelfMode === nextMode) return { changed:false, shelf:currentShelfCollections(state) };
  toy.manualShelfMode = nextMode;
  toy.manualShelfUpdatedAt = nextMode ? now : null;
  const plan = state.rotationHistory?.[0];
  if (plan && nextMode) {
    plan.toyIds = (plan.toyIds || []).filter(id => id !== toy.id);
    refillCurrentRotation(state, { childAgeMonths, now });
  } else {
    normalizeCurrentShelf(state);
    refreshLatestDiagnostics(state, childAgeMonths);
  }
  return { changed:true, mode:nextMode, shelf:currentShelfCollections(state) };
}

export function clearManualShelfOverrides(state) {
  let changed = 0;
  for (const toy of state.toys || []) {
    if (toy.manualShelfMode) { toy.manualShelfMode = null; toy.manualShelfUpdatedAt = null; changed++; }
  }
  return changed;
}

export function refillCurrentRotation(state, { childAgeMonths, now = new Date().toISOString() } = {}) {
  const plan = state.rotationHistory?.[0];
  if (!plan) return { selectedRotationCount:0, shortageCount:Math.max(1, Number(state.settings?.rotationSize) || 6) };
  const target = Math.max(1, Number(state.settings?.rotationSize) || 6);
  const shelf = currentShelfCollections(state);
  // A manual ordinary toy is a deliberate Current Shelf position.  It takes
  // one ordinary rotation slot, while a user permanent remains outside that
  // target.  We only score the remaining empty ordinary positions.
  const remainingTarget = Math.max(0, target - shelf.manual.length);
  const kept = shelf.rotation.slice(0, remainingTarget);
  const keptIds = new Set(kept.map(toy => toy.id));
  const occupied = [...kept, ...shelf.manual, ...shelf.permanent];
  const occupiedIds = new Set(occupied.map(toy => toy.id));
  const occupiedIdentityKeys = new Set(occupied.flatMap(rotationIdentityKeys));
  const missing = Math.max(0, remainingTarget - kept.length);
  let additions = [];
  if (missing) {
    const pool = (state.toys || []).filter(toy => !keptIds.has(toy.id) && !occupiedIds.has(toy.id) && !rotationIdentityKeys(toy).some(key => occupiedIdentityKeys.has(key)));
    additions = selectRotation({ toys:pool, history:(state.rotationHistory || []).slice(1), childAgeMonths, size:missing, now:new Date(now).getTime(), childDevelopmentProfile:state.profile?.developmentProfile || {}, developmentFeedbackHistory:state.developmentFeedbackHistory || [] }).selected.slice(0, missing);
  }
  const selected = [...kept, ...additions];
  for (const toy of additions) toy.lastActivatedAt = now;
  plan.toyIds = selected.map(toy => toy.id);
  plan.mechanisms = selected.flatMap(toy => toy.playMechanics || []);
  plan.rotationDiagnostics = buildCurrentDiagnostics(state, selected.length, childAgeMonths);
  normalizeCurrentShelf(state);
  return { selectedRotationCount:selected.length, shortageCount:Math.max(0, target - selected.length), addedIds:additions.map(toy => toy.id) };
}

function refreshLatestDiagnostics(state, childAgeMonths) {
  const plan = state.rotationHistory?.[0];
  if (!plan) return;
  const selectedCount = currentShelfCollections(state).rotation.length;
  plan.rotationDiagnostics = buildCurrentDiagnostics(state, selectedCount, childAgeMonths);
}

function buildCurrentDiagnostics(state, selectedRotationCount, childAgeMonths) {
  const requestedRotationCount = Math.max(1, Number(state.settings?.rotationSize) || 6);
  const classified = classifyCandidates(state.toys || [], childAgeMonths, state.profile?.developmentProfile || {});
  const permanentCount = classified.customPermanent.length;
  const manualCount = currentShelfCollections(state).manual.length;
  const ordinaryRotationCount = selectedRotationCount + manualCount;
  const shortageCount = Math.max(0, requestedRotationCount - ordinaryRotationCount);
  return withShelfCounts({
    requestedRotationCount, selectedRotationCount:ordinaryRotationCount, automaticRotationCount:selectedRotationCount, permanentCount,
    eligibleRotationCount:classified.eligible.length,
    requestedCount:requestedRotationCount, selectedCount:selectedRotationCount,
    uniqueSelectedCount:selectedRotationCount, eligibleCount:classified.eligible.length,
    shortageCount, shortageReason:shortageCount ? 'eligible_pool_exhausted' : null,
    exclusionSummary:{ totalToys:(state.toys || []).length, excludedByStatus:0, excludedHiddenOrArchived:classified.hiddenOrArchived, excludedParentContainers:classified.parentContainers, excludedByAgeRule:classified.ageRule, permanentToys:permanentCount, eligibleRotationCandidates:classified.eligible.length, scoredCandidates:classified.eligible.length, rankedCandidates:classified.eligible.length, duplicateRemovals:0, parentChildGroupConflictRemovals:0, cooldownOrRecentlyUsedRemovals:0, diversityCategoryBalanceRemovals:0, interestOrRotationRuleRemovals:0 }
  }, selectedRotationCount, permanentCount, manualCount);
}

function withShelfCounts(diagnostics = {}, selectedRotationCount, permanentCount, manualCount = 0) {
  const requestedRotationCount = diagnostics.requestedRotationCount ?? diagnostics.requestedCount ?? selectedRotationCount;
  const automaticRotationCount = diagnostics.automaticRotationCount ?? selectedRotationCount;
  const ordinaryRotationCount = diagnostics.selectedRotationCount ?? diagnostics.selectedCount ?? automaticRotationCount + manualCount;
  return { ...diagnostics, requestedRotationCount, selectedRotationCount:ordinaryRotationCount, automaticRotationCount, permanentCount, manualShelfCount:manualCount, totalShelfCount:automaticRotationCount + permanentCount + manualCount, eligibleRotationCount:diagnostics.eligibleRotationCount ?? diagnostics.eligibleCount ?? automaticRotationCount, requestedCount:requestedRotationCount, selectedCount:ordinaryRotationCount };
}

function rotationIdentityKeys(toy = {}) {
  return [toy.canonicalKey && `canonical:${toy.canonicalKey}`, toy.catalogId && `catalog:${toy.catalogId}`, toy.sku && `sku:${String(toy.sku).toLowerCase()}`].filter(Boolean);
}

function classifyCandidates(toys, age, profile = {}) {
  const result = { eligible:[], customPermanent:[], hiddenOrArchived:0, parentContainers:0, ageRule:0 };
  for (const toy of toys) {
    if (toy.hidden || toy.archived || isRotationPaused(toy)) { result.hiddenOrArchived++; continue; }
    if (toy.set?.kind === 'parent') { result.parentContainers++; continue; }
    if (isUserCustomPermanent(toy)) { result.customPermanent.push(toy); continue; }
    if (toy.manualShelfMode) { result.manualOverride = (result.manualOverride || 0) + 1; continue; }
    if (!hardSafetyEligible(toy, age, profile)) { result.ageRule++; continue; }
    result.eligible.push(toy);
  }
  return result;
}

function isEligible(toy, age, profile = {}) {
  return !toy.hidden && !toy.archived && !isRotationPaused(toy) && toy.set?.kind !== 'parent' && !isUserCustomPermanent(toy)
    && hardSafetyEligible(toy, age, profile);
}

// Only explicitly documented safety metadata can exclude a toy. Manufacturer
// recommended min/max ages remain guidance, never a proxy for a choking rule.
export function rotationAgeEligibility(toy, age, profile = {}) {
  const safety = toy.userMetadata?.safety || toy.safety || {};
  const status = catalogSafetyStatus(toy);
  const result = (eligible, reason) => ({ eligible, reason });
  if (age == null) {
    const eligible = !safety.requiresAgeConfirmation && !safety.chokingSmallParts && !safety.smallParts
      && !safety.requiresStandingStability && safety.minAgeMonths == null
      && safety.safetyMinAgeMonths == null && safety.hardMinAgeMonths == null
      && safety.requiredGrossMotorLevel == null && status !== 'GROSS_MOTOR_GATE';
    return result(eligible, eligible ? 'NORMAL_AGE_ELIGIBLE' : 'UNKNOWN_AGE_BLOCK');
  }
  const minimum = Number(safety.hardMinAgeMonths ?? safety.minAgeMonths ?? safety.safetyMinAgeMonths);
  if (Number.isFinite(minimum) && minimum > 0 && age < minimum) return result(false, 'HARD_SAFETY_BLOCK');
  if ((safety.chokingSmallParts === true || safety.smallParts === true || status === 'SMALL_PARTS_GATE') && age < 36) return result(false, 'HARD_SAFETY_BLOCK');
  const requiredBalance = Number(status === 'GROSS_MOTOR_GATE' || safety.requiresStandingStability === true ? safety.requiredGrossMotorLevel ?? 2 : safety.requiredGrossMotorLevel);
  if (Number.isFinite(requiredBalance) && requiredBalance > 0 && (profile.balance?.manualLevel ?? profile.balance?.currentLevel ?? 1) < requiredBalance) return result(false, 'HARD_SAFETY_BLOCK');
  if (safety.requiresAgeConfirmation === true) return result(false, 'HARD_SAFETY_BLOCK');
  if (toy.minAgeMonths != null && age < toy.minAgeMonths) {
    const policyOrigin=toy.eligibilityPolicyOrigin??toy.userMetadata?.developmentFit?.eligibilityPolicyOrigin;
    // A Catalog safety review with no documented hard gate is the only parent
    // challenge path. Explicit official AGE_ONLY evidence remains fail-closed.
    if (status === 'NO_DOCUMENTED_HARD_GATE' && policyOrigin !== 'OFFICIAL_EVIDENCE') return validCrossAgeApproval(toy, toy.crossAgeApproval)
      ? result(true, 'PARENT_APPROVED_CROSS_AGE') : result(false, 'PARENT_APPROVAL_REQUIRED');
    if (toy.earlyRotationEligibility === 'INSUFFICIENT_EVIDENCE') return result(false, 'INSUFFICIENT_EVIDENCE_BLOCK');
    if (toy.earlyRotationEligibility === 'AGE_RECOMMENDED_ONLY') return result(false, 'AGE_RECOMMENDED_ONLY_BLOCK');
    if (toy.earlyRotationEligibility === 'EARLY_ROTATION_ALLOWED') {
      const maximumEarlyMonths=Number(toy.maximumEarlyMonths ?? toy.userMetadata?.developmentFit?.maximumEarlyMonths);
      if (Number.isFinite(maximumEarlyMonths) && maximumEarlyMonths > 0 && toy.minAgeMonths-age>maximumEarlyMonths) return result(false, 'MAXIMUM_EARLY_WINDOW_BLOCK');
      return prerequisitesSatisfied(toy,profile)
      ? result(true, 'EARLY_ROTATION_ALLOWED') : result(false, 'PREREQUISITES_NOT_MET');
    }
    if (toy.earlyRotationEligibility === 'HARD_SAFETY_GATE') return result(false, 'HARD_SAFETY_BLOCK');
    if (status === 'VERIFIED_NO_EXTRA_GATE') return result(true, 'VERIFIED_CROSS_AGE_ALLOWED');
    if (['SMALL_PARTS_GATE','GROSS_MOTOR_GATE','OTHER_HARD_GATE'].includes(status)) return result(true, 'VERIFIED_CROSS_AGE_ALLOWED');
    if (status === 'NO_DOCUMENTED_HARD_GATE') return validCrossAgeApproval(toy, toy.crossAgeApproval)
      ? result(true, 'PARENT_APPROVED_CROSS_AGE') : result(false, 'PARENT_APPROVAL_REQUIRED');
    return result(false, 'UNKNOWN_AGE_BLOCK');
  }
  return result(true, 'NORMAL_AGE_ELIGIBLE');
}

export function hardSafetyEligible(toy, age, profile = {}) {
  return rotationAgeEligibility(toy, age, profile).eligible;
}

function isShelfVisible(toy) { return !toy.hidden && !toy.archived && toy.set?.kind !== 'parent'; }

function baseScore(toy, age, now, history, childDevelopmentProfile, developmentFeedbackHistory) {
  const monthsAhead = age == null || toy.minAgeMonths == null ? 0 : Math.max(0, toy.minAgeMonths - age);
  const ageGuidance = -Math.min(4, monthsAhead / 6);
  const lastActivated = new Date(toy.lastActivatedAt || 0).getTime();
  const freshness = Math.min(30, Math.max(0, (now - lastActivated) / 86400000 / 3));
  const interest = toy.interest === 'like' ? 12 : toy.interest === 'neutral' ? 4 : toy.interest === 'dislike' ? -18 : 0;
  const rotationValue = toy.rotationValue === 'high' ? 12 : toy.rotationValue === 'low' ? -5 : 0;
  const recency = rotationRecencyAdjustment(toy, history);
  const development = developmentFit(toy, childDevelopmentProfile, developmentFeedbackHistory);
  return { score:ageGuidance + freshness + interest + rotationValue + recency.value + development.score * 2, recencyPenalty:recency.penalty, development };
}

function diversityAdjustment(candidate, selected, history, relations) {
  let value = recentMechanicAdjustment(candidate, history);
  let brandPenalty = 0;
  let groupPenalty = 0;
  const sameBrand = selected.filter(chosen => normalizedBrand(chosen) === normalizedBrand(candidate)).length;
  if (sameBrand) { brandPenalty = 9 * sameBrand; value -= brandPenalty; }
  const candidateGroup = ownershipGroupKey(candidate);
  const sameGroup = candidateGroup ? selected.filter(chosen => ownershipGroupKey(chosen) === candidateGroup).length : 0;
  if (sameGroup) { groupPenalty = 11 * sameGroup; value -= groupPenalty; }
  for (const chosen of selected) {
    const relation = cachedRelation(candidate, chosen, relations);
    if (relation.level === 'exact_duplicate' || relation.level === 'high_substitution') value -= 26;
    else if (relation.level === 'medium_substitution') value -= 9;
    // category and skills are deliberately only a final gentle balance.
    if (candidate.categoryCode && candidate.categoryCode === chosen.categoryCode) value -= 2;
    if ((candidate.skillCodes || []).some(skill => (chosen.skillCodes || []).includes(skill))) value -= 1;
  }
  return { value, brandPenalty, groupPenalty };
}

function rotationRecencyAdjustment(toy, history) {
  const index = history.slice(0, 3).findIndex(round => (round.toyIds || []).includes(toy.id));
  if (index === -1) return { value:8, penalty:0 };
  // These are intentionally strong but remain score penalties, never hard
  // exclusions: a small eligible pool can still fill the requested target.
  const penalty = [240, 150, 80][index];
  return { value:-penalty, penalty };
}

function normalizedBrand(toy) { return String(toy.brand || 'other').trim().toLocaleLowerCase() || 'other'; }
function ownershipGroupKey(toy = {}) {
  const set = toy.set || {};
  return set.ownershipGroupId || set.generatedFromParentId || set.parentOwnershipId || set.parentId || set.parentCanonicalKey || toy.parentCanonicalKey || null;
}
function countBy(items, keyOf) { const counts = {}; for (const item of items) { const key = keyOf(item); if (key) counts[key] = (counts[key] || 0) + 1; } return counts; }
function overlapCount(ids, otherIds) { const other = new Set(otherIds); return [...ids].filter(id => other.has(id)).length; }

function recentMechanicAdjustment(candidate, history) {
  const recent = new Set(history.slice(0, 3).flatMap(round => round.mechanisms || []));
  const repeated = (candidate.playMechanics || []).filter(mechanic => !GENERIC_MECHANICS.has(mechanic) && recent.has(mechanic));
  return repeated.length ? -8 * Math.min(repeated.length, 2) : 0;
}

function cachedRelation(a, b, relations) {
  const key = [a.id, b.id].sort().join('|');
  if (!relations.has(key)) relations.set(key, assess(a, b));
  return relations.get(key);
}
