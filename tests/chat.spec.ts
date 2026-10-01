import { expect, test, type Page } from "@playwright/test";
import { MOCK_OPENROUTER } from "../playwright.config";

const password = process.env.MASTIHA_ADMIN_PASSWORD ?? "test-password-123";
const json = { "Content-Type": "application/json" };

test.describe("concierge", () => {
  test("suggested questions come from the property guide; others from the model, cleaned", async ({ request }) => {
    const ask = async (locale: string, content: string) => {
      const response = await request.post("/api/assistant/chat", { headers: json, data: { locale, messages: [{ role: "user", content }] } });
      expect(response.ok()).toBe(true);
      return await response.json() as { reply: string; offersHost: boolean; source: string };
    };
    const parking = await ask("el", "Υπάρχει πάρκινγκ;");
    expect(parking.source).toBe("guide");
    expect(parking.reply).toContain("δωρεάν ιδιωτικό πάρκινγκ");
    expect((await ask("el", "Έχετε κούνια για μωρό;")).reply).toContain("κούνια");

    // A unique question (letters only: questions with digits are never cached).
    const unique = Array.from({ length: 6 }, () => "αβγδεζηθικλμνξοπρστυφχψω"[Math.floor(Math.random() * 24)]).join("");
    const wifi = await ask("el", `Έχει wifi το σπίτι; ${unique}`);
    expect(wifi.source).toBe("ai");
    // The same first question again is answered from the cache, without a model call.
    expect((await ask("el", `Έχει wifi το σπίτι; ${unique}`)).source).toBe("cache");
    expect(wifi.reply).toContain("Wi-Fi");
    // Links outside the facts lose their address; ours become named links.
    expect(wifi.reply).not.toContain("evil.example");
    expect(wifi.reply).toContain("[Airbnb](https://www.airbnb.com/rooms/1368953469779774276)");

    const airport = await ask("el", "Πόσο απέχει το αεροδρόμιο;");
    expect(airport.offersHost).toBe(true);
    expect(airport.reply).not.toContain("[[HOST]]");
  });

  test("a rate-limited model hands over to the next one", async ({ request }) => {
    // Digits keep the question out of the answer cache, so each browser's run reaches the models.
    const question = `Δοκιμή ${Date.now()}${Math.floor(Math.random() * 1000)}: rate limit`;
    const response = await request.post("/api/assistant/chat", { headers: json, data: { locale: "el", messages: [{ role: "user", content: question }] } });
    const body = await response.json() as { reply: string; source: string };
    expect(body.source).toBe("ai");
    expect(body.reply).toBe("Απάντηση από το δεύτερο μοντέλο.");
    // Every call asked for zero-retention endpoints (the mock refuses anything else).
    const { calls } = await (await request.get(`${MOCK_OPENROUTER}/__calls`)).json() as { calls: { model: string; question: string }[] };
    expect(calls.filter(call => call.question === question).map(call => call.model)).toEqual(["test/primary:free", "test/secondary:free"]);
  });

  test("rejects malformed and cross-site requests", async ({ request }) => {
    expect((await request.post("/api/assistant/chat", { headers: json, data: { locale: "xx", messages: [] } })).status()).toBe(400);
    expect((await request.post("/api/assistant/chat", { headers: { ...json, Origin: "https://evil.example" }, data: { locale: "en", messages: [{ role: "user", content: "hi" }] } })).status()).toBe(403);
  });
});

async function signIn(page: Page) {
  await page.goto("/admin");
  await page.getByLabel("Κωδικός").fill("wrong password");
  await page.getByRole("button", { name: "Είσοδος" }).click();
  await expect(page.getByText("Λάθος κωδικός.")).toBeVisible();
  await page.getByLabel("Κωδικός").fill(password);
  await page.getByRole("button", { name: "Είσοδος" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Αθηνά");
}

test.describe("conversations", () => {
  test("every chat reaches the inbox; a handoff brings Athina in", async ({ browser }) => {
    const guestContext = await browser.newContext();
    const guest = await guestContext.newPage();
    const errors: string[] = [];
    guest.on("pageerror", error => errors.push(error.message));
    await guest.goto("/el");
    await guest.getByTestId("assistant-toggle").click();
    const panel = guest.getByTestId("assistant-dialog");
    // The assistant's code loads on first use; give a busy CI machine time to fetch it.
    await expect(panel.getByRole("heading", { name: "Πώς μπορούμε να βοηθήσουμε;" })).toBeVisible({ timeout: 15_000 });

    // The assistant answers, and the conversation is stored from the first message.
    const suffix = `${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 90 + 10)}`;
    const name = `Μαρία ${suffix}`;
    const question = `Έχει wifi; (${suffix})`;
    await panel.getByLabel("Η ερώτησή σας").fill(question);
    await panel.getByLabel("Η ερώτησή σας").press("Enter");
    await expect(panel.locator('[data-speaker="bot"]').last()).toContainText("Wi-Fi");

    const adminContext = await browser.newContext();
    const admin = await adminContext.newPage();
    await signIn(admin);
    await admin.getByRole("link", { name: "Όλες οι συζητήσεις" }).click();
    const list = admin.getByTestId("admin-conversations");
    await expect(list.getByRole("button").filter({ hasText: "Wi-Fi" }).first()).toBeVisible();

    // "Talk to Athina" goes straight to her.
    await panel.getByTestId("assistant-handoff").first().click();
    await expect(panel.getByText("Ειδοποιήσαμε την Αθηνά. Θα σας απαντήσει εδώ.")).toBeVisible();
    await panel.getByLabel("Όνομα").fill(name);
    await panel.getByRole("button", { name: "Αποθήκευση" }).click();
    await expect(panel.getByText("Ευχαριστούμε. Η Αθηνά θα το δει.")).toBeVisible();
    const composer = panel.getByRole("textbox", { name: "Μήνυμα" });
    await composer.fill("Μπορούμε να φτάσουμε στις 22:00;");
    await composer.press("Enter");
    await expect(panel.locator('[data-mine="true"]').last()).toContainText("22:00");

    await admin.getByRole("link", { name: /Χρειάζονται εσάς/ }).click();
    await list.getByRole("button", { name: new RegExp(name) }).click();
    const thread = admin.locator(".admin-inbox__thread");
    await expect(thread.getByText("Μπορούμε να φτάσουμε στις 22:00;")).toBeVisible();
    await expect(thread.getByText("Ο επισκέπτης ζήτησε να σας μιλήσει")).toBeVisible();
    await expect(thread.getByText(question)).toBeVisible();
    const reply = thread.getByRole("textbox", { name: "Γράψτε την απάντησή σας…" });
    await reply.fill("Φυσικά, θα σας περιμένω.");
    await reply.press("Enter");

    await expect(panel.locator('[data-speaker="host"]')).toContainText("Φυσικά, θα σας περιμένω.", { timeout: 15_000 });

    // The conversation continues after a reload.
    await guest.reload();
    await guest.getByTestId("assistant-toggle").click();
    await expect(guest.getByTestId("assistant-dialog").getByText("Φυσικά, θα σας περιμένω.")).toBeVisible();
    expect(errors).toEqual([]);
    await guestContext.close();
    await adminContext.close();
  });

  test("asking for a person in words hands over without the model", async ({ request }) => {
    const created = await request.post("/api/chat/conversations", { headers: json, data: { locale: "el", text: "Θέλω να μιλήσω με την Αθηνά" } });
    expect(created.status()).toBe(201);
    const body = await created.json() as { handler: string; entries: { author: string; text: string }[] };
    expect(body.handler).toBe("host");
    expect(body.entries.map(entry => entry.author)).toEqual(["guest", "system"]);
    expect(body.entries[1].text).toBe("handoff");
    // Athens is not Athina.
    const athens = await request.post("/api/chat/conversations", { headers: json, data: { locale: "el", text: "Πόσο απέχει η Αθήνα;" } });
    expect((await athens.json() as { handler: string }).handler).toBe("bot");
  });

  test("admin API requires a session and guest API requires the token", async ({ request }) => {
    expect((await request.get("/api/admin/sync")).status()).toBe(401);
    const created = await request.post("/api/chat/conversations", { headers: json, data: { locale: "en", handoff: true } });
    expect(created.status()).toBe(201);
    const { id, token } = await created.json() as { id: string; token: string };
    expect((await request.get(`/api/chat/conversations/${id}`)).status()).toBe(404);
    expect((await request.get(`/api/chat/conversations/${id}`, { headers: { Authorization: "Bearer wrong-token-000000000000" } })).status()).toBe(404);
    const ok = await request.get(`/api/chat/conversations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    expect(ok.status()).toBe(200);
    expect((await request.post(`/api/chat/conversations/${id}/messages`, { headers: { ...json, Authorization: `Bearer ${token}` }, data: { text: "" } })).status()).toBe(400);
    expect((await request.patch(`/api/chat/conversations/${id}`, { headers: { ...json, Authorization: `Bearer ${token}` }, data: { email: "not-an-email" } })).status()).toBe(400);
  });
});
