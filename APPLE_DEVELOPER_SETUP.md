# Apple Developer Account Setup

## Core Surge: Endless Tower Defense

**Last Updated:** 2026-05-25

---

## Prerequisites

- Apple Developer Program membership ($99/year) - https://developer.apple.com/programs/
- Mac with Xcode installed (latest stable version)
- Apple ID with two-factor authentication enabled

---

## Step 1: App Registration

1. Sign in to App Store Connect (https://appstoreconnect.apple.com)
2. Go to My Apps > "+" > New App
3. Fill in:
   - Platform: iOS
   - Name: Core Surge: Endless Tower Defense
   - Primary Language: English (U.S.)
   - Bundle ID: com.mcrdminted.coresurge (must match capacitor.config.json)
   - SKU: coresurge-v1

---

## Step 2: Certificates

### Development Certificate
1. Open Xcode > Settings > Accounts > Manage Certificates
2. Click "+" > Apple Development
3. Xcode generates and installs automatically

### Distribution Certificate
1. Open Keychain Access > Certificate Assistant > Request a Certificate from a Certificate Authority
2. Save the CSR file
3. Go to developer.apple.com > Certificates > "+" > Apple Distribution
4. Upload the CSR, download the certificate, double-click to install

---

## Step 3: App ID

1. Go to developer.apple.com > Identifiers > "+"
2. Select App IDs > App
3. Description: Core Surge
4. Bundle ID: Explicit > com.mcrdminted.coresurge
5. Capabilities to enable:
   - Push Notifications (for future use)
   - In-App Purchase (required for IAP)
   - Sign in with Apple (if adding social login later)

---

## Step 4: Provisioning Profiles

### Development Profile
1. Go to Profiles > "+" > iOS App Development
2. Select App ID: com.mcrdminted.coresurge
3. Select development certificate
4. Select test devices
5. Name: CoreSurge Development
6. Download and double-click to install

### Distribution Profile
1. Go to Profiles > "+" > App Store Connect
2. Select App ID: com.mcrdminted.coresurge
3. Select distribution certificate
4. Name: CoreSurge App Store
5. Download and double-click to install

---

## Step 5: In-App Purchase Products

In App Store Connect > My Apps > Core Surge > In-App Purchases:

| Reference Name | Product ID | Type | Price Tier |
|---------------|-----------|------|-----------|
| Starter Pack | com.mcrdminted.coresurge.starter_pack | Non-Consumable | Tier 5 ($4.99) |
| Small Gem Pack | com.mcrdminted.coresurge.gem_small | Consumable | Tier 1 ($0.99) |
| Medium Gem Pack | com.mcrdminted.coresurge.gem_medium | Consumable | Tier 3 ($2.99) |
| Monthly Vault | com.mcrdminted.coresurge.monthly_vault | Auto-Renewable Sub | Tier 3 ($2.99/mo) |

Each product needs: display name, description, screenshot of in-game purchase UI, review notes.

---

## Step 6: App Store Listing

Fill in App Store Connect listing:
- Screenshots: See APP_STORE_SCREENSHOT_SPEC.md
- Description: See APPLE_STORE_DESCRIPTION.md
- Keywords: See APPLE_STORE_DESCRIPTION.md
- Promotional Text: See PROMO_TEXT.md
- What's New: See WHATS_NEW_TEXT.md
- App Icon: 1024x1024 PNG, no transparency, no rounded corners (Apple applies rounding)
- Category: Games > Strategy
- Age Rating: Complete IARC questionnaire (see IARC_QUESTIONNAIRE_PREP.md)
- Privacy Policy URL: Required before submission
- Review Notes: See APPLE_REVIEW_NOTES.md

---

## Step 7: RevenueCat Configuration

1. In RevenueCat dashboard, create iOS app
2. Enter Bundle ID: com.mcrdminted.coresurge
3. Upload App Store Connect API key (App Store Connect > Users > Keys > In-App Purchase)
4. Map product IDs to RevenueCat entitlements
5. Set up Shared Secret (App Store Connect > General > Shared Secret)

---

## Step 8: Build & Submit

1. In Xcode, open ios/App/App.xcworkspace
2. Set signing team and provisioning profile
3. Set version to 1.0.0, build number to 1
4. Product > Archive
5. Distribute App > App Store Connect > Upload
6. In App Store Connect, select the build, attach to the app version
7. Submit for Review

---

## Checklist Before Submission

- [ ] Bundle ID matches capacitor.config.json
- [ ] All IAP products created and in "Ready to Submit" state
- [ ] Screenshots uploaded for all required device sizes
- [ ] Privacy Policy URL is live and accessible
- [ ] App Review Notes filled in
- [ ] IARC age rating questionnaire completed
- [ ] Loot box odds disclosure implemented in-app
- [ ] App icon uploaded (1024x1024)
- [ ] Test on physical iPhone and iPad before submitting
