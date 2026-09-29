/** Optional public contact channels, set per deployment. Nothing is guessed from the property name. */
export type ContactChannels = { facebook: string | null; instagram: string | null; whatsapp: string | null; email: string | null };

function profile(value: string | undefined, hosts: readonly string[]): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && !url.username && !url.password && hosts.includes(url.hostname) && url.pathname !== "/" ? url.href : null;
  } catch { return null; }
}

export function getContactChannels(): ContactChannels {
  const phone = process.env.MASTIHA_WHATSAPP_NUMBER?.replace(/[+\s()-]/g, "") ?? "";
  const email = process.env.MASTIHA_SUPPORT_EMAIL?.trim() ?? "";
  return {
    facebook: profile(process.env.MASTIHA_FACEBOOK_URL, ["facebook.com", "www.facebook.com", "m.facebook.com"]),
    instagram: profile(process.env.MASTIHA_INSTAGRAM_URL, ["instagram.com", "www.instagram.com"]),
    whatsapp: /^[1-9]\d{7,14}$/.test(phone) ? `https://wa.me/${phone}` : null,
    email: /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ? email : null,
  };
}
