"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ADMIN_COPY, type AdminLocale } from "@/content/admin-copy";

export function Login() {
  const [locale, setLocale] = useState<AdminLocale>("el");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const c = ADMIN_COPY[locale];

  useEffect(() => {
    try { if (localStorage.getItem("mastiha.admin.locale") === "en") setLocale("en"); } catch { /* ignore */ }
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }).catch(() => null);
    if (response?.ok) { window.location.reload(); return; }
    setBusy(false);
    setError(response?.status === 401 ? c.login.wrong : response?.status === 429 ? c.login.busy : c.login.error);
  };

  return <main className="admin-gate">
    <form onSubmit={submit} className="admin-gate__card">
      <div className="admin-gate__brand">
        {/* eslint-disable-next-line @next/next/no-img-element -- the site's own vector mark */}
        <img src="/icon.svg" alt="" width={28} height={28} />
        <span>{c.property}</span>
      </div>
      <h1>{c.login.title}</h1>
      <p>{c.login.body}</p>
      <label htmlFor="admin-password">{c.login.password}</label>
      <input id="admin-password" name="password" type="password" autoComplete="current-password" required autoFocus disabled={busy} />
      {error && <p className="admin-gate__error" role="alert">{error}</p>}
      <button type="submit" disabled={busy}>{c.login.submit}</button>
      <button type="button" className="admin-gate__locale" onClick={() => setLocale(locale === "el" ? "en" : "el")}>{locale === "el" ? "English" : "Ελληνικά"}</button>
    </form>
  </main>;
}
