# Core Surge - Environment Variables & Config

## Firebase Web Config (Client-Side)

Used in `js/cloud.js` for client Firebase SDK initialization.

| Key | Value | Status |
|-----|-------|--------|
| apiKey | (empty string) | MISSING - must retrieve from Firebase Console |
| authDomain | core-surge---tower-defense.firebaseapp.com | Found |
| projectId | core-surge---tower-defense | Found |
| storageBucket | core-surge---tower-defense.firebasestorage.app | Found |
| messagingSenderId | 807853948092 | Found |
| appId | (empty string) | MISSING - must retrieve from Firebase Console |

### How to Get Missing Values

1. Go to Firebase Console > Project Settings > General
2. Under "Your apps" find the web app config
3. Copy `apiKey` and `appId` values

## Firebase Service Account (Server-Side)

Used for backend/admin SDK operations.

| Key | Value | Status |
|-----|-------|--------|
| project_id | core-surge---tower-defense | Found |
| private_key_id | e2e9830cd4... | Found (partial) |
| client_email | firebase-adminsdk-fbsvc@core-surge---tower-defense.iam.gserviceaccount.com | Found |
| private_key | (full key in service account JSON) | Found |

## RevenueCat (In-App Purchases)

| Key | Platform | Status |
|-----|----------|--------|
| Public SDK Key | iOS | Placeholder - not configured |
| Public SDK Key | Android | Placeholder - not configured |

### Setup Required

1. Create app in RevenueCat dashboard
2. Connect App Store / Play Store
3. Configure products matching IAP product IDs
4. Get public API keys for each platform

## AdMob (Ads)

| Key | Platform | Status |
|-----|----------|--------|
| App ID | iOS | Not created |
| App ID | Android | Not created |
| Ad Unit IDs | Both | Not created |

### Setup Required

1. Create AdMob account/app
2. Create ad units (interstitial, rewarded, banner as needed)
3. Add app IDs to native configs
4. Add ad unit IDs to game code

## Backend .env File

```env
FIREBASE_PROJECT_ID=core-surge---tower-defense
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@core-surge---tower-defense.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Apple Developer

| Key | Value | Status |
|-----|-------|--------|
| Team ID | TBD | Need Apple Developer account |
| Bundle ID | com.mcrdminted.coresurge | Defined |
| Signing Certificate | TBD | Need to generate |

## Google Play

| Key | Value | Status |
|-----|-------|--------|
| Package Name | com.mcrdminted.coresurge | Defined |
| Signing Key | TBD | Generated on first upload or use Play App Signing |

## Priority Actions

1. **Immediate**: Get Firebase apiKey and appId from console - cloud features are broken without these
2. **Before monetization**: Set up RevenueCat with real keys
3. **Before ads**: Create AdMob account and ad units
4. **Before store submission**: Apple Developer enrollment + signing, Google Play Console setup
