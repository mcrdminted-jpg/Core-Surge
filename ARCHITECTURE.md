# Core Surge - Architecture & File Structure

Complete file map for Core Surge: Endless Tower Defense (v0.7.23)

---

## Root Directory

```
Tower Mobile App Game/
├── index.html                  Game entry point - all HTML structure, screen containers, modals
├── package.json                Node config: build/typecheck/serve/mobile scripts, dependencies
├── package-lock.json           Locked dependency versions
├── capacitor.config.json       Native app config (appId: com.mcrdminted.coresurge, webDir: dist)
├── manifest.webmanifest        PWA manifest (name, icons, theme, display: standalone)
├── service-worker.js           Offline caching strategy for PWA install
├── LAUNCH_TRACKER.html         Interactive launch status dashboard
├── core-surge---tower-defense-firebase-adminsdk-fbsvc-*.json   Firebase service account key (SECRET)
```

## JavaScript (js/)

```
js/
├── main.js          App bootstrap: DOM ready, service worker registration, init sequence
├── game.js          Battle simulation: damage calc, crit, abilities, wave generation, enemy AI
├── render.js        Canvas/DOM rendering: draw enemies, projectiles, tower, VFX, battle scene
├── ui.js            Menu system: tabs, upgrade panels, home panels, research, goals, settings
├── data.js          Static game data: upgrades, cards, families, ranks, costs, product catalog
├── save.js          Persistence: localStorage read/write, version migration (v8), state serialization
├── cloud.js         Firebase client: auth state, Firestore sync, cloud save/load, config management
├── monetization.js  Store billing: RevenueCat bridge, platform detection, purchase flow, restore
├── tournament.js    Tournament logic: bracket generation, tier placement, scoring, leaderboard
├── skins.js         Skin system: unlock conditions, equip logic, visual application to tower/bg
├── profile.js       Player profile: username, playerId, cloud sync, settings persistence
```

## Stylesheets (css/)

```
css/
├── theme.css            CSS variables: color palette, gradients, spacing, animation timing
├── base.css             Reset, typography, body layout, PWA install banner, global utilities
├── battle.css           Battle screen: HUD layout, upgrade tiles, tower container, enemy sprites
├── menu.css             Menu screens: tab bar, home panels, card grids, navigation
├── mockup-overlay.css   Research tab: family cards, rank rows, sub-tabs, "Coming Soon" states
├── skins.css            Skin gallery: preview cards, equip button, unlock states
├── profile.css          Profile screen: cloud settings panel, billing panel, account section
```

## Assets (assets/)

```
assets/
├── app/
│   └── icon.svg                      PWA app icon (SVG)
├── backgrounds/
│   ├── bg_01_cyber_grid.png          Neon/default skin background
│   ├── bg_02_industrial.png          Industrial skin background
│   ├── bg_03_organic.png             Verdant skin background
│   └── bg_04_steel.png               Aegis/steel skin background
├── cores/
│   ├── core_01_sentinel.png          Default tower sprite
│   ├── core_02_industrial.png        Industrial skin tower
│   ├── core_03_verdant.png           Verdant skin tower
│   ├── core_04_aegis.png             Aegis skin tower
│   ├── core_05_frost.png             Frost skin tower
│   └── core_06_royal.png             Royal skin tower
├── enemies/
│   ├── enemy_01_scout_cyan.png       Scout (fast, low HP)
│   ├── enemy_02_runner_orange.png    Runner (very fast)
│   ├── enemy_03_tank_green.png       Tank (slow, high HP)
│   ├── enemy_04_shooter_violet.png   Shooter (ranged)
│   ├── enemy_05_spitter_acid.png     Spitter (DoT)
│   ├── enemy_06_flyer_azure.png      Flyer (ignores ground)
│   ├── enemy_07_reaver_crimson.png   Reaver (armor pierce)
│   ├── enemy_08_warden_gold.png      Warden (shield allies)
│   ├── enemy_09_sentry_teal.png      Sentry (stationary)
│   ├── enemy_10_brute_amethyst.png   Brute (AoE resist)
│   ├── enemy_11_elite_ember.png      Elite (mini-boss)
│   └── enemy_12_boss_void.png        Boss (wave boss)
├── mockups/
│   └── research_hdr.png              Research tab header mockup (reference only)
└── vfx/
    ├── burst_*.png                   Explosion/burst effects (azure, gold, violet)
    ├── explode_fire.png              Fire explosion
    ├── heal_green.png                Healing effect
    ├── impact_*.png                  Hit impact effects (cyan, ember)
    ├── missile_*.png                 Projectile sprites (arrow, bullet, chevron, rocket, tri_arrow)
    ├── muzzle_*.png                  Muzzle flash (azure, gold, green, magenta)
    ├── pickup_coin.png               Coin pickup effect
    ├── proj_*.png                    Projectile trails (comet, link, plasma, ring, spear, star)
    ├── shield_*.png                  Shield effects (teal, violet)
    └── spark_*.png                   Spark particles (azure, gold, green, pink)
```

## Backend (backend/)

```
backend/
├── firebase-config.js       6 Cloud Functions: syncSave, refreshSave, submitTournament,
│                            getLeaderboard, processIAP, processTournamentRound
├── firestore.rules          Security rules: user data private, leaderboard public, webhook IAP
├── firestore.indexes.json   Query optimization indexes
├── firebase.json            Firebase project config (hosting → ../dist, functions → .)
├── package.json             Backend dependencies (firebase-admin, firebase-functions)
├── .env.example             Environment variable template (API keys, secrets)
└── FIREBASE_SETUP.md        Firebase project creation and deployment guide
```

## Build Scripts (scripts/)

```
scripts/
├── typecheck.js     Static analysis / type checking pass
├── build.js         Production build: copies source to dist/, minification ready
└── serve.js         Local dev server for testing
```

## Native Projects (generated by Capacitor)

```
android/                     Android Studio project (generated, synced from dist/)
├── app/                     Main Android app module
├── capacitor-cordova-android-plugins/   Plugin bridge
└── gradle/                  Build system

ios/                         Xcode project (generated, synced from dist/)
├── App/                     Main iOS app target
│   ├── App.xcodeproj/      Xcode project file
│   └── App.xcworkspace/    Xcode workspace
└── capacitor-cordova-ios-plugins/   Plugin bridge
```

## Generated Output (dist/)

```
dist/                        Built output (copied from source by scripts/build.js)
                             This is what gets deployed to Firebase Hosting
                             and synced into android/ and ios/ via Capacitor
```

## Documentation (*.md at root)

See INDEX.md for complete listing with purposes and dates.

---

## Data Flow

```
Player Input → game.js (battle logic) → render.js (visual output)
                    ↓
              save.js (persist to localStorage)
                    ↓
              cloud.js (sync to Firestore if authenticated)
                    ↓
              monetization.js (handle purchases if native)
```

## Build & Deploy Flow

```
Source (js/, css/, assets/, index.html)
    → scripts/build.js → dist/
    → firebase deploy --only hosting → live at .web.app
    → npx cap sync → android/ and ios/ updated
    → Android Studio / Xcode → native app builds
```
