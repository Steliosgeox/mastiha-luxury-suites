"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ADMIN_COPY, type AdminLocale } from "@/content/admin-copy";
import s from "./admin.module.css";

export function Login() {
  const [locale, setLocale] = useState<AdminLocale>("el");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const c = ADMIN_COPY[locale].login;

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
    setError(response?.status === 401 ? c.wrong : response?.status === 429 ? c.busy : c.error);
  };

  return <main className={s.login}>
    <form onSubmit={submit}>
      <span className={s.loginMark} aria-hidden="true">M</span>
      <h1>{c.title}</h1>
      <p>{c.body}</p>
      <label>{c.password}<input name="password" type="password" autoComplete="current-password" required autoFocus disabled={busy} /></label>
      {error && <p className={s.loginError} role="alert">{error}</p>}
      <button type="submit" disabled={busy}>{c.submit}</button>
      <button type="button" className={s.loginLocale} onClick={() => setLocale(locale === "el" ? "en" : "el")}>{locale === "el" ? "English" : "Ελληνικά"}</button>
    </form>
  </main>;
}
