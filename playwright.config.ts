import { defineConfig } from "@playwright/test";

// The chat tests need a store and an admin password. The in-memory store is for tests and
// local development only; production uses Upstash Redis (see docs/LIVE-CHAT.md).
export const ADMIN_PASSWORD = "test-password-123";
process.env.MASTIHA_CHAT_STORE ??= "memory";
process.env.MASTIHA_ADMIN_PASSWORD ??= ADMIN_PASSWORD;

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  retries: 0,
  workers: 2,
  timeout: 60_000,
  reporter: [["list"], ["html", { open: "never" }]],
  outputDir: "test-results",
  use: {
    baseURL: "http://127.0.0.1:3000",
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:3000/en",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    // PLAYWRIGHT_CHROMIUM_PATH lets a machine with a preinstalled Chromium skip the download.
    { name: "chromium", use: { browserName: "chromium", launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {} } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
});
