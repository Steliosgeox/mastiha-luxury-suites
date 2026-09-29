import webpush from "web-push";
import { SITE_URL } from "@/lib/site";
import type { ChatStore } from "./store";

/*
  Web Push to the host's devices. The admin portal registers a service worker and stores
  its subscription; the server signs pushes with the VAPID key pair from the environment
  (generate one with `npm run chat:keys`).
*/

export function vapidPublicKey(): string | null {
  return process.env.MASTIHA_VAPID_PUBLIC_KEY?.trim() || null;
}

function configured(): boolean {
  const publicKey = vapidPublicKey();
  const privateKey = process.env.MASTIHA_VAPID_PRIVATE_KEY?.trim();
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(process.env.MASTIHA_VAPID_SUBJECT?.trim() || SITE_URL, publicKey, privateKey);
  return true;
}

export type HostNotification = { title: string; body: string; conversationId: string };

/** Notifies every registered host device. Expired subscriptions are removed. */
export async function notifyHost(store: ChatStore, notification: HostNotification): Promise<void> {
  if (!configured()) return;
  const payload = JSON.stringify({ ...notification, url: `/admin?c=${notification.conversationId}` });
  const subscriptions = await store.listPushSubscriptions();
  await Promise.all(subscriptions.map(async raw => {
    const subscription = JSON.parse(raw) as webpush.PushSubscription;
    try {
      await webpush.sendNotification(subscription, payload, { TTL: 60 * 60, urgency: "high", topic: notification.conversationId.replace(/-/g, "").slice(0, 32) });
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) await store.removePushSubscription(subscription.endpoint);
    }
  }));
}
