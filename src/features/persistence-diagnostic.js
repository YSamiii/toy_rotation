import { buildPersistenceSnapshot } from '../data/store.js';

const IMAGE_DB = 'toyRotationPhotosV04';

// Read-only field diagnostic for the exact situation where a device appears to
// have started fresh after a same-origin update.  It never opens a missing DB
// (which would create one), clears storage, or reads image bytes.
export async function buildPersistenceDiagnostic({ store, images = null, release = null } = {}) {
  // Prefer the boot-time snapshot: it preserves the exact pre-recovery source
  // classification instead of re-reading after a staged recovery has changed
  // the current projection.
  const base=store?.persistence?.diagnostic || buildPersistenceSnapshot({ hydratedState:store?.state || null, mode:store?.persistence?.status || 'unknown' });
  const databases=await listDatabases();
  const imageDatabase=databases.find(row=>row.name===IMAGE_DB) || null;
  const image=await inspectKnownImageDatabase(imageDatabase);
  let personalImageCount=null;
  let imageReadError=null;
  if (images && imageDatabase) {
    try { personalImageCount=(await images.listPersonalRecords()).length; }
    catch (error) { imageReadError=String(error?.message || error); }
  }
  return {
    format:'toy-rotation-persistence-diagnostic',
    diagnosticVersion:1,
    exportedAt:new Date().toISOString(),
    release:release || null,
    origin:globalThis.location?.origin || null,
    localStorageKeys:storageKeyNames(),
    indexedDb:{ databases, knownImageDatabase:image, personalImageCount, imageReadError },
    raw:base,
    recovery:{
      status:store?.persistence?.status || null,
      detected:store?.persistence?.recovery || base.recovery || null,
      executed:base.recoveryExecuted === true,
      diagnosticMode:store?.persistence?.diagnosticMode === true
    },
    hydrated:{
      toyCount:store?.state?.toys?.length || 0,
      profileCount:store?.state?.profile?.childName || store?.state?.profile?.childBirthDate ? 1 : 0,
      wishlistCount:store?.state?.wishlist?.length || 0,
      rotationHistoryCount:store?.state?.rotationHistory?.length || 0,
      persistenceStatus:store?.persistence?.status || null,
      writable:store?.canPersist === true
    },
    safety:{ readOnly:true, includesImageBytes:false, doesNotInitializeOrClearStorage:true }
  };
}

async function listDatabases() {
  try {
    if (typeof indexedDB === 'undefined' || typeof indexedDB.databases !== 'function') return [{ supported:false }];
    return (await indexedDB.databases()).map(row=>({ name:row.name || null, version:row.version ?? null }));
  } catch (error) { return [{ error:String(error?.message || error) }]; }
}

async function inspectKnownImageDatabase(database) {
  if (!database?.name) return { name:IMAGE_DB, present:false };
  try {
    const db=await new Promise((resolve,reject)=>{
      const request=indexedDB.open(IMAGE_DB);
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
    const stores=[...db.objectStoreNames];
    const counts={};
    await Promise.all(stores.map(storeName=>new Promise((resolve,reject)=>{
      const request=db.transaction(storeName,'readonly').objectStore(storeName).count();
      request.onsuccess=()=>{counts[storeName]=request.result;resolve();}; request.onerror=()=>reject(request.error);
    }))));
    const result={ name:IMAGE_DB, present:true, version:db.version, objectStores:stores, counts };
    db.close(); return result;
  } catch (error) { return { name:IMAGE_DB, present:true, error:String(error?.message || error) }; }
}

function storageKeyNames() {
  try { return Array.from({ length:localStorage.length },(_,index)=>localStorage.key(index)).filter(key=>String(key||'').startsWith('toyRotation')); }
  catch (error) { return [{ error:String(error?.message || error) }]; }
}
