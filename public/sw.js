const CACHE_NAME = 'iconvert-v1.9';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/bella-logo.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Don't touch non-GET requests.
  if (req.method !== 'GET') return;

  // Don't intercept cross-origin requests (e.g. ffmpeg-core from jsdelivr,
  // Gemini API, Google fonts). Letting them go directly to the network avoids
  // SW-level CORS/COEP issues that can cause "Engine Connection Lost" on
  // Safari / iPad PWA.
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for same-origin assets, fall back to cache when offline.
  event.respondWith(
    fetch(req)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, responseClone).catch(() => {});
        });
        return response;
      })
      .catch(() => caches.match(req))
  );
});
