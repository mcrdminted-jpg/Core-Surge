# Core Surge: Endless Tower Defense - Game Design Document

---

## 1. Overview

**Title:** Core Surge: Endless Tower Defense
**Genre:** Idle/Active Tower Defense (single-tower, wave-based, endless progression)
**Platform:** Mobile (iOS, Android via Capacitor) + Web (PWA)
**Target Audience:** Casual-to-midcore mobile gamers, ages 13+, who enjoy incremental progression and tower defense
**Monetization:** Free-to-play with in-app purchases (gems) + rewarded ads
**Session Length:** 2-10 minutes per run, with meta-progression between runs

---

## 2. Core Loop

```
Start Run → Battle Waves → Earn Coins → Die/Complete → Spend Coins on Ranks → Start Run Again
                ↓                                              ↑
         Earn Gems (rare)                              Unlock Families
                ↓                                              ↑
         Pull Cards (gems)                             Research Upgrades
```

**Per-Run Loop (2-10 min):**
1. Player starts battle on current Tier
2. Enemies spawn in waves, tower auto-attacks
3. Player buys in-run upgrades with in-run cash (resets on death)
4. Player survives as many waves as possible
5. Run ends when Core HP reaches 0
6. Coins earned based on waves survived + bonuses

**Meta Loop (between runs):**
1. Spend coins on permanent Rank upgrades (damage, fire rate, health, etc.)
2. Unlock new Families to access advanced stat categories
3. Equip Cards (pulled with gems) for passive bonuses
4. Progress through Tiers (reach wave 100 on current tier to unlock next)
5. Compete in Tournaments for ranking and rewards

---

## 3. Progression Systems

### 3.1 Tiers (T1-T18)
- 18 difficulty tiers
- Reach wave 100 on tier T to unlock tier T+1
- Each tier increases enemy HP/damage/speed
- Tier progression is the primary long-term goal

### 3.2 Ranks (Permanent Upgrades)
- Purchased with coins between runs
- Geometric cost scaling per rank (cost0 * costMul^level)
- Two categories:
  - **Starter Stats (always unlocked):** Damage, Fire Rate, Core Health, Armor, Range, Cash Bonus
  - **Family Stats (require family unlock):** Crit Chance, Crit Power, Wave Bonus, Boss Bounty, Regen, Lifesteal, Multi-shot, Bounce, Combo

### 3.3 Unlock Families
- One-time coin purchases that reveal groups of rank-able stats
- 6 families with escalating costs:
  - Crit Systems (2,500 coins) - unlocks critChance, critPower
  - Economy Expansion (5,000) - unlocks waveBonus, bossBounty
  - Sustain Systems (10,000) - unlocks regen, lifesteal
  - Multishot Systems (25,000) - unlocks multiChance, multiPower, multiTargets
  - Bounce Systems (50,000) - unlocks bounceChance, bouncePower, bounceTargets
  - Combo Systems (100,000) - unlocks comboBonus

### 3.4 Cards
- Collectible passive bonuses equipped in loadout slots
- 25 total cards across 3 rarity tiers:
  - Standard (78% pull rate): 12 cards
  - Prime (20% pull rate): 8 cards
  - Apex (2% pull rate): 5 cards
- Cards have 5 levels, leveled by collecting duplicate copies
- Copies needed: Standard 1/2/4/7/12, Prime 1/2/4/8/14, Apex 1/2/4/8/16
- Cards pulled using gems
- Loadout starts with 3 slots, expandable to 10 (gem cost: 100/200/350/550/800/1100/1500)

### 3.5 Milestones
- Achievement-style goals at wave thresholds: 25, 50, 100, 200, 500, 1000, 2500, 5000, 10000
- Rewards for reaching each milestone on each tier

### 3.6 Skins (Cosmetic)
- 7 core skins (Sentinel, Industrial, Verdant, Aegis, Frost, Royal + default)
- Each skin changes tower sprite and battle background
- Unlocked through gameplay progression or purchase

---

## 4. Battle System

### 4.1 Tower (The Core)
- Single stationary tower at center of battlefield
- Auto-attacks nearest enemy within range
- Stats determined by: base values + rank bonuses + card bonuses + in-run upgrades
- Key stats: damage, fire rate, range, crit chance, crit power, health, armor, regen, lifesteal

### 4.2 Enemies
- 12 enemy types with distinct behaviors:
  - Scout (fast, low HP)
  - Runner (very fast)
  - Tank (slow, high HP)
  - Shooter (ranged attack)
  - Spitter (DoT damage)
  - Flyer (bypasses ground)
  - Reaver (armor pierce)
  - Warden (shields allies)
  - Sentry (stationary, tough)
  - Brute (AoE resist)
  - Elite (mini-boss)
  - Boss (wave boss, appears every N waves)

### 4.3 In-Run Upgrades
- Temporary upgrades purchased during battle with in-run cash
- Reset when run ends
- Mapped to unlock families (family must be unlocked to see its in-run upgrades)

### 4.4 Combat Math
- Damage = baseDamage + (rankLevel * flatPerRank) + card bonuses
- Crit: roll against critChance, multiply by critPower on success
- Armor: percentage damage reduction (capped at 75%)
- Lifesteal: heal percentage of damage dealt
- Multishot: chance to hit additional targets per attack
- Bounce: projectile chains to additional enemies

---

## 5. Tournament System

- 18 tiers matching game tiers (T1-T18)
- 5 leagues per tier
- Players compete on best wave reached within tournament window
- Promotion/demotion based on ranking within league
- Leaderboards per league

---

## 6. Monetization Model

### 6.1 Premium Currency: Gems
- Earned in-game via:
  - Gem orbs (rare spawns during battle, first at 2min then every 6-8min)
  - Milestone rewards
  - Tournament placement rewards
- Purchased via IAP:
  - Starter Pack (one-time, best value)
  - Small Gem Pack
  - Medium Gem Pack
  - Monthly Vault (subscription - daily gems)

### 6.2 Gem Sinks
- Card pulls (primary sink)
- Loadout slot unlocks (100-1500 gems per slot)
- Cosmetic skins (optional)

### 6.3 Ads
- Rewarded video: watch ad for bonus gems or skip cooldown
- Banner: bottom of screen during menus (not during battle)
- Interstitial: between battles (max 1 per 3 minutes)
- Frequency caps enforced in code

### 6.4 IAP Products (RevenueCat)
- starter_pack: one-time purchase, premium starter bundle
- gem_small: small gem currency pack
- gem_medium: medium gem currency pack
- monthly_vault: subscription, daily gems delivery

### 6.5 Fair Play Policy
- No pay-to-win: all gameplay stats achievable through play
- Gems accelerate progression but do not gate content
- Card odds disclosed in-game (loot box compliance)

---

## 7. Technical Architecture

- **Frontend:** Vanilla JavaScript (11 modules), 7 CSS files, HTML5
- **Rendering:** DOM-based with canvas elements for battle VFX
- **Save System:** localStorage with versioned migration (currently v8)
- **Cloud Save:** Firebase Firestore (direct client, no Cloud Functions required for basic sync)
- **Authentication:** Firebase Auth (email/password + anonymous guest)
- **Native Wrapper:** Capacitor (shared web codebase → iOS + Android)
- **Billing:** RevenueCat (cross-platform IAP abstraction)
- **Hosting:** Firebase Hosting (web), App Store (iOS), Google Play (Android)

---

## 8. Target Metrics (Post-Launch)

- Day-1 retention: 30%+
- Day-7 retention: 15%+
- Average session length: 5-8 minutes
- Sessions per day: 3-5
- IAP conversion rate: 3-5% of DAU
- Ad revenue: $5-15 RPM (rewarded video)
- Crash rate: <1%
- App Store rating: 4.0+
