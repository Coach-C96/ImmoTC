/* ImmoTC Service Worker – macht die App offline-fähig.
   Strategie: Cache zuerst, im Hintergrund aktualisieren. */
const CACHE = 'immotc-v1';
const DATEIEN = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const frisch = fetch(e.request).then(netz => {
        if (netz && netz.ok) caches.open(CACHE).then(c => c.put(e.request, netz.clone()));
        return netz;
      }).catch(() => cached || Response.error());
      return cached || frisch;
    })
  );
});
