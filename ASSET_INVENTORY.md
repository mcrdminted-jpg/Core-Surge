# Asset Inventory — Core Surge v0.7.23
**Generated: 2026-05-24 | Total: 53 files, 5,824 KB**

## Summary

| Category     | Files | Size (KB) | Notes                                  |
|-------------|-------|-----------|----------------------------------------|
| Backgrounds | 4     | 1,981     | Battle arenas, menu previews           |
| Cores       | 6     | 1,259     | Tower skin sprites (one per skin)      |
| Enemies     | 12    | 1,157     | One sprite per enemy type              |
| VFX         | 28    | 951       | Projectiles, bursts, muzzles, impacts  |
| Mockups     | 1     | 367       | Research panel design reference         |
| App Icons   | 1     | 1         | SVG app icon                            |
| **Total**   | **53**| **5,716** |                                        |

## Serving Strategy

Assets are served from `./assets/` relative to index.html. The build pipeline copies the entire `assets/` folder to `dist/assets/`. For production:

1. **Firebase Hosting CDN** handles edge caching automatically
2. **Service worker** pre-caches only critical assets (icon.svg, core_04_aegis.png)
3. **Remaining assets** are loaded on-demand and cached on first fetch
4. **No external CDN needed** — Firebase Hosting provides global CDN at no extra cost

## Size Optimization Opportunities

- **Backgrounds (1,981 KB):** Largest category. Could convert to WebP for ~40% savings (~1.2MB saved). Consider lazy-loading non-default backgrounds.
- **Cores (1,259 KB):** Load only equipped skin on startup; lazy-load others when skins tab opens.
- **Enemies (1,157 KB):** All needed during gameplay. Could sprite-sheet for fewer HTTP requests.
- **Mockups (367 KB):** Development-only reference. Exclude from production builds.
- **VFX (951 KB):** Loaded during battle. Could sprite-sheet projectiles/muzzles.

## File Listing

### assets/app/ (1 file, 1 KB)
- `icon.svg` — 1.3 KB — App icon (PWA, favicon)

### assets/backgrounds/ (4 files, 1,981 KB)
- `bg_01_cyber_grid.png` — 366 KB — Default neon theme
- `bg_02_industrial.png` — 568 KB — Industrial theme
- `bg_03_organic.png` — 510 KB — Verdant theme
- `bg_04_steel.png` — 537 KB — Steel/aegis theme

### assets/cores/ (6 files, 1,259 KB)
- `core_01_sentinel.png` — 158 KB — Sentinel (default)
- `core_02_industrial.png` — 212 KB — Industrial
- `core_03_verdant.png` — 160 KB — Verdant
- `core_04_aegis.png` — 239 KB — Aegis (also used as PWA touch icon)
- `core_05_frost.png` — 213 KB — Frost
- `core_06_royal.png` — 278 KB — Royal

### assets/enemies/ (12 files, 1,157 KB)
- `enemy_01_scout_cyan.png` — 62 KB
- `enemy_02_runner_orange.png` — 91 KB
- `enemy_03_tank_green.png` — 118 KB
- `enemy_04_shooter_violet.png` — 75 KB
- `enemy_05_spitter_acid.png` — 99 KB
- `enemy_06_flyer_azure.png` — 85 KB
- `enemy_07_reaver_crimson.png` — 81 KB
- `enemy_08_warden_gold.png` — 94 KB
- `enemy_09_sentry_teal.png` — 75 KB
- `enemy_10_brute_amethyst.png` — 101 KB
- `enemy_11_elite_ember.png` — 131 KB
- `enemy_12_boss_void.png` — 147 KB

### assets/vfx/ (28 files, 951 KB)
- Bursts: `burst_azure.png` (58 KB), `burst_gold.png` (61 KB), `burst_violet.png` (59 KB)
- Explosions: `explode_fire.png` (78 KB)
- Heals: `heal_green.png` (38 KB)
- Impacts: `impact_cyan.png` (37 KB), `impact_ember.png` (37 KB)
- Missiles: 6 files (19–29 KB each)
- Muzzle flashes: 4 files (29–32 KB each)
- Pickups: `pickup_coin.png` (44 KB)
- Projectiles: 6 files (13–40 KB each)
- Shields: `shield_teal.png` (58 KB), `shield_violet.png` (54 KB)
- Sparks: 4 files (22–28 KB each)

### assets/mockups/ (1 file, 367 KB)
- `research_hdr.png` — 367 KB — Research panel UI mockup (dev reference only)

## Referenced By

| Asset Path | Referenced In |
|-----------|---------------|
| assets/app/icon.svg | index.html, manifest.webmanifest, service-worker.js |
| assets/cores/core_04_aegis.png | index.html (apple-touch-icon), service-worker.js |
| assets/backgrounds/*.png | css/skins.css (data-bg-skin selectors), css/menu.css |
| assets/cores/*.png | css/skins.css (data-core-skin selectors) |
| assets/enemies/*.png | css/skins.css (enemy sprite selectors) |
| assets/vfx/*.png | css/skins.css (projectile/effect selectors), css/menu.css |
| assets/mockups/research_hdr.png | css/mockup-overlay.css (commented out) |
