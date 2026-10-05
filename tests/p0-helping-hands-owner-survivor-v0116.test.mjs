import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import { emptyState, normalizeWishlistItem } from '../src/data/schema.js';
import { CatalogRepository } from '../src/domain/catalog-repository.js';
import { addCatalogToy } from '../src/domain/library-service.js';
import { findOwnedToy, findWishlistItem } from '../src/domain/identity-service.js';
import { P0_OWNER_REF_REDIRECTS } from '../src/data/catalog-p0-owner-ref-redirects.js';

globalThis.crypto ??= webcrypto;
const rows=async file=>JSON.parse(await readFile(new URL(`../${file}`,import.meta.url),'utf8')).entries;
const base=await rows('catalog-base.json'),remote=await rows('catalog-remote.json');
const raw=[...base,...remote],survivorKey='lr-helping-hands';
const legacyKey='learningresources-helping-hands-fine-motor-tool-set';
assert.equal(P0_OWNER_REF_REDIRECTS.get(legacyKey),survivorKey);
assert.equal(P0_OWNER_REF_REDIRECTS.get(survivorKey),undefined,'no self redirect');
assert.equal(raw.filter(row=>row.key===survivorKey).length,1);
assert.equal(raw.filter(row=>row.key===legacyKey).length,0);
const source=raw.find(row=>row.key===survivorKey);
assert.equal(source.sku,'LER5558');
assert.equal(source.pieceCount,4);
assert.equal(source.ageMinMonths,36,'exact official product page specifies ages 3+');
assert.equal(source.ageMaxMonths,60,'unsupported legacy upper bound does not overwrite survivor');
assert.equal(source.sourceUrl,source.identitySource);
assert.ok(source.aliases.includes('Helping Hands 精细动作工具套装'));
assert.ok(source.legacyCanonicalKeys.includes(legacyKey));
assert.ok(source.skills.includes('抓握能力')&&source.skills.includes('分类能力'));

const state=emptyState(),store={state,update(fn){fn(state);}};
const catalog=new CatalogRepository(store);
catalog.applyBase(base);catalog.applyRemote(remote);
assert.equal(catalog.getPublicVisibleCatalogCount(),854,'current baseline plus two Batch 1 owner-relevant canonical products');
const survivor=catalog.resolve({canonicalKey:survivorKey});
assert.equal(catalog.resolve({canonicalKey:legacyKey}),survivor);
assert.equal(survivor.canonicalKey,survivorKey);
assert.equal(survivor.sku,'LER5558');
assert.equal(catalog.active.filter(toy=>toy.canonicalKey===survivorKey).length,1);
assert.equal(catalog.active.filter(toy=>toy.canonicalKey===legacyKey).length,0);
for(const name of ['Helping Hands Fine Motor Tool Set','Helping Hands 精细动作工具套装'])
  assert.deepEqual(catalog.search({query:name}).filter(toy=>toy.sku==='LER5558').map(toy=>toy.canonicalKey),[survivorKey],`${name}: one survivor result`);
assert.ok(survivor.imageRef?.catalogImageRef,'survivor Catalog image retained');
assert.equal(catalog.resolve({canonicalKey:legacyKey})?.imageRef?.catalogImageRef,survivor.imageRef.catalogImageRef);

const owner=emptyState();
owner.toys=[{
  id:'d0a3c6a5-9e7f-411f-8d9f-0e3225f1841b',canonicalKey:survivorKey,
  legacyCanonicalKeys:[legacyKey],catalogId:survivor.id,brand:survivor.brand,
  productName:survivor.productName,imageRef:{kind:'personal',id:'owner-helping-hands-image'},
  notes:'keep owner notes',currentShelf:true,storageLocation:'owner-bin',
  feedbackHistory:[{type:'just_right',at:'2026-09-24'}]
}];
owner.rotationHistory=[{id:'old-round',toyIds:[owner.toys[0].id],rotationDiagnostics:{selectedCandidateScores:[{canonicalKey:survivorKey,score:3}]}}];
owner.crossAgeApprovals={[survivorKey]:{approved:false}};
owner.wishlist=[{id:'unrelated-wish',canonicalKey:'unrelated-item'}];
owner.catalogState.tombstones['mideer-my-first-puzzle-dinosaurs-6in1']={mergedInto:'mideer-my-first-puzzle-dinosaurs-6in1-md1460'};
owner.catalogState.removedOwnerships={'dino-child':true};
const snapshots=[structuredClone(owner),structuredClone(owner),structuredClone(owner)];
const lastKnownGood=structuredClone(owner);
const before=structuredClone({owner,snapshots,lastKnownGood});
const ownerStore={state:owner,update(){throw Error('Catalog-only rebuild must not write owner state');}};
const ownerCatalog=new CatalogRepository(ownerStore);
ownerCatalog.applyBase(base);ownerCatalog.applyRemote(remote);ownerCatalog.refresh();
assert.deepEqual({owner,snapshots,lastKnownGood},before,'owner main canonical, id, image, notes, history, diagnostics and snapshots unchanged');
assert.equal(owner.toys[0].canonicalKey,survivorKey);
assert.deepEqual(owner.toys[0].legacyCanonicalKeys,[legacyKey],'historical alias remains in owner record');
assert.equal(owner.rotationHistory[0].toyIds[0],owner.toys[0].id);
assert.equal(owner.rotationHistory[0].rotationDiagnostics.selectedCandidateScores[0].canonicalKey,survivorKey);
assert.ok(findOwnedToy(survivor,owner.toys),'Catalog owned badge retains owner toy');
assert.equal(ownerCatalog.resolve({canonicalKey:legacyKey})?.canonicalKey,survivorKey);
const ownerAddStore={state:owner,update(fn){fn(owner);}};
assert.equal(addCatalogToy(ownerAddStore,ownerCatalog.resolve({canonicalKey:legacyKey}),survivor.imageRef).added,false,'legacy import cannot duplicate owned toy');
assert.equal(owner.toys.length,1);

const catalogWish=normalizeWishlistItem({catalogId:survivor.id,catalogSnapshot:survivor,status:'want'});
assert.equal(catalogWish.canonicalKey,survivorKey,'Catalog Wishlist add uses survivor');
const legacyWish=normalizeWishlistItem({id:'old-wish',canonicalKey:legacyKey,catalogSnapshot:{...survivor,canonicalKey:legacyKey},status:'want'});
assert.equal(catalog.resolve(legacyWish)?.canonicalKey,survivorKey,'legacy Wishlist projection resolves without mutating owner record');
assert.equal(findWishlistItem(survivor,[legacyWish])?.id,'old-wish','legacy and survivor Wishlist identity collapses');
assert.equal(findWishlistItem(survivor,[legacyWish,catalogWish])?.id,'old-wish','Catalog add detects existing legacy wish');

const lateState=emptyState(),lateCatalog=new CatalogRepository({state:lateState,update(fn){fn(lateState);}});
lateCatalog.applyBase(base);
lateCatalog.applyRemote([...remote,{key:legacyKey,brand:'Learning Resources',name:'Stale legacy title',sku:'LER5558',ageMinMonths:0}]);
assert.equal(lateCatalog.resolve({canonicalKey:legacyKey})?.canonicalKey,survivorKey);
assert.equal(lateCatalog.resolve({canonicalKey:legacyKey})?.productName,survivor.productName);
assert.equal(lateCatalog.getPublicVisibleCatalogCount(),854,'late legacy source cannot recreate a duplicate');
const lego=catalog.resolve({canonicalKey:'lego-duplo-brick-box'});
assert.equal(catalog.resolve({canonicalKey:'lego-duplo-classic-brick-box'}),lego,'LEGO QA15 redirect unchanged');
assert.equal(catalog.active.filter(toy=>toy.canonicalKey==='lego-duplo-brick-box').length,1);
const dino=catalog.resolve({canonicalKey:'mideer-my-first-puzzle-dinosaurs-6in1-md1460'});
assert.equal(dino.children.length,6);
assert.ok(dino.children.every(child=>catalog.resolve({canonicalKey:child.canonicalKey})?.set?.parentCanonicalKey===dino.canonicalKey));
assert.equal(catalog.resolve({canonicalKey:'mideer-my-first-puzzle-dinosaurs-6in1'}),dino,'MD1460 redirect unchanged');
assert.equal(owner.schemaVersion,12);
console.log('P0 Helping Hands owner-survivor: single card, old key/name, image, Wishlist, ownership, state invariance PASS');
