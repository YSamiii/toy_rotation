# v0.11.3 Startup Syntax Fix iPhone QA

Status: targeted iPhone startup candidate only. Not Stable. No production Worker deployment.

## Device evidence

The iPhone Startup Diagnostic reported the last successful phase as `main_load_started`, followed by `Unexpected token ')'`. The device had successfully loaded `src/main.js` with an expected JavaScript content type; persistence, migration and hydration had not begun.

## Parser result and reproducibility

The exact device-served JavaScript body was not included in the diagnostic export. The available source, deploy copy, Clean Rebuild QA archive and Startup Root Cause QA archive all parse successfully with `node --check`; therefore no honest local line or column can be assigned to the reported token. This candidate adds a mandatory deploy-graph syntax gate so an unparseable runtime body cannot be packaged from this workspace.

## Fixes in this candidate

- An ES2017-compatible error bridge and five-second watchdog are installed inline in `index.html`, before `config.js` and `src/main.js` are requested.
- Module load errors, syntax errors and unhandled rejections replace the static spinner with independent Safe Mode UI containing Retry and Startup Diagnostic.
- `main.js` contributes its detailed phases only after the module has begun execution; it no longer owns the sole failure boundary.
- `runtime-js-syntax-gate.mjs` walks the actual deploy entry graph and invokes `node --check` on every reachable runtime JavaScript asset. The archive builder runs this gate before creating an archive and refuses to overwrite a pre-existing output.
- The Service Worker remains a minimal, network-first offline enhancement and is not a startup prerequisite.

## Checks

- Runtime syntax gate: PASS, 43 JavaScript files checked.
- Node parser: `src/main.js`, `config.js`, `sw.js`, `startup-diagnostic.js`: PASS.
- Automated regression: 194 / 194 PASS.
- Local deploy smoke: root, index, config, module, CSS, manifest, service worker and both diagnostics: HTTP 200 with expected content type.

## iPhone verification

Verify both Safari and the Home Screen PWA leave the static spinner. If a runtime resource still fails, Safe Mode must appear within five seconds; open `startup-diagnostic.html` and export the resulting JSON. Do not start entering a new Toy Library until this passes.
