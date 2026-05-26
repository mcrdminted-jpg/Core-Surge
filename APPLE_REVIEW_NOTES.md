# Apple App Store Review Notes

## Core Surge: Endless Tower Defense

**Last Updated:** 2026-05-25
**App Name:** Core Surge: Endless Tower Defense
**Bundle ID:** com.mcrdminted.coresurge
**Version:** 1.0.0

---

## App Description

Core Surge is an idle/active tower defense game where the player defends a single central tower against waves of enemies. The game features permanent meta-progression between runs, collectible cards, tournament competition, and cosmetic skins.

---

## How to Test

### Basic Gameplay
1. Launch the app. You will see the Home screen with a "Battle" button.
2. Tap "Battle" to start a run. Enemies spawn from the edges and move toward your tower.
3. The tower auto-attacks. Use in-run cash (earned from kills) to buy temporary upgrades during battle.
4. The run ends when your Core HP reaches 0. You earn Scrap based on waves survived.
5. From the Home screen, tap the "Research" tab to spend Scrap on permanent upgrades.

### Card System
1. Tap the "Cards" tab to view your card collection.
2. Cards are pulled using gems (premium currency).
3. Tap "Pull Card" to spend gems and receive a random card.
4. Cards have 3 rarity tiers: Standard (78%), Prime (20%), Apex (2%).
5. Duplicate cards level up existing cards (levels 1-5).

### In-App Purchases
1. Tap the "Shop" tab to view available purchases.
2. Products available:
   - Starter Pack (one-time, consumable): Premium starter bundle with gems and cards
   - Small Gem Pack (consumable): Small gem currency pack
   - Medium Gem Pack (consumable): Medium gem currency pack
   - Monthly Vault (auto-renewable subscription): Daily gem delivery
3. All purchases are processed through RevenueCat SDK.
4. Gems are used to pull cards and unlock loadout slots.

### Demo Account
No demo account is required. The app works fully offline with local save data. Create a new account via Firebase Auth email/password, or play as a guest (anonymous auth).

---

## In-App Purchase Details

| Product | Type | Price Tier | Description |
|---------|------|-----------|-------------|
| starter_pack | Non-Consumable (one-time) | Tier 5 ($4.99) | One-time starter bundle |
| gem_small | Consumable | Tier 1 ($0.99) | Small gem pack |
| gem_medium | Consumable | Tier 3 ($2.99) | Medium gem pack |
| monthly_vault | Auto-Renewable Subscription | Tier 3 ($2.99/mo) | Daily gem delivery |

All IAP is optional. The game is fully playable without spending money. Gems accelerate progression but do not gate any content.

---

## Content & Ratings

- **Age Rating:** 13+ (fantasy violence, simulated gambling via card pulls with disclosed odds)
- **Violence:** Stylized, non-realistic combat (tower shoots geometric projectiles at abstract enemy sprites)
- **Gambling:** Card pull system with randomized rewards. All odds are disclosed in-game per Apple Guideline 3.1.1.
- **User-Generated Content:** None
- **Social Features:** Tournament leaderboards (display name only, no chat or messaging)
- **Ads:** Rewarded video ads (opt-in), banner ads in menus, interstitial ads between runs. No ads during gameplay.

---

## Third-Party Services

- **Firebase Auth:** Email/password and anonymous authentication
- **Firebase Firestore:** Cloud save data synchronization
- **Firebase Hosting:** Web version hosting
- **RevenueCat:** Cross-platform in-app purchase management
- **AdMob:** Advertising (rewarded, banner, interstitial)

---

## Privacy

- Privacy policy: Available at [app website URL]/privacy
- Data collected: Email (if registered), username, game progress, purchase history
- No data shared with third parties for advertising purposes
- Users can delete their account and all data from Settings
- COPPA compliant: Age gate at registration, under-13 users blocked from account creation

---

## Special Notes

- The app requires internet for cloud saves and tournaments but works offline for basic gameplay.
- The "loot box" card pull system has fully disclosed odds viewable before purchase (Settings > Loot Box Odds or in-game info button).
- Subscription (Monthly Vault) can be cancelled at any time through Apple subscription management. Daily gems stop upon cancellation at end of billing period.
