// A Governance transport failure is a child view of Admin Workspace, never a
// second global modal. Its close controls restore the still-mounted workspace.
export function renderAdminGovernanceChild({ dialog, loadGovernance, onReturn }) {
  let closeCount=0;
  const close=()=>{if(closeCount++)return;onReturn();};
  const bind=()=>{dialog.querySelector('[data-governance-child-back]')?.addEventListener('click',close,{once:true});dialog.querySelector('[data-governance-child-close]')?.addEventListener('click',close,{once:true});};
  const unavailable=()=>{
    if(!dialog.querySelector('[data-admin-governance-child]'))return;
    dialog.dataset.adminWorkspaceChild='governance-unavailable';
    dialog.innerHTML='<section class="sheet" data-admin-governance-child><header><h2>Catalog Governance</h2><button type="button" data-governance-child-back>‹</button><button type="button" data-governance-child-close>×</button></header><p>Catalog Governance unavailable</p></section>';
    bind();
  };
  dialog.dataset.adminWorkspaceChild='governance-loading';
  dialog.innerHTML='<section class="sheet" data-admin-governance-child><header><h2>Catalog Governance</h2><button type="button" data-governance-child-back>‹</button><button type="button" data-governance-child-close>×</button></header><p>Loading…</p></section>';
  bind();
  Promise.resolve().then(loadGovernance).then(()=>unavailable(),unavailable);
}
