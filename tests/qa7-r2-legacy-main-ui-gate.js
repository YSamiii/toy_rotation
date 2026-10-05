const STORE_KEY = 'toyRotation.cleanBaseline';
const legacyDino = 'mideer-my-first-puzzle-dinosaurs-6in1';
const canonicalDino = 'mideer-my-first-puzzle-dinosaurs-6in1-md1460';
const busy = 'mideer-first-artist-busy-cars';
const busyNames = ['Car', 'Police Car', 'Ice Cream Truck', 'Garbage Truck', 'Delivery Truck', 'School Bus'];
const dinoNames = ['Pterosaur', 'Parasaurolophus', 'Stegosaurus', 'Triceratops', 'Tyrannosaurus rex', 'Snake'];
const stateByIndex = index => ({
  notes: `retain-note-${index}`,
  imageRef: index === 2 ? { kind:'personal', id:'fixture-personal-image' } : { kind:'placeholder' },
  manualShelfMode: index === 3 ? 'on_shelf' : null,
  storageLocation: index === 4 ? 'blue-bin' : null,
  interest: index === 5 ? 'like' : 'neutral',
  feedbackHistory: index === 5 ? [{ value:'love' }] : [],
  shelfMode: index === 6 ? 'permanent' : 'rotate',
  permanentSource: index === 6 ? 'user' : null
});
const child = (id, canonicalKey, productName, parentId, parentCanonicalKey, partIndex, state) => ({
  id, canonicalKey, brand:'Mideer', productName, skillCodes:[], playMechanics:[], ...state,
  set:{kind:'child', parentId, parentCanonicalKey, partIndex, rotationMode:'split'}
});
const fixture = {
  schemaVersion:12,
  settings:{language:'en', rotationSize:6, rotationDays:7, onboardingDone:true},
  profile:{childName:'Fixture', childBirthDate:'2020-01-01'}, wishlist:[], rotationHistory:[],
  catalogState:{tombstones:{}, adminEdits:{}, imageRefsByKey:{}, imageRefsByIdentity:{}, learnedEntries:[], remoteEntries:[], syncMetadata:{}},
  toys:[
    {id:'busy-parent', canonicalKey:busy, brand:'Mideer', productName:'Busy Cars', sku:'MD1458', skillCodes:[], playMechanics:[], set:{kind:'parent', rotationMode:'split', childIds:[]}},
    {id:'legacy-dino-parent', canonicalKey:legacyDino, brand:'Mideer', productName:'Dinosaurs', sku:'MD1460', skillCodes:[], playMechanics:[], notes:'legacy-parent-note', storageLocation:'blue-bin', shelfMode:'permanent', permanentSource:'user', set:{kind:'parent', rotationMode:'split', childIds:[]}},
    ...busyNames.map((name, index) => child(`busy-old-${index + 1}`, `${busy}:puzzle-${index + 1}`, `${name} Puzzle`, 'busy-parent', busy, index + 1, stateByIndex(index + 1))),
    ...dinoNames.map((_, index) => child(`dino-old-${index + 1}`, `${legacyDino}:puzzle-${index + 1}`, `Dinosaur Puzzle ${index + 1}`, 'legacy-dino-parent', legacyDino, index + 1, stateByIndex(index + 1)))
  ]
};
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const readFixture = () => JSON.parse(localStorage.getItem(STORE_KEY));
const stage = value => { document.documentElement.dataset.gateStage = value; document.querySelector('#gate-stage').textContent = `Stage: ${value}`; };
const report = (status, result) => { document.documentElement.dataset.gateStatus = status; document.querySelector('#result').textContent = JSON.stringify({ status, ...result }, null, 2); };
const loadFrame = frame => new Promise((resolve, reject) => { frame.addEventListener('load', resolve, { once:true }); frame.addEventListener('error', () => reject(new Error('iframe_load_error')), { once:true }); });
async function ready(frame) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const doc = frame.contentDocument;
    const startup = JSON.parse(frame.contentWindow.localStorage.getItem('toyRotation.startupDiagnostic') || 'null');
    if (doc?.querySelector('button[data-view="library"]') && doc.body.textContent.includes('v0.11.6-iphone-qa7-r2-20260918') && startup?.phase === 'hydrate-complete') return doc;
    await wait(100);
  }
  throw new Error('app_ready_timeout');
}
async function library(frame) {
  const doc = frame.contentDocument;
  doc.querySelector('button[data-view="library"]').click();
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const root = frame.contentDocument.querySelector('#library-list');
    if (root?.querySelectorAll('article.card').length === 14) return root;
    await wait(100);
  }
  throw new Error('library_render_timeout');
}
function inspect(frame) {
  const cards = [...frame.contentDocument.querySelectorAll('#library-list article.card')];
  const cardNames = cards.map(card => card.querySelector('h3')?.textContent.trim()).filter(Boolean);
  const persisted = readFixture();
  const dinosaurs = persisted.toys.filter(toy => toy.set?.kind === 'child' && toy.set.parentCanonicalKey === canonicalDino).sort((a, b) => a.set.partIndex - b.set.partIndex);
  const busyChildren = persisted.toys.filter(toy => toy.set?.kind === 'child' && toy.set.parentCanonicalKey === busy).sort((a, b) => a.set.partIndex - b.set.partIndex);
  const dinoParents = persisted.toys.filter(toy => toy.set?.kind === 'parent' && toy.canonicalKey === canonicalDino);
  const ownership = persisted.toys.filter(toy => toy.set?.kind === 'parent' && toy.canonicalKey === canonicalDino && toy.set.childIds?.length === 6).length;
  const retained = dinosaurs.every((toy, index) => {
    const expected = stateByIndex(index + 1);
    return toy.notes === expected.notes && JSON.stringify(toy.imageRef) === JSON.stringify(expected.imageRef) && toy.manualShelfMode === expected.manualShelfMode && toy.storageLocation === expected.storageLocation && toy.interest === expected.interest && JSON.stringify(toy.feedbackHistory) === JSON.stringify(expected.feedbackHistory) && toy.shelfMode === expected.shelfMode && toy.permanentSource === expected.permanentSource;
  });
  return {
    dinoParent: dinoParents[0]?.canonicalKey || null,
    activeDinoParents:dinoParents.length,
    ownershipBadge:ownership,
    dinoChildren:dinosaurs.length,
    busyChildren:busyChildren.length,
    busyNames:busyChildren.map(toy => toy.productName),
    dinoNames:dinosaurs.map(toy => toy.productName),
    renderedNames:cardNames,
    genericOldNameCount:cardNames.filter(name => /(?:Dinosaur Puzzle \d|(?:Car|Police Car|Ice Cream Truck|Garbage Truck|Delivery Truck|School Bus) Puzzle)/.test(name)).length,
    duplicateParent: persisted.toys.filter(toy => toy.set?.kind === 'parent' && toy.canonicalKey === canonicalDino).length !== 1,
    duplicateChild: new Set([...dinosaurs, ...busyChildren].map(toy => toy.canonicalKey)).size !== 12,
    userStateRetained:retained
  };
}
function valid(result) {
  return result.dinoParent === canonicalDino && result.activeDinoParents === 1 && result.ownershipBadge === 1 && result.dinoChildren === 6 && result.busyChildren === 6 && JSON.stringify(result.busyNames) === JSON.stringify(busyNames) && JSON.stringify(result.dinoNames) === JSON.stringify(dinoNames) && result.genericOldNameCount === 0 && !result.duplicateParent && !result.duplicateChild && result.userStateRetained;
}
async function run() {
  localStorage.setItem(STORE_KEY, JSON.stringify(fixture));
  const frame = document.createElement('iframe'); frame.id = 'actual-app'; document.querySelector('#app-host').append(frame);
  const firstLoad = loadFrame(frame); frame.src = '/index.html?qa7-r2-legacy-main-ui-gate=1'; await firstLoad; await ready(frame); await library(frame); const first = inspect(frame);
  const reloads = [];
  for (let index = 0; index < 2; index += 1) { stage(`reload-${index + 1}`); const nextLoad = loadFrame(frame); frame.contentWindow.location.reload(); await nextLoad; await ready(frame); await library(frame); reloads.push(inspect(frame)); }
  if (!valid(first) || !reloads.every(valid)) {
    const error = new Error('legacy_main_ui_gate_assertion_failed');
    error.diagnostics = { first, reloads };
    throw error;
  }
  report('PASS', { fixture:'legacy persisted state -> actual bundled index.html -> Toy Library/renderToyCard', first, reloads, reloadIdempotent:true });
}
stage('boot'); run().catch(error => report('FAIL', { stage:document.documentElement.dataset.gateStage, error:String(error?.stack || error), diagnostics:error?.diagnostics || null }));
