// Diagnostic-only browser snapshot. It neither reads nor changes backup data.
export function buildRestoreDiagnostic({ trace = null, release = null } = {}) {
  const stages = trace?.stages || [];
  const lastSuccessful = [...stages].reverse().find(stage => stage.success) || null;
  return {
    format:'toy-rotation-restore-diagnostic',
    diagnosticVersion:1,
    release,
    exportedAt:new Date().toISOString(),
    safety:{ mutatesAppData:false, includesImageBlobs:false, runsRestoreAlgorithms:false },
    browser:{
      userAgent:navigator.userAgent,
      online:navigator.onLine,
      fileReaderAvailable:typeof FileReader !== 'undefined',
      fileTextAvailable:typeof File !== 'undefined' && typeof File.prototype?.text === 'function',
      indexedDbAvailable:typeof indexedDB !== 'undefined'
    },
    restoreTrace:trace || { status:'no_restore_attempt_recorded', stages:[] },
    interpretation:{
      lastSuccessfulStage:lastSuccessful?.name || null,
      firstFailure:stages.find(stage => stage.success === false) || null,
      handlerEntered:stages.some(stage => stage.name === 'restore_handler_enter'),
      backupServiceEntered:stages.some(stage => stage.name === 'backup_service_enter'),
      fileReadCompleted:stages.some(stage => stage.name === 'file_text_end' || stage.name === 'file_reader_fallback_end'),
      jsonParsed:stages.some(stage => stage.name === 'json_parse_end'),
      committed:stages.some(stage => stage.name === 'atomic_commit_end'),
      completed:trace?.status === 'complete'
    }
  };
}
