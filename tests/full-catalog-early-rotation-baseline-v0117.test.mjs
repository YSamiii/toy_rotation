import assert from 'node:assert/strict';
import data from '../catalog-base.json' with {type:'json'};
import {normalizeCatalogToy} from '../src/data/schema.js';
import {withEarlyRotationBaseline,prerequisitesSatisfied} from '../src/domain/early-rotation-baseline.js';
import {rotationAgeEligibility} from '../src/domain/rotation-engine.js';
const rows=(data.entries||data).map(row=>withEarlyRotationBaseline(normalizeCatalogToy(row)));
assert.equal(rows.length,777);for(const row of rows){assert.ok(row.earlyRotationEligibility);assert.ok(row.safetyEvidenceStatus);assert.ok(row.mechanism);assert.ok(row.prerequisiteSkills&&typeof row.prerequisiteSkills==='object');assert.ok(row.userMetadata.developmentFit.evidence);}
const counts=Object.fromEntries(['EARLY_ROTATION_ALLOWED','AGE_RECOMMENDED_ONLY','HARD_SAFETY_GATE','INSUFFICIENT_EVIDENCE'].map(key=>[key,rows.filter(row=>row.earlyRotationEligibility===key).length]));
assert.equal(counts.INSUFFICIENT_EVIDENCE,659);assert.equal(counts.EARLY_ROTATION_ALLOWED,34);assert.equal(counts.HARD_SAFETY_GATE,16);assert.equal(counts.AGE_RECOMMENDED_ONLY,68);
const researchCounts=Object.fromEntries(['RESEARCHED_RESOLVED','RESEARCHED_INSUFFICIENT','NOT_RESEARCHED'].map(key=>[key,rows.filter(row=>row.userMetadata.developmentFit.researchStatus===key).length]));
assert.deepEqual(researchCounts,{RESEARCHED_RESOLVED:118,RESEARCHED_INSUFFICIENT:12,NOT_RESEARCHED:647});
const insufficient=rows.find(row=>row.earlyRotationEligibility==='INSUFFICIENT_EVIDENCE'&&row.minAgeMonths>1);assert.equal(rotationAgeEligibility(insufficient,Math.max(0,insufficient.minAgeMonths-1),{}).reason,'INSUFFICIENT_EVIDENCE_BLOCK');
const allowed=rows.find(row=>row.earlyRotationEligibility==='EARLY_ROTATION_ALLOWED'&&row.minAgeMonths>1);const profile=Object.fromEntries(Object.entries(allowed.prerequisiteSkills).map(([key,value])=>[key,{currentLevel:value}]));assert.equal(prerequisitesSatisfied(allowed,profile),true);assert.equal(rotationAgeEligibility(allowed,allowed.minAgeMonths-1,profile).eligible,true);assert.equal(rotationAgeEligibility(allowed,allowed.minAgeMonths-1,{}).eligible,Object.keys(allowed.prerequisiteSkills).length===0);
console.log(`v0.11.7 full Catalog explicit baseline: PASS (777/777; ${JSON.stringify(counts)}; ${JSON.stringify(researchCounts)})`);
