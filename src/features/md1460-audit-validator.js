import { canonicalKey } from '../data/schema.js';
import { MD1460_AUDIT_VERSION, MD1460_PARENT, MD1460_LEGACY, MD1460_CHILDREN } from './md1460-migration-audit.js';

const exactKeys=new Set([MD1460_PARENT,...MD1460_LEGACY,...MD1460_CHILDREN]);
const exact=key=>exactKeys.has(canonicalKey(key));
const fieldSet=(values,known)=>values.every(value=>known.has(value));
const topFields=new Set(['auditVersion','schemaVersion','buildId','generatedAt','parent','children','history','snapshots','diagnosticKeyNames','unknownIdentityKeys','redirectResolution','backupImportMetadata']);
const tombstoneFields=new Set(['deletedAt','deleted','mergedInto','repairedBy','deletionProvenance','hidden','reason','source','updatedAt']);
const removedFields=new Set(['canonicalKey','parentCanonicalKey','removedAt','reason','ownership','preservedUserData','imageRef','notes','id','deletedAt','status']);
function corroboratedHistory(activeId, removedRows, snapshots) {
  if (!activeId || !removedRows.length || removedRows.some(row=>!row.id || row.id===activeId || row.reason!=='parent_delete_cascade' || !Number.isFinite(Date.parse(row.removedAt)))) return false;
  const coexist=row=>row.status==='available' && row.refs?.activeIds?.includes(activeId) && removedRows.every(gone=>row.refs?.removedIds?.includes(gone.id));
  return (snapshots||[]).some(row=>row.key==='toyRotation.cleanBaseline' && coexist(row)) &&
    (snapshots||[]).some(row=>row.key!=='toyRotation.cleanBaseline' && coexist(row));
}

// This only judges evidence sufficiency. A "sufficient" result is not consent
// to execute migration and never changes a Catalog or owner record.
export function validateMd1460MigrationAudit(audit) {
  const reasons=[];
  const fail=(code)=>reasons.push(code);
  if (!audit || typeof audit!=='object' || Array.isArray(audit)) return {status:'OWNER STATE BLOCKED',reasons:['INVALID_AUDIT']};
  if (!fieldSet(Object.keys(audit),topFields)) fail('UNKNOWN_AUDIT_FIELD');
  if (audit.auditVersion!==MD1460_AUDIT_VERSION || audit.schemaVersion!==12 || !audit.buildId || !audit.generatedAt) fail('INVALID_VERSION_OR_BUILD');
  if (audit.parent?.canonicalKey!==MD1460_PARENT || !Array.isArray(audit.children) || audit.children.length!==6) fail('INVALID_IDENTITY_SET');
  const active=audit.parent?.active || [],tombstones=audit.parent?.tombstones || [],removed=audit.parent?.removedOwnerships || [];
  if (!Array.isArray(active)||!Array.isArray(tombstones)||!Array.isArray(removed)) fail('INVALID_PARENT_STATE');
  if (active.length>1) fail('DUPLICATE_ACTIVE_PARENT');
  if (audit.unknownIdentityKeys?.length || !Array.isArray(audit.unknownIdentityKeys)) fail('UNKNOWN_IDENTITY');
  for(const row of active) if(!exact(row.canonicalKey)||row.setKind==='child'||!row.id) fail('PARENT_CHILD_IDENTITY_CONFLICT');
  for(const row of tombstones) {
    if(!exact(row.key)||!fieldSet(row.fieldNames || [],tombstoneFields)) fail('UNKNOWN_TOMBSTONE');
    if(row.mergedInto && (row.mergedInto!==MD1460_PARENT || row.deletedAt && !row.deletionProvenance)) fail('UNCLASSIFIED_TOMBSTONE');
    if(!row.mergedInto && !row.deletedAt && row.deleted!==true) fail('UNCLASSIFIED_TOMBSTONE');
  }
  if(active.length && tombstones.some(row=>row.deleted===true || !row.mergedInto && row.deletedAt)) fail('ACTIVE_DELETION_CONFLICT');
  for(const row of removed) {
    if(!row.id||!exact(row.canonicalKey)||!fieldSet(row.fieldNames || [],removedFields)) fail('UNKNOWN_REMOVED_OWNERSHIP');
    if(active.some(toy=>toy.id===row.id)) fail('REMOVED_UUID_ACTIVE_COLLISION');
  }
  if(active.length && removed.length && !corroboratedHistory(active[0].id,removed,audit.snapshots)) fail('REMOVED_PARENT_ACTIVE_CONFLICT');
  const wishes=audit.parent?.wishlist || [];
  if(wishes.some(row=>!exact(row.canonicalKey))) fail('UNKNOWN_WISHLIST_IDENTITY');
  if(new Set(wishes.map(row=>canonicalKey(row.canonicalKey))).size>1) fail('WISHLIST_LEGACY_SURVIVOR_COLLISION');
  const children=audit.children || [];
  for(let index=0;index<6;index++) {
    const child=children[index]; if(!child||child.canonicalKey!==MD1460_CHILDREN[index]||child.partIndex!==index+1){fail('CHILD_IDENTITY_OR_ORDER');continue;}
    if((child.active||[]).length>1) fail('DUPLICATE_ACTIVE_CHILD');
    for(const row of child.active||[]) {
      if(canonicalKey(row.canonicalKey)!==child.canonicalKey||row.setKind!=='child'||row.partIndex!==index+1||!row.parentId||!active.some(parent=>parent.id===row.parentId)) fail('ORPHAN_OR_CONFLATED_CHILD');
    }
    if((child.active||[]).some(toy=>(child.removedOwnerships||[]).some(gone=>gone.id===toy.id))) fail('CHILD_REMOVED_UUID_COLLISION');
    if((child.active||[]).length && (child.removedOwnerships||[]).length &&
      !corroboratedHistory(child.active[0].id,child.removedOwnerships,audit.snapshots)) fail('CHILD_REMOVAL_PROVENANCE_UNRESOLVED');
  }
  const snapshots=audit.snapshots||[];
  if(!Array.isArray(snapshots)||snapshots.some(row=>!['available','missing'].includes(row.status))) fail('SNAPSHOT_UNAVAILABLE_OR_INVALID');
  for(const row of snapshots) if(row.refs && [...(row.refs.activeKeys||[]),...(row.refs.tombstoneKeys||[]),...(row.refs.wishlistKeys||[])].some(key=>!exact(key))) fail('UNKNOWN_HISTORICAL_IDENTITY');
  const edges=audit.redirectResolution?.observedTombstoneEdges||[];
  for(const edge of edges) if(!exact(edge.from)||edge.to!==MD1460_PARENT||edge.from===edge.to||edges.some(other=>other.from===edge.to)) fail('REDIRECT_CHAIN_OR_UNKNOWN_TARGET');
  const lookups=audit.redirectResolution?.actualLookups;
  if(!Array.isArray(lookups)||lookups.length!==3||lookups.some(row=>!exact(row.requested)||row.resolvedCanonicalKey!==MD1460_PARENT)) fail('REDIRECT_LOOKUP_MISMATCH');
  if(audit.redirectResolution?.target!==MD1460_PARENT||MD1460_LEGACY.some(key=>!audit.redirectResolution?.legacyKeys?.includes(key))) fail('INVALID_REDIRECT_PROJECTION');
  return {status:reasons.length?'OWNER STATE BLOCKED':'OWNER STATE SUFFICIENT FOR MIGRATION',reasons:[...new Set(reasons)],
    summary:{activeParentCount:active.length,removedParentCount:removed.length,tombstoneCount:tombstones.length,wishlistCount:wishes.length,activeChildCount:children.reduce((n,row)=>n+(row.active?.length||0),0)}};
}
