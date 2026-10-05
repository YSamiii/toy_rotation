import assert from 'node:assert/strict';
import { CATALOG_IMAGE_ASSETS } from '../src/data/catalog-image-assets.js';
import { IMAGE_USABILITY, classifyCatalogImage } from '../src/domain/catalog-image-usability.js';

const resolved = [
  'hape-creative-peg-puzzle-farm',
  'lr-helping-hands', 'lr-lock-key-clubhouse', 'lr-noodle-knockout', 'lego-duplo-brick-box',
  'mideer-magic-doodle-mat-hungry-caterpillar', 'mfb-food-pink', 'mideer-my-first-puzzle-dinosaurs-6in1-md1460',
  'hahaland-farm-busy-book-20in1', 'hahaland-surprise-barn', 'hahaland-mermaid-busy-board',
  ...Array.from({ length:8 }, (_, index) => `mideer-level1-home-sweet-home-puzzle:puzzle-${index + 1}`)
];
const unresolved = [
  'smtkid-geometric-stacking-long', 'smtkid-geometric-stacking-square'
];
let checks = 0;
for (const key of resolved) {
  const ref = CATALOG_IMAGE_ASSETS[key];
  assert.ok(ref, `${key} has an exact catalog image`);
  assert.ok(['verified_real', 'manually_confirmed'].includes(ref.verificationStatus), `${key} is verified`);
  assert.ok(ref.imageOwnerCanonicalKey === key || key === 'mideer-my-first-puzzle-dinosaurs-6in1-md1460', `${key} ownership is explicit`);
  assert.ok([IMAGE_USABILITY.VERIFIED_REMOTE_IMAGE, IMAGE_USABILITY.VERIFIED_PACKAGED_IMAGE].includes(classifyCatalogImage(ref)), `${key} is usable`);
  checks += 4;
}
for (const key of unresolved) {
  assert.equal(CATALOG_IMAGE_ASSETS[key], undefined, `${key} remains deliberately unresolved without an exact image`);
  checks++;
}
assert.equal(checks, 78);
console.log(`owned catalog image backfill r4 v0.11.6: PASS (${checks} assertions)`);
