// app/tests/utils/helpers.js

const { randomEmail, randomString } = require('../../../shared/utils/string-helpers');
const { getCurrentTimestamp } = require('../../../shared/utils/date-helpers');

/**
 * Helper functions specific to App tests
 */

/**
 * Generate test user data
 */
function generateTestUser() {
  return {
    email: randomEmail('xlm.com'),
    password: 'TestPass123!',
    name: `Test User ${randomString(5)}`,
    phone: `090${randomString(7, '0123456789')}`,
  };
}

/**
 * Wait for element with custom timeout
 */
async function waitForElement(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    console.log(`⚠️  Element not found: ${selector}`);
    return false;
  }
}

/**
 * Take screenshot with timestamp
 */
async function takeScreenshot(page, name) {
  const timestamp = getCurrentTimestamp().replace(/:/g, '-').replace(/\./g, '-');
  const filename = `screenshots/${name}-${timestamp}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`📸 Screenshot saved: ${filename}`);
  return filename;
}

/**
 * Check if running in CI environment
 */
function isCI() {
  return !!process.env.CI;
}

/**
 * Get base URL based on environment
 */
function getBaseURL() {
  const env = process.env.TEST_ENV || 'local';
  const envConfig = require('./env');
  return envConfig.baseURL;
}

/**
 * Sleep/wait for milliseconds
 */
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      console.log(`⚠️  Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
      await sleep(delay);
    }
  }
}

/**
 * Log test step
 */
function logStep(step, message) {
  console.log(`   Step ${step}: ${message}`);
}

/**
 * Log verification
 */
function logVerify(message) {
  console.log(`   Verify: ${message}`);
}

/**
 * Log test info
 */
function logTestInfo(testId, description) {
  console.log(`🧪 Test: ${testId} - ${description}`);
}

/**
 * Log test passed
 */
function logTestPassed(testId) {
  console.log(`✅ Test passed: ${testId}`);
}

module.exports = {
  generateTestUser,
  waitForElement,
  takeScreenshot,
  isCI,
  getBaseURL,
  sleep,
  retryWithBackoff,
  logStep,
  logVerify,
  logTestInfo,
  logTestPassed,
};