import { defineConfig, devices } from "@playwright/test";

const useProductionServer = process.env.PLAYWRIGHT_PRODUCTION === "true";
const useSystemChrome = process.env.PLAYWRIGHT_SYSTEM_CHROME === "true";
const port = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests/browser",
  outputDir: "/tmp/studio-viana-playwright",
  fullyParallel: false,
  workers: useProductionServer ? 1 : undefined,
  retries: 0,
  reporter: "line",
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `${useProductionServer ? "npm run start" : "npm run dev"} -- --hostname 127.0.0.1 --port ${port}`,
    reuseExistingServer: !useProductionServer,
    timeout: 120_000,
    url: baseURL,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: useSystemChrome ? "chrome" : undefined,
      },
    },
  ],
});
