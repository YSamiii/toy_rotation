import assert from 'node:assert/strict';

import { createCatalogOwnership } from '../src/domain/library-service.js';

import { CatalogRepository } from '../src/domain/catalog-repository.js';

import { compare, isActionableDuplicate } from '../src/domain/duplicate-engine.js';

import { findOwnedToy, findWishlistItem, identityTokens, sameCatalogIdentity } from '../src/domain/identity-service.js';

import { assess } from '../src/domain/substitution-engine.js';

import { emptyState, normalizeCatalogToy } from '../src/data/schema.js';

const rows=(await import('../catalog-base.json',{with:{type:'json'}})).default.entries;

const animal=normalizeCatalogToy(rows.find(row=>row.key==='mideer-my-first-animal-family-6in1'));

const construction=normalizeCatalogToy(rows.find(row=>row.key==='mideer-my-first-construction-6in1'));

let checks=0;
const ok=(v,m)=>{assert.ok(v,m);
checks++};

ok(animal.canonicalKey!==construction.canonicalKey,'canonical keys differ');
ok(!sameCatalogIdentity(animal,construction),'exact ownership identities differ');
ok(!identityTokens(animal).names.includes('61')&&!identityTokens(construction).names.includes('61'),'numeric-only series token is excluded');

const store={state:{toys:[]},update(fn){fn(this.state)}};
ok(!findOwnedToy(animal,store.state.toys)&&!findOwnedToy(construction,store.state.toys),'both SKUs start unowned');
ok(createCatalogOwnership(store,animal).added,'animal adds');
ok(Boolean(findOwnedToy(animal,store.state.toys))&&!findOwnedToy(construction,store.state.toys),'only animal is owned');
ok(createCatalogOwnership(store,construction).added,'construction remains addable');
ok(store.state.toys.length===2,'both independent SKUs remain');
ok(!isActionableDuplicate(compare(animal,construction).kind),'duplicate engine keeps variants distinct');
store.update(state=>{state.toys=state.toys.filter(toy=>toy.canonicalKey!==animal.canonicalKey)});
ok(!findOwnedToy(animal,store.state.toys)&&Boolean(findOwnedToy(construction,store.state.toys)),'removing one keeps the other owned');
store.update(state=>{state.toys=state.toys.filter(toy=>toy.canonicalKey!==construction.canonicalKey)});
ok(!findOwnedToy(animal,store.state.toys)&&!findOwnedToy(construction,store.state.toys),'removing both clears both ownerships');
const reloaded={toys:JSON.parse(JSON.stringify(store.state.toys))};
ok(!findOwnedToy(animal,reloaded.toys)&&!findOwnedToy(construction,reloaded.toys),'ownership remains correct after reload');
const numericVariants=['1','2','3','61','100','6-in-1','3-in-1'].map((series,index)=>normalizeCatalogToy({id:`numeric-${index}`,brand:'Fixture',productName:`Puzzle ${series}`,names:{en:`Puzzle ${series}`,zh:''},aliases:[],minAgeMonths:12,maxAgeMonths:36,categoryCode:'puzzles',skillCodes:[],playMechanics:[],imageRef:{kind:'placeholder'}}));
for(const fixture of numericVariants)ok(!sameCatalogIdentity(fixture,normalizeCatalogToy({...fixture,id:`other-${fixture.canonicalKey}`,canonicalKey:`other-${fixture.canonicalKey}`,productName:`Different Product ${fixture.productName}`,names:{en:`Different Product ${fixture.productName}`,zh:''}})),'numeric token does not independently create exact identity');
const sameProduct=normalizeCatalogToy({id:'same-product',brand:'Fixture',productName:'Animal Puzzle 6-in-1',names:{en:'Animal Puzzle 6-in-1',zh:''},aliases:[],minAgeMonths:12,maxAgeMonths:36,categoryCode:'puzzles',skillCodes:[],playMechanics:[],imageRef:{kind:'placeholder'}});
const sameProductCopy=normalizeCatalogToy({...sameProduct,id:'same-product-copy',canonicalKey:'same-product-copy'});
ok(sameCatalogIdentity(sameProduct,sameProductCopy),'filtering numeric tokens preserves true duplicate detection');
const searchState=emptyState();
const searchStore={get state(){return searchState},update(mutator){mutator(searchState)}};
const catalog=new CatalogRepository(searchStore);
catalog.applyBase(rows);
ok(catalog.search({query:'6-in-1'}).some(row=>row.canonicalKey===animal.canonicalKey)&&catalog.search({query:'6-in-1'}).some(row=>row.canonicalKey===construction.canonicalKey),'6-in-1 search still finds both exact SKUs');
const wishlist=[{catalogSnapshot:construction}];
ok(!findWishlistItem(animal,wishlist)&&Boolean(findWishlistItem(construction,wishlist)),'wishlist ownership indicators remain SKU-specific');
const substitution=assess({...animal,playMechanics:['matching','sequencing']},{...construction,playMechanics:['matching','sequencing']});
ok(substitution.level==='high_substitution','substitution remains an independent similarity engine');
assert.equal(checks,23);
console.log(`mideer distinct sku ownership v0.11.5: PASS (${checks} assertions)`);
