// admin/playwright.config.js
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

const TEST_ENV = process.env.TEST_ENV || 'local';

let envConfig = {};
try {
  envConfig = require(`./config/playwright.${TEST_ENV}.js`);
} catch (error) {
  console.log(`⚠️  No specific config for ${TEST_ENV}, using defaults`);
}

module.exports = defineConfig({
  testDir: './tests/specs',
  outputDir: './test-results',
  
  timeout: 30 * 1000,
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
    baseURL: process.env.BASE_URL || 'http://localhost:4000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
    ...envConfig.use,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  ...envConfig,
});