# Data Dictionary - Save File (tower_save_v8)

**Storage Key:** `tower_save_v8` (localStorage)
**Format:** JSON string
**Version:** 8
**Migration Policy:** All pre-v8 saves are purged on load (no migration from v7 or earlier)

---

## Top-Level Fields

| Key | Type | Valid Range/Values | Description | Example |
|-----|------|-------------------|-------------|---------|
| `coins` | number | 0 - Infinity | Permanent meta-currency earned from runs, spent on ranks and unlock families | `4500` |
| `gems` | number | 0 - Infinity | Premium currency used for card pulls, slot unlocks, and store purchases | `120` |
| `totalRuns` | number | 0 - Infinity | Lifetime count of battle runs started | `87` |
| `bestTier` | number | 1 - 18 | Highest tier the player has ever reached (determines tournament band) | `5` |
| `bestWave` | number | 1 - Infinity | All-time highest wave reached across all tiers | `142` |
| `bestWavePerTier` | object | `{ [tierNum]: waveNum }` | Best wave reached per tier. Keys are tier numbers as strings, values are wave numbers | `{ "1": 85, "2": 42, "3": 12 }` |
| `claimedMilestones` | object | `{ [milestoneKey]: true }` | Which milestone rewards have been claimed (keys are composite IDs) | `{ "1_25": true, "1_50": true }` |
| `selectedTier` | number | 1 - bestTier | Currently selected tier for next battle run | `3` |
| `totalCashEarned` | number | 0 - Infinity | Lifetime in-run cash earned (not coins; tracks battle economy) | `125000` |
| `totalEnemiesKilled` | number | 0 - Infinity | Lifetime enemy kill count | `9842` |
| `totalPlaytimeMs` | number | 0 - Infinity | Total time spent in battles in milliseconds | `3600000` |
| `username` | string or null | 3-16 chars: `[a-zA-Z0-9_-]` or null | Player display name for leaderboards; null until first set | `"ProTower42"` |
| `usernameLastChanged` | number or null | ms epoch or null | Timestamp of last username change (for cooldown enforcement) | `1716566400000` |
| `lastAdRewardTime` | number | 0 or ms epoch | Last time the shop ad-for-gems reward was claimed | `1716480000000` |
| `unlockedSlots` | number | 3 - 10 | Number of card equipment slots the player has unlocked | `5` |
| `lastSaveTime` | number | ms epoch | Timestamp of last successful save write | `1716566400000` |
| `version` | number | 8 | Save format version. Always written as 8 on persist | `8` |
| `tournament` | object or null | See Tournament section | Persistent tournament bracket state; null if never joined | `null` |
| `playerId` | string | Any string | Stable user-facing name used on leaderboards | `"ProTower42"` |
| `monthlyVaultActive` | boolean | true/false | Whether the Monthly Vault subscription is currently active | `false` |
| `storeEntitlements` | object | `{ [productId]: true }` | IAP products the player has purchased (one-time purchases) | `{ "starter_pack": true }` |
| `equippedCoreSkin` | string or null | Skin ID or null | Currently equipped core skin; null = default CSS core | `"sentinel"` |
| `equippedBgSkin` | string or null | Skin ID or null | Currently equipped battlefield background skin | `"cyber_grid"` |

---

## Settings Object (`save.settings`)

| Key | Type | Valid Range/Values | Description | Example |
|-----|------|-------------------|-------------|---------|
| `showFloatingDamage` | boolean | true/false | Whether to display floating damage numbers on hit | `true` |
| `showFloatingCash` | boolean | true/false | Whether to display floating cash earned text | `true` |
| `showFloatingHeals` | boolean | true/false | Whether to display floating heal numbers | `true` |
| `theme` | string | `'neon'`, `'steel'`, `'amber'`, `'forest'`, `'royal'`, `'mono'` | Active color theme | `"neon"` |
| `gameSpeed` | number | 1, 2, 3 | Battle simulation speed multiplier | `1` |
| `devMode` | boolean | true/false | Whether dev panel is accessible | `false` |
| `buyMultiplier` | number or string | `1`, `10`, `100`, or `'max'` | How many ranks/upgrades to buy per tap | `1` |

---

## Dev State Object (`save.devState`)

| Key | Type | Valid Range/Values | Description | Example |
|-----|------|-------------------|-------------|---------|
| `godMode` | boolean | true/false | Core takes no damage when true | `false` |

---

## Card Inventory (`save.cardInventory`)

Object where each key is a card ID from `CARD_POOL`.

| Key | Type | Valid Range/Values | Description | Example |
|-----|------|-------------------|-------------|---------|
| `[cardId].level` | number | 1 - 5 | Current card level (auto-leveled from copy thresholds) | `2` |
| `[cardId].copies` | number | 1 - Infinity | Total copies collected of this card | `4` |

Example: `{ "heavyCaliber": { "level": 2, "copies": 4 }, "overclock": { "level": 1, "copies": 1 } }`

Valid card IDs: `heavyCaliber`, `overclock`, `fortressPlating`, `sightline`, `hardShell`, `bloodTap`, `rapidRepair`, `sharpEye`, `finisherCore`, `cashValve`, `vaultSeal`, `chargeFeed`, `splitChamber`, `twinPayload`, `crossfireBus`, `ricochetSeed`, `reboundCore`, `mirrorPath`, `bossBreaker`, `comboBank`, `stormThread`, `bulwarkVeil`, `predatorLoop`, `timeLock`, `lastStand`

---

## Equipped Cards (`save.equippedCards`)

| Key | Type | Valid Range/Values | Description | Example |
|-----|------|-------------------|-------------|---------|
| `equippedCards` | array | Array of length `unlockedSlots`; each element is a cardId string or null | Currently equipped card loadout. null means slot is empty | `["heavyCaliber", null, "sharpEye"]` |

---

## Unlock Families (`save.unlocks`)

| Key | Type | Valid Range/Values | Description | Example |
|-----|------|-------------------|-------------|---------|
| `critSystems` | boolean | true/false | Whether Crit Systems family has been purchased (cost: 2500 coins) | `true` |
| `economyExpansion` | boolean | true/false | Whether Economy Expansion family has been purchased (cost: 5000 coins) | `false` |
| `sustainSystems` | boolean | true/false | Whether Sustain Systems family has been purchased (cost: 10000 coins) | `false` |
| `multishotSystems` | boolean | true/false | Whether Multishot Systems family has been purchased (cost: 25000 coins) | `false` |
| `bounceSystems` | boolean | true/false | Whether Bounce Systems family has been purchased (cost: 50000 coins) | `false` |
| `comboSystems` | boolean | true/false | Whether Combo Systems family has been purchased (cost: 100000 coins) | `false` |

---

## Permanent Ranks (`save.ranks`)

Object with one entry per stat. Each entry has format `{ level: N }`.

### Starter Ranks (always available)

| Key | Max Rank | Bonus Per Rank | Description | Example |
|-----|----------|---------------|-------------|---------|
| `damage` | 400 | +1 damage | Base tower damage | `{ "level": 15 }` |
| `fireRate` | 250 | +0.02 shots/sec | Attack speed | `{ "level": 8 }` |
| `coreHealth` | 400 | +10 HP | Core max health | `{ "level": 20 }` |
| `armor` | 150 | +0.5% DR | Damage reduction (caps 75%) | `{ "level": 5 }` |
| `range` | 100 | +1 range level | Tower attack range | `{ "level": 3 }` |
| `cashBonus` | 150 | +2% cash/kill | Cash earned from kills | `{ "level": 10 }` |

### Gated Ranks (require unlock family purchase first)

| Key | Family Required | Max Rank | Bonus Per Rank | Example |
|-----|----------------|----------|---------------|---------|
| `critChance` | critSystems | 100 | +0.5% crit chance | `{ "level": 0 }` |
| `critPower` | critSystems | 100 | +0.02x crit multiplier | `{ "level": 0 }` |
| `waveBonus` | economyExpansion | 50 | +5% end-of-wave cash | `{ "level": 0 }` |
| `bossBounty` | economyExpansion | 50 | +5% boss kill reward | `{ "level": 0 }` |
| `regen` | sustainSystems | 75 | +0.05% HP/sec | `{ "level": 0 }` |
| `lifesteal` | sustainSystems | 75 | +0.3% lifesteal | `{ "level": 0 }` |
| `multiChance` | multishotSystems | 25 | +1% multishot chance | `{ "level": 0 }` |
| `multiPower` | multishotSystems | 25 | +2% multishot power | `{ "level": 0 }` |
| `multiTargets` | multishotSystems | 5 | +1 target | `{ "level": 0 }` |
| `bounceChance` | bounceSystems | 20 | +1% bounce chance | `{ "level": 0 }` |
| `bouncePower` | bounceSystems | 20 | +2.5% bounce damage | `{ "level": 0 }` |
| `bounceTargets` | bounceSystems | 5 | +1 bounce | `{ "level": 0 }` |

**Total max ranks across all stats: 2000**

---

## Tournament Object (`save.tournament`)

When non-null, contains the persistent tournament bracket state. Shape is managed by `js/tournament.js`. Key fields include:

| Key | Type | Description |
|-----|------|-------------|
| `bandId` | number | Current tournament band (1-7) |
| `league` | string | Current league: `'copper'`, `'bronze'`, `'silver'`, `'gold'`, `'platinum'` |
| `bracket` | array | Array of 250 competitors with wave scores |
| `playerRank` | number | Current rank in bracket (1-250) |
| `bestWave` | number | Best wave this cycle |
| `entriesUsed` | number | Entries used this cycle (max 3) |
| `cycleEndTime` | number | ms epoch when current 72-hour cycle ends |
| `lastResult` | object or null | Previous cycle result (rank, reward, league change) |

---

## Valid Skin IDs

**Core Skins:** `"sentinel"`, `"industrial"`, `"verdant"`, `"aegis"`, `"frost"`, `"royal"`, `null` (default)

**Background Skins:** `"cyber_grid"`, `"industrial"`, `"organic"`, `"steel"`, `null` (default)

---

## Constants Related to Save

| Constant | Value | Purpose |
|----------|-------|---------|
| `SAVE_KEY` | `'tower_save_v8'` | localStorage key name |
| `DEAD_SAVE_KEYS` | `['tower_save_v7', ..., 'tower_save_v2']` | Old keys purged on load |
| `MAX_SLOTS` | 10 | Maximum card slots |
| `STARTING_SLOTS` | 3 | Slots available from start |
| `MAX_TIER` | 18 | Highest game tier |
| `MILESTONE_WAVES` | `[25, 50, 100, 200, 500, 1000, 2500, 5000, 10000]` | Wave targets for milestones |

---

## Hydration Behavior

On load, `hydrateSaveState()` merges the stored JSON with `defaultSave` using shallow spread. Nested objects (`settings`, `devState`, `unlocks`, `ranks`) are individually merged with their defaults to ensure newly-added fields exist. Cards are validated against inventory (orphaned equips set to null). The `unlockedSlots` field is clamped between `STARTING_SLOTS` and `MAX_SLOTS`.
