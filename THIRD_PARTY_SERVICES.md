# Third-Party Services

**Core Surge: Endless Tower Defense**
**Last Updated:** May 24, 2026
**Developer:** Andy (Andrew Evans Anglin)

This document lists every external service integrated into Core Surge and the data each service receives.

---

## 1. Firebase Authentication

| Detail | Value |
|---|---|
| **Company** | Google LLC |
| **Purpose** | User account creation and sign-in |
| **Data received** | Email address, password hash (managed entirely by Firebase; we never access raw passwords), Firebase UID, account creation timestamp, last sign-in timestamp, sign-in method (email/password, anonymous, or future social providers) |
| **Data processing location** | United States (Google Cloud) |
| **Privacy policy** | https://firebase.google.com/support/privacy |
| **GDPR DPA** | Covered under Google Cloud Data Processing Addendum (https://cloud.google.com/terms/data-processing-addendum) |

---

## 2. Firebase Cloud Firestore

| Detail | Value |
|---|---|
| **Company** | Google LLC |
| **Purpose** | Cloud database for game data storage and sync |
| **Data received** | Username (player-chosen display name), play statistics (waves completed, cards owned, deck configurations, tournament scores), save data (full game state), tournament entries and results, purchase receipt references (for entitlement verification) |
| **Encryption** | All data encrypted at rest by Google (AES-256) and in transit (TLS) |
| **Data processing location** | United States (Google Cloud, configurable region) |
| **Privacy policy** | https://firebase.google.com/support/privacy |
| **GDPR DPA** | Covered under Google Cloud Data Processing Addendum |

---

## 3. Firebase Analytics

| Detail | Value |
|---|---|
| **Company** | Google LLC |
| **Purpose** | Understanding player behavior, game balance, feature usage |
| **Data received** | Anonymized event data (session_start, battle_end, card_pull, purchase_complete, menu_navigation), device type and model, operating system and version, app version, country (derived from IP address; IP is not stored), screen resolution, language |
| **Data processing location** | United States (Google Cloud) |
| **Privacy policy** | https://policies.google.com/privacy |
| **GDPR DPA** | Covered under Google Cloud Data Processing Addendum |
| **Note** | Events are aggregated and anonymized. No PII is intentionally logged in event parameters. |

---

## 4. Firebase Crashlytics

| Detail | Value |
|---|---|
| **Company** | Google LLC |
| **Purpose** | Crash reporting and stability monitoring |
| **Data received** | Crash stack traces, device model, operating system version, app version, available memory, available disk space, device orientation, battery state, Crashlytics installation UUID (not linked to user identity) |
| **Data processing location** | United States (Google Cloud) |
| **Privacy policy** | https://firebase.google.com/support/privacy |
| **GDPR DPA** | Covered under Google Cloud Data Processing Addendum |
| **Note** | No PII is collected. Crashlytics UUID is device-scoped and not linked to Firebase UID. |

---

## 5. Firebase Performance Monitoring

| Detail | Value |
|---|---|
| **Company** | Google LLC |
| **Purpose** | Monitoring app load times, network request latency, rendering performance |
| **Data received** | App startup time, screen rendering traces, network request URLs and response times (no request/response bodies), device model, OS version, app version, country (IP-derived, not stored) |
| **Data processing location** | United States (Google Cloud) |
| **Privacy policy** | https://firebase.google.com/support/privacy |
| **GDPR DPA** | Covered under Google Cloud Data Processing Addendum |

---

## 6. Firebase Cloud Messaging (FCM)

| Detail | Value |
|---|---|
| **Company** | Google LLC |
| **Purpose** | Push notifications (not yet implemented; SDK included for future use) |
| **Data received** | FCM device registration token, platform (iOS/Android/web), app version |
| **Data processing location** | United States (Google Cloud) |
| **Privacy policy** | https://firebase.google.com/support/privacy |
| **GDPR DPA** | Covered under Google Cloud Data Processing Addendum |
| **Note** | Not currently active. No push notifications are sent at this time. |

---

## 7. RevenueCat

| Detail | Value |
|---|---|
| **Company** | RevenueCat, Inc. |
| **Purpose** | In-app purchase management, subscription handling, entitlement delivery |
| **Data received** | Apple App Store / Google Play purchase receipts, entitlement status (which premium items/content the player owns), subscriber attributes (email if provided, custom attributes), app user ID (mapped to Firebase UID), device ID, platform, app version, country |
| **Data processing location** | United States (AWS) |
| **Privacy policy** | https://www.revenuecat.com/privacy |
| **GDPR DPA** | Available upon request from RevenueCat (https://www.revenuecat.com/dpa) |
| **Note** | RevenueCat never sees raw credit card data; all payment processing is handled by Apple/Google. |

---

## 8. Google AdMob

| Detail | Value |
|---|---|
| **Company** | Google LLC |
| **Purpose** | Serving in-game advertisements (rewarded video ads, interstitial ads) |
| **Data received** | IDFA (iOS, with ATT consent) or GAID (Android advertising ID), device information (model, OS version, screen size), ad interaction data (impressions, clicks, video completions), IP address (used for geographic targeting, not stored long-term), app version |
| **Data processing location** | United States and global (Google's ad network) |
| **Privacy policy** | https://policies.google.com/privacy |
| **Ad personalization controls** | https://adssettings.google.com |
| **GDPR DPA** | Covered under Google Ads Data Processing Terms (https://privacy.google.com/businesses/processorterms/) |
| **Note** | In EU/EEA/UK, the Google UMP SDK collects consent before serving personalized ads. Non-personalized ads are served if consent is declined. |

---

## Summary Table

| Service | Company | PII Collected? | Data Shared? | GDPR DPA? |
|---|---|---|---|---|
| Firebase Auth | Google LLC | Yes (email) | No | Yes |
| Cloud Firestore | Google LLC | Yes (username, play data) | No | Yes |
| Firebase Analytics | Google LLC | No (anonymized) | No | Yes |
| Firebase Crashlytics | Google LLC | No | No | Yes |
| Firebase Performance | Google LLC | No | No | Yes |
| Firebase Cloud Messaging | Google LLC | No (device token only) | No | Yes |
| RevenueCat | RevenueCat, Inc. | Optional (email) | No | Yes |
| Google AdMob | Google LLC | Yes (advertising ID, IP) | Yes (ad network) | Yes |

---

## Data Flow Diagram

```
Player Device
  |
  |-- Firebase Auth ----------> Google Cloud (auth tokens, email)
  |-- Cloud Firestore --------> Google Cloud (save data, stats)
  |-- Firebase Analytics -----> Google Cloud (anonymized events)
  |-- Firebase Crashlytics ---> Google Cloud (crash reports)
  |-- Firebase Performance ---> Google Cloud (performance traces)
  |-- RevenueCat SDK ---------> RevenueCat / AWS (purchase receipts)
  |-- AdMob SDK --------------> Google Ad Network (ad requests, IDFA/GAID)
```

---

## Contact

Questions about third-party data practices: **support@coresurge.game**
