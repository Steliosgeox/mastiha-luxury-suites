// Rebuilds src/content/stay-media.generated.json from the owner's own listings.
//
//   node scripts/import-listing-photos.mjs
//
// Sources are restricted to Mastiha Luxury Suites: Airbnb listing 1368953469779774276 and
// the Booking.com page /hotel/gr/mastiha-luxury-suites. Any other image host or listing
// aborts the import. Booking.com blocks automated page reads, so its photographs are
// carried over from the existing catalogue (fetched earlier from cf.bstatic.com with their
// gallery tokens) instead of being re-scraped.
//
// Edits are limited to removing the phone date stamp burned into the bottom-right corner
// of some photographs (a crop of the bottom strip). No upscaling, retouching or generated
// content.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const LISTING_ID = '1368953469779774276';
const LISTING_PAGE = `https://www.airbnb.co.in/rooms/${LISTING_ID}`;
const OWN_AIRBNB_IMAGE = /^\/im\/pictures\/(?:hosting|miso)\/Hosting-(?:1368953469779774276|U3RheVN1cHBseUxpc3Rpbmc6MTM2ODk1MzQ2OTc3OTc3NDI3Ng==)\/original\/[\w-]+\.(?:jpe?g|png|webp)$/i;
const MANIFEST = 'src/content/stay-media.generated.json';
const OUT = 'public/photography/airbnb';

// [tour number, id, category, stamped, en, el, tr]. The tour number is the position in the
// listing's public photo tour on the retrieval date; the image UUID is recorded in `source`.
const selection = [
  [21, 'living', 'living', false, 'Living and dining room', 'Σαλόνι και τραπεζαρία', 'Oturma odası ve yemek alanı'],
  [1, 'lounge', 'living', false, 'The corner sofa', 'Ο γωνιακός καναπές', 'Köşe kanepe'],
  [5, 'sofa-bed', 'living', false, 'The sofa opens into a bed', 'Ο καναπές ανοίγει σε κρεβάτι', 'Kanepe yatağa dönüşür'],
  [30, 'desk', 'living', true, 'Desk for work', 'Γραφείο για δουλειά', 'Çalışma masası'],
  [6, 'kitchen', 'kitchen', false, 'The kitchen', 'Η κουζίνα', 'Mutfak'],
  [14, 'kitchen-wide', 'kitchen', false, 'Kitchen with oven and fridge', 'Κουζίνα με φούρνο και ψυγείο', 'Fırınlı ve buzdolaplı mutfak'],
  [17, 'cookware', 'kitchen', false, 'Hob and cookware', 'Εστίες και σκεύη', 'Ocak ve tencereler'],
  [18, 'appliances', 'kitchen', false, 'Kettle, coffee maker and sandwich toaster', 'Βραστήρας, ηλεκτρικό μπρίκι και τοστιέρα', 'Su ısıtıcı, kahve makinesi ve tost makinesi'],
  [32, 'master', 'bedrooms', false, 'Main bedroom · king-size bed', 'Κύριο υπνοδωμάτιο · διπλό κρεβάτι king size', 'Ana yatak odası · king yatak'],
  [35, 'master-wide', 'bedrooms', false, 'The main bedroom', 'Το κύριο υπνοδωμάτιο', 'Ana yatak odası'],
  [43, 'vanity', 'bedrooms', true, 'Dressing table with lit mirror', 'Μπουντουάρ με φωτιζόμενο καθρέφτη', 'Işıklı aynalı makyaj masası'],
  [46, 'second', 'bedrooms', false, 'Second bedroom · single bed', 'Δεύτερο υπνοδωμάτιο · μονό κρεβάτι', 'İkinci yatak odası · tek kişilik yatak'],
  [51, 'second-wide', 'bedrooms', false, 'Second bedroom with wardrobe', 'Δεύτερο υπνοδωμάτιο με ντουλάπα', 'Gardıroplu ikinci yatak odası'],
  [55, 'bathroom-wide', 'bathroom', false, 'Bathroom with glass shower', 'Μπάνιο με ντουζιέρα', 'Duşakabinli banyo'],
  [57, 'shower', 'bathroom', false, 'The shower', 'Η ντουζιέρα', 'Duş'],
  [54, 'basin', 'bathroom', false, 'Washbasin', 'Νιπτήρας', 'Lavabo'],
  [45, 'hairdryer', 'bathroom', false, 'Hair dryer and straightener', 'Πιστολάκι και πρέσα μαλλιών', 'Saç kurutma makinesi ve düzleştirici'],
  [68, 'laundry', 'bathroom', false, 'Washing machine', 'Πλυντήριο ρούχων', 'Çamaşır makinesi'],
  [28, 'kids-corner', 'family', true, 'Kids’ table and chairs', 'Παιδικό τραπεζάκι με καρεκλάκια', 'Çocuk masası ve sandalyeleri'],
  [29, 'toys', 'family', true, 'Puzzles and toys', 'Παζλ και παιχνίδια', 'Yapbozlar ve oyuncaklar'],
  [41, 'playpen', 'family', true, 'Travel cot in the main bedroom', 'Παρκοκρέβατο στο κύριο υπνοδωμάτιο', 'Ana yatak odasında park yatak'],
  [44, 'cot', 'family', false, 'Cot with mattress', 'Κούνια μωρού με στρώμα', 'Yataklı bebek beşiği'],
  [31, 'high-chair', 'family', false, 'Booster seat for mealtimes', 'Καρεκλάκι φαγητού', 'Mama sandalyesi'],
  [58, 'terrace', 'outdoors', true, 'The front balcony', 'Το μπαλκόνι', 'Ön balkon'],
  [61, 'balcony-wide', 'outdoors', true, 'Table and chairs on the balcony', 'Τραπέζι και καρέκλες στο μπαλκόνι', 'Balkonda masa ve sandalyeler'],
  [64, 'balcony', 'outdoors', true, 'The balcony from the street', 'Το μπαλκόνι από τον δρόμο', 'Sokaktan balkon'],
  [66, 'arrival', 'outdoors', true, 'Our sign at the entrance', 'Η πινακίδα μας στην είσοδο', 'Girişteki tabelamız'],
  [76, 'keys', 'outdoors', false, 'Our keyring, with the windmills behind', 'Το μπρελόκ μας, με τους μύλους πίσω', 'Anahtarlığımız, arkada yel değirmenleri'],
  [71, 'coast', 'neighbourhood', false, 'The sea in our neighbourhood', 'Η θάλασσα στη γειτονιά μας', 'Mahallemizde deniz'],
  [69, 'sunrise', 'neighbourhood', false, 'Sunrise in Vrontados', 'Ανατολή στον Βροντάδο', 'Vrontados’ta gün doğumu'],
  [70, 'windmills', 'neighbourhood', false, 'The windmills, 60 m from the house', 'Οι μύλοι, 60 μέτρα από το σπίτι', 'Yel değirmenleri, evden 60 m'],
  [75, 'sailor', 'neighbourhood', false, 'The Unknown Sailor statue', 'Ο Άγνωστος Ναύτης', 'Meçhul Denizci heykeli'],
  [74, 'rocket-war', 'neighbourhood', false, 'Easter rocket war in Vrontados', 'Ο ρουκετοπόλεμος το Πάσχα', 'Vrontados’ta Paskalya roket savaşı'],
  [73, 'beach', 'neighbourhood', true, 'Mersinidi beach', 'Παραλία Μερσινίδι', 'Mersinidi plajı'],
];
// Kept from the Booking.com gallery: the only Booking photograph that is not also in the
// Airbnb tour at a higher resolution.
const bookingKeep = { crib: ['Baby cot', 'Κούνια μωρού', 'Bebek yatağı'] };

const sha = bytes => createHash('sha256').update(bytes).digest('hex');

async function fetchTour() {
  const response = await fetch(LISTING_PAGE, { signal: AbortSignal.timeout(30_000), headers: { 'Accept-Language': 'en-GB' } });
  if (!response.ok) throw new Error(`Listing returned ${response.status}`);
  const html = await response.text();
  if (!html.includes('"name":"Mastiha Luxury Suites"')) throw new Error('This is not the Mastiha Luxury Suites listing');
  const script = html.match(/<script[^>]*id="data-deferred-state-0"[^>]*>([\s\S]*?)<\/script>/);
  if (!script) throw new Error('Photo tour data not found');
  let tour;
  (function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (value.__typename === 'PhotoTourModalSection') tour = value;
    for (const child of Object.values(value)) visit(child);
  })(JSON.parse(script[1]));
  if (!tour?.mediaItems?.length) throw new Error('Listing has no photographs');
  return tour.mediaItems.map(item => {
    const url = new URL(item.baseUrl);
    if (url.hostname !== 'a0.muscache.com' || !OWN_AIRBNB_IMAGE.test(url.pathname)) throw new Error(`Refusing image outside our listing: ${item.baseUrl}`);
    return { url, label: item.accessibilityLabel ?? '' };
  });
}

// The phone renders its date stamp at a fixed size relative to the frame: measured on
// every stamped photograph in the tour, it sits in the bottom 4.8% of portrait shots and
// the bottom 7.4% of 16:9 landscape shots.
function stampFreeHeight(width, height) {
  return Math.floor(height * (width < height ? 1 - .048 : 1 - .074));
}

const tour = await fetchTour();
const previous = JSON.parse(await readFile(MANIFEST, 'utf8'));
await mkdir(OUT, { recursive: true });
const retrievedAt = new Date().toISOString();
const photos = [];

for (const [n, id, category, stamped, en, el, tr] of selection) {
  const item = tour[n - 1];
  if (!item) throw new Error(`Photo ${n} missing from the listing tour`);
  const url = new URL(item.url); url.searchParams.set('im_w', '2560');
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000), redirect: 'error' });
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`Download failed for ${id}`);
  const original = Buffer.from(await response.arrayBuffer());
  let image = await sharp(original).rotate().toBuffer();
  if (stamped) {
    const meta = await sharp(image).metadata();
    image = await sharp(image).extract({ left: 0, top: 0, width: meta.width, height: stampFreeHeight(meta.width, meta.height) }).toBuffer();
  }
  const longest = id === 'living' ? 2560 : 1920; // the hero is shown full-bleed
  const master = await sharp(image).resize({ width: longest, height: longest, fit: 'inside', withoutEnlargement: true }).webp({ quality: 86, effort: 6 }).toBuffer({ resolveWithObject: true });
  await writeFile(`${OUT}/${id}.webp`, master.data);
  const srcSet = [];
  for (const width of [640, 1280]) {
    const variant = await sharp(image).resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toBuffer({ resolveWithObject: true });
    await writeFile(`${OUT}/${id}-${width}.webp`, variant.data);
    srcSet.push({ src: `/photography/airbnb/${id}-${width}.webp`, width: variant.info.width, height: variant.info.height });
  }
  srcSet.push({ src: `/photography/airbnb/${id}.webp`, width: master.info.width, height: master.info.height });
  await sharp(image).resize({ width: 320, height: 240, fit: 'inside' }).webp({ quality: 76 }).toFile(`${OUT}/${id}-thumb.webp`);
  photos.push({
    id, category, src: `/photography/airbnb/${id}.webp`, thumbnail: `/photography/airbnb/${id}-thumb.webp`,
    width: master.info.width, height: master.info.height, position: '50% 50%', captions: { en, el, tr }, srcSet,
    source: { platform: 'Airbnb', listingId: LISTING_ID, page: LISTING_PAGE, url: item.url.toString(), sourceLabel: item.label, retrievedAt, originalSha256: sha(original), webpSha256: sha(master.data), ...(stamped ? { edit: 'date stamp cropped' } : {}) },
  });
  console.log(`${id.padEnd(14)} #${n} ${master.info.width}x${master.info.height}${stamped ? ' (stamp removed)' : ''}`);
}

for (const [id, [en, el, tr]] of Object.entries(bookingKeep)) {
  const photo = previous.find(p => p.id === id && p.source?.platform === 'Booking.com');
  if (!photo || !photo.source.page.includes('/hotel/gr/mastiha-luxury-suites')) throw new Error(`Booking photograph ${id} missing from the existing catalogue`);
  photos.push({ ...photo, category: 'family', captions: { en, el, tr } });
}

await writeFile(MANIFEST, JSON.stringify(photos, null, 2) + '\n');
console.log(`${photos.length} photographs, all from Mastiha Luxury Suites.`);
