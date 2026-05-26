# Tester Feedback Log
**Source:** Alex Murphy (alpha tester, IMG_0723-IMG_0730)
**Date received:** 2026-05-25
**Processed by:** Cowork Agent

---

## Processing Rules (from Reference to feedback.md)
- Take feedback with a grain of salt for gameplay mechanics
- Focus on bugs, UI updates, and quality of life
- These are alpha testers with THE MOST WEIGHT
- Double check source data before changing core mechanics

---

## Feedback Items

### FB-01: Remove top bar during battle (IMG_0723)
**Category:** UI / QoL
**Quote:** "Remove the top bar while playing, the exit/coins/gems/gold. Redundant anyways."
**Current state:** Battle HUD shows an END button + Scrap card + Cash card + Gems card across the top. The status grid below separately shows Tier/Wave/Cash/Kills. Alex is right that showing coins/gems during battle is redundant since you can't spend them mid-battle.
**Recommendation:** VALID. Remove the scrap/gems display from the battle HUD. Keep the END button and in-run Cash display only. Saves vertical space for the battlefield.
**Owner:** Claude Code
**Status:** OPEN
**Priority:** Medium
**Files:** js/ui.js (renderHud battle branch), css/menu.css or css/base.css (hud styles)

---

### FB-02: Main menu top bar too large / can't see gold between runs (IMG_0723)
**Category:** UI
**Quote:** "Make the top bar in the main menu smaller or remove the extra stuff around them. I cant see how much gold I have between runs"
**Current state:** Menu HUD shows 4 stat cards (Scrap, Gems, Best Wave, Runs). These use `hud-stat-card` styling.
**Recommendation:** VALID. Compact the HUD to a single-line bar: scrap count + gem count + maybe best wave. Remove Runs stat from the HUD (move to Settings stats section). Make font smaller and reduce padding.
**Owner:** Claude Code
**Status:** OPEN
**Priority:** Medium
**Files:** js/ui.js (renderHud menu branch), css/menu.css (hud-stat styles)

---

### FB-03: Crit Systems content pushes outside box boundaries (IMG_0724)
**Category:** BUG / UI
**Quote:** "The crit stuff pushes outside of box boundaries"
**Screenshot:** Shows Crit Systems family card with text/content overflowing the card edges.
**Current state:** `.mor-fam` has `overflow: hidden` in CSS, but the absolute-positioned child elements (icon at top 12%, name at top 48%, cost at bottom) may exceed the card bounds on certain screen sizes. The card uses `aspect-ratio: 1 / 1.2` which may not be tall enough for all the content at some viewport widths.
**Recommendation:** VALID BUG. Claude Code needs to test the Research tab crit card at various viewport sizes and fix the overflow. May need to adjust font sizes, positions, or card aspect ratio.
**Owner:** Claude Code
**Status:** OPEN
**Priority:** High (visual bug visible to testers)
**Files:** css/mockup-overlay.css (.mor-fam, .mor-fam-icon, .mor-fam-name, .mor-fam-cost)

---

### FB-04: Crit chance upgrade tooltip/description wrong (IMG_0724)
**Category:** BUG / Data
**Quote:** "Crit chance upgrade has wrong tool tip or modifier. Says .5% crit per upgrade, only gives .05%"
**Current state:** In RANK_DEFS, critChance has `flatPerRank: 0.005` with desc `'+0.5% crit chance per rank'`. 0.005 as a fraction IS 0.5 percentage points. The desc is mathematically correct. However, the in-game display at line 426 of ui.js shows `(getCritChance() * 100).toFixed(0)` which rounds to whole numbers, making the +0.5% increment invisible in the display. A player going from 2% to 2.5% would see "2%" to "2%" (both round to same integer).
**Root cause:** Display uses `.toFixed(0)` for crit chance, losing the 0.5% granularity.
**Recommendation:** VALID BUG. Change crit chance display from `.toFixed(0)` to `.toFixed(1)` so players see 2.0% -> 2.5% -> 3.0% instead of all showing "2%" or "3%". The actual value IS changing, the display just hides it.
**Owner:** Claude Code
**Status:** OPEN
**Priority:** High (players think the upgrade is broken)
**Files:** js/game.js line ~426 (upgradeStatDisplay critChance case)

---

### FB-05: T1 milestone rewards too low (IMG_0725)
**Category:** Balance (QoL-adjacent)
**Quote:** "Tier 1 milestones should be like 5k, 6k, 7k, 8k, 9k 10k, etc."
**Current state:** `milestoneReward(tier, wave)` = `wave * 0.8 * 1.7^(tier-1)`. For T1: W25=20, W50=40, W100=80, W200=160, W500=400 coins. These are tiny compared to what a player earns per run at those wave levels.
**Cross-check against source data:** The formula makes milestones nearly worthless on T1. At T3 the 1.7^2 multiplier helps but T1 milestones give less than a single run's reward. Alex is correct that these feel pointless.
**Recommendation:** VALID per reference rules (QoL, not core mechanic). Increase base multiplier or add a minimum floor. Suggested: `Math.max(wave * 10, wave * 0.8 * 1.7^(tier-1))` so T1 W25 = 250, W50 = 500, W100 = 1000, etc. This makes milestones feel like real rewards without breaking economy since they're one-time claims.
**Owner:** Claude Code
**Status:** OPEN
**Priority:** Medium
**Files:** js/game.js (milestoneReward function, line ~36)
**NOTE:** Per reference rules, double-check that this doesn't break intended progression. One-time milestone claims at these levels are safe since players earn far more from runs.

---

### FB-06: Range stat doesn't need high max rank (IMG_0725)
**Category:** Balance observation
**Quote:** "Range doesnt need to be that high of a level, something like 20 gets the whole screen covered without perm upgrades"
**Current state:** Range maxRank is already 10 (reduced in v0.7.27 rebalance). `flatPerRank: 3` means max +30 range from ranks. Base range is 0 in data but presumably the tower has a base range defined elsewhere.
**Recommendation:** ALREADY ADDRESSED. Range maxRank is already 10, down from the old 400. Alex may have been testing before the v0.7.27 rebalance was applied. Verify in-run range upgrade isn't also too generous.
**Owner:** Claude Code (verify only)
**Status:** LIKELY FIXED (v0.7.27)
**Priority:** Low

---

### FB-07: Crit gets to 100% too easily (IMG_0725)
**Category:** Balance observation
**Quote:** "Crit gets to 100% well before maxed"
**Current state:** In-run crit upgrades give +1% per level (0.01 per level in getCritChance). With 100 levels available in-run, that's 100% crit chance from in-run alone, before ranks or cards. This means rank investment in critChance is wasted once you can afford enough in-run upgrades.
**Recommendation:** VALID but touches core mechanics. Per reference rules, flag for Andy's decision. Options: (a) cap in-run crit upgrades at 50 levels (50% max from in-run), (b) reduce per-level to 0.005 (0.5% per in-run level), (c) make in-run crit more expensive as it gets higher. Any of these makes rank-based crit feel more valuable.
**Owner:** Andy decision, then Claude Code
**Status:** OPEN - NEEDS DECISION
**Priority:** Medium
**Files:** js/game.js (getCritChance, upgrade cost scaling)

---

### FB-08: Coin scaling in later stages is broken (IMG_0726)
**Category:** Balance
**Quote:** "Coins need to be rethought out in later stages. Gave myself 2 billion and still cant reach end of t1. Higher scaling of coins for later levels. Cost 9m coins for damage upgrade level 121"
**Current state:** This was the core problem that BALANCE_RECOMMENDATION.md was written to fix. In v0.7.27, damage maxRank is 25 (not 400), so level 121 is impossible under the new system. Alex was likely testing pre-rebalance code.
**Recommendation:** ALREADY ADDRESSED by v0.7.27 rebalance (maxRank: 25 for damage, cost curve is reachable). Verify Alex is testing on the latest deployed version.
**Owner:** N/A
**Status:** FIXED (v0.7.27)
**Priority:** N/A

---

### FB-09: T3 milestone rewards should be 500k-millions (IMG_0726/0727)
**Category:** Balance (QoL)
**Quote:** "Yeah by t3 those milestone rewards should probably be like 500k or more. Possibly a few million each"
**Current state:** T3 milestones with current formula: W25 = 20 * 2.89 = ~58, W50 = ~116, W100 = ~231, W500 = ~1157. These are trivially small at T3 where runs earn much more.
**Recommendation:** VALID. Same fix as FB-05. Milestone rewards need a significant increase. See FB-05 recommendation.
**Owner:** Claude Code
**Status:** OPEN (grouped with FB-05)
**Priority:** Medium

---

### FB-10: Max armor % too low, core HP upgrade too weak (IMG_0727)
**Category:** Balance
**Quote:** "Also probably up the max armor % to like 85 maybe. And give more HP for the in game upgrade. 1 per level is insane when youre spending 2.5b for 1hp"
**Current state:** Armor in RANK_DEFS: `flatPerRank: 0.005, maxRank: 15` = max 7.5% from ranks. Desc says "cap 75%." The in-run armor upgrade presumably adds more. For core HP: `coreHealth` rank gives +20 HP per rank (maxRank 25, so +500 HP from ranks). The in-run HP upgrade amount would be in game.js upgrade definitions.
**Cross-check:** Alex says he was spending 2.5 billion for 1 HP. This sounds like pre-rebalance where maxRank was 400 and costs went exponential. Under v0.7.27 with maxRank 25, costs stay reasonable.
**Recommendation:** PARTIALLY ADDRESSED by rebalance. The in-run HP upgrade scaling may still need work. Armor cap concern is valid but touches core mechanics. Flag for Andy.
**Owner:** Andy decision on armor cap, Claude Code on in-run HP scaling
**Status:** OPEN - NEEDS VERIFICATION on v0.7.27
**Priority:** Medium
**Files:** js/game.js (in-run upgrade definitions for HP and armor)

---

### FB-11: Show upgrade values when skills are maxed (IMG_0727)
**Category:** UI / QoL
**Quote:** "In game you should also show the values when a skill is maxed"
**Current state:** When an in-run upgrade is maxed, the display likely just says "MAX" without showing the current value.
**Recommendation:** VALID QoL. When an upgrade reaches max level, show the current value instead of hiding it. Players want to see their build's final stats.
**Owner:** Claude Code
**Status:** OPEN
**Priority:** Low
**Files:** js/ui.js (renderUpgrades or upgrade display logic)

---

### FB-12: Wasted space below bottom nav buttons (IMG_0728)
**Category:** UI
**Quote:** "There is a lot of wasted space underneath the bottom row of buttons, could maybe use that space too for listing all your upgrades without having to move around"
**Current state:** The global-nav is fixed at the bottom. There may be padding/margin below it that's wasted. The suggestion is to use the space for a persistent upgrade summary.
**Recommendation:** VALID QoL. Options: (a) reduce bottom padding, (b) add a compact upgrade summary strip above the nav during battle, (c) add a persistent stats readout. This is a nice-to-have, not a bug.
**Owner:** Claude Code
**Status:** OPEN
**Priority:** Low
**Files:** css/base.css or css/battle.css (global-nav spacing), js/ui.js (potential upgrade summary widget)

---

### FB-13: Permanent upgrades should have more impact vs in-run chance upgrades (IMG_0729)
**Category:** Balance
**Quote:** "To make the permanent upgrades more valuable the in game chance upgrades should only affect it by .5. Possibly even .25. It would make upgrading them via coins worth something. Currently its essentially free to get 100% chance on hit compared to the costs of other upgrades"
**Current state:** In-run crit upgrades give +1% per level, making it trivially easy to reach 100% crit. This devalues the permanent crit chance rank upgrades. Alex wants in-run crit upgrades to give only +0.5% or +0.25% per level, making the permanent ranks matter more.
**Recommendation:** VALID and aligns with FB-07. This is a core balance concern that directly affects monetization (if ranks feel worthless, players won't invest coins/time into them). However, per reference rules, this touches core mechanics, so flag for Andy's decision.
**Owner:** Andy decision, then Claude Code
**Status:** OPEN - NEEDS DECISION (grouped with FB-07)
**Priority:** High (affects perceived value of progression system)
**Files:** js/game.js (in-run upgrade per-level values)

---

### FB-14: Game should take 1+ years to max as F2P (IMG_0730)
**Category:** Balance philosophy
**Quote:** "I want a playable game to take 1+ years to max out as a F2P. If you spend maybe 3-4 months"
**Current state:** With v0.7.27 rebalance (maxRank 10-25 per stat), total progression is much shorter than a 1+ year target. The current system targets 75% completion by T10 which could happen in weeks of active play.
**Recommendation:** This is a CORE DESIGN PHILOSOPHY statement. Per reference rules, take with a grain of salt for gameplay mechanics and check source data first. Andy's spec in BALANCE_RECOMMENDATION.md targets 75% by T10, which is much faster than "1+ years." This conflicts. Andy needs to decide which vision is correct. DO NOT change core progression based on this without Andy's approval.
**Owner:** Andy decision
**Status:** OPEN - NEEDS ANDY'S INPUT
**Priority:** High (fundamental design direction)
**NOTE:** Alex's perspective is that of a retention-focused player. A 1+ year grind requires very different maxRank values, cost curves, and coin income than what v0.7.27 implements.

---

### FB-15: Don't want 5 runs with no improvement (IMG_0730)
**Category:** Balance / Feel
**Quote:** "Dont want to play 5 runs without being able to improve either"
**Current state:** This is the counterbalance to FB-14. If the game takes 1+ years, there needs to be tangible progress every single run. With current milestone/rank costs, runs should always yield enough for at least 1 rank purchase.
**Recommendation:** VALID feel concern. Every run should give enough coins for at least one meaningful upgrade. This is already the target in v0.7.27 with lower maxRanks and reasonable cost curves. Verify with math that even late-game runs at high tiers produce enough for at least one rank purchase.
**Owner:** Claude Code (verify)
**Status:** OPEN
**Priority:** Medium

---

### FB-16: Add tooltips for less obvious upgrades like Combo (IMG_0730)
**Category:** UI / QoL
**Quote:** "Maybe add a few tool tips for the less obvious things like combo"
**Current state:** The rank descriptions in RANK_DEFS have desc fields ("+2% combo damage bonus per rank"), but in-run upgrades may not have tooltips explaining what they do. The tutorial covers basic concepts but doesn't explain every mechanic.
**Recommendation:** VALID QoL. Add info/tooltip buttons next to upgrade names in the Research tab and in-run upgrade panel. On tap, show a brief explanation of what the stat does and how it works.
**Owner:** Claude Code
**Status:** OPEN
**Priority:** Medium
**Files:** js/ui.js (renderLabsTab, renderUpgrades), css additions for tooltip overlay

---

### FB-17: Higher tiers don't feel harder (IMG_0730)
**Category:** Balance / Gameplay
**Quote:** "Do the enemies get stronger each tier you move up? Doesn't feel like t16 is really any more difficult than t10"
**Current state:** Enemy HP scales via `hpTierMul(tier)` and damage via `dmgTierMul(tier)`. Need to check these functions to verify tier scaling is noticeable.
**Recommendation:** VALID gameplay concern. If tier scaling is too flat at high tiers, the difficulty plateau makes progression meaningless. Claude Code should verify the tier multiplier curves and potentially steepen them at higher tiers.
**Owner:** Claude Code
**Status:** OPEN
**Priority:** Medium
**Files:** js/game.js (hpTierMul, dmgTierMul, cashTierMul functions)

---

### FB-18: Add energy mechanic, daily recharge, or attack speed ratio adjustment (IMG_0723)
**Category:** Feature request / Core mechanic
**Quote:** "Add energy to fighting the battle, and daily recharge. If not increase attack speed ratio, lower cost of upgrades if you also have to spend to use the extra unlocks like crit"
**Current state:** No energy/stamina system exists. Battles are unlimited. Attack speed is a purchasable stat.
**Recommendation:** TOUCHES CORE MECHANICS. Per reference rules, this is gameplay philosophy that needs Andy's sign-off. Energy systems are common in F2P but divisive. An energy gate would support the "1+ year to max" goal (FB-14) by limiting daily runs, but conflicts with FB-15 (don't want runs with no improvement). Flag for Andy.
**Owner:** Andy decision
**Status:** OPEN - NEEDS ANDY'S INPUT
**Priority:** Low (feature request, not a bug)

---

### FB-20: Battle HUD still says "COINS" not "SCRAP" (Andy, screenshot)
**Category:** BUG / Branding
**Source:** Andy (screenshot, 2026-05-25)
**Current state:** The battle branch of renderHud() in js/ui.js still renders the label "COINS" for the permanent currency display. The menu branch already says "SCRAP" but the battle branch was missed.
**Recommendation:** VALID BUG. Change the label in the battle HUD from "COINS" to "SCRAP." Also confirms FB-01 -- this entire bar (END + Scrap + Cash) is redundant during battle since there's a separate status grid showing Tier/Wave/Cash/Kills below it.
**Owner:** Claude Code
**Status:** OPEN
**Priority:** High (player-facing branding inconsistency)
**Files:** js/ui.js (renderHud battle branch, line ~635)

---

### FB-19: Rename "coins" to something more thematic like "Scrap" (Andy directive)
**Category:** UI / Branding
**Source:** Andy (direct instruction, 2026-05-25)
**Quote:** "Remember coins rename to scraps or something more along the line with theme, coins doesnt fit really."
**Current state:** The HUD already shows "SCRAP" in several places (renderHud uses "SCRAP" label). But code variables use `coins`, some UI text like milestone rewards and shop descriptions may still say "coins," and documentation uses "coins" throughout. The in-game currency display "SCRAP" with the icon already exists but isn't consistently applied everywhere.
**Recommendation:** Full display text audit. All player-facing references to "coins" must become "Scrap." Internal code variable names (`save.coins`, `coinRewardForRun`) can stay as-is since players never see them. Documentation should also be updated for consistency.
**Owner:** Claude Code (display text), Cowork (documentation)
**Status:** OPEN
**Priority:** Medium
**Files:** js/ui.js (all "coin" display strings), js/game.js (reward display text), js/data.js (DAILY_LOGIN_REWARDS labels, STORE_PRODUCT_CATALOG descriptions), all .md docs

---

## Summary

| ID | Category | Priority | Status |
|----|----------|----------|--------|
| FB-01 | UI | Medium | OPEN |
| FB-02 | UI | Medium | OPEN |
| FB-03 | BUG | High | OPEN |
| FB-04 | BUG | High | OPEN |
| FB-05 | Balance/QoL | Medium | OPEN |
| FB-06 | Balance | Low | LIKELY FIXED (v0.7.27) |
| FB-07 | Balance | Medium | NEEDS DECISION |
| FB-08 | Balance | N/A | FIXED (v0.7.27) |
| FB-09 | Balance/QoL | Medium | OPEN (grouped w/ FB-05) |
| FB-10 | Balance | Medium | NEEDS VERIFICATION |
| FB-11 | UI/QoL | Low | OPEN |
| FB-12 | UI | Low | OPEN |
| FB-13 | Balance | High | NEEDS DECISION |
| FB-14 | Design | High | NEEDS ANDY'S INPUT |
| FB-15 | Balance/Feel | Medium | OPEN |
| FB-16 | UI/QoL | Medium | OPEN |
| FB-17 | Balance | Medium | OPEN |
| FB-18 | Feature | Low | NEEDS ANDY'S INPUT |
| FB-19 | UI/Branding | Medium | OPEN |
| FB-20 | BUG/Branding | High | OPEN |

### Items needing Andy's decision before Claude Code can act:
1. **FB-07/FB-13:** In-run crit (and other chance upgrades) too cheap, devalues permanent ranks. Reduce per-level to 0.5% or 0.25%?
2. **FB-14:** Should the game take 1+ years to max F2P? This conflicts with current 75% by T10 target.
3. **FB-18:** Energy/stamina system? Daily recharge?

### Items Claude Code can act on immediately:
1. **FB-01:** Remove scrap/gems from battle HUD
2. **FB-02:** Compact main menu HUD
3. **FB-03:** Fix crit card overflow in Research tab
4. **FB-04:** Fix crit chance display (toFixed(0) -> toFixed(1))
5. **FB-05/09:** Increase milestone rewards
6. **FB-11:** Show values when upgrades are maxed
7. **FB-16:** Add tooltips for less obvious upgrades
8. **FB-17:** Verify tier difficulty scaling curves
9. **FB-19:** Rename all remaining "coins" display text to "Scrap"
