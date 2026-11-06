# Local fonts

The shared stylesheet uses self-hosted WOFF2 variable fonts:

- `DM-Sans-variable.woff2`: DM Sans, weights 100–1000, including optical sizing.
- `Manrope-variable.woff2`: Manrope, weights 200–800.

The original TTF files remain as sources. WOFF2 files are losslessly compressed
from those same sources with FontTools, preserving glyphs, variable axes, and the
existing design. Each font's SIL Open Font License is included here.

The web root layout preloads both WOFF2 URLs with `as="font"`, the correct MIME
type, and anonymous CORS. Vite resolves the preload and CSS references to the
same asset; production URLs are fingerprinted. No browser request goes to Google
Fonts. `font-display: optional` avoids a late fallback-to-custom-font swap on a
slow first load. Search and catalogue filters use client navigation to keep the
root document and its already-loaded fonts alive.

Vinext currently documents `next/font/local` as a runtime shim, rather than a
build-time extractor. Static CSS font faces and explicit head preloads therefore
provide consistent early discovery in this runtime and in shared UI previews.

Original sources:

- DM Sans: https://github.com/google/fonts/blob/main/ofl/dmsans/DMSans%5Bopsz%2Cwght%5D.ttf
- Manrope: https://github.com/google/fonts/blob/main/ofl/manrope/Manrope%5Bwght%5D.ttf

Reference: https://web.dev/articles/preload-optional-fonts
