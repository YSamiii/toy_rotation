import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildToyImageAudit, TOY_IMAGE_AUDIT_VERSION } from '../src/features/real-device-owned-wishlist-image-audit.js';

let checks=0; const equal=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++;}; const ok=(value,message)=>{assert.ok(value,message);checks++;};
const image=(kind,extra={})=>kind==='packaged'?{kind,path:'catalog-assets/x.png',verificationStatus:'verified_real',contentHash:'hash',mimeType:'image/png',...extra}:{kind,...extra};
const catalogRows=[
  {id:'pack',canonicalKey:'pack',brand:'Mideer',productName:'Pack',imageRef:image('packaged')},
  {id:'remote',canonicalKey:'remote',brand:'Other',productName:'Remote',exactTitle:'Remote',imageRef:image('remote',{verificationStatus:'verified_real'})},
  {id:'placeholder',canonicalKey:'placeholder',brand:'Cherry-Pick',productName:'Placeholder',imageRef:image('placeholder')},
  {id:'missing',canonicalKey:'missing',brand:'LEGO / DUPLO',productName:'Missing',sku:'123',imageRef:null}
];
const catalog={active:catalogRows,resolve:ref=>catalogRows.find(row=>row.canonicalKey===ref?.canonicalKey||row.id===ref?.catalogId)||null};
const state={toys:[
  {id:'owned-pack',canonicalKey:'pack'},{id:'owned-remote',canonicalKey:'remote'},
  {id:'owned-placeholder',canonicalKey:'placeholder',manualShelfMode:'on_shelf'},{id:'owned-personal',canonicalKey:'placeholder',imageRef:image('personal',{id:'secret-personal-image'})},
  {id:'unmapped',canonicalKey:'unmapped',notes:'PRIVATE NOTE',imageRef:image('personal',{id:'data:image/png;base64,SECRET'})}
],wishlist:[{id:'wish-pack',canonicalKey:'pack'},{id:'wish-placeholder',canonicalKey:'placeholder'},{id:'wish-missing',canonicalKey:'missing',notes:'PRIVATE WISH'}],rotationHistory:[]};
const audit=buildToyImageAudit({state,catalog,build:{buildId:'audit-build'},generatedAt:'2026-09-16T12:34:56.000Z'});
equal(TOY_IMAGE_AUDIT_VERSION,'v0.11.6','audit version'); equal(audit.catalog.visibleCatalogTotal,4,'catalog count'); equal(audit.owned.total,5,'owned total'); equal(audit.owned.mappedToCatalog,4,'unmapped excluded'); equal(audit.wishlist.total,3,'wishlist total');
equal(audit.owned.items.find(x=>x.personalToyId==='owned-pack').imageState,'VERIFIED_PACKAGED','owned packaged'); equal(audit.owned.items.find(x=>x.personalToyId==='owned-remote').imageState,'VERIFIED_REMOTE','owned remote'); equal(audit.owned.items.find(x=>x.personalToyId==='owned-placeholder').imageState,'PLACEHOLDER_ONLY','owned placeholder');
const personal=audit.owned.items.find(x=>x.personalToyId==='owned-personal'); equal(personal.imageState,'PERSONAL_IMAGE','personal wins'); equal(personal.catalogImageMissing,true,'catalog missing distinct'); equal(personal.userVisibleImageMissing,false,'personal visible image');
equal(audit.wishlist.items.find(x=>x.wishlistItemId==='wish-pack').imageState,'VERIFIED_PACKAGED','wishlist packaged'); equal(audit.wishlist.items.find(x=>x.wishlistItemId==='wish-placeholder').imageState,'PLACEHOLDER_ONLY','wishlist placeholder'); equal(audit.wishlist.items.find(x=>x.wishlistItemId==='wish-missing').imageState,'NO_IMAGE','wishlist missing');
equal(audit.priorityMissing[0].priorityBand,'P0','current shelf first'); equal(audit.priorityMissing[0].source,'owned','P0 owned'); ok(audit.priorityMissing.some(x=>x.priorityBand==='P2'),'wishlist P2'); ok(audit.priorityMissing.some(x=>x.priorityBrand),'priority brand');
const serialized=JSON.stringify(audit); for(const forbidden of ['PRIVATE NOTE','PRIVATE WISH','data:image','base64','blob:','Authorization','token','secret-personal-image'])ok(!serialized.includes(forbidden),`privacy excludes ${forbidden}`);
equal(JSON.stringify(buildToyImageAudit({state,catalog,build:{buildId:'audit-build'},generatedAt:'2026-09-16T12:34:56.000Z'})),serialized,'deterministic');
const empty=buildToyImageAudit({state:{toys:[],wishlist:[],rotationHistory:[]},catalog:{active:[],resolve:()=>null},generatedAt:'2026-09-16T00:00:00.000Z'});equal(empty.owned.coverage,0,'empty owned');equal(empty.wishlist.coverage,0,'empty wishlist');
const source=await readFile(new URL('../src/features/real-device-owned-wishlist-image-audit.js',import.meta.url),'utf8');ok(!/fetch\(|recognition|openai|worker/i.test(source),'zero AI or network work');
console.log(`real device owned + wishlist image audit: PASS (${checks} assertions)`);
