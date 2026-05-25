# Dependency Matrix - Cross-Agent Task Dependencies

**Date:** 2026-05-24
**Sources:** COWORK_AGENT.md, CLAUDE_CODE_AGENT.md, CODEX_AGENT.md

---

## Cross-Agent Dependencies

These are tasks where one agent's output is required before another agent can proceed.

| Blocker Task | Blocked Task | Validation Method | Resolution Owner |
|-------------|-------------|-------------------|-----------------|
| Codex Task 1: Create Firebase web app | Codex Task 2: Update main.js firebaseConfig | Verify apiKey, messagingSenderId, appId are real values in main.js | Codex |
| Codex Task 1: Create Firebase web app | Codex Task 3: Update cloud.js firebaseConfig | Same credentials must appear in cloud.js | Codex |
| Codex Task 1-3: Firebase credentials | Cowork Task 89: Update all config files with credentials | Cowork verifies all config files match after Codex provides creds | Cowork |
| Codex Task 8: Deploy Cloud Functions | Codex Tasks 11-14: Test Cloud Functions | Deployed functions must respond to HTTP requests | Codex |
| Codex Task 8: Deploy Cloud Functions | Cowork Task 11: Verify Firebase config matches | Compare firebase-config.js exports vs deployed function names | Cowork |
| Cowork Task 5: Game Design Document | Claude Code Task 5: Research tab visual design | GDD informs which UI elements need emphasis | Cowork |
| Cowork Task 12: Asset Manifest | Claude Code Task 32-34: Optimize/convert images | Need complete asset list before optimization pass | Cowork |
| Cowork Tasks 21-28: Compliance docs | Codex Tasks 41-65: Monetization implementation | Privacy policy and disclosure docs inform what data can be collected | Cowork |
| Cowork Task 21: Privacy Policy | Codex Task 100: Store submission | Both stores require privacy policy URL before submission | Cowork |
| Cowork Task 22: Terms of Service | Codex Task 100: Store submission | Both stores require ToS URL before submission | Cowork |
| Claude Code Tasks 26-28: Build pipeline | Codex Task 91: Cap sync with dist/ | Capacitor sync needs a built dist/ folder to copy | Claude Code |
| Claude Code Task 28: npm run build | Codex Task 18: Deploy Firebase Hosting | Hosting deploys dist/ which build creates | Claude Code |
| Claude Code Task 28: npm run build | Codex Tasks 92-93: Android/iOS build | Native builds wrap the web output | Claude Code |
| Claude Code Phase 2: Build output | Cowork Task 81: Verify Claude Code files | Need actual build artifacts to verify | Claude Code |
| Codex Phase 1: Backend deployment | Cowork Task 82: Verify Codex files | Need actual deployed endpoints to verify | Codex |
| Codex Tasks 41-45: RevenueCat setup | Codex Tasks 47-52: Purchase testing | Products must exist in RevenueCat + stores before testing | Codex |
| Codex Tasks 56-58: AdMob setup | Codex Tasks 59-64: Ad implementation | AdMob account and SDK required before ad code | Codex |
| Codex Task 81: Save encryption | Claude Code Task 72: Unit tests for save.js | Test suite must account for encryption layer | Codex |
| Codex Task 79: Crashlytics | Claude Code Task 62: Error tracking | Only one error tracking system needed; coordinate choice | Both |
| Cowork Task 14: Testing Checklist | Cowork Task 91: Run full QA before beta | Checklist must exist before it can be executed | Cowork |
| Cowork Task 28: IARC Questionnaire Prep | Codex Task 100: Store submission | IARC rating is required for store listings | Cowork |
| Cowork Task 90: Update docs with IARC rating | Codex Task 100: Store submission | Rating must be obtained and documented | Cowork |

---

## Within-Agent Sequential Dependencies (Cowork)

| Blocker Task | Blocked Task | Validation Method | Resolution Owner |
|-------------|-------------|-------------------|-----------------|
| Task 1: INDEX.md | Task 63: Verify files from sessions.md | INDEX provides master file list to check against | Cowork |
| Task 3: CHANGELOG.md | Task 48: "What's New" text | Changelog feeds store update text | Cowork |
| Task 5: Game Design Document | Task 7: Balance Spreadsheet | GDD defines systems to balance | Cowork |
| Task 14: Testing Checklist | Task 91: Run full QA | Checklist defines what to test | Cowork |
| Tasks 21-28: Compliance drafts | Tasks 37-38: Review against implementation | Drafts must exist before review | Cowork |
| Task 41-47: Store listing drafts | Tasks 50-53: Store review notes | Listings inform reviewer guidance | Cowork |
| Tasks 61-79: Verification tasks | Task 80: Verification Report | Report summarizes all verification results | Cowork |
| Task 85: Launch Tracker | Task 92: Pre-launch verification | Tracker shows what's left | Cowork |

---

## Within-Agent Sequential Dependencies (Claude Code)

| Blocker Task | Blocked Task | Validation Method | Resolution Owner |
|-------------|-------------|-------------------|-----------------|
| Task 26: esbuild/webpack config | Task 27: CSS minification | Build system must exist first | Claude Code |
| Task 26-27: Build tools | Task 28: npm run build script | Build steps compose into single command | Claude Code |
| Task 28: Build script | Tasks 29, 36-38: Measure metrics | Need built output to measure | Claude Code |
| Task 28: Build script | Task 42: Service worker update | SW must cache built files | Claude Code |
| Task 30-31: Dead code audit | Task 29: Bundle size measurement | Remove dead code before measuring | Claude Code |
| Task 28: Build script | Tasks 48-49: Cache busting + verification | Need working build before adding hashing | Claude Code |
| Task 28: Build script | Task 51: CI build step | CI runs the same build command | Claude Code |
| Task 51: CI build | Tasks 52-57: CI pipeline steps | Each step adds to the CI workflow | Claude Code |
| Task 71: Test framework | Tasks 72-79: Unit/integration tests | Framework must be set up first | Claude Code |
| Tasks 72-79: Tests written | Tasks 80, 88-89: Coverage + CI test step | Tests must exist before coverage or CI runs them | Claude Code |
| Task 91: Render profiling | Tasks 92-93: Optimization | Must identify bottlenecks before fixing | Claude Code |

---

## Within-Agent Sequential Dependencies (Codex)

| Blocker Task | Blocked Task | Validation Method | Resolution Owner |
|-------------|-------------|-------------------|-----------------|
| Task 1: Create Firebase web app | Tasks 2-3: Update config files | Credentials needed | Codex |
| Tasks 4-5: Enable Firestore + Auth | Tasks 8-10: Deploy functions + rules | Services must be enabled | Codex |
| Task 6: Install Firebase CLI | Tasks 7-10: All CLI operations | CLI required | Codex |
| Task 7: Firebase login | Task 8: Deploy functions | Must be authenticated | Codex |
| Task 8: Deploy functions | Tasks 11-14: Test functions | Functions must be deployed to test | Codex |
| Task 16: Set up emulator | Task 17: Test on emulator | Emulator must be configured | Codex |
| Tasks 21-23: Auth flows | Tasks 28-30: Cloud save wiring | Auth required for save sync | Codex |
| Tasks 28-30: Cloud save | Tasks 36-37: Save integration tests | Save system must be wired before testing | Codex |
| Task 41: RevenueCat account | Tasks 42-45: Product setup | Account needed for products | Codex |
| Tasks 42-44: Store products | Tasks 47-49: Purchase testing | Products must exist in stores | Codex |
| Task 56: Choose ad network | Tasks 57-58: AdMob setup | Decision needed first | Codex |
| Tasks 57-58: AdMob account + SDK | Tasks 59-64: Ad implementation | SDK must be integrated | Codex |
| Task 66: Firebase Analytics SDK | Tasks 67-78: Track events | SDK must be integrated first | Codex |
| Task 91: Cap sync | Tasks 92-93: Build and run native | Sync must succeed before building | Codex |
| Tasks 92-93: Native builds work | Tasks 98-99: Release builds | Debug builds must work first | Codex |
| Tasks 94-97: Icons + signing | Task 100: Store submission | All assets and signing required | Codex |

---

## Critical Path (Longest Dependency Chain)

The longest blocking chain to production launch:

```
Codex Task 1 (Firebase web app credentials)
  -> Codex Tasks 2-3 (config updates)
    -> Codex Tasks 4-5 (enable services)
      -> Codex Task 8 (deploy functions)
        -> Codex Tasks 21-23 (auth flows)
          -> Codex Tasks 28-30 (cloud save)
            -> Claude Code Task 28 (build pipeline)
              -> Codex Task 91 (cap sync)
                -> Codex Tasks 92-93 (native builds)
                  -> Cowork Tasks 21-22 (privacy/ToS)
                    -> Codex Task 100 (store submission)
```

**Estimated minimum steps on critical path: 15+**

---

## Current Blockers (as of 2026-05-24)

| Blocker | What It Blocks | Owner | Status |
|---------|---------------|-------|--------|
| Firebase web app not created | All frontend Firebase integration, cloud save, auth | Codex | NOT STARTED |
| Build pipeline not set up | Native builds, CI/CD, hosting deployment | Claude Code | NOT STARTED |
| Privacy Policy not drafted | Store submission | Cowork | NOT STARTED |
| Terms of Service not drafted | Store submission | Cowork | NOT STARTED |
| RevenueCat account not created | All monetization | Codex | NOT STARTED |
| AdMob account not created | All ad integration | Codex | NOT STARTED |
| IARC rating not obtained | Store submission | Cowork/Andy | NOT STARTED |

---

## Resolution Priority (Recommended Order)

1. **Codex Task 1** - Create Firebase web app (unblocks entire backend pipeline)
2. **Claude Code Tasks 26-28** - Build pipeline (unblocks native builds and hosting)
3. **Cowork Tasks 21-22** - Privacy Policy and ToS (unblocks store submission)
4. **Codex Tasks 41-45** - RevenueCat + store products (unblocks monetization testing)
5. **Cowork Task 28** - IARC questionnaire prep (unblocks store rating)
