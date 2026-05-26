# Verification Report - Tasks 61-79
**Completed**: 2026-05-25 by Cowork Agent
**Game Version**: v0.7.25 / v0.7.26

---

## Task 61: CLAUDE_CODE_AGENT.md vs BUILD_PIPELINE_IMPLEMENTATION.md
**Result: CONSISTENT**
- BPI Week 1-4 maps cleanly to Claude Code Phases 2-3 (Tasks 26-70)
- One overlap: Capacitor native builds claimed by both Claude Code (Phase 5) and Codex (Phase 6). Resolution: Codex owns native per lane rules.
- Claude Code already completed build pipeline (scripts/build.js produces minified dist/)

## Task 62: CODEX_AGENT.md vs COMPLIANCE_SECURITY_ANALYTICS.md
**Result: CONSISTENT**
- CSA 6-week plan is a subset of Codex's 100-task scope
- All CSA deliverables have matching Codex tasks
- Codex has additional scope (monetization, ads) beyond CSA doc

## Task 63: File References in sessions.md
**Result: ALL EXIST**
- 34 unique .md files referenced, all present
- All code files referenced exist at stated paths
- No missing files

## Task 64: Capacitor appId Consistency
**Result: CONSISTENT (one known issue)**
- capacitor.config.json: `com.mcrdminted.coresurge` -- correct
- Apple/Google setup docs: same -- correct
- KNOWN ISSUE: STORE_PRODUCT_CATALOG uses `com.coresurge.*` prefix (wrong). Tracked in KNOWN_BUGS.md.

## Task 65: Firebase Project ID Consistency
**Result: CONSISTENT**
- Project ID `core-surge---tower-defense` found in:
  - js/cloud.js (authDomain, projectId, databaseURL, storageBucket)
  - android/app/src/main/assets/public/js/cloud.js
  - ios/App/App/public/js/cloud.js
  - Admin SDK service account JSON
- KNOWN ISSUE: apiKey and appId still empty strings

## Task 66: README.md Accuracy
**Result: MOSTLY ACCURATE**
- File tree, script load order, AI co-work rules all correct
- Stale: says v0.7.23 (now v0.7.25/v0.7.26)
- Missing: scripts/ folder, dist/ folder, BUILD.md reference

## Task 67: TODO/FIXME Comments
**Result: CLEAN**
- Zero TODO/FIXME/HACK/XXX/BUG comments found in any JS source file
- Nothing to add to KNOWN_BUGS.md

## Task 68: Service Worker Cache
**Result: CORRECT (v0.7.25)**
- Cache key: `core-surge-shell-v0-7-25` matches current version
- Caches all 11 JS files, 7 CSS files, manifest, HTML, all image assets
- Dist version serves single minified bundle instead

## Task 69: manifest.webmanifest
**Result: BROKEN - FILE TRUNCATED**
- Only 23 lines, ends mid-JSON array
- Missing closing brackets, missing required PNG icons (192x192, 512x512)
- PWA install prompts will fail on Android/iOS
- Added to KNOWN_BUGS.md

## Task 70: save.js Version Migration
**Result: ADEQUATE (v0.7.25 improved)**
- hydrateSaveState now validates: numeric clamping, rank level caps at maxRank, type coercion
- Version 8 is only supported format; pre-v8 purged on load
- No future migration path exists (will need one for v9)
- Card inventory shape not fully validated

## Task 71: Game Balance Review
**Result: CRITICAL BUG FOUND**

v0.7.25 overcorrected the balance. Mathematical analysis:
- costMul 1.18 with maxRank 400 = astronomically expensive later ranks
- By Tier 10 (328 runs, ~700K Scrap), player reaches only rank 50/400 = 12.5%
- Andy's spec: 75% by Tier 10
- Unlock families cost 377,500 total, exceeding T1-5 income

**Recommendation written to BALANCE_RECOMMENDATION.md:**
- Reduce maxRank to 10-25 per stat
- Keep costMul 1.13-1.18
- Reduce unlock family costs by ~50%
- Increase flatPerRank proportionally (fewer ranks but each more impactful)

Also resolved IAP pricing decision (Andy delegated):
- starter_pack: $4.99 (value anchor with Scrap + gems + card)
- gem_small: $0.99 (impulse)
- gem_medium: $4.99 (core revenue)
- gem_large: $9.99 (whale tier)
- monthly_vault: $2.99/mo (retention)

## Task 72: Tournament Tier Progression Math
**Result: CORRECT**
- 5 leagues: copper, bronze, silver, gold, platinum
- 72-hour cycles
- Top 10% promote, bottom 15% demote
- 6 bands by tier range (1-2, 3-5, 6-8, 9-11, 12-14, 15-18)
- Promotion/demotion thresholds use floor() on entry count * percentage -- correct
- Edge case: with < 10 entries, promoteCut = 0 (nobody promotes). Acceptable for small brackets.

## Task 73: CSS Media Queries
**Result: INSUFFICIENT**
- Only 1 media query found across all 7 CSS files: `@media (max-width: 520px)` in base.css
- No breakpoints for: 320px (iPhone SE), 375px (iPhone 12 mini), 414px (iPhone 12), 428px (iPhone 14 Pro Max), 768px (iPad)
- Game relies on viewport meta + percentage-based layouts + clamp() for responsiveness
- Not technically broken (game works at all sizes) but no device-specific optimizations
- Viewport meta is correct: `width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no`

## Task 74: Hardcoded Secrets/Credentials
**Result: CLEAN**
- No API keys, secret keys, passwords, or tokens found in JS source files
- backend/firebase-config.js uses `admin.initializeApp()` (auto-infers credentials from environment) -- correct
- Firebase config in cloud.js has EMPTY apiKey/appId (not leaked, just missing)
- RevenueCat keys in monetization.js are placeholder strings -- correct for dev

## Task 75: Script Load Order
**Result: CORRECT**
- dist/index.html loads: Firebase compat SDK (3 scripts) then `js/core-surge.min.js`
- Single bundle means no dependency ordering issues in production
- Source load order documented in README (data -> save -> game -> tournament -> render -> ui -> main -> skins)
- Build script handles concatenation order correctly

## Task 76: Firestore Rules Security
**Result: ADEQUATE WITH KNOWN GAPS**
- User saves: owner-only read/write -- correct
- Tournament brackets: public read, admin-only write -- acceptable for leaderboards
- IAP transactions: owner read, admin write -- correct
- Default deny-all catch-all -- correct
- KNOWN GAPS (already in KNOWN_BUGS.md):
  - No data shape validation (field types, sizes)
  - No document size limits at rules level
  - Tournament public read allows scraping all bracket data

## Task 77: backend/.env.example
**Result: PRESENT BUT MISMATCHED**
- .env.example exists with 12 variables documented
- firebase-config.js uses `admin.initializeApp()` which reads from Firebase environment (not .env)
- .env.example references `tower-game` as project ID but actual project is `core-surge---tower-defense`
- REVENUCAT vars listed but not referenced in backend code (RevenueCat is client-side via Capacitor)
- CORS_ORIGIN lists old pages.dev URL, not current workers.dev

**Fixes needed:**
- Update FIREBASE_PROJECT_ID to `core-surge---tower-defense`
- Update CORS_ORIGIN to include `https://tower-game.mcrdminted.workers.dev`
- Note that backend Cloud Functions don't read .env (Firebase auto-infers)

## Task 78: Image Asset Sizes
**Result: 3 FILES OVER 500KB**
- bg_02_industrial.png: 568KB (over limit)
- bg_04_steel.png: 537KB (over limit)
- bg_03_organic.png: 510KB (over limit)
- bg_01_cyber_grid.png: 366KB (under limit)
- All core sprites: 158-278KB (acceptable)
- All enemy sprites: 30-147KB (acceptable)
- Total assets folder: ~5.8MB

**Recommendation:** Compress the 3 over-limit backgrounds to WebP (typically 60-70% size reduction) or optimize PNGs with pngquant.

## Task 79: console.log Debug Statements
**Result: CLEAN FOR PRODUCTION**
- Game source (js/*.js): Only 2 console statements, both `console.error` in cloud.js for legitimate error logging
- Backend (backend/firebase-config.js): 1 console.log in tournament processing -- acceptable for Cloud Functions
- Scripts (scripts/*.js): Multiple console.log for CLI output -- acceptable (not shipped to users)
- No debug console.log in game code that would ship to production
- Build pipeline (dist/js/core-surge.min.js) strips comments but console calls remain -- the 2 error calls are fine

---

## Summary of New Issues Found

| Task | Issue | Severity | Action |
|------|-------|----------|--------|
| 69 | manifest.webmanifest truncated | High | Claude Code fix |
| 71 | Balance overcorrected (ranks unreachable) | Critical | Claude Code rebalance per BALANCE_RECOMMENDATION.md |
| 73 | Only 1 CSS media query | Low | Claude Code add breakpoints (Phase 1 polish) |
| 77 | .env.example has wrong project ID | Low | Codex fix |
| 78 | 3 background PNGs over 500KB | Medium | Claude Code compress |

## Previously Fixed (Confirmed in v0.7.25/v0.7.26)

- Service worker version stale -> FIXED
- persistSave silent errors -> FIXED
- No save validation -> FIXED
- No error boundary -> FIXED
- Rank progression too fast -> FIXED (but overcorrected)
- Boss outside range -> FIXED
- Spawn rate too high -> FIXED
- Gem popup too late -> FIXED
- Stats menu stuck -> FIXED
- Tier unlock W100 too high -> FIXED (now W50)
- No minification -> FIXED (build pipeline exists)
