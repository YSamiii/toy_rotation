// Offline enhancement only. The page starts without this worker: failed
// install/activation/cache work must never gate first paint or startup.
importScripts('./sw-precache-assets.js');
const CACHE = 'toy-rotation-v0.11.6-rotation-cross-age-qa11-20260924';
const FALLBACK_ASSETS = [
  './index.html', './config.js', './app.bundle.js', './src/ui/theme.css', './src/ui/app.css',
  './manifest.webmanifest', './storage-recovery-diagnostic.html', './storage-recovery-diagnostic.bundle.js',
  './startup-diagnostic.html', './startup-diagnostic.bundle.js'
];
const PACKAGED_ASSETS = Array.isArray(self.TOY_ROTATION_PACKAGED_ASSETS) ? self.TOY_ROTATION_PACKAGED_ASSETS : [];
const PRECACHE_ASSETS = [...new Set([...FALLBACK_ASSETS, ...PACKAGED_ASSETS])];
self.addEventListener('install', event => {
  // Individual cache errors are deliberately non-fatal. The installed page
  // still has the network and a prior complete cache as fallbacks.
  event.waitUntil(caches.open(CACHE).then(cache => Promise.allSettled(PRECACHE_ASSETS.map(path => cache.add(path)))).then(() => self.skipWaiting()).catch(() => undefined));
});
self.addEventListener('activate', event => event.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('toy-rotation-') && key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim())
));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url=new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const navigation=event.request.mode === 'navigate';
  const bootAsset=/\/(index\.html|config\.js|app\.bundle\.js|src\/ui\/(?:theme|app)\.css|manifest\.webmanifest|startup-diagnostic\.html|startup-diagnostic\.bundle\.js|storage-recovery-diagnostic\.html|storage-recovery-diagnostic\.bundle\.js)$/.test(url.pathname);
  const packagedAsset=/\/catalog-assets\//.test(url.pathname);
  if (!navigation && !bootAsset && !packagedAsset) return;
  if (packagedAsset) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(new Request(event.request,{ cache:'no-store' })).then(response => {
      if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request,response.clone())).catch(()=>undefined);
      return response;
    })));
    return;
  }
  event.respondWith(fetch(new Request(event.request,{ cache:'no-store' })).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request,response.clone())).catch(()=>undefined);
    return response;
  }).catch(async () => (await caches.match(event.request)) || (navigation ? await caches.match('./index.html') : Response.error())));
});
