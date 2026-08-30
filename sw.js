const CACHE = 'toy-rotation-v0.11.3-clean-rebuild-final-iphone-20260830-a';
const ASSETS = [
  './', './index.html', './config.js', './manifest.webmanifest', './storage-recovery-diagnostic.html', './storage-recovery-diagnostic.js', './src/features/standalone-storage-diagnostic-core.js',
  './catalog-base.json', './catalog-remote.json', './catalog-candidates.json',
  './src/main.js', './src/data/schema.js', './src/data/store.js',
  './src/data/image-repository.js', './src/data/backup-service.js', './src/data/catalog-image-assets.js', './src/data/catalog-image-assets-batch1.js', './src/data/catalog-image-assets-batch2.js', './src/data/catalog-image-assets-batch3.js', './src/data/catalog-image-assets-batch4.js',
  './src/data/catalog-image-assets-batch5.js',
  './src/data/catalog-image-assets-batch6.js',
  './src/data/catalog-image-assets-batch7.js',
  './src/data/catalog-image-assets-batch8.js',
  './src/data/catalog-image-assets-batch9.js',
  './src/data/catalog-image-assets-hape-batch1.js',
  './src/data/catalog-image-assets-hape-batch2.js',
  './src/data/catalog-image-assets-hape-final-resolution.js',
  './src/data/hape-final-resolution-review.js',
  './src/domain/catalog-repository.js', './src/domain/catalog-presentation.js', './src/domain/substitution-engine.js', './src/domain/identity-service.js',
  './src/domain/rotation-engine.js', './src/domain/duplicate-engine.js', './src/domain/library-service.js', './src/domain/set-service.js',
  './src/domain/profile-service.js',
  './src/features/admin-service.js', './src/features/recognition-service.js', './src/features/shared-catalog-governance.js', './src/features/data-repair-diagnostic.js', './src/features/persistence-diagnostic.js', './src/features/restore-diagnostic.js', './src/features/startup-trace.js', './src/features/runtime-image-diagnostic.js',
  './src/ui/i18n.js', './src/ui/modal-manager.js', './src/ui/personal-image-editor.js', './src/ui/theme.css', './src/ui/app.css',
  './icons/header-logo.png', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
  './catalog-assets/bduck-bounce-catch-game.webp'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => Promise.allSettled(ASSETS.map(asset => cache.add(asset)))).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // AI POSTs and third-party product images never enter the application cache.
  if (url.origin !== self.location.origin) return;
  // The emergency diagnostic is deliberately network-first. A stale service
  // worker must never keep an older diagnostic page in front of recovery.
  if (url.pathname.endsWith('/storage-recovery-diagnostic.html') || url.pathname.endsWith('/storage-recovery-diagnostic.js') || url.pathname.endsWith('/standalone-storage-diagnostic-core.js')) {
    event.respondWith(fetch(new Request(event.request, { cache:'no-store' })).catch(() => caches.match(event.request)));
    return;
  }
  // The app shell must never be held behind a stale installed-PWA cache. On
  // iOS standalone navigation is especially prone to retaining an old shell;
  // network-first keeps index/config/main coherent while still falling back
  // offline to the last complete shell.
  const isNavigation=event.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  const isBootAsset=/\/(index\.html|config\.js|src\/main\.js|manifest\.webmanifest)$/.test(url.pathname);
  if (isNavigation || isBootAsset) {
    event.respondWith(fetch(new Request(event.request, { cache:'no-store' })).then(response => {
      const copy=response.clone(); void caches.open(CACHE).then(cache=>cache.put(event.request,copy)); return response;
    }).catch(()=>caches.match(event.request).then(hit=>hit || caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
