/* Offline copy of the game. Fresh files win when online; the saved copy is used when the network is away. */
const CACHE = 'princess-world-v2';
const FILES = ['./', 'index.html', 'style.css', 'game.js', 'hair.js', 'salon.js', 'world.js', 'pets.js', 'castle.js', 'events.js', 'gallery.js', 'ui.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
const FONTS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const origin = new URL(e.request.url).origin, keep = origin === location.origin || FONTS.includes(origin);
  e.respondWith(
    fetch(e.request).then(res => {
      if (keep && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: origin === location.origin }))
  );
});
