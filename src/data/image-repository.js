const LEGACY_DB = 'toyRotationPhotosV04';
const LEGACY_STORE = 'photos';
const CATALOG_PREFIX = 'catalog:';
const PERSONAL_PREFIX = 'personal:';

export class ImageRepository {
  #cache = new Map();
  async resolve(ref) {
    if (!ref || ref.kind === 'placeholder') return null;
    const cacheKey = ref.kind === 'remote' ? ref.url : `${ref.kind}:${ref.id}`;
    if (this.#cache.has(cacheKey)) return this.#cache.get(cacheKey);
    const value = ref.kind === 'remote' ? ref.url : await this.#read(ref.id);
    this.#cache.set(cacheKey, value || null); return value || null;
  }
  async savePersonal(dataUrl, id = crypto.randomUUID()) { const key = `${PERSONAL_PREFIX}${id}`; await this.#write(key, dataUrl); this.#cache.set(`personal:${key}`, dataUrl); return { kind: 'personal', id: key }; }
  async importPersonal(id, dataUrl) { await this.#write(id, dataUrl); this.#cache.set(`personal:${id}`, dataUrl); return { kind: 'personal', id }; }
  async importCatalog(id, dataUrl) { await this.#write(id, dataUrl); this.#cache.set(`catalog:${id}`, dataUrl); return { kind: 'catalog', id }; }
  async copyToCatalog(personalRef, canonicalKey) {
    const raw = await this.resolve(personalRef); if (!raw) throw new Error('No personal image available to copy');
    const id = `${CATALOG_PREFIX}${canonicalKey}`; await this.#write(id, raw); this.#cache.set(`catalog:${id}`, raw); return { kind: 'catalog', id };
  }
  async removePersonal(ref) { if (ref?.kind !== 'personal') return; await this.#delete(ref.id); this.#cache.delete(`personal:${ref.id}`); }
  async copyToPersonal(ref) {
    const raw = await this.resolve(ref);
    if (!raw) return null;
    if (ref?.kind !== 'remote') return this.savePersonal(raw);
    // A catalog URL is never used as a mutable storage key.  Try to snapshot it
    // locally; if CORS prevents that, retain a typed remote reference instead of
    // incorrectly assigning another toy's local photo.
    try {
      const response = await fetch(raw);
      if (!response.ok) throw new Error('image download failed');
      const blob = await response.blob();
      return this.savePersonal(await blobToDataUrl(blob));
    } catch { return { kind: 'remote', url: raw }; }
  }
  async #db() { return new Promise((resolve, reject) => { const request = indexedDB.open(LEGACY_DB, 1); request.onupgradeneeded = () => request.result.createObjectStore(LEGACY_STORE); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
  async #read(key) { const db = await this.#db(); return new Promise((resolve, reject) => { const request = db.transaction(LEGACY_STORE).objectStore(LEGACY_STORE).get(key); request.onsuccess = () => resolve(request.result || null); request.onerror = () => reject(request.error); }); }
  async #write(key, value) { const db = await this.#db(); return new Promise((resolve, reject) => { const tx = db.transaction(LEGACY_STORE, 'readwrite'); tx.objectStore(LEGACY_STORE).put(value, key); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); }
  async #delete(key) { const db = await this.#db(); return new Promise((resolve, reject) => { const tx = db.transaction(LEGACY_STORE, 'readwrite'); tx.objectStore(LEGACY_STORE).delete(key); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); }
}
function blobToDataUrl(blob) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); }); }
