import { normalizeToy } from '../data/schema.js';
import { splitExplicitSet } from '../domain/set-service.js';

export class RecognitionService {
  #store; #images; #base;
  constructor({ store, images, baseUrl = '' }) { this.#store=store; this.#images=images; this.#base=String(baseUrl || window.TOY_ROTATION_CONFIG?.API_BASE || '').replace(/\/+$/,''); }
  async createDraft(file, setMode = 'auto') {
    const imageRef=await this.#images.savePersonal(await dataUrl(file)); const draft={ id:crypto.randomUUID(), status:'queued', imageRef, setMode, productName:'', brand:'', categoryCode:'uncategorized', skillCodes:[], playMechanics:[], minAgeMonths:null, maxAgeMonths:null, isSet:false, children:[], error:null, createdAt:new Date().toISOString() };
    this.#store.update(state=>state.drafts.unshift(draft),'recognition-queued'); await this.analyze(draft.id); return draft.id;
  }
  async analyze(id, { force = false } = {}) {
    const draft=this.#store.state.drafts.find(item=>item.id===id); if(!draft) return;
    if(!this.#base) return this.#setError(id,'recognitionServiceUnconfigured');
    this.#store.update(state=>{const item=state.drafts.find(x=>x.id===id);item.status='processing';item.error=null;},'recognition-start');
    try { const image=await this.#images.resolve(draft.imageRef); const response=await fetch(`${this.#base}/analyze-batch`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id,image}],setMode:draft.setMode,forceRefresh:force})}); if(!response.ok) throw new Error('recognitionFailed'); const payload=await response.json(); const result=(payload.results || payload.items || [])[0]; if(!result) throw new Error('recognitionNoResult'); this.#store.update(state=>{const item=state.drafts.find(x=>x.id===id);Object.assign(item,normalizeDraft(result),{status:'ready',imageRef:draft.imageRef});},'recognition-ready'); }
    catch(error){this.#setError(id,error.message);}
  }
  async confirm(id) {
    const draft=this.#store.state.drafts.find(item=>item.id===id); if(!draft || draft.status!=='ready') return;
    const parent=normalizeToy({...draft,id:crypto.randomUUID(),set:{kind:draft.isSet?'parent':'none',childIds:[],rotationMode:draft.setMode==='split'?'split':'whole'},imageRef:draft.imageRef});
    const split=draft.isSet && draft.setMode==='split' && draft.children.length ? splitExplicitSet(parent,draft.children) : {parent,children:[]};
    for (const child of split.children) {
      if (child.imageRef?.kind === 'placeholder') child.imageRef = await this.#images.copyToPersonal(parent.imageRef) || parent.imageRef;
    }
    this.#store.update(state=>{state.toys.push(split.parent,...split.children);state.drafts=state.drafts.filter(item=>item.id!==id);},'recognition-confirm');
  }
  remove(id){this.#store.update(state=>{state.drafts=state.drafts.filter(item=>item.id!==id);},'recognition-remove');}
  #setError(id,error){this.#store.update(state=>{const item=state.drafts.find(x=>x.id===id);if(item){item.status='error';item.error=error;}},'recognition-error');}
}
function normalizeDraft(result){const source=result.confirmed || result.toy || result;return {brand:source.brand||'',productName:source.productName||source.name||'',names:{en:source.nameEn||source.name||'',zh:source.nameZh||''},categoryCode:source.categoryCode||source.category||'uncategorized',skillCodes:source.skillCodes||source.skills||[],playMechanics:source.playMechanics||[],minAgeMonths:source.minAgeMonths??source.ageMinMonths??null,maxAgeMonths:source.maxAgeMonths??source.ageMaxMonths??null,isSet:!!source.isSet,children:source.children||[],confidence:source.confidence??null,notes:source.notes||''};}
function dataUrl(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});}
