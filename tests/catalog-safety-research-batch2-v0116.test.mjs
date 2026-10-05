import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { normalizeCatalogToy, SCHEMA_VERSION } from '../src/data/schema.js';
import { catalogSafetyStatus, withCatalogSafety } from '../src/domain/catalog-safety.js';
import { hardSafetyEligible, selectRotation } from '../src/domain/rotation-engine.js';
import { buildCatalogSafetyAudit } from '../src/features/catalog-safety-audit.js';

const catalog = JSON.parse(readFileSync(new URL('../catalog-base.json', import.meta.url), 'utf8'));
const rows = new Map(catalog.entries.map(entry => [entry.key, normalizeCatalogToy(entry)]));
const newHardGates = ['ltv-barista-cafe-shop', 'plantoys-balancing-cactus'];
assert.equal(SCHEMA_VERSION, 12);
for (const key of newHardGates) {
  const toy = rows.get(key);
  assert.ok(toy, key);
  assert.equal(catalogSafetyStatus(toy), 'SMALL_PARTS_GATE', key);
  assert.equal(toy.userMetadata.safety.hardMinAgeMonths, 36, key);
  assert.equal(toy.userMetadata.safety.smallParts, true, key);
  assert.equal(toy.userMetadata.safety.warningType, 'choking_small_parts', key);
  assert.match(toy.userMetadata.safety.safetySource, /^https:\/\//, key);
  assert.equal(toy.userMetadata.safety.safetyVerifiedAt, '2026-09-24', key);
  assert.ok(toy.userMetadata.safety.evidenceNote, key);
  assert.equal(hardSafetyEligible(toy, 35), false, key);
  assert.equal(hardSafetyEligible(toy, 36), true, key);
  const selected = selectRotation({
    toys: [{ ...toy, id: key, status: 'stored', playMechanics: ['stack_balance'], challengeLevel: 5 }],
    childAgeMonths: 35,
    childDevelopmentProfile: { stack_balance: { currentLevel: 5 } },
    size: 1
  });
  assert.equal(selected.selected.length, 0, `stretch cannot bypass ${key}`);
}
const unverified = rows.get('hape-creative-peg-puzzle-farm');
assert.equal(catalogSafetyStatus(unverified), 'UNKNOWN');
assert.equal(hardSafetyEligible(unverified, 23), false);
assert.equal(hardSafetyEligible(unverified, 24), true);
assert.equal(catalogSafetyStatus(rows.get('lego-duplo-brick-box')), 'VERIFIED_NO_EXTRA_GATE');
assert.equal(hardSafetyEligible(rows.get('lego-duplo-brick-box'), 17), true);

const owned = { id: 'private-owned', canonicalKey: newHardGates[0], notes: 'private note', userMetadata: { customProductName: true } };
const wishlist = { id: 'private-wish', canonicalKey: newHardGates[1], notes: 'private wish' };
const projected = withCatalogSafety(owned, rows.get(owned.canonicalKey));
assert.equal(projected.userMetadata.customProductName, true);
assert.equal(owned.userMetadata.safety, undefined);
const audit = buildCatalogSafetyAudit({
  state: { toys: [owned], wishlist: [wishlist] },
  catalog: { active: [...rows.values()], resolve: ref => rows.get(ref.canonicalKey) },
  build: { buildId: 'research-batch2-test' }
});
assert.equal(audit.owned.items[0].ageSafetyStatus, 'SMALL_PARTS_GATE');
assert.equal(audit.wishlist.items[0].ageSafetyStatus, 'SMALL_PARTS_GATE');
assert.equal(JSON.stringify(audit).includes('private note'), false);
assert.equal(JSON.stringify(audit).includes('private wish'), false);
console.log('catalog safety research batch 2 v0.11.6: PASS');
