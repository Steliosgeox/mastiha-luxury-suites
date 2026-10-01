import webpush from "web-push";
import { SITE_URL } from "@/lib/site";
import { vapidKeys } from "./secrets";
import type { ChatStore } from "./store";

/*
  Web Push to the host's devices. The admin portal registers a service worker and stores
  its subscription; the server signs pushes with a VAPID key pair it generated itself
  (secrets.ts), or the one in MASTIHA_VAPID_PUBLIC_KEY / MASTIHA_VAPID_PRIVATE_KEY.
*/

export async function vapidPublicKey(store: ChatStore): Promise<string> {
  return (await vapidKeys(store)).publicKey;
}

export type HostNotification = { title: string; body: string; conversationId: string };

/** Notifies every registered host device. Expired subscriptions are removed. */
export async function notifyHost(store: ChatStore, notification: HostNotification): Promise<void> {
  const subscriptions = await store.listPushSubscriptions();
  if (!subscriptions.length) return;
  const keys = await vapidKeys(store);
  const options = {
    TTL: 60 * 60,
    urgency: "high" as const,
    topic: notification.conversationId.replace(/-/g, "").slice(0, 32),
    vapidDetails: { subject: process.env.MASTIHA_VAPID_SUBJECT?.trim() || SITE_URL, publicKey: keys.publicKey, privateKey: keys.privateKey },
  };
  const payload = JSON.stringify({ ...notification, url: `/admin?c=${notification.conversationId}` });
  await Promise.all(subscriptions.map(async raw => {
    const subscription = JSON.parse(raw) as webpush.PushSubscription;
    try {
      await webpush.sendNotification(subscription, payload, options);
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) await store.removePushSubscription(subscription.endpoint);
    }
  }));
}
