import { canonicalKey } from '../data/schema.js';

const REPORT_STATUSES = new Set(['pending', 'reviewing', 'resolved', 'dismissed']);

function reportsContainer(state) {
  state.catalogState ||= {};
  return state.catalogState.catalogReports ||= [];
}

export function getCatalogReports(state) {
  return state?.catalogState?.catalogReports || [];
}

export function getPendingCatalogReports(state) {
  return getCatalogReports(state).filter(report => ['pending', 'reviewing'].includes(report.status));
}

export function getCatalogReportById(state, id) {
  return getCatalogReports(state).find(report => report.id === id) || null;
}

export function createCatalogReport(state, payload = {}) {
  const queue = reportsContainer(state);
  const id = String(payload.id || payload.reportId || crypto.randomUUID());
  const existing = queue.find(report => report.id === id);
  if (existing) {
    if (!existing.attachmentRef && payload.attachmentRef) { existing.attachmentRef=payload.attachmentRef; existing.updatedAt=new Date().toISOString(); }
    return existing;
  }
  const now = payload.createdAt || new Date().toISOString();
  const report = {
    id,
    catalogCanonicalKey: canonicalKey(payload.catalogCanonicalKey || payload.canonicalKey),
    issueType: String(payload.issueType || payload.reportType || 'other'),
    note: String(payload.note ?? payload.description ?? '').slice(0, 1200),
    status: REPORT_STATUSES.has(payload.status) ? payload.status : 'pending',
    createdAt: now,
    updatedAt: payload.updatedAt || now,
    reviewStartedAt: payload.reviewStartedAt || null,
    resolvedAt: payload.resolvedAt || null,
    resolutionType: payload.resolutionType || null,
    resolutionReason: payload.resolutionReason || null,
    // Bytes live in IndexedDB. This is deliberately the only attachment field
    // persisted in canonical state and the transport intent.
    attachmentRef: payload.attachmentRef || null,
    syncStatus: payload.syncStatus || 'pending_local',
    remoteSyncReference: payload.remoteSyncReference || null,
    source: payload.source || 'catalog_report',
    deviceIdPresent: payload.deviceIdPresent === true,
    catalogVersion: Number(payload.catalogVersion || 0),
    appVersion: String(payload.appVersion || '')
  };
  queue.unshift(report);
  return report;
}

export function enqueueCatalogReportSyncIntent(state, report) {
  state.catalogState ||= {}; state.catalogState.syncMetadata ||= {};
  const outbox = state.catalogState.syncMetadata.governanceOutbox ||= [];
  const id = report.id;
  if (!outbox.some(job => job.id === id && job.kind === 'report')) {
    outbox.push({
      id,
      kind: 'report',
      createdAt: report.createdAt,
      payload: {
        reportId: report.id,
        canonicalKey: report.catalogCanonicalKey,
        reportType: report.issueType,
        description: report.note,
        attachmentRef: report.attachmentRef,
        attachmentTransport: report.attachmentRef ? 'deferred_until_remote_contract_updated' : 'none',
        catalogVersion: report.catalogVersion,
        appVersion: report.appVersion
      }
    });
  }
  return report;
}

export function startCatalogReportReview(state, id) {
  const report = getCatalogReportById(state, id); if (!report || report.status !== 'pending') return report;
  const now = new Date().toISOString();
  report.status = 'reviewing'; report.reviewStartedAt = now; report.updatedAt = now; return report;
}

export function resolveCatalogReport(state, id, { reason = null } = {}) {
  return finishCatalogReport(state, id, 'resolved', 'resolved', reason);
}

export function dismissCatalogReport(state, id, { reason = null } = {}) {
  return finishCatalogReport(state, id, 'dismissed', 'dismissed', reason);
}

function finishCatalogReport(state, id, status, resolutionType, reason) {
  const report = getCatalogReportById(state, id); if (!report || !['pending', 'reviewing'].includes(report.status)) return report;
  const now = new Date().toISOString();
  report.status = status; report.resolvedAt = now; report.updatedAt = now;
  report.resolutionType = resolutionType; report.resolutionReason = reason ? String(reason).slice(0, 500) : null;
  return report;
}

export function legacyReportId(job = {}) {
  const payload = job.payload || {};
  if (payload.reportId) return String(payload.reportId);
  const identity = JSON.stringify({ id:job.id || '', canonicalKey:payload.canonicalKey || '', reportType:payload.reportType || '', description:payload.description || '', createdAt:job.createdAt || '' });
  let hash = 2166136261;
  for (const char of identity) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return `legacy-report-${(hash >>> 0).toString(36)}`;
}

export function legacyReportPayload(job, attachmentRef = null) {
  const payload = job.payload || {};
  return {
    id: legacyReportId(job), canonicalKey:payload.canonicalKey, reportType:payload.reportType,
    description:payload.description, status:payload.status, createdAt:payload.createdAt || job.createdAt,
    attachmentRef, catalogVersion:payload.catalogVersion, appVersion:payload.appVersion,
    syncStatus:'pending_remote'
  };
}

export function hasRawAttachment(payload = {}) {
  return typeof payload.optionalAttachment === 'string' && /^data:image\//i.test(payload.optionalAttachment);
}
