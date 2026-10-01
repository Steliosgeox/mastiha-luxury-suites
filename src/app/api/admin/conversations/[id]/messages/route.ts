import { requireAdmin } from "@/lib/chat/admin";
import { cleanText, conversationId } from "@/lib/chat/service";
import { LIMITS, type ChatEntry } from "@/lib/chat/types";
import { failure, json, readJson, RequestFailure, requireJson, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Athina's reply. Writing into a conversation the assistant was handling takes it over. */
export async function POST(request: Request, { params }: Params) {
  try {
    sameOrigin(request);
    requireJson(request);
    const store = await requireAdmin();
    const id = conversationId((await params).id);
    const conversation = await store.getConversation(id);
    if (!conversation) throw new RequestFailure(404, "Conversation not found.");
    const body = await readJson(request, 16_384) as { text?: unknown } | null;
    const text = cleanText(body?.text, LIMITS.hostText);
    const entries: ChatEntry[] = [];
    if (conversation.handler === "bot" || conversation.status === "closed") {
      await store.updateConversation(id, { handler: "host", status: "open" });
      if (conversation.handler === "bot") entries.push(await store.appendEntry(id, { author: "system", text: "takeover" }));
    }
    entries.push(await store.appendEntry(id, { author: "host", text }));
    return json({ entry: entries.at(-1), entries }, { status: 201 });
  } catch (error) { return failure(error); }
}
