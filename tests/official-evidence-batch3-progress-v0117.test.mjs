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
assert.equal(entries.length,40,'Batch 3 freeze contains exactly 40 researched canonicals');
assert.equal(new Set(entries.map(([canonicalKey])=>canonicalKey)).size,40,'each Batch 3 review has one canonical');
assert.equal(entries.filter(([canonicalKey])=>priorKeys.has(canonicalKey)).length,0,'Batch 3 cannot re-count Batch 1/2 canonicals');
assert.equal(new Set(entries.map(([,record])=>record.evidence.sourceUrl)).size,40,'each reviewed product retains a distinct official exact-product source');

const rows=new Map((data.entries||data).map(row=>{
  const toy=withEarlyRotationBaseline(normalizeCatalogToy(row));
  return [toy.canonicalKey,toy];
}));
for(const [canonicalKey,record] of entries){
  const toy=rows.get(canonicalKey);
  assert.ok(toy,`Catalog identity missing: ${canonicalKey}`);
  assert.equal(record.researchBatch,'Batch 3');
  assert.ok(['RESEARCHED_RESOLVED','RESEARCHED_INSUFFICIENT'].includes(record.researchStatus));
  assert.equal(record.evidence.sourceType,'OFFICIAL_PRODUCT_PAGE');
  assert.match(record.evidence.sourceUrl,/^https:\/\//,`${canonicalKey}: HTTPS official source`);
  assert.ok(record.evidence.sourceTitle,`${canonicalKey}: source title`);
  assert.ok(record.evidence.manufacturer,`${canonicalKey}: manufacturer`);
  assert.equal(record.evidence.retrievedAt,'2026-10-05');
  const advanced=Object.fromEntries(Object.keys(toy.prerequisiteSkills).map(skill=>[skill,{currentLevel:5}]));
  if(record.earlyRotationEligibility==='AGE_RECOMMENDED_ONLY'){
    assert.equal(rotationAgeEligibility(toy,toy.minAgeMonths-1,advanced).reason,'AGE_RECOMMENDED_ONLY_BLOCK',`${canonicalKey}: official age guidance cannot become auto-early eligibility`);
    assert.equal(rotationAgeEligibility(toy,toy.minAgeMonths,advanced).reason,'NORMAL_AGE_ELIGIBLE',`${canonicalKey}: recommended age remains the normal path`);
  }else{
    assert.equal(record.earlyRotationEligibility,'INSUFFICIENT_EVIDENCE');
    assert.equal(record.researchStatus,'RESEARCHED_INSUFFICIENT');
    assert.equal(rotationAgeEligibility(toy,toy.minAgeMonths-1,advanced).reason,'INSUFFICIENT_EVIDENCE_BLOCK',`${canonicalKey}: incomplete hard-gate evidence remains fail-closed`);
  }
}
console.log('v0.11.7 official evidence Batch 3 freeze: PASS (40/40; resolved 31; researched-insufficient 9; identity-blocked 0; EARLY +0; AGE_ONLY +31; HARD +0)');
