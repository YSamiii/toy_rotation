import assert from 'node:assert/strict';
import test from 'node:test';
import { performance } from 'node:perf_hooks';
import { SubstitutionEngine } from '../src/domain/substitution-engine.js';
import { generateRotation } from '../src/domain/rotation-engine.js';

function makeToy(index) {
  return {
    id:`toy-${index}`, canonicalKey:`toy-${index}`, productName:`Toy ${index}`,
    skillCodes:index % 3 ? ['fine_motor'] : ['logic'],
    playMechanics:index % 17 === 0 ? ['magnetic_fishing'] : ['fine_motor_general'],
    minAgeMonths:6, maxAgeMonths:72, rotationValue:'medium', shelfMode:index === 0 ? 'permanent' : 'rotate',
    status:index % 7 === 0 ? 'active' : 'stored', hidden:false, archived:false, set:{kind:'none'}, interest:null,
    lastActivatedAt:index % 5 === 0 ? new Date(Date.now() - index * 86400000).toISOString() : null
  };
}

test('large-library wishlist and rotation calculations stay within the interaction budget', () => {
  const toys = Array.from({ length:850 }, (_, index) => makeToy(index));
  const wanted = { ...makeToy(999), canonicalKey:'wanted', playMechanics:['magnetic_fishing'] };
  const engine = new SubstitutionEngine();
  const start = performance.now();
  const first = engine.result(wanted, toys, 1, { childAgeMonths:18 });
  const cached = engine.result(wanted, toys, 1, { childAgeMonths:18 });
  const rotation = generateRotation({ toys, history:[], childAgeMonths:18, size:10 });
  const elapsed = performance.now() - start;
  assert.equal(first, cached, 'substitution must memoize unchanged library results');
  assert.equal(rotation.length, 10);
  assert.ok(elapsed < 750, `expected under 750ms, got ${elapsed.toFixed(1)}ms`);
});
