const CACHE_NAME = 'bilal-hasan-wedding-v4';
const CORE = ['/', '/index.html', '/assets/envelope-still-life.webp', '/assets/mehndi-scene.webp', '/assets/barat-scene.webp', '/assets/walima-scene.webp', '/assets/mehndi-detail.webp', '/assets/barat-detail.webp', '/assets/walima-detail.webp', '/models/envelope-prop.glb', '/hdri/wedding-studio.hdr', '/assets/landing-impact.wav', '/assets/paper-rustle.wav', '/assets/seal-crack.wav', '/assets/bg-music.mp3', '/manifest.webmanifest'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok && request.destination !== 'document') {
      const clone = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
    }
    return response;
  }).catch(() => caches.match('/index.html'))));
});
