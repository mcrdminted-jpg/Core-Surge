# Deployment Checklist Review

**Date:** 2026-05-24
**Reviewed File:** `DEPLOYMENT_CHECKLIST.md`
**Current State:** v0.7.23

---

## Overall Assessment

The checklist was written before several project changes (rank system, mockup overlay, Capacitor scaffolding). Multiple steps reference files/structures that have changed or contain outdated commands. The general flow is still correct but specifics need updating.

---

## Phase 1: Firebase Project Setup

| Step | Status | Notes |
|------|--------|-------|
| Step 1: Create Firebase Project | OUTDATED | Checklist says name: `tower-game`. Actual Firebase project is `core-surge---tower-defense` (per CODEX_AGENT.md and service account key filename). Project ID mismatch will cause all later commands to fail. |
| Step 2: Enable Services | STILL VALID | Firestore, Auth, Functions all need enabling. Region listed (us-central1) matches. |
| Step 3: Get Credentials | PARTIALLY VALID | Service account key already exists: `core-surge---tower-defense-firebase-adminsdk-fbsvc-e2e9830cd4.json`. Web app credentials (apiKey, messagingSenderId, appId) are NOT yet created per CODEX_AGENT.md. |

**Action needed:** Update project name references from `tower-game` to `core-surge---tower-defense` throughout.

---

## Phase 2: Install & Deploy Backend

| Step | Status | Notes |
|------|--------|-------|
| Step 4: Install Firebase CLI | STILL VALID | Command correct. |
| Step 5: Authenticate | OUTDATED | Says `firebase use --add` and choose `tower-game`. Should be `core-surge---tower-defense`. |
| Step 6: Install Backend Dependencies | STILL VALID | `cd backend && npm install` is correct. `backend/package.json` exists. |
| Step 7: Deploy | PARTIALLY VALID | Commands are correct. Function names listed match what `backend/firebase-config.js` exports. URL pattern should use actual project ID: `https://us-central1-core-surge---tower-defense.cloudfunctions.net/[FUNCTION_NAME]` |

**Action needed:** Update project ID in firebase use command and example URLs.

---

## Phase 3: Test Locally

| Step | Status | Notes |
|------|--------|-------|
| Step 8: Run Emulator | STILL VALID | Commands correct. Requires `backend/firebase.json` which exists. |
| Step 9: Test API | MOSTLY VALID | curl example references correct endpoint structure. Token-based auth flow is correct. The game state JSON example `{"gameState":{"score":100,"level":5,"towers":[]}}` does NOT match the actual save format (should be tower_save_v8 shape with coins, gems, etc.). |

**Action needed:** Update test payload to match actual save file shape.

---

## Phase 4: Wire Frontend to Backend

| Step | Status | Notes |
|------|--------|-------|
| Step 10: Firebase SDK | OUTDATED | Lists Firebase SDK v10.0.0 as script tags. The project already has `js/cloud.js` that handles Firebase client-side. No need to add raw SDK script tags - cloud.js already imports what's needed. |
| Step 11: Update main.js | PARTIALLY OUTDATED | Firebase config placeholder is correct structure but wrong projectId (`tower-game` should be `core-surge---tower-defense`). Also, `js/main.js` may already have a firebaseConfig block (per CODEX_AGENT task 2). |
| Step 12: Replace save.js | DANGEROUS | Says "Replace entire file with cloud sync code." Current save.js has the working rank/unlock/card system. Replacing it would break the game. Cloud sync should be ADDITIVE (in cloud.js), not a replacement. |
| Step 13: Update ui.js | PARTIALLY VALID | Login modal may be needed but should coordinate with existing profile.css/cloud UI. |
| Step 14: Update tournament.js | STILL VALID | Cloud leaderboard functions are a needed addition. |

**Action needed:** Step 12 is DANGEROUS - flag it clearly. Cloud sync must layer on top of existing save.js, not replace it. Update project ID. Remove raw SDK script tag step (cloud.js handles this).

---

## Phase 5: Test Game Live

| Step | Status | Notes |
|------|--------|-------|
| Step 15: Start Game | OUTDATED | File path is correct but also mentions `python -m http.server 8000`. Current package.json has `npm start` which runs `node scripts/serve.js`. Use that instead. |
| Step 16: Test Login | STILL VALID | Flow description is correct. |
| Step 17: Test Cloud Save | STILL VALID | Console messages may differ from what's shown. |
| Step 18: Test Tournament | STILL VALID | |
| Step 19: Test on Cloudflare | NEEDS UPDATE | URL `tower-game-3k2.pages.dev` should be verified. API_URL should point to `core-surge---tower-defense` project. |

**Action needed:** Update server command. Verify Cloudflare Pages URL is still active.

---

## Phase 6: Prepare Mobile Build

| Step | Status | Notes |
|------|--------|-------|
| Step 20: Set Up Capacitor | ALREADY DONE | Capacitor is already installed. `package.json` has `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android` as dependencies. The `npx cap init` and `npx cap add` steps are already completed. |
| Step 21: Build for Capacitor | OUTDATED | Says "just ensure index.html points to production API" but should use `npm run mobile:sync` which is already in package.json and runs build + cap sync. |
| Step 22: Build for iOS | STILL VALID | Requires Mac. |
| Step 23: Build for Android | STILL VALID | |

**Action needed:** Mark Capacitor setup as already complete. Update build command to use existing npm scripts.

---

## File Path Verification

| Referenced Path | Exists? | Notes |
|-----------------|---------|-------|
| `Tower Mobile App Game/backend` | YES | Contains firebase-config.js, firestore.rules, package.json, etc. |
| `Tower Mobile App Game/index.html` | YES | |
| `js/main.js` | YES | |
| `js/save.js` | YES | |
| `js/ui.js` | YES | |
| `js/tournament.js` | YES | |
| `FRONTEND_INTEGRATION.md` | NEEDS VERIFICATION | Referenced in Steps 11-14 but not confirmed in project folder |
| `backend/firebase.json` | YES | |
| `backend/package.json` | YES | |
| `ios/` | YES | Capacitor iOS project |
| `android/` | YES | Capacitor Android project |

---

## Package.json Script Verification

| Checklist Command | Actual Available Script | Match? |
|-------------------|----------------------|--------|
| `npm install` (root) | Works (dependencies listed) | YES |
| `npm install` (backend) | Works (backend/package.json exists) | YES |
| `firebase deploy` | Requires firebase-tools installed globally | YES |
| `npx cap init` | Already done | N/A |
| `npx cap add ios/android` | Available via `npm run mobile:add:ios` / `mobile:add:android` | UPDATED |
| `npx cap sync` | Available via `npm run mobile:sync` | UPDATED |
| `npx cap open ios/android` | Available via `npm run mobile:open:ios` / `mobile:open:android` | UPDATED |
| `python -m http.server` | Not needed; `npm start` available | OUTDATED |

---

## Firebase Config Verification

| Config Item | Checklist Value | Actual Value | Match? |
|-------------|----------------|-------------|--------|
| Project ID | `tower-game` | `core-surge---tower-defense` | NO |
| Region | `us-central1` | `us-central1` (assumed) | YES |
| Functions URL pattern | `us-central1-tower-game.cloudfunctions.net` | Should be `us-central1-core-surge---tower-defense.cloudfunctions.net` | NO |
| Hosting URL | Not specified in checklist (uses Cloudflare) | `core-surge---tower-defense.web.app` (potential) | NEEDS UPDATE |
| Cloudflare URL | `tower-game-3k2.pages.dev` | Needs verification | UNKNOWN |
| Web App Credentials | Placeholder | Not yet created | PENDING |

---

## Critical Issues Summary

1. **WRONG PROJECT ID** - Every reference to `tower-game` must be `core-surge---tower-defense`. This affects Firebase CLI commands, API URLs, and config objects.
2. **DANGEROUS Step 12** - "Replace entire save.js" would destroy the rank/unlock/card system. Cloud sync must be additive.
3. **CAPACITOR ALREADY SCAFFOLDED** - Steps 20-21 are partially redundant; use existing npm scripts.
4. **OUTDATED SDK APPROACH** - Raw Firebase SDK script tags are not needed; `js/cloud.js` already handles Firebase client.
5. **MISSING FRONTEND_INTEGRATION.md** - Steps 11-14 reference this document but it may not exist.
6. **EXPECTED TIME ESTIMATE** - "2 hours" is unrealistic given web app credentials are not yet created and multiple steps need coordination between agents.

---

## Recommendations

1. Update all `tower-game` references to `core-surge---tower-defense`.
2. Rewrite Step 12 to say "Add cloud sync to js/cloud.js (do NOT replace save.js)."
3. Remove Capacitor init steps (already done) and reference `npm run mobile:sync`.
4. Add a Phase 0 for obtaining Firebase web app credentials (currently the primary blocker).
5. Update test commands to use `npm start` instead of Python server.
6. Add the actual save file shape to the test payload example.
7. Verify FRONTEND_INTEGRATION.md exists and is current.
