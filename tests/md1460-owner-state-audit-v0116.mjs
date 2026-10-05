// Pure, read-only diagnostic design. A future owner-facing export can call
// this on an already-loaded state; this module is not bundled into QA16.
import {canonicalKey} from '../src/data/schema.js';
import {PARENT,LEGACY,CHILDREN} from './md1460-migration-simulator-v0116.mjs';

const identities=new Set([canonicalKey(PARENT),canonicalKey(LEGACY),...CHILDREN]);
const related=key=>identities.has(canonicalKey(key));
async function fingerprint(value) {
  if (typeof value!=='string' || !value) return {present:false,length:0,sha256:null};
  const bytes=new TextEncoder().encode(value);
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return {present:true,length:value.length,sha256:[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')};
}
async function toySummary(toy) {
  return {id:toy.id||null,canonicalKey:toy.canonicalKey||null,legacyCanonicalKeys:(toy.legacyCanonicalKeys||[]).filter(related),
    setKind:toy.set?.kind||null,parentId:toy.set?.parentId||null,parentCanonicalKey:toy.set?.parentCanonicalKey||null,
    partIndex:toy.set?.partIndex||null,childIds:toy.set?.childIds||[],intentionalRemovedChildKeys:toy.set?.intentionalRemovedChildKeys||[],
    notes:await fingerprint(toy.notes),personalImageRef:toy.imageRef?.kind==='personal'?{present:true,idHash:await fingerprint(toy.imageRef.id)}:{present:false},
    catalogImageRefKind:toy.imageRef?.kind==='catalog'||toy.imageRef?.kind==='packaged'?toy.imageRef.kind:null};
}
export async function buildMd1460OwnerStateAudit(state,{snapshots=[]}={}) {
  const clone=structuredClone(state);
  const catalog=clone.catalogState||{};
  const active=(clone.toys||[]).filter(toy=>related(toy.canonicalKey)||related(toy.set?.parentCanonicalKey));
  const removed=await Promise.all(Object.entries(catalog.removedOwnerships||{}).filter(([,record])=>related(record?.canonicalKey)||related(record?.parentCanonicalKey)).map(async([id,record])=>({
    id,canonicalKey:record.canonicalKey||null,parentCanonicalKey:record.parentCanonicalKey||null,reason:record.reason||null,
    ownershipKind:record.ownership?.kind||null,removedAt:record.removedAt||null,
    notes:await fingerprint(record.preservedUserData?.notes),personalImageRef:record.preservedUserData?.imageRef?.kind==='personal'
      ?{present:true,idHash:await fingerprint(record.preservedUserData.imageRef.id)}:{present:false}
  })));
  const tombstones=Object.entries(catalog.tombstones||{}).filter(([key])=>related(key)).map(([key,record])=>({key,
    deletedAt:record?.deletedAt||null,mergedInto:record?.mergedInto||null,repairedBy:record?.repairedBy||null,
    deletionProvenance:record?.deletionProvenance||null}));
  const wishlist=await Promise.all((clone.wishlist||[]).filter(row=>related(row.canonicalKey||row.catalogId)).map(async row=>({
    id:row.id||null,canonicalKey:row.canonicalKey||null,catalogId:row.catalogId||null,status:row.status||null,
    priority:row.priority||null,addedAt:row.addedAt||null,notes:await fingerprint(row.notes),
    personalImageRef:row.catalogSnapshot?.imageRef?.kind==='personal'?{present:true,idHash:await fingerprint(row.catalogSnapshot.imageRef.id)}:{present:false}
  })));
  const rotationHistory=(clone.rotationHistory||[]).filter(round=>related(round.canonicalKey)||related(round.catalogKey)||
    (round.toyIds||[]).some(id=>active.some(toy=>toy.id===id))).map(round=>({id:round.id||null,canonicalKey:round.canonicalKey||null,
    catalogKey:round.catalogKey||null,toyIds:(round.toyIds||[]).filter(id=>active.some(toy=>toy.id===id)),
    historicalMissingToyIds:(round.historicalMissingToyIds||[]).filter(id=>removed.some(row=>row.id===id))}));
  const snapshotReferences=snapshots.map(({key,value})=>({key,available:Boolean(value),
    activeToyIds:(value?.toys||[]).filter(toy=>related(toy.canonicalKey)||related(toy.set?.parentCanonicalKey)).map(toy=>toy.id),
    removedToyIds:Object.entries(value?.catalogState?.removedOwnerships||{}).filter(([,row])=>related(row?.canonicalKey)||related(row?.parentCanonicalKey)).map(([id])=>id)}));
  return {format:'md1460-owner-state-read-only-audit',schemaVersion:clone.schemaVersion||null,
    activeOwnerships:await Promise.all(active.map(toySummary)),tombstones,removedOwnerships:removed,wishlist,
    rotationHistory,snapshotReferences,diagnosticKeyNames:Object.keys(catalog.syncMetadata||{}).filter(key=>/md1460|mideer|parentChild/i.test(key))};
}
