import { AdminApp } from "@/components/admin/AdminApp";
import { Login } from "@/components/admin/Login";
import { ADMIN_COPY } from "@/content/admin-copy";
import { isAdmin } from "@/lib/chat/auth";
import { chatStore } from "@/lib/chat/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const store = chatStore();
  if (!store) {
    const c = ADMIN_COPY.el.setup;
    return <main className="admin-gate">
      <div className="admin-gate__card">
        <h1>{c.title}</h1>
        <p>{c.body}</p>
        <p lang="en">{ADMIN_COPY.en.setup.title}. See docs/CHAT.md.</p>
      </div>
    </main>;
  }
  return (await isAdmin(store)) ? <AdminApp /> : <Login />;
}
