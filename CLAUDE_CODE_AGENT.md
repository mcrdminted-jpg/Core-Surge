# CLAUDE CODE AGENT - Core Surge Build, UI & Deployment
**Agent:** Claude Code (Terminal/CLI)
**Role:** Frontend code, UI/UX implementation, build pipeline, CI/CD, performance optimization, deployment
**Lane:** Writes and edits JS/CSS/HTML game code. Builds and deploys. Does NOT touch backend Cloud Functions, Firebase Auth logic, monetization billing logic, or compliance documents.

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
## YYYY-MM-DD - Claude Code - [Short Title]
**What I did:** [bullet list]
**Files touched:** [list]
**Verification:** [build passed, tests passed, screenshots if applicable]
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

## REFERENCE PHOTOS

Before doing UI work, review the reference mockups in:
`REFERENCE NOT EXACTLY HOW I WANT/`
These show the target visual direction. NOT exact copies. Use as inspiration for the dark/neon/sci-fi aesthetic.

---

## DO NOT TOUCH (Codex's Lane)

- `js/cloud.js` (Firebase client logic)
- `js/monetization.js` (RevenueCat/store billing)
- `backend/` (entire folder - Cloud Functions, Firestore rules)
- `capacitor.config.json` (native app config)
- `ios/` and `android/` (native project folders)

---

## TASK LIST

### Phase 1: UI Polish & Visual Quality (Tasks 1-25)

- [ ] **Task 1:** Fix core skin centering on battlefield - tower-core element must be visually centered in the battle area regardless of skin size
- [ ] **Task 2:** Increase battle/combat area height - reduce upgrade panel vertical space, give more room to the battlefield
- [ ] **Task 3:** Make all tower icons in battle HUD functional - each icon should have clear tap feedback, tooltip showing what it does
- [ ] **Task 4:** Add hover/active states to every interactive element (buttons, tabs, cards, icons) - minimum 44px touch targets
- [ ] **Task 5:** Improve Research tab visual design - cards need gradient backgrounds, glow borders, clear hierarchy (reference: dark theme with cyan/orange accents)
- [ ] **Task 6:** Fix empty placeholder boxes in Defense/Economy/Utility tabs - show "Coming Soon" with lock icon instead of blank rectangles
- [ ] **Task 7:** Polish home screen panels (Recent Progress, Tier Milestones, Loadout Preview) - verify all three render with real save data
- [ ] **Task 8:** Add smooth transition animations between menu screens (fade, slide, or scale - not instant swap)
- [ ] **Task 9:** Improve text rendering across all screens - add proper text-shadow for readability on dark backgrounds
- [ ] **Task 10:** Add loading spinner/skeleton states for screens that take >100ms to render
- [ ] **Task 11:** Verify all 7 skins render correctly (neon, industrial, verdant, aegis, frost, royal, default) - no clipping, scaling, or z-index issues
- [ ] **Task 12:** Improve Shop tab layout - product cards need clear pricing, description, and purchase button states (enabled/disabled/purchased)
- [ ] **Task 13:** Add visual feedback for card pulls (animation: glow, flip, particle effect for rare cards)
- [ ] **Task 14:** Improve tournament bracket display - clear tier labels, current position highlight, promotion/demotion indicators
- [ ] **Task 15:** Add icon-based bottom navigation instead of 7 text tabs (reference mockups show icon nav)
- [ ] **Task 16:** Improve Settings screen layout - group related settings, add section headers
- [ ] **Task 17:** Add battle results screen (post-wave summary: damage dealt, coins earned, enemies killed, XP gained)
- [ ] **Task 18:** Improve Goals/Milestones tab - progress bars for each goal, claimed/unclaimed visual distinction
- [ ] **Task 19:** Add responsive font scaling using clamp() for all text elements (minimum 12px, maximum 18px body text)
- [ ] **Task 20:** Verify game renders correctly on viewport widths 320px, 375px, 414px, 428px (common mobile sizes)
- [ ] **Task 21:** Add pull-to-refresh gesture support for tournament leaderboard
- [ ] **Task 22:** Improve gem/currency display - always visible during gameplay, animated when value changes
- [ ] **Task 23:** Add notification badges to tabs when new content is available (unclaimed rewards, new shop items)
- [ ] **Task 24:** Improve error states - show user-friendly messages when network calls fail, save fails, or features are unavailable
- [ ] **Task 25:** Add onboarding tutorial overlay for first-time players (3-5 steps explaining core, upgrades, cards)

### Phase 2: Build Pipeline & Optimization (Tasks 26-50)

- [ ] **Task 26:** Set up esbuild or webpack config - entry point main.js, output single minified bundle
- [ ] **Task 27:** Configure CSS minification - combine all 7 CSS files into single core-surge-styles.min.css
- [ ] **Task 28:** Create build script in package.json: `npm run build` outputs minified JS + CSS + assets to dist/
- [ ] **Task 29:** Measure current bundle size and document baseline (target: <500KB minified+gzipped)
- [ ] **Task 30:** Audit all JS files for dead code and remove unused functions/variables
- [ ] **Task 31:** Audit all CSS files for unused selectors and remove dead rules
- [ ] **Task 32:** Optimize all PNG images in assets/ - compress without visible quality loss (target: <100KB each)
- [ ] **Task 33:** Convert large PNGs to WebP format with PNG fallback for older browsers
- [ ] **Task 34:** Implement lazy loading for skin sprites (don't load all 7 skins at startup)
- [ ] **Task 35:** Add gzip/brotli compression to build output
- [ ] **Task 36:** Measure and optimize Lighthouse performance score (target: >90 mobile)
- [ ] **Task 37:** Measure and optimize Lighthouse accessibility score (target: >80)
- [ ] **Task 38:** Measure and optimize Lighthouse best practices score (target: >90)
- [ ] **Task 39:** Add source maps for debugging (separate files, not inline)
- [ ] **Task 40:** Configure build to strip console.log() statements from production output
- [ ] **Task 41:** Set up development vs production build modes (dev: unminified with source maps, prod: minified, stripped)
- [ ] **Task 42:** Update service-worker.js to cache the built bundle files (not source files)
- [ ] **Task 43:** Verify service worker offline functionality after build pipeline change
- [ ] **Task 44:** Test that PWA install banner still works with built output
- [ ] **Task 45:** Create ASSET_INVENTORY.md listing every file in dist/ after build with sizes
- [ ] **Task 46:** Implement code splitting if bundle exceeds 500KB (separate vendor libs from game code)
- [ ] **Task 47:** Add build versioning - auto-increment build number in package.json on each build
- [ ] **Task 48:** Configure build to output hash-named files for cache busting (e.g., core-surge-abc123.min.js)
- [ ] **Task 49:** Verify all game systems work with minified build (combat, cards, tournament, ranks, skins, save/load)
- [ ] **Task 50:** Document build pipeline in BUILD.md with step-by-step instructions for other developers

### Phase 3: CI/CD & Deployment (Tasks 51-70)

- [ ] **Task 51:** Create .github/workflows/build.yml - automated build on push to main
- [ ] **Task 52:** Add lint step to CI (eslint with reasonable config for vanilla JS)
- [ ] **Task 53:** Add build step to CI - verify `npm run build` succeeds
- [ ] **Task 54:** Add bundle size check to CI - fail if output exceeds 500KB
- [ ] **Task 55:** Configure Firebase Hosting deployment in CI (deploy dist/ to Firebase on merge to main)
- [ ] **Task 56:** Set up staging environment - deploy to staging URL on PR, production on merge
- [ ] **Task 57:** Add Lighthouse CI audit - run on every PR, report scores
- [ ] **Task 58:** Create deploy script: `npm run deploy` pushes dist/ to Firebase Hosting
- [ ] **Task 59:** Configure custom domain for Firebase Hosting (if Andy has one, otherwise use default .web.app)
- [ ] **Task 60:** Set up SSL/HTTPS on hosting (Firebase does this automatically, verify it works)
- [ ] **Task 61:** Configure CDN caching headers for static assets (images: 1 year, JS/CSS: versioned)
- [ ] **Task 62:** Set up error tracking - integrate Sentry or Firebase Crashlytics for frontend errors
- [ ] **Task 63:** Add health check endpoint or page that CI can verify after deploy
- [ ] **Task 64:** Create rollback script - ability to deploy previous build version quickly
- [ ] **Task 65:** Add environment variable injection at build time (API URLs, feature flags)
- [ ] **Task 66:** Configure GitHub branch protection - require CI pass before merge to main
- [ ] **Task 67:** Set up PR template with checklist (tested on mobile, bundle size checked, screenshots attached)
- [ ] **Task 68:** Create release tagging workflow - tag releases with semantic versioning
- [ ] **Task 69:** Verify Cloudflare Pages deployment still works at tower-game-3k2.pages.dev (or migrate to Firebase Hosting)
- [ ] **Task 70:** Document full deployment process in DEPLOY.md

### Phase 4: Testing & Quality (Tasks 71-90)

- [ ] **Task 71:** Set up testing framework (Jest or Vitest for unit tests)
- [ ] **Task 72:** Write unit tests for save.js - test save/load, version migration, corrupt data handling
- [ ] **Task 73:** Write unit tests for game.js - test damage calculation, crit rates, ability effects
- [ ] **Task 74:** Write unit tests for data.js - test upgrade cost calculations, family unlock logic
- [ ] **Task 75:** Write unit tests for tournament.js - test bracket generation, tier placement, scoring
- [ ] **Task 76:** Write integration test: full game loop from wave 1 to wave 10 (auto-play)
- [ ] **Task 77:** Write integration test: save game, reload page, verify state restored correctly
- [ ] **Task 78:** Write integration test: card pull system - verify odds match declared rates
- [ ] **Task 79:** Write integration test: upgrade purchase - verify currency deducted, stat increased
- [ ] **Task 80:** Add test coverage reporting - target 60% coverage for critical paths
- [ ] **Task 81:** Create automated screenshot comparison tests (render each screen, diff against baseline)
- [ ] **Task 82:** Test on slow network (throttle to 3G) - verify game loads within 5 seconds
- [ ] **Task 83:** Test on low-end device profile (Nexus 5 simulation) - verify 30fps minimum
- [ ] **Task 84:** Test memory usage over extended play session (1 hour) - verify no memory leaks
- [ ] **Task 85:** Test with browser DevTools open - verify no console errors during normal gameplay
- [ ] **Task 86:** Test save file size growth over time - verify it stays under 1MB after months of play
- [ ] **Task 87:** Test all edge cases: max currency, max level, empty loadout, 0 cards, first-time player
- [ ] **Task 88:** Add npm test command to package.json
- [ ] **Task 89:** Add test step to CI pipeline (tests must pass before deploy)
- [ ] **Task 90:** Create TEST_RESULTS.md documenting results of all test suites

### Phase 5: Performance & Polish (Tasks 91-100)

- [ ] **Task 91:** Profile render.js with Chrome DevTools - identify and fix any frame drops below 30fps
- [ ] **Task 92:** Optimize canvas rendering - reduce draw calls, batch similar operations
- [ ] **Task 93:** Implement requestAnimationFrame correctly if not already (no setInterval for rendering)
- [ ] **Task 94:** Add FPS counter in debug mode (toggle in Settings)
- [ ] **Task 95:** Optimize DOM updates in ui.js - minimize reflows/repaints during menu rendering
- [ ] **Task 96:** Add preload hints for critical assets (fonts, core sprites)
- [ ] **Task 97:** Implement progressive image loading (low-res placeholder, then full resolution)
- [ ] **Task 98:** Verify battery usage is reasonable during gameplay (no unnecessary background processing)
- [ ] **Task 99:** Final performance audit - document all metrics in PERFORMANCE_REPORT.md
- [ ] **Task 100:** Final visual polish pass - review every screen against reference mockups, fix remaining gaps

---

## DEPENDENCIES ON OTHER AGENTS

- **Blocked by Codex:** Do NOT modify js/cloud.js, js/monetization.js, backend/, capacitor.config.json, ios/, android/
- **Blocked by Cowork:** Tasks in Phase 2-3 benefit from ASSET_MANIFEST.md and ARCHITECTURE.md
- **Blocks Codex:** Build pipeline (Phase 2) must work before Codex can test native builds
- **Blocks Cowork:** Verification tasks need Claude Code's build output to check
