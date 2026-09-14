const MAX_EVENTS = 120;

// Runtime-only diagnostic for the Admin Catalog editor.  Its payload is
// deliberately metadata-only: never add image bytes, request bodies, tokens,
// canonical keys, or server response bodies here.
export class AdminCatalogSaveDiagnostic {
  #recording = false;
  #events = [];
  #clock;

  constructor({ clock = () => new Date().toISOString(), createId = () => crypto.randomUUID() } = {}) {
    this.#clock = clock;
    this.createId = createId;
  }

  get recording() { return this.#recording; }
  get eventCount() { return this.#events.length; }

  start() { this.#recording = true; }
  stop() { this.#recording = false; }
  clear() { this.#events = []; }

  begin({ editedImagePresent = false } = {}) {
    if (!this.#recording) return null;
    const attemptId = this.createId();
    this.record(attemptId, 'submit_received', { editedImagePresent:Boolean(editedImagePresent) });
    return attemptId;
  }

  record(attemptId, stage, details = {}) {
    if (!this.#recording || !attemptId) return;
    this.#events.push({ attemptId, at:this.#clock(), stage, ...sanitize(details) });
    if (this.#events.length > MAX_EVENTS) this.#events.splice(0, this.#events.length - MAX_EVENTS);
  }

  export({ release = null } = {}) {
    return {
      format:'toy-rotation-admin-catalog-save-diagnostic',
      diagnosticVersion:1,
      exportedAt:this.#clock(),
      readOnly:true,
      release,
      recording:this.#recording,
      events:structuredClone(this.#events)
    };
  }
}

export function adminCatalogSaveErrorType(error) {
  const code = String(error?.message || '');
  return ['adminVerificationRequired','adminUnconfigured','catalogImageUploadFailed','adminOperationFailed'].includes(code)
    ? code
    : String(error?.name || 'UnknownError');
}

function sanitize(details) {
  return {
    editedImagePresent:Boolean(details.editedImagePresent),
    status:Number.isInteger(details.status) ? details.status : null,
    ok:typeof details.ok === 'boolean' ? details.ok : null,
    errorType:details.errorType ? String(details.errorType) : null,
    modalOpen:typeof details.modalOpen === 'boolean' ? details.modalOpen : null,
    errorRendered:typeof details.errorRendered === 'boolean' ? details.errorRendered : null,
    editorRetained:typeof details.editorRetained === 'boolean' ? details.editorRetained : null
  };
}
