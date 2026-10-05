const expectedBuildId = 'v0.11.6-iphone-qa7-r2-20260918';
const expectedCache = 'toy-rotation-v0.11.6-iphone-qa7-r2-20260918';
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const stage = value => { document.documentElement.dataset.gateStage = value; document.querySelector('#stage').textContent = `Stage: ${value}`; };
const complete = (status, data) => { document.documentElement.dataset.gateStatus = status; document.querySelector('#result').textContent = JSON.stringify({status, ...data}, null, 2); };
const load = frame => new Promise((resolve, reject) => { frame.addEventListener('load', resolve, {once:true}); frame.addEventListener('error', () => reject(new Error('app_iframe_load_failed')), {once:true}); });
async function run() {
  stage('app-load');
  const frame = document.querySelector('#actual-app'); const loaded = load(frame); frame.src = '/index.html?qa7-r2-runtime-integrity=1'; await loaded;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (frame.contentWindow?.TOY_ROTATION_CONFIG?.buildId === expectedBuildId) break;
    await wait(100);
  }
  const config = frame.contentWindow?.TOY_ROTATION_CONFIG || null;
  if (config?.buildId !== expectedBuildId) throw new Error('unexpected_build_identity');
  stage('service-worker-ready');
  const registration = await navigator.serviceWorker.ready;
  const cacheNames = await caches.keys();
  stage('manifest-verify');
  const manifestResponse = await fetch('/runtime-js-manifest.json', {cache:'no-store'});
  const manifest = await manifestResponse.json();
  const targets = (Array.isArray(manifest.files) ? manifest.files : []).map(entry => typeof entry === 'string' ? entry : entry.path).filter(Boolean);
  const targetResults = await Promise.all(targets.map(async path => {
    const response = await fetch(`/${path}`, {cache:'no-store'});
    return {path, status:response.status, contentType:response.headers.get('content-type') || ''};
  }));
  const badTargets = targetResults.filter(row => row.status !== 200);
  const staleCache = cacheNames.filter(name => /qa6|iphone-qa7(?!-r2)/i.test(name));
  const pass = manifestResponse.status === 200 && targets.length > 0 && badTargets.length === 0 && cacheNames.includes(expectedCache) && staleCache.length === 0 && registration.active?.scriptURL.endsWith('/sw.js');
  const diagnostics = {config, expectedBuildId, expectedCache, registration:registration.active?.scriptURL || null, cacheNames, staleCache, manifestTargets:targets.length, badTargets, targetResults};
  complete(pass ? 'PASS' : 'FAIL', diagnostics);
  if (!pass) return;
}
stage('boot'); run().catch(error => { if (document.documentElement.dataset.gateStatus !== 'PASS') complete('FAIL',{stage:document.documentElement.dataset.gateStage,error:String(error?.stack || error)}); });
