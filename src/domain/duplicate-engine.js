import { canonicalKey, unique } from '../data/schema.js';

export function findDuplicates(toys) {
  const results = [];
  for (let a = 0; a < toys.length; a++) for (let b = a + 1; b < toys.length; b++) {
    const result = compare(toys[a], toys[b]); if (result.kind !== 'none') results.push(result);
  }
  return results.sort((a,b) => rank(b.kind) - rank(a.kind) || b.score - a.score);
}
export function compare(a, b) {
  const sameKey = canonicalKey(a.canonicalKey) && canonicalKey(a.canonicalKey) === canonicalKey(b.canonicalKey);
  if (sameKey) return { kind:'exact_duplicate', score:100, a, b, reasons:['canonicalKey'] };
  const name = normalizedName(a) === normalizedName(b) && normalizedName(a); const brand = String(a.brand||'').toLowerCase() === String(b.brand||'').toLowerCase();
  const aliases = unique(a.aliases || []).some(alias => normalized(alias) === normalizedName(b)) || unique(b.aliases || []).some(alias => normalized(alias) === normalizedName(a));
  if ((name && brand) || (aliases && brand)) return { kind:'strong_probable_duplicate', score:80, a, b, reasons:[name?'name':'alias',brand?'brand':''] .filter(Boolean) };
  const mechanics = unique(a.playMechanics || []).filter(value => (b.playMechanics || []).includes(value));
  if (brand && mechanics.length && similarName(a,b)) return { kind:'related_variant', score:40, a, b, reasons:['brand','related mechanism'] };
  return { kind:'none', score:0, a, b, reasons:[] };
}
function normalizedName(toy) { return normalized(toy.productName || toy.name || ''); }
function normalized(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g,''); }
function similarName(a,b) { const x=normalizedName(a),y=normalizedName(b); return x.includes(y)||y.includes(x); }
function rank(kind) { return {exact_duplicate:3,strong_probable_duplicate:2,related_variant:1,none:0}[kind]; }
