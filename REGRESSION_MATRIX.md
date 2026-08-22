# Clean Baseline regression matrix

Run before release:

```sh
node --test tests/*.test.mjs
find src -name '*.js' -print0 | xargs -0 -n1 node --check
```

| Area | Automated coverage | Release-device check |
| --- | --- | --- |
| Startup / migration | legacy field, tombstone, set migration tests | first install, legacy upgrade, reload, offline reload |
| Toy Library | interest toggle, shelf transition, image backup ownership | add, edit, delete, replace image, long list scroll |
| AI / sets | recognition confirmation gives split children independent image refs | recognition, confirmation, six-in-one and Lovevery kit review |
| Rotation | permanent-parent eligibility and large-library timing | generate successive rotations and inspect mechanism diversity |
| Wishlist | shared substitution result, age filter, generic-skill exclusion | thumbnails, full overlap list, purchase priority and recommendation |
| Catalog | tombstone through remote replacement, local-first failed delete | search, filters, add to library/Wishlist, reload after delete |
| Admin | password handshake, gated diagnostics, pending delete reporting | real password sign-in, edit, merge, delete, image update |
| Backup / images | personal/catalog assets retained separately | export/import with user and catalog images |
| i18n | all literal `t()` keys in both dictionaries; all category/skill codes | Chinese/English switch in pages and already-open modal |
| Theme / mobile | semantic light/dark tokens, no component literals, safe area, scroll lock | Chinese/English × light/dark on iPhone Safari/PWA; keyboard, dropdown and modal scrolling |
| Runtime isolation | no old app script or patch import; worker includes every new module | refresh page then offline reload |

The browser runtime must remain the `clean_baseline` entry point only. Historical sources are migration input, never runtime dependencies.
