// Pure design simulator; never imported by production code or an artifact.
import { canonicalKey } from '../src/data/schema.js';

export const PARENT='mideer-my-first-puzzle-dinosaurs-6in1-md1460';
export const LEGACY='mideer-my-first-puzzle-dinosaurs-6in1';
export const CHILDREN=Array.from({length:6},(_,index)=>canonicalKey(`${PARENT}:puzzle-${index+1}`));
const aliases=new Set([canonicalKey(PARENT),canonicalKey(LEGACY)]);
const parentIdentity=key=>aliases.has(canonicalKey(key));
const logicalIdentity=key=>parentIdentity(key) ? PARENT : canonicalKey(key);
const explicitDeletion=record=>Boolean(record && !record.mergedInto && (record.deletedAt || record.deleted === true));
const nonempty=value=>value!==null && value!==undefined && value!=='';
const validDate=value=>Number.isFinite(Date.parse(value)) ? Date.parse(value) : null;

function safeRedirectGraph(edges) {
  const graph=new Map(edges.map(edge=>[canonicalKey(edge.from),canonicalKey(edge.to)]));
  for (const start of graph.keys()) {
    const seen=new Set(); let node=start;
    while (graph.has(node)) {
      if (seen.has(node) || graph.get(node)===node) return false;
      // A chain needs full intermediate tombstone evidence; never flatten it
      // implicitly in an MD1460 migration dry-run.
      if (graph.has(graph.get(node))) return false;
      seen.add(node); node=graph.get(node);
    }
  }
  return true;
}
function historicalRemovalCorroborated(active,removed,snapshots) {
  if (!active?.id || !removed.length || removed.some(([id,row])=>id===active.id || row?.reason!=='parent_delete_cascade' || !Number.isFinite(Date.parse(row?.removedAt)))) return false;
  return snapshots.some(({value})=>value?.toys?.some(toy=>toy.id===active.id) &&
    removed.every(([id])=>Boolean(value?.catalogState?.removedOwnerships?.[id])));
}

function mergeWishRows(state,rows) {
  const survivor=rows.find(row=>canonicalKey(row.canonicalKey)===PARENT)||rows[0];
  const merged=structuredClone(survivor); const conflicts=[];
  const keys=new Set(rows.flatMap(row=>Object.keys(row)));
  for (const key of keys) {
    if (['id','canonicalKey','catalogId','catalogSnapshot','addedAt','updatedAt'].includes(key)) continue;
    const values=rows.map(row=>row[key]).filter(nonempty);
    if (!values.length) continue;
    if (!nonempty(merged[key])) merged[key]=structuredClone(values[0]);
    if (new Set(values.map(value=>JSON.stringify(value))).size>1) conflicts.push(key);
  }
  merged.canonicalKey=PARENT; merged.catalogId=PARENT;
  if (merged.catalogSnapshot) merged.catalogSnapshot={...merged.catalogSnapshot,canonicalKey:PARENT};
  const imageRank=ref=>({personal:5,catalog:4,packaged:4,remote:3,generated:1,placeholder:0}[ref?.kind]??0);
  const images=rows.map(row=>row.imageRef||row.catalogSnapshot?.imageRef).filter(Boolean).sort((a,b)=>imageRank(b)-imageRank(a));
  if (images.length) merged.imageRef=structuredClone(images[0]);
  const added=rows.map(row=>validDate(row.addedAt)).filter(value=>value!==null);
  const updated=rows.map(row=>validDate(row.updatedAt)).filter(value=>value!==null);
  if (added.length) merged.addedAt=new Date(Math.min(...added)).toISOString();
  if (updated.length) merged.updatedAt=new Date(Math.max(...updated)).toISOString();
  // Deliberate dismissal must not silently become an active recommendation.
  const statuses=rows.map(row=>row.status).filter(nonempty);
  if (statuses.includes('dismissed')) merged.status='dismissed';
  else if (statuses.includes('purchased')) merged.status='purchased';
  else if (statuses.includes('want')) merged.status='want';
  if (rows.length>1) {
    state.catalogState.syncMetadata.md1460WishlistDryRun ||= {};
    state.catalogState.syncMetadata.md1460WishlistDryRun[PARENT]={originalRows:structuredClone(rows),conflictFields:[...new Set(conflicts)],requiresOwnerReview:conflicts.length>0};
  }
  return merged;
}

export function dryRunMd1460(input,{redirects=[{from:LEGACY,to:PARENT}],snapshots=[]}={}) {
  const original=structuredClone(input),staged=structuredClone(input),conflicts=[];
  if (!safeRedirectGraph(redirects)) conflicts.push('REDIRECT_CYCLE_OR_SELF');
  const catalog=staged.catalogState ||= {};
  catalog.tombstones ||= {}; catalog.removedOwnerships ||= {}; catalog.syncMetadata ||= {};
  staged.toys ||= []; staged.wishlist ||= [];
  const parentTombstones=Object.entries(catalog.tombstones).filter(([key])=>parentIdentity(key));
  const deletedParents=parentTombstones.filter(([,record])=>explicitDeletion(record));
  if (parentTombstones.some(([,record])=>record?.mergedInto && (record?.deletedAt || record?.deleted===true) && !record?.deletionProvenance)) conflicts.push('TOMBSTONE_PROVENANCE_UNKNOWN');
  const liveParents=staged.toys.filter(toy=>parentIdentity(toy.canonicalKey) && toy.set?.kind!=='child');
  const removedParents=Object.entries(catalog.removedOwnerships).filter(([,record])=>parentIdentity(record?.canonicalKey) && record?.ownership?.kind!=='child');
  if (removedParents.some(([id])=>liveParents.some(toy=>toy.id===id))) conflicts.push('REMOVED_UUID_ACTIVE_COLLISION');
  if (deletedParents.length && liveParents.length) conflicts.push('ACTIVE_DELETION_CONFLICT');
  if (removedParents.length && liveParents.length && !historicalRemovalCorroborated(liveParents[0],removedParents,snapshots)) conflicts.push('REMOVED_PARENT_ACTIVE_CONFLICT');
  for (const part of CHILDREN) {
    const active=staged.toys.filter(toy=>logicalIdentity(toy.canonicalKey)===part);
    const removed=Object.entries(catalog.removedOwnerships).filter(([,record])=>logicalIdentity(record?.canonicalKey)===part);
    if (removed.some(([id])=>active.some(toy=>toy.id===id))) conflicts.push(`REMOVED_CHILD_ACTIVE_COLLISION:${part}`);
    if (active.length && removed.length && !historicalRemovalCorroborated(active[0],removed,snapshots)) conflicts.push(`REMOVED_CHILD_ACTIVE_CONFLICT:${part}`);
    if (active.length && Object.entries(catalog.tombstones).some(([key,record])=>logicalIdentity(key)===part && explicitDeletion(record))) conflicts.push(`CHILD_ACTIVE_DELETION_CONFLICT:${part}`);
  }
  if (conflicts.length) return {status:'BLOCK_CONFLICT',conflicts:[...new Set(conflicts)],state:original};
  if (liveParents.length>1) return {status:'BLOCK_CONFLICT',conflicts:['DUPLICATE_ACTIVE_PARENT_REQUIRES_FIELD_MERGE'],state:original};
  for (const toy of liveParents) {
    const previous=toy.canonicalKey; toy.canonicalKey=PARENT;
    if (canonicalKey(previous)!==PARENT) toy.legacyCanonicalKeys=[...new Set([...(toy.legacyCanonicalKeys||[]),canonicalKey(previous)])];
  }
  for (const toy of staged.toys) if (toy.set?.kind==='child') {
    if (parentIdentity(toy.canonicalKey)) return {status:'BLOCK_CONFLICT',conflicts:['CHILD_PARENT_IDENTITY_COLLISION'],state:original};
    if (parentIdentity(toy.set.parentCanonicalKey)) toy.set.parentCanonicalKey=PARENT;
  }
  const wishes=staged.wishlist.filter(row=>parentIdentity(row.canonicalKey||row.catalogKey||row.catalogId));
  if (wishes.length) {
    const merged=mergeWishRows(staged,wishes),first=staged.wishlist.indexOf(wishes[0]);
    staged.wishlist=staged.wishlist.filter(row=>!wishes.includes(row)); staged.wishlist.splice(first,0,merged);
  }
  // Deletion markers and UUID-keyed removed ownership archives are immutable
  // evidence in this simulator; no redirect overwrites them.
  return {status:'STAGED',conflicts:[],state:staged};
}
