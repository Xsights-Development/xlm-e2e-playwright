import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  reporter: [['list'], ['html', { outputFolder: 'tests/reports/html' }]],
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'app',
      testDir: 'tests/app/specs',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'admin',
      testDir: 'tests/admin/specs',
      use: { ...devices['Desktop Chrome'] }
    },
  ],
});
