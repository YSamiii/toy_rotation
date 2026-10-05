import assert from 'node:assert/strict';
import {EARLY_ROTATION_EVIDENCE_BATCH_2} from '../src/data/early-rotation-evidence-batch2.js';
import {normalizeCatalogToy} from '../src/data/schema.js';
import {withEarlyRotationBaseline} from '../src/domain/early-rotation-baseline.js';
import {rotationAgeEligibility} from '../src/domain/rotation-engine.js';
import data from '../catalog-base.json' with {type:'json'};

const entries=Object.entries(EARLY_ROTATION_EVIDENCE_BATCH_2);
assert.equal(entries.length,40);
assert.equal(new Set(entries.map(([canonicalKey])=>canonicalKey)).size,40,'one exact review per canonical key');
assert.equal(new Set(entries.map(([,record])=>record.evidence.sourceUrl)).size,40,'each Batch 2 review retains its own official product source');
for(const [canonicalKey,record] of entries){
  assert.ok((data.entries||data).some(row=>row.key===canonicalKey),`Catalog key missing: ${canonicalKey}`);
  assert.equal(record.researchBatch,'Batch 2');
  assert.ok(['RESEARCHED_RESOLVED','RESEARCHED_INSUFFICIENT'].includes(record.researchStatus));
  assert.equal(record.evidence.sourceType,'OFFICIAL_PRODUCT_PAGE');
  assert.match(record.evidence.sourceUrl,/^https:\/\//);
  assert.ok(record.evidence.sourceTitle);assert.ok(record.evidence.manufacturer);
  assert.equal(record.evidence.retrievedAt,'2026-10-04');
}
const rows=(data.entries||data).map(row=>withEarlyRotationBaseline(normalizeCatalogToy(row)));
const dayNight=rows.find(row=>row.canonicalKey==='smartgames-day-night');
const prepared={fineMotor:{currentLevel:1},visualSpatial:{currentLevel:1},attentionPersistence:{currentLevel:1}};
assert.equal(rotationAgeEligibility(dayNight,21,prepared).eligible,true);
assert.equal(rotationAgeEligibility(dayNight,20,prepared).reason,'MAXIMUM_EARLY_WINDOW_BLOCK');
assert.equal(rotationAgeEligibility(dayNight,21,{}).reason,'PREREQUISITES_NOT_MET');
const playboard=rows.find(row=>row.canonicalKey==='hape-lock-learn-playboard');
assert.equal(rotationAgeEligibility(playboard,35,{fineMotor:{currentLevel:5},problemSolving:{currentLevel:5},attentionPersistence:{currentLevel:5}},{crossAgeApproval:true}).reason,'HARD_SAFETY_BLOCK');
for(const canonicalKey of ['smartgames-three-little-piggies-deluxe','smartgames-smart-farmer']){
  const hardGate=rows.find(row=>row.canonicalKey===canonicalKey);
  assert.equal(rotationAgeEligibility(hardGate,35,{visualSpatial:{currentLevel:5},problemSolving:{currentLevel:5},attentionPersistence:{currentLevel:5}},{crossAgeApproval:true,underfillFallback:true,permanent:true}).reason,'HARD_SAFETY_BLOCK',`${canonicalKey} must remain absolute below 36m`);
}
for(const canonicalKey of ['smartgames-bunny-boo','smartgames-peek-a-zoo']){
  const ageOnly=rows.find(row=>row.canonicalKey===canonicalKey);
  assert.equal(rotationAgeEligibility(ageOnly,ageOnly.minAgeMonths-1,{}).reason,'AGE_RECOMMENDED_ONLY_BLOCK',`${canonicalKey} has evidence for guidance only, not automatic early use`);
}
for(const canonicalKey of ['hape-country-critters-play-cube','plantoys-sort-count-cups','plantoys-40-unit-blocks']){
  const unresolved=rows.find(row=>row.canonicalKey===canonicalKey);
  assert.equal(unresolved.userMetadata.developmentFit.researchStatus,'RESEARCHED_INSUFFICIENT');
  assert.equal(rotationAgeEligibility(unresolved,unresolved.minAgeMonths-1,{}).reason,'INSUFFICIENT_EVIDENCE_BLOCK');
}
console.log('v0.11.7 official evidence Batch 2 progress: PASS (40 exact official reviews; Batch 2 research set frozen)');
