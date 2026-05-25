# Google Play Data Safety Section (Pre-Fill)

**Core Surge: Endless Tower Defense**
**Last Updated:** May 24, 2026
**Developer:** Andy (Andrew Evans Anglin)

Use this document to fill out Google Play Console > App content > Data safety.

---

## Overview Questions

**Does your app collect or share any of the required user data types?** Yes

**Is all of the user data collected by your app encrypted in transit?** Yes (all network communication uses HTTPS/TLS)

**Do you provide a way for users to request that their data is deleted?** Yes (in-game Settings > Delete Account)

---

## Data Collected

### Personal Info

| Data Type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|---|---|---|---|---|---|
| Email address | Yes | No | No | Optional | Account creation and management |

**Details:** Email is collected only if the player chooses to create an account. It is stored in Firebase Authentication. Not shared with third parties.

---

### App Activity

| Data Type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|---|---|---|---|---|---|
| App interactions | Yes | Yes (Firebase Analytics) | No | Required | Analytics, app functionality |

**Details:** Game events such as waves completed, cards pulled, purchases made, and feature usage are logged to Firebase Analytics for understanding player behavior and improving the game.

---

### App Info and Performance

| Data Type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|---|---|---|---|---|---|
| Crash logs | Yes | Yes (Firebase Crashlytics) | No | Required | App stability and bug fixing |
| Performance diagnostics | Yes | Yes (Firebase Performance) | No | Required | App performance monitoring |
| Other app performance data | Yes | Yes (Firebase Analytics) | No | Required | Analytics |

**Details:** Crash reports include stack traces, device model, OS version, and app version. No personally identifiable information is included in crash data.

---

### Device or Other IDs

| Data Type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|---|---|---|---|---|---|
| Device or other IDs | Yes | Yes (Firebase Analytics) | No | Required | Analytics, advertising |

**Details:** Firebase instance IDs and Android advertising ID (GAID) may be collected. GAID is shared with AdMob for ad serving.

---

### Financial Info

| Data Type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|---|---|---|---|---|---|
| Purchase history | Yes | No | No | Required | App functionality (entitlement management) |

**Details:** Purchase receipts are processed through RevenueCat for entitlement validation. Purchase data is not shared beyond what Google Play and RevenueCat require for payment processing.

---

### Identifiers

| Data Type | Collected? | Shared? | Ephemeral? | Required? | Purpose |
|---|---|---|---|---|---|
| User IDs | Yes | No | No | Required | App functionality, analytics |

**Details:** Firebase UID and in-game player ID are generated for each user. These are used internally and not shared with third parties.

---

## Data Shared

| Data Type | Shared With | Purpose |
|---|---|---|
| Advertising data (GAID, ad interactions) | Google AdMob | Ad serving and frequency capping |
| App interaction events | Firebase Analytics (Google) | Analytics |
| Crash logs | Firebase Crashlytics (Google) | App stability |
| Performance data | Firebase Performance (Google) | Performance monitoring |

---

## Data NOT Collected

- Location (precise or coarse)
- Contacts (name, phone, address, contacts list)
- Health and fitness
- Messages (emails, SMS, in-app messages)
- Photos and videos
- Audio (voice recordings, music files)
- Files and docs
- Calendar
- Web browsing history
- Search history

---

## Account Deletion

- **How to request:** In-game Settings > Account > Delete Account
- **What happens:** All personal data (email, username, save data, purchase entitlements) is deleted within 30 days
- **What is retained:** Anonymized, aggregated analytics data that cannot be linked back to the user
- **Alternative method:** Email support@coresurge.game with your account email or player ID

---

## Security Practices

- All data is encrypted in transit using HTTPS/TLS
- Firebase Firestore data is encrypted at rest by Google
- Authentication tokens are securely stored on-device
- The app follows Google Play's User Data policy
- Minimum age requirement: 13+
