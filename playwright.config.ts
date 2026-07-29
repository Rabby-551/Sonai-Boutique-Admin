import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3100", trace: "on-first-retry" },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/dashboard",
    reuseExistingServer: false,
    timeout: 180_000,
    env: { ...process.env, MOCK_DATA_DIR: ".playwright-data" },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
