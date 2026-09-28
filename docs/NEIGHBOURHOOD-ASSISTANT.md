# Mastiha neighbourhood and assistant release

## What changed

* A typed owner-supplied directory of 13 places and approximate distances, translated category labels, accessible filters and 10 exact owner-supplied Google Maps links. The two bakeries and public parking without a supplied link deliberately have no invented pin. Opening hours and route times are not invented.
* The **active** FloatingAssistant from `Steliosgeox/elite-memoriz-private`, pinned at `83c7691513fcf3f61d5787fe813046cfb1380931`. Original chatbot.css, palette, 340px welcome / 500px conversation layout, fullscreen mobile state, Lucide icons, Commissioner font, message renderer and glass-lens asset. No private donor backend, contacts, billing, authentication, customer data or business prompts were imported. PROVENANCE.json fingerprints the original stylesheet. The hosting adapter only handles Next routing, copy, safe-area/dock placement, focus and scrolling.
* A grounded **property guide**, not a trained AI. It reads the same typed property and neighbourhood data as the page. Unknowns, prices, availability, bookings and staff response times are never fabricated. No external model is called. Training and provider integration remain future work.
* Family images: import the three gallery-confirmed Booking.com images, preserve the existing layout/photo IDs and bilingual captions, retain source URLs and original/output SHA-256s. Files are self-hosted WebPs; no runtime scraping or hotlinking. The gallery presented 62 photos during this inspection; only the three family matches are imported.

## Contact setup — owner confirmation required

No official social URLs, WhatsApp number or representative destination were supplied. None are guessed or copied from Elite Memoriz. Set confirmed values and redeploy:

```
MASTIHA_FACEBOOK_URL=https://www.facebook.com/OWNER_CONFIRMED_PROFILE
MASTIHA_INSTAGRAM_URL=https://www.instagram.com/OWNER_CONFIRMED_PROFILE/
MASTIHA_WHATSAPP_NUMBER=OWNER_CONFIRMED_E164_DIGITS
MASTIHA_SUPPORT_EMAIL=OWNER_CONFIRMED_ADDRESS
```

Invalid/unset social channels are not rendered as dead links. The footer contact action opens the assistant. Representative mode always exposes the existing real Airbnb and Booking.com links; WhatsApp/email appear only when configured. A mailto or WhatsApp click is not represented as a sent message.

## Human handoff contract

Direct delivery is **off by default**. `/api/assistant/handoff` refuses unconfigured requests before reading personal details. To enable later:

```
MASTIHA_HANDOFF_ENABLED=true
MASTIHA_SUPPORT_WEBHOOK_URL=https://YOUR_OWN_DURABLE_RECEIVER/...
MASTIHA_SUPPORT_WEBHOOK_TOKEN=SERVER_ONLY_SHARED_SECRET
```

The receiver must authenticate the bearer token, apply durable/shared rate limits and bot protection, persist/enqueue the request transactionally, deduplicate `Idempotency-Key`, notify the actual assigned team, and return JSON `{ "accepted": true, "reference": "ticket-id" }` only after durable acceptance. Timeout or nonconforming responses never produce a success message. Retries reuse the client request ID. There is no invented live-agent presence or response-time guarantee. Before enabling, confirm the operator's privacy/contact details and retention policy.

Only name, reply email, message, locale, consent version and request ID are sent. The full guide transcript is NOT attached or stored. No cookies/localStorage conversation persistence, analytics message capture or training use is enabled. No payment/passport data should be submitted.

## AI provider boundary

`AssistantProvider` and `HandoffGateway` are separate typed contracts. Current provider: `propertyGuide`. A later model provider must remain server-only, use approved versioned knowledge and citations, preserve uncertainty, forbid autonomous bookings/payments, and keep human escalation explicit. Add verified knowledge/evaluations and adversarial tests before enabling it. This release does not claim RAG, model training or live AI inference.

Routes enforce same-origin browser access, JSON schemas/roles, request size caps, timeouts, no-store responses and a bounded in-memory per-instance rate guard. **That guard is not distributed rate limiting on Vercel.** A durable gateway/WAF/Redis limiter and idempotent queue are deployment prerequisites for open public handoff. No user-supplied destination URL is fetched and no private provider credential enters the browser.

## Verification

Run npm ci, check:ui, typecheck, lint, test:unit, build and test:e2e. Additional tests cover owner links/distances, no invented social accounts, guide knowledge/provenance, API malformed/cross-origin/size guards, disabled delivery, donor CSS fingerprint, assistant keyboard/focus/scroll isolation and 320/390/1440px layouts in Chromium and WebKit. Automated WebKit is not a physical iPhone test.

Social brand paths: Simple Icons CC0, verified Facebook blob f66767e46165f562134ca2c2e3d4bea8f37fb1ac and Instagram blob c0e86b0bfc7b902c485699953dee878f290f575b. Brand marks do not imply endorsement.

API routing: next-intl middleware excludes /api. The locale stays in the validated JSON request, so POSTs are never redirected to a translated HTML page. Browser tests exercise the actual endpoints in all three languages.
