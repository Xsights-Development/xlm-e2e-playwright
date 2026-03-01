import { test, expect } from '@/fixtures/auth.fixture.js';
import { DashboardPage } from '@/pages/dashboard.page.js';
import { ROUTES } from '@/configs/routes.js';

/**
 * Dashboard smoke test: login → dashboard → verify URL and tags-deployed panel
 * Aligned with xahwm-docs/04-app-flows.md (post-login and dashboard)
 */
test.describe('Dashboard Smoke @smoke', () => {
  test('should land on dashboard after login and show tags-deployed panel', async ({
    authenticatedDashboard,
  }) => {
    const dashboardPage = new DashboardPage(authenticatedDashboard);
    const currentUrl = await dashboardPage.getCurrentUrl();
    expect(currentUrl).toContain(ROUTES.dashboard);
    await dashboardPage.verifyDashboardLoaded();
    const panelVisible = await dashboardPage.isTagsDeployedPanelVisible();
    expect(panelVisible).toBeTruthy();
  });
});
