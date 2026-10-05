// Admin-only read projection. Never calls store.update, storage.setItem, or an image repository.
import { canonicalKey } from '../data/schema.js';
import { STORE_KEY, STORE_SHADOW_KEY, STORE_RECOVERY_STAGING_KEY, STORE_COMMIT_STAGING_KEY, STORE_SNAPSHOT_KEYS } from '../data/store.js';

export const MD1460_AUDIT_VERSION = 1;
export const MD1460_PARENT = 'mideer-my-first-puzzle-dinosaurs-6in1-md1460';
export const MD1460_LEGACY = Object.freeze(['mideer-my-first-puzzle-dinosaurs-6in1', 'mideer-first-artist-cute-dinosaurs']);
export const MD1460_CHILDREN = Object.freeze(Array.from({ length:6 }, (_,index) => `${MD1460_PARENT}-puzzle-${index+1}`));
const parents = new Set([MD1460_PARENT, ...MD1460_LEGACY]);
const identities = new Set([...parents, ...MD1460_CHILDREN]);
const known = value => identities.has(canonicalKey(value));
const suspicious = value => typeof value === 'string' && /md1460|dinosaurs-6in1|cute-dinosaurs/i.test(value);
const keysOf = value => value && typeof value === 'object' && !Array.isArray(value) ? Object.keys(value) : [];

async function hash(value) {
  if (value == null || value === '') return { present:false, length:0, sha256:null };
  const input = String(value);
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return { present:true, length:input.length, sha256:Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2,'0')).join('') };
}
async function image(ref) {
  if (!ref) return { present:false, kind:null, idHash:null };
  return { present:true, kind:ref.kind || null, idHash:ref.id || ref.storageKey ? await hash(ref.id || ref.storageKey) : null };
}
async function ownership(toy) {
  return { id:toy.id || null, canonicalKey:toy.canonicalKey || null, legacyCanonicalKeys:(toy.legacyCanonicalKeys || []).filter(suspicious),
    setKind:toy.set?.kind || null, parentId:toy.set?.parentId || null, parentCanonicalKey:toy.set?.parentCanonicalKey || null,
    partIndex:toy.set?.partIndex || null, childIds:toy.set?.childIds || [], intentionalRemovedChildKeys:toy.set?.intentionalRemovedChildKeys || [],
    note:await hash(toy.notes), image:await image(toy.imageRef) };
}
async function removed(id, record) {
  return { id, canonicalKey:record?.canonicalKey || null, parentCanonicalKey:record?.parentCanonicalKey || record?.ownership?.parentCanonicalKey || null,
    removedAt:record?.removedAt || null, reason:record?.reason || null, ownershipKind:record?.ownership?.kind || null,
    fieldNames:keysOf(record), note:await hash(record?.preservedUserData?.notes), image:await image(record?.preservedUserData?.imageRef) };
}
function tombstone(key, record) {
  return { key, deletedAt:record?.deletedAt || null, deleted:record?.deleted === true, mergedInto:record?.mergedInto || null,
    repairedBy:record?.repairedBy || null, deletionProvenance:record?.deletionProvenance || null, fieldNames:keysOf(record) };
}
function parseStorage(storage, key) {
  try {
    const raw=storage?.getItem?.(key);
    if (raw == null) return { key, status:'missing', state:null };
    const value=JSON.parse(raw);
    const state=value?.state && typeof value.state === 'object' ? value.state : value;
    return { key, status:'available', state };
  } catch { return { key, status:'unavailable_or_invalid', state:null }; }
}
function references(state) {
  const toys=(state?.toys || []).filter(toy=>suspicious(toy.canonicalKey) || suspicious(toy.set?.parentCanonicalKey));
  const removedIds=Object.entries(state?.catalogState?.removedOwnerships || {}).filter(([,row])=>suspicious(row?.canonicalKey) || suspicious(row?.parentCanonicalKey)).map(([id])=>id);
  const tombstoneKeys=Object.keys(state?.catalogState?.tombstones || {}).filter(suspicious);
  const wishlistKeys=(state?.wishlist || []).map(row=>row.canonicalKey || row.catalogId || row.catalogKey).filter(suspicious);
  return { activeIds:toys.map(toy=>toy.id), activeKeys:toys.map(toy=>toy.canonicalKey), removedIds, tombstoneKeys, wishlistKeys };
}
export async function buildMd1460MigrationAudit({ state, storage=globalThis.localStorage, catalog=null, build={}, generatedAt=new Date().toISOString() }) {
  const active=await Promise.all((state?.toys || []).filter(toy=>suspicious(toy.canonicalKey) || suspicious(toy.set?.parentCanonicalKey)).map(ownership));
  const catalogState=state?.catalogState || {};
  const tombstones=Object.entries(catalogState.tombstones || {}).filter(([key])=>suspicious(key)).map(([key,record])=>tombstone(key,record));
  const removedOwnerships=await Promise.all(Object.entries(catalogState.removedOwnerships || {}).filter(([,row])=>suspicious(row?.canonicalKey) || suspicious(row?.parentCanonicalKey)).map(([id,row])=>removed(id,row)));
  const wishlist=await Promise.all((state?.wishlist || []).filter(row=>suspicious(row.canonicalKey || row.catalogId || row.catalogKey)).map(async row=>({
    id:row.id || null, canonicalKey:row.canonicalKey || null, catalogId:row.catalogId || null, status:row.status || null,
    stage:row.stage || null, priority:row.priority || null, addedAt:row.addedAt || null, updatedAt:row.updatedAt || null,
    fieldNames:keysOf(row), note:await hash(row.notes), image:await image(row.imageRef || row.catalogSnapshot?.imageRef)
  })));
  const relatedIds=new Set([...active.map(row=>row.id),...removedOwnerships.map(row=>row.id)]);
  const history=(state?.rotationHistory || []).filter(round=>suspicious(round.canonicalKey) || suspicious(round.catalogKey) ||
    (round.toyIds || []).some(id=>relatedIds.has(id)) || relatedIds.has(round.toyId)).map(round=>({
    id:round.id || null, canonicalKey:round.canonicalKey || null, catalogKey:round.catalogKey || null,
    toyIds:(round.toyIds || []).filter(id=>relatedIds.has(id)), historicalMissingToyIds:(round.historicalMissingToyIds || []).filter(id=>relatedIds.has(id))
  }));
  const snapshotKeys=[STORE_KEY,STORE_SHADOW_KEY,STORE_RECOVERY_STAGING_KEY,STORE_COMMIT_STAGING_KEY,...STORE_SNAPSHOT_KEYS];
  const snapshots=snapshotKeys.map(key=>{const row=parseStorage(storage,key);return { key:row.key,status:row.status,refs:row.state?references(row.state):null };});
  const observedKeys=[...active.flatMap(row=>[row.canonicalKey,row.parentCanonicalKey,...row.legacyCanonicalKeys]),
    ...tombstones.flatMap(row=>[row.key,row.mergedInto]),...removedOwnerships.flatMap(row=>[row.canonicalKey,row.parentCanonicalKey]),
    ...wishlist.flatMap(row=>[row.canonicalKey,row.catalogId]),...snapshots.flatMap(row=>row.refs ? [...row.refs.activeKeys,...row.refs.tombstoneKeys,...row.refs.wishlistKeys] : [])]
    .filter(suspicious);
  const parentRows=active.filter(row=>parents.has(canonicalKey(row.canonicalKey)) && row.setKind!=='child');
  const children=MD1460_CHILDREN.map((key,index)=>({canonicalKey:key,partIndex:index+1,active:active.filter(row=>canonicalKey(row.canonicalKey)===key),
    tombstones:tombstones.filter(row=>canonicalKey(row.key)===key),removedOwnerships:removedOwnerships.filter(row=>canonicalKey(row.canonicalKey)===key),
    wishlist:wishlist.filter(row=>canonicalKey(row.canonicalKey)===key),historyPresent:history.some(round=>round.toyIds.some(id=>active.some(toy=>toy.id===id && canonicalKey(toy.canonicalKey)===key)))}));
  return { auditVersion:MD1460_AUDIT_VERSION, schemaVersion:state?.schemaVersion || null, buildId:build.buildId || null, generatedAt,
    parent:{ canonicalKey:MD1460_PARENT,legacyKeys:[...MD1460_LEGACY],active:parentRows,tombstones:tombstones.filter(row=>parents.has(canonicalKey(row.key))),
      removedOwnerships:removedOwnerships.filter(row=>parents.has(canonicalKey(row.canonicalKey))),wishlist:wishlist.filter(row=>parents.has(canonicalKey(row.canonicalKey))),
      historyPresent:history.some(round=>round.toyIds.some(id=>parentRows.some(toy=>toy.id===id))) },
    children,history,snapshots,diagnosticKeyNames:keysOf(catalogState.syncMetadata).filter(key=>/md1460|mideer|parentChild/i.test(key)),
    unknownIdentityKeys:[...new Set(observedKeys.filter(key=>!known(key)))],
    redirectResolution:{ legacyKeys:[...MD1460_LEGACY], target:MD1460_PARENT,
      actualLookups:[...MD1460_LEGACY,MD1460_PARENT].map(key=>({requested:key,resolvedCanonicalKey:catalog?.getByKey?.(key)?.canonicalKey || null})),
      observedTombstoneEdges:tombstones.filter(row=>row.mergedInto).map(row=>({from:row.key,to:row.mergedInto})) },
    backupImportMetadata:{available:false,reason:'External backup files are not accessible from the current PWA without explicit selection'} };
}
