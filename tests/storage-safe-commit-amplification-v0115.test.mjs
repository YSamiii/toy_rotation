import assert from 'node:assert/strict';
import { STORE_COMMIT_STAGING_KEY, STORE_KEY, STORE_SHADOW_KEY, STORE_SNAPSHOT_KEYS, bootStore, isQuotaWriteFailure } from '../src/data/store.js';

globalThis.window={ TOY_ROTATION_CONFIG:{ PERSISTENCE_DIAGNOSTIC_MODE:false } };

class QuotaStorage {
  constructor(values, quotaBytes) { this.values=new Map(Object.entries(values)); this.quotaBytes=quotaBytes; }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) {
    const next=new Map(this.values); next.set(key, String(value));
    const total=[...next.values()].reduce((sum,item)=>sum+new TextEncoder().encode(item).length,0);
    if (total > this.quotaBytes) { const error=new Error('The quota has been exceeded.'); error.name='QuotaExceededError'; throw error; }
    this.values=next;
  }
  removeItem(key) { this.values.delete(key); }
}

function largeState() {
  const state={ schemaVersion:12, settings:{language:'en',theme:'dark',rotationSize:6,rotationDays:7,onboardingDone:true}, profile:{childName:'Quota family',childBirthDate:'2023-01-02'}, toys:[{id:'quota-toy',canonicalKey:'quota-toy',productName:'Quota toy',brand:'Acme',categoryCode:'cognitive',skillCodes:[],playMechanics:[],imageRef:{kind:'personal',id:'personal-image-110'},shelfMode:'permanent',permanentSource:'user',rotationParticipation:'paused',status:'stored',set:{kind:'none'}}], wishlist:[{id:'quota-wish',canonicalKey:'quota-wish',catalogSnapshot:{canonicalKey:'quota-wish',productName:'Quota wish',brand:'Acme',imageRef:{kind:'personal',id:'personal-image-111'}},status:'want',priority:'high'}], rotationHistory:[{toyIds:['quota-toy'],at:'2026-09-03T00:00:00.000Z'}], drafts:[{id:'quota-draft',imageRef:{kind:'personal',id:'personal-image-112'}}], catalogState:{tombstones:{},adminEdits:{},imageRefsByKey:{},imageRefsByIdentity:{},learnedEntries:[],catalogReports:[{id:'quota-report'}],syncMetadata:{localCandidates:[{id:'quota-candidate'}]}} };
  state.quotaPadding='x'.repeat(438313-JSON.stringify(state).length-18);
  assert.equal(new TextEncoder().encode(JSON.stringify(state)).length,438313);
  return state;
}
async function withStorage(storage, run) { const previous=globalThis.localStorage; globalThis.localStorage=storage; try { await run(); } finally { globalThis.localStorage=previous; } }

let checks=0;
const ok=(value, message)=>{assert.ok(value,message);checks++;};
const raw=JSON.stringify(largeState());
const seeded={ [STORE_KEY]:raw, [STORE_SHADOW_KEY]:raw, [STORE_SNAPSHOT_KEYS[0]]:raw, [STORE_SNAPSHOT_KEYS[1]]:raw, [STORE_SNAPSHOT_KEYS[2]]:raw, [STORE_COMMIT_STAGING_KEY]:JSON.stringify({generation:1,state:largeState()}), 'toyRotationPhotosV04.unrelatedPersonalImageMarker':'keep-me' };

await withStorage(new QuotaStorage(seeded,2300000), async()=>{
  const store=bootStore();
  ok(store.canPersist,'quota recovery keeps the hydrated store writable');
  ok(store.persistence.diagnostic.quotaRecovery?.removed.includes(STORE_COMMIT_STAGING_KEY),'stale commit staging is reclaimed');
  ok(store.persistence.diagnostic.quotaRecovery?.removed.includes(STORE_SNAPSHOT_KEYS[1]),'older snapshot two is reclaimed');
  ok(store.persistence.diagnostic.quotaRecovery?.removed.includes(STORE_SNAPSHOT_KEYS[2]),'older snapshot three is reclaimed');
  ok(JSON.parse(localStorage.getItem(STORE_KEY)).toys[0].imageRef.id==='personal-image-110','canonical personal image reference survives');
  ok(JSON.parse(localStorage.getItem(STORE_SHADOW_KEY)).wishlist[0].catalogSnapshot.imageRef.id==='personal-image-111','safe rollback copy survives');
  ok(JSON.parse(localStorage.getItem(STORE_SNAPSHOT_KEYS[0])).drafts[0].imageRef.id==='personal-image-112','latest snapshot remains a rollback floor');
  ok(JSON.parse(localStorage.getItem(STORE_KEY)).catalogState.catalogReports[0].id==='quota-report','report data survives quota recovery');
  ok(JSON.parse(localStorage.getItem(STORE_KEY)).catalogState.syncMetadata.localCandidates[0].id==='quota-candidate','candidate data survives quota recovery');
  ok(localStorage.getItem(STORE_SNAPSHOT_KEYS[1])===null && localStorage.getItem(STORE_SNAPSHOT_KEYS[2])===null,'only redundant older snapshots are removed');
  ok(localStorage.getItem(STORE_COMMIT_STAGING_KEY)===null,'successful retry clears its staging copy');
  ok(localStorage.getItem('toyRotationPhotosV04.unrelatedPersonalImageMarker')==='keep-me','unrelated personal-image storage is untouched');
  store.update(state=>{state.settings.theme='light';},'quota-retry-update');
  ok(store.state.settings.theme==='light','post-recovery write retries safely');
  ok(JSON.parse(localStorage.getItem(STORE_KEY)).settings.theme==='light','post-recovery write reaches canonical');
  ok(store.persistence.diagnostic.byteAccounting.total>0,'diagnostic includes storage byte accounting');
  ok(store.persistence.diagnostic.status.writeStatus==='recovered','successful retry is recorded as recovered');
  ok(store.persistence.diagnostic.status.writable===true,'successful retry diagnostic is writable');
});

await withStorage(new QuotaStorage({[STORE_KEY]:raw},500000), async()=>{
  const store=bootStore();
  ok(!store.canPersist,'quota failure without a safe rollback remains read-only');
  ok(store.persistence.diagnostic.classification.code==='Q','write quota failure has dedicated Q classification');
  ok(store.persistence.diagnostic.status.readStatus==='valid' && store.persistence.diagnostic.status.hydrationStatus==='success','quota diagnostic records successful read and hydration');
  ok(store.persistence.diagnostic.status.writeStatus==='quota_failed' && store.persistence.diagnostic.status.writable===false,'quota diagnostic records failed write and read-only state');
  ok(JSON.parse(localStorage.getItem(STORE_KEY)).profile.childName==='Quota family','unrecoverable quota failure preserves canonical data');
});

ok(isQuotaWriteFailure({code:22}),'code 22 maps to quota write failure');
ok(isQuotaWriteFailure({name:'QuotaExceededError'}),'QuotaExceededError maps to quota write failure');
assert.equal(checks,24);
console.log(`storage safe commit amplification v0.11.5: PASS (${checks} assertions)`);
