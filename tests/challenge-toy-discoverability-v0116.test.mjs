import { strict as assert } from 'node:assert';
import { emptyState } from '../src/data/schema.js';
import { crossAgeApprovalFor, crossAgeChoiceFor, declineCrossAgeApproval, redirectCrossAgeApproval, setCrossAgeApproval } from '../src/domain/catalog-safety.js';
import { challengeDecision, parentApprovableChallenge, parentApprovableChallenges } from '../src/features/cross-age-challenges.js';
import { rotationAgeEligibility } from '../src/domain/rotation-engine.js';
import { DICTIONARY } from '../src/ui/i18n.js';

const evidence={safetySource:'https://example.org/product',safetyVerifiedAt:'2026-09-24',evidenceNote:'Exact product warning information reviewed.'};
const make=(key,status='NO_DOCUMENTED_HARD_GATE',extra={})=>({id:key,canonicalKey:key,brand:'Example',productName:key,minAgeMonths:36,
  userMetadata:{safety:status==='UNKNOWN'?{}:{...evidence,ageSafetyStatus:status,...extra}}});
const rows=[make('one'),make('two'),make('three'),make('unknown','UNKNOWN'),
  make('hard','SMALL_PARTS_GATE',{smallParts:true,hardMinAgeMonths:36}),make('parent'),make('paused'),make('permanent'),make('hidden')];
const catalog={resolve:toy=>rows.find(row=>row.canonicalKey===toy?.canonicalKey)||null};
const state=emptyState();
state.toys=rows.map(row=>({id:row.id,canonicalKey:row.canonicalKey,productName:row.productName,
  ...(row.id==='parent'?{set:{kind:'parent'}}:{}),...(row.id==='paused'?{rotationParticipation:'paused'}:{}),
  ...(row.id==='permanent'?{shelfMode:'permanent',permanentSource:'user'}:{}),...(row.id==='hidden'?{hidden:true}:{})}));
const list=(age=24)=>parentApprovableChallenges(state,catalog,age);
assert.deepEqual(list().map(item=>item.row.canonicalKey),['one','two','three']);
assert.equal(parentApprovableChallenge(state,catalog,state.toys[3],24),null,'UNKNOWN is never shown as approvable');
assert.equal(parentApprovableChallenge(state,catalog,state.toys[4],24),null,'hard gate is never shown as approvable');
assert.equal(list(36).length,0,'ageing into ordinary guidance removes challenge setup');
assert.equal(challengeDecision(state,catalog,state.toys[3],24).decision.reason,'UNKNOWN_AGE_BLOCK');
assert.equal(challengeDecision(state,catalog,state.toys[4],24).decision.reason,'HARD_SAFETY_BLOCK');

const first=list()[0];
assert.equal(first.choice,'pending');
assert.equal(first.decision.reason,'PARENT_APPROVAL_REQUIRED');
declineCrossAgeApproval(state,first.projected,{now:'2026-09-24T12:00:00.000Z'});
assert.equal(crossAgeChoiceFor(state,first.projected),'declined');
assert.equal(crossAgeApprovalFor(state,first.projected),null);
assert.equal(list()[0].decision.reason,'PARENT_APPROVAL_REQUIRED','decline does not change eligibility');
setCrossAgeApproval(state,first.projected,true,{now:'2026-09-24T12:01:00.000Z'});
assert.equal(list()[0].choice,'allowed');
assert.equal(list()[0].decision.reason,'PARENT_APPROVED_CROSS_AGE');
assert.equal(redirectCrossAgeApproval(state,'one','renamed'),true);
assert.equal(crossAgeChoiceFor(state,{...first.projected,canonicalKey:'renamed'}),'allowed');
assert.equal(Object.keys(state.crossAgeApprovals).length,1);
setCrossAgeApproval(state,{...first.projected,canonicalKey:'renamed'},false);
assert.equal(crossAgeChoiceFor(state,{...first.projected,canonicalKey:'renamed'}),'pending');
assert.equal(rotationAgeEligibility({...first.projected,crossAgeApproval:null},24).reason,'PARENT_APPROVAL_REQUIRED');

const keys=['challengeEntryTitle','challengeEntrySummary','challengeOpenSettings','challengeSettingsTitle',
  'challengeSettingsIntro','challengeAges','challengeSafetyNote','challengeStatusPending','challengeStatusAllowed',
  'challengeStatusDeclined','challengeBadgeAvailable','challengeBadgeAllowed','challengeHardBlocked',
  'challengeUnknownBlocked','crossAgeApprovalExplanation','crossAgeAllow','crossAgeDecline','crossAgeRevoke'];
for(const language of ['en','zh'])for(const key of keys){
  assert.ok(DICTIONARY[language][key],`${language}:${key}`);
  assert.doesNotMatch(DICTIONARY[language][key],/NO_DOCUMENTED_HARD_GATE|VERIFIED_NO_EXTRA_GATE|UNKNOWN_AGE_BLOCK/);
}
console.log('challenge toy discoverability v0.11.6: PASS');
