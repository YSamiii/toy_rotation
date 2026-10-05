import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATALOG_IMAGE_ASSETS } from '../src/data/catalog-image-assets.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const reportPath=process.argv[2] || path.resolve(root,'..','..','reports','V0.11.6_IMAGE_USABILITY_PRIORITY_PASS_20260916.md');
const catalog=JSON.parse(await readFile(path.join(root,'catalog-base.json'),'utf8')).entries;
const visible=catalog.filter(item=>item.hidden!==true && item.deleted!==true && item.status!=='hidden');
const real=visible.filter(item=>CATALOG_IMAGE_ASSETS[item.key]?.kind==='packaged' || CATALOG_IMAGE_ASSETS[item.key]?.kind==='remote');
const packaged=visible.filter(item=>CATALOG_IMAGE_ASSETS[item.key]?.kind==='packaged');
const byBrand=brand=>{const rows=visible.filter(item=>item.brand===brand);const usable=rows.filter(item=>CATALOG_IMAGE_ASSETS[item.key]?.kind==='packaged'||CATALOG_IMAGE_ASSETS[item.key]?.kind==='remote');return {total:rows.length,usable:usable.length,coverage:rows.length?`${(usable.length/rows.length*100).toFixed(1)}%`:'N/A'};};
const brands=['Mideer','Cherry-Pick','Learning Resources','LEGO / DUPLO'];
const lines=[
  '# v0.11.6 Image Usability Priority Pass — 2026-09-16','',
  '## Scope and definitions','',
  '- Usable structural image: a Catalog remote image mapped as verified/stable, or a packaged asset with a verified MIME and SHA-256 hash.',
  '- Generated SVG and missing image metadata are not counted as usable.',
  '- This report does not read browser IndexedDB or phone-local data. Owned/Wishlist coverage is intentionally reported as unavailable until an explicit local-state export is supplied; the runtime calculator and tests are included in this pass.', '',
  '## Structural visible Catalog coverage','',
  `- Visible Catalog total: ${visible.length}`,
  `- Structural real-image count: ${real.length}`,
  `- Verified packaged images: ${packaged.length}`,
  `- Placeholder / missing structural images: ${visible.length-real.length}`,
  `- Structural Visible Image Coverage: ${(real.length/visible.length*100).toFixed(1)}%`, '',
  '## Owned and Wishlist coverage','',
  '- Owned total / usable / placeholder / missing / coverage: unavailable — no personal-state backup or browser IndexedDB export was present in the permitted workspace.',
  '- Wishlist total / usable / placeholder / missing / coverage: unavailable — no personal-state backup or browser IndexedDB export was present in the permitted workspace.',
  '- Runtime measurement: `imageCoverage(toys, catalog)` and `imageCoverage(wishlist, catalog)` in `src/domain/catalog-image-usability.js`.', '',
  '## Priority-brand structural coverage','',
  ...brands.map(brand=>{const value=byBrand(brand);return `- ${brand}: ${value.usable}/${value.total} (${value.coverage})`; }), '',
  '## Exact-safe packaged additions','',
  '- Mideer: Animal Toys Set 15pcs MD1382; Level 1 Home, Sweet Home! MD1673; My First Puzzle - Dinosaurs 6-in-1 MD1460.',
  '- Cherry-Pick: Magic Playwall Caramel variant 44481003192508; Emotions Magnets; Letters & Symbols 150pc Pastel Rainbow variant 44529740382396; Chalk Crayons + Magnetic Holder Neon variant 44190785765564.',
  '- LEGO DUPLO: 10473 Fire Truck with Hose and Firefighter; 10475 3 in 1 Construction Vehicles; 10955 Animal Train.', '',
  '## Held as unverified','',
  '- Learning Resources LER3369, LER2831, LER2965, LER5558, and LER9807: official identity pages confirm the SKUs, but their image endpoints returned 403 to direct source verification; no image mapping was written.',
  '- DUPLO 10965, 10875, and 10954: exact identity is retained, but no source passed this pass’s packaged-image MIME/download gate.', '',
  '## Safety','',
  '- Packaged refs use only `catalog-assets/<flat-filename>.(webp|png|jpg)`; no data URL, blob URL, file URL, traversal, or machine path is used.',
  '- No personal image, ownership, Wishlist state, duplicate state, or recommendation/rotation logic was changed.'
];
await mkdir(path.dirname(reportPath),{recursive:true});
await writeFile(reportPath,`${lines.join('\n')}\n`);
console.log(JSON.stringify({reportPath,visible:visible.length,real:real.length,packaged:packaged.length}));
