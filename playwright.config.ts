import { defineConfig, devices, ViewportSize } from '@playwright/test';
import 'dotenv/config';

const isHeaded = process.argv.includes('--headed');

export default defineConfig({
  testDir: './tests/specs',
  testMatch: /\.spec\.ts$/,
  testIgnore: ['**/node_modules/**'],
  outputDir: './results',

  timeout: 30_000,
  globalTimeout: 60 * 60 * 1000,

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['html', { outputFolder: './reports/html', open: 'never' }],
    ['json', { outputFile: './reports/results.json' }],
    ['junit', { outputFile: './reports/junit.xml' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.APP_URL || 'http://localhost:3000',
    headless: !isHeaded,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1920, height: 1200 } as ViewportSize,
    ignoreHTTPSErrors: true,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  // One project per major spec file — workers=1 for shared browser session fixtures.
  // Run: npx playwright test --project=farm --grep @health
  projects: [
    {
      name: 'farm',
      testMatch: /farm\.spec\.ts$/,
      workers: 1,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'overview',
      testMatch: /overview\.spec\.ts$/,
      workers: 1,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'i18n',
      // Static first (i18n-static), then UI (i18n.spec) — alphabetical order within project.
      testMatch: /i18n(-static)?\.spec\.ts$/,
      workers: 1,
      // MacBook Pro 16" M1 (~1792×1120 scaled): leave room for menu bar, dock, browser chrome.
      // Keep width ≥1024 so HorizontalNav (lg) still shows in room view.
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
