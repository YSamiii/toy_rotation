const expectedBuildId='v0.11.6-rotation-cross-age-qa11-20260924';
const expectedCache='toy-rotation-v0.11.6-rotation-cross-age-qa11-20260924';
const key='lr-lock-key-clubhouse';
const fixture={schemaVersion:12,settings:{language:'en',rotationSize:6,rotationDays:7,onboardingDone:true},profile:{childName:'QA',childBirthDate:'2024-01-01'},wishlist:[],rotationHistory:[],catalogState:{tombstones:{},adminEdits:{},imageRefsByKey:{},imageRefsByIdentity:{},learnedEntries:[],remoteEntries:[],syncMetadata:{}},toys:[{id:'cross-age-toy',canonicalKey:key,brand:'Learning Resources',productName:'Lock & Key Clubhouse',sku:'LER9807',minAgeMonths:36,maxAgeMonths:72,categoryCode:'fine_motor',skillCodes:[],playMechanics:[]}]};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const stage=value=>{document.querySelector('#stage').textContent=value;};
const done=(status,data)=>{document.documentElement.dataset.gateStatus=status;document.querySelector('#result').textContent=JSON.stringify({status,...data},null,2);};
const loaded=frame=>new Promise((resolve,reject)=>{frame.addEventListener('load',resolve,{once:true});frame.addEventListener('error',()=>reject(new Error('iframe_load_error')),{once:true});});
async function ready(frame){for(let i=0;i<100;i+=1){const marker=JSON.parse(localStorage.getItem('toyRotation.startupDiagnostic')||'null');if(frame.contentDocument?.querySelector('button[data-view="library"]')&&frame.contentWindow?.TOY_ROTATION_CONFIG?.buildId===expectedBuildId&&marker?.phase==='hydrate-complete')return;await wait(100);}throw new Error('app_ready_timeout');}
async function editor(frame){frame.contentDocument.querySelector('button[data-view="library"]').click();for(let i=0;i<80;i+=1){const card=frame.contentDocument.querySelector('[data-toy-id="cross-age-toy"]');if(card){card.querySelector('[data-action="edit"]').click();const panel=frame.contentDocument.querySelector('.cross-age-approval');if(panel)return panel;}await wait(100);}throw new Error('approval_editor_timeout');}
async function run(){
  localStorage.setItem('toyRotation.cleanBaseline',JSON.stringify(fixture));
  const frame=document.createElement('iframe');document.querySelector('#app-host').append(frame);
  stage('initial load');let event=loaded(frame);frame.src='/index.html?qa11-cross-age-gate=1';await event;await ready(frame);
  stage('SW controlled reload');event=loaded(frame);frame.contentWindow.location.reload();await event;await ready(frame);
  const panel=await editor(frame);
  const initial={text:panel.textContent,allow:!!panel.querySelector('[data-cross-age-allow]'),approved:JSON.parse(localStorage.getItem('toyRotation.cleanBaseline')).crossAgeApprovals||{}};
  panel.querySelector('[data-cross-age-allow]')?.click();
  const approved=JSON.parse(localStorage.getItem('toyRotation.cleanBaseline')).crossAgeApprovals?.[key];
  const revokeVisible=!!panel.querySelector('[data-cross-age-revoke]');
  frame.contentDocument.querySelector('dialog[open] [data-close]')?.click();
  stage('approval survives reload');event=loaded(frame);frame.contentWindow.location.reload();await event;await ready(frame);
  const reloadedPanel=await editor(frame);const reloadApproved=!!reloadedPanel.querySelector('[data-cross-age-revoke]');
  reloadedPanel.querySelector('[data-cross-age-revoke]')?.click();
  const revoked=!JSON.parse(localStorage.getItem('toyRotation.cleanBaseline')).crossAgeApprovals?.[key];
  const allowAgain=!!reloadedPanel.querySelector('[data-cross-age-allow]');
  const cacheNames=await caches.keys();const staleCaches=cacheNames.filter(name=>name.startsWith('toy-rotation-')&&name!==expectedCache);
  const log=await (await fetch('/__qa7-r2-harness/request-log.json')).json();
  const missing=log.filter(row=>row.status===404&&row.requested!=='/favicon.ico');const staleModules=log.filter(row=>/^\/src\/.*\.js$/.test(row.requested));
  const pass=initial.allow&&!Object.keys(initial.approved).length&&!!approved&&approved.canonicalKey===key&&revokeVisible&&reloadApproved&&revoked&&allowAgain&&!!frame.contentWindow.navigator.serviceWorker.controller&&cacheNames.includes(expectedCache)&&!staleCaches.length&&!missing.length&&!staleModules.length;
  done(pass?'PASS':'FAIL',{buildId:frame.contentWindow.TOY_ROTATION_CONFIG?.buildId,initial,approved,revokeVisible,reloadApproved,revoked,allowAgain,serviceWorkerControlled:!!frame.contentWindow.navigator.serviceWorker.controller,cacheNames,staleCaches,missing,staleModules});
}
run().catch(error=>done('FAIL',{stage:document.querySelector('#stage').textContent,error:String(error?.stack||error)}));
