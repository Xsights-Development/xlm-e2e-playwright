const { test, expect } = require('../../fixtures');

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
    roomDashboardPage, 
    testData, 
    page 
  }) => {
    // Arrange - Test Data
    const validUser = testData.validUsers[0];

    // Act - Scenarios
    await loginPage.fillEmail(validUser.email);
    await loginPage.fillPassword(validUser.password);
    await loginPage.clickLoginButton();
    
    // Wait for loading to finish
    await loginPage.waitForLoadingToFinish();

    // Assert - Expected Results
    await expect(page).toHaveURL(/.*\/(dashboard|home)/, { timeout: 15000 });
    
    const isWelcomeVisible = await roomDashboardPage.isWelcomeMessageVisible();
    expect(isWelcomeVisible).toBeTruthy();
    
    const dashboardTitle = await roomDashboardPage.getPageTitle();
    expect(dashboardTitle).toBeTruthy();
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
    // Arrange
    const invalidUser = testData.invalidUsers[0];

    // Act
    await loginPage.fillEmail(invalidUser.email);
    await loginPage.fillPassword(invalidUser.password);
    await loginPage.clickLoginButton();
    
    // Wait for error to appear
    await page.waitForTimeout(2000);

    // Assert
    const isErrorVisible = await loginPage.isErrorVisible();
    expect(isErrorVisible).toBeTruthy();
    
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.toLowerCase()).toContain('invalid');
    
    await expect(page).toHaveURL(/.*\/login/, { timeout: 5000 });
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
    const userWithEmptyPass = testData.invalidUsers[1];

    await loginPage.fillEmail(userWithEmptyPass.email);
    await loginPage.fillPassword(userWithEmptyPass.password);
    await loginPage.clickLoginButton();
    
    await page.waitForTimeout(1000);

    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.toLowerCase()).toContain('password');
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
    const userWithEmptyEmail = testData.invalidUsers[2];

    await loginPage.fillEmail(userWithEmptyEmail.email);
    await loginPage.fillPassword(userWithEmptyEmail.password);
    await loginPage.clickLoginButton();
    
    await page.waitForTimeout(1000);

    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.toLowerCase()).toContain('email');
  });

  /**
   * TEST CASE: TC-APP-005
   * Scenario: Navigate to forgot password
   */
  test('TC-APP-005: Navigate to forgot password @regression @all', async ({ 
    loginPage, 
    page 
  }) => {
    await loginPage.clickForgotPassword();
    
    await expect(page).toHaveURL(/.*\/(forgot-password|reset-password)/, { timeout: 5000 });
  });

});

/**
 * TEST SUITE: Authenticated User Actions
 * Tests that require user to be logged in
 */
test.describe('Authenticated User Actions @app @auth', () => {
  
  test('TC-APP-010: Logout @smoke @all', async ({ 
    authenticatedPage, 
    roomDashboardPage 
  }) => {
    // User is already logged in (via fixture)
    await roomDashboardPage.openUserMenu();
    await roomDashboardPage.logout();
    
    await expect(authenticatedPage).toHaveURL(/.*\/login/, { timeout: 10000 });
  });

});
