# Cookie and Local Storage Policy

**Core Surge: Endless Tower Defense -- Web Version**
**Last Updated:** May 24, 2026
**Developer:** Andy (Andrew Evans Anglin)

---

## Overview

The web version of Core Surge does NOT use traditional HTTP cookies for its own functionality. Instead, we use browser localStorage and IndexedDB for game data persistence. However, third-party services integrated into the game may set their own cookies.

---

## First-Party localStorage Usage

These are stored locally on your device and are never transmitted to third-party servers.

| Key | Purpose | Contains | Sensitive? |
|---|---|---|---|
| `tower_save_v8` | Game save data | Player progression, inventory, deck configurations, settings, tutorial state | No (game data only, no PII) |
| `core_surge_firebase_web_config_v1` | Firebase configuration | Project identifiers, API key (public, non-sensitive), auth domain | No (public configuration) |
| RevenueCat SDK keys | SDK initialization | Public API keys for entitlement checks | No (public keys only) |

**Note:** The `tower_save_v8` key contains your complete game save. Clearing this will reset your local progress. If you have a Firebase account, your save can be restored from the cloud.

---

## Third-Party Storage

### Firebase Authentication (Google)

- **Storage type:** IndexedDB
- **Purpose:** Maintains persistent login session so you don't have to sign in every visit
- **Contains:** Session tokens, refresh tokens, user metadata
- **Controlled by:** Google Firebase SDK
- **Privacy policy:** https://firebase.google.com/support/privacy

### Firebase Analytics (Google)

- **Storage type:** Cookies and localStorage
- **Cookies set:**
  - `_ga` -- Google Analytics client ID, used to distinguish users (expires: 2 years)
  - `_gid` -- Google Analytics session ID, used to distinguish users (expires: 24 hours)
  - `_gat` -- Used to throttle request rate (expires: 1 minute)
- **Purpose:** Session tracking, event logging, user engagement metrics
- **Privacy policy:** https://policies.google.com/privacy

### Google AdMob

- **Storage type:** Cookies
- **Cookies set:** Various Google advertising cookies for ad personalization and frequency capping
- **Purpose:** Serving relevant ads, limiting how often you see the same ad, measuring ad performance
- **Privacy policy:** https://policies.google.com/privacy
- **Ad settings:** https://adssettings.google.com

---

## User Control

### Clearing Game Data

- **In-game:** Settings > Clear Data (removes game save and resets to default)
- **Browser:** Clear site data through your browser's settings (removes all localStorage, IndexedDB, and cookies for the game domain)

### Blocking Third-Party Cookies

You can block third-party cookies in your browser settings. This may affect:
- Ad personalization (ads will still show but may be less relevant)
- Analytics accuracy (session tracking may be impaired)
- It will NOT affect core gameplay

---

## Cookie Consent and GDPR

### First-Party localStorage

Traditional cookie consent banners are generally not required for first-party localStorage used strictly for game functionality (saving your game). Our localStorage usage falls under the "strictly necessary" exemption as it enables core game features.

### Third-Party Cookies (EU/EEA/UK Users)

For users in the EU, EEA, and UK:
- Google AdMob and Analytics cookies require consent under GDPR/ePrivacy
- We use Google's **User Messaging Platform (UMP) SDK** to present a consent dialog to users in applicable regions
- Users can choose to accept or reject personalized advertising
- If rejected, AdMob serves non-personalized ads (limited cookies)
- Consent preferences can be changed at any time via Settings > Privacy in the game

### CCPA (California Users)

California users can opt out of the sale of personal information. Core Surge does not sell personal information, but AdMob's data practices may qualify under CCPA. The UMP consent dialog includes CCPA-compliant options for California users.

---

## Data Minimization

We store only what is necessary for game functionality:
- Save data so you don't lose progress
- Firebase config so the game can connect to backend services
- Authentication tokens so you stay logged in

We do not use localStorage or cookies for user profiling, cross-site tracking, or selling data to third parties.

---

## Contact

Questions about our cookie and storage practices: **support@coresurge.game**
