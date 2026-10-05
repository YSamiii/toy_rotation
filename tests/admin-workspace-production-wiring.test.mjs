import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../src/main.js',import.meta.url),'utf8');
assert.match(source,/import \{ createAdminWorkspaceController \} from '\.\/ui\/admin-workspace-controller\.js';/);
assert.match(source,/function renderAdminWorkspaceBody\(dialog,\{onBack,onClose\}\)/);
assert.match(source,/renderWorkspace:callbacks=>renderAdminWorkspaceBody\(dialog,callbacks\)/);
assert.match(source,/renderSettings:callbacks=>restoreSettingsFromWorkspace\(dialog,callbacks\)/);
assert.match(source,/data-workspace-back\]'\)\.onclick=onBack/);
assert.match(source,/data-workspace-close\]'\)\.onclick=onClose/);
assert.doesNotMatch(source,/function renderAdminWorkspaceInSettings/);
function extractFunctionSource(text,name){
  const start=text.indexOf(`function ${name}(`);
  if(start<0)throw new Error(`Missing function: ${name}`);
  const bodyStart=text.indexOf('{',start);
  let depth=0;
  for(let index=bodyStart;index<text.length;index++){
    if(text[index]==='{')depth++;
    if(text[index]==='}'&&--depth===0)return text.slice(start,index+1);
  }
  throw new Error(`Unclosed function: ${name}`);
}
const renderer=extractFunctionSource(source,'renderAdminWorkspaceBody');
for(const forbidden of ['traceAdminWorkspace(','admin.enabled','renderSettings(','openSettings(','dialog.close(','openModal('])assert.equal(renderer.includes(forbidden),false,forbidden);
console.log('admin workspace production wiring: PASS (13 assertions)');
