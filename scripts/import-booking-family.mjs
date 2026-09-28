import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const listing = 'https://www.booking.com/hotel/gr/mastiha-luxury-suites.html';
// Captured from the actual 62-photo property gallery, not search-engine images.
const selected = [
  ['playpen', '711144967', 'b00dd00287f443ebe11572c926499b1d711f1016e34a2a500c9b12e76c747fbc', 'a baby crib in a room with a bed at Mastiha Luxury Suites in Chios'],
  ['kids-corner', '711144628', '582cfefd5f18aa09b6d9ffc4c5b3f211523603624c81cd9afa4215365cd3b328', 'a childs table and chairs with a table and a play set at Mastiha Luxury Suites in Chios'],
  ['crib', '871815375', '9efa898302caa1623fbec480dce86ba790d0503692c12f38c357eb1affd2f401', 'a white crib sitting on top of a wooden floor at Mastiha Luxury Suites in Chios'],
];
const manifestPath = 'src/content/stay-media.generated.json';
const catalogue = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const output = 'public/photography/booking';
await fs.mkdir(output, { recursive: true });
await fs.mkdir('media-review/booking', { recursive: true });
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
for (const [id, imageId, token, label] of selected) {
  const photo = catalogue.find(p => p.id === id);
  if (!photo) throw new Error(`Unknown photo ID ${id}`);
  let url = '', response;
  for (const size of ['max1920x1440', 'max1024x768']) {
    url = `https://cf.bstatic.com/xdata/images/hotel/${size}/${imageId}.jpg?k=${token}&o=`;
    response = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: 'error' });
    if (response.ok && response.headers.get('content-type')?.startsWith('image/')) break;
  }
  if (!response?.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`Booking photo fetch failed: ${id}`);
  const raw = Buffer.from(await response.arrayBuffer());
  if (raw.length > 10_000_000) throw new Error('Image exceeds import budget');
  const meta = await sharp(raw).rotate().metadata();
  if (!meta.width || !meta.height || meta.width < 450 || meta.height < 450) throw new Error(`Insufficient original image resolution for ${id}`);
  const variants = [];
  for (const [suffix, width] of [['', 1920], ['-1280', 1280], ['-640', 640], ['-thumb', 240]]) {
    const result = await sharp(raw).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: suffix === '-thumb' ? 78 : 88, effort: 6 }).toBuffer({ resolveWithObject: true });
    const filename = `${id}${suffix}.webp`;
    await fs.writeFile(path.join(output, filename), result.data);
    if (suffix !== '-thumb') variants.push({ src: `/photography/booking/${filename}`, width: result.info.width, height: result.info.height });
    if (suffix === '') {
      photo.width = result.info.width; photo.height = result.info.height;
      photo.source = { platform: 'Booking.com', listingId: 'mastiha-luxury-suites', page: listing, url, sourceLabel: label, retrievedAt: new Date().toISOString(), originalSha256: sha(raw), webpSha256: sha(result.data) };
    }
  }
  photo.src = `/photography/booking/${id}.webp`;
  photo.thumbnail = `/photography/booking/${id}-thumb.webp`;
  photo.srcSet = [...new Map(variants.sort((a, b) => a.width - b.width).map(p => [p.width, p])).values()];
  await fs.writeFile(`media-review/booking/${id}.jpg`, raw);
  console.log(`BOOKING_SOURCE ${id}: ${photo.width}x${photo.height}, ${imageId}, ${sha(raw)}`);
}
await fs.writeFile(manifestPath, JSON.stringify(catalogue, null, 2) + '\n');
