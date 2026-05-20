import { Page, Locator } from '@playwright/test';
import { BasePage } from '@/pages/base.page.js';
import { ROUTES } from '@/configs/routes.js';

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

  constructor(page: Page) {
    super(page);
    this.farmDetailName = page.getByTestId('farm-detail-name');
    this.farmDetailManager = page.getByTestId('farm-detail-manager');
    this.farmDetailLogoLink = page.getByTestId('farm-detail-logo-link');
    this.farmDetailLogo = page.getByTestId('farm-detail-logo');
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
}
