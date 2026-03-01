import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const isHeaded = process.argv.includes('--headed');

export default defineConfig({
  testDir: './tests/specs',
  testMatch: /\.spec\.ts$/,
  testIgnore: ['**/_legacy-js/**', '**/node_modules/**'],
  outputDir: './results',

  // Timeouts
  timeout: 30 * 1000,
  globalTimeout: 60 * 60 * 1000,

  // Test execution
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  // Reporters
  reporter: [
    ['html', { outputFolder: './reports/html', open: 'never' }],
    ['json', { outputFile: './reports/results.json' }],
    ['junit', { outputFile: './reports/junit.xml' }],
    ['list'],
  ],

  // Browser options
  use: {
    baseURL: process.env.APP_URL || 'http://localhost:3000',
    headless: !isHeaded,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
  },

  // Projects (browsers)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
