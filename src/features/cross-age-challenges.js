import { catalogSafetyStatus, crossAgeApprovalFor, crossAgeChoiceFor, withCatalogSafety } from '../domain/catalog-safety.js';
import { isRotationPaused, isUserCustomPermanent, rotationAgeEligibility } from '../domain/rotation-engine.js';

export function challengeDecision(state, catalog, toy, age, profile = {}) {
  const row = catalog.resolve(toy);
  if (!row || age == null) return null;
  const projected = { ...withCatalogSafety(toy, row), minAgeMonths:row.minAgeMonths };
  const approval = crossAgeApprovalFor(state, projected);
  return {
    row, projected, approval,
    choice:crossAgeChoiceFor(state, projected),
    decision:rotationAgeEligibility({ ...projected, crossAgeApproval:approval }, age, profile)
  };
}

export function parentApprovableChallenge(state, catalog, toy, age, profile = {}) {
  if (!toy || toy.hidden || toy.archived || toy.set?.kind === 'parent'
      || isRotationPaused(toy) || isUserCustomPermanent(toy)) return null;
  const review = challengeDecision(state, catalog, toy, age, profile);
  if (!review || catalogSafetyStatus(review.row) !== 'NO_DOCUMENTED_HARD_GATE'
      || review.row.minAgeMonths == null || age >= review.row.minAgeMonths) return null;
  return ['PARENT_APPROVAL_REQUIRED', 'PARENT_APPROVED_CROSS_AGE'].includes(review.decision.reason)
    ? { toy, ...review } : null;
}

export function parentApprovableChallenges(state, catalog, age, profile = {}) {
  return (state.toys || []).map(toy => parentApprovableChallenge(state, catalog, toy, age, profile))
    .filter(Boolean);
}
