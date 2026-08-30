import { unique } from '../data/schema.js';
import { classifySetRelationship, differentSetEntities, distinctSku, identityTokens } from './identity-service.js';

// This is deliberately an identity engine only. It never imports or reads
// substitution scores, skills, or recommendation state.
export function findDuplicates(toys = []) {
  const results = [];
  for (let a = 0; a < toys.length; a++) for (let b = a + 1; b < toys.length; b++) {
    const item = compare(toys[a], toys[b]); if (isActionableDuplicate(item.kind)) results.push(item);
  }
  return results.sort((a,b) => rank(b.kind) - rank(a.kind) || b.score - a.score);
}
export function auditIdentityRelationships(toys = []) {
  const results = [];
  for (let a = 0; a < toys.length; a++) for (let b = a + 1; b < toys.length; b++) {
    const item = compare(toys[a], toys[b]); if (item.kind !== 'none') results.push(item);
  }
  return results.sort((a,b) => rank(b.kind) - rank(a.kind) || b.score - a.score);
}
export function compare(a, b) {
  const relation = classifySetRelationship(a, b);
  if (relation === 'parent_child_relation' || differentSetEntities(a, b)) return result('parent_child_relation', 0, a, b, ['parent_child_relation']);
  const sameKey = identityTokens(a).keys.some(key => identityTokens(b).keys.includes(key));
  if (sameKey) return result('exact_duplicate', 100, a, b, ['canonicalKey']);
  if (distinctSku(a, b)) return result('related_variant', 0, a, b, ['distinct_sku']);
  const name = sameName(a, b); const aliases = sharesAlias(a, b); const brand = sameBrand(a, b);
  if (relation === 'sibling_child') {
    if (brand && (name || aliases)) return result('same_child_legacy_duplicate', 96, a, b, [name ? 'same_child_name' : 'same_child_alias', 'same_parent']);
    return result('sibling_child', 0, a, b, ['same_parent_different_child']);
  }
  if ((name && brand) || (aliases && brand)) return result('strong_probable_duplicate', 80, a, b, [name ? 'name' : 'alias', 'brand']);
  if (brand && similarName(a,b)) return result('related_variant', 0, a, b, ['related_name']);
  return result('none', 0, a, b, []);
}
export function exactProductIdentityKey(toy) { const name=normalizedName(toy); const brand=normalized(toy.brand); return name && brand ? `${brand}|${name}` : ''; }
export function isActionableDuplicate(kind) { return ['exact_duplicate','same_child_legacy_duplicate','strong_probable_duplicate'].includes(kind); }
function result(kind, score, a, b, reasons) { return { kind, score, a, b, reasons }; }
function sameName(a,b) { const x=normalizedName(a),y=normalizedName(b); return Boolean(x && x === y); }
function sameBrand(a,b) { const x=normalized(a.brand),y=normalized(b.brand); return Boolean(x && x === y); }
function sharesAlias(a,b) { const left=identityTokens(a).names; const right=identityTokens(b).names; return left.some(value=>value && right.includes(value)); }
function normalizedName(toy) { return normalized(toy.productName || toy.name || toy.names?.en || toy.names?.zh || ''); }
function normalized(value) { return String(value || '').normalize('NFKC').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g,''); }
function similarName(a,b) { const x=normalizedName(a),y=normalizedName(b); return Boolean(x && y && (x.includes(y)||y.includes(x))); }
function rank(kind) { return {exact_duplicate:6,same_child_legacy_duplicate:5,strong_probable_duplicate:4,parent_child_relation:3,sibling_child:2,related_variant:1,none:0}[kind] || 0; }
