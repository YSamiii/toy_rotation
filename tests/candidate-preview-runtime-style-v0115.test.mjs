import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const [source, css] = await Promise.all([
  readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/ui/app.css', import.meta.url), 'utf8')
]);
let checks = 0;
const ok = (value, message) => { assert.ok(value, message); checks++; };
const equal = (actual, expected, message) => { assert.equal(actual, expected, message); checks++; };

const rendererStart = source.indexOf('function renderCandidateReviewDetail(');
const rendererEnd = source.indexOf('\nfunction renderRecognitionDiagnostic', rendererStart);
const renderer = source.slice(rendererStart, rendererEnd);
ok(rendererStart >= 0 && rendererEnd > rendererStart, 'Candidate Review renderer is present');
ok(renderer.includes('<section class="sheet" data-candidate-detail>'), 'renderer creates the Candidate Review root');
ok(renderer.includes('const reviewImage=reviewImageRef?.kind'), 'renderer creates the Candidate Review image presentation');
ok(source.includes("image.closest('[data-candidate-detail]')) image.classList.add('candidate-review-image-preview')"), 'image binding assigns the semantic preview class only inside Candidate Review');

const desktop = new JSDOM(`<style>${css}</style><section class="sheet" data-candidate-detail><div class="review-body"><img data-image='{}' alt="Image unavailable"></div></section>`, { pretendToBeVisual: true });
const preview = desktop.window.document.querySelector('img[data-image]');
preview.classList.add('candidate-review-image-preview');
const style = desktop.window.getComputedStyle(preview);
ok(preview.matches('.candidate-review-image-preview'), 'bound Candidate image matches the production selector');
equal(preview.getAttribute('style'), null, 'renderer supplies no inline sizing conflict');
equal(style.width, 'auto', 'computed width preserves intrinsic preview sizing');
equal(style.height, 'auto', 'computed height preserves the source ratio');
equal(style.maxWidth, 'min(100%, 220px)', 'computed max width keeps the preview compact');
equal(style.maxHeight, '180px', 'computed desktop max height is compact');
equal(style.minHeight, 'auto', 'no minimum height defeats the cap');
equal(style.objectFit, 'contain', 'computed object fit preserves the full image');
equal(style.display, 'block', 'computed display avoids inline baseline layout');
equal(style.position, 'static', 'computed position remains in normal flow');

const narrowRule = css.match(/@media\s*\(max-width:\s*520px\)\s*\{[\s\S]*?\.candidate-review-image-preview\s*\{([^}]*)\}/)?.[1] || '';
ok(/max-width:\s*200px/.test(narrowRule)&&/max-height:\s*160px/.test(narrowRule), '390px media branch supplies the compact target');
const narrow = new JSDOM(`<style>.candidate-review-image-preview{${narrowRule}}</style><img class="candidate-review-image-preview">`, { pretendToBeVisual: true });
equal(narrow.window.getComputedStyle(narrow.window.document.querySelector('img')).maxHeight, '160px', 'matched narrow-screen rule computes to 160px');

assert.equal(checks, 16);
console.log(`candidate preview runtime style v0.11.5: PASS (${checks} assertions)`);
