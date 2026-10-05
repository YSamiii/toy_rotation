import { unique } from '../data/schema.js';

const GENERIC = new Set(['construction_general','pretend_play_general','sensory_general']);
export const DEVELOPMENT_ABILITY_GROUPS = Object.freeze([
  { key:'thinking', mechanisms:['puzzle','matching_sorting','shape_sorting','counting_quantity','color_pattern'] },
  { key:'hands', mechanisms:['blocks_build','screw_bolt_tool','threading_lacing','lock_key','magnetic_build','fine_motor_general'] },
  { key:'exploration', mechanisms:['cause_effect','pretend_role','music_play','balance'] }
]);
const PROFILE_ALIASES = Object.freeze({ jigsaw:'puzzle', maze_logic:'puzzle', matching:'matching_sorting', stacking:'blocks_build', stack_balance:'balance', magnetic_fishing:'magnetic_build', marble_track:'cause_effect', ball_drop:'cause_effect', posting:'cause_effect', 'cause effect':'cause_effect', 'key lock':'lock_key', fine_motor:'fine_motor_general', 'interlocking blocks':'blocks_build', cooking_serving:'pretend_role', care_doll:'pretend_role', repair_build_role:'pretend_role', ride_balance:'balance', pull_push_walk:'balance', throw_catch_ball:'balance' });
export function abilityMechanismKey(mechanic) { return PROFILE_ALIASES[mechanic] || mechanic; }
function profileEntry(profile, mechanic) {
  return profile[mechanic] || Object.entries(profile).find(([key]) => abilityMechanismKey(key) === mechanic)?.[1] || null;
}
const BASE_LEVEL = {
  posting:1, shape_sorting:2, puzzle:2, matching_sorting:2, stacking:1,
  threading_lacing:3, lock_key:3, screw_bolt_tool:3, ball_drop:1,
  blocks_build:2, magnetic_build:3, pretend_role:2, vehicles_tracks:2,
  pull_push_walk:1, magnetic_fishing:3, maze_logic:4, jigsaw:3,
  balance:3, stack_balance:3, marble_track:2, cause_effect:2, music_play:1, sensory:1, fine_motor_general:2,
  counting_quantity:3, color_pattern:2
};

export function developmentMechanics(toy = {}) {
  const explicit = unique(toy.playMechanics || []).filter(mechanic => !GENERIC.has(mechanic));
  const text = [toy.productName,toy.names?.en,toy.names?.zh,...(toy.aliases || [])].filter(Boolean).join(' ').toLowerCase();
  const cognitiveSignals = [];
  if (/count|number|quantity|数字|数量|计数/.test(text)) cognitiveSignals.push('counting_quantity');
  if (/color|colour|pattern|颜色|图案|规律/.test(text)) cognitiveSignals.push('color_pattern');
  if (explicit.length) return unique([...explicit, ...cognitiveSignals]);
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
  inferred.push(...cognitiveSignals);
  if (/tweezer|grasp|pinch|夹子|镊子|抓握/.test(text)) inferred.push('fine_motor_general');
  if (/music|instrument|音乐|乐器/.test(text)) inferred.push('music_play');
  if (/balance|ride|walk|平衡|骑乘|学步/.test(text)) inferred.push('balance');
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

export function updateDevelopmentProfile(history = [], existing = {}) {
  const profile = Object.fromEntries(Object.entries(existing || {}).map(([key, value]) => {
    const baselineLevel = value.baselineLevel ?? value.autoLevel ?? value.currentLevel ?? 1;
    return [key, { ...value, baselineLevel, autoLevel:baselineLevel, evidenceCount:0, confidence:0.35 }];
  }));
  for (const [key,value] of Object.entries(profile)) {
    const canonical = abilityMechanismKey(key);
    if (canonical !== key && !profile[canonical]) profile[canonical] = { ...value };
  }
  for (const record of history) {
    if (!record || record.interestFeedback === 'not_interested') continue;
    for (const mechanic of unique((record.mechanisms || []).map(abilityMechanismKey))) {
      const entry = profile[mechanic] ||= { currentLevel:1, baselineLevel:1, autoLevel:1, confidence:0.35, evidenceCount:0, lastUpdated:null };
      entry.evidenceCount++;
      entry.lastUpdated = record.timestamp || entry.lastUpdated;
      const level = clamp(Number(record.progressionLevel) || 1, 1, 5);
      if (record.difficultyFeedback === 'too_easy') {
        entry.confidence = clamp(entry.confidence + 0.12, 0, 1);
        if (count(history, mechanic, 'too_easy', level) >= 2) entry.autoLevel = Math.max(entry.autoLevel, Math.min(5, level + 1));
      } else if (record.difficultyFeedback === 'good_challenge') {
        entry.confidence = clamp(entry.confidence + 0.09, 0, 1);
        if (count(history, mechanic, 'good_challenge', level) >= 2) entry.autoLevel = Math.max(entry.autoLevel, level);
      } else if (record.difficultyFeedback === 'just_right') {
        entry.confidence = clamp(entry.confidence + 0.04, 0, 1);
        if (count(history, mechanic, 'just_right', level) >= 3) entry.autoLevel = Math.max(entry.autoLevel, Math.min(level, entry.autoLevel + 1));
      } else if (record.difficultyFeedback === 'too_hard') {
        entry.confidence = clamp(entry.confidence - 0.08, 0.1, 1);
        if (count(history, mechanic, 'too_hard', level) >= 2) entry.autoLevel = Math.min(entry.autoLevel, Math.max(1, level - 1));
      }
    }
  }
  for (const entry of Object.values(profile)) entry.currentLevel = entry.manualLevel ?? entry.autoLevel ?? entry.currentLevel ?? 1;
  return profile;
}

export function setManualAbility(profile = {}, mechanic, level = null) {
  const key = abilityMechanismKey(mechanic);
  const allowed = DEVELOPMENT_ABILITY_GROUPS.some(group => group.mechanisms.includes(key));
  if (!allowed) throw new Error('unknownDevelopmentMechanism');
  const manualLevel = level == null || level === '' ? null : Number(level);
  if (manualLevel != null && ![1,2,3,5].includes(manualLevel)) throw new Error('invalidDevelopmentLevel');
  const entry = profile[key] ||= { currentLevel:1, baselineLevel:1, autoLevel:1, confidence:0.35, evidenceCount:0, lastUpdated:null };
  entry.manualLevel = manualLevel;
  entry.currentLevel = manualLevel ?? entry.autoLevel ?? 1;
  return entry;
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
  state.profile.developmentProfile = updateDevelopmentProfile(state.developmentFeedbackHistory, state.profile.developmentProfile);
  return record;
}

export function developmentFit(toy, profile = {}, history = []) {
  const fields = normalizeDevelopmentFields(toy);
  const mechanics = developmentMechanics(toy);
  if (!mechanics.length) return { score:12, kind:'cold_start', challengeLevel:fields.challengeLevel, progressionLevel:fields.progressionLevel };
  const scores = unique(mechanics.map(abilityMechanismKey)).map(mechanic => {
    const entry = profileEntry(profile, mechanic);
    const mastery = entry?.manualLevel ?? entry?.currentLevel ?? 2;
    const delta = fields.progressionLevel - mastery;
    let score = delta === 0 ? 42 : delta === 1 ? 32 : delta === -1 ? 12 : delta <= -2 ? -24 : -28;
    const recent = history.filter(item => item.mechanisms?.some(value => abilityMechanismKey(value) === mechanic));
    if (recent.some(item => item.difficultyFeedback === 'too_easy' && item.progressionLevel >= fields.progressionLevel)) score -= 22;
    if (recent.some(item => item.difficultyFeedback === 'too_hard' && item.progressionLevel <= fields.progressionLevel)) score -= 25;
    const goodChallenge = recent.filter(item => item.difficultyFeedback === 'good_challenge');
    if (goodChallenge.some(item => Number(item.progressionLevel) === fields.progressionLevel - 1)) score += 24;
    else if (goodChallenge.some(item => Number(item.progressionLevel) === fields.progressionLevel)) score += 6;
    return score;
  });
  const score = Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
  const deltas = unique(mechanics.map(abilityMechanismKey)).map(mechanic => { const entry=profileEntry(profile, mechanic); return fields.progressionLevel - (entry?.manualLevel ?? entry?.currentLevel ?? 2); });
  const averageDelta = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
  const kind = score < -10 ? 'too_easy_or_hard' : averageDelta >= 0.5 && averageDelta <= 1.5 && score >= 20 ? 'good_challenge' : Math.abs(averageDelta) < 0.5 && score >= 25 ? 'just_right' : 'familiar';
  return { score, kind, challengeLevel:fields.challengeLevel, progressionLevel:fields.progressionLevel };
}

function count(history, mechanic, feedback, level) { return history.filter(item => item?.mechanisms?.some(value => abilityMechanismKey(value) === mechanic) && item.difficultyFeedback === feedback && Number(item.progressionLevel) === level).length; }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
