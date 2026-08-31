import assert from 'node:assert/strict';
import { RecognitionService } from '../src/features/recognition-service.js';
import { addCatalogToy } from '../src/domain/library-service.js';

globalThis.window={ TOY_ROTATION_CONFIG:{ API_BASE:'https://example.invalid' } };
globalThis.crypto ??= (await import('node:crypto')).webcrypto;

function storeWith(drafts) {
  const state={ schemaVersion:12, settings:{}, profile:{}, toys:[], wishlist:[], drafts };
  return { get state(){ return state; }, update(mutator){ mutator(state); } };
}
const imageRef={ kind:'personal', id:'one' };
const draft={ id:'draft-one', status:'ready', canonicalKey:'acme-blocks', brand:'Acme', productName:'Blocks', names:{en:'Blocks',zh:''}, categoryCode:'blocks_construction', skillCodes:['fine_motor'], playMechanics:['building'], imageRef, diagnostics:{clientRequestId:'first-only'} };
const catalog={ resolveRecognition(){ return { kind:'genuinely_new' }; }, ensureSetChildren(){} };
const images={ resolve:async()=>null };

const wishlistStore=storeWith([structuredClone(draft)]);
const wishlistRecognition=new RecognitionService({store:wishlistStore,images,catalog,baseUrl:'https://example.invalid'});
const wishResult=await wishlistRecognition.confirm('draft-one',{destination:'wishlist'});
assert.equal(wishResult.kind,'wishlisted');
assert.equal(wishlistStore.state.toys.length,0);
assert.equal(wishlistStore.state.wishlist.length,1);
assert.equal(wishlistStore.state.wishlist[0].catalogSnapshot.productName,'Blocks');
assert.equal(wishlistStore.state.wishlist[0].recognizedMetadata.diagnostics.clientRequestId,'first-only');

const libraryStore=storeWith([structuredClone(draft)]);
const libraryRecognition=new RecognitionService({store:libraryStore,images,catalog,baseUrl:'https://example.invalid'});
const libraryResult=await libraryRecognition.confirm('draft-one',{destination:'library'});
assert.equal(libraryResult.kind,'created');
assert.equal(libraryStore.state.toys.length,1);
assert.equal(libraryStore.state.wishlist.length,0);

// An exact Standard Catalog match may be wishlisted without implying ownership.
const catalogItem={ canonicalKey:'catalog-blocks', id:'catalog-blocks', brand:'Acme', productName:'Catalog blocks', categoryCode:'blocks_construction', skillCodes:[], playMechanics:[], imageRef };
const catalogWishStore=storeWith([{...structuredClone(draft), canonicalKey:'catalog-blocks'}]);
const catalogRecognition=new RecognitionService({store:catalogWishStore,images,catalog:{resolveRecognition(){return {kind:'catalog_match',catalog:catalogItem};},ensureSetChildren(){}},baseUrl:'https://example.invalid'});
await catalogRecognition.confirm('draft-one',{destination:'wishlist'});
assert.equal(catalogWishStore.state.toys.length,0);
assert.equal(catalogWishStore.state.wishlist[0].catalogId,'catalog-blocks');

// Promotion reuses the existing Wishlist image and metadata without AI work.
let fetchCalls=0; globalThis.fetch=async()=>{fetchCalls++;throw new Error('must not call AI');};
const promoted=addCatalogToy(wishlistStore,wishlistStore.state.wishlist[0].catalogSnapshot,wishlistStore.state.wishlist[0].catalogSnapshot.imageRef);
assert.equal(promoted.added,true);
assert.equal(wishlistStore.state.toys.length,1);
assert.equal(wishlistStore.state.toys[0].imageRef.id,'one');
assert.equal(fetchCalls,0);

console.log('ownership isolation: PASS (4 scenarios)');
