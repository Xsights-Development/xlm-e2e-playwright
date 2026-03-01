import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@/pages/base.page.js';
import { ROUTES } from '@/configs/routes.js';

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
  readonly barnsMenu: Locator;
  readonly barnsItem: Locator;

  constructor(page: Page) {
    super(page);
    this.tagsDeployedPanel = page.getByTestId('tags-deployed-panel');
    this.tagsDeployedTitle = page.getByTestId('tags-deployed-title');
    this.inventoryTitle = page.getByTestId('inventory-title');
    this.tagsDeployedChart = page.getByTestId('tags-deployed-chart');
    this.barnsMenu = page.getByTestId('barns-menu');
    this.barnsItem = page.getByTestId('barns-item');
  }

  async navigateToOverview(): Promise<void> {
    await this.goto(ROUTES.overview);
    await this.waitForPageLoad();
  }

  /** Assert URL is /overview and at least one key element is visible. */
  async verifyOverviewLoaded(): Promise<void> {
    const url = await this.getCurrentUrl();
    expect(url).toContain(ROUTES.overview);
    await expect(this.tagsDeployedPanel.or(this.inventoryTitle).or(this.tagsDeployedChart)).toBeVisible({
      timeout: 10000,
    });
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
   * @param category - e.g. APP_LOCATION_TYPE ("General" or "general")
   */
  async expandBarnsCategory(category: string): Promise<void> {
    const locationType = category.toLowerCase().trim();
    const section = this.page.locator(`[data-location-type="${locationType}"]`).first();
    await section.waitFor({ state: 'visible', timeout: 15000 });
    await section.click();
    await this.wait(300);
  }

  /**
   * Select a location (barn/room) and wait until we are on the Overview page.
   * Uses data-location-identifier when set (i18n-safe, preferred); otherwise falls back to location name.
   * @param locationName - Optional. Used when locationIdentifier is not set; clicks the barn with that text.
   * @param category - Optional. If set, expands that barn group first via data-location-type (e.g. "General" or "general").
   * @param locationIdentifier - Optional. When set (e.g. APP_LOCATION_IDENTIFIER), selects by data-location-identifier for reliable click.
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
      // Click the inner span (actual click target) to avoid overlay intercepting the barns-item div
      await this.page
        .locator(`span[data-location-identifier="${locationIdentifier}"]`)
        .first()
        .click();
    } else if (locationName) {
      await this.page.getByTestId('barns-item').filter({ hasText: locationName }).first().click();
    } else {
      await this.selectFirstBarn();
    }
    await this.page.waitForURL(new RegExp(ROUTES.overview.replace(/\//g, '\\/')), { timeout: 15000 });
    await this.waitForPageLoad();
  }

  /** Tab names per 04-app-flows: Inventory, Health Status, Location Condition. */
  async getTabLocator(tabName: string): Promise<Locator> {
    return this.page.getByRole('tab', { name: tabName });
  }
}
