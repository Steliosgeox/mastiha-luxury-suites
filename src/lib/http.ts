import { createHash } from "node:crypto";

/* Shared request checks for the JSON API routes. */

export class RequestFailure extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const responseHeaders = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

/** Rejects cross-site browser requests. */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host") ?? new URL(request.url).host;
  const protocol = process.env.VERCEL === "1" ? "https:" : new URL(request.url).protocol;
  let expected: string;
  try {
    const url = new URL(`${protocol}//${host}`);
    if (url.host !== host || url.username || url.password || url.pathname !== "/") throw new Error("Invalid host");
    expected = url.origin;
  } catch { throw new RequestFailure(403, "Invalid request origin."); }
  if (request.headers.get("sec-fetch-site") === "cross-site" || (origin && origin !== expected)) {
    throw new RequestFailure(403, "Cross-origin requests are not accepted.");
  }
}

export function requireJson(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new RequestFailure(415, "Send application/json.");
}

/** A hashed client address, so rate-limit keys never contain raw IPs. */
export function clientKey(request: Request): string {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(address).digest("hex").slice(0, 32);
}

const hits = new Map<string, { count: number; expires: number }>();

/** Per-instance limit for the stateless guide. Live chat uses the store's shared limiter. */
export function localLimit(request: Request, bucket: string, limit = 20, windowMs = 60_000) {
  const key = `${bucket}:${clientKey(request)}`;
  const now = Date.now();
  for (const [id, value] of hits) if (value.expires <= now) hits.delete(id);
  if (hits.size >= 4096 && !hits.has(key)) throw new RequestFailure(429, "Please try again later.");
  const entry = hits.get(key) ?? { count: 0, expires: now + windowMs };
  if (++entry.count > limit) throw new RequestFailure(429, "Please try again later.");
  hits.set(key, entry);
}

export async function readJson(request: Request, maxBytes = 16_384): Promise<unknown> {
  if (Number(request.headers.get("content-length") || 0) > maxBytes) throw new RequestFailure(413, "Message is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new RequestFailure(400, "Missing request body.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maxBytes) { await reader.cancel(); throw new RequestFailure(413, "Message is too large."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new RequestFailure(400, "Invalid JSON."); }
}

export function json(body: unknown, init: ResponseInit = {}) {
  return Response.json(body, { ...init, headers: { ...responseHeaders, ...init.headers } });
}

export function failure(error: unknown) {
  if (!(error instanceof RequestFailure)) console.error(error);
  const status = error instanceof RequestFailure ? error.status : 503;
  const message = error instanceof RequestFailure ? error.message : "The service is temporarily unavailable.";
  return json({ message }, { status, headers: status === 429 ? { "Retry-After": "60" } : {} });
}
