# Core Surge - Document Index

Master index of every document in the Tower Mobile App Game project folder.

---

## Agent Files (Task Assignment & Coordination)

| File | Purpose | Last Updated |
|------|---------|--------------|
| COWORK_AGENT.md | Cowork's 100-task list: documentation, compliance, QA, coordination | 2026-05-25 |
| CLAUDE_CODE_AGENT.md | Claude Code's 100-task list: UI, build pipeline, CI/CD, testing | 2026-05-25 |
| CODEX_AGENT.md | Codex's 100-task list: Firebase, auth, billing, ads, analytics, native | 2026-05-25 |
| sessions.md | Shared session log - all agents append here after every response | 2026-05-25 |

## Planning & Roadmap

| File | Purpose | Last Updated |
|------|---------|--------------|
| CRITICAL_PATH.md | Week 6 launch gate dependencies, blocking conditions, no-go criteria | 2026-05-25 |
| BUILD_PIPELINE_IMPLEMENTATION.md | 4-week build track plan for Claude Code (bundling, CI/CD, deploy) | 2026-05-25 |
| COMPLIANCE_SECURITY_ANALYTICS.md | 6-week compliance track plan for Codex (privacy, auth, analytics, IARC) | 2026-05-25 |
| LAUNCH_MARKETING_ROADMAP.md | 8-week launch track plan (beta, community, ASO, marketing) | 2026-05-25 |
| AUDIT_PUBLICATION_DOMAINS.md | Full publication audit across 9 domains (game systems, monetization, etc.) | 2026-05-25 |

## Technical Documentation

| File | Purpose | Last Updated |
|------|---------|--------------|
| README.md | Project structure overview, file layout, local dev workflow | 2026-05-25 |
| BUILD_STATUS.md | Current build state: what's complete, what's pending, next steps | 2026-05-24 |
| DEPLOYMENT_CHECKLIST.md | Step-by-step deploy instructions (Firebase, hosting, mobile) | 2026-05-24 |
| FRONTEND_INTEGRATION.md | Guide for wiring frontend to Firebase backend (code examples) | 2026-05-24 |
| CODEX_HANDOFF.md | Backend specs for Codex: Cloud Functions, Firestore schema, API contracts | 2026-05-24 |
| FIREBASE_INITIALIZATION_COMPLETE.md | Firebase project creation confirmation and config values | 2026-05-24 |
| MOBILE_STORE_SETUP.md | Capacitor + RevenueCat setup for iOS/Android store builds | 2026-05-25 |
| MOCKUP_OVERLAY_RECIPE.md | How the mockup overlay CSS pattern works (for extending UI) | 2026-05-24 |

## Configuration Files

| File | Purpose | Last Updated |
|------|---------|--------------|
| package.json | Node dependencies, build scripts, mobile scripts | 2026-05-25 |
| capacitor.config.json | Capacitor native app configuration (appId, server settings) | 2026-05-25 |
| manifest.webmanifest | PWA manifest (app name, icons, theme, display mode) | 2026-05-24 |
| service-worker.js | Offline caching strategy for PWA | 2026-05-24 |

## Backend

| File | Purpose | Last Updated |
|------|---------|--------------|
| backend/firebase-config.js | 6 Cloud Functions (syncSave, refreshSave, submitTournament, getLeaderboard, processIAP, processTournamentRound) | 2026-05-24 |
| backend/firestore.rules | Firestore security rules | 2026-05-24 |
| backend/firestore.indexes.json | Firestore query indexes | 2026-05-24 |
| backend/firebase.json | Firebase project config (hosting, functions) | 2026-05-25 |
| backend/package.json | Backend Node dependencies | 2026-05-24 |
| backend/.env.example | Environment variable template | 2026-05-24 |
| backend/FIREBASE_SETUP.md | Firebase project setup guide | 2026-05-24 |

## Game Source Code

| File | Purpose | Last Updated |
|------|---------|--------------|
| index.html | Game entry point, all HTML structure | 2026-05-24 |
| js/main.js | App initialization, Firebase boot, service worker registration | 2026-05-24 |
| js/game.js | Battle simulation logic (damage, abilities, wave generation) | 2026-05-24 |
| js/render.js | Canvas/DOM rendering for battle screen | 2026-05-24 |
| js/ui.js | Menu rendering, tabs, upgrade panels, home screen | 2026-05-24 |
| js/data.js | Game data: upgrades, cards, families, ranks, costs, products | 2026-05-24 |
| js/save.js | Save/load system (localStorage, versioned migration) | 2026-05-24 |
| js/cloud.js | Firebase client: auth, Firestore sync, cloud save | 2026-05-24 |
| js/monetization.js | RevenueCat billing abstraction (web/iOS/Android detection) | 2026-05-25 |
| js/tournament.js | Tournament bracket logic, tier placement, leaderboard | 2026-05-24 |
| js/skins.js | Skin system: unlock, equip, visual application | 2026-05-24 |
| js/profile.js | Player profile: username, cloud sync, settings | 2026-05-24 |

## Stylesheets

| File | Purpose | Last Updated |
|------|---------|--------------|
| css/theme.css | CSS variables, color palette, global theme | 2026-05-24 |
| css/base.css | Reset, typography, global layout, PWA install banner | 2026-05-24 |
| css/battle.css | Battle screen: HUD, upgrade tiles, tower, enemy sprites | 2026-05-25 |
| css/menu.css | Menu screens: tabs, home panels, navigation | 2026-05-24 |
| css/mockup-overlay.css | Research tab overlay styling (family cards, rank rows) | 2026-05-25 |
| css/skins.css | Skin gallery, skin preview, skin equip UI | 2026-05-24 |
| css/profile.css | Profile screen, cloud settings, billing panel | 2026-05-24 |

## Assets

| Directory | Contents |
|-----------|----------|
| assets/app/ | App icon SVG for PWA install |
| assets/backgrounds/ | Battle background images per skin theme |
| assets/cores/ | Core tower skin sprites |
| assets/enemies/ | Enemy type sprites |
| assets/mockups/ | Reference mockup images (ChatGPT-generated) |
| assets/vfx/ | Visual effects sprites (projectiles, impacts) |

## Reference Material

| Directory | Contents |
|-----------|----------|
| REFERENCE NOT EXACTLY HOW I WANT/ | 24 reference mockup images showing target visual direction (NOT exact copies) |
