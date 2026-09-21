import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Read-only, owner-requested visual audit. Does not publish or commit assets.
const source = 'https://www.airbnb.co.in/rooms/1368953469779774276';
const root = 'media-review';
await mkdir(root, { recursive: true });
const response = await fetch(source, { signal: AbortSignal.timeout(25000) });
if (!response.ok) throw new Error(`Listing returned ${response.status}`);
const html = await response.text();
if (!html.includes('Mastiha Luxury Suites')) throw new Error('Wrong listing');
await writeFile(`${root}/listing.html`, html);
const script = html.match(/<script[^>]*id="data-deferred-state-0"[^>]*>([\s\S]*?)<\/script>/);
if (!script) throw new Error('Public photo tour data is unavailable');
const state = JSON.parse(script[1]);
let tour;
function visit(value) {
  if (!value || typeof value !== 'object') return;
  if (value.__typename === 'PhotoTourModalSection') tour = value;
  for (const child of Object.values(value)) visit(child);
}
visit(state);
if (!tour?.mediaItems?.length) throw new Error('No listing photographs');
const allowed = /\/(?:hosting|miso)\/Hosting-(?:1368953469779774276|U3RheVN1cHBseUxpc3Rpbmc6MTM2ODk1MzQ2OTc3OTc3NDI3Ng(?:==|%3D%3D))\/original\//;
const images = [];
let index = 0;
for (const item of tour.mediaItems) {
  const base = new URL(item.baseUrl);
  if (base.hostname !== 'a0.muscache.com' || !allowed.test(base.pathname)) throw new Error('Unexpected image source');
  const id = `photo-${String(++index).padStart(2,'0')}`;
  base.searchParams.set('im_w', '1920');
  const url = base.toString();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length > 15000000) throw new Error('Unexpectedly large image');
    const meta = await sharp(bytes).metadata();
    await sharp(bytes).rotate().resize({width:1920,height:1920,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toFile(`${root}/${id}.webp`);
    await sharp(bytes).rotate().resize({width:480,height:360,fit:'inside',withoutEnlargement:true}).jpeg({quality:82}).toFile(`${root}/${id}.jpg`);
    images.push({id,url,source,label:item.accessibilityLabel,width:meta.width,height:meta.height,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});
  } catch (err) { images.push({id,url,source,label:item.accessibilityLabel,error:String(err)}); }
  if(index >= 90) break;
}
await writeFile(`${root}/manifest.json`, JSON.stringify({retrievedAt:new Date().toISOString(),images},null,2));
console.log(`${images.filter(i => !i.error).length} of ${images.length} photographs ready for visual review.`);
