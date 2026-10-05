import assert from 'node:assert/strict';
import { buildRawIdentityReferenceAudit, RAW_IDENTITY_P0_GROUPS } from '../src/features/raw-identity-reference-audit.js';

const entries=new Map();
const storage={
  get length(){return entries.size;}, key(i){return [...entries.keys()][i] ?? null;},
  getItem(key){return entries.get(key) ?? null;},
  setItem(){throw Error('read-only export attempted a write');},
  removeItem(){throw Error('read-only export attempted a delete');}
};
const lego='lego-duplo-brick-box';
const legoCurrent='lego-duplo-classic-brick-box';
const mdOld='mideer-my-first-puzzle-dinosaurs-6in1';
const md='mideer-my-first-puzzle-dinosaurs-6in1-md1460';
const children=Array.from({length:6},(_,i)=>({id:`child-${i+1}`,canonicalKey:`${md}:puzzle-${i+1}`,parentCanonicalKey:md,imageRef:{kind:'personal',id:`personal:child-${i+1}`}}));
const current={schemaVersion:12,toys:[
  {id:'helping-old',canonicalKey:'lr-helping-hands',notes:'PRIVATE NOTE SECRET',imageRef:{kind:'personal',dataUrl:'data:image/png;base64,SECRET'}},
  {id:'helping-current',canonicalKey:'learningresources-helping-hands-fine-motor-tool-set',archived:true},
  {id:'lego-old',canonicalKey:lego,currentShelf:true},
  {id:'lego-current',canonicalKey:legoCurrent,deleted:true},
  {id:'md-parent',canonicalKey:md,childCanonicalKeys:children.map(c=>c.canonicalKey)},...children],
  wishlist:[{id:'wish-1',canonicalKey:'hape-pound-tap-bench',catalogId:'hape-pound-tap-bench-xylophone',status:'deleted'}],
  rotationHistory:[{id:'round-1',toyIds:['lego-old'],canonicalKey:mdOld}],
  developmentFeedbackHistory:[{id:'feedback-1',canonicalKey:legoCurrent,feedback:'too_easy'}],
  crossAgeApprovals:{[lego]:{approved:true,approvedAt:'2026-09-24',sourceRecommendedMinAgeMonths:24}},
  catalogState:{imageRefsByKey:{[legoCurrent]:{kind:'catalog',id:'catalog:lego'}},adminEdits:{[mdOld]:{notes:'SECRET OTHER NOTE'}},redirects:[{from:mdOld,to:md}]}
};
entries.set('toyRotation.cleanBaseline',JSON.stringify(current));
entries.set('toyRotation.cleanBaseline.snapshot-1',JSON.stringify({schemaVersion:12,toys:[{id:'legacy-md',canonicalKey:mdOld}]}));
entries.set('toyRotation.cleanBaseline.preFresh.1',JSON.stringify({current:{raw:JSON.stringify({toys:[{id:'old-backup',canonicalKey:'hape-pound-tap-bench-xylophone'}]})}}));
const before=[...entries];
const catalog={resolve({canonicalKey}){return {canonicalKey:({[mdOld]:md,'hape-pound-tap-bench':'hape-pound-tap-bench-xylophone'}[canonicalKey] || canonicalKey)};}};
const report=buildRawIdentityReferenceAudit({storage,catalog,build:{buildId:'qa13-test'},generatedAt:'2026-09-25T00:00:00.000Z'});
assert.equal(RAW_IDENTITY_P0_GROUPS.length,19);
assert.equal(report.groups.length,19);
const by=id=>report.groups.find(group=>group.groupId===id);
assert.deepEqual(new Set(by('P0-04').rawRefs.map(ref=>ref.canonicalKeyFound)),new Set(['lr-helping-hands','learningresources-helping-hands-fine-motor-tool-set']));
assert.deepEqual(new Set(by('P0-01').rawRefs.map(ref=>ref.canonicalKeyFound)),new Set([lego,legoCurrent]));
assert.equal(by('P0-01').duplicateRawStateUnderBothCanonicals,true);
assert.ok(by('P0-01').rawRefs.some(ref=>ref.sourceArea==='crossAgeApprovals' && ref.canonicalKeyFound===lego));
assert.ok(by('P0-01').rawRefs.some(ref=>ref.sourceArea==='rotation history/recent-use' && ref.referenceViaToyId));
assert.ok(by('P0-01').rawRefs.some(ref=>ref.sourceArea==='image references'));
assert.ok(by('P0-01').rawRefs.some(ref=>ref.status==='deleted'));
assert.ok(by('P0-04').rawRefs.some(ref=>ref.status==='archived'));
assert.ok(by('P0-03').rawRefs.some(ref=>ref.canonicalKeyFound===mdOld && ref.runtimeRedirectWouldResolve));
assert.deepEqual(new Set(by('P0-03').rawRefs.map(ref=>ref.childIndex).filter(Boolean)),new Set([1,2,3,4,5,6]));
assert.ok(by('P0-02').rawRefs.some(ref=>ref.sourceArea==='backup/recovery'));
assert.ok(by('P0-02').rawRefs.some(ref=>ref.rawFieldPath.endsWith('.catalogId')));
assert.ok(by('P0-03').rawRefs.some(ref=>ref.rawFieldPath.endsWith('.from')));
assert.ok(report.scanCoverage.unavailableSources.some(row=>row.source==='external/downloaded backup files'));
assert.ok(report.scanCoverage.unavailableSources.some(row=>row.source==='toyRotation.cleanBaseline.snapshot-2'));
const json=JSON.stringify(report);
assert.ok(!json.includes('PRIVATE NOTE SECRET') && !json.includes('SECRET OTHER NOTE'));
assert.ok(!json.includes('data:image') && !json.includes('base64'));
assert.deepEqual([...entries],before);
assert.equal(current.schemaVersion,12);
const denied=buildRawIdentityReferenceAudit({storage:{get length(){throw Error('denied');},getItem(){throw Error('denied');}},catalog});
assert.ok(denied.scanCoverage.unavailableSources.some(row=>row.source==='localStorage key inventory'));
assert.ok(denied.scanCoverage.unavailableSources.some(row=>row.source==='toyRotation.cleanBaseline' && row.reason.includes('denied')));
console.log('raw identity audit: 19 groups, raw sides, child refs, privacy, unavailable coverage and read-only invariance PASS');
