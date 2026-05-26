const CORE_SURGE_CACHE = 'core-surge-shell-v0-7-28';
const CORE_SURGE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/theme.css',
  './css/base.css',
  './css/battle.css',
  './css/menu.css',
  './css/skins.css',
  './css/profile.css',
  './css/mockup-overlay.css',
  './js/data.js',
  './js/save.js',
  './js/game.js',
  './js/tournament.js',
  './js/render.js',
  './js/ui.js',
  './js/firebase-public-config.js',
  './js/cloud.js',
  './js/monetization.js',
  './js/main.js',
  './js/skins.js',
  './js/profile.js',
  './assets/app/icon.svg',
  './assets/app/icon-180.png',
  './assets/app/icon-192.png',
  './assets/app/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_SURGE_CACHE).then((cache) => cache.addAll(CORE_SURGE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CORE_SURGE_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CORE_SURGE_CACHE).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const copy = response.clone();
        caches.open(CORE_SURGE_CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
