const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, msg) {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(msg);
    console.error(`  FAIL: ${msg}`);
  }
}

function assertClose(a, b, msg, epsilon = 0.001) {
  assert(Math.abs(a - b) < epsilon, `${msg} (got ${a}, expected ${b})`);
}

async function loadGameData() {
  const sandbox = {
    Math, Date, Array, Object, JSON, String, Number, parseInt, parseFloat,
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    window: {}, document: { addEventListener() {} },
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    navigator: { serviceWorker: null, onLine: true },
    Notification: { permission: 'default' },
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;

  const ctx = vm.createContext(sandbox);

  const dataCode = await fs.readFile(path.join(root, 'js/data.js'), 'utf8');
  const exports = [
    'CARD_POOL', 'CARD_PRICING', 'PULL_ODDS', 'COPIES_TO_LEVEL',
    'SLOT_UNLOCK_COSTS', 'MAX_TIER', 'MILESTONE_WAVES', 'RANK_DEFS',
    'UNLOCK_FAMILIES', 'FAMILIES_BY_CATEGORY', 'rankCost',
    'TOURNEY_LEAGUES', 'TOURNEY_BRACKET_SIZE', 'TOURNEY_CYCLE_MS',
    'TOURNEY_PROMOTE_PCT', 'TOURNEY_DEMOTE_PCT',
  ];
  const wrapped = dataCode + '\n' + exports.map(e => `this.${e} = typeof ${e} !== 'undefined' ? ${e} : undefined;`).join('\n');
  vm.runInContext(wrapped, ctx, { filename: 'data.js' });

  return ctx;
}

async function runTests() {
  console.log('Core Surge Test Suite\n');
  const ctx = await loadGameData();

  // â”€â”€ 1. Bundle integrity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('â”€â”€ Bundle Integrity â”€â”€');

  const jsFiles = ['data.js', 'save.js', 'game.js', 'tournament.js', 'render.js',
    'ui.js', 'firebase-public-config.js', 'cloud.js', 'monetization.js', 'main.js', 'skins.js', 'profile.js'];
  for (const f of jsFiles) {
    const exists = await fs.access(path.join(root, 'js', f)).then(() => true).catch(() => false);
    assert(exists, `js/${f} exists`);
  }

  const cssFiles = ['theme.css', 'base.css', 'battle.css', 'menu.css', 'skins.css',
    'profile.css', 'mockup-overlay.css'];
  for (const f of cssFiles) {
    const exists = await fs.access(path.join(root, 'css', f)).then(() => true).catch(() => false);
    assert(exists, `css/${f} exists`);
  }

  const indexHtml = await fs.readFile(path.join(root, 'index.html'), 'utf8');
  assert(indexHtml.includes('<!DOCTYPE html>'), 'index.html has DOCTYPE');
  assert(indexHtml.includes('manifest.webmanifest'), 'index.html references manifest');
  assert(indexHtml.includes('Core Surge v0.7.28'), 'index.html title version is current');
  assert(indexHtml.includes('assets/app/icon-180.png'), 'index.html references Apple touch icon');
  assert(indexHtml.includes('assets/app/icon-192.png'), 'index.html references PNG favicon');

  const manifest = JSON.parse(await fs.readFile(path.join(root, 'manifest.webmanifest'), 'utf8'));
  assert(manifest.id === '/', 'manifest id is stable');
  assert(Array.isArray(manifest.icons) && manifest.icons.some((icon) => icon.purpose === 'any'),
    'manifest has an any-purpose icon');
  assert(Array.isArray(manifest.icons) && manifest.icons.some((icon) => icon.purpose === 'maskable'),
    'manifest has a maskable-purpose icon');
  assert(Array.isArray(manifest.icons) && manifest.icons.some((icon) => icon.src === 'assets/app/icon-192.png'),
    'manifest has a 192x192 PNG icon');
  assert(Array.isArray(manifest.icons) && manifest.icons.some((icon) => icon.src === 'assets/app/icon-512.png'),
    'manifest has a 512x512 PNG icon');

  // â”€â”€ 2. Card pool integrity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('â”€â”€ Card Pool â”€â”€');

  const CARD_POOL = ctx.CARD_POOL;
  const cardCount = Object.keys(CARD_POOL).length;
  assert(cardCount >= 20, `Card pool has ${cardCount} cards (expected â‰¥20)`);

  const standardCards = Object.values(CARD_POOL).filter(c => c.tier === 'standard');
  const primeCards = Object.values(CARD_POOL).filter(c => c.tier === 'prime');
  const apexCards = Object.values(CARD_POOL).filter(c => c.tier === 'apex');
  assert(standardCards.length === 12, `12 standard cards (got ${standardCards.length})`);
  assert(primeCards.length >= 8, `â‰¥8 prime cards (got ${primeCards.length})`);
  assert(apexCards.length >= 5, `â‰¥5 apex cards (got ${apexCards.length})`);

  for (const [id, card] of Object.entries(CARD_POOL)) {
    assert(card.id === id, `Card ${id} has matching id field`);
    assert(['standard', 'prime', 'apex'].includes(card.tier), `Card ${id} has valid tier`);
    if (card.values && !card.special && Array.isArray(card.values)) {
      assert(card.values.length === 5, `Card ${id} has 5 value levels`);
      const isTargetCard = card.stat && card.stat.includes('TargetsAdd');
      if (!isTargetCard) {
        for (let i = 1; i < card.values.length; i++) {
          assert(card.values[i] > card.values[i - 1], `Card ${id} values increase (L${i} < L${i + 1})`);
        }
      }
    }
  }

  // â”€â”€ 3. Pull odds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('â”€â”€ Pull Odds â”€â”€');

  const PULL_ODDS = ctx.PULL_ODDS;
  const oddsSum = PULL_ODDS.standard + PULL_ODDS.prime + PULL_ODDS.apex;
  assertClose(oddsSum, 1.0, 'Pull odds sum to 1.0');
  assertClose(PULL_ODDS.apex, 0.02, 'Apex odds = 2%');
  assertClose(PULL_ODDS.prime, 0.20, 'Prime odds = 20%');
  assertClose(PULL_ODDS.standard, 0.78, 'Standard odds = 78%');

  // â”€â”€ 4. Card pricing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('â”€â”€ Card Pricing â”€â”€');

  const CARD_PRICING = ctx.CARD_PRICING;
  assert(CARD_PRICING.pullSingle === 20, `Single pull costs 20 gems (got ${CARD_PRICING.pullSingle})`);
  assert(CARD_PRICING.pullBundle === 180, `Bundle costs 180 gems (got ${CARD_PRICING.pullBundle})`);
  assert(CARD_PRICING.pullBundle < CARD_PRICING.pullSingle * 10,
    'Bundle is cheaper than 10 singles');

  // â”€â”€ 5. Copies to level â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('â”€â”€ Copies to Level â”€â”€');

  const CTL = ctx.COPIES_TO_LEVEL;
  assert(CTL.standard[0] === 1, 'Standard unlock = 1 copy');
  assert(CTL.prime[0] === 1, 'Prime unlock = 1 copy');
  assert(CTL.apex[0] === 1, 'Apex unlock = 1 copy');
  for (const tier of ['standard', 'prime', 'apex']) {
    assert(CTL[tier].length === 5, `${tier} has 5 level thresholds`);
    for (let i = 1; i < CTL[tier].length; i++) {
      assert(CTL[tier][i] > CTL[tier][i - 1], `${tier} thresholds increase (L${i})`);
    }
  }

  // â”€â”€ 6. Slot unlock costs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('â”€â”€ Slot Unlock Costs â”€â”€');

  const SUC = ctx.SLOT_UNLOCK_COSTS;
  assert(SUC[4] === 100, `Slot 4 costs 100 gems (got ${SUC[4]})`);
  let prev = 0;
  for (let s = 4; s <= 10; s++) {
    assert(SUC[s] > prev, `Slot ${s} costs more than slot ${s - 1}`);
    prev = SUC[s];
  }

  // â”€â”€ 7. Rank cost escalation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('â”€â”€ Rank Costs â”€â”€');

  const RANK_DEFS = ctx.RANK_DEFS;
  const rankCost = ctx.rankCost;

  const dmgDef = RANK_DEFS.damage;
  assert(dmgDef.cost0 === 15, `Damage cost0 = 15 (got ${dmgDef.cost0})`);
  assertClose(dmgDef.costMul, 1.427, 'Damage costMul = 1.427');

  const cost0 = rankCost('damage', 0);
  const cost10 = rankCost('damage', 10);
  const cost50 = rankCost('damage', 39);
  assert(cost0 === dmgDef.cost0, `Damage rank 0 to 1 cost matches definition (got ${cost0})`);
  assert(cost10 > cost0, `Rank 10 costs more than rank 0 (${cost10} > ${cost0})`);
  assert(cost50 > cost10, `Late damage rank costs more than rank 10 (${cost50} > ${cost10})`);

  const expectedCost10 = Math.floor(dmgDef.cost0 * Math.pow(dmgDef.costMul, 10));
  assert(cost10 === expectedCost10, `Rank 10 cost matches formula: floor(${dmgDef.cost0} * ${dmgDef.costMul}^10) = ${expectedCost10} (got ${cost10})`);

  assert(rankCost('damage', dmgDef.maxRank) === Infinity, 'Cost at maxRank = Infinity');

  // â”€â”€ 8. Rank max rank sum â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('â”€â”€ Rank Caps â”€â”€');

  let totalMaxRanks = 0;
  for (const def of Object.values(RANK_DEFS)) {
    totalMaxRanks += def.maxRank;
  }
  assert(totalMaxRanks === 1019, `Total max ranks = 1019 (got ${totalMaxRanks})`);

  // â”€â”€ 9. Tournament constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('â”€â”€ Tournament â”€â”€');

  assert(ctx.TOURNEY_BRACKET_SIZE === 250, `Bracket size = 250 (got ${ctx.TOURNEY_BRACKET_SIZE})`);
  assertClose(ctx.TOURNEY_PROMOTE_PCT, 0.10, 'Promote = 10%');
  assertClose(ctx.TOURNEY_DEMOTE_PCT, 0.15, 'Demote = 15%');
  assert(ctx.TOURNEY_CYCLE_MS === 72 * 60 * 60 * 1000, 'Cycle = 72 hours');

  const TOURNEY_LEAGUES = ctx.TOURNEY_LEAGUES;
  assert(TOURNEY_LEAGUES.length === 5, `5 leagues (got ${TOURNEY_LEAGUES.length})`);
  assert(TOURNEY_LEAGUES[0] === 'copper', 'First league = copper');
  assert(TOURNEY_LEAGUES[4] === 'platinum', 'Last league = platinum');

  const promoteCount = Math.floor(250 * 0.10);
  assert(promoteCount === 25, `Top 25 of 250 promote (got ${promoteCount})`);
  const demoteCount = Math.floor(250 * 0.15);
  assert(demoteCount === 37, `Bottom 37 of 250 demote (got ${demoteCount})`);

  // â”€â”€ 10. Game constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('â”€â”€ Game Constants â”€â”€');

  assert(ctx.MAX_TIER === 18, `MAX_TIER = 18 (got ${ctx.MAX_TIER})`);
  assert(ctx.MILESTONE_WAVES.length === 9, `9 milestone waves (got ${ctx.MILESTONE_WAVES.length})`);
  assert(ctx.MILESTONE_WAVES[0] === 25, `First milestone = wave 25`);
  assert(ctx.MILESTONE_WAVES[8] === 10000, `Last milestone = wave 10000`);

  // â”€â”€ 11. Unlock families â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('â”€â”€ Unlock Families â”€â”€');

  const UNLOCK_FAMILIES = ctx.UNLOCK_FAMILIES;
  assert(Object.keys(UNLOCK_FAMILIES).length === 11, `11 unlock families (got ${Object.keys(UNLOCK_FAMILIES).length})`);
  for (const [id, fam] of Object.entries(UNLOCK_FAMILIES)) {
    assert(fam.icon, `Family ${id} has an icon`);
    assert(fam.cost > 0, `Family ${id} has a positive cost`);
    assert(fam.id === id, `Family ${id} has matching id field`);
  }

  // â”€â”€ 12. Build output â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('â”€â”€ Build Output â”€â”€');

  const distExists = await fs.access(path.join(root, 'dist')).then(() => true).catch(() => false);
  if (distExists) {
    const bundle = await fs.access(path.join(root, 'dist/js/core-surge.min.js')).then(() => true).catch(() => false);
    assert(bundle, 'dist/js/core-surge.min.js exists');

    const css = await fs.access(path.join(root, 'dist/css/core-surge.min.css')).then(() => true).catch(() => false);
    assert(css, 'dist/css/core-surge.min.css exists');

    const bundleSize = (await fs.stat(path.join(root, 'dist/js/core-surge.min.js'))).size;
    assert(bundleSize < 500 * 1024, `Bundle < 500KB (got ${(bundleSize / 1024).toFixed(1)} KB)`);
    assert(bundleSize > 50 * 1024, `Bundle > 50KB â€” not empty (got ${(bundleSize / 1024).toFixed(1)} KB)`);

    const distHtml = await fs.readFile(path.join(root, 'dist/index.html'), 'utf8');
    assert(distHtml.includes('core-surge.min.js'), 'dist/index.html references JS bundle');
    assert(distHtml.includes('core-surge.min.css'), 'dist/index.html references CSS bundle');
    assert(!distHtml.includes('src="js/data.js"'), 'dist/index.html does not reference individual JS files');

    const mockupsExcluded = await fs.access(path.join(root, 'dist/assets/mockups')).then(() => false).catch(() => true);
    assert(mockupsExcluded, 'dist excludes assets/mockups/');
  } else {
    console.log('  (dist/ not found â€” run `npm run build` first, skipping build output tests)');
  }

  // â”€â”€ Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log(`\n${'â•'.repeat(40)}`);
  console.log(`Tests: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  if (failures.length) {
    console.log('\nFailures:');
    failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  }
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test runner error:', err.message || err);
  process.exit(1);
});
