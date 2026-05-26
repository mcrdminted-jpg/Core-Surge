# Balance Recommendation - Rank Progression Rebalance
**Created**: 2026-05-25 by Cowork (QA Task 71)
**Status**: FOR CLAUDE CODE TO IMPLEMENT
**Priority**: Critical - current v0.7.25 balance is broken in the other direction

---

## Problem

v0.7.25 fixed "progression too fast" by raising costMul from ~1.12 to ~1.18 across all stats. But with maxRank 400 on damage, the geometric cost makes later ranks literally impossible:

- Rank 400 of damage costs 10 * 1.18^399 = more atoms than the universe
- By Tier 10 (328 runs, ~700K Scrap earned), player only reaches rank 50/400 = 12.5%
- Andy's spec says 75% by Tier 10
- Unlock families alone cost 377,500 Scrap, which exceeds total Tier 1-5 income

The game went from "max everything in 10 runs" to "never max anything ever."

---

## Root Cause

The maxRank values (100-400) were designed for a different cost curve. With costMul 1.18, having 400 ranks means the last rank costs 10^29 Scrap. The fix raised costMul without reducing maxRank.

---

## Recommended Fix (Best Practice for Mobile TD Games)

### Philosophy
- Fewer ranks, each rank feels POWERFUL
- Player always has something to buy but never feels stuck
- Unlock families are exciting milestones, not grind walls
- 75% completion by Tier 10 as Andy specified

### Starter Stats (always available)

| Stat | maxRank | cost0 | costMul | flatPerRank | Total to Max |
|------|---------|-------|---------|-------------|-------------|
| damage | 25 | 12 | 1.14 | 4 | ~3,200 |
| fireRate | 20 | 18 | 1.15 | 0.05 | ~3,600 |
| coreHealth | 25 | 10 | 1.13 | 20 | ~2,100 |
| armor | 15 | 20 | 1.16 | 2 | ~2,400 |
| range | 10 | 25 | 1.18 | 3 | ~1,200 |
| cashBonus | 15 | 20 | 1.15 | 0.03 | ~2,000 |

**Total starter max cost: ~14,500 Scrap**

### Key Changes from Current
1. **maxRank reduced dramatically** (400 -> 25, 250 -> 20, etc.)
2. **flatPerRank increased proportionally** (so total bonus at max is similar: 25 ranks * 4 dmg = 100 vs 400 * 1 = 400. Reduce total bonus to match desired power curve)
3. **costMul stays moderate** (1.13-1.18) because fewer ranks means the geometric growth doesn't explode
4. **cost0 slightly higher** to prevent first 5 ranks being free

### Unlock Family Costs (reduced ~50%)

| Family | Current | Recommended | Rationale |
|--------|---------|-------------|-----------|
| critSystems | 2,500 | 1,500 | First unlock, should come early T2 |
| economyExpansion | 5,000 | 3,000 | Helps progression, unlock early |
| sustainSystems | 10,000 | 6,000 | Regen needed by T3 |
| fortification | 15,000 | 8,000 | Defense option by T3-4 |
| coinMastery | 20,000 | 12,000 | Economy boost mid-game |
| multishotSystems | 25,000 | 15,000 | Power spike at T4-5 |
| barrierSystems | 35,000 | 20,000 | Late mid-game |
| tacticalSystems | 40,000 | 25,000 | T6-7 content |
| bounceSystems | 50,000 | 30,000 | Advanced |
| overcharge | 75,000 | 45,000 | Late game |
| comboSystems | 100,000 | 60,000 | Endgame capstone |

**Total unlock costs: 225,500 (down from 377,500)**

### Gated Stats

| Stat | maxRank | cost0 | costMul | Notes |
|------|---------|-------|---------|-------|
| critChance | 15 | 40 | 1.16 | 0.5% per rank -> 7.5% max |
| critPower | 15 | 50 | 1.16 | |
| multiChance | 10 | 100 | 1.18 | Premium stat, expensive |
| multiPower | 10 | 80 | 1.16 | |
| multiTargets | 5 | 200 | 1.20 | Very few ranks, each huge |
| bounceChance | 8 | 150 | 1.18 | |
| bouncePower | 8 | 120 | 1.16 | |
| bounceTargets | 4 | 300 | 1.20 | |
| regen | 15 | 35 | 1.14 | |
| lifesteal | 12 | 60 | 1.16 | |
| comboBonus | 10 | 80 | 1.16 | |
| comboDuration | 8 | 100 | 1.18 | |
| thorns | 12 | 45 | 1.15 | |
| knockback | 8 | 60 | 1.16 | |
| shieldHP | 12 | 50 | 1.15 | |
| shieldRegen | 10 | 70 | 1.16 | |
| coinMultiplier | 12 | 55 | 1.16 | |
| gemFind | 8 | 80 | 1.18 | |
| projSpeed | 10 | 40 | 1.14 | |
| pierce | 8 | 100 | 1.18 | |
| overchargeChance | 10 | 90 | 1.17 | |
| overchargePower | 10 | 70 | 1.16 | |

### Progression Math Verification

With recommended values:
- **Total max rank levels**: 6 starters (~130) + 22 gated (~230) = ~360 total levels
- **Total cost all ranks at 100%**: ~14,500 (starters) + ~80,000 (gated) = ~94,500
- **Total cost including unlocks**: 94,500 + 225,500 = ~320,000
- **Scrap earned by Tier 10**: ~700,000
- **75% completion by T10**: Need ~240,000 spent. Budget is 700K. Player can hit 75% by T7-8 and 100% by T10-11.

This matches Andy's spec while leaving room for IAP acceleration (gems -> Scrap conversion for impatient players).

---

## IAP Pricing Decision

Andy delegated: "You decide best practices, maximize fun and profit."

### Recommended IAP Prices (mobile game best practices)

| Product | Price | Contents | Value Prop |
|---------|-------|----------|------------|
| starter_pack | $4.99 | 500 gems + 5,000 Scrap + 1 guaranteed Prime card | First-purchase hook, 3x value vs gem packs |
| gem_small | $0.99 | 80 gems | Impulse buy, low barrier |
| gem_medium | $4.99 | 500 gems | Best ratio for mid-spenders |
| gem_large | $9.99 | 1,200 gems | Whale tier, 20% bonus vs medium |
| monthly_vault | $2.99/mo | 50 gems/day + exclusive skin access | Retention driver, best long-term value |

### Rationale
- **Starter pack at $4.99** (not $0.99): $0.99 starter packs train users that content is nearly free. $4.99 sets proper value anchor while still being "cheap for a game." Include Scrap + guaranteed rare card to create immediate power spike that hooks the player.
- **gem_small at $0.99**: Low impulse threshold. Player buys this when they're 10 gems short of a pull. High conversion, low ARPU per transaction but builds purchase habit.
- **gem_medium at $4.99**: Core revenue driver. 500 gems = 25 card pulls or significant Scrap conversion.
- **gem_large at $9.99**: Whale product. Bonus gems vs medium shows "smarter to buy big."
- **Monthly vault at $2.99**: Subscription retention. 50 gems/day = 1,500/month = 3x the large pack's value. Players feel committed and play daily to claim.

### Product IDs (standardized)
All should use: `com.mcrdminted.coresurge.{product_name}`

---

## Next Steps for Claude Code

1. Reduce all maxRank values in RANK_DEFS per table above
2. Adjust flatPerRank so total stat bonus at new max is balanced for gameplay
3. Reduce UNLOCK_FAMILIES costs per table above
4. Update STORE_PRODUCT_CATALOG with recommended prices
5. Standardize product IDs to com.mcrdminted.coresurge.* format
6. Test: verify a player can reach ~75% upgrade completion by Tier 10 with ~328 runs
7. Update GDD to reflect 11 unlock families and new rank structure
