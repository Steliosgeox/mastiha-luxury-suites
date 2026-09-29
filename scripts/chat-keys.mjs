// Prints fresh secrets for the live chat. Paste them into the Vercel project's
// environment variables (Settings → Environment Variables), then redeploy.
//
//   npm run chat:keys
import { randomBytes } from "node:crypto";
import webpush from "web-push";

const { publicKey, privateKey } = webpush.generateVAPIDKeys();
console.log(`MASTIHA_ADMIN_SECRET=${randomBytes(32).toString("base64url")}
MASTIHA_VAPID_PUBLIC_KEY=${publicKey}
MASTIHA_VAPID_PRIVATE_KEY=${privateKey}`);
