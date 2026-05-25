# Google Play Feature Graphic Specification

## Technical Requirements

| Property | Value |
|----------|-------|
| Dimensions | 1024 x 500 pixels |
| Format | PNG or JPG |
| File size | Under 1 MB recommended |
| Color space | sRGB |

## Content Requirements

### Title Treatment
- "CORE SURGE" displayed prominently in the upper or center area
- Font: Bold, wide sans-serif matching game branding
- Color: White (#FFFFFF) with subtle cyan glow or outline
- Size: Large enough to read at thumbnail scale in Play Store browse

### Visual Elements
- Core tower centered or slightly left of center
- Concentric energy rings emanating from the tower base
- Dark sci-fi background (#08101c to #0a1628 gradient)
- Particle effects and energy wisps in cyan (#00e5ff) and orange (#ff6b35)
- Enemy silhouettes approaching from the edges (optional, adds action feel)
- Subtle grid or circuit-line pattern in the background for tech aesthetic

### Layout Zones
- **Center:** Tower with energy effects
- **Top/Center:** Game title "CORE SURGE"
- **Bottom:** Optional tagline "Defend. Upgrade. Dominate." in smaller text
- **Corners:** Keep clear of critical content (Google overlays badges, ratings, and install buttons in corners)

### Safe Zones
- Avoid placing important text or visuals within 100px of any edge
- Bottom-left corner: Google may overlay the app icon
- Bottom-right: Install button may overlap
- Top corners: Rating badge and content rating may appear

## Design Direction

### Reference
Match the in-game home screen aesthetic:
- Tower with concentric energy rings as the focal point
- Dark navy background with depth (gradient, not flat)
- Particle effects creating atmosphere
- Neon accent colors for energy and emphasis

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Background Dark | #08101c | Base background |
| Background Mid | #0a1628 | Gradient lighter area |
| Cyan Energy | #00e5ff | Tower glow, energy effects |
| Orange Accent | #ff6b35 | Secondary energy, enemy indicators |
| Purple Accent | #b44dff | Subtle tertiary effects |
| White | #ffffff | Title text, highlights |

## What to Avoid
- Device frames or screenshots within the graphic
- Excessive text beyond the title and tagline
- Age ratings or award badges (store adds these)
- Logos of other platforms
- Photorealistic elements that clash with the stylized game art
- Bright or light backgrounds that break from the game's dark aesthetic
