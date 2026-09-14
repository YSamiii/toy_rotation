import { unique } from '../data/schema.js';

const GENERIC = new Set(['fine_motor_general','construction_general','pretend_play_general','sensory_general']);
const BASE_LEVEL = {
  posting:1, shape_sorting:2, puzzle:2, matching_sorting:2, stacking:1,
  threading_lacing:3, lock_key:3, screw_bolt_tool:3, ball_drop:1,
  blocks_build:2, magnetic_build:3, pretend_role:2, vehicles_tracks:2,
  pull_push_walk:1, magnetic_fishing:3, maze_logic:4, jigsaw:3,
  balance:3, cause_effect:2, music_play:1, sensory:1
};

export function developmentMechanics(toy = {}) {
  const explicit = unique(toy.playMechanics || []).filter(mechanic => !GENERIC.has(mechanic));
  if (explicit.length) return explicit;
  const text = [toy.productName,toy.names?.en,toy.names?.zh,...(toy.aliases || [])].filter(Boolean).join(' ').toLowerCase();
  const inferred = [];
  if (/shape|形状|sort|分类/.test(text)) inferred.push('shape_sorting');
  if (/post|drop|投放|球.*落/.test(text)) inferred.push('posting');
  if (/puzzle|拼图/.test(text)) inferred.push('puzzle');
  if (/match|配对/.test(text)) inferred.push('matching_sorting');
  if (/stack|叠|tower/.test(text)) inferred.push('stacking');
  if (/thread|lace|串|穿线/.test(text)) inferred.push('threading_lacing');
  if (/lock|key|锁|钥匙/.test(text)) inferred.push('lock_key');
  if (/screw|tool|螺丝|工具/.test(text)) inferred.push('screw_bolt_tool');
  if (/track|rail|vehicle|车|轨道/.test(text)) inferred.push('track_vehicle');
  if (/block|build|积木|建构/.test(text)) inferred.push('blocks_build');
  if (/pretend|kitchen|doctor|role|角色|厨房|医生/.test(text)) inferred.push('pretend_role');
  if (inferred.length) return unique(inferred);
  const category = String(toy.categoryCode || '').toLowerCase();
  if (category.includes('puzzle') || category.includes('matching')) return ['puzzle'];
  if (category.includes('blocks') || category.includes('construction')) return ['blocks_build'];
  if (category.includes('fine_motor')) return ['fine_motor'];
  if (category.includes('pretend')) return ['pretend_role'];
  if (category.includes('vehicles')) return ['track_vehicle'];
  if (category.includes('music')) return ['music_play'];
  if (category.includes('sensory')) return ['sensory'];
  return [];
}

export function challengeLevel(toy = {}) {
  const explicit = Number(toy.challengeLevel);
  if (Number.isInteger(explicit) && explicit >= 1 && explicit <= 5) return explicit;
  const mechanics = developmentMechanics(toy);
  const baseline = mechanics.length ? Math.max(...mechanics.map(mechanic => BASE_LEVEL[mechanic] || 2)) : 2;
  const steps = Math.min(2, Math.max(0, (toy.goalCodes?.length || 0) + (toy.operationCode ? 1 : 0) - 1));
  const combinations = toy.childCount >= 12 ? 2 : toy.childCount >= 6 ? 1 : 0;
  return clamp(baseline + Math.max(steps, combinations), 1, 5);
}

export function progressionLevel(toy = {}) {
  const explicit = Number(toy.progressionLevel);
  if (Number.isInteger(explicit) && explicit >= 1 && explicit <= 5) return explicit;
  const mechanics = developmentMechanics(toy);
  const baseline = mechanics.length ? Math.max(...mechanics.map(mechanic => BASE_LEVEL[mechanic] || 2)) : 2;
  const combinations = toy.childCount >= 12 ? 2 : toy.childCount >= 6 ? 1 : 0;
  const multiMechanic = mechanics.length >= 3 ? 1 : 0;
  return clamp(baseline + Math.max(combinations, multiMechanic), 1, 5);
}

export function normalizeDevelopmentFields(toy = {}) {
  return { challengeLevel:challengeLevel(toy), progressionLevel:progressionLevel(toy) };
}

export function emptyDevelopmentProfile() { return {}; }

export function updateDevelopmentProfile(history = []) {
  const profile = {};
  for (const record of history) {
    if (!record || record.interestFeedback === 'not_interested') continue;
    for (const mechanic of unique(record.mechanisms || [])) {
      const entry = profile[mechanic] ||= { currentLevel:1, confidence:0.35, evidenceCount:0, lastUpdated:null };
      entry.evidenceCount++;
      entry.lastUpdated = record.timestamp || entry.lastUpdated;
      const level = clamp(Number(record.progressionLevel) || 1, 1, 5);
      if (record.difficultyFeedback === 'too_easy') {
        entry.confidence = clamp(entry.confidence + 0.12, 0, 1);
        if (count(history, mechanic, 'too_easy', level) >= 2) entry.currentLevel = Math.max(entry.currentLevel, Math.min(5, level + 1));
      } else if (record.difficultyFeedback === 'good_challenge') {
        entry.confidence = clamp(entry.confidence + 0.09, 0, 1);
        if (count(history, mechanic, 'good_challenge', level) >= 2) entry.currentLevel = Math.max(entry.currentLevel, level);
      } else if (record.difficultyFeedback === 'just_right') {
        entry.confidence = clamp(entry.confidence + 0.04, 0, 1);
        entry.currentLevel = Math.max(entry.currentLevel, Math.min(level, entry.currentLevel + (count(history, mechanic, 'just_right', level) >= 3 ? 1 : 0)));
      } else if (record.difficultyFeedback === 'too_hard') {
        entry.confidence = clamp(entry.confidence - 0.08, 0.1, 1);
      }
    }
  }
  return profile;
}

export function recordDevelopmentFeedback(state, toy, { difficultyFeedback = null, interestFeedback = null, now = new Date().toISOString(), rotationCycleId = null } = {}) {
  const difficulty = ['too_easy','just_right','good_challenge','too_hard'].includes(difficultyFeedback) ? difficultyFeedback : null;
  const interest = interestFeedback === 'not_interested' ? 'not_interested' : null;
  if (!difficulty && !interest) throw new Error('developmentFeedbackRequired');
  const fields = normalizeDevelopmentFields(toy);
  const record = { id:`${toy.id}:${rotationCycleId || 'current'}`, toyId:toy.id, canonicalKey:toy.canonicalKey || null, mechanisms:developmentMechanics(toy), progressionLevel:fields.progressionLevel, challengeLevel:fields.challengeLevel, difficultyFeedback:difficulty, interestFeedback:interest, timestamp:now, rotationCycleId:rotationCycleId || null };
  const previous = Array.isArray(state.developmentFeedbackHistory) ? state.developmentFeedbackHistory : [];
  state.developmentFeedbackHistory = [...previous.filter(item => item.id !== record.id), record].slice(-240);
  state.profile ||= {};
  state.profile.developmentProfile = updateDevelopmentProfile(state.developmentFeedbackHistory);
  return record;
}

export function developmentFit(toy, profile = {}, history = []) {
  const fields = normalizeDevelopmentFields(toy);
  const mechanics = developmentMechanics(toy);
  if (!mechanics.length) return { score:12, kind:'cold_start', challengeLevel:fields.challengeLevel, progressionLevel:fields.progressionLevel };
  const scores = mechanics.map(mechanic => {
    const mastery = profile[mechanic]?.currentLevel || 2;
    const delta = fields.progressionLevel - mastery;
    let score = delta === 0 ? 42 : delta === 1 ? 32 : delta === -1 ? 12 : delta <= -2 ? -24 : -28;
    const recent = history.filter(item => item.mechanisms?.includes(mechanic));
    if (recent.some(item => item.difficultyFeedback === 'too_easy' && item.progressionLevel >= fields.progressionLevel)) score -= 22;
    if (recent.some(item => item.difficultyFeedback === 'too_hard' && item.progressionLevel <= fields.progressionLevel)) score -= 18;
    const goodChallenge = recent.filter(item => item.difficultyFeedback === 'good_challenge');
    if (goodChallenge.some(item => Number(item.progressionLevel) === fields.progressionLevel - 1)) score += 24;
    else if (goodChallenge.some(item => Number(item.progressionLevel) === fields.progressionLevel)) score += 6;
    return score;
  });
  const score = Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
  return { score, kind:score >= 35 ? 'just_right' : score >= 20 ? 'good_challenge' : score < -10 ? 'too_easy_or_hard' : 'familiar', challengeLevel:fields.challengeLevel, progressionLevel:fields.progressionLevel };
}

function count(history, mechanic, feedback, level) { return history.filter(item => item?.mechanisms?.includes(mechanic) && item.difficultyFeedback === feedback && Number(item.progressionLevel) === level).length; }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
