import { canonicalKey, unique } from '../data/schema.js';

const GENERIC_MECHANICS = new Set(['fine_motor_general','construction_general','pretend_play_general','sensory_general']);
const SPECIFIC_SKILLS = new Set(['logic','math','sorting','memory','problem_solving','cause_effect','spatial_awareness','visual_spatial','matching','practical_life']);

export class SubstitutionEngine {
  #cache = new Map(); #libraryRevision = -1;
  result(candidate, toys, revision, { childAgeMonths = null } = {}) {
    if (this.#libraryRevision !== revision) { this.#cache.clear(); this.#libraryRevision = revision; }
    const key = `${canonicalKey(candidate.canonicalKey)}|${revision}|${childAgeMonths ?? 'all'}`;
    if (this.#cache.has(key)) return this.#cache.get(key);
    const allRelationships = toys
      .filter(toy => !toy.hidden && !toy.archived && toy.set?.kind !== 'parent')
      .map(toy => assess(candidate, toy, { childAgeMonths }))
      .filter(item => item.level !== 'none')
      .sort(compareRelationship);
    const relationships = allRelationships.filter(item => item.level !== 'skill_similarity_only');
    const skillRelationships = allRelationships.filter(item => item.level === 'skill_similarity_only');
    const purchaseAffecting = relationships.filter(item => ['exact_duplicate','high_substitution','medium_substitution'].includes(item.level));
    const result = {
      engineVersion: 'clean-2', canonicalKey: canonicalKey(candidate.canonicalKey), relationships, skillRelationships,
      counts: count(allRelationships), ageAppropriateCounts: count(purchaseAffecting.filter(item => item.ageAppropriate)),
      purchaseImpact: priority(purchaseAffecting.filter(item => item.ageAppropriate))
    };
    this.#cache.set(key, result); return result;
  }
}

export function assess(a, b, { childAgeMonths = null } = {}) {
  const exact = canonicalKey(a.canonicalKey) && canonicalKey(a.canonicalKey) === canonicalKey(b.canonicalKey);
  const aMechanics = specificMechanics(a), bMechanics = specificMechanics(b);
  const sharedMechanics = aMechanics.filter(value => bMechanics.includes(value));
  const sharedSkills = unique(a.skillCodes || []).filter(value => (b.skillCodes || []).includes(value));
  const specificSkills = sharedSkills.filter(value => SPECIFIC_SKILLS.has(value));
  const operationSimilarity = operationScore(a, b); const goalSimilarity = overlap(a.goalCodes, b.goalCodes); const sceneSimilarity = overlap(a.sceneCodes, b.sceneCodes);
  const score = exact ? 100 : sharedMechanics.length * 32 + operationSimilarity * 15 + goalSimilarity * 12 + sceneSimilarity * 12 + specificSkills.length * 5;
  let level = 'none';
  if (exact) level = 'exact_duplicate';
  else if (sharedMechanics.length >= 2 || (sharedMechanics.length >= 1 && (operationSimilarity || goalSimilarity || sceneSimilarity)) || score >= 58) level = 'high_substitution';
  else if (sharedMechanics.length >= 1 || ((operationSimilarity || goalSimilarity || sceneSimilarity) && specificSkills.length > 0) || score >= 28) level = 'medium_substitution';
  else if (sharedSkills.length > 0) level = 'skill_similarity_only';
  return { toy: b, toyId: b.id, level, score, sharedMechanics, operationSimilarity, goalSimilarity, sceneSimilarity, sharedSkillCodes: sharedSkills, reasonCode: reason(sharedMechanics, operationSimilarity, goalSimilarity, sceneSimilarity, sharedSkills), ageAppropriate: ageAppropriate(b, childAgeMonths) };
}
function specificMechanics(toy) { return unique(toy.playMechanics || []).filter(value => !GENERIC_MECHANICS.has(value)); }
function overlap(a = [], b = []) { return unique(a).filter(value => b.includes(value)).length; }
function operationScore(a, b) { return a.operationCode && a.operationCode === b.operationCode ? 1 : 0; }
function ageAppropriate(toy, age) { return age == null || (toy.minAgeMonths == null || age >= toy.minAgeMonths - 3) && (toy.maxAgeMonths == null || age <= toy.maxAgeMonths + 12); }
function reason(mechanics, operation, goal, scene, skills) { if (mechanics.length) return `mechanic:${mechanics[0]}`; if (operation) return 'operation'; if (scene) return 'scene'; if (goal) return 'goal'; if (skills.length) return 'skill'; return 'none'; }
function count(rows) { return rows.reduce((result, row) => ({ ...result, [row.level]: (result[row.level] || 0) + 1 }), { exact_duplicate:0, high_substitution:0, medium_substitution:0, skill_similarity_only:0 }); }
function priority(rows) { const exact = rows.filter(row => row.level === 'exact_duplicate').length; const high = rows.filter(row => row.level === 'high_substitution').length; const medium = rows.filter(row => row.level === 'medium_substitution').length; const penalty = exact * 100 + high * 30 + medium * 12; return { overlapPenalty: penalty, priority: exact || high >= 2 ? 'low' : high || medium >= 3 ? 'medium' : 'high' }; }
function compareRelationship(a, b) { const rank = {exact_duplicate:4,high_substitution:3,medium_substitution:2,skill_similarity_only:1}; return rank[b.level] - rank[a.level] || b.score - a.score || String(a.toy.productName).localeCompare(String(b.toy.productName)); }
