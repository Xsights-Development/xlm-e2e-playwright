import { Page, Locator } from '@playwright/test';
import { BasePage } from '@/pages/base.page.js';
import { ROUTES } from '@/configs/routes.js';
import { getExistingAndOnboardedFromChartTooltip } from '@/lib/ui/chart-tooltip.js';

export type TagsDeployedSeries = 'existing' | 'onboarded';

/** Health alerts chart metric slugs (farm-alerts-{metric}-{weekKey}). */
export type HealthAlertMetric =
  | 'triggered'
  | 'medication-scheduled'
  | 'added-mobile'
  | 'added-web';

/** Health events chart category slugs (farm-events-{category}-{weekKey}). */
export type HealthEventCategory =
  | 'medicated'
  | 'high-medication'
  | 'recovered'
  | 'euthanised';

export type TagsDeployedWeekCounts = {
  existing: number;
  onboarded: number;
  total: number;
};

export type FarmCoordinates = {
  lat: string;
  long: string;
  hasCoordinates: boolean;
};

/**
 * FarmPage — Farm dashboard (/dashboard): Farm details panel and future farm-level panels.
 * Hooks: docs/e2e/pages/farm-dashboard.md (farm-detail-*).
 */
export class FarmPage extends BasePage {
  readonly farmDetailName: Locator;
  readonly farmDetailManager: Locator;
  readonly farmDetailLogoLink: Locator;
  readonly farmDetailLogo: Locator;
  readonly activeTagsXiotG: Locator;
  readonly activeTagsXiotS: Locator;
  readonly tagsDeployedPanel: Locator;
  readonly tagsDeployedChart: Locator;
  readonly farmTagsExistingWrapper: Locator;
  readonly farmTagsOnboardedWrapper: Locator;
  readonly healthAlertsChart: Locator;
  readonly healthEventsChart: Locator;

  constructor(page: Page) {
    super(page);
    this.farmDetailName = page.getByTestId('farm-detail-name');
    this.farmDetailManager = page.getByTestId('farm-detail-manager');
    this.farmDetailLogoLink = page.getByTestId('farm-detail-logo-link');
    this.farmDetailLogo = page.getByTestId('farm-detail-logo');
    const activeRow = page
      .locator('.bg-orange-100.font-bold')
      .filter({ has: page.getByText('Active', { exact: true }) });
    this.activeTagsXiotG = activeRow
      .getByTestId('active-tags-xiot-g')
      .or(activeRow.locator('> div').nth(1));
    this.activeTagsXiotS = activeRow
      .getByTestId('active-tags-xiot-s')
      .or(activeRow.locator('> div').nth(2));
    this.tagsDeployedPanel = page
      .getByTestId('farm-tags-panel')
      .or(page.getByTestId('tags-deployed-panel'));
    this.tagsDeployedChart = page
      .getByTestId('farm-tags-chart')
      .or(this.tagsDeployedPanel.locator('.apexcharts-canvas').first());
    this.farmTagsExistingWrapper = page.getByTestId('farm-tags-existing');
    this.farmTagsOnboardedWrapper = page.getByTestId('farm-tags-onboarded');
    this.healthAlertsChart = page.getByTestId('farm-alerts-chart');
    this.healthEventsChart = page.getByTestId('farm-events-chart');
  }

  async waitForFarmDetailsPanel(timeoutMs = 15000): Promise<void> {
    await this.farmDetailName.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  async getFarmName(): Promise<string> {
    await this.waitForFarmDetailsPanel();
    return (await this.farmDetailName.textContent())?.trim() ?? '';
  }

  async getManagerDisplayName(): Promise<string> {
    await this.waitForFarmDetailsPanel();
    return (await this.farmDetailManager.textContent())?.trim() ?? '';
  }

  async getFarmIdFromDom(): Promise<string | null> {
    await this.waitForFarmDetailsPanel();
    const id = await this.farmDetailName.getAttribute('data-farm-id');
    return id?.trim() || null;
  }

  async getManagerIdFromDom(): Promise<string | null> {
    await this.waitForFarmDetailsPanel();
    const id = await this.farmDetailManager.getAttribute('data-manager-id');
    return id?.trim() || null;
  }

  async getCoordinates(): Promise<FarmCoordinates> {
    await this.waitForFarmDetailsPanel();
    const lat = (await this.farmDetailLogoLink.getAttribute('data-lat')) ?? '';
    const long = (await this.farmDetailLogoLink.getAttribute('data-long')) ?? '';
    const hasCoordinates =
      (await this.farmDetailLogoLink.getAttribute('data-has-coordinates')) === 'true';
    return { lat, long, hasCoordinates };
  }

  async getLogoHref(): Promise<string> {
    await this.waitForFarmDetailsPanel();
    return (await this.farmDetailLogoLink.getAttribute('href')) ?? '';
  }

  /**
   * Click farm logo link and wait for a new tab (Google Maps).
   */
  async clickLogoAndWaitForPopup(): Promise<Page> {
    await this.waitForFarmDetailsPanel();
    const popupPromise = this.page.context().waitForEvent('page');
    await this.farmDetailLogoLink.click();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    return popup;
  }

  async verifyOnDashboard(): Promise<void> {
    await this.page.waitForURL(new RegExp(ROUTES.dashboard.replace(/\//g, '\\/')), {
      timeout: 15000,
    });
  }

  async waitForCurrentInventoryPanel(timeoutMs = 15000): Promise<void> {
    const either = this.activeTagsXiotG.or(this.activeTagsXiotS);
    await either.first().waitFor({ state: 'visible', timeout: timeoutMs });
  }

  async isGColumnVisible(): Promise<boolean> {
    return this.activeTagsXiotG.isVisible({ timeout: 3000 }).catch(() => false);
  }

  async isSColumnVisible(): Promise<boolean> {
    return this.activeTagsXiotS.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Wait until active tag cell shows a number (not "--" while stats load).
   */
  private async readActiveTagCountWhenReady(locator: Locator, timeoutMs = 30000): Promise<number> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const text = (await locator.textContent())?.trim() ?? '';
      if (text && text !== '--') {
        const parsed = parseInt(text.replace(/,/g, ''), 10);
        if (!Number.isNaN(parsed)) return parsed;
      }
      await this.wait(500);
    }
    const text = (await locator.textContent())?.trim() ?? '';
    if (text === '' || text === '--') return 0;
    const parsed = parseInt(text.replace(/,/g, ''), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  async getCurrentInventoryGCount(): Promise<number> {
    if (!(await this.isGColumnVisible())) return 0;
    await this.waitForCurrentInventoryPanel();
    return this.readActiveTagCountWhenReady(this.activeTagsXiotG);
  }

  async getCurrentInventorySCount(): Promise<number> {
    if (!(await this.isSColumnVisible())) return 0;
    await this.waitForCurrentInventoryPanel();
    return this.readActiveTagCountWhenReady(this.activeTagsXiotS);
  }

  async getCurrentInventoryTotal(): Promise<number> {
    const g = await this.getCurrentInventoryGCount();
    const s = await this.getCurrentInventorySCount();
    return g + s;
  }

  async waitForTagsDeployedPanel(timeoutMs = 30000): Promise<void> {
    await this.tagsDeployedPanel.waitFor({ state: 'visible', timeout: timeoutMs });
    const thisWeekExisting = this.page.getByTestId('farm-tags-existing-this-week');
    await this.readSrOnlyCountWhenReady(thisWeekExisting, timeoutMs);
  }

  private async readSrOnlyCountWhenReady(locator: Locator, timeoutMs = 30000): Promise<number> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const text = (await locator.textContent())?.trim() ?? '';
      if (text && text !== '--') {
        const parsed = parseInt(text.replace(/,/g, ''), 10);
        if (!Number.isNaN(parsed)) return parsed;
      }
      await this.wait(500);
    }
    const text = (await locator.textContent())?.trim() ?? '';
    if (text === '' || text === '--') return 0;
    const parsed = parseInt(text.replace(/,/g, ''), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  async getTagsDeployedCount(series: TagsDeployedSeries, weekKey: string): Promise<number> {
    const locator = this.page.getByTestId(`farm-tags-${series}-${weekKey}`);
    return this.readSrOnlyCountWhenReady(locator);
  }

  async getTagsDeployedThisWeek(): Promise<TagsDeployedWeekCounts> {
    const existing = await this.getTagsDeployedCount('existing', 'this-week');
    const onboarded = await this.getTagsDeployedCount('onboarded', 'this-week');
    return { existing, onboarded, total: existing + onboarded };
  }

  async getExistingAndOnboardedFromChartTooltip(): Promise<{
    existing: number;
    onboarded: number;
  }> {
    return getExistingAndOnboardedFromChartTooltip(
      this.page,
      this.tagsDeployedPanel,
      (ms) => this.wait(ms),
    );
  }

  async waitForHealthAlertsPanel(timeoutMs = 30000): Promise<void> {
    await this.healthAlertsChart.waitFor({ state: 'visible', timeout: timeoutMs });
    const thisWeek = this.page
      .getByTestId('farm-alerts-added-web')
      .getByTestId('farm-alerts-added-web-this-week');
    await this.readSrOnlyCountWhenReady(thisWeek, timeoutMs);
  }

  async waitForHealthEventsPanel(timeoutMs = 30000): Promise<void> {
    await this.healthEventsChart.waitFor({ state: 'visible', timeout: timeoutMs });
    const thisWeek = this.page
      .getByTestId('farm-events-medicated')
      .getByTestId('farm-events-medicated-this-week');
    await this.readSrOnlyCountWhenReady(thisWeek, timeoutMs);
  }

  async getHealthAlertCount(metric: HealthAlertMetric, weekKey: string): Promise<number> {
    const locator = this.page
      .getByTestId(`farm-alerts-${metric}`)
      .getByTestId(`farm-alerts-${metric}-${weekKey}`);
    return this.readSrOnlyCountWhenReady(locator);
  }

  async getHealthAlertWeekTotal(weekKey: string): Promise<number> {
    const metrics: HealthAlertMetric[] = [
      'triggered',
      'medication-scheduled',
      'added-mobile',
      'added-web',
    ];
    let total = 0;
    for (const metric of metrics) {
      total += await this.getHealthAlertCount(metric, weekKey);
    }
    return total;
  }

  async getHealthEventCount(category: HealthEventCategory, weekKey: string): Promise<number> {
    const locator = this.page
      .getByTestId(`farm-events-${category}`)
      .getByTestId(`farm-events-${category}-${weekKey}`);
    return this.readSrOnlyCountWhenReady(locator);
  }
}
