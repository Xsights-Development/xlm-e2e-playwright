import { test, expect } from '@/fixtures/auth.fixture.js';
import { FarmPage } from '@/pages/farm.page.js';

const farmKeyFromEnv = () =>
  process.env.APP_FARM_IDENTIFIER ?? process.env.APP_FARM ?? '';

test.describe('Farm Dashboard', () => {
  // Serial + authenticatedDashboardSession: one UI login per worker, re-login only if signed out.
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(60_000);

  test.describe('Farm Details', () => {
    test('@business @farm farm name matches Admin Farm table', async ({
      authenticatedDashboardSession,
      adminApi,
    }) => {
      const farmPage = new FarmPage(authenticatedDashboardSession);
      await farmPage.verifyOnDashboard();
      await farmPage.waitForFarmDetailsPanel();

      const farmKey = (await farmPage.getFarmIdFromDom()) ?? farmKeyFromEnv();
      const actual = await farmPage.getFarmName();
      const expected = await adminApi.getFarmNameByIdentifier(farmKey);

      expect(actual, `Farm name (key=${farmKey})`).toBe(expected);
    });

    test('@business @farm farm manager display name matches Admin username', async ({
      authenticatedDashboardSession,
      adminApi,
    }) => {
      const farmPage = new FarmPage(authenticatedDashboardSession);
      await farmPage.verifyOnDashboard();
      await farmPage.waitForFarmDetailsPanel();

      const managerId = await farmPage.getManagerIdFromDom();
      expect(managerId, 'data-manager-id on farm-detail-manager').toBeTruthy();

      const actual = await farmPage.getManagerDisplayName();
      if (actual === '-' || actual === '') {
        test.skip(true, 'No manager on UI for this farm');
      }

      const expected = await adminApi.getManagerUsernameById(managerId!);
      expect(actual, `Manager (id=${managerId})`).toBe(expected);
    });

    test('@smoke @farm logo opens Google Maps in new tab when coordinates exist', async ({
      authenticatedDashboardSession,
    }) => {
      const farmPage = new FarmPage(authenticatedDashboardSession);
      await farmPage.verifyOnDashboard();
      await farmPage.waitForFarmDetailsPanel();

      const { lat, long, hasCoordinates } = await farmPage.getCoordinates();
      if (!hasCoordinates || !lat || !long) {
        test.skip(true, 'Farm has no coordinates (data-has-coordinates=false)');
      }

      const href = await farmPage.getLogoHref();
      expect(href).toMatch(/google\.com\/maps/i);
      expect(href).toContain(lat);
      expect(href).toContain(long);

      await expect(farmPage.farmDetailLogoLink).toHaveAttribute('target', '_blank');

      const popup = await farmPage.clickLogoAndWaitForPopup();
      expect(popup.url()).toMatch(/google\.com\/maps/i);
      expect(popup.url()).toContain(lat);
      expect(popup.url()).toContain(long);
      await popup.close();
    });
  });

  test.describe('Current Inventory', () => {
    test.skip(true, 'Not implemented yet');
  });

  test.describe('Tags Deployed', () => {
    test.skip(true, 'Not implemented yet');
  });

  test.describe('Health Alerts', () => {
    test.skip(true, 'Not implemented yet');
  });

  test.describe('Health Events', () => {
    test.skip(true, 'Not implemented yet');
  });
});
