# Terms of Service Review

**Reviewed:** May 24, 2026
**ToS File:** `TERMS_OF_SERVICE.md`
**Implementation File:** `js/monetization.js`
**Product Catalog:** `js/data.js` (STORE_PRODUCT_CATALOG)
**Status:** GENERALLY ALIGNED -- minor gaps between ToS and implementation

---

## 1. Product Catalog: ToS vs. Implementation

### 1.1 Products Defined in Code (data.js)

| Product ID | Title | Price | Type | Rewards |
|-----------|-------|-------|------|---------|
| `starter_pack` | Starter Pack | $0.99 | One-time (lifetime) | 250 gems, 2500 Scrap, 1 card (Heavy Caliber) |
| `gem_pack_small` | Gem Pack Small | $2.99 | Consumable | 750 gems |
| `gem_pack_medium` | Gem Pack Medium | $9.99 | Consumable | 2800 gems |
| `monthly_vault` | Monthly Vault | $9.99/mo | Subscription (monthly) | 500 gems/month + monthly pass access |

### 1.2 ToS Coverage Check

| ToS Claim | Matches Code? | Notes |
|-----------|--------------|-------|
| Section 5.1: Gems can be purchased with real money | YES | gem_pack_small and gem_pack_medium are consumable gem products |
| Section 5.1: Gems used for card pulls, slot unlocks, in-game items | YES | Consistent with game mechanics in data.js |
| Section 5.2: No real-world value, licensed not sold | YES | No mechanism for converting gems back to money |
| Section 5.3: All purchases final and non-refundable | PARTIALLY | monetization.js does not handle refund revocation (see Section 3 below) |
| Section 5.4: Subscriptions auto-renew | YES | monthly_vault uses RevenueCat `$rc_monthly` package type |
| Section 5.4: Cancel 24 hours before billing period ends | YES | Standard Apple/Google subscription behavior, enforced by platform |
| Section 5.4: Manage via device app store settings | YES | RevenueCat delegates subscription management to platform |
| Section 5.5: Price changes don't affect completed purchases | YES | Prices are set in App Store Connect / Google Play Console |

---

## 2. Purchase Flow: ToS vs. Implementation

### 2.1 How Purchases Actually Work (monetization.js)

1. Player taps a product in the store UI
2. `beginStorePurchase(productId)` is called
3. Function checks: is this a native build? Is RevenueCat configured? Is the store product loaded?
4. Calls `plugin.purchaseStoreProduct()` which opens the native Apple/Google payment sheet
5. On success: `deliverPurchaseRewards()` grants gems/coins/cards locally
6. Receipt is recorded in the local ledger (`MONETIZATION_RECEIPT_LEDGER_KEY` in localStorage)
7. Save is persisted and cloud synced

### 2.2 ToS Alignment

| ToS Requirement | Implementation | Status |
|----------------|---------------|--------|
| Purchase uses platform billing | Yes, RevenueCat wraps Apple IAP / Google Play Billing | ALIGNED |
| User sees price before purchase | Yes, `displayStorePrice()` shows localized store price | ALIGNED |
| Purchase confirmation is via native platform dialog | Yes, `purchaseStoreProduct()` triggers native payment sheet | ALIGNED |
| Web users cannot purchase | Yes, `beginStorePurchase()` blocks on web with an informational notice | ALIGNED |

---

## 3. Refund Handling

### 3.1 ToS Claim

Section 5.3 directs refund requests to Apple/Google support links. The ToS states all purchases are final and non-refundable except as required by law.

### 3.2 Implementation Check

- **Receipt tracking:** monetization.js maintains a local receipt ledger in localStorage with transaction IDs and timestamps
- **Refund detection:** NOT IMPLEMENTED. monetization.js does not check for revoked purchases or refunded transactions
- **Reward revocation on refund:** NOT IMPLEMENTED. If Apple or Google processes a refund, the gems/items already granted locally are not revoked
- **RevenueCat webhook for refunds:** NOT CONFIGURED. RevenueCat can send server-side refund notifications, but no Cloud Functions or backend webhook handler exists

**Gap: MEDIUM.** The ToS implies purchases are tracked and managed, but if a player gets a refund through Apple/Google, the granted gems remain in their account. This is exploitable. RevenueCat does track refunds via `customerInfo`, and `syncEntitlementsFromCustomerInfo()` syncs subscription status, but consumable gem grants are not reversible through the current code.

### 3.3 Mitigation

- For **subscriptions** (monthly_vault): `syncEntitlementsFromCustomerInfo()` correctly checks active entitlements on each app launch, so a cancelled/refunded subscription will lose access. This is WORKING.
- For **consumables** (gem packs): Once gems are granted by `grantProductRewardsLocally()`, there is no reversal mechanism. This is a GAP.
- For **starter_pack**: The ownership ledger prevents re-granting on restore, but does not revoke on refund. This is a GAP.

---

## 4. Subscription Management

### 4.1 ToS Claim

Section 5.4 describes auto-renewal, cancellation, and management through device settings.

### 4.2 Implementation Check

| Feature | Implemented? | Details |
|---------|-------------|---------|
| Auto-renewal | YES | RevenueCat `$rc_monthly` handles this via platform |
| Cancellation via app store settings | YES (platform-level) | No in-app cancellation needed; handled by Apple/Google |
| Subscription status check | YES | `syncEntitlementsFromCustomerInfo()` checks `customerInfo.entitlements.active` |
| monthly_vault entitlement sync | YES | If subscription lapses, `save.monthlyVaultActive` is set to false |
| In-app "Manage Subscription" link | NOT IMPLEMENTED | No deep link to App Store/Play Store subscription settings |

**Gap: MINOR.** Apple requires a "Manage Subscription" link within the app (App Store Review Guideline 3.1.2). This link should open the platform's subscription management page. Currently not present in the UI.

---

## 5. Web Fallback

### 5.1 ToS Coverage

The ToS does not explicitly mention web-only access. Section 5 discusses purchases but does not clarify that purchases are unavailable on web.

### 5.2 Implementation

monetization.js handles web gracefully:
- `detectMonetizationPlatform()` returns `'web'` when Capacitor is not present
- `beginStorePurchase()` shows an informational notice directing users to native apps
- No payment flow is initiated on web
- The store UI displays products with a "Native build only" label

**Gap: MINOR.** The ToS should mention that in-app purchases are only available through the Apple App Store and Google Play Store apps, not the web version.

---

## 6. PLANNED vs. IMPLEMENTED Features

| Feature | Status in Code |
|---------|---------------|
| Store product purchase flow | IMPLEMENTED (native only) |
| Consumable gem purchases | IMPLEMENTED |
| One-time starter pack | IMPLEMENTED |
| Monthly subscription | IMPLEMENTED |
| Restore Purchases | IMPLEMENTED (`restoreStorePurchases()`) |
| Receipt ledger / duplicate prevention | IMPLEMENTED |
| Entitlement sync from RevenueCat | IMPLEMENTED |
| Refund revocation for consumables | NOT IMPLEMENTED |
| Manage Subscription deep link | NOT IMPLEMENTED |
| Web-based purchasing | NOT IMPLEMENTED (by design) |
| Server-side receipt validation | NOT IMPLEMENTED (RevenueCat handles this) |

---

## 7. Summary of Gaps

| # | Gap | Severity | Action Required |
|---|-----|----------|----------------|
| 1 | Refund revocation for consumable purchases not implemented | MEDIUM | Consider server-side tracking via RevenueCat webhooks, or accept the risk for now given small scale |
| 2 | No "Manage Subscription" deep link in app | MEDIUM | Required by Apple for apps with auto-renewable subscriptions; add link in Settings |
| 3 | ToS does not clarify web vs. native purchase availability | MINOR | Add a note that purchases require the native App Store or Play Store app |
| 4 | Starter pack refund does not revoke granted items | LOW | Starter pack value ($0.99) makes this low risk, but should be addressed at scale |

---

## 8. Recommendations

1. **Before app store submission:** Add a "Manage Subscription" link in Settings that opens the platform subscription management page (Apple: `itms-apps://apps.apple.com/account/subscriptions`, Android: `https://play.google.com/store/account/subscriptions`).
2. **Post-launch priority:** Set up a RevenueCat webhook endpoint to detect refunded consumable purchases and flag affected accounts.
3. **ToS update:** Add a brief note to Section 5 that in-app purchases are processed exclusively through Apple IAP or Google Play Billing and are not available on the web version.

---

*This review was conducted on May 24, 2026.*
