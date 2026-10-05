import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { addCatalogToy } from '../src/domain/library-service.js';
import { emptyState, normalizeCatalogToy } from '../src/data/schema.js';
const main=await readFile(new URL('../src/main.js',import.meta.url),'utf8');const source=normalizeCatalogToy({key:'vtech-drop-go-dump-truck',brand:'VTech',name:'Drop & Go Dump Truck',nameEn:'Drop & Go Dump Truck',nameZh:'投放趣味翻斗车',aliases:['VTech 翻斗车'],ageMinMonths:6,ageMaxMonths:36,category:'车辆/轨道',skills:['数学启蒙'],playMechanics:['matching_sorting']});
const state=emptyState();const store={get state(){return state;},update(mutator){mutator(state);}};let aiCalls=0;globalThis.fetch=async()=>{aiCalls++;throw new Error('AI/network must not run');};
assert.match(main,/async function addFromCatalog\(key\)/);assert.doesNotMatch(main.match(/async function addFromCatalog\(key\)[\s\S]*?\n}\nfunction addWishlist/)?.[0]||'',/recognition|fetch\(/i);const added=addCatalogToy(store,source,source.imageRef);assert.equal(added.added,true);assert.equal(state.toys.length,1);assert.equal(state.toys[0].canonicalKey,'vtech-drop-go-dump-truck');assert.equal(aiCalls,0);assert.equal(addCatalogToy(store,source,source.imageRef).added,false);assert.equal(state.toys.length,1);
console.log('catalog library zero AI: PASS (8 assertions)');
