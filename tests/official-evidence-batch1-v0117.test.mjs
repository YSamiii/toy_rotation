import assert from 'node:assert/strict';
import data from '../catalog-base.json' with {type:'json'};
import {normalizeCatalogToy} from '../src/data/schema.js';
import {withEarlyRotationBaseline} from '../src/domain/early-rotation-baseline.js';
import {EARLY_ROTATION_EVIDENCE_BATCH_1} from '../src/data/early-rotation-evidence-batch1.js';
import {rotationAgeEligibility,selectRotation} from '../src/domain/rotation-engine.js';

const rows=new Map((data.entries||data).map(row=>{const toy=withEarlyRotationBaseline(normalizeCatalogToy(row));return [toy.canonicalKey,toy];}));
const reviewed=Object.entries(EARLY_ROTATION_EVIDENCE_BATCH_1);
assert.equal(reviewed.length,40);
assert.equal(new Set(reviewed.map(([key])=>key)).size,reviewed.length,'canonical keys are unique');
assert.equal(new Set(reviewed.map(([,record])=>record.evidence.sourceUrl)).size,reviewed.length,'each Batch 1 record has one exact product-level source');
for(const [key,record] of reviewed){
  const row=rows.get(key); assert.ok(row,`missing exact catalog identity ${key}`);
  assert.equal(row.earlyRotationEligibility,record.earlyRotationEligibility,key);
  const evidence=row.userMetadata.developmentFit.evidence;
  assert.match(evidence.sourceUrl,/^https:\/\//,key); assert.equal(evidence.reviewStatus,'reviewed',key);
  assert.ok(evidence.sourceTitle,key); assert.ok(evidence.quotedOrStructuredClaim,key); assert.equal(evidence.sourceAvailability,'AVAILABLE_AT_RESEARCH',key);
  assert.equal(row.userMetadata.developmentFit.researchBatch,'Batch 1',key);
  for(const [skill,level] of Object.entries(row.prerequisiteSkills)) assert.ok(Number.isInteger(level)&&level>0,`${key}:${skill}`);
  if(row.earlyRotationEligibility==='EARLY_ROTATION_ALLOWED') {
    assert.ok(row.maximumEarlyMonths>0&&row.maximumEarlyMonths<=3,key);
    const profile=Object.fromEntries(Object.entries(row.prerequisiteSkills).map(([skill,level])=>[skill,{currentLevel:level}]));
    assert.equal(rotationAgeEligibility(row,row.minAgeMonths-1,profile).reason,'EARLY_ROTATION_ALLOWED',`${key} early window`);
    assert.equal(rotationAgeEligibility(row,row.minAgeMonths-4,profile).reason,'MAXIMUM_EARLY_WINDOW_BLOCK',`${key} early window bound`);
  }
  if(row.earlyRotationEligibility==='AGE_RECOMMENDED_ONLY') {
    const profile=Object.fromEntries(Object.entries(row.prerequisiteSkills).map(([skill])=>[skill,{currentLevel:5}]));
    assert.equal(rotationAgeEligibility(row,row.minAgeMonths-1,profile).reason,'AGE_RECOMMENDED_ONLY_BLOCK',`${key} remains guidance-bound`);
  }
}
for(const [key,record] of reviewed.filter(([,record])=>record.earlyRotationEligibility==='HARD_SAFETY_GATE')){
  const row=rows.get(key);
  assert.equal(row.userMetadata.safety?.hardMinAgeMonths,36,`${key} hard floor`);
  const advanced=Object.fromEntries(Object.entries(row.prerequisiteSkills).map(([skill])=>[skill,{currentLevel:5}]));
  assert.equal(rotationAgeEligibility(row,35,advanced).reason,'HARD_SAFETY_BLOCK',`${key} cannot be bypassed`);
}
const early=rows.get('lr-hide-seek-vegetable-garden');
const profile=Object.fromEntries(Object.entries(early.prerequisiteSkills).map(([skill,level])=>[skill,{currentLevel:level}]));
assert.equal(rotationAgeEligibility(early,early.minAgeMonths-1,profile).reason,'EARLY_ROTATION_ALLOWED');
assert.equal(rotationAgeEligibility(early,early.minAgeMonths-4,profile).reason,'MAXIMUM_EARLY_WINDOW_BLOCK');
assert.equal(rotationAgeEligibility(early,early.minAgeMonths-1,{}).reason,'PREREQUISITES_NOT_MET');
const hard=rows.get('lr-counting-surprise-party');
assert.equal(rotationAgeEligibility(hard,35,{earlyMath:{currentLevel:5},matching:{currentLevel:5},fineMotor:{currentLevel:5}}).reason,'HARD_SAFETY_BLOCK');
assert.equal(selectRotation({toys:[hard],childAgeMonths:35,size:3,childDevelopmentProfile:{earlyMath:{currentLevel:5},matching:{currentLevel:5},fineMotor:{currentLevel:5}}}).selected.length,0,'underfill cannot select a hard-gated toy');
assert.equal(selectRotation({toys:[{...hard,customPermanent:true,permanentSource:'user'}],childAgeMonths:35,size:1,childDevelopmentProfile:{earlyMath:{currentLevel:5},matching:{currentLevel:5},fineMotor:{currentLevel:5}}}).selected.length,0,'permanent status cannot turn a hard-gated toy into a rotation candidate');
const brainometry=rows.get('lr-stem-explorers-brainometry');
const brainometryProfile=Object.fromEntries(Object.entries(brainometry.prerequisiteSkills).map(([skill,level])=>[skill,{currentLevel:level}]));
assert.equal(brainometry.minAgeMonths,60);
assert.equal(rotationAgeEligibility(brainometry,35,brainometryProfile).reason,'HARD_SAFETY_BLOCK');
assert.equal(rotationAgeEligibility(brainometry,56,brainometryProfile).reason,'MAXIMUM_EARLY_WINDOW_BLOCK');
assert.equal(rotationAgeEligibility(brainometry,57,brainometryProfile).reason,'EARLY_ROTATION_ALLOWED');
assert.equal(rotationAgeEligibility(brainometry,60,brainometryProfile).reason,'NORMAL_AGE_ELIGIBLE');
assert.equal(rows.get('lr-a-to-z-mini-foods').earlyRotationEligibility,'AGE_RECOMMENDED_ONLY');
const insufficient=[...rows.values()].find(row=>row.earlyRotationEligibility==='INSUFFICIENT_EVIDENCE'&&row.minAgeMonths>1);
assert.equal(rotationAgeEligibility(insufficient,insufficient.minAgeMonths-1,{}).reason,'INSUFFICIENT_EVIDENCE_BLOCK');
console.log(`v0.11.7 official evidence Batch 1: PASS (${reviewed.length} exact SKU reviews)`);
