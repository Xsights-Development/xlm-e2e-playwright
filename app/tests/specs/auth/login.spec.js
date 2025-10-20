// app/tests/specs/auth/login.spec.js
const { test, expect } = require('../../fixtures/app-fixture');

/**
 * TEST SUITE: Login Functionality - APP
 * SECTION: Authentication
 * 
 * Manual Test Cases được convert:
 * - Test ID: TC-APP-001, TC-APP-002
 */

test.describe('App Login Module @app @auth', () => {
  
  // Pre-condition: Navigate to login page trước mỗi test
  test.beforeEach(async ({ loginPage }) => {
    console.log('📝 Setting up test: Navigating to login page');
    await loginPage.goto();
  });

  /**
   * TEST CASE: TC-APP-001
   * Scenario: User login với valid credentials
   * Expected Result: 
   * - User được redirect đến dashboard
   * - Welcome message hiển thị
   * 
   * Tags: @smoke @all
   */
  test('TC-APP-001: Login with valid credentials @smoke @all', async ({ 
    loginPage, 
    dashboardPage, 
    testData, 
    page 
  }) => {
    console.log('🧪 Test: Login with valid credentials');
    
    // Arrange - Test Data
    const validUser = testData.validUsers[0];
    console.log(`   Using user: ${validUser.email}`);

    // Act - Scenarios
    console.log('   Step 1: Fill email');
    await loginPage.fillEmail(validUser.email);
    
    console.log('   Step 2: Fill password');
    await loginPage.fillPassword(validUser.password);
    
    console.log('   Step 3: Click login button');
    await loginPage.clickLoginButton();
    
    // Wait for loading to finish
    await loginPage.waitForLoadingToFinish();

    // Assert - Expected Results
    console.log('   Verify: User is redirected to dashboard');
    await expect(page).toHaveURL(/.*\/(dashboard|home)/, { timeout: 15000 });
    
    console.log('   Verify: Welcome message is visible');
    const isWelcomeVisible = await dashboardPage.isWelcomeMessageVisible();
    expect(isWelcomeVisible).toBeTruthy();
    
    console.log('   Verify: Dashboard title is visible');
    const dashboardTitle = await dashboardPage.getPageTitle();
    expect(dashboardTitle).toBeTruthy();
    
    console.log('✅ Test passed: Login with valid credentials');
  });

  /**
   * TEST CASE: TC-APP-002
   * Scenario: User login với invalid credentials
   * Expected Result:
   * - Error message hiển thị
   * - User vẫn ở login page
   * 
   * Tags: @regression @local @staging
   */
  test('TC-APP-002: Login with invalid credentials @regression @local @staging', async ({ 
    loginPage, 
    testData, 
    page 
  }) => {
    console.log('🧪 Test: Login with invalid credentials');
    
    // Arrange
    const invalidUser = testData.invalidUsers[0];
    console.log(`   Using invalid user: ${invalidUser.email}`);

    // Act
    console.log('   Step 1: Fill invalid email');
    await loginPage.fillEmail(invalidUser.email);
    
    console.log('   Step 2: Fill invalid password');
    await loginPage.fillPassword(invalidUser.password);
    
    console.log('   Step 3: Click login button');
    await loginPage.clickLoginButton();
    
    // Wait for error to appear
    await page.waitForTimeout(2000);

    // Assert
    console.log('   Verify: Error message is visible');
    const isErrorVisible = await loginPage.isErrorVisible();
    expect(isErrorVisible).toBeTruthy();
    
    console.log('   Verify: Error message contains expected text');
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.toLowerCase()).toContain('invalid');
    
    console.log('   Verify: Still on login page');
    await expect(page).toHaveURL(/.*\/login/, { timeout: 5000 });
    
    console.log('✅ Test passed: Login with invalid credentials');
  });

  /**
   * TEST CASE: TC-APP-003
   * Scenario: Login với empty password
   */
  test('TC-APP-003: Login with empty password @regression @local @staging', async ({ 
    loginPage, 
    testData, 
    page 
  }) => {
    console.log('🧪 Test: Login with empty password');
    
    const userWithEmptyPass = testData.invalidUsers[1];

    await loginPage.fillEmail(userWithEmptyPass.email);
    await loginPage.fillPassword(userWithEmptyPass.password);
    await loginPage.clickLoginButton();
    
    await page.waitForTimeout(1000);

    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.toLowerCase()).toContain('password');
    
    console.log('✅ Test passed: Login with empty password');
  });

  /**
   * TEST CASE: TC-APP-004
   * Scenario: Login với empty email
   */
  test('TC-APP-004: Login with empty email @regression @local @staging', async ({ 
    loginPage, 
    testData, 
    page 
  }) => {
    console.log('🧪 Test: Login with empty email');
    
    const userWithEmptyEmail = testData.invalidUsers[2];

    await loginPage.fillEmail(userWithEmptyEmail.email);
    await loginPage.fillPassword(userWithEmptyEmail.password);
    await loginPage.clickLoginButton();
    
    await page.waitForTimeout(1000);

    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.toLowerCase()).toContain('email');
    
    console.log('✅ Test passed: Login with empty email');
  });

  /**
   * TEST CASE: TC-APP-005
   * Scenario: Navigate to forgot password
   */
  test('TC-APP-005: Navigate to forgot password @regression @all', async ({ 
    loginPage, 
    page 
  }) => {
    console.log('🧪 Test: Navigate to forgot password');
    
    await loginPage.clickForgotPassword();
    
    await expect(page).toHaveURL(/.*\/(forgot-password|reset-password)/, { timeout: 5000 });
    
    console.log('✅ Test passed: Navigate to forgot password');
  });

});

/**
 * TEST SUITE: Authenticated User Actions
 * Tests that require user to be logged in
 */
test.describe('Authenticated User Actions @app @auth', () => {
  
  test('TC-APP-010: Logout @smoke @all', async ({ 
    authenticatedPage, 
    dashboardPage 
  }) => {
    console.log('🧪 Test: User logout');
    
    // User is already logged in (via fixture)
    console.log('   Step 1: Open user menu');
    await dashboardPage.openUserMenu();
    
    console.log('   Step 2: Click logout');
    await dashboardPage.logout();
    
    console.log('   Verify: Redirected to login page');
    await expect(authenticatedPage).toHaveURL(/.*\/login/, { timeout: 10000 });
    
    console.log('✅ Test passed: User logout');
  });

});