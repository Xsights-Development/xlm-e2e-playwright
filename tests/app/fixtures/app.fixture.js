// app/tests/fixtures/app-fixture.js
const base = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { DashboardPage } = require('../pages/DashboardPage');
const fs = require('fs');
const path = require('path');

// Load test data
const authData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/auth-data.json'), 'utf-8')
);

// Extend base test
exports.test = base.test.extend({
  
  /**
   * Fixture: Login Page
   */
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  /**
   * Fixture: Dashboard Page
   */
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  /**
   * Fixture: Test Data
   */
  testData: async ({}, use) => {
    await use(authData);
  },

  /**
   * Fixture: Authenticated Page
   * Pre-condition: User đã login
   */
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const validUser = authData.validUsers[0];
    
    console.log('🔐 Logging in user for authenticated session...');
    
    // Navigate to login page
    await loginPage.goto();
    
    // Perform login
    await loginPage.login(validUser.email, validUser.password);
    
    // Wait for navigation to dashboard (with multiple possible URLs)
    try {
      await page.waitForURL(/.*\/(dashboard|home|app)/, { timeout: 15000 });
      console.log('✓ User logged in successfully');
    } catch (error) {
      console.log('⚠️  URL did not change, checking for dashboard elements...');
      // Fallback: check if dashboard elements are visible
      await page.waitForSelector('h1', { timeout: 10000 });
    }
    
    await use(page);
    
    // Cleanup: Logout after test (optional)
    console.log('🚪 Cleaning up authenticated session...');
  },

  /**
   * Fixture: Browser context with localStorage
   * Useful for maintaining session across tests
   */
  authenticatedContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: {
        cookies: [],
        origins: []
      }
    });
    
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    const validUser = authData.validUsers[0];
    
    // Perform login
    await loginPage.goto();
    await loginPage.login(validUser.email, validUser.password);
    await page.waitForURL(/.*\/(dashboard|home)/, { timeout: 15000 });
    
    // Save storage state
    const storageState = await context.storageState();
    
    await use({ context, storageState });
    
    await context.close();
  },

  /**
   * Fixture: Page with pre-saved authentication
   * Faster than logging in for each test
   */
  fastAuthPage: async ({ browser }, use) => {
    // Create context with saved auth (if exists)
    const authFile = path.join(__dirname, '../../.auth/user.json');
    
    let storageState;
    if (fs.existsSync(authFile)) {
      storageState = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
      console.log('✓ Using saved authentication');
    }
    
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    
    // If no saved auth, perform login and save it
    if (!storageState) {
      const loginPage = new LoginPage(page);
      const validUser = authData.validUsers[0];
      
      await loginPage.goto();
      await loginPage.login(validUser.email, validUser.password);
      await page.waitForURL(/.*\/(dashboard|home)/, { timeout: 15000 });
      
      // Save auth state for next tests
      const newStorageState = await context.storageState();
      fs.mkdirSync(path.dirname(authFile), { recursive: true });
      fs.writeFileSync(authFile, JSON.stringify(newStorageState));
      console.log('✓ Authentication saved for future tests');
    }
    
    await use(page);
    await context.close();
  },

});

exports.expect = base.expect;