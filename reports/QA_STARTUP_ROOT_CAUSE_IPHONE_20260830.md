# v0.11.3 Startup Root Cause iPhone QA

Status: targeted QA candidate; not Stable; no production Worker action.

## Root cause

The previous watchdog was registered inside `src/main.js`. Browser modules resolve and evaluate their static import graph before executing the body of `main.js`; therefore a failed, stale, HTML-returning, syntax-invalid, or unsupported module could leave the static `index.html` spinner indefinitely visible without ever registering the watchdog.

## Fix

- `index.html` now installs an ES2017-compatible shell watchdog and global `error` / `unhandledrejection` capture before `config.js` or `main.js` are requested.
- The shell watchdog replaces the spinner after five seconds with an independent safe error screen containing Retry and Startup Diagnostic.
- `main.js` reports exact startup phases to the same independent buffer and completes the shell watchdog only after the first render.
- A new `startup-diagnostic.html` fetches the root app shell, config, module, CSS, manifest and service worker with timeouts. It reports status, content type, HTML masquerading as JavaScript, service-worker state and the last early startup marker without loading `main.js`.
- The service worker is reduced to a network-first minimal fallback shell. It is an offline enhancement only and no longer attempts to precache the entire application module graph.

## Automated evidence

- 193 / 193 automated regressions PASS.
- JavaScript syntax: `main.js`, `sw.js`, and `startup-diagnostic.js` PASS.
- Local root-path deploy smoke: `/`, `index.html`, `config.js`, `src/main.js`, CSS, manifest, `sw.js`, and both diagnostics all returned HTTP 200 with expected content types.

## iPhone verification required

1. Cold-open Safari at the deployed root.
2. Cold-open the Home Screen installation.
3. Kill and reopen the Home Screen application.
4. Open offline.
5. If normal startup fails, verify the spinner changes into the Safe Mode screen within five seconds and open `startup-diagnostic.html`.

No local persistence reset, migration, catalog sync, Worker call, or automatic recovery is performed by this QA candidate.
