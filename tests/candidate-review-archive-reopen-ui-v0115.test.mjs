import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../src/main.js',import.meta.url),'utf8');
const css=await readFile(new URL('../src/ui/app.css',import.meta.url),'utf8');
let checks=0;
const ok=(value,message)=>{assert.ok(value,message);checks++;};

ok(source.includes("function renderLocalCandidateQueue(dialog, { returnToSettings = false, view = 'needs' } = {})"),'queue supports explicit review views');
ok(source.includes("view==='archived'"),'Archived view queries archived rows');
ok(source.includes("view==='completed' ? ['approved','linked','rejected']"),'Completed view is limited to resolved rows');
ok(source.includes("['pending','reviewing'].includes(row.reviewStatus)"),'Needs Review view is limited to pending and reviewing rows');
ok(source.includes('data-candidate-view="needs"')&&source.includes('data-candidate-view="completed"')&&source.includes('data-candidate-view="archived"'),'three review filters are wired');
ok(source.includes("data-candidate-archive")&&source.includes('archiveLocalCandidate')&&source.includes('unarchiveLocalCandidate'),'resolved detail wires archive and unarchive');
ok(source.includes("if(resolved)dialog.querySelector('footer')"),'archive controls are rendered only for resolved records');
ok(source.includes('data-candidate-reopen')&&source.includes('reopenLocalCandidateReview'),'resolved detail wires Reopen Review');
ok(source.includes("confirm(t('candidateReviewReopenConfirm'))"),'Reopen Review has an explicit confirmation');
ok(source.includes("returnView:'needs'"),'reopened records return to Needs Review');
ok(source.includes('data-candidate-review-history')&&source.includes("candidateReviewHistory"),'prior review history is visible in detail');
ok(css.includes('.candidate-review-filter-actions { display:flex; flex-wrap:wrap;'),'filter actions wrap on narrow screens');

assert.equal(checks,12);
console.log(`candidate archive/reopen UI v0.11.5: PASS (${checks} assertions)`);
