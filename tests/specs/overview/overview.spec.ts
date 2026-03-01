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
  /** TAGS DEPLOYED is i18n-translated; use data-testid for stable assertion. */
  test('should show TAGS DEPLOYED area on Overview (i18n-safe)', async ({ authenticatedOnOverview }) => {
    const overviewPage = new OverviewPage(authenticatedOnOverview);
    await expect(overviewPage.tagsDeployedPanel).toBeVisible({ timeout: 10000 });
    await expect(overviewPage.tagsDeployedTitle).toBeVisible();

    // Visual highlight so the asserted area is visible in headed run or screenshots
    await overviewPage.scrollToElement(overviewPage.tagsDeployedPanel);
    await overviewPage.highlight(overviewPage.tagsDeployedPanel, {
      border: '3px solid red',
      background: 'rgba(255, 200, 0, 0.25)',
      durationMs: 2000,
    });
    await overviewPage.highlight(overviewPage.tagsDeployedTitle, {
      border: '2px solid darkred',
      background: 'rgba(255, 100, 100, 0.2)',
      durationMs: 0,
    });
  });
});
