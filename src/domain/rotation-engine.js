import { assess } from './substitution-engine.js';

const GENERIC_MECHANICS = new Set(['fine_motor_general', 'construction_general', 'pretend_play_general', 'sensory_general']);

// One scoring pipeline: eligibility → base value → recent history → real
// substitution/mechanics → small category/skill tie-breakers.
export function generateRotation({ toys, history = [], childAgeMonths, size = 6, now = Date.now() }) {
  const permanent = toys.filter(toy => isEligible(toy, childAgeMonths) && toy.shelfMode === 'permanent');
  const candidates = toys
    .filter(toy => isEligible(toy, childAgeMonths) && toy.shelfMode !== 'permanent')
    .map(toy => ({ toy, score: baseScore(toy, childAgeMonths, now, history) }))
    .sort((a, b) => b.score - a.score);
  const selected = [...permanent];
  const relations = new Map();

  while (selected.length < size && candidates.length) {
    const next = candidates
      .map(entry => ({ ...entry, adjusted: entry.score + diversityAdjustment(entry.toy, selected, history, relations) }))
      .sort((a, b) => b.adjusted - a.adjusted || a.toy.productName.localeCompare(b.toy.productName))[0];
    selected.push(next.toy);
    candidates.splice(candidates.indexOf(next), 1);
  }
  return selected;
}

function isEligible(toy, age) {
  return !toy.hidden && !toy.archived && toy.set?.kind !== 'parent'
    && (toy.minAgeMonths == null || age >= toy.minAgeMonths - 3);
}

function baseScore(toy, age, now, history) {
  const ageFit = toy.maxAgeMonths == null || age <= toy.maxAgeMonths + 12 ? 40 : 16;
  const lastActivated = new Date(toy.lastActivatedAt || 0).getTime();
  const freshness = Math.min(30, Math.max(0, (now - lastActivated) / 86400000 / 3));
  const interest = toy.interest === 'like' ? 12 : toy.interest === 'neutral' ? 4 : toy.interest === 'dislike' ? -18 : 0;
  const rotationValue = toy.rotationValue === 'high' ? 12 : toy.rotationValue === 'low' ? -5 : 0;
  const repeatedToy = history.slice(0, 3).some(round => (round.toyIds || []).includes(toy.id)) ? -25 : 0;
  return ageFit + freshness + interest + rotationValue + repeatedToy;
}

function diversityAdjustment(candidate, selected, history, relations) {
  let value = recentMechanicAdjustment(candidate, history);
  for (const chosen of selected) {
    const relation = cachedRelation(candidate, chosen, relations);
    if (relation.level === 'exact_duplicate' || relation.level === 'high_substitution') value -= 26;
    else if (relation.level === 'medium_substitution') value -= 9;
    // category and skills are deliberately only a final gentle balance.
    if (candidate.categoryCode && candidate.categoryCode === chosen.categoryCode) value -= 2;
    if ((candidate.skillCodes || []).some(skill => (chosen.skillCodes || []).includes(skill))) value -= 1;
  }
  return value;
}

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
