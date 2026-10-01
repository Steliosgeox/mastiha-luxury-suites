import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const closed = ["/admin", "/api/"];

/*
  Search engines and the AI assistants people ask about where to stay (ChatGPT, Claude,
  Perplexity, Gemini, Copilot, Apple) are all welcome on the public pages. The AI crawlers are
  named so the intent is explicit; a crawler that matches a named group follows only that
  group, so it repeats the same closed paths.
*/
const aiCrawlers = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended", "Bingbot", "DuckAssistBot", "MistralAI-User",
];

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === "preview") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: closed },
      { userAgent: aiCrawlers, allow: "/", disallow: closed },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
