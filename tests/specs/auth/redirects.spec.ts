import { test, expect } from '@playwright/test';
import { ROUTES } from '@/configs/routes.js';
import { LoginPage } from '@/pages/login.page.js';

const testUser = process.env.APP_USER ?? 'user@example.com';
const testPass = process.env.APP_PASS ?? 'password123';
const testTenantIdentifier = process.env.APP_TENANT_IDENTIFIER ?? process.env.APP_TENANT ?? '';
const testFarmIdentifier = process.env.APP_FARM_IDENTIFIER ?? process.env.APP_FARM ?? '';

/**
 * Route guard redirects (xahwm-docs 03-auth-flows).
 * - Unauthenticated /dashboard → redirect to /sign-in
 * - Authenticated /sign-in → redirect to /dashboard
 */
test.describe('Auth redirects @auth', () => {
  test('unauthenticated visit to /dashboard should redirect to /sign-in', async ({ page }) => {
    await page.goto(ROUTES.dashboard);
    await page.waitForURL(new RegExp(ROUTES.signIn.replace(/\//g, '\\/')), { timeout: 10000 });
    await expect(page).toHaveURL(new RegExp(ROUTES.signIn.replace(/\//g, '\\/')));
  });

  test('authenticated visit to /sign-in should redirect to /dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();
    await loginPage.loginWithTenantAndFarm(testUser, testPass, testTenantIdentifier, testFarmIdentifier);
    await loginPage.waitForDashboardLoad();
    await page.goto(ROUTES.signIn);
    await page.waitForURL(new RegExp(ROUTES.dashboard.replace(/\//g, '\\/')), { timeout: 10000 });
    await expect(page).toHaveURL(new RegExp(ROUTES.dashboard.replace(/\//g, '\\/')));
  });
});
