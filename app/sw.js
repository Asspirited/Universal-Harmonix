// Universal Harmonix — Service Worker
// Cache-first strategy for all static app assets.
// Enables offline use after first visit.

const CACHE = 'uh-v2';
const PRECACHE = [
  './',
  './index.html',
  './js/domain.js',
  './js/storage.js',
  './js/format.js',
  './js/photo.js',
  './js/render.js',
  './js/export.js',
  './manifest.json',
  './images/bg.jpg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only intercept same-origin requests and the satellite.js CDN
  const url = new URL(e.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isCdnAsset   = url.hostname === 'cdn.jsdelivr.net';

  if (!isSameOrigin && !isCdnAsset) return; // let external API calls (OpenSky, ISS, etc.) pass through

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
