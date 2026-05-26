// ============================================================
// game.js — game state, stat getters (damage/HP/crit/etc), wave scaling, enemy types, battle start/end, combat loop, damage/heal pipelines, apex specials.
// Owned by: gameplay AI. This is the combat core. Do not edit tab UI here.
// ============================================================

// ============================================================
// LAB MATH (v0.7.15: labs deprecated, replaced by ranks)
// ============================================================
// labCost retained for any legacy callers.
function labCost(lab) { return Math.floor(lab.cost0 * Math.pow(lab.costMul, lab.level)); }
// labValue/labNextValue are now no-ops. Any straggler `labValue(save.labs.X)`
// calls will return 0, which is the identity for additive bonuses.
function labValue(lab) { return 0; }
function labNextValue(lab) { return 0; }

// Offline/utility values — hard-coded baselines until a utility ranks pass.
function offlineCapMinutes() { return 10; }     // 10 min offline cap
function offlineRateFraction() { return 0.05; } // 5% of active rate offline
function defenseFraction() { return 0; }        // armor now comes from ranks
// Speed tiers: x1 free, x2/x3/x5/x10 require purchase (coins OR gems).
const SPEED_TIERS = [1, 2, 3, 5, 10];
const SPEED_UNLOCK_COST = {
  2:  { coins: 5000,    gems: 25  },   // early unlock
  3:  { coins: 50000,   gems: 100 },   // mid unlock
  5:  { coins: 500000,  gems: 500 },   // late unlock
  10: { coins: 5000000, gems: 1500 }   // endgame unlock
};
function maxUnlockedSpeed() {
  // Dev mode: all speed tiers unlocked
  if (typeof save !== 'undefined' && save.settings && save.settings.devMode) return 10;
  let max = 1; // only x1 is free
  if (typeof save !== 'undefined' && save.unlockedSpeeds) {
    for (const s of SPEED_TIERS) {
      if (s === 1 || save.unlockedSpeeds.includes(s)) max = s;
    }
  }
  return max;
}
function nextSpeedTier(cur) {
  const max = maxUnlockedSpeed();
  const available = SPEED_TIERS.filter(s => s <= max);
  const idx = available.indexOf(cur);
  if (idx < 0 || idx >= available.length - 1) return available[0];
  return available[idx + 1];
}
function purchaseSpeedTier(tier, useGems) {
  const cost = SPEED_UNLOCK_COST[tier];
  if (!cost) return false;
  if (save.unlockedSpeeds && save.unlockedSpeeds.includes(tier)) return false;
  // Must unlock in order: need the tier below first
  const tierIdx = SPEED_TIERS.indexOf(tier);
  if (tierIdx > 1) { // tier at index 1 is x2, needs x1 (free)
    const prevTier = SPEED_TIERS[tierIdx - 1];
    if (prevTier > 1 && (!save.unlockedSpeeds || !save.unlockedSpeeds.includes(prevTier))) return false;
  }
  if (useGems) {
    if (save.gems < cost.gems) return false;
    save.gems -= cost.gems;
  } else {
    if (save.coins < cost.coins) return false;
    save.coins -= cost.coins;
  }
  if (!save.unlockedSpeeds) save.unlockedSpeeds = [];
  save.unlockedSpeeds.push(tier);
  if (typeof persistSave === 'function') persistSave();
  return true;
}

// ============================================================
// TIER + MILESTONE
// ============================================================
function highestUnlockedTier() {
  // Tiers are unlimited. You unlock tier N+1 by reaching wave 50 on tier N.
  let unlocked = 1;
  for (let t = 1; t <= (save.bestTier || 1) + 1; t++) {
    const reached = save.bestWavePerTier[t] || 0;
    if (reached >= 50) unlocked = t + 1;
    else break;
  }
  return unlocked;
}
function tierMultiplier_deprecated(tier) { return Math.pow(1.5, tier - 1); }

function milestoneReward(tier, wave) {
  // Multi-currency rewards that escalate sharply at deep waves.
  // Tier multiplier: each tier roughly doubles rewards.
  const tierMul = Math.pow(2.0, tier - 1);

  // --- SCRAP: base scales with wave, accelerates past W500 ---
  let baseCoins;
  if (wave <= 100)       baseCoins = wave * 3;
  else if (wave <= 500)  baseCoins = 300 + (wave - 100) * 8;
  else if (wave <= 1000) baseCoins = 3500 + (wave - 500) * 25;
  else                   baseCoins = 16000 + (wave - 1000) * 60;
  const coins = Math.floor(baseCoins * tierMul);

  // --- GEMS: start at W50, ramp up significantly at deep waves ---
  let gems = 0;
  if (wave >= 50 && wave < 200)       gems = Math.floor(1 + (wave / 100));
  else if (wave >= 200 && wave < 500) gems = Math.floor(3 + (wave / 50));
  else if (wave >= 500 && wave < 1000) gems = Math.floor(15 + (wave / 25));
  else if (wave >= 1000)              gems = Math.floor(50 + (wave / 10));
  gems = Math.floor(gems * Math.pow(1.25, tier - 1));

  // --- TRAINING MANUALS: start at W100, big rewards at deep waves ---
  let manuals = 0;
  if (wave >= 100 && wave < 300)       manuals = 1;
  else if (wave >= 300 && wave < 500)  manuals = 2;
  else if (wave >= 500 && wave < 750)  manuals = 3;
  else if (wave >= 750 && wave < 1000) manuals = 5;
  else if (wave >= 1000 && wave < 1500) manuals = 8;
  else if (wave >= 1500)               manuals = 12;
  // Tier bonus: +1 manual per 3 tiers
  manuals += Math.floor((tier - 1) / 3);

  return { coins, gems, manuals };
}
function milestoneKey(tier, wave) { return `T${tier}W${wave}`; }
function milestoneReady(tier, wave) {
  return (save.bestWavePerTier[tier] || 0) >= wave;
}
function claimMilestone(tier, wave) {
  const key = milestoneKey(tier, wave);
  if (save.claimedMilestones[key]) return;
  if (!milestoneReady(tier, wave)) return;
  const r = milestoneReward(tier, wave);
  save.coins += r.coins;
  save.gems += r.gems;
  save.trainingManuals = (save.trainingManuals || 0) + (r.manuals || 0);
  save.claimedMilestones[key] = true;
  persistSave();
  renderHud();
  renderSubmenu();
}

// ============================================================
// RUN STATE
// ============================================================
const game = {
  running: false,
  paused: false,
  startTime: 0,
  tier: 1,
  wave: 1,
  enemiesKilledInWave: 0,
  enemiesPerWave: 10,
  bossWave: false,
  cash: 0,
  hp: 100,
  hpMax: 100,
  enemies: [],
  projectiles: [],
  enemyProjectiles: [],
  lastShotTime: 0,
  focusTarget: null,
  focusShotsRemaining: 0,
  lastFocusTime: 0,
  upgrades: {
    // OFFENSE - big stats (5000 levels, piecewise)
    damage:           { name: 'Damage',           group: 'offense', level: 0, cost0: 5,    costMul: 1.07, max: 5000 },
    attackSpeed:      { name: 'Fire Rate',        group: 'offense', level: 0, cost0: 8,    costMul: 1.08, max: 5000 },
    // OFFENSE - chance/power stats (100 cap, 1% per level)
    critChance:       { name: 'Crit Chance',      group: 'offense', level: 0, cost0: 20,   costMul: 1.14, max: 100 },
    critPower:        { name: 'Crit Power',       group: 'offense', level: 0, cost0: 40,   costMul: 1.15, max: 100 },
    multishotChance:  { name: 'Multishot Chance', group: 'offense', level: 0, cost0: 30,   costMul: 1.14, max: 100 },
    multishotPower:   { name: 'Multishot Power',  group: 'offense', level: 0, cost0: 40,   costMul: 1.15, max: 100 },
    multishotTargets: { name: 'Multi Targets',    group: 'offense', level: 0, cost0: 500,  costMul: 3.5,  max: 5 },
    bounceChance:     { name: 'Bounce Chance',    group: 'offense', level: 0, cost0: 25,   costMul: 1.14, max: 100 },
    bouncePower:      { name: 'Bounce Power',     group: 'offense', level: 0, cost0: 35,   costMul: 1.15, max: 100 },
    bounceTargets:    { name: 'Bounce Targets',   group: 'offense', level: 0, cost0: 800,  costMul: 3.5,  max: 5 },
    // OFFENSE - range
    range:            { name: 'Range',            group: 'offense', level: 0, cost0: 14,   costMul: 1.11, max: 100 },
    // DEFENSE
    health:           { name: 'Core Integrity',   group: 'defense', level: 0, cost0: 10,   costMul: 1.09, max: 5000 },
    defense:          { name: 'Armor',             group: 'defense', level: 0, cost0: 18,   costMul: 1.12, max: 180 },
    shield:           { name: 'Shield',           group: 'defense', level: 0, cost0: 25,   costMul: 1.10, max: 5000 },
    lifesteal:        { name: 'Lifesteal',        group: 'defense', level: 0, cost0: 100,  costMul: 1.15, max: 400 },
    regen:            { name: 'Regen',            group: 'defense', level: 0, cost0: 60,   costMul: 1.14, max: 200 },
    // ECONOMY
    cashBonus:        { name: 'Cash Bonus',       group: 'economy', level: 0, cost0: 15,   costMul: 1.12 },
    waveBonus:        { name: 'Wave Bonus',       group: 'economy', level: 0, cost0: 25,   costMul: 1.13 },
    combo:            { name: 'Combo',            group: 'economy', level: 0, cost0: 40,   costMul: 1.15, max: 20 },
    bossBounty:       { name: 'Boss Bounty',      group: 'economy', level: 0, cost0: 60,   costMul: 1.16 },
    coinBonus:        { name: 'Scrap Bonus',      group: 'economy', level: 0, cost0: 500,  costMul: 1.22, max: 50 },
    // ACTION
    heal:             { name: 'Heal',             group: 'action',  level: 0, cost0: 0,    costMul: 1, isAction: true }
  },
  bf: null, bfRect: null, towerEl: null, rangeRingEl: null,
  towerX: 0, towerY: 0,
  tickHandle: null, lastTick: 0,
  enemiesKilledThisRun: 0,
  cashEarnedThisRun: 0,
  damageBlockedThisRun: 0,
  bossesDefeated: 0,
  lastEnemySpawn: 0,
  regenAccum: 0,
  healsUsed: 0,
  bossSpawned: false,
  comboCount: 0,
  comboLastKillTime: 0,
  // Apex card state — reset each run
  shotCount: 0,               // for Storm Thread arc cadence
  shield: 0, shieldMax: 0,    // for Bulwark Veil
  timeLockLastTrigger: 0,     // timestamp ms of last Time Lock proc
  enemySlowUntil: 0,          // global slow expiry (ms timestamp)
  enemySlowFrac: 0,           // current slow fraction while active
  lastStandUsed: false        // Last Stand fires once per run
};

// ============================================================
// GETTERS — v0.7.0 COMBAT SYSTEM
// ============================================================

// Piecewise long-stat curve. Returns a bonus FRACTION (e.g. 0.50 = +50%)
//   L1-100   = +1%   per level  (max +100%)
//   L101-500 = +0.25% per level (max +200%)
//   L501+    = +0.05% per level (max +425% at 5000)
function longStatBonus(level) {
  if (level <= 0) return 0;
  if (level <= 100) return level * 0.01;
  if (level <= 500) return 1.00 + (level - 100) * 0.0025;
  return 2.00 + (level - 500) * 0.0005;
}
function longStatBonusNext(level) { return longStatBonus(level + 1); }

// === Damage ===
function getDamage() {
  const u = game.upgrades.damage;
  const permBase = rankPermanentValue('damage'); // 5 + rank * 1
  const run = 1 + longStatBonus(u.level);
  const cardBucket = getCardBucket('damage');
  const predator = getPredatorLoopPerBoss();
  const predBonus = predator ? predator.dmg * (game.bossesDefeated || 0) : 0;
  return permBase * run * (1 + cardBucket) * (1 + predBonus) * getHeroCoreMultiplier('damage');
}
function getDamageNext() {
  const u = game.upgrades.damage;
  const permBase = rankPermanentValue('damage');
  const run = 1 + longStatBonus(u.level + 1);
  const cardBucket = getCardBucket('damage');
  const predator = getPredatorLoopPerBoss();
  const predBonus = predator ? predator.dmg * (game.bossesDefeated || 0) : 0;
  return permBase * run * (1 + cardBucket) * (1 + predBonus);
}

// === Fire Rate === (65% of curve per audit — multiplies DPS)
function getAttackSpeed() {
  const u = game.upgrades.attackSpeed;
  const permBase = rankPermanentValue('fireRate'); // 1.0 + rank * 0.02
  const cardBucket = getCardBucket('attackSpeed');
  const predator = getPredatorLoopPerBoss();
  const predBonus = predator ? predator.aps * (game.bossesDefeated || 0) : 0;
  return permBase * (1 + longStatBonus(u.level) * 0.65) * (1 + cardBucket) * (1 + predBonus) * getHeroCoreMultiplier('fireRate');
}
function getAttackSpeedNext() {
  const u = game.upgrades.attackSpeed;
  const permBase = rankPermanentValue('fireRate');
  const cardBucket = getCardBucket('attackSpeed');
  const predator = getPredatorLoopPerBoss();
  const predBonus = predator ? predator.aps * (game.bossesDefeated || 0) : 0;
  return permBase * (1 + longStatBonus(u.level + 1) * 0.65) * (1 + cardBucket) * (1 + predBonus);
}
function getAttackInterval() { return 1000 / getAttackSpeed(); }

// === Core Integrity (max HP) ===
function getMaxHp() {
  const u = game.upgrades.health;
  const permBase = rankPermanentValue('coreHealth'); // 100 + rank * 10
  const run = 1 + longStatBonus(u.level);
  const cardBucket = getCardBucket('health');
  return Math.floor(permBase * run * (1 + cardBucket) * getHeroCoreMultiplier('coreHealth'));
}
function getMaxHpNext() {
  const u = game.upgrades.health;
  const permBase = rankPermanentValue('coreHealth');
  const run = 1 + longStatBonus(u.level + 1);
  const cardBucket = getCardBucket('health');
  return Math.floor(permBase * run * (1 + cardBucket));
}

// === Armor === (0.5% per in-run level + flat from ranks, cap 75%)
function getDefenseFraction() {
  const u = game.upgrades.defense;
  const rankFlat = rankFlatBonus('armor'); // rank * 0.005
  return Math.min(0.75, (u.level * 0.005 + rankFlat + getCardBucket('defense')) * getHeroCoreMultiplier('armor'));
}
function getDefenseFractionNext() {
  const u = game.upgrades.defense;
  const rankFlat = rankFlatBonus('armor');
  return Math.min(0.75, (u.level + 1) * 0.005 + rankFlat + getCardBucket('defense'));
}

// === Range ===
// In-run upgrades add 3px per level (max 100 levels = 300px).
// Permanent ranks add flatPerRank (1.2) per rank directly (500 ranks = 600px = full screen).
// Base range: 60px (small circle around tower, zoomed-out scale).
function getRangeLevel() { return game.upgrades.range.level + Math.floor(rankFlatBonus('range')); }
function getRange() {
  const inRunLevel = game.upgrades.range.level;
  const permBonus = rankFlatBonus('range'); // 500 * 1.2 = 600px at max
  const base = 60 + inRunLevel * 1.5 + permBonus;
  return base * (1 + getCardBucket('range')) * getHeroCoreMultiplier('range');
}
function getRangeNext() {
  const inRunLevel = game.upgrades.range.level + 1;
  const permBonus = rankFlatBonus('range');
  const base = 60 + inRunLevel * 1.5 + permBonus;
  return base * (1 + getCardBucket('range'));
}
function rangeLabel(rangeVal) {
  if (rangeVal < 100)  return 'Short';
  if (rangeVal < 175)  return 'Medium';
  if (rangeVal < 250)  return 'Long';
  if (rangeVal < 325)  return 'Very Long';
  return 'Full Screen';
}

// === Crit Chance === (1% per in-run level, rank adds flat)
function getCritChance() {
  const base = game.upgrades.critChance.level * 0.01;
  return Math.min(1.00, (base + rankFlatBonus('critChance') + getCardBucket('crit')) * getHeroCoreMultiplier('critChance'));
}
function getCritChanceNext() {
  const base = (game.upgrades.critChance.level + 1) * 0.01;
  return Math.min(1.00, base + rankFlatBonus('critChance') + getCardBucket('crit'));
}

// === Crit Power === (rank adds base from 2.0, in-run adds up to +1.0)
function getCritPower() {
  const permBase = rankPermanentValue('critPower'); // 2.0 + rank*0.02
  const lvl = game.upgrades.critPower.level * 0.01;
  return (permBase + Math.min(1.00, lvl) + getCardBucket('critPower')) * getHeroCoreMultiplier('critPower');
}
function getCritPowerNext() {
  const permBase = rankPermanentValue('critPower');
  const lvl = (game.upgrades.critPower.level + 1) * 0.01;
  return permBase + Math.min(1.00, lvl) + getCardBucket('critPower');
}

// === Multishot === (clean 3-stat model)
// Chance: % chance to fire ONE extra shot per target
// Power: damage multiplier on extra shots (1.0 = full damage, lower = weaker)
// Targets: max simultaneous targets hit per volley (1 = single, up to 6)
function getMultishotChance() {
  return Math.min(1.00, (game.upgrades.multishotChance.level * 0.01 + rankFlatBonus('multiChance') + getCardBucket('multiChance')) * getHeroCoreMultiplier('multiChance'));
}
function getMultishotChanceNext() {
  return Math.min(1.00, (game.upgrades.multishotChance.level + 1) * 0.01 + rankFlatBonus('multiChance') + getCardBucket('multiChance'));
}
function getMultishotPower() {
  // Starts at 50%, +0.5% per in-run level, caps at 100% at level 100; rank adds flat
  return (0.50 + Math.min(0.50, game.upgrades.multishotPower.level * 0.005) + rankFlatBonus('multiPower') + getCardBucket('multiPower')) * getHeroCoreMultiplier('multiPower');
}
function getMultishotPowerNext() {
  return 0.50 + Math.min(0.50, (game.upgrades.multishotPower.level + 1) * 0.005) + rankFlatBonus('multiPower') + getCardBucket('multiPower');
}
function getMultishotTargets() {
  // Base 1 + in-run level + rank level + card
  return Math.floor((1 + game.upgrades.multishotTargets.level + rankFlatBonus('multiTargets') + Math.round(getCardBucket('multiTargetsAdd'))) * getHeroCoreMultiplier('multiTargets'));
}
function getMultishotTargetsNext() {
  return 1 + (game.upgrades.multishotTargets.level + 1) + rankFlatBonus('multiTargets') + Math.round(getCardBucket('multiTargetsAdd'));
}

// Determines how many shots fire per volley
function rollMultishotCount() {
  const chance = getMultishotChance();
  if (chance <= 0) return 1;
  return Math.random() < chance ? 2 : 1;
}

// === Bounce === (same structure as multishot)
function getBounceChance() {
  return Math.min(1.00, (game.upgrades.bounceChance.level * 0.01 + rankFlatBonus('bounceChance') + getCardBucket('bounceChance')) * getHeroCoreMultiplier('bounceChance'));
}
function getBounceChanceNext() {
  return Math.min(1.00, (game.upgrades.bounceChance.level + 1) * 0.01 + rankFlatBonus('bounceChance') + getCardBucket('bounceChance'));
}
function getBouncePower() {
  return (0.50 + Math.min(0.50, game.upgrades.bouncePower.level * 0.005) + rankFlatBonus('bouncePower') + getCardBucket('bouncePower')) * getHeroCoreMultiplier('bouncePower');
}
function getBouncePowerNext() {
  return 0.50 + Math.min(0.50, (game.upgrades.bouncePower.level + 1) * 0.005) + rankFlatBonus('bouncePower') + getCardBucket('bouncePower');
}
function getBounceTargets() {
  return Math.floor((game.upgrades.bounceTargets.level + rankFlatBonus('bounceTargets') + Math.round(getCardBucket('bounceTargetsAdd'))) * getHeroCoreMultiplier('bounceTargets'));
}
function getBounceTargetsNext() {
  return game.upgrades.bounceTargets.level + 1 + rankFlatBonus('bounceTargets') + Math.round(getCardBucket('bounceTargetsAdd'));
}

// === Lifesteal === (0.25% per level, max 100% = level 400)
function getLifestealFraction() {
  return Math.min(1.00, (game.upgrades.lifesteal.level * 0.0025 + rankFlatBonus('lifesteal') + getCardBucket('lifesteal')) * getHeroCoreMultiplier('lifesteal'));
}
function getLifestealFractionNext() {
  return Math.min(1.00, (game.upgrades.lifesteal.level + 1) * 0.0025 + rankFlatBonus('lifesteal') + getCardBucket('lifesteal'));
}

// === Regen === (0.05% max HP/sec per in-run level, cap 10%, rank adds flat)
function getRegenPctPerSec() {
  return Math.min(0.10, (game.upgrades.regen.level * 0.0005 + rankFlatBonus('regen') + getCardBucket('regen')) * getHeroCoreMultiplier('regen'));
}
function getRegenPctPerSecNext() {
  return Math.min(0.10, (game.upgrades.regen.level + 1) * 0.0005 + rankFlatBonus('regen') + getCardBucket('regen'));
}
function getRegenPerSec() {
  return game.hpMax * getRegenPctPerSec();
}

// === Economy ===
// Ranks give flat %: cashBonus adds rank*0.02 to the multiplier
function getCashMul() {
  const u = game.upgrades.cashBonus;
  const cardBucket = getCardBucket('cash');
  return (1 + u.level * 0.05 + rankFlatBonus('cashBonus')) * (1 + cardBucket) * getHeroCoreMultiplier('cashBonus');
}
function getCashMulNext() {
  const u = game.upgrades.cashBonus;
  const cardBucket = getCardBucket('cash');
  return (1 + (u.level + 1) * 0.05 + rankFlatBonus('cashBonus')) * (1 + cardBucket);
}
function getWaveBonusMul() {
  return (1 + game.upgrades.waveBonus.level * 0.15 + rankFlatBonus('waveBonus')) * (1 + getCardBucket('waveBonus')) * getHeroCoreMultiplier('waveBonus');
}
function getWaveBonusMulNext() {
  return (1 + (game.upgrades.waveBonus.level + 1) * 0.15 + rankFlatBonus('waveBonus')) * (1 + getCardBucket('waveBonus'));
}
function getComboMaxMul() {
  return (1 + game.upgrades.combo.level * 0.075 + rankFlatBonus('comboBonus')) * (1 + getCardBucket('comboMax')) * getHeroCoreMultiplier('comboBonus');
}
function getComboMaxMulNext() {
  return (1 + (game.upgrades.combo.level + 1) * 0.075 + rankFlatBonus('comboBonus')) * (1 + getCardBucket('comboMax'));
}
function getCurrentComboMul() {
  if (game.upgrades.combo.level === 0) return 1;
  const max = getComboMaxMul();
  const progress = Math.min(1, game.comboCount / 20);
  return 1 + (max - 1) * progress;
}
// Combo decay: base 5000ms, rank adds flat ms, card adds ms of decay window
function getComboDecayMs() {
  return (5000 + rankFlatBonus('comboDuration') + getCardBucket('comboDecay')) * getHeroCoreMultiplier('comboDuration');
}
function getBossBountyMul() {
  return (1 + game.upgrades.bossBounty.level * 0.25 + rankFlatBonus('bossBounty')) * (1 + getCardBucket('bossBounty')) * getHeroCoreMultiplier('bossBounty');
}
function getBossBountyMulNext() {
  return (1 + (game.upgrades.bossBounty.level + 1) * 0.25 + rankFlatBonus('bossBounty')) * (1 + getCardBucket('bossBounty'));
}
// Boss damage bonus from cards (applied to projectiles hitting bosses)
function getBossDamageBonus() {
  return getCardBucket('bossDmg');
}

// === Coin Bonus === (end-run coin multiplier, max 1.5× at L50)
// Levels 1-50 give linear +0.01 per level (1.00 at L0, 1.50 at L50).
function getCoinBonusMul() {
  return 1 + Math.min(0.5, game.upgrades.coinBonus.level * 0.01);
}
function getCoinBonusMulNext() {
  return 1 + Math.min(0.5, (game.upgrades.coinBonus.level + 1) * 0.01);
}

// === Thorns === (reflect % of melee damage back to attacker)
function getThornsFraction() { return rankFlatBonus('thorns') * getHeroCoreMultiplier('thorns'); }

// === Knockback === (chance to push melee attacker back)
function getKnockbackChance() { return rankFlatBonus('knockback') * getHeroCoreMultiplier('knockback'); }

// === Barrier / Permanent Shield ===
// Shield max = permanent rank bonus + in-run shield upgrade (8 HP per level)
function getBarrierShieldMax() {
  const rankBonus = Math.floor(rankFlatBonus('shieldHP'));
  const inRunBonus = game.upgrades.shield ? game.upgrades.shield.level * 8 : 0;
  return Math.floor((rankBonus + inRunBonus) * getHeroCoreMultiplier('shieldHP'));
}
function getBarrierShieldMaxNext() {
  const rankBonus = Math.floor(rankFlatBonus('shieldHP'));
  const inRunBonus = game.upgrades.shield ? (game.upgrades.shield.level + 1) * 8 : 0;
  return Math.floor((rankBonus + inRunBonus) * getHeroCoreMultiplier('shieldHP'));
}
function getBarrierRegenPerSec() { return rankFlatBonus('shieldRegen') * getHeroCoreMultiplier('shieldRegen'); }

// === Coin Multiplier === (permanent end-run multiplier from ranks)
function getCoinMultiplierBonus() { return rankFlatBonus('coinMultiplier') * getHeroCoreMultiplier('coinMultiplier'); }

// === Gem Find === (chance for non-boss kills to drop a gem)
function getGemFindChance() { return rankFlatBonus('gemFind') * getHeroCoreMultiplier('gemFind'); }

// === Projectile Speed === (multiplier on base 900 speed)
function getProjSpeedMul() { return (1 + rankFlatBonus('projSpeed')) * getHeroCoreMultiplier('projSpeed'); }

// === Pierce === (chance for projectile to pass through and hit another enemy)
function getPierceChance() { return rankFlatBonus('pierce') * getHeroCoreMultiplier('pierce'); }

// === Overcharge === (chance for a shot to deal bonus damage)
function getOverchargeChance() { return rankFlatBonus('overchargeChance') * getHeroCoreMultiplier('overchargeChance'); }
function getOverchargePower() { return (1 + rankFlatBonus('overchargePower')) * getHeroCoreMultiplier('overchargePower'); }

// === Heal ===
function getHealAmount() { return Math.floor(game.hpMax * 0.25); }
function getHealCost() {
  const heal = getHealAmount();
  return Math.floor(heal * 0.5 * (1 + game.wave / 100) * (1 + game.healsUsed * 0.4));
}

function upgradeCost(u) { return Math.floor(u.cost0 * Math.pow(u.costMul, u.level)); }

function upgradeDescriptor(key) {
  switch (key) {
    case 'damage':           return { cur: formatStat(getDamage()), next: formatStat(getDamageNext()), unit: '' };
    case 'attackSpeed':      return { cur: getAttackSpeed().toFixed(2), next: getAttackSpeedNext().toFixed(2), unit: '/s' };
    case 'health':           return { cur: formatStat(getMaxHp()), next: formatStat(getMaxHpNext()), unit: ' HP' };
    case 'defense':          return { cur: (getDefenseFraction() * 100).toFixed(1), next: (getDefenseFractionNext() * 100).toFixed(1), unit: '%' };
    case 'shield':           return { cur: getBarrierShieldMax(), next: getBarrierShieldMaxNext(), unit: ' HP' };
    case 'range': {
      return { cur: Math.round(getRange()), next: Math.round(getRangeNext()), unit: ' range' };
    }
    case 'critChance':       return { cur: (getCritChance() * 100).toFixed(0), next: (getCritChanceNext() * 100).toFixed(0), unit: '%' };
    case 'critPower':        return { cur: '×' + getCritPower().toFixed(2), next: '×' + getCritPowerNext().toFixed(2), unit: '' };
    case 'multishotChance':  return { cur: (getMultishotChance() * 100).toFixed(1), next: (getMultishotChanceNext() * 100).toFixed(1), unit: '%' };
    case 'multishotPower':   return { cur: (getMultishotPower() * 100).toFixed(1), next: (getMultishotPowerNext() * 100).toFixed(1), unit: '%' };
    case 'multishotTargets': return { cur: getMultishotTargets(), next: getMultishotTargetsNext(), unit: ' targets' };
    case 'bounceChance':     return { cur: (getBounceChance() * 100).toFixed(1), next: (getBounceChanceNext() * 100).toFixed(1), unit: '%' };
    case 'bouncePower':      return { cur: (getBouncePower() * 100).toFixed(1), next: (getBouncePowerNext() * 100).toFixed(1), unit: '%' };
    case 'bounceTargets':    return { cur: getBounceTargets(), next: getBounceTargetsNext(), unit: ' bounces' };
    case 'lifesteal':        return { cur: (getLifestealFraction() * 100).toFixed(1), next: (getLifestealFractionNext() * 100).toFixed(1), unit: '% dmg' };
    case 'regen':            return { cur: (getRegenPctPerSec() * 100).toFixed(2), next: (getRegenPctPerSecNext() * 100).toFixed(2), unit: '% HP/s' };
    case 'cashBonus':        return { cur: '×' + getCashMul().toFixed(2), next: '×' + getCashMulNext().toFixed(2), unit: '' };
    case 'waveBonus':        return { cur: '×' + getWaveBonusMul().toFixed(2), next: '×' + getWaveBonusMulNext().toFixed(2), unit: '' };
    case 'combo':            return { cur: '×' + getComboMaxMul().toFixed(2), next: '×' + getComboMaxMulNext().toFixed(2), unit: ' max' };
    case 'bossBounty':       return { cur: '×' + getBossBountyMul().toFixed(2), next: '×' + getBossBountyMulNext().toFixed(2), unit: '' };
    case 'coinBonus':        return { cur: '×' + getCoinBonusMul().toFixed(2), next: '×' + getCoinBonusMulNext().toFixed(2), unit: ' scrap' };
  }
  return { cur: '', next: '', unit: '' };
}

// ============================================================
// WAVE SCALING — piecewise (was 1.18^wave across all bands)
// ============================================================
// Early game (W1-30): fast ramp, exciting first 30 waves
// Mid game (W31-120): moderate, rewarding progression
// Late game (W121+): flat growth, keeps runs possible without fake-difficulty wall
function hpWaveMul(w) {
  if (w <= 30) return Math.pow(1.055, w - 1);
  if (w <= 120) return Math.pow(1.055, 29) * Math.pow(1.028, w - 30);
  return Math.pow(1.055, 29) * Math.pow(1.028, 90) * Math.pow(1.009, w - 120);
}
function dmgWaveMul(w) {
  if (w <= 30) return Math.pow(1.038, w - 1);
  if (w <= 120) return Math.pow(1.038, 29) * Math.pow(1.020, w - 30);
  return Math.pow(1.038, 29) * Math.pow(1.020, 90) * Math.pow(1.007, w - 120);
}
function cashWaveMul(w) {
  if (w <= 30) return Math.pow(1.060, w - 1);
  if (w <= 120) return Math.pow(1.060, 29) * Math.pow(1.030, w - 30);
  return Math.pow(1.060, 29) * Math.pow(1.030, 90) * Math.pow(1.011, w - 120);
}
// Tier multipliers — SPLIT per stat (was uniform ×1.5)
function hpTierMul(t)   { return Math.pow(1.18, t - 1); }
function dmgTierMul(t)  { return Math.pow(1.11, t - 1); }
function cashTierMul(t) { return Math.pow(1.24, t - 1); }
// Legacy compatibility for UI code that still calls tierMultiplier()
function tierMultiplier(tier) { return hpTierMul(tier); }

function enemyHpForWave(wave) {
  // v0.7.15: Tier 1 onboarding — waves 1-10 get HP = wave number exactly.
  // So W1 = 1 HP, W2 = 2 HP, ..., W10 = 10 HP. Lets new players breathe.
  // From W11 onward, normal scaling resumes.
  if (game.tier === 1 && wave <= 10) {
    return wave; // 1,2,3,4,5,6,7,8,9,10
  }
  // Base HP 5 so regular scaling lands Wave 11 around 11-13 HP.
  return Math.floor(5 * hpWaveMul(wave) * hpTierMul(game.tier));
}
function enemySpeedForWave(wave) {
  // Base speed scales with wave, plus a tier boost so late-game enemies are faster
  const waveSpeed = 35 + Math.min(50, wave * 0.25);
  const tierBoost = 1 + (game.tier - 1) * 0.03; // T1=1.0, T10=1.27, T50=2.47
  return waveSpeed * tierBoost;
}
function cashRewardForWave(wave) {
  // Base cash 5 so first kill buys the first Damage upgrade (cost0 = 5).
  return Math.floor(5 * cashWaveMul(wave) * cashTierMul(game.tier));
}
function damageToTowerForWave(wave) {
  return Math.floor(3 * dmgWaveMul(wave) * dmgTierMul(game.tier));
}
function spawnIntervalForWave(wave) {
  // Base interval decreases as waves progress — faster spawns at higher waves
  let base;
  if (wave <= 30) base = Math.max(400, 900 - wave * 14);
  else if (wave <= 120) base = Math.max(200, 580 - (wave - 30) * 4);
  else base = 180;
  // Tier scaling: higher tiers spawn FASTER (enemies come in harder & quicker)
  // T1 = ×1.0, T2 = ×0.92, T5 = ×0.70, T10 = ×0.52, T50 = ×0.20 (floor)
  const tierSpeedUp = Math.max(0.20, 1 - (game.tier - 1) * 0.06);
  return Math.floor(base * tierSpeedUp);
}
// End-run coin reward: sublinear in wave, linear in tier, so deep runs have diminishing returns.
function coinRewardForRun(maxWave, totalCash) {
  // v0.7.25: Reduced wavePart exponent from 1.35 to 1.15 to slow early-tier
  // coin accumulation. Tier multiplier raised so higher tiers feel more rewarding.
  const wavePart = Math.pow(maxWave, 1.15) * Math.pow(1.30, game.tier - 1);
  const cashPart = Math.pow(Math.max(1, totalCash), 0.50) / 50;
  const bossPart = game.bossesDefeated * 6 * Math.pow(1.15, game.tier - 1);
  const coinBonus = (game.upgrades && game.upgrades.coinBonus) ? getCoinBonusMul() : 1;
  const cardCoinGain = 1 + getCardBucket('coinGain');
  const permCoinMul = 1 + getCoinMultiplierBonus();
  let reward = Math.floor((wavePart + cashPart + bossPart) * coinBonus * cardCoinGain * permCoinMul);
  // Guarantee first run always affords at least one damage rank (cost0 = 10)
  if (save.totalRuns === 0 && reward < 10) reward = 10;
  return reward;
}

// ============================================================
// ENEMY TYPES
// ============================================================
const ENEMY_TYPES = {
  normal:    { name: 'Normal',    color: 'var(--danger)', hpMul: 1.0, speedMul: 1.0,  dmgMul: 1.0, meleeIntervalMul: 1.0,  unlockTier: 1,  desc: 'Standard' },
  fast:      { name: 'Fast',      color: 'var(--gold)',   hpMul: 0.5, speedMul: 1.3,  dmgMul: 0.7, meleeIntervalMul: 0.65, unlockTier: 2,  desc: 'Low HP, fast attacks' },
  tank:      { name: 'Tank',      color: 'var(--purple)', hpMul: 3.0, speedMul: 0.55, dmgMul: 1.5, meleeIntervalMul: 1.4,  unlockTier: 3,  desc: 'High HP, slow hits' },
  shooter:   { name: 'Shooter',   color: 'var(--cyan2)',  hpMul: 1.0, speedMul: 0.8,  dmgMul: 0.5, meleeIntervalMul: 1.0,  unlockTier: 4,  desc: 'Stops & shoots' },
  elite:     { name: 'Elite',     color: 'var(--text)',   hpMul: 5.0, speedMul: 0.7,  dmgMul: 2.0, meleeIntervalMul: 1.1,  unlockTier: 5,  desc: 'Rare, dangerous' },
  augmenter: { name: 'Augmenter', color: 'var(--good)',   hpMul: 2.0, speedMul: 0.6,  dmgMul: 0.5, meleeIntervalMul: 1.2,  unlockTier: 10, desc: 'Buffs nearby +30%' },
  boss:      { name: 'Boss',      color: 'var(--gold)',   hpMul: 50,  speedMul: 0.5,  dmgMul: 3.0, meleeIntervalMul: 1.8,  unlockTier: 1,  desc: 'Every 25 waves' }
};

// ============================================================
// BATTLE FLOW
// ============================================================
// Enemies per wave: base ~50, scales with wave number and tier.
// Boss waves still spawn just the boss. Tier 1 early waves ramp gently.
function enemiesForWave(wave, tier) {
  if (wave > 0 && wave % 25 === 0) return 1; // boss wave — just the boss
  // Tier 1 waves 1-5: gentler start (20,25,30,35,40) then jump to normal
  if (tier === 1 && wave <= 5) return 15 + wave * 5;
  // Normal: base 50, +2 per wave, +5 per tier above 1 (cap 200 for perf)
  return Math.min(200, 50 + Math.floor(wave * 2) + Math.floor((tier - 1) * 5));
}
function startBattle(startingWave) {
  game.paused = false;
  game.tier = save.selectedTier;
  game.wave = startingWave || 1;
  game.enemiesKilledInWave = 0;
  game.bossWave = (game.wave % 25 === 0) && game.wave > 0;
  game.enemiesPerWave = enemiesForWave(game.wave, game.tier);
  game.cash = 0;
  game.enemies = [];
  game.projectiles = [];
  game.enemyProjectiles = [];
  // Flush DOM pools — remove stale pooled elements from prior runs
  if (typeof _pool !== 'undefined') {
    for (const type of Object.keys(_pool)) {
      for (const el of _pool[type]) el.remove();
      _pool[type].length = 0;
    }
  }
  for (const k in game.upgrades) game.upgrades[k].level = 0;
  game.hpMax = getMaxHp();
  game.hp = game.hpMax;
  game.startTime = Date.now();
  game.cashEarnedThisRun = 0;
  game.gemsEarnedThisRun = 0;
  game.enemiesKilledThisRun = 0;
  game.damageBlockedThisRun = 0;
  game.bossesDefeated = 0;
  game.lastEnemySpawn = 0;
  game.lastShotTime = 0;
  game.focusShotsRemaining = 0;
  game.focusTarget = null;
  game.regenAccum = 0;
  game.shieldRegenAccum = 0;
  game.healsUsed = 0;
  game.bossSpawned = false;
  game.comboCount = 0;
  game.comboLastKillTime = 0;
  // Apex card state reset
  game.shotCount = 0;
  // Initialize permanent shield from Barrier ranks (separate from Bulwark Veil)
  const barrierMax = getBarrierShieldMax();
  game.shield = barrierMax;
  game.shieldMax = barrierMax;
  game.barrierCap = barrierMax; // track barrier cap for regen
  game.timeLockLastTrigger = Date.now();
  game.enemySlowUntil = 0;
  game.enemySlowFrac = 0;
  game.lastStandUsed = false;
  // Tutorial step transitions
  if (save.tutorialStep === 0) { save.tutorialStep = 1; persistSave(); }
  else if (save.tutorialStep === 3) { save.tutorialStep = 4; persistSave(); }
  // Dismiss any tutorial tooltip before switching screens
  if (typeof dismissTutorial === 'function') dismissTutorial();
  document.getElementById('endOverlay').classList.remove('active');
  document.getElementById('liveStats').classList.remove('open');
  stopPassiveAccrual();
  showScreen('battle');
  setTimeout(() => {
    if (game.bf) {
      game.bf.querySelectorAll('.enemy, .projectile, .float-text, .focus-marker, .wave-banner, .boss-clear-wave, .gem-orb, .ad-pill, .enemy-info-popup').forEach(el => el.remove());
      if (typeof dismissEnemyInfo === 'function') dismissEnemyInfo();
      game.running = true;
      resetOrbStateForRun();
      renderUpgrades();
      renderHud();
      // Update battlefield rect AFTER upgrade panel renders, so tower position
      // uses the final battlefield height (upgrade panel eats space).
      updateBfRect();
      // Apply core + background art skins to battlefield elements
      if (typeof applyEquippedSkins === 'function') applyEquippedSkins();
      // And once more after a frame settles, belt-and-suspenders for iOS layout
      requestAnimationFrame(() => updateBfRect());
      startLoop();
      if (game.bossWave) showWaveBanner('BOSS ' + game.wave, true);
    }
  }, 30);
}

function endRunConfirm() {
  if (!game.running) return;
  if (!confirm('End run early? You keep scrap earned.')) return;
  endRun();
}

function endRun() {
  if (!game.running) return;
  game.running = false;
  stopLoop();
  if (typeof dismissEnemyInfo === 'function') dismissEnemyInfo();
  // If the menu overlay was open mid-run, close it so the death screen
  // actually shows on the battlefield underneath.
  if (typeof closeMenuOverlay === 'function' && isOverlayActive()) {
    closeMenuOverlay();
  }
  // Close live stats panel if open (Bug: was staying stuck on death screen)
  const liveStatsEl = document.getElementById('liveStats');
  if (liveStatsEl) liveStatsEl.classList.remove('open');
  // Clean up orb/pill if any
  if (orbState.currentOrb) { orbState.currentOrb.remove(); orbState.currentOrb = null; }
  if (orbState.pillEl) { orbState.pillEl.remove(); orbState.pillEl = null; }
  if (orbState.pillExpireTimer) { clearTimeout(orbState.pillExpireTimer); orbState.pillExpireTimer = null; }
  const maxWave = game.wave;
  const totalCash = game.cashEarnedThisRun;
  const coinsEarned = coinRewardForRun(maxWave, totalCash);
  save.coins += coinsEarned;
  save.totalRuns += 1;
  save.totalCashEarned += totalCash;
  save.totalEnemiesKilled += game.enemiesKilledThisRun;
  save.totalPlaytimeMs += Date.now() - game.startTime;
  save.totalBossesDefeated = (save.totalBossesDefeated || 0) + game.bossesDefeated;
  save.totalGemsEarned = (save.totalGemsEarned || 0) + (game.gemsEarnedThisRun || 0);
  // Tutorial: advance after first/second death
  if (save.tutorialStep === 1) save.tutorialStep = 2;
  else if (save.tutorialStep === 4) save.tutorialStep = 5;
  // Tournament: submit score if this was flagged as a tournament run
  if (game.isTourneyRun && typeof tourneySubmitScore === 'function') {
    tourneySubmitScore(maxWave, Date.now() - game.startTime);
    game.isTourneyRun = false;
  }
  const prevBest = save.bestWavePerTier[game.tier] || 0;
  if (maxWave > prevBest) save.bestWavePerTier[game.tier] = maxWave;
  if (game.tier > save.bestTier || (game.tier === save.bestTier && maxWave > save.bestWave)) {
    save.bestTier = game.tier;
    save.bestWave = maxWave;
  }
  // === HERO SYSTEM: Training manual drops ===
  let manualsEarned = 0;
  // Wave milestones: 1 manual per 25 waves reached
  if (maxWave >= 25) manualsEarned += Math.floor(maxWave / 25);
  // Boss kills: 1 manual per boss
  manualsEarned += game.bossesDefeated;
  // Tier milestone: bonus manuals every 10 tiers
  if (game.tier % 10 === 0) manualsEarned += Math.max(1, Math.floor(game.tier / 50));
  save.trainingManuals = (save.trainingManuals || 0) + manualsEarned;
  // Check hero unlocks based on new bestTier
  if (typeof checkHeroUnlocks === 'function') checkHeroUnlocks();
  persistSave();
  const stats = document.getElementById('endStats');
  const isNewBest = maxWave > prevBest;
  const tierJustUnlocked = (prevBest < 50 && maxWave >= 50);
  const runDurationMs = Date.now() - game.startTime;
  const runSec = Math.floor(runDurationMs / 1000);
  const runMin = Math.floor(runSec / 60);
  const runSecRem = runSec % 60;
  const durationStr = runMin > 0 ? `${runMin}m ${runSecRem}s` : `${runSecRem}s`;
  const kps = runSec > 0 ? (game.enemiesKilledThisRun / runSec).toFixed(1) : '0';
  stats.innerHTML = `
    ${isNewBest ? '<div class="end-banner new-best">★ NEW BEST WAVE ★</div>' : ''}
    ${tierJustUnlocked ? `<div class="end-banner tier-unlock">⚡ TIER ${game.tier + 1} UNLOCKED ⚡</div>` : ''}
    <div class="end-section-label">Run Overview</div>
    <div class="end-stat-row"><span class="end-stat-label">Difficulty</span><span class="end-stat-value">T${game.tier}</span></div>
    <div class="end-stat-row"><span class="end-stat-label">Wave reached</span><span class="end-stat-value">${maxWave}</span></div>
    <div class="end-stat-row"><span class="end-stat-label">Duration</span><span class="end-stat-value">${durationStr}</span></div>
    <div class="end-section-label">Combat</div>
    <div class="end-stat-row"><span class="end-stat-label">Enemies killed</span><span class="end-stat-value">${game.enemiesKilledThisRun}</span></div>
    <div class="end-stat-row"><span class="end-stat-label">Kills / sec</span><span class="end-stat-value">${kps}</span></div>
    <div class="end-stat-row"><span class="end-stat-label">Bosses defeated</span><span class="end-stat-value">${game.bossesDefeated}</span></div>
    <div class="end-stat-row"><span class="end-stat-label">Damage blocked</span><span class="end-stat-value">${formatNum(game.damageBlockedThisRun)}</span></div>
    <div class="end-section-label">Rewards</div>
    <div class="end-stat-row"><span class="end-stat-label">Cash earned</span><span class="end-stat-value">${formatNum(totalCash)}</span></div>
    <div class="end-stat-row"><span class="end-stat-label">Scrap earned</span><span class="end-stat-value gold">+${formatNum(coinsEarned)}</span></div>
    ${manualsEarned > 0 ? `<div class="end-stat-row"><span class="end-stat-label">Training Manuals</span><span class="end-stat-value" style="color:var(--cyan2)">+${manualsEarned}</span></div>` : ''}
    <div class="end-stat-row end-total"><span class="end-stat-label">Total scrap</span><span class="end-stat-value gold">${formatNum(save.coins)}</span></div>
  `;
  document.getElementById('endOverlay').classList.add('active');
  document.getElementById('endTitle').textContent = game.hp <= 0 ? 'Core Lost' : 'Run Ended';

  // Show the player's name above the "Core Lost" title
  const titleEl = document.getElementById('endTitle');
  if (titleEl && save.username) {
    const parent = titleEl.parentNode;
    const stale = parent.querySelector('.end-player');
    if (stale) stale.remove();
    const line = document.createElement('div');
    line.className = 'end-player';
    line.textContent = save.username;
    parent.insertBefore(line, titleEl);
  }

  renderHud();
}

function returnToMenu() {
  document.getElementById('endOverlay').classList.remove('active');
  // Tutorial: after first death, redirect to Research to buy damage rank
  if (save.tutorialStep === 2) {
    activeSubmenu = 'labs';
    activeResearchTab = 'combat';
  }
  showScreen('menu');
  renderMenu();
  renderHud();
  startPassiveAccrual();
  // Tutorial: show appropriate tooltip after menu renders
  if (typeof checkTutorial === 'function') {
    setTimeout(checkTutorial, 200);
  }
}

// ============================================================
// COMBAT LOOP
// ============================================================
function startLoop() {
  game.lastTick = performance.now();
  function tick(now) {
    if (!game.running) return;
    if (game.paused) {
      game.lastTick = now; // prevent dt spike on unpause
      game.tickHandle = requestAnimationFrame(tick);
      return;
    }
    const rawDt = Math.min(100, now - game.lastTick) / 1000;
    const dt = rawDt * (save.settings.gameSpeed || 1);
    game.lastTick = now;
    update(dt, rawDt);
    render();
    game.tickHandle = requestAnimationFrame(tick);
  }
  game.tickHandle = requestAnimationFrame(tick);
}
function stopLoop() {
  if (game.tickHandle) cancelAnimationFrame(game.tickHandle);
  game.tickHandle = null;
}

function update(dt, rawDt) {
  if (!game.bfRect) updateBfRect();
  const now = performance.now();
  const speedFactor = save.settings.gameSpeed || 1;

  // Tick Time Lock apex — may slow all enemies periodically.
  tickTimeLock(now);

  // Combo decay — window extended by Combo Bank card
  const decayMs = getComboDecayMs();
  if (game.comboCount > 0) {
    const timeSinceKill = now - game.comboLastKillTime;
    if (timeSinceKill > decayMs || decayMs <= 500) {
      game.comboCount = 0;
    } else if (timeSinceKill > 500) {
      // Linear decay starting at 0.5s, fully gone at decayMs
      const decayProgress = (timeSinceKill - 500) / (decayMs - 500);
      const targetCombo = Math.max(0, game.comboCount * (1 - decayProgress * 0.02));
      game.comboCount = targetCombo;
    }
  }

  const regen = getRegenPerSec();
  if (regen > 0) {
    game.regenAccum += regen * dt;
    if (game.regenAccum >= 1) {
      const inc = Math.floor(game.regenAccum);
      applyHealToTower(inc);
      game.regenAccum -= inc;
    }
  }

  // Barrier shield regen (from Barrier Systems ranks)
  const barrierRegen = getBarrierRegenPerSec();
  if (barrierRegen > 0 && game.barrierCap > 0) {
    // Regen shield up to barrier cap (doesn't exceed Bulwark Veil cap if present)
    const bulwarkCap = Math.floor(game.hpMax * getBulwarkShieldCap());
    const totalCap = Math.max(game.barrierCap, bulwarkCap);
    if (game.shield < totalCap) {
      game.shieldRegenAccum = (game.shieldRegenAccum || 0) + barrierRegen * dt;
      if (game.shieldRegenAccum >= 1) {
        const inc = Math.floor(game.shieldRegenAccum);
        game.shield = Math.min(totalCap, game.shield + inc);
        game.shieldMax = Math.max(game.shieldMax, game.shield);
        game.shieldRegenAccum -= inc;
      }
    }
  }

  // Spawn
  if (!game.lastEnemySpawn) game.lastEnemySpawn = now;
  if (game.bossWave) {
    if (!game.bossSpawned) {
      spawnBoss();
      game.bossSpawned = true;
    }
  } else {
    if ((now - game.lastEnemySpawn) * speedFactor > spawnIntervalForWave(game.wave)) {
      if (game.enemies.length < 150) {
        spawnEnemy();
        game.lastEnemySpawn = now;
      }
    }
  }

  // Move enemies (continuous-attack model)
  // - Enemies stop at their melee range when close to the tower.
  // - While in melee range, each enemy attacks every meleeInterval ms.
  // - Shooter enemies stay at shooter range and fire projectiles.
  const baseSpeed = enemySpeedForWave(game.wave);
  const MELEE_RANGE = 21;       // normal enemies stop this close (px) — zoomed out
  const BOSS_MELEE_RANGE = 26;  // bosses are bigger, stop sooner — zoomed out
  const MELEE_INTERVAL = 900;   // ms between melee attacks (baseline)
  // Per-type damage-per-hit scaling — enemies now hit repeatedly so each hit
  // is lower than the old one-shot contact damage. This preserves overall
  // pressure: old model = 1 big hit on death, new model = ~3-4 smaller hits
  // over 2-3 seconds while the tower tries to kill it.
  const HIT_FRAC = 0.32;  // each melee hit = 32% of the legacy contact damage
  for (const e of game.enemies) {
    if (e.dead) continue;
    const dx = game.towerX - e.x;
    const dy = game.towerY - e.y;
    const dist = Math.hypot(dx, dy);
    // --- Shooter behavior ---
    if (e.type === 'shooter') {
      const SHOOTER_IDEAL = 90;
      if (dist > SHOOTER_IDEAL) {
        // Close in until we reach our firing range
        const buffMul = e.auraBuffed ? 1.3 : 1;
        const speed = baseSpeed * (e.speedMul || 1) * buffMul;
        e.x += (dx / dist) * speed * dt;
        e.y += (dy / dist) * speed * dt;
      }
      // Fire projectiles
      if ((now - (e.lastShot || 0)) * speedFactor > 1500) {
        e.lastShot = now;
        spawnEnemyProjectile(e);
      }
      continue;
    }
    // --- Melee behavior ---
    const meleeR = (e.type === 'boss') ? BOSS_MELEE_RANGE : MELEE_RANGE;
    if (dist <= meleeR) {
      // In melee range. Attack on cooldown.
      if (!e.lastMeleeAt) e.lastMeleeAt = now;
      const interval = MELEE_INTERVAL * (e.meleeIntervalMul || 1);
      if ((now - e.lastMeleeAt) * speedFactor >= interval) {
        e.lastMeleeAt = now;
        const buffMul = e.auraBuffed ? 1.3 : 1;
        const baseDmg = damageToTowerForWave(game.wave) * (e.dmgMul || 1) * buffMul * HIT_FRAC;
        const reduced = baseDmg * (1 - getDefenseFraction());
        game.damageBlockedThisRun += baseDmg - reduced;
        const alive = applyDamageToTower(reduced);
        flashTower();
        if (save.settings.showFloatingDamage) {
          spawnFloat(game.towerX, game.towerY - 15, '-' + Math.floor(reduced), 'tower-dmg');
        }
        // Thorns: reflect fraction of incoming damage back to attacker
        const thornsFrac = getThornsFraction();
        if (thornsFrac > 0 && !e.dead) {
          const thornsDmg = baseDmg * thornsFrac;
          e.hp -= thornsDmg;
          if (save.settings.showFloatingDamage) {
            spawnFloat(e.x, e.y - 6, Math.floor(thornsDmg), 'crit');
          }
          if (e.hp <= 0) { e.dead = true; game.enemiesKilledInWave++; game.enemiesKilledThisRun++; }
        }
        // Knockback: chance to push attacker back to interrupt melee
        const kbChance = getKnockbackChance();
        if (kbChance > 0 && !e.dead && Math.random() < kbChance) {
          const kbDist = 30;
          const kbDx = e.x - game.towerX;
          const kbDy = e.y - game.towerY;
          const kbLen = Math.hypot(kbDx, kbDy) || 1;
          e.x += (kbDx / kbLen) * kbDist;
          e.y += (kbDy / kbLen) * kbDist;
          e.lastMeleeAt = now; // reset melee cooldown
        }
        if (!alive) { game.hp = 0; cleanDeadEnemies(); endRun(); return; }
      }
    } else {
      // Walk toward tower. Apply Time Lock slow if active.
      const slow = game.enemySlowFrac || 0;
      const buffMul = e.auraBuffed ? 1.3 : 1;
      const speed = baseSpeed * (e.speedMul || 1) * buffMul * (1 - slow);
      e.x += (dx / dist) * speed * dt;
      e.y += (dy / dist) * speed * dt;
    }
  }
  cleanDeadEnemies();

  // Augmenter aura: each augmenter buffs nearby enemies.
  // Effect: buffed enemies move 30% faster and deal 30% more damage.
  // Recalc each frame because enemies move.
  const AUG_RADIUS = 60;
  const augmenters = game.enemies.filter(e => !e.dead && e.type === 'augmenter');
  for (const e of game.enemies) {
    if (e.dead || e.type === 'augmenter') continue;
    let buffed = false;
    for (const a of augmenters) {
      if (Math.hypot(e.x - a.x, e.y - a.y) <= AUG_RADIUS) {
        buffed = true;
        break;
      }
    }
    e.auraBuffed = buffed;
  }
  for (const ep of game.enemyProjectiles) {
    const dx = game.towerX - ep.x;
    const dy = game.towerY - ep.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 6) {
      ep.dead = true;
      const baseDmg = damageToTowerForWave(game.wave) * 0.5;
      const reduced = baseDmg * (1 - getDefenseFraction());
      game.damageBlockedThisRun += baseDmg - reduced;
      const alive = applyDamageToTower(reduced);
      flashTower();
      if (save.settings.showFloatingDamage) {
        spawnFloat(game.towerX, game.towerY - 15, '-' + Math.floor(reduced), 'tower-dmg');
      }
      // Thorns on enemy projectiles: find nearest shooter and reflect
      const thornsFrac2 = getThornsFraction();
      if (thornsFrac2 > 0) {
        const shooter = pickClosestEnemy(game.towerX, game.towerY, null, 125);
        if (shooter && !shooter.dead) {
          const thornsDmg = baseDmg * thornsFrac2;
          shooter.hp -= thornsDmg;
          if (save.settings.showFloatingDamage) {
            spawnFloat(shooter.x, shooter.y - 6, Math.floor(thornsDmg), 'crit');
          }
          if (shooter.hp <= 0) { shooter.dead = true; game.enemiesKilledInWave++; game.enemiesKilledThisRun++; }
        }
      }
      if (!alive) { game.hp = 0; cleanDeadEnemies(); endRun(); return; }
    } else {
      const speed = 250;
      ep.x += (dx / dist) * speed * dt;
      ep.y += (dy / dist) * speed * dt;
    }
  }
  game.enemyProjectiles = game.enemyProjectiles.filter(ep => {
    if (ep.dead && ep.el) { _poolReturn('enemyProj', ep.el); ep.el = null; }
    return !ep.dead;
  });

  // Tower shooting
  const interval = getAttackInterval();
  if ((now - game.lastShotTime) * speedFactor > interval) {
    const nTargets = getMultishotTargets();
    const targets = pickTargets(nTargets);
    if (targets.length > 0) {
      for (const t of targets) {
        // Primary shot (full damage)
        fireAt(t, 1.0);
        // Roll multishot chance for an extra shot at multishot power damage
        if (Math.random() < getMultishotChance()) {
          fireAt(t, getMultishotPower());
        }
      }
      game.lastShotTime = now;
    }
  }

  // Projectile movement + bounce
  const bouncePower = getBouncePower();
  for (const p of game.projectiles) {
    if (p.dead) continue;
    if (!p.target || p.target.dead) {
      p.target = pickClosestEnemy(p.x, p.y, p.alreadyHit, getRange());
      if (!p.target) { p.dead = true; continue; }
    }
    const dx = p.target.x - p.x;
    const dy = p.target.y - p.y;
    const dist = Math.hypot(dx, dy);
    const speed = 900 * getProjSpeedMul();
    const move = speed * dt;
    if (move >= dist) {
      hitEnemy(p.target, p.damage, p.crit);
      p.alreadyHit.add(p.target);
      if (p.bouncesLeft > 0) {
        const next = pickClosestEnemy(p.target.x, p.target.y, p.alreadyHit, 125);
        if (next) {
          p.target = next;
          p.bouncesLeft--;
          p.damage *= bouncePower;
          if (p.el) p.el.classList.add('bounce');
        } else { p.dead = true; }
      } else if (Math.random() < getPierceChance()) {
        // Pierce: projectile passes through to the next enemy
        const next = pickClosestEnemy(p.target.x, p.target.y, p.alreadyHit, getRange());
        if (next) {
          p.target = next;
          p.damage *= 0.75; // pierce reduces damage by 25%
        } else { p.dead = true; }
      } else { p.dead = true; }
    } else {
      p.x += (dx / dist) * move;
      p.y += (dy / dist) * move;
    }
  }
  game.projectiles = game.projectiles.filter(p => {
    if (p.dead && p.el) { _poolReturn('projectile', p.el); p.el = null; }
    return !p.dead;
  });
}

function cleanDeadEnemies() {
  game.enemies = game.enemies.filter(e => {
    if (e.dead && e.el) { _poolReturn('enemy', e.el); e.el = null; }
    return !e.dead;
  });
}

function pickTargets(n) {
  if (game.enemies.length === 0) return [];
  const range = getRange();
  const focus = (game.focusTarget && game.focusShotsRemaining > 0) ? game.focusTarget : null;
  const inRange = game.enemies.filter(e => !e.dead && Math.hypot(e.x - game.towerX, e.y - game.towerY) <= range);
  if (inRange.length === 0) return [];
  const sorted = inRange.sort((a, b) => {
    if (focus) return Math.hypot(a.x - focus.x, a.y - focus.y) - Math.hypot(b.x - focus.x, b.y - focus.y);
    return Math.hypot(a.x - game.towerX, a.y - game.towerY) - Math.hypot(b.x - game.towerX, b.y - game.towerY);
  });
  return sorted.slice(0, n);
}

function pickClosestEnemy(fromX, fromY, exclude, maxDist) {
  let best = null, bestD = maxDist || Infinity;
  for (const e of game.enemies) {
    if (e.dead) continue;
    if (exclude && exclude.has(e)) continue;
    const d = Math.hypot(e.x - fromX, e.y - fromY);
    if (d < bestD) { best = e; bestD = d; }
  }
  return best;
}

// Centralized damage pipeline: handles Bulwark Veil shield + Last Stand.
// Returns true if tower still alive, false if this kill confirms death.
function applyDamageToTower(amount) {
  if (save.devState.godMode) return true;
  // Consume shield first (Bulwark Veil + Last Stand both feed into game.shield)
  if (game.shield > 0) {
    const absorbed = Math.min(game.shield, amount);
    game.shield -= absorbed;
    amount -= absorbed;
  }
  if (amount > 0) {
    game.hp -= amount;
  }
  // Last Stand: if this would kill, prevent once per run
  if (game.hp <= 0 && !game.lastStandUsed) {
    const frac = getLastStandShieldFrac();
    if (frac > 0) {
      game.lastStandUsed = true;
      game.hp = 1;
      game.shield = Math.floor(game.hpMax * frac);
      game.shieldMax = Math.max(game.shieldMax, game.shield);
      spawnFloat(game.towerX, game.towerY - 20, 'LAST STAND!', 'heal');
      return true;
    }
  }
  return game.hp > 0;
}

// Centralized heal pipeline: Bulwark Veil converts overheal to shield.
function applyHealToTower(amount) {
  const before = game.hp;
  game.hp = Math.min(game.hpMax, game.hp + amount);
  const actual = game.hp - before;
  const overflow = amount - actual;
  if (overflow > 0) {
    const cap = Math.floor(game.hpMax * getBulwarkShieldCap());
    if (cap > 0) {
      game.shield = Math.min(cap, game.shield + overflow);
      game.shieldMax = Math.max(game.shieldMax, game.shield);
    }
  }
  return actual;
}

// Time Lock apex: periodically freeze all enemies briefly.
// Returns the slow fraction active now (0 if no freeze).
function tickTimeLock(now) {
  const tl = getTimeLockData();
  if (!tl) { game.enemySlowFrac = 0; return 0; }
  // Trigger
  if (!game.timeLockLastTrigger) game.timeLockLastTrigger = now;
  if (now - game.timeLockLastTrigger >= tl.interval) {
    game.timeLockLastTrigger = now;
    game.enemySlowUntil = now + 2000;
    game.enemySlowFrac = tl.slow;
  }
  // Decay
  if (now > game.enemySlowUntil) {
    game.enemySlowFrac = 0;
  }
  return game.enemySlowFrac;
}

function fireAt(target, dmgMul) {
  dmgMul = dmgMul === undefined ? 1.0 : dmgMul;
  const baseDmg = getDamage();
  const isFocus = game.focusShotsRemaining > 0;
  const isCrit = Math.random() < getCritChance();
  let dmg = baseDmg * dmgMul;
  if (isFocus) { dmg *= 1.5; game.focusShotsRemaining--; }
  if (isCrit) dmg *= getCritPower();
  // Overcharge: chance for a power-boosted shot
  if (Math.random() < getOverchargeChance()) {
    dmg *= getOverchargePower();
  }
  // Boss damage bonus card (Boss Breaker)
  if (target.type === 'boss') dmg *= (1 + getBossDamageBonus());
  // Roll bounce — if passed, the projectile gets `bounceTargets` bounces
  const willBounce = Math.random() < getBounceChance();
  const bouncesAllowed = willBounce ? getBounceTargets() : 0;
  game.projectiles.push({
    x: game.towerX, y: game.towerY,
    target, damage: dmg, crit: isCrit, dead: false,
    bouncesLeft: bouncesAllowed,
    alreadyHit: new Set()
  });
  // Storm Thread apex: every Nth shot arc to 2 nearest enemies for % damage
  game.shotCount++;
  const st = getStormThreadData();
  if (st && game.shotCount % st.interval === 0) {
    const arcDmg = baseDmg * st.dmg;
    const nearby = pickNearbyEnemies(target, 2, 80);
    for (const extra of nearby) {
      game.projectiles.push({
        x: game.towerX, y: game.towerY,
        target: extra, damage: arcDmg, crit: false, dead: false,
        bouncesLeft: 0, alreadyHit: new Set(),
        isArc: true
      });
    }
  }
}

// Pick N nearest non-dead enemies excluding the given target
function pickNearbyEnemies(centerEnemy, count, maxDist) {
  const candidates = [];
  for (const e of game.enemies) {
    if (e.dead || e === centerEnemy) continue;
    const d = Math.hypot(e.x - centerEnemy.x, e.y - centerEnemy.y);
    if (d > maxDist) continue;
    candidates.push({ e, d });
  }
  candidates.sort((a, b) => a.d - b.d);
  return candidates.slice(0, count).map(c => c.e);
}

function spawnEnemyProjectile(enemy) {
  game.enemyProjectiles.push({ x: enemy.x, y: enemy.y, dead: false, el: null });
}

function hitEnemy(e, dmg, crit) {
  e.hp -= dmg;
  if (save.settings.showFloatingDamage) {
    spawnFloat(e.x, e.y - 6, Math.floor(dmg), crit ? 'crit' : 'dmg');
  }
  if (e.hp <= 0) {
    e.dead = true;
    game.enemiesKilledInWave++;
    game.enemiesKilledThisRun++;
    // Increment combo on every kill
    game.comboCount++;
    game.comboLastKillTime = performance.now();
    const comboMul = getCurrentComboMul();
    const mul = e.type === 'boss' ? 20 * getBossBountyMul() : (e.hpMul || 1);
    const reward = Math.floor(cashRewardForWave(game.wave) * mul * getCashMul() * comboMul);
    game.cash += reward;
    game.cashEarnedThisRun += reward;
    if (save.settings.showFloatingCash) {
      const comboLabel = (comboMul > 1.01) ? ` ×${comboMul.toFixed(2)}` : '';
      spawnFloat(e.x, e.y + 4, '+$' + formatNum(reward) + comboLabel, 'cash');
    }
    if (e.type === 'boss') {
      game.bossesDefeated++;
      bossClearEffect(e.x, e.y);
      if (typeof haptic === 'function') haptic('heavy');
      // Gems only from orbs, milestones, challenges, ads, or packs — no combat drops.
    }
    const ls = getLifestealFraction();
    if (ls > 0) {
      const heal = Math.max(1, Math.floor(dmg * ls));
      const actual = applyHealToTower(heal);
      if (actual > 0 && save.settings.showFloatingHeals) {
        spawnFloat(game.towerX + (Math.random() * 10 - 5), game.towerY - 6, '+' + actual, 'lifesteal');
      }
    }
    if (game.enemiesKilledInWave >= game.enemiesPerWave) advanceWave();
  }
}

function advanceWave() {
  game.wave++;
  game.enemiesKilledInWave = 0;
  game.bossWave = game.wave % 25 === 0;
  game.enemiesPerWave = enemiesForWave(game.wave, game.tier);
  game.bossSpawned = false;
  const bonus = Math.floor(cashRewardForWave(game.wave) * 5 * getCashMul() * getWaveBonusMul());
  game.cash += bonus;
  game.cashEarnedThisRun += bonus;
  if (game.bossWave) showWaveBanner('BOSS ' + game.wave, true);
  else showWaveBanner('WAVE ' + game.wave);
}

function spawnEnemy() {
  const w = game.bfRect.width;
  const h = game.bfRect.height;
  // Full 180° arc from top-left through top to top-right (enemies come from above & sides)
  const angle = (Math.random() * 2.0 - 1.0) * (Math.PI / 2);
  // Spawn well off-screen so enemies march into view
  const spawnDist = Math.max(w, h) + 60;
  const sx = game.towerX + Math.sin(angle) * spawnDist;
  const sy = game.towerY - Math.cos(angle) * spawnDist;
  // Allow off-screen positioning on sides; never below tower approach zone
  const x = Math.max(-20, Math.min(w + 20, sx));
  const y = Math.min(game.towerY - 40, sy);
  const r = Math.random();
  let type = 'normal';
  // Tier gates enemy variety. Higher tier = more variety available.
  if (game.tier >= ENEMY_TYPES.augmenter.unlockTier && r < 0.03) type = 'augmenter';
  else if (game.tier >= ENEMY_TYPES.elite.unlockTier && game.wave >= 10 && game.wave % 10 === 0 && r < 0.04) type = 'elite';
  else if (game.tier >= ENEMY_TYPES.shooter.unlockTier && game.wave >= 5 && r < 0.10) type = 'shooter';
  else if (game.tier >= ENEMY_TYPES.tank.unlockTier && r < 0.20) type = 'tank';
  else if (game.tier >= ENEMY_TYPES.fast.unlockTier && r < 0.25) type = 'fast';
  const t = ENEMY_TYPES[type];
  game.enemies.push({
    x, y, type,
    hp: enemyHpForWave(game.wave) * t.hpMul,
    hpMax: enemyHpForWave(game.wave) * t.hpMul,
    speedMul: t.speedMul, dmgMul: t.dmgMul, hpMul: t.hpMul,
    meleeIntervalMul: t.meleeIntervalMul || 1.0,
    dead: false, el: null, hpEl: null, hpFillEl: null, lastShot: 0, lastMeleeAt: 0,
    auraActive: type === 'augmenter'
  });
}

function spawnBoss() {
  const w = game.bfRect.width;
  const t = ENEMY_TYPES.boss;
  game.enemies.push({
    x: w / 2, y: -(game.bfRect.height * 0.15),
    type: 'boss',
    hp: enemyHpForWave(game.wave) * t.hpMul,
    hpMax: enemyHpForWave(game.wave) * t.hpMul,
    speedMul: t.speedMul, dmgMul: t.dmgMul, hpMul: t.hpMul,
    meleeIntervalMul: t.meleeIntervalMul || 1.0,
    dead: false, el: null, hpEl: null, hpFillEl: null, lastShot: 0, lastMeleeAt: 0
  });
}

function bossClearEffect(x, y) {
  const el = document.createElement('div');
  el.className = 'boss-clear-wave';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  game.bf.appendChild(el);
  setTimeout(() => el.remove(), 600);
}

