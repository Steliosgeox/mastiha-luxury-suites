import { randomBytes } from "node:crypto";
import webpush from "web-push";
import type { Kv } from "./store";

/*
  Keys the server makes for itself. Each is generated once, stored in the chat database
  (whoever can read that already holds every conversation, so it adds no exposure) and
  cached per instance. An environment variable, when set, always wins. Nobody has to
  generate, copy or rotate anything by hand.
*/

const cache = new Map<string, string>();

async function ensure(kv: Kv, name: string, make: () => string): Promise<string> {
  const known = cache.get(name);
  if (known) return known;
  // Several instances may race on first use: the first write wins and everyone reads it back.
  await kv.put(`secret:${name}`, make(), null, true);
  const [value] = await kv.read([`secret:${name}`]);
  if (!value) throw new Error(`Secret ${name} unavailable`);
  cache.set(name, value);
  return value;
}

/** Signs the admin session cookie. */
export async function sessionSecret(kv: Kv): Promise<string> {
  const configured = process.env.MASTIHA_ADMIN_SECRET?.trim();
  if (configured && configured.length >= 32) return configured;
  return ensure(kv, "session", () => randomBytes(48).toString("base64url"));
}

export type VapidKeys = { publicKey: string; privateKey: string };

/** Signs Web Push messages to the host's devices. */
export async function vapidKeys(kv: Kv): Promise<VapidKeys> {
  const publicKey = process.env.MASTIHA_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.MASTIHA_VAPID_PRIVATE_KEY?.trim();
  if (publicKey && privateKey) return { publicKey, privateKey };
  return JSON.parse(await ensure(kv, "vapid", () => JSON.stringify(webpush.generateVAPIDKeys()))) as VapidKeys;
}
