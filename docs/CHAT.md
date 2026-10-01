# Chat: the assistant, Athina and the admin portal

Guests chat from a floating assistant on every page. The assistant answers from the
website's own facts; when a guest asks for Athina (or presses **Μιλήστε με την Αθηνά**) the
conversation goes to her inbox at `/admin` and her phone rings. Every conversation, with the
assistant or with Athina, is kept for 30 days after its last message, then deleted.

Both interfaces are ports of Elite Memoriz's: the guest chat is its `FloatingAssistant`
(`chatbot.css`), the admin portal its host workroom (`host-workspace.css`) with the Elite
Assistant thread (`EliteAssistant.tsx`, assistant-ui) and its rail artwork.

## How a message travels

```
guest ─► /api/chat/conversations[/id/messages]
            │ stored (Redis, 30 days)        │ "talk to Athina", or asked for in words
            ▼                                ▼
      handled by the assistant          handled by Athina: inbox + Web Push to her phone
            │
            ├─ a suggested question ──────────────► property guide (instant, exact, free)
            ├─ asked before, same wording ────────► answer cache (7 days)
            └─ anything else ─► model chain (src/lib/ai/router.ts)
                                  1. OpenRouter  qwen/qwen3.8-27b:free         zero data retention
                                  2. Cloudflare  @cf/mistralai/mistral-small-3.1-24b-instruct
                                  3. OpenRouter  inclusionai/ling-3.0-flash-sante:free  zero data retention
                                  4. property guide, if every model failed
```

- **Grounded.** The model gets `src/lib/ai/persona.ts` (the instructions) and
  `src/lib/ai/knowledge.ts` (the facts), which is generated from the same content files the
  website shows. It may not invent prices, times, distances or services; prices and dates
  are only on Airbnb and Booking.com. A reply that needs Athina ends with `[[HOST]]`, which
  the server removes and turns into a **Μιλήστε με την Αθηνά** button.
- **Checked.** Links outside the facts are removed, ours become named links, a Greek
  question must get a Greek answer, instructions must not leak; a reply that fails goes to
  the next model.
- **Free, and private.** Only free routes, and only providers that keep nothing: OpenRouter
  with `provider: { zdr: true, data_collection: "deny" }` on every call (the tests refuse
  anything else), and Cloudflare Workers AI, which does not keep or train on prompts.
- **Limits that hold across instances**, in Redis: OpenRouter's free allowance (read live
  from `/api/v1/key`, 1,000 a day on this account, 15 a minute kept), Cloudflare's 10,000
  free neurons a day (about 100 answers), and a circuit that skips a model after 3 failures
  in 2 minutes. OpenRouter's free Qwen is often rate-limited upstream at busy hours; the
  chain simply moves on.
- **Chosen by reading Greek, not benchmarks.** `npm run ai:eval` asks 13 real questions
  (Greek, English, Turkish, a price, an injection, a follow-up) through the live chain and
  prints every answer. On Cloudflare, Qwen3 30B invented distances, Llama 3.3 70B got Greek
  articles wrong and gpt-oss-120b returned noise; Mistral Small wrote correct Greek.

## Settings (Vercel → Project → Settings → Environment Variables)

| Variable | Status | Purpose |
| --- | --- | --- |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | set by the Upstash integration | The chat database (Upstash Redis, Frankfurt, free plan). Without it the assistant still answers, but nothing is stored and `/admin` explains it isn't connected. |
| `OPENROUTER_API_KEY` | set (Sensitive) | Models 1 and 3. |
| `CLOUDFLARE_AI_ACCOUNT_ID`, `CLOUDFLARE_AI_TOKEN` | set (Sensitive) | Model 2. |
| `MASTIHA_ADMIN_PASSWORD` | optional | Replaces the admin password (see below). |
| `MASTIHA_AI_ROUTE` | optional | Overrides the chain: `provider:model`, comma-separated. |
| `MASTIHA_AI=off` | optional | Kill switch: the property guide answers alone. |

Nothing else is needed. The server generates its own session-signing key and Web Push
(VAPID) keys the first time it needs them and keeps them in the chat database
(`src/lib/chat/secrets.ts`); `MASTIHA_ADMIN_SECRET`, `MASTIHA_VAPID_PUBLIC_KEY` and
`MASTIHA_VAPID_PRIVATE_KEY` override them if ever set.

**The admin password.** The repository is public, so only a one-way scrypt hash of it is
committed (`src/lib/chat/credentials.ts`; a 93-bit random password, out of reach of offline
guessing). To change it, either set `MASTIHA_ADMIN_PASSWORD` in Vercel, or run
`npm run chat:password` and commit the new hash. Changing it signs every device out.

Functions run in Frankfurt (`fra1`), next to the database.

## Για την Αθηνά

**Είσοδος:** η διεύθυνση του site με `/admin` στο τέλος, και ο κωδικός.

- **Κέντρο ελέγχου:** όσα περιμένουν απάντηση, οι συζητήσεις της ημέρας και του μήνα, και πώς τα πάει ο αυτόματος βοηθός.
- **Χρειάζονται εσάς:** οι επισκέπτες που ζήτησαν να σας μιλήσουν και περιμένουν απάντηση.
- **Όλες οι συζητήσεις / Με τον βοηθό:** όλα όσα γράφτηκαν στο chat, και όσα απαντά μόνος του ο βοηθός.
- Αν γράψετε σε μια συζήτηση του βοηθού, την αναλαμβάνετε εσείς. **Επιστροφή στον βοηθό** τη δίνει πίσω. **Ολοκλήρωση** την κλείνει· αν ο επισκέπτης ξαναγράψει, ανοίγει ξανά.
- **Διαγραφή** τη σβήνει αμέσως (όταν το ζητήσει ο επισκέπτης). Όλες σβήνονται αυτόματα 30 ημέρες μετά το τελευταίο μήνυμα.

**Ειδοποιήσεις στο κινητό**

- **iPhone:** ανοίξτε στο Safari το `/admin` και συνδεθείτε. Πατήστε **Κοινοποίηση** → **Προσθήκη στην οθόνη Αφετηρίας**. Ανοίξτε το «Mastiha» από την οθόνη Αφετηρίας → **Ρυθμίσεις** → **Ενεργοποίηση ειδοποιήσεων** → **Να επιτρέπεται**.
- **Android:** ανοίξτε στο Chrome το `/admin`, συνδεθείτε, **Ρυθμίσεις** → **Ενεργοποίηση ειδοποιήσεων** → **Να επιτρέπεται**.

Όταν ένας επισκέπτης ζητήσει να σας μιλήσει ή σας γράψει, έρχεται ειδοποίηση· πατώντας την ανοίγει η συζήτηση.

## Code

| Piece | Where |
| --- | --- |
| Guest chat (Elite Memoriz FloatingAssistant) | `src/components/chat` (`FloatingAssistant.tsx`, `useConcierge.ts`, `chatbot.css`) |
| Admin portal (Elite Memoriz workroom) | `src/app/admin`, `src/components/admin` (`workroom.css`), `public/admin`, `public/admin-sw.js` |
| Assistant | `src/lib/ai` (`concierge.ts`, `router.ts`, `persona.ts`, `knowledge.ts`), `src/lib/assistant/guide.ts` |
| Conversations, auth, push, storage | `src/lib/chat` |
| API | `src/app/api/chat`, `src/app/api/admin`, `src/app/api/assistant/chat` (no database) |
| Tests | `tests/chat.spec.ts` with `tests/mock-openrouter.mjs` |

- The guest's browser keeps the conversation id and a random token in `localStorage`; the
  server stores only the token's SHA-256.
- The guest chat polls only while Athina has the conversation (3 s open, 25 s in the
  background); the admin portal every 3 s while visible, 20 s hidden, and most of those
  polls cost one Redis read. Well inside Upstash's free 500,000 commands a month.
- Rate limits (new conversations, messages, model questions, sign-in attempts) live in Redis.
- `MASTIHA_CHAT_STORE=memory` keeps everything in the server's memory, for local development
  and the tests; it is refused on production deployments.
