# Hero System Design — Core Surge v0.8+

## Overview

Heroes are permanent units garrisoned inside the Core. Each hero boosts one stat via a passive multiplier and has an active burst ability on cooldown. There are **30 heroes** total, one per rankable stat in the game (6 starter + 24 from 11 unlock families).

---

## Tier / Wave Restructure

**Old model:** Wave 1 through infinity. Display shows "Wave 54,387."

**New model:** Tier + Wave. Both are unlimited.

- Tier = the run counter. Each new run increments tier by 1.
- Wave = within-run survival counter. Starts at 1 each run, unlimited ceiling.
- Enemies scale by both Tier AND Wave. Higher tier = harder baseline. Higher wave = harder within the run.
- Player will eventually die. Death ends the run, increments tier, grants prestige rewards.
- Display: **"Tier 5,012 — Wave 87"** instead of "Wave 500,000."
- Psychologically: Tier is the prestige badge. Wave is the "how far did I push this run" metric.

**Scaling formula (concept):**
```
enemyHP = baseHP * (1 + 0.12 * wave) * (1 + 0.05 * tier)
enemyDmg = baseDmg * (1 + 0.08 * wave) * (1 + 0.03 * tier)
```
Exact tuning TBD during balance pass.

---

## Core Upgrade System

The Core is a new upgradeable structure. Upgrading it:
1. Unlocks hero garrison slots (1 slot per Core level)
2. Grants a global multiplier to ALL permanent upgrades (ranks, cards, heroes)

### Core Upgrade Table

| Core Level | Hero Slots | Global Multiplier | Upgrade Cost (Scrap) |
|-----------|-----------|-------------------|---------------------|
| 1 (default) | 1 | 1.0x | Free |
| 2 | 2 | 1.1x | 500,000 |
| 3 | 3 | 1.21x | 1,500,000 |
| 4 | 4 | 1.331x | 4,000,000 |
| 5 | 5 | 1.464x | 10,000,000 |
| 6 | 6 | 1.611x | 25,000,000 |
| 7 | 7 | 1.772x | 60,000,000 |
| 8 | 8 | 1.949x | 140,000,000 |
| 9 | 9 | 2.144x | 320,000,000 |
| 10 | 10 | 2.358x | 700,000,000 |
| ... | ... | prev * 1.1 | prev * 2.2 |
| 28 | 28 | ~13.1x | ~billions |
| 30 (max) | 30 | ~15.9x | ~billions |

**Formula:**
- Multiplier at level N: `1.1 ^ (N - 1)`
- Cost at level N: `500000 * 2.2 ^ (N - 2)` for N >= 2

Core level 30 = all 30 heroes garrisoned simultaneously. This is deep end-game (Tier 5000+ territory).

---

## Hero Mechanics

### Acquisition
- Heroes unlock from **milestones** (tier milestones, wave milestones, achievement milestones).
- First 6 heroes (starter stats) unlock at low tiers. Family heroes unlock as you unlock their family.
- Can also be purchased in the Hero Shop for gems (expensive, shortcut).

### Leveling
- Heroes start at **Level 1** (1.1x passive multiplier).
- Leveling requires **Training Manuals**.
- Manuals needed per level: `level` (Level 2 costs 2 manuals, Level 3 costs 3, etc.)
- **No max level.** Diminishing returns built into the multiplier formula.
- Passive multiplier at level L: `1 + (0.1 * L)` — so Level 1 = 1.1x, Level 10 = 2.0x, Level 50 = 6.0x, Level 100 = 11.0x.

### Training Manual Sources
- **Tier milestones:** Every 10 tiers grants 1-3 manuals (scaling with tier number).
- **Wave milestones:** Reaching wave 25, 50, 75, 100 in a run grants manuals.
- **Gem Store:** Buy packs of manuals with gems (same store section as cards).
- **Boss drops:** Small chance on boss kill (scales with tier).

### Passive Ability
- Always active while hero is garrisoned.
- Multiplies the hero's associated stat.
- Stacks multiplicatively with ranks, cards, and Core multiplier.
- Example: Damage Hero at Level 5 = 1.5x damage. Combined with Core Level 5 (1.464x) = effective 2.2x on top of rank bonuses.

### Active Ability
- Manual activation (tap) or auto-fire toggle.
- Effect: **2.5x the passive multiplier** for a short burst.
- Duration: 5-10 seconds (varies by hero category).
- Cooldown: 90-180 seconds (varies by hero category).
- Economy heroes get shorter burst (5s) but the multiplier effect is stronger (3x passive).
- Combat heroes get longer burst (10s) at 2x passive.

**Active formula:**
- Combat stat heroes: 2.0x passive value for 10 seconds, 120s cooldown.
- Economy stat heroes: 3.0x passive value for 5 seconds, 150s cooldown.
- Defense stat heroes: 2.5x passive value for 8 seconds, 90s cooldown.

---

## Complete Hero Roster (28 Heroes)

### Starter Heroes (6) — Always available to unlock

| # | Hero Name | Stat | Category | Passive (Lv1) | Active |
|---|-----------|------|----------|---------------|--------|
| 1 | **Ironclad** | damage | Combat | 1.1x damage | 2.2x damage for 10s (120s CD) |
| 2 | **Quickfire** | fireRate | Combat | 1.1x fire rate | 2.2x fire rate for 10s (120s CD) |
| 3 | **Bastion** | coreHealth | Defense | 1.1x core HP | 2.75x core HP for 8s (90s CD) |
| 4 | **Sentinel** | armor | Defense | 1.1x armor | 2.75x armor for 8s (90s CD) |
| 5 | **Hawkeye** | range | Combat | 1.1x range | 2.2x range for 10s (120s CD) |
| 6 | **Profiteer** | cashBonus | Economy | 1.1x cash/kill | 3.3x cash/kill for 5s (150s CD) |

### Crit Systems Heroes (2)

| # | Hero Name | Stat | Category | Passive (Lv1) | Active |
|---|-----------|------|----------|---------------|--------|
| 7 | **Deadeye** | critChance | Combat | 1.1x crit chance | 2.2x crit chance for 10s (120s CD) |
| 8 | **Executioner** | critPower | Combat | 1.1x crit power | 2.2x crit power for 10s (120s CD) |

### Economy Expansion Heroes (2)

| # | Hero Name | Stat | Category | Passive (Lv1) | Active |
|---|-----------|------|----------|---------------|--------|
| 9 | **Surplus** | waveBonus | Economy | 1.1x wave bonus | 3.3x wave bonus for 5s (150s CD) |
| 10 | **Headhunter** | bossBounty | Economy | 1.1x boss bounty | 3.3x boss bounty for 5s (150s CD) |

### Sustain Systems Heroes (2)

| # | Hero Name | Stat | Category | Passive (Lv1) | Active |
|---|-----------|------|----------|---------------|--------|
| 11 | **Mender** | regen | Defense | 1.1x regen | 2.75x regen for 8s (90s CD) |
| 12 | **Leech** | lifesteal | Defense | 1.1x lifesteal | 2.75x lifesteal for 8s (90s CD) |

### Fortification Heroes (2)

| # | Hero Name | Stat | Category | Passive (Lv1) | Active |
|---|-----------|------|----------|---------------|--------|
| 13 | **Thornguard** | thorns | Defense | 1.1x thorns | 2.75x thorns for 8s (90s CD) |
| 14 | **Shockwave** | knockback | Defense | 1.1x knockback | 2.75x knockback for 8s (90s CD) |

### Scrap Mastery Heroes (2)

| # | Hero Name | Stat | Category | Passive (Lv1) | Active |
|---|-----------|------|----------|---------------|--------|
| 15 | **Smelter** | coinMultiplier | Economy | 1.1x scrap gain | 3.3x scrap gain for 5s (150s CD) |
| 16 | **Prospector** | gemFind | Economy | 1.1x gem find | 3.3x gem find for 5s (150s CD) |

### Multishot Systems Heroes (3)

| # | Hero Name | Stat | Category | Passive (Lv1) | Active |
|---|-----------|------|----------|---------------|--------|
| 17 | **Scattergun** | multiChance | Combat | 1.1x multi chance | 2.2x multi chance for 10s (120s CD) |
| 18 | **Payload** | multiPower | Combat | 1.1x multi power | 2.2x multi power for 10s (120s CD) |
| 19 | **Hydra** | multiTargets | Combat | 1.1x multi targets | 2.2x multi targets for 10s (120s CD) |

### Barrier Systems Heroes (2)

| # | Hero Name | Stat | Category | Passive (Lv1) | Active |
|---|-----------|------|----------|---------------|--------|
| 20 | **Aegis** | shieldHP | Defense | 1.1x shield HP | 2.75x shield HP for 8s (90s CD) |
| 21 | **Dynamo** | shieldRegen | Defense | 1.1x shield regen | 2.75x shield regen for 8s (90s CD) |

### Tactical Systems Heroes (2)

| # | Hero Name | Stat | Category | Passive (Lv1) | Active |
|---|-----------|------|----------|---------------|--------|
| 22 | **Railgun** | projSpeed | Combat | 1.1x proj speed | 2.2x proj speed for 10s (120s CD) |
| 23 | **Piercer** | pierce | Combat | 1.1x pierce | 2.2x pierce for 10s (120s CD) |

### Bounce Systems Heroes (3)

| # | Hero Name | Stat | Category | Passive (Lv1) | Active |
|---|-----------|------|----------|---------------|--------|
| 24 | **Ricochet** | bounceChance | Combat | 1.1x bounce chance | 2.2x bounce chance for 10s (120s CD) |
| 25 | **Shrapnel** | bouncePower | Combat | 1.1x bounce power | 2.2x bounce power for 10s (120s CD) |
| 26 | **Cascade** | bounceTargets | Combat | 1.1x bounce targets | 2.2x bounce targets for 10s (120s CD) |

### Overcharge Heroes (2)

| # | Hero Name | Stat | Category | Passive (Lv1) | Active |
|---|-----------|------|----------|---------------|--------|
| 27 | **Voltaic** | overchargeChance | Combat | 1.1x OC chance | 2.2x OC chance for 10s (120s CD) |
| 28 | **Tesla** | overchargePower | Combat | 1.1x OC power | 2.2x OC power for 10s (120s CD) |

### Combo Systems Heroes (2)

| # | Hero Name | Stat | Category | Passive (Lv1) | Active |
|---|-----------|------|----------|---------------|--------|
| 29 | **Chainlink** | comboBonus | Combat | 1.1x combo bonus | 2.2x combo bonus for 10s (120s CD) |
| 30 | **Tempo** | comboDuration | Combat | 1.1x combo window | 2.2x combo window for 10s (120s CD) |

> **Note:** 30 heroes total (6 starter + 24 from 11 families). The families with 3 stats (multishot, bounce) contribute 3 heroes each.

---

## Economy Math

### Training Manual Budget (per day, 3hrs/day player)

Assumptions: ~25 runs/day, average tier ~200, reaching wave ~50/run.

- Tier milestones (every 10 tiers): ~2.5 manuals/day
- Wave milestones (25, 50 per run): ~50 manuals/day from wave milestones
- Boss drops (~5%): ~6 manuals/day
- **Total passive income:** ~58 manuals/day

### Leveling Costs (cumulative manuals to reach level)

| Hero Level | Manuals This Level | Cumulative Total |
|-----------|-------------------|-----------------|
| 1 | 0 (unlock) | 0 |
| 2 | 2 | 2 |
| 3 | 3 | 5 |
| 5 | 5 | 14 |
| 10 | 10 | 54 |
| 20 | 20 | 209 |
| 50 | 50 | 1,274 |
| 100 | 100 | 5,049 |

Cumulative formula: `sum(2..L) = L*(L+1)/2 - 1`

At 58 manuals/day, getting ONE hero to level 10 takes ~1 day. Level 50 takes ~22 days. Level 100 takes ~87 days. With 30 heroes competing for manuals, specialization matters.

### Core Upgrade Pace

| Core Level | Cost | Days to Earn (at 3M scrap/day) |
|-----------|------|-------------------------------|
| 2 | 500K | < 1 day |
| 5 | 10M | 3 days |
| 10 | 700M | 233 days |
| 15 | ~15B | years (whale/late-game territory) |

Core levels 1-6 are accessible within the first month. Levels 7+ are deep progression goals. Full 28/30 slots is theoretical end-game only.

---

## Interaction with Existing Systems

### Stat Stack Order
```
finalStat = (baseValue + rankBonus) * cardMultiplier * heroPassive * coreMultiplier
```

All multiplicative layers stack. A player with:
- Rank 100 damage (+300 flat)
- Heavy Caliber card Lv5 (+40%)
- Ironclad hero Lv10 (2.0x)
- Core Level 5 (1.464x)

Gets: `(5 + 300) * 1.40 * 2.0 * 1.464 = 1,250 effective damage`

### Hero Slot Selection (Strategic Layer)
- With limited slots, players must choose which heroes to garrison.
- Early game: 1-3 slots, must specialize (damage? economy? defense?).
- Mid game: 5-8 slots, can cover main combat + economy.
- Late game: 15+ slots, approaching full coverage.
- End game: All 30 garrisoned, pure scaling from levels + Core multiplier.

### UI Placement
- New "Heroes" tab in the bottom nav (between Cards and Research/Ranks).
- Core upgrade button at the top of the Heroes screen.
- Each hero shows: portrait, level, passive value, active cooldown status.
- Drag heroes into/out of garrison slots.

---

## Milestone Unlock Schedule (Hero Acquisition)

| Hero | Unlock Condition |
|------|-----------------|
| Ironclad (damage) | Tutorial complete (Tier 1) |
| Quickfire (fireRate) | Reach Tier 5 |
| Bastion (coreHealth) | Reach Tier 10 |
| Profiteer (cashBonus) | Reach Tier 15 |
| Sentinel (armor) | Reach Tier 25 |
| Hawkeye (range) | Reach Tier 40 |
| Deadeye (critChance) | Unlock Crit Systems family |
| Executioner (critPower) | Reach Tier 60 |
| Surplus (waveBonus) | Unlock Economy Expansion family |
| Headhunter (bossBounty) | Reach Tier 80 |
| Mender (regen) | Unlock Sustain Systems family |
| Leech (lifesteal) | Reach Tier 100 |
| Thornguard (thorns) | Unlock Fortification family |
| Shockwave (knockback) | Reach Tier 150 |
| Smelter (coinMultiplier) | Unlock Scrap Mastery family |
| Prospector (gemFind) | Reach Tier 200 |
| Scattergun (multiChance) | Unlock Multishot Systems family |
| Payload (multiPower) | Reach Tier 300 |
| Hydra (multiTargets) | Reach Tier 400 |
| Aegis (shieldHP) | Unlock Barrier Systems family |
| Dynamo (shieldRegen) | Reach Tier 500 |
| Railgun (projSpeed) | Unlock Tactical Systems family |
| Piercer (pierce) | Reach Tier 700 |
| Ricochet (bounceChance) | Unlock Bounce Systems family |
| Shrapnel (bouncePower) | Reach Tier 900 |
| Cascade (bounceTargets) | Reach Tier 1200 |
| Voltaic (overchargeChance) | Unlock Overcharge family |
| Tesla (overchargePower) | Reach Tier 1500 |
| Chainlink (comboBonus) | Unlock Combo Systems family |
| Tempo (comboDuration) | Reach Tier 2000 |

---

## Save Data Shape (additions to save object)

```javascript
// New fields in defaultSave:
heroes: {},           // { heroId: { level: 1, manuals: 0 } }
garrisonSlots: [],    // array of heroId strings (length <= coreLevel)
coreLevel: 1,        // starts at 1
trainingManuals: 0,   // currency count
heroesUnlocked: [],   // array of heroId strings
bestTier: 0,          // replaces/extends existing bestTier
currentTier: 1,       // current run's tier number
```

---

## Implementation Priority

1. **Data structures** — HERO_DEFS, CORE_UPGRADE_TABLE in data.js
2. **Save migration** — v9 save key with hero fields
3. **Tier/Wave rework** — replace infinite wave counter with tier+wave display
4. **Core upgrade UI** — button + cost display
5. **Hero garrison UI** — slot grid, drag-to-equip
6. **Passive application** — multiply stats in getStatValue()
7. **Active abilities** — cooldown system, tap-to-activate
8. **Training Manual economy** — drops, store, leveling
9. **Milestone unlocks** — hook into tier progression
10. **Balance pass** — tune multipliers against existing rank/card stacking

---

## Open Questions

- Should actives auto-fire in idle/offline mode? (Probably yes, on cooldown.)
- Visual effects for active burst? (Screen flash, stat number pulse, hero portrait glow.)
- Hero portraits: emoji-based like cards, or pixel art? (Emoji for MVP, art later.)
- Should hero levels affect active duration/cooldown, or only passive multiplier? (Recommend: passive only for simplicity. Active scaling could be a v0.9 feature.)
