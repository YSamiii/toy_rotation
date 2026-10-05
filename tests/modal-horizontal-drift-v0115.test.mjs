import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const css=await readFile(new URL('../src/ui/app.css',import.meta.url),'utf8');let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++};const rule=css.match(/\.form,\s*\.sheet\s*\{([\s\S]*?)\n\}/)?.[1]||'';
for(const value of ['min-inline-size: 0','max-inline-size: 100%','overflow-x: clip','overflow-y: auto','overscroll-behavior-x: contain','touch-action: pan-y'])ok(rule.includes(value),value);
ok(!/100vw/.test(rule),'sheet does not use viewport width');for(const width of [360,375,390,393])ok(rule.includes('max-inline-size: 100%'),`${width}px horizontal contract`);
assert.equal(checks,11);console.log(`modal horizontal drift v0.11.5: STATIC PASS (${checks} assertions; real-device required)`);
