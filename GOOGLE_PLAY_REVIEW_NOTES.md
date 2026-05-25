# Google Play Store Review Notes

## Core Surge: Endless Tower Defense

**Last Updated:** 2026-05-25
**Package Name:** com.mcrdminted.coresurge
**Version Code:** 1
**Version Name:** 1.0.0
**Target API:** 34 (Android 14)
**Min SDK:** 22 (Android 5.1)

---

## App Description

Core Surge is an idle/active tower defense game. Players defend a central tower against enemy waves, earn coins for permanent upgrades, collect cards for passive bonuses, and compete in tournaments. The game is free-to-play with optional in-app purchases.

---

## How to Test

### Core Gameplay
1. Open the app. The Home screen shows a "Battle" button.
2. Tap "Battle" to start. Enemies spawn and approach the tower.
3. The tower attacks automatically. Buy temporary upgrades with in-run cash.
4. When Core HP hits 0, the run ends. Coins are awarded based on waves survived.
5. Spend coins in the Research tab on permanent stat upgrades.

### Card System
1. Open the Cards tab. Spend gems to pull randomized cards.
2. Three rarity tiers: Standard (78%), Prime (20%), Apex (2%).
3. Odds are disclosed in-game before any pull.
4. Duplicate cards level up existing ones.

### In-App Purchases
1. Open the Shop tab.
2. Four products: Starter Pack ($4.99 one-time), Small Gems ($0.99), Medium Gems ($2.99), Monthly Vault ($2.99/month subscription).
3. All purchases handled via RevenueCat SDK integrated with Google Play Billing.
4. Gems buy card pulls and loadout slot unlocks. No gameplay is gated behind purchases.

### Account
Firebase Auth supports email/password registration or anonymous guest play. No account required to play.

---

## Content Rating (IARC)

- **Target Rating:** PEGI 12 / ESRB T (Teen)
- **Violence:** Cartoon/fantasy (abstract tower vs. geometric enemies, no blood/gore)
- **Simulated Gambling:** Card pull system with random outcomes. Odds fully disclosed.
- **Online Interaction:** Tournament leaderboards only. No chat, messaging, or user-generated content.
- **In-App Purchases:** Yes, clearly labeled.

---

## Data Safety

- **Data collected:** Email (optional), display name, game progress, purchase history
- **Data shared:** None shared with third parties for advertising or marketing
- **Data deletion:** Users can request account and data deletion from in-app Settings
- **Encryption:** Data encrypted in transit (HTTPS/TLS)
- **Details:** See GOOGLE_PLAY_DATA_SAFETY.md for full Data Safety questionnaire responses

---

## Ads Implementation

- **Ad SDK:** Google AdMob
- **Ad Types:** Rewarded video (opt-in), banner (menus only), interstitial (between runs)
- **Frequency Caps:** Maximum 1 interstitial per 3 minutes. No ads during active gameplay.
- **COPPA:** Child-directed treatment flag set for users who have not verified age 13+.

---

## Permissions Used

| Permission | Purpose |
|-----------|---------|
| INTERNET | Cloud saves, authentication, ads, leaderboards |
| ACCESS_NETWORK_STATE | Check connectivity before cloud operations |

No dangerous permissions requested. No camera, microphone, location, contacts, or storage access.

---

## Third-Party SDKs

- Firebase Auth (authentication)
- Firebase Firestore (cloud data)
- RevenueCat (billing)
- Google AdMob (advertising)
- Capacitor (native bridge)

---

## Testing Notes

- Works fully offline for core gameplay. Internet required for cloud saves, tournaments, and purchases.
- No special test accounts needed. Install and play.
- Loot box odds are viewable from the Cards tab info button and from Settings.
