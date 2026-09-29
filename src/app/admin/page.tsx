import { AdminApp } from "@/components/admin/AdminApp";
import { Login } from "@/components/admin/Login";
import { ADMIN_COPY } from "@/content/admin-copy";
import { isAdmin } from "@/lib/chat/auth";
import { liveChatEnabled } from "@/lib/chat/service";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!liveChatEnabled()) {
    const c = ADMIN_COPY.el.setup;
    return <main style={{ display: "grid", placeItems: "center", minHeight: "100dvh", padding: 24, fontFamily: "var(--font-sans), sans-serif", color: "#1f2123" }}>
      <div style={{ maxWidth: 460 }}>
        <h1 style={{ fontFamily: "var(--font-display), sans-serif", fontWeight: 350, letterSpacing: "-.03em" }}>{c.title}</h1>
        <p style={{ lineHeight: 1.6, color: "#6b6f72" }}>{c.body}</p>
        <p style={{ lineHeight: 1.6, color: "#6b6f72" }}>{ADMIN_COPY.en.setup.title}. See docs/LIVE-CHAT.md.</p>
      </div>
    </main>;
  }
  return (await isAdmin()) ? <AdminApp /> : <Login />;
}
