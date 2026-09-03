import { canonicalKey } from '../data/schema.js';
import { pendingCandidateCount, upsertLocalCandidate } from './local-candidate-queue.js';
import { createCatalogReport, enqueueCatalogReportSyncIntent, getCatalogReportById, hasRawAttachment, legacyReportId, legacyReportPayload } from './catalog-report-store.js';

// Local-first governance transport. It never serializes ownership, personal
// images, Wishlist, rotation, profiles, or any other private state.
export class SharedCatalogGovernance {
  #store; #catalog; #base; #diagnostic; #images;
  constructor({ store, catalog, images=null, baseUrl='', diagnostic=null }) { this.#store=store;this.#catalog=catalog;this.#images=images;this.#base=String(baseUrl||'').replace(/\/$/,'');this.#diagnostic=diagnostic; globalThis.addEventListener?.('online',()=>{void this.flushOutbox();void this.syncInBackground();}); }
  async syncInBackground() {
    this.#diagnostic?.record('remote_candidate_sync_requested',{}); if (!this.#base || !navigator.onLine) { this.#diagnostic?.record('remote_candidate_sync_skipped',{baseConfigured:Boolean(this.#base),online:navigator.onLine}); return { skipped:true }; }
    this.#diagnostic?.record('remote_candidate_sync_started',{}); const local=Number(this.#store.state.catalogState?.syncMetadata?.lastAppliedRemoteCatalogVersion||0);
    const version=await this.#get('/catalog-version'); if (!version || Number(version.version)<=local) { this.#diagnostic?.record('remote_candidate_sync_completed',{current:local,changed:false}); return { current:local, changed:false }; }
    const delta=await this.#get(`/catalog-delta?after=${local}`); if (!delta || delta.fullRefreshRequired) { this.#diagnostic?.record('remote_candidate_sync_failed',{current:local,reason:delta?'full_refresh_required':'delta_unavailable'}); return { current:local, changed:false, fullRefreshRequired:true }; }
    const staged=structuredClone(this.#store.state);
    for (const change of delta.changes||[]) applySharedCatalogChange(staged,change);
    staged.catalogState.syncMetadata ||= {}; staged.catalogState.syncMetadata.lastAppliedRemoteCatalogVersion=Number(delta.currentVersion);
    this.#store.commit(staged,'shared-catalog-delta-apply'); this.#catalog.refresh(); await this.#applyCandidateResolutions(); this.#diagnostic?.record('remote_candidate_sync_completed',{current:delta.currentVersion,changed:true}); return { current:delta.currentVersion,changed:true };
  }
  enqueue(kind,payload) { const id=payload.candidateId||payload.reportId||crypto.randomUUID();const before=pendingCandidateCount(this.#store.state);this.#diagnostic?.record('candidate_create_requested',{id,kind,pendingBefore:before});this.#diagnostic?.record('candidate_persist_started',{id});candidateTrace('candidate_create_called',{id,kind,pending_count_before:before});try{this.#store.update(s=>{s.catalogState.syncMetadata ||= {};if(kind==='candidate')upsertLocalCandidate(s,{...payload,candidateId:id});const o=s.catalogState.syncMetadata.governanceOutbox ||= [];if(!o.some(x=>x.id===id))o.push({id,kind,payload:{...payload,[kind==='candidate'?'candidateId':'reportId']:id},createdAt:new Date().toISOString()});},'governance-outbox-enqueue');}catch(error){this.#diagnostic?.record('candidate_persist_failed',{id,message:error?.message||String(error)});throw error;}const after=pendingCandidateCount(this.#store.state);this.#diagnostic?.record('candidate_created',{id,pendingBefore:before,pendingAfter:after});this.#diagnostic?.record('candidate_persist_completed',{id,pendingAfter:after});candidateTrace('candidate_created',{id,pending_count_after:after});candidateTrace('candidate_persisted',{id});candidateTrace('badge_refresh_requested',{pending_count_after:after});globalThis.dispatchEvent?.(new Event('toy-rotation-candidate-persisted'));return id; }
  async flushOutbox() { if(!this.#base||!navigator.onLine)return {flushed:0};const jobs=[...(this.#store.state.catalogState?.syncMetadata?.governanceOutbox||[])];let flushed=0;for(const job of jobs){try{const r=await fetch(`${this.#base}/${job.kind==='candidate'?'catalog-candidate':'catalog-report'}`,{method:'POST',headers:{'Content-Type':'application/json','X-Device-Id':deviceId()},body:JSON.stringify(job.payload)});if(!r.ok)continue;this.#store.update(s=>{s.catalogState.syncMetadata.governanceOutbox=s.catalogState.syncMetadata.governanceOutbox.filter(x=>x.id!==job.id);if(job.kind==='candidate'){s.catalogState.syncMetadata.candidateReceipts ||= [];if(!s.catalogState.syncMetadata.candidateReceipts.includes(job.id))s.catalogState.syncMetadata.candidateReceipts.push(job.id)}},'governance-outbox-sent');flushed++}catch{}}await this.#applyCandidateResolutions();return {flushed}; }
  createLocalCandidate(payload){return this.enqueue('candidate',{...payload,candidateId:payload.candidateId||crypto.randomUUID()});}
  async submitCandidate(payload){this.createLocalCandidate(payload);return this.flushOutbox();}
  async submitReport(payload) {
    const reportId=payload.reportId || crypto.randomUUID();
    // The report and its retry intent are one canonical commit. A remote
    // failure therefore cannot make a locally accepted report disappear.
    this.#store.update(state => {
      const report=createCatalogReport(state,{ ...payload, id:reportId, attachmentRef:payload.attachmentRef || null, syncStatus:'pending_local' });
      enqueueCatalogReportSyncIntent(state,report);
    },'catalog-report-create');
    void this.flushOutbox();
    return getCatalogReportById(this.#store.state,reportId);
  }
  async migrateLegacyReports() {
    const jobs=[...(this.#store.state.catalogState?.syncMetadata?.governanceOutbox || [])].filter(job => job?.kind === 'report');
    if (!jobs.length) return { migrated:0, pending:0, errors:[] };
    const prepared=[]; const errors=[]; const seenIds=new Set((this.#store.state.catalogState?.catalogReports || []).map(report=>report.id));
    for (const job of jobs) {
      const id=legacyReportId(job); if (seenIds.has(id)) continue; seenIds.add(id);
      const existing=getCatalogReportById(this.#store.state,id);
      let attachmentRef=existing?.attachmentRef || job.payload?.attachmentRef || null;
      if (existing && (!hasRawAttachment(job.payload) || attachmentRef)) { prepared.push({ job, report:existing, migrated:false, attachmentRef }); continue; }
      if (hasRawAttachment(job.payload)) {
        if (!this.#images) { errors.push({ id:job.id, reason:'attachment_repository_unavailable' }); continue; }
        try { attachmentRef=await this.#images.savePersonal(job.payload.optionalAttachment); }
        catch (error) { errors.push({ id:job.id, reason:'attachment_migration_failed', message:String(error?.message || error) }); continue; }
      }
      prepared.push({ job, report:existing ? { ...existing, attachmentRef } : legacyReportPayload(job,attachmentRef), migrated:!existing, attachmentRef });
    }
    if (prepared.length) this.#store.update(state => {
      const outbox=state.catalogState.syncMetadata.governanceOutbox || [];
      for (const entry of prepared) {
        const report=createCatalogReport(state,entry.report);
        entry.safeReport=report;
      }
      const migratedById=new Map(prepared.map(entry => [legacyReportId(entry.job), entry.safeReport]));
      for (const job of outbox) {
        const report=migratedById.get(legacyReportId(job));
        // Clear raw bytes only after the new report was included in this
        // verified canonical commit. This also clears duplicate retry intents
        // for the same deterministic legacy report without removing either.
        if (job.kind === 'report' && report && hasRawAttachment(job.payload)) {
          const { optionalAttachment, ...safePayload }=job.payload;
          job.payload={ ...safePayload, attachmentRef:report.attachmentRef || null, attachmentTransport:report.attachmentRef ? 'deferred_until_remote_contract_updated' : 'none' };
        }
      }
      state.catalogState.syncMetadata.catalogReportMigrationV0115={ completedAt:new Date().toISOString(), pendingAttachmentMigration:errors.map(error=>error.id), errors };
    },'catalog-report-legacy-import');
    return { migrated:prepared.filter(item=>item.migrated).length, pending:errors.length, errors };
  }
  async #get(path){try{const r=await fetch(`${this.#base}${path}`,{cache:'no-store'});return r.ok?await r.json():null}catch{return null}}
  async #applyCandidateResolutions(){
    const ids=[...(this.#store.state.catalogState?.syncMetadata?.candidateReceipts||[])];
    for(const candidateId of ids){const resolution=await this.#get(`/catalog-candidate-resolution?candidateId=${encodeURIComponent(candidateId)}`);const target=canonicalKey(resolution?.resolvedCanonicalKey);if(!target)continue;
      const staged=structuredClone(this.#store.state);let changed=false;
      for(const toy of staged.toys||[])if(toy.governanceCandidateId===candidateId||canonicalKey(toy.canonicalKey)===canonicalKey(resolution?.proposedCanonicalKey)){toy.legacyCanonicalKeys=[...new Set([...(toy.legacyCanonicalKeys||[]),toy.canonicalKey].filter(Boolean))];toy.canonicalKey=target;toy.governanceCandidateResolvedAt=new Date().toISOString();changed=true;}
      if(changed)this.#store.commit(staged,'candidate-resolution-apply');
    }
  }
}
function candidateTrace(stage,detail={}) { const trace=globalThis.__TOY_ROTATION_CANDIDATE_TRACE__ ||= [];trace.push({stage,detail,at:new Date().toISOString()});if(trace.length>80)trace.splice(0,trace.length-80); }
export function applySharedCatalogChange(state,change){
  const key=canonicalKey(change.canonicalKey);state.catalogState ||= {tombstones:{},adminEdits:{},syncMetadata:{}};
  state.catalogState.tombstones ||= {}; state.catalogState.adminEdits ||= {};state.catalogState.remoteEntries ||= [];
  if(change.type==='merge'){
    const survivor=canonicalKey(change.targetCanonicalKey); state.catalogState.tombstones[key]={deletedAt:change.updatedAt,mergedInto:survivor};
    for(const toy of state.toys||[]) if(canonicalKey(toy.canonicalKey)===key){toy.canonicalKey=survivor;toy.legacyCanonicalKeys=[...new Set([...(toy.legacyCanonicalKeys||[]),key])];}
    for(const item of state.wishlist||[]) if(canonicalKey(item.canonicalKey)===key)item.canonicalKey=survivor;
    for(const round of state.rotationHistory||[]) round.toyIds=(round.toyIds||[]).map(id=>state.toys?.find(toy=>toy.id===id)?.id||id);
    return;
  }
  if(change.type==='tombstone'){state.catalogState.tombstones[key]={deletedAt:change.updatedAt};return;}
  if(change.type==='restore'){delete state.catalogState.tombstones[key];return;}
  if(change.type==='create'){const entry={...(change.patch||{}),canonicalKey:key,key,updatedAt:change.updatedAt};const index=state.catalogState.remoteEntries.findIndex(item=>canonicalKey(item.canonicalKey)===key);if(index>=0)state.catalogState.remoteEntries[index]={...state.catalogState.remoteEntries[index],...entry};else state.catalogState.remoteEntries.push(entry);state.catalogState.adminEdits[key]={...(state.catalogState.adminEdits[key]||{}),...entry};return;}
  state.catalogState.adminEdits[key]={...(state.catalogState.adminEdits[key]||{}),...(change.patch||{}),updatedAt:change.updatedAt};
}
function deviceId(){const k='toyRotation.cleanBaseline.deviceId';let v=localStorage.getItem(k);if(!v){v=`device-${crypto.randomUUID()}`;localStorage.setItem(k,v)}return v;}
