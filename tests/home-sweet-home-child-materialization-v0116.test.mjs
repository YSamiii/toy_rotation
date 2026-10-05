import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CatalogRepository } from '../src/domain/catalog-repository.js';

let checks=0; const equal=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++;}; const deep=(actual,expected,message)=>{assert.deepEqual(actual,expected,message);checks++;};
const rows=value=>Array.isArray(value)?value:value.entries||[];
const base=rows(JSON.parse(await readFile('catalog-base.json','utf8')));
const key='mideer-level1-home-sweet-home-puzzle';
const state={schemaVersion:12,settings:{},profile:{},wishlist:[],rotationHistory:[],catalogState:{tombstones:{},adminEdits:{},imageRefsByKey:{},imageRefsByIdentity:{},learnedEntries:[],remoteEntries:[],syncMetadata:{}},toys:[
  {id:'home-parent',canonicalKey:key,brand:'Mideer',productName:'Level Up! Puzzles - Level 1: Home, Sweet Home!',notes:'parent note',set:{kind:'parent',rotationMode:'split',childIds:[]}},
  {id:'legacy-home-three',canonicalKey:`${key}:part-3`,brand:'Mideer',productName:'Old home part',notes:'retain note',imageRef:{kind:'personal',id:'retain-personal'},manualShelfMode:'on_shelf',storageLocation:'yellow bin',interest:'like',feedbackHistory:[{value:'love'}],shelfMode:'permanent',permanentSource:'user',set:{kind:'child',parentId:'home-parent',parentCanonicalKey:key,partIndex:3,rotationMode:'split'}}
]};
const store={get state(){return state;},update(mutator){mutator(state);}};
const catalog=new CatalogRepository(store); catalog.applyBase(base); catalog.ensureSetChildren();
const children=()=>state.toys.filter(toy=>toy.set?.kind==='child'&&toy.set.parentId==='home-parent').sort((a,b)=>a.set.partIndex-b.set.partIndex);
const expectedNames=Array.from({length:8},(_,index)=>`Home, Sweet Home! · Progressive Puzzle ${index+1}`);
const expectedPieces=[2,2,3,3,4,4,5,6];
equal(state.schemaVersion,12,'schema remains 12'); equal(children().length,8,'materializes eight independent puzzles'); deep(children().map(toy=>toy.canonicalKey),Array.from({length:8},(_,index)=>`${key}-puzzle-${index+1}`),'canonical keys are deterministic'); deep(children().map(toy=>toy.productName),expectedNames,'uses stable progressive child names'); deep(children().map(toy=>toy.set.partIndex),[1,2,3,4,5,6,7,8],'part indices are stable'); deep(children().map(toy=>catalog.resolve(toy).pieceCount),expectedPieces,'catalog plans preserve progressive piece counts');
const retained=children()[2]; equal(retained.notes,'retain note','note survives remap'); equal(retained.imageRef.id,'retain-personal','personal image survives remap'); equal(retained.manualShelfMode,'on_shelf','shelf state survives remap'); equal(retained.storageLocation,'yellow bin','storage survives remap'); equal(retained.interest,'like','feedback state survives remap'); equal(retained.permanentSource,'user','permanent state survives remap');
catalog.ensureSetChildren(); catalog.ensureSetChildren(); equal(children().length,8,'two reload-equivalent reconciliations do not duplicate children'); equal(new Set(children().map(toy=>toy.canonicalKey)).size,8,'no duplicate child keys'); deep(state.toys.find(toy=>toy.id==='home-parent').set.childIds,children().map(toy=>toy.id),'parent linkage remains complete');
console.log(`home sweet home child materialization v0.11.6: PASS (${checks} assertions)`);
