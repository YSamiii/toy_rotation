const CACHE = 'toy-rotation-clean-baseline-5';
const ASSETS = [
  './', './index.html', './config.js', './manifest.webmanifest',
  './catalog-remote.json', './catalog-candidates.json',
  './src/main.js', './src/data/schema.js', './src/data/store.js',
  './src/data/image-repository.js', './src/data/backup-service.js',
  './src/domain/catalog-repository.js', './src/domain/substitution-engine.js',
  './src/domain/rotation-engine.js', './src/domain/duplicate-engine.js', './src/domain/library-service.js', './src/domain/set-service.js',
  './src/features/admin-service.js', './src/features/recognition-service.js',
  './src/ui/i18n.js', './src/ui/modal-manager.js', './src/ui/theme.css', './src/ui/app.css',
  './icons/header-logo.png', './icons/icon-192.png', './icons/icon-512.png'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener('fetch', event => event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request))));
