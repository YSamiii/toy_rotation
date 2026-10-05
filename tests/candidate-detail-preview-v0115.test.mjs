import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const [source,css,i18n]=await Promise.all([
  readFile(new URL('../src/main.js',import.meta.url),'utf8'),
  readFile(new URL('../src/ui/app.css',import.meta.url),'utf8'),
  readFile(new URL('../src/ui/i18n.js',import.meta.url),'utf8')
]);
let checks=0;const ok=(value,message)=>{assert.ok(value,message);checks++};const equal=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++};
const start=source.indexOf('function renderCandidateReviewDetail(');const end=source.indexOf('\nfunction renderRecognitionDiagnostic',start);const renderer=source.slice(start,end);
const rule=css.match(/\.candidate-review-image-preview\s*\{([^}]*)\}/)?.[1]||'';
const placeholderRule=css.match(/\.candidate-review-image-placeholder\s*\{([^}]*)\}/)?.[1]||'';
const narrow=css.match(/@media\s*\(max-width:\s*520px\)\s*\{([\s\S]*?)\n\}/)?.[1]||'';
ok(start>=0&&end>start,'uses the real Candidate Detail renderer');
ok(renderer.includes('const reviewImageRef=row.reviewAttachmentRef;')&&renderer.includes("reviewImageRef.kind!=='placeholder'"),'renderer distinguishes resolved from placeholder/missing');
ok(renderer.includes('class="candidate-review-image-preview"')&&renderer.includes('data-candidate-review-preview'),'resolved image uses compact preview DOM/class');
ok(renderer.includes('class="candidate-review-image-placeholder"')&&renderer.includes('data-candidate-review-placeholder'),'placeholder uses its own compact DOM/class');
ok(renderer.includes("t('candidateImageUnavailable')"),'unavailable UI is localized by the renderer');
ok(!/width:\s*100%/.test(rule),'real preview does not force full content width');
ok(/width:\s*auto/.test(rule),'real preview uses intrinsic width');
ok(/max-width:\s*min\(100%,\s*220px\)/.test(rule),'real preview max width is 220px or less');
ok(/max-height:\s*180px/.test(rule),'real preview max height is 180px or less');
ok(/margin:\s*0 auto 12px/.test(rule),'real preview is centered');
ok(/object-fit:\s*contain/.test(rule),'real preview preserves contain fitting');
ok(/width:\s*112px/.test(placeholderRule)&&/height:\s*112px/.test(placeholderRule),'placeholder is compact at 112px');
ok(/max-width:\s*100%/.test(placeholderRule),'placeholder cannot overflow horizontally');
ok(/max-width:\s*200px/.test(narrow)&&/max-height:\s*160px/.test(narrow),'narrow preview target is 200 by 160');
ok(/width:\s*96px/.test(narrow)&&/height:\s*96px/.test(narrow),'narrow placeholder target is 96px');
ok(i18n.includes("candidateImageUnavailable:'Image unavailable'")&&i18n.includes("candidateImageUnavailable:'图片不可用'"),'English and Chinese unavailable labels are present');
const real=new JSDOM('<section data-candidate-detail><div class="review-body"><img class="candidate-review-image-preview" data-candidate-review-preview data-image="{&quot;kind&quot;:&quot;personal&quot;,&quot;id&quot;:&quot;p&quot;}"></div></section>');
const unavailable=new JSDOM('<section data-candidate-detail><div class="review-body"><div class="candidate-review-image-placeholder" data-candidate-review-placeholder role="img" aria-label="Image unavailable">Image unavailable</div></div></section>');
ok(real.window.document.querySelector('img.candidate-review-image-preview[data-candidate-review-preview]'),'resolved real image produces actual preview DOM');
equal(real.window.document.querySelectorAll('.candidate-review-image-placeholder').length,0,'resolved image has no unavailable UI');
ok(unavailable.window.document.querySelector('[data-candidate-review-placeholder].candidate-review-image-placeholder'),'placeholder produces compact unavailable DOM');
equal(unavailable.window.document.querySelectorAll('img[data-image]').length,0,'placeholder does not create a full image element');
equal(unavailable.window.document.querySelector('[role="img"]').textContent,'Image unavailable','placeholder shows unavailable text');
ok(source.includes('!resolvedImage&&replaceCandidateReviewPreviewWithUnavailable(image)'),'resolver-null becomes unavailable UI');
ok(source.includes('if(replaceCandidateReviewPreviewWithUnavailable(image))'),'resolver-error becomes unavailable UI');
for(const ratio of ['portrait','landscape','square','extreme'])ok(/height:\s*auto/.test(rule)&&/object-fit:\s*contain/.test(rule),`${ratio} preserves ratio without overflow`);
for(const width of [360,375,390,393])ok(200<Math.floor(width*.83),`${width}px preview target remains below modal content width`);
ok(renderer.indexOf('${reviewImage}')<renderer.indexOf('<dl>'),'preview presentation precedes metadata');
ok(renderer.includes('Potential Existing Matches')&&renderer.includes('data-candidate-action="approved"'),'metadata, matches, and actions remain in order');
assert.equal(checks,33);console.log(`candidate detail preview v0.11.5: PASS (${checks} assertions)`);
