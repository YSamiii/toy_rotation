export function buildCatalogCountDiagnostic({ catalog, build = {}, uiSearchRows = null, exportedAt = new Date().toISOString() } = {}) {
  const snapshot=catalog?.catalogCountSnapshot?.() || { raw:{ base:0, remote:0, localLearned:0, localRemote:0, total:0 }, tombstoneCount:0, active:0, publicVisible:0, remoteIds:[], localOnlyIds:[], collisionSummary:{canonicalKeyCollisions:[],total:0} };
  return {
    format:'toy-rotation-catalog-count-diagnostic', diagnosticVersion:1, readOnly:true, exportedAt,
    build:{ release:build.RELEASE || build.appVersion || null, buildId:build.buildId || null },
    catalog:snapshot,
    ui:{ searchRows:uiSearchRows, total:snapshot.publicVisible, publicVisibleTotal:snapshot.publicVisible }
  };
}
