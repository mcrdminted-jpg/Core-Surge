# Apple App Store Privacy Questionnaire (Pre-Fill)

**Core Surge: Endless Tower Defense**
**Last Updated:** May 24, 2026
**Developer:** Andy (Andrew Evans Anglin)

Use this document to fill out App Store Connect > App Privacy > Data Collection.

---

## Do you or your third-party partners collect data from this app?

**Yes**

---

## Data Types Collected

### 1. Contact Info

| Data Type | Collected? | Linked to User? | Used for Tracking? | Purpose |
|---|---|---|---|---|
| Email Address | Yes | Yes | No | App Functionality (account registration, optional) |

### 2. Identifiers

| Data Type | Collected? | Linked to User? | Used for Tracking? | Purpose |
|---|---|---|---|---|
| User ID | Yes | Yes | No | App Functionality, Analytics (Firebase UID) |
| Device ID | Yes | No | No | Analytics (IDFV for Firebase Analytics) |

### 3. Usage Data

| Data Type | Collected? | Linked to User? | Used for Tracking? | Purpose |
|---|---|---|---|---|
| Product Interaction | Yes | Yes | No | Analytics, App Functionality (waves played, cards pulled, purchases, feature usage) |
| Advertising Data | Yes (via AdMob) | No | No | Third-Party Advertising (ad impressions, clicks, interactions) |

### 4. Purchases

| Data Type | Collected? | Linked to User? | Used for Tracking? | Purpose |
|---|---|---|---|---|
| Purchase History | Yes | Yes | No | App Functionality (RevenueCat entitlements, receipt validation) |

### 5. Diagnostics

| Data Type | Collected? | Linked to User? | Used for Tracking? | Purpose |
|---|---|---|---|---|
| Crash Data | Yes | No | No | Analytics (Firebase Crashlytics -- stack traces, device state) |
| Performance Data | Yes | No | No | Analytics (Firebase Performance -- load times, network latency) |

---

## Data NOT Collected

The following data types are NOT collected by Core Surge or any of its third-party SDKs as configured:

- Health and Fitness
- Financial Info (payment info is handled entirely by Apple; we never see card numbers)
- Location (precise or coarse)
- Contacts
- Browsing History
- Search History
- Sensitive Info
- Photos or Videos
- Audio
- Gameplay Content (we do not upload user-generated content)
- Customer Support (no support chat data collected in-app)
- Physical Address
- Phone Number
- Other User Content

---

## Tracking Declaration

**Does this app track users?** No

Core Surge does not track users across apps or websites owned by other companies for the purposes of advertising or advertising measurement. We do not use IDFA for cross-app tracking.

---

## Notes for App Review

- Email is optional -- players can play without creating an account
- Firebase Analytics uses IDFV (not IDFA) and does not link analytics data to user identity
- AdMob serves ads but Core Surge does not pass user identifiers to AdMob for cross-app tracking
- All data transmission uses HTTPS encryption
- Users aged 13+ per our terms of service
