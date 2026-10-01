import { defineConfig } from "@playwright/test";

/*
  The chat tests run against the in-memory store (tests and local development only;
  production uses Upstash Redis, see docs/CHAT.md), a throwaway admin password, and a mock
  OpenRouter (tests/mock-openrouter.mjs) so the model chain is deterministic and offline.
*/
export const ADMIN_PASSWORD = "test-password-123";
export const MOCK_OPENROUTER = "http://127.0.0.1:4011";
process.env.MASTIHA_CHAT_STORE ??= "memory";
process.env.MASTIHA_ADMIN_PASSWORD ??= ADMIN_PASSWORD;
process.env.OPENROUTER_API_KEY ??= "e2e-test-key";
process.env.OPENROUTER_BASE_URL ??= `${MOCK_OPENROUTER}/api/v1`;
process.env.MASTIHA_AI_ROUTE ??= "openrouter:test/primary:free,openrouter:test/secondary:free";

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
  webServer: [
    {
      command: "node tests/mock-openrouter.mjs",
      url: `${MOCK_OPENROUTER}/api/v1/key`,
      reuseExistingServer: !process.env.CI,
      timeout: 10_000,
    },
    {
      command: "npm run start",
      url: "http://127.0.0.1:3000/en",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [
    // PLAYWRIGHT_CHROMIUM_PATH lets a machine with a preinstalled Chromium skip the download.
    { name: "chromium", use: { browserName: "chromium", launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {} } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
});
