# IARC Questionnaire Preparation

## Core Surge: Endless Tower Defense

**Last Updated:** 2026-05-24
**Developer:** Andy (Andrew Evans Anglin)
**Platforms:** iOS (App Store), Android (Google Play)

---

## Game Information

- **Title:** Core Surge: Endless Tower Defense
- **Genre:** Tower Defense / Strategy / Card Collection
- **Description:** Free-to-play single-tower endless wave defense game with card collection, gacha pulls, and competitive tournaments
- **Monetization:** Free-to-play with in-app purchases (gem currency) and ads (AdMob)

---

## Content Descriptor Responses

### Violence

- **Is there violence?** Yes - Mild
- **Description:** Fantasy/sci-fi tower combat. A single tower shoots projectiles at waves of abstract/stylized enemies. Enemies disappear or dissolve when defeated (no blood, no gore, no dismemberment). Combat is mechanical and non-graphic. No violence against realistic human characters.
- **Player vs. player violence?** No (tournament is score-based, not direct PvP combat)
- **Reward for violence?** Yes (defeating enemies earns Scrap and progression, but this is standard tower defense gameplay)

### Fear / Horror

- **Scary or disturbing content?** No
- **Description:** Sci-fi aesthetic with clean, colorful visuals. No horror elements, jump scares, dark themes, or disturbing imagery. Enemies are abstract/robotic in design.

### Sexuality

- **Sexual content?** No
- **Description:** No sexual content, nudity, suggestive themes, or romantic elements of any kind.

### Language

- **Profanity or crude language?** No
- **Description:** No in-game dialogue containing profanity. No chat system. No user-generated text visible to others except usernames (which are filtered for profanity).

### Gambling / Simulated Gambling

- **Simulated gambling?** Yes - THIS IS THE KEY RATING FACTOR
- **Description:** The game features a gacha/loot box card pull system. Players spend in-game currency (gems) to pull random cards from card packs. Gems can be earned through gameplay OR purchased with real money. The randomized reward mechanic with real-money purchase option constitutes simulated gambling under most rating systems.
- **Details:**
  - Card pulls use random probability to determine card rarity
  - Pull rates are disclosed to players (pity system included)
  - Players can spend real money on gems which are used for pulls
  - No direct real-money wagering (gems are an intermediary currency)
  - Cards have no real-world monetary value and cannot be traded for money

### Drugs / Alcohol / Tobacco

- **References to controlled substances?** No
- **Description:** No drugs, alcohol, tobacco, or substance references of any kind.

### User Interaction

- **Online interaction between users?** Yes - Limited
- **Description:**
  - Tournament leaderboards display usernames and scores (visible to all players)
  - No direct messaging, chat, voice chat, or private communication
  - No friend lists or social networking features
  - No user-generated content sharing (no custom levels, no image sharing)
  - No multiplayer gameplay (single-player only with competitive leaderboards)

### In-App Purchases

- **Does the app contain in-app purchases?** Yes
- **Types:**
  - Gem packs (consumable virtual currency, various price tiers from $0.99 to $49.99)
  - Monthly Vault subscription (recurring, provides daily gems and exclusive rewards)
- **Can real money be spent on randomized items?** Yes (gems purchased with real money can be spent on randomized gacha card pulls)

### Data Collection / Sharing

- **Does the app collect or share user data?** Yes
- **Data collected:**
  - Firebase Analytics (app usage, session data, crash reports)
  - Firebase Auth (email address for account creation)
  - AdMob (advertising ID for ad serving, with COPPA restrictions for minors)
  - RevenueCat (purchase history for subscription management)
- **Location data:** No, the app does not collect or use location data
- **Camera/Microphone:** No, the app does not access camera or microphone

### Miscellaneous

- **Discrimination or stereotypes?** No
- **Promotion of real-world products?** No (ads are from AdMob network, not developer-promoted)
- **Encourages real-world dangerous behavior?** No

---

## Expected Ratings by Region

| Rating System | Expected Rating | Reason |
|---|---|---|
| **ESRB** (North America) | E10+ or T (Teen) | Simulated gambling (gacha) may push to Teen |
| **PEGI** (Europe) | 12 | Simulated gambling descriptor |
| **USK** (Germany) | 6 | Mild fantasy violence, no explicit gambling for real money |
| **GRAC** (South Korea) | 12 | Simulated gambling elements |
| **ACB** (Australia) | PG | Mild themes, simulated gambling elements |
| **CERO** (Japan) | A (All Ages) or B (12+) | Gacha is common and generally accepted in Japanese market |

---

## Apple App Store Specific

### Age Rating Questionnaire Responses

- **Cartoon or Fantasy Violence:** Infrequent/Mild
- **Realistic Violence:** None
- **Sexual Content or Nudity:** None
- **Profanity or Crude Humor:** None
- **Mature/Suggestive Themes:** None
- **Alcohol, Tobacco, or Drug Use or References:** None
- **Simulated Gambling:** Infrequent/Mild
- **Horror/Fear Themes:** None
- **Medical/Treatment Information:** None
- **Contests:** None
- **Unrestricted Web Access:** None

**Expected App Store Rating:** 12+ (due to "Infrequent/Mild Simulated Gambling")

### Additional Apple Requirements

- Gacha/loot box odds must be disclosed before purchase (App Store Review Guideline 3.1.1)
- In-app purchase descriptions must clearly state what is being purchased
- Subscription terms must be clearly displayed

---

## Google Play Specific

### Content Rating Questionnaire

- Google Play uses the IARC system directly
- Answer all questions as documented above
- The gacha system will likely trigger the "Simulated Gambling" descriptor
- Expected Google Play rating: Rated for 12+ (PEGI 12 equivalent)

### Additional Google Requirements

- Randomized virtual item purchase odds must be disclosed (Google Play policy as of 2024)
- "Contains ads" and "In-app purchases" labels will be automatically applied
- Data safety section must accurately reflect all data collection

---

## Important Notes

1. **The gacha/loot box system is the primary rating driver.** Without it, the game would likely receive lower age ratings across all systems.
2. **Ratings may vary by region.** Some countries have stricter laws around loot boxes (Belgium banned paid loot boxes, Netherlands has restrictions). Monitor regulatory changes.
3. **Re-rating:** If game content changes significantly (adding chat, adding more violent enemies, changing monetization), the IARC questionnaire must be retaken.
4. **South Korea:** May require probability disclosure registration with the Game Rating and Administration Committee.
5. **China:** If the game launches in China, loot box odds disclosure is legally required and may need additional approval.

---

## Pre-Submission Checklist

- [ ] All content descriptors reviewed and accurate
- [ ] Gacha pull rates documented in-game (visible before purchase)
- [ ] Privacy policy URL ready for app store listings
- [ ] In-app purchase catalog finalized with accurate descriptions
- [ ] Data safety / App Privacy section prepared
- [ ] Screenshots and promotional materials do not misrepresent content
- [ ] Age gate implemented (see COPPA_COMPLIANCE_CHECKLIST.md)
