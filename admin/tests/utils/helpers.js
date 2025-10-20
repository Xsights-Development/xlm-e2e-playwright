// admin/tests/utils/helpers.js

const { randomEmail, randomString } = require('../../../shared/utils/string-helpers');
const { getCurrentTimestamp } = require('../../../shared/utils/date-helpers');

/**
 * Helper functions specific to Admin tests
 */

/**
 * Generate test admin data
 */
function generateTestAdmin() {
  return {
    email: randomEmail('xlm.com'),
    password: 'AdminPass123!',
    name: `Admin ${randomString(5)}`,
    role: 'admin',
  };
}

/**
 * Generate test user data for admin to create
 */
function generateUserForAdmin() {
  return {
    name: `User ${randomString(5)}`,
    email: randomEmail('xlm.com'),
    role: 'user',
    status: true,
  };
}

/**
 * Wait for modal to appear
 */
async function waitForModal(page, timeout = 5000) {
  const selectors = [
    '[data-testid="modal"]',
    '.modal',
    '[role="dialog"]',
  ];
  
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout });
      console.log(`✓ Modal appeared: ${selector}`);
      return true;
    } catch (error) {
      continue;
    }
  }
  
  console.log('⚠️  Modal did not appear');
  return false;
}

/**
 * Close modal
 */
async function closeModal(page) {
  const selectors = [
    '[data-testid="close-modal"]',
    '.modal-close',
    'button:has-text("Close")',
    '[aria-label="Close"]',
  ];
  
  for (const selector of selectors) {
    try {
      await page.click(selector);
      await page.waitForTimeout(500);
      console.log('✓ Modal closed');
      return true;
    } catch (error) {
      continue;
    }
  }
  
  // Fallback: press Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  return true;
}

/**
 * Wait for toast/notification
 */
async function waitForNotification(page, timeout = 5000) {
  const selectors = [
    '[data-testid="notification"]',
    '.toast',
    '.notification',
    '[role="alert"]',
  ];
  
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout, state: 'visible' });
      const text = await page.textContent(selector);
      console.log(`✓ Notification: "${text}"`);
      return text;
    } catch (error) {
      continue;
    }
  }
  
  return null;
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
 * Sleep/wait
 */
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Log helpers
 */
function logStep(step, message) {
  console.log(`   Step ${step}: ${message}`);
}

function logVerify(message) {
  console.log(`   Verify: ${message}`);
}

function logTestInfo(testId, description) {
  console.log(`🧪 Test: ${testId} - ${description}`);
}

function logTestPassed(testId) {
  console.log(`✅ Test passed: ${testId}`);
}

module.exports = {
  generateTestAdmin,
  generateUserForAdmin,
  waitForModal,
  closeModal,
  waitForNotification,
  takeScreenshot,
  sleep,
  logStep,
  logVerify,
  logTestInfo,
  logTestPassed,
};