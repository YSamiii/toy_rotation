// Offline enhancement only. The page starts without this worker: failed
// install/activation/cache work must never gate first paint or startup.
const CACHE = 'toy-rotation-v0.11.5-iphone-qa-candidate6-20260904';
const FALLBACK_ASSETS = [
  './index.html', './config.js', './src/main.js', './src/ui/theme.css', './src/ui/app.css',
  './manifest.webmanifest', './storage-recovery-diagnostic.html', './storage-recovery-diagnostic.js',
  './src/features/standalone-storage-diagnostic-core.js', './startup-diagnostic.html', './startup-diagnostic.js'
];
self.addEventListener('install', event => {
  // Individual cache errors are deliberately non-fatal. The installed page
  // still has the network and a prior complete cache as fallbacks.
  event.waitUntil(caches.open(CACHE).then(cache => Promise.allSettled(FALLBACK_ASSETS.map(path => cache.add(path)))).then(() => self.skipWaiting()).catch(() => undefined));
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
  const bootAsset=/\/(index\.html|config\.js|src\/main\.js|src\/ui\/(?:theme|app)\.css|manifest\.webmanifest|startup-diagnostic\.html|startup-diagnostic\.js|storage-recovery-diagnostic\.html|storage-recovery-diagnostic\.js)$/.test(url.pathname);
  if (!navigation && !bootAsset) return;
  event.respondWith(fetch(new Request(event.request,{ cache:'no-store' })).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request,response.clone())).catch(()=>undefined);
    return response;
  }).catch(async () => (await caches.match(event.request)) || (navigation ? await caches.match('./index.html') : Response.error())));
});
