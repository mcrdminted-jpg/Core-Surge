# Build Pipeline Implementation
**Target: Weeks 1-4 | Assigned: Claude Code**

## Overview
Core Surge v0.7.23 requires a complete build, deployment, and distribution pipeline to move from development to production publication. Current state: source files organized, no minification, no build automation, no CI/CD, no native app wrappers.

---

## Week 1: Asset Pipeline & Minification

### Task 1.1 - JavaScript Bundling & Minification
- **Current state:** 12 separate JS files (data.js, save.js, game.js, tournament.js, render.js, ui.js, cloud.js, main.js, skins.js, profile.js + Firebase imports)
- **Goal:** Single minified bundle or optimized load sequence
- **Steps:**
  1. Set up webpack or esbuild configuration
  2. Define entry point (main.js)
  3. Configure output for PWA manifest compatibility
  4. Test that minified bundle runs all game systems: combat, cards, tournament, ranks, skins
  5. Measure bundle size and target <500KB (uncompressed)
- **Deliverable:** `core-surge-bundle.min.js` + source map
- **Verification:** Game loads, battle runs through T18, card pulls work, tournament functions execute

### Task 1.2 - CSS Optimization
- **Current state:** 7 CSS files (theme.css, base.css, battle.css, menu.css, skins.css, profile.css, mockup-overlay.css)
- **Goal:** Minified + unified stylesheet with CSS variables preserved
- **Steps:**
  1. Combine all CSS files in load order
  2. Remove unused rules (audit against HTML elements)
  3. Minify with postcss
  4. Preserve CSS variable definitions for theme switching
  5. Test all 7 skins still render correctly
- **Deliverable:** `core-surge-styles.min.css` + source map
- **Verification:** All UI screens render, theme switching works (neon → industrial → verdant → aegis → frost → royal), background themes load

### Task 1.3 - Asset Inventory & CDN Strategy
- **Current state:** Graphics embedded in HTML/CSS, no external asset structure defined
- **Goal:** Define what assets exist, where they're stored, how they're served
- **Scope:**
  - Skin sprites/images (7 core skins × 4 backgrounds = 28 total)
  - Card artwork (25 cards × 5 levels = visual assets)
  - Sound effects (if any; currently none referenced)
  - Fonts (verify Google Fonts or bundled)
- **Steps:**
  1. Audit index.html and CSS for all image references
  2. Inventory actual files (check /assets/ or embedded data URIs)
  3. Optimize PNGs/WebP with image compressor
  4. Choose CDN (Cloudflare, Firebase Storage, or GitHub Pages)
  5. Update references in build pipeline
- **Deliverable:** ASSET_INVENTORY.md with full file listing + CDN paths
- **Verification:** All assets load within 2s on 4G connection

---

## Week 2: Build Automation & CI/CD

### Task 2.1 - GitHub Actions CI/CD Pipeline
- **Goal:** Automated tests, builds, and deployment on every push
- **Steps:**
  1. Create `.github/workflows/build.yml`
  2. Define build triggers (push to main, PR to main)
  3. Configure workflow:
     - Install dependencies (npm install)
     - Run linting (ESLint for JS, Stylelint for CSS)
     - Build bundle (webpack/esbuild)
     - Run smoke tests (bundle size check, asset count check)
     - Deploy to Firebase Hosting staging
  4. Add branch protection rules (require CI pass before merge)
- **Deliverable:** `.github/workflows/build.yml` + passing pipeline on 3 test commits
- **Verification:** Any code change triggers build, build fails if linting errors or bundle > 500KB

### Task 2.2 - Version & Build Number Management
- **Current state:** Manual version in index.html changelog (v0.7.0 → v0.7.23)
- **Goal:** Automated versioning tied to git tags and build number
- **Steps:**
  1. Set up semantic versioning (major.minor.patch)
  2. Create version.js that reads from git tag at build time
  3. Update index.html to consume version dynamically
  4. Add build number to service worker cache key
  5. Track version in window.GAME_VERSION for crash reporting
- **Deliverable:** Build pipeline automatically increments version + service worker v-number
- **Verification:** `console.log(window.GAME_VERSION)` shows correct version; service worker updates on release

### Task 2.3 - Automated Testing Framework
- **Current state:** No tests exist
- **Goal:** Basic smoke tests to catch regressions
- **Scope (prioritize):**
  1. **Tier 1 (Week 2):** Bundle integrity tests
     - Verify all 12 JS files present in bundle
     - Verify all CSS files present
     - Check for undefined variables/functions
  2. **Tier 2 (Week 3-4):** Game logic tests
     - Card pull odds match data.js (2% apex, 20% prime, 78% standard)
     - Damage calculation formula correct (base × run_multiplier × card_bucket × predator)
     - Tournament promotion/demotion math (10% promote, 15% demote)
     - Rank costs escalate properly (cost0 × costMul^level)
  3. **Tier 3 (post-Week 4):** E2E tests (browser automation, full game run)
- **Deliverable:** Jest or Vitest config + 15-20 unit tests
- **Verification:** All tests pass; CI rejects bundle if tests fail

---

## Week 3: Firebase Deployment & Cloud Configuration

### Task 3.1 - Firebase Hosting Setup
- **Current state:** Firebase imports present but no deployment config
- **Goal:** Host built game on Firebase, serve via CDN
- **Steps:**
  1. Create `firebase.json` with build output directory
  2. Configure rewrites (route all URLs to index.html for SPA)
  3. Set headers for PWA (Cache-Control for assets, no-cache for HTML)
  4. Deploy production build to Firebase Hosting
  5. Enable HTTPS, custom domain (if applicable)
- **Deliverable:** `firebase.json` + game live at `https://<project>.web.app`
- **Verification:** Load game in browser, check Network tab for HTTP 200, service worker updates

### Task 3.2 - Service Worker & PWA Offline Support
- **Current state:** manifest.webmanifest exists, service worker stub only
- **Goal:** Functional offline-first PWA with asset caching
- **Steps:**
  1. Write service worker (sw.js):
     - Cache all assets on install (bundle.min.js, styles.min.css, sprites)
     - Serve cached assets if network fails
     - Update cache on activate (version-based)
  2. Test offline mode: disconnect network, game still playable
  3. Verify save/load works offline (localStorage intact)
  4. Test cache busting: new build invalidates old cache
- **Deliverable:** `public/sw.js` + working offline gameplay
- **Verification:** Disconnect WiFi, game loads from cache, can play full run offline

### Task 3.3 - Environment Configuration
- **Current state:** Cloud config hardcoded or missing
- **Goal:** Separate dev, staging, production configs
- **Setup:**
  1. Create config files:
     - `config.dev.json` (localhost, debug enabled)
     - `config.staging.json` (Firebase staging, monitoring enabled)
     - `config.prod.json` (production, analytics enabled, privacy mode)
  2. Inject config at build time based on `NODE_ENV`
  3. Define per-environment:
     - Firebase project ID
     - Analytics tracking ID
     - Ad network keys (stub until Week 4)
     - Feature flags (devMode, showDebugPanel, etc.)
  4. Never hardcode secrets; use Firebase Config
- **Deliverable:** Three config files + build pipeline selects correct one
- **Verification:** Staging and prod builds have different configs; dev mode only enabled locally

---

## Week 4: Release Builds & Distribution Preparation

### Task 4.1 - Native App Wrappers (Progressive)
- **Current state:** Web-only (PWA); no Android/iOS apps
- **Goal:** Prepare for app store distribution
- **Options:**
  1. **Tier 1 (Week 4):** Capacitor setup
     - Generate Capacitor project from web build
     - Build Android APK test version
     - Build iOS IPA test version
     - Verify game runs in native webview
  2. **Tier 2 (Post-Week 4):** Signed releases for app stores
     - Android: keystore, signed APK, upload to Play Console
     - iOS: provisioning profiles, signed IPA, upload to TestFlight
- **Deliverable:** Capacitor config + unsigned APK/IPA builds
- **Verification:** Native apps load game, all UI functional, touch controls responsive

### Task 4.2 - Release Build & Artifact Management
- **Goal:** Generate reproducible, signed release artifacts
- **Steps:**
  1. Tag release in git: `git tag v0.7.24`
  2. CI pipeline creates release artifacts:
     - Minified web bundle (tar.gz)
     - Source maps (for crash reporting)
     - Native APK/IPA (unsigned)
     - Release notes (auto-generated from git log)
  3. Upload artifacts to GitHub Releases
  4. Create CHANGELOG.md from git tags
- **Deliverable:** GitHub release with web bundle, native apps, changelog
- **Verification:** Download artifacts, verify checksums, game loads

### Task 4.3 - Performance Audit & Optimization
- **Goal:** Ensure game meets store requirements (<100MB total)
- **Measurements:**
  - Bundle size: <500KB minified
  - Initial load time: <3s on 4G
  - First paint: <1s
  - TTI (Time to Interactive): <4s
  - Asset load parallelization (use HTTP/2 push)
- **Steps:**
  1. Run Lighthouse audit
  2. Run WebPageTest with 4G throttle
  3. Profile with DevTools Performance tab
  4. Optimize any bottlenecks (lazy load cards, defer non-critical JS)
  5. Document baseline metrics
- **Deliverable:** Performance baseline report + Lighthouse score >90
- **Verification:** Lighthouse audit passes; game interactive within 4s on slow connection

### Task 4.4 - Build Documentation
- **Goal:** Developers can build, test, deploy without friction
- **Deliverable:** `BUILD.md` covering:
  1. Prerequisites (Node.js, npm, Firebase CLI)
  2. Setup: `npm install`, `firebase login`
  3. Development: `npm run dev` (local server)
  4. Build: `npm run build` (minification + bundle)
  5. Test: `npm test` (run unit tests)
  6. Deploy: `npm run deploy` (Firebase Hosting)
  7. CI/CD: How to trigger builds, interpret results
  8. Troubleshooting: Common errors + fixes
- **Verification:** New developer can follow BUILD.md and deploy in 15 minutes

---

## Success Criteria
- [ ] Game runs from single minified bundle (<500KB)
- [ ] All CSS minified and combined
- [ ] Asset CDN strategy defined
- [ ] CI/CD pipeline auto-builds and deploys on push
- [ ] Service worker enables offline play
- [ ] PWA installable on desktop/mobile
- [ ] Native APK/IPA builds run game
- [ ] Performance audit >90 Lighthouse score
- [ ] Developers can build/deploy following BUILD.md
- [ ] Release artifacts auto-generated and version-tracked

---

## Dependencies
- **Blockers:** None (can start immediately)
- **External tools:** webpack or esbuild, Firebase CLI, GitHub Actions
- **Parallel tracks:** Can run alongside Codex's compliance/security work

---

## Timeline Risk Factors
- Service worker browser compatibility (test early)
- Firebase auth domain setup (manual step, 1-2 days)
- Native app signing (requires certificates, plan ahead for iOS)
- Performance bottlenecks (run Lighthouse Week 2, not Week 4)
