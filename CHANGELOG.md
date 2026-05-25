# Core Surge Changelog

All notable changes to Core Surge are documented here. Versions follow the format v0.Major.Patch.

---

## v0.7.23 (2026-05-24)

### Added
- PWA installable app shell (manifest.webmanifest, service-worker.js, install banner)
- Firebase direct client integration (js/cloud.js) - Auth + Firestore without Cloud Functions
- Settings cloud panel for pasting Firebase web config on-device
- Capacitor scaffolding (capacitor.config.json, mobile scripts in package.json)
- Native iOS and Android project folders generated (android/, ios/)
- RevenueCat billing abstraction layer (js/monetization.js)
- Mobile product catalog in js/data.js (starter_pack, gem_small, gem_medium, monthly_vault)
- Settings billing panel for RevenueCat SDK key storage
- Home screen info panels (Recent Progress, Tier Milestones, Loadout Preview)
- Local build/typecheck/serve scripts (scripts/ folder)
- Backend Cloud Functions skeleton (backend/firebase-config.js - 6 endpoints)
- Firestore security rules and indexes
- Firebase Hosting config

### Changed
- Shop tab now shows real mobile-store products instead of placeholder filler
- Save hydration refactored: local and cloud save use same merge path
- Profile sync: username and playerId aligned for leaderboard use
- Firebase Hosting config points at dist/ instead of non-existent frontend/
- Research tab typography: family names and costs now visible (larger font, white/gold text)
- Empty placeholder boxes now show "Coming Soon" with lock icon

### Fixed
- Research tab family names were invisible (8px font on gradient background)
- Empty family card slots showed blank rectangles instead of placeholder content

---

## v0.7.22 (pre-2026-05-24)

### State at this version
- Full offline gameplay loop complete
- All UI screens functional (Battle, Cards, Shop, Research, Tournament, Goals, Milestones, Skins, Settings)
- 7 core skins with backgrounds
- Tournament bracket system (T1-T18 tiers, 5 leagues)
- Card pull system with rarity tiers
- Research/Ranks progression (Combat, Defense, Economy, Utility families)
- Save system v8 (localStorage with version migration)
- No backend, no cloud saves, no monetization, no analytics

---

## v0.7.17

- Home battlefield preview driven by equipped skin

## v0.7.16

- Neon panel title matching mockup added to Research tab

## v0.7.15

- In-run upgrade mapping to unlock families implemented

---

## Pre-v0.7.15

Initial development. Core game mechanics, rendering, UI framework, save system, tournament logic, skin system established.
