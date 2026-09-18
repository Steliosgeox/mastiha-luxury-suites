# Editorial branch refactor

Working branch: `design/editorial-mastiha`. Neither `main` nor the saved baseline is changed by this work.

## Root cause
The earlier homepage referenced `interlude`, `interludeImage`, `interludeShade` and `interludeCopy` classes that did not exist. Its Next/Image `fill` poster therefore had no positioned section boundary and covered the first viewport. A successful build and dock-only screenshots were insufficient to detect the missing homepage.

## Changes
- Server-rendered homepage composition, with independent, positioned hero and image sections.
- Static hero never waits for film loading or a preload animation.
- Photographic room spreads and a five-photograph, category-filtered gallery; full-size viewing uses the installed React lightbox with zoom, keyboard/touch support and thumbnails, loaded only on demand.
- Repository `hero.webp` and `terrace.webp` are byte-identical. The catalogue includes this photograph once. Film frames are no longer advertised as additional photographs.
- Compact, explicitly dated platform ratings, not oversized score sections.
- Native booking dialog with focus trapping, Escape, focus restoration and preserved platform links.
- English/Greek/Turkish copy for the rebuilt sections and gallery controls.
- Manifest-driven film loading starts only when its section enters the viewport. Two concurrent requests; bounded decoded frame window; resource disposal; responsive canvas; decode-completion redraw; static reduced-motion/data-saver/network-failure fallback.
- Existing repaired premium dock retained.
- One read-only Actions quality workflow executes unit, browser and dock regression checks. The previous lockfile self-editing job and duplicate dock workflow were removed; the dock tests remain in the full suite.

## Verification
CI executes CSS-module reference checks, declared media existence checks, typecheck, lint, unit tests, production build and browser tests in Chromium and WebKit. The browser tests assert hero hit-testing (not only DOM visibility), image containment, forward/reverse film rendering, delayed frame rendering, reduced-motion and manifest failure, gallery/filter/zoom controls, booking links and focus, narrow screens, localized content, map opt-in, FAQ and existing dock geometry. Results and screenshots are workflow artifacts; do not equate a build with visual approval.

## Remaining source constraints
Only five distinct property photographs and one walkthrough exist in the repository at this revision. Additional high-resolution property originals, outdoor views and destination photography must come from the owner or documented commercial licenses. No property rooms, views, reviews, contact details or award claims were generated to fill gaps. Existing media is reused as supplied; its original capture/provenance is not independently established. Address formatting, map meeting point, contact phone and booking policies still carry owner-confirmation requirements in property.ts. The production dependency audit is recorded separately rather than hidden or fixed with an unreviewed force upgrade.
