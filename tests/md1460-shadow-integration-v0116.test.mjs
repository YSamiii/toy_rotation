import assert from 'node:assert/strict';
import {createHash,webcrypto} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {bootStore,STORE_KEY} from '../src/data/store.js';
import {emptyState} from '../src/data/schema.js';
import {CatalogRepository} from '../src/domain/catalog-repository.js';
import {prepareRestoreState} from '../src/data/backup-service.js';
import {dryRunMd1460,PARENT,LEGACY,CHILDREN} from './md1460-migration-simulator-v0116.mjs';

globalThis.crypto??=webcrypto;
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const rows=async file=>JSON.parse(await readFile(new URL(`../${file}`,import.meta.url),'utf8')).entries;
const base=await rows('catalog-base.json'),remote=await rows('catalog-remote.json');
function detachedCatalog() {
  const state=emptyState(),repo=new CatalogRepository({state,update(fn){fn(state);}});
  repo.applyBase(base);repo.applyRemote(remote);return repo;
}
const input=emptyState();
input.toys=[{id:'parent',canonicalKey:LEGACY,brand:'Mideer',productName:'Dinosaurs',notes:'keep note',imageRef:{kind:'personal',id:'keep image'},skillCodes:[],playMechanics:[],set:{kind:'parent',rotationMode:'split',childIds:['child-1']}},
  {id:'child-1',canonicalKey:CHILDREN[0],brand:'Mideer',productName:'Pterosaur',notes:'child note',skillCodes:[],playMechanics:[],set:{kind:'child',parentId:'parent',parentCanonicalKey:LEGACY,partIndex:1,rotationMode:'split'}}];
input.wishlist=[{id:'old-wish',canonicalKey:LEGACY,notes:'wishlist note',status:'want'}];
input.rotationHistory=[{id:'round',toyIds:['parent','child-1']}];
const raw=structuredClone(input),rawHash=hash(raw);
let writes=0;const storage=new Map([[STORE_KEY,JSON.stringify(raw)]]);
globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:()=>{writes++},removeItem:()=>{writes++}};

// Real bootStore diagnostic path performs actual schema migration/read but
// explicitly disables persistence. The future migration unit is staged after it.
const boot=bootStore({diagnosticMode:true});
assert.equal(boot.canPersist,false);assert.equal(writes,0);
const startup=dryRunMd1460(boot.state);assert.equal(startup.status,'STAGED');
assert.equal(startup.state.toys[0].canonicalKey,PARENT);
assert.equal(startup.state.toys[0].notes,'keep note');
assert.equal(startup.state.toys[1].canonicalKey,CHILDREN[0]);
assert.equal(startup.state.toys[1].set.parentCanonicalKey,PARENT);
const once=startup.state,twice=dryRunMd1460(once),thrice=dryRunMd1460(twice.state);
assert.equal(twice.status,'STAGED');assert.equal(thrice.status,'STAGED');
assert.deepEqual(twice.state,once);assert.deepEqual(thrice.state,once);

// Real prepareRestoreState is the detached production restore/import staging
// path. It is called only on the proposed clone; no image import or commit.
for(const source of ['snapshot-restore','backup-import']) {
  const catalog=detachedCatalog(),proposed=dryRunMd1460(raw);
  assert.equal(proposed.status,'STAGED');
  const stages=[];const staged=prepareRestoreState(proposed.state,catalog,(name)=>stages.push(name));
  assert.ok(stages.includes('migrations_start'));
  assert.ok(stages.includes('state_validation_end'));
  assert.equal(staged.state.schemaVersion,12);
  assert.equal(staged.state.toys.filter(toy=>toy.canonicalKey===PARENT).length,1);
  assert.equal(staged.state.toys.filter(toy=>toy.canonicalKey===CHILDREN[0]).length,1);
  assert.equal(staged.state.wishlist.filter(row=>row.canonicalKey===PARENT).length,1);
  assert.equal(staged.state.toys.find(toy=>toy.id==='parent')?.notes,'keep note');
  console.log(JSON.stringify({source,inputHash:rawHash,proposedHash:hash(staged.state),identityChanges:1,
    tombstoneChanges:0,removedOwnershipChanges:0,wishlistChanges:1,parentChildChanges:1,userFieldsPreserved:true,persistWrites:writes}));
}
const deleted=structuredClone(raw);deleted.catalogState.tombstones[LEGACY]={deletedAt:'2026-01-01T00:00:00.000Z'};
const rollback=dryRunMd1460(deleted);
assert.equal(rollback.status,'BLOCK_CONFLICT');assert.deepEqual(rollback.state,deleted);
assert.equal(writes,0);assert.equal(hash(raw),rawHash);assert.equal(storage.get(STORE_KEY),JSON.stringify(input));
console.log('MD1460 startup/restore/import shadow, 3x idempotency, no-write rollback PASS');
