import { IMAGE_DB, LEGACY_KEYS, PRIMARY_KEY, RECOVERY_STAGING_KEY, STARTUP_MARKER_KEY, classifyRawPersistence, inspectRawPersistence } from './src/features/standalone-storage-diagnostic-core.js';

const startedAt=Date.now();
const diagnostic={ format:'toy-rotation-standalone-persistence-diagnostic', diagnosticVersion:2, exportedAt:null, startedAt:new Date().toISOString(), origin:location.origin, appBuild:'v0.11.5 iPhone QA Candidate 20260903', cacheMarker:null, recoveryExecuted:false, writes:{ localStorage:0, indexedDb:0, catalog:0, worker:0 }, phases:[], current:null, legacy:[], recoveryStaging:null, classification:null, indexedDb:null, cache:null, startupMarker:null, errors:[] };
const phaseNode=document.querySelector('#phase'), elapsedNode=document.querySelector('#elapsed'), summaryNode=document.querySelector('#summary'), classificationNode=document.querySelector('#classification'), fatalNode=document.querySelector('#fatal');
const tick=setInterval(()=>{ elapsedNode.textContent=`Elapsed: ${((Date.now()-startedAt)/1000).toFixed(1)}s`; },100);

function phase(name, detail='') { diagnostic.phases.push({ name, at:new Date().toISOString(), detail:detail || null }); phaseNode.textContent=`Phase: ${name}${detail ? ` — ${detail}` : ''}`; renderSummary(); }
function recordError(stage,error) { const message=String(error?.message || error); diagnostic.errors.push({ stage, message, at:new Date().toISOString() }); fatalNode.hidden=false; fatalNode.textContent=`${stage}: ${message}`; }
function readRaw(key) { try { return localStorage.getItem(key); } catch(error) { recordError(`localStorage:${key}`,error); return undefined; } }
function renderSummary() { const compact={ classification:diagnostic.classification, current:diagnostic.current, legacy:diagnostic.legacy, recoveryStaging:diagnostic.recoveryStaging, indexedDb:diagnostic.indexedDb, cache:diagnostic.cache, startupMarker:diagnostic.startupMarker, writes:diagnostic.writes, errors:diagnostic.errors }; summaryNode.textContent=JSON.stringify(compact,null,2); }
function withTimeout(label, promise, milliseconds=2500) { return Promise.race([Promise.resolve().then(()=>promise),new Promise((_,reject)=>setTimeout(()=>reject(new Error(`${label}_timeout_after_${milliseconds}ms`)),milliseconds))]); }

async function inspect() {
  phase('localStorage inspection');
  diagnostic.current=inspectRawPersistence(PRIMARY_KEY,readRaw(PRIMARY_KEY));
  diagnostic.legacy=LEGACY_KEYS.map(key=>inspectRawPersistence(key,readRaw(key)));
  diagnostic.recoveryStaging=inspectRawPersistence(RECOVERY_STAGING_KEY,readRaw(RECOVERY_STAGING_KEY));
  diagnostic.startupMarker=inspectRawPersistence(STARTUP_MARKER_KEY,readRaw(STARTUP_MARKER_KEY));
  diagnostic.classification=classifyRawPersistence({ current:diagnostic.current, legacy:diagnostic.legacy });
  phase('cache marker inspection');
  diagnostic.cache=await inspectCaches();
  diagnostic.cacheMarker=diagnostic.cache?.names?.find(name=>name.includes('toy-rotation')) || null;
  phase('IndexedDB inspection');
  diagnostic.indexedDb=await inspectImageDb();
  phase('complete');
  classificationNode.textContent=`${diagnostic.classification.code} — ${diagnostic.classification.label}`;
  classificationNode.className=diagnostic.classification.code==='A'?'ok':diagnostic.classification.code==='B'?'warn':'error';
  renderSummary(); clearInterval(tick);
}

async function inspectCaches() {
  try { return { status:'ok', names:await withTimeout('cache_keys',caches.keys()) }; }
  catch(error) { recordError('cache_keys',error); return { status:error.message.includes('timeout')?'timeout':'error', error:String(error.message || error), names:[] }; }
}

async function inspectImageDb() {
  if (!globalThis.indexedDB?.databases) return { database:IMAGE_DB, status:'unsupported_no_open_to_avoid_database_creation' };
  let databases;
  try { databases=await withTimeout('indexeddb_databases',indexedDB.databases()); }
  catch(error) { recordError('indexeddb_databases',error); return { database:IMAGE_DB, status:error.message.includes('timeout')?'timeout':'error', error:String(error.message || error) }; }
  const found=(databases || []).find(row=>row.name===IMAGE_DB);
  if (!found) return { database:IMAGE_DB, status:'not_listed', databases:(databases || []).map(row=>({ name:row.name || null, version:row.version ?? null })) };
  let db;
  try {
    db=await withTimeout('indexeddb_open',new Promise((resolve,reject)=>{ const request=indexedDB.open(IMAGE_DB); request.onupgradeneeded=()=>{try{request.transaction.abort();}catch{} reject(new Error('unexpected_indexeddb_upgrade_blocked'));}; request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error || new Error('indexeddb_open_error')); request.onblocked=()=>reject(new Error('indexeddb_open_blocked')); }));
    const stores=[...db.objectStoreNames];
    if (!stores.includes('photos')) return { database:IMAGE_DB, status:'opened_photos_store_missing', version:db.version, stores };
    const photoCount=await withTimeout('indexeddb_photos_count',new Promise((resolve,reject)=>{ const request=db.transaction('photos','readonly').objectStore('photos').count(); request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error || new Error('indexeddb_count_error')); }));
    return { database:IMAGE_DB, status:'ok', version:db.version, stores, photosStoreExists:true, photosCount:photoCount, databases:(databases || []).map(row=>({ name:row.name || null, version:row.version ?? null })) };
  } catch(error) { recordError('indexeddb',error); return { database:IMAGE_DB, status:error.message.includes('timeout')?'timeout':'error', error:String(error.message || error), databases:(databases || []).map(row=>({ name:row.name || null, version:row.version ?? null })) }; }
  finally { try { db?.close(); } catch {} }
}

function download(value, filename) { const blob=new Blob([JSON.stringify(value,null,2)],{ type:'application/json' }); const url=URL.createObjectURL(blob); const anchor=document.createElement('a'); anchor.href=url; anchor.download=filename; anchor.click(); setTimeout(()=>URL.revokeObjectURL(url),0); }
function stamp() { return new Date().toISOString().replace(/[:.]/g,'-'); }
document.querySelector('#export-diagnostic').addEventListener('click',()=>{ diagnostic.exportedAt=new Date().toISOString(); download(diagnostic,`toy-rotation-persistence-diagnostic-${stamp()}.json`); });
document.querySelector('#export-raw').addEventListener('click',()=>{ const raw={ format:'toy-rotation-raw-persistence-backup', exportedAt:new Date().toISOString(), origin:location.origin, recoveryExecuted:false, primary:{ key:PRIMARY_KEY, raw:readRaw(PRIMARY_KEY) }, legacy:Object.fromEntries(LEGACY_KEYS.map(key=>[key,readRaw(key)])), recoveryStaging:{ key:RECOVERY_STAGING_KEY, raw:readRaw(RECOVERY_STAGING_KEY) } }; download(raw,`toy-rotation-raw-persistence-backup-${stamp()}.json`); });
window.addEventListener('error',event=>recordError('standalone_page_error',event.error || event.message));
window.addEventListener('unhandledrejection',event=>recordError('standalone_page_rejection',event.reason));
window.__TOY_ROTATION_STANDALONE_DIAGNOSTIC__={ diagnostic, inspect };
inspect().catch(error=>{ recordError('inspection_fatal',error); phase('complete_with_error'); clearInterval(tick); });
