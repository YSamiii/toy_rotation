import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CATALOG_IMAGE_ASSETS } from '../src/data/catalog-image-assets.js';
import { emptyState } from '../src/data/schema.js';
import { CatalogRepository } from '../src/domain/catalog-repository.js';

const rows=JSON.parse(await readFile(new URL('../catalog-base.json',import.meta.url))).entries;
const key='lovevery-mini-ready-routines';
const raw=rows.find(row=>(row.canonicalKey||row.key)===key);
const expectedUrl='https://cdn.shopify.com/s/files/1/2386/2119/files/Lovevery_Packaging_Toddler-Routines-Play-Collection_BOX-ISO_09-25_0296_R1.png?v=1762547311';
let checks=0;
const ok=(value,message)=>{assert.ok(value,message);checks++;};

ok(raw?.brand==='Lovevery'&&raw?.name==='Ready for Routines Mini Kit','the persisted record is the exact Lovevery Ready for Routines Mini Kit');
ok(!Object.hasOwn(raw,'imageAsset'),'the persisted record contains no raw imageAsset');
ok(raw?.isSet===true&&raw?.rotationRule==='whole'&&!raw?.parentCanonicalKey&&!raw?.parentKey,'the catalog item remains a whole-set record with no parent-child image ownership');
const asset=CATALOG_IMAGE_ASSETS[key];
ok(asset?.kind==='remote'&&asset?.verificationStatus==='verified_real','the exact catalog mapping is a verified supported remote image');
ok(asset?.url===expectedUrl&&asset?.catalogImageRef===expectedUrl,'the retained Lovevery mapping uses the exact supported Ready for Routines image ref');
const state=emptyState();
const store={get state(){return state},update(mutator){mutator(state)}};
const catalog=new CatalogRepository(store);
catalog.applyBase(rows);
ok(catalog.getByKey(key)?.imageRef?.url===expectedUrl,'the reconstructed catalog resolves the exact mapped image without a raw data URI');
assert.equal(checks,6);
console.log(`Lovevery image integrity v0.11.5: PASS (${checks} assertions)`);
