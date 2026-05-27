'use strict';

// Goal: 100% completion at ~365 days, 75% at ~270 days
// 4 runs/day F2P player, daily login 429 scrap/day avg

function rankCost(cost0, costMul, level) {
  return Math.floor(cost0 * Math.pow(costMul, level));
}
function totalCostAllRanks(cost0, costMul, maxRank) {
  let total = 0;
  for (let i = 0; i < maxRank; i++) total += rankCost(cost0, costMul, i);
  return total;
}

// PROPOSED V3: Higher costMul, more ranks, steeper unlock costs
const PROPOSED_RANKS = {
  // Starters
  damage:     { cost0:15, costMul:1.28, maxRank:40, flatPerRank:3, base:5 },
  fireRate:   { cost0:20, costMul:1.28, maxRank:30, flatPerRank:0.04, base:1.0 },
  coreHealth: { cost0:12, costMul:1.25, maxRank:40, flatPerRank:15, base:100 },
  armor:      { cost0:25, costMul:1.30, maxRank:25, flatPerRank:0.004, base:0 },
  range:      { cost0:30, costMul:1.32, maxRank:15, flatPerRank:2, base:0 },
  cashBonus:  { cost0:25, costMul:1.28, maxRank:25, flatPerRank:0.02, base:0 },
  // Crit
  critChance: { cost0:50, costMul:1.28, maxRank:20, family:'critSystems' },
  critPower:  { cost0:60, costMul:1.28, maxRank:20, family:'critSystems' },
  // Economy
  waveBonus:  { cost0:55, costMul:1.28, maxRank:18, family:'economyExpansion' },
  bossBounty: { cost0:60, costMul:1.28, maxRank:18, family:'economyExpansion' },
  // Sustain
  regen:      { cost0:45, costMul:1.26, maxRank:20, family:'sustainSystems' },
  lifesteal:  { cost0:70, costMul:1.28, maxRank:18, family:'sustainSystems' },
  // Spiked Core / Knockback
  thorns:     { cost0:55, costMul:1.28, maxRank:18, family:'spikedCore' },
  knockback:  { cost0:70, costMul:1.28, maxRank:12, family:'knockbackSystems' },
  // Barrier
  shieldHP:   { cost0:60, costMul:1.28, maxRank:18, family:'barrierSystems' },
  shieldRegen:{ cost0:80, costMul:1.28, maxRank:15, family:'barrierSystems' },
  // Scrap Mastery
  coinMultiplier:{cost0:65, costMul:1.28, maxRank:18, family:'coinMastery' },
  gemFind:    { cost0:90, costMul:1.30, maxRank:12, family:'coinMastery' },
  // Multishot
  multiChance:{ cost0:120,costMul:1.30, maxRank:15, family:'multishotSystems' },
  multiPower: { cost0:100,costMul:1.28, maxRank:15, family:'multishotSystems' },
  multiTargets:{cost0:300,costMul:1.35, maxRank:8,  family:'multishotSystems' },
  // Bounce
  bounceChance:{cost0:180,costMul:1.30, maxRank:12, family:'bounceSystems' },
  bouncePower:{ cost0:150,costMul:1.28, maxRank:12, family:'bounceSystems' },
  bounceTargets:{cost0:500,costMul:1.35, maxRank:6, family:'bounceSystems' },
  // Combo
  comboBonus: { cost0:100,costMul:1.28, maxRank:15, family:'comboSystems' },
  comboDuration:{cost0:120,costMul:1.30, maxRank:12, family:'comboSystems' },
  // Tactical
  projSpeed:  { cost0:50, costMul:1.26, maxRank:15, family:'tacticalSystems' },
  pierce:     { cost0:120,costMul:1.30, maxRank:12, family:'tacticalSystems' },
  // Overcharge
  overchargeChance:{cost0:110,costMul:1.29, maxRank:15, family:'overcharge' },
  overchargePower:{ cost0:85, costMul:1.28, maxRank:15, family:'overcharge' },
};

const PROPOSED_UNLOCKS = [
  { id: 'critSystems', cost: 5000 },
  { id: 'economyExpansion', cost: 15000 },
  { id: 'sustainSystems', cost: 30000 },
  { id: 'spikedCore', cost: 35000 },
  { id: 'knockbackSystems', cost: 45000 },
  { id: 'coinMastery', cost: 75000 },
  { id: 'multishotSystems', cost: 100000 },
  { id: 'barrierSystems', cost: 150000 },
  { id: 'tacticalSystems', cost: 200000 },
  { id: 'bounceSystems', cost: 275000 },
  { id: 'overcharge', cost: 375000 },
  { id: 'comboSystems', cost: 500000 },
];

let totalRankCost = 0, totalMaxRanks = 0;
for (const [id, def] of Object.entries(PROPOSED_RANKS)) {
  totalRankCost += totalCostAllRanks(def.cost0, def.costMul, def.maxRank);
  totalMaxRanks += def.maxRank;
}
const totalUnlockCost = PROPOSED_UNLOCKS.reduce((s, f) => s + f.cost, 0);
const totalCostAll = totalRankCost + totalUnlockCost;

console.log('=== PROPOSED V3 ===');
console.log('Total max ranks: ' + totalMaxRanks);
console.log('Total rank cost: ' + totalRankCost.toLocaleString());
console.log('Total unlock cost: ' + totalUnlockCost.toLocaleString());
console.log('TOTAL: ' + totalCostAll.toLocaleString());
console.log('');

// ============ SIMULATION ============
const DAILY_LOGIN_AVG = 429;
function coinRewardForRun(maxWave, totalCash, tier, bossesDefeated, coinMulBonus) {
  const wavePart = Math.pow(maxWave, 1.15) * Math.pow(1.30, tier - 1);
  const cashPart = Math.pow(Math.max(1, totalCash), 0.50) / 50;
  const bossPart = bossesDefeated * 6 * Math.pow(1.15, tier - 1);
  const permCoinMul = 1 + (coinMulBonus || 0);
  return Math.floor((wavePart + cashPart + bossPart) * permCoinMul);
}

function hpTierMul(t) { return Math.pow(1.18, t - 1); }
function hpWaveMul(w) {
  if (w <= 30) return Math.pow(1.055, w - 1);
  if (w <= 120) return Math.pow(1.055, 29) * Math.pow(1.028, w - 30);
  return Math.pow(1.055, 29) * Math.pow(1.028, 90) * Math.pow(1.009, w - 120);
}
function enemyHpForWave(wave, tier) {
  if (tier === 1 && wave <= 10) return wave;
  return Math.floor(5 * hpWaveMul(wave) * hpTierMul(tier));
}
function dmgTierMul(t) { return Math.pow(1.11, t - 1); }

function estimateMaxWave(tier, dmgRanks, hpRanks, armorRanks, fireRateRanks) {
  const damage = 5 + dmgRanks * 3;
  const fireRate = 1.0 + fireRateRanks * 0.04;
  const dps = damage * fireRate;
  const hp = 100 + hpRanks * 15;
  const armorPct = Math.min(0.75, armorRanks * 0.004);
  let maxWave = 5;
  for (let w = 1; w <= 300; w++) {
    const eHp = enemyHpForWave(w, tier);
    const timeToKill = eHp / dps;
    let spawnBase;
    if (w <= 30) spawnBase = Math.max(500, 1000 - w * 12);
    else if (w <= 120) spawnBase = Math.max(320, 700 - (w - 30) * 4);
    else spawnBase = 280;
    const tierSlowdown = Math.max(0, 1 - (tier - 1) * 0.15);
    const spawnInterval = spawnBase * (1 + tierSlowdown * 0.6) / 1000;
    if (timeToKill > spawnInterval * 1.5) {
      const dmgPerEnemy = Math.floor(3 * Math.pow(1.038, Math.min(w, 30) - 1) *
        (w > 30 ? Math.pow(1.020, Math.min(w, 120) - 30) : 1) *
        (w > 120 ? Math.pow(1.007, w - 120) : 1) * dmgTierMul(tier));
      const effectiveDmg = dmgPerEnemy * (1 - armorPct);
      maxWave = w + Math.floor(hp / (effectiveDmg * 2));
      break;
    }
    maxWave = w;
  }
  return Math.min(300, maxWave);
}

const RUNS_PER_DAY = 4;
let coins = 0, totalRuns = 0, currentTier = 1;
let ranksOwned = {}, familiesOwned = {};
for (const id of Object.keys(PROPOSED_RANKS)) ranksOwned[id] = 0;

function buyRanks() {
  let bought = true;
  while (bought) {
    bought = false;
    for (const fam of PROPOSED_UNLOCKS) {
      if (!familiesOwned[fam.id] && coins >= fam.cost) {
        coins -= fam.cost;
        familiesOwned[fam.id] = true;
        bought = true;
        break;
      }
    }
    let cheapest = null, cheapestCost = Infinity;
    for (const [id, def] of Object.entries(PROPOSED_RANKS)) {
      if (def.family && !familiesOwned[def.family]) continue;
      if (ranksOwned[id] >= def.maxRank) continue;
      const c = rankCost(def.cost0, def.costMul, ranksOwned[id]);
      if (c <= coins && c < cheapestCost) { cheapest = id; cheapestCost = c; }
    }
    if (cheapest) { coins -= cheapestCost; ranksOwned[cheapest]++; bought = true; }
  }
}

let claimedMilestones = {};
let pct75day = 0, pct100day = 0;
const tierUnlockDays = { 1: 0 };
const checkpoints = [7, 14, 30, 60, 90, 120, 180, 270, 365, 500, 730];
const checkpointData = {};

for (let day = 1; day <= 800; day++) {
  coins += DAILY_LOGIN_AVG;
  for (let r = 0; r < RUNS_PER_DAY; r++) {
    totalRuns++;
    const coinMulBonus = ranksOwned.coinMultiplier * 0.02;
    const maxWave = estimateMaxWave(currentTier, ranksOwned.damage, ranksOwned.coreHealth, ranksOwned.armor, ranksOwned.fireRate);
    const cash = maxWave * 30;
    const bosses = Math.floor(maxWave / 25);
    const reward = coinRewardForRun(maxWave, cash, currentTier, bosses, coinMulBonus);
    coins += reward;
    for (const w of [25, 50, 100]) {
      const key = 'T' + currentTier + 'W' + w;
      if (!claimedMilestones[key] && maxWave >= w) {
        coins += Math.floor(w * 0.8 * Math.pow(1.7, currentTier - 1));
        claimedMilestones[key] = true;
      }
    }
    if (maxWave >= 50 && currentTier < 18) {
      currentTier++;
      if (!tierUnlockDays[currentTier]) tierUnlockDays[currentTier] = day;
    }
    buyRanks();
  }
  const totalOwned = Object.values(ranksOwned).reduce((s, v) => s + v, 0);
  const pct = totalOwned / totalMaxRanks;
  if (pct >= 0.75 && !pct75day) pct75day = day;
  if (pct >= 1.0 && !pct100day) pct100day = day;
  if (checkpoints.includes(day)) {
    checkpointData[day] = {
      tier: currentTier, ranks: totalOwned,
      pct: (pct * 100).toFixed(1),
      families: Object.keys(familiesOwned).length,
      maxWave: estimateMaxWave(currentTier, ranksOwned.damage, ranksOwned.coreHealth, ranksOwned.armor, ranksOwned.fireRate)
    };
  }
}

console.log('=== PROGRESSION TIMELINE (4 runs/day) ===');
for (const d of checkpoints) {
  if (checkpointData[d]) {
    const c = checkpointData[d];
    console.log('  Day ' + d + ' (~' + (d / 30).toFixed(0) + ' mo): T' + c.tier +
      ', ' + c.ranks + '/' + totalMaxRanks + ' (' + c.pct + '%)' +
      ', ' + c.families + '/11 fam, wave~' + c.maxWave);
  }
}
console.log('');
console.log('75% ranks: Day ' + (pct75day || '>800'));
console.log('100% ranks: Day ' + (pct100day || '>800'));
console.log('');
console.log('Tier unlocks:');
for (let t = 2; t <= 18; t++) {
  if (tierUnlockDays[t] !== undefined) {
    console.log('  T' + t + ': Day ' + tierUnlockDays[t]);
  }
}
