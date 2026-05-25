const fs = require('node:fs/promises');
const path = require('node:path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const pkg = require(path.join(root, 'package.json'));
const version = pkg.version;
const cacheKey = `core-surge-shell-v${version.replace(/\./g, '-')}`;

const JS_ORDER = [
  'js/data.js',
  'js/save.js',
  'js/game.js',
  'js/tournament.js',
  'js/render.js',
  'js/ui.js',
  'js/cloud.js',
  'js/monetization.js',
  'js/main.js',
  'js/skins.js',
  'js/profile.js',
];

const CSS_ORDER = [
  'css/theme.css',
  'css/base.css',
  'css/battle.css',
  'css/menu.css',
  'css/skins.css',
  'css/profile.css',
  'css/mockup-overlay.css',
];

async function concatFiles(files) {
  const parts = [];
  for (const f of files) {
    const content = await fs.readFile(path.join(root, f), 'utf8');
    parts.push(`/* === ${f} === */\n${content}`);
  }
  return parts.join('\n');
}

async function buildJS() {
  const versionBanner = `window.GAME_VERSION="${version}";`;
  const raw = await concatFiles(JS_ORDER);
  const combined = versionBanner + '\n' + raw;
  const result = await esbuild.transform(combined, {
    minify: true,
    target: ['es2020'],
    loader: 'js',
  });
  const outPath = path.join(dist, 'js', 'core-surge.min.js');
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, result.code);
  return { raw: combined.length, min: result.code.length };
}

async function buildCSS() {
  const raw = await concatFiles(CSS_ORDER);
  const result = await esbuild.transform(raw, {
    minify: true,
    loader: 'css',
  });
  const outPath = path.join(dist, 'css', 'core-surge.min.css');
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, result.code);
  return { raw: raw.length, min: result.code.length };
}

async function buildHTML() {
  let html = await fs.readFile(path.join(root, 'index.html'), 'utf8');

  html = html.replace(/<!-- JS:.*?-->\s*/s, '');

  html = html.replace(/<script src="js\/[^"]+"><\/script>\s*/g, '');

  html = html.replace(
    /(<script src="https:\/\/www\.gstatic\.com\/firebasejs\/[^"]+"><\/script>\s*)+/,
    (firebaseBlock) => firebaseBlock + `<script src="js/core-surge.min.js"></script>\n`
  );

  const localCssRe = /<link rel="stylesheet" href="css\/[^"]+">\s*/g;
  let firstCss = true;
  html = html.replace(localCssRe, (match) => {
    if (firstCss) {
      firstCss = false;
      return `<link rel="stylesheet" href="css/core-surge.min.css">\n`;
    }
    return '';
  });

  await fs.writeFile(path.join(dist, 'index.html'), html);
}

async function buildServiceWorker() {
  const sw = `const CORE_SURGE_CACHE='${cacheKey}';
const CORE_SURGE_ASSETS=[
  './',
  './index.html',
  './manifest.webmanifest',
  './css/core-surge.min.css',
  './js/core-surge.min.js',
  './assets/app/icon.svg',
  './assets/cores/core_04_aegis.png'
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
`;
  await fs.writeFile(path.join(dist, 'service-worker.js'), sw);
}

async function copyStatic() {
  await fs.cp(path.join(root, 'manifest.webmanifest'), path.join(dist, 'manifest.webmanifest'));
  await fs.cp(path.join(root, 'assets'), path.join(dist, 'assets'), {
    recursive: true,
    filter: (src) => !src.includes('mockups'),
  });
}

async function main() {
  await fs.rm(dist, { recursive: true, force: true });
  await fs.mkdir(dist, { recursive: true });

  const [jsStats, cssStats] = await Promise.all([
    buildJS(),
    buildCSS(),
  ]);
  await buildHTML();
  await buildServiceWorker();
  await copyStatic();

  const kb = (n) => (n / 1024).toFixed(1);
  console.log(`Build v${version} complete:`);
  console.log(`  JS:  ${kb(jsStats.raw)} KB → ${kb(jsStats.min)} KB (${((1 - jsStats.min / jsStats.raw) * 100).toFixed(0)}% reduction)`);
  console.log(`  CSS: ${kb(cssStats.raw)} KB → ${kb(cssStats.min)} KB (${((1 - cssStats.min / cssStats.raw) * 100).toFixed(0)}% reduction)`);
  console.log(`  Cache key: ${cacheKey}`);
  console.log(`  window.GAME_VERSION = "${version}"`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
