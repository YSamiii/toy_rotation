import { canonicalKey, normalizeCatalogToy } from '../data/schema.js';
import { ensureSplitSetChildren } from './set-service.js';

export class CatalogRepository {
  #base = []; #remote = []; #active = []; #byKey = new Map(); #store;
  constructor(store) { this.#store = store; }
  async hydrate() {
    const [remote, base] = await Promise.all([fetchJson('./catalog-remote.json'), fetchJson('./catalog-candidates.json')]);
    this.#remote = entries(remote); this.#base = entries(base); this.#rebuild(); this.ensureSetChildren(); return this.#active;
  }
  get active() { return this.#active; }
  getByKey(key) { return this.#byKey.get(canonicalKey(key)) || null; }
  search({ query = '', brand = '', categoryCode = '', skillCode = '' } = {}) {
    const text = String(query).trim().toLowerCase();
    return this.#active.filter(toy => (!brand || toy.brand === brand) && (!categoryCode || toy.categoryCode === categoryCode) && (!skillCode || toy.skillCodes.includes(skillCode)) && (!text || [toy.brand, toy.productName, ...toy.aliases].join(' ').toLowerCase().includes(text)));
  }
  applyRemote(entriesValue) { this.#remote = entries(entriesValue); this.#rebuild(); this.ensureSetChildren(); }
  refresh() { this.#rebuild(); }
  deleteStandardToy(key) {
    const canonical = canonicalKey(key); if (!canonical) return;
    this.#store.update(state => { state.catalogState.tombstones[canonical] = { deletedAt: new Date().toISOString() }; }, 'catalog-delete');
    this.#rebuild();
  }
  updateAdminEdit(key, patch) { const canonical = canonicalKey(key); this.#store.update(state => { state.catalogState.adminEdits[canonical] = { ...(state.catalogState.adminEdits[canonical] || {}), ...patch }; }, 'catalog-edit'); this.#rebuild(); }
  ensureSetChildren() {
    if (!(this.#store.state.toys || []).some(toy => toy.set?.kind === 'parent' && toy.set.rotationMode === 'split')) return;
    const definitions = new Map(this.#active.map(toy => [toy.canonicalKey, toy]));
    this.#store.update(state => {
      state.toys ||= [];
      const additions = ensureSplitSetChildren(state.toys, definitions);
      if (additions.length) state.toys.push(...additions);
    }, 'set-child-migration');
  }
  #rebuild() {
    const { tombstones = {}, adminEdits = {} } = this.#store.state.catalogState;
    const merged = new Map();
    for (const raw of [...this.#base, ...this.#remote]) { const toy = normalizeCatalogToy(raw); const key = canonicalKey(toy.canonicalKey); if (!key || tombstones[key]) continue; merged.set(key, { ...toy, ...(adminEdits[key] || {}) }); }
    this.#active = [...merged.values()].sort((a,b) => a.brand.localeCompare(b.brand) || a.productName.localeCompare(b.productName));
    this.#byKey = new Map(this.#active.map(toy => [canonicalKey(toy.canonicalKey), toy]));
  }
}
async function fetchJson(url) { try { const response = await fetch(`${url}?t=${Date.now()}`, { cache: 'no-store' }); return response.ok ? response.json() : []; } catch { return []; } }
function entries(value) { return Array.isArray(value) ? value : Array.isArray(value?.entries) ? value.entries : []; }
