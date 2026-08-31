import { createRestoreTrace, exportBackup, restoreBackup } from './data/backup-service.js';
import { ImageRepository } from './data/image-repository.js';
import { CATEGORY_CODES, SKILL_CODES, canonicalKey, normalizeToy, normalizeWishlistItem } from './data/schema.js';
import { applyDetectedLegacyRecovery, auditStandardCatalogImages, auditToyLibraryImages, bootStore, recoverLegacyPersonalImages, repairFakePersonalPlaceholderBindings, startFreshStore } from './data/store.js';
import { CatalogRepository } from './domain/catalog-repository.js';
import { resolvedLibraryImageRef } from './domain/catalog-presentation.js';
import { findDuplicates, auditIdentityRelationships, isActionableDuplicate } from './domain/duplicate-engine.js';
import { addCatalogToy, deleteToyOwnership, parentDeleteImpact, setToyInterest } from './domain/library-service.js';
import { findOwnedToy, findWishlistItem, mergePersonalToyPair } from './domain/identity-service.js';
import { auditSetIntegrity, classifyStructureMigrationDamage, repairStructureMigrationDamage } from './domain/set-service.js';
import { childAgeMonths as calculateChildAgeMonths, reassessmentState, saveProfileAndRotationSettings } from './domain/profile-service.js';
import { clearManualShelfOverrides, currentShelfCollections, isRotationPaused, isUserCustomPermanent, normalizeCurrentShelf, persistRotationSelection, selectRotation, setCustomPermanent, setManualShelfState, setRotationParticipation } from './domain/rotation-engine.js';
import { SubstitutionEngine } from './domain/substitution-engine.js';
import { AdminService } from './features/admin-service.js';
import { RecognitionService } from './features/recognition-service.js';
import { SharedCatalogGovernance } from './features/shared-catalog-governance.js';
import { buildDataRepairDiagnostic, diagnosticLifecycleSnapshot } from './features/data-repair-diagnostic.js';
import { buildPersistenceDiagnostic } from './features/persistence-diagnostic.js';
import { buildRestoreDiagnostic } from './features/restore-diagnostic.js';
import { IMAGE_RESOLVER_BUILD_MARKER, RuntimeImageDiagnostics } from './features/runtime-image-diagnostic.js';
import { beginStartupTrace, completeStartupWatchdog, installStartupWatchdog, markStartupError, markStartupStage, renderStartupShell } from './features/startup-trace.js';
import { createI18n, localizePlayMechanism } from './ui/i18n.js';
import { ModalManager } from './ui/modal-manager.js';
import { attachImageEditor, attachPersonalImageEditor } from './ui/personal-image-editor.js';

const root = document.querySelector('#app');
const STARTUP_DIAGNOSTIC_KEY='toyRotation.startupDiagnostic';
// This hook is installed inline in index.html, before config.js and this
// module are requested.  It is intentionally independent of every imported
// application module, so a failed module graph still replaces the static
// spinner with a usable error/diagnostic screen.
const earlyStartup=window.__TOY_ROTATION_EARLY_STARTUP__;
earlyStartup?.mark('main_loaded');
earlyStartup?.mark('module_bootstrap_started');
function recordStartupPhase(phase, details = null) {
  try { localStorage.setItem(STARTUP_DIAGNOSTIC_KEY, JSON.stringify({ phase, details, at:new Date().toISOString(), release:window.TOY_ROTATION_CONFIG?.RELEASE || null })); } catch {}
}
recordStartupPhase('shell');
const startupTrace = beginStartupTrace(window);
const standaloneMode=window.matchMedia?.('(display-mode: standalone)')?.matches || navigator.standalone === true;
markStartupStage(startupTrace, 'display_mode_detected', { standalone:standaloneMode, href:location.href });
window.addEventListener('pageshow', event => markStartupStage(startupTrace, 'pageshow', { persisted:event.persisted === true }));
window.addEventListener('pagehide', event => markStartupStage(startupTrace, 'pagehide', { persisted:event.persisted === true }));
document.addEventListener('visibilitychange', () => markStartupStage(startupTrace, 'visibility_change', { visibility:document.visibilityState }));
markStartupStage(startupTrace, 'main_js_loaded');
earlyStartup?.mark('bootstrap_started');
markStartupStage(startupTrace, 'image_asset_manifest_loaded');
renderStartupShell(root, navigator.language);
markStartupStage(startupTrace, 'app_shell_rendered');
const startupWatchdog = installStartupWatchdog(root, startupTrace, { delayMs:6000 });

markStartupStage(startupTrace, 'store_hydration_start');
earlyStartup?.mark('persistence_probe_started');
recordStartupPhase('persistent-read-start');
let store;
try {
  store = bootStore({ onStage:(stage, details) => {
    markStartupStage(startupTrace, stage, details);
    if (stage === 'migrations_start') earlyStartup?.mark('migration_started');
    if (stage === 'migrations_end') earlyStartup?.mark('migration_finished');
  } });
} catch (error) {
  // A synchronous boot exception must never strand an installed PWA on the
  // static shell. bootStore already catches persistence failures; this is the
  // final fail-open boundary for an unexpected module/runtime error.
  markStartupError(startupTrace, 'store_boot_unhandled_failure', error);
  store = bootStore({ diagnosticMode:true, onStage:(stage, details) => markStartupStage(startupTrace, stage, details) });
}
markStartupStage(startupTrace, 'store_hydration_end');
earlyStartup?.mark('persistence_probe_finished', { status:store.persistence.status });
recordStartupPhase('persistent-read-complete', { status:store.persistence.status });
const shelfProbe = structuredClone(store.state);
const shelfRepair = normalizeCurrentShelf(shelfProbe);
if (shelfRepair.changed && store.canPersist) store.update(state => { normalizeCurrentShelf(state); }, 'current-shelf-active-normalization');
const diagnosticLifecycle = [diagnosticLifecycleSnapshot(store.state, 'bootstrap_after_migration', 'bootStore')];
store.subscribe((state, reason) => {
  diagnosticLifecycle.push(diagnosticLifecycleSnapshot(state, 'store_update', reason));
  if (diagnosticLifecycle.length > 100) diagnosticLifecycle.shift();
});
const catalog = new CatalogRepository(store, { baseUrl: window.TOY_ROTATION_CONFIG?.API_BASE });
const images = new ImageRepository();
const runtimeImageDiagnostics = new RuntimeImageDiagnostics({ release:window.TOY_ROTATION_CONFIG?.RELEASE });
runtimeImageDiagnostics.installCatalogLookupProbe(catalog);
const i18n = createI18n(store);
const substitution = new SubstitutionEngine();
const admin = new AdminService({ store, catalog });
const governance = new SharedCatalogGovernance({ store, catalog, baseUrl: window.TOY_ROTATION_CONFIG?.API_BASE });
let recognition = null;
const getRecognition = () => recognition ||= new RecognitionService({ store, images, catalog, governance });
const modalManager = new ModalManager();
let view = 'home';
let onboardingQueued = false;
const libraryFilters = { query:'', brand:'', categoryCode:'', skillCode:'', playMechanic:'', status:'', ageFit:'' };
const wishlistFilters = { query:'', brand:'', categoryCode:'', skillCode:'', playMechanic:'', priority:'', status:'', ageFit:'', sort:'priority' };
const systemTheme = matchMedia('(prefers-color-scheme: dark)');

store.subscribe(render);
systemTheme.addEventListener?.('change', () => { if (store.state.settings.theme === 'system') applyTheme(); });
markStartupStage(startupTrace, 'ai_service_deferred', { activation:'user_action' });
markStartupStage(startupTrace, 'home_render_start');
earlyStartup?.mark('first_render_started');
recordStartupPhase('render-start');
captureLoveveryImageSweep('pre_catalog_hydrate');
render();
recordStartupPhase('render-complete');
earlyStartup?.complete();
installSingleLineEnterCompletion(document);
setupScrollTop();
requestAnimationFrame(() => {
  markStartupStage(startupTrace, 'first_meaningful_paint');
  markStartupStage(startupTrace, 'home_interactive');
  completeStartupWatchdog(startupWatchdog);
  scheduleBackgroundBootstrap();
  registerServiceWorker();
});

function scheduleBackgroundBootstrap() {
  setTimeout(() => { void bootstrapBackground(); }, 0);
}

async function bootstrapBackground() {
  try {
    markStartupStage(startupTrace, 'catalog_local_load_start');
    recordStartupPhase('hydrate-start');
    runtimeImageDiagnostics.mark('catalog_hydration_start', { activeCatalogCount:catalog.active.length });
    await catalog.hydrate({ onStage:(stage, details) => { markStartupStage(startupTrace, stage, details); runtimeImageDiagnostics.mark(stage, details); } });
    diagnosticLifecycle.push(diagnosticLifecycleSnapshot(store.state, 'hydration_complete', 'catalog.hydrate'));
    markStartupStage(startupTrace, 'catalog_local_load_end');
    recordStartupPhase('hydrate-complete');
    runtimeImageDiagnostics.mark('catalog_hydration_complete', { activeCatalogCount:catalog.active.length });
    captureLoveveryImageSweep('post_catalog_hydrate');
    render();
    // The storage-recovery candidate may read the static catalog so the
    // existing library can be inspected, but it must not let background
    // repairs, governance sync, or image migration mutate personal state.
    if (!store.canPersist) {
      markStartupStage(startupTrace, 'persistence_diagnostic_read_only');
      return;
    }
    // Shared catalog checks are deliberately after local Catalog hydration and
    // first paint. A failed network check leaves the last known Catalog intact.
    void governance.syncInBackground().then(() => governance.flushOutbox());

    markStartupStage(startupTrace, 'indexeddb_open_start');
    await recoverLegacyPersonalImages({ store, images, catalog });
    markStartupStage(startupTrace, 'indexeddb_open_end');
    diagnosticLifecycle.push(diagnosticLifecycleSnapshot(store.state, 'personal_image_migration_complete', 'recoverLegacyPersonalImages'));

    // Historical app fallbacks were once written as personal photos.  Repair
    // only the exact generated SVG signature before the normal image audit so
    // the shared same-child Catalog image can naturally win on this render.
    markStartupStage(startupTrace, 'fake_personal_placeholder_repair_start');
    const repairedState=structuredClone(store.state);
    const fakePersonalRepair=await repairFakePersonalPlaceholderBindings(repairedState, { images, catalog });
    if (fakePersonalRepair.changed || !store.state.catalogState?.syncMetadata?.fakePersonalPlaceholderRepairV121) store.replace(repairedState, 'fake-personal-placeholder-repair');
    markStartupStage(startupTrace, 'fake_personal_placeholder_repair_end', { changed:fakePersonalRepair.changed });
    diagnosticLifecycle.push(diagnosticLifecycleSnapshot(store.state, 'fake_personal_placeholder_repair_complete', 'generatedCatalogFallback-v1'));

    markStartupStage(startupTrace, 'personal_image_audit_start');
    await auditToyLibraryImages({ store, images, catalog });
    markStartupStage(startupTrace, 'personal_image_audit_end');
    // Remote catalog-image probes are intentionally admin/on-demand only.
    // Startup records the metadata state but never serially fetches hundreds
    // of product images before the app is usable.
    markStartupStage(startupTrace, 'catalog_image_manifest_ready', { audit:'metadata_only_on_startup' });
    diagnosticLifecycle.push(diagnosticLifecycleSnapshot(store.state, 'bootstrap_complete', 'background_local_work_complete'));
  } catch (error) {
    markStartupError(startupTrace, 'background_bootstrap_failed', error);
  }
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  markStartupStage(startupTrace, 'service_worker_registration_start');
  navigator.serviceWorker.register('./sw.js')
    .then(registration => {
      markStartupStage(startupTrace, 'service_worker_registration_end');
      return registration.ready;
    })
    .then(() => markStartupStage(startupTrace, 'service_worker_ready'))
    .catch(error => markStartupError(startupTrace, 'service_worker_failed', error));
}

function render() {
  runtimeImageDiagnostics.mark('render_start', { view, activeCatalogCount:catalog.active.length });
  applyTheme();
  document.documentElement.lang = i18n.language;
  document.title = t('appName');
  root.innerHTML = `
    <header><img src="./icons/header-logo.png" alt=""><div><h1>${t('appName')}</h1><p>${t(view)}</p><small class="build-marker">${escape(window.TOY_ROTATION_CONFIG?.RELEASE || 'development')} · ${IMAGE_RESOLVER_BUILD_MARKER}</small></div><button data-action="settings" aria-label="${t('settings')}">⚙</button></header>
    <nav>${navButton('home', 'home')}${navButton('library', 'library')}${navButton('rotation', 'rotation')}${navButton('wishlist', 'wishlist')}</nav>
    <main>${renderPersistenceWarning()}${renderView()}</main>`;
  root.querySelectorAll('[data-view]').forEach(button => { button.onclick = () => { view = button.dataset.view; render(); }; });
  root.querySelectorAll('[data-action]').forEach(button => { button.onclick = () => action(button.dataset.action, button.dataset); });
  root.querySelectorAll('[data-draft-edit]').forEach(button => { button.onclick = () => openRecognitionReview(button.dataset.draftEdit); });
  root.querySelectorAll('[data-draft-confirm]').forEach(button => { button.onclick = () => getRecognition().confirm(button.dataset.draftConfirm, { destination:button.dataset.destination || 'library' }); });
  root.querySelectorAll('[data-draft-image-consent]').forEach(input => { input.onchange=()=>store.update(state=>{const draft=state.drafts.find(item=>item.id===input.dataset.draftImageConsent);if(draft)draft.imageConsent=input.checked;},'candidate-image-consent'); });
  root.querySelectorAll('[data-draft-retry]').forEach(button => { button.onclick = () => getRecognition().analyze(button.dataset.draftRetry, { force: true }); });
  root.querySelectorAll('[data-draft-remove]').forEach(button => { button.onclick = () => getRecognition().remove(button.dataset.draftRemove); });
  root.querySelectorAll('[data-draft-view]').forEach(button => { button.onclick = () => { view='library'; render(); document.querySelector(`[data-toy-id="${button.dataset.draftView}"]`)?.scrollIntoView({ behavior:'smooth', block:'center' }); }; });
  root.querySelectorAll('[data-draft-duplicate-same]').forEach(button => { button.onclick = () => getRecognition().resolveDuplicateReview(button.dataset.draftDuplicateSame, 'same'); });
  root.querySelectorAll('[data-draft-duplicate-not-same]').forEach(button => { button.onclick = () => getRecognition().resolveDuplicateReview(button.dataset.draftDuplicateNotSame, 'not_same'); });
  bindImages();
  prepareSingleLineInputs(root);
  wireLibraryFilters();
  wireWishlistFilters();
  queueOnboarding();
  runtimeImageDiagnostics.mark('render_complete', { view, activeCatalogCount:catalog.active.length, runtimeToyImageCount:root.querySelectorAll('img[data-runtime-image-toy-id]').length });
}

function navButton(id, label) { return `<button class="${view === id ? 'active' : ''}" data-view="${id}">${t(label)}</button>`; }
function renderView() { return { home: renderHome, library: renderLibrary, rotation: renderRotation, wishlist: renderWishlist }[view](); }
function renderEmpty() { return `<div class="panel"><p>${t('noData')}</p></div>`; }
function renderPersistenceWarning() {
  const diagnosticMode=window.TOY_ROTATION_CONFIG?.PERSISTENCE_DIAGNOSTIC_MODE === true;
  if (store.canPersist && !diagnosticMode) return '';
  const classification=store.persistence.diagnostic?.classification;
  const classificationLabel=classification ? `<p><b>${t('persistenceClassification')}:</b> ${escape(classification.code)} · ${escape(classification.label)}</p>` : '';
  const staged=store.persistence.status === 'diagnostic_staged_recovery';
  const recover=staged ? `<button class="primary" data-action="persistence-recovery">${t('applyDetectedRecovery')}</button>` : '';
  const fresh=store.canPersist ? '' : `<button class="danger" data-action="persistence-start-fresh">${t('startFresh')}</button>`;
  return `<section class="panel danger"><h2>${t('persistenceRecoveryTitle')}</h2><p>${t(diagnosticMode ? 'persistenceDiagnosticModeDetail' : 'persistenceRecoveryDetail')}</p>${classificationLabel}<div class="actions"><button data-action="persistence-diagnostic">${t('exportPersistenceDiagnostic')}</button>${recover}${fresh}</div></section>`;
}

function renderHome() {
  const toys = store.state.toys;
  const shelf = currentShelfCollections(store.state);
  const age = childAgeMonths();
  const reassessment = reassessmentState({ lastRotationAt:store.state.lastRotationAt, rotationHistory:store.state.rotationHistory, rotationDays:store.state.settings.rotationDays });
  const childLabel = store.state.profile.childName || t('childProfile');
  return `<section class="panel"><h2>${t('home')}</h2><div class="stats"><div><small>${t('library')}</small><b>${toys.length}</b></div><div><small>${t('onShelf')}</small><b>${shelf.totalShelfCount}</b></div><div><small>${t('currentAge')}</small><b>${age == null ? '—' : `${age} ${t('monthUnit')}`}</b></div></div><section class="summary"><b>${escape(childLabel)}</b><p>${age == null ? t('setBirthDateHint') : t('ageSummary', { count:age })}</p><button data-action="settings">${t('editProfile')}</button></section><section class="summary"><b>${reassessment.due ? t('reassessmentDue') : t('reassessmentCountdown', { count:reassessment.daysRemaining })}</b><p>${t('rotationIntervalSummary', { count:reassessment.days })} · ${t('targetShelfSummary', { count:store.state.settings.rotationSize })}</p><div class="home-actions"><button data-action="generate" class="primary">${t('generateThisRotation')}</button><button class="secondary" data-action="catalog">${t('standardCatalog')}</button></div></section></section>`;
}

function renderLibrary() {
  const toys = store.state.toys;
  return `<section class="head"><h2>${t('library')}</h2><span><button data-action="recognize">${t('recognizeToy')}</button><button class="primary" data-action="add">+ ${t('addToy')}</button></span></section>${renderDrafts()}${renderCompactFilterBar({ id:'library', searchLabel:t('searchLibrary'), placeholder:t('searchLibraryPlaceholder'), filters:libraryFilters, includeSort:false, includeDuplicates:true })}<p id="library-search-empty" class="hidden">${t('noSearchResults')}</p><section class="list" id="library-list">${toys.length ? toys.map(renderToyCard).join('') : renderEmpty()}</section>`;
}

function renderDrafts() {
  const drafts = store.state.drafts || [];
  if (!drafts.length) return '';
  return `<section class="panel"><h3>${t('pendingReview')} (${drafts.length})</h3>${drafts.map(renderDraft).join('')}</section>`;
}
function renderDraft(draft) {
  const statusKey = `recognition${capitalize(draft.status)}`;
  const owned=draft.ownedToyId && store.state.toys.find(toy=>toy.id===draft.ownedToyId);
  const duplicate=draft.duplicateCandidates?.[0];
  const actions=String(draft.status).startsWith('ready') ? `${draft.status==='ready_catalog_unmatched'?`<label class="choice"><input type="checkbox" data-draft-image-consent="${draft.id}" ${draft.imageConsent?'checked':''}>${t('imageReviewConsent')}</label>`:''}<button data-draft-edit="${draft.id}">${t('recognitionReview')}</button><button data-draft-confirm="${draft.id}" data-destination="library" class="primary">${t('addToToyLibrary')}</button><button data-draft-confirm="${draft.id}" data-destination="wishlist" class="primary">${t('addToWishlist')}</button>` : draft.status === 'already_owned' && owned ? `<div class="recognition-owned"><img data-image='${escapedJson(libraryImageRef(owned))}' alt=""><span>${escape(brandLabel(owned.brand))} · ${escape(displayName(owned))}</span></div><button data-draft-view="${owned.id}">${t('viewExistingToy')}</button>` : draft.status === 'duplicate_review_required' ? `<p>${t('recognitionPossibleDuplicate',{name:duplicate?.productName || t('pendingReview')})}</p><button data-draft-duplicate-same="${draft.id}">${t('recognitionSameToy')}</button><button data-draft-duplicate-not-same="${draft.id}" class="primary">${t('recognitionNotSameToy')}</button>` : '';
  return `<div class="draft"><img data-image='${escapedJson(draft.imageRef)}' alt=""><div><b>${escape(draft.productName || t('pendingReview'))}</b><small>${t(statusKey)}${draft.error ? ` · ${escape(messageFor(draft.error))}` : ''}</small>${actions}${draft.status === 'error' ? `<button data-draft-retry="${draft.id}">${t('retryRecognition')}</button>` : ''}<button data-draft-remove="${draft.id}">${t('remove')}</button></div></div>`;
}

function renderToyCard(toy) {
  const ageUnit = t('monthUnit');
  const customPermanent = isUserCustomPermanent(toy);
  const paused = isRotationPaused(toy);
  const shelf = currentShelfCollections(store.state);
  const manuallyOnShelf = shelf.manualIds.includes(toy.id);
  const onShelf = customPermanent || manuallyOnShelf || shelf.rotationIds.includes(toy.id);
  const permanentControl = toy.set?.kind === 'parent' || paused ? '' : `<button data-action="toggle-permanent" data-id="${toy.id}">${t(customPermanent ? 'removeFromPermanent' : 'keepOnShelf')}</button>`;
  const manualControl = toy.set?.kind === 'parent' || customPermanent || paused ? '' : `<button data-action="manual-shelf" data-mode="${onShelf ? 'stored' : 'on_shelf'}" data-id="${toy.id}">${t(onShelf ? 'storeAway' : 'putOnShelf')}</button>`;
  const pauseControl = toy.set?.kind === 'parent' ? '' : `<button data-action="toggle-pause" data-id="${toy.id}">${t(paused ? 'resumeRotation' : 'pauseRotation')}</button>`;
  const runtimeImageRef = libraryImageRef(toy, 'toy_library_card_render');
  return `<article class="card" data-toy-id="${escape(toy.id)}" data-library-search="${escape(librarySearchText(toy))}" data-brand="${escape(toy.brand)}" data-category="${toy.categoryCode}" data-skills="${escape((toy.skillCodes||[]).join('|'))}" data-mechanics="${escape((toy.playMechanics||[]).join('|'))}" data-status="${toy.archived?'archived':toy.hidden?'hidden':paused?'paused':customPermanent?'permanent':onShelf?'active':'stored'}" data-age-fit="${toyAgeFit(toy)}"><img data-runtime-image-toy-id="${escape(toy.id)}" data-image='${escapedJson(runtimeImageRef)}' alt=""><div><h3>${escape(displayName(toy))}${customPermanent ? ` <span class="permanent-chip">${t('permanentBadge')}</span>` : ''}</h3><p>${escape(brandLabel(toy.brand))} · ${t(`category.${toy.categoryCode}`)}</p><div class="chips">${toy.skillCodes.map(code => `<span>${t(`skill.${code}`)}</span>`).join('')}</div><p>${toy.minAgeMonths ?? '?'}–${toy.maxAgeMonths ?? '?'} ${ageUnit} · ${t(paused ? 'paused' : customPermanent ? 'customPermanent' : onShelf ? 'onShelf' : 'stored')}</p><div class="actions"><button data-action="interest" data-id="${toy.id}" data-value="like" class="${toy.interest === 'like' ? 'selected' : ''}">${t('liked')}</button><button data-action="interest" data-id="${toy.id}" data-value="neutral" class="${toy.interest === 'neutral' ? 'selected' : ''}">${t('neutral')}</button><button data-action="interest" data-id="${toy.id}" data-value="dislike" class="${toy.interest === 'dislike' ? 'selected' : ''}">${t('disliked')}</button>${manualControl}${permanentControl}${pauseControl}<button data-action="edit" data-id="${toy.id}">${t('edit')}</button><button data-action="remove-toy" data-id="${toy.id}" class="danger">${t('remove')}</button></div></div></article>`;
}

function librarySearchText(toy) {
  return [toy.productName, toy.names?.en, toy.names?.zh, toy.brand, ...(toy.aliases || []), toy.categoryCode, t(`category.${toy.categoryCode}`), ...(toy.skillCodes || []), ...(toy.skillCodes || []).map(code => t(`skill.${code}`)), ...(toy.playMechanics || []), ...(toy.playMechanics || []).map(mechanicLabel)].filter(Boolean).join(' ').normalize('NFKC').toLowerCase();
}
function wireLibraryFilters() {
  const input = root.querySelector('#library-search');
  if (!input) return;
  const filter = () => {
    libraryFilters.query = input.value;
    const query = libraryFilters.query.normalize('NFKC').trim().toLowerCase();
    let visible = 0;
    root.querySelectorAll('[data-library-search]').forEach(card => { const show = (!query || card.dataset.librarySearch.includes(query)) && (!libraryFilters.brand || card.dataset.brand===libraryFilters.brand) && (!libraryFilters.categoryCode || card.dataset.category===libraryFilters.categoryCode) && (!libraryFilters.skillCode || card.dataset.skills.split('|').includes(libraryFilters.skillCode)) && (!libraryFilters.playMechanic || card.dataset.mechanics.split('|').includes(libraryFilters.playMechanic)) && (!libraryFilters.status || card.dataset.status===libraryFilters.status) && (!libraryFilters.ageFit || card.dataset.ageFit===libraryFilters.ageFit); card.classList.toggle('hidden', !show); if (show) visible++; });
    root.querySelector('#library-search-empty')?.classList.toggle('hidden', visible > 0);
  };
  input.oninput = filter;
  filter();
}
function filterOption(value,label,selected) { return `<option value="${escape(value)}" ${value===selected?'selected':''}>${escape(label)}</option>`; }
function toyAgeFit(toy) { const age=childAgeMonths(); if(age==null||toy.minAgeMonths==null||toy.maxAgeMonths==null)return'unknown'; return age<toy.minAgeMonths?'tooYoung':age>toy.maxAgeMonths?'outgrown':'appropriate'; }

function renderCompactFilterBar({ id, searchLabel, placeholder, filters, includeSort = false, includeDuplicates = false }) {
  const active = compactFilterSummary(filters, includeSort);
  return `<section class="panel compact-filter-bar"><label class="library-search"><span>${escape(searchLabel)}</span><input id="${id}-search" type="search" enterkeyhint="search" value="${escape(filters.query)}" placeholder="${escape(placeholder)}"></label><div class="compact-filter-actions"><button data-action="open-${id}-filters">${t('filters')}</button>${includeSort ? `<button data-action="open-${id}-sort">${t('sort')}</button>` : ''}${includeDuplicates ? `<button data-action="library-duplicates">${t('findDuplicates')}</button>` : ''}</div>${active ? `<p class="active-filter-summary">${escape(active)} <button data-action="clear-${id}-filters">${t('clearFilters')}</button></p>` : ''}</section>`;
}

function compactFilterSummary(filters, includeSort) {
  const values = [];
  if (filters.brand) values.push(brandLabel(filters.brand));
  if (filters.categoryCode) values.push(t(`category.${filters.categoryCode}`));
  if (filters.skillCode) values.push(t(`skill.${filters.skillCode}`));
  if (filters.playMechanic) values.push(mechanicLabel(filters.playMechanic));
  if (filters.status) values.push(t(filters.status === 'want' || filters.status === 'purchased' || filters.status === 'dismissed' ? `wishlistStatus.${filters.status}` : `filterStatus.${filters.status}`));
  if (filters.ageFit) values.push(t(`ageFit.${filters.ageFit}`));
  if (filters.priority) values.push(t(filters.priority));
  if (includeSort && filters.sort && filters.sort !== 'priority') values.push(t(`wishlistSort.${filters.sort}`).replace(/^.*?:\s*/, ''));
  return values.length > 3 ? `${values.slice(0,3).join(' · ')} · +${values.length - 3}` : values.join(' · ');
}

function filterSheet({ id, filters, brands, mechanics, includeWishlist = false, sortOnly = false }) {
  const controls = sortOnly ? `<label>${t('sort')}<select name="sort"><option value="priority">${t('wishlistSort.priority')}</option><option value="ageFit">${t('wishlistSort.ageFit')}</option><option value="addedAt">${t('wishlistSort.addedAt')}</option><option value="brand">${t('wishlistSort.brand')}</option></select></label>` : `<div class="compact-filter-fields"><label>${t('brand')}<select name="brand"><option value="">${t('allBrands')}</option>${brands.map(value=>filterOption(value,brandLabel(value),filters.brand)).join('')}</select></label><label>${t('allCategories')}<select name="categoryCode"><option value="">${t('allCategories')}</option>${CATEGORY_CODES.map(value=>filterOption(value,t(`category.${value}`),filters.categoryCode)).join('')}</select></label><label>${t('skills')}<select name="skillCode"><option value="">${t('allSkills')}</option>${SKILL_CODES.map(value=>filterOption(value,t(`skill.${value}`),filters.skillCode)).join('')}</select></label><label>${t('playMechanics')}<select name="playMechanic"><option value="">${t('allMechanics')}</option>${mechanics.map(value=>filterOption(value,mechanicLabel(value),filters.playMechanic)).join('')}</select></label>${includeWishlist ? `<label>${t('purchasePriority')}<select name="priority"><option value="">${t('allPriorities')}</option>${['high','medium','low'].map(value=>filterOption(value,t(value),filters.priority)).join('')}</select></label><label>${t('wishlistStatusLabel')}<select name="status"><option value="">${t('allWishlistStatuses')}</option>${['want','purchased','dismissed'].map(value=>filterOption(value,t(`wishlistStatus.${value}`),filters.status)).join('')}</select></label>` : `<label>${t('allStatuses')}<select name="status"><option value="">${t('allStatuses')}</option>${['active','stored','permanent','paused','hidden','archived'].map(value=>filterOption(value,t(`filterStatus.${value}`),filters.status)).join('')}</select></label>`}<label>${t('allAgeFits')}<select name="ageFit"><option value="">${t('allAgeFits')}</option>${['appropriate','tooYoung','outgrown','unknown'].map(value=>filterOption(value,t(`ageFit.${value}`),filters.ageFit)).join('')}</select></label></div>`;
  const dialog = openModal(`<form class="form compact-filter-sheet"><header><h2>${sortOnly ? t('sort') : t('filters')}</h2><button type="button" data-close>×</button></header>${controls}<div class="filter-actions"><button type="button" data-clear>${t('clearFilters')}</button><button class="primary">${t('applyFilters')}</button></div></form>`);
  const form = dialog.querySelector('form');
  if (sortOnly) form.sort.value = filters.sort || 'priority';
  form.querySelector('[data-clear]')?.addEventListener('click', () => { for (const key of Object.keys(filters)) if (key !== 'query' && (!sortOnly || key === 'sort')) filters[key] = key === 'sort' ? 'priority' : ''; dialog.close(); render(); });
  form.onsubmit = event => { event.preventDefault(); const values = new FormData(form); if (sortOnly) filters.sort = values.get('sort'); else for (const key of ['brand','categoryCode','skillCode','playMechanic','priority','status','ageFit']) if (key in filters) filters[key] = values.get(key) || ''; dialog.close(); render(); };
}

function openLibraryFilters() {
  const toys=store.state.toys;
  filterSheet({ id:'library', filters:libraryFilters, brands:[...new Set(toys.map(toy=>toy.brand))].sort((a,b)=>brandLabel(a).localeCompare(brandLabel(b))), mechanics:[...new Set(toys.flatMap(toy=>toy.playMechanics||[]))].sort((a,b)=>mechanicLabel(a).localeCompare(mechanicLabel(b))) });
}
function openWishlistFilters({ sortOnly = false } = {}) {
  const entries=store.state.wishlist.map(item=>catalog.resolve(item)||item.catalogSnapshot).filter(Boolean);
  filterSheet({ id:'wishlist', filters:wishlistFilters, brands:[...new Set(entries.map(toy=>toy.brand))].sort((a,b)=>brandLabel(a).localeCompare(brandLabel(b))), mechanics:[...new Set(entries.flatMap(toy=>toy.playMechanics||[]))].sort((a,b)=>mechanicLabel(a).localeCompare(mechanicLabel(b))), includeWishlist:true, sortOnly });
}

function renderRotation() {
  const shelf = currentShelfCollections(store.state);
  const pausedCount=(store.state.toys||[]).filter(isRotationPaused).length;
  const collapsed=store.state.settings?.permanentSectionCollapsed===true;
  const latest = store.state.rotationHistory?.[0]?.rotationDiagnostics;
  const shortage = latest?.shortageCount ? `<p class="panel">${t('rotationShortage',{selected:latest.selectedRotationCount ?? latest.selectedCount, requested:latest.requestedRotationCount ?? latest.requestedCount})}</p>` : '';
  const manual = shelf.manual.length ? `<section class="rotation-section"><h3>${t('manuallyOnShelf')} · ${shelf.manual.length}</h3><div class="list">${shelf.manual.map(renderToyCard).join('')}</div></section>` : '';
  return `<section class="head"><h2>${t('rotation')}</h2><button class="primary" data-action="generate">${t('generate')}</button></section><section class="panel shelf-total"><b>${t('currentShelfTotal',{count:shelf.totalShelfCount})}</b><p>${t('thisRotation')} ${shelf.rotation.length} · ${t('customPermanent')} ${shelf.permanent.length} · ${t('paused')} ${pausedCount}</p><p>${t('permanentTargetHint')}</p></section>${shortage}<section class="rotation-section"><h3>${t('customPermanent')} · ${shelf.permanent.length} <button data-action="toggle-permanent-collapse" aria-expanded="${!collapsed}">${collapsed?'▸':'▾'}</button></h3>${collapsed?'':`<div class="list">${shelf.permanent.length ? shelf.permanent.map(renderToyCard).join('') : `<p class="panel">${t('noCustomPermanent')}</p>`}</div>`}</section>${manual}<section class="rotation-section"><h3>${t('thisRotation')} · ${shelf.rotation.length}</h3><div class="list">${shelf.rotation.length ? shelf.rotation.map(renderToyCard).join('') : renderEmpty()}</div></section>`;
}

function renderWishlist() {
  const age = childAgeMonths();
  const unresolved = [];
  const entries = store.state.wishlist.map(item => {
    const candidate = catalog.resolve(item) || item.catalogSnapshot;
    if (!candidate?.productName && !candidate?.names?.en && !candidate?.names?.zh) { unresolved.push(item); return null; }
    const result = substitution.result(candidate, store.state.toys, store.revision, { childAgeMonths: age });
    return { item, candidate, result };
  }).filter(Boolean);
  const filtered = entries.filter(entry => wishlistMatches(entry)).sort(compareWishlistEntries);
  const rows = filtered.map(({ item, candidate, result }) => {
    const high = result.relationships.filter(row => row.level === 'exact_duplicate' || row.level === 'high_substitution');
    const medium = result.relationships.filter(row => row.level === 'medium_substitution');
    const visible = result.relationships.slice(0, 3);
    const ageRange = candidate.minAgeMonths == null && candidate.maxAgeMonths == null ? '' : `<p>${candidate.minAgeMonths ?? '?'}–${candidate.maxAgeMonths ?? '?'} ${t('monthUnit')} · ${t(`category.${candidate.categoryCode || 'uncategorized'}`)}</p>`;
    const realSummary = high.length ? `<p class="overlap-summary"><b>${t('realHighOverlap', { count:high.length })}</b>${medium.length ? ` · ${t('partialPlaySimilarity', { count:medium.length })}` : ''}</p>` : medium.length ? `<p class="overlap-summary"><b>${t('partialPlaySimilarity', { count:medium.length })}</b></p>` : `<p class="overlap-summary">${t('noPurchaseImpactOverlap')}</p>`;
    const skillVisible = result.skillRelationships.slice(0, 3);
    const skillOnly = result.skillRelationships.length ? `<details class="skill-only"><summary>${t('skillOnlyDisclosure', { count:result.skillRelationships.length })}</summary><p>${t('skillOnlyExplanation')}</p><div class="overlap-list">${skillVisible.map(renderOverlap).join('')}</div>${result.skillRelationships.length > skillVisible.length ? `<button data-action="all-skill-overlaps" data-id="${item.id}">${t('viewAll', { count:result.skillRelationships.length })}</button>` : ''}</details>` : '';
    return `<article class="panel wishlist-card"><div class="wishlist-title"><img data-image='${escapedJson(candidate.imageRef || { kind:'placeholder' })}' alt=""><div><h3>${escape(displayName(candidate))}</h3><p>${escape(brandLabel(candidate.brand))}</p>${ageRange}</div><span class="status-chip">${t(`wishlistStatus.${item.status || 'want'}`)}</span></div><section class="priority-summary"><b>${t('purchasePriority')}</b><span class="priority-${item.priority || result.purchaseImpact.priority}">${t(item.priority || result.purchaseImpact.priority)}</span></section>${item.notes ? `<p>${escape(item.notes)}</p>` : ''}${realSummary}<div class="overlap-list"><h4>${t('realSubstitutes')}</h4>${visible.map(renderOverlap).join('') || `<p>${t('noOverlap')}</p>`}</div>${result.relationships.length > visible.length ? `<button data-action="all-overlaps" data-id="${item.id}">${t('viewAll', { count: result.relationships.length })}</button>` : ''}${skillOnly}<div class="actions">${item.status === 'purchased' ? '' : `<button class="primary" data-action="wishlist-purchased" data-id="${item.id}">${t('purchased')}</button>`}<button class="primary" data-action="wishlist-add-library" data-id="${item.id}">${t('addToToyLibrary')}</button><button data-action="wishlist-remove" data-id="${item.id}">${t('removeFromWishlist')}</button></div></article>`;
  });
  const diagnostic = unresolved.length && admin.enabled ? `<p class="diagnostic">${t('wishlistMigrationDiagnostic', { count:unresolved.length })}</p>` : '';
  return `<section class="head"><h2>${t('wishlist')}</h2><button class="primary" data-action="add-wishlist-item">${t('addWishlistItem')}</button><button data-action="catalog">${t('standardCatalog')}</button></section>${renderCompactFilterBar({ id:'wishlist', searchLabel:t('searchWishlist'), placeholder:t('searchWishlistPlaceholder'), filters:wishlistFilters, includeSort:true })}${diagnostic}<section class="list">${rows.join('') || renderEmpty()}</section>`;
}
function wishlistMatches({ item, candidate, result }) {
  const query=wishlistFilters.query.normalize('NFKC').trim().toLowerCase();
  return (!query || wishlistSearchText(candidate).includes(query)) && (!wishlistFilters.brand || candidate.brand===wishlistFilters.brand) && (!wishlistFilters.categoryCode || candidate.categoryCode===wishlistFilters.categoryCode) && (!wishlistFilters.skillCode || candidate.skillCodes.includes(wishlistFilters.skillCode)) && (!wishlistFilters.playMechanic || candidate.playMechanics.includes(wishlistFilters.playMechanic)) && (!wishlistFilters.priority || result.purchaseImpact.priority===wishlistFilters.priority) && (!wishlistFilters.status || item.status===wishlistFilters.status) && (!wishlistFilters.ageFit || toyAgeFit(candidate)===wishlistFilters.ageFit);
}
function wishlistSearchText(toy) { return librarySearchText(toy); }
function compareWishlistEntries(a,b) {
  const priority={high:3,medium:2,low:1}; const ageFit={appropriate:4,unknown:3,tooYoung:2,outgrown:1};
  if(wishlistFilters.sort==='ageFit') return ageFit[toyAgeFit(b.candidate)]-ageFit[toyAgeFit(a.candidate)] || priority[b.result.purchaseImpact.priority]-priority[a.result.purchaseImpact.priority];
  if(wishlistFilters.sort==='addedAt') return new Date(b.item.addedAt||0)-new Date(a.item.addedAt||0);
  if(wishlistFilters.sort==='brand') return brandLabel(a.candidate.brand).localeCompare(brandLabel(b.candidate.brand));
  return priority[b.result.purchaseImpact.priority]-priority[a.result.purchaseImpact.priority] || new Date(b.item.addedAt||0)-new Date(a.item.addedAt||0);
}
function wireWishlistFilters() {
  const input=root.querySelector('#wishlist-search'); if(!input)return;
  input.onchange=()=>{ wishlistFilters.query=input.value; render(); };
}
function renderOverlap(row) {
  const skills = row.sharedSkillCodes?.length ? `<small>${t('sharedSkills')}: ${row.sharedSkillCodes.map(code => t(`skill.${code}`)).join(', ')}</small>` : '';
  return `<div class="overlap"><img data-image='${escapedJson(row.toy.imageRef)}' alt=""><div><b>${escape(displayName(row.toy))}</b><small>${escape(brandLabel(row.toy.brand))} · ${t(levelKey(row.level))}</small><small>${escape(overlapReason(row))}</small>${skills}</div></div>`;
}
function levelKey(level) { return ({ exact_duplicate: 'exactDuplicate', high_substitution: 'highSubstitution', medium_substitution: 'mediumSubstitution', skill_similarity_only: 'skillSimilarityOnly' })[level] || level; }
function overlapReason(row) {
  if (row.reasonCode.startsWith('mechanic:')) return t('overlapReasonMechanic', { value: mechanicLabel(row.reasonCode.slice(9)) });
  return t({ operation: 'overlapReasonOperation', goal: 'overlapReasonGoal', scene: 'overlapReasonScene', skill: 'overlapReasonSkill', none: 'overlapReasonNone' }[row.reasonCode] || 'overlapReasonNone');
}

async function action(name, data) {
  if (name === 'catalog') return openCatalog();
  if (name === 'open-library-filters') return openLibraryFilters();
  if (name === 'open-wishlist-filters') return openWishlistFilters();
  if (name === 'open-wishlist-sort') return openWishlistFilters({ sortOnly:true });
  if (name === 'clear-library-filters') { Object.assign(libraryFilters,{query:'',brand:'',categoryCode:'',skillCode:'',playMechanic:'',status:'',ageFit:''}); return render(); }
  if (name === 'clear-wishlist-filters') { Object.assign(wishlistFilters,{query:'',brand:'',categoryCode:'',skillCode:'',playMechanic:'',priority:'',status:'',ageFit:'',sort:'priority'}); return render(); }
  if (name === 'library-duplicates') return openLibraryDuplicateScan();
  if (name === 'settings') return openSettings();
  if (name === 'persistence-diagnostic') return exportPersistenceDiagnostic();
  if (name === 'persistence-recovery') return applyPersistenceRecovery();
  if (name === 'persistence-start-fresh') return startFresh();
  if (name === 'add') return editToy();
  if (name === 'recognize') return recognizeToy();
  if (name === 'edit') return editToy(data.id);
  if (name === 'interest') return setToyInterest(store, data.id, data.value);
  if (name === 'remove-toy') return removeToy(data.id);
  if (name === 'toggle-permanent') return togglePermanentToy(data.id);
  if (name === 'manual-shelf') return setManualShelf(data.id, data.mode);
  if (name === 'toggle-pause') return togglePauseToy(data.id);
  if (name === 'toggle-permanent-collapse') return store.update(state => { state.settings.permanentSectionCollapsed = !state.settings.permanentSectionCollapsed; }, 'permanent-section-collapse');
  if (name === 'generate') return generateNewRotation();
  if (name === 'all-overlaps') return openAllOverlaps(data.id);
  if (name === 'all-skill-overlaps') return openAllSkillOverlaps(data.id);
  if (name === 'wishlist-purchased') return setWishlistStatus(data.id, 'purchased');
  if (name === 'wishlist-add-library') return addWishlistToLibrary(data.id);
  if (name === 'add-wishlist-item') return openWishlistItem();
  if (name === 'wishlist-remove') return removeWishlist(data.id);
}

function startFresh() {
  if (!confirm(t('confirmStartFresh'))) return;
  try {
    startFreshStore();
    location.reload();
  } catch (error) {
    alert(messageFor(error?.message || 'persistenceStartFreshFailed'));
  }
}

function togglePermanentToy(id) {
  const current = store.state.toys.find(toy => toy.id === id);
  if (!current || current.set?.kind === 'parent') return;
  const makePermanent = !isUserCustomPermanent(current);
  const age = childAgeMonths();
  store.update(state => { setCustomPermanent(state, id, makePermanent, { childAgeMonths:age }); }, makePermanent ? 'custom-permanent-set' : 'custom-permanent-remove');
}

function setManualShelf(id, mode) {
  const age = childAgeMonths();
  store.update(state => { setManualShelfState(state, id, mode, { childAgeMonths:age }); }, `manual-shelf-${mode}`);
}
function togglePauseToy(id) {
  const toy=store.state.toys.find(item=>item.id===id); if(!toy)return;
  if (isRotationPaused(toy)) { const age=childAgeMonths(); return store.update(state=>{setRotationParticipation(state,id,'active',{childAgeMonths:age});},'resume-rotation'); }
  const reasons=['not_interested','too_easy','too_hard','seasonal','space','later','other'];
  const dialog=openModal(`<form class="form"><header><h2>${t('pauseRotation')}</h2><button type="button" data-close>×</button></header><label>${t('pauseReasonLabel')}<select name="reason">${reasons.map(value=>`<option value="${value}">${t(`pauseReason.${value}`)}</option>`).join('')}</select></label><label>${t('pauseReason.other')}<input name="note" maxlength="240" value="${escape(toy.pauseReason||'')}"></label><button class="primary">${t('pauseRotation')}</button></form>`);
  dialog.querySelector('form').onsubmit=event=>{event.preventDefault();const form=new FormData(event.currentTarget),age=childAgeMonths();store.update(state=>{setRotationParticipation(state,id,'paused',{childAgeMonths:age,pauseReasonCode:form.get('reason'),pauseReason:form.get('note')});},'pause-rotation');dialog.close();};
}

function setWishlistStatus(id, status) { store.update(state => { const item=state.wishlist.find(entry=>entry.id===id); if(item) item.status=status; }, 'wishlist-status'); }
function removeWishlist(id) { if (confirm(t('confirmRemoveWishlist'))) store.update(state => { state.wishlist=state.wishlist.filter(item=>item.id!==id); }, 'wishlist-remove'); }
function addWishlistToLibrary(id) {
  const wish=store.state.wishlist.find(item=>item.id===id); const source=wish && (catalog.resolve(wish) || wish.catalogSnapshot);
  if (!wish || !source) return;
  const result=addCatalogToy(store, source, source.imageRef);
  if (result.added) catalog.ensureSetChildren();
  view='library'; render();
}
function openWishlistItem() {
  const dialog=openModal(`<form class="form"><header><h2>${t('addWishlistItem')}</h2><button type="button" data-close>×</button></header><label>${t('brand')}<input name="brand"></label><label>${t('name')}<input name="productName" required></label><label>${t('allCategories')}<select name="categoryCode">${CATEGORY_CODES.map(code=>`<option value="${code}">${t(`category.${code}`)}</option>`).join('')}</select></label><label>${t('skills')}<select name="skillCodes" multiple size="6">${SKILL_CODES.map(code=>`<option value="${code}">${t(`skill.${code}`)}</option>`).join('')}</select></label><label>${t('image')}<input name="image" type="file" accept="image/*"></label><label>${t('wishlistPriority')}<select name="priority"><option value="low">${t('low')}</option><option value="medium" selected>${t('medium')}</option><option value="high">${t('high')}</option></select></label><label>${t('notes')}<textarea name="notes"></textarea></label><label>${t('sourceLink')}<input name="sourceLink" type="url"></label><p class="form-error" aria-live="polite"></p><footer><button type="button" data-recognize>${t('recognizeToy')}</button><button class="primary">${t('addToWishlist')}</button></footer></form>`);
  const form=dialog.querySelector('form');
  form.querySelector('[data-recognize]').onclick=async()=>{ const file=new FormData(form).get('image'); if(!file?.size){form.querySelector('.form-error').textContent=t('wishlistImageRequired');return;} try { await getRecognition().createDraft(file); dialog.close(); } catch(error) { form.querySelector('.form-error').textContent=messageFor(error.code||error.message); } };
  form.onsubmit=async event=>{event.preventDefault();const values=new FormData(form);const file=values.get('image');let imageRef={kind:'placeholder'};if(file?.size)imageRef=await images.savePersonal(await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);}));const snapshot={canonicalKey:canonicalKey(`${values.get('brand')}-${values.get('productName')}`),brand:values.get('brand'),productName:values.get('productName'),categoryCode:values.get('categoryCode'),skillCodes:values.getAll('skillCodes'),imageRef};store.update(state=>state.wishlist.push(normalizeWishlistItem({catalogSnapshot:snapshot,status:'want',priority:values.get('priority'),notes:values.get('notes'),sourceLink:values.get('sourceLink')})),'wishlist-manual-add');dialog.close();};
}

function queueOnboarding() {
  if (!store.canPersist) return;
  const empty = !store.state.settings.onboardingDone && !store.state.profile.childBirthDate && store.state.toys.length === 0;
  if (!empty || onboardingQueued || document.querySelector('dialog[open]')) return;
  onboardingQueued = true;
  setTimeout(() => { onboardingQueued = false; if (!document.querySelector('dialog[open]') && !store.state.settings.onboardingDone && !store.state.profile.childBirthDate && store.state.toys.length === 0) openOnboarding(); }, 0);
}

function openOnboarding() {
  const dialog = openModal(`<form class="form"><header><h2>${t('welcome')}</h2><button type="button" data-close>×</button></header><p>${t('onboardingIntro')}</p>${profileSettingsFields()}<button class="primary">${t('start')}</button></form>`);
  wireProfileSettingsForm(dialog, { onboarding:true });
}

function openAllOverlaps(wishlistId) {
  const item = store.state.wishlist.find(entry => entry.id === wishlistId);
  const candidate = item && (catalog.resolve(item) || item.catalogSnapshot);
  if (!candidate) return;
  const result = substitution.result(candidate, store.state.toys, store.revision, { childAgeMonths: childAgeMonths() });
  const dialog = openModal(`<section class="sheet"><header><h2>${t('overlaps')}</h2><button type="button" data-close>×</button></header><p>${escape(displayName(candidate))}</p><div class="list">${result.relationships.map(renderOverlap).join('') || `<p>${t('noOverlap')}</p>`}</div></section>`);
  bindImages(dialog);
}

function openAllSkillOverlaps(wishlistId) {
  const item = store.state.wishlist.find(entry => entry.id === wishlistId);
  const candidate = item && (catalog.resolve(item) || item.catalogSnapshot);
  if (!candidate) return;
  const result = substitution.result(candidate, store.state.toys, store.revision, { childAgeMonths: childAgeMonths() });
  const dialog = openModal(`<section class="sheet"><header><h2>${t('skillOnlyTitle')}</h2><button type="button" data-close>×</button></header><p>${t('skillOnlyExplanation')}</p><div class="list">${result.skillRelationships.map(renderOverlap).join('') || `<p>${t('noOverlap')}</p>`}</div></section>`);
  bindImages(dialog);
}

function openModal(markup) {
  const dialog = document.querySelector('#modal');
  dialog.innerHTML = markup;
  modalManager.open(dialog);
  prepareSingleLineInputs(dialog);
  dialog.querySelectorAll('[data-close]').forEach(button => { button.onclick = () => dialog.close(); });
  const scroller = dialog.querySelector('.form,.sheet');
  if (scroller) installScrollTopButton(scroller, true);
  return dialog;
}

function openLibraryDuplicateScan() {
  const duplicates = findDuplicates(store.state.toys).filter(match => ['exact_duplicate','same_child_legacy_duplicate','strong_probable_duplicate'].includes(match.kind));
  const rows = duplicates.map(match => `<article class="duplicate-pair"><div>${duplicateToy(match.a)}${duplicateToy(match.b)}</div><p>${t(match.kind==='exact_duplicate'?'exactDuplicate':match.kind==='same_child_legacy_duplicate'?'identityKind.same_child_legacy_duplicate':'strongProbableDuplicate')}</p><button data-merge-personal="${match.a.id}" data-duplicate-id="${match.b.id}" class="primary">${t('mergeDuplicate')}</button></article>`).join('');
  const dialog = openModal(`<section class="sheet"><header><h2>${t('libraryDuplicateCheck')}</h2><button data-close>×</button></header>${rows || `<p>${t('noDuplicates')}</p>`}</section>`);
  dialog.querySelectorAll('[data-merge-personal]').forEach(button => { button.onclick=()=>{ const primary=store.state.toys.find(toy=>toy.id===button.dataset.mergePersonal); const duplicate=store.state.toys.find(toy=>toy.id===button.dataset.duplicateId); if(!primary||!duplicate||!confirm(t('confirmPersonalMerge',{source:displayName(duplicate),target:displayName(primary)})))return; store.update(state=>mergePersonalToyPair(state,primary.id,duplicate.id),'personal-duplicate-merge'); dialog.close(); }; });
  bindImages(dialog);
}
function duplicateToy(toy) { return `<div class="duplicate-toy"><img data-image='${escapedJson(toy.imageRef)}' alt=""><span><b>${escape(displayName(toy))}</b><small>${escape(brandLabel(toy.brand))}</small></span></div>`; }

function setupScrollTop() {
  const button=document.querySelector('#app-scroll-top');
  if(!button)return;
  button.setAttribute('aria-label',t('scrollToTop')); button.title=t('scrollToTop');
  button.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
  const update=()=>button.classList.toggle('hidden',window.scrollY<320);
  window.addEventListener('scroll',update,{passive:true}); update();
}
function installScrollTopButton(scroller, modal=false) {
  const button=document.createElement('button'); button.type='button'; button.className=`scroll-top ${modal?'modal-scroll-top':''} hidden`; button.textContent='↑'; button.setAttribute('aria-label',t('scrollToTop')); button.title=t('scrollToTop');
  button.onclick=()=>scroller.scrollTo({top:0,behavior:'smooth'}); scroller.append(button);
  const update=()=>button.classList.toggle('hidden',scroller.scrollTop<320); scroller.addEventListener('scroll',update,{passive:true}); update();
}

function editToy(id) {
  const toy = store.state.toys.find(item => item.id === id) || normalizeToy({});
  const dialog = openModal(`<form class="form"><header><h2>${t(id ? 'edit' : 'addToy')}</h2><button type="button" data-close>×</button></header><label>${t('brand')}<input name="brand" value="${escape(toy.brand === 'other_unspecified' ? '' : toy.brand)}"></label><label>${t('name')}<input name="productName" required value="${escape(toy.productName)}"></label><label>${t('allCategories')}<select name="categoryCode">${CATEGORY_CODES.map(code => `<option value="${code}" ${toy.categoryCode === code ? 'selected' : ''}>${t(`category.${code}`)}</option>`).join('')}</select></label><label>${t('skills')}<select name="skillCodes" multiple size="7">${SKILL_CODES.map(code => `<option value="${code}" ${toy.skillCodes.includes(code) ? 'selected' : ''}>${t(`skill.${code}`)}</option>`).join('')}</select></label><label>${t('minimumAge')}<input name="minAgeMonths" type="number" value="${toy.minAgeMonths ?? ''}"></label><label>${t('maximumAge')}<input name="maxAgeMonths" type="number" value="${toy.maxAgeMonths ?? ''}"></label><label>${t('image')}<input name="image" type="file" accept="image/*"></label><div data-personal-image-editor-host></div><p class="form-error" aria-live="polite"></p><button class="primary">${t('save')}</button></form>`);
  const toyForm=dialog.querySelector('form');
  const personalInput=toyForm.elements.image;
  let editedImageData=null;
  personalInput.addEventListener('change',()=>{ editedImageData=null; });
  attachPersonalImageEditor({ input:personalInput, host:toyForm.querySelector('[data-personal-image-editor-host]'), t, onEdited:data=>{ editedImageData=data; toyForm.querySelector('.form-error').textContent=''; } });
  toyForm.onsubmit = async event => {
    event.preventDefault();
    const form = new FormData(event.target);
    const file = form.get('image');
    if (file?.size && !editedImageData) { toyForm.querySelector('.form-error').textContent=t('finishImageEditing'); return; }
    const imageRef = editedImageData ? await images.savePersonal(editedImageData) : toy.imageRef;
    const next = normalizeToy({ ...toy, brand: form.get('brand'), productName: form.get('productName'), categoryCode: form.get('categoryCode'), skillCodes: form.getAll('skillCodes'), minAgeMonths: form.get('minAgeMonths'), maxAgeMonths: form.get('maxAgeMonths'), imageRef });
    store.update(state => { const index = state.toys.findIndex(item => item.id === next.id); if (index < 0) state.toys.push(next); else state.toys[index] = next; }, 'toy-save');
    dialog.close();
  };
}
function recognizeToy() {
  const dialog = openModal(`<form class="form"><header><h2>${t('recognizeToy')}</h2><button type="button" data-close>×</button></header><label>${t('image')}<input name="image" type="file" accept="image/*" required></label><button class="primary" type="submit">${t('recognizeToy')}</button><p class="form-error" aria-live="polite"></p></form>`);
  const form=dialog.querySelector('form');
  form.onsubmit = async event => {
    event.preventDefault();
    const submit=form.querySelector('[type="submit"]');
    const error=form.querySelector('.form-error');
    const file = new FormData(form).get('image');
    if (!file?.size || submit.disabled) return;
    submit.disabled=true;
    error.textContent='';
    try {
      let closed=false;
      await getRecognition().createDraft(file, 'auto', { onPersisted:() => { closed=true; dialog.close(); render(); } });
      if (!closed) { dialog.close(); render(); }
    } catch (failure) {
      error.textContent=messageFor(failure.code || failure.message || 'recognitionFailed');
      submit.disabled=false;
    }
  };
}

// Recognition creates a durable local draft first.  This review surface edits
// only that draft; no Toy Library ownership exists until confirm() succeeds.
function openRecognitionReview(id) {
  const draft=store.state.drafts.find(item=>item.id===id);
  if (!draft || !String(draft.status).startsWith('ready')) return;
  const pauseCodes=['not_interested','too_easy','too_hard','seasonal','space','later','other'];
  const children=Array.isArray(draft.children)?draft.children:[];
  const dialog=openModal(`<form class="form recognition-review"><header><h2>${t('recognitionReview')}</h2><button type="button" data-close>×</button></header><p>${t('localDraftOnly')}</p><label>${t('brand')}<input name="brand" value="${escape(draft.brand||'')}"></label><label>${t('name')}<input name="productName" required value="${escape(draft.productName||'')}"></label><label>${t('englishName')}<input name="nameEn" value="${escape(draft.names?.en||'')}"></label><label>${t('chineseName')}<input name="nameZh" value="${escape(draft.names?.zh||'')}"></label><label>${t('sku')}<input name="sku" value="${escape(draft.sku||'')}"></label><label>${t('allCategories')}<select name="categoryCode">${CATEGORY_CODES.map(code=>`<option value="${code}" ${draft.categoryCode===code?'selected':''}>${t(`category.${code}`)}</option>`).join('')}</select></label><label>${t('skills')}<select name="skillCodes" multiple size="6">${SKILL_CODES.map(code=>`<option value="${code}" ${(draft.skillCodes||[]).includes(code)?'selected':''}>${t(`skill.${code}`)}</option>`).join('')}</select></label><label>${t('minimumAge')}<input name="minAgeMonths" type="number" value="${draft.minAgeMonths??''}"></label><label>${t('maximumAge')}<input name="maxAgeMonths" type="number" value="${draft.maxAgeMonths??''}"></label><label>${t('rotationValue')}<select name="rotationValue">${['low','medium','high'].map(value=>`<option value="${value}" ${(draft.rotationValue||'medium')===value?'selected':''}>${value}</option>`).join('')}</select></label><label>${t('notes')}<textarea name="notes">${escape(draft.notes||'')}</textarea></label><label class="file-replace">${t('replaceImage')}<input name="image" type="file" accept="image/*" hidden></label><div data-personal-image-editor-host></div><label>${t('rotationParticipation')}<select name="rotationState"><option value="active">${t('normalRotation')}</option><option value="permanent" ${draft.reviewRotationState==='permanent'?'selected':''}>${t('draftSetPermanent')}</option><option value="paused" ${draft.reviewRotationState==='paused'?'selected':''}>${t('draftPause')}</option></select></label><label data-draft-pause-reason ${draft.reviewRotationState==='paused'?'':'hidden'}>${t('pauseReasonLabel')}<select name="pauseReasonCode">${pauseCodes.map(code=>`<option value="${code}" ${draft.pauseReasonCode===code?'selected':''}>${t(`pauseReason.${code}`)}</option>`).join('')}</select><input name="pauseReason" maxlength="240" value="${escape(draft.pauseReason||'')}"></label>${children.length?`<fieldset><legend>${t('splitSetContents')} (${children.length})</legend>${children.map((child,index)=>`<label>${index+1}. <input name="child-${index}" value="${escape(child.productName||child.name||child.names?.en||'')}"></label>`).join('')}</fieldset>`:''}<p class="form-error" aria-live="polite"></p><footer><button type="button" data-reanalyze>${t('reanalyze')}</button><button type="button" data-cancel-review>${t('cancel')}</button><button class="primary" data-destination="library">${t('addToToyLibrary')}</button><button class="primary" data-destination="wishlist">${t('addToWishlist')}</button></footer></form>`);
  const form=dialog.querySelector('form'); const input=form.elements.image; let editedImageData=null;
  input.addEventListener('change',()=>{editedImageData=null;});
  const imageEditor=attachPersonalImageEditor({input,host:form.querySelector('[data-personal-image-editor-host]'),t,initialSource:images.resolve(draft.imageRef),onEdited:data=>{editedImageData=data;form.querySelector('.form-error').textContent='';}});
  form.elements.rotationState.onchange=()=>form.querySelector('[data-draft-pause-reason]').hidden=form.elements.rotationState.value!=='paused';
  const saveDraft=async()=>{
    const values=new FormData(form); const file=values.get('image');
    if(file?.size&&!editedImageData) throw new Error('finishImageEditing');
    let imageRef=draft.imageRef; const replacedImageRef=draft.imageRef;
    if(editedImageData){imageRef=await images.savePersonal(editedImageData);editedImageData=null;}
    store.update(state=>{const item=state.drafts.find(entry=>entry.id===id);if(!item)return;Object.assign(item,{imageRef,brand:String(values.get('brand')||''),productName:String(values.get('productName')||''),names:{en:String(values.get('nameEn')||''),zh:String(values.get('nameZh')||'')},sku:String(values.get('sku')||'')||null,categoryCode:values.get('categoryCode'),skillCodes:values.getAll('skillCodes'),minAgeMonths:values.get('minAgeMonths')===''?null:Number(values.get('minAgeMonths')),maxAgeMonths:values.get('maxAgeMonths')===''?null:Number(values.get('maxAgeMonths')),rotationValue:values.get('rotationValue'),notes:String(values.get('notes')||''),reviewRotationState:values.get('rotationState'),pauseReasonCode:values.get('rotationState')==='paused'?String(values.get('pauseReasonCode')||''):null,pauseReason:values.get('rotationState')==='paused'?String(values.get('pauseReason')||''):''});item.children=(item.children||[]).map((child,index)=>({...child,productName:String(values.get(`child-${index}`)||child.productName||child.name||''),names:{...(child.names||{}),en:String(values.get(`child-${index}`)||child.names?.en||child.productName||'')}}));},'recognition-draft-review');
    if(replacedImageRef?.kind==='personal'&&replacedImageRef.id!==imageRef.id)await images.removePersonal(replacedImageRef);
  };
  form.querySelector('[data-reanalyze]').onclick=async()=>{try{editedImageData=editedImageData||imageEditor.editedDataUrl();await saveDraft();await getRecognition().analyze(id,{force:true});dialog.close();}catch(error){form.querySelector('.form-error').textContent=messageFor(error.code||error.message);}};
  form.querySelector('[data-cancel-review]').onclick=async()=>{await getRecognition().remove(id);dialog.close();};
  form.onsubmit=async event=>{event.preventDefault();try{await saveDraft();const destination=event.submitter?.dataset.destination || 'library';const result=await getRecognition().confirm(id,{destination});dialog.close();if(result?.toy){view='library';render();setTimeout(()=>document.querySelector(`[data-toy-id="${result.toy.id}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),0);}else if(result?.wishlist){view='wishlist';render();}}catch(error){form.querySelector('.form-error').textContent=messageFor(error.code||error.message||'recognitionFailed');}};
}

function installSingleLineEnterCompletion(scope) {
  scope.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.isComposing) return;
    const input=event.target;
    if (!(input instanceof HTMLInputElement) || input.disabled || input.readOnly) return;
    if (['button','checkbox','color','date','file','hidden','image','radio','range','reset','submit','time'].includes(input.type)) return;
    event.preventDefault();
    input.blur();
  });
}

function prepareSingleLineInputs(scope) {
  scope.querySelectorAll('input').forEach(input => {
    if (input.type === 'search') input.setAttribute('enterkeyhint','search');
    else if (!['button','checkbox','color','date','file','hidden','image','radio','range','reset','submit','time'].includes(input.type)) input.setAttribute('enterkeyhint','done');
  });
}
async function removeToy(id) {
  const toy = store.state.toys.find(item => item.id === id);
  if (!toy) return;
  const mode = toy.set?.kind === 'parent' ? await chooseParentDeleteMode(toy) : (confirm(t('confirmRemoveToy')) ? 'cascade_generated' : null);
  if (!mode) return;
  const deletion = deleteToyOwnership(store, id, { parentMode:mode });
  const removedIds = new Set(deletion.removed.map(item => item.id));
  const stillUsed = store.state.toys.some(item => item.imageRef?.kind === toy.imageRef?.kind && item.imageRef?.id === toy.imageRef?.id && !removedIds.has(item.id));
  if (!stillUsed) await images.removePersonal(toy.imageRef);
}

function chooseParentDeleteMode(parent) {
  const impact = parentDeleteImpact(store.state.toys, parent);
  return new Promise(resolve => {
    const dialog = openModal(`<section class="sheet"><header><h2>${t('removeSetTitle')}</h2><button type="button" data-close>×</button></header><p>${t('removeSetDescription',{count:impact.generated.length})}</p>${impact.independent.length ? `<p>${t('removeSetIndependent',{count:impact.independent.length})}</p>` : ''}<div class="actions"><button class="primary" data-mode="cascade_generated">${t('removeSetAndChildren')}</button><button data-mode="preserve_children">${t('removeSetKeepChildren')}</button><button data-mode="cancel">${t('cancel')}</button></div></section>`);
    dialog.querySelectorAll('[data-mode]').forEach(button => button.onclick = () => { const mode=button.dataset.mode; dialog.close(); resolve(mode === 'cancel' ? null : mode); });
    dialog.addEventListener('close', () => resolve(null), { once:true });
  });
}

function generateNewRotation() {
  const planning = structuredClone(store.state);
  clearManualShelfOverrides(planning);
  const result = selectRotation({ toys: planning.toys, history: planning.rotationHistory, childAgeMonths: childAgeMonths(), size: planning.settings.rotationSize });
  store.update(state => {
    persistRotationSelection(state, { selected:result.selected, diagnostics:result.diagnostics });
  }, 'rotation');
  view = 'rotation';
}

function openCatalog() {
  const includeReview = admin.enabled;
  const catalogRows = () => catalog.search({ includeReview });
  const brands = [...new Set(catalogRows().map(toy => toy.brand))].sort((a, b) => brandLabel(a).localeCompare(brandLabel(b)));
  const skills = [...new Set(catalogRows().flatMap(toy => toy.skillCodes))].sort((a, b) => t(`skill.${a}`).localeCompare(t(`skill.${b}`)));
  const mechanics = [...new Set(catalogRows().flatMap(toy => toy.playMechanics || []))].sort();
  const dialog = openModal(`<section class="sheet"><header><h2>${t('standardCatalog')}</h2><button data-close>×</button></header><input id="catalog-search" type="search" enterkeyhint="search" placeholder="${t('search')}"><div class="compact-filter-actions"><button id="catalog-filter-toggle">${t('filters')}</button><button id="catalog-clear">${t('clearFilters')}</button></div><div class="catalog-filters hidden"><select id="catalog-brand"><option value="">${t('allBrands')}</option>${brands.map(brand => `<option value="${escape(brand)}">${escape(brandLabel(brand))}</option>`).join('')}</select><select id="catalog-category"><option value="">${t('allCategories')}</option>${CATEGORY_CODES.map(code => `<option value="${code}">${t(`category.${code}`)}</option>`).join('')}</select><select id="catalog-skill"><option value="">${t('allSkills')}</option>${skills.map(code => `<option value="${code}">${t(`skill.${code}`)}</option>`).join('')}</select><select id="catalog-mechanic"><option value="">${t('allMechanics')}</option>${mechanics.map(code => `<option value="${code}">${escape(mechanicLabel(code))}</option>`).join('')}</select></div><p id="catalog-meta"></p><div id="catalog-rows" class="list"></div><button id="catalog-load-more" class="hidden">${t('loadMore')}</button></section>`);
  let catalogLimit = 40;
  const renderCatalogRows = () => { const matches=catalog.search({ query: dialog.querySelector('#catalog-search').value, brand: dialog.querySelector('#catalog-brand').value, categoryCode: dialog.querySelector('#catalog-category').value, skillCode:dialog.querySelector('#catalog-skill').value, playMechanic:dialog.querySelector('#catalog-mechanic').value, includeReview }); dialog.querySelector('#catalog-meta').textContent=t('catalogResultCount',{shown:Math.min(catalogLimit,matches.length),total:matches.length,catalog:catalogRows().length}); dialog.querySelector('#catalog-rows').innerHTML = matches.slice(0,catalogLimit).map(renderCatalogCard).join('') || renderEmpty(); dialog.querySelector('#catalog-load-more').classList.toggle('hidden',catalogLimit>=matches.length); wireCatalog(dialog); };
  const resetCatalogRows = () => { catalogLimit=40; renderCatalogRows(); };
  wireCatalog(dialog);
  dialog.querySelector('#catalog-search').oninput = resetCatalogRows;
  dialog.querySelector('#catalog-brand').onchange = resetCatalogRows;
  dialog.querySelector('#catalog-category').onchange = resetCatalogRows;
  dialog.querySelector('#catalog-skill').onchange = resetCatalogRows;
  dialog.querySelector('#catalog-mechanic').onchange = resetCatalogRows;
  dialog.querySelector('#catalog-filter-toggle').onclick=()=>dialog.querySelector('.catalog-filters').classList.toggle('hidden');
  dialog.querySelector('#catalog-load-more').onclick = () => { catalogLimit += 40; renderCatalogRows(); };
  dialog.querySelector('#catalog-clear').onclick = () => { dialog.querySelector('#catalog-search').value = ''; dialog.querySelectorAll('.catalog-filters select').forEach(select => { select.value = ''; }); resetCatalogRows(); };
  const unsubscribeCatalog = store.subscribe(() => { if (dialog.open) renderCatalogRows(); });
  dialog.addEventListener('close', unsubscribeCatalog, { once:true });
  renderCatalogRows();
}
function renderCatalogCard(toy) {
  const owned = findOwnedToy(toy, store.state.toys);
  const wished = findWishlistItem(toy, store.state.wishlist);
  const ownership = owned ? `<button disabled aria-label="${t('alreadyOwned')}">✓ ${t('alreadyOwned')}</button>` : `<button data-add="${toy.canonicalKey}" class="primary">${t('addToy')}</button>`;
  const wishlistState = owned ? '' : wished ? `<button disabled aria-label="${t('alreadyWishlisted')}">✓ ${t('alreadyWishlisted')}</button>` : `<button data-wish="${toy.canonicalKey}">${t('wishlist')}</button>`;
  const review=catalog.reviewMetadata(toy);
  const reviewBadge=admin.enabled && review ? `<p class="catalog-review-status">${t(`catalogReview.${review.status}`)}</p>` : '';
  return `<article class="card"><img data-image='${escapedJson(toy.imageRef)}' alt=""><div><h3>${escape(displayName(toy))}</h3><p>${escape(brandLabel(toy.brand))} · ${t(`category.${toy.categoryCode}`)}</p>${reviewBadge}${ownership}${wishlistState}<button data-report="${toy.canonicalKey}">Report an issue</button>${admin.enabled ? `<button data-manage="${toy.canonicalKey}">${t('edit')}</button>` : ''}</div></article>`;
}
function wireCatalog(scope) {
  scope.querySelectorAll('[data-add]').forEach(button => { button.onclick = () => addFromCatalog(button.dataset.add); });
  scope.querySelectorAll('[data-wish]').forEach(button => { button.onclick = () => addWishlist(button.dataset.wish); });
  scope.querySelectorAll('[data-manage]').forEach(button => { button.onclick = () => openCatalogManager(button.dataset.manage); });
  scope.querySelectorAll('[data-report]').forEach(button => { button.onclick = () => openCatalogReport(button.dataset.report); });
  bindImages(scope);
}
function openCatalogReport(key) {
  const toy=catalog.getByKey(key); if(!toy)return;
  const dialog=openModal(`<form class="form"><header><h2>Report an issue</h2><button type="button" data-close>×</button></header><p>${escape(displayName(toy))}</p><label>Type<select name="reportType"><option value="image_wrong">Image incorrect</option><option value="duplicate">Duplicate product</option><option value="name_wrong">Name incorrect</option><option value="brand_wrong">Brand incorrect</option><option value="sku_wrong">SKU/model incorrect</option><option value="age_wrong">Age range incorrect</option><option value="category_wrong">Category incorrect</option><option value="skills_wrong">Skills incorrect</option><option value="mechanism_wrong">Core play mechanism incorrect</option><option value="parent_child_wrong">Parent/child relationship incorrect</option><option value="retired">Retired/nonexistent</option><option value="other">Other</option></select></label><label>Description<textarea name="description" maxlength="1200"></textarea></label><label>Optional screenshot<input name="attachment" type="file" accept="image/jpeg,image/png,image/webp"></label><button class="primary">Submit</button><p id="report-status"></p></form>`);
  dialog.querySelector('form').onsubmit=async event=>{event.preventDefault();const form=new FormData(event.target);const file=form.get('attachment');let optionalAttachment=null;if(file?.size){if(file.size>700000){dialog.querySelector('#report-status').textContent='Attachment must be 700 KB or smaller.';return;}optionalAttachment=await fileToDataUrl(file);}await governance.submitReport({canonicalKey:toy.canonicalKey,reportType:form.get('reportType'),description:form.get('description'),optionalAttachment,attachmentConsent:Boolean(optionalAttachment),catalogVersion:store.state.catalogState?.syncMetadata?.lastAppliedRemoteCatalogVersion||0,appVersion:window.TOY_ROTATION_CONFIG?.RELEASE||''});dialog.querySelector('#report-status').textContent='Submitted';};
}
async function addFromCatalog(key) {
  const source = catalog.getByKey(key);
  if (!source || findOwnedToy(source, store.state.toys)) return;
  const imageRef = await images.copyToPersonal(source.imageRef);
  const result = addCatalogToy(store, source, imageRef || source.imageRef);
  if (result.added) catalog.ensureSetChildren();
}
function addWishlist(key) { const source = catalog.getByKey(key); if (!source) return; store.update(state => { if (!findOwnedToy(source,state.toys) && !findWishlistItem(source,state.wishlist)) state.wishlist.push({ id: crypto.randomUUID(), canonicalKey: source.canonicalKey, catalogId: source.id, catalogSnapshot:source, status: 'want', addedAt: new Date().toISOString() }); }, 'wishlist-add'); }

function openCatalogManager(key) {
  const toy = catalog.getByKey(key); if (!toy || !admin.enabled) return;
  const mechanics = [...new Set(catalog.active.flatMap(item => item.playMechanics || []))].sort((a,b) => mechanicLabel(a).localeCompare(mechanicLabel(b)));
  const mergeTargets = catalog.active.filter(item => item.canonicalKey !== toy.canonicalKey);
  const skillChoices = SKILL_CODES.map(code => `<label class="choice"><input type="checkbox" name="skillCodes" value="${code}" ${toy.skillCodes.includes(code) ? 'checked' : ''}><span>${t(`skill.${code}`)}</span></label>`).join('');
  const mechanicChoices = mechanics.map(code => `<label class="choice"><input type="checkbox" name="playMechanics" value="${code}" ${toy.playMechanics.includes(code) ? 'checked' : ''}><span>${escape(mechanicLabel(code))}</span></label>`).join('');
  const dialog = openModal(`<form class="form admin-editor"><header><h2>${t('adminCatalogEditor')}</h2><button type="button" data-close>×</button></header><section><h3>${t('basicInformation')}</h3><label>${t('brand')}<input name="brand" value="${escape(toy.brand)}"></label><label>${t('englishName')}<input name="productName" value="${escape(toy.names?.en || toy.productName)}"></label><label>${t('chineseName')}<input name="nameZh" value="${escape(toy.names?.zh || '')}"></label><label>${t('aliases')}<textarea name="aliases" rows="2">${escape((toy.aliases || []).join(', '))}</textarea></label><div class="field-grid"><label>${t('minimumAge')}<input name="minAgeMonths" type="number" value="${toy.minAgeMonths ?? ''}"></label><label>${t('maximumAge')}<input name="maxAgeMonths" type="number" value="${toy.maxAgeMonths ?? ''}"></label></div><label>${t('allCategories')}<select name="categoryCode">${CATEGORY_CODES.map(code => `<option value="${code}" ${toy.categoryCode === code ? 'selected' : ''}>${t(`category.${code}`)}</option>`).join('')}</select></label></section><section><h3>${t('skills')}</h3><div class="choice-grid">${skillChoices}</div></section><section><h3>${t('playMechanics')}</h3><div class="choice-grid">${mechanicChoices}</div></section><section class="catalog-image-editor"><h3>${t('catalogImage')}</h3><img id="catalog-image-preview" data-image='${escapedJson(toy.imageRef)}' alt=""><p>${t('catalogImageOwnershipHint')}</p><label class="button-label">${t('replaceImage')}<input name="catalogImage" type="file" accept="image/*" class="visually-hidden"></label><div data-catalog-image-editor-host></div></section><details><summary>${t('advancedManagement')}</summary><p><b>${t('canonicalIdentity')}:</b> ${escape(toy.canonicalKey)}</p><p><b>${t('catalogSource')}:</b> ${t(catalogSourceKey(toy.source))}</p><label>${t('searchMergeTarget')}<input id="merge-search" type="search" placeholder="${t('search')}"></label><label>${t('mergeTarget')}<select id="merge-target" size="5"><option value="">${t('selectMergeTarget')}</option>${mergeTargets.slice(0,150).map(mergeOption).join('')}</select></label><button type="button" id="catalog-merge">${t('mergeDuplicate')}</button><button type="button" id="catalog-delete" class="danger">${t('permanentDelete')}</button></details><button class="primary">${t('save')}</button><p id="catalog-admin-error"></p></form>`);
  const form = dialog.querySelector('form');
  bindImages(dialog);
  const fileInput = form.elements.catalogImage;
  let editedCatalogImageData = null;
  const initialCatalogSource = toy.imageRef?.kind === 'generated' || toy.imageRef?.kind === 'placeholder' ? null : images.resolve(toy.imageRef);
  const catalogImageEditor = attachImageEditor({
    input:fileInput,
    host:form.querySelector('[data-catalog-image-editor-host]'),
    t,
    title:t('catalogImage'),
    initialSource:initialCatalogSource,
    onEdited:data => {
      editedCatalogImageData = data;
      if (data) dialog.querySelector('#catalog-image-preview').src = data;
      form.querySelector('#catalog-admin-error').textContent = '';
    }
  });
  void catalogImageEditor.ready;
  form.onsubmit = async event => { event.preventDefault(); try { const values = new FormData(form); const patch = { brand: values.get('brand'), productName: values.get('productName'), names: { en: values.get('productName'), zh: values.get('nameZh') }, aliases: String(values.get('aliases')).split(',').map(value => value.trim()).filter(Boolean), minAgeMonths:values.get('minAgeMonths'), maxAgeMonths:values.get('maxAgeMonths'), categoryCode:values.get('categoryCode'), skillCodes:values.getAll('skillCodes'), playMechanics:values.getAll('playMechanics') }; if (editedCatalogImageData) { const localCatalogRef=await images.saveCatalog(editedCatalogImageData,toy.canonicalKey); patch.imageRef={ ...localCatalogRef, imageOwnerCanonicalKey:toy.canonicalKey, imageSource:'admin_upload', imageSourceType:'admin_upload', verificationStatus:'manually_confirmed', updatedAt:new Date().toISOString() }; patch.imageUrl=await admin.replaceCatalogImage(toy.canonicalKey,editedCatalogImageData); } await admin.edit(toy.canonicalKey, patch); editedCatalogImageData=null; fileInput.value=''; form.querySelector('#catalog-admin-error').textContent='Saved'; } catch (error) { dialog.querySelector('#catalog-admin-error').textContent = messageFor(error.message); } };
  const renderMergeTargets = () => { const query=dialog.querySelector('#merge-search').value.normalize('NFKC').toLowerCase(); const target=dialog.querySelector('#merge-target'); target.innerHTML=`<option value="">${t('selectMergeTarget')}</option>`+mergeTargets.filter(item=>!query||[item.brand,item.productName,item.names?.zh,...(item.aliases||[])].join(' ').normalize('NFKC').toLowerCase().includes(query)).slice(0,150).map(mergeOption).join(''); };
  dialog.querySelector('#merge-search').oninput = renderMergeTargets;
  dialog.querySelector('#catalog-merge').onclick = async () => { const target=dialog.querySelector('#merge-target').value; if (!target || !confirm(t('confirmMerge', { source:displayName(toy), target:displayName(catalog.getByKey(target)) }))) return; try { await admin.merge(toy.canonicalKey, target); dialog.close(); } catch(error) { dialog.querySelector('#catalog-admin-error').textContent=messageFor(error.message); } };
  dialog.querySelector('#catalog-delete').onclick = async () => { if (!confirm(t('confirmDelete')) || !confirm(t('confirmDeletePermanent'))) return; try { await admin.delete(toy.canonicalKey, toy); dialog.close(); } catch (error) { dialog.querySelector('#catalog-admin-error').textContent = messageFor(error.message); } };
}

function mergeOption(item) { return `<option value="${escape(item.canonicalKey)}">${escape(brandLabel(item.brand))} · ${escape(displayName(item))}</option>`; }
function catalogSourceKey(source) { return ({ base:'catalogSourceBase', remote:'catalogSourceRemote', learned:'catalogSourceLearned', admin:'catalogSourceAdmin' })[source] || 'catalogSourceOther'; }

function openSettings() {
  const recoveryNotice=!store.canPersist ? `<p class="danger">${t('persistenceRecoverySettingsNotice')}</p>` : '';
  const dialog = openModal(`<form class="form"><header><h2>${t('settings')}</h2><button type="button" data-close>×</button></header>${recoveryNotice}<label>${t('language')}<select name="language"><option value="system">${t('system')}</option><option value="en">${t('languageEnglish')}</option><option value="zh">${t('languageChinese')}</option></select></label><label>${t('theme')}<select name="theme"><option value="system">${t('system')}</option><option value="light">${t('light')}</option><option value="dark">${t('dark')}</option></select></label><hr>${profileSettingsFields()}<button class="primary" ${store.canPersist?'':'disabled'}>${t('save')}</button><button type="button" id="backup-export" ${store.canPersist?'':'disabled'}>${t('exportBackup')}</button><button type="button" id="persistence-diagnostic-export">${t('exportPersistenceDiagnostic')}</button><label>${t('restoreBackup')}<input id="backup-import" type="file" accept="application/json" ${store.canPersist?'':'disabled'}></label><p id="backup-restore-status" role="status" aria-live="polite"></p>${admin.enabled ? `<button type="button" id="restore-diagnostic-export">${t('exportRestoreDiagnostic')}</button><button type="button" id="manager-open">${t('managerDashboard')}</button>` : ''}<button type="button" id="admin-open">${admin.enabled ? t('signOut') : t('adminMode')}</button></form>`);
  const form = dialog.querySelector('form'); form.language.value = store.state.settings.language; form.theme.value = store.state.settings.theme;
  if (!store.canPersist) form.querySelectorAll('input, select, textarea').forEach(control => { if (control.id !== 'persistence-diagnostic-export') control.disabled = true; });
  const applyPreview = () => {
    dialog.close();
    store.update(state => Object.assign(state.settings, { language: form.language.value, theme: form.theme.value }), 'settings-preview');
    openSettings();
  };
  form.language.onchange = applyPreview;
  form.theme.onchange = applyPreview;
  wireProfileSettingsForm(dialog);
  form.onsubmit = event => { event.preventDefault(); store.update(state => Object.assign(state.settings, { language: form.language.value, theme: form.theme.value }), 'settings'); saveProfileSettingsFromForm(form); dialog.close(); };
  dialog.querySelector('#backup-export').onclick = async () => downloadJson(await exportBackup(store, images), 'toy-rotation-backup.json');
  dialog.querySelector('#backup-import').onchange = async event => {
    const file = event.target.files?.[0]; if (!file) return;
    const input = event.currentTarget; const status = dialog.querySelector('#backup-restore-status');
    const controls = [...form.querySelectorAll('button:not([data-close]), input, select, textarea')];
    const setStatus = (key, params = {}) => { status.textContent = t(key, params); };
    const stageStatus = name => ({
      backup_validation_start:'restoreChecking', detached_staging_start:'restoreRepairing',
      migrations_start:'restoreRepairing', parent_child_reconciliation_start:'restoreRepairing',
      backup_image_import_start:'restoreSaving', image_metadata_validation_start:'restoreChecking',
      atomic_commit_start:'restoreSaving', persistence_complete:'restoreSaving', restore_complete:'restoreComplete'
    }[name] || null);
    const trace = createRestoreTrace();
    try {
      controls.forEach(control => { control.disabled = true; });
      trace.mark('file_input_change', { name:file.name, size:file.size, mime:file.type || null });
      trace.mark('restore_handler_enter'); trace.mark('file_selected', { name:file.name, size:file.size, mime:file.type || null }); setStatus('restoreReading');
      const source = await readRestoreFile(file, trace);
      trace.mark('json_parse_start'); const payload = JSON.parse(source); trace.mark('json_parse_end', { schemaVersion:payload.schemaVersion ?? null, format:payload.format || null });
      trace.mark('backup_service_enter');
      const restored = await restoreBackup(payload, store, images, { catalog, trace, onStage:({ name }) => { const key=stageStatus(name); if (key) setStatus(key); } });
      trace.mark('ui_refresh_frame_wait_start'); await nextPaint(); trace.mark('ui_refresh_frame_end');
      const repaired = restored.historicalReferenceRepair?.remapped + restored.historicalReferenceRepair?.markedMissing || 0;
      setStatus(repaired ? 'restoreCompleteWithHistoricalRepair' : 'restoreComplete', { count:repaired });
    } catch (error) {
      trace.mark('restore_handler_failed', { success:false, errorName:error?.name || 'Error', errorMessage:error?.message || 'restoreFailed' }); trace.fail(error);
      setStatus('restoreFailed', { stage:globalThis.__TOY_ROTATION_RESTORE_TIMING__?.latestStage || 'unknown' });
      console.error('Backup restore failed', error);
    } finally {
      controls.forEach(control => { control.disabled = false; });
      input.value = '';
    }
  };
  dialog.querySelector('#restore-diagnostic-export')?.addEventListener('click', exportRestoreDiagnostic);
  dialog.querySelector('#persistence-diagnostic-export')?.addEventListener('click', exportPersistenceDiagnostic);
  dialog.querySelector('#admin-open').onclick = () => admin.enabled ? (admin.signOut(), openSettings()) : openAdmin();
  dialog.querySelector('#manager-open')?.addEventListener('click', openManagerDashboard);
}
async function readRestoreFile(file, trace) {
  try {
    trace.mark('file_text_start'); const source = await file.text(); trace.mark('file_text_end', { bytes:source.length });
    return source;
  } catch (error) {
    trace.mark('file_text_failed', { success:false, errorName:error?.name || 'Error', errorMessage:error?.message || 'fileTextFailed' });
    trace.mark('file_reader_fallback_start');
    const source = await readFileWithReader(file);
    trace.mark('file_reader_fallback_end', { bytes:source.length });
    return source;
  }
}
function readFileWithReader(file) { return new Promise((resolve, reject) => { const reader=new FileReader(); reader.onload=()=>resolve(String(reader.result || '')); reader.onerror=()=>reject(reader.error || new Error('fileReaderFailed')); reader.onabort=()=>reject(new Error('fileReaderAborted')); reader.readAsText(file); }); }
function nextPaint() { return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); }
function exportRestoreDiagnostic() { downloadJson(buildRestoreDiagnostic({ trace:window.__TOY_ROTATION_RESTORE_TIMING__ || null, release:window.TOY_ROTATION_CONFIG?.RELEASE }), `toy-rotation-restore-diagnostic-${new Date().toISOString().replace(/[:.]/g, '-')}.json`); }
async function exportPersistenceDiagnostic() { downloadJson(await buildPersistenceDiagnostic({ store, images, release:window.TOY_ROTATION_CONFIG?.RELEASE }), `toy-rotation-persistence-diagnostic-${new Date().toISOString().replace(/[:.]/g, '-')}.json`); }
function applyPersistenceRecovery() {
  if (!confirm(t('confirmDetectedRecovery'))) return;
  try {
    const result=applyDetectedLegacyRecovery();
    if (!result.ok) throw new Error(result.status);
    location.reload();
  } catch (error) { alert(messageFor(error.message)); }
}
function profileSettingsFields() {
  const profile = store.state.profile;
  const days = Number(store.state.settings.rotationDays) || 7;
  const preset = [7, 10, 14].includes(days) ? String(days) : 'custom';
  return `<h3>${t('childProfile')}</h3><label>${t('childName')}<input name="childName" value="${escape(profile.childName || '')}"></label><label>${t('birthDate')}<input name="childBirthDate" type="date" value="${escape(profile.childBirthDate || '')}" required></label><h3>${t('rotationSettings')}</h3><label>${t('targetShelfCount')}<input name="rotationSize" type="number" min="1" max="50" value="${store.state.settings.rotationSize}"></label><label>${t('rotationInterval')}<select name="rotationDays"><option value="7">7 ${t('dayUnit')}</option><option value="10">10 ${t('dayUnit')}</option><option value="14">14 ${t('dayUnit')}</option><option value="custom">${t('custom')}</option></select></label><label class="rotation-custom ${preset === 'custom' ? '' : 'hidden'}">${t('customRotationDays')}<input name="rotationDaysCustom" type="number" min="1" max="90" value="${preset === 'custom' ? days : ''}"></label>`;
}
function wireProfileSettingsForm(dialog, { onboarding = false } = {}) {
  const form = dialog.querySelector('form');
  const days = Number(store.state.settings.rotationDays) || 7;
  form.rotationDays.value = [7, 10, 14].includes(days) ? String(days) : 'custom';
  form.rotationDays.onchange = () => form.querySelector('.rotation-custom').classList.toggle('hidden', form.rotationDays.value !== 'custom');
  if (onboarding) form.onsubmit = event => { event.preventDefault(); saveProfileSettingsFromForm(form); dialog.close(); };
}
function saveProfileSettingsFromForm(form) {
  const selectedDays = form.rotationDays.value === 'custom' ? form.rotationDaysCustom.value : form.rotationDays.value;
  saveProfileAndRotationSettings(store, { childName:form.childName.value, childBirthDate:form.childBirthDate.value, rotationSize:form.rotationSize.value, rotationDays:selectedDays });
}
async function openManagerDashboard({ repairMessage = '' } = {}) {
  if (!admin.enabled) return;
  const review = store.state.catalogState?.syncMetadata?.identityReviewV10 || { ignoredPairs:[] };
  const ignored = new Set(review.ignoredPairs || []);
  const duplicates = findDuplicates(store.state.toys).filter(match => !ignored.has(identityPairKey(match)));
  const relationships = auditIdentityRelationships(store.state.toys);
  const setAudit = auditSetIntegrity(store.state.toys);
  const setDefinitions = new Map(catalog.active.map(toy => [canonicalKey(toy.canonicalKey), toy]));
  const structureDamageCandidates = classifyStructureMigrationDamage(store.state, setDefinitions)
    .filter(candidate => candidate.kind === 'probable_structure_migration_damage');
  const pending = store.state.drafts || [];
  const learned = catalog.pendingLearned();
  const relationInfo = relationships.filter(item => ['parent_child_relation','sibling_child','related_variant'].includes(item.kind));
  const rotationDiagnostics = store.state.rotationHistory?.find(round => round.rotationDiagnostics)?.rotationDiagnostics || null;
  const rotationDiagnosticPanel = rotationDiagnostics ? `<h3>${t('rotationDiagnostics')}</h3><div class="panel"><p>${t('rotationDiagnosticSummary',{requested:rotationDiagnostics.requestedRotationCount ?? rotationDiagnostics.requestedCount,selected:rotationDiagnostics.selectedRotationCount ?? rotationDiagnostics.selectedCount,permanent:rotationDiagnostics.permanentCount ?? 0,total:rotationDiagnostics.totalShelfCount ?? rotationDiagnostics.selectedCount,eligible:rotationDiagnostics.eligibleRotationCount ?? rotationDiagnostics.eligibleCount})}</p><p>${t('rotationDiagnosticShortage',{count:rotationDiagnostics.shortageCount})}</p><details><summary>${t('rotationDiagnosticDetails')}</summary><pre>${escape(JSON.stringify({ exclusionSummary:rotationDiagnostics.exclusionSummary, selectedBrandCounts:rotationDiagnostics.selectedBrandCounts, selectedOwnershipGroupCounts:rotationDiagnostics.selectedOwnershipGroupCounts, previousRotationOverlap:rotationDiagnostics.previousRotationOverlap, recent3RotationOverlap:rotationDiagnostics.recent3RotationOverlap, brandDiversityPenaltyApplied:rotationDiagnostics.brandDiversityPenaltyApplied, groupDiversityPenaltyApplied:rotationDiagnostics.groupDiversityPenaltyApplied, recencyPenaltyApplied:rotationDiagnostics.recencyPenaltyApplied }, null, 2))}</pre></details></div>` : '';
  const dialog = openModal(`<section class="sheet"><header><h2>${t('managerDashboard')}</h2><button data-close>×</button></header>${repairMessage ? `<div class="panel repair-success" role="status"><b>${escape(repairMessage)}</b></div>` : ''}<button id="manager-catalog" class="primary">${t('manageStandardCatalog')}</button>
    <section class="panel"><h3>Catalog Governance</h3><p id="catalog-governance-summary">Loading…</p><button id="catalog-governance-open" class="primary">Candidates / Reports</button></section>
    <h3>${t('pendingCatalogReview')}</h3>${pending.length || learned.length ? `${learned.map(item => `<div class="panel"><b>${escape(displayName(item))}</b><p>${t('catalogSourceLearned')} · ${t('pendingReview')}</p><button data-learned-approve="${escape(item.canonicalKey)}" class="primary">${t('approve')}</button><button data-learned-manage="${escape(item.canonicalKey)}">${t('edit')}</button></div>`).join('')}${pending.map(draft => `<div class="panel"><b>${escape(draft.productName || t('pendingReview'))}</b><p>${t(`recognition${capitalize(draft.status)}`)}${draft.error ? ` · ${escape(messageFor(draft.error))}` : ''}</p>${renderRecognitionDiagnostic(draft.diagnostics)}${String(draft.status).startsWith('ready') ? `<button data-draft-confirm="${draft.id}" class="primary">${t('approve')}</button>` : ''}<button data-admin-edit-draft="${draft.id}">${t('edit')}</button><button data-draft-remove="${draft.id}">${t('reject')}</button></div>`).join('')}` : `<p>${t('noPendingReview')}</p>`}
    <h3>${t('identityConflicts')}</h3>${duplicates.length ? duplicates.map(match => renderIdentityConflict(match)).join('') : `<p>${t('noDuplicates')}</p>`}
    <h3>${t('setStructureIssues')}</h3>${structureDamageCandidates.map(candidate => renderStructureDamageCandidate(candidate)).join('')}<div class="panel"><p>${t('setAuditSummary',{parents:setAudit.parents,children:setAudit.children,issues:setAudit.unresolved})}</p><button id="admin-repair-set" class="secondary">${t('autoRepair')}</button>${setAudit.issues.length ? setAudit.issues.slice(0,8).map(issue => `<p>${escape(setIssueLabel(issue))}</p>`).join('') : `<p>${t('noSetStructureIssues')}</p>`}</div>
    <h3>${t('imageProblems')}</h3><div class="panel"><div id="admin-image-diagnostics">${t('loading')}</div><button id="admin-image-audit">${t('autoRelinkImages')}</button></div>
    <h3>${t('dataDiagnostics')}</h3><div class="panel"><p>${t('identityAuditSummary',{relations:relationInfo.length,unresolved:setAudit.unresolved})}</p><p>${t('identityEngineSeparation')}</p><p>${t('startupStatus',{stage:startupTrace.latestStage})}</p><p><b>${escape(window.TOY_ROTATION_CONFIG?.RELEASE || 'development')}</b><br><code>${IMAGE_RESOLVER_BUILD_MARKER}</code></p><button id="admin-export-runtime-image-diagnostic" class="primary">${t('exportRuntimeImageDiagnostic')}</button><p>${t('exportRuntimeImageDiagnosticHint')}</p><button id="admin-export-restore-diagnostic">${t('exportRestoreDiagnostic')}</button><button id="admin-export-data-repair-diagnostic">${t('exportDataRepairDiagnostic')}</button><p>${t('exportDataRepairDiagnosticHint')}</p></div>
    ${rotationDiagnosticPanel}
    <h3>${t('backendDiagnostics')}</h3><div id="admin-diagnostics" class="panel">${t('loading')}</div></section>`);
  dialog.querySelector('#manager-catalog').onclick = openCatalog;
  dialog.querySelector('#catalog-governance-open').onclick = () => openCatalogGovernance();
  admin.governance().then(info => { const node=dialog.querySelector('#catalog-governance-summary'); if(node) node.textContent=`Remote v${info.version ?? '—'} · Candidates (${info.candidateUnread}) · Reports (${info.reportUnread})`; }).catch(() => { const node=dialog.querySelector('#catalog-governance-summary'); if(node) node.textContent='Remote Catalog Sync unavailable'; });
  dialog.querySelectorAll('[data-learned-manage]').forEach(button => button.onclick = () => {
    dialog.close(); openCatalogManager(button.dataset.learnedManage);
  });
  dialog.querySelectorAll('[data-learned-approve]').forEach(button => button.onclick = () => {
    catalog.approveLearnedCandidate(button.dataset.learnedApprove); dialog.close(); openManagerDashboard();
  });
  dialog.querySelectorAll('[data-draft-confirm]').forEach(button => button.onclick = () => { getRecognition().confirm(button.dataset.draftConfirm); dialog.close(); });
  dialog.querySelectorAll('[data-draft-remove]').forEach(button => button.onclick = () => { getRecognition().remove(button.dataset.draftRemove); dialog.close(); });
  dialog.querySelectorAll('[data-admin-open-personal-duplicates]').forEach(button => button.onclick = () => {
    dialog.close(); view = 'library'; render(); openLibraryDuplicateScan();
  });
  dialog.querySelectorAll('[data-admin-ignore]').forEach(button => button.onclick = () => {
    store.update(state => { state.catalogState.syncMetadata ||= {}; const entry=state.catalogState.syncMetadata.identityReviewV10 ||= { ignoredPairs:[] }; entry.ignoredPairs=[...new Set([...(entry.ignoredPairs || []), button.dataset.adminIgnore])]; }, 'admin-identity-ignore');
    dialog.close(); openManagerDashboard();
  });
  dialog.querySelector('#admin-repair-set').onclick = () => { catalog.repairSetStructure(); dialog.close(); openManagerDashboard(); };
  dialog.querySelectorAll('[data-restore-structure-children]').forEach(button => button.onclick = () => {
    const parentId = button.dataset.restoreStructureChildren;
    const candidate = structureDamageCandidates.find(item => item.parentId === parentId);
    if (!candidate) return;
    const parent = store.state.toys.find(toy => toy.id === parentId);
    if (!window.confirm(t('confirmRestoreMissingChildren', { count:candidate.expectedChildCount, name:displayName(parent || {}) }))) return;
    button.disabled = true;
    let result;
    store.update(state => { result = repairStructureMigrationDamage(state, setDefinitions, { confirmedParentIds:[parentId] }); }, 'structure-migration-damage-repair');
    dialog.close();
    openManagerDashboard({ repairMessage:result?.restoredChildren ? t('restoredMissingChildren',{count:result.restoredChildren}) : t('noMissingChildrenRestored') });
  });
  dialog.querySelector('#admin-image-audit').onclick = async () => { await auditToyLibraryImages({ store, images, catalog }); await auditStandardCatalogImages({ store, catalog }); refreshImageAudit(dialog); };
  dialog.querySelector('#admin-export-data-repair-diagnostic').onclick = () => {
    const diagnostic = buildDataRepairDiagnostic({ store, catalog, release:window.TOY_ROTATION_CONFIG?.RELEASE, lifecycle:diagnosticLifecycle, startupTrace, restoreTiming:window.__TOY_ROTATION_RESTORE_TIMING__ || null });
    downloadJson(diagnostic, `toy-rotation-data-repair-diagnostic-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  };
  dialog.querySelector('#admin-export-runtime-image-diagnostic').onclick = async () => {
    captureLoveveryImageSweep('admin_export_probe');
    const diagnostic = await runtimeImageDiagnostics.buildExport({ store, catalog });
    downloadJson(diagnostic, `toy-rotation-runtime-child-image-diagnostic-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  };
  dialog.querySelector('#admin-export-restore-diagnostic').onclick = exportRestoreDiagnostic;
  refreshImageAudit(dialog);
  try {
    const result = await admin.diagnostics();
    const quota = result.quota ? `<pre>${escape(JSON.stringify(result.quota, null, 2))}</pre>` : `<p>${t('quotaUnavailable')}</p>`;
    const status = result.backend === 'available' ? t('backendAvailable') : t('backendUnavailable');
    const imageAudit = store.state.catalogState?.syncMetadata?.imageAuditV7;
    const catalogImageAudit = store.state.catalogState?.syncMetadata?.catalogImageAuditV12;
    const imageAuditText = imageAudit?.pending ? t('imageAuditPending', { count:imageAudit.missingToyIds?.length || 0 }) : t('imageAuditComplete');
    const imageAuditStats = imageAudit ? t('imageAuditStats', { total:imageAudit.totalToyCount || 0, verified:imageAudit.verified || 0, restored:imageAudit.restored || 0, orphan:imageAudit.orphanImageCount || 0, missing:imageAudit.unrecoverableCount || 0 }) : '';
    const catalogImageAuditStats = catalogImageAudit ? t('catalogImageAuditStats', { total:catalogImageAudit.totalCatalogCount || 0, verified:catalogImageAudit.verifiedRealImage || 0, stable:catalogImageAudit.stableRemoteImage || 0, confirmed:catalogImageAudit.manuallyConfirmedImage || 0, placeholder:catalogImageAudit.placeholder || 0, broken:catalogImageAudit.broken || 0, remote:catalogImageAudit.remoteFetchFailure || 0, mismatch:catalogImageAudit.identityMismatch || 0, metadata:catalogImageAudit.missingMetadata || 0, missing:catalogImageAudit.noImage || 0 }) : '';
    const childAudit = store.state.catalogState?.syncMetadata?.parentChildReconciliationV12 || store.state.catalogState?.syncMetadata?.parentChildReconciliationV11 || store.state.catalogState?.syncMetadata?.parentChildReconciliationV10;
    const childAuditStats = childAudit ? t('parentChildAuditStats', { added:childAudit.added || 0, merged:childAudit.merged || 0, remapped:childAudit.remapped || 0 }) : '';
    const target = dialog.querySelector('#admin-diagnostics');
    if (target) target.innerHTML = `<b>${status}</b><p>${t('pendingSync', { count: result.pendingDeletes.length })}</p><p>${escape(imageAuditText)}</p><p>${escape(imageAuditStats)}</p><p>${escape(catalogImageAuditStats)}</p><p>${escape(childAuditStats)}</p>${quota}`;
  } catch (error) {
    const target = dialog.querySelector('#admin-diagnostics');
    if (target) target.textContent = messageFor(error.message);
  }
}
function renderStructureDamageCandidate(candidate) {
  const parent = store.state.toys.find(toy => toy.id === candidate.parentId);
  if (!parent) return '';
  return `<article class="panel structure-repair-candidate"><b>${escape(displayName(parent))}</b><p>${t('structureDamageCurrent',{children:candidate.currentChildCount})}</p><p>${t('structureDamageExpected',{children:candidate.expectedChildCount})}</p><p>${t('structureDamageNoDeletion')}</p><p>${t('structureDamageExplanation')}</p><small>${t('needsConfirmation')}</small><button class="primary" data-restore-structure-children="${escape(candidate.parentId)}">${t('restoreMissingChildren')}</button></article>`;
}
function renderRecognitionDiagnostic(diagnostics) {
  if (!diagnostics) return '';
  const status = diagnostics.httpStatus == null ? '—' : diagnostics.httpStatus;
  const duration = Number.isFinite(diagnostics.durationMs) ? `${diagnostics.durationMs} ms` : '—';
  const matched = diagnostics.catalogMatch ? `${diagnostics.catalogMatch.brand || ''} ${diagnostics.catalogMatch.productName || diagnostics.catalogMatch.canonicalKey}`.trim() : t('recognitionCatalogUnmatched');
  return `<details class="recognition-diagnostic"><summary>${t('recognitionDiagnostic')}</summary><p>${t('recognitionDiagnosticRequest', { id:diagnostics.clientRequestId || '—', device:diagnostics.deviceIdPresent ? t('yes') : t('no') })}</p><p>${t('recognitionDiagnosticResponse', { status, duration, provider:diagnostics.provider || '—', quota:formatDiagnosticValue(diagnostics.quota) })}</p><p>${t('recognitionDiagnosticCatalog', { result:matched })}</p></details>`;
}
function formatDiagnosticValue(value) { return value == null ? '—' : typeof value === 'object' ? escape(JSON.stringify(value)) : escape(String(value)); }

function renderIdentityConflict(match) {
  const personal = Boolean(match.a?.id && match.b?.id);
  return `<div class="panel"><b>${t(`identityKind.${match.kind}`)}</b><div class="duplicate-pair"><div>${duplicateToy(match.a)}${duplicateToy(match.b)}</div></div><small>${t('identityReason',{reason:match.reasons.join(', ')})}</small><p>${t('canonicalPair',{left:match.a.canonicalKey,right:match.b.canonicalKey})}</p><p>${t(match.kind === 'same_child_legacy_duplicate' ? 'sameChildImageProvenance' : 'reviewIdentityEvidence')}</p>${personal ? `<button data-admin-open-personal-duplicates class="primary">${t('openDuplicateReview')}</button>` : ''}<button data-admin-ignore="${identityPairKey(match)}">${t('confirmNotDuplicate')}</button></div>`;
}
function identityPairKey(match) { return [match.a.id,match.b.id].sort().join('|'); }
function setIssueLabel(issue) { return issue.type === 'parent_image_on_child' ? t('setIssueParentImage',{name:displayName(issue.child)}) : issue.type === 'orphan_child' ? t('setIssueOrphan',{name:displayName(issue.child)}) : t('setIssueDuplicateChild',{name:displayName(issue.a)}); }
function refreshImageAudit(dialog) {
  const audit = store.state.catalogState?.syncMetadata?.imageAuditV7;
  const catalogAudit = store.state.catalogState?.syncMetadata?.catalogImageAuditV12;
  const target = dialog.querySelector('#admin-image-diagnostics');
  if (target) target.innerHTML = `${escape(audit ? t('imageAuditStats',{total:audit.totalToyCount || 0,verified:audit.verified || 0,restored:audit.restored || 0,orphan:audit.orphanImageCount || 0,missing:audit.unrecoverableCount || 0}) : t('imageAuditPending',{count:0}))}<br>${escape(catalogAudit ? t('catalogImageAuditStats',{total:catalogAudit.totalCatalogCount || 0,verified:catalogAudit.verifiedRealImage || 0,stable:catalogAudit.stableRemoteImage || 0,confirmed:catalogAudit.manuallyConfirmedImage || 0,placeholder:catalogAudit.placeholder || 0,broken:catalogAudit.broken || 0,remote:catalogAudit.remoteFetchFailure || 0,mismatch:catalogAudit.identityMismatch || 0,metadata:catalogAudit.missingMetadata || 0,missing:catalogAudit.noImage || 0}) : t('catalogImageAuditPending'))}`;
}
async function openCatalogGovernance() {
  if (!admin.enabled) return;
  const dialog=openModal(`<section class="sheet"><header><h2>Catalog Governance</h2><button data-close>×</button></header><p>Loading…</p></section>`);
  await renderGovernanceList(dialog);
}
async function renderGovernanceList(dialog, preservedScroll = 0) {
  let info;
  try { info=await admin.governance(); } catch (error) { dialog.querySelector('.sheet').innerHTML=`<header><h2>Catalog Governance</h2><button data-close>×</button></header><p>${escape(messageFor(error.message))}</p>`; return; }
  const candidateRow=row=>`<article class="panel governance-row">${candidateReviewThumbnail(row)}<div><b>${escape(row.nameEn || row.proposedCanonicalKey)}</b><p>${escape(row.brand || '')} · ${escape(row.candidateType || '')} · ${escape(row.status)}</p><button data-governance-open="candidate:${escape(row.candidateId)}">Open</button></div></article>`;
  const reportRow=row=>`<article class="panel governance-row"><div><b>${escape(row.canonicalKey || '')}</b><p>${escape(row.reportType || '')} · ${escape(row.status)}</p><button data-governance-open="report:${escape(row.reportId)}">Open</button></div></article>`;
  const pending=(info.pending||[]).map(row=>`<article class="panel"><b>v${escape(row.version)}</b> · ${escape(row.change?.type||'')} · ${escape(row.change?.canonicalKey||'')}<p>${escape(row.status)} ${escape(row.lastError||'')}</p><button data-governance-retry="${escape(row.change?.mutationId||'')}">Retry</button></article>`).join('') || '<p>0</p>';
  dialog.innerHTML=`<section class="sheet"><header><h2>Catalog Governance</h2><button data-close>×</button></header><p>Remote Catalog Version: ${escape(info.version ?? '—')}</p><h3>Pending materializations (${info.pending?.length||0})</h3>${pending}<h3>Candidates (${info.candidateUnread})</h3><div data-governance-candidates>${(info.candidates||[]).map(candidateRow).join('') || '<p>None</p>'}</div><h3>Reports (${info.reportUnread})</h3><div data-governance-reports>${(info.reports||[]).map(reportRow).join('') || '<p>None</p>'}</div></section>`;
  dialog.querySelectorAll('[data-close]').forEach(button=>button.onclick=()=>dialog.close());
  dialog.querySelectorAll('[data-governance-open]').forEach(button=>button.onclick=()=>{const [kind,id]=button.dataset.governanceOpen.split(':');renderGovernanceDetail(dialog,kind,id,info);});
  dialog.querySelectorAll('[data-governance-retry]').forEach(button=>button.onclick=async()=>{const scroll=dialog.querySelector('.sheet')?.scrollTop||0;await admin.retryMaterialization(button.dataset.governanceRetry);await renderGovernanceList(dialog,scroll);});
  void bindImages(dialog);
  const scroller=dialog.querySelector('.sheet'); if(scroller) scroller.scrollTop=preservedScroll;
}
function candidateReviewThumbnail(row) { return row.imageConsent===true && row.referenceImage && row.imageReviewStatus!=='rejected' ? `<img class="governance-thumbnail" src="${escape(row.referenceImage)}" alt="Submitted review image">` : `<div class="governance-thumbnail placeholder">No review image submitted</div>`; }
function candidateReviewDetail(row) {
  const reviewImage=row.imageConsent===true && row.referenceImage && row.imageReviewStatus!=='rejected' ? `<img class="governance-review-image" src="${escape(row.referenceImage)}" alt="Submitted review image">` : `<p>No review image submitted.</p>`;
  return `${reviewImage}<dl class="governance-metadata"><dt>Brand</dt><dd>${escape(row.brand||'—')}</dd><dt>English name</dt><dd>${escape(row.nameEn||'—')}</dd><dt>Chinese name</dt><dd>${escape(row.nameZh||'—')}</dd><dt>SKU / model</dt><dd>${escape(row.sku||'—')}</dd><dt>Age</dt><dd>${escape(`${row.minAgeMonths ?? '—'}–${row.maxAgeMonths ?? '—'} months`)}</dd><dt>Category</dt><dd>${escape(row.categoryCode||'—')}</dd><dt>Skills</dt><dd>${escape((row.skillCodes||[]).join(', ')||'—')}</dd><dt>Core mechanism</dt><dd>${escape((row.playMechanics||[]).join(', ')||'—')}</dd><dt>Candidate type</dt><dd>${escape(row.candidateType||'—')}</dd><dt>Recognition confidence</dt><dd>${escape(row.recognitionConfidence ?? '—')}</dd><dt>Image consent</dt><dd>${row.imageConsent===true?'Submitted for review':'Not submitted'}</dd><dt>Submission source</dt><dd>${escape(row.appVersion||'Toy Library recognition')}</dd></dl>`;
}
function renderGovernanceDetail(dialog,kind,id,info) {
  const row=(kind==='candidate'?info.candidates:info.reports).find(x=>(x.candidateId||x.reportId)===id); if(!row)return renderGovernanceList(dialog);
  const isCandidate=kind==='candidate';
  const candidates=catalog.active.filter(item=>item.canonicalKey!==row.proposedCanonicalKey).slice(0,250).map(item=>`<option value="${escape(item.canonicalKey)}">${escape(brandLabel(item.brand))} · ${escape(displayName(item))}</option>`).join('');
  const body=isCandidate ? `${candidateReviewDetail(row)}<p id="governance-action-error"></p><div class="governance-actions"><button id="gov-review">Mark Reviewing</button><label>Link to existing Catalog item<select id="gov-target"><option value="">Select item</option>${candidates}</select></label><button id="gov-link">Link to Existing</button><button id="gov-approve-image" class="primary" ${row.imageConsent===true&&row.referenceImage&&row.imageReviewStatus!=='rejected'?'':'disabled'}>Approve + Use This Image</button><button id="gov-approve-other">Approve Product, Find Another Image</button><button id="gov-reject-image" ${row.imageConsent===true&&row.referenceImage&&row.imageReviewStatus!=='rejected'?'':'disabled'}>Reject Image</button><button id="gov-research-image">Research Image</button><button id="gov-upload-replacement">Upload Replacement</button><button id="gov-reject">Reject Candidate</button></div><div id="gov-research-result"></div>` : `<pre>${escape(JSON.stringify(row,null,2))}</pre><p id="governance-action-error"></p><button id="gov-review">Mark Reviewing</button><button id="gov-open-catalog">Open Catalog Item</button><button id="gov-resolve" class="primary">Resolve</button><button id="gov-reject">Reject</button>`;
  dialog.innerHTML=`<section class="sheet"><header><h2>${isCandidate?'Candidate':'Report'}</h2><button data-governance-back>‹</button><button data-close>×</button></header>${body}</section>`;
  dialog.querySelector('[data-close]').onclick=()=>dialog.close(); dialog.querySelector('[data-governance-back]').onclick=()=>renderGovernanceList(dialog);
  const run=async action=>{try{if(isCandidate){const target=dialog.querySelector('#gov-target')?.value||'';await admin.reviewCandidate(id,action,target);}else await admin.reviewReport(id,action);await renderGovernanceList(dialog);}catch(error){dialog.querySelector('#governance-action-error').textContent=messageFor(error.message);}};
  dialog.querySelector('#gov-review').onclick=()=>run('reviewing'); dialog.querySelector('#gov-reject').onclick=()=>run('reject');
  if(isCandidate){
    dialog.querySelector('#gov-link').onclick=()=>run('link_existing');
    dialog.querySelector('#gov-approve-image').onclick=async()=>{try{await admin.reviewCandidate(id,'accept_new','',null,{useReviewImage:true});await renderGovernanceList(dialog);}catch(error){dialog.querySelector('#governance-action-error').textContent=messageFor(error.message);}};
    dialog.querySelector('#gov-approve-other').onclick=()=>renderCandidateAcceptEditor(dialog,row,{useReviewImage:false});
    dialog.querySelector('#gov-upload-replacement').onclick=()=>renderCandidateAcceptEditor(dialog,row,{useReviewImage:false,allowReplacement:true});
    dialog.querySelector('#gov-reject-image').onclick=()=>run('reject_image');
    dialog.querySelector('#gov-research-image').onclick=async()=>{try{const result=await admin.researchCandidateImage(row);const target=dialog.querySelector('#gov-research-result');target.innerHTML=(result.candidates||[]).map(item=>`<article class="panel"><img class="governance-review-image" src="${escape(item.imageUrl)}" alt="Research candidate"><p>${escape(item.sourcePage||item.sourceUrl||item.imageUrl||'')}</p><small>${escape(item.sourceType||'')}</small></article>`).join('')||'<p>No reliable image candidate found.</p>';}catch(error){dialog.querySelector('#governance-action-error').textContent=messageFor(error.message);}};
  } else { dialog.querySelector('#gov-resolve').onclick=()=>run('resolved'); dialog.querySelector('#gov-open-catalog').onclick=()=>openCatalogManager(row.canonicalKey); }
}
function renderCandidateAcceptEditor(dialog,candidate,{useReviewImage=false,allowReplacement=false}={}) {
  dialog.innerHTML=`<form class="form"><header><h2>Create New Catalog Item</h2><button type="button" data-governance-back>‹</button><button type="button" data-close>×</button></header><label>Canonical key<input name="canonicalKey" value="${escape(candidate.proposedCanonicalKey)}"></label><label>Brand<input name="brand" value="${escape(candidate.brand||'')}"></label><label>English name<input name="productName" value="${escape(candidate.nameEn||'')}"></label><label>Chinese name<input name="nameZh" value="${escape(candidate.nameZh||'')}"></label><label>SKU/model<input name="sku" value="${escape(candidate.sku||'')}"></label>${allowReplacement?'<label>Upload Replacement<input name="replacementImage" type="file" accept="image/jpeg,image/png,image/webp"></label>':''}<button class="primary">Save and accept</button><p id="candidate-accept-error"></p></form>`;
  dialog.querySelector('[data-close]').onclick=()=>dialog.close(); dialog.querySelector('[data-governance-back]').onclick=()=>renderGovernanceDetail(dialog,'candidate',candidate.candidateId,{candidates:[candidate],reports:[]});
  dialog.querySelector('form').onsubmit=async event=>{event.preventDefault();const values=new FormData(event.target);try{const replacement=values.get('replacementImage');const replacementImage=replacement?.size?await fileToDataUrl(replacement):null;await admin.reviewCandidate(candidate.candidateId,'accept_new','',{canonicalKey:values.get('canonicalKey'),brand:values.get('brand'),productName:values.get('productName'),nameZh:values.get('nameZh'),sku:values.get('sku')},{useReviewImage,replacementImage});await renderGovernanceList(dialog);}catch(error){dialog.querySelector('#candidate-accept-error').textContent=messageFor(error.message);}};
}
function openAdmin() {
  const dialog = openModal(`<form class="form"><header><h2>${t('adminMode')}</h2><button type="button" data-close>×</button></header><label>${t('adminPassword')}<input name="password" type="password" autocomplete="current-password"></label><button class="primary">${t('signIn')}</button><p id="admin-error"></p></form>`);
  dialog.querySelector('form').onsubmit = async event => { event.preventDefault(); try { await admin.signIn(new FormData(event.target).get('password')); dialog.close(); render(); } catch (error) { dialog.querySelector('#admin-error').textContent = messageFor(error.message); } };
}

async function bindImages(scope = document) {
  const targets=[...scope.querySelectorAll('img[data-image]')];
  runtimeImageDiagnostics.mark('bind_images_start', { targetCount:targets.length, runtimeToyImageCount:targets.filter(image=>image.dataset.runtimeImageToyId).length });
  await Promise.all(targets.map(async image => {
    image.loading = 'lazy'; image.decoding = 'async';
    const toyId=image.dataset.runtimeImageToyId || null;
    let rendererImageRef=null;
    try { rendererImageRef=JSON.parse(image.dataset.image); } catch { /* recorded below */ }
    const record=(state,error=null)=>runtimeImageDiagnostics.recordDom({ toyId, rendererImageRef, src:image.getAttribute('src'), currentSrc:image.currentSrc || image.src, complete:image.complete, naturalWidth:image.naturalWidth, state, error });
    if (toyId) { image.addEventListener('load',()=>record('loaded'),{once:true}); image.addEventListener('error',()=>record('error','image_element_error'),{once:true}); }
    try { image.src = await images.resolve(rendererImageRef) || './icons/icon-192.png'; record('assigned'); }
    catch (error) { image.src = './icons/icon-192.png'; record('resolve_error',error?.message || String(error)); }
  }));
  runtimeImageDiagnostics.mark('bind_images_complete', { targetCount:targets.length, runtimeToyImageCount:targets.filter(image=>image.dataset.runtimeImageToyId).length });
}
function applyTheme() {
  const configured = store.state.settings.theme;
  document.documentElement.dataset.theme = configured === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : configured;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
}
function childAgeMonths() { return calculateChildAgeMonths(store.state.profile.childBirthDate); }
function libraryImageRef(toy, phase = 'renderer') {
  const parent=toy?.set?.kind === 'child' ? store.state.toys.find(item => item.id === toy.set.parentId) : null;
  return runtimeImageDiagnostics.traceResolution(toy, { phase, catalog, parentImageRef:parent?.imageRef || null, resolve:(catalogView,parentImageRef)=>resolvedLibraryImageRef(toy,catalogView,parentImageRef) });
}
function captureLoveveryImageSweep(phase) {
  const children=store.state.toys.filter(toy=>toy?.set?.kind==='child'&&/lovevery/i.test(`${toy.brand||''} ${toy.set?.parentCanonicalKey||''} ${toy.canonicalKey||''}`));
  for (const toy of children) libraryImageRef(toy,phase);
  runtimeImageDiagnostics.mark('lovevery_image_sweep', { phase, childCount:children.length, activeCatalogCount:catalog.active.length });
}
function displayName(toy) { return i18n.language === 'zh' ? (toy.names?.zh || toy.productName) : (toy.names?.en || toy.productName); }
function brandLabel(brand) { return brand === 'other_unspecified' ? t('otherUnspecified') : brand; }
function mechanicLabel(code) { return localizePlayMechanism(code, i18n.language) || t('unregisteredPlayMechanism'); }
function t(key, params) { return i18n.t(key, params); }
function messageFor(code) { const value = t(code); return value === code ? code : value; }
function capitalize(value) { return String(value || '').slice(0, 1).toUpperCase() + String(value || '').slice(1); }
function escapedJson(value) { return escape(JSON.stringify(value)); }
function escape(value = '') { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function fileToDataUrl(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); }); }
function downloadJson(value, name) { const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = name; link.style.display = 'none'; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
