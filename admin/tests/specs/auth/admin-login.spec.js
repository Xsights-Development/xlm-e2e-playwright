// admin/tests/specs/auth/admin-login.spec.js
const { test, expect } = require('../../fixtures/admin-fixture');

/**
 * TEST SUITE: Admin Login Functionality
 * SECTION: Admin Authentication
 * 
 * Manual Test Case: TC-ADMIN-001
 */

test.describe('Admin Login Module @admin @auth', () => {
  
  test.beforeEach(async ({ adminLoginPage }) => {
    console.log('📝 Setting up test: Navigating to admin login page');
    await adminLoginPage.goto();
  });

  /**
   * TEST CASE: TC-ADMIN-001
   * Scenario: Admin login với valid credentials
   * 
   * Tags: @smoke @all
   */
  test('TC-ADMIN-001: Admin login with valid credentials @smoke @all', async ({ 
    adminLoginPage, 
    adminTestData, 
    page 
  }) => {
    console.log('🧪 Test: Admin login with valid credentials');
    
    // Arrange
    const validAdmin = adminTestData.validAdmins[0];
    console.log(`   Using admin: ${validAdmin.email}`);

    // Act
    console.log('   Step 1: Fill admin email');
    await adminLoginPage.fillEmail(validAdmin.email);
    
    console.log('   Step 2: Fill admin password');
    await adminLoginPage.fillPassword(validAdmin.password);
    
    console.log('   Step 3: Click login button');
    await adminLoginPage.clickLoginButton();

    // Assert
    console.log('   Verify: Admin is redirected to admin dashboard');
    await expect(page).toHaveURL(/.*\/admin\/(dashboard|home)/, { timeout: 15000 });
    
    console.log('✅ Test passed: Admin login with valid credentials');
  });

  /**
   * TEST CASE: TC-ADMIN-002
   * Scenario: Admin login với invalid credentials
   */
  test('TC-ADMIN-002: Admin login with invalid credentials @regression @local @staging', async ({ 
    adminLoginPage, 
    adminTestData, 
    page 
  }) => {
    console.log('🧪 Test: Admin login with invalid credentials');
    
    const invalidAdmin = adminTestData.invalidAdmins[0];

    await adminLoginPage.fillEmail(invalidAdmin.email);
    await adminLoginPage.fillPassword(invalidAdmin.password);
    await adminLoginPage.clickLoginButton();
    
    await page.waitForTimeout(2000);

    const isErrorVisible = await adminLoginPage.isErrorVisible();
    expect(isErrorVisible).toBeTruthy();
    
    const errorMsg = await adminLoginPage.getErrorMessage();
    expect(errorMsg).toBeTruthy();
    
    await expect(page).toHaveURL(/.*\/admin\/login/);
    
    console.log('✅ Test passed: Admin login with invalid credentials');
  });

});