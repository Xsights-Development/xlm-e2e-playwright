const { test, expect } = require('../fixtures/admin.fixture');

/**
 * SMOKE TESTS - ADMIN
 * Critical admin flows for production
 * Tags: @smoke @admin
 */

test.describe('Admin Critical Flows @smoke @admin', () => {

  /**
   * SMOKE TEST: Admin login flow
   */
  test('SMOKE-ADMIN-001: Complete admin login flow @production', async ({ 
    page,
    adminLoginPage, 
    adminTestData 
  }) => {
    console.log('🔥 SMOKE TEST: Complete admin login flow');
    
    const validAdmin = adminTestData.validAdmins[0];
    
    await adminLoginPage.goto();
    await adminLoginPage.login(validAdmin.email, validAdmin.password);
    
    await expect(page).toHaveURL(/.*\/admin\/(dashboard|home)/, { timeout: 15000 });
    
    console.log('✅ SMOKE TEST PASSED');
  });

  /**
   * SMOKE TEST: User management page loads
   */
  test('SMOKE-ADMIN-002: User management page accessible @production', async ({ 
    authenticatedAdminPage,
    userManagementPage 
  }) => {
    console.log('🔥 SMOKE TEST: User management page');
    
    await userManagementPage.goto();
    
    const isTableVisible = await userManagementPage.isTableVisible();
    expect(isTableVisible).toBeTruthy();
    
    console.log('✅ SMOKE TEST PASSED');
  });

});