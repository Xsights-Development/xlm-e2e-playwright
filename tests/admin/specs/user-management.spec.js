const { test, expect } = require('../fixtures/admin.fixture');

/**
 * TEST SUITE: User Management
 * SECTION: Admin - User Management
 * 
 * Manual Test Case: TC-ADMIN-101
 */

test.describe('User Management Module @admin @users', () => {

  /**
   * TEST CASE: TC-ADMIN-101
   * Scenario: Admin adds new user
   * 
   * Tags: @regression @staging
   */
  test('TC-ADMIN-101: Add new user @regression @staging', async ({ 
    adminOnUserManagementPage,
    usersTestData 
  }) => {
    console.log('🧪 Test: Add new user');
    
    const { page, userManagementPage } = adminOnUserManagementPage;
    const newUser = usersTestData.newUsers[0];
    
    console.log(`   Adding user: ${newUser.name}`);

    // Get initial user count
    const initialCount = await userManagementPage.getUserCount();
    console.log(`   Initial user count: ${initialCount}`);

    // Act - Add user
    console.log('   Step 1: Click Add User button');
    await userManagementPage.clickAddUser();
    
    console.log('   Step 2: Fill user form');
    await userManagementPage.fillUserForm(newUser);
    
    console.log('   Step 3: Click Save');
    await userManagementPage.clickSave();
    
    // Wait for success message
    await page.waitForTimeout(2000);

    // Assert
    console.log('   Verify: Success message is visible');
    const isSuccessVisible = await userManagementPage.isSuccessMessageVisible();
    expect(isSuccessVisible).toBeTruthy();
    
    console.log('   Verify: User count increased');
    const newCount = await userManagementPage.getUserCount();
    expect(newCount).toBeGreaterThan(initialCount);
    
    console.log('✅ Test passed: Add new user');
  });

  /**
   * TEST CASE: TC-ADMIN-102
   * Scenario: Search for user
   */
  test('TC-ADMIN-102: Search for user @regression @all', async ({ 
    authenticatedAdminPage,
    userManagementPage 
  }) => {
    console.log('🧪 Test: Search for user');
    
    await userManagementPage.goto();
    
    console.log('   Step 1: Enter search term');
    await userManagementPage.searchUser('john');
    
    console.log('   Verify: Table is visible');
    const isTableVisible = await userManagementPage.isTableVisible();
    expect(isTableVisible).toBeTruthy();
    
    console.log('✅ Test passed: Search for user');
  });

});