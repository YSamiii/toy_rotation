export function createAdminWorkspaceController({ dialog, getAdminAuthenticated, getPendingCount, renderSettings, renderWorkspace, closeSettingsDialog, trace = () => {} }) {
  const record=(stage,detail={})=>trace(stage,detail);
  const setView=view=>{ dialog.dataset.adminWorkspaceView=view; };
  const restoreSettings=reason=>{
    if(reason==='back')record('back_requested');
    if(reason==='close')record('workspace_close_requested');
    renderSettings({onOpenWorkspace:()=>controller.open(),onClose:()=>controller.closeSettings()});
    setView('settings');
    record('workspace_closed_to_settings',{reason});
  };
  const controller={
    get activeView(){return dialog.dataset.adminWorkspaceView || 'settings';},
    open(){
      record('button_clicked');const authenticated=getAdminAuthenticated();record('auth_state',{authenticated});if(!authenticated)return false;
      record('open_requested');
      try{if(!dialog?.open)throw new Error('settings_dialog_not_open');dialog.__settingsBody ||= dialog.innerHTML;record('workspace_render_started');renderWorkspace({pendingCount:getPendingCount(),onBack:()=>controller.back(),onClose:()=>controller.closeWorkspace()});setView('adminWorkspace');const root=dialog.querySelector('[data-admin-workspace-root]');if(!root||root.hidden||root.getAttribute('aria-hidden')==='true')throw new Error('workspace_not_visible');record('workspace_dom_created');record('workspace_visible');return true;}catch(error){record('error',{message:error.message});return false;}
    },
    back(){restoreSettings('back');},
    closeWorkspace(){restoreSettings('close');},
    closeSettings(){record('settings_closed');closeSettingsDialog();}
  };
  return controller;
}
