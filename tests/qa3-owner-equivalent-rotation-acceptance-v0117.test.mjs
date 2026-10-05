import assert from 'node:assert/strict';
import data from '../catalog-base.json' with {type:'json'};
import { emptyState, normalizeCatalogToy } from '../src/data/schema.js';
import { EARLY_ROTATION_EVIDENCE_BATCH_2 } from '../src/data/early-rotation-evidence-batch2.js';
import { withEarlyRotationBaseline } from '../src/domain/early-rotation-baseline.js';
import { rotationAgeEligibility, selectRotation } from '../src/domain/rotation-engine.js';
import { parentApprovableChallenges } from '../src/features/cross-age-challenges.js';

const CHILD_AGE_MONTHS=19;
const rows=(data.entries||data).map(raw=>withEarlyRotationBaseline(normalizeCatalogToy(raw)));
const byKey=new Map(rows.map(row=>[row.canonicalKey,row]));
const advancedProfile=Object.fromEntries([
  'fineMotor','visualSpatial','attentionPersistence','problemSolving','matching','sorting',
  'earlyMath','pretendPlay','causeEffect','toolUse','language','grossMotor'
].map(skill=>[skill,{currentLevel:5}]));
const toyFor=(canonicalKey,index)=>{
  const row=byKey.get(canonicalKey);
  assert.ok(row,`missing Catalog row ${canonicalKey}`);
  return {...row,id:`owner-equivalent-${index}`,status:'stored',rotationValue:'high'};
};
const batch2Keys=Object.keys(EARLY_ROTATION_EVIDENCE_BATCH_2);
const state=emptyState();
state.toys=[
  ...batch2Keys.map(toyFor),
  toyFor('lr-lock-key-clubhouse','lock'),
  // This is an explicit NO_DOCUMENTED_HARD_GATE control. It proves the list
  // still contains manual-review candidates while official policies stay out.
  toyFor('mideer-reusable-jelly-sticker-busy-animal-town','manual-control')
];
const catalog={resolve:ref=>byKey.get(ref?.canonicalKey)||null};
const challenge=parentApprovableChallenges(state,catalog,CHILD_AGE_MONTHS,advancedProfile);
const challengeKeys=challenge.map(item=>item.row.canonicalKey);

// 19m owner-equivalent challenge list: one deliberate manual-review control,
// no age-eligible, official-early, hard, age-only, or insufficient leakage.
assert.deepEqual(challengeKeys,['mideer-reusable-jelly-sticker-busy-animal-town']);
assert.equal(challenge[0].row.productName,'Reusable Jelly Sticker: The Busy Animal Town');
assert.equal(challenge[0].decision.reason,'PARENT_APPROVAL_REQUIRED');

const lock=byKey.get('lr-lock-key-clubhouse');
assert.equal(lock.sku,'LER9807');
assert.equal(lock.minAgeMonths,18);
assert.equal(rotationAgeEligibility(lock,CHILD_AGE_MONTHS,advancedProfile).eligible,true);
assert.ok(!challengeKeys.includes(lock.canonicalKey));

const dayNight=byKey.get('smartgames-day-night');
assert.equal(rotationAgeEligibility(dayNight,dayNight.minAgeMonths-4,advancedProfile).reason,'MAXIMUM_EARLY_WINDOW_BLOCK');
assert.equal(rotationAgeEligibility(dayNight,dayNight.minAgeMonths-3,advancedProfile).reason,'EARLY_ROTATION_ALLOWED');
assert.equal(rotationAgeEligibility(dayNight,dayNight.minAgeMonths-3,{}).reason,'PREREQUISITES_NOT_MET');
assert.equal(rotationAgeEligibility(dayNight,dayNight.minAgeMonths,advancedProfile).reason,'NORMAL_AGE_ELIGIBLE');
assert.ok(!challengeKeys.includes(dayNight.canonicalKey),'AUTO EARLY must not duplicate in manual challenge');

const hardKeys=['hape-lock-learn-playboard','smartgames-three-little-piggies-deluxe','smartgames-smart-farmer'];
for(const canonicalKey of hardKeys){
  const row=byKey.get(canonicalKey);
  assert.equal(rotationAgeEligibility(row,35,advancedProfile,{crossAgeApproval:true,underfillFallback:true,permanent:true}).reason,'HARD_SAFETY_BLOCK',canonicalKey);
  assert.ok(!challengeKeys.includes(canonicalKey),`${canonicalKey} cannot be parent-challengeable`);
}

const ageOnlyKeys=batch2Keys.filter(key=>EARLY_ROTATION_EVIDENCE_BATCH_2[key].earlyRotationEligibility==='AGE_RECOMMENDED_ONLY');
assert.equal(ageOnlyKeys.length,32);
for(const canonicalKey of ageOnlyKeys){
  const row=byKey.get(canonicalKey);
  const belowAge=Math.max(0,row.minAgeMonths-1);
  if(row.minAgeMonths>0) assert.equal(rotationAgeEligibility(row,belowAge,advancedProfile).reason,'AGE_RECOMMENDED_ONLY_BLOCK',canonicalKey);
  assert.equal(rotationAgeEligibility(row,row.minAgeMonths,advancedProfile).reason,'NORMAL_AGE_ELIGIBLE',canonicalKey);
  assert.ok(!challengeKeys.includes(canonicalKey),`${canonicalKey} is not parent-overrideable`);
}

const insufficientKeys=['hape-country-critters-play-cube','plantoys-sort-count-cups','plantoys-40-unit-blocks'];
for(const canonicalKey of insufficientKeys){
  const row=byKey.get(canonicalKey);
  assert.equal(row.userMetadata.developmentFit.researchStatus,'RESEARCHED_INSUFFICIENT');
  assert.equal(rotationAgeEligibility(row,row.minAgeMonths-1,advancedProfile).reason,'INSUFFICIENT_EVIDENCE_BLOCK',canonicalKey);
  assert.ok(!challengeKeys.includes(canonicalKey),`${canonicalKey} must remain fail-closed`);
}

const pipeline=selectRotation({toys:state.toys,childAgeMonths:CHILD_AGE_MONTHS,size:6,childDevelopmentProfile:advancedProfile});
const selectedKeys=pipeline.selected.map(toy=>toy.canonicalKey);
const ineligibleAt19=[
  ...hardKeys,
  ...ageOnlyKeys.filter(key=>byKey.get(key).minAgeMonths>CHILD_AGE_MONTHS),
  ...insufficientKeys.filter(key=>byKey.get(key).minAgeMonths>CHILD_AGE_MONTHS)
];
for(const canonicalKey of ineligibleAt19) assert.ok(!selectedKeys.includes(canonicalKey),`${canonicalKey} leaked into 19m Rotation`);
assert.equal(new Set(challengeKeys).size,challengeKeys.length,'no duplicate manual challenge candidates');
assert.ok(!challengeKeys.some(key=>selectedKeys.includes(key)&&key==='smartgames-day-night'),'manual and AUTO EARLY paths do not duplicate');

const summary={
  childAgeMonths:CHILD_AGE_MONTHS,
  challengeCandidates:challenge.map(item=>({canonicalKey:item.row.canonicalKey,displayName:item.row.productName,inclusionReason:item.decision.reason})),
  exclusionReasons:{
    ageEligible:'age >= recommendedAgeMin', hard:'HARD_SAFETY_BLOCK',
    ageOnly:'AGE_RECOMMENDED_ONLY_BLOCK', insufficient:'INSUFFICIENT_EVIDENCE_BLOCK',
    autoEarly:'EARLY_ROTATION_ALLOWED (automatic route, not manual challenge)'
  },
  selectedRotationKeys:selectedKeys,
  ownerEquivalentRotationAcceptance:'PASS'
};
console.log(`QA3 owner-equivalent automated acceptance: PASS ${JSON.stringify(summary)}`);
