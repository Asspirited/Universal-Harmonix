// Universal Harmonix — Service Worker
// HTML (index.html): network-first — always gets fresh markup on a normal load.
// Static assets (JS, images, manifest): cache-first — fast repeat loads, offline support.

const CACHE = 'uh-v6';
const PRECACHE = [
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
  const url = new URL(e.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isCdnAsset   = url.hostname === 'cdn.jsdelivr.net';

  if (!isSameOrigin && !isCdnAsset) return;

  // Network-first for HTML — hard refresh always gets fresh markup
  const isHTML = url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  if (isHTML) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for everything else
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      });
    })
  );
});
