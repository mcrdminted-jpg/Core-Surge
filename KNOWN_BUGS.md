# Core Surge - Known Bugs & Issues

## Critical

### ~~Rank upgrade progression curve is way too fast - players max skills by Tier 1-2~~ **FIXED v0.7.25**
- **Fix applied**: Raised costMul across all starter ranks (1.12→1.18 for damage, 1.13→1.19 for fireRate, etc.). Raised cost0 for several stats. Crit family costs also increased. Combined with coinRewardForRun nerf, progression should stretch across all tiers.
- **Reported**: 2026-05-25 by Andy (observed in gameplay)

### ~~Cash bonus / coin income too high for Tier 1~~ **FIXED v0.7.25**
- **Fix applied**: cashBonus cost0 raised 18→25, costMul raised 1.12→1.18. coinRewardForRun wavePart exponent reduced 1.35→1.15, cashPart exponent reduced 0.60→0.50, bossPart reduced 8→6 per boss. Tier multiplier on coin rewards increased (1.20→1.30) so higher tiers feel more rewarding while T1 stays modest.
- **Reported**: 2026-05-25 by Andy (observed in gameplay)

### ~~Spawn rate too high at lower tiers - no multishot to counter~~ **FIXED v0.7.25**
- **Fix applied**: spawnIntervalForWave() now scales by tier. Tier 1 spawns 60% slower, scaling down to 0% bonus by Tier 5+. This gives single-target players time to handle enemies without multishot.
- **Reported**: 2026-05-25 by Andy (observed in gameplay)

### ~~Stats menu stays stuck on screen after death~~ **FIXED v0.7.25**
- **Fix applied**: endRun() now force-closes the liveStats panel via `classList.remove('open')`.
- **Reported**: 2026-05-25 by Andy (observed in gameplay)

### ~~Gem orb popup appears too late and too infrequently~~ **FIXED v0.7.25**
- **Fix applied**: First orb spawn reduced from 2 minutes to 45 seconds. Recurring spawn interval reduced from 6-8 min to 3-4 min.
- **Reported**: 2026-05-25 by Andy (observed in gameplay)

### ~~Boss enemy stays outside tower range and cannot be hit~~ **FIXED v0.7.25**
- **Fix applied**: Boss speedMul increased from 0.3 to 0.5. Boss now reaches combat range in roughly half the time (~8-15 seconds on a tall phone instead of 15-38).
- **Reported**: 2026-05-25 by Andy (observed in gameplay)

### ~~Tier unlock threshold (W100) may be too high given balance state~~ **FIXED v0.7.26**
- **Fix applied**: Changed tier unlock threshold from W100 to W50 in game.js (`prevBest < 50 && maxWave >= 50`) and ui.js display string. Progress bar now shows percentage toward W50.
- **Reported**: 2026-05-25 by Andy (observed in gameplay)

### ~~v0.7.25 balance overcorrection - progression now impossibly slow~~ **FIXED v0.7.27**
- **Fix applied**: Complete rebalance per BALANCE_RECOMMENDATION.md. maxRank reduced from 100-400 to 8-25 per stat. flatPerRank increased proportionally. Unlock family costs reduced ~50% (377,500→225,500 total). Total rank levels: 354 (down from 2330). 75% completion now reachable by T8-10 with ~328 runs. Save migration v8→v9 clamps existing rank levels.
- **Found**: 2026-05-25 (QA Task 71 mathematical verification)

### ~~Gem Find rank does nothing (combat gem drops removed)~~ **FIXED v0.7.28**
- **Fix applied**: Repurposed gemFind to "Gem Attractor" — each rank reduces gem orb spawn interval by 8% (12 ranks = 96%, capped at 85% reduction). Wired into all three orb spawn delay points in main.js (initial, after-fade, after-collect).
- **Found**: 2026-05-25 (progression simulation)

### ~~Progression WAY too fast — 100% ranks in 22 days, T10 in 3 days~~ **FIXED v0.7.28**
- **Fix applied**: Deep rebalance. costMul raised across all ranks (1.25-1.35 range, was 1.13-1.20). maxRank increased (12-40, was 4-25). Total 534 ranks. Unlock family costs scaled from 225K→1,775K total. Grand total scrap cost: ~3.75M. Simulation confirms: 75% at Day 202, 100% at Day 310 (4 runs/day F2P). Save migration v9→v10 clamps ranks.
- **Found**: 2026-05-25 (progression simulation)

### ~~Milestone rewards trivially small~~ **FIXED v0.7.28**
- **Fix applied**: milestoneReward formula scaled up: `wave * 2.5 * 2.0^(tier-1)` (was `wave * 0.8 * 1.7^(tier-1)`). T1W25=62 scrap, T1W100=250, T5W100=4000, T10W100=128K. Meaningful one-time rewards that scale with tier.
- **Found**: 2026-05-25 (progression simulation)

### Firebase apiKey and appId are empty strings
- **Location**: `js/cloud.js` (CLOUD_DEFAULT_CONFIG object)
- **Impact**: All cloud features (auth, leaderboards, cloud saves) silently fail
- **Fix**: Retrieve values from Firebase Console and populate config

## Gameplay Logic Bugs

### ~~Bounce system silently does nothing at rank 0~~ **FIXED v0.7.31**
- **Fix applied**: `getBounceTargets()` used `eff` as base, returning 0 when bounceTargets rank was 0. Changed to `1 + eff` to match how `getMultishotTargets()` works. Bounce procs now correctly allow 1 bounce at rank 0.
- **Found**: 2026-05-26 (code audit)

### ~~Time Lock apex card never fires (Date.now vs performance.now mismatch)~~ **FIXED v0.7.31**
- **Fix applied**: `startBattle()` initialized `game.timeLockLastTrigger = Date.now()` (epoch ms) but `tickTimeLock()` compared against `performance.now()` (page-relative ms). Changed init to `0` so the existing guard in `tickTimeLock` correctly sets it to `performance.now()` on first tick.
- **Found**: 2026-05-26 (code audit)

### ~~Combo decay formula barely decays, then snaps to 0~~ **FIXED v0.7.31**
- **Fix applied**: Old formula `comboCount * (1 - decayProgress * 0.02)` only reduced combo to 98% per frame. Changed to linear decay from peak: captures `_comboPeakForDecay` at decay start, then `peak * (1 - decayProgress)` smoothly reaches 0 at window end.
- **Found**: 2026-05-26 (code audit)

### ~~Float text pool race condition (damage numbers disappear early)~~ **FIXED v0.7.31**
- **Fix applied**: Pooled float elements were returned via `setTimeout(600ms)` but could be reused before that timeout fired. The first timeout would then hide the second float prematurely. Added a generation counter (`_floatGen`) — stale timeouts check the counter and skip the pool return if the element was reused.
- **Found**: 2026-05-26 (code audit)

### ~~Crit chance display rounds away upgrade effect~~ **FIXED v0.7.31**
- **Fix applied**: Changed `upgradeDescriptor` critChance from `.toFixed(0)` to `.toFixed(1)` so +0.5% per rank is visible (was showing "2%" → "2%" after buying a rank).
- **Found**: 2026-05-25 (alpha tester report FB-04)

### ~~Buy multiplier ×100 desync between battle and research~~ **FIXED v0.7.31**
- **Fix applied**: `cycleBuyMultiplier()` had order `[1, 10, 100, 'max']` but research tab only rendered `[1, 10, 'max']`. Removed ×100 from cycle to match research tab. Player can no longer get stuck at ×100 with no visible way to change it.
- **Found**: 2026-05-26 (code audit)

### ~~Home progress bar "next tier ready" threshold wrong (W100 vs W50)~~ **FIXED v0.7.31**
- **Fix applied**: Dead `renderHomePanels()` function had `nextTierReady = bestThisTier >= 100` while actual tier unlock logic uses W50. Removed entire dead function (replaced by `renderHomePanelsVisual()`). Active renderer already uses correct W50 threshold.
- **Found**: 2026-05-26 (code audit)

### ~~endRun() dual Date.now() causes stat drift~~ **FIXED v0.7.31**
- **Fix applied**: Two separate `Date.now()` calls (for playtime tracking and for run duration display) could differ by several ms. Captured `const endTime = Date.now()` once at top of `endRun()` and used it for both.
- **Found**: 2026-05-26 (code audit)

### ~~Dead code: rollMultishotCount() function~~ **FIXED v0.7.31**
- **Fix applied**: Removed unused `rollMultishotCount()` which was defined but never called. The actual multishot logic uses an inline `Math.random() < getMultishotChance()` check. The dead function would also have been wrong if called (ignores `getMultishotTargets()`).
- **Found**: 2026-05-26 (code audit)

### monetization.js references non-existent function `scheduleCloudSync`
- **Location**: `js/monetization.js` line ~229
- **Impact**: After a purchase is verified by RevenueCat, the cloud sync call fails silently. Purchased entitlements may not persist to cloud save.
- **Fix**: Replace `scheduleCloudSync` with `queueCloudSave` (the actual function name in cloud.js)
- **Found**: 2026-05-25 (code audit)

### devMode/godMode are client-side toggleable with no server validation
- **Location**: `js/save.js` (save.settings.devMode, save.devState.godMode)
- **Impact**: Players can enable god mode and dev mode by editing localStorage. Any scores, leaderboard entries, or tournament results achieved with cheats are indistinguishable from legitimate play.
- **Fix**: When cloud features are active, server should validate that devMode/godMode are off before accepting leaderboard/tournament submissions. Flag or reject saves with these enabled.
- **Found**: 2026-05-25 (code audit)

### All game state is client-authoritative
- **Location**: All JS files, `js/save.js`, `js/tournament.js`
- **Impact**: Entire game state lives in localStorage. Players can edit coins, gems, ranks, cards, tournament brackets, and leaderboard scores freely. Tournament system generates synthetic competitors client-side with no server verification.
- **Fix**: For v1.0, at minimum: server-side validation of leaderboard submissions, cloud save integrity checks (hash or checksum), tournament server authority. Full fix requires moving authoritative state to backend.
- **Found**: 2026-05-25 (code audit)

## Data Consistency Issues

### ~~STORE_PRODUCT_CATALOG prices mismatch Game Design Document~~ **FIXED v0.7.27**
- **Fix applied**: Store prices updated per BALANCE_RECOMMENDATION.md best practices: starter_pack $4.99 (500 gems + 5000 scrap + Prime card), gem_small $0.99 (80 gems), gem_medium $4.99 (500 gems), gem_large $9.99 (1200 gems — new product), monthly_vault $2.99/mo (50 gems/day). Each tier has distinct pricing with clear value scaling.
- **Found**: 2026-05-25 (code audit)

### ~~Product ID prefix inconsistency~~ **FIXED v0.7.26**
- **Fix applied**: Standardized all STORE_PRODUCT_CATALOG product IDs from `com.coresurge.*` to `com.mcrdminted.coresurge.*` to match the app bundle ID in capacitor.config.json.
- **Found**: 2026-05-25 (code audit)

### ~~GDD says 6 unlock families but data.js has 11~~ **FIXED v0.7.27**
- **Fix applied**: Updated GAME_DESIGN_DOCUMENT.md to list all 11 unlock families with correct costs (total 225,500 scrap). Also updated IAP products, gem orb timing, save version, and tier unlock threshold to match current code.
- **Found**: 2026-05-25 (code audit)

## Code Quality Issues

### ~~persistSave() silently swallows errors~~ **FIXED v0.7.25**
- **Fix applied**: persistSave now logs errors, shows a red toast warning ("Save failed — storage may be full"), and throttles the warning to once per 60s.
- **Found**: 2026-05-25 (code audit)

### ~~No save data integrity validation on load~~ **FIXED v0.7.25**
- **Fix applied**: hydrateSaveState now validates all numeric fields (coins, gems, totalRuns, bestTier, bestWave, totalCashEarned, totalEnemiesKilled, totalPlaytimeMs, totalBossesDefeated, totalGemsEarned) with parseInt/parseFloat + Math.max(0,...) clamping. NaN and negative values are sanitized to 0 or valid defaults.
- **Found**: 2026-05-25 (code audit)

### Cloud saves have no document size limit check
- **Location**: `js/cloud.js`
- **Impact**: Save data is written to Firestore as a single document. Firestore has a 1MB document size limit. As card inventory and tournament history grow, saves could exceed this limit and fail silently.
- **Fix**: Check serialized save size before writing to Firestore. If approaching limit, prune old tournament data or compress.
- **Found**: 2026-05-25 (code audit)

### ~~No DOM element pooling in render.js~~ **FIXED v0.7.26**
- **Fix applied**: Added `_pool` object with pools for enemies, projectiles, enemy projectiles, and float text. Dead entities return their DOM elements to pools instead of removing them. New entities check pools before creating fresh elements. Pools are flushed on battle start to prevent cross-run leaks.
- **Found**: 2026-05-25 (code audit)

### ~~Stale version comments in ui.js~~ **FIXED v0.7.26**
- **Fix applied**: Removed 6 stale version-prefixed comments (v0.7.15, v0.7.16, v0.7.17) from ui.js. Comments now describe what the code does without referencing when it was added.

### ~~No error boundary~~ **FIXED v0.7.25**
- **Fix applied**: Added window.onerror and unhandledrejection handlers in main.js. On error: logs to console, shows red toast warning, and attempts to persist save as a safety measure.

### ~~No input validation on username field~~ **ALREADY FIXED (profile.js)**
- **Status**: Validation already exists in profile.js: USERNAME_MIN_LEN=3, USERNAME_MAX_LEN=16, USERNAME_REGEX=/^[A-Za-z0-9_-]+$/. HTML input also enforces maxlength=16 and pattern attribute. This bug was already resolved prior to audit.

### ~~No rate limiting on card pulls (client-side)~~ **FIXED v0.7.26**
- **Fix applied**: Added 800ms cooldown + button disable after each successful single or bundle pull. Prevents accidental double-pulls and rapid-fire gem drain. Server-side validation still needed when cloud features are active.

## Security Issues

### Firestore rules have no data shape validation
- **Location**: `backend/firestore.rules`
- **Impact**: Any authenticated user can write arbitrary data shapes to their save document. No field validation, no size limits enforced at the rules level.
- **Fix**: Add Firestore rules that validate: required fields exist, numeric fields are numbers within expected ranges, string fields have length limits, document size is bounded.
- **Found**: 2026-05-25 (code audit)

### Tournament brackets are public read in Firestore rules
- **Location**: `backend/firestore.rules`
- **Impact**: Anyone can read all tournament data. Combined with client-authoritative tournament logic, this means bracket manipulation is trivial.
- **Fix**: Restrict tournament reads to participants only. Move tournament logic server-side (Cloud Functions).
- **Found**: 2026-05-25 (code audit)

### No Content Security Policy headers
- **Location**: `firebase.json` / hosting config
- **Impact**: No CSP means the game is vulnerable to XSS injection if any user content (usernames, leaderboard entries) is rendered unsanitized.
- **Fix**: Add CSP headers in firebase.json hosting config. At minimum: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'`
- **Found**: 2026-05-25 (code audit)

## Infrastructure Issues

### No offline queue for failed cloud syncs
- **Location**: `js/cloud.js`
- **Impact**: If a cloud save fails (network error, timeout), the data is lost. No retry queue, no offline buffer.
- **Fix**: Implement a simple retry queue. On cloud save failure, store the pending save and retry on next successful connection.
- **Found**: 2026-05-25 (code audit)

### ~~No minification/bundling in build pipeline~~ **FIXED v0.7.25**
- Build pipeline now exists: `scripts/build.js` produces `dist/js/core-surge.min.js` (274KB -> 177KB) and minified CSS (126KB -> 92KB).

### ~~service-worker.js caches stale version and missing files~~ **FIXED v0.7.26**
- **Fix applied**: Cache version updated to v0-7-25→v0-7-26. Added cloud.js, monetization.js, and all game assets (cores, backgrounds, enemies, VFX) to CORE_SURGE_ASSETS cache list.

### ~~manifest.webmanifest is truncated / malformed JSON~~ **FIXED v0.7.26**
- **Fix applied**: Manifest rebuilt with valid JSON, three icon entries (SVG any, SVG maskable, PNG fallback), added `id` field for stable PWA identity.

### ~~package.json missing mobile scripts~~ **FIXED v0.7.27**
- **Fix applied**: Added `mobile:run:ios`, `mobile:run:android`, and `deploy` scripts. Build+sync+run pipeline now available as single npm commands. All Capacitor commands documented as npm scripts.

### ~~No 404/error page for Firebase Hosting~~ **FIXED v0.7.26**
- **Fix applied**: Created themed 404.html with game-styled layout. Added cleanUrls and trailingSlash config to backend/firebase.json. Build script copies 404.html to dist.

### ~~manifest.webmanifest issues~~ **FIXED v0.7.26**
- **Fix applied**: Split deprecated `purpose: "any maskable"` into two separate icon entries. Added `id` field. Added PNG fallback icon. See manifest fix above for details.
- **Found**: 2026-05-25 (Task 69 audit)

### ~~Missing .firebaserc file~~ **FIXED v0.7.26**
- **Fix applied**: Created `.firebaserc` with `{"projects": {"default": "core-surge---tower-defense"}}` in project root.
- **Found**: 2026-05-25 (Task 65 audit)

### ~~Save version field written but never read~~ **FIXED v0.7.26**
- **Fix applied**: Added `SAVE_MIGRATIONS` object keyed by version number with `migrateSave()` function in save.js. `loadSave()` now runs migrations before hydration. `CURRENT_SAVE_VERSION` constant replaces hardcoded `8`. Future schema changes just add a new migration entry.
- **Found**: 2026-05-25 (Task 70 audit)

### ~~Rank levels not capped at maxRank during save load~~ **FIXED v0.7.25**
- **Fix applied**: hydrateSaveState now clamps each rank level with `Math.max(0, Math.min(lvl, RANK_DEFS[k].maxRank))`. Also uses parseInt to ensure levels are valid integers.
- **Found**: 2026-05-25 (Task 70 audit)

## Tester-Reported Issues (Alpha Feedback - Alex Murphy, 2026-05-25)

### Crit Systems card content overflows box boundaries
- **Location**: CSS `.mor-fam` in `css/mockup-overlay.css`, Research tab Combat sub-tab
- **Impact**: Visual bug. Crit Systems family card text/icons push outside the card borders on some viewport sizes.
- **Fix**: Adjust font sizes, element positions, or card aspect ratio. Card has `overflow: hidden` but absolute-positioned children may exceed bounds.
- **Ref**: TESTER_FEEDBACK_LOG.md FB-03
- **Found**: 2026-05-25 (alpha tester screenshot)

### ~~Crit chance display rounds away upgrade effect~~ **FIXED v0.7.31**
- **Fix applied**: Changed from `.toFixed(0)` to `.toFixed(1)` so +0.5% increments are visible.
- **Ref**: TESTER_FEEDBACK_LOG.md FB-04
- **Found**: 2026-05-25 (alpha tester report)

### ~~Milestone rewards trivially small at all tiers~~ **FIXED v0.7.28**
- **Fix applied**: milestoneReward base multiplier increased from `wave * 0.8 * 1.7^(tier-1)` to `wave * 2.5 * 2.0^(tier-1)`. T1W25=62, T1W100=250, T5W100=4000. Meaningful progression rewards.
- **Ref**: TESTER_FEEDBACK_LOG.md FB-05, FB-09
- **Found**: 2026-05-25 (alpha tester report)

### In-run crit upgrades make permanent crit ranks worthless
- **Location**: `js/game.js` getCritChance() - in-run upgrade gives +1% per level
- **Impact**: 100 in-run levels = 100% crit chance, making the permanent critChance rank (0.5% per rank, 15 ranks = 7.5% total) irrelevant. Devalues the entire progression system for crit.
- **Fix**: NEEDS ANDY DECISION. Options: cap in-run crit at 50 levels, reduce per-level to 0.5%, or make in-run crit progressively more expensive. Same principle may apply to other chance-based in-run upgrades.
- **Ref**: TESTER_FEEDBACK_LOG.md FB-07, FB-13
- **Found**: 2026-05-25 (alpha tester report)

### Higher tiers don't feel noticeably harder
- **Location**: `js/game.js` hpTierMul(), dmgTierMul() functions
- **Impact**: Tester reports T16 doesn't feel more difficult than T10. Tier scaling may be too flat at high tiers.
- **Fix**: Verify tier multiplier curves. May need steeper exponential scaling above T10.
- **Ref**: TESTER_FEEDBACK_LOG.md FB-17
- **Found**: 2026-05-25 (alpha tester report)

### Currency name "coins" doesn't fit game theme
- **Location**: All JS files, HTML, CSS, documentation
- **Impact**: The game already uses "Scrap" in several places (HUD shows "SCRAP", store says "scrap"), but code variables still use `coins` and some UI text says "coins." Inconsistent naming breaks immersion.
- **Fix**: Full rename pass. All player-facing text should say "Scrap" (already partially done). Internal variable names (`save.coins`, `coinRewardForRun`, etc.) can stay as `coins` in code but all display text must be consistent.
- **Found**: 2026-05-25 (Andy directive)

## Documentation Mismatches

### ~~README.md is outdated (multiple issues)~~ **FIXED v0.7.27**
- **Fix applied**: Updated README to v0.7.27. Added cloud.js, profile.js, monetization.js, profile.css to file tree. Fixed save key reference to tower_save_v8 (version 9). Updated deploy section with build step. Updated script load order to include Firebase CDN, cloud, monetization, profile. Added test script to local verification.
- **Found**: 2026-05-25 (Task 66 audit)

### FRONTEND_INTEGRATION.md references wrong file
- States Firebase config is in `main.js` but it is actually in `cloud.js`
- Could mislead future development work

### BUILD_STATUS.md has false checkmarks
- Shows main.js Firebase integration as complete
- Firebase integration is NOT complete (missing credentials)

### CLAUDE_CODE_AGENT.md vs BUILD_PIPELINE_IMPLEMENTATION.md inconsistencies
- **Found (Task 61 audit)**:
  - BUILD_PIPELINE assigns Capacitor native builds to Claude Code, but CLAUDE_CODE_AGENT.md marks ios/, android/, capacitor.config.json as Codex's lane. Scope conflict.
  - Missing from agent tasks: CDN strategy, environment config files (dev/staging/prod), version.js/window.GAME_VERSION management, GitHub Releases upload
- **Fix**: Resolve the Capacitor lane ownership. Add missing tasks to the appropriate agent.

### CODEX_AGENT.md vs COMPLIANCE_SECURITY_ANALYTICS.md inconsistencies
- **Found (Task 62 audit)**:
  - Missing from Codex tasks: Privacy Policy draft, Terms of Service draft, Loot Box Compliance, IARC rating, app store listing prep, dashboard/monitoring setup, dependency/vulnerability audit, compliance documentation package
  - Note: Some of these were done by Cowork agent (Tasks 21-40), but Codex has no corresponding implementation tasks for the technical side
- **Fix**: Add missing compliance implementation tasks to Codex agent list

### sessions.md references non-existent file
- References `backend/firebase.js` but actual file is `backend/firebase-config.js`
- Minor naming discrepancy in session logs
