import { exportBackup, restoreBackup } from './data/backup-service.js';
import { ImageRepository } from './data/image-repository.js';
import { CATEGORY_CODES, SKILL_CODES, normalizeToy } from './data/schema.js';
import { bootStore } from './data/store.js';
import { CatalogRepository } from './domain/catalog-repository.js';
import { findDuplicates } from './domain/duplicate-engine.js';
import { setToyInterest, toggleToyShelf } from './domain/library-service.js';
import { generateRotation } from './domain/rotation-engine.js';
import { SubstitutionEngine } from './domain/substitution-engine.js';
import { AdminService } from './features/admin-service.js';
import { RecognitionService } from './features/recognition-service.js';
import { createI18n } from './ui/i18n.js';
import { ModalManager } from './ui/modal-manager.js';

const store = bootStore();
const catalog = new CatalogRepository(store);
const images = new ImageRepository();
const i18n = createI18n(store);
const substitution = new SubstitutionEngine();
const admin = new AdminService({ store, catalog });
const recognition = new RecognitionService({ store, images });
const modalManager = new ModalManager();
const root = document.querySelector('#app');
let view = 'home';

await catalog.hydrate();
await backfillSetChildImages();
store.subscribe(render);
render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});

function render() {
  applyTheme();
  document.documentElement.lang = i18n.language;
  root.innerHTML = `
    <header><img src="./icons/header-logo.png" alt=""><div><h1>Toy Rotation</h1><p>${t('home')}</p></div><button data-action="settings" aria-label="${t('settings')}">⚙</button></header>
    <nav>${navButton('home', 'home')}${navButton('library', 'library')}${navButton('rotation', 'rotation')}${navButton('wishlist', 'wishlist')}</nav>
    <main>${renderView()}</main><dialog id="modal"></dialog>`;
  root.querySelectorAll('[data-view]').forEach(button => { button.onclick = () => { view = button.dataset.view; render(); }; });
  root.querySelectorAll('[data-action]').forEach(button => { button.onclick = () => action(button.dataset.action, button.dataset); });
  root.querySelectorAll('[data-draft-confirm]').forEach(button => { button.onclick = () => recognition.confirm(button.dataset.draftConfirm); });
  root.querySelectorAll('[data-draft-retry]').forEach(button => { button.onclick = () => recognition.analyze(button.dataset.draftRetry, { force: true }); });
  root.querySelectorAll('[data-draft-remove]').forEach(button => { button.onclick = () => recognition.remove(button.dataset.draftRemove); });
  bindImages();
}

function navButton(id, label) { return `<button class="${view === id ? 'active' : ''}" data-view="${id}">${t(label)}</button>`; }
function renderView() { return { home: renderHome, library: renderLibrary, rotation: renderRotation, wishlist: renderWishlist }[view](); }
function renderEmpty() { return `<div class="panel"><p>${t('noData')}</p></div>`; }

async function backfillSetChildImages() {
  if (store.state.catalogState.syncMetadata.setChildImageBackfillV1) return;
  const byId = new Map(store.state.toys.map(toy => [toy.id, toy]));
  const jobs = store.state.toys.filter(toy => toy.set?.kind === 'child' && toy.imageRef?.kind === 'placeholder').map(async child => {
    const parent = byId.get(child.set.parentId);
    const imageRef = parent ? await images.copyToPersonal(parent.imageRef) : null;
    return imageRef ? { id: child.id, imageRef } : null;
  });
  const replacements = (await Promise.all(jobs)).filter(Boolean);
  store.update(state => {
    for (const replacement of replacements) { const child = state.toys.find(toy => toy.id === replacement.id); if (child) child.imageRef = replacement.imageRef; }
    state.catalogState.syncMetadata.setChildImageBackfillV1 = new Date().toISOString();
  }, 'set-child-image-migration');
}

function renderHome() {
  const toys = store.state.toys;
  return `<section class="panel"><h2>${t('home')}</h2><div class="stats"><div><small>${t('library')}</small><b>${toys.length}</b></div><div><small>${t('onShelf')}</small><b>${toys.filter(toy => toy.status === 'active').length}</b></div><div><small>${t('wishlist')}</small><b>${store.state.wishlist.length}</b></div></div><button class="primary" data-action="catalog">${t('standardCatalog')}</button></section>`;
}

function renderLibrary() {
  const toys = store.state.toys;
  return `<section class="head"><h2>${t('library')}</h2><span><button data-action="recognize">${t('recognizeToy')}</button><button class="primary" data-action="add">+ ${t('addToy')}</button></span></section>${renderDrafts()}<section class="list">${toys.length ? toys.map(renderToyCard).join('') : renderEmpty()}</section>`;
}

function renderDrafts() {
  const drafts = store.state.drafts || [];
  if (!drafts.length) return '';
  return `<section class="panel"><h3>${t('pendingReview')} (${drafts.length})</h3>${drafts.map(renderDraft).join('')}</section>`;
}
function renderDraft(draft) {
  const statusKey = `recognition${capitalize(draft.status)}`;
  return `<div class="draft"><img data-image='${escapedJson(draft.imageRef)}' alt=""><div><b>${escape(draft.productName || t('pendingReview'))}</b><small>${t(statusKey)}${draft.error ? ` · ${escape(messageFor(draft.error))}` : ''}</small>${draft.status === 'ready' ? `<button data-draft-confirm="${draft.id}" class="primary">${t('confirmAdd')}</button>` : ''}${draft.status === 'error' ? `<button data-draft-retry="${draft.id}">${t('retryRecognition')}</button>` : ''}<button data-draft-remove="${draft.id}">${t('remove')}</button></div></div>`;
}

function renderToyCard(toy) {
  const ageUnit = t('monthUnit');
  return `<article class="card"><img data-image='${escapedJson(toy.imageRef)}' alt=""><div><h3>${escape(displayName(toy))}</h3><p>${escape(brandLabel(toy.brand))} · ${t(`category.${toy.categoryCode}`)}</p><div class="chips">${toy.skillCodes.map(code => `<span>${t(`skill.${code}`)}</span>`).join('')}</div><p>${toy.minAgeMonths ?? '?'}–${toy.maxAgeMonths ?? '?'} ${ageUnit} · ${t(toy.status === 'active' ? 'onShelf' : 'stored')}</p><div class="actions"><button data-action="interest" data-id="${toy.id}" data-value="like" class="${toy.interest === 'like' ? 'selected' : ''}">${t('liked')}</button><button data-action="interest" data-id="${toy.id}" data-value="neutral" class="${toy.interest === 'neutral' ? 'selected' : ''}">${t('neutral')}</button><button data-action="interest" data-id="${toy.id}" data-value="dislike" class="${toy.interest === 'dislike' ? 'selected' : ''}">${t('disliked')}</button><button data-action="toggle-shelf" data-id="${toy.id}">${t(toy.status === 'active' ? 'stored' : 'onShelf')}</button><button data-action="edit" data-id="${toy.id}">${t('edit')}</button><button data-action="remove-toy" data-id="${toy.id}" class="danger">${t('remove')}</button></div></div></article>`;
}

function renderRotation() {
  const active = store.state.toys.filter(toy => toy.status === 'active');
  return `<section class="head"><h2>${t('rotation')}</h2><button class="primary" data-action="generate">${t('generate')}</button></section><section class="list">${active.length ? active.map(renderToyCard).join('') : renderEmpty()}</section>`;
}

function renderWishlist() {
  const age = childAgeMonths();
  const rows = store.state.wishlist.filter(item => item.status !== 'purchased').map(item => {
    const candidate = catalog.getByKey(item.canonicalKey) || item;
    const result = substitution.result(candidate, store.state.toys, store.revision, { childAgeMonths: age });
    const count = result.ageAppropriateCounts.exact_duplicate + result.ageAppropriateCounts.high_substitution + result.ageAppropriateCounts.medium_substitution;
    const visible = result.relationships.slice(0, 3);
    return `<article class="panel"><h3>${escape(displayName(candidate))}</h3><p>${escape(brandLabel(candidate.brand))} · ${t('purchasePriority')}: <b>${t(result.purchaseImpact.priority)}</b></p><p>${count} ${t('overlaps')}</p>${result.counts.skill_similarity_only ? `<p>${t('skillSimilarityOnly')}: ${result.counts.skill_similarity_only}</p>` : ''}${visible.map(renderOverlap).join('') || `<p>${t('noOverlap')}</p>`}${result.relationships.length > visible.length ? `<button data-action="all-overlaps" data-id="${item.id}">${t('viewAll', { count: result.relationships.length })}</button>` : ''}</article>`;
  });
  return `<section class="head"><h2>${t('wishlist')}</h2><button class="primary" data-action="catalog">${t('standardCatalog')}</button></section><section class="list">${rows.join('') || renderEmpty()}</section>`;
}
function renderOverlap(row) {
  return `<div class="overlap"><img data-image='${escapedJson(row.toy.imageRef)}' alt=""><div><b>${escape(displayName(row.toy))}</b><small>${escape(brandLabel(row.toy.brand))} · ${t(levelKey(row.level))}</small><small>${escape(overlapReason(row))}</small></div></div>`;
}
function levelKey(level) { return ({ exact_duplicate: 'exactDuplicate', high_substitution: 'highSubstitution', medium_substitution: 'mediumSubstitution', skill_similarity_only: 'skillSimilarityOnly' })[level] || level; }
function overlapReason(row) {
  if (row.reasonCode.startsWith('mechanic:')) return t('overlapReasonMechanic', { value: row.reasonCode.slice(9).replace(/_/g, ' ') });
  return t({ operation: 'overlapReasonOperation', goal: 'overlapReasonGoal', scene: 'overlapReasonScene', skill: 'overlapReasonSkill', none: 'overlapReasonNone' }[row.reasonCode] || 'overlapReasonNone');
}

async function action(name, data) {
  if (name === 'catalog') return openCatalog();
  if (name === 'settings') return openSettings();
  if (name === 'add') return editToy();
  if (name === 'recognize') return recognizeToy();
  if (name === 'edit') return editToy(data.id);
  if (name === 'interest') return setToyInterest(store, data.id, data.value);
  if (name === 'remove-toy') return removeToy(data.id);
  if (name === 'toggle-shelf') return toggleToyShelf(store, data.id);
  if (name === 'generate') return generateNewRotation();
  if (name === 'all-overlaps') return openAllOverlaps(data.id);
}

function openAllOverlaps(wishlistId) {
  const item = store.state.wishlist.find(entry => entry.id === wishlistId);
  const candidate = item && (catalog.getByKey(item.canonicalKey) || item);
  if (!candidate) return;
  const result = substitution.result(candidate, store.state.toys, store.revision, { childAgeMonths: childAgeMonths() });
  const dialog = openModal(`<section class="sheet"><header><h2>${t('overlaps')}</h2><button data-close>×</button></header><p>${escape(displayName(candidate))}</p><div class="list">${result.relationships.map(renderOverlap).join('') || `<p>${t('noOverlap')}</p>`}</div></section>`);
  bindImages(dialog);
}

function openModal(markup) {
  const dialog = document.querySelector('#modal');
  dialog.innerHTML = markup;
  modalManager.open(dialog);
  dialog.querySelectorAll('[data-close]').forEach(button => { button.onclick = () => dialog.close(); });
  return dialog;
}

function editToy(id) {
  const toy = store.state.toys.find(item => item.id === id) || normalizeToy({});
  const dialog = openModal(`<form class="form"><header><h2>${t(id ? 'edit' : 'addToy')}</h2><button type="button" data-close>×</button></header><label>${t('brand')}<input name="brand" value="${escape(toy.brand === 'other_unspecified' ? '' : toy.brand)}"></label><label>${t('name')}<input name="productName" required value="${escape(toy.productName)}"></label><label>${t('allCategories')}<select name="categoryCode">${CATEGORY_CODES.map(code => `<option value="${code}" ${toy.categoryCode === code ? 'selected' : ''}>${t(`category.${code}`)}</option>`).join('')}</select></label><label>${t('skills')}<select name="skillCodes" multiple size="7">${SKILL_CODES.map(code => `<option value="${code}" ${toy.skillCodes.includes(code) ? 'selected' : ''}>${t(`skill.${code}`)}</option>`).join('')}</select></label><label>${t('minimumAge')}<input name="minAgeMonths" type="number" value="${toy.minAgeMonths ?? ''}"></label><label>${t('maximumAge')}<input name="maxAgeMonths" type="number" value="${toy.maxAgeMonths ?? ''}"></label><label>${t('image')}<input name="image" type="file" accept="image/*"></label><button class="primary">${t('save')}</button></form>`);
  dialog.querySelector('form').onsubmit = async event => {
    event.preventDefault();
    const form = new FormData(event.target);
    const file = form.get('image');
    const imageRef = file?.size ? await images.savePersonal(await fileToDataUrl(file)) : toy.imageRef;
    const next = normalizeToy({ ...toy, brand: form.get('brand'), productName: form.get('productName'), categoryCode: form.get('categoryCode'), skillCodes: form.getAll('skillCodes'), minAgeMonths: form.get('minAgeMonths'), maxAgeMonths: form.get('maxAgeMonths'), imageRef });
    store.update(state => { const index = state.toys.findIndex(item => item.id === next.id); if (index < 0) state.toys.push(next); else state.toys[index] = next; }, 'toy-save');
    dialog.close();
  };
}
function recognizeToy() {
  const dialog = openModal(`<form class="form"><header><h2>${t('recognizeToy')}</h2><button type="button" data-close>×</button></header><label>${t('image')}<input name="image" type="file" accept="image/*" required></label><button class="primary">${t('recognizeToy')}</button></form>`);
  dialog.querySelector('form').onsubmit = async event => { event.preventDefault(); const file = new FormData(event.target).get('image'); if (file?.size) await recognition.createDraft(file); dialog.close(); };
}
async function removeToy(id) {
  const toy = store.state.toys.find(item => item.id === id);
  if (!toy || !confirm(t('confirmRemoveToy'))) return;
  store.update(state => { state.toys = state.toys.filter(item => item.id !== id); }, 'toy-delete');
  await images.removePersonal(toy.imageRef);
}

function generateNewRotation() {
  const chosen = generateRotation({ toys: store.state.toys, history: store.state.rotationHistory, childAgeMonths: childAgeMonths(), size: store.state.settings.rotationSize });
  store.update(state => {
    const ids = new Set(chosen.map(toy => toy.id));
    state.toys.forEach(toy => { if (toy.shelfMode !== 'permanent' && !toy.hidden) toy.status = ids.has(toy.id) ? 'active' : 'stored'; if (ids.has(toy.id)) toy.lastActivatedAt = new Date().toISOString(); });
    state.rotationHistory.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), toyIds: [...ids], mechanisms: chosen.flatMap(toy => toy.playMechanics || []) });
  }, 'rotation');
  view = 'rotation';
}

function openCatalog() {
  const brands = [...new Set(catalog.active.map(toy => toy.brand))].sort((a, b) => brandLabel(a).localeCompare(brandLabel(b)));
  const dialog = openModal(`<section class="sheet"><header><h2>${t('standardCatalog')}</h2><button data-close>×</button></header><input id="catalog-search" placeholder="${t('search')}"><div class="catalog-filters"><select id="catalog-brand"><option value="">${t('allBrands')}</option>${brands.map(brand => `<option value="${escape(brand)}">${escape(brandLabel(brand))}</option>`).join('')}</select><select id="catalog-category"><option value="">${t('allCategories')}</option>${CATEGORY_CODES.map(code => `<option value="${code}">${t(`category.${code}`)}</option>`).join('')}</select></div><div id="catalog-rows" class="list"></div></section>`);
  const renderCatalogRows = () => { dialog.querySelector('#catalog-rows').innerHTML = catalog.search({ query: dialog.querySelector('#catalog-search').value, brand: dialog.querySelector('#catalog-brand').value, categoryCode: dialog.querySelector('#catalog-category').value }).slice(0, 120).map(renderCatalogCard).join('') || renderEmpty(); wireCatalog(dialog); };
  wireCatalog(dialog);
  dialog.querySelector('#catalog-search').oninput = renderCatalogRows;
  dialog.querySelector('#catalog-brand').onchange = renderCatalogRows;
  dialog.querySelector('#catalog-category').onchange = renderCatalogRows;
  renderCatalogRows();
}
function renderCatalogCard(toy) { return `<article class="card"><img data-image='${escapedJson(toy.imageRef)}' alt=""><div><h3>${escape(displayName(toy))}</h3><p>${escape(brandLabel(toy.brand))} · ${t(`category.${toy.categoryCode}`)}</p><button data-add="${toy.canonicalKey}" class="primary">${t('addToy')}</button><button data-wish="${toy.canonicalKey}">${t('wishlist')}</button>${admin.enabled ? `<button data-manage="${toy.canonicalKey}">${t('edit')}</button>` : ''}</div></article>`; }
function wireCatalog(scope) {
  scope.querySelectorAll('[data-add]').forEach(button => { button.onclick = () => addFromCatalog(button.dataset.add); });
  scope.querySelectorAll('[data-wish]').forEach(button => { button.onclick = () => addWishlist(button.dataset.wish); });
  scope.querySelectorAll('[data-manage]').forEach(button => { button.onclick = () => openCatalogManager(button.dataset.manage); });
  bindImages(scope);
}
async function addFromCatalog(key) {
  const source = catalog.getByKey(key);
  if (!source || store.state.toys.some(toy => toy.canonicalKey === source.canonicalKey)) return;
  const imageRef = await images.copyToPersonal(source.imageRef);
  store.update(state => state.toys.push(normalizeToy({ ...source, imageRef: imageRef || source.imageRef })), 'catalog-add');
}
function addWishlist(key) { const source = catalog.getByKey(key); if (!source) return; store.update(state => { if (!state.wishlist.some(item => item.canonicalKey === source.canonicalKey)) state.wishlist.push({ id: crypto.randomUUID(), canonicalKey: source.canonicalKey, catalogId: source.id, status: 'want', addedAt: new Date().toISOString() }); }, 'wishlist-add'); }

function openCatalogManager(key) {
  const toy = catalog.getByKey(key); if (!toy || !admin.enabled) return;
  const dialog = openModal(`<form class="form"><header><h2>${t('adminMode')}</h2><button type="button" data-close>×</button></header><label>${t('brand')}<input name="brand" value="${escape(toy.brand)}"></label><label>${t('englishName')}<input name="productName" value="${escape(toy.productName)}"></label><label>${t('chineseName')}<input name="nameZh" value="${escape(toy.names?.zh || '')}"></label><label>${t('aliases')}<input name="aliases" value="${escape((toy.aliases || []).join(', '))}"></label><label>${t('image')}<input name="catalogImage" type="file" accept="image/*"></label><label>${t('mergeTarget')}<input name="mergeKey"></label><button class="primary">${t('save')}</button><button type="button" id="catalog-delete" class="danger">${t('permanentDelete')}</button><p id="catalog-admin-error"></p></form>`);
  const form = dialog.querySelector('form');
  form.onsubmit = async event => { event.preventDefault(); try { const values = new FormData(form); const mergeKey = String(values.get('mergeKey') || '').trim(); if (mergeKey) await admin.merge(toy.canonicalKey, mergeKey); else { const patch = { brand: values.get('brand'), productName: values.get('productName'), names: { en: values.get('productName'), zh: values.get('nameZh') }, aliases: String(values.get('aliases')).split(',').map(value => value.trim()).filter(Boolean) }; const image = values.get('catalogImage'); if (image?.size) { const temporary = await images.savePersonal(await fileToDataUrl(image)); patch.imageRef = await images.copyToCatalog(temporary, toy.canonicalKey); await images.removePersonal(temporary); } await admin.edit(toy.canonicalKey, patch); } dialog.close(); } catch (error) { dialog.querySelector('#catalog-admin-error').textContent = messageFor(error.message); } };
  dialog.querySelector('#catalog-delete').onclick = async () => { if (!confirm(t('confirmDelete'))) return; try { await admin.delete(toy.canonicalKey, toy); dialog.close(); } catch (error) { dialog.querySelector('#catalog-admin-error').textContent = messageFor(error.message); } };
}

function openSettings() {
  const dialog = openModal(`<form class="form"><header><h2>${t('settings')}</h2><button type="button" data-close>×</button></header><label>${t('language')}<select name="language"><option value="system">${t('system')}</option><option value="en">${t('languageEnglish')}</option><option value="zh">${t('languageChinese')}</option></select></label><label>${t('theme')}<select name="theme"><option value="system">${t('system')}</option><option value="light">${t('light')}</option><option value="dark">${t('dark')}</option></select></label><button class="primary">${t('save')}</button><button type="button" id="backup-export">${t('exportBackup')}</button><label>${t('restoreBackup')}<input id="backup-import" type="file" accept="application/json"></label>${admin.enabled ? `<button type="button" id="manager-open">${t('managerDashboard')}</button>` : ''}<button type="button" id="admin-open">${admin.enabled ? t('signOut') : t('adminMode')}</button></form>`);
  const form = dialog.querySelector('form'); form.language.value = store.state.settings.language; form.theme.value = store.state.settings.theme;
  const applyPreview = () => {
    dialog.close();
    store.update(state => Object.assign(state.settings, { language: form.language.value, theme: form.theme.value }), 'settings-preview');
    openSettings();
  };
  form.language.onchange = applyPreview;
  form.theme.onchange = applyPreview;
  form.onsubmit = event => { event.preventDefault(); store.update(state => Object.assign(state.settings, { language: form.language.value, theme: form.theme.value }), 'settings'); dialog.close(); };
  dialog.querySelector('#backup-export').onclick = async () => downloadJson(await exportBackup(store, images), 'toy-rotation-backup.json');
  dialog.querySelector('#backup-import').onchange = async event => { const file = event.target.files?.[0]; if (file) await restoreBackup(JSON.parse(await file.text()), store, images); dialog.close(); };
  dialog.querySelector('#admin-open').onclick = () => admin.enabled ? (admin.signOut(), openSettings()) : openAdmin();
  dialog.querySelector('#manager-open')?.addEventListener('click', openManagerDashboard);
}
async function openManagerDashboard() {
  if (!admin.enabled) return;
  const duplicates = findDuplicates(store.state.toys).filter(item => item.kind !== 'related_variant');
  const pending = store.state.drafts || [];
  const dialog = openModal(`<section class="sheet"><header><h2>${t('managerDashboard')}</h2><button data-close>×</button></header><h3>${t('pendingCatalogReview')}</h3>${pending.length ? pending.map(draft => `<div class="panel"><b>${escape(draft.productName || t('pendingReview'))}</b><p>${t(`recognition${capitalize(draft.status)}`)}</p></div>`).join('') : `<p>${t('noPendingReview')}</p>`}<h3>${t('suspectedDuplicates')}</h3>${duplicates.length ? duplicates.map(match => `<div class="panel"><b>${escape(displayName(match.a))}</b><p>${escape(displayName(match.b))} · ${t(levelKey(match.kind === 'exact_duplicate' ? 'exact_duplicate' : 'medium_substitution'))}</p></div>`).join('') : `<p>${t('noDuplicates')}</p>`}<h3>${t('backendDiagnostics')}</h3><div id="admin-diagnostics" class="panel">${t('loading')}</div></section>`);
  try {
    const result = await admin.diagnostics();
    const quota = result.quota ? `<pre>${escape(JSON.stringify(result.quota, null, 2))}</pre>` : `<p>${t('quotaUnavailable')}</p>`;
    const status = result.backend === 'available' ? t('backendAvailable') : t('backendUnavailable');
    const target = dialog.querySelector('#admin-diagnostics');
    if (target) target.innerHTML = `<b>${status}</b><p>${t('pendingSync', { count: result.pendingDeletes.length })}</p>${quota}`;
  } catch (error) {
    const target = dialog.querySelector('#admin-diagnostics');
    if (target) target.textContent = messageFor(error.message);
  }
}
function openAdmin() {
  const dialog = openModal(`<form class="form"><header><h2>${t('adminMode')}</h2><button type="button" data-close>×</button></header><label>${t('adminPassword')}<input name="password" type="password" autocomplete="current-password"></label><button class="primary">${t('signIn')}</button><p id="admin-error"></p></form>`);
  dialog.querySelector('form').onsubmit = async event => { event.preventDefault(); try { await admin.signIn(new FormData(event.target).get('password')); dialog.close(); render(); } catch (error) { dialog.querySelector('#admin-error').textContent = messageFor(error.message); } };
}

async function bindImages(scope = document) { for (const image of scope.querySelectorAll('img[data-image]')) { try { image.src = await images.resolve(JSON.parse(image.dataset.image)) || './icons/icon-192.png'; } catch { image.src = './icons/icon-192.png'; } } }
function applyTheme() {
  const configured = store.state.settings.theme;
  document.documentElement.dataset.theme = configured === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : configured;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
}
function childAgeMonths() { const date = store.state.profile.childBirthDate; return date ? Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 2629800000)) : 0; }
function displayName(toy) { return i18n.language === 'zh' ? (toy.names?.zh || toy.productName) : (toy.names?.en || toy.productName); }
function brandLabel(brand) { return brand === 'other_unspecified' ? t('otherUnspecified') : brand; }
function t(key, params) { return i18n.t(key, params); }
function messageFor(code) { const value = t(code); return value === code ? code : value; }
function capitalize(value) { return String(value || '').slice(0, 1).toUpperCase() + String(value || '').slice(1); }
function escapedJson(value) { return escape(JSON.stringify(value)); }
function escape(value = '') { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function fileToDataUrl(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); }); }
function downloadJson(value, name) { const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 0); }
