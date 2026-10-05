import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { emptyState, normalizeCatalogToy, normalizeWishlistItem } from '../src/data/schema.js';
import { CatalogRepository } from '../src/domain/catalog-repository.js';
import { createCatalogOwnership } from '../src/domain/library-service.js';
import { catalogOwnershipMatch, findOwnedToy, findOwnedToyMatch, findWishlistItem, identityTokens, sameCatalogIdentity } from '../src/domain/identity-service.js';

const rows=JSON.parse(await readFile(new URL('../catalog-base.json',import.meta.url))).entries;
const state=emptyState();
const store={get state(){return state},update(mutator){mutator(state)}};
const catalog=new CatalogRepository(store);
catalog.applyBase(rows);
const byKey=key=>catalog.getByKey(key);
const dump=byKey('vtech-drop-go-dump-truck');
const cube=byKey('vtech-busy-learners-music-activity-cube');
const animal=byKey('mideer-my-first-animal-family-6in1');
const construction=byKey('mideer-my-first-construction-6in1');
let checks=0;
const ok=(value,message)=>{assert.ok(value,message);checks++;};
const equal=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++;};

ok(dump&&cube&&animal&&construction,'real VTech and Mideer fixture Catalog rows exist');
ok(dump.canonicalKey==='vtech-drop-go-dump-truck'&&cube.canonicalKey==='vtech-busy-learners-music-activity-cube','the VTech SKUs have distinct canonical links');
ok(!identityTokens(dump).names.includes('vtech')&&!identityTokens(cube).names.includes('vtech'),'brand-only fragments are excluded from exact identity names');
ok(!catalogOwnershipMatch(dump,cube),'VTech Activity Cube cannot own Dump Truck through brand, category, mechanism, or alias overlap');
ok(!findOwnedToy(dump,[cube]),'VTech Dump Truck starts unowned when only Activity Cube is in Library');
ok(catalogOwnershipMatch(cube,{id:'legacy-cube-row',canonicalKey:'legacy-cube',catalogId:cube.id,brand:cube.brand,set:{kind:'none'}})?.kind==='catalogId','explicit stable catalog id is a second-priority exact ownership link');
const legacyDump={id:'legacy-dump',canonicalKey:'legacy-dump',brand:dump.brand,productName:dump.productName,names:{...dump.names},aliases:['VTech 翻斗车'],set:{kind:'none'}};
equal(catalogOwnershipMatch(dump,legacyDump)?.kind,'fallbackIdentity','unlinked legacy row can use a complete exact product identity');
ok(!catalogOwnershipMatch(dump,{...legacyDump,productName:'Truck',names:{en:'Truck',zh:''},aliases:['VTech']}),'a same-brand generic single-token legacy name cannot own Dump Truck');
ok(!catalogOwnershipMatch(animal,construction),'Mideer same-series products remain independently unowned');
ok(!catalogOwnershipMatch(normalizeCatalogToy({id:'same-brand-topic-a',key:'same-brand-topic-a',brand:'Fixture',name:'Ocean Activity Toy',aliases:['Fixture Activity']}),normalizeCatalogToy({id:'same-brand-topic-b',key:'same-brand-topic-b',brand:'Fixture',name:'Forest Activity Toy',aliases:['Fixture Activity']})),'same brand and mechanism/search alias do not establish ownership');

ok(!findOwnedToy(dump,state.toys),'VTech initial Catalog result is unowned');
ok(createCatalogOwnership(store,dump).added,'adding VTech Dump Truck creates only its ownership');
equal(findOwnedToyMatch(dump,state.toys)?.kind,'canonicalKey','Catalog add stores an exact canonical ownership link');
ok(!findOwnedToy(cube,state.toys),'adding Dump Truck does not own other VTech products');
state.toys=state.toys.filter(toy=>toy.canonicalKey!==dump.canonicalKey);
ok(!findOwnedToy(dump,state.toys),'removing Dump Truck immediately clears derived ownership');
const reloaded={toys:JSON.parse(JSON.stringify(state.toys))};
ok(!findOwnedToy(dump,reloaded.toys),'reload preserves the unowned Dump Truck result');

state.wishlist=[normalizeWishlistItem({id:'wish-dump',canonicalKey:dump.canonicalKey,catalogId:dump.id,catalogSnapshot:dump,status:'want'})];
ok(Boolean(findWishlistItem(dump,state.wishlist))&&!findOwnedToy(dump,state.toys),'Wishlist presence never makes a Catalog row owned');
ok(createCatalogOwnership(store,dump).added,'Dump Truck can be added while it is on Wishlist');
ok(Boolean(findOwnedToy(dump,state.toys))&&Boolean(findWishlistItem(dump,state.wishlist)),'Library ownership and Wishlist identity remain independent but exact');

state.toys=[];
ok(createCatalogOwnership(store,cube).added&&createCatalogOwnership(store,animal).added&&createCatalogOwnership(store,construction).added,'audit Library contains independent exact Catalog ownerships');
const idOnly=byKey('vtech-click-count-remote');
const fallbackOnly=byKey('vtech-musical-rhymes-book');
ok(idOnly&&fallbackOnly,'audit includes stable-id and legacy-identity Catalog fixtures');
state.toys.push({id:'legacy-id-only',canonicalKey:'legacy-id-only',catalogId:idOnly.id,brand:idOnly.brand,set:{kind:'none'}});
state.toys.push({id:'legacy-identity-only',canonicalKey:'legacy-identity-only',brand:fallbackOnly.brand,productName:fallbackOnly.productName,names:{...fallbackOnly.names},aliases:[],set:{kind:'none'}});
const stats={catalogTotal:catalog.active.length,owned:0,canonicalKey:0,catalogId:0,fallbackIdentity:0,ambiguous:0,falsePositives:0,unmatchedOwned:0};
for(const item of catalog.active){
  const matches=state.toys.map(toy=>({toy,match:catalogOwnershipMatch(item,toy)})).filter(row=>row.match);
  if(!matches.length)continue;
  stats.owned++;
  if(matches.length!==1)stats.ambiguous++;
  const match=matches[0].match;
  stats[match.kind]++;
  if(!findOwnedToy(item,state.toys)||!['canonicalKey','catalogId','fallbackIdentity'].includes(match.kind))stats.unmatchedOwned++;
  if(item.canonicalKey==='vtech-drop-go-dump-truck')stats.falsePositives++;
}
// Base-only baseline was 786 active rows (787 raw, one pre-existing MD1460
// consolidation). QA14 zero-ref cleanup removed 11 base rows; LEGO 10913
// cleanup removed one more, leaving 774 base-only active rows.
// is the measured base-only Catalog count; bundled remote rows are not loaded.
equal(stats.catalogTotal,774,'base-only ownership audit covers every surviving Catalog row after scoped identity source cleanup');
equal(stats.owned,5,'every audit owned state is derived only from an explicit exact fixture link');
equal(stats.canonicalKey,3,'every audit owned state has an exact canonical link');
equal(stats.catalogId,1,'audit recognizes exactly one explicit stable catalog-id link');
equal(stats.fallbackIdentity,1,'audit recognizes exactly one complete legacy product identity link');
equal(stats.ambiguous,0,'audit has no ambiguous ownership states');
equal(stats.falsePositives,0,'audit has no VTech Dump Truck false positive');
equal(stats.unmatchedOwned,0,'every derived owned Catalog row has a matching exact ownership record');
ok(sameCatalogIdentity(dump,{...dump,id:'duplicate-dump',canonicalKey:dump.canonicalKey}),'true canonical duplicate remains identical');
ok(sameCatalogIdentity(dump,legacyDump),'true legacy exact product identity remains identical');
assert.equal(checks,31);
console.log(`catalog ownership consistency v0.11.5: PASS (${checks} assertions; ${JSON.stringify(stats)})`);
