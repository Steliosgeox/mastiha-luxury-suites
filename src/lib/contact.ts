export type ContactChannels = { facebook: string | null; instagram: string | null; whatsapp: string | null; email: string | null; handoffEnabled: boolean };
function profile(value: string | undefined, hosts: readonly string[]): string | null {
  if (!value?.trim()) return null;
  try { const u = new URL(value.trim()); return u.protocol === 'https:' && !u.username && !u.password && hosts.includes(u.hostname) && u.pathname !== '/' ? u.href : null; } catch { return null; }
}
/** Called only on the server. Never guesses an account from the property name. */
export function getContactChannels(): ContactChannels {
  const phone = process.env.MASTIHA_WHATSAPP_NUMBER?.replace(/[+\s()-]/g, '') ?? '';
  const email = process.env.MASTIHA_SUPPORT_EMAIL?.trim() ?? '';
  return {
    facebook: profile(process.env.MASTIHA_FACEBOOK_URL, ['facebook.com', 'www.facebook.com', 'm.facebook.com']),
    instagram: profile(process.env.MASTIHA_INSTAGRAM_URL, ['instagram.com', 'www.instagram.com']),
    whatsapp: /^[1-9]\d{7,14}$/.test(phone) ? `https://wa.me/${phone}` : null,
    email: /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ? email : null,
    handoffEnabled: process.env.MASTIHA_HANDOFF_ENABLED === 'true' && Boolean(process.env.MASTIHA_SUPPORT_WEBHOOK_URL && process.env.MASTIHA_SUPPORT_WEBHOOK_TOKEN),
  };
}
