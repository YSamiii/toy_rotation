# Toy Rotation Clean Baseline — release audit

## Runtime consolidation

- **Old patch/override runtime removed:** 312 historical assignment, wrapper, cloned-listener and deferred-install patterns are excluded from this runtime. The release entry point imports no historical `app-v*`, `final_v*`, patch, override or monkey-patch script.
- **Duplicate render paths removed:** historical multiple `renderWishlist`, `renderLibraryInsights`, `renderNextCandidates`, `render`, catalog-dialog and delete paths are replaced by one clean entry renderer plus focused domain modules.
- **Legacy source retention:** prior version folders remain outside this release directory only as read-once migration/reference input; they are not served, cached or bundled.

## Final authorities

| Concern | Sole authority |
| --- | --- |
| Schema and migrations | `src/data/schema.js`, `src/data/store.js` |
| Catalog active view | `src/domain/catalog-repository.js`: base + remote + admin edits − tombstones |
| Standard deletion | `CatalogRepository.deleteStandardToy()` plus local-first `AdminService.delete()` |
| Images | `src/data/image-repository.js` typed `personal`, `catalog`, `remote`, `placeholder` refs |
| Duplicate detection | `src/domain/duplicate-engine.js` |
| Wishlist substitution / priority / overlap | `src/domain/substitution-engine.js` |
| Rotation scoring | `src/domain/rotation-engine.js` |
| Interest state | `src/domain/library-service.js` |
| Explicit set splitting | `src/domain/set-service.js` |
| AI recognition lifecycle | `src/features/recognition-service.js` |
| Administrator authentication / diagnostics | `src/features/admin-service.js` |
| Fixed UI text and code display | `src/ui/i18n.js` |
| Theme and modal/mobile behavior | `src/ui/theme.css`, `src/ui/app.css`, `src/ui/modal-manager.js` |

## Data compatibility

- **schemaVersion:** 2.
- Reads historic local state once, normalizes category/skill display values to codes, promotes legacy split-set markers, normalizes `other/其它/其他/unknown` brands, preserves tombstones/admin edits, and converts legacy image fields to typed image references.
- The original localStorage keys and IndexedDB photo store are read without deleting old data on first clean-baseline launch.
- Catalog and personal image ownership are separate; deleting either record cannot delete the other owner’s blob.

## Verified regression

`node --test tests/*.test.mjs` passes **25/25**:

- migration, catalog tombstone persistence across remote replacement, and local-first failed admin deletion;
- password-gated administrator diagnostics and sign-in handshake;
- backup/restore image ownership;
- AI split-set independent child images and stable explicit multi-puzzle children;
- interest cancellation and shelf state;
- one substitution result with generic skill-only exclusion from purchase impact;
- permanent shelf and split-parent rotation rules;
- Chinese/English dictionaries and every literal renderer key;
- Light/Dark semantic tokens, no component-level literal colours, safe area, modal scroll lock, escaped-newline and old-runtime checks;
- service-worker import coverage;
- 850-toy substitution + rotation performance smoke test (latest run: ~67 ms; budget: <750 ms).

## Backend diagnosis

- `GET /health` returned 200 and reports `adminCatalog` and `permanentDeletedIdentities` support.
- Anonymous `GET /admin-auth` returned 401, confirming the password gate is enforced.
- `GET /quota` returned 404, so the manager dashboard intentionally reports quota as unavailable rather than treating that as an authentication failure.

## Known release-device check

The automated mobile suite verifies safe-area CSS, 44px controls, `touch-action`, dialog overscroll containment and touch background blocking. The local environment does not have a Chromium executable, so the final iPhone Safari/PWA visual pass remains a release-device checklist item in `REGRESSION_MATRIX.md`; it is not claimed as having been physically run here.
