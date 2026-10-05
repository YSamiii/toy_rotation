import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeCatalogToy, normalizeWishlistItem } from '../src/data/schema.js';
import { addCatalogToy } from '../src/domain/library-service.js';
import { sameCatalogIdentity } from '../src/domain/identity-service.js';
import { challengeLevel, developmentMechanics, progressionLevel } from '../src/domain/development-fit.js';
globalThis.crypto ??= (await import('node:crypto')).webcrypto;
let checks=0;const equal=(a,b,m)=>{assert.equal(a,b,m);checks++;};
const entries=JSON.parse(await readFile(new URL('../catalog-base.json',import.meta.url),'utf8')).entries;
const expected={ 'lr-all-about-me-sorting-neighborhood':['LER3369',48], 'lr-code-go-robot-mouse':['LER2831',83], 'lr-easy-grip-tweezers':['LER2965',12], 'lr-helping-hands':['LER5558',4], 'lr-lock-key-clubhouse':['LER9807',6]};
for(const [key,[sku,pieces]] of Object.entries(expected)){const raw=entries.find(row=>row.key===key);const beforeRaw={...raw};delete beforeRaw.sku;delete beforeRaw.pieceCount;delete beforeRaw.exactTitle;delete beforeRaw.identitySource;const before=normalizeCatalogToy(beforeRaw), item=normalizeCatalogToy(raw);equal(item.sku,sku,`${key} retains its exact LER code`);equal(item.pieceCount,pieces,`${key} retains verified piece count`);equal(JSON.stringify(developmentMechanics(item)),JSON.stringify(developmentMechanics(before),`${key} mechanics unchanged`));equal(challengeLevel(item),challengeLevel(before),`${key} challenge unchanged`);equal(progressionLevel(item),progressionLevel(before),`${key} progression unchanged`);const wish=normalizeWishlistItem({catalogId:item.id,catalogSnapshot:item});equal(wish.catalogSnapshot.sku,sku,`${key} Wishlist retains LER code`);const state={toys:[]};const store={get state(){return state;},update(fn){fn(state);}};addCatalogToy(store,item,item.imageRef);equal(state.toys[0].sku,sku,`${key} Library retains LER code`);}
equal(normalizeCatalogToy(entries.find(row=>row.key==='lr-lock-key-clubhouse')).minAgeMonths,18,'Lock & Key Clubhouse uses the exact official 18m recommendation');
equal(sameCatalogIdentity({brand:'Learning Resources',productName:'Tool Set',sku:'LER5558'},{brand:'Learning Resources',productName:'Tool Set',sku:'LER2965'}),false,'different LER codes remain distinct');
console.log(`catalog Learning Resources identity v0.11.6: PASS (${checks} assertions)`);
