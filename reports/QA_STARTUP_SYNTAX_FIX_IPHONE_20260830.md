# v0.11.3 Startup Syntax Fix iPhone QA

Status: targeted iPhone startup candidate only. Not Stable. No production Worker deployment.

## Device evidence

The iPhone Startup Diagnostic reported the last successful phase as `main_load_started`, followed by `Unexpected token ')'`. The device had successfully loaded `src/main.js` with an expected JavaScript content type; persistence, migration and hydration had not begun.

## Exact parser root cause

`src/features/persistence-diagnostic.js`, line 69, column 8 contained one surplus closing parenthesis in the nested `Promise.all(stores.map(...new Promise(...)))` expression:

`}))));` → `})));`

`src/main.js` statically imports this module, so WebKit parses it while resolving the module graph before `main.js` can execute. That explains the device marker stopping after the request phase. Node 24 accepted this malformed construct in its syntax-check path; esbuild targeting Safari 16 correctly rejected it as `Expected ";" but found ")"`.

## Fixes in this candidate

- An ES2017-compatible error bridge and five-second watchdog are installed inline in `index.html`, before `config.js` and `src/main.js` are requested.
- Module load errors, syntax errors and unhandled rejections replace the static spinner with independent Safe Mode UI containing Retry and Startup Diagnostic.
- `main.js` contributes its detailed phases only after the module has begun execution; it no longer owns the sole failure boundary.
- `runtime-js-syntax-gate.mjs` walks the actual deploy entry graph and invokes `node --check` on every reachable runtime JavaScript asset.
- `safari-runtime-compatibility-gate.mjs` bundles the same graph with `esbuild --target=safari16`.
- `generate-runtime-js-manifest.mjs` writes `runtime-js-manifest.json` with URL, byte length, SHA-256, importer path and static/dynamic import relationships. Startup Diagnostic fetches every listed runtime JS and reports `deployed_asset_mismatch` when its hash differs.
- The archive builder runs all three gates before creating an archive and refuses to overwrite a pre-existing output.
- The Service Worker remains a minimal, network-first offline enhancement and is not a startup prerequisite.

## Checks

- Runtime syntax gate: PASS, 43 JavaScript files checked.
- Safari target compatibility: PASS, `safari16`, 39 bundled module inputs.
- Runtime import manifest: 43 files, all source/deploy hashes match at build time.
- Node parser: `src/main.js`, `config.js`, `sw.js`, `startup-diagnostic.js`: PASS.
- Automated regression: 195 / 195 PASS.
- Local deploy smoke: root, index, config, module, CSS, manifest, service worker and both diagnostics: HTTP 200 with expected content type.

## iPhone verification

Verify both Safari and the Home Screen PWA leave the static spinner. If a runtime resource still fails, Safe Mode must appear within five seconds; open `startup-diagnostic.html` and export the resulting JSON. Do not start entering a new Toy Library until this passes.
