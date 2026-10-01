import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/*
  The admin password, as a one-way scrypt hash (N=2^15, r=8, p=1). The repository is
  public, so only the hash lives here: the password is a 93-bit random string, far beyond
  any offline guessing against this hash. Setting MASTIHA_ADMIN_PASSWORD in the deployment
  replaces it; `npm run chat:password` makes a new hash.
*/
export const ADMIN_PASSWORD_HASH = "scrypt$32768$8$1$K0PbIKKnUxkbYp_FY_NmuQ$D0b6j9D7tCgm75b12bYYY2wMNWQzFoVwi2vQeqHMYUE";

const derive = promisify(scrypt) as (password: string, salt: Buffer, keylen: number, options: { N: number; r: number; p: number; maxmem: number }) => Promise<Buffer>;
const MAX_MEMORY = 64 * 1024 * 1024;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const N = 1 << 15, r = 8, p = 1;
  const hash = await derive(password, salt, 32, { N, r, p, maxmem: MAX_MEMORY });
  return ["scrypt", N, r, p, salt.toString("base64url"), hash.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [scheme, n, r, p, salt, hash] = encoded.split("$");
  if (scheme !== "scrypt" || !salt || !hash || password.length > 256) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = await derive(password, Buffer.from(salt, "base64url"), expected.length, { N: Number(n), r: Number(r), p: Number(p), maxmem: MAX_MEMORY });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
