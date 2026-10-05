import { canonicalKey } from '../data/schema.js';

// This module is deliberately pure.  It produces a proposed state and a
// reviewable plan; callers decide if and when a separately authorised commit
// may ever be made.  QA17b only uses mode:"shadow" / "preview".
export const MD1460_IDENTITY_MIGRATION_MARKER='md1460IdentityMigrationV1';
export const MD1460_PARENT='mideer-my-first-puzzle-dinosaurs-6in1-md1460';
export const MD1460_LEGACY=Object.freeze(['mideer-my-first-puzzle-dinosaurs-6in1','mideer-first-artist-cute-dinosaurs']);
export const MD1460_CHILDREN=Object.freeze(Array.from({length:6},(_,index)=>`${MD1460_PARENT}-puzzle-${index+1}`));
const parentKeys=new Set([MD1460_PARENT,...MD1460_LEGACY]);

const clone=value=>structuredClone(value || {});
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const fingerprint=value=>{
  // This fingerprints an already canonical semantic projection, never the
  // whole runtime state. It is not a security primitive.
  const text=JSON.stringify(stable(value)); let hash=2166136261;
  for(let index=0;index<text.length;index++){hash^=text.charCodeAt(index);hash=Math.imul(hash,16777619);}
  return `fnv1a-${(hash>>>0).toString(16).padStart(8,'0')}`;
};
const same=(left,right)=>JSON.stringify(stable(left))===JSON.stringify(stable(right));
const isParentKey=value=>parentKeys.has(canonicalKey(value));
const partFor=value=>{
  const key=canonicalKey(value);
  for(const parent of parentKeys){const match=new RegExp(`^${parent.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}-puzzle-([1-6])$`).exec(key);if(match)return Number(match[1]);}
  return null;
};
const isIdentityRedirect=row=>row?.mergedInto===MD1460_PARENT && row?.deleted!==true && !row?.deletedAt;
const isDeletion=row=>row?.deleted===true || (!!row?.deletedAt && !row?.mergedInto);
const snapshotStates=snapshots=>snapshots.map(row=>row?.state || row?.value?.state || row?.value || row).filter(value=>value&&typeof value==='object');
const removedRows=state=>Object.entries(state.catalogState?.removedOwnerships || state.removedOwnerships || {}).map(([id,row])=>({id,...row})).filter(row=>isParentKey(row.canonicalKey)||partFor(row.canonicalKey)!==null);
const historicalEvidence=(removed,activeIds,snapshots)=>{
  if(!removed.length)return true;
  if(removed.some(row=>!row?.id || activeIds.includes(row.id) || row.reason!=='parent_delete_cascade' || !(row.deletedAt || row.removedAt)))return false;
  // Current plus at least two internal generations must independently show
  // both the active set and its separate removed-ownership history. A backup
  // file is extra evidence, never a normal startup/preview requirement.
  return snapshotStates(snapshots).filter(state=>{
    const ids=(state.toys||[]).map(toy=>toy.id);
    const gone=new Set(removedRows(state).map(row=>row.id));
    return activeIds.every(id=>ids.includes(id))&&removed.every(row=>gone.has(row.id));
  }).length>=2;
};

const preservation=value=>fingerprint(value);
function semanticState(state){
  const {parents,children}=summary(state); const parent=parents[0]||null;
  const toy=row=>({id:row.id,canonicalKey:canonicalKey(row.canonicalKey),legacyCanonicalKeys:[...(row.legacyCanonicalKeys||[])].map(canonicalKey).sort(),set:{kind:row.set?.kind||null,parentId:row.set?.parentId||null,parentCanonicalKey:canonicalKey(row.set?.parentCanonicalKey||''),partIndex:row.set?.partIndex||null,childIds:[...(row.set?.childIds||[])].sort()},preservationHash:preservation({notes:row.notes||null,imageRef:row.imageRef||null,currentShelf:row.currentShelf||null,shelfMode:row.shelfMode||null,storageLocation:row.storageLocation||null,feedback:row.feedback||null,permanent:row.permanent||null})});
  const tombstones=Object.entries(state.catalogState?.tombstones||{}).filter(([key])=>isParentKey(key)).map(([key,row])=>({key:canonicalKey(key),deleted:row?.deleted===true,deletedAt:row?.deletedAt||null,mergedInto:canonicalKey(row?.mergedInto||''),repairedBy:row?.repairedBy||null})).sort((a,b)=>a.key.localeCompare(b.key));
  const removed=removedRows(state).map(row=>({id:row.id,canonicalKey:canonicalKey(row.canonicalKey),parentCanonicalKey:canonicalKey(row.parentCanonicalKey||''),reason:row.reason||null,removedAt:row.removedAt||row.deletedAt||null,preservationHash:preservation(row.preservedUserData||{})})).sort((a,b)=>a.id.localeCompare(b.id));
  const wishlist=(state.wishlist||[]).filter(row=>isParentKey(row.canonicalKey)||isParentKey(row.catalogId)).map(row=>({id:row.id||null,canonicalKey:canonicalKey(row.canonicalKey||row.catalogId||''),preservationHash:preservation(row)})).sort((a,b)=>`${a.id}:${a.canonicalKey}`.localeCompare(`${b.id}:${b.canonicalKey}`));
  return {parent:parent?toy(parent):null,children:children.map(toy).sort((a,b)=>(a.set.partIndex||0)-(b.set.partIndex||0)),tombstones,removed,wishlist,marker:state.catalogState?.syncMetadata?.[MD1460_IDENTITY_MIGRATION_MARKER]||null};
}
export function buildMD1460SemanticFingerprint(state,{snapshots=[]}={}){
  const generations=snapshotStates(snapshots).map(semanticState).sort((a,b)=>JSON.stringify(stable(a)).localeCompare(JSON.stringify(stable(b))));
  return fingerprint({current:semanticState(state),internalSnapshots:generations});
}
export function buildMD1460OwnerFingerprint(state,{snapshots=[]}={}){
  const withoutMarker=value=>{const copy=structuredClone(value);if(copy?.catalogState?.syncMetadata)delete copy.catalogState.syncMetadata[MD1460_IDENTITY_MIGRATION_MARKER];return copy;};
  return buildMD1460SemanticFingerprint(withoutMarker(state),{snapshots:snapshotStates(snapshots).map(withoutMarker)});
}

function knownIdentity(value){return isParentKey(value)||MD1460_CHILDREN.includes(canonicalKey(value))||partFor(value)!==null;}
function summary(state){
  const toys=state.toys || [];
  const parents=toys.filter(toy=>isParentKey(toy.canonicalKey)&&toy.set?.kind!=='child');
  const children=toys.filter(toy=>partFor(toy.canonicalKey)!==null || toy.set?.parentCanonicalKey===MD1460_PARENT);
  return {parents,children};
}
function invariantReport(state,{snapshots=[]}={}){
  const issues=[]; const {parents,children}=summary(state);
  if(parents.length!==1)issues.push('PARENT_COUNT_NOT_ONE');
  const parent=parents[0];
  if(parent && canonicalKey(parent.canonicalKey)!==MD1460_PARENT)issues.push('PARENT_NOT_SURVIVOR');
  const byPart=new Map();
  for(const child of children){const part=partFor(child.canonicalKey) || child.set?.partIndex; if(!Number.isInteger(part)||part<1||part>6){issues.push('UNKNOWN_CHILD_IDENTITY');continue;} if(byPart.has(part))issues.push('DUPLICATE_CHILD_PART'); byPart.set(part,child); if(parent && child.set?.parentId!==parent.id)issues.push('CHILD_PARENT_ID_MISMATCH'); if(child.set?.parentCanonicalKey&&canonicalKey(child.set.parentCanonicalKey)!==MD1460_PARENT)issues.push('CHILD_PARENT_CANONICAL_MISMATCH');}
  if(children.length!==6 || byPart.size!==6)issues.push('CHILD_COUNT_NOT_SIX');
  const tombstones=state.catalogState?.tombstones || {};
  for(const key of Object.keys(tombstones).filter(isParentKey))if(!isIdentityRedirect(tombstones[key])&&!isDeletion(tombstones[key]))issues.push('AMBIGUOUS_TOMBSTONE');
  const deletions=Object.entries(tombstones).filter(([key,row])=>isParentKey(key)&&isDeletion(row));
  if(deletions.length)issues.push('ACTIVE_DELETION_CONFLICT');
  const removed=removedRows(state);
  if(parent&&!historicalEvidence(removed,[parent.id,...children.map(child=>child.id)],snapshots))issues.push('HISTORICAL_ARCHIVE_NOT_CORROBORATED');
  return {ok:issues.length===0,issues:[...new Set(issues)],parentCount:parents.length,childCount:children.length,removedOwnershipCount:removed.length,snapshotEvidence:!issues.includes('HISTORICAL_ARCHIVE_NOT_CORROBORATED')};
}

export function runMD1460IdentityMigration(input,{context='startup',mode='shadow',snapshots=[]}={}){
  const source=clone(input); const before=invariantReport(source,{snapshots});
  const initialHash=buildMD1460SemanticFingerprint(source,{snapshots});
  const marker=source.catalogState?.syncMetadata?.[MD1460_IDENTITY_MIGRATION_MARKER];
  if(!before.ok)return {status:'BLOCKED',context,mode,inputHash:initialHash,proposedHash:initialHash,diff:{changed:false,ownerDataChanged:false,markerChanged:false},invariants:before,plannedMarker:null,proposedState:source};
  const proposed=clone(source); const {parents}=summary(proposed); const parent=parents[0]; const changes=[];
  if(canonicalKey(parent.canonicalKey)!==MD1460_PARENT){parent.legacyCanonicalKeys=[...new Set([...(parent.legacyCanonicalKeys||[]),parent.canonicalKey])];parent.canonicalKey=MD1460_PARENT;changes.push('ACTIVE_PARENT_CANONICAL');}
  for(const child of summary(proposed).children){const part=partFor(child.canonicalKey)||child.set?.partIndex;const target=MD1460_CHILDREN[part-1];if(canonicalKey(child.canonicalKey)!==target){child.legacyCanonicalKeys=[...new Set([...(child.legacyCanonicalKeys||[]),child.canonicalKey])];child.canonicalKey=target;changes.push(`CHILD_${part}_CANONICAL`);} child.set={...(child.set||{}),kind:'child',parentId:parent.id,parentCanonicalKey:MD1460_PARENT,partIndex:part};}
  const catalog=proposed.catalogState ||= {}; catalog.tombstones ||= {}; catalog.syncMetadata ||= {};
  for(const legacy of MD1460_LEGACY){const row=catalog.tombstones[legacy];if(!row){catalog.tombstones[legacy]={deleted:false,deletedAt:null,mergedInto:MD1460_PARENT,redirectKind:'identity_redirect',migration:'md1460IdentityMigrationV1'};changes.push(`REDIRECT_${legacy}`);} }
  const after=invariantReport(proposed,{snapshots});
  if(!after.ok)return {status:'BLOCKED',context,mode,inputHash:initialHash,proposedHash:initialHash,diff:{changed:false,ownerDataChanged:false,markerChanged:false},invariants:after,plannedMarker:null,proposedState:source};
  const proposedHash=buildMD1460SemanticFingerprint(proposed,{snapshots});
  const plannedMarker={version:1,status:'applied',sourceHash:initialHash,proposedHash,context:'authorised_future_commit_only'};
  const markerChanged=marker?.status!=='applied';
  const status=marker?.status==='applied'?'ALREADY_MIGRATED':'READY';
  return {status,context,mode,inputHash:initialHash,proposedHash,diff:{changed:!same(source,proposed),ownerDataChanged:!same(source,proposed),markerChanged,changes:[...new Set(changes)],activeParentCount:after.parentCount,activeChildCount:after.childCount,removedOwnershipPreserved:after.removedOwnershipCount},invariants:after,plannedMarker:markerChanged?plannedMarker:null,proposedState:proposed};
}

export function isMD1460IdentityMigrationApplied(state){return state?.catalogState?.syncMetadata?.[MD1460_IDENTITY_MIGRATION_MARKER]?.status==='applied';}
