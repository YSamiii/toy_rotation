import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const css=await readFile(new URL('../src/ui/app.css',import.meta.url),'utf8');const theme=await readFile(new URL('../src/ui/theme.css',import.meta.url),'utf8');const main=await readFile(new URL('../src/main.js',import.meta.url),'utf8');
for(const width of [360,375,390]){assert.ok(width>=360);assert.match(css,/@media[^{]*max-width:\s*520px/);assert.match(css,/width:\s*min\(94vw,\s*680px\)/);assert.match(css,/overflow-wrap:\s*anywhere|word-break:\s*break-word/);}
assert.match(css,/dialog/);assert.match(css,/overflow:\s*auto/);assert.match(css,/env\(safe-area-inset-bottom\)/);assert.match(theme,/--surface/);assert.match(main,/prepareSingleLineInputs\(dialog\)/);console.log('mobile geometry v0.11.4: STATIC CONTRACT PASS (16 assertions; real layout requires device/browser)');
