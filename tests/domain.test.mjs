import assert from 'node:assert/strict';
import test from 'node:test';
import { assess, SubstitutionEngine } from '../src/domain/substitution-engine.js';
import { generateRotation } from '../src/domain/rotation-engine.js';
import { CatalogRepository } from '../src/domain/catalog-repository.js';
import { ensureSplitSetChildren, splitExplicitSet, validateSetGraph } from '../src/domain/set-service.js';
import { runMigrations } from '../src/data/store.js';
import { AdminService } from '../src/features/admin-service.js';
import { setToyInterest, toggleToyShelf } from '../src/domain/library-service.js';
import { exportBackup, restoreBackup } from '../src/data/backup-service.js';
import { RecognitionService } from '../src/features/recognition-service.js';

const toy = (overrides = {}) => ({ id: crypto.randomUUID(), canonicalKey: 'toy-'+Math.random(), productName:'Toy', skillCodes:[],playMechanics:[],set:{kind:'none'},rotationValue:'medium',shelfMode:'rotate',hidden:false,archived:false,status:'stored', ...overrides });

test('shared generic skills never become high substitution', () => {
  const a=toy({skillCodes:['fine_motor'],playMechanics:['fine_motor_general']}), b=toy({skillCodes:['fine_motor'],playMechanics:['fine_motor_general']});
  assert.equal(assess(a,b).level, 'skill_similarity_only');
});
test('shared specific mechanism is meaningful substitution', () => {
  const a=toy({playMechanics:['magnetic_fishing']}), b=toy({playMechanics:['magnetic_fishing'],operationCode:'hook'}); a.operationCode='hook';
  assert.equal(assess(a,b).level, 'high_substitution');
});
test('one result counts only exact high medium for purchase impact', () => {
  const candidate=toy({canonicalKey:'wanted',playMechanics:['magnetic_fishing'],operationCode:'hook'}), owned=[toy({canonicalKey:'other',playMechanics:['magnetic_fishing'],operationCode:'hook'}),toy({canonicalKey:'skills',skillCodes:['fine_motor']})];
  const result=new SubstitutionEngine().result(candidate,owned,1); assert.equal(result.counts.high_substitution,1); assert.equal(result.counts.skill_similarity_only,0); assert.equal(result.purchaseImpact.priority,'medium');
});
test('age appropriate overlap uses the same supplied child age in the result', () => {
  const candidate = toy({ canonicalKey:'wanted', playMechanics:['magnetic_fishing'] });
  const owned = [toy({ canonicalKey:'owned', playMechanics:['magnetic_fishing'], minAgeMonths:36, maxAgeMonths:60 })];
  const engine = new SubstitutionEngine();
  assert.equal(engine.result(candidate, owned, 1, { childAgeMonths:18 }).ageAppropriateCounts.medium_substitution, 0);
  assert.equal(engine.result(candidate, owned, 1, { childAgeMonths:40 }).ageAppropriateCounts.medium_substitution, 1);
});
test('permanent toy is kept while a split parent is excluded', () => {
  const permanent=toy({id:'permanent',shelfMode:'permanent'}), parent=toy({id:'parent',set:{kind:'parent',rotationMode:'split'}}), child=toy({id:'child',playMechanics:['jigsaw']});
  const result=generateRotation({toys:[permanent,parent,child],history:[],childAgeMonths:20,size:2}); assert.deepEqual(result.map(x=>x.id).sort(),['child','permanent']);
});
test('catalog tombstone survives remote replacement and keeps personal toys outside the catalog pipeline', () => {
  const state={catalogState:{tombstones:{},adminEdits:{}}};let revision=0;const store={get state(){return state},update(fn){fn(state);revision++}};
  const repository=new CatalogRepository(store);repository.applyRemote([{key:'catalog-a',brand:'Test',name:'Catalog A'}]);assert.equal(repository.active.length,1);
  repository.deleteStandardToy('catalog-a');assert.equal(repository.active.length,0);
  repository.applyRemote([{key:'catalog-a',brand:'Test',name:'Catalog A'},{key:'catalog-b',brand:'Test',name:'Catalog B'}]);assert.deepEqual(repository.active.map(x=>x.canonicalKey),['catalog-b']);assert.equal(revision,1);
});
test('catalog admin image reference stays catalog-owned and is not a toy-library photo reference', () => {
  const state={toys:[],catalogState:{tombstones:{},adminEdits:{}}}; const store={get state(){return state},update(fn){fn(state)}};
  const repository=new CatalogRepository(store); repository.applyRemote([{key:'catalog-image',brand:'Test',name:'Catalog image'}]);
  repository.updateAdminEdit('catalog-image', { imageRef:{kind:'catalog',id:'catalog:catalog-image'} });
  assert.deepEqual(repository.getByKey('catalog-image').imageRef, {kind:'catalog',id:'catalog:catalog-image'});
  assert.equal(state.toys.length, 0);
});
test('explicit split set produces a parent excluded from ordinary rotation and independent child records', () => {
  const parent=toy({id:'kit',canonicalKey:'kit',set:{kind:'parent',childIds:[],rotationMode:'split'}});const output=splitExplicitSet(parent,[{productName:'Puzzle one'},{productName:'Puzzle two'}]);
  assert.equal(output.children.length,2);assert.ok(output.children.every(child=>child.set.kind==='child'&&child.set.parentId==='kit'));assert.ok(validateSetGraph([output.parent,...output.children]));assert.equal(output.children[0].imageRef.kind,'placeholder');
});
test('explicit multi-puzzle name migrates once into stable child toys', () => {
  const parent = toy({ id:'set', canonicalKey:'dino-6in1', productName:'Dinosaur 6-in-1 puzzle', set:{kind:'parent',childIds:[],rotationMode:'split'} });
  const definitions = new Map([[parent.canonicalKey, parent]]);
  const first = ensureSplitSetChildren([parent], definitions);
  assert.equal(first.length, 6);
  const second = ensureSplitSetChildren([parent, ...first], definitions);
  assert.equal(second.length, 0);
  assert.equal(parent.set.childIds.length, 6);
});
test('schema migration preserves legacy data while normalizing display values into codes', () => {
  const migrated = runMigrations({ schemaVersion:1, settings:{language:'zh'}, toys:[{id:'a',brand:'其它',productName:'Music toy',category:'音乐',skills:['因果关系'],photoId:'legacy-photo'}], wishlist:[], catalogState:{tombstones:{'old-key':true},adminEdits:{}} });
  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.toys[0].brand, 'other_unspecified');
  assert.equal(migrated.toys[0].categoryCode, 'music');
  assert.deepEqual(migrated.toys[0].skillCodes, ['cause_effect']);
  assert.equal(migrated.toys[0].imageRef.kind, 'personal');
  assert.ok(migrated.catalogState.tombstones['old-key']);
});
test('schema migration promotes old split-set markers into a parent relation', () => {
  const migrated = runMigrations({ schemaVersion:1, toys:[{id:'set', productName:'Puzzle 6-in-1', set:{kind:'whole',rotationMode:'split'}}], wishlist:[], catalogState:{tombstones:{},adminEdits:{}} });
  assert.equal(migrated.toys[0].set.kind, 'parent');
  assert.equal(migrated.toys[0].set.rotationMode, 'split');
});
test('administrator diagnostics remain gated and report only authenticated backend state', async () => {
  const originalFetch = globalThis.fetch;
  const values = new Map();
  globalThis.sessionStorage = { getItem:key => values.get(key) || null, setItem:(key,value) => values.set(key,value), removeItem:key => values.delete(key) };
  globalThis.fetch = async url => new Response(JSON.stringify(url.endsWith('/health') ? { ok:true } : { remaining:42 }), { status:200, headers:{'Content-Type':'application/json'} });
  const state = { toys:[], catalogState:{ tombstones:{}, adminEdits:{}, syncMetadata:{ pendingAdminDeletes:['old-key'] } } };
  const store = { get state(){ return state; }, update(fn){ fn(state); } };
  const catalog = new CatalogRepository(store);
  const service = new AdminService({ store, catalog, baseUrl:'https://example.test' });
  values.set('toyRotationAdminTokenV095', 'test'); values.set('toyRotationAdminVerifiedV095', '1');
  const result = await service.diagnostics();
  assert.equal(result.backend, 'available'); assert.equal(result.quota.remaining, 42); assert.deepEqual(result.pendingDeletes, ['old-key']);
  globalThis.fetch = originalFetch;
});
test('administrator mode requires a verified password handshake and does not expose diagnostics before it', async () => {
  const originalFetch = globalThis.fetch;
  const values = new Map();
  globalThis.sessionStorage = { getItem:key => values.get(key) || null, setItem:(key,value) => values.set(key,value), removeItem:key => values.delete(key) };
  const requests = [];
  globalThis.fetch = async (url, options = {}) => { requests.push({ url, options }); return new Response('{}', { status:200 }); };
  const state = { toys:[], catalogState:{ tombstones:{}, adminEdits:{}, syncMetadata:{} } };
  const store = { get state(){ return state; }, update(fn){ fn(state); } };
  const service = new AdminService({ store, catalog:new CatalogRepository(store), baseUrl:'https://example.test' });
  await assert.rejects(service.diagnostics(), /adminVerificationRequired/);
  await service.signIn('correct-password');
  assert.equal(service.enabled, true);
  assert.equal(requests[0].url, 'https://example.test/admin-auth');
  assert.equal(requests[0].options.headers.Authorization, 'Bearer correct-password');
  service.signOut();
  assert.equal(service.enabled, false);
  globalThis.fetch = originalFetch;
});
test('administrator deletion writes the local tombstone before a failed backend request', async () => {
  const originalFetch = globalThis.fetch;
  const values = new Map([['toyRotationAdminTokenV095', 'test'], ['toyRotationAdminVerifiedV095', '1']]);
  globalThis.sessionStorage = { getItem:key => values.get(key) || null, setItem:(key,value) => values.set(key,value), removeItem:key => values.delete(key) };
  globalThis.fetch = async () => new Response('', { status:503 });
  const state = { toys:[], catalogState:{ tombstones:{}, adminEdits:{}, syncMetadata:{} } };
  const store = { get state(){ return state; }, update(fn){ fn(state); } };
  const catalog = new CatalogRepository(store);
  catalog.applyRemote([{ key:'delete-me', brand:'Test', name:'Delete me' }]);
  const service = new AdminService({ store, catalog, baseUrl:'https://example.test' });
  await assert.rejects(service.delete('delete-me', catalog.getByKey('delete-me')));
  assert.equal(catalog.getByKey('delete-me'), null);
  assert.ok(state.catalogState.tombstones['delete-me']?.deletedAt);
  assert.deepEqual(state.catalogState.syncMetadata.pendingAdminDeletes, ['delete-me']);
  globalThis.fetch = originalFetch;
});
test('interest is mutually exclusive and a second tap restores a true null state', () => {
  const state = { toys:[toy({id:'interest', interest:null})] };
  const store = { update(fn) { fn(state); } };
  setToyInterest(store, 'interest', 'like'); assert.equal(state.toys[0].interest, 'like');
  setToyInterest(store, 'interest', 'like'); assert.equal(state.toys[0].interest, null);
  setToyInterest(store, 'interest', 'neutral'); assert.equal(state.toys[0].interest, 'neutral');
  setToyInterest(store, 'interest', 'dislike'); assert.equal(state.toys[0].interest, 'dislike');
});
test('shelf toggle has a single transition path and records activation time', () => {
  const state = { toys:[toy({id:'shelf', status:'stored'})] };
  const store = { update(fn) { fn(state); } };
  toggleToyShelf(store, 'shelf'); assert.equal(state.toys[0].status, 'active'); assert.ok(state.toys[0].lastActivatedAt);
  toggleToyShelf(store, 'shelf'); assert.equal(state.toys[0].status, 'stored');
});
test('backup preserves separate personal and catalog image assets without cross-deleting either owner', async () => {
  const state = { schemaVersion:2, settings:{language:'en', theme:'system'}, profile:{}, drafts:[], wishlist:[], rotationHistory:[], catalogState:{ tombstones:{}, adminEdits:{}, syncMetadata:{} }, toys:[
    toy({ id:'personal', imageRef:{kind:'personal', id:'personal:one'} }),
    toy({ id:'catalog', imageRef:{kind:'catalog', id:'catalog:two'} })
  ] };
  const values = new Map([['personal:one','data:personal'], ['catalog:two','data:catalog']]);
  const images = { resolve:async ref => values.get(ref.id), importPersonal:async (id,value) => values.set(id,value), importCatalog:async (id,value) => values.set(id,value) };
  const backup = await exportBackup({ state }, images);
  assert.equal(backup.images['personal:personal:one'], 'data:personal');
  assert.equal(backup.images['catalog:catalog:two'], 'data:catalog');
  let restored;
  await restoreBackup(backup, { replace:value => { restored = value; } }, images);
  assert.equal(restored.toys.find(item => item.id === 'personal').imageRef.kind, 'personal');
  assert.equal(restored.toys.find(item => item.id === 'catalog').imageRef.kind, 'catalog');
});
test('AI confirmation gives every explicitly split child an independent image reference', async () => {
  const state = { drafts:[{
    id:'draft', status:'ready', productName:'Vehicles 2-in-1', brand:'Test', categoryCode:'puzzles_matching', skillCodes:[], playMechanics:[],
    imageRef:{kind:'personal', id:'personal:parent'}, isSet:true, setMode:'split', children:[{productName:'Car puzzle'},{productName:'Bus puzzle'}]
  }], toys:[] };
  const store = { get state(){ return state; }, update(fn){ fn(state); } };
  let copy = 0;
  const images = { copyToPersonal:async () => ({ kind:'personal', id:`personal:child-${++copy}` }), savePersonal:async () => ({ kind:'personal', id:'unused' }) };
  const recognition = new RecognitionService({ store, images, baseUrl:'https://example.test' });
  await recognition.confirm('draft');
  const children = state.toys.filter(item => item.set?.kind === 'child');
  assert.equal(children.length, 2);
  assert.deepEqual(children.map(item => item.imageRef.id).sort(), ['personal:child-1', 'personal:child-2']);
});
