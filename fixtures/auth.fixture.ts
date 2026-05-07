import { test as base, Page } from '@playwright/test';
import { LoginPage } from '@/pages/login.page.js';
import { DashboardPage } from '@/pages/dashboard.page.js';
import { OverviewPage } from '@/pages/overview.page.js';
import { AdminApiClient } from '@/lib/admin-api.client.js';
import { ROUTES } from '@/configs/routes.js';

const baseURL = process.env.APP_URL ?? 'http://localhost:3000';
const testUser = process.env.APP_USER ?? 'user@example.com';
const testPass = process.env.APP_PASS ?? 'password123';
const testTenantIdentifier = process.env.APP_TENANT_IDENTIFIER ?? process.env.APP_TENANT ?? '';
const testFarmIdentifier = process.env.APP_FARM_IDENTIFIER ?? process.env.APP_FARM ?? '';
const testLocationType = process.env.APP_LOCATION_TYPE ?? undefined;
const testLocationIdentifier = process.env.APP_LOCATION_IDENTIFIER ?? undefined;

/** Clear session (cookies + storage) so preconditions always start from a clean state. */
async function clearSession(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
  });
}

type AuthFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  /** Precondition 1: Session cleared, then login + tenant + farm, on dashboard. Use for tests that need a logged-in user on dashboard. */
  authenticatedDashboard: Page;
  /** Precondition 1 + 2: Session cleared, then login + tenant + farm + dashboard, then location selected so we stay on Overview. Use for tests that need Overview context. */
  authenticatedOnOverview: Page;
  /** Admin API client (logged in). Use to compare webapp data with Admin API. Cookie: Authorization="bearer <token>". */
  adminApi: AdminApiClient;
};

export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  authenticatedDashboard: async ({ page }, use) => {
    await clearSession(page);
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();
    await loginPage.loginWithTenantAndFarm(testUser, testPass, testTenantIdentifier, testFarmIdentifier);
    await loginPage.waitForDashboardLoad();
    await page.waitForURL(new RegExp(ROUTES.dashboard.replace(/\//g, '\\/')), { timeout: 15000 });
    await use(page);
  },

  authenticatedOnOverview: async ({ authenticatedDashboard: page }, use) => {
    const overviewPage = new OverviewPage(page);
    await overviewPage.selectLocationAndWaitForOverview(
      undefined,
      testLocationType,
      testLocationIdentifier,
    );
    await use(page);
  },

  adminApi: async ({}, use) => {
    const client = new AdminApiClient();
    await client.login();
    await use(client);
  },
});

export { expect } from '@playwright/test';
