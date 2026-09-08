# {{DISPLAY_NAME}}: Visual Design

> This document is the **source of truth** for the visual system. If product code and design disagree, this document wins.

## Design tokens

The core design tokens live in `src/constants/theme.ts`. They are the single source for colors, spacing, radii, and typography — never hardcode values in screen or component files.

### Color

| Token | Value |
| --- | --- |
| canvas | `#FFFFFF` |
| canvasSoft | `#FAFAFA` |
| surfaceMuted | `#F4F4F4` |
| ink | `#1C1C1C` |
| inkSecondary | `#323232` |
| inkMuted | `rgba(28, 28, 28, 0.68)` |
| inkInverse | `#FFFFFF` |
| line | `rgba(28, 28, 28, 0.10)` |
| lineStrong | `rgba(28, 28, 28, 0.18)` |
| primary | `#98E2F4` |
| primarySoft | `#E3F8FC` |
| happy | `#FDB0E3` |
| happySoft | `#FFE7F6` |
| calm | `#83F5CC` |
| calmSoft | `#DDFFF1` |
| darkCanvas | `#1C1C1C` |
| darkSurface | `#323232` |
| danger | `#FF6B6B` |
| dangerSoft | `#FFE8E8` |

### Spacing

- page: `20`
- section: `28`
- item: `14`
- compact: `8`

### Radii

- small: `10`
- medium: `16`
- large: `24`
- panel: `30`
- pill: `999`

### Typography

All typography references the `onboardingFonts` token map in `theme.ts`. Customize the underlying font family for the product. The defaults map Regular and Bold weights across display and body variants.

## Usage rules

- Reference tokens via `colors`, `spacing`, `radii`, and `onboardingFonts` imports — never inline literal values.
- Use `as const` on token objects so TypeScript narrows the exact allowed values.
- Keep the light and dark canvas values nearby so theme switches stay one-line edits.