# CODEX AGENT - Core Surge Backend, Native, Compliance & Monetization
**Agent:** Codex (AI Coding Agent)
**Role:** Backend Cloud Functions, Firebase Auth, Firestore, native iOS/Android builds (Capacitor), RevenueCat billing, ad network integration, analytics, security hardening, compliance implementation
**Lane:** Owns all server-side code, native platform code, monetization logic, analytics integration, and security. Does NOT touch UI/CSS styling, build pipeline config, or CI/CD workflows.

---

## MANDATORY SESSION LOGGING RULE

**After EVERY response to Andy, append a timestamped entry to `sessions.md` with:**
1. Date and agent name
2. What was done (files created, edited, reviewed)
3. What changed
4. What the next agent should know
5. Any blockers discovered

**Format:**
```
## YYYY-MM-DD - Codex - [Short Title]
**What I did:** [bullet list]
**Files touched:** [list]
**Verification:** [build passed, tests passed, API responses if applicable]
**What other agents need to know:** [critical info]
**Blockers:** [any]
```

**Read sessions.md FIRST every time you start a new conversation to see what other agents have done since your last session.**

---

## HOW TO USE THIS FILE

Andy will say: "Read your agents.md and run next 5 tasks"
1. Read this file
2. Find the first 5 unchecked tasks (marked with `[ ]`)
3. Execute them in order
4. Mark each completed with `[x]` and add completion date
5. Update sessions.md after finishing

---

## DO NOT TOUCH (Claude Code's Lane)

- `css/` (all CSS styling files)
- `index.html` (layout/structure changes - only add script tags if needed)
- Build pipeline config (webpack, esbuild, CI/CD workflows)
- `.github/` (CI/CD workflows)
- Test framework setup

**You CAN modify these JS files for backend/monetization logic only:**
- `js/cloud.js` (Firebase client)
- `js/monetization.js` (RevenueCat/store billing)
- `js/save.js` (cloud save sync - coordinate with Claude Code on local save changes)
- `js/main.js` (Firebase initialization, auth checks - coordinate with Claude Code)
- `js/profile.js` (cloud profile sync)

---

## CURRENT STATE (Read before starting)

- Firebase project created: `core-surge---tower-defense`
- Service account key exists: `core-surge---tower-defense-firebase-adminsdk-fbsvc-e2e9830cd4.json`
- Direct Firebase client path is active in `js/cloud.js` and `js/firebase-public-config.js`
- Shared Firebase tester config file exists, but `apiKey`, `messagingSenderId`, and `appId` are still placeholders
- Email/password sign-in, sign-out, anonymous guest boot, and guest-to-account upgrade already exist in `js/cloud.js`
- Cloud save status UI already exists and local save sync queues are wired
- Backend Cloud Functions exist in `backend/firebase-config.js`, but they are not the active tester path and should not be treated as deploy-ready without re-audit
- Firestore rules written in `backend/firestore.rules`
- Capacitor scaffolding generated (`android/` and `ios/` folders exist)
- RevenueCat packages are installed, native purchase/catalog/restore flows are wired, but SDK keys and store products are still placeholders
- `npm run mobile:sync` exists and has already been used successfully
- No ads integrated yet
- No analytics integrated yet
- Compliance documents exist at repo root, not in `/docs`

---

## VERIFIED PRIORITY

- Do not start with Cloud Functions just because they exist. For tester builds, the active path is direct Firebase client auth + Firestore.
- Highest-value Codex lane right now:
  - real Firebase web app values
  - RevenueCat/App Store/Google Play product setup
  - native Android/iPhone packaging assets
  - analytics/security hardening after tester save/billing are real
- If you touch backend Cloud Functions, first document why the direct Firebase tester lane is insufficient for the task.

---

## TASK LIST

### Phase 1: Firebase Setup & Backend Deployment (Tasks 1-20)

- [ ] **Task 1:** Create Firebase web app via CLI (`firebase apps:create web "Core Surge Web"`) and retrieve apiKey, messagingSenderId, appId
- [ ] **Task 2:** Update js/main.js firebaseConfig with real apiKey, messagingSenderId, appId values
- [ ] **Task 3:** Update js/cloud.js firebaseConfig with same real values
- [ ] **Task 4:** Enable Firestore Database in Firebase console (test mode, us-central1)
- [ ] **Task 5:** Enable Firebase Authentication (Email/Password provider)
- [ ] **Task 6:** Install Firebase CLI locally: `npm install -g firebase-tools`
- [ ] **Task 7:** Login to Firebase CLI: `firebase login`
- [ ] **Task 8:** Deploy Cloud Functions: `cd backend && npm install && firebase deploy --only functions`
- [ ] **Task 9:** Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] **Task 10:** Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
- [ ] **Task 11:** Test syncSave Cloud Function - POST save data, verify it writes to Firestore
- [ ] **Task 12:** Test refreshSave Cloud Function - GET save data, verify it returns correct save
- [ ] **Task 13:** Test submitTournament Cloud Function - POST tournament entry, verify bracket placement
- [ ] **Task 14:** Test getLeaderboard Cloud Function - GET leaderboard, verify sorted results
- [ ] **Task 15:** Verify Firestore security rules block unauthorized access (try reading another user's save)
- [ ] **Task 16:** Set up Firebase emulator for local development testing
- [ ] **Task 17:** Test all 6 Cloud Functions on emulator before deploying to production
- [ ] **Task 18:** Deploy Firebase Hosting with dist/ folder: `firebase deploy --only hosting`
- [ ] **Task 19:** Verify game loads at https://core-surge---tower-defense.web.app
- [ ] **Task 20:** Document all API endpoints and their request/response formats in API_REFERENCE.md

### Phase 2: Authentication & Cloud Save (Tasks 21-40)

- [x] **Task 21:** Implement Firebase Auth sign-up flow in js/cloud.js (email + password) (verified complete in repo 2026-05-25)
- [x] **Task 22:** Implement Firebase Auth login flow in js/cloud.js (verified complete in repo 2026-05-25)
- [x] **Task 23:** Implement Firebase Auth logout in js/cloud.js (verified complete in repo 2026-05-25)
- [ ] **Task 24:** Implement Firebase Auth password reset flow
- [ ] **Task 25:** Add auth state listener - auto-login on app restart if session exists
- [ ] **Task 26:** Create login/signup modal UI elements in index.html (basic structure, Claude Code styles it)
- [x] **Task 27:** Implement guest-to-account upgrade flow (anonymous auth -> email auth) (verified complete in repo 2026-05-25)
- [ ] **Task 28:** Wire cloud save: on significant game events (wave complete, purchase, card pull), auto-sync to Firestore
- [ ] **Task 29:** Wire cloud load: on login, fetch cloud save and merge with local save (newer wins)
- [ ] **Task 30:** Handle save conflicts: if cloud save and local save diverge, prompt user to choose
- [ ] **Task 31:** Implement save versioning for cloud saves (same v8 format as local)
- [x] **Task 32:** Add cloud save indicator in UI (show sync status: synced, syncing, error) (verified complete in repo 2026-05-25)
- [ ] **Task 33:** Implement account deletion flow (delete Firebase Auth account + purge Firestore data)
- [ ] **Task 34:** Implement data export flow (download all user data as JSON - GDPR requirement)
- [ ] **Task 35:** Add rate limiting to save sync (max 1 save per 30 seconds to avoid Firestore costs)
- [ ] **Task 36:** Test save/load cycle: create account, play, save, logout, login on different browser, verify save loads
- [ ] **Task 37:** Test offline-to-online sync: play offline, reconnect, verify save uploads
- [ ] **Task 38:** Handle Firebase Auth errors gracefully (wrong password, email taken, network error)
- [ ] **Task 39:** Add session token refresh handling (Firebase tokens expire after 1 hour)
- [ ] **Task 40:** Verify no PII leaks in Firestore documents (usernames are display-only, no email in save data)

### Phase 3: Monetization - RevenueCat & Ads (Tasks 41-65)

- [ ] **Task 41:** Create RevenueCat account and project for Core Surge
- [ ] **Task 42:** Create products in RevenueCat matching js/data.js catalog (starter_pack, gem_small, gem_medium, monthly_vault)
- [ ] **Task 43:** Create matching products in Apple App Store Connect (with same product IDs)
- [ ] **Task 44:** Create matching products in Google Play Console (with same product IDs)
- [ ] **Task 45:** Enter real RevenueCat public SDK keys in js/monetization.js (replace placeholders)
- [x] **Task 46:** Test RevenueCat initialization on web (should gracefully fall back to "store not available") (verified complete in repo 2026-05-25)
- [ ] **Task 47:** Test RevenueCat initialization on Android emulator - verify product catalog loads
- [ ] **Task 48:** Test sandbox purchase flow on Android - complete a test purchase, verify receipt
- [ ] **Task 49:** Test sandbox purchase flow on iOS (requires Mac with Xcode) - complete test purchase
- [ ] **Task 50:** Implement purchase receipt validation in processIAP Cloud Function
- [ ] **Task 51:** Wire gem delivery: after successful purchase, add gems to save and sync to cloud
- [x] **Task 52:** Implement restore purchases flow - verify previously purchased items are restored on new device (verified flow exists in repo 2026-05-25)
- [ ] **Task 53:** Implement monthly vault subscription check - verify entitlement status on app launch
- [ ] **Task 54:** Handle purchase failures gracefully (cancelled, network error, already owned)
- [ ] **Task 55:** Add purchase history logging to Firestore (iap_transactions collection)
- [ ] **Task 56:** Choose ad network: Google AdMob (recommended for mobile games)
- [ ] **Task 57:** Create AdMob account and register Core Surge app (separate app IDs for iOS and Android)
- [ ] **Task 58:** Integrate AdMob SDK into Capacitor project (both iOS and Android)
- [ ] **Task 59:** Implement rewarded video ad placement (watch ad for bonus gems or skip cooldown)
- [ ] **Task 60:** Implement banner ad placement (bottom of screen during menus, hidden during battle)
- [ ] **Task 61:** Implement interstitial ad placement (between battles, max 1 per 3 minutes)
- [ ] **Task 62:** Set ad frequency caps in code (no more than 1 rewarded per 2 min, 1 interstitial per 3 min)
- [ ] **Task 63:** Test ad serving on Android emulator with test ad unit IDs
- [ ] **Task 64:** Test ad serving on iOS simulator with test ad unit IDs
- [ ] **Task 65:** Verify ads do not appear for users who have made IAP (optional: ad-free with purchase)

### Phase 4: Analytics & Crash Reporting (Tasks 66-80)

- [ ] **Task 66:** Integrate Firebase Analytics SDK into the game
- [ ] **Task 67:** Track event: session_start (when game loads)
- [ ] **Task 68:** Track event: battle_start (wave number, tier, loadout)
- [ ] **Task 69:** Track event: battle_end (wave reached, damage dealt, coins earned, time played)
- [ ] **Task 70:** Track event: card_pull (rarity result, currency spent)
- [ ] **Task 71:** Track event: upgrade_purchase (upgrade name, level, cost)
- [ ] **Task 72:** Track event: research_unlock (family name, rank)
- [ ] **Task 73:** Track event: tournament_join (tier, league)
- [ ] **Task 74:** Track event: iap_purchase (product ID, price, currency)
- [ ] **Task 75:** Track event: ad_viewed (ad type: rewarded/banner/interstitial, placement)
- [ ] **Task 76:** Track event: ad_skipped (ad type, placement)
- [ ] **Task 77:** Track event: tutorial_complete (step reached)
- [ ] **Task 78:** Track event: first_time_user (device type, OS version)
- [ ] **Task 79:** Integrate Firebase Crashlytics for error tracking (catch unhandled exceptions)
- [ ] **Task 80:** Verify all 15+ events appear in Firebase Analytics dashboard

### Phase 5: Security Hardening (Tasks 81-90)

- [ ] **Task 81:** Implement save data encryption using TweetNaCl.js (encrypt before localStorage write)
- [ ] **Task 82:** Add checksum to save data (detect tampering/corruption)
- [ ] **Task 83:** Implement rate limiting on card pulls (max 10 per minute, prevent exploit scripts)
- [ ] **Task 84:** Add input validation for all user-submitted data (username, tournament scores)
- [ ] **Task 85:** Implement server-side score validation in submitTournament (reject impossible scores)
- [ ] **Task 86:** Add Content Security Policy headers to Firebase Hosting config
- [ ] **Task 87:** Audit all Firestore rules for overly permissive access
- [ ] **Task 88:** Implement anti-cheat: detect and flag suspicious save data (negative currency, impossible wave numbers)
- [ ] **Task 89:** Add HTTPS-only enforcement for all API calls
- [ ] **Task 90:** Remove or obfuscate debug console.log statements in production builds

### Phase 6: Native App Builds & Store Submission (Tasks 91-100)

- [x] **Task 91:** Verify `npx cap sync` successfully copies dist/ into both android/ and ios/ projects (verified complete in repo 2026-05-25)
- [ ] **Task 92:** Open android/ in Android Studio - verify it builds and runs on emulator
- [ ] **Task 93:** Open ios/ in Xcode (requires Mac) - verify it builds and runs on simulator
- [ ] **Task 94:** Add proper app icon assets for both platforms (1024x1024 Apple, 512x512 Google, adaptive icon Android)
- [ ] **Task 95:** Add splash screen assets for both platforms
- [ ] **Task 96:** Configure app signing for Android (upload key, app signing key)
- [ ] **Task 97:** Configure app signing for iOS (provisioning profile, distribution certificate)
- [ ] **Task 98:** Build release APK/AAB for Android and test on physical device
- [ ] **Task 99:** Build release IPA for iOS and test on physical device via TestFlight
- [ ] **Task 100:** Submit to both app stores with all required metadata, screenshots, and compliance docs

---

## DEPENDENCIES ON OTHER AGENTS

- **Blocked by Cowork:** Privacy Policy, Terms of Service, IARC prep docs (needed before store submission)
- **Blocked by Claude Code:** Build pipeline must work (dist/ output) before native sync (Task 91)
- **Blocks Claude Code:** Firebase web app credentials (Task 1-2) unblock frontend Firebase integration
- **Blocks Cowork:** Analytics implementation (Tasks 66-80) provides data for Cowork's monitoring tasks
