const rect = box => ({ top:box.top, left:box.left, width:box.width, height:box.height, right:box.right, bottom:box.bottom });
const dataAttributes = element => Object.fromEntries([...element.attributes].filter(attribute => attribute.name.startsWith('data-') && attribute.name !== 'data-image').map(attribute => [attribute.name, attribute.value]));
const safeImageRef = image => {
  try {
    const value=JSON.parse(image.dataset.image || '{}');
    return { kind:value?.kind || null, id:value?.id || null };
  } catch { return { kind:null, id:null }; }
};
const styleSummary = (element, windowRef) => {
  const style=windowRef.getComputedStyle(element);
  return {
    display:style.display, position:style.position, overflow:style.overflow, overflowY:style.overflowY,
    width:style.width, height:style.height, minWidth:style.minWidth, minHeight:style.minHeight,
    maxWidth:style.maxWidth, maxHeight:style.maxHeight, flex:style.flex, flexGrow:style.flexGrow,
    flexShrink:style.flexShrink, alignItems:style.alignItems, alignSelf:style.alignSelf,
    justifyContent:style.justifyContent, gridTemplateRows:style.gridTemplateRows,
    objectFit:style.objectFit, transform:style.transform, scale:style.scale, aspectRatio:style.aspectRatio,
    hasBackgroundImage:style.backgroundImage !== 'none'
  };
};
const pseudoSummary = (element, windowRef) => {
  const summarize = pseudo => {
    try {
      const style=windowRef.getComputedStyle(element, pseudo);
      return { content:style.content, position:style.position, width:style.width, height:style.height, transform:style.transform, hasBackgroundImage:style.backgroundImage !== 'none' };
    } catch { return null; }
  };
  return { before:summarize('::before'), after:summarize('::after') };
};
const elementSummary = (element, windowRef) => element ? {
  tagName:element.tagName, className:element.className || '', dataAttributes:dataAttributes(element), inlineStyle:element.getAttribute('style') || null,
  parentTagName:element.parentElement?.tagName || null, parentClassName:element.parentElement?.className || '',
  rect:rect(element.getBoundingClientRect()), scrollHeight:element.scrollHeight, clientHeight:element.clientHeight,
  computed:styleSummary(element, windowRef), pseudo:pseudoSummary(element, windowRef)
} : null;
const elementAtPoint = (documentRef, x, y, windowRef) => {
  const hit=documentRef.elementFromPoint?.(x, y) || null;
  const closestImage=hit?.closest?.('img') || null;
  const closestBody=hit?.closest?.('.review-body') || null;
  const closestSheet=hit?.closest?.('[data-candidate-detail]') || null;
  return { hit:elementSummary(hit, windowRef), closestImage:elementSummary(closestImage, windowRef), closestReviewBody:elementSummary(closestBody, windowRef), closestSheet:elementSummary(closestSheet, windowRef) };
};

export function captureCandidateLayoutDiagnostic(detail, { windowRef=window, documentRef=document, buildId=window.TOY_ROTATION_CONFIG?.buildId || null, capturedAt=new Date().toISOString() } = {}) {
  const reviewBody=detail?.querySelector('.review-body') || null;
  const image=reviewBody?.querySelector('img[data-image]') || null;
  const imageParent=image?.parentElement || null;
  const dialog=detail?.closest('dialog') || null;
  const imageRect=image?.getBoundingClientRect() || { left:0, top:0, width:0, height:0 };
  const candidates=[...(detail?.querySelectorAll('img,picture,canvas,video,[style*="background"]') || [])].map(element => ({ ...elementSummary(element, windowRef), role:element.matches('img') ? 'img' : element.tagName.toLowerCase() }));
  const viewport={ width:windowRef.innerWidth, height:windowRef.innerHeight, visualViewport:windowRef.visualViewport ? { width:windowRef.visualViewport.width, height:windowRef.visualViewport.height } : null, devicePixelRatio:windowRef.devicePixelRatio };
  return {
    diagnostic:'candidate-layout', buildId, capturedAt, viewport,
    hierarchy:{ dialog:elementSummary(dialog, windowRef), sheet:elementSummary(detail, windowRef), reviewBody:elementSummary(reviewBody, windowRef), imageParent:elementSummary(imageParent, windowRef), image:elementSummary(image, windowRef) },
    image:{ ref:safeImageRef(image || { dataset:{} }), naturalWidth:image?.naturalWidth || 0, naturalHeight:image?.naturalHeight || 0, clientWidth:image?.clientWidth || 0, clientHeight:image?.clientHeight || 0, offsetWidth:image?.offsetWidth || 0, offsetHeight:image?.offsetHeight || 0 },
    elementFromPoint:elementAtPoint(documentRef, imageRect.left + imageRect.width / 2, imageRect.top + imageRect.height / 2, windowRef),
    duplicateVisualElements:candidates,
    metadataGap:image && reviewBody?.querySelector('dl') ? Math.max(0, reviewBody.querySelector('dl').getBoundingClientRect().top - image.getBoundingClientRect().bottom) : null
  };
}

export function exportCandidateLayoutDiagnostic(detail, options = {}) {
  const { documentRef=document, now=Date.now, urlRef=URL, blobRef=Blob, setTimeoutRef=setTimeout, ...captureOptions }=options;
  const diagnostic=captureCandidateLayoutDiagnostic(detail, { documentRef, ...captureOptions });
  const fileName=`candidate-layout-diagnostic-${new Date(now).toISOString().replace(/[:.]/g, '-').replace('Z', '')}.json`;
  const blob=new blobRef([JSON.stringify(diagnostic, null, 2)], { type:'application/json' });
  const url=urlRef.createObjectURL(blob);
  const link=documentRef.createElement('a');
  link.href=url; link.download=fileName; link.style.display='none'; documentRef.body.appendChild(link); link.click(); link.remove(); setTimeoutRef(() => urlRef.revokeObjectURL(url), 1000);
  return { diagnostic, fileName };
}
