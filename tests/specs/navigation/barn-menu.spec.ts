import { test, expect } from '@/fixtures/auth.fixture.js';
import { OverviewPage } from '@/pages/overview.page.js';
import { ROUTES } from '@/configs/routes.js';

/**
 * Location menu (Barns menu) navigation tests.
 * Scenario: Verify that each menu item (location) navigates to its corresponding location.
 * Expected: Each location item in the Barns menu navigates to that location (Overview for that room).
 *
 * Example: Start at nursery-room-6, then switch to nursery-room-5, then nursery-room-4;
 * each selection must result in the correct active location.
 *
 * Run: npx playwright test tests/specs/navigation/menu-navigation.spec.ts
 */

/** Location identifiers to use: start at first, then select each to verify navigation. */
const LOCATION_IDS = [
  'nursery-room-6-a9E6VFtE',
  'nursery-room-5-cQEffWN0',
  'nursery-room-4-Y9wmMgSe',
] as const;

test.describe('Menu navigation - location selection', () => {
  test('each menu item (location) navigates to its corresponding location', async ({
    authenticatedOnOverview,
  }) => {
    const overviewPage = new OverviewPage(authenticatedOnOverview);

    await overviewPage.barnsMenu.waitFor({ state: 'visible', timeout: 15000 });
    await authenticatedOnOverview.waitForURL(
      new RegExp(ROUTES.overview.replace(/\//g, '\\/')),
      { timeout: 10000 },
    );

    const [startId, ...targetIds] = LOCATION_IDS;

    await overviewPage.selectLocationByIdentifierAndWaitForOverview(startId);
    let activeId = await overviewPage.getActiveLocationIdentifier();
    expect(
      activeId,
      `After selecting ${startId}, active location should be ${startId}`,
    ).toBe(startId);

    for (const locationId of targetIds) {
      await overviewPage.selectLocationByIdentifierAndWaitForOverview(locationId);
      activeId = await overviewPage.getActiveLocationIdentifier();
      expect(
        activeId,
        `Menu item ${locationId} should navigate to its corresponding location (active: ${activeId})`,
      ).toBe(locationId);
    }
  });
});
