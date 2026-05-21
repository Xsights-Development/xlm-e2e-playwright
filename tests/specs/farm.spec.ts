import { test, expect } from '@/fixtures/auth.fixture.js';
import { CHART_WEEK_KEYS } from '@/configs/chart-weeks.js';
import { FarmPage } from '@/pages/farm.page.js';
import {
  getFarmHealthAlertsFromCube,
  getFarmHealthEventsFromCube,
  getFarmTagsDeployedThisWeekFromCube,
} from '@/lib/cube/dashboard/oracles.js';

const farmKeyFromEnv = () =>
  process.env.APP_FARM_IDENTIFIER ?? process.env.APP_FARM ?? '';

test.describe('Farm Dashboard', { tag: '@farm' }, () => {
  // One login per worker via authenticatedDashboardSession. Run: npm run test -- farm.spec --workers=1
  // Do not use mode: 'serial' — a failure must not skip remaining panels (health, etc.).
  test.setTimeout(60_000);

  test.describe('Farm Details', { tag: '@business' }, () => {
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

  test.describe('Current Inventory', { tag: ['@farm', '@inventory'] }, () => {
    test.setTimeout(60_000);
    test('@contract @farm Current Inventory S-tags match GET /stats/tags', async ({
      authenticatedDashboardSession,
      appApi,
    }) => {
      const farmPage = new FarmPage(authenticatedDashboardSession);
      await farmPage.verifyOnDashboard();
      await farmPage.waitForCurrentInventoryPanel();

      if (!(await farmPage.isSColumnVisible())) {
        test.skip(true, 'Farm does not show S-tag column (type_of_pigs)');
      }

      const actual = await farmPage.getCurrentInventorySCount();
      const expected = await appApi.getCurrentInventorySCount();

      expect(
        actual,
        `Current Inventory S-tags (UI: ${actual}) vs GET /stats/tags (app API)`,
      ).toBe(expected);
    });

    test('@contract @farm Current Inventory G-tags match GET /stats/tags', async ({
      authenticatedDashboardSession,
      appApi,
    }) => {
      const farmPage = new FarmPage(authenticatedDashboardSession);
      await farmPage.verifyOnDashboard();
      await farmPage.waitForCurrentInventoryPanel();

      if (!(await farmPage.isGColumnVisible())) {
        test.skip(true, 'Farm does not show G-tag column (type_of_pigs)');
      }

      const actual = await farmPage.getCurrentInventoryGCount();
      const expected = await appApi.getCurrentInventoryGCount();

      expect(
        actual,
        `Current Inventory G-tags (UI: ${actual}) vs GET /stats/tags (app API)`,
      ).toBe(expected);
    });
  });

  test.describe('Tags Deployed', { tag: ['@farm', '@tags-deployed'] }, () => {
    test.setTimeout(90_000);

    test('@farm Total This Week equals Existing + Onboarded in chart tooltip', async ({
      authenticatedDashboardSession,
    }) => {
      const farmPage = new FarmPage(authenticatedDashboardSession);
      await farmPage.verifyOnDashboard();
      await farmPage.waitForTagsDeployedPanel();
      await farmPage.scrollToElement(farmPage.tagsDeployedPanel);

      const { existing, onboarded, total } = await farmPage.getTagsDeployedThisWeek();
      const tooltip = await farmPage.getExistingAndOnboardedFromChartTooltip();

      expect(tooltip.existing, 'Tooltip Existing vs sr-only this-week').toBe(existing);
      expect(tooltip.onboarded, 'Tooltip Onboarded vs sr-only this-week').toBe(onboarded);
      expect(existing + onboarded, 'Existing + Onboarded vs total from hooks').toBe(total);
    });

    test('@contract @farm Total This Week matches Cube pivot (not Admin)', async ({
      authenticatedDashboardSession,
      appApi,
      cubeApi,
    }) => {
      const farmPage = new FarmPage(authenticatedDashboardSession);
      await farmPage.verifyOnDashboard();
      await farmPage.waitForTagsDeployedPanel();
      await farmPage.scrollToElement(farmPage.tagsDeployedPanel);

      const ui = await farmPage.getTagsDeployedThisWeek();
      const cube = await getFarmTagsDeployedThisWeekFromCube(appApi, cubeApi);

      expect(
        ui.total,
        `Tags Deployed this-week total (UI: ${ui.total}, existing=${ui.existing}, onboarded=${ui.onboarded}) vs Cube pivot (existing=${cube.existing}, onboarded=${cube.onboarded}, total=${cube.total})`,
      ).toBe(cube.total);
    });

    test('@farm Total This Week is close to Current Inventory panel', async ({
      authenticatedDashboardSession,
    }) => {
      const farmPage = new FarmPage(authenticatedDashboardSession);
      await farmPage.verifyOnDashboard();
      await farmPage.waitForTagsDeployedPanel();
      await farmPage.waitForCurrentInventoryPanel();
      await farmPage.scrollToElement(farmPage.tagsDeployedPanel);

      const currentInventory = await farmPage.getCurrentInventoryTotal();
      const tolerance = 2;
      const stabiliseTimeoutMs = 10000;
      const deadline = Date.now() + stabiliseTimeoutMs;
      let existing = 0;
      let onboarded = 0;
      let totalThisWeek = 0;

      while (Date.now() < deadline) {
        const result = await farmPage.getTagsDeployedThisWeek();
        existing = result.existing;
        onboarded = result.onboarded;
        totalThisWeek = result.total;
        if (Math.abs(totalThisWeek - currentInventory) <= tolerance) break;
        await farmPage.wait(500);
      }

      expect(
        Math.abs(totalThisWeek - currentInventory),
        `Total This Week (${existing}+${onboarded}=${totalThisWeek}) should be equal or very close to Current Inventory (${currentInventory})`,
      ).toBeLessThanOrEqual(tolerance);
    });
  });

  test.describe('Health Alerts', { tag: ['@farm', '@health'] }, () => {
    test.setTimeout(90_000);

    test('@contract @farm Added by Web per week matches Cube sum_added_by_web', async ({
      authenticatedDashboardSession,
      appApi,
      cubeApi,
    }) => {
      const farmPage = new FarmPage(authenticatedDashboardSession);
      await farmPage.verifyOnDashboard();
      await farmPage.waitForHealthAlertsPanel();
      await farmPage.scrollToElement(farmPage.healthAlertsChart);

      const cube = await getFarmHealthAlertsFromCube(appApi, cubeApi);

      for (const weekKey of CHART_WEEK_KEYS) {
        const actual = await farmPage.getHealthAlertCount('added-web', weekKey);
        const expected = cube[weekKey].addedWeb;
        expect(
          actual,
          `Added by Web — ${weekKey} (UI: ${actual}, Cube sum_added_by_web: ${expected})`,
        ).toBe(expected);
      }
    });

    test('@contract @farm weekly alert total equals sum of four task types (UI vs Cube)', async ({
      authenticatedDashboardSession,
      appApi,
      cubeApi,
    }) => {
      const farmPage = new FarmPage(authenticatedDashboardSession);
      await farmPage.verifyOnDashboard();
      await farmPage.waitForHealthAlertsPanel();
      await farmPage.scrollToElement(farmPage.healthAlertsChart);

      const cube = await getFarmHealthAlertsFromCube(appApi, cubeApi);

      for (const weekKey of CHART_WEEK_KEYS) {
        const actual = await farmPage.getHealthAlertWeekTotal(weekKey);
        const expected = cube[weekKey].total;
        expect(
          actual,
          `Weekly alert total — ${weekKey} (UI sum of 4 metrics: ${actual}, Cube total: ${expected})`,
        ).toBe(expected);
      }
    });
  });

  test.describe('Health Events', { tag: ['@farm', '@health'] }, () => {
    test.setTimeout(90_000);

    test('@contract @farm Pigs Medicated per week matches Cube sum_medicated_pigs', async ({
      authenticatedDashboardSession,
      appApi,
      cubeApi,
    }) => {
      const farmPage = new FarmPage(authenticatedDashboardSession);
      await farmPage.verifyOnDashboard();
      await farmPage.waitForHealthEventsPanel();
      await farmPage.scrollToElement(farmPage.healthEventsChart);

      const cube = await getFarmHealthEventsFromCube(appApi, cubeApi);

      for (const weekKey of CHART_WEEK_KEYS) {
        const actual = await farmPage.getHealthEventCount('medicated', weekKey);
        const expected = cube[weekKey].medicated;
        expect(
          actual,
          `Pigs Medicated — ${weekKey} (UI: ${actual}, Cube sum_medicated_pigs: ${expected})`,
        ).toBe(expected);
      }
    });

    test('@contract @farm Pigs with 3+ Medications per week matches Cube sum_high_medication_pigs', async ({
      authenticatedDashboardSession,
      appApi,
      cubeApi,
    }) => {
      const farmPage = new FarmPage(authenticatedDashboardSession);
      await farmPage.verifyOnDashboard();
      await farmPage.waitForHealthEventsPanel();
      await farmPage.scrollToElement(farmPage.healthEventsChart);

      const cube = await getFarmHealthEventsFromCube(appApi, cubeApi);

      for (const weekKey of CHART_WEEK_KEYS) {
        const actual = await farmPage.getHealthEventCount('high-medication', weekKey);
        const expected = cube[weekKey].highMedication;
        expect(
          actual,
          `Pigs with 3+ Medications — ${weekKey} (UI: ${actual}, Cube sum_high_medication_pigs: ${expected})`,
        ).toBe(expected);
      }
    });
  });
});
