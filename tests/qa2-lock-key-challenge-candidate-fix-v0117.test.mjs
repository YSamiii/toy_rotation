import assert from 'node:assert/strict';
import data from '../catalog-base.json' with {type:'json'};
import { normalizeCatalogToy, emptyState } from '../src/data/schema.js';
import { withEarlyRotationBaseline } from '../src/domain/early-rotation-baseline.js';
import { rotationAgeEligibility } from '../src/domain/rotation-engine.js';
import { challengeDecision, parentApprovableChallenges } from '../src/features/cross-age-challenges.js';

const rows=new Map((data.entries||data).map(raw=>{const row=withEarlyRotationBaseline(normalizeCatalogToy(raw));return [row.canonicalKey,row];}));
const catalog={resolve:ref=>rows.get(ref?.canonicalKey)||null};
const toy=(id,canonicalKey,minAgeMonths)=>({id,canonicalKey,productName:canonicalKey,brand:'Fixture',minAgeMonths});
const state=emptyState();
// `lock` deliberately carries the stale persisted 36m value from QA2; runtime
// projection must use the corrected current Catalog age instead.
state.toys=[
  toy('lock','lr-lock-key-clubhouse',36),
  toy('jelly','mideer-reusable-jelly-sticker-busy-animal-town',36),
  toy('plantoys','plantoys-fruit-vegetable-play-set',18),
  toy('bunny','smartgames-bunny-boo',24),
  toy('day-night','smartgames-day-night',24),
  toy('early','lr-hide-seek-vegetable-garden',18),
  toy('age-only','lr-a-to-z-mini-foods',36),
  toy('hard','lr-mini-farmstand-sorting-set',36)
];
const lock=rows.get('lr-lock-key-clubhouse');
assert.ok(lock); assert.equal(lock.sku,'LER9807'); assert.equal(lock.minAgeMonths,18);
assert.equal([...rows.values()].filter(row=>row.canonicalKey==='lr-lock-key-clubhouse').length,1,'one logical Lock & Key identity');
assert.equal(rotationAgeEligibility(lock,17,{}).reason,'PARENT_APPROVAL_REQUIRED');
assert.equal(rotationAgeEligibility(lock,18,{}).reason,'NORMAL_AGE_ELIGIBLE');
assert.equal(rotationAgeEligibility(lock,19,{}).reason,'NORMAL_AGE_ELIGIBLE');
const lockReview=challengeDecision(state,catalog,state.toys[0],19,{});
assert.equal(lockReview.row.minAgeMonths,18,'challenge projection uses corrected catalog age, not stale persisted age');
assert.equal(lockReview.projected.minAgeMonths,18);
const at19=parentApprovableChallenges(state,catalog,19,{});
assert.deepEqual(at19.map(item=>item.row.canonicalKey),['mideer-reusable-jelly-sticker-busy-animal-town','smartgames-bunny-boo','smartgames-day-night'],'only below-guidance NO_DOCUMENTED_HARD_GATE toys remain parent-approvable at 19m');
assert.ok(!at19.some(item=>item.row.canonicalKey==='lr-lock-key-clubhouse'),'age-eligible Lock & Key is never an override candidate');
assert.ok(!at19.some(item=>item.row.canonicalKey==='plantoys-fruit-vegetable-play-set'),'other age-eligible toys are excluded');
assert.ok(!at19.some(item=>item.row.canonicalKey==='lr-a-to-z-mini-foods'),'AGE_RECOMMENDED_ONLY is not parent-overridable');
assert.ok(!at19.some(item=>item.row.canonicalKey==='lr-mini-farmstand-sorting-set'),'hard safety is not parent-overridable');
assert.ok(!at19.some(item=>item.row.canonicalKey==='lr-hide-seek-vegetable-garden'),'AUTO EARLY is not duplicated in parent challenge UI');
const early=rows.get('lr-hide-seek-vegetable-garden');
const profile=Object.fromEntries(Object.entries(early.prerequisiteSkills).map(([skill,level])=>[skill,{currentLevel:level}]));
assert.equal(rotationAgeEligibility(early,17,profile).reason,'EARLY_ROTATION_ALLOWED');
assert.equal(rotationAgeEligibility(early,17,{}).reason,'PREREQUISITES_NOT_MET');
const hard=rows.get('lr-mini-farmstand-sorting-set');
assert.equal(rotationAgeEligibility(hard,19,{sorting:{currentLevel:5},matching:{currentLevel:5},earlyMath:{currentLevel:5},fineMotor:{currentLevel:5}}).reason,'HARD_SAFETY_BLOCK');
console.log('QA2 Lock & Key / challenge candidate fix: PASS');
