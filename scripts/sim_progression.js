'use strict';

// ============ CONSTANTS FROM data.js ============
const RANK_DEFS = {
  damage:     { cost0:12, costMul:1.14, maxRank:25, flatPerRank:4, base:5 },
  fireRate:   { cost0:18, costMul:1.15, maxRank:20, flatPerRank:0.05, base:1.0 },
  coreHealth: { cost0:10, costMul:1.13, maxRank:25, flatPerRank:20, base:100 },
  armor:      { cost0:20, costMul:1.16, maxRank:15, flatPerRank:0.005, base:0 },
  range:      { cost0:25, costMul:1.18, maxRank:10, flatPerRank:3, base:0 },
  cashBonus:  { cost0:20, costMul:1.15, maxRank:15, flatPerRank:0.03, base:0 },
  critChance: { cost0:40, costMul:1.16, maxRank:15, family:'critSystems' },
  critPower:  { cost0:50, costMul:1.16, maxRank:15, family:'critSystems' },
  waveBonus:  { cost0:45, costMul:1.15, maxRank:12, family:'economyExpansion' },
  bossBounty: { cost0:50, costMul:1.16, maxRank:12, family:'economyExpansion' },
  regen:      { cost0:35, costMul:1.14, maxRank:15, family:'sustainSystems' },
  lifesteal:  { cost0:60, costMul:1.16, maxRank:12, family:'sustainSystems' },
  thorns:     { cost0:45, costMul:1.15, maxRank:12, family:'fortification' },
  knockback:  { cost0:60, costMul:1.16, maxRank:8,  family:'fortification' },
  shieldHP:   { cost0:50, costMul:1.15, maxRank:12, family:'barrierSystems' },
  shieldRegen:{ cost0:70, costMul:1.16, maxRank:10, family:'barrierSystems' },
  coinMultiplier:{cost0:55, costMul:1.16, maxRank:12, family:'coinMastery' },
  gemFind:    { cost0:80, costMul:1.18, maxRank:8,  family:'coinMastery' },
  multiChance:{ cost0:100,costMul:1.18, maxRank:10, family:'multishotSystems' },
  multiPower: { cost0:80, costMul:1.16, maxRank:10, family:'multishotSystems' },
  multiTargets:{cost0:200,costMul:1.20, maxRank:5,  family:'multishotSystems' },
  bounceChance:{cost0:150,costMul:1.18, maxRank:8,  family:'bounceSystems' },
  bouncePower:{ cost0:120,costMul:1.16, maxRank:8,  family:'bounceSystems' },
  bounceTargets:{cost0:300,costMul:1.20, maxRank:4, family:'bounceSystems' },
  comboBonus: { cost0:80, costMul:1.16, maxRank:10, family:'comboSystems' },
  comboDuration:{cost0:100,costMul:1.18, maxRank:8, family:'comboSystems' },
  projSpeed:  { cost0:40, costMul:1.14, maxRank:10, family:'tacticalSystems' },
  pierce:     { cost0:100,costMul:1.18, maxRank:8,  family:'tacticalSystems' },
  overchargeChance:{cost0:90,costMul:1.17, maxRank:10, family:'overcharge' },
  overchargePower:{ cost0:70,costMul:1.16, maxRank:10, family:'overcharge' },
};

const UNLOCK_FAMILIES_ORDER = [
  { id: 'critSystems', cost: 1500 },
  { id: 'economyExpansion', cost: 3000 },
  { id: 'sustainSystems', cost: 6000 },
  { id: 'fortification', cost: 8000 },
  { id: 'coinMastery', cost: 12000 },
  { id: 'multishotSystems', cost: 15000 },
  { id: 'barrierSystems', cost: 20000 },
  { id: 'tacticalSystems', cost: 25000 },
  { id: 'bounceSystems', cost: 30000 },
  { id: 'overcharge', cost: 45000 },
  { id: 'comboSystems', cost: 60000 },
];

const DAILY_LOGIN_REWARDS = [
  { coins: 200, gems: 0 },
  { coins: 300, gems: 0 },
  { coins: 400, gems: 0 },
  { coins: 500, gems: 0 },
  { coins: 600, gems: 0 },
  { coins: 0,   gems: 10 },
  { coins: 1000, gems: 5 },
];

// ============ HELPERS ============
function rankCost(def, level) { return Math.floor(def.cost0 * Math.pow(def.costMul, level)); }

function totalCostForRank(def) {
  let total = 0;
  for (let i = 0; i < def.maxRank; i++) total += rankCost(def, i);
  return total;
}

// ============ TOTAL COST ANALYSIS ============
let totalRankCost = 0;
let totalMaxRanks = 0;
for (const [id, def] of Object.entries(RANK_DEFS)) {
  totalRankCost += totalCostForRank(def);
  totalMaxRanks += def.maxRank;
}
const totalUnlockCost = UNLOCK_FAMILIES_ORDER.reduce((s, f) => s + f.cost, 0);
const totalCostAll = totalRankCost + totalUnlockCost;

console.log('=== TOTAL COST TO MAX EVERYTHING ===');
console.log('Total max ranks: ' + totalMaxRanks);
console.log('Total rank cost: ' + totalRankCost.toLocaleString());
console.log('Total unlock cost: ' + totalUnlockCost.toLocaleString());
console.log('TOTAL: ' + totalCostAll.toLocaleString());
console.log('');

// ============ STARTER RANK COSTS DETAILED ============
console.log('=== STARTER RANK COSTS (always unlocked) ===');
const starters = ['damage','fireRate','coreHealth','armor','range','cashBonus'];
for (const id of starters) {
  const def = RANK_DEFS[id];
  const first = rankCost(def, 0);
  const last = rankCost(def, def.maxRank - 1);
  const total = totalCostForRank(def);
  console.log('  ' + id + ': ' + def.maxRank + ' ranks, first=' + first + ', last=' + last + ', total=' + total);
}
console.log('');

// ============ INCOME FORMULAS ============
function coinRewardForRun(maxWave, totalCash, tier, bossesDefeated, coinMulBonus) {
  const wavePart = Math.pow(maxWave, 1.15) * Math.pow(1.30, tier - 1);
  const cashPart = Math.pow(Math.max(1, totalCash), 0.50) / 50;
  const bossPart = bossesDefeated * 6 * Math.pow(1.15, tier - 1);
  const permCoinMul = 1 + (coinMulBonus || 0);
  let reward = Math.floor((wavePart + cashPart + bossPart) * permCoinMul);
  return reward;
}

// Estimate wave player can reach based on damage/hp investment
function hpTierMul(t) { return Math.pow(1.18, t - 1); }
function dmgTierMul(t) { return Math.pow(1.11, t - 1); }
function hpWaveMul(w) {
  if (w <= 30) return Math.pow(1.055, w - 1);
  if (w <= 120) return Math.pow(1.055, 29) * Math.pow(1.028, w - 30);
  return Math.pow(1.055, 29) * Math.pow(1.028, 90) * Math.pow(1.009, w - 120);
}

function enemyHpForWave(wave, tier) {
  if (tier === 1 && wave <= 10) return wave;
  return Math.floor(5 * hpWaveMul(wave) * hpTierMul(tier));
}

function estimateMaxWave(tier, dmgRanks, hpRanks, armorRanks, fireRateRanks) {
  // Player DPS = (base + dmg*flatPerRank) * (base + fireRate*flatPerRank)
  const damage = 5 + dmgRanks * 4;
  const fireRate = 1.0 + fireRateRanks * 0.05;
  const dps = damage * fireRate;
  const hp = 100 + hpRanks * 20;
  const armorPct = Math.min(0.75, armorRanks * 0.005);

  // Find the wave where enemy HP outpaces DPS significantly
  // Rough: player survives until they can't kill enemies fast enough and HP depletes
  let maxWave = 5;
  for (let w = 1; w <= 300; w++) {
    const eHp = enemyHpForWave(w, tier);
    const timeToKill = eHp / dps; // seconds to kill one enemy
    // Spawn interval (ms)
    let spawnBase;
    if (w <= 30) spawnBase = Math.max(500, 1000 - w * 12);
    else if (w <= 120) spawnBase = Math.max(320, 700 - (w - 30) * 4);
    else spawnBase = 280;
    const tierSlowdown = Math.max(0, 1 - (tier - 1) * 0.15);
    const spawnInterval = spawnBase * (1 + tierSlowdown * 0.6) / 1000; // seconds

    // If time to kill > spawn interval, enemies pile up
    // Effective survival: when enemies pile up, tower HP depletes
    const dmgPerEnemy = Math.floor(3 * Math.pow(1.038, Math.min(w, 30) - 1) *
      (w > 30 ? Math.pow(1.020, Math.min(w, 120) - 30) : 1) *
      (w > 120 ? Math.pow(1.007, w - 120) : 1) * dmgTierMul(tier));
    const effectiveDmg = dmgPerEnemy * (1 - armorPct);

    // If TTK exceeds spawn rate, enemies accumulate; HP drains
    if (timeToKill > spawnInterval * 1.5) {
      // Player starts losing, give them a few more waves of struggling
      maxWave = w + Math.floor(hp / (effectiveDmg * 2));
      break;
    }
    maxWave = w;
  }
  return Math.min(300, maxWave);
}

// ============ PROGRESSION SIMULATION ============
const RUNS_PER_DAY = 4; // Casual F2P player
let coins = 0;
let totalRuns = 0;
let currentTier = 1;
let ranksOwned = {};
let familiesOwned = {};
for (const id of Object.keys(RANK_DEFS)) ranksOwned[id] = 0;

// Daily login: cycle through 7 days
function dailyLoginReward(day) {
  const idx = (day - 1) % 7;
  return DAILY_LOGIN_REWARDS[idx].coins;
}

// Milestone rewards
function milestoneReward(tier, wave) {
  return Math.floor(wave * 0.8 * Math.pow(1.7, tier - 1));
}

let claimedMilestones = {};
const milestoneWaves = [25, 50, 100];

function buyRanks() {
  let bought = true;
  while (bought) {
    bought = false;
    // Buy unlock families in order if affordable
    for (const fam of UNLOCK_FAMILIES_ORDER) {
      if (!familiesOwned[fam.id] && coins >= fam.cost) {
        coins -= fam.cost;
        familiesOwned[fam.id] = true;
        bought = true;
        break;
      }
    }
    // Buy cheapest available rank
    let cheapest = null, cheapestCost = Infinity;
    for (const [id, def] of Object.entries(RANK_DEFS)) {
      if (def.family && !familiesOwned[def.family]) continue;
      if (ranksOwned[id] >= def.maxRank) continue;
      const c = rankCost(def, ranksOwned[id]);
      if (c <= coins && c < cheapestCost) {
        cheapest = id;
        cheapestCost = c;
      }
    }
    if (cheapest) {
      coins -= cheapestCost;
      ranksOwned[cheapest]++;
      bought = true;
    }
  }
}

let pct75day = 0, pct100day = 0;
const tierUnlockDays = { 1: 0 };
const checkpoints = [7, 14, 30, 60, 90, 120, 180, 270, 365, 500, 730];
const checkpointData = {};
const bugs = [];

for (let day = 1; day <= 800; day++) {
  // Daily login
  coins += dailyLoginReward(day);

  for (let r = 0; r < RUNS_PER_DAY; r++) {
    totalRuns++;
    const coinMulBonus = ranksOwned.coinMultiplier * 0.03;
    const maxWave = estimateMaxWave(
      currentTier,
      ranksOwned.damage,
      ranksOwned.coreHealth,
      ranksOwned.armor,
      ranksOwned.fireRate
    );
    const cash = maxWave * 30; // rough in-run cash
    const bosses = Math.floor(maxWave / 25);
    const reward = coinRewardForRun(maxWave, cash, currentTier, bosses, coinMulBonus);
    coins += reward;

    // Milestones
    for (const w of milestoneWaves) {
      const key = 'T' + currentTier + 'W' + w;
      if (!claimedMilestones[key] && maxWave >= w) {
        const mReward = milestoneReward(currentTier, w);
        coins += mReward;
        claimedMilestones[key] = true;
      }
    }

    // Tier unlock
    if (maxWave >= 50 && currentTier < 18) {
      currentTier++;
      if (!tierUnlockDays[currentTier]) tierUnlockDays[currentTier] = day;
    }

    buyRanks();
  }

  // Completion check
  const totalOwned = Object.values(ranksOwned).reduce((s, v) => s + v, 0);
  const pct = totalOwned / totalMaxRanks;
  if (pct >= 0.75 && !pct75day) pct75day = day;
  if (pct >= 1.0 && !pct100day) pct100day = day;

  if (checkpoints.includes(day)) {
    checkpointData[day] = {
      tier: currentTier,
      runs: totalRuns,
      ranks: totalOwned,
      pct: (pct * 100).toFixed(1),
      coins: coins,
      families: Object.keys(familiesOwned).length,
      maxWave: estimateMaxWave(currentTier, ranksOwned.damage, ranksOwned.coreHealth, ranksOwned.armor, ranksOwned.fireRate)
    };
  }
}

console.log('=== F2P PROGRESSION TIMELINE (' + RUNS_PER_DAY + ' runs/day) ===');
for (const d of checkpoints) {
  if (checkpointData[d]) {
    const c = checkpointData[d];
    const months = (d / 30).toFixed(1);
    console.log('  Day ' + d + ' (~' + months + ' mo): T' + c.tier +
      ', ' + c.runs + ' runs, ' + c.ranks + '/' + totalMaxRanks + ' ranks (' + c.pct + '%)' +
      ', ' + c.families + '/11 families, maxWave~' + c.maxWave +
      ', banked=' + c.coins.toLocaleString());
  }
}
console.log('');
console.log('75% ranks: Day ' + (pct75day || 'NOT REACHED in 800 days'));
console.log('100% ranks: Day ' + (pct100day || 'NOT REACHED in 800 days'));
console.log('');

console.log('=== TIER UNLOCK TIMELINE ===');
for (let t = 1; t <= 18; t++) {
  if (tierUnlockDays[t] !== undefined) {
    console.log('  T' + t + ': Day ' + tierUnlockDays[t] + ' (~' + (tierUnlockDays[t] / 30).toFixed(1) + ' mo)');
  }
}
console.log('');

// ============ BUG DETECTION ============
// Check for potential issues
console.log('=== POTENTIAL BUGS & BALANCE ISSUES ===');

// 1. Check if any rank costs go to Infinity or NaN
for (const [id, def] of Object.entries(RANK_DEFS)) {
  const lastCost = rankCost(def, def.maxRank - 1);
  if (!isFinite(lastCost) || isNaN(lastCost)) {
    console.log('BUG: ' + id + ' rank ' + (def.maxRank - 1) + ' cost is ' + lastCost);
  }
  if (lastCost > 100000) {
    console.log('WARNING: ' + id + ' final rank costs ' + lastCost.toLocaleString() + ' - may feel impossible');
  }
}

// 2. Check T1 first run income
const firstRunReward = coinRewardForRun(15, 200, 1, 0, 0);
console.log('First run (T1 W15, no bosses): ' + firstRunReward + ' scrap');
console.log('  First damage rank costs: ' + rankCost(RANK_DEFS.damage, 0));
console.log('  Can buy ' + Math.floor(firstRunReward / rankCost(RANK_DEFS.damage, 0)) + ' damage ranks');

// 3. Check coinRewardForRun at various points
console.log('');
console.log('Income samples:');
for (let t = 1; t <= 10; t++) {
  const r30 = coinRewardForRun(30, 900, t, 1, 0);
  const r50 = coinRewardForRun(50, 1500, t, 2, 0);
  console.log('  T' + t + ': W30=' + r30 + ', W50=' + r50);
}

// 4. Gem Find rank now does nothing (removed gem drops from combat)
if (RANK_DEFS.gemFind) {
  console.log('');
  console.log('BUG: gemFind rank exists (8 ranks, costs scrap) but gem drops from combat were removed.');
  console.log('  Players waste scrap buying a stat that does nothing.');
}

// 5. Check daily login total per week
const weeklyLogin = DAILY_LOGIN_REWARDS.reduce((s, r) => s + r.coins, 0);
console.log('');
console.log('Daily login: ' + weeklyLogin + ' scrap/week (' + (weeklyLogin / 7).toFixed(0) + '/day avg)');

// 6. Milestone rewards check
console.log('');
console.log('Milestone rewards:');
for (let t = 1; t <= 5; t++) {
  for (const w of [25, 50, 100]) {
    console.log('  T' + t + ' W' + w + ': ' + milestoneReward(t, w) + ' scrap');
  }
}

// 7. Check if tier progression is too fast or too slow
console.log('');
if (tierUnlockDays[10]) {
  if (tierUnlockDays[10] < 7) {
    console.log('BUG: T10 unlocked in ' + tierUnlockDays[10] + ' days - WAY too fast');
  } else if (tierUnlockDays[10] < 30) {
    console.log('NOTE: T10 unlocked in ' + tierUnlockDays[10] + ' days - might be fast');
  }
}
