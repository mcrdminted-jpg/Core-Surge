const CORE_SURGE_CACHE='core-surge-shell-v0-7-34';
const CORE_SURGE_ASSETS=[
  './',
  './index.html',
  './404.html',
  './manifest.webmanifest',
  './css/core-surge.min.css',
  './js/core-surge.min.js',
  './assets/app/icon.svg',
  './assets/cores/core_01_sentinel.png',
  './assets/cores/core_02_industrial.png',
  './assets/cores/core_03_verdant.png',
  './assets/cores/core_04_aegis.png',
  './assets/cores/core_05_frost.png',
  './assets/cores/core_06_royal.png',
  './assets/backgrounds/bg_01_cyber_grid.png',
  './assets/backgrounds/bg_02_industrial.png',
  './assets/backgrounds/bg_03_organic.png',
  './assets/backgrounds/bg_04_steel.png'
];

self.addEventListener('install',(e)=>{
  e.waitUntil(
    caches.open(CORE_SURGE_CACHE)
      .then(c=>c.addAll(CORE_SURGE_ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',(e)=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CORE_SURGE_CACHE).map(k=>caches.delete(k)))
    ).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',(e)=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==self.location.origin)return;
  if(e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request).then(r=>{
        const c=r.clone();
        caches.open(CORE_SURGE_CACHE).then(cache=>cache.put('./index.html',c));
        return r;
      }).catch(()=>caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached)return cached;
      return fetch(e.request).then(r=>{
        if(!r||r.status!==200||r.type!=='basic')return r;
        const c=r.clone();
        caches.open(CORE_SURGE_CACHE).then(cache=>cache.put(e.request,c));
        return r;
      });
    })
  );
});
