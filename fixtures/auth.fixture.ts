import { test as base, Page } from '@playwright/test';
import { LoginPage } from '@/pages/login.page.js';
import { DashboardPage } from '@/pages/dashboard.page.js';
import { OverviewPage } from '@/pages/overview.page.js';
import { ROUTES } from '@/configs/routes.js';

const testUser = process.env.APP_USER ?? 'user@example.com';
const testPass = process.env.APP_PASS ?? 'password123';
const testTenant = process.env.APP_TENANT ?? 'Test Tenant';
const testFarm = process.env.APP_FARM ?? 'Test Farm';
const testLocationName = process.env.APP_LOCATION_NAME ?? undefined;

type AuthFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  /** Page after full login and confirmed on dashboard (URL contains /dashboard). Precondition 1. */
  authenticatedDashboard: Page;
  /** Page after login + tenant + farm + dashboard, then location selected so we stay on Overview. Preconditions 1 + 2. */
  authenticatedOnOverview: Page;
};

export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  authenticatedDashboard: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();
    await loginPage.loginWithTenantAndFarm(testUser, testPass, testTenant, testFarm);
    await loginPage.waitForDashboardLoad();
    await page.waitForURL(new RegExp(ROUTES.dashboard.replace(/\//g, '\\/')), { timeout: 15000 });
    await use(page);
  },

  /** Precondition 1 + 2: Logged in, tenant/farm selected, on dashboard; then select location so we stay on Overview page. */
  authenticatedOnOverview: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();
    await loginPage.loginWithTenantAndFarm(testUser, testPass, testTenant, testFarm);
    await loginPage.waitForDashboardLoad();
    await page.waitForURL(new RegExp(ROUTES.dashboard.replace(/\//g, '\\/')), { timeout: 15000 });
    const overviewPage = new OverviewPage(page);
    await overviewPage.selectLocationAndWaitForOverview(testLocationName);
    await use(page);
  },
});

export { expect } from '@playwright/test';
