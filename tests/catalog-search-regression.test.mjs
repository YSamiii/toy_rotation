import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CatalogRepository } from '../src/domain/catalog-repository.js';
import { emptyState } from '../src/data/schema.js';
const data=JSON.parse(await readFile(new URL('../catalog-base.json',import.meta.url)));const state=emptyState();const store={get state(){return state;},update(mutator){mutator(state);}};const catalog=new CatalogRepository(store);catalog.applyBase(data.entries);
const checks=[['Musical Rhymes Book','vtech-musical-rhymes-book'],['音乐童谣书','vtech-musical-rhymes-book'],['Chomp and Count Dino','vtech-chomp-count-dino'],['VTech 翻斗车','vtech-drop-go-dump-truck'],['探索书','vtech-peek-turn-discovery-book'],['翻盖玩具手机','vtech-press-squish-flip-phone']];
for(const [query,key] of checks){const matches=catalog.search({query});assert.ok(matches.some(item=>item.canonicalKey===key));assert.ok(matches.every(item=>item.reviewStatus==='approved'));}
assert.ok(catalog.search({brand:'VTech'}).length>=39);assert.ok(catalog.search({categoryCode:'books_cards',brand:'VTech'}).some(item=>item.canonicalKey==='vtech-musical-rhymes-book'));assert.ok(catalog.search({playMechanic:'pretend_role',brand:'VTech'}).some(item=>item.canonicalKey==='vtech-click-count-remote'));
console.log('catalog search regression: PASS (15 assertions)');
