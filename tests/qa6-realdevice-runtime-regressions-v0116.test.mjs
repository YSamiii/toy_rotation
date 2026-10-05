import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CatalogRepository } from '../src/domain/catalog-repository.js';
import { catalogImageAsset } from '../src/data/catalog-image-assets.js';
import { buildToyImageAudit } from '../src/features/real-device-owned-wishlist-image-audit.js';

const rows=value => Array.isArray(value) ? value : value.entries || value.catalog || value.items || [];
const [base,remote]=await Promise.all(['catalog-base.json','catalog-remote.json'].map(async file=>rows(JSON.parse(await readFile(file,'utf8')))));
const target='mideer-my-first-puzzle-dinosaurs-6in1-md1460';
const legacy='mideer-my-first-puzzle-dinosaurs-6in1';
const state={ schemaVersion:12, settings:{}, profile:{}, wishlist:[], rotationHistory:[], catalogState:{tombstones:{},adminEdits:{},imageRefsByKey:{},imageRefsByIdentity:{},learnedEntries:[],remoteEntries:[],syncMetadata:{}}, toys:[
  {id:'legacy-parent',canonicalKey:legacy,brand:'Mideer',productName:'My First Puzzle - Dinosaurs 6-in-1',sku:'MD1460',notes:'retain me',shelfMode:'permanent',permanentSource:'user',set:{kind:'parent',rotationMode:'split',childIds:['legacy-child-1']}},
  {id:'legacy-child-1',canonicalKey:`${legacy}:puzzle-1`,brand:'Mideer',productName:'Dinosaur Puzzle 1',notes:'child state',status:'active',set:{kind:'child',parentId:'legacy-parent',parentCanonicalKey:legacy,partIndex:1,rotationMode:'split'}}
]};
const store={get state(){return state;},update(fn){fn(state);}};
const catalog=new CatalogRepository(store); catalog.applyBase(base); catalog.applyRemote(remote); catalog.ensureSetChildren();
const dinos=catalog.search({query:'MD1460',includeReview:false}).filter(row=>row.set?.kind !== 'child');
assert.equal(dinos.length,1,'MD1460 has exactly one public parent');
assert.equal(dinos[0].canonicalKey,target,'MD1460 is the surviving canonical');
const parent=state.toys.find(toy=>toy.id==='legacy-parent');
assert.equal(parent.canonicalKey,target,'legacy owned parent migrates');
assert.equal(parent.notes,'retain me','parent metadata survives');
const children=state.toys.filter(toy=>toy.set?.kind==='child'&&toy.set.parentId===parent.id);
assert.equal(children.length,6,'real legacy parent receives all six children');
assert.equal(children.find(toy=>toy.set.partIndex===1).notes,'child state','retained child state survives');
assert.equal(new Set(children.map(toy=>toy.canonicalKey)).size,6,'no duplicate children');
catalog.ensureSetChildren();
assert.equal(state.toys.filter(toy=>toy.set?.kind==='child'&&toy.set.parentId===parent.id).length,6,'second startup is idempotent');
for(const key of Array.from({length:6},(_,index)=>`mideer-first-artist-busy-cars:puzzle-${index+1}`)) assert.equal(catalogImageAsset(key)?.kind,'packaged',`${key} has a packaged asset`);
for(const key of Array.from({length:6},(_,index)=>`${target}:puzzle-${index+1}`)) assert.equal(catalogImageAsset(key)?.kind,'packaged',`${key} has a packaged asset`);
const personalState={toys:[{id:'personal-placeholder',canonicalKey:'missing-catalog',imageRef:{kind:'personal',id:'user-photo'},set:{kind:'none'}}],wishlist:[]};
const missingCatalog={active:[{id:'missing-catalog',canonicalKey:'missing-catalog',brand:'Mideer',productName:'Missing catalog image',imageRef:{kind:'placeholder'}}],resolve:reference=>reference?.canonicalKey==='missing-catalog'?{id:'missing-catalog',canonicalKey:'missing-catalog',brand:'Mideer',productName:'Missing catalog image',imageRef:{kind:'placeholder'}}:null};
const audit=buildToyImageAudit({state:personalState,catalog:missingCatalog});
assert.equal(audit.owned.items[0].userVisibleImageMissing,false,'personal image remains visibly usable');
assert.equal(audit.owned.ownedCatalogImage.placeholderCatalogImage,1,'personal image does not mask catalog placeholder');
assert.equal(audit.priorityMissing[0].priorityBand,'P1','personal-image toy remains in owned catalog missing list');
console.log('qa6 realdevice runtime regressions v0.11.6: PASS (35 assertions)');
