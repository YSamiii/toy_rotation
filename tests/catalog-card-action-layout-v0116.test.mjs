import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DICTIONARY } from '../src/ui/i18n.js';

let checks=0; const ok=(value,message)=>{assert.ok(value,message);checks++};
const [main, css] = await Promise.all([
  readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/ui/app.css', import.meta.url), 'utf8')
]);
const card = main.slice(main.indexOf('function renderCatalogCard'), main.indexOf('function catalogFilterLabel'));
const report = main.slice(main.indexOf('function openCatalogReport'), main.indexOf('async function addFromCatalog'));
ok(card.includes('class="catalog-card-primary-actions"'), 'Add actions have a dedicated primary-action wrapper');
ok(card.includes('class="catalog-report-link"') && card.includes("t('catalogReportTitle')"), 'Report is a localized secondary link');
ok(card.includes('data-add') && card.includes('data-wish') && card.includes('data-report'), 'ownership and report action wiring remains intact');
ok(css.includes('.catalog-card-primary-actions { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:8px; }'), 'primary actions use equal two-column layout');
ok(css.includes('@media (max-width: 520px)') && css.includes('.catalog-card-primary-actions { grid-template-columns:1fr; }'), 'small screens stack primary actions safely');
ok(css.includes('.catalog-report-link') && css.includes('background:transparent') && css.includes('text-decoration:underline'), 'Report remains visually secondary');
ok(!report.includes('>Report an issue<') && !report.includes('>Type<') && !report.includes('>Optional screenshot<'), 'report form has no hard-coded English labels');
for (const language of ['en','zh']) for (const key of ['catalogReportTitle','catalogReportType','catalogReportDescription','catalogReportAttachment','catalogReportSubmit','catalogReportSubmitted','catalogReportAttachmentTooLarge','catalogReportFailed']) ok(Boolean(DICTIONARY[language][key]), `${language} ${key} exists`);
for (const language of ['en','zh']) for (const key of ['image_wrong','duplicate','name_wrong','brand_wrong','sku_wrong','age_wrong','category_wrong','skills_wrong','mechanism_wrong','parent_child_wrong','retired','other']) ok(Boolean(DICTIONARY[language].catalogReportType[key]), `${language} report type ${key} exists`);
console.log(`catalog card action layout v0.11.6: PASS (${checks} assertions)`);
