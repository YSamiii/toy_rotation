import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeCatalogToy, normalizeWishlistItem } from '../src/data/schema.js';
import { addCatalogToy } from '../src/domain/library-service.js';
import { sameCatalogIdentity } from '../src/domain/identity-service.js';
import { compare, exactProductIdentityKey } from '../src/domain/duplicate-engine.js';
import { challengeLevel, developmentMechanics, progressionLevel } from '../src/domain/development-fit.js';

globalThis.crypto ??= (await import('node:crypto')).webcrypto;
let checks=0; const equal=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++;}; const ok=(value,message)=>{assert.ok(value,message);checks++;};
const base=JSON.parse(await readFile(new URL('../catalog-base.json',import.meta.url),'utf8')).entries;
const expected={
  'lego-duplo-bath-time-fun-floating-animal-train':['10965',14,'Bath Time Fun: Floating Animal Train'],
  'lego-duplo-cargo-train':['10875',105,'Cargo Train'],
  'lego-duplo-animal-train':['10955',15,'Animal Train'],
  'lego-duplo-number-train':['10954',23,'Number Train - Learn To Count']
};
const rows=Object.keys(expected).map(key=>base.find(row=>row.key===key));
equal(rows.length,4,'the four approved DUPLO records are present');
for(const row of rows){const [setNumber,pieceCount,exactTitle]=expected[row.key];const beforeRaw={...row};delete beforeRaw.setNumber;delete beforeRaw.pieceCount;delete beforeRaw.exactTitle;delete beforeRaw.identitySource;const before=normalizeCatalogToy(beforeRaw);const normalized=normalizeCatalogToy(row);equal(normalized.setNumber,setNumber,`${row.key} preserves its exact set number`);equal(normalized.pieceCount,pieceCount,`${row.key} preserves its official piece count`);equal(normalized.exactTitle,exactTitle,`${row.key} preserves its official exact title`);equal(normalized.sku,setNumber,`${row.key} exposes the set number to existing SKU identity protection`);equal(JSON.stringify(developmentMechanics(normalized)),JSON.stringify(developmentMechanics(before)),`${row.key} development mechanics are unchanged`);equal(challengeLevel(normalized),challengeLevel(before),`${row.key} challenge is unchanged`);equal(progressionLevel(normalized),progressionLevel(before),`${row.key} progression is unchanged`);}
const source=normalizeCatalogToy(rows[0]); const state={toys:[]}; const store={get state(){return state;},update(mutator){mutator(state);}}; const added=addCatalogToy(store,source,source.imageRef);
equal(added.added,true,'Add Library accepts the exact catalog record'); equal(state.toys[0].setNumber,'10965','Add Library retains set number'); equal(state.toys[0].pieceCount,14,'Add Library retains piece count');
const wish=normalizeWishlistItem({catalogId:source.id,catalogSnapshot:source}); equal(wish.catalogSnapshot.setNumber,'10965','Add Wishlist retains set number'); equal(wish.catalogSnapshot.exactTitle,'Bath Time Fun: Floating Animal Train','Add Wishlist retains exact title');
const sameTitleDifferentSet=[{brand:'LEGO / DUPLO',productName:'Number Train',setNumber:'10954'},{brand:'LEGO / DUPLO',productName:'Number Train',setNumber:'10847'}];
equal(sameCatalogIdentity(...sameTitleDifferentSet),false,'different set numbers prevent a false ownership match'); equal(compare(...sameTitleDifferentSet).kind,'related_variant','different set numbers are not an actionable duplicate'); equal(exactProductIdentityKey(sameTitleDifferentSet[0]),'legoduplo|sku:10954','exact identity keys prefer exact set number');
ok(sameCatalogIdentity({brand:'LEGO / DUPLO',productName:'Legacy Train'},{brand:'LEGO / DUPLO',productName:'Legacy Train'}),'legacy rows without a set number retain the safe same-title fallback');
equal(/fetch\s*\(/.test(await readFile(new URL('../src/domain/library-service.js',import.meta.url),'utf8')),false,'Library propagation performs no AI or network call');
console.log(`catalog DUPLO identity v0.11.6: PASS (${checks} assertions)`);
