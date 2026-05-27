// ============================================================
// save.js — loadSave, persistSave, resetSave, migration, labCost, highestUnlockedTier, milestone helpers.
// Owned by: save/meta AI. Do not put combat logic here.
// ============================================================

// ============================================================
// SAVE
// ============================================================
const defaultSave = {
  coins: 0,
  gems: 0,
  totalRuns: 0,
  bestTier: 1,
  bestWave: 0,
  bestWavePerTier: { 1: 0 },
  claimedMilestones: {},
  selectedTier: 1,
  totalCashEarned: 0,
  totalEnemiesKilled: 0,
  totalPlaytimeMs: 0,
  // v0.7.21: player profile (local-only, backend-ready)
  username: null,
  usernameLastChanged: null,
  settings: {
    showFloatingDamage: true,
    showFloatingCash: true,
    showFloatingHeals: true,
    theme: 'neon',
    gameSpeed: 1,
    devMode: false,
    buyMultiplier: 1  // 1, 10, 100, or 'max'
  },
  devState: {
    godMode: false
  },
  lastAdRewardTime: 0,  // last time the shop's ad-for-gems was claimed (ms epoch)
  adSpeedBoostUntil: 0, // ms epoch — ad-for-2x-speed active until this time
  // Cards system (v0.7.6+)
  // cardInventory: { 'heavyCaliber': { level: 1, copies: 3 }, ... }
  // equippedCards: array sized by unlockedSlots, null if empty
  cardInventory: {},
  equippedCards: [null, null, null],
  unlockedSlots: 3,

  // v0.7.15: unlock families (coin-bought gates) and permanent ranks.
  // Each unlock family, once bought, reveals stats gated behind it.
  // Each rank entry is { level: N } — flat-per-rank bonus defined in RANK_DEFS.
  unlocks: {
    critSystems: false,
    economyExpansion: false,
    sustainSystems: false,
    multishotSystems: false,
    bounceSystems: false,
    comboSystems: false,
    fortification: false,
    barrierSystems: false,
    coinMastery: false,
    tacticalSystems: false,
    overcharge: false
  },
  ranks: {
    // Starter — unlocked from game start
    damage:       { level: 0 },
    fireRate:     { level: 0 },
    coreHealth:   { level: 0 },
    armor:        { level: 0 },
    range:        { level: 0 },
    cashBonus:    { level: 0 },
    // Gated behind unlocks — buy the family first
    critChance:   { level: 0 },
    critPower:    { level: 0 },
    waveBonus:    { level: 0 },
    bossBounty:   { level: 0 },
    regen:        { level: 0 },
    lifesteal:    { level: 0 },
    multiChance:  { level: 0 },
    multiPower:   { level: 0 },
    multiTargets: { level: 0 },
    bounceChance: { level: 0 },
    bouncePower:  { level: 0 },
    bounceTargets:{ level: 0 },
    // v0.7.24: new research stats
    comboBonus:       { level: 0 },
    comboDuration:    { level: 0 },
    thorns:           { level: 0 },
    knockback:        { level: 0 },
    shieldHP:         { level: 0 },
    shieldRegen:      { level: 0 },
    coinMultiplier:   { level: 0 },
    gemFind:          { level: 0 },
    projSpeed:        { level: 0 },
    pierce:           { level: 0 },
    overchargeChance: { level: 0 },
    overchargePower:  { level: 0 }
  },
  // v0.7.24: extended stats
  totalBossesDefeated: 0,
  totalGemsEarned: 0,

  // Daily login rewards (v0.7.27)
  dailyLogin: {
    lastClaimDay: 0,   // day index (floor(Date.now()/86400000)) of last claim
    streak: 0,         // consecutive days claimed (1-7, wraps)
    totalClaims: 0     // lifetime claims for stats
  },

  // Hero system (v0.8)
  heroes: {},              // { heroId: { level: 1 } }
  garrisonSlots: [],       // array of heroId strings currently garrisoned
  coreLevel: 1,            // Core upgrade level (1 = default, max 30)
  trainingManuals: 0,      // currency for hero leveling
  heroesUnlocked: [],      // array of heroId strings the player has unlocked

  lastSaveTime: Date.now(),
  version: 11,

  // Tournament (v0.7.13+): persistent bracket state, league, cycle info.
  // See js/tournament.js for the full shape and helpers.
  tournament: null,
  // Stable user-facing name used on leaderboards. Stored separately from save-file.
  playerId: 'You',
  monthlyVaultActive: false,
  storeEntitlements: {},

  // Speed unlocks: x1/x2/x3 free, x5 and x10 purchasable with scrap.
  unlockedSpeeds: [],

  // Skins (v0.7.14+): Sentinel is the permanent default core skin.
  equippedCoreSkin: 'sentinel',

  // v0.7.25: Tutorial / progressive unlock
  // 0 = fresh, show "start battle" prompt
  // 1 = first battle started (waiting for death)
  // 2 = first death done, guide to buy damage rank
  // 3 = first rank bought, prompt second battle
  // 4 = second battle started
  // 5 = second run done, show feature overview
  // 99 = tutorial complete
  tutorialStep: 0
};

let save;

function cloneDefaultSave() {
  return JSON.parse(JSON.stringify(defaultSave));
}

function hydrateSaveState(loaded) {
  const source = loaded || {};
  const nextSave = { ...defaultSave, ...source };
  nextSave.settings = { ...defaultSave.settings, ...(source.settings || {}) };
  nextSave.devState = { ...defaultSave.devState, ...(source.devState || {}) };
  nextSave.bestWavePerTier = source.bestWavePerTier || { 1: 0 };
  nextSave.claimedMilestones = source.claimedMilestones || {};
  nextSave.unlocks = { ...defaultSave.unlocks, ...(source.unlocks || {}) };
  nextSave.ranks = { ...defaultSave.ranks };
  if (source.ranks) {
    for (const k of Object.keys(defaultSave.ranks)) {
      if (source.ranks[k]) {
        let lvl = parseInt(source.ranks[k].level, 10) || 0;
        // Clamp rank levels at maxRank (prevents tampered saves)
        if (typeof RANK_DEFS !== 'undefined' && RANK_DEFS[k]) {
          lvl = Math.max(0, Math.min(lvl, RANK_DEFS[k].maxRank));
        }
        nextSave.ranks[k] = { level: lvl };
      }
    }
  }
  // v0.7.25: validate numeric fields — prevent NaN, negative, or absurd values
  nextSave.coins = Math.max(0, parseFloat(nextSave.coins) || 0);
  nextSave.gems = Math.max(0, parseInt(nextSave.gems, 10) || 0);
  nextSave.totalRuns = Math.max(0, parseInt(nextSave.totalRuns, 10) || 0);
  nextSave.bestTier = Math.max(1, parseInt(nextSave.bestTier, 10) || 1); // unlimited tiers
  nextSave.bestWave = Math.max(0, parseInt(nextSave.bestWave, 10) || 0);
  nextSave.totalCashEarned = Math.max(0, parseFloat(nextSave.totalCashEarned) || 0);
  nextSave.totalEnemiesKilled = Math.max(0, parseInt(nextSave.totalEnemiesKilled, 10) || 0);
  nextSave.totalPlaytimeMs = Math.max(0, parseFloat(nextSave.totalPlaytimeMs) || 0);
  nextSave.totalBossesDefeated = Math.max(0, parseInt(nextSave.totalBossesDefeated, 10) || 0);
  nextSave.totalGemsEarned = Math.max(0, parseInt(nextSave.totalGemsEarned, 10) || 0);
  if (!nextSave.selectedTier || nextSave.selectedTier < 1) nextSave.selectedTier = 1;
  nextSave.cardInventory = source.cardInventory || {};
  for (const id of Object.keys(nextSave.cardInventory)) {
    if (!nextSave.cardInventory[id].copies) nextSave.cardInventory[id].copies = 1;
  }
  nextSave.unlockedSlots = Math.max(STARTING_SLOTS, Math.min(MAX_SLOTS, source.unlockedSlots || STARTING_SLOTS));
  const loadedEquipped = Array.isArray(source.equippedCards) ? source.equippedCards : [];
  nextSave.equippedCards = [];
  for (let i = 0; i < nextSave.unlockedSlots; i++) {
    nextSave.equippedCards.push(loadedEquipped[i] || null);
  }
  for (let i = 0; i < nextSave.equippedCards.length; i++) {
    if (nextSave.equippedCards[i] && !nextSave.cardInventory[nextSave.equippedCards[i]]) {
      nextSave.equippedCards[i] = null;
    }
  }
  nextSave.tournament = source.tournament || null;
  nextSave.playerId = source.playerId || source.username || 'You';
  nextSave.monthlyVaultActive = !!source.monthlyVaultActive;
  nextSave.storeEntitlements = source.storeEntitlements || {};
  // Hero system hydration
  nextSave.heroes = source.heroes || {};
  nextSave.garrisonSlots = Array.isArray(source.garrisonSlots) ? source.garrisonSlots : [];
  nextSave.coreLevel = Math.max(1, parseInt(source.coreLevel, 10) || 1);
  nextSave.trainingManuals = Math.max(0, parseInt(source.trainingManuals, 10) || 0);
  nextSave.heroesUnlocked = Array.isArray(source.heroesUnlocked) ? source.heroesUnlocked : [];
  nextSave._notifiedPullable = Array.isArray(source._notifiedPullable) ? source._notifiedPullable : [];
  nextSave.unlockedSpeeds = Array.isArray(source.unlockedSpeeds) ? source.unlockedSpeeds : [];
  nextSave.equippedCoreSkin = source.equippedCoreSkin || 'sentinel';
  // v0.7.25: auto-complete tutorial for existing players who already have runs
  if (source.tutorialStep === undefined && (source.totalRuns || 0) > 0) {
    nextSave.tutorialStep = 99;
  }
  return nextSave;
}

// Version-gated save migrations. Each key is the version the save is AT,
// and the function upgrades it to the next version. hydrateSaveState handles
// field defaults; these handle structural changes that need explicit logic.
const SAVE_MIGRATIONS = {
  // v8 → v9: balance rebalance — maxRank drastically reduced per
  // BALANCE_RECOMMENDATION.md. Clamp rank levels to new caps.
  8: function(s) {
    if (s.ranks && typeof RANK_DEFS !== 'undefined') {
      for (const rid of Object.keys(s.ranks)) {
        const def = RANK_DEFS[rid];
        if (def && s.ranks[rid] && s.ranks[rid].level > def.maxRank) {
          console.log('Clamping ' + rid + ' from ' + s.ranks[rid].level + ' to ' + def.maxRank);
          s.ranks[rid].level = def.maxRank;
        }
      }
    }
  },
  // v9 → v10: deep rebalance for 1-year F2P target. maxRank values changed
  // significantly (e.g. damage 10→40, fireRate 8→30). Clamp ranks again.
  9: function(s) {
    if (s.ranks && typeof RANK_DEFS !== 'undefined') {
      for (const rid of Object.keys(s.ranks)) {
        const def = RANK_DEFS[rid];
        if (def && s.ranks[rid] && s.ranks[rid].level > def.maxRank) {
          console.log('v10 clamp: ' + rid + ' from ' + s.ranks[rid].level + ' to ' + def.maxRank);
          s.ranks[rid].level = def.maxRank;
        }
      }
    }
  },
  // v10 → v11: Hero system added. Initialize hero fields.
  10: function(s) {
    if (!s.heroes) s.heroes = {};
    if (!s.garrisonSlots) s.garrisonSlots = [];
    if (!s.coreLevel) s.coreLevel = 1;
    if (!s.trainingManuals) s.trainingManuals = 0;
    if (!s.heroesUnlocked) s.heroesUnlocked = [];
    // Remove MAX_TIER cap on bestTier (was capped at 100)
    // No longer clamped — tiers are unlimited now.
  }
};
const CURRENT_SAVE_VERSION = 11;

function migrateSave(loaded) {
  let v = parseInt(loaded.version, 10) || 0;
  while (v < CURRENT_SAVE_VERSION && SAVE_MIGRATIONS[v]) {
    console.log(`Migrating save v${v} → v${v + 1}`);
    SAVE_MIGRATIONS[v](loaded);
    v++;
    loaded.version = v;
  }
  // If version is unrecognized or newer than current, clamp to current
  loaded.version = CURRENT_SAVE_VERSION;
  return loaded;
}

function loadSave() {
  // Purge all pre-v8 saves (ranks system replaced labs; incompatible shape).
  for (const deadKey of DEAD_SAVE_KEYS) {
    if (localStorage.getItem(deadKey)) {
      console.log('Purging old save ' + deadKey);
      localStorage.removeItem(deadKey);
    }
  }
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const loaded = JSON.parse(raw);
      migrateSave(loaded);
      save = hydrateSaveState(loaded);
    } else {
      save = cloneDefaultSave();
    }
  } catch (e) {
    console.error('Save load failed', e);
    save = cloneDefaultSave();
  }
}

function persistSave() {
  save.lastSaveTime = Date.now();
  save.version = CURRENT_SAVE_VERSION;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (e) {
    console.error('Save failed:', e);
    // Show warning toast so player knows their progress may not be saved
    if (!persistSave._warned) {
      persistSave._warned = true;
      const toast = document.createElement('div');
      toast.className = 'skin-toast';
      toast.style.background = 'rgba(180,40,40,0.95)';
      toast.textContent = '⚠ Save failed — storage may be full. Progress could be lost!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 5000);
      // Reset warning after 60s so it can warn again
      setTimeout(() => { persistSave._warned = false; }, 60000);
    }
  }
  if (typeof queueCloudSave === 'function') queueCloudSave('persist');
}

function replaceSaveState(nextSave, opts) {
  const options = opts || {};
  save = hydrateSaveState(nextSave);
  if (options.persist !== false) persistSave();
}

function exportSaveData() {
  return JSON.parse(JSON.stringify(save));
}

function resetSave() {
  if (!confirm('Wipe ALL progress? This cannot be undone.')) return;
  // Stop any timers that might re-persist before reload
  stopPassiveAccrual();
  if (game.tickHandle) cancelAnimationFrame(game.tickHandle);
  if (window._autoSaveInterval) clearInterval(window._autoSaveInterval);
  // Blank the save object so any in-flight persistSave writes defaults
  save = cloneDefaultSave();
  // Now remove from storage
  localStorage.removeItem(SAVE_KEY);
  for (const k of DEAD_SAVE_KEYS) localStorage.removeItem(k);
  // Reload after a tick so no racing writes
  setTimeout(() => location.reload(), 50);
}
