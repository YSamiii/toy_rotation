export function bindRecognitionReviewSubmit({ form, recognitionDraftId, saveDraft, confirm, onComplete, onError, trace = () => {} }) {
  let submitting=false;
  const buttons=[...form.querySelectorAll('[data-destination]')];
  const record=(stage,detail={})=>trace(stage,{recognitionDraftId,...detail});
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const destination=event.submitter?.dataset.destination || 'library';
    record(destination==='library'?'add_library_click':'add_wishlist_click',{destination});
    if(submitting){record('duplicate_click_blocked',{destination});return;}
    submitting=true;buttons.forEach(button=>button.disabled=true);
    record('destination_selected',{destination});record('submit_started',{destination});
    try { await saveDraft();const result=await confirm(destination);record('submit_completed',{destination,localToyId:result?.toy?.id||null,candidateId:result?.candidateId||null});record('review_complete',{destination});onComplete(result,destination);record('review_closed',{destination}); }
    catch(error){submitting=false;buttons.forEach(button=>button.disabled=false);record('submit_failed',{destination,message:error?.message||'recognitionFailed'});record('error',{destination,message:error?.message||'recognitionFailed'});onError(error);}
  });
}
