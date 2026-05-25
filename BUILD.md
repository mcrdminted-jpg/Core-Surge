# Core Surge — Build Guide

## Prerequisites

- **Node.js** 18+ (uses `node:` protocol imports)
- **npm** (ships with Node.js)

## Install

```bash
npm install
```

This installs `esbuild` (JS/CSS bundler) and Capacitor dependencies.

## Development

### Local preview server

```bash
npm start          # or: npm run preview
```

Starts a static file server on **port 4173**. Serves from the project root (not `dist/`), so changes to `js/` and `css/` are reflected on reload.

> **Tip**: The service worker caches aggressively. If changes don't appear, open DevTools → Application → Storage → Clear site data, then reload.

### File structure

```
js/
  data.js          — Card pool, rank defs, pull odds, constants
  save.js          — Save/load, migration, defaults
  game.js          — Core gameplay loop, getters, combat math
  tournament.js    — Tournament bracket simulation
  render.js        — Battle rendering, DOM updates each frame
  ui.js            — All menu/panel UI rendering + event wiring
  cloud.js         — Firebase cloud save (optional)
  monetization.js  — RevenueCat / IAP (optional)
  main.js          — Boot sequence, passive accrual, offline catchup
  skins.js         — Skin system
  profile.js       — Username validation

css/
  theme.css        — CSS custom properties per theme (neon, steel, etc.)
  base.css         — Reset, HUD, overlays, card tiles
  battle.css       — Battlefield, enemies, projectiles, VFX
  menu.css         — Menu panels, submenu, rank rows, settings
  skins.css        — Skin-specific overrides
  profile.css      — Profile/username styles
  mockup-overlay.css — Research mockup header overlay
```

### JS load order

Scripts are loaded as globals (no ES modules). Order matters:

1. `data.js` — defines `CARD_POOL`, `RANK_DEFS`, `rankFlatBonus()`, etc.
2. `save.js` — defines `defaultSave`, `loadSave()`, `persistSave()`
3. `game.js` — defines `game` object, all getters, combat functions
4. `tournament.js` — tournament bracket logic
5. `render.js` — `renderFrame()`, `renderHud()` helpers
6. `ui.js` — all menu rendering (`renderMenu()`, `renderSubmenu()`, etc.)
7. *(Firebase CDN scripts — loaded externally)*
8. `cloud.js` — cloud save (guarded behind `window.firebase`)
9. `monetization.js` — IAP (guarded behind Capacitor)
10. `main.js` — boot sequence, event wiring
11. `skins.js` — skin definitions
12. `profile.js` — username system

## Build for Production

```bash
npm run build
```

This runs `scripts/build.js` which:

1. **Concatenates** all 11 JS files in load order
2. **Minifies** via esbuild's `transform()` API (not bundle mode — preserves global scope)
3. Outputs `dist/js/core-surge.min.js`
4. **Concatenates + minifies** all 7 CSS files → `dist/css/core-surge.min.css`
5. Transforms `index.html`: replaces individual `<script>`/`<link>` tags with bundle references
6. Generates `service-worker.js` with version-based cache key
7. Copies static assets (excludes `assets/mockups/` from production)

Output structure:
```
dist/
  index.html              — References bundled JS/CSS
  js/core-surge.min.js    — ~164KB (from ~253KB source)
  css/core-surge.min.css  — ~86KB (from ~119KB source)
  service-worker.js       — Versioned cache
  manifest.webmanifest
  assets/                 — All game assets (minus mockups)
```

## Testing

```bash
npm test
```

Runs 252 smoke tests via `scripts/test.js`:
- Bundle integrity (all files exist)
- Card pool validation (25 cards, correct tiers, increasing values)
- Pull odds sum to 1.0
- Card pricing, copy thresholds, slot costs
- Rank cost escalation formula
- Tournament constants
- Game constants (MAX_TIER, milestones)
- Unlock families (11 families)
- Build output validation (if dist/ exists)

## Mobile (Capacitor)

```bash
npm run mobile:prep      # Builds dist/
npm run mobile:sync      # Builds + syncs to native projects
npm run mobile:open:ios  # Opens Xcode
npm run mobile:open:android  # Opens Android Studio
```

## Lane Boundaries

This codebase uses a multi-agent workflow:

- **Claude Code**: UI polish, build pipeline, gameplay wiring
- **Codex**: Backend, native, billing (`cloud.js`, `monetization.js`, `capacitor.config.json`)
- **Claude Cowork**: Documentation, session tracking

Do NOT cross-edit files owned by another agent's lane.
