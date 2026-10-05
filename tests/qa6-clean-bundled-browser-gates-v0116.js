import { bootStore, STORE_KEY } from '../src/data/store.js';
import { CatalogRepository } from '../src/domain/catalog-repository.js';
import { ImageRepository } from '../src/data/image-repository.js';
import { resolvedLibraryImageRef } from '../src/domain/catalog-presentation.js';

const parent='mideer-my-first-puzzle-dinosaurs-6in1-md1460';
const legacy='mideer-my-first-puzzle-dinosaurs-6in1';
const busy='mideer-first-artist-busy-cars';
const result={ images:[], migration:{} };
const rows=value=>Array.isArray(value)?value:value.entries||[];
const image=ref=>new Promise(resolve=>{const node=new Image();node.onload=()=>resolve({node,ok:true});node.onerror=()=>resolve({node,ok:false});node.src=ref;});
const mimeFor=async url=>{const response=await fetch(url,{cache:'no-store'});return {status:response.status,mime:response.headers.get('content-type')||''};};

export async function runQa6CleanBundledBrowserGates() {
  const [base,remote]=await Promise.all(['./catalog-base.json','./catalog-remote.json'].map(async path=>rows(await (await fetch(path,{cache:'no-store'})).json())));
  localStorage.removeItem(STORE_KEY);
  localStorage.setItem(STORE_KEY,JSON.stringify({schemaVersion:12,settings:{language:'en',rotationSize:6,rotationDays:7,onboardingDone:true},profile:{childName:'Fixture',childBirthDate:'2020-01-01'},wishlist:[],rotationHistory:[{toyIds:['legacy-parent'],at:'2026-09-17T00:00:00.000Z'}],catalogState:{tombstones:{},adminEdits:{},imageRefsByKey:{},imageRefsByIdentity:{},learnedEntries:[],remoteEntries:[],syncMetadata:{}},toys:[
    {id:'busy-parent',canonicalKey:busy,brand:'Mideer',productName:'My First Artist Puzzle: Busy Cars',sku:'MD1458',skillCodes:[],playMechanics:[],set:{kind:'parent',rotationMode:'split',childIds:[]}},
    {id:'legacy-parent',canonicalKey:legacy,brand:'Mideer',productName:'My First Puzzle - Dinosaurs 6-in-1',sku:'MD1460',skillCodes:[],playMechanics:[],notes:'legacy-parent-note',storageLocation:'blue-bin',shelfMode:'permanent',permanentSource:'user',set:{kind:'parent',rotationMode:'split',childIds:['legacy-child-1']}},
    {id:'legacy-child-1',canonicalKey:`${legacy}:puzzle-1`,brand:'Mideer',productName:'Dinosaur Puzzle 1',skillCodes:[],playMechanics:[],notes:'retain-child-one',set:{kind:'child',parentId:'legacy-parent',parentCanonicalKey:legacy,partIndex:1,rotationMode:'split'}}
  ]}));
  const store=bootStore(); const catalog=new CatalogRepository(store); catalog.applyBase(base);catalog.applyRemote(remote);catalog.ensureSetChildren();
  const parentToy=store.state.toys.find(toy=>toy.id==='legacy-parent'); const children=store.state.toys.filter(toy=>toy.set?.kind==='child'&&toy.set.parentId==='legacy-parent');
  result.migration={storage:'localStorage',injected:true,parentKey:parentToy?.canonicalKey,parentCount:store.state.toys.filter(toy=>toy.canonicalKey===parent).length,children:children.length,parts:children.map(child=>child.set.partIndex).sort(),childOneNote:children.find(child=>child.set.partIndex===1)?.notes,notes:parentToy?.notes,storageLocation:parentToy?.storageLocation,permanentSource:parentToy?.permanentSource};
  const images=new ImageRepository();
  const materialized=[...store.state.toys.filter(toy=>toy.set?.kind==='child'&&toy.set.parentId==='busy-parent').sort((left,right)=>left.set.partIndex-right.set.partIndex),...children.sort((left,right)=>left.set.partIndex-right.set.partIndex)];
  for (const toy of materialized) {
    const catalogToy=catalog.resolve(toy); const ref=resolvedLibraryImageRef(toy,catalog); const url=await images.resolve(ref); const loaded=await image(url); const network=await mimeFor(url); const record={canonicalKey:toy.canonicalKey,catalogCanonicalKey:catalogToy?.canonicalKey,parentCanonicalKey:toy.set.parentCanonicalKey,partIndex:toy.set.partIndex,displayName:catalogToy?.productName,imageRef:ref,resolvedUrl:url,domSrc:loaded.node.src,status:network.status,mime:network.mime,complete:loaded.node.complete,naturalWidth:loaded.node.naturalWidth,naturalHeight:loaded.node.naturalHeight,placeholder:!url||url.startsWith('data:image/svg'),loaded:loaded.ok}; result.images.push(record);
  }
  result.imagesPass=result.images.every(item=>item.status===200&&item.mime.startsWith('image/')&&item.complete&&item.naturalWidth>0&&item.naturalHeight>0&&!item.placeholder&&item.loaded);
  result.unique={busy:new Set(result.images.slice(0,6).map(item=>item.resolvedUrl)).size,dino:new Set(result.images.slice(6).map(item=>item.resolvedUrl)).size};
  catalog.ensureSetChildren(); const one=store.state.toys.filter(toy=>toy.set?.kind==='child'&&toy.set.parentId==='legacy-parent').length;
  const reload=bootStore(); const repeat=new CatalogRepository(reload);repeat.applyBase(base);repeat.applyRemote(remote);repeat.ensureSetChildren(); const two=reload.state.toys.filter(toy=>toy.set?.kind==='child'&&toy.set.parentId==='legacy-parent').length;
  result.migration.reloads=[one,two]; result.pass=result.imagesPass&&result.unique.busy===6&&result.unique.dino===6&&result.migration.parentKey===parent&&result.migration.parentCount===1&&result.migration.children===6&&result.migration.parts.join(',')==='1,2,3,4,5,6'&&result.migration.childOneNote==='retain-child-one'&&result.migration.reloads.join(',')==='6,6';
  document.body.innerHTML=`<pre id="result" role="status">${JSON.stringify(result,null,2)}</pre>`;
  return result;
}
runQa6CleanBundledBrowserGates().catch(error=>{document.body.innerHTML=`<pre id="result" role="alert">${String(error?.stack||error)}</pre>`;throw error;});
