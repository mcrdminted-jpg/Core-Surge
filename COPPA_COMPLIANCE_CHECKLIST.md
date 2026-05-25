# COPPA Compliance Checklist

## Core Surge: Endless Tower Defense

**Last Updated:** 2026-05-24
**Developer:** Andy (Andrew Evans Anglin), Washington State, USA
**Target Audience:** Ages 13+

---

## Overview

Core Surge is rated 13+ and does NOT specifically target children under 13. However, children may still download and play the game, especially on shared family devices. Under COPPA (Children's Online Privacy Protection Act), we must take reasonable measures to protect users under 13 regardless of the target age rating. Failure to comply can result in FTC enforcement actions and fines up to $50,120 per violation.

---

## Compliance Checklist

### Age Verification

- [ ] **Age gate at first launch:** Implement a date-of-birth entry screen OR a simple "Are you 13 or older?" confirmation prompt before any data collection begins
- [ ] **Age gate cannot be bypassed:** User cannot skip or dismiss the age verification screen
- [ ] **Age gate persists:** Store the age verification result locally (not tied to account) so the user is not re-prompted every session
- [ ] **No coaching:** Do not provide hints like "You must be 13 to play" that encourage children to lie about their age

### Data Collection (Under-13 Users)

- [ ] **No personal information collected** from users who identify as under 13 without verifiable parental consent
- [ ] **Verifiable parental consent:** If under-13 users are allowed to create accounts, implement one of the FTC-approved consent methods (email plus, signed consent form, payment card verification, video call, government ID)
- [ ] **Guest mode:** Allow under-13 users to play without creating an account (local save only, no cloud sync)
- [ ] **Firebase Auth:** Email registration must require age verification BEFORE the registration form is shown
- [ ] **Minimal data:** For under-13 users who do create accounts, collect only the minimum data necessary for the game to function

### Advertising

- [ ] **AdMob COPPA tag:** Configure the child-directed treatment flag (`tagForChildDirectedTreatment`) to `true` for users identified as under 13
- [ ] **No behavioral/personalized advertising** served to users under 13
- [ ] **Contextual ads only** for under-13 users (ads based on page content, not user behavior)
- [ ] **No ads that mimic game UI** or use deceptive close buttons for any user, especially under-13
- [ ] **Ad content filtering:** Enable restricted ad content categories for under-13 users

### Analytics and Tracking

- [ ] **Disable user-level analytics** for under-13 users in Firebase Analytics
- [ ] **No persistent identifiers** (IDFA, GAID, device fingerprinting) collected for under-13 users
- [ ] **Aggregate analytics only:** If any analytics are collected for under-13 users, they must be aggregated and non-identifiable
- [ ] **No third-party tracking SDKs** activated for under-13 user sessions

### In-App Purchases

- [ ] **Platform-level parental controls:** Rely on iOS Ask to Buy and Google Family Link for purchase authorization (platforms handle this)
- [ ] **No direct purchase prompts** to users identified as under 13 without parental gate
- [ ] **Clear pricing:** All gem pack prices shown in real currency, no misleading "free" labels

### Social Features

- [ ] **Tournament leaderboards:** Restrict username visibility for under-13 users (use generic identifiers like "Player12345")
- [ ] **No direct messaging** for under-13 users
- [ ] **No friend lists** for under-13 users
- [ ] **No user-generated content sharing** for under-13 users
- [ ] **No location-based features** for under-13 users

### Data Retention and Deletion

- [ ] **Auto-delete policy:** Data for under-13 accounts is automatically deleted after 1 year of inactivity
- [ ] **Parental data access:** Parents can request to view data collected about their child
- [ ] **Parental data deletion:** Parents can request deletion of their child's data at any time
- [ ] **Data deletion is complete:** When data is deleted, it is removed from all systems including backups within 30 days

### Privacy Policy

- [ ] **Dedicated children's section** in the privacy policy explaining COPPA protections
- [ ] **Clear language:** Privacy policy written in plain, understandable language
- [ ] **Accessible:** Privacy policy link available on app store listing, in-game settings, and website
- [ ] **Operator details:** Privacy policy includes developer name, contact email, and physical address
- [ ] **Types of data collected:** Privacy policy lists all categories of data collected from children
- [ ] **Purpose of collection:** Privacy policy explains why each data type is collected
- [ ] **Third-party sharing:** Privacy policy discloses all third parties who receive children's data
- [ ] **Parental rights:** Privacy policy explains parents' rights to review, delete, and refuse further collection

### Safe Harbor Programs

- [ ] **Evaluate ESRB Privacy Certified:** Consider joining the ESRB Privacy Certified program (FTC-approved COPPA safe harbor)
- [ ] **Evaluate kidSAFE Seal:** Consider applying for kidSAFE Seal certification
- [ ] **Document decision:** Record why safe harbor was or was not pursued (cost, timeline, scope)

---

## Current Gaps in Codebase

1. **No age gate exists** - There is no age verification screen at first launch
2. **No age-based feature restrictions** - All features are available regardless of user age
3. **No COPPA tag on AdMob requests** - Ad requests do not include child-directed treatment flags
4. **No analytics restrictions** - Firebase Analytics collects the same data for all users
5. **No guest mode** - Users cannot play without creating an account (or this has not been implemented yet)
6. **No data retention automation** - No system to auto-delete inactive under-13 accounts
7. **Privacy policy does not have a children's section** - Current privacy policy (if any) does not address COPPA

---

## Implementation Recommendations for Codex

### Priority 1 (Pre-Launch, Required)

1. Add an `AgeGateScreen` component that appears on first launch before any Firebase calls
2. Store age verification result in local storage and Firestore user document (`isMinor: boolean`, `ageVerifiedAt: timestamp`)
3. Create an `AgeRestrictionService` that gates features based on `isMinor` flag
4. Pass `tagForChildDirectedTreatment(true)` in AdMob configuration for minor users
5. Disable Firebase Analytics user properties and user ID for minor users
6. Add children's privacy section to the privacy policy

### Priority 2 (Post-Launch, Recommended)

7. Implement guest mode for under-13 users (local save, no cloud sync)
8. Add parental consent flow if under-13 account creation is desired
9. Build data retention automation (Cloud Function to scan and delete inactive minor accounts)
10. Evaluate and apply for kidSAFE or ESRB Privacy Certified

---

## Legal Disclaimer

This checklist is for planning purposes only and does not constitute legal advice. Consult with a lawyer specializing in children's privacy law before launch to ensure full COPPA compliance.
