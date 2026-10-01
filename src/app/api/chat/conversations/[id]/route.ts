import { guestTokenMatches } from "@/lib/chat/auth";
import { cleanEmail, cleanText, conversationId, limit, requireStore } from "@/lib/chat/service";
import { LIMITS, type GuestSync } from "@/lib/chat/types";
import { failure, json, readJson, RequestFailure, requireJson, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

async function owned(request: Request, params: Params["params"]) {
  const store = requireStore();
  const id = conversationId((await params).id);
  const conversation = await store.getConversation(id);
  if (!conversation || !guestTokenMatches(request, conversation.tokenHash)) throw new RequestFailure(404, "Conversation not found.");
  return { store, conversation };
}

/** The guest's widget polls here for new entries and whether Athina is around. */
export async function GET(request: Request, { params }: Params) {
  try {
    const { store, conversation } = await owned(request, params);
    const search = new URL(request.url).searchParams;
    const after = Number(search.get("after") ?? -1);
    const [entries, presence] = await Promise.all([
      store.listEntries(conversation.id, Number.isInteger(after) ? after : -1),
      store.hostPresence(conversation.id),
    ]);
    // Record that the guest is here (at most every 15 s) and has read Athina's replies.
    const patch: { guestSeenAt?: number; guestUnread?: number } = {};
    if (Date.now() - conversation.guestSeenAt > 15_000) patch.guestSeenAt = Date.now();
    if (conversation.guestUnread && search.get("read") === "1") patch.guestUnread = 0;
    if (Object.keys(patch).length) await store.updateConversation(conversation.id, patch);
    const body: GuestSync & { unread: number } = {
      status: conversation.status, handler: conversation.handler, entries,
      hostOnline: presence.online, hostTyping: presence.typing,
      unread: patch.guestUnread === 0 ? 0 : conversation.guestUnread,
    };
    return json(body);
  } catch (error) { return failure(error); }
}

/** The guest's name and email, so Athina can address them and reply by email. Both optional. */
export async function PATCH(request: Request, { params }: Params) {
  try {
    sameOrigin(request);
    requireJson(request);
    const { store, conversation } = await owned(request, params);
    await limit(store, request, `details:${conversation.id}`, 10, 60 * 60);
    const body = await readJson(request, 2048) as { name?: unknown; email?: unknown } | null;
    await store.updateConversation(conversation.id, {
      name: cleanText(body?.name, LIMITS.name, { required: false }),
      email: cleanEmail(body?.email),
    });
    return json({ ok: true });
  } catch (error) { return failure(error); }
}
