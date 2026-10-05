import assert from 'node:assert/strict';
import data from '../catalog-base.json' with {type:'json'};
import {EARLY_ROTATION_EVIDENCE_BATCH_1} from '../src/data/early-rotation-evidence-batch1.js';
import {EARLY_ROTATION_EVIDENCE_BATCH_2} from '../src/data/early-rotation-evidence-batch2.js';
import {EARLY_ROTATION_EVIDENCE_BATCH_3} from '../src/data/early-rotation-evidence-batch3.js';
import {normalizeCatalogToy} from '../src/data/schema.js';
import {withEarlyRotationBaseline} from '../src/domain/early-rotation-baseline.js';
import {rotationAgeEligibility} from '../src/domain/rotation-engine.js';

const entries=Object.entries(EARLY_ROTATION_EVIDENCE_BATCH_3);
const priorKeys=new Set([...Object.keys(EARLY_ROTATION_EVIDENCE_BATCH_1),...Object.keys(EARLY_ROTATION_EVIDENCE_BATCH_2)]);
assert.equal(entries.length,40,'Batch 3 freezes at exactly 40 exact-product reviews');
assert.equal(new Set(entries.map(([key])=>key)).size,40,'one Batch 3 entry per canonical key');
assert.equal(entries.filter(([key])=>priorKeys.has(key)).length,0,'Batch 3 cannot overlap a frozen prior batch');
assert.equal(new Set(entries.map(([,record])=>record.evidence.sourceUrl)).size,40,'each exact review has distinct official provenance');

const rows=new Map((data.entries||data).map(row=>{
  const toy=withEarlyRotationBaseline(normalizeCatalogToy(row));
  return [toy.canonicalKey,toy];
}));
let resolved=0;let researchedInsufficient=0;let ageOnly=0;
for(const [canonicalKey,record] of entries){
  const toy=rows.get(canonicalKey);
  assert.ok(toy,`Catalog identity missing: ${canonicalKey}`);
  assert.equal(record.researchBatch,'Batch 3');
  assert.equal(record.evidence.sourceType,'OFFICIAL_PRODUCT_PAGE');
  assert.match(record.evidence.sourceUrl,/^https:\/\//,`${canonicalKey}: official HTTPS source`);
  assert.ok(record.evidence.sourceTitle,`${canonicalKey}: exact product/SKU title required`);
  assert.ok(record.evidence.quotedOrStructuredClaim,`${canonicalKey}: evidence claim required`);
  assert.equal(record.evidence.retrievedAt,'2026-10-05');
  const advanced=Object.fromEntries(Object.keys(toy.prerequisiteSkills).map(skill=>[skill,{currentLevel:5}]));
  if(record.researchStatus==='RESEARCHED_RESOLVED'){
    resolved+=1;
    assert.equal(record.earlyRotationEligibility,'AGE_RECOMMENDED_ONLY',`${canonicalKey}: Batch 3 resolved conclusion is guidance, not early permission`);
    ageOnly+=1;
    assert.equal(rotationAgeEligibility(toy,toy.minAgeMonths-1,advanced).reason,'AGE_RECOMMENDED_ONLY_BLOCK',`${canonicalKey}: recommendation cannot become automatic or manual early permission`);
    assert.equal(rotationAgeEligibility(toy,toy.minAgeMonths,advanced).reason,'NORMAL_AGE_ELIGIBLE',`${canonicalKey}: normal age path preserved`);
  }else{
    researchedInsufficient+=1;
    assert.equal(record.researchStatus,'RESEARCHED_INSUFFICIENT');
    assert.equal(record.earlyRotationEligibility,'INSUFFICIENT_EVIDENCE');
    assert.ok(record.insufficientReason,`${canonicalKey}: fail-closed reason required`);
    assert.equal(rotationAgeEligibility(toy,toy.minAgeMonths-1,advanced,{crossAgeApproval:true}).reason,'INSUFFICIENT_EVIDENCE_BLOCK',`${canonicalKey}: approval cannot bypass incomplete evidence`);
  }
}
assert.deepEqual({resolved,researchedInsufficient,ageOnly},{resolved:31,researchedInsufficient:9,ageOnly:31});
console.log(`v0.11.7 official evidence Batch 3 final audit: PASS (40 exact official reviews; resolved ${resolved}; researched-insufficient ${researchedInsufficient}; EARLY +0; AGE_ONLY +${ageOnly}; HARD +0)`);
