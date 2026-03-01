import { test, expect } from '@/fixtures/auth.fixture.js';
import { AnimalPage } from '@/pages/animal.page.js';
import { ROUTES } from '@/configs/routes.js';

/**
 * Animal Management list page (/animal).
 * xahwm-docs 04: Assert URL and tabs (Room Inventory, Management List, etc.).
 */
test.describe('Animal Management - List', () => {
  test('should load animal list page after login', async ({ authenticatedDashboard }) => {
    const animalPage = new AnimalPage(authenticatedDashboard);
    await animalPage.navigateToAnimalList();
    await animalPage.verifyAnimalListLoaded();
  });

  test('should reach animal list via nav link from dashboard', async ({ authenticatedDashboard }) => {
    const animalPage = new AnimalPage(authenticatedDashboard);
    await animalPage.goToAnimalViaNav();
    const url = await animalPage.getCurrentUrl();
    expect(url).toContain(ROUTES.animalManagement);
  });
});
