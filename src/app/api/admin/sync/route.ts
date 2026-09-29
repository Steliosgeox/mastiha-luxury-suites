import { requireAdmin } from "@/lib/chat/admin";
import type { AdminSync } from "@/lib/chat/types";
import { failure, json } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The admin portal polls one endpoint. The inbox is only re-sent when its version changed;
 * entries are sent for the open conversation, which is then marked read.
 */
export async function GET(request: Request) {
  try {
    const store = await requireAdmin();
    const params = new URL(request.url).searchParams;
    const [version] = await Promise.all([store.inboxVersion(), store.markHostPresent()]);
    const body: AdminSync = { version };
    if (Number(params.get("version") ?? -1) !== version) body.conversations = await store.listConversations(100);

    const id = params.get("conversation");
    if (id) {
      const conversation = await store.getConversation(id);
      if (conversation) {
        const { tokenHash: _tokenHash, ...visible } = conversation;
        const after = Number(params.get("after") ?? -1);
        body.entries = await store.listEntries(id, Number.isInteger(after) ? after : -1);
        body.conversation = visible;
        if (conversation.hostUnread) {
          await store.updateConversation(id, { hostUnread: 0 });
          body.conversation.hostUnread = 0;
        }
      }
    }
    return json(body);
  } catch (error) { return failure(error); }
}
