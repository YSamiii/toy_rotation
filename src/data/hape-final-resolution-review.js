// Catalog review metadata is independent from the catalog identity and image
// pipelines. It only controls public Catalog visibility for identities that
// cannot safely be presented as resolved products yet.
export const HAPE_FINAL_RESOLUTION_REVIEW = Object.freeze([
  Object.freeze({canonicalKey:'hape-shape-sorter',status:'identity_hold',reason:'Multiple official products (E0516, E0407, E0364, E0515) fit the generic stored name; no row-level SKU or structural evidence.'}),
  Object.freeze({canonicalKey:'hape-wooden-shape-sorter',status:'identity_hold',reason:'Multiple official products (E0516, E0407, E0364, E0515) fit the generic stored name; no row-level SKU or structural evidence.'}),
  Object.freeze({canonicalKey:'hape-all-seasons-dollhouse',status:'unresolved_variant',reason:'The unqualified legacy name cannot be proven to be the furnished E3401B record or a distinct historical configuration.'}),
  Object.freeze({canonicalKey:'hape-balance-bike',status:'source_hold',reason:'The stored identity has no colour/variant; official E0104 green and E0105 pink are distinct products.'}),
  Object.freeze({canonicalKey:'hape-double-sandwich-making-set',status:'catalog_identity_review_required',reason:'No exact Hape SKU, official product page, or stable exact-product retailer evidence was found; same-name results point to other brands.'}),
  Object.freeze({canonicalKey:'hape-farm-activity-cube',status:'catalog_identity_review_required',reason:'No exact Hape SKU or official product page was found; exact-name results point to other brands.'}),
  Object.freeze({canonicalKey:'hape-learn-to-play-piano',status:'source_hold',reason:'The stored identity has no colour/SKU; E0627 black and E0628 red are distinct variants.'})
]);

const HIDDEN_FROM_PUBLIC_CATALOG = new Set(['identity_hold','unresolved_variant','catalog_identity_review_required']);
const REVIEW_BY_KEY = new Map(HAPE_FINAL_RESOLUTION_REVIEW.map(row => [row.canonicalKey, row]));

export function catalogReviewMetadata(key) { return REVIEW_BY_KEY.get(String(key || '').trim().toLowerCase()) || null; }
export function isPublicCatalogVisible(toy) { return !HIDDEN_FROM_PUBLIC_CATALOG.has(catalogReviewMetadata(toy?.canonicalKey)?.status); }
