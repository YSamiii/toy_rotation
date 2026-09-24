// src/data/schema.js
var SCHEMA_VERSION = 12;
var CATEGORY_CODES = Object.freeze([
  "uncategorized",
  "cognitive",
  "blocks_construction",
  "puzzles_matching",
  "fine_motor",
  "pretend_play",
  "sensory",
  "music",
  "vehicles_tracks",
  "dolls_plush",
  "books_cards",
  "outdoor_gross_motor",
  "open_ended",
  "language_cognitive",
  "arts_crafts",
  "other"
]);
var SKILL_CODES = Object.freeze([
  "logic",
  "math",
  "sorting",
  "memory",
  "problem_solving",
  "cause_effect",
  "spatial_awareness",
  "fine_motor",
  "hand_eye",
  "visual_spatial",
  "language",
  "matching",
  "attention",
  "creativity",
  "pretend_play",
  "social",
  "gross_motor",
  "sensory_exploration",
  "practical_life",
  "colour",
  "observation",
  "music",
  "shapes",
  "balance",
  "rules",
  "body_coordination",
  "grasping",
  "aesthetics",
  "visual_tracking",
  "strategy",
  "social_cognition",
  "animal_cognition",
  "science",
  "open_play",
  "imagination",
  "letters",
  "oral_motor"
]);
var categoryAliases = {
  "\u672A\u5206\u7C7B": "uncategorized",
  "\u76CA\u667A\u7C7B\u73A9\u5177": "cognitive",
  "\u79EF\u6728/\u5EFA\u6784": "blocks_construction",
  "\u62FC\u56FE/\u914D\u5BF9": "puzzles_matching",
  "\u7CBE\u7EC6\u52A8\u4F5C": "fine_motor",
  "\u89D2\u8272\u626E\u6F14": "pretend_play",
  "\u611F\u5B98\u63A2\u7D22": "sensory",
  "\u97F3\u4E50": "music",
  "\u8F66\u8F86/\u8F68\u9053": "vehicles_tracks",
  "\u5A03\u5A03/\u6BDB\u7ED2": "dolls_plush",
  "\u9605\u8BFB/\u5361\u7247": "books_cards",
  "\u6237\u5916/\u5927\u8FD0\u52A8": "outdoor_gross_motor",
  "\u5F00\u653E\u5F0F\u6750\u6599": "open_ended",
  "\u5176\u4ED6": "other",
  "\u5176\u5B83": "other",
  "other": "other",
  "unspecified": "other",
  "\u684C\u6E38": "cognitive",
  "\u684C\u6E38/\u76CA\u667A": "cognitive",
  "\u6E38\u620F": "cognitive",
  "\u8BED\u8A00/\u8BA4\u77E5": "language_cognitive",
  "\u7F8E\u672F/\u624B\u5DE5": "arts_crafts",
  "\u7F8E\u672F/\u521B\u4F5C": "arts_crafts",
  "": "uncategorized"
};
var skillAliases = {
  "\u903B\u8F91\u63A8\u7406": "logic",
  "\u6570\u5B66\u542F\u8499": "math",
  "\u5206\u7C7B\u80FD\u529B": "sorting",
  "\u8BB0\u5FC6\u529B": "memory",
  "\u95EE\u9898\u89E3\u51B3": "problem_solving",
  "\u56E0\u679C\u5173\u7CFB": "cause_effect",
  "\u7A7A\u95F4\u8BA4\u77E5": "spatial_awareness",
  "\u7CBE\u7EC6\u52A8\u4F5C": "fine_motor",
  "\u624B\u773C\u534F\u8C03": "hand_eye",
  "\u89C6\u89C9\u7A7A\u95F4": "visual_spatial",
  "\u8BED\u8A00": "language",
  "\u8BA4\u77E5\u914D\u5BF9": "matching",
  "\u4E13\u6CE8\u529B": "attention",
  "\u521B\u9020\u529B": "creativity",
  "\u89D2\u8272\u626E\u6F14": "pretend_play",
  "\u793E\u4EA4\u4E92\u52A8": "social",
  "\u5927\u8FD0\u52A8": "gross_motor",
  "\u611F\u5B98\u63A2\u7D22": "sensory_exploration",
  "\u751F\u6D3B\u6280\u80FD": "practical_life",
  "\u989C\u8272\u8BA4\u77E5": "colour",
  "\u89C2\u5BDF\u529B": "observation",
  "\u97F3\u4E50": "music",
  "\u97F3\u4E50\u542F\u8499": "music",
  "\u5F62\u72B6\u8BA4\u77E5": "shapes",
  "\u5E73\u8861\u63A7\u5236": "balance",
  "\u5E73\u8861\u80FD\u529B": "balance",
  "\u8EAB\u4F53\u534F\u8C03": "body_coordination",
  "\u6293\u63E1\u80FD\u529B": "grasping",
  "\u5BA1\u7F8E\u8868\u8FBE": "aesthetics",
  "\u5BA1\u7F8E\u542F\u8499": "aesthetics",
  "\u89C6\u89C9\u8FFD\u8E2A": "visual_tracking",
  "\u89C4\u5219\u610F\u8BC6": "rules",
  "\u8BA4\u77E5\u542F\u8499": "logic",
  "\u7B56\u7565\u601D\u7EF4": "strategy",
  "\u793E\u4F1A\u8BA4\u77E5": "social_cognition",
  "\u52A8\u7269\u8BA4\u77E5": "animal_cognition",
  "\u79D1\u5B66\u542F\u8499": "science",
  "\u5F00\u653E\u5F0F\u6E38\u620F": "open_play",
  "\u60F3\u8C61\u529B": "imagination",
  "\u5B57\u6BCD\u542F\u8499": "letters",
  "\u53E3\u8154\u8FD0\u52A8": "oral_motor"
};
var canonicalKey = (value) => String(value || "").normalize("NFKC").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-+|-+$/g, "");
var normalizeBrand = (value) => {
  const raw = String(value || "").trim();
  return !raw || /^(其它|其他|other|unknown|unknown brand|unspecified)$/i.test(raw) ? "other_unspecified" : raw;
};
var categoryCode = (value) => CATEGORY_CODES.includes(value) ? value : categoryAliases[String(value || "").trim()] || "uncategorized";
var skillCode = (value) => SKILL_CODES.includes(value) ? value : skillAliases[String(value || "").trim()];
var unique = (values) => [...new Set((values || []).filter(Boolean))];
function normalizeImageRef(source = {}) {
  if (source.imageRef?.kind === "packaged") {
    const path = String(source.imageRef.path || "").replace(/\\/g, "/");
    return /^catalog-assets\/[a-z0-9][a-z0-9._-]*\.(?:svg|png|webp|jpe?g)$/i.test(path) ? { kind: "packaged", path } : { kind: "placeholder" };
  }
  if (source.imageRef?.kind && source.imageRef.kind !== "placeholder") return source.imageRef;
  if (source.photoId) return { kind: "personal", id: source.photoId };
  if (source.catalogPhotoId || source.confirmedPhotoId) return { kind: "catalog", id: source.catalogPhotoId || source.confirmedPhotoId };
  if (source.catalogImageUrl || source.imageUrl || source.imageAsset) return { kind: "remote", url: source.catalogImageUrl || source.imageUrl || source.imageAsset };
  return { kind: "placeholder" };
}
function normalizeSet(source = {}) {
  const rawSet = source.set || {};
  const parentCanonicalKey = canonicalKey(rawSet.parentCanonicalKey || rawSet.parentKitKey || source.parentCanonicalKey || source.parentKitKey || source.parentKey || source.parentCatalogKey || source.setParentKey || "");
  const setName = rawSet.setName || source.setName || source.parentName || "";
  const partIndex = numeric(rawSet.partIndex ?? source.partIndex);
  const legacyParentIds = unique([
    ...rawSet.legacyParentIds || [],
    rawSet.parentId,
    rawSet.parentSetId,
    rawSet.parentToyId,
    source.parentId,
    source.parentSetId,
    source.parentToyId,
    source.parentKitId
  ].map((value) => String(value || "").trim()));
  const intentionalRemovedChildKeys = unique([
    ...rawSet.intentionalRemovedChildKeys || [],
    ...source.intentionalRemovedChildKeys || []
  ].map(canonicalKey));
  const ownershipSource = rawSet.ownershipSource || source.ownershipSource || null;
  const generatedFromParentId = rawSet.generatedFromParentId || source.generatedFromParentId || null;
  const ownershipGroupId = rawSet.ownershipGroupId || source.ownershipGroupId || null;
  const detachedFromSet = rawSet.detachedFromSet === true || source.detachedFromSet === true;
  const detachedFromParentOwnershipId = rawSet.detachedFromParentOwnershipId || source.detachedFromParentOwnershipId || null;
  const detachedAt = rawSet.detachedAt || source.detachedAt || null;
  if (source.set?.kind) {
    const rotationMode = source.set.rotationMode === "split" ? "split" : "whole";
    return { kind: source.set.kind === "whole" && rotationMode === "split" ? "parent" : source.set.kind, parentId: source.set.parentId || null, parentCanonicalKey: parentCanonicalKey || null, legacyParentIds, setName, partIndex, childIds: unique(source.set.childIds), intentionalRemovedChildKeys, rotationMode, ownershipSource, generatedFromParentId, ownershipGroupId, detachedFromSet, detachedFromParentOwnershipId, detachedAt };
  }
  const childIds = unique(source.set?.childIds || source.childIds);
  const parentId = source.set?.parentId || source.parentId || null;
  const split = source.set?.rotationMode === "split" || source.rotationRule === "split";
  const hasLegacyParent = Boolean(parentId || parentCanonicalKey || legacyParentIds.length || setName && (source.parentName || source.parentKitName));
  return { kind: source.isSetContainer ? "parent" : source.isSetChild || hasLegacyParent ? "child" : source.isSet ? split ? "parent" : "whole" : "none", parentId, parentCanonicalKey: parentCanonicalKey || null, legacyParentIds, setName, partIndex, childIds, intentionalRemovedChildKeys, rotationMode: split ? "split" : "whole", ownershipSource, generatedFromParentId, ownershipGroupId, detachedFromSet, detachedFromParentOwnershipId, detachedAt };
}
function normalizeToy(source = {}) {
  const productName = source.productName || source.name || source.nameEn || source.nameZh || "";
  const shelfMode = source.shelfMode === "permanent" ? "permanent" : "rotate";
  const permanentSource = shelfMode === "permanent" ? source.permanentSource === "user" ? "user" : source.permanentSource === "system" ? "system" : "legacy" : null;
  const manualShelfMode = source.manualShelfMode === "on_shelf" || source.manualShelfMode === "stored" ? source.manualShelfMode : null;
  const rotationParticipation = source.rotationParticipation === "paused" ? "paused" : "active";
  return {
    id: source.id || crypto.randomUUID(),
    canonicalKey: canonicalKey(source.canonicalKey || source.catalogKey || source.key || productName),
    legacyCanonicalKeys: unique([...source.legacyCanonicalKeys || [], source.catalogKey, source.key].map(canonicalKey)),
    // A manufacturer set number is the same durable product identifier as a
    // SKU for Catalog identity purposes. Keep the explicit field as well so
    // it can travel through Library and Wishlist snapshots without a UI-only
    // translation layer.
    sku: String(source.sku || source.setNumber || source.variantId || source.productCode || source.modelNumber || source.variantCode || "").trim() || null,
    setNumber: String(source.setNumber || source.sku || "").trim() || null,
    variantId: String(source.variantId || source.variantCode || "").trim() || null,
    variantName: String(source.variantName || "").trim() || null,
    pieceCount: numeric(source.pieceCount),
    exactTitle: String(source.exactTitle || "").trim() || null,
    identitySource: String(source.identitySource || "").trim() || null,
    brand: normalizeBrand(source.brand),
    productName,
    names: { en: source.names?.en || source.nameEn || "", zh: source.names?.zh || source.nameZh || "" },
    aliases: unique(source.aliases || []),
    categoryCode: categoryCode(source.categoryCode || source.category),
    skillCodes: unique((source.skillCodes || source.skills || []).map(skillCode)),
    playMechanics: unique(source.playMechanics || []),
    operationCode: source.operationCode || null,
    goalCodes: unique(source.goalCodes || []),
    sceneCodes: unique(source.sceneCodes || []),
    challengeLevel: Number.isInteger(Number(source.challengeLevel)) && Number(source.challengeLevel) >= 1 && Number(source.challengeLevel) <= 5 ? Number(source.challengeLevel) : null,
    progressionLevel: Number.isInteger(Number(source.progressionLevel)) && Number(source.progressionLevel) >= 1 && Number(source.progressionLevel) <= 5 ? Number(source.progressionLevel) : null,
    imageRef: normalizeImageRef(source),
    alternateImageRefs: uniqueImageRefs(source.alternateImageRefs || []),
    minAgeMonths: numeric(source.minAgeMonths ?? source.ageMinMonths ?? source.startAge),
    maxAgeMonths: numeric(source.maxAgeMonths ?? source.ageMaxMonths ?? source.endAge),
    rotationValue: ["low", "medium", "high"].includes(source.rotationValue) ? source.rotationValue : "medium",
    shelfMode,
    permanentSource,
    permanentSetAt: permanentSource === "user" ? source.permanentSetAt || source.updatedAt || null : null,
    manualShelfMode,
    manualShelfUpdatedAt: manualShelfMode ? source.manualShelfUpdatedAt || source.updatedAt || null : null,
    rotationParticipation: permanentSource === "user" ? "active" : rotationParticipation,
    pauseReason: rotationParticipation === "paused" ? String(source.pauseReason || "").slice(0, 240) : String(source.pauseReason || "").slice(0, 240),
    pauseReasonCode: rotationParticipation === "paused" ? String(source.pauseReasonCode || "").slice(0, 80) : null,
    pauseUpdatedAt: rotationParticipation === "paused" ? source.pauseUpdatedAt || source.updatedAt || null : null,
    interest: normalizeInterest(source.interest ?? source.lastReaction),
    purchaseDate: source.purchaseDate || "",
    storageLocation: source.storageLocation || source.location || "",
    notes: source.notes || "",
    purchaseMetadata: plainObject(source.purchaseMetadata),
    feedbackHistory: uniqueObjects(source.feedbackHistory || source.feedback || []),
    usageHistory: uniqueObjects(source.usageHistory || source.activationHistory || []),
    userMetadata: { ...plainObject(source.userEditedMetadata), ...plainObject(source.userMetadata) },
    mergeDiagnostics: unique(source.mergeDiagnostics || []),
    set: normalizeSet(source),
    hidden: source.hidden === true || source.status === "hidden",
    archived: source.archived === true,
    status: source.status === "active" ? "active" : "stored",
    lastActivatedAt: source.lastActivatedAt || null,
    createdAt: source.createdAt || source.addedAt || (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: source.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function normalizeCatalogToy(source = {}) {
  const toy = normalizeToy(source);
  return { id: source.id || source.key || toy.canonicalKey, ...toy, aliases: unique(source.aliases || []), legacyCanonicalKeys: unique([...toy.legacyCanonicalKeys || [], ...source.legacyCanonicalKeys || []]), children: Array.isArray(source.children) ? source.children : [], childCount: source.childCount || source.puzzleCount || null, catalogGroup: source.catalogGroup || "", catalogSortOrder: Number(source.catalogSortOrder ?? 999999), source: source.source || source.catalogSource || "base", provenance: source.provenance || source.sourceUrl || "", reviewStatus: source.reviewStatus || (source.source === "learned" ? "pending" : "approved"), candidateImageRef: source.candidateImageRef || null, resurrectionVersion: source.resurrectionVersion || null, createdAt: source.createdAt || toy.createdAt, deleted: false };
}
function normalizeWishlistItem(source = {}) {
  const sourceToy = source.catalogSnapshot || source;
  const normalized2 = normalizeToy(sourceToy);
  const hasSnapshot = Boolean(sourceToy.productName || sourceToy.name || sourceToy.nameEn || sourceToy.nameZh);
  const catalogSnapshot = hasSnapshot ? { canonicalKey: normalized2.canonicalKey, sku: normalized2.sku, setNumber: normalized2.setNumber, variantId: normalized2.variantId, variantName: normalized2.variantName, pieceCount: normalized2.pieceCount, exactTitle: normalized2.exactTitle, identitySource: normalized2.identitySource, brand: normalized2.brand, productName: normalized2.productName, names: normalized2.names, categoryCode: normalized2.categoryCode, skillCodes: normalized2.skillCodes, playMechanics: normalized2.playMechanics, imageRef: normalized2.imageRef, minAgeMonths: normalized2.minAgeMonths, maxAgeMonths: normalized2.maxAgeMonths } : null;
  return { id: source.id || crypto.randomUUID(), canonicalKey: canonicalKey(source.canonicalKey || source.catalogKey || normalized2.canonicalKey), catalogId: source.catalogId || source.catalogKey || null, catalogSnapshot, status: ["want", "purchased", "dismissed"].includes(source.status) ? source.status : "want", priority: ["low", "medium", "high"].includes(source.priority) ? source.priority : "medium", notes: String(source.notes || "").slice(0, 2e3), sourceLink: String(source.sourceLink || "").slice(0, 2e3), recognizedMetadata: plainObject(source.recognizedMetadata), recommendationState: source.recommendationState || null, dismissedAt: source.dismissedAt || null, addedAt: source.addedAt || (/* @__PURE__ */ new Date()).toISOString() };
}
function emptyState() {
  return { schemaVersion: SCHEMA_VERSION, settings: { language: "system", theme: "system", rotationSize: 6, rotationDays: 7, onboardingDone: false }, profile: { childName: "", childBirthDate: "", developmentProfile: {} }, developmentFeedbackHistory: [], crossAgeApprovals: {}, toys: [], drafts: [], wishlist: [], rotationHistory: [], lastRotationAt: null, catalogState: { tombstones: {}, adminEdits: {}, imageRefsByKey: {}, imageRefsByIdentity: {}, learnedEntries: [], syncMetadata: {} } };
}
function numeric(value) {
  return value === "" || value == null || Number.isNaN(Number(value)) ? null : Number(value);
}
function normalizeInterest(value) {
  return value === "love" || value === "like" ? "like" : value === "okay" || value === "neutral" ? "neutral" : value === "bored" || value === "dislike" ? "dislike" : null;
}
function uniqueImageRefs(values) {
  const seen = /* @__PURE__ */ new Set();
  return values.filter((value) => value?.kind).filter((value) => {
    const key = JSON.stringify(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function uniqueObjects(values) {
  const seen = /* @__PURE__ */ new Set();
  return (Array.isArray(values) ? values : []).filter((value) => {
    const key = JSON.stringify(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function plainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

// src/domain/catalog-safety.js
var AGE_SAFETY_STATUSES = Object.freeze([
  "VERIFIED_NO_EXTRA_GATE",
  "NO_DOCUMENTED_HARD_GATE",
  "SMALL_PARTS_GATE",
  "GROSS_MOTOR_GATE",
  "OTHER_HARD_GATE",
  "UNKNOWN"
]);
function catalogSafetyStatus(row) {
  const safety = row?.userMetadata?.safety;
  const status = safety?.ageSafetyStatus;
  if (!AGE_SAFETY_STATUSES.includes(status) || status === "UNKNOWN" || !/^https:\/\//i.test(String(safety.safetySource || "")) || !/^\d{4}-\d{2}-\d{2}$/.test(String(safety.safetyVerifiedAt || "")) || !String(safety.evidenceNote || "").trim()) return "UNKNOWN";
  if (status === "SMALL_PARTS_GATE" && safety.smallParts !== true) return "UNKNOWN";
  if (status === "GROSS_MOTOR_GATE" && safety.requiresStandingStability !== true) return "UNKNOWN";
  if (status === "OTHER_HARD_GATE" && !(Number(safety.hardMinAgeMonths) > 0)) return "UNKNOWN";
  if (status === "VERIFIED_NO_EXTRA_GATE" && (safety.smallParts === true || safety.chokingSmallParts === true || safety.requiresStandingStability === true || Number(safety.hardMinAgeMonths) > 0 || Number(safety.safetyMinAgeMonths) > 0)) return "UNKNOWN";
  if (status === "NO_DOCUMENTED_HARD_GATE" && (safety.smallParts === true || safety.chokingSmallParts === true || safety.requiresStandingStability === true || Number(safety.hardMinAgeMonths) > 0 || Number(safety.safetyMinAgeMonths) > 0 || safety.warningType)) return "UNKNOWN";
  return status;
}
function crossAgeApprovalFor(state, toy) {
  const key = String(toy?.canonicalKey || "");
  const record = state?.crossAgeApprovals?.[key];
  return validCrossAgeApproval(toy, record) ? record : null;
}
function validCrossAgeApproval(toy, record) {
  const key = String(toy?.canonicalKey || "");
  return record?.approved === true && record.canonicalKey === key && record.sourceRecommendedMinAgeMonths === toy.minAgeMonths && /^\d{4}-\d{2}-\d{2}T/.test(String(record.approvedAt || ""));
}
function setCrossAgeApproval(state, toy, approved, { now: now3 = (/* @__PURE__ */ new Date()).toISOString(), note = "" } = {}) {
  const key = String(toy?.canonicalKey || "");
  if (!key || !Number.isFinite(toy?.minAgeMonths)) return false;
  state.crossAgeApprovals ||= {};
  if (!approved) {
    delete state.crossAgeApprovals[key];
    return true;
  }
  state.crossAgeApprovals[key] = {
    approved: true,
    approvedAt: now3,
    canonicalKey: key,
    sourceRecommendedMinAgeMonths: toy.minAgeMonths,
    ...note ? { note: String(note).slice(0, 240) } : {}
  };
  return true;
}
function declineCrossAgeApproval(state, toy, { now: now3 = (/* @__PURE__ */ new Date()).toISOString() } = {}) {
  const key = String(toy?.canonicalKey || "");
  if (!key || !Number.isFinite(toy?.minAgeMonths)) return false;
  state.crossAgeApprovals ||= {};
  state.crossAgeApprovals[key] = {
    approved: false,
    decidedAt: now3,
    canonicalKey: key,
    sourceRecommendedMinAgeMonths: toy.minAgeMonths
  };
  return true;
}
function crossAgeChoiceFor(state, toy) {
  const key = String(toy?.canonicalKey || "");
  const record = state?.crossAgeApprovals?.[key];
  if (validCrossAgeApproval(toy, record)) return "allowed";
  if (record?.approved === false && record.canonicalKey === key && record.sourceRecommendedMinAgeMonths === toy?.minAgeMonths) return "declined";
  return "pending";
}
function redirectCrossAgeApproval(state, from, to) {
  const approvals = state?.crossAgeApprovals;
  if (!approvals || !from || !to || from === to || !approvals[from]) return false;
  const source = approvals[from];
  const target = approvals[to];
  approvals[to] = target?.approved ? target : { ...source, canonicalKey: to };
  delete approvals[from];
  return true;
}
function reconcileCrossAgeApprovals(state, resolve) {
  let changed = 0;
  for (const key of Object.keys(state?.crossAgeApprovals || {})) {
    const current = resolve(key)?.canonicalKey;
    if (current && redirectCrossAgeApproval(state, key, current)) changed++;
  }
  return changed;
}
function withCatalogSafety(toy, catalogRow) {
  const userMetadata = { ...toy.userMetadata };
  if (catalogSafetyStatus(catalogRow) === "UNKNOWN") delete userMetadata.safety;
  else userMetadata.safety = catalogRow.userMetadata.safety;
  return { ...toy, userMetadata };
}

// src/domain/identity-service.js
function identityTokens(toy = {}) {
  const keys = unique([toy.canonicalKey, toy.catalogKey, toy.catalogId, toy.key].map(canonicalKey));
  const brand = normalizeBrand2(toy.brand);
  const names = unique([
    toy.productName,
    toy.name,
    toy.nameEn,
    toy.nameZh,
    toy.names?.en,
    toy.names?.zh,
    ...toy.aliases || []
  ].flatMap(identityNameForms).map(normalizeName).filter((name) => isUsableProductIdentity(name, brand)));
  return { keys, names, brand, brandedNames: names.map((name) => `${brand}|${name}`) };
}
function identityNameForms(value) {
  const text2 = String(value || "").normalize("NFKC").trim();
  if (!text2) return [];
  const latin = text2.match(/[A-Za-z0-9]+(?:[\s'’&+\-]+[A-Za-z0-9]+)*/g) || [];
  const chinese = /[\u4e00-\u9fff]/.test(text2) ? (text2.match(/[\u4e00-\u9fff0-9]+/g) || []).filter((part) => /[\u4e00-\u9fff]/.test(part)) : [];
  return [text2, latin.join(" ").trim(), chinese.join("").trim()].filter(Boolean);
}
function sameCatalogIdentity(a, b) {
  return Boolean(catalogOwnershipMatch(a, b));
}
function catalogOwnershipMatch(source = {}, toy = {}) {
  if (differentSetEntities(source, toy)) return null;
  if (shared(canonicalOwnershipKeys(source), canonicalOwnershipKeys(toy))) return { kind: "canonicalKey" };
  if (shared(stableCatalogIds(source, true), stableCatalogIds(toy))) return { kind: "catalogId" };
  if (distinctSku(source, toy)) return null;
  const left = identityTokens(source);
  const right = identityTokens(toy);
  if (!left.brand || left.brand !== right.brand) return null;
  const identity = left.names.find((name) => right.names.includes(name));
  return identity ? { kind: "fallbackIdentity", identity } : null;
}
function distinctSku(a = {}, b = {}) {
  const left = normalizedSku(a);
  const right = normalizedSku(b);
  return Boolean(left && right && left !== right);
}
function differentSetEntities(a = {}, b = {}) {
  const roleA = a.set?.kind || "none";
  const roleB = b.set?.kind || "none";
  if (roleA === "parent" && roleB === "child" || roleA === "child" && roleB === "parent") return true;
  return isDirectSetRelation(a, b) || isDirectSetRelation(b, a);
}
function classifySetRelationship(a = {}, b = {}) {
  if (isDirectSetRelation(a, b) || isDirectSetRelation(b, a)) return "parent_child_relation";
  if (a.set?.kind === "child" && b.set?.kind === "child" && sharesParentIdentity(a, b)) return "sibling_child";
  return "unrelated";
}
function parentIdentityTokens(toy = {}) {
  const set = toy.set || {};
  return unique([
    set.parentCanonicalKey,
    ...set.legacyParentIds || [],
    toy.parentCanonicalKey,
    toy.parentKitKey,
    toy.parentSetId,
    toy.parentId
  ].map(canonicalKey));
}
function isDirectSetRelation(child, parent) {
  if (child.set?.kind !== "child" || parent.set?.kind !== "parent") return false;
  if (child.set.parentId && child.set.parentId === parent.id) return true;
  if ((child.set.legacyParentIds || []).includes(parent.id)) return true;
  const parentKeys = unique([parent.canonicalKey, ...parent.legacyCanonicalKeys || []].map(canonicalKey));
  const childKey = canonicalKey(child.canonicalKey);
  return parentKeys.some((parentKey) => parentIdentityTokens(child).includes(parentKey) || parentKey && childKey && childKey.startsWith(`${parentKey}-`));
}
function sharesParentIdentity(a, b) {
  const left = parentIdentityTokens(a);
  const right = parentIdentityTokens(b);
  if (left.some((token) => right.includes(token))) return true;
  if (a.set?.parentId && b.set?.parentId && a.set.parentId === b.set.parentId) return true;
  const sameBrand2 = normalizeBrand2(a.brand) && normalizeBrand2(a.brand) === normalizeBrand2(b.brand);
  return sameBrand2 && normalizeName(a.set?.setName) && normalizeName(a.set?.setName) === normalizeName(b.set?.setName);
}
function findOwnedToy(source, toys = []) {
  return findOwnedToyMatch(source, toys)?.toy || null;
}
function findOwnedToyMatch(source, toys = []) {
  for (const toy of toys) {
    const match = catalogOwnershipMatch(source, toy);
    if (match) return { toy, ...match };
  }
  return null;
}
function findWishlistItem(source, wishlist = []) {
  return wishlist.find((item) => sameCatalogIdentity(source, item.catalogSnapshot || item)) || null;
}
function resolveCatalogReference(reference, catalog2 = []) {
  const direct = catalog2.find((toy) => identityTokens(reference).keys.some((key) => identityTokens(toy).keys.includes(key)));
  return direct || catalog2.find((toy) => sameCatalogIdentity(reference, toy)) || null;
}
function reconcilePersonalDuplicates(state) {
  const toys = state.toys || [];
  const removedToPrimary = /* @__PURE__ */ new Map();
  const kept = [];
  for (const toy of toys) {
    const primary = kept.find((candidate) => sameCatalogIdentity(candidate, toy));
    if (!primary) {
      kept.push(toy);
      continue;
    }
    mergeToy(primary, toy);
    removedToPrimary.set(toy.id, primary.id);
  }
  if (!removedToPrimary.size) return { merged: 0, idMap: removedToPrimary };
  state.toys = kept;
  remapReferences(state, removedToPrimary);
  return { merged: removedToPrimary.size, idMap: removedToPrimary };
}
function mergePersonalToyPair(state, primaryId, duplicateId) {
  const primary = (state.toys || []).find((toy) => toy.id === primaryId);
  const duplicate = (state.toys || []).find((toy) => toy.id === duplicateId);
  if (!primary || !duplicate || primary === duplicate || !sameCatalogIdentity(primary, duplicate)) return { merged: false };
  mergeToy(primary, duplicate);
  state.toys = state.toys.filter((toy) => toy.id !== duplicate.id);
  remapReferences(state, /* @__PURE__ */ new Map([[duplicate.id, primary.id]]));
  return { merged: true, toy: primary };
}
function remapReferences(state, idMap) {
  for (const round of state.rotationHistory || []) {
    round.toyIds = unique((round.toyIds || []).map((id) => idMap.get(id) || id));
    if (round.toyId) round.toyId = idMap.get(round.toyId) || round.toyId;
  }
  for (const toy of state.toys || []) {
    if (toy.set?.parentId) toy.set.parentId = idMap.get(toy.set.parentId) || toy.set.parentId;
    if (toy.set?.childIds) toy.set.childIds = unique(toy.set.childIds.map((id) => idMap.get(id) || id));
  }
}
function mergeToy(primary, duplicate) {
  const preferred = imageRank(duplicate.imageRef) > imageRank(primary.imageRef) ? duplicate.imageRef : primary.imageRef;
  const alternatives = uniqueRefs([...primary.alternateImageRefs || [], ...duplicate.alternateImageRefs || [], primary.imageRef, duplicate.imageRef].filter((ref) => ref && ref !== preferred));
  Object.assign(primary, {
    productName: primary.productName || duplicate.productName,
    names: { en: primary.names?.en || duplicate.names?.en || "", zh: primary.names?.zh || duplicate.names?.zh || "" },
    aliases: unique([...primary.aliases || [], ...duplicate.aliases || [], duplicate.productName]),
    skillCodes: unique([...primary.skillCodes || [], ...duplicate.skillCodes || []]),
    playMechanics: unique([...primary.playMechanics || [], ...duplicate.playMechanics || []]),
    imageRef: preferred,
    alternateImageRefs: alternatives,
    interest: primary.interest ?? duplicate.interest ?? null,
    rotationValue: primary.rotationValue !== "medium" ? primary.rotationValue : duplicate.rotationValue || "medium",
    shelfMode: primary.permanentSource === "user" || duplicate.permanentSource === "user" || primary.shelfMode === "permanent" || duplicate.shelfMode === "permanent" ? "permanent" : "rotate",
    permanentSource: primary.permanentSource === "user" || duplicate.permanentSource === "user" ? "user" : primary.permanentSource || duplicate.permanentSource || null,
    permanentSetAt: primary.permanentSource === "user" ? primary.permanentSetAt : duplicate.permanentSource === "user" ? duplicate.permanentSetAt : null,
    status: primary.status === "active" || duplicate.status === "active" ? "active" : "stored",
    hidden: Boolean(primary.hidden && duplicate.hidden),
    archived: Boolean(primary.archived && duplicate.archived),
    purchaseDate: primary.purchaseDate || duplicate.purchaseDate || "",
    purchaseMetadata: { ...duplicate.purchaseMetadata || {}, ...primary.purchaseMetadata || {} },
    storageLocation: primary.storageLocation || duplicate.storageLocation || "",
    notes: [primary.notes, duplicate.notes].filter(Boolean).join("\n"),
    feedbackHistory: uniqueObjects2([...primary.feedbackHistory || [], ...duplicate.feedbackHistory || []]),
    usageHistory: uniqueObjects2([...primary.usageHistory || [], ...duplicate.usageHistory || []]),
    userMetadata: { ...duplicate.userMetadata || {}, ...primary.userMetadata || {} },
    lastActivatedAt: latest(primary.lastActivatedAt, duplicate.lastActivatedAt),
    createdAt: earliest(primary.createdAt, duplicate.createdAt),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  primary.mergeDiagnostics = unique([...primary.mergeDiagnostics || [], ...duplicate.mergeDiagnostics || []]);
}
function uniqueRefs(refs) {
  const seen = /* @__PURE__ */ new Set();
  return refs.filter((ref) => {
    const key = JSON.stringify(ref);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function uniqueObjects2(values) {
  const seen = /* @__PURE__ */ new Set();
  return values.filter((value) => {
    const key = JSON.stringify(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function imageRank(ref) {
  return { personal: 4, catalog: 3, remote: 2, placeholder: 1 }[ref?.kind] || 0;
}
function normalizeName(value) {
  return String(value || "").normalize("NFKC").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "");
}
function normalizeBrand2(value) {
  return String(value === "other_unspecified" ? "" : value || "").normalize("NFKC").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "");
}
function normalizedSku(toy) {
  return String(toy?.setNumber || toy?.variantId || toy?.sku || toy?.productCode || toy?.modelNumber || toy?.variantCode || "").normalize("NFKC").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "");
}
function canonicalOwnershipKeys(toy = {}) {
  return unique([toy.canonicalKey, toy.catalogKey, toy.key, ...toy.legacyCanonicalKeys || []].map(canonicalKey));
}
function stableCatalogIds(toy = {}, includeRecordId = false) {
  return unique([toy.catalogId, toy.catalogSourceId, toy.sourceCatalogId, toy.sourceId, toy.catalogSnapshot?.id, includeRecordId ? toy.id : null].map(canonicalKey));
}
function shared(left, right) {
  return left.some((value) => value && right.includes(value));
}
function isUsableProductIdentity(name, brand) {
  if (!name || !/[a-z\u4e00-\u9fff]/.test(name)) return false;
  const product = brand ? name.split(brand).join("") : name;
  if (!product || product === brand) return false;
  return !GENERIC_PRODUCT_IDENTITIES.has(product);
}
var GENERIC_PRODUCT_IDENTITIES = /* @__PURE__ */ new Set([
  "toy",
  "toys",
  "learning",
  "learn",
  "activity",
  "truck",
  "drop",
  "go",
  "smart",
  "baby",
  "\u73A9\u5177",
  "\u5B66\u4E60",
  "\u6D3B\u52A8",
  "\u5361\u8F66",
  "\u7FFB\u6597\u8F66",
  "\u8F66\u8F86",
  "\u97F3\u4E50",
  "\u76CA\u667A"
]);
function latest(a, b) {
  return !a ? b : !b ? a : new Date(a) > new Date(b) ? a : b;
}
function earliest(a, b) {
  return !a ? b : !b ? a : new Date(a) < new Date(b) ? a : b;
}

// src/data/store.js
var LEGACY_KEYS = ["toyRotationV04", "toyRotationV032", "toyRotationV03", "toyRotationV02"];
var STORE_KEY = "toyRotation.cleanBaseline";
var STORE_SHADOW_KEY = "toyRotation.cleanBaseline.lastKnownGood";
var STORE_RECOVERY_STAGING_KEY = "toyRotation.cleanBaseline.recoveryStaging";
var STORE_COMMIT_STAGING_KEY = "toyRotation.cleanBaseline.commitStaging";
var STORE_SNAPSHOT_KEYS = Object.freeze([
  "toyRotation.cleanBaseline.snapshot-1",
  "toyRotation.cleanBaseline.snapshot-2",
  "toyRotation.cleanBaseline.snapshot-3"
]);
var STORE_HEALTH_KEY = "toyRotation.cleanBaseline.persistenceHealth";
function readStoredJson(key, storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem?.(key);
    if (raw == null || raw === "") return { key, status: "missing", raw: null, value: null };
    try {
      return { key, status: "valid", raw, value: JSON.parse(raw) };
    } catch (error) {
      return { key, status: "malformed", raw, value: null, error: String(error?.message || error) };
    }
  } catch (error) {
    return { key, status: "unavailable", raw: null, value: null, error: String(error?.message || error) };
  }
}
function stateCounts(state) {
  return {
    toys: Array.isArray(state?.toys) ? state.toys.length : 0,
    profile: state?.profile?.childName || state?.profile?.childBirthDate ? 1 : 0,
    wishlist: Array.isArray(state?.wishlist) ? state.wishlist.length : 0,
    rotationHistory: Array.isArray(state?.rotationHistory) ? state.rotationHistory.length : 0,
    drafts: Array.isArray(state?.drafts) ? state.drafts.length : 0
  };
}
function populated(state) {
  const counts = stateCounts(state);
  return counts.toys > 0 || counts.profile > 0 || counts.wishlist > 0 || counts.rotationHistory > 0;
}
function hydrationLostRawData(raw, hydrated) {
  const before = stateCounts(raw), after = stateCounts(hydrated);
  return before.toys > 0 && after.toys === 0 || before.profile > 0 && after.profile === 0 || before.rotationHistory > 0 && after.rotationHistory === 0;
}
function usableState(value) {
  return value && typeof value === "object" && (Array.isArray(value.toys) || value.schemaVersion != null || value.profile != null || value.settings != null);
}
function validatePersistableState(state) {
  if (!usableState(state)) throw new Error("persistence_invalid_state");
  const serialized = JSON.stringify(state);
  const parsed = JSON.parse(serialized);
  if (!usableState(parsed) || hydrationLostRawData(state, parsed)) throw new Error("persistence_validation_failed");
  return { serialized, parsed };
}
function storageBytes(value) {
  return new TextEncoder().encode(value || "").length;
}
function isQuotaWriteFailure(error) {
  const message = String(error?.message || "");
  return error?.name === "QuotaExceededError" || error?.code === 22 || /quota\s+has\s+been\s+exceeded|quotaexceeded/i.test(message);
}
function safeQuotaCompaction(storage) {
  const current = readStoredJson(STORE_KEY, storage);
  const shadow = readStoredJson(STORE_SHADOW_KEY, storage);
  const snapshot1 = readStoredJson(STORE_SNAPSHOT_KEYS[0], storage);
  const hasRollback = shadow.status === "valid" && usableState(shadow.value) || snapshot1.status === "valid" && usableState(snapshot1.value);
  if (current.status !== "valid" || !usableState(current.value) || !hasRollback) return { ok: false, removed: [], retainedRollback: hasRollback };
  const removed = [];
  for (const key of [STORE_COMMIT_STAGING_KEY, STORE_HEALTH_KEY, STORE_SNAPSHOT_KEYS[2], STORE_SNAPSHOT_KEYS[1]]) {
    if (storage.getItem(key) != null) {
      storage.removeItem(key);
      removed.push(key);
    }
  }
  return { ok: true, removed, retainedRollback: true };
}
function persistState(next, storage = globalThis.localStorage, { compact = false } = {}) {
  const { serialized, parsed } = validatePersistableState(next);
  const before = readStoredJson(STORE_KEY, storage);
  const generation = Date.now();
  const staging = { generation, committedAt: (/* @__PURE__ */ new Date()).toISOString(), state: parsed, counts: stateCounts(parsed) };
  storage.setItem(STORE_COMMIT_STAGING_KEY, JSON.stringify(staging));
  const staged = readStoredJson(STORE_COMMIT_STAGING_KEY, storage);
  if (staged.status !== "valid" || staged.value?.generation !== generation || !usableState(staged.value?.state) || hydrationLostRawData(parsed, staged.value.state)) throw new Error("persistence_staging_readback_failed");
  if (before.status === "valid" && usableState(before.value)) {
    if (!compact) {
      const snapshot2 = readStoredJson(STORE_SNAPSHOT_KEYS[1], storage);
      const snapshot1 = readStoredJson(STORE_SNAPSHOT_KEYS[0], storage);
      if (snapshot2.status === "valid" && usableState(snapshot2.value)) storage.setItem(STORE_SNAPSHOT_KEYS[2], snapshot2.raw);
      if (snapshot1.status === "valid" && usableState(snapshot1.value)) storage.setItem(STORE_SNAPSHOT_KEYS[1], snapshot1.raw);
    }
    storage.setItem(STORE_SNAPSHOT_KEYS[0], before.raw);
    if (populated(before.value)) storage.setItem(STORE_SHADOW_KEY, before.raw);
  }
  storage.setItem(STORE_KEY, serialized);
  const verified = readStoredJson(STORE_KEY, storage);
  if (verified.status !== "valid" || !usableState(verified.value) || hydrationLostRawData(parsed, verified.value)) throw new Error("persistence_current_readback_failed");
  try {
    storage.setItem(STORE_HEALTH_KEY, JSON.stringify({
      lastSuccessfulPersistAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastPersistedToyCount: stateCounts(parsed).toys,
      lastSnapshotAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastSnapshotToyCount: stateCounts(before.value).toys,
      persistenceHealth: "healthy",
      activeSnapshotGeneration: generation
    }));
  } catch {
  }
  try {
    storage.removeItem(STORE_COMMIT_STAGING_KEY);
  } catch {
  }
}
function persistStateWithQuotaRecovery(next, storage = globalThis.localStorage) {
  try {
    persistState(next, storage);
    return { quotaRecovery: null };
  } catch (error) {
    if (!isQuotaWriteFailure(error)) throw error;
    const recovery = safeQuotaCompaction(storage);
    if (!recovery.ok) throw error;
    try {
      persistState(next, storage, { compact: true });
      return { quotaRecovery: recovery };
    } catch (retryError) {
      retryError.quotaRecovery = recovery;
      throw retryError;
    }
  }
}
var AppStore = class {
  #state;
  #listeners = /* @__PURE__ */ new Set();
  #revision = 0;
  #persistence;
  #diagnostic = null;
  #save;
  constructor(state, persistence = { writable: true, status: "ready", diagnostic: null }, { safeSave = persistStateWithQuotaRecovery } = {}) {
    this.#state = state;
    this.#persistence = persistence;
    this.#save = safeSave;
  }
  get state() {
    return this.#state;
  }
  get revision() {
    return this.#revision;
  }
  get persistence() {
    return structuredClone(this.#persistence);
  }
  get canPersist() {
    return this.#persistence.writable === true;
  }
  attachDiagnostic(diagnostic) {
    this.#diagnostic = diagnostic;
  }
  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }
  update(mutator, reason2 = "update") {
    const before = this.#state;
    try {
      const next = structuredClone(before);
      mutator(next);
      next.schemaVersion = SCHEMA_VERSION;
      if (!this.canPersist) throw new Error("storage_recovery_required");
      this.#diagnostic?.storeUpdate(reason2, before, next);
      this.#save(next);
      this.#state = next;
      this.#revision++;
      for (const listener of this.#listeners) {
        listener(next, reason2);
        this.#diagnostic?.subscriberFired(reason2, next);
      }
    } catch (error) {
      this.#diagnostic?.storeUpdateFailed(reason2, before, error);
      throw error;
    }
  }
  replace(next, reason2 = "replace") {
    const prepared = runMigrations(next);
    if (!this.canPersist) throw new Error("storage_recovery_required");
    this.#save(prepared);
    this.#state = prepared;
    this.#revision++;
    for (const listener of this.#listeners) listener(this.#state, reason2);
  }
  // Restore uses this path so a failed persistence write cannot leave memory
  // and durable storage on different versions of the user's database.
  commit(next, reason2 = "commit", { onStage = () => {
  } } = {}) {
    onStage("commit_prepare_start");
    const prepared = runMigrations(next);
    onStage("commit_prepare_end", { schemaVersion: prepared.schemaVersion, toyCount: (prepared.toys || []).length });
    onStage("local_storage_persistence_start");
    if (!this.canPersist) throw new Error("storage_recovery_required");
    this.#diagnostic?.storeUpdate(reason2, this.#state, prepared);
    this.#save(prepared);
    onStage("local_storage_persistence_end");
    onStage("store_state_replace_start");
    this.#state = prepared;
    this.#revision++;
    onStage("store_state_replace_end", { revision: this.#revision });
    onStage("ui_refresh_start", { listeners: this.#listeners.size });
    for (const listener of this.#listeners) {
      listener(this.#state, reason2);
      this.#diagnostic?.subscriberFired(reason2, this.#state);
    }
    onStage("ui_refresh_end");
  }
};
function bootStore({ onStage = () => {
}, diagnosticMode = globalThis.window?.TOY_ROTATION_CONFIG?.PERSISTENCE_DIAGNOSTIC_MODE === true } = {}) {
  onStage("store_persistence_read_start");
  const current = readStoredJson(STORE_KEY);
  const legacyRecords = LEGACY_KEYS.map((key) => readStoredJson(key));
  const legacy = legacyRecords.find((record) => record.status === "valid" && usableState(record.value) && populated(record.value)) || null;
  onStage("store_persistence_read_end", { status: current.status, existing: current.status === "valid", legacyKey: legacy?.key || null });
  if (current.status === "malformed" || current.status === "unavailable" || current.status === "valid" && !usableState(current.value)) {
    const state2 = emptyState();
    const diagnostic2 = buildPersistenceSnapshot({ current, legacyRecords, mode: current.status === "valid" ? "safe_invalid_shape" : "safe_read_failure" });
    onStage("store_persistence_safe_mode", diagnostic2);
    return new AppStore(state2, { writable: false, status: "safe_read_failure", diagnostic: diagnostic2, recovery: null });
  }
  if (current.status === "missing" && legacyRecords.some((record) => record.status === "malformed" || record.status === "unavailable")) {
    const state2 = emptyState();
    const diagnostic2 = buildPersistenceSnapshot({ current, legacyRecords, mode: "safe_legacy_read_failure" });
    onStage("store_persistence_safe_mode", diagnostic2);
    return new AppStore(state2, { writable: false, status: "safe_legacy_read_failure", diagnostic: diagnostic2, recovery: null });
  }
  onStage("migrations_start");
  let state;
  let recovery = null;
  try {
    const currentLooksEmpty = current.status === "valid" && usableState(current.value) && !populated(current.value);
    if (current.status === "valid" && usableState(current.value) && !(currentLooksEmpty && legacy)) state = runMigrations(current.value);
    else if (legacy) {
      state = runMigrations(legacy.value);
      recovery = { sourceKey: legacy.key, reason: currentLooksEmpty ? "legacy_populated_current_empty" : "legacy_populated_current_missing" };
    } else if (current.status === "missing") state = emptyState();
    else throw new Error("persistence_unknown_source");
  } catch (error) {
    const diagnostic2 = buildPersistenceSnapshot({ current, legacyRecords, mode: "safe_migration_failure" });
    onStage("store_persistence_safe_mode", { ...diagnostic2, error: String(error?.message || error) });
    return new AppStore(emptyState(), { writable: false, status: "safe_migration_failure", diagnostic: { ...diagnostic2, error: String(error?.message || error) }, recovery: null });
  }
  const rawSource = recovery ? legacy?.value : current.value;
  if (rawSource && hydrationLostRawData(rawSource, state)) {
    const diagnostic2 = buildPersistenceSnapshot({ current, legacyRecords, mode: "safe_hydration_loss", hydratedState: state });
    onStage("store_persistence_safe_mode", diagnostic2);
    return new AppStore(state, { writable: false, status: "safe_hydration_loss", diagnostic: diagnostic2, recovery: null });
  }
  onStage("migrations_end", { schemaVersion: state.schemaVersion });
  if (diagnosticMode) {
    const diagnostic2 = buildPersistenceSnapshot({ current, legacyRecords, mode: recovery ? "diagnostic_staged_recovery" : "diagnostic_read_only", hydratedState: state, recovery });
    onStage("store_persistence_diagnostic_mode", diagnostic2);
    return new AppStore(state, { writable: false, status: recovery ? "diagnostic_staged_recovery" : "diagnostic_read_only", diagnostic: diagnostic2, recovery, diagnosticMode: true });
  }
  let quotaRecovery = null;
  try {
    quotaRecovery = persistStateWithQuotaRecovery(state).quotaRecovery;
  } catch (error) {
    const diagnostic2 = buildPersistenceSnapshot({ current, legacyRecords, mode: "safe_commit_failure", hydratedState: state, recovery, writeFailure: error });
    onStage("store_persistence_safe_mode", { ...diagnostic2, error: String(error?.message || error) });
    return new AppStore(state, { writable: false, status: "safe_commit_failure", diagnostic: { ...diagnostic2, error: String(error?.message || error) }, recovery: null });
  }
  const diagnostic = buildPersistenceSnapshot({ current, legacyRecords, mode: recovery ? "legacy_recovered" : "ready", hydratedState: state, quotaRecovery });
  return new AppStore(state, { writable: true, status: recovery ? "legacy_recovered" : "ready", recovery, diagnostic });
}
function startFreshStore({ storage = globalThis.localStorage } = {}) {
  const current = readStoredJson(STORE_KEY, storage);
  const snapshot = { capturedAt: (/* @__PURE__ */ new Date()).toISOString(), current: { status: current.status, raw: current.raw }, legacy: LEGACY_KEYS.map((key) => {
    const record = readStoredJson(key, storage);
    return { key, status: record.status, raw: record.raw };
  }) };
  try {
    storage.setItem(`toyRotation.cleanBaseline.preFresh.${Date.now()}`, JSON.stringify(snapshot));
  } catch {
  }
  const state = emptyState();
  persistState(state, storage);
  return state;
}
function buildPersistenceSnapshot({ current = readStoredJson(STORE_KEY), legacyRecords = LEGACY_KEYS.map((key) => readStoredJson(key)), mode = "ready", hydratedState = null, recovery = null, quotaRecovery = null, writeFailure = null } = {}) {
  const shadow = readStoredJson(STORE_SHADOW_KEY);
  const staging = readStoredJson(STORE_RECOVERY_STAGING_KEY);
  const commitStaging = readStoredJson(STORE_COMMIT_STAGING_KEY);
  const snapshots = STORE_SNAPSHOT_KEYS.map((key) => readStoredJson(key));
  const health = readStoredJson(STORE_HEALTH_KEY);
  const classification = classifyPersistence({ current, legacyRecords, hydratedState, recovery, writeFailure });
  const byteAccounting = {
    current: storageBytes(current.raw),
    shadow: storageBytes(shadow.raw),
    recoveryStaging: storageBytes(staging.raw),
    commitStaging: storageBytes(commitStaging.raw),
    snapshots: snapshots.map((record) => ({ key: record.key, bytes: storageBytes(record.raw) })),
    health: storageBytes(health.raw)
  };
  byteAccounting.total = byteAccounting.current + byteAccounting.shadow + byteAccounting.recoveryStaging + byteAccounting.commitStaging + byteAccounting.snapshots.reduce((total, item) => total + item.bytes, 0) + byteAccounting.health;
  return {
    diagnosticVersion: 1,
    capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
    currentOrigin: globalThis.location?.origin || null,
    persistence: { key: STORE_KEY, status: current.status, rawBytes: current.raw?.length || 0, counts: stateCounts(current.value), error: current.error || null },
    status: { readStatus: current.status, hydrationStatus: hydratedState ? "success" : "not_attempted", writeStatus: isQuotaWriteFailure(writeFailure) ? "quota_failed" : quotaRecovery ? "recovered" : "not_attempted", writable: !writeFailure },
    shadow: { key: STORE_SHADOW_KEY, status: shadow.status, rawBytes: shadow.raw?.length || 0, counts: stateCounts(shadow.value), error: shadow.error || null },
    recoveryStaging: { key: STORE_RECOVERY_STAGING_KEY, status: staging.status, sourceKey: staging.value?.sourceKey || null, stagedAt: staging.value?.stagedAt || null, counts: stateCounts(staging.value?.state), error: staging.error || null },
    commitStaging: { key: STORE_COMMIT_STAGING_KEY, status: commitStaging.status, rawBytes: commitStaging.raw?.length || 0, error: commitStaging.error || null },
    snapshots: snapshots.map((record) => ({ key: record.key, status: record.status, rawBytes: record.raw?.length || 0, counts: stateCounts(record.value), error: record.error || null })),
    health: { key: STORE_HEALTH_KEY, status: health.status, rawBytes: health.raw?.length || 0, error: health.error || null },
    byteAccounting,
    legacy: legacyRecords.map((record) => ({ key: record.key, status: record.status, rawBytes: record.raw?.length || 0, counts: stateCounts(record.value), error: record.error || null })),
    hydrated: hydratedState ? { counts: stateCounts(hydratedState), schemaVersion: hydratedState.schemaVersion || null } : null,
    recovery,
    quotaRecovery,
    recoveryExecuted: staging.status === "valid" && !!staging.value?.sourceKey && current.status === "valid" && populated(current.value),
    classification,
    mode
  };
}
function classifyPersistence({ current, legacyRecords, hydratedState, recovery, writeFailure }) {
  if (isQuotaWriteFailure(writeFailure)) return { code: "Q", label: "quota_write_failure", actionable: true, sourceKey: STORE_KEY };
  const legacy = legacyRecords.find((record) => record.status === "valid" && usableState(record.value) && populated(record.value));
  if (recovery || (current.status === "missing" || current.status === "valid" && !populated(current.value)) && legacy) {
    return { code: "B", label: "legacy_data_detected_current_empty", actionable: true, sourceKey: legacy?.key || recovery?.sourceKey || null };
  }
  if (current.status === "valid" && usableState(current.value) && populated(current.value)) {
    if (hydratedState && hydrationLostRawData(current.value, hydratedState)) return { code: "A", label: "raw_data_present_hydration_loss", actionable: false, sourceKey: STORE_KEY };
    return { code: "A", label: "raw_data_present", actionable: false, sourceKey: STORE_KEY };
  }
  return { code: "C", label: "no_readable_populated_local_state", actionable: false, sourceKey: null };
}
function applyDetectedLegacyRecovery({ storage = globalThis.localStorage } = {}) {
  const current = readStoredJson(STORE_KEY, storage);
  const legacyRecords = LEGACY_KEYS.map((key) => readStoredJson(key, storage));
  const legacy = legacyRecords.find((record) => record.status === "valid" && usableState(record.value) && populated(record.value));
  if (current.status === "valid" && usableState(current.value) && populated(current.value)) return { ok: true, status: "already_recovered", recovery: null };
  if (!legacy) return { ok: false, status: "no_safe_legacy_source" };
  const staged = runMigrations(legacy.value);
  if (hydrationLostRawData(legacy.value, staged) || !populated(staged)) return { ok: false, status: "staging_validation_failed" };
  const staging = { sourceKey: legacy.key, stagedAt: (/* @__PURE__ */ new Date()).toISOString(), state: staged, counts: stateCounts(staged) };
  storage.setItem(STORE_RECOVERY_STAGING_KEY, JSON.stringify(staging));
  const verified = readStoredJson(STORE_RECOVERY_STAGING_KEY, storage);
  if (verified.status !== "valid" || !usableState(verified.value?.state) || hydrationLostRawData(legacy.value, verified.value.state)) return { ok: false, status: "staging_readback_failed" };
  persistState(verified.value.state, storage);
  const materialized = readStoredJson(STORE_KEY, storage);
  if (materialized.status !== "valid" || hydrationLostRawData(verified.value.state, materialized.value)) return { ok: false, status: "materialization_validation_failed" };
  return { ok: true, status: "recovered", recovery: { sourceKey: legacy.key, reason: "legacy_populated_current_empty" }, counts: stateCounts(materialized.value) };
}
function runMigrations(input) {
  let state = structuredClone(input || emptyState());
  if ((state.schemaVersion || 0) < 1) state = migrateV1(state);
  if ((state.schemaVersion || 0) < 2) state = migrateV2(state);
  if ((state.schemaVersion || 0) < 3) state = migrateV3(state);
  if ((state.schemaVersion || 0) < 4) state = migrateV4(state);
  if ((state.schemaVersion || 0) < 5) state = migrateV5(state);
  if ((state.schemaVersion || 0) < 6) state = migrateV6(state);
  if ((state.schemaVersion || 0) < 7) state = migrateV7(state);
  if ((state.schemaVersion || 0) < 8) state = migrateV8(state);
  if ((state.schemaVersion || 0) < 9) state = migrateV9(state);
  if ((state.schemaVersion || 0) < 10) state = migrateV10(state);
  if ((state.schemaVersion || 0) < 11) state = migrateV11(state);
  if ((state.schemaVersion || 0) < 12) state = migrateV12(state);
  return state;
}
function migrateV1(legacy) {
  const base = emptyState();
  const settings = legacy.settings || {};
  return {
    ...base,
    schemaVersion: 1,
    settings: { ...base.settings, language: settings.language || "system", theme: settings.theme || "system", rotationSize: Number(settings.rotationSize || 6), rotationDays: Number(settings.rotationDays || 7), onboardingDone: !!settings.onboardingDone },
    profile: { childName: settings.childName || "", childBirthDate: settings.childBirthDate || "" },
    toys: (legacy.toys || []).map(normalizeToy),
    drafts: legacy.drafts || [],
    wishlist: (legacy.wishlist || []).map(normalizeWishlistItem),
    rotationHistory: legacy.rotationHistory || legacy.history || [],
    lastRotationAt: legacy.lastRotationAt || null,
    catalogState: { tombstones: migrateTombstones(), adminEdits: parse(localStorage.getItem("toyRotationCatalogOverridesV095")) || {}, ...migrateCatalogImageRefs(), syncMetadata: {} }
  };
}
function migrateV3(state) {
  const base = emptyState();
  const settings = state.settings || {};
  const rotationDays = Math.max(1, Math.min(90, Number(settings.rotationDays) || base.settings.rotationDays));
  const rotationSize = Math.max(1, Math.min(50, Number(settings.rotationSize) || base.settings.rotationSize));
  return { ...state, schemaVersion: 3, settings: { ...base.settings, ...settings, rotationDays, rotationSize }, profile: { ...base.profile, ...state.profile || {} }, lastRotationAt: state.lastRotationAt || state.rotationHistory?.[0]?.at || null, catalogState: { ...base.catalogState, ...state.catalogState || {}, imageRefsByKey: state.catalogState?.imageRefsByKey || migrateCatalogImageRefs().imageRefsByKey } };
}
function migrateV2(state) {
  const base = emptyState();
  const existingCatalog = state.catalogState || {};
  const tombstones = Object.fromEntries(Object.entries(existingCatalog.tombstones || {}).map(([key, value]) => [String(key), typeof value === "object" ? value : { deletedAt: (/* @__PURE__ */ new Date()).toISOString(), migrated: true }]));
  return {
    ...base,
    ...state,
    schemaVersion: 2,
    settings: { ...base.settings, ...state.settings || {} },
    profile: { ...base.profile, childName: state.profile?.childName ?? state.settings?.childName ?? "", childBirthDate: state.profile?.childBirthDate ?? state.settings?.childBirthDate ?? "", ...state.profile || {} },
    toys: (state.toys || []).map(normalizeToy),
    wishlist: (state.wishlist || []).map(normalizeWishlistItem),
    drafts: state.drafts || [],
    rotationHistory: state.rotationHistory || [],
    catalogState: { tombstones, adminEdits: existingCatalog.adminEdits || {}, imageRefsByKey: existingCatalog.imageRefsByKey || migrateCatalogImageRefs().imageRefsByKey, imageRefsByIdentity: existingCatalog.imageRefsByIdentity || migrateCatalogImageRefs().imageRefsByIdentity, syncMetadata: existingCatalog.syncMetadata || {} }
  };
}
function migrateV4(state) {
  const base = emptyState();
  const migratedImages = migrateCatalogImageRefs();
  const existing = state.catalogState || {};
  return { ...state, schemaVersion: 4, catalogState: { ...base.catalogState, ...existing, imageRefsByKey: { ...migratedImages.imageRefsByKey, ...existing.imageRefsByKey || {} }, imageRefsByIdentity: { ...migratedImages.imageRefsByIdentity, ...existing.imageRefsByIdentity || {} } } };
}
function migrateV5(state) {
  const legacy = typeof localStorage === "undefined" ? null : LEGACY_KEYS.map((key) => parse(localStorage.getItem(key))).find(Boolean);
  const legacyToys = (legacy?.toys || []).map(normalizeToy);
  state.toys = (state.toys || []).map((current) => {
    const normalized2 = normalizeToy(current);
    const old = legacyToys.find((item) => item.id === normalized2.id) || legacyToys.find((item) => sameCatalogIdentity(item, normalized2));
    if (!old) return normalized2;
    const lostImage = !normalized2.imageRef || normalized2.imageRef.kind === "placeholder";
    return normalizeToy({ ...old, ...normalized2, imageRef: lostImage ? old.imageRef : normalized2.imageRef, aliases: [...old.aliases || [], ...normalized2.aliases || []], notes: normalized2.notes || old.notes });
  });
  const legacyWishlist = legacy?.wishlist || [];
  state.wishlist = (state.wishlist || []).map((item) => {
    const old = legacyWishlist.find((value) => value.id === item.id) || legacyWishlist.find((value) => canonicalKey(value.canonicalKey || value.catalogKey) === canonicalKey(item.canonicalKey));
    return normalizeWishlistItem({ ...old || {}, ...item, catalogSnapshot: item.catalogSnapshot || old });
  });
  const reconciliation = reconcilePersonalDuplicates(state);
  state.catalogState ||= emptyState().catalogState;
  state.catalogState.tombstones = { ...migrateTombstones(), ...state.catalogState.tombstones || {} };
  sanitizeCatalogImageRefs(state.catalogState);
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.featureParityV5 = { migratedAt: (/* @__PURE__ */ new Date()).toISOString(), restoredLegacyImages: state.toys.filter((toy) => toy.imageRef?.kind === "personal").length, reconciledDuplicates: reconciliation.merged };
  state.schemaVersion = 5;
  return state;
}
function migrateV6(state) {
  state.catalogState ||= emptyState().catalogState;
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.featureParityV6 = { migratedAt: (/* @__PURE__ */ new Date()).toISOString(), personalImageRecoveryPending: true };
  state.schemaVersion = 6;
  return state;
}
function migrateV7(state) {
  state.catalogState ||= emptyState().catalogState;
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.imageAuditV7 = { startedAt: (/* @__PURE__ */ new Date()).toISOString(), pending: true, missingToyIds: [] };
  state.schemaVersion = 7;
  return state;
}
function migrateV8(state) {
  state.toys = (state.toys || []).map(normalizeToy);
  state.catalogState ||= emptyState().catalogState;
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.parentChildReconciliationV8 = { startedAt: (/* @__PURE__ */ new Date()).toISOString(), pending: true, added: 0, merged: 0, remapped: 0 };
  state.schemaVersion = 8;
  return state;
}
function migrateV9(state) {
  state.toys = (state.toys || []).map(normalizeToy);
  state.catalogState ||= emptyState().catalogState;
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.parentChildReconciliationV9 = { startedAt: (/* @__PURE__ */ new Date()).toISOString(), pending: true, added: 0, merged: 0, remapped: 0 };
  state.schemaVersion = 9;
  return state;
}
function migrateV10(state) {
  state.toys = (state.toys || []).map(normalizeToy);
  state.catalogState ||= emptyState().catalogState;
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.parentChildReconciliationV10 = {
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    pending: true,
    parents: 0,
    children: 0,
    legacyDuplicateChildren: 0,
    merged: 0,
    remapped: 0,
    siblingExcluded: 0,
    variantExcluded: 0,
    unresolved: 0
  };
  state.schemaVersion = 10;
  return state;
}
function migrateV11(state) {
  state.toys = (state.toys || []).map(normalizeToy);
  state.catalogState ||= emptyState().catalogState;
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.residualIdentityReconciliationV11 = { startedAt: (/* @__PURE__ */ new Date()).toISOString(), pending: true, reason: "legacy parent references normalized as child relationships" };
  state.catalogState.syncMetadata.catalogImageAuditV11 = { startedAt: (/* @__PURE__ */ new Date()).toISOString(), pending: true };
  state.schemaVersion = 11;
  return state;
}
function migrateV12(state) {
  state.toys = (state.toys || []).map(normalizeToy);
  state.catalogState ||= emptyState().catalogState;
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.parentChildReconciliationV12 = {
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    pending: true,
    executionRequired: true,
    parents: 0,
    children: 0,
    legacyDuplicateChildren: 0,
    merged: 0,
    remapped: 0,
    siblingExcluded: 0,
    variantExcluded: 0,
    unresolved: 0,
    erroneouslyRemovedChildren: 0
  };
  state.catalogState.syncMetadata.catalogImageAuditV12 = { startedAt: (/* @__PURE__ */ new Date()).toISOString(), pending: true };
  state.schemaVersion = 12;
  return state;
}
async function recoverLegacyPersonalImages({ store: store2, images: images2, catalog: catalog2 }) {
  const marker = store2.state.catalogState?.syncMetadata?.featureParityV6;
  if (marker?.personalImageRecoveryCompletedAt) return marker;
  const legacyStates = typeof localStorage === "undefined" ? [] : LEGACY_KEYS.map((key) => parse(localStorage.getItem(key))).filter(Boolean);
  const legacyToys = legacyStates.flatMap((state) => state.toys || []);
  const updates = /* @__PURE__ */ new Map();
  let restored = 0;
  let catalogFallbacks = 0;
  let unresolved = 0;
  for (const current of store2.state.toys || []) {
    const currentRaw = await safelyResolve(images2, current.imageRef);
    if (currentRaw && current.imageRef?.kind === "personal") continue;
    const candidates = legacyToys.filter((old) => old.id === current.id || sameCatalogIdentity(old, current));
    const legacyIds = uniqueImageIds(candidates.flatMap((old) => [old.photoId, old.personalPhotoId, old.imageRef?.kind === "personal" ? old.imageRef.id : null]));
    let recovered = null;
    for (const id of legacyIds) {
      const raw = await safelyResolve(images2, { kind: "personal", id });
      if (raw) {
        recovered = await images2.savePersonal(raw);
        break;
      }
    }
    if (recovered) {
      updates.set(current.id, recovered);
      restored++;
      continue;
    }
    const catalogToy = catalog2?.resolve?.(current) || catalog2?.getByKey?.(current.canonicalKey);
    if (!currentRaw && catalogToy?.imageRef) {
      const fallback = await images2.copyToPersonal(catalogToy.imageRef).catch(() => null);
      if (fallback) {
        updates.set(current.id, fallback);
        catalogFallbacks++;
        continue;
      }
    }
    if (!currentRaw) unresolved++;
  }
  const completedAt = (/* @__PURE__ */ new Date()).toISOString();
  store2.update((state) => {
    for (const toy of state.toys || []) if (updates.has(toy.id)) toy.imageRef = updates.get(toy.id);
    state.catalogState.syncMetadata.featureParityV6 = { migratedAt: marker?.migratedAt || completedAt, personalImageRecoveryCompletedAt: completedAt, restored, catalogFallbacks, unresolved };
  }, "legacy-personal-image-recovery");
  return store2.state.catalogState.syncMetadata.featureParityV6;
}
function uniqueImageIds(values) {
  return [...new Set(values.map((value) => String(value || "")).filter((value) => value && !value.startsWith("catalog:") && !value.startsWith("catalog-photo:")))];
}
async function safelyResolve(images2, ref) {
  try {
    return await images2.resolve(ref);
  } catch {
    return null;
  }
}
var GENERATED_PERSONAL_PLACEHOLDER_SIGNATURE = {
  version: "generatedCatalogFallback-v1",
  width: 520,
  height: 520,
  prefix: '<svg xmlns="http://www.w3.org/2000/svg" width="520" height="520" viewBox="0 0 520 520"><rect width="520" height="520" rx="48" fill="#f5efff"/><rect x="36" y="36" width="448" height="448" rx="36" fill="#fff" stroke="#d6c6f5" stroke-width="8"/><circle cx="260" cy="180" r="72" fill="#8e63dc"/><path d="M222 180h76M260 142v76" stroke="#fff" stroke-width="18" stroke-linecap="round"/><text x="260" y="320" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="28" fill="#3a3151">',
  between: '</text><text x="260" y="365" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" fill="#6b6280">',
  suffix: "</text></svg>"
};
function decodeSvgDataUrl(raw) {
  if (typeof raw !== "string" || !raw.startsWith("data:image/svg+xml")) return null;
  const comma = raw.indexOf(",");
  if (comma < 0) return null;
  const payload = raw.slice(comma + 1);
  try {
    return /;base64/i.test(raw.slice(0, comma)) ? atob(payload) : decodeURIComponent(payload);
  } catch {
    return null;
  }
}
function isGeneratedCatalogPlaceholderPersonal(raw) {
  const svg = decodeSvgDataUrl(raw);
  if (!svg) return false;
  const { prefix, between, suffix } = GENERATED_PERSONAL_PLACEHOLDER_SIGNATURE;
  if (!svg.startsWith(prefix) || !svg.endsWith(suffix)) return false;
  const text2 = svg.slice(prefix.length, -suffix.length);
  const split = text2.indexOf(between);
  if (split < 1 || text2.indexOf(between, split + 1) !== -1) return false;
  const brand = text2.slice(0, split);
  const label = text2.slice(split + between.length);
  return brand.length <= 34 * 6 && label.length <= 52 * 6 && !/[<>]/.test(brand + label);
}
function classifyPersonalImageAsset(raw) {
  const svg = decodeSvgDataUrl(raw);
  const mimeType = typeof raw === "string" ? raw.match(/^data:([^;,]+)/i)?.[1] || null : null;
  const result2 = {
    mimeType,
    dataUrlPrefix: typeof raw === "string" ? raw.slice(0, 64) : null,
    dimensions: svg ? { width: 520, height: 520 } : null,
    provenance: "stored_personal_asset",
    placeholderSignature: null
  };
  if (isGeneratedCatalogPlaceholderPersonal(raw)) return { ...result2, classification: "generated_placeholder_mislabeled_personal", placeholderSignature: GENERATED_PERSONAL_PLACEHOLDER_SIGNATURE.version };
  if (typeof raw === "string" && /^data:image\//i.test(raw)) return { ...result2, classification: "real_user_personal_image" };
  return { ...result2, classification: "unknown_personal_provenance" };
}
function catalogImageAvailability(toy, catalog2) {
  const catalogToy = catalog2?.resolve?.(toy) || catalog2?.getByKey?.(toy?.canonicalKey) || null;
  const ref = catalogToy?.imageRef;
  const sameChild = !catalogToy ? false : toy?.set?.kind === "child" ? sameCatalogChildForDynamicImage(toy, catalogToy) : sameCatalogIdentity(toy, catalogToy);
  const stable = Boolean(ref && !["placeholder", "generated"].includes(ref.kind) && !ref.generated && ref.assetState !== "placeholder" && ref.source !== "search-fallback" && ref.source !== "missing-catalog-metadata" && (ref.kind === "catalog" || ["verified", "verified_real", "manually_confirmed", "stable"].includes(ref.verificationStatus) || ref.stable === true));
  return { catalogToy, ref, sameChild, available: Boolean(sameChild && stable) };
}
async function repairFakePersonalPlaceholderBindings(state, { images: images2, catalog: catalog2, mutate = true } = {}) {
  const rows = [];
  let genuine = 0;
  let fake = 0;
  let unknown = 0;
  let changed = 0;
  let preserved = 0;
  for (let index = 0; index < (state?.toys || []).length; index++) {
    const toy = state.toys[index];
    const ref = toy.imageRef;
    if (ref?.kind !== "personal") continue;
    const raw = await safelyResolve(images2, ref);
    const classified = classifyPersonalImageAsset(raw);
    const catalogInfo = catalogImageAvailability(toy, catalog2);
    const row = {
      toyId: toy.id,
      canonicalKey: toy.canonicalKey,
      imageRefId: ref.id,
      setKind: toy.set?.kind || null,
      parentCanonicalKey: toy.set?.parentCanonicalKey || null,
      ...classified,
      catalogVerifiedOrStableSameIdentity: catalogInfo.available,
      catalogCanonicalKey: catalogInfo.catalogToy?.canonicalKey || null,
      catalogImageRef: catalogInfo.ref || null
    };
    rows.push(row);
    if (classified.classification === "generated_placeholder_mislabeled_personal") {
      fake++;
      if (mutate) {
        toy.imageRef = { kind: "placeholder" };
        changed++;
      }
    } else if (classified.classification === "real_user_personal_image") {
      genuine++;
      preserved++;
    } else unknown++;
    if (index % 8 === 7) await yieldMainThread();
  }
  const summary2 = {
    auditedAt: (/* @__PURE__ */ new Date()).toISOString(),
    signature: GENERATED_PERSONAL_PLACEHOLDER_SIGNATURE.version,
    personalImageTotal: rows.length,
    realUserPersonalImage: genuine,
    generatedPlaceholderMislabeledPersonal: fake,
    unknownPersonalProvenance: unknown,
    realUserImagesPreserved: preserved,
    changed,
    rows
  };
  state.catalogState ||= {};
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.fakePersonalPlaceholderRepairV121 = summary2;
  return summary2;
}
async function auditToyLibraryImages({ store: store2, images: images2, catalog: catalog2 }) {
  const legacyStates = typeof localStorage === "undefined" ? [] : LEGACY_KEYS.map((key) => parse(localStorage.getItem(key))).filter(Boolean);
  const legacyToys = legacyStates.flatMap((state) => state.toys || []);
  const records = await images2.listPersonalRecords?.().catch(() => []) || [];
  const updates = /* @__PURE__ */ new Map();
  const missingToyIds = [];
  const recoveredRecordIds = /* @__PURE__ */ new Set();
  const knownRecordIds = /* @__PURE__ */ new Set();
  let verified = 0;
  let restored = 0;
  let catalogFallbacks = 0;
  const currentToys = store2.state.toys || [];
  for (let index = 0; index < currentToys.length; index++) {
    const current = currentToys[index];
    const candidates = legacyToys.filter((old) => legacyToyMatches(old, current));
    const ids = uniqueImageIds(candidates.flatMap((old) => legacyImageIds(old)).concat(legacyImageIds(current)));
    const matchingRecords = records.filter((record) => recordMatchesImage(record, ids, [current.id, ...candidates.map((item) => item.id)]));
    for (const record of matchingRecords) knownRecordIds.add(record.id);
    const currentRaw = await safelyResolve(images2, current.imageRef);
    if (currentRaw) {
      verified++;
      if (current.imageRef?.kind === "personal") knownRecordIds.add(String(current.imageRef.id));
      continue;
    }
    const raw = matchingRecords[0]?.raw || await images2.findLegacyPersonal(ids, current.id).catch(() => null);
    if (raw) {
      updates.set(current.id, await images2.savePersonal(raw));
      restored++;
      if (matchingRecords[0]) recoveredRecordIds.add(matchingRecords[0].id);
      continue;
    }
    const catalogToy = catalog2?.resolve?.(current);
    if (current.set?.kind === "child") {
      if (sameCatalogChildForDynamicImage(current, catalogToy)) catalogFallbacks++;
      else missingToyIds.push(current.id);
      continue;
    }
    if (catalogToy && sameCatalogIdentity(current, catalogToy)) {
      const fallback = await images2.copyToPersonal(catalogToy.imageRef).catch(() => null);
      if (fallback) {
        updates.set(current.id, fallback);
        catalogFallbacks++;
        continue;
      }
    }
    missingToyIds.push(current.id);
    if (index % 8 === 7) await yieldMainThread();
  }
  const orphanRecordIds = records.filter((record) => !knownRecordIds.has(record.id) && !recoveredRecordIds.has(record.id)).map((record) => record.id);
  const auditedAt = (/* @__PURE__ */ new Date()).toISOString();
  store2.update((state) => {
    for (const toy of state.toys || []) if (updates.has(toy.id)) toy.imageRef = updates.get(toy.id);
    state.catalogState.syncMetadata.imageAuditV7 = { auditedAt, totalToyCount: currentToys.length, verified, restored, catalogFallbacks, missingToyIds, orphanRecordIds, orphanImageCount: orphanRecordIds.length, unrecoverableCount: missingToyIds.length, pending: missingToyIds.length > 0 };
  }, "toy-library-image-audit");
  return store2.state.catalogState.syncMetadata.imageAuditV7;
}
async function auditStandardCatalogImages({ store: store2, catalog: catalog2, verifyRemote = verifyRemoteImage }) {
  const rows = catalog2?.active || [];
  const byStatus = {
    verifiedRealImage: [],
    stableRemoteImage: [],
    manuallyConfirmedImage: [],
    placeholder: [],
    broken: [],
    remoteFetchFailure: [],
    identityMismatch: [],
    missingMetadata: [],
    noImage: []
  };
  for (let index = 0; index < rows.length; index++) {
    const toy = rows[index];
    const ref = toy.imageRef;
    let status;
    if (!ref || ref.kind === "placeholder") status = "noImage";
    else if (ref.catalogKey && canonicalKey(ref.catalogKey) !== canonicalKey(toy.canonicalKey)) status = "identityMismatch";
    else if (ref.kind === "catalog" && !ref.id) status = "broken";
    else if (ref.kind === "remote" && !ref.url) status = "broken";
    else if (ref.kind === "generated" || ref.assetState === "placeholder" || ref.generated || ref.source === "search-fallback" || ref.source === "missing-catalog-metadata") status = "placeholder";
    else if (ref.verificationStatus === "manually_confirmed") status = "manuallyConfirmedImage";
    else if (ref.kind === "remote") {
      const reachable = await verifyRemote(ref.url);
      status = reachable === false ? "remoteFetchFailure" : ["verified", "verified_real"].includes(ref.verificationStatus) ? "verifiedRealImage" : "stableRemoteImage";
    } else status = ref.verificationStatus === "manually_confirmed" ? "manuallyConfirmedImage" : "verifiedRealImage";
    byStatus[status].push(toy.canonicalKey);
    if (index % 8 === 7) await yieldMainThread();
  }
  const auditedAt = (/* @__PURE__ */ new Date()).toISOString();
  const result2 = {
    auditedAt,
    totalCatalogCount: rows.length,
    pending: false,
    verifiedRealImage: byStatus.verifiedRealImage.length,
    stableRemoteImage: byStatus.stableRemoteImage.length,
    manuallyConfirmedImage: byStatus.manuallyConfirmedImage.length,
    placeholder: byStatus.placeholder.length,
    broken: byStatus.broken.length,
    remoteFetchFailure: byStatus.remoteFetchFailure.length,
    identityMismatch: byStatus.identityMismatch.length,
    missingMetadata: byStatus.placeholder.length + byStatus.missingMetadata.length,
    noImage: byStatus.noImage.length,
    ...Object.fromEntries(Object.entries(byStatus).map(([status, keys]) => [`${status}Keys`, keys]))
  };
  store2.update((state) => {
    state.catalogState.syncMetadata ||= {};
    state.catalogState.syncMetadata.catalogImageAuditV12 = result2;
  }, "standard-catalog-image-audit");
  return store2.state.catalogState.syncMetadata.catalogImageAuditV12;
}
function verifyRemoteImage(url) {
  if (!url || typeof Image === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const complete = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => complete(false), 5e3);
    image.onload = () => complete(true);
    image.onerror = () => complete(false);
    image.src = url;
  });
}
function legacyImageIds(toy = {}) {
  return [toy.photoId, toy.personalPhotoId, toy.imageId, toy.localImageId, toy.photoKey, toy.imageKey, toy.imageRef?.kind === "personal" ? toy.imageRef.id : null];
}
function sameCatalogChildForDynamicImage(child, catalogChild) {
  if (child?.set?.kind !== "child" || catalogChild?.set?.kind !== "child") return false;
  const left = [child.canonicalKey, ...child.legacyCanonicalKeys || []].map(canonicalKey).filter(Boolean);
  const right = [catalogChild.canonicalKey, ...catalogChild.legacyCanonicalKeys || []].map(canonicalKey).filter(Boolean);
  if (left.some((key) => right.includes(key))) return true;
  const parentA = canonicalKey(child.set?.parentCanonicalKey), parentB = canonicalKey(catalogChild.set?.parentCanonicalKey);
  const part = (value) => Number(value?.set?.partIndex || canonicalKey(value?.canonicalKey).match(/(?:part|puzzle)-(\d+)$/)?.[1] || 0);
  return Boolean(parentA && parentA === parentB && part(child) > 0 && part(child) === part(catalogChild));
}
function legacyToyMatches(old, current) {
  const legacy = normalizeToy(old);
  return old.id === current.id || sameCatalogIdentity(legacy, current) || sameLegacyChildIdentity(legacy, current);
}
function sameLegacyChildIdentity(a, b) {
  if (a.set?.kind === "parent" || b.set?.kind === "parent") return false;
  const parentA = canonicalKey(a.set?.parentCanonicalKey);
  const parentB = canonicalKey(b.set?.parentCanonicalKey);
  const sameParent = Boolean(parentA && parentB && parentA === parentB) || Boolean(a.set?.parentId && b.set?.parentId && a.set.parentId === b.set.parentId);
  if (!sameParent || a.brand !== b.brand) return false;
  const names = toyNameTokens(a);
  return names.some((name) => toyNameTokens(b).includes(name));
}
function toyNameTokens(toy = {}) {
  return [...new Set([toy.productName, toy.names?.en, toy.names?.zh, ...toy.aliases || []].map(canonicalKey).filter((value) => value.length >= 4))];
}
function recordMatchesImage(record, ids, toyIds) {
  const recordId = String(record.id || "").toLowerCase();
  const metadata = String(record.metadata || "");
  return ids.some((id) => recordId.includes(String(id).toLowerCase())) || toyIds.some((id) => recordId.includes(String(id).toLowerCase()) || metadata.includes(String(id).toLowerCase()));
}
function yieldMainThread() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
function migrateTombstones() {
  if (typeof localStorage === "undefined") return {};
  const storageKeys = ["toyRotationCatalogDeletedV0934", "toyRotationHiddenCatalogKeysV0927", "toyRotationHiddenCatalogTombstonesV0929", "toyRotationHiddenCatalogAuthoritativeV0930", "toyRotationCatalogHiddenV0933", "toyRotationCatalogPendingHideV0933"];
  const values = storageKeys.flatMap((storageKey) => tombstoneKeys(parse(localStorage.getItem(storageKey))));
  const overrides = parse(localStorage.getItem("toyRotationCatalogOverridesV095")) || {};
  for (const [key, value] of Object.entries(overrides)) if (value?.hidden === true || value?.deleted === true || value?.mergeInto) values.push(key);
  return Object.fromEntries(uniqueCanonical(values).map((key) => [key, { deletedAt: (/* @__PURE__ */ new Date()).toISOString(), migrated: true }]));
}
function tombstoneKeys(value) {
  if (!value) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(tombstoneKeys);
  if (typeof value !== "object") return [];
  const explicit = [value.key, value.canonicalKey, ...Array.isArray(value.keys) ? value.keys : []].filter(Boolean);
  return explicit.length ? explicit : Object.entries(value).filter(([, entry]) => entry === true || entry?.hidden === true || entry?.deleted === true || entry?.mergeInto).map(([key]) => key);
}
function uniqueCanonical(values) {
  return [...new Set(values.map(canonicalKey).filter(Boolean))];
}
function sanitizeCatalogImageRefs(catalogState) {
  const maps = [catalogState.imageRefsByKey || {}, catalogState.imageRefsByIdentity || {}];
  const usage = /* @__PURE__ */ new Map();
  for (const map of maps) for (const ref of Object.values(map)) if (ref?.id) usage.set(ref.id, (usage.get(ref.id) || 0) + 1);
  for (const map of maps) for (const [key, ref] of Object.entries(map)) if (ref?.id && usage.get(ref.id) > 2) delete map[key];
}
function migrateCatalogImageRefs() {
  if (typeof localStorage === "undefined") return { imageRefsByKey: {}, imageRefsByIdentity: {} };
  const confirmed = parse(localStorage.getItem("toyCatalogConfirmedPhotosV1")) || {};
  const registry = parse(localStorage.getItem("toyRotationCatalogMediaV0946")) || {};
  const idsByKey = { ...registry.byKey || {}, ...confirmed };
  const assignments = [...Object.entries(idsByKey), ...Object.entries(registry.byIdentity || {})].map(([, id]) => String(id || "")).filter(Boolean);
  const usage = assignments.reduce((counts, id) => counts.set(id, (counts.get(id) || 0) + 1), /* @__PURE__ */ new Map());
  const imageRefsByKey = Object.fromEntries(Object.entries(idsByKey).filter(([key, id]) => canonicalKey(key) && id && usage.get(String(id)) <= 2).map(([key, id]) => [canonicalKey(key), { kind: "catalog", id: String(id) }]));
  const imageRefsByIdentity = Object.fromEntries(Object.entries(registry.byIdentity || {}).filter(([, id]) => id && usage.get(String(id)) <= 2).map(([identity, id]) => [String(identity), { kind: "catalog", id: String(id) }]));
  return { imageRefsByKey, imageRefsByIdentity };
}
function parse(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

// src/domain/duplicate-engine.js
function findDuplicates(toys = []) {
  const results = [];
  for (let a = 0; a < toys.length; a++) for (let b = a + 1; b < toys.length; b++) {
    const item = compare(toys[a], toys[b]);
    if (isActionableDuplicate(item.kind)) results.push(item);
  }
  return results.sort((a, b) => rank(b.kind) - rank(a.kind) || b.score - a.score);
}
function auditIdentityRelationships(toys = []) {
  const results = [];
  for (let a = 0; a < toys.length; a++) for (let b = a + 1; b < toys.length; b++) {
    const item = compare(toys[a], toys[b]);
    if (item.kind !== "none") results.push(item);
  }
  return results.sort((a, b) => rank(b.kind) - rank(a.kind) || b.score - a.score);
}
function compare(a, b) {
  const relation = classifySetRelationship(a, b);
  if (relation === "parent_child_relation" || differentSetEntities(a, b)) return result("parent_child_relation", 0, a, b, ["parent_child_relation"]);
  const sameKey = identityTokens(a).keys.some((key) => identityTokens(b).keys.includes(key));
  if (sameKey) return result("exact_duplicate", 100, a, b, ["canonicalKey"]);
  if (distinctSku(a, b)) return result("related_variant", 0, a, b, ["distinct_sku"]);
  const name = sameName(a, b);
  const aliases = sharesAlias(a, b);
  const brand = sameBrand(a, b);
  if (relation === "sibling_child") {
    if (brand && (name || aliases)) return result("same_child_legacy_duplicate", 96, a, b, [name ? "same_child_name" : "same_child_alias", "same_parent"]);
    return result("sibling_child", 0, a, b, ["same_parent_different_child"]);
  }
  if (name && brand || aliases && brand) return result("strong_probable_duplicate", 80, a, b, [name ? "name" : "alias", "brand"]);
  if (brand && similarName(a, b)) return result("related_variant", 0, a, b, ["related_name"]);
  return result("none", 0, a, b, []);
}
function exactProductIdentityKey(toy) {
  const brand = normalized(toy.brand);
  const sku = normalized(toy.setNumber || toy.sku);
  const name = normalizedName(toy);
  return brand && sku ? `${brand}|sku:${sku}` : name && brand ? `${brand}|${name}` : "";
}
function isActionableDuplicate(kind) {
  return ["exact_duplicate", "same_child_legacy_duplicate", "strong_probable_duplicate"].includes(kind);
}
function result(kind, score, a, b, reasons) {
  return { kind, score, a, b, reasons };
}
function sameName(a, b) {
  const x = normalizedName(a), y = normalizedName(b);
  return Boolean(x && x === y);
}
function sameBrand(a, b) {
  const x = normalized(a.brand), y = normalized(b.brand);
  return Boolean(x && x === y);
}
function sharesAlias(a, b) {
  const left = identityTokens(a).names;
  const right = identityTokens(b).names;
  return left.some((value) => value && right.includes(value));
}
function normalizedName(toy) {
  return normalized(toy.productName || toy.name || toy.names?.en || toy.names?.zh || "");
}
function normalized(value) {
  return String(value || "").normalize("NFKC").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "");
}
function similarName(a, b) {
  const x = normalizedName(a), y = normalizedName(b);
  return Boolean(x && y && (x.includes(y) || y.includes(x)));
}
function rank(kind) {
  return { exact_duplicate: 6, same_child_legacy_duplicate: 5, strong_probable_duplicate: 4, parent_child_relation: 3, sibling_child: 2, related_variant: 1, none: 0 }[kind] || 0;
}

// src/domain/set-service.js
function validateSetGraph(toys) {
  const byId = new Map(toys.map((toy) => [toy.id, toy]));
  return toys.filter((toy) => toy.set?.kind === "child").every((child) => byId.has(child.set.parentId) && byId.get(child.set.parentId).set.kind === "parent");
}
function splitExplicitSet(parent, children) {
  if (parent.set?.kind !== "parent" || parent.set.rotationMode !== "split") return { parent, children: [] };
  const created = children.map((child, index) => normalizeToy({ ...child, id: crypto.randomUUID(), canonicalKey: child.canonicalKey || `${parent.canonicalKey}:part-${index + 1}`, brand: child.brand || parent.brand, minAgeMonths: child.minAgeMonths ?? parent.minAgeMonths, maxAgeMonths: child.maxAgeMonths ?? parent.maxAgeMonths, imageRef: child.imageRef || childImageRef(parent, child, index), set: { kind: "child", parentId: parent.id, parentCanonicalKey: parent.canonicalKey, setName: parent.productName, partIndex: index + 1, childIds: [], rotationMode: "split", ownershipSource: "generated_from_set", generatedFromParentId: parent.id, ownershipGroupId: parent.id, detachedFromSet: false } }));
  parent.set.childIds = created.map((child) => child.id);
  return { parent, children: created };
}
function deriveExplicitChildren(parent, definition = {}) {
  if (parent.set?.kind !== "parent" || parent.set.rotationMode !== "split") return [];
  const supplied = Array.isArray(definition.children) ? definition.children : [];
  if (supplied.length) return supplied.map((child, index) => ({ ...child, imageRef: child.imageRef?.kind && child.imageRef.kind !== "placeholder" ? child.imageRef : childImageRef(parent, child, index) }));
  const known = knownMultiPuzzleChildren(parent, definition);
  if (known.length) return known;
  const count4 = parseExplicitChildCount(definition, parent);
  if (!count4) return [];
  const baseName = parent.productName || definition.name || "Puzzle set";
  return Array.from({ length: count4 }, (_, index) => ({
    canonicalKey: `${parent.canonicalKey}:part-${index + 1}`,
    productName: `${baseName} \xB7 ${index + 1}`,
    names: parent.names,
    brand: parent.brand,
    categoryCode: parent.categoryCode,
    skillCodes: parent.skillCodes,
    playMechanics: parent.playMechanics,
    minAgeMonths: parent.minAgeMonths,
    maxAgeMonths: parent.maxAgeMonths,
    imageRef: childImageRef(parent, { productName: `${baseName} ${index + 1}` }, index)
  }));
}
function knownMultiPuzzleChildren(parent, definition) {
  const text2 = [parent.brand, parent.productName, parent.names?.en, parent.names?.zh, definition.productName, definition.name, definition.nameZh].filter(Boolean).join(" ");
  if (!/mideer/i.test(text2) || !/puzzle|拼图/i.test(text2)) return [];
  if (/busy\s*vehicles|忙碌车辆|车辆拼图|交通工具拼图/i.test(text2)) {
    return [["\u6C7D\u8F66", "Car", ["Car Puzzle"]], ["\u8B66\u8F66", "Police Car", ["Police Car Puzzle"]], ["\u51B0\u6DC7\u6DCB\u8F66", "Ice Cream Truck", ["Ice Cream Truck Puzzle"]], ["\u5783\u573E\u8F66", "Garbage Truck", ["Garbage Truck Puzzle"]], ["\u8FD0\u8F93\u8F66", "Delivery Truck", ["Delivery Truck Puzzle", "Dump Truck", "Dump Truck Puzzle"]], ["\u6821\u8F66", "School Bus", ["School Bus Puzzle"]]].map((names, index) => childDefinition(parent, names, index));
  }
  if (/my\s*first\s*puzzle|第一套拼图/i.test(text2)) {
    const dinosaur = /dinosaur|恐龙/i.test(text2);
    const dinosaurNames = [["\u7FFC\u9F99", "Pterosaur"], ["\u526F\u6809\u9F99", "Parasaurolophus"], ["\u5251\u9F99", "Stegosaurus"], ["\u4E09\u89D2\u9F99", "Triceratops"], ["\u9738\u738B\u9F99", "Tyrannosaurus rex"], ["\u86C7", "Snake"]];
    return Array.from({ length: 6 }, (_, index) => childDefinition(parent, dinosaur ? [...dinosaurNames[index], [`Dinosaur Puzzle ${index + 1}`]] : [`\u5C0F\u62FC\u56FE ${index + 1}`, `Small puzzle ${index + 1}`], index));
  }
  return [];
}
function childDefinition(parent, [nameZh, nameEn, aliases = []], index) {
  const child = { canonicalKey: `${parent.canonicalKey}:puzzle-${index + 1}`, productName: nameEn, names: { en: nameEn, zh: nameZh }, aliases, brand: parent.brand, categoryCode: "puzzles_matching", skillCodes: ["fine_motor", "hand_eye", "matching", "visual_spatial"], playMechanics: ["jigsaw"], minAgeMonths: parent.minAgeMonths, maxAgeMonths: parent.maxAgeMonths };
  return { ...child, imageRef: childImageRef(parent, child, index) };
}
function childImageRef(parent, child, index) {
  return { kind: "generated", label: child.productName || child.names?.en || `${parent.productName} ${index + 1}`, brand: child.brand || parent.brand, source: "missing-child-catalog-metadata", assetState: "placeholder", verificationStatus: "missing_metadata" };
}
function parseExplicitChildCount(definition = {}, parent = {}) {
  const explicit = Number(definition.childCount || definition.puzzleCount);
  if (Number.isInteger(explicit) && explicit > 1 && explicit <= 24) return explicit;
  const value = [definition.productName, definition.name, definition.nameZh, parent.productName, parent.names?.zh].filter(Boolean).join(" ");
  const match = value.match(/(?:\b|\s)(\d{1,2})\s*(?:[- ]?in[- ]?1|合\s*1|款)/i);
  const count4 = Number(match?.[1]);
  return Number.isInteger(count4) && count4 > 1 && count4 <= 24 ? count4 : 0;
}
function ensureSplitSetChildren(toys, definitionsByKey) {
  toys ||= [];
  const existingByKey = new Map(toys.map((toy) => [canonicalKey(toy.canonicalKey), toy]));
  const additions = [];
  for (const parent of toys.filter((toy) => toy.set?.kind === "parent" && toy.set.rotationMode === "split")) {
    const definition = definitionsByKey.get(parent.canonicalKey) || parent;
    const supplied = deriveExplicitChildren(parent, definition);
    const { children: planned } = splitExplicitSet(parent, supplied);
    const childIds = [];
    const intentionallyRemoved = new Set((parent.set?.intentionalRemovedChildKeys || []).map(canonicalKey));
    for (const child of planned) {
      const key = canonicalKey(child.canonicalKey);
      if (intentionallyRemoved.has(key)) continue;
      const existing = existingByKey.get(key) || exactLegacyParentPartChild(toys, parent, child) || chooseBestChild(findHistoricalChildMatches(toys, parent, child), parent, child);
      if (existing) {
        if (canonicalKey(existing.canonicalKey) !== key) {
          existing.legacyCanonicalKeys = uniqueCanonicalKeys([...existing.legacyCanonicalKeys || [], existing.canonicalKey, child.canonicalKey]);
          existing.canonicalKey = key;
          existing.set = { ...existing.set || {}, kind: "child", parentId: parent.id, parentCanonicalKey: parent.canonicalKey, partIndex: child.set?.partIndex, rotationMode: "split", ownershipGroupId: parent.id };
        }
        childIds.push(existing.id);
        continue;
      }
      additions.push(child);
      existingByKey.set(key, child);
      childIds.push(child.id);
    }
    parent.set.childIds = childIds;
  }
  return additions;
}
function exactLegacyParentPartChild(toys, parent, child) {
  const part = Number(child.set?.partIndex);
  if (!Number.isInteger(part) || part < 1) return null;
  return toys.find((candidate) => candidate.set?.kind === "child" && (candidate.set?.parentId === parent.id || canonicalKey(candidate.set?.parentCanonicalKey) === canonicalKey(parent.canonicalKey)) && Number(candidate.set?.partIndex) === part) || null;
}
function backfillKnownMideerLegacySixSlot(state, definitionsByKey) {
  state.toys ||= [];
  const parentKey = "mideer-my-first-puzzle";
  const definition = definitionsByKey.get(parentKey);
  if (!definition || Number(definition.childCount) !== 6) return { promoted: 0, parentIds: [] };
  const parentIds = [];
  for (const parent of state.toys.filter((toy) => canonicalKey(toy.canonicalKey) === parentKey)) {
    if (parent.set?.kind === "parent" && parent.set.rotationMode === "split") continue;
    const retainedChildren = state.toys.filter((child) => {
      const childKey = canonicalKey(child.canonicalKey);
      return child.set?.parentId === parent.id || canonicalKey(child.set?.parentCanonicalKey) === parentKey || String(childKey).startsWith(`${parentKey}:`) || (parent.set?.childIds || []).includes(child.id);
    });
    if (!retainedChildren.length) continue;
    parent.set = { ...parent.set || {}, kind: "parent", rotationMode: "split", childIds: retainedChildren.map((child) => child.id), legacySixSlotBackfill: "mideer-my-first-puzzle-v1" };
    parentIds.push(parent.id);
  }
  return { promoted: parentIds.length, parentIds };
}
function repairQa6MideerCanonicalState(state, definitionsByKey) {
  const target = "mideer-my-first-puzzle-dinosaurs-6in1-md1460";
  const legacy = /* @__PURE__ */ new Set(["mideer-my-first-puzzle-dinosaurs-6in1", "mideer-first-artist-cute-dinosaurs"]);
  if (!definitionsByKey.get(target)) return { applied: false, migratedParents: 0, migratedChildren: 0, mergedParents: 0 };
  let migratedParents = 0, migratedChildren = 0, mergedParents = 0;
  for (const toy of state.toys || []) {
    const original = canonicalKey(toy.canonicalKey);
    const parentKey = canonicalKey(toy.set?.parentCanonicalKey);
    if (legacy.has(original)) {
      toy.canonicalKey = target;
      toy.legacyCanonicalKeys = uniqueCanonicalKeys([...toy.legacyCanonicalKeys || [], original]);
      migratedParents++;
    }
    if (legacy.has(parentKey)) {
      toy.set = { ...toy.set || {}, parentCanonicalKey: target };
      const part = Number(toy.set.partIndex || partIndexFromKey(toy.canonicalKey));
      if (toy.set.kind === "child" && part > 0) {
        toy.legacyCanonicalKeys = uniqueCanonicalKeys([...toy.legacyCanonicalKeys || [], toy.canonicalKey]);
        toy.canonicalKey = `${target}:puzzle-${part}`;
        migratedChildren++;
      }
    }
  }
  const parents = (state.toys || []).filter((toy) => canonicalKey(toy.canonicalKey) === target && toy.set?.kind === "parent");
  if (parents.length > 1) {
    const primary = parents.sort((a, b) => (b.set?.childIds?.length || 0) - (a.set?.childIds?.length || 0))[0];
    for (const duplicate of parents.filter((parent) => parent !== primary)) {
      const childIds = [...primary.set?.childIds || [], ...duplicate.set?.childIds || []];
      const result2 = mergePersonalToyPair(state, primary.id, duplicate.id);
      if (result2.merged) {
        primary.set = { ...primary.set || {}, kind: "parent", rotationMode: "split", childIds: [...new Set(childIds)] };
        mergedParents++;
      }
    }
  }
  const catalog2 = state.catalogState ||= {};
  catalog2.tombstones ||= {};
  catalog2.adminEdits ||= {};
  catalog2.imageRefsByKey ||= {};
  catalog2.imageRefsByIdentity ||= {};
  for (const from of legacy) {
    if (catalog2.adminEdits[from]) {
      catalog2.adminEdits[target] = { ...catalog2.adminEdits[from] || {}, ...catalog2.adminEdits[target] || {}, legacyCanonicalKeys: uniqueCanonicalKeys([...catalog2.adminEdits[target]?.legacyCanonicalKeys || [], from]) };
      delete catalog2.adminEdits[from];
    }
    if (catalog2.imageRefsByKey[from] && !catalog2.imageRefsByKey[target]) catalog2.imageRefsByKey[target] = catalog2.imageRefsByKey[from];
    delete catalog2.imageRefsByKey[from];
    catalog2.tombstones[from] = { ...catalog2.tombstones[from] || {}, mergedInto: target, repairedBy: "qa6-md1460-canonical-v1" };
  }
  delete catalog2.tombstones[target];
  for (const item of state.wishlist || []) {
    if (legacy.has(canonicalKey(item.canonicalKey))) {
      item.canonicalKey = target;
      item.catalogId = target;
      if (item.catalogSnapshot) {
        item.catalogSnapshot.canonicalKey = target;
        item.catalogSnapshot.legacyCanonicalKeys = uniqueCanonicalKeys([...item.catalogSnapshot.legacyCanonicalKeys || [], ...legacy]);
      }
    }
  }
  for (const round of state.rotationHistory || []) {
    if (legacy.has(canonicalKey(round.canonicalKey))) round.canonicalKey = target;
    if (legacy.has(canonicalKey(round.catalogKey))) round.catalogKey = target;
  }
  catalog2.syncMetadata ||= {};
  catalog2.syncMetadata.qa6MideerCanonicalRepairV1 = { repairedAt: (/* @__PURE__ */ new Date()).toISOString(), target, migratedParents, migratedChildren, mergedParents };
  return { applied: true, target, migratedParents, migratedChildren, mergedParents };
}
function restoreMissingSplitSetChildren(state, definitionsByKey, legacyToys = []) {
  state.toys ||= [];
  const existing = state.toys;
  const legacy = (legacyToys || []).map(normalizeToy);
  const restored = [];
  const repairs = [];
  for (const parent of existing.filter((toy) => toy.set?.kind === "parent")) {
    const definition = definitionsByKey.get(canonicalKey(parent.canonicalKey));
    const planned = restorationPlan(parent, definition);
    if (planned.length < 2) continue;
    const currentChildren = existing.filter((toy) => isChildOfParent(toy, parent));
    const missing = planned.filter((child) => !currentChildren.some((row) => canonicalKey(row.canonicalKey) === canonicalKey(child.canonicalKey)));
    if (!missing.length) continue;
    const intentional = new Set((parent.set?.intentionalRemovedChildKeys || []).map(canonicalKey));
    const eligible = missing.filter((child) => !intentional.has(canonicalKey(child.canonicalKey)));
    if (!eligible.length) continue;
    const ghostChildIds = (parent.set?.childIds || []).filter((id) => !existing.some((toy) => toy.id === id));
    const legacyMatches = eligible.flatMap((child) => legacy.filter((row) => reliableLegacyChildFor(row, parent, child)));
    if (!ghostChildIds.length && !legacyMatches.length) continue;
    const childIds = [...currentChildren.map((child) => child.id)];
    for (const child of eligible) {
      const historical = chooseBestChild(legacy.filter((row) => reliableLegacyChildFor(row, parent, child)), parent, child);
      const restoredChild = historical ? restoreHistoricalChild(historical, parent, child) : createRestoredChild(parent, child);
      if (existing.some((row) => row.id === restoredChild.id)) restoredChild.id = crypto.randomUUID();
      existing.push(restoredChild);
      restored.push(restoredChild);
      childIds.push(restoredChild.id);
    }
    parent.set.rotationMode = "split";
    parent.set.childIds = [...new Set(childIds)];
    repairs.push({ parentId: parent.id, parentCanonicalKey: parent.canonicalKey, expected: planned.length, existing: currentChildren.length, restored: eligible.length, proof: legacyMatches.length ? "legacy_ownership" : "stale_child_ids" });
  }
  return { restored: restored.length, parents: repairs.length, repairs };
}
var STRUCTURE_MIGRATION_DAMAGE_WINDOW = Object.freeze({
  start: Date.parse("2026-08-22T00:00:00.000Z"),
  end: Date.parse("2026-08-25T00:00:00.000Z")
});
function classifyStructureMigrationDamage(state, definitionsByKey) {
  const toys = state.toys || [];
  const candidates = [];
  for (const parent of toys.filter((toy) => toy.set?.kind === "parent" || toy.set?.kind === "whole")) {
    const definition = definitionsByKey.get(canonicalKey(parent.canonicalKey));
    const planned = stableRestorationPlan(parent, definition);
    const currentChildren = toys.filter((toy) => isChildOfParent(toy, parent));
    const reasons = [];
    if (!definition || planned.length < 2) reasons.push("catalog_structure_not_stable");
    if (!catalogDefinesSplitParent(definition)) reasons.push("catalog_not_split_parent");
    if (!isStructureConflict(parent, currentChildren)) reasons.push("no_structure_conflict");
    if ((parent.set?.intentionalRemovedChildKeys || []).length) reasons.push("intentional_child_deletion");
    if (hasReliableWholeChoice(parent)) reasons.push("explicit_keep_whole_choice");
    if (!withinKnownMigrationWindow(state, parent)) reasons.push("outside_known_migration_window");
    const qualifies = reasons.length === 0;
    if (qualifies || isStructureConflict(parent, currentChildren)) candidates.push({
      kind: qualifies ? "probable_structure_migration_damage" : "not_structure_migration_damage",
      parentId: parent.id,
      parentCanonicalKey: canonicalKey(parent.canonicalKey),
      expectedChildCount: planned.length,
      currentChildCount: currentChildren.length,
      status: qualifies ? "needs_confirmation" : "ineligible",
      reasons
    });
  }
  return candidates;
}
function repairStructureMigrationDamage(state, definitionsByKey, { confirmedParentIds = [], confirmedParentKeys = [] } = {}) {
  state.toys ||= [];
  const confirmedIds = new Set(confirmedParentIds.map(String));
  const confirmedKeys = new Set(confirmedParentKeys.map(canonicalKey));
  const classifications = classifyStructureMigrationDamage(state, definitionsByKey);
  const repaired = [];
  const needsConfirmation = [];
  for (const candidate of classifications.filter((item) => item.kind === "probable_structure_migration_damage")) {
    const confirmed = confirmedIds.has(String(candidate.parentId)) || confirmedKeys.has(candidate.parentCanonicalKey);
    if (!confirmed) {
      needsConfirmation.push(candidate);
      continue;
    }
    const parent = state.toys.find((toy) => toy.id === candidate.parentId);
    const definition = definitionsByKey.get(candidate.parentCanonicalKey);
    const planned = stableRestorationPlan(parent, definition);
    if (!parent || planned.length !== candidate.expectedChildCount) continue;
    const created = planned.map((plan) => createStructureRepairChild(parent, plan));
    state.toys.push(...created);
    parent.set = {
      ...parent.set || {},
      kind: "parent",
      rotationMode: "split",
      childIds: created.map((child) => child.id),
      intentionalRemovedChildKeys: []
    };
    repaired.push({
      kind: "probable_structure_migration_damage",
      parentId: parent.id,
      parentCanonicalKey: candidate.parentCanonicalKey,
      previousChildCount: 0,
      restoredChildCount: created.length,
      childCanonicalKeys: created.map((child) => child.canonicalKey)
    });
  }
  return { repairedParents: repaired.length, restoredChildren: repaired.reduce((sum, item) => sum + item.restoredChildCount, 0), repaired, needsConfirmation };
}
function stableRestorationPlan(parent, definition) {
  if (!parent || !catalogDefinesSplitParent(definition)) return [];
  const planned = restorationPlan(parent, definition);
  if (planned.length < 2) return [];
  const keys = planned.map((child) => canonicalKey(child.canonicalKey));
  if (keys.some((key) => !key) || new Set(keys).size !== keys.length) return [];
  return planned;
}
function catalogDefinesSplitParent(definition) {
  return Boolean(definition && definition.set?.kind === "parent" && definition.set?.rotationMode === "split");
}
function isStructureConflict(parent, currentChildren) {
  return currentChildren.length === 0 && (parent.set?.kind === "whole" || parent.set?.rotationMode === "whole") && !(parent.set?.childIds || []).length;
}
function hasReliableWholeChoice(parent) {
  const metadata = parent.userMetadata || {};
  const choice = metadata.setStructureChoice || metadata.setManagementMode || metadata.structurePreference;
  const source = metadata.setStructureChoiceSource || metadata.structurePreferenceSource;
  return metadata.keepWholeSet === true || choice === "whole" && ["user", "manual", "explicit"].includes(source);
}
function withinKnownMigrationWindow(state, parent) {
  const values = [parent.updatedAt, parent.userMetadata?.structureChangedAt];
  const metadata = state.catalogState?.syncMetadata || {};
  for (const [key, marker] of Object.entries(metadata)) {
    if (!/^parentChild(ReconciliationV(?:8|9|10|11|12)|DataRepair)$/.test(key) || !marker || typeof marker !== "object") continue;
    values.push(marker.startedAt, marker.reconciledAt, marker.repairedAt, marker.migratedAt);
  }
  return values.some((value) => {
    const time = Date.parse(value || "");
    return Number.isFinite(time) && time >= STRUCTURE_MIGRATION_DAMAGE_WINDOW.start && time < STRUCTURE_MIGRATION_DAMAGE_WINDOW.end;
  });
}
function createStructureRepairChild(parent, plan) {
  return normalizeToy({
    id: crypto.randomUUID(),
    canonicalKey: plan.canonicalKey,
    brand: plan.brand,
    productName: plan.productName,
    names: plan.names,
    aliases: plan.aliases,
    categoryCode: plan.categoryCode,
    skillCodes: plan.skillCodes,
    playMechanics: plan.playMechanics,
    operationCode: plan.operationCode,
    goalCodes: plan.goalCodes,
    sceneCodes: plan.sceneCodes,
    imageRef: plan.imageRef,
    minAgeMonths: plan.minAgeMonths,
    maxAgeMonths: plan.maxAgeMonths,
    status: "stored",
    set: {
      kind: "child",
      parentId: parent.id,
      parentCanonicalKey: parent.canonicalKey,
      setName: parent.productName,
      partIndex: plan.set?.partIndex || partIndexFromKey(plan.canonicalKey),
      childIds: [],
      rotationMode: "split",
      ownershipSource: "generated_from_set",
      generatedFromParentId: parent.id,
      ownershipGroupId: parent.id,
      detachedFromSet: false
    },
    mergeDiagnostics: ["data-repair: probable_structure_migration_damage"]
  });
}
function restorationPlan(parent, definition) {
  if (!definition) return [];
  const probe = { ...parent, set: { ...parent.set, kind: "parent", rotationMode: "split" } };
  const supplied = deriveExplicitChildren(probe, definition);
  return supplied.map((child, index) => normalizeToy({ ...child, id: `repair-plan-${index + 1}`, canonicalKey: child.canonicalKey || `${parent.canonicalKey}:part-${index + 1}`, brand: child.brand || parent.brand, set: { kind: "child", parentId: parent.id, parentCanonicalKey: parent.canonicalKey, setName: parent.productName, partIndex: index + 1, childIds: [], rotationMode: "split" } }));
}
function isChildOfParent(toy, parent) {
  if (toy.set?.kind !== "child") return false;
  return toy.set.parentId === parent.id || canonicalKey(toy.set.parentCanonicalKey) === canonicalKey(parent.canonicalKey) || (toy.set.legacyParentIds || []).includes(parent.id);
}
function reliableLegacyChildFor(row, parent, child) {
  if (row.set?.kind !== "child") return false;
  if (!isChildOfParent(row, parent) && canonicalKey(row.set?.setName) !== canonicalKey(parent.productName)) return false;
  if (String(row.brand || "") !== String(parent.brand || "")) return false;
  const expectedKey = canonicalKey(child.canonicalKey);
  const rowKeys = uniqueCanonicalKeys([row.canonicalKey, ...row.legacyCanonicalKeys || []]);
  if (rowKeys.includes(expectedKey)) return true;
  const expectedPart = Number(child.set?.partIndex || partIndexFromKey(child.canonicalKey));
  const rowPart = Number(row.set?.partIndex || partIndexFromKey(row.canonicalKey));
  if (expectedPart && rowPart) return expectedPart === rowPart;
  return childNameTokens(row).some((name) => childNameTokens(child).includes(name));
}
function createRestoredChild(parent, plan) {
  return normalizeToy({ ...plan, id: crypto.randomUUID(), imageRef: plan.imageRef, status: "stored", set: { kind: "child", parentId: parent.id, parentCanonicalKey: parent.canonicalKey, setName: parent.productName, partIndex: plan.set?.partIndex || partIndexFromKey(plan.canonicalKey), childIds: [], rotationMode: "split", ownershipSource: "generated_from_set", generatedFromParentId: parent.id, ownershipGroupId: parent.id, detachedFromSet: false }, mergeDiagnostics: ["data-repair: restored_missing_split_child"] });
}
function restoreHistoricalChild(historical, parent, plan) {
  const parentCover = sameImageRef(historical.imageRef, parent.imageRef);
  return normalizeToy({ ...historical, canonicalKey: plan.canonicalKey, legacyCanonicalKeys: [...historical.legacyCanonicalKeys || [], historical.canonicalKey, plan.canonicalKey], productName: historical.productName || plan.productName, names: { ...plan.names, ...historical.names }, imageRef: parentCover ? plan.imageRef : historical.imageRef, set: { kind: "child", parentId: parent.id, parentCanonicalKey: parent.canonicalKey, legacyParentIds: [...historical.set?.legacyParentIds || [], historical.set?.parentId].filter(Boolean), setName: parent.productName, partIndex: plan.set?.partIndex || partIndexFromKey(plan.canonicalKey), childIds: [], rotationMode: "split", ownershipSource: "generated_from_set", generatedFromParentId: parent.id, ownershipGroupId: parent.id, detachedFromSet: false }, mergeDiagnostics: [...historical.mergeDiagnostics || [], "data-repair: restored_missing_split_child"] });
}
function reconcileSplitSetChildren(state, definitionsByKey) {
  state.toys ||= [];
  const additions = ensureSplitSetChildren(state.toys, definitionsByKey);
  if (additions.length) state.toys.push(...additions);
  let merged = 0;
  let remapped = 0;
  for (const parent of state.toys.filter((toy) => toy.set?.kind === "parent" && toy.set.rotationMode === "split")) {
    const definition = definitionsByKey.get(parent.canonicalKey) || parent;
    const planned = splitExplicitSet(parent, deriveExplicitChildren(parent, definition)).children;
    const childIds = [];
    for (const child of planned) {
      const exactPart = exactLegacyParentPartChild(state.toys, parent, child);
      const matches2 = exactPart ? [exactPart] : findHistoricalChildMatches(state.toys, parent, child);
      if (!matches2.length) continue;
      const primary = chooseBestChild(matches2, parent, child);
      const primaryOldKey = primary.canonicalKey;
      if (canonicalKey(primaryOldKey) !== canonicalKey(child.canonicalKey)) remapped++;
      primary.canonicalKey = canonicalKey(child.canonicalKey);
      primary.legacyCanonicalKeys = uniqueCanonicalKeys([...primary.legacyCanonicalKeys || [], primaryOldKey, child.canonicalKey]);
      primary.set = childSetLink(primary.set, parent, child);
      primary.imageRef = prefersChildImage(primary, child, parent) ? primary.imageRef : child.imageRef;
      enrichStandardChildMetadata(primary, child);
      for (const duplicate of matches2) {
        if (duplicate.id === primary.id) continue;
        if (sameImageRef(duplicate.imageRef, parent.imageRef)) duplicate.imageRef = { kind: "placeholder" };
        if (canonicalKey(duplicate.canonicalKey) !== canonicalKey(child.canonicalKey)) remapped++;
        duplicate.legacyCanonicalKeys = uniqueCanonicalKeys([...duplicate.legacyCanonicalKeys || [], duplicate.canonicalKey, child.canonicalKey]);
        duplicate.canonicalKey = canonicalKey(child.canonicalKey);
        duplicate.set = childSetLink(duplicate.set, parent, child);
        selectOwnedChildImage(primary, duplicate, parent, child);
        primary.legacyCanonicalKeys = uniqueCanonicalKeys([...primary.legacyCanonicalKeys || [], duplicate.canonicalKey, ...duplicate.legacyCanonicalKeys || []]);
        const mergedResult = mergePersonalToyPair(state, primary.id, duplicate.id);
        if (mergedResult.merged) {
          primary.mergeDiagnostics = [.../* @__PURE__ */ new Set([...primary.mergeDiagnostics || [], `R8: same_child_legacy_duplicate:${duplicate.id}`])];
          merged++;
        }
      }
      childIds.push(primary.id);
    }
    parent.set.childIds = [...new Set(childIds)];
  }
  const legacy = reconcileLegacyChildOwnership(state);
  merged += legacy.merged;
  const audit = auditSetIntegrity(state.toys);
  const residualDuplicateChildren = findDuplicates(state.toys).filter((item) => item.kind === "same_child_legacy_duplicate").length;
  return {
    added: additions.length,
    merged,
    remapped,
    parents: audit.parents,
    children: audit.children,
    legacyDuplicateChildren: legacy.detected,
    queuedDuplicateChildren: legacy.queued,
    attemptedDuplicateChildren: legacy.attempted,
    failedDuplicateChildren: legacy.failed,
    residualDuplicateChildren,
    mergeExecutions: legacy.executions,
    siblingExcluded: legacy.siblingExcluded,
    variantExcluded: legacy.variantExcluded,
    unresolved: audit.unresolved,
    issues: audit.issues
  };
}
function enrichStandardChildMetadata(existing, standard) {
  const customName = existing.userMetadata?.customProductName === true;
  if (!customName) {
    const legacyName = existing.productName;
    existing.productName = standard.productName;
    existing.names = { ...existing.names, ...standard.names, en: standard.names?.en || standard.productName };
    existing.aliases = uniqueDisplayStrings([...existing.aliases || [], ...standard.aliases || [], legacyName].filter((name) => name && name !== standard.productName));
  }
}
function uniqueDisplayStrings(values) {
  const seen = /* @__PURE__ */ new Set();
  return values.filter((value) => {
    const text2 = String(value || "").trim();
    const key = text2.toLocaleLowerCase();
    if (!text2 || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function reconcileOrphanedSplitOwnership(state, definitionsByKey) {
  state.toys ||= [];
  const plans = splitChildPlanIndex(definitionsByKey);
  const activeParentIds = new Set(state.toys.filter((toy) => toy.set?.kind === "parent").map((toy) => toy.id));
  const activeParentKeys = new Set(state.toys.filter((toy) => toy.set?.kind === "parent").map((toy) => canonicalKey(toy.canonicalKey)));
  const removed = [];
  const classifications = [];
  let backfilled = 0;
  let independent = 0;
  let detached = 0;
  let unknown = 0;
  for (const toy of state.toys) {
    const plan = planForToy(toy, plans);
    if (!plan) continue;
    const set = toy.set || {};
    const linkedParentStillActive = activeParentIds.has(set.parentId) || activeParentIds.has(set.generatedFromParentId) || activeParentKeys.has(canonicalKey(set.parentCanonicalKey));
    if (linkedParentStillActive) continue;
    const classification = classifyOrphanedSplitChild(toy, plan);
    classifications.push({ id: toy.id, canonicalKey: toy.canonicalKey, parentCanonicalKey: plan.parentCanonicalKey, classification: classification.kind, reason: classification.reason });
    if (classification.kind === "independent_ownership") {
      independent++;
      continue;
    }
    if (classification.kind === "explicitly_detached") {
      detached++;
      continue;
    }
    if (classification.kind === "unknown_legacy_provenance") {
      unknown++;
      continue;
    }
    toy.set = { ...set, ownershipSource: "generated_from_set", generatedFromParentId: set.generatedFromParentId || set.parentId || (set.legacyParentIds || [])[0] || null, ownershipGroupId: set.ownershipGroupId || set.parentId || (set.legacyParentIds || [])[0] || null, parentCanonicalKey: plan.parentCanonicalKey, detachedFromSet: false };
    backfilled++;
    removed.push(toy);
  }
  if (removed.length) {
    archiveRemovedOwnerships(state, removed, "orphaned_generated_child_repair");
    const removedIds = new Set(removed.map((toy) => toy.id));
    state.toys = state.toys.filter((toy) => !removedIds.has(toy.id));
    preserveDeletedReferences(state, removedIds);
  }
  return { scanned: classifications.length, removed: removed.length, backfilled, independent, detached, unknown, classifications };
}
function splitChildPlanIndex(definitionsByKey) {
  const index = /* @__PURE__ */ new Map();
  for (const raw of definitionsByKey?.values?.() || []) {
    const isSplit = raw?.set?.rotationMode === "split" || raw?.set?.kind === "parent" || raw?.rotationRule === "split";
    if (!isSplit) continue;
    const parent = normalizeToy({ ...raw, id: raw.id || `catalog:${canonicalKey(raw.canonicalKey || raw.key)}`, canonicalKey: raw.canonicalKey || raw.key, productName: raw.productName || raw.name, names: raw.names || { en: raw.name || "", zh: raw.nameZh || "" }, set: { ...raw.set || {}, kind: "parent", rotationMode: "split" } });
    if (!parent.canonicalKey || parent.set?.rotationMode !== "split") continue;
    const children = splitExplicitSet(parent, deriveExplicitChildren(parent, raw)).children;
    for (const [indexPosition, child] of children.entries()) {
      const keys = uniqueCanonicalKeys([child.canonicalKey, ...child.legacyCanonicalKeys || []]);
      const plan = { parentCanonicalKey: canonicalKey(parent.canonicalKey), partIndex: Number(child.set?.partIndex || partIndexFromKey(child.canonicalKey) || indexPosition + 1), keys };
      for (const key of keys) index.set(key, plan);
    }
  }
  return index;
}
function planForToy(toy, plans) {
  for (const key of uniqueCanonicalKeys([toy.canonicalKey, ...toy.legacyCanonicalKeys || []])) if (plans.has(key)) return plans.get(key);
  return null;
}
function hasIndependentOwnershipEvidence(toy) {
  const set = toy.set || {};
  if (set.detachedFromParentOwnershipId || set.ownershipSource === "detached_from_set") return { kind: "explicitly_detached", reason: "explicit_preserve_transition" };
  if (["manual", "catalog", "ai_independent", "user_added", "separate_purchase"].includes(set.ownershipSource)) return { kind: "independent_ownership", reason: `explicit_source:${set.ownershipSource}` };
  if (toy.purchaseDate || Object.keys(toy.purchaseMetadata || {}).length || toy.userMetadata?.independentOwnership === true) return { kind: "independent_ownership", reason: "independent_purchase_or_user_metadata" };
  return null;
}
function classifyOrphanedSplitChild(toy, plan) {
  const independent = hasIndependentOwnershipEvidence(toy);
  if (independent) return independent;
  const set = toy.set || {};
  const expectedPart = Number(plan.partIndex || 0);
  const actualPart = Number(set.partIndex || partIndexFromKey(toy.canonicalKey) || 0);
  const catalogPlanMatch = planForToy(toy, new Map(plan.keys.map((key) => [key, plan]))) === plan;
  const legacyParentEvidence = Boolean(set.parentId || set.generatedFromParentId || set.parentCanonicalKey || (set.legacyParentIds || []).length);
  if (catalogPlanMatch && legacyParentEvidence && (!expectedPart || !actualPart || expectedPart === actualPart)) return { kind: "generated_from_deleted_parent", reason: "catalog_split_identity_plus_legacy_parent_link" };
  return { kind: "unknown_legacy_provenance", reason: "catalog_split_identity_without_proven_parent_ownership" };
}
function archiveRemovedOwnerships(state, toys, reason2) {
  state.catalogState ||= {};
  state.catalogState.removedOwnerships ||= {};
  for (const toy of toys) if (!state.catalogState.removedOwnerships[toy.id]) state.catalogState.removedOwnerships[toy.id] = {
    removedAt: (/* @__PURE__ */ new Date()).toISOString(),
    reason: reason2,
    canonicalKey: toy.canonicalKey,
    parentCanonicalKey: toy.set?.parentCanonicalKey || null,
    ownership: { ...toy.set || {} },
    preservedUserData: { interest: toy.interest, shelfMode: toy.shelfMode, purchaseDate: toy.purchaseDate, purchaseMetadata: toy.purchaseMetadata, notes: toy.notes, userMetadata: toy.userMetadata, imageRef: toy.imageRef }
  };
}
function preserveDeletedReferences(state, removedIds) {
  for (const round of state.rotationHistory || []) {
    const missing = (round.toyIds || []).filter((id) => removedIds.has(id));
    if (missing.length) {
      round.toyIds = (round.toyIds || []).filter((id) => !removedIds.has(id));
      round.historicalMissingToyIds = [.../* @__PURE__ */ new Set([...round.historicalMissingToyIds || [], ...missing])];
    }
    if (removedIds.has(round.toyId)) {
      round.historicalMissingToyIds = [.../* @__PURE__ */ new Set([...round.historicalMissingToyIds || [], round.toyId])];
      delete round.toyId;
    }
  }
}
function reconcileLegacyChildOwnership(state) {
  const all = state.toys || [];
  const parentsByLegacyIdentity = /* @__PURE__ */ new Map();
  for (const parent of all.filter((toy) => toy.set?.kind === "parent")) {
    for (const key of [parent.id, parent.canonicalKey, ...parent.legacyCanonicalKeys || [], ...parent.set?.legacyParentIds || []].map((value) => String(value || "")).filter(Boolean)) parentsByLegacyIdentity.set(key, parent);
  }
  for (const toy of all) {
    if (toy.set?.kind !== "child") continue;
    const resolvedParent = [toy.set?.parentId, ...toy.set?.legacyParentIds || [], toy.set?.parentCanonicalKey].map((key) => parentsByLegacyIdentity.get(key)).find(Boolean);
    if (resolvedParent) {
      toy.set.parentId = resolvedParent.id;
      toy.set.parentCanonicalKey = canonicalKey(resolvedParent.canonicalKey);
      toy.set.legacyParentIds = [.../* @__PURE__ */ new Set([...toy.set.legacyParentIds || [], resolvedParent.id])];
      toy.set.setName ||= resolvedParent.productName;
    }
  }
  const queue = findDuplicates(all).filter(
    (item) => item.kind === "same_child_legacy_duplicate" && item.a?.set?.kind === "child" && item.b?.set?.kind === "child" && !differentKnownSiblingParts(item.a, item.b)
  );
  let merged = 0, attempted = 0, failed = 0;
  const executions = [];
  for (const item of queue) {
    const left = state.toys.find((toy) => toy.id === item.a.id);
    const right = state.toys.find((toy) => toy.id === item.b.id);
    if (!left || !right) continue;
    attempted++;
    const parent = resolveSharedParent(left, right, state.toys, parentsByLegacyIdentity);
    const primary = chooseCurrentCanonicalChild([left, right], parent);
    const duplicate = primary.id === left.id ? right : left;
    const primaryImageBefore = primary.imageRef;
    if (parent && sameImageRef(duplicate.imageRef, parent.imageRef)) duplicate.imageRef = { kind: "placeholder" };
    if (parent) selectOwnedChildImage(primary, duplicate, parent);
    primary.legacyCanonicalKeys = uniqueCanonicalKeys([...primary.legacyCanonicalKeys || [], duplicate.canonicalKey, ...duplicate.legacyCanonicalKeys || []]);
    const mergedResult = mergePersonalToyPair(state, primary.id, duplicate.id);
    if (!mergedResult.merged) {
      failed++;
      executions.push({ kind: item.kind, primaryId: primary.id, duplicateId: duplicate.id, status: "failed" });
      continue;
    }
    if (parent && isParentCover(primary.imageRef, state.toys) && !sameImageRef(primaryImageBefore, parent.imageRef)) primary.imageRef = primaryImageBefore;
    primary.mergeDiagnostics = [.../* @__PURE__ */ new Set([...primary.mergeDiagnostics || [], `root-trace: same_child_legacy_duplicate:${duplicate.id}`])];
    executions.push({ kind: item.kind, primaryId: primary.id, duplicateId: duplicate.id, status: "merged" });
    merged++;
  }
  const relations = auditIdentityRelationships(state.toys || []);
  return {
    detected: queue.length,
    queued: queue.length,
    attempted,
    merged,
    failed,
    executions,
    siblingExcluded: relations.filter((item) => item.kind === "sibling_child").length,
    variantExcluded: relations.filter((item) => item.kind === "related_variant").length
  };
}
function differentKnownSiblingParts(left, right) {
  const leftParent = canonicalKey(left?.set?.parentCanonicalKey);
  const rightParent = canonicalKey(right?.set?.parentCanonicalKey);
  const sameParent = left?.set?.parentId === right?.set?.parentId || leftParent && leftParent === rightParent;
  const leftPart = Number(left?.set?.partIndex || partIndexFromKey(left?.canonicalKey));
  const rightPart = Number(right?.set?.partIndex || partIndexFromKey(right?.canonicalKey));
  return Boolean(sameParent && leftPart && rightPart && leftPart !== rightPart);
}
function auditSetIntegrity(toys = []) {
  const parents = toys.filter((toy) => toy.set?.kind === "parent");
  const children = toys.filter((toy) => toy.set?.kind === "child");
  const byId = new Map(toys.map((toy) => [toy.id, toy]));
  const issues = [];
  for (const child of children) {
    const parent = byId.get(child.set?.parentId);
    if (!parent || parent.set?.kind !== "parent") issues.push({ type: "orphan_child", child });
    else if (sameImageRef(child.imageRef, parent.imageRef)) issues.push({ type: "parent_image_on_child", child, parent });
  }
  return { parents: parents.length, children: children.length, unresolved: issues.length, issues };
}
function findHistoricalChildMatches(toys, parent, child) {
  return toys.filter((toy) => toy.id !== parent.id && toy.set?.kind !== "parent" && isHistoricalChildMatch(toy, parent, child));
}
function isHistoricalChildMatch(toy, parent, child) {
  const childKeys = new Set(uniqueCanonicalKeys([child.canonicalKey, ...child.legacyCanonicalKeys || []]));
  const toyKeys = uniqueCanonicalKeys([toy.canonicalKey, ...toy.legacyCanonicalKeys || []]);
  if (toyKeys.some((key) => childKeys.has(key))) return true;
  const toyPart = Number(toy.set?.partIndex || partIndexFromKey(toy.canonicalKey));
  const childPart = Number(child.set?.partIndex || partIndexFromKey(child.canonicalKey));
  if (toyPart && childPart && toyPart !== childPart) return false;
  const parentKey = canonicalKey(parent.canonicalKey);
  const parentNames = childNameTokens({ productName: parent.productName, names: parent.names, aliases: [parent.set?.setName] });
  const legacySetNames = childNameTokens({ productName: toy.set?.setName, aliases: [toy.parentName, toy.parentKitName] });
  const namedParentLink = parentNames.some((name) => legacySetNames.includes(name));
  const parentLegacyIds = /* @__PURE__ */ new Set([parent.id, ...parent.set?.legacyParentIds || []]);
  const parentKeys = /* @__PURE__ */ new Set([parentKey, ...(parent.legacyCanonicalKeys || []).map(canonicalKey)]);
  const linkedParent = parentLegacyIds.has(toy.set?.parentId) || (toy.set?.legacyParentIds || []).some((id) => parentLegacyIds.has(id)) || [...parentIdentityTokens(toy)].some((key) => parentKeys.has(key)) || toyKeys.some((key) => [...parentKeys].some((parentIdentity) => key.startsWith(`${parentIdentity}-`))) || namedParentLink;
  if (!linkedParent) return false;
  if (String(toy.brand || "") !== String(child.brand || parent.brand || "")) return false;
  const toyNames = childNameTokens(toy);
  const childNames = childNameTokens(child);
  return toyNames.some((token) => childNames.includes(token));
}
function partIndexFromKey(key) {
  const match = canonicalKey(key).match(/(?:part|puzzle)-(\d+)$/);
  return Number(match?.[1] || 0);
}
function childNameTokens(toy = {}) {
  return [...new Set([toy.productName, toy.name, toy.nameEn, toy.nameZh, toy.names?.en, toy.names?.zh, ...toy.aliases || []].flatMap(imageNameForms).map((value) => canonicalKey(value)).filter((value) => value && value.length >= 4))];
}
function chooseBestChild(rows, parent, child) {
  return [...rows].sort((a, b) => childRecordScore(b, parent, child) - childRecordScore(a, parent, child) || String(a.createdAt || "").localeCompare(String(b.createdAt || "")))[0] || null;
}
function chooseCurrentCanonicalChild(rows, parent) {
  const hasBilingualIdentity = rows.some(isBilingualChildIdentity);
  if (hasBilingualIdentity) {
    const explicit = rows.filter((row) => {
      const part = Number(row.set?.partIndex || 0);
      return part && new RegExp(`(?:part|puzzle)-${part}$`).test(canonicalKey(row.canonicalKey));
    });
    if (explicit.length === 1) return explicit[0];
  }
  return chooseBestChild(rows, parent, null);
}
function childRecordScore(toy, parent, child) {
  const sameAsParent = parent ? sameImageRef(toy.imageRef, parent.imageRef) : false;
  const imageQuality = sameAsParent ? 0 : { personal: 40, catalog: 30, remote: 20, placeholder: 0 }[toy.imageRef?.kind] || 0;
  const formalChild = toy.set?.kind === "child" ? 100 : 0;
  const linkedParent = parent && (toy.set?.parentId === parent.id || canonicalKey(toy.set?.parentCanonicalKey) === canonicalKey(parent.canonicalKey)) ? 30 : 0;
  const exactChildKey = child && canonicalKey(toy.canonicalKey) === canonicalKey(child.canonicalKey) ? 20 : 0;
  const declaredPart = Number(toy.set?.partIndex || 0);
  const currentPartKey = declaredPart && isBilingualChildIdentity(child) && new RegExp(`(?:part|puzzle)-${declaredPart}$`).test(canonicalKey(toy.canonicalKey)) ? 25 : 0;
  return formalChild + linkedParent + exactChildKey + currentPartKey + imageQuality + (toy.interest ? 2 : 0) + (toy.notes ? 2 : 0);
}
function isBilingualChildIdentity(child) {
  const text2 = String(child?.productName || "");
  return /[A-Za-z]/.test(text2) && /[\u4e00-\u9fff]/.test(text2);
}
function prefersChildImage(primary, planned, parent) {
  const sameAsParent = sameImageRef(primary.imageRef, parent.imageRef);
  if (sameAsParent) return false;
  return childImagePriority(primary.imageRef) >= childImagePriority(planned.imageRef);
}
function childImagePriority(ref) {
  if (!ref || ref.kind === "placeholder" || ref.kind === "generated") return 0;
  if (ref.kind === "personal") return 4;
  if (ref.kind === "catalog" || ref.verificationStatus === "verified_real" || ref.verificationStatus === "verified") return 3;
  if (ref.kind === "remote") return 2;
  return 0;
}
function selectOwnedChildImage(primary, duplicate, parent, plan = null) {
  const candidates = [primary, duplicate];
  const identity = childImageIdentity(candidates, plan);
  const owned = candidates.map((row) => ({ row, ref: row.imageRef, owned: isOwnedChildImageRef(row.imageRef, identity, parent) })).filter((item) => item.owned).sort((a, b) => childImagePriority(b.ref) - childImagePriority(a.ref));
  if (owned.length) {
    const selected = owned[0];
    primary.imageRef = stampChildImageOwner(selected.ref, primary.canonicalKey);
    if (selected.row.id === duplicate.id) duplicate.imageRef = { kind: "placeholder" };
  } else if (looksLikeParentSetImage(primary.imageRef, parent) || looksLikeParentSetImage(duplicate.imageRef, parent)) {
    if (looksLikeParentSetImage(primary.imageRef, parent)) primary.imageRef = { kind: "placeholder" };
    if (looksLikeParentSetImage(duplicate.imageRef, parent)) duplicate.imageRef = { kind: "placeholder" };
    primary.imageRef = plan?.imageRef || { kind: "placeholder" };
  }
}
function childImageIdentity(rows, plan) {
  return [...new Set([...rows, plan].filter(Boolean).flatMap((row) => [row.productName, row.names?.en, row.names?.zh, ...row.aliases || []]).flatMap(imageNameForms).map(canonicalKey).filter((value) => value && value.length >= 4))];
}
function imageNameForms(value) {
  const text2 = String(value || "").normalize("NFKC").trim();
  if (!text2) return [];
  const latin = (text2.match(/[A-Za-z0-9]+(?:[\s'’&+\-]+[A-Za-z0-9]+)*/g) || []).join(" ");
  const chinese = (text2.match(/[\u4e00-\u9fff0-9]+/g) || []).join("");
  return [text2, latin, chinese].filter(Boolean);
}
function imageRefText(ref) {
  return decodeURIComponent(String(ref?.catalogImageRef || ref?.imageSourceIdentity || ref?.imageOwnerCanonicalKey || ref?.url || "")).replace(/\+/g, " ");
}
function looksLikeParentSetImage(ref, parent) {
  const text2 = canonicalKey(imageRefText(ref));
  const parentNames = imageNameForms(parent?.productName).map(canonicalKey);
  return Boolean(text2 && parentNames.some((name) => name && text2.includes(name)));
}
function isOwnedChildImageRef(ref, identity, parent) {
  if (!ref || ref.kind === "placeholder" || ref.kind === "generated") return false;
  if (ref.kind === "personal") return !sameImageRef(ref, parent?.imageRef);
  const owner = canonicalKey(ref.imageOwnerCanonicalKey || ref.imageSourceIdentity || ref.catalogImageRef || "");
  if (owner && identity.includes(owner)) return true;
  const text2 = canonicalKey(imageRefText(ref));
  return Boolean(text2 && !looksLikeParentSetImage(ref, parent) && identity.some((name) => name && text2.includes(name)));
}
function stampChildImageOwner(ref, canonical) {
  if (!ref || ref.kind === "personal") return ref;
  return { ...ref, imageOwnerCanonicalKey: canonicalKey(canonical) };
}
function sameImageRef(a, b) {
  return JSON.stringify(a || null) === JSON.stringify(b || null);
}
function uniqueCanonicalKeys(values) {
  return [...new Set(values.map(canonicalKey).filter(Boolean))];
}
function isParentCover(ref, toys) {
  return (toys || []).some((toy) => toy.set?.kind === "parent" && sameImageRef(toy.imageRef, ref));
}
function resolveSharedParent(a, b, toys, index) {
  const keys = [...parentIdentityTokens(a), ...parentIdentityTokens(b), a.set?.parentId, b.set?.parentId].filter(Boolean);
  const indexed = keys.map((key) => index.get(key) || index.get(canonicalKey(key))).find(Boolean);
  if (indexed) return indexed;
  const setName = canonicalKey(a.set?.setName || b.set?.setName);
  return (toys || []).find((toy) => toy.set?.kind === "parent" && canonicalKey(toy.productName) === setName) || null;
}
function childSetLink(previous = {}, parent, plan = {}) {
  return {
    kind: "child",
    parentId: parent.id,
    parentCanonicalKey: parent.canonicalKey,
    legacyParentIds: [...previous.legacyParentIds || [], previous.parentId].filter(Boolean),
    setName: parent.productName,
    partIndex: plan.set?.partIndex || previous.partIndex || null,
    childIds: [],
    rotationMode: "split",
    ownershipSource: previous.ownershipSource || null,
    generatedFromParentId: previous.generatedFromParentId || null,
    ownershipGroupId: previous.ownershipGroupId || null,
    detachedFromSet: previous.detachedFromSet === true
  };
}
function establishParentChildOwnership(state) {
  const toys = state.toys || [];
  const parents = toys.filter((toy) => toy.set?.kind === "parent");
  let markedGenerated = 0, preservedIndependent = 0;
  for (const child of toys.filter((toy) => toy.set?.kind === "child")) {
    const parent = parents.find((candidate) => isChildOfParent(child, candidate));
    if (!parent) continue;
    const classification = classifyChildOwnershipForParent(toys, parent, child);
    if (classification.kind !== "generated_from_this_parent") {
      preservedIndependent++;
      continue;
    }
    if (child.set?.ownershipSource === "generated_from_set" && child.set?.generatedFromParentId === parent.id && child.set?.detachedFromSet !== true) continue;
    child.set.ownershipSource = "generated_from_set";
    child.set.generatedFromParentId = parent.id;
    child.set.ownershipGroupId = parent.id;
    child.set.detachedFromSet = false;
    child.set.detachedFromParentOwnershipId = null;
    child.set.detachedAt = null;
    markedGenerated++;
  }
  return { markedGenerated, preservedIndependent };
}
function linkedChildrenForParent(toys = [], parent) {
  return (toys || []).filter((child) => classifyChildOwnershipForParent(toys, parent, child).kind === "generated_from_this_parent");
}
function independentChildrenForParent(toys = [], parent) {
  return (toys || []).filter((child) => {
    const classification = classifyChildOwnershipForParent(toys, parent, child);
    return classification.kind === "independent_ownership" || classification.kind === "explicitly_detached";
  });
}
function classifyChildOwnershipForParent(toys = [], parent = {}, child = {}) {
  if (child.set?.kind !== "child" || !isChildOfParent(child, parent)) return { kind: "unrelated", reason: "not_child_of_parent" };
  const explicit = explicitIndependentEvidence(child);
  if (explicit) return explicit;
  const parentKeys = new Set(uniqueCanonicalKeys([parent.canonicalKey, ...parent.legacyCanonicalKeys || []]));
  const parentIds = new Set([parent.id, ...parent.set?.legacyParentIds || []].filter(Boolean));
  const childKeys = uniqueCanonicalKeys([child.canonicalKey, ...child.legacyCanonicalKeys || []]);
  const canonicalLink = canonicalKey(child.set?.parentCanonicalKey);
  const exactCanonicalParent = parentKeys.has(canonicalLink);
  const historicalParentLink = [child.set?.parentId, child.set?.generatedFromParentId, ...child.set?.legacyParentIds || []].some((id) => parentIds.has(id));
  const plannedChild = (parent.set?.childIds || []).includes(child.id) || childKeys.some((key) => parentKeys.has(key.replace(/(?:-|:)(?:part|puzzle)-\d+$/, "")));
  const hasPart = Number(child.set?.partIndex || partIndexFromKey(child.canonicalKey)) > 0;
  if ((exactCanonicalParent || historicalParentLink) && plannedChild && hasPart) return { kind: "generated_from_this_parent", reason: "exact_parent_identity_plus_split_child_plan" };
  if (child.set?.ownershipSource === "generated_from_set" && child.set?.generatedFromParentId === parent.id && child.set?.detachedFromSet !== true) return { kind: "generated_from_this_parent", reason: "current_generated_ownership_link" };
  return { kind: "independent_ownership", reason: "no_provable_generated_ownership" };
}
function explicitIndependentEvidence(child = {}) {
  const source = child.set?.ownershipSource;
  if (child.set?.detachedFromParentOwnershipId || source === "detached_from_set") return { kind: "explicitly_detached", reason: "explicit_parent_delete_preserve" };
  if (["manual", "catalog", "ai_independent", "user_added", "separate_purchase"].includes(source)) return { kind: "independent_ownership", reason: `explicit_source:${source}` };
  if (child.purchaseDate || Object.keys(child.purchaseMetadata || {}).length || child.userMetadata?.independentOwnership === true) return { kind: "independent_ownership", reason: "independent_purchase_or_user_metadata" };
  return null;
}
function validateChildImageProvenance(child, parent, siblings = []) {
  const ref = child?.imageRef;
  if (!ref || ref.kind === "placeholder" || ref.kind === "generated") return { accepted: false, kind: "placeholder", reason: "no_child_image" };
  if (ref.kind === "personal") {
    if (sameImageRef(ref, parent?.imageRef) || siblings.some((item) => sameImageRef(ref, item.imageRef))) return { accepted: false, kind: "parent_or_sibling", reason: "personal_ref_shared_with_non_child" };
    return { accepted: true, kind: "personal", reason: "personal_child_image" };
  }
  const owner = canonicalKey(ref.imageOwnerCanonicalKey || ref.ownerCanonicalKey || ref.catalogOwnerCanonicalKey || "");
  const childKeys = uniqueCanonicalKeys([child.canonicalKey, ...child.legacyCanonicalKeys || []]);
  if (!owner) return { accepted: false, kind: "unknown", reason: "missing_owner_identity" };
  if (!childKeys.includes(owner)) return { accepted: false, kind: "parent_or_sibling", reason: "owner_identity_does_not_equal_child" };
  if (sameImageRef(ref, parent?.imageRef) || siblings.some((item) => sameImageRef(ref, item.imageRef))) return { accepted: false, kind: "parent_or_sibling", reason: "ref_shared_with_parent_or_sibling" };
  return { accepted: true, kind: "same_child_legacy", reason: "owner_identity_equals_child" };
}
function repairChildImageProvenance(state) {
  const toys = state.toys || [];
  const parents = toys.filter((toy) => toy.set?.kind === "parent");
  const report = { cleared: 0, parentOrSibling: 0, unknown: 0, retainedPersonal: 0, retainedSameChild: 0 };
  for (const child of toys.filter((toy) => toy.set?.kind === "child")) {
    const parent = parents.find((candidate) => isChildOfParent(child, candidate));
    const siblings = toys.filter((other) => other.id !== child.id && parent && isChildOfParent(other, parent));
    const verdict = validateChildImageProvenance(child, parent, siblings);
    if (verdict.accepted) {
      if (verdict.kind === "personal") report.retainedPersonal++;
      else report.retainedSameChild++;
      child.alternateImageRefs = (child.alternateImageRefs || []).filter((ref) => validateChildImageProvenance({ ...child, imageRef: ref }, parent, siblings).accepted);
      continue;
    }
    if (child.imageRef?.kind !== "placeholder") {
      child.imageRef = { kind: "placeholder" };
      report.cleared++;
    }
    child.alternateImageRefs = [];
    if (verdict.kind === "parent_or_sibling") report.parentOrSibling++;
    else report.unknown++;
  }
  return report;
}
function repairLegacyChildImageBindings(state, catalog2 = null) {
  const toys = state.toys || [];
  const parents = toys.filter((toy) => toy.set?.kind === "parent");
  const report = {
    examined: 0,
    changed: 0,
    retainedPersonal: 0,
    retainedVerifiedCatalog: 0,
    clearedSearchDerived: 0,
    clearedStaleLegacyRemote: 0,
    clearedParentOrSet: 0,
    clearedSibling: 0,
    clearedUnknown: 0,
    catalogInheritanceReady: 0
  };
  for (const child of toys.filter((toy) => toy.set?.kind === "child")) {
    report.examined++;
    const parent = parents.find((candidate) => isChildOfParent(child, candidate));
    const siblings = toys.filter((other) => other.id !== child.id && parent && isChildOfParent(other, parent));
    const currentCatalog = catalog2?.resolve?.(child) || null;
    if (sameCatalogChildForImageRepair(child, currentCatalog) && isVerifiedOrStableChildImage(currentCatalog.imageRef)) report.catalogInheritanceReady++;
    const ref = child.imageRef;
    if (ref?.kind === "personal") {
      report.retainedPersonal++;
      continue;
    }
    if (!ref || ref.kind === "placeholder" || ref.kind === "generated") continue;
    const verdict = validateChildImageProvenance(child, parent, siblings);
    if (verdict.accepted && isVerifiedOrStableChildImage(ref)) {
      report.retainedVerifiedCatalog++;
      continue;
    }
    if (isSearchOrTransientChildImage(ref)) report.clearedSearchDerived++;
    else if (parent && sameImageRef(ref, parent.imageRef)) report.clearedParentOrSet++;
    else if (siblings.some((item) => sameImageRef(ref, item.imageRef))) report.clearedSibling++;
    else if (ref.kind === "remote" && verdict.accepted) report.clearedStaleLegacyRemote++;
    else report.clearedUnknown++;
    child.imageRef = { kind: "placeholder" };
    child.alternateImageRefs = (child.alternateImageRefs || []).filter((candidate) => candidate?.kind === "personal" || isVerifiedOrStableChildImage(candidate));
    report.changed++;
  }
  return report;
}
function sameCatalogChildForImageRepair(child, catalogChild) {
  if (child?.set?.kind !== "child" || catalogChild?.set?.kind !== "child") return false;
  const childKeys = uniqueCanonicalKeys([child.canonicalKey, ...child.legacyCanonicalKeys || []]);
  const catalogKeys = uniqueCanonicalKeys([catalogChild.canonicalKey, ...catalogChild.legacyCanonicalKeys || []]);
  if (childKeys.some((key) => catalogKeys.includes(key))) return true;
  const childParent = canonicalKey(child.set?.parentCanonicalKey);
  const catalogParent = canonicalKey(catalogChild.set?.parentCanonicalKey);
  const childPart = Number(child.set?.partIndex || partIndexFromKey(child.canonicalKey));
  const catalogPart = Number(catalogChild.set?.partIndex || partIndexFromKey(catalogChild.canonicalKey));
  return Boolean(childParent && childParent === catalogParent && childPart > 0 && childPart === catalogPart);
}
function isVerifiedOrStableChildImage(ref) {
  if (!ref || ["placeholder", "generated", "personal"].includes(ref.kind) || isSearchOrTransientChildImage(ref)) return false;
  if (ref.kind === "catalog") return true;
  return ["verified", "verified_real", "manually_confirmed"].includes(ref.verificationStatus) || ["verified_real", "stable_remote", "manually_confirmed"].includes(ref.assetState) || ["official_cdn", "stable_retailer", "manually_confirmed"].includes(ref.imageSourceType);
}
function isSearchOrTransientChildImage(ref) {
  const value = String(ref?.catalogImageRef || ref?.url || "");
  return /(?:bing\.net\/th|bing\.com\/images|google(?:usercontent)?\.com\/search|[?&](?:token|expires|signature)=|^(?:blob|data):)/i.test(value) || ["search-fallback", "missing-catalog-metadata"].includes(ref?.source);
}

// src/data/backup-service.js
async function exportBackup(store2, imageRepository) {
  const state = structuredClone(store2.state);
  const imageRefs = state.toys.map((toy) => toy.imageRef).filter((ref) => ref?.kind === "personal" || ref?.kind === "catalog");
  const images2 = {};
  for (const ref of imageRefs) {
    const dataUrl2 = await imageRepository.resolve(ref);
    if (dataUrl2) images2[`${ref.kind}:${ref.id}`] = dataUrl2;
  }
  return { format: "toy-rotation-clean-baseline-backup", schemaVersion: state.schemaVersion, exportedAt: (/* @__PURE__ */ new Date()).toISOString(), state, images: images2 };
}
async function restoreBackup(payload, store2, imageRepository, { catalog: catalog2 = null, onStage = () => {
}, trace: existingTrace = null } = {}) {
  const trace = existingTrace || createRestoreTrace();
  const stage = (name, detail = {}) => {
    trace.mark(name, detail);
    onStage({ name, detail, timing: trace.snapshot() });
  };
  try {
    stage("backup_validation_start", { phase: "start" });
    validateBackupEnvelope(payload);
    stage("backup_validation_end", { phase: "end", imageCount: Object.keys(payload.images || {}).length, toyCount: (payload.state?.toys || []).length });
    stage("detached_staging_start", { phase: "start" });
    const staged = prepareRestoreState(payload.state, catalog2, stage);
    stage("detached_staging_end", { phase: "end", toyCount: staged.state.toys.length });
    stage("backup_image_import_start", { phase: "start" });
    await importBackupImages(payload.images || {}, imageRepository, stage);
    stage("backup_image_import_end", { phase: "end" });
    stage("fake_personal_placeholder_repair_start", { phase: "start" });
    const fakePersonalPlaceholderRepair = await repairFakePersonalPlaceholderBindings(staged.state, { images: imageRepository, catalog: catalog2 });
    staged.summary.fakePersonalPlaceholderRepair = fakePersonalPlaceholderRepair;
    stage("fake_personal_placeholder_repair_end", { phase: "end", changed: fakePersonalPlaceholderRepair.changed });
    stage("image_metadata_validation_start", { phase: "start" });
    validateImageReferences(staged.state, payload.images || {});
    stage("image_metadata_validation_end", { phase: "end" });
    staged.state.catalogState ||= {};
    staged.state.catalogState.syncMetadata ||= {};
    staged.state.catalogState.syncMetadata.restorePipelineR12A = {
      completedAt: (/* @__PURE__ */ new Date()).toISOString(),
      repairedDuplicates: staged.summary.repairedDuplicates,
      remappedIdentities: staged.summary.remappedIdentities,
      repairedHistoricalReferences: staged.summary.historicalReferenceRepair,
      fakePersonalPlaceholderRepair: staged.summary.fakePersonalPlaceholderRepair,
      validated: true,
      timing: trace.snapshot()
    };
    if (typeof store2.commit !== "function") throw new Error("restoreTransactionUnavailable");
    stage("atomic_commit_start", { phase: "start" });
    store2.commit(staged.state, "restore", { onStage: stage });
    stage("atomic_commit_end", { phase: "end", toyCount: store2.state?.toys?.length ?? staged.state.toys.length });
    stage("persistence_complete", { phase: "end" });
    trace.complete();
    onStage({ name: "restore_complete", detail: staged.summary, timing: trace.snapshot() });
    return { ...staged.summary, timing: trace.snapshot() };
  } catch (error) {
    trace.mark("restore_failed", { success: false, errorName: error?.name || "Error", errorMessage: error?.message || "restoreFailed" });
    trace.fail(error);
    onStage({ name: "restore_failed", detail: { code: error?.message || "restoreFailed" }, timing: trace.snapshot() });
    throw error;
  }
}
function prepareRestoreState(input, catalog2 = null, onStage = () => {
}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("invalidBackupState");
  const legacyReferenceIndex = buildLegacyReferenceIndex(input.toys || []);
  onStage("migrations_start", { phase: "start" });
  const state = runMigrations(input);
  onStage("migrations_end", { phase: "end", schemaVersion: state.schemaVersion });
  onStage("identity_normalization_start", { phase: "start" });
  state.toys = (state.toys || []).map(normalizeToy);
  state.wishlist = (state.wishlist || []).map(normalizeWishlistItem);
  onStage("identity_normalization_end", { phase: "end", toyCount: state.toys.length, wishlistCount: state.wishlist.length });
  state.catalogState ||= {};
  state.catalogState.tombstones ||= {};
  state.catalogState.adminEdits ||= {};
  state.catalogState.syncMetadata ||= {};
  const catalogIdentityRedirects = applyCatalogRedirects(state, catalog2);
  const definitions = new Map((catalog2?.active || []).map((row) => [canonicalKey(row.canonicalKey), row]));
  const before = state.toys.length;
  onStage("parent_child_reconciliation_start", { phase: "start", catalogDefinitions: definitions.size });
  const orphanLifecycle = reconcileOrphanedSplitOwnership(state, definitions);
  const reconciliation = reconcileSplitSetChildren(state, definitions);
  const legacyChildImageBindings = repairLegacyChildImageBindings(state, catalog2);
  onStage("parent_child_reconciliation_end", { phase: "end", merged: reconciliation.merged || 0, remapped: reconciliation.remapped || 0 });
  onStage("same_child_merge_start", { phase: "start" });
  onStage("same_child_merge_end", { phase: "end", merged: reconciliation.merged || 0 });
  onStage("historical_reference_repair_start", { phase: "start", roundCount: (state.rotationHistory || []).length });
  const historicalReferenceRepair = repairHistoricalReferences(state, { legacyReferenceIndex, reconciliation });
  onStage("historical_reference_repair_end", {
    phase: "end",
    remapped: historicalReferenceRepair.remapped,
    markedMissing: historicalReferenceRepair.markedMissing,
    affectedRounds: historicalReferenceRepair.affectedRounds
  });
  onStage("state_validation_start", { phase: "start" });
  const validation = validateRestoredState(state, catalog2);
  onStage("state_validation_end", { phase: "end", ...validation });
  return {
    state,
    summary: {
      inputToyCount: before,
      outputToyCount: state.toys.length,
      repairedDuplicates: Math.max(0, before - state.toys.length),
      remappedIdentities: reconciliation.remapped || 0,
      parentChildReconciliation: reconciliation,
      legacyChildImageBindings,
      orphanLifecycle,
      historicalReferenceRepair,
      catalogIdentityRedirects,
      validation
    }
  };
}
function applyCatalogRedirects(state, catalog2) {
  if (!catalog2?.getByKey) return { remappedToys: 0, remappedWishlist: 0 };
  let remappedToys = 0, remappedWishlist = 0;
  for (const toy of state.toys || []) {
    const target = catalog2.getByKey(toy.canonicalKey);
    if (!target || canonicalKey(target.canonicalKey) === canonicalKey(toy.canonicalKey)) continue;
    redirectCrossAgeApproval(state, canonicalKey(toy.canonicalKey), canonicalKey(target.canonicalKey));
    toy.legacyCanonicalKeys = [.../* @__PURE__ */ new Set([...toy.legacyCanonicalKeys || [], canonicalKey(toy.canonicalKey)])];
    toy.canonicalKey = target.canonicalKey;
    remappedToys++;
  }
  for (const item of state.wishlist || []) {
    const requested = item.canonicalKey || item.catalogKey || item.catalogId;
    const target = catalog2.getByKey(requested);
    if (!target || canonicalKey(target.canonicalKey) === canonicalKey(requested)) continue;
    item.canonicalKey = target.canonicalKey;
    item.catalogId = target.canonicalKey;
    if (item.catalogSnapshot) {
      item.catalogSnapshot.legacyCanonicalKeys = [.../* @__PURE__ */ new Set([...item.catalogSnapshot.legacyCanonicalKeys || [], canonicalKey(requested)])];
      item.catalogSnapshot.canonicalKey = target.canonicalKey;
    }
    remappedWishlist++;
  }
  reconcileCrossAgeApprovals(state, (key) => catalog2.getByKey(key));
  return { remappedToys, remappedWishlist };
}
function validateBackupEnvelope(payload) {
  if (!payload || payload.format !== "toy-rotation-clean-baseline-backup") throw new Error("unsupportedBackup");
  if (!payload.state || typeof payload.state !== "object" || Array.isArray(payload.state)) throw new Error("invalidBackupState");
  if (payload.images != null && (typeof payload.images !== "object" || Array.isArray(payload.images))) throw new Error("invalidBackupImages");
}
function validateRestoredState(state, catalog2) {
  const ids = /* @__PURE__ */ new Set();
  for (const toy of state.toys || []) {
    if (!toy.id || ids.has(toy.id)) throw new Error("restoreDuplicateToyId");
    ids.add(toy.id);
    if (!canonicalKey(toy.canonicalKey)) throw new Error("restoreMissingCanonicalIdentity");
  }
  if (!validateSetGraph(state.toys || [])) throw new Error("restoreInvalidSetGraph");
  const remainingSameChild = findDuplicates(state.toys || []).filter((row) => row.kind === "same_child_legacy_duplicate");
  if (remainingSameChild.length) throw new Error("restoreUnresolvedLegacyDuplicate");
  for (const round of state.rotationHistory || []) {
    if ((round.toyIds || []).some((id) => !ids.has(id))) throw new Error("restoreUnrepairedHistoricalReference");
    if (round.toyId && !ids.has(round.toyId)) throw new Error("restoreUnrepairedHistoricalReference");
  }
  const catalogKeys = new Set((catalog2?.active || []).flatMap((row) => [row.canonicalKey, ...row.legacyCanonicalKeys || []]).map(canonicalKey));
  const unresolvedWishlist = (state.wishlist || []).filter((item) => {
    const key = canonicalKey(item.canonicalKey || item.catalogKey || item.catalogId);
    return !key || catalogKeys.size && !catalogKeys.has(key) && !item.catalogSnapshot;
  });
  if (unresolvedWishlist.length) throw new Error("restoreOrphanWishlistReference");
  return { toyCount: ids.size, setGraph: true, legacyDuplicateCount: 0, wishlistReferences: true };
}
function repairHistoricalReferences(state, { legacyReferenceIndex = /* @__PURE__ */ new Map(), reconciliation = {} } = {}) {
  const currentById = new Map((state.toys || []).map((toy) => [toy.id, toy]));
  const currentByKey = /* @__PURE__ */ new Map();
  for (const toy of state.toys || []) {
    for (const key of [toy.canonicalKey, ...toy.legacyCanonicalKeys || []].map(canonicalKey).filter(Boolean)) {
      if (currentByKey.has(key) && currentByKey.get(key).id !== toy.id) currentByKey.set(key, null);
      else currentByKey.set(key, toy);
    }
  }
  const idMap = /* @__PURE__ */ new Map();
  for (const execution of reconciliation.mergeExecutions || []) {
    if (execution.status === "merged" && execution.duplicateId && execution.primaryId) idMap.set(execution.duplicateId, execution.primaryId);
  }
  const diagnostics = [];
  let remapped = 0;
  let markedMissing = 0;
  let affectedRounds = 0;
  for (const round of state.rotationHistory || []) {
    const ids = Array.isArray(round.toyIds) ? round.toyIds : [];
    const repairedIds = [];
    const seen = /* @__PURE__ */ new Set();
    const missing = [];
    for (const originalId of ids) {
      const result2 = resolveHistoricalToyReference(originalId, currentById, currentByKey, idMap, legacyReferenceIndex);
      if (result2.toyId) {
        if (!seen.has(result2.toyId)) repairedIds.push(result2.toyId);
        seen.add(result2.toyId);
        if (result2.toyId !== originalId) {
          remapped++;
          diagnostics.push({ originalToyId: originalId, remappedToyId: result2.toyId, action: "remapped", reason: result2.reason, historyEntryId: round.id || null, at: round.at || null });
        }
      } else {
        markedMissing++;
        missing.push(originalId);
        diagnostics.push({ originalToyId: originalId, remappedToyId: null, action: "marked_missing", reason: "historical_toy_missing", historyEntryId: round.id || null, at: round.at || null });
      }
    }
    let singular = null;
    if (round.toyId) singular = resolveHistoricalToyReference(round.toyId, currentById, currentByKey, idMap, legacyReferenceIndex);
    const changed = missing.length || ids.some((id, index) => repairedIds[index] !== id) || Boolean(round.toyId && singular?.toyId !== round.toyId);
    if (!changed) continue;
    affectedRounds++;
    round.toyIds = repairedIds;
    if (round.toyId) {
      if (singular?.toyId) {
        const originalSingularId = round.toyId;
        round.toyId = singular.toyId;
        if (singular.toyId !== originalSingularId) {
          remapped++;
          diagnostics.push({ originalToyId: originalSingularId, remappedToyId: singular.toyId, action: "remapped", reason: singular.reason, historyEntryId: round.id || null, at: round.at || null });
        }
      } else {
        const originalSingularId = round.toyId;
        missing.push(originalSingularId);
        markedMissing++;
        diagnostics.push({ originalToyId: originalSingularId, remappedToyId: null, action: "marked_missing", reason: "historical_toy_missing", historyEntryId: round.id || null, at: round.at || null });
        delete round.toyId;
      }
    }
    if (missing.length) {
      round.historicalReferenceStatus = "historical_toy_missing";
      round.historicalMissingToyIds = [.../* @__PURE__ */ new Set([...round.historicalMissingToyIds || [], ...missing])];
    }
  }
  const summary2 = { remapped, markedMissing, affectedRounds, diagnostics };
  state.catalogState ||= {};
  state.catalogState.syncMetadata ||= {};
  state.catalogState.syncMetadata.restoreHistoricalReferenceRepair = { repairedAt: (/* @__PURE__ */ new Date()).toISOString(), ...summary2 };
  return summary2;
}
function resolveHistoricalToyReference(originalId, currentById, currentByKey, idMap, legacyReferenceIndex) {
  if (currentById.has(originalId)) return { toyId: originalId, reason: "current_toy_id" };
  const mergedId = idMap.get(originalId);
  if (mergedId && currentById.has(mergedId)) return { toyId: mergedId, reason: "merge_remap" };
  const keys = legacyReferenceIndex.get(String(originalId)) || [];
  const candidates = [...new Set(keys.map((key) => currentByKey.get(canonicalKey(key))).filter(Boolean))];
  if (candidates.length === 1) return { toyId: candidates[0].id, reason: "legacy_canonical_identity" };
  return { toyId: null, reason: "historical_toy_missing" };
}
function buildLegacyReferenceIndex(toys) {
  const index = /* @__PURE__ */ new Map();
  for (const toy of toys || []) {
    const keys = [toy.canonicalKey, toy.catalogKey, toy.catalogId, toy.key, ...toy.legacyCanonicalKeys || []].map(canonicalKey).filter(Boolean);
    const ids = [toy.id, toy.legacyId, toy.legacyToyId, toy.originalId, toy.userMetadata?.legacyId].filter((value) => value != null).map(String);
    for (const id of ids) index.set(id, [.../* @__PURE__ */ new Set([...index.get(id) || [], ...keys])]);
  }
  return index;
}
function validateImageReferences(state, backupImages) {
  const backupKeys = new Set(Object.keys(backupImages || {}));
  for (const toy of state.toys || []) {
    const ref = toy.imageRef;
    if (!ref || ["placeholder", "generated", "remote"].includes(ref.kind)) continue;
    if (!["personal", "catalog"].includes(ref.kind) || !ref.id) throw new Error("restoreInvalidImageReference");
    const backupKey = `${ref.kind}:${ref.id}`;
    if (backupKeys.size && backupKeys.has(backupKey) && !backupImages[backupKey]) throw new Error("restoreMissingImageAsset");
  }
}
async function importBackupImages(images2, repository, stage) {
  const entries2 = Object.entries(images2).filter(([key, value]) => key && value);
  for (let index = 0; index < entries2.length; index++) {
    const [key, dataUrl2] = entries2[index];
    const [kind, ...rest] = key.split(":");
    const id = rest.join(":");
    if (kind === "catalog") await repository.importCatalog(id, dataUrl2);
    else if (kind === "personal") await repository.importPersonal(id, dataUrl2);
    else await repository.importPersonal(key, dataUrl2);
    if (index % 3 === 2 || index === entries2.length - 1) {
      stage("local_image_import_progress", { phase: "progress", completed: index + 1, total: entries2.length });
      await yieldToUi();
    }
  }
}
function yieldToUi() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
function createRestoreTrace() {
  const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
  const trace = { startedAt: (/* @__PURE__ */ new Date()).toISOString(), stages: [], status: "running", latestStage: "started" };
  const now3 = () => Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt);
  const snapshot = () => ({ startedAt: trace.startedAt, status: trace.status, latestStage: trace.latestStage, completedAtMs: trace.completedAtMs, failedAtMs: trace.failedAtMs, error: trace.error, stages: trace.stages.map((stage) => ({ ...stage })) });
  const publish = () => {
    globalThis.__TOY_ROTATION_RESTORE_TIMING__ = snapshot();
  };
  trace.mark = (name, detail = {}) => {
    const atMs = now3();
    const previous = trace.stages.at(-1);
    trace.latestStage = name;
    trace.stages.push({ name, timestamp: (/* @__PURE__ */ new Date()).toISOString(), atMs, sincePreviousMs: previous ? atMs - previous.atMs : atMs, success: detail.success !== false, detail });
    publish();
  };
  trace.snapshot = snapshot;
  trace.complete = () => {
    trace.status = "complete";
    trace.completedAtMs = now3();
    publish();
  };
  trace.fail = (error) => {
    trace.status = "failed";
    trace.error = error?.message || "restoreFailed";
    trace.failedAtMs = now3();
    publish();
  };
  publish();
  return trace;
}

// src/data/image-repository.js
var LEGACY_DB = "toyRotationPhotosV04";
var LEGACY_STORE = "photos";
var CATALOG_PREFIX = "catalog:";
var PERSONAL_PREFIX = "personal:";
var ImageRepository = class {
  #cache = /* @__PURE__ */ new Map();
  #database = null;
  async resolve(ref) {
    if (!ref || ref.kind === "placeholder") return null;
    if (ref.kind === "generated") return generatedCatalogFallback(ref);
    if (ref.kind === "packaged") return packagedAssetUrl(ref);
    const cacheKey = ref.kind === "remote" ? ref.url : `${ref.kind}:${ref.id}`;
    if (this.#cache.has(cacheKey)) return this.#cache.get(cacheKey);
    const stored = ref.kind === "remote" ? ref.url : await this.#read(ref.id);
    const value = await normalizeStoredImage(stored);
    this.#cache.set(cacheKey, value || null);
    return value || null;
  }
  async savePersonal(dataUrl2, id = crypto.randomUUID()) {
    const key = `${PERSONAL_PREFIX}${id}`;
    await this.#write(key, dataUrl2);
    this.#cache.set(`personal:${key}`, dataUrl2);
    return { kind: "personal", id: key };
  }
  async importPersonal(id, dataUrl2) {
    await this.#write(id, dataUrl2);
    this.#cache.set(`personal:${id}`, dataUrl2);
    return { kind: "personal", id };
  }
  async importCatalog(id, dataUrl2) {
    await this.#write(id, dataUrl2);
    this.#cache.set(`catalog:${id}`, dataUrl2);
    return { kind: "catalog", id };
  }
  async saveCatalog(dataUrl2, canonicalKey2) {
    if (!dataUrl2 || !canonicalKey2) throw new Error("Catalog image and canonical key are required");
    const id = `${CATALOG_PREFIX}${canonicalKey2}`;
    await this.#write(id, dataUrl2);
    this.#cache.set(`catalog:${id}`, dataUrl2);
    return { kind: "catalog", id };
  }
  async copyToCatalog(personalRef, canonicalKey2) {
    const raw = await this.resolve(personalRef);
    if (!raw) throw new Error("No personal image available to copy");
    const id = `${CATALOG_PREFIX}${canonicalKey2}`;
    await this.#write(id, raw);
    this.#cache.set(`catalog:${id}`, raw);
    return { kind: "catalog", id };
  }
  async removePersonal(ref) {
    if (ref?.kind !== "personal") return;
    await this.#delete(ref.id);
    this.#cache.delete(`personal:${ref.id}`);
  }
  async copyToPersonal(ref) {
    const raw = await this.resolve(ref);
    if (!raw) return null;
    if (ref?.kind !== "remote") return this.savePersonal(raw);
    try {
      const response = await fetch(raw);
      if (!response.ok) throw new Error("image download failed");
      const blob = await response.blob();
      return this.savePersonal(await blobToDataUrl(blob));
    } catch {
      return { kind: "remote", url: raw };
    }
  }
  async findLegacyPersonal(ids = [], toyId = "") {
    const normalizedIds = [...new Set(ids.flatMap(imageIdVariants).filter(Boolean))];
    for (const id of normalizedIds) {
      const raw = await this.resolve({ kind: "personal", id });
      if (raw) return raw;
    }
    const records = await this.#readAll();
    const needle = String(toyId || "").toLowerCase();
    for (const { key, value } of records) {
      const metadata = typeof value === "object" ? JSON.stringify(value).toLowerCase() : "";
      const keyText = String(key || "").toLowerCase();
      if (!normalizedIds.some((id) => keyText.includes(String(id).toLowerCase())) && (!needle || !metadata.includes(needle))) continue;
      const raw = await normalizeStoredImage(value);
      if (raw) return raw;
    }
    return null;
  }
  async listPersonalRecords() {
    const records = await this.#readAll();
    const normalized2 = await Promise.all(records.map(async ({ key, value }) => ({
      id: String(key || ""),
      raw: await normalizeStoredImage(value),
      metadata: typeof value === "object" ? JSON.stringify(value).toLowerCase() : ""
    })));
    return normalized2.filter((record) => record.raw && !record.id.startsWith(CATALOG_PREFIX));
  }
  async #db() {
    if (!this.#database) this.#database = new Promise((resolve, reject) => {
      const request = indexedDB.open(LEGACY_DB, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(LEGACY_STORE)) request.result.createObjectStore(LEGACY_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return this.#database;
  }
  async #read(key) {
    const db = await this.#db();
    return new Promise((resolve, reject) => {
      const request = db.transaction(LEGACY_STORE).objectStore(LEGACY_STORE).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
  async #readAll() {
    const db = await this.#db();
    return new Promise((resolve, reject) => {
      const store2 = db.transaction(LEGACY_STORE).objectStore(LEGACY_STORE);
      const keys = store2.getAllKeys();
      const values = store2.getAll();
      let resolvedKeys = [];
      let resolvedValues = [];
      let completed = 0;
      const complete = () => {
        if (++completed === 2) resolve(resolvedKeys.map((key, index) => ({ key, value: resolvedValues[index] })));
      };
      keys.onsuccess = () => {
        resolvedKeys = keys.result || [];
        complete();
      };
      values.onsuccess = () => {
        resolvedValues = values.result || [];
        complete();
      };
      keys.onerror = () => reject(keys.error);
      values.onerror = () => reject(values.error);
    });
  }
  async #write(key, value) {
    const db = await this.#db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(LEGACY_STORE, "readwrite");
      tx.objectStore(LEGACY_STORE).put(value, key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }
  async #delete(key) {
    const db = await this.#db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(LEGACY_STORE, "readwrite");
      tx.objectStore(LEGACY_STORE).delete(key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }
};
function packagedAssetUrl(ref = {}) {
  const path = String(ref.path || "").replace(/\\/g, "/");
  if (!/^catalog-assets\/[a-z0-9][a-z0-9._-]*\.(?:svg|png|webp|jpe?g)$/i.test(path)) return null;
  const base = globalThis.document?.baseURI || globalThis.location?.href;
  return base ? new URL(path, base).href : `./${path}`;
}
function generatedCatalogFallback(ref) {
  const brand = escapeXml(String(ref.brand || "Toy Rotation").slice(0, 34));
  const label = escapeXml(String(ref.label || "Catalog item").slice(0, 52));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="520" viewBox="0 0 520 520"><rect width="520" height="520" rx="48" fill="#f5efff"/><rect x="36" y="36" width="448" height="448" rx="36" fill="#fff" stroke="#d6c6f5" stroke-width="8"/><circle cx="260" cy="180" r="72" fill="#8e63dc"/><path d="M222 180h76M260 142v76" stroke="#fff" stroke-width="18" stroke-linecap="round"/><text x="260" y="320" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="28" fill="#3a3151">${brand}</text><text x="260" y="365" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" fill="#6b6280">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
function escapeXml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
}
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
async function normalizeStoredImage(value) {
  if (!value) return null;
  if (value instanceof Blob) return blobToDataUrl(value);
  if (typeof value === "object") return value.dataUrl || value.data || value.url || null;
  return value;
}
function imageIdVariants(value) {
  const id = String(value || "");
  if (!id) return [];
  const bare = id.replace(/^(personal:|photo:|image:)/, "");
  return [id, bare, `personal:${bare}`, `photo:${bare}`, `image:${bare}`];
}

// src/domain/catalog-presentation.js
var MECHANIC_RULES = Object.freeze({
  jigsaw: ["\u62FC\u56FE", "puzzle"],
  matching_sorting: ["\u914D\u5BF9", "matching", "\u5206\u7C7B", "sorting", "sorter"],
  maze_logic: ["\u8FF7\u5BAB", "maze", "\u6570\u72EC", "sudoku", "logic game"],
  magnetic_build: ["\u78C1\u529B\u7247", "magnetic tile", "magnetic stick"],
  blocks_build: ["\u79EF\u6728", "building block", "blocks"],
  marble_track: ["\u6EDA\u73E0", "marble", "\u7403\u9053", "\u8F68\u9053", "track"],
  screw_bolt_tool: ["\u87BA\u4E1D", "\u87BA\u6BCD", "\u87BA\u6813", "screw", "bolt", "nuts", "\u5DE5\u5177\u53F0", "workbench", "tool set"],
  threading_lacing: ["\u7A7F\u7EBF", "\u4E32\u73E0", "lacing", "threading", "bead"],
  stack_balance: ["\u5806\u53E0", "stack", "\u5E73\u8861\u6E38\u620F", "balance game"],
  drawing_art: ["\u753B\u753B", "\u7ED8\u753B", "drawing", "paint", "\u6C34\u753B", "doodle", "art set"],
  music_play: ["\u4E50\u5668", "\u97F3\u4E50", "music", "piano", "\u9F13", "drum", "\u7434"],
  pretend_role: ["\u8FC7\u5BB6\u5BB6", "\u89D2\u8272\u626E\u6F14", "pretend", "role play", "role-play", "playset"],
  care_doll: ["\u5A03\u5A03", "baby doll", "doll care"],
  cleaning: ["\u6253\u626B", "\u6E05\u6D01", "cleaning", "broom", "mop"],
  cooking_serving: ["\u53A8\u623F", "\u53A8\u5177", "\u70F9\u996A", "\u505A\u996D", "\u5496\u5561\u673A", "\u9910\u5177", "kitchen", "cooking", "coffee", "tea set", "food play"],
  medical_care: ["\u533B\u751F", "\u533B\u7597", "doctor", "medical", "dentist", "vet", "\u517D\u533B"],
  shop_service: ["\u5546\u5E97", "\u6536\u94F6", "\u8D85\u5E02", "shop", "store", "cash register", "market"],
  repair_build_role: ["\u7EF4\u4FEE", "\u4FEE\u7406", "\u5DE5\u5177", "repair", "mechanic", "workbench"],
  ride_balance: ["\u6ED1\u677F\u8F66", "scooter", "\u626D\u626D\u8F66", "ride-on", "balance bike", "\u6447\u9A6C", "rocking horse"],
  pull_push_walk: ["\u62D6\u62C9", "pull along", "\u63A8\u884C", "push toy", "\u5B66\u6B65", "walker"],
  throw_catch_ball: ["\u6295\u63B7", "\u629B\u63A5", "throw", "catch", "ball game", "\u7BEE\u7403", "basketball", "\u4FDD\u9F84\u7403", "bowling"]
});
function deriveCatalogMechanics(toy) {
  const text2 = normalize([toy.productName, toy.names?.en, toy.names?.zh, toy.brand, ...toy.aliases].filter(Boolean).join(" "));
  const derived = Object.entries(MECHANIC_RULES).filter(([, words]) => words.some((word) => text2.includes(normalize(word)))).map(([code]) => code);
  return [.../* @__PURE__ */ new Set([...toy.playMechanics || [], ...derived])];
}
function catalogImageRef(toy) {
  if (toy.imageRef?.kind && toy.imageRef.kind !== "placeholder" && !String(toy.imageRef.url || "").startsWith("./catalog-images/")) return {
    ...toy.imageRef,
    // Catalog-owned repository references already have a stable identity in
    // `id`; do not decorate them into a different presentation shape. Remote
    // assets carry provenance metadata because their URL is the resolver key.
    ...toy.imageRef.kind === "remote" || toy.imageRef.catalogImageRef ? {
      catalogImageRef: toy.imageRef.catalogImageRef || toy.imageRef.url || null,
      imageSource: toy.imageRef.imageSource || toy.imageRef.source || null,
      imageSourceType: toy.imageRef.imageSourceType || "stable_remote"
    } : {},
    assetState: toy.imageRef.assetState || (toy.imageRef.kind === "remote" ? "stable_remote" : "manually_confirmed"),
    verificationStatus: toy.imageRef.verificationStatus || (toy.imageRef.kind === "remote" ? "unverified" : "manually_confirmed"),
    updatedAt: toy.imageRef.updatedAt || null
  };
  const name = toy.names?.en || toy.productName;
  if (!name) return { kind: "placeholder" };
  return { kind: "generated", label: name, brand: toy.brand, source: "missing-catalog-metadata", assetState: "placeholder", verificationStatus: "missing_metadata", updatedAt: null };
}
function resolvedLibraryImageRef(toy, catalog2, parentImageRef = null) {
  const parent = toy?.set?.kind === "child" ? { imageRef: parentImageRef, canonicalKey: toy.set.parentCanonicalKey } : null;
  const stored = toy?.set?.kind === "child" ? validateChildImageProvenance(toy, parent) : null;
  if (toy?.imageRef?.kind === "personal" && (toy?.set?.kind !== "child" || stored?.accepted)) return toy.imageRef;
  const catalogToy = catalog2?.resolve?.(toy);
  const catalogImage = catalogToy?.imageRef;
  if (catalogImage && (toy?.set?.kind !== "child" || sameChildCatalogIdentity(toy, catalogToy) && isVerifiedOrStableCatalogImage(catalogImage))) return catalogImage;
  if (toy?.set?.kind === "child" && isChildCatalogImage(toy.imageRef) && stored?.accepted && isVerifiedOrStableCatalogImage(toy.imageRef)) return toy.imageRef;
  return toy?.set?.kind === "child" ? { kind: "placeholder" } : toy?.imageRef || { kind: "placeholder" };
}
function isChildCatalogImage(ref) {
  return Boolean(ref && ref.kind !== "placeholder" && ref.kind !== "generated" && (ref.catalogImageRef || ref.kind === "catalog" || ref.kind === "remote" || ref.kind === "packaged"));
}
function isVerifiedOrStableCatalogImage(ref) {
  if (!isChildCatalogImage(ref) || isSearchOrTransientImage(ref)) return false;
  if (ref.kind === "catalog") return true;
  return ["verified", "verified_real", "manually_confirmed"].includes(ref.verificationStatus) || ["verified_real", "stable_remote", "manually_confirmed"].includes(ref.assetState) || ["official_cdn", "stable_retailer", "manually_confirmed"].includes(ref.imageSourceType);
}
function isSearchOrTransientImage(ref) {
  const value = String(ref?.catalogImageRef || ref?.url || "");
  return /(?:bing\.net\/th|bing\.com\/images|google(?:usercontent)?\.com\/search|[?&](?:token|expires|signature)=|^(?:blob|data):)/i.test(value) || ["search-fallback", "missing-catalog-metadata"].includes(ref?.source);
}
function sameChildCatalogIdentity(toy, catalogToy) {
  if (toy?.set?.kind !== "child" || catalogToy?.set?.kind !== "child") return false;
  const toyKeys = identityKeys(toy);
  const catalogKeys = identityKeys(catalogToy);
  if (toyKeys.some((key) => catalogKeys.includes(key))) return true;
  const toyParent = canonicalIdentity(toy?.set?.parentCanonicalKey);
  const catalogParent = canonicalIdentity(catalogToy?.set?.parentCanonicalKey);
  const toyPart = Number(toy?.set?.partIndex || partIndexFromKey2(toy?.canonicalKey));
  const catalogPart = Number(catalogToy?.set?.partIndex || partIndexFromKey2(catalogToy?.canonicalKey));
  return Boolean(toyParent && toyParent === catalogParent && toyPart > 0 && toyPart === catalogPart);
}
function identityKeys(value) {
  return [...new Set([value?.canonicalKey, ...value?.legacyCanonicalKeys || []].map(canonicalIdentity).filter(Boolean))];
}
function partIndexFromKey2(value) {
  return String(value || "").match(/(?:-|:)(?:part|puzzle)?-?(\d+)$/i)?.[1] || 0;
}
function normalize(value) {
  return String(value || "").normalize("NFKC").toLowerCase().replace(/[\s_\-–—/:：·.,，()（）]+/g, " ").trim();
}
function canonicalIdentity(value) {
  return String(value?.canonicalKey || value || "").normalize("NFKC").toLowerCase();
}

// src/data/catalog-image-assets-batch1.js
var BATCH1_OFFICIAL_IMAGE_ROWS = Object.freeze([
  ["btoys-critter-clinic", "https://mybtoys.com/wp-content/uploads/BX2015_PR.png", "https://mybtoys.com/shop/critter-clinic/"],
  ["btoys-happy-cruisers", "https://mybtoys.com/wp-content/uploads/BX1944_PR-1024x1024.png", "https://mybtoys.com/shop/happy-cruisers/"],
  ["btoys-hellophone", "https://mybtoys.com/wp-content/uploads/BX1030_PR.jpg", "https://mybtoys.com/shop/hellophone/"],
  ["btoys-meowsic-keyboard", "https://mybtoys.com/wp-content/uploads/BX1025_PR.png", "https://mybtoys.com/shop/meowsic/"],
  ["btoys-one-two-squeeze", "https://mybtoys.com/wp-content/uploads/BX1002_pr.jpg", "https://mybtoys.com/shop/one-two-squeeze/"],
  ["btoys-parum-pum-pum-drum", "https://mybtoys.com/wp-content/uploads/BX1007-PR-md-wht.jpg", "https://mybtoys.com/shop/parum-pum-pum/"],
  ["btoys-pop-arty-beads", "https://mybtoys.com/wp-content/uploads/BX1254Z-pr.jpg", "https://mybtoys.com/shop/pop-arty/"],
  ["btoys-shapely-color-puzzle", "https://mybtoys.com/wp-content/uploads/LB1897_PR-1024x1024.png", "https://mybtoys.com/shop/shapely-color-puzzle/"],
  ["btoys-symphony-in-b", "https://mybtoys.com/wp-content/uploads/BX1977_PR_HS.jpg", "https://mybtoys.com/shop/symphony-in-b/"],
  ["btoys-whirly-pop", "https://mybtoys.com/wp-content/uploads/BX1464_pr.jpg", "https://mybtoys.com/shop/whirly-pop/"],
  ["btoys-woofer-guitar", "https://mybtoys.com/wp-content/uploads/BX1166-pr-B-2.jpg", "https://mybtoys.com/shop/woofer/"],
  ["btoys-zany-zoo", "https://mybtoys.com/wp-content/uploads/BX1004_Pr.jpg", "https://mybtoys.com/shop/zany-zoo/"],
  ["hape-alphabet-learning-pack", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Alphabet-Learning-Pack-Hape-63551964.png?v=1772696463", "https://toys.hape.com/products/hape-alphabet-learning-pack"],
  ["hape-animal-pairs-puzzles", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Animal-Pairs-Puzzles-Hape-Toy-Market-58414375.jpg?v=1747720873", "https://toys.hape.com/products/animal-pairs-puzzles"],
  ["hape-baby-drum", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Baby-Drum-Hape-Toy-Market-44303257.jpg?v=1747721342", "https://toys.hape.com/products/baby-drum"],
  ["hape-beaded-raindrops", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Beaded-Raindrops-Hape-Toy-Market-44314116.jpg?v=1747721348", "https://toys.hape.com/products/beaded-raindrops-blue"],
  ["hape-beep-buy-cash-register", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Beep-_n_-Buy-Cash-Register-Hape-Toy-Market-44296814.jpg?v=1747721155", "https://toys.hape.com/products/beep-buy-cash-register"],
  ["hape-build-it-tool-box", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Build-It-Tool-Box-Hape-60748249.png?v=1756176392", "https://toys.hape.com/products/build-it-tool-box"],
  ["hape-chunky-alphabet-puzzle", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Chunky-Alphabet-Puzzle-Hape-Toy-Market-44307964.jpg?v=1747721357", "https://toys.hape.com/products/chunky-alphabet-puzzle"],
  ["hape-city-fire-station", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-City-Fire-Station-Hape-Toy-Market-44313275.jpg?v=1747721360", "https://toys.hape.com/products/city-fire-station"],
  ["hape-clean-up-broom-set", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Clean-Up-Broom-Set-Hape-Toy-Market-44314537.jpg?v=1747721057", "https://toys.hape.com/products/clean-up-broom-set"],
  ["hape-clean-up-bucket-set", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Clean-Up-Bucket-Set-Hape-Toy-Market-44313885.jpg?v=1747721025", "https://toys.hape.com/products/clean-up-bucket-set"],
  ["hape-cooking-essentials", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Cooking-Essentials-Hape-60680528.jpg?v=1755922128", "https://toys.hape.com/products/cooking-essentials"],
  ["hape-creatives-peg-puzzle", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Creative-Peg-Puzzle-Hape-Toy-Market-44321295.jpg?v=1747721370", "https://toys.hape.com/products/creative-peg-puzzle"],
  ["hape-deluxe-experiment-kit", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Deluxe-Experiment-Kit-Hape-60677749.jpg?v=1755920930", "https://toys.hape.com/products/deluxe-experiment-kit"],
  ["hape-dinosaur-railway-adventure", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Dinosaur-Railway-Adventure-Set-Hape-Toy-Market-57985230.jpg?v=1747720933", "https://toys.hape.com/products/hape-dinosour-set"],
  ["hape-doctor-on-call", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Doctor-On-Call-Hape-60675471.jpg?v=1755920866", "https://toys.hape.com/products/doctor-on-call"],
  ["hape-explore-learn-magic-cube", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Explore-and-Learn-Magic-Cube-Hape-60748992.jpg?v=1756176826", "https://toys.hape.com/products/explore-and-learn-magic-cube"],
  ["hape-fire-truck-playset", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Fire-Truck-Playset-Hape-Toy-Market-44338927.jpg?v=1747721387", "https://toys.hape.com/products/fire-rescue-team"],
  ["hape-fix-it-tool-box", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Fix-It-Kid_s-Wooden-Tool-Box-and-Accessory-Play-Set-Hape-Toy-Market-44336870.webp?v=1747721389", "https://toys.hape.com/products/fix-it-tool-box"],
  ["hape-gearhead-stunt-garage", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Gearhead-Stunt-Garage-Wooden-High-Rise-Car-Parking-Lot-Hape-Toy-Market-44348120.jpg?v=1747721233", "https://toys.hape.com/products/e3019"],
  ["hape-geometric-rattle-trio", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Geometric-Rattle-Trio-Hape-Toy-Market-44347497.jpg?v=1747721395", "https://toys.hape.com/products/geometric-rattle-trio"],
  ["hape-gourmet-kitchen-fridge", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Gourmet-Kitchen-Wooden-Fridge-Hape-Toy-Market-57985195.jpg?v=1747721331", "https://toys.hape.com/products/white-fridge-freezer"],
  ["hape-green-thumbs-activity-cube", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Green-Thumbs-Activity-Cube-Hape-63544666.png?v=1772694950", "https://toys.hape.com/products/hape-green-thumbs-activity-cube"],
  ["hape-happy-farm-playset", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Happy-Farm-Playset-Hape-63589079.png?v=1772955860", "https://toys.hape.com/products/hape-happy-farm-playset"],
  ["hape-jungle-maze", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Jungle-Maze-Hape-60674267.jpg?v=1755920547", "https://toys.hape.com/products/jungle-maze"],
  ["hape-lock-learn-playboard", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Learning-board-Hape-Toy-Market-47290546.jpg?v=1747720980", "https://toys.hape.com/products/hape-learning-board"],
  ["hape-magnetic-vehicles-30", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Magnetic-Vehicles-Hape-Toy-Market-47316760.jpg?v=1747720965", "https://toys.hape.com/products/hape-magnetic-vehicles"],
  ["hape-mighty-echo-microphone", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Mighty-Echo-Microphone-Hape-Toy-Market-44368611.jpg?v=1747721420", "https://toys.hape.com/products/mighty-echo-microphone"],
  ["hape-modern-smart-kitchen", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Modern-Smart-Kitchen-Hape-Toy-Market-58050833.png?v=1747720945", "https://toys.hape.com/products/hape-intelligence-kitchen-playset"],
  ["hape-musical-whale-fountain", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Musical-Whale-Fountain-Hape-Toy-Market-44381567.jpg?v=1747721284", "https://toys.hape.com/products/e0218"],
  ["hape-pea-pod-pals", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Pea-Pod-Pals-Hape-Toy-Market-57884329.jpg?v=1774108918", "https://toys.hape.com/products/pea-pod-pals"],
  ["hape-pepe-sound-stacker", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Pepe-Sound-Stacker-Hape-60667087.jpg?v=1755919433", "https://toys.hape.com/products/pepe-sound-stacker"],
  ["hape-polar-animal-tactile-puzzle", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Polar-Animal-Tactile-Puzzle-Hape-60671989.jpg?v=1755920470", "https://toys.hape.com/products/polar-animal-tactile-puzzle"],
  ["hape-pop-up-toaster", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Pop-up-Toaster-Set-Hape-Toy-Market-44399349.jpg?v=1747721431", "https://toys.hape.com/products/pop-up-toaster-set"],
  ["hape-pound-tap-bench", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Pound-_-Tap-Bench-with-Slide-Out-Xylophone-Hape-Toy-Market-44393626.jpg?v=1747721273", "https://toys.hape.com/products/e0305"],
  ["hape-pound-tap-bench-xylophone", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Pound-_-Tap-Bench-with-Slide-Out-Xylophone-Hape-Toy-Market-44393626.jpg?v=1747721273", "https://toys.hape.com/products/e0305"],
  ["hape-pull-along-frog-family", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Pull-Along-Frog-Family-Hape-Toy-Market-44392297.jpg?v=1747721229", "https://toys.hape.com/products/e0365"],
  ["hape-puppy-care-clinic-vet", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Puppy-Care-Clinic-Vet-Set-Hape-Toy-Market-63676967.png?v=1773369208", "https://toys.hape.com/products/puppy-care-clinic-vet-set"],
  ["hape-rainbow-pounder", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Rainbow-Pounder-Hape-Toy-Market-44398956.jpg?v=1747721435", "https://toys.hape.com/products/rainbow-pounder"],
  ["hape-scientific-tool-belt", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Scientific-Tool-Belt-Hape-Toy-Market-44413189.jpg?v=1747721311", "https://toys.hape.com/products/scientific-tool-belt"],
  ["hape-shopping-cart", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Shopping-Cart-Hape-61776927.jpg?v=1761051673", "https://toys.hape.com/products/shopping-cart"],
  ["hape-sizzling-bbq-set", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Sizzling-BBQ-set-Hape-Toy-Market-47332531.jpg?v=1747720948", "https://toys.hape.com/products/hape-sizzling-bbq-set"],
  ["hape-snip-style-hair-salon", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Snip-_-Style-Hair-Salon-Kit-Hape-Toy-Market-63678576.png?v=1773370057", "https://toys.hape.com/products/snip-style-hair-salon-kit"],
  ["hape-stacking-donut", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Stacking-Donut-Toy-Hape-63551081.png?v=1772696416", "https://toys.hape.com/products/hape-stacking-donut-toy"],
  ["hape-stylish-dressing-table", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/My-Stylish-Dressing-Table-Hape-60748533.jpg?v=1756176508", "https://toys.hape.com/products/my-stylish-dressing-table"],
  ["hape-sunny-valley-adventure-dome", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Sunny-Valley-Adventure-Dome-Hape-Toy-Market-44416277.jpg?v=1747721319", "https://toys.hape.com/products/sunny-valley-adventure-dome"],
  ["hape-super-cityscape-transport", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Super-Cityscape-Transport-Bucket-Set-Hape-Toy-Market-44419070.jpg?v=1747721206", "https://toys.hape.com/products/hape-super-cityscape-transport-bucket-set-wooden-toy-train-set-with-city-scenes-plane-battery-powered-engine"],
  ["hape-super-smile-dental-clinic", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Super-Smile-Dental-Clinic-Set-Hape-60747161.jpg?v=1756175813", "https://toys.hape.com/products/super-smile-dental-clinic-set"],
  ["hape-super-stylish-hair-salon", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Hair-Salon-Set-Hape-Toy-Market-47317478.jpg?v=1747720950", "https://toys.hape.com/products/hape-hair-salon-set"],
  ["hape-tubing-pull-back-boat", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Tubing-Pull-Back-Boat-Bath-Toy-Hape-Toy-Market-44415989.jpg?v=1747721283", "https://toys.hape.com/products/e0217"],
  ["hape-vacuum-playset", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Vacuum-Playset-Hape-Toy-Market-44425880.jpg?v=1747721022", "https://toys.hape.com/products/vacuum-playset"],
  ["hape-wonder-walker", "https://cdn.shopify.com/s/files/1/0560/6188/6521/files/Hape-Wonder-Walker-Push-and-Pull-Toddler-Walking-Toy-Hape-Toy-Market-44425237.jpg?v=1747721075", "https://toys.hape.com/products/wonder-walker"],
  ["lovevery-analyst", "https://cdn.shopify.com/s/files/1/2386/2119/files/Kit-18_TheAnalyst-Flatlay_c2a16ca0-cbd0-4a24-9426-8fe5ab4f69bf.png?v=1674768660", "https://lovevery.com/products/the-play-kits-the-analyst"],
  ["lovevery-babbler", "https://cdn.shopify.com/s/files/1/2386/2119/files/AU_Kit-7_Babbler-Flatlay_web.png?v=1721657514", "https://lovevery.com/products/the-play-kits-the-babbler"],
  ["lovevery-bath-set", "https://cdn.shopify.com/s/files/1/2386/2119/files/1_4919db97-d238-4394-8197-607dc3e5fa63.png?v=1753465435", "https://lovevery.com/products/the-bath-set"],
  ["lovevery-block-set", "https://cdn.shopify.com/s/files/1/2386/2119/files/Lovevery-VKS-EU-BlockSet-GIF-Frame-11_v3.png?v=1698698662", "https://lovevery.com/products/the-block-set"],
  ["lovevery-buddy-stroller", "https://cdn.shopify.com/s/files/1/2386/2119/products/slideshow-stroller_1d2f0e3a-3471-4b40-97fa-3f906b538ffd.png?v=1744316790", "https://lovevery.com/products/the-buddy-stroller"],
  ["lovevery-charmer", "https://cdn.shopify.com/s/files/1/2386/2119/files/Charmer_Flatlay.png?v=1781103388", "https://lovevery.com/products/the-play-kits-the-charmer"],
  ["lovevery-companion", "https://cdn.shopify.com/s/files/1/2386/2119/files/EU_Kit_10_The_Companion_UK.20230512201953123.png?v=1694447985", "https://lovevery.com/products/the-play-kits-the-companion"],
  ["lovevery-connector", "https://cdn.shopify.com/s/files/1/2386/2119/files/Kit-19_Connector_Flatlay_v4.png?v=1745597420", "https://lovevery.com/products/the-play-kits-the-connector"],
  ["lovevery-enthusiast", "https://cdn.shopify.com/s/files/1/2386/2119/files/US_Kit_12_The_Enthusiast.png?v=1715698710", "https://lovevery.com/products/the-play-kits-the-enthusiast"],
  ["lovevery-examiner", "https://cdn.shopify.com/s/files/1/2386/2119/files/Kit-20_Examiner-Flatlay_v3.png?v=1684785625", "https://lovevery.com/products/the-play-kits-the-examiner"],
  ["lovevery-explorer", "https://cdn.shopify.com/s/files/1/2386/2119/files/Kit-5_TheExplorer-Flatlay_web.png?v=1706650724", "https://lovevery.com/products/the-play-kits-the-explorer"],
  ["lovevery-inspector", "https://cdn.shopify.com/s/files/1/2386/2119/files/Kit-4_TheInspector-Flatlay_v3.png?v=1785270902", "https://lovevery.com/products/the-play-kits-the-inspector"],
  ["lovevery-math-skill-set-part-1", "https://cdn.shopify.com/s/files/1/2386/2119/files/PR_Lovevery_Math_Part_One_ISO_Three_Quarter_Angle_Group_0168_v2_EN.jpg?v=1777390180", "https://lovevery.com/products/part-1-hands-on-math"],
  ["lovevery-mini-crawl-to-me", "https://cdn.shopify.com/s/files/1/2386/2119/files/Lovevery_Packaging_Baby-Movement-Play-Collection_BOX_ISO_09-25_0298_R2.png?v=1768940338", "https://lovevery.com/products/mini-kits-crawl-to-me"],
  ["lovevery-mini-explore-floor", "https://cdn.shopify.com/s/files/1/2386/2119/files/Lovevery_Packaging_Baby-Sensory-Play-Collection_BOX_ISO_09-25_0286_R2.png?v=1768940338", "https://lovevery.com/products/mini-kits-explore-on-the-floor"],
  ["lovevery-mini-feel-it-all", "https://cdn.shopify.com/s/files/1/2386/2119/files/Lovevery_Packaging_Toddler-Emotions-Play-Collection_BOX_ISO_09-25_0292_R2.png?v=1768940338", "https://lovevery.com/products/mini-kits-feel-it-all"],
  ["lovevery-mini-little-cause-big-effect", "https://cdn.shopify.com/s/files/1/2386/2119/files/Lovevery_Packaging_Baby-Cause_and_Effect-Play-Collection_BOX_ISO_09-25_0303_R2.png?v=1768940338", "https://lovevery.com/products/mini-kits-little-cause-big-effect"],
  ["lovevery-mini-ready-routines", "https://cdn.shopify.com/s/files/1/2386/2119/files/Lovevery_Packaging_Toddler-Routines-Play-Collection_BOX-ISO_09-25_0296_R1.png?v=1762547311", "https://lovevery.com/products/mini-kits-ready-for-routines"],
  ["lovevery-mini-recipes-for-me", "https://cdn.shopify.com/s/files/1/2386/2119/files/Lovevery_Packaging_Toddler-Food_Prep-Play-Collection_BOX_ISO_09-25_0301_R2.png?v=1768940338", "https://lovevery.com/products/mini-kits-recipes-for-me"],
  ["lovevery-mini-sort-match", "https://cdn.shopify.com/s/files/1/2386/2119/files/Lovevery_Packaging_Toddler-Sort-and-Match-Play-Collection_BOX-ISO_09-25_0305_R1.png?v=1762547367", "https://lovevery.com/products/mini-kits-sort-match"],
  ["lovevery-mini-think-it-out", "https://cdn.shopify.com/s/files/1/2386/2119/files/Lovevery_Packaging_Toddler-Sequencing-Play-Collection_BOX-ISO_09-25_0294_R1.png?v=1762547348", "https://lovevery.com/products/mini-kits-think-it-out"],
  ["lovevery-mini-walk-talk", "https://cdn.shopify.com/s/files/1/2386/2119/files/Lovevery_Packaging_Toddler-Movement-Play-Collection_BOX_ISO_09-25_0281_R2.png?v=1768940338", "https://lovevery.com/products/mini-kits-walk-talk"],
  ["lovevery-music-set", "https://cdn.shopify.com/s/files/1/2386/2119/files/MusicSet_FlayLay.png?v=1692634376", "https://lovevery.com/products/the-music-set"],
  ["lovevery-persister", "https://cdn.shopify.com/s/files/1/2386/2119/files/Kit-21_Persister_Flatlay_v2_f373a1c4-ee68-47a4-b1b5-697dc2fbe28d.png?v=1684785859", "https://lovevery.com/products/the-play-kits-the-persister"],
  ["lovevery-planner", "https://cdn.shopify.com/s/files/1/2386/2119/files/Kit-22_Planner_Flatlay_v2_1b1e2c1d-3191-435c-84bb-5a6e99ae1e07.png?v=1684785960", "https://lovevery.com/products/the-play-kits-the-planner"],
  ["lovevery-play-tunnel", "https://cdn.shopify.com/s/files/1/2386/2119/products/slideshow-tunnel_403698fe-a082-4d37-abc5-988d492c9005.png?v=1744316878", "https://lovevery.com/products/the-play-tunnel"],
  ["lovevery-pull-pup", "https://cdn.shopify.com/s/files/1/2386/2119/products/slideshow-pup_0011_pup-product_ef90cb07-8a03-4879-b398-997078a0ab63.png?v=1744316736", "https://lovevery.com/products/the-pull-pup"],
  ["lovevery-realist", "https://cdn.shopify.com/s/files/1/2386/2119/files/Kit9_Realist-Flaylay-US.png?v=1692284878", "https://lovevery.com/products/the-play-kits-the-realist"],
  ["lovevery-researcher", "https://cdn.shopify.com/s/files/1/2386/2119/files/2023_07_18_Kit_13_The_Researcher.png?v=1768439153", "https://lovevery.com/products/the-play-kits-the-researcher"],
  ["lovevery-senser", "https://cdn.shopify.com/s/files/1/2386/2119/files/Kit-3_TheSenser_FlatLay_v2.png?v=1738348210", "https://lovevery.com/products/the-play-kits-the-senser"],
  ["lovevery-sensory-strands", "https://cdn.shopify.com/s/files/1/2386/2119/files/SensoryStrandISO_1_3afd797c-0524-4f63-b2c9-3e2b4b323f0a.png?v=1712935327", "https://lovevery.com/products/sensory-strands"],
  ["lovevery-thinker", "https://cdn.shopify.com/s/files/1/2386/2119/files/Kit-6_TheThinker-Flatlay_v2.png?v=1784124878", "https://lovevery.com/products/the-play-kits-the-thinker"],
  ["mideer-32-in-1-classic-games", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_8220406b-f0bc-48ce-9fcb-cca3e9b8dd3a.jpg?v=1722569231", "https://mideerart.com/products/32-in-1-classic-games"],
  ["mideer-6in1-museum-adventures", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_d0c16a69-5008-41a7-a7d0-7cc58d961f07.jpg?v=1709803195", "https://mideerart.com/products/6-in-1-portable-board-game-book-museum-adventures"],
  ["mideer-artist-fairytale-red-riding-hood-59-md1492", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_ca3dd4af-4e1c-433b-985d-ba8dbdd0685d.jpg?v=1726715491", "https://mideerart.com/products/artist-fairytale-puzzle-little-red-riding-hood-59p"],
  ["mideer-artist-fairytale-thumbelina-66-md1494", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/2_c1c9e79d-d01b-478d-ac13-e450c43f1499.jpg?v=1726715491", "https://mideerart.com/products/artist-fairytale-puzzle-thumbelina-66p"],
  ["mideer-brain-game-lets-stick-l1", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/6_48a46d87-ed15-4f8b-baf2-a9e213cd6c51.jpg?v=1710841463", "https://mideerart.com/products/lets-sticke-level-1"],
  ["mideer-brain-game-lets-stick-l2", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/5_83f2931e-69c1-422b-9c6f-71ab7bfb17af.jpg?v=1710842108", "https://mideerart.com/products/lets-stick-level-2"],
  ["mideer-colorful-magnetic-tiles-jurassic-48p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_924555c6-b3f2-4fd5-b92d-e4cb6afb8561.jpg?v=1721984346", "https://mideerart.com/products/colorful-magnetic-tiles-jurassic-adventure-48p"],
  ["mideer-colorful-magnetic-tiles-wonderful-forest-40p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/products/8f17249f-92a4-491b-bea5-a4c3ad7e35f2.jpg?v=1681990105", "https://mideerart.com/products/colorful-magnetic-tiles-wonderful-forest-40p"],
  ["mideer-creative-magnetic-building-blocks-20p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_7353b941-df58-41e3-8af0-e2387138a1a1.jpg?v=1706233380", "https://mideerart.com/products/creative-magnetic-building-blocks-20p"],
  ["mideer-creative-magnetic-building-blocks-46p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1.1_ba0adea5-d4ce-460b-8cfb-faaeecbb4519.jpg?v=1706233417", "https://mideerart.com/products/creative-magnetic-building-blocks-46p"],
  ["mideer-ct2283-princess-fashion-show", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_46e6d5f7-d686-4f28-964f-79cf81c0c50a.jpg?v=1722248099", "https://mideerart.com/products/3-in-1-dress-up-game-set-princess-fashion-show"],
  ["mideer-distinctive-magnetic-tiles-100p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/products/527ad140-1c47-404a-bcc8-70dd9b57d9d9.jpg?v=1684834787", "https://mideerart.com/products/distinctive-magnetic-tiles-100p"],
  ["mideer-dressup-princess-fantasy", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_3f520b92-f1e8-4b4e-a718-4ce90cff03e8.jpg?v=1706606034", "https://mideerart.com/products/3-in-1-dress-up-game-set-princess-fantasy-makeup"],
  ["mideer-dressup-princess-fashion", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_46e6d5f7-d686-4f28-964f-79cf81c0c50a.jpg?v=1722248099", "https://mideerart.com/products/3-in-1-dress-up-game-set-princess-fashion-show"],
  ["mideer-first-artist-busy-cars", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/47035f661a0ca70240097c400db054ed.jpg?v=1712556897", "https://mideerart.com/products/my-first-artist-puzzle-busy-cars"],
  ["mideer-first-artist-construction-vehicles", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/0dafc3f81f68ef0ab4a49d4a2d91dcfb_4460e93b-5e45-4e1e-9d4b-5f9a4182a94d.jpg?v=1712557059", "https://mideerart.com/products/my-first-artist-puzzle-construction-vehicles"],
  ["mideer-first-artist-cute-dinosaurs", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/cb0a69b7065553ac78e4593b6e2d50a1_3b625346-a666-42f5-8941-c650289154f7.jpg?v=1712557189", "https://mideerart.com/products/my-first-artist-puzzle-cute-dinosaurs"],
  ["mideer-first-artist-forest-animals", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_e33d699f-a7e7-4f38-9403-ae92812d4fba.jpg?v=1727339636", "https://mideerart.com/products/my-first-artist-puzzle-forest-animals"],
  ["mideer-first-artist-marine-animals", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/c15b3ea1b27ba7d737553abd1a3bf85f.jpg?v=1712557927", "https://mideerart.com/products/my-first-artist-puzzle-marine-animals"],
  ["mideer-floating-ball-game", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_d1821481-3fb2-4be2-ae9a-70f8d3959aff.jpg?v=1706603684", "https://mideerart.com/products/floating-ball-game"],
  ["mideer-lets-learn-african-animals-126p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/4_71e15c4d-3ddc-4644-840d-bb1daa957d0b.jpg?v=1718613861", "https://mideerart.com/products/lets-learn-puzzle-african-animals"],
  ["mideer-lets-learn-dino-land-126p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/2_6a8e9431-c98a-435e-b788-582ae2239e6e.jpg?v=1718614027", "https://mideerart.com/products/lets-learn-puzzle-dino-land"],
  ["mideer-lets-learn-ocean-trip-126p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_2e948bd7-e2bf-4285-a2dd-0dd3ee6c519b.jpg?v=1718614092", "https://mideerart.com/products/lets-learn-puzzle-ocean-trip"],
  ["mideer-level-up-l1-animals-2p-6p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_02d0bdd3-fb1f-4f94-8c7e-a73e8cf5157a.jpg?v=1720405431", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-1-animals-2p-6p"],
  ["mideer-level-up-l1-animals-vehicles-2p-6p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/2_a6b4c2bf-0574-454e-9f7e-aebdec7714da.jpg?v=1720406911", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-1-animals-and-vehicles-2p-6p"],
  ["mideer-level-up-l3-community-helpers-24-35p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/6_ea2559d0-0400-4ab9-a628-61dcd2907d71.jpg?v=1720407374", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-3-busy-community-helpers-24p-35p"],
  ["mideer-level-up-l3-natural-scenery-24-35p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/8_8c1e5faa-049a-4593-90de-1b9f11730b4c.jpg?v=1720420589", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-3-natural-scenery-24p-35p"],
  ["mideer-level-up-l4-clanging-construction-48-72p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_eb1573a8-45f8-4ad3-835e-318842191cc0.jpg?v=1736832754", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-4-clanging-construction-site-48p-72p"],
  ["mideer-level-up-l5-wonderful-adventure", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/2_28bf91b2-6786-441c-96ad-3fa0dce3ecd4.jpg?v=1740013675", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-5-wonderful-adventure-88p-126p"],
  ["mideer-level1-animals-2-6", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_02d0bdd3-fb1f-4f94-8c7e-a73e8cf5157a.jpg?v=1720405431", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-1-animals-2p-6p"],
  ["mideer-level1-animals-vehicles-2-6", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/2_a6b4c2bf-0574-454e-9f7e-aebdec7714da.jpg?v=1720406911", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-1-animals-and-vehicles-2p-6p"],
  ["mideer-level2-animal-families", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/3_c739bfc3-883d-4a0c-9fbd-ee1101d90317.jpg?v=1724915629", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-2-animal-families-9p-20p"],
  ["mideer-level2-dinosaur-projects", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/4_3ec432ad-496b-4c07-bd7e-eb75de433528.jpg?v=1724916396", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-2-dinosaur-projects-9p-16p"],
  ["mideer-level3-city-teamers", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/5_d7930760-1c67-4cda-aca1-73e0f54e682e.jpg?v=1720419809", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-3-city-teamers-24p-35p"],
  ["mideer-level3-community-helpers", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/6_ea2559d0-0400-4ab9-a628-61dcd2907d71.jpg?v=1720407374", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-3-busy-community-helpers-24p-35p"],
  ["mideer-level3-natural-scenery", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/8_8c1e5faa-049a-4593-90de-1b9f11730b4c.jpg?v=1720420589", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-3-natural-scenery-24p-35p"],
  ["mideer-level3-princesses", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/7_6c9739bc-4a62-47a1-8c8e-dd7247e1ea3a.jpg?v=1720420058", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-3-princesses-24p-35p"],
  ["mideer-level4-construction", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_eb1573a8-45f8-4ad3-835e-318842191cc0.jpg?v=1736832754", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-4-clanging-construction-site-48p-72p"],
  ["mideer-level4-day-of-mine", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/7_bd6c9d63-41a0-4b38-8efa-cf052af00cd2.jpg?v=1741071643", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-4-a-day-of-mine-48p-72p"],
  ["mideer-level4-dinosaur-world", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/8_43e022db-a156-4952-8526-84e3be3178b7.jpg?v=1737529859", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-4-dinosaurs-world-48p-72p"],
  ["mideer-level4-fairy-town", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/6_bac05b74-1571-49a5-8f37-b5b54348a8cd.jpg?v=1737530155", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-4-fairy-tale-town-48p-72p"],
  ["mideer-level4-transportation", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/5_7e1c249a-5045-4008-8baa-126e6cc27631.jpg?v=1741071646", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-4-transportation-48p-72p"],
  ["mideer-level5-fantasy", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_a4624ba0-8547-4df6-b767-90b859eacb77.jpg?v=1747895012", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-5-fantasy-88p-126p"],
  ["mideer-level5-market", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/4_cce93cd1-c174-4ee9-b01c-2c4b66de0aeb.jpg?v=1739172594", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-5-bustling-market-88p-126p"],
  ["mideer-level5-museums", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_0ec755e5-1820-4926-90a3-991126b562aa.jpg?v=1736831797", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-5-wonderful-museums-88p-126p"],
  ["mideer-level5-wonderful-adventure", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/2_28bf91b2-6786-441c-96ad-3fa0dce3ecd4.jpg?v=1740013675", "https://mideerart.com/products/level-up-puzzles-with-storage-bag-level-5-wonderful-adventure-88p-126p"],
  ["mideer-magnetic-maze-parking", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/2_24619da5-43e4-495b-b3fc-284594cb5250.jpg?v=1725612406", "https://mideerart.com/products/magnetic-maze-parking-lot"],
  ["mideer-magnetic-maze-parking-lot", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/2_24619da5-43e4-495b-b3fc-284594cb5250.jpg?v=1725612406", "https://mideerart.com/products/magnetic-maze-parking-lot"],
  ["mideer-magnetic-playset-sweet-girl", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/4_2bd63025-7121-434f-bb72-7b9de711b105.jpg?v=1710322674", "https://mideerart.com/products/magnetic-playset-sweet-girl"],
  ["mideer-magnetic-tangram", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_bec8a449-7204-4ad9-83c4-0f2a374e21ac.jpg?v=1699587888", "https://mideerart.com/products/magnetic-tangram"],
  ["mideer-magnetic-tangram-md4281", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_bec8a449-7204-4ad9-83c4-0f2a374e21ac.jpg?v=1699587888", "https://mideerart.com/products/magnetic-tangram"],
  ["mideer-magnetic-tiles-jurassic-adventure-48p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_924555c6-b3f2-4fd5-b92d-e4cb6afb8561.jpg?v=1721984346", "https://mideerart.com/products/colorful-magnetic-tiles-jurassic-adventure-48p"],
  ["mideer-magnetic-tiles-wonderful-forest-40p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/products/8f17249f-92a4-491b-bea5-a4c3ad7e35f2.jpg?v=1681990105", "https://mideerart.com/products/colorful-magnetic-tiles-wonderful-forest-40p"],
  ["mideer-panoramic-puzzle-day-forest-150", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/5_d4f6ed42-ca34-482d-acdf-133b5e6d5365.png?v=1776156816", "https://mideerart.com/products/panoramic-puzzle-magic-ocean-150pcs-copy"],
  ["mideer-paper-craft-flight-diary", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/b8421501ceee8ed8defa49d79fc692df_4d1daedb-f74c-4ac8-8026-9a51c9b7272a.jpg?v=1737527591", "https://mideerart.com/products/paper-craft-workshop-flight-diary"],
  ["mideer-paper-craft-nautical", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/b8421501ceee8ed8defa49d79fc692df_54ecc323-e862-4b7f-b226-11433b69b30d.jpg?v=1737527635", "https://mideerart.com/products/paper-craft-workshop-nautical-explorer"],
  ["mideer-paper-craft-racing-car", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/b8421501ceee8ed8defa49d79fc692df_cd7b4a1e-77ca-4411-a1e9-9c614d1a8282.jpg?v=1737527620", "https://mideerart.com/products/paper-craft-workshop-racing-car"],
  ["mideer-paper-craft-windmill", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/b8421501ceee8ed8defa49d79fc692df_c8370453-98ca-4f66-91db-9e468bba88ae.jpg?v=1737527628", "https://mideerart.com/products/paper-craft-workshop-windmill-kingdom"],
  ["mideer-paper-craft-windmill-kingdom-md2307", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/b8421501ceee8ed8defa49d79fc692df_c8370453-98ca-4f66-91db-9e468bba88ae.jpg?v=1737527628", "https://mideerart.com/products/paper-craft-workshop-windmill-kingdom"],
  ["mideer-poke-dressup-royal", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_f10aa3f7-8c64-45f3-9e3f-c86e078479fb.jpg?v=1729935390", "https://mideerart.com/products/poke-in-dress-up-set-royal-vintage-attire"],
  ["mideer-portable-puzzle-dinosaur-age-104p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/products/3eb9b356-58e7-4798-b02a-1a069db00bfa.jpg?v=1681736360", "https://mideerart.com/products/portable-puzzle-box-dinosaur-age-104p"],
  ["mideer-portable-puzzle-our-world-100", "https://cdn.shopify.com/s/files/1/0735/8375/5549/products/85cd8a7a-967c-4e8f-8713-d96a56ff9d74.jpg?v=1681736324", "https://mideerart.com/products/portable-puzzle-box-our-world-100p"],
  ["mideer-portable-puzzle-our-world-100p-md3027", "https://cdn.shopify.com/s/files/1/0735/8375/5549/products/85cd8a7a-967c-4e8f-8713-d96a56ff9d74.jpg?v=1681736324", "https://mideerart.com/products/portable-puzzle-box-our-world-100p"],
  ["mideer-portable-puzzle-wonderful-ocean-104p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/products/6f00d30e-a014-4564-afa3-574c83bc033a.jpg?v=1681797192", "https://mideerart.com/products/portable-puzzle-box-wonderful-ocean-104p"],
  ["mideer-portable-wonderful-ocean-104p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/products/6f00d30e-a014-4564-afa3-574c83bc033a.jpg?v=1681797192", "https://mideerart.com/products/portable-puzzle-box-wonderful-ocean-104p"],
  ["mideer-pull-string-flying-propeller-md1536", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_8b8cd2a1-2983-4c05-ab8c-b0dbaadbd582.jpg?v=1718185540", "https://mideerart.com/products/pull-string-flying-propeller"],
  ["mideer-racing-track-grooved-magnetic-tiles-115p-md6395", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_ce02845a-f920-4b2a-a66a-4f1138ce8e91.jpg?v=1743406402", "https://mideerart.com/products/racing-track-grooved-magnetic-tiles-115p"],
  ["mideer-racing-track-magnetic-115", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_ce02845a-f920-4b2a-a66a-4f1138ce8e91.jpg?v=1743406402", "https://mideerart.com/products/racing-track-grooved-magnetic-tiles-115p"],
  ["mideer-rainbow-plus-magnetic-building-sticks-32p-md1588", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_f5ef4f69-5afa-40e7-9998-4c3a064c9cd7.jpg?v=1730388819", "https://mideerart.com/products/rainbow-plus-magnetic-building-sticks-32p"],
  ["mideer-reusable-jelly-sticker-busy-animal-town", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1-2.jpg?v=1710143024", "https://mideerart.com/products/jelly-sticker-set-the-busy-animal-town"],
  ["mideer-secret-puzzle-forest-35p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/products/15a430fe-4a40-4336-bec3-60f4307dee54.jpg?v=1681806682", "https://mideerart.com/products/secret-puzzle-forest-35p"],
  ["mideer-secret-puzzle-ocean-35p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/products/59c43322-d24e-4c7b-9ef3-f648fff7aa44.jpg?v=1681806733", "https://mideerart.com/products/secret-puzzle-ocean-35p"],
  ["mideer-shaped-artist-dinosaur-world-280p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/3_f58e7d44-78aa-4115-bbfc-bf335d8f1472.png?v=1776151487", "https://mideerart.com/products/shaped-artist-puzzle-elephant-dream-280pcs-copy"],
  ["mideer-shaped-artist-robot-factory-226p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/4_2cd74cdb-53bd-4853-a053-1af343cb4b7c.png?v=1776149673", "https://mideerart.com/products/artist-puzzle-rabbitopia-352pcs-copy"],
  ["mideer-track-marble-building-blocks-51p", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/20240813-141320.jpg?v=1723529685", "https://mideerart.com/products/track-marble-building-blocks-51p"],
  ["mideer-watercolor-fairy", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_dd843dcf-3f94-4ed4-97b6-74fea5b83ed1.jpg?v=1688724643", "https://mideerart.com/products/waterclour-painting-fairy-tale-dream"],
  ["mideer-watercolor-forest", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1_bb183077-4894-4ed4-867a-a66028b62a6f.jpg?v=1688724798", "https://mideerart.com/products/waterclour-painting-wonderful-forest"],
  ["mideer-watercolor-garden", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/32.jpg?v=1693537455", "https://mideerart.com/products/watercolour-painting-enchanted-garden"],
  ["mideer-watercolor-unicorn", "https://cdn.shopify.com/s/files/1/0735/8375/5549/files/1600.1.jpg?v=1705031635", "https://mideerart.com/products/watercolour-painting-unicorn-legend"],
  ["plantoys-40-unit-blocks", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5513_-_Main_-_sq.jpg?v=1754370586", "https://www.plantoys.com/products/colorful-40-unit-blocks"],
  ["plantoys-animal-set", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/6625_-_Main.jpg?v=1754371476", "https://www.plantoys.com/products/animal-set"],
  ["plantoys-baby-car", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5229_-_Main_-_sq.jpg?v=1755249036", "https://www.plantoys.com/products/baby-car"],
  ["plantoys-baby-key-rattle", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5217_-_Main_-_sq.jpg?v=1754373929", "https://www.plantoys.com/products/baby-key-rattle"],
  ["plantoys-balancing-cactus", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/4101_-_Main_-_sq.jpg?v=1755165869", "https://www.plantoys.com/products/balancing-cactus"],
  ["plantoys-beehives", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/4125_-_Main_-_sq.jpg?v=1755248677", "https://www.plantoys.com/products/beehives"],
  ["plantoys-bowling-set", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5735_-_Main_-_sq.jpg?v=1754369785", "https://www.plantoys.com/products/bowling-set"],
  ["plantoys-breakfast-menu", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/3415_-_Main.jpg?v=1754368688", "https://www.plantoys.com/products/breakfast-menu"],
  ["plantoys-bulldozer", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/6123_-_Main_-_sq.jpg?v=1754376692", "https://www.plantoys.com/products/bulldozer"],
  ["plantoys-clatter", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/6413_-_Main_-_sq.jpg?v=1754373258", "https://www.plantoys.com/products/clatter"],
  ["plantoys-creative-board", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5459_-_Main.jpg?v=1754373904", "https://www.plantoys.com/products/creative-board"],
  ["plantoys-cubes", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5374_-_Main_-_sq.jpg?v=1754375620", "https://www.plantoys.com/products/cubes"],
  ["plantoys-dancing-alligator", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5105_-_Main_-_sq.jpg?v=1755248940", "https://www.plantoys.com/products/dancing-alligator"],
  ["plantoys-doctor-set", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/3451_-_Main.jpg?v=1755248863", "https://www.plantoys.com/products/doctor-set"],
  ["plantoys-farm-to-market-roadway", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/2623_-_Main_-_web.jpg?v=1772768368", "https://www.plantoys.com/products/farm-to-market-roadway-playset"],
  ["plantoys-fountain-bowl-set", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5714_-_Main_-_sq.jpg?v=1754368807", "https://www.plantoys.com/products/fountain-bowl-set"],
  ["plantoys-fruit-vegetable-play-set", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5337_-_Main_-_sq.jpg?v=1754373804", "https://www.plantoys.com/products/fruit-vegetable-play-set"],
  ["plantoys-geometric-sorting-board", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/2403_-_Main.jpg?v=1755164521", "https://www.plantoys.com/products/geometric-sorting-board"],
  ["plantoys-meadow-ring-toss", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5652_-_Main_-_sq.jpg?v=1754370845", "https://www.plantoys.com/products/meadow-ring-toss"],
  ["plantoys-mini-balancing-cactus", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/4130_-_Main_-_sq.jpg?v=1754373345", "https://www.plantoys.com/products/balancing-cactus-1"],
  ["plantoys-mini-golf-full", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5683_-_Main_-_sq.jpg?v=1755249122", "https://www.plantoys.com/products/mini-golf-full-set"],
  ["plantoys-miracle-pounding-ii", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5454_-_Main.jpg?v=1754373123", "https://www.plantoys.com/products/miracle-pounding-ii"],
  ["plantoys-my-first-rail-road", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/2618_-_Main_-_web.jpg?v=1772768468", "https://www.plantoys.com/products/my-first-rail-road-set"],
  ["plantoys-nuts-bolts", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5455_-_Main_-_sq.jpg?v=1755249596", "https://www.plantoys.com/products/nuts-bolts"],
  ["plantoys-oval-xylophone", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/6405_-_Main_-_sq.jpg?v=1754372666", "https://www.plantoys.com/products/oval-xylophone"],
  ["plantoys-peek-a-boo-roller", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5252_-_Main_-_sq.jpg?v=1754375561", "https://www.plantoys.com/products/peek-a-boo-roller"],
  ["plantoys-penguin-wobbler", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5900_-_Packshot_-_01.jpg?v=1758422552", "https://www.plantoys.com/products/penguin-wobbler"],
  ["plantoys-planworld-vehicle-set", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/6299_-_Main.jpg?v=1754378646", "https://www.plantoys.com/products/planworld-vehicle-series"],
  ["plantoys-pull-along-snail", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5108_-_Main_-_sq.jpg?v=1755249011", "https://www.plantoys.com/products/pull-along-snail"],
  ["plantoys-rain-maker", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/6427_-_Main_-_sq.jpg?v=1754373804", "https://www.plantoys.com/products/rainmaker"],
  ["plantoys-road-system", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/6208_-_Main_-_sq.jpg?v=1754375416", "https://www.plantoys.com/products/road-system"],
  ["plantoys-roller-classic", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5220_-_Main_-_sq.jpg?v=1755248508", "https://www.plantoys.com/products/roller"],
  ["plantoys-sea-life-bath-set", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5658_-_Main_-_sq.jpg?v=1754371545", "https://www.plantoys.com/products/sea-life-bath-set"],
  ["plantoys-sensory-blocks", "https://cdn.shopify.com/s/files/1/0608/9618/2503/products/5257_-_Packshot_-_01.jpg?v=1754375844", "https://www.plantoys.com/products/sensory-blocks"],
  ["plantoys-solid-drum", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/6404_-_Main_-_sq.jpg?v=1755249303", "https://www.plantoys.com/products/solid-drum"],
  ["plantoys-sort-count-cups", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5360_-_Main_-_sq.jpg?v=1754374722", "https://www.plantoys.com/products/sort-count-cups"],
  ["plantoys-sort-count-trees", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5403_-_Main_-_sq.jpg?v=1754371014", "https://www.plantoys.com/products/sort-count-trees"],
  ["plantoys-stacking-rocket", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5694_-_Main.jpg?v=1754373079", "https://www.plantoys.com/products/stacking-rocket"],
  ["plantoys-stacking-tree", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5149_-_Main_-_sq.jpg?v=1754376978", "https://www.plantoys.com/products/stacking-tree"],
  ["plantoys-vet-set", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/3490_-_Main_-_sq.jpg?v=1754371916", "https://www.plantoys.com/products/vet-set"],
  ["plantoys-victorian-dollhouse", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/712409_-_Main_-_01.jpg?v=1770801189", "https://www.plantoys.com/products/victorian-dollhouse"],
  ["plantoys-walk-n-roll", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5137_-_Main_-_sq.jpg?v=1755164188", "https://www.plantoys.com/products/walk-n-roll"],
  ["plantoys-water-play-set", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5801_-_Main_-_sq.jpg?v=1754380289", "https://www.plantoys.com/products/water-play-set"],
  ["plantoys-wautomobile", "https://cdn.shopify.com/s/files/1/0608/9618/2503/products/5449_1636_1637_1638_-_Packshot_-_01.jpg?v=1754379041", "https://www.plantoys.com/products/wautomobile"],
  ["plantoys-wave-stacker", "https://cdn.shopify.com/s/files/1/0608/9618/2503/files/5486_-_Main.jpg?v=1755249158", "https://www.plantoys.com/products/wave-stacker"],
  ["toi-burano-calendar-clock", "https://qiniu.digood-assets-fallback.work/210/image_1640851396_%E6%97%B6%E9%92%9F%E6%9D%BF.jpg", "https://www.toiworld.com/product/burano-calendar-clock-wooden-puzzle-toys-for-kids.html"],
  ["toi-clown-balance-game", "https://qiniu.digood-assets-fallback.work/210/image_1565407304_%E5%B0%8F%E4%B8%91%E8%B5%B0%E7%8F%A0.png", "https://www.toiworld.com/product/toi-board-game-clown-wooden-balance-ability-educational-toy-for-kids.html"],
  ["toi-dinosaur-balance-game", "https://qiniu.digood-assets-fallback.work/210/image_1565403786_%E6%81%90%E9%BE%99%E6%AC%BE%E8%B5%B0%E7%8F%A0.png", "https://www.toiworld.com/product/toi-board-game-dinosaur-wooden-balance-ability-educational-toy-for-kids.html"],
  ["toi-find-it-out-flashlight-game", "https://qiniu.digood-assets-fallback.work/210/image_1641269808_%E5%B0%8F%E6%89%8B%E7%94%B5.jpg", "https://www.toiworld.com/product/toi-new-arrival-find-it-out-with-a-small-flashlight-series-board-game-for-kids.html"],
  ["toi-four-puzzles-seasons", "https://qiniu.digood-assets-fallback.work/210/image_1565408110_%E5%9B%9B%E5%AD%A3%E5%9B%9B%E5%90%88%E4%B8%80.png", "https://www.toiworld.com/product/toi-4-puzzles-in-a-box-season-paper-jigsaw-puzzle-educational-toy-for-kids.html"],
  ["toi-franks-fish-shop", "https://qiniu.digood-assets-fallback.work/210/image_1577241322_%E9%B1%BC%E9%93%BA.jpg", "https://www.toiworld.com/product/Frank-Fish-Shop-board-games.html"],
  ["toi-logic-box-puzzle-game", "https://qiniu.digood-assets-fallback.work/210/image_1614824456_sku%E7%99%BD%E5%BA%95.jpg", "https://www.toiworld.com/product/toi-logic-box-puzzle-game-toys.html"],
  ["toi-my-first-board-game", "https://qiniu.digood-assets-fallback.work/210/image_1565408217_%E6%88%91%E7%9A%84%E7%AC%AC%E4%B8%80%E5%A5%97%E6%A1%8C%E6%B8%B8.png", "https://www.toiworld.com/product/toi-My-First-Board-Game-Board-Games-educational-toy-for-kids.html"],
  ["toi-my-first-puzzle-traffic", "https://qiniu.digood-assets-fallback.work/210/image_1633749244_%E4%BA%A4%E9%80%9A.jpg", "https://www.toiworld.com/product/toi-my-first-puzzle-series-traffic-educational-toy-paper-jigsaw-puzzles-for-kids.html"],
  ["toi-sudoku-jungle-band", "https://qiniu.digood-assets-fallback.work/210/image_1614827700_1.jpg", "https://www.toiworld.com/product/toi-sudoku-game-magnetic-game-jungle-band-logic-game-educational-toy-for-kids.html"],
  ["toi-sudoku-tropical-fish", "https://qiniu.digood-assets-fallback.work/210/image_1640859030_%E5%B0%8F%E9%B1%BC.jpg", "https://www.toiworld.com/product/toi-sodoku-game-magnetic-board-game-tropical-fish-educational-toy-for-kids.html"],
  ["toi-super-safety-board-games", "https://qiniu.digood-assets-fallback.work/210/image_1641269666_%E5%B0%8F%E8%BE%BE%E4%BA%BA.jpg", "https://www.toiworld.com/product/toi-Super-Safety-Kids-Board-Games-educational-toy-for-kids.html"],
  ["toi-tooth-defence-board-game", "https://qiniu.digood-assets-fallback.work/210/image_1645514677_2.jpg", "https://www.toiworld.com/product/toi-new-arrival-tooth-defence-board-game-for-kids.html"],
  ["toi-travel-around-the-world-board-game", "https://qiniu.digood-assets-fallback.work/210/image_1577937441_%E5%8C%85%E8%A3%85.jpg", "https://www.toiworld.com/product/toi-travel-around-the-world-board-game.html"]
]);

// src/data/catalog-image-assets-batch2.js
var BATCH2_OFFICIAL_IMAGE_ROWS = Object.freeze([
  ["connetix-ball-run-bright-pack-114", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/288/3953/image_1786081635__32582.1786081638.webp?compression=lossy", "https://connetixtiles.com/product/ball-run-bright-pack-114-pc/"],
  ["connetix-clear-creative", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/178/3418/image_1785733218__01048.1785733220.png?compression=lossy", "https://connetixtiles.com/product/clear-shape-expansion-pack-24-pc/"],
  ["connetix-clear-starter-pack-34", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/179/3425/image_1785733231__59299.1785733232.png?compression=lossy", "https://connetixtiles.com/product/clear-starter-pack-34-pc/"],
  ["connetix-light-star-pack-28", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/182/3451/image_1785733281__94131.1785733282.webp?compression=lossy", "https://connetixtiles.com/product/light-star-pack-28-pc/"],
  ["connetix-pastel-ball-run-pack-106", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/194/4073/image_1787036026__35861.1787036028.png?compression=lossy", "https://connetixtiles.com/product/pastel-ball-run-pack-106-pc/"],
  ["connetix-pastel-creative-120", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/195/4084/image_1787036342__62992.1787036344.png?compression=lossy", "https://connetixtiles.com/product/pastel-creative-pack-120-pc/"],
  ["connetix-pastel-geometry", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/188/3512/image_1785733392__84755.1785733393.png?compression=lossy", "https://connetixtiles.com/product/pastel-geometry-pack-40-pc/"],
  ["connetix-pastel-mega-202", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/196/3591/image_1785733533__16714.1785733535.png?compression=lossy", "https://connetixtiles.com/product/pastel-mega-pack-202-pc/"],
  ["connetix-pastel-rectangle", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/186/3493/image_1785733359__45752.1785733361.png?compression=lossy", "https://connetixtiles.com/product/pastel-rectangle-pack-24-pc/"],
  ["connetix-pastel-starter-64", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/192/3552/image_1785733464__06977.1785733465.png?compression=lossy", "https://connetixtiles.com/product/pastel-starter-pack-64-pc/"],
  ["connetix-pastel-transport-pack-50", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/191/3538/image_1785733440__49805.1785733441.png?compression=lossy", "https://connetixtiles.com/product/pastel-transport-pack-50-pc/"],
  ["connetix-rainbow-ball-run-expansion-66", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/209/3704/image_1785733733__65170.1785733734.png?compression=lossy", "https://connetixtiles.com/product/rainbow-ball-run-expansion-pack-66-pc/"],
  ["connetix-rainbow-ball-run-pack-92", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/210/3712/image_1785733747__93281.1785733749.png?compression=lossy", "https://connetixtiles.com/product/rainbow-ball-run-pack-92-pc/"],
  ["connetix-rainbow-car-pack-2", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/199/3615/image_1785733577__15683.1785733578.png?compression=lossy", "https://connetixtiles.com/product/rainbow-car-pack-2-pc/"],
  ["connetix-rainbow-creative-pack-102", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/211/3724/image_1785733769__48272.1785733770.png?compression=lossy", "https://connetixtiles.com/product/rainbow-creative-pack-102-pc/"],
  ["connetix-rainbow-geometry-pack-30", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/204/3657/image_1785733650__59447.1785733652.png?compression=lossy", "https://connetixtiles.com/product/rainbow-geometry-pack-30-pc/"],
  ["connetix-rainbow-mega-pack-212", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/213/4092/image_1787037067__60937.1787037068.png?compression=lossy", "https://connetixtiles.com/product/rainbow-mega-pack-212-pc/"],
  ["connetix-rainbow-mini-pack-24", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/202/3636/image_1785733615__12824.1785733617.png?compression=lossy", "https://connetixtiles.com/product/rainbow-mini-pack-24-pc/"],
  ["connetix-rainbow-rectangle-pack-18", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/201/3629/image_1785733602__50857.1785733604.png?compression=lossy", "https://connetixtiles.com/product/rainbow-rectangle-pack-18-pc/"],
  ["connetix-rainbow-shape-expansion-36", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/205/3668/image_1785733668__42976.1785733670.png?compression=lossy", "https://connetixtiles.com/product/rainbow-shape-expansion-pack-36-pc/"],
  ["connetix-rainbow-square-pack-42", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/206/3676/image_1785733683__22290.1785733685.png?compression=lossy", "https://connetixtiles.com/product/rainbow-square-pack-42-pc/"],
  ["connetix-rainbow-starter-60", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/208/3695/image_1785733716__20393.1785733718.png?compression=lossy", "https://connetixtiles.com/product/rainbow-starter-pack-60-pc/"],
  ["connetix-rainbow-transport-pack-50", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/207/3684/image_1785733697__86409.1785733699.png?compression=lossy", "https://connetixtiles.com/product/rainbow-transport-pack-50-pc/"],
  ["connetix-super-ball-run-pack-134", "https://cdn11.bigcommerce.com/s-uy8s41qw5g/images/stencil/original/products/212/3736/image_1785733788__58721.1785733790.jpg?compression=lossy", "https://connetixtiles.com/product/rainbow-super-ball-run-pack-134-pieces/"],
  ["ltv-woodland-activity-walker", "https://letoyvan.com/cdn/shop/files/PL112-activity-walker-Amazon-Listing-310726-01.jpg?v=1785928856&width=2048", "https://letoyvan.com/products/activity-walker"],
  ["ltv-shop-card-machine", "https://letoyvan.com/cdn/shop/files/TV320-red-card-machine-wooden-toy-reciept-payment-card-roleplay-till-money-shopping-boy-girl-gift-_1.jpg?v=1775833994&width=2048", "https://letoyvan.com/products/card-machine"],
  ["ltv-market-fish-crate", "https://letoyvan.com/cdn/shop/files/TV184-fresh-fish-crate-wooden-playfood-toy-seafood-ocean-animals-eco-healthy-market-food-kids-gift-blue_1.jpg?v=1730210599&width=2048", "https://letoyvan.com/products/fresh-fish-crate"],
  ["ltv-mushroom-hammer-game", "https://letoyvan.com/cdn/shop/files/PL092-woodland-wooden-hammer-toy-mushroom-game-baby-toddler-forest-eco-leaves-wood-red-white-gift-boy-girl_8.jpg?v=1730414921&width=2048", "https://letoyvan.com/products/hammer-game-mr-mushroom"],
  ["ltv-tool-bench", "https://letoyvan.com/cdn/shop/products/TV448-my-first-tool-bench-front-view-with-accessories.jpg?v=1657814240&width=2048", "https://letoyvan.com/products/my-tool-bench"],
  ["ltv-bird-house-shape-sorter", "https://letoyvan.com/cdn/shop/files/PL085-Woodland-Bird-House-Shape-Sorter-Wooden-Toy-Gift-Red-Rainbow-Montessori-_1.jpg?v=1783329940&width=2048", "https://letoyvan.com/products/little-bird-house"],
  ["ltv-woodland-ride-on-deer", "https://letoyvan.com/cdn/shop/files/PL103-Ride-on-Deer-Listing-2023-01.jpg?v=1707217682&width=2048", "https://letoyvan.com/products/ride-on-deer"],
  ["ltv-smoothie-fruit-crate", "https://letoyvan.com/cdn/shop/files/TV183-fruits-five-a-day-crate-wooden-playfood-toy-banana-peach-strawberry-watermelon-eco-healthy-market-food-kids-gift_1.jpg?v=1730211727&width=2048", "https://letoyvan.com/products/fruits-crate"],
  ["ltv-orchard-fruits-crate", "https://letoyvan.com/cdn/shop/files/TV191-apples-pears-crate-wooden-playfood-toy-orchard-organic-fruits-eco-market-food-kids-gift-red-green_0.jpg?v=1730210960&width=2048", "https://letoyvan.com/products/apples-pears-market-crate"],
  ["ltv-cupcake-set", "https://letoyvan.com/cdn/shop/files/TV331-Cupcakes-Petits-Fours-Chocolate-Strawberry-Lemon-Blueberry-Eco-Gift-Plastic-Free-_1.jpg?v=1775834213&width=2048", "https://letoyvan.com/products/cupcakes"],
  ["ltv-doughnut-set", "https://letoyvan.com/cdn/shop/files/TV332-Doughnuts-Donuts-Chocolate-Strawberry-Blueberry-Pistachio-Eco-Gift-Le-Toy-Van-_1.jpg?v=1775834105&width=2048", "https://letoyvan.com/products/doughnut-set"],
  ["ltv-oxford-play-kitchen", "https://letoyvan.com/cdn/shop/files/TV325-oxford-wooden-play-kitchen-with-accessories.jpg?v=1728323847&width=2048", "https://letoyvan.com/products/oxford-toy-kitchen"],
  ["ltv-takeaway-smoothie-trio", "https://letoyvan.com/cdn/shop/files/TV336-Takeaway-Smoothies-Juice-Milkshake-Strawberry-Banana-Kiwi-Le-Toy-Van-_1.jpg?v=1750952184&width=2048", "https://letoyvan.com/products/take-away-fruit-smoothies"],
  ["ltv-rattan-family-kitchen", "https://letoyvan.com/cdn/shop/files/TV347-ultimate-large-family-wooden-toy-play-kitchen-white-eco-playfood-roleplay-accessories-included_19.jpg?v=1775638542&width=2048", "https://letoyvan.com/products/large-kitchen"],
  ["ltv-organic-pasta-set", "https://letoyvan.com/cdn/shop/files/TV339-organic-pasta-set-roleplay-wooden-toy.jpg?v=1705597711&width=2048", "https://letoyvan.com/products/organic-pasta-set"],
  ["ltv-supermarket-grocery", "https://letoyvan.com/cdn/shop/files/TV354-supermarket-groceries-shop-playfood-wooden-toy-market-kitchen--chocolate-smoothie-pasta-tea-cheese-_1_873a1d4c-2fce-473f-a044-b2f58fd11657.jpg?v=1752594243&width=2048", "https://letoyvan.com/products/supermarket-grocery-weekly-shop"],
  ["ltv-wooden-toy-plane", "https://letoyvan.com/cdn/shop/files/TV809-wooden-toy-commercial-plane-airline-aeroplane-solid-wood-white-black-eco-boy-girl-kids-luxury-gift-engraved_1.jpg?v=1730213356&width=2048", "https://letoyvan.com/products/wooden-toy-plane"],
  ["ltv-three-tier-cake-stand", "https://letoyvan.com/cdn/shop/files/TV288-three-tier-patisserie-cake-stand.jpg?v=1721827631&width=2048", "https://letoyvan.com/products/three-tier-cake-stand"],
  ["ltv-vintage-kettle", "https://letoyvan.com/cdn/shop/files/TV282-wooden-kettle-toy-imaginative-play-kitchen-roleplay-cooking-playfood-tea-coffee-cream-pink-wood-gift-plastic-free.jpg?v=1730212311&width=2048", "https://letoyvan.com/products/vintage-kettle"],
  ["ltv-takeout-coffee-smoothie", "https://letoyvan.com/cdn/shop/files/TV336-tea-TV337-coffee-and-fruit-smoothie-assortment.jpg?v=1729695478&width=2048", "https://letoyvan.com/products/takeaway-play-set"],
  ["ltv-chicken-coop", "https://letoyvan.com/cdn/shop/files/ME1202-chicken-coop-toy-rooster-hen-farm-dolls-house-accessory-_0.jpg?v=1750840473&width=2048", "https://letoyvan.com/products/chicken-coop-playset"],
  ["ltv-dubois-family-dolls", "https://letoyvan.com/cdn/shop/files/P058-Wooden-Dubois-Peg-Doll-Family-Mum-Dad-Brother-Sister-Toddler-_1.jpg?v=1752849364&width=2048", "https://letoyvan.com/products/dubois-wooden-family-dolls"],
  ["ltv-wooden-microwave", "https://letoyvan.com/cdn/shop/files/TV3002-Microwave-White-Wood-Toy-Kitchen-Cooking-Roleplay-FSC-Appliance_3.jpg?v=1750843483&width=2048", "https://letoyvan.com/products/wooden-microwave"],
  ["ltv-barista-cafe-shop", "https://letoyvan.com/cdn/shop/files/TV3004-Barista-Cafe-Shop-Coffee-Cakes-Bagel-Tea-Wooden-Toy_2_edccfe0d-6c89-46af-9f40-9c129749e27d.jpg?v=1775638283&width=2048", "https://letoyvan.com/products/barista-cafe-shop"],
  ["ltv-honeybake-blender", "https://letoyvan.com/cdn/shop/files/TV296-smoothie-blender-fruits-banana-orange-kiwi-healthy-drink-wooden-roleplay-food-eco-toy-wood-red_31.jpg?v=1730912985&width=2048", "https://letoyvan.com/products/blender-wooden-fruit-set"],
  ["ltv-honeybake-toaster", "https://letoyvan.com/cdn/shop/files/TV287-Toaster-Set-Breakfast-Jam-Honey-Butter-Bread-Le-Toy-Van-_1.jpg?v=1775833675&width=2048", "https://letoyvan.com/products/toaster-breakfast-set"],
  ["ltv-pizza-toppings", "https://letoyvan.com/cdn/shop/files/TV279-pizza-wooden-toy-playfood-kitchen-cooking-roleplay-oven-cutter-plastic-free-gift-boy-girl-pretend-play-_1.jpg?v=1752497825&width=2048", "https://letoyvan.com/products/wooden-pizza"],
  ["ltv-pots-pans", "https://letoyvan.com/cdn/shop/products/TV301-pots-and-pans-blue-copper.jpg?v=1641304800&width=2048", "https://letoyvan.com/products/pots-pans"],
  ["ltv-sliceable-birthday-cake", "https://letoyvan.com/cdn/shop/files/TV273-Sliceable-Birthday-Cake-Wooden-Toy-Plastic-Free-FSC-Gift_1.jpg?v=1782221708&width=2048", "https://letoyvan.com/products/vanilla-birthday-cake"],
  ["ltv-egg-cup-soldiers", "https://letoyvan.com/cdn/shop/files/TV315-wooden-egg-cup-playfood-toy-yellow-chicken-soldiers-roleplay-kitchen-boy-girl-gift-honeybake-_1.jpg?v=1751362490&width=2048", "https://letoyvan.com/products/egg-cup"],
  ["ltv-chopping-board-food", "https://letoyvan.com/cdn/shop/files/TV355-chopping-board-super-food-knife-peeler-wooden-playfood-kitchen-roleplay-vegetables-fruits-vegan-lemon_1.jpg?v=1751016172&width=2048", "https://letoyvan.com/products/chopping-board-super-foods"],
  ["smartgames-gnome-sweet-gnome", "https://www.smartgamesusa.com/sites/default/files/SG%20038%20GnomeSweetGnome_PDP-banner.jpg", "https://www.smartgamesusa.com/one-player-games/gnome-sweet-gnome"],
  ["smartgames-iq-love", "https://www.smartgamesusa.com/sites/default/files/IQ_love_banner.png", "https://www.smartgamesusa.com/one-player-games/iq-love"],
  ["smartgames-dress-code", "https://www.smartgamesusa.com/sites/default/files/SG_DressCode_PDPbanner-EN_0.jpg", "https://www.smartgamesusa.com/one-player-games/dress-code"],
  ["smartgames-safari-park-jr", "https://www.smartgamesusa.com/sites/default/files/smartgames_US_SafariParkJr_banner.jpg", "https://www.smartgamesusa.com/one-player-games/safari-park-jr"],
  ["smartgames-peek-a-zoo", "https://www.smartgamesusa.com/sites/default/files/SG_PeekAZoo_PDPbanner_MULTI.jpg", "https://www.smartgamesusa.com/one-player-games/peek-zoo"],
  ["smartgames-camelot-jr", "https://www.smartgamesusa.com/sites/default/files/smartgames_US_Camlot-Jr_banner2024.jpg", "https://www.smartgamesusa.com/one-player-games/camelot-jr"],
  ["smartgames-day-night", "https://www.smartgamesusa.com/sites/default/files/smartgames_DayNight_Multi_banner.jpg", "https://www.smartgamesusa.com/one-player-games/day-night"],
  ["smartgames-trucky-3", "https://www.smartgamesusa.com/sites/default/files/smartgames_trucky3_banner.jpg", "https://www.smartgamesusa.com/one-player-games/trucky-3"],
  ["smartgames-bunny-boo", "https://www.smartgamesusa.com/sites/default/files/smartgames-product-banner_Bunny-Boo_0.jpg", "https://www.smartgamesusa.com/one-player-games/bunny-boo"],
  ["smartgames-three-little-piggies-deluxe", "https://www.smartgamesusa.com/sites/default/files/smartgames_US_TLP_banner.jpg", "https://www.smartgamesusa.com/one-player-games/three-little-piggies-deluxe"],
  ["smartgames-color-code", "https://www.smartgamesusa.com/sites/default/files/SG-090-US-Colour-Code_PDP-Banner.jpg", "https://www.smartgamesusa.com/one-player-games/color-code"],
  ["smartgames-little-red-riding-hood-deluxe", "https://www.smartgamesusa.com/sites/default/files/smartgames_US_LRRH_banner.jpg", "https://www.smartgamesusa.com/one-player-games/little-red-riding-hood-deluxe"],
  ["smartgames-smartcar-5x5", "https://www.smartgamesusa.com/sites/default/files/smartgames_smartcar_5x5_banner.jpg", "https://www.smartgamesusa.com/one-player-games/smartcar-5x5"],
  ["smartgames-iq-puzzler-pro", "https://www.smartgamesusa.com/sites/default/files/smartgames-product-banner_IQ-Puzzler-Pro_0.jpg", "https://www.smartgamesusa.com/one-player-games/iq-puzzler-pro"],
  ["smartgames-iq-stars", "https://www.smartgamesusa.com/sites/default/files/smartgames-product-banner_IQStars_0.jpg", "https://www.smartgamesusa.com/one-player-games/iq-stars"],
  ["smartgames-sleeping-beauty", "https://www.smartgamesusa.com/sites/default/files/smartgames_sleeping_beauty_banner.jpg", "https://www.smartgamesusa.com/one-player-games/sleeping-beauty"],
  ["smartgames-smart-farmer", "https://www.smartgamesusa.com/sites/default/files/smartgames_US_SmartFarmer_banner.jpg", "https://www.smartgamesusa.com/one-player-games/smart-farmer"],
  ["smartgames-jack-beanstalk", "https://www.smartgamesusa.com/sites/default/files/jack%26thebeanstalk_MULTI_banner.jpg", "https://www.smartgamesusa.com/one-player-games/jack-and-beanstalk"],
  ["smartgames-tangoes-jr", "https://www.smartgamesusa.com/sites/default/files/Tangoes_junior_banner_0.jpg", "https://www.smartgamesusa.com/one-player-games/tangoes-jr"],
  ["md-basic-skills-puzzle-board", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2024-07-09_7900beec-ae8c-4ac1-8efc-670a6f8990bc.jpg?v=1720545907", "https://www.melissaanddoug.com/products/basic-skills-puzzle-board"],
  ["melissa-doug-building-site-floor-puzzle-48-50619", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/ebb4c4a00361160686040d2410a7217acbe3ed9b.jpg?v=1770390667", "https://www.melissaanddoug.com/products/building-site-floor-puzzle-48-pieces"],
  ["md-counting-shape-stacker", "https://cdn.shopify.com/s/files/1/0550/8487/5830/products/Counting-Shape-Stacker-009275-1-Assembled-Decorated_e9aa5e91-7bf4-4515-bf50-546aa50d4287.jpg?v=1664893233", "https://www.melissaanddoug.com/products/counting-shape-stacker"],
  ["md-cardboard-blocks", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2024-07-09_e63ea964-5c08-4072-b569-c653167e7815.jpg?v=1720545477", "https://www.melissaanddoug.com/products/deluxe-jumbo-cardboard-blocks-40-pieces"],
  ["melissa-doug-farm-chunky-puzzle", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2023-11-16_f0cf62b8-aa1c-4520-81d1-a2332b6e10db.jpg?v=1700169911", "https://www.melissaanddoug.com/products/farm-chunky-puzzle-8-pieces"],
  ["md-first-bead-maze", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/6dcfb1c0e1a5f5fa223bccf315e7f39f7852ba0b.jpg?v=1743530958", "https://www.melissaanddoug.com/products/first-bead-maze"],
  ["md-forest-friends-touch-feel-puzzle", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/86462570bf02a226ec823118d7498d50aafd9785.jpg?v=1772466246", "https://www.melissaanddoug.com/products/forest-friends-touch-feel-puzzle"],
  ["melissa-doug-ice-cream-magnetic-puzzle", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2023-07-26_1bbfd544-4e74-4604-9553-99d53abaa047.jpg?v=1690417117", "https://www.melissaanddoug.com/products/wooden-magnetic-puzzle-play-set-ice-cream"],
  ["md-jumbo-knob-farm", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2024-06-19_07d0da72-7672-4d7a-8d50-79343de268e3.jpg?v=1718816253", "https://www.melissaanddoug.com/products/large-farm-jumbo-knob-puzzle-8-pieces"],
  ["md-jumbo-wooden-stacking-train", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2024-06-19_b3f76498-d4af-42cd-82dd-971459c500b9.jpg?v=1718820470", "https://www.melissaanddoug.com/products/jumbo-wooden-stacking-train-classic"],
  ["melissa-doug-latches-board", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2024-07-09_459765f6-3d1f-4b88-b2b7-7929c6858d28.jpg?v=1720545951", "https://www.melissaanddoug.com/products/wooden-latches-board"],
  ["md-match-roll-shape-sorter", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/228aea017e091926467d14e9b0658c5a683dbc53.jpg?v=1740414604", "https://www.melissaanddoug.com/products/match-roll-shape-sorter"],
  ["md-monster-bowling", "https://cdn.shopify.com/s/files/1/0550/8487/5830/products/Monster-Bowling-002210-1-Pieces-Out.jpg?v=1664901776", "https://www.melissaanddoug.com/products/monster-bowling"],
  ["melissa-doug-pound-roll-tower", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2024-07-09_f21ed058-d8cc-4c26-837a-65874e295b07.jpg?v=1720545741", "https://www.melissaanddoug.com/products/pound-roll-tower"],
  ["melissa-doug-primary-lacing-beads", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2024-07-09_5ca5c310-23fe-4dc3-b039-80d4ade7a28f.jpg?v=1720547276", "https://www.melissaanddoug.com/products/primary-lacing-beads"],
  ["melissa-doug-safari-chunky-puzzle", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2024-06-19_a51cf9b5-9c07-4cb6-bb89-bf2f693a2054.jpg?v=1718816172", "https://www.melissaanddoug.com/products/safari-chunky-puzzle-8-pieces"],
  ["melissa-doug-shape-sorting-cube", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/4654c63e4dcc40efc0d169cf2c9df3f46d330c1a.jpg?v=1739386981", "https://www.melissaanddoug.com/products/shape-sorting-cube-classic-toy"],
  ["md-slice-bake-cookie", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2023-11-02_c8a1beca-b9a1-4113-936c-ebea524f9bae.jpg?v=1698950674", "https://www.melissaanddoug.com/products/slice-and-bake-cookie-set-wooden-play-food"],
  ["md-take-along-shape-sorter", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2024-07-09_7e42c7dd-170c-41c0-b022-2a239e0ce3bc.jpg?v=1720548173", "https://www.melissaanddoug.com/products/take-along-shape-sorter-baby-and-toddler-toy"],
  ["md-take-along-sorting-barn", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2024-07-09_41a525fb-49b4-40bd-a8b1-96a3b281bf30.jpg?v=1720546404", "https://www.melissaanddoug.com/products/take-along-sorting-barn"],
  ["melissa-doug-take-along-town", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2024-07-09_cb4bc4f5-6599-43e8-991e-ad427a6800ed.jpg?v=1720548401", "https://www.melissaanddoug.com/products/take-along-town-play-mat"],
  ["md-wheels-on-bus-song-puzzle", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2024-06-19_3fd00187-a0a6-402b-8601-b9b34492a83b.jpg?v=1718817765", "https://www.melissaanddoug.com/products/the-wheels-on-the-bus-sound-puzzle"],
  ["melissa-doug-water-wow-animals", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2023-11-16_698ce4e9-d4de-4e97-a18d-40ca5cd95d3b.jpg?v=1700170332", "https://www.melissaanddoug.com/products/water-wow-animals-on-the-go-travel-activity"],
  ["melissa-doug-water-wow-safari", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2023-12-06_455a0d6f-b4d8-41c9-9c9e-dd9a6b77fcac.jpg?v=1701871765", "https://www.melissaanddoug.com/products/water-wow-safari-water-reveal-pad-on-the-go-travel-activity"],
  ["melissa-doug-water-wow-under-the-sea", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2023-12-06_f0e7c0dc-7948-4d68-8f71-3535f061a394.jpg?v=1701871995", "https://www.melissaanddoug.com/products/water-wow-under-the-sea-water-reveal-pad-on-the-go-travel-activity"],
  ["melissa-doug-water-wow-vehicles", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/08fe281cca54aef662d5eb29b0e20181d21bc380.jpg?v=1739901027", "https://www.melissaanddoug.com/products/water-wow-vehicles-on-the-go-travel-activity"],
  ["melissa-doug-wooden-doorbell-house", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2024-07-09_f5919d5d-4303-40a6-b97e-5d6028b57bd9.jpg?v=1720547758", "https://www.melissaanddoug.com/products/wooden-doorbell-house"],
  ["md-peg-puzzle-bundle-farm-vehicles-safari-pets", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2023-11-06_2501d4ef-28c5-4842-b824-c79ff1a9580d.jpg?v=1699289285", "https://www.melissaanddoug.com/products/peg-puzzle-bundle-farm-vehicles-and-safari"],
  ["haba-wooden-building-blocks-60", "https://www.habausa.com/cdn/shop/files/large-basic-building-blocks-60pc-1070-1.jpg?v=1709767172", "https://www.habausa.com/products/large-starter-blocks-set"],
  ["haba-rhino-hero", "https://www.habausa.com/cdn/shop/files/games-rhino-hero-4789-1.jpg?v=1698432047", "https://www.habausa.com/products/rhino-hero"],
  ["haba-my-very-first-games-first-orchard", "https://www.habausa.com/cdn/shop/files/games-first-orchard-3177-1_7655b16-3c6e-4f61-ac71-46902421bd34.jpg?v=1698430362", "https://www.habausa.com/products/my-very-first-games-first-orchard"],
  ["haba-basic-building-blocks-102-piece-extra-large-wooden-starter-set", "https://www.habausa.com/cdn/shop/files/extra-large-basic-building-blocks-102pc-1077-1.jpg?v=1709767105", "https://www.habausa.com/products/extra-large-starter-blocks-set"],
  ["haba-my-very-first-games-here-fishy-fishy-magnetic-game", "https://www.habausa.com/cdn/shop/files/games-here-fishy-fishy-5661-1.jpg?v=1729800891", "https://www.habausa.com/products/my-very-first-games-here-fishy-fishy"],
  ["haba-town-maze-magnetic-puzzle-game", "https://www.habausa.com/cdn/shop/products/magnetic-game-town-maze-301056-1.jpg?v=1698434451", "https://www.habausa.com/products/town-maze-magnetic-game"],
  ["haba-my-very-first-games-building-site", "https://www.habausa.com/cdn/shop/files/games-building-site-305678-1.jpg?v=1724705448", "https://www.habausa.com/products/my-very-first-games-building-site"],
  ["haba-my-very-first-games-animal-upon-animal-junior", "https://www.habausa.com/cdn/shop/files/games-mvfg-animal-upon-animal-jr-306069-1.jpg?v=1715889288", "https://www.habausa.com/products/my-very-first-games-animal-upon-animal-junior"],
  ["haba-my-very-first-games-hanna-honeybee", "https://www.habausa.com/cdn/shop/files/games-hanna-honeybee-1301838002-1.jpg?v=1721867394", "https://www.habausa.com/products/my-very-first-games-hanna-honeybee"],
  ["haba-hanging-doorway-puppet-theater", "https://www.habausa.com/cdn/shop/files/doorway-theater-7281-1_e4b9e641-30e7-4401-9296-15a9875a9a93.jpg?v=1704764309", "https://www.habausa.com/products/hanging-doorway-puppet-theater"],
  ["haba-my-very-first-games-forest-friends", "https://www.habausa.com/cdn/shop/files/games-mvfg-forest-friends-306606-1.jpg?v=1758565882", "https://www.habausa.com/products/mvfg-forest-friends"],
  ["haba-kullerbu-mountain-adventure", "https://www.habausa.com/cdn/shop/files/kullerbu-mountain-adventure-track-set-1306017001-1_d5812c34-2b86-45b8-9a97-c244afcd09a7.jpg?v=1718246939", "https://www.habausa.com/products/kullerbu-mountain-adventure-track-set"],
  ["haba-my-very-first-games-go-go-little-penguin", "https://www.habausa.com/cdn/shop/files/games-go-go-little-penguin-307056-1.jpg?v=1719262372", "https://www.habausa.com/products/my-very-first-games-go-go-little-penguin"],
  ["haba-unicorn-glitterluck-cloud-crystals", "https://www.habausa.com/cdn/shop/files/games-unicorn-glitterluck-cloud-crystals-2012230002-1.jpg?v=1752229128", "https://www.habausa.com/products/unicorn-glitterluck-cloud-crystals-game"],
  ["haba-my-very-first-games-block-by-block", "https://www.habausa.com/cdn/shop/files/games_MVFG_Block-by-Block_2012209002-1_61407137-fec3-41ea-994c-6cd1d3259114.jpg?v=1778684358", "https://www.habausa.com/products/haba-my-very-first-games-block-by-block"],
  ["haba-my-first-racetrack", "https://www.habausa.com/cdn/shop/files/HABA-cars-my-first-racetrack-2011834001-8.jpg?v=1761601189", "https://www.habausa.com/products/haba-cars-my-first-race-track"],
  ["haba-little-bird-big-hunger", "https://www.habausa.com/cdn/shop/files/games-Little-Bird-Big-Hunger-302703-1.jpg?v=1772068218", "https://www.habausa.com/products/little-bird-big-hunger"],
  ["haba-my-very-first-games-teddy-s-colors-and-shapes", "https://www.habausa.com/cdn/shop/files/mvfg-teddys-colors-and-ahapes-1005878004-1-1.jpg?v=1758315052", "https://www.habausa.com/products/my-very-first-games-teddys-colors-and-shapes"],
  ["haba-lighthouse-rainbow-stacker", "https://www.habausa.com/cdn/shop/files/stacking-toy-lighthouse-300170-1.jpg?v=1739485277", "https://www.habausa.com/products/lighthouse-stacking-game"]
]);

// src/data/catalog-image-assets-batch3.js
var BATCH3_OFFICIAL_IMAGE_ROWS = Object.freeze([
  ["mfb-animals-activity", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/1_7b33c7b7-c9d6-4efc-9f5c-82d275ff0fad-364598.jpg?v=1732083463", "https://myfirstbook.us/products/mini-book-panda"],
  ["mfb-baby-shark", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/Everything_Included_in_My_First_Book_Baby_Shark_Busy_Book-197276.jpg?v=1732083467", "https://myfirstbook.us/products/my-first-book-baby-shark"],
  ["mfb-birds-activity", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/1_9753a275-21fc-4cc4-bae6-5e619b7670d8.jpg?v=1740195889", "https://myfirstbook.us/products/small-hands-birds"],
  ["mfb-busy-farm-official", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/ProductPhoto_farm-130597.jpg?v=1732083466", "https://myfirstbook.us/products/my-first-book-busy-farm"],
  ["mfb-bath-hello-kitty", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/KT.jpg?v=1753937541", "https://myfirstbook.us/products/bath-magic-book-hello-kitty"],
  ["mfb-bath-keroppi", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/kr.jpg?v=1753937311", "https://myfirstbook.us/products/bath-magic-book-keroppi-frog"],
  ["mfb-bath-ocean", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/01.jpg?v=1753937324", "https://myfirstbook.us/products/bath-magic-book-ocean"],
  ["mfb-dinosaur-official", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/Everything_Included_in_My_First_Book_Dinosaur_Busy_Book_1.png?v=1757354379", "https://myfirstbook.us/products/my-first-book-dinosaur"],
  ["mfb-fruits-activity", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/1_2b0a4596-704e-4c31-912d-07aa45ad1025-976892.jpg?v=1732083465", "https://myfirstbook.us/products/mini-book-strawberry"],
  ["mfb-hello-kitty", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/Screenshot_2025-12-17_043226_1.png?v=1765917201", "https://myfirstbook.us/products/my-first-book-hello-kitty"],
  ["mfb-keroppi-frog", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/Screenshot_2025-12-17_034320_1.png?v=1765914253", "https://myfirstbook.us/products/my-first-book-keroppi-frog"],
  ["mfb-life-skills", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/Screenshot2025-11-25at1.24.28PM_59ee5330-8be4-43ea-982a-a49099e92031_1.png?v=1765307417", "https://myfirstbook.us/products/life-skills-book"],
  ["mfb-lucky-cat", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/My_First_Book_Lucky_Cat_Busy_Book-904240.jpg?v=1732083464", "https://myfirstbook.us/products/my-first-book-lucky-cat"],
  ["mfb-marine-animals-activity", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/1_a3c92f53-9c89-4103-89f8-a38f1238e4c1.jpg?v=1738207376", "https://myfirstbook.us/products/small-hands-tropical-animal"],
  ["mfb-nordic-forest-official", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/My_First_Book_Nordic_Forest_Busy_Book-420249.jpg?v=1732083463", "https://myfirstbook.us/products/my-first-book-nordic-forest"],
  ["mfb-pet-friends-official", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/Pet_friends_busy_book_close_up-953283.jpg?v=1732083461", "https://myfirstbook.us/products/my-first-book-pet-friends"],
  ["mfb-princess", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/Princess_busy_book_product_photo-590515.jpg?v=1732083464", "https://myfirstbook.us/products/my-first-book-princess"],
  ["mfb-shape-cognition-activity", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/1_d09012e7-e1ad-484e-af47-0224be316267.jpg?v=1738207376", "https://myfirstbook.us/products/small-hands-shape-cognition"],
  ["mfb-space-official", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/space_busy_book_product_photo-601583.jpg?v=1732083465", "https://myfirstbook.us/products/my-first-book-space"],
  ["mfb-vegetables-activity", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/1_5aa1d6e4-acb1-4f49-9fc1-527ca9d34870-543354.jpg?v=1732083466", "https://myfirstbook.us/products/mini-book-vegetables"],
  ["mfb-wild-jungle-official", "https://cdn.shopify.com/s/files/1/0701/3371/1090/files/IMG-2092.png?v=1777948131", "https://myfirstbook.us/products/wild-jungle-book"],
  ["manhattan-toy-baby-whoozit", "https://cdn.shopify.com/s/files/1/1373/4191/products/crqbzuyt9u2mlr7kxs5i.jpg?v=1673022406", "https://www.manhattantoy.com/products/baby-whoozit"],
  ["manhattan-toy-tree-top-adventure", "https://cdn.shopify.com/s/files/1/1373/4191/products/212280-Tree-Top-Adventure-toy-63.jpg?v=1742331506", "https://www.manhattantoy.com/products/tree-top-adventure"],
  ["green-toys-ferry-boat", "https://cdn.shopify.com/s/files/1/0149/8336/4708/files/DeluxeFerryboat_FRB4MC-FFP_210331.jpg?v=1687373043", "https://www.greentoys.com/products/deluxe-ferry-boat-set"],
  ["green-toys-recycling-truck", "https://cdn.shopify.com/s/files/1/0149/8336/4708/products/Recycling_Truck.gif?v=1669658264", "https://www.greentoys.com/products/gt-recycling-truck"],
  ["green-toys-soft-top-push-car", "https://cdn.shopify.com/s/files/1/0149/8336/4708/files/STCR-1827_45a.jpg?v=1733427115", "https://www.greentoys.com/products/soft-top-push-car"],
  ["green-toys-stacker", "https://cdn.shopify.com/s/files/1/0149/8336/4708/products/Webp.net-gifmaker_1.gif?v=1626906784", "https://www.greentoys.com/products/gt-stacker"],
  ["green-toys-stacking-cups", "https://cdn.shopify.com/s/files/1/0149/8336/4708/products/Webp.net-gifmaker.gif?v=1573857718", "https://www.greentoys.com/products/gt-stacking-cups-assortment"],
  ["moluk-bilibo", "https://cdn.shopify.com/s/files/1/0778/2108/3981/files/bilibo-green-movement-toy-spinning.gif?v=1754412653", "https://www.moluk.com/products/bilibo-movement-toy"],
  ["moluk-mini-bilibo", "https://cdn.shopify.com/s/files/1/0778/2108/3981/files/bilibo-mini-classic-colors.jpg?v=1754576612", "https://www.moluk.com/products/bilibo-mini-open-ended-play-set"],
  ["moluk-mox", "https://cdn.shopify.com/s/files/1/0778/2108/3981/files/mox-sensory-ball-yellow-laugh.gif?v=1753638176", "https://www.moluk.com/products/mox-sensory-ball"],
  ["moluk-nello", "https://cdn.shopify.com/s/files/1/0778/2108/3981/files/nello-ring-puzzle-colors.gif?v=1753716815", "https://www.moluk.com/products/nello-ring-toy"],
  ["moluk-oogi-family", "https://cdn.shopify.com/s/files/1/0778/2108/3981/files/oogi-family-suction-cup-figures.jpg?v=1757968837", "https://www.moluk.com/products/oogi-family-suction-cup-figures"],
  ["moluk-oogi-junior", "https://cdn.shopify.com/s/files/1/0778/2108/3981/files/oogi-junior-blue-suction-cup-figure-pose-1.jpg?v=1754428523", "https://www.moluk.com/products/oogi-junior-suction-cup-figure"],
  ["moluk-plui-rainball", "https://cdn.shopify.com/s/files/1/0778/2108/3981/files/plui-rainball-sensory-bath-toy-colors.jpg?v=1754932071", "https://www.moluk.com/products/plui-rainball-bath-toy"],
  ["grimms-four-elements", "https://cdn.shopify.com/s/files/1/0870/5697/4090/files/art10216a29ff6d9ab244388a8bcceb511b1399c.jpg?v=1733772766", "https://www.grimms.eu/en/products/four-elements-building-set"],
  ["grimms-large-rainbow", "https://cdn.shopify.com/s/files/1/0870/5697/4090/files/art10670105e532d4a1a43318ba719674e169b82.jpg?v=1733767538", "https://www.grimms.eu/en/products/large-rainbow"],
  ["grimms-large-stepped-pyramid", "https://cdn.shopify.com/s/files/1/0870/5697/4090/files/art42090e14d9af7fffb4f868885296dd63b536f.jpg?v=1733765972", "https://www.grimms.eu/en/products/large-stepped-pyramid"],
  ["grimms-medium-rainbow", "https://cdn.shopify.com/s/files/1/0870/5697/4090/files/art107008e6607b70f3a4651bd6fe078635deb4c.jpg?v=1733768796", "https://www.grimms.eu/en/products/rainbow"],
  ["grimms-building-boards-rainbow", "https://cdn.shopify.com/s/files/1/0870/5697/4090/files/10668_Bauplatten_Regenbogen_v6.jpg?v=1779184661", "https://www.grimms.eu/en/products/rainbow-building-boards"],
  ["grimms-rainbow-friends", "https://cdn.shopify.com/s/files/1/0870/5697/4090/files/10581_regenbogenbande_v6eclqk4lgxuxqp.jpg?v=1733763153", "https://www.grimms.eu/en/products/rainbow-friends"],
  ["grimms-rainbow-semi-circles", "https://cdn.shopify.com/s/files/1/0870/5697/4090/files/art106756bbb050297f240138396535738620c16.jpg?v=1733771673", "https://www.grimms.eu/en/products/rainbow-semi-circles"],
  ["grimms-stacking-bowls-rainbow", "https://cdn.shopify.com/s/files/1/0870/5697/4090/files/art42125def736d20b5645fbbf3b404bf25216a3.jpg?v=1733769075", "https://www.grimms.eu/en/products/rainbow-bowls-sorting-game"],
  ["little-tikes-activity-garden", "https://cdn.shopify.com/s/files/1/0539/4402/5275/products/8400_8b170f9d-e603-41b1-b183-1dfde94e4aba.jpg?v=1631655154", "https://www.littletikes.com/products/activity-garden"],
  ["little-tikes-cozy-coupe", "https://cdn.shopify.com/s/files/1/0539/4402/5275/products/5502_efd5e0fe-38a8-4f9a-83d4-35eb71b34482.jpg?v=1631739855", "https://www.littletikes.com/products/cozy-coupe"],
  ["little-tikes-learn-play-3-in-1-activity-walker", "https://cdn.shopify.com/s/files/1/0539/4402/5275/files/640957-Light-and-Go-Walker.jpg?v=1707151300", "https://www.littletikes.com/products/light-n-go-3-in-1-activity-walker"],
  ["little-tikes-first-slide", "https://cdn.shopify.com/s/files/1/0539/4402/5275/products/624605M81-First-Slide4.jpg?v=1679670153", "https://www.littletikes.com/products/little-tikes-first-slide"],
  ["fisher-price-4-in-1-ultimate-learning-bot", "https://cdn.shopify.com/s/files/1/0600/0141/9429/files/obpg2be53b6frm7jsajv.jpg?v=1712069167", "https://shop.mattel.com/products/fisher-price-4-in-1-ultimate-learning-bot-english-french-version-hck34-en-ca"],
  ["fisher-price-babys-first-blocks", "https://cdn.shopify.com/s/files/1/0600/0141/9429/files/jkrjblmglvo0c81joyjz.jpg?v=1784557824", "https://shop.mattel.com/products/babys-first-blocks-ffc84"],
  ["fisher-price-chatter-telephone", "https://cdn.shopify.com/s/files/1/0600/0141/9429/files/ooqhzfxqn2cayf8zxkqz.jpg?v=1763568921", "https://shop.mattel.com/products/fisher-price-chatter-telephone-fgw66"],
  ["fisher-price-classic-xylophone", "https://cdn.shopify.com/s/files/1/0600/0141/9429/files/ialqiiqgm9yemx7hjpsh.jpg?v=1763566349", "https://shop.mattel.com/products/fisher-price-classic-xylophone-cmy09"],
  ["fisher-price-kick-play-piano-gym", "https://cdn.shopify.com/s/files/1/0600/0141/9429/files/3a9d9b6f48985eb693a52d70d8a60334a1826214.jpg?v=1762272921", "https://shop.mattel.com/products/fisher-price-deluxe-kick-play-piano-gym-maracas-gdd08"],
  ["fisher-price-dj-bouncin-beats", "https://cdn.shopify.com/s/files/1/0600/0141/9429/products/d45nuxb1brvckesgzjpr_c05534c4-ae98-448a-bb0e-4ca6339c7fef.jpg?v=1696963411", "https://shop.mattel.com/products/fisher-price-dj-bouncin-beats-hjp87-en-ca"],
  ["fisher-price-drop-through-rock-a-stack", "https://cdn.shopify.com/s/files/1/0600/0141/9429/files/0719efffb230d3ba38337ab7f391921bcf6627ea.jpg?v=1784819423", "https://shop.mattel.com/products/fisher-price-drop-through-rock-a-stack-jlb81"],
  ["fisher-price-giant-rock-a-stack", "https://cdn.shopify.com/s/files/1/0600/0141/9429/files/7328cc2363d2341a3e136e420c132d02abe8fb2d.jpg?v=1749073820", "https://shop.mattel.com/products/fisher-price-giant-rock-a-stack-gjw15"],
  ["fisher-price-laugh-learn-game-controller", "https://cdn.shopify.com/s/files/1/0600/0141/9429/files/ysmirrzpkcjcinzkz1fa.jpg?v=1744817136", "https://shop.mattel.com/products/fisher-price-laugh-learn-game-learn-controller-fnt06-en-ca"],
  ["fisher-price-laugh-learn-mix-learn-dj-table", "https://cdn.shopify.com/s/files/1/0600/0141/9429/files/mkbrrtumloxcqosfblwv.jpg?v=1758900418", "https://shop.mattel.com/products/fisher-price-mix-learn-dj-table-hlm43"],
  ["fisher-price-learn-with-puppy-walker", "https://cdn.shopify.com/s/files/1/0600/0141/9429/files/uipqsepr7tr4ohcxylcx_fad1d298-5405-4ffe-99b3-c078d0019bc1.jpg?v=1713456927", "https://shop.mattel.com/products/fisher-price-laugh-learn-smart-stages-learn-with-puppy-walker-frr76-en-ca"],
  ["fisher-price-laugh-learn-smart-stages-puppy", "https://cdn.shopify.com/s/files/1/0600/0141/9429/files/daqii7ibnbuklquru4td_bb06585d-ca89-45d6-a380-8b0919b9293d.png?v=1713456937", "https://shop.mattel.com/products/fisher-price-laugh-learn-smart-stages-puppy-english-version-fdf21-en-ca"],
  ["fisher-price-little-people-farm", "https://cdn.shopify.com/s/files/1/0600/0141/9429/files/jobtaaaegqhmhndnivdg.jpg?v=1714665332", "https://shop.mattel.com/products/fisher-price-little-people-caring-for-animals-farm-bilingual-edition-gxf15-en-ca"],
  ["fisher-price-little-people-caring-fun-animal-farm", "https://cdn.shopify.com/s/files/1/0600/0141/9429/files/796443b5fe8ff5c9ee4e7a1f6403423e4d1eb08c_782bce95-952f-4f42-ba51-68a24a66bce9.jpg?v=1763566350", "https://shop.mattel.com/products/fisher-price-little-people-caring-fun-animal-farm-playset-jcw65"],
  ["fisher-price-little-people-farm-animal-friends", "https://cdn.shopify.com/s/files/1/0600/0141/9429/files/mzp6ktsr7rlhf5l17cft.jpg?v=1749074421", "https://shop.mattel.com/products/fisher-price-little-people-farm-animal-friends-gfl21"],
  ["fisher-price-little-people-light-up-learning-camper", "https://cdn.shopify.com/s/files/1/0600/0141/9429/files/amnfqznthjmb886hdzzk.jpg?v=1734132792", "https://shop.mattel.com/products/fisher-price-little-people-light-up-learning-camper-hgp71"],
  ["mega-bloks-build-n-tumble-table", "https://cdn.shopify.com/s/files/1/0600/0141/9429/files/z0ohxpvrlhctdjc1gtca.jpg?v=1744817731", "https://shop.mattel.com/products/mega-bloks-build-n-tumble-table-hhm99-en-ca"],
  ["magna-tiles-builder-32", "https://cdn.shopify.com/s/files/1/0734/5009/4831/files/25Builder_FR11_RGB_1.jpg?v=1766428281", "https://magnatiles.com/products/magna-tiles-builder-32-piece-set"],
  ["magna-tiles-classic-32", "https://cdn.shopify.com/s/files/1/0734/5009/4831/files/25Classic32_FR11_RGB.jpg?v=1748978065", "https://magnatiles.com/products/magna-tiles-classic-32-piece-set"],
  ["tegu-pocket-pouch", "https://cdn.shopify.com/s/files/1/0070/8709/5898/products/24_-_A-10-012-SJG_1.png?v=1564187230", "https://tegu.com/products/tegu-pocket-pouch-magnetic-wooden-block-set-8-pieces"],
  ["tegu-pocket-pouch-prism", "https://cdn.shopify.com/s/files/1/0070/8709/5898/products/19_-_P-11-045-SJG_1.png?v=1614649864", "https://tegu.com/products/tegu-pocket-pouch-magnetic-wooden-block-set-6-pieces"],
  ["radio-flyer-4-in-1-stroll-n-trike", "https://cdn.shopify.com/s/files/1/0780/4092/4433/products/481t-img-hero.jpg?v=1710733619", "https://www.radioflyer.com/products/4-in-1-stroll-n-trike-t"],
  ["radio-flyer-busy-buggy", "https://cdn.shopify.com/s/files/1/0780/4092/4433/products/busy-buggy-model-603-shop.jpg?v=1696434502", "https://www.radioflyer.com/products/busy-buggy"],
  ["radio-flyer-classic-push-walker-wagon", "https://cdn.shopify.com/s/files/1/0780/4092/4433/files/classic-walker-wagon-model-612_3_7db92f29-b75a-4e78-a0f0-61720db162dd.jpg?v=1710539869", "https://www.radioflyer.com/products/classic-push-walker-wagon"],
  ["step2-ball-buddies-adventure-center", "https://cdn.shopify.com/s/files/1/0754/3291/9327/files/400500_t.jpg?v=1707792874", "https://www.step2.com/products/ball-buddies-adventure-center"],
  ["step2-push-around-buggy", "https://cdn.shopify.com/s/files/1/0754/3291/9327/files/717099-Push-Around-Buggy-Red-Kids-Push-Car-001.jpg?v=1708026176", "https://www.step2.com/products/push-around-buggy-10th-anniversary-edition"],
  ["step2-putt-splash-adventure-center", "https://cdn.shopify.com/s/files/1/0754/3291/9327/files/bhzrmnl3x2bagu228nwr.jpg?v=1783036931", "https://www.step2.com/products/putt-splash-adventure-center"],
  ["step2-scout-slide-climber", "https://cdn.shopify.com/s/files/1/0754/3291/9327/files/420800_w.jpg?v=1707795553", "https://www.step2.com/products/scout-slide-climber"],
  ["md-blockables-woodland-friends", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/5457708dd2ad76f1e767249bd4be0ff3f143fb83.jpg?v=1744309339", "https://www.melissaanddoug.com/products/blockables-woodland-creatures"],
  ["melissa-doug-ms-rachel-wooden-song-puzzle-50355", "https://cdn.shopify.com/s/files/1/0550/8487/5830/files/2024-10-02.jpg?v=1727881134", "https://www.melissaanddoug.com/products/ms-rachel-sound-puzzle"],
  ["haba-my-very-first-games-let-s-be-veterinarians", "https://cdn.shopify.com/s/files/1/0559/3445/1810/files/games-MVFG-lets-be-veterinarians-2011719001-1-1.jpg?v=1774882558", "https://www.habausa.com/products/my-very-first-games-at-the-vet"],
  ["baby-einstein-curiosity-table", "https://cdn.shopify.com/s/files/1/0468/2521/0022/files/02425c974aa1815d5161f4470a9204e4af68060a.jpg?v=1775233763", "https://www.kids2.com/products/10345-000-baby-einstein-curiosity-table-activity-station"],
  ["baby-einstein-magic-touch-drums", "https://cdn.shopify.com/s/files/1/0468/2521/0022/files/ffgcnaadkfo7jpvofnan.jpg?v=1775233756", "https://www.kids2.com/products/11650-000-baby-einstein-magic-touch-drums-wooden-musical-toy"],
  ["baby-einstein-magic-touch-piano", "https://cdn.shopify.com/s/files/1/0468/2521/0022/files/yeemnrdwjanrdiylzaok.jpg?v=1775233811", "https://www.kids2.com/products/11649-000-baby-einstein-magic-touch-piano-musical-toy"],
  ["baby-einstein-take-along-tunes", "https://cdn.shopify.com/s/files/1/0468/2521/0022/files/e9e6852e75847de2b486b11d4195a390cd678322.jpg?v=1775233787", "https://www.kids2.com/products/30704-000-baby-einstein-take-along-tunes-musical-toy"],
  ["baby-einstein-together-in-tune-guitar", "https://cdn.shopify.com/s/files/1/0468/2521/0022/files/ein0a4incumfhh03sub2.jpg?v=1775233758", "https://www.kids2.com/products/12805-000-baby-einstein-together-in-tune-guitar-connected-magic-touch-guitar"],
  ["infantino-textured-multi-ball", "https://cdn.shopify.com/s/files/1/0617/9701/products/206-688J_P1.jpg?v=1532985897", "https://infantino.com/products/textured-multi-ball-set"]
]);

// src/data/catalog-image-assets-batch4.js
var BATCH4_OFFICIAL_IMAGE_ROWS = Object.freeze([
  ["ikea-duktig-vegetable-set", "https://www.ikea.com/us/en/images/products/duktig-14-piece-vegetables-set__0712393_pe728809_s5.jpg", "https://www.ikea.com/us/en/p/duktig-14-piece-vegetables-set-70185750/"],
  ["ikea-duktig-cookware-set", "https://www.ikea.com/us/en/images/products/duktig-5-piece-toy-cookware-set-stainless-steel__0712391_pe728808_s5.jpg", "https://www.ikea.com/us/en/p/duktig-5-piece-toy-cookware-set-stainless-steel-00130167/"],
  ["ikea-duktig-kitchen-utensils", "https://www.ikea.com/us/en/images/products/duktig-5-piece-toy-kitchen-utensil-set-multicolor__0711777_pe728426_s5.jpg", "https://www.ikea.com/us/en/p/duktig-5-piece-toy-kitchen-utensil-set-multicolor-80130168/"],
  ["ikea-duktig-play-kitchen", "https://www.ikea.com/us/en/images/products/duktig-play-kitchen-birch__0756010_pe754469_s5.jpg", "https://www.ikea.com/us/en/p/duktig-play-kitchen-birch-60319972/"],
  ["ikea-lillabo-20-piece-basic-train", "https://www.ikea.com/us/en/images/products/lillabo-20-piece-basic-train-set-multicolor__0712392_pe728826_s5.jpg", "https://www.ikea.com/us/en/p/lillabo-20-piece-basic-train-set-multicolor-00320054/"],
  ["ikea-lillabo-3-piece-train", "https://www.ikea.com/us/en/images/products/lillabo-3-piece-train-set__0712394_pe728810_s5.jpg", "https://www.ikea.com/us/en/p/lillabo-3-piece-train-set-60320094/"],
  ["ikea-lillabo-45-piece-train", "https://www.ikea.com/us/en/images/products/lillabo-45-piece-train-set-with-track__0712397_pe728813_s5.jpg", "https://www.ikea.com/us/en/p/lillabo-45-piece-train-set-with-track-20330066/"],
  ["ikea-uppsta-shape-sorter", "https://www.ikea.com/us/en/images/products/uppsta-shape-sorter-multicolor__1293803_pe935269_s5.jpg", "https://www.ikea.com/us/en/p/uppsta-shape-sorter-multicolor-90592088/"],
  ["toi-beginner-puzzle-land-transportation-animals", "https://qiniu.digood-assets-fallback.work/210/image_1640929464_5.jpg", "https://www.toiworld.com/product/toi-beginner-puzzle-4-in-a-box-land-transportation-animals-paper-jigsaw-puzzle.html"],
  ["toi-leveled-puzzles-series", "https://qiniu.digood-assets-fallback.work/210/image_1565344248_1\u9636.png", "https://www.toiworld.com/product/toi-leveled-puzzles-educational-toy-paper-jigsaw-puzzles-for-kids.html"]
]);

// src/data/catalog-image-assets-batch5.js
var BATCH5_OFFICIAL_IMAGE_ROWS = Object.freeze([
  ["lovevery-inspector-part-1", "https://images.ctfassets.net/0sea1vycfyqy/3MEZJlHfdZlFpzCCXcL455/1107b82bccfb0eb7eb0e657d40dda478/K4.Ball.Drop.Box_BH_V1_web.png", "https://lovevery.com/products/the-play-kits-the-inspector"],
  ["lovevery-inspector-part-2", "https://images.ctfassets.net/0sea1vycfyqy/54h9EACgGgpBzQO4p0o3ye/a4b7f996c153ca8f1d5f04f904898081/K4_Wood-Balls_BH_V1_web.png", "https://lovevery.com/products/the-play-kits-the-inspector"],
  ["lovevery-inspector-part-3", "https://images.ctfassets.net/0sea1vycfyqy/6OBsNfjMxk79PbmQW7Xvjt/e1ce242c925631fe83a95d1183d51781/Lovevery-Kit4-ThingsISeeBox-3462-1_VS_R1_CL.png", "https://lovevery.com/products/the-play-kits-the-inspector"],
  ["lovevery-inspector-part-4", "https://images.ctfassets.net/0sea1vycfyqy/2EDBm3DyJtrh7COtSSD7WB/8f22706ba788ea924a8b37f7d9f03b89/K4.Stacking.Cups.png", "https://lovevery.com/products/the-play-kits-the-inspector"],
  ["lovevery-inspector-part-5", "https://images.ctfassets.net/0sea1vycfyqy/1VeQDjok32yXNvNYrb3N3g/0c2b8ca29508ece46fe5aea05c617835/Lovevery_Inspector_ISO_Baby_And_Me_Mirror_Puzzle_Overhead_0472_v2__1_.png", "https://lovevery.com/products/the-play-kits-the-inspector"],
  ["lovevery-inspector-part-6", "https://images.ctfassets.net/0sea1vycfyqy/gJ3r7EeZUCaxTzFSDGDqF/495aa8f70d9bed3c73c16e0c186e33bd/SubscriptionBox4_Animation_14736_yarn_balls_CLIENTWHITE.20210324000836444_BH_V1_web.png", "https://lovevery.com/products/the-play-kits-the-inspector"],
  ["lovevery-inspector-part-7", "https://images.ctfassets.net/0sea1vycfyqy/6PXg0KuH6OGbFPeAZ7YZqV/d4740afc6a387eb55c0b2c0450566b69/Lovevery_Play_Kit_The_Inspector_Treasure_Basket_Overhead_0075_v1__1_.png", "https://lovevery.com/products/the-play-kits-the-inspector"],
  ["lovevery-explorer-part-1", "https://images.ctfassets.net/0sea1vycfyqy/3RLZA2z1U3itvtcGMNt0rf/22454c7fd81f005252795827c2284f5e/image.png", "https://lovevery.com/products/the-play-kits-the-explorer"],
  ["lovevery-explorer-part-2", "https://images.ctfassets.net/0sea1vycfyqy/1XQuYfRPgobSwL8lZrNsOA/5654b445fdb53c2da05ac2e573a46d91/2023_06_08_ISO_S_4151_BH_V1_web.png", "https://lovevery.com/products/the-play-kits-the-explorer"],
  ["lovevery-explorer-part-3", "https://images.ctfassets.net/0sea1vycfyqy/5ICnQyXUIbf0ID7uOFi5z7/e6043a95be610f47734231e4dc31d07a/SubscriptionBox5_Lovevery-MontessoriEggCup-016-Feb2020.png", "https://lovevery.com/products/the-play-kits-the-explorer"],
  ["lovevery-explorer-part-4", "https://images.ctfassets.net/0sea1vycfyqy/aAbayfroL01gVgOPRYl7v/d585292d3d213f5f9a9f4d965aae2c53/Lovevery-VKS-Keys-161-July2020.png", "https://lovevery.com/products/the-play-kits-the-explorer"],
  ["lovevery-explorer-part-5", "https://images.ctfassets.net/0sea1vycfyqy/2Rel6YSxDHH98kmsIsRZyf/838ccc2ec620491dac16a6bfd9abfbfe/2023_05_01_ISO_2072.png", "https://lovevery.com/products/the-play-kits-the-explorer"],
  ["lovevery-explorer-part-6", "https://images.ctfassets.net/0sea1vycfyqy/6LrhjTxX9R2Qn0rqVdD1iw/2491c7d3a3b96897982dc311e3fd3ce8/2023_05_01_ISO_2083_v4.20250718175136981.png", "https://lovevery.com/products/the-play-kits-the-explorer"],
  ["lovevery-explorer-part-7", "https://images.ctfassets.net/0sea1vycfyqy/rUWK2v8ldyxQgpv7O0oWn/ba63a11a47aa39372f2cb79341271668/Lovevery-VKS-Scarf-Blue-0101-June2020.png", "https://lovevery.com/products/the-play-kits-the-explorer"],
  ["lovevery-thinker-part-1", "https://images.ctfassets.net/0sea1vycfyqy/26PUb3pwZzGRLpVs06BCqa/3f37c67f993428fa1044b03e78eaa070/organic-baby-doll_0001_Layer-3_d50b685d-f9f3-45f7-ae81-149c89503040.png", "https://lovevery.com/products/the-play-kits-the-thinker"],
  ["lovevery-thinker-part-3", "https://images.ctfassets.net/0sea1vycfyqy/50DEawHwuGzrwzyiA2tnPO/7c8f7a2c45c7d61b73dd0f9ec343271a/Lovevery-VKS-PegToy-0273-June2020-Edit-_1_.png", "https://lovevery.com/products/the-play-kits-the-thinker"],
  ["lovevery-thinker-part-4", "https://images.ctfassets.net/0sea1vycfyqy/77HLZulEvept50S2VrXFvg/66e51a4638ad28d41d5a243207f5a179/2022_11_22_Sensory_Board_S_3839_BH_V1_web.webp", "https://lovevery.com/products/the-play-kits-the-thinker"],
  ["lovevery-thinker-part-5", "https://images.ctfassets.net/0sea1vycfyqy/6zhLTR8oopNsmSFWKS5uGY/609d43a18f26fd1fdcf0c0fe36933467/SubscriptionBox6_Pincer-Puzzle.png", "https://lovevery.com/products/the-play-kits-the-thinker"],
  ["lovevery-thinker-part-6", "https://images.ctfassets.net/0sea1vycfyqy/11e03cwBljWxoezc69wNqe/fe27880d1f4156b0d1cd8744efc3b6d9/K6.Opposites.Balls-1080x1080__1_.png", "https://lovevery.com/products/the-play-kits-the-thinker"],
  ["lovevery-babbler-part-1", "https://images.ctfassets.net/0sea1vycfyqy/5YVJ4CAsQH0rJQrR4iDYtN/7d6915fbd36a91e0d1fb8462080f23b5/Products_Overhead_23089_v4_Hero_VS_R3_CL_Refresh_BH_EDIT.png", "https://lovevery.com/products/the-play-kits-the-babbler"],
  ["lovevery-babbler-part-2", "https://images.ctfassets.net/0sea1vycfyqy/01GGQ17CrCspt6NaqJXWzy/ab958359f3543f29b3eafc2ee0b3e1f9/Lovevery-BunniesFeltHouse-Green-ISO-1832-May_18_22_1.webp", "https://lovevery.com/products/the-play-kits-the-babbler"],
  ["lovevery-babbler-part-3", "https://images.ctfassets.net/0sea1vycfyqy/2B95EtdAvbtAjPCl7hRWGu/c025bff9d653957e5f40e99f9cbdc0e5/WoodenStack_Slot_067_v2.png", "https://lovevery.com/products/the-play-kits-the-babbler"],
  ["lovevery-babbler-part-4", "https://images.ctfassets.net/0sea1vycfyqy/1xaJcMNkLWy1qSUZwjG4CK/078955c846f290e73ef87b3800774268/2022_11_22_ISO_S_3852_BH_V2_1.png", "https://lovevery.com/products/the-play-kits-the-babbler"],
  ["lovevery-babbler-part-5", "https://images.ctfassets.net/0sea1vycfyqy/7cpxZr8fErIBHgTVOGz0Tz/97dfc11bc618dc12cdd60d1f34a188fb/Products_Overhead_23191_Soft-Light_VS_R2_VK-UpdatedAug2020.png", "https://lovevery.com/products/the-play-kits-the-babbler"],
  ["lovevery-babbler-part-6", "https://images.ctfassets.net/0sea1vycfyqy/5NRxbQSsCNvxMUKzUKckXJ/805f9db48e341b4408f71231e2505644/Lovevery-CoinBoxAndTops-ISO-1884-UpdatedApril2021__1_.png", "https://lovevery.com/products/the-play-kits-the-babbler"],
  ["lovevery-babbler-part-7", "https://images.ctfassets.net/0sea1vycfyqy/5spckbWwgb0vZxRn3urzLw/0d048b932ad3cb8b59c189de98d22683/Kit7Trees_027_web.png", "https://lovevery.com/products/the-play-kits-the-babbler"],
  ["lovevery-bath-set-part-1", "https://images.ctfassets.net/0sea1vycfyqy/4qIqiFBspHhjo1jQYVS5CQ/93ec9d1dc8182995e81d80d5e5541b4d/Cup.png", "https://lovevery.com/products/the-bath-set"],
  ["lovevery-bath-set-part-2", "https://images.ctfassets.net/0sea1vycfyqy/5Iud1ghKt3bwTQsZJhU4UB/227778c25aca4f2bdd8fd95031463897/Boat.png", "https://lovevery.com/products/the-bath-set"],
  ["lovevery-bath-set-part-3", "https://images.ctfassets.net/0sea1vycfyqy/CTg3TLAKyYdWu9l80wU4W/68852d565d1ce271af3a202d4b9cb2e0/Tube.png", "https://lovevery.com/products/the-bath-set"],
  ["lovevery-bath-set-part-4", "https://images.ctfassets.net/0sea1vycfyqy/5uGIeQkdoQuswJMHTHw9kJ/c4354d38c24616e20a9bda6f0a47a3a6/Ball.png", "https://lovevery.com/products/the-bath-set"],
  ["lovevery-music-set-part-1", "https://images.ctfassets.net/0sea1vycfyqy/6hA7pvNo1zlqRgRVFK3Qr2/86ac64d8ac9a3f01e7aad2e56ace0324/2022_02_01_Shakers_Studio_ISO_0001_BH_EDIT_CG_v1.20230731205358272.png", "https://lovevery.com/products/the-music-set"],
  ["lovevery-music-set-part-2", "https://images.ctfassets.net/0sea1vycfyqy/2byOTm2tmEIdeGLDMdF6Nf/6912f90e50a9f56037738e3bf9186ada/2022_02_01_Bells_Studio_ISO_0001_BH_EDIT.20230731201335067.png", "https://lovevery.com/products/the-music-set"],
  ["lovevery-music-set-part-3", "https://images.ctfassets.net/0sea1vycfyqy/poAi3rV1c92tWY2ZUOM0F/754fd189eca6e8ef19b31bc59e0017df/2022_02_01_Pat-Bells_Studio_ISO_0008_BH_EDIT_CG_v1.20230731205134024.png", "https://lovevery.com/products/the-music-set"],
  ["lovevery-music-set-part-4", "https://images.ctfassets.net/0sea1vycfyqy/2u65JyFnRXTV4C39Gzxfom/d279d4902dbcec0d751c21cd6d57d8e2/2022_02_01_Concertina_Studio_ISO_0002_BH_EDIT_CG_v1.20230731203135994.png", "https://lovevery.com/products/the-music-set"],
  ["lovevery-music-set-part-5", "https://images.ctfassets.net/0sea1vycfyqy/2lEEtxowHRtJfzyHG6k2Ki/658faef60ede02d443073778a41bf957/2022_02_01_Pan-Flute_Studio_ISO_0002_BH_EDIT_CG_v1.20230731204347433.png", "https://lovevery.com/products/the-music-set"],
  ["lovevery-music-set-part-6", "https://images.ctfassets.net/0sea1vycfyqy/68KZ1Qd3m0dtVXXd6YG9Ra/8944a9732bb4ee77a8daa40163cb523f/2022_02_01_Metronome_Studio_ISO_0001_BH_EDIT_CG_v1.20230731203746724.png", "https://lovevery.com/products/the-music-set"]
]);

// src/data/catalog-image-assets-batch6.js
var BATCH6_OFFICIAL_IMAGE_ROWS = Object.freeze([
  ["lovevery-adventurer", "https://images.ctfassets.net/0sea1vycfyqy/5xClG7UVG7RzizKNfSEGwL/814958b45c4e3f171e683e63800aa4ff/Lovevery-VKS-Playkit-Adventurer-ISO-130_v8_web.20250714212602632.png", "https://lovevery.com/products/the-play-kits-the-adventurer"],
  ["lovevery-adventurer-part-1", "https://images.ctfassets.net/0sea1vycfyqy/4PDeMXYxABm4yq4QmGkYey/5e92c8681e944c0a4a1dc51736ea4505/Products_Overhead_23348_VS_CarRun_R2_CL_transparent_BG.png", "https://lovevery.com/products/the-play-kits-the-adventurer"],
  ["lovevery-adventurer-part-2", "https://images.ctfassets.net/0sea1vycfyqy/64XDHyPN9qesLFWFsrvm4r/3ebc2b22b1965d62385054659aa8b39c/Pull_Puzzle.png", "https://lovevery.com/products/the-play-kits-the-adventurer"],
  ["lovevery-adventurer-part-3", "https://images.ctfassets.net/0sea1vycfyqy/4EkYxAV91Eo8E3hek6ChDC/d497425779c984c65bd6cdc8abd71ce3/RefreshedWooden_Stacking_Peg_Board.png", "https://lovevery.com/products/the-play-kits-the-adventurer"],
  ["lovevery-adventurer-part-4", "https://images.ctfassets.net/0sea1vycfyqy/4l1ZgNGxfIBW4SiDQ8XeJD/a7054f8a6092ef2cf3cccbed1d79e0c5/Lovevery-FuzzyBugShrub-ISO-1723-Feb2020-1-_2_.20241206184956304.png", "https://lovevery.com/products/the-play-kits-the-adventurer"],
  ["lovevery-adventurer-part-5", "https://images.ctfassets.net/0sea1vycfyqy/4UCD4TivxBHMkWL5jbC8GZ/24b3b1743545c3ac022b4679572b40aa/Refresh_Copy_Me_Cups.png", "https://lovevery.com/products/the-play-kits-the-adventurer"],
  ["lovevery-adventurer-part-6", "https://images.ctfassets.net/0sea1vycfyqy/6UWu7GhEBFtQ60m5aWWx94/8c46a58f4edde641db7e9f96db405b0c/Refreshed_Threadable_Bead_Set.png", "https://lovevery.com/products/the-play-kits-the-adventurer"],
  ["lovevery-inspector-part-8", "https://i0.wp.com/blog.lovevery.com/wp-content/uploads/2024/02/2023_05_01_ISO_2084.png?resize=1024%2C1024&ssl=1", "https://blog.lovevery.com/product-recommendations/welcome-to-the-inspector-play-kit-for-months-7-8/"],
  ["lovevery-thinker-part-2", "https://i0.wp.com/blog.lovevery.com/wp-content/uploads/2020/05/The_Thinker_Doll_Accessories_Overhead.png?resize=1024%2C1024&ssl=1", "https://blog.lovevery.com/product-recommendations/welcome-to-the-thinker-play-kit-for-months-11-12/"]
]);

// src/data/catalog-image-assets-batch7.js
var BATCH7_OFFICIAL_IMAGE_ROWS = Object.freeze([
  ["lovevery-free-spirit", "https://images.ctfassets.net/0sea1vycfyqy/5YVz9DXS5hSl2flksdE6tf/75346670e7b0ad983b0a3361054e836b/Lovevery-VKS-Playkit-TheFreeSpirit-ISO-163-US_April2021_web_v2.png", "https://lovevery.com/products/the-play-kits-the-free-spirit"],
  ["lovevery-free-spirit-part-1", "https://images.ctfassets.net/0sea1vycfyqy/1R2TGfUlbuM77CyeBMkdzv/e4c6111ae3cb9209f8e1f4a3261fb419/Year_2_Playkit_10633_VS_R2_CL_web.png", "https://lovevery.com/products/the-play-kits-the-free-spirit"],
  ["lovevery-free-spirit-part-2", "https://images.ctfassets.net/0sea1vycfyqy/1ddlF3teMBaItjoG2DIJF1/0524bc8b743fb750df0a45911e1715c2/Year_2_Playkit_11072_VS_R2_CL_BH_V4.png", "https://lovevery.com/products/the-play-kits-the-free-spirit"],
  ["lovevery-free-spirit-part-3", "https://images.ctfassets.net/0sea1vycfyqy/5f2zAlfUXQHOVeodZQRdsf/8ea5a3163b1230610c8eadf8207f0f70/Lovevery_8-06-25_ISO_Wooden-Counting-Box_0070_v2.png", "https://lovevery.com/products/the-play-kits-the-free-spirit"],
  ["lovevery-free-spirit-part-4", "https://images.ctfassets.net/0sea1vycfyqy/70F72UXTV3wTZTFmvPJcTV/cba9cf24e363ca095d6462d76f8739bd/Year_2_Playkit_10817_VS_R1_CL.png", "https://lovevery.com/products/the-play-kits-the-free-spirit"],
  ["lovevery-free-spirit-part-5", "https://images.ctfassets.net/0sea1vycfyqy/2UHTN4gZjayhOUy1EXLWqu/4f820651d3eaeb41d6e3e53392e300f5/Year_2_Playkit_10705_VS_R1_CL.png", "https://lovevery.com/products/the-play-kits-the-free-spirit"],
  ["lovevery-free-spirit-part-6", "https://images.ctfassets.net/0sea1vycfyqy/yCv6ObczmHwaMC4olHSlB/9b30144488bf70ac3fed6673e4b5a15e/Products_Overhead_0362_MirrorReflection2_VS_R1b_PU_R1_CL.png", "https://lovevery.com/products/the-play-kits-the-free-spirit"],
  ["lovevery-helper", "https://downloads.ctfassets.net/0sea1vycfyqy/2DLSmKGBurRYQaWKBeRF26/a722a5b0c8140187740103e37a531266/Lovevery-VKS-Playkit-TheHelper-ISO-201-April2021-2.png", "https://lovevery.com/products/the-play-kits-the-helper"],
  ["lovevery-helper-part-1", "https://images.ctfassets.net/0sea1vycfyqy/1djkg0ageftK9tb6nCrsMB/96e06ed35cad1fd30ef785bb5d0d32ec/Year_2_Playkit_10542_VS_R3_CL.png", "https://lovevery.com/products/the-play-kits-the-helper"],
  ["lovevery-helper-part-2", "https://images.ctfassets.net/0sea1vycfyqy/5wSYuHwtrFP1CUgeEpjJYe/8f1d00cba00ec0e670e7e5d7280db1a8/k11-2-dot-catcher.png", "https://lovevery.com/products/the-play-kits-the-helper"],
  ["lovevery-helper-part-3", "https://images.ctfassets.net/0sea1vycfyqy/5dvijPmMcgCFbvNgl17X1K/03f62e47da15efcbe7c5ca6d87d3a3bf/k11-3-felt-flowers.png", "https://lovevery.com/products/the-play-kits-the-helper"],
  ["lovevery-helper-part-4", "https://images.ctfassets.net/0sea1vycfyqy/3M7wpevITzoVJtwRPNsfsD/6cb0d92984fc854a72bef721a3bfe8fe/Year_2_Playkit_10766_VS_R1_CL.png", "https://lovevery.com/products/the-play-kits-the-helper"],
  ["lovevery-helper-part-5", "https://images.ctfassets.net/0sea1vycfyqy/3CPZ9DoI1ty9l4n1RYtuo6/b7cd72751ff82141d413e504c24ac406/Year_2_Playkit_10842_VS_R2_CL.png", "https://lovevery.com/products/the-play-kits-the-helper"],
  ["lovevery-helper-part-6", "https://images.ctfassets.net/0sea1vycfyqy/20BvrDKfiMOjdSm7hoyiYi/1636f575bbf4e621ae782dbd294926e2/Year_2_Routine_Cards.png", "https://lovevery.com/products/the-play-kits-the-helper"],
  ["lovevery-looker", "https://images.ctfassets.net/0sea1vycfyqy/5IMPMSXIAc8MbtQEpDyhuL/0c65ed5861bcc40908b6fe9d55278249/Looker_Slide_2.gif", "https://lovevery.com/products/the-play-kits-the-looker"],
  ["lovevery-looker-part-1", "https://images.ctfassets.net/0sea1vycfyqy/5XbH0CxXu560qHdwH75qWd/0fa7e77c21dfd19f723981df5ef76e2b/SubscriptionBox1_Products_Overhead_23385_Hero_VS_R1_CL_v3.png", "https://lovevery.com/products/the-play-kits-the-looker"],
  ["lovevery-looker-part-2", "https://images.ctfassets.net/0sea1vycfyqy/5q5OUzlztmBjjmBOiyjqsK/8d9f09fcab7ccfda9a5ac82826803bad/Simple_BW_Cards_Overhead_01.png", "https://lovevery.com/products/the-play-kits-the-looker"],
  ["lovevery-looker-part-3", "https://images.ctfassets.net/0sea1vycfyqy/31Ucd4iWHQYxGCQLMd7rHg/4fa14fb204e777350c4af39ebaf6dab5/Standing_Card_Holder_Three_Quarter_v1.png", "https://lovevery.com/products/the-play-kits-the-looker"],
  ["lovevery-looker-part-4", "https://images.ctfassets.net/0sea1vycfyqy/76DmYmjEUjpy4OpeLhXkDo/e1ac0cb676f866ca9a4e848e2cb1ab66/Complex_BWR_Cards_Overhead_01.png", "https://lovevery.com/products/the-play-kits-the-looker"],
  ["lovevery-looker-part-5", "https://images.ctfassets.net/0sea1vycfyqy/7e4qbnmHweXohOogxPAlbP/77ef6d76784f860e333a8e52f7ad38d2/Lovevery-VKS-Mittens-ISO-139-July2020.png", "https://lovevery.com/products/the-play-kits-the-looker"],
  ["lovevery-looker-part-6", "https://images.ctfassets.net/0sea1vycfyqy/6Mo1Ar7U68DoNB1gEjvPdY/8c3675ea8859de3c2d246c9e1bde48e2/K1.Silicone.Rattle.png", "https://lovevery.com/products/the-play-kits-the-looker"],
  ["lovevery-looker-part-7", "https://images.ctfassets.net/0sea1vycfyqy/5O7INa0JlqbbRbof4pX6Df/251b7bda8a174bb73b0c8da1b3b9ec3c/Lovevery-VKS-Studio-StrollerToy-364-Sep2020_WEB_616e4d0b-1dbd-445d-895a-a1b0cc13e2e6.png", "https://lovevery.com/products/the-play-kits-the-looker"],
  ["lovevery-observer", "https://images.ctfassets.net/0sea1vycfyqy/3lt1Hm42aaEI7IuNs86Csp/25b6f9bc5c6ba894aa66a99ced8d52cf/Lovevery-VKS-Playkit-3YO-TheObserver-ISO-322-April2021.png", "https://lovevery.com/products/the-play-kits-the-observer"],
  ["lovevery-observer-part-1", "https://images.ctfassets.net/0sea1vycfyqy/4YezN0EjwWe0YjN9zxnTTK/2b43642107f957201161e11c5fc74850/Lovevery-VisionkitStudio-ISOs-WeatherBoard-056-Dec2020-1.20230607225211403.png", "https://lovevery.com/products/the-play-kits-the-observer"],
  ["lovevery-observer-part-2", "https://images.ctfassets.net/0sea1vycfyqy/1QgVMIaRlzXyc7Hh8BYM1R/f8b6254e2d49462773bbb8205697fa4a/Lovevery-Visionkit-ISOs-ModularHouse-085-Ingredients1-Oct2020-1.20230607222653929.png", "https://lovevery.com/products/the-play-kits-the-observer"],
  ["lovevery-observer-part-3", "https://images.ctfassets.net/0sea1vycfyqy/64bvJlZeokEzdKdWDetAuk/2f19234bd5c1d44dc97920623728760a/Lovevery-Visionkit-ISOs-ModularHouse-085-Ingredients2-Oct2020-1.20230607221643939.png", "https://lovevery.com/products/the-play-kits-the-observer"],
  ["lovevery-observer-part-4", "https://images.ctfassets.net/0sea1vycfyqy/3wSxCy6rZ9JbwSrrzuWolm/f5a8f6d5affa8922f6a4431a0c39f937/1699046298000_f0fd4d82-a1e9-427d-841a-28d3df04a1d4_fd3abccd463e4933a32597209982029e.png", "https://lovevery.com/products/the-play-kits-the-observer"],
  ["lovevery-observer-part-5", "https://images.ctfassets.net/0sea1vycfyqy/3neFn0b4xGr2tO5QUBi3GU/03378a662dc18a9d470d3bf520c973f0/Kit15_LeftandRightShoeStickers-ISOLovevery-Visionkit-ISOs-LeftRightSticker-009-Oct2020-1.png", "https://lovevery.com/products/the-play-kits-the-observer"],
  ["lovevery-observer-part-6", "https://images.ctfassets.net/0sea1vycfyqy/1KbaHzamxyoOSNDz3tTlKG/b9d1e189405af1d1d572ce5447d4a1b0/2022_03_21_Emotion-Dolls_Studio_1834_BH_EDIT.png", "https://lovevery.com/products/the-play-kits-the-observer"],
  ["lovevery-problem-solver", "https://images.ctfassets.net/0sea1vycfyqy/3ID25woRtBLYdFoQbkHdYU/2f7ac83b5f61a98997c234099649e398/Lovevery-VKS-Playkit-3YO-TheProblemSolver-ISO-357-April2021_web.png", "https://lovevery.com/products/the-play-kits-the-problem-solver"],
  ["lovevery-problem-solver-part-1", "https://images.ctfassets.net/0sea1vycfyqy/4ULTslsidQhOs1sNv4ck4Q/413607fdfcff7fceb2f1b28e49e96902/Kit17_TurtleHatchGame-ISO.20230607212857908.png", "https://lovevery.com/products/the-play-kits-the-problem-solver"],
  ["lovevery-problem-solver-part-2", "https://images.ctfassets.net/0sea1vycfyqy/6TDjZz3AAxvAaQbZzl1Qlo/afabcdddc439b57793fc37b36bc0ea79/Kit17_WoodenUnitBars_NumberTiles-ISO.20230612171740828.png", "https://lovevery.com/products/the-play-kits-the-problem-solver"],
  ["lovevery-problem-solver-part-3", "https://images.ctfassets.net/0sea1vycfyqy/44vscKQJay2hUqryjWA0Sy/609b475c3a8dd1c1a171810b807f615b/Kit17_NumberSenseNatureCounters.20230612173105976.png", "https://lovevery.com/products/the-play-kits-the-problem-solver"],
  ["lovevery-problem-solver-part-4", "https://images.ctfassets.net/0sea1vycfyqy/eZHoaRRGFVHZKdgl7A0bn/1f44c979470f35e4be3258df3415d8cc/Kit17-SizeItUpMeasuringTape-ISO_v2_web.webp", "https://lovevery.com/products/the-play-kits-the-problem-solver"],
  ["lovevery-problem-solver-part-5", "https://images.ctfassets.net/0sea1vycfyqy/7gtVS7XabvopDoww8HUMSR/104f40e645daec5444c5dad0eeccd5dd/Kit17_WoodenWobblePuzzle-ISO.20230607174417097.png", "https://lovevery.com/products/the-play-kits-the-problem-solver"],
  ["lovevery-problem-solver-part-6", "https://images.ctfassets.net/0sea1vycfyqy/295F4w3MYib5jPrPZdHO1W/343733315d1eaf1eb29743a866a82782/Kit17_LiquidColorLab-ISO.20230607205618698.png", "https://lovevery.com/products/the-play-kits-the-problem-solver"],
  ["lovevery-storyteller", "https://images.ctfassets.net/0sea1vycfyqy/42EjiYaXgNzvYqayijs6er/97fd83dd873c43f25413b139a45ab48f/Lovevery-VKS-Playkit-3YO-TheStoryteller-ISO-339-April2021_v2.png", "https://lovevery.com/products/the-play-kits-the-storyteller"],
  ["lovevery-storyteller-part-1", "https://images.ctfassets.net/0sea1vycfyqy/59rhBrrV7NRryNmmaEsus6/d5ca7a46e736bb6e9903fe016faf75a4/Lovevery-VisionkitStudio-ISOs-FortFrameDowels-058-Oct2020.20240229155320659.png", "https://lovevery.com/products/the-play-kits-the-storyteller"],
  ["lovevery-storyteller-part-2", "https://images.ctfassets.net/0sea1vycfyqy/714X7WOjKb0lwG7PVY6c6S/7e52e95bdfee9815e81a9ac017476132/Lovevery-VisionkitStudio-Fort-Frame-276-Dec2020_2.png", "https://lovevery.com/products/the-play-kits-the-storyteller"],
  ["lovevery-storyteller-part-3", "https://images.ctfassets.net/0sea1vycfyqy/PKkIr6ci5KVI7hW7vbJ2Z/0f9e35635812299162de2fe12b1ad95d/Lovevery-VisionkitStudio-ISOs-Puppets-NoArms-158-Oct2020-1.20230607202349727.png", "https://lovevery.com/products/the-play-kits-the-storyteller"],
  ["lovevery-storyteller-part-4", "https://images.ctfassets.net/0sea1vycfyqy/443O8EpR0nbhQZT7nHeidn/45fcf5c1bf9b78ca7208af0c6e58d549/Lovevery-Visionkit-ISOs-SprayMop-087-Oct2020-1.20230607221225201.png", "https://lovevery.com/products/the-play-kits-the-storyteller"],
  ["lovevery-storyteller-part-5", "https://images.ctfassets.net/0sea1vycfyqy/5tcqqgXk3qjkHTDzdfHehO/4f023b2b54eccff9cc41d847cbd455fc/2022_05_25_Studio_ECO_5019.png", "https://lovevery.com/products/the-play-kits-the-storyteller"]
]);

// src/data/catalog-image-assets-batch8.js
var BATCH8_OFFICIAL_IMAGE_ROWS = Object.freeze([
  ["lovevery-charmer-part-1", "https://images.ctfassets.net/0sea1vycfyqy/1Oy8pa7M2lfkx64BxXMVHk/4c91b91b514eeb96e054590d090512b8/Lovevery_Playkit_The_Charmer_Wrap_Rattles_0098_v3.png", "https://lovevery.com/products/the-play-kits-the-charmer"],
  ["lovevery-charmer-part-2", "https://images.ctfassets.net/0sea1vycfyqy/1h7x06YxrGmG5lRTS21Fae/eaa1a31fa37e96982627c018b3228ca0/SubscriptionBox2_Lovevery-VKS-WoodenRattle-ISO-0111-June2020-1.png", "https://lovevery.com/products/the-play-kits-the-charmer"],
  ["lovevery-charmer-part-3", "https://images.ctfassets.net/0sea1vycfyqy/7qtmR7q9Cctxtis3klYMeN/2b0114d06538aeb20726b0658a723527/Lovevery_Play_Kit_The_Charmer_Banded_Rattle_Ball_With_a_Soft_Ball_Overhead_0167_v2.png", "https://lovevery.com/products/the-play-kits-the-charmer"],
  ["lovevery-charmer-part-5", "https://images.ctfassets.net/0sea1vycfyqy/1fUr5n3hgpDcYCm03q9d3s/64b0dba32f19cf6b7a062cb37f792983/Lovevery_Framed_Mirror_Overhead_0032_v1__1_.png", "https://lovevery.com/products/the-play-kits-the-charmer"],
  ["lovevery-charmer-part-6", "https://images.ctfassets.net/0sea1vycfyqy/2cXKUCnKqUz4UkPoioj9au/de146c1574aa6927bec841d15b6e1ce7/triple-teether_2.png", "https://lovevery.com/products/the-play-kits-the-charmer"],
  ["lovevery-charmer-part-7", "https://images.ctfassets.net/0sea1vycfyqy/4T4t9c34Iws4CzKXgomSDq/87c282c112732752b99dedfec3a7759e/The_Charmer_-_Rolling_Bell.png", "https://lovevery.com/products/the-play-kits-the-charmer"],
  ["lovevery-charmer-part-8", "https://images.ctfassets.net/0sea1vycfyqy/2adxpwIMHfKq3vs9mIBkWn/99c6ca949468851c4d806932fc447e14/Lovevery_Charmer_ISO_Crinkle_Bag_5045_v1_web.png", "https://lovevery.com/products/the-play-kits-the-charmer"],
  ["lovevery-charmer-part-9", "https://images.ctfassets.net/0sea1vycfyqy/6tyn0sOb5wEcwCDzN3ZoLw/5054cb8ca1174d3958d8489664ebfb84/2022_11_22_ISO_S_3850_BH_V1_web.png", "https://lovevery.com/products/the-play-kits-the-charmer"],
  ["lovevery-analyst-part-1", "https://images.ctfassets.net/0sea1vycfyqy/1ocW2mY5qyhsxFwg49IFvE/277ff1a9ae598aab170e77208f57d220/Kit18_MontessoriSensoryBox-ISO.20230612173818392.png", "https://lovevery.com/products/the-play-kits-the-analyst"],
  ["lovevery-analyst-part-2", "https://images.ctfassets.net/0sea1vycfyqy/2Bg3mIGKIqlgBw47fQq11s/216eb5de4f07095e2635e294af662683/2022_03_28_ECO_S_2192-2_BH_EDIT_278b5042-e2c8-4861-bf6a-fe64ad42d7c6.png", "https://lovevery.com/products/the-play-kits-the-analyst"],
  ["lovevery-analyst-part-3", "https://images.ctfassets.net/0sea1vycfyqy/3SPcRoYQw6wLpPij05HevV/05f26621aba23f763db268c24bb67d66/Kit18_StackableFractionCups-ISO.20230612174229928.png", "https://lovevery.com/products/the-play-kits-the-analyst"],
  ["lovevery-analyst-part-4", "https://images.ctfassets.net/0sea1vycfyqy/5UqXVMNYzqwQwJyq3uTwnh/520670d7fac9e4d7451eb9e1b2e2ef57/Kit18_VisualRecipeCards-ISO.20240229161047908.png", "https://lovevery.com/products/the-play-kits-the-analyst"],
  ["lovevery-analyst-part-5", "https://images.ctfassets.net/0sea1vycfyqy/ytNB14ritsdLyRb5zhkVB/afa2a3d11e9ef42ef7c3cb4d1b0e3214/Kit18_ColorTheoryPuzzle-ISO.20230607202934284.png", "https://lovevery.com/products/the-play-kits-the-analyst"],
  ["lovevery-analyst-part-6", "https://images.ctfassets.net/0sea1vycfyqy/5qIDJWfwDCe97SBijcyCbS/1a418140efece1ca2bd7fc49a80f4b51/Kit18_FirstSewingKit-ISO.20230607175218190.png", "https://lovevery.com/products/the-play-kits-the-analyst"],
  ["lovevery-companion-part-1", "https://images.ctfassets.net/0sea1vycfyqy/1DDuCdeAaXAb5h49ifzZRE/05b4b8e659eb169f0365d18827a2b6ca/image_1.png", "https://lovevery.com/products/the-play-kits-the-companion"],
  ["lovevery-companion-part-2", "https://images.ctfassets.net/0sea1vycfyqy/1uLnoeTps8XejQrd4BJA6a/360bc6aee2a9ce95dba08cc9c1c7af2f/Lovevery_Play-Kit_Group_Drop-and-Match-Tile-Catcher_Composite_0116.png", "https://lovevery.com/products/the-play-kits-the-companion"],
  ["lovevery-companion-part-3", "https://images.ctfassets.net/0sea1vycfyqy/3j7OrZxFwsBoLG1S2fpXxv/139aaf7559838d0e78e1b43a83166655/Lovevery-FeltStars-ISO-2061-Feb2020-Edit.png", "https://lovevery.com/products/the-play-kits-the-companion"],
  ["lovevery-companion-part-4", "https://images.ctfassets.net/0sea1vycfyqy/94m8f5ukdpItLqxu0EnTK/f47c3a965d80abf610b527a46f7c3e3f/MontessoriAnimalMatch.WEB_PENTA_CG_v2_1.webp", "https://lovevery.com/products/the-play-kits-the-companion"],
  ["lovevery-companion-part-5", "https://images.ctfassets.net/0sea1vycfyqy/KN2k7wCXIHtNUbta6mLL0/1e4b78aa140dcb0e37115cf5267c2bb6/Products_Overhead_0367_VS_R1.png", "https://lovevery.com/products/the-play-kits-the-companion"],
  ["lovevery-companion-part-6", "https://images.ctfassets.net/0sea1vycfyqy/36UZLuCbJ1U6gQLH1Ijo3b/294a1324f9f6c1413e7b311da1d0e362/Products_Overhead_0338_VS_R1_puzzle.png", "https://lovevery.com/products/the-play-kits-the-companion"],
  ["lovevery-connector-part-1", "https://images.ctfassets.net/0sea1vycfyqy/1Ej4WVnHxlR6STvER6qXx9/7f75b0202c52752a94ac10a48230afe1/2023_04_13_4YO_Group_ISO_11338_v3.webp", "https://lovevery.com/products/the-play-kits-the-connector"],
  ["lovevery-connector-part-2", "https://images.ctfassets.net/0sea1vycfyqy/59rkekERfs4maKQibz2mqQ/5ed8074e62567961cabead7e68ba4f79/2022_07_05_Ball-Run_Studio_4-Year-Old_ISOs_12412_v7.png", "https://lovevery.com/products/the-play-kits-the-connector"],
  ["lovevery-connector-part-3", "https://images.ctfassets.net/0sea1vycfyqy/1RxNFWzTDJqJ6UfuF9GayD/d043d3f8c95605f101e591298b6ce8ec/2022_08_15_Subatizing-Box_14-yr-old_ISO_S_0220_v2.webp", "https://lovevery.com/products/the-play-kits-the-connector"],
  ["lovevery-connector-part-4", "https://images.ctfassets.net/0sea1vycfyqy/7FgCeBKtKTOZ6nNu9Ruk3P/b2ac9d7386857b418651ad4c57192e29/2023_04_13_4YO_Group_ISO_11294_v2.png", "https://lovevery.com/products/the-play-kits-the-connector"],
  ["lovevery-connector-part-5", "https://images.ctfassets.net/0sea1vycfyqy/2q4BGlMaDDhYLNLmFs0io7/38e129f686b68e0b457bb24f4239a240/2023_04_13_4YO_Group_ISO_11350_v2.png", "https://lovevery.com/products/the-play-kits-the-connector"],
  ["lovevery-connector-part-6", "https://images.ctfassets.net/0sea1vycfyqy/3FovbFnxRTrNRRo7upvAkl/b23ea95df1d7517394c6f396ff466be3/2022_10_01_ISOs_S_0225_v4_a87014a4-8da0-4cb3-beb7-0eff16d4eb4f.webp", "https://lovevery.com/products/the-play-kits-the-connector"],
  ["lovevery-examiner-part-1", "https://images.ctfassets.net/0sea1vycfyqy/4Z7sKwhcIN7OmiirrMab4p/ae9ef2687faf8fac712dbd7b9e6a6214/2023_04_13_4YO_Group_ISO_11286_v1.png", "https://lovevery.com/products/the-play-kits-the-examiner"],
  ["lovevery-examiner-part-2", "https://images.ctfassets.net/0sea1vycfyqy/1midbqhW8AZUyO2KKNeqXz/a9bfb07fa0e21f7b091a800344a6ac8d/2022_08_15_4-yr-old_ISO_S_0259_v2_a408c35f-85fa-4a22-a2fa-b866b945b74e.webp", "https://lovevery.com/products/the-play-kits-the-examiner"],
  ["lovevery-examiner-part-3", "https://images.ctfassets.net/0sea1vycfyqy/6WTZyHkQGfwGxFOXMyfwXo/73e8f60407f046a5d994217cac8ae8c6/2023_04_13_4YO_Group_ISO_11302_v2.png", "https://lovevery.com/products/the-play-kits-the-examiner"],
  ["lovevery-examiner-part-4", "https://images.ctfassets.net/0sea1vycfyqy/2XTsfE4DkSodnbRf2XbxmW/d05ff5d2e144b32c42b89ee064f47740/2023_04_13_4YO_Group_ISO_11306_v1.png", "https://lovevery.com/products/the-play-kits-the-examiner"],
  ["lovevery-examiner-part-5", "https://images.ctfassets.net/0sea1vycfyqy/QY9QlsZibs5FZtZVPbYaX/a4a94671233a8f2ffbb60fb49845dad2/2022_08_15_4-yr-old_ISO_S_0306_v3.webp", "https://lovevery.com/products/the-play-kits-the-examiner"],
  ["lovevery-examiner-part-6", "https://images.ctfassets.net/0sea1vycfyqy/71kB3Kd186YeYBS1Zcw5qR/565c425dea837cd060366a30c4663ab8/2022_07_05_Ball-Run_Studio_4-Year-Old_ISOs_12394_v3_2737e493-0add-4e78-a768-0fee9b2bbc9f.webp", "https://lovevery.com/products/the-play-kits-the-examiner"],
  ["lovevery-persister-part-1", "https://images.ctfassets.net/0sea1vycfyqy/41C347poGejE1AlFpR879p/a522cb5f065d7287cb8ebe60786c977b/2022_08_18_4-yr-old_S_1099_v6.webp", "https://lovevery.com/products/the-play-kits-the-persister"],
  ["lovevery-persister-part-2", "https://images.ctfassets.net/0sea1vycfyqy/5P0Bv0DFkrOsjxXOROYFlo/61a5234511373e2d3fe020e029ba144b/2023_04_13_4YO_Group_ISO_11290_v1.png", "https://lovevery.com/products/the-play-kits-the-persister"],
  ["lovevery-persister-part-3", "https://images.ctfassets.net/0sea1vycfyqy/1a6nMXaO1cG1t49iG42gYk/6163867f82bdd8624ce64e3fb8a396a0/2022_06_01_Studio_4-Year-Old_ISOs_5396_v7.webp", "https://lovevery.com/products/the-play-kits-the-persister"],
  ["lovevery-persister-part-4", "https://images.ctfassets.net/0sea1vycfyqy/19zqcgXrNsdDYd24rfzKzX/ac92818823d069150b8958b3fff5931b/2023_04_13_4YO_Group_ISO_11282_v1_web.png", "https://lovevery.com/products/the-play-kits-the-persister"],
  ["lovevery-persister-part-5", "https://images.ctfassets.net/0sea1vycfyqy/4d9o2GDxlCjzKpdZKsfa0K/909a18602c46a7a4cd194aa2e8ba3cec/2022_06_01_Studio_4-Year-Old_ISOs_5327_v2.webp", "https://lovevery.com/products/the-play-kits-the-persister"],
  ["lovevery-persister-part-6", "https://images.ctfassets.net/0sea1vycfyqy/271pnT9v1tC94Hc8Qo3lFb/d16d37740d325246bb7d6522e6df8aa2/Oct2022_4YO_Calming-Booklet_Book_ISO_b5f57a66-5d12-4040-b260-e45972a33d1c.webp", "https://lovevery.com/products/the-play-kits-the-persister"],
  ["lovevery-realist-part-1", "https://images.ctfassets.net/0sea1vycfyqy/4oiaF9oH31TEZ0g603sZEd/e5a1cc52fdf2df52613b5636b031eca7/Lovevery-LockBox-ISO-1814-Feb2020-Edit.png", "https://lovevery.com/products/the-play-kits-the-realist"],
  ["lovevery-realist-part-2", "https://images.ctfassets.net/0sea1vycfyqy/34xHdvuso0M0fgX0pwyBzg/0e1390edfdbc07d6862b871d41955e58/WheelAroundTownBus_Pegs.webp", "https://lovevery.com/products/the-play-kits-the-realist"],
  ["lovevery-realist-part-3", "https://images.ctfassets.net/0sea1vycfyqy/7s00UvrHTQa9fMBE9tNRY6/4a24a8581af9f3fb694cef3a9fda72af/Lovevery-GeoShapesPuzzle-ISO-2053-Feb2020-Edit.png", "https://lovevery.com/products/the-play-kits-the-realist"],
  ["lovevery-realist-part-4", "https://images.ctfassets.net/0sea1vycfyqy/73m3P13eTjZvcji2WzVqYv/d09fc70d1ae15bf7ddfa8c35df133e8c/Lovevery-CritterPocket-ISO-2037-Feb2020-Edit_VS_R1_1.png", "https://lovevery.com/products/the-play-kits-the-realist"],
  ["lovevery-realist-part-5", "https://images.ctfassets.net/0sea1vycfyqy/1wB0DSnTSxNFrhqLIEnIV1/c2bf2033f34a1428e6232f3535025fa2/Products_Overhead_23293_Hero_VS_R3_CL.png", "https://lovevery.com/products/the-play-kits-the-realist"],
  ["lovevery-realist-part-6", "https://images.ctfassets.net/0sea1vycfyqy/xvqn576aCZnZhvbxZ0Gcj/78dd5bb5f64bb8e900da98d34bb2c192/Lovevery-PitcherAndCup-ISO-01-Feb2020-Edit.png", "https://lovevery.com/products/the-play-kits-the-realist"],
  ["lovevery-researcher-part-1", "https://images.ctfassets.net/0sea1vycfyqy/5KVY7vCFCsQyOSzQ2e49Mh/28d92377eeed2415436796d5a2f7d799/Year_2_Playkit_10645_VS_R2_CL.png", "https://lovevery.com/products/the-play-kits-the-researcher"],
  ["lovevery-researcher-part-2", "https://images.ctfassets.net/0sea1vycfyqy/sPlzr9geaNfXTJi1CPKE4/dfe8af44afd42eb3f4a432796b5bfd32/Year_2_Playkit_10578_v2_VS_R2_CL_CG_v2.webp", "https://lovevery.com/products/the-play-kits-the-researcher"],
  ["lovevery-researcher-part-3", "https://images.ctfassets.net/0sea1vycfyqy/4iBcRhCzoAAKdFdfnUi8b6/12dd18a8a5e9741a8e3f98fd8286b67e/Year_2_Playkit_10925_v4.png", "https://lovevery.com/products/the-play-kits-the-researcher"],
  ["lovevery-researcher-part-4", "https://images.ctfassets.net/0sea1vycfyqy/1drMWgkhFZ89jUJgz93f4F/3db9cb9a84fd026da8d7c85e3f9c6cfb/2022_08_05_Countdown-Timer_ISO_S_0056.png", "https://lovevery.com/products/the-play-kits-the-researcher"],
  ["lovevery-researcher-part-5", "https://images.ctfassets.net/0sea1vycfyqy/SqeTn2Gz5ZDjmV0PkM2KU/3aa1d01e6492d9ef44d82d1fa7d2a100/TRANSPORTATION__THINGS_THAT_MOVE__MEMORY_GAME_1.png", "https://lovevery.com/products/the-play-kits-the-researcher"],
  ["lovevery-researcher-part-6", "https://images.ctfassets.net/0sea1vycfyqy/3O9uJNvDh7v9KdehxuFh46/8749e369c0ca8f4ac1b1cdd0818025a1/Year_2_Playkit_10726_VS_R1_CL.png", "https://lovevery.com/products/the-play-kits-the-researcher"],
  ["lovevery-senser-part-1", "https://images.ctfassets.net/0sea1vycfyqy/2qDPxsRKpPmcHLTOwFSLu7/8fc1e585b14b577764594bffc6141aea/SubscriptionBox3_Products_Overhead_23354_PlaySocks_VS_R2_CL_BH_EDIT-_1_.png", "https://lovevery.com/products/the-play-kits-the-senser"],
  ["lovevery-senser-part-2", "https://images.ctfassets.net/0sea1vycfyqy/4aZhB4bZ78jdfPCunmI6fv/03428d490498932e6f07965aecb6650a/SubscriptionBox3_LoveveryProduct4_25344_SideView_R1_CL.png", "https://lovevery.com/products/the-play-kits-the-senser"],
  ["lovevery-senser-part-3", "https://images.ctfassets.net/0sea1vycfyqy/5VCXHJeJco13hznAqw2iLh/8779bae43ce9a8a369fe2b89fd104d7e/Products_Overhead_0316_2_VS_R2_CL_Rainbow-Ball.png", "https://lovevery.com/products/the-play-kits-the-senser"],
  ["lovevery-senser-part-4", "https://images.ctfassets.net/0sea1vycfyqy/3m6TFg7lYCrAIG7T89fp0T/e14f0d3c209d362afe837c6c56820774/20211012_ISOs0197.png", "https://lovevery.com/products/the-play-kits-the-senser"],
  ["lovevery-senser-part-5", "https://images.ctfassets.net/0sea1vycfyqy/6WNnLdFniWTJV4DwXAh5oR/146dfa5290b193231cb8b00ccc01af9e/K3.Magic.Tissues.png", "https://lovevery.com/products/the-play-kits-the-senser"],
  ["lovevery-senser-part-6", "https://images.ctfassets.net/0sea1vycfyqy/2hgxiFEQrszDrEFCFeiWa9/fd5f48a18a6dbe2f7aa0989436a4c3f5/K3.Magic.Tissue.Box.png", "https://lovevery.com/products/the-play-kits-the-senser"],
  ["lovevery-enthusiast-part-1", "https://images.ctfassets.net/0sea1vycfyqy/5Zcgy8LaiNTfKroYEBDkZj/c58f1532bf1b03d54fc24f7337419204/k12-1-scale.png", "https://lovevery.com/products/the-play-kits-the-enthusiast"],
  ["lovevery-enthusiast-part-2", "https://images.ctfassets.net/0sea1vycfyqy/7pQYLVYOVRX1KesredJDPk/03c7c0264f9aed3dada1c2ab2726bd2f/Year_2_Playkit_10746_VS_R1_CL_v2.png", "https://lovevery.com/products/the-play-kits-the-enthusiast"],
  ["lovevery-enthusiast-part-3", "https://images.ctfassets.net/0sea1vycfyqy/2Iok91KB5xBE6To9Y9PXZ3/20b119be2e72634ce964c9e1694d3fc5/2022_09_09_ISOs_S_0293_v6__1_.png", "https://lovevery.com/products/the-play-kits-the-enthusiast"],
  ["lovevery-enthusiast-part-4", "https://images.ctfassets.net/0sea1vycfyqy/6NNnY5zCghZSMm8rTplvad/510ee2850ff5fc89bf362e7dd5c1d78c/Year_2_Playkit_10989_VS_R2_CL_web__1__copy.png", "https://lovevery.com/products/the-play-kits-the-enthusiast"],
  ["lovevery-enthusiast-part-5", "https://images.ctfassets.net/0sea1vycfyqy/3J1rcTMywufAhdzKNqcZbB/d331c684731b28660972a38a75626da8/2022_08_12_SEL-Emotions_ISO_0147_v3-EN_2e939bf7-2331-4e1e-8222-b67402866a93.webp", "https://lovevery.com/products/the-play-kits-the-enthusiast"],
  ["lovevery-planner-part-1", "https://images.ctfassets.net/0sea1vycfyqy/6v55I0UjwCRdVDyUMML1ga/2e27614f81b946a9ac1ce504f38feb7f/2022_08_18_4-yr-old_S_1138_v9.png", "https://lovevery.com/products/the-play-kits-the-planner"],
  ["lovevery-planner-part-2", "https://images.ctfassets.net/0sea1vycfyqy/5TnhYjB2cozsRsi1ZvWyqh/98f9b889a2f149074e9a0c1eae2285e2/2022_07_05_Ball-Run_Studio_4-Year-Old_ISOs_12434_v3.webp", "https://lovevery.com/products/the-play-kits-the-planner"],
  ["lovevery-planner-part-3", "https://images.ctfassets.net/0sea1vycfyqy/rcWZ4XD8t2RNM4zY4eqlr/09119d3521ff5f4aa5c6b44256aedecc/2023_04_13_4YO_Group_ISO_11310_v2.png", "https://lovevery.com/products/the-play-kits-the-planner"],
  ["lovevery-planner-part-4", "https://images.ctfassets.net/0sea1vycfyqy/1ivHSdcIm5bXlXLrOGMfx2/97ba9f55bc3400ffcaddf083b204ca65/2022_08_15_4-yr-old_ISO_S_0298_v4.png", "https://lovevery.com/products/the-play-kits-the-planner"],
  ["lovevery-planner-part-5", "https://images.ctfassets.net/0sea1vycfyqy/skBDUuQVwXikfokJSmYWv/c575dcc25031969fecfacf92ec7d5d8f/2023_04_13_4YO_Group_ISO_11275_v3_web.webp", "https://lovevery.com/products/the-play-kits-the-planner"]
]);

// src/data/catalog-image-assets-batch9.js
var BATCH9_OFFICIAL_IMAGE_ROWS = Object.freeze([
  ["lovevery-play-gym", "https://images.ctfassets.net/0sea1vycfyqy/14CK3m4HoTJHQVxvkJOSjJ/035cc8dc5c2dbb02c345323f92d9ea1f/Play_Gym_Slide_1.png", "https://lovevery.com/products/the-play-gym"],
  ["lovevery-montessori-animal-match", "https://images.ctfassets.net/0sea1vycfyqy/94m8f5ukdpItLqxu0EnTK/f47c3a965d80abf610b527a46f7c3e3f/MontessoriAnimalMatch.WEB_PENTA_CG_v2_1.webp", "https://lovevery.com/products/the-play-kits-the-companion"],
  ["lovevery-montessori-placemat-utensils", "https://images.ctfassets.net/0sea1vycfyqy/6gcQqa7kvIduTX50hwhkee/e01bdd5884a1809d790f984df937d71b/0081_Lovevery-VKS-PlaceMat-BlueAndYellow-FullSet-NapkinCenter-0284-June2020_d5ced3ad-501f-41b7-809d-63a4c28259f4-2.webp", "https://lovevery.com/products/feeding-bundle"],
  ["lovevery-real-life-play-kitchen", "https://images.ctfassets.net/0sea1vycfyqy/6KPxmIKTijiy4aunaalBuT/4e885873899bdf639d29e468917424b3/Play_Kitchen_Carousel_Slide_1__1_.png", "https://lovevery.com/products/the-real-life-play-kitchen"],
  ["lovevery-wooden-counting-box", "https://images.ctfassets.net/0sea1vycfyqy/5f2zAlfUXQHOVeodZQRdsf/8ea5a3163b1230610c8eadf8207f0f70/Lovevery_8-06-25_ISO_Wooden-Counting-Box_0070_v2.png", "https://lovevery.com/products/the-play-kits-the-free-spirit"]
]);

// src/data/catalog-image-assets-batch10.js
var BATCH10_OFFICIAL_IMAGE_ROWS = Object.freeze([
  ["vtech-chomp-count-dino", "https://www.vtechtoys.com/assets/data/products/%7BE73D31C6-1326-48F7-9C07-ABF4E8E4192B%7D/images/157700prod_large.jpg", "https://www.vtechtoys.com/product/detail/15465"],
  ["vtech-drop-go-dump-truck", "https://www.vtechtoys.com/assets/data/products/%7B460B206D-A9C5-4AE6-83E2-F7FF9F9F8F5E%7D/images/166500-Img1-prod_thumb_detail_sm.jpg", "https://www.vtechtoys.com/product/detail/16600/Drop_and_Go_Dump_Truck"],
  ["vtech-kidibeats-drum-set", "https://www.vtechtoys.com/assets/data/products/%7B06867009-54B9-47CA-A260-66FB7A4B55DF%7D/images/134400_prod_thumb_detail_sm.jpg", "https://www.vtechtoys.com/product/detail/12390/KidiBeats_Drum_Set"],
  ["vtech-click-count-remote", "https://www.vtechtoys.com/assets/data/products/%7B108943FF-BCC9-4D75-B474-5AE5085A26C2%7D/images/150389_1Left_thumb_detail_sm.jpg", "https://www.vtechtoys.com/product/detail/16195"],
  ["vtech-turn-learn-driver", "https://www.vtechtoys.com/assets/data/products/%7B64925A36-5C4E-4459-B5DC-073F36992030%7D/images/166600-Imag1-prod_thumb_detail_sm.jpg", "https://www.vtechtoys.com/product/detail/16601"],
  ["vtech-busy-learners-music-activity-cube", "https://www.vtechtoys.com/assets/data/products/%7B177B35F1-9A25-8112-E063-0A7104678112%7D/images/80-574100-Main_thumb_detail_sm.jpg", "https://www.vtechtoys.com/product/detail/21124"]
]);

// src/data/catalog-image-assets-batch11.js
var BATCH11_OFFICIAL_IMAGE_ROWS = Object.freeze([
  ["md-lock-latch-board", "https://www.melissaanddoug.com/cdn/shop/files/2024-07-09_d65753e7-d07a-4833-9f86-8c4590c888d4_grande.jpg?v=1720546199", "https://www.melissaanddoug.com/products/lock-latch-board"]
]);

// src/data/catalog-image-assets-batch12.js
var BATCH12_OFFICIAL_IMAGE_ROWS = Object.freeze([]);

// src/data/catalog-image-assets-batch13.js
var BATCH13_OFFICIAL_IMAGE_ROWS = Object.freeze([
  ["smartgames-logic-lane", "https://d32bxxnq6qs937.cloudfront.net/sites/default/files/SG044_Logic-Lane_Product-Thumbnail-2.jpg", "https://www.smartgames.eu/uk/one-player-games/logic-lane"],
  ["smartgames-brain-train", "https://d32bxxnq6qs937.cloudfront.net/sites/default/files/smartgames_braintrain_thumbnail_0.jpg", "https://www.smartgames.eu/uk/one-player-games/brain-train"],
  ["smartgames-penguins-pool-party", "https://d32bxxnq6qs937.cloudfront.net/sites/default/files/smartgames_penguins_pool_party_0.jpg", "https://www.smartgames.eu/uk/one-player-games/penguins-pool-party-0"],
  ["smartgames-roadblock", "https://d32bxxnq6qs937.cloudfront.net/sites/default/files/smartgames_roadblok_packaging_3.jpg", "https://www.smartgames.eu/uk/one-player-games/roadblock-0"],
  ["smartgames-wolf-seven-goats", "https://d32bxxnq6qs937.cloudfront.net/sites/default/files/SG-027-MULTI-Wolf%26the7Goats-%28pack%29.jpg", "https://www.smartgames.eu/uk/one-player-games/wolf-seven-goats"]
]);

// src/data/catalog-image-assets-hape-batch1.js
var HAPE_PRIORITY_BATCH1_IMAGE_ROWS = Object.freeze([
  Object.freeze({
    canonicalKey: "hape-bath-basketball-elephant-pal",
    sku: "E0221",
    officialProductName: "Bath Time Basketball Elephant Pal",
    imageRef: "https://global.hape.com/media/65/5f/0a/1756978284/E0221_1.jpg?ts=1772457969",
    imageSource: "https://global.hape.com/bath-time-basketball-elephant-pal-e0221",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-burger-fries",
    sku: "E3160",
    officialProductName: "Fast Food Set",
    imageRef: "https://global.hape.com/media/68/f3/65/1756978149/E3160_1.jpg?ts=1772457829",
    imageSource: "https://global.hape.com/fast-food-set-e3160",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-coffee-maker",
    sku: "E3106",
    officialProductName: "Hape Kid's Coffee Maker Wooden Play Kitchen Set with Accessories",
    imageRef: "https://toys.hape.com/cdn/shop/files/Hape-Kid_s-Coffee-Maker-Wooden-Play-Kitchen-Set-with-Accessories-Hape-Toy-Market-44358851.jpg?v=1747721187&width=1200",
    imageSource: "https://toys.hape.com/products/hape-coffee-maker",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-country-critters-play-cube",
    sku: "E1810",
    officialProductName: "Country Critters Play Cube",
    imageRef: "https://global.hape.com/media/44/b0/df/1756978091/E1810_1_sq.jpg?ts=1772457757",
    imageSource: "https://global.hape.com/country-critters-play-cube-e1810",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-eco-camping-playset",
    sku: "E3420",
    officialProductName: "Eco-Camping Playset",
    imageRef: "https://global.hape.com/media/ff/a0/6a/1756978371/E3420_1.jpg?ts=1772458049",
    imageSource: "https://global.hape.com/eco-camping-playset-e3420",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-fresh-fruit",
    sku: "E3117",
    officialProductName: "Hape Fresh Fruit Wooden Kitchen Play Food Set",
    imageRef: "https://toys.hape.com/cdn/shop/files/Hape-Fresh-Fruit-Wooden-Kitchen-Play-Food-Set-Hape-Toy-Market-44344899.jpg?v=1747721392&width=1200",
    imageSource: "https://toys.hape.com/products/fresh-fruit",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-fresh-vegetables",
    sku: "E3161",
    officialProductName: "Garden Vegetables",
    imageRef: "https://global.hape.com/media/a8/77/19/1756978151/E3161_1.jpg?ts=1772457831",
    imageSource: "https://global.hape.com/garden-vegetables-e3161",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-mighty-mountain-mine",
    sku: "E3753",
    officialProductName: "Mighty Mountain Mine",
    imageRef: "https://toys.hape.com/cdn/shop/files/1_1_fae1bfcd-29ba-4b1f-85c3-24ac265b9059.webp?v=1787811445&width=1200",
    imageSource: "https://toys.hape.com/products/mighty-mountain-mine",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-scoot-around",
    sku: "E0101",
    officialProductName: "Hape Scoot Around Ride On Wood Bike",
    imageRef: "https://toys.hape.com/cdn/shop/files/Hape-Scoot-Around-Ride-On-Wood-Bike-Hape-Toy-Market-55368743.jpg?v=1747721312&width=1200",
    imageSource: "https://toys.hape.com/products/scoot-around",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-sushi-selection",
    sku: "E3130",
    officialProductName: "Sushi Selection",
    imageRef: "https://legacytoys.ca/cdn/shop/files/hape-sushi-selection-legacy-toys.jpg?v=1762461570&width=900",
    imageSource: "https://legacytoys.ca/products/sushi-selection",
    imageSourceType: "stable_retailer"
  }),
  Object.freeze({
    canonicalKey: "hape-walk-a-long-puppy",
    sku: "E0347",
    officialProductName: "Walk-A-Long Puppy",
    imageRef: "https://global.hape.com/media/9d/48/c9/1756977942/E0347_1.png?ts=1772457600",
    imageSource: "https://global.hape.com/walk-a-long-puppy-e0347",
    imageSourceType: "official_cdn"
  })
]);

// src/data/catalog-image-assets-hape-batch2.js
var HAPE_PRIORITY_BATCH2_IMAGE_ROWS = Object.freeze([
  Object.freeze({
    canonicalKey: "hape-color-shape-sorter",
    sku: "E0426",
    officialProductName: "Color and Shape Sorter",
    imageRef: "https://global.hape.com/media/5f/47/16/1756977989/E0426_1.jpg?ts=1772457650",
    imageSource: "https://global.hape.com/color-and-shape-sorter-e0426",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-counting-stacker",
    sku: "E0504",
    officialProductName: "Counting Stacker",
    imageRef: "https://global.hape.com/media/f3/af/4d/1756977998/E0504_1.jpg?ts=1772457656",
    imageSource: "https://global.hape.com/counting-stacker-e0504",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-deluxe-grand-piano",
    sku: "E0338",
    officialProductName: "Deluxe Grand Piano - White",
    imageRef: "https://global.hape.com/media/f2/33/e0/1756977938/E0338_1.jpg?ts=1772457596",
    imageSource: "https://global.hape.com/deluxe-grand-piano-white-e0338",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-double-sided-drum",
    sku: "E0608",
    officialProductName: "Double-Sided Hand Drum",
    imageRef: "https://de.hape.com/media/60/81/c6/1756978010/E0608_1.JPG?ts=1772457666",
    imageSource: "https://de.hape.com/en/double-sided-hand-drum-e0608",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-dynamic-pixel-piano",
    sku: "E0635",
    officialProductName: "Pixel Piano",
    imageRef: "https://global.hape.com/media/d2/f0/53/1756978483/E0635_1.jpg?ts=1772458191",
    imageSource: "https://global.hape.com/pixel-piano-e0635",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-forest-animal-puzzle",
    sku: "E1650",
    officialProductName: "Woodland Friends Puzzle",
    imageRef: "https://toys.hape.com/cdn/shop/files/Hape-Fores-Animal-puzzle-Hape-Toy-Market-47299850.jpg?v=1747720972&width=1200",
    imageSource: "https://toys.hape.com/products/hape-fores-animal-pzzle",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-learn-to-play-drum-set",
    sku: "E0620",
    officialProductName: "Learn to Play Drum",
    imageRef: "https://global.hape.com/media/35/2d/59/1756978000/E0620_1.jpg?ts=1772457673",
    imageSource: "https://global.hape.com/learn-to-play-drum-e0620",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-montessori-mirror-shape-puzzle",
    sku: "E0072",
    officialProductName: "Montessori Mirror Shape Puzzle",
    imageRef: "https://global.hape.com/media/72/77/97/1756978344/E0072_1.jpg?ts=1772458040",
    imageSource: "https://global.hape.com/montessori-mirror-shape-puzzle-e0072",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-numbers-colors-puzzle",
    sku: "E1657",
    officialProductName: "Colours & Numbers Puzzle",
    imageRef: "https://global.hape.com/media/67/69/ce/1745935397/E1657_1.jpg?ts=1772458179",
    imageSource: "https://global.hape.com/colours-numbers-puzzle-e1657",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-rainbow-pan-pipe",
    sku: "E1025",
    officialProductName: "Rainbow Pan Pipe (10 pcs.)",
    imageRef: "https://global.hape.com/media/d1/c3/01/1745934855/E1025_1.jpg?ts=1772457707",
    imageSource: "https://global.hape.com/rainbow-pan-pipe-10-pcs.-e1025",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-toddler-beat-box",
    sku: "E8148",
    officialProductName: "Toddler Beat Box Set",
    imageRef: "https://showermewithlove.com/cdn/shop/products/HPEE8148.jpg?v=1586915812",
    imageSource: "https://showermewithlove.com/products/hape-toddler-beat-box-set",
    imageSourceType: "stable_retailer"
  }),
  Object.freeze({
    canonicalKey: "hape-wild-animal-puzzle",
    sku: "E1647",
    officialProductName: "Jungle Friends Puzzle",
    imageRef: "https://global.hape.com/media/29/f5/6d/1756978424/E1647_1.jpg?ts=1772458095",
    imageSource: "https://global.hape.com/jungle-friends-puzzle-e1647",
    imageSourceType: "official_cdn"
  })
]);

// src/data/catalog-image-assets-hape-final-resolution.js
var HAPE_FINAL_RESOLUTION_IMAGE_ROWS = Object.freeze([
  Object.freeze({
    canonicalKey: "hape-mighty-mini-band",
    sku: "E0612",
    regionalSku: "9DE0612",
    officialProductName: "Mighty Mini Band",
    imageRef: "https://cdn.shopify.com/s/files/1/0561/2299/8957/products/9DE0612_1.jpg?v=1623652661",
    imageSource: "https://hapetoys.co.nz/products/mighty-mini-band",
    imageSourceType: "official_cdn"
  }),
  Object.freeze({
    canonicalKey: "hape-all-season-house-furnished",
    sku: "E3401B",
    regionalSku: "9SE3401",
    officialProductName: "All Seasons Wooden Dollhouse | 3-Story Furnished Kids Playset",
    imageRef: "https://toys.hape.com/cdn/shop/files/Hape-All-Seasons-Kids-Wooden-Dollhouse-Hape-Toy-Market-57984947.jpg?v=1747721338&width=1200",
    imageSource: "https://toys.hape.com/products/all-season-house-furnished",
    imageSourceType: "official_cdn"
  })
]);

// src/data/catalog-image-assets-expansion-qa9.js
var IMAGE_EXPANSION_QA9_ROWS = Object.freeze([
  ["lego-duplo-cargo-train", "https://www.lego.com/cdn/cs/set/assets/blt6da2b0a6f8fe7eb9/10875_Prod.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1", "https://www.lego.com/en-us/product/cargo-train-10875", "10875", "Cargo Train"],
  ["lego-duplo-steam-train", "https://www.lego.com/cdn/cs/set/assets/blt892b06b079302476/10874.jpg?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1", "https://www.lego.com/en-ca/product/steam-train-10874", "10874", "Steam Train"],
  ["lr-all-about-me-sorting-neighborhood", "https://www.learningresources.com/media/catalog/product/a/a/aafc3ce5f961b47690a1ec63c8e5d082fcb73ec8.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-all-about-me-sorting-neighborhood-set", "LER3369", "All About Me Sorting Neighborhood Set"],
  ["lr-cool-down-cubes", "https://www.learningresources.com/media/catalog/product/f/1/f1bc39cdf3a4b8cbabb8c7f2b7e4861d21c32c21.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-cool-down-cubes-sensory-fidget-set", "LER5582", "Cool Down Cubes Sensory Fidget Set"],
  ["lr-counting-surprise-party", "https://www.learningresources.com/media/catalog/product/7/c/7c184a29de0812304515ba3170d0ec0b3a5ee56c.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-counting-surprise-party", "LER6803", "Counting Surprise Party"],
  ["lr-easy-grip-tweezers", "https://www.learningresources.com/media/catalog/product/2/6/263f4f934b62c71163d6847338f34e65a84a9b58.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-easy-grip-preschool-tweezers", "LER2965", "Easy-Grip Tweezers"],
  ["lr-hide-seek-vegetable-garden", "https://www.learningresources.com/media/catalog/product/2/4/24ed0e8b4caa4e0188e6da16c8389ceb6235ed53.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-hide-seek-vegetable-garden", "LER3604", "Hide & Seek Vegetable Garden"],
  ["lr-new-sprouts-bake-it", "https://www.learningresources.com/media/catalog/product/5/7/5774919bff6912b33bdc447247ab67cf9652d604.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-new-sproutsr-bake-it", "LER9258-D", "New Sprouts Bake It!"],
  ["lr-new-sprouts-breakfast-basket", "https://www.learningresources.com/media/catalog/product/7/a/7ac56eb8d94182f78dabe435b3d4904550ca31e0.png?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265&format=jpeg", "https://www.learningresources.com/item-new-sproutsr-breakfast-basket", "LER9730", "New Sprouts Breakfast Basket"],
  ["lr-new-sprouts-cure-it-doctor", "https://www.learningresources.com/media/catalog/product/e/3/e37b181d7a9dab3e3c2f510e96e908ac80e8124e.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-new-sproutsr-cure-it", "LER9248", "New Sprouts Cure It!"],
  ["lr-new-sprouts-dinner-basket", "https://www.learningresources.com/media/catalog/product/f/d/fdc537de0000c3f94e5e43a197ec6ecae4126a54.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-new-sproutsr-dinner-basket", "LER9732", "New Sprouts Dinner Basket"],
  ["lr-new-sprouts-fix-it-tool-set", "https://www.learningresources.com/media/catalog/product/3/6/36b02e0c0b3baef0c4afe8c8ec1922cd393e40d5.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-new-sproutsr-fix-it-my-very-own-tool-set", "LER9230", "New Sprouts Fix It!"],
  ["lr-new-sprouts-lunch-basket", "https://www.learningresources.com/media/catalog/product/e/3/e3f5d962d6c7da9dea95a3efbd6148b319bf2382.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-new-sproutsr-lunch-basket", "LER9731", "New Sprouts Lunch Basket"],
  ["lr-new-sprouts-taco-night", "https://www.learningresources.com/media/catalog/product/0/8/08aab3e28a378e57533ddcd851d539abf24243ed.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-new-sprouts-174-taco-time", "LER9748", "New Sprouts Taco Night!"],
  ["lr-new-sprouts-grill-it", "https://www.learningresources.com/media/catalog/product/5/6/56e69755aad2dee3a8b29605662646b7fa3c7042.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-new-sproutsr-grill-it", "LER9260-D", "New Sprouts Grill It!"],
  ["lr-new-sprouts-munch-it", "https://www.learningresources.com/media/catalog/product/9/f/9f66d43c3bd04509087f111aef76aeb5b811f7e7.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-new-sproutsr-munch-it-my-very-own-play-food", "LER7711", "New Sprouts Munch It!"],
  ["lr-new-sprouts-pasta-time", "https://www.learningresources.com/media/catalog/product/6/c/6c819aace6c6de8f4e68eb58c3bf1b1ee24c4ef7.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-new-sprouts-pasta-time", "LER9746", "New Sprouts Pasta Time"],
  ["lr-new-sprouts-serve-it", "https://www.learningresources.com/media/catalog/product/a/1/a1612c2d32e703407173c8f5f8665dcf3aaf5d89.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-new-sproutsr-serve-it-my-very-own-dish-set", "LER3294", "New Sprouts Serve It!"],
  ["lr-new-sprouts-garden-fresh-salad", "https://www.learningresources.com/media/catalog/product/e/c/ec6297e98b50b9975c3dd3172357a8d26a66d548.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-new-sproutsr-garden-fresh-salad-set", "LER9745-D", "New Sprouts Garden Fresh Salad Set"],
  ["lr-smart-snacks-alpha-pops", "https://www.learningresources.com/media/catalog/product/5/4/54ece4f48d95745b91c02335e6fb70e1dd3e8cc6.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/catalog/product/view/id/5204/s/item-smart-snacksr-alpha-popstm/link", "LER7345", "Smart Snacks Alpha Pops"],
  ["lr-smart-snacks-counting-cookies", "https://www.learningresources.com/media/catalog/product/4/f/4f555f9c2717a46c75ec355ab5969dcb290cc6e8.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-smart-snacksr-counting-cookiestm", "LER7348", "Smart Snacks Counting Cookies"],
  ["lr-smart-snacks-number-pops", "https://www.learningresources.com/media/catalog/product/5/6/567651cd25c596eda339af83d34dc20816df55d9.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-smart-snacksr-number-popstm", "LER7344", "Smart Snacks Number Pops"],
  ["lr-smart-snacks-shape-sorting-cupcakes", "https://www.learningresources.com/media/catalog/product/4/2/422011c5eb7cef925b24a88461bc6130ca24d8cd.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-smart-snacksr-shape-sorting-cupcakes", "LER7347", "Smart Snacks Shape Sorting Cupcakes"],
  ["lr-snap-learn-alphabet-alligators", "https://www.learningresources.com/media/catalog/product/0/c/0cd1ff3d417f622fa093bff949e39998ce0a13cd.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-snap-n-learntm-alphabet-alligators", "LER6704", "Snap-n-Learn Alphabet Alligators"],
  ["lr-snap-n-learn-counting-cows", "https://www.learningresources.com/media/catalog/product/f/2/f288a2e87fede1858781c3426cf8a8b1682121be.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-snap-n-learntm-counting-cows", "LER6707", "Snap-n-Learn Counting Cows"]
]);

// src/data/catalog-image-assets.js
var UPDATED_AT = "2026-08-24T00:00:00.000Z";
function remote(url, imageSource, imageSourceType) {
  return { kind: "remote", url, catalogImageRef: url, imageSource, imageSourceType, verificationStatus: imageSourceType === "official_cdn" ? "verified_real" : "manually_confirmed", updatedAt: UPDATED_AT, fallbackState: "none", assetState: imageSourceType === "official_cdn" ? "verified_real" : "stable_remote" };
}
function packaged(path, imageSource, sourceType2, mimeType, contentHash) {
  return { kind: "packaged", path, catalogImageRef: `./${path}`, imageSource, imageSourceType: sourceType2, verificationStatus: "verified_real", updatedAt: "2026-09-16T00:00:00.000Z", fallbackState: "none", assetState: "verified_packaged", mimeType, contentHash };
}
function packagedCrop(path, imageSource, sourceType2, contentHash, provenance) {
  return { ...packaged(path, imageSource, sourceType2, "image/jpeg", contentHash), ...provenance };
}
var BATCH1_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH1_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, remote(url, source, "official_cdn")]));
var IMAGE_EXPANSION_QA9_ASSETS = Object.fromEntries(IMAGE_EXPANSION_QA9_ROWS.map(([key, url, source, sku, officialProductName]) => [key, { ...remote(url, source, "official_cdn"), imageOwnerCanonicalKey: key, sku, officialProductName, updatedAt: "2026-09-22T00:00:00.000Z" }]));
var BATCH2_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH2_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, remote(url, source, "official_cdn")]));
var BATCH3_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH3_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, remote(url, source, "official_cdn")]));
var BATCH4_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH4_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, remote(url, source, "official_cdn")]));
var BATCH5_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH5_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, "official_cdn"), updatedAt: "2026-08-27T00:00:00.000Z" }]));
var BATCH6_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH6_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, "official_cdn"), imageOwnerCanonicalKey: key, updatedAt: "2026-08-27T00:00:00.000Z" }]));
var BATCH7_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH7_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, "official_cdn"), imageOwnerCanonicalKey: key, updatedAt: "2026-08-27T00:00:00.000Z" }]));
var BATCH8_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH8_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, "official_cdn"), imageOwnerCanonicalKey: key, updatedAt: "2026-08-27T00:00:00.000Z" }]));
var BATCH9_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH9_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, "official_cdn"), imageOwnerCanonicalKey: key, updatedAt: "2026-08-28T00:00:00.000Z" }]));
var BATCH10_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH10_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, "official_cdn"), imageOwnerCanonicalKey: key, updatedAt: "2026-09-11T00:00:00.000Z" }]));
var BATCH11_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH11_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, "official_cdn"), imageOwnerCanonicalKey: key, updatedAt: "2026-09-11T00:00:00.000Z" }]));
var BATCH12_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH12_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, "official_cdn"), imageOwnerCanonicalKey: key, updatedAt: "2026-09-11T00:00:00.000Z" }]));
var BATCH13_OFFICIAL_IMAGE_ASSETS = Object.fromEntries(BATCH13_OFFICIAL_IMAGE_ROWS.map(([key, url, source]) => [key, { ...remote(url, source, "official_cdn"), imageOwnerCanonicalKey: key, updatedAt: "2026-09-11T00:00:00.000Z" }]));
var HAPE_PRIORITY_BATCH1_IMAGE_ASSETS = Object.fromEntries(HAPE_PRIORITY_BATCH1_IMAGE_ROWS.map((row) => [row.canonicalKey, {
  ...remote(row.imageRef, row.imageSource, row.imageSourceType),
  imageOwnerCanonicalKey: row.canonicalKey,
  sku: row.sku,
  officialProductName: row.officialProductName,
  updatedAt: "2026-08-28T00:00:00.000Z"
}]));
var HAPE_PRIORITY_BATCH2_IMAGE_ASSETS = Object.fromEntries(HAPE_PRIORITY_BATCH2_IMAGE_ROWS.map((row) => [row.canonicalKey, {
  ...remote(row.imageRef, row.imageSource, row.imageSourceType),
  imageOwnerCanonicalKey: row.canonicalKey,
  sku: row.sku,
  officialProductName: row.officialProductName,
  updatedAt: "2026-08-28T00:00:00.000Z"
}]));
var HAPE_FINAL_RESOLUTION_IMAGE_ASSETS = Object.fromEntries(HAPE_FINAL_RESOLUTION_IMAGE_ROWS.map((row) => [row.canonicalKey, {
  ...remote(row.imageRef, row.imageSource, row.imageSourceType),
  imageOwnerCanonicalKey: row.canonicalKey,
  sku: row.sku,
  regionalSku: row.regionalSku,
  officialProductName: row.officialProductName,
  updatedAt: "2026-08-28T00:00:00.000Z"
}]));
var CATALOG_IMAGE_ASSETS = Object.freeze({
  "plantoys-baby-car": remote("http://www.plantoys.com/cdn/shop/files/5229_-_Main_-_sq_1200x1200.jpg?v=1755249036", "https://www.plantoys.com/products/baby-car", "official_cdn"),
  "plantoys-breakfast-menu": remote("http://www.plantoys.com/cdn/shop/files/3415_-_Main_1200x1200.jpg?v=1754368688", "https://www.plantoys.com/products/breakfast-menu", "official_cdn"),
  "plantoys-bowling-set": remote("http://www.plantoys.com/cdn/shop/files/5735_-_Main_-_sq_1200x1200.jpg?v=1754369785", "https://www.plantoys.com/products/bowling-set", "official_cdn"),
  "plantoys-balancing-cactus": remote("http://www.plantoys.com/cdn/shop/files/4101_-_Main_-_sq_1200x1200.jpg?v=1755165869", "https://www.plantoys.com/products/balancing-cactus", "official_cdn"),
  "plantoys-animal-set": remote("http://www.plantoys.com/cdn/shop/files/6625_-_Main_1200x1200.jpg?v=1754371476", "https://www.plantoys.com/products/animal-set", "official_cdn"),
  "plantoys-beehives": remote("http://www.plantoys.com/cdn/shop/files/4125_-_Main_-_sq_1200x1200.jpg?v=1755248677", "https://www.plantoys.com/products/beehives", "official_cdn"),
  "plantoys-baby-key-rattle": remote("http://www.plantoys.com/cdn/shop/files/5217_-_Main_-_sq_1200x1200.jpg?v=1754373929", "https://www.plantoys.com/products/baby-key-rattle", "official_cdn"),
  "plantoys-dancing-alligator": remote("http://www.plantoys.com/cdn/shop/files/5105_-_Main_-_sq_1200x1200.jpg?v=1755248940", "https://www.plantoys.com/products/dancing-alligator", "official_cdn"),
  "plantoys-bulldozer": remote("http://www.plantoys.com/cdn/shop/files/6123_-_Main_-_sq_1200x1200.jpg?v=1754376692", "https://www.plantoys.com/products/bulldozer", "official_cdn"),
  "plantoys-creative-board": remote("http://www.plantoys.com/cdn/shop/files/5459_-_Main_1200x1200.jpg?v=1754373904", "https://www.plantoys.com/products/creative-board", "official_cdn"),
  "plantoys-farm-to-market-roadway": remote("http://www.plantoys.com/cdn/shop/files/2623_-_Main_-_web_1200x1200.jpg?v=1772768368", "https://www.plantoys.com/products/farm-to-market-roadway", "official_cdn"),
  "plantoys-doctor-set": remote("http://www.plantoys.com/cdn/shop/files/3451_-_Main_1200x1200.jpg?v=1755248863", "https://www.plantoys.com/products/doctor-set", "official_cdn"),
  "plantoys-cubes": remote("http://www.plantoys.com/cdn/shop/files/5374_-_Main_-_sq_1200x1200.jpg?v=1754375620", "https://www.plantoys.com/products/cubes", "official_cdn"),
  "plantoys-clatter": remote("http://www.plantoys.com/cdn/shop/files/6413_-_Main_-_sq_1200x1200.jpg?v=1754373258", "https://www.plantoys.com/products/clatter", "official_cdn"),
  "plantoys-meadow-ring-toss": remote("http://www.plantoys.com/cdn/shop/files/5652_-_Main_-_sq_1200x1200.jpg?v=1754370845", "https://www.plantoys.com/products/meadow-ring-toss", "official_cdn"),
  "plantoys-fountain-bowl-set": remote("http://www.plantoys.com/cdn/shop/files/5714_-_Main_-_sq_1200x1200.jpg?v=1754368807", "https://www.plantoys.com/products/fountain-bowl-set", "official_cdn"),
  "plantoys-miracle-pounding-ii": remote("http://www.plantoys.com/cdn/shop/files/5454_-_Main_1200x1200.jpg?v=1754373123", "https://www.plantoys.com/products/miracle-pounding-ii", "official_cdn"),
  "plantoys-geometric-sorting-board": remote("http://www.plantoys.com/cdn/shop/files/2403_-_Main_1200x1200.jpg?v=1755164521", "https://www.plantoys.com/products/geometric-sorting-board", "official_cdn"),
  "plantoys-oval-xylophone": remote("http://www.plantoys.com/cdn/shop/files/6405_-_Main_-_sq_1200x1200.jpg?v=1754372666", "https://www.plantoys.com/products/oval-xylophone", "official_cdn"),
  "plantoys-peek-a-boo-roller": remote("http://www.plantoys.com/cdn/shop/files/5252_-_Main_-_sq_1200x1200.jpg?v=1754375561", "https://www.plantoys.com/products/peek-a-boo-roller", "official_cdn"),
  "plantoys-penguin-wobbler": remote("http://www.plantoys.com/cdn/shop/files/5900_-_Packshot_-_01_1200x1200.jpg?v=1758422552", "https://www.plantoys.com/products/penguin-wobbler", "official_cdn"),
  "plantoys-pull-along-snail": remote("http://www.plantoys.com/cdn/shop/files/5108_-_Main_-_sq_1200x1200.jpg?v=1755249011", "https://www.plantoys.com/products/pull-along-snail", "official_cdn"),
  "plantoys-solid-drum": remote("http://www.plantoys.com/cdn/shop/files/6404_-_Main_-_sq_1200x1200.jpg?v=1755249303", "https://www.plantoys.com/products/solid-drum", "official_cdn"),
  "plantoys-road-system": remote("http://www.plantoys.com/cdn/shop/files/6208_-_Main_-_sq_1200x1200.jpg?v=1754375416", "https://www.plantoys.com/products/road-system", "official_cdn"),
  "plantoys-sensory-blocks": remote("http://www.plantoys.com/cdn/shop/products/5257_-_Packshot_-_01_1200x1200.jpg?v=1754375844", "https://www.plantoys.com/products/sensory-blocks", "official_cdn"),
  "plantoys-sea-life-bath-set": remote("http://www.plantoys.com/cdn/shop/files/5658_-_Main_-_sq_1200x1200.jpg?v=1754371545", "https://www.plantoys.com/products/sea-life-bath-set", "official_cdn"),
  "plantoys-stacking-rocket": remote("http://www.plantoys.com/cdn/shop/files/5694_-_Main_1200x1200.jpg?v=1754373079", "https://www.plantoys.com/products/stacking-rocket", "official_cdn"),
  "plantoys-roller-classic": remote("http://www.plantoys.com/cdn/shop/files/5220_-_Main_-_sq_1200x1200.jpg?v=1755248508", "https://www.plantoys.com/products/roller-classic", "official_cdn"),
  "plantoys-walk-n-roll": remote("http://www.plantoys.com/cdn/shop/files/5137_-_Main_-_sq_1200x1200.jpg?v=1755164188", "https://www.plantoys.com/products/walk-n-roll", "official_cdn"),
  "plantoys-stacking-tree": remote("http://www.plantoys.com/cdn/shop/files/5149_-_Main_-_sq_1200x1200.jpg?v=1754376978", "https://www.plantoys.com/products/stacking-tree", "official_cdn"),
  "plantoys-water-play-set": remote("http://www.plantoys.com/cdn/shop/files/5801_-_Main_-_sq_1200x1200.jpg?v=1754380289", "https://www.plantoys.com/products/water-play-set", "official_cdn"),
  "plantoys-wave-stacker": remote("http://www.plantoys.com/cdn/shop/files/5486_-_Main_1200x1200.jpg?v=1755249158", "https://www.plantoys.com/products/wave-stacker", "official_cdn"),
  "plantoys-vet-set": remote("http://www.plantoys.com/cdn/shop/files/3490_-_Main_-_sq_1200x1200.jpg?v=1754371916", "https://www.plantoys.com/products/vet-set", "official_cdn"),
  "plantoys-victorian-dollhouse": remote("http://www.plantoys.com/cdn/shop/files/712409_-_Main_-_01_1200x1200.jpg?v=1770801189", "https://www.plantoys.com/products/victorian-dollhouse", "official_cdn"),
  "plantoys-wautomobile": remote("http://www.plantoys.com/cdn/shop/products/5449_1636_1637_1638_-_Packshot_-_01_1200x1200.jpg?v=1754379041", "https://www.plantoys.com/products/wautomobile", "official_cdn"),
  "lovevery-inspector": remote("https://media.johnlewiscontent.com/i/JohnLewis/114262273?%24background-off-white%24=&%24rsp-pdp-port-640%24=&fmt=auto", "https://lovevery.com/products/the-play-kits-the-inspector", "stable_retailer"),
  "lovevery-explorer": remote("https://media.johnlewiscontent.com/i/JohnLewis/114262271?%24background-off-white%24=&%24rsp-pdp-port-640%24=&fmt=auto", "https://lovevery.com/products/the-play-kits-the-explorer", "stable_retailer"),
  "lovevery-thinker": remote("https://media.johnlewiscontent.com/i/JohnLewis/114262282?%24background-off-white%24=&%24rsp-pdp-port-640%24=&fmt=auto", "https://lovevery.com/products/the-play-kits-the-thinker", "stable_retailer"),
  "mideer-my-first-animal-family-6in1": remote("https://mideer.store/wp-content/uploads/2025/01/4feea2da3990e75917faf4dbdf87ff47.webp", "https://mideer.store/en/product/my-first-pieces-animal-family-6-in-1/", "stable_retailer"),
  "mideer-my-first-construction-6in1": remote("https://mideer.store/wp-content/uploads/2025/01/0dafc3f81f68ef0ab4a49d4a2d91dcfb_4460e93b-5e45-4e1e-9d4b-5f9a4182a94d.webp", "https://mideer.store/en/product/my-first-pieces-6-in-1-construction-machines/", "stable_retailer"),
  "hape-jungle-musical-railway": remote("https://eurekakids.com.hk/cdn/shop/files/E3825-jpg.webp?v=1773987744", "https://eurekakids.com.hk/products/music-and-monkey-railway", "stable_retailer"),
  "bduck-bounce-catch-game": remote("./catalog-assets/bduck-bounce-catch-game.webp", "bundled:catalog-assets/bduck-bounce-catch-game.webp", "manually_confirmed"),
  "cherrypick-original-magic-playwall": packaged("catalog-assets/cherrypick-original-magic-playwall.jpg", "https://shopcherrypick.com/products/magic-playwall?variant=44481003192508", "official_variant_cdn", "image/jpeg", "sha256:49c4ef0ede77ba62d5c8ff385deb84005a5a05fac32c6cd45b96215785e097a3"),
  "cherrypick-emotions-magnets-soft-foam-20pc": packaged("catalog-assets/cherrypick-emotions-magnets-soft-foam-20pc.jpg", "https://shopcherrypick.com/products/emotions-magnets-soft-foam-magnetic-set", "official_variant_cdn", "image/jpeg", "sha256:f7dbc7585e1dec66dfb620b8a19a86e2f198a8bb4a4abd59b3344054b62a7fa5"),
  "cherrypick-soft-foam-magnetic-letters": packaged("catalog-assets/cherrypick-soft-foam-magnetic-letters.jpg", "https://shopcherrypick.com/products/soft-foam-magnetic-letters-symbols-150pc-set?variant=44529740382396", "official_variant_cdn", "image/jpeg", "sha256:3c3fbf7c25b1c94c3e6879213d771f18bc1ead0903b2aa4f90b38ac95a4a8ad3"),
  "cherrypick-dustless-chalk-crayons": packaged("catalog-assets/cherrypick-dustless-chalk-crayons.jpg", "https://shopcherrypick.com/products/dustless-chalk-crayons-magnetic-holder-bundle-for-magic-playwall?variant=44190785765564", "official_variant_cdn", "image/jpeg", "sha256:3c0a08b8bdce7a4bed2065f3050fd63b6058a9b599cc00fc36de50d5a9e5ba70"),
  "mideer-animal-toys-set-15pcs": packaged("catalog-assets/mideer-animal-toys-set-15pcs.jpg", "https://www.toytag.com/products/animals-toy-set-15p", "authorized_retailer_exact_sku", "image/jpeg", "sha256:e062bf4ff7b9136ce15263bd994abf587b26a1c9bfa896c4ff87975c89998e90"),
  "mideer-level1-home-sweet-home-puzzle": packaged("catalog-assets/mideer-level1-home-sweet-home-puzzle.jpg", "https://mideermall.com/products/mideer-level-up-puzzles-level-1-home-sweet-home", "authorized_retailer_exact_sku", "image/jpeg", "sha256:b926afe91148eccc63e9ea4367482f0833d566a5b6b55fd09020b6d8466cd98b"),
  "mideer-level1-home-sweet-home-puzzle:puzzle-1": { ...packaged("catalog-assets/mideer-home-sweet-home-md1673-puzzle-1.png", "https://www.panguitoys.cl/puzzle-progresivo-8-en-1-nuestro-hogar-nivel-1", "authorized_retailer_exact_sku", "image/png", "sha256:41b2a4ae3a622fb2685ad1bfac66acf2bcf1d924254ab960666355f374a398ed"), imageOwnerCanonicalKey: "mideer-level1-home-sweet-home-puzzle:puzzle-1", sku: "MD1673", officialProductName: "Level Up! Puzzles Level 1: Home, Sweet Home! \u2014 Fish (2 pieces)", sourceImageUrl: "https://cdnx.jumpseller.com/panguitoys/image/70391759/resize/610/610?1764889740=", sourceImageMime: "image/webp", cropRect: "338,85,130,120", sourceImageHash: "sha256:280ee412ad66d05a50987b8e45746e5bb6647c2fdff42c41a4eb869fa489cd8f" },
  "mideer-level1-home-sweet-home-puzzle:puzzle-2": { ...packaged("catalog-assets/mideer-home-sweet-home-md1673-puzzle-2.png", "https://www.panguitoys.cl/puzzle-progresivo-8-en-1-nuestro-hogar-nivel-1", "authorized_retailer_exact_sku", "image/png", "sha256:4c873c64155dda52f579e36657938fca8274f53357dd78ba848fb6166ac773a3"), imageOwnerCanonicalKey: "mideer-level1-home-sweet-home-puzzle:puzzle-2", sku: "MD1673", officialProductName: "Level Up! Puzzles Level 1: Home, Sweet Home! \u2014 Bee (2 pieces)", sourceImageUrl: "https://cdnx.jumpseller.com/panguitoys/image/70391759/resize/610/610?1764889740=", sourceImageMime: "image/webp", cropRect: "465,85,130,120", sourceImageHash: "sha256:280ee412ad66d05a50987b8e45746e5bb6647c2fdff42c41a4eb869fa489cd8f" },
  "mideer-level1-home-sweet-home-puzzle:puzzle-3": { ...packaged("catalog-assets/mideer-home-sweet-home-md1673-puzzle-3.png", "https://www.panguitoys.cl/puzzle-progresivo-8-en-1-nuestro-hogar-nivel-1", "authorized_retailer_exact_sku", "image/png", "sha256:7eca507ad5b4f69fa7632a6c2686cfa9a4f24c6b480c055ba18cad80490c326e"), imageOwnerCanonicalKey: "mideer-level1-home-sweet-home-puzzle:puzzle-3", sku: "MD1673", officialProductName: "Level Up! Puzzles Level 1: Home, Sweet Home! \u2014 Frog (3 pieces)", sourceImageUrl: "https://cdnx.jumpseller.com/panguitoys/image/70391759/resize/610/610?1764889740=", sourceImageMime: "image/webp", cropRect: "337,185,132,120", sourceImageHash: "sha256:280ee412ad66d05a50987b8e45746e5bb6647c2fdff42c41a4eb869fa489cd8f" },
  "mideer-level1-home-sweet-home-puzzle:puzzle-4": { ...packaged("catalog-assets/mideer-home-sweet-home-md1673-puzzle-4.png", "https://www.panguitoys.cl/puzzle-progresivo-8-en-1-nuestro-hogar-nivel-1", "authorized_retailer_exact_sku", "image/png", "sha256:9a84e514d49ea6d59a892d3ae9cff76bae3e8d72709191dd68edf2b87e6f4e5a"), imageOwnerCanonicalKey: "mideer-level1-home-sweet-home-puzzle:puzzle-4", sku: "MD1673", officialProductName: "Level Up! Puzzles Level 1: Home, Sweet Home! \u2014 Bird (3 pieces)", sourceImageUrl: "https://cdnx.jumpseller.com/panguitoys/image/70391759/resize/610/610?1764889740=", sourceImageMime: "image/webp", cropRect: "464,185,132,120", sourceImageHash: "sha256:280ee412ad66d05a50987b8e45746e5bb6647c2fdff42c41a4eb869fa489cd8f" },
  "mideer-level1-home-sweet-home-puzzle:puzzle-5": { ...packaged("catalog-assets/mideer-home-sweet-home-md1673-puzzle-5.png", "https://www.panguitoys.cl/puzzle-progresivo-8-en-1-nuestro-hogar-nivel-1", "authorized_retailer_exact_sku", "image/png", "sha256:68ab8dae2db702d24573db5597aa11d4b2bf806de2160dd128d75ef6f1c7682f"), imageOwnerCanonicalKey: "mideer-level1-home-sweet-home-puzzle:puzzle-5", sku: "MD1673", officialProductName: "Level Up! Puzzles Level 1: Home, Sweet Home! \u2014 Chicken (4 pieces)", sourceImageUrl: "https://cdnx.jumpseller.com/panguitoys/image/70391759/resize/610/610?1764889740=", sourceImageMime: "image/webp", cropRect: "337,285,132,125", sourceImageHash: "sha256:280ee412ad66d05a50987b8e45746e5bb6647c2fdff42c41a4eb869fa489cd8f" },
  "mideer-level1-home-sweet-home-puzzle:puzzle-6": { ...packaged("catalog-assets/mideer-home-sweet-home-md1673-puzzle-6.png", "https://www.panguitoys.cl/puzzle-progresivo-8-en-1-nuestro-hogar-nivel-1", "authorized_retailer_exact_sku", "image/png", "sha256:1686ada094067eeec498ebc63bda9111177ce6a655765ebb921f7ae5bf6076e0"), imageOwnerCanonicalKey: "mideer-level1-home-sweet-home-puzzle:puzzle-6", sku: "MD1673", officialProductName: "Level Up! Puzzles Level 1: Home, Sweet Home! \u2014 Cat (4 pieces)", sourceImageUrl: "https://cdnx.jumpseller.com/panguitoys/image/70391759/resize/610/610?1764889740=", sourceImageMime: "image/webp", cropRect: "464,285,132,125", sourceImageHash: "sha256:280ee412ad66d05a50987b8e45746e5bb6647c2fdff42c41a4eb869fa489cd8f" },
  "mideer-level1-home-sweet-home-puzzle:puzzle-7": { ...packaged("catalog-assets/mideer-home-sweet-home-md1673-puzzle-7.png", "https://www.panguitoys.cl/puzzle-progresivo-8-en-1-nuestro-hogar-nivel-1", "authorized_retailer_exact_sku", "image/png", "sha256:8ea3272fdd61f64c7cc3622f08fda57331a5922b6897d6044d722a1007165ceb"), imageOwnerCanonicalKey: "mideer-level1-home-sweet-home-puzzle:puzzle-7", sku: "MD1673", officialProductName: "Level Up! Puzzles Level 1: Home, Sweet Home! \u2014 Football Dog (5 pieces)", sourceImageUrl: "https://cdnx.jumpseller.com/panguitoys/image/70391759/resize/610/610?1764889740=", sourceImageMime: "image/webp", cropRect: "337,390,132,125", sourceImageHash: "sha256:280ee412ad66d05a50987b8e45746e5bb6647c2fdff42c41a4eb869fa489cd8f" },
  "mideer-level1-home-sweet-home-puzzle:puzzle-8": { ...packaged("catalog-assets/mideer-home-sweet-home-md1673-puzzle-8.png", "https://www.panguitoys.cl/puzzle-progresivo-8-en-1-nuestro-hogar-nivel-1", "authorized_retailer_exact_sku", "image/png", "sha256:ed96a2c6ca4f4c6f4697cad7b6fe0b2110f384d237627e36e6952aeb99db3f77"), imageOwnerCanonicalKey: "mideer-level1-home-sweet-home-puzzle:puzzle-8", sku: "MD1673", officialProductName: "Level Up! Puzzles Level 1: Home, Sweet Home! \u2014 Cow in House (6 pieces)", sourceImageUrl: "https://cdnx.jumpseller.com/panguitoys/image/70391759/resize/610/610?1764889740=", sourceImageMime: "image/webp", cropRect: "464,390,132,125", sourceImageHash: "sha256:280ee412ad66d05a50987b8e45746e5bb6647c2fdff42c41a4eb869fa489cd8f" },
  "mideer-my-first-puzzle-dinosaurs-6in1": packaged("catalog-assets/mideer-my-first-puzzle-dinosaurs-6in1.webp", "https://mideer.store/en/product/my-first-dinosaur-pieces-6-in-1/", "official_cdn", "image/webp", "sha256:e5fe90815379cd197aa58f5aeaaa5bb3cde546a2fb35882c2d2cbe9074043432"),
  "hahaland-farm-busy-book-20in1": { ...packaged("catalog-assets/hahaland-farm-busy-book-20in1.jpg", "https://hahaland.com/products/montessori-farm-busy-book-for-toddlers-1-3", "official_cdn", "image/jpeg", "sha256:3e22ad2e37d1db06612ecefda6e99301a68383c3a212a22e769ab7bf06e26a5b"), imageOwnerCanonicalKey: "hahaland-farm-busy-book-20in1", officialProductName: "Montessori Farm Busy Book for Toddlers 1\u20133", sourceImageUrl: "https://hahaland.com/cdn/shop/files/1601x1601-1E.jpg?v=1776750632", sourceImageMime: "image/jpeg" },
  "hahaland-surprise-barn": { ...packaged("catalog-assets/hahaland-surprise-barn.jpg", "https://hahaland.com/products/montessori-sensory-farm-animal-set-for-6-12-months", "official_cdn", "image/jpeg", "sha256:d6e2024358fcc018fea9b2419ae01fb133cd15668d85b2df18d505f6dba91735"), imageOwnerCanonicalKey: "hahaland-surprise-barn", officialProductName: "My First Barn Animal Toys", sourceImageUrl: "https://hahaland.com/cdn/shop/files/img_v3_02ro_319e676e-0387-4446-8207-aaed6789d84g.jpg?v=1762321751", sourceImageMime: "image/jpeg" },
  "hahaland-mermaid-busy-board": { ...packaged("catalog-assets/hahaland-mermaid-busy-board.jpg", "https://hahaland.com/products/7-in-1-montessori-busy-board-3-year-old", "official_cdn", "image/jpeg", "sha256:ee54e47301030181df08d936e6437b276c4d1e82cf052f88136f4c79a874ba1b"), imageOwnerCanonicalKey: "hahaland-mermaid-busy-board", officialProductName: "Purple Mermaid Montessori Busy Board", sourceImageUrl: "https://hahaland.com/cdn/shop/files/1601x1601-1.1_e4915f61-f4b8-4f79-888d-070b7cb2cba3_2048x.jpg?v=1720592689", sourceImageMime: "image/jpeg" },
  // QA7-r4 owned-library audit backfill. Every remote ref below was checked
  // against its exact product identity and returned an unauthenticated image MIME.
  "hape-creative-peg-puzzle-farm": { ...remote("https://www.babyonline.com.hk/image/cache/data/product/hape/E1402_Farm_Animals_Peg_Puzzle-1024x1024.jpg", "https://www.babyonline.com.hk/farm-animals-peg-puzzle-hape", "stable_retailer"), imageOwnerCanonicalKey: "hape-creative-peg-puzzle-farm", sku: "E1402", officialProductName: "Farm Animals Peg Puzzle" },
  "lr-helping-hands": { ...remote("https://www.argosytoys.co.uk/productimages/1200/learning-resources-helping-hands-fine-motor-tool-set_192119.jpg", "https://www.learningresources.com/item-helping-hands-fine-motor-tool-set-8482", "stable_retailer"), imageOwnerCanonicalKey: "lr-helping-hands", sku: "LER5558", officialProductName: "Helping Hands Fine Motor Tool Set" },
  "lr-lock-key-clubhouse": { ...remote("https://teachertoolsinc.com/6813341-medium_default/lock-key-clubhouse-ler9807.jpg", "https://www.learningresources.com/item-lock-key-clubhouse", "stable_retailer"), imageOwnerCanonicalKey: "lr-lock-key-clubhouse", sku: "LER9807", officialProductName: "Lock & Key Clubhouse" },
  "lr-noodle-knockout": { ...remote("https://www.toysrus.com/cdn/shop/files/LER5549_2.jpg?v=1727054901&width=1946", "https://www.learningresources.com/item-noodle-knockout-fine-motor-game", "stable_retailer"), imageOwnerCanonicalKey: "lr-noodle-knockout", sku: "LER5549", officialProductName: "Noodle Knockout Fine Motor Game" },
  "lego-duplo-brick-box": { ...remote("https://www.lego.com/cdn/cs/set/assets/bltde3f7bfcde3b435e/10913_Box1_v39.png", "https://www.lego.com/en-us/product/brick-box-10913", "official_cdn"), imageOwnerCanonicalKey: "lego-duplo-brick-box", sku: "10913", officialProductName: "LEGO DUPLO Brick Box" },
  "mideer-magic-doodle-mat-hungry-caterpillar": { ...remote("https://laadlee.com/cdn/shop/files/MD2262_2.jpg?v=1744201453", "https://laadlee.com/products/mideer-magic-doodle-mat-the-very-hungry-caterpillar", "stable_retailer"), imageOwnerCanonicalKey: "mideer-magic-doodle-mat-hungry-caterpillar", sku: "MD2262", officialProductName: "Magic Doodle Mat \u2013 The Very Hungry Caterpillar" },
  "mfb-food-pink": { ...remote("https://myfirstbook.us/cdn/shop/files/3_dcc95c52-93dc-42d2-ba58-77c649ac219b.png?v=1765914094&width=1296", "https://myfirstbook.us/products/my-first-book-food", "official_cdn"), imageOwnerCanonicalKey: "mfb-food-pink", officialProductName: "Food Busy Book \u2014 Pink" },
  "mideer-my-first-puzzle-dinosaurs-6in1-md1460": packaged("catalog-assets/mideer-my-first-puzzle-dinosaurs-6in1.webp", "https://mideer.store/en/product/my-first-dinosaur-pieces-6-in-1/", "official_cdn", "image/webp", "sha256:e5fe90815379cd197aa58f5aeaaa5bb3cde546a2fb35882c2d2cbe9074043432"),
  "mideer-first-artist-busy-cars:puzzle-1": packagedCrop("catalog-assets/mideer-busy-cars-puzzle-1.jpg", "https://mideerart.com/en-ca/products/my-first-artist-puzzle-busy-cars", "official_cdn", "sha256:40cd9bdc31b537c6497cd502ea6d51a1777eb3384ef93782a92b892cfba39237", { imageOwnerCanonicalKey: "mideer-first-artist-busy-cars:puzzle-1", sku: "MD1458", officialProductName: "My First Artist Puzzle: Busy Cars \u2014 Car (2 pieces)", sourceImageUrl: "https://mideerart.com/cdn/shop/files/47035f661a0ca70240097c400db054ed_3e4f06c8-49c8-4f50-876f-c75a63c22462.jpg?v=1712556896&width=3840", sourceImageMime: "image/jpeg", sourceImageDimensions: "1080x1080", cropRect: "70,560,320,320", packagedDimensions: "512x512" }),
  "mideer-first-artist-busy-cars:puzzle-2": packagedCrop("catalog-assets/mideer-busy-cars-puzzle-2.jpg", "https://mideerart.com/en-ca/products/my-first-artist-puzzle-busy-cars", "official_cdn", "sha256:1485fec9f9ea652b748d22cb854d87f415140201d01de567b2a0dfa5b2127eda", { imageOwnerCanonicalKey: "mideer-first-artist-busy-cars:puzzle-2", sku: "MD1458", officialProductName: "My First Artist Puzzle: Busy Cars \u2014 Police Car (2 pieces)", sourceImageUrl: "https://mideerart.com/cdn/shop/files/47035f661a0ca70240097c400db054ed_3e4f06c8-49c8-4f50-876f-c75a63c22462.jpg?v=1712556896&width=3840", sourceImageMime: "image/jpeg", sourceImageDimensions: "1080x1080", cropRect: "380,560,320,320", packagedDimensions: "512x512" }),
  "mideer-first-artist-busy-cars:puzzle-3": packagedCrop("catalog-assets/mideer-busy-cars-puzzle-3.jpg", "https://mideerart.com/en-ca/products/my-first-artist-puzzle-busy-cars", "official_cdn", "sha256:13a3ebe749f7a7f71915e1fbc6f97cd9502c52ebe1c2cdfcd628cb01ef86069e", { imageOwnerCanonicalKey: "mideer-first-artist-busy-cars:puzzle-3", sku: "MD1458", officialProductName: "My First Artist Puzzle: Busy Cars \u2014 Ice Cream Truck (3 pieces)", sourceImageUrl: "https://mideerart.com/cdn/shop/files/47035f661a0ca70240097c400db054ed_3e4f06c8-49c8-4f50-876f-c75a63c22462.jpg?v=1712556896&width=3840", sourceImageMime: "image/jpeg", sourceImageDimensions: "1080x1080", cropRect: "690,560,320,320", packagedDimensions: "512x512" }),
  "mideer-first-artist-busy-cars:puzzle-4": packagedCrop("catalog-assets/mideer-busy-cars-puzzle-4.jpg", "https://mideerart.com/en-ca/products/my-first-artist-puzzle-busy-cars", "official_cdn", "sha256:972db788aadd40c8ca58c0be17d2e3b774875f758581dad8ac7fe24e05381dfe", { imageOwnerCanonicalKey: "mideer-first-artist-busy-cars:puzzle-4", sku: "MD1458", officialProductName: "My First Artist Puzzle: Busy Cars \u2014 Garbage Truck (4 pieces)", sourceImageUrl: "https://mideerart.com/cdn/shop/files/47035f661a0ca70240097c400db054ed_3e4f06c8-49c8-4f50-876f-c75a63c22462.jpg?v=1712556896&width=3840", sourceImageMime: "image/jpeg", sourceImageDimensions: "1080x1080", cropRect: "65,750,330,330", packagedDimensions: "528x528" }),
  "mideer-first-artist-busy-cars:puzzle-5": packagedCrop("catalog-assets/mideer-busy-cars-puzzle-5.jpg", "https://mideerart.com/en-ca/products/my-first-artist-puzzle-busy-cars", "official_cdn", "sha256:98ae82eead9d904f1e122384232dcd962da970262b93b33836faa15764bdadbd", { imageOwnerCanonicalKey: "mideer-first-artist-busy-cars:puzzle-5", sku: "MD1458", officialProductName: "My First Artist Puzzle: Busy Cars \u2014 Delivery Truck (5 pieces)", sourceImageUrl: "https://mideerart.com/cdn/shop/files/47035f661a0ca70240097c400db054ed_3e4f06c8-49c8-4f50-876f-c75a63c22462.jpg?v=1712556896&width=3840", sourceImageMime: "image/jpeg", sourceImageDimensions: "1080x1080", cropRect: "385,750,330,330", packagedDimensions: "528x528" }),
  "mideer-first-artist-busy-cars:puzzle-6": packagedCrop("catalog-assets/mideer-busy-cars-puzzle-6.jpg", "https://mideerart.com/en-ca/products/my-first-artist-puzzle-busy-cars", "official_cdn", "sha256:f038a4549bdb351ff2860cec47ced960c926b58dbf32ee4d5d7ee397e296e49b", { imageOwnerCanonicalKey: "mideer-first-artist-busy-cars:puzzle-6", sku: "MD1458", officialProductName: "My First Artist Puzzle: Busy Cars \u2014 School Bus (6 pieces)", sourceImageUrl: "https://mideerart.com/cdn/shop/files/47035f661a0ca70240097c400db054ed_3e4f06c8-49c8-4f50-876f-c75a63c22462.jpg?v=1712556896&width=3840", sourceImageMime: "image/jpeg", sourceImageDimensions: "1080x1080", cropRect: "690,750,330,330", packagedDimensions: "528x528" }),
  "mideer-my-first-puzzle-dinosaurs-6in1-md1460:puzzle-1": packagedCrop("catalog-assets/mideer-dinosaurs-md1460-puzzle-1.jpg", "https://mideermall.com/products/my-first-artist-puzzle-cute-dinosaurs", "official_cdn", "sha256:50a37b75207f08231087fd2ca946ecd8677110922a6de906f7d8db293c7f707b", { imageOwnerCanonicalKey: "mideer-my-first-puzzle-dinosaurs-6in1-md1460:puzzle-1", sku: "MD1460", officialProductName: "My First Artist Puzzle: Cute Dinosaurs \u2014 Pterosaur (2 pieces)", sourceImageUrl: "https://mideermall.com/cdn/shop/files/cb0a69b7065553ac78e4593b6e2d50a1_ad3e4dc2-668b-42bf-ba04-bfbb37f5c4be_1800x1800.jpg?v=1772690790", sourceImageMime: "image/jpeg", sourceImageDimensions: "1080x1080", cropRect: "80,560,300,220", packagedDimensions: "512x512" }),
  "mideer-my-first-puzzle-dinosaurs-6in1-md1460:puzzle-2": packagedCrop("catalog-assets/mideer-dinosaurs-md1460-puzzle-2.jpg", "https://mideermall.com/products/my-first-artist-puzzle-cute-dinosaurs", "official_cdn", "sha256:2f56da3269e237f87c4c24699271b74b4ac78d1197a028b5e9d7a55a5ee55825", { imageOwnerCanonicalKey: "mideer-my-first-puzzle-dinosaurs-6in1-md1460:puzzle-2", sku: "MD1460", officialProductName: "My First Artist Puzzle: Cute Dinosaurs \u2014 Parasaurolophus (2 pieces)", sourceImageUrl: "https://mideermall.com/cdn/shop/files/cb0a69b7065553ac78e4593b6e2d50a1_ad3e4dc2-668b-42bf-ba04-bfbb37f5c4be_1800x1800.jpg?v=1772690790", sourceImageMime: "image/jpeg", sourceImageDimensions: "1080x1080", cropRect: "390,560,300,220", packagedDimensions: "512x512" }),
  "mideer-my-first-puzzle-dinosaurs-6in1-md1460:puzzle-3": packagedCrop("catalog-assets/mideer-dinosaurs-md1460-puzzle-3.jpg", "https://mideermall.com/products/my-first-artist-puzzle-cute-dinosaurs", "official_cdn", "sha256:cb0a06968a763966e5f1122a2a50602f9b304b44792d879209d347552d62f7ef", { imageOwnerCanonicalKey: "mideer-my-first-puzzle-dinosaurs-6in1-md1460:puzzle-3", sku: "MD1460", officialProductName: "My First Artist Puzzle: Cute Dinosaurs \u2014 Stegosaurus (3 pieces)", sourceImageUrl: "https://mideermall.com/cdn/shop/files/cb0a69b7065553ac78e4593b6e2d50a1_ad3e4dc2-668b-42bf-ba04-bfbb37f5c4be_1800x1800.jpg?v=1772690790", sourceImageMime: "image/jpeg", sourceImageDimensions: "1080x1080", cropRect: "700,560,300,220", packagedDimensions: "512x512" }),
  "mideer-my-first-puzzle-dinosaurs-6in1-md1460:puzzle-4": packagedCrop("catalog-assets/mideer-dinosaurs-md1460-puzzle-4.jpg", "https://mideermall.com/products/my-first-artist-puzzle-cute-dinosaurs", "official_cdn", "sha256:b528639f61013f52334c4089c2a8291e5d01a1b6e5b4846cc23b1e508cee2976", { imageOwnerCanonicalKey: "mideer-my-first-puzzle-dinosaurs-6in1-md1460:puzzle-4", sku: "MD1460", officialProductName: "My First Artist Puzzle: Cute Dinosaurs \u2014 Triceratops (4 pieces)", sourceImageUrl: "https://mideermall.com/cdn/shop/files/cb0a69b7065553ac78e4593b6e2d50a1_ad3e4dc2-668b-42bf-ba04-bfbb37f5c4be_1800x1800.jpg?v=1772690790", sourceImageMime: "image/jpeg", sourceImageDimensions: "1080x1080", cropRect: "80,800,320,260", packagedDimensions: "512x512" }),
  "mideer-my-first-puzzle-dinosaurs-6in1-md1460:puzzle-5": packagedCrop("catalog-assets/mideer-dinosaurs-md1460-puzzle-5.jpg", "https://mideermall.com/products/my-first-artist-puzzle-cute-dinosaurs", "official_cdn", "sha256:1790aa814c576ef9ff42cbb969af90c2d0f50a921eb8bc6bb5ed97ee289e0f3b", { imageOwnerCanonicalKey: "mideer-my-first-puzzle-dinosaurs-6in1-md1460:puzzle-5", sku: "MD1460", officialProductName: "My First Artist Puzzle: Cute Dinosaurs \u2014 Tyrannosaurus rex (5 pieces)", sourceImageUrl: "https://mideermall.com/cdn/shop/files/cb0a69b7065553ac78e4593b6e2d50a1_ad3e4dc2-668b-42bf-ba04-bfbb37f5c4be_1800x1800.jpg?v=1772690790", sourceImageMime: "image/jpeg", sourceImageDimensions: "1080x1080", cropRect: "400,800,300,260", packagedDimensions: "512x512" }),
  "mideer-my-first-puzzle-dinosaurs-6in1-md1460:puzzle-6": packagedCrop("catalog-assets/mideer-dinosaurs-md1460-puzzle-6.jpg", "https://mideermall.com/products/my-first-artist-puzzle-cute-dinosaurs", "official_cdn", "sha256:28f1c34e738d981870f6b08343fbe26d66c4907c3ec4b6d74270084c31fb0f49", { imageOwnerCanonicalKey: "mideer-my-first-puzzle-dinosaurs-6in1-md1460:puzzle-6", sku: "MD1460", officialProductName: "My First Artist Puzzle: Cute Dinosaurs \u2014 Snake (6 pieces)", sourceImageUrl: "https://mideermall.com/cdn/shop/files/cb0a69b7065553ac78e4593b6e2d50a1_ad3e4dc2-668b-42bf-ba04-bfbb37f5c4be_1800x1800.jpg?v=1772690790", sourceImageMime: "image/jpeg", sourceImageDimensions: "1080x1080", cropRect: "720,800,300,260", packagedDimensions: "512x512" }),
  "lego-duplo-fire-truck-hose-firefighter-10473": packaged("catalog-assets/lego-duplo-fire-truck-hose-firefighter-10473.jpg", "https://www.lego.com/en-ca/product/fire-truck-with-hose-and-firefighter-10473", "authorized_retailer_exact_set", "image/jpeg", "sha256:ad876feeb6209405527d7e3813de4aedc9509053471b6c9f59b874b741c0d174"),
  "lego-duplo-3in1-construction-vehicles-10475": packaged("catalog-assets/lego-duplo-3in1-construction-vehicles-10475.png", "https://www.lego.com/en-us/product/3-in-1-construction-vehicles-10475", "authorized_retailer_exact_set", "image/png", "sha256:510aa25bcf9f1abd6385364236972e96c1673fb52044fd44ca9a8b1f5aa572d0"),
  "lego-duplo-animal-train": packaged("catalog-assets/lego-duplo-animal-train-10955.jpg", "https://www.lego.com/en-pt/product/animal-train-10955", "authorized_retailer_exact_set", "image/jpeg", "sha256:3736cac2185ac843f8ceed04a9ab7d4c042ef5afffb54ff1a09d0b7301de8ccd"),
  // Image expansion batch: each remote image was confirmed from its exact product
  // page and browser-loaded directly from the manufacturer CDN.
  "mideer-brush-acrylic-24": { ...remote("https://mideerart.com/cdn/shop/files/1_112ffd03-60e4-48e3-b3bd-e8d00fcc31ad.jpg?v=1730388657", "https://mideerart.com/en-ca/products/brush-tip-acrylic-markers-with-doodle-bag-24-colors", "official_cdn"), imageOwnerCanonicalKey: "mideer-brush-acrylic-24", sku: "MD1613", officialProductName: "Brush Tip Acrylic Markers with Doodle Bag 24 Colors" },
  "mideer-brush-acrylic-36": { ...remote("https://mideerart.com/cdn/shop/files/36_bf5b3f49-1e60-4f15-a5cd-bb53cf7366c0.jpg?v=1730957786", "https://mideerart.com/en-ca/products/brush-tip-acrylic-markers-with-doodle-bag-36-colors", "official_cdn"), imageOwnerCanonicalKey: "mideer-brush-acrylic-36", officialProductName: "Brush Tip Acrylic Markers with Doodle Bag 36 Colors" },
  "mideer-brush-acrylic-60": { ...remote("https://mideerart.com/cdn/shop/files/60_97166d97-9abc-43ca-b8be-0fec713a53c2.jpg?v=1730957811", "https://mideerart.com/en-ca/products/brush-tip-acrylic-markers-with-doodle-bag-60-colors", "official_cdn"), imageOwnerCanonicalKey: "mideer-brush-acrylic-60", officialProductName: "Brush Tip Acrylic Markers with Doodle Bag 60 Colors" },
  "lego-duplo-heart-box": { ...remote("https://www.lego.com/cdn/cs/set/assets/blt3f022bad6721accf/10909.jpg?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1", "https://www.lego.com/en-us/product/heart-box-10909", "official_cdn"), imageOwnerCanonicalKey: "lego-duplo-heart-box", sku: "10909", officialProductName: "Heart Box" },
  "mideer-educational-balance-blocks": { ...remote("https://mideerart.com/cdn/shop/files/1_7f622358-3528-4b1f-bb98-0c416573ca64.jpg?v=1715830788", "https://mideerart.com/en-ca/collections/best-selling-products/products/stackable-blocks-wisdom-tree", "official_cdn"), imageOwnerCanonicalKey: "mideer-educational-balance-blocks", sku: "MD1469", officialProductName: "Educational Balance Blocks" },
  "mideer-magic-dyeing-florist": { ...remote("https://mideerart.com/cdn/shop/files/1_e5638237-15ea-48f5-9d92-7dabc47b92b9.jpg?v=1749705826", "https://mideerart.com/en-ca/products/magic-dyeing-florist", "official_cdn"), imageOwnerCanonicalKey: "mideer-magic-dyeing-florist", officialProductName: "Magic Dyeing Florist" },
  "mideer-magnetic-glow-fidget": { ...remote("https://mideerart.com/cdn/shop/files/1080-_-1.jpg?v=1768544774", "https://mideerart.com/en-ca/products/magnetic-glow-fidget-spinner", "official_cdn"), imageOwnerCanonicalKey: "mideer-magnetic-glow-fidget", officialProductName: "Magnetic Glow Fidget Spinner" },
  "mideer-wild-dodgeball-kids": { ...remote("https://mideerart.com/cdn/shop/files/2_620363d9-f5c1-4b46-b6a7-9c9243aaee1b.jpg?v=1749108847", "https://mideerart.com/en-ca/products/wild-dodgeball-for-kids", "official_cdn"), imageOwnerCanonicalKey: "mideer-wild-dodgeball-kids", officialProductName: "Wild Dodgeball For Kids" },
  "lego-duplo-bath-time-fun-floating-animal-train": { ...remote("https://www.lego.com/cdn/cs/set/assets/blt7dc95dd9e7c27256/10965.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1", "https://www.lego.com/en-us/product/bath-time-fun-floating-animal-train-10965", "official_cdn"), imageOwnerCanonicalKey: "lego-duplo-bath-time-fun-floating-animal-train", sku: "10965", officialProductName: "Bath Time Fun: Floating Animal Train" },
  "lego-duplo-number-train": { ...remote("https://www.lego.com/cdn/cs/set/assets/blt4cd999af64e1f8c8/10954.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1", "https://www.lego.com/en-us/product/number-train-learn-to-count-10954", "official_cdn"), imageOwnerCanonicalKey: "lego-duplo-number-train", sku: "10954", officialProductName: "Number Train - Learn To Count" },
  "lego-duplo-classic-brick-box": { ...remote("https://www.lego.com/cdn/cs/set/assets/blte88e29b40e206dc1/10913.jpg?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1", "https://www.lego.com/en-us/product/brick-box-10913", "official_cdn"), imageOwnerCanonicalKey: "lego-duplo-classic-brick-box", sku: "10913", officialProductName: "Brick Box" },
  "lego-duplo-disney-mickey-minnie-birthday": { ...remote("https://www.lego.com/cdn/cs/set/assets/blta1999c7058f17ae7/10941_alt2.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1", "https://www.lego.com/en-us/product/mickey-minnie-birthday-train-10941", "official_cdn"), imageOwnerCanonicalKey: "lego-duplo-disney-mickey-minnie-birthday", sku: "10941", officialProductName: "Mickey & Minnie Birthday Train" },
  "lego-duplo-town-bus-ride": { ...remote("https://www.lego.com/cdn/cs/set/assets/bltc3b2753f3ceb7e72/10988.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1", "https://www.lego.com/en-us/product/bus-ride-10988", "official_cdn"), imageOwnerCanonicalKey: "lego-duplo-town-bus-ride", sku: "10988", officialProductName: "The Bus Ride" },
  "lego-duplo-town-construction-site": { ...remote("https://www.lego.com/cdn/cs/set/assets/bltaae5491bf55f2106/10990.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1", "https://www.lego.com/en-us/product/construction-site-10990", "official_cdn"), imageOwnerCanonicalKey: "lego-duplo-town-construction-site", sku: "10990", officialProductName: "Construction Site" },
  "lego-duplo-town-family-house": { ...remote("https://www.lego.com/cdn/cs/set/assets/blt755015aa61bb1ed9/10835.jpg?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1", "https://www.lego.com/en-us/product/family-house-10835", "official_cdn"), imageOwnerCanonicalKey: "lego-duplo-town-family-house", sku: "10835", officialProductName: "Family House" },
  "lego-duplo-town-fire-station": { ...remote("https://www.lego.com/cdn/cs/set/assets/blt7a4fa14b7e5d9302/10970.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1", "https://www.lego.com/en-us/product/fire-station-helicopter-10970", "official_cdn"), imageOwnerCanonicalKey: "lego-duplo-town-fire-station", sku: "10970", officialProductName: "Fire Station & Helicopter" },
  "lego-duplo-wild-animals-africa": { ...remote("https://www.lego.com/cdn/cs/set/assets/blt8638d927ddbc641a/10971.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1", "https://www.lego.com/en-us/product/wild-animals-of-africa-10971", "official_cdn"), imageOwnerCanonicalKey: "lego-duplo-wild-animals-africa", sku: "10971", officialProductName: "Wild Animals of Africa" },
  "lego-duplo-wild-animals-asia": { ...remote("https://www.lego.com/cdn/cs/set/assets/bltdd2f965345b78fee/10974.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1", "https://www.lego.com/en-us/product/wild-animals-of-asia-10974", "official_cdn"), imageOwnerCanonicalKey: "lego-duplo-wild-animals-asia", sku: "10974", officialProductName: "Wild Animals of Asia" },
  "lego-duplo-organic-garden": { ...remote("https://www.lego.com/cdn/cs/set/assets/bltb254d58162db9302/10984.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1", "https://www.lego.com/en-us/product/organic-garden-10984", "official_cdn"), imageOwnerCanonicalKey: "lego-duplo-organic-garden", sku: "10984", officialProductName: "Organic Garden" },
  "lego-duplo-wild-animals-of-the-world": { ...remote("https://www.lego.com/cdn/cs/set/assets/blt872dd178b82ee979/10975.png?fit=bounds&format=jpg&quality=80&width=1500&height=1500&dpr=1", "https://www.lego.com/en-us/product/wild-animals-of-the-world-10975", "official_cdn"), imageOwnerCanonicalKey: "lego-duplo-wild-animals-of-the-world", sku: "10975", officialProductName: "Wild Animals of the World" },
  "lr-botley-2-coding-robot": { ...remote("https://www.learningresources.com/media/catalog/product/1/1/118b12ea853f88badb91286346f8f809240851ad.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-botleyr-the-coding-robot-2", "official_cdn"), imageOwnerCanonicalKey: "lr-botley-2-coding-robot", sku: "LER2941", officialProductName: "Botley 2.0 the Coding Robot" },
  "lr-code-go-robot-mouse": { ...remote("https://www.learningresources.com/media/catalog/product/2/d/2d73fbce473d903560ca12bfb6c3eed60f64a794.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-code-gor-robot-mouse-activity-set", "official_cdn"), imageOwnerCanonicalKey: "lr-code-go-robot-mouse", sku: "LER2831", officialProductName: "Code & Go Robot Mouse Activity Set" },
  "learning-resources-spike-hedgehog": { ...remote("https://www.learningresources.com/media/catalog/product/c/0/c0a607eb18f726a3c9c754bd2ddb54b05ba71aa9.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-spike-the-fine-motor-hedgehogtm", "official_cdn"), imageOwnerCanonicalKey: "learning-resources-spike-hedgehog", officialProductName: "Spike the Fine Motor Hedgehog" },
  "lr-mini-farmstand-sorting-set": { ...remote("https://www.learningresources.com/media/catalog/product/7/b/7bdaf39274d57289a26031f3ef791204b60302e1.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-mini-farmstand-sorting-set", "official_cdn"), imageOwnerCanonicalKey: "lr-mini-farmstand-sorting-set", sku: "LER6822", officialProductName: "Mini Farmstand Sorting Set" },
  "lr-peekaboo-learning-farm": { ...remote("https://www.learningresources.com/media/catalog/product/4/5/454e6cbc33d002b41cf9b1ca1ed488226f1df01b.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=265&width=265&canvas=265:265", "https://www.learningresources.com/item-peekaboo-learning-farm", "official_cdn"), imageOwnerCanonicalKey: "lr-peekaboo-learning-farm", officialProductName: "Peekaboo Learning Farm" },
  ...BATCH1_OFFICIAL_IMAGE_ASSETS,
  ...BATCH2_OFFICIAL_IMAGE_ASSETS,
  ...BATCH3_OFFICIAL_IMAGE_ASSETS,
  ...BATCH4_OFFICIAL_IMAGE_ASSETS,
  ...BATCH5_OFFICIAL_IMAGE_ASSETS,
  ...BATCH6_OFFICIAL_IMAGE_ASSETS,
  ...BATCH7_OFFICIAL_IMAGE_ASSETS,
  ...BATCH8_OFFICIAL_IMAGE_ASSETS,
  ...BATCH9_OFFICIAL_IMAGE_ASSETS,
  ...BATCH10_OFFICIAL_IMAGE_ASSETS,
  ...BATCH11_OFFICIAL_IMAGE_ASSETS,
  ...BATCH12_OFFICIAL_IMAGE_ASSETS,
  ...BATCH13_OFFICIAL_IMAGE_ASSETS,
  ...HAPE_PRIORITY_BATCH1_IMAGE_ASSETS,
  ...HAPE_PRIORITY_BATCH2_IMAGE_ASSETS,
  ...HAPE_FINAL_RESOLUTION_IMAGE_ASSETS,
  ...IMAGE_EXPANSION_QA9_ASSETS,
  // The former official VTech image endpoint is protected by an anti-bot
  // redirect loop on mobile browsers.  Keep the exact 80-574100 identity but
  // ship the independently MIME-verified retailer image with the artifact.
  "vtech-busy-learners-music-activity-cube": { ...packaged("catalog-assets/vtech-busy-learners-music-activity-cube-80-574100.jpg", "https://www.walmart.com/ip/14710012504", "authorized_retailer_exact_sku", "image/jpeg", "sha256:383931a359dca748e531e8ec6f9a88e45d9db8eebb1f4c64d7dbe2d08920d79e"), imageOwnerCanonicalKey: "vtech-busy-learners-music-activity-cube", sku: "80-574100", officialProductName: "VTech Baby Busy Learners Music Activity Cube", sourceImageUrl: "https://i5.walmartimages.com/seo/VTech-Baby-Busy-Learners-Music-Activity-Cube-Green_ddaab418-2598-452d-b8cc-696548517c75.0af9cd134c98f4e52566f2cf052e5e8b.jpeg", sourceImageMime: "image/jpeg" }
});
function catalogImageAsset(key) {
  const canonical = String(key || "").toLowerCase();
  return CATALOG_IMAGE_ASSETS[canonical] || CATALOG_IMAGE_ASSETS[canonical.replace(/-puzzle-(\d+)$/i, ":puzzle-$1")] || null;
}

// src/data/hape-final-resolution-review.js
var HAPE_FINAL_RESOLUTION_REVIEW = Object.freeze([
  Object.freeze({ canonicalKey: "hape-shape-sorter", status: "identity_hold", reason: "Multiple official products (E0516, E0407, E0364, E0515) fit the generic stored name; no row-level SKU or structural evidence." }),
  Object.freeze({ canonicalKey: "hape-wooden-shape-sorter", status: "identity_hold", reason: "Multiple official products (E0516, E0407, E0364, E0515) fit the generic stored name; no row-level SKU or structural evidence." }),
  Object.freeze({ canonicalKey: "hape-all-seasons-dollhouse", status: "unresolved_variant", reason: "The unqualified legacy name cannot be proven to be the furnished E3401B record or a distinct historical configuration." }),
  Object.freeze({ canonicalKey: "hape-balance-bike", status: "source_hold", reason: "The stored identity has no colour/variant; official E0104 green and E0105 pink are distinct products." }),
  Object.freeze({ canonicalKey: "hape-double-sandwich-making-set", status: "catalog_identity_review_required", reason: "No exact Hape SKU, official product page, or stable exact-product retailer evidence was found; same-name results point to other brands." }),
  Object.freeze({ canonicalKey: "hape-farm-activity-cube", status: "catalog_identity_review_required", reason: "No exact Hape SKU or official product page was found; exact-name results point to other brands." }),
  Object.freeze({ canonicalKey: "hape-learn-to-play-piano", status: "source_hold", reason: "The stored identity has no colour/SKU; E0627 black and E0628 red are distinct variants." })
]);
var HIDDEN_FROM_PUBLIC_CATALOG = /* @__PURE__ */ new Set(["identity_hold", "unresolved_variant", "catalog_identity_review_required"]);
var REVIEW_BY_KEY = new Map(HAPE_FINAL_RESOLUTION_REVIEW.map((row) => [row.canonicalKey, row]));
function catalogReviewMetadata(key) {
  return REVIEW_BY_KEY.get(String(key || "").trim().toLowerCase()) || null;
}
function isPublicCatalogVisible(toy) {
  return !HIDDEN_FROM_PUBLIC_CATALOG.has(catalogReviewMetadata(toy?.canonicalKey)?.status);
}

// src/domain/catalog-repository.js
var CatalogRepository = class {
  #base = [];
  #remote = [];
  #serverEdits = {};
  #active = [];
  #byKey = /* @__PURE__ */ new Map();
  #mergedInto = /* @__PURE__ */ new Map();
  #childByParentPart = /* @__PURE__ */ new Map();
  #store;
  constructor(store2, { baseUrl = "" } = {}) {
    this.#store = store2;
    this.baseUrl = String(baseUrl || "").replace(/\/$/, "");
  }
  async hydrate({ onStage = () => {
  } } = {}) {
    onStage("catalog_static_load_start");
    const [remote2, base, candidates] = await Promise.all([
      fetchJson("./catalog-remote.json"),
      fetchJson("./catalog-base.json"),
      fetchJson("./catalog-candidates.json")
    ]);
    this.#remote = entries(remote2);
    this.applyBase([...entries(base), ...entries(candidates)]);
    onStage("catalog_static_load_end", { activeCatalogCount: this.#active.length });
    if (this.baseUrl) void this.#hydrateServer(onStage);
    return this.#active;
  }
  async #hydrateServer(onStage) {
    try {
      onStage("remote_catalog_request_start");
      const [learned, overrides] = await Promise.all([
        fetchJson(`${this.baseUrl}/learned-catalog`, { timeoutMs: 4500 }),
        fetchJson(`${this.baseUrl}/catalog-overrides`, { timeoutMs: 4500 })
      ]);
      this.#remote = [...this.#remote, ...entries(learned)];
      this.#serverEdits = overrides?.overrides || {};
      this.#rebuild();
      this.ensureSetChildren();
      onStage("remote_catalog_request_end", { activeCatalogCount: this.#active.length });
    } catch {
      onStage("remote_catalog_request_end", { status: "unavailable" });
    }
  }
  get active() {
    return this.#active;
  }
  getByKey(key) {
    const requested = canonicalKey(key);
    return this.#byKey.get(requested) || this.#byKey.get(this.#mergedInto.get(requested)) || null;
  }
  reviewMetadata(reference) {
    return catalogReviewMetadata(typeof reference === "string" ? reference : reference?.canonicalKey);
  }
  resolve(reference) {
    for (const key of [reference?.canonicalKey, reference?.catalogKey, reference?.catalogId, ...reference?.legacyCanonicalKeys || []]) {
      const match = this.getByKey(key);
      if (match && safeExplicitCatalogMatch(reference, match, key)) return match;
    }
    const parent = canonicalKey(reference?.set?.parentCanonicalKey || reference?.parentCanonicalKey);
    const part = childPartIndex(reference);
    if (parent && part > 0) {
      const match = this.#childByParentPart.get(`${parent}|${part}`);
      if (match) return match;
    }
    return resolveCatalogReference(reference, this.#active);
  }
  // Recognition is an input to the same Catalog identity layer as every other
  // entry point.  This method classifies only with the existing identity
  // engine; it never imports substitution or recommendation scores.
  resolveRecognition(reference = {}) {
    const exact = this.resolve(reference);
    if (exact) return { kind: "catalog_match", catalog: exact };
    const requestedKey = canonicalKey(reference.canonicalKey || reference.catalogKey || `${reference.brand || ""}-${reference.productName || reference.name || ""}`);
    const tombstone = this.#store.state.catalogState?.tombstones?.[requestedKey];
    if (tombstone && !tombstone.mergedInto) return { kind: "tombstoned", canonicalKey: requestedKey, tombstone };
    const conflicts = this.#active.map((candidate) => compare(reference, candidate)).filter((match) => match.kind === "strong_probable_duplicate");
    if (conflicts.length) return { kind: "duplicate_review_required", conflicts };
    return { kind: "genuinely_new", canonicalKey: requestedKey };
  }
  registerLearnedCandidate(input = {}, { candidateImageRef = null, provenance = "ai_recognition" } = {}) {
    const decision = this.resolveRecognition(input);
    if (decision.kind === "catalog_match") return { created: false, catalog: decision.catalog, decision };
    if (decision.kind !== "genuinely_new") return { created: false, catalog: null, decision };
    const row = normalizeCatalogToy({
      ...input,
      id: decision.canonicalKey,
      canonicalKey: decision.canonicalKey,
      imageRef: { kind: "placeholder" },
      candidateImageRef,
      source: "learned",
      reviewStatus: "pending",
      provenance,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    let catalog2 = row;
    this.#store.update((state) => {
      state.catalogState ||= { tombstones: {}, adminEdits: {}, imageRefsByKey: {}, imageRefsByIdentity: {}, learnedEntries: [], syncMetadata: {} };
      state.catalogState.learnedEntries ||= [];
      const existing = state.catalogState.learnedEntries.find((item) => sameCatalogIdentity(item, row));
      if (existing) {
        catalog2 = normalizeCatalogToy(existing);
        return;
      }
      state.catalogState.learnedEntries.push(row);
    }, "catalog-learned-create");
    this.#rebuild();
    return { created: catalog2 === row, catalog: this.resolve(catalog2) || catalog2, decision };
  }
  pendingLearned() {
    return this.#active.filter((item) => item.source === "learned" && item.reviewStatus === "pending");
  }
  // Learned candidates live in the one active catalog. Approval is an admin
  // state transition on that same record, not an AI-specific second catalog.
  approveLearnedCandidate(key) {
    const canonical = canonicalKey(key);
    let approved = null;
    this.#store.update((state) => {
      state.catalogState ||= { tombstones: {}, adminEdits: {}, imageRefsByKey: {}, imageRefsByIdentity: {}, learnedEntries: [], syncMetadata: {} };
      const entry = (state.catalogState.learnedEntries || []).find((item) => canonicalKey(item.canonicalKey) === canonical);
      if (!entry) return;
      entry.reviewStatus = "approved";
      state.catalogState.adminEdits[canonical] = { ...state.catalogState.adminEdits[canonical] || {}, reviewStatus: "approved" };
      approved = entry;
    }, "catalog-learned-approve");
    this.#rebuild();
    return approved ? this.resolve(approved) : null;
  }
  search({ query = "", brand = "", categoryCode: categoryCode2 = "", skillCode: skillCode2 = "", playMechanic = "", includeReview = true } = {}) {
    const text2 = String(query).trim().toLowerCase();
    const rows = text2 ? this.#active.flatMap((parent) => [parent, ...(parent.children || []).map((child, index) => catalogChildPresentation(parent, child, index))]) : this.#active;
    return rows.filter((toy) => (includeReview || isPublicCatalogVisible(toy)) && (!brand || toy.brand === brand) && (!categoryCode2 || toy.categoryCode === categoryCode2) && (!skillCode2 || toy.skillCodes.includes(skillCode2)) && (!playMechanic || toy.playMechanics.includes(playMechanic)) && (!text2 || [toy.brand, toy.productName, ...toy.aliases].join(" ").toLowerCase().includes(text2)));
  }
  getPublicVisibleCatalogCount() {
    return this.#active.filter(isPublicCatalogVisible).length;
  }
  catalogCountSnapshot() {
    const state = this.#store.state.catalogState || {};
    const localLearned = entries(state.learnedEntries), localRemote = entries(state.remoteEntries);
    const sources = [...this.#base, ...this.#remote, ...localLearned, ...localRemote];
    const key = (value) => canonicalKey(value?.canonicalKey || value?.id);
    const counts = /* @__PURE__ */ new Map();
    for (const row of sources) {
      const value = key(row);
      if (value) counts.set(value, (counts.get(value) || 0) + 1);
    }
    const bundledIds = new Set([...this.#base, ...this.#remote].map(key).filter(Boolean));
    return {
      raw: { base: this.#base.length, remote: this.#remote.length, localLearned: localLearned.length, localRemote: localRemote.length, total: sources.length },
      localAdditions: localLearned.length + localRemote.length,
      adminEdits: Object.keys(state.adminEdits || {}).length,
      tombstoneCount: Object.values(state.tombstones || {}).filter((record) => record && !record.mergedInto).length,
      mergedRaw: sources.length,
      canonicalDeduped: counts.size,
      active: this.#active.length,
      publicVisible: this.getPublicVisibleCatalogCount(),
      remoteIds: [...new Set(this.#remote.map(key).filter(Boolean))].sort(),
      localOnlyIds: [...new Set([...localLearned, ...localRemote].map(key).filter((value) => value && !bundledIds.has(value)))].sort(),
      collisionSummary: { canonicalKeyCollisions: [...counts.entries()].filter(([, count4]) => count4 > 1).map(([canonicalKey2, count4]) => ({ canonicalKey: canonicalKey2, count: count4 })).sort((a, b) => a.canonicalKey.localeCompare(b.canonicalKey)), total: [...counts.values()].filter((count4) => count4 > 1).length }
    };
  }
  applyRemote(entriesValue) {
    this.#remote = entries(entriesValue);
    this.#rebuild();
    this.ensureSetChildren();
  }
  applyBase(entriesValue) {
    this.#base = entries(entriesValue);
    this.#rebuild();
    this.ensureSetChildren();
  }
  applyServerEdits(value) {
    this.#serverEdits = value?.overrides || value || {};
    this.#rebuild();
    this.ensureSetChildren();
  }
  refresh() {
    this.#rebuild();
  }
  deleteStandardToy(key) {
    const canonical = canonicalKey(key);
    if (!canonical) return;
    this.#store.update((state) => {
      state.catalogState.tombstones[canonical] = { deletedAt: (/* @__PURE__ */ new Date()).toISOString() };
    }, "catalog-delete");
    this.#rebuild();
  }
  updateAdminEdit(key, patch) {
    const canonical = canonicalKey(key);
    this.#store.update((state) => {
      state.catalogState.adminEdits[canonical] = { ...state.catalogState.adminEdits[canonical] || {}, ...patch };
    }, "catalog-edit");
    this.#rebuild();
  }
  mergeReferences(key, targetKey) {
    const from = canonicalKey(key), to = canonicalKey(targetKey);
    if (!from || !to || from === to) return;
    const source = this.#byKey.get(from), target = this.#byKey.get(to);
    this.#store.update((state) => {
      redirectCrossAgeApproval(state, from, to);
      for (const toy of state.toys || []) if (canonicalKey(toy.canonicalKey) === from) {
        toy.canonicalKey = to;
        toy.legacyCanonicalKeys = [.../* @__PURE__ */ new Set([...toy.legacyCanonicalKeys || [], from])];
      }
      for (const item of state.wishlist || []) if (canonicalKey(item.canonicalKey) === from) {
        item.canonicalKey = to;
        item.catalogId = to;
        if (item.catalogSnapshot) {
          item.catalogSnapshot.canonicalKey = to;
          item.catalogSnapshot.legacyCanonicalKeys = [.../* @__PURE__ */ new Set([...item.catalogSnapshot.legacyCanonicalKeys || [], from])];
        }
      }
      for (const round of state.rotationHistory || []) if (canonicalKey(round.canonicalKey || round.catalogKey) === from) {
        round.canonicalKey = to;
        round.catalogKey = to;
      }
      state.catalogState.learnedEntries = (state.catalogState.learnedEntries || []).filter((item) => canonicalKey(item.canonicalKey) !== from);
      const sourceImage = state.catalogState.imageRefsByKey?.[from];
      state.catalogState.adminEdits[to] = { ...state.catalogState.adminEdits[to] || {}, aliases: [...new Set([...target?.aliases || [], ...source?.aliases || [], source?.productName, source?.names?.zh, key].filter(Boolean))], legacyCanonicalKeys: [.../* @__PURE__ */ new Set([...target?.legacyCanonicalKeys || [], ...state.catalogState.adminEdits[to]?.legacyCanonicalKeys || [], from])], alternateImageRefs: [...new Set([...target?.alternateImageRefs || [], ...source?.alternateImageRefs || [], source?.imageRef, sourceImage].filter(Boolean).map((value) => JSON.stringify(value)))].map((value) => JSON.parse(value)) };
      if (state.catalogState.imageRefsByKey?.[from]) delete state.catalogState.imageRefsByKey[from];
      state.catalogState.tombstones[from] = { deletedAt: (/* @__PURE__ */ new Date()).toISOString(), mergedInto: to };
    }, "catalog-merge");
    this.#rebuild();
  }
  ensureSetChildren() {
    if (!(this.#store.state.toys || []).some((toy) => toy.set?.kind === "parent" || toy.set?.kind === "child" || (toy.set?.legacyParentIds || []).length)) return;
    const definitions = new Map(this.#active.map((toy) => [toy.canonicalKey, toy]));
    this.#store.update((state) => {
      state.toys ||= [];
      const qa6CanonicalRepair = repairQa6MideerCanonicalState(state, definitions);
      const knownMideerLegacyBackfill = backfillKnownMideerLegacySixSlot(state, definitions);
      const orphanLifecycle = reconcileOrphanedSplitOwnership(state, definitions);
      const repair = restoreMissingSplitSetChildren(state, definitions, legacyToyRows());
      const result2 = reconcileSplitSetChildren(state, definitions);
      const ownership = establishParentChildOwnership(state);
      const imageProvenance = repairChildImageProvenance(state);
      const legacyChildImageBindings = repairLegacyChildImageBindings(state, this);
      state.catalogState.syncMetadata ||= {};
      const pending = (result2.residualDuplicateChildren || 0) > 0;
      state.catalogState.syncMetadata.parentChildReconciliationV12 = { reconciledAt: (/* @__PURE__ */ new Date()).toISOString(), pending, executionRequired: pending, ...result2, remainingCandidates: result2.residualDuplicateChildren || 0 };
      state.catalogState.syncMetadata.parentChildDataRepair = { repairedAt: (/* @__PURE__ */ new Date()).toISOString(), ...repair };
      state.catalogState.syncMetadata.parentChildIntegrityV12 = { repairedAt: (/* @__PURE__ */ new Date()).toISOString(), ...ownership, ...imageProvenance, orphanLifecycle, legacyChildImageBindings, knownMideerLegacyBackfill, qa6CanonicalRepair };
    }, "set-child-migration");
  }
  repairSetStructure() {
    this.ensureSetChildren();
    return this.#store.state.catalogState?.syncMetadata?.parentChildReconciliationV12 || null;
  }
  #rebuild() {
    const { tombstones = {}, adminEdits = {}, imageRefsByKey = {}, imageRefsByIdentity = {}, learnedEntries = [], remoteEntries = [] } = this.#store.state.catalogState;
    const merged = /* @__PURE__ */ new Map();
    const allRows = [...this.#base, ...this.#remote, ...entries(learnedEntries), ...entries(remoteEntries)];
    const tombstonedIdentities = new Set(allRows.map(normalizeCatalogToy).filter((toy) => {
      const key = qa6CatalogCanonical(canonicalKey(toy.canonicalKey));
      const record = tombstones[key];
      return record && !record.mergedInto && !qa6ResurrectionWins(key, toy, {}, record);
    }).map(exactProductIdentityKey).filter(Boolean));
    for (const raw of allRows) {
      const toy = normalizeCatalogToy(raw);
      const originalKey = canonicalKey(toy.canonicalKey);
      const key = qa6CatalogCanonical(originalKey);
      const previous = merged.get(key);
      const redirected = key !== originalKey;
      const combined = previous ? normalizeCatalogToy({ ...previous, ...toy, canonicalKey: key, aliases: [...previous.aliases || [], ...toy.aliases || []], legacyCanonicalKeys: [...previous.legacyCanonicalKeys || [], ...toy.legacyCanonicalKeys || [], ...redirected ? [originalKey] : []], names: { ...previous.names, ...toy.names }, children: toy.children?.length ? toy.children : previous.children, userMetadata: { ...previous.userMetadata, ...toy.userMetadata, safety: toy.userMetadata?.safety?.ageSafetyStatus ? toy.userMetadata.safety : previous.userMetadata?.safety } }) : normalizeCatalogToy({ ...toy, canonicalKey: key, legacyCanonicalKeys: [...toy.legacyCanonicalKeys || [], ...redirected ? [originalKey] : []] });
      const serverEdit = this.#serverEdits[key] || {};
      const resurrected = qa6ResurrectionWins(key, combined, serverEdit, tombstones[key]);
      if (!key || tombstones[key] && !tombstones[key].mergedInto && !resurrected || (serverEdit.hidden === true || serverEdit.deleted === true) && !resurrected) continue;
      const serverToy = normalizeCatalogToy({ ...combined, ...serverEdit, productName: serverEdit.productName || serverEdit.name || combined.productName, names: { ...combined.names, en: serverEdit.nameEn || serverEdit.name || combined.names?.en, zh: serverEdit.nameZh || combined.names?.zh } });
      const legacyImage = imageRefsByKey[key] || imageRefsByIdentity[catalogIdentity(serverToy)];
      const asset = catalogImageAsset(key);
      const edited = normalizeCatalogToy({ ...serverToy, ...asset ? { imageRef: asset } : {}, ...legacyImage ? { imageRef: legacyImage } : {}, ...adminEdits[key] || {} });
      merged.set(key, { ...edited, playMechanics: deriveCatalogMechanics(edited), imageRef: catalogImageRef(edited) });
    }
    this.#mergedInto = new Map(Object.entries(tombstones).filter(([, record]) => record?.mergedInto).map(([from, record]) => [canonicalKey(from), canonicalKey(record.mergedInto)]));
    for (const [from, to] of this.#mergedInto) if (merged.has(to)) {
      const target = merged.get(to);
      merged.set(to, normalizeCatalogToy({ ...target, legacyCanonicalKeys: [...target.legacyCanonicalKeys || [], from] }));
    }
    this.#active = consolidateCatalog([...merged.values()].filter((toy) => !tombstonedIdentities.has(exactProductIdentityKey(toy)))).sort(catalogSort);
    this.#byKey = /* @__PURE__ */ new Map();
    this.#childByParentPart = /* @__PURE__ */ new Map();
    for (const toy of this.#active) for (const key of [toy.canonicalKey, ...toy.legacyCanonicalKeys || []]) this.#byKey.set(canonicalKey(key), toy);
    for (const parent of this.#active) {
      for (const [index, rawChild] of (parent.children || []).entries()) {
        const child = catalogChildPresentation(parent, rawChild, index);
        for (const key of [child.canonicalKey, ...child.legacyCanonicalKeys || []]) if (!this.#byKey.has(canonicalKey(key))) this.#byKey.set(canonicalKey(key), child);
        const parentKey = canonicalKey(child.set?.parentCanonicalKey);
        const part = childPartIndex(child);
        if (parentKey && part > 0 && !this.#childByParentPart.has(`${parentKey}|${part}`)) this.#childByParentPart.set(`${parentKey}|${part}`, child);
      }
    }
  }
};
function catalogChildPresentation(parent, rawChild = {}, index = 0) {
  const source = {
    ...rawChild,
    canonicalKey: rawChild.canonicalKey || rawChild.key || `${parent.canonicalKey}:part-${index + 1}`,
    brand: rawChild.brand || parent.brand,
    minAgeMonths: rawChild.minAgeMonths ?? parent.minAgeMonths,
    maxAgeMonths: rawChild.maxAgeMonths ?? parent.maxAgeMonths,
    set: { ...rawChild.set || {}, kind: "child", parentCanonicalKey: parent.canonicalKey, partIndex: rawChild.set?.partIndex || index + 1, rotationMode: "split" }
  };
  let child = normalizeCatalogToy(source);
  if (child.imageRef?.kind === "catalog") child = normalizeCatalogToy({ ...child, imageRef: { ...child.imageRef, imageOwnerCanonicalKey: child.canonicalKey } });
  if (!validateChildImageProvenance(child, parent).accepted) child = normalizeCatalogToy({ ...source, imageRef: { kind: "placeholder" } });
  const asset = catalogImageAsset(child.canonicalKey);
  if (asset) child = normalizeCatalogToy({ ...child, imageRef: { ...asset, imageOwnerCanonicalKey: child.canonicalKey } });
  return { ...child, imageRef: catalogImageRef(child) };
}
function childPartIndex(value) {
  const explicit = Number(value?.set?.partIndex ?? value?.partIndex);
  if (Number.isInteger(explicit) && explicit > 0) return explicit;
  const match = String(value?.canonicalKey || value?.catalogKey || "").match(/(?:-|:)(?:part-?)?(\d+)$/i);
  return Number(match?.[1] || 0);
}
function safeExplicitCatalogMatch(reference, match, requestedKey) {
  if (match?.set?.kind !== "child" || reference?.set?.kind !== "child") return true;
  const referenceParent = canonicalKey(reference.set?.parentCanonicalKey || reference.parentCanonicalKey);
  const matchParent = canonicalKey(match.set?.parentCanonicalKey);
  const referencePart = childPartIndex(reference);
  const matchPart = childPartIndex(match);
  if (referenceParent && referencePart > 0) return referenceParent === matchParent && referencePart === matchPart;
  return canonicalKey(requestedKey) === canonicalKey(match.canonicalKey) || (match.legacyCanonicalKeys || []).some((key) => canonicalKey(key) === canonicalKey(requestedKey));
}
function legacyToyRows() {
  if (typeof localStorage === "undefined") return [];
  for (const key of ["toyRotationV04", "toyRotationV032", "toyRotationV03", "toyRotationV02"]) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      if (Array.isArray(value?.toys)) return value.toys;
    } catch {
    }
  }
  return [];
}
async function fetchJson(url, { timeoutMs = 4500 } = {}) {
  const controller = typeof AbortController === "undefined" ? null : new AbortController();
  const timeout = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const response = await fetch(url, { cache: "no-cache", signal: controller?.signal });
    return response.ok ? response.json() : [];
  } catch {
    return [];
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
function entries(value) {
  return Array.isArray(value) ? value : Array.isArray(value?.entries) ? value.entries : Array.isArray(value?.catalog) ? value.catalog : Array.isArray(value?.items) ? value.items : [];
}
var QA6_MIDEER_DINOSAUR_PARENT = "mideer-my-first-puzzle-dinosaurs-6in1-md1460";
var QA6_MIDEER_CANONICAL_REDIRECTS = /* @__PURE__ */ new Map([
  ["mideer-my-first-puzzle-dinosaurs-6in1", QA6_MIDEER_DINOSAUR_PARENT],
  ["mideer-first-artist-cute-dinosaurs", QA6_MIDEER_DINOSAUR_PARENT]
]);
var QA6_RESURRECTED_CATALOG_KEYS = /* @__PURE__ */ new Set([
  "mideer-level1-home-sweet-home-puzzle",
  "mideer-animal-toys-set-15pcs"
]);
function qa6CatalogCanonical(key) {
  return QA6_MIDEER_CANONICAL_REDIRECTS.get(key) || key;
}
function qa6ResurrectedCatalogKey(key) {
  return QA6_RESURRECTED_CATALOG_KEYS.has(key);
}
function qa6ResurrectionWins(key, base, remote2 = {}, tombstone = null) {
  if (!qa6ResurrectedCatalogKey(key) || base?.resurrectionVersion !== "qa6-catalog-resurrection-v1") return false;
  const remoteAt = Date.parse(remote2.updatedAt || remote2.deletedAt || 0) || 0;
  const tombstoneAt = Date.parse(tombstone?.deletedAt || tombstone?.updatedAt || 0) || 0;
  const repairAt = Date.parse("2026-09-17T00:00:00.000Z");
  return Math.max(remoteAt, tombstoneAt) < repairAt;
}
function catalogIdentity(toy) {
  return `${String(toy.brand === "other_unspecified" ? "" : toy.brand || "").trim().toLowerCase()}|${String(toy.productName || toy.names?.en || "").normalize("NFKC").trim().toLowerCase()}`;
}
function catalogSort(a, b) {
  const brand = a.brand.localeCompare(b.brand);
  if (brand) return brand;
  if (a.brand === "Lovevery") return Number(a.catalogSortOrder || 999999) - Number(b.catalogSortOrder || 999999) || Number(a.minAgeMonths || 0) - Number(b.minAgeMonths || 0) || a.productName.localeCompare(b.productName);
  return a.productName.localeCompare(b.productName);
}
function consolidateCatalog(rows) {
  const groups = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const identity = exactProductIdentityKey(row) || `key:${row.canonicalKey}`;
    if (!groups.has(identity)) groups.set(identity, []);
    groups.get(identity).push(row);
  }
  return [...groups.values()].map((group) => {
    if (group.length === 1) return group[0];
    const preferred = [...group].sort((a, b) => catalogRichness(b) - catalogRichness(a))[0];
    return normalizeCatalogToy({ ...preferred, aliases: [...new Set(group.flatMap((item) => [...item.aliases || [], item.productName, item.names?.zh]).filter(Boolean))], legacyCanonicalKeys: [...new Set(group.flatMap((item) => [item.canonicalKey, ...item.legacyCanonicalKeys || []]).filter((key) => canonicalKey(key) !== canonicalKey(preferred.canonicalKey)))], children: group.sort((a, b) => (b.children?.length || 0) - (a.children?.length || 0))[0].children, alternateImageRefs: [...new Map(group.flatMap((item) => [item.imageRef, ...item.alternateImageRefs || []]).filter(Boolean).map((ref) => [JSON.stringify(ref), ref])).values()] });
  });
}
function catalogRichness(toy) {
  return (toy.children?.length || 0) * 20 + (toy.imageRef?.kind === "catalog" ? 15 : toy.imageRef?.kind === "remote" ? 5 : 0) + (toy.aliases?.length || 0) + (toy.names?.zh ? 3 : 0);
}

// src/domain/library-service.js
function setToyInterest(store2, toyId, value) {
  store2.update((state) => {
    const toy = state.toys.find((item) => item.id === toyId);
    if (toy) toy.interest = toy.interest === value ? null : value;
  }, "interest");
}
function createCatalogOwnership(store2, source, imageRef, { reason: reason2 = "catalog-add" } = {}) {
  const existing = findOwnedToy(source, store2.state.toys || []);
  if (existing) return { added: false, toy: existing, reason: "already_owned" };
  const toy = normalizeToy({ ...source, imageRef: imageRef || source.imageRef });
  let result2 = toy;
  store2.update((state) => {
    const concurrent = findOwnedToy(source, state.toys || []);
    if (concurrent) {
      result2 = concurrent;
      return;
    }
    state.toys.push(toy);
  }, reason2);
  return { added: result2 === toy, toy: result2, reason: result2 === toy ? "created" : "already_owned" };
}
function addCatalogToy(store2, source, imageRef) {
  return createCatalogOwnership(store2, source, imageRef, { reason: "catalog-add" });
}
function parentDeleteImpact(toys = [], parent) {
  return {
    generated: linkedChildrenForParent(toys, parent),
    independent: independentChildrenForParent(toys, parent)
  };
}
function deleteToyOwnership(store2, toyId, { parentMode = "cascade_generated" } = {}) {
  const target = store2.state.toys.find((item) => item.id === toyId);
  if (!target) return { removed: [], preserved: [], target: null };
  let result2 = { removed: [], preserved: [], target };
  store2.update((state) => {
    const toy = state.toys.find((item) => item.id === toyId);
    if (!toy) return;
    if (toy.set?.kind !== "parent") {
      if (toy.set?.kind === "child") markChildIntentionallyRemoved(state.toys, toy);
      state.toys = state.toys.filter((item) => item.id !== toy.id);
      preserveDeletedReferences2(state, [toy.id]);
      result2 = { removed: [toy], preserved: [], target: toy };
      return;
    }
    const impact = parentDeleteImpact(state.toys, toy);
    const cascade = parentMode === "cascade_generated";
    const removed = cascade ? [toy, ...impact.generated] : [toy];
    const removeIds = new Set(removed.map((item) => item.id));
    const preserved = [...impact.generated, ...impact.independent].filter((item) => !removeIds.has(item.id));
    for (const child of preserved) detachChildFromParent(child, toy);
    state.toys = state.toys.filter((item) => !removeIds.has(item.id));
    archiveRemovedOwnerships2(state, removed, "parent_delete_cascade");
    preserveDeletedReferences2(state, [...removeIds]);
    result2 = { removed, preserved, target: toy, impact };
  }, "toy-delete-ownership");
  return result2;
}
function markChildIntentionallyRemoved(toys, child) {
  const parent = toys.find((item) => item.id === child.set.parentId);
  if (!parent?.set || parent.set.kind !== "parent") return;
  const key = child.canonicalKey;
  parent.set.intentionalRemovedChildKeys = [.../* @__PURE__ */ new Set([...parent.set.intentionalRemovedChildKeys || [], key])];
  parent.set.childIds = (parent.set.childIds || []).filter((id) => id !== child.id);
}
function detachChildFromParent(child, parent) {
  const source = child.set?.ownershipSource === "independent" || child.purchaseDate || Object.keys(child.purchaseMetadata || {}).length || child.userMetadata?.independentOwnership === true ? "independent" : "detached_from_set";
  child.set = { ...child.set, kind: "none", parentId: null, parentCanonicalKey: null, legacyParentIds: [...child.set?.legacyParentIds || [], parent.id], setName: "", partIndex: null, childIds: [], rotationMode: "whole", ownershipSource: source, generatedFromParentId: null, ownershipGroupId: null, detachedFromSet: true, detachedFromParentOwnershipId: parent.id, detachedAt: (/* @__PURE__ */ new Date()).toISOString() };
}
function archiveRemovedOwnerships2(state, toys, reason2) {
  state.catalogState ||= {};
  state.catalogState.removedOwnerships ||= {};
  for (const toy of toys) {
    if (state.catalogState.removedOwnerships[toy.id]) continue;
    state.catalogState.removedOwnerships[toy.id] = {
      removedAt: (/* @__PURE__ */ new Date()).toISOString(),
      reason: reason2,
      canonicalKey: toy.canonicalKey,
      parentCanonicalKey: toy.set?.parentCanonicalKey || null,
      ownership: { ...toy.set },
      preservedUserData: { interest: toy.interest, shelfMode: toy.shelfMode, purchaseDate: toy.purchaseDate, purchaseMetadata: toy.purchaseMetadata, notes: toy.notes, userMetadata: toy.userMetadata, imageRef: toy.imageRef }
    };
  }
}
function preserveDeletedReferences2(state, ids) {
  const deleted = new Set(ids);
  for (const round of state.rotationHistory || []) {
    const missing = (round.toyIds || []).filter((id) => deleted.has(id));
    if (missing.length) {
      round.toyIds = (round.toyIds || []).filter((id) => !deleted.has(id));
      round.historicalMissingToyIds = [.../* @__PURE__ */ new Set([...round.historicalMissingToyIds || [], ...missing])];
    }
    if (deleted.has(round.toyId)) {
      round.historicalMissingToyIds = [.../* @__PURE__ */ new Set([...round.historicalMissingToyIds || [], round.toyId])];
      delete round.toyId;
    }
  }
}

// src/domain/development-fit.js
var GENERIC = /* @__PURE__ */ new Set(["construction_general", "pretend_play_general", "sensory_general"]);
var DEVELOPMENT_ABILITY_GROUPS = Object.freeze([
  { key: "thinking", mechanisms: ["puzzle", "matching_sorting", "shape_sorting", "counting_quantity", "color_pattern"] },
  { key: "hands", mechanisms: ["blocks_build", "screw_bolt_tool", "threading_lacing", "lock_key", "magnetic_build", "fine_motor_general"] },
  { key: "exploration", mechanisms: ["cause_effect", "pretend_role", "music_play", "balance"] }
]);
var PROFILE_ALIASES = Object.freeze({ jigsaw: "puzzle", maze_logic: "puzzle", matching: "matching_sorting", stacking: "blocks_build", stack_balance: "balance", magnetic_fishing: "magnetic_build", marble_track: "cause_effect", ball_drop: "cause_effect", posting: "cause_effect", "cause effect": "cause_effect", "key lock": "lock_key", fine_motor: "fine_motor_general", "interlocking blocks": "blocks_build", cooking_serving: "pretend_role", care_doll: "pretend_role", repair_build_role: "pretend_role", ride_balance: "balance", pull_push_walk: "balance", throw_catch_ball: "balance" });
function abilityMechanismKey(mechanic) {
  return PROFILE_ALIASES[mechanic] || mechanic;
}
function profileEntry(profile, mechanic) {
  return profile[mechanic] || Object.entries(profile).find(([key]) => abilityMechanismKey(key) === mechanic)?.[1] || null;
}
var BASE_LEVEL = {
  posting: 1,
  shape_sorting: 2,
  puzzle: 2,
  matching_sorting: 2,
  stacking: 1,
  threading_lacing: 3,
  lock_key: 3,
  screw_bolt_tool: 3,
  ball_drop: 1,
  blocks_build: 2,
  magnetic_build: 3,
  pretend_role: 2,
  vehicles_tracks: 2,
  pull_push_walk: 1,
  magnetic_fishing: 3,
  maze_logic: 4,
  jigsaw: 3,
  balance: 3,
  stack_balance: 3,
  marble_track: 2,
  cause_effect: 2,
  music_play: 1,
  sensory: 1,
  fine_motor_general: 2,
  counting_quantity: 3,
  color_pattern: 2
};
function developmentMechanics(toy = {}) {
  const explicit = unique(toy.playMechanics || []).filter((mechanic) => !GENERIC.has(mechanic));
  const text2 = [toy.productName, toy.names?.en, toy.names?.zh, ...toy.aliases || []].filter(Boolean).join(" ").toLowerCase();
  const cognitiveSignals = [];
  if (/count|number|quantity|数字|数量|计数/.test(text2)) cognitiveSignals.push("counting_quantity");
  if (/color|colour|pattern|颜色|图案|规律/.test(text2)) cognitiveSignals.push("color_pattern");
  if (explicit.length) return unique([...explicit, ...cognitiveSignals]);
  const inferred = [];
  if (/shape|形状|sort|分类/.test(text2)) inferred.push("shape_sorting");
  if (/post|drop|投放|球.*落/.test(text2)) inferred.push("posting");
  if (/puzzle|拼图/.test(text2)) inferred.push("puzzle");
  if (/match|配对/.test(text2)) inferred.push("matching_sorting");
  if (/stack|叠|tower/.test(text2)) inferred.push("stacking");
  if (/thread|lace|串|穿线/.test(text2)) inferred.push("threading_lacing");
  if (/lock|key|锁|钥匙/.test(text2)) inferred.push("lock_key");
  if (/screw|tool|螺丝|工具/.test(text2)) inferred.push("screw_bolt_tool");
  if (/track|rail|vehicle|车|轨道/.test(text2)) inferred.push("track_vehicle");
  if (/block|build|积木|建构/.test(text2)) inferred.push("blocks_build");
  if (/pretend|kitchen|doctor|role|角色|厨房|医生/.test(text2)) inferred.push("pretend_role");
  inferred.push(...cognitiveSignals);
  if (/tweezer|grasp|pinch|夹子|镊子|抓握/.test(text2)) inferred.push("fine_motor_general");
  if (/music|instrument|音乐|乐器/.test(text2)) inferred.push("music_play");
  if (/balance|ride|walk|平衡|骑乘|学步/.test(text2)) inferred.push("balance");
  if (inferred.length) return unique(inferred);
  const category = String(toy.categoryCode || "").toLowerCase();
  if (category.includes("puzzle") || category.includes("matching")) return ["puzzle"];
  if (category.includes("blocks") || category.includes("construction")) return ["blocks_build"];
  if (category.includes("fine_motor")) return ["fine_motor"];
  if (category.includes("pretend")) return ["pretend_role"];
  if (category.includes("vehicles")) return ["track_vehicle"];
  if (category.includes("music")) return ["music_play"];
  if (category.includes("sensory")) return ["sensory"];
  return [];
}
function challengeLevel(toy = {}) {
  const explicit = Number(toy.challengeLevel);
  if (Number.isInteger(explicit) && explicit >= 1 && explicit <= 5) return explicit;
  const mechanics = developmentMechanics(toy);
  const baseline = mechanics.length ? Math.max(...mechanics.map((mechanic) => BASE_LEVEL[mechanic] || 2)) : 2;
  const steps = Math.min(2, Math.max(0, (toy.goalCodes?.length || 0) + (toy.operationCode ? 1 : 0) - 1));
  const combinations = toy.childCount >= 12 ? 2 : toy.childCount >= 6 ? 1 : 0;
  return clamp(baseline + Math.max(steps, combinations), 1, 5);
}
function progressionLevel(toy = {}) {
  const explicit = Number(toy.progressionLevel);
  if (Number.isInteger(explicit) && explicit >= 1 && explicit <= 5) return explicit;
  const mechanics = developmentMechanics(toy);
  const baseline = mechanics.length ? Math.max(...mechanics.map((mechanic) => BASE_LEVEL[mechanic] || 2)) : 2;
  const combinations = toy.childCount >= 12 ? 2 : toy.childCount >= 6 ? 1 : 0;
  const multiMechanic = mechanics.length >= 3 ? 1 : 0;
  return clamp(baseline + Math.max(combinations, multiMechanic), 1, 5);
}
function normalizeDevelopmentFields(toy = {}) {
  return { challengeLevel: challengeLevel(toy), progressionLevel: progressionLevel(toy) };
}
function updateDevelopmentProfile(history = [], existing = {}) {
  const profile = Object.fromEntries(Object.entries(existing || {}).map(([key, value]) => {
    const baselineLevel = value.baselineLevel ?? value.autoLevel ?? value.currentLevel ?? 1;
    return [key, { ...value, baselineLevel, autoLevel: baselineLevel, evidenceCount: 0, confidence: 0.35 }];
  }));
  for (const [key, value] of Object.entries(profile)) {
    const canonical = abilityMechanismKey(key);
    if (canonical !== key && !profile[canonical]) profile[canonical] = { ...value };
  }
  for (const record of history) {
    if (!record || record.interestFeedback === "not_interested") continue;
    for (const mechanic of unique((record.mechanisms || []).map(abilityMechanismKey))) {
      const entry = profile[mechanic] ||= { currentLevel: 1, baselineLevel: 1, autoLevel: 1, confidence: 0.35, evidenceCount: 0, lastUpdated: null };
      entry.evidenceCount++;
      entry.lastUpdated = record.timestamp || entry.lastUpdated;
      const level = clamp(Number(record.progressionLevel) || 1, 1, 5);
      if (record.difficultyFeedback === "too_easy") {
        entry.confidence = clamp(entry.confidence + 0.12, 0, 1);
        if (count(history, mechanic, "too_easy", level) >= 2) entry.autoLevel = Math.max(entry.autoLevel, Math.min(5, level + 1));
      } else if (record.difficultyFeedback === "good_challenge") {
        entry.confidence = clamp(entry.confidence + 0.09, 0, 1);
        if (count(history, mechanic, "good_challenge", level) >= 2) entry.autoLevel = Math.max(entry.autoLevel, level);
      } else if (record.difficultyFeedback === "just_right") {
        entry.confidence = clamp(entry.confidence + 0.04, 0, 1);
        if (count(history, mechanic, "just_right", level) >= 3) entry.autoLevel = Math.max(entry.autoLevel, Math.min(level, entry.autoLevel + 1));
      } else if (record.difficultyFeedback === "too_hard") {
        entry.confidence = clamp(entry.confidence - 0.08, 0.1, 1);
        if (count(history, mechanic, "too_hard", level) >= 2) entry.autoLevel = Math.min(entry.autoLevel, Math.max(1, level - 1));
      }
    }
  }
  for (const entry of Object.values(profile)) entry.currentLevel = entry.manualLevel ?? entry.autoLevel ?? entry.currentLevel ?? 1;
  return profile;
}
function setManualAbility(profile = {}, mechanic, level = null) {
  const key = abilityMechanismKey(mechanic);
  const allowed = DEVELOPMENT_ABILITY_GROUPS.some((group) => group.mechanisms.includes(key));
  if (!allowed) throw new Error("unknownDevelopmentMechanism");
  const manualLevel = level == null || level === "" ? null : Number(level);
  if (manualLevel != null && ![1, 2, 3, 5].includes(manualLevel)) throw new Error("invalidDevelopmentLevel");
  const entry = profile[key] ||= { currentLevel: 1, baselineLevel: 1, autoLevel: 1, confidence: 0.35, evidenceCount: 0, lastUpdated: null };
  entry.manualLevel = manualLevel;
  entry.currentLevel = manualLevel ?? entry.autoLevel ?? 1;
  return entry;
}
function recordDevelopmentFeedback(state, toy, { difficultyFeedback = null, interestFeedback = null, now: now3 = (/* @__PURE__ */ new Date()).toISOString(), rotationCycleId = null } = {}) {
  const difficulty = ["too_easy", "just_right", "good_challenge", "too_hard"].includes(difficultyFeedback) ? difficultyFeedback : null;
  const interest = interestFeedback === "not_interested" ? "not_interested" : null;
  if (!difficulty && !interest) throw new Error("developmentFeedbackRequired");
  const fields = normalizeDevelopmentFields(toy);
  const record = { id: `${toy.id}:${rotationCycleId || "current"}`, toyId: toy.id, canonicalKey: toy.canonicalKey || null, mechanisms: developmentMechanics(toy), progressionLevel: fields.progressionLevel, challengeLevel: fields.challengeLevel, difficultyFeedback: difficulty, interestFeedback: interest, timestamp: now3, rotationCycleId: rotationCycleId || null };
  const previous = Array.isArray(state.developmentFeedbackHistory) ? state.developmentFeedbackHistory : [];
  state.developmentFeedbackHistory = [...previous.filter((item) => item.id !== record.id), record].slice(-240);
  state.profile ||= {};
  state.profile.developmentProfile = updateDevelopmentProfile(state.developmentFeedbackHistory, state.profile.developmentProfile);
  return record;
}
function developmentFit(toy, profile = {}, history = []) {
  const fields = normalizeDevelopmentFields(toy);
  const mechanics = developmentMechanics(toy);
  if (!mechanics.length) return { score: 12, kind: "cold_start", challengeLevel: fields.challengeLevel, progressionLevel: fields.progressionLevel };
  const scores = unique(mechanics.map(abilityMechanismKey)).map((mechanic) => {
    const entry = profileEntry(profile, mechanic);
    const mastery = entry?.manualLevel ?? entry?.currentLevel ?? 2;
    const delta = fields.progressionLevel - mastery;
    let score2 = delta === 0 ? 42 : delta === 1 ? 32 : delta === -1 ? 12 : delta <= -2 ? -24 : -28;
    const recent = history.filter((item) => item.mechanisms?.some((value) => abilityMechanismKey(value) === mechanic));
    if (recent.some((item) => item.difficultyFeedback === "too_easy" && item.progressionLevel >= fields.progressionLevel)) score2 -= 22;
    if (recent.some((item) => item.difficultyFeedback === "too_hard" && item.progressionLevel <= fields.progressionLevel)) score2 -= 25;
    const goodChallenge = recent.filter((item) => item.difficultyFeedback === "good_challenge");
    if (goodChallenge.some((item) => Number(item.progressionLevel) === fields.progressionLevel - 1)) score2 += 24;
    else if (goodChallenge.some((item) => Number(item.progressionLevel) === fields.progressionLevel)) score2 += 6;
    return score2;
  });
  const score = Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
  const deltas = unique(mechanics.map(abilityMechanismKey)).map((mechanic) => {
    const entry = profileEntry(profile, mechanic);
    return fields.progressionLevel - (entry?.manualLevel ?? entry?.currentLevel ?? 2);
  });
  const averageDelta = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
  const kind = score < -10 ? "too_easy_or_hard" : averageDelta >= 0.5 && averageDelta <= 1.5 && score >= 20 ? "good_challenge" : Math.abs(averageDelta) < 0.5 && score >= 25 ? "just_right" : "familiar";
  return { score, kind, challengeLevel: fields.challengeLevel, progressionLevel: fields.progressionLevel };
}
function count(history, mechanic, feedback, level) {
  return history.filter((item) => item?.mechanisms?.some((value) => abilityMechanismKey(value) === mechanic) && item.difficultyFeedback === feedback && Number(item.progressionLevel) === level).length;
}
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// src/domain/profile-service.js
var MONTH_MS = 26298e5;
var DAY_MS = 864e5;
function childAgeMonths(birthDate, now3 = Date.now()) {
  if (!birthDate) return null;
  const timestamp = (/* @__PURE__ */ new Date(`${birthDate}T00:00:00`)).getTime();
  return Number.isFinite(timestamp) ? Math.max(0, Math.floor((now3 - timestamp) / MONTH_MS)) : null;
}
function reassessmentState({ lastRotationAt, rotationHistory = [], rotationDays = 7, now: now3 = Date.now() }) {
  const rotationAt = lastRotationAt || rotationHistory[0]?.at;
  const days = Math.max(1, Number(rotationDays) || 7);
  if (!rotationAt) return { due: true, daysRemaining: 0, days, nextAt: null };
  const nextAt = new Date(new Date(rotationAt).getTime() + days * DAY_MS);
  const daysRemaining = Math.max(0, Math.ceil((nextAt.getTime() - now3) / DAY_MS));
  return { due: daysRemaining === 0, daysRemaining, days, nextAt: nextAt.toISOString() };
}
function saveProfileAndRotationSettings(store2, { childName, childBirthDate, rotationSize, rotationDays, manualAbilities = [], onboardingDone = true }) {
  store2.update((state) => {
    state.profile.childName = String(childName || "").trim();
    state.profile.childBirthDate = childBirthDate || "";
    state.settings.rotationSize = Math.max(1, Math.min(50, Number(rotationSize) || 6));
    state.settings.rotationDays = Math.max(1, Math.min(90, Number(rotationDays) || 7));
    state.profile.developmentProfile ||= {};
    for (const [mechanic, level] of manualAbilities) setManualAbility(state.profile.developmentProfile, mechanic, level);
    if (onboardingDone) state.settings.onboardingDone = true;
  }, "profile-and-rotation-settings");
}

// src/domain/substitution-engine.js
var GENERIC_MECHANICS = /* @__PURE__ */ new Set(["fine_motor_general", "construction_general", "pretend_play_general", "sensory_general"]);
var SPECIFIC_SKILLS = /* @__PURE__ */ new Set(["logic", "math", "sorting", "memory", "problem_solving", "cause_effect", "spatial_awareness", "visual_spatial", "matching", "practical_life"]);
var SubstitutionEngine = class {
  #cache = /* @__PURE__ */ new Map();
  #libraryRevision = -1;
  result(candidate, toys, revision, { childAgeMonths: childAgeMonths3 = null } = {}) {
    if (this.#libraryRevision !== revision) {
      this.#cache.clear();
      this.#libraryRevision = revision;
    }
    const key = `${canonicalKey(candidate.canonicalKey)}|${revision}|${childAgeMonths3 ?? "all"}`;
    if (this.#cache.has(key)) return this.#cache.get(key);
    const allRelationships = toys.filter((toy) => !toy.hidden && !toy.archived && toy.set?.kind !== "parent").map((toy) => assess(candidate, toy, { childAgeMonths: childAgeMonths3 })).filter((item) => item.level !== "none").sort(compareRelationship);
    const relationships = allRelationships.filter((item) => item.level !== "skill_similarity_only");
    const skillRelationships = allRelationships.filter((item) => item.level === "skill_similarity_only");
    const purchaseAffecting = relationships.filter((item) => ["exact_duplicate", "high_substitution", "medium_substitution"].includes(item.level));
    const result2 = {
      engineVersion: "clean-2",
      canonicalKey: canonicalKey(candidate.canonicalKey),
      relationships,
      skillRelationships,
      counts: count2(allRelationships),
      ageAppropriateCounts: count2(purchaseAffecting.filter((item) => item.ageAppropriate)),
      purchaseImpact: priority(purchaseAffecting.filter((item) => item.ageAppropriate))
    };
    this.#cache.set(key, result2);
    return result2;
  }
};
function assess(a, b, { childAgeMonths: childAgeMonths3 = null } = {}) {
  const exact = canonicalKey(a.canonicalKey) && canonicalKey(a.canonicalKey) === canonicalKey(b.canonicalKey);
  const aMechanics = specificMechanics(a), bMechanics = specificMechanics(b);
  const sharedMechanics = aMechanics.filter((value) => bMechanics.includes(value));
  const sharedSkills = unique(a.skillCodes || []).filter((value) => (b.skillCodes || []).includes(value));
  const specificSkills = sharedSkills.filter((value) => SPECIFIC_SKILLS.has(value));
  const operationSimilarity = operationScore(a, b);
  const goalSimilarity = overlap(a.goalCodes, b.goalCodes);
  const sceneSimilarity = overlap(a.sceneCodes, b.sceneCodes);
  const score = exact ? 100 : sharedMechanics.length * 32 + operationSimilarity * 15 + goalSimilarity * 12 + sceneSimilarity * 12 + specificSkills.length * 5;
  let level = "none";
  if (exact) level = "exact_duplicate";
  else if (sharedMechanics.length >= 2 || sharedMechanics.length >= 1 && (operationSimilarity || goalSimilarity || sceneSimilarity) || score >= 58) level = "high_substitution";
  else if (sharedMechanics.length >= 1 || (operationSimilarity || goalSimilarity || sceneSimilarity) && specificSkills.length > 0 || score >= 28) level = "medium_substitution";
  else if (sharedSkills.length > 0) level = "skill_similarity_only";
  return { toy: b, toyId: b.id, level, score, sharedMechanics, operationSimilarity, goalSimilarity, sceneSimilarity, sharedSkillCodes: sharedSkills, reasonCode: reason(sharedMechanics, operationSimilarity, goalSimilarity, sceneSimilarity, sharedSkills), ageAppropriate: ageAppropriate(b, childAgeMonths3) };
}
function specificMechanics(toy) {
  return unique(toy.playMechanics || []).filter((value) => !GENERIC_MECHANICS.has(value));
}
function overlap(a = [], b = []) {
  return unique(a).filter((value) => b.includes(value)).length;
}
function operationScore(a, b) {
  return a.operationCode && a.operationCode === b.operationCode ? 1 : 0;
}
function ageAppropriate(toy, age) {
  return age == null || (toy.minAgeMonths == null || age >= toy.minAgeMonths - 3) && (toy.maxAgeMonths == null || age <= toy.maxAgeMonths + 12);
}
function reason(mechanics, operation, goal, scene, skills) {
  if (mechanics.length) return `mechanic:${mechanics[0]}`;
  if (operation) return "operation";
  if (scene) return "scene";
  if (goal) return "goal";
  if (skills.length) return "skill";
  return "none";
}
function count2(rows) {
  return rows.reduce((result2, row) => ({ ...result2, [row.level]: (result2[row.level] || 0) + 1 }), { exact_duplicate: 0, high_substitution: 0, medium_substitution: 0, skill_similarity_only: 0 });
}
function priority(rows) {
  const exact = rows.filter((row) => row.level === "exact_duplicate").length;
  const high = rows.filter((row) => row.level === "high_substitution").length;
  const medium = rows.filter((row) => row.level === "medium_substitution").length;
  const penalty = exact * 100 + high * 30 + medium * 12;
  return { overlapPenalty: penalty, priority: exact || high >= 2 ? "low" : high || medium >= 3 ? "medium" : "high" };
}
function compareRelationship(a, b) {
  const rank2 = { exact_duplicate: 4, high_substitution: 3, medium_substitution: 2, skill_similarity_only: 1 };
  return rank2[b.level] - rank2[a.level] || b.score - a.score || String(a.toy.productName).localeCompare(String(b.toy.productName));
}

// src/domain/rotation-engine.js
var GENERIC_MECHANICS2 = /* @__PURE__ */ new Set(["fine_motor_general", "construction_general", "pretend_play_general", "sensory_general"]);
function selectRotation({ toys = [], history = [], childAgeMonths: childAgeMonths3, size = 6, now: now3 = Date.now(), childDevelopmentProfile = {}, developmentFeedbackHistory = [] }) {
  const requestedRotationCount = Math.max(1, Number(size) || 6);
  const classified = classifyCandidates(toys, childAgeMonths3, childDevelopmentProfile);
  const candidates = classified.eligible.map((toy, index) => ({ toy, ...baseScore(toy, childAgeMonths3, now3, history, childDevelopmentProfile, developmentFeedbackHistory), index })).sort((a, b) => b.score - a.score || a.toy.productName.localeCompare(b.toy.productName));
  const selected = [];
  const selectedCandidateScores = [];
  const relations = /* @__PURE__ */ new Map();
  const diversity = { brandPenaltyApplied: 0, groupPenaltyApplied: 0, recencyPenaltyApplied: 0 };
  const stretchTarget = requestedRotationCount >= 3 ? Math.max(1, Math.round(requestedRotationCount * 0.25)) : 0;
  const stretchCap = Math.max(1, Math.ceil(requestedRotationCount * 0.3));
  while (selected.length < requestedRotationCount && candidates.length) {
    const stretchCount = selectedCandidateScores.filter((item) => item.developmentKind === "good_challenge").length;
    const remaining = requestedRotationCount - selected.length;
    const availableStretch = candidates.filter((entry) => entry.development.kind === "good_challenge");
    const availableOther = candidates.filter((entry) => entry.development.kind !== "good_challenge");
    const forceStretch = stretchCount < stretchTarget && remaining <= stretchTarget - stretchCount && availableStretch.length;
    const allowed = forceStretch ? availableStretch : stretchCount >= stretchCap && availableOther.length ? availableOther : candidates;
    const next = allowed.map((entry) => {
      const adjustment = diversityAdjustment(entry.toy, selected, history, relations);
      return { entry, candidateIndex: candidates.indexOf(entry), adjustment, adjusted: entry.score + adjustment.value };
    }).sort((a, b) => b.adjusted - a.adjusted || a.entry.toy.productName.localeCompare(b.entry.toy.productName))[0];
    selected.push(next.entry.toy);
    selectedCandidateScores.push({
      id: next.entry.toy.id,
      canonicalKey: next.entry.toy.canonicalKey || null,
      brand: normalizedBrand(next.entry.toy),
      ownershipGroup: ownershipGroupKey(next.entry.toy),
      brandPenalty: next.adjustment.brandPenalty,
      groupPenalty: next.adjustment.groupPenalty,
      recencyPenalty: next.entry.recencyPenalty,
      developmentFit: next.entry.development.score,
      developmentKind: next.entry.development.kind,
      challengeLevel: next.entry.development.challengeLevel,
      progressionLevel: next.entry.development.progressionLevel,
      finalScore: next.adjusted
    });
    diversity.brandPenaltyApplied += next.adjustment.brandPenalty;
    diversity.groupPenaltyApplied += next.adjustment.groupPenalty;
    diversity.recencyPenaltyApplied += next.entry.recencyPenalty;
    candidates.splice(next.candidateIndex, 1);
  }
  const selectedIds = new Set(selected.map((toy) => toy.id));
  const selectedRotationCount = selected.length;
  const permanentCount = classified.customPermanent.length;
  const shortageCount = Math.max(0, requestedRotationCount - selectedRotationCount);
  return {
    selected,
    diagnostics: {
      requestedRotationCount,
      selectedRotationCount,
      permanentCount,
      totalShelfCount: selectedRotationCount + permanentCount,
      eligibleRotationCount: classified.eligible.length,
      selectedBrandCounts: countBy(selected, (toy) => normalizedBrand(toy)),
      selectedOwnershipGroupCounts: countBy(selected.filter((toy) => ownershipGroupKey(toy)), ownershipGroupKey),
      previousRotationOverlap: overlapCount(selectedIds, history[0]?.toyIds || []),
      recent3RotationOverlap: overlapCount(selectedIds, history.slice(0, 3).flatMap((round) => round.toyIds || [])),
      brandDiversityPenaltyApplied: diversity.brandPenaltyApplied,
      groupDiversityPenaltyApplied: diversity.groupPenaltyApplied,
      recencyPenaltyApplied: diversity.recencyPenaltyApplied,
      selectedCandidateScores,
      stretchTarget,
      selectedStretchCount: selectedCandidateScores.filter((item) => item.developmentKind === "good_challenge").length,
      // Backwards-compatible aliases for older Admin diagnostics and backups.
      requestedCount: requestedRotationCount,
      selectedCount: selectedRotationCount,
      uniqueSelectedCount: selectedIds.size,
      eligibleCount: classified.eligible.length,
      shortageCount,
      shortageReason: shortageCount ? "eligible_pool_exhausted" : null,
      exclusionSummary: {
        totalToys: toys.length,
        excludedByStatus: 0,
        excludedHiddenOrArchived: classified.hiddenOrArchived,
        excludedParentContainers: classified.parentContainers,
        excludedByAgeRule: classified.ageRule,
        permanentToys: permanentCount,
        eligibleRotationCandidates: classified.eligible.length,
        scoredCandidates: classified.eligible.length,
        rankedCandidates: classified.eligible.length,
        duplicateRemovals: 0,
        parentChildGroupConflictRemovals: 0,
        cooldownOrRecentlyUsedRemovals: 0,
        diversityCategoryBalanceRemovals: 0,
        interestOrRotationRuleRemovals: 0
      }
    }
  };
}
function persistRotationSelection(state, { selected, diagnostics, now: now3 = (/* @__PURE__ */ new Date()).toISOString() }) {
  clearManualShelfOverrides(state);
  const ids = new Set(selected.map((toy) => toy.id));
  const permanentIds = new Set(currentShelfCollections(state).permanent.map((toy) => toy.id));
  for (const toy of state.toys || []) {
    if (toy.hidden || toy.archived || isRotationPaused(toy) || toy.set?.kind === "parent") {
      if (toy.status === "active") toy.status = "stored";
      continue;
    }
    toy.status = ids.has(toy.id) || permanentIds.has(toy.id) ? "active" : "stored";
    if (ids.has(toy.id)) toy.lastActivatedAt = now3;
  }
  const normalizedDiagnostics = withShelfCounts(diagnostics, ids.size, permanentIds.size, 0);
  state.lastRotationAt = now3;
  state.rotationHistory ||= [];
  state.rotationHistory.unshift({ id: crypto.randomUUID(), at: now3, toyIds: [...ids], mechanisms: selected.flatMap((toy) => toy.playMechanics || []), rotationDiagnostics: normalizedDiagnostics });
  return { selectedIds: ids, selectedCount: ids.size, permanentIds, totalShelfCount: ids.size + permanentIds.size };
}
function normalizeCurrentShelf(state) {
  const shelf = currentShelfCollections(state);
  const ids = /* @__PURE__ */ new Set([...shelf.rotation.map((toy) => toy.id), ...shelf.permanent.map((toy) => toy.id), ...shelf.manual.map((toy) => toy.id)]);
  let changed = 0;
  for (const toy of state.toys || []) {
    const nextStatus = !toy.hidden && !toy.archived && toy.set?.kind !== "parent" && ids.has(toy.id) ? "active" : "stored";
    if (toy.status !== nextStatus) {
      toy.status = nextStatus;
      changed++;
    }
  }
  return { changed, normalizedIds: [...ids], rotationIds: shelf.rotation.map((toy) => toy.id), permanentIds: shelf.permanent.map((toy) => toy.id), manualIds: shelf.manual.map((toy) => toy.id) };
}
function isUserCustomPermanent(toy = {}) {
  return toy.shelfMode === "permanent" && toy.permanentSource === "user";
}
function isRotationPaused(toy = {}) {
  return toy.rotationParticipation === "paused";
}
function setRotationParticipation(state, toyId, participation, { childAgeMonths: childAgeMonths3, now: now3 = (/* @__PURE__ */ new Date()).toISOString(), pauseReason = "", pauseReasonCode = "" } = {}) {
  const toy = (state.toys || []).find((item) => item.id === toyId);
  if (!toy || toy.set?.kind === "parent") return { changed: false, reason: toy?.set?.kind === "parent" ? "parent_container" : "not_found" };
  const paused = participation === "paused";
  if (paused) {
    toy.rotationParticipation = "paused";
    toy.pauseReason = String(pauseReason || "").slice(0, 240);
    toy.pauseReasonCode = String(pauseReasonCode || "").slice(0, 80);
    toy.pauseUpdatedAt = now3;
    if (isUserCustomPermanent(toy)) {
      toy.shelfMode = "rotate";
      toy.permanentSource = null;
      toy.permanentSetAt = null;
    }
    toy.manualShelfMode = null;
    toy.manualShelfUpdatedAt = null;
    const plan = state.rotationHistory?.[0];
    if (plan?.toyIds?.includes(toy.id)) {
      plan.toyIds = plan.toyIds.filter((id) => id !== toy.id);
      refillCurrentRotation(state, { childAgeMonths: childAgeMonths3, now: now3 });
    } else {
      normalizeCurrentShelf(state);
      refreshLatestDiagnostics(state, childAgeMonths3);
    }
  } else {
    toy.rotationParticipation = "active";
    toy.pauseUpdatedAt = now3;
    normalizeCurrentShelf(state);
    refreshLatestDiagnostics(state, childAgeMonths3);
  }
  return { changed: true, paused, shelf: currentShelfCollections(state) };
}
function currentShelfCollections(state = {}) {
  const toys = state.toys || [];
  const byId = new Map(toys.map((toy) => [toy.id, toy]));
  const permanent = toys.filter((toy) => isShelfVisible(toy) && !isRotationPaused(toy) && isUserCustomPermanent(toy));
  const permanentIds = new Set(permanent.map((toy) => toy.id));
  const manual = toys.filter((toy) => isShelfVisible(toy) && !permanentIds.has(toy.id) && toy.manualShelfMode === "on_shelf");
  const manualIds = new Set(manual.map((toy) => toy.id));
  const seen = /* @__PURE__ */ new Set();
  const rotation = (state.rotationHistory?.[0]?.toyIds || []).map((id) => byId.get(id)).filter((toy) => toy && isShelfVisible(toy) && !isRotationPaused(toy) && !permanentIds.has(toy.id) && !manualIds.has(toy.id) && toy.manualShelfMode !== "stored" && !seen.has(toy.id) && seen.add(toy.id));
  return { rotation, permanent, manual, rotationIds: rotation.map((toy) => toy.id), permanentIds: permanent.map((toy) => toy.id), manualIds: manual.map((toy) => toy.id), totalShelfCount: rotation.length + permanent.length + manual.length };
}
function setCustomPermanent(state, toyId, permanent, { childAgeMonths: childAgeMonths3, now: now3 = (/* @__PURE__ */ new Date()).toISOString() } = {}) {
  const toy = (state.toys || []).find((item) => item.id === toyId);
  if (!toy || toy.set?.kind === "parent") return { changed: false, reason: toy?.set?.kind === "parent" ? "parent_container" : "not_found" };
  const plan = state.rotationHistory?.[0] || null;
  if (permanent) {
    toy.rotationParticipation = "active";
    toy.pauseReasonCode = null;
    toy.pauseUpdatedAt = null;
    toy.shelfMode = "permanent";
    toy.permanentSource = "user";
    toy.permanentSetAt = now3;
    toy.manualShelfMode = null;
    toy.status = "active";
    toy.lastActivatedAt ||= now3;
    if (plan) {
      plan.toyIds = (plan.toyIds || []).filter((id) => id !== toy.id);
      refillCurrentRotation(state, { childAgeMonths: childAgeMonths3, now: now3 });
    } else normalizeCurrentShelf(state);
  } else {
    toy.shelfMode = "rotate";
    toy.permanentSource = null;
    toy.permanentSetAt = null;
    normalizeCurrentShelf(state);
    refreshLatestDiagnostics(state, childAgeMonths3);
  }
  return { changed: true, permanent: isUserCustomPermanent(toy), shelf: currentShelfCollections(state) };
}
function setManualShelfState(state, toyId, mode, { childAgeMonths: childAgeMonths3, now: now3 = (/* @__PURE__ */ new Date()).toISOString() } = {}) {
  const toy = (state.toys || []).find((item) => item.id === toyId);
  if (!toy || toy.set?.kind === "parent" || isUserCustomPermanent(toy) || isRotationPaused(toy)) return { changed: false, reason: !toy ? "not_found" : "not_manual_eligible" };
  const nextMode = mode === "on_shelf" ? "on_shelf" : mode === "stored" ? "stored" : null;
  if (toy.manualShelfMode === nextMode) return { changed: false, shelf: currentShelfCollections(state) };
  toy.manualShelfMode = nextMode;
  toy.manualShelfUpdatedAt = nextMode ? now3 : null;
  const plan = state.rotationHistory?.[0];
  if (plan && nextMode) {
    plan.toyIds = (plan.toyIds || []).filter((id) => id !== toy.id);
    refillCurrentRotation(state, { childAgeMonths: childAgeMonths3, now: now3 });
  } else {
    normalizeCurrentShelf(state);
    refreshLatestDiagnostics(state, childAgeMonths3);
  }
  return { changed: true, mode: nextMode, shelf: currentShelfCollections(state) };
}
function clearManualShelfOverrides(state) {
  let changed = 0;
  for (const toy of state.toys || []) {
    if (toy.manualShelfMode) {
      toy.manualShelfMode = null;
      toy.manualShelfUpdatedAt = null;
      changed++;
    }
  }
  return changed;
}
function refillCurrentRotation(state, { childAgeMonths: childAgeMonths3, now: now3 = (/* @__PURE__ */ new Date()).toISOString() } = {}) {
  const plan = state.rotationHistory?.[0];
  if (!plan) return { selectedRotationCount: 0, shortageCount: Math.max(1, Number(state.settings?.rotationSize) || 6) };
  const target = Math.max(1, Number(state.settings?.rotationSize) || 6);
  const shelf = currentShelfCollections(state);
  const remainingTarget = Math.max(0, target - shelf.manual.length);
  const kept = shelf.rotation.slice(0, remainingTarget);
  const keptIds = new Set(kept.map((toy) => toy.id));
  const occupied = [...kept, ...shelf.manual, ...shelf.permanent];
  const occupiedIds = new Set(occupied.map((toy) => toy.id));
  const occupiedIdentityKeys = new Set(occupied.flatMap(rotationIdentityKeys));
  const missing = Math.max(0, remainingTarget - kept.length);
  let additions = [];
  if (missing) {
    const pool = (state.toys || []).filter((toy) => !keptIds.has(toy.id) && !occupiedIds.has(toy.id) && !rotationIdentityKeys(toy).some((key) => occupiedIdentityKeys.has(key)));
    additions = selectRotation({ toys: pool, history: (state.rotationHistory || []).slice(1), childAgeMonths: childAgeMonths3, size: missing, now: new Date(now3).getTime(), childDevelopmentProfile: state.profile?.developmentProfile || {}, developmentFeedbackHistory: state.developmentFeedbackHistory || [] }).selected.slice(0, missing);
  }
  const selected = [...kept, ...additions];
  for (const toy of additions) toy.lastActivatedAt = now3;
  plan.toyIds = selected.map((toy) => toy.id);
  plan.mechanisms = selected.flatMap((toy) => toy.playMechanics || []);
  plan.rotationDiagnostics = buildCurrentDiagnostics(state, selected.length, childAgeMonths3);
  normalizeCurrentShelf(state);
  return { selectedRotationCount: selected.length, shortageCount: Math.max(0, target - selected.length), addedIds: additions.map((toy) => toy.id) };
}
function refreshLatestDiagnostics(state, childAgeMonths3) {
  const plan = state.rotationHistory?.[0];
  if (!plan) return;
  const selectedCount = currentShelfCollections(state).rotation.length;
  plan.rotationDiagnostics = buildCurrentDiagnostics(state, selectedCount, childAgeMonths3);
}
function buildCurrentDiagnostics(state, selectedRotationCount, childAgeMonths3) {
  const requestedRotationCount = Math.max(1, Number(state.settings?.rotationSize) || 6);
  const classified = classifyCandidates(state.toys || [], childAgeMonths3, state.profile?.developmentProfile || {});
  const permanentCount = classified.customPermanent.length;
  const manualCount = currentShelfCollections(state).manual.length;
  const ordinaryRotationCount = selectedRotationCount + manualCount;
  const shortageCount = Math.max(0, requestedRotationCount - ordinaryRotationCount);
  return withShelfCounts({
    requestedRotationCount,
    selectedRotationCount: ordinaryRotationCount,
    automaticRotationCount: selectedRotationCount,
    permanentCount,
    eligibleRotationCount: classified.eligible.length,
    requestedCount: requestedRotationCount,
    selectedCount: selectedRotationCount,
    uniqueSelectedCount: selectedRotationCount,
    eligibleCount: classified.eligible.length,
    shortageCount,
    shortageReason: shortageCount ? "eligible_pool_exhausted" : null,
    exclusionSummary: { totalToys: (state.toys || []).length, excludedByStatus: 0, excludedHiddenOrArchived: classified.hiddenOrArchived, excludedParentContainers: classified.parentContainers, excludedByAgeRule: classified.ageRule, permanentToys: permanentCount, eligibleRotationCandidates: classified.eligible.length, scoredCandidates: classified.eligible.length, rankedCandidates: classified.eligible.length, duplicateRemovals: 0, parentChildGroupConflictRemovals: 0, cooldownOrRecentlyUsedRemovals: 0, diversityCategoryBalanceRemovals: 0, interestOrRotationRuleRemovals: 0 }
  }, selectedRotationCount, permanentCount, manualCount);
}
function withShelfCounts(diagnostics = {}, selectedRotationCount, permanentCount, manualCount = 0) {
  const requestedRotationCount = diagnostics.requestedRotationCount ?? diagnostics.requestedCount ?? selectedRotationCount;
  const automaticRotationCount = diagnostics.automaticRotationCount ?? selectedRotationCount;
  const ordinaryRotationCount = diagnostics.selectedRotationCount ?? diagnostics.selectedCount ?? automaticRotationCount + manualCount;
  return { ...diagnostics, requestedRotationCount, selectedRotationCount: ordinaryRotationCount, automaticRotationCount, permanentCount, manualShelfCount: manualCount, totalShelfCount: automaticRotationCount + permanentCount + manualCount, eligibleRotationCount: diagnostics.eligibleRotationCount ?? diagnostics.eligibleCount ?? automaticRotationCount, requestedCount: requestedRotationCount, selectedCount: ordinaryRotationCount };
}
function rotationIdentityKeys(toy = {}) {
  return [toy.canonicalKey && `canonical:${toy.canonicalKey}`, toy.catalogId && `catalog:${toy.catalogId}`, toy.sku && `sku:${String(toy.sku).toLowerCase()}`].filter(Boolean);
}
function classifyCandidates(toys, age, profile = {}) {
  const result2 = { eligible: [], customPermanent: [], hiddenOrArchived: 0, parentContainers: 0, ageRule: 0 };
  for (const toy of toys) {
    if (toy.hidden || toy.archived || isRotationPaused(toy)) {
      result2.hiddenOrArchived++;
      continue;
    }
    if (toy.set?.kind === "parent") {
      result2.parentContainers++;
      continue;
    }
    if (isUserCustomPermanent(toy)) {
      result2.customPermanent.push(toy);
      continue;
    }
    if (toy.manualShelfMode) {
      result2.manualOverride = (result2.manualOverride || 0) + 1;
      continue;
    }
    if (!hardSafetyEligible(toy, age, profile)) {
      result2.ageRule++;
      continue;
    }
    result2.eligible.push(toy);
  }
  return result2;
}
function rotationAgeEligibility(toy, age, profile = {}) {
  const safety = toy.userMetadata?.safety || toy.safety || {};
  const status = catalogSafetyStatus(toy);
  const result2 = (eligible, reason2) => ({ eligible, reason: reason2 });
  if (age == null) {
    const eligible = !safety.requiresAgeConfirmation && !safety.chokingSmallParts && !safety.smallParts && !safety.requiresStandingStability && safety.minAgeMonths == null && safety.safetyMinAgeMonths == null && safety.hardMinAgeMonths == null && safety.requiredGrossMotorLevel == null && status !== "GROSS_MOTOR_GATE";
    return result2(eligible, eligible ? "NORMAL_AGE_ELIGIBLE" : "UNKNOWN_AGE_BLOCK");
  }
  const minimum = Number(safety.hardMinAgeMonths ?? safety.minAgeMonths ?? safety.safetyMinAgeMonths);
  if (Number.isFinite(minimum) && minimum > 0 && age < minimum) return result2(false, "HARD_SAFETY_BLOCK");
  if ((safety.chokingSmallParts === true || safety.smallParts === true || status === "SMALL_PARTS_GATE") && age < 36) return result2(false, "HARD_SAFETY_BLOCK");
  const requiredBalance = Number(status === "GROSS_MOTOR_GATE" || safety.requiresStandingStability === true ? safety.requiredGrossMotorLevel ?? 2 : safety.requiredGrossMotorLevel);
  if (Number.isFinite(requiredBalance) && requiredBalance > 0 && (profile.balance?.manualLevel ?? profile.balance?.currentLevel ?? 1) < requiredBalance) return result2(false, "HARD_SAFETY_BLOCK");
  if (safety.requiresAgeConfirmation === true) return result2(false, "HARD_SAFETY_BLOCK");
  if (toy.minAgeMonths != null && age < toy.minAgeMonths) {
    if (status === "VERIFIED_NO_EXTRA_GATE") return result2(true, "VERIFIED_CROSS_AGE_ALLOWED");
    if (["SMALL_PARTS_GATE", "GROSS_MOTOR_GATE", "OTHER_HARD_GATE"].includes(status)) return result2(true, "VERIFIED_CROSS_AGE_ALLOWED");
    if (status === "NO_DOCUMENTED_HARD_GATE") return validCrossAgeApproval(toy, toy.crossAgeApproval) ? result2(true, "PARENT_APPROVED_CROSS_AGE") : result2(false, "PARENT_APPROVAL_REQUIRED");
    return result2(false, "UNKNOWN_AGE_BLOCK");
  }
  return result2(true, "NORMAL_AGE_ELIGIBLE");
}
function hardSafetyEligible(toy, age, profile = {}) {
  return rotationAgeEligibility(toy, age, profile).eligible;
}
function isShelfVisible(toy) {
  return !toy.hidden && !toy.archived && toy.set?.kind !== "parent";
}
function baseScore(toy, age, now3, history, childDevelopmentProfile, developmentFeedbackHistory) {
  const monthsAhead = age == null || toy.minAgeMonths == null ? 0 : Math.max(0, toy.minAgeMonths - age);
  const ageGuidance = -Math.min(4, monthsAhead / 6);
  const lastActivated = new Date(toy.lastActivatedAt || 0).getTime();
  const freshness = Math.min(30, Math.max(0, (now3 - lastActivated) / 864e5 / 3));
  const interest = toy.interest === "like" ? 12 : toy.interest === "neutral" ? 4 : toy.interest === "dislike" ? -18 : 0;
  const rotationValue = toy.rotationValue === "high" ? 12 : toy.rotationValue === "low" ? -5 : 0;
  const recency = rotationRecencyAdjustment(toy, history);
  const development = developmentFit(toy, childDevelopmentProfile, developmentFeedbackHistory);
  return { score: ageGuidance + freshness + interest + rotationValue + recency.value + development.score * 2, recencyPenalty: recency.penalty, development };
}
function diversityAdjustment(candidate, selected, history, relations) {
  let value = recentMechanicAdjustment(candidate, history);
  let brandPenalty = 0;
  let groupPenalty = 0;
  const sameBrand2 = selected.filter((chosen) => normalizedBrand(chosen) === normalizedBrand(candidate)).length;
  if (sameBrand2) {
    brandPenalty = 9 * sameBrand2;
    value -= brandPenalty;
  }
  const candidateGroup = ownershipGroupKey(candidate);
  const sameGroup = candidateGroup ? selected.filter((chosen) => ownershipGroupKey(chosen) === candidateGroup).length : 0;
  if (sameGroup) {
    groupPenalty = 11 * sameGroup;
    value -= groupPenalty;
  }
  for (const chosen of selected) {
    const relation = cachedRelation(candidate, chosen, relations);
    if (relation.level === "exact_duplicate" || relation.level === "high_substitution") value -= 26;
    else if (relation.level === "medium_substitution") value -= 9;
    if (candidate.categoryCode && candidate.categoryCode === chosen.categoryCode) value -= 2;
    if ((candidate.skillCodes || []).some((skill) => (chosen.skillCodes || []).includes(skill))) value -= 1;
  }
  return { value, brandPenalty, groupPenalty };
}
function rotationRecencyAdjustment(toy, history) {
  const index = history.slice(0, 3).findIndex((round) => (round.toyIds || []).includes(toy.id));
  if (index === -1) return { value: 8, penalty: 0 };
  const penalty = [240, 150, 80][index];
  return { value: -penalty, penalty };
}
function normalizedBrand(toy) {
  return String(toy.brand || "other").trim().toLocaleLowerCase() || "other";
}
function ownershipGroupKey(toy = {}) {
  const set = toy.set || {};
  return set.ownershipGroupId || set.generatedFromParentId || set.parentOwnershipId || set.parentId || set.parentCanonicalKey || toy.parentCanonicalKey || null;
}
function countBy(items, keyOf) {
  const counts = {};
  for (const item of items) {
    const key = keyOf(item);
    if (key) counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}
function overlapCount(ids, otherIds) {
  const other = new Set(otherIds);
  return [...ids].filter((id) => other.has(id)).length;
}
function recentMechanicAdjustment(candidate, history) {
  const recent = new Set(history.slice(0, 3).flatMap((round) => round.mechanisms || []));
  const repeated = (candidate.playMechanics || []).filter((mechanic) => !GENERIC_MECHANICS2.has(mechanic) && recent.has(mechanic));
  return repeated.length ? -8 * Math.min(repeated.length, 2) : 0;
}
function cachedRelation(a, b, relations) {
  const key = [a.id, b.id].sort().join("|");
  if (!relations.has(key)) relations.set(key, assess(a, b));
  return relations.get(key);
}

// src/domain/development-presentation.js
function challengeLabelKey(toy = {}) {
  return `developmentChallenge.${challengeLevel(toy)}`;
}
function recommendationReason(toy, { profile = {}, history = [], recentIds = [], diversityPreferred = false } = {}) {
  const fit = developmentFit(toy, profile, history);
  if (fit.kind === "good_challenge") return { key: "recommendationReason.progression" };
  if (fit.kind === "just_right") return { key: "recommendationReason.developmentFit" };
  if (diversityPreferred) return { key: "recommendationReason.diversity" };
  if (!recentIds.includes(toy.id)) return { key: "recommendationReason.recency" };
  return { key: "recommendationReason.familiar" };
}
function filterCatalogDevelopment(rows, filters = {}, { childAgeMonths: childAgeMonths3 = null, profile = {}, history = [] } = {}) {
  const query = String(filters.query || "").normalize("NFKC").trim().toLowerCase();
  return rows.filter((toy) => {
    const text2 = [toy.brand, toy.productName, toy.names?.en, toy.names?.zh, ...toy.aliases || [], ...toy.skillCodes || [], ...toy.playMechanics || []].filter(Boolean).join(" ").toLowerCase();
    if (query && !text2.includes(query)) return false;
    if (!matches(filters.brands, toy.brand)) return false;
    if (!matches(filters.categories, toy.categoryCode)) return false;
    if (!matchesAny(filters.skills, toy.skillCodes)) return false;
    if (!matchesAny(filters.mechanics, developmentMechanics(toy))) return false;
    if (!matches(filters.challenges, String(challengeLevel(toy)))) return false;
    if (!matchesAge(toy, filters.age, childAgeMonths3)) return false;
    if (filters.fitCurrent && developmentFit(toy, profile, history).score < 12) return false;
    return true;
  });
}
function matches(selected = [], value) {
  return !selected?.length || selected.includes(value);
}
function matchesAny(selected = [], values = []) {
  return !selected?.length || values.some((value) => selected.includes(value));
}
function matchesAge(toy, age, childAgeMonths3) {
  if (!age || age === "all" || childAgeMonths3 == null) return true;
  const min = Number.isFinite(toy.minAgeMonths) ? toy.minAgeMonths : -Infinity;
  const max = Number.isFinite(toy.maxAgeMonths) ? toy.maxAgeMonths : Infinity;
  if (age === "current") return min <= childAgeMonths3 && max >= childAgeMonths3;
  if (age === "later") return min > childAgeMonths3;
  return true;
}

// src/features/admin-service.js
var TOKEN_KEY = "toyRotationAdminTokenV095";
var VERIFIED_KEY = "toyRotationAdminVerifiedV095";
var AdminService = class {
  #store;
  #catalog;
  #base;
  constructor({ store: store2, catalog: catalog2, baseUrl = "" }) {
    this.#store = store2;
    this.#catalog = catalog2;
    this.#base = String(baseUrl || window.TOY_ROTATION_CONFIG?.API_BASE || "").replace(/\/+$/, "");
  }
  get enabled() {
    return Boolean(sessionStorage.getItem(VERIFIED_KEY) && sessionStorage.getItem(TOKEN_KEY));
  }
  async signIn(password) {
    if (!password) throw new Error("adminPasswordRequired");
    if (!this.#base) throw new Error("adminUnconfigured");
    const headers = { Authorization: `Bearer ${password}` };
    let response = await fetch(`${this.#base}/admin-auth`, { headers, cache: "no-store" });
    if (response.status === 404) response = await fetch(`${this.#base}/admin-catalog`, { headers, cache: "no-store" });
    if (!response.ok) throw new Error(response.status === 401 ? "adminIncorrectPassword" : "adminSignInFailed");
    sessionStorage.setItem(TOKEN_KEY, password);
    sessionStorage.setItem(VERIFIED_KEY, "1");
    return true;
  }
  signOut() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(VERIFIED_KEY);
  }
  async syncEdits() {
    if (!this.#base) return;
    const response = await fetch(`${this.#base}/catalog-overrides`, { cache: "no-store" });
    if (!response.ok) throw new Error("catalogSyncFailed");
    const payload = await response.json();
    this.#catalog.applyServerEdits(payload);
  }
  async diagnostics() {
    if (!this.enabled) throw new Error("adminVerificationRequired");
    await this.retryPendingDeletes();
    const pendingDeletes = this.#store.state.catalogState.syncMetadata.pendingAdminDeletes || [];
    if (!this.#base) return { configured: false, backend: "unconfigured", quota: null, pendingDeletes };
    const headers = { Authorization: `Bearer ${sessionStorage.getItem(TOKEN_KEY)}` };
    const [health, quota] = await Promise.all([this.#probe("/health", headers), this.#probe("/quota", headers)]);
    return { configured: true, backend: health.ok ? "available" : "unavailable", health: health.payload, quota: quota.ok ? quota.payload : null, pendingDeletes };
  }
  async replaceCatalogImage(key, dataUrl2, { trace = () => {
  } } = {}) {
    if (!this.enabled) throw new Error("adminVerificationRequired");
    if (!this.#base) throw new Error("adminUnconfigured");
    let response;
    try {
      response = await fetch(`${this.#base}/admin-catalog-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionStorage.getItem(TOKEN_KEY)}` },
        body: JSON.stringify({ key, imageDataUrl: dataUrl2, action: "replace" })
      });
    } catch (error) {
      emitTrace(trace, "catalog_image_request_error", { errorType: error?.name || "UnknownError" });
      throw error;
    }
    emitTrace(trace, "catalog_image_response", { status: response.status, ok: response.ok });
    if (!response.ok) throw new Error("catalogImageUploadFailed");
    return `${this.#base}/catalog-image/${encodeURIComponent(key)}`;
  }
  async governance() {
    if (!this.enabled) throw new Error("adminVerificationRequired");
    const headers = { Authorization: `Bearer ${sessionStorage.getItem(TOKEN_KEY)}` };
    const [version, candidates, reports, pending] = await Promise.all([
      this.#probe("/catalog-version", {}),
      this.#probe("/admin-catalog-candidates", headers),
      this.#probe("/admin-catalog-reports", headers),
      this.#probe("/admin-catalog-pending-materializations", headers)
    ]);
    if (!candidates.ok || !reports.ok) throw new Error("catalogGovernanceUnavailable");
    return { version: version.payload?.version ?? null, candidates: candidates.payload?.candidates || [], reports: reports.payload?.reports || [], pending: pending.payload?.pending || [], candidateUnread: candidates.payload?.unreadCount || 0, reportUnread: reports.payload?.unreadCount || 0 };
  }
  async reviewCandidate(candidateId, action2, targetCanonicalKey = "", patch = null, options = {}) {
    return this.#governancePost("/admin-catalog-candidate", { candidateId, action: action2, targetCanonicalKey, patch, mutationId: action2 === "accept_new" ? `candidate-accept-${candidateId}` : void 0, ...options });
  }
  async researchCandidateImage(candidate) {
    if (!this.enabled) throw new Error("adminVerificationRequired");
    const response = await fetch(`${this.#base}/admin-catalog-image-candidate`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionStorage.getItem(TOKEN_KEY)}` }, body: JSON.stringify({ action: "research", key: candidate.proposedCanonicalKey, brand: candidate.brand, productName: candidate.nameEn, nameEn: candidate.nameEn, nameZh: candidate.nameZh, sku: candidate.sku, aliases: candidate.aliases || [] }) });
    if (!response.ok) throw new Error("catalogImageResearchFailed");
    return response.json();
  }
  async reviewReport(reportId, action2) {
    return this.#governancePost("/admin-catalog-report", { reportId, action: action2 });
  }
  async retryMaterialization(mutationId) {
    return this.#governancePost("/admin-catalog-retry-materialization", { mutationId });
  }
  async edit(key, patch, { trace = () => {
  } } = {}) {
    await this.#post({ action: "edit", key, patch }, trace);
    this.#catalog.updateAdminEdit(key, patch);
  }
  async merge(key, targetKey) {
    await this.#post({ action: "merge", key, targetKey });
    this.#catalog.mergeReferences(key, targetKey);
  }
  async delete(key, snapshot) {
    this.#catalog.deleteStandardToy(key);
    try {
      await this.#post({ action: "delete", key, sourceSnapshot: snapshot });
      return { deleted: true, synced: true };
    } catch (error) {
      this.#store.update((state) => {
        state.catalogState.syncMetadata.pendingAdminDeletes ||= [];
        if (!state.catalogState.syncMetadata.pendingAdminDeletes.includes(key)) state.catalogState.syncMetadata.pendingAdminDeletes.push(key);
      }, "catalog-delete-pending-sync");
      return { deleted: true, synced: false, error: error.message };
    }
  }
  async retryPendingDeletes() {
    if (!this.enabled || !this.#base) return;
    const pending = [...this.#store.state.catalogState.syncMetadata.pendingAdminDeletes || []];
    for (const key of pending) {
      try {
        await this.#post({ action: "delete", key, retry: true });
        this.#store.update((state) => {
          state.catalogState.syncMetadata.pendingAdminDeletes = (state.catalogState.syncMetadata.pendingAdminDeletes || []).filter((value) => value !== key);
        }, "catalog-delete-synced");
      } catch {
      }
    }
  }
  async #post(body, trace = () => {
  }) {
    if (!this.enabled) throw new Error("adminVerificationRequired");
    if (!this.#base) throw new Error("adminUnconfigured");
    let response;
    try {
      response = await fetch(`${this.#base}/admin-catalog`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionStorage.getItem(TOKEN_KEY)}` }, body: JSON.stringify({ ...body, mutationId: body.mutationId || crypto.randomUUID() }) });
    } catch (error) {
      emitTrace(trace, "catalog_update_request_error", { errorType: error?.name || "UnknownError" });
      throw error;
    }
    emitTrace(trace, "catalog_update_response", { status: response.status, ok: response.ok });
    if (!response.ok) throw new Error("adminOperationFailed");
    return response.json();
  }
  async #governancePost(path, body) {
    if (!this.enabled) throw new Error("adminVerificationRequired");
    if (!this.#base) throw new Error("adminUnconfigured");
    const response = await fetch(`${this.#base}${path}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionStorage.getItem(TOKEN_KEY)}` }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error("catalogGovernanceUpdateFailed");
    return response.json();
  }
  async #probe(path, headers) {
    try {
      const response = await fetch(`${this.#base}${path}`, { headers, cache: "no-store" });
      return { ok: response.ok, payload: response.ok ? await response.json().catch(() => ({})) : null };
    } catch {
      return { ok: false, payload: null };
    }
  }
};
function emitTrace(trace, stage, details) {
  try {
    trace?.(stage, details);
  } catch {
  }
}

// src/features/local-candidate-queue.js
function localCandidates(state) {
  return state?.catalogState?.syncMetadata?.localCandidates || [];
}
function pendingCandidates(state) {
  return localCandidates(state).filter((candidate) => ["pending", "reviewing"].includes(candidate.reviewStatus));
}
function pendingCandidateCount(state) {
  return pendingCandidates(state).length;
}
function visibleCandidates(state, { archived = false } = {}) {
  return localCandidates(state).filter((candidate) => archived ? Boolean(candidate.archivedAt) : !candidate.archivedAt);
}
function upsertLocalCandidate(state, payload) {
  state.catalogState ||= {};
  state.catalogState.syncMetadata ||= {};
  const queue = state.catalogState.syncMetadata.localCandidates ||= [];
  const index = queue.findIndex((candidate2) => candidate2.candidateId === payload.candidateId);
  const previous = index < 0 ? null : queue[index];
  const candidate = {
    candidateId: payload.candidateId,
    createdAt: previous?.createdAt || payload.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    source: payload.source || "recognition",
    candidateType: payload.candidateType || "new_product_candidate",
    reviewStatus: previous?.reviewStatus || payload.reviewStatus || "pending",
    proposedCanonicalKey: payload.proposedCanonicalKey || "",
    brand: payload.brand || "",
    productName: payload.productName || payload.nameEn || "",
    nameEn: payload.nameEn || payload.productName || "",
    nameZh: payload.nameZh || "",
    aliases: payload.aliases || [],
    sku: payload.sku || null,
    minAgeMonths: payload.minAgeMonths ?? null,
    maxAgeMonths: payload.maxAgeMonths ?? null,
    categoryCode: payload.categoryCode || "uncategorized",
    skillCodes: payload.skillCodes || [],
    playMechanics: payload.playMechanics || [],
    recognitionConfidence: payload.recognitionConfidence ?? null,
    possibleMatches: payload.possibleMatches || [],
    imageConsent: payload.imageConsent === true,
    // Image bytes belong in IndexedDB through imageRef.  Canonical state only
    // carries the typed reference needed by the local review UI.
    reviewAttachment: payload.imageConsent === true && typeof payload.reviewAttachment === "string" && !/^data:|^blob:/i.test(payload.reviewAttachment) ? payload.reviewAttachment : null,
    reviewAttachmentRef: payload.imageConsent === true ? immutableAttachmentRef(payload.reviewAttachmentRef || previous?.reviewAttachmentRef) : null,
    linkedLocalToyId: payload.linkedLocalToyId || previous?.linkedLocalToyId || null,
    linkedWishlistId: payload.linkedWishlistId || previous?.linkedWishlistId || null,
    archivedAt: previous?.archivedAt || null,
    reviewHistory: previous?.reviewHistory || [],
    syncStatus: payload.syncStatus || previous?.syncStatus || "pending_local",
    mutationId: payload.mutationId || previous?.mutationId || payload.candidateId
  };
  if (index < 0) queue.unshift(candidate);
  else queue[index] = candidate;
  return candidate;
}
function immutableAttachmentRef(ref) {
  if (!ref || typeof ref !== "object") return null;
  if (ref.kind === "remote" && typeof ref.url === "string") return { kind: "remote", url: ref.url };
  if ((ref.kind === "personal" || ref.kind === "catalog") && typeof ref.id === "string") return { kind: ref.kind, id: ref.id };
  return null;
}
function setLocalCandidateStatus(state, candidateId, reviewStatus) {
  const candidate = localCandidates(state).find((entry) => entry.candidateId === candidateId);
  if (!candidate) return null;
  const now3 = (/* @__PURE__ */ new Date()).toISOString();
  candidate.reviewStatus = reviewStatus;
  candidate.updatedAt = now3;
  if (["approved", "linked", "rejected"].includes(reviewStatus)) candidate.reviewedAt = now3;
  return candidate;
}
function archiveLocalCandidate(state, candidateId, now3 = (/* @__PURE__ */ new Date()).toISOString()) {
  const candidate = localCandidates(state).find((entry) => entry.candidateId === candidateId);
  if (!candidate || !["approved", "linked", "rejected"].includes(candidate.reviewStatus)) return null;
  candidate.archivedAt = now3;
  candidate.updatedAt = now3;
  return candidate;
}
function unarchiveLocalCandidate(state, candidateId, now3 = (/* @__PURE__ */ new Date()).toISOString()) {
  const candidate = localCandidates(state).find((entry) => entry.candidateId === candidateId);
  if (!candidate?.archivedAt) return null;
  candidate.archivedAt = null;
  candidate.updatedAt = now3;
  return candidate;
}
function reopenLocalCandidateReview(state, candidateId, now3 = (/* @__PURE__ */ new Date()).toISOString()) {
  const candidate = localCandidates(state).find((entry) => entry.candidateId === candidateId);
  if (!candidate || !["approved", "linked", "rejected"].includes(candidate.reviewStatus)) return null;
  candidate.reviewHistory ||= [];
  candidate.reviewHistory.push({ previousStatus: candidate.reviewStatus, reviewedAt: candidate.reviewedAt || candidate.updatedAt || candidate.createdAt || null, reopenedAt: now3, linkedCanonicalKey: candidate.linkedCanonicalKey || null, resolutionReason: candidate.resolutionReason || null });
  candidate.reviewStatus = "reviewing";
  candidate.archivedAt = null;
  candidate.updatedAt = now3;
  return candidate;
}

// src/features/recognition-service.js
var RecognitionService = class {
  #store;
  #images;
  #catalog;
  #base;
  #governance;
  #diagnostic;
  #submissions = /* @__PURE__ */ new Map();
  #completed = /* @__PURE__ */ new Map();
  constructor({ store: store2, images: images2, catalog: catalog2 = null, governance: governance2 = null, baseUrl = "", diagnostic = null }) {
    this.#store = store2;
    this.#images = images2;
    this.#catalog = catalog2;
    this.#governance = governance2;
    this.#diagnostic = diagnostic;
    this.#base = String(baseUrl || window.TOY_ROTATION_CONFIG?.API_BASE || "").replace(/\/+$/, "");
  }
  async createDraft(file, setMode = "auto", { onPersisted = null } = {}) {
    if (!this.#base) throw new RecognitionError("recognitionServiceUnconfigured");
    const image = await dataUrl(file);
    const id = crypto.randomUUID();
    const imageRef = await this.#images.savePersonal(image, `draft-${id}`);
    const draft = { id, status: "queued", imageRef, setMode, productName: "", brand: "", categoryCode: "uncategorized", skillCodes: [], playMechanics: [], minAgeMonths: null, maxAgeMonths: null, isSet: false, children: [], error: null, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
    this.#store.update((state) => state.drafts.unshift(draft), "recognition-queued");
    onPersisted?.(draft.id);
    setTimeout(() => {
      void this.analyze(draft.id, { image });
    }, 0);
    return draft.id;
  }
  async analyze(id, { force = false, image: preloadedImage = null } = {}) {
    const draft = this.#store.state.drafts.find((item) => item.id === id);
    if (!draft) return;
    if (!this.#base) return this.#setError(id, "recognitionServiceUnconfigured");
    this.#store.update((state) => {
      const item = state.drafts.find((x) => x.id === id);
      item.status = "processing";
      item.error = null;
    }, "recognition-start");
    try {
      const image = preloadedImage || await this.#images.resolve(draft.imageRef);
      if (!image) throw new RecognitionError("recognitionImageUnavailable");
      const requestId = crypto.randomUUID();
      const response = await requestRecognition(`${this.#base}/analyze-batch`, {
        items: [{ id, image }],
        deviceId: deviceId(),
        locale: appLocale(this.#store),
        setMode: draft.setMode,
        forceRefresh: force,
        testMode: Boolean(globalThis.TOY_ROTATION_CONFIG?.TEST_MODE),
        clientRequestId: requestId
      });
      const result2 = (response.payload.results || response.payload.items || [])[0];
      if (!result2) throw new RecognitionError("recognitionNoResult");
      const normalized2 = normalizeDraft(result2);
      const decision = this.#catalog?.resolveRecognition(normalized2) || { kind: "genuinely_new", canonicalKey: canonicalKey(`${normalized2.brand}-${normalized2.productName}`) };
      const catalogMatch = decision.catalog || null;
      const owned = catalogMatch ? findOwnedToy(catalogMatch, this.#store.state.toys || []) : null;
      const status = owned ? "already_owned" : decision.kind === "catalog_match" ? "ready" : decision.kind === "genuinely_new" ? "ready_catalog_unmatched" : decision.kind;
      const diagnostics = recognitionDiagnostics({ requestId, response, catalogMatch, catalogDecision: decision.kind, result: "received" });
      this.#store.update((state) => {
        const item = state.drafts.find((x) => x.id === id);
        if (!item) return;
        Object.assign(item, normalized2, { status, imageRef: draft.imageRef, catalogMatch: catalogMatch ? catalogSummary(catalogMatch) : null, ownedToyId: owned?.id || null, duplicateCandidates: (decision.conflicts || []).map((match) => catalogSummary(match.b)), diagnostics });
      }, "recognition-ready");
    } catch (error) {
      this.#setError(id, normalizeErrorCode(error), error.diagnostics || null);
    }
  }
  async confirm(id, { destination = "library" } = {}) {
    const completed = this.#completed.get(id);
    if (completed) {
      recognitionTrace("duplicate_click_blocked", { recognitionDraftId: id, destination });
      return completed;
    }
    if (this.#submissions.has(id)) {
      recognitionTrace("inflight_reused", { recognitionDraftId: id, destination });
      return this.#submissions.get(id);
    }
    const draft = this.#store.state.drafts.find((item) => item.id === id);
    this.#diagnostic?.state("confirm_enter", this.#store.state, { draftId: id, destination, draftStatus: draft?.status || null });
    if (!draft || !String(draft.status).startsWith("ready")) return;
    const operation = (async () => {
      recognitionTrace("submit_started", { recognitionDraftId: id, destination, canonicalProposal: draft.canonicalKey || null });
      this.#diagnostic?.record("confirm_destination", { draftId: id, destination });
      try {
        const result2 = await this.#commit(draft, { destination });
        this.#completed.set(id, result2);
        this.#diagnostic?.state("confirm_commit_completed", this.#store.state, { draftId: id, destination, localToyId: result2?.toy?.id || null, wishlistId: result2?.wishlist?.id || null });
        return result2;
      } catch (error) {
        this.#diagnostic?.record("confirm_persist_failed", { draftId: id, destination, error: normalizeErrorCode(error) });
        throw error;
      }
    })();
    this.#submissions.set(id, operation);
    try {
      return await operation;
    } finally {
      this.#submissions.delete(id);
    }
  }
  async #commit(idDraft, { destination = "library" } = {}) {
    const draft = idDraft;
    const id = draft.id;
    recognitionTrace("existing_toy_lookup", { recognitionDraftId: id, destination, canonicalProposal: draft.canonicalKey || null });
    if (destination === "wishlist") return this.#confirmWishlist(draft);
    this.#diagnostic?.record("identity_resolution_started", { draftId: id, destination });
    const decision = draft.resolutionOverride === "genuinely_new" ? { kind: "genuinely_new", canonicalKey: canonicalKey(draft.canonicalKey || `${draft.brand}-${draft.productName}`) } : this.#catalog?.resolveRecognition(draft) || { kind: "genuinely_new" };
    this.#diagnostic?.record("identity_resolution_completed", { draftId: id, destination, kind: decision.kind, existingCatalogMatch: decision.kind === "catalog_match", ambiguous: decision.kind === "duplicate_review_required", genuinelyNew: decision.kind === "genuinely_new" });
    if (decision.kind === "tombstoned") return this.#setDecision(id, decision);
    return this.#atomicLibraryCommit(draft, decision);
    let catalog2 = decision.catalog, governanceCandidateId = null, candidatePayload = null;
    if (!catalog2) {
      const key = canonicalKey(draft.canonicalKey || `${draft.brand}-${draft.productName}`);
      catalog2 = { ...draft, canonicalKey: key, productName: draft.productName, names: draft.names, imageRef: null, catalogStatus: "provisional" };
      const candidateType = draft.candidateTypeOverride === "identity_review_candidate" || decision.kind === "duplicate_review_required" ? "identity_review_candidate" : "new_product_candidate";
      const payload = { candidateId: `candidate-${draft.id}`, source: "recognition", candidateType, proposedCanonicalKey: key, brand: draft.brand, productName: draft.productName, nameEn: draft.names?.en || draft.productName, nameZh: draft.names?.zh || "", aliases: draft.aliases || [], sku: draft.sku, minAgeMonths: draft.minAgeMonths, maxAgeMonths: draft.maxAgeMonths, categoryCode: draft.categoryCode, skillCodes: draft.skillCodes, playMechanics: draft.playMechanics, recognitionConfidence: draft.confidence, possibleMatches: (decision.conflicts || []).map((match) => catalogSummary(match.b)), imageConsent: draft.imageConsent === true, reviewAttachment: null, reviewAttachmentRef: draft.imageConsent === true ? draft.imageRef : null, appVersion: globalThis.TOY_ROTATION_CONFIG?.RELEASE || "" };
      governanceCandidateId = payload.candidateId;
      candidatePayload = payload;
    }
    const reviewedSource = { ...catalog2, brand: draft.brand || catalog2.brand, productName: draft.productName || catalog2.productName, names: draft.names || catalog2.names, sku: draft.sku || catalog2.sku, categoryCode: draft.categoryCode || catalog2.categoryCode, skillCodes: draft.skillCodes || catalog2.skillCodes, playMechanics: draft.playMechanics || catalog2.playMechanics, minAgeMonths: draft.minAgeMonths ?? catalog2.minAgeMonths, maxAgeMonths: draft.maxAgeMonths ?? catalog2.maxAgeMonths, rotationValue: draft.rotationValue || "medium", notes: draft.notes || "", rotationParticipation: draft.reviewRotationState === "paused" ? "paused" : "active", shelfMode: draft.reviewRotationState === "permanent" ? "permanent" : "rotate", permanentSource: draft.reviewRotationState === "permanent" ? "user" : null, pauseReason: draft.reviewRotationState === "paused" ? draft.pauseReason || "" : "", pauseReasonCode: draft.reviewRotationState === "paused" ? draft.pauseReasonCode || null : null };
    this.#diagnostic?.state("toy_lookup_started", this.#store.state, { draftId: id });
    recognitionTrace("toy_create_started", { recognitionDraftId: id, destination });
    const result2 = createCatalogOwnership(this.#store, reviewedSource, draft.imageRef, { reason: "recognition-confirm" });
    this.#diagnostic?.state(result2.added ? "toy_created" : "toy_existing_reused", this.#store.state, { draftId: id, localToyId: result2.toy?.id || null });
    if (!result2.added) return this.#markAlreadyOwned(id, result2.toy);
    recognitionTrace("toy_created", { recognitionDraftId: id, destination, localToyId: result2.toy.id });
    recognitionTrace("ownership_written", { recognitionDraftId: id, destination, localToyId: result2.toy.id });
    if (governanceCandidateId) this.#store.update((state) => {
      const toy = state.toys.find((item) => item.id === result2.toy.id);
      if (toy) toy.governanceCandidateId = governanceCandidateId;
    }, "recognition-governance-candidate-link");
    if (candidatePayload) {
      this.#diagnostic?.state("candidate_required_decided", this.#store.state, { draftId: id, candidateId: governanceCandidateId, linkedLocalToyId: result2.toy.id });
      recognitionTrace("candidate_required", { recognitionDraftId: id, destination, localToyId: result2.toy.id, candidateId: governanceCandidateId });
      recognitionTrace("candidate_create_started", { recognitionDraftId: id, destination, localToyId: result2.toy.id, candidateId: governanceCandidateId });
      this.#diagnostic?.record("candidate_create_requested", { draftId: id, candidateId: governanceCandidateId });
      this.#governance?.createLocalCandidate({ ...candidatePayload, linkedLocalToyId: result2.toy.id });
      this.#diagnostic?.state("candidate_persist_completed", this.#store.state, { draftId: id, candidateId: governanceCandidateId, linkedLocalToyId: result2.toy.id });
      recognitionTrace("candidate_created", { recognitionDraftId: id, destination, localToyId: result2.toy.id, candidateId: governanceCandidateId });
      void this.#governance?.flushOutbox();
    } else this.#diagnostic?.record("candidate_create_skipped", { draftId: id, reason: "catalog_match" });
    this.#catalog?.ensureSetChildren();
    this.#store.update((state) => {
      state.drafts = state.drafts.filter((item) => item.id !== id);
    }, "recognition-confirmed");
    return { kind: "created", toy: result2.toy, catalog: catalog2, learned: decision.kind !== "catalog_match" };
  }
  async #atomicLibraryCommit(draft, decision) {
    const catalog2 = decision.catalog || { ...draft, canonicalKey: canonicalKey(draft.canonicalKey || `${draft.brand}-${draft.productName}`), catalogStatus: "provisional" };
    const candidateId = decision.catalog ? null : `candidate-${draft.id}`;
    const reviewed = { ...catalog2, brand: draft.brand || catalog2.brand, productName: draft.productName || catalog2.productName, names: draft.names || catalog2.names, sku: draft.sku || catalog2.sku, categoryCode: draft.categoryCode || catalog2.categoryCode, skillCodes: draft.skillCodes || catalog2.skillCodes, playMechanics: draft.playMechanics || catalog2.playMechanics, minAgeMonths: draft.minAgeMonths ?? catalog2.minAgeMonths, maxAgeMonths: draft.maxAgeMonths ?? catalog2.maxAgeMonths, rotationValue: draft.rotationValue || "medium", notes: draft.notes || "", rotationParticipation: draft.reviewRotationState === "paused" ? "paused" : "active", shelfMode: draft.reviewRotationState === "permanent" ? "permanent" : "rotate", permanentSource: draft.reviewRotationState === "permanent" ? "user" : null, pauseReason: draft.reviewRotationState === "paused" ? draft.pauseReason || "" : "", pauseReasonCode: draft.reviewRotationState === "paused" ? draft.pauseReasonCode || null : null };
    const existing = findOwnedToy(reviewed, this.#store.state.toys || []);
    if (existing) return this.#markAlreadyOwned(draft.id, existing);
    const toy = normalizeToy({ ...reviewed, imageRef: draft.imageRef, governanceCandidateId: candidateId });
    const candidate = candidateId ? { candidateId, source: "recognition", candidateType: draft.candidateTypeOverride === "identity_review_candidate" || decision.kind === "duplicate_review_required" ? "identity_review_candidate" : "new_product_candidate", proposedCanonicalKey: catalog2.canonicalKey, brand: draft.brand, productName: draft.productName, nameEn: draft.names?.en || draft.productName, nameZh: draft.names?.zh || "", aliases: draft.aliases || [], sku: draft.sku, minAgeMonths: draft.minAgeMonths, maxAgeMonths: draft.maxAgeMonths, categoryCode: draft.categoryCode, skillCodes: draft.skillCodes, playMechanics: draft.playMechanics, recognitionConfidence: draft.confidence, possibleMatches: (decision.conflicts || []).map((match) => catalogSummary(match.b)), imageConsent: draft.imageConsent === true, reviewAttachmentRef: draft.imageConsent === true ? draft.imageRef : null, linkedLocalToyId: toy.id, appVersion: globalThis.TOY_ROTATION_CONFIG?.RELEASE || "" } : null;
    this.#store.update((state) => {
      if (findOwnedToy(reviewed, state.toys || [])) throw new RecognitionError("recognitionAlreadyOwned");
      state.toys.push(toy);
      if (candidate) upsertLocalCandidate(state, candidate);
      state.drafts = state.drafts.filter((item) => item.id !== draft.id);
    }, "recognition-atomic-confirm");
    if (candidate) {
      this.#diagnostic?.record("candidate_persist_completed", { draftId: draft.id, candidateId, linkedLocalToyId: toy.id });
      try {
        Promise.resolve(this.#governance?.enqueueRemoteCandidate?.(candidate)).catch((error) => this.#diagnostic?.record("remote_candidate_enqueue_failed", { message: error?.message || String(error) }));
      } catch (error) {
        this.#diagnostic?.record("remote_candidate_enqueue_failed", { message: error?.message || String(error) });
      }
    }
    this.#catalog?.ensureSetChildren();
    return { kind: "created", toy, catalog: catalog2, learned: decision.kind !== "catalog_match" };
  }
  async #atomicWishlistCommit(draft, decision) {
    const catalog2 = decision.catalog || null;
    const snapshot = { ...catalog2 || draft, canonicalKey: catalog2?.canonicalKey || canonicalKey(draft.canonicalKey || `${draft.brand}-${draft.productName}`), brand: draft.brand || catalog2?.brand, productName: draft.productName || catalog2?.productName, names: draft.names || catalog2?.names, sku: draft.sku || catalog2?.sku, categoryCode: draft.categoryCode || catalog2?.categoryCode, skillCodes: draft.skillCodes || catalog2?.skillCodes, playMechanics: draft.playMechanics || catalog2?.playMechanics, minAgeMonths: draft.minAgeMonths ?? catalog2?.minAgeMonths, maxAgeMonths: draft.maxAgeMonths ?? catalog2?.maxAgeMonths, imageRef: draft.imageRef };
    let item = null;
    const candidateId = catalog2 ? null : `candidate-${draft.id}`;
    this.#store.update((state) => {
      const existing = state.wishlist.find((entry) => canonicalKey(entry.canonicalKey) === snapshot.canonicalKey);
      if (existing) {
        item = existing;
        return;
      }
      item = { id: crypto.randomUUID(), canonicalKey: snapshot.canonicalKey, catalogId: catalog2?.id || null, catalogSnapshot: snapshot, status: "want", priority: draft.wishlistPriority || "medium", notes: draft.wishlistNotes || draft.notes || "", recognizedMetadata: { confidence: draft.confidence ?? null, diagnostics: draft.diagnostics || null }, addedAt: (/* @__PURE__ */ new Date()).toISOString() };
      state.wishlist.push(item);
      if (candidateId) upsertLocalCandidate(state, { candidateId, source: "recognition", candidateType: "new_product_candidate", proposedCanonicalKey: snapshot.canonicalKey, brand: draft.brand, productName: draft.productName, nameEn: draft.names?.en || draft.productName, nameZh: draft.names?.zh || "", aliases: draft.aliases || [], sku: draft.sku, minAgeMonths: draft.minAgeMonths, maxAgeMonths: draft.maxAgeMonths, categoryCode: draft.categoryCode, skillCodes: draft.skillCodes, playMechanics: draft.playMechanics, recognitionConfidence: draft.confidence, imageConsent: draft.imageConsent === true, reviewAttachmentRef: draft.imageConsent === true ? draft.imageRef : null, linkedWishlistId: item.id, appVersion: globalThis.TOY_ROTATION_CONFIG?.RELEASE || "" });
      state.drafts = state.drafts.filter((entry) => entry.id !== draft.id);
    }, "recognition-atomic-wishlist");
    return { kind: item ? "wishlisted" : "already_wishlisted", wishlist: item, catalog: catalog2 };
  }
  async #confirmWishlist(draft) {
    const decision = draft.resolutionOverride === "genuinely_new" ? { kind: "genuinely_new", canonicalKey: canonicalKey(draft.canonicalKey || `${draft.brand}-${draft.productName}`) } : this.#catalog?.resolveRecognition(draft) || { kind: "genuinely_new" };
    if (decision.kind === "tombstoned") return this.#setDecision(draft.id, decision);
    const catalog2 = decision.catalog || null;
    return this.#atomicWishlistCommit(draft, decision);
    const snapshot = { ...catalog2 || draft, canonicalKey: catalog2?.canonicalKey || canonicalKey(draft.canonicalKey || `${draft.brand}-${draft.productName}`), brand: draft.brand || catalog2?.brand, productName: draft.productName || catalog2?.productName, names: draft.names || catalog2?.names, sku: draft.sku || catalog2?.sku, categoryCode: draft.categoryCode || catalog2?.categoryCode, skillCodes: draft.skillCodes || catalog2?.skillCodes, playMechanics: draft.playMechanics || catalog2?.playMechanics, minAgeMonths: draft.minAgeMonths ?? catalog2?.minAgeMonths, maxAgeMonths: draft.maxAgeMonths ?? catalog2?.maxAgeMonths, imageRef: draft.imageRef };
    let item;
    this.#store.update((state) => {
      const existing = state.wishlist.find((entry) => canonicalKey(entry.canonicalKey) === snapshot.canonicalKey);
      if (existing) {
        item = existing;
        return;
      }
      item = { id: crypto.randomUUID(), canonicalKey: snapshot.canonicalKey, catalogId: catalog2?.id || null, catalogSnapshot: snapshot, status: "want", priority: draft.wishlistPriority || "medium", notes: draft.wishlistNotes || draft.notes || "", recognizedMetadata: { confidence: draft.confidence ?? null, diagnostics: draft.diagnostics || null }, addedAt: (/* @__PURE__ */ new Date()).toISOString() };
      state.wishlist.push(item);
      state.drafts = state.drafts.filter((entry) => entry.id !== draft.id);
    }, "recognition-confirm-wishlist");
    if (!catalog2 && item) {
      const key = canonicalKey(draft.canonicalKey || `${draft.brand}-${draft.productName}`);
      const payload = { candidateId: `candidate-${draft.id}`, source: "recognition", candidateType: "new_product_candidate", proposedCanonicalKey: key, brand: draft.brand, productName: draft.productName, nameEn: draft.names?.en || draft.productName, nameZh: draft.names?.zh || "", aliases: draft.aliases || [], sku: draft.sku, minAgeMonths: draft.minAgeMonths, maxAgeMonths: draft.maxAgeMonths, categoryCode: draft.categoryCode, skillCodes: draft.skillCodes, playMechanics: draft.playMechanics, recognitionConfidence: draft.confidence, imageConsent: draft.imageConsent === true, reviewAttachment: null, reviewAttachmentRef: draft.imageConsent === true ? draft.imageRef : null, linkedWishlistId: item.id, appVersion: globalThis.TOY_ROTATION_CONFIG?.RELEASE || "" };
      this.#governance?.createLocalCandidate(payload);
      void this.#governance?.flushOutbox();
    }
    return { kind: item ? "wishlisted" : "already_wishlisted", wishlist: item, catalog: catalog2 };
  }
  async resolveDuplicateReview(id, choice) {
    const draft = this.#store.state.drafts.find((item) => item.id === id);
    if (!draft || draft.status !== "duplicate_review_required") return;
    if (choice === "not_same") {
      this.#store.update((state) => {
        const item = state.drafts.find((x) => x.id === id);
        if (item) {
          item.status = "ready_catalog_unmatched";
          item.resolutionOverride = "genuinely_new";
          item.candidateTypeOverride = "identity_review_candidate";
        }
      }, "recognition-duplicate-review-not-same");
      return;
    }
    const candidate = this.#catalog?.getByKey(draft.duplicateCandidates?.[0]?.canonicalKey);
    if (!candidate) return this.#setError(id, "recognitionCatalogResolutionFailed");
    this.#store.update((state) => {
      const item = state.drafts.find((entry) => entry.id === id);
      if (item) {
        item.status = "ready";
        item.catalogMatch = catalogSummary(candidate);
        item.resolutionOverride = null;
        item.duplicateCandidates = [];
      }
    }, "recognition-duplicate-review-resolved");
  }
  async remove(id) {
    const draft = this.#store.state.drafts.find((item) => item.id === id);
    this.#store.update((state) => {
      state.drafts = state.drafts.filter((item) => item.id !== id);
    }, "recognition-remove");
    if (draft?.imageRef?.kind === "personal") await this.#images.removePersonal(draft.imageRef);
  }
  #setError(id, error, diagnostics) {
    this.#store.update((state) => {
      const item = state.drafts.find((x) => x.id === id);
      if (item) {
        item.status = "error";
        item.error = error;
        if (diagnostics) item.diagnostics = diagnostics;
      }
    }, "recognition-error");
  }
  #setDecision(id, decision) {
    this.#store.update((state) => {
      const item = state.drafts.find((x) => x.id === id);
      if (!item) return;
      item.status = decision.kind;
      item.error = decision.kind === "tombstoned" ? "recognitionCatalogTombstoned" : null;
      item.duplicateCandidates = (decision.conflicts || []).map((match) => catalogSummary(match.b));
    }, "recognition-catalog-decision");
  }
  #markAlreadyOwned(id, toy) {
    this.#store.update((state) => {
      const item = state.drafts.find((x) => x.id === id);
      if (item) {
        item.status = "already_owned";
        item.ownedToyId = toy?.id || null;
        item.catalogMatch = catalogSummary(toy);
      }
    }, "recognition-already-owned");
    return { kind: "already_owned", toy };
  }
};
function recognitionTrace(stage, detail = {}) {
  const trace = globalThis.__TOY_ROTATION_RECOGNITION_SAVE_TRACE__ ||= [];
  trace.push({ stage, timestamp: (/* @__PURE__ */ new Date()).toISOString(), ...detail });
  if (trace.length > 120) trace.splice(0, trace.length - 120);
}
var DEVICE_ID_KEY = "toyRotation.cleanBaseline.deviceId";
var REQUEST_TIMEOUT_MS = 3e4;
var RecognitionError = class extends Error {
  constructor(code, detail = "", diagnostics = null) {
    super(detail || code);
    this.code = code;
    this.diagnostics = diagnostics;
  }
};
function normalizeErrorCode(error) {
  const message = String(error?.message || "");
  if (error?.name === "QuotaExceededError" || error?.code === 22 || /quota\s+has\s+been\s+exceeded|quotaexceeded/i.test(message)) return "storageQuotaExceeded";
  return error?.code && typeof error.code === "string" ? error.code : message || "recognitionFailed";
}
function deviceId() {
  try {
    const current = globalThis.localStorage?.getItem(DEVICE_ID_KEY);
    if (current) return current;
    const created = `device-${crypto.randomUUID()}`;
    globalThis.localStorage?.setItem(DEVICE_ID_KEY, created);
    return created;
  } catch {
    return `device-${crypto.randomUUID()}`;
  }
}
function appLocale(store2) {
  const requested = store2.state.settings?.language;
  if (requested === "zh" || requested === "en") return requested;
  return globalThis.navigator?.language?.startsWith("zh") ? "zh" : "en";
}
async function requestRecognition(url, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const startedAt = performance.now();
  try {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: controller.signal });
    const payload = await response.json().catch(() => null);
    const diagnostics = { clientRequestId: body.clientRequestId, deviceIdPresent: Boolean(body.deviceId), httpStatus: response.status, durationMs: Math.round(performance.now() - startedAt), provider: payload?.provider?.status || payload?.providerStatus || (response.ok ? "not_reported" : "not_entered"), quota: payload?.quota ?? "not_reported", requestResult: response.ok ? "response_received" : "http_error" };
    if (!response.ok) throw new RecognitionError(errorCodeForResponse(response.status, payload), payload?.error || payload?.message || "", diagnostics);
    if (!payload || typeof payload !== "object") throw new RecognitionError("recognitionInvalidResponse", "", diagnostics);
    return { payload, diagnostics };
  } catch (error) {
    if (error instanceof RecognitionError) throw error;
    const diagnostics = { clientRequestId: body.clientRequestId, deviceIdPresent: Boolean(body.deviceId), httpStatus: null, durationMs: Math.round(performance.now() - startedAt), provider: "not_entered", quota: "not_reported", requestResult: error?.name === "AbortError" ? "timeout" : "network_error" };
    if (error?.name === "AbortError") throw new RecognitionError("recognitionTimeout", "", diagnostics);
    throw new RecognitionError("recognitionNetworkError", error?.message || "", diagnostics);
  } finally {
    clearTimeout(timeout);
  }
}
function recognitionDiagnostics({ requestId, response, catalogMatch, catalogDecision, result: result2 }) {
  return { ...response.diagnostics, clientRequestId: requestId, result: result2, catalogDecision, catalogMatch: catalogMatch ? catalogSummary(catalogMatch) : null };
}
function errorCodeForResponse(status, payload) {
  if (status === 400 && /deviceId/i.test(String(payload?.error || payload?.message || ""))) return "recognitionDeviceIdRequired";
  if (status === 401 || status === 403) return "recognitionUnauthorized";
  if (status === 429) return "recognitionQuotaExceeded";
  return "recognitionFailed";
}
function catalogSummary(toy) {
  return toy ? { canonicalKey: toy.canonicalKey, brand: toy.brand, productName: toy.productName, names: toy.names || { en: toy.nameEn || "", zh: toy.nameZh || "" }, sku: toy.sku || null } : null;
}
function normalizeDraft(result2) {
  const source = result2.confirmed || result2.toy || result2;
  return { canonicalKey: source.canonicalKey || source.catalogKey || source.key || "", sku: source.sku || source.productCode || source.modelNumber || source.variantCode || null, brand: source.brand || "", productName: source.productName || source.name || "", names: { en: source.nameEn || source.name || "", zh: source.nameZh || "" }, aliases: source.aliases || [], categoryCode: source.categoryCode || source.category || "uncategorized", skillCodes: source.skillCodes || source.skills || [], playMechanics: source.playMechanics || [], minAgeMonths: source.minAgeMonths ?? source.ageMinMonths ?? null, maxAgeMonths: source.maxAgeMonths ?? source.ageMaxMonths ?? null, rotationValue: source.rotationValue || "medium", isSet: !!source.isSet, children: source.children || [], confidence: source.confidence ?? null, notes: source.notes || "" };
}
function dataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// src/features/catalog-report-store.js
var REPORT_STATUSES = /* @__PURE__ */ new Set(["pending", "reviewing", "resolved", "dismissed"]);
function reportsContainer(state) {
  state.catalogState ||= {};
  return state.catalogState.catalogReports ||= [];
}
function getCatalogReports(state) {
  return state?.catalogState?.catalogReports || [];
}
function getPendingCatalogReports(state) {
  return getCatalogReports(state).filter((report) => ["pending", "reviewing"].includes(report.status));
}
function getCatalogReportById(state, id) {
  return getCatalogReports(state).find((report) => report.id === id) || null;
}
function createCatalogReport(state, payload = {}) {
  const queue = reportsContainer(state);
  const id = String(payload.id || payload.reportId || crypto.randomUUID());
  const existing = queue.find((report2) => report2.id === id);
  if (existing) {
    if (!existing.attachmentRef && payload.attachmentRef) {
      existing.attachmentRef = payload.attachmentRef;
      existing.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    }
    return existing;
  }
  const now3 = payload.createdAt || (/* @__PURE__ */ new Date()).toISOString();
  const report = {
    id,
    catalogCanonicalKey: canonicalKey(payload.catalogCanonicalKey || payload.canonicalKey),
    issueType: String(payload.issueType || payload.reportType || "other"),
    note: String(payload.note ?? payload.description ?? "").slice(0, 1200),
    status: REPORT_STATUSES.has(payload.status) ? payload.status : "pending",
    createdAt: now3,
    updatedAt: payload.updatedAt || now3,
    reviewStartedAt: payload.reviewStartedAt || null,
    resolvedAt: payload.resolvedAt || null,
    resolutionType: payload.resolutionType || null,
    resolutionReason: payload.resolutionReason || null,
    // Bytes live in IndexedDB. This is deliberately the only attachment field
    // persisted in canonical state and the transport intent.
    attachmentRef: payload.attachmentRef || null,
    syncStatus: payload.syncStatus || "pending_local",
    remoteSyncReference: payload.remoteSyncReference || null,
    source: payload.source || "catalog_report",
    deviceIdPresent: payload.deviceIdPresent === true,
    catalogVersion: Number(payload.catalogVersion || 0),
    appVersion: String(payload.appVersion || "")
  };
  queue.unshift(report);
  return report;
}
function enqueueCatalogReportSyncIntent(state, report) {
  state.catalogState ||= {};
  state.catalogState.syncMetadata ||= {};
  const outbox = state.catalogState.syncMetadata.governanceOutbox ||= [];
  const id = report.id;
  if (!outbox.some((job) => job.id === id && job.kind === "report")) {
    outbox.push({
      id,
      kind: "report",
      createdAt: report.createdAt,
      payload: {
        reportId: report.id,
        canonicalKey: report.catalogCanonicalKey,
        reportType: report.issueType,
        description: report.note,
        attachmentRef: report.attachmentRef,
        attachmentTransport: report.attachmentRef ? "deferred_until_remote_contract_updated" : "none",
        catalogVersion: report.catalogVersion,
        appVersion: report.appVersion
      }
    });
  }
  return report;
}
function startCatalogReportReview(state, id) {
  const report = getCatalogReportById(state, id);
  if (!report || report.status !== "pending") return report;
  const now3 = (/* @__PURE__ */ new Date()).toISOString();
  report.status = "reviewing";
  report.reviewStartedAt = now3;
  report.updatedAt = now3;
  return report;
}
function resolveCatalogReport(state, id, { reason: reason2 = null } = {}) {
  return finishCatalogReport(state, id, "resolved", "resolved", reason2);
}
function dismissCatalogReport(state, id, { reason: reason2 = null } = {}) {
  return finishCatalogReport(state, id, "dismissed", "dismissed", reason2);
}
function finishCatalogReport(state, id, status, resolutionType, reason2) {
  const report = getCatalogReportById(state, id);
  if (!report || !["pending", "reviewing"].includes(report.status)) return report;
  const now3 = (/* @__PURE__ */ new Date()).toISOString();
  report.status = status;
  report.resolvedAt = now3;
  report.updatedAt = now3;
  report.resolutionType = resolutionType;
  report.resolutionReason = reason2 ? String(reason2).slice(0, 500) : null;
  return report;
}
function legacyReportId(job = {}) {
  const payload = job.payload || {};
  if (payload.reportId) return String(payload.reportId);
  const identity = JSON.stringify({ id: job.id || "", canonicalKey: payload.canonicalKey || "", reportType: payload.reportType || "", description: payload.description || "", createdAt: job.createdAt || "" });
  let hash = 2166136261;
  for (const char of identity) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `legacy-report-${(hash >>> 0).toString(36)}`;
}
function legacyReportPayload(job, attachmentRef = null) {
  const payload = job.payload || {};
  return {
    id: legacyReportId(job),
    canonicalKey: payload.canonicalKey,
    reportType: payload.reportType,
    description: payload.description,
    status: payload.status,
    createdAt: payload.createdAt || job.createdAt,
    attachmentRef,
    catalogVersion: payload.catalogVersion,
    appVersion: payload.appVersion,
    syncStatus: "pending_remote"
  };
}
function hasRawAttachment(payload = {}) {
  return typeof payload.optionalAttachment === "string" && /^data:image\//i.test(payload.optionalAttachment);
}

// src/features/shared-catalog-governance.js
var SharedCatalogGovernance = class {
  #store;
  #catalog;
  #base;
  #diagnostic;
  #images;
  constructor({ store: store2, catalog: catalog2, images: images2 = null, baseUrl = "", diagnostic = null }) {
    this.#store = store2;
    this.#catalog = catalog2;
    this.#images = images2;
    this.#base = String(baseUrl || "").replace(/\/$/, "");
    this.#diagnostic = diagnostic;
    globalThis.addEventListener?.("online", () => {
      void this.flushOutbox();
      void this.syncInBackground();
    });
  }
  async syncInBackground() {
    this.#diagnostic?.record("remote_candidate_sync_requested", {});
    if (!this.#base || !navigator.onLine) {
      this.#diagnostic?.record("remote_candidate_sync_skipped", { baseConfigured: Boolean(this.#base), online: navigator.onLine });
      return { skipped: true };
    }
    this.#diagnostic?.record("remote_candidate_sync_started", {});
    const local = Number(this.#store.state.catalogState?.syncMetadata?.lastAppliedRemoteCatalogVersion || 0);
    const version = await this.#get("/catalog-version");
    if (!version || Number(version.version) <= local) {
      this.#diagnostic?.record("remote_candidate_sync_completed", { current: local, changed: false });
      return { current: local, changed: false };
    }
    const delta = await this.#get(`/catalog-delta?after=${local}`);
    if (!delta || delta.fullRefreshRequired) {
      this.#diagnostic?.record("remote_candidate_sync_failed", { current: local, reason: delta ? "full_refresh_required" : "delta_unavailable" });
      return { current: local, changed: false, fullRefreshRequired: true };
    }
    const staged = structuredClone(this.#store.state);
    for (const change of delta.changes || []) applySharedCatalogChange(staged, change);
    staged.catalogState.syncMetadata ||= {};
    staged.catalogState.syncMetadata.lastAppliedRemoteCatalogVersion = Number(delta.currentVersion);
    this.#store.commit(staged, "shared-catalog-delta-apply");
    this.#catalog.refresh();
    await this.#applyCandidateResolutions();
    this.#diagnostic?.record("remote_candidate_sync_completed", { current: delta.currentVersion, changed: true });
    return { current: delta.currentVersion, changed: true };
  }
  enqueue(kind, payload) {
    const id = payload.candidateId || payload.reportId || crypto.randomUUID();
    const before = pendingCandidateCount(this.#store.state);
    this.#diagnostic?.record("candidate_create_requested", { id, kind, pendingBefore: before });
    this.#diagnostic?.record("candidate_persist_started", { id });
    candidateTrace("candidate_create_called", { id, kind, pending_count_before: before });
    try {
      this.#store.update((s) => {
        s.catalogState.syncMetadata ||= {};
        if (kind === "candidate") upsertLocalCandidate(s, { ...payload, candidateId: id });
        const o = s.catalogState.syncMetadata.governanceOutbox ||= [];
        if (!o.some((x) => x.id === id)) o.push({ id, kind, payload: { ...payload, [kind === "candidate" ? "candidateId" : "reportId"]: id }, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
      }, "governance-outbox-enqueue");
    } catch (error) {
      this.#diagnostic?.record("candidate_persist_failed", { id, message: error?.message || String(error) });
      throw error;
    }
    const after = pendingCandidateCount(this.#store.state);
    this.#diagnostic?.record("candidate_created", { id, pendingBefore: before, pendingAfter: after });
    this.#diagnostic?.record("candidate_persist_completed", { id, pendingAfter: after });
    candidateTrace("candidate_created", { id, pending_count_after: after });
    candidateTrace("candidate_persisted", { id });
    candidateTrace("badge_refresh_requested", { pending_count_after: after });
    globalThis.dispatchEvent?.(new Event("toy-rotation-candidate-persisted"));
    return id;
  }
  async flushOutbox() {
    if (!this.#base || !navigator.onLine) return { flushed: 0 };
    const jobs = [...this.#store.state.catalogState?.syncMetadata?.governanceOutbox || []];
    let flushed = 0;
    for (const job of jobs) {
      try {
        const r = await fetch(`${this.#base}/${job.kind === "candidate" ? "catalog-candidate" : "catalog-report"}`, { method: "POST", headers: { "Content-Type": "application/json", "X-Device-Id": deviceId2() }, body: JSON.stringify(job.payload) });
        if (!r.ok) continue;
        this.#store.update((s) => {
          s.catalogState.syncMetadata.governanceOutbox = s.catalogState.syncMetadata.governanceOutbox.filter((x) => x.id !== job.id);
          if (job.kind === "candidate") {
            s.catalogState.syncMetadata.candidateReceipts ||= [];
            if (!s.catalogState.syncMetadata.candidateReceipts.includes(job.id)) s.catalogState.syncMetadata.candidateReceipts.push(job.id);
          }
        }, "governance-outbox-sent");
        flushed++;
      } catch {
      }
    }
    await this.#applyCandidateResolutions();
    return { flushed };
  }
  createLocalCandidate(payload) {
    return this.enqueue("candidate", { ...payload, candidateId: payload.candidateId || crypto.randomUUID() });
  }
  async submitCandidate(payload) {
    this.createLocalCandidate(payload);
    return this.flushOutbox();
  }
  async submitReport(payload) {
    const reportId = payload.reportId || crypto.randomUUID();
    this.#store.update((state) => {
      const report = createCatalogReport(state, { ...payload, id: reportId, attachmentRef: payload.attachmentRef || null, syncStatus: "pending_local" });
      enqueueCatalogReportSyncIntent(state, report);
    }, "catalog-report-create");
    void this.flushOutbox();
    return getCatalogReportById(this.#store.state, reportId);
  }
  async migrateLegacyReports() {
    const jobs = [...this.#store.state.catalogState?.syncMetadata?.governanceOutbox || []].filter((job) => job?.kind === "report");
    if (!jobs.length) return { migrated: 0, pending: 0, errors: [] };
    const prepared = [];
    const errors = [];
    const seenIds = new Set((this.#store.state.catalogState?.catalogReports || []).map((report) => report.id));
    for (const job of jobs) {
      const id = legacyReportId(job);
      if (seenIds.has(id)) continue;
      seenIds.add(id);
      const existing = getCatalogReportById(this.#store.state, id);
      let attachmentRef = existing?.attachmentRef || job.payload?.attachmentRef || null;
      if (existing && (!hasRawAttachment(job.payload) || attachmentRef)) {
        prepared.push({ job, report: existing, migrated: false, attachmentRef });
        continue;
      }
      if (hasRawAttachment(job.payload)) {
        if (!this.#images) {
          errors.push({ id: job.id, reason: "attachment_repository_unavailable" });
          continue;
        }
        try {
          attachmentRef = await this.#images.savePersonal(job.payload.optionalAttachment);
        } catch (error) {
          errors.push({ id: job.id, reason: "attachment_migration_failed", message: String(error?.message || error) });
          continue;
        }
      }
      prepared.push({ job, report: existing ? { ...existing, attachmentRef } : legacyReportPayload(job, attachmentRef), migrated: !existing, attachmentRef });
    }
    if (prepared.length) this.#store.update((state) => {
      const outbox = state.catalogState.syncMetadata.governanceOutbox || [];
      for (const entry of prepared) {
        const report = createCatalogReport(state, entry.report);
        entry.safeReport = report;
      }
      const migratedById = new Map(prepared.map((entry) => [legacyReportId(entry.job), entry.safeReport]));
      for (const job of outbox) {
        const report = migratedById.get(legacyReportId(job));
        if (job.kind === "report" && report && hasRawAttachment(job.payload)) {
          const { optionalAttachment, ...safePayload } = job.payload;
          job.payload = { ...safePayload, attachmentRef: report.attachmentRef || null, attachmentTransport: report.attachmentRef ? "deferred_until_remote_contract_updated" : "none" };
        }
      }
      state.catalogState.syncMetadata.catalogReportMigrationV0115 = { completedAt: (/* @__PURE__ */ new Date()).toISOString(), pendingAttachmentMigration: errors.map((error) => error.id), errors };
    }, "catalog-report-legacy-import");
    return { migrated: prepared.filter((item) => item.migrated).length, pending: errors.length, errors };
  }
  async #get(path) {
    try {
      const r = await fetch(`${this.#base}${path}`, { cache: "no-store" });
      return r.ok ? await r.json() : null;
    } catch {
      return null;
    }
  }
  async #applyCandidateResolutions() {
    const ids = [...this.#store.state.catalogState?.syncMetadata?.candidateReceipts || []];
    for (const candidateId of ids) {
      const resolution = await this.#get(`/catalog-candidate-resolution?candidateId=${encodeURIComponent(candidateId)}`);
      const target = canonicalKey(resolution?.resolvedCanonicalKey);
      if (!target) continue;
      const staged = structuredClone(this.#store.state);
      let changed = false;
      for (const toy of staged.toys || []) if (toy.governanceCandidateId === candidateId || canonicalKey(toy.canonicalKey) === canonicalKey(resolution?.proposedCanonicalKey)) {
        toy.legacyCanonicalKeys = [...new Set([...toy.legacyCanonicalKeys || [], toy.canonicalKey].filter(Boolean))];
        toy.canonicalKey = target;
        toy.governanceCandidateResolvedAt = (/* @__PURE__ */ new Date()).toISOString();
        changed = true;
      }
      if (changed) this.#store.commit(staged, "candidate-resolution-apply");
    }
  }
};
function candidateTrace(stage, detail = {}) {
  const trace = globalThis.__TOY_ROTATION_CANDIDATE_TRACE__ ||= [];
  trace.push({ stage, detail, at: (/* @__PURE__ */ new Date()).toISOString() });
  if (trace.length > 80) trace.splice(0, trace.length - 80);
}
function applySharedCatalogChange(state, change) {
  const key = canonicalKey(change.canonicalKey);
  state.catalogState ||= { tombstones: {}, adminEdits: {}, syncMetadata: {} };
  state.catalogState.tombstones ||= {};
  state.catalogState.adminEdits ||= {};
  state.catalogState.remoteEntries ||= [];
  if (change.type === "merge") {
    const survivor = canonicalKey(change.targetCanonicalKey);
    state.catalogState.tombstones[key] = { deletedAt: change.updatedAt, mergedInto: survivor };
    for (const toy of state.toys || []) if (canonicalKey(toy.canonicalKey) === key) {
      toy.canonicalKey = survivor;
      toy.legacyCanonicalKeys = [.../* @__PURE__ */ new Set([...toy.legacyCanonicalKeys || [], key])];
    }
    for (const item of state.wishlist || []) if (canonicalKey(item.canonicalKey) === key) item.canonicalKey = survivor;
    for (const round of state.rotationHistory || []) round.toyIds = (round.toyIds || []).map((id) => state.toys?.find((toy) => toy.id === id)?.id || id);
    return;
  }
  if (change.type === "tombstone") {
    state.catalogState.tombstones[key] = { deletedAt: change.updatedAt };
    return;
  }
  if (change.type === "restore") {
    delete state.catalogState.tombstones[key];
    return;
  }
  if (change.type === "create") {
    const entry = { ...change.patch || {}, canonicalKey: key, key, updatedAt: change.updatedAt };
    const index = state.catalogState.remoteEntries.findIndex((item) => canonicalKey(item.canonicalKey) === key);
    if (index >= 0) state.catalogState.remoteEntries[index] = { ...state.catalogState.remoteEntries[index], ...entry };
    else state.catalogState.remoteEntries.push(entry);
    state.catalogState.adminEdits[key] = { ...state.catalogState.adminEdits[key] || {}, ...entry };
    return;
  }
  state.catalogState.adminEdits[key] = { ...state.catalogState.adminEdits[key] || {}, ...change.patch || {}, updatedAt: change.updatedAt };
}
function deviceId2() {
  const k = "toyRotation.cleanBaseline.deviceId";
  let v = localStorage.getItem(k);
  if (!v) {
    v = `device-${crypto.randomUUID()}`;
    localStorage.setItem(k, v);
  }
  return v;
}

// src/features/review-count.js
function getNeedsReviewCount(state) {
  return pendingCandidateCount(state) + getPendingCatalogReports(state).length;
}

// src/features/data-repair-diagnostic.js
var CURRENT_STORE_KEY = "toyRotation.cleanBaseline";
var LEGACY_STORE_KEYS = ["toyRotationV04", "toyRotationV032", "toyRotationV03", "toyRotationV02"];
var LEGACY_TOMBSTONE_KEYS = [
  "toyRotationCatalogDeletedV0934",
  "toyRotationHiddenCatalogKeysV0927",
  "toyRotationHiddenCatalogTombstonesV0929",
  "toyRotationHiddenCatalogAuthoritativeV0930",
  "toyRotationCatalogHiddenV0933",
  "toyRotationCatalogPendingHideV0933",
  "toyRotationCatalogOverridesV095"
];
function isBallDropDiagnosticRecord(record = {}) {
  const text2 = searchable(record);
  const key = canonicalKey(record.canonicalKey || record.catalogKey || record.key);
  return key === "lovevery-inspector-1" || key === "lovevery-inspector-part-1" || text2.includes("\u6295\u7403\u76D2") || text2.includes("ball drop box");
}
function isMideerDinosaurParent(record = {}) {
  const text2 = searchable(record);
  const brand = String(record.brand || "").toLowerCase();
  const setKind = record.set?.kind || (record.isSet ? "parent" : "none");
  const productMatch = (text2.includes("\u6050\u9F99") || text2.includes("dinosaur")) && (text2.includes("6\u54081") || text2.includes("6 in 1") || text2.includes("6-in-1") || text2.includes("my first puzzle"));
  return brand === "mideer" && setKind !== "child" && productMatch;
}
function diagnosticLifecycleSnapshot(state, phase, reason2 = "") {
  const toys = state?.toys || [];
  const ballDrop = toys.filter(isBallDropDiagnosticRecord);
  const parent = toys.find(isMideerDinosaurParent) || null;
  const children = parent ? toys.filter((toy) => isRelatedChild(toy, parent)) : [];
  return {
    at: (/* @__PURE__ */ new Date()).toISOString(),
    phase,
    reason: reason2,
    schemaVersion: state?.schemaVersion ?? null,
    totalToyRecords: toys.length,
    ballDropRecords: ballDrop.length,
    ballDropIds: ballDrop.map((toy) => toy.id),
    mideerDinosaurParentRecords: parent ? 1 : 0,
    mideerDinosaurChildRecords: children.length,
    mideerDinosaurParentId: parent?.id || null,
    mideerDinosaurChildIds: children.map((toy) => toy.id)
  };
}
function buildDataRepairDiagnostic({ store: store2, catalog: catalog2, release, lifecycle = [], startupTrace: startupTrace2 = null, restoreTiming = null }) {
  const currentState = store2.state;
  const currentToys = currentState.toys || [];
  const persistedState = parseStorage(CURRENT_STORE_KEY);
  const legacyStates = LEGACY_STORE_KEYS.map((key) => ({ key, value: parseStorage(key) })).filter((entry) => entry.value);
  const legacyToys = legacyStates.flatMap((entry) => (entry.value.toys || []).map((record) => ({ storageKey: entry.key, record })));
  const activeCatalog = catalog2?.active || [];
  const ballCurrent = currentToys.filter(isBallDropDiagnosticRecord);
  const ballLegacy = legacyToys.filter((entry) => isBallDropDiagnosticRecord(entry.record));
  const ballCatalog = activeCatalog.filter(isBallDropDiagnosticRecord);
  const currentParent = currentToys.find(isMideerDinosaurParent) || null;
  const persistedParent = (persistedState?.toys || []).find(isMideerDinosaurParent) || null;
  const legacyParents = legacyToys.filter((entry) => isMideerDinosaurParent(entry.record));
  const catalogParent = activeCatalog.find(isMideerDinosaurParent) || null;
  const currentChildren = currentParent ? currentToys.filter((toy) => isRelatedChild(toy, currentParent)) : [];
  const persistedChildren = persistedParent ? (persistedState?.toys || []).filter((toy) => isRelatedChild(toy, persistedParent)) : [];
  const historicalChildren = legacyParents.flatMap(({ storageKey, record: parent }) => legacyToys.filter((entry) => entry.storageKey === storageKey && isRelatedChild(entry.record, parent)));
  const childDefinitions = buildChildDefinitions(catalogParent, currentParent);
  const restoration = explainRestoration({
    parent: currentParent,
    currentChildren,
    childDefinitions,
    historicalChildren: historicalChildren.map((entry) => entry.record),
    repairMarker: currentState.catalogState?.syncMetadata?.parentChildDataRepair
  });
  const syncMetadata = scrub(currentState.catalogState?.syncMetadata || {});
  const currentTombstones = currentState.catalogState?.tombstones || {};
  const legacyTombstones = LEGACY_TOMBSTONE_KEYS.map((key) => ({ key, value: scrub(parseStorage(key)) })).filter((entry) => entry.value);
  const relevantTombstones = Object.fromEntries(Object.entries(currentTombstones).filter(([key, value]) => relevantIdentityText(key, value)).map(([key, value]) => [key, scrub(value)]));
  const persistenceSnapshot = diagnosticLifecycleSnapshot(persistedState || {}, "persistence_readback", CURRENT_STORE_KEY);
  const currentSnapshot = diagnosticLifecycleSnapshot(currentState, "export_current_store", "administrator_export");
  return scrub({
    format: "toy-rotation-data-repair-diagnostic",
    diagnosticVersion: 1,
    release: release || null,
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    safety: { includesImageBlobs: false, mutatesAppData: false, runsRepairAlgorithms: false },
    ballDropBox: {
      currentRecords: ballCurrent.map(recordProjection),
      persistedRecords: (persistedState?.toys || []).filter(isBallDropDiagnosticRecord).map(recordProjection),
      legacyRecords: ballLegacy.map((entry) => ({ storageKey: entry.storageKey, ...recordProjection(entry.record) })),
      catalogRecords: ballCatalog.map(recordProjection),
      relevantTombstones,
      migrationMarkers: syncMetadata,
      mergeDiagnostics: collectMergeDiagnostics([...ballCurrent, ...ballLegacy.map((entry) => entry.record)]),
      countComparison: {
        legacy: ballLegacy.length,
        currentStore: ballCurrent.length,
        persistedStore: persistenceSnapshot.ballDropRecords,
        lifecycle: (lifecycle || []).map((entry) => ({ phase: entry.phase, reason: entry.reason, at: entry.at, count: entry.ballDropRecords, ids: entry.ballDropIds }))
      }
    },
    mideerDinosaurSixInOne: {
      currentParent: currentParent ? fullRecord(currentParent) : null,
      persistedParent: persistedParent ? fullRecord(persistedParent) : null,
      currentChildRecords: currentChildren.map(fullRecord),
      persistedChildRecords: persistedChildren.map(fullRecord),
      historicalParents: legacyParents.map((entry) => ({ storageKey: entry.storageKey, record: fullRecord(entry.record) })),
      historicalChildRecords: historicalChildren.map((entry) => ({ storageKey: entry.storageKey, record: fullRecord(entry.record) })),
      catalogSeedParent: catalogParent ? fullRecord(catalogParent) : null,
      catalogSeedChildDefinitions: childDefinitions.map(fullRecord),
      deletedOrTombstonedChildReferences: collectDeletedChildReferences({ currentState, legacyTombstones, parent: currentParent || catalogParent, childDefinitions }),
      restorationEligibility: restoration
    },
    migrationLifecycle: {
      recordedRuntimeStages: [...lifecycle || [], persistenceSnapshot, currentSnapshot],
      currentSchemaVersion: currentState.schemaVersion,
      currentSyncMetadata: syncMetadata,
      persistedSyncMetadata: scrub(persistedState?.catalogState?.syncMetadata || {}),
      storageSnapshots: [
        storageSummary(CURRENT_STORE_KEY, persistedState),
        ...legacyStates.map((entry) => storageSummary(entry.key, entry.value))
      ],
      interpretation: {
        ballDropReappearedStage: findIncreaseStage(lifecycle, "ballDropRecords"),
        mideerChildrenDisappearedStage: findDecreaseStage(lifecycle, "mideerDinosaurChildRecords"),
        storeMatchesPersistence: currentSnapshot.totalToyRecords === persistenceSnapshot.totalToyRecords && currentSnapshot.ballDropRecords === persistenceSnapshot.ballDropRecords && currentSnapshot.mideerDinosaurChildRecords === persistenceSnapshot.mideerDinosaurChildRecords
      }
    },
    startupTiming: scrub(startupTrace2),
    restoreTiming: scrub(restoreTiming)
  });
}
function recordProjection(record = {}) {
  return {
    id: record.id || null,
    legacyId: record.legacyId || record.legacyToyId || null,
    canonicalKey: record.canonicalKey || record.catalogKey || null,
    legacyCanonicalKey: record.legacyCanonicalKey || null,
    legacyCanonicalKeys: record.legacyCanonicalKeys || [],
    brand: record.brand || null,
    name: record.name || record.productName || null,
    nameZh: record.nameZh || record.names?.zh || null,
    nameEn: record.nameEn || record.names?.en || null,
    aliases: record.aliases || [],
    catalogId: record.catalogId || null,
    parentSetId: record.parentSetId || record.set?.parentId || null,
    parentCanonicalKey: record.parentCanonicalKey || record.set?.parentCanonicalKey || null,
    childId: record.childId || (record.set?.kind === "child" ? record.id : null),
    childCanonicalKey: record.childCanonicalKey || (record.set?.kind === "child" ? record.canonicalKey : null),
    set: record.set || null,
    setFlags: { isSet: !!record.isSet, isSetContainer: !!record.isSetContainer, isSetChild: !!record.isSetChild, kind: record.set?.kind || null, rotationMode: record.set?.rotationMode || null },
    imageRef: record.imageRef || null,
    imageSource: record.imageSource || record.imageRef?.imageSource || record.imageRef?.source || record.imageRef?.kind || null,
    migrationMarkers: record.migrationMarkers || record.migration || null,
    reconciliationMarkers: record.reconciliationMarkers || null,
    mergeDiagnostics: record.mergeDiagnostics || [],
    tombstone: record.tombstone || null,
    deleted: record.deleted === true,
    deletedAt: record.deletedAt || null,
    record: fullRecord(record)
  };
}
function fullRecord(record) {
  return scrub(structuredClone(record));
}
function explainRestoration({ parent, currentChildren, childDefinitions, historicalChildren, repairMarker }) {
  if (!parent) return { decision: "skipped", reason: "parent_not_found", eligible: false };
  const expectedKeys = childDefinitions.map((child) => canonicalKey(child.canonicalKey));
  const currentKeys = currentChildren.map((child) => canonicalKey(child.canonicalKey));
  const missingKeys = expectedKeys.filter((key) => !currentKeys.includes(key));
  const intentionalKeys = (parent.set?.intentionalRemovedChildKeys || []).map(canonicalKey);
  const eligibleKeys = missingKeys.filter((key) => !intentionalKeys.includes(key));
  const ghostChildIds = (parent.set?.childIds || []).filter((id) => !currentChildren.some((child) => child.id === id));
  const legacyEvidence = historicalChildren.map((child) => ({ id: child.id || null, canonicalKey: child.canonicalKey || child.catalogKey || null, set: child.set || null }));
  const matchingRepair = (repairMarker?.repairs || []).find((item) => item.parentId === parent.id || canonicalKey(item.parentCanonicalKey) === canonicalKey(parent.canonicalKey));
  let decision = "eligible_but_not_recorded";
  let reason2 = "stable_plan_and_historical_proof_present";
  if (childDefinitions.length < 2) {
    decision = "skipped";
    reason2 = "no_stable_multi_child_plan";
  } else if (!missingKeys.length) {
    decision = "not_needed";
    reason2 = "all_expected_children_present";
  } else if (!eligibleKeys.length) {
    decision = "skipped";
    reason2 = "all_missing_children_marked_intentionally_removed";
  } else if (!ghostChildIds.length && !legacyEvidence.length) {
    decision = "skipped";
    reason2 = "no_stale_child_ids_or_legacy_ownership_proof";
  } else if (matchingRepair?.restored > 0) {
    decision = "executed";
    reason2 = "parentChildDataRepair_marker_records_restoration";
  }
  return {
    eligible: ["eligible_but_not_recorded", "executed"].includes(decision),
    decision,
    reason: reason2,
    expectedChildKeys: expectedKeys,
    currentChildKeys: currentKeys,
    missingChildKeys: missingKeys,
    intentionalRemovedChildKeys: intentionalKeys,
    eligibleMissingChildKeys: eligibleKeys,
    ghostChildIds,
    legacyOwnershipEvidence: legacyEvidence,
    recordedRepair: matchingRepair || null,
    guardSource: "read-only diagnostic reproduction of R10 restoration guards"
  };
}
function buildChildDefinitions(catalogParent, currentParent) {
  const parent = currentParent || catalogParent;
  const definition = catalogParent || currentParent;
  if (!parent || !definition) return [];
  const probe = { ...parent, set: { ...parent.set || {}, kind: "parent", rotationMode: "split" } };
  return deriveExplicitChildren(probe, definition).map((child, index) => ({
    ...child,
    canonicalKey: child.canonicalKey || `${parent.canonicalKey}:part-${index + 1}`,
    set: { ...child.set || {}, kind: "child", parentId: parent.id, parentCanonicalKey: parent.canonicalKey, partIndex: index + 1, rotationMode: "split" }
  }));
}
function collectDeletedChildReferences({ currentState, legacyTombstones, parent, childDefinitions }) {
  const keys = new Set([parent?.canonicalKey, ...(childDefinitions || []).map((child) => child.canonicalKey)].map(canonicalKey).filter(Boolean));
  const current = Object.entries(currentState.catalogState?.tombstones || {}).filter(([key]) => keys.has(canonicalKey(key)));
  const intentional = parent?.set?.intentionalRemovedChildKeys || [];
  return { currentCatalogTombstones: Object.fromEntries(current), legacyTombstoneStores: legacyTombstones, intentionalRemovedChildKeys: intentional };
}
function collectMergeDiagnostics(records) {
  return records.map((record) => ({ id: record.id || null, canonicalKey: record.canonicalKey || null, diagnostics: record.mergeDiagnostics || [], migrationMarkers: record.migrationMarkers || null })).filter((item) => item.diagnostics.length || item.migrationMarkers);
}
function storageSummary(key, state) {
  if (!state) return { key, present: false };
  return { key, present: true, ...diagnosticLifecycleSnapshot(state, "storage_snapshot", key), syncMetadata: scrub(state.catalogState?.syncMetadata || {}) };
}
function findIncreaseStage(lifecycle, field) {
  for (let index = 1; index < (lifecycle || []).length; index++) {
    if ((lifecycle[index][field] || 0) > (lifecycle[index - 1][field] || 0)) return { before: lifecycle[index - 1], after: lifecycle[index] };
  }
  return null;
}
function findDecreaseStage(lifecycle, field) {
  for (let index = 1; index < (lifecycle || []).length; index++) {
    if ((lifecycle[index][field] || 0) < (lifecycle[index - 1][field] || 0)) return { before: lifecycle[index - 1], after: lifecycle[index] };
  }
  return null;
}
function isRelatedChild(child = {}, parent = {}) {
  if ((child.set?.kind || "") !== "child") return false;
  if (child.set?.parentId && child.set.parentId === parent.id) return true;
  if (canonicalKey(child.set?.parentCanonicalKey) === canonicalKey(parent.canonicalKey)) return true;
  if ((child.set?.legacyParentIds || []).includes(parent.id)) return true;
  return canonicalKey(child.set?.setName) === canonicalKey(parent.productName || parent.name);
}
function searchable(record = {}) {
  return [
    record.canonicalKey,
    record.catalogKey,
    record.productName,
    record.name,
    record.nameZh,
    record.nameEn,
    record.names?.zh,
    record.names?.en,
    ...record.aliases || []
  ].filter(Boolean).join(" ").normalize("NFKC").toLowerCase();
}
function relevantIdentityText(key, value) {
  const text2 = `${key} ${JSON.stringify(value || {})}`.toLowerCase();
  return text2.includes("lovevery-inspector-1") || text2.includes("\u6295\u7403\u76D2") || text2.includes("ball drop") || text2.includes("mideer") && (text2.includes("dinosaur") || text2.includes("\u6050\u9F99"));
}
function parseStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch (error) {
    return { parseError: String(error?.message || error) };
  }
}
function scrub(value, key = "") {
  if (value == null || typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (/^(data:|blob:)/i.test(value) || value.length > 2e4) return "<omitted-image-or-large-payload>";
    return value;
  }
  if (Array.isArray(value)) return value.map((item) => scrub(item, key));
  if (typeof value !== "object") return String(value);
  const output = {};
  for (const [childKey, childValue] of Object.entries(value)) {
    if (/(blob|imageData|photoData|dataUrl|base64|rawImage|rawBytes)/i.test(childKey)) {
      output[childKey] = "<omitted-image-payload>";
      continue;
    }
    output[childKey] = scrub(childValue, childKey);
  }
  return output;
}

// src/features/persistence-diagnostic.js
var IMAGE_DB = "toyRotationPhotosV04";
async function buildPersistenceDiagnostic({ store: store2, images: images2 = null, release = null } = {}) {
  const base = store2?.persistence?.diagnostic || buildPersistenceSnapshot({ hydratedState: store2?.state || null, mode: store2?.persistence?.status || "unknown" });
  const databases = await listDatabases();
  const imageDatabase = databases.find((row) => row.name === IMAGE_DB) || null;
  const image = await inspectKnownImageDatabase(imageDatabase);
  let personalImageCount = null;
  let imageReadError = null;
  if (images2 && imageDatabase) {
    try {
      personalImageCount = (await images2.listPersonalRecords()).length;
    } catch (error) {
      imageReadError = String(error?.message || error);
    }
  }
  return {
    format: "toy-rotation-persistence-diagnostic",
    diagnosticVersion: 1,
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    release: release || null,
    origin: globalThis.location?.origin || null,
    localStorageKeys: storageKeyNames(),
    indexedDb: { databases, knownImageDatabase: image, personalImageCount, imageReadError },
    raw: base,
    recovery: {
      status: store2?.persistence?.status || null,
      detected: store2?.persistence?.recovery || base.recovery || null,
      executed: base.recoveryExecuted === true,
      diagnosticMode: store2?.persistence?.diagnosticMode === true
    },
    hydrated: {
      toyCount: store2?.state?.toys?.length || 0,
      profileCount: store2?.state?.profile?.childName || store2?.state?.profile?.childBirthDate ? 1 : 0,
      wishlistCount: store2?.state?.wishlist?.length || 0,
      rotationHistoryCount: store2?.state?.rotationHistory?.length || 0,
      persistenceStatus: store2?.persistence?.status || null,
      writable: store2?.canPersist === true
    },
    safety: { readOnly: true, includesImageBytes: false, doesNotInitializeOrClearStorage: true }
  };
}
async function listDatabases() {
  try {
    if (typeof indexedDB === "undefined" || typeof indexedDB.databases !== "function") return [{ supported: false }];
    return (await indexedDB.databases()).map((row) => ({ name: row.name || null, version: row.version ?? null }));
  } catch (error) {
    return [{ error: String(error?.message || error) }];
  }
}
async function inspectKnownImageDatabase(database) {
  if (!database?.name) return { name: IMAGE_DB, present: false };
  try {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(IMAGE_DB);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const stores = [...db.objectStoreNames];
    const counts = {};
    await Promise.all(stores.map((storeName) => new Promise((resolve, reject) => {
      const request = db.transaction(storeName, "readonly").objectStore(storeName).count();
      request.onsuccess = () => {
        counts[storeName] = request.result;
        resolve();
      };
      request.onerror = () => reject(request.error);
    })));
    const result2 = { name: IMAGE_DB, present: true, version: db.version, objectStores: stores, counts };
    db.close();
    return result2;
  } catch (error) {
    return { name: IMAGE_DB, present: true, error: String(error?.message || error) };
  }
}
function storageKeyNames() {
  try {
    return Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter((key) => String(key || "").startsWith("toyRotation"));
  } catch (error) {
    return [{ error: String(error?.message || error) }];
  }
}

// src/features/restore-diagnostic.js
function buildRestoreDiagnostic({ trace = null, release = null } = {}) {
  const stages = trace?.stages || [];
  const lastSuccessful = [...stages].reverse().find((stage) => stage.success) || null;
  return {
    format: "toy-rotation-restore-diagnostic",
    diagnosticVersion: 1,
    release,
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    safety: { mutatesAppData: false, includesImageBlobs: false, runsRestoreAlgorithms: false },
    browser: {
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      fileReaderAvailable: typeof FileReader !== "undefined",
      fileTextAvailable: typeof File !== "undefined" && typeof File.prototype?.text === "function",
      indexedDbAvailable: typeof indexedDB !== "undefined"
    },
    restoreTrace: trace || { status: "no_restore_attempt_recorded", stages: [] },
    interpretation: {
      lastSuccessfulStage: lastSuccessful?.name || null,
      firstFailure: stages.find((stage) => stage.success === false) || null,
      handlerEntered: stages.some((stage) => stage.name === "restore_handler_enter"),
      backupServiceEntered: stages.some((stage) => stage.name === "backup_service_enter"),
      fileReadCompleted: stages.some((stage) => stage.name === "file_text_end" || stage.name === "file_reader_fallback_end"),
      jsonParsed: stages.some((stage) => stage.name === "json_parse_end"),
      committed: stages.some((stage) => stage.name === "atomic_commit_end"),
      completed: trace?.status === "complete"
    }
  };
}

// src/features/runtime-image-diagnostic.js
var IMAGE_RESOLVER_BUILD_MARKER = "runtime-child-image-trace-20260827-a";
var MAX_EVENTS = 500;
var MAX_ROWS = 24;
var RuntimeImageDiagnostics = class {
  #events = [];
  #resolutions = /* @__PURE__ */ new Map();
  #dom = /* @__PURE__ */ new Map();
  #activeLookup = null;
  #originalGetByKey = null;
  constructor({ release = "development", clock = () => (/* @__PURE__ */ new Date()).toISOString() } = {}) {
    this.release = release;
    this.clock = clock;
    this.mark("diagnostic_initialized", { imageResolverBuildMarker: IMAGE_RESOLVER_BUILD_MARKER });
  }
  installCatalogLookupProbe(catalog2) {
    if (!catalog2?.getByKey || this.#originalGetByKey) return;
    this.#originalGetByKey = catalog2.getByKey.bind(catalog2);
    catalog2.getByKey = (key) => {
      const hit = this.#originalGetByKey(key);
      if (this.#activeLookup) this.#activeLookup.lookupKeysActuallyTried.push({
        key: key ?? null,
        normalizedKey: normalizeKey(key),
        hit: Boolean(hit),
        hitCanonicalKey: hit?.canonicalKey || null,
        hitImageRef: clone(hit?.imageRef || null)
      });
      return hit;
    };
  }
  mark(type, details = {}) {
    this.#events.push({ at: this.clock(), type, ...clone(details) });
    if (this.#events.length > MAX_EVENTS) this.#events.shift();
  }
  traceResolution(toy, { phase = "renderer", catalog: catalog2, parentImageRef = null, resolve } = {}) {
    const row = baseToyRow(toy, phase, this.clock());
    this.#activeLookup = row;
    let catalogToy = null, returned = null, error = null;
    try {
      catalogToy = catalog2?.resolve?.(toy) || null;
      returned = resolve({ resolve: () => catalogToy }, parentImageRef);
    } catch (caught) {
      error = caught?.message || String(caught);
    } finally {
      this.#activeLookup = null;
    }
    Object.assign(row, {
      catalogRecordMatched: Boolean(catalogToy),
      matchedCatalogCanonicalKey: catalogToy?.canonicalKey || null,
      catalogImageRef: clone(catalogToy?.imageRef || null),
      catalogImageSource: catalogToy?.imageRef?.imageSource || catalogToy?.imageRef?.source || null,
      catalogImageSourceType: catalogToy?.imageRef?.imageSourceType || null,
      catalogVerificationStatus: catalogToy?.imageRef?.verificationStatus || null,
      catalogImageOwnerCanonicalKey: catalogToy?.imageRef?.imageOwnerCanonicalKey || null,
      resolverReturnedImageRef: clone(returned),
      rendererReceivedImageRef: clone(returned),
      resolutionPath: resolutionPath(row, catalogToy),
      error
    });
    this.#append(this.#resolutions, toy.id, row);
    return returned;
  }
  recordDom({ toyId, rendererImageRef, src, currentSrc = "", complete = false, naturalWidth = 0, state = "assigned", error = null } = {}) {
    if (!toyId) return;
    this.#append(this.#dom, toyId, {
      at: this.clock(),
      toyLibraryId: toyId,
      rendererReceivedImageRef: clone(rendererImageRef),
      domImgSrc: src || null,
      domCurrentSrc: currentSrc || null,
      complete: Boolean(complete),
      naturalWidth: Number(naturalWidth || 0),
      state,
      error,
      isPlaceholder: isPlaceholderResult(rendererImageRef, src)
    });
  }
  snapshot() {
    return { events: clone(this.#events), resolutions: mapObject(this.#resolutions), dom: mapObject(this.#dom) };
  }
  async buildExport({ store: store2, catalog: catalog2, documentObject = globalThis.document, navigatorObject = globalThis.navigator, cacheStorage = globalThis.caches } = {}) {
    const liveDom = collectLiveDom(documentObject);
    const rows = (store2?.state?.toys || []).filter(isLoveveryChild).map((toy) => {
      const resolutions = clone(this.#resolutions.get(toy.id) || []), domHistory = clone(this.#dom.get(toy.id) || []);
      const latest2 = resolutions.at(-1) || baseToyRow(toy, "not_rendered", this.clock());
      const dom = liveDom[toy.id] || domHistory.at(-1) || null;
      return {
        ...latest2,
        resolutionHistory: resolutions,
        domHistory,
        domImgSrc: dom?.domImgSrc || null,
        domCurrentSrc: dom?.domCurrentSrc || null,
        domImageComplete: dom?.complete ?? null,
        domNaturalWidth: dom?.naturalWidth ?? null,
        isPlaceholder: dom ? Boolean(dom.isPlaceholder) : isPlaceholderRef(latest2.rendererReceivedImageRef),
        activeOwnership: !toy.archived && !toy.hidden
      };
    });
    const stages = summarizeStages(this.#events, this.#resolutions);
    return {
      format: "toy-rotation-runtime-child-image-diagnostic",
      diagnosticVersion: 1,
      exportedAt: this.clock(),
      readOnly: true,
      release: this.release,
      imageResolverBuildMarker: IMAGE_RESOLVER_BUILD_MARKER,
      serviceWorker: {
        controllerScriptURL: navigatorObject?.serviceWorker?.controller?.scriptURL || null,
        controllerState: navigatorObject?.serviceWorker?.controller?.state || null,
        cacheNames: await cacheNames(cacheStorage)
      },
      runtimeSummary: {
        loveveryChildOwnershipCount: rows.length,
        catalogRepositoryActiveCount: catalog2?.active?.length || 0,
        firstSweepResolvableCount: stages.firstSweepResolvableCount,
        postHydrateResolvableCount: stages.postHydrateResolvableCount,
        currentlyCatalogResolvableCount: rows.filter((row) => row.catalogRecordMatched && !isPlaceholderRef(row.resolverReturnedImageRef)).length,
        currentDomNonPlaceholderCount: rows.filter((row) => row.domImgSrc && !row.isPlaceholder).length,
        currentDomPlaceholderCount: rows.filter((row) => row.isPlaceholder).length,
        currentDomLoadFailureCount: rows.filter((row) => row.domHistory?.at(-1)?.state === "error" || row.domImageComplete && row.domNaturalWidth === 0).length,
        catalogHydrationCompleted: stages.catalogHydrationCompleted,
        postHydrateRenderObserved: stages.postHydrateRenderObserved,
        placeholderThenCatalogTransitions: stages.placeholderThenCatalogTransitions
      },
      comparisonHints: {
        successfulNames: ["First Puzzle", "Treasure Basket", "\u7B2C\u4E00\u5757\u62FC\u56FE", "\u63A2\u7D22\u7BEE"],
        successfulRows: rows.filter((row) => /first puzzle|treasure basket|第一块拼图|探索篮/i.test(`${row.name || ""} ${row.nameEn || ""} ${row.nameZh || ""}`)),
        placeholderExamples: rows.filter((row) => row.isPlaceholder).slice(0, 5)
      },
      lifecycleEvents: clone(this.#events),
      loveveryChildren: rows
    };
  }
  #append(map, id, row) {
    const rows = map.get(id) || [];
    rows.push(row);
    if (rows.length > MAX_ROWS) rows.shift();
    map.set(id, rows);
  }
};
function baseToyRow(toy = {}, phase, at) {
  const imageRef = clone(toy.imageRef || null);
  return {
    at,
    phase,
    toyLibraryId: toy.id || null,
    name: toy.productName || toy.name || null,
    nameEn: toy.names?.en || toy.nameEn || null,
    nameZh: toy.names?.zh || toy.nameZh || null,
    runtimeCanonicalKey: toy.canonicalKey || null,
    legacyCanonicalKeys: clone(toy.legacyCanonicalKeys || []),
    parentCanonicalKey: toy.set?.parentCanonicalKey || toy.parentCanonicalKey || null,
    partIndex: toy.set?.partIndex ?? toy.partIndex ?? null,
    ownershipGroupId: toy.set?.ownershipGroupId || toy.ownershipGroupId || null,
    personalImageRef: imageRef?.kind === "personal" ? imageRef : clone(toy.personalImageRef || null),
    storedOwnershipImageRef: imageRef,
    inheritedImageRef: clone(toy.inheritedImageRef || toy.imageMetadata?.inheritedImageRef || null),
    lookupKeysActuallyTried: []
  };
}
function resolutionPath(row, catalogToy) {
  if (!catalogToy) return "catalog_no_match";
  const hit = row.lookupKeysActuallyTried.find((x) => x.hit && normalizeKey(x.hitCanonicalKey) === normalizeKey(catalogToy.canonicalKey));
  return hit ? `explicit_key:${hit.normalizedKey}` : "structural_or_identity_fallback";
}
function summarizeStages(events, resolutions) {
  const all = [...resolutions.values()].flat(), pre = latestByToy(all.filter((x) => x.phase === "pre_catalog_hydrate")), post = latestByToy(all.filter((x) => x.phase === "post_catalog_hydrate"));
  const hydrationIndex = events.findIndex((x) => x.type === "catalog_hydration_complete");
  return { firstSweepResolvableCount: [...pre.values()].filter((x) => !isPlaceholderRef(x.resolverReturnedImageRef)).length, postHydrateResolvableCount: [...post.values()].filter((x) => !isPlaceholderRef(x.resolverReturnedImageRef)).length, catalogHydrationCompleted: hydrationIndex >= 0, postHydrateRenderObserved: hydrationIndex >= 0 && events.slice(hydrationIndex + 1).some((x) => x.type === "render_complete"), placeholderThenCatalogTransitions: [...post].filter(([id, row]) => isPlaceholderRef(pre.get(id)?.resolverReturnedImageRef) && !isPlaceholderRef(row.resolverReturnedImageRef)).length };
}
function latestByToy(rows) {
  const map = /* @__PURE__ */ new Map();
  for (const row of rows) map.set(row.toyLibraryId, row);
  return map;
}
function isLoveveryChild(toy) {
  return toy?.set?.kind === "child" && /lovevery/i.test(`${toy.brand || ""} ${toy.set?.parentCanonicalKey || ""} ${toy.canonicalKey || ""}`);
}
function isPlaceholderRef(ref) {
  return !ref || ref.kind === "placeholder" || ref.kind === "generated" && ref.assetState === "placeholder";
}
function isPlaceholderResult(ref, src) {
  return isPlaceholderRef(ref) || /(?:icon-192\.png|missing-catalog-metadata)/i.test(String(src || ""));
}
function normalizeKey(value) {
  return String(value || "").normalize("NFKC").trim().toLowerCase();
}
function clone(value) {
  if (value == null) return value;
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}
function mapObject(map) {
  return Object.fromEntries([...map].map(([id, rows]) => [id, clone(rows)]));
}
function collectLiveDom(doc) {
  const result2 = {};
  for (const image of doc?.querySelectorAll?.("img[data-runtime-image-toy-id]") || []) {
    const id = image.dataset.runtimeImageToyId;
    result2[id] = { domImgSrc: image.getAttribute("src") || null, domCurrentSrc: image.currentSrc || image.src || null, complete: Boolean(image.complete), naturalWidth: Number(image.naturalWidth || 0), isPlaceholder: isPlaceholderResult(parseJson(image.dataset.image), image.currentSrc || image.src) };
  }
  return result2;
}
function parseJson(value) {
  try {
    return JSON.parse(value || "null");
  } catch {
    return null;
  }
}
async function cacheNames(storage) {
  try {
    return storage?.keys ? await storage.keys() : [];
  } catch (error) {
    return [`unavailable:${error?.message || error}`];
  }
}

// src/features/recognition-device-diagnostic.js
var MAX_EVENTS2 = 500;
var SNAPSHOT_LIMIT = 2e4;
var now = () => (/* @__PURE__ */ new Date()).toISOString();
var environment = () => ({ userAgent: navigator.userAgent || "", platform: navigator.platform || "", language: navigator.language || "", standalone: navigator.standalone === true, displayModeStandalone: matchMedia?.("(display-mode: standalone)")?.matches === true, viewport: { width: innerWidth, height: innerHeight, devicePixelRatio }, visibility: document.visibilityState, serviceWorkerController: Boolean(navigator.serviceWorker?.controller), url: location.href, origin: location.origin });
var RecognitionDeviceDiagnostic = class {
  #sessions = [];
  #armed = false;
  #active = null;
  #errorListener = null;
  #rejectionListener = null;
  #appendRestore = null;
  constructor({ build = globalThis.TOY_ROTATION_CONFIG || {} } = {}) {
    this.build = build;
  }
  get recording() {
    return this.#armed;
  }
  get sessions() {
    return this.#sessions.map((session) => structuredClone(session));
  }
  start() {
    this.#armed = true;
    this.#installErrorCapture();
    return this.record("trace_armed", {});
  }
  stop() {
    this.record("trace_stopped", {});
    this.#restoreAppendInstrumentation();
    this.#removeErrorCapture();
    this.#armed = false;
    this.#active = null;
  }
  clear() {
    this.stop();
    this.#sessions = [];
  }
  begin(draftId) {
    if (!this.#armed) return null;
    const session = { sessionId: crypto.randomUUID(), recognitionDraftId: draftId, startedAt: now(), buildId: this.build.buildId || null, appVersion: this.build.appVersion || this.build.RELEASE || null, environment: environment(), events: [], finalStateSummary: null };
    this.#sessions.push(session);
    this.#active = session;
    this.record("review_open_requested", { draftId });
    return session;
  }
  record(eventName, payload = {}) {
    const session = this.#active;
    if (!session) return null;
    if (session.events.length >= MAX_EVENTS2) return null;
    const event = { seq: session.events.length + 1, timestamp: now(), performanceTime: globalThis.performance?.now?.() ?? null, eventName, payload };
    session.events.push(event);
    return event;
  }
  state(name, state, extra = {}) {
    this.record(name, { ...extra, toyCount: state.toys?.length || 0, wishlistCount: state.wishlist?.length || 0, candidateCount: localCandidates(state).length, pendingCandidateCount: pendingCandidateCount(state), pendingDraftCount: (state.drafts || []).filter((d) => String(d.status).startsWith("ready")).length });
  }
  storeUpdate(reason2, before, after) {
    this.record("store_update_requested", { reason: reason2, before: storeSnapshot(before) });
    this.record("store_update_started", { reason: reason2 });
    this.record("store_update_completed", { reason: reason2, after: storeSnapshot(after) });
  }
  storeUpdateFailed(reason2, before, error) {
    this.record("store_update_failed", { reason: reason2, before: storeSnapshot(before), message: error?.message || String(error) });
  }
  subscriberFired(reason2, state) {
    this.record("store_subscriber_fired", { reason: reason2, after: storeSnapshot(state) });
  }
  pendingSelector(state, detail = {}) {
    this.record("pending_selector_evaluated", { ...detail, pendingCandidateCount: pendingCandidateCount(state), candidateCount: localCandidates(state).length });
  }
  badge(stage, detail = {}) {
    this.record(`badge_render_${stage}`, detail);
  }
  observeReview({ root: root2, form, dialog, draftId }) {
    if (!this.#active) return () => {
    };
    this.#installAppendInstrumentation(root2, draftId);
    const listen = (target, name, handler, opts) => target.addEventListener(name, handler, opts);
    const clicks = { library: 0, wishlist: 0 };
    const eventPayload = (event) => ({ target: event.target?.tagName || null, currentTarget: event.currentTarget?.tagName || null, button: event.button ?? null, detail: event.detail ?? null, isTrusted: event.isTrusted, defaultPrevented: event.defaultPrevented, eventPhase: event.eventPhase, timeStamp: event.timeStamp });
    for (const button of root2.querySelectorAll("[data-destination]")) {
      const destination = button.dataset.destination;
      this.record(`${destination}_button_facts`, { tagName: button.tagName, typeAttribute: button.getAttribute("type"), typeProperty: button.type, disabled: button.disabled, formOwner: button.form?.id || button.form?.tagName || null, name: button.name, value: button.value, destination });
      for (const type of ["pointerdown", "pointerup", "touchstart", "touchend", "click"]) listen(button, type, (event) => {
        if (type === "click") clicks[destination]++;
        this.record(`${destination}_${type}`, { ...eventPayload(event), clickIndex: clicks[destination] });
      }, { capture: true, passive: true });
    }
    this.record("form_created", { checkValidity: form.checkValidity(), method: form.method, action: form.action, noValidate: form.noValidate });
    listen(form, "submit", (event) => this.record("form_submit_received", { submitCount: (this.#active?.events.filter((e) => e.eventName === "form_submit_received").length || 0) + 1, submitter: event.submitter ? { tag: event.submitter.tagName, name: event.submitter.name, value: event.submitter.value, destination: event.submitter.dataset?.destination || null } : null, defaultPrevented: event.defaultPrevented, checkValidity: form.checkValidity(), activeElement: document.activeElement?.tagName || null, draftId }), { capture: true });
    const inspect = (node) => {
      const text2 = node?.nodeType === Node.TEXT_NODE ? node.textContent : "";
      if (/^\d+$/.test(String(text2).trim())) {
        const parent = node.parentElement;
        this.record("numeric_text_detected", { text: text2.trim(), parentTag: parent?.tagName || null, parentId: parent?.id || null, parentClass: parent?.className || "", currentDraftId: draftId });
        if (text2.trim() === "22") {
          this.record("text_22_detected", {});
          this.record("review_html_snapshot_on_22", { html: root2.innerHTML.slice(0, SNAPSHOT_LIMIT), truncated: root2.innerHTML.length > SNAPSHOT_LIMIT });
        }
      }
    };
    const observer = new MutationObserver((records) => records.forEach((record) => [...record.addedNodes, record.target].forEach(inspect)));
    observer.observe(root2, { childList: true, characterData: true, subtree: true });
    const close = () => {
      this.record("dialog_close_event", { open: dialog.open, isConnected: root2.isConnected });
      requestAnimationFrame(() => this.record("review_close_raf", { open: dialog.open, isConnected: root2.isConnected }));
      setTimeout(() => this.record("review_close_timeout", { open: dialog.open, isConnected: root2.isConnected, hidden: root2.hidden, display: getComputedStyle(root2).display, visibility: getComputedStyle(root2).visibility }), 100);
    };
    listen(dialog, "close", close, { once: true });
    return () => {
      observer.disconnect();
      this.#restoreAppendInstrumentation();
    };
  }
  finish(state, { reviewClosed = false } = {}) {
    if (!this.#active) return;
    this.state("review_final_state", state, { reviewClosed });
    this.#active.finalStateSummary = { toyCount: state.toys?.length || 0, wishlistCount: state.wishlist?.length || 0, candidateCount: localCandidates(state).length, pendingCandidateCount: pendingCandidateCount(state), pendingDraftCount: (state.drafts || []).filter((d) => String(d.status).startsWith("ready")).length, reviewClosed, numeric22Detected: this.#active.events.some((event) => event.eventName === "text_22_detected") };
  }
  export() {
    return { diagnosticVersion: 1, appVersion: this.build.appVersion || this.build.RELEASE || null, buildId: this.build.buildId || null, exportedAt: now(), environment: environment(), sessions: this.sessions };
  }
  #installErrorCapture() {
    if (this.#errorListener) return;
    this.#errorListener = (event) => this.record("window_error", { message: event.message || event.error?.message || "", filename: event.filename || null, line: event.lineno || null, column: event.colno || null, stack: event.error?.stack || null });
    this.#rejectionListener = (event) => {
      const reason2 = event.reason;
      this.record("unhandled_rejection", { message: reason2?.message || String(reason2 || ""), stack: reason2?.stack || null });
    };
    window.addEventListener("error", this.#errorListener);
    window.addEventListener("unhandledrejection", this.#rejectionListener);
  }
  #removeErrorCapture() {
    if (this.#errorListener) window.removeEventListener("error", this.#errorListener);
    if (this.#rejectionListener) window.removeEventListener("unhandledrejection", this.#rejectionListener);
    this.#errorListener = null;
    this.#rejectionListener = null;
  }
  #installAppendInstrumentation(root2, draftId) {
    this.#restoreAppendInstrumentation();
    const instrument = (prototype, name) => {
      const original = prototype[name];
      const diagnostic = this;
      prototype[name] = function(...values) {
        if (diagnostic.#active && root2.contains(this)) {
          for (const value of values) {
            const text2 = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
            if (/^\d+$/.test(text2)) {
              const target = { tag: this.tagName || null, id: this.id || null, class: this.className || "" };
              diagnostic.record("numeric_append_detected", { value: text2, target, draftId, stack: new Error().stack || null });
              if (text2 === "22") diagnostic.record("text_22_append_detected", { value: text2, target, stack: new Error().stack || null });
            }
          }
        }
        return original.apply(this, values);
      };
      return () => {
        prototype[name] = original;
      };
    };
    const restores = [instrument(Element.prototype, "append"), instrument(Node.prototype, "appendChild")];
    this.#appendRestore = () => {
      restores.forEach((restore) => restore());
      this.#appendRestore = null;
    };
  }
  #restoreAppendInstrumentation() {
    this.#appendRestore?.();
  }
};
function storeSnapshot(state = {}) {
  return { toys: state.toys?.length || 0, wishlist: state.wishlist?.length || 0, localCandidates: localCandidates(state).length, drafts: state.drafts?.length || 0, schemaVersion: state.schemaVersion ?? null };
}

// src/features/admin-catalog-save-diagnostic.js
var MAX_EVENTS3 = 120;
var AdminCatalogSaveDiagnostic = class {
  #recording = false;
  #events = [];
  #clock;
  constructor({ clock = () => (/* @__PURE__ */ new Date()).toISOString(), createId = () => crypto.randomUUID() } = {}) {
    this.#clock = clock;
    this.createId = createId;
  }
  get recording() {
    return this.#recording;
  }
  get eventCount() {
    return this.#events.length;
  }
  start() {
    this.#recording = true;
  }
  stop() {
    this.#recording = false;
  }
  clear() {
    this.#events = [];
  }
  begin({ editedImagePresent = false } = {}) {
    if (!this.#recording) return null;
    const attemptId = this.createId();
    this.record(attemptId, "submit_received", { editedImagePresent: Boolean(editedImagePresent) });
    return attemptId;
  }
  record(attemptId, stage, details = {}) {
    if (!this.#recording || !attemptId) return;
    this.#events.push({ attemptId, at: this.#clock(), stage, ...sanitize(details) });
    if (this.#events.length > MAX_EVENTS3) this.#events.splice(0, this.#events.length - MAX_EVENTS3);
  }
  export({ release = null } = {}) {
    return {
      format: "toy-rotation-admin-catalog-save-diagnostic",
      diagnosticVersion: 1,
      exportedAt: this.#clock(),
      readOnly: true,
      release,
      recording: this.#recording,
      events: structuredClone(this.#events)
    };
  }
};
function adminCatalogSaveErrorType(error) {
  const code = String(error?.message || "");
  return ["adminVerificationRequired", "adminUnconfigured", "catalogImageUploadFailed", "adminOperationFailed"].includes(code) ? code : String(error?.name || "UnknownError");
}
function sanitize(details) {
  return {
    editedImagePresent: Boolean(details.editedImagePresent),
    status: Number.isInteger(details.status) ? details.status : null,
    ok: typeof details.ok === "boolean" ? details.ok : null,
    errorType: details.errorType ? String(details.errorType) : null,
    modalOpen: typeof details.modalOpen === "boolean" ? details.modalOpen : null,
    errorRendered: typeof details.errorRendered === "boolean" ? details.errorRendered : null,
    editorRetained: typeof details.editorRetained === "boolean" ? details.editorRetained : null
  };
}

// src/features/storage-usage-diagnostic.js
var encoder = new TextEncoder();
var bytes = (value) => encoder.encode(typeof value === "string" ? value : JSON.stringify(value ?? null)).byteLength;
var toyKey = (key) => /^toyRotation/i.test(key);
function count3(value, pattern) {
  return (JSON.stringify(value ?? null).match(pattern) || []).length;
}
async function buildStorageUsageDiagnostic({ state, build = {} } = {}) {
  const keys = [];
  let total = 0, canonical = 0, staging = 0, shadow = 0, snapshots = 0, startupDiagnostic = 0, health = 0, other = 0;
  for (let index = 0; index < (globalThis.localStorage?.length || 0); index++) {
    const key = localStorage.key(index);
    if (!toyKey(key)) continue;
    const value = localStorage.getItem(key) || "";
    const item = { key, chars: value.length, utf8Bytes: bytes(value) };
    keys.push(item);
    total += item.utf8Bytes;
    if (key === "toyRotation.cleanBaseline") canonical += item.utf8Bytes;
    else if (/commitStaging|recoveryStaging/i.test(key)) staging += item.utf8Bytes;
    else if (/lastKnownGood/i.test(key)) shadow += item.utf8Bytes;
    else if (/snapshot-\d+/i.test(key)) snapshots += item.utf8Bytes;
    else if (/startupDiagnostic/i.test(key)) startupDiagnostic += item.utf8Bytes;
    else if (/persistenceHealth/i.test(key)) health += item.utf8Bytes;
    else other += item.utf8Bytes;
  }
  let estimate = { available: false, usage: null, quota: null, usagePercent: null };
  try {
    const value = await navigator.storage?.estimate?.();
    if (value) {
      estimate = { available: true, usage: value.usage ?? null, quota: value.quota ?? null, usagePercent: value.quota ? Number((value.usage / value.quota * 100).toFixed(2)) : null };
    }
  } catch {
  }
  return { diagnosticVersion: 1, appVersion: build.appVersion || build.RELEASE || null, buildId: build.buildId || null, exportedAt: (/* @__PURE__ */ new Date()).toISOString(), localStorage: { keys, canonicalBytes: canonical, stagingBytes: staging, shadowBytes: shadow, snapshotCount: keys.filter((item) => /snapshot-\d+/i.test(item.key)).length, snapshotBytes: snapshots, startupDiagnosticBytes: startupDiagnostic, persistenceHealthBytes: health, otherToyRotationBytes: other, estimatedFullStateCopies: canonical ? Number(((canonical + staging + shadow + snapshots) / canonical).toFixed(2)) : 0, totalToyRotationBytes: total }, stateBreakdown: { draftsBytes: bytes(state?.drafts), candidatesBytes: bytes(state?.catalogState?.syncMetadata?.localCandidates), governanceBytes: bytes(state?.catalogState?.syncMetadata?.governanceOutbox), diagnosticBytes: startupDiagnostic, embeddedDataImageCount: count3(state, /data:image\//gi), base64LikeCount: count3(state, /;base64,/gi) }, storageEstimate: estimate };
}

// src/features/catalog-count-diagnostic.js
function buildCatalogCountDiagnostic({ catalog: catalog2, build = {}, uiSearchRows = null, exportedAt = (/* @__PURE__ */ new Date()).toISOString() } = {}) {
  const snapshot = catalog2?.catalogCountSnapshot?.() || { raw: { base: 0, remote: 0, localLearned: 0, localRemote: 0, total: 0 }, tombstoneCount: 0, active: 0, publicVisible: 0, remoteIds: [], localOnlyIds: [], collisionSummary: { canonicalKeyCollisions: [], total: 0 } };
  return {
    format: "toy-rotation-catalog-count-diagnostic",
    diagnosticVersion: 1,
    readOnly: true,
    exportedAt,
    build: { release: build.RELEASE || build.appVersion || null, buildId: build.buildId || null },
    catalog: snapshot,
    ui: { searchRows: uiSearchRows, total: snapshot.publicVisible, publicVisibleTotal: snapshot.publicVisible }
  };
}

// src/domain/catalog-image-usability.js
var IMAGE_USABILITY = Object.freeze({
  VERIFIED_USABLE_IMAGE: "VERIFIED_USABLE_IMAGE",
  VERIFIED_PACKAGED_IMAGE: "VERIFIED_PACKAGED_IMAGE",
  VERIFIED_REMOTE_IMAGE: "VERIFIED_REMOTE_IMAGE",
  PLACEHOLDER_ONLY: "PLACEHOLDER_ONLY",
  IMAGE_SOURCE_UNVERIFIED: "IMAGE_SOURCE_UNVERIFIED",
  KNOWN_BROKEN_IMAGE: "KNOWN_BROKEN_IMAGE",
  NO_IMAGE: "NO_IMAGE"
});
function classifyCatalogImage(ref) {
  if (!ref) return IMAGE_USABILITY.NO_IMAGE;
  if (ref.kind === "personal") return IMAGE_USABILITY.VERIFIED_USABLE_IMAGE;
  if (ref.kind === "generated" || ref.kind === "placeholder") return IMAGE_USABILITY.PLACEHOLDER_ONLY;
  if (ref.assetState === "known_broken" || ref.verificationStatus === "known_broken") return IMAGE_USABILITY.KNOWN_BROKEN_IMAGE;
  if (ref.kind === "packaged" && ref.verificationStatus === "verified_real" && ref.contentHash && ref.mimeType) return IMAGE_USABILITY.VERIFIED_PACKAGED_IMAGE;
  if (ref.kind === "remote" && ["verified_real", "manually_confirmed"].includes(ref.verificationStatus)) return IMAGE_USABILITY.VERIFIED_REMOTE_IMAGE;
  if (ref.kind === "remote" || ref.imageSource) return IMAGE_USABILITY.IMAGE_SOURCE_UNVERIFIED;
  return IMAGE_USABILITY.NO_IMAGE;
}

// src/features/real-device-owned-wishlist-image-audit.js
var TOY_IMAGE_AUDIT_VERSION = "v0.11.6";
var PRIORITY_BRANDS = /* @__PURE__ */ new Set(["mideer", "cherry-pick", "learning resources", "lego / duplo", "lego duplo"]);
var USABLE = /* @__PURE__ */ new Set(["VERIFIED_PACKAGED", "VERIFIED_REMOTE", "CATALOG_IDB", "PERSONAL_IMAGE"]);
function buildToyImageAudit({ state = {}, catalog: catalog2, build = {}, generatedAt = (/* @__PURE__ */ new Date()).toISOString() } = {}) {
  const activeRows = Array.isArray(catalog2) ? catalog2 : catalog2?.active || [];
  const resolve = (reference) => catalog2?.resolve?.(reference) || resolveFromRows(reference, activeRows);
  const catalogRows = catalogPresentationRows(activeRows, resolve);
  const catalogStates = catalogRows.map((item) => imageState(catalogImageForAudit(item, catalog2, resolve)));
  const owned = buildOwned(state.toys || [], resolve, state);
  const wishlist = buildWishlist(state.wishlist || [], resolve);
  return {
    auditVersion: TOY_IMAGE_AUDIT_VERSION,
    buildId: text(build.buildId),
    generatedAt,
    catalog: { visibleCatalogTotal: catalogRows.length, usableImageCount: catalogStates.filter(usable).length, placeholderCount: catalogStates.filter((state2) => state2 === "PLACEHOLDER_ONLY").length, packagedImageCount: catalogStates.filter((state2) => state2 === "VERIFIED_PACKAGED").length, remoteImageCount: catalogStates.filter((state2) => state2 === "VERIFIED_REMOTE").length, catalogIdbImageCount: catalogStates.filter((state2) => state2 === "CATALOG_IDB").length, structuralCoverage: coverage(catalogStates.filter(usable).length, catalogRows.length) },
    owned,
    wishlist,
    priorityMissing: priorityRows(owned.items, wishlist.items)
  };
}
function buildOwned(toys, resolve, state) {
  const shelf = currentShelfCollections(state);
  const shelfIds = /* @__PURE__ */ new Set([...shelf.rotationIds, ...shelf.permanentIds, ...shelf.manualIds]);
  const items = toys.map((toy) => {
    const catalog2 = resolve(toy);
    if (!catalog2) return null;
    const catalogImageState = imageState(catalogImageForAudit(toy, catalog2, resolve));
    const hasPersonalImage = toy.imageRef?.kind === "personal";
    const state2 = hasPersonalImage ? "PERSONAL_IMAGE" : catalogImageState;
    return { personalToyId: text(toy.id), canonicalKey: text(catalog2.canonicalKey), catalogId: text(catalog2.id), brand: text(catalog2.brand), name: text(catalog2.productName), imageState: state2, imageSourceType: sourceType(state2), hasPersonalImage, catalogImageState, catalogImageMissing: !usable(catalogImageState), userVisibleImageMissing: !usable(state2), currentShelfState: shelfIds.has(toy.id) ? "CURRENT_SHELF" : "NOT_CURRENT_SHELF", permanentState: isUserCustomPermanent(toy) ? "USER_PERMANENT" : "NOT_USER_PERMANENT" };
  }).filter(Boolean);
  const userVisible = summary(toys.length, items, true);
  const catalogStates = items.map((item) => item.catalogImageState);
  const ownedCatalogImage = { mappedTotal: items.length, usableCatalogImage: catalogStates.filter(usable).length, placeholderCatalogImage: catalogStates.filter((state2) => state2 === "PLACEHOLDER_ONLY").length, noCatalogImage: catalogStates.filter((state2) => state2 === "NO_IMAGE").length, brokenCatalogImage: catalogStates.filter((state2) => state2 === "KNOWN_BROKEN").length, coverage: coverage(catalogStates.filter(usable).length, items.length) };
  return { ...userVisible, userVisibleImage: userVisible, ownedCatalogImage };
}
function buildWishlist(wishlist, resolve) {
  const items = wishlist.map((wish) => {
    const catalog2 = resolve(wish);
    if (!catalog2) return null;
    const state = imageState(catalogImageForAudit(wish, catalog2, resolve));
    return { wishlistItemId: text(wish.id), canonicalKey: text(catalog2.canonicalKey), catalogId: text(catalog2.id), brand: text(catalog2.brand), name: text(catalog2.productName), exactIdentity: Boolean(catalog2.exactTitle || catalog2.sku || catalog2.setNumber || catalog2.variantId), variant: nullable(catalog2.variantName || catalog2.variantId), setNumber: nullable(catalog2.setNumber), sku: nullable(catalog2.sku), imageState: state, imageSourceType: sourceType(state), catalogImageMissing: !usable(state), userVisibleImageMissing: !usable(state) };
  }).filter(Boolean);
  return summary(wishlist.length, items, false);
}
function summary(total, items, owned) {
  const states = items.map((item) => item.imageState);
  const result2 = { total, mappedToCatalog: items.length, usableImage: states.filter(usable).length, placeholderOnly: states.filter((state) => state === "PLACEHOLDER_ONLY").length, missingImage: states.filter((state) => !usable(state) && state !== "PLACEHOLDER_ONLY").length, packagedImage: states.filter((state) => state === "VERIFIED_PACKAGED").length, remoteImage: states.filter((state) => state === "VERIFIED_REMOTE").length, coverage: coverage(states.filter(usable).length, items.length), items };
  return owned ? { ...result2, personalImage: states.filter((state) => state === "PERSONAL_IMAGE").length } : result2;
}
function priorityRows(owned, wishlist) {
  const rows = [...owned.filter((item) => item.catalogImageMissing).map((item) => ({ source: "owned", ...item, priorityBand: item.currentShelfState === "CURRENT_SHELF" ? "P0" : "P1" })), ...wishlist.filter((item) => item.catalogImageMissing).map((item) => ({ source: "wishlist", ...item, priorityBand: "P2" }))].map((item) => ({ source: item.source, canonicalKey: item.canonicalKey, brand: item.brand, name: item.name, catalogImageState: item.catalogImageState || item.imageState, hasPersonalImage: Boolean(item.hasPersonalImage), currentShelf: item.currentShelfState, priorityBand: item.priorityBand, exactIdentityAvailable: item.source === "wishlist" ? item.exactIdentity ? "YES" : "NO" : "YES", priorityBrand: PRIORITY_BRANDS.has(item.brand.toLowerCase()) }));
  const rank2 = { P0: 0, P1: 1, P2: 2 };
  return rows.sort((left, right) => rank2[left.priorityBand] - rank2[right.priorityBand] || Number(right.priorityBrand) - Number(left.priorityBrand) || left.canonicalKey.localeCompare(right.canonicalKey));
}
function imageState(ref) {
  if (ref?.kind === "catalog") return "CATALOG_IDB";
  if (ref?.kind === "packaged" && /^catalog-assets\/[a-z0-9][a-z0-9._-]*\.(?:svg|png|webp|jpe?g)$/i.test(String(ref.path || ""))) return "VERIFIED_PACKAGED";
  const classification = classifyCatalogImage(ref);
  return { [IMAGE_USABILITY.VERIFIED_PACKAGED_IMAGE]: "VERIFIED_PACKAGED", [IMAGE_USABILITY.VERIFIED_REMOTE_IMAGE]: "VERIFIED_REMOTE", [IMAGE_USABILITY.VERIFIED_USABLE_IMAGE]: "PERSONAL_IMAGE", [IMAGE_USABILITY.PLACEHOLDER_ONLY]: "PLACEHOLDER_ONLY", [IMAGE_USABILITY.IMAGE_SOURCE_UNVERIFIED]: "IMAGE_SOURCE_UNVERIFIED", [IMAGE_USABILITY.KNOWN_BROKEN_IMAGE]: "KNOWN_BROKEN", [IMAGE_USABILITY.NO_IMAGE]: "NO_IMAGE" }[classification] || "NO_IMAGE";
}
function catalogImageForAudit(reference, catalog2, resolve) {
  const catalogToy = resolve(reference) || reference;
  if (catalog2?.resolve) {
    return resolvedLibraryImageRef({ ...reference, imageRef: { kind: "placeholder" } }, catalog2) || catalogToy.imageRef;
  }
  return catalogToy.imageRef;
}
function catalogPresentationRows(activeRows, resolve) {
  const rows = [];
  const seen = /* @__PURE__ */ new Set();
  for (const parent of activeRows) {
    for (const candidate of [parent, ...parent.children || []]) {
      const row = resolve(candidate) || candidate;
      const key = text(row.canonicalKey || row.id);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      rows.push(row);
    }
  }
  return rows;
}
function sourceType(state) {
  return { VERIFIED_PACKAGED: "packaged", VERIFIED_REMOTE: "remote", CATALOG_IDB: "catalog_idb", PERSONAL_IMAGE: "personal", PLACEHOLDER_ONLY: "placeholder", IMAGE_SOURCE_UNVERIFIED: "unverified", KNOWN_BROKEN: "broken", NO_IMAGE: "none" }[state];
}
function usable(state) {
  return USABLE.has(state);
}
function coverage(numerator, denominator) {
  return denominator ? Number((numerator / denominator).toFixed(4)) : 0;
}
function text(value) {
  return String(value || "");
}
function nullable(value) {
  const result2 = text(value);
  return result2 || null;
}
function resolveFromRows(reference, rows) {
  const keys = [reference?.canonicalKey, reference?.catalogKey, reference?.catalogId].filter(Boolean).map(String);
  return rows.find((row) => keys.includes(String(row.canonicalKey)) || keys.includes(String(row.id))) || null;
}

// src/features/catalog-safety-audit.js
var CATALOG_SAFETY_AUDIT_VERSION = "v0.11.6";
var PRIORITY_BRANDS2 = /* @__PURE__ */ new Set(["mideer", "lovevery", "hape", "learning resources", "lego duplo", "lego / duplo", "vtech", "brio"]);
function buildCatalogSafetyAudit({ state = {}, catalog: catalog2, build = {}, generatedAt = (/* @__PURE__ */ new Date()).toISOString() } = {}) {
  const rows = Array.isArray(catalog2) ? catalog2 : catalog2?.active || [];
  const age = childAgeMonths(state.profile?.childBirthDate, new Date(generatedAt).getTime());
  const profile = state.profile?.developmentProfile || {};
  const resolve = (reference) => catalog2?.resolve?.(reference) || rows.find((row) => [reference?.canonicalKey, reference?.catalogId].includes(row.canonicalKey) || reference?.catalogId === row.id) || null;
  const owned = mappedRows(state.toys || [], resolve, state, age, profile);
  const wishlist = mappedRows(state.wishlist || [], resolve, state, age, profile);
  const rotation = mappedRows((state.toys || []).filter((toy) => !toy.hidden && !toy.archived && toy.set?.kind !== "parent" && toy.rotationParticipation !== "paused" && toy.permanentSource !== "user"), resolve, state, age, profile);
  const frequent = rows.filter((row) => row.minAgeMonths >= 18 && row.minAgeMonths <= 36 && PRIORITY_BRANDS2.has(String(row.brand || "").toLowerCase())).map((row) => safetyRow(row, null, state, age, profile));
  return {
    auditVersion: CATALOG_SAFETY_AUDIT_VERSION,
    buildId: String(build.buildId || ""),
    generatedAt,
    catalog: { total: rows.length, statusDistribution: distribution(rows.map(safetyRow)), frequent18To36: frequent },
    owned,
    wishlist,
    rotationCandidates: rotation
  };
}
function mappedRows(items, resolve, state, age, profile) {
  const mapped = items.map((item) => ({ item, row: resolve(item) })).filter((pair) => pair.row).map(({ item, row }) => safetyRow(row, item, state, age, profile));
  return {
    total: items.length,
    mappedToCatalog: mapped.length,
    unmapped: items.length - mapped.length,
    statusDistribution: distribution(mapped),
    items: mapped
  };
}
function safetyRow(row, reference, state, age, profile) {
  const safety = row.userMetadata?.safety || {};
  const ageSafetyStatus = catalogSafetyStatus(row);
  const projected = { ...withCatalogSafety(reference || row, row), canonicalKey: row.canonicalKey, minAgeMonths: row.minAgeMonths };
  const approval = crossAgeApprovalFor(state, projected);
  const decision = rotationAgeEligibility({ ...projected, crossAgeApproval: approval }, age, profile);
  return {
    canonicalKey: String(row.canonicalKey || ""),
    productName: String(row.productName || ""),
    brand: String(row.brand || ""),
    sku: String(row.sku || row.setNumber || "") || null,
    recommendedMinAgeMonths: row.minAgeMonths ?? null,
    ageSafetyStatus,
    childAgeMonths: age,
    crossAgeApproval: approval ? {
      approved: true,
      approvedAt: approval.approvedAt,
      canonicalKey: approval.canonicalKey,
      sourceRecommendedMinAgeMonths: approval.sourceRecommendedMinAgeMonths
    } : { approved: false },
    eligibilityResult: decision.eligible ? "ELIGIBLE" : "BLOCKED",
    eligibilityReason: decision.reason,
    hardMinAgeMonths: ageSafetyStatus === "UNKNOWN" ? null : safety.hardMinAgeMonths ?? null,
    smallParts: ageSafetyStatus === "UNKNOWN" ? "unknown" : safety.smallParts ?? "unknown",
    requiresStandingStability: ageSafetyStatus === "UNKNOWN" ? "unknown" : safety.requiresStandingStability ?? "unknown",
    warningType: ageSafetyStatus === "UNKNOWN" ? null : safety.warningType || null,
    safetySource: ageSafetyStatus === "UNKNOWN" ? null : safety.safetySource,
    evidenceNote: ageSafetyStatus === "UNKNOWN" ? null : safety.evidenceNote,
    safetyNotes: ageSafetyStatus === "UNKNOWN" ? null : safety.safetyNotes || null,
    safetyVerifiedAt: ageSafetyStatus === "UNKNOWN" ? null : safety.safetyVerifiedAt
  };
}
function distribution(items) {
  return Object.fromEntries(AGE_SAFETY_STATUSES.map((status) => [status, items.filter((item) => item.ageSafetyStatus === status).length]));
}

// src/features/cross-age-challenges.js
function challengeDecision(state, catalog2, toy, age, profile = {}) {
  const row = catalog2.resolve(toy);
  if (!row || age == null) return null;
  const projected = { ...withCatalogSafety(toy, row), minAgeMonths: row.minAgeMonths };
  const approval = crossAgeApprovalFor(state, projected);
  return {
    row,
    projected,
    approval,
    choice: crossAgeChoiceFor(state, projected),
    decision: rotationAgeEligibility({ ...projected, crossAgeApproval: approval }, age, profile)
  };
}
function parentApprovableChallenge(state, catalog2, toy, age, profile = {}) {
  if (!toy || toy.hidden || toy.archived || toy.set?.kind === "parent" || isRotationPaused(toy) || isUserCustomPermanent(toy)) return null;
  const review = challengeDecision(state, catalog2, toy, age, profile);
  if (!review || catalogSafetyStatus(review.row) !== "NO_DOCUMENTED_HARD_GATE" || review.row.minAgeMonths == null || age >= review.row.minAgeMonths) return null;
  return ["PARENT_APPROVAL_REQUIRED", "PARENT_APPROVED_CROSS_AGE"].includes(review.decision.reason) ? { toy, ...review } : null;
}
function parentApprovableChallenges(state, catalog2, age, profile = {}) {
  return (state.toys || []).map((toy) => parentApprovableChallenge(state, catalog2, toy, age, profile)).filter(Boolean);
}

// src/features/startup-trace.js
var WATCHDOG_DELAY_MS = 750;
function now2() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}
function startupCopy(language = "") {
  return String(language).toLowerCase().startsWith("zh") ? { title: "\u73A9\u5177\u8F6E\u6362\u6B63\u5728\u542F\u52A8\u2026", detail: "\u6B63\u5728\u5B89\u5168\u52A0\u8F7D\u672C\u5730\u6570\u636E\u3002" } : { title: "Toy Rotation is starting\u2026", detail: "Loading your local data safely." };
}
function beginStartupTrace(globalObject = globalThis) {
  const navigation = globalObject.performance?.getEntriesByType?.("navigation")?.[0];
  const trace = {
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    release: globalObject.TOY_ROTATION_CONFIG?.RELEASE || "development",
    latestStage: "navigation_start",
    stages: {
      navigation_start: 0,
      html_parsed: Number.isFinite(navigation?.domInteractive) ? navigation.domInteractive : null
    },
    errors: []
  };
  globalObject.__TOY_ROTATION_STARTUP_TIMING__ = trace;
  return trace;
}
function markStartupStage(trace, name, details = void 0) {
  if (!trace) return;
  trace.stages[name] = now2();
  trace.latestStage = name;
  if (details !== void 0) (trace.details ||= {})[name] = details;
}
function markStartupError(trace, stage, error) {
  if (!trace) return;
  trace.errors.push({ stage, message: String(error?.message || error || "Unknown startup error"), at: now2() });
  trace.latestStage = stage;
}
function renderStartupShell(root2, language) {
  if (!root2) return;
  const copy = startupCopy(language);
  root2.innerHTML = `<section class="startup-shell" role="status" aria-live="polite"><div class="startup-spinner" aria-hidden="true"></div><div><h1>${copy.title}</h1><p data-startup-detail>${copy.detail}</p></div></section>`;
}
function installStartupWatchdog(root2, trace, { delayMs = WATCHDOG_DELAY_MS, language = globalThis.navigator?.language } = {}) {
  return setTimeout(() => {
    if (trace?.stages?.first_meaningful_paint) return;
    const copy = startupCopy(language);
    const stage = trace?.latestStage || "starting";
    if (root2) root2.innerHTML = `<section class="startup-shell startup-safe-mode" role="alert"><div><h1>${copy.title}</h1><p>${copy.detail}</p><p><b>Startup phase:</b> ${String(stage)}</p><p>${trace?.errors?.[0]?.message ? String(trace.errors[0].message) : "The app is still loading. You can retry or open the read-only storage diagnostic."}</p><div class="actions"><button type="button" data-startup-retry>Retry</button><button type="button" data-startup-diagnostic>Diagnostic</button></div></div></section>`;
    root2?.querySelector?.("[data-startup-retry]")?.addEventListener("click", () => location.reload());
    root2?.querySelector?.("[data-startup-diagnostic]")?.addEventListener("click", () => location.assign("./storage-recovery-diagnostic.html"));
    markStartupStage(trace, "startup_watchdog_visible");
  }, delayMs);
}
function completeStartupWatchdog(handle) {
  clearTimeout(handle);
}

// src/ui/i18n.js
var PLAY_MECHANISM_LABELS = Object.freeze({
  counting_quantity: { en: "Counting / quantities", zh: "\u8BA1\u6570 / \u6570\u91CF" },
  color_pattern: { en: "Colors / patterns", zh: "\u989C\u8272 / \u89C4\u5F8B" },
  jigsaw: { en: "Jigsaw puzzle", zh: "\u62FC\u56FE" },
  matching_sorting: { en: "Matching / sorting", zh: "\u914D\u5BF9 / \u5206\u7C7B" },
  maze_logic: { en: "Maze / logic", zh: "\u8FF7\u5BAB / \u903B\u8F91" },
  magnetic_build: { en: "Magnetic construction", zh: "\u78C1\u529B\u5EFA\u6784" },
  blocks_build: { en: "Block construction", zh: "\u79EF\u6728\u5EFA\u6784" },
  marble_track: { en: "Marble / track", zh: "\u6EDA\u73E0 / \u8F68\u9053" },
  screw_bolt_tool: { en: "Screw / tool play", zh: "\u87BA\u4E1D / \u5DE5\u5177\u64CD\u4F5C" },
  threading_lacing: { en: "Threading / lacing", zh: "\u7A7F\u7EBF / \u4E32\u73E0" },
  stack_balance: { en: "Stacking / balance", zh: "\u5806\u53E0 / \u5E73\u8861" },
  drawing_art: { en: "Drawing / art", zh: "\u7ED8\u753B / \u7F8E\u672F" },
  music_play: { en: "Music play", zh: "\u97F3\u4E50\u64CD\u4F5C" },
  pretend_role: { en: "Pretend role play", zh: "\u60C5\u5883\u89D2\u8272\u626E\u6F14" },
  care_doll: { en: "Doll care", zh: "\u5A03\u5A03\u7167\u62A4" },
  cleaning: { en: "Cleaning play", zh: "\u6E05\u6D01\u5BB6\u52A1" },
  cooking_serving: { en: "Cooking / serving", zh: "\u70F9\u996A / \u62DB\u5F85" },
  medical_care: { en: "Medical care", zh: "\u533B\u7597\u7167\u62A4" },
  shop_service: { en: "Shop / service", zh: "\u5546\u5E97\u670D\u52A1" },
  repair_build_role: { en: "Repair / tool role play", zh: "\u7EF4\u4FEE / \u5DE5\u5177\u89D2\u8272\u626E\u6F14" },
  ride_balance: { en: "Ride / balance", zh: "\u9A91\u4E58 / \u5E73\u8861" },
  pull_push_walk: { en: "Pull / push / walk", zh: "\u63A8\u62C9 / \u5B66\u6B65" },
  throw_catch_ball: { en: "Throw / catch", zh: "\u6295\u63B7 / \u63A5\u7403" },
  fine_motor_general: { en: "General fine-motor play", zh: "\u901A\u7528\u7CBE\u7EC6\u52A8\u4F5C" },
  construction_general: { en: "General construction play", zh: "\u901A\u7528\u5EFA\u6784\u73A9\u6CD5" },
  pretend_play_general: { en: "General pretend play", zh: "\u901A\u7528\u89D2\u8272\u626E\u6F14" },
  sensory_general: { en: "General sensory play", zh: "\u901A\u7528\u611F\u5B98\u63A2\u7D22" },
  magnetic_fishing: { en: "Magnetic fishing", zh: "\u78C1\u529B\u9493\u9C7C" },
  "activity cube": { en: "Activity cube", zh: "\u591A\u529F\u80FD\u64CD\u4F5C\u76D2" },
  "board turntaking": { en: "Board turn-taking", zh: "\u8F6E\u6D41\u64CD\u4F5C" },
  "cause effect": { en: "Cause and effect", zh: "\u56E0\u679C\u64CD\u4F5C" },
  "interlocking blocks": { en: "Interlocking blocks", zh: "\u62FC\u63A5\u79EF\u6728" },
  "key lock": { en: "Key and lock", zh: "\u94A5\u5319\u5F00\u9501" },
  "logic puzzle": { en: "Logic puzzle", zh: "\u903B\u8F91\u76CA\u667A" },
  matching: { en: "Matching", zh: "\u914D\u5BF9" },
  "other general": { en: "Other general play", zh: "\u5176\u4ED6\u901A\u7528\u73A9\u6CD5" },
  "pretend foodserve": { en: "Food-service pretend play", zh: "\u9910\u996E\u89D2\u8272\u626E\u6F14" },
  "pretend general": { en: "General pretend play", zh: "\u7EFC\u5408\u89D2\u8272\u626E\u6F14" },
  "pretend repair": { en: "Repair pretend play", zh: "\u7EF4\u4FEE\u5DE5\u5177\u89D2\u8272\u626E\u6F14" }
});
function mechanismRegistryKey(value) {
  return String(value || "").normalize("NFKC").trim().toLowerCase().replace(/[\s_-]+/g, " ");
}
function localizePlayMechanism(value, locale) {
  return PLAY_MECHANISM_LABELS[PLAY_MECHANISM_LABELS[value] ? value : mechanismRegistryKey(value)]?.[locale] || null;
}
var DICTIONARY = {
  en: {
    manageStandardCatalog: "Manage Standard Catalog",
    want: "Want",
    purchased: "Purchased",
    removeFromWishlist: "Remove from Wishlist",
    confirmRemoveWishlist: "Remove this item from your Wishlist?",
    realSubstitutes: "True substitutes and partly similar play",
    sharedSkills: "Shared skills",
    loadMore: "Load more",
    catalogResultCount: "Showing {shown} of {total} matches \xB7 {catalog} active catalog entries",
    appName: "Toy Rotation",
    home: "Home",
    library: "Toy Library",
    rotation: "Rotation",
    wishlist: "Wishlist",
    settings: "Settings",
    standardCatalog: "Standard Toy Library",
    addToy: "Add toy",
    addToToyLibrary: "Add to Toy Library",
    addToWishlist: "Add to Wishlist",
    addWishlistItem: "Add Wishlist Item",
    wishlistPriority: "Wishlist priority",
    sourceLink: "Source link",
    wishlistImageRequired: "Choose an image before AI recognition.",
    recognizeToy: "Recognize from image",
    pendingReview: "Pending review",
    startReview: "Start Review",
    reviewingExplanation: "Review in progress. Next: Approve, Link Existing, or Reject.",
    confirmAdd: "Confirm & add",
    retryRecognition: "Retry recognition",
    remove: "Remove",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    search: "Search brand / product",
    searchLibrary: "Search Toy Library",
    searchLibraryPlaceholder: "Search name, brand, alias, type, skill, or play mechanics",
    noSearchResults: "No matching toys found.",
    alreadyOwned: "Already owned",
    alreadyWishlisted: "Already in Wishlist",
    name: "Name",
    skills: "Skills",
    minimumAge: "Minimum age (months)",
    maximumAge: "Maximum age (months)",
    image: "Image",
    candidateImageUnavailable: "Image unavailable",
    candidateReviewNeedsReview: "Needs Review",
    candidateReviewCompleted: "Completed",
    candidateReviewArchived: "Archived",
    candidateReviewArchive: "Archive",
    candidateReviewUnarchive: "Unarchive",
    candidateReviewReopen: "Reopen Review",
    candidateReviewHistory: "Review history",
    candidateReviewReopenConfirm: "Reopen Review will reopen this record for review. It will not automatically revert prior Standard Catalog changes or links. Continue?",
    language: "Language",
    theme: "Appearance",
    system: "Follow system",
    light: "Light",
    dark: "Dark",
    languageEnglish: "English",
    languageChinese: "Chinese",
    monthUnit: "mo",
    removeToy: "Remove from Toy Library",
    confirmRemoveToy: "Remove this toy from your library?",
    removeSetTitle: "Remove this set?",
    removeSetDescription: "This set contains {count} child toys that were added with the set.",
    removeSetIndependent: "{count} child toys have independent records and will be kept.",
    removeSetAndChildren: "Remove set and linked children",
    removeSetKeepChildren: "Remove set only; keep children",
    recognitionQueued: "Queued",
    recognitionProcessing: "Recognizing\u2026",
    recognitionReady: "Ready to review",
    recognitionReadyCatalogUnmatched: "Recognition succeeded; no Standard Catalog match found",
    recognitionCatalogUnmatched: "No Standard Catalog match found",
    recognitionAlreadyOwned: "This toy is already in your Toy Library",
    recognitionDuplicateReviewRequired: "Possible duplicate needs your review",
    recognitionTombstoned: "This catalog identity was previously removed and needs review",
    recognitionPossibleDuplicate: "This may be the same toy as \u201C{name}\u201D.",
    recognitionSameToy: "This is the same toy",
    recognitionNotSameToy: "Not the same toy",
    recognitionCatalogTombstoned: "This catalog identity was previously removed and cannot be recreated automatically.",
    recognitionCatalogResolutionFailed: "Could not resolve the catalog identity.",
    viewExistingToy: "View existing toy",
    recognitionError: "Recognition needs attention",
    recognitionDiagnostic: "Recognition request details",
    recognitionDiagnosticRequest: "Request: {id} \xB7 device ID included: {device}",
    recognitionDiagnosticResponse: "HTTP: {status} \xB7 duration: {duration} \xB7 provider: {provider} \xB7 quota: {quota}",
    recognitionDiagnosticCatalog: "Catalog match: {result}",
    yes: "Yes",
    no: "No",
    overlapReasonMechanic: "Shared core play: {value}",
    overlapReasonOperation: "Same operation",
    overlapReasonGoal: "Same play goal",
    overlapReasonScene: "Same play setting",
    overlapReasonSkill: "Similar skills only",
    overlapReasonNone: "No meaningful overlap",
    allBrands: "All brands",
    allCategories: "All toy types",
    allSkills: "All skills",
    allMechanics: "All play mechanics",
    allStatuses: "All statuses",
    allAgeFits: "All age ranges",
    allPriorities: "All purchase priorities",
    allWishlistStatuses: "All Wishlist statuses",
    filters: "Filters",
    sort: "Sort",
    applyFilters: "Apply",
    wishlistStatusLabel: "Wishlist status",
    clearFilters: "Clear filters",
    searchWishlist: "Search Wishlist",
    searchWishlistPlaceholder: "Search name, brand, alias, type, skill, or play mechanics",
    findDuplicates: "Find duplicates",
    libraryDuplicateCheck: "Toy Library duplicate check",
    openDuplicateReview: "Open Toy Library duplicate review",
    sameChildImageProvenance: "Same child identity; image provenance differs.",
    reviewIdentityEvidence: "Review identity evidence before merging.",
    strongProbableDuplicate: "Strong probable duplicate",
    confirmPersonalMerge: "Merge \u201C{source}\u201D into \u201C{target}\u201D? The photo, feedback, shelf state, notes, and rotation history will be preserved.",
    scrollToTop: "Back to top",
    otherUnspecified: "Other / Unspecified",
    catalogReview: { identity_hold: "Identity review required", unresolved_variant: "Variant review required", catalog_identity_review_required: "Catalog identity review required", source_hold: "Image source review pending" },
    filterStatus: { active: "On shelf", stored: "Stored", permanent: "Permanent", paused: "Stored", hidden: "Hidden", archived: "Archived" },
    ageFit: { appropriate: "Age appropriate", tooYoung: "Not ready yet", outgrown: "Above suggested age", unknown: "Age not specified" },
    purchasePriority: "Purchase priority",
    overlaps: "Overlaps with these library toys",
    viewAll: "View all {count}",
    high: "High",
    medium: "Medium",
    low: "Low",
    wishlistStatus: { want: "Want", purchased: "Purchased", dismissed: "Dismissed" },
    wishlistSort: { priority: "Sort: purchase priority", ageFit: "Sort: age suitability", addedAt: "Sort: newest added", brand: "Sort: brand" },
    exactDuplicate: "Exact duplicate",
    highSubstitution: "High substitution",
    mediumSubstitution: "Medium substitution",
    skillSimilarityOnly: "Similar skills only",
    noOverlap: "No meaningful substitute found. Shared skill labels alone do not count as duplication.",
    realHighOverlap: "{count} real high substitute(s)",
    partialPlaySimilarity: "{count} partially similar play option(s)",
    noPurchaseImpactOverlap: "No toy in your library has sufficiently similar play to clearly replace this product.",
    skillOnlyDisclosure: "{count} toys share abilities only",
    skillOnlyTitle: "Toys with similar skill support",
    skillOnlyExplanation: "These toys may support related abilities but do not replace this product and do not lower its purchase priority.",
    wishlistMigrationDiagnostic: "{count} legacy Wishlist item(s) could not be resolved and were hidden instead of rendering blank cards.",
    adminMode: "Admin mode",
    managerDashboard: "Manager dashboard",
    adminCatalogEditor: "Admin Catalog Editor",
    basicInformation: "Basic information",
    playMechanics: "Core play mechanics",
    catalogImage: "Standard Catalog image",
    catalogImageOwnershipHint: "This shared catalog image is separate from personal Toy Library photos.",
    replaceImage: "Replace image",
    advancedManagement: "Advanced management",
    canonicalIdentity: "Canonical identity",
    catalogSource: "Catalog source",
    catalogSourceBase: "Built-in catalog",
    catalogSourceRemote: "Remote catalog",
    catalogSourceLearned: "Learned catalog",
    catalogSourceAdmin: "Administrator entry",
    catalogSourceOther: "Catalog data",
    searchMergeTarget: "Search Standard Catalog",
    selectMergeTarget: "Select a target entry",
    mergeTarget: "Merge target",
    mergeDuplicate: "Merge duplicate entry",
    confirmMerge: "Merge \u201C{source}\u201D into \u201C{target}\u201D? References and aliases will be migrated.",
    confirmDeletePermanent: "This deletion is permanent and will survive future catalog sync. Continue?",
    pendingCatalogReview: "Catalog items awaiting review",
    suspectedDuplicates: "Suspected duplicates",
    noPendingReview: "No items awaiting review.",
    noDuplicates: "No duplicate candidates.",
    backendDiagnostics: "Backend diagnostics",
    backendAvailable: "Backend available",
    backendUnavailable: "Backend unavailable",
    quotaUnavailable: "Quota unavailable",
    pendingSync: "Pending catalog deletions to sync: {count}",
    imageAuditPending: "Personal image audit: {count} item(s) still need recovery.",
    imageAuditComplete: "Personal image audit: all current references verified.",
    imageAuditStats: "Toy Library image audit \u2014 total {total}; verified {verified}; restored {restored}; orphan records {orphan}; unavailable {missing}.",
    catalogImageAuditPending: "Standard Catalog image audit is pending.",
    catalogImageAuditStats: "Standard Catalog images \u2014 total {total}; verified real {verified}; stable remote {stable}; manually confirmed {confirmed}; placeholders {placeholder}; broken references {broken}; remote failures {remote}; identity mismatches {mismatch}; missing metadata {metadata}; no image {missing}.",
    parentChildAuditStats: "Set-child migration \u2014 added {added}; automatically reconciled {merged}; identity remaps {remapped}.",
    identityConflicts: "True duplicates / identity conflicts",
    setStructureIssues: "Set structure issues",
    imageProblems: "Image problems",
    dataDiagnostics: "Data diagnostics",
    startupStatus: "Last startup stage: {stage}",
    exportRuntimeImageDiagnostic: "Export runtime image diagnostic",
    exportRuntimeImageDiagnosticHint: "Read-only export of the live Toy Library card, Catalog hydration, resolver and final DOM image chain.",
    exportFakePersonalPlaceholderAudit: "Export fake personal-image audit",
    exportFakePersonalPlaceholderAuditHint: "Exports only provenance metadata; no image bytes are included.",
    exportDataRepairDiagnostic: "Export data repair diagnostic",
    exportDataRepairDiagnosticHint: "Exports related records and migration lifecycle metadata without image blobs.",
    exportRestoreDiagnostic: "Export Restore diagnostic",
    approve: "Approve",
    reject: "Reject",
    autoRepair: "Run automatic repair",
    autoRelinkImages: "Relink images",
    noSetStructureIssues: "No set structure issues found.",
    identityAuditSummary: "Excluded set relationships: {relations}; unresolved structure issues: {unresolved}.",
    identityEngineSeparation: "Identity conflicts are separate from functional substitution and never use substitution levels.",
    setAuditSummary: "Parents: {parents}; child toys: {children}; issues: {issues}.",
    identityReason: "Reason: {reason}",
    canonicalPair: "Identity: {left} \u2192 {right}",
    confirmNotDuplicate: "Confirm not a duplicate",
    setIssueParentImage: "Child uses its parent-set image: {name}",
    setIssueOrphan: "Child has no resolved parent: {name}",
    setIssueDuplicateChild: "Possible duplicate child identity: {name}",
    structureDamageCurrent: "Current: 1 set and {children} child toys.",
    structureDamageExpected: "Standard structure: 1 set and {children} child toys.",
    structureDamageNoDeletion: "No intentional child-deletion record was found.",
    structureDamageExplanation: "The set structure may have been damaged by a historical migration.",
    needsConfirmation: "Needs confirmation",
    restoreMissingChildren: "Restore missing child toys",
    confirmRestoreMissingChildren: "Restore {count} missing child toys for \u201C{name}\u201D? This adds the child records without deleting the parent or overwriting its personal photo, interest, notes, storage, purchase information, or history.",
    restoredMissingChildren: "Restored {count} child toys",
    noMissingChildrenRestored: "No child toys needed restoration.",
    identityKind: { exact_duplicate: "Exact duplicate", same_child_legacy_duplicate: "Legacy duplicate of the same child", strong_probable_duplicate: "Strong probable duplicate", parent_child_relation: "Parent / child relation", sibling_child: "Sibling child toys", related_variant: "Related variant" },
    loading: "Loading\u2026",
    signIn: "Sign in",
    signOut: "Exit manager mode",
    adminPassword: "Administrator password",
    brand: "Brand",
    englishName: "English name",
    chineseName: "Chinese name",
    aliases: "Aliases",
    exportBackup: "Export backup",
    restoreBackup: "Restore backup",
    restoreReading: "Reading backup\u2026",
    restoreChecking: "Checking backup data\u2026",
    restoreRepairing: "Repairing legacy data\u2026",
    restoreSaving: "Saving restored data\u2026",
    restoreComplete: "Restore complete.",
    restoreCompleteWithHistoricalRepair: "Restore complete. Repaired {count} historical rotation reference(s).",
    restoreFailed: "Restore failed at {stage}. Your current data was not changed.",
    addedToLibrary: "Added to Toy Library",
    permanentDelete: "Permanently delete",
    confirmDelete: "Confirm permanent delete",
    rotationDiagnostics: "Rotation diagnostics",
    rotationDiagnosticSummary: "Rotation target {requested}; selected {selected}; permanent {permanent}; total shelf {total}; eligible rotation toys {eligible}.",
    rotationDiagnosticShortage: "Shortage: {count}.",
    rotationDiagnosticDetails: "Exclusion details",
    welcome: "Welcome",
    onboardingIntro: "Set your child profile and rotation preferences. You can change these any time in Settings.",
    start: "Start",
    childProfile: "Child profile",
    childName: "Nickname (optional)",
    birthDate: "Date of birth",
    currentAge: "Age",
    ageNotSet: "Not set",
    setBirthDateHint: "Set a birth date to use age-aware rotation and recommendations.",
    ageSummary: "Currently {count} months",
    editProfile: "Edit profile",
    rotationSettings: "Rotation",
    targetShelfCount: "Rotation toys per round",
    rotationInterval: "Reassessment interval",
    custom: "Custom",
    customRotationDays: "Custom interval (days)",
    dayUnit: "days",
    reassessmentDue: "Reassessment is due",
    reassessmentCountdown: "{count} days until reassessment",
    rotationIntervalSummary: "Reassess every {count} days",
    targetShelfSummary: "Rotation target: {count} toys",
    adminPasswordRequired: "Enter the administrator password.",
    adminUnconfigured: "The administrator service is not configured.",
    adminIncorrectPassword: "Incorrect administrator password.",
    adminSignInFailed: "Administrator sign-in failed.",
    adminVerificationRequired: "Administrator verification is required.",
    adminOperationFailed: "Administrator operation failed.",
    catalogImageUploadFailed: "The Standard Catalog image could not be uploaded.",
    catalogSyncFailed: "Catalog synchronization failed.",
    recognitionServiceUnconfigured: "The AI service is not configured.",
    recognitionFailed: "Image recognition failed.",
    recognitionNoResult: "Image recognition returned no result.",
    recognitionImageUnavailable: "The selected image could not be read.",
    recognitionDeviceIdRequired: "This device could not be identified for AI recognition.",
    recognitionUnauthorized: "AI recognition is not authorized.",
    recognitionQuotaExceeded: "AI recognition quota has been reached.",
    recognitionTimeout: "AI recognition timed out. No retry was sent.",
    recognitionNetworkError: "AI recognition could not reach the service.",
    recognitionInvalidResponse: "AI recognition returned an invalid response.",
    unsupportedBackup: "This backup file is not supported.",
    storageQuotaExceeded: "Local storage is full. The item could not be saved. Please retry after clearing diagnostic or temporary data.",
    persistenceQuotaRecoveryTitle: "Local storage is full; writing is paused",
    persistenceQuotaRecoveryDetail: "The app successfully read your existing data but could not complete a new safe save. Writing is temporarily paused to protect it. Your readable library and rollback copy were retained; only redundant temporary and older snapshot copies were cleared before retrying. Personal images were not deleted.",
    retrySafeStorageRecovery: "Safely release redundant storage and retry",
    liked: "Love",
    neutral: "Okay",
    disliked: "Not interested",
    set: "Set",
    setParent: "Set parent",
    setChild: "Set child",
    unregisteredPlayMechanism: "Unclassified play mechanism",
    onShelf: "On shelf",
    stored: "Stored",
    paused: "Stored",
    pauseRotation: "Store / Pause Rotation",
    resumeRotation: "Resume Rotation",
    pauseReasonLabel: "Pause reason",
    pauseReason: { not_interested: "Not interested right now", too_easy: "Too easy", too_hard: "Too hard", seasonal: "Seasonal", space: "Not enough space", later: "Save for later", other: "Other" },
    recognitionReview: "Review and edit",
    reanalyze: "Re-analyze",
    rotationParticipation: "Shelf choice",
    normalRotation: "Participate in rotation",
    draftSetPermanent: "Keep on shelf",
    draftPause: "Store / Pause Rotation",
    splitSetContents: "Set contents",
    localDraftOnly: "This only changes your personal draft; it does not edit the shared catalog.",
    imageReviewConsent: "Submit this image to help the admin review",
    viewAddedToy: "View added toy",
    replaceImage: "Replace image",
    sku: "SKU / model",
    rotationValue: "Rotation value",
    notes: "Notes",
    hidden: "Not in use / Hidden",
    putOnShelf: "Put on shelf",
    storeAway: "Store away",
    manuallyOnShelf: "Manually on shelf",
    keepOnShelf: "Keep on shelf",
    removeFromPermanent: "Remove from permanent",
    customPermanent: "Permanent toys",
    thisRotation: "This rotation",
    currentShelfTotal: "{count} toys currently on shelf",
    permanentTargetHint: "Permanent toys do not count toward the rotation target.",
    permanentBadge: "Permanent",
    noCustomPermanent: "No custom permanent toys.",
    personalImageEditor: "Personal image editor",
    cropImageHint: "Drag to reposition the image inside the crop frame.",
    zoomImage: "Zoom",
    rotateImage: "Rotate 90\xB0",
    resetImage: "Reset",
    cropAndUseImage: "Crop and use image",
    finishImageEditing: "Finish or cancel image editing before saving the toy.",
    generate: "Generate",
    generateThisRotation: "Generate this rotation",
    rotationShortage: "Only {selected} of {requested} toys currently meet the rotation conditions.",
    noData: "Nothing here yet.",
    persistenceRecoveryTitle: "Local data needs safe recovery",
    persistenceRecoveryDetail: "The app could not safely read its local data, so all writes are blocked. Export a diagnosis or explicitly start a new library.",
    persistenceDiagnosticModeDetail: "This diagnostic build is read-only until you explicitly apply a validated legacy recovery. Do not clear browser data.",
    persistenceClassification: "Storage result",
    applyDetectedRecovery: "Apply detected safe recovery",
    confirmDetectedRecovery: "Apply the validated staged recovery? The original legacy data will be retained.",
    exportPersistenceDiagnostic: "Export storage diagnosis",
    persistenceRecoverySettingsNotice: "Local data could not be read safely. Empty-state writes are disabled; export a diagnosis first.",
    startFresh: "Start Fresh",
    confirmStartFresh: "Create a new local Toy Rotation library? Existing persistence artifacts will be kept for safety, but this device will start with a new empty library.",
    persistenceStartFreshFailed: "Could not create the new local library safely.",
    category: { uncategorized: "Uncategorized", cognitive: "Cognitive", blocks_construction: "Blocks / Construction", puzzles_matching: "Puzzles / Matching", fine_motor: "Fine motor", pretend_play: "Pretend play", sensory: "Sensory", music: "Music", vehicles_tracks: "Vehicles / Tracks", dolls_plush: "Dolls / Plush", books_cards: "Books / Cards", outdoor_gross_motor: "Outdoor / Gross motor", open_ended: "Open-ended materials", language_cognitive: "Language / Cognitive", arts_crafts: "Arts / Crafts", other: "Other" },
    mechanic: { jigsaw: "Jigsaw puzzle", matching_sorting: "Matching / sorting", maze_logic: "Maze / logic", magnetic_build: "Magnetic construction", blocks_build: "Block construction", marble_track: "Marble / track", screw_bolt_tool: "Screw / tool play", threading_lacing: "Threading / lacing", stack_balance: "Stacking / balance", drawing_art: "Drawing / art", music_play: "Music play", pretend_role: "Pretend role play", care_doll: "Doll care", cleaning: "Cleaning play", cooking_serving: "Cooking / serving", medical_care: "Medical care", shop_service: "Shop / service", repair_build_role: "Repair / tool role play", ride_balance: "Ride / balance", pull_push_walk: "Pull / push / walk", throw_catch_ball: "Throw / catch", fine_motor_general: "General fine-motor play", construction_general: "General construction play", pretend_play_general: "General pretend play", sensory_general: "General sensory play", magnetic_fishing: "Magnetic fishing" },
    skill: { logic: "Logic", math: "Early math", sorting: "Sorting", memory: "Memory", problem_solving: "Problem solving", cause_effect: "Cause & effect", spatial_awareness: "Spatial awareness", fine_motor: "Fine motor", hand_eye: "Hand-eye coordination", visual_spatial: "Visual-spatial", language: "Language", matching: "Matching", attention: "Attention", creativity: "Creativity", pretend_play: "Pretend play", social: "Social interaction", gross_motor: "Gross motor", sensory_exploration: "Sensory exploration", practical_life: "Practical life", colour: "Colour recognition", observation: "Observation", music: "Music", shapes: "Shape recognition", balance: "Balance control", rules: "Rule awareness", body_coordination: "Body coordination", grasping: "Grasping", aesthetics: "Aesthetic expression", visual_tracking: "Visual tracking", strategy: "Strategic thinking", social_cognition: "Social cognition", animal_cognition: "Animal knowledge", science: "Early science", open_play: "Open-ended play", imagination: "Imagination", letters: "Letter awareness", oral_motor: "Oral motor" }
  },
  zh: {
    exportRuntimeImageDiagnostic: "\u5BFC\u51FA\u771F\u673A\u56FE\u7247\u8FD0\u884C\u8BCA\u65AD",
    exportRuntimeImageDiagnosticHint: "\u53EA\u8BFB\u5BFC\u51FA\u5F53\u524D Toy Library \u5361\u7247\u3001Catalog \u540E\u53F0\u52A0\u8F7D\u3001\u89E3\u6790\u7ED3\u679C\u4E0E\u6700\u7EC8 DOM \u56FE\u7247\u94FE\u3002",
    manageStandardCatalog: "\u7BA1\u7406\u6807\u51C6\u73A9\u5177\u5E93",
    want: "\u60F3\u4E70",
    purchased: "\u5DF2\u8D2D\u4E70",
    removeFromWishlist: "\u79FB\u51FA\u5FC3\u613F\u5355",
    confirmRemoveWishlist: "\u786E\u5B9A\u4ECE\u5FC3\u613F\u5355\u79FB\u9664\u6B64\u73A9\u5177\u5417\uFF1F",
    realSubstitutes: "\u771F\u6B63\u53EF\u66FF\u4EE3\u4E0E\u90E8\u5206\u73A9\u6CD5\u76F8\u4F3C",
    sharedSkills: "\u5171\u540C\u80FD\u529B",
    loadMore: "\u52A0\u8F7D\u66F4\u591A",
    catalogResultCount: "\u663E\u793A {shown} / {total} \u4EF6 \xB7 \u5F53\u524D\u6807\u51C6\u5E93\u5171 {catalog} \u4E2A\u6709\u6548\u6761\u76EE",
    appName: "\u73A9\u5177\u8F6E\u6362",
    home: "\u9996\u9875",
    library: "\u73A9\u5177\u5E93",
    rotation: "\u8F6E\u6362",
    wishlist: "\u5FC3\u613F\u5355",
    settings: "\u8BBE\u7F6E",
    standardCatalog: "\u6807\u51C6\u73A9\u5177\u5E93",
    addToy: "\u6DFB\u52A0\u73A9\u5177",
    addToToyLibrary: "\u52A0\u5165\u73A9\u5177\u5E93",
    addToWishlist: "\u52A0\u5165\u5FC3\u613F\u5355",
    addWishlistItem: "\u6DFB\u52A0\u5FC3\u613F\u73A9\u5177",
    wishlistPriority: "\u5FC3\u613F\u4F18\u5148\u7EA7",
    sourceLink: "\u6765\u6E90\u94FE\u63A5",
    wishlistImageRequired: "AI \u8BC6\u522B\u524D\u8BF7\u5148\u9009\u62E9\u56FE\u7247\u3002",
    recognizeToy: "AI \u56FE\u7247\u8BC6\u522B",
    pendingReview: "\u5F85\u786E\u8BA4",
    startReview: "\u5F00\u59CB\u5BA1\u6838",
    reviewingExplanation: "\u5BA1\u6838\u8FDB\u884C\u4E2D\u3002\u4E0B\u4E00\u6B65\u53EF\u901A\u8FC7\u3001\u5173\u8054\u5DF2\u6709\u6761\u76EE\u6216\u62D2\u7EDD\u3002",
    confirmAdd: "\u786E\u8BA4\u5165\u5E93",
    retryRecognition: "\u91CD\u65B0\u8BC6\u522B",
    remove: "\u79FB\u9664",
    edit: "\u7F16\u8F91",
    delete: "\u5220\u9664",
    save: "\u4FDD\u5B58",
    cancel: "\u53D6\u6D88",
    close: "\u5173\u95ED",
    search: "\u641C\u7D22\u54C1\u724C / \u4EA7\u54C1\u540D\u79F0",
    searchLibrary: "\u641C\u7D22\u73A9\u5177\u5E93",
    searchLibraryPlaceholder: "\u641C\u7D22\u540D\u79F0\u3001\u54C1\u724C\u3001\u522B\u540D\u3001\u7C7B\u578B\u3001\u80FD\u529B\u6216\u6838\u5FC3\u73A9\u6CD5",
    noSearchResults: "\u6CA1\u6709\u627E\u5230\u7B26\u5408\u6761\u4EF6\u7684\u73A9\u5177\u3002",
    alreadyOwned: "\u5DF2\u62E5\u6709",
    alreadyWishlisted: "\u5DF2\u5728\u5FC3\u613F\u5355",
    name: "\u4EA7\u54C1\u540D\u79F0",
    skills: "\u80FD\u529B",
    minimumAge: "\u5EFA\u8BAE\u8D77\u59CB\u6708\u9F84",
    maximumAge: "\u5EFA\u8BAE\u7ED3\u675F\u6708\u9F84",
    image: "\u56FE\u7247",
    candidateImageUnavailable: "\u56FE\u7247\u4E0D\u53EF\u7528",
    candidateReviewNeedsReview: "\u5F85\u5BA1\u6838",
    candidateReviewCompleted: "\u5DF2\u5B8C\u6210",
    candidateReviewArchived: "\u5DF2\u5F52\u6863",
    candidateReviewArchive: "\u5F52\u6863",
    candidateReviewUnarchive: "\u53D6\u6D88\u5F52\u6863",
    candidateReviewReopen: "\u91CD\u65B0\u5BA1\u6838",
    candidateReviewHistory: "\u5BA1\u6838\u5386\u53F2",
    candidateReviewReopenConfirm: "\u91CD\u65B0\u5BA1\u6838\u4F1A\u5C06\u6B64\u8BB0\u5F55\u91CD\u65B0\u6253\u5F00\u4EE5\u4F9B\u5BA1\u6838\uFF1B\u4E0D\u4F1A\u81EA\u52A8\u64A4\u9500\u6B64\u524D\u7684\u6807\u51C6\u5E93\u53D8\u66F4\u6216\u5173\u8054\u3002\u662F\u5426\u7EE7\u7EED\uFF1F",
    language: "\u8BED\u8A00",
    theme: "\u5916\u89C2",
    system: "\u8DDF\u968F\u7CFB\u7EDF",
    light: "\u6D45\u8272",
    dark: "\u6DF1\u8272",
    languageEnglish: "English",
    languageChinese: "\u4E2D\u6587",
    monthUnit: "\u6708",
    removeToy: "\u4ECE\u73A9\u5177\u5E93\u79FB\u9664",
    confirmRemoveToy: "\u786E\u5B9A\u4ECE\u73A9\u5177\u5E93\u79FB\u9664\u6B64\u73A9\u5177\u5417\uFF1F",
    removeSetTitle: "\u5220\u9664\u8FD9\u4E2A\u5957\u88C5\uFF1F",
    removeSetDescription: "\u8FD9\u4E2A\u5957\u88C5\u5305\u542B {count} \u4E2A\u7531\u5957\u88C5\u81EA\u52A8\u52A0\u5165\u7684\u5B50\u73A9\u5177\u3002",
    removeSetIndependent: "\u6709 {count} \u4E2A\u5B50\u73A9\u5177\u5177\u6709\u72EC\u7ACB\u8BB0\u5F55\uFF0C\u5C06\u4FDD\u7559\u3002",
    removeSetAndChildren: "\u5220\u9664\u5957\u88C5\u53CA\u5176\u5173\u8054\u5B50\u73A9\u5177",
    removeSetKeepChildren: "\u4EC5\u5220\u9664\u5957\u88C5\uFF0C\u4FDD\u7559\u5B50\u73A9\u5177",
    recognitionQueued: "\u7B49\u5F85\u8BC6\u522B",
    recognitionProcessing: "AI \u8BC6\u522B\u4E2D\u2026",
    recognitionReady: "\u7B49\u5F85\u786E\u8BA4",
    recognitionReadyCatalogUnmatched: "\u8BC6\u522B\u6210\u529F\uFF0C\u4F46\u672A\u627E\u5230\u6807\u51C6\u5E93\u5339\u914D",
    recognitionCatalogUnmatched: "\u672A\u627E\u5230\u6807\u51C6\u5E93\u5339\u914D",
    recognitionAlreadyOwned: "\u8FD9\u4E2A\u73A9\u5177\u5DF2\u7ECF\u5728\u4F60\u7684\u73A9\u5177\u5E93\u4E2D",
    recognitionDuplicateReviewRequired: "\u7591\u4F3C\u91CD\u590D\uFF0C\u9700\u8981\u4F60\u786E\u8BA4",
    recognitionTombstoned: "\u8FD9\u4E2A\u6807\u51C6\u5E93\u6807\u8BC6\u6B64\u524D\u5DF2\u5220\u9664\uFF0C\u9700\u8981\u5BA1\u6838",
    recognitionPossibleDuplicate: "\u5B83\u53EF\u80FD\u4E0E\u201C{name}\u201D\u662F\u540C\u4E00\u4E2A\u73A9\u5177\u3002",
    recognitionSameToy: "\u8FD9\u662F\u540C\u4E00\u4E2A\u73A9\u5177",
    recognitionNotSameToy: "\u4E0D\u662F\u540C\u4E00\u4E2A\u73A9\u5177",
    recognitionCatalogTombstoned: "\u8FD9\u4E2A\u6807\u51C6\u5E93\u6807\u8BC6\u6B64\u524D\u5DF2\u6C38\u4E45\u5220\u9664\uFF0C\u4E0D\u80FD\u81EA\u52A8\u91CD\u65B0\u521B\u5EFA\u3002",
    recognitionCatalogResolutionFailed: "\u65E0\u6CD5\u89E3\u6790\u6807\u51C6\u5E93\u6807\u8BC6\u3002",
    viewExistingToy: "\u67E5\u770B\u5DF2\u6709\u73A9\u5177",
    recognitionError: "\u8BC6\u522B\u9700\u8981\u5904\u7406",
    recognitionDiagnostic: "\u8BC6\u522B\u8BF7\u6C42\u8BE6\u60C5",
    recognitionDiagnosticRequest: "\u8BF7\u6C42\uFF1A{id} \xB7 \u5DF2\u5305\u542B\u8BBE\u5907\u6807\u8BC6\uFF1A{device}",
    recognitionDiagnosticResponse: "HTTP\uFF1A{status} \xB7 \u8017\u65F6\uFF1A{duration} \xB7 Provider\uFF1A{provider} \xB7 \u989D\u5EA6\uFF1A{quota}",
    recognitionDiagnosticCatalog: "\u6807\u51C6\u5E93\u5339\u914D\uFF1A{result}",
    yes: "\u662F",
    no: "\u5426",
    overlapReasonMechanic: "\u5171\u540C\u6838\u5FC3\u73A9\u6CD5\uFF1A{value}",
    overlapReasonOperation: "\u64CD\u4F5C\u65B9\u5F0F\u76F8\u540C",
    overlapReasonGoal: "\u6E38\u620F\u76EE\u6807\u76F8\u540C",
    overlapReasonScene: "\u4F7F\u7528\u573A\u666F\u76F8\u540C",
    overlapReasonSkill: "\u4EC5\u80FD\u529B\u76F8\u4F3C",
    overlapReasonNone: "\u672A\u53D1\u73B0\u660E\u663E\u91CD\u5408",
    allBrands: "\u5168\u90E8\u54C1\u724C",
    allCategories: "\u5168\u90E8\u73A9\u5177\u7C7B\u578B",
    allSkills: "\u5168\u90E8\u80FD\u529B",
    allMechanics: "\u5168\u90E8\u6838\u5FC3\u73A9\u6CD5",
    allStatuses: "\u5168\u90E8\u72B6\u6001",
    allAgeFits: "\u5168\u90E8\u9002\u9F84\u72B6\u6001",
    allPriorities: "\u5168\u90E8\u8D2D\u4E70\u4F18\u5148\u7EA7",
    allWishlistStatuses: "\u5168\u90E8\u5FC3\u613F\u5355\u72B6\u6001",
    filters: "\u7B5B\u9009",
    sort: "\u6392\u5E8F",
    applyFilters: "\u5E94\u7528",
    wishlistStatusLabel: "\u5FC3\u613F\u5355\u72B6\u6001",
    clearFilters: "\u6E05\u9664\u7B5B\u9009",
    searchWishlist: "\u641C\u7D22\u5FC3\u613F\u5355",
    searchWishlistPlaceholder: "\u641C\u7D22\u540D\u79F0\u3001\u54C1\u724C\u3001\u522B\u540D\u3001\u7C7B\u578B\u3001\u80FD\u529B\u6216\u6838\u5FC3\u73A9\u6CD5",
    findDuplicates: "\u67E5\u627E\u91CD\u590D\u73A9\u5177",
    libraryDuplicateCheck: "\u73A9\u5177\u5E93\u67E5\u91CD",
    openDuplicateReview: "\u6253\u5F00\u73A9\u5177\u5E93\u67E5\u91CD",
    sameChildImageProvenance: "\u540C\u4E00\u5B50\u73A9\u5177\u6807\u8BC6\uFF0C\u56FE\u7247\u6765\u6E90\u4E0D\u540C\u3002",
    reviewIdentityEvidence: "\u5408\u5E76\u524D\u8BF7\u5148\u6838\u5BF9\u6807\u8BC6\u4F9D\u636E\u3002",
    strongProbableDuplicate: "\u9AD8\u5EA6\u7591\u4F3C\u91CD\u590D",
    confirmPersonalMerge: "\u786E\u8BA4\u5C06\u201C{source}\u201D\u5408\u5E76\u5230\u201C{target}\u201D\u5417\uFF1F\u56FE\u7247\u3001\u559C\u597D\u3001\u5728\u67B6\u72B6\u6001\u3001\u5907\u6CE8\u4E0E\u8F6E\u6362\u5386\u53F2\u90FD\u4F1A\u4FDD\u7559\u3002",
    scrollToTop: "\u56DE\u5230\u9876\u90E8",
    otherUnspecified: "\u5176\u4ED6 / \u672A\u586B\u5199\u54C1\u724C",
    catalogReview: { identity_hold: "\u9700\u8981\u6838\u5B9E\u8EAB\u4EFD", unresolved_variant: "\u9700\u8981\u6838\u5B9E\u5177\u4F53\u7248\u672C", catalog_identity_review_required: "\u9700\u8981\u5BA1\u6838\u6807\u51C6\u6761\u76EE\u8EAB\u4EFD", source_hold: "\u56FE\u7247\u6765\u6E90\u5F85\u786E\u8BA4" },
    filterStatus: { active: "\u5728\u67B6", stored: "\u6536\u7EB3", permanent: "\u5E38\u9A7B", paused: "\u5DF2\u6536\u8D77", hidden: "\u9690\u85CF", archived: "\u5DF2\u5F52\u6863" },
    ageFit: { appropriate: "\u5F53\u524D\u9002\u9F84", tooYoung: "\u5C1A\u672A\u5230\u9002\u9F84", outgrown: "\u5DF2\u8D85\u8FC7\u5EFA\u8BAE\u6708\u9F84", unknown: "\u672A\u586B\u5199\u6708\u9F84" },
    purchasePriority: "\u8D2D\u4E70\u4F18\u5148\u7EA7",
    overlaps: "\u4E0E\u5BB6\u91CC\u8FD9\u4E9B\u73A9\u5177\u529F\u80FD\u91CD\u5408",
    viewAll: "\u67E5\u770B\u5168\u90E8 {count} \u4EF6",
    high: "\u9AD8",
    medium: "\u4E2D",
    low: "\u4F4E",
    wishlistStatus: { want: "\u60F3\u4E70", purchased: "\u5DF2\u8D2D\u4E70", dismissed: "\u5DF2\u5FFD\u7565" },
    wishlistSort: { priority: "\u6392\u5E8F\uFF1A\u8D2D\u4E70\u4F18\u5148\u7EA7", ageFit: "\u6392\u5E8F\uFF1A\u9002\u9F84\u7A0B\u5EA6", addedAt: "\u6392\u5E8F\uFF1A\u6700\u8FD1\u52A0\u5165", brand: "\u6392\u5E8F\uFF1A\u54C1\u724C" },
    exactDuplicate: "\u5B8C\u5168\u91CD\u590D",
    highSubstitution: "\u9AD8\u5EA6\u66FF\u4EE3",
    mediumSubstitution: "\u4E2D\u5EA6\u66FF\u4EE3",
    skillSimilarityOnly: "\u4EC5\u80FD\u529B\u76F8\u4F3C",
    noOverlap: "\u6682\u672A\u53D1\u73B0\u660E\u663E\u66FF\u4EE3\u54C1\uFF1B\u5171\u4EAB\u80FD\u529B\u6807\u7B7E\u672C\u8EAB\u4E0D\u4F1A\u5224\u4E3A\u91CD\u590D\u3002",
    realHighOverlap: "\u771F\u6B63\u9AD8\u5EA6\u66FF\u4EE3\uFF1A{count} \u4EF6",
    partialPlaySimilarity: "\u90E8\u5206\u73A9\u6CD5\u76F8\u4F3C\uFF1A{count} \u4EF6",
    noPurchaseImpactOverlap: "\u5BB6\u91CC\u6682\u65F6\u6CA1\u6709\u73A9\u6CD5\u76F8\u8FD1\u3001\u53EF\u660E\u663E\u66FF\u4EE3\u8FD9\u6B3E\u73A9\u5177\u7684\u4EA7\u54C1\u3002",
    skillOnlyDisclosure: "\u4EC5\u80FD\u529B\u76F8\u4F3C\uFF1A{count} \u4EF6",
    skillOnlyTitle: "\u4EC5\u80FD\u529B\u76F8\u4F3C\u7684\u73A9\u5177",
    skillOnlyExplanation: "\u8FD9\u4E9B\u73A9\u5177\u53EA\u652F\u6301\u76F8\u8FD1\u80FD\u529B\uFF0C\u4E0D\u4F1A\u66FF\u4EE3\u5F53\u524D\u73A9\u5177\uFF0C\u4E5F\u4E0D\u4F1A\u964D\u4F4E\u8D2D\u4E70\u4F18\u5148\u7EA7\u3002",
    wishlistMigrationDiagnostic: "\u6709 {count} \u6761\u65E7\u5FC3\u613F\u5355\u8BB0\u5F55\u6682\u65F6\u65E0\u6CD5\u8BC6\u522B\uFF0C\u5DF2\u9690\u85CF\u4EE5\u907F\u514D\u663E\u793A\u7A7A\u767D\u5361\u7247\u3002",
    adminMode: "\u7BA1\u7406\u5458\u6A21\u5F0F",
    managerDashboard: "\u7BA1\u7406\u5458\u5DE5\u4F5C\u53F0",
    adminCatalogEditor: "\u6807\u51C6\u5E93\u7BA1\u7406",
    basicInformation: "\u57FA\u672C\u4FE1\u606F",
    playMechanics: "\u6838\u5FC3\u73A9\u6CD5\u673A\u5236",
    catalogImage: "\u6807\u51C6\u5E93\u4E3B\u56FE",
    catalogImageOwnershipHint: "\u6807\u51C6\u5E93\u5171\u4EAB\u56FE\u7247\u4E0E\u4E2A\u4EBA\u73A9\u5177\u5E93\u56FE\u7247\u5206\u522B\u4FDD\u5B58\uFF0C\u4E92\u4E0D\u5220\u9664\u3002",
    replaceImage: "\u66F4\u6362\u56FE\u7247",
    advancedManagement: "\u9AD8\u7EA7\u7BA1\u7406",
    canonicalIdentity: "\u6807\u51C6\u6761\u76EE\u6807\u8BC6",
    catalogSource: "\u6570\u636E\u6765\u6E90",
    catalogSourceBase: "\u5185\u7F6E\u6807\u51C6\u5E93",
    catalogSourceRemote: "\u8FDC\u7A0B\u6807\u51C6\u5E93",
    catalogSourceLearned: "\u5B66\u4E60\u6807\u51C6\u5E93",
    catalogSourceAdmin: "\u7BA1\u7406\u5458\u6761\u76EE",
    catalogSourceOther: "\u6807\u51C6\u5E93\u6570\u636E",
    searchMergeTarget: "\u641C\u7D22\u6807\u51C6\u5E93\u76EE\u6807",
    selectMergeTarget: "\u8BF7\u9009\u62E9\u76EE\u6807\u6761\u76EE",
    mergeTarget: "\u5408\u5E76\u76EE\u6807",
    mergeDuplicate: "\u5408\u5E76\u91CD\u590D\u6761\u76EE",
    confirmMerge: "\u786E\u8BA4\u5C06\u201C{source}\u201D\u5408\u5E76\u5230\u201C{target}\u201D\uFF1F\u76F8\u5173\u5F15\u7528\u4E0E\u522B\u540D\u4F1A\u4E00\u5E76\u8FC1\u79FB\u3002",
    confirmDeletePermanent: "\u6B64\u5220\u9664\u4F1A\u6C38\u4E45\u4FDD\u7559\uFF0C\u5E76\u4E14\u8FDC\u7A0B\u540C\u6B65\u540E\u4E5F\u4E0D\u4F1A\u590D\u6D3B\u3002\u786E\u5B9A\u7EE7\u7EED\u5417\uFF1F",
    pendingCatalogReview: "\u5F85\u5BA1\u6838\u6807\u51C6\u73A9\u5177",
    suspectedDuplicates: "\u7591\u4F3C\u91CD\u590D",
    noPendingReview: "\u6682\u65E0\u5F85\u5BA1\u6838\u6761\u76EE\u3002",
    noDuplicates: "\u6682\u65E0\u7591\u4F3C\u91CD\u590D\u3002",
    backendDiagnostics: "\u540E\u7AEF\u8BCA\u65AD",
    backendAvailable: "\u540E\u7AEF\u53EF\u7528",
    backendUnavailable: "\u540E\u7AEF\u4E0D\u53EF\u7528",
    quotaUnavailable: "\u914D\u989D\u4FE1\u606F\u4E0D\u53EF\u7528",
    pendingSync: "\u5F85\u540C\u6B65\u7684\u6807\u51C6\u5E93\u5220\u9664\uFF1A{count}",
    imageAuditPending: "\u4E2A\u4EBA\u73A9\u5177\u56FE\u7247\u5BA1\u8BA1\uFF1A\u4ECD\u6709 {count} \u4EF6\u9700\u8981\u6062\u590D\u3002",
    imageAuditComplete: "\u4E2A\u4EBA\u73A9\u5177\u56FE\u7247\u5BA1\u8BA1\uFF1A\u5F53\u524D\u56FE\u7247\u5F15\u7528\u5DF2\u5168\u90E8\u9A8C\u8BC1\u3002",
    imageAuditStats: "\u4E2A\u4EBA\u73A9\u5177\u56FE\u7247\u5BA1\u8BA1\uFF1A\u603B\u8BA1 {total} \u4EF6\uFF1B\u5DF2\u9A8C\u8BC1 {verified}\uFF1B\u81EA\u52A8\u6062\u590D {restored}\uFF1B\u5B64\u7ACB\u56FE\u7247\u8BB0\u5F55 {orphan}\uFF1B\u786E\u5B9E\u65E0\u6CD5\u6062\u590D {missing}\u3002",
    catalogImageAuditPending: "\u6807\u51C6\u5E93\u56FE\u7247\u5BA1\u8BA1\u5C1A\u672A\u5B8C\u6210\u3002",
    exportFakePersonalPlaceholderAudit: "\u5BFC\u51FA\u4F2A\u4E2A\u4EBA\u56FE\u7247\u5360\u4F4D\u5BA1\u8BA1",
    exportFakePersonalPlaceholderAuditHint: "\u4EC5\u5BFC\u51FA\u6765\u6E90\u5143\u6570\u636E\uFF0C\u4E0D\u5305\u542B\u56FE\u7247\u5B57\u8282\u3002",
    catalogImageAuditStats: "\u6807\u51C6\u5E93\u56FE\u7247\u5BA1\u8BA1\uFF1A\u603B\u8BA1 {total} \u4EF6\uFF1B\u5DF2\u9A8C\u8BC1\u771F\u5B9E\u56FE {verified}\uFF1B\u7A33\u5B9A\u8FDC\u7A0B\u56FE {stable}\uFF1B\u4EBA\u5DE5\u786E\u8BA4\u56FE {confirmed}\uFF1B\u5360\u4F4D\u56FE {placeholder}\uFF1B\u9519\u8BEF\u5F15\u7528 {broken}\uFF1B\u8FDC\u7A0B\u52A0\u8F7D\u5931\u8D25 {remote}\uFF1B\u6807\u8BC6\u4E0D\u5339\u914D {mismatch}\uFF1B\u7F3A\u5C11\u56FE\u7247\u5143\u6570\u636E {metadata}\uFF1B\u65E0\u56FE\u7247 {missing}\u3002",
    parentChildAuditStats: "\u5957\u88C5\u5B50\u73A9\u5177\u8FC1\u79FB\uFF1A\u65B0\u589E {added}\uFF1B\u81EA\u52A8\u6536\u53E3 {merged}\uFF1B\u6807\u8BC6\u91CD\u6620\u5C04 {remapped}\u3002",
    identityConflicts: "\u771F\u6B63\u91CD\u590D / \u6807\u8BC6\u51B2\u7A81",
    setStructureIssues: "\u5957\u88C5\u7ED3\u6784\u5F02\u5E38",
    imageProblems: "\u56FE\u7247\u95EE\u9898",
    dataDiagnostics: "\u6570\u636E\u8BCA\u65AD",
    startupStatus: "\u6700\u8FD1\u542F\u52A8\u9636\u6BB5\uFF1A{stage}",
    exportDataRepairDiagnostic: "\u5BFC\u51FA\u6570\u636E\u4FEE\u590D\u8BCA\u65AD",
    exportDataRepairDiagnosticHint: "\u5BFC\u51FA\u76F8\u5173\u8BB0\u5F55\u4E0E\u8FC1\u79FB\u751F\u547D\u5468\u671F\u4FE1\u606F\uFF0C\u4E0D\u5305\u542B\u5B9E\u9645\u56FE\u7247\u6570\u636E\u3002",
    exportRestoreDiagnostic: "\u5BFC\u51FA Restore \u8BCA\u65AD",
    approve: "\u901A\u8FC7",
    reject: "\u62D2\u7EDD",
    autoRepair: "\u81EA\u52A8\u4FEE\u590D",
    autoRelinkImages: "\u81EA\u52A8\u91CD\u65B0\u5173\u8054\u56FE\u7247",
    noSetStructureIssues: "\u6CA1\u6709\u53D1\u73B0\u5957\u88C5\u7ED3\u6784\u5F02\u5E38\u3002",
    identityAuditSummary: "\u5DF2\u6392\u9664\u5957\u88C5\u5173\u7CFB\uFF1A{relations}\uFF1B\u5F85\u5904\u7406\u7ED3\u6784\u5F02\u5E38\uFF1A{unresolved}.",
    identityEngineSeparation: "\u8EAB\u4EFD\u91CD\u590D\u4E0E\u529F\u80FD\u66FF\u4EE3\u5B8C\u5168\u5206\u79BB\uFF1B\u6B64\u5904\u4E0D\u4F1A\u4F7F\u7528\u66FF\u4EE3\u7A0B\u5EA6\u3002",
    setAuditSummary: "\u5957\u88C5\u7236\u9879\uFF1A{parents}\uFF1B\u5B50\u73A9\u5177\uFF1A{children}\uFF1B\u5F02\u5E38\uFF1A{issues}\u3002",
    identityReason: "\u539F\u56E0\uFF1A{reason}",
    canonicalPair: "\u6807\u8BC6\uFF1A{left} \u2192 {right}",
    confirmNotDuplicate: "\u786E\u8BA4\u4E0D\u662F\u91CD\u590D",
    setIssueParentImage: "\u5B50\u73A9\u5177\u9519\u8BEF\u4F7F\u7528\u5957\u88C5\u4E3B\u56FE\uFF1A{name}",
    setIssueOrphan: "\u5B50\u73A9\u5177\u6CA1\u6709\u5173\u8054\u5230\u7236\u5957\u88C5\uFF1A{name}",
    setIssueDuplicateChild: "\u53EF\u80FD\u662F\u540C\u4E00\u5B50\u73A9\u5177\u7684\u5386\u53F2\u91CD\u590D\uFF1A{name}",
    structureDamageCurrent: "\u5F53\u524D\uFF1A1 \u4E2A\u5957\u88C5\uFF0C{children} \u4E2A\u5B50\u73A9\u5177\u3002",
    structureDamageExpected: "\u6807\u51C6\u7ED3\u6784\uFF1A1 \u4E2A\u5957\u88C5 + {children} \u4E2A\u5B50\u73A9\u5177\u3002",
    structureDamageNoDeletion: "\u672A\u53D1\u73B0\u4E3B\u52A8\u5220\u9664\u5B50\u73A9\u5177\u7684\u8BB0\u5F55\u3002",
    structureDamageExplanation: "\u6B64\u5957\u88C5\u7ED3\u6784\u53EF\u80FD\u7531\u5386\u53F2\u8FC1\u79FB\u635F\u574F\u9020\u6210\u3002",
    needsConfirmation: "\u9700\u8981\u786E\u8BA4",
    restoreMissingChildren: "\u6062\u590D\u7F3A\u5931\u5B50\u73A9\u5177",
    confirmRestoreMissingChildren: "\u786E\u5B9A\u4E3A\u201C{name}\u201D\u6062\u590D {count} \u4E2A\u7F3A\u5931\u5B50\u73A9\u5177\u5417\uFF1F\u8FD9\u4F1A\u65B0\u589E\u5B50\u73A9\u5177\u8BB0\u5F55\uFF0C\u4E0D\u4F1A\u5220\u9664\u5957\u88C5\uFF0C\u4E5F\u4E0D\u4F1A\u8986\u76D6\u5957\u88C5\u7684\u4E2A\u4EBA\u56FE\u7247\u3001\u5174\u8DA3\u3001\u5907\u6CE8\u3001\u6536\u7EB3\u3001\u8D2D\u4E70\u4FE1\u606F\u6216\u5386\u53F2\u3002",
    restoredMissingChildren: "\u5DF2\u6062\u590D {count} \u4E2A\u5B50\u73A9\u5177",
    noMissingChildrenRestored: "\u5F53\u524D\u6CA1\u6709\u9700\u8981\u6062\u590D\u7684\u5B50\u73A9\u5177\u3002",
    identityKind: { exact_duplicate: "\u5B8C\u5168\u91CD\u590D", same_child_legacy_duplicate: "\u540C\u4E00\u5B50\u73A9\u5177\u7684\u5386\u53F2\u91CD\u590D", strong_probable_duplicate: "\u9AD8\u5EA6\u7591\u4F3C\u91CD\u590D", parent_child_relation: "\u5957\u88C5\u4E0E\u5B50\u73A9\u5177\u5173\u7CFB", sibling_child: "\u540C\u5957\u4E0D\u540C\u5B50\u73A9\u5177", related_variant: "\u540C\u7CFB\u5217\u4E0D\u540C\u6B3E" },
    loading: "\u52A0\u8F7D\u4E2D\u2026",
    signIn: "\u767B\u5F55",
    signOut: "\u9000\u51FA\u7BA1\u7406\u5458\u6A21\u5F0F",
    adminPassword: "\u7BA1\u7406\u5458\u5BC6\u7801",
    brand: "\u54C1\u724C",
    englishName: "\u82F1\u6587\u540D\u79F0",
    chineseName: "\u4E2D\u6587\u540D\u79F0",
    aliases: "\u522B\u540D",
    exportBackup: "\u5BFC\u51FA\u5907\u4EFD",
    restoreBackup: "\u6062\u590D\u5907\u4EFD",
    restoreReading: "\u6B63\u5728\u8BFB\u53D6\u5907\u4EFD\u2026",
    restoreChecking: "\u6B63\u5728\u68C0\u67E5\u6570\u636E\u2026",
    restoreRepairing: "\u6B63\u5728\u4FEE\u590D\u65E7\u6570\u636E\u2026",
    restoreSaving: "\u6B63\u5728\u4FDD\u5B58\u2026",
    restoreComplete: "\u6062\u590D\u5B8C\u6210\u3002",
    restoreCompleteWithHistoricalRepair: "\u6062\u590D\u5B8C\u6210\uFF0C\u5DF2\u4FEE\u590D {count} \u6761\u65E7\u8F6E\u6362\u5386\u53F2\u5F15\u7528\u3002",
    restoreFailed: "\u6062\u590D\u5931\u8D25\uFF0C\u505C\u5728\uFF1A{stage}\u3002\u5F53\u524D\u6570\u636E\u672A\u88AB\u4FEE\u6539\u3002",
    addedToLibrary: "\u5DF2\u52A0\u5165\u73A9\u5177\u5E93",
    permanentDelete: "\u6C38\u4E45\u5220\u9664\u6761\u76EE",
    confirmDelete: "\u786E\u8BA4\u6C38\u4E45\u5220\u9664",
    rotationDiagnostics: "\u8F6E\u6362\u8BCA\u65AD",
    rotationDiagnosticSummary: "\u8F6E\u6362\u76EE\u6807 {requested} \u4EF6\uFF1B\u5DF2\u9009 {selected} \u4EF6\uFF1B\u81EA\u5B9A\u4E49\u5E38\u9A7B {permanent} \u4EF6\uFF1B\u5F53\u524D\u67B6\u4E0A\u5171 {total} \u4EF6\uFF1B\u7B26\u5408\u8F6E\u6362\u6761\u4EF6 {eligible} \u4EF6\u3002",
    rotationDiagnosticShortage: "\u7F3A\u53E3\uFF1A{count} \u4EF6\u3002",
    rotationDiagnosticDetails: "\u6392\u9664\u660E\u7EC6",
    welcome: "\u5F00\u59CB\u8BBE\u7F6E",
    onboardingIntro: "\u5148\u8BBE\u7F6E\u5B9D\u5B9D\u8D44\u6599\u548C\u8F6E\u6362\u504F\u597D\uFF0C\u4E4B\u540E\u53EF\u968F\u65F6\u5728\u8BBE\u7F6E\u4E2D\u4FEE\u6539\u3002",
    start: "\u5F00\u59CB\u4F7F\u7528",
    childProfile: "\u5B9D\u5B9D\u8D44\u6599",
    childName: "\u6635\u79F0\uFF08\u53EF\u9009\uFF09",
    birthDate: "\u51FA\u751F\u65E5\u671F",
    currentAge: "\u5F53\u524D\u6708\u9F84",
    ageNotSet: "\u672A\u8BBE\u7F6E",
    setBirthDateHint: "\u8BBE\u7F6E\u51FA\u751F\u65E5\u671F\u540E\uFF0C\u8F6E\u6362\u4E0E\u63A8\u8350\u4F1A\u81EA\u52A8\u53C2\u8003\u6708\u9F84\u3002",
    ageSummary: "\u5F53\u524D\u7EA6 {count} \u4E2A\u6708",
    editProfile: "\u4FEE\u6539\u8D44\u6599",
    rotationSettings: "\u8F6E\u6362\u8BBE\u7F6E",
    targetShelfCount: "\u6BCF\u8F6E\u5B89\u6392\u73A9\u5177\u6570\u91CF",
    rotationInterval: "\u91CD\u65B0\u8BC4\u4F30\u5468\u671F",
    custom: "\u81EA\u5B9A\u4E49",
    customRotationDays: "\u81EA\u5B9A\u4E49\u5468\u671F\uFF08\u5929\uFF09",
    dayUnit: "\u5929",
    reassessmentDue: "\u73B0\u5728\u53EF\u4EE5\u91CD\u65B0\u8BC4\u4F30",
    reassessmentCountdown: "\u8DDD\u79BB\u4E0B\u6B21\u91CD\u65B0\u8BC4\u4F30\u8FD8\u6709 {count} \u5929",
    rotationIntervalSummary: "\u6BCF {count} \u5929\u91CD\u65B0\u8BC4\u4F30",
    targetShelfSummary: "\u672C\u8F6E\u8F6E\u6362\u76EE\u6807\uFF1A{count} \u4EF6\u73A9\u5177",
    adminPasswordRequired: "\u8BF7\u8F93\u5165\u7BA1\u7406\u5458\u5BC6\u7801\u3002",
    adminUnconfigured: "\u7BA1\u7406\u5458\u670D\u52A1\u5C1A\u672A\u914D\u7F6E\u3002",
    adminIncorrectPassword: "\u7BA1\u7406\u5458\u5BC6\u7801\u4E0D\u6B63\u786E\u3002",
    adminSignInFailed: "\u7BA1\u7406\u5458\u767B\u5F55\u5931\u8D25\u3002",
    adminVerificationRequired: "\u9700\u8981\u7BA1\u7406\u5458\u9A8C\u8BC1\u3002",
    adminOperationFailed: "\u7BA1\u7406\u5458\u64CD\u4F5C\u5931\u8D25\u3002",
    catalogImageUploadFailed: "\u6807\u51C6\u5E93\u56FE\u7247\u4E0A\u4F20\u5931\u8D25\u3002",
    catalogSyncFailed: "\u6807\u51C6\u5E93\u540C\u6B65\u5931\u8D25\u3002",
    recognitionServiceUnconfigured: "AI \u670D\u52A1\u5C1A\u672A\u914D\u7F6E\u3002",
    recognitionFailed: "\u56FE\u7247\u8BC6\u522B\u5931\u8D25\u3002",
    recognitionNoResult: "\u56FE\u7247\u8BC6\u522B\u6CA1\u6709\u8FD4\u56DE\u7ED3\u679C\u3002",
    recognitionImageUnavailable: "\u65E0\u6CD5\u8BFB\u53D6\u6240\u9009\u56FE\u7247\u3002",
    recognitionDeviceIdRequired: "\u6B64\u8BBE\u5907\u65E0\u6CD5\u5B8C\u6210 AI \u56FE\u7247\u8BC6\u522B\u6240\u9700\u7684\u8EAB\u4EFD\u6807\u8BC6\u3002",
    recognitionUnauthorized: "AI \u56FE\u7247\u8BC6\u522B\u672A\u83B7\u6388\u6743\u3002",
    recognitionQuotaExceeded: "AI \u56FE\u7247\u8BC6\u522B\u989D\u5EA6\u5DF2\u7528\u5B8C\u3002",
    recognitionTimeout: "AI \u56FE\u7247\u8BC6\u522B\u8D85\u65F6\uFF0C\u672A\u81EA\u52A8\u91CD\u8BD5\u3002",
    recognitionNetworkError: "\u65E0\u6CD5\u8FDE\u63A5 AI \u56FE\u7247\u8BC6\u522B\u670D\u52A1\u3002",
    recognitionInvalidResponse: "AI \u56FE\u7247\u8BC6\u522B\u8FD4\u56DE\u7684\u6570\u636E\u65E0\u6548\u3002",
    unsupportedBackup: "\u4E0D\u652F\u6301\u6B64\u5907\u4EFD\u6587\u4EF6\u3002",
    storageQuotaExceeded: "\u672C\u5730\u5B58\u50A8\u7A7A\u95F4\u4E0D\u8DB3\uFF0C\u672A\u80FD\u5B8C\u6210\u4FDD\u5B58\u3002\u8BF7\u7A0D\u540E\u91CD\u8BD5\u6216\u6E05\u7406\u8BCA\u65AD/\u4E34\u65F6\u6570\u636E\u3002",
    persistenceQuotaRecoveryTitle: "\u672C\u673A\u5B58\u50A8\u7A7A\u95F4\u4E0D\u8DB3\uFF0C\u5DF2\u6682\u505C\u5199\u5165",
    persistenceQuotaRecoveryDetail: "\u5E94\u7528\u5DF2\u6210\u529F\u8BFB\u53D6\u73B0\u6709\u6570\u636E\uFF0C\u4F46\u65E0\u6CD5\u5B8C\u6210\u65B0\u7684\u5B89\u5168\u4FDD\u5B58\u3002\u4E3A\u4FDD\u62A4\u6570\u636E\uFF0C\u5F53\u524D\u6682\u65F6\u505C\u6B62\u5199\u5165\u3002\u53EF\u8BFB\u53D6\u7684\u73A9\u5177\u5E93\u548C\u56DE\u6EDA\u526F\u672C\u5747\u5DF2\u4FDD\u7559\uFF1B\u7CFB\u7EDF\u4EC5\u6E05\u7406\u4E86\u5197\u4F59\u4E34\u65F6\u8BB0\u5F55\u4E0E\u8F83\u65E7\u5FEB\u7167\u540E\u91CD\u8BD5\uFF0C\u672A\u5220\u9664\u4EFB\u4F55\u4E2A\u4EBA\u56FE\u7247\u3002",
    retrySafeStorageRecovery: "\u5B89\u5168\u91CA\u653E\u5197\u4F59\u5B58\u50A8\u5E76\u91CD\u8BD5",
    liked: "\u5F88\u559C\u6B22",
    neutral: "\u4E00\u822C",
    disliked: "\u6CA1\u5174\u8DA3",
    set: "\u5957\u88C5",
    setParent: "\u5957\u88C5\u7236\u9879",
    setChild: "\u5957\u88C5\u5B50\u73A9\u5177",
    unregisteredPlayMechanism: "\u672A\u767B\u8BB0\u6838\u5FC3\u73A9\u6CD5",
    onShelf: "\u5728\u67B6",
    stored: "\u6536\u7EB3",
    paused: "\u5DF2\u6536\u8D77",
    pauseRotation: "\u6536\u8D77\u6765",
    resumeRotation: "\u6062\u590D\u8F6E\u6362",
    pauseReasonLabel: "\u6682\u505C\u539F\u56E0",
    pauseReason: { not_interested: "\u6682\u65F6\u6CA1\u5174\u8DA3", too_easy: "\u592A\u7B80\u5355", too_hard: "\u592A\u96BE", seasonal: "\u5B63\u8282\u6027", space: "\u7A7A\u95F4\u4E0D\u8DB3", later: "\u7B49\u4EE5\u540E\u518D\u73A9", other: "\u5176\u5B83" },
    recognitionReview: "\u786E\u8BA4\u5E76\u7F16\u8F91",
    reanalyze: "\u91CD\u65B0\u8BC6\u522B",
    rotationParticipation: "\u5165\u5E93\u72B6\u6001",
    normalRotation: "\u6B63\u5E38\u53C2\u4E0E\u8F6E\u6362",
    draftSetPermanent: "\u8BBE\u4E3A\u5E38\u9A7B",
    draftPause: "\u6536\u8D77\u6765 / \u6682\u505C\u8F6E\u6362",
    splitSetContents: "\u5957\u88C5\u5185\u5BB9",
    localDraftOnly: "\u8FD9\u91CC\u7684\u4FEE\u6539\u53EA\u5F71\u54CD\u4F60\u7684\u4E2A\u4EBA\u8349\u7A3F\uFF0C\u4E0D\u4F1A\u4FEE\u6539\u5171\u4EAB\u6807\u51C6\u5E93\u3002",
    imageReviewConsent: "\u63D0\u4EA4\u8FD9\u5F20\u56FE\u7247\u5E2E\u52A9\u7BA1\u7406\u5458\u5BA1\u6838",
    viewAddedToy: "\u67E5\u770B\u521A\u6DFB\u52A0\u7684\u73A9\u5177",
    replaceImage: "\u66FF\u6362\u56FE\u7247",
    sku: "SKU / \u578B\u53F7",
    rotationValue: "\u8F6E\u6362\u4EF7\u503C",
    notes: "\u5907\u6CE8",
    hidden: "\u4E0D\u518D\u4F7F\u7528 / \u9690\u85CF",
    putOnShelf: "\u4E0A\u67B6",
    storeAway: "\u6536\u7EB3",
    manuallyOnShelf: "\u624B\u52A8\u4E0A\u67B6",
    keepOnShelf: "\u8BBE\u4E3A\u5E38\u9A7B",
    removeFromPermanent: "\u53D6\u6D88\u5E38\u9A7B",
    customPermanent: "\u5E38\u9A7B\u73A9\u5177",
    thisRotation: "\u672C\u8F6E\u8F6E\u6362",
    currentShelfTotal: "\u5F53\u524D\u67B6\u4E0A\u5171 {count} \u4E2A",
    permanentTargetHint: "\u5E38\u9A7B\u73A9\u5177\u4E0D\u4F1A\u8BA1\u5165\u672C\u8F6E\u8F6E\u6362\u6570\u91CF\u3002",
    permanentBadge: "\u5E38\u9A7B",
    noCustomPermanent: "\u6682\u65E0\u81EA\u5B9A\u4E49\u5E38\u9A7B\u73A9\u5177\u3002",
    personalImageEditor: "\u4E2A\u4EBA\u56FE\u7247\u7F16\u8F91",
    cropImageHint: "\u62D6\u52A8\u56FE\u7247\u8C03\u6574\u88C1\u526A\u4F4D\u7F6E\u3002",
    zoomImage: "\u653E\u5927\u7F29\u5C0F",
    rotateImage: "\u65CB\u8F6C 90\xB0",
    resetImage: "\u91CD\u7F6E",
    cropAndUseImage: "\u88C1\u526A\u5E76\u4F7F\u7528",
    finishImageEditing: "\u8BF7\u5148\u5B8C\u6210\u6216\u53D6\u6D88\u56FE\u7247\u7F16\u8F91\uFF0C\u518D\u4FDD\u5B58\u73A9\u5177\u3002",
    generate: "\u751F\u6210",
    generateThisRotation: "\u751F\u6210\u672C\u8F6E\u8F6E\u6362",
    rotationShortage: "\u5F53\u524D\u53EA\u6709 {selected} \u4EF6\u73A9\u5177\u7B26\u5408\u8F6E\u6362\u6761\u4EF6\uFF08\u76EE\u6807 {requested} \u4EF6\uFF09\u3002",
    noData: "\u6682\u65E0\u5185\u5BB9\u3002",
    persistenceRecoveryTitle: "\u672C\u673A\u6570\u636E\u9700\u8981\u5B89\u5168\u6062\u590D",
    persistenceRecoveryDetail: "\u5E94\u7528\u65E0\u6CD5\u5B89\u5168\u8BFB\u53D6\u672C\u673A\u6570\u636E\uFF0C\u56E0\u6B64\u5DF2\u7981\u6B62\u5199\u5165\u3002\u8BF7\u5BFC\u51FA\u8BCA\u65AD\uFF0C\u6216\u660E\u786E\u9009\u62E9\u91CD\u65B0\u5F00\u59CB\u65B0\u7684\u73A9\u5177\u5E93\u3002",
    persistenceDiagnosticModeDetail: "\u6B64\u8BCA\u65AD\u5019\u9009\u9ED8\u8BA4\u53EA\u8BFB\uFF1B\u53EA\u6709\u4F60\u660E\u786E\u786E\u8BA4\u540E\u624D\u4F1A\u6267\u884C\u5DF2\u9A8C\u8BC1\u7684\u65E7\u6570\u636E\u6062\u590D\u3002\u8BF7\u4E0D\u8981\u6E05\u9664\u6D4F\u89C8\u5668\u6570\u636E\u3002",
    persistenceClassification: "\u5B58\u50A8\u5224\u5B9A",
    applyDetectedRecovery: "\u6267\u884C\u68C0\u6D4B\u5230\u7684\u5B89\u5168\u6062\u590D",
    confirmDetectedRecovery: "\u786E\u8BA4\u6267\u884C\u5DF2\u9A8C\u8BC1\u7684 staged recovery \u5417\uFF1F\u539F legacy \u6570\u636E\u4E0D\u4F1A\u88AB\u5220\u9664\u3002",
    exportPersistenceDiagnostic: "\u5BFC\u51FA\u672C\u673A\u5B58\u50A8\u8BCA\u65AD",
    persistenceRecoverySettingsNotice: "\u672C\u673A\u6570\u636E\u65E0\u6CD5\u5B89\u5168\u8BFB\u53D6\uFF1A\u5DF2\u7981\u6B62\u5199\u5165\u7A7A\u767D\u72B6\u6001\u3002\u8BF7\u5148\u5BFC\u51FA\u8BCA\u65AD\u3002",
    startFresh: "\u91CD\u65B0\u5F00\u59CB",
    confirmStartFresh: "\u786E\u5B9A\u521B\u5EFA\u65B0\u7684\u672C\u673A\u73A9\u5177\u8F6E\u6362\u5E93\u5417\uFF1F\u73B0\u6709\u5B58\u50A8\u75D5\u8FF9\u4F1A\u4FDD\u7559\u4EE5\u4FBF\u5B89\u5168\u68C0\u67E5\uFF0C\u4F46\u6B64\u8BBE\u5907\u5C06\u4ECE\u7A7A\u767D\u73A9\u5177\u5E93\u91CD\u65B0\u5F00\u59CB\u3002",
    persistenceStartFreshFailed: "\u65E0\u6CD5\u5B89\u5168\u521B\u5EFA\u65B0\u7684\u672C\u673A\u73A9\u5177\u5E93\u3002",
    category: { uncategorized: "\u672A\u5206\u7C7B", cognitive: "\u76CA\u667A\u7C7B\u73A9\u5177", blocks_construction: "\u79EF\u6728/\u5EFA\u6784", puzzles_matching: "\u62FC\u56FE/\u914D\u5BF9", fine_motor: "\u7CBE\u7EC6\u52A8\u4F5C", pretend_play: "\u89D2\u8272\u626E\u6F14", sensory: "\u611F\u5B98\u63A2\u7D22", music: "\u97F3\u4E50", vehicles_tracks: "\u8F66\u8F86/\u8F68\u9053", dolls_plush: "\u5A03\u5A03/\u6BDB\u7ED2", books_cards: "\u9605\u8BFB/\u5361\u7247", outdoor_gross_motor: "\u6237\u5916/\u5927\u8FD0\u52A8", open_ended: "\u5F00\u653E\u5F0F\u6750\u6599", language_cognitive: "\u8BED\u8A00/\u8BA4\u77E5", arts_crafts: "\u7F8E\u672F/\u624B\u5DE5", other: "\u5176\u4ED6" },
    mechanic: { jigsaw: "\u62FC\u56FE", matching_sorting: "\u914D\u5BF9 / \u5206\u7C7B", maze_logic: "\u8FF7\u5BAB / \u903B\u8F91", magnetic_build: "\u78C1\u529B\u5EFA\u6784", blocks_build: "\u79EF\u6728\u5EFA\u6784", marble_track: "\u6EDA\u73E0 / \u8F68\u9053", screw_bolt_tool: "\u87BA\u4E1D / \u5DE5\u5177\u64CD\u4F5C", threading_lacing: "\u7A7F\u7EBF / \u4E32\u73E0", stack_balance: "\u5806\u53E0 / \u5E73\u8861", drawing_art: "\u7ED8\u753B / \u7F8E\u672F", music_play: "\u97F3\u4E50\u64CD\u4F5C", pretend_role: "\u60C5\u5883\u89D2\u8272\u626E\u6F14", care_doll: "\u5A03\u5A03\u7167\u62A4", cleaning: "\u6E05\u6D01\u5BB6\u52A1", cooking_serving: "\u70F9\u996A / \u62DB\u5F85", medical_care: "\u533B\u7597\u7167\u62A4", shop_service: "\u5546\u5E97\u670D\u52A1", repair_build_role: "\u7EF4\u4FEE / \u5DE5\u5177\u89D2\u8272\u626E\u6F14", ride_balance: "\u9A91\u4E58 / \u5E73\u8861", pull_push_walk: "\u63A8\u62C9 / \u5B66\u6B65", throw_catch_ball: "\u6295\u63B7 / \u63A5\u7403", fine_motor_general: "\u901A\u7528\u7CBE\u7EC6\u52A8\u4F5C", construction_general: "\u901A\u7528\u5EFA\u6784\u73A9\u6CD5", pretend_play_general: "\u901A\u7528\u89D2\u8272\u626E\u6F14", sensory_general: "\u901A\u7528\u611F\u5B98\u63A2\u7D22", magnetic_fishing: "\u78C1\u529B\u9493\u9C7C" },
    skill: { logic: "\u903B\u8F91\u63A8\u7406", math: "\u6570\u5B66\u542F\u8499", sorting: "\u5206\u7C7B\u80FD\u529B", memory: "\u8BB0\u5FC6\u529B", problem_solving: "\u95EE\u9898\u89E3\u51B3", cause_effect: "\u56E0\u679C\u5173\u7CFB", spatial_awareness: "\u7A7A\u95F4\u8BA4\u77E5", fine_motor: "\u7CBE\u7EC6\u52A8\u4F5C", hand_eye: "\u624B\u773C\u534F\u8C03", visual_spatial: "\u89C6\u89C9\u7A7A\u95F4", language: "\u8BED\u8A00", matching: "\u8BA4\u77E5\u914D\u5BF9", attention: "\u4E13\u6CE8\u529B", creativity: "\u521B\u9020\u529B", pretend_play: "\u89D2\u8272\u626E\u6F14", social: "\u793E\u4EA4\u4E92\u52A8", gross_motor: "\u5927\u8FD0\u52A8", sensory_exploration: "\u611F\u5B98\u63A2\u7D22", practical_life: "\u751F\u6D3B\u6280\u80FD", colour: "\u989C\u8272\u8BA4\u77E5", observation: "\u89C2\u5BDF\u529B", music: "\u97F3\u4E50", shapes: "\u5F62\u72B6\u8BA4\u77E5", balance: "\u5E73\u8861\u63A7\u5236", rules: "\u89C4\u5219\u610F\u8BC6", body_coordination: "\u8EAB\u4F53\u534F\u8C03", grasping: "\u6293\u63E1\u80FD\u529B", aesthetics: "\u5BA1\u7F8E\u8868\u8FBE", visual_tracking: "\u89C6\u89C9\u8FFD\u8E2A", strategy: "\u7B56\u7565\u601D\u7EF4", social_cognition: "\u793E\u4F1A\u8BA4\u77E5", animal_cognition: "\u52A8\u7269\u8BA4\u77E5", science: "\u79D1\u5B66\u542F\u8499", open_play: "\u5F00\u653E\u5F0F\u6E38\u620F", imagination: "\u60F3\u8C61\u529B", letters: "\u5B57\u6BCD\u542F\u8499", oral_motor: "\u53E3\u8154\u8FD0\u52A8" }
  }
};
Object.assign(DICTIONARY.en, {
  dataAudit: "Data Audit",
  exportToyImageAudit: "Export Toy Image Audit",
  exportToyImageAuditHint: "Read-only image status for mapped Toy Library and Wishlist items. No images or private notes are exported.",
  exportCatalogSafetyAudit: "Export Catalog Safety Audit",
  exportCatalogSafetyAuditHint: "Read-only Catalog safety review list for your Toy Library, Wishlist, and rotation candidates. No private notes or photos are exported.",
  developmentFeedbackTitle: "How did this go?",
  developmentFeedbackPrompt: "How did this go?",
  developmentFeedback: { too_easy: "Too Easy", just_right: "Just Right", good_challenge: "Good Challenge", too_hard: "Too Hard", not_interested: "Not Interested" },
  recommendationReason: { progression: "A good next challenge for current play.", developmentFit: "Fits current play well.", diversity: "Adds variety to the current shelf.", recency: "A less recent option for this rotation.", familiar: "A familiar option for the current shelf." },
  developmentChallenge: { 1: "Intro", 2: "Basic", 3: "Moderate", 4: "Advanced", 5: "Higher Challenge" },
  challengeFilter: "Difficulty",
  ageFilter: "Age",
  ageCurrent: "Current age",
  ageLater: "For later",
  fitCurrentChild: "Fit Current Child",
  noCatalogResults: "No catalog toys match these filters.",
  mechanicsReference: "Play mechanism reference",
  mechanic: { ...DICTIONARY.en.mechanic, posting: "Posting / drop play", shape_sorting: "Shape sorting", puzzle: "Puzzle", matching_sorting: "Matching / sorting", stacking: "Stacking", threading_lacing: "Threading / lacing", lock_key: "Lock and key", screw_bolt_tool: "Screw / tool play", ball_drop: "Ball drop", blocks_build: "Block construction", magnetic_build: "Magnetic construction", pretend_role: "Pretend role play", track_vehicle: "Vehicles / tracks", pull_push_walk: "Pull / push / walk", magnetic_fishing: "Magnetic fishing", maze_logic: "Maze / logic", jigsaw: "Jigsaw puzzle", balance: "Balance", cause_effect: "Cause and effect", music_play: "Music play", sensory: "Sensory play", fine_motor: "Fine-motor play" }
});
Object.assign(DICTIONARY.zh, {
  dataAudit: "\u6570\u636E\u5BA1\u8BA1",
  exportToyImageAudit: "\u5BFC\u51FA\u73A9\u5177\u56FE\u7247\u5BA1\u8BA1",
  exportToyImageAuditHint: "\u53EA\u8BFB\u5BFC\u51FA\u5DF2\u6620\u5C04\u73A9\u5177\u5E93\u548C\u5FC3\u613F\u5355\u7684\u56FE\u7247\u72B6\u6001\uFF0C\u4E0D\u5BFC\u51FA\u56FE\u7247\u6216\u79C1\u5BC6\u5907\u6CE8\u3002",
  exportCatalogSafetyAudit: "\u5BFC\u51FA\u6807\u51C6\u5E93\u5B89\u5168\u5BA1\u8BA1",
  exportCatalogSafetyAuditHint: "\u53EA\u8BFB\u5BFC\u51FA\u73A9\u5177\u5E93\u3001\u5FC3\u613F\u5355\u53CA\u8F6E\u6362\u5019\u9009\u7684\u6807\u51C6\u5E93\u5B89\u5168\u6838\u9A8C\u6E05\u5355\uFF0C\u4E0D\u5305\u542B\u79C1\u4EBA\u5907\u6CE8\u6216\u7167\u7247\u3002",
  developmentFeedbackTitle: "\u8FD9\u6B21\u73A9\u5F97\u600E\u4E48\u6837\uFF1F",
  developmentFeedbackPrompt: "\u8FD9\u6B21\u73A9\u5F97\u600E\u4E48\u6837\uFF1F",
  developmentFeedback: { too_easy: "\u592A\u7B80\u5355", just_right: "\u521A\u521A\u597D", good_challenge: "\u6709\u4E00\u70B9\u6311\u6218\uFF0C\u6B63\u5408\u9002", too_hard: "\u592A\u96BE", not_interested: "\u6CA1\u5174\u8DA3" },
  recommendationReason: { progression: "\u9002\u5408\u5F53\u524D\u73A9\u6CD5\u7684\u4E0B\u4E00\u6B65\u6311\u6218\u3002", developmentFit: "\u9002\u5408\u5B69\u5B50\u5F53\u524D\u7684\u73A9\u6CD5\u3002", diversity: "\u4E3A\u5F53\u524D\u73A9\u5177\u67B6\u589E\u52A0\u4E00\u4E9B\u53D8\u5316\u3002", recency: "\u8FD9\u8F6E\u4F18\u5148\u5B89\u6392\u8F83\u4E45\u6CA1\u73A9\u7684\u73A9\u5177\u3002", familiar: "\u9002\u5408\u5F53\u524D\u73A9\u5177\u67B6\u7684\u719F\u6089\u9009\u62E9\u3002" },
  developmentChallenge: { 1: "\u5165\u95E8", 2: "\u57FA\u7840", 3: "\u9002\u4E2D", 4: "\u8FDB\u9636", 5: "\u8F83\u9AD8\u6311\u6218" },
  challengeFilter: "\u96BE\u5EA6",
  ageFilter: "\u6708\u9F84",
  ageCurrent: "\u5F53\u524D\u9002\u9F84",
  ageLater: "\u4EE5\u540E\u518D\u73A9",
  fitCurrentChild: "\u9002\u5408\u5F53\u524D\u5B69\u5B50",
  noCatalogResults: "\u6CA1\u6709\u7B26\u5408\u8FD9\u4E9B\u7B5B\u9009\u6761\u4EF6\u7684\u6807\u51C6\u73A9\u5177\u3002",
  mechanicsReference: "\u73A9\u6CD5\u673A\u5236\u53C2\u8003",
  mechanic: { ...DICTIONARY.zh.mechanic, posting: "\u6295\u653E / \u843D\u4E0B\u73A9\u6CD5", shape_sorting: "\u5F62\u72B6\u5206\u7C7B", puzzle: "\u76CA\u667A\u62FC\u56FE", matching_sorting: "\u914D\u5BF9 / \u5206\u7C7B", stacking: "\u5806\u53E0", threading_lacing: "\u7A7F\u7EBF / \u4E32\u73E0", lock_key: "\u5F00\u9501 / \u94A5\u5319", screw_bolt_tool: "\u87BA\u4E1D / \u5DE5\u5177\u64CD\u4F5C", ball_drop: "\u6EDA\u7403\u4E0B\u843D", blocks_build: "\u79EF\u6728\u5EFA\u6784", magnetic_build: "\u78C1\u529B\u5EFA\u6784", pretend_role: "\u60C5\u5883\u89D2\u8272\u626E\u6F14", track_vehicle: "\u8F66\u8F86 / \u8F68\u9053", pull_push_walk: "\u63A8\u62C9 / \u5B66\u6B65", magnetic_fishing: "\u78C1\u529B\u9493\u9C7C", maze_logic: "\u8FF7\u5BAB / \u903B\u8F91", jigsaw: "\u62FC\u56FE", balance: "\u5E73\u8861", cause_effect: "\u56E0\u679C\u64CD\u4F5C", music_play: "\u97F3\u4E50\u64CD\u4F5C", sensory: "\u611F\u5B98\u63A2\u7D22", fine_motor: "\u7CBE\u7EC6\u52A8\u4F5C" }
});
Object.assign(DICTIONARY.en, {
  catalogReportTitle: "Report an issue",
  catalogReportType: "Issue type",
  catalogReportDescription: "Description",
  catalogReportAttachment: "Optional screenshot",
  catalogReportSubmit: "Submit report",
  catalogReportSubmitted: "Report submitted.",
  catalogReportAttachmentTooLarge: "Attachment must be 700 KB or smaller.",
  catalogReportFailed: "Unable to save report.",
  catalogReportType: { image_wrong: "Image is incorrect", duplicate: "Duplicate product", name_wrong: "Name is incorrect", brand_wrong: "Brand is incorrect", sku_wrong: "SKU / model is incorrect", age_wrong: "Age range is incorrect", category_wrong: "Toy type is incorrect", skills_wrong: "Skills are incorrect", mechanism_wrong: "Core play mechanism is incorrect", parent_child_wrong: "Parent / child relationship is incorrect", retired: "Retired or nonexistent", other: "Other" },
  exportCatalogCountDiagnostic: "Export Catalog count diagnostic",
  exportCatalogCountDiagnosticHint: "Read-only export of Catalog source, merge, visibility, and count state."
});
Object.assign(DICTIONARY.zh, {
  catalogReportTitle: "\u62A5\u544A\u95EE\u9898",
  catalogReportType: "\u95EE\u9898\u7C7B\u578B",
  catalogReportDescription: "\u8BF4\u660E",
  catalogReportAttachment: "\u53EF\u9009\u622A\u56FE",
  catalogReportSubmit: "\u63D0\u4EA4\u62A5\u544A",
  catalogReportSubmitted: "\u62A5\u544A\u5DF2\u63D0\u4EA4\u3002",
  catalogReportAttachmentTooLarge: "\u9644\u4EF6\u4E0D\u80FD\u8D85\u8FC7 700 KB\u3002",
  catalogReportFailed: "\u65E0\u6CD5\u4FDD\u5B58\u62A5\u544A\u3002",
  catalogReportType: { image_wrong: "\u56FE\u7247\u4E0D\u6B63\u786E", duplicate: "\u91CD\u590D\u4EA7\u54C1", name_wrong: "\u540D\u79F0\u4E0D\u6B63\u786E", brand_wrong: "\u54C1\u724C\u4E0D\u6B63\u786E", sku_wrong: "SKU / \u578B\u53F7\u4E0D\u6B63\u786E", age_wrong: "\u5EFA\u8BAE\u6708\u9F84\u4E0D\u6B63\u786E", category_wrong: "\u73A9\u5177\u7C7B\u578B\u4E0D\u6B63\u786E", skills_wrong: "\u80FD\u529B\u6807\u7B7E\u4E0D\u6B63\u786E", mechanism_wrong: "\u6838\u5FC3\u73A9\u6CD5\u673A\u5236\u4E0D\u6B63\u786E", parent_child_wrong: "\u5957\u88C5 / \u5B50\u73A9\u5177\u5173\u7CFB\u4E0D\u6B63\u786E", retired: "\u5DF2\u505C\u4EA7\u6216\u4E0D\u5B58\u5728", other: "\u5176\u4ED6" },
  exportCatalogCountDiagnostic: "\u5BFC\u51FA\u6807\u51C6\u5E93\u6570\u91CF\u8BCA\u65AD",
  exportCatalogCountDiagnosticHint: "\u53EA\u8BFB\u5BFC\u51FA\u6807\u51C6\u5E93\u6765\u6E90\u3001\u5408\u5E76\u3001\u53EF\u89C1\u6027\u4E0E\u6570\u91CF\u72B6\u6001\u3002"
});
Object.assign(DICTIONARY.en, { abilityProfile: {
  title: "Ability profile",
  hint: "Set each play skill separately, or leave it on automatic learning.",
  auto: "Automatic",
  group: { thinking: "Puzzles and thinking", hands: "Hands and building", exploration: "Play and movement" },
  level: { intro: "Just starting", basic: "Getting it", fluent: "Confident", challenge: "Ready for a challenge" },
  mechanism: { puzzle: "Puzzles", matching_sorting: "Matching", shape_sorting: "Shape sorting", counting_quantity: "Counting and quantities", color_pattern: "Colors and patterns", blocks_build: "Blocks and spatial building", screw_bolt_tool: "Screws and tools", threading_lacing: "Threading and lacing", lock_key: "Locks and mechanisms", magnetic_build: "Magnetic play", fine_motor_general: "Grasping and tweezers", cause_effect: "Pounding, tracks and cause-effect", pretend_role: "Pretend play", music_play: "Music interaction", balance: "Balance and movement" }
} });
Object.assign(DICTIONARY.zh, { abilityProfile: {
  title: "\u80FD\u529B\u6863\u6848",
  hint: "\u6BCF\u79CD\u73A9\u6CD5\u53EF\u5355\u72EC\u8BBE\u7F6E\uFF0C\u4E5F\u53EF\u4FDD\u6301\u81EA\u52A8\u5224\u65AD\u3002",
  auto: "\u81EA\u52A8\u5224\u65AD",
  group: { thinking: "\u62FC\u56FE\u4E0E\u601D\u8003", hands: "\u52A8\u624B\u4E0E\u5EFA\u6784", exploration: "\u60C5\u5883\u4E0E\u8FD0\u52A8" },
  level: { intro: "\u521A\u63A5\u89E6", basic: "\u57FA\u672C\u4F1A", fluent: "\u719F\u7EC3", challenge: "\u9700\u8981\u6311\u6218" },
  mechanism: { puzzle: "\u62FC\u56FE", matching_sorting: "\u914D\u5BF9", shape_sorting: "\u5F62\u72B6\u5206\u7C7B", counting_quantity: "\u8BA1\u6570\u4E0E\u6570\u91CF", color_pattern: "\u989C\u8272\u4E0E\u89C4\u5F8B", blocks_build: "\u79EF\u6728\u4E0E\u7A7A\u95F4\u5EFA\u6784", screw_bolt_tool: "\u87BA\u4E1D\u4E0E\u5DE5\u5177", threading_lacing: "\u7A7F\u7EBF\u4E0E\u4E32\u73E0", lock_key: "\u5F00\u9501\u4E0E\u673A\u5173", magnetic_build: "\u78C1\u529B\u64CD\u4F5C", fine_motor_general: "\u6293\u63E1\u4E0E\u954A\u5B50", cause_effect: "\u6572\u51FB\u3001\u8F68\u9053\u4E0E\u56E0\u679C", pretend_role: "\u60C5\u5883\u626E\u6F14", music_play: "\u97F3\u4E50\u4E92\u52A8", balance: "\u5E73\u8861\u4E0E\u5927\u8FD0\u52A8" }
} });
Object.assign(DICTIONARY.en, {
  crossAgeApprovalExplanation: "Allowing this toy only makes it eligible for a challenge rotation. Ability fit and all other recommendation rules still apply.",
  crossAgeAllow: "Allow early in rotation",
  crossAgeDecline: "Not now",
  crossAgeApproved: "You allowed this toy to participate across the suggested age range.",
  crossAgeRevoke: "Revoke allowance",
  challengeEntryTitle: "Challenge toys",
  challengeSettingsTitle: "Challenge toy settings",
  challengeEntrySummary: "{count} toys can be considered early \xB7 {pending} to decide \xB7 {approved} allowed",
  challengeOpenSettings: "Manage challenge toys",
  challengeSettingsIntro: "Decide separately for each toy. Allowing one does not guarantee it will be recommended.",
  challengeAges: "Manufacturer guidance: {recommended} months+ \xB7 Child: {current} months",
  challengeSafetyNote: "No specific hard safety warning was documented in the product information reviewed. This does not mean the manufacturer confirms use at a younger age.",
  challengeStatusPending: "Can decide",
  challengeStatusAllowed: "Allowed early in rotation",
  challengeStatusDeclined: "Not allowed early",
  challengeBadgeAvailable: "Early challenge available",
  challengeBadgeAllowed: "Challenge allowed",
  challengeHardBlocked: "This toy has a documented hard safety restriction and cannot be added early to a challenge rotation.",
  challengeUnknownBlocked: "There is not enough safety information to support early participation in rotation."
});
Object.assign(DICTIONARY.zh, {
  crossAgeApprovalExplanation: "\u5F00\u542F\u540E\uFF0C\u8FD9\u4EF6\u73A9\u5177\u53EA\u4F1A\u83B7\u5F97\u53C2\u4E0E\u6311\u6218\u578B\u8F6E\u6362\u7684\u8D44\u683C\uFF0C\u4ECD\u4F1A\u7EE7\u7EED\u7ECF\u8FC7\u80FD\u529B\u5339\u914D\u548C\u5176\u4ED6\u63A8\u8350\u89C4\u5219\u3002",
  crossAgeAllow: "\u5141\u8BB8\u63D0\u524D\u53C2\u4E0E\u8F6E\u6362",
  crossAgeDecline: "\u6682\u4E0D\u5141\u8BB8",
  crossAgeApproved: "\u5DF2\u5141\u8BB8\u8FD9\u4EF6\u73A9\u5177\u8DE8\u5EFA\u8BAE\u6708\u9F84\u53C2\u4E0E\u8F6E\u6362\u3002",
  crossAgeRevoke: "\u64A4\u9500\u5141\u8BB8",
  challengeEntryTitle: "\u6311\u6218\u73A9\u5177",
  challengeSettingsTitle: "\u6311\u6218\u73A9\u5177\u8BBE\u7F6E",
  challengeEntrySummary: "{count} \u4E2A\u73A9\u5177\u53EF\u7531\u5BB6\u957F\u51B3\u5B9A\u662F\u5426\u63D0\u524D\u53C2\u4E0E \xB7 \u5F85\u51B3\u5B9A {pending} \xB7 \u5DF2\u5141\u8BB8 {approved}",
  challengeOpenSettings: "\u7BA1\u7406\u6311\u6218\u73A9\u5177",
  challengeSettingsIntro: "\u8BF7\u9010\u4EF6\u51B3\u5B9A\u3002\u5141\u8BB8\u63D0\u524D\u53C2\u4E0E\u5E76\u4E0D\u4FDD\u8BC1\u8BE5\u73A9\u5177\u4E00\u5B9A\u88AB\u63A8\u8350\u3002",
  challengeAges: "\u5382\u5BB6\u5EFA\u8BAE\uFF1A{recommended} \u4E2A\u6708+ \xB7 \u5F53\u524D\u6708\u9F84\uFF1A{current} \u4E2A\u6708",
  challengeSafetyNote: "\u5DF2\u67E5\u9605\u7684\u4EA7\u54C1\u8D44\u6599\u4E2D\u672A\u8BB0\u5F55\u660E\u786E\u7684\u786C\u6027\u5B89\u5168\u8B66\u544A\uFF0C\u4F46\u8FD9\u4E0D\u4EE3\u8868\u5382\u5BB6\u786E\u8BA4\u66F4\u4F4E\u6708\u9F84\u4F7F\u7528\u5B89\u5168\u3002",
  challengeStatusPending: "\u53EF\u51B3\u5B9A",
  challengeStatusAllowed: "\u5DF2\u5141\u8BB8\u63D0\u524D\u53C2\u4E0E",
  challengeStatusDeclined: "\u6682\u4E0D\u5141\u8BB8",
  challengeBadgeAvailable: "\u53EF\u63D0\u524D\u6311\u6218",
  challengeBadgeAllowed: "\u5DF2\u5141\u8BB8\u6311\u6218",
  challengeHardBlocked: "\u6B64\u73A9\u5177\u6709\u660E\u786E\u7684\u786C\u6027\u5B89\u5168\u9650\u5236\uFF0C\u4E0D\u80FD\u63D0\u524D\u52A0\u5165\u6311\u6218\u8F6E\u6362\u3002",
  challengeUnknownBlocked: "\u76EE\u524D\u6CA1\u6709\u8DB3\u591F\u5B89\u5168\u4FE1\u606F\u652F\u6301\u63D0\u524D\u53C2\u4E0E\u8F6E\u6362\u3002"
});
function createI18n(store2) {
  const language = () => store2.state.settings.language === "system" ? navigator.language.startsWith("zh") ? "zh" : "en" : store2.state.settings.language;
  const t2 = (key, params = {}) => {
    const parts = String(key).split(".");
    let value = DICTIONARY[language()];
    for (const part of parts) value = value?.[part];
    const label = typeof value === "string" || typeof value === "number" ? value : key;
    return String(label).replace(/\{(\w+)\}/g, (_, name) => params[name] ?? "");
  };
  return { t: t2, get language() {
    return language();
  }, setLanguage(value) {
    store2.update((state) => {
      state.settings.language = value;
    }, "language");
  } };
}

// src/ui/modal-manager.js
var ModalManager = class {
  #scrollY = 0;
  #dialog = null;
  #touchStartY = null;
  #onTouchStart = (event) => {
    this.#touchStartY = event.touches[0]?.clientY ?? null;
  };
  #onTouchMove = (event) => {
    const dialog = this.#dialog;
    if (!dialog || !dialog.contains(event.target)) {
      event.preventDefault();
      return;
    }
    const scroller = event.target instanceof Element ? event.target.closest(".form, .sheet") : null;
    if (!scroller || !dialog.contains(scroller)) {
      event.preventDefault();
      return;
    }
    const currentY = event.touches[0]?.clientY;
    if (this.#touchStartY == null || currentY == null) return;
    const pullingDown = currentY > this.#touchStartY;
    const pushingUp = currentY < this.#touchStartY;
    const atTop = scroller.scrollTop <= 0;
    const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
    if (atTop && pullingDown || atBottom && pushingUp) event.preventDefault();
  };
  open(dialog) {
    this.forceClose();
    this.#dialog = dialog;
    this.#scrollY = window.scrollY;
    document.documentElement.classList.add("modal-open");
    document.body.style.top = `-${this.#scrollY}px`;
    document.addEventListener("touchstart", this.#onTouchStart, { passive: true, capture: true });
    document.addEventListener("touchmove", this.#onTouchMove, { passive: false, capture: true });
    try {
      dialog.showModal();
      dialog.addEventListener("close", () => this.close(), { once: true });
      dialog.addEventListener("cancel", () => queueMicrotask(() => this.close()), { once: true });
    } catch (error) {
      this.close();
      throw error;
    }
  }
  close() {
    if (!document.documentElement.classList.contains("modal-open")) return;
    document.removeEventListener("touchstart", this.#onTouchStart, true);
    document.removeEventListener("touchmove", this.#onTouchMove, true);
    this.#touchStartY = null;
    document.documentElement.classList.remove("modal-open");
    document.body.style.top = "";
    this.#dialog = null;
    window.scrollTo(0, this.#scrollY);
  }
  forceClose() {
    if (this.#dialog?.open) this.#dialog.close();
    this.close();
  }
};

// src/ui/admin-workspace-controller.js
function createAdminWorkspaceController({ dialog, getAdminAuthenticated, getPendingCount, renderSettings, renderWorkspace, closeSettingsDialog, trace = () => {
} }) {
  const record = (stage, detail = {}) => trace(stage, detail);
  const setView = (view2) => {
    dialog.dataset.adminWorkspaceView = view2;
  };
  const restoreSettings = (reason2) => {
    if (reason2 === "back") record("back_requested");
    if (reason2 === "close") record("workspace_close_requested");
    renderSettings({ onOpenWorkspace: () => controller.open(), onClose: () => controller.closeSettings() });
    setView("settings");
    record("workspace_closed_to_settings", { reason: reason2 });
  };
  const controller = {
    get activeView() {
      return dialog.dataset.adminWorkspaceView || "settings";
    },
    open() {
      record("button_clicked");
      const authenticated = getAdminAuthenticated();
      record("auth_state", { authenticated });
      if (!authenticated) return false;
      record("open_requested");
      try {
        if (!dialog?.open) throw new Error("settings_dialog_not_open");
        dialog.__settingsBody ||= dialog.innerHTML;
        record("workspace_render_started");
        renderWorkspace({ pendingCount: getPendingCount(), onBack: () => controller.back(), onClose: () => controller.closeWorkspace() });
        setView("adminWorkspace");
        const root2 = dialog.querySelector("[data-admin-workspace-root]");
        if (!root2 || root2.hidden || root2.getAttribute("aria-hidden") === "true") throw new Error("workspace_not_visible");
        record("workspace_dom_created");
        record("workspace_visible");
        return true;
      } catch (error) {
        record("error", { message: error.message });
        return false;
      }
    },
    back() {
      restoreSettings("back");
    },
    closeWorkspace() {
      restoreSettings("close");
    },
    closeSettings() {
      record("settings_closed");
      closeSettingsDialog();
    }
  };
  return controller;
}

// src/ui/admin-governance-child.js
function renderAdminGovernanceChild({ dialog, loadGovernance, onReturn }) {
  let closeCount = 0;
  const close = () => {
    if (closeCount++) return;
    onReturn();
  };
  const bind = () => {
    dialog.querySelector("[data-governance-child-back]")?.addEventListener("click", close, { once: true });
    dialog.querySelector("[data-governance-child-close]")?.addEventListener("click", close, { once: true });
  };
  const unavailable = () => {
    if (!dialog.querySelector("[data-admin-governance-child]")) return;
    dialog.dataset.adminWorkspaceChild = "governance-unavailable";
    dialog.innerHTML = '<section class="sheet" data-admin-governance-child><header><h2>Catalog Governance</h2><button type="button" data-governance-child-back>\u2039</button><button type="button" data-governance-child-close>\xD7</button></header><p>Catalog Governance unavailable</p></section>';
    bind();
  };
  dialog.dataset.adminWorkspaceChild = "governance-loading";
  dialog.innerHTML = '<section class="sheet" data-admin-governance-child><header><h2>Catalog Governance</h2><button type="button" data-governance-child-back>\u2039</button><button type="button" data-governance-child-close>\xD7</button></header><p>Loading\u2026</p></section>';
  bind();
  Promise.resolve().then(loadGovernance).then(() => unavailable(), unavailable);
}

// src/ui/recognition-review-submit-controller.js
function bindRecognitionReviewSubmit({ form, recognitionDraftId, saveDraft, confirm: confirm2, onComplete, onError, trace = () => {
} }) {
  let submitting = false;
  const buttons = [...form.querySelectorAll("[data-destination]")];
  const record = (stage, detail = {}) => trace(stage, { recognitionDraftId, ...detail });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const destination = event.submitter?.dataset.destination || "library";
    record(destination === "library" ? "add_library_click" : "add_wishlist_click", { destination });
    if (submitting) {
      record("duplicate_click_blocked", { destination });
      return;
    }
    submitting = true;
    buttons.forEach((button) => button.disabled = true);
    record("destination_selected", { destination });
    record("submit_started", { destination });
    try {
      await saveDraft();
      const result2 = await confirm2(destination);
      record("submit_completed", { destination, localToyId: result2?.toy?.id || null, candidateId: result2?.candidateId || null });
      record("review_complete", { destination });
      onComplete(result2, destination);
      record("review_closed", { destination });
    } catch (error) {
      submitting = false;
      buttons.forEach((button) => button.disabled = false);
      record("submit_failed", { destination, message: error?.message || "recognitionFailed" });
      record("error", { destination, message: error?.message || "recognitionFailed" });
      onError(error);
    }
  });
}

// src/ui/recognition-review-production.js
function openRecognitionReviewProduction({ document: document2, openModal: openModal2, recognitionDraftId, getState, getRecognition: getRecognition2, updateDraft, images: images2, attachPersonalImageEditor: attachPersonalImageEditor2, t: t2, escape: escape2, categoryCodes, skillCodes, messageFor: messageFor2, setView, render: render2, trace = () => {
}, diagnostic = null }) {
  diagnostic?.begin(recognitionDraftId);
  diagnostic?.record("review_render_started", { recognitionDraftId });
  const draft = getState().drafts.find((item) => item.id === recognitionDraftId);
  if (!draft || !String(draft.status).startsWith("ready")) return;
  const pauseCodes = ["not_interested", "too_easy", "too_hard", "seasonal", "space", "later", "other"];
  const children = Array.isArray(draft.children) ? draft.children : [];
  const dialog = openModal2(`<form class="form recognition-review"><header><h2>${t2("recognitionReview")}</h2><button type="button" data-close>\xD7</button></header><p>${t2("localDraftOnly")}</p><label>${t2("brand")}<input name="brand" value="${escape2(draft.brand || "")}"></label><label>${t2("name")}<input name="productName" required value="${escape2(draft.productName || "")}"></label><label>${t2("englishName")}<input name="nameEn" value="${escape2(draft.names?.en || "")}"></label><label>${t2("chineseName")}<input name="nameZh" value="${escape2(draft.names?.zh || "")}"></label><label>${t2("sku")}<input name="sku" value="${escape2(draft.sku || "")}"></label><label>${t2("allCategories")}<select name="categoryCode">${categoryCodes.map((code) => `<option value="${code}" ${draft.categoryCode === code ? "selected" : ""}>${t2(`category.${code}`)}</option>`).join("")}</select></label><label>${t2("skills")}<select name="skillCodes" multiple size="6">${skillCodes.map((code) => `<option value="${code}" ${(draft.skillCodes || []).includes(code) ? "selected" : ""}>${t2(`skill.${code}`)}</option>`).join("")}</select></label><label>${t2("minimumAge")}<input name="minAgeMonths" type="number" value="${draft.minAgeMonths ?? ""}"></label><label>${t2("maximumAge")}<input name="maxAgeMonths" type="number" value="${draft.maxAgeMonths ?? ""}"></label><label>${t2("rotationValue")}<select name="rotationValue">${["low", "medium", "high"].map((value) => `<option value="${value}" ${(draft.rotationValue || "medium") === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label>${t2("notes")}<textarea name="notes">${escape2(draft.notes || "")}</textarea></label><label class="file-replace">${t2("replaceImage")}<input name="image" type="file" accept="image/*" hidden></label><div data-personal-image-editor-host></div><label>${t2("rotationParticipation")}<select name="rotationState"><option value="active">${t2("normalRotation")}</option><option value="permanent" ${draft.reviewRotationState === "permanent" ? "selected" : ""}>${t2("draftSetPermanent")}</option><option value="paused" ${draft.reviewRotationState === "paused" ? "selected" : ""}>${t2("draftPause")}</option></select></label><label data-draft-pause-reason ${draft.reviewRotationState === "paused" ? "" : "hidden"}>${t2("pauseReasonLabel")}<select name="pauseReasonCode">${pauseCodes.map((code) => `<option value="${code}" ${draft.pauseReasonCode === code ? "selected" : ""}>${t2(`pauseReason.${code}`)}</option>`).join("")}</select><input name="pauseReason" maxlength="240" value="${escape2(draft.pauseReason || "")}"></label>${children.length ? `<fieldset><legend>${t2("splitSetContents")} (${children.length})</legend>${children.map((child, index) => `<label>${index + 1}. <input name="child-${index}" value="${escape2(child.productName || child.name || child.names?.en || "")}"></label>`).join("")}</fieldset>` : ""}<p class="form-error" aria-live="polite"></p><footer><button type="button" data-reanalyze>${t2("reanalyze")}</button><button type="button" data-cancel-review>${t2("cancel")}</button><button class="primary" data-destination="library">${t2("addToToyLibrary")}</button><button class="primary" data-destination="wishlist">${t2("addToWishlist")}</button></footer></form>`);
  const form = dialog.querySelector("form");
  const input = form.elements.image;
  let editedImageData = null;
  diagnostic?.record("review_render_complete", { recognitionDraftId });
  const stopReviewObservation = diagnostic?.observeReview({ root: form, form, dialog, draftId: recognitionDraftId });
  dialog.addEventListener("close", () => stopReviewObservation?.(), { once: true });
  input.addEventListener("change", () => {
    editedImageData = null;
  });
  const imageEditor = attachPersonalImageEditor2({ input, host: form.querySelector("[data-personal-image-editor-host]"), t: t2, initialSource: images2.resolve(draft.imageRef), onEdited: (data) => {
    editedImageData = data;
    form.querySelector(".form-error").textContent = "";
  } });
  form.elements.rotationState.onchange = () => form.querySelector("[data-draft-pause-reason]").hidden = form.elements.rotationState.value !== "paused";
  const saveDraft = async () => {
    diagnostic?.state("save_draft_started", getState());
    const values = new FormData(form);
    const file = values.get("image");
    if (file?.size && !editedImageData) throw new Error("finishImageEditing");
    let imageRef = draft.imageRef;
    const replacedImageRef = draft.imageRef;
    if (editedImageData) {
      imageRef = await images2.savePersonal(editedImageData);
      editedImageData = null;
    }
    updateDraft((state) => {
      const item = state.drafts.find((entry) => entry.id === recognitionDraftId);
      if (!item) return;
      Object.assign(item, { imageRef, brand: String(values.get("brand") || ""), productName: String(values.get("productName") || ""), names: { en: String(values.get("nameEn") || ""), zh: String(values.get("nameZh") || "") }, sku: String(values.get("sku") || "") || null, categoryCode: values.get("categoryCode"), skillCodes: values.getAll("skillCodes"), minAgeMonths: values.get("minAgeMonths") === "" ? null : Number(values.get("minAgeMonths")), maxAgeMonths: values.get("maxAgeMonths") === "" ? null : Number(values.get("maxAgeMonths")), rotationValue: values.get("rotationValue"), notes: String(values.get("notes") || ""), reviewRotationState: values.get("rotationState"), pauseReasonCode: values.get("rotationState") === "paused" ? String(values.get("pauseReasonCode") || "") : null, pauseReason: values.get("rotationState") === "paused" ? String(values.get("pauseReason") || "") : "" });
      item.children = (item.children || []).map((child, index) => ({ ...child, productName: String(values.get(`child-${index}`) || child.productName || child.name || ""), names: { ...child.names || {}, en: String(values.get(`child-${index}`) || child.names?.en || child.productName || "") } }));
    }, "recognition-draft-review");
    if (replacedImageRef?.kind === "personal" && replacedImageRef.id !== imageRef.id) await images2.removePersonal(replacedImageRef);
    diagnostic?.state("save_draft_completed", getState());
  };
  form.querySelector("[data-reanalyze]").onclick = async () => {
    try {
      editedImageData = editedImageData || imageEditor.editedDataUrl();
      await saveDraft();
      await getRecognition2().analyze(recognitionDraftId, { force: true });
      dialog.close();
    } catch (error) {
      form.querySelector(".form-error").textContent = messageFor2(error.code || error.message);
    }
  };
  form.querySelector("[data-cancel-review]").onclick = async () => {
    await getRecognition2().remove(recognitionDraftId);
    dialog.close();
  };
  trace("review_opened", { recognitionDraftId, canonicalProposal: draft.canonicalKey || null });
  bindRecognitionReviewSubmit({ form, recognitionDraftId, saveDraft, confirm: async (destination) => {
    diagnostic?.state("confirm_started", getState(), { destination });
    try {
      const result2 = await getRecognition2().confirm(recognitionDraftId, { destination });
      diagnostic?.record("confirm_completed", { destination, localToyId: result2?.toy?.id || null, wishlistId: result2?.wishlist?.id || null });
      diagnostic?.state("candidate_chain_completed", getState(), { destination });
      return result2;
    } catch (error) {
      diagnostic?.record("confirm_failed", { destination, message: error?.message || "" });
      throw error;
    }
  }, onComplete: (result2) => {
    diagnostic?.record("review_close_requested", {});
    dialog.close();
    diagnostic?.finish(getState(), { reviewClosed: true });
    if (result2?.toy) {
      setView("library");
      render2();
      setTimeout(() => document2.querySelector(`[data-toy-id="${result2.toy.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
    } else if (result2?.wishlist) {
      setView("wishlist");
      render2();
    }
  }, onError: (error) => {
    const quota = error?.name === "QuotaExceededError" || error?.code === 22 || /quota\s+has\s+been\s+exceeded/i.test(String(error?.message || ""));
    form.querySelector(".form-error").textContent = messageFor2(quota ? "storageQuotaExceeded" : typeof error?.code === "string" ? error.code : error?.message || "recognitionFailed");
  }, trace });
}

// src/ui/personal-image-editor.js
var OUTPUT_SIZE = 1024;
function attachImageEditor({ input, host, t: t2, onEdited, initialSource = null, title = null }) {
  let image = null;
  let sourceDataUrl = null;
  let state = freshState();
  let dragging = null;
  const editorTitle = title || t2("personalImageEditor");
  host.innerHTML = `<section class="personal-image-editor hidden" aria-label="${escapeAttribute(editorTitle)}">
    <header><h3>${escapeHtml(editorTitle)}</h3></header>
    <p>${escapeHtml(t2("cropImageHint"))}</p>
    <div class="personal-image-crop"><canvas width="${OUTPUT_SIZE}" height="${OUTPUT_SIZE}"></canvas></div>
    <label>${escapeHtml(t2("zoomImage"))}<input data-image-zoom type="range" min="1" max="3.5" step="0.05" value="1"></label>
    <div class="image-editor-actions">
      <button type="button" data-image-rotate>${escapeHtml(t2("rotateImage"))}</button>
      <button type="button" data-image-reset>${escapeHtml(t2("resetImage"))}</button>
      <button type="button" data-image-cancel>${escapeHtml(t2("cancel"))}</button>
      <button type="button" class="primary" data-image-save>${escapeHtml(t2("cropAndUseImage"))}</button>
    </div>
  </section>`;
  const editor = host.querySelector(".personal-image-editor");
  const canvas = editor.querySelector("canvas");
  const zoom = editor.querySelector("[data-image-zoom]");
  const context = canvas.getContext("2d");
  const loadSource = async (source) => {
    if (!source) return false;
    sourceDataUrl = source;
    image = await loadImage(sourceDataUrl);
    state = freshState();
    zoom.value = "1";
    editor.classList.remove("hidden");
    draw(context, canvas, image, state);
    return true;
  };
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    await loadSource(await fileToDataUrl(file));
  });
  zoom.addEventListener("input", () => {
    state.zoom = Number(zoom.value);
    draw(context, canvas, image, state);
  });
  editor.querySelector("[data-image-rotate]").addEventListener("click", () => {
    state.rotation = (state.rotation + 90) % 360;
    draw(context, canvas, image, state);
  });
  editor.querySelector("[data-image-reset]").addEventListener("click", () => {
    state = freshState();
    zoom.value = "1";
    draw(context, canvas, image, state);
  });
  editor.querySelector("[data-image-cancel]").addEventListener("click", () => {
    input.value = "";
    sourceDataUrl = null;
    image = null;
    state = freshState();
    editor.classList.add("hidden");
    onEdited(null);
  });
  editor.querySelector("[data-image-save]").addEventListener("click", () => {
    if (!image) return;
    draw(context, canvas, image, state);
    onEdited(canvas.toDataURL("image/jpeg", 0.92));
    editor.classList.add("hidden");
  });
  canvas.addEventListener("pointerdown", (event) => {
    dragging = pointer(canvas, event);
    canvas.setPointerCapture?.(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging || !image) return;
    const next = pointer(canvas, event);
    state.panX += next.x - dragging.x;
    state.panY += next.y - dragging.y;
    dragging = next;
    draw(context, canvas, image, state);
  });
  const stopDragging = (event) => {
    dragging = null;
    canvas.releasePointerCapture?.(event.pointerId);
  };
  canvas.addEventListener("pointerup", stopDragging);
  canvas.addEventListener("pointercancel", stopDragging);
  const ready = Promise.resolve(initialSource).then(loadSource).catch(() => false);
  return {
    ready,
    get sourceDataUrl() {
      return sourceDataUrl;
    },
    editedDataUrl() {
      if (!image) return null;
      draw(context, canvas, image, state);
      return canvas.toDataURL("image/jpeg", 0.92);
    },
    reset() {
      input.value = "";
      editor.classList.add("hidden");
      state = freshState();
      image = null;
      sourceDataUrl = null;
    }
  };
}
function attachPersonalImageEditor(options) {
  return attachImageEditor({ ...options, title: options.title || options.t("personalImageEditor") });
}
function imageDrawGeometry(imageWidth, imageHeight, rotation, zoom = 1, panX = 0, panY = 0, size = OUTPUT_SIZE) {
  const quarterTurn = Math.abs(rotation % 180) === 90;
  const rotatedWidth = quarterTurn ? imageHeight : imageWidth;
  const rotatedHeight = quarterTurn ? imageWidth : imageHeight;
  const cover = Math.max(size / rotatedWidth, size / rotatedHeight);
  return { scale: cover * zoom, centerX: size / 2 + panX, centerY: size / 2 + panY };
}
function draw(context, canvas, image, state) {
  if (!image) return;
  const geometry = imageDrawGeometry(image.naturalWidth || image.width, image.naturalHeight || image.height, state.rotation, state.zoom, state.panX, state.panY, canvas.width);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(geometry.centerX, geometry.centerY);
  context.rotate(state.rotation * Math.PI / 180);
  context.scale(geometry.scale, geometry.scale);
  context.drawImage(image, -(image.naturalWidth || image.width) / 2, -(image.naturalHeight || image.height) / 2);
  context.restore();
}
function pointer(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
}
function freshState() {
  return { rotation: 0, zoom: 1, panX: 0, panY: 0 };
}
function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}
function escapeAttribute(value) {
  return escapeHtml(value);
}

// src/main.js
var root = document.querySelector("#app");
var STARTUP_DIAGNOSTIC_KEY = "toyRotation.startupDiagnostic";
var earlyStartup = window.__TOY_ROTATION_EARLY_STARTUP__;
earlyStartup?.mark("main_loaded");
earlyStartup?.mark("module_bootstrap_started");
function recordStartupPhase(phase, details = null) {
  try {
    localStorage.setItem(STARTUP_DIAGNOSTIC_KEY, JSON.stringify({ phase, details, at: (/* @__PURE__ */ new Date()).toISOString(), release: window.TOY_ROTATION_CONFIG?.RELEASE || null }));
  } catch {
  }
}
recordStartupPhase("shell");
var startupTrace = beginStartupTrace(window);
var standaloneMode = window.matchMedia?.("(display-mode: standalone)")?.matches || navigator.standalone === true;
markStartupStage(startupTrace, "display_mode_detected", { standalone: standaloneMode, href: location.href });
window.addEventListener("pageshow", (event) => markStartupStage(startupTrace, "pageshow", { persisted: event.persisted === true }));
window.addEventListener("pagehide", (event) => markStartupStage(startupTrace, "pagehide", { persisted: event.persisted === true }));
document.addEventListener("visibilitychange", () => markStartupStage(startupTrace, "visibility_change", { visibility: document.visibilityState }));
markStartupStage(startupTrace, "main_js_loaded");
earlyStartup?.mark("bootstrap_started");
markStartupStage(startupTrace, "image_asset_manifest_loaded");
renderStartupShell(root, navigator.language);
markStartupStage(startupTrace, "app_shell_rendered");
var startupWatchdog = installStartupWatchdog(root, startupTrace, { delayMs: 6e3 });
markStartupStage(startupTrace, "store_hydration_start");
earlyStartup?.mark("persistence_probe_started");
recordStartupPhase("persistent-read-start");
var store;
try {
  store = bootStore({ onStage: (stage, details) => {
    markStartupStage(startupTrace, stage, details);
    if (stage === "migrations_start") earlyStartup?.mark("migration_started");
    if (stage === "migrations_end") earlyStartup?.mark("migration_finished");
  } });
} catch (error) {
  markStartupError(startupTrace, "store_boot_unhandled_failure", error);
  store = bootStore({ diagnosticMode: true, onStage: (stage, details) => markStartupStage(startupTrace, stage, details) });
}
markStartupStage(startupTrace, "store_hydration_end");
earlyStartup?.mark("persistence_probe_finished", { status: store.persistence.status });
recordStartupPhase("persistent-read-complete", { status: store.persistence.status });
var shelfProbe = structuredClone(store.state);
var shelfRepair = normalizeCurrentShelf(shelfProbe);
if (shelfRepair.changed && store.canPersist) store.update((state) => {
  normalizeCurrentShelf(state);
}, "current-shelf-active-normalization");
var diagnosticLifecycle = [diagnosticLifecycleSnapshot(store.state, "bootstrap_after_migration", "bootStore")];
store.subscribe((state, reason2) => {
  diagnosticLifecycle.push(diagnosticLifecycleSnapshot(state, "store_update", reason2));
  if (diagnosticLifecycle.length > 100) diagnosticLifecycle.shift();
});
var catalog = new CatalogRepository(store, { baseUrl: window.TOY_ROTATION_CONFIG?.API_BASE });
var images = new ImageRepository();
var runtimeImageDiagnostics = new RuntimeImageDiagnostics({ release: window.TOY_ROTATION_CONFIG?.RELEASE });
var recognitionDeviceDiagnostic = new RecognitionDeviceDiagnostic({ build: window.TOY_ROTATION_CONFIG });
store.attachDiagnostic(recognitionDeviceDiagnostic);
runtimeImageDiagnostics.installCatalogLookupProbe(catalog);
var i18n = createI18n(store);
var substitution = new SubstitutionEngine();
var admin = new AdminService({ store, catalog });
var adminCatalogSaveDiagnostic = new AdminCatalogSaveDiagnostic();
var governance = new SharedCatalogGovernance({ store, catalog, images, baseUrl: window.TOY_ROTATION_CONFIG?.API_BASE, diagnostic: recognitionDeviceDiagnostic });
var recognition = null;
var getRecognition = () => recognition ||= new RecognitionService({ store, images, catalog, governance, diagnostic: recognitionDeviceDiagnostic });
var modalManager = new ModalManager();
var view = "home";
var onboardingQueued = false;
var libraryFilters = { query: "", brand: "", categoryCode: "", skillCode: "", playMechanic: "", status: "", ageFit: "" };
var wishlistFilters = { query: "", brand: "", categoryCode: "", skillCode: "", playMechanic: "", priority: "", status: "", ageFit: "", sort: "priority" };
var systemTheme = matchMedia("(prefers-color-scheme: dark)");
store.subscribe((state, reason2) => {
  if (reason2 !== "development-feedback") render();
});
systemTheme.addEventListener?.("change", () => {
  if (store.state.settings.theme === "system") applyTheme();
});
markStartupStage(startupTrace, "ai_service_deferred", { activation: "user_action" });
markStartupStage(startupTrace, "home_render_start");
earlyStartup?.mark("first_render_started");
recordStartupPhase("render-start");
captureLoveveryImageSweep("pre_catalog_hydrate");
render();
recordStartupPhase("render-complete");
earlyStartup?.complete();
installSingleLineEnterCompletion(document);
setupScrollTop();
requestAnimationFrame(() => {
  markStartupStage(startupTrace, "first_meaningful_paint");
  markStartupStage(startupTrace, "home_interactive");
  completeStartupWatchdog(startupWatchdog);
  scheduleBackgroundBootstrap();
  registerServiceWorker();
});
function scheduleBackgroundBootstrap() {
  setTimeout(() => {
    void bootstrapBackground();
  }, 0);
}
async function bootstrapBackground() {
  try {
    markStartupStage(startupTrace, "catalog_local_load_start");
    recordStartupPhase("hydrate-start");
    runtimeImageDiagnostics.mark("catalog_hydration_start", { activeCatalogCount: catalog.active.length });
    await catalog.hydrate({ onStage: (stage, details) => {
      markStartupStage(startupTrace, stage, details);
      runtimeImageDiagnostics.mark(stage, details);
    } });
    if (store.canPersist && Object.keys(store.state.crossAgeApprovals || {}).some((key) => {
      const row = catalog.getByKey(key);
      return row && row.canonicalKey !== key;
    }))
      store.update((state) => reconcileCrossAgeApprovals(state, (key) => catalog.getByKey(key)), "cross-age-approval-canonical-reconcile");
    diagnosticLifecycle.push(diagnosticLifecycleSnapshot(store.state, "hydration_complete", "catalog.hydrate"));
    markStartupStage(startupTrace, "catalog_local_load_end");
    recordStartupPhase("hydrate-complete");
    runtimeImageDiagnostics.mark("catalog_hydration_complete", { activeCatalogCount: catalog.active.length });
    captureLoveveryImageSweep("post_catalog_hydrate");
    render();
    if (!store.canPersist) {
      markStartupStage(startupTrace, "persistence_diagnostic_read_only");
      return;
    }
    await governance.migrateLegacyReports();
    void governance.syncInBackground().then(() => governance.flushOutbox());
    markStartupStage(startupTrace, "indexeddb_open_start");
    await recoverLegacyPersonalImages({ store, images, catalog });
    markStartupStage(startupTrace, "indexeddb_open_end");
    diagnosticLifecycle.push(diagnosticLifecycleSnapshot(store.state, "personal_image_migration_complete", "recoverLegacyPersonalImages"));
    markStartupStage(startupTrace, "fake_personal_placeholder_repair_start");
    const repairedState = structuredClone(store.state);
    const fakePersonalRepair = await repairFakePersonalPlaceholderBindings(repairedState, { images, catalog });
    if (fakePersonalRepair.changed || !store.state.catalogState?.syncMetadata?.fakePersonalPlaceholderRepairV121) store.replace(repairedState, "fake-personal-placeholder-repair");
    markStartupStage(startupTrace, "fake_personal_placeholder_repair_end", { changed: fakePersonalRepair.changed });
    diagnosticLifecycle.push(diagnosticLifecycleSnapshot(store.state, "fake_personal_placeholder_repair_complete", "generatedCatalogFallback-v1"));
    markStartupStage(startupTrace, "personal_image_audit_start");
    await auditToyLibraryImages({ store, images, catalog });
    markStartupStage(startupTrace, "personal_image_audit_end");
    markStartupStage(startupTrace, "catalog_image_manifest_ready", { audit: "metadata_only_on_startup" });
    diagnosticLifecycle.push(diagnosticLifecycleSnapshot(store.state, "bootstrap_complete", "background_local_work_complete"));
  } catch (error) {
    markStartupError(startupTrace, "background_bootstrap_failed", error);
  }
}
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  markStartupStage(startupTrace, "service_worker_registration_start");
  navigator.serviceWorker.register("./sw.js").then((registration) => {
    markStartupStage(startupTrace, "service_worker_registration_end");
    return registration.ready;
  }).then(() => markStartupStage(startupTrace, "service_worker_ready")).catch((error) => markStartupError(startupTrace, "service_worker_failed", error));
}
function render() {
  runtimeImageDiagnostics.mark("render_start", { view, activeCatalogCount: catalog.active.length });
  applyTheme();
  document.documentElement.lang = i18n.language;
  document.title = t("appName");
  root.innerHTML = `
    <header><img src="./icons/header-logo.png" alt=""><div><h1>${t("appName")}</h1><p>${t(view)}</p><small class="build-marker">${escape(buildIdentityLabel())}</small></div><button data-action="settings" aria-label="${t("settings")}">\u2699</button></header>
    <nav>${navButton("home", "home")}${navButton("library", "library")}${navButton("rotation", "rotation")}${navButton("wishlist", "wishlist")}</nav>
    <main>${renderPersistenceWarning()}${renderView()}</main>`;
  renderChallengeEntry();
  root.querySelectorAll("[data-view]").forEach((button) => {
    button.onclick = () => {
      view = button.dataset.view;
      render();
    };
  });
  root.querySelectorAll("[data-action]").forEach((button) => {
    button.onclick = () => action(button.dataset.action, button.dataset);
  });
  renderChallengeBadges();
  root.querySelectorAll("[data-draft-edit]").forEach((button) => {
    button.onclick = () => openRecognitionReview(button.dataset.draftEdit);
  });
  root.querySelectorAll("[data-draft-confirm]").forEach((button) => {
    button.onclick = async () => {
      const buttons = [...root.querySelectorAll(`[data-draft-confirm="${button.dataset.draftConfirm}"]`)];
      buttons.forEach((control) => control.disabled = true);
      try {
        const result2 = await getRecognition().confirm(button.dataset.draftConfirm, { destination: button.dataset.destination || "library" });
        if (result2) render();
      } finally {
        buttons.forEach((control) => control.disabled = false);
      }
    };
  });
  root.querySelectorAll("[data-draft-image-consent]").forEach((input) => {
    input.onchange = () => store.update((state) => {
      const draft = state.drafts.find((item) => item.id === input.dataset.draftImageConsent);
      if (draft) draft.imageConsent = input.checked;
    }, "candidate-image-consent");
  });
  root.querySelectorAll("[data-draft-retry]").forEach((button) => {
    button.onclick = () => getRecognition().analyze(button.dataset.draftRetry, { force: true });
  });
  root.querySelectorAll("[data-draft-remove]").forEach((button) => {
    button.onclick = () => getRecognition().remove(button.dataset.draftRemove);
  });
  root.querySelectorAll("[data-draft-view]").forEach((button) => {
    button.onclick = () => {
      view = "library";
      render();
      document.querySelector(`[data-toy-id="${button.dataset.draftView}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
  });
  root.querySelectorAll("[data-draft-duplicate-same]").forEach((button) => {
    button.onclick = () => getRecognition().resolveDuplicateReview(button.dataset.draftDuplicateSame, "same");
  });
  root.querySelectorAll("[data-draft-duplicate-not-same]").forEach((button) => {
    button.onclick = () => getRecognition().resolveDuplicateReview(button.dataset.draftDuplicateNotSame, "not_same");
  });
  bindImages();
  prepareSingleLineInputs(root);
  wireLibraryFilters();
  wireWishlistFilters();
  queueOnboarding();
  runtimeImageDiagnostics.mark("render_complete", { view, activeCatalogCount: catalog.active.length, runtimeToyImageCount: root.querySelectorAll("img[data-runtime-image-toy-id]").length });
}
function navButton(id, label) {
  return `<button class="${view === id ? "active" : ""}" data-view="${id}">${t(label)}</button>`;
}
function renderView() {
  return { home: renderHome, library: renderLibrary, rotation: renderRotation, wishlist: renderWishlist }[view]();
}
function renderEmpty() {
  return `<div class="panel"><p>${t("noData")}</p></div>`;
}
function renderPersistenceWarning() {
  const diagnosticMode = window.TOY_ROTATION_CONFIG?.PERSISTENCE_DIAGNOSTIC_MODE === true;
  if (store.canPersist && !diagnosticMode) return "";
  const classification = store.persistence.diagnostic?.classification;
  const classificationLabel = classification ? `<p><b>${t("persistenceClassification")}:</b> ${escape(classification.code)} \xB7 ${escape(classification.label)}</p>` : "";
  const staged = store.persistence.status === "diagnostic_staged_recovery";
  const recover = staged ? `<button class="primary" data-action="persistence-recovery">${t("applyDetectedRecovery")}</button>` : "";
  const quotaRetry = classification === "Q" ? `<button class="primary" data-action="persistence-quota-retry">${t("retrySafeStorageRecovery")}</button>` : "";
  const fresh = store.canPersist ? "" : `<button class="danger" data-action="persistence-start-fresh">${t("startFresh")}</button>`;
  const detailKey = diagnosticMode ? "persistenceDiagnosticModeDetail" : classification === "Q" ? "persistenceQuotaRecoveryDetail" : "persistenceRecoveryDetail";
  const titleKey = classification === "Q" ? "persistenceQuotaRecoveryTitle" : "persistenceRecoveryTitle";
  return `<section class="panel danger"><h2>${t(titleKey)}</h2><p>${t(detailKey)}</p>${classificationLabel}<div class="actions"><button data-action="persistence-diagnostic">${t("exportPersistenceDiagnostic")}</button>${recover}${quotaRetry}${fresh}</div></section>`;
}
function renderHome() {
  const toys = store.state.toys;
  const shelf = currentShelfCollections(store.state);
  const age = childAgeMonths2();
  const reassessment = reassessmentState({ lastRotationAt: store.state.lastRotationAt, rotationHistory: store.state.rotationHistory, rotationDays: store.state.settings.rotationDays });
  const childLabel = store.state.profile.childName || t("childProfile");
  return `<section class="panel"><h2>${t("home")}</h2><div class="stats"><div><small>${t("library")}</small><b>${toys.length}</b></div><div><small>${t("onShelf")}</small><b>${shelf.totalShelfCount}</b></div><div><small>${t("currentAge")}</small><b>${age == null ? "\u2014" : `${age} ${t("monthUnit")}`}</b></div></div><section class="summary"><b>${escape(childLabel)}</b><p>${age == null ? t("setBirthDateHint") : t("ageSummary", { count: age })}</p><button data-action="settings">${t("editProfile")}</button></section><section class="summary"><b>${reassessment.due ? t("reassessmentDue") : t("reassessmentCountdown", { count: reassessment.daysRemaining })}</b><p>${t("rotationIntervalSummary", { count: reassessment.days })} \xB7 ${t("targetShelfSummary", { count: store.state.settings.rotationSize })}</p><div class="home-actions"><button data-action="generate" class="primary">${t("generateThisRotation")}</button><button class="secondary" data-action="catalog">${t("standardCatalog")}</button></div></section></section>`;
}
function renderLibrary() {
  const toys = store.state.toys;
  return `<section class="head"><h2>${t("library")}</h2><span><button data-action="recognize">${t("recognizeToy")}</button><button class="primary" data-action="add">+ ${t("addToy")}</button></span></section>${renderDrafts()}${renderCompactFilterBar({ id: "library", searchLabel: t("searchLibrary"), placeholder: t("searchLibraryPlaceholder"), filters: libraryFilters, includeSort: false, includeDuplicates: true })}<p id="library-search-empty" class="hidden">${t("noSearchResults")}</p><section class="list" id="library-list">${toys.length ? toys.map(renderToyCard).join("") : renderEmpty()}</section>`;
}
function renderDrafts() {
  const drafts = (store.state.drafts || []).filter((draft) => !["completed", "submitting"].includes(draft.status));
  if (!drafts.length) return "";
  return `<section class="panel"><h3>${t("pendingReview")} (${drafts.length})</h3>${drafts.map(renderDraft).join("")}</section>`;
}
function renderDraft(draft) {
  const statusKey = `recognition${capitalize(draft.status)}`;
  const owned = draft.ownedToyId && store.state.toys.find((toy) => toy.id === draft.ownedToyId);
  const duplicate = draft.duplicateCandidates?.[0];
  const actions = String(draft.status).startsWith("ready") ? `${draft.status === "ready_catalog_unmatched" ? `<label class="choice"><input type="checkbox" data-draft-image-consent="${draft.id}" ${draft.imageConsent ? "checked" : ""}>${t("imageReviewConsent")}</label>` : ""}<button data-draft-edit="${draft.id}">${t("recognitionReview")}</button><button data-draft-confirm="${draft.id}" data-destination="library" class="primary">${t("addToToyLibrary")}</button><button data-draft-confirm="${draft.id}" data-destination="wishlist" class="primary">${t("addToWishlist")}</button>` : draft.status === "already_owned" && owned ? `<div class="recognition-owned"><img data-image='${escapedJson(libraryImageRef(owned))}' alt=""><span>${escape(brandLabel(owned.brand))} \xB7 ${escape(displayName(owned))}</span></div><button data-draft-view="${owned.id}">${t("viewExistingToy")}</button>` : draft.status === "duplicate_review_required" ? `<p>${t("recognitionPossibleDuplicate", { name: duplicate?.productName || t("pendingReview") })}</p><button data-draft-duplicate-same="${draft.id}">${t("recognitionSameToy")}</button><button data-draft-duplicate-not-same="${draft.id}" class="primary">${t("recognitionNotSameToy")}</button>` : "";
  return `<div class="draft"><img data-image='${escapedJson(draft.imageRef)}' alt=""><div><b>${escape(draft.productName || t("pendingReview"))}</b><small>${t(statusKey)}${draft.error ? ` \xB7 ${escape(messageFor(draft.error))}` : ""}</small>${actions}${draft.status === "error" ? `<button data-draft-retry="${draft.id}">${t("retryRecognition")}</button>` : ""}<button data-draft-remove="${draft.id}">${t("remove")}</button></div></div>`;
}
function renderToyCard(toy, { showDevelopment = false } = {}) {
  const ageUnit = t("monthUnit");
  const customPermanent = isUserCustomPermanent(toy);
  const paused = isRotationPaused(toy);
  const shelf = currentShelfCollections(store.state);
  const manuallyOnShelf = shelf.manualIds.includes(toy.id);
  const onShelf = customPermanent || manuallyOnShelf || shelf.rotationIds.includes(toy.id);
  const permanentControl = toy.set?.kind === "parent" || paused ? "" : `<button data-action="toggle-permanent" data-id="${toy.id}">${t(customPermanent ? "removeFromPermanent" : "keepOnShelf")}</button>`;
  const manualControl = toy.set?.kind === "parent" || customPermanent || paused ? "" : `<button data-action="manual-shelf" data-mode="${onShelf ? "stored" : "on_shelf"}" data-id="${toy.id}">${t(onShelf ? "storeAway" : "putOnShelf")}</button>`;
  const pauseControl = toy.set?.kind === "parent" ? "" : `<button data-action="toggle-pause" data-id="${toy.id}">${t(paused ? "resumeRotation" : "pauseRotation")}</button>`;
  const runtimeImageRef = libraryImageRef(toy, "toy_library_card_render");
  const development = showDevelopment ? renderDevelopmentFeedback(toy) : "";
  return `<article class="card" data-toy-id="${escape(toy.id)}" data-library-search="${escape(librarySearchText(toy))}" data-brand="${escape(toy.brand)}" data-category="${toy.categoryCode}" data-skills="${escape((toy.skillCodes || []).join("|"))}" data-mechanics="${escape((toy.playMechanics || []).join("|"))}" data-status="${toy.archived ? "archived" : toy.hidden ? "hidden" : paused ? "paused" : customPermanent ? "permanent" : onShelf ? "active" : "stored"}" data-age-fit="${toyAgeFit(toy)}"><img data-runtime-image-toy-id="${escape(toy.id)}" data-image='${escapedJson(runtimeImageRef)}' alt=""><div><h3>${escape(displayName(toy))}${customPermanent ? ` <span class="permanent-chip">${t("permanentBadge")}</span>` : ""}</h3><p>${escape(brandLabel(toy.brand))} \xB7 ${t(`category.${toy.categoryCode}`)}</p><div class="chips">${toy.skillCodes.map((code) => `<span>${t(`skill.${code}`)}</span>`).join("")}</div><p>${toy.minAgeMonths ?? "?"}\u2013${toy.maxAgeMonths ?? "?"} ${ageUnit} \xB7 ${t(paused ? "paused" : customPermanent ? "customPermanent" : onShelf ? "onShelf" : "stored")}</p>${development}<div class="actions"><button data-action="interest" data-id="${toy.id}" data-value="like" class="${toy.interest === "like" ? "selected" : ""}">${t("liked")}</button><button data-action="interest" data-id="${toy.id}" data-value="neutral" class="${toy.interest === "neutral" ? "selected" : ""}">${t("neutral")}</button><button data-action="interest" data-id="${toy.id}" data-value="dislike" class="${toy.interest === "dislike" ? "selected" : ""}">${t("disliked")}</button>${manualControl}${permanentControl}${pauseControl}<button data-action="edit" data-id="${toy.id}">${t("edit")}</button><button data-action="remove-toy" data-id="${toy.id}" class="danger">${t("remove")}</button></div></div></article>`;
}
function currentChallengeRows() {
  return parentApprovableChallenges(store.state, catalog, childAgeMonths2(), store.state.profile?.developmentProfile || {});
}
function renderChallengeBadges() {
  if (view !== "library") return;
  const byId = new Map(currentChallengeRows().map((row) => [row.toy.id, row]));
  root.querySelectorAll("#library-list [data-toy-id]").forEach((card) => {
    const row = byId.get(card.dataset.toyId);
    if (!row) return;
    const badge = document.createElement("span");
    badge.className = "challenge-chip";
    badge.dataset.challengeChoice = row.choice;
    badge.textContent = t(row.choice === "allowed" ? "challengeBadgeAllowed" : "challengeBadgeAvailable");
    card.querySelector("h3")?.append(" ", badge);
  });
}
function renderDevelopmentFeedback(toy) {
  const cycle = store.state.rotationHistory?.[0]?.id || null;
  const feedback = (store.state.developmentFeedbackHistory || []).find((item) => item.id === `${toy.id}:${cycle || "current"}`);
  const rotation = currentShelfCollections(store.state).rotation;
  const diversityPreferred = developmentMechanics(toy).some((mechanic) => rotation.filter((item) => developmentMechanics(item).includes(mechanic)).length === 1);
  const reason2 = recommendationReason(toy, { profile: store.state.profile?.developmentProfile || {}, history: store.state.developmentFeedbackHistory || [], recentIds: (store.state.rotationHistory || []).slice(1, 4).flatMap((item) => item.toyIds || []), diversityPreferred });
  const feedbackText = feedback ? t(`developmentFeedback.${feedback.interestFeedback || feedback.difficultyFeedback}`) : t("developmentFeedbackPrompt");
  return `<section class="development-feedback"><p class="development-reason">${t(reason2.key)}</p><button data-action="development-feedback" data-id="${toy.id}">${escape(feedbackText)}</button></section>`;
}
function refreshDevelopmentFeedbackCard(id) {
  const card = [...root.querySelectorAll("[data-toy-id]")].find((item) => item.dataset.toyId === id);
  const toy = store.state.toys.find((item) => item.id === id);
  const previous = card?.querySelector(".development-feedback");
  if (!card || !toy || !previous) return;
  previous.outerHTML = renderDevelopmentFeedback(toy);
  const button = card.querySelector('[data-action="development-feedback"]');
  if (button) button.onclick = () => action(button.dataset.action, button.dataset);
}
function librarySearchText(toy) {
  return [toy.productName, toy.names?.en, toy.names?.zh, toy.brand, ...toy.aliases || [], toy.categoryCode, t(`category.${toy.categoryCode}`), ...toy.skillCodes || [], ...(toy.skillCodes || []).map((code) => t(`skill.${code}`)), ...toy.playMechanics || [], ...(toy.playMechanics || []).map(mechanicLabel)].filter(Boolean).join(" ").normalize("NFKC").toLowerCase();
}
function wireLibraryFilters() {
  const input = root.querySelector("#library-search");
  if (!input) return;
  const filter = () => {
    libraryFilters.query = input.value;
    const query = libraryFilters.query.normalize("NFKC").trim().toLowerCase();
    let visible = 0;
    root.querySelectorAll("[data-library-search]").forEach((card) => {
      const show = (!query || card.dataset.librarySearch.includes(query)) && (!libraryFilters.brand || card.dataset.brand === libraryFilters.brand) && (!libraryFilters.categoryCode || card.dataset.category === libraryFilters.categoryCode) && (!libraryFilters.skillCode || card.dataset.skills.split("|").includes(libraryFilters.skillCode)) && (!libraryFilters.playMechanic || card.dataset.mechanics.split("|").includes(libraryFilters.playMechanic)) && (!libraryFilters.status || card.dataset.status === libraryFilters.status) && (!libraryFilters.ageFit || card.dataset.ageFit === libraryFilters.ageFit);
      card.classList.toggle("hidden", !show);
      if (show) visible++;
    });
    root.querySelector("#library-search-empty")?.classList.toggle("hidden", visible > 0);
  };
  input.oninput = filter;
  filter();
}
function filterOption(value, label, selected) {
  return `<option value="${escape(value)}" ${value === selected ? "selected" : ""}>${escape(label)}</option>`;
}
function toyAgeFit(toy) {
  const age = childAgeMonths2();
  if (age == null || toy.minAgeMonths == null || toy.maxAgeMonths == null) return "unknown";
  return age < toy.minAgeMonths ? "tooYoung" : age > toy.maxAgeMonths ? "outgrown" : "appropriate";
}
function renderCompactFilterBar({ id, searchLabel, placeholder, filters, includeSort = false, includeDuplicates = false }) {
  const active = compactFilterSummary(filters, includeSort);
  return `<section class="panel compact-filter-bar"><label class="library-search"><span>${escape(searchLabel)}</span><input id="${id}-search" type="search" enterkeyhint="search" value="${escape(filters.query)}" placeholder="${escape(placeholder)}"></label><div class="compact-filter-actions"><button data-action="open-${id}-filters">${t("filters")}</button>${includeSort ? `<button data-action="open-${id}-sort">${t("sort")}</button>` : ""}${includeDuplicates ? `<button data-action="library-duplicates">${t("findDuplicates")}</button>` : ""}</div>${active ? `<p class="active-filter-summary">${escape(active)} <button data-action="clear-${id}-filters">${t("clearFilters")}</button></p>` : ""}</section>`;
}
function compactFilterSummary(filters, includeSort) {
  const values = [];
  if (filters.brand) values.push(brandLabel(filters.brand));
  if (filters.categoryCode) values.push(t(`category.${filters.categoryCode}`));
  if (filters.skillCode) values.push(t(`skill.${filters.skillCode}`));
  if (filters.playMechanic) values.push(mechanicLabel(filters.playMechanic));
  if (filters.status) values.push(t(filters.status === "want" || filters.status === "purchased" || filters.status === "dismissed" ? `wishlistStatus.${filters.status}` : `filterStatus.${filters.status}`));
  if (filters.ageFit) values.push(t(`ageFit.${filters.ageFit}`));
  if (filters.priority) values.push(t(filters.priority));
  if (includeSort && filters.sort && filters.sort !== "priority") values.push(t(`wishlistSort.${filters.sort}`).replace(/^.*?:\s*/, ""));
  return values.length > 3 ? `${values.slice(0, 3).join(" \xB7 ")} \xB7 +${values.length - 3}` : values.join(" \xB7 ");
}
function filterSheet({ id, filters, brands, mechanics, includeWishlist = false, sortOnly = false }) {
  const controls = sortOnly ? `<label>${t("sort")}<select name="sort"><option value="priority">${t("wishlistSort.priority")}</option><option value="ageFit">${t("wishlistSort.ageFit")}</option><option value="addedAt">${t("wishlistSort.addedAt")}</option><option value="brand">${t("wishlistSort.brand")}</option></select></label>` : `<div class="compact-filter-fields"><label>${t("brand")}<select name="brand"><option value="">${t("allBrands")}</option>${brands.map((value) => filterOption(value, brandLabel(value), filters.brand)).join("")}</select></label><label>${t("allCategories")}<select name="categoryCode"><option value="">${t("allCategories")}</option>${CATEGORY_CODES.map((value) => filterOption(value, t(`category.${value}`), filters.categoryCode)).join("")}</select></label><label>${t("skills")}<select name="skillCode"><option value="">${t("allSkills")}</option>${SKILL_CODES.map((value) => filterOption(value, t(`skill.${value}`), filters.skillCode)).join("")}</select></label><label>${t("playMechanics")}<select name="playMechanic"><option value="">${t("allMechanics")}</option>${mechanics.map((value) => filterOption(value, mechanicLabel(value), filters.playMechanic)).join("")}</select></label>${includeWishlist ? `<label>${t("purchasePriority")}<select name="priority"><option value="">${t("allPriorities")}</option>${["high", "medium", "low"].map((value) => filterOption(value, t(value), filters.priority)).join("")}</select></label><label>${t("wishlistStatusLabel")}<select name="status"><option value="">${t("allWishlistStatuses")}</option>${["want", "purchased", "dismissed"].map((value) => filterOption(value, t(`wishlistStatus.${value}`), filters.status)).join("")}</select></label>` : `<label>${t("allStatuses")}<select name="status"><option value="">${t("allStatuses")}</option>${["active", "stored", "permanent", "paused", "hidden", "archived"].map((value) => filterOption(value, t(`filterStatus.${value}`), filters.status)).join("")}</select></label>`}<label>${t("allAgeFits")}<select name="ageFit"><option value="">${t("allAgeFits")}</option>${["appropriate", "tooYoung", "outgrown", "unknown"].map((value) => filterOption(value, t(`ageFit.${value}`), filters.ageFit)).join("")}</select></label></div>`;
  const dialog = openModal(`<form class="form compact-filter-sheet"><header><h2>${sortOnly ? t("sort") : t("filters")}</h2><button type="button" data-close>\xD7</button></header>${controls}<div class="filter-actions"><button type="button" data-clear>${t("clearFilters")}</button><button class="primary">${t("applyFilters")}</button></div></form>`);
  const form = dialog.querySelector("form");
  if (sortOnly) form.sort.value = filters.sort || "priority";
  form.querySelector("[data-clear]")?.addEventListener("click", () => {
    for (const key of Object.keys(filters)) if (key !== "query" && (!sortOnly || key === "sort")) filters[key] = key === "sort" ? "priority" : "";
    dialog.close();
    render();
  });
  form.onsubmit = (event) => {
    event.preventDefault();
    const values = new FormData(form);
    if (sortOnly) filters.sort = values.get("sort");
    else for (const key of ["brand", "categoryCode", "skillCode", "playMechanic", "priority", "status", "ageFit"]) if (key in filters) filters[key] = values.get(key) || "";
    dialog.close();
    render();
  };
}
function openLibraryFilters() {
  const toys = store.state.toys;
  filterSheet({ id: "library", filters: libraryFilters, brands: [...new Set(toys.map((toy) => toy.brand))].sort((a, b) => brandLabel(a).localeCompare(brandLabel(b))), mechanics: [...new Set(toys.flatMap((toy) => toy.playMechanics || []))].sort((a, b) => mechanicLabel(a).localeCompare(mechanicLabel(b))) });
}
function openWishlistFilters({ sortOnly = false } = {}) {
  const entries2 = store.state.wishlist.map((item) => catalog.resolve(item) || item.catalogSnapshot).filter(Boolean);
  filterSheet({ id: "wishlist", filters: wishlistFilters, brands: [...new Set(entries2.map((toy) => toy.brand))].sort((a, b) => brandLabel(a).localeCompare(brandLabel(b))), mechanics: [...new Set(entries2.flatMap((toy) => toy.playMechanics || []))].sort((a, b) => mechanicLabel(a).localeCompare(mechanicLabel(b))), includeWishlist: true, sortOnly });
}
function renderRotation() {
  const shelf = currentShelfCollections(store.state);
  const pausedCount = (store.state.toys || []).filter(isRotationPaused).length;
  const collapsed = store.state.settings?.permanentSectionCollapsed === true;
  const latest2 = store.state.rotationHistory?.[0]?.rotationDiagnostics;
  const shortage = latest2?.shortageCount ? `<p class="panel">${t("rotationShortage", { selected: latest2.selectedRotationCount ?? latest2.selectedCount, requested: latest2.requestedRotationCount ?? latest2.requestedCount })}</p>` : "";
  const manual = shelf.manual.length ? `<section class="rotation-section"><h3>${t("manuallyOnShelf")} \xB7 ${shelf.manual.length}</h3><div class="list">${shelf.manual.map(renderToyCard).join("")}</div></section>` : "";
  return `<section class="head"><h2>${t("rotation")}</h2><button class="primary" data-action="generate">${t("generate")}</button></section><section class="panel shelf-total"><b>${t("currentShelfTotal", { count: shelf.totalShelfCount })}</b><p>${t("thisRotation")} ${shelf.rotation.length} \xB7 ${t("customPermanent")} ${shelf.permanent.length} \xB7 ${t("paused")} ${pausedCount}</p><p>${t("permanentTargetHint")}</p></section>${shortage}<section class="rotation-section"><h3>${t("customPermanent")} \xB7 ${shelf.permanent.length} <button data-action="toggle-permanent-collapse" aria-expanded="${!collapsed}">${collapsed ? "\u25B8" : "\u25BE"}</button></h3>${collapsed ? "" : `<div class="list">${shelf.permanent.length ? shelf.permanent.map(renderToyCard).join("") : `<p class="panel">${t("noCustomPermanent")}</p>`}</div>`}</section>${manual}<section class="rotation-section"><h3>${t("thisRotation")} \xB7 ${shelf.rotation.length}</h3><div class="list">${shelf.rotation.length ? shelf.rotation.map((toy) => renderToyCard(toy, { showDevelopment: true })).join("") : renderEmpty()}</div></section>`;
}
function renderChallengeEntry() {
  if (view !== "rotation") return;
  const rows = currentChallengeRows();
  if (!rows.length) return;
  const approved = rows.filter((row) => row.choice === "allowed").length;
  const entry = document.createElement("section");
  entry.className = "panel challenge-entry";
  entry.innerHTML = `<div><h3>${t("challengeEntryTitle")}</h3><p>${t("challengeEntrySummary", { count: rows.length, pending: rows.filter((row) => row.choice === "pending").length, approved })}</p></div><button type="button" data-action="challenge-settings">${t("challengeOpenSettings")}</button>`;
  root.querySelector(".shelf-total")?.before(entry);
}
function renderWishlist() {
  const age = childAgeMonths2();
  const unresolved = [];
  const entries2 = store.state.wishlist.map((item) => {
    const candidate = catalog.resolve(item) || item.catalogSnapshot;
    if (!candidate?.productName && !candidate?.names?.en && !candidate?.names?.zh) {
      unresolved.push(item);
      return null;
    }
    const result2 = substitution.result(candidate, store.state.toys, store.revision, { childAgeMonths: age });
    return { item, candidate, result: result2 };
  }).filter(Boolean);
  const filtered = entries2.filter((entry) => wishlistMatches(entry)).sort(compareWishlistEntries);
  const rows = filtered.map(({ item, candidate, result: result2 }) => {
    const high = result2.relationships.filter((row) => row.level === "exact_duplicate" || row.level === "high_substitution");
    const medium = result2.relationships.filter((row) => row.level === "medium_substitution");
    const visible = result2.relationships.slice(0, 3);
    const ageRange = candidate.minAgeMonths == null && candidate.maxAgeMonths == null ? "" : `<p>${candidate.minAgeMonths ?? "?"}\u2013${candidate.maxAgeMonths ?? "?"} ${t("monthUnit")} \xB7 ${t(`category.${candidate.categoryCode || "uncategorized"}`)}</p>`;
    const realSummary = high.length ? `<p class="overlap-summary"><b>${t("realHighOverlap", { count: high.length })}</b>${medium.length ? ` \xB7 ${t("partialPlaySimilarity", { count: medium.length })}` : ""}</p>` : medium.length ? `<p class="overlap-summary"><b>${t("partialPlaySimilarity", { count: medium.length })}</b></p>` : `<p class="overlap-summary">${t("noPurchaseImpactOverlap")}</p>`;
    const skillVisible = result2.skillRelationships.slice(0, 3);
    const skillOnly = result2.skillRelationships.length ? `<details class="skill-only"><summary>${t("skillOnlyDisclosure", { count: result2.skillRelationships.length })}</summary><p>${t("skillOnlyExplanation")}</p><div class="overlap-list">${skillVisible.map(renderOverlap).join("")}</div>${result2.skillRelationships.length > skillVisible.length ? `<button data-action="all-skill-overlaps" data-id="${item.id}">${t("viewAll", { count: result2.skillRelationships.length })}</button>` : ""}</details>` : "";
    return `<article class="panel wishlist-card"><div class="wishlist-title"><img data-image='${escapedJson(candidate.imageRef || { kind: "placeholder" })}' alt=""><div><h3>${escape(displayName(candidate))}</h3><p>${escape(brandLabel(candidate.brand))}</p>${ageRange}</div><span class="status-chip">${t(`wishlistStatus.${item.status || "want"}`)}</span></div><section class="priority-summary"><b>${t("purchasePriority")}</b><span class="priority-${item.priority || result2.purchaseImpact.priority}">${t(item.priority || result2.purchaseImpact.priority)}</span></section>${item.notes ? `<p>${escape(item.notes)}</p>` : ""}${realSummary}<div class="overlap-list"><h4>${t("realSubstitutes")}</h4>${visible.map(renderOverlap).join("") || `<p>${t("noOverlap")}</p>`}</div>${result2.relationships.length > visible.length ? `<button data-action="all-overlaps" data-id="${item.id}">${t("viewAll", { count: result2.relationships.length })}</button>` : ""}${skillOnly}<div class="actions">${item.status === "purchased" ? "" : `<button class="primary" data-action="wishlist-purchased" data-id="${item.id}">${t("purchased")}</button>`}<button class="primary" data-action="wishlist-add-library" data-id="${item.id}">${t("addToToyLibrary")}</button><button data-action="wishlist-remove" data-id="${item.id}">${t("removeFromWishlist")}</button></div></article>`;
  });
  const diagnostic = unresolved.length && admin.enabled ? `<p class="diagnostic">${t("wishlistMigrationDiagnostic", { count: unresolved.length })}</p>` : "";
  return `<section class="head"><h2>${t("wishlist")}</h2><button class="primary" data-action="add-wishlist-item">${t("addWishlistItem")}</button><button data-action="catalog">${t("standardCatalog")}</button></section>${renderCompactFilterBar({ id: "wishlist", searchLabel: t("searchWishlist"), placeholder: t("searchWishlistPlaceholder"), filters: wishlistFilters, includeSort: true })}${diagnostic}<section class="list">${rows.join("") || renderEmpty()}</section>`;
}
function wishlistMatches({ item, candidate, result: result2 }) {
  const query = wishlistFilters.query.normalize("NFKC").trim().toLowerCase();
  return (!query || wishlistSearchText(candidate).includes(query)) && (!wishlistFilters.brand || candidate.brand === wishlistFilters.brand) && (!wishlistFilters.categoryCode || candidate.categoryCode === wishlistFilters.categoryCode) && (!wishlistFilters.skillCode || candidate.skillCodes.includes(wishlistFilters.skillCode)) && (!wishlistFilters.playMechanic || candidate.playMechanics.includes(wishlistFilters.playMechanic)) && (!wishlistFilters.priority || result2.purchaseImpact.priority === wishlistFilters.priority) && (!wishlistFilters.status || item.status === wishlistFilters.status) && (!wishlistFilters.ageFit || toyAgeFit(candidate) === wishlistFilters.ageFit);
}
function wishlistSearchText(toy) {
  return librarySearchText(toy);
}
function compareWishlistEntries(a, b) {
  const priority2 = { high: 3, medium: 2, low: 1 };
  const ageFit = { appropriate: 4, unknown: 3, tooYoung: 2, outgrown: 1 };
  if (wishlistFilters.sort === "ageFit") return ageFit[toyAgeFit(b.candidate)] - ageFit[toyAgeFit(a.candidate)] || priority2[b.result.purchaseImpact.priority] - priority2[a.result.purchaseImpact.priority];
  if (wishlistFilters.sort === "addedAt") return new Date(b.item.addedAt || 0) - new Date(a.item.addedAt || 0);
  if (wishlistFilters.sort === "brand") return brandLabel(a.candidate.brand).localeCompare(brandLabel(b.candidate.brand));
  return priority2[b.result.purchaseImpact.priority] - priority2[a.result.purchaseImpact.priority] || new Date(b.item.addedAt || 0) - new Date(a.item.addedAt || 0);
}
function wireWishlistFilters() {
  const input = root.querySelector("#wishlist-search");
  if (!input) return;
  input.onchange = () => {
    wishlistFilters.query = input.value;
    render();
  };
}
function renderOverlap(row) {
  const skills = row.sharedSkillCodes?.length ? `<small>${t("sharedSkills")}: ${row.sharedSkillCodes.map((code) => t(`skill.${code}`)).join(", ")}</small>` : "";
  return `<div class="overlap"><img data-image='${escapedJson(row.toy.imageRef)}' alt=""><div><b>${escape(displayName(row.toy))}</b><small>${escape(brandLabel(row.toy.brand))} \xB7 ${t(levelKey(row.level))}</small><small>${escape(overlapReason(row))}</small>${skills}</div></div>`;
}
function levelKey(level) {
  return { exact_duplicate: "exactDuplicate", high_substitution: "highSubstitution", medium_substitution: "mediumSubstitution", skill_similarity_only: "skillSimilarityOnly" }[level] || level;
}
function overlapReason(row) {
  if (row.reasonCode.startsWith("mechanic:")) return t("overlapReasonMechanic", { value: mechanicLabel(row.reasonCode.slice(9)) });
  return t({ operation: "overlapReasonOperation", goal: "overlapReasonGoal", scene: "overlapReasonScene", skill: "overlapReasonSkill", none: "overlapReasonNone" }[row.reasonCode] || "overlapReasonNone");
}
async function action(name, data) {
  if (name === "catalog") return openCatalog();
  if (name === "open-library-filters") return openLibraryFilters();
  if (name === "open-wishlist-filters") return openWishlistFilters();
  if (name === "open-wishlist-sort") return openWishlistFilters({ sortOnly: true });
  if (name === "clear-library-filters") {
    Object.assign(libraryFilters, { query: "", brand: "", categoryCode: "", skillCode: "", playMechanic: "", status: "", ageFit: "" });
    return render();
  }
  if (name === "clear-wishlist-filters") {
    Object.assign(wishlistFilters, { query: "", brand: "", categoryCode: "", skillCode: "", playMechanic: "", priority: "", status: "", ageFit: "", sort: "priority" });
    return render();
  }
  if (name === "library-duplicates") return openLibraryDuplicateScan();
  if (name === "settings") return openSettings();
  if (name === "challenge-settings") return openChallengeSettings();
  if (name === "persistence-diagnostic") return exportPersistenceDiagnostic();
  if (name === "persistence-recovery") return applyPersistenceRecovery();
  if (name === "persistence-quota-retry") return retryQuotaStorageRecovery();
  if (name === "persistence-start-fresh") return startFresh();
  if (name === "add") return editToy();
  if (name === "recognize") return recognizeToy();
  if (name === "edit") return editToy(data.id);
  if (name === "interest") return setToyInterest(store, data.id, data.value);
  if (name === "development-feedback") return openDevelopmentFeedback(data.id);
  if (name === "remove-toy") return removeToy(data.id);
  if (name === "toggle-permanent") return togglePermanentToy(data.id);
  if (name === "manual-shelf") return setManualShelf(data.id, data.mode);
  if (name === "toggle-pause") return togglePauseToy(data.id);
  if (name === "toggle-permanent-collapse") return store.update((state) => {
    state.settings.permanentSectionCollapsed = !state.settings.permanentSectionCollapsed;
  }, "permanent-section-collapse");
  if (name === "generate") return generateNewRotation();
  if (name === "all-overlaps") return openAllOverlaps(data.id);
  if (name === "all-skill-overlaps") return openAllSkillOverlaps(data.id);
  if (name === "wishlist-purchased") return setWishlistStatus(data.id, "purchased");
  if (name === "wishlist-add-library") return addWishlistToLibrary(data.id);
  if (name === "add-wishlist-item") return openWishlistItem();
  if (name === "wishlist-remove") return removeWishlist(data.id);
}
function startFresh() {
  if (!confirm(t("confirmStartFresh"))) return;
  try {
    startFreshStore();
    location.reload();
  } catch (error) {
    alert(messageFor(error?.message || "persistenceStartFreshFailed"));
  }
}
function retryQuotaStorageRecovery() {
  try {
    persistStateWithQuotaRecovery(store.state);
    location.reload();
  } catch (error) {
    alert(messageFor(error?.name === "QuotaExceededError" ? "storageQuotaExceeded" : error?.message || "storageQuotaExceeded"));
  }
}
function togglePermanentToy(id) {
  const current = store.state.toys.find((toy) => toy.id === id);
  if (!current || current.set?.kind === "parent") return;
  const makePermanent = !isUserCustomPermanent(current);
  const age = childAgeMonths2();
  store.update((state) => {
    setCustomPermanent(state, id, makePermanent, { childAgeMonths: age });
  }, makePermanent ? "custom-permanent-set" : "custom-permanent-remove");
}
function setManualShelf(id, mode) {
  const age = childAgeMonths2();
  store.update((state) => {
    setManualShelfState(state, id, mode, { childAgeMonths: age });
  }, `manual-shelf-${mode}`);
}
function openDevelopmentFeedback(id) {
  const shelf = currentShelfCollections(store.state);
  const toy = shelf.rotation.find((item) => item.id === id);
  if (!toy) return;
  const choices = [
    ["too_easy", "difficultyFeedback"],
    ["just_right", "difficultyFeedback"],
    ["good_challenge", "difficultyFeedback"],
    ["too_hard", "difficultyFeedback"],
    ["not_interested", "interestFeedback"]
  ];
  const dialog = openModal(`<section class="sheet development-feedback-sheet"><header><h2>${t("developmentFeedbackTitle")}</h2><button data-close>\xD7</button></header><p>${t("developmentFeedbackPrompt")}</p><div class="development-feedback-options">${choices.map(([value, field]) => `<button data-feedback-value="${value}" data-feedback-field="${field}">${t(`developmentFeedback.${value}`)}</button>`).join("")}</div><p class="form-error" role="alert" aria-live="assertive"></p></section>`);
  dialog.querySelectorAll("[data-feedback-value]").forEach((button) => {
    button.onclick = () => {
      const error = dialog.querySelector(".form-error");
      try {
        const cycle = store.state.rotationHistory?.[0]?.id || null;
        store.update((state) => {
          recordDevelopmentFeedback(state, toy, { [button.dataset.feedbackField]: button.dataset.feedbackValue, rotationCycleId: cycle });
        }, "development-feedback");
        refreshDevelopmentFeedbackCard(id);
        dialog.close();
      } catch (failure) {
        error.textContent = messageFor(failure?.message || "storageQuotaExceeded");
      }
    };
  });
}
function togglePauseToy(id) {
  const toy = store.state.toys.find((item) => item.id === id);
  if (!toy) return;
  if (isRotationPaused(toy)) {
    const age = childAgeMonths2();
    return store.update((state) => {
      setRotationParticipation(state, id, "active", { childAgeMonths: age });
    }, "resume-rotation");
  }
  const reasons = ["not_interested", "too_easy", "too_hard", "seasonal", "space", "later", "other"];
  const dialog = openModal(`<form class="form"><header><h2>${t("pauseRotation")}</h2><button type="button" data-close>\xD7</button></header><label>${t("pauseReasonLabel")}<select name="reason">${reasons.map((value) => `<option value="${value}">${t(`pauseReason.${value}`)}</option>`).join("")}</select></label><label>${t("pauseReason.other")}<input name="note" maxlength="240" value="${escape(toy.pauseReason || "")}"></label><button class="primary">${t("pauseRotation")}</button></form>`);
  dialog.querySelector("form").onsubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget), age = childAgeMonths2();
    store.update((state) => {
      setRotationParticipation(state, id, "paused", { childAgeMonths: age, pauseReasonCode: form.get("reason"), pauseReason: form.get("note") });
    }, "pause-rotation");
    dialog.close();
  };
}
function setWishlistStatus(id, status) {
  store.update((state) => {
    const item = state.wishlist.find((entry) => entry.id === id);
    if (item) item.status = status;
  }, "wishlist-status");
}
function removeWishlist(id) {
  if (confirm(t("confirmRemoveWishlist"))) store.update((state) => {
    state.wishlist = state.wishlist.filter((item) => item.id !== id);
  }, "wishlist-remove");
}
function addWishlistToLibrary(id) {
  const wish = store.state.wishlist.find((item) => item.id === id);
  const source = wish && (catalog.resolve(wish) || wish.catalogSnapshot);
  if (!wish || !source) return;
  const result2 = addCatalogToy(store, source, source.imageRef);
  if (result2.added) catalog.ensureSetChildren();
  view = "library";
  render();
}
function openWishlistItem() {
  const dialog = openModal(`<form class="form"><header><h2>${t("addWishlistItem")}</h2><button type="button" data-close>\xD7</button></header><label>${t("brand")}<input name="brand"></label><label>${t("name")}<input name="productName" required></label><label>${t("allCategories")}<select name="categoryCode">${CATEGORY_CODES.map((code) => `<option value="${code}">${t(`category.${code}`)}</option>`).join("")}</select></label><label>${t("skills")}<select name="skillCodes" multiple size="6">${SKILL_CODES.map((code) => `<option value="${code}">${t(`skill.${code}`)}</option>`).join("")}</select></label><label>${t("image")}<input name="image" type="file" accept="image/*"></label><label>${t("wishlistPriority")}<select name="priority"><option value="low">${t("low")}</option><option value="medium" selected>${t("medium")}</option><option value="high">${t("high")}</option></select></label><label>${t("notes")}<textarea name="notes"></textarea></label><label>${t("sourceLink")}<input name="sourceLink" type="url"></label><p class="form-error" aria-live="polite"></p><footer><button type="button" data-recognize>${t("recognizeToy")}</button><button class="primary">${t("addToWishlist")}</button></footer></form>`);
  const form = dialog.querySelector("form");
  form.querySelector("[data-recognize]").onclick = async () => {
    const file = new FormData(form).get("image");
    if (!file?.size) {
      form.querySelector(".form-error").textContent = t("wishlistImageRequired");
      return;
    }
    try {
      await getRecognition().createDraft(file);
      dialog.close();
    } catch (error) {
      form.querySelector(".form-error").textContent = messageFor(error.code || error.message);
    }
  };
  form.onsubmit = async (event) => {
    event.preventDefault();
    const values = new FormData(form);
    const file = values.get("image");
    let imageRef = { kind: "placeholder" };
    if (file?.size) imageRef = await images.savePersonal(await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }));
    const snapshot = { canonicalKey: canonicalKey(`${values.get("brand")}-${values.get("productName")}`), brand: values.get("brand"), productName: values.get("productName"), categoryCode: values.get("categoryCode"), skillCodes: values.getAll("skillCodes"), imageRef };
    const known = catalog.resolve(snapshot);
    let wish;
    store.update((state) => {
      wish = normalizeWishlistItem({ catalogId: known?.id || null, catalogSnapshot: snapshot, status: "want", priority: values.get("priority"), notes: values.get("notes"), sourceLink: values.get("sourceLink") });
      state.wishlist.push(wish);
    }, "wishlist-manual-add");
    if (!known) {
      governance.createLocalCandidate({ candidateId: `candidate-${wish.id}`, source: "manual", candidateType: "new_product_candidate", proposedCanonicalKey: snapshot.canonicalKey, brand: snapshot.brand, productName: snapshot.productName, nameEn: snapshot.productName, categoryCode: snapshot.categoryCode, skillCodes: snapshot.skillCodes, playMechanics: [], imageConsent: false, linkedWishlistId: wish.id });
      void governance.flushOutbox();
    }
    dialog.close();
  };
}
function queueOnboarding() {
  if (!store.canPersist) return;
  const empty = !store.state.settings.onboardingDone && !store.state.profile.childBirthDate && store.state.toys.length === 0;
  if (!empty || onboardingQueued || document.querySelector("dialog[open]")) return;
  onboardingQueued = true;
  setTimeout(() => {
    onboardingQueued = false;
    if (!document.querySelector("dialog[open]") && !store.state.settings.onboardingDone && !store.state.profile.childBirthDate && store.state.toys.length === 0) openOnboarding();
  }, 0);
}
function openOnboarding() {
  const dialog = openModal(`<form class="form"><header><h2>${t("welcome")}</h2><button type="button" data-close>\xD7</button></header><p>${t("onboardingIntro")}</p>${profileSettingsFields()}<button class="primary">${t("start")}</button></form>`);
  wireProfileSettingsForm(dialog, { onboarding: true });
}
function openAllOverlaps(wishlistId) {
  const item = store.state.wishlist.find((entry) => entry.id === wishlistId);
  const candidate = item && (catalog.resolve(item) || item.catalogSnapshot);
  if (!candidate) return;
  const result2 = substitution.result(candidate, store.state.toys, store.revision, { childAgeMonths: childAgeMonths2() });
  const dialog = openModal(`<section class="sheet"><header><h2>${t("overlaps")}</h2><button type="button" data-close>\xD7</button></header><p>${escape(displayName(candidate))}</p><div class="list">${result2.relationships.map(renderOverlap).join("") || `<p>${t("noOverlap")}</p>`}</div></section>`);
  bindImages(dialog);
}
function openAllSkillOverlaps(wishlistId) {
  const item = store.state.wishlist.find((entry) => entry.id === wishlistId);
  const candidate = item && (catalog.resolve(item) || item.catalogSnapshot);
  if (!candidate) return;
  const result2 = substitution.result(candidate, store.state.toys, store.revision, { childAgeMonths: childAgeMonths2() });
  const dialog = openModal(`<section class="sheet"><header><h2>${t("skillOnlyTitle")}</h2><button type="button" data-close>\xD7</button></header><p>${t("skillOnlyExplanation")}</p><div class="list">${result2.skillRelationships.map(renderOverlap).join("") || `<p>${t("noOverlap")}</p>`}</div></section>`);
  bindImages(dialog);
}
var modalChildContext = null;
function openModal(markup) {
  const context = modalChildContext;
  modalChildContext = null;
  const dialog = context?.dialog || document.querySelector("#modal");
  dialog.innerHTML = markup;
  if (!context) modalManager.open(dialog);
  prepareSingleLineInputs(dialog);
  dialog.querySelectorAll("[data-close]").forEach((button) => {
    button.onclick = context?.onClose || (() => dialog.close());
  });
  if (context?.onClose) dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    context.onClose();
  }, { once: true });
  const scroller = dialog.querySelector(".form,.sheet");
  if (scroller) installScrollTopButton(scroller, true);
  return dialog;
}
function openLibraryDuplicateScan() {
  const duplicates = findDuplicates(store.state.toys).filter((match) => ["exact_duplicate", "same_child_legacy_duplicate", "strong_probable_duplicate"].includes(match.kind));
  const rows = duplicates.map((match) => `<article class="duplicate-pair"><div>${duplicateToy(match.a)}${duplicateToy(match.b)}</div><p>${t(match.kind === "exact_duplicate" ? "exactDuplicate" : match.kind === "same_child_legacy_duplicate" ? "identityKind.same_child_legacy_duplicate" : "strongProbableDuplicate")}</p><button data-merge-personal="${match.a.id}" data-duplicate-id="${match.b.id}" class="primary">${t("mergeDuplicate")}</button></article>`).join("");
  const dialog = openModal(`<section class="sheet"><header><h2>${t("libraryDuplicateCheck")}</h2><button data-close>\xD7</button></header>${rows || `<p>${t("noDuplicates")}</p>`}</section>`);
  dialog.querySelectorAll("[data-merge-personal]").forEach((button) => {
    button.onclick = () => {
      const primary = store.state.toys.find((toy) => toy.id === button.dataset.mergePersonal);
      const duplicate = store.state.toys.find((toy) => toy.id === button.dataset.duplicateId);
      if (!primary || !duplicate || !confirm(t("confirmPersonalMerge", { source: displayName(duplicate), target: displayName(primary) }))) return;
      store.update((state) => mergePersonalToyPair(state, primary.id, duplicate.id), "personal-duplicate-merge");
      dialog.close();
    };
  });
  bindImages(dialog);
}
function duplicateToy(toy) {
  return `<div class="duplicate-toy"><img data-image='${escapedJson(toy.imageRef)}' alt=""><span><b>${escape(displayName(toy))}</b><small>${escape(brandLabel(toy.brand))}</small></span></div>`;
}
function setupScrollTop() {
  const button = document.querySelector("#app-scroll-top");
  if (!button) return;
  button.setAttribute("aria-label", t("scrollToTop"));
  button.title = t("scrollToTop");
  button.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const update = () => button.classList.toggle("hidden", window.scrollY < 320);
  window.addEventListener("scroll", update, { passive: true });
  update();
}
function installScrollTopButton(scroller, modal = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `scroll-top ${modal ? "modal-scroll-top" : ""} hidden`;
  button.textContent = "\u2191";
  button.setAttribute("aria-label", t("scrollToTop"));
  button.title = t("scrollToTop");
  button.onclick = () => scroller.scrollTo({ top: 0, behavior: "smooth" });
  scroller.append(button);
  const update = () => button.classList.toggle("hidden", scroller.scrollTop < 320);
  scroller.addEventListener("scroll", update, { passive: true });
  update();
}
function updateChallengeChoice(projected, choice) {
  store.update((state) => {
    if (choice === "declined") declineCrossAgeApproval(state, projected);
    else setCrossAgeApproval(state, projected, choice === "allowed");
  }, "cross-age-choice");
}
function openChallengeSettings() {
  const dialog = openModal(`<section class="sheet challenge-settings"><header><h2>${t("challengeSettingsTitle")}</h2><button type="button" data-close>\xD7</button></header><p>${t("challengeSettingsIntro")}</p><p data-challenge-summary></p><div class="challenge-list" data-challenge-list></div></section>`);
  const redraw = () => {
    const rows = currentChallengeRows();
    dialog.querySelector("[data-challenge-summary]").textContent = t("challengeEntrySummary", {
      count: rows.length,
      pending: rows.filter((row) => row.choice === "pending").length,
      approved: rows.filter((row) => row.choice === "allowed").length
    });
    const list = dialog.querySelector("[data-challenge-list]");
    list.innerHTML = rows.map(({ toy, row, projected, choice }) => `<article class="challenge-item" data-challenge-key="${escape(row.canonicalKey)}" data-challenge-choice="${choice}"><img data-image='${escapedJson(libraryImageRef(toy, "challenge_settings"))}' alt=""><div><h3>${escape(displayName(toy))}</h3><p>${escape(brandLabel(toy.brand))}</p><p>${t("challengeAges", { recommended: row.minAgeMonths, current: childAgeMonths2() })}</p><p class="challenge-status">${t(choice === "allowed" ? "challengeStatusAllowed" : choice === "declined" ? "challengeStatusDeclined" : "challengeStatusPending")}</p><div class="actions">${choice === "allowed" ? `<button type="button" data-challenge-action="revoke">${t("crossAgeRevoke")}</button>` : `<button type="button" class="primary" data-challenge-action="allow">${t("crossAgeAllow")}</button>${choice === "pending" ? `<button type="button" data-challenge-action="decline">${t("crossAgeDecline")}</button>` : ""}`}</div></div></article>`).join("");
    list.querySelectorAll("[data-challenge-action]").forEach((button) => {
      button.onclick = () => {
        const parent = button.closest("[data-challenge-key]");
        const selected = rows.find((item) => item.row.canonicalKey === parent?.dataset.challengeKey);
        if (!selected) return;
        updateChallengeChoice(selected.projected, button.dataset.challengeAction === "allow" ? "allowed" : button.dataset.challengeAction === "decline" ? "declined" : "revoked");
        redraw();
      };
    });
    bindImages(list);
  };
  redraw();
}
function attachCrossAgeApprovalControl(form, toy) {
  const host = document.createElement("section");
  host.className = "panel cross-age-approval";
  form.querySelector(".form-error").before(host);
  const redraw = () => {
    const age = childAgeMonths2();
    const review = challengeDecision(store.state, catalog, toy, age, store.state.profile?.developmentProfile || {});
    if (!review || review.row.minAgeMonths == null || age >= review.row.minAgeMonths) {
      host.remove();
      return;
    }
    const approvable = parentApprovableChallenge(store.state, catalog, toy, age, store.state.profile?.developmentProfile || {});
    const blocked = review.decision.reason === "HARD_SAFETY_BLOCK" ? "challengeHardBlocked" : review.decision.reason === "UNKNOWN_AGE_BLOCK" ? "challengeUnknownBlocked" : null;
    if (!approvable && !blocked) {
      host.remove();
      return;
    }
    const choice = approvable?.choice || "pending";
    host.hidden = false;
    host.innerHTML = `<h3>${t("challengeSettingsTitle")}</h3><p>${t("challengeAges", { recommended: review.row.minAgeMonths, current: age })}</p>${blocked ? `<p>${t(blocked)}</p>` : `<p>${t("challengeSafetyNote")}</p><p>${t("crossAgeApprovalExplanation", { months: review.row.minAgeMonths })}</p><p class="challenge-status">${t(choice === "allowed" ? "challengeStatusAllowed" : choice === "declined" ? "challengeStatusDeclined" : "challengeStatusPending")}</p><div class="actions">${choice === "allowed" ? `<button type="button" data-cross-age-revoke>${t("crossAgeRevoke")}</button>` : `<button type="button" class="primary" data-cross-age-allow>${t("crossAgeAllow")}</button>${choice === "pending" ? `<button type="button" data-cross-age-decline>${t("crossAgeDecline")}</button>` : ""}`}</div>`}`;
    host.querySelector("[data-cross-age-allow]")?.addEventListener("click", () => {
      updateChallengeChoice(review.projected, "allowed");
      redraw();
    });
    host.querySelector("[data-cross-age-revoke]")?.addEventListener("click", () => {
      updateChallengeChoice(review.projected, "revoked");
      redraw();
    });
    host.querySelector("[data-cross-age-decline]")?.addEventListener("click", () => {
      updateChallengeChoice(review.projected, "declined");
      redraw();
    });
  };
  redraw();
}
function editToy(id) {
  const toy = store.state.toys.find((item) => item.id === id) || normalizeToy({});
  const dialog = openModal(`<form class="form"><header><h2>${t(id ? "edit" : "addToy")}</h2><button type="button" data-close>\xD7</button></header><label>${t("brand")}<input name="brand" value="${escape(toy.brand === "other_unspecified" ? "" : toy.brand)}"></label><label>${t("name")}<input name="productName" required value="${escape(toy.productName)}"></label><label>${t("allCategories")}<select name="categoryCode">${CATEGORY_CODES.map((code) => `<option value="${code}" ${toy.categoryCode === code ? "selected" : ""}>${t(`category.${code}`)}</option>`).join("")}</select></label><label>${t("skills")}<select name="skillCodes" multiple size="7">${SKILL_CODES.map((code) => `<option value="${code}" ${toy.skillCodes.includes(code) ? "selected" : ""}>${t(`skill.${code}`)}</option>`).join("")}</select></label><label>${t("minimumAge")}<input name="minAgeMonths" type="number" value="${toy.minAgeMonths ?? ""}"></label><label>${t("maximumAge")}<input name="maxAgeMonths" type="number" value="${toy.maxAgeMonths ?? ""}"></label><label>${t("image")}<input name="image" type="file" accept="image/*"></label><div data-personal-image-editor-host></div><p class="form-error" aria-live="polite"></p><button class="primary">${t("save")}</button></form>`);
  const toyForm = dialog.querySelector("form");
  if (id) attachCrossAgeApprovalControl(toyForm, toy);
  const personalInput = toyForm.elements.image;
  let editedImageData = null;
  personalInput.addEventListener("change", () => {
    editedImageData = null;
  });
  attachPersonalImageEditor({ input: personalInput, host: toyForm.querySelector("[data-personal-image-editor-host]"), t, onEdited: (data) => {
    editedImageData = data;
    toyForm.querySelector(".form-error").textContent = "";
  } });
  toyForm.onsubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const file = form.get("image");
    if (file?.size && !editedImageData) {
      toyForm.querySelector(".form-error").textContent = t("finishImageEditing");
      return;
    }
    const imageRef = editedImageData ? await images.savePersonal(editedImageData) : toy.imageRef;
    const editedName = String(form.get("productName") || "").trim();
    const next = normalizeToy({ ...toy, brand: form.get("brand"), productName: editedName, userMetadata: { ...toy.userMetadata || {}, ...toy.set?.kind === "child" && editedName !== toy.productName ? { customProductName: true } : {} }, categoryCode: form.get("categoryCode"), skillCodes: form.getAll("skillCodes"), minAgeMonths: form.get("minAgeMonths"), maxAgeMonths: form.get("maxAgeMonths"), imageRef });
    store.update((state) => {
      const index = state.toys.findIndex((item) => item.id === next.id);
      if (index < 0) state.toys.push(next);
      else state.toys[index] = next;
    }, "toy-save");
    dialog.close();
  };
}
function recognizeToy() {
  const dialog = openModal(`<form class="form"><header><h2>${t("recognizeToy")}</h2><button type="button" data-close>\xD7</button></header><label>${t("image")}<input name="image" type="file" accept="image/*" required></label><button class="primary" type="submit">${t("recognizeToy")}</button><p class="form-error" aria-live="polite"></p></form>`);
  const form = dialog.querySelector("form");
  form.onsubmit = async (event) => {
    event.preventDefault();
    const submit = form.querySelector('[type="submit"]');
    const error = form.querySelector(".form-error");
    const file = new FormData(form).get("image");
    if (!file?.size || submit.disabled) return;
    submit.disabled = true;
    error.textContent = "";
    try {
      let closed = false;
      await getRecognition().createDraft(file, "auto", { onPersisted: () => {
        closed = true;
        dialog.close();
        render();
      } });
      if (!closed) {
        dialog.close();
        render();
      }
    } catch (failure) {
      error.textContent = messageFor(failure.code || failure.message || "recognitionFailed");
      submit.disabled = false;
    }
  };
}
function openRecognitionReview(id) {
  return openRecognitionReviewProduction({ document, openModal, recognitionDraftId: id, getState: () => store.state, getRecognition, updateDraft: (updater, reason2) => store.update(updater, reason2), images, attachPersonalImageEditor, t, escape, categoryCodes: CATEGORY_CODES, skillCodes: SKILL_CODES, messageFor, setView: (nextView) => {
    view = nextView;
  }, render, trace: recognitionSaveTrace, diagnostic: recognitionDeviceDiagnostic });
}
function recognitionSaveTrace(stage, detail = {}) {
  const trace = window.__TOY_ROTATION_RECOGNITION_SAVE_TRACE__ ||= [];
  trace.push({ stage, timestamp: (/* @__PURE__ */ new Date()).toISOString(), ...detail });
  if (trace.length > 120) trace.splice(0, trace.length - 120);
}
function buildIdentityLabel() {
  const build = window.TOY_ROTATION_CONFIG || {};
  return [build.appVersion || build.RELEASE || "development", build.buildName, build.buildDate, build.buildId].filter(Boolean).join(" \xB7 ");
}
function installSingleLineEnterCompletion(scope) {
  scope.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.isComposing) return;
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.disabled || input.readOnly) return;
    if (["button", "checkbox", "color", "date", "file", "hidden", "image", "radio", "range", "reset", "submit", "time"].includes(input.type)) return;
    event.preventDefault();
    input.blur();
  });
}
function prepareSingleLineInputs(scope) {
  scope.querySelectorAll("input").forEach((input) => {
    if (input.type === "search") input.setAttribute("enterkeyhint", "search");
    else if (!["button", "checkbox", "color", "date", "file", "hidden", "image", "radio", "range", "reset", "submit", "time"].includes(input.type)) input.setAttribute("enterkeyhint", "done");
  });
}
async function removeToy(id) {
  const toy = store.state.toys.find((item) => item.id === id);
  if (!toy) return;
  const mode = toy.set?.kind === "parent" ? await chooseParentDeleteMode(toy) : confirm(t("confirmRemoveToy")) ? "cascade_generated" : null;
  if (!mode) return;
  const deletion = deleteToyOwnership(store, id, { parentMode: mode });
  const removedIds = new Set(deletion.removed.map((item) => item.id));
  const stillUsed = store.state.toys.some((item) => item.imageRef?.kind === toy.imageRef?.kind && item.imageRef?.id === toy.imageRef?.id && !removedIds.has(item.id));
  if (!stillUsed) await images.removePersonal(toy.imageRef);
}
function chooseParentDeleteMode(parent) {
  const impact = parentDeleteImpact(store.state.toys, parent);
  return new Promise((resolve) => {
    const dialog = openModal(`<section class="sheet"><header><h2>${t("removeSetTitle")}</h2><button type="button" data-close>\xD7</button></header><p>${t("removeSetDescription", { count: impact.generated.length })}</p>${impact.independent.length ? `<p>${t("removeSetIndependent", { count: impact.independent.length })}</p>` : ""}<div class="actions"><button class="primary" data-mode="cascade_generated">${t("removeSetAndChildren")}</button><button data-mode="preserve_children">${t("removeSetKeepChildren")}</button><button data-mode="cancel">${t("cancel")}</button></div></section>`);
    dialog.querySelectorAll("[data-mode]").forEach((button) => button.onclick = () => {
      const mode = button.dataset.mode;
      dialog.close();
      resolve(mode === "cancel" ? null : mode);
    });
    dialog.addEventListener("close", () => resolve(null), { once: true });
  });
}
function generateNewRotation() {
  const planning = structuredClone(store.state);
  clearManualShelfOverrides(planning);
  planning.toys = planning.toys.map((toy) => {
    const row = catalog.resolve(toy);
    const projected = { ...withCatalogSafety(toy, row), minAgeMonths: row?.minAgeMonths ?? toy.minAgeMonths };
    return { ...projected, crossAgeApproval: crossAgeApprovalFor(planning, projected) };
  });
  const result2 = selectRotation({ toys: planning.toys, history: planning.rotationHistory, childAgeMonths: childAgeMonths2(), size: planning.settings.rotationSize, childDevelopmentProfile: planning.profile?.developmentProfile || {}, developmentFeedbackHistory: planning.developmentFeedbackHistory || [] });
  store.update((state) => {
    persistRotationSelection(state, { selected: result2.selected, diagnostics: result2.diagnostics });
  }, "rotation");
  view = "rotation";
}
function catalogFilterDefaults() {
  return { query: "", brands: [], categories: [], skills: [], mechanics: [], challenges: [], age: "all", fitCurrent: false };
}
function cloneCatalogFilters(filters) {
  return { ...filters, brands: [...filters.brands], categories: [...filters.categories], skills: [...filters.skills], mechanics: [...filters.mechanics], challenges: [...filters.challenges] };
}
function catalogFilterCheckboxes(group, values, label, selected = []) {
  return `<fieldset class="catalog-filter-group"><legend>${label}</legend><div class="catalog-filter-options">${values.map(([value, text2]) => `<label><input type="checkbox" name="${group}" value="${escape(value)}" ${selected.includes(value) ? "checked" : ""}><span>${escape(text2)}</span></label>`).join("")}</div></fieldset>`;
}
function openCatalogFilterSheet({ filters, brands, skills, mechanics, onReturn }) {
  const draft = cloneCatalogFilters(filters);
  const checkboxes = (group, values, label) => catalogFilterCheckboxes(group, values, label, draft[group]);
  const dialog = openModal(`<form class="form catalog-filter-sheet"><header><h2>${t("filters")}</h2><button type="button" data-cancel>\xD7</button></header>${checkboxes("brands", brands.map((value) => [value, brandLabel(value)]), t("allBrands"))}${checkboxes("categories", CATEGORY_CODES.map((value) => [value, t("category." + value)]), t("allCategories"))}${checkboxes("skills", skills.map((value) => [value, t("skill." + value)]), t("allSkills"))}${checkboxes("mechanics", mechanics.map((value) => [value, mechanicLabel(value)]), t("allMechanics"))}${checkboxes("challenges", [["1", t("developmentChallenge.1")], ["2", t("developmentChallenge.2")], ["3", t("developmentChallenge.3")], ["4", t("developmentChallenge.4")], ["5", t("developmentChallenge.5")]], t("challengeFilter"))}<fieldset class="catalog-filter-group"><legend>${t("ageFilter")}</legend><label><select name="age"><option value="all" ${draft.age === "all" ? "selected" : ""}>${t("allAgeFits")}</option><option value="current" ${draft.age === "current" ? "selected" : ""}>${t("ageCurrent")}</option><option value="later" ${draft.age === "later" ? "selected" : ""}>${t("ageLater")}</option></select></label></fieldset><label class="catalog-fit-current"><input name="fitCurrent" type="checkbox" ${draft.fitCurrent ? "checked" : ""}><span>${t("fitCurrentChild")}</span></label><div class="filter-actions"><button type="button" data-clear>${t("clearFilters")}</button><button class="primary">${t("applyFilters")}</button></div></form>`);
  const form = dialog.querySelector("form");
  const returnToCatalog = (nextFilters) => onReturn(nextFilters || filters);
  form.querySelector("[data-cancel]").onclick = () => returnToCatalog();
  form.querySelector("[data-clear]").onclick = () => {
    Object.assign(draft, catalogFilterDefaults(), { query: filters.query });
    form.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.checked = false;
    });
    form.elements.age.value = "all";
  };
  form.onsubmit = (event) => {
    event.preventDefault();
    for (const group of ["brands", "categories", "skills", "mechanics", "challenges"]) draft[group] = [...form.querySelectorAll(`[name="${group}"]:checked`)].map((input) => input.value);
    draft.age = form.elements.age.value;
    draft.fitCurrent = form.elements.fitCurrent.checked;
    returnToCatalog(draft);
  };
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    returnToCatalog();
  }, { once: true });
}
function openCatalog({ initialFilters = catalogFilterDefaults() } = {}) {
  const includeReview = admin.enabled;
  const catalogRows = () => catalog.search({ includeReview });
  const brands = [...new Set(catalogRows().map((toy) => toy.brand))].sort((a, b) => brandLabel(a).localeCompare(brandLabel(b)));
  const skills = [...new Set(catalogRows().flatMap((toy) => toy.skillCodes))].sort((a, b) => t(`skill.${a}`).localeCompare(t(`skill.${b}`)));
  const mechanics = [...new Set(catalogRows().flatMap((toy) => developmentMechanics(toy)))].sort((a, b) => mechanicLabel(a).localeCompare(mechanicLabel(b)));
  const filters = cloneCatalogFilters(initialFilters);
  const dialog = openModal(`<section class="sheet"><header><h2>${t("standardCatalog")}</h2><button data-close>\xD7</button></header><input id="catalog-search" type="search" enterkeyhint="search" value="${escape(filters.query)}" placeholder="${t("search")}"><div class="compact-filter-actions"><button id="catalog-filter-toggle">${t("filters")}</button><button id="catalog-clear">${t("clearFilters")}</button></div><div id="catalog-filter-chips" class="catalog-filter-chips"></div><p id="catalog-meta"></p><div id="catalog-rows" class="list"></div><button id="catalog-load-more" class="hidden">${t("loadMore")}</button></section>`);
  let catalogLimit = 40;
  const renderCatalogRows = () => {
    const matches2 = filterCatalogDevelopment(catalogRows(), filters, { childAgeMonths: childAgeMonths2(), profile: store.state.profile?.developmentProfile || {}, history: store.state.developmentFeedbackHistory || [] });
    const publicVisibleCount = catalog.getPublicVisibleCatalogCount();
    dialog.querySelector("#catalog-meta").textContent = t("catalogResultCount", { shown: Math.min(catalogLimit, matches2.length), total: matches2.length, catalog: publicVisibleCount });
    dialog.querySelector("#catalog-rows").innerHTML = matches2.slice(0, catalogLimit).map(renderCatalogCard).join("") || `<p class="panel">${t("noCatalogResults")}</p>`;
    dialog.querySelector("#catalog-load-more").classList.toggle("hidden", catalogLimit >= matches2.length);
    renderCatalogFilterChips();
    wireCatalog(dialog);
  };
  const renderCatalogFilterChips = () => {
    const chips = [];
    for (const [group, values] of Object.entries(filters)) {
      if (!Array.isArray(values)) continue;
      values.forEach((value) => chips.push(`<button data-catalog-chip="${group}" data-catalog-value="${escape(value)}">${escape(catalogFilterLabel(group, value))} \xD7</button>`));
    }
    if (filters.age !== "all") chips.push(`<button data-catalog-chip="age">${t(`age${filters.age === "current" ? "Current" : "Later"}`)} \xD7</button>`);
    if (filters.fitCurrent) chips.push(`<button data-catalog-chip="fitCurrent">${t("fitCurrentChild")} \xD7</button>`);
    dialog.querySelector("#catalog-filter-chips").innerHTML = chips.join("");
    dialog.querySelectorAll("[data-catalog-chip]").forEach((button) => {
      button.onclick = () => {
        const group = button.dataset.catalogChip;
        if (Array.isArray(filters[group])) filters[group] = filters[group].filter((value) => value !== button.dataset.catalogValue);
        else filters[group] = group === "age" ? "all" : false;
        const selector = `[data-catalog-filter="${group}"][value="${button.dataset.catalogValue}"]`;
        dialog.querySelector(selector)?.removeAttribute("checked");
        if (group === "age") dialog.querySelector("#catalog-age").value = "all";
        if (group === "fitCurrent") dialog.querySelector("#catalog-fit-current").checked = false;
        resetCatalogRows();
      };
    });
  };
  const resetCatalogRows = () => {
    catalogLimit = 40;
    renderCatalogRows();
  };
  wireCatalog(dialog);
  dialog.querySelector("#catalog-search").oninput = (event) => {
    filters.query = event.target.value;
    resetCatalogRows();
  };
  dialog.querySelector("#catalog-filter-toggle").onclick = () => openCatalogFilterSheet({ filters, brands, skills, mechanics, onReturn: (nextFilters) => openCatalog({ initialFilters: nextFilters }) });
  dialog.querySelector("#catalog-load-more").onclick = () => {
    catalogLimit += 40;
    renderCatalogRows();
  };
  dialog.querySelector("#catalog-clear").onclick = () => {
    Object.assign(filters, catalogFilterDefaults());
    dialog.querySelector("#catalog-search").value = "";
    resetCatalogRows();
  };
  const unsubscribeCatalog = store.subscribe(() => {
    if (dialog.open) renderCatalogRows();
  });
  dialog.addEventListener("close", unsubscribeCatalog, { once: true });
  renderCatalogRows();
}
function renderCatalogCard(toy) {
  const owned = findOwnedToy(toy, store.state.toys);
  const wished = findWishlistItem(toy, store.state.wishlist);
  const ownership = owned ? `<button disabled aria-label="${t("alreadyOwned")}">\u2713 ${t("alreadyOwned")}</button>` : `<button data-add="${toy.canonicalKey}" class="primary">${t("addToy")}</button>`;
  const wishlistState = owned ? "" : wished ? `<button disabled aria-label="${t("alreadyWishlisted")}">\u2713 ${t("alreadyWishlisted")}</button>` : `<button data-wish="${toy.canonicalKey}">${t("wishlist")}</button>`;
  const review = catalog.reviewMetadata(toy);
  const reviewBadge = admin.enabled && review ? `<p class="catalog-review-status">${t(`catalogReview.${review.status}`)}</p>` : "";
  const mechanics = developmentMechanics(toy).slice(0, 2).map((code) => `<span>${escape(mechanicLabel(code))}</span>`).join("");
  return `<article class="card"><img data-image='${escapedJson(toy.imageRef)}' alt=""><div><h3>${escape(displayName(toy))}</h3><p>${escape(brandLabel(toy.brand))} \xB7 ${t(`category.${toy.categoryCode}`)}</p><div class="chips" aria-label="${t("mechanicsReference")}"><span>${t(challengeLabelKey(toy))}</span>${mechanics}</div>${reviewBadge}<div class="catalog-card-actions"><div class="catalog-card-primary-actions">${ownership}${wishlistState}</div><button type="button" class="catalog-report-link" data-report="${toy.canonicalKey}">${t("catalogReportTitle")}</button>${admin.enabled ? `<button data-manage="${toy.canonicalKey}">${t("edit")}</button>` : ""}</div></div></article>`;
}
function catalogFilterLabel(group, value) {
  return group === "brands" ? brandLabel(value) : group === "categories" ? t(`category.${value}`) : group === "skills" ? t(`skill.${value}`) : group === "mechanics" ? mechanicLabel(value) : t(`developmentChallenge.${value}`);
}
function wireCatalog(scope) {
  scope.querySelectorAll("[data-add]").forEach((button) => {
    button.onclick = () => addFromCatalog(button.dataset.add);
  });
  scope.querySelectorAll("[data-wish]").forEach((button) => {
    button.onclick = () => addWishlist(button.dataset.wish);
  });
  scope.querySelectorAll("[data-manage]").forEach((button) => {
    button.onclick = () => openCatalogManager(button.dataset.manage);
  });
  scope.querySelectorAll("[data-report]").forEach((button) => {
    button.onclick = () => openCatalogReport(button.dataset.report);
  });
  bindImages(scope);
}
function openCatalogReport(key) {
  const toy = catalog.getByKey(key);
  if (!toy) return;
  const dialog = openModal(`<form class="form"><header><h2>${t("catalogReportTitle")}</h2><button type="button" data-close>\xD7</button></header><p>${escape(displayName(toy))}</p><label>${t("catalogReportType")}<select name="reportType"><option value="image_wrong">${t("catalogReportType.image_wrong")}</option><option value="duplicate">${t("catalogReportType.duplicate")}</option><option value="name_wrong">${t("catalogReportType.name_wrong")}</option><option value="brand_wrong">${t("catalogReportType.brand_wrong")}</option><option value="sku_wrong">${t("catalogReportType.sku_wrong")}</option><option value="age_wrong">${t("catalogReportType.age_wrong")}</option><option value="category_wrong">${t("catalogReportType.category_wrong")}</option><option value="skills_wrong">${t("catalogReportType.skills_wrong")}</option><option value="mechanism_wrong">${t("catalogReportType.mechanism_wrong")}</option><option value="parent_child_wrong">${t("catalogReportType.parent_child_wrong")}</option><option value="retired">${t("catalogReportType.retired")}</option><option value="other">${t("catalogReportType.other")}</option></select></label><label>${t("catalogReportDescription")}<textarea name="description" maxlength="1200"></textarea></label><label>${t("catalogReportAttachment")}<input name="attachment" type="file" accept="image/jpeg,image/png,image/webp"></label><button class="primary">${t("catalogReportSubmit")}</button><p id="report-status" role="status"></p></form>`);
  dialog.querySelector("form").onsubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const file = form.get("attachment");
    let attachmentRef = null;
    try {
      if (file?.size) {
        if (file.size > 7e5) {
          dialog.querySelector("#report-status").textContent = t("catalogReportAttachmentTooLarge");
          return;
        }
        attachmentRef = await images.savePersonal(await fileToDataUrl2(file));
      }
      await governance.submitReport({ canonicalKey: toy.canonicalKey, reportType: form.get("reportType"), description: form.get("description"), attachmentRef, catalogVersion: store.state.catalogState?.syncMetadata?.lastAppliedRemoteCatalogVersion || 0, appVersion: window.TOY_ROTATION_CONFIG?.RELEASE || "" });
      dialog.querySelector("#report-status").textContent = t("catalogReportSubmitted");
    } catch (error) {
      if (attachmentRef) try {
        await images.removePersonal(attachmentRef);
      } catch {
      }
      const message = messageFor(error?.message || "");
      dialog.querySelector("#report-status").textContent = message || t("catalogReportFailed");
    }
  };
}
async function addFromCatalog(key) {
  const source = catalog.getByKey(key);
  if (!source || findOwnedToy(source, store.state.toys)) return;
  const imageRef = await images.copyToPersonal(source.imageRef);
  const result2 = addCatalogToy(store, source, imageRef || source.imageRef);
  if (result2.added) catalog.ensureSetChildren();
}
function addWishlist(key) {
  const source = catalog.getByKey(key);
  if (!source) return;
  store.update((state) => {
    if (!findOwnedToy(source, state.toys) && !findWishlistItem(source, state.wishlist)) state.wishlist.push({ id: crypto.randomUUID(), canonicalKey: source.canonicalKey, catalogId: source.id, catalogSnapshot: source, status: "want", addedAt: (/* @__PURE__ */ new Date()).toISOString() });
  }, "wishlist-add");
}
function openCatalogManager(key, { dialog: workspaceDialog = null, onReturn = null } = {}) {
  const toy = catalog.getByKey(key);
  if (!toy || !admin.enabled) return;
  if (workspaceDialog) modalChildContext = { dialog: workspaceDialog, onClose: onReturn };
  const mechanics = [...new Set(catalog.active.flatMap((item) => item.playMechanics || []))].sort((a, b) => mechanicLabel(a).localeCompare(mechanicLabel(b)));
  const mergeTargets = catalog.active.filter((item) => item.canonicalKey !== toy.canonicalKey);
  const skillChoices = SKILL_CODES.map((code) => `<label class="choice"><input type="checkbox" name="skillCodes" value="${code}" ${toy.skillCodes.includes(code) ? "checked" : ""}><span>${t(`skill.${code}`)}</span></label>`).join("");
  const mechanicChoices = mechanics.map((code) => `<label class="choice"><input type="checkbox" name="playMechanics" value="${code}" ${toy.playMechanics.includes(code) ? "checked" : ""}><span>${escape(mechanicLabel(code))}</span></label>`).join("");
  const dialog = openModal(`<form class="form admin-editor"><header><h2>${t("adminCatalogEditor")}</h2><button type="button" data-close>\xD7</button></header><section><h3>${t("basicInformation")}</h3><label>${t("brand")}<input name="brand" value="${escape(toy.brand)}"></label><label>${t("englishName")}<input name="productName" value="${escape(toy.names?.en || toy.productName)}"></label><label>${t("chineseName")}<input name="nameZh" value="${escape(toy.names?.zh || "")}"></label><label>${t("aliases")}<textarea name="aliases" rows="2">${escape((toy.aliases || []).join(", "))}</textarea></label><div class="field-grid"><label>${t("minimumAge")}<input name="minAgeMonths" type="number" value="${toy.minAgeMonths ?? ""}"></label><label>${t("maximumAge")}<input name="maxAgeMonths" type="number" value="${toy.maxAgeMonths ?? ""}"></label></div><label>${t("allCategories")}<select name="categoryCode">${CATEGORY_CODES.map((code) => `<option value="${code}" ${toy.categoryCode === code ? "selected" : ""}>${t(`category.${code}`)}</option>`).join("")}</select></label></section><section><h3>${t("skills")}</h3><div class="choice-grid">${skillChoices}</div></section><section><h3>${t("playMechanics")}</h3><div class="choice-grid">${mechanicChoices}</div></section><section class="catalog-image-editor"><h3>${t("catalogImage")}</h3><img id="catalog-image-preview" data-image='${escapedJson(toy.imageRef)}' alt=""><p>${t("catalogImageOwnershipHint")}</p><label class="button-label">${t("replaceImage")}<input name="catalogImage" type="file" accept="image/*" class="visually-hidden"></label><div data-catalog-image-editor-host></div></section><details><summary>${t("advancedManagement")}</summary><p><b>${t("canonicalIdentity")}:</b> ${escape(toy.canonicalKey)}</p><p><b>${t("catalogSource")}:</b> ${t(catalogSourceKey(toy.source))}</p><label>${t("searchMergeTarget")}<input id="merge-search" type="search" placeholder="${t("search")}"></label><label>${t("mergeTarget")}<select id="merge-target" size="5"><option value="">${t("selectMergeTarget")}</option>${mergeTargets.slice(0, 150).map(mergeOption).join("")}</select></label><button type="button" id="catalog-merge">${t("mergeDuplicate")}</button><button type="button" id="catalog-delete" class="danger">${t("permanentDelete")}</button></details><button class="primary">${t("save")}</button><p id="catalog-admin-error"></p></form>`);
  const form = dialog.querySelector("form");
  bindImages(dialog);
  const fileInput = form.elements.catalogImage;
  let editedCatalogImageData = null;
  const initialCatalogSource = toy.imageRef?.kind === "generated" || toy.imageRef?.kind === "placeholder" ? null : images.resolve(toy.imageRef);
  const catalogImageEditor = attachImageEditor({
    input: fileInput,
    host: form.querySelector("[data-catalog-image-editor-host]"),
    t,
    title: t("catalogImage"),
    initialSource: initialCatalogSource,
    onEdited: (data) => {
      editedCatalogImageData = data;
      if (data) dialog.querySelector("#catalog-image-preview").src = data;
      form.querySelector("#catalog-admin-error").textContent = "";
    }
  });
  void catalogImageEditor.ready;
  form.onsubmit = async (event) => {
    event.preventDefault();
    const attemptId = adminCatalogSaveDiagnostic.begin({ editedImagePresent: Boolean(editedCatalogImageData) });
    const trace = (stage, details) => adminCatalogSaveDiagnostic.record(attemptId, stage, details);
    try {
      const values = new FormData(form);
      const patch = { brand: values.get("brand"), productName: values.get("productName"), names: { en: values.get("productName"), zh: values.get("nameZh") }, aliases: String(values.get("aliases")).split(",").map((value) => value.trim()).filter(Boolean), minAgeMonths: values.get("minAgeMonths"), maxAgeMonths: values.get("maxAgeMonths"), categoryCode: values.get("categoryCode"), skillCodes: values.getAll("skillCodes"), playMechanics: values.getAll("playMechanics") };
      if (editedCatalogImageData) {
        trace("local_catalog_save_started");
        let localCatalogRef;
        try {
          localCatalogRef = await images.saveCatalog(editedCatalogImageData, toy.canonicalKey);
        } catch (error) {
          trace("local_catalog_save_failed", { errorType: adminCatalogSaveErrorType(error) });
          throw error;
        }
        trace("local_catalog_save_succeeded");
        patch.imageRef = { ...localCatalogRef, imageOwnerCanonicalKey: toy.canonicalKey, imageSource: "admin_upload", imageSourceType: "admin_upload", verificationStatus: "manually_confirmed", updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
        patch.imageUrl = await admin.replaceCatalogImage(toy.canonicalKey, editedCatalogImageData, { trace });
      }
      await admin.edit(toy.canonicalKey, patch, { trace });
      editedCatalogImageData = null;
      fileInput.value = "";
      form.querySelector("#catalog-admin-error").textContent = "Saved";
      trace("final_ui_state", { modalOpen: dialog.open, errorRendered: true, editorRetained: false });
    } catch (error) {
      const errorNode = dialog.querySelector("#catalog-admin-error");
      errorNode.textContent = messageFor(error.message);
      trace("final_ui_state", { errorType: adminCatalogSaveErrorType(error), modalOpen: dialog.open, errorRendered: Boolean(errorNode.textContent), editorRetained: Boolean(editedCatalogImageData) });
    }
  };
  if (onReturn) {
    const saveEditor = form.onsubmit;
    form.onsubmit = async (event) => {
      await saveEditor(event);
      if (form.querySelector("#catalog-admin-error").textContent === "Saved") onReturn();
    };
  }
  const renderMergeTargets = () => {
    const query = dialog.querySelector("#merge-search").value.normalize("NFKC").toLowerCase();
    const target = dialog.querySelector("#merge-target");
    target.innerHTML = `<option value="">${t("selectMergeTarget")}</option>` + mergeTargets.filter((item) => !query || [item.brand, item.productName, item.names?.zh, ...item.aliases || []].join(" ").normalize("NFKC").toLowerCase().includes(query)).slice(0, 150).map(mergeOption).join("");
  };
  dialog.querySelector("#merge-search").oninput = renderMergeTargets;
  dialog.querySelector("#catalog-merge").onclick = async () => {
    const target = dialog.querySelector("#merge-target").value;
    if (!target || !confirm(t("confirmMerge", { source: displayName(toy), target: displayName(catalog.getByKey(target)) }))) return;
    try {
      await admin.merge(toy.canonicalKey, target);
      form.querySelector("#catalog-admin-error").textContent = "Saved";
    } catch (error) {
      dialog.querySelector("#catalog-admin-error").textContent = messageFor(error.message);
    }
  };
  dialog.querySelector("#catalog-delete").onclick = async () => {
    if (!confirm(t("confirmDelete")) || !confirm(t("confirmDeletePermanent"))) return;
    try {
      await admin.delete(toy.canonicalKey, toy);
      form.querySelector("#catalog-admin-error").textContent = "Saved";
    } catch (error) {
      dialog.querySelector("#catalog-admin-error").textContent = messageFor(error.message);
    }
  };
}
function mergeOption(item) {
  return `<option value="${escape(item.canonicalKey)}">${escape(brandLabel(item.brand))} \xB7 ${escape(displayName(item))}</option>`;
}
function catalogSourceKey(source) {
  return { base: "catalogSourceBase", remote: "catalogSourceRemote", learned: "catalogSourceLearned", admin: "catalogSourceAdmin" }[source] || "catalogSourceOther";
}
function openSettings() {
  const recoveryNotice = !store.canPersist ? `<p class="danger">${t("persistenceRecoverySettingsNotice")}</p>` : "";
  const adminControls = admin.enabled ? `<button type="button" id="restore-diagnostic-export">${t("exportRestoreDiagnostic")}</button><section class="panel"><h3>Recognition Device Diagnostics</h3><p id="recognition-trace-status">Stopped \xB7 0 events</p><button type="button" id="recognition-trace-start">Start Recognition Trace</button><button type="button" id="recognition-trace-stop">Stop Trace</button><button type="button" id="recognition-trace-clear">Clear Trace</button><button type="button" id="recognition-trace-export">Export Recognition Trace JSON</button></section><section class="panel"><h3>Admin Catalog Save Diagnostic</h3><p id="admin-catalog-save-trace-status">Stopped \xB7 0 events</p><button type="button" id="admin-catalog-save-trace-start">Start Trace</button><button type="button" id="admin-catalog-save-trace-stop">Stop Trace</button><button type="button" id="admin-catalog-save-trace-clear">Clear Trace</button><button type="button" id="admin-catalog-save-trace-export">Export Trace JSON</button></section><section class="panel"><h3>Storage Usage</h3><p id="storage-usage-status">Loading\u2026</p><button type="button" id="storage-audit-export">Export Storage Audit JSON</button></section><button type="button" id="manager-open">${t("managerDashboard")} <span class="badge" data-admin-pending-badge>${pendingCandidateCount(store.state)}</span></button><button type="button" id="admin-open">${t("signOut")}</button>` : `<button type="button" id="admin-open">${t("adminMode")}</button>`;
  const dialog = openModal(`<form class="form"><header><h2>${t("settings")}</h2><button type="button" data-close>\xD7</button></header>${recoveryNotice}<label>${t("language")}<select name="language"><option value="system">${t("system")}</option><option value="en">${t("languageEnglish")}</option><option value="zh">${t("languageChinese")}</option></select></label><label>${t("theme")}<select name="theme"><option value="system">${t("system")}</option><option value="light">${t("light")}</option><option value="dark">${t("dark")}</option></select></label><hr>${profileSettingsFields()}<button class="primary" ${store.canPersist ? "" : "disabled"}>${t("save")}</button><button type="button" id="backup-export" ${store.canPersist ? "" : "disabled"}>${t("exportBackup")}</button><button type="button" id="persistence-diagnostic-export">${t("exportPersistenceDiagnostic")}</button><label>${t("restoreBackup")}<input id="backup-import" type="file" accept="application/json" ${store.canPersist ? "" : "disabled"}></label><p id="backup-restore-status" role="status" aria-live="polite"></p><section class="panel"><h3>${t("dataAudit")}</h3><p>${t("exportToyImageAuditHint")}</p><button type="button" id="toy-image-audit-export">${t("exportToyImageAudit")}</button><p>${t("exportCatalogSafetyAuditHint")}</p><button type="button" id="catalog-safety-audit-export">${t("exportCatalogSafetyAudit")}</button></section><section id="admin-settings">${adminControls}</section></form>`);
  const form = dialog.querySelector("form");
  form.language.value = store.state.settings.language;
  form.theme.value = store.state.settings.theme;
  if (!store.canPersist) form.querySelectorAll("input, select, textarea").forEach((control) => {
    if (control.id !== "persistence-diagnostic-export") control.disabled = true;
  });
  const applyPreview = () => {
    dialog.close();
    store.update((state) => Object.assign(state.settings, { language: form.language.value, theme: form.theme.value }), "settings-preview");
    openSettings();
  };
  form.language.onchange = applyPreview;
  form.theme.onchange = applyPreview;
  wireProfileSettingsForm(dialog);
  form.onsubmit = (event) => {
    event.preventDefault();
    store.update((state) => Object.assign(state.settings, { language: form.language.value, theme: form.theme.value }), "settings");
    saveProfileSettingsFromForm(form);
    dialog.close();
  };
  dialog.querySelector("#backup-export").onclick = async () => downloadJson(await exportBackup(store, images), "toy-rotation-backup.json");
  dialog.querySelector("#toy-image-audit-export")?.addEventListener("click", () => downloadJson(buildToyImageAudit({ state: store.state, catalog, build: window.TOY_ROTATION_CONFIG }), `toy-image-audit-v0116-${auditFilenameStamp()}.json`));
  dialog.querySelector("#catalog-safety-audit-export")?.addEventListener("click", () => downloadJson(buildCatalogSafetyAudit({ state: store.state, catalog, build: window.TOY_ROTATION_CONFIG }), `toy-safety-audit-v0116-${auditFilenameStamp()}.json`));
  dialog.querySelector("#backup-import").onchange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const input = event.currentTarget;
    const status = dialog.querySelector("#backup-restore-status");
    const controls = [...form.querySelectorAll("button:not([data-close]), input, select, textarea")];
    const setStatus = (key, params = {}) => {
      status.textContent = t(key, params);
    };
    const stageStatus = (name) => ({
      backup_validation_start: "restoreChecking",
      detached_staging_start: "restoreRepairing",
      migrations_start: "restoreRepairing",
      parent_child_reconciliation_start: "restoreRepairing",
      backup_image_import_start: "restoreSaving",
      image_metadata_validation_start: "restoreChecking",
      atomic_commit_start: "restoreSaving",
      persistence_complete: "restoreSaving",
      restore_complete: "restoreComplete"
    })[name] || null;
    const trace = createRestoreTrace();
    try {
      controls.forEach((control) => {
        control.disabled = true;
      });
      trace.mark("file_input_change", { name: file.name, size: file.size, mime: file.type || null });
      trace.mark("restore_handler_enter");
      trace.mark("file_selected", { name: file.name, size: file.size, mime: file.type || null });
      setStatus("restoreReading");
      const source = await readRestoreFile(file, trace);
      trace.mark("json_parse_start");
      const payload = JSON.parse(source);
      trace.mark("json_parse_end", { schemaVersion: payload.schemaVersion ?? null, format: payload.format || null });
      trace.mark("backup_service_enter");
      const restored = await restoreBackup(payload, store, images, { catalog, trace, onStage: ({ name }) => {
        const key = stageStatus(name);
        if (key) setStatus(key);
      } });
      trace.mark("ui_refresh_frame_wait_start");
      await nextPaint();
      trace.mark("ui_refresh_frame_end");
      const repaired = restored.historicalReferenceRepair?.remapped + restored.historicalReferenceRepair?.markedMissing || 0;
      setStatus(repaired ? "restoreCompleteWithHistoricalRepair" : "restoreComplete", { count: repaired });
    } catch (error) {
      trace.mark("restore_handler_failed", { success: false, errorName: error?.name || "Error", errorMessage: error?.message || "restoreFailed" });
      trace.fail(error);
      setStatus("restoreFailed", { stage: globalThis.__TOY_ROTATION_RESTORE_TIMING__?.latestStage || "unknown" });
      console.error("Backup restore failed", error);
    } finally {
      controls.forEach((control) => {
        control.disabled = false;
      });
      input.value = "";
    }
  };
  dialog.querySelector("#restore-diagnostic-export")?.addEventListener("click", exportRestoreDiagnostic);
  const updateRecognitionTraceStatus = () => {
    const active = recognitionDeviceDiagnostic.sessions.at(-1);
    const status = dialog.querySelector("#recognition-trace-status");
    if (status) status.textContent = `${recognitionDeviceDiagnostic.recording ? "Recording" : "Stopped"} \xB7 ${active?.events.length || 0} events \xB7 ${active?.sessionId || "no session"}`;
  };
  dialog.querySelector("#recognition-trace-start")?.addEventListener("click", () => {
    recognitionDeviceDiagnostic.start();
    updateRecognitionTraceStatus();
  });
  dialog.querySelector("#recognition-trace-stop")?.addEventListener("click", () => {
    recognitionDeviceDiagnostic.stop();
    updateRecognitionTraceStatus();
  });
  dialog.querySelector("#recognition-trace-clear")?.addEventListener("click", () => {
    recognitionDeviceDiagnostic.clear();
    updateRecognitionTraceStatus();
  });
  dialog.querySelector("#recognition-trace-export")?.addEventListener("click", () => downloadJson(recognitionDeviceDiagnostic.export(), `toy-rotation-recognition-device-trace-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "")}.json`));
  const updateAdminCatalogSaveTraceStatus = () => {
    const status = dialog.querySelector("#admin-catalog-save-trace-status");
    if (status) status.textContent = `${adminCatalogSaveDiagnostic.recording ? "Recording" : "Stopped"} \xB7 ${adminCatalogSaveDiagnostic.eventCount} events`;
  };
  dialog.querySelector("#admin-catalog-save-trace-start")?.addEventListener("click", () => {
    adminCatalogSaveDiagnostic.start();
    updateAdminCatalogSaveTraceStatus();
  });
  dialog.querySelector("#admin-catalog-save-trace-stop")?.addEventListener("click", () => {
    adminCatalogSaveDiagnostic.stop();
    updateAdminCatalogSaveTraceStatus();
  });
  dialog.querySelector("#admin-catalog-save-trace-clear")?.addEventListener("click", () => {
    adminCatalogSaveDiagnostic.clear();
    updateAdminCatalogSaveTraceStatus();
  });
  dialog.querySelector("#admin-catalog-save-trace-export")?.addEventListener("click", () => downloadJson(adminCatalogSaveDiagnostic.export({ release: window.TOY_ROTATION_CONFIG?.RELEASE || null }), `toy-rotation-admin-catalog-save-trace-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "")}.json`));
  const storageStatus = dialog.querySelector("#storage-usage-status");
  const refreshStorageUsage = async () => {
    const audit = await buildStorageUsageDiagnostic({ state: store.state, build: window.TOY_ROTATION_CONFIG });
    if (storageStatus) storageStatus.textContent = `Canonical ${audit.localStorage.canonicalBytes} B \xB7 Total ${audit.localStorage.totalToyRotationBytes} B \xB7 Snapshots ${audit.localStorage.snapshotBytes} B \xB7 Drafts ${audit.stateBreakdown.draftsBytes} B \xB7 Candidates ${audit.stateBreakdown.candidatesBytes} B \xB7 Outbox ${audit.stateBreakdown.governanceBytes} B \xB7 data:image ${audit.stateBreakdown.embeddedDataImageCount} \xB7 ${audit.storageEstimate.available ? `Usage ${audit.storageEstimate.usage} / ${audit.storageEstimate.quota} (${audit.storageEstimate.usagePercent}%)` : "Storage estimate unavailable"}`;
    return audit;
  };
  void refreshStorageUsage();
  dialog.querySelector("#storage-audit-export")?.addEventListener("click", async () => downloadJson(await refreshStorageUsage(), `toy-rotation-storage-audit-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "")}.json`));
  updateRecognitionTraceStatus();
  updateAdminCatalogSaveTraceStatus();
  dialog.querySelector("#persistence-diagnostic-export")?.addEventListener("click", exportPersistenceDiagnostic);
  dialog.querySelector("#admin-open").onclick = () => admin.enabled ? (admin.signOut(), openSettings()) : openAdminInSettings(dialog);
  dialog.querySelector("#manager-open")?.addEventListener("click", () => openAdminWorkspaceInSettings(dialog));
}
async function readRestoreFile(file, trace) {
  try {
    trace.mark("file_text_start");
    const source = await file.text();
    trace.mark("file_text_end", { bytes: source.length });
    return source;
  } catch (error) {
    trace.mark("file_text_failed", { success: false, errorName: error?.name || "Error", errorMessage: error?.message || "fileTextFailed" });
    trace.mark("file_reader_fallback_start");
    const source = await readFileWithReader(file);
    trace.mark("file_reader_fallback_end", { bytes: source.length });
    return source;
  }
}
function readFileWithReader(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("fileReaderFailed"));
    reader.onabort = () => reject(new Error("fileReaderAborted"));
    reader.readAsText(file);
  });
}
function nextPaint() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}
function exportRestoreDiagnostic() {
  downloadJson(buildRestoreDiagnostic({ trace: window.__TOY_ROTATION_RESTORE_TIMING__ || null, release: window.TOY_ROTATION_CONFIG?.RELEASE }), `toy-rotation-restore-diagnostic-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`);
}
async function exportPersistenceDiagnostic() {
  downloadJson(await buildPersistenceDiagnostic({ store, images, release: window.TOY_ROTATION_CONFIG?.RELEASE }), `toy-rotation-persistence-diagnostic-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`);
}
function applyPersistenceRecovery() {
  if (!confirm(t("confirmDetectedRecovery"))) return;
  try {
    const result2 = applyDetectedLegacyRecovery();
    if (!result2.ok) throw new Error(result2.status);
    location.reload();
  } catch (error) {
    alert(messageFor(error.message));
  }
}
function profileSettingsFields() {
  const profile = store.state.profile;
  const days = Number(store.state.settings.rotationDays) || 7;
  const preset = [7, 10, 14].includes(days) ? String(days) : "custom";
  const abilities = DEVELOPMENT_ABILITY_GROUPS.map((group) => `<details class="panel"><summary>${t(`abilityProfile.group.${group.key}`)}</summary>${group.mechanisms.map((mechanic) => {
    const manual = profile.developmentProfile?.[mechanic]?.manualLevel;
    const options = [["", t("abilityProfile.auto")], ["1", t("abilityProfile.level.intro")], ["2", t("abilityProfile.level.basic")], ["3", t("abilityProfile.level.fluent")], ["5", t("abilityProfile.level.challenge")]];
    return `<label>${t(`abilityProfile.mechanism.${mechanic}`)}<select data-ability-mechanic="${mechanic}">${options.map(([value, label]) => `<option value="${value}" ${String(manual ?? "") === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>`;
  }).join("")}</details>`).join("");
  return `<h3>${t("childProfile")}</h3><label>${t("childName")}<input name="childName" value="${escape(profile.childName || "")}"></label><label>${t("birthDate")}<input name="childBirthDate" type="date" value="${escape(profile.childBirthDate || "")}" required></label><details class="panel"><summary>${t("abilityProfile.title")}</summary><p>${t("abilityProfile.hint")}</p>${abilities}</details><h3>${t("rotationSettings")}</h3><label>${t("targetShelfCount")}<input name="rotationSize" type="number" min="1" max="50" value="${store.state.settings.rotationSize}"></label><label>${t("rotationInterval")}<select name="rotationDays"><option value="7">7 ${t("dayUnit")}</option><option value="10">10 ${t("dayUnit")}</option><option value="14">14 ${t("dayUnit")}</option><option value="custom">${t("custom")}</option></select></label><label class="rotation-custom ${preset === "custom" ? "" : "hidden"}">${t("customRotationDays")}<input name="rotationDaysCustom" type="number" min="1" max="90" value="${preset === "custom" ? days : ""}"></label>`;
}
function wireProfileSettingsForm(dialog, { onboarding = false } = {}) {
  const form = dialog.querySelector("form");
  const days = Number(store.state.settings.rotationDays) || 7;
  form.rotationDays.value = [7, 10, 14].includes(days) ? String(days) : "custom";
  form.rotationDays.onchange = () => form.querySelector(".rotation-custom").classList.toggle("hidden", form.rotationDays.value !== "custom");
  if (onboarding) form.onsubmit = (event) => {
    event.preventDefault();
    saveProfileSettingsFromForm(form);
    dialog.close();
  };
}
function saveProfileSettingsFromForm(form) {
  const selectedDays = form.rotationDays.value === "custom" ? form.rotationDaysCustom.value : form.rotationDays.value;
  const edits = [...form.querySelectorAll("[data-ability-mechanic]")].map((select) => [select.dataset.abilityMechanic, select.value]).filter(([mechanic, value]) => String(store.state.profile.developmentProfile?.[mechanic]?.manualLevel ?? "") !== value);
  saveProfileAndRotationSettings(store, { childName: form.childName.value, childBirthDate: form.childBirthDate.value, rotationSize: form.rotationSize.value, rotationDays: selectedDays, manualAbilities: edits });
}
async function openManagerDashboard({ repairMessage = "", returnToSettings = false } = {}) {
  if (!admin.enabled) return;
  const review = store.state.catalogState?.syncMetadata?.identityReviewV10 || { ignoredPairs: [] };
  const ignored = new Set(review.ignoredPairs || []);
  const duplicates = findDuplicates(store.state.toys).filter((match) => !ignored.has(identityPairKey(match)));
  const relationships = auditIdentityRelationships(store.state.toys);
  const setAudit = auditSetIntegrity(store.state.toys);
  const setDefinitions = new Map(catalog.active.map((toy) => [canonicalKey(toy.canonicalKey), toy]));
  const structureDamageCandidates = classifyStructureMigrationDamage(store.state, setDefinitions).filter((candidate) => candidate.kind === "probable_structure_migration_damage");
  const pending = store.state.drafts || [];
  const learned = catalog.pendingLearned();
  const relationInfo = relationships.filter((item) => ["parent_child_relation", "sibling_child", "related_variant"].includes(item.kind));
  const rotationDiagnostics = store.state.rotationHistory?.find((round) => round.rotationDiagnostics)?.rotationDiagnostics || null;
  const rotationDiagnosticPanel = rotationDiagnostics ? `<h3>${t("rotationDiagnostics")}</h3><div class="panel"><p>${t("rotationDiagnosticSummary", { requested: rotationDiagnostics.requestedRotationCount ?? rotationDiagnostics.requestedCount, selected: rotationDiagnostics.selectedRotationCount ?? rotationDiagnostics.selectedCount, permanent: rotationDiagnostics.permanentCount ?? 0, total: rotationDiagnostics.totalShelfCount ?? rotationDiagnostics.selectedCount, eligible: rotationDiagnostics.eligibleRotationCount ?? rotationDiagnostics.eligibleCount })}</p><p>${t("rotationDiagnosticShortage", { count: rotationDiagnostics.shortageCount })}</p><details><summary>${t("rotationDiagnosticDetails")}</summary><pre>${escape(JSON.stringify({ exclusionSummary: rotationDiagnostics.exclusionSummary, selectedBrandCounts: rotationDiagnostics.selectedBrandCounts, selectedOwnershipGroupCounts: rotationDiagnostics.selectedOwnershipGroupCounts, previousRotationOverlap: rotationDiagnostics.previousRotationOverlap, recent3RotationOverlap: rotationDiagnostics.recent3RotationOverlap, brandDiversityPenaltyApplied: rotationDiagnostics.brandDiversityPenaltyApplied, groupDiversityPenaltyApplied: rotationDiagnostics.groupDiversityPenaltyApplied, recencyPenaltyApplied: rotationDiagnostics.recencyPenaltyApplied, selectedCandidateScores: rotationDiagnostics.selectedCandidateScores }, null, 2))}</pre></details></div>` : "";
  const dialog = openModal(`<section class="sheet"><header><h2>${t("managerDashboard")}</h2><button data-close>\xD7</button></header>${repairMessage ? `<div class="panel repair-success" role="status"><b>${escape(repairMessage)}</b></div>` : ""}<button id="manager-catalog" class="primary">${t("manageStandardCatalog")}</button>
    <section class="panel"><h3>Catalog Governance</h3><p id="catalog-governance-summary">Loading\u2026</p><button id="catalog-governance-open" class="primary">Candidates / Reports</button><button id="local-candidate-queue" class="primary">Local Candidates (${pendingCandidateCount(store.state)})</button></section>
    <h3>${t("pendingCatalogReview")}</h3>${pending.length || learned.length ? `${learned.map((item) => `<div class="panel"><b>${escape(displayName(item))}</b><p>${t("catalogSourceLearned")} \xB7 ${t("pendingReview")}</p><button data-learned-approve="${escape(item.canonicalKey)}" class="primary">${t("approve")}</button><button data-learned-manage="${escape(item.canonicalKey)}">${t("edit")}</button></div>`).join("")}${pending.map((draft) => `<div class="panel"><b>${escape(draft.productName || t("pendingReview"))}</b><p>${t(`recognition${capitalize(draft.status)}`)}${draft.error ? ` \xB7 ${escape(messageFor(draft.error))}` : ""}</p>${renderRecognitionDiagnostic(draft.diagnostics)}${String(draft.status).startsWith("ready") ? `<button data-draft-confirm="${draft.id}" class="primary">${t("approve")}</button>` : ""}<button data-admin-edit-draft="${draft.id}">${t("edit")}</button><button data-draft-remove="${draft.id}">${t("reject")}</button></div>`).join("")}` : `<p>${t("noPendingReview")}</p>`}
    <h3>${t("identityConflicts")}</h3>${duplicates.length ? duplicates.map((match) => renderIdentityConflict(match)).join("") : `<p>${t("noDuplicates")}</p>`}
    <h3>${t("setStructureIssues")}</h3>${structureDamageCandidates.map((candidate) => renderStructureDamageCandidate(candidate)).join("")}<div class="panel"><p>${t("setAuditSummary", { parents: setAudit.parents, children: setAudit.children, issues: setAudit.unresolved })}</p><button id="admin-repair-set" class="secondary">${t("autoRepair")}</button>${setAudit.issues.length ? setAudit.issues.slice(0, 8).map((issue) => `<p>${escape(setIssueLabel(issue))}</p>`).join("") : `<p>${t("noSetStructureIssues")}</p>`}</div>
    <h3>${t("imageProblems")}</h3><div class="panel"><div id="admin-image-diagnostics">${t("loading")}</div><button id="admin-image-audit">${t("autoRelinkImages")}</button></div>
    <h3>${t("dataDiagnostics")}</h3><div class="panel"><p>${t("identityAuditSummary", { relations: relationInfo.length, unresolved: setAudit.unresolved })}</p><p>${t("identityEngineSeparation")}</p><p>${t("startupStatus", { stage: startupTrace.latestStage })}</p><p><b>${escape(window.TOY_ROTATION_CONFIG?.RELEASE || "development")}</b><br><code>${IMAGE_RESOLVER_BUILD_MARKER}</code></p><button id="admin-export-runtime-image-diagnostic" class="primary">${t("exportRuntimeImageDiagnostic")}</button><p>${t("exportRuntimeImageDiagnosticHint")}</p><button id="admin-export-catalog-count-diagnostic">${t("exportCatalogCountDiagnostic")}</button><p>${t("exportCatalogCountDiagnosticHint")}</p><button id="admin-export-restore-diagnostic">${t("exportRestoreDiagnostic")}</button><button id="admin-export-data-repair-diagnostic">${t("exportDataRepairDiagnostic")}</button><p>${t("exportDataRepairDiagnosticHint")}</p></div>
    ${rotationDiagnosticPanel}
    <h3>${t("backendDiagnostics")}</h3><div id="admin-diagnostics" class="panel">${t("loading")}</div></section>`);
  dialog.querySelector("#manager-catalog").onclick = openCatalog;
  dialog.querySelector("#catalog-governance-open").onclick = () => openCatalogGovernance();
  dialog.querySelector("#local-candidate-queue").onclick = () => renderLocalCandidateQueue(dialog, { returnToSettings });
  if (returnToSettings) dialog.addEventListener("close", () => openSettings(), { once: true });
  admin.governance().then((info) => {
    const node = dialog.querySelector("#catalog-governance-summary");
    if (node) node.textContent = `Remote v${info.version ?? "\u2014"} \xB7 Candidates (${info.candidateUnread}) \xB7 Reports (${info.reportUnread})`;
  }).catch(() => {
    const node = dialog.querySelector("#catalog-governance-summary");
    if (node) node.textContent = "Remote Catalog Sync unavailable";
  });
  dialog.querySelectorAll("[data-learned-manage]").forEach((button) => button.onclick = () => {
    dialog.close();
    openCatalogManager(button.dataset.learnedManage);
  });
  dialog.querySelectorAll("[data-learned-approve]").forEach((button) => button.onclick = () => {
    catalog.approveLearnedCandidate(button.dataset.learnedApprove);
    dialog.close();
    openManagerDashboard();
  });
  dialog.querySelectorAll("[data-draft-confirm]").forEach((button) => button.onclick = () => {
    getRecognition().confirm(button.dataset.draftConfirm);
    dialog.close();
  });
  dialog.querySelectorAll("[data-draft-remove]").forEach((button) => button.onclick = () => {
    getRecognition().remove(button.dataset.draftRemove);
    dialog.close();
  });
  dialog.querySelectorAll("[data-admin-open-personal-duplicates]").forEach((button) => button.onclick = () => {
    dialog.close();
    view = "library";
    render();
    openLibraryDuplicateScan();
  });
  dialog.querySelectorAll("[data-admin-ignore]").forEach((button) => button.onclick = () => {
    store.update((state) => {
      state.catalogState.syncMetadata ||= {};
      const entry = state.catalogState.syncMetadata.identityReviewV10 ||= { ignoredPairs: [] };
      entry.ignoredPairs = [.../* @__PURE__ */ new Set([...entry.ignoredPairs || [], button.dataset.adminIgnore])];
    }, "admin-identity-ignore");
    dialog.close();
    openManagerDashboard();
  });
  dialog.querySelector("#admin-repair-set").onclick = () => {
    catalog.repairSetStructure();
    dialog.close();
    openManagerDashboard();
  };
  dialog.querySelectorAll("[data-restore-structure-children]").forEach((button) => button.onclick = () => {
    const parentId = button.dataset.restoreStructureChildren;
    const candidate = structureDamageCandidates.find((item) => item.parentId === parentId);
    if (!candidate) return;
    const parent = store.state.toys.find((toy) => toy.id === parentId);
    if (!window.confirm(t("confirmRestoreMissingChildren", { count: candidate.expectedChildCount, name: displayName(parent || {}) }))) return;
    button.disabled = true;
    let result2;
    store.update((state) => {
      result2 = repairStructureMigrationDamage(state, setDefinitions, { confirmedParentIds: [parentId] });
    }, "structure-migration-damage-repair");
    dialog.close();
    openManagerDashboard({ repairMessage: result2?.restoredChildren ? t("restoredMissingChildren", { count: result2.restoredChildren }) : t("noMissingChildrenRestored") });
  });
  dialog.querySelector("#admin-image-audit").onclick = async () => {
    await auditToyLibraryImages({ store, images, catalog });
    await auditStandardCatalogImages({ store, catalog });
    refreshImageAudit(dialog);
  };
  dialog.querySelector("#admin-export-data-repair-diagnostic").onclick = () => {
    const diagnostic = buildDataRepairDiagnostic({ store, catalog, release: window.TOY_ROTATION_CONFIG?.RELEASE, lifecycle: diagnosticLifecycle, startupTrace, restoreTiming: window.__TOY_ROTATION_RESTORE_TIMING__ || null });
    downloadJson(diagnostic, `toy-rotation-data-repair-diagnostic-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`);
  };
  dialog.querySelector("#admin-export-runtime-image-diagnostic").onclick = async () => {
    captureLoveveryImageSweep("admin_export_probe");
    const diagnostic = await runtimeImageDiagnostics.buildExport({ store, catalog });
    downloadJson(diagnostic, `toy-rotation-runtime-child-image-diagnostic-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`);
  };
  dialog.querySelector("#admin-export-catalog-count-diagnostic").onclick = () => downloadJson(buildCatalogCountDiagnostic({ catalog, build: window.TOY_ROTATION_CONFIG, uiSearchRows: catalog.search({ includeReview: false }).length }), `toy-rotation-catalog-count-diagnostic-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`);
  dialog.querySelector("#admin-export-restore-diagnostic").onclick = exportRestoreDiagnostic;
  refreshImageAudit(dialog);
  try {
    const result2 = await admin.diagnostics();
    const quota = result2.quota ? `<pre>${escape(JSON.stringify(result2.quota, null, 2))}</pre>` : `<p>${t("quotaUnavailable")}</p>`;
    const status = result2.backend === "available" ? t("backendAvailable") : t("backendUnavailable");
    const imageAudit = store.state.catalogState?.syncMetadata?.imageAuditV7;
    const catalogImageAudit = store.state.catalogState?.syncMetadata?.catalogImageAuditV12;
    const imageAuditText = imageAudit?.pending ? t("imageAuditPending", { count: imageAudit.missingToyIds?.length || 0 }) : t("imageAuditComplete");
    const imageAuditStats = imageAudit ? t("imageAuditStats", { total: imageAudit.totalToyCount || 0, verified: imageAudit.verified || 0, restored: imageAudit.restored || 0, orphan: imageAudit.orphanImageCount || 0, missing: imageAudit.unrecoverableCount || 0 }) : "";
    const catalogImageAuditStats = catalogImageAudit ? t("catalogImageAuditStats", { total: catalogImageAudit.totalCatalogCount || 0, verified: catalogImageAudit.verifiedRealImage || 0, stable: catalogImageAudit.stableRemoteImage || 0, confirmed: catalogImageAudit.manuallyConfirmedImage || 0, placeholder: catalogImageAudit.placeholder || 0, broken: catalogImageAudit.broken || 0, remote: catalogImageAudit.remoteFetchFailure || 0, mismatch: catalogImageAudit.identityMismatch || 0, metadata: catalogImageAudit.missingMetadata || 0, missing: catalogImageAudit.noImage || 0 }) : "";
    const childAudit = store.state.catalogState?.syncMetadata?.parentChildReconciliationV12 || store.state.catalogState?.syncMetadata?.parentChildReconciliationV11 || store.state.catalogState?.syncMetadata?.parentChildReconciliationV10;
    const childAuditStats = childAudit ? t("parentChildAuditStats", { added: childAudit.added || 0, merged: childAudit.merged || 0, remapped: childAudit.remapped || 0 }) : "";
    const target = dialog.querySelector("#admin-diagnostics");
    if (target) target.innerHTML = `<b>${status}</b><p>${t("pendingSync", { count: result2.pendingDeletes.length })}</p><p>${escape(imageAuditText)}</p><p>${escape(imageAuditStats)}</p><p>${escape(catalogImageAuditStats)}</p><p>${escape(childAuditStats)}</p>${quota}`;
  } catch (error) {
    const target = dialog.querySelector("#admin-diagnostics");
    if (target) target.textContent = messageFor(error.message);
  }
}
function renderStructureDamageCandidate(candidate) {
  const parent = store.state.toys.find((toy) => toy.id === candidate.parentId);
  if (!parent) return "";
  return `<article class="panel structure-repair-candidate"><b>${escape(displayName(parent))}</b><p>${t("structureDamageCurrent", { children: candidate.currentChildCount })}</p><p>${t("structureDamageExpected", { children: candidate.expectedChildCount })}</p><p>${t("structureDamageNoDeletion")}</p><p>${t("structureDamageExplanation")}</p><small>${t("needsConfirmation")}</small><button class="primary" data-restore-structure-children="${escape(candidate.parentId)}">${t("restoreMissingChildren")}</button></article>`;
}
function candidateReviewSummaryTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} \xB7 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function renderLocalCandidateQueue(dialog, { returnToSettings = false, view: view2 = "needs" } = {}) {
  const activeRows = visibleCandidates(store.state);
  const rows = view2 === "archived" ? visibleCandidates(store.state, { archived: true }) : activeRows.filter((row) => view2 === "completed" ? ["approved", "linked", "rejected"].includes(row.reviewStatus) : ["pending", "reviewing"].includes(row.reviewStatus));
  dialog.innerHTML = `<section class="sheet" data-local-candidates-root><header><h2>Candidate Review (${pendingCandidateCount(store.state)})</h2><button type="button" data-local-back>\u2039</button><button type="button" data-close>\xD7</button></header><div class="candidate-review-filter-actions" aria-label="Candidate review filters"><button type="button" data-candidate-view="needs" ${view2 === "needs" ? "disabled" : ""}>${escape(t("candidateReviewNeedsReview"))}</button><button type="button" data-candidate-view="completed" ${view2 === "completed" ? "disabled" : ""}>${escape(t("candidateReviewCompleted"))}</button><button type="button" data-candidate-view="archived" ${view2 === "archived" ? "disabled" : ""}>${escape(t("candidateReviewArchived"))}</button></div><p class="candidate-review-help">Needs Review includes Pending and Reviewing.</p><div class="list candidate-review-list">${rows.map((row) => `<article class="panel candidate-review-card"><img class="candidate-review-thumbnail" data-image='${escapedJson(row.reviewAttachmentRef || { kind: "placeholder" })}' alt=""><div class="candidate-review-summary"><b class="candidate-review-name">${escape(row.productName || row.nameEn || row.proposedCanonicalKey)}</b><p class="candidate-review-meta"><span>${escape(row.brand || "Not provided")}</span><span>${escape(candidateReviewSummaryTime(row.createdAt))}</span><span>${escape(row.reviewStatus)}</span></p><button type="button" data-local-open="${escape(row.candidateId)}">${row.reviewStatus === "pending" ? "Start Review" : row.reviewStatus === "reviewing" ? "Continue Review" : "View Result"}</button></div></article>`).join("") || "<p>No local candidates.</p>"}</div></section>`;
  dialog.querySelector("[data-close]").onclick = () => dialog.close();
  dialog.querySelector("[data-local-back]").onclick = () => openManagerDashboard({ returnToSettings });
  dialog.querySelector("[data-local-candidates-root]").addEventListener("click", (event) => {
    const filter = event.target.closest("[data-candidate-view]");
    if (filter) return renderLocalCandidateQueue(dialog, { returnToSettings, view: filter.dataset.candidateView });
    const button = event.target.closest("[data-local-open]");
    if (!button || button.disabled) return;
    button.disabled = true;
    const id = button.dataset.localOpen;
    const current = localCandidates(store.state).find((row) => row.candidateId === id);
    try {
      if (current?.reviewStatus === "pending") store.update((state) => setLocalCandidateStatus(state, id, "reviewing"), "local-candidate-reviewing");
      refreshAdminCandidateBadges();
      renderCandidateReviewDetail(dialog, id, { returnToSettings, returnView: view2 });
    } catch (error) {
      button.disabled = false;
    }
  });
  bindImages(dialog);
}
function renderCandidateReviewDetail(dialog, id, { returnToSettings = false, returnView = "needs" } = {}) {
  const row = localCandidates(store.state).find((item) => item.candidateId === id);
  if (!row) return renderLocalCandidateQueue(dialog, { returnToSettings, view: returnView });
  const matches2 = catalog.active.filter((item) => canonicalKey(item.canonicalKey) === canonicalKey(row.proposedCanonicalKey) || `${item.brand} ${item.productName} ${(item.aliases || []).join(" ")}`.toLowerCase().includes(String(row.productName || "").toLowerCase())).slice(0, 5);
  const missing = (value) => value == null || value === "" ? "Not provided" : escape(Array.isArray(value) ? value.join(", ") : value);
  const resolved = ["approved", "linked", "rejected"].includes(row.reviewStatus);
  const reviewImageRef = row.reviewAttachmentRef;
  const reviewImage = reviewImageRef?.kind && reviewImageRef.kind !== "placeholder" ? `<img class="candidate-review-image-preview" data-candidate-review-preview data-image='${escapedJson(reviewImageRef)}' alt="${escape(t("candidateImageUnavailable"))}">` : `<div class="candidate-review-image-placeholder" data-candidate-review-placeholder role="img" aria-label="${escape(t("candidateImageUnavailable"))}">${escape(t("candidateImageUnavailable"))}</div>`;
  const history = (row.reviewHistory || []).map((item) => `<li>${escape(item.previousStatus)} \xB7 ${escape(candidateReviewSummaryTime(item.reviewedAt))}${item.linkedCanonicalKey ? ` \xB7 ${escape(item.linkedCanonicalKey)}` : ""}${item.resolutionReason ? ` \xB7 ${escape(item.resolutionReason)}` : ""}</li>`).join("");
  dialog.innerHTML = `<section class="sheet" data-candidate-detail><header><h2>Candidate Review \xB7 ${escape(row.reviewStatus)}</h2><button type="button" data-candidate-back>\u2039</button><button type="button" data-close>\xD7</button></header><div class="review-body">${reviewImage}<dl><dt>Brand</dt><dd>${missing(row.brand)}</dd><dt>Product Name</dt><dd>${missing(row.productName)}</dd><dt>Chinese Name</dt><dd>${missing(row.nameZh)}</dd><dt>English Name</dt><dd>${missing(row.nameEn)}</dd><dt>Aliases</dt><dd>${missing(row.aliases)}</dd><dt>Suggested Age</dt><dd>${missing(row.minAgeMonths)}\u2013${missing(row.maxAgeMonths)}</dd><dt>Category</dt><dd>${missing(row.categoryCode)}</dd><dt>Skills</dt><dd>${missing(row.skillCodes)}</dd><dt>Core Mechanism</dt><dd>${missing(row.playMechanics)}</dd><dt>Submission Source</dt><dd>${missing(row.source)}</dd><dt>Submitted At</dt><dd>${missing(row.createdAt)}</dd></dl><details><summary>Technical Details</summary><p>${escape(row.candidateId)} \xB7 ${escape(row.proposedCanonicalKey)} \xB7 ${escape(row.reviewAttachmentRef?.id || "Not provided")}</p></details>${history ? `<details data-candidate-review-history><summary>${escape(t("candidateReviewHistory"))}</summary><ul>${history}</ul></details>` : ""}<h3>Potential Existing Matches</h3>${matches2.map((item) => `<button type="button" data-candidate-target="${escape(item.canonicalKey)}">${escape(item.brand)} \xB7 ${escape(displayName(item))} \xB7 ${escape(item.canonicalKey)}</button>`).join("") || "<p>No likely matches</p>"}</div><footer>${resolved ? `<p>${escape(row.reviewStatus)} ${escape(row.resolutionReason || "")}</p>` : `<button type="button" data-candidate-action="approved">Approve New</button><button type="button" data-candidate-action="link">Link Existing</button><button type="button" data-candidate-action="rejected">Reject</button>`}</footer></section>`;
  if (resolved) dialog.querySelector("footer").insertAdjacentHTML("beforeend", `<button type="button" data-candidate-archive>${escape(t(row.archivedAt ? "candidateReviewUnarchive" : "candidateReviewArchive"))}</button><button type="button" data-candidate-reopen>${escape(t("candidateReviewReopen"))}</button>`);
  dialog.querySelector("[data-close]").onclick = () => dialog.close();
  dialog.querySelector("[data-candidate-back]").onclick = () => renderLocalCandidateQueue(dialog, { returnToSettings, view: returnView });
  let target = "";
  const detail = dialog.querySelector("[data-candidate-detail]");
  detail.addEventListener("click", (event) => {
    if (event.target.closest("[data-candidate-archive]")) {
      const wasArchived = Boolean(row.archivedAt);
      store.update((state) => wasArchived ? unarchiveLocalCandidate(state, id) : archiveLocalCandidate(state, id), wasArchived ? "local-candidate-unarchive" : "local-candidate-archive");
      return renderLocalCandidateQueue(dialog, { returnToSettings, view: wasArchived ? "completed" : returnView });
    }
    if (event.target.closest("[data-candidate-reopen]")) {
      if (!confirm(t("candidateReviewReopenConfirm"))) return;
      store.update((state) => reopenLocalCandidateReview(state, id), "local-candidate-reopen");
      refreshAdminCandidateBadges();
      return renderCandidateReviewDetail(dialog, id, { returnToSettings, returnView: "needs" });
    }
    const match = event.target.closest("[data-candidate-target]");
    if (match) {
      target = match.dataset.candidateTarget;
      return;
    }
    const button = event.target.closest("[data-candidate-action]");
    if (!button || button.disabled) return;
    if (button.dataset.candidateAction === "link" && !target) return;
    button.disabled = true;
    const status = button.dataset.candidateAction === "link" ? "linked" : button.dataset.candidateAction;
    store.update((state) => {
      const candidate = setLocalCandidateStatus(state, id, status);
      if (candidate && status === "rejected") {
        candidate.resolvedAt = (/* @__PURE__ */ new Date()).toISOString();
        candidate.resolutionReason = "Other";
      }
      if (candidate && status === "linked") candidate.linkedCanonicalKey = target;
    }, `local-candidate-${status}`);
    refreshAdminCandidateBadges();
    renderCandidateReviewDetail(dialog, id, { returnToSettings });
  });
  bindImages(dialog);
}
function renderRecognitionDiagnostic(diagnostics) {
  if (!diagnostics) return "";
  const status = diagnostics.httpStatus == null ? "\u2014" : diagnostics.httpStatus;
  const duration = Number.isFinite(diagnostics.durationMs) ? `${diagnostics.durationMs} ms` : "\u2014";
  const matched = diagnostics.catalogMatch ? `${diagnostics.catalogMatch.brand || ""} ${diagnostics.catalogMatch.productName || diagnostics.catalogMatch.canonicalKey}`.trim() : t("recognitionCatalogUnmatched");
  return `<details class="recognition-diagnostic"><summary>${t("recognitionDiagnostic")}</summary><p>${t("recognitionDiagnosticRequest", { id: diagnostics.clientRequestId || "\u2014", device: diagnostics.deviceIdPresent ? t("yes") : t("no") })}</p><p>${t("recognitionDiagnosticResponse", { status, duration, provider: diagnostics.provider || "\u2014", quota: formatDiagnosticValue(diagnostics.quota) })}</p><p>${t("recognitionDiagnosticCatalog", { result: matched })}</p></details>`;
}
function formatDiagnosticValue(value) {
  return value == null ? "\u2014" : typeof value === "object" ? escape(JSON.stringify(value)) : escape(String(value));
}
function renderIdentityConflict(match) {
  const personal = Boolean(match.a?.id && match.b?.id);
  return `<div class="panel"><b>${t(`identityKind.${match.kind}`)}</b><div class="duplicate-pair"><div>${duplicateToy(match.a)}${duplicateToy(match.b)}</div></div><small>${t("identityReason", { reason: match.reasons.join(", ") })}</small><p>${t("canonicalPair", { left: match.a.canonicalKey, right: match.b.canonicalKey })}</p><p>${t(match.kind === "same_child_legacy_duplicate" ? "sameChildImageProvenance" : "reviewIdentityEvidence")}</p>${personal ? `<button data-admin-open-personal-duplicates class="primary">${t("openDuplicateReview")}</button>` : ""}<button data-admin-ignore="${identityPairKey(match)}">${t("confirmNotDuplicate")}</button></div>`;
}
function identityPairKey(match) {
  return [match.a.id, match.b.id].sort().join("|");
}
function setIssueLabel(issue) {
  return issue.type === "parent_image_on_child" ? t("setIssueParentImage", { name: displayName(issue.child) }) : issue.type === "orphan_child" ? t("setIssueOrphan", { name: displayName(issue.child) }) : t("setIssueDuplicateChild", { name: displayName(issue.a) });
}
function refreshImageAudit(dialog) {
  const audit = store.state.catalogState?.syncMetadata?.imageAuditV7;
  const catalogAudit = store.state.catalogState?.syncMetadata?.catalogImageAuditV12;
  const target = dialog.querySelector("#admin-image-diagnostics");
  if (target) target.innerHTML = `${escape(audit ? t("imageAuditStats", { total: audit.totalToyCount || 0, verified: audit.verified || 0, restored: audit.restored || 0, orphan: audit.orphanImageCount || 0, missing: audit.unrecoverableCount || 0 }) : t("imageAuditPending", { count: 0 }))}<br>${escape(catalogAudit ? t("catalogImageAuditStats", { total: catalogAudit.totalCatalogCount || 0, verified: catalogAudit.verifiedRealImage || 0, stable: catalogAudit.stableRemoteImage || 0, confirmed: catalogAudit.manuallyConfirmedImage || 0, placeholder: catalogAudit.placeholder || 0, broken: catalogAudit.broken || 0, remote: catalogAudit.remoteFetchFailure || 0, mismatch: catalogAudit.identityMismatch || 0, metadata: catalogAudit.missingMetadata || 0, missing: catalogAudit.noImage || 0 }) : t("catalogImageAuditPending"))}`;
}
async function openCatalogGovernance() {
  if (!admin.enabled) return;
  const dialog = openModal(`<section class="sheet"><header><h2>Catalog Governance</h2><button data-close>\xD7</button></header><p>Loading\u2026</p></section>`);
  await renderGovernanceList(dialog);
}
async function renderGovernanceList(dialog, preservedScroll = 0) {
  let info;
  try {
    info = await admin.governance();
  } catch (error) {
    dialog.querySelector(".sheet").innerHTML = `<header><h2>Catalog Governance</h2><button data-close>\xD7</button></header><p>${escape(messageFor(error.message))}</p>`;
    return;
  }
  const candidateRow = (row) => `<article class="panel governance-row">${candidateReviewThumbnail(row)}<div><b>${escape(row.nameEn || row.proposedCanonicalKey)}</b><p>${escape(row.brand || "")} \xB7 ${escape(row.candidateType || "")} \xB7 ${escape(row.status)}</p><button data-governance-open="candidate:${escape(row.candidateId)}">Open</button></div></article>`;
  const reportRow = (row) => `<article class="panel governance-row"><div><b>${escape(row.canonicalKey || "")}</b><p>${escape(row.reportType || "")} \xB7 ${escape(row.status)}</p><button data-governance-open="report:${escape(row.reportId)}">Open</button></div></article>`;
  const pending = (info.pending || []).map((row) => `<article class="panel"><b>v${escape(row.version)}</b> \xB7 ${escape(row.change?.type || "")} \xB7 ${escape(row.change?.canonicalKey || "")}<p>${escape(row.status)} ${escape(row.lastError || "")}</p><button data-governance-retry="${escape(row.change?.mutationId || "")}">Retry</button></article>`).join("") || "<p>0</p>";
  dialog.innerHTML = `<section class="sheet"><header><h2>Catalog Governance</h2><button data-close>\xD7</button></header><p>Remote Catalog Version: ${escape(info.version ?? "\u2014")}</p><h3>Pending materializations (${info.pending?.length || 0})</h3>${pending}<h3>Candidates (${info.candidateUnread})</h3><div data-governance-candidates>${(info.candidates || []).map(candidateRow).join("") || "<p>None</p>"}</div><h3>Reports (${info.reportUnread})</h3><div data-governance-reports>${(info.reports || []).map(reportRow).join("") || "<p>None</p>"}</div></section>`;
  dialog.querySelectorAll("[data-close]").forEach((button) => button.onclick = () => dialog.close());
  dialog.querySelectorAll("[data-governance-open]").forEach((button) => button.onclick = () => {
    const [kind, id] = button.dataset.governanceOpen.split(":");
    renderGovernanceDetail(dialog, kind, id, info);
  });
  dialog.querySelectorAll("[data-governance-retry]").forEach((button) => button.onclick = async () => {
    const scroll = dialog.querySelector(".sheet")?.scrollTop || 0;
    await admin.retryMaterialization(button.dataset.governanceRetry);
    await renderGovernanceList(dialog, scroll);
  });
  void bindImages(dialog);
  const scroller = dialog.querySelector(".sheet");
  if (scroller) scroller.scrollTop = preservedScroll;
}
function candidateReviewThumbnail(row) {
  return row.imageConsent === true && row.referenceImage && row.imageReviewStatus !== "rejected" ? `<img class="governance-thumbnail" src="${escape(row.referenceImage)}" alt="Submitted review image">` : `<div class="governance-thumbnail placeholder">No review image submitted</div>`;
}
function candidateReviewDetail(row) {
  const reviewImage = row.imageConsent === true && row.referenceImage && row.imageReviewStatus !== "rejected" ? `<img class="governance-review-image" src="${escape(row.referenceImage)}" alt="Submitted review image">` : `<p>No review image submitted.</p>`;
  return `${reviewImage}<dl class="governance-metadata"><dt>Brand</dt><dd>${escape(row.brand || "\u2014")}</dd><dt>English name</dt><dd>${escape(row.nameEn || "\u2014")}</dd><dt>Chinese name</dt><dd>${escape(row.nameZh || "\u2014")}</dd><dt>SKU / model</dt><dd>${escape(row.sku || "\u2014")}</dd><dt>Age</dt><dd>${escape(`${row.minAgeMonths ?? "\u2014"}\u2013${row.maxAgeMonths ?? "\u2014"} months`)}</dd><dt>Category</dt><dd>${escape(row.categoryCode || "\u2014")}</dd><dt>Skills</dt><dd>${escape((row.skillCodes || []).join(", ") || "\u2014")}</dd><dt>Core mechanism</dt><dd>${escape((row.playMechanics || []).join(", ") || "\u2014")}</dd><dt>Candidate type</dt><dd>${escape(row.candidateType || "\u2014")}</dd><dt>Recognition confidence</dt><dd>${escape(row.recognitionConfidence ?? "\u2014")}</dd><dt>Image consent</dt><dd>${row.imageConsent === true ? "Submitted for review" : "Not submitted"}</dd><dt>Submission source</dt><dd>${escape(row.appVersion || "Toy Library recognition")}</dd></dl>`;
}
function renderGovernanceDetail(dialog, kind, id, info) {
  const row = (kind === "candidate" ? info.candidates : info.reports).find((x) => (x.candidateId || x.reportId) === id);
  if (!row) return renderGovernanceList(dialog);
  const isCandidate = kind === "candidate";
  const candidates = catalog.active.filter((item) => item.canonicalKey !== row.proposedCanonicalKey).slice(0, 250).map((item) => `<option value="${escape(item.canonicalKey)}">${escape(brandLabel(item.brand))} \xB7 ${escape(displayName(item))}</option>`).join("");
  const body = isCandidate ? `${candidateReviewDetail(row)}<p id="governance-action-error"></p><div class="governance-actions"><button id="gov-review">Mark Reviewing</button><label>Link to existing Catalog item<select id="gov-target"><option value="">Select item</option>${candidates}</select></label><button id="gov-link">Link to Existing</button><button id="gov-approve-image" class="primary" ${row.imageConsent === true && row.referenceImage && row.imageReviewStatus !== "rejected" ? "" : "disabled"}>Approve + Use This Image</button><button id="gov-approve-other">Approve Product, Find Another Image</button><button id="gov-reject-image" ${row.imageConsent === true && row.referenceImage && row.imageReviewStatus !== "rejected" ? "" : "disabled"}>Reject Image</button><button id="gov-research-image">Research Image</button><button id="gov-upload-replacement">Upload Replacement</button><button id="gov-reject">Reject Candidate</button></div><div id="gov-research-result"></div>` : `<pre>${escape(JSON.stringify(row, null, 2))}</pre><p id="governance-action-error"></p><button id="gov-review">Mark Reviewing</button><button id="gov-open-catalog">Open Catalog Item</button><button id="gov-resolve" class="primary">Resolve</button><button id="gov-reject">Reject</button>`;
  dialog.innerHTML = `<section class="sheet"><header><h2>${isCandidate ? "Candidate" : "Report"}</h2><button data-governance-back>\u2039</button><button data-close>\xD7</button></header>${body}</section>`;
  dialog.querySelector("[data-close]").onclick = () => dialog.close();
  dialog.querySelector("[data-governance-back]").onclick = () => renderGovernanceList(dialog);
  const run = async (action2) => {
    try {
      if (isCandidate) {
        const target = dialog.querySelector("#gov-target")?.value || "";
        await admin.reviewCandidate(id, action2, target);
      } else await admin.reviewReport(id, action2);
      await renderGovernanceList(dialog);
    } catch (error) {
      dialog.querySelector("#governance-action-error").textContent = messageFor(error.message);
    }
  };
  dialog.querySelector("#gov-review").onclick = () => run("reviewing");
  dialog.querySelector("#gov-reject").onclick = () => run("reject");
  if (isCandidate) {
    dialog.querySelector("#gov-link").onclick = () => run("link_existing");
    dialog.querySelector("#gov-approve-image").onclick = async () => {
      try {
        await admin.reviewCandidate(id, "accept_new", "", null, { useReviewImage: true });
        await renderGovernanceList(dialog);
      } catch (error) {
        dialog.querySelector("#governance-action-error").textContent = messageFor(error.message);
      }
    };
    dialog.querySelector("#gov-approve-other").onclick = () => renderCandidateAcceptEditor(dialog, row, { useReviewImage: false });
    dialog.querySelector("#gov-upload-replacement").onclick = () => renderCandidateAcceptEditor(dialog, row, { useReviewImage: false, allowReplacement: true });
    dialog.querySelector("#gov-reject-image").onclick = () => run("reject_image");
    dialog.querySelector("#gov-research-image").onclick = async () => {
      try {
        const result2 = await admin.researchCandidateImage(row);
        const target = dialog.querySelector("#gov-research-result");
        target.innerHTML = (result2.candidates || []).map((item) => `<article class="panel"><img class="governance-review-image" src="${escape(item.imageUrl)}" alt="Research candidate"><p>${escape(item.sourcePage || item.sourceUrl || item.imageUrl || "")}</p><small>${escape(item.sourceType || "")}</small></article>`).join("") || "<p>No reliable image candidate found.</p>";
      } catch (error) {
        dialog.querySelector("#governance-action-error").textContent = messageFor(error.message);
      }
    };
  } else {
    dialog.querySelector("#gov-resolve").onclick = () => run("resolved");
    dialog.querySelector("#gov-open-catalog").onclick = () => openCatalogManager(row.canonicalKey);
  }
}
function renderCandidateAcceptEditor(dialog, candidate, { useReviewImage = false, allowReplacement = false } = {}) {
  dialog.innerHTML = `<form class="form"><header><h2>Create New Catalog Item</h2><button type="button" data-governance-back>\u2039</button><button type="button" data-close>\xD7</button></header><label>Canonical key<input name="canonicalKey" value="${escape(candidate.proposedCanonicalKey)}"></label><label>Brand<input name="brand" value="${escape(candidate.brand || "")}"></label><label>English name<input name="productName" value="${escape(candidate.nameEn || "")}"></label><label>Chinese name<input name="nameZh" value="${escape(candidate.nameZh || "")}"></label><label>SKU/model<input name="sku" value="${escape(candidate.sku || "")}"></label>${allowReplacement ? '<label>Upload Replacement<input name="replacementImage" type="file" accept="image/jpeg,image/png,image/webp"></label>' : ""}<button class="primary">Save and accept</button><p id="candidate-accept-error"></p></form>`;
  dialog.querySelector("[data-close]").onclick = () => dialog.close();
  dialog.querySelector("[data-governance-back]").onclick = () => renderGovernanceDetail(dialog, "candidate", candidate.candidateId, { candidates: [candidate], reports: [] });
  dialog.querySelector("form").onsubmit = async (event) => {
    event.preventDefault();
    const values = new FormData(event.target);
    try {
      const replacement = values.get("replacementImage");
      const replacementImage = replacement?.size ? await fileToDataUrl2(replacement) : null;
      await admin.reviewCandidate(candidate.candidateId, "accept_new", "", { canonicalKey: values.get("canonicalKey"), brand: values.get("brand"), productName: values.get("productName"), nameZh: values.get("nameZh"), sku: values.get("sku") }, { useReviewImage, replacementImage });
      await renderGovernanceList(dialog);
    } catch (error) {
      dialog.querySelector("#candidate-accept-error").textContent = messageFor(error.message);
    }
  };
}
function openAdminInSettings(dialog) {
  const host = dialog.querySelector("#admin-settings");
  if (!host) return;
  host.innerHTML = `<label>${t("adminPassword")}<input id="admin-password" type="password" autocomplete="current-password"></label><button type="button" id="admin-sign-in" class="primary">${t("signIn")}</button><p id="admin-error"></p>`;
  host.querySelector("#admin-sign-in").onclick = async () => {
    try {
      await admin.signIn(host.querySelector("#admin-password").value);
      host.innerHTML = `<p role="status">${t("adminMode")}</p><button type="button" id="manager-open">${t("managerDashboard")} <span class="badge">${pendingCandidateCount(store.state)}</span></button><button type="button" id="admin-open">${t("signOut")}</button>`;
      host.querySelector("#manager-open").onclick = () => openAdminWorkspaceInSettings(dialog);
      host.querySelector("#admin-open").onclick = () => {
        admin.signOut();
        openSettings();
      };
    } catch (error) {
      host.querySelector("#admin-error").textContent = messageFor(error.message);
    }
  };
}
function traceAdminWorkspace(stage, detail = {}) {
  const trace = window.__TOY_ROTATION_ADMIN_WORKSPACE_TRACE__ ||= [];
  trace.push({ stage, detail, at: (/* @__PURE__ */ new Date()).toISOString() });
  if (trace.length > 40) trace.splice(0, trace.length - 40);
}
function adminNeedsReviewCount() {
  return getNeedsReviewCount(store.state);
}
function renderAdminWorkspaceBody(dialog, { onBack, onClose }) {
  dialog.__adminWorkspaceCallbacks = { onBack, onClose };
  dialog.innerHTML = `<section class="sheet admin-workspace-root" data-admin-workspace-root><header><h2>${t("managerDashboard")}</h2><button type="button" data-workspace-back>\u2039</button><button type="button" data-workspace-close>\xD7</button></header><p role="status">Needs Review: <span data-admin-pending-badge>${adminNeedsReviewCount()}</span></p><section class="panel"><h3>Candidate Review</h3><p>Pending / Reviewing (${pendingCandidateCount(store.state)})</p><button type="button" id="workspace-local-candidates" class="primary">Candidate Review</button></section><section class="panel"><h3>Reported Issues</h3><p>Pending / Reviewing (${getPendingCatalogReports(store.state).length})</p><button type="button" id="workspace-reports" class="primary">Reported Issues</button></section><button type="button" id="workspace-governance">Catalog Governance</button></section>`;
  dialog.querySelector("[data-workspace-back]").onclick = onBack;
  dialog.querySelector("[data-workspace-close]").onclick = onClose;
  dialog.querySelector("#workspace-local-candidates").onclick = () => renderLocalCandidateQueue(dialog, { returnToSettings: true });
  dialog.querySelector("#workspace-reports").onclick = () => renderReportedIssuesQueue(dialog, { onBack, onClose });
  dialog.querySelector("#workspace-governance").onclick = () => renderAdminGovernanceChild({ dialog, loadGovernance: () => admin.governance(), onReturn: () => renderAdminWorkspaceBody(dialog, { onBack, onClose }) });
}
function renderReportedIssuesQueue(dialog, { onBack, onClose }) {
  const rows = getCatalogReports(store.state);
  dialog.innerHTML = `<section class="sheet" data-report-queue><header><h2>Reported Issues (${getPendingCatalogReports(store.state).length})</h2><button type="button" data-report-back>\u2039</button><button type="button" data-close>\xD7</button></header><div class="list">${rows.map((report) => `<article class="panel"><b>${escape(report.catalogCanonicalKey || "Catalog item unavailable")}</b><p>${escape(report.issueType)} \xB7 ${escape(report.createdAt)} \xB7 ${escape(report.status)}</p><button type="button" data-report-open="${escape(report.id)}">${report.status === "pending" ? "Start Review" : report.status === "reviewing" ? "Continue Review" : "View Result"}</button></article>`).join("") || "<p>No reported issues.</p>"}</div></section>`;
  dialog.querySelector("[data-close]").onclick = () => dialog.close();
  dialog.querySelector("[data-report-back]").onclick = () => renderAdminWorkspaceBody(dialog, { onBack, onClose });
  dialog.querySelector("[data-report-queue]").addEventListener("click", (event) => {
    const button = event.target.closest("[data-report-open]");
    if (!button || button.disabled) return;
    button.disabled = true;
    const report = getCatalogReportById(store.state, button.dataset.reportOpen);
    if (report?.status === "pending") store.update((state) => startCatalogReportReview(state, report.id), "catalog-report-reviewing");
    refreshAdminCandidateBadges();
    renderReportReviewDetail(dialog, button.dataset.reportOpen, { onBack, onClose });
  });
}
function renderReportReviewDetail(dialog, id, { onBack, onClose }) {
  const report = getCatalogReportById(store.state, id);
  if (!report) return renderReportedIssuesQueue(dialog, { onBack, onClose });
  const item = catalog.getByKey(report.catalogCanonicalKey);
  const resolved = ["resolved", "dismissed"].includes(report.status);
  dialog.innerHTML = `<section class="sheet" data-report-detail><header><h2>Reported Issue \xB7 ${escape(report.status)}</h2><button type="button" data-report-detail-back>\u2039</button><button type="button" data-close>\xD7</button></header><div class="review-body"><h3>User Report</h3><p>${escape(report.issueType)}</p><p>${escape(report.note || "Not provided")}</p><p>${escape(report.createdAt)} \xB7 ${escape(report.id)}</p><img data-image='${escapedJson(report.attachmentRef || { kind: "placeholder" })}' alt="Image unavailable"><h3>Reported Catalog Item</h3>${item ? `<p>${escape(item.brand)} \xB7 ${escape(displayName(item))}</p><p>${escape(item.canonicalKey)}</p>` : `<p>Catalog item unavailable \xB7 ${escape(report.catalogCanonicalKey)}</p>`}</div><footer>${resolved ? `<p>${escape(report.status)} \xB7 ${escape(report.resolutionReason || "")}</p>` : `${item ? '<button type="button" data-report-action="edit">Edit Catalog Item</button>' : ""}<button type="button" data-report-action="resolve">Resolve</button><button type="button" data-report-action="dismiss">Dismiss</button>`}</footer></section>`;
  dialog.querySelector("[data-close]").onclick = () => dialog.close();
  dialog.querySelector("[data-report-detail-back]").onclick = () => renderReportedIssuesQueue(dialog, { onBack, onClose });
  dialog.querySelector("[data-report-detail]").addEventListener("click", (event) => {
    const button = event.target.closest("[data-report-action]");
    if (!button || button.disabled) return;
    button.disabled = true;
    if (button.dataset.reportAction === "edit") {
      dialog.close();
      openCatalogManager(report.catalogCanonicalKey);
      return;
    }
    store.update((state) => button.dataset.reportAction === "resolve" ? resolveCatalogReport(state, id) : dismissCatalogReport(state, id), "catalog-report-resolution");
    refreshAdminCandidateBadges();
    renderReportReviewDetail(dialog, id, { onBack, onClose });
  });
  bindImages(dialog);
}
function refreshAdminCandidateBadges() {
  const count4 = adminNeedsReviewCount();
  recognitionDeviceDiagnostic.badge("requested", { pendingCandidateCount: count4 });
  recognitionDeviceDiagnostic.pendingSelector(store.state, { surface: "admin_badge" });
  recognitionDeviceDiagnostic.badge("started", { pendingCandidateCount: count4 });
  document.querySelectorAll("[data-admin-pending-badge]").forEach((node) => node.textContent = String(count4));
  recognitionDeviceDiagnostic.badge("completed", { pendingCandidateCount: count4 });
  const trace = window.__TOY_ROTATION_CANDIDATE_TRACE__ ||= [];
  trace.push({ stage: "badge_rendered", detail: { pending_count: count4 }, at: (/* @__PURE__ */ new Date()).toISOString() });
  if (trace.length > 80) trace.splice(0, trace.length - 80);
}
store.subscribe(() => refreshAdminCandidateBadges());
document.addEventListener("click", (event) => {
  const button = event.target.closest?.('[data-report-action="edit"]');
  const dialog = button?.closest("dialog");
  if (!button || !dialog?.querySelector("[data-report-detail]")) return;
  const report = getCatalogReports(store.state).find((entry) => dialog.textContent.includes(entry.id));
  const callbacks = dialog.__adminWorkspaceCallbacks;
  if (!report || !callbacks) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  openCatalogManager(report.catalogCanonicalKey, { dialog, onReturn: () => renderReportReviewDetail(dialog, report.id, callbacks) });
}, true);
function openAdminWorkspaceInSettings(dialog) {
  const controller = createAdminWorkspaceController({
    dialog,
    getAdminAuthenticated: () => admin.enabled,
    getPendingCount: () => pendingCandidateCount(store.state),
    renderSettings: (callbacks) => restoreSettingsFromWorkspace(dialog, callbacks),
    renderWorkspace: (callbacks) => renderAdminWorkspaceBody(dialog, callbacks),
    closeSettingsDialog: () => dialog.close(),
    trace: traceAdminWorkspace
  });
  return controller.open();
}
function restoreSettingsFromWorkspace(dialog, { onOpenWorkspace, onClose } = {}) {
  if (!dialog?.open || !dialog.__settingsBody) return;
  dialog.innerHTML = dialog.__settingsBody;
  dialog.__settingsView = "settings";
  dialog.querySelectorAll("[data-close]").forEach((button) => button.onclick = onClose || (() => dialog.close()));
  dialog.querySelector("#manager-open")?.addEventListener("click", onOpenWorkspace || (() => openAdminWorkspaceInSettings(dialog)));
  dialog.querySelector("#admin-open")?.addEventListener("click", () => admin.enabled ? (admin.signOut(), openSettings()) : openAdminInSettings(dialog));
}
async function bindImages(scope = document) {
  const targets = [...scope.querySelectorAll("img[data-image]")];
  runtimeImageDiagnostics.mark("bind_images_start", { targetCount: targets.length, runtimeToyImageCount: targets.filter((image) => image.dataset.runtimeImageToyId).length });
  await Promise.all(targets.map(async (image) => {
    if (image.closest("[data-candidate-detail]")) image.classList.add("candidate-review-image-preview");
    image.loading = "lazy";
    image.decoding = "async";
    const toyId = image.dataset.runtimeImageToyId || null;
    let rendererImageRef = null;
    try {
      rendererImageRef = JSON.parse(image.dataset.image);
    } catch {
    }
    const record = (state, error = null) => runtimeImageDiagnostics.recordDom({ toyId, rendererImageRef, src: image.getAttribute("src"), currentSrc: image.currentSrc || image.src, complete: image.complete, naturalWidth: image.naturalWidth, state, error });
    if (toyId) {
      image.addEventListener("load", () => record("loaded"), { once: true });
      image.addEventListener("error", () => record("error", "image_element_error"), { once: true });
    }
    try {
      const resolvedImage = await images.resolve(rendererImageRef);
      if (!resolvedImage && replaceCandidateReviewPreviewWithUnavailable(image)) {
        record("unavailable");
        return;
      }
      image.src = resolvedImage || "./icons/icon-192.png";
      record("assigned");
    } catch (error) {
      if (replaceCandidateReviewPreviewWithUnavailable(image)) {
        record("resolve_error", error?.message || String(error));
        return;
      }
      image.src = "./icons/icon-192.png";
      record("resolve_error", error?.message || String(error));
    }
  }));
  runtimeImageDiagnostics.mark("bind_images_complete", { targetCount: targets.length, runtimeToyImageCount: targets.filter((image) => image.dataset.runtimeImageToyId).length });
}
function replaceCandidateReviewPreviewWithUnavailable(image) {
  if (!image.matches("[data-candidate-review-preview]")) return false;
  const placeholder = document.createElement("div");
  placeholder.className = "candidate-review-image-placeholder";
  placeholder.dataset.candidateReviewPlaceholder = "";
  placeholder.setAttribute("role", "img");
  placeholder.setAttribute("aria-label", t("candidateImageUnavailable"));
  placeholder.textContent = t("candidateImageUnavailable");
  image.replaceWith(placeholder);
  return true;
}
function applyTheme() {
  const configured = store.state.settings.theme;
  document.documentElement.dataset.theme = configured === "system" ? matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : configured;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
}
function childAgeMonths2() {
  return childAgeMonths(store.state.profile.childBirthDate);
}
function libraryImageRef(toy, phase = "renderer") {
  const parent = toy?.set?.kind === "child" ? store.state.toys.find((item) => item.id === toy.set.parentId) : null;
  return runtimeImageDiagnostics.traceResolution(toy, { phase, catalog, parentImageRef: parent?.imageRef || null, resolve: (catalogView, parentImageRef) => resolvedLibraryImageRef(toy, catalogView, parentImageRef) });
}
function captureLoveveryImageSweep(phase) {
  const children = store.state.toys.filter((toy) => toy?.set?.kind === "child" && /lovevery/i.test(`${toy.brand || ""} ${toy.set?.parentCanonicalKey || ""} ${toy.canonicalKey || ""}`));
  for (const toy of children) libraryImageRef(toy, phase);
  runtimeImageDiagnostics.mark("lovevery_image_sweep", { phase, childCount: children.length, activeCatalogCount: catalog.active.length });
}
function displayName(toy) {
  return i18n.language === "zh" ? toy.names?.zh || toy.productName : toy.names?.en || toy.productName;
}
function brandLabel(brand) {
  return brand === "other_unspecified" ? t("otherUnspecified") : brand;
}
function mechanicLabel(code) {
  const key = `mechanic.${code}`;
  const translated = t(key);
  return localizePlayMechanism(code, i18n.language) || (translated === key ? t("unregisteredPlayMechanism") : translated);
}
function t(key, params) {
  return i18n.t(key, params);
}
function messageFor(code) {
  const value = t(code);
  return value === code ? code : value;
}
function capitalize(value) {
  return String(value || "").slice(0, 1).toUpperCase() + String(value || "").slice(1);
}
function escapedJson(value) {
  return escape(JSON.stringify(value));
}
function escape(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}
function fileToDataUrl2(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function downloadJson(value, name) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function auditFilenameStamp(date = /* @__PURE__ */ new Date()) {
  return date.toISOString().slice(0, 16).replace(/-/g, "").replace("T", "-").replace(":", "");
}
