import assert from 'node:assert/strict';
import { AppStore, STORE_COMMIT_STAGING_KEY, STORE_KEY, STORE_SNAPSHOT_KEYS, bootStore } from '../src/data/store.js';
import { RecognitionService } from '../src/features/recognition-service.js';
import { addCatalogToy } from '../src/domain/library-service.js';

globalThis.crypto ??= (await import('node:crypto')).webcrypto;
globalThis.window={ TOY_ROTATION_CONFIG:{ PERSISTENCE_DIAGNOSTIC_MODE:false } };

class MemoryStorage {
  constructor(values={}) { this.values=new Map(Object.entries(values)); this.failGet=new Set(); this.failSet=new Set(); this.corruptRead=new Set(); }
  getItem(key) { if(this.failGet.has(key)) throw new Error(`get:${key}`); if(this.corruptRead.has(key)) return '{bad'; return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key,value) { if(this.failSet.has(key)) throw new Error(`set:${key}`); this.values.set(key,String(value)); }
  removeItem(key) { this.values.delete(key); }
}
function sentinelState() {
  return { schemaVersion:12, settings:{ language:'en', theme:'dark', rotationSize:4, rotationDays:9, onboardingDone:true }, profile:{ childName:'PERSISTENCE_SENTINEL', childBirthDate:'2020-01-02' }, toys:[{ id:'toy-persistence-sentinel', canonicalKey:'sentinel-toy', productName:'Sentinel toy', brand:'Acme', categoryCode:'cognitive', skillCodes:[], playMechanics:[], imageRef:{kind:'personal',id:'image-persistence-sentinel'}, shelfMode:'permanent', permanentSource:'user', rotationParticipation:'paused', pauseReason:'sentinel', status:'stored', set:{kind:'none'} }], wishlist:[{ id:'wishlist-persistence-sentinel', canonicalKey:'sentinel-wish', catalogSnapshot:{ canonicalKey:'sentinel-wish', productName:'Sentinel wish', brand:'Acme', imageRef:{kind:'personal',id:'wish-image-sentinel'} }, status:'want', priority:'high' }], rotationHistory:[{ toyIds:['toy-persistence-sentinel'], at:'2026-08-31T00:00:00.000Z' }], lastRotationAt:'2026-08-31T00:00:00.000Z', catalogState:{ tombstones:{}, adminEdits:{}, imageRefsByKey:{}, imageRefsByIdentity:{}, learnedEntries:[], syncMetadata:{} } };
}
function storageWithSentinel() { return new MemoryStorage({[STORE_KEY]:JSON.stringify(sentinelState())}); }
function assertSentinel(storage) { const raw=storage.values.get(STORE_KEY); assert.ok(raw,'current must remain present'); const value=JSON.parse(raw); assert.equal(value.profile.childName,'PERSISTENCE_SENTINEL'); assert.equal(value.toys?.[0]?.id,'toy-persistence-sentinel'); assert.equal(value.wishlist?.[0]?.id,'wishlist-persistence-sentinel'); assert.equal(value.rotationHistory?.[0]?.toyIds?.[0],'toy-persistence-sentinel'); assert.equal(value.schemaVersion,12); }
async function withStorage(storage, test) { const previous=globalThis.localStorage; globalThis.localStorage=storage; try { await test(); } finally { globalThis.localStorage=previous; } }
let passed=0;
async function test(name, fn) { await fn(); passed++; console.log(`PASS ${name}`); }

await test('first run creates and reloads a readable store', async()=>withStorage(new MemoryStorage(), async()=>{ const first=bootStore(); assert.equal(first.canPersist,true); first.update(state=>{state.profile.childName='PERSISTENCE_SENTINEL';}); const reload=bootStore(); assert.equal(reload.state.profile.childName,'PERSISTENCE_SENTINEL'); }));
await test('read throw enters safe mode without an empty write', async()=>{const storage=storageWithSentinel();storage.failGet.add(STORE_KEY);await withStorage(storage,async()=>{const store=bootStore();assert.equal(store.canPersist,false);assert.equal(store.persistence.status,'safe_read_failure');});assertSentinel(storage);});
await test('parse failure enters safe mode without an empty write', async()=>{const storage=storageWithSentinel();storage.corruptRead.add(STORE_KEY);await withStorage(storage,async()=>{assert.equal(bootStore().canPersist,false);});assertSentinel(storage);});
await test('migration failure preserves raw sentinel current', async()=>{const storage=new MemoryStorage({[STORE_KEY]:JSON.stringify({schemaVersion:0,profile:{childName:'PERSISTENCE_SENTINEL'},toys:{broken:true}})});await withStorage(storage,async()=>{assert.equal(bootStore().persistence.status,'safe_migration_failure');});assert.equal(JSON.parse(storage.values.get(STORE_KEY)).profile.childName,'PERSISTENCE_SENTINEL');});
await test('invalid persisted shape enters safe mode without write', async()=>{const storage=storageWithSentinel();storage.values.set(STORE_KEY,JSON.stringify(null));await withStorage(storage,async()=>{assert.equal(bootStore().canPersist,false);});assert.equal(storage.values.get(STORE_KEY),'null');});

for (const [name, configure, mutate] of [
  ['serialize failure', null, state=>{state.circular=state;}],
  ['staging write failure', storage=>storage.failSet.add(STORE_COMMIT_STAGING_KEY), state=>{state.settings.theme='light';}],
  ['staging read-back mismatch', storage=>storage.corruptRead.add(STORE_COMMIT_STAGING_KEY), state=>{state.settings.theme='light';}],
  ['snapshot rotation failure', storage=>storage.failSet.add(STORE_SNAPSHOT_KEYS[0]), state=>{state.settings.theme='light';}],
  ['promote current failure', storage=>storage.failSet.add(STORE_KEY), state=>{state.settings.theme='light';}],
  ['final current verify failure', storage=>storage.corruptRead.add(STORE_KEY), state=>{state.settings.theme='light';}]
]) await test(name, async()=>{const storage=storageWithSentinel();configure?.(storage);await withStorage(storage,async()=>{const store=new AppStore(sentinelState());assert.throws(()=>store.update(mutate));});assertSentinel(storage);});

await test('malformed previous staging is ignored and current survives startup', async()=>{const storage=storageWithSentinel();storage.values.set(STORE_COMMIT_STAGING_KEY,'{broken');await withStorage(storage,async()=>{const store=bootStore();assert.equal(store.canPersist,true);assert.equal(store.state.profile.childName,'PERSISTENCE_SENTINEL');});assertSentinel(storage);});
await test('snapshot ring preserves the three prior generations', async()=>{const storage=storageWithSentinel();await withStorage(storage,async()=>{const store=bootStore();for(let i=1;i<=3;i++)store.update(state=>{state.settings.rotationSize=10+i;});});assert.equal(JSON.parse(storage.values.get(STORE_SNAPSHOT_KEYS[0])).settings.rotationSize,12);assert.equal(JSON.parse(storage.values.get(STORE_SNAPSHOT_KEYS[1])).settings.rotationSize,11);assert.equal(JSON.parse(storage.values.get(STORE_SNAPSHOT_KEYS[2])).settings.rotationSize,4);});
await test('all protected data survives reload', async()=>{const storage=storageWithSentinel();await withStorage(storage,async()=>{const reload=bootStore();assert.equal(reload.state.profile.childName,'PERSISTENCE_SENTINEL');assert.equal(reload.state.toys[0].id,'toy-persistence-sentinel');assert.equal(reload.state.wishlist[0].id,'wishlist-persistence-sentinel');assert.equal(reload.state.toys[0].imageRef.id,'image-persistence-sentinel');assert.equal(reload.state.toys[0].shelfMode,'permanent');assert.equal(reload.state.toys[0].rotationParticipation,'paused');assert.equal(reload.state.settings.rotationDays,9);assert.equal(reload.state.rotationHistory.length,1);});});
await test('interrupted previous commit leaves current readable', async()=>{const storage=storageWithSentinel();storage.values.set(STORE_COMMIT_STAGING_KEY,JSON.stringify({generation:1,state:{schemaVersion:12,toys:[]}}));await withStorage(storage,async()=>{const reload=bootStore();assert.equal(reload.canPersist,true);assert.equal(reload.state.profile.childName,'PERSISTENCE_SENTINEL');});assertSentinel(storage);});
for (const [name, check] of [
  ['profile survives reload', state=>assert.equal(state.profile.childName,'PERSISTENCE_SENTINEL')],
  ['Toy Library survives reload', state=>assert.equal(state.toys[0].id,'toy-persistence-sentinel')],
  ['Wishlist survives reload', state=>assert.equal(state.wishlist[0].id,'wishlist-persistence-sentinel')],
  ['current rotation survives reload', state=>assert.equal(state.lastRotationAt,'2026-08-31T00:00:00.000Z')],
  ['rotation history survives reload', state=>assert.equal(state.rotationHistory[0].toyIds[0],'toy-persistence-sentinel')],
  ['custom permanent survives reload', state=>assert.equal(state.toys[0].shelfMode,'permanent')],
  ['paused state survives reload', state=>assert.equal(state.toys[0].rotationParticipation,'paused')],
  ['personal image refs survive reload', state=>assert.equal(state.toys[0].imageRef.id,'image-persistence-sentinel')],
  ['settings survive reload', state=>assert.equal(state.settings.rotationDays,9)]
]) await test(name, async()=>{const storage=storageWithSentinel();await withStorage(storage,async()=>check(bootStore().state));});
await test('Recognition to Wishlist survives reload without ownership', async()=>{const storage=new MemoryStorage();await withStorage(storage,async()=>{const store=bootStore();store.update(state=>state.drafts.push({id:'recognition-wishlist',status:'ready',canonicalKey:'recognized-wishlist',brand:'Acme',productName:'Recognized wish',names:{en:'Recognized wish',zh:''},categoryCode:'cognitive',skillCodes:[],playMechanics:[],imageRef:{kind:'personal',id:'recognized-image'}}));const recognition=new RecognitionService({store,images:{resolve:async()=>null},catalog:{resolveRecognition:()=>({kind:'genuinely_new'}),ensureSetChildren(){}},baseUrl:'https://example.invalid'});await recognition.confirm('recognition-wishlist',{destination:'wishlist'});const reload=bootStore();assert.equal(reload.state.toys.length,0);assert.equal(reload.state.wishlist.length,1);assert.equal(reload.state.wishlist[0].catalogSnapshot.imageRef.id,'recognized-image');});});
await test('Wishlist to Toy Library survives reload with reused image', async()=>{const storage=new MemoryStorage();await withStorage(storage,async()=>{const store=bootStore();store.update(state=>state.wishlist.push({id:'wish-promote',canonicalKey:'promotion-wish',catalogSnapshot:{canonicalKey:'promotion-wish',brand:'Acme',productName:'Promotion wish',categoryCode:'cognitive',skillCodes:[],playMechanics:[],imageRef:{kind:'personal',id:'promotion-image'}},status:'purchased'}));const source=store.state.wishlist[0].catalogSnapshot;assert.equal(addCatalogToy(store,source,source.imageRef).added,true);const reload=bootStore();assert.equal(reload.state.wishlist.length,1);assert.equal(reload.state.toys.length,1);assert.equal(reload.state.toys[0].imageRef.id,'promotion-image');});});

console.log(`persistence fault injection: PASS (${passed} tests)`);
