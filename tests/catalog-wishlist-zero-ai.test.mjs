import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeCatalogToy, normalizeWishlistItem, emptyState } from '../src/data/schema.js';
import { findWishlistItem } from '../src/domain/identity-service.js';
const main=await readFile(new URL('../src/main.js',import.meta.url),'utf8');const start=main.indexOf('function addWishlist(key)');const end=main.indexOf('function openCatalogManager',start);const action=start>=0&&end>start?main.slice(start,end):'';assert.match(action,/catalog\.getByKey/);assert.doesNotMatch(action,/recognition|fetch\(|governance\./i);
const source=normalizeCatalogToy({key:'vtech-click-count-remote',brand:'VTech',name:'Click & Count Remote',nameEn:'Click & Count Remote',nameZh:'按键数数遥控器',aliases:['VTech 学习遥控器'],ageMinMonths:6,ageMaxMonths:36,category:'角色扮演',skills:['数学启蒙'],playMechanics:['pretend_role']});const state=emptyState();let aiCalls=0;globalThis.fetch=async()=>{aiCalls++;throw new Error('AI/network must not run');};
assert.equal(findWishlistItem(source,state.wishlist),null);state.wishlist.push(normalizeWishlistItem({id:'wish-1',canonicalKey:source.canonicalKey,catalogId:source.id,catalogSnapshot:source,status:'want'}));assert.equal(state.wishlist.length,1);assert.equal(state.wishlist[0].catalogSnapshot.productName,'Click & Count Remote');assert.equal(findWishlistItem(source,state.wishlist).id,'wish-1');assert.equal(aiCalls,0);assert.equal(state.toys.length,0);
console.log('catalog wishlist zero AI: PASS (8 assertions)');
