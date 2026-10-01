import { requireAdmin } from "@/lib/chat/admin";
import { conversationId } from "@/lib/chat/service";
import { failure, json, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Shows "Athina is typing…" to the guest for a few seconds. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    sameOrigin(request);
    const store = await requireAdmin();
    await store.markHostTyping(conversationId((await params).id));
    return json({ ok: true });
  } catch (error) { return failure(error); }
}
