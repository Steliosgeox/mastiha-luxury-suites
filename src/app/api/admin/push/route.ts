import { requireAdmin } from "@/lib/chat/admin";
import { vapidPublicKey } from "@/lib/chat/push";
import { failure, json, readJson, RequestFailure, requireJson, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Subscription = { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };

export async function GET() {
  try {
    await requireAdmin();
    return json({ publicKey: vapidPublicKey() });
  } catch (error) { return failure(error); }
}

/** Register this device for notifications. */
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    requireJson(request);
    const store = await requireAdmin();
    const body = await readJson(request, 4096) as { subscription?: Subscription } | null;
    const subscription = body?.subscription;
    const endpoint = typeof subscription?.endpoint === "string" ? subscription.endpoint : "";
    if (!/^https:\/\//.test(endpoint) || typeof subscription?.keys?.p256dh !== "string" || typeof subscription.keys.auth !== "string") {
      throw new RequestFailure(400, "Invalid subscription.");
    }
    await store.savePushSubscription(endpoint, JSON.stringify({ endpoint, keys: subscription.keys }));
    return json({ ok: true }, { status: 201 });
  } catch (error) { return failure(error); }
}

export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    requireJson(request);
    const store = await requireAdmin();
    const body = await readJson(request, 2048) as { endpoint?: unknown } | null;
    if (typeof body?.endpoint === "string") await store.removePushSubscription(body.endpoint);
    return json({ ok: true });
  } catch (error) { return failure(error); }
}
