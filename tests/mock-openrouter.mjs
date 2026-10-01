/*
  A stand-in for OpenRouter in the end-to-end tests: deterministic answers, an upstream 429
  to exercise the fallback, and the privacy contract enforced. A request that does not ask
  for zero-data-retention endpoints is refused, so a regression there fails the tests.
*/
import { createServer } from "node:http";

const port = Number(process.env.MOCK_OPENROUTER_PORT ?? 4011);
const calls = [];

function answer(model, question) {
  if (model === "test/primary:free" && /rate limit|όριο/i.test(question)) return null;
  if (model === "test/secondary:free") return "Απάντηση από το δεύτερο μοντέλο.";
  if (/αεροδρόμιο|airport/i.test(question)) return "Δεν έχω αυτή την πληροφορία, αλλά η Αθηνά μπορεί να σας απαντήσει.\n[[HOST]]";
  if (/wi-?fi/i.test(question)) return "Ναι, υπάρχει Wi-Fi και γραφείο στο σαλόνι. Δείτε [εδώ](https://evil.example/phish) ή στο Airbnb https://www.airbnb.com/rooms/1368953469779774276.";
  if (/bread|ψωμί/i.test(question)) return "The nearest bakery is Κλούρα Ε. Βασιλική, about 270 m away.";
  return "Ευχαριστούμε για την ερώτηση. Η Αθηνά θα σας απαντήσει σύντομα.";
}

createServer((request, response) => {
  const send = (status, body) => { response.writeHead(status, { "Content-Type": "application/json" }); response.end(JSON.stringify(body)); };
  if (request.method === "GET" && request.url === "/__calls") return send(200, { calls });
  if (request.method === "GET" && request.url === "/api/v1/key") return send(200, { data: { free_model_daily_requests: { used: 3, limit: 1000, remaining: 997 } } });
  if (request.method !== "POST" || request.url !== "/api/v1/chat/completions") return send(404, { error: "not found" });
  let raw = "";
  request.on("data", chunk => { raw += chunk; });
  request.on("end", () => {
    const body = JSON.parse(raw || "{}");
    const question = body.messages?.findLast?.(message => message.role === "user")?.content ?? "";
    calls.push({ model: body.model, question });
    if (body.provider?.zdr !== true || body.provider?.data_collection !== "deny") return send(400, { error: { message: "zero-data-retention routing required" } });
    if (body.messages?.[0]?.role !== "system" || !String(body.messages[0].content).includes("FACTS")) return send(400, { error: { message: "system prompt with facts required" } });
    const text = answer(body.model, question);
    if (text === null) return send(429, { error: { message: "rate-limited upstream", code: 429 } });
    send(200, { choices: [{ finish_reason: "stop", message: { role: "assistant", content: text } }], usage: { prompt_tokens: 2400, completion_tokens: 40 } });
  });
}).listen(port, "127.0.0.1", () => console.log(`mock OpenRouter on ${port}`));
