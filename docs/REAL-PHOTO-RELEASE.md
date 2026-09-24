# Real photography release — 2026-09-21

Owner requested promotion to main, authentic listing images, content enrichment and an additional defect audit. Preserve the approved editorial composition and repaired dock.

## Media
Read the public Airbnb listing 1368953469779774276 and its 76-image photo tour. Visually inspected all 76 thumbnails and selected 33 different photographs: 29 property/detail/family photographs and 4 neighbourhood/destination photographs. The latter are explicitly labelled and not portrayed as apartment views. Original source URLs, retrieval timestamp, original SHA256 and published WebP SHA256 are stored in src/content/stay-media.generated.json. All assets are self-hosted, with responsive variants and small lightbox thumbnails. No generated photographic content, artificial upscaling or geometry changes were added.

The previous public property images and AVIF walkthrough were not faithful to the current listing. They are removed from deployment, not retained as supposed real photography. A labelled, scroll-driven real-photo tour replaces the unverified video. The bounded video renderer remains unused source with a test fixture for future owner-supplied authentic video.

## Fixed / improved
- Correct photo-to-room matching, actual front balcony instead of invented pine-view terrace.
- Six-image opening gallery, optional expansion to 33, eight filters including Family, lightbox with responsive images and thumbnails.
- Kitchen/espresso, desk, accurate bed arrangement, host section and a dedicated family section using real crib, playpen and high-chair photographs based on listing content. No complimentary breakfast/wine claims inferred from staging.
- Neighbourhood seafront, windmills and Mersinidi photographs separated from accommodation features.
- Remove unsupported generic Verified Guest quotations and panoramic sea-view/92 Mbps copy.
- Correct locale HTML language on server, locale-prefixed canonical/hreflang URLs, real Open Graph photography, privacy localization, preview noindex.
- Replace invented domain fallback with current project production URL. Do not output incomplete VacationRental rich-result markup or import third-party scores as first-party aggregate ratings.
- Use compact dated Airbnb/Booking.com trust cards with platform marks and restrained score presentation; booking-platform links remain external and authoritative. Airbnb live listing returned 5.0/27 on review; Booking could not be freshly read due to its public-page challenge. Existing Booking snapshot is dated 2026-09-18, not misrepresented as refreshed today.
- Remove temporary repository-writing/import workflows before main release; one read-only verification workflow covers branch and main.

## Owner follow-up, not guessed
Confirm final custom domain and operator/privacy contact, address formatting/meeting point, current platform check-in times, and safety disclosures. Airbnb reports no carbon monoxide alarm, exterior security cameras and a smoke alarm; older Booking information differs. Do not advertise a CO alarm as installed without confirmation. Availability of cot/high chair must be requested. Obtain an authentic property walkthrough to restore a true video sequence. Photo licensing is based on the owner's express instruction to reuse their listing images; third-party reuse rights were not independently adjudicated.

## Verification
Run CSS-reference/media existence checks, TypeScript, lint, frame logic unit tests, production dependency audit, Next production build, browser tests in Chromium/WebKit, screenshot review, and final production smoke tests. Actual outcomes belong in CI artifacts and the release report; this document alone is not evidence that tests ran.
