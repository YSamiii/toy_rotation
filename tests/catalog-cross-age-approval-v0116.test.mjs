import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { SCHEMA_VERSION, emptyState, normalizeCatalogToy } from '../src/data/schema.js';
import { catalogSafetyStatus, crossAgeApprovalFor, reconcileCrossAgeApprovals, redirectCrossAgeApproval, setCrossAgeApproval, withCatalogSafety } from '../src/domain/catalog-safety.js';
import { hardSafetyEligible, rotationAgeEligibility, selectRotation } from '../src/domain/rotation-engine.js';
import { buildCatalogSafetyAudit } from '../src/features/catalog-safety-audit.js';
import { CatalogRepository } from '../src/domain/catalog-repository.js';
import { runMigrations } from '../src/data/store.js';
import { DICTIONARY } from '../src/ui/i18n.js';

const evidence={ safetySource:'https://example.org/exact-product', safetyVerifiedAt:'2026-09-24', evidenceNote:'Exact product page and warning section reviewed.' };
const row=(key, status, extra={})=>({ id:key,canonicalKey:key,productName:key,brand:'Example',minAgeMonths:36,
  playMechanics:['shape_sorting'],challengeLevel:3,categoryCode:'cognitive',
  userMetadata:{ safety:status==='UNKNOWN' ? {} : { ...evidence,ageSafetyStatus:status,...extra } } });
const verified=row('verified','VERIFIED_NO_EXTRA_GATE',{smallParts:false,requiresStandingStability:false});
const documented=row('documented','NO_DOCUMENTED_HARD_GATE',{smallParts:'unknown',requiresStandingStability:'unknown'});
const unknown=row('unknown','UNKNOWN');
const small=row('small','SMALL_PARTS_GATE',{smallParts:true,hardMinAgeMonths:36});
const gross=row('gross','GROSS_MOTOR_GATE',{requiresStandingStability:true,requiredGrossMotorLevel:3});
const other=row('other','OTHER_HARD_GATE',{hardMinAgeMonths:36});
const age=24;
const decide=(toy,approval=null,profile={})=>rotationAgeEligibility({...toy,crossAgeApproval:approval},age,profile);
const stateA=emptyState(), stateB=emptyState();
assert.equal(SCHEMA_VERSION,12);
assert.deepEqual(decide(verified),{eligible:true,reason:'VERIFIED_CROSS_AGE_ALLOWED'});
assert.deepEqual(decide(documented),{eligible:false,reason:'PARENT_APPROVAL_REQUIRED'});
assert.equal(setCrossAgeApproval(stateA,documented,true,{now:'2026-09-24T12:00:00.000Z'}),true);
const approval=crossAgeApprovalFor(stateA,documented);
assert.ok(approval);
assert.deepEqual(decide(documented,approval),{eligible:true,reason:'PARENT_APPROVED_CROSS_AGE'});
assert.deepEqual(rotationAgeEligibility({...documented,minAgeMonths:24,crossAgeApproval:approval},24),{eligible:true,reason:'NORMAL_AGE_ELIGIBLE'});
assert.equal(crossAgeApprovalFor(stateA,{...documented,minAgeMonths:48}),null,'age change invalidates old approval');
assert.deepEqual(decide(unknown,approval),{eligible:false,reason:'UNKNOWN_AGE_BLOCK'});
assert.deepEqual(decide(small,approval),{eligible:false,reason:'HARD_SAFETY_BLOCK'});
assert.deepEqual(decide(gross,approval,{balance:{currentLevel:2}}),{eligible:false,reason:'HARD_SAFETY_BLOCK'});
assert.deepEqual(decide(other,approval),{eligible:false,reason:'HARD_SAFETY_BLOCK'});
assert.equal(hardSafetyEligible(gross,age,{balance:{currentLevel:3}}),true);
assert.equal(setCrossAgeApproval(stateA,documented,false),true);
assert.equal(crossAgeApprovalFor(stateA,documented),null);
assert.deepEqual(decide(documented),{eligible:false,reason:'PARENT_APPROVAL_REQUIRED'});
setCrossAgeApproval(stateA,documented,true,{now:'2026-09-24T12:00:00.000Z'});
assert.equal(crossAgeApprovalFor(stateB,documented),null,'another owner state has no approval');
assert.equal(redirectCrossAgeApproval(stateA,'documented','current'),true);
assert.equal(stateA.crossAgeApprovals.documented,undefined);
assert.ok(crossAgeApprovalFor(stateA,{...documented,canonicalKey:'current'}));
assert.equal(reconcileCrossAgeApprovals(stateA,key=>({canonicalKey:key==='current'?'survivor':key})),1);
assert.equal(reconcileCrossAgeApprovals(stateA,key=>({canonicalKey:key==='current'?'survivor':key})),0);
assert.equal(Object.keys(stateA.crossAgeApprovals).length,1);
assert.ok(crossAgeApprovalFor(stateA,{...documented,canonicalKey:'survivor'}));
const reloaded=runMigrations(runMigrations(stateA));
assert.ok(crossAgeApprovalFor(reloaded,{...documented,canonicalKey:'survivor'}),'optional approval survives two schema-12 reloads');
assert.equal(reloaded.schemaVersion,12);
const mergedState=emptyState();
mergedState.toys=[{id:'owned',canonicalKey:'legacy'}];
setCrossAgeApproval(mergedState,{...documented,canonicalKey:'legacy'},true,{now:'2026-09-24T12:00:00.000Z'});
const repository=new CatalogRepository({state:mergedState,update:mutate=>mutate(mergedState)});
repository.mergeReferences('legacy','current');
assert.equal(mergedState.toys[0].canonicalKey,'current');
assert.ok(crossAgeApprovalFor(mergedState,{...documented,canonicalKey:'current'}));
assert.equal(Object.keys(mergedState.crossAgeApprovals).length,1);

const selected=(toy,approvalRecord)=>selectRotation({toys:[{...toy,crossAgeApproval:approvalRecord}],childAgeMonths:age,
  childDevelopmentProfile:{shape_sorting:{currentLevel:2}},size:1}).selected.length;
assert.equal(selected(verified,null),1);
assert.equal(selected(documented,null),0);
assert.equal(selected(documented,approval),1);
assert.equal(selected(small,approval),0,'stretch cannot bypass hard safety');
assert.equal(selected(unknown,approval),0);

const auditState={...emptyState(),profile:{childBirthDate:'2024-09-01',developmentProfile:{shape_sorting:{currentLevel:2}}},
  toys:[{id:'secret-id',canonicalKey:'documented',notes:'secret-note'}],wishlist:[]};
setCrossAgeApproval(auditState,documented,true,{now:'2026-09-24T12:00:00.000Z'});
const catalog={active:[documented],resolve:ref=>ref.canonicalKey==='documented'?documented:null};
const audit=buildCatalogSafetyAudit({state:auditState,catalog,generatedAt:'2026-09-24T14:00:00.000Z'});
const item=audit.rotationCandidates.items[0];
assert.equal(item.ageSafetyStatus,'NO_DOCUMENTED_HARD_GATE');
assert.equal(item.childAgeMonths,24);
assert.equal(item.recommendedMinAgeMonths,36);
assert.equal(item.crossAgeApproval.approved,true);
assert.equal(item.eligibilityResult,'ELIGIBLE');
assert.equal(item.eligibilityReason,'PARENT_APPROVED_CROSS_AGE');
assert.equal(JSON.stringify(audit).includes('secret-note'),false);
assert.equal(JSON.stringify(audit).includes('secret-id'),false);

for (const lang of ['en','zh']) for (const key of ['crossAgeApprovalExplanation','crossAgeAllow','crossAgeDecline','crossAgeApproved','crossAgeRevoke']) {
  assert.ok(DICTIONARY[lang][key]);
  assert.doesNotMatch(DICTIONARY[lang][key],/NO_DOCUMENTED_HARD_GATE|VERIFIED_NO_EXTRA_GATE/);
}
const catalogData=JSON.parse(readFileSync(new URL('../catalog-base.json',import.meta.url),'utf8'));
const normalized=new Map(catalogData.entries.map(entry=>[entry.key,normalizeCatalogToy(entry)]));
for(const key of ['lr-lock-key-clubhouse','mideer-reusable-jelly-sticker-busy-animal-town','plantoys-fruit-vegetable-play-set','smartgames-bunny-boo','smartgames-day-night']) {
  assert.equal(catalogSafetyStatus(normalized.get(key)),'NO_DOCUMENTED_HARD_GATE',key);
  assert.equal(normalized.get(key).userMetadata.safety.smallParts,'unknown');
}
for(const key of ['hape-creative-peg-puzzle-farm','hahaland-mermaid-busy-board','lovevery-block-set'])
  assert.equal(catalogSafetyStatus(normalized.get(key)),'UNKNOWN',key);
const overlayState=emptyState();
const overlayCatalog=new CatalogRepository({state:overlayState,update:mutate=>mutate(overlayState)});
overlayCatalog.applyBase([catalogData.entries.find(entry=>entry.key==='smartgames-bunny-boo')]);
overlayCatalog.applyRemote([{key:'smartgames-bunny-boo',brand:'SmartGames',name:'Bunny Boo',ageMinMonths:24}]);
assert.equal(catalogSafetyStatus(overlayCatalog.getByKey('smartgames-bunny-boo')),'NO_DOCUMENTED_HARD_GATE','remote row without safety does not erase reviewed base safety');
assert.equal(withCatalogSafety({canonicalKey:'unknown',userMetadata:{safety:verified.userMetadata.safety}},unknown).userMetadata.safety,undefined,'stale verified facts do not survive current UNKNOWN Catalog');
console.log('catalog cross-age approval v0.11.6: PASS');
