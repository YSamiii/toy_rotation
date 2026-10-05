import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATALOG_IMAGE_ASSETS } from '../src/data/catalog-image-assets.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = process.argv[2] || path.resolve(root, '..', '..', 'reports', 'V0.11.6_MISSING_IMAGE_INVENTORY_20260911.md');
const catalog = JSON.parse(await readFile(path.join(root, 'catalog-base.json'), 'utf8')).entries;
const priorityBrands = new Set(['Hape', 'VTech', 'LEGO', 'DUPLO', 'Melissa & Doug', 'Learning Resources', 'Fisher-Price', 'BRIO', 'HABA', 'PlanToys', 'SmartGames']);
const ambiguousTerms = /^(activity|animal|baby|ball|blocks?|book|car|doll|game|puzzle|set|stacker|toy|vehicle)s?$/i;
const statusFor = entry => {
  const words = String(entry.name || '').trim().split(/\s+/);
  if (words.length < 2 || ambiguousTerms.test(String(entry.name || '').trim())) return 'C. AMBIGUOUS / GENERIC';
  if (priorityBrands.has(entry.brand)) return 'A. VERIFIED PRODUCT IDENTITY';
  return 'B. PARTIALLY VERIFIED';
};
const missing = catalog.filter(entry => !CATALOG_IMAGE_ASSETS[entry.key]);
const groups = new Map();
for (const entry of missing) {
  const status = statusFor(entry);
  const group = groups.get(entry.brand) || [];
  group.push({ entry, status });
  groups.set(entry.brand, group);
}
const counts = Object.fromEntries(['A. VERIFIED PRODUCT IDENTITY', 'B. PARTIALLY VERIFIED', 'C. AMBIGUOUS / GENERIC'].map(status => [status, missing.filter(entry => statusFor(entry) === status).length]));
const lines = [
  '# v0.11.6 Missing Standard Catalog Image Inventory',
  '',
  '- Baseline: v0.11.5 Stable source, schemaVersion 12.',
  `- Catalog total: ${catalog.length}. Existing exact image mappings: ${catalog.length - missing.length}. Missing: ${missing.length}.`,
  `- Identity classifications: A ${counts['A. VERIFIED PRODUCT IDENTITY']}; B ${counts['B. PARTIALLY VERIFIED']}; C ${counts['C. AMBIGUOUS / GENERIC']}.`,
  '- Classification is an image-research queue, not evidence that an image may be bound. Each future mapping still requires exact product/variant evidence and a stable source URL.',
  ''
];
for (const [brand, rows] of [...groups.entries()].sort(([left], [right]) => left.localeCompare(right))) {
  lines.push(`## ${brand} (${rows.length})`, '');
  for (const { entry, status } of rows.sort((left, right) => left.entry.key.localeCompare(right.entry.key))) {
    const aliases = (entry.aliases || []).join(' | ') || '—';
    const parentChild = entry.parentCanonicalKey ? `child of ${entry.parentCanonicalKey}` : entry.childCanonicalKeys?.length ? `parent (${entry.childCanonicalKeys.length} children)` : 'standalone';
    const sku = entry.sku || entry.model || entry.setNumber || '—';
    lines.push(`- **${entry.name}** — key: \`${entry.key}\`; age: ${entry.ageMinMonths}–${entry.ageMaxMonths} months; category: ${entry.category}; parent/child: ${parentChild}; aliases: ${aliases}; SKU/model: ${sku}; current image: missing; priority: ${status}.`);
  }
  lines.push('');
}
await mkdir(path.dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${lines.join('\n')}\n`);
console.log(JSON.stringify({ reportPath, catalogTotal: catalog.length, missing: missing.length, counts }));
