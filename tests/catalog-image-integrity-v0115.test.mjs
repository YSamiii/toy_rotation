import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { CATALOG_IMAGE_ASSETS } from '../src/data/catalog-image-assets.js';
import { emptyState } from '../src/data/schema.js';
import { CatalogRepository } from '../src/domain/catalog-repository.js';
import { createCatalogOwnership } from '../src/domain/library-service.js';
import { resolvedLibraryImageRef } from '../src/domain/catalog-presentation.js';
import { sameCatalogIdentity } from '../src/domain/identity-service.js';

const rows=JSON.parse(await readFile(new URL('../catalog-base.json',import.meta.url))).entries;
const keyOf=row=>String(row.canonicalKey||row.key||'').toLowerCase();
const assetRows=Object.entries(CATALOG_IMAGE_ASSETS);
let checks=0;
const ok=(value,message)=>{assert.ok(value,message);checks++;};

const persistedCatalogFiles=['catalog-base.json','catalog-candidates.json','catalog-remote.json'];
const unsafePersistedImageValue=/^(?:data:image\/|blob:|file:)|;base64,|[a-z]:\\|\\\\/i;
function collectUnsafePersistedImageValues(value, path='root', matches=[]){
  if(typeof value==='string'){
    if(unsafePersistedImageValue.test(value))matches.push(path);
    return matches;
  }
  if(Array.isArray(value)){value.forEach((item,index)=>collectUnsafePersistedImageValues(item,`${path}[${index}]`,matches));return matches;}
  if(value&&typeof value==='object')Object.entries(value).forEach(([key,item])=>collectUnsafePersistedImageValues(item,`${path}.${key}`,matches));
  return matches;
}
for(const file of persistedCatalogFiles){
  const persisted=JSON.parse(await readFile(new URL(`../${file}`,import.meta.url)));
  ok(collectUnsafePersistedImageValues(persisted).length===0,`${file} contains no persisted raw/base64/blob/file/dev image value`);
}
const assetSourceTexts=await Promise.all((await readdir(new URL('../src/data/',import.meta.url))).filter(name=>/^catalog-image-assets.*\.js$/.test(name)).map(name=>readFile(new URL(`../src/data/${name}`,import.meta.url),'utf8')));
ok(assetSourceTexts.every(text=>!unsafePersistedImageValue.test(text)),'catalog image asset sources contain no raw/base64/blob/file/dev image value');

for(const [key,ref] of assetRows){
  ok(key===key.toLowerCase(),'catalog image keys are canonicalized');
  ok(ref.kind==='remote'||ref.kind==='catalog'||ref.kind==='generated'||ref.kind==='packaged','catalog ref uses a supported catalog-owned kind');
  const value=String(ref.catalogImageRef||ref.url||ref.id||'');
  ok(!/^(?:data:|blob:|file:)|[a-z]:\\|\\\\/i.test(value),'catalog refs contain no raw/base64/blob/file/dev path');
  if(value.startsWith('./'))await access(new URL(`../${value.slice(2)}`,import.meta.url));
  if(ref.imageOwnerCanonicalKey)ok(ref.imageOwnerCanonicalKey===key,'explicit image owner matches mapped canonical key');
}
const imageValues=assetRows.map(([,ref])=>String(ref.catalogImageRef||ref.url||''));
const state=emptyState();
const store={get state(){return state},update(mutator){mutator(state)}};
const catalog=new CatalogRepository(store);
catalog.applyBase(rows);
for(const value of new Set(imageValues)){
  const keys=assetRows.filter(([,ref])=>String(ref.catalogImageRef||ref.url||'')===value).map(([key])=>key);
  const mapped=keys.map(key=>catalog.getByKey(key));
  const present=mapped.filter(Boolean);
  ok(present.length<=1||present.every(row=>sameCatalogIdentity(present[0],row)),'shared catalog image refs are retained only for identical current Catalog identities');
}
const animal=catalog.getByKey('mideer-my-first-animal-family-6in1');
const construction=catalog.getByKey('mideer-my-first-construction-6in1');
ok(animal.imageRef.kind==='remote'&&animal.imageRef.verificationStatus==='manually_confirmed','Animals uses a verified exact catalog image');
ok(construction.imageRef.kind==='remote'&&construction.imageRef.verificationStatus==='manually_confirmed','Construction uses a verified exact catalog image');
ok(animal.imageRef.url!==construction.imageRef.url,'Mideer exact SKUs do not share an image ref');
ok(!CATALOG_IMAGE_ASSETS['mideer-my-first-puzzle'],'generic Mideer series image is not used as an exact fallback');
ok(!CATALOG_IMAGE_ASSETS['mideer-my-first-dinosaur-6in1'],'unverified Dinosaur exact SKU has no catalog image');
const animalAdded=createCatalogOwnership(store,animal);
const constructionAdded=createCatalogOwnership(store,construction);
ok(animalAdded.added&&constructionAdded.added,'both exact SKUs can be owned independently');
const animalOwned=store.state.toys.find(toy=>toy.canonicalKey===animal.canonicalKey);
const constructionOwned=store.state.toys.find(toy=>toy.canonicalKey===construction.canonicalKey);
ok(resolvedLibraryImageRef(animalOwned,catalog).url===animal.imageRef.url,'Toy Library inherits Animals catalog ref without copying ownership');
ok(resolvedLibraryImageRef(constructionOwned,catalog).url===construction.imageRef.url,'Toy Library inherits Construction catalog ref without copying ownership');
animalOwned.imageRef={kind:'personal',id:'personal-animal'};
ok(resolvedLibraryImageRef(animalOwned,catalog).id==='personal-animal','personal image overrides catalog presentation');
animalOwned.imageRef={kind:'placeholder'};
ok(resolvedLibraryImageRef(animalOwned,catalog).url===animal.imageRef.url,'removing personal override falls back to catalog image');
store.state.toys=store.state.toys.filter(toy=>toy.canonicalKey!==animal.canonicalKey);
ok(catalog.getByKey(animal.canonicalKey).imageRef.url===animal.imageRef.url&&catalog.getByKey(construction.canonicalKey).imageRef.url===construction.imageRef.url,'Toy Library deletion cannot delete shared Catalog images');
store.state.wishlist=[{id:'wish-animal',canonicalKey:animal.canonicalKey,catalogSnapshot:animal}];
store.state.wishlist=[];
ok(catalog.getByKey(animal.canonicalKey).imageRef.url===animal.imageRef.url,'Wishlist deletion cannot delete shared Catalog images');
const reloaded=JSON.parse(JSON.stringify(store.state));
ok(reloaded.toys.some(toy=>toy.canonicalKey===construction.canonicalKey)&&catalog.getByKey(construction.canonicalKey).imageRef.url===construction.imageRef.url,'Catalog refs and surviving ownership remain valid after reload serialization');
assert.equal(checks,assetRows.length*3+Object.values(CATALOG_IMAGE_ASSETS).filter(ref=>ref.imageOwnerCanonicalKey).length+[...new Set(imageValues)].length+17);
console.log(`catalog image integrity v0.11.5: PASS (${checks} assertions)`);
