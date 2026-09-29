import { requireAdmin } from "@/lib/chat/admin";
import { conversationId } from "@/lib/chat/service";
import { failure, json, readJson, RequestFailure, requireJson, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Close or reopen a conversation. */
export async function PATCH(request: Request, { params }: Params) {
  try {
    sameOrigin(request);
    requireJson(request);
    const store = await requireAdmin();
    const id = conversationId((await params).id);
    const body = await readJson(request, 1024) as { status?: unknown } | null;
    if (body?.status !== "open" && body?.status !== "closed") throw new RequestFailure(400, "Invalid status.");
    const conversation = await store.getConversation(id);
    if (!conversation) throw new RequestFailure(404, "Conversation not found.");
    if (conversation.status !== body.status) {
      await store.updateConversation(id, { status: body.status });
      await store.appendEntry(id, { author: "system", text: body.status === "closed" ? "closed" : "reopened" });
    }
    return json({ ok: true });
  } catch (error) { return failure(error); }
}

/** Delete a conversation and all its messages. */
export async function DELETE(request: Request, { params }: Params) {
  try {
    sameOrigin(request);
    const store = await requireAdmin();
    await store.deleteConversation(conversationId((await params).id));
    return json({ ok: true });
  } catch (error) { return failure(error); }
}
