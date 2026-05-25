# Google Play Developer Account Setup

## Core Surge: Endless Tower Defense

**Last Updated:** 2026-05-25

---

## Prerequisites

- Google Play Developer account ($25 one-time fee) - https://play.google.com/console
- Android Studio installed
- Java/JDK installed (for signing)

---

## Step 1: Create App in Play Console

1. Sign in to Google Play Console (https://play.google.com/console)
2. All apps > Create app
3. Fill in:
   - App name: Core Surge: Endless Tower Defense
   - Default language: English (United States)
   - App or game: Game
   - Free or paid: Free
4. Accept Developer Program Policies and US export laws

---

## Step 2: App Signing

### Upload Key (your key)
1. Generate a keystore:
   ```
   keytool -genkey -v -keystore coresurge-upload.keystore -alias coresurge -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Store the keystore file and password securely (NEVER commit to version control)
3. Record the key alias and passwords

### Google Play App Signing
- Google manages the app signing key
- You sign with the upload key, Google re-signs with the app signing key
- Enroll in Play App Signing during first upload (recommended, cannot be undone)

---

## Step 3: Configure App Details

### Store Listing
- Short description (80 chars): See GOOGLE_PLAY_DESCRIPTION.md
- Full description (4000 chars): See GOOGLE_PLAY_DESCRIPTION.md
- Screenshots: See APP_STORE_SCREENSHOT_SPEC.md (Android section)
- Feature graphic: 1024x500 PNG (see FEATURE_GRAPHIC_SPEC.md)
- App icon: 512x512 PNG, 32-bit with alpha
- Category: Game > Strategy
- Tags: tower defense, idle, incremental, offline

### Content Rating
- Complete IARC questionnaire (see IARC_QUESTIONNAIRE_PREP.md)
- Expected rating: PEGI 12 / ESRB T (Teen)

### Data Safety
- Fill in per GOOGLE_PLAY_DATA_SAFETY.md

### Privacy Policy
- Enter privacy policy URL (required)

---

## Step 4: Target API & SDK Versions

| Setting | Value |
|---------|-------|
| Target SDK | 34 (Android 14) - Google Play requirement |
| Min SDK | 22 (Android 5.1) - Capacitor default |
| Compile SDK | 34 |
| Package Name | com.mcrdminted.coresurge |

Update in android/app/build.gradle if needed.

---

## Step 5: In-App Purchase Products

In Play Console > Monetize > Products > In-app products:

| Product ID | Type | Price |
|-----------|------|-------|
| gem_small | Managed (consumable) | $0.99 |
| gem_medium | Managed (consumable) | $2.99 |
| starter_pack | Managed (one-time) | $4.99 |

In Play Console > Monetize > Products > Subscriptions:

| Product ID | Billing Period | Price |
|-----------|---------------|-------|
| monthly_vault | Monthly | $2.99/month |

---

## Step 6: RevenueCat Configuration

1. In RevenueCat dashboard, create Android app
2. Enter Package Name: com.mcrdminted.coresurge
3. Create a Google Play service account with financial permissions
4. Upload service account JSON key to RevenueCat
5. Map product IDs to RevenueCat entitlements (same as iOS)

---

## Step 7: Build & Upload

### Generate Signed APK/AAB
1. Open Android Studio, load android/ project
2. Build > Generate Signed Bundle/APK
3. Select Android App Bundle (AAB) - required by Google Play
4. Select upload keystore, enter passwords
5. Build release AAB

### Or via command line:
```
cd android
./gradlew bundleRelease
```

### Upload to Play Console
1. Go to Release > Production > Create new release
2. Upload the AAB file
3. Add release notes (see WHATS_NEW_TEXT.md)
4. Review and roll out

---

## Step 8: Testing Tracks

Before production release, use testing tracks:

| Track | Purpose | Audience |
|-------|---------|----------|
| Internal testing | Developer testing | Up to 100 testers, no review needed |
| Closed testing | Beta testers | Invited testers, brief review |
| Open testing | Public beta | Anyone can join, full review |
| Production | Live release | All users, full review |

Recommended flow: Internal > Closed beta (1-2 weeks) > Production

---

## Checklist Before Submission

- [ ] Package name matches capacitor.config.json
- [ ] Target API level 34+
- [ ] AAB signed with upload key
- [ ] All IAP products created and activated
- [ ] Screenshots uploaded for phone and tablet
- [ ] Feature graphic uploaded (1024x500)
- [ ] Data safety section completed
- [ ] Content rating questionnaire completed
- [ ] Privacy policy URL is live
- [ ] Store listing fully filled in
- [ ] Tested on physical Android device
- [ ] App does not request unnecessary permissions
- [ ] Ads comply with Google Play Families policy (if applicable)
