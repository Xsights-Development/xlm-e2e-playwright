import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@/pages/base.page.js';
import { ROUTES } from '@/configs/routes.js';
import { OVERVIEW_TAB_TEST_ID, type OverviewTabKey } from '@/configs/constants.js';

/**
 * OverviewPage - Page Object for Room Overview (/overview)
 * xahwm-docs 04: Room-level screen, tabs Inventory / Health Status / Location Condition.
 * Selectors from xahwm-docs/06-selectors.md (tags-deployed-panel, inventory-title, tags-deployed-chart, barns-item).
 */
export class OverviewPage extends BasePage {
  readonly tagsDeployedPanel: Locator;
  readonly tagsDeployedTitle: Locator;
  readonly inventoryTitle: Locator;
  readonly tagsDeployedChart: Locator;
  readonly existingThisWeekCount: Locator;
  readonly onboardedThisWeekCount: Locator;
  readonly activeTagsXiotG: Locator;
  readonly activeTagsXiotS: Locator;
  readonly barnsMenu: Locator;
  readonly barnsItem: Locator;

  // Barn Layout popup (opened from Dashboard; data-testid from xahwm-dashboard RoomLayoutDialog / RoomLayoutZoomed)
  readonly barnLayoutZoomIn: Locator;

  constructor(page: Page) {
    super(page);
    this.tagsDeployedPanel = page.getByTestId('tags-deployed-panel');
    this.tagsDeployedTitle = page.getByTestId('tags-deployed-title');
    this.inventoryTitle = page.getByTestId('inventory-title');
    this.tagsDeployedChart = page.getByTestId('tags-deployed-chart');
    this.existingThisWeekCount = page.getByTestId('existing-this-week-count');
    this.onboardedThisWeekCount = page.getByTestId('onboarded-this-week-count');
    this.activeTagsXiotG = page.getByTestId('active-tags-xiot-g');
    this.activeTagsXiotS = page.getByTestId('active-tags-xiot-s');
    this.barnsMenu = page.getByTestId('barns-menu');
    this.barnsItem = page.getByTestId('barns-item');
    this.barnLayoutZoomIn = page.getByTestId('zoom-in');
  }

  /**
   * Open Barn Layout popup by clicking the zoom-in button on Overview.
   */
  async openBarnLayoutPopup(): Promise<void> {
    await this.barnLayoutZoomIn.scrollIntoViewIfNeeded({ timeout: 45000 });
    await this.click(this.barnLayoutZoomIn);
  }

  /**
   * Get Barn Layout dialog locator (data-testid from RoomLayoutDialog).
   */
  getBarnLayoutDialog(): Locator {
    return this.page.getByTestId('barn-layout-dialog');
  }

  /**
   * Parse current inventory number from Barn Layout popup (barn-layout-current-inventory).
   * Call when dialog is open. Text is i18n (e.g. "Current inventory: 123"); parses number after colon, strips commas.
   * If expected is provided, waits until the element contains that value (handles async useShowcaseCubeData load).
   * @param expected - When set, wait for element to contain this number (e.g. Overview current inventory) then parse and return.
   */
  async getBarnLayoutPopupCurrentInventory(expected?: number): Promise<number> {
    const dialog = this.getBarnLayoutDialog();
    const el = dialog.getByTestId('barn-layout-current-inventory');
    await el.waitFor({ state: 'visible', timeout: 10000 });
    if (expected !== undefined) {
      const expectedStr = String(expected);
      const regex = new RegExp(expectedStr.split('').join('[,.\\s]*'));
      await expect(el).toContainText(regex, { timeout: 15000 });
    }
    const text = (await el.textContent())?.trim() ?? '';
    const match = text.match(/[\d,.]+\s*$/);
    if (!match) return 0;
    const parsed = parseInt(match[0].replace(/[,.\s]/g, ''), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Current room's count from Barns menu (active barns-item). Uses active item's font-bold styling.
   * Fallback: first visible barns-item-count when only one room is visible.
   */
  async getBarnsMenuCurrentRoomCount(): Promise<number> {
    await this.barnsMenu.waitFor({ state: 'visible', timeout: 15000 });
    const activeItem = this.barnsItem.filter({ has: this.page.locator('[class*="font-bold"]') }).first();
    const countEl = (await activeItem.count() > 0)
      ? activeItem.getByTestId('barns-item-count')
      : this.page.getByTestId('barns-item-count').first();
    await countEl.waitFor({ state: 'visible', timeout: 5000 });
    const text = (await countEl.textContent())?.trim() ?? '';
    const parsed = parseInt(text.replace(/,/g, ''), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Sum of all visible room counts in Barns menu (barns-item-count). Expand categories if needed for full total.
   */
  async getBarnsMenuTotalAllRooms(): Promise<number> {
    await this.barnsMenu.waitFor({ state: 'visible', timeout: 15000 });
    const countLocators = this.page.getByTestId('barns-item-count');
    const n = await countLocators.count();
    let total = 0;
    for (let i = 0; i < n; i++) {
      const text = (await countLocators.nth(i).textContent())?.trim() ?? '';
      const parsed = parseInt(text.replace(/,/g, ''), 10);
      if (!Number.isNaN(parsed)) total += parsed;
    }
    return total;
  }

  async navigateToOverview(): Promise<void> {
    await this.goto(ROUTES.overview);
    await this.waitForPageLoad();
  }

  /** Assert URL is /overview and at least one key element is visible. */
  async verifyOverviewLoaded(): Promise<void> {
    const url = await this.getCurrentUrl();
    expect(url).toContain(ROUTES.overview);
    await Promise.race([
      this.tagsDeployedPanel.waitFor({ state: 'visible', timeout: 10000 }),
      this.inventoryTitle.waitFor({ state: 'visible', timeout: 10000 }),
      this.tagsDeployedChart.waitFor({ state: 'visible', timeout: 10000 }),
    ]);
  }

  /** Click nav link to Overview (by href). */
  async goToOverviewViaNav(): Promise<void> {
    await this.page.locator(`a[href="${ROUTES.overview}"]`).first().click();
    await this.waitForPageLoad();
  }

  /** Click first barn/room in FarmNavigation. */
  async selectFirstBarn(): Promise<void> {
    await this.barnsItem.first().click();
    await this.wait(500);
  }

  /**
   * Expand a category (barn group) in the Barns menu (FarmNavigation) on the right.
   * Uses data-location-type (i18n-safe); normalizes category to lowercase to match backend type (e.g. "General" → "general").
   * If the category section is not visible (e.g. tenant has no rooms of that type), returns without throwing.
   * @param category - e.g. APP_LOCATION_TYPE ("General" or "general", "nursery_room")
   */
  async expandBarnsCategory(category: string): Promise<void> {
    const locationType = category.toLowerCase().trim();
    const section = this.page.locator(`[data-location-type="${locationType}"]`).first();
    try {
      await section.waitFor({ state: 'visible', timeout: 15000 });
      await section.click();
      await this.wait(300);
    } catch {
      // Category not in menu (e.g. tenant has no rooms of this type) or menu not ready; skip expand
    }
  }

  /**
   * Get the currently active location identifier from the Barns menu (the item with font-bold).
   */
  async getActiveLocationIdentifier(): Promise<string | null> {
    await this.barnsMenu.waitFor({ state: 'visible', timeout: 15000 });
    const activeItem = this.barnsItem
      .filter({ has: this.page.locator('[class*="font-bold"]') })
      .first();
    const id = await activeItem.getAttribute('data-location-identifier');
    return id ?? null;
  }

  /**
   * Click a location in the Barns menu by identifier and wait until Overview is loaded and that location is active.
   * Uses the same click target as selectLocationAndWaitForOverview (span with data-location-identifier).
   */
  async selectLocationByIdentifierAndWaitForOverview(locationIdentifier: string): Promise<void> {
    await this.barnsMenu.waitFor({ state: 'visible', timeout: 15000 });
    await this.page
      .locator(`span[data-location-identifier="${locationIdentifier}"]`)
      .first()
      .click();
    await this.page.waitForURL(new RegExp(ROUTES.overview.replace(/\//g, '\\/')), { timeout: 15000 });
    await this.waitForPageLoad();
    await this.waitForActiveLocation(locationIdentifier);
  }

  /**
   * Wait until the given location identifier is the active one in the Barns menu (font-bold).
   */
  async waitForActiveLocation(locationIdentifier: string, timeoutMs = 10000): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const active = await this.getActiveLocationIdentifier();
      if (active === locationIdentifier) return;
      await this.wait(200);
    }
    const active = await this.getActiveLocationIdentifier();
    if (active !== locationIdentifier) {
      throw new Error(
        `Expected active location ${locationIdentifier} but got ${active} after ${timeoutMs}ms`,
      );
    }
  }

  /**
   * Select a location (barn/room) and wait until we are on the Overview page.
   * For i18n-safe selection always pass locationIdentifier (uses data-location-identifier).
   * @param locationName - Optional. Used only when locationIdentifier is not set; uses hasText (not i18n-safe).
   * @param category - Optional. If set, expands that barn group first via data-location-type (e.g. "General" or "general").
   * @param locationIdentifier - Preferred. When set, selects by data-location-identifier (i18n-safe).
   */
  async selectLocationAndWaitForOverview(
    locationName?: string,
    category?: string,
    locationIdentifier?: string,
  ): Promise<void> {
    await this.barnsMenu.waitFor({ state: 'visible', timeout: 15000 });
    if (category) {
      await this.expandBarnsCategory(category);
    }
    await this.barnsItem.first().waitFor({ state: 'visible', timeout: 15000 });
    if (locationIdentifier) {
      const byId = this.page.locator(`span[data-location-identifier="${locationIdentifier}"]`).first();
      try {
        await byId.waitFor({ state: 'visible', timeout: 8000 });
        await byId.click();
      } catch {
        await this.selectFirstBarn();
      }
    } else if (locationName) {
      await this.page.getByTestId('barns-item').filter({ hasText: locationName }).first().click();
    } else {
      await this.selectFirstBarn();
    }
    await this.page.waitForURL(new RegExp(ROUTES.overview.replace(/\//g, '\\/')), { timeout: 15000 });
    await this.waitForPageLoad();
  }

  /**
   * Overview tab locator (i18n-safe via data-testid).
   * @param tabKey - Use OVERVIEW_TAB.INVENTORY, OVERVIEW_TAB.HEALTH_STATUS, OVERVIEW_TAB.LOCATION_CONDITION
   */
  getTabLocator(tabKey: OverviewTabKey): Locator {
    return this.page.getByTestId(OVERVIEW_TAB_TEST_ID[tabKey]);
  }

  /**
   * Returns the displayed "Existing" count for "This Week" from the Tags Deployed chart.
   * Reads from the sr-only (screen-reader) span with data-testid="existing-this-week-count"; the dashboard
   * (RoomTagsDeployedChart) renders that span with series[0].data.slice(-1)[0] (last column = "This week").
   * Prefer getExistingAndOnboardedFromChartTooltip() to assert values from the chart tooltip (hover).
   */
  async getExistingThisWeekCount(): Promise<number> {
    await this.existingThisWeekCount.waitFor({ state: 'visible', timeout: 15000 });
    const text = await this.existingThisWeekCount.textContent();
    const parsed = parseInt(text ?? '', 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Returns the displayed "Onboarded" (New Tags Onboarded) count for "This Week" from the Tags Deployed chart.
   * Reads from the sr-only span with data-testid="onboarded-this-week-count"; the dashboard renders it with
   * series[1].data.slice(-1)[0] (last column = "This week"). Prefer getExistingAndOnboardedFromChartTooltip() for tooltip.
   */
  async getOnboardedThisWeekCount(): Promise<number> {
    await this.onboardedThisWeekCount.waitFor({ state: 'visible', timeout: 15000 });
    const text = await this.onboardedThisWeekCount.textContent();
    const parsed = parseInt(text ?? '', 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Gets Existing and Onboarded for "This Week" from the TAGS DEPLOYED chart tooltip by hovering the chart columns.
   * Chart has 4 weeks; "This week" is the last column: path index 3 = Existing bar, index 7 = Onboarded bar.
   * Waits for chart to render, hovers each bar, reads ApexCharts tooltip and parses "Existing: N" / "Onboarded: N".
   */
  async getExistingAndOnboardedFromChartTooltip(): Promise<{ existing: number; onboarded: number }> {
    await this.tagsDeployedPanel.waitFor({ state: 'visible', timeout: 15000 });
    await this.tagsDeployedPanel.scrollIntoViewIfNeeded();
    await this.wait(1500); // allow chart to render

    // Wait for sr-only "This week" counts so chart data from useShowcaseCubeData is ready.
    await this.existingThisWeekCount.waitFor({ state: 'visible', timeout: 15000 });
    const srText = (await this.existingThisWeekCount.textContent())?.trim() ?? '';
    if (srText !== '') {
      await this.wait(500); // brief stabilisation after data appears
    }

    const paths = this.tagsDeployedPanel.locator('.apexcharts-bar-series path');
    const pathsTimeout = 20000;
    const deadline = Date.now() + pathsTimeout;
    let count = await paths.count();
    while (count < 8 && Date.now() < deadline) {
      await this.wait(300);
      count = await paths.count();
    }
    if (count < 8) {
      return { existing: 0, onboarded: 0 };
    }

    const tooltipLocator = this.tagsDeployedPanel.locator('.apexcharts-tooltip').first();
    const hoverTimeout = 5000;
    const tooltipTimeout = 5000;

    // This week: Existing bar = path index 3 (bottom), Onboarded bar = path index 7 (top). Stacked chart draws Onboarded on top so use force to hover through overlay.
    await paths.nth(3).hover({ timeout: hoverTimeout, force: true });
    await this.wait(600);
    const existingText = (await tooltipLocator.textContent({ timeout: tooltipTimeout })) ?? '';
    const existingMatch = existingText.match(/Existing:\s*(\d+)/i);
    const existing = existingMatch ? parseInt(existingMatch[1], 10) : 0;
    let onboarded = 0;
    try {
      await paths.nth(7).hover({ timeout: hoverTimeout, force: true });
      await this.wait(600);
      const onboardedText = (await tooltipLocator.textContent({ timeout: tooltipTimeout })) ?? '';
      const onboardedMatch = onboardedText.match(/Onboarded:\s*(\d+)/i);
      onboarded = onboardedMatch ? parseInt(onboardedMatch[1], 10) : 0;
    } catch {
      // When Onboarded = 0 the bar has zero height (barHeight="0"), path is outside viewport or not hittable; use 0.
      onboarded = 0;
    }
    return { existing, onboarded };
  }

  /**
   * Returns the G-tags count from the CURRENT INVENTORY panel (active-tags-xiot-g).
   * If the element is not visible within 3s (e.g. type_of_pigs is sow only), returns 0.
   * Values may be locale-formatted (e.g. "1,016"); commas are stripped before parsing.
   */
  async getCurrentInventoryGCount(): Promise<number> {
    try {
      await this.activeTagsXiotG.first().waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      return 0;
    }
    const text = (await this.activeTagsXiotG.first().textContent())?.trim() ?? '';
    const parsed = parseInt(text.replace(/,/g, ''), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Returns the S-tags count from the CURRENT INVENTORY panel (active-tags-xiot-s).
   * If the element is not visible within 3s (e.g. type_of_pigs is grower only) or not on UI, returns 0.
   * Values may be locale-formatted; commas are stripped before parsing.
   */
  async getCurrentInventorySCount(): Promise<number> {
    try {
      await this.activeTagsXiotS.first().waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      return 0;
    }
    const text = (await this.activeTagsXiotS.first().textContent())?.trim() ?? '';
    const parsed = parseInt(text.replace(/,/g, ''), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Returns the total number of Active tags from the CURRENT INVENTORY panel (RoomStatistics).
   * Sums active-tags-xiot-g and active-tags-xiot-s (one or both visible depending on type_of_pigs).
   * Values may be locale-formatted (e.g. "1,016"); commas are stripped before parsing.
   */
  async getCurrentInventoryCount(): Promise<number> {
    const either = this.activeTagsXiotG.or(this.activeTagsXiotS);
    await either.first().waitFor({ state: 'visible', timeout: 15000 });
    let total = 0;
    for (const loc of [this.activeTagsXiotG, this.activeTagsXiotS]) {
      const count = await loc.count();
      if (count > 0) {
        const text = await loc.first().textContent();
        const parsed = parseInt((text ?? '').replace(/,/g, ''), 10);
        if (!Number.isNaN(parsed)) total += parsed;
      }
    }
    return total;
  }
}
