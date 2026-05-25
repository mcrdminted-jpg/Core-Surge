# Content Rating Justification

**Core Surge: Endless Tower Defense**

**Last Updated:** May 24, 2026

This document explains the rationale behind the content rating selections for app store submissions via the IARC (International Age Rating Coalition) questionnaire.

---

## 1. Recommended Rating

| Rating System | Rating | Equivalent |
|--------------|--------|------------|
| PEGI | 12 | Suitable for ages 12 and above |
| ESRB | E10+ or Teen | Everyone 10+ or Teen (13+) |
| IARC Generic | 12+ | Ages 12 and above |
| USK | 12 | Ages 12 and above |
| ClassInd | 12 | Ages 12 and above |
| GRAC | 12 | Ages 12 and above |

The game is designed for ages 13+ and the rating reflects the presence of simulated gambling mechanics (gacha system).

---

## 2. Violence Justification

**Rating impact: MINIMAL -- does not push rating above E (Everyone)**

The game contains mild fantasy violence only:
- A stationary tower fires projectiles at waves of abstract sci-fi enemies
- No blood, gore, or realistic depictions of injury
- No realistic weapons (tower fires energy projectiles, not guns or bladed weapons)
- Enemies disappear with particle effects on destruction (dissolve/fade, no ragdoll or death animations)
- No human characters are harmed -- enemies are abstract geometric or robotic entities
- No violence against named characters or story-driven harm

This is comparable to other tower defense games in the E10+ category. The violence alone would not push the rating above E (Everyone). Games with similar mechanics (Bloons TD, Kingdom Rush) receive E or E10+ ratings.

---

## 3. Gambling / Simulated Gambling Justification

**Rating impact: PRIMARY FACTOR -- pushes rating to 12+ / E10+ / Teen**

The game contains a gacha / loot box system with the following characteristics:

### What the system does:
- Players spend Gems (premium currency purchasable with real money) to perform randomized "card pulls"
- Each pull costs 20 Gems (single) or 180 Gems (10x bundle)
- Pulls award one card from a pool of 25 cards across three rarity tiers
- Rarity tiers: Standard (78%), Prime (20%), Apex (2%)
- Cards provide gameplay stat bonuses and are used in the tower defense combat system

### Why this qualifies as "simulated gambling":
- Players spend premium currency (which can be purchased with real money) on randomized outcomes
- The randomized outcomes have different perceived values (Apex cards are rarer and more powerful)
- The mechanic creates anticipation and excitement around uncertain rewards
- Under PEGI and ESRB criteria, spending real-money-purchasable currency on randomized rewards constitutes simulated gambling

### Why this is NOT actual gambling:
- Cards have no real-world monetary value and cannot be traded, sold, or exchanged for money
- No cash-out mechanism exists
- There is no marketplace where items can be exchanged between players
- All cards are functional gameplay items, not cosmetic collectibles with perceived secondary market value
- Gems can be earned through gameplay (tournament rewards, milestones) -- purchase is not required
- Standard and Prime cards can be directly unlocked without randomization (60 gems and 180 gems respectively)

### Disclosure and mitigation:
- Full odds are disclosed in-game before any purchase (documented in `LOOT_BOX_DISCLOSURE.md`)
- No pity system or hidden modifiers -- each pull is statistically independent
- No "kompu gacha" (complete-the-set) mechanics that pressure collecting all items
- Alternative non-random acquisition paths exist for 20 of 25 cards (Standard and Prime tiers)
- Pull costs are clearly displayed in both gem amounts and equivalent real-money value

---

## 4. User Interaction Justification

**Rating impact: NONE -- does not affect rating**

Player interaction is extremely limited:
- Tournament leaderboards display usernames (player-chosen display names)
- No direct messaging between players
- No chat system (text, voice, or otherwise)
- No social features (friend lists, guilds, clans)
- No user-generated content sharing
- No multiplayer gameplay (asynchronous tournament only)

This does not trigger any user interaction rating thresholds on any rating system. The "Interactive Elements: Users Interact" descriptor may still apply due to leaderboard visibility but does not affect the age rating.

---

## 5. In-App Purchases Disclosure

**Rating impact: DISCLOSURE REQUIRED but not a rating factor**

The game contains in-app purchases:
- Starter Pack: $0.99 (one-time)
- Gem Pack Small: $2.99
- Gem Pack Medium: $9.99
- Monthly Vault: $9.99/month (auto-renewable subscription)

All major rating systems require disclosure of in-app purchases but do not use them as a factor in determining the age rating. The app store listing must include the "In-App Purchases" label. Apple and Google both display this automatically based on the IAP catalog.

---

## 6. Regional Considerations

### 6.1 Belgium

Belgian law (2018 Gaming Commission ruling) classifies paid loot boxes as gambling when they involve spending real money for randomized rewards. This ruling was applied to games like FIFA and Overwatch.

**Risk:** Core Surge's gacha system may be classified as gambling under Belgian law because players can purchase Gems with real money and use them for randomized card pulls.

**Mitigation options:**
- Remove the ability to purchase Gems with real money for Belgian users (making gacha free-to-earn only)
- Remove the gacha system entirely for Belgian users and replace with direct card purchase
- Do not distribute in Belgium initially
- Monitor legal developments -- enforcement has been inconsistent and primarily targeted large publishers

### 6.2 Netherlands

The Netherlands Authority for Consumers and Markets (ACM) and the Dutch Gaming Authority have taken similar positions to Belgium, though enforcement has been less aggressive. The EA Sports FC / FIFA loot box case established precedent.

**Risk:** Similar to Belgium. Paid loot boxes may be restricted.

**Mitigation:** Same options as Belgium. Consider the Benelux region as a single compliance zone.

### 6.3 Japan

Japan's Consumer Affairs Agency and industry self-regulation (JOGA guidelines) require:
- Gacha odds disclosure: COMPLIANT (odds are displayed in-game and documented in `LOOT_BOX_DISCLOSURE.md`)
- No "kompu gacha" (complete-the-set gacha where players must collect all items in a set to receive a bonus): COMPLIANT -- Core Surge has no set completion mechanic

Standard gacha (single random draws with disclosed odds) is legal and widely practiced in Japan. Core Surge's implementation follows the standard model.

### 6.4 China

China's Ministry of Culture regulations (2017) require:
- Disclosure of gacha/loot box probabilities: COMPLIANT
- Display of exact probability percentages before purchase: COMPLIANT
- Probabilities must be available to all players: COMPLIANT (shown in Card Pull shop screen)

**Additional requirement:** China may require a publishing partner and additional approvals (ISBN number for games). These are distribution requirements separate from content rating.

### 6.5 South Korea

The South Korean Game Rating and Administration Committee (GRAC) requires:
- Probability disclosure for randomized items: COMPLIANT
- Rating of 12+ for games with simulated gambling: ALIGNED with our recommended rating

### 6.6 Australia

The Australian Classification Board has been reviewing loot box regulation. As of 2026, paid loot boxes are not classified as gambling, but disclosure of odds is recommended best practice: COMPLIANT.

---

## 7. Content Rating Questionnaire Answers

For the IARC questionnaire during app store submission:

| Question | Answer | Justification |
|----------|--------|---------------|
| Does the app contain violence? | Yes -- mild/cartoon | Fantasy projectiles vs. abstract enemies, no blood or gore |
| Does the app contain sexual content? | No | No sexual content of any kind |
| Does the app contain profanity? | No | No profanity in game text |
| Does the app allow user interaction? | Yes -- limited | Leaderboard display names only, no messaging |
| Does the app contain simulated gambling? | Yes | Gacha/loot box system with premium currency |
| Does the app contain real gambling? | No | No real-money wagering, no cash-out mechanism |
| Does the app contain in-app purchases? | Yes | Gems, starter pack, subscription |
| Does the app share personal data? | Yes -- limited | Email (optional account), username, Firebase UID |
| Does the app contain ads? | Not yet | AdMob is planned but not integrated |
| Is the app designed for children? | No | Target audience is 13+ |

---

## 8. Summary

The 12+ / E10+ / Teen rating is driven primarily by the gacha system's classification as simulated gambling. Without the gacha system, the game would likely qualify for an E (Everyone) / PEGI 3 rating based on its mild fantasy violence and limited user interaction.

The gacha system is a core gameplay mechanic (card collection and leveling) and is implemented with full transparency (odds disclosure, no hidden modifiers, alternative acquisition paths). Regional compliance in Belgium and the Netherlands should be monitored and addressed before distribution in those markets.

---

*This document was last updated on May 24, 2026.*
