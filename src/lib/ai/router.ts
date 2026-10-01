import { SITE_URL } from "@/lib/site";

/*
  Every model call goes through here. Adapted from Elite Memoriz's aiRouter
  (docs/AI_ROUTING.md there): Mastiha chooses the model for each call, one at a time,
  down a chain of free routes whose endpoints keep nothing and do not train on what guests
  write. A remote router never picks a model for us, so every answer is attributable to
  the model that wrote it.

  What moves the request to the next model: a timeout, 429, a provider error, an empty
  or cut-off answer, or an answer the caller rejects. When the chain is exhausted the
  caller answers from the property guide instead, so a guest always gets a reply.
*/

export type Provider = "openrouter" | "cloudflare";
export type Candidate = Readonly<{ provider: Provider; model: string; tier: "free" | "paid" }>;
export type RouteMessage = Readonly<{ role: "system" | "user" | "assistant"; content: string }>;
export type Outcome = "ok" | "timeout" | "rate_limited" | "provider_error" | "invalid" | "empty";

/*
  The free routes, chosen 2026-10-01 by reading their Greek answers to the same questions
  (scripts/ai-eval.mts) rather than by benchmark:
  1. OpenRouter, Qwen 3.8 27B via ModelRun: zero-data-retention endpoint, the strongest of
     them on Elite Memoriz's Greek cases, but its shared free pool is often rate-limited
     upstream; the circuit below skips it while it is.
  2. Cloudflare Workers AI, Mistral Small 3.1 24B: correct Greek place names and grammar,
     invented nothing; about 100 of the 10,000 free daily neurons an answer. Cloudflare
     does not keep or train on prompts. (Qwen3 30B there invented distances; Llama 3.3 70B
     got Greek articles wrong; gpt-oss-120b returned noise.)
  3. OpenRouter, Ling 3.0 Flash via Novita: zero-data-retention and quick, weaker Greek.
*/
export const DEFAULT_ROUTE = [
  "openrouter:qwen/qwen3.8-27b:free",
  "cloudflare:@cf/mistralai/mistral-small-3.1-24b-instruct",
  "openrouter:inclusionai/ling-3.0-flash-sante:free",
].join(",");

/** OpenRouter's account-wide free allowance is 20 a minute; stay below it. */
export const FREE_PER_MINUTE = 15;
/** 50 free OpenRouter requests a day until $10 of credit has been bought, 1,000 after. */
const DEFAULT_FREE_PER_DAY = 45;
/** Left unclaimed, because the remaining count is up to 30 s old. */
const FREE_RESERVE = 3;
/** Of Cloudflare's 10,000 free neurons a day, in tenths; a margin stays unused. */
export const CLOUDFLARE_DAILY_DECINEURONS = 90_000;
const TIMEOUT_MS = { free: 9_000, paid: 15_000 } as const;
const DEADLINE_MS = 22_000;
const MIN_ATTEMPT_MS = 2_000;
/** A model that failed this often in two minutes is skipped until it recovers. */
export const CIRCUIT_FAILURES = 3;

export type RouteState = Readonly<{
  freeLastMinute: number;
  freeToday: number;
  failing: ReadonlySet<string>;
  /** Free requests OpenRouter says the account has left today; null when unknown. */
  freeRemaining?: number | null;
  /** Cloudflare neurons used today, in tenths. */
  cloudflareToday?: number;
}>;
export type RouteRecord = Readonly<{
  candidate: Candidate; depth: number; outcome: Outcome; status: number | null; latencyMs: number;
  inputTokens: number | null; outputTokens: number | null; neurons: number | null;
}>;
/** Shared counters (Redis in production), so every server instance respects the same limits. */
export type RouteLedger = Readonly<{ state(candidates: readonly Candidate[]): Promise<RouteState>; record(entry: RouteRecord): Promise<void> }>;

export type RouteRequest = Readonly<{
  messages: readonly RouteMessage[];
  maxTokens: number;
  temperature: number;
  /** False sends the request to the next model. */
  accept?: (content: string) => boolean;
  signal?: AbortSignal;
}>;
export type RouteResult = Readonly<{ content: string; candidate: Candidate; depth: number }>;

export const routeKey = (candidate: Candidate) => `${candidate.provider}:${candidate.model}`;

const PROVIDERS = new Set<string>(["openrouter", "cloudflare"]);
/** `provider:model` entries, comma-separated; a model id may itself contain a colon (and Cloudflare's an @). */
export function parseRoute(text: string): Candidate[] {
  return text.split(",").map(entry => entry.trim()).filter(Boolean).flatMap(entry => {
    const at = entry.indexOf(":");
    const provider = entry.slice(0, at), model = entry.slice(at + 1).trim();
    if (at < 1 || !PROVIDERS.has(provider) || !/^@?[\w./:-]{1,120}$/.test(model)) return [];
    // Cloudflare's daily allocation is free; OpenRouter marks its free variants.
    const tier = provider === "cloudflare" || model.endsWith(":free") ? "free" : "paid";
    return [{ provider, model, tier } as Candidate];
  });
}

const openRouterKey = (env: NodeJS.ProcessEnv) => env.OPENROUTER_API_KEY?.trim() || "";
const openRouterBase = (env: NodeJS.ProcessEnv) => (env.OPENROUTER_BASE_URL?.trim() || "https://openrouter.ai/api/v1").replace(/\/$/, "");
const cloudflare = (env: NodeJS.ProcessEnv) => ({ account: env.CLOUDFLARE_AI_ACCOUNT_ID?.trim() || "", token: env.CLOUDFLARE_AI_TOKEN?.trim() || "" });

function reachable(provider: Provider, env: NodeJS.ProcessEnv) {
  if (provider === "openrouter") return Boolean(openRouterKey(env));
  const { account, token } = cloudflare(env);
  return Boolean(account && token);
}

/** The chain this deployment can call. `MASTIHA_AI_ROUTE` overrides it; `MASTIHA_AI=off` empties it. */
export function candidates(env: NodeJS.ProcessEnv = process.env): Candidate[] {
  if (env.MASTIHA_AI === "off") return [];
  return parseRoute(env.MASTIHA_AI_ROUTE?.trim() || DEFAULT_ROUTE).filter(candidate => reachable(candidate.provider, env));
}

export const aiConfigured = (env: NodeJS.ProcessEnv = process.env) => candidates(env).length > 0;

/*
  The account's own free allowance, as OpenRouter counts it: read rather than configured,
  so buying credit takes effect without a deploy. Cached per instance for 30 s.
*/
let allowance: { remaining: number; until: number } | null = null;
export async function freeAllowanceRemaining(env: NodeJS.ProcessEnv = process.env): Promise<number | null> {
  if (allowance && allowance.until > Date.now()) return allowance.remaining;
  const key = openRouterKey(env);
  if (!key) return null;
  try {
    const response = await fetch(`${openRouterBase(env)}/key`, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(2_000), cache: "no-store" });
    const body = await response.json() as { data?: { free_model_daily_requests?: { remaining?: unknown } } };
    const remaining = Number(body.data?.free_model_daily_requests?.remaining);
    if (!response.ok || !Number.isSafeInteger(remaining) || remaining < 0) return null;
    allowance = { remaining, until: Date.now() + 30_000 };
    return remaining;
  } catch { return null; }
}

/** Whether a candidate may be tried now, given the shared counters. */
export function admitted(candidate: Candidate, state: RouteState, env: NodeJS.ProcessEnv = process.env): boolean {
  if (state.failing.has(routeKey(candidate))) return false;
  if (candidate.provider === "cloudflare") return (state.cloudflareToday ?? 0) < CLOUDFLARE_DAILY_DECINEURONS;
  if (candidate.tier !== "free") return true;
  if (state.freeLastMinute >= FREE_PER_MINUTE) return false;
  if (typeof state.freeRemaining === "number") return state.freeRemaining > FREE_RESERVE;
  const perDay = Number(env.MASTIHA_AI_FREE_PER_DAY ?? DEFAULT_FREE_PER_DAY);
  return state.freeToday < (Number.isSafeInteger(perDay) && perDay >= 0 ? perDay : DEFAULT_FREE_PER_DAY);
}

type Payload = {
  choices?: { finish_reason?: unknown; message?: { content?: unknown } }[];
  usage?: { prompt_tokens?: unknown; completion_tokens?: unknown; neurons?: unknown };
};

const text = (content: unknown): string => typeof content === "string" ? content
  : Array.isArray(content) ? content.map(part => (part && typeof part === "object" && "text" in part ? String((part as { text: unknown }).text) : "")).join("") : "";
const tokens = (value: unknown) => (Number.isSafeInteger(Number(value)) && Number(value) >= 0 ? Number(value) : null);

/*
  Qwen 3 thinks before it answers unless told not to. OpenRouter's `reasoning` field handles
  it there; elsewhere the switch is `/no_think` in the system prompt. Without it Cloudflare's
  Qwen3 spent its budget thinking and returned no text (Elite Memoriz, 2026-09-29).
*/
function messagesFor(candidate: Candidate, messages: readonly RouteMessage[]): readonly RouteMessage[] {
  if (candidate.provider === "openrouter" || !/qwen3/i.test(candidate.model)) return messages;
  return messages.map((message, index) => (index === 0 && message.role === "system" ? { ...message, content: `${message.content}\n\n/no_think` } : message));
}

async function call(candidate: Candidate, request: RouteRequest, timeoutMs: number, env: NodeJS.ProcessEnv) {
  const timeout = AbortSignal.timeout(timeoutMs);
  const openrouter = candidate.provider === "openrouter";
  const { account, token } = cloudflare(env);
  const url = openrouter ? `${openRouterBase(env)}/chat/completions` : `https://api.cloudflare.com/client/v4/accounts/${account}/ai/v1/chat/completions`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openrouter ? openRouterKey(env) : token}`,
      ...(openrouter ? { "HTTP-Referer": SITE_URL, "X-Title": "Mastiha Luxury Suites" } : {}),
    },
    body: JSON.stringify({
      model: candidate.model,
      messages: messagesFor(candidate, request.messages),
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      // Only endpoints that keep nothing and never train on it. The same model's other
      // providers may serve it under the same terms; never another model.
      ...(openrouter ? { provider: { zdr: true, data_collection: "deny", allow_fallbacks: true }, reasoning: { effort: "minimal", exclude: true } } : {}),
    }),
    signal: request.signal ? AbortSignal.any([request.signal, timeout]) : timeout,
    cache: "no-store",
  });
}

/** Asks down the chain until one model gives an acceptable answer. */
export async function routeChat(request: RouteRequest, ledger: RouteLedger, env: NodeJS.ProcessEnv = process.env): Promise<RouteResult> {
  const chain = candidates(env);
  if (!chain.length) throw new Error("No model is configured.");
  let state: RouteState = { freeLastMinute: 0, freeToday: 0, failing: new Set() };
  try { state = await ledger.state(chain); }
  catch { console.warn("[ai] routing counters unavailable; trying the chain without them"); }
  if (chain.some(candidate => candidate.provider === "openrouter" && candidate.tier === "free")) state = { ...state, freeRemaining: await freeAllowanceRemaining(env) };

  const started = Date.now();
  let depth = 0;
  for (const candidate of chain) {
    request.signal?.throwIfAborted();
    if (!admitted(candidate, state, env)) continue;
    const remaining = DEADLINE_MS - (Date.now() - started);
    if (remaining < MIN_ATTEMPT_MS) break;
    const hopStarted = Date.now();
    let outcome: Outcome = "provider_error", status: number | null = null, payload: Payload | null = null, content = "";
    try {
      const response = await call(candidate, request, Math.min(TIMEOUT_MS[candidate.tier], remaining), env);
      status = response.status;
      if (response.status === 429) outcome = "rate_limited";
      else if (response.ok) {
        payload = await response.json() as Payload;
        const first = payload.choices?.[0];
        content = text(first?.message?.content).trim();
        outcome = !content ? "empty"
          // Prose the length limit cut off is not an answer; the next model gets the question.
          : first?.finish_reason === "length" || (request.accept && !request.accept(content)) ? "invalid" : "ok";
      }
    } catch (error) {
      outcome = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError") ? "timeout" : "provider_error";
    }
    const neurons = Number(payload?.usage?.neurons);
    await ledger.record({
      candidate, depth, outcome, status, latencyMs: Date.now() - hopStarted,
      inputTokens: tokens(payload?.usage?.prompt_tokens), outputTokens: tokens(payload?.usage?.completion_tokens),
      neurons: Number.isFinite(neurons) && neurons >= 0 ? neurons : null,
    }).catch(() => console.warn("[ai] call not recorded"));
    request.signal?.throwIfAborted();
    if (outcome === "ok") return { content, candidate, depth };
    console.warn("[ai] model passed over", { route: routeKey(candidate), outcome, status });
    depth++;
  }
  throw new Error("No model gave an answer.");
}
