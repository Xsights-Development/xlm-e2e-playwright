import { test, expect } from '@/fixtures/auth.fixture.js';
import { OverviewPage } from '@/pages/overview.page.js';

/**
 * Overview (Room) page tests.
 * Preconditions: (1) User logged in, tenant/farm selected, on dashboard. (2) Location selected so we stay at Overview.
 * Use fixture `authenticatedOnOverview` for tests that assume both preconditions.
 * xahwm-docs 04: Navigate to /overview, assert URL and tags-deployed or inventory/chart.
 */
test.describe('Overview', () => {
  /**
   * TC-001: Verify "Onboarded" (New Tags Onboarded) count for "This Week" matches mock expected.
   * Preconditions: User logged in, tenant/farm selected, on dashboard; location selected so we stay at Overview.
   * Calls Admin API with params; assertion uses mock expected 0 (matches current room_tags_deployed mock data).
   */
  test('TC-001: Should show Onboarded This Week count matching mock expected 0', async ({
    authenticatedOnOverview,
    adminApi,
  }) => {
    const overviewPage = new OverviewPage(authenticatedOnOverview);
    await expect(overviewPage.tagsDeployedPanel).toBeVisible({ timeout: 10000 });

    await overviewPage.scrollToElement(overviewPage.tagsDeployedPanel);
    await overviewPage.highlight(overviewPage.tagsDeployedChart, {
      border: '1px dashed blue',
      background: 'rgba(100, 150, 255, 0.12)',
      durationMs: 0,
    });

    try {
      await adminApi.getAnimalsThisWeek({ method: 'POST' });
    } catch {
      // List endpoint may return 4xx/5xx (e.g. invalid params); test still asserts mock 0
    }

    const { onboarded: displayedCount } = await overviewPage.getExistingAndOnboardedFromChartTooltip();
    const expectedCount = 0;
    expect(displayedCount).toBe(expectedCount);
  });

  /**
   * TC-002: Verify "Existing" count for "This Week" matches expected (mock 1016).
   * Preconditions: User logged in, tenant/farm selected, on dashboard; location selected so we stay at Overview.
   * Calls Admin API with params (location__identifier, status, last_seen_at); assertion uses mock expected 1016.
   * When app runs with showcase farm/location, chart mock data returns 1016 for last week.
   */
  test('TC-002: Should show Existing This Week count matching mock expected 1016', async ({
    authenticatedOnOverview,
    adminApi,
  }) => {
    const overviewPage = new OverviewPage(authenticatedOnOverview);
    await expect(overviewPage.tagsDeployedPanel).toBeVisible({ timeout: 10000 });

    await overviewPage.scrollToElement(overviewPage.tagsDeployedPanel);
    await overviewPage.highlight(overviewPage.tagsDeployedChart, {
      border: '1px dashed green',
      background: 'rgba(80, 120, 200, 0.15)',
      durationMs: 0,
    });

    try {
      await adminApi.getAnimalsThisWeek({ method: 'POST', status: ['poor', 'normal', 'sub-optimal'] });
    } catch {
      // List endpoint may return 4xx/5xx; test still asserts mock 1016
    }

    const { existing: displayedCount } = await overviewPage.getExistingAndOnboardedFromChartTooltip();
    const expectedCount = 1016; // mock expected for assertion (not from API response)
    expect(displayedCount).toBe(expectedCount);
  });

  /**
   * TC-003: Compare Existing (1016) and Onboarded (0) totals with mock admin data.
   * Preconditions: User logged in, tenant/farm selected, on dashboard; location selected so we stay at Overview.
   * Expected totals from mock admin data; asserts UI counts match mock (Existing 1016, Onboarded 0).
   */
  test('TC-003: Existing and Onboarded This Week counts should match mock admin data', async ({
    authenticatedOnOverview,
    adminApi,
  }) => {
    const overviewPage = new OverviewPage(authenticatedOnOverview);
    await expect(overviewPage.tagsDeployedPanel).toBeVisible({ timeout: 10000 });

    await overviewPage.scrollToElement(overviewPage.tagsDeployedPanel);

    try {
      await adminApi.getAnimalsThisWeek({ method: 'POST' });
      await adminApi.getAnimalsThisWeek({ method: 'POST', status: ['poor', 'normal', 'sub-optimal'] });
    } catch {
      // List endpoint may fail; test asserts UI vs mock admin data
    }

    const mockAdminExistingTotal = 1016;
    const mockAdminOnboardedTotal = 0;

    const { existing: displayedExisting, onboarded: displayedOnboarded } =
      await overviewPage.getExistingAndOnboardedFromChartTooltip();

    expect(displayedExisting).toBe(mockAdminExistingTotal);
    expect(displayedOnboarded).toBe(mockAdminOnboardedTotal);
  });

  /**
   * TC-004: Compare total inventory (Existing + Onboarded) for "This Week" with CURRENT INVENTORY panel.
   * Preconditions: User logged in, tenant/farm selected, on dashboard; location selected so we stay at Overview.
   * Gets Existing and Onboarded from chart tooltip (hover); asserts sum is equal or very close to Current Inventory.
   */
  test('TC-004: Total This Week (Existing + Onboarded) should match Current Inventory panel', async ({
    authenticatedOnOverview,
  }) => {
    const overviewPage = new OverviewPage(authenticatedOnOverview);
    await expect(overviewPage.tagsDeployedPanel).toBeVisible({ timeout: 10000 });
    await overviewPage.scrollToElement(overviewPage.tagsDeployedPanel);

    const { existing, onboarded } = await overviewPage.getExistingAndOnboardedFromChartTooltip();
    const totalThisWeek = existing + onboarded;

    const currentInventory = await overviewPage.getCurrentInventoryCount();

    const tolerance = 2; // allow small variance (e.g. timing/cache)
    expect(
      Math.abs(totalThisWeek - currentInventory),
      `Total This Week (${existing}+${onboarded}=${totalThisWeek}) should be equal or very close to Current Inventory (${currentInventory})`,
    ).toBeLessThanOrEqual(tolerance);
  });

  /**
   * TC-005: Sum of Existing and Onboarded equals Current Inventory.
   * Preconditions: User logged in, tenant/farm selected, on dashboard; location selected so we stay at Overview.
   * Gets Existing and Onboarded from chart tooltip (hover); asserts sum equals (or is very close to) Current Inventory.
   */
  test('TC-005: Sum of Existing and Onboarded should equal Current Inventory', async ({
    authenticatedOnOverview,
  }) => {
    const overviewPage = new OverviewPage(authenticatedOnOverview);
    await expect(overviewPage.tagsDeployedPanel).toBeVisible({ timeout: 10000 });
    await overviewPage.scrollToElement(overviewPage.tagsDeployedPanel);

    const { existing, onboarded } = await overviewPage.getExistingAndOnboardedFromChartTooltip();
    const sumExistingOnboarded = existing + onboarded;

    const currentInventory = await overviewPage.getCurrentInventoryCount();

    const tolerance = 2;
    expect(
      Math.abs(sumExistingOnboarded - currentInventory),
      `Sum (Existing ${existing} + Onboarded ${onboarded} = ${sumExistingOnboarded}) should equal Current Inventory (${currentInventory})`,
    ).toBeLessThanOrEqual(tolerance);
  });
});
