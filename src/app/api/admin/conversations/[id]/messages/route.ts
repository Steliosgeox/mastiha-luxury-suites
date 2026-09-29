import { requireAdmin } from "@/lib/chat/admin";
import { cleanText, conversationId } from "@/lib/chat/service";
import { LIMITS } from "@/lib/chat/types";
import { failure, json, readJson, RequestFailure, requireJson, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Athina's reply. */
export async function POST(request: Request, { params }: Params) {
  try {
    sameOrigin(request);
    requireJson(request);
    const store = await requireAdmin();
    const id = conversationId((await params).id);
    const conversation = await store.getConversation(id);
    if (!conversation) throw new RequestFailure(404, "Conversation not found.");
    const body = await readJson(request, 16_384) as { text?: unknown } | null;
    const entry = await store.appendEntry(id, { author: "host", text: cleanText(body?.text, LIMITS.hostText) });
    if (conversation.status === "closed") await store.updateConversation(id, { status: "open" });
    return json({ entry }, { status: 201 });
  } catch (error) { return failure(error); }
}
