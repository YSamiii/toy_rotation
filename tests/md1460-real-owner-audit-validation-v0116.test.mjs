import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash,webcrypto} from 'node:crypto';
import {validateMd1460MigrationAudit} from '../src/features/md1460-audit-validator.js';
import {buildMd1460MigrationAudit,MD1460_PARENT,MD1460_LEGACY,MD1460_CHILDREN} from '../src/features/md1460-migration-audit.js';
import {dryRunMd1460,PARENT,LEGACY} from './md1460-migration-simulator-v0116.mjs';
import {realOwnerStructure} from './md1460-real-owner-state-fixture-v0116.mjs';
import {bootStore} from '../src/data/store.js';
import {emptyState} from '../src/data/schema.js';
import {CatalogRepository} from '../src/domain/catalog-repository.js';
import {prepareRestoreState} from '../src/data/backup-service.js';

globalThis.crypto??=webcrypto;
const inputPath=process.argv[2];if(!inputPath)throw new Error('Pass the exact owner audit JSON path');
const bytes=await readFile(inputPath);
assert.equal(createHash('sha256').update(bytes).digest('hex').toUpperCase(),'48B9D333EE69A33FAA4DF9AE9DAE11F3B0C5293EBEE7683AFC6909754E1C3553');
const real=JSON.parse(bytes.toString('utf8'));
const initial=validateMd1460MigrationAudit(real);
assert.equal(initial.status,'OWNER STATE SUFFICIENT FOR MIGRATION',JSON.stringify(initial));
assert.deepEqual(initial.reasons,[]);
assert.equal(real.parent.active.length,1);assert.equal(real.children.length,6);
assert.equal(real.parent.removedOwnerships.length,2);
assert.equal(real.children.reduce((n,row)=>n+row.removedOwnerships.length,0),7);
assert.equal(real.parent.wishlist.length,0);assert.equal(real.history.length,0);
assert.deepEqual(real.unknownIdentityKeys,[]);
assert.equal(real.parent.active[0].canonicalKey,MD1460_PARENT);
for(const [index,child] of real.children.entries()){
  assert.equal(child.canonicalKey,MD1460_CHILDREN[index]);assert.equal(child.active.length,1);
  assert.equal(child.active[0].parentId,real.parent.active[0].id);
  assert.equal(child.active[0].image.kind,'placeholder');
  for(const gone of child.removedOwnerships)assert.notEqual(gone.id,child.active[0].id);
}
for(const gone of real.parent.removedOwnerships){assert.notEqual(gone.id,real.parent.active[0].id);assert.equal(gone.reason,'parent_delete_cascade');assert.ok(gone.removedAt);}
for(const row of real.parent.tombstones){assert.ok(MD1460_LEGACY.includes(row.key));assert.equal(row.deleted,false);assert.equal(row.deletedAt,null);assert.equal(row.mergedInto,MD1460_PARENT);assert.equal(row.repairedBy,'qa6-md1460-canonical-v1');}
assert.equal(real.snapshots.filter(row=>row.status==='available' && row.refs?.activeIds?.length===7 && row.refs?.removedIds?.length===9).length,5);
assert.equal(real.redirectResolution.actualLookups.every(row=>row.resolvedCanonicalKey===MD1460_PARENT),true);
assert.equal(real.backupImportMetadata.available,false);

const {state,snapshots}=realOwnerStructure(),before=structuredClone(state),savedSnapshots=structuredClone(snapshots);
const staged=dryRunMd1460(state,{snapshots});
assert.equal(staged.status,'STAGED');assert.deepEqual(state,before);assert.deepEqual(snapshots,savedSnapshots);
assert.equal(staged.state.toys.length,7);assert.equal(staged.state.toys[0].id,'current-parent');
assert.equal(staged.state.toys[0].imageRef.id,'synthetic-current-parent-photo');
assert.deepEqual(staged.state.toys[0].legacyCanonicalKeys,before.toys[0].legacyCanonicalKeys);
assert.deepEqual(staged.state.catalogState.tombstones,before.catalogState.tombstones);
assert.deepEqual(staged.state.catalogState.removedOwnerships,before.catalogState.removedOwnerships);
for(let index=0;index<6;index++){
  assert.equal(staged.state.toys[index+1].id,`current-child-${index+1}`);
  assert.equal(staged.state.toys[index+1].set.parentId,'current-parent');
  assert.equal(staged.state.toys[index+1].imageRef.kind,'placeholder');
}
const second=dryRunMd1460(staged.state,{snapshots}),third=dryRunMd1460(second.state,{snapshots});
assert.equal(second.status,'STAGED');assert.equal(third.status,'STAGED');
assert.deepEqual(second.state,staged.state);assert.deepEqual(third.state,staged.state);

// Six explicit precedence cases. An unresolved deletion is never converted to
// an identity-repair edge merely because a survivor is currently visible.
const caseA=dryRunMd1460(before,{snapshots});assert.equal(caseA.status,'STAGED');
const caseB=dryRunMd1460(before,{snapshots});assert.equal(caseB.state.toys.length,7);
const caseC=structuredClone(before);caseC.toys[0].canonicalKey=LEGACY;caseC.catalogState.tombstones[LEGACY]={deleted:true,deletedAt:'2026-09-20T00:00:00.000Z'};
assert.equal(dryRunMd1460(caseC,{snapshots}).status,'BLOCK_CONFLICT');
const caseD=structuredClone(before);caseD.toys=[];assert.equal(dryRunMd1460(caseD,{snapshots}).state.toys.length,0);
const caseE=dryRunMd1460(before,{snapshots});assert.equal(caseE.state.catalogState.tombstones[LEGACY].deleted,false);
const caseF=structuredClone(before);caseF.catalogState.tombstones[PARENT]={deleted:true,deletedAt:'2026-09-20T00:00:00.000Z'};
assert.equal(dryRunMd1460(caseF,{snapshots}).status,'BLOCK_CONFLICT');

const data=new Map([['toyRotation.cleanBaseline',JSON.stringify(before)],...snapshots.map(row=>[row.key,JSON.stringify(row.value)])]);
const storage={getItem:key=>data.get(key)??null};
const audit=await buildMd1460MigrationAudit({state:before,storage,catalog:{getByKey:key=>({canonicalKey:MD1460_PARENT})},build:{buildId:'synthetic'}});
assert.equal(validateMd1460MigrationAudit(audit).status,'OWNER STATE SUFFICIENT FOR MIGRATION');
let writes=0;globalThis.localStorage={getItem:key=>data.get(key)??null,setItem:()=>{writes++},removeItem:()=>{writes++}};
const boot=bootStore({diagnosticMode:true});
assert.equal(boot.canPersist,false);assert.equal(boot.state.toys.length,7);
assert.equal(Object.keys(boot.state.catalogState.removedOwnerships).length,9);
assert.equal(writes,0);
const bootShadow=dryRunMd1460(boot.state,{snapshots});assert.equal(bootShadow.status,'STAGED');
assert.equal(bootShadow.state.toys.length,7);
const rows=async file=>JSON.parse(await readFile(new URL(`../${file}`,import.meta.url),'utf8')).entries;
function detachedCatalog(){const state=emptyState(),catalog=new CatalogRepository({state,update(fn){fn(state);}});return {state,catalog};}
for(const route of ['snapshot-restore','backup-import']){
  const {catalog}=detachedCatalog();catalog.applyBase(await rows('catalog-base.json'));catalog.applyRemote(await rows('catalog-remote.json'));
  const proposed=dryRunMd1460(before,{snapshots});assert.equal(proposed.status,'STAGED');
  const restored=prepareRestoreState(proposed.state,catalog).state;
  assert.equal(restored.schemaVersion,12,route);
  assert.equal(restored.toys.filter(toy=>toy.canonicalKey===MD1460_PARENT).length,1,route);
  assert.equal(restored.toys.filter(toy=>MD1460_CHILDREN.includes(toy.canonicalKey)).length,6,route);
  assert.equal(restored.toys.find(toy=>toy.id==='current-parent')?.imageRef?.id,'synthetic-current-parent-photo',route);
  assert.equal(Object.keys(restored.catalogState.removedOwnerships).length,9,route);
  assert.deepEqual(restored.catalogState.removedOwnerships,before.catalogState.removedOwnerships,route);
  assert.deepEqual(restored.catalogState.tombstones,before.catalogState.tombstones,route);
  for(let index=0;index<6;index++){
    const child=restored.toys.find(toy=>toy.id===`current-child-${index+1}`);
    assert.equal(child?.set?.parentId,'current-parent',route);
    assert.equal(child?.imageRef?.kind,'placeholder',route);
  }
}
assert.equal(writes,0);assert.deepEqual(state,before);assert.deepEqual(snapshots,savedSnapshots);
console.log('MD1460 exact owner audit + synthetic structure + cases A-F + idempotency PASS');
