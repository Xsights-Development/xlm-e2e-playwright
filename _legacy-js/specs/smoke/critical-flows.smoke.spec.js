// app/tests/specs/smoke/critical-flows.smoke.spec.js
const { test, expect } = require('../../fixtures/base-fixture');

/**
 * SMOKE TESTS - APP
 * Critical user flows that must work in production
 * Tags: @smoke
 */

test.describe('App Critical Flows @smoke @app', () => {

  /**
   * SMOKE TEST 1: End-to-end login flow
   */
  test('SMOKE-001: Complete login flow @production', async ({ 
    page,
    loginPage, 
    dashboardPage, 
    testConfig 
  }) => {
    console.log('🔥 SMOKE TEST: Complete login flow');
    
    const validUser = {
      email: testConfig.credentials.username,
      password: testConfig.credentials.password
    };
    
    // Login
    await loginPage.goto();
    await loginPage.login(validUser.email, validUser.password);
    
    // Verify dashboard
    await expect(page).toHaveURL(/.*\/(dashboard|home)/, { timeout: 15000 });
    const isWelcomeVisible = await dashboardPage.isWelcomeMessageVisible();
    expect(isWelcomeVisible).toBeTruthy();
    
    console.log('✅ SMOKE TEST PASSED');
  });

  /**
   * SMOKE TEST 2: Navigation test
   */
  test('SMOKE-002: Main navigation works @production', async ({ 
    authenticatedPage,
    dashboardPage 
  }) => {
    console.log('🔥 SMOKE TEST: Main navigation');
    
    // Verify navigation menu is visible
    const isNavVisible = await dashboardPage.isNavigationVisible();
    expect(isNavVisible).toBeTruthy();
    
    console.log('✅ SMOKE TEST PASSED');
  });

});