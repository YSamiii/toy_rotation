import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../src/main.js',import.meta.url),'utf8');
let n=0,ok=(v,m)=>{assert.ok(v,m);n++};
for(const value of ['adminNeedsReviewCount','Candidate Review','Reported Issues','workspace-local-candidates','workspace-reports','renderLocalCandidateQueue','renderReportedIssuesQueue','renderCandidateReviewDetail','renderReportReviewDetail','data-workspace-back','data-report-detail-back','data-candidate-back','ModalManager','button.disabled'])ok(source.includes(value),value);
for(let i=0;i<20;i++)ok(source.includes('renderAdminWorkspaceBody(dialog,{onBack,onClose})'),`workspace return ${i}`);
ok(!source.includes('data-local-action="reviewing"'),'no stale summary action');
assert.equal(n,35);
console.log(`admin review workspace: PASS (${n} assertions)`);
