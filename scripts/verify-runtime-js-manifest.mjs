import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root=path.resolve(process.argv[2] || '.');
const manifest=JSON.parse(await readFile(path.join(root,'runtime-js-manifest.json'),'utf8'));
for(const file of manifest.files){
  const content=await readFile(path.join(root,file.path));
  assert.equal(content.byteLength,file.bytes,`${file.path} length`);
  assert.equal(createHash('sha256').update(content).digest('hex'),file.sha256,`${file.path} SHA-256`);
}
console.log(`runtime manifest/hash: PASS (${manifest.files.length} files)`);
