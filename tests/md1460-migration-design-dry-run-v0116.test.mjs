import assert from 'node:assert/strict';
import { repairQa6MideerCanonicalState } from '../src/domain/set-service.js';
import { canonicalKey } from '../src/data/schema.js';

// Isolated, in-memory observations of the existing QA6 repair. This is not
// the proposed migration and deliberately never writes owner storage.
const current = 'mideer-my-first-puzzle-dinosaurs-6in1-md1460';
const old = 'mideer-my-first-puzzle-dinosaurs-6in1';
const child = `${current}:puzzle-1`;
const definitions = new Map([[current, { canonicalKey:current, set:{ kind:'parent', rotationMode:'split' } }]]);
const toy = (id, key, set = { kind:'parent', childIds:[] }) => ({ id, canonicalKey:key, notes:`note:${id}`, imageRef:{ kind:'personal', id:`image:${id}` }, set });
const base = () => ({ schemaVersion:12, toys:[], wishlist:[], rotationHistory:[], crossAgeApprovals:{}, catalogState:{ tombstones:{}, removedOwnerships:{}, adminEdits:{}, imageRefsByKey:{}, imageRefsByIdentity:{}, syncMetadata:{} } });
const cases = {
  A:s=>{ s.toys=[toy('current',current)]; },
  B:s=>{ s.toys=[toy('old',old)]; },
  C:s=>{ s.toys=[toy('current',current),toy('old',old)]; },
  D:s=>{ s.toys=[toy('child',child,{kind:'child',parentId:'absent',parentCanonicalKey:current,partIndex:1})]; },
  E:s=>{ s.toys=[toy('current',current,{kind:'parent',childIds:['child']}),toy('child',child,{kind:'child',parentId:'current',parentCanonicalKey:current,partIndex:1})]; },
  F:s=>{ s.toys=[toy('current',current)]; s.rotationHistory=[{toyIds:['current'],canonicalKey:old,catalogKey:old}]; },
  G:s=>{ s.catalogState.removedOwnerships['deleted-id']={canonicalKey:old,reason:'parent_delete_cascade'}; },
  H:s=>{ s.catalogState.tombstones[old]={deletedAt:'2026-08-01'}; s.catalogState.tombstones[current]={deletedAt:'2026-08-02'}; },
  I:s=>{ s.wishlist=[{id:'wish-old',canonicalKey:old,catalogSnapshot:{canonicalKey:old}}]; },
  J:s=>{ s.wishlist=[{id:'wish-old',canonicalKey:old,catalogSnapshot:{canonicalKey:old}},{id:'wish-current',canonicalKey:current,catalogSnapshot:{canonicalKey:current}}]; },
  K:s=>{ s.schemaVersion=4; s.toys=[toy('old',old)]; },
  L:s=>{ s.toys=[toy('old',old)]; s.catalogState.tombstones[old]={deletedAt:'2025-01-01'}; },
  M:s=>{ s.toys=[toy('old-child',`${old}:puzzle-1`,{kind:'child',parentId:'old-parent',parentCanonicalKey:old,partIndex:1})]; }
};
const outcomes=[];
for (const [name, seed] of Object.entries(cases)) {
  const before=base(); seed(before);
  const staged=structuredClone(before);
  const result=repairQa6MideerCanonicalState(staged,definitions);
  assert.deepEqual(before, (()=>{ const x=base(); seed(x); return x; })(), `${name}: source fixture unchanged`);
  assert.equal(staged.schemaVersion,before.schemaVersion,`${name}: schema untouched by repair`);
  outcomes.push({name,before,staged,result});
}
const outcome=name=>outcomes.find(row=>row.name===name);
assert.equal(outcome('A').staged.toys[0].canonicalKey,current);
assert.equal(outcome('B').staged.toys[0].canonicalKey,current);
assert.equal(outcome('C').staged.toys.filter(row=>canonicalKey(row.canonicalKey)===current).length,1);
assert.equal(outcome('D').staged.toys[0].canonicalKey,child);
assert.equal(outcome('E').staged.toys[1].set.parentCanonicalKey,current);
assert.equal(outcome('F').staged.rotationHistory[0].canonicalKey,current);
assert.equal(outcome('G').staged.catalogState.removedOwnerships['deleted-id'].canonicalKey,old,'existing repair leaves removedOwnerships legacy key');
assert.equal(outcome('H').staged.catalogState.tombstones[current],undefined,'existing repair deletes survivor tombstone');
assert.equal(outcome('H').staged.catalogState.tombstones[old].mergedInto,current,'existing repair overwrites deletion with redirect');
assert.equal(outcome('I').staged.wishlist[0].canonicalKey,current);
assert.equal(outcome('J').staged.wishlist.length,2,'existing repair does not dedupe Wishlist');
assert.equal(outcome('K').staged.schemaVersion,4,'direct repair does not itself migrate schema');
assert.equal(outcome('L').staged.catalogState.tombstones[old].mergedInto,current,'old backup deletion changes to redirect');
assert.equal(outcome('M').staged.toys[0].canonicalKey,child);
for (const row of outcomes) {
  const after=row.staged;
  console.log(`${row.name}: toys ${row.before.toys.length}->${after.toys.length}, wishlist ${row.before.wishlist.length}->${after.wishlist.length}, tombstones ${Object.keys(row.before.catalogState.tombstones).length}->${Object.keys(after.catalogState.tombstones).length}, removed ${Object.keys(row.before.catalogState.removedOwnerships).length}->${Object.keys(after.catalogState.removedOwnerships).length}`);
}
console.log('MD1460 isolated dry-run: A-M observed; deletion and Wishlist blockers reproduced');
