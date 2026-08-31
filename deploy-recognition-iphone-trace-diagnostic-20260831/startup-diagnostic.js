const output=document.querySelector('#output');
const phase=document.querySelector('#phase');
const errorNode=document.querySelector('#error');
const result={ diagnosticVersion:2, timestamp:new Date().toISOString(), url:location.href, origin:location.origin, displayMode:matchMedia('(display-mode: standalone)').matches || navigator.standalone === true, startupMarker:null, serviceWorker:null, assets:[], runtimeManifest:null, runtimeAssetIdentity:[], localStorage:null, errors:[] };
const timeout=(label,promise,ms=4500)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(`${label}_timeout`)),ms))]);
const sha256=async bytes=>{
  if (!globalThis.crypto?.subtle) return null;
  const hash=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(hash)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
};
const inspectResponse=async path=>{
  const entry={ path, resolvedUrl:new URL(path,location.href).href };
  try {
    const response=await timeout(`fetch_${path}`,fetch(path,{ cache:'no-store', credentials:'same-origin' }));
    const bytes=await timeout(`read_${path}`,response.arrayBuffer());
    const text=new TextDecoder().decode(bytes.slice(0,256));
    entry.status=response.status; entry.ok=response.ok; entry.contentType=response.headers.get('content-type') || ''; entry.length=bytes.byteLength; entry.sha256=await sha256(bytes); entry.startsWithHtml=/^\s*<!doctype html|^\s*<html/i.test(text); entry.suspiciousJavaScript=path.endsWith('.js') && entry.startsWithHtml;
  } catch(error) { entry.error=String(error?.message || error); }
  return entry;
};
const inspect=async()=>{
  phase.textContent='Checking startup markers and critical assets…';
  try { result.startupMarker=JSON.parse(localStorage.getItem('toyRotation.startupDiagnostic') || 'null'); result.localStorage={ available:true }; } catch(error) { result.localStorage={ available:false, error:String(error?.message || error) }; }
  try {
    const registration=await timeout('service_worker_get_registration',navigator.serviceWorker?.getRegistration?.() || Promise.resolve(null));
    result.serviceWorker={ supported:'serviceWorker' in navigator, controller:!!navigator.serviceWorker?.controller, scope:registration?.scope || null, active:registration?.active?.scriptURL || null, waiting:registration?.waiting?.scriptURL || null };
  } catch(error) { result.serviceWorker={ supported:'serviceWorker' in navigator, error:String(error?.message || error) }; }
  const paths=['./','./index.html','./config.js','./src/main.js','./src/ui/app.css','./manifest.webmanifest','./sw.js'];
  result.assets=await Promise.all(paths.map(inspectResponse));
  const manifestEntry=await inspectResponse('./runtime-js-manifest.json');
  result.runtimeManifest={ ...manifestEntry, parsed:false };
  if (manifestEntry.ok && !manifestEntry.startsWithHtml) {
    try {
      const response=await timeout('fetch_runtime_manifest',fetch('./runtime-js-manifest.json',{ cache:'no-store', credentials:'same-origin' }));
      const manifest=JSON.parse(await timeout('parse_runtime_manifest',response.text()));
      result.runtimeManifest.parsed=true; result.runtimeManifest.fileCount=manifest.files?.length || 0; result.runtimeManifest.target=manifest.target || null;
      result.runtimeAssetIdentity=await Promise.all((manifest.files || []).map(async file=>{
        const actual=await inspectResponse(file.resolvedDeployPath || `./${file.path}`);
        return { ...actual, expectedSha256:file.sha256, expectedBytes:file.bytes, hashMatches:actual.sha256 ? actual.sha256===file.sha256 : null, byteLengthMatches:typeof actual.length==='number' ? actual.length===file.bytes : null, importedBy:file.importedBy || [] };
      }));
      result.runtimeManifest.deployedAssetMismatch=result.runtimeAssetIdentity.some(asset=>asset.hashMatches===false || asset.byteLengthMatches===false);
    } catch(error) { result.runtimeManifest.error=String(error?.message || error); }
  }
  phase.textContent='Inspection complete — export is ready.'; output.textContent=JSON.stringify(result,null,2);
};
const exportResult=()=>{ const blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'}); const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download=`toy-rotation-startup-diagnostic-${new Date().toISOString().replace(/[:.]/g,'-')}.json`; link.click(); setTimeout(()=>URL.revokeObjectURL(link.href),0); };
document.querySelector('#export').addEventListener('click',exportResult);
inspect().catch(error=>{ result.errors.push(String(error?.message || error)); errorNode.hidden=false; errorNode.textContent=String(error?.message || error); output.textContent=JSON.stringify(result,null,2); phase.textContent='Partial diagnostic ready.'; });
