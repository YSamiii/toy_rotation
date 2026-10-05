import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

let checks=0; const ok=(value,message)=>{assert.ok(value,message);checks++};
const [main, css] = await Promise.all([
  readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/ui/app.css', import.meta.url), 'utf8')
]);
const catalog = main.slice(main.indexOf('function catalogFilterDefaults()'), main.indexOf('function renderCatalogCard'));
ok(catalog.includes('function openCatalogFilterSheet'), 'Catalog filters use a dedicated child sheet');
ok(catalog.includes('const draft = cloneCatalogFilters(filters)'), 'child sheet begins with independent draft state');
ok(catalog.includes('form.querySelector(\'[data-cancel]\').onclick = () => returnToCatalog();'), 'cancel returns without applying draft filters');
ok(catalog.includes('form.onsubmit') && catalog.includes('returnToCatalog(draft)'), 'Apply is the only draft commit path');
ok(catalog.includes("data-clear") && catalog.includes("Object.assign(draft, catalogFilterDefaults(), { query:filters.query })"), 'Clear All resets draft filters while preserving catalog search');
ok(!catalog.includes('catalog-filters hidden'), 'filter controls are no longer embedded in the parent sheet');
ok(catalog.includes("id=\"catalog-filter-chips\"") && catalog.includes('data-catalog-chip'), 'parent sheet retains removable active-filter chips');
ok(css.includes('.catalog-filter-options { display:grid; gap:4px; }'), 'filter options are vertically stacked');
ok(css.includes('min-height:44px') && css.includes('inline-size:22px'), 'checkbox rows and controls meet touch target sizing');
ok(css.includes('word-break:normal') && css.includes('overflow-wrap:normal'), 'filter labels avoid character-by-character wrapping');
ok(css.includes('.catalog-filter-sheet .filter-actions { position:sticky'), 'Apply action stays reachable in a long sheet');
console.log(`catalog filter mobile real-device fix v0.11.6: PASS (${checks} assertions)`);
