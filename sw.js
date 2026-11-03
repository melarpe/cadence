/* © 2026 Melarpe · Melissa Aristizabal. All rights reserved. Not open source: see LICENSE. */
/* Cadence · service worker: makes the app open offline.
 * Bump VERSION whenever you change a file so phones download the new one. */
const VERSION = 'cadence-v3.0.5';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './css/styles.css',
  './js/i18n.js', './js/templates.js', './js/firebase-config.js', './js/store.js', './js/cloud.js', './js/app.js',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Same-origin files: serve from cache, refresh in the background.
// Anything else (Firebase) always goes to the network.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const cached = await cache.match(e.request, { ignoreSearch: true });
    const network = fetch(e.request).then(res => {
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    }).catch(() => cached);
    return cached || network;
  }));
});
