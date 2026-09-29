import { expect, test } from "@playwright/test";

const password = process.env.MASTIHA_ADMIN_PASSWORD ?? "test-password-123";
const json = { "Content-Type": "application/json" };

test.describe("automated guide", () => {
  test("answers from the property data in each language", async ({ request }) => {
    const ask = async (locale: string, content: string) => {
      const response = await request.post("/api/assistant/chat", { headers: json, data: { locale, messages: [{ role: "user", content }] } });
      expect(response.ok()).toBe(true);
      return await response.json() as { reply: string; suggestHost?: boolean };
    };
    expect((await ask("el", "Υπάρχει πάρκινγκ;")).reply).toContain("δωρεάν ιδιωτικό πάρκινγκ");
    expect((await ask("el", "Έχετε κούνια για μωρό;")).reply).toContain("κούνια");
    expect((await ask("en", "Where can I buy bread?")).reply).toContain("Bakery");
    expect((await ask("tr", "Evcil hayvan kabul ediyor musunuz?")).reply).toContain("Maalesef");
    expect((await ask("el", "Γεια σας!")).reply).toContain("Γεια σας! Είμαι ο αυτόματος βοηθός");
    expect((await ask("el", "Πού μπορώ να πιω καφέ;")).reply).toContain("ZEFYROS");
    const unknown = await ask("el", "Πόσο απέχει το αεροδρόμιο;");
    expect(unknown.suggestHost).toBe(true);
    expect(unknown.reply).toContain("Αθηνά");
  });

  test("rejects malformed and cross-site requests", async ({ request }) => {
    expect((await request.post("/api/assistant/chat", { headers: json, data: { locale: "xx", messages: [] } })).status()).toBe(400);
    expect((await request.post("/api/assistant/chat", { headers: { ...json, Origin: "https://evil.example" }, data: { locale: "en", messages: [{ role: "user", content: "hi" }] } })).status()).toBe(403);
  });
});

test.describe("live chat", () => {
  test("a guest reaches Athina and gets her reply", async ({ browser }) => {
    const guestContext = await browser.newContext();
    const guest = await guestContext.newPage();
    const errors: string[] = [];
    guest.on("pageerror", error => errors.push(error.message));
    await guest.goto("/el");
    await guest.getByTestId("assistant-toggle").click();
    const panel = guest.getByTestId("assistant-dialog");
    await panel.getByRole("button", { name: "Υπάρχει πάρκινγκ;" }).click();
    await expect(panel.locator('[data-speaker="bot"]')).toContainText("πάρκινγκ");

    await panel.getByRole("button", { name: "Μιλήστε με την Αθηνά" }).first().click();
    const name = `Επισκέπτρια ${Date.now().toString().slice(-5)}`;
    await panel.getByLabel(/Όνομα/).fill(name);
    await panel.getByRole("button", { name: "Συνέχεια" }).click();
    await expect(panel.getByText("Η συζήτηση μεταφέρθηκε στην Αθηνά")).toBeVisible();
    const composer = panel.getByRole("textbox");
    await composer.fill("Μπορούμε να φτάσουμε στις 22:00;");
    await composer.press("Enter");
    await expect(panel.locator('[data-mine="true"]').last()).toContainText("22:00");

    const adminContext = await browser.newContext();
    const admin = await adminContext.newPage();
    await admin.goto("/admin");
    await admin.getByLabel("Κωδικός").fill("wrong password");
    await admin.getByRole("button", { name: "Είσοδος" }).click();
    await expect(admin.getByText("Λάθος κωδικός.")).toBeVisible();
    await admin.getByLabel("Κωδικός").fill(password);
    await admin.getByRole("button", { name: "Είσοδος" }).click();
    await admin.getByTestId("admin-conversations").getByRole("button", { name: new RegExp(name) }).click();
    const thread = admin.getByRole("main");
    await expect(thread.getByText("Μπορούμε να φτάσουμε στις 22:00;")).toBeVisible();
    await expect(thread.getByText("Ο επισκέπτης ζήτησε να μιλήσει μαζί σας")).toBeVisible();
    const reply = thread.getByRole("textbox");
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

  test("admin API requires a session and guest API requires the token", async ({ request }) => {
    expect((await request.get("/api/admin/sync")).status()).toBe(401);
    const created = await request.post("/api/chat/conversations", { headers: json, data: { locale: "en", transcript: [] } });
    expect(created.status()).toBe(201);
    const { id, token } = await created.json() as { id: string; token: string };
    expect((await request.get(`/api/chat/conversations/${id}`)).status()).toBe(404);
    expect((await request.get(`/api/chat/conversations/${id}`, { headers: { Authorization: "Bearer wrong-token-000000000000" } })).status()).toBe(404);
    const ok = await request.get(`/api/chat/conversations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    expect(ok.status()).toBe(200);
    expect((await request.post(`/api/chat/conversations/${id}/messages`, { headers: { ...json, Authorization: `Bearer ${token}` }, data: { text: "" } })).status()).toBe(400);
  });
});
