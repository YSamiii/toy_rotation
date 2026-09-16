// Read-only image classification and coverage accounting. It deliberately does
// not mutate Catalog, Wishlist, Library, or image storage.
export const IMAGE_USABILITY = Object.freeze({
  VERIFIED_USABLE_IMAGE:'VERIFIED_USABLE_IMAGE', VERIFIED_PACKAGED_IMAGE:'VERIFIED_PACKAGED_IMAGE', VERIFIED_REMOTE_IMAGE:'VERIFIED_REMOTE_IMAGE',
  PLACEHOLDER_ONLY:'PLACEHOLDER_ONLY', IMAGE_SOURCE_UNVERIFIED:'IMAGE_SOURCE_UNVERIFIED', KNOWN_BROKEN_IMAGE:'KNOWN_BROKEN_IMAGE', NO_IMAGE:'NO_IMAGE'
});

export function classifyCatalogImage(ref) {
  if (!ref) return IMAGE_USABILITY.NO_IMAGE;
  if (ref.kind === 'personal') return IMAGE_USABILITY.VERIFIED_USABLE_IMAGE;
  if (ref.kind === 'generated' || ref.kind === 'placeholder') return IMAGE_USABILITY.PLACEHOLDER_ONLY;
  if (ref.assetState === 'known_broken' || ref.verificationStatus === 'known_broken') return IMAGE_USABILITY.KNOWN_BROKEN_IMAGE;
  if (ref.kind === 'packaged' && ref.verificationStatus === 'verified_real' && ref.contentHash && ref.mimeType) return IMAGE_USABILITY.VERIFIED_PACKAGED_IMAGE;
  if (ref.kind === 'remote' && ['verified_real','manually_confirmed'].includes(ref.verificationStatus)) return IMAGE_USABILITY.VERIFIED_REMOTE_IMAGE;
  if (ref.kind === 'remote' || ref.imageSource) return IMAGE_USABILITY.IMAGE_SOURCE_UNVERIFIED;
  return IMAGE_USABILITY.NO_IMAGE;
}

export function isUsableCatalogImage(ref) {
  return [IMAGE_USABILITY.VERIFIED_USABLE_IMAGE, IMAGE_USABILITY.VERIFIED_PACKAGED_IMAGE, IMAGE_USABILITY.VERIFIED_REMOTE_IMAGE].includes(classifyCatalogImage(ref));
}

export function imageCoverage(rows = [], catalog = []) {
  const byKey = catalog instanceof Map ? catalog : new Map((catalog || []).map(item => [String(item.canonicalKey || item.key || ''), item]));
  const mapped = rows.map(row => {
    const key = String(row?.canonicalKey || row?.catalogId || row?.catalogKey || row?.catalogSnapshot?.canonicalKey || '');
    const item = byKey.get(key);
    if (!item) return null;
    const personal = row?.imageRef?.kind === 'personal' ? row.imageRef : null;
    // Catalog is intentionally read at evaluation time so existing Library and
    // Wishlist records inherit a later verified catalog image backfill.
    const ref = personal || item.imageRef || row?.catalogSnapshot?.imageRef || row?.imageRef || null;
    return { key, brand:item.brand || '', classification:classifyCatalogImage(ref), usable:isUsableCatalogImage(ref) };
  }).filter(Boolean);
  const count = kind => mapped.filter(row => row.classification === kind).length;
  const usable = mapped.filter(row => row.usable).length;
  return { total:mapped.length, usable, placeholder:count(IMAGE_USABILITY.PLACEHOLDER_ONLY), missing:count(IMAGE_USABILITY.NO_IMAGE), unverified:count(IMAGE_USABILITY.IMAGE_SOURCE_UNVERIFIED), broken:count(IMAGE_USABILITY.KNOWN_BROKEN_IMAGE), coverage:mapped.length ? usable / mapped.length : 0, rows:mapped };
}

export function priorityBrandCoverage(rows = [], catalog = [], brands = ['Mideer','Cherry-Pick','Learning Resources','LEGO / DUPLO']) {
  const coverage = imageCoverage(rows, catalog);
  return Object.fromEntries(brands.map(brand => {
    const subset = coverage.rows.filter(row => row.brand === brand);
    const usable = subset.filter(row => row.usable).length;
    return [brand, { total:subset.length, usable, coverage:subset.length ? usable / subset.length : 0 }];
  }));
}
