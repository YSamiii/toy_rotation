const WATCHDOG_DELAY_MS = 750;

function now() { return typeof performance === 'undefined' ? Date.now() : performance.now(); }

function startupCopy(language = '') {
  return String(language).toLowerCase().startsWith('zh')
    ? { title:'玩具轮换正在启动…', detail:'正在安全加载本地数据。' }
    : { title:'Toy Rotation is starting…', detail:'Loading your local data safely.' };
}

export function beginStartupTrace(globalObject = globalThis) {
  const navigation = globalObject.performance?.getEntriesByType?.('navigation')?.[0];
  const trace = {
    startedAt: new Date().toISOString(),
    release: globalObject.TOY_ROTATION_CONFIG?.RELEASE || 'development',
    latestStage: 'navigation_start',
    stages: {
      navigation_start: 0,
      html_parsed: Number.isFinite(navigation?.domInteractive) ? navigation.domInteractive : null
    },
    errors: []
  };
  globalObject.__TOY_ROTATION_STARTUP_TIMING__ = trace;
  return trace;
}

export function markStartupStage(trace, name, details = undefined) {
  if (!trace) return;
  trace.stages[name] = now();
  trace.latestStage = name;
  if (details !== undefined) (trace.details ||= {})[name] = details;
}

export function markStartupError(trace, stage, error) {
  if (!trace) return;
  trace.errors.push({ stage, message:String(error?.message || error || 'Unknown startup error'), at:now() });
  trace.latestStage = stage;
}

export function renderStartupShell(root, language) {
  if (!root) return;
  const copy = startupCopy(language);
  root.innerHTML = `<section class="startup-shell" role="status" aria-live="polite"><div class="startup-spinner" aria-hidden="true"></div><div><h1>${copy.title}</h1><p data-startup-detail>${copy.detail}</p></div></section>`;
}

export function installStartupWatchdog(root, trace, { delayMs = WATCHDOG_DELAY_MS, language = globalThis.navigator?.language } = {}) {
  return setTimeout(() => {
    if (trace?.stages?.first_meaningful_paint) return;
    const copy = startupCopy(language);
    const stage=trace?.latestStage || 'starting';
    if (root) root.innerHTML=`<section class="startup-shell startup-safe-mode" role="alert"><div><h1>${copy.title}</h1><p>${copy.detail}</p><p><b>Startup phase:</b> ${String(stage)}</p><p>${trace?.errors?.[0]?.message ? String(trace.errors[0].message) : 'The app is still loading. You can retry or open the read-only storage diagnostic.'}</p><div class="actions"><button type="button" data-startup-retry>Retry</button><button type="button" data-startup-diagnostic>Diagnostic</button></div></div></section>`;
    root?.querySelector?.('[data-startup-retry]')?.addEventListener('click', ()=>location.reload());
    root?.querySelector?.('[data-startup-diagnostic]')?.addEventListener('click', ()=>location.assign('./storage-recovery-diagnostic.html'));
    markStartupStage(trace, 'startup_watchdog_visible');
  }, delayMs);
}

export function completeStartupWatchdog(handle) { clearTimeout(handle); }
