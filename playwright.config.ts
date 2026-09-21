import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests", testMatch: "**/*.spec.ts", fullyParallel: false,
  retries: 0, workers: 2, timeout: 45000,
  reporter: [["list"], ["html", { open: "never" }], ["json", { outputFile: "test-results/results.json" }]],
  outputDir: "test-results",
  use: { baseURL: "http://127.0.0.1:3000", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: { command: "npm run start", url: "http://127.0.0.1:3000/en", reuseExistingServer: !process.env.CI, timeout: 120000 },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }, { name: "webkit", use: { browserName: "webkit" } }],
});
