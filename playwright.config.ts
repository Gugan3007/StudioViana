import { defineConfig, devices } from "@playwright/test";

const useProductionServer = process.env.PLAYWRIGHT_PRODUCTION === "true";

export default defineConfig({
  testDir: "./tests/browser",
  outputDir: "/tmp/studio-viana-playwright",
  fullyParallel: false,
  retries: 0,
  reporter: "line",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: useProductionServer ? "npm run start" : "npm run dev",
    reuseExistingServer: !useProductionServer,
    timeout: 120_000,
    url: "http://localhost:3000",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
