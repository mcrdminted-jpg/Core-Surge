# QA Verification Report - Tasks 61-70
**Completed**: 2026-05-25 by Cowork Agent

---

## Task 61: Cross-check CLAUDE_CODE_AGENT.md vs BUILD_PIPELINE_IMPLEMENTATION.md

**Result: CONSISTENT with minor gaps**

BUILD_PIPELINE_IMPLEMENTATION.md (4-week plan) maps to CLAUDE_CODE_AGENT.md as follows:
- BPI Week 1 (bundling, CSS, assets) = Claude Code Tasks 26-34
- BPI Week 2 (CI/CD, versioning, testing) = Claude Code Tasks 35-50 + 51-57
- BPI Week 3 (Firebase Hosting, service worker, env config) = Claude Code Tasks 58-60 + 42-44
- BPI Week 4 (native wrappers, release builds, performance) = Claude Code Tasks 91-100

**Gaps found:**
1. BPI Task 4.1 (Capacitor native wrappers) overlaps with CODEX_AGENT Tasks 91-100. Both agents claim native builds. Resolution needed: Codex owns native/Capacitor per lane rules.
2. Claude Code Task 50 (document build in BUILD.md) already completed per sessions.md.
3. BPI references "12 separate JS files" but there are 11 in source (profile.js is the 11th, monetization.js is the 12th if you count it, but that's Codex lane).

**Verdict:** No blocking inconsistencies. Lane overlap on native builds noted.

---

## Task 62: Cross-check CODEX_AGENT.md vs COMPLIANCE_SECURITY_ANALYTICS.md

**Result: CONSISTENT with scope expansion**

COMPLIANCE_SECURITY_ANALYTICS.md (6-week plan) maps to CODEX_AGENT.md as follows:
- CSA Week 1 (Privacy, ToS, loot box) = Codex doesn't have explicit doc-writing tasks (Cowork wrote these)
- CSA Week 2 (Firebase Auth UI, save migration) = Codex Tasks 21-40
- CSA Week 3-4 (Analytics, Crashlytics) = Codex Tasks 66-80
- CSA Week 4-5 (Security hardening) = Codex Tasks 81-90
- CSA Week 5 (IARC rating) = Not in Codex tasks (Cowork handled IARC prep)
- CSA Week 6 (Store submission) = Codex Tasks 91-100

**Gaps found:**
1. CSA references "15+ analytics events" -- Codex has exactly 15 event-tracking tasks (66-80). Matches.
2. CSA references "TweetNaCl.js encryption" -- Codex Task 81 covers this. Match.
3. CSA references "rate limiting (10 pulls/min)" -- Codex Task 83 covers this. Match.
4. Codex has monetization tasks (41-65) not in CSA doc. These are additional scope beyond the compliance plan.
5. CSA "Week 6 sign-off" gate not explicitly in Codex tasks. Should add a verification task.

**Verdict:** Consistent. CSA is a subset of Codex's full scope. No conflicts.

---

## Task 63: Verify every file referenced in sessions.md actually exists

**Result: ALL FILES EXIST**

Checked all .md files referenced: 34 unique markdown files, all present.
Checked all code files referenced: js/cloud.js, js/data.js, js/game.js, js/main.js, js/monetization.js, js/profile.js, js/save.js, js/ui.js, css/base.css, css/menu.css, index.html, package.json, capacitor.config.json, service-worker.js, scripts/build.js, scripts/serve.js -- all present.

Only false positive: `/service-worker.js` (absolute path) doesn't exist but `service-worker.js` (relative) does. Not a real issue.

---

## Task 64: Verify capacitor.config.json appId matches Apple/Google developer accounts

**Result: CONSISTENT**

- capacitor.config.json: `"appId": "com.mcrdminted.coresurge"`
- APPLE_DEVELOPER_SETUP.md: references `com.mcrdminted.coresurge` bundle ID
- GOOGLE_PLAY_DEVELOPER_SETUP.md: references `com.mcrdminted.coresurge` package name

**Known issue (already in KNOWN_BUGS.md):** STORE_PRODUCT_CATALOG in data.js uses `com.coresurge.*` prefix for product IDs instead of `com.mcrdminted.coresurge.*`. Product IDs need updating.

---

## Task 65: Verify Firebase project ID in all config files matches actual Firebase project

**Result: CONSISTENT across all files**

Firebase project ID: `core-surge---tower-defense`

Found in:
- js/cloud.js: projectId, authDomain, databaseURL, storageBucket -- all use `core-surge---tower-defense`
- android/app/src/main/assets/public/js/cloud.js: same values
- ios/App/App/public/js/cloud.js: same values
- core-surge---tower-defense-firebase-adminsdk-fbsvc-e2e9830cd4.json: project_id matches
- backend/firebase.json: hosting config present

**Still missing:** apiKey and appId are empty strings (known bug, already tracked).

---

## Task 66: Audit README.md for accuracy against current project state

**Result: MOSTLY ACCURATE, minor updates needed**

README.md describes v0.7.23 file structure. Current state is v0.7.25 after Claude Code's work.

**Accurate:**
- File tree listing matches actual files
- Script load order description is correct
- AI co-work rules still apply
- CSS file descriptions accurate

**Needs update:**
1. Says "v0.7.23" in title -- should be v0.7.25
2. data.js description missing: RANK_DEFS, UNLOCK_FAMILIES, STORE_PRODUCT_CATALOG (added in v0.7.15-v0.7.24)
3. Missing mention of scripts/ folder (build.js, serve.js, typecheck.js)
4. Missing mention of dist/ folder (built output)
5. Missing mention of BUILD.md

**Verdict:** Functional but stale. Low priority update.

---

## Task 67: Review all TODO/FIXME comments in JS files and add to KNOWN_BUGS.md

**Result: NONE FOUND**

Searched all JS files (excluding node_modules, android, ios, dist) for: TODO, FIXME, HACK, XXX, BUG.

Zero results. Code is clean of developer reminder comments. Nothing to add to KNOWN_BUGS.md.

---

## Task 68: Verify service worker caches correct files and version string matches

**Result: GOOD - version matches v0.7.25**

- Service worker cache key: `core-surge-shell-v0-7-25` (matches current version)
- Caches all 11 source JS files, 7 CSS files, manifest, index.html
- Caches all 6 core skin PNGs and 4 background PNGs
- Caches enemy sprites and VFX assets

**Note:** The source service-worker.js caches individual source files. The dist/service-worker.js should cache the bundled output instead. This is already noted as an infrastructure concern but not a blocking bug since the workers.dev deployment serves from dist/ with the minified bundle.

---

## Task 69: Check manifest.webmanifest for correct icons, name, theme_color, display mode

**Result: TRUNCATED FILE - BUG**

The manifest.webmanifest file is only 23 lines and appears truncated. It ends mid-array (after the first icon entry with a trailing comma, no closing brackets). This means:

- name: "Core Surge" -- correct
- short_name: "Core Surge" -- correct
- display: "standalone" -- correct
- orientation: "portrait" -- correct
- theme_color: "#08101c" -- correct
- background_color: "#08101c" -- correct

**PROBLEM:** File is incomplete. Only 1 icon declared (SVG). PWA install on Android/iOS requires multiple PNG icons at specific sizes (192x192, 512x512 minimum). The JSON is malformed and will fail to parse in browsers.

**Action needed:** Fix manifest.webmanifest -- add closing brackets, add PNG icon entries for 192x192 and 512x512. Add to KNOWN_BUGS.md.

---

## Task 70: Verify save.js version migration handles edge cases

**Result: GOOD - v0.7.25 added validation**

hydrateSaveState() now handles:
- Corrupt/missing fields: spreads defaultSave as base, overlays loaded data
- NaN/negative values: parseInt/parseFloat with Math.max(0, ...) clamping
- Rank level tampering: clamped at RANK_DEFS[k].maxRank
- Missing rank keys: defaults from defaultSave.ranks
- Card inventory: validates copies exist, removes equipped cards not in inventory
- Version skips: v0.7.15 purges all pre-v8 saves entirely (clean slate)
- selectedTier bounds: clamped to >= 1
- bestTier bounds: clamped to [1, MAX_TIER]

**Remaining edge cases NOT handled:**
1. No explicit version migration path (v8 is only version, older purged)
2. If future v9 is needed, there's no migration function -- would need one
3. cardInventory entries aren't validated for correct shape (could have missing `level` field)
4. equippedCards array could have IDs for cards that don't exist in CARD_POOL

**Verdict:** Adequate for current single-version state. Future version bumps will need a migration function.
