// Local-first review queue. Remote governance is an optional synchronisation
// transport; it must never be the sole place a newly created candidate lives.
export function localCandidates(state) { return state?.catalogState?.syncMetadata?.localCandidates || []; }
export function pendingCandidates(state) { return localCandidates(state).filter(candidate => ['pending','reviewing'].includes(candidate.reviewStatus)); }
export function pendingCandidateCount(state) { return pendingCandidates(state).length; }
export function upsertLocalCandidate(state, payload) {
  state.catalogState ||= {}; state.catalogState.syncMetadata ||= {};
  const queue=state.catalogState.syncMetadata.localCandidates ||= [];
  const index=queue.findIndex(candidate=>candidate.candidateId===payload.candidateId);
  const previous=index < 0 ? null : queue[index];
  const candidate={
    candidateId:payload.candidateId, createdAt:previous?.createdAt || payload.createdAt || new Date().toISOString(), updatedAt:new Date().toISOString(),
    source:payload.source || 'recognition', candidateType:payload.candidateType || 'new_product_candidate', reviewStatus:previous?.reviewStatus || payload.reviewStatus || 'pending',
    proposedCanonicalKey:payload.proposedCanonicalKey || '', brand:payload.brand || '', productName:payload.productName || payload.nameEn || '', nameEn:payload.nameEn || payload.productName || '', nameZh:payload.nameZh || '', aliases:payload.aliases || [], sku:payload.sku || null,
    minAgeMonths:payload.minAgeMonths ?? null, maxAgeMonths:payload.maxAgeMonths ?? null, categoryCode:payload.categoryCode || 'uncategorized', skillCodes:payload.skillCodes || [], playMechanics:payload.playMechanics || [],
    recognitionConfidence:payload.recognitionConfidence ?? null, possibleMatches:payload.possibleMatches || [], imageConsent:payload.imageConsent === true,
    // Image bytes belong in IndexedDB through imageRef.  Canonical state only
    // carries the typed reference needed by the local review UI.
    reviewAttachment:payload.imageConsent === true && typeof payload.reviewAttachment === 'string' && !/^data:|^blob:/i.test(payload.reviewAttachment) ? payload.reviewAttachment : null, reviewAttachmentRef:payload.imageConsent === true ? immutableAttachmentRef(payload.reviewAttachmentRef || previous?.reviewAttachmentRef) : null,
    linkedLocalToyId:payload.linkedLocalToyId || previous?.linkedLocalToyId || null, linkedWishlistId:payload.linkedWishlistId || previous?.linkedWishlistId || null,
    syncStatus:payload.syncStatus || previous?.syncStatus || 'pending_local', mutationId:payload.mutationId || previous?.mutationId || payload.candidateId
  };
  if(index < 0) queue.unshift(candidate); else queue[index]=candidate;
  return candidate;
}
function immutableAttachmentRef(ref) {
  if (!ref || typeof ref !== 'object') return null;
  if (ref.kind === 'remote' && typeof ref.url === 'string') return { kind:'remote', url:ref.url };
  if ((ref.kind === 'personal' || ref.kind === 'catalog') && typeof ref.id === 'string') return { kind:ref.kind, id:ref.id };
  return null;
}
export function setLocalCandidateStatus(state, candidateId, reviewStatus) {
  const candidate=localCandidates(state).find(entry=>entry.candidateId===candidateId); if(!candidate) return null;
  candidate.reviewStatus=reviewStatus; candidate.updatedAt=new Date().toISOString(); return candidate;
}
