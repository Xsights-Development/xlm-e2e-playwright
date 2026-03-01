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
  readonly barnsSection: Locator;
  readonly barnsItem: Locator;

  constructor(page: Page) {
    super(page);
    this.tagsDeployedPanel = page.getByTestId('tags-deployed-panel');
    this.tagsDeployedTitle = page.getByTestId('tags-deployed-title');
    this.inventoryTitle = page.getByTestId('inventory-title');
    this.tagsDeployedChart = page.getByTestId('tags-deployed-chart');
    this.barnsMenu = page.getByTestId('barns-menu');
    this.barnsSection = page.getByTestId('barns-section');
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
   * Select a location (barn/room) and wait until we are on the Overview page.
   * Use when precondition is: user on dashboard, then select location to land on Overview.
   * @param locationName - Optional. If set (e.g. from APP_LOCATION_NAME), clicks the barn with that text; otherwise clicks first barn.
   */
  async selectLocationAndWaitForOverview(locationName?: string): Promise<void> {
    await this.barnsItem.first().waitFor({ state: 'visible', timeout: 15000 });
    if (locationName) {
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
