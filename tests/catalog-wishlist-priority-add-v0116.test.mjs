import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeCatalogToy, normalizeWishlistItem } from '../src/data/schema.js';
import { addCatalogToy } from '../src/domain/library-service.js';
import { sameCatalogIdentity } from '../src/domain/identity-service.js';
import { compare } from '../src/domain/duplicate-engine.js';

globalThis.crypto ??= (await import('node:crypto')).webcrypto;
let checks=0; const equal=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++;}; const ok=(value,message)=>{assert.ok(value,message);checks++;};
const entries=JSON.parse(await readFile(new URL('../catalog-base.json',import.meta.url),'utf8')).entries;
const keys=['lego-duplo-fire-truck-hose-firefighter-10473','cherrypick-original-magic-playwall','cherrypick-emotions-magnets-soft-foam-20pc','cherrypick-soft-foam-magnetic-letters','cherrypick-dustless-chalk-crayons'];
const rows=keys.map(key=>normalizeCatalogToy(entries.find(row=>row.key===key)));
equal(rows.length,5,'all five requested products have Catalog rows');
const [fireTruck,playwall,emotions,letters,chalk]=rows;
equal(fireTruck.setNumber,'10473','10473 set number is exact'); equal(fireTruck.pieceCount,28,'10473 piece count is exact'); equal(fireTruck.exactTitle,'Fire Truck with Hose and Firefighter','10473 title is exact');
equal(playwall.variantId,'44481003192508','Magic Playwall variant is retained'); equal(playwall.exactTitle,'Magic Playwall - Original Arch Magnetic Wall Decal for Kids','Magic Playwall title is exact');
equal(emotions.pieceCount,20,'Emotions Magnets preserves 20-piece identity'); equal(emotions.exactTitle,'Emotions Magnets - Soft Foam Magnets (20pc set)','Emotions title is exact');
equal(letters.variantId,'44529740382396','Letters variant is retained'); equal(letters.pieceCount,150,'Letters preserves 150-piece identity');
equal(chalk.variantId,'44190785765564','Chalk bundle variant is retained'); equal(chalk.variantName,'5 chalk crayons + magnetic holder','Chalk bundle contents are retained');
for(const item of rows){const wish=normalizeWishlistItem({catalogId:item.id,catalogSnapshot:item}); equal(wish.catalogSnapshot.canonicalKey,item.canonicalKey,`${item.id} Add Wishlist preserves canonical identity`); equal(wish.catalogSnapshot.sku,item.sku,`${item.id} Add Wishlist preserves durable identity`);}
const state={toys:[]}; const store={get state(){return state;},update(mutator){mutator(state);}}; for(const item of rows){const result=addCatalogToy(store,item,item.imageRef); ok(result.added,`${item.id} Add Library is zero-AI and accepts its identity`); equal(result.toy.variantId,item.variantId,`${item.id} Add Library retains its variant`);}
const otherFireTruck={...fireTruck,canonicalKey:'lego-duplo-other-fire-truck',legacyCanonicalKeys:[],setNumber:'10954'}; const otherPlaywall={...playwall,canonicalKey:'cherrypick-other-playwall',legacyCanonicalKeys:[],variantId:'different-variant'}; const standaloneCrayons={...chalk,canonicalKey:'cherrypick-standalone-crayons',legacyCanonicalKeys:[],variantId:'standalone-crayons'};
equal(sameCatalogIdentity(fireTruck,otherFireTruck),false,'10473 is distinct from another DUPLO fire-truck set'); equal(compare(fireTruck,otherFireTruck).kind,'related_variant','10473 does not become an actionable duplicate');
equal(sameCatalogIdentity(playwall,otherPlaywall),false,'Magic Playwall variants do not false-match'); equal(sameCatalogIdentity(chalk,standaloneCrayons),false,'bundle does not false-match a standalone item');
const librarySource=await readFile(new URL('../src/domain/library-service.js',import.meta.url),'utf8'); equal(/fetch\s*\(/.test(librarySource),false,'Catalog add path has no AI or network call');
console.log(`catalog wishlist priority add v0.11.6: PASS (${checks} assertions)`);
