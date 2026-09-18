import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "dock.spec.ts",
  workers: 1,
  retries: 0,
  reporter: "list",
  outputDir: "dock-test-results",
  use: {
    baseURL: "http://127.0.0.1:3000",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:3000/en",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium", deviceScaleFactor: 2 } },
    { name: "webkit", use: { browserName: "webkit", deviceScaleFactor: 2 } },
  ],
});
