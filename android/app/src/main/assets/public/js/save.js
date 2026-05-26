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
  bestWave: 1,
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
    comboSystems: false
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
    bounceTargets:{ level: 0 }
  },

  lastSaveTime: Date.now(),
  version: 8,

  // Tournament (v0.7.13+): persistent bracket state, league, cycle info.
  // See js/tournament.js for the full shape and helpers.
  tournament: null,
  // Stable user-facing name used on leaderboards. Stored separately from save-file.
  playerId: 'You',
  monthlyVaultActive: false,
  storeEntitlements: {},

  // Skins (v0.7.14+): null = default CSS Core/background, else skin id.
  equippedCoreSkin: null,
  equippedBgSkin: null
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
        nextSave.ranks[k] = { level: source.ranks[k].level || 0 };
      }
    }
  }
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
  nextSave.equippedCoreSkin = source.equippedCoreSkin || null;
  nextSave.equippedBgSkin = source.equippedBgSkin || null;
  return nextSave;
}

function loadSave() {
  // v0.7.15 purges all pre-v8 saves. Ranks system replaces labs; the shape
  // is incompatible and there's no meaningful migration (starter state is
  // clean). Players get fresh coins but keep localStorage wiped cleanly.
  for (const deadKey of DEAD_SAVE_KEYS) {
    if (localStorage.getItem(deadKey)) {
      console.log('v0.7.15: purging old save ' + deadKey);
      localStorage.removeItem(deadKey);
    }
  }
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const loaded = JSON.parse(raw);
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
  save.version = 8;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {}
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
