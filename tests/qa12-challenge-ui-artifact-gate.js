const build='v0.11.6-challenge-toy-ui-qa12-20260924',cache='toy-rotation-v0.11.6-challenge-toy-ui-qa12-20260924';
const keys=['lr-lock-key-clubhouse','mideer-reusable-jelly-sticker-busy-animal-town','smartgames-bunny-boo'];
const toy=(id,key,name,brand,age)=>({id,canonicalKey:key,productName:name,brand,minAgeMonths:age,maxAgeMonths:72,categoryCode:'fine_motor',skillCodes:[],playMechanics:[]});
const fixture={schemaVersion:12,settings:{language:'en',rotationSize:6,rotationDays:7,onboardingDone:true},profile:{childName:'QA',childBirthDate:'2025-02-01'},wishlist:[],rotationHistory:[],catalogState:{tombstones:{},adminEdits:{},imageRefsByKey:{},imageRefsByIdentity:{},learnedEntries:[],remoteEntries:[],syncMetadata:{}},toys:[toy('one',keys[0],'Lock & Key Clubhouse','Learning Resources',36),toy('two',keys[1],'Reusable Jelly Sticker: The Busy Animal Town','Mideer',36),toy('three',keys[2],'Bunny Boo','SmartGames',24),toy('unknown','hape-creative-peg-puzzle-farm','Creative Peg Puzzle: Farm','Hape',24),toy('hard','hape-clean-up-bucket-set','Clean Up Bucket Set','Hape',36)]};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const done=(status,data)=>{document.documentElement.dataset.gateStatus=status;document.querySelector('#result').textContent=JSON.stringify({status,...data},null,2);};
const step=value=>document.querySelector('#stage').textContent=value;
const loaded=frame=>new Promise((resolve,reject)=>{frame.addEventListener('load',resolve,{once:true});frame.addEventListener('error',()=>reject(new Error('iframe_load_error')),{once:true});});
async function ready(frame){for(let i=0;i<100;i+=1){const marker=JSON.parse(localStorage.getItem('toyRotation.startupDiagnostic')||'null');if(frame.contentDocument?.querySelector('button[data-view="rotation"]')&&frame.contentWindow?.TOY_ROTATION_CONFIG?.buildId===build&&marker?.phase==='hydrate-complete')return;await wait(100);}throw new Error('app_ready_timeout');}
function go(doc,name){doc.querySelector(`button[data-view="${name}"]`).click();}
function edit(doc,id){doc.querySelector(`[data-toy-id="${id}"] [data-action="edit"]`).click();return doc.querySelector('dialog[open]');}
function close(doc){doc.querySelector('dialog[open] [data-close]').click();}
async function run(){
  localStorage.setItem('toyRotation.cleanBaseline',JSON.stringify(fixture));
  const frame=document.createElement('iframe');document.querySelector('#app-host').append(frame);
  step('load');let event=loaded(frame);frame.src='/index.html?qa12-challenge-ui=1';await event;await ready(frame);
  step('SW reload');event=loaded(frame);frame.contentWindow.location.reload();await event;await ready(frame);
  const doc=frame.contentDocument;go(doc,'rotation');
  const entry=doc.querySelector('.challenge-entry');
  const initialEntry={visible:!!entry,text:entry?.textContent||''};
  entry?.querySelector('[data-action="challenge-settings"]')?.click();
  const modal=doc.querySelector('dialog[open]');
  const initialKeys=[...modal.querySelectorAll('[data-challenge-key]')].map(row=>row.dataset.challengeKey);
  const images=[...modal.querySelectorAll('[data-challenge-key] img')].length;
  modal.querySelector(`[data-challenge-key="${keys[0]}"] [data-challenge-action="allow"]`)?.click();
  const modalAllowed=modal.querySelector(`[data-challenge-key="${keys[0]}"]`)?.dataset.challengeChoice;
  const entryAfterAllow=doc.querySelector('.challenge-entry')?.textContent||'';
  close(doc);go(doc,'library');
  const cardAllowed=doc.querySelector('[data-toy-id="one"] .challenge-chip')?.dataset.challengeChoice;
  const blockedBadges=['unknown','hard'].map(id=>!!doc.querySelector(`[data-toy-id="${id}"] .challenge-chip`));
  const detail=edit(doc,'one');const detailAllowed=!!detail.querySelector('[data-cross-age-revoke]');
  detail.querySelector('[data-cross-age-revoke]')?.click();
  const detailRevoked=!!detail.querySelector('[data-cross-age-allow]');
  const cardRevoked=doc.querySelector('[data-toy-id="one"] .challenge-chip')?.dataset.challengeChoice;
  close(doc);
  const unknownDetail=edit(doc,'unknown');const unknownBlocked=!!unknownDetail.querySelector('.cross-age-approval')&&!unknownDetail.querySelector('[data-cross-age-allow]');close(doc);
  const hardDetail=edit(doc,'hard');const hardBlocked=!!hardDetail.querySelector('.cross-age-approval')&&!hardDetail.querySelector('[data-cross-age-allow]');close(doc);
  go(doc,'rotation');doc.querySelector('.challenge-entry [data-action="challenge-settings"]').click();
  const list=doc.querySelector('dialog[open]');list.querySelector(`[data-challenge-key="${keys[1]}"] [data-challenge-action="decline"]`)?.click();
  const declined=list.querySelector(`[data-challenge-key="${keys[1]}"]`)?.dataset.challengeChoice;close(doc);
  step('reopen');event=loaded(frame);frame.contentWindow.location.reload();await event;await ready(frame);
  const refreshed=frame.contentDocument;go(refreshed,'rotation');refreshed.querySelector('.challenge-entry [data-action="challenge-settings"]').click();
  const reopenList=refreshed.querySelector('dialog[open]');const reopenDeclined=reopenList.querySelector(`[data-challenge-key="${keys[1]}"]`)?.dataset.challengeChoice;
  const reopenPending=reopenList.querySelector(`[data-challenge-key="${keys[0]}"]`)?.dataset.challengeChoice;
  const caches=await window.caches.keys();const stale=caches.filter(name=>name.startsWith('toy-rotation-')&&name!==cache);
  const requests=await (await fetch('/__qa7-r2-harness/request-log.json')).json();
  const missing=requests.filter(row=>row.status===404&&row.requested!=='/favicon.ico');
  const sourceModules=requests.filter(row=>/^\/src\/.*\.js$/.test(row.requested));
  const pass=initialEntry.visible&&initialEntry.text.includes('3 toys')&&initialKeys.length===3&&keys.every(key=>initialKeys.includes(key))&&images===3&&modalAllowed==='allowed'&&entryAfterAllow.includes('1 allowed')&&cardAllowed==='allowed'&&!blockedBadges.some(Boolean)&&detailAllowed&&detailRevoked&&cardRevoked==='pending'&&unknownBlocked&&hardBlocked&&declined==='declined'&&reopenDeclined==='declined'&&reopenPending==='pending'&&!!frame.contentWindow.navigator.serviceWorker.controller&&caches.includes(cache)&&!stale.length&&!missing.length&&!sourceModules.length;
  done(pass?'PASS':'FAIL',{buildId:frame.contentWindow.TOY_ROTATION_CONFIG?.buildId,initialEntry,initialKeys,images,modalAllowed,entryAfterAllow,cardAllowed,blockedBadges,detailAllowed,detailRevoked,cardRevoked,unknownBlocked,hardBlocked,declined,reopenDeclined,reopenPending,serviceWorkerControlled:!!frame.contentWindow.navigator.serviceWorker.controller,caches,stale,missing,sourceModules});
}
run().catch(error=>done('FAIL',{stage:document.querySelector('#stage').textContent,error:String(error?.stack||error)}));
