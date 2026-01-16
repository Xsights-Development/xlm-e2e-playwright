// app/playwright.config.js
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

/**
 * Playwright Configuration
 *
 * Environment Variables:
 * - APP_URL: Base URL for the app (default: http://localhost:3000)
 * - CI: Set to 'true' in CI/CD environment
 * - HEADED: Set to 'true' to run in headed mode (default: headless)
 */

module.exports = defineConfig({
  testDir: './tests/specs',
  outputDir: './test-results',

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
    headless: process.env.HEADED !== 'true',
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
    // Uncomment to test on Firefox
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],
});