const CACHE = 'monster-dojo-v1';
const ASSETS = [
  './', './index.html', './style.css', './game.js', './manifest.json',
  './icon-192.png', './icon-512.png',
  './art/sm/flarepup.png', './art/sm/splashling.png', './art/sm/sproutle.png',
  './art/sm/kai.png', './art/sm/sensei-momo.png',
  './art/sm/cindermite.png', './art/sm/puddlefin.png', './art/sm/mossbun.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first (so new art/code shows up), fall back to cache when offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}))
  );
});
