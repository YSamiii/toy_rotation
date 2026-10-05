import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { normalizeCatalogToy, SCHEMA_VERSION } from '../src/data/schema.js';
import { catalogSafetyStatus, withCatalogSafety } from '../src/domain/catalog-safety.js';
import { hardSafetyEligible } from '../src/domain/rotation-engine.js';
import { buildCatalogSafetyAudit } from '../src/features/catalog-safety-audit.js';

const catalog = JSON.parse(readFileSync(new URL('../catalog-base.json', import.meta.url), 'utf8'));
const expected = new Map([
  ['hahaland-farm-busy-book-20in1', 'VERIFIED_NO_EXTRA_GATE'],
  ['hape-clean-up-bucket-set', 'SMALL_PARTS_GATE'],
  ['hape-creatives-peg-puzzle', 'VERIFIED_NO_EXTRA_GATE'],
  ['hape-jungle-musical-railway', 'VERIFIED_NO_EXTRA_GATE'],
  ['lr-noodle-knockout', 'SMALL_PARTS_GATE'],
  ['lego-duplo-brick-box', 'VERIFIED_NO_EXTRA_GATE'],
  ['lego-duplo-fire-truck-hose-firefighter-10473', 'VERIFIED_NO_EXTRA_GATE'],
  ['vtech-busy-learners-music-activity-cube', 'VERIFIED_NO_EXTRA_GATE']
]);
assert.equal(SCHEMA_VERSION, 12);
const rows = new Map(catalog.entries.map(entry => [entry.key, normalizeCatalogToy(entry)]));
for (const [key, status] of expected) {
  const row = rows.get(key);
  assert.ok(row, key);
  assert.equal(catalogSafetyStatus(row), status, key);
  assert.match(row.userMetadata.safety.safetySource, /^https:\/\//);
  assert.equal(row.userMetadata.safety.safetyVerifiedAt, '2026-09-24');
  assert.ok(row.userMetadata.safety.evidenceNote);
}
assert.equal(hardSafetyEligible(rows.get('hape-clean-up-bucket-set'), 35), false);
assert.equal(hardSafetyEligible(rows.get('lr-noodle-knockout'), 35), false);
assert.equal(hardSafetyEligible(rows.get('lr-noodle-knockout'), 36), true);
assert.equal(hardSafetyEligible(rows.get('hape-creatives-peg-puzzle'), 17), true);
const privateOwned = { id:'private-owner-id', canonicalKey:'hape-clean-up-bucket-set', notes:'private note', userMetadata:{ customProductName:true } };
const projected = withCatalogSafety(privateOwned, rows.get(privateOwned.canonicalKey));
assert.equal(projected.userMetadata.customProductName, true);
assert.equal(privateOwned.userMetadata.safety, undefined);
const audit = buildCatalogSafetyAudit({
  state:{ toys:[privateOwned], wishlist:[{ id:'private-wish-id', canonicalKey:'lr-noodle-knockout' }] },
  catalog:{ active:[...rows.values()], resolve:ref => rows.get(ref.canonicalKey) },
  build:{ buildId:'research-batch1-test' }
});
assert.equal(audit.owned.items[0].ageSafetyStatus, 'SMALL_PARTS_GATE');
assert.equal(audit.wishlist.items[0].ageSafetyStatus, 'SMALL_PARTS_GATE');
assert.equal(JSON.stringify(audit).includes('private note'), false);
console.log('catalog safety research batch 1 v0.11.6: PASS');
