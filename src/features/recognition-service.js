import { canonicalKey } from '../data/schema.js';
import { createCatalogOwnership } from '../domain/library-service.js';
import { findOwnedToy } from '../domain/identity-service.js';

export class RecognitionService {
  #store; #images; #catalog; #base; #governance; #diagnostic; #submissions=new Map(); #completed=new Map();
  constructor({ store, images, catalog = null, governance = null, baseUrl = '', diagnostic = null }) { this.#store=store; this.#images=images; this.#catalog=catalog; this.#governance=governance; this.#diagnostic=diagnostic; this.#base=String(baseUrl || window.TOY_ROTATION_CONFIG?.API_BASE || '').replace(/\/+$/,''); }
  async createDraft(file, setMode = 'auto', { onPersisted = null } = {}) {
    if (!this.#base) throw new RecognitionError('recognitionServiceUnconfigured');
    const image=await dataUrl(file);
    const id=crypto.randomUUID();
    const imageRef=await this.#images.savePersonal(image,`draft-${id}`);
    const draft={ id, status:'queued', imageRef, setMode, productName:'', brand:'', categoryCode:'uncategorized', skillCodes:[], playMechanics:[], minAgeMonths:null, maxAgeMonths:null, isSet:false, children:[], error:null, createdAt:new Date().toISOString() };
    this.#store.update(state=>state.drafts.unshift(draft),'recognition-queued');
    // The caller may close its modal at the durable-draft boundary.  The
    // request itself starts in the next task, so neither network setup nor
    // catalog work can hold the modal open after local persistence succeeds.
    onPersisted?.(draft.id);
    setTimeout(() => { void this.analyze(draft.id, { image }); }, 0);
    return draft.id;
  }
  async analyze(id, { force = false, image: preloadedImage = null } = {}) {
    const draft=this.#store.state.drafts.find(item=>item.id===id); if(!draft) return;
    if(!this.#base) return this.#setError(id,'recognitionServiceUnconfigured');
    this.#store.update(state=>{const item=state.drafts.find(x=>x.id===id);item.status='processing';item.error=null;},'recognition-start');
    try {
      const image=preloadedImage || await this.#images.resolve(draft.imageRef);
      if (!image) throw new RecognitionError('recognitionImageUnavailable');
      const requestId=crypto.randomUUID();
      const response = await requestRecognition(`${this.#base}/analyze-batch`, {
        items:[{id,image}],
        deviceId: deviceId(),
        locale: appLocale(this.#store),
        setMode:draft.setMode,
        forceRefresh:force,
        testMode: Boolean(globalThis.TOY_ROTATION_CONFIG?.TEST_MODE),
        clientRequestId: requestId
      });
      const result=(response.payload.results || response.payload.items || [])[0];
      if(!result) throw new RecognitionError('recognitionNoResult');
      const normalized=normalizeDraft(result);
      const decision=this.#catalog?.resolveRecognition(normalized) || { kind:'genuinely_new', canonicalKey:canonicalKey(`${normalized.brand}-${normalized.productName}`) };
      const catalogMatch=decision.catalog || null;
      const owned=catalogMatch ? findOwnedToy(catalogMatch, this.#store.state.toys || []) : null;
      const status=owned ? 'already_owned' : decision.kind === 'catalog_match' ? 'ready' : decision.kind === 'genuinely_new' ? 'ready_catalog_unmatched' : decision.kind;
      const diagnostics=recognitionDiagnostics({ requestId, response, catalogMatch, catalogDecision:decision.kind, result:'received' });
      this.#store.update(state=>{const item=state.drafts.find(x=>x.id===id);if(!item)return;Object.assign(item,normalized,{status,imageRef:draft.imageRef,catalogMatch:catalogMatch ? catalogSummary(catalogMatch) : null,ownedToyId:owned?.id || null,duplicateCandidates:(decision.conflicts || []).map(match=>catalogSummary(match.b)),diagnostics});},'recognition-ready');
    }
    catch(error){this.#setError(id,error.code || error.message || 'recognitionFailed', error.diagnostics || null);}
  }
  async confirm(id, { destination = 'library' } = {}) {
    const completed=this.#completed.get(id);if(completed){recognitionTrace('duplicate_click_blocked',{recognitionDraftId:id,destination});return completed;}
    if(this.#submissions.has(id)){recognitionTrace('inflight_reused',{recognitionDraftId:id,destination});return this.#submissions.get(id);}
    const draft=this.#store.state.drafts.find(item=>item.id===id);this.#diagnostic?.state('confirm_enter',this.#store.state,{draftId:id,destination,draftStatus:draft?.status||null});if(!draft || !String(draft.status).startsWith('ready'))return;
    const operation=(async()=>{recognitionTrace('submit_started',{recognitionDraftId:id,destination,canonicalProposal:draft.canonicalKey||null});this.#diagnostic?.record('confirm_destination',{draftId:id,destination});this.#store.update(state=>{const item=state.drafts.find(entry=>entry.id===id);if(item)item.status='submitting';},'recognition-submit-started');this.#diagnostic?.state('draft_marked_submitting',this.#store.state,{draftId:id,destination});const result=await this.#commit(draft,{destination});this.#completed.set(id,result);this.#diagnostic?.state('confirm_commit_completed',this.#store.state,{draftId:id,destination,localToyId:result?.toy?.id||null,wishlistId:result?.wishlist?.id||null});return result;})();
    this.#submissions.set(id,operation);try{return await operation;}finally{this.#submissions.delete(id);}
  }
  async #commit(idDraft, { destination = 'library' } = {}) {
    const draft=idDraft;
    const id=draft.id;
    recognitionTrace('existing_toy_lookup',{recognitionDraftId:id,destination,canonicalProposal:draft.canonicalKey||null});
    if (destination === 'wishlist') return this.#confirmWishlist(draft);
    // A person may explicitly distinguish an AI result from a merely similar
    // catalog product.  Respect that review result without changing the
    // identity engine's matching rules.
    this.#diagnostic?.record('identity_resolution_started',{draftId:id,destination});const decision=draft.resolutionOverride === 'genuinely_new'
      ? { kind:'genuinely_new', canonicalKey:canonicalKey(draft.canonicalKey || `${draft.brand}-${draft.productName}`) }
      : (this.#catalog?.resolveRecognition(draft) || { kind:'genuinely_new' });
    this.#diagnostic?.record('identity_resolution_completed',{draftId:id,destination,kind:decision.kind,existingCatalogMatch:decision.kind==='catalog_match',ambiguous:decision.kind==='duplicate_review_required',genuinelyNew:decision.kind==='genuinely_new'});if (decision.kind === 'tombstoned') return this.#setDecision(id, decision);
    let catalog=decision.catalog, governanceCandidateId=null, candidatePayload=null;
    if (!catalog) {
      // Unknown and ambiguous products remain local provisional ownerships.
      // They never enter the active shared catalog before an admin accepts them.
      const key=canonicalKey(draft.canonicalKey || `${draft.brand}-${draft.productName}`);
      catalog={...draft, canonicalKey:key, productName:draft.productName, names:draft.names, imageRef:null, catalogStatus:'provisional'};
      const candidateType=draft.candidateTypeOverride==='identity_review_candidate'||decision.kind==='duplicate_review_required'?'identity_review_candidate':'new_product_candidate';
      const payload={candidateId:`candidate-${draft.id}`,source:'recognition',candidateType,proposedCanonicalKey:key,brand:draft.brand,productName:draft.productName,nameEn:draft.names?.en||draft.productName,nameZh:draft.names?.zh||'',aliases:draft.aliases||[],sku:draft.sku,minAgeMonths:draft.minAgeMonths,maxAgeMonths:draft.maxAgeMonths,categoryCode:draft.categoryCode,skillCodes:draft.skillCodes,playMechanics:draft.playMechanics,recognitionConfidence:draft.confidence,possibleMatches:(decision.conflicts||[]).map(match=>catalogSummary(match.b)),imageConsent:draft.imageConsent===true,reviewAttachment:draft.imageConsent===true?await this.#images.resolve(draft.imageRef):null,appVersion:globalThis.TOY_ROTATION_CONFIG?.RELEASE||''};
      governanceCandidateId=payload.candidateId;
      candidatePayload=payload;
    }
    // Recognition review data is a local ownership override.  It deliberately
    // never writes back into CatalogRepository or shared catalog governance.
    const reviewedSource={...catalog,brand:draft.brand || catalog.brand,productName:draft.productName || catalog.productName,names:draft.names || catalog.names,sku:draft.sku || catalog.sku,categoryCode:draft.categoryCode || catalog.categoryCode,skillCodes:draft.skillCodes || catalog.skillCodes,playMechanics:draft.playMechanics || catalog.playMechanics,minAgeMonths:draft.minAgeMonths ?? catalog.minAgeMonths,maxAgeMonths:draft.maxAgeMonths ?? catalog.maxAgeMonths,rotationValue:draft.rotationValue || 'medium',notes:draft.notes || '',rotationParticipation:draft.reviewRotationState === 'paused' ? 'paused' : 'active',shelfMode:draft.reviewRotationState === 'permanent' ? 'permanent' : 'rotate',permanentSource:draft.reviewRotationState === 'permanent' ? 'user' : null,pauseReason:draft.reviewRotationState === 'paused' ? draft.pauseReason || '' : '',pauseReasonCode:draft.reviewRotationState === 'paused' ? draft.pauseReasonCode || null : null};
    this.#diagnostic?.state('toy_lookup_started',this.#store.state,{draftId:id});recognitionTrace('toy_create_started',{recognitionDraftId:id,destination});const result=createCatalogOwnership(this.#store, reviewedSource, draft.imageRef, { reason:'recognition-confirm' });this.#diagnostic?.state(result.added?'toy_created':'toy_existing_reused',this.#store.state,{draftId:id,localToyId:result.toy?.id||null});
    if (!result.added) return this.#markAlreadyOwned(id, result.toy);
    recognitionTrace('toy_created',{recognitionDraftId:id,destination,localToyId:result.toy.id});recognitionTrace('ownership_written',{recognitionDraftId:id,destination,localToyId:result.toy.id});if(governanceCandidateId)this.#store.update(state=>{const toy=state.toys.find(item=>item.id===result.toy.id);if(toy)toy.governanceCandidateId=governanceCandidateId;},'recognition-governance-candidate-link');
    if(candidatePayload){this.#diagnostic?.state('candidate_required_decided',this.#store.state,{draftId:id,candidateId:governanceCandidateId,linkedLocalToyId:result.toy.id});recognitionTrace('candidate_required',{recognitionDraftId:id,destination,localToyId:result.toy.id,candidateId:governanceCandidateId});recognitionTrace('candidate_create_started',{recognitionDraftId:id,destination,localToyId:result.toy.id,candidateId:governanceCandidateId});this.#diagnostic?.record('candidate_create_requested',{draftId:id,candidateId:governanceCandidateId});this.#governance?.createLocalCandidate({...candidatePayload,linkedLocalToyId:result.toy.id});this.#diagnostic?.state('candidate_persist_completed',this.#store.state,{draftId:id,candidateId:governanceCandidateId,linkedLocalToyId:result.toy.id});recognitionTrace('candidate_created',{recognitionDraftId:id,destination,localToyId:result.toy.id,candidateId:governanceCandidateId});void this.#governance?.flushOutbox();}else this.#diagnostic?.record('candidate_create_skipped',{draftId:id,reason:'catalog_match'});
    this.#catalog?.ensureSetChildren();
    this.#store.update(state=>{state.drafts=state.drafts.filter(item=>item.id!==id);},'recognition-confirmed');
    return { kind:'created', toy:result.toy, catalog, learned:decision.kind !== 'catalog_match' };
  }
  async #confirmWishlist(draft) {
    const decision=draft.resolutionOverride === 'genuinely_new'
      ? { kind:'genuinely_new', canonicalKey:canonicalKey(draft.canonicalKey || `${draft.brand}-${draft.productName}`) }
      : (this.#catalog?.resolveRecognition(draft) || { kind:'genuinely_new' });
    if (decision.kind === 'tombstoned') return this.#setDecision(draft.id, decision);
    const catalog=decision.catalog || null;
    const snapshot={ ...(catalog || draft), canonicalKey:catalog?.canonicalKey || canonicalKey(draft.canonicalKey || `${draft.brand}-${draft.productName}`), brand:draft.brand || catalog?.brand, productName:draft.productName || catalog?.productName, names:draft.names || catalog?.names, sku:draft.sku || catalog?.sku, categoryCode:draft.categoryCode || catalog?.categoryCode, skillCodes:draft.skillCodes || catalog?.skillCodes, playMechanics:draft.playMechanics || catalog?.playMechanics, minAgeMonths:draft.minAgeMonths ?? catalog?.minAgeMonths, maxAgeMonths:draft.maxAgeMonths ?? catalog?.maxAgeMonths, imageRef:draft.imageRef };
    let item;
    this.#store.update(state=>{
      const existing=state.wishlist.find(entry=>canonicalKey(entry.canonicalKey)===snapshot.canonicalKey);
      if (existing) { item=existing; return; }
      item={ id:crypto.randomUUID(), canonicalKey:snapshot.canonicalKey, catalogId:catalog?.id || null, catalogSnapshot:snapshot, status:'want', priority:draft.wishlistPriority || 'medium', notes:draft.wishlistNotes || draft.notes || '', recognizedMetadata:{ confidence:draft.confidence ?? null, diagnostics:draft.diagnostics || null }, addedAt:new Date().toISOString() };
      state.wishlist.push(item);
      state.drafts=state.drafts.filter(entry=>entry.id!==draft.id);
    },'recognition-confirm-wishlist');
    if (!catalog && item) {
      const key=canonicalKey(draft.canonicalKey || `${draft.brand}-${draft.productName}`);
      const payload={candidateId:`candidate-${draft.id}`,source:'recognition',candidateType:'new_product_candidate',proposedCanonicalKey:key,brand:draft.brand,productName:draft.productName,nameEn:draft.names?.en||draft.productName,nameZh:draft.names?.zh||'',aliases:draft.aliases||[],sku:draft.sku,minAgeMonths:draft.minAgeMonths,maxAgeMonths:draft.maxAgeMonths,categoryCode:draft.categoryCode,skillCodes:draft.skillCodes,playMechanics:draft.playMechanics,recognitionConfidence:draft.confidence,imageConsent:draft.imageConsent===true,reviewAttachment:draft.imageConsent===true?await this.#images.resolve(draft.imageRef):null,linkedWishlistId:item.id,appVersion:globalThis.TOY_ROTATION_CONFIG?.RELEASE||''};
      this.#governance?.createLocalCandidate(payload);void this.#governance?.flushOutbox();
    }
    return { kind:item ? 'wishlisted' : 'already_wishlisted', wishlist:item, catalog };
  }
  async resolveDuplicateReview(id, choice) {
    const draft=this.#store.state.drafts.find(item=>item.id===id); if(!draft || draft.status !== 'duplicate_review_required') return;
    if (choice === 'not_same') {
      this.#store.update(state=>{const item=state.drafts.find(x=>x.id===id);if(item){item.status='ready_catalog_unmatched';item.resolutionOverride='genuinely_new';item.candidateTypeOverride='identity_review_candidate';}},'recognition-duplicate-review-not-same');
      return;
    }
    const candidate=this.#catalog?.getByKey(draft.duplicateCandidates?.[0]?.canonicalKey);
    if (!candidate) return this.#setError(id,'recognitionCatalogResolutionFailed');
    // Identity review resolves only the catalog target. It must not imply
    // ownership: the user still chooses Toy Library or Wishlist afterward.
    this.#store.update(state=>{const item=state.drafts.find(entry=>entry.id===id);if(item){item.status='ready';item.catalogMatch=catalogSummary(candidate);item.resolutionOverride=null;item.duplicateCandidates=[];}},'recognition-duplicate-review-resolved');
  }
  async remove(id){const draft=this.#store.state.drafts.find(item=>item.id===id);this.#store.update(state=>{state.drafts=state.drafts.filter(item=>item.id!==id);},'recognition-remove');if(draft?.imageRef?.kind==='personal')await this.#images.removePersonal(draft.imageRef);}
  #setError(id,error,diagnostics){this.#store.update(state=>{const item=state.drafts.find(x=>x.id===id);if(item){item.status='error';item.error=error;if(diagnostics)item.diagnostics=diagnostics;}},'recognition-error');}
  #setDecision(id, decision) { this.#store.update(state=>{const item=state.drafts.find(x=>x.id===id);if(!item)return;item.status=decision.kind;item.error=decision.kind === 'tombstoned' ? 'recognitionCatalogTombstoned' : null;item.duplicateCandidates=(decision.conflicts || []).map(match=>catalogSummary(match.b));},'recognition-catalog-decision'); }
  #markAlreadyOwned(id, toy) { this.#store.update(state=>{const item=state.drafts.find(x=>x.id===id);if(item){item.status='already_owned';item.ownedToyId=toy?.id || null;item.catalogMatch=catalogSummary(toy);}},'recognition-already-owned'); return { kind:'already_owned', toy }; }
}
function recognitionTrace(stage,detail={}){const trace=globalThis.__TOY_ROTATION_RECOGNITION_SAVE_TRACE__ ||= [];trace.push({stage,timestamp:new Date().toISOString(),...detail});if(trace.length>120)trace.splice(0,trace.length-120);}
const DEVICE_ID_KEY = 'toyRotation.cleanBaseline.deviceId';
const REQUEST_TIMEOUT_MS = 30000;

class RecognitionError extends Error {
  constructor(code, detail = '', diagnostics = null) { super(detail || code); this.code=code; this.diagnostics=diagnostics; }
}

function deviceId() {
  try {
    const current=globalThis.localStorage?.getItem(DEVICE_ID_KEY);
    if (current) return current;
    const created=`device-${crypto.randomUUID()}`;
    globalThis.localStorage?.setItem(DEVICE_ID_KEY,created);
    return created;
  } catch { return `device-${crypto.randomUUID()}`; }
}
function appLocale(store) {
  const requested=store.state.settings?.language;
  if (requested === 'zh' || requested === 'en') return requested;
  return globalThis.navigator?.language?.startsWith('zh') ? 'zh' : 'en';
}
async function requestRecognition(url, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const startedAt=performance.now();
  try {
    const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});
    const payload=await response.json().catch(()=>null);
    const diagnostics={clientRequestId:body.clientRequestId,deviceIdPresent:Boolean(body.deviceId),httpStatus:response.status,durationMs:Math.round(performance.now()-startedAt),provider:payload?.provider?.status || payload?.providerStatus || (response.ok ? 'not_reported' : 'not_entered'),quota:payload?.quota ?? 'not_reported',requestResult:response.ok?'response_received':'http_error'};
    if (!response.ok) throw new RecognitionError(errorCodeForResponse(response.status,payload), payload?.error || payload?.message || '', diagnostics);
    if (!payload || typeof payload !== 'object') throw new RecognitionError('recognitionInvalidResponse','',diagnostics);
    return {payload,diagnostics};
  } catch(error) {
    if (error instanceof RecognitionError) throw error;
    const diagnostics={clientRequestId:body.clientRequestId,deviceIdPresent:Boolean(body.deviceId),httpStatus:null,durationMs:Math.round(performance.now()-startedAt),provider:'not_entered',quota:'not_reported',requestResult:error?.name === 'AbortError'?'timeout':'network_error'};
    if (error?.name === 'AbortError') throw new RecognitionError('recognitionTimeout','',diagnostics);
    throw new RecognitionError('recognitionNetworkError', error?.message || '',diagnostics);
  } finally { clearTimeout(timeout); }
}
function recognitionDiagnostics({requestId,response,catalogMatch,catalogDecision,result}) {
  return {...response.diagnostics,clientRequestId:requestId,result,catalogDecision,catalogMatch:catalogMatch ? catalogSummary(catalogMatch) : null};
}
function errorCodeForResponse(status,payload) {
  if (status === 400 && /deviceId/i.test(String(payload?.error || payload?.message || ''))) return 'recognitionDeviceIdRequired';
  if (status === 401 || status === 403) return 'recognitionUnauthorized';
  if (status === 429) return 'recognitionQuotaExceeded';
  return 'recognitionFailed';
}
function catalogSummary(toy){return toy ? { canonicalKey:toy.canonicalKey, brand:toy.brand, productName:toy.productName, names:toy.names || { en:toy.nameEn || '', zh:toy.nameZh || '' }, sku:toy.sku || null } : null;}
function normalizeDraft(result){const source=result.confirmed || result.toy || result;return {canonicalKey:source.canonicalKey||source.catalogKey||source.key||'',sku:source.sku||source.productCode||source.modelNumber||source.variantCode||null,brand:source.brand||'',productName:source.productName||source.name||'',names:{en:source.nameEn||source.name||'',zh:source.nameZh||''},aliases:source.aliases||[],categoryCode:source.categoryCode||source.category||'uncategorized',skillCodes:source.skillCodes||source.skills||[],playMechanics:source.playMechanics||[],minAgeMonths:source.minAgeMonths??source.ageMinMonths??null,maxAgeMonths:source.maxAgeMonths??source.ageMaxMonths??null,rotationValue:source.rotationValue||'medium',isSet:!!source.isSet,children:source.children||[],confidence:source.confidence??null,notes:source.notes||''};}
function dataUrl(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});}
