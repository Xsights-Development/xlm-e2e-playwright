import { test as base, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '@/pages/login.page.js';
import { DashboardPage } from '@/pages/dashboard.page.js';
import { OverviewPage } from '@/pages/overview.page.js';
import { AdminApiClient } from '@/lib/api/admin-api.client.js';
import { AppApiClient } from '@/lib/api/app-api.client.js';
import { CubeApiClient } from '@/lib/api/cube-api.client.js';
import { ROUTES } from '@/configs/routes.js';

const baseURL = process.env.APP_URL ?? 'http://localhost:3000';
const testUser = process.env.APP_USER ?? 'user@example.com';
const testPass = process.env.APP_PASS ?? 'password123';
const testTenantIdentifier = process.env.APP_TENANT_IDENTIFIER ?? process.env.APP_TENANT ?? '';
const testFarmIdentifier = process.env.APP_FARM_IDENTIFIER ?? process.env.APP_FARM ?? '';
const testLocationType = process.env.APP_LOCATION_TYPE ?? undefined;
const testLocationIdentifier = process.env.APP_LOCATION_IDENTIFIER ?? undefined;

const dashboardUrlRegex = new RegExp(ROUTES.dashboard.replace(/\//g, '\\/'));

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

/** Full login flow to dashboard (optionally clear session first). */
async function loginToDashboard(page: Page, clearFirst: boolean): Promise<void> {
  if (clearFirst) {
    await clearSession(page);
  }
  const loginPage = new LoginPage(page);
  await loginPage.navigateToLoginPage();
  await loginPage.loginWithTenantAndFarm(testUser, testPass, testTenantIdentifier, testFarmIdentifier);
  await loginPage.waitForDashboardLoad();
  await page.waitForURL(dashboardUrlRegex, { timeout: 15000 });
}

/** Reuse session: stay on dashboard, or login again only when redirected to sign-in. */
async function ensureDashboardSession(page: Page): Promise<void> {
  if (dashboardUrlRegex.test(page.url())) {
    return;
  }

  await page.goto(`${baseURL}${ROUTES.dashboard}`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  if (dashboardUrlRegex.test(page.url())) {
    return;
  }

  const loginPage = new LoginPage(page);
  const onSignIn =
    page.url().includes(ROUTES.signIn) ||
    (await loginPage.emailInput.isVisible({ timeout: 3000 }).catch(() => false));

  if (onSignIn) {
    await loginPage.loginWithTenantAndFarm(
      testUser,
      testPass,
      testTenantIdentifier,
      testFarmIdentifier,
    );
    await loginPage.waitForDashboardLoad();
    await page.waitForURL(dashboardUrlRegex, { timeout: 15000 });
    return;
  }

  if (!dashboardUrlRegex.test(page.url())) {
    throw new Error(`Expected dashboard but at ${page.url()}`);
  }
}

type WorkerDashboardSession = {
  context: BrowserContext;
  page: Page;
};

type AuthFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  /** Precondition 1: Session cleared, then login + tenant + farm, on dashboard. Use for tests that need a logged-in user on dashboard. */
  authenticatedDashboard: Page;
  /**
   * Same as authenticatedDashboard but login once per worker; re-login only if session expired (sign-in).
   * Use with --project=farm or --project=overview (workers=1 in playwright.config). Avoid describe serial mode.
   */
  authenticatedDashboardSession: Page;
  /** Precondition 1 + 2: Session cleared, then login + tenant + farm + dashboard, then location selected so we stay on Overview. Use for tests that need Overview context. */
  authenticatedOnOverview: Page;
  /** Admin API client (logged in). Use to compare webapp data with Admin API. Cookie: Authorization="bearer <token>". */
  adminApi: AdminApiClient;
  /** App API client (logged in). Use for @contract tests vs same REST the UI calls (Bearer + tenant/farm headers). */
  appApi: AppApiClient;
  /** Cube.js client (token from App API POST /cube/token). Use for @contract weekly chart tests. */
  cubeApi: CubeApiClient;
};

type AuthWorkerFixtures = {
  workerDashboardSession: WorkerDashboardSession;
};

export const test = base.extend<AuthFixtures, AuthWorkerFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  workerDashboardSession: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await loginToDashboard(page, true);
      await use({ context, page });
      await context.close();
    },
    { scope: 'worker' },
  ],

  authenticatedDashboardSession: async ({ workerDashboardSession }, use) => {
    await ensureDashboardSession(workerDashboardSession.page);
    await use(workerDashboardSession.page);
  },

  authenticatedDashboard: async ({ page }, use) => {
    await loginToDashboard(page, true);
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

  appApi: async ({}, use) => {
    const client = new AppApiClient();
    await client.login();
    await use(client);
  },

  cubeApi: async ({ appApi }, use) => {
    const client = await CubeApiClient.fromAppApi(appApi);
    await use(client);
  },
});

export { expect } from '@playwright/test';
