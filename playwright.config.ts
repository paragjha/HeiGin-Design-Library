import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
// Locally we drive the installed Microsoft Edge (no browser download). CI installs Chromium.
const channel = process.env.PW_CHANNEL ?? (isCI ? undefined : "msedge");

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  retries: isCI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { trace: "retain-on-failure", ...(channel ? { channel } : {}) },
  projects: [
    { name: "docs-desktop", testMatch: /(docs|builder|builder-features)\.spec\.ts/, use: { ...devices["Desktop Chrome"], ...(channel ? { channel } : {}), baseURL: "http://localhost:4173", viewport: { width: 1440, height: 900 } } },
    { name: "docs-mobile", testMatch: /docs-mobile\.spec\.ts/, use: { ...devices["Pixel 7"], ...(channel ? { channel } : {}), baseURL: "http://localhost:4173", viewport: { width: 390, height: 844 } } },
    { name: "nextjs", testMatch: /nextjs\.spec\.ts/, use: { ...devices["Desktop Chrome"], ...(channel ? { channel } : {}), baseURL: "http://localhost:3201" } },
  ],
  webServer: [
    { command: "npm run preview -w @heigin/docs", url: "http://localhost:4173", reuseExistingServer: !isCI, timeout: 120_000 },
    { command: "npx next start -p 3201", cwd: "apps/nextjs-example", url: "http://localhost:3201", reuseExistingServer: !isCI, timeout: 120_000 },
  ],
});
