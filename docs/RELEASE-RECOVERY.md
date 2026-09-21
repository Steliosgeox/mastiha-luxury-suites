# Real-photo release recovery

The interrupted release expanded PhotoId to 24 values while two consumers still indexed the original five-caption object. Application consumers now use photoCaption(id, locale), whose content is taken from the photograph catalogue. No any cast, ignored type error or disabled build check is used.

The earlier preparation job passed typecheck, lint, unit tests and build but GitHub rejected its push because the CI token could not update workflow files. The retried job committed application source only. Workflow cleanup is performed separately through the authorized repository connector. No extra permissions were requested for the CI token.

One read-only CI workflow remains. It runs on the editorial branch, pull requests to main, and main. It never rewrites source or lockfiles. Production promotion must follow a successful full run and screenshot inspection of the exact candidate commit.

The 24 self-hosted photographs are the existing reviewed Airbnb imports. Their source URLs, listing ID, capture dimensions, and original/output hashes remain in stay-media.generated.json. They replace the old synthetic property photography. Destination pictures are labelled separately. The previously synthetic video is not advertised as authentic; the page now has a labelled scroll-controlled photo tour.

Additional regression checks cover every PhotoId caption in English, Greek and Turkish, real-media-only rendered imagery, Open Graph imagery, and narrow-screen localized dock containment.

Design review uses the preservation, layout variation, restrained hierarchy and interaction-state principles from Taste Skill (https://github.com/tasteskill/tasteskill). The owner's approved composition, serif/sans pairing and repaired icons take precedence over generic skill defaults; no new framework, generated property image or gratuitous motion is introduced.

Outstanding owner-confirmation fields remain explicit. Booking ratings are dated snapshots, not live data. A cached Airbnb response can contain an older review count; it must not silently replace or be presented as a new live rating. Booking terms remain on the reservation platform. The map uses a property/address search rather than invented GPS coordinates.
