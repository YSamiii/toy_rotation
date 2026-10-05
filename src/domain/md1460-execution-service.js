import { STORE_KEY, STORE_SHADOW_KEY, STORE_SNAPSHOT_KEYS } from '../data/store.js';
import { buildMD1460OwnerFingerprint, MD1460_IDENTITY_MIGRATION_MARKER, runMD1460IdentityMigration } from './md1460-identity-migration.js';

export const MD1460_ROLLBACK_STAGING_KEY='toyRotation.cleanBaseline.md1460MigrationRollbackV1';
const read=(storage,key)=>{const raw=storage.getItem(key);return raw?{raw,state:JSON.parse(raw)}:null;};
const snapshots=storage=>[STORE_SHADOW_KEY,...STORE_SNAPSHOT_KEYS].flatMap(key=>{try{const row=read(storage,key);return row?[{key,value:row.state.state||row.state}]:[];}catch{return [];}});
const ownerHash=(state,internal)=>buildMD1460OwnerFingerprint(state,{snapshots:internal});

// The live database is one JSON record. This intentionally bypasses the
// normal persistence/snapshot rotation: the only changed field is the marker,
// while the prior snapshots remain byte-for-byte untouched.
export function executeMD1460MarkerOnly({storage=globalThis.localStorage,previewFingerprint,buildId}){
  let current;
  try{current=read(storage,STORE_KEY);}catch{return {status:'FAILED',reason:'CANONICAL_STATE_UNREADABLE'};}
  if(!current?.state)return {status:'FAILED',reason:'CANONICAL_STATE_UNREADABLE'};
  const internal=snapshots(storage);const revalidated=runMD1460IdentityMigration(current.state,{context:'execution',mode:'execute',snapshots:internal});
  if(revalidated.status==='ALREADY_MIGRATED')return {status:'ALREADY_MIGRATED',preview:revalidated};
  if(previewFingerprint&&previewFingerprint!==revalidated.inputHash)return {status:'STALE_PREVIEW',reason:'STATE_CHANGED_PREVIEW_REQUIRED',preview:revalidated};
  if(revalidated.status!=='READY'||revalidated.diff.ownerDataChanged||!revalidated.diff.markerChanged||!revalidated.invariants.ok)return {status:'FAILED',reason:'EXECUTION_INVARIANT_FAILED',preview:revalidated};
  const preOwnerFingerprint=ownerHash(current.state,internal);
  const beforeMarker=current.state.catalogState?.syncMetadata?.[MD1460_IDENTITY_MIGRATION_MARKER]||null;
  const rollback={version:1,createdAt:new Date().toISOString(),markerBefore:beforeMarker,preOwnerFingerprint,qa6MutationGateBefore:false,status:'prepared'};
  try{storage.setItem(MD1460_ROLLBACK_STAGING_KEY,JSON.stringify(rollback));}catch{return {status:'FAILED',reason:'ROLLBACK_STAGING_WRITE_FAILED'};}
  const candidate=structuredClone(current.state);candidate.catalogState ||= {};candidate.catalogState.syncMetadata ||= {};
  candidate.catalogState.syncMetadata[MD1460_IDENTITY_MIGRATION_MARKER]={version:1,status:'applied',completedAt:new Date().toISOString(),buildId,preMigrationSemanticFingerprint:preOwnerFingerprint,postMigrationSemanticFingerprint:preOwnerFingerprint,ownerDataChanged:false,migrationMode:'marker-only'};
  try{storage.setItem(STORE_KEY,JSON.stringify(candidate));}catch{return {status:'FAILED',reason:'MARKER_COMMIT_FAILED'};}
  try{
    const persisted=read(storage,STORE_KEY)?.state;if(!persisted)throw new Error('readback');
    const postOwnerFingerprint=ownerHash(persisted,internal);
    const post=runMD1460IdentityMigration(persisted,{context:'post_commit',mode:'execute',snapshots:internal});
    if(postOwnerFingerprint!==preOwnerFingerprint)throw new Error('owner_fingerprint_changed');
    if(post.status!=='ALREADY_MIGRATED')throw new Error(`post_status_${post.status}`);
    if(!post.invariants.ok)throw new Error('post_invariants_failed');
    storage.setItem(MD1460_ROLLBACK_STAGING_KEY,JSON.stringify({...rollback,status:'validated',postOwnerFingerprint,markerWritten:true}));
    return {status:'COMPLETED',preOwnerFingerprint,postOwnerFingerprint,preview:post};
  }catch(error){
    try{storage.setItem(STORE_KEY,current.raw);storage.setItem(MD1460_ROLLBACK_STAGING_KEY,JSON.stringify({...rollback,status:'rolled_back',reason:String(error?.message||error)}));return {status:'ROLLED_BACK',reason:'POST_COMMIT_VALIDATION_FAILED',detail:String(error?.message||error)};}
    catch{return {status:'ROLLBACK_FAILED',reason:'POST_COMMIT_VALIDATION_FAILED'};}
  }
}
