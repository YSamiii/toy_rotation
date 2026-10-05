import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../src/ui/app.css', import.meta.url), 'utf8');
const recoveryHtml = await readFile(new URL('../storage-recovery-diagnostic.html', import.meta.url), 'utf8');
const recoveryScript = await readFile(new URL('../storage-recovery-diagnostic.js', import.meta.url), 'utf8');
const startupTrace = await readFile(new URL('../src/features/startup-trace.js', import.meta.url), 'utf8');

let assertions = 0;
const check = (condition, message) => {
  assert.ok(condition, message);
  assertions += 1;
};

for (const forbidden of [
  'candidate-layout-diagnostic',
  'data-candidate-layout',
  'Export Layout Diagnostic',
  'Copy Layout Diagnostic JSON',
  'CLICK RECEIVED',
  'PAYLOAD BUILT',
  'EXPORT TRIGGERED',
  'captureCandidateLayoutDiagnostic',
  'candidateLayoutDiagnosticFileName',
]) {
  check(!main.includes(forbidden), `temporary Candidate Layout Diagnostic reference removed: ${forbidden}`);
}

await assert.rejects(
  access(new URL('../src/features/candidate-layout-diagnostic.js', import.meta.url)),
  { code: 'ENOENT' },
  'temporary Candidate Layout Diagnostic module is deleted',
);
assertions += 1;

check(
  ['id="admin-open"', 'restore-diagnostic-export', 'storage-audit-export', 'recognition-trace-export', 'persistence-diagnostic-export']
    .every((marker) => main.includes(marker)),
  'long-term Admin, recovery, storage, recognition, and persistence diagnostics remain available',
);
check(recoveryHtml.includes('export-diagnostic'), 'standalone Storage Recovery diagnostic export remains available');
check(recoveryScript.includes("querySelector('#export-diagnostic')"), 'standalone Storage Recovery diagnostic remains wired');
check(startupTrace.includes('startup'), 'startup diagnostic remains available');
check(
  ['candidate-review-image-preview', 'max-width:min(100%, 220px)', 'max-height:180px', 'candidate-review-image-placeholder']
    .every((marker) => css.includes(marker)),
  'Candidate Detail image preview and placeholder styling remain intact',
);

assert.equal(assertions, 15, 'stable cleanup assertion count');
console.log(`Stable QA cleanup: PASS (${assertions})`);
