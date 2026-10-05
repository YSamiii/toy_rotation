import assert from 'node:assert/strict';

import { archiveLocalCandidate, localCandidates, pendingCandidateCount, reopenLocalCandidateReview, setLocalCandidateStatus, unarchiveLocalCandidate, upsertLocalCandidate, visibleCandidates } from '../src/features/local-candidate-queue.js';

const state={catalogState:{syncMetadata:{localCandidates:[]}},toys:[{id:'catalog-side-effect'}]};
let checks=0;
const ok=(v,m)=>{assert.ok(v,m);
checks++};

for(const status of ['pending','reviewing','approved','linked','rejected'])upsertLocalCandidate(state,{candidateId:status,reviewStatus:status,productName:status});
Object.assign(localCandidates(state).find(row=>row.candidateId==='approved'),{resolutionReason:'approved after review',reviewedAt:'2026-09-09T23:00:00.000Z'});
Object.assign(localCandidates(state).find(row=>row.candidateId==='linked'),{linkedCanonicalKey:'existing-catalog-target',reviewedAt:'2026-09-09T23:01:00.000Z'});
Object.assign(localCandidates(state).find(row=>row.candidateId==='rejected'),{resolutionReason:'insufficient evidence',reviewedAt:'2026-09-09T23:02:00.000Z'});

ok(!archiveLocalCandidate(state,'pending'),'pending cannot archive');
ok(!archiveLocalCandidate(state,'reviewing'),'reviewing cannot archive');

for(const status of ['approved','linked','rejected'])ok(archiveLocalCandidate(state,status,'2026-09-10T00:00:00.000Z'),'resolved status archives');

ok(visibleCandidates(state).length===2,'archived candidates are hidden by default');
ok(visibleCandidates(state,{archived:true}).length===3,'archived filter shows archived candidates');

ok(unarchiveLocalCandidate(state,'approved'),'unarchive restores history visibility');
ok(visibleCandidates(state).some(row=>row.candidateId==='approved'),'unarchived candidate is visible');
const approved=localCandidates(state).find(row=>row.candidateId==='approved');
ok(approved.reviewStatus==='approved'&&approved.reviewedAt==='2026-09-09T23:00:00.000Z'&&approved.resolutionReason==='approved after review','unarchive preserves completed resolution metadata');

const linked=localCandidates(state).find(row=>row.candidateId==='linked');
const beforeToys=state.toys.length;
ok(reopenLocalCandidateReview(state,'linked','2026-09-10T01:00:00.000Z'),'resolved candidate reopens');

ok(linked.reviewStatus==='reviewing'&&linked.reviewHistory.length===1,'reopen records prior resolution and enters reviewing');
ok(linked.reviewHistory[0].previousStatus==='linked','history preserves prior status');
ok(state.toys.length===beforeToys,'reopen does not roll back catalog side effects');
ok(pendingCandidateCount(state)===3,'reopen increases Needs Review exactly once');
ok(linked.reviewHistory[0].linkedCanonicalKey==='existing-catalog-target'&&linked.reviewHistory[0].reviewedAt==='2026-09-09T23:01:00.000Z','history preserves link target and resolution time');
setLocalCandidateStatus(state,'linked','rejected');
linked.resolutionReason='second review rejected';
ok(linked.reviewStatus==='rejected'&&pendingCandidateCount(state)===2,'reopened linked candidate can complete a second review');
ok(linked.reviewHistory.length===1&&linked.reviewHistory[0].previousStatus==='linked','second resolution retains the first review history');
ok(reopenLocalCandidateReview(state,'approved','2026-09-10T02:00:00.000Z'),'approved candidate reopens');
setLocalCandidateStatus(state,'approved','rejected');
approved.resolutionReason='approved candidate rechecked and rejected';
ok(approved.reviewStatus==='rejected'&&approved.reviewHistory[0].previousStatus==='approved','approved to reopen to reject preserves first resolution');
const rejected=localCandidates(state).find(row=>row.candidateId==='rejected');
ok(reopenLocalCandidateReview(state,'rejected','2026-09-10T03:00:00.000Z'),'rejected candidate reopens');
setLocalCandidateStatus(state,'rejected','approved');
ok(rejected.reviewStatus==='approved'&&rejected.reviewHistory[0].previousStatus==='rejected','rejected to reopen to approve preserves first resolution');
const reloaded=JSON.parse(JSON.stringify(state));
ok(localCandidates(reloaded).length===5&&localCandidates(reloaded).find(row=>row.candidateId==='linked').reviewHistory.length===1,'archive and review history survive reload serialization');
ok(pendingCandidateCount(state)===2,'all second reviews restore the Needs Review count');

assert.equal(checks,24);
console.log(`candidate archive/reopen v0.11.5: PASS (${checks} assertions)`);
