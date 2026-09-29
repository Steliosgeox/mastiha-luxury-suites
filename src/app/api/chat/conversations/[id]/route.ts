import { guestTokenMatches } from "@/lib/chat/auth";
import { conversationId, requireStore } from "@/lib/chat/service";
import type { GuestSync } from "@/lib/chat/types";
import { failure, json, RequestFailure } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** The guest's widget polls here for new entries and whether Athina is around. */
export async function GET(request: Request, { params }: Params) {
  try {
    const store = requireStore();
    const id = conversationId((await params).id);
    const conversation = await store.getConversation(id);
    if (!conversation || !guestTokenMatches(request, conversation.tokenHash)) throw new RequestFailure(404, "Conversation not found.");
    const after = Number(new URL(request.url).searchParams.get("after") ?? -1);
    const [entries, presence] = await Promise.all([
      store.listEntries(id, Number.isInteger(after) ? after : -1),
      store.hostPresence(id),
    ]);
    // Record that the guest is here (at most every 15 s) and has read Athina's replies.
    const patch: { guestSeenAt?: number; guestUnread?: number } = {};
    if (Date.now() - conversation.guestSeenAt > 15_000) patch.guestSeenAt = Date.now();
    if (conversation.guestUnread && new URL(request.url).searchParams.get("read") === "1") patch.guestUnread = 0;
    if (Object.keys(patch).length) await store.updateConversation(id, patch);
    const body: GuestSync & { unread: number } = { status: conversation.status, entries, hostOnline: presence.online, hostTyping: presence.typing, unread: patch.guestUnread === 0 ? 0 : conversation.guestUnread };
    return json(body);
  } catch (error) { return failure(error); }
}
