import { test, expect } from '@/fixtures/auth.fixture.js';
import { OverviewPage } from '@/pages/overview.page.js';
import { sumZoneDiagramTotals } from '@/lib/helpers.js';

/**
 * Overview (Room) page tests.
 * Preconditions: (1) User logged in, tenant/farm selected. (2) Location selected so we stay at Overview.
 * Use fixture `authenticatedOnOverview` for tests that assume both.
 * xahwm-docs 04: Navigate to /overview, assert URL and tags-deployed or inventory/chart.
 */
test.describe('Overview - Tags Deployed', () => {
  /**
   * Verify "Onboarded" (New Tags Onboarded) count for "This Week" matches mock expected.
   * Calls Admin API with params; assertion uses mock expected 0 (matches current room_tags_deployed mock data).
   */
  test('Onboarded This Week count matches mock expected 0', async ({
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
   * Verify "Existing" count for "This Week" matches expected (mock 1016).
   * Calls Admin API with params (location__identifier, status, last_seen_at); assertion uses mock expected 1016.
   */
  test('Existing This Week count matches mock expected 1016', async ({
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
   * Compare Existing (1016) and Onboarded (0) totals with mock admin data.
   * Asserts UI counts match mock (Existing 1016, Onboarded 0).
   */
  test('Existing and Onboarded This Week match mock admin data', async ({
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
   * Compare total (Existing + Onboarded) for "This Week" with CURRENT INVENTORY panel.
   * Asserts sum is equal or very close to Current Inventory (tolerance 2).
   */
  test('Total This Week (Existing + Onboarded) matches Current Inventory panel', async ({
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
   * Sum of Existing and Onboarded equals (or is very close to) Current Inventory.
   */
  test('Sum of Existing and Onboarded equals Current Inventory', async ({
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
 * Overview - Barn Layout popup (opened via zoom-in on Overview).
 * Covers: popup UI (title, current inventory, zone diagram, legends, compass, close)
 * and consistency of current inventory with Overview panel and Barns menu.
 */
test.describe('Overview - Barn Layout', () => {
  test('displays all required components (title, inventory, zone diagram, legends, compass, close)', async ({
    authenticatedOnOverview,
  }) => {
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
    const title = (await titleEl.textContent())?.trim() ?? '';
    const currentInventoryText = (await currentInventoryEl.textContent())?.trim() ?? '';
    const legendText = (await legendSection.textContent())?.trim() ?? '';
    const hasCompass = await compassArea.isVisible();
    const closeButtonText = (await closeButton.textContent())?.trim() ?? '';

    // Zone diagram: extract labels + values via DOM (resilient to Tailwind class names)
    const zoneDiagramRows: string[] = await dialog.evaluate((root: HTMLElement) => {
      const rows = root.querySelectorAll('div[class*="justify-evenly"]');
      const result: string[] = [];
      rows.forEach((row) => {
        const ps = row.querySelectorAll('p');
        if (ps.length < 3) return;
        const normal = (ps[0]?.textContent ?? '').trim();
        const subOptimal = (ps[1]?.textContent ?? '').trim();
        const poor = (ps[2]?.textContent ?? '').trim();
        const card = row.parentElement?.parentElement;
        if (!card) return;
        const nameEl = card.querySelector('p[class*="blue-500"]');
        const zoneName = (nameEl?.textContent ?? '').trim();
        if (zoneName) result.push(`${zoneName}: Normal=${normal}, Sub-optimal=${subOptimal}, Poor=${poor}`);
      });
      return result;
    });
    const zoneDiagramText =
      zoneDiagramRows.length > 0 ? zoneDiagramRows.join('\n  ') : (await zoneDiagram.textContent())?.trim() ?? '';

    console.log('\n--- Barn Layout popup ---');
    console.log('Title:', title);
    console.log('Current inventory:', currentInventoryText);
    console.log('Zone diagram (labels + values):');
    console.log(zoneDiagramText);
    const legendFormatted = legendText
      .replace(/(Healthy)/gi, ' | $1')
      .replace(/(Sub-optimal|Suboptimal)/gi, ' | $1')
      .replace(/(Poor)/gi, ' | $1')
      .replace(/\s+/g, ' ')
      .trim();
    console.log('Pig status legends:', legendFormatted);
    console.log('Compass icon:', hasCompass ? 'visible' : 'not visible');
    console.log('Close button:', closeButtonText || 'visible');
    console.log('----------------------------\n');

    // Close dialog and verify it closes
    await closeButton.click();
    await expect(dialog).toBeHidden({ timeout: 5000 });
  });

  test('current inventory matches Overview panel (S+G), zone total, and Barns menu', async ({
    authenticatedOnOverview,
  }) => {
    const overviewPage = new OverviewPage(authenticatedOnOverview);

    // Read Overview current inventory and Barns menu current room count before opening popup
    const overviewInventory = await overviewPage.getCurrentInventoryCount();
    const barnsMenuCurrentRoomCount = await overviewPage.getBarnsMenuCurrentRoomCount();

    // Open Barn Layout popup and read popup current inventory + zone total
    await overviewPage.openBarnLayoutPopup();
    const dialog = overviewPage.getBarnLayoutDialog();
    await expect(dialog).toBeVisible({ timeout: 10000 });

    const popupInventory = await overviewPage.getBarnLayoutPopupCurrentInventory();

    const zoneDiagramRows: string[] = await dialog.evaluate((root: HTMLElement) => {
      const rows = root.querySelectorAll('div[class*="justify-evenly"]');
      const result: string[] = [];
      rows.forEach((row) => {
        const ps = row.querySelectorAll('p');
        if (ps.length < 3) return;
        const normal = (ps[0]?.textContent ?? '').trim();
        const subOptimal = (ps[1]?.textContent ?? '').trim();
        const poor = (ps[2]?.textContent ?? '').trim();
        const card = row.parentElement?.parentElement;
        if (!card) return;
        const nameEl = card.querySelector('p[class*="blue-500"]');
        const zoneName = (nameEl?.textContent ?? '').trim();
        if (zoneName) result.push(`${zoneName}: Normal=${normal}, Sub-optimal=${subOptimal}, Poor=${poor}`);
      });
      return result;
    });
    const zoneTotal = sumZoneDiagramTotals(zoneDiagramRows);

    // Log popup info (same format as TC-001)
    const titleEl = dialog.getByTestId('barn-layout-title');
    const currentInventoryEl = dialog.getByTestId('barn-layout-current-inventory');
    const zoneDiagram = dialog.getByTestId('barn-layout-zone-diagram');
    const legendSection = dialog.getByTestId('barn-layout-legend');
    const compassArea = dialog.locator('img[src*="compass"], div.flex.items-center.gap-2').first();
    const closeButton = dialog.locator('xpath=..').getByTestId('barn-layout-close');
    const title = (await titleEl.textContent())?.trim() ?? '';
    const currentInventoryText = (await currentInventoryEl.textContent())?.trim() ?? '';
    const legendText = (await legendSection.textContent())?.trim() ?? '';
    const hasCompass = await compassArea.isVisible();
    const closeButtonText = (await closeButton.textContent())?.trim() ?? '';
    const zoneDiagramText =
      zoneDiagramRows.length > 0 ? zoneDiagramRows.join('\n  ') : (await zoneDiagram.textContent())?.trim() ?? '';
    const legendFormatted = legendText
      .replace(/(Healthy)/gi, ' | $1')
      .replace(/(Sub-optimal|Suboptimal)/gi, ' | $1')
      .replace(/(Poor)/gi, ' | $1')
      .replace(/\s+/g, ' ')
      .trim();
    console.log('\n--- Barn Layout popup ---');
    console.log('Title:', title);
    console.log('Current inventory:', currentInventoryText);
    console.log('Zone diagram (labels + values):');
    console.log(zoneDiagramText);
    console.log('Pig status legends:', legendFormatted);
    console.log('Compass icon:', hasCompass ? 'visible' : 'not visible');
    console.log('Close button:', closeButtonText || 'visible');
    console.log('Overview Current inventory (S+G):', overviewInventory);
    console.log('Popup Current inventory:', popupInventory);
    console.log('Zone total (sum of all pens/zones):', zoneTotal);
    console.log('Barns menu current room count:', barnsMenuCurrentRoomCount);
    console.log('----------------------------\n');

    expect(
      popupInventory,
      `Popup Current inventory (${popupInventory}) should equal Overview Current inventory S+G (${overviewInventory})`,
    ).toBe(overviewInventory);

    if (zoneDiagramRows.length > 0) {
      expect(
        zoneTotal,
        `Sum of all pens/zones (${zoneTotal}) should equal Popup Current inventory (${popupInventory})`,
      ).toBe(popupInventory);
    }

    expect(
      popupInventory,
      `Popup Current inventory (${popupInventory}) should equal current room count in Barns menu (${barnsMenuCurrentRoomCount})`,
    ).toBe(barnsMenuCurrentRoomCount);

    // Close dialog
    await closeButton.click();
    await expect(dialog).toBeHidden({ timeout: 5000 });
  });
});
