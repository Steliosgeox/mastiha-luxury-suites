from pathlib import Path
import json,re,shutil

def edit(path,fn):
 p=Path(path); original=p.read_text(); changed=fn(original)
 if changed==original: raise RuntimeError('No expected changes: '+path)
 p.write_text(changed)

def homepage(s):
 s=s.replace('import { stayPhoto, type PhotoId }','import { stayPhoto, photoCaption, type PhotoId }')
 s=s.replace('import { StayFilm }','import { listingCopy } from "@/content/listing-copy";\nimport { StayFilm }')
 s=s.replace('const c = getStayCopy(lang);','const c = getStayCopy(lang); const l = listingCopy(lang);')
 s=s.replace('`${c.captions[id]} · Mastiha Luxury Suites`','`${photoCaption(id, lang)} · Mastiha Luxury Suites`')
 s=s.replace('src={stayPhoto("terrace").src} alt={caption("terrace")} fill priority','src={stayPhoto("living").src} alt={caption("living")} fill priority',1)
 s=s.replace('sizes="(max-aspect-ratio: 16/9) 178vh, 100vw"','sizes="(max-aspect-ratio: 3/2) 150vh, 100vw"')
 s=s.replace('{c.bedroomBody}','{l.bedroomBody}')
 s=s.replace('src={stayPhoto("terrace").src} alt={caption("terrace")} fill sizes="(max-width: 760px) 130vh, 100vw"','src={stayPhoto("balcony").src} alt={caption("balcony")} fill sizes="(max-width: 760px) 130vh, 100vw"')
 s=s.replace('<ImmersiveGallery locale={lang} />','''<section className={s.kitchenStory} aria-labelledby="kitchen-title"><figure><PhotoButton id="kitchen"><PropertyPhoto id="kitchen" alt={caption("kitchen")} className={s.landscape}/></PhotoButton><figcaption className={s.caption}>{photoCaption("kitchen",lang)}</figcaption></figure><div data-reveal><p className={s.eyebrow}>{l.kitchenEyebrow}</p><h2 id="kitchen-title" className={s.heading}>{l.kitchenTitle}</h2><p className={s.body}>{l.kitchenBody}</p><PhotoButton id="espresso"><PropertyPhoto id="espresso" alt={caption("espresso")} className={s.coffeePhoto} sizes="(max-width:760px) 90vw, 28vw"/></PhotoButton></div></section>
      <ImmersiveGallery locale={lang} />''')
 old='<figure className={s.locationPhoto}><PhotoButton id="terrace"><PropertyPhoto id="terrace" alt={caption("terrace")} className={s.portrait}'
 new='<figure className={s.locationPhoto}><PhotoButton id="coast"><PropertyPhoto id="coast" alt={caption("coast")} className={s.portrait}'
 if old not in s: raise RuntimeError('Location match changed')
 s=s.replace(old,new).replace('<figcaption className={s.caption}>{c.place}</figcaption>','<figcaption className={s.caption}>{photoCaption("coast",lang)}</figcaption>')
 s=s.replace('<section id="information"','''<section className={s.neighbourhood} aria-labelledby="neighbourhood-title"><div className={s.galleryHeader}><h2 id="neighbourhood-title" className={s.heading}>{l.neighbourhoodTitle}</h2><p className={s.body}>{l.neighbourhoodBody}</p></div><div className={s.destinationGrid}>{(["sunrise","windmills","beach"] as const).map(id=><figure key={id}><PhotoButton id={id}><PropertyPhoto id={id} alt={caption(id)} className={s.destinationPhoto} sizes="(max-width:760px) 90vw, 30vw"/></PhotoButton><figcaption className={s.caption}>{photoCaption(id,lang)}</figcaption></figure>)}</div></section>
      <section className={s.host} aria-labelledby="host-title"><div><p className={s.eyebrow}>{l.hostEyebrow}</p><h2 id="host-title" className={s.subheading}>{l.hostTitle}</h2><p className={s.body}>{l.hostBody}</p><a href={property.bookingLinks.airbnb} target="_blank" rel="noopener noreferrer" className={s.outlineButton}>{l.hostAction} ↗</a></div><PhotoButton id="arrival"><PropertyPhoto id="arrival" alt={caption("arrival")} className={s.landscape} sizes="(max-width:760px) 90vw, 35vw"/></PhotoButton></section>
      <section id="information"''')
 s=s.replace('c.faqs.map','[...c.faqs,...l.faqs].map')
 return s
edit('src/components/redesign/MastihaOdisej.tsx',homepage)
edit('src/components/redesign/StayExperience.tsx',lambda s:s.replace('stayPhotos, type PhotoId','stayPhotos, photoCaption, type PhotoId').replace('c.captions[id]','photoCaption(id, locale)').replace('<PremiumDock onNavigate','<PremiumDock locale={locale} onNavigate'))
edit('src/i18n/routing.ts',lambda s:s.replace('localePrefix: "as-needed"','localePrefix: "always"'))

# Give the unchanged dock proper translated accessible names without widening it.
edit('src/components/redesign/PremiumDock.tsx',lambda s:s.replace('import styles from','import { getStayCopy, type StayLocale } from "@/content/stay-copy";\nimport styles from').replace('  onNavigate,\n  onBook,','  onNavigate,\n  onBook,\n  locale = "en",').replace('  onBook: () => void;','  onBook: () => void;\n  locale?: StayLocale;').replace('  return (\n    <nav','  const c = getStayCopy(locale);\n  const names = {home:c.home,suite:c.suite,gallery:c.gallery,location:c.location};\n  return (\n    <nav').replace('links.map(({ name, label, target })','links.map(({ name, target })').replace('aria-label={label}','aria-label={names[name]}').replace('title={label}','title={names[name]}').replace('aria-label="Book your stay"','aria-label={c.bookShort}').replace('>Book</span>','>{locale === "el" ? "Κράτηση" : locale === "tr" ? "Ayırt" : "Book"}</span>'))
edit('src/components/redesign/PremiumDock.module.css',lambda s:s+'\n@media(max-width:480px){.book .label{font-size:11px}.book{gap:4px;padding-inline:7px}}\n')

css='''
/* Real-photo release: photographic rhythm, no invented scenery. */
.heroImage { object-position:50% 48%; }
.tourLayer { opacity:0; transition:opacity 400ms ease; background:#233429; }
.tourLayer[data-active=true] { opacity:1; z-index:1; }
.tourImage { object-fit:contain; }
.kitchenStory { display:grid; grid-template-columns:6fr 4fr; gap:7vw; align-items:center; padding:96px 7vw; }
.coffeePhoto { aspect-ratio:1.7; max-width:360px; margin-top:28px; }
.neighbourhood { padding:16px 7vw 90px; }
.neighbourhoodNote { max-width:70ch; font-size:13px; line-height:1.8; color:#d4d9ce; margin-bottom:24px; }
.destinationGrid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:24px; margin-top:30px; align-items:start; }
.destinationGrid>figure:nth-child(2) { margin-top:70px; }
.destinationPhoto { aspect-ratio:3/4; }
.destinationGrid>figure:nth-child(2) .destinationPhoto { aspect-ratio:1.3; }
.host { display:grid; grid-template-columns:1.2fr 1fr; gap:8vw; align-items:center; padding:64px 7vw; background:#ece7dc; margin-bottom:84px; }
.galleryFooter { gap:16px; flex-wrap:wrap; }
.filters { gap:16px; }
.filters button { min-height:44px; }
.galleryGrid[data-filtered=true] .galleryItem:last-child { grid-column:span 6; }
.detailPhoto .portrait { aspect-ratio:3/4; }
@media(max-width:760px){
 .kitchenStory,.host { grid-template-columns:1fr; gap:36px; padding:64px 20px; }
 .neighbourhood { padding:20px 20px 64px; }
 .destinationGrid { grid-template-columns:1fr; gap:36px; }
 .destinationGrid>figure:nth-child(2){margin-top:0;}
 .destinationPhoto { max-height:480px; }
 .galleryGrid[data-filtered=true] .galleryItem:last-child { grid-column:1/-1; }
 .galleryTools{align-items:flex-start;flex-direction:column;}
 .filters{gap:6px 18px;}
 .tourImage { object-fit:contain; }
 .filmCaption{right:20px;}
 .filmCaption h2{font-size:28px;line-height:1.15;}
 .sceneImage{object-position:58% 50%;}
}
@media(prefers-reduced-motion:reduce){.tourLayer{transition:none;}}
'''
edit('src/components/redesign/MastihaOdisej.module.css',lambda s:s+css)

# Remove invented descriptive details. Preserve owner-confirmation flags and booking links.
def property_fix(s):
 s=s.replace('"Panoramic Mediterranean horizon"','"See the real photographs; neighbourhood views are labelled separately"')
 s=s.replace('title: "Aegean Sea Views"','title: "Near the Aegean shoreline"')
 s=s.replace('"Measured around 92 Mbps"','"Airbnb lists an 85 Mbps test; actual speeds vary"')
 s=s.replace('"Woven outdoor lounge seating overlooking pines"','"Front balcony with table and chairs"')
 s=s.replace('"Private Terrace & Patio"','"Front Balcony"')
 return s
edit('src/content/property.ts',property_fix)
edit('src/content/reviews.ts',lambda s:re.sub(r'  verifiedQuotes: \[[\s\S]*?\n  \],\n};', '  verifiedQuotes: [],\n};',s))

# Keep the tested video renderer as unmounted source for a future authentic video;
# its unit fixture is no longer a publicly deployed fabricated sequence.
fixtures=Path('tests/fixtures');fixtures.mkdir(exist_ok=True)
shutil.copyfile('public/sequence/sequence-manifest.json',fixtures/'sequence-manifest.json')
edit('tests/frame-player.test.mjs',lambda s:s.replace('public/sequence/sequence-manifest.json','tests/fixtures/sequence-manifest.json'))
shutil.rmtree('public/sequence')
for name in ['hero.webp','terrace.webp','living-room.webp','master-bedroom.webp','second-bedroom.webp','bathroom.webp']:
 Path('public/photography',name).unlink(missing_ok=True)
Path('Real_estate_video_tour_1080p_20260918151312.mp4').unlink(missing_ok=True)

# Replace only obsolete video-specific browser tests; retain hero, booking, gallery,
# image containment, localization, no-JS and dock regression checks.
def tests_fix(s):
 start=s.index("test('film is lazy,");end=s.index("test('gallery filters,",start)
 s=s[:start]+s[end:]
 s=s.replace('toHaveCount(2);\n await gallery.getByRole','toHaveCount(5);\n await gallery.getByRole')
 s=s.replace("toHaveCount(5);\n const first", "toHaveCount(6);\n const first")
 s=s.replace("'1 / 5'","'1 / 24'").replace("'2 / 5'","'2 / 24'")
 s=s.replace('import { test, expect, type Page }','import { test, expect }')
 s=re.sub(r'async function scrollFilm\([\s\S]*?\n}\n','',s,count=1)
 return s
edit('tests/e2e.spec.ts',tests_fix)
Path('tests/film-visibility.spec.ts').unlink()

# CSS reference checking remains in place; asset checks now validate the true catalogue.
p=Path('scripts/check-ui.mjs');s=p.read_text();s=s[:s.index("for (const file of ['hero.webp'")]+'''
const photos=JSON.parse(fs.readFileSync('src/content/stay-media.generated.json','utf8'));
const hashes=new Set();
for(const photo of photos){
 if(!photo.source?.originalSha256||photo.source.listingId!=='1368953469779774276')errors.push(`Unverified source: ${photo.id}`);
 if(hashes.has(photo.source.webpSha256))errors.push(`Duplicate photograph: ${photo.id}`);
 hashes.add(photo.source.webpSha256);
 for(const url of [photo.src,photo.thumbnail,...photo.srcSet.map(i=>i.src)])if(!url.startsWith('/photography/airbnb/')||!fs.existsSync('public'+url))errors.push(`Missing true photo: ${url}`);
}
if(errors.length){console.error(errors.join('\\n'));process.exit(1);}
console.log(`CSS references and all variants of ${photos.length} real listing photographs passed.`);
''';p.write_text(s)

# Root 404 already owns html/body because the localized layout is now the root.
# Publish one read-only CI workflow for branch and main; remove one-time writers.
p=Path('.github/workflows/editorial-quality.yml');s=p.read_text().replace('branches: [design/editorial-mastiha]','branches: [design/editorial-mastiha, main]');p.write_text(s)
for name in ['listing-media-audit.yml','import-reviewed-photos.yml','prepare-real-photo-release.yml']:
 Path('.github/workflows',name).unlink(missing_ok=True)
Path('scripts/finalize-listing-release.py').unlink()
print('Applied real-photo release, removed public synthetic media, preserved approved composition and dock.')
