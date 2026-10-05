import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import { emptyState, normalizeWishlistItem } from '../src/data/schema.js';
import { CatalogRepository } from '../src/domain/catalog-repository.js';
import { addCatalogToy } from '../src/domain/library-service.js';
import { P0_ZERO_REF_REDIRECTS } from '../src/data/catalog-p0-zero-ref-redirects.js';
import { catalogImageAsset } from '../src/data/catalog-image-assets.js';

globalThis.crypto ??= webcrypto;
const rows=async file=>JSON.parse(await readFile(new URL(`../${file}`,import.meta.url),'utf8')).entries;
const base=await rows('catalog-base.json'),remote=await rows('catalog-remote.json');
const raw=[...base,...remote];
const state=emptyState();
const store={state,update(mutator){mutator(state);}};
const catalog=new CatalogRepository(store);
catalog.applyBase(base); catalog.applyRemote(remote);

assert.equal(P0_ZERO_REF_REDIRECTS.size,16,'QA13 zero-ref scope is exactly 16 groups');
assert.equal(base.length,775,'QA14 zero-ref cleanup plus separate LEGO 10913 source cleanup');
assert.equal(remote.length,109,'QA14 zero-ref cleanup plus separate Helping Hands source cleanup');
assert.equal(catalog.getPublicVisibleCatalogCount(),852,'QA14 static 854 minus separate LEGO and Helping Hands cards');
assert.equal(catalog.active.length,857,'QA14 active 859 minus separate LEGO and Helping Hands cards');
for(const [legacy,survivor] of P0_ZERO_REF_REDIRECTS) {
  assert.equal(raw.filter(row=>row.key===legacy).length,0,`${legacy}: retired source row`);
  const survivorRow=raw.filter(row=>row.key===survivor);
  assert.equal(survivorRow.length,1,`${survivor}: one source row`);
  assert.ok(survivorRow[0].legacyCanonicalKeys?.includes(legacy),`${legacy}: durable source alias`);
  assert.equal(catalog.resolve({canonicalKey:legacy})?.canonicalKey,survivor,`${legacy}: direct lookup`);
  assert.equal(catalog.resolve({canonicalKey:survivor})?.canonicalKey,survivor,`${survivor}: stable survivor`);
  assert.equal(catalog.active.filter(row=>row.canonicalKey===survivor).length,1,`${survivor}: one visible identity`);
  assert.ok(catalogImageAsset(survivor),`${survivor}: Catalog image retained`);
  const oldName=survivorRow[0].aliases?.find(alias=>alias!==survivorRow[0].name && /[A-Za-z]/.test(alias)) || survivorRow[0].name;
  assert.ok(catalog.search({query:oldName}).some(row=>row.canonicalKey===survivor),`${legacy}: old name search`);
  assert.ok(catalog.search({query:survivorRow[0].name}).some(row=>row.canonicalKey===survivor),`${survivor}: current name search`);
  const wish=normalizeWishlistItem({catalogId:catalog.resolve({canonicalKey:legacy}).id,catalogSnapshot:catalog.resolve({canonicalKey:legacy})});
  assert.equal(wish.canonicalKey,survivor,`${legacy}: Wishlist canonical`);
}

const hape=catalog.resolve({canonicalKey:'hape-pound-tap-bench'});
assert.equal(hape.canonicalKey,'hape-pound-tap-bench-xylophone');
assert.equal(hape.sku,'E0305');
assert.equal(catalog.active.filter(row=>row.sku==='E0305'&&row.brand==='Hape').length,1);
const lateStore={state:emptyState(),update(fn){fn(this.state);}};
const lateCatalog=new CatalogRepository(lateStore);
lateCatalog.applyBase(base);
lateCatalog.applyRemote([...remote,{key:'hape-pound-tap-bench',brand:'Hape',name:'Stale legacy title',sku:'E0305',ageMinMonths:0}]);
assert.equal(lateCatalog.resolve({canonicalKey:'hape-pound-tap-bench'})?.productName,hape.productName,'late legacy source cannot overwrite survivor metadata');
assert.equal(lateCatalog.getPublicVisibleCatalogCount(),852,'late legacy source cannot recreate a duplicate card');
const owned=emptyState(); const ownedStore={state:owned,update(fn){fn(owned);}};
const oldSource={...hape,canonicalKey:'hape-pound-tap-bench'};
assert.equal(addCatalogToy(ownedStore,oldSource,oldSource.imageRef).added,true);
assert.equal(addCatalogToy(ownedStore,hape,hape.imageRef).added,false,'old import and survivor do not create two owned records');
assert.equal(owned.toys.length,1);

assert.equal(catalog.resolve({canonicalKey:'learningresources-helping-hands-fine-motor-tool-set'})?.canonicalKey,'lr-helping-hands','separate referenced Helping Hands cleanup preserves QA14 redirects');
const dino='mideer-my-first-puzzle-dinosaurs-6in1-md1460';
const parent=catalog.resolve({canonicalKey:dino});
assert.equal(parent?.canonicalKey,dino);
assert.equal(parent?.children?.length,6);
assert.equal(catalog.resolve({canonicalKey:'mideer-my-first-puzzle-dinosaurs-6in1'})?.canonicalKey,dino,'existing MD1460 redirect unchanged');
const guarded=emptyState(); guarded.toys=[{id:'owner-parent',canonicalKey:dino,set:{kind:'parent'},removedOwnerships:['part-1']}];
guarded.catalogState.tombstones['mideer-my-first-puzzle-dinosaurs-6in1']={deletedAt:'2026-09-01'};
guarded.crossAgeApprovals['lego-duplo-brick-box']={approved:true};
guarded.rotationHistory=[{id:'round-1',toyIds:['owner-parent']}];
guarded.wishlist=[{id:'wish-1',canonicalKey:'lr-helping-hands'}];
const before=structuredClone(guarded);
const guardedStore={state:emptyState(),update(){throw Error('Catalog refresh must not write user state');}};
const guardedCatalog=new CatalogRepository(guardedStore);
guardedCatalog.applyBase(base);
guardedStore.state=guarded;
guardedCatalog.refresh(); // Catalog-only rebuild never invokes set materialization.
assert.deepEqual(guarded,before,'Catalog/source redirect does not mutate owner state');

for(const key of ['lr-snap-n-learn-counting-cows','lr-snap-learn-counting-sheep','lr-numberblocks-mathlink-1-10','lr-numberblocks-1-10-activity'])
  assert.ok(raw.some(row=>row.key===key),`${key}: distinct or needs-evidence item preserved`);
assert.notEqual(catalog.resolve({canonicalKey:'lr-snap-n-learn-counting-cows'})?.canonicalKey,catalog.resolve({canonicalKey:'lr-snap-learn-counting-sheep'})?.canonicalKey);
assert.notEqual(catalog.resolve({canonicalKey:'lr-numberblocks-mathlink-1-10'})?.canonicalKey,catalog.resolve({canonicalKey:'lr-numberblocks-1-10-activity'})?.canonicalKey);
assert.equal(state.schemaVersion,12);
console.log('P0 zero-ref remediation: 16 redirects, 852 static visible after separate LEGO/Helping Hands cleanup, Wishlist/ownership/variant/MD1460/state invariance PASS');
