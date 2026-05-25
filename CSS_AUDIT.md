# CSS Audit Report

**Date:** 2026-05-24
**Scope:** All 7 CSS files in `css/`
**Game Version:** v0.7.22

---

## File Summary

| File | Lines | Primary Responsibility |
|------|-------|----------------------|
| `theme.css` | 61 | CSS variables (6 themes), global reset, body layout |
| `base.css` | 1036 | HUD, dev panel, end overlay, toasts, milestones, shop, cards, ad overlay |
| `battle.css` | 639 | Battle screen, HP bar, enemies, projectiles, upgrades panel |
| `menu.css` | 1716 | Menu container, hero, tier picker, submenu grid, all tab content, bottom nav, home panels |
| `mockup-overlay.css` | 299 | Mockup background overlay for Research panel |
| `skins.css` | 212 | Core skins, background skins, enemy sprites, projectile sprites |
| `profile.css` | 258 | Username input, cloud sync UI, auth modal |
| **TOTAL** | **4221** | |

---

## Duplicate Selectors Across Files

| Selector | Files | Issue |
|----------|-------|-------|
| `.milestone` | base.css (line 443), menu.css (line 423) | **Conflicting definitions.** base.css uses `display: flex`, menu.css uses `display: grid` with completely different layout. menu.css likely overrides base.css since it loads after. |
| `.skin-grid` | base.css (line 549), menu.css (line 670) | **Conflicting definitions.** base.css uses `grid-template-columns: repeat(3, 1fr)`, menu.css uses `repeat(auto-fill, minmax(100px, 1fr))`. |
| `.skin-tile` | base.css (line 556), menu.css (line 676) | **Conflicting definitions.** Different padding, border-radius, and transition properties. |
| `.skin-preview` | base.css (line 567), menu.css (line 694) | **Conflicting.** base.css uses fixed sizes with border-radius: 50%. menu.css uses aspect-ratio: 1/1 with cover sizing. |
| `.skin-name` | base.css (line 583), menu.css (line 701) | Minor conflict: different font-size (10px vs 11px). |
| `.skin-status` | base.css (line 586), menu.css (line 707) | Minor: different font-size (8px vs 9px) and letter-spacing. |
| `.skin-toast` | base.css (line 592), menu.css (line 714) | **Different positions.** base.css: `bottom: 80px`, menu.css: `bottom: 100px`. Different backgrounds. |
| `.shop-coming` | base.css (line 517), menu.css (line 649) | **Conflicting.** base.css: `flex-direction: column`, menu.css: `display: grid`. |
| `.shop-coming-item` | base.css (line 521), menu.css (line 655) | Different layout and styling. |
| `.shop-section-title` | base.css (line 536), menu.css (line 587) | Minor: different letter-spacing (1px vs 2px) and margin. |
| `.shop-section-sub` | base.css (line 543), menu.css (line 597) | Minor differences in font-size and margin. |
| `.card-tile` | base.css (line 846), menu.css (line 512) | **Completely different.** base.css: grid item with overflow. menu.css: aspect-ratio card with flex-end justification. |
| `.upgrade-cost` | battle.css (lines 551, 574) | **Duplicate within same file.** Second rule uses `!important` to override the first. |
| `.enemy` | battle.css (line 247), skins.css (line 137) | skins.css uses `!important` on background, border, box-shadow to override battle.css. |
| `.projectile` | battle.css (line 293), skins.css (line 188) | skins.css uses `!important` to replace all visual properties. |

---

## Conflicting Styles (Same Property, Different Values)

| Property | Conflict Location | Values |
|----------|------------------|--------|
| `.milestone display` | base.css: `flex` vs menu.css: `grid` | Active conflict - menu.css wins by load order |
| `.skin-grid grid-template-columns` | base.css: `repeat(3, 1fr)` vs menu.css: `repeat(auto-fill, minmax(100px, 1fr))` | menu.css wins |
| `.card-tile display/layout` | base.css: grid-based vs menu.css: aspect-ratio flex | menu.css wins |
| `.upgrade-cost background` | battle.css line 551 vs 574 | Second uses `!important`, redundant override of self |
| `.upgrade-heal-cost` | battle.css line 583 vs 629 | Different colors (good vs gold); line 583 uses `!important` |
| `.enemy` visuals | battle.css vs skins.css | skins.css uses `!important` to blank everything. battle.css rules are dead code when skins.css loads |
| `.menu-bg` | base.css line 5 (animated grid) vs menu.css line 57 (`display: none`) | menu.css hides it entirely - base.css animation is dead code |

---

## Potentially Unused Selectors

These selectors appear in CSS but may not match current HTML (based on index.html inspection):

| Selector | File | Reason |
|----------|------|--------|
| `.hud-cell` | base.css | Marked "Legacy classes" in comment; likely replaced by `.hud-stat-card` |
| `.hud-label` | base.css | Marked legacy |
| `.hud-value`, `.hud-value.gold`, `.hud-value.good`, `.hud-value.purple` | base.css | Marked legacy |
| `.menu-bg` (animated version) | base.css | Hidden by menu.css `display: none` |
| `.tier-select-header`, `.tier-select-label`, `.tier-select-info` | menu.css | All set to `display: none` |
| `.goal-tier-tabs`, `.goal-tier-tab`, `.goal-tier-badge` | base.css | Replaced by `.tier-hex-strip` system in menu.css |
| `.milestone-tier-header` | base.css | Old milestone layout; menu.css rewrites milestones entirely |
| `.milestone-info`, `.milestone-target`, `.milestone-reward`, `.milestone-btn` | base.css | Old milestone child selectors from the flex-based layout |
| `.card-slots` (repeat 3) | base.css | Old card slot grid; may be replaced by `.slots-strip` in menu.css |
| `.enemy.normal` through `.enemy.boss` background colors | battle.css | All overridden to `none !important` by skins.css |
| `.projectile` colors and sizes | battle.css | All overridden by skins.css sprites |
| `.enemy-hp` widths in battle.css | battle.css | Overridden by skins.css `!important` rules |

---

## Missing Vendor Prefixes

| Property | Files Using It | Prefix Needed |
|----------|---------------|---------------|
| `backdrop-filter` | menu.css (global-nav, more-sheet-backdrop) | `-webkit-backdrop-filter` is present - OK |
| `background-clip: text` | menu.css, mockup-overlay.css | `-webkit-background-clip` is present - OK |
| `-webkit-text-fill-color` | menu.css, mockup-overlay.css | Webkit-only property, works on all mobile WebKit/Blink - OK |
| `touch-action` | theme.css, battle.css | No prefix needed (standard) |
| `user-select` | theme.css | `-webkit-user-select` is present - OK |
| `color-mix()` | battle.css | Has `@supports` fallback - OK |
| `image-rendering: -webkit-optimize-contrast` | skins.css | Webkit-only; missing `image-rendering: pixelated` standard fallback |
| `clip-path: polygon()` | battle.css (HP bar) | Missing `-webkit-clip-path` for older iOS Safari (<14) |

---

## Overly Specific Selectors

| Selector | File | Suggestion |
|----------|------|-----------|
| `.mockup-bg-research .mor-subtab.active .mor-subtab-label` | mockup-overlay.css | 4-level specificity; could use BEM naming |
| `.mockup-bg-research .mor-fam.owned .mor-fam-cost` | mockup-overlay.css | 4-level specificity |
| `#tower[data-core-skin="sentinel"]::before` | skins.css | ID + attribute + pseudo; high specificity but acceptable for skin overrides |
| `#battlefield[data-bg-skin] > .tower` | skins.css | ID + attribute + child; necessary for z-index layering |
| `.skin-tile[data-kind="core"][data-skin="sentinel"] .skin-preview::after` | skins.css | 4 compounded selectors; acceptable for unique skin rules |

---

## Dead Code Estimate

| File | Estimated Dead % | Notes |
|------|-----------------|-------|
| `theme.css` | 0% | All variables and reset are actively used |
| `base.css` | ~25% | Legacy HUD classes, old milestone layout, old skin/shop/card layouts superseded by menu.css |
| `battle.css` | ~20% | Enemy colors, projectile styles, and HP bar sizing all overridden by skins.css |
| `menu.css` | ~5% | Hidden selectors (tier-select-header/label/info) are minimal |
| `mockup-overlay.css` | 0% | Tightly scoped to research overlay |
| `skins.css` | 0% | All rules actively drive sprite rendering |
| `profile.css` | 0% | All rules used by profile and cloud sync UI |

---

## Recommendations

1. **Remove legacy HUD classes** from base.css (`.hud-cell`, `.hud-label`, `.hud-value`) after confirming no JS references remain.
2. **Consolidate duplicate selectors.** The skin/shop/milestone/card rules in base.css are fully superseded by menu.css. Remove them from base.css.
3. **Remove dead enemy/projectile CSS** from battle.css. Since skins.css overrides everything with `!important`, the original fallback colors serve no purpose (skins.css always loads).
4. **Fix the self-conflicting `.upgrade-cost`** in battle.css - merge into a single rule.
5. **Add `-webkit-clip-path`** fallback to the HP bar for older iOS Safari.
6. **Add `image-rendering: pixelated`** standard property alongside the webkit variant in skins.css.
7. **Consider a CSS cleanup pass** that removes ~200 lines of dead code (estimated 5% overall project reduction).
