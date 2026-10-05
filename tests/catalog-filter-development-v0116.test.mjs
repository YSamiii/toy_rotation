import assert from 'node:assert/strict';
import { filterCatalogDevelopment } from '../src/domain/development-presentation.js';

let checks=0; const equal=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++}; const ok=(value,message)=>{assert.ok(value,message);checks++};
const rows=[
  {id:'a',brand:'A',productName:'Shape box',categoryCode:'cognitive',skillCodes:['sorting'],playMechanics:['shape_sorting'],challengeLevel:2,minAgeMonths:12,maxAgeMonths:24},
  {id:'b',brand:'B',productName:'Puzzle',categoryCode:'puzzles_matching',skillCodes:['logic'],playMechanics:['puzzle'],challengeLevel:4,progressionLevel:4,minAgeMonths:24,maxAgeMonths:48},
  {id:'c',brand:'C',productName:'Blocks',categoryCode:'blocks_construction',skillCodes:['fine_motor'],playMechanics:['blocks_build'],challengeLevel:3,minAgeMonths:12,maxAgeMonths:48}
];
equal(filterCatalogDevelopment(rows,{brands:['A','B'],skills:['sorting','logic']}).length,2,'multi-select is OR within brand and skill groups');
equal(filterCatalogDevelopment(rows,{brands:['A'],challenges:['2'],age:'current'},{childAgeMonths:18}).map(item=>item.id).join(','),'a','filter groups combine with AND');
equal(filterCatalogDevelopment(rows,{mechanics:['blocks_build'],fitCurrent:true},{profile:{blocks_build:{currentLevel:3}}}).map(item=>item.id).join(','),'c','Fit Current Child uses development fit');
equal(filterCatalogDevelopment(rows,{query:'puzzle'}).map(item=>item.id).join(','),'b','search remains additive with development filters');
equal(filterCatalogDevelopment(rows,{age:'later'},{childAgeMonths:18}).map(item=>item.id).join(','),'b','later age filter uses catalog age data');
equal(filterCatalogDevelopment(rows,{fitCurrent:true},{profile:{shape_sorting:{currentLevel:5},puzzle:{currentLevel:4},blocks_build:{currentLevel:5}}}).map(item=>item.id).join(','),'b','Fit Current Child excludes clearly too-easy and too-hard choices');
const main=await import('node:fs/promises').then(fs=>fs.readFile(new URL('../src/main.js',import.meta.url),'utf8'));
ok(main.includes('id="catalog-filter-toggle"'),'Catalog exposes an explicit Filter entry');
ok(main.includes("checkboxes('brands'") && main.includes("checkboxes('categories'") && main.includes("checkboxes('skills'") && main.includes("checkboxes('mechanics'") && main.includes("checkboxes('challenges'"),'all multi-select filter groups are present');
ok(main.includes('catalog-filter-chips') && main.includes('data-catalog-chip'),'active chips can remove one filter');
ok(main.includes("id=\"catalog-clear\"") && main.includes('Object.assign(filters'),'Clear All resets filter state');
ok(main.includes("t('noCatalogResults')"),'no-results state is explicit');
ok(main.includes('wireCatalog(dialog)') && main.includes('data-add') && main.includes('data-wish'),'filtered cards retain ownership-safe Add Library and Add Wishlist wiring');
ok(!main.slice(main.indexOf('function openCatalog()'),main.indexOf('function renderCatalogCard')).includes('getRecognition'),'Catalog filtering remains zero AI');
console.log(`catalog filter development v0.11.6: PASS (${checks} assertions)`);
