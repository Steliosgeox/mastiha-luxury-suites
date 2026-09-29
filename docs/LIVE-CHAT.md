# Live chat: setup and daily use

Guests talk to the automated assistant on the site. When they tap **«Μιλήστε με την Αθηνά»**
the conversation, with the questions they already asked, goes to the host's inbox at
**`/admin`**, and her replies appear in the guest's chat window.

Until the steps below are done, the site works as before: the assistant answers and
"Talk to Athina" shows the Airbnb and Booking.com links instead.

## One-time setup (about 10 minutes)

1. **Storage (free).** In Vercel open the project → **Storage** → **Create Database** →
   **Upstash for Redis** (free plan) → connect it to this project. Vercel adds
   `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
   (A store created directly at upstash.com works too: set `UPSTASH_REDIS_REST_URL` and
   `UPSTASH_REDIS_REST_TOKEN` instead.)
2. **Admin password.** Project → **Settings → Environment Variables**, add
   `MASTIHA_ADMIN_PASSWORD` (at least 8 characters, ideally a long passphrase).
3. **Keys for sign-in and notifications.** On a computer with the project run
   `npm run chat:keys` and add the three printed values the same way:
   `MASTIHA_ADMIN_SECRET`, `MASTIHA_VAPID_PUBLIC_KEY`, `MASTIHA_VAPID_PRIVATE_KEY`.
4. **Redeploy** (Deployments → ⋯ → Redeploy). Environment variables only apply to new deployments.

Optional: `MASTIHA_WHATSAPP_NUMBER` (digits with country code, e.g. `30694…`),
`MASTIHA_SUPPORT_EMAIL`, `MASTIHA_INSTAGRAM_URL` and `MASTIHA_FACEBOOK_URL` show those
channels in the footer and in the chat fallback. `MASTIHA_VAPID_SUBJECT`
(`mailto:you@example.com`) identifies you to push services; the site URL is used otherwise.

## Για την Αθηνά: ειδοποιήσεις στο κινητό

**iPhone**
1. Ανοίξτε στο Safari τη διεύθυνση του site με `/admin` στο τέλος και συνδεθείτε.
2. Πατήστε **Κοινοποίηση** → **Προσθήκη στην οθόνη Αφετηρίας**.
3. Ανοίξτε το «Mastiha» από την οθόνη Αφετηρίας και πατήστε **Ειδοποιήσεις στη συσκευή** → **Να επιτρέπεται**.

**Android**
1. Ανοίξτε στο Chrome τη διεύθυνση με `/admin` και συνδεθείτε.
2. Πατήστε **Ειδοποιήσεις στη συσκευή** → **Να επιτρέπεται**. (Προαιρετικά: μενού ⋮ → **Εγκατάσταση εφαρμογής**.)

Όταν ένας επισκέπτης γράψει, έρχεται ειδοποίηση και, πατώντας την, ανοίγει η συζήτηση.
Όσο το inbox είναι ανοιχτό σε υπολογιστή, ακούγεται και ένας διακριτικός ήχος.

## In the inbox

- **Ανοιχτές / Κλειστές / Όλες** filter the list; the search box matches names, emails and messages.
- A green dot means the guest has the chat open right now.
- **Κλείσιμο συζήτησης** marks it done. If the guest writes again, it reopens by itself.
- **Διαγραφή** removes the conversation permanently (use it when a guest asks).
- Conversations are deleted automatically 90 days after the last message.

## How it works

| Piece | Where |
| --- | --- |
| Guest widget (built on [assistant-ui](https://github.com/assistant-ui/assistant-ui)) | `src/components/chat` |
| Admin portal | `src/app/admin`, `src/components/admin`, `public/admin-sw.js` |
| API | `src/app/api/chat`, `src/app/api/admin` |
| Storage, auth, push | `src/lib/chat` |
| Automated answers | `src/lib/assistant/guide.ts` (property data only, no AI model) |

- The guest's browser keeps the conversation id and a random token in `localStorage`;
  the server stores only the token's SHA-256.
- The host signs in with the password and gets a signed, HttpOnly cookie for 30 days.
  Changing `MASTIHA_ADMIN_SECRET` (or the password, if no secret is set) signs everyone out.
- The guest widget polls every 3 s while open and every 20 s in the background; the inbox
  every 2.5 s while visible. Hidden tabs don't poll. For one apartment this stays well
  inside Upstash's free plan.
- Rate limits (conversation starts, messages, sign-in attempts) live in Redis, so they hold
  across Vercel instances.
- `MASTIHA_CHAT_STORE=memory` keeps everything in the server's memory. It exists for local
  development and the automated tests and is refused on production deployments.
