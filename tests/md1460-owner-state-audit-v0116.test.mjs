import assert from 'node:assert/strict';
import {buildMd1460OwnerStateAudit} from './md1460-owner-state-audit-v0116.mjs';
import {PARENT,LEGACY,CHILDREN} from './md1460-migration-simulator-v0116.mjs';

const state={schemaVersion:12,toys:[{id:'parent-id',canonicalKey:PARENT,legacyCanonicalKeys:[LEGACY],notes:'private parent note',imageRef:{kind:'personal',id:'private-image-id'},set:{kind:'parent',childIds:['child-id']}},{id:'child-id',canonicalKey:CHILDREN[0],notes:'private child note',set:{kind:'child',parentId:'parent-id',parentCanonicalKey:PARENT,partIndex:1}}],
  wishlist:[{id:'wish',canonicalKey:LEGACY,notes:'private wish note',status:'want'}],rotationHistory:[{id:'round',toyIds:['parent-id','child-id']}],
  catalogState:{tombstones:{[LEGACY]:{deletedAt:'2025-01-01',mergedInto:PARENT,repairedBy:'qa6-md1460-canonical-v1'}},
    removedOwnerships:{'gone-id':{canonicalKey:CHILDREN[1],parentCanonicalKey:PARENT,preservedUserData:{notes:'private removed note',imageRef:{kind:'personal',id:'removed-image'}}}},
    syncMetadata:{qa6MideerCanonicalRepairV1:{}}}};
const before=structuredClone(state);
const audit=await buildMd1460OwnerStateAudit(state,{snapshots:[{key:'snapshot-1',value:before}]});
assert.deepEqual(state,before,'read-only audit does not mutate input');
assert.equal(audit.activeOwnerships.length,2);
assert.equal(audit.removedOwnerships.length,1);
assert.equal(audit.tombstones.length,1);
assert.equal(audit.wishlist.length,1);
assert.equal(audit.snapshotReferences.length,1);
assert.equal(audit.activeOwnerships[0].notes.present,true);
assert.equal(audit.activeOwnerships[0].notes.sha256.length,64);
const json=JSON.stringify(audit);
for(const secret of ['private parent note','private child note','private wish note','private removed note','private-image-id','removed-image'])assert.equal(json.includes(secret),false,`no raw ${secret}`);
console.log('MD1460 read-only owner audit helper: structural refs, hashes, no user text/image IDs, no mutation PASS');
