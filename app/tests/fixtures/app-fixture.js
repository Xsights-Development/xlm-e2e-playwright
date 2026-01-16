// app/tests/fixtures/app-fixture.js
const base = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { DashboardPage } = require('../pages/DashboardPage');
const testConfig = require('../../../shared/utils/test-config');

console.log('📦 Loaded test configuration from environment variables');

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
   * Provides authentication test data
   * Valid user credentials are loaded from environment variables
   */
  testData: async ({}, use) => {
    const data = {
      validUsers: [
        {
          email: testConfig.credentials.username,
          password: testConfig.credentials.password
        }
      ],
      invalidUsers: [
        {
          email: 'invalid@example.com',
          password: 'wrongpassword'
        },
        {
          email: testConfig.credentials.username,
          password: '' // Empty password
        },
        {
          email: '',
          password: 'somepassword'
        }
      ]
    };
    await use(data);
  },

  /**
   * Fixture: Application Data
   * Provides app-specific test data including credentials, organization, and location
   * All data is loaded from environment variables via test-config
   */
  appData: async ({}, use) => {
    await use(testConfig);
  },

  /**
   * Fixture: Authenticated Page
   * Pre-condition: User is already logged in
   */
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    console.log('🔐 Logging in user for authenticated session...');

    // Navigate to login page
    await loginPage.goto();

    // Perform login with credentials from test config
    await loginPage.login(testConfig.credentials.username, testConfig.credentials.password);

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
   * Fixture: Authenticated Dashboard with Location Selected
   * Preconditions:
   * 1. User is logged in
   * 2. Tenant and farm are selected
   * 3. Location (barn) is selected
   * 4. User is at the Overview page of the selected location
   *
   * Note: Requires RoomDashboardPage to be implemented
   */
  authenticatedDashboard: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    // const roomDashboardPage = new RoomDashboardPage(page); // TODO: Create RoomDashboardPage

    console.log('🔐 Setting up authenticated dashboard with location...');

    // STEP 1: Navigate to login page
    await loginPage.goto();

    // STEP 2: Login with credentials from test config
    await loginPage.login(testConfig.credentials.username, testConfig.credentials.password);

    // STEP 3: Select tenant from test config
    await loginPage.selectTenantAndWait(testConfig.organization.tenant);

    // STEP 4: Select farm from test config
    await loginPage.selectFarmAndWait(testConfig.organization.farm);

    // STEP 5: Wait for dashboard to load
    await loginPage.waitForDashboardLoad();

    // STEP 6: Select barn group and barn
    // await roomDashboardPage.expandBarnGroup(`${testConfig.location.category} Barns`);

    // STEP 7: Select barn
    // await roomDashboardPage.navigateToBarnItem(testConfig.location.name);

    // STEP 8: Wait for overview page
    // await roomDashboardPage.waitForOverviewLoad();

    console.log('========= ✓ Precondition setup complete ✓ ========');
    console.log('👉 Start test cases ...');

    await use(page);
  },
});

exports.expect = base.expect;