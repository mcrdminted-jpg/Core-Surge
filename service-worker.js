const CORE_SURGE_CACHE = 'core-surge-shell-v0-7-28';
const CORE_SURGE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  // CSS
  './css/theme.css',
  './css/base.css',
  './css/battle.css',
  './css/menu.css',
  './css/skins.css',
  './css/profile.css',
  './css/mockup-overlay.css',
  // JS
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
  // App icons
  './assets/app/icon.svg',
  './assets/app/icon-180.png',
  './assets/app/icon-192.png',
  './assets/app/icon-512.png',
  // Core skins
  './assets/cores/core_01_sentinel.png',
  './assets/cores/core_02_industrial.png',
  './assets/cores/core_03_verdant.png',
  './assets/cores/core_04_aegis.png',
  './assets/cores/core_05_frost.png',
  './assets/cores/core_06_royal.png',
  // Backgrounds
  './assets/backgrounds/bg_01_cyber_grid.png',
  './assets/backgrounds/bg_02_industrial.png',
  './assets/backgrounds/bg_03_organic.png',
  './assets/backgrounds/bg_04_steel.png',
  // Enemies
  './assets/enemies/enemy_01_scout_cyan.png',
  './assets/enemies/enemy_02_runner_orange.png',
  './assets/enemies/enemy_03_tank_green.png',
  './assets/enemies/enemy_04_shooter_violet.png',
  './assets/enemies/enemy_05_spitter_acid.png',
  './assets/enemies/enemy_06_flyer_azure.png',
  './assets/enemies/enemy_07_reaver_crimson.png',
  './assets/enemies/enemy_08_warden_gold.png',
  './assets/enemies/enemy_09_sentry_teal.png',
  './assets/enemies/enemy_10_brute_amethyst.png',
  './assets/enemies/enemy_11_elite_ember.png',
  './assets/enemies/enemy_12_boss_void.png',
  // VFX
  './assets/vfx/burst_azure.png',
  './assets/vfx/burst_gold.png',
  './assets/vfx/burst_violet.png',
  './assets/vfx/explode_fire.png',
  './assets/vfx/heal_green.png',
  './assets/vfx/impact_cyan.png',
  './assets/vfx/impact_ember.png',
  './assets/vfx/missile_arrow_pink.png',
  './assets/vfx/missile_bullet_fire.png',
  './assets/vfx/missile_chevron_green.png',
  './assets/vfx/missile_rocket_blue.png',
  './assets/vfx/missile_rocket_violet.png',
  './assets/vfx/missile_tri_arrow_pink.png',
  './assets/vfx/muzzle_azure.png',
  './assets/vfx/muzzle_gold.png',
  './assets/vfx/muzzle_green.png',
  './assets/vfx/muzzle_magenta.png',
  './assets/vfx/pickup_coin.png',
  './assets/vfx/proj_comet_blue.png',
  './assets/vfx/proj_link_green.png',
  './assets/vfx/proj_plasma_violet.png',
  './assets/vfx/proj_ring_azure.png',
  './assets/vfx/proj_spear_cyan.png',
  './assets/vfx/proj_star_gold.png',
  './assets/vfx/shield_teal.png',
  './assets/vfx/shield_violet.png',
  './assets/vfx/spark_azure.png',
  './assets/vfx/spark_gold.png',
  './assets/vfx/spark_green.png',
  './assets/vfx/spark_pink.png',
  // Mockups
  './assets/mockups/research_hdr.png'
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
