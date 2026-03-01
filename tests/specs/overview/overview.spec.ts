import { test, expect } from '@/fixtures/auth.fixture.js';
import { OverviewPage } from '@/pages/overview.page.js';
import { ROUTES } from '@/configs/routes.js';

/**
 * Overview (Room) page tests.
 * Preconditions: (1) User logged in, tenant/farm selected, on dashboard. (2) Location selected so we stay at Overview.
 * Use fixture `authenticatedOnOverview` for tests that assume both preconditions.
 * xahwm-docs 04: Navigate to /overview, assert URL and tags-deployed or inventory/chart.
 */
test.describe('Overview', () => {
  test('should show Overview content when preconditions 1+2 are met', async ({ authenticatedOnOverview }) => {
    const overviewPage = new OverviewPage(authenticatedOnOverview);
    await overviewPage.verifyOverviewLoaded();
  });

  test('should load overview page via direct URL after login', async ({ authenticatedDashboard }) => {
    const overviewPage = new OverviewPage(authenticatedDashboard);
    await overviewPage.navigateToOverview();
    await overviewPage.verifyOverviewLoaded();
  });

  test('should reach overview via nav link from dashboard', async ({ authenticatedDashboard }) => {
    const overviewPage = new OverviewPage(authenticatedDashboard);
    await overviewPage.goToOverviewViaNav();
    const url = await overviewPage.getCurrentUrl();
    expect(url).toContain(ROUTES.overview);
  });
});
