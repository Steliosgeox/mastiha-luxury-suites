import { requireAdmin } from "@/lib/chat/admin";
import { conversationId } from "@/lib/chat/service";
import type { ConversationPatch } from "@/lib/chat/store";
import type { SystemEvent } from "@/lib/chat/types";
import { failure, json, readJson, RequestFailure, requireJson, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Close or reopen a conversation; take it over from the assistant, or give it back. */
export async function PATCH(request: Request, { params }: Params) {
  try {
    sameOrigin(request);
    requireJson(request);
    const store = await requireAdmin();
    const id = conversationId((await params).id);
    const body = await readJson(request, 1024) as { status?: unknown; handler?: unknown } | null;
    const status = body?.status, handler = body?.handler;
    if (status !== undefined && status !== "open" && status !== "closed") throw new RequestFailure(400, "Invalid status.");
    if (handler !== undefined && handler !== "bot" && handler !== "host") throw new RequestFailure(400, "Invalid handler.");
    const conversation = await store.getConversation(id);
    if (!conversation) throw new RequestFailure(404, "Conversation not found.");

    const patch: ConversationPatch = {};
    const events: SystemEvent[] = [];
    if (status && status !== conversation.status) { patch.status = status; events.push(status === "closed" ? "closed" : "reopened"); }
    if (handler && handler !== conversation.handler) { patch.handler = handler; events.push(handler === "host" ? "takeover" : "returned"); }
    if (Object.keys(patch).length) {
      await store.updateConversation(id, patch);
      for (const event of events) await store.appendEntry(id, { author: "system", text: event });
    }
    return json({ ok: true });
  } catch (error) { return failure(error); }
}

/** Delete a conversation and all its messages now, before the 30 days are up. */
export async function DELETE(request: Request, { params }: Params) {
  try {
    sameOrigin(request);
    const store = await requireAdmin();
    await store.deleteConversation(conversationId((await params).id));
    return json({ ok: true });
  } catch (error) { return failure(error); }
}
