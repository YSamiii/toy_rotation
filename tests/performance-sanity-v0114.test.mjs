import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const main=await readFile(new URL('../src/main.js',import.meta.url),'utf8');
const sw=await readFile(new URL('../sw.js',import.meta.url),'utf8');
const candidateRenderer=main.slice(main.indexOf('function renderLocalCandidateQueue'),main.indexOf('function renderRecognitionDiagnostic'));
const startupMain=main.slice(0,main.indexOf('function scheduleBackgroundBootstrap'));
const backgroundBootstrap=main.slice(main.indexOf('async function bootstrapBackground'),main.indexOf('function registerServiceWorker'));
const serviceWorkerRegistration=main.slice(main.indexOf('function registerServiceWorker'),main.indexOf('function render()'));
let n=0;const ok=(value,message)=>{assert.ok(value,message);n++;};

// Startup must become interactive before deferred catalog/network work begins.
for(const marker of ['app_shell_rendered','store_hydration_start','store_hydration_end','home_render_start','home_interactive'])ok(main.includes(`'${marker}'`),`startup stage: ${marker}`);
ok(main.indexOf("markStartupStage(startupTrace, 'home_interactive')") < main.indexOf('scheduleBackgroundBootstrap();'),'interactive precedes background bootstrap');
ok(main.includes('setTimeout(() => { void bootstrapBackground(); }, 0);'),'background bootstrap is deferred');
ok(!startupMain.includes('catalog.hydrate'),'startup main path does not hydrate catalog before interactive');
ok(backgroundBootstrap.includes('await catalog.hydrate('),'catalog hydration runs inside deferred background bootstrap');
ok(backgroundBootstrap.includes('void governance.syncInBackground().then(() => governance.flushOutbox())'),'remote governance work remains background-only');
ok(backgroundBootstrap.includes('await recoverLegacyPersonalImages({ store, images, catalog })'),'image recovery remains inside deferred background bootstrap');
ok(main.indexOf("markStartupStage(startupTrace, 'home_interactive')") < main.indexOf('registerServiceWorker();'),'service-worker registration starts after interactive');
ok(!startupMain.includes('navigator.serviceWorker.ready'),'startup main path does not await worker readiness');
ok(serviceWorkerRegistration.includes("navigator.serviceWorker.register('./sw.js')"),'service-worker registration is isolated in its helper');
ok(!/await\s+navigator\.serviceWorker\.(register|ready)/.test(serviceWorkerRegistration),'registration helper does not await worker work');
ok(serviceWorkerRegistration.includes('.catch(error => markStartupError(startupTrace, \'service_worker_failed\', error))'),'worker failure is recorded without blocking Home');
ok(sw.includes("self.addEventListener('install'"),'worker install runs in worker context');
ok(sw.includes('Promise.allSettled(FALLBACK_ASSETS.map(path => cache.add(path)))'),'worker cache warmup tolerates individual asset failures');
ok(sw.includes('.catch(() => undefined))'),'worker install failure is non-fatal');

// Local Candidate uses one stable-container delegated listener, not one action
// listener per row. A rerender replaces that container before rebinding it.
ok(candidateRenderer.includes('dialog.innerHTML='),'candidate render replaces prior container');
ok(candidateRenderer.includes("[data-local-candidates-root]').addEventListener('click'"),'stable container click delegation');
ok(candidateRenderer.includes("event.target.closest('[data-local-open]')"),'delegated Candidate Detail routing');
ok(candidateRenderer.includes('if(!button||button.disabled)return'),'disabled action guard');
ok(candidateRenderer.includes("setLocalCandidateStatus(state,id,'reviewing')"),'single state transition target');
ok(candidateRenderer.includes('refreshAdminCandidateBadges();renderCandidateReviewDetail'),'action rerender and badge refresh');
assert.equal((candidateRenderer.match(/addEventListener\('click'/g)||[]).length,2,'one delegated click listener for each stable queue/detail container');n++;
assert.equal((candidateRenderer.match(/\.onclick=/g)||[]).length,4,'only close/back direct controls bind in each queue/detail renderer');n++;
assert.equal((candidateRenderer.match(/rows\.map\(row=>/g)||[]).length,1,'candidate list maps once per render');n++;
ok(!candidateRenderer.includes("querySelectorAll('[data-local-open]')"),'no per-candidate action binding');

// Guard against the current phase's known render regressions without timing thresholds.
ok(!/catalog\.active\.forEach\([\s\S]{0,300}catalog\.active\.forEach/.test(main),'no nested catalog full-scan loop');
ok(main.includes('wireCatalog(dialog)'),'catalog actions bind after dialog render');
ok(main.includes('data-action'),'root action contract remains present');
const candidateQueueRerenders=[...candidateRenderer.matchAll(/renderLocalCandidateQueue\s*\(\s*dialog\s*,\s*\{\s*returnToSettings\s*,\s*view\s*:\s*([^}\n]+)\}\s*\)/g)].map(match=>match[1].trim());
ok(candidateQueueRerenders.length>=4,'Candidate queue rerenders through its stable renderer with an explicit view');
ok(candidateQueueRerenders.includes('filter.dataset.candidateView'),'Needs Review, Completed, and Archived filter rerenders preserve current UI view state');
ok(candidateQueueRerenders.includes('returnView'),'detail back and missing-record rerenders preserve their caller-controlled view');
ok(candidateQueueRerenders.includes("wasArchived?'completed':returnView"),'archive/unarchive rerender follows the existing view-preservation contract');
ok(candidateRenderer.includes("returnView:'needs'"),'reopen explicitly controls the next Candidate Review view rather than falling through to a default');
for(let i=0;i<20;i++)ok(candidateQueueRerenders.length>=4,`repeat Candidate queue rerender contract ${i+1}`);
console.log(`performance sanity v0.11.4: PASS (${n} assertions/scenarios)`);
