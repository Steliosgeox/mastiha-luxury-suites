import { createHash } from 'node:crypto';

export class RequestFailure extends Error { constructor(public status: number, message: string) { super(message); } }
/** Bounded per-instance guard. The production handoff gateway must also enforce durable rate limits. */
const hits = new Map<string, { count: number; expires: number }>();
export function guard(request: Request, bucket: string, limit = 20, windowMs = 60_000) {
  const origin = request.headers.get('origin');
  const url = new URL(request.url);
  const host = request.headers.get('host') || url.host;
  const protocol = process.env.VERCEL === '1' ? 'https:' : url.protocol;
  let expectedOrigin = '';
  try {
    const publicUrl = new URL(`${protocol}//${host}`);
    if (publicUrl.host !== host || publicUrl.username || publicUrl.password || publicUrl.pathname !== '/') throw new Error('Invalid host');
    expectedOrigin = publicUrl.origin;
  } catch { throw new RequestFailure(403, 'Invalid request origin.'); }
  if (request.headers.get('sec-fetch-site') === 'cross-site' || (origin && origin !== expectedOrigin)) throw new RequestFailure(403, 'Cross-origin requests are not accepted.');
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new RequestFailure(415, 'Send application/json.');
  const address = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const key = bucket + createHash('sha256').update(address).digest('hex');
  const now = Date.now();
  for (const [id, value] of hits) if (value.expires <= now) hits.delete(id);
  if (hits.size >= 4096 && !hits.has(key)) throw new RequestFailure(429, 'Please try again later.');
  const entry = hits.get(key) ?? { count: 0, expires: now + windowMs };
  if (++entry.count > limit) throw new RequestFailure(429, 'Please try again later.');
  hits.set(key, entry);
}
export async function readJson(request: Request, maxBytes = 16_384): Promise<unknown> {
  if (Number(request.headers.get('content-length') || 0) > maxBytes) throw new RequestFailure(413, 'Message is too large.');
  const reader = request.body?.getReader();
  if (!reader) throw new RequestFailure(400, 'Missing request body.');
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.length;
      if (size > maxBytes) { await reader.cancel(); throw new RequestFailure(413, 'Message is too large.'); }
      chunks.push(value);
    }
    const buffer = Buffer.concat(chunks);
    try { return JSON.parse(buffer.toString('utf8')); } catch { throw new RequestFailure(400, 'Invalid JSON.'); }
  } finally { reader.releaseLock(); }
}
export const responseHeaders = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
export function failure(error: unknown) {
  const status = error instanceof RequestFailure ? error.status : 503;
  const message = error instanceof RequestFailure ? error.message : 'The service is temporarily unavailable. No delivery has been confirmed.';
  return Response.json({ message }, { status, headers: { ...responseHeaders, ...(status === 429 ? { 'Retry-After': '60' } : {}) } });
}
