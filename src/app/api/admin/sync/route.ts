import { todayStats } from "@/lib/ai/concierge";
import { aiConfigured, candidates, freeAllowanceRemaining, routeKey } from "@/lib/ai/router";
import { requireAdmin } from "@/lib/chat/admin";
import type { AdminSync } from "@/lib/chat/types";
import { failure, json } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The admin portal polls one endpoint. Most polls cost one Redis read: the inbox is only
 * re-sent when its version changed, presence is refreshed when the portal asks (about every
 * 20 s), entries only for the open conversation, and the assistant's numbers on request.
 */
export async function GET(request: Request) {
  try {
    const store = await requireAdmin();
    const params = new URL(request.url).searchParams;
    const [version] = await Promise.all([store.inboxVersion(), params.get("present") === "1" ? store.markHostPresent() : undefined]);
    const body: AdminSync = { version };
    if (Number(params.get("version") ?? -1) !== version) {
      [body.conversations, body.total] = await Promise.all([store.listConversations(200), store.countConversations()]);
    }

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

    if (params.get("stats") === "1") {
      const [today, freeRemaining] = await Promise.all([todayStats(store), candidates().some(candidate => candidate.provider === "openrouter") ? freeAllowanceRemaining() : null]);
      body.ai = { today, models: candidates().map(routeKey), configured: aiConfigured(), freeRemaining };
    }
    return json(body);
  } catch (error) { return failure(error); }
}
