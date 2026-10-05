import assert from 'node:assert/strict';
import {runMD1460IdentityMigration,buildMD1460SemanticFingerprint,MD1460_IDENTITY_MIGRATION_MARKER,MD1460_PARENT,MD1460_LEGACY} from '../src/domain/md1460-identity-migration.js';
import {realOwnerStructure} from './md1460-real-owner-state-fixture-v0116.mjs';
import {bootStore,STORE_KEY} from '../src/data/store.js';
import {prepareRestoreState} from '../src/data/backup-service.js';

const {state,snapshots}=realOwnerStructure(); const original=structuredClone(state);
const preview=runMD1460IdentityMigration(state,{context:'admin_preview',mode:'preview',snapshots});
assert.equal(preview.status,'READY');assert.equal(preview.diff.changed,false);assert.equal(preview.diff.ownerDataChanged,false);assert.equal(preview.diff.markerChanged,true);assert.equal(preview.invariants.ok,true);assert.equal(preview.invariants.snapshotEvidence,true);
assert.equal(preview.diff.activeParentCount,1);assert.equal(preview.diff.activeChildCount,6);assert.equal(preview.diff.removedOwnershipPreserved,9);
assert.equal(preview.plannedMarker.version,1);assert.equal(preview.plannedMarker.status,'applied');assert.deepEqual(state,original,'preview is pure');
const repeated=runMD1460IdentityMigration(preview.proposedState,{context:'admin_preview',mode:'preview',snapshots});
assert.equal(repeated.status,'READY');assert.equal(repeated.diff.changed,false,'repeated preview is idempotent');
assert.equal(preview.inputHash,repeated.inputHash,'three-preview semantic fingerprint stays stable');
const reordered=structuredClone(state);reordered.toys.reverse();reordered.catalogState.removedOwnerships=Object.fromEntries(Object.entries(reordered.catalogState.removedOwnerships).reverse());
assert.equal(buildMD1460SemanticFingerprint(state,{snapshots}),buildMD1460SemanticFingerprint(reordered,{snapshots:[...snapshots].reverse()}),'object and snapshot order do not affect fingerprint');

const blocked=structuredClone(state);blocked.catalogState.tombstones[MD1460_LEGACY[0]]={deleted:true,deletedAt:'2026-09-27T00:00:00.000Z'};
assert.equal(runMD1460IdentityMigration(blocked,{snapshots}).status,'BLOCKED','user deletion cannot be converted to a redirect');
const marked=structuredClone(state);marked.catalogState.syncMetadata[MD1460_IDENTITY_MIGRATION_MARKER]={status:'applied'};
assert.equal(runMD1460IdentityMigration(marked,{snapshots}).status,'ALREADY_MIGRATED','future committed marker gates repeat mutation');

const memory=new Map([[STORE_KEY,JSON.stringify(state)],...snapshots.map(row=>[row.key,JSON.stringify(row.value)])]);let writes=0;let startupShadow=null;
globalThis.localStorage={getItem:key=>memory.get(key)??null,setItem:()=>writes++,removeItem:()=>writes++};
const startup=bootStore({diagnosticMode:true,migrationShadow:candidate=>startupShadow=runMD1460IdentityMigration(candidate,{context:'startup',mode:'shadow',snapshots})});
assert.equal(startup.canPersist,false);assert.equal(startupShadow.status,'READY');assert.equal(writes,0,'startup shadow has no writes');
const restore=prepareRestoreState(state,null,()=>{}, {migrationShadow:candidate=>runMD1460IdentityMigration(candidate,{context:'import',mode:'shadow',snapshots})});
assert.equal(restore.summary.md1460Shadow.status,'READY');assert.equal(restore.summary.md1460Shadow.changed,false);assert.equal(restore.summary.md1460Shadow.invariantOk,true);assert.deepEqual(state,original,'restore shadow keeps source detached');
console.log('MD1460 production integration readiness: startup/restore/import shadows, marker gate, deletion separation, no-write preview PASS');
