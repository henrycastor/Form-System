import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 30 * 1000,
  testDir: './tests/e2e',
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chromium'] } },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
});
