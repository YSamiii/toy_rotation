const LEGACY_DB = 'toyRotationPhotosV04';
const LEGACY_STORE = 'photos';
const CATALOG_PREFIX = 'catalog:';
const PERSONAL_PREFIX = 'personal:';

export class ImageRepository {
  #cache = new Map();
  #database = null;
  async resolve(ref) {
    if (!ref || ref.kind === 'placeholder') return null;
    if (ref.kind === 'generated') return generatedCatalogFallback(ref);
    const cacheKey = ref.kind === 'remote' ? ref.url : `${ref.kind}:${ref.id}`;
    if (this.#cache.has(cacheKey)) return this.#cache.get(cacheKey);
    const stored = ref.kind === 'remote' ? ref.url : await this.#read(ref.id);
    const value = await normalizeStoredImage(stored);
    this.#cache.set(cacheKey, value || null); return value || null;
  }
  async savePersonal(dataUrl, id = crypto.randomUUID()) { const key = `${PERSONAL_PREFIX}${id}`; await this.#write(key, dataUrl); this.#cache.set(`personal:${key}`, dataUrl); return { kind: 'personal', id: key }; }
  async importPersonal(id, dataUrl) { await this.#write(id, dataUrl); this.#cache.set(`personal:${id}`, dataUrl); return { kind: 'personal', id }; }
  async importCatalog(id, dataUrl) { await this.#write(id, dataUrl); this.#cache.set(`catalog:${id}`, dataUrl); return { kind: 'catalog', id }; }
  async saveCatalog(dataUrl, canonicalKey) {
    if (!dataUrl || !canonicalKey) throw new Error('Catalog image and canonical key are required');
    const id = `${CATALOG_PREFIX}${canonicalKey}`;
    await this.#write(id, dataUrl);
    this.#cache.set(`catalog:${id}`, dataUrl);
    return { kind:'catalog', id };
  }
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
  async findLegacyPersonal(ids = [], toyId = '') {
    const normalizedIds = [...new Set(ids.flatMap(imageIdVariants).filter(Boolean))];
    for (const id of normalizedIds) {
      const raw = await this.resolve({ kind:'personal', id });
      if (raw) return raw;
    }
    const records = await this.#readAll();
    const needle = String(toyId || '').toLowerCase();
    for (const { key, value } of records) {
      const metadata = typeof value === 'object' ? JSON.stringify(value).toLowerCase() : '';
      const keyText = String(key || '').toLowerCase();
      if (!normalizedIds.some(id => keyText.includes(String(id).toLowerCase())) && (!needle || !metadata.includes(needle))) continue;
      const raw = await normalizeStoredImage(value);
      if (raw) return raw;
    }
    return null;
  }
  async listPersonalRecords() {
    const records = await this.#readAll();
    const normalized = await Promise.all(records.map(async ({ key, value }) => ({
      id:String(key || ''),
      raw:await normalizeStoredImage(value),
      metadata:typeof value === 'object' ? JSON.stringify(value).toLowerCase() : ''
    })));
    return normalized.filter(record => record.raw && !record.id.startsWith(CATALOG_PREFIX));
  }
  async #db() { if (!this.#database) this.#database = new Promise((resolve, reject) => { const request = indexedDB.open(LEGACY_DB, 1); request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(LEGACY_STORE)) request.result.createObjectStore(LEGACY_STORE); }; request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); return this.#database; }
  async #read(key) { const db = await this.#db(); return new Promise((resolve, reject) => { const request = db.transaction(LEGACY_STORE).objectStore(LEGACY_STORE).get(key); request.onsuccess = () => resolve(request.result || null); request.onerror = () => reject(request.error); }); }
  async #readAll() {
    const db = await this.#db();
    return new Promise((resolve, reject) => {
      const store=db.transaction(LEGACY_STORE).objectStore(LEGACY_STORE);
      const keys=store.getAllKeys(); const values=store.getAll();
      let resolvedKeys=[]; let resolvedValues=[]; let completed=0;
      const complete=()=>{ if (++completed === 2) resolve(resolvedKeys.map((key,index)=>({key,value:resolvedValues[index]}))); };
      keys.onsuccess=()=>{ resolvedKeys=keys.result || []; complete(); };
      values.onsuccess=()=>{ resolvedValues=values.result || []; complete(); };
      keys.onerror=()=>reject(keys.error); values.onerror=()=>reject(values.error);
    });
  }
  async #write(key, value) { const db = await this.#db(); return new Promise((resolve, reject) => { const tx = db.transaction(LEGACY_STORE, 'readwrite'); tx.objectStore(LEGACY_STORE).put(value, key); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); }
  async #delete(key) { const db = await this.#db(); return new Promise((resolve, reject) => { const tx = db.transaction(LEGACY_STORE, 'readwrite'); tx.objectStore(LEGACY_STORE).delete(key); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); }
}
function generatedCatalogFallback(ref) {
  const brand=escapeXml(String(ref.brand || 'Toy Rotation').slice(0,34));
  const label=escapeXml(String(ref.label || 'Catalog item').slice(0,52));
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="520" height="520" viewBox="0 0 520 520"><rect width="520" height="520" rx="48" fill="#f5efff"/><rect x="36" y="36" width="448" height="448" rx="36" fill="#fff" stroke="#d6c6f5" stroke-width="8"/><circle cx="260" cy="180" r="72" fill="#8e63dc"/><path d="M222 180h76M260 142v76" stroke="#fff" stroke-width="18" stroke-linecap="round"/><text x="260" y="320" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="28" fill="#3a3151">${brand}</text><text x="260" y="365" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" fill="#6b6280">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
function escapeXml(value) { return value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char])); }
function blobToDataUrl(blob) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); }); }
async function normalizeStoredImage(value) { if (!value) return null; if (value instanceof Blob) return blobToDataUrl(value); if (typeof value === 'object') return value.dataUrl || value.data || value.url || null; return value; }
function imageIdVariants(value) { const id=String(value || ''); if(!id)return[]; const bare=id.replace(/^(personal:|photo:|image:)/,''); return [id,bare,`personal:${bare}`,`photo:${bare}`,`image:${bare}`]; }
