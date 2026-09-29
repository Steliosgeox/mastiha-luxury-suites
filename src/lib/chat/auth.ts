import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/*
  Admin: a single password (MASTIHA_ADMIN_PASSWORD) exchanged for a signed, HttpOnly
  session cookie. Guests: each live conversation gets a random token that only the guest's
  browser holds; the server stores its SHA-256.
*/

export const ADMIN_COOKIE = "mls_admin";
const SESSION_DAYS = 30;

const sha256 = (value: string) => createHash("sha256").update(value).digest();
const safeEqual = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);

export function adminConfigured(): boolean {
  return (process.env.MASTIHA_ADMIN_PASSWORD ?? "").length >= 8;
}

function sessionKey(): Buffer | null {
  const secret = process.env.MASTIHA_ADMIN_SECRET;
  if (secret && secret.length >= 32) return Buffer.from(secret);
  // Without a dedicated secret, derive one from the password: changing it signs everyone out.
  return adminConfigured() ? sha256(`mastiha-admin-session:${process.env.MASTIHA_ADMIN_PASSWORD}`) : null;
}

export function passwordMatches(input: string): boolean {
  if (!adminConfigured()) return false;
  return safeEqual(sha256(input), sha256(process.env.MASTIHA_ADMIN_PASSWORD!));
}

function sign(payload: string, key: Buffer) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function createSession(): { value: string; maxAge: number } {
  const key = sessionKey();
  if (!key) throw new Error("Admin is not configured");
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const payload = `${Date.now() + maxAge * 1000}.${randomBytes(12).toString("base64url")}`;
  return { value: `${payload}.${sign(payload, key)}`, maxAge };
}

export function sessionValid(value: string | undefined): boolean {
  const key = sessionKey();
  if (!key || !value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  if (!safeEqual(Buffer.from(parts[2]), Buffer.from(sign(payload, key)))) return false;
  return Number(parts[0]) > Date.now();
}

export async function isAdmin(): Promise<boolean> {
  return sessionValid((await cookies()).get(ADMIN_COOKIE)?.value);
}

export function newGuestToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: sha256(token).toString("hex") };
}

export function guestTokenMatches(request: Request, hash: string): boolean {
  const token = request.headers.get("authorization")?.match(/^Bearer ([\w-]{20,100})$/)?.[1];
  return Boolean(token && hash) && safeEqual(sha256(token!), Buffer.from(hash, "hex"));
}
