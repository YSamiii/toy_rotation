import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../src/main.js',import.meta.url),'utf8');
assert.match(source,/data-local-open/);assert.match(source,/Start Review/);assert.match(source,/Continue Review/);assert.match(source,/data-candidate-detail/);assert.match(source,/data-candidate-action="approved"/);assert.match(source,/data-candidate-action="link"/);assert.match(source,/data-candidate-action="rejected"/);assert.match(source,/local-candidate-reviewing/);console.log('local candidate reviewing UX: PASS (8 assertions)');
