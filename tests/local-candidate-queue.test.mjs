import assert from 'node:assert/strict';
import { localCandidates, pendingCandidateCount, setLocalCandidateStatus, upsertLocalCandidate } from '../src/features/local-candidate-queue.js';

const state={catalogState:{syncMetadata:{}}};
const noConsent=upsertLocalCandidate(state,{candidateId:'candidate-local',source:'manual',brand:'Acme',productName:'Local toy',proposedCanonicalKey:'acme-local-toy',imageConsent:false,referenceImage:'private-data-must-not-be-stored',linkedWishlistId:'wish-1'});
assert.equal(pendingCandidateCount(state),1);
assert.equal(noConsent.reviewAttachment,null);
assert.equal(noConsent.linkedWishlistId,'wish-1');
const consent=upsertLocalCandidate(state,{candidateId:'candidate-consent',source:'recognition',brand:'Acme',productName:'Consent toy',proposedCanonicalKey:'acme-consent-toy',imageConsent:true,reviewAttachment:'review-reference',linkedLocalToyId:'toy-1'});
assert.equal(consent.reviewAttachment,'review-reference');
assert.equal(localCandidates(state).length,2);
setLocalCandidateStatus(state,'candidate-local','reviewing');
assert.equal(pendingCandidateCount(state),2);
setLocalCandidateStatus(state,'candidate-local','approved');
assert.equal(pendingCandidateCount(state),1);
upsertLocalCandidate(state,{candidateId:'candidate-consent',reviewStatus:'pending',brand:'Changed'});
assert.equal(localCandidates(state).length,2);
console.log('local candidate queue: PASS (privacy, count, dedupe, status)');
