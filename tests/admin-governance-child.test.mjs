import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { renderAdminGovernanceChild } from '../src/ui/admin-governance-child.js';

const dom=new JSDOM('<dialog open><section data-admin-workspace-root>Workspace</section></dialog>');
const dialog=dom.window.document.querySelector('dialog');
let returns=0;
const workspace=()=>{returns++;dialog.innerHTML='<section data-admin-workspace-root>Workspace</section>';delete dialog.dataset.adminWorkspaceChild;};
for(let index=0;index<5;index++){
  renderAdminGovernanceChild({dialog,loadGovernance:()=>Promise.reject(new Error('remote unavailable')),onReturn:workspace});
  await new Promise(resolve=>setTimeout(resolve,0));
  assert.ok(dialog.querySelector('[data-admin-governance-child]'));
  assert.equal(dialog.querySelector('[data-admin-governance-child]').textContent.includes('unavailable'),true);
  assert.equal(dialog.open,true);assert.equal(dom.window.document.querySelectorAll('dialog').length,1);
  dialog.querySelector('[data-governance-child-close]').click();
  assert.ok(dialog.querySelector('[data-admin-workspace-root]'));assert.equal(dialog.open,true);assert.equal(dom.window.document.querySelectorAll('[data-admin-governance-child]').length,0);
}
assert.equal(returns,5);
renderAdminGovernanceChild({dialog,loadGovernance:()=>Promise.reject(new Error('remote unavailable')),onReturn:workspace});await new Promise(resolve=>setTimeout(resolve,0));
dialog.querySelector('[data-governance-child-close]').click();dialog.querySelector('[data-governance-child-close]')?.click();assert.equal(returns,6);
console.log('admin governance child lifecycle: PASS (32 assertions)');
