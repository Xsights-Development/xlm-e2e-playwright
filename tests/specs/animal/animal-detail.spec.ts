import { test, expect } from '@/fixtures/auth.fixture.js';
import { AnimalPage } from '@/pages/animal.page.js';
import { animalDetailUrl } from '@/configs/routes.js';

const testTagId = process.env.APP_TAG_ID ?? 'demo-tag';

/**
 * Animal Detail page (/animal/:tagId).
 * xahwm-docs 04: Detail screen, back link to /animal.
 * Uses APP_TAG_ID from env when set; otherwise 'demo-tag' (may 404 if app has no such data).
 */
test.describe('Animal Management - Detail', () => {
  test('should load animal detail page when navigating by URL', async ({ authenticatedDashboard }) => {
    const animalPage = new AnimalPage(authenticatedDashboard);
    await animalPage.navigateToAnimalDetail(testTagId);
    await animalPage.verifyAnimalDetailLoaded(testTagId);
  });

  test('should show back link to animal list on detail page', async ({ authenticatedDashboard }) => {
    const animalPage = new AnimalPage(authenticatedDashboard);
    await animalPage.navigateToAnimalDetail(testTagId);
    const backLink = animalPage.getBackToAnimalLink();
    await expect(backLink.first()).toBeVisible({ timeout: 10000 });
  });
});
