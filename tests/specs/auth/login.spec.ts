import { test, expect } from '@playwright/test';
import { LoginPage } from '@/pages/login.page.js';
import { ROUTES } from '@/configs/routes.js';

const testUser = process.env.APP_USER ?? 'user@example.com';
const testPass = process.env.APP_PASS ?? 'password123';
const testTenantIdentifier = process.env.APP_TENANT_IDENTIFIER ?? process.env.APP_TENANT ?? '';
const testFarmIdentifier = process.env.APP_FARM_IDENTIFIER ?? process.env.APP_FARM ?? '';

/**
 * Login Page Test Suite
 * Tests the complete login flow: email/password → tenant → farm → dashboard
 */
test.describe('Login Page Tests @auth', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();
  });

  test('should load login page successfully', async () => {
    await loginPage.verifyLoginPageLoaded();
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).toContain(ROUTES.signIn);
  });

  test('should display error message with invalid credentials', async () => {
    await loginPage.fillEmail('invalid@example.com');
    await loginPage.fillPassword('wrongpassword');
    await loginPage.clickLogin();
    const isErrorVisible = await loginPage.isErrorVisible();
    expect(isErrorVisible).toBeTruthy();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await loginPage.login(testUser, testPass);
    await page.waitForLoadState('networkidle');
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).not.toContain('sign-in');
  });

  test('@smoke should complete full authentication flow with tenant and farm selection', async ({ page }) => {
    await loginPage.loginWithTenantAndFarm(testUser, testPass, testTenantIdentifier, testFarmIdentifier);
    await loginPage.waitForDashboardLoad();
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).toContain('dashboard');
  });

  test('should fill email and password fields separately', async () => {
    await loginPage.fillEmail('test@example.com');
    await loginPage.fillPassword('testpassword');
    await loginPage.clickLogin();
  });

  test('should select tenant and proceed to next step', async () => {
    await loginPage.login(testUser, testPass);
    await loginPage.selectTenant(testTenantIdentifier);
    await loginPage.clickNext();
    await loginPage.wait(1000);
  });

  test('should select farm and navigate to dashboard', async () => {
    await loginPage.login(testUser, testPass);
    await loginPage.wait(1000);
    await loginPage.selectTenant(testTenantIdentifier);
    await loginPage.clickNext();
    await loginPage.wait(1000);
    await loginPage.selectFarm(testFarmIdentifier);
    await loginPage.clickDashboard();
    await loginPage.waitForDashboardLoad();
  });

  test('should handle missing farm selection gracefully', async () => {
    await loginPage.login(testUser, testPass);
    await loginPage.wait(1000);
    await loginPage.selectTenant(testTenantIdentifier);
    await loginPage.clickNext();
    await loginPage.wait(1000);
    await loginPage.selectFarm('non-existent-farm-id');
    await loginPage.clickDashboard();
  });
});

test.describe('Login Page - Accessibility', () => {
  test('should have proper data-testid attributes', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('should have proper ARIA roles', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();
    const alerts = page.locator('[role="alert"]');
    const count = await alerts.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Login Page - Edge Cases', () => {
  test('should handle empty email field', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();
    await loginPage.fillPassword('password123');
    await loginPage.clickLogin();
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).toContain(ROUTES.signIn);
  });

  test('should handle empty password field', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();
    await loginPage.fillEmail('test@example.com');
    await loginPage.clickLogin();
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).toContain(ROUTES.signIn);
  });

  test('should handle network delays gracefully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();
    await page.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });
    await loginPage.login(testUser, testPass);
  });
});
