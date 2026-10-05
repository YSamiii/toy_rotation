import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CatalogRepository } from '../src/domain/catalog-repository.js';

const rows=value=>Array.isArray(value)?value:value.entries||[];
const [base,remote]=await Promise.all(['catalog-base.json','catalog-remote.json'].map(async file=>rows(JSON.parse(await readFile(file,'utf8')))));
const busyParent='mideer-first-artist-busy-cars';
const legacyDinoParent='mideer-my-first-puzzle-dinosaurs-6in1';
const dinoParent='mideer-my-first-puzzle-dinosaurs-6in1-md1460';
const busyNames=['Car','Police Car','Ice Cream Truck','Garbage Truck','Delivery Truck','School Bus'];
const dinoNames=['Pterosaur','Parasaurolophus','Stegosaurus','Triceratops','Tyrannosaurus rex','Snake'];
const state={schemaVersion:12,settings:{},profile:{},wishlist:[],rotationHistory:[],catalogState:{tombstones:{},adminEdits:{},imageRefsByKey:{},imageRefsByIdentity:{},learnedEntries:[],remoteEntries:[],syncMetadata:{}},toys:[
  {id:'busy-parent',canonicalKey:busyParent,brand:'Mideer',productName:'Busy Cars',set:{kind:'parent',rotationMode:'split',childIds:[]}},
  {id:'dino-parent',canonicalKey:legacyDinoParent,brand:'Mideer',productName:'Dinosaurs',set:{kind:'parent',rotationMode:'split',childIds:[]}},
  ...Array.from({length:6},(_,index)=>({id:`busy-${index+1}`,canonicalKey:`${busyParent}:puzzle-${index+1}`,brand:'Mideer',productName:`${['Car','Police Car','Ice Cream Truck','Garbage Truck','Delivery Truck','School Bus'][index]} Puzzle`,names:{en:`legacy busy ${index+1}`,zh:''},aliases:[],notes:index===0?'busy note':'',imageRef:index===1?{kind:'personal',id:'busy-personal'}:{kind:'placeholder'},manualShelfMode:index===2?'on_shelf':null,storageLocation:index===3?'red bin':'',interest:index===4?'like':'neutral',feedbackHistory:index===5?[{value:'love'}]:[],shelfMode:index===5?'permanent':'rotate',permanentSource:index===5?'user':null,set:{kind:'child',parentId:'busy-parent',parentCanonicalKey:busyParent,partIndex:index+1,rotationMode:'split'}})),
  ...Array.from({length:6},(_,index)=>({id:`dino-${index+1}`,canonicalKey:`${legacyDinoParent}:puzzle-${index+1}`,brand:'Mideer',productName:`Dinosaur Puzzle ${index+1}`,names:{en:`Dinosaur Puzzle ${index+1}`,zh:''},aliases:[],notes:index===0?'dino note':'',imageRef:index===1?{kind:'personal',id:'dino-personal'}:{kind:'placeholder'},manualShelfMode:index===2?'on_shelf':null,storageLocation:index===3?'blue bin':'',interest:index===4?'dislike':'neutral',feedbackHistory:index===5?[{value:'neutral'}]:[],shelfMode:index===5?'permanent':'rotate',permanentSource:index===5?'user':null,set:{kind:'child',parentId:'dino-parent',parentCanonicalKey:legacyDinoParent,partIndex:index+1,rotationMode:'split'}}))
]};
const store={get state(){return state;},update(mutator){mutator(state);}};
const catalog=new CatalogRepository(store); catalog.applyBase(base); catalog.applyRemote(remote); catalog.ensureSetChildren();
const children=parentId=>state.toys.filter(toy=>toy.set?.kind==='child'&&toy.set.parentId===parentId).sort((a,b)=>a.set.partIndex-b.set.partIndex);
const busy=children('busy-parent'); const dinos=children('dino-parent');
assert.deepEqual(busy.map(toy=>toy.productName),busyNames,'Busy children use standard display names');
assert.deepEqual(dinos.map(toy=>toy.productName),dinoNames,'Dinosaur children use standard species names');
assert.equal(state.toys.find(toy=>toy.id==='dino-parent').canonicalKey,dinoParent,'legacy Dino parent migrates to MD1460');
assert.equal(busy[0].notes,'busy note','Busy note survives enrichment');
assert.equal(busy[1].imageRef.id,'busy-personal','Busy personal image survives enrichment');
assert.equal(busy[2].manualShelfMode,'on_shelf','Busy shelf state survives enrichment');
assert.equal(busy[3].storageLocation,'red bin','Busy storage survives enrichment');
assert.equal(busy[4].interest,'like','Busy feedback survives enrichment');
assert.equal(busy[5].permanentSource,'user','Busy permanent state survives enrichment');
assert.equal(dinos[0].notes,'dino note','Dino note survives enrichment');
assert.equal(dinos[1].imageRef.id,'dino-personal','Dino personal image survives enrichment');
assert.equal(dinos[2].manualShelfMode,'on_shelf','Dino shelf state survives enrichment');
assert.equal(dinos[3].storageLocation,'blue bin','Dino storage survives enrichment');
assert.equal(dinos[4].interest,'dislike','Dino feedback survives enrichment');
assert.equal(dinos[5].permanentSource,'user','Dino permanent state survives enrichment');
assert.ok(busy[4].aliases.includes('Dump Truck'),'Delivery Truck retains the Dump Truck alias');
assert.ok(dinos[0].aliases.includes('Dinosaur Puzzle 1'),'generic Dino name remains searchable as an alias');
catalog.ensureSetChildren(); catalog.ensureSetChildren();
assert.equal(children('busy-parent').length,6,'Busy reconciliation remains idempotent');
assert.equal(children('dino-parent').length,6,'Dino reconciliation remains idempotent');
assert.equal(new Set(state.toys.filter(toy=>toy.set?.kind==='child').map(toy=>toy.canonicalKey)).size,12,'reconciliation creates no duplicate children');
const renamed=busy[0]; renamed.productName='My Custom Car'; renamed.userMetadata={...(renamed.userMetadata||{}),customProductName:true}; catalog.ensureSetChildren();
assert.equal(renamed.productName,'My Custom Car','explicit user custom child name remains authoritative');
console.log('mideer child standard enrichment v0.11.6: PASS (23 assertions)');
