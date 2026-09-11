import { sameCatalogIdentity } from './identity-service.js';

function imageValue(ref) {
  return String(typeof ref === 'string' ? ref : ref?.catalogImageRef || ref?.url || '').trim();
}

export function normalizeImageUrl(ref) {
  const value = imageValue(ref);
  try {
    const url = new URL(value);
    url.protocol = url.protocol.toLowerCase();
    url.hostname = url.hostname.toLowerCase();
    url.hash = '';
    if ((url.protocol === 'https:' && url.port === '443') || (url.protocol === 'http:' && url.port === '80')) url.port = '';
    const parameters = [...url.searchParams.entries()].sort(([leftKey,leftValue],[rightKey,rightValue]) => leftKey.localeCompare(rightKey) || leftValue.localeCompare(rightValue));
    url.search = '';
    parameters.forEach(([key,value]) => url.searchParams.append(key,value));
    return url.toString();
  } catch { return value; }
}

export function imageAssetPath(ref) {
  const value = imageValue(ref);
  try {
    const url = new URL(value);
    return `${url.protocol.toLowerCase()}//${url.hostname.toLowerCase()}${url.pathname}`;
  } catch { return value.split(/[?#]/,1)[0]; }
}

// This is deliberately a pre-write gate. Callers must not mutate the mapping
// collection when `allowed` is false.
export function preflightCatalogImageSharedRef({ candidateKey, candidateRef, candidateIdentity, catalogRows = [], imageAssets = {}, candidateFinalUrl = '', candidateHash = '', existingMetadata = {} } = {}) {
  const candidate = candidateIdentity || catalogRows.find(row => String(row.canonicalKey || row.key || '').toLowerCase() === String(candidateKey || '').toLowerCase()) || {};
  const candidateUrl = imageValue(candidateRef);
  const candidateNormalizedUrl = normalizeImageUrl(candidateUrl);
  const candidateAssetPath = imageAssetPath(candidateUrl);
  const candidateFinalNormalized = candidateFinalUrl ? normalizeImageUrl(candidateFinalUrl) : '';
  const candidateHashValue = String(candidateHash || '');
  const collisions = [];

  for (const [key,ref] of Object.entries(imageAssets)) {
    if (String(key).toLowerCase() === String(candidateKey || '').toLowerCase()) continue;
    const existingUrl = imageValue(ref);
    const metadata = existingMetadata[key] || {};
    const matches = [];
    if (existingUrl === candidateUrl) matches.push('same_url');
    if (normalizeImageUrl(existingUrl) === candidateNormalizedUrl) matches.push('normalized_url');
    if (imageAssetPath(existingUrl) === candidateAssetPath) matches.push('asset_path');
    if (candidateFinalNormalized && metadata.finalUrl && normalizeImageUrl(metadata.finalUrl) === candidateFinalNormalized) matches.push('final_url');
    if (candidateHashValue && metadata.contentHash && String(metadata.contentHash) === candidateHashValue) matches.push('image_hash');
    if (!matches.length) continue;
    const existing = catalogRows.find(row => String(row.canonicalKey || row.key || '').toLowerCase() === String(key).toLowerCase()) || {};
    collisions.push({ key, matches, identicalIdentity:sameCatalogIdentity(candidate, existing) });
  }
  const suspicious = collisions.filter(collision => !collision.identicalIdentity);
  return { allowed:suspicious.length === 0, collisions, suspicious };
}
