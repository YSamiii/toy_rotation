import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import {emptyState} from '../src/data/schema.js';
import {CatalogRepository} from '../src/domain/catalog-repository.js';
import {prepareRestoreState} from '../src/data/backup-service.js';
import {PARENT,LEGACY,CHILDREN,dryRunMd1460} from './md1460-migration-simulator-v0116.mjs';

globalThis.crypto ??= webcrypto;
const rows=async name=>JSON.parse(await readFile(new URL(`../${name}`,import.meta.url),'utf8')).entries;
const catalogState=emptyState();
const catalog=new CatalogRepository({state:catalogState,update(fn){fn(catalogState);}});
catalog.applyBase(await rows('catalog-base.json'));
catalog.applyRemote(await rows('catalog-remote.json'));
const parent=(id,key)=>({id,canonicalKey:key,brand:'Mideer',productName:'Dinosaurs',sku:'MD1460',notes:`note-${id}`,imageRef:{kind:'personal',id:`photo-${id}`},set:{kind:'parent',rotationMode:'split',childIds:[]}});
const child=(id,index,parentKey=LEGACY)=>({id,canonicalKey:`${parentKey}:puzzle-${index}`,brand:'Mideer',productName:`Dinosaur Puzzle ${index}`,notes:`note-${id}`,imageRef:{kind:'personal',id:`photo-${id}`},set:{kind:'child',parentId:'parent-id',parentCanonicalKey:parentKey,partIndex:index,rotationMode:'split'}});

// An old snapshot and a backup use the same detached restore staging path.
const oldSnapshot=emptyState();oldSnapshot.schemaVersion=10;
oldSnapshot.toys=[parent('parent-id',LEGACY),child('child-id',1)];
oldSnapshot.toys[0].set.childIds=['child-id'];
oldSnapshot.rotationHistory=[{id:'round',toyIds:['parent-id','child-id']}];
oldSnapshot.catalogState.removedOwnerships={'removed-child':{canonicalKey:CHILDREN[1],parentCanonicalKey:PARENT,ownership:{kind:'child'},preservedUserData:{notes:'deleted note'}}};
const before=structuredClone(oldSnapshot);
const staged=prepareRestoreState(oldSnapshot,catalog);
assert.deepEqual(oldSnapshot,before,'historical fixture unchanged');
assert.equal(staged.state.schemaVersion,12);
assert.equal(staged.state.toys.find(toy=>toy.id==='parent-id')?.canonicalKey,PARENT);
assert.equal(staged.state.toys.find(toy=>toy.id==='child-id')?.canonicalKey,CHILDREN[0]);
assert.equal(staged.state.rotationHistory[0].toyIds.length,2);
assert.equal(staged.state.toys.find(toy=>toy.id==='parent-id')?.notes,'note-parent-id');
assert.equal(staged.state.toys.find(toy=>toy.id==='child-id')?.notes,'note-child-id');
assert.equal(staged.state.catalogState.removedOwnerships['removed-child'].canonicalKey,CHILDREN[1]);
// Do not claim the old restore pipeline protects deletions: the pure design
// simulator must veto an active ownership colliding with a deleted marker.
const deletedBackup=structuredClone(before);
deletedBackup.catalogState.tombstones[LEGACY]={deletedAt:'2025-01-01T00:00:00.000Z'};
const blocked=dryRunMd1460(deletedBackup);
assert.equal(blocked.status,'BLOCK_CONFLICT');
assert.deepEqual(blocked.state,deletedBackup);

const oldChildOnly=emptyState();oldChildOnly.toys=[child('child-only',3)];
const part=dryRunMd1460(oldChildOnly);
assert.equal(part.status,'STAGED');
assert.equal(part.state.toys[0].set.parentCanonicalKey,PARENT);
assert.notEqual(part.state.toys[0].canonicalKey,PARENT,'child import cannot become parent');
console.log('MD1460 historical snapshot and old backup detached staging: schema12, parent/part, notes, history, archive PASS; deletion conflict fail-closed');
