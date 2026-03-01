import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '@/pages/base.page.js';
import { ROUTES, animalDetailUrl } from '@/configs/routes.js';

/**
 * AnimalPage - Page Object for Animal Management (/animal) and Animal Detail (/animal/:tagId)
 * xahwm-docs 04: Tabs Room Inventory, Management List, Monitor List, Alert List; row click → /animal/:tagId.
 * Selectors: prefer data-testid; fallback getByRole('tab'), link href (06-selectors).
 */
export class AnimalPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToAnimalList(): Promise<void> {
    await this.goto(ROUTES.animalManagement);
    await this.waitForPageLoad();
  }

  /** Navigate to animal detail by tagId. */
  async navigateToAnimalDetail(tagId: string): Promise<void> {
    await this.goto(animalDetailUrl(tagId));
    await this.waitForPageLoad();
  }

  /** Assert URL is /animal (list). */
  async verifyAnimalListLoaded(): Promise<void> {
    const url = await this.getCurrentUrl();
    expect(url).toContain(ROUTES.animalManagement);
    expect(url).not.toMatch(/\/animal\/[^/]+/);
  }

  /** Assert URL is /animal/:tagId. */
  async verifyAnimalDetailLoaded(tagId: string): Promise<void> {
    const url = await this.getCurrentUrl();
    expect(url).toContain(animalDetailUrl(tagId));
  }

  /** Nav link to Animal Management by href. */
  async goToAnimalViaNav(): Promise<void> {
    await this.page.locator(`a[href="${ROUTES.animalManagement}"]`).first().click();
    await this.waitForPageLoad();
  }

  /** Tab names per 04-app-flows: Room Inventory, Management List, Monitor List, Alert List. */
  getTab(name: string): Locator {
    return this.page.getByRole('tab', { name });
  }

  /** Back link/button to /animal (on detail page). */
  getBackToAnimalLink(): Locator {
    return this.page.locator(`a[href="${ROUTES.animalManagement}"]`).or(this.page.getByRole('link', { name: /back|animal/i }));
  }

  /** First data row in table (e.g. tbody tr). */
  getFirstTableRow(): Locator {
    return this.page.locator('table tbody tr').first();
  }

  /** Click first table row (often navigates to detail). */
  async clickFirstTableRow(): Promise<void> {
    await this.getFirstTableRow().click();
    await this.waitForPageLoad();
  }
}
