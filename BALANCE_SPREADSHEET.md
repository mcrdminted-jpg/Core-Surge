# Core Surge - Game Balance Data

Sourced from `js/data.js`

## Starter Ranks (6 stats)

Each stat has: base value, flatPerRank, maxRank, cost0, costMul

| Stat | Description |
|------|-------------|
| damage | Base projectile damage |
| fireRate | Shots per second |
| coreHealth | Maximum core HP |
| armor | Damage reduction |
| range | Attack radius |
| cashBonus | Extra currency per kill |

## Unlock Families (6 families)

Unlock costs (cumulative currency gates):

| Family | Unlock Cost |
|--------|------------|
| critSystems | 2,500 |
| economyExpansion | 5,000 |
| sustainSystems | 10,000 |
| multishotSystems | 25,000 |
| bounceSystems | 50,000 |
| comboSystems | 100,000 |

Each family gates additional ranks that follow the same stat format (base, flatPerRank, maxRank, cost0, costMul).

## Card System

### Pull Odds

| Rarity | Chance |
|--------|--------|
| Standard | 78% |
| Prime | 20% |
| Apex | 2% |

### Copies Required to Level Up

| Rarity | Lv1 | Lv2 | Lv3 | Lv4 | Lv5 |
|--------|-----|-----|-----|-----|-----|
| Standard | 1 | 2 | 4 | 7 | 12 |
| Prime | 1 | 2 | 4 | 8 | 14 |
| Apex | 1 | 2 | 4 | 8 | 16 |

### Slot Unlock Costs (Gems)

| Slot | Cost |
|------|------|
| 4 | 100 |
| 5 | 200 |
| 6 | 350 |
| 7 | 550 |
| 8 | 800 |
| 9 | 1,100 |
| 10 | 1,500 |

## Progression

### Milestone Waves

25, 50, 100, 200, 500, 1000, 2500, 5000, 10000

### Tier System

- Max tier: 18
- Tier unlock requirement: reach wave 100 on previous tier

## Economy

### Gem Orb Timing

- First orb spawns at: 2 minutes
- Subsequent orbs: every 6-8 minutes

### IAP Products

| Product ID | Description |
|------------|-------------|
| starter_pack | One-time starter bundle |
| gem_small | Small gem purchase |
| gem_medium | Medium gem purchase |
| monthly_vault | Monthly subscription vault |
