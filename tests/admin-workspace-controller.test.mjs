import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createAdminWorkspaceController } from '../src/ui/admin-workspace-controller.js';

const dom=new JSDOM('<dialog open id="settings"></dialog>');
const document=dom.window.document;
const dialog=document.querySelector('dialog');
let authenticated=true,pending=0,closed=false,renderWorkspaceCalls=0,renderSettingsCalls=0;
const trace=[];
let controller;
function settings({onOpenWorkspace,onClose}={}){
  renderSettingsCalls++;
  dialog.innerHTML='<section data-settings-root><button type="button" id="workspace">Workspace</button><button type="button" id="settings-x">×</button></section>';
  dialog.querySelector('#workspace').onclick=onOpenWorkspace || (()=>controller.open());
  dialog.querySelector('#settings-x').onclick=onClose || (()=>controller.closeSettings());
}
function workspace({pendingCount,onBack,onClose}){
  renderWorkspaceCalls++;
  dialog.innerHTML=`<section data-admin-workspace-root><span>${pendingCount}</span><button id="back">Back</button><button id="close">Close</button></section>`;
  dialog.querySelector('#back').onclick=onBack;
  dialog.querySelector('#close').onclick=onClose;
}
controller=createAdminWorkspaceController({dialog,getAdminAuthenticated:()=>authenticated,getPendingCount:()=>pending,renderSettings:settings,renderWorkspace:workspace,closeSettingsDialog:()=>{closed=true;dialog.removeAttribute('open');},trace:(stage,detail)=>trace.push({stage,detail})});
settings();
const identity=dialog;
const stages=()=>trace.map(item=>item.stage);
const resetTrace=()=>{trace.length=0;};
const count=stage=>stages().filter(value=>value===stage).length;

assert.equal(dialog.querySelector('#workspace').disabled,false);
resetTrace();dialog.querySelector('#workspace').click();
assert.ok(dialog.querySelector('[data-admin-workspace-root]'));
assert.equal(dialog,identity);assert.equal(dialog.open,true);assert.equal(controller.activeView,'adminWorkspace');
assert.equal(renderWorkspaceCalls,1);assert.equal(count('button_clicked'),1);assert.equal(count('auth_state'),1);assert.equal(count('open_requested'),1);assert.equal(count('workspace_render_started'),1);assert.equal(count('workspace_dom_created'),1);assert.equal(count('workspace_visible'),1);assert.equal(count('error'),0);
resetTrace();dialog.querySelector('#back').click();
assert.ok(dialog.querySelector('[data-settings-root]'));assert.equal(controller.activeView,'settings');assert.equal(count('back_requested'),1);assert.equal(count('workspace_closed_to_settings'),1);assert.equal(renderSettingsCalls,2);
pending=3;resetTrace();dialog.querySelector('#workspace').click();assert.equal(dialog.textContent.includes('3'),true);assert.equal(renderWorkspaceCalls,2);assert.equal(count('button_clicked'),1);
resetTrace();dialog.querySelector('#close').click();assert.ok(dialog.querySelector('[data-settings-root]'));assert.equal(count('workspace_close_requested'),1);assert.equal(count('workspace_closed_to_settings'),1);assert.equal(count('back_requested'),0);
for(let i=0;i<5;i++){dialog.querySelector('#workspace').click();dialog.querySelector('#back').click();}
assert.equal(renderWorkspaceCalls,7);assert.equal(dialog,identity);assert.equal(dialog.open,true);
authenticated=false;resetTrace();assert.equal(controller.open(),false);assert.equal(renderWorkspaceCalls,7);assert.equal(count('button_clicked'),1);assert.equal(count('auth_state'),1);assert.equal(count('open_requested'),0);
authenticated=true;dialog.querySelector('#workspace').click();assert.ok(dialog.querySelector('[data-admin-workspace-root]'));controller.closeWorkspace();dialog.querySelector('#settings-x').click();assert.equal(closed,true);assert.equal(dialog.open,false);assert.ok(stages().includes('settings_closed'));
console.log('admin workspace DOM lifecycle: PASS (38 assertions)');
