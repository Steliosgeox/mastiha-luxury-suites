import { createHash } from "node:crypto";
import { CHAT_COPY } from "@/content/chat-copy";
import type { StayLocale } from "@/content/stay-copy";
import { propertyGuide } from "@/lib/assistant/guide";
export { asksForHost } from "@/lib/assistant/guide";
import type { ChatMessage } from "@/lib/assistant/contracts";
import type { Kv } from "@/lib/chat/store";
import { LIMITS, type ReplySource } from "@/lib/chat/types";
import { ALLOWED_LINKS, knowledgeVersion } from "./knowledge";
import { HANDOFF_MARK, PERSONA_VERSION, systemPrompt } from "./persona";
import { aiConfigured, CIRCUIT_FAILURES, routeChat, routeKey, type RouteLedger } from "./router";

/*
  The guest-facing assistant:

    suggested question  ──► property guide (instant, exact, costs nothing)
    anything else       ──► answer cache ──► free model chain (router.ts) ──► property guide
                                                     │
                                       cleaned: handoff mark read and removed,
                                       links outside the facts dropped,
                                       a Greek question must get a Greek answer

  Whatever happens upstream, the guest gets an answer.
*/

export type ConciergeReply = { reply: string; offersHost: boolean; source: ReplySource; model?: string; fallback?: boolean };

const day = () => new Date().toISOString().slice(0, 10);
const minute = () => Math.floor(Date.now() / 60_000);
const VERSION = knowledgeVersion(PERSONA_VERSION);
const CACHE_SECONDS = 7 * 24 * 60 * 60;
const STATS_SECONDS = 8 * 24 * 60 * 60;

/** The router's counters on the shared store: free calls a minute and a day, Cloudflare's neurons, failing routes. */
export function kvLedger(kv: Kv): RouteLedger {
  return {
    async state(chain) {
      const keys = chain.map(routeKey);
      const values = await kv.read([`ai:min:${minute()}`, `ai:day:${day()}`, `ai:cf:${day()}`, ...keys.map(key => `ai:fail:${key}`)]);
      return {
        freeLastMinute: Number(values[0] ?? 0),
        freeToday: Number(values[1] ?? 0),
        cloudflareToday: Number(values[2] ?? 0),
        failing: new Set(keys.filter((_, index) => Number(values[index + 3] ?? 0) >= CIRCUIT_FAILURES)),
      };
    },
    async record(entry) {
      const key = routeKey(entry.candidate);
      const work: Promise<unknown>[] = [kv.tally(`ai:calls:${day()}`, { [`${key}|${entry.outcome}`]: 1 }, STATS_SECONDS)];
      if (entry.candidate.provider === "openrouter" && entry.candidate.tier === "free") work.push(kv.bump(`ai:min:${minute()}`, 120), kv.bump(`ai:day:${day()}`, 2 * 24 * 60 * 60));
      if (entry.candidate.provider === "cloudflare" && entry.neurons) work.push(kv.bump(`ai:cf:${day()}`, 2 * 24 * 60 * 60, Math.ceil(entry.neurons * 10)));
      if (entry.outcome === "timeout" || entry.outcome === "rate_limited" || entry.outcome === "provider_error") work.push(kv.bump(`ai:fail:${key}`, 120));
      await Promise.all(work);
    },
  };
}

/** Replies by source today, for the admin dashboard. */
export const todayStats = (kv: Kv) => kv.tallies(`ai:stats:${day()}`);
const count = (kv: Kv, source: string) => kv.tally(`ai:stats:${day()}`, { [source]: 1 }, STATS_SECONDS).catch(() => undefined);

const normalize = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("en").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

/** The suggestion buttons in every language: their answers are already written. */
const SUGGESTED = new Set(Object.values(CHAT_COPY).flatMap(copy => [...copy.welcome.suggestions, ...copy.tags].map(normalize)));

const GREEK = /[Ͱ-Ͽἀ-῿]/g;
const greekShare = (text: string) => (text.match(GREEK)?.length ?? 0) / Math.max(1, text.replace(/[^\p{L}]/gu, "").length);

const LINK_HOSTS = new Set(["www.airbnb.com", "airbnb.com", "www.booking.com", "booking.com", "maps.app.goo.gl"]);
function linkAllowed(url: string) {
  if (ALLOWED_LINKS.has(url)) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && (LINK_HOSTS.has(parsed.hostname) || (parsed.hostname === "www.google.com" && parsed.pathname.startsWith("/maps")));
  } catch { return false; }
}

function linkLabel(url: string) {
  const host = new URL(url).hostname;
  return host.includes("airbnb") ? "Airbnb" : host.includes("booking") ? "Booking.com" : "Google Maps";
}

/** The model's text as the guest may see it, and whether it asked for Athina. */
export function cleanReply(content: string): { text: string; handoff: boolean } {
  let text = content.replace(/<think>[\s\S]*?(<\/think>|$)/gi, "").replace(/^\s*(assistant|βοηθός)\s*:\s*/i, "");
  const handoff = /\[\[\s*host\s*\]\]/i.test(text);
  // Markdown links: ours are set aside untouched, anyone else's keep only their label.
  const links: string[] = [];
  text = text.replace(/\[\[\s*host\s*\]\]/gi, "").replace(/\[([^\]\n]{1,120})\]\(([^)\s]+)\)/g, (_, label: string, url: string) => {
    if (!linkAllowed(url)) return label;
    links.push(`[${label}](${url})`);
    return `\u0000${links.length - 1}\u0000`;
  });
  // A bare address becomes a named link ("Airbnb https://…" → [Airbnb](…)), or goes if it is not ours.
  text = text.replace(/(?:(Airbnb|Booking\.com|Google Maps)\s*:?\s*)?(https?:\/\/[^\s)<>\u0000]+?)([.,;:!?]?)(?=\s|$|\))/g,
    (_, name: string | undefined, url: string, end: string) => (linkAllowed(url) ? `[${name ?? linkLabel(url)}](${url})${end}` : `${name ?? ""}${end}`));
  text = text.replace(/\u0000(\d+)\u0000/g, (_, index: string) => links[Number(index)])
    .replace(/[ \t]{2,}/g, " ").replace(/[ \t]+([.,;:!?])/g, "$1").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return { text, handoff };
}

/** An answer worth showing: present, not a leak of the instructions, and in Greek when asked in Greek. */
export function acceptable(content: string, question: string): boolean {
  const { text } = cleanReply(content);
  if (!text || text.length > 1600) return false;
  if (/how to answer:|FACTS|handoff mark|\{LANGUAGE\}/i.test(text) || text.includes(HANDOFF_MARK)) return false;
  if (greekShare(question) > 0.5 && greekShare(text) < 0.3) return false;
  return true;
}

async function fromGuide(locale: StayLocale, messages: ChatMessage[], kv: Kv, fallback: boolean): Promise<ConciergeReply> {
  const answer = await propertyGuide.answer({ locale, messages });
  await count(kv, fallback ? "fallback" : "guide");
  return { reply: answer.reply, offersHost: Boolean(answer.suggestHost), source: "guide", fallback };
}

export async function concierge({ locale, messages, kv }: { locale: StayLocale; messages: ChatMessage[]; kv: Kv }): Promise<ConciergeReply> {
  const question = messages.at(-1)?.content ?? "";
  if (!aiConfigured() || SUGGESTED.has(normalize(question))) return fromGuide(locale, messages, kv, false);

  // Only short, impersonal first questions are cached: no digits, no addresses.
  const cacheable = messages.length === 1 && question.length <= 140 && !/[\d@]/.test(question);
  const cacheKey = cacheable ? `ai:cache:${VERSION}:${locale}:${createHash("sha256").update(normalize(question)).digest("hex").slice(0, 32)}` : null;
  if (cacheKey) {
    const [cached] = await kv.read([cacheKey]).catch(() => [null]);
    if (cached) {
      await count(kv, "cache");
      return { ...JSON.parse(cached) as Omit<ConciergeReply, "source">, source: "cache" };
    }
  }

  try {
    const result = await routeChat({
      messages: [{ role: "system", content: systemPrompt(locale) }, ...messages.slice(-LIMITS.history)],
      maxTokens: 500,
      temperature: 0.3,
      accept: content => acceptable(content, question),
    }, kvLedger(kv));
    const { text, handoff } = cleanReply(result.content);
    const reply: ConciergeReply = { reply: text, offersHost: handoff, source: "ai", model: routeKey(result.candidate) };
    await count(kv, "ai");
    if (cacheKey) await kv.put(cacheKey, JSON.stringify({ reply: text, offersHost: handoff, model: reply.model }), CACHE_SECONDS).catch(() => undefined);
    return reply;
  } catch {
    return fromGuide(locale, messages, kv, true);
  }
}
