// ============================================================
// data.js — static tables: CARD_POOL, CARD_PRICING, PULL_ODDS, COPIES_TO_LEVEL, SLOT_UNLOCK_COSTS, TAGLINES, defaultSave shape, slot/copies helper functions.
// Owned by: balance/economy AI. Safe to edit without touching gameplay code.
// ============================================================

'use strict';

// ============================================================
// CONSTANTS
// ============================================================
const SAVE_KEY = 'tower_save_v8';
// Old save keys listed so we can DELETE them on load (not migrate).
// v7 added to the graveyard on v0.7.15 — labs replaced by ranks system,
// fresh start is intentional.
const DEAD_SAVE_KEYS = ['tower_save_v7', 'tower_save_v6', 'tower_save_v5', 'tower_save_v4', 'tower_save_v3', 'tower_save_v2'];
const MAX_TIER = 99999; // Tiers are now unlimited (was 100)
// Milestones: early ones every 25 waves, then 50s, then 100s, caps at W2000 (~2hrs at x10).
// Deep runs are the endgame grind — rewards escalate sharply past W500.
const MILESTONE_WAVES = [
  25, 50, 75, 100,           // early: learning the ropes
  150, 200, 250, 300,        // mid: getting strong
  400, 500,                  // late: serious investment
  600, 750, 1000,            // endgame: god-tier players
  1250, 1500, 1750, 2000     // ultra: 2-hour marathon at x10
];
// Bonus labels shown on milestone cards — describes the meta-benefit of that wave's rewards
const MILESTONE_BONUS = {
  25:  '+3% Damage',
  50:  '+5% Damage',
  75:  '+5% Fire Rate',
  100: '+10% HP',
  150: '+5% Crit Chance',
  200: '+8% Damage',
  250: '+10% Fire Rate',
  300: '+15% HP',
  400: '+10% Crit Power',
  500: '+15% Damage',
  600: '+20% HP',
  750: '+20% Damage',
  1000: '+25% All Stats',
  1250: '+30% Damage',
  1500: '+35% All Stats',
  1750: '+40% Damage',
  2000: '+50% All Stats'
};

// ============================================================
// CARD POOL (v0.7.6 placeholders — real 25-card pool in v0.8)
// ============================================================
// Each card:
//   id: unique key
//   name: display name
//   tier: 'standard' | 'prime' | 'apex'
//   icon: emoji glyph
//   desc: short text of what it does
//   stat: bucket key — 'damage' | 'health' | 'cash' | 'crit'
//   values: array of 5 fractional bonuses for levels 1-5 (e.g. [0.08, 0.16, ...] = +8%, +16%, ...)
// For crit specifically, values are additive percentage points applied as fractions.
// Card entry shape:
//   id, name, tier ('standard'|'prime'|'apex'), icon, desc
//   EITHER: stat: string, values: [5 nums]  (single-bucket card)
//   OR:     buckets: { statKey: [5 nums], otherKey: [...] }  (multi-bucket)
//   OR:     special: 'stormThread' | 'bulwarkVeil' | 'predatorLoop' | 'timeLock' | 'lastStand'
//           for apex cards with custom mechanics. They still carry a
//           values[5] field for the primary tuning knob.
const CARD_POOL = {
  // ========== STANDARD (12) ==========
  heavyCaliber: {
    id: 'heavyCaliber', name: 'Heavy Caliber', tier: 'standard', icon: '💥',
    desc: 'Damage bucket bonus', stat: 'damage',
    values: [0.08, 0.16, 0.24, 0.32, 0.40]
  },
  overclock: {
    id: 'overclock', name: 'Overclock', tier: 'standard', icon: '⏫',
    desc: 'Attack speed bucket bonus', stat: 'attackSpeed',
    values: [0.06, 0.12, 0.18, 0.24, 0.30]
  },
  fortressPlating: {
    id: 'fortressPlating', name: 'Fortress Plating', tier: 'standard', icon: '🛡️',
    desc: 'Max HP bucket bonus', stat: 'health',
    values: [0.10, 0.20, 0.30, 0.40, 0.50]
  },
  sightline: {
    id: 'sightline', name: 'Sightline', tier: 'standard', icon: '◎',
    desc: 'Range bucket bonus', stat: 'range',
    values: [0.10, 0.20, 0.30, 0.40, 0.50]
  },
  hardShell: {
    id: 'hardShell', name: 'Hard Shell', tier: 'standard', icon: '🔰',
    desc: 'Defense bucket bonus (percentage points)', stat: 'defense',
    values: [0.01, 0.02, 0.03, 0.04, 0.05]
  },
  bloodTap: {
    id: 'bloodTap', name: 'Blood Tap', tier: 'standard', icon: '🩸',
    desc: 'Lifesteal bucket bonus', stat: 'lifesteal',
    values: [0.05, 0.10, 0.15, 0.20, 0.25]
  },
  rapidRepair: {
    id: 'rapidRepair', name: 'Rapid Repair', tier: 'standard', icon: '✚',
    desc: 'Regen bucket bonus (% max HP/sec)', stat: 'regen',
    values: [0.002, 0.004, 0.006, 0.008, 0.010]
  },
  sharpEye: {
    id: 'sharpEye', name: 'Sharp Eye', tier: 'standard', icon: '🎯',
    desc: 'Crit chance bucket bonus', stat: 'crit',
    values: [0.02, 0.04, 0.06, 0.08, 0.10]
  },
  finisherCore: {
    id: 'finisherCore', name: 'Finisher Core', tier: 'standard', icon: '✸',
    desc: 'Crit power bucket bonus', stat: 'critPower',
    values: [0.10, 0.20, 0.30, 0.40, 0.50]
  },
  cashValve: {
    id: 'cashValve', name: 'Cash Valve', tier: 'standard', icon: '💰',
    desc: 'Cash per kill bucket bonus', stat: 'cash',
    values: [0.10, 0.20, 0.30, 0.40, 0.50]
  },
  vaultSeal: {
    id: 'vaultSeal', name: 'Vault Seal', tier: 'standard', icon: '🏦',
    desc: 'End-run scrap bucket bonus', stat: 'coinGain',
    values: [0.08, 0.16, 0.24, 0.32, 0.40]
  },
  chargeFeed: {
    id: 'chargeFeed', name: 'Charge Feed', tier: 'standard', icon: '≋',
    desc: 'Wave bonus cash bucket bonus', stat: 'waveBonus',
    values: [0.10, 0.20, 0.30, 0.40, 0.50]
  },

  // ========== PRIME (8) ==========
  splitChamber: {
    id: 'splitChamber', name: 'Split Chamber', tier: 'prime', icon: '⌘',
    desc: 'Multishot chance bucket bonus', stat: 'multiChance',
    values: [0.05, 0.10, 0.15, 0.20, 0.25]
  },
  twinPayload: {
    id: 'twinPayload', name: 'Twin Payload', tier: 'prime', icon: '✚✚',
    desc: 'Multishot power bucket bonus', stat: 'multiPower',
    values: [0.12, 0.24, 0.36, 0.48, 0.60]
  },
  crossfireBus: {
    id: 'crossfireBus', name: 'Crossfire Bus', tier: 'prime', icon: '⫶',
    desc: 'Multishot extra targets', stat: 'multiTargetsAdd',
    values: [0, 0, 1, 1, 2]
  },
  ricochetSeed: {
    id: 'ricochetSeed', name: 'Ricochet Seed', tier: 'prime', icon: '⤢',
    desc: 'Bounce chance bucket bonus', stat: 'bounceChance',
    values: [0.05, 0.10, 0.15, 0.20, 0.25]
  },
  reboundCore: {
    id: 'reboundCore', name: 'Rebound Core', tier: 'prime', icon: '⤨',
    desc: 'Bounce power bucket bonus', stat: 'bouncePower',
    values: [0.12, 0.24, 0.36, 0.48, 0.60]
  },
  mirrorPath: {
    id: 'mirrorPath', name: 'Mirror Path', tier: 'prime', icon: '⋰⋱',
    desc: 'Bounce extra targets', stat: 'bounceTargetsAdd',
    values: [0, 0, 1, 1, 2]
  },
  bossBreaker: {
    id: 'bossBreaker', name: 'Boss Breaker', tier: 'prime', icon: '♛',
    desc: 'Boss damage AND bounty',
    buckets: {
      bossDmg:    [0.15, 0.30, 0.45, 0.60, 0.75],
      bossBounty: [0.10, 0.20, 0.30, 0.40, 0.50]
    }
  },
  comboBank: {
    id: 'comboBank', name: 'Combo Bank', tier: 'prime', icon: '⚡',
    desc: 'Combo max + decay delay',
    buckets: {
      comboMax:   [0.10, 0.20, 0.30, 0.40, 0.50],
      comboDecay: [500,  1000, 1500, 2000, 2500]  // ms added to decay window
    }
  },

  // ========== APEX (5) ==========
  stormThread: {
    id: 'stormThread', name: 'Storm Thread', tier: 'apex', icon: '⚡',
    desc: 'Every Nth shot arcs to 2 nearby enemies',
    special: 'stormThread',
    // levels 1-5: [interval, arcDamagePct]
    values: [
      { interval: 12, dmg: 0.40 },
      { interval: 11, dmg: 0.50 },
      { interval: 10, dmg: 0.60 },
      { interval: 9,  dmg: 0.70 },
      { interval: 8,  dmg: 0.80 }
    ]
  },
  bulwarkVeil: {
    id: 'bulwarkVeil', name: 'Bulwark Veil', tier: 'apex', icon: '⛨',
    desc: 'Overheal becomes temporary shield (caps % max HP)',
    special: 'bulwarkVeil',
    values: [0.10, 0.15, 0.20, 0.25, 0.30]
  },
  predatorLoop: {
    id: 'predatorLoop', name: 'Predator Loop', tier: 'apex', icon: '👁',
    desc: 'Each boss kill grants run bonus to damage + attack speed',
    special: 'predatorLoop',
    values: [
      { dmg: 0.04, aps: 0.02 },
      { dmg: 0.05, aps: 0.03 },
      { dmg: 0.06, aps: 0.04 },
      { dmg: 0.07, aps: 0.05 },
      { dmg: 0.08, aps: 0.06 }
    ]
  },
  timeLock: {
    id: 'timeLock', name: 'Time Lock', tier: 'apex', icon: '❄',
    desc: 'Every X sec, slows all enemies for 2 sec',
    special: 'timeLock',
    // levels 1-5: [intervalMs, slowFrac]
    values: [
      { interval: 20000, slow: 0.30 },
      { interval: 18000, slow: 0.35 },
      { interval: 16000, slow: 0.40 },
      { interval: 14000, slow: 0.45 },
      { interval: 12000, slow: 0.50 }
    ]
  },
  lastStand: {
    id: 'lastStand', name: 'Last Stand', tier: 'apex', icon: '☠',
    desc: 'Once per run, fatal damage is blocked and grants shield',
    special: 'lastStand',
    values: [0.20, 0.35, 0.50, 0.70, 1.00]
  }
};

const CARD_TIER_COLORS = {
  standard: { bg: 'rgba(110,130,160,0.18)', border: 'var(--accent-dim)', name: 'STANDARD', nameColor: 'var(--accent)' },
  prime:    { bg: 'rgba(170,68,255,0.18)',  border: 'var(--purple)',     name: 'PRIME',    nameColor: 'var(--purple)' },
  apex:     { bg: 'rgba(255,204,0,0.20)',   border: 'var(--gold)',       name: 'APEX',     nameColor: 'var(--gold)' }
};

// Card economy: pack prices and pull odds
const CARD_PRICING = {
  pullSingle: 20,    // gems per random pull
  pullBundle: 180,   // 10-pull bundle (saves 20 gems)
  unlockStandard: 60,
  unlockPrime: 180,
  // Apex direct unlocks are NOT sold — shard/pity only (v0.8+)
};

// Daily login reward calendar — 5-day cycle, escalating rewards
const DAILY_LOGIN_REWARDS = [
  { day: 1, coins: 200,  gems: 0,  label: '200 Scrap' },
  { day: 2, coins: 300,  gems: 2,  label: '300 Scrap + 2💎' },
  { day: 3, coins: 500,  gems: 0,  label: '500 Scrap' },
  { day: 4, coins: 400,  gems: 5,  label: '400 Scrap + 5💎' },
  { day: 5, coins: 1000, gems: 15, label: '1K Scrap + 15💎' }
];

const STORE_PRODUCT_CATALOG = [
  {
    id: 'starter_pack',
    title: 'Starter Pack',
    priceLabel: '$4.99',
    badge: 'BEST VALUE',
    description: 'One-time offer: gems, scrap, and a guaranteed Prime card.',
    rewards: { gems: 500, coins: 5000, unlockCards: ['heavyCaliber'] },
    revenueCatEntitlement: 'starter_pack',
    revenueCatPackage: '$rc_lifetime',
    appleProductId: 'com.mcrdminted.coresurge.starterpack',
    googleProductId: 'com.mcrdminted.coresurge.starterpack'
  },
  {
    id: 'gem_pack_small',
    title: 'Gem Pack Small',
    priceLabel: '$0.99',
    badge: 'GEMS',
    description: 'Quick refill for pulls, skins, and slot unlocks.',
    rewards: { gems: 80 },
    revenueCatEntitlement: 'gems_small',
    revenueCatPackage: 'gems_small',
    appleProductId: 'com.mcrdminted.coresurge.gems.small',
    googleProductId: 'com.mcrdminted.coresurge.gems.small'
  },
  {
    id: 'gem_pack_medium',
    title: 'Gem Pack Medium',
    priceLabel: '$4.99',
    badge: 'POPULAR',
    description: 'Core gem pack for active players pushing progression.',
    rewards: { gems: 500 },
    revenueCatEntitlement: 'gems_medium',
    revenueCatPackage: 'gems_medium',
    appleProductId: 'com.mcrdminted.coresurge.gems.medium',
    googleProductId: 'com.mcrdminted.coresurge.gems.medium'
  },
  {
    id: 'gem_pack_large',
    title: 'Gem Pack Large',
    priceLabel: '$9.99',
    badge: 'BEST RATIO',
    description: 'Whale-tier gem pack with 20% bonus over medium.',
    rewards: { gems: 1200 },
    revenueCatEntitlement: 'gems_large',
    revenueCatPackage: 'gems_large',
    appleProductId: 'com.mcrdminted.coresurge.gems.large',
    googleProductId: 'com.mcrdminted.coresurge.gems.large'
  },
  {
    id: 'monthly_vault',
    title: 'Monthly Vault',
    priceLabel: '$2.99/mo',
    badge: 'SUB',
    description: 'Daily gems (50/day) + exclusive skin access. Best long-term value.',
    rewards: { gems: 50, monthlyPass: true },
    revenueCatEntitlement: 'monthly_vault',
    revenueCatPackage: '$rc_monthly',
    appleProductId: 'com.mcrdminted.coresurge.monthlyvault',
    googleProductId: 'com.mcrdminted.coresurge.monthlyvault'
  }
];

// Pull odds. Apex is rare.
const PULL_ODDS = {
  standard: 0.78,
  prime:    0.20,
  apex:     0.02
};

// Copies needed per card per level (cumulative total includes unlock)
// Standard:  unlock=1, +1,+2,+3,+5 → max=12 copies
// Prime:     unlock=1, +1,+2,+4,+6 → max=14 copies
// Apex:      unlock=1, +1,+2,+4,+8 → max=16 copies
const COPIES_TO_LEVEL = {
  standard: [1, 2, 4, 7, 12],   // copies needed to REACH L1..L5
  prime:    [1, 2, 4, 8, 14],
  apex:     [1, 2, 4, 8, 16]
};

// Slot ladder: starts with 3 free, max 10 at launch (12 future)
const SLOT_UNLOCK_COSTS = {
  4: 100, 5: 200, 6: 350, 7: 550, 8: 800, 9: 1100, 10: 1500
  // 11: 2000, 12: 2600  // future extension
};
const MAX_SLOTS = 10;
const STARTING_SLOTS = 3;

function getUnlockedSlots() {
  return save.unlockedSlots || STARTING_SLOTS;
}

// Next slot unlock cost (in gems), or null if maxed
function getNextSlotCost() {
  const cur = getUnlockedSlots();
  if (cur >= MAX_SLOTS) return null;
  return SLOT_UNLOCK_COSTS[cur + 1];
}

// Spend gems to unlock next slot. Returns true on success.
function unlockNextSlot() {
  const cost = getNextSlotCost();
  if (cost === null) return false;
  if (save.gems < cost) return false;
  save.gems -= cost;
  save.unlockedSlots = getUnlockedSlots() + 1;
  // Extend equippedCards array if needed (keep nulls)
  while (save.equippedCards.length < save.unlockedSlots) {
    save.equippedCards.push(null);
  }
  persistSave();
  return true;
}

// Get copies owned for a given card (for leveling from duplicates).
function getCardCopies(cardId) {
  const inv = save.cardInventory[cardId];
  return inv ? (inv.copies || 1) : 0;
}

// Grant a card: adds a copy, auto-levels if thresholds met.
function grantCard(cardId) {
  const card = CARD_POOL[cardId];
  if (!card) return null;
  if (!save.cardInventory[cardId]) {
    save.cardInventory[cardId] = { level: 1, copies: 1 };
    return { cardId, newlyUnlocked: true, level: 1 };
  }
  const inv = save.cardInventory[cardId];
  inv.copies = (inv.copies || 1) + 1;
  // Check if we can level up
  const thresholds = COPIES_TO_LEVEL[card.tier];
  let leveledUp = false;
  while (inv.level < 5 && inv.copies >= thresholds[inv.level]) {
    inv.level++;
    leveledUp = true;
  }
  return { cardId, newlyUnlocked: false, level: inv.level, leveledUp };
}

// ============================================================
// CARD PULL GATING — cards only pullable if their research family is owned.
// Maps card stat keys → UNLOCK_FAMILIES id.  Starter stats = null (always pullable).
// ============================================================
const CARD_STAT_TO_FAMILY = {
  // Starter stats — always pullable
  damage: null, attackSpeed: null, health: null, range: null,
  defense: null, cash: null,
  // Gated stats
  crit: 'critSystems', critPower: 'critSystems',
  lifesteal: 'sustainSystems', regen: 'sustainSystems',
  waveBonus: 'economyExpansion', bossBounty: 'economyExpansion', bossDmg: 'economyExpansion',
  coinGain: 'coinMastery',
  multiChance: 'multishotSystems', multiPower: 'multishotSystems', multiTargetsAdd: 'multishotSystems',
  bounceChance: 'bounceSystems', bouncePower: 'bounceSystems', bounceTargetsAdd: 'bounceSystems',
  comboMax: 'comboSystems', comboDecay: 'comboSystems',
  thorns: 'fortification', knockback: 'fortification',
  shieldHP: 'barrierSystems', shieldRegen: 'barrierSystems',
  projSpeed: 'tacticalSystems', pierce: 'tacticalSystems',
  overchargeChance: 'overcharge', overchargePower: 'overcharge'
};

// Apex special → required family (null = always pullable)
const APEX_SPECIAL_FAMILY = {
  stormThread: null,          // generic damage proc
  bulwarkVeil: 'barrierSystems',
  predatorLoop: null,         // generic combat
  timeLock: null,             // generic utility
  lastStand: null             // generic defense
};

// Check if a specific card is pullable based on research unlocks
function isCardPullable(cardId) {
  const card = CARD_POOL[cardId];
  if (!card) return false;
  // Dev mode: everything pullable
  if (save.settings && save.settings.devMode) return true;
  // Single-stat card
  if (card.stat) {
    const fam = CARD_STAT_TO_FAMILY[card.stat];
    if (fam && !familyIsOwned(fam)) return false;
    return true;
  }
  // Multi-bucket card — all buckets must have their family unlocked
  if (card.buckets) {
    for (const bk of Object.keys(card.buckets)) {
      const fam = CARD_STAT_TO_FAMILY[bk];
      if (fam && !familyIsOwned(fam)) return false;
    }
    return true;
  }
  // Apex special card
  if (card.special) {
    const fam = APEX_SPECIAL_FAMILY[card.special];
    if (fam && !familyIsOwned(fam)) return false;
    return true;
  }
  return true; // fallback: pullable
}

// Count how many cards are currently pullable
function countPullableCards() {
  return Object.keys(CARD_POOL).filter(isCardPullable).length;
}

// Roll a random card from the pullable pool based on PULL_ODDS.
function rollRandomCard() {
  const r = Math.random();
  let tier;
  if (r < PULL_ODDS.apex) tier = 'apex';
  else if (r < PULL_ODDS.apex + PULL_ODDS.prime) tier = 'prime';
  else tier = 'standard';
  // Filter by tier AND pullability
  let pool = Object.values(CARD_POOL).filter(c => c.tier === tier && isCardPullable(c.id));
  // If no pullable cards in this tier, fall back to any pullable card
  if (pool.length === 0) pool = Object.values(CARD_POOL).filter(c => isCardPullable(c.id));
  // Ultimate fallback: starter cards only (should never happen)
  if (pool.length === 0) pool = Object.values(CARD_POOL).filter(c => c.tier === 'standard');
  return pool[Math.floor(Math.random() * pool.length)];
}

// Perform a single 20-gem pull. Returns result object or null on failure.
function performPull() {
  if (save.gems < CARD_PRICING.pullSingle) return null;
  save.gems -= CARD_PRICING.pullSingle;
  const card = rollRandomCard();
  const result = grantCard(card.id);
  persistSave();
  return { card, ...result };
}

// Perform a 10-pull bundle for 180 gems.
function performBundle() {
  if (save.gems < CARD_PRICING.pullBundle) return null;
  save.gems -= CARD_PRICING.pullBundle;
  const results = [];
  for (let i = 0; i < 10; i++) {
    const card = rollRandomCard();
    const r = grantCard(card.id);
    results.push({ card, ...r });
  }
  persistSave();
  return results;
}

// ============================================================
// HERO PULL SYSTEM — heroes obtained through RNG pulls, not auto-unlock.
// Meeting unlock conditions adds hero to the pull pool, NOT to inventory.
// ============================================================
const HERO_PULL_PRICING = {
  pullSingle: 50,    // gems per single hero pull
  pullBundle: 225    // 5-pull bundle (save 25 gems)
};

// Get the pool of heroes that are pullable (conditions met + family owned + not yet owned)
function getHeroPullPool() {
  const unlocked = save.heroesUnlocked || [];
  const devMode = save.settings && save.settings.devMode;
  const pool = [];
  for (const hid of Object.keys(HERO_DEFS)) {
    // Skip already owned heroes
    if (unlocked.indexOf(hid) !== -1) continue;
    const def = HERO_DEFS[hid];
    if (devMode) {
      pool.push(hid);
      continue;
    }
    // Must own the family if one is required
    if (def.family && !familyIsOwned(def.family)) continue;
    // Must meet unlock condition (tier, kills, etc.)
    if (!isHeroUnlockMet(def.unlock)) continue;
    pool.push(hid);
  }
  return pool;
}

// Perform a single hero pull. Returns { hero: HERO_DEFS entry, heroId } or null.
function performHeroPull() {
  if (save.gems < HERO_PULL_PRICING.pullSingle) return null;
  const pool = getHeroPullPool();
  if (pool.length === 0) return null;
  save.gems -= HERO_PULL_PRICING.pullSingle;
  const heroId = pool[Math.floor(Math.random() * pool.length)];
  unlockHero(heroId);
  persistSave();
  return { hero: HERO_DEFS[heroId], heroId, newlyUnlocked: true };
}

// Perform a 5-pull hero bundle. Returns array of results or null.
function performHeroBundle() {
  if (save.gems < HERO_PULL_PRICING.pullBundle) return null;
  const pool = getHeroPullPool();
  if (pool.length === 0) return null;
  save.gems -= HERO_PULL_PRICING.pullBundle;
  const results = [];
  // Pull up to 5, but stop if pool runs out
  for (let i = 0; i < 5; i++) {
    const currentPool = getHeroPullPool();
    if (currentPool.length === 0) break;
    const heroId = currentPool[Math.floor(Math.random() * currentPool.length)];
    unlockHero(heroId);
    results.push({ hero: HERO_DEFS[heroId], heroId, newlyUnlocked: true });
  }
  persistSave();
  return results.length > 0 ? results : null;
}

// Card bucket accumulator. Returns fraction to ADD to (1 + runBonus) * labMul calculation.
// Example: if you have 2 damage cards at +40% and +20%, cardBucket returns 0.60.
// Supports both single-stat ('stat' + 'values') and multi-stat ('buckets') cards.
// Apex specials are handled by other helpers (getStormThread, getTimeLock, etc).
function getCardBucket(statKey) {
  if (!save.equippedCards) return 0;
  let bucket = 0;
  for (const cardId of save.equippedCards) {
    if (!cardId) continue;
    const card = CARD_POOL[cardId];
    if (!card) continue;
    const inv = save.cardInventory[cardId];
    if (!inv) continue;
    const lvl = Math.max(1, Math.min(5, inv.level || 1));
    if (card.stat && card.stat === statKey) {
      const v = card.values[lvl - 1];
      // value can be a number (standard card) — ignore object entries here
      if (typeof v === 'number') bucket += v;
    } else if (card.buckets && card.buckets[statKey]) {
      bucket += card.buckets[statKey][lvl - 1] || 0;
    }
  }
  return bucket;
}

// Return the special card's level (1-5) if equipped, else 0
function getEquippedSpecialLevel(specialKey) {
  if (!save.equippedCards) return 0;
  for (const cardId of save.equippedCards) {
    if (!cardId) continue;
    const card = CARD_POOL[cardId];
    if (!card || card.special !== specialKey) continue;
    const inv = save.cardInventory[cardId];
    if (!inv) continue;
    return Math.max(1, Math.min(5, inv.level || 1));
  }
  return 0;
}

// Apex helper getters — return the current-level data object or null.
function getStormThreadData() {
  const lvl = getEquippedSpecialLevel('stormThread');
  return lvl ? CARD_POOL.stormThread.values[lvl - 1] : null;
}
function getBulwarkShieldCap() {
  const lvl = getEquippedSpecialLevel('bulwarkVeil');
  return lvl ? CARD_POOL.bulwarkVeil.values[lvl - 1] : 0;
}
function getPredatorLoopPerBoss() {
  const lvl = getEquippedSpecialLevel('predatorLoop');
  return lvl ? CARD_POOL.predatorLoop.values[lvl - 1] : null;
}
function getTimeLockData() {
  const lvl = getEquippedSpecialLevel('timeLock');
  return lvl ? CARD_POOL.timeLock.values[lvl - 1] : null;
}
function getLastStandShieldFrac() {
  const lvl = getEquippedSpecialLevel('lastStand');
  return lvl ? CARD_POOL.lastStand.values[lvl - 1] : 0;
}
const TAGLINES = [
  'one more wave',
  'the core holds',
  'progression, not punishment',
  'no popups. ever.',
  'your core, your pace',
  'every shot counts',
  'defend the core'
];


// ============================================================
// TOURNAMENT DATA — constants, bands, leagues, reward tables
// ============================================================

// Progression bands by highest tier unlocked (save.bestTier)
// 20 bands of 5 tiers each covering T1-100
const TOURNEY_BANDS = (function() {
  var bands = [];
  for (var i = 0; i < 20; i++) {
    bands.push({ id: i + 1, name: 'Band ' + (i + 1), minTier: i * 5 + 1, maxTier: (i + 1) * 5 });
  }
  return bands;
})();

const TOURNEY_LEAGUES = ['copper', 'bronze', 'silver', 'gold', 'platinum'];
const TOURNEY_LEAGUE_DISPLAY = {
  copper:   { name: 'Copper',   color: '#b87333', icon: '🛡', tier: 1 },
  bronze:   { name: 'Bronze',   color: '#cd7f32', icon: '⚔',  tier: 2 },
  silver:   { name: 'Silver',   color: '#c0c0c0', icon: '🗡', tier: 3 },
  gold:     { name: 'Gold',     color: '#ffcc00', icon: '👑', tier: 4 },
  platinum: { name: 'Platinum', color: '#e5e4e2', icon: '💎', tier: 5 }
};

// Base reward table [band_id][league] = { coins, gems }
// Generated for 20 bands — rewards scale ~1.35x per band, league multiplier on top
const TOURNEY_REWARDS_BASE = (function() {
  var table = {};
  var baseCoinPerBand = 150;   // band 1 copper coins
  var baseGemPerBand  = 5;     // band 1 copper gems
  var leagueMul = { copper: 1.0, bronze: 1.2, silver: 1.45, gold: 1.8, platinum: 2.2 };
  var leagues = ['copper', 'bronze', 'silver', 'gold', 'platinum'];
  for (var b = 1; b <= 20; b++) {
    table[b] = {};
    var coinBase = Math.round(baseCoinPerBand * Math.pow(1.35, b - 1));
    var gemBase  = Math.round(baseGemPerBand  * Math.pow(1.25, b - 1));
    for (var l = 0; l < leagues.length; l++) {
      table[b][leagues[l]] = {
        coins: Math.round(coinBase * leagueMul[leagues[l]]),
        gems:  Math.round(gemBase  * leagueMul[leagues[l]])
      };
    }
  }
  return table;
})();

// Placement multipliers — based on final rank in 250-player bracket
const TOURNEY_PLACEMENT_MULTS = [
  { minRank: 1,   maxRank: 1,   mul: 3.0 },
  { minRank: 2,   maxRank: 3,   mul: 2.3 },
  { minRank: 4,   maxRank: 10,  mul: 1.8 },
  { minRank: 11,  maxRank: 25,  mul: 1.4 },
  { minRank: 26,  maxRank: 50,  mul: 1.15 },
  { minRank: 51,  maxRank: 100, mul: 1.0 },
  { minRank: 101, maxRank: 150, mul: 0.8 },
  { minRank: 151, maxRank: 212, mul: 0.65 },
  { minRank: 213, maxRank: 250, mul: 0.5 }
];

const TOURNEY_BRACKET_SIZE = 250;
const TOURNEY_CYCLE_MS = 72 * 60 * 60 * 1000;  // 72 hours
const TOURNEY_PROMOTE_PCT = 0.10;  // top 10% promote
const TOURNEY_DEMOTE_PCT  = 0.15;  // bottom 15% demote
const TOURNEY_STANDARD_ENTRIES = 3; // 1 free + 2 extra

// Name pool for synthetic competitors. Mix of short sci-fi handles.
const TOURNEY_SYNTHETIC_NAMES = [
  'Raze', 'Hexon', 'Vanta', 'ArcLight', 'Nox', 'Silo', 'DeltaRay', 'GrimVale',
  'IonRush', 'Kryo', 'Pulse', 'Vex', 'Obsidian', 'Hazard', 'Cinder', 'Glacier',
  'Volt', 'Ember', 'Shard', 'Relay', 'Echo', 'Drift', 'Flux', 'Solar',
  'Vector', 'Orbit', 'Spire', 'Fathom', 'Zenith', 'Nexus', 'Void', 'Crux',
  'Axiom', 'Prism', 'Cipher', 'Quill', 'Boreal', 'Tundra', 'Mirage', 'Lumen',
  'Wraith', 'Helix', 'Onyx', 'Crimson', 'Verge', 'Omen', 'Rift', 'Halcyon',
  'Talon', 'Tempest', 'Kestrel', 'Shrike', 'Basilisk', 'Hydra', 'Phoenix',
  'Sable', 'Quartz', 'Coda', 'Meridian', 'Cascade', 'Paragon', 'Ronin',
  'Blight', 'Scion', 'Sentinel', 'Thorn', 'Wick', 'Halo', 'Ridge', 'Fable'
];

// Helpers — pure functions, no side effects

function tourneyBandForTier(bestTier) {
  const t = Math.max(1, bestTier || 1);
  for (const b of TOURNEY_BANDS) {
    if (t >= b.minTier && t <= b.maxTier) return b;
  }
  return TOURNEY_BANDS[TOURNEY_BANDS.length - 1];
}

function tourneyPlacementMul(rank) {
  for (const p of TOURNEY_PLACEMENT_MULTS) {
    if (rank >= p.minRank && rank <= p.maxRank) return p.mul;
  }
  return 0.5;
}

function tourneyRewardForPlacement(bandId, league, rank) {
  const base = (TOURNEY_REWARDS_BASE[bandId] || TOURNEY_REWARDS_BASE[1])[league]
               || { coins: 0, gems: 0 };
  const mul = tourneyPlacementMul(rank);
  return {
    coins: Math.round(base.coins * mul),
    gems:  Math.round(base.gems  * mul)
  };
}

// Expected wave score band per progression band × league.
// Used to generate synthetic competitor scores.
// [minWave, maxWave] — avg player ceiling for that band/league
function tourneyExpectedWaveRange(bandId, league) {
  // Formula: base wave grows ~1.28x per band (18 → ~19,000 at band 20)
  var baseWave = Math.round(18 * Math.pow(1.28, bandId - 1));
  var leagueMul = { copper: 0.55, bronze: 0.75, silver: 1.00, gold: 1.30, platinum: 1.70 };
  var mul = leagueMul[league] || 1;
  var center = baseWave * mul;
  return [Math.floor(center * 0.65), Math.floor(center * 1.35)];
}

// ============================================================
// UNLOCK FAMILIES + PERMANENT RANKS (v0.7.15)
// ============================================================
// New permanent progression model:
//   - Unlock families reveal groups of stats (one-time coin purchase)
//   - Ranks are permanent coin-bought levels per stat (flat per-rank bonus)
//   - In-run upgrades are separate and reset each run
//
// Starter set (always unlocked, always visible):
//   damage, fireRate, coreHealth, armor, range, cashBonus
//
// Everything else requires buying the parent unlock family first.

const UNLOCK_FAMILIES = {
  // v0.7.28: costs scaled for 3hrs/day, 365-day F2P target (6x base).
  // Total unlock cost: 10,650,000
  critSystems: {
    id: 'critSystems', name: 'Crit Systems', icon: '🎯',
    cost: 30000,
    unlocks: ['critChance', 'critPower'],
    order: 1
  },
  economyExpansion: {
    id: 'economyExpansion', name: 'Economy Expansion', icon: '💰',
    cost: 90000,
    unlocks: ['waveBonus', 'bossBounty'],
    order: 2
  },
  sustainSystems: {
    id: 'sustainSystems', name: 'Sustain Systems', icon: '💚',
    cost: 180000,
    unlocks: ['regen', 'lifesteal'],
    order: 3
  },
  fortification: {
    id: 'fortification', name: 'Fortification', icon: '🔰',
    cost: 300000,
    unlocks: ['thorns', 'knockback'],
    order: 4
  },
  coinMastery: {
    id: 'coinMastery', name: 'Scrap Mastery', icon: '🔩',
    cost: 450000,
    unlocks: ['coinMultiplier', 'gemFind'],
    order: 5
  },
  multishotSystems: {
    id: 'multishotSystems', name: 'Multishot Systems', icon: '🔱',
    cost: 600000,
    unlocks: ['multiChance', 'multiPower', 'multiTargets'],
    order: 6
  },
  barrierSystems: {
    id: 'barrierSystems', name: 'Barrier Systems', icon: '🛡',
    cost: 900000,
    unlocks: ['shieldHP', 'shieldRegen'],
    order: 7
  },
  tacticalSystems: {
    id: 'tacticalSystems', name: 'Tactical Systems', icon: '🎯',
    cost: 1200000,
    unlocks: ['projSpeed', 'pierce'],
    order: 8
  },
  bounceSystems: {
    id: 'bounceSystems', name: 'Bounce Systems', icon: '⚡',
    cost: 1650000,
    unlocks: ['bounceChance', 'bouncePower', 'bounceTargets'],
    order: 9
  },
  overcharge: {
    id: 'overcharge', name: 'Overcharge', icon: '⚡',
    cost: 2250000,
    unlocks: ['overchargeChance', 'overchargePower'],
    order: 10
  },
  comboSystems: {
    id: 'comboSystems', name: 'Combo Systems', icon: '🔥',
    cost: 3000000,
    unlocks: ['comboBonus', 'comboDuration'],
    order: 11
  }
};

// Rank definitions. Each rank gives +flatPerRank to base value (additive).
// Stats with `startsUnlocked: true` are always purchasable from game start.
// Others require buying their parent unlock family first.
// maxRank caps total from the spec (sum = 1019).
// cost0 = first rank cost, costMul = geometric cost growth per rank.
// Cost curves tuned so early ranks are cheap, late ranks brutal.
const RANK_DEFS = {
  // === STARTER (always unlocked) ===
  // v0.7.28: Deep rebalance for 1-year F2P target (3 hrs/day, 365 days).
  // costMul bumped +0.147 across board for 25 runs/day economy.
  // Total rank cost ~78M, unlock cost ~10.65M, grand total ~88M scrap.
  // 50% at Day 26, 75% at Day 98, 100% at Day 367 (25 runs/day).
  damage: {
    id: 'damage', name: 'Damage', family: null, startsUnlocked: true,
    base: 5, flatPerRank: 3, maxRank: 99999,
    cost0: 15, costMul: 1.427,
    desc: '+3 damage per rank'
  },
  fireRate: {
    id: 'fireRate', name: 'Fire Rate', family: null, startsUnlocked: true,
    base: 1.0, flatPerRank: 0.04, maxRank: 99999,
    cost0: 20, costMul: 1.427,
    desc: '+0.04 shots/sec per rank'
  },
  coreHealth: {
    id: 'coreHealth', name: 'Core Integrity', family: null, startsUnlocked: true,
    base: 100, flatPerRank: 15, maxRank: 99999,
    cost0: 12, costMul: 1.397,
    desc: '+15 max HP per rank'
  },
  armor: {
    id: 'armor', name: 'Armor', family: null, startsUnlocked: true,
    base: 0, flatPerRank: 0.004, maxRank: 99999,
    cost0: 25, costMul: 1.447,
    desc: '+0.4% damage reduction per rank (cap 75%)'
  },
  range: {
    id: 'range', name: 'Range', family: null, startsUnlocked: true,
    base: 0, flatPerRank: 1.2, maxRank: 500,
    cost0: 5, costMul: 1.015,
    desc: '+1.2 range per rank (500 ranks = full screen)'
  },
  cashBonus: {
    id: 'cashBonus', name: 'Cash Bonus', family: null, startsUnlocked: true,
    base: 0, flatPerRank: 0.02, maxRank: 99999,
    cost0: 25, costMul: 1.427,
    desc: '+2% cash per kill per rank'
  },

  // === CRIT SYSTEMS ===
  critChance: {
    id: 'critChance', name: 'Crit Chance', family: 'critSystems', startsUnlocked: false,
    base: 0, flatPerRank: 0.005, maxRank: 99999,
    cost0: 50, costMul: 1.427,
    desc: '+0.5% crit chance per rank'
  },
  critPower: {
    id: 'critPower', name: 'Crit Power', family: 'critSystems', startsUnlocked: false,
    base: 2.0, flatPerRank: 0.02, maxRank: 99999,
    cost0: 60, costMul: 1.427,
    desc: '+0.02× crit multiplier per rank'
  },

  // === ECONOMY EXPANSION ===
  waveBonus: {
    id: 'waveBonus', name: 'Wave Bonus', family: 'economyExpansion', startsUnlocked: false,
    base: 0, flatPerRank: 0.05, maxRank: 99999,
    cost0: 55, costMul: 1.427,
    desc: '+5% end-of-wave cash per rank'
  },
  bossBounty: {
    id: 'bossBounty', name: 'Boss Bounty', family: 'economyExpansion', startsUnlocked: false,
    base: 0, flatPerRank: 0.05, maxRank: 99999,
    cost0: 60, costMul: 1.427,
    desc: '+5% boss kill reward per rank'
  },

  // === SUSTAIN SYSTEMS ===
  regen: {
    id: 'regen', name: 'Regen', family: 'sustainSystems', startsUnlocked: false,
    base: 0, flatPerRank: 0.0005, maxRank: 99999,
    cost0: 45, costMul: 1.407,
    desc: '+0.05% max HP/sec regen per rank'
  },
  lifesteal: {
    id: 'lifesteal', name: 'Lifesteal', family: 'sustainSystems', startsUnlocked: false,
    base: 0, flatPerRank: 0.003, maxRank: 99999,
    cost0: 70, costMul: 1.427,
    desc: '+0.3% lifesteal per rank'
  },

  // === MULTISHOT SYSTEMS ===
  multiChance: {
    id: 'multiChance', name: 'Multishot Chance', family: 'multishotSystems', startsUnlocked: false,
    base: 0, flatPerRank: 0.01, maxRank: 99999,
    cost0: 120, costMul: 1.447,
    desc: '+1% multishot chance per rank'
  },
  multiPower: {
    id: 'multiPower', name: 'Multishot Power', family: 'multishotSystems', startsUnlocked: false,
    base: 0, flatPerRank: 0.02, maxRank: 99999,
    cost0: 100, costMul: 1.427,
    desc: '+2% multishot power per rank'
  },
  multiTargets: {
    id: 'multiTargets', name: 'Multishot Targets', family: 'multishotSystems', startsUnlocked: false,
    base: 1, flatPerRank: 1, maxRank: 8,
    cost0: 300, costMul: 1.497,
    desc: '+1 target per rank (max 9 total)'
  },

  // === BOUNCE SYSTEMS ===
  bounceChance: {
    id: 'bounceChance', name: 'Bounce Chance', family: 'bounceSystems', startsUnlocked: false,
    base: 0, flatPerRank: 0.01, maxRank: 99999,
    cost0: 180, costMul: 1.447,
    desc: '+1% bounce chance per rank'
  },
  bouncePower: {
    id: 'bouncePower', name: 'Bounce Power', family: 'bounceSystems', startsUnlocked: false,
    base: 0, flatPerRank: 0.025, maxRank: 99999,
    cost0: 150, costMul: 1.427,
    desc: '+2.5% bounce damage per rank'
  },
  bounceTargets: {
    id: 'bounceTargets', name: 'Bounce Targets', family: 'bounceSystems', startsUnlocked: false,
    base: 0, flatPerRank: 1, maxRank: 6,
    cost0: 500, costMul: 1.497,
    desc: '+1 bounce per rank'
  },

  // === COMBO SYSTEMS ===
  comboBonus: {
    id: 'comboBonus', name: 'Combo Multiplier', family: 'comboSystems', startsUnlocked: false,
    base: 0, flatPerRank: 0.02, maxRank: 99999,
    cost0: 100, costMul: 1.427,
    desc: '+2% combo damage bonus per rank'
  },
  comboDuration: {
    id: 'comboDuration', name: 'Combo Window', family: 'comboSystems', startsUnlocked: false,
    base: 2000, flatPerRank: 200, maxRank: 99999,
    cost0: 120, costMul: 1.447,
    desc: '+200ms combo window per rank'
  },

  // === FORTIFICATION (Defense) ===
  thorns: {
    id: 'thorns', name: 'Thorns', family: 'fortification', startsUnlocked: false,
    base: 0, flatPerRank: 0.005, maxRank: 99999,
    cost0: 55, costMul: 1.427,
    desc: '+0.5% damage reflected per rank'
  },
  knockback: {
    id: 'knockback', name: 'Knockback', family: 'fortification', startsUnlocked: false,
    base: 0, flatPerRank: 0.008, maxRank: 99999,
    cost0: 70, costMul: 1.427,
    desc: '+0.8% knockback chance per rank'
  },

  // === BARRIER SYSTEMS (Defense) ===
  shieldHP: {
    id: 'shieldHP', name: 'Shield Capacity', family: 'barrierSystems', startsUnlocked: false,
    base: 0, flatPerRank: 5, maxRank: 99999,
    cost0: 60, costMul: 1.427,
    desc: '+5 shield HP per rank'
  },
  shieldRegen: {
    id: 'shieldRegen', name: 'Shield Recharge', family: 'barrierSystems', startsUnlocked: false,
    base: 0, flatPerRank: 0.5, maxRank: 99999,
    cost0: 80, costMul: 1.427,
    desc: '+0.5 shield/sec regen per rank'
  },

  // === SCRAP MASTERY (Economy) ===
  coinMultiplier: {
    id: 'coinMultiplier', name: 'Scrap Multiplier', family: 'coinMastery', startsUnlocked: false,
    base: 0, flatPerRank: 0.02, maxRank: 99999,
    cost0: 65, costMul: 1.427,
    desc: '+2% end-run scrap per rank'
  },
  gemFind: {
    id: 'gemFind', name: 'Gem Attractor', family: 'coinMastery', startsUnlocked: false,
    base: 0, flatPerRank: 0.08, maxRank: 99999,
    cost0: 90, costMul: 1.447,
    desc: '+8% faster gem orb spawns per rank'
  },

  // === TACTICAL SYSTEMS (Utility) ===
  projSpeed: {
    id: 'projSpeed', name: 'Projectile Speed', family: 'tacticalSystems', startsUnlocked: false,
    base: 0, flatPerRank: 0.03, maxRank: 99999,
    cost0: 50, costMul: 1.407,
    desc: '+3% projectile speed per rank'
  },
  pierce: {
    id: 'pierce', name: 'Pierce', family: 'tacticalSystems', startsUnlocked: false,
    base: 0, flatPerRank: 0.01, maxRank: 99999,
    cost0: 120, costMul: 1.447,
    desc: '+1% pierce chance per rank'
  },

  // === OVERCHARGE (Utility) ===
  overchargeChance: {
    id: 'overchargeChance', name: 'Overcharge Chance', family: 'overcharge', startsUnlocked: false,
    base: 0, flatPerRank: 0.005, maxRank: 99999,
    cost0: 110, costMul: 1.437,
    desc: '+0.5% overcharge chance per rank'
  },
  overchargePower: {
    id: 'overchargePower', name: 'Overcharge Power', family: 'overcharge', startsUnlocked: false,
    base: 0, flatPerRank: 0.02, maxRank: 99999,
    cost0: 85, costMul: 1.427,
    desc: '+2% overcharge damage per rank'
  }
};

// Most stats are UNCAPPED (maxRank 99999) — infinite scaling.
// Only naturally-capped stats retain hard limits:
//   range: 500 (full screen coverage)
//   multiTargets: 8 (max 9 total targets)
//   bounceTargets: 6 (max 6 bounces)
// Percentage stats (crit chance, bounce chance, etc.) soft-cap at 100% via Math.min in getters.
// Armor hard-caps at 75% reduction via Math.min in getDefenseFraction().

// Rank cost helper: cost to buy the NEXT rank (current level -> level+1)
function rankCost(rankId, currentLevel) {
  const def = RANK_DEFS[rankId];
  if (!def) return Infinity;
  if (currentLevel >= def.maxRank) return Infinity;
  return Math.floor(def.cost0 * Math.pow(def.costMul, currentLevel));
}

// Current flat bonus from a rank (rank.level * flatPerRank)
function rankFlatBonus(rankId) {
  const def = RANK_DEFS[rankId];
  const entry = save.ranks[rankId];
  if (!def || !entry) return 0;
  return entry.level * def.flatPerRank;
}

// Permanent base value for a stat (base + rank bonus, before in-run upgrades)
function rankPermanentValue(rankId) {
  const def = RANK_DEFS[rankId];
  if (!def) return 0;
  return def.base + rankFlatBonus(rankId);
}

// Is a stat currently available to rank (either startsUnlocked or family bought)
function rankIsAvailable(rankId) {
  const def = RANK_DEFS[rankId];
  if (!def) return false;
  if (def.startsUnlocked) return true;
  if (!def.family) return true;
  return !!(save.unlocks && save.unlocks[def.family]);
}

// Is an unlock family currently owned
function familyIsOwned(familyId) {
  return !!(save.unlocks && save.unlocks[familyId]);
}

// Buy an unlock family (returns true on success)
function purchaseUnlockFamily(familyId) {
  const fam = UNLOCK_FAMILIES[familyId];
  if (!fam) return false;
  if (familyIsOwned(familyId)) return false;
  if (save.coins < fam.cost) return false;
  save.coins -= fam.cost;
  save.unlocks[familyId] = true;
  persistSave();
  return true;
}

// Buy one rank (returns true on success)
function purchaseRank(rankId) {
  const def = RANK_DEFS[rankId];
  if (!def) return false;
  if (!rankIsAvailable(rankId)) return false;
  const entry = save.ranks[rankId] || (save.ranks[rankId] = { level: 0 });
  if (entry.level >= def.maxRank) return false;
  const cost = rankCost(rankId, entry.level);
  if (save.coins < cost) return false;
  save.coins -= cost;
  entry.level += 1;
  persistSave();
  return true;
}

// ============================================================
// HERO SYSTEM (v0.8)
// ============================================================
// Each hero boosts one stat with a passive multiplier and has an active burst.
// Categories: 'combat' | 'economy' | 'defense'
// Active profiles by category:
//   combat:  2.0x passive for 10s, 120s cooldown
//   economy: 3.0x passive for 5s, 150s cooldown
//   defense: 2.5x passive for 8s, 90s cooldown

const HERO_CATEGORIES = {
  combat:  { activeMul: 2.0, activeDuration: 10000, activeCooldown: 120000 },
  economy: { activeMul: 3.0, activeDuration: 5000,  activeCooldown: 150000 },
  defense: { activeMul: 2.5, activeDuration: 8000,  activeCooldown: 90000 }
};

// Hero unlock types:
//   { type: 'tier',   value: N }          — reach bestTier >= N
//   { type: 'kills',  value: N }          — totalEnemiesKilled >= N
//   { type: 'bosses', value: N }          — totalBossesDefeated >= N
//   { type: 'runs',   value: N }          — totalRuns >= N
//   { type: 'wave',   value: N }          — bestWave >= N (any single run)
//   { type: 'cash',   value: N }          — totalCashEarned >= N
//   { type: 'gems',   value: N }          — totalGemsEarned >= N
//   { type: 'playtime', value: N }        — totalPlaytimeMs >= N (in ms)
// Family gate (if set) is always checked ON TOP of the unlock condition.

const HERO_DEFS = {
  // === STARTER (6) — no family gate, tier-based for gentle onboarding ===
  ironclad:    { id: 'ironclad',    name: 'Ironclad',    icon: '⚔',  stat: 'damage',       category: 'combat',  family: null, unlock: { type: 'tier', value: 1 },   order: 1 },
  quickfire:   { id: 'quickfire',   name: 'Quickfire',   icon: '⚡',  stat: 'fireRate',     category: 'combat',  family: null, unlock: { type: 'tier', value: 3 },   order: 2 },
  bastion:     { id: 'bastion',     name: 'Bastion',     icon: '🏰',  stat: 'coreHealth',   category: 'defense', family: null, unlock: { type: 'tier', value: 8 },   order: 3 },
  profiteer:   { id: 'profiteer',   name: 'Profiteer',   icon: '💰',  stat: 'cashBonus',    category: 'economy', family: null, unlock: { type: 'tier', value: 12 },  order: 4 },
  sentinel:    { id: 'sentinel',    name: 'Sentinel',    icon: '🛡',  stat: 'armor',        category: 'defense', family: null, unlock: { type: 'tier', value: 20 },  order: 5 },
  hawkeye:     { id: 'hawkeye',     name: 'Hawkeye',     icon: '🦅',  stat: 'range',        category: 'combat',  family: null, unlock: { type: 'tier', value: 30 },  order: 6 },

  // === CRIT SYSTEMS (2) — achievement-based ===
  deadeye:     { id: 'deadeye',     name: 'Deadeye',     icon: '🎯',  stat: 'critChance',   category: 'combat',  family: 'critSystems',      unlock: { type: 'kills', value: 5000 },    order: 7 },
  executioner: { id: 'executioner', name: 'Executioner', icon: '⚰',  stat: 'critPower',    category: 'combat',  family: 'critSystems',      unlock: { type: 'wave', value: 75 },       order: 8 },

  // === ECONOMY EXPANSION (2) — achievement-based ===
  surplus:     { id: 'surplus',     name: 'Surplus',     icon: '📦',  stat: 'waveBonus',    category: 'economy', family: 'economyExpansion',  unlock: { type: 'cash', value: 100000 },   order: 9 },
  headhunter:  { id: 'headhunter',  name: 'Headhunter',  icon: '💀',  stat: 'bossBounty',   category: 'economy', family: 'economyExpansion',  unlock: { type: 'bosses', value: 50 },     order: 10 },

  // === SUSTAIN SYSTEMS (2) — achievement-based ===
  mender:      { id: 'mender',      name: 'Mender',      icon: '💚',  stat: 'regen',        category: 'defense', family: 'sustainSystems',    unlock: { type: 'runs', value: 25 },       order: 11 },
  leech:       { id: 'leech',       name: 'Leech',       icon: '🩸',  stat: 'lifesteal',    category: 'defense', family: 'sustainSystems',    unlock: { type: 'runs', value: 50 },       order: 12 },

  // === FORTIFICATION (2) — achievement-based ===
  thornguard:  { id: 'thornguard',  name: 'Thornguard',  icon: '🌵',  stat: 'thorns',       category: 'defense', family: 'fortification',     unlock: { type: 'kills', value: 25000 },   order: 13 },
  shockwave:   { id: 'shockwave',   name: 'Shockwave',   icon: '💫',  stat: 'knockback',    category: 'defense', family: 'fortification',     unlock: { type: 'wave', value: 100 },      order: 14 },

  // === COIN MASTERY (2) — achievement-based ===
  smelter:     { id: 'smelter',     name: 'Smelter',     icon: '🔥',  stat: 'coinMultiplier', category: 'economy', family: 'coinMastery',     unlock: { type: 'cash', value: 500000 },   order: 15 },
  prospector:  { id: 'prospector',  name: 'Prospector',  icon: '⛏',  stat: 'gemFind',       category: 'economy', family: 'coinMastery',     unlock: { type: 'gems', value: 200 },      order: 16 },

  // === MULTISHOT SYSTEMS (3) — mix: 1 achievement + 2 deep tier ===
  scattergun:  { id: 'scattergun',  name: 'Scattergun',  icon: '🔱',  stat: 'multiChance',  category: 'combat',  family: 'multishotSystems',  unlock: { type: 'runs', value: 100 },      order: 17 },
  payload:     { id: 'payload',     name: 'Payload',     icon: '💣',  stat: 'multiPower',   category: 'combat',  family: 'multishotSystems',  unlock: { type: 'tier', value: 100 },      order: 18 },
  hydra:       { id: 'hydra',       name: 'Hydra',       icon: '🐉',  stat: 'multiTargets', category: 'combat',  family: 'multishotSystems',  unlock: { type: 'tier', value: 250 },      order: 19 },

  // === BARRIER SYSTEMS (2) — mix: 1 achievement + 1 tier ===
  aegis:       { id: 'aegis',       name: 'Aegis',       icon: '🔮',  stat: 'shieldHP',     category: 'defense', family: 'barrierSystems',    unlock: { type: 'kills', value: 100000 },  order: 20 },
  dynamo:      { id: 'dynamo',      name: 'Dynamo',      icon: '⚙',  stat: 'shieldRegen',  category: 'defense', family: 'barrierSystems',    unlock: { type: 'tier', value: 200 },      order: 21 },

  // === TACTICAL SYSTEMS (2) — mix ===
  railgun:     { id: 'railgun',     name: 'Railgun',     icon: '🚀',  stat: 'projSpeed',    category: 'combat',  family: 'tacticalSystems',   unlock: { type: 'wave', value: 150 },      order: 22 },
  piercer:     { id: 'piercer',     name: 'Piercer',     icon: '📌',  stat: 'pierce',       category: 'combat',  family: 'tacticalSystems',   unlock: { type: 'tier', value: 300 },      order: 23 },

  // === BOUNCE SYSTEMS (3) — deep progression, tier-gated ===
  ricochet:    { id: 'ricochet',    name: 'Ricochet',    icon: '🎱',  stat: 'bounceChance', category: 'combat',  family: 'bounceSystems',     unlock: { type: 'tier', value: 400 },      order: 24 },
  shrapnel:    { id: 'shrapnel',    name: 'Shrapnel',    icon: '💥',  stat: 'bouncePower',  category: 'combat',  family: 'bounceSystems',     unlock: { type: 'bosses', value: 200 },    order: 25 },
  cascade:     { id: 'cascade',     name: 'Cascade',     icon: '🌊',  stat: 'bounceTargets', category: 'combat', family: 'bounceSystems',     unlock: { type: 'tier', value: 800 },      order: 26 },

  // === OVERCHARGE (2) — deep progression ===
  voltaic:     { id: 'voltaic',     name: 'Voltaic',     icon: '⚡',  stat: 'overchargeChance', category: 'combat', family: 'overcharge',     unlock: { type: 'tier', value: 1000 },     order: 27 },
  tesla:       { id: 'tesla',       name: 'Tesla',       icon: '🔋',  stat: 'overchargePower',  category: 'combat', family: 'overcharge',     unlock: { type: 'tier', value: 1500 },     order: 28 },

  // === COMBO SYSTEMS (2) — deep progression ===
  chainlink:   { id: 'chainlink',   name: 'Chainlink',   icon: '🔗',  stat: 'comboBonus',    category: 'combat', family: 'comboSystems',     unlock: { type: 'kills', value: 50000 },   order: 29 },
  tempo:       { id: 'tempo',       name: 'Tempo',       icon: '🥁',  stat: 'comboDuration', category: 'combat', family: 'comboSystems',     unlock: { type: 'tier', value: 2000 },     order: 30 }
};

const HERO_COUNT = Object.keys(HERO_DEFS).length; // 30

// Core upgrade: each level gives +1 garrison slot and 1.1x global multiplier
// Cost formula: 500000 * 2.2^(level-2) for level >= 2
const CORE_UPGRADE = {
  maxLevel: HERO_COUNT, // 30 = all heroes garrisoned
  baseCost: 500000,
  costGrowth: 2.2,
  multiplierPerLevel: 1.1 // compounding: level N = 1.1^(N-1)
};

function coreUpgradeCost(currentLevel) {
  if (currentLevel >= CORE_UPGRADE.maxLevel) return Infinity;
  if (currentLevel <= 0) return 0; // level 1 is free (default)
  return Math.floor(CORE_UPGRADE.baseCost * Math.pow(CORE_UPGRADE.costGrowth, currentLevel - 1));
}

function coreMultiplier(coreLevel) {
  return Math.pow(CORE_UPGRADE.multiplierPerLevel, Math.max(0, coreLevel - 1));
}

// Hero passive multiplier at a given level: 1 + 0.1 * level
function heroPassiveMultiplier(heroLevel) {
  return 1 + 0.1 * Math.max(1, heroLevel);
}

// Training manuals needed to go from current level to next level
function heroManualCost(currentLevel) {
  return currentLevel + 1; // Level 1->2 costs 2, 2->3 costs 3, etc.
}

// Check if a hero is garrisoned (active in a slot)
function isHeroGarrisoned(heroId) {
  return save.garrisonSlots && save.garrisonSlots.indexOf(heroId) !== -1;
}

// Get the passive multiplier a garrisoned hero provides for its stat
function getHeroStatMultiplier(statId) {
  if (!save.garrisonSlots) return 1;
  for (let i = 0; i < save.garrisonSlots.length; i++) {
    const hid = save.garrisonSlots[i];
    if (!hid) continue;
    const def = HERO_DEFS[hid];
    if (!def || def.stat !== statId) continue;
    {
      const heroData = (save.heroes && save.heroes[hid]) ? save.heroes[hid] : { level: 1 };
      const level = heroData.level || 1;
      let mul = heroPassiveMultiplier(level);
      // Check if active ability is currently firing
      if (heroActiveState[hid] && heroActiveState[hid].activeUntil > Date.now()) {
        const cat = HERO_CATEGORIES[def.category];
        mul *= cat.activeMul;
      }
      return mul;
    }
  }
  return 1;
}

// Get the Core global multiplier (applies to all stats)
function getCoreGlobalMultiplier() {
  return coreMultiplier(save.coreLevel || 1);
}

// Combined hero + core multiplier for a stat
function getHeroCoreMultiplier(statId) {
  return getHeroStatMultiplier(statId) * getCoreGlobalMultiplier();
}

// Hero active ability state (runtime, not saved)
const heroActiveState = {};
// Shape: { [heroId]: { activeUntil: timestamp, cooldownUntil: timestamp } }

function activateHeroAbility(heroId) {
  const def = HERO_DEFS[heroId];
  if (!def) return false;
  if (!isHeroGarrisoned(heroId)) return false;
  const cat = HERO_CATEGORIES[def.category];
  const state = heroActiveState[heroId] || (heroActiveState[heroId] = { activeUntil: 0, cooldownUntil: 0 });
  const now = Date.now();
  if (now < state.cooldownUntil) return false; // still on cooldown
  state.activeUntil = now + cat.activeDuration;
  state.cooldownUntil = now + cat.activeDuration + cat.activeCooldown;
  return true;
}

function getHeroAbilityCooldownRemaining(heroId) {
  const state = heroActiveState[heroId];
  if (!state) return 0;
  const now = Date.now();
  if (now >= state.cooldownUntil) return 0;
  return state.cooldownUntil - now;
}

function isHeroAbilityActive(heroId) {
  const state = heroActiveState[heroId];
  if (!state) return false;
  return Date.now() < state.activeUntil;
}

// Purchase core upgrade
function purchaseCoreUpgrade() {
  const current = save.coreLevel || 1;
  if (current >= CORE_UPGRADE.maxLevel) return false;
  const cost = coreUpgradeCost(current);
  if (save.coins < cost) return false;
  save.coins -= cost;
  save.coreLevel = current + 1;
  persistSave();
  return true;
}

// Garrison a hero into the next available slot
function garrisonHero(heroId) {
  if (!save.heroesUnlocked || save.heroesUnlocked.indexOf(heroId) === -1) return false;
  if (isHeroGarrisoned(heroId)) return false;
  const maxSlots = save.coreLevel || 1;
  if (!save.garrisonSlots) save.garrisonSlots = [];
  // Remove nulls and compact
  const active = save.garrisonSlots.filter(function(h) { return h !== null; });
  if (active.length >= maxSlots) return false;
  save.garrisonSlots = active;
  save.garrisonSlots.push(heroId);
  persistSave();
  return true;
}

// Remove a hero from garrison
function ungarrisonHero(heroId) {
  if (!save.garrisonSlots) return false;
  const idx = save.garrisonSlots.indexOf(heroId);
  if (idx === -1) return false;
  save.garrisonSlots.splice(idx, 1);
  // Clear active state
  delete heroActiveState[heroId];
  persistSave();
  return true;
}

// Level up a hero using training manuals
function levelUpHero(heroId) {
  if (!save.heroesUnlocked || save.heroesUnlocked.indexOf(heroId) === -1) return false;
  if (!save.heroes[heroId]) save.heroes[heroId] = { level: 1 };
  const current = save.heroes[heroId].level;
  const cost = heroManualCost(current);
  if ((save.trainingManuals || 0) < cost) return false;
  save.trainingManuals -= cost;
  save.heroes[heroId].level = current + 1;
  persistSave();
  return true;
}

// Unlock a hero (called by milestone system)
function unlockHero(heroId) {
  if (!HERO_DEFS[heroId]) return false;
  if (!save.heroesUnlocked) save.heroesUnlocked = [];
  if (save.heroesUnlocked.indexOf(heroId) !== -1) return false;
  save.heroesUnlocked.push(heroId);
  if (!save.heroes[heroId]) save.heroes[heroId] = { level: 1 };
  persistSave();
  return true;
}

// Evaluate whether a hero's unlock condition is met
function isHeroUnlockMet(unlock) {
  if (!unlock) return true;
  switch (unlock.type) {
    case 'tier':     return (save.bestTier || 1) >= unlock.value;
    case 'kills':    return (save.totalEnemiesKilled || 0) >= unlock.value;
    case 'bosses':   return (save.totalBossesDefeated || 0) >= unlock.value;
    case 'runs':     return (save.totalRuns || 0) >= unlock.value;
    case 'wave':     return (save.bestWave || 0) >= unlock.value;
    case 'cash':     return (save.totalCashEarned || 0) >= unlock.value;
    case 'gems':     return (save.totalGemsEarned || 0) >= unlock.value;
    case 'playtime': return (save.totalPlaytimeMs || 0) >= unlock.value;
    default:         return false;
  }
}

// Human-readable description of an unlock condition
function heroUnlockDescription(unlock) {
  if (!unlock) return '';
  var fmt = typeof formatNum === 'function' ? formatNum : function(n) { return String(n); };
  switch (unlock.type) {
    case 'tier':     return 'Reach Tier ' + unlock.value;
    case 'kills':    return 'Kill ' + fmt(unlock.value) + ' enemies';
    case 'bosses':   return 'Defeat ' + unlock.value + ' bosses';
    case 'runs':     return 'Complete ' + unlock.value + ' runs';
    case 'wave':     return 'Reach Wave ' + unlock.value;
    case 'cash':     return 'Earn ' + fmt(unlock.value) + ' cash';
    case 'gems':     return 'Earn ' + unlock.value + ' gems';
    case 'playtime': return 'Play ' + Math.round(unlock.value / 3600000) + ' hours';
    default:         return '???';
  }
}

// Progress fraction (0-1) toward an unlock condition
function heroUnlockProgress(unlock) {
  if (!unlock) return 1;
  var current = 0;
  switch (unlock.type) {
    case 'tier':     current = save.bestTier || 1; break;
    case 'kills':    current = save.totalEnemiesKilled || 0; break;
    case 'bosses':   current = save.totalBossesDefeated || 0; break;
    case 'runs':     current = save.totalRuns || 0; break;
    case 'wave':     current = save.bestWave || 0; break;
    case 'cash':     current = save.totalCashEarned || 0; break;
    case 'gems':     current = save.totalGemsEarned || 0; break;
    case 'playtime': current = save.totalPlaytimeMs || 0; break;
  }
  return Math.min(1, current / unlock.value);
}

// Check which heroes have become pullable (conditions met + family owned).
// No longer auto-unlocks — heroes must be pulled from the shop.
// Returns array of newly-pullable hero IDs (for notification purposes).
function checkHeroUnlocks() {
  // Track which heroes we've already notified about being pullable
  if (!save._notifiedPullable) save._notifiedPullable = [];
  const newlyPullable = [];
  const unlocked = save.heroesUnlocked || [];
  const devMode = typeof save !== 'undefined' && save.settings && save.settings.devMode;

  for (const hid of Object.keys(HERO_DEFS)) {
    // Already owned — skip
    if (unlocked.indexOf(hid) !== -1) continue;
    // Already notified — skip
    if (save._notifiedPullable.indexOf(hid) !== -1) continue;
    const def = HERO_DEFS[hid];
    if (!devMode) {
      if (def.family && !familyIsOwned(def.family)) continue;
      if (!isHeroUnlockMet(def.unlock)) continue;
    }
    // This hero just became pullable
    save._notifiedPullable.push(hid);
    newlyPullable.push(hid);
  }

  // Dev mode: give manuals if low
  if (devMode) {
    if ((save.trainingManuals || 0) < 100) save.trainingManuals = 999;
  }

  // Show notification for each newly pullable hero
  for (let i = 0; i < newlyPullable.length; i++) {
    const def = HERO_DEFS[newlyPullable[i]];
    if (def && typeof showHeroPullableToast === 'function') {
      setTimeout(showHeroPullableToast.bind(null, def), i * 1200);
    }
  }
  return newlyPullable;
}

// Training manual store packs (gem cost)
const MANUAL_STORE = [
  { id: 'manualPack5',  name: '5 Manuals',  manuals: 5,  gemCost: 40 },
  { id: 'manualPack20', name: '20 Manuals', manuals: 20, gemCost: 140 },
  { id: 'manualPack50', name: '50 Manuals', manuals: 50, gemCost: 300 }
];

function buyManualPack(packId) {
  const pack = MANUAL_STORE.find(function(p) { return p.id === packId; });
  if (!pack) return false;
  if (save.gems < pack.gemCost) return false;
  save.gems -= pack.gemCost;
  save.trainingManuals = (save.trainingManuals || 0) + pack.manuals;
  persistSave();
  return true;
}
