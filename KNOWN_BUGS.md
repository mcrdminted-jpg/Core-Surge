# Core Surge - Known Bugs & Issues

## Critical

### Rank upgrade progression curve is way too fast - players max skills by Tier 1-2
- **Location**: `js/data.js` (rank cost curves: cost0, costMul per stat)
- **Impact**: Game-breaking balance issue. Players can nearly max all rank upgrades within Tier 1. By Tier 2 everything is maxed. Tiers 3-18 have no progression left, making the game pointless.
- **Expected progression (Andy's spec):**
  - ~10 games to reach Tier 2
  - ~15 games to reach Tier 3 (1.25x multiplier per tier)
  - By Tier 10: ~75% of upgrades completed (e.g., 350 of 400 levels)
  - Upgrades should NOT be near-maxed at Tier 1
- **Root cause**: costMul (geometric cost scaling) is too low. Coins earned per run vs. upgrade costs means players accumulate ranks far faster than intended. The cost curve needs to be much steeper so upgrades stretch across all 18 tiers.
- **Fix**: Increase costMul values significantly in data.js. Recalculate cost0 base costs. Possibly reduce coin income per wave or increase the number of rank levels. The goal is a smooth progression curve where rank investment is still meaningful at Tier 10+.
- **Related**: See "Cash bonus / coin income too high" below -- this is part of the same balance problem.
- **Reported**: 2026-05-25 by Andy (observed in gameplay)

### Cash bonus / coin income too high for Tier 1
- **Location**: `js/data.js` (cashBonus rank, coinRewardForRun in game.js), `js/game.js` (wave cash drops, coinRewardForRun)
- **Impact**: Part of the progression collapse. Cash bonus rank upgrades compound with already-generous Tier 1 coin income, so players accumulate coins far too fast.
- **Andy's analysis**: "Cash bonus gives TOO MUCH too quick. T1 enemies are the issue -- weaker enemies, less money needed for upgrades, less coin gain overall."
- **Root cause (multi-factor)**:
  1. cashBonus rank (cost0:8, costMul:1.10, flatPerRank:0.02) is extremely cheap to level. 20% coin bonus at rank 10 costs almost nothing.
  2. Tier 1 enemy HP/damage is low, so players clear waves fast with minimal upgrades, banking excess coins.
  3. coinRewardForRun() formula (wavePart + cashPart + bossPart) may be too generous at Tier 1.
  4. Combined effect: cheap upgrades + fast clears + coin bonuses = maxed ranks in 5-10 runs.
- **Fix**: Multiple levers need tuning together:
  - Reduce base coin drops per wave at Tier 1
  - Increase cashBonus rank cost curve (higher costMul)
  - Possibly reduce coinRewardForRun base values
  - Make Tier 1 enemies slightly tougher so runs take longer and yield less surplus
  - All changes must be balanced against the progression spec (see rank progression bug above)
- **Reported**: 2026-05-25 by Andy (observed in gameplay)

### Spawn rate too high at lower tiers - no multishot to counter
- **Location**: `js/game.js` (wave spawn logic, spawnInterval calculation), `js/data.js` (enemiesPerWave, spawn timing)
- **Impact**: At Tier 1, enemies spawn faster than the tower can kill them with single-shot only. Player has no multishot unlocked yet (gated behind multishotSystems unlock family). Results in being overwhelmed with no counterplay available.
- **Andy's note**: "Spawn rate too high lower levels too, no multi shot or anything to counter"
- **Root cause**: Spawn interval does not account for the player's current capabilities. At Tier 1 with no unlock families purchased, the player has single-target, base fire rate only. If enemies spawn faster than kill time, the player is guaranteed to lose.
- **Fix**: Tier 1 spawn rate must be tuned so a player with ONLY starter upgrades (no unlock families) can keep up. Options:
  1. Reduce enemiesPerWave at Tier 1
  2. Increase spawn interval at Tier 1 (slower spawns)
  3. Reduce early-wave enemy HP so kills are faster
  4. Give a small base multishot chance (e.g., 5%) without requiring the unlock family
  5. Scale spawn rate based on player's current DPS capability
- **Reported**: 2026-05-25 by Andy (observed in gameplay)

### Stats menu stays stuck on screen after death
- **Location**: `js/ui.js` (liveStats panel), `js/game.js` (endRun / death handler)
- **Impact**: If the player has the live stats panel open during battle and the Core is destroyed, the stats overlay stays visible on top of the death/end-run screen. Cannot be dismissed.
- **Root cause**: The endRun or death handler does not close the liveStats panel. The panel has class `open` toggled by user tap, but nothing removes it on game over.
- **Fix**: In the endRun/death flow (game.js), force-close the liveStats panel: `document.getElementById('liveStats').classList.remove('open')`. Also close any other battle-only overlays (upgrade panel, focus marker, etc.) on death.
- **Reported**: 2026-05-25 by Andy (observed in gameplay)

### Gem orb popup appears too late and too infrequently
- **Location**: `js/game.js` (gem orb / gem find logic), `js/ui.js` (gem popup display)
- **Impact**: Players don't see the gem collection popup early enough in a run, and it doesn't trigger often enough. Reduces awareness of the gem economy and misses opportunities to hook players into the gem/card system.
- **Andy's note**: "Gem add pop up in game does not show up early enough, show up more often"
- **Fix**: Lower the wave threshold or conditions required for gem popups to appear. Increase trigger frequency so players see gem rewards regularly throughout a run, not just in late waves. Consider showing a gem popup on first kill of each run as an introduction.
- **Reported**: 2026-05-25 by Andy (observed in gameplay)

### Boss enemy stays outside tower range and cannot be hit
- **Location**: `js/game.js` (enemy AI / movement logic, lines ~776-846, spawnBoss ~1207-1219)
- **Impact**: Boss enemies spawn or stop at a position beyond tower range, making them unkillable. Blocks progression since bosses must be killed to continue.
- **Observed**: Boss appears to be stationary or positioned too far from the tower.
- **Expected**: Boss should slowly approach the tower like other enemies, entering attack range.
- **Code analysis**: Boss spawns at (width/2, -30) with speedMul 0.3. Base enemy speed is 35-85px/s, so boss moves at ~10-25px/s. Tower is at 50% viewport height. On a tall phone (700px+), boss needs to travel 380+ pixels at 10-25px/s = 15-38 seconds. Tower default range is 120px radius. The boss SHOULD enter range eventually, but it takes a very long time. Possible causes:
  1. Boss speed is so slow it appears stationary
  2. Boss may be hitting some boundary or condition that stops movement before reaching range
  3. Movement code may have an edge case for boss type
- **Fix**: Check boss enemy type config in `data.js` (speed, range, behavior flags) and movement logic in `game.js`. Ensure boss has a positive movement speed toward the tower and does not stop before entering tower range. Consider increasing boss speedMul from 0.3 to 0.5-0.6 so it doesn't take 30+ seconds to reach combat range.
- **Reported**: 2026-05-25 by Andy (observed in gameplay)

### Firebase apiKey and appId are empty strings
- **Location**: `js/cloud.js` (CLOUD_DEFAULT_CONFIG object)
- **Impact**: All cloud features (auth, leaderboards, cloud saves) silently fail
- **Fix**: Retrieve values from Firebase Console and populate config

## Gameplay Logic Bugs

### Purchases still rely on client-authoritative reward delivery
- **Location**: `js/monetization.js`
- **Impact**: Cloud sync trigger is fixed, but reward granting is still local-first. A tampered client can still fake reward state before server validation exists.
- **Fix**: Keep RevenueCat for store proof, then add backend validation and entitlement reconciliation before competitive/cloud-authoritative features go live.
- **Found**: 2026-05-25 (code audit, updated 2026-05-25 after sync-hook fix)

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

### STORE_PRODUCT_CATALOG prices mismatch Game Design Document
- **Location**: `js/data.js` STORE_PRODUCT_CATALOG vs GAME_DESIGN_DOCUMENT.md
- **Impact**: Prices in code don't match documented prices. Could cause App Store review issues or player confusion.
- **Mismatches**:
  - starter_pack: code says $0.99, GDD says $4.99
  - gem_small: code says $2.99, GDD says $0.99
  - gem_medium: code says $9.99, GDD says $2.99
  - gem_large: code says $9.99, GDD says $2.99 (also duplicate price with gem_medium)
- **Fix**: Andy needs to decide which prices are correct. Update either code or GDD to match. gem_medium and gem_large should not be the same price.
- **Found**: 2026-05-25 (code audit)

### Product ID prefix inconsistency
- **Location**: `js/data.js` STORE_PRODUCT_CATALOG vs APPLE_DEVELOPER_SETUP.md / GOOGLE_PLAY_DEVELOPER_SETUP.md
- **Impact**: App store IAP setup may fail if product IDs don't match exactly
- **Details**: data.js uses `com.coresurge.starter_pack` format. Setup docs reference `com.mcrdminted.coresurge.*` format. capacitor.config.json uses `com.mcrdminted.coresurge` as appId.
- **Fix**: Standardize all product IDs to `com.mcrdminted.coresurge.*` to match the app bundle ID
- **Found**: 2026-05-25 (code audit)

### GDD says 6 unlock families but data.js has 11
- **Location**: `js/data.js` UNLOCK_FAMILIES (11 entries) vs GAME_DESIGN_DOCUMENT.md (says 6)
- **Impact**: Documentation is wrong. Not a code bug, but GDD is supposed to be the source of truth for game design decisions.
- **Fix**: Update GDD to reflect the actual 11 unlock families: critSystems, economyExpansion, sustainSystems, multishotSystems, bounceSystems, comboSystems, fortification, barrierSystems, coinMastery, tacticalSystems, overcharge
- **Found**: 2026-05-25 (code audit)

## Code Quality Issues

### Save write failures only log to console
- **Location**: `js/save.js` persistSave()
- **Impact**: Local save failures now log instead of failing silently, but testers still get no visible in-game warning if storage is full or blocked.
- **Fix**: Add a player-facing toast/banner when localStorage writes fail. Consider fallback storage if this becomes common.
- **Found**: 2026-05-25 (code audit, updated 2026-05-25 after console logging fix)

### No save data integrity validation on load
- **Location**: `js/save.js` hydrateSaveState()
- **Impact**: Corrupted or tampered save data is loaded without validation. Malformed values (negative coins, NaN ranks, impossible card levels) could crash the game or cause undefined behavior.
- **Fix**: Add validation checks in hydrateSaveState: numeric range checks, type checks, sanitize cardInventory entries, cap rank levels at maxRank.
- **Found**: 2026-05-25 (code audit)

### Cloud saves have no document size limit check
- **Location**: `js/cloud.js`
- **Impact**: Save data is written to Firestore as a single document. Firestore has a 1MB document size limit. As card inventory and tournament history grow, saves could exceed this limit and fail silently.
- **Fix**: Check serialized save size before writing to Firestore. If approaching limit, prune old tournament data or compress.
- **Found**: 2026-05-25 (code audit)

### No DOM element pooling in render.js
- **Location**: `js/render.js` render() function
- **Impact**: Every enemy and projectile creates new DOM elements. On later waves with 20+ enemies and many projectiles, this causes GC pressure and potential frame drops on low-end mobile devices.
- **Fix**: Implement object pooling -- reuse DOM elements for dead enemies/projectiles instead of creating new ones each time.
- **Found**: 2026-05-25 (code audit)

### Stale version comments in ui.js
- Contains references to v0.7.15, v0.7.16, v0.7.17
- Display string correctly shows v0.7.23
- Old comments should be cleaned up to avoid confusion

### No error boundary
- Unhandled JavaScript exceptions can crash the entire game
- Need a global error handler (window.onerror / unhandledrejection)
- Should gracefully recover or show error state rather than blank screen

### No input validation on username field
- Users can enter any string with no length/character restrictions
- Could allow XSS if displayed in leaderboards without sanitization
- Should validate: min/max length, allowed characters, profanity filter

### No rate limiting on card pulls (client-side)
- Rapid-fire pull requests could be exploited
- Server-side validation needed when cloud features are active
- Client should also throttle UI to prevent accidental double-pulls

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

### No minification/bundling in build pipeline
- **Location**: Project build config (no webpack/rollup/esbuild configured)
- **Impact**: Production serves unminified JS/CSS. Larger download size, slower load times on mobile networks, source code fully readable.
- **Fix**: Add a build step (esbuild recommended for simplicity) that minifies and bundles JS/CSS for production. Keep source maps separate.
- **Found**: 2026-05-25 (code audit)

### service-worker.js caches stale version and missing files
- **Location**: `service-worker.js`
- **Issues (Task 68 audit)**:
  - Cache version is `core-surge-shell-v0-7-23` but game is v0.7.24
  - Missing from cache list: `js/cloud.js` and `js/monetization.js` (both exist and are needed)
  - Strategy is cache-first, so stale cache persists until new SW installs
- **Fix**: Update cache version string to match current game version. Add cloud.js and monetization.js to CORE_SURGE_ASSETS array. Consider auto-generating the cache list from the build step.

### package.json missing mobile scripts
- `sessions.md` references Capacitor commands not in package.json
- Developers must know to run `npx cap sync` etc. manually
- Should be documented as npm scripts for consistency

### No 404/error page for Firebase Hosting
- Invalid routes will show default Firebase 404
- Should have custom error page matching game theme
- Configure in `firebase.json` rewrites/errorPage

### manifest.webmanifest still needs real PNG app icons
- **Location**: `manifest.webmanifest`
- **Issues (Task 69 audit)**:
  - Stable `id` is now present
  - Deprecated combined purpose string is now split into `any` and `maskable`
  - Apple still needs a dedicated 180x180 PNG. Android still wants 192x192 and 512x512 PNGs.
- **Fix**: Generate dedicated square PNG icons and reference them in manifest + `apple-touch-icon`.
- **Found**: 2026-05-25 (Task 69 audit, updated 2026-05-25 after manifest cleanup)

### Missing .firebaserc file
- **Location**: project root
- **Impact**: Firebase CLI deployments require `.firebaserc` to know which project to target. Without it, `firebase deploy` will prompt interactively.
- **Fix**: Create `.firebaserc` with `{"projects": {"default": "core-surge---tower-defense"}}`
- **Found**: 2026-05-25 (Task 65 audit)

### Save schema still has no explicit migration table
- **Location**: `js/save.js`
- **Impact**: Save version is now normalized on load/save, but there is still no dedicated migration function map for future incompatible schema changes.
- **Fix**: Add `migrateSave(fromVersion, rawSave)` before `hydrateSaveState()` if another breaking save shape lands.
- **Found**: 2026-05-25 (Task 70 audit, updated 2026-05-25 after version normalization)

### Save load sanitization is still local-only
- **Location**: `js/save.js` hydrateSaveState()
- **Impact**: Rank caps and numeric sanitization now clamp bad local data, but there is still no trusted backend validation for cloud or competitive features.
- **Fix**: Mirror the same validation rules server-side before accepting leaderboard, tournament, or cloud-authoritative state.
- **Found**: 2026-05-25 (Task 70 audit, updated 2026-05-25 after local clamp fix)

## Documentation Mismatches

### README.md is outdated (multiple issues)
- **Location**: `README.md`
- **Issues found (Task 66 audit)**:
  - Says version v0.7.23, game is v0.7.24
  - File tree missing: js/cloud.js, js/profile.js, js/monetization.js, css/profile.css
  - Says save key is `tower_save_v7` but data.js now uses `tower_save_v8`
  - Deploy section says "No build step" but there IS a build step now (`npm run build`)
  - Script load order missing cloud.js, profile.js, monetization.js
- **Fix**: Update README to match current project state
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
