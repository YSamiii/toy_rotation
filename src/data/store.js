import { SCHEMA_VERSION, emptyState, normalizeToy, normalizeWishlistItem } from './schema.js';

const LEGACY_KEYS = ['toyRotationV04','toyRotationV032','toyRotationV03','toyRotationV02'];
const STORE_KEY = 'toyRotation.cleanBaseline';

export class AppStore {
  #state; #listeners = new Set(); #revision = 0;
  constructor(state) { this.#state = state; }
  get state() { return this.#state; }
  get revision() { return this.#revision; }
  subscribe(listener) { this.#listeners.add(listener); return () => this.#listeners.delete(listener); }
  update(mutator, reason = 'update') { const next = structuredClone(this.#state); mutator(next); next.schemaVersion = SCHEMA_VERSION; this.#state = next; this.#revision++; localStorage.setItem(STORE_KEY, JSON.stringify(next)); for (const listener of this.#listeners) listener(next, reason); }
  replace(next, reason = 'replace') { this.#state = runMigrations(next); this.#revision++; localStorage.setItem(STORE_KEY, JSON.stringify(this.#state)); for (const listener of this.#listeners) listener(this.#state, reason); }
}

export function bootStore() {
  const existing = parse(localStorage.getItem(STORE_KEY));
  const state = existing ? runMigrations(existing) : migrateLegacy();
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
  return new AppStore(state);
}

export function runMigrations(input) {
  let state = structuredClone(input || emptyState());
  if ((state.schemaVersion || 0) < 1) state = migrateV1(state);
  if ((state.schemaVersion || 0) < 2) state = migrateV2(state);
  return state;
}

function migrateLegacy() {
  const legacy = LEGACY_KEYS.map(key => parse(localStorage.getItem(key))).find(Boolean);
  return migrateV1(legacy || emptyState());
}
function migrateV1(legacy) {
  const base = emptyState();
  const settings = legacy.settings || {};
  return {
    ...base, schemaVersion: 1,
    settings: { ...base.settings, language: settings.language || 'system', theme: settings.theme || 'system', rotationSize: Number(settings.rotationSize || 6), rotationDays: Number(settings.rotationDays || 7), onboardingDone: !!settings.onboardingDone },
    profile: { childName: settings.childName || '', childBirthDate: settings.childBirthDate || '' },
    toys: (legacy.toys || []).map(normalizeToy), drafts: legacy.drafts || [], wishlist: (legacy.wishlist || []).map(normalizeWishlistItem),
    rotationHistory: legacy.rotationHistory || legacy.history || [],
    catalogState: { tombstones: migrateTombstones(), adminEdits: parse(localStorage.getItem('toyRotationCatalogOverridesV095')) || {}, syncMetadata: {} }
  };
}
function migrateV2(state) {
  const base = emptyState();
  const existingCatalog = state.catalogState || {};
  const tombstones = Object.fromEntries(Object.entries(existingCatalog.tombstones || {}).map(([key, value]) => [String(key), typeof value === 'object' ? value : { deletedAt: new Date().toISOString(), migrated: true }]));
  return {
    ...base,
    ...state,
    schemaVersion: 2,
    settings: { ...base.settings, ...(state.settings || {}) },
    profile: { ...base.profile, ...(state.profile || {}) },
    toys: (state.toys || []).map(normalizeToy),
    wishlist: (state.wishlist || []).map(normalizeWishlistItem),
    drafts: state.drafts || [],
    rotationHistory: state.rotationHistory || [],
    catalogState: { tombstones, adminEdits: existingCatalog.adminEdits || {}, syncMetadata: existingCatalog.syncMetadata || {} }
  };
}
function migrateTombstones() {
  const values = [parse(localStorage.getItem('toyRotationCatalogDeletedV0934')), parse(localStorage.getItem('toyRotationHiddenCatalogKeysV0927'))].flatMap(value => Array.isArray(value) ? value : Object.keys(value || {}));
  return Object.fromEntries(values.filter(Boolean).map(key => [String(key), { deletedAt: new Date().toISOString(), migrated: true }]));
}
function parse(value) { try { return value ? JSON.parse(value) : null; } catch { return null; } }
