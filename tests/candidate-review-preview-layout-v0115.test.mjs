import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source,css,theme]=await Promise.all([
  readFile(new URL('../src/main.js',import.meta.url),'utf8'),
  readFile(new URL('../src/ui/app.css',import.meta.url),'utf8'),
  readFile(new URL('../src/ui/theme.css',import.meta.url),'utf8')
]);
let checks=0;const ok=(value,message)=>{assert.ok(value,message);checks++};
ok(source.includes('data-candidate-detail'),'preview binding is scoped to Candidate Review Detail');
ok(source.includes('const reviewImage=reviewImageRef?.kind'),'Candidate Review renderer creates an image presentation branch');
ok(source.includes("image.closest('[data-candidate-detail]')) image.classList.add('candidate-review-image-preview')"),'renderer binding gives the real image its semantic class');
const selector='\\.candidate-review-image-preview';
const rule=css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))?.[1]||'';
for(const [expected,message] of [
  [/width:\s*auto/,'preview preserves its intrinsic width'],
  [/max-width:\s*min\(100%,\s*220px\)/,'preview cannot overflow its compact target'],
  [/height:\s*auto/,'portrait, landscape, square, and extreme images preserve ratio'],
  [/max-height:\s*180px/,'desktop preview height is capped'],
  [/margin:\s*0 auto 12px/,'preview is centered'],
  [/object-fit:\s*contain/,'full attachment stays visible'],
  [/border-radius:\s*14px/,'preview retains the design frame'],
  [/background:\s*var\(--surface-secondary\)/,'preview uses the theme surface token']
]) ok(expected.test(rule),message);
ok(!new RegExp(`${selector}\\s*\\{[^}]*object-fit:\\s*cover`,'i').test(css),'Candidate preview never uses cover');
ok(/@media\s*\(max-width:\s*520px\)[\s\S]*candidate-review-image-preview[\s\S]*max-width:\s*200px[\s\S]*max-height:\s*160px/.test(css),'360/375/390 screens use the compact preview target');
ok(/\.sheet\s*\{[\s\S]*?overflow:\s*auto/.test(css),'modal sheet scroll remains contained');
ok(css.includes('env(safe-area-inset-bottom)'),'safe-area sizing remains present');
ok(source.includes('Potential Existing Matches')&&source.includes('data-candidate-action="approved"'),'metadata and footer remain below preview');
ok(theme.includes('--surface-secondary'),'light and dark theme token exists');
assert.equal(checks,17);
console.log(`candidate review preview layout v0.11.5: STATIC PASS (${checks} assertions; runtime contract is covered separately)`);
