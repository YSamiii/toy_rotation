import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import { buildMd1460MigrationAudit, MD1460_PARENT, MD1460_LEGACY, MD1460_CHILDREN } from '../src/features/md1460-migration-audit.js';
import { validateMd1460MigrationAudit } from '../src/features/md1460-audit-validator.js';

const clone=value=>structuredClone(value);
const fixture=()=>({schemaVersion:12,toys:[{id:'parent-id',canonicalKey:MD1460_PARENT,legacyCanonicalKeys:[MD1460_LEGACY[0]],notes:'private note',imageRef:{kind:'personal',id:'private-image-id'},set:{kind:'parent',childIds:MD1460_CHILDREN.map((_,i)=>`child-${i+1}`)}},
  ...MD1460_CHILDREN.map((canonicalKey,i)=>({id:`child-${i+1}`,canonicalKey,notes:`child-note-${i+1}`,set:{kind:'child',parentId:'parent-id',parentCanonicalKey:MD1460_PARENT,partIndex:i+1},imageRef:{kind:'packaged',id:`asset-${i+1}`}}))],
  wishlist:[],rotationHistory:[],catalogState:{tombstones:{},removedOwnerships:{},syncMetadata:{}}});
function memory(state){const values=new Map([['toyRotation.cleanBaseline',JSON.stringify(state)]]);let writes=0;return {storage:{getItem:key=>values.get(key)??null,setItem:()=>{writes++},removeItem:()=>{writes++}},writes:()=>writes,raw:()=>[...values]};}
const state=fixture(),before=clone(state),mem=memory(state),raw=mem.raw();
const catalog={getByKey:key=>({canonicalKey:MD1460_PARENT})};
const audit=await buildMd1460MigrationAudit({state,storage:mem.storage,catalog,build:{buildId:'preflight-test'},generatedAt:'2026-09-27T00:00:00.000Z'});
assert.deepEqual(state,before);assert.deepEqual(mem.raw(),raw);assert.equal(mem.writes(),0);
assert.equal(audit.parent.active.length,1);assert.equal(audit.children.length,6);
assert.equal(audit.children.every((child,i)=>child.active[0].partIndex===i+1),true);
assert.equal(JSON.stringify(audit).includes('private note'),false);
assert.equal(JSON.stringify(audit).includes('private-image-id'),false);
assert.equal(audit.parent.active[0].note.present,true);
assert.equal(audit.parent.active[0].image.idHash.present,true);
assert.equal(validateMd1460MigrationAudit(audit).status,'OWNER STATE SUFFICIENT FOR MIGRATION');

function blocked(mutator,code){const value=clone(audit);mutator(value);const result=validateMd1460MigrationAudit(value);assert.equal(result.status,'OWNER STATE BLOCKED');assert.ok(result.reasons.includes(code),JSON.stringify(result));}
blocked(a=>{a.parent.tombstones.push({key:MD1460_LEGACY[0],deletedAt:'2026-01-01',deleted:false,mergedInto:null,fieldNames:['deletedAt']});},'ACTIVE_DELETION_CONFLICT');
blocked(a=>{a.parent.tombstones.push({key:MD1460_PARENT,deletedAt:'2026-01-01',deleted:false,mergedInto:null,fieldNames:['deletedAt']});},'ACTIVE_DELETION_CONFLICT');
blocked(a=>{a.parent.removedOwnerships.push({id:'parent-id',canonicalKey:MD1460_PARENT,fieldNames:['canonicalKey']});},'REMOVED_UUID_ACTIVE_COLLISION');
blocked(a=>{a.unknownIdentityKeys=['mideer-md1460-unknown'];},'UNKNOWN_IDENTITY');
blocked(a=>{a.children[0].active[0].canonicalKey=MD1460_PARENT;},'ORPHAN_OR_CONFLATED_CHILD');
blocked(a=>{a.parent.wishlist=[{canonicalKey:MD1460_LEGACY[0]},{canonicalKey:MD1460_PARENT}];},'WISHLIST_LEGACY_SURVIVOR_COLLISION');
blocked(a=>{a.parent.tombstones.push({key:MD1460_LEGACY[0],deletedAt:'2026-01-01',mergedInto:MD1460_PARENT,fieldNames:['deletedAt','mergedInto']});},'UNCLASSIFIED_TOMBSTONE');
blocked(a=>{a.redirectResolution.observedTombstoneEdges=[{from:MD1460_LEGACY[0],to:MD1460_LEGACY[1]},{from:MD1460_LEGACY[1],to:MD1460_PARENT}];},'REDIRECT_CHAIN_OR_UNKNOWN_TARGET');
blocked(a=>{a.redirectResolution.actualLookups[0].resolvedCanonicalKey=null;},'REDIRECT_LOOKUP_MISMATCH');
blocked(a=>{a.snapshots[0].status='unavailable_or_invalid';},'SNAPSHOT_UNAVAILABLE_OR_INVALID');
blocked(a=>{a.otherSecret='unexpected';},'UNKNOWN_AUDIT_FIELD');
const main=await readFile(new URL('../src/main.js',import.meta.url),'utf8');
const source=await readFile(new URL('../src/features/md1460-migration-audit.js',import.meta.url),'utf8');
assert.match(main,/const adminControls=admin\.enabled \? `<button type="button" id="md1460-migration-audit-export"/);
assert.match(main,/if \(!admin\.enabled\) return;/);
assert.match(main,/host\.querySelector\('#admin-sign-in'\)\.onclick=async/);
assert.doesNotMatch(source,/\.setItem\(|\.removeItem\(|\.update\(|\.commit\(/);
assert.doesNotMatch(source,/indexedDB|ImageRepository|imageRepository/);
console.log('MD1460 preflight audit: read-only + privacy + known-good + 11 fail-closed validators PASS');
