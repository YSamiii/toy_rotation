import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';

const dom=new JSDOM('',{url:'https://badge.test'});
for(const key of ['window','document','localStorage','navigator','Event'])Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true});
Object.defineProperty(globalThis,'crypto',{value:webcrypto,configurable:true});
const { AppStore }=await import('../src/data/store.js');
const { SharedCatalogGovernance }=await import('../src/features/shared-catalog-governance.js');
const { getNeedsReviewCount }=await import('../src/features/review-count.js');
const { startCatalogReportReview,resolveCatalogReport,dismissCatalogReport }=await import('../src/features/catalog-report-store.js');
const { setLocalCandidateStatus }=await import('../src/features/local-candidate-queue.js');

const base=()=>({schemaVersion:12,settings:{},profile:{},toys:[],wishlist:[],drafts:[],rotationHistory:[],catalogState:{syncMetadata:{}}});
let checks=0;const equal=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++};
let persisted;const store=new AppStore(base(),undefined,{safeSave:state=>{persisted=structuredClone(state);}});
let badge=getNeedsReviewCount(store.state);let invalidations=0;store.subscribe(state=>{badge=getNeedsReviewCount(state);invalidations++;});
let fetchCalls=0;globalThis.fetch=async()=>{fetchCalls++;throw new Error('remote unavailable');};
const governance=new SharedCatalogGovernance({store,catalog:{},baseUrl:'https://offline.test'});

equal(badge,0,'empty canonical state has zero badge');
await governance.submitReport({reportId:'r1',canonicalKey:'one',reportType:'other'});equal(badge,1,'first report live refreshes 0 to 1');
await governance.submitReport({reportId:'r2',canonicalKey:'two',reportType:'other'});equal(badge,2,'second report live refreshes 1 to 2');
store.update(state=>startCatalogReportReview(state,'r1'),'report-review');equal(badge,2,'reviewing report remains in count');
store.update(state=>resolveCatalogReport(state,'r1'),'report-resolve');equal(badge,1,'resolved report exits count');
store.update(state=>dismissCatalogReport(state,'r2'),'report-dismiss');equal(badge,0,'dismissed report exits count');
governance.createLocalCandidate({candidateId:'c1',imageConsent:false});equal(badge,1,'pending candidate enters count');
store.update(state=>setLocalCandidateStatus(state,'c1','reviewing'),'candidate-review');equal(badge,1,'reviewing candidate remains in count');
store.update(state=>setLocalCandidateStatus(state,'c1','approved'),'candidate-approve');equal(badge,0,'approved candidate exits count');
governance.createLocalCandidate({candidateId:'c2',imageConsent:false});await governance.submitReport({reportId:'r3',canonicalKey:'three',reportType:'other'});equal(badge,2,'mixed candidate and report count is unified');
const reopened=new AppStore(persisted);equal(getNeedsReviewCount(reopened.state),2,'reload preserves selector result');
equal(getNeedsReviewCount(structuredClone(reopened.state)),2,'workspace reopen reads identical selector result');
equal(fetchCalls>=1,true,'remote unavailable does not prevent local refresh');
await governance.submitReport({reportId:'r3',canonicalKey:'three',reportType:'other'});equal(badge,2,'rapid duplicate submit does not increment twice');
equal(store.state.catalogState.syncMetadata.governanceOutbox.filter(job=>job.id==='r3').length,1,'transport intent is not a badge counter');
equal(invalidations>=9,true,'canonical commits drive invalidation without DOM counters');
assert.equal(checks,16);
console.log(`admin review badge live refresh v0.11.5: PASS (${checks} assertions)`);
