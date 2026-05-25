# Font and Color Guide - Core Surge Design System

**Extracted from:** All 7 CSS files
**Game Version:** v0.7.22

---

## CSS Custom Properties (theme.css)

All themes define the same 14 variable slots. The active theme is set via `data-theme` attribute on `:root`.

### Variable Definitions

| Variable | Purpose | Neon (default) | Steel | Amber | Forest | Royal | Mono |
|----------|---------|----------------|-------|-------|--------|-------|------|
| `--bg` | Page background | `#0a0a14` | `#0f1115` | `#140e08` | `#0a1510` | `#0e0a18` | `#0a0a0a` |
| `--bg-2` | Secondary background | `#11112a` | `#161a22` | `#1e1610` | `#13201a` | `#181228` | `#151515` |
| `--panel` | Panel/card background | `#1a1a3a` | `#1e232e` | `#2a1f16` | `#1b2c23` | `#221a38` | `#202020` |
| `--panel-2` | Elevated panel | `#232348` | `#262c38` | `#36281c` | `#243a2e` | `#2e2548` | `#2a2a2a` |
| `--accent` | Primary accent | `#00f0ff` | `#8ab4d8` | `#ffaa44` | `#6dd47e` | `#b488e8` | `#e0e0e0` |
| `--accent-dim` | Muted accent (borders) | `#0088aa` | `#3e5877` | `#aa6611` | `#3a8848` | `#684799` | `#707070` |
| `--accent-deep` | Deep accent (backgrounds) | `#003355` | `#22303f` | `#3a2208` | `#1e3b26` | `#332255` | `#2a2a2a` |
| `--danger` | Error/damage/HP loss | `#ff3366` | `#d66272` | `#dd5544` | `#cc6a5a` | `#d66288` | `#c0c0c0` |
| `--gold` | Coins/premium/highlight | `#ffcc00` | `#d4b66a` | `#ffdd66` | `#d4b866` | `#e0b8e8` | `#f0f0f0` |
| `--good` | Health/positive/success | `#44ff88` | `#7dc48a` | `#99cc66` | `#88dd99` | `#8cc4b8` | `#a0a0a0` |
| `--purple` | Gems/prime rarity | `#aa44ff` | `#9b88b8` | `#cc7744` | `#8cb890` | `#c488ff` | `#909090` |
| `--cyan2` | Secondary cyan/info | `#66ddff` | `#7eb3c9` | `#ffbb66` | `#7ec987` | `#a0a0f0` | `#b0b0b0` |
| `--text` | Primary text | `#e0e0ff` | `#c9d1db` | `#f0e0c0` | `#d0e0d4` | `#e0d4f0` | `#f0f0f0` |
| `--muted` | Secondary/disabled text | `#6677aa` | `#6a7482` | `#998866` | `#668876` | `#7a6a92` | `#606060` |
| `--glow-on` | Glow effect toggle (0/1) | `1` | `0` | `1` | `0` | `1` | `0` |
| `--grid-color` | Animated grid background | `rgba(0,240,255,0.04)` | `rgba(138,180,216,0.03)` | `rgba(255,170,68,0.04)` | `rgba(109,212,126,0.04)` | `rgba(180,136,232,0.04)` | `rgba(224,224,224,0.03)` |

---

## Additional Color Values Used (Not Variables)

### Hardcoded Colors in CSS

| Color | Context | File |
|-------|---------|------|
| `#ff4466` / `#cc2244` | End button gradient | base.css |
| `#ff6688` | End button border | base.css |
| `#001524` | Dark text on bright buttons | menu.css |
| `#00e0ff` / `#0080b8` | Start button / CTA gradient | menu.css |
| `#00d0ee` / `#0080b0` | Lab buy button gradient | menu.css |
| `#e86aff` / `#ff8fc0` | Title gradient middle/end | menu.css |
| `#3fb6ff` / `#b27bff` / `#ff6abf` | Mockup title gradient | mockup-overlay.css |
| `#b87333` | Copper league | (data.js via inline) |
| `#cd7f32` | Bronze league | (data.js via inline) |
| `#c0c0c0` | Silver league | (data.js via inline) |
| `#e5e4e2` | Platinum league | (data.js via inline) |
| `white` / `#fff` / `#ffffff` | Text on dark overlays | multiple files |
| `black` / `#000` | Text shadows, dark panels | multiple files |
| `#888` / `#ccc` / `#666` / `#444` / `#222` | Ad overlay neutrals | base.css |
| `#8ab4d8` | Standard card border | menu.css |
| `#b58bff` | Prime card border | menu.css |
| `#664400` | Coin icon dark text | base.css |
| `#113311` / `#226622` | Cash icon dark | base.css |

### Home Panel Specific (menu.css)

| Color | Purpose |
|-------|---------|
| `#6a8da8` | Panel label text |
| `#5a7a9a` | Muted stat label |
| `#e0eaf4` | Daily task text |
| `#6ff0ff` | Cyan highlights |
| `#ffd966` | Ready milestone gold |
| `#6fe89a` | Claimed milestone green |
| `#3a5a7a` | Unclaimed milestone text |
| `#ff4466` | Badge red |
| `#0af` / `#6ff0ff` | Progress bar gradient |

---

## Font Families

| Font Stack | Usage |
|------------|-------|
| `'SF Mono', 'Menlo', Consolas, monospace` | Primary (everything - body, buttons, labels) |
| `Consolas, "Courier New", monospace` | Cloud config textarea (profile.css) |

**Note:** The entire game uses a single monospace font stack. No serif or sans-serif fonts are used anywhere.

---

## Font Sizes (All Unique Values)

### Sorted from smallest to largest:

| Size | Typical Usage |
|------|--------------|
| `7px` | Tiny labels (HUD label, milestone tier, panel titles, hex strip labels) |
| `7.5px` | Submenu button text |
| `8px` | Card tier labels, status labels, skin status, milestone hint |
| `9px` | Menu subtitle, tagline, card names, descriptions, stat labels |
| `10px` | Body text, button labels, descriptions, settings rows |
| `11px` | Important labels, section titles, card names, button text |
| `12px` | HUD values, button text, end-run stats, upgrade names |
| `13px` | Stat values, large labels, shop names |
| `14px` | Secondary headings, button text, tier-num small, more-sheet title |
| `15px` | Profile input text |
| `16px` | Upgrade BM value |
| `18px` | Submenu icons, nav icons, large resource icons |
| `20px` | End title, tier arrows |
| `22px` | More-sheet icons, lab icons, mockup family icons |
| `26px` | Wave banner text |
| `28px` | Mockup family icons (clamp max) |
| `30px` | Boss wave banner |
| `48px` | Ad countdown, tier-num display |

### Clamp-based responsive sizes:

| Definition | Usage |
|------------|-------|
| `clamp(32px, 8.5vw, 46px)` | Menu title (CORE SURGE) |
| `clamp(28px, 7.5vw, 38px)` | Panel section titles |
| `clamp(13px, 4vw, 20px)` | Mockup overlay title |
| `clamp(9px, 2.5vw, 14px)` | Mockup family name |
| `clamp(8px, 2vw, 12px)` | Mockup family cost |
| `clamp(14px, 4vw, 22px)` | Mockup locked family name |
| `clamp(7px, 1.6vw, 9px)` | Mockup locked cost |

---

## Font Weights Used

| Weight | Usage |
|--------|-------|
| `300` | Empty card slot plus sign |
| `500` | Return-to-battle HP text |
| `600` | Upgrade name, profile input, username badge, home panel labels |
| `700` (bold) | Most button text, values, labels |
| `800` | Important labels, store badges, daily labels, profile save |
| `900` | Titles, tier numbers, start button, stat values, nav emphasis |

---

## Letter Spacing Values

| Value | Usage |
|-------|-------|
| `0.2px - 0.5px` | Small body text, card names |
| `0.8px` | Badges, install banner, submenu, nav labels |
| `1px` | Section titles, status labels, card tiers |
| `1.2px` | Mockup subtab labels |
| `1.5px` | Return-to-battle, tier-mul, league pills |
| `2px` | Section headers, shop titles, dev panel |
| `2.5px` | Start button |
| `3px` | Menu subtitle, panel subtitle |
| `4px` | Title text, more-sheet title, mockup title |

---

## Spacing System (Margins & Paddings)

### Common padding values:
`2px`, `3px`, `4px`, `5px`, `6px`, `8px`, `10px`, `12px`, `14px`, `16px`, `18px`, `20px`

### Common gap values:
`2px`, `3px`, `4px`, `5px`, `6px`, `8px`, `10px`, `12px`, `14px`, `16px`

### Common margin-bottom values:
`2px`, `4px`, `5px`, `6px`, `8px`, `10px`, `12px`, `14px`, `16px`, `18px`, `20px`

### Page-level padding:
- Menu content: `0 14px 120px`
- Cards/panels: `12px - 14px`
- Bottom nav: `6px 8px max(6px, env(safe-area-inset-bottom)) 8px`

---

## Border Styles

### Border widths:
| Width | Usage |
|-------|-------|
| `1px` | Standard borders, dividers |
| `1.5px` | Cards, panels, tabs, tier picker |
| `2px` | Featured items, skins equipped, important cards, tower base |

### Border radii:
| Value | Usage |
|-------|-------|
| `1px - 2px` | HP bar fill, speed buttons |
| `3px - 4px` | Small pills, buttons, shooter enemies |
| `5px - 6px` | Standard buttons, status grid, upgrade icons |
| `8px` | Tabs, buttons, settings, auth cards |
| `10px` | Panels, cards, settings sections, tier hex |
| `12px` | Large cards, rank rows, shop packs, skin tiles |
| `14px` | Featured panels, tier picker, menu preview |
| `18px` | More-sheet panel top corners |
| `20px` | Coin banner pill |
| `50%` | Circles (tower, enemies, range ring, gems icon) |
| `999px` | Full-round pills (install banner buttons, cloud badge) |

---

## Box Shadows

| Shadow | Context |
|--------|---------|
| `0 0 calc(var(--glow-on) * Npx) [color]` | Conditional glow (disabled in steel/forest/mono themes) |
| `0 0 5px` | Small button glow |
| `0 0 6px` | Equipped items, skin tiles |
| `0 0 8px` | Card glow, tab glow |
| `0 0 10px` | Rank buttons, prime cards |
| `0 0 14px` | Boss enemies, equipped skins, submenu active |
| `0 0 20px` | Featured shop, tier picker |
| `0 0 24px` | Tier picker outer, augmenter enemies |
| `0 0 30px` | Start button |
| `0 0 40px` | Pull reveal card |
| `inset 0 0 10px` | Tower core, lab icon tile |
| `inset 0 0 30px` | Tier picker inner glow |
| `inset 0 2px 0 rgba(255,255,255,0.3)` | Start button top highlight |
| `0 4px 12px rgba(0,0,0,0.5)` | Offline toast |
| `0 -8px 30px` | More-sheet elevation |

---

## Gradients

### Linear gradients (common patterns):

| Gradient | Usage |
|----------|-------|
| `linear-gradient(180deg, rgba(10,15,28,0.95), rgba(6,10,18,0.98))` | Top HUD |
| `linear-gradient(180deg, rgba(18,28,48,0.7), rgba(10,16,28,0.85))` | Standard panel/card |
| `linear-gradient(180deg, rgba(20,30,50,0.8), rgba(12,18,32,0.8))` | Submenu buttons |
| `linear-gradient(180deg, #00e0ff, #0080b8)` | Primary CTA button |
| `linear-gradient(180deg, #00d0ee, #0080b0)` | Secondary CTA |
| `linear-gradient(180deg, #ff4466, #cc2244)` | Danger/end button |
| `linear-gradient(90deg, #00e0ff, #e86aff, #ff8fc0)` | Title text gradient |
| `linear-gradient(90deg, #ff3366, #ff6688, #ff8aaa)` | HP bar fill |
| `linear-gradient(135deg, ...)` | Featured cards, mockup panels |

### Radial gradients:

| Gradient | Usage |
|----------|-------|
| `radial-gradient(ellipse at 50% 72%, var(--panel), var(--bg))` | Battlefield |
| `radial-gradient(circle, #ffdd66, #cc9900)` | Coin icon |
| `radial-gradient(circle, #88dd88, #226622)` | Cash icon |
| `radial-gradient(circle at 35% 30%, #c999ff, #6633cc, #331a66)` | Gem orb |
| `radial-gradient(circle at 50% 50%, var(--accent), var(--accent-dim), var(--accent-deep))` | Tower base |

---

## Animations & Transitions

### Keyframe Animations:

| Name | Duration | Usage |
|------|----------|-------|
| `bg-drift` | 40s linear infinite | Menu background grid |
| `corepulse` | 1.8s ease-in-out infinite | Tower core breathing |
| `boss-pulse` | 1.5s ease-in-out infinite | Boss enemy glow |
| `boss-pulse-sprite` | 1.4s ease-in-out infinite | Boss sprite scale |
| `aug-pulse` | 1.5s ease-in-out infinite | Augmenter enemy glow |
| `focus-pulse` | 0.6s ease-out forwards | Tap focus ring |
| `float-up` | 0.6s ease-out forwards | Floating damage/cash text |
| `banner-fade` | 0.9s ease-out forwards | Wave announcement |
| `wave-expand` | 0.6s ease-out forwards | Boss clear shockwave |
| `toastFade` | 1.4s ease-out forwards | Toast notifications |
| `fadeIn` | 0.2s ease-out | Pull reveal overlay |
| `pullPop` | 0.4s ease-out | Card pull animation |
| `pulse-border` | 1s infinite | Card slot selecting |
| `pulse` | 0.25s | Generic pulse feedback |
| `coin-pulse` | 0.3s | Coin earn feedback |
| `orb-bob` | 2.2s ease-in-out infinite | Gem orb floating |
| `sheet-fade` | 0.2s ease-out | More-sheet backdrop |
| `sheet-slide` | 0.25s cubic-bezier | More-sheet entrance |
| `preview-float` | 3s ease-in-out infinite | Menu core preview |
| `preview-ring` | 8s linear infinite | Menu range ring spin |
| `preview-bob-1/2/3` | 3.2-4.4s ease-in-out infinite | Menu enemy bobbing |
| `ms-pulse` | 1.5s ease-in-out infinite | Ready milestone glow |

### Transition Properties:

| Property | Duration | Usage |
|----------|----------|-------|
| `transform` | 0.1s - 0.15s | Button press feedback |
| `all` | 0.15s - 0.25s | Tab/button state changes |
| `width` | 0.15s - 0.3s | HP bar, progress bars |
| `max-height` | 0.2s - 0.3s | Expandable panels |
| `border-color` | 0.15s | Input focus |
| `filter, opacity` | 0.15s | Profile save button |
| `width, height` | 0.3s | Range ring size |

---

## Z-Index Layers

| Z-Index | Element |
|---------|---------|
| 0 | Menu background grid |
| 1 | Skin backdrop gameplay elements |
| 2 | Tower core, range ring, HP text |
| 5 | Tower, battlefield side buttons |
| 10 | Top HUD |
| 30 | Menu overlay during battle |
| 40 | Return-to-battle bar |
| 50 | Bottom global nav, offline toast |
| 60 | Gem orb |
| 100 | End overlay, more-sheet |
| 140 | Install banner |
| 300 | Dev panel, ad overlay, skin toast |
| 400 | Pull reveal overlay |
| 500 | Cloud auth modal |

---

## Design Principles for Consistent Styling

1. **Use theme variables** - Never hardcode colors for game UI elements. Use `var(--accent)`, `var(--danger)`, etc.
2. **Glow is conditional** - Always use `calc(var(--glow-on) * Npx)` so glows disable in steel/forest/mono themes.
3. **Monospace only** - Use `font-family: inherit` on all elements to inherit the mono stack.
4. **Touch targets** - Minimum 38px height for interactive elements (most use 44px+).
5. **Panel pattern** - Standard card: `linear-gradient(180deg, rgba(18,28,48,0.7), rgba(10,16,28,0.85))` with `border: 1.5px solid var(--accent-dim)` and `border-radius: 12px`.
6. **Button pattern** - CTA: gradient from bright to medium accent, `font-weight: 900`, uppercase with letter-spacing.
7. **Text hierarchy** - Titles: 900 weight, large, gradient clip. Labels: 8-9px, uppercase, letter-spacing 1-2px. Values: bold, accent-colored.
