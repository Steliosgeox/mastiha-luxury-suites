# White editorial refinement

Requested scope: predominantly white sections, a modern display face instead of Garamond, the complete `Mastiha Luxury Suites` hero title, and an unchanged dock.

- White content sections, gallery, footer, booking dialog and photo-tour rails. Photograph overlays and the lightbox use neutral charcoal, not a green tint.
- Inter Tight variable display typography. Body/UI Inter stays unchanged; Greek and extended Latin subsets are included. Fonts use Next's self-hosting pipeline. No external font request at runtime and no new dependency.
- One semantic hero heading contains the complete property name with natural line wrapping and no forced break, separator or isolated oversized word. The redundant Luxury Suites subtitle is removed. Header/footer identity is consistent.
- Tour photographs remain uncropped and separate from top/bottom text rails, with white letterboxing instead of dark green backgrounds.
- Gallery filters and captions use fully opaque neutral ink; small link target sizes and narrow-header spacing were reviewed.
- The locale provider no longer serializes unused legacy template messages with inaccurate property claims. Current localized copy/catalogue remain the source used by active components.
- Source and asset hashes guard the unmodified PremiumDock. Existing image, gallery, booking, tour and locale checks remain; new checks cover full branding at five widths, typography, white surfaces, contrast, rail containment and privacy.

Only test reports and the deployment status establish verification. This note does not assert tests passed.
