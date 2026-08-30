const OUTPUT_SIZE = 1024;

// The canvas/editor primitive is intentionally storage-agnostic.  Callers decide
// whether its output becomes a personal image or a shared Catalog image.
export function attachImageEditor({ input, host, t, onEdited, initialSource = null, title = null }) {
  let image = null;
  let sourceDataUrl = null;
  let state = freshState();
  let dragging = null;

  const editorTitle = title || t('personalImageEditor');
  host.innerHTML = `<section class="personal-image-editor hidden" aria-label="${escapeAttribute(editorTitle)}">
    <header><h3>${escapeHtml(editorTitle)}</h3></header>
    <p>${escapeHtml(t('cropImageHint'))}</p>
    <div class="personal-image-crop"><canvas width="${OUTPUT_SIZE}" height="${OUTPUT_SIZE}"></canvas></div>
    <label>${escapeHtml(t('zoomImage'))}<input data-image-zoom type="range" min="1" max="3.5" step="0.05" value="1"></label>
    <div class="image-editor-actions">
      <button type="button" data-image-rotate>${escapeHtml(t('rotateImage'))}</button>
      <button type="button" data-image-reset>${escapeHtml(t('resetImage'))}</button>
      <button type="button" data-image-cancel>${escapeHtml(t('cancel'))}</button>
      <button type="button" class="primary" data-image-save>${escapeHtml(t('cropAndUseImage'))}</button>
    </div>
  </section>`;
  const editor = host.querySelector('.personal-image-editor');
  const canvas = editor.querySelector('canvas');
  const zoom = editor.querySelector('[data-image-zoom]');
  const context = canvas.getContext('2d');

  const loadSource = async source => {
    if (!source) return false;
    sourceDataUrl = source;
    image = await loadImage(sourceDataUrl);
    state = freshState(); zoom.value = '1';
    editor.classList.remove('hidden');
    draw(context, canvas, image, state);
    return true;
  };

  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    await loadSource(await fileToDataUrl(file));
  });
  zoom.addEventListener('input', () => { state.zoom = Number(zoom.value); draw(context, canvas, image, state); });
  editor.querySelector('[data-image-rotate]').addEventListener('click', () => { state.rotation = (state.rotation + 90) % 360; draw(context, canvas, image, state); });
  editor.querySelector('[data-image-reset]').addEventListener('click', () => { state = freshState(); zoom.value = '1'; draw(context, canvas, image, state); });
  editor.querySelector('[data-image-cancel]').addEventListener('click', () => { input.value = ''; sourceDataUrl = null; image = null; state = freshState(); editor.classList.add('hidden'); onEdited(null); });
  editor.querySelector('[data-image-save]').addEventListener('click', () => {
    if (!image) return;
    draw(context, canvas, image, state);
    onEdited(canvas.toDataURL('image/jpeg', 0.92));
    editor.classList.add('hidden');
  });
  canvas.addEventListener('pointerdown', event => { dragging = pointer(canvas, event); canvas.setPointerCapture?.(event.pointerId); });
  canvas.addEventListener('pointermove', event => {
    if (!dragging || !image) return;
    const next = pointer(canvas, event); state.panX += next.x - dragging.x; state.panY += next.y - dragging.y; dragging = next; draw(context, canvas, image, state);
  });
  const stopDragging = event => { dragging = null; canvas.releasePointerCapture?.(event.pointerId); };
  canvas.addEventListener('pointerup', stopDragging); canvas.addEventListener('pointercancel', stopDragging);
  const ready=Promise.resolve(initialSource).then(loadSource).catch(() => false);
  return {
    ready,
    get sourceDataUrl() { return sourceDataUrl; },
    editedDataUrl() { if (!image) return null; draw(context,canvas,image,state); return canvas.toDataURL('image/jpeg',0.92); },
    reset() { input.value=''; editor.classList.add('hidden'); state=freshState(); image=null; sourceDataUrl=null; }
  };
}

// Kept as the explicit ownership-scoped entry point for Toy Library flows.
// It never writes storage itself; the Personal flow alone calls savePersonal.
export function attachPersonalImageEditor(options) {
  return attachImageEditor({ ...options, title:options.title || options.t('personalImageEditor') });
}

export function imageDrawGeometry(imageWidth, imageHeight, rotation, zoom = 1, panX = 0, panY = 0, size = OUTPUT_SIZE) {
  const quarterTurn = Math.abs(rotation % 180) === 90;
  const rotatedWidth = quarterTurn ? imageHeight : imageWidth;
  const rotatedHeight = quarterTurn ? imageWidth : imageHeight;
  const cover = Math.max(size / rotatedWidth, size / rotatedHeight);
  return { scale:cover * zoom, centerX:size / 2 + panX, centerY:size / 2 + panY };
}

function draw(context, canvas, image, state) {
  if (!image) return;
  const geometry = imageDrawGeometry(image.naturalWidth || image.width, image.naturalHeight || image.height, state.rotation, state.zoom, state.panX, state.panY, canvas.width);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save(); context.translate(geometry.centerX, geometry.centerY); context.rotate(state.rotation * Math.PI / 180); context.scale(geometry.scale, geometry.scale);
  context.drawImage(image, -(image.naturalWidth || image.width) / 2, -(image.naturalHeight || image.height) / 2); context.restore();
}
function pointer(canvas, event) { const rect=canvas.getBoundingClientRect(); return { x:(event.clientX-rect.left)*canvas.width/rect.width, y:(event.clientY-rect.top)*canvas.height/rect.height }; }
function freshState() { return { rotation:0, zoom:1, panX:0, panY:0 }; }
function loadImage(source) { return new Promise((resolve,reject) => { const image=new Image(); image.onload=()=>resolve(image); image.onerror=reject; image.src=source; }); }
function fileToDataUrl(file) { return new Promise((resolve,reject) => { const reader=new FileReader(); reader.onload=()=>resolve(reader.result); reader.onerror=reject; reader.readAsDataURL(file); }); }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character])); }
function escapeAttribute(value) { return escapeHtml(value); }
