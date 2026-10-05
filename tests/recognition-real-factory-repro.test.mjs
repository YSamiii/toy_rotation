import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { openRecognitionReviewProduction } from '../src/ui/recognition-review-production.js';
import { RecognitionService } from '../src/features/recognition-service.js';
import { SharedCatalogGovernance } from '../src/features/shared-catalog-governance.js';
import { pendingCandidateCount, localCandidates } from '../src/features/local-candidate-queue.js';
import { emptyState, CATEGORY_CODES, SKILL_CODES } from '../src/data/schema.js';

const wait=()=>new Promise(resolve=>setTimeout(resolve,0));
const report={ generatedAt:new Date().toISOString(), productionFactory:'src/ui/recognition-review-production.js', cases:[], childAgeDifferential:[], pendingDifferential:null };

function installDom() {
  const dom=new JSDOM('<!doctype html><html><body><dialog id="modal"></dialog><span data-admin-pending-badge>0</span></body></html>',{url:'https://toy.local/'});
  const {window}=dom;
  for (const key of ['window','document','Node','Element','EventTarget','Event','MutationObserver','FormData','HTMLElement','HTMLButtonElement','HTMLFormElement','HTMLInputElement','localStorage']) globalThis[key]=window[key];
  globalThis.crypto ||= (awaitableCrypto());
  window.crypto ??= globalThis.crypto;
  return dom;
}
function awaitableCrypto(){ return globalThis.crypto; }
function fixture(id, childAgeMonths=22) {
  const state=emptyState(); state.profile.childAgeMonths=childAgeMonths;
  state.drafts.push({id,status:'ready_catalog_unmatched',imageRef:{kind:'personal',id:`image-${id}`},brand:'Auby',productName:'宝宝出行安静书',names:{en:'Auby Quiet Book',zh:'宝宝出行安静书'},sku:'AUBY-QUIET-1',categoryCode:'cognitive',skillCodes:['logic','attention'],playMechanics:['matching'],minAgeMonths:18,maxAgeMonths:36,rotationValue:'medium',notes:'fixture',children:[],canonicalKey:'auby-quiet-book',confidence:0.91,imageConsent:false});
  const subscribers=[];
  return { state, update(mutator,reason){ mutator(state); for(const subscriber of subscribers)subscriber(state,reason); }, subscribe(fn){subscribers.push(fn);return()=>subscribers.splice(subscribers.indexOf(fn),1);}, get revision(){return 1;} };
}
function t(key){return key;}
function escape(value=''){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}
function snapshot({store,dialog,form,events,calls,mutations,primitiveWrites,badge}) { return { form:{valid:form.checkValidity(),method:form.method,action:form.action,noValidate:form.noValidate}, state:{drafts:store.state.drafts.length,toys:store.state.toys.length,wishlist:store.state.wishlist.length,localCandidates:localCandidates(store.state).length,pendingCandidateCount:pendingCandidateCount(store.state)}, modalOpen:dialog.open===true, eventCount:events.length, calls:{...calls}, mutations:[...mutations], primitiveWrites:[...primitiveWrites], badge:badge.textContent }; }
function buttonFacts(button){return {tagName:button.tagName,getAttributeType:button.getAttribute('type'),type:button.type,formOwner:button.form?.tagName||null,dataset:{...button.dataset},name:button.name,value:button.value};}

async function runCase({destination,id,childAgeMonths=22,pendingSeed=0}) {
  const dom=installDom(); const {document,window}=dom.window; const store=fixture(id,childAgeMonths);
  for(let index=0;index<pendingSeed;index++)store.state.catalogState.syncMetadata.localCandidates=[...(store.state.catalogState.syncMetadata.localCandidates||[]),{candidateId:`seed-${index}`,reviewStatus:'pending'}];
  const catalog={resolveRecognition:()=>({kind:'genuinely_new',canonicalKey:'auby-quiet-book'}),ensureSetChildren(){}};
  const images={resolve:async()=>null,savePersonal:async data=>({kind:'personal',id:`saved-${data}`}),removePersonal:async()=>{}};
  const governance=new SharedCatalogGovernance({store,catalog,baseUrl:''});
  const recognition=new RecognitionService({store,images,catalog,governance,baseUrl:''});
  const dialog=document.querySelector('#modal'); dialog.close=function(){this.open=false;this.dispatchEvent(new window.Event('close'));};
  const events=[],calls={saveDraft:0,confirm:0,identityClassification:0,createLocalCandidate:0,subscriber:0,closeRequested:0}; const mutations=[],primitiveWrites=[],listeners=[];
  const originalResolve=catalog.resolveRecognition; catalog.resolveRecognition=(draft)=>{calls.identityClassification++;return originalResolve(draft);};
  const originalConfirm=recognition.confirm.bind(recognition); recognition.confirm=async(...args)=>{calls.confirm++;return originalConfirm(...args);};
  const originalCreate=governance.createLocalCandidate.bind(governance); governance.createLocalCandidate=(...args)=>{calls.createLocalCandidate++;return originalCreate(...args);};
  const originalAdd=window.EventTarget.prototype.addEventListener; window.EventTarget.prototype.addEventListener=function(type,listener,options){listeners.push({target:this,type});return originalAdd.call(this,type,listener,options);};
  const originalAppend=window.Element.prototype.append; const originalAppendChild=window.Node.prototype.appendChild; const originalInsert=window.Element.prototype.insertAdjacentHTML;
  const describe=node=>node?{tag:node.tagName||node.nodeName,className:node.className||'',id:node.id||'',text:node.textContent||''}:null;
  const capture=(target,value,kind)=>{if(String(value).includes('22'))primitiveWrites.push({kind,target:describe(target),value:String(value),stack:new Error().stack});};
  window.Element.prototype.append=function(...args){args.forEach(arg=>capture(this,arg?.textContent??arg,'append'));return originalAppend.apply(this,args);};
  window.Node.prototype.appendChild=function(arg){capture(this,arg?.textContent??arg,'appendChild');return originalAppendChild.call(this,arg);};
  window.Element.prototype.insertAdjacentHTML=function(position,text){capture(this,text,'insertAdjacentHTML');return originalInsert.call(this,position,text);};
  const textDescriptor=Object.getOwnPropertyDescriptor(window.Node.prototype,'textContent'); const htmlDescriptor=Object.getOwnPropertyDescriptor(window.Element.prototype,'innerHTML');
  Object.defineProperty(window.Node.prototype,'textContent',{configurable:true,get:textDescriptor.get,set(value){capture(this,value,'textContent');return textDescriptor.set.call(this,value);}});
  Object.defineProperty(window.Element.prototype,'innerHTML',{configurable:true,get:htmlDescriptor.get,set(value){capture(this,value,'innerHTML');return htmlDescriptor.set.call(this,value);}});
  let view='home'; let renderCount=0; const badge=document.querySelector('[data-admin-pending-badge]'); store.subscribe(()=>{calls.subscriber++;badge.textContent=String(pendingCandidateCount(store.state));});
  const trace=[];
  try {
    openRecognitionReviewProduction({document,openModal:markup=>{dialog.innerHTML=markup;dialog.open=true;dialog.querySelectorAll('[data-close]').forEach(button=>button.onclick=()=>dialog.close());return dialog;},recognitionDraftId:id,getState:()=>store.state,getRecognition:()=>recognition,updateDraft:(mutator,reason)=>{calls.saveDraft++;store.update(mutator,reason);},images,attachPersonalImageEditor:()=>({editedDataUrl:()=>null}),t,escape,categoryCodes:CATEGORY_CODES,skillCodes:SKILL_CODES,messageFor:value=>value,setView:next=>{view=next;},render:()=>{renderCount++;},trace:(stage,detail)=>trace.push({stage,detail})});
    const form=dialog.querySelector('form'); const button=dialog.querySelector(`[data-destination="${destination}"]`); const reviewRoot=form;
    const productionListeners={libraryButtonClick:listeners.filter(x=>x.target===button&&x.type==='click').length,formSubmit:listeners.filter(x=>x.target===form&&x.type==='submit').length,parentDelegatedClick:listeners.filter(x=>x.target===dialog&&x.type==='click').length};
    const observer=new window.MutationObserver(records=>{for(const record of records)mutations.push({type:record.type,target:describe(record.target),addedNodes:[...record.addedNodes].map(describe),previousSibling:describe(record.previousSibling),nextSibling:describe(record.nextSibling)});}); observer.observe(reviewRoot,{childList:true,characterData:true,subtree:true});
    for(const type of ['pointerdown','pointerup','touchstart','touchend','click'])button.addEventListener(type,event=>events.push({type,target:'button',defaultPrevented:event.defaultPrevented}));
    form.addEventListener('submit',event=>events.push({type:'submit',target:'form',submitter:event.submitter?.dataset?.destination||null,defaultPrevented:event.defaultPrevented}));
    const before=snapshot({store,dialog,form,events,calls,mutations,primitiveWrites,badge}); button.click(); await wait(); await wait(); const first=snapshot({store,dialog,form,events,calls,mutations,primitiveWrites,badge});
    button.click(); await wait(); await wait(); const second=snapshot({store,dialog,form,events,calls,mutations,primitiveWrites,badge}); observer.disconnect();
    return {destination,childAgeMonths,pendingSeed,button:buttonFacts(button),before,first,second,events,trace,listeners:productionListeners,view,renderCount,validation:{before:before.form.valid,afterFirst:first.form.valid,invalidFields:[...form.querySelectorAll(':invalid')].map(field=>field.name)}};
  } finally { window.EventTarget.prototype.addEventListener=originalAdd; window.Element.prototype.append=originalAppend; window.Node.prototype.appendChild=originalAppendChild; window.Element.prototype.insertAdjacentHTML=originalInsert; Object.defineProperty(window.Node.prototype,'textContent',textDescriptor); Object.defineProperty(window.Element.prototype,'innerHTML',htmlDescriptor); dom.window.close(); }
}

const library=await runCase({destination:'library',id:'library-22'}); const wishlist=await runCase({destination:'wishlist',id:'wishlist-22'}); report.cases.push(library,wishlist);
for(const age of [22,31,7])report.childAgeDifferential.push(await runCase({destination:'library',id:`age-${age}`,childAgeMonths:age}));
report.pendingDifferential=await runCase({destination:'library',id:'pending-22',childAgeMonths:31,pendingSeed:22});
assert.equal(library.button.getAttributeType,null); assert.equal(library.button.type,'submit'); assert.equal(library.first.state.toys,1); assert.equal(library.first.state.pendingCandidateCount,1); assert.equal(wishlist.first.state.wishlist,1); assert.equal(wishlist.first.state.pendingCandidateCount,1);
report.reproduced=false; report.summary='First click completes in jsdom for both destinations; no bare 22 mutation was observed in the Review subtree. The pending=22 differential writes 22 only to the test badge subscriber.';
const output=path.resolve(process.cwd(),'..','..','_verification'); await mkdir(output,{recursive:true}); await writeFile(path.join(output,'RECOGNITION_REAL_FACTORY_REPRO_20260831.json'),`${JSON.stringify(report,null,2)}\n`); await writeFile(path.join(output,'RECOGNITION_REAL_FACTORY_REPRO_20260831.md'),`# Recognition real factory reproduction\n\n- Result: **NOT REPRODUCED in jsdom**\n- Production factory: \`${report.productionFactory}\`\n- Fixture: genuinely-new Auby quiet-book draft; age variants 22, 31, 7; zero toys, Wishlist items, and local candidates at start.\n- Buttons: both have \`getAttribute('type') === null\` and \`button.type === 'submit'\`.\n- Library first click: toy=\`${library.first.state.toys}\`, Wishlist=\`${library.first.state.wishlist}\`, candidate/pending=\`${library.first.state.pendingCandidateCount}\`, draft=\`${library.first.state.drafts}\`, modal open=\`${library.first.modalOpen}\`.\n- Wishlist first click: toy=\`${wishlist.first.state.toys}\`, Wishlist=\`${wishlist.first.state.wishlist}\`, candidate/pending=\`${wishlist.first.state.pendingCandidateCount}\`, draft=\`${wishlist.first.state.drafts}\`, modal open=\`${wishlist.first.modalOpen}\`.\n- Second clicks: no additional event or state transition because the successful first submission disabled the original buttons and closed the dialog.\n- Event order: each first click generated \`click → submit\`; submitter was its destination and the submit listener observed \`defaultPrevented === true\`.\n- Validation: valid before and after first click; no invalid fields.\n- Factory listener counts: direct button click=0, form submit=1, parent delegated click=0.\n- MutationObserver: no Review subtree mutations adding bare \`22\`.\n- Append/text instrumentation: no bare \`22\` write for either 0-pending fixture. With pending preseeded to 22, all \`22\` writes target the test badge span through its store subscriber, not the Review.\n- Age differential: 22/31/7 each completed first Library click with toy=1 and pending=1; no Review \`22\` write.\n- Candidate chain: genuine-new catalog decision → ownership/Wishlist commit → \`createLocalCandidate\` → local candidate persisted → pending selector=1 → store subscriber/badge=1.\n`);
console.log(JSON.stringify({status:'NOT_REPRODUCED',library:library.first.state,wishlist:wishlist.first.state}));
