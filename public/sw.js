// Bumping the cache name forces clients to upgrade and dump v1.x.
const CACHE_NAME = 'iconvert-v2.0';

// FFmpeg core is loaded from jsDelivr; pre-caching makes cold-starts on
// iPad PWA feel near-instant by serving it from disk instead of refetching
// ~30MB on every launch (iOS evicts PWAs from memory aggressively).
const FFMPEG_BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.4/dist/esm';
const FFMPEG_ASSETS = [
  `${FFMPEG_BASE}/ffmpeg-core.js`,
  `${FFMPEG_BASE}/ffmpeg-core.wasm`,
  `${FFMPEG_BASE}/ffmpeg-core.worker.js`,
];

const APP_SHELL = ['/', '/index.html', '/bella-logo.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // App shell must succeed; ffmpeg precache is best-effort.
    await cache.addAll(APP_SHELL);
    await Promise.all(
      FFMPEG_ASSETS.map(async (url) => {
        try {
          const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
          if (res.ok) await cache.put(url, res);
        } catch (_) { /* network may be flaky on first install — ok */ }
      })
    );
  })());
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
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFfmpeg = url.origin === 'https://cdn.jsdelivr.net'
    && url.pathname.includes('/@ffmpeg/core');

  // FFmpeg core: cache-first so cold launches are instant. Refresh in
  // the background if a network response is available.
  if (isFfmpeg) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) {
        // Refresh in background, ignore failures.
        fetch(req, { mode: 'cors', credentials: 'omit' })
          .then(res => { if (res.ok) cache.put(req, res).catch(() => {}); })
          .catch(() => {});
        return cached;
      }
      const res = await fetch(req, { mode: 'cors', credentials: 'omit' });
      if (res.ok) cache.put(req, res.clone()).catch(() => {});
      return res;
    })());
    return;
  }

  // Anything else cross-origin (Gemini API, fonts, etc): pass through.
  if (!sameOrigin) return;

  // Same-origin: network-first, fall back to cache offline.
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
