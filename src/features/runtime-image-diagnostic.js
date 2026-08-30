export const IMAGE_RESOLVER_BUILD_MARKER = 'runtime-child-image-trace-20260827-a';

const MAX_EVENTS = 500;
const MAX_ROWS = 24;

export class RuntimeImageDiagnostics {
  #events = [];
  #resolutions = new Map();
  #dom = new Map();
  #activeLookup = null;
  #originalGetByKey = null;

  constructor({ release = 'development', clock = () => new Date().toISOString() } = {}) {
    this.release = release;
    this.clock = clock;
    this.mark('diagnostic_initialized', { imageResolverBuildMarker:IMAGE_RESOLVER_BUILD_MARKER });
  }

  installCatalogLookupProbe(catalog) {
    if (!catalog?.getByKey || this.#originalGetByKey) return;
    this.#originalGetByKey = catalog.getByKey.bind(catalog);
    catalog.getByKey = key => {
      const hit = this.#originalGetByKey(key);
      if (this.#activeLookup) this.#activeLookup.lookupKeysActuallyTried.push({
        key:key ?? null, normalizedKey:normalizeKey(key), hit:Boolean(hit),
        hitCanonicalKey:hit?.canonicalKey || null, hitImageRef:clone(hit?.imageRef || null)
      });
      return hit;
    };
  }

  mark(type, details = {}) {
    this.#events.push({ at:this.clock(), type, ...clone(details) });
    if (this.#events.length > MAX_EVENTS) this.#events.shift();
  }

  traceResolution(toy, { phase = 'renderer', catalog, parentImageRef = null, resolve } = {}) {
    const row = baseToyRow(toy, phase, this.clock());
    this.#activeLookup = row;
    let catalogToy = null, returned = null, error = null;
    try {
      catalogToy = catalog?.resolve?.(toy) || null;
      returned = resolve({ resolve:() => catalogToy }, parentImageRef);
    } catch (caught) { error = caught?.message || String(caught); }
    finally { this.#activeLookup = null; }
    Object.assign(row, {
      catalogRecordMatched:Boolean(catalogToy),
      matchedCatalogCanonicalKey:catalogToy?.canonicalKey || null,
      catalogImageRef:clone(catalogToy?.imageRef || null),
      catalogImageSource:catalogToy?.imageRef?.imageSource || catalogToy?.imageRef?.source || null,
      catalogImageSourceType:catalogToy?.imageRef?.imageSourceType || null,
      catalogVerificationStatus:catalogToy?.imageRef?.verificationStatus || null,
      catalogImageOwnerCanonicalKey:catalogToy?.imageRef?.imageOwnerCanonicalKey || null,
      resolverReturnedImageRef:clone(returned), rendererReceivedImageRef:clone(returned),
      resolutionPath:resolutionPath(row, catalogToy), error
    });
    this.#append(this.#resolutions, toy.id, row);
    return returned;
  }

  recordDom({ toyId, rendererImageRef, src, currentSrc = '', complete = false, naturalWidth = 0, state = 'assigned', error = null } = {}) {
    if (!toyId) return;
    this.#append(this.#dom, toyId, { at:this.clock(), toyLibraryId:toyId,
      rendererReceivedImageRef:clone(rendererImageRef), domImgSrc:src || null,
      domCurrentSrc:currentSrc || null, complete:Boolean(complete), naturalWidth:Number(naturalWidth || 0),
      state, error, isPlaceholder:isPlaceholderResult(rendererImageRef, src) });
  }

  snapshot() { return { events:clone(this.#events), resolutions:mapObject(this.#resolutions), dom:mapObject(this.#dom) }; }

  async buildExport({ store, catalog, documentObject = globalThis.document, navigatorObject = globalThis.navigator, cacheStorage = globalThis.caches } = {}) {
    const liveDom = collectLiveDom(documentObject);
    const rows = (store?.state?.toys || []).filter(isLoveveryChild).map(toy => {
      const resolutions=clone(this.#resolutions.get(toy.id) || []), domHistory=clone(this.#dom.get(toy.id) || []);
      const latest=resolutions.at(-1) || baseToyRow(toy, 'not_rendered', this.clock());
      const dom=liveDom[toy.id] || domHistory.at(-1) || null;
      return { ...latest, resolutionHistory:resolutions, domHistory,
        domImgSrc:dom?.domImgSrc || null, domCurrentSrc:dom?.domCurrentSrc || null,
        domImageComplete:dom?.complete ?? null, domNaturalWidth:dom?.naturalWidth ?? null,
        isPlaceholder:dom ? Boolean(dom.isPlaceholder) : isPlaceholderRef(latest.rendererReceivedImageRef),
        activeOwnership:!toy.archived && !toy.hidden };
    });
    const stages=summarizeStages(this.#events,this.#resolutions);
    return {
      format:'toy-rotation-runtime-child-image-diagnostic', diagnosticVersion:1,
      exportedAt:this.clock(), readOnly:true, release:this.release,
      imageResolverBuildMarker:IMAGE_RESOLVER_BUILD_MARKER,
      serviceWorker:{ controllerScriptURL:navigatorObject?.serviceWorker?.controller?.scriptURL || null,
        controllerState:navigatorObject?.serviceWorker?.controller?.state || null,
        cacheNames:await cacheNames(cacheStorage) },
      runtimeSummary:{ loveveryChildOwnershipCount:rows.length,
        catalogRepositoryActiveCount:catalog?.active?.length || 0,
        firstSweepResolvableCount:stages.firstSweepResolvableCount,
        postHydrateResolvableCount:stages.postHydrateResolvableCount,
        currentlyCatalogResolvableCount:rows.filter(row=>row.catalogRecordMatched&&!isPlaceholderRef(row.resolverReturnedImageRef)).length,
        currentDomNonPlaceholderCount:rows.filter(row=>row.domImgSrc&&!row.isPlaceholder).length,
        currentDomPlaceholderCount:rows.filter(row=>row.isPlaceholder).length,
        currentDomLoadFailureCount:rows.filter(row=>row.domHistory?.at(-1)?.state==='error'||(row.domImageComplete&&row.domNaturalWidth===0)).length,
        catalogHydrationCompleted:stages.catalogHydrationCompleted,
        postHydrateRenderObserved:stages.postHydrateRenderObserved,
        placeholderThenCatalogTransitions:stages.placeholderThenCatalogTransitions },
      comparisonHints:{ successfulNames:['First Puzzle','Treasure Basket','第一块拼图','探索篮'],
        successfulRows:rows.filter(row=>/first puzzle|treasure basket|第一块拼图|探索篮/i.test(`${row.name||''} ${row.nameEn||''} ${row.nameZh||''}`)),
        placeholderExamples:rows.filter(row=>row.isPlaceholder).slice(0,5) },
      lifecycleEvents:clone(this.#events), loveveryChildren:rows
    };
  }

  #append(map, id, row) { const rows=map.get(id)||[]; rows.push(row); if(rows.length>MAX_ROWS)rows.shift(); map.set(id,rows); }
}

function baseToyRow(toy = {}, phase, at) {
  const imageRef=clone(toy.imageRef || null);
  return { at, phase, toyLibraryId:toy.id||null, name:toy.productName||toy.name||null,
    nameEn:toy.names?.en||toy.nameEn||null, nameZh:toy.names?.zh||toy.nameZh||null,
    runtimeCanonicalKey:toy.canonicalKey||null, legacyCanonicalKeys:clone(toy.legacyCanonicalKeys||[]),
    parentCanonicalKey:toy.set?.parentCanonicalKey||toy.parentCanonicalKey||null,
    partIndex:toy.set?.partIndex??toy.partIndex??null,
    ownershipGroupId:toy.set?.ownershipGroupId||toy.ownershipGroupId||null,
    personalImageRef:imageRef?.kind==='personal'?imageRef:clone(toy.personalImageRef||null),
    storedOwnershipImageRef:imageRef,
    inheritedImageRef:clone(toy.inheritedImageRef||toy.imageMetadata?.inheritedImageRef||null),
    lookupKeysActuallyTried:[] };
}
function resolutionPath(row,catalogToy){if(!catalogToy)return'catalog_no_match';const hit=row.lookupKeysActuallyTried.find(x=>x.hit&&normalizeKey(x.hitCanonicalKey)===normalizeKey(catalogToy.canonicalKey));return hit?`explicit_key:${hit.normalizedKey}`:'structural_or_identity_fallback';}
function summarizeStages(events,resolutions){const all=[...resolutions.values()].flat(),pre=latestByToy(all.filter(x=>x.phase==='pre_catalog_hydrate')),post=latestByToy(all.filter(x=>x.phase==='post_catalog_hydrate'));const hydrationIndex=events.findIndex(x=>x.type==='catalog_hydration_complete');return{firstSweepResolvableCount:[...pre.values()].filter(x=>!isPlaceholderRef(x.resolverReturnedImageRef)).length,postHydrateResolvableCount:[...post.values()].filter(x=>!isPlaceholderRef(x.resolverReturnedImageRef)).length,catalogHydrationCompleted:hydrationIndex>=0,postHydrateRenderObserved:hydrationIndex>=0&&events.slice(hydrationIndex+1).some(x=>x.type==='render_complete'),placeholderThenCatalogTransitions:[...post].filter(([id,row])=>isPlaceholderRef(pre.get(id)?.resolverReturnedImageRef)&&!isPlaceholderRef(row.resolverReturnedImageRef)).length};}
function latestByToy(rows){const map=new Map();for(const row of rows)map.set(row.toyLibraryId,row);return map;}
function isLoveveryChild(toy){return toy?.set?.kind==='child'&&/lovevery/i.test(`${toy.brand||''} ${toy.set?.parentCanonicalKey||''} ${toy.canonicalKey||''}`);}
function isPlaceholderRef(ref){return !ref||ref.kind==='placeholder'||(ref.kind==='generated'&&ref.assetState==='placeholder');}
function isPlaceholderResult(ref,src){return isPlaceholderRef(ref)||/(?:icon-192\.png|missing-catalog-metadata)/i.test(String(src||''));}
function normalizeKey(value){return String(value||'').normalize('NFKC').trim().toLowerCase();}
function clone(value){if(value==null)return value;try{return structuredClone(value);}catch{return JSON.parse(JSON.stringify(value));}}
function mapObject(map){return Object.fromEntries([...map].map(([id,rows])=>[id,clone(rows)]));}
function collectLiveDom(doc){const result={};for(const image of doc?.querySelectorAll?.('img[data-runtime-image-toy-id]')||[]){const id=image.dataset.runtimeImageToyId;result[id]={domImgSrc:image.getAttribute('src')||null,domCurrentSrc:image.currentSrc||image.src||null,complete:Boolean(image.complete),naturalWidth:Number(image.naturalWidth||0),isPlaceholder:isPlaceholderResult(parseJson(image.dataset.image),image.currentSrc||image.src)};}return result;}
function parseJson(value){try{return JSON.parse(value||'null');}catch{return null;}}
async function cacheNames(storage){try{return storage?.keys?await storage.keys():[];}catch(error){return[`unavailable:${error?.message||error}`];}}
