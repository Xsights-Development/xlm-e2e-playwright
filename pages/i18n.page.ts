import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@/pages/base.page.js';

/**
 * Language switcher helpers for i18n E2E.
 * Locales are discovered from the UI (language-option-*), not hard-coded.
 *
 * Note: LanguageSelector Dropdown sets listenEscape=false, so Escape does NOT
 * close the menu — toggling requires clicking the selector again.
 */
export class I18nPage extends BasePage {
  readonly languageSelector: Locator;
  readonly languageSelectorValue: Locator;
  readonly userDropdown: Locator;
  readonly signOutButton: Locator;
  readonly farmTagsTitle: Locator;
  readonly farmTagsInventory: Locator;
  readonly farmTagsChart: Locator;
  readonly farmWeatherPanel: Locator;
  readonly farmWeatherEmpty: Locator;
  readonly paginationTotal: Locator;

  constructor(page: Page) {
    super(page);
    this.languageSelector = page.getByTestId('language-selector');
    this.languageSelectorValue = page.getByTestId('language-selector-value');
    this.userDropdown = page.getByTestId('user-dropdown');
    this.signOutButton = page.getByTestId('sign-out-button');
    this.farmTagsTitle = page.getByTestId('farm-tags-title');
    this.farmTagsInventory = page.getByTestId('farm-tags-inventory');
    this.farmTagsChart = page.getByTestId('farm-tags-chart');
    this.farmWeatherPanel = page.getByTestId('farm-weather-panel');
    this.farmWeatherEmpty = page.getByTestId('farm-weather-empty');
    this.paginationTotal = page.getByTestId('pagination-total');
  }

  /** Visible language options only (hidden closed-menu nodes stay in the DOM). */
  private languageOptionsVisible(): Locator {
    return this.page.locator('[data-testid^="language-option-"]:visible');
  }

  async openLanguageMenu(): Promise<void> {
    // Already open — do not click (would toggle closed).
    if ((await this.languageOptionsVisible().count()) > 0) {
      return;
    }
    await this.languageSelector.click();
    await expect(this.languageOptionsVisible().first()).toBeVisible({
      timeout: 10_000,
    });
  }

  async closeLanguageMenu(): Promise<void> {
    if ((await this.languageOptionsVisible().count()) === 0) {
      return;
    }
    // Escape does not close this dropdown (listenEscape: false). Toggle via trigger.
    await this.languageSelector.click();
    await expect(this.languageOptionsVisible()).toHaveCount(0, {
      timeout: 5_000,
    });
  }

  languageOption(locale: string): Locator {
    // Prefer the visible item so Playwright does not target a hidden closed-menu node.
    return this.page.locator(
      `[data-testid="language-option-${locale}"]:visible`
    );
  }

  navItem(navKey: string): Locator {
    return this.page.getByTestId(`nav-item-${navKey}`);
  }

  /**
   * Read every language-option-* test id currently in the open menu.
   */
  async listLocalesFromMenu(): Promise<string[]> {
    await this.openLanguageMenu();
    const options = this.languageOptionsVisible();
    const count = await options.count();
    const locales: string[] = [];
    for (let i = 0; i < count; i++) {
      const testId = await options.nth(i).getAttribute('data-testid');
      if (!testId) continue;
      locales.push(testId.replace(/^language-option-/, ''));
    }
    await this.closeLanguageMenu();
    return locales;
  }

  async selectLanguage(locale: string): Promise<void> {
    await this.openLanguageMenu();
    const option = this.languageOption(locale);
    await expect(option, `language-option-${locale} should be visible`).toBeVisible({
      timeout: 10_000,
    });
    await option.click();
    // Header shows uppercased locale (e.g. ZH-CN, DE-CH).
    const normalized = locale.replace(/-/g, '[-\\s]?');
    await expect(this.languageSelectorValue).toHaveText(new RegExp(normalized, 'i'), {
      timeout: 10_000,
    });
  }

  async signOut(): Promise<void> {
    await this.closeLanguageMenu().catch(() => undefined);
    await this.userDropdown.click();
    await this.signOutButton.click();
    await this.page.waitForURL(/sign-in/, { timeout: 20_000 });
  }

  /** Visible weekday labels in the weather panel (moment-localized). */
  weatherWeekdays(): Locator {
    return this.farmWeatherPanel.getByTestId('farm-weather-weekday');
  }
}
