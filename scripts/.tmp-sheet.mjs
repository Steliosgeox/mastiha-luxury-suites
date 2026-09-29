import fs from 'node:fs/promises';
import sharp from 'sharp';
const [dir, out, list, cols = '4', cw = '480'] = process.argv.slice(2);
const ids = list.split(',').map(Number); const W = +cw, C = +cols;
const tiles = await Promise.all(ids.map(async n => {
  const img = await sharp(`${dir}/orig/${String(n).padStart(2, '0')}.jpg`).resize({ width: W, height: Math.round(W * .75), fit: 'contain', background: '#fff' }).toBuffer();
  const label = Buffer.from(`<svg width="${W}" height="28"><rect width="100%" height="100%" fill="#000"/><text x="8" y="20" font-size="18" font-family="sans-serif" fill="#fff">#${n}</text></svg>`);
  return sharp({ create: { width: W, height: Math.round(W * .75) + 28, channels: 3, background: '#fff' } }).composite([{ input: img, top: 28, left: 0 }, { input: label, top: 0, left: 0 }]).png().toBuffer();
}));
const H = Math.round(W * .75) + 28, R = Math.ceil(ids.length / C);
await sharp({ create: { width: W * C, height: H * R, channels: 3, background: '#ddd' } }).composite(tiles.map((t, i) => ({ input: t, left: (i % C) * W, top: Math.floor(i / C) * H }))).jpeg({ quality: 82 }).toFile(out);
