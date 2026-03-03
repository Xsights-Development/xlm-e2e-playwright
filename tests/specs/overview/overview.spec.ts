import { test, expect } from '@/fixtures/auth.fixture.js';
import { OverviewPage } from '@/pages/overview.page.js';

/**
 * Overview (Room) page tests.
 * Preconditions: (1) User logged in, tenant/farm selected, on dashboard. (2) Location selected so we stay at Overview.
 * Use fixture `authenticatedOnOverview` for tests that assume both preconditions.
 * xahwm-docs 04: Navigate to /overview, assert URL and tags-deployed or inventory/chart.
 */
test.describe('Overview - Tags Deployed', () => {
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

/**
 * Barn Layout popup (opened from Dashboard).
 * Scenario: Verify that the "Barn Layout" popup displays all required components.
 * Expected: Title, Current inventory, Zone diagram (pig count per zone/status),
 * Pig status legends, Compass icon, Close button.
 */
test.describe('Overview - Barn Layout', () => {
  test('displays all required components', async ({ authenticatedOnOverview }) => {
    const overviewPage = new OverviewPage(authenticatedOnOverview);

    // Open Barn Layout popup (zoom-in is on Overview)
    await overviewPage.openBarnLayoutPopup();

    const dialog = overviewPage.getBarnLayoutDialog();
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // 1. Title (data-testid; format "Title - LocationName")
    const titleEl = dialog.getByTestId('barn-layout-title');
    await expect(titleEl).toBeVisible();
    await expect(titleEl).toContainText(/\s-\s/);

    // 2. Current inventory (data-testid; assert visible and contains a number)
    const currentInventoryEl = dialog.getByTestId('barn-layout-current-inventory');
    await expect(currentInventoryEl).toBeVisible();
    await expect(currentInventoryEl).toContainText(/\d+/);

    // 3. Zone diagram (data-testid; contains either zone grid or no-layout message)
    const zoneDiagram = dialog.getByTestId('barn-layout-zone-diagram');
    await expect(zoneDiagram).toBeVisible();

    // 4. Pig status legends (data-testid; i18n-safe, no text assert)
    const legendSection = dialog.getByTestId('barn-layout-legend');
    await expect(legendSection).toBeVisible();

    // 5. Compass icon: img or icon near current inventory (IconImage renders img)
    const compassArea = dialog.locator('img[src*="compass"], div.flex.items-center.gap-2').first();
    await expect(compassArea).toBeVisible();

    // 6. Close button (data-testid)
    const closeButton = dialog.locator('xpath=..').getByTestId('barn-layout-close');
    await expect(closeButton).toBeVisible();

    // --- Information popup ---
    // const title = (await titleEl.textContent())?.trim() ?? '';
    // const currentInventoryText = (await currentInventoryEl.textContent())?.trim() ?? '';
    // const legendText = (await legendSection.textContent())?.trim() ?? '';
    // const hasCompass = await compassArea.isVisible();
    // const closeButtonText = (await closeButton.textContent())?.trim() ?? '';

    // Zone diagram: extract labels + values via DOM (resilient to Tailwind class names)
    // const zoneDiagramRows: string[] = await dialog.evaluate((root: HTMLElement) => {
    //   const rows = root.querySelectorAll('div[class*="justify-evenly"]');
    //   const result: string[] = [];
    //   rows.forEach((row) => {
    //     const ps = row.querySelectorAll('p');
    //     if (ps.length < 3) return;
    //     const normal = (ps[0]?.textContent ?? '').trim();
    //     const subOptimal = (ps[1]?.textContent ?? '').trim();
    //     const poor = (ps[2]?.textContent ?? '').trim();
    //     const card = row.parentElement?.parentElement;
    //     if (!card) return;
    //     const nameEl = card.querySelector('p[class*="blue-500"]');
    //     const zoneName = (nameEl?.textContent ?? '').trim();
    //     if (zoneName) result.push(`${zoneName}: Normal=${normal}, Sub-optimal=${subOptimal}, Poor=${poor}`);
    //   });
    //   return result;
    // });
    // const zoneDiagramText =
    //   zoneDiagramRows.length > 0 ? zoneDiagramRows.join('\n  ') : (await zoneDiagram.textContent())?.trim() ?? '';

    // console.log('\n--- Barn Layout popup ---');
    // console.log('Title:', title);
    // console.log('Current inventory:', currentInventoryText);
    // console.log('Zone diagram (labels + values):');
    // console.log(zoneDiagramText);
    // const legendFormatted = legendText
    //   .replace(/(Healthy)/gi, ' | $1')
    //   .replace(/(Sub-optimal|Suboptimal)/gi, ' | $1')
    //   .replace(/(Poor)/gi, ' | $1')
    //   .replace(/\s+/g, ' ')
    //   .trim();
    // console.log('Pig status legends:', legendFormatted);
    // console.log('Compass icon:', hasCompass ? 'visible' : 'not visible');
    // console.log('Close button:', closeButtonText || 'visible');
    // console.log('----------------------------\n');

    // Close dialog and verify it closes
    await closeButton.click();
    await expect(dialog).toBeHidden({ timeout: 5000 });
  });
});
