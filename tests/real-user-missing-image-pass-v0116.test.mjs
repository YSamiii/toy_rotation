import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { CATALOG_IMAGE_ASSETS, catalogImageAsset } from '../src/data/catalog-image-assets.js';
import { emptyState } from '../src/data/schema.js';
import { ImageRepository } from '../src/data/image-repository.js';
import { CatalogRepository } from '../src/domain/catalog-repository.js';
import { resolvedLibraryImageRef } from '../src/domain/catalog-presentation.js';

let checks=0;
const equal=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++;};
const ok=(value,message)=>{assert.ok(value,message);checks++;};
const busy=Array.from({length:6},(_,index)=>`mideer-first-artist-busy-cars:puzzle-${index+1}`);
const dinosaurs=Array.from({length:6},(_,index)=>`mideer-my-first-puzzle-dinosaurs-6in1-md1460:puzzle-${index+1}`);
const cherry=['cherrypick-dustless-chalk-crayons','cherrypick-emotions-magnets-soft-foam-20pc','cherrypick-original-magic-playwall'];
const target=[...busy,...dinosaurs,...cherry];
const base=JSON.parse(await readFile(new URL('../catalog-base.json',import.meta.url))).entries;
const remote=JSON.parse(await readFile(new URL('../catalog-remote.json',import.meta.url))).entries;
const state=emptyState();
const store={get state(){return state;},update(mutator){mutator(state);}};
const catalog=new CatalogRepository(store);
catalog.applyBase([...base,...remote]);
const images=new ImageRepository();

equal(target.length,15,'the real-user missing-image target stays fixed at 15 exact canonicals');
for(const key of target){
  const asset=catalogImageAsset(key);
  ok(asset,'every target canonical has an explicit catalog asset');
  equal(asset.kind,'packaged',`${key} uses a packaged same-origin asset`);
  equal(asset.verificationStatus,'verified_real',`${key} is verified rather than candidate-only`);
  ok(asset.path.startsWith('catalog-assets/'),`${key} remains inside the safe packaged resolver root`);
  ok(!/^(?:data:|blob:|file:)|;base64,/i.test(asset.catalogImageRef),`${key} has no raw/blob/file/base64 ref`);
  equal(await images.resolve(asset),`./${asset.path}`,`${key} resolves through the packaged resolver`);
  const bytes=await readFile(new URL(`../${asset.path}`,import.meta.url));
  equal(`sha256:${createHash('sha256').update(bytes).digest('hex')}`,asset.contentHash,`${key} packaged bytes match its provenance hash`);
  const resolved=catalog.getByKey(key);
  ok(resolved&&resolved.imageRef?.kind==='packaged',`${key} is attached to the active catalog identity`);
  ok(resolved.imageRef.kind!=='generated',`${key} does not resolve to a placeholder`);
}
equal(new Set(busy.map(key=>catalogImageAsset(key).contentHash)).size,6,'Busy Cars children have six distinct image hashes');
equal(new Set(dinosaurs.map(key=>catalogImageAsset(key).contentHash)).size,6,'MD1460 dinosaurs have six distinct image hashes');
for(const key of [...busy,...dinosaurs]){
  const asset=catalogImageAsset(key);
  equal(asset.imageOwnerCanonicalKey,key,`${key} has a child-specific catalog image owner`);
  ok(asset.sourceImageUrl.startsWith('https://'),`${key} records a public HTTPS original source`);
  equal(asset.sourceImageMime,'image/jpeg',`${key} records original JPEG MIME`);
  ok(/^[0-9]+,[0-9]+,[0-9]+,[0-9]+$/.test(asset.cropRect),`${key} records deterministic crop coordinates`);
}
const chalk=catalogImageAsset('cherrypick-dustless-chalk-crayons');
const playwall=catalogImageAsset('cherrypick-original-magic-playwall');
ok(chalk.imageSource.includes('variant=44190785765564'),'Dustless Chalk remains tied to the verified exact variant');
ok(playwall.imageSource.includes('variant=44481003192508'),'Original Magic Playwall remains tied to the verified Original Arch variant');
equal(catalogImageAsset('cherrypick-emotions-magnets-soft-foam-20pc').kind,'packaged','Emotions Magnets stays the exact packaged 20pc asset');
for(const key of [...busy,...dinosaurs]){
  const row=catalog.getByKey(key);
  const inherited=resolvedLibraryImageRef({...row,id:`owned:${key}`,imageRef:{kind:'placeholder'}},catalog);
  equal(inherited.contentHash,row.imageRef.contentHash,`${key} inherits the catalog image for owned presentation`);
  const personal=resolvedLibraryImageRef({...row,id:`owned:${key}`,imageRef:{kind:'personal',id:`personal:${key}`}},catalog);
  equal(personal.id,`personal:${key}`,`${key} preserves personal image precedence`);
}
const before=catalog.getByKey(busy[0]).imageRef.contentHash;
store.state.toys=[{id:'owned:busy-1',canonicalKey:busy[0]}];
store.state.toys=[];
equal(catalog.getByKey(busy[0]).imageRef.contentHash,before,'owned deletion cannot remove a catalog-owned child asset');
store.state.wishlist=[{id:'wish:busy-1',canonicalKey:busy[0]}];
store.state.wishlist=[];
equal(catalog.getByKey(busy[0]).imageRef.contentHash,before,'wishlist deletion cannot remove a catalog-owned child asset');
const delivery=catalog.getByKey('mideer-first-artist-busy-cars:puzzle-5');
equal(delivery.productName,'Delivery Truck','Busy Cars part 5 uses the standard Delivery Truck name');
ok(delivery.aliases.includes('Dump Truck'),'Busy Cars part 5 retains the historical Dump Truck alias');
equal(catalog.search({query:'Delivery Truck'}).find(item=>item.canonicalKey===delivery.canonicalKey)?.canonicalKey,delivery.canonicalKey,'Delivery Truck search preserves the same canonical child identity');
equal(catalog.search({query:'Dump Truck'}).find(item=>item.canonicalKey===delivery.canonicalKey)?.canonicalKey,delivery.canonicalKey,'Dump Truck alias search preserves the same canonical child identity');
ok(Object.values(CATALOG_IMAGE_ASSETS).every(asset=>!String(asset.catalogImageRef||asset.url||'').startsWith('data:')),'image asset table contains no data URL');
console.log(`real user missing image pass v0.11.6: PASS (${checks} assertions)`);
