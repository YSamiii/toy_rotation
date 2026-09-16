import { classifyCatalogImage, IMAGE_USABILITY } from '../domain/catalog-image-usability.js';
import { currentShelfCollections, isUserCustomPermanent } from '../domain/rotation-engine.js';

// Produces a new, whitelisted document only: no state mutation, image bytes,
// image references, notes, or private profile data leave the runtime state.
export const TOY_IMAGE_AUDIT_VERSION = 'v0.11.6';
const PRIORITY_BRANDS = new Set(['mideer', 'cherry-pick', 'learning resources', 'lego / duplo', 'lego duplo']);
const USABLE = new Set(['VERIFIED_PACKAGED', 'VERIFIED_REMOTE', 'CATALOG_IDB', 'PERSONAL_IMAGE']);

export function buildToyImageAudit({ state = {}, catalog, build = {}, generatedAt = new Date().toISOString() } = {}) {
  const catalogRows = Array.isArray(catalog) ? catalog : catalog?.active || [];
  const resolve = reference => catalog?.resolve?.(reference) || resolveFromRows(reference, catalogRows);
  const catalogStates = catalogRows.map(item => imageState(item.imageRef));
  const owned = buildOwned(state.toys || [], resolve, state);
  const wishlist = buildWishlist(state.wishlist || [], resolve);
  return {
    auditVersion:TOY_IMAGE_AUDIT_VERSION, buildId:text(build.buildId), generatedAt,
    catalog:{ visibleCatalogTotal:catalogRows.length, usableImageCount:catalogStates.filter(usable).length, placeholderCount:catalogStates.filter(state => state === 'PLACEHOLDER_ONLY').length, packagedImageCount:catalogStates.filter(state => state === 'VERIFIED_PACKAGED').length, remoteImageCount:catalogStates.filter(state => state === 'VERIFIED_REMOTE').length, catalogIdbImageCount:catalogStates.filter(state => state === 'CATALOG_IDB').length, structuralCoverage:coverage(catalogStates.filter(usable).length, catalogRows.length) },
    owned, wishlist, priorityMissing:priorityRows(owned.items, wishlist.items)
  };
}

function buildOwned(toys, resolve, state) {
  const shelf = currentShelfCollections(state);
  const shelfIds = new Set([...shelf.rotationIds, ...shelf.permanentIds, ...shelf.manualIds]);
  const items = toys.map(toy => {
    const catalog = resolve(toy); if (!catalog) return null;
    const catalogImageState = imageState(catalog.imageRef);
    const hasPersonalImage = toy.imageRef?.kind === 'personal';
    const state = hasPersonalImage ? 'PERSONAL_IMAGE' : catalogImageState;
    return { personalToyId:text(toy.id), canonicalKey:text(catalog.canonicalKey), catalogId:text(catalog.id), brand:text(catalog.brand), name:text(catalog.productName), imageState:state, imageSourceType:sourceType(state), hasPersonalImage, catalogImageState, catalogImageMissing:!usable(catalogImageState), userVisibleImageMissing:!usable(state), currentShelfState:shelfIds.has(toy.id) ? 'CURRENT_SHELF' : 'NOT_CURRENT_SHELF', permanentState:isUserCustomPermanent(toy) ? 'USER_PERMANENT' : 'NOT_USER_PERMANENT' };
  }).filter(Boolean);
  return summary(toys.length, items, true);
}

function buildWishlist(wishlist, resolve) {
  const items = wishlist.map(wish => {
    const catalog = resolve(wish); if (!catalog) return null;
    const state = imageState(catalog.imageRef);
    return { wishlistItemId:text(wish.id), canonicalKey:text(catalog.canonicalKey), catalogId:text(catalog.id), brand:text(catalog.brand), name:text(catalog.productName), exactIdentity:Boolean(catalog.exactTitle || catalog.sku || catalog.setNumber || catalog.variantId), variant:nullable(catalog.variantName || catalog.variantId), setNumber:nullable(catalog.setNumber), sku:nullable(catalog.sku), imageState:state, imageSourceType:sourceType(state), catalogImageMissing:!usable(state), userVisibleImageMissing:!usable(state) };
  }).filter(Boolean);
  return summary(wishlist.length, items, false);
}

function summary(total, items, owned) {
  const states = items.map(item => item.imageState);
  const result = { total, mappedToCatalog:items.length, usableImage:states.filter(usable).length, placeholderOnly:states.filter(state => state === 'PLACEHOLDER_ONLY').length, missingImage:states.filter(state => !usable(state) && state !== 'PLACEHOLDER_ONLY').length, packagedImage:states.filter(state => state === 'VERIFIED_PACKAGED').length, remoteImage:states.filter(state => state === 'VERIFIED_REMOTE').length, coverage:coverage(states.filter(usable).length, items.length), items };
  return owned ? { ...result, personalImage:states.filter(state => state === 'PERSONAL_IMAGE').length } : result;
}

function priorityRows(owned, wishlist) {
  const rows = [...owned.filter(item => item.userVisibleImageMissing).map(item => ({ source:'owned', ...item, priorityBand:item.currentShelfState === 'CURRENT_SHELF' ? 'P0' : 'P1' })), ...wishlist.filter(item => item.userVisibleImageMissing).map(item => ({ source:'wishlist', ...item, priorityBand:'P2' }))]
    .map(item => ({ source:item.source, canonicalKey:item.canonicalKey, brand:item.brand, name:item.name, currentImageState:item.imageState, priorityBand:item.priorityBand, exactIdentityAvailable:item.source === 'wishlist' ? (item.exactIdentity ? 'YES' : 'NO') : 'YES', priorityBrand:PRIORITY_BRANDS.has(item.brand.toLowerCase()) }));
  const rank = {P0:0,P1:1,P2:2};
  return rows.sort((left,right) => rank[left.priorityBand]-rank[right.priorityBand] || Number(right.priorityBrand)-Number(left.priorityBrand) || left.canonicalKey.localeCompare(right.canonicalKey));
}

function imageState(ref) {
  if (ref?.kind === 'catalog') return 'CATALOG_IDB';
  const classification = classifyCatalogImage(ref);
  return ({ [IMAGE_USABILITY.VERIFIED_PACKAGED_IMAGE]:'VERIFIED_PACKAGED', [IMAGE_USABILITY.VERIFIED_REMOTE_IMAGE]:'VERIFIED_REMOTE', [IMAGE_USABILITY.VERIFIED_USABLE_IMAGE]:'PERSONAL_IMAGE', [IMAGE_USABILITY.PLACEHOLDER_ONLY]:'PLACEHOLDER_ONLY', [IMAGE_USABILITY.IMAGE_SOURCE_UNVERIFIED]:'IMAGE_SOURCE_UNVERIFIED', [IMAGE_USABILITY.KNOWN_BROKEN_IMAGE]:'KNOWN_BROKEN', [IMAGE_USABILITY.NO_IMAGE]:'NO_IMAGE' })[classification] || 'NO_IMAGE';
}
function sourceType(state) { return ({VERIFIED_PACKAGED:'packaged',VERIFIED_REMOTE:'remote',CATALOG_IDB:'catalog_idb',PERSONAL_IMAGE:'personal',PLACEHOLDER_ONLY:'placeholder',IMAGE_SOURCE_UNVERIFIED:'unverified',KNOWN_BROKEN:'broken',NO_IMAGE:'none'})[state]; }
function usable(state) { return USABLE.has(state); }
function coverage(numerator, denominator) { return denominator ? Number((numerator / denominator).toFixed(4)) : 0; }
function text(value) { return String(value || ''); }
function nullable(value) { const result=text(value); return result || null; }
function resolveFromRows(reference, rows) { const keys=[reference?.canonicalKey,reference?.catalogKey,reference?.catalogId].filter(Boolean).map(String); return rows.find(row => keys.includes(String(row.canonicalKey)) || keys.includes(String(row.id))) || null; }
