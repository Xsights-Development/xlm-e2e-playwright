const base = require('@playwright/test');
const { LoginPage } = require('../pages/auth/login');
const { RoomDashboardPage } = require('../pages/dashboard/room-dashboard');
const fs = require('fs');
const path = require('path');
const { env } = require('../config/env');

// Load test data
const authData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/auth.json'), 'utf-8')
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
   * Fixture: Room Dashboard Page
   */
  roomDashboardPage: async ({ page }, use) => {
    const roomDashboardPage = new RoomDashboardPage(page);
    await use(roomDashboardPage);
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
    await loginPage.login(env.APP_USER, env.APP_PASS);

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
    const authFile = path.join(__dirname, '../.auth/user.json');

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

  /**
   * Fixture: Authenticated Dashboard with Location Selected
   * Preconditions:
   * 1. User is logged in
   * 2. Tenant and farm are selected
   * 3. Location (barn) is selected
   * 4. User is at the Overview page of the selected location
   */
  authenticatedDashboard: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    console.log('🔐 Setting up authenticated dashboard with location...');

    // STEP 1: Navigate to login page
    await loginPage.goto();

    // STEP 2: Login with credentials
    await page.getByRole('textbox', { name: 'Email' }).fill(env.APP_USER);
    await page.getByRole('textbox', { name: 'Password' }).fill(env.APP_PASS);
    await page.locator('button:has-text("Sign In")').click();

    // STEP 3: Select tenant
    await page.waitForTimeout(1000);
    await page.getByRole('combobox').first().click();
    await page.getByText(env.APP_TENANT, { exact: true }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    // STEP 4: Select farm
    await page.waitForTimeout(1000);
    await page.getByRole('combobox').last().click();
    await page.getByText(env.APP_FARM, { exact: true }).click();
    await page.getByRole('button', { name: 'Go to Dashboard' }).click();

    // STEP 5: Wait for dashboard to load
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    await page.waitForTimeout(2000);
    console.log('✓ Dashboard loaded');

    // STEP 6: Navigate to location (Nursery 2)
    // Expand the Nursery Barns group
    const nurseryBarnsGroup = page.locator('text=/nursery barns/i').first();
    await nurseryBarnsGroup.click();
    await page.waitForTimeout(1000);

    // Click on Nursery 2
    const nursery2 = page.locator('text=/nursery 2/i').first();
    await nursery2.click({ force: true });

    // STEP 7: Wait for overview page
    await page.waitForURL(/.*overview/, { timeout: 5000 });
    console.log('✓ Overview page loaded for location');

    await page.waitForTimeout(1000);

    await use(page);

    console.log('🚪 Cleaning up dashboard session...');
  },
});

exports.expect = base.expect;
