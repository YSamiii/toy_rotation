import assert from 'node:assert/strict';
import {dryRunMd1460,PARENT,LEGACY,CHILDREN} from './md1460-migration-simulator-v0116.mjs';
import {normalizeWishlistItem} from '../src/data/schema.js';

const owner=(id,key,set={kind:'parent'})=>({id,canonicalKey:key,notes:`note-${id}`,imageRef:{kind:'personal',id:`image-${id}`},set});
const state=()=>({schemaVersion:12,toys:[],wishlist:[],rotationHistory:[],catalogState:{tombstones:{},removedOwnerships:{},syncMetadata:{}}});
const deleted=(s,key)=>{s.catalogState.tombstones[key]={deletedAt:'2025-01-01T00:00:00.000Z'};};
const removed=(s,id,key,kind='parent')=>{s.catalogState.removedOwnerships[id]={canonicalKey:key,removedAt:'2025-01-01T00:00:00.000Z',ownership:{kind}};};
const wish=(id,key,other={})=>({id,canonicalKey:key,status:'want',priority:'medium',notes:'',addedAt:'2025-01-01T00:00:00.000Z',catalogSnapshot:{canonicalKey:key,productName:'Dinosaurs',imageRef:{kind:'placeholder'}},...other});
const cases=[];
const test=(name,seed,check)=>{
  const input=state();seed(input);const copy=structuredClone(input),result=dryRunMd1460(input);
  assert.deepEqual(input,copy,`${name}: input unchanged`);
  assert.equal(result.state.schemaVersion,12,`${name}: schema unchanged`);
  check(result,input);cases.push(name);
};
const blocked=(result,input)=>{assert.equal(result.status,'BLOCK_CONFLICT');assert.deepEqual(result.state,input,'conflict is fail-closed without data loss');};
const staged=result=>assert.equal(result.status,'STAGED');

// A1-A10: a deletion on either exact parent alias always blocks an ambiguous
// active row; a historical deletion without active ownership remains deleted.
const A=[
  ['A1',s=>{s.toys=[owner('a',LEGACY)];deleted(s,LEGACY);},blocked],
  ['A2',s=>{s.toys=[owner('a',LEGACY)];deleted(s,PARENT);},blocked],
  ['A3',s=>{s.toys=[owner('a',PARENT)];deleted(s,LEGACY);},blocked],
  ['A4',s=>{s.toys=[owner('a',PARENT)];deleted(s,PARENT);},blocked],
  ['A5',s=>{s.toys=[owner('a',LEGACY),owner('b',PARENT)];deleted(s,LEGACY);},blocked],
  ['A6',s=>{s.toys=[owner('a',LEGACY),owner('b',PARENT)];deleted(s,PARENT);},blocked],
  ['A7',s=>{s.toys=[owner('a',LEGACY),owner('b',PARENT)];deleted(s,LEGACY);deleted(s,PARENT);},blocked],
  ['A8',s=>{deleted(s,LEGACY);s.rotationHistory=[{toyIds:['removed-id'],historicalMissingToyIds:['removed-id']}];},(r)=>{staged(r);assert.equal(r.state.toys.length,0);assert.equal(r.state.rotationHistory[0].historicalMissingToyIds[0],'removed-id');}],
  ['A9',s=>{deleted(s,LEGACY);s.wishlist=[wish('w',LEGACY)];},(r)=>{staged(r);assert.equal(r.state.toys.length,0);assert.equal(r.state.wishlist[0].canonicalKey,PARENT);}],
  ['A10',s=>{deleted(s,LEGACY);},(r,s)=>{const chained=dryRunMd1460(s,{redirects:[{from:LEGACY,to:'intermediate-md1460'},{from:'intermediate-md1460',to:PARENT}]});blocked(chained,s);assert.equal(r.state.toys.length,0);}]
];
for(const [name,seed,check] of A)test(name,seed,check);

// R1-R10: removedOwnerships are UUID-keyed deleted instance evidence. A
// different active UUID is an ambiguous re-add, not permission to resurrect.
const R=[
  ['R1',s=>removed(s,'gone',LEGACY),(r)=>{staged(r);assert.equal(r.state.toys.length,0);assert.ok(r.state.catalogState.removedOwnerships.gone);}],
  ['R2',s=>removed(s,'gone',PARENT),(r)=>{staged(r);assert.equal(r.state.toys.length,0);}],
  ['R3',s=>{removed(s,'a',LEGACY);removed(s,'b',PARENT);},(r)=>{staged(r);assert.equal(Object.keys(r.state.catalogState.removedOwnerships).length,2);}],
  ['R4',s=>{removed(s,'gone',LEGACY);s.toys=[owner('active',PARENT)];},blocked],
  ['R5',s=>{removed(s,'gone',PARENT);s.toys=[owner('active',LEGACY)];},blocked],
  ['R6',s=>{removed(s,'gone',LEGACY);deleted(s,PARENT);},(r)=>{staged(r);assert.equal(r.state.toys.length,0);}],
  ['R7',s=>{removed(s,'gone',LEGACY);s.rotationHistory=[{historicalMissingToyIds:['gone'],toyIds:[]}];},(r)=>{staged(r);assert.equal(r.state.rotationHistory[0].historicalMissingToyIds[0],'gone');}],
  ['R8',s=>{removed(s,'gone',PARENT);s.toys=[owner('gone',LEGACY)];},blocked],
  ['R9',s=>{removed(s,'gone',CHILDREN[0],'child');s.toys=[owner('live-child',CHILDREN[1],{kind:'child',parentCanonicalKey:PARENT,partIndex:2})];},(r)=>{staged(r);assert.equal(r.state.toys.length,1);assert.equal(r.state.toys[0].canonicalKey,CHILDREN[1]);}],
  ['R10',s=>{removed(s,'gone',PARENT);s.toys=[owner('live-child',CHILDREN[0],{kind:'child',parentCanonicalKey:LEGACY,partIndex:1})];},(r)=>{staged(r);assert.equal(r.state.toys.length,1);assert.equal(r.state.toys[0].set.parentCanonicalKey,PARENT);}]
];
for(const [name,seed,check] of R)test(name,seed,check);

// W1-W10: one logical card; any conflicting original owner fields are retained
// as a full migration archive rather than silently discarded.
const W=[
  ['W1',s=>s.wishlist=[wish('old',LEGACY)]],
  ['W2',s=>s.wishlist=[wish('current',PARENT)]],
  ['W3',s=>s.wishlist=[wish('old',LEGACY),wish('current',PARENT)]],
  ['W4',s=>s.wishlist=[wish('old',LEGACY,{status:'purchased'}),wish('current',PARENT,{status:'want'})]],
  ['W5',s=>s.wishlist=[wish('old',LEGACY,{notes:'legacy note'}),wish('current',PARENT,{notes:'current note'})]],
  ['W6',s=>s.wishlist=[wish('old',LEGACY,{addedAt:'2020-01-01T00:00:00.000Z'}),wish('current',PARENT,{addedAt:'2025-01-01T00:00:00.000Z'})]],
  ['W7',s=>s.wishlist=[wish('old',LEGACY,{imageRef:{kind:'personal',id:'owned-photo'}}),wish('current',PARENT)]],
  ['W8',s=>s.wishlist=[wish('old',LEGACY,{overlapAnalysis:{score:7}}),wish('current',PARENT,{overlapAnalysis:{score:5}})]],
  ['W9',s=>{s.wishlist=[wish('old',LEGACY,{sourceLink:'https://example.test/source'})];s.rotationHistory=[{toyIds:[]}];}],
  ['W10',s=>s.wishlist=[wish('old',LEGACY,{notes:'backup note',status:'dismissed'}),wish('current',PARENT,{notes:'live note',status:'want'})]]
];
for(const [name,seed] of W)test(name,seed,(r,b)=>{
  staged(r);assert.equal(r.state.wishlist.length,1);assert.equal(r.state.wishlist[0].canonicalKey,PARENT);
  if(b.wishlist.length===2){
    const archive=r.state.catalogState.syncMetadata.md1460WishlistDryRun[PARENT];
    assert.deepEqual(archive.originalRows,b.wishlist,'both original rows retained');
  }
});
const w4=(()=>{const s=state();W[3][1](s);return dryRunMd1460(s).state;})();
assert.equal(w4.wishlist[0].status,'purchased');
const w6=(()=>{const s=state();W[5][1](s);return dryRunMd1460(s).state;})();
assert.equal(w6.wishlist[0].addedAt,'2020-01-01T00:00:00.000Z');
const w7=(()=>{const s=state();W[6][1](s);return dryRunMd1460(s).state;})();
assert.equal(w7.wishlist[0].imageRef.id,'owned-photo');
const w10=(()=>{const s=state();W[9][1](s);return dryRunMd1460(s).state;})();
assert.equal(w10.wishlist[0].status,'dismissed');
assert.equal(normalizeWishlistItem(w10.wishlist[0]).status,'dismissed');
assert.ok(w10.catalogState.syncMetadata.md1460WishlistDryRun[PARENT].originalRows[0].notes);
for(const [index,key] of CHILDREN.entries())test(`C${index+1}`,s=>{
  s.toys=[owner(`child-${index+1}`,key,{kind:'child',parentCanonicalKey:LEGACY,partIndex:index+1})];
  removed(s,'deleted-parent',PARENT);
},r=>{staged(r);assert.equal(r.state.toys.length,1);assert.equal(r.state.toys[0].canonicalKey,key);assert.equal(r.state.toys[0].set.parentCanonicalKey,PARENT);});
console.log(`MD1460 blocker resolution: ${cases.length} pure cases PASS (A1-A10, R1-R10, W1-W10, six distinct children)`);
