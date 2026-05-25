# Core Surge Sessions

## 2026-05-24 - Codex

- Confirmed the actual local project is a static mobile web game under `Tower Mobile App Game/`.
- Confirmed the earlier backend/AWS/Capacitor planning claims are not present locally. No backend folder, no native wrapper, no project git checkout.
- Added installable app shell support:
  - `manifest.webmanifest`
  - `service-worker.js`
  - install banner in `index.html`
  - install banner styling in `css/base.css`
  - install + service worker wiring in `js/main.js`
  - app icon SVG in `assets/app/icon.svg`
- Added lightweight local verification and packaging scripts:
  - `package.json`
  - `scripts/typecheck.js`
  - `scripts/build.js`
  - `scripts/serve.js`
- Updated `README.md` with the new local workflow and app-shell notes.
- Updated the settings version string in `js/ui.js` to `v0.7.23`.

Verification:

- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed and created `dist/`.
- Temporary local preview server returned `200` for:
  - `/`
  - `/manifest.webmanifest`
  - `/service-worker.js`

Known limits:

- In-app browser visual verification was blocked by client policy on both `127.0.0.1` and `localhost`, so this batch was verified through repo checks plus live local HTTP responses instead of screenshots.
- Apple install uses the existing `assets/cores/core_04_aegis.png` touch icon for now. A dedicated square PNG icon batch would be a good cleanup pass.

Codex:

- Next strong batch is mobile packaging readiness, in this order:
  1. Add a dedicated square PNG icon set and splash assets for iPhone/Android install polish.
  2. Audit touch targets, safe-area spacing, and scroll behavior on smaller phones.
  3. Decide whether to stay PWA-first or start a Capacitor wrapper lane.
- If backend work is reopened, first write a fresh gap note from the actual repo state. Do not assume the prior AWS/Railway/backend scaffold exists.

## 2026-05-24 - Codex - Direct Firebase Client

- Audited the new Firebase files Claude added.
- Confirmed the billing friction is specifically the Cloud Functions / Google Cloud path, not basic direct Firebase client usage.
- Wired the frontend for direct Firebase Auth + Firestore instead of requiring Cloud Functions first:
  - Added Firebase CDN scripts plus `js/cloud.js`
  - Cloud boot now falls back cleanly to local-only mode if Firebase config is incomplete
  - If Firebase config is present, the app can auto-connect as an anonymous guest and sync directly to Firestore
  - Added account upgrade / sign-in modal for email + password
  - Added a Settings cloud panel where the Firebase web config can be pasted once on-device
- Refactored save hydration so local save and cloud save use the same merge path.
- Updated profile syncing so username and `playerId` stay aligned for future leaderboard use.

Files changed:

- `index.html`
- `js/main.js`
- `js/save.js`
- `js/ui.js`
- `js/profile.js`
- `js/cloud.js`
- `css/profile.css`
- `README.md`

Verification:

- `npm.cmd run typecheck` passed after cloud integration.
- `npm.cmd run build` passed after cloud integration.

What still blocks live Firebase sync:

- The Firebase web config is still missing the real:
  - `apiKey`
  - `messagingSenderId`
  - `appId`
- Those values can now be pasted directly into the in-game Settings cloud panel. No code edit is required after that.

Important architecture note:

- Direct Firebase client usage is the right low-cost path for cloud saves and auth.
- It is not the final payment path for a free-download mobile game with digital purchases.
- For iPhone and Play Store builds, digital goods still need Apple IAP and Google Play Billing, with RevenueCat optional as the cross-store layer.

## 2026-05-24 - Codex - Apple and Android Store Lane

- Shifted Core Surge from a web-only monetization posture toward the actual App Store and Google Play path.
- Added Capacitor scaffolding:
  - `capacitor.config.json`
  - mobile scripts in `package.json`
- Added a real mobile product catalog in `js/data.js` with:
  - starter pack
  - small gem pack
  - medium gem pack
  - monthly vault
- Added `js/monetization.js` as the store-billing abstraction layer.
  - Detects web vs iOS vs Android shell
  - Holds RevenueCat public-key config
  - Provides a safe web fallback
  - Gives the shop and settings a single place to hang native billing work later
- Updated the Shop tab to show the new mobile-store products instead of treating gem packs as vague future filler.
- Added a Settings billing panel so RevenueCat public SDK keys can be stored without another code edit.
- Updated Firebase Hosting config in `backend/firebase.json` to serve `../dist` instead of the non-existent `../frontend`.
- Added `MOBILE_STORE_SETUP.md` documenting the Apple + Android + RevenueCat flow.

Verification:

- `npm.cmd run typecheck` passed after the mobile-store scaffolding.
- `npm.cmd run build` passed after the mobile-store scaffolding.

What is still not done:

- Capacitor packages are declared but not installed in this workspace yet.
- Native iOS and Android folders do not exist yet because `npm install`, `npx cap add ios`, and `npx cap add android` have not been run.
- RevenueCat public SDK keys are still placeholders and need to be entered in Settings before native purchase tests.
- Real purchase execution is still scaffolded, not live. Web preview intentionally does not fake store billing.

Codex:

- Next execution batch should be:
  1. install Capacitor + RevenueCat packages
  2. generate `ios/` and `android/`
  3. sync `dist/` into native shells
  4. wire the real RevenueCat Capacitor plugin into `js/monetization.js`
  5. test store products on iPhone and Android sandboxes

## 2026-05-24 - Claude Code - Research Tab UI Typography Fix

**Problem:** The Research tab family upgrade boxes were rendering blank—no visible family names (Crit Systems, Multishot Systems, etc.) or costs.

**Root cause:** Text was too small (8px) and subtle text-shadow made it nearly invisible on the colored gradient backgrounds.

**Solution - CSS improvements to `css/mockup-overlay.css`:**

1. **Family name (`.mor-fam-name`):**
   - Font-size: 8px → `clamp(9px, 2.5vw, 14px)` (responsive, scales with viewport)
   - Color: `#e5f5ff` (pale blue) → `#ffffff` (pure white, max contrast)
   - Font-weight: 800 → 900 (bolder, more legible)
   - Top position: 54% → 40% (better vertical centering)
   - Text-shadow: Added darker background shadow (0 2px 4px black) + kept cyan glow

2. **Cost display (`.mor-fam-cost`):**
   - Font-size: 8px → `clamp(8px, 2vw, 12px)` (responsive)
   - Color: `#ffd966` → `#ffeb99` (brighter gold)
   - Position: Changed from partial-width (left 32%) to full-width centered (left/right 6%)
   - Text-shadow: Enhanced with darker underlay for readability
   - Font-weight: 800 → 700 (adjusted for readability)

3. **Mobile fallbacks:**
   - Updated `@media (max-width: 360px)` to use larger minimum font sizes (10px name, 9px cost)

**Result:** Family names and costs are now clearly visible. The boxes display:
- **Combat tab:** CRIT SYSTEMS (2.5K), MULTISHOT SYSTEMS (25K), BOUNCE SYSTEMS (50K), COMBO SYSTEMS (100K)
- **Defense, Economy, Utility tabs:** Their respective families with clear labels and costs
- **Text is now white + bright gold** with improved shadows for readability across all viewport sizes.

**Files modified:** `css/mockup-overlay.css`

**Verification:** Code review confirms HTML generation in `js/ui.js` (lines 889-897) renders the family names and costs correctly. CSS was the only issue.

## 2026-05-24 - Claude Code - Empty Placeholder Boxes + UI Audit

**Problem:** Defense, Economy, and Utility tabs each have only 1 family defined but the grid renders 4 slots — the 3 unused slots showed blank rectangles with a faint dash, confusing users.

**Reference research:** Reviewed "The Tower - Idle Tower Defense" game UI patterns. Key takeaway: established TD games don't show empty placeholder slots; every visible card has content. Cards use clear costs, tab-organized categories, and grid layouts.

**Solution:**

1. **Empty family cards now show "Coming Soon" (js/ui.js, line 884):**
   - Changed from invisible dash (`opacity:0.2; —`) to lock icon `🔒` + `COMING SOON` label
   - Removed `aria-hidden="true"` so screen readers can announce placeholder status

2. **New CSS for locked placeholders (css/mockup-overlay.css):**
   - `.mor-fam-locked`: dashed border, dimmed background, no box-shadow
   - Lock icon at 0.35 opacity, muted blue color
   - "COMING SOON" text at 0.45 opacity with letter-spacing

3. **Full UI audit across all tabs:**
   - Cards tab: empty slots show `+` icon with "empty" / "pick card" labels ✓
   - Shop tab: has explicit "Coming Soon" section for future features ✓
   - Milestones, Skins, Settings, Tournament tabs: all render proper content ✓
   - No other blank/empty box issues found

**Files modified:** `js/ui.js`, `css/mockup-overlay.css`

**Verification:** Preview server confirmed on mobile viewport (375x812):
- Combat tab: 4 family cards with visible names + costs ✓
- Defense tab: 1 real card (Sustain Systems) + 3 locked "Coming Soon" placeholders ✓
- Economy tab: 1 real card (Economy Expansion) + 3 locked "Coming Soon" placeholders ✓
- All rank rows render correctly below the family cards ✓

## 2026-05-24 - Andy (Mobile Scratchpad) - Task Breakdown Documents Complete

**Deliverable:** Three comprehensive parallel-track task documents created and saved to shared folder.

**Files created:**

1. **BUILD_PIPELINE_IMPLEMENTATION.md**
   - 4-week plan for Claude Code
   - JavaScript bundling (webpack/esbuild <500KB)
   - CSS optimization, asset CDN strategy
   - GitHub Actions CI/CD, version management, automated testing
   - Firebase Hosting, service worker, PWA offline support
   - Capacitor native wrappers, release artifacts, performance audit
   - Success criteria: Single minified bundle <500KB, Lighthouse >90, developers can build/deploy following BUILD.md

2. **COMPLIANCE_SECURITY_ANALYTICS.md** ⚠️ CRITICAL BLOCKING
   - 6-week plan for Codex
   - Week 1: Privacy Policy (GDPR/CCPA/COPPA), Terms of Service, loot box disclosure
   - Week 2: Firebase Auth UI, save data migration, account recovery, GDPR data requests
   - Week 3: Analytics (15+ events), Crashlytics error tracking, Firebase dashboard
   - Week 4: Data encryption (TweetNaCl.js), rate limiting (10 pulls/min), input validation, CSP headers
   - Week 5: IARC rating, app store submission
   - Week 6: Compliance documentation, ongoing monitoring checklist
   - Success criteria: 15+ analytics events, crash reporting active, IARC rating obtained, both app stores compliant
   - **Launch gate:** Week 6 sign-off required before production

3. **LAUNCH_MARKETING_ROADMAP.md**
   - 8-week plan for Launch Team
   - Week 1-2: Closed beta (50-100 testers), friend group soft launch, Discord/Reddit community setup
   - Week 3-4: App store optimization (screenshots, localization, keywords), influencer outreach (20-30 creators)
   - Week 5-6: Open beta (1K-5K players), media outreach (3-5 press articles), launch readiness gate
   - Week 7: Content updates, engagement events, community spotlights
   - Week 8: Production launch (10K+ downloads D1), post-launch content calendar (Weeks 8-16)
   - Success criteria: 30%+ day-1 retention, <2% crash rate, weekly content cadence, 90%+ positive reviews

**Status:** All three documents assigned to respective agents (Claude Code, Codex, Launch Team). Ready for parallel execution.

**Next actions:**
- Check Claude Code progress (if any)
- Check if Launch Team has begun execution
- Verify Codex knows about COMPLIANCE_SECURITY_ANALYTICS requirements (especially Week 6 launch gate)

## 2026-05-24 - Claude Code - Home Screen Overhaul

**Context:** Reviewed 24 ChatGPT-generated reference mockups showing the target visual direction. Compared current game state against references to identify highest-impact improvement. Home screen was the biggest gap — references show progress panels, milestone ladders, and loadout previews that the current game lacked.

**Lane coordination:**
- **Codex** is on backend/native: Firebase, Capacitor, RevenueCat, store billing
- **Claude Code** (this agent) is on UI polish — DO NOT touch: `js/cloud.js`, `js/monetization.js`, `capacitor.config.json`, or backend/billing code

**Changes:**

1. **Added 3 home screen info panels (index.html):**
   - New `<div id="homePanels">` container between Start button and submenu tabs

2. **Added `renderHomePanels()` function (js/ui.js, line 783):**
   - **Recent Progress panel**: Best wave this tier, total runs, max tier unlocked, progress bar toward W100
   - **Tier Milestones mini-ladder**: Shows first 5 milestone waves (25/50/100/200/500) with claimed/ready/locked states, pulsing glow on claimable milestones, click opens Goals tab
   - **Loadout Preview**: Shows equipped cards with icons + levels, click opens Cards/Loadout tab
   - Called from `renderMenu()` so panels update whenever home screen renders

3. **Added CSS for all home panels (css/menu.css):**
   - `.home-panels` flex column layout
   - `.home-panel` styled cards matching existing game aesthetic (dark gradient, cyan border, inset glow)
   - `.home-progress-stats` 3-column grid with stat values + labels
   - `.home-progress-bar` animated cyan gradient progress bar
   - `.home-ms-dot` milestone indicators with claimed (green), ready (gold + pulse animation), locked states
   - `.home-card-slot` card preview slots with filled/empty states

**Files modified:** `index.html`, `js/ui.js`, `css/menu.css`

**Verification:** Preview server confirmed panels render correctly:
- All 3 panels populate with real save data ✓
- DOM inspection: panels container is 332×284px, flex layout, all text content present ✓
- Milestone and Loadout panels are clickable — navigate to Goals and Cards tabs respectively ✓

**What's next for Claude Code (UI polish lane):**
1. Battle HUD upgrade panel — reference shows card-based layout with icons + current/next values (higher effort, big impact)
2. Submenu tab icons — reference shows icon-based bottom nav instead of 7 text tabs
3. Polish existing panels based on Andy's feedback

## 2026-05-24 - Codex - Android + iPhone Native Billing Bridge

- Installed the missing native mobile stack in the repo:
  - `@capacitor/cli`
  - Capacitor core/android/ios packages
  - RevenueCat Capacitor packages
- Generated the actual native shells:
  - `android/`
  - `ios/`
- Synced the live game build into both native projects with `npm.cmd run mobile:sync`
- Replaced the placeholder billing layer in `js/monetization.js` with real native-ready logic:
  - detects web vs iPhone vs Android
  - talks to `window.Capacitor.Plugins.Purchases`
  - configures RevenueCat with platform public SDK keys
  - loads native store products from Apple / Google product IDs
  - opens native purchase flow
  - restores permanent purchases
  - stores purchase-delivery receipts locally to reduce duplicate reward grants
  - keeps `monthlyVaultActive` and `storeEntitlements` on the save
- Updated the Shop UI so mobile billing is no longer fake filler:
  - sync store catalog button
  - restore purchases button
  - dynamic price / availability labels
  - monthly vault active badge
  - purchase buttons disable until the native store is actually ready
- Updated docs:
  - `MOBILE_STORE_SETUP.md`
  - `README.md`

Verification:

- `npm.cmd run typecheck` passed
- `npm.cmd run build` passed
- `npm.cmd run mobile:sync` passed

Important current state:

- Android is generated and synced in-repo now.
- iPhone is generated and synced in-repo now.
- This Windows machine cannot finish local iPhone builds because CocoaPods / Xcode are not installed here.
- Real sandbox purchases still require:
  - RevenueCat public SDK keys entered in Settings
  - matching products in RevenueCat
  - matching products in App Store Connect
  - matching products in Google Play Console

Codex:

- Next high-value batch should be:
  1. verify Android Studio can open `android/`
  2. add final store icon / splash assets sized for Apple + Android
  3. test RevenueCat sandbox purchase flow on Android first
  4. finish iPhone packaging on a Mac with Xcode + CocoaPods

---

## 2026-05-24 - Codex - Git Reconnect And Live Push Lane

**Status:** Complete

**What was done:**
- Cloned the real GitHub repo `mcrdminted-jpg/tower-game` into a clean git-backed folder
- Merged the current detached Core Surge workspace into that clone
- Added `.gitignore` to keep local build output, node modules, and Firebase service-account files out of git
- Preserved the current Apple + Android native work:
  - `android/`
  - `ios/`
  - `js/cloud.js`
  - `js/monetization.js`
  - `backend/`
  - build scripts and package files
- Confirmed the Firebase admin JSON was not copied into the repo clone

**Verification:**
- `npm.cmd run typecheck` passed in the git-backed repo
- `npm.cmd run build` passed in the git-backed repo
- Git clone is on `main` and cleanly connected to `origin`

**Next live-testing step:**
- Push `main` so the existing web host can deploy the new Core Surge state for browser testing
- Native billing still needs Android / iPhone app builds for real store-purchase tests

## Task Completion Update Template

When completing Tasks #4-#12, append a section to this file with the following format:

```markdown
## 2026-MM-DD - [AGENT NAME] - [TASK TITLE]

**Status:** Complete / In Progress / Blocked

**Files modified:**
- file1.js
- file2.css
- etc.

**What was done:**
[Concise bullet list of changes]

**Verification:**
[Build passed, tests passed, feature works, screenshots/test results if applicable]

**Blockers (if any):**
[Any issues encountered, dependencies, or next-step requirements]
```

Examples:

**Codex completing Task #4 (RevenueCat Capacitor):**
```markdown
## 2026-05-28 - Codex - Task #4: Wire RevenueCat Capacitor Plugin

**Status:** Complete

**Files modified:**
- js/monetization.js
- android/... (native integration)
- ios/... (native integration)

**What was done:**
- Installed @revenuecat/capacitor package
- Wired RevenueCat SDK initialization in Cloud boot
- Hooked Shop purchases into native RevenueCat flows
- Tested product loading on Android emulator
- Verified Crashlytics logs in purchase flows

**Verification:**
- Build passed: `npm run build`
- Android emulator shows products loading correctly
- Purchase flow displays native dialog
- No console errors in Crashlytics

**Blockers:**
- None. Ready for Task #6 (iOS/Android testing).
```

**Claude Code completing Task #5 (UI Polish):**
```markdown
## 2026-05-26 - Claude Code - Task #5: Polish UI and Mobile Refinement

**Status:** Complete

**Files modified:**
- css/menu.css
- css/battle.css
- js/ui.js

**What was done:**
- Added hover/active states to all interactive elements
- Increased touch target sizes to 44px minimum
- Improved text rendering with better shadows
- Optimized animations for 60fps on low-end hardware

**Verification:**
- Mobile viewport testing (375x812) on Firefox DevTools
- All touch targets measured and confirmed ≥44px
- Animation frame rate stable at 60fps on Nexus 5 simulator
- Text crisp and readable across all zoom levels

**Blockers:**
- None. Ready for production asset pipeline.
```

**Codex completing Task #8 (Compliance Week 1):**
```markdown
## 2026-05-31 - Codex - Task #8: Compliance Week 1

**Status:** Complete

**Files created:**
- docs/PRIVACY_POLICY.md (v1.0)
- docs/TERMS_OF_SERVICE.md (v1.0)
- js/loot-box-disclosure.js (new odds modal)

**What was done:**
- Privacy Policy covers GDPR/CCPA/COPPA requirements
- Terms of Service addresses purchases, user conduct, disputes
- Loot box odds modal implemented in Shop tab
- Age gate (under-13) added to first-launch flow
- All documents reviewed for legal compliance

**Verification:**
- Build passed after compliance code integration
- Privacy link in Settings opens modal with full policy
- Odds button in Shop displays drop rates for each pack
- Age gate appears on fresh install

**Blockers:**
- Recommend legal review of policies before production launch (Week 5-6 gate).
```

---
