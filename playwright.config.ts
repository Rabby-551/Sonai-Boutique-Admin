import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3100", trace: "on-first-retry" },
  webServer: {
    command:
      "npm run test:e2e:prepare && npm run build && npm run start -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/dashboard",
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === "true",
    timeout: 900_000,
    env: {
      ...process.env,
      MOCK_DATA_DIR: ".playwright-data",
      E2E_TESTING: "true",
      DEMO_RESET_ENABLED: "true",
    },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
