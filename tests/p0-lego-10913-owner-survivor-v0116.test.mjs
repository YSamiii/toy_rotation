import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import { emptyState, normalizeWishlistItem } from '../src/data/schema.js';
import { CatalogRepository } from '../src/domain/catalog-repository.js';
import { addCatalogToy } from '../src/domain/library-service.js';
import { catalogOwnershipMatch, findOwnedToy } from '../src/domain/identity-service.js';
import { P0_OWNER_REF_REDIRECTS } from '../src/data/catalog-p0-owner-ref-redirects.js';

globalThis.crypto ??= webcrypto;
const rows=async file=>JSON.parse(await readFile(new URL(`../${file}`,import.meta.url),'utf8')).entries;
const base=await rows('catalog-base.json'),remote=await rows('catalog-remote.json');
const raw=[...base,...remote];
const survivorKey='lego-duplo-brick-box',legacyKey='lego-duplo-classic-brick-box';
assert.deepEqual([...P0_OWNER_REF_REDIRECTS],[[legacyKey,survivorKey],['learningresources-helping-hands-fine-motor-tool-set','lr-helping-hands']],'only the two explicitly scoped owner-referenced groups are redirected');
assert.equal(raw.filter(row=>row.key===survivorKey).length,1);
assert.equal(raw.filter(row=>row.key===legacyKey).length,0);
const source=raw.find(row=>row.key===survivorKey);
assert.equal(source.sku,'10913');
assert.ok(source.legacyCanonicalKeys.includes(legacyKey));
assert.ok(source.aliases.includes('DUPLO Classic Brick Box'));
assert.equal(source.userMetadata.safety.ageSafetyStatus,'VERIFIED_NO_EXTRA_GATE');
const state=emptyState(),store={state,update(fn){fn(state);}};
const catalog=new CatalogRepository(store);
catalog.applyBase(base);catalog.applyRemote(remote);
assert.equal(catalog.getPublicVisibleCatalogCount(),854,'current baseline plus two Batch 1 owner-relevant canonical products');
assert.equal(catalog.active.length,859,'LEGO and Helping Hands each have one source card');
const survivor=catalog.resolve({canonicalKey:survivorKey});
assert.equal(catalog.resolve({canonicalKey:legacyKey}),survivor);
assert.equal(survivor.canonicalKey,survivorKey);
assert.equal(survivor.sku,'10913');
assert.equal(catalog.active.filter(toy=>toy.canonicalKey===survivorKey).length,1);
assert.equal(catalog.active.filter(toy=>toy.canonicalKey===legacyKey).length,0);
for(const name of ['DUPLO Brick Box','DUPLO Classic Brick Box'])
  assert.deepEqual(catalog.search({query:name}).filter(toy=>toy.sku==='10913'&&toy.brand==='LEGO / DUPLO').map(toy=>toy.canonicalKey),[survivorKey],`${name}: one survivor search result`);
assert.equal(survivor.imageRef?.imageOwnerCanonicalKey,survivorKey,'survivor Catalog image retained');
assert.equal(catalog.resolve({canonicalKey:legacyKey})?.imageRef?.catalogImageRef,survivor.imageRef.catalogImageRef,'legacy lookup presents survivor Catalog image');

const owner=emptyState();
owner.toys=[{
  id:'805f394b-1985-4e67-99eb-ffdabc5df888',canonicalKey:survivorKey,
  legacyCanonicalKeys:[survivorKey],catalogId:survivor.id,brand:survivor.brand,
  productName:survivor.productName,imageRef:{kind:'personal',id:'owner-image'},
  notes:'keep this note',currentShelf:true,customPermanent:true,
  feedbackHistory:[{type:'good_challenge',at:'2026-09-24'}]
}];
owner.rotationHistory=[{
  id:'owner-round',toyIds:[owner.toys[0].id],
  rotationDiagnostics:{selectedCandidateScores:[{canonicalKey:survivorKey,score:7}]}
}];
owner.crossAgeApprovals={[survivorKey]:{approved:true}};
owner.wishlist=[{id:'unrelated-wish',canonicalKey:'unrelated-item'}];
owner.catalogState.tombstones['mideer-my-first-puzzle-dinosaurs-6in1']={mergedInto:'mideer-my-first-puzzle-dinosaurs-6in1-md1460'};
owner.catalogState.removedOwnerships={'dino-child':true};
const snapshots=[structuredClone(owner),structuredClone(owner),structuredClone(owner)];
const lastKnownGood=structuredClone(owner);
const before=structuredClone({owner,snapshots,lastKnownGood});
const ownerStore={state:owner,update(){throw Error('Catalog-only identity rebuild must not mutate owner state');}};
const ownerCatalog=new CatalogRepository(ownerStore);
ownerCatalog.applyBase(base);ownerCatalog.applyRemote(remote);ownerCatalog.refresh();
assert.deepEqual({owner,snapshots,lastKnownGood},before,'active, history, diagnostics, image, note and retained snapshots stay byte-for-byte logical equivalents');
assert.equal(owner.toys[0].id,'805f394b-1985-4e67-99eb-ffdabc5df888');
assert.equal(owner.toys[0].canonicalKey,survivorKey);
assert.equal(owner.rotationHistory[0].toyIds[0],owner.toys[0].id);
assert.equal(owner.rotationHistory[0].rotationDiagnostics.selectedCandidateScores[0].canonicalKey,survivorKey);
assert.equal(ownerCatalog.resolve({canonicalKey:legacyKey})?.canonicalKey,survivorKey);
assert.ok(findOwnedToy(survivor,owner.toys),'Catalog ownership badge remains owned');
assert.ok(catalogOwnershipMatch(survivor,owner.toys[0]));
const ownerAddStore={state:owner,update(fn){fn(owner);}};
assert.equal(addCatalogToy(ownerAddStore,ownerCatalog.resolve({canonicalKey:legacyKey}),survivor.imageRef).added,false,'legacy import does not duplicate owner toy');
assert.equal(owner.toys.length,1);
assert.deepEqual(snapshots,before.snapshots,'retained snapshots never rewritten');
assert.deepEqual(lastKnownGood,before.lastKnownGood);
const wish=normalizeWishlistItem({catalogId:survivor.id,catalogSnapshot:survivor,status:'want'});
assert.equal(wish.canonicalKey,survivorKey,'Standard Catalog Wishlist add uses survivor');

const lateState=emptyState(),lateCatalog=new CatalogRepository({state:lateState,update(fn){fn(lateState);}});
lateCatalog.applyBase(base);
lateCatalog.applyRemote([...remote,{key:legacyKey,brand:'LEGO / DUPLO',name:'Stale Classic Brick Box',sku:'10913',ageMinMonths:0}]);
assert.equal(lateCatalog.resolve({canonicalKey:legacyKey})?.canonicalKey,survivorKey);
assert.equal(lateCatalog.resolve({canonicalKey:legacyKey})?.productName,survivor.productName,'late legacy source cannot overwrite survivor');
assert.equal(lateCatalog.getPublicVisibleCatalogCount(),854,'late legacy source cannot recreate a card');
assert.equal(catalog.resolve({canonicalKey:'learningresources-helping-hands-fine-motor-tool-set'})?.canonicalKey,'lr-helping-hands','separate Helping Hands redirect does not disturb LEGO');
const dino=catalog.resolve({canonicalKey:'mideer-my-first-puzzle-dinosaurs-6in1-md1460'});
assert.equal(dino.children.length,6);
assert.equal(catalog.resolve({canonicalKey:'mideer-my-first-puzzle-dinosaurs-6in1'}),dino,'MD1460 redirect remains frozen');
assert.equal(owner.schemaVersion,12);
console.log('P0 LEGO 10913 owner-survivor: single card, redirect, image/ownership/Wishlist, owner-state invariance PASS');
