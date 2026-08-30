// Derived catalog presentation metadata enters through the one catalog pipeline.
// It is deliberately separate from substitution scoring.
const MECHANIC_RULES = Object.freeze({
  jigsaw: ['拼图', 'puzzle'], matching_sorting: ['配对', 'matching', '分类', 'sorting', 'sorter'], maze_logic: ['迷宫', 'maze', '数独', 'sudoku', 'logic game'],
  magnetic_build: ['磁力片', 'magnetic tile', 'magnetic stick'], blocks_build: ['积木', 'building block', 'blocks'], marble_track: ['滚珠', 'marble', '球道', '轨道', 'track'],
  screw_bolt_tool: ['螺丝', '螺母', '螺栓', 'screw', 'bolt', 'nuts', '工具台', 'workbench', 'tool set'], threading_lacing: ['穿线', '串珠', 'lacing', 'threading', 'bead'],
  stack_balance: ['堆叠', 'stack', '平衡游戏', 'balance game'], drawing_art: ['画画', '绘画', 'drawing', 'paint', '水画', 'doodle', 'art set'], music_play: ['乐器', '音乐', 'music', 'piano', '鼓', 'drum', '琴'],
  pretend_role: ['过家家', '角色扮演', 'pretend', 'role play', 'role-play', 'playset'], care_doll: ['娃娃', 'baby doll', 'doll care'], cleaning: ['打扫', '清洁', 'cleaning', 'broom', 'mop'],
  cooking_serving: ['厨房', '厨具', '烹饪', '做饭', '咖啡机', '餐具', 'kitchen', 'cooking', 'coffee', 'tea set', 'food play'], medical_care: ['医生', '医疗', 'doctor', 'medical', 'dentist', 'vet', '兽医'],
  shop_service: ['商店', '收银', '超市', 'shop', 'store', 'cash register', 'market'], repair_build_role: ['维修', '修理', '工具', 'repair', 'mechanic', 'workbench'],
  ride_balance: ['滑板车', 'scooter', '扭扭车', 'ride-on', 'balance bike', '摇马', 'rocking horse'], pull_push_walk: ['拖拉', 'pull along', '推行', 'push toy', '学步', 'walker'], throw_catch_ball: ['投掷', '抛接', 'throw', 'catch', 'ball game', '篮球', 'basketball', '保龄球', 'bowling']
});

export function deriveCatalogMechanics(toy) {
  const text = normalize([toy.productName, toy.names?.en, toy.names?.zh, toy.brand, ...toy.aliases].filter(Boolean).join(' '));
  const derived = Object.entries(MECHANIC_RULES).filter(([, words]) => words.some(word => text.includes(normalize(word)))).map(([code]) => code);
  return [...new Set([...(toy.playMechanics || []), ...derived])];
}

export function catalogImageRef(toy) {
  // Historical bundles referenced a Lovevery asset directory that was not
  // shipped in the install package. Treat those stale paths as missing rather
  // than rendering the global placeholder for every kit.
  if (toy.imageRef?.kind && toy.imageRef.kind !== 'placeholder' && !String(toy.imageRef.url || '').startsWith('./catalog-images/')) return {
    ...toy.imageRef,
    // Catalog-owned repository references already have a stable identity in
    // `id`; do not decorate them into a different presentation shape. Remote
    // assets carry provenance metadata because their URL is the resolver key.
    ...(toy.imageRef.kind === 'remote' || toy.imageRef.catalogImageRef ? {
      catalogImageRef: toy.imageRef.catalogImageRef || toy.imageRef.url || null,
      imageSource: toy.imageRef.imageSource || toy.imageRef.source || null,
      imageSourceType: toy.imageRef.imageSourceType || 'stable_remote'
    } : {}),
    assetState: toy.imageRef.assetState || (toy.imageRef.kind === 'remote' ? 'stable_remote' : 'manually_confirmed'),
    verificationStatus: toy.imageRef.verificationStatus || (toy.imageRef.kind === 'remote' ? 'unverified' : 'manually_confirmed'),
    updatedAt: toy.imageRef.updatedAt || null
  };
  const name = toy.names?.en || toy.productName;
  if (!name) return { kind:'placeholder' };
  // Never use an unaudited search-engine URL as an image source.  Safari/PWA
  // commonly rejects those responses and turns a metadata problem into a
  // broken-looking card.  A deterministic, product-labelled fallback is safe
  // to render, while the audit continues to report this row as missing image
  // metadata until a real catalog asset is supplied.
  return { kind:'generated', label:name, brand:toy.brand, source:'missing-catalog-metadata', assetState:'placeholder', verificationStatus:'missing_metadata', updatedAt:null };
}

// Personal photos always win. Catalog-backed library records without a
// personal photo resolve their current shared catalog asset at presentation
// time, so a later image backfill also reaches existing Toy Library records.
export function resolvedLibraryImageRef(toy, catalog, parentImageRef = null) {
  const parent = toy?.set?.kind === 'child' ? { imageRef:parentImageRef, canonicalKey:toy.set.parentCanonicalKey } : null;
  const stored = toy?.set?.kind === 'child' ? validateChildImageProvenance(toy, parent) : null;
  if (toy?.imageRef?.kind === 'personal' && (toy?.set?.kind !== 'child' || stored?.accepted)) return toy.imageRef;
  const catalogToy = catalog?.resolve?.(toy);
  const catalogImage = catalogToy?.imageRef;
  // A catalog backfill is shared presentation state, not a personal-photo
  // migration. Prefer the current verified/stable catalog asset over a stale
  // ownership snapshot so existing Toy Library rows immediately inherit it.
  if (catalogImage && (toy?.set?.kind !== 'child' || (sameChildCatalogIdentity(toy, catalogToy) && isVerifiedOrStableCatalogImage(catalogImage)))) return catalogImage;
  // A migrated child may retain a verified/stable same-child reference under
  // a legacy key. It remains a safe final fallback, but unaudited search URLs
  // and stale placeholders must not block the current shared catalog asset.
  if (toy?.set?.kind === 'child' && isChildCatalogImage(toy.imageRef) && stored?.accepted && isVerifiedOrStableCatalogImage(toy.imageRef)) return toy.imageRef;
  return toy?.set?.kind === 'child' ? { kind:'placeholder' } : toy?.imageRef || { kind:'placeholder' };
}

function isChildCatalogImage(ref) { return Boolean(ref && ref.kind !== 'placeholder' && ref.kind !== 'generated' && (ref.catalogImageRef || ref.kind === 'catalog' || ref.kind === 'remote')); }

function isVerifiedOrStableCatalogImage(ref) {
  if (!isChildCatalogImage(ref) || isSearchOrTransientImage(ref)) return false;
  if (ref.kind === 'catalog') return true;
  return ['verified','verified_real','manually_confirmed'].includes(ref.verificationStatus)
    || ['verified_real','stable_remote','manually_confirmed'].includes(ref.assetState)
    || ['official_cdn','stable_retailer','manually_confirmed'].includes(ref.imageSourceType);
}

function isSearchOrTransientImage(ref) {
  const value = String(ref?.catalogImageRef || ref?.url || '');
  return /(?:bing\.net\/th|bing\.com\/images|google(?:usercontent)?\.com\/search|[?&](?:token|expires|signature)=|^(?:blob|data):)/i.test(value)
    || ['search-fallback','missing-catalog-metadata'].includes(ref?.source);
}

function sameChildCatalogIdentity(toy, catalogToy) {
  if (toy?.set?.kind !== 'child' || catalogToy?.set?.kind !== 'child') return false;
  const toyKeys = identityKeys(toy); const catalogKeys = identityKeys(catalogToy);
  if (toyKeys.some(key => catalogKeys.includes(key))) return true;
  const toyParent = canonicalIdentity(toy?.set?.parentCanonicalKey);
  const catalogParent = canonicalIdentity(catalogToy?.set?.parentCanonicalKey);
  const toyPart = Number(toy?.set?.partIndex || partIndexFromKey(toy?.canonicalKey));
  const catalogPart = Number(catalogToy?.set?.partIndex || partIndexFromKey(catalogToy?.canonicalKey));
  return Boolean(toyParent && toyParent === catalogParent && toyPart > 0 && toyPart === catalogPart);
}

function identityKeys(value) { return [...new Set([value?.canonicalKey, ...(value?.legacyCanonicalKeys || [])].map(canonicalIdentity).filter(Boolean))]; }
function partIndexFromKey(value) { return String(value || '').match(/(?:-|:)(?:part|puzzle)?-?(\d+)$/i)?.[1] || 0; }

function normalize(value) { return String(value || '').normalize('NFKC').toLowerCase().replace(/[\s_\-–—/:：·.,，()（）]+/g, ' ').trim(); }
function sameImageRef(a, b) { return Boolean(a && b) && JSON.stringify(a) === JSON.stringify(b); }
function canonicalIdentity(value) { return String(value?.canonicalKey || value || '').normalize('NFKC').toLowerCase(); }
import { validateChildImageProvenance } from './set-service.js';
