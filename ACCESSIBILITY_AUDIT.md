# Accessibility Audit - index.html

**Audited: 2026-05-24**
**File: index.html (v0.7.23)**

## Summary

| Category | Issues Found | Severity |
|----------|-------------|----------|
| Missing alt text | 0 (no img tags in HTML) | N/A |
| Missing ARIA labels | 8 | HIGH |
| Color contrast | 4 | MEDIUM |
| Touch targets | 3 | HIGH |
| Screen reader navigation | 5 | MEDIUM |
| Keyboard navigation | 4 | HIGH |
| Focus indicators | 2 | MEDIUM |
| Motion preferences | 1 | LOW |

## Detailed Findings

### 1. Missing ARIA Labels (HIGH)

| Element | Issue | Fix |
|---------|-------|-----|
| `#tierDown` / `#tierUp` buttons | Content is only `<` and `>` characters - no accessible name | Add `aria-label="Previous tier"` / `aria-label="Next tier"` |
| `#bfSpeedBtn` | Only contains emoji icon - no accessible label | Add `aria-label="Toggle game speed"` |
| `#bfStatsBtn` | Only contains emoji icon | Add `aria-label="View battle statistics"` |
| `.submenu-btn` buttons | No `role="tab"` or `aria-selected` attributes | Add proper ARIA tab pattern |
| `#globalNav` buttons | Navigation icons are emoji-only with tiny labels below | Add `aria-label` matching full function name |
| `#hpFill` progress | HP bar has no ARIA role | Add `role="progressbar" aria-valuenow aria-valuemax` |
| `#rangeRing` | Decorative element missing `aria-hidden="true"` | Add `aria-hidden="true"` |
| `.end-overlay` | Modal has no `role="dialog"` or `aria-modal` | Add `role="dialog" aria-modal="true" aria-labelledby="endTitle"` |

### 2. Color Contrast Issues (MEDIUM)

| Element | Foreground | Background | Ratio | Required |
|---------|-----------|------------|-------|----------|
| `--muted` text (#6677aa) on `--bg` (#0a0a14) | #6677aa | #0a0a14 | ~3.2:1 | 4.5:1 (AA) |
| `--accent-dim` (#0088aa) on `--panel` (#1a1a3a) | #0088aa | #1a1a3a | ~3.8:1 | 4.5:1 (AA) |
| HP text (white) on pink gradient fill | #ffffff | ~#ff6688 | ~3.1:1 | 4.5:1 (AA for small text) |
| Status labels (11px) in battle | var(--muted) | semi-transparent bg | Variable | May fail at small sizes |

**Note:** The mono theme has the best contrast ratios. The neon and royal themes are worst offenders.

### 3. Touch Target Sizes (HIGH)

| Element | Current Size | Required (WCAG 2.5.5) | Fix |
|---------|-------------|----------------------|-----|
| `.tier-arrow` buttons | ~32px apparent | 44x44px minimum | Increase padding or min-width/height |
| `.submenu-btn` | ~40px height, variable width | 44x44px minimum | Increase min-height to 44px |
| `.bf-side-btn` (speed/stats) | Side buttons on battlefield | 44x44px minimum | Verify actual rendered size |

### 4. Screen Reader Navigation (MEDIUM)

| Issue | Details | Fix |
|-------|---------|-----|
| No landmark roles | `#screen-menu`, `#screen-battle` have no `role="main"` | Add `role="main"` to active screen |
| No heading hierarchy | Menu title is `.menu-title` div, not `<h1>` | Use semantic headings (h1 for game title, h2 for sections) |
| No skip navigation | No way to skip past nav to content | Add skip link at top of body |
| Tab panels not connected | `.submenu-btn` tabs not linked to `.submenu-content` | Use `aria-controls` and `aria-labelledby` |
| Dynamic content updates | JS renders content into `#submenuContent` without announcements | Add `aria-live="polite"` to dynamic regions |

### 5. Keyboard Navigation (HIGH)

| Issue | Details | Fix |
|-------|---------|-----|
| No visible focus styles in CSS | `theme.css` sets `-webkit-tap-highlight-color: transparent` and no `:focus-visible` | Add `:focus-visible` outline styles |
| Battle upgrades not keyboard-accessible | Upgrade buttons rendered by JS - may lack tabindex | Ensure all interactive elements are focusable |
| Modal trap missing | End overlay and dev panel don't trap focus | Implement focus trap when overlays are visible |
| Tier selector not keyboard-friendly | Arrow buttons exist but no keyboard shortcut | Support left/right arrow keys on tier display |

### 6. Focus Indicators (MEDIUM)

| Issue | Details | Fix |
|-------|---------|-----|
| Global tap highlight disabled | `* { -webkit-tap-highlight-color: transparent }` removes default | Must provide custom `:focus-visible` alternative |
| No outline on buttons | No CSS rule defines focus outline for `.start-btn`, `.submenu-btn`, etc. | Add `outline: 2px solid var(--accent)` on `:focus-visible` |

### 7. Motion and Animation (LOW)

| Issue | Details | Fix |
|-------|---------|-----|
| No `prefers-reduced-motion` support | CSS transitions exist (hp-fill 0.15s, various hover/active transforms) but no media query to disable them | Add `@media (prefers-reduced-motion: reduce)` to disable all transitions and animations |

## Positive Findings

- `<html lang="en">` is set correctly
- `<meta name="viewport">` includes `user-scalable=no` (intentional for game, but may be an a11y concern for zoom)
- Install banner uses `aria-live="polite"` for dynamic announcements
- Dismiss button on install banner has `aria-label="Dismiss install banner"`
- Semantic `<button>` elements used throughout (not divs with click handlers)
- No images in HTML that need alt text (all sprites loaded via CSS/JS)

## Recommended Priority Fixes

### Phase 1 (Before beta - critical)
1. Add `aria-label` to all icon-only buttons
2. Add `:focus-visible` outline styles
3. Add `role="progressbar"` to HP bar
4. Increase touch targets to 44px minimum
5. Add `role="dialog"` to end overlay

### Phase 2 (Before launch)
6. Implement heading hierarchy with semantic HTML
7. Add `prefers-reduced-motion` media query
8. Fix muted text contrast (bump to #7788bb or similar)
9. Add landmark roles to screens
10. Implement focus trapping in modals

### Phase 3 (Post-launch enhancement)
11. Full keyboard navigation for all game interactions
12. Screen reader announcements for battle events
13. High contrast mode / theme
14. Reduced motion game mode (fewer particles, static backgrounds)
