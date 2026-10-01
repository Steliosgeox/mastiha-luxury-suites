# Search, answer engines and AI assistants

How the site is built to be found on Google and Bing and quoted by ChatGPT, Claude, Perplexity, Gemini and Copilot, and the few things only the owner can do.

## What the site does on its own

| Area | What | Where |
| --- | --- | --- |
| Titles and descriptions | Brand first, then the island: “Mastiha Luxury Suites, Chios \| Seaside apartment in Vrontados”. Search descriptions quote the Airbnb and Booking.com scores from `src/content/reviews.ts` (≤160 characters). | `src/lib/site.ts` |
| Languages | Greek, English and Turkish pages with `hreflang` alternates and `x-default` → English, in the HTML and in the sitemap. | `src/lib/site.ts`, `src/app/sitemap.ts` |
| Structured data | Home page: `VacationRental` (beds, amenities, occupancy, ΑΜΑ, address, Vrontados → Chios linked to Wikipedia, Airbnb/Booking.com as `sameAs`, `ReserveAction`) and an `FAQPage` identical to the visible FAQ. Guides: `Article` + `BreadcrumbList`, with every place named linked to Wikipedia. | `src/lib/seo.ts` |
| Not marked up, on purpose | Review stars (Google forbids marking up scores from other sites), coordinates and the street address (not confirmed). | |
| FAQ | 13 answers in three languages, written from the site’s own facts. One helper feeds the page, the structured data, the chat assistant and llms.txt, so they never disagree. | `src/content/faq.ts` |
| Guides | `/[locale]/chios`, `/[locale]/vrontados`, `/[locale]/mastiha`: the island, the neighbourhood and the product the apartment is named after. Facts checked against Wikipedia; no prices, hours or travel times that age. Linked from the home page footer and the Vrontados section. | `src/content/guides.ts` |
| AI assistants | `/llms.txt`: the facts, FAQ and guide links in plain text, generated from the content files. `robots.txt` names the AI search crawlers explicitly. | `src/lib/llms.ts`, `src/app/robots.ts` |
| Images | Every photograph in the sitemap; localised alt text and captions; 1200×630 JPEG link previews. | `src/app/sitemap.ts`, `public/og/` |
| Speed | Pre-encoded photo sizes, the lightbox and chat load only when used, and the page’s motion is set up in small slices after first paint. Lighthouse: SEO 100, accessibility 100, best practices 100. | |
| Fresh index | IndexNow pings Bing (which feeds ChatGPT search and Copilot), Yandex, Seznam and Naver after every production deploy. | `scripts/indexnow.mjs`, `.github/workflows/indexnow.yml` |

Tests in `tests/seo.spec.ts` keep all of the above true: titles, alternates, structured data matching the page, guides in three languages, sitemap, robots, llms.txt and the IndexNow key.

## Changing things

- **New facts** (an amenity, a distance): change `src/content/property.ts`, `stay-copy.ts` or `neighbourhood.ts`. The page, the FAQ, the structured data, llms.txt and the assistant all follow.
- **New review scores**: `src/content/reviews.ts` (with the date you checked them).
- **New guide**: add it to `guideIds` and `guides` in `src/content/guides.ts` (all three languages), then to the IndexNow list in `scripts/indexnow.mjs`.
- **After a content change**: bump `CONTENT_UPDATED` in `src/app/sitemap.ts` (or `GUIDES_UPDATED` for guides).

## What only the owner can do (in order of impact)

1. **Google Business Profile** (the listing behind the Google Maps link). This is what decides the map results for “apartments Chios”. In the profile: website → the site’s address; category “Holiday apartment rental”; add all the photos; description in Greek and English (the first paragraph of the home page works); answer the Q&A with the FAQ answers.
2. **Google reviews.** In `/admin` → Settings → *Google reviews* there is the direct review link and ready-made thank-you messages in Greek and English. Send it to every guest after check-out (Google forbids asking only happy guests or offering anything in return).
3. **Your own domain.** A `.vercel.app` address is a weak brand signal. Available at about $11/year through Vercel: `mastiha-luxury-suites.com`, `mastihasuites.com`, `mastihachios.com` (`mastihaluxurysuites.com` is taken; `.gr` needs a Greek registrar such as papaki.gr). After buying, add it to the Vercel project, set `NEXT_PUBLIC_SITE_URL` to it, and redirect the `.vercel.app` address to it.
4. **Google Search Console and Bing Webmaster Tools.** Add the site, choose the “HTML tag” method, and put the code in Vercel as `GOOGLE_SITE_VERIFICATION` (and `BING_SITE_VERIFICATION`), then redeploy. Submit `/sitemap.xml`. Bing can import the site straight from Search Console.
5. **Links from elsewhere.** Put the website address on the Instagram and Facebook profiles (and set `MASTIHA_INSTAGRAM_URL` / `MASTIHA_FACEBOOK_URL` in Vercel so they appear on the site and in the structured data), and ask local partners (car hire, tavernas, the municipality’s tourism pages) to link to it.
