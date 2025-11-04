// admin/tests/fixtures/admin-fixture.js
const base = require('@playwright/test');
const { AdminLoginPage } = require('../pages/AdminLoginPage');
const { UserManagementPage } = require('../pages/UserManagementPage');
const { SettingsPage } = require('../pages/SettingsPage');
const fs = require('fs');
const path = require('path');

// Load test data
const adminAuthData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../test-data/admin-auth-data.json'), 'utf-8')
);

const usersData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../test-data/users-data.json'), 'utf-8')
);

// Extend base test
exports.test = base.test.extend({
  
  /**
   * Fixture: Admin Login Page
   */
  adminLoginPage: async ({ page }, use) => {
    const adminLoginPage = new AdminLoginPage(page);
    await use(adminLoginPage);
  },

  /**
   * Fixture: User Management Page
   */
  userManagementPage: async ({ page }, use) => {
    const userManagementPage = new UserManagementPage(page);
    await use(userManagementPage);
  },

  /**
   * Fixture: Settings Page
   */
  settingsPage: async ({ page }, use) => {
    const settingsPage = new SettingsPage(page);
    await use(settingsPage);
  },

  /**
   * Fixture: Admin Test Data
   */
  adminTestData: async ({}, use) => {
    await use(adminAuthData);
  },

  /**
   * Fixture: Users Test Data
   */
  usersTestData: async ({}, use) => {
    await use(usersData);
  },

  /**
   * Fixture: Authenticated Admin Page
   * Pre-condition: Admin đã login
   */
  authenticatedAdminPage: async ({ page }, use) => {
    const adminLoginPage = new AdminLoginPage(page);
    const validAdmin = adminAuthData.validAdmins[0];
    
    console.log('🔐 Logging in admin for authenticated session...');
    
    // Navigate to admin login page
    await adminLoginPage.goto();
    
    // Perform admin login
    await adminLoginPage.login(validAdmin.email, validAdmin.password);
    
    // Wait for navigation to admin dashboard
    try {
      await page.waitForURL(/.*\/admin\/(dashboard|home)/, { timeout: 15000 });
      console.log('✓ Admin logged in successfully');
    } catch (error) {
      console.log('⚠️  URL did not change, checking for admin dashboard elements...');
      await page.waitForSelector('h1', { timeout: 10000 });
    }
    
    await use(page);
    
    // Cleanup
    console.log('🚪 Cleaning up admin session...');
  },

  /**
   * Fixture: Fast Admin Auth
   * Use saved authentication for faster tests
   */
  fastAdminAuthPage: async ({ browser }, use) => {
    const authFile = path.join(__dirname, '../../.auth/admin.json');
    
    let storageState;
    if (fs.existsSync(authFile)) {
      storageState = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
      console.log('✓ Using saved admin authentication');
    }
    
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    
    // If no saved auth, perform login and save it
    if (!storageState) {
      const adminLoginPage = new AdminLoginPage(page);
      const validAdmin = adminAuthData.validAdmins[0];
      
      await adminLoginPage.goto();
      await adminLoginPage.login(validAdmin.email, validAdmin.password);
      await page.waitForURL(/.*\/admin\/(dashboard|home)/, { timeout: 15000 });
      
      // Save auth state
      const newStorageState = await context.storageState();
      fs.mkdirSync(path.dirname(authFile), { recursive: true });
      fs.writeFileSync(authFile, JSON.stringify(newStorageState));
      console.log('✓ Admin authentication saved for future tests');
    }
    
    await use(page);
    await context.close();
  },

  /**
   * Fixture: Admin on User Management Page
   * Pre-condition: Admin logged in và đang ở User Management page
   */
  adminOnUserManagementPage: async ({ page }, use) => {
    const adminLoginPage = new AdminLoginPage(page);
    const userManagementPage = new UserManagementPage(page);
    const validAdmin = adminAuthData.validAdmins[0];
    
    console.log('🔐 Setting up admin on User Management page...');
    
    // Login
    await adminLoginPage.goto();
    await adminLoginPage.login(validAdmin.email, validAdmin.password);
    await page.waitForURL(/.*\/admin/, { timeout: 15000 });
    
    // Navigate to User Management
    await userManagementPage.goto();
    await userManagementPage.waitForPageLoad();
    
    console.log('✓ Admin is on User Management page');
    
    await use({ page, userManagementPage });
  },

});

exports.expect = base.expect;