/**
 * next/image loader for our photographs. Every photo already exists as pre-encoded WebP at
 * 640 px, 1280 px and full size (see scripts/import-listing-photos.mjs), so the loader picks
 * the smallest file that covers the requested width instead of asking the image optimiser
 * to re-encode it. The files are plain static assets: cached by the CDN, no cold starts.
 */
const VARIANTS = [640, 1280];

export default function photoLoader({ src, width }: { src: string; width: number }): string {
  const match = src.match(/^(\/photography\/[\w-]+\/[\w-]+)\.webp$/);
  if (!match) return src;
  const variant = VARIANTS.find(size => width <= size);
  return variant ? `${match[1]}-${variant}.webp` : src;
}
