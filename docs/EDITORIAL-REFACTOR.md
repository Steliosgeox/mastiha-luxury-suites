# Editorial branch refactor

Working branch: `design/editorial-mastiha`. Neither `main` nor the saved baseline is changed by this work.

## Root cause
The earlier homepage referenced `interlude`, `interludeImage`, `interludeShade` and `interludeCopy` classes that did not exist. Its Next/Image `fill` poster therefore had no positioned section boundary and covered the first viewport. A successful build and dock-only screenshots were insufficient to detect the missing homepage.

## Implemented changes
- Server-rendered homepage composition, with independent, positioned hero and image sections.
- Static hero never waits for film loading or a preload animation. Responsive cover-image sizing accounts for tall mobile viewports instead of stretching a narrow thumbnail.
- Photographic room spreads and a five-photograph, category-filtered gallery; full-size viewing uses the installed React lightbox with zoom, keyboard/touch support and thumbnails, loaded on demand.
- Repository `hero.webp` and `terrace.webp` are byte-identical. The catalogue includes this photograph once. Film frames are no longer advertised as additional photographs.
- Compact, explicitly dated platform ratings rather than oversized score sections.
- Native booking dialog with explicit Tab cycling, Escape, focus restoration and preserved platform links.
- English/Greek/Turkish copy for rebuilt sections and gallery controls.
- Manifest-driven film loading begins on a positive-area viewport intersection, not edge contact below the hero. Two concurrent requests; bounded decoded frame window; resource disposal; responsive canvas; decode-completion redraw; static reduced-motion/data-saver/network-failure fallback.
- Existing repaired premium dock retained.
- One read-only quality workflow executes unit, browser and dock regression checks. Old lockfile self-editing and duplicate dock workflows are removed; dock tests remain in the full suite.

## Dependency audit remediation
The existing dependency audit reported critical Next.js and high image/CSS dependency advisories. Next.js and its ESLint configuration were updated within major version 15 to 15.5.25; sharp is pinned to 0.35.4 and PostCSS to 8.5.28. npm generated the matching lockfile. Explicit overrides also replace vulnerable nested copies. The temporary branch-guarded resolver was removed after its single run. Production high/critical audit findings now fail CI instead of being silently ignored. Refer to the latest workflow audit artifact for the measured result; version updates alone are not proof of a clean audit.

## Verification
CI executes CSS-module reference checks, declared media existence checks, typecheck, lint, six frame-logic unit tests, the production dependency audit, production build and browser tests in Chromium and WebKit. Browser assertions cover hero hit-testing and containment, actual on-screen sticky video visibility, forward/reverse and delayed frame rendering, reduced-motion and manifest failure, gallery/filter/zoom controls, booking links and focus, narrow screens, localized content, map opt-in, FAQ and existing dock geometry. Results and screenshots are workflow artifacts; a build is not visual approval.

## Remaining source constraints
Only five distinct property photographs and one walkthrough exist in the supplied repository. Additional high-resolution property originals, outdoor views and destination photography require owner assets or documented commercial licenses. No property rooms, views, reviews, contact details or award claims were generated to fill gaps. Existing media is reused as supplied; its original capture/provenance is not independently established. Address formatting, map meeting point, contact phone and booking policies still carry owner-confirmation requirements in property.ts. Existing domain/structured-data configuration needs the owner's final production-domain and property-detail confirmation before launch.
