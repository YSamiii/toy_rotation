import { STORE_KEY, STORE_SHADOW_KEY, STORE_RECOVERY_STAGING_KEY, STORE_COMMIT_STAGING_KEY, STORE_SNAPSHOT_KEYS, STORE_HEALTH_KEY } from '../data/store.js';

// Frozen P0 scope from the 2026-09-24 identity audit. This is a reference
// inventory, not duplicate discovery and not a migration plan.
const PAIRS = [
  ['lego-duplo-brick-box','lego-duplo-classic-brick-box','10913'],
  ['hape-pound-tap-bench','hape-pound-tap-bench-xylophone','E0305'],
  ['mideer-my-first-puzzle-dinosaurs-6in1','mideer-my-first-puzzle-dinosaurs-6in1-md1460','MD1460'],
  ['lr-helping-hands','learningresources-helping-hands-fine-motor-tool-set','LER5558'],
  ['mideer-dressup-princess-fashion','mideer-ct2283-princess-fashion-show','CT2283'],
  ['mideer-colorful-magnetic-tiles-jurassic-48p','mideer-magnetic-tiles-jurassic-adventure-48p',null],
  ['mideer-colorful-magnetic-tiles-wonderful-forest-40p','mideer-magnetic-tiles-wonderful-forest-40p',null],
  ['mideer-level1-animals-2-6','mideer-level-up-l1-animals-2p-6p',null],
  ['mideer-level1-animals-vehicles-2-6','mideer-level-up-l1-animals-vehicles-2p-6p',null],
  ['mideer-level3-community-helpers','mideer-level-up-l3-community-helpers-24-35p',null],
  ['mideer-level3-natural-scenery','mideer-level-up-l3-natural-scenery-24-35p',null],
  ['mideer-level4-construction','mideer-level-up-l4-clanging-construction-48-72p',null],
  ['mideer-level5-wonderful-adventure','mideer-level-up-l5-wonderful-adventure',null],
  ['mideer-magnetic-maze-parking','mideer-magnetic-maze-parking-lot',null],
  ['mideer-magnetic-tangram','mideer-magnetic-tangram-md4281','MD4281'],
  ['mideer-paper-craft-windmill','mideer-paper-craft-windmill-kingdom-md2307','MD2307'],
  ['mideer-portable-puzzle-our-world-100','mideer-portable-puzzle-our-world-100p-md3027','MD3027'],
  ['mideer-portable-wonderful-ocean-104p','mideer-portable-puzzle-wonderful-ocean-104p',null],
  ['mideer-racing-track-magnetic-115','mideer-racing-track-grooved-magnetic-tiles-115p-md6395','MD6395']
];
export const RAW_IDENTITY_P0_GROUPS = Object.freeze(PAIRS.map(([a,b,sku],index) => Object.freeze({groupId:`P0-${String(index+1).padStart(2,'0')}`,canonicalKeys:[a,b],skuModel:sku,duplicateEvidence:index<4?'same SKU/model or established redirect':'confirmed exact official product-page identity'})));
const BASE_KEYS = [STORE_KEY,STORE_SHADOW_KEY,STORE_RECOVERY_STAGING_KEY,STORE_COMMIT_STAGING_KEY,...STORE_SNAPSHOT_KEYS,STORE_HEALTH_KEY,
  'toyRotationV04','toyRotationV032','toyRotationV03','toyRotationV02',
  'toyRotationCatalogDeletedV0934','toyRotationHiddenCatalogKeysV0927','toyRotationHiddenCatalogTombstonesV0929',
  'toyRotationHiddenCatalogAuthoritativeV0930','toyRotationCatalogHiddenV0933','toyRotationCatalogPendingHideV0933',
  'toyRotationCatalogOverridesV095','toyCatalogConfirmedPhotosV1','toyRotationCatalogMediaV0946'];
const SAFE_ID = /^[a-z0-9:._-]{1,150}$/i;
const KEY_FIELDS = new Set(['canonicalKey','catalogKey','catalogId','parentCanonicalKey','legacyCanonicalKey','childCanonicalKey','sourceCanonicalKey','targetCanonicalKey','from','to']);
const KEY_ARRAY_FIELDS = new Set(['childCanonicalKeys','legacyCanonicalKeys','canonicalKeys','catalogKeys','aliases']);

function matchingGroup(value) {
  if (typeof value !== 'string') return null;
  for (const group of RAW_IDENTITY_P0_GROUPS) for (const key of group.canonicalKeys) {
    if (value === key) return {group,key,childIndex:null};
    if (group.groupId === 'P0-03') {
      const match = value.match(new RegExp(`^${key}[:\\-]puzzle-([1-6])$`));
      if (match) return {group,key,childIndex:Number(match[1])};
    }
  }
  return null;
}
function safeId(value) { return typeof value === 'string' && SAFE_ID.test(value) ? value : null; }
function statusFor(path, object) {
  if (/snapshot|shadow|staging|preFresh|toyRotationV0/i.test(path)) return 'historical';
  if (/deleted|tombstone/i.test(path) || object?.deleted || object?.status === 'deleted') return 'deleted';
  if (/archive/i.test(path) || object?.archived || object?.status === 'archived') return 'archived';
  return 'active';
}
function areaFor(path, source) {
  if (/preFresh|snapshot|shadow|staging|toyRotationV0/i.test(source)) return 'backup/recovery';
  if (/crossAgeApprovals/.test(path)) return 'crossAgeApprovals';
  if (/rotationHistory|recent|cooldown|lastSelected/i.test(path)) return 'rotation history/recent-use';
  if (/developmentFeedbackHistory|developmentProfile|feedback/i.test(path)) return 'Development Fit/feedback';
  if (/wishlist/i.test(path)) return 'Wishlist';
  if (/image|photo|media/i.test(path)) return 'image references';
  if (/catalogState|toyRotationCatalog/i.test(path+source)) return 'Catalog/user override';
  if (/toys|drafts/i.test(path)) return 'Toy Library';
  return 'persistence/migration residue';
}
function relationFor(path, match) {
  if (match.childIndex || /childCanonical/i.test(path)) return 'child';
  if (/parentCanonical/i.test(path)) return 'parent';
  return null;
}
function sourceRecord(value) {
  if (typeof value !== 'string') return {status:'unsupported'};
  try { return {status:'available',value:JSON.parse(value)}; }
  catch { return {status:'malformed'}; }
}

export function buildRawIdentityReferenceAudit({ storage, catalog=null, build={}, generatedAt=new Date().toISOString() }={}) {
  const groups=RAW_IDENTITY_P0_GROUPS.map(group=>({...group,existingRedirects:[],rawRefSummary:{total:0,active:0,historical:0,backup:0,image:0,child:0,approval:0},rawRefs:[]}));
  const groupById=new Map(groups.map(group=>[group.groupId,group]));
  const availableSources=[]; const unavailableSources=[]; const storageSourcesScanned=[];
  if(storage === undefined) {
    try { storage=globalThis.localStorage; }
    catch { storage=null; unavailableSources.push({source:'localStorage',reason:'CURRENT DATA UNAVAILABLE: browser denied storage access'}); }
  }
  const keys=[...BASE_KEYS];
  try { for(let i=0;i<(storage?.length || 0);i++){const key=storage.key(i);if(/^toyRotation\.cleanBaseline\.preFresh\./.test(key) && !keys.includes(key)) keys.push(key);} }
  catch { unavailableSources.push({source:'localStorage key inventory',reason:'CURRENT DATA UNAVAILABLE: storage enumeration denied'}); }
  for(const key of keys) {
    let raw;
    try { raw=storage?.getItem?.(key); }
    catch { unavailableSources.push({source:key,reason:'CURRENT DATA UNAVAILABLE: storage read denied'}); storageSourcesScanned.push({source:key,status:'unavailable'}); continue; }
    if(raw==null) { storageSourcesScanned.push({source:key,status:'missing'}); unavailableSources.push({source:key,reason:'CURRENT DATA UNAVAILABLE: no retained record on this device'}); continue; }
    const parsed=sourceRecord(raw);
    storageSourcesScanned.push({source:key,status:parsed.status});
    if(parsed.status!=='available') { unavailableSources.push({source:key,reason:`CURRENT DATA UNAVAILABLE: ${parsed.status} record`}); continue; }
    availableSources.push(key);
    const root=parsed.value?.state || parsed.value;
    const toys=[...(Array.isArray(root?.toys)?root.toys:[]),...(Array.isArray(root?.drafts)?root.drafts:[])];
    const toyById=new Map(toys.filter(toy=>safeId(toy?.id)).map(toy=>[toy.id,toy]));
    const seen=new WeakSet();
    function emit(value,path,parent,recordType,viaToyId=false) {
      const hit=matchingGroup(value); if(!hit)return;
      const group=groupById.get(hit.group.groupId);
      const resolved=catalog?.resolve?.({canonicalKey:hit.key});
      const current=safeId(resolved?.canonicalKey) || hit.key;
      const status=statusFor(`${key}:${path}`,parent);
      const sourceArea=areaFor(path,key);
      const image=/image|photo|media/i.test(path);
      const ref={canonicalKeyFound:value,normalizedCurrentCanonicalKey:hit.childIndex?`${current}:puzzle-${hit.childIndex}`:current,
        sourceArea,storageKey:key,recordType,recordId:safeId(parent?.id),status,relation:relationFor(path,hit),rawFieldPath:path,
        runtimeRedirectWouldResolve:current!==hit.key,migrationMayBeRequired:current!==hit.key,
        referenceViaToyId:viaToyId,imageRefExists:image || !!parent?.imageRef || !!parent?.personalImageRef,
        noteRefExists:!!(parent?.notes || parent?.note),customFieldsExist:!!parent?.customFields,
        shelfState:parent?.currentShelf === true ? 'current' : parent?.currentShelf === false ? 'not-current' : null,
        permanentState:!!(parent?.customPermanent || parent?.permanentSource === 'user'),
        feedbackType:['too_easy','just_right','good_challenge','too_hard','not_interested'].includes(parent?.feedback) ? parent.feedback : null};
      if(sourceArea==='crossAgeApprovals') {
        ref.approvalState=parent?.approved === true ? 'approved' : parent?.approved === false ? 'declined' : 'record-present';
        ref.approvedAt=/^\d{4}-\d{2}-\d{2}/.test(parent?.approvedAt || '') ? parent.approvedAt : null;
        ref.sourceRecommendedMinAgeMonths=Number.isFinite(parent?.sourceRecommendedMinAgeMonths) ? parent.sourceRecommendedMinAgeMonths : null;
      }
      if(hit.childIndex) ref.childIndex=hit.childIndex;
      group.rawRefs.push(ref);
      group.rawRefSummary.total++;
      if(status==='active')group.rawRefSummary.active++;
      else group.rawRefSummary.historical++;
      if(sourceArea==='backup/recovery')group.rawRefSummary.backup++;
      if(image)group.rawRefSummary.image++;
      if(ref.relation==='child')group.rawRefSummary.child++;
      if(sourceArea==='crossAgeApprovals')group.rawRefSummary.approval++;
    }
    function scan(value,path='$',parent=null,field='',depth=0) {
      if(depth>35 || value==null)return;
      if(typeof value==='string') {
        if(KEY_FIELDS.has(field) || KEY_ARRAY_FIELDS.has(field) || /^(?:legacy|source|target)?canonical(?:key)?$/i.test(field)) emit(value,path,parent,field || 'canonical reference');
        else if(/^(?:toyIds|selectedIds|recentIds)$/.test(field) && toyById.has(value)) emit(toyById.get(value).canonicalKey,`${path} -> toys[id=${safeId(value)}].canonicalKey`,toyById.get(value),'toy-id link',true);
        else if(field==='raw' && /preFresh/.test(key)) { const nested=sourceRecord(value); if(nested.status==='available')scan(nested.value,`${path}<parsed>`,parent,field,depth+1); }
        return;
      }
      if(typeof value!=='object' || seen.has(value))return;
      seen.add(value);
      if(Array.isArray(value)) {value.forEach((item,index)=>scan(item,`${path}[${index}]`,parent,field,depth+1));return;}
      const owner=typeof value.id==='string'?value:parent;
      for(const [property,item] of Object.entries(value)) {
        // Never traverse image payloads or private free-text. Their existence is
        // represented by flags on the owning canonical reference instead.
        if(/^(?:notes?|dataUrl|data|blob|token|secret|password|apiKey)$/i.test(property))continue;
        const propertyHit=matchingGroup(property);
        const safeProperty=propertyHit || /^[A-Za-z][A-Za-z0-9_]*$/.test(property);
        const nextPath=safeProperty?`${path}.${property}`:`${path}[${JSON.stringify(safeId(property) || '<opaque-key>')}]`;
        if(propertyHit)emit(property,nextPath,owner,'canonical-keyed map entry');
        scan(item,nextPath,owner,Array.isArray(value)?field:property,depth+1);
      }
    }
    scan(parsed.value);
  }
  for(const group of groups) {
    const sides=new Set(group.rawRefs.map(ref=>matchingGroup(ref.canonicalKeyFound)?.key));
    group.duplicateRawStateUnderBothCanonicals=group.canonicalKeys.every(key=>sides.has(key));
    for(const key of group.canonicalKeys) {
      const current=catalog?.resolve?.({canonicalKey:key})?.canonicalKey;
      if(current && current!==key)group.existingRedirects.push({from:key,to:current,kind:'runtime resolution projection only'});
    }
  }
  unavailableSources.push(
    {source:'external/downloaded backup files',reason:'CURRENT DATA UNAVAILABLE: browser cannot read files without owner selection'},
    {source:'Safari-cleared history or other devices',reason:'CURRENT DATA UNAVAILABLE: not retained on this device'},
    {source:'IndexedDB image payload registry',reason:'CURRENT DATA UNAVAILABLE: intentionally not opened to avoid creating or reading image bytes; persisted image refs are scanned'}
  );
  return {auditVersion:'v0.11.6-raw-p0-1',buildId:String(build.buildId || ''),generatedAt,scope:{p0Groups:groups.length},storageSourcesScanned,groups,scanCoverage:{availableSources,unavailableSources}};
}
