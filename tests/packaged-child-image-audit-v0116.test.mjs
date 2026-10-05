import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CatalogRepository } from '../src/domain/catalog-repository.js';
import { buildToyImageAudit } from '../src/features/real-device-owned-wishlist-image-audit.js';

let checks=0; const equal=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++;}; const ok=(actual,message)=>{assert.ok(actual,message);checks++;}; const rows=value=>Array.isArray(value)?value:value.entries||[];
const [base,remote]=await Promise.all(['catalog-base.json','catalog-remote.json'].map(async file=>rows(JSON.parse(await readFile(file,'utf8')))));
const busy='mideer-first-artist-busy-cars'; const dino='mideer-my-first-puzzle-dinosaurs-6in1-md1460';
const state={schemaVersion:12,settings:{},profile:{},wishlist:[],rotationHistory:[],catalogState:{tombstones:{},adminEdits:{},imageRefsByKey:{},imageRefsByIdentity:{},learnedEntries:[],remoteEntries:[],syncMetadata:{}},toys:[
  {id:'busy-parent',canonicalKey:busy,brand:'Mideer',productName:'Busy Cars',set:{kind:'parent',rotationMode:'split',childIds:[]}},
  {id:'dino-parent',canonicalKey:dino,brand:'Mideer',productName:'Dinosaurs',set:{kind:'parent',rotationMode:'split',childIds:[]}}
]};
const store={get state(){return state;},update(mutator){mutator(state);}}; const catalog=new CatalogRepository(store); catalog.applyBase(base); catalog.applyRemote(remote); catalog.ensureSetChildren();
const audit=buildToyImageAudit({state,catalog,build:{buildId:'audit-packaged-child'},generatedAt:'2026-09-19T00:00:00.000Z'});
const ownedChildren=audit.owned.items.filter(item=>item.canonicalKey.startsWith(`${busy}-`)||item.canonicalKey.startsWith(`${dino}-`));
equal(ownedChildren.length,12,'Busy and Dino child rows are present'); equal(ownedChildren.filter(item=>item.catalogImageState==='VERIFIED_PACKAGED').length,12,'all twelve child catalog images are packaged and usable'); equal(ownedChildren.filter(item=>item.catalogImageMissing).length,0,'packaged children do not enter ownedCatalogMissing'); equal(audit.owned.ownedCatalogImage.noCatalogImage,0,'owned catalog coverage has no missing child image'); equal(audit.owned.packagedImage,13,'owned packaged image count includes all children plus the Dino parent'); ok(audit.catalog.packagedImageCount>=13,'catalog packaged count includes nested child assets and the Dino parent'); equal(audit.priorityMissing.filter(item=>item.canonicalKey.startsWith(`${busy}-`)||item.canonicalKey.startsWith(`${dino}-`)).length,0,'no Busy/Dino child is prioritized as catalog missing');
console.log(`packaged child image audit v0.11.6: PASS (${checks} assertions)`);
