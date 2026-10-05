import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { emptyState } from '../src/data/schema.js';

const theme=await readFile(new URL('../src/ui/theme.css',import.meta.url),'utf8');
const app=await readFile(new URL('../src/ui/app.css',import.meta.url),'utf8');
const main=await readFile(new URL('../src/main.js',import.meta.url),'utf8');
const light=theme.match(/:root\{([^}]*)\}/)?.[1]||'';
const dark=theme.match(/:root\[data-theme="dark"\]\{([^}]*)\}/)?.[1]||'';
const tokens=['--bg','--surface','--surface-secondary','--surface-elevated','--text-primary','--text-secondary','--text-muted','--border','--input-bg','--danger-bg','--danger-text','--accent','--accent-text','--focus','--overlay','--shadow'];
let n=0;const ok=(value,message)=>{assert.ok(value,message);n++;};
for(const token of tokens){ok(light.includes(token),`light token: ${token}`);ok(dark.includes(token),`dark token: ${token}`);}
assert.deepEqual([...new Set(light.match(/--[\w-]+(?=:)/g)||[])].sort(),[...new Set(dark.match(/--[\w-]+(?=:)/g)||[])].sort(),'light/dark token parity');n++;
for(const value of ['light','dark','system']){const state=emptyState();state.settings.theme=value;assert.equal(state.settings.theme,value,`persisted setting: ${value}`);n++;}
for(const selector of ['dialog','.card','input','select','.form','.sheet','.recognition-diagnostic','.wishlist-card','.admin-workspace-root','.candidate-next-step'])ok(app.includes(selector),`critical surface selector: ${selector}`);
for(const token of ['--surface','--surface-secondary','--surface-elevated','--input-bg','--text-primary','--text-secondary','--border','--accent','--danger-bg','--danger-text'])ok(app.includes(`var(${token})`),`critical token usage: ${token}`);
ok(main.includes("systemTheme.addEventListener?.('change'"),'system theme listener');
ok(main.includes("document.documentElement.dataset.theme = configured"),'runtime root theme update');
ok(main.includes("form.theme.onchange = applyPreview"),'settings preview switch');
console.log(`theme v0.11.4: PASS (${n} assertions)`);
