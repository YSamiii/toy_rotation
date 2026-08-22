export const SCHEMA_VERSION = 2;

export const CATEGORY_CODES = Object.freeze([
  'uncategorized','cognitive','blocks_construction','puzzles_matching','fine_motor','pretend_play',
  'sensory','music','vehicles_tracks','dolls_plush','books_cards','outdoor_gross_motor','open_ended','language_cognitive','arts_crafts','other'
]);

export const SKILL_CODES = Object.freeze([
  'logic','math','sorting','memory','problem_solving','cause_effect','spatial_awareness','fine_motor',
  'hand_eye','visual_spatial','language','matching','attention','creativity','pretend_play','social',
  'gross_motor','sensory_exploration','practical_life','colour','observation','music','shapes','balance','rules','body_coordination','grasping','aesthetics','visual_tracking','strategy','social_cognition','animal_cognition','science','open_play','imagination','letters','oral_motor'
]);

const categoryAliases = {
  '未分类':'uncategorized','益智类玩具':'cognitive','积木/建构':'blocks_construction','拼图/配对':'puzzles_matching',
  '精细动作':'fine_motor','角色扮演':'pretend_play','感官探索':'sensory','音乐':'music','车辆/轨道':'vehicles_tracks',
  '娃娃/毛绒':'dolls_plush','阅读/卡片':'books_cards','户外/大运动':'outdoor_gross_motor','开放式材料':'open_ended',
  '其他':'other','其它':'other','other':'other','unspecified':'other','桌游':'cognitive','桌游/益智':'cognitive','游戏':'cognitive','语言/认知':'language_cognitive','美术/手工':'arts_crafts','美术/创作':'arts_crafts','':'uncategorized'
};
const skillAliases = {
  '逻辑推理':'logic','数学启蒙':'math','分类能力':'sorting','记忆力':'memory','问题解决':'problem_solving',
  '因果关系':'cause_effect','空间认知':'spatial_awareness','精细动作':'fine_motor','手眼协调':'hand_eye',
  '视觉空间':'visual_spatial','语言':'language','认知配对':'matching','专注力':'attention','创造力':'creativity',
  '角色扮演':'pretend_play','社交互动':'social','大运动':'gross_motor','感官探索':'sensory_exploration',
  '生活技能':'practical_life','颜色认知':'colour','观察力':'observation','音乐':'music','音乐启蒙':'music','形状认知':'shapes','平衡控制':'balance','平衡能力':'balance','身体协调':'body_coordination','抓握能力':'grasping','审美表达':'aesthetics','审美启蒙':'aesthetics','视觉追踪':'visual_tracking','规则意识':'rules','认知启蒙':'logic','策略思维':'strategy','社会认知':'social_cognition','动物认知':'animal_cognition','科学启蒙':'science','开放式游戏':'open_play','想象力':'imagination','字母启蒙':'letters','口腔运动':'oral_motor'
};

export const canonicalKey = value => String(value || '').normalize('NFKC').toLowerCase()
  .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '');
export const normalizeBrand = value => {
  const raw = String(value || '').trim();
  return !raw || /^(其它|其他|other|unknown|unknown brand|unspecified)$/i.test(raw) ? 'other_unspecified' : raw;
};
export const categoryCode = value => CATEGORY_CODES.includes(value) ? value : (categoryAliases[String(value || '').trim()] || 'uncategorized');
export const skillCode = value => SKILL_CODES.includes(value) ? value : skillAliases[String(value || '').trim()];
export const unique = values => [...new Set((values || []).filter(Boolean))];

export function normalizeImageRef(source = {}) {
  if (source.imageRef?.kind) return source.imageRef;
  if (source.photoId) return { kind: 'personal', id: source.photoId };
  if (source.catalogPhotoId || source.confirmedPhotoId) return { kind: 'catalog', id: source.catalogPhotoId || source.confirmedPhotoId };
  if (source.catalogImageUrl || source.imageUrl || source.imageAsset) return { kind: 'remote', url: source.catalogImageUrl || source.imageUrl || source.imageAsset };
  return { kind: 'placeholder' };
}

export function normalizeSet(source = {}) {
  if (source.set?.kind) {
    const rotationMode = source.set.rotationMode === 'split' ? 'split' : 'whole';
    return { kind: source.set.kind === 'whole' && rotationMode === 'split' ? 'parent' : source.set.kind, parentId: source.set.parentId || null, childIds: unique(source.set.childIds), rotationMode };
  }
  const childIds = unique(source.set?.childIds || source.childIds);
  const parentId = source.set?.parentId || source.parentId || null;
  const split = source.set?.rotationMode === 'split' || source.rotationRule === 'split';
  return { kind: source.isSetContainer ? 'parent' : source.isSetChild ? 'child' : source.isSet ? (split ? 'parent' : 'whole') : 'none', parentId, childIds, rotationMode: split ? 'split' : 'whole' };
}

export function normalizeToy(source = {}) {
  const productName = source.productName || source.name || source.nameEn || source.nameZh || '';
  return {
    id: source.id || crypto.randomUUID(),
    canonicalKey: canonicalKey(source.canonicalKey || source.catalogKey || source.key || productName),
    brand: normalizeBrand(source.brand), productName,
    names: { en: source.names?.en || source.nameEn || '', zh: source.names?.zh || source.nameZh || '' },
    categoryCode: categoryCode(source.categoryCode || source.category),
    skillCodes: unique((source.skillCodes || source.skills || []).map(skillCode)),
    playMechanics: unique(source.playMechanics || []), imageRef: normalizeImageRef(source),
    minAgeMonths: numeric(source.minAgeMonths ?? source.ageMinMonths ?? source.startAge),
    maxAgeMonths: numeric(source.maxAgeMonths ?? source.ageMaxMonths ?? source.endAge),
    rotationValue: ['low','medium','high'].includes(source.rotationValue) ? source.rotationValue : 'medium',
    shelfMode: source.shelfMode === 'permanent' ? 'permanent' : 'rotate',
    interest: normalizeInterest(source.interest ?? source.lastReaction),
    purchaseDate: source.purchaseDate || '', storageLocation: source.storageLocation || source.location || '',
    set: normalizeSet(source), hidden: source.hidden === true || source.status === 'hidden', archived: source.archived === true,
    status: source.status === 'active' ? 'active' : 'stored', lastActivatedAt: source.lastActivatedAt || null,
    createdAt: source.createdAt || source.addedAt || new Date().toISOString(), updatedAt: source.updatedAt || new Date().toISOString(),
  };
}

export function normalizeCatalogToy(source = {}) {
  const toy = normalizeToy(source);
  return { id: source.id || source.key || toy.canonicalKey, ...toy, aliases: unique(source.aliases || []), source: source.source || 'base', provenance: source.provenance || source.sourceUrl || '', deleted: false };
}

export function normalizeWishlistItem(source = {}) {
  return { id: source.id || crypto.randomUUID(), canonicalKey: canonicalKey(source.canonicalKey || source.catalogKey || source.name), catalogId: source.catalogId || source.catalogKey || null, status: source.status || 'want', recommendationState: source.recommendationState || null, dismissedAt: source.dismissedAt || null, addedAt: source.addedAt || new Date().toISOString() };
}

export function emptyState() {
  return { schemaVersion: SCHEMA_VERSION, settings: { language: 'system', theme: 'system', rotationSize: 6, rotationDays: 7, onboardingDone: false }, profile: { childName: '', childBirthDate: '' }, toys: [], drafts: [], wishlist: [], rotationHistory: [], catalogState: { tombstones: {}, adminEdits: {}, syncMetadata: {} } };
}

function numeric(value) { return value === '' || value == null || Number.isNaN(Number(value)) ? null : Number(value); }
function normalizeInterest(value) { return value === 'love' || value === 'like' ? 'like' : value === 'okay' || value === 'neutral' ? 'neutral' : value === 'bored' || value === 'dislike' ? 'dislike' : null; }
