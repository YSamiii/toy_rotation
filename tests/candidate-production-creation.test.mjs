import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { RecognitionService } from '../src/features/recognition-service.js';
import { SharedCatalogGovernance } from '../src/features/shared-catalog-governance.js';
import { pendingCandidateCount } from '../src/features/local-candidate-queue.js';

globalThis.crypto ??= webcrypto;
globalThis.window={TOY_ROTATION_CONFIG:{API_BASE:''}};
function storeWith(drafts=[]){const state={schemaVersion:12,settings:{},profile:{},toys:[],wishlist:[],drafts,catalogState:{syncMetadata:{}}};return {get state(){return state;},update(mutator){mutator(state);}};}
const images={resolve:async()=>null};
const catalog={resolveRecognition(draft){return draft.existing?{kind:'catalog_match',catalog:draft.existing}:{kind:'genuinely_new'};},ensureSetChildren(){}};
const draft={id:'new-toy',status:'ready_catalog_unmatched',canonicalKey:'acme-new-toy',brand:'Acme',productName:'New Toy',names:{en:'New Toy',zh:''},categoryCode:'blocks_construction',skillCodes:['fine_motor'],playMechanics:['building'],imageRef:{kind:'placeholder'}};
const libraryStore=storeWith([structuredClone(draft)]);const libraryGovernance=new SharedCatalogGovernance({store:libraryStore,catalog,baseUrl:''});const libraryRecognition=new RecognitionService({store:libraryStore,images,catalog,governance:libraryGovernance});
assert.equal(pendingCandidateCount(libraryStore.state),0);await libraryRecognition.confirm('new-toy');assert.equal(libraryStore.state.toys.length,1);assert.equal(pendingCandidateCount(libraryStore.state),1);assert.equal(libraryStore.state.catalogState.syncMetadata.localCandidates[0].linkedLocalToyId,libraryStore.state.toys[0].id);
await libraryRecognition.confirm('new-toy');assert.equal(pendingCandidateCount(libraryStore.state),1);
const wishlistStore=storeWith([{...structuredClone(draft),id:'wishlist-new'}]);const wishlistGovernance=new SharedCatalogGovernance({store:wishlistStore,catalog,baseUrl:''});const wishlistRecognition=new RecognitionService({store:wishlistStore,images,catalog,governance:wishlistGovernance});
await wishlistRecognition.confirm('wishlist-new',{destination:'wishlist'});assert.equal(wishlistStore.state.wishlist.length,1);assert.equal(wishlistStore.state.toys.length,0);assert.equal(pendingCandidateCount(wishlistStore.state),1);assert.ok(wishlistStore.state.catalogState.syncMetadata.localCandidates[0].linkedWishlistId);
const persisted=structuredClone(wishlistStore.state);assert.equal(pendingCandidateCount(persisted),1);
const existing={id:'catalog-toy',canonicalKey:'catalog-toy',brand:'Acme',productName:'Catalog Toy',categoryCode:'blocks_construction',skillCodes:[],playMechanics:[]};const knownStore=storeWith([{...structuredClone(draft),id:'known',existing}]);const knownRecognition=new RecognitionService({store:knownStore,images,catalog,governance:new SharedCatalogGovernance({store:knownStore,catalog,baseUrl:''})});await knownRecognition.confirm('known',{destination:'wishlist'});assert.equal(pendingCandidateCount(knownStore.state),0);
const main=await readFile(new URL('../src/main.js',import.meta.url),'utf8');assert.match(main,/wishlist-manual-add/);assert.match(main,/governance\.createLocalCandidate\(\{candidateId:`candidate-\$\{wish\.id\}`/);
console.log('candidate production creation: PASS (17 assertions)');
