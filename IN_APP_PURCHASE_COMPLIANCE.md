# In-App Purchase Compliance

**Core Surge: Endless Tower Defense**

**Last Updated:** May 24, 2026

This document tracks compliance with Apple App Store and Google Play Store in-app purchase policies. Core Surge uses RevenueCat as a billing abstraction layer, which wraps both Apple IAP and Google Play Billing.

---

## 1. Apple App Store Review Guidelines (Section 3.1)

### 3.1.1 In-App Purchase

**Requirement:** All digital goods and services must use Apple's In-App Purchase system.

**Status: COMPLIANT**

All digital goods are purchased through RevenueCat, which wraps Apple's StoreKit IAP. No external payment links, buttons, or mechanisms exist in the app. The `beginStorePurchase()` function in `monetization.js` calls `plugin.purchaseStoreProduct()`, which invokes the native Apple payment sheet.

### 3.1.1(a) Consumables

**Requirement:** Consumable IAPs can be re-purchased and are used up during gameplay.

**Status: COMPLIANT**

- `gem_pack_small` (750 gems, $2.99) -- consumable, re-purchasable
- `gem_pack_medium` (2800 gems, $9.99) -- consumable, re-purchasable

Gems are consumed through card pulls (20 gems each), slot unlocks, and other in-game spending. The receipt ledger tracks individual transactions to prevent duplicate grants from the same transaction, while allowing re-purchase.

### 3.1.1(b) Non-Consumables

**Requirement:** Non-consumable purchases are bought once and do not expire. Must be restorable.

**Status: COMPLIANT**

- `starter_pack` (250 gems + 2500 coins + 1 card, $0.99) -- one-time purchase

The starter pack uses RevenueCat's `$rc_lifetime` package type. The `productOwnershipLedgerKey()` function prevents duplicate grants. The `restoreStorePurchases()` function calls `plugin.restorePurchases()` and `grantRestoredPermanentProducts()` to restore the starter pack on new devices.

Note: The starter pack grants consumable rewards (gems, coins) as a one-time bonus plus a permanent card unlock. The one-time nature is enforced by the receipt ledger and RevenueCat entitlement tracking.

### 3.1.2 Subscriptions

**Requirement:** Auto-renewable subscriptions must follow Apple's subscription guidelines, including clear pricing, billing frequency, and cancellation instructions.

**Status: COMPLIANT with gaps**

- `monthly_vault` ($9.99/month) -- auto-renewable subscription via RevenueCat `$rc_monthly`

Compliance:
- Pricing is displayed via `displayStorePrice()` which shows the localized store price
- Billing period is monthly, handled by Apple's subscription infrastructure
- Cancellation is managed through Apple's subscription management page
- Entitlement checking via `syncEntitlementsFromCustomerInfo()` correctly detects subscription lapse

**Gap:** No "Manage Subscription" deep link in the app (see Section 4).

### 3.1.3 Loot Boxes / Randomized Rewards

**Requirement:** Apps offering loot boxes or randomized virtual items must disclose the odds of each category of item before purchase.

**Status: COMPLIANT**

Full probability disclosure is documented in `LOOT_BOX_DISCLOSURE.md` and displayed in-game in the Card Pull shop screen before any purchase:
- Standard tier: 78% (12 cards, 6.50% each)
- Prime tier: 20% (8 cards, 2.50% each)
- Apex tier: 2% (5 cards, 0.40% each)

No hidden modifiers, pity systems, or time-based probability adjustments. Each pull is statistically independent.

### 3.1.7 No External Payment Links

**Requirement:** Apps must not include buttons, external links, or other calls to action that direct customers to purchasing mechanisms other than IAP.

**Status: COMPLIANT**

The web version of the game shows an informational notice stating that purchases are only available in native builds. No links to external payment pages, no web checkout, no alternative payment methods are offered or referenced. The `beginStorePurchase()` function blocks entirely on web with a descriptive notice.

---

## 2. Google Play Billing Policy

### Digital Goods Must Use Google Play Billing

**Requirement:** All in-app purchases of digital goods must use Google Play's billing system.

**Status: COMPLIANT**

RevenueCat wraps Google Play Billing Library. All purchase calls go through `plugin.purchaseStoreProduct()` which invokes the Google Play purchase flow. Product IDs are mapped in `data.js`:
- `com.coresurge.starterpack`
- `com.coresurge.gems.small`
- `com.coresurge.gems.medium`
- `com.coresurge.monthlyvault`

### Subscription Transparency

**Requirement:** Clear pricing, billing period, and cancellation instructions must be provided.

**Status: COMPLIANT**

- Prices are displayed from Google Play's localized pricing via RevenueCat
- Monthly Vault is labeled `$9.99/mo` with "Monthly pass" description
- ToS Section 5.4 describes cancellation process and 24-hour advance cancellation requirement

### Loot Box Odds Disclosure

**Requirement:** Apps with randomized virtual items must disclose odds prominently.

**Status: COMPLIANT**

Same disclosure as Apple (see Section 1, 3.1.3 above). Odds are shown in-game before purchase and documented in `LOOT_BOX_DISCLOSURE.md`.

### No Misleading Purchase Prompts

**Requirement:** Purchase flows must not be deceptive or misleading.

**Status: COMPLIANT**

- Store product prices are pulled from Google Play and displayed accurately via `displayStorePrice()`
- Product descriptions clearly state what the player receives
- Purchase confirmation is handled by the native Google Play purchase dialog
- `googleIsPersonalizedPrice: false` is explicitly set in the purchase call, indicating no personalized pricing

---

## 3. Cross-Platform Considerations

### Receipt Validation

RevenueCat handles server-side receipt validation for both Apple and Google. The app does not perform local receipt validation. RevenueCat verifies receipts with Apple/Google servers and provides validated `customerInfo` objects.

### Gem Balance Portability

Gem balances are stored in the cloud save (Firestore `player_saves` collection) and are platform-independent. A player who purchases gems on iOS and signs into the same account on Android will see the same gem balance.

**Note:** This is standard for cross-platform games but worth noting: Apple and Google each take their platform commission on their respective purchases. Cross-platform gem balance does not allow bypassing either platform's billing.

### Subscription Status

Subscription status is checked via RevenueCat entitlements. `syncEntitlementsFromCustomerInfo()` reads `customerInfo.entitlements.active` and sets `save.monthlyVaultActive` accordingly. This works cross-platform -- a subscription purchased on iOS is recognized on Android and vice versa, as long as the same RevenueCat app user ID is used.

### Restore Purchases

`restoreStorePurchases()` calls `plugin.restorePurchases()` which queries the platform's purchase history. This restores:
- Starter pack ownership (via `grantRestoredPermanentProducts()`)
- Active subscription entitlements (via `syncEntitlementsFromCustomerInfo()`)

Consumable gem pack purchases are not restored (they are consumed at time of purchase), which is correct behavior.

---

## 4. Compliance Gaps to Address

### 4.1 "Restore Purchases" Button Placement (Apple Requirement)

**Status: NEEDS WORK**

Apple requires a clearly accessible "Restore Purchases" button. The `restoreStorePurchases()` function exists in `monetization.js`, but the button must be prominently placed in the store or settings UI. Verify that the button is visible without excessive scrolling and clearly labeled.

### 4.2 Subscription Management Link (Apple Requirement)

**Status: NOT IMPLEMENTED**

Apple App Store Review Guideline 3.1.2 requires apps with auto-renewable subscriptions to include a link to the subscription management page. Implement a "Manage Subscription" button in Settings that opens:
- iOS: `https://apps.apple.com/account/subscriptions`
- Android: `https://play.google.com/store/account/subscriptions`

### 4.3 Clear Pricing Display Before Purchase

**Status: IMPLEMENTED but verify**

`displayStorePrice()` shows localized store pricing when available, falling back to the catalog `priceLabel` string. Verify that:
- The price is visible on the product card before the player taps "Buy"
- Subscription pricing includes the billing period (e.g., "$9.99/month")
- The 10x card pull bundle discount (180 gems vs. 200 gems for 10 singles) is clearly communicated

### 4.4 "Manage Subscription" Deep Link

**Status: NOT IMPLEMENTED**

Add a deep link in Settings that opens the platform's subscription management page. This allows players to view their subscription status, change payment method, or cancel directly from the app.

Implementation approach:
```javascript
function openSubscriptionManagement() {
  const platform = detectMonetizationPlatform();
  if (platform === 'ios') {
    window.open('https://apps.apple.com/account/subscriptions');
  } else if (platform === 'android') {
    window.open('https://play.google.com/store/account/subscriptions');
  }
}
```

---

## 5. Compliance Checklist

| Requirement | Apple | Google | Status |
|------------|-------|--------|--------|
| All digital goods use platform billing | YES | YES | COMPLIANT |
| Consumable IAPs re-purchasable | YES | YES | COMPLIANT |
| Non-consumable IAPs restorable | YES | YES | COMPLIANT |
| Subscription auto-renewal via platform | YES | YES | COMPLIANT |
| Loot box odds disclosed before purchase | YES | YES | COMPLIANT |
| No external payment links | YES | YES | COMPLIANT |
| No misleading purchase prompts | YES | YES | COMPLIANT |
| Restore Purchases button prominently placed | -- | -- | VERIFY |
| Manage Subscription link in Settings | -- | -- | NOT IMPLEMENTED |
| Clear pricing display before confirmation | YES | YES | VERIFY |
| No personalized pricing without disclosure | YES | YES | COMPLIANT (`googleIsPersonalizedPrice: false`) |

---

*This compliance document was last updated on May 24, 2026.*
