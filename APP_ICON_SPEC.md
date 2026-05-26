# App Icon Specification

## Platform Requirements

### Apple App Store
- **Size:** 1024 x 1024 PNG
- **Transparency:** Not allowed
- **Corners:** Do not apply rounding (Apple adds corner rounding automatically)
- **Layers:** Flat, single-layer image
- **Color space:** sRGB or Display P3

### Google Play Store
- **Size:** 512 x 512 PNG
- **Transparency:** Not allowed
- **Format:** 32-bit PNG

### Android Adaptive Icon
- **Full canvas:** 108 x 108 dp
- **Safe zone:** 72 x 72 dp (centered)
- **Foreground layer:** PNG with transparent background, icon content within safe zone
- **Background layer:** Solid color or gradient (#08101c recommended)
- **Important:** All critical visual elements must fit within the 72x72dp safe zone, as different device manufacturers apply different masks (circle, squircle, rounded square)

## Required Export Sizes

| Size | Usage |
|------|-------|
| 1024 x 1024 | Apple App Store listing |
| 512 x 512 | Google Play Store listing |
| 192 x 192 | Android xxxhdpi launcher |
| 180 x 180 | iPhone (iOS 14+) |
| 167 x 167 | iPad Pro |
| 152 x 152 | iPad / iPad mini |
| 120 x 120 | iPhone (older iOS) |
| 87 x 87 | iPhone Spotlight @3x |
| 80 x 80 | iPad Spotlight @2x |
| 76 x 76 | iPad home screen |
| 60 x 60 | iPhone home screen @1x (unused but listed) |
| 58 x 58 | iPhone Settings @2x |
| 40 x 40 | iPhone Spotlight @2x / iPad Spotlight @1x |
| 29 x 29 | iPhone Settings @1x |
| 20 x 20 | iPhone Notification @1x |

## Design Direction

### Concept
- Dark background using the game's primary background color (#08101c or very dark navy)
- Stylized Core tower centered in the icon
- Cyan energy glow emanating from the tower (#00e5ff or similar)
- Tower should be a simplified, bold silhouette recognizable at small sizes (20x20)
- Optional: subtle concentric energy rings around the tower base
- Optional: small orange or purple accent elements for visual pop

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Dark Background | #08101c | Icon background |
| Cyan Glow | #00e5ff | Tower energy, primary accent |
| Orange Accent | #ff6b35 | Secondary accent (subtle) |
| Purple Accent | #b44dff | Tertiary accent (optional) |
| White | #ffffff | Tower highlight edges |

### At-Size Readability
- At 29x29 and smaller: tower must read as a clear geometric shape, no fine details
- At 60x60: tower shape and glow should be distinct
- At 120x120+: full detail with energy effects visible
- Avoid thin lines that disappear at small sizes
- High contrast between tower and background is essential

### What to Avoid
- Text in the icon (does not read at small sizes)
- Excessive detail that becomes noise when scaled down
- Transparency or semi-transparent edges
- Colors that clash with both light and dark device wallpapers
- Photorealistic rendering (stylized/geometric reads better at small sizes)

## Current State
- Only `assets/app/icon.svg` exists (simple SVG placeholder)
- Professional PNG renders needed at all sizes listed above
- Consider hiring an icon designer or using vector-to-PNG pipeline from a refined SVG
