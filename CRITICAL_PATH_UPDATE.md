# Critical Path Update - Reality Check

**Assessed: 2026-05-24**
**Current version: v0.7.23**

## Task Status vs. Reality

### Task #5 — UI Polish
**Status: PARTIALLY DONE**
- Home panels added (progress, milestones, loadout preview)
- Research tab mockup overlay implemented
- 7-icon submenu grid working
- Bottom nav 5-tab layout with MORE bottom sheet
- Isometric battlefield preview on home screen
- Tier hex progression strip on Goals
- **GAPS:** No systematic comparison against all reference mockups. Settings, Store, Tournament, and Skins panels may still diverge from design intent. No pixel-perfect audit done.

### Task #4 — RevenueCat Integration
**Status: SCAFFOLDED ONLY**
- monetization.js exists with product definitions
- Purchase flow code written (gem packs, starter pack, slot unlocks)
- Ad simulation overlay implemented (30s countdown, skippable after 5s)
- **GAPS:** SDK API keys are placeholders. No RevenueCat dashboard configured. No real purchases possible. No receipt validation connected. Cannot test on device.

### Task #7 — Asset Pipeline / Bundling
**Status: NOT STARTED**
- No webpack, esbuild, Vite, or Rollup configuration exists
- No minification of JS/CSS
- No CDN configured
- No image optimization pipeline (WebP conversion, compression)
- All assets served as raw individual files
- `firebase.json` hosting points to `../dist` but no build step creates dist/
- Bundle size unknown (no measurement tool)

### Task #9 — CI/CD
**Status: NOT STARTED**
- No `.github/workflows/` directory
- No automated testing
- No automated deployment pipeline
- No build verification
- Manual deployment only (if backend were deployed)

### Task #8 — Compliance (Privacy/ToS/Loot Box)
**Status: NOT STARTED**
- No privacy policy document exists as a file
- No terms of service document exists
- No loot box odds disclosure modal in game
- No COPPA/GDPR compliance implementation
- No age gate
- No data deletion mechanism

### Task #10 — Firebase Auth UI
**Status: PARTIALLY DONE (BLOCKED)**
- js/cloud.js has full auth logic (sign-up, sign-in, anonymous, link accounts)
- Settings panel has cloud settings section
- Config storage mechanism ready (users can paste Firebase config at runtime)
- Firestore sync logic written (save/load/conflict resolution)
- **BLOCKED:** apiKey and appId are empty strings. Firebase web app not created in console. Zero cloud features work.

### Task #3 — Analytics
**Status: NOT STARTED**
- No analytics SDK integrated (no Firebase Analytics, no Mixpanel, no Amplitude)
- No event tracking code
- No crash reporting (no Crashlytics)
- No funnel definitions
- No A/B testing framework

### Task #6 — Purchase Testing
**Status: NOT POSSIBLE**
- RevenueCat keys are placeholders
- No sandbox environment configured
- No test accounts set up
- Cannot validate any purchase flow on device
- Blocked by Task #4 completion

### Task #11 — Testing Framework
**Status: NOT STARTED**
- No test framework installed (no Jest, Vitest, Playwright, etc.)
- No unit tests
- No integration tests
- No E2E tests
- Only manual testing possible via browser

### Task #12 — Beta Launch
**Status: NOT POSSIBLE**
- Multiple hard blockers remain:
  - No Firebase web credentials (blocks cloud save, auth, leaderboards)
  - No CI/CD (blocks automated deployment)
  - No compliance docs (blocks store submission)
  - No real IAP (blocks monetization testing)
  - No analytics (blocks retention measurement)
  - No test framework (blocks quality assurance)

## Measurements Not Yet Taken

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Bundle size (minified+gzipped) | <500KB | UNKNOWN | No build step exists |
| Lighthouse Performance | >90 | UNKNOWN | No audit run |
| Lighthouse Accessibility | >90 | UNKNOWN | No audit run |
| Lighthouse Best Practices | >90 | UNKNOWN | No audit run |
| Lighthouse PWA | >90 | UNKNOWN | No audit run |
| First Contentful Paint | <1.5s | UNKNOWN | No measurement |
| Time to Interactive | <3.0s | UNKNOWN | No measurement |
| Total asset download | - | ~5.85 MB | Measured from file sizes |
| IARC Rating | Obtained | NOT STARTED | Requires compliance docs first |

## What IS Working (Verified)

- Full offline gameplay loop (battle, upgrades, death, restart)
- All 12 enemy types with sprites and behaviors
- All 6 core skins + 4 background skins
- 28 VFX sprites wired into battle
- 25-card system with equip/unequip
- Research/Ranks permanent progression (6 families)
- Tournament bracket system (local/synthetic only)
- Goals/milestones with claim system
- Tier progression T1-T18
- Username/profile system
- Local save/load (localStorage, tower_save_v8)
- PWA install flow
- Service worker for offline
- Persistent bottom navigation
- Menu overlay during battle (live HP/wave shown)
- Gem earning (boss kills, ad simulation)
- Hold-to-buy rapid purchase
- Dev panel for testing

## Revised Honest Timeline

The original CRITICAL_PATH.md targets June 14 launch. Based on actual state:

| Blocker | Estimated Effort | Dependency |
|---------|-----------------|------------|
| Create Firebase web app + paste credentials | 15 minutes | None (just console work) |
| Asset pipeline (esbuild/Vite setup) | 1-2 days | None |
| CI/CD (GitHub Actions) | 1 day | Asset pipeline |
| Privacy policy + ToS drafts | 1 day | None |
| Loot box disclosure modal | 2-4 hours | None |
| RevenueCat real keys + sandbox testing | 1-2 days | RevenueCat dashboard setup |
| Analytics integration | 1 day | Firebase web credentials |
| Testing framework + 15 unit tests | 2-3 days | None |
| Lighthouse audit + fixes | 1 day | Asset pipeline |
| IARC rating application | 1-2 days | Compliance docs |
| Store submission prep (screenshots, descriptions) | 2-3 days | All above |

**Minimum time to beta-ready (parallel work): ~2 weeks**
**Minimum time to store submission: ~3-4 weeks**

## Single Biggest Unblock

Creating the Firebase web app in the console (15 minutes of manual work) would unblock:
- Task #10 (Auth UI) - immediately functional
- Task #3 (Analytics) - can integrate Firebase Analytics
- Cloud save sync
- Tournament multiplayer
- All server-side validation

This single action has the highest ROI of any remaining task.
