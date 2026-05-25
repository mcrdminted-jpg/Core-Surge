# Accessibility Statement

**Core Surge: Endless Tower Defense**

**Last Updated:** May 24, 2026

We are committed to making Core Surge accessible to all players. This document describes our current accessibility support and planned improvements.

---

## 1. Current Accessibility Support

### 1.1 Text Scaling

Responsive font sizes using `clamp()` in CSS allow text to scale with viewport size. Players on larger or smaller devices see appropriately sized text without layout breakage.

### 1.2 Color and Contrast

The default theme uses high-contrast text on dark backgrounds (white on navy). However, an accessibility audit identified four color combinations that fall below the WCAG 2.1 AA 4.5:1 contrast ratio requirement:

- Muted text (`#6677aa`) on background (`#0a0a14`) at approximately 3.2:1
- Accent-dim (`#0088aa`) on panel (`#1a1a3a`) at approximately 3.8:1
- HP text on pink gradient fill at approximately 3.1:1
- Small status labels with variable contrast on semi-transparent backgrounds

The mono theme has the best contrast ratios. The neon and royal themes are the worst offenders.

### 1.3 Touch Targets

Most buttons are adequately sized, but three element types are below the 44px minimum recommended by WCAG 2.5.5:

- Tier arrow buttons (approximately 32px)
- Submenu tab buttons (approximately 40px height)
- Battlefield side buttons (speed/stats, size varies)

These are documented in `ACCESSIBILITY_AUDIT.md` with specific fixes.

### 1.4 Screen Reader Support

Limited. Most interactive elements lack ARIA labels. Specific gaps include:

- 8 elements missing `aria-label` attributes (icon-only buttons, emoji-only controls)
- No landmark roles on screen containers
- No heading hierarchy (div-based layout instead of semantic headings)
- No `aria-live` regions for dynamic content updates
- Tab panels not connected with `aria-controls`/`aria-labelledby`

The install banner does correctly use `aria-live="polite"` and has a proper `aria-label` on its dismiss button. Semantic `<button>` elements are used throughout rather than styled divs.

### 1.5 Keyboard Navigation

No keyboard navigation support currently. The CSS globally disables tap highlight (`-webkit-tap-highlight-color: transparent`) and no `:focus-visible` styles are defined. Focus trapping is not implemented for modals or overlays.

### 1.6 Motion and Animation

No `prefers-reduced-motion` media query support. CSS transitions exist for HP bar fill, hover transforms, and other UI animations. Players who are sensitive to motion cannot currently disable these.

### 1.7 Audio

The game has no critical audio cues. All gameplay is visual-only, so no audio accessibility accommodations are required at this time.

---

## 2. Planned Improvements

The following phases are queued for implementation by Claude Code:

### Phase 1: ARIA Labels

Add `aria-label` attributes to all buttons, tabs, and interactive elements that currently lack accessible names. This includes tier arrows, speed toggle, stats button, global navigation icons, and the HP progress bar (`role="progressbar"`). Add `role="dialog"` and `aria-modal="true"` to the end-game overlay.

### Phase 2: Touch Target Sizing

Increase all interactive touch targets to the 44px minimum. This affects tier arrow buttons, submenu tab buttons, and battlefield side buttons. Increase padding or min-width/min-height values without altering the visual design.

### Phase 3: Keyboard Navigation

Add keyboard navigation support with proper tab order across all interactive elements. Ensure `Enter` and `Space` activate buttons. Support arrow keys for tier selection. Make upgrade buttons in battle focusable.

### Phase 4: Focus-Visible Styles

Add `:focus-visible` outline styles to all interactive elements (buttons, links, inputs). Use `outline: 2px solid var(--accent)` or similar visible indicator. This replaces the removed default tap highlight. Implement focus trapping for modal overlays (end screen, auth modal, dev panel).

### Phase 5: Reduced Motion

Respect `prefers-reduced-motion` by adding a `@media (prefers-reduced-motion: reduce)` query that disables all CSS transitions, transforms, and animations. In the game loop, reduce or disable particle effects and animated backgrounds.

### Phase 6: High Contrast Mode

Add a high contrast mode toggle in the Settings menu. When enabled, bump muted text color from `#6677aa` to `#7788bb` or higher, increase all contrast ratios to meet WCAG AA 4.5:1 minimum, and ensure all UI elements are clearly distinguishable.

### Phase 7: Colorblind Mode

Add a colorblind-friendly mode that provides alternative visual indicators for card rarity beyond color alone. Use patterns, icons, or labels (e.g., "S" / "P" / "A" badges) so that Standard, Prime, and Apex cards are distinguishable without relying on color.

---

## 3. Standards

We are targeting **WCAG 2.1 Level AA** compliance. Key criteria include:

- 1.1.1 Non-text Content (alt text, ARIA labels)
- 1.3.1 Info and Relationships (semantic structure)
- 1.4.3 Contrast Minimum (4.5:1 for normal text)
- 2.1.1 Keyboard (all functionality keyboard-accessible)
- 2.3.1 Three Flashes or Below Threshold
- 2.4.3 Focus Order
- 2.4.7 Focus Visible
- 2.5.5 Target Size (44px minimum)
- 4.1.2 Name, Role, Value (ARIA attributes)

---

## 4. Known Limitations

- `user-scalable=no` is set in the viewport meta tag to prevent unintentional zoom during gameplay. This is standard for mobile games but may limit zoom accessibility for some users.
- Battle gameplay is inherently visual and real-time. Full screen reader narration of battle events is a long-term goal but not feasible for initial launch.

---

## 5. Contact

If you encounter accessibility barriers or have suggestions for improvement, please contact us at:

**Email:** accessibility@coresurge.game

We take accessibility feedback seriously and will prioritize fixes based on impact.

---

*This Accessibility Statement was last updated on May 24, 2026.*
