const TOKEN_KEY = 'toyRotationAdminTokenV095';
const VERIFIED_KEY = 'toyRotationAdminVerifiedV095';

export class AdminService {
  #store; #catalog; #base;
  constructor({ store, catalog, baseUrl = '' }) { this.#store = store; this.#catalog = catalog; this.#base = String(baseUrl || window.TOY_ROTATION_CONFIG?.API_BASE || '').replace(/\/+$/,''); }
  get enabled() { return Boolean(sessionStorage.getItem(VERIFIED_KEY) && sessionStorage.getItem(TOKEN_KEY)); }
  async signIn(password) {
    if (!password) throw new Error('adminPasswordRequired'); if (!this.#base) throw new Error('adminUnconfigured');
    const headers = { Authorization: `Bearer ${password}` }; let response = await fetch(`${this.#base}/admin-auth`, { headers, cache:'no-store' });
    if (response.status === 404) response = await fetch(`${this.#base}/admin-catalog`, { headers, cache:'no-store' });
    if (!response.ok) throw new Error(response.status === 401 ? 'adminIncorrectPassword' : 'adminSignInFailed');
    sessionStorage.setItem(TOKEN_KEY, password); sessionStorage.setItem(VERIFIED_KEY, '1'); return true;
  }
  signOut() { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(VERIFIED_KEY); }
  async syncEdits() {
    if (!this.#base) return; const response = await fetch(`${this.#base}/catalog-overrides`, { cache:'no-store' }); if (!response.ok) throw new Error('catalogSyncFailed');
    const payload = await response.json(); this.#catalog.applyServerEdits(payload); 
  }
  async diagnostics() {
    if (!this.enabled) throw new Error('adminVerificationRequired');
    await this.retryPendingDeletes();
    const pendingDeletes = this.#store.state.catalogState.syncMetadata.pendingAdminDeletes || [];
    if (!this.#base) return { configured:false, backend:'unconfigured', quota:null, pendingDeletes };
    const headers = { Authorization: `Bearer ${sessionStorage.getItem(TOKEN_KEY)}` };
    const [health, quota] = await Promise.all([this.#probe('/health', headers), this.#probe('/quota', headers)]);
    return { configured:true, backend:health.ok ? 'available' : 'unavailable', health:health.payload, quota:quota.ok ? quota.payload : null, pendingDeletes };
  }
  async replaceCatalogImage(key, dataUrl) {
    if (!this.enabled) throw new Error('adminVerificationRequired');
    if (!this.#base) throw new Error('adminUnconfigured');
    const response = await fetch(`${this.#base}/admin-catalog-image`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${sessionStorage.getItem(TOKEN_KEY)}` },
      body:JSON.stringify({ key, imageDataUrl:dataUrl, action:'replace' })
    });
    if (!response.ok) throw new Error('catalogImageUploadFailed');
    return `${this.#base}/catalog-image/${encodeURIComponent(key)}`;
  }
  async governance() {
    if (!this.enabled) throw new Error('adminVerificationRequired');
    const headers={ Authorization:`Bearer ${sessionStorage.getItem(TOKEN_KEY)}` };
    const [version,candidates,reports,pending]=await Promise.all([
      this.#probe('/catalog-version',{}), this.#probe('/admin-catalog-candidates',headers), this.#probe('/admin-catalog-reports',headers), this.#probe('/admin-catalog-pending-materializations',headers)
    ]);
    if (!candidates.ok || !reports.ok) throw new Error('catalogGovernanceUnavailable');
    return { version:version.payload?.version ?? null, candidates:candidates.payload?.candidates||[], reports:reports.payload?.reports||[], pending:pending.payload?.pending||[], candidateUnread:candidates.payload?.unreadCount||0, reportUnread:reports.payload?.unreadCount||0 };
  }
  async reviewCandidate(candidateId, action, targetCanonicalKey = '', patch = null, options = {}) { return this.#governancePost('/admin-catalog-candidate',{candidateId,action,targetCanonicalKey,patch,mutationId:action==='accept_new'?`candidate-accept-${candidateId}`:undefined,...options}); }
  async researchCandidateImage(candidate) {
    if (!this.enabled) throw new Error('adminVerificationRequired');
    const response=await fetch(`${this.#base}/admin-catalog-image-candidate`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${sessionStorage.getItem(TOKEN_KEY)}`},body:JSON.stringify({action:'research',key:candidate.proposedCanonicalKey,brand:candidate.brand,productName:candidate.nameEn,nameEn:candidate.nameEn,nameZh:candidate.nameZh,sku:candidate.sku,aliases:candidate.aliases||[]})});
    if(!response.ok) throw new Error('catalogImageResearchFailed');
    return response.json();
  }
  async reviewReport(reportId, action) { return this.#governancePost('/admin-catalog-report',{reportId,action}); }
  async retryMaterialization(mutationId) { return this.#governancePost('/admin-catalog-retry-materialization',{mutationId}); }
  async edit(key, patch) { await this.#post({ action:'edit', key, patch }); this.#catalog.updateAdminEdit(key, patch); }
  async merge(key, targetKey) { await this.#post({ action:'merge', key, targetKey }); this.#catalog.mergeReferences(key, targetKey); }
  async delete(key, snapshot) {
    // The local tombstone is the source of truth for the active catalog.  It is
    // written before network synchronization so a deleted entry cannot reappear
    // after a reload, remote hydrate, or transient backend outage.
    this.#catalog.deleteStandardToy(key);
    try { await this.#post({ action:'delete', key, sourceSnapshot:snapshot }); return { deleted:true, synced:true }; }
    catch (error) {
      this.#store.update(state => {
        state.catalogState.syncMetadata.pendingAdminDeletes ||= [];
        if (!state.catalogState.syncMetadata.pendingAdminDeletes.includes(key)) state.catalogState.syncMetadata.pendingAdminDeletes.push(key);
      }, 'catalog-delete-pending-sync');
      return { deleted:true, synced:false, error:error.message };
    }
  }
  async retryPendingDeletes() {
    if (!this.enabled || !this.#base) return;
    const pending = [...(this.#store.state.catalogState.syncMetadata.pendingAdminDeletes || [])];
    for (const key of pending) {
      try {
        await this.#post({ action:'delete', key, retry:true });
        this.#store.update(state => { state.catalogState.syncMetadata.pendingAdminDeletes = (state.catalogState.syncMetadata.pendingAdminDeletes || []).filter(value => value !== key); }, 'catalog-delete-synced');
      } catch { /* The local tombstone remains authoritative until the backend is available. */ }
    }
  }
  async #post(body) { if (!this.enabled) throw new Error('adminVerificationRequired'); if (!this.#base) throw new Error('adminUnconfigured'); const response = await fetch(`${this.#base}/admin-catalog`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${sessionStorage.getItem(TOKEN_KEY)}`}, body:JSON.stringify({...body,mutationId:body.mutationId||crypto.randomUUID()}) }); if (!response.ok) throw new Error('adminOperationFailed'); return response.json(); }
  async #governancePost(path, body) { if (!this.enabled) throw new Error('adminVerificationRequired'); if (!this.#base) throw new Error('adminUnconfigured'); const response=await fetch(`${this.#base}${path}`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${sessionStorage.getItem(TOKEN_KEY)}`},body:JSON.stringify(body)}); if(!response.ok)throw new Error('catalogGovernanceUpdateFailed'); return response.json(); }
  async #probe(path, headers) {
    try { const response = await fetch(`${this.#base}${path}`, { headers, cache:'no-store' }); return { ok:response.ok, payload:response.ok ? await response.json().catch(() => ({})) : null }; }
    catch { return { ok:false, payload:null }; }
  }
}
