#!/usr/bin/env node
/*
  Tells Bing (and through it ChatGPT search and Copilot), Yandex, Seznam and Naver that the
  pages changed, so they re-crawl now instead of eventually. https://www.indexnow.org

  The key is public by design: the file public/<key>.txt proves the site owns it.
  Runs after every production deploy (.github/workflows/indexnow.yml), or by hand:
    npm run indexnow
*/
import { readdirSync } from "node:fs";

const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://mastiha-luxury-suites.vercel.app").replace(/\/$/, "");
const keyFile = readdirSync(new URL("../public/", import.meta.url)).find(name => /^[0-9a-f]{32}\.txt$/.test(name));
if (!keyFile) throw new Error("No IndexNow key file in public/");
const key = keyFile.slice(0, -4);

// The key must be live on the site before the engines will accept the ping.
const live = await fetch(`${site}/${keyFile}`).then(response => response.ok ? response.text() : "").catch(() => "");
if (live.trim() !== key) throw new Error(`${site}/${keyFile} does not serve the key yet`);

const urlList = ["/el", "/en", "/tr", "/llms.txt"].map(path => site + path);
const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(site).host, key, keyLocation: `${site}/${keyFile}`, urlList }),
});
// 200: accepted; 202: accepted, key check pending. Anything else is a real problem.
if (response.status !== 200 && response.status !== 202) throw new Error(`IndexNow answered ${response.status}: ${await response.text()}`);
console.log(`IndexNow ${response.status}: submitted ${urlList.length} URLs for ${new URL(site).host}`);
