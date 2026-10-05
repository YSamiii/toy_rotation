import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CATALOG_IMAGE_ASSETS } from '../src/data/catalog-image-assets.js';
import { addCatalogToy } from '../src/domain/library-service.js';
import { emptyState, normalizeCatalogToy } from '../src/data/schema.js';
let checks=0; const equal=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++}; const ok=(value,message)=>{assert.ok(value,message);checks++};
const catalog=JSON.parse(await readFile(new URL('../catalog-base.json',import.meta.url),'utf8')).entries;
const byKey=new Map(catalog.map(item=>[item.key,item]));
const keys=['mideer-animal-toys-set-15pcs','mideer-level1-home-sweet-home-puzzle','mideer-my-first-puzzle-dinosaurs-6in1'];
for(const key of keys) equal(catalog.filter(item=>item.key===key).length,1,`${key} has exactly one canonical entry`);
const animal=byKey.get(keys[0]); equal(animal.sku,'MD1382','Animal Toys Set keeps exact MD1382 identity'); equal(animal.pieceCount,15,'Animal Toys Set keeps 15-piece identity'); equal(animal.hidden,undefined,'Animal Toys Set is visible by default');
const home=byKey.get(keys[1]); equal(home.sku,'MD1673','Home Sweet Home keeps exact MD1673 identity'); equal(home.pieceCount,8,'Home Sweet Home keeps the eight-puzzle identity'); equal(home.hidden,undefined,'Home Sweet Home is visible by default');
for(const key of keys){const asset=CATALOG_IMAGE_ASSETS[key]; equal(asset.kind,'packaged',`${key} uses a verified packaged image`); ok(asset.contentHash?.startsWith('sha256:'),`${key} records a content hash`);}
const state=emptyState(); const store={get state(){return state;},update(mutator){mutator(state);}}; const added=addCatalogToy(store,normalizeCatalogToy(animal),CATALOG_IMAGE_ASSETS[animal.key]); equal(added.added,true,'restored Animal Toys Set can be added to Library'); equal(state.toys[0].canonicalKey,animal.key,'Add Library retains its original canonical key');
const homeAdded=addCatalogToy(store,normalizeCatalogToy(home),CATALOG_IMAGE_ASSETS[home.key]); equal(homeAdded.added,true,'restored Home Sweet Home can be added to Library'); equal(state.toys.some(toy=>toy.canonicalKey===home.key),true,'Home Sweet Home Add Library retains its original canonical key');
console.log(`catalog image usability priority v0.11.6: PASS (${checks} assertions)`);
