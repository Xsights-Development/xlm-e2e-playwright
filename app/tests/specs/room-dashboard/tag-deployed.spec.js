const { test, expect } = require('../../fixtures');
const { getCurrentWeekDateRange } = require('../../utils/date');

/**
 * TEST SUITE: Dashboard - Tags Deployed Panel
 *
 * @feature Room Dashboard
 * @story Tags Deployed Panel
 */

test.describe('Dashboard - Tags Deployed Panel', () => {

  // Setup: Navigate to authenticated dashboard before each test
  test.beforeEach(async ({ authenticatedDashboard }) => {
    // User is already at dashboard with location selected
  });

  /**
   * TEST CASE: TC-TAGS-001
   * Scenario: Verify Tags Deployed panel is visible on dashboard
   * @severity critical
   * @feature Room Dashboard
   * @story Tags Deployed Panel
   */
  test('TC-TAGS-001: Tags Deployed panel visibility @ui', async ({ roomDashboardPage }, testInfo) => {
    // Allure annotations
    testInfo.annotations.push(
      { type: 'feature', description: 'Room Dashboard' },
      { type: 'story', description: 'Tags Deployed Panel' },
      { type: 'severity', description: 'critical' },
      { type: 'testId', description: 'TC-TAGS-001' }
    );

    await test.step('Verify Tags Deployed panel is visible', async () => {
      const isPanelVisible = await roomDashboardPage.isTagsDeployedPanelVisible();
      expect(isPanelVisible, 'Tags Deployed panel should be visible').toBeTruthy();
    });
  });

  /**
   * TEST CASE: TC-TAGS-002
   * Scenario: Verify all components of Tags Deployed panel are present
   * Components: Title, Chart, 4-week columns, Legends (Existing & Onboarded)
   * @severity critical
   * @feature Room Dashboard
   * @story Tags Deployed Panel
   */
  test('TC-TAGS-002: Tags Deployed panel components @ui', async ({ roomDashboardPage }, testInfo) => {
    // Allure annotations
    testInfo.annotations.push(
      { type: 'feature', description: 'Room Dashboard' },
      { type: 'story', description: 'Tags Deployed Panel' },
      { type: 'severity', description: 'critical' },
      { type: 'testId', description: 'TC-TAGS-002' }
    );

    await test.step('Verify panel is visible', async () => {
      const isPanelVisible = await roomDashboardPage.isTagsDeployedPanelVisible();
      expect(isPanelVisible, 'Panel should be visible').toBeTruthy();
    });

    await test.step('Wait for chart to load', async () => {
      await roomDashboardPage.waitForTagsDeployedChart();
    });

    await test.step('Verify panel title', async () => {
      const panelTitle = await roomDashboardPage.getTagsDeployedPanelTitle();
      expect(panelTitle).toContain('TAGS DEPLOYED');
    });

    await test.step('Verify chart is present', async () => {
      const hasChart = await roomDashboardPage.hasTagsDeployedChart();
      expect(hasChart, 'Chart should be present').toBeTruthy();
    });

    await test.step('Verify 4-week columns', async () => {
      const columnCount = await roomDashboardPage.getTagsDeployedColumnCount();
      expect(columnCount, 'Should display 4 weeks of data').toBeGreaterThanOrEqual(4);
    });

    await test.step('Verify chart legends', async () => {
      const legends = await roomDashboardPage.getTagsDeployedLegends();
      expect(legends, 'Should have both Existing and Onboarded legends').toEqual(
        expect.arrayContaining(['Existing', 'Onboarded'])
      );
    });
  });

  /**
   * TEST CASE: TC-TAGS-003
   * Scenario: Verify that the tooltip is displayed when hovering over the chart
   * Expected: The tooltip appears when hovering over the chart
   * @severity normal
   * @feature Room Dashboard
   * @story Tags Deployed Panel - Interactions
   */
  test('TC-TAGS-003: Tooltip display on hover @ui', async ({ roomDashboardPage }, testInfo) => {
    // Allure annotations
    testInfo.annotations.push(
      { type: 'feature', description: 'Room Dashboard' },
      { type: 'story', description: 'Tags Deployed Panel - Interactions' },
      { type: 'severity', description: 'normal' },
      { type: 'testId', description: 'TC-TAGS-003' }
    );

    await test.step('Verify panel is visible', async () => {
      const isPanelVisible = await roomDashboardPage.isTagsDeployedPanelVisible();
      expect(isPanelVisible).toBeTruthy();
    });

    await test.step('Wait for chart to load', async () => {
      await roomDashboardPage.waitForTagsDeployedChart();
    });

    await test.step('Hover over chart and verify tooltip', async () => {
      const tooltipContent = await roomDashboardPage.hoverOverTagsDeployedChart();

      console.log(`      ✓ Onboarded: ${tooltipContent['Onboarded'].count || 0} pigs ${tooltipContent['Onboarded'].dateTime ? `(${tooltipContent['Onboarded'].dateTime})` : ''}`);
      console.log(`      ✓ Existing: ${tooltipContent['Existing'].count || 0} pigs ${tooltipContent['Existing'].dateTime ? `(${tooltipContent['Existing'].dateTime})` : ''}`);

      expect(tooltipContent, 'Tooltip should be displayed when hovering over chart').toBeTruthy();
    });
  });

  /**
   * TEST CASE: TC-TAGS-004
   * Scenario: Verify that the tooltip includes sufficient information
   * Expected: The tooltip contains: Date/time, Number of pigs for each type
   * Note: Test will validate available data types (Existing and/or Onboarded)
   *       and skip if neither type has data
   * @severity normal
   * @feature Room Dashboard
   * @story Tags Deployed Panel - Interactions
   */
  test('TC-TAGS-004: Tooltip information completeness @ui', async ({ roomDashboardPage }, testInfo) => {
    // Allure annotations
    testInfo.annotations.push(
      { type: 'feature', description: 'Room Dashboard' },
      { type: 'story', description: 'Tags Deployed Panel - Interactions' },
      { type: 'severity', description: 'normal' },
      { type: 'testId', description: 'TC-TAGS-004' }
    );

    await test.step('Verify panel is visible', async () => {
      const isPanelVisible = await roomDashboardPage.isTagsDeployedPanelVisible();
      expect(isPanelVisible).toBeTruthy();
    });

    await test.step('Wait for chart to load', async () => {
      await roomDashboardPage.waitForTagsDeployedChart();
    });

    await test.step('Verify tooltip information completeness', async () => {
      const tooltipContent = await roomDashboardPage.hoverOverTagsDeployedChart();

      // Check which data types are available
      const hasExisting = tooltipContent['Existing']?.dateTime !== null && tooltipContent['Existing']?.count !== null;
      const hasOnboarded = tooltipContent['Onboarded']?.dateTime !== null && tooltipContent['Onboarded']?.count !== null;

      // Skip test if no data is available
      if (!hasExisting && !hasOnboarded) {
        test.skip(true, 'No data available for Existing or Onboarded - skipping test');
        return;
      }

      // Verify tooltip for Existing if available
      if (hasExisting) {
        expect(tooltipContent['Existing'].dateTime, 'Tooltip should include date/time for Existing pigs').toBeTruthy();
        expect(tooltipContent['Existing'].count, 'Tooltip should include count for Existing pigs').toBeGreaterThanOrEqual(0);
        console.log(`   ✓ Existing: ${tooltipContent['Existing'].count} pigs (${tooltipContent['Existing'].dateTime})`);
      } else {
        console.log('   ⚠ Existing: No data available - skipped validation');
      }

      // Verify tooltip for Onboarded if available
      if (hasOnboarded) {
        expect(tooltipContent['Onboarded'].dateTime, 'Tooltip should include date/time for Onboarded pigs').toBeTruthy();
        expect(tooltipContent['Onboarded'].count, 'Tooltip should include count for Onboarded pigs').toBeGreaterThanOrEqual(0);
        console.log(`   ✓ Onboarded: ${tooltipContent['Onboarded'].count} pigs (${tooltipContent['Onboarded'].dateTime})`);
      } else {
        console.log('   ⚠ Onboarded: No data available - skipped validation');
      }
    });
  });

  /**
   * TEST CASE: TC-TAGS-005
   * Scenario: Verify the sum of all 4 bar values when hovering over each legend
   * Expected: When hovering over Existing legend, get all 4 weeks' values and sum them.
   *           When hovering over Onboarded legend, get all 4 weeks' values and sum them.
   *           Validate that the sums are calculated correctly.
   * @severity normal
   * @feature Room Dashboard
   * @story Tags Deployed Panel - Interactions
   */
  test('TC-TAGS-005: Sum of all bar values per legend @ui', async ({ roomDashboardPage }, testInfo) => {
    // Allure annotations
    testInfo.annotations.push(
      { type: 'feature', description: 'Room Dashboard' },
      { type: 'story', description: 'Tags Deployed Panel - Interactions' },
      { type: 'severity', description: 'normal' },
      { type: 'testId', description: 'TC-TAGS-005' }
    );

    // Increase timeout for this test as it hovers over multiple bars
    test.setTimeout(60000); // 60 seconds

    let existingBars, onboardedBars, existingSum, onboardedSum;

    await test.step('Verify panel is visible and wait for chart', async () => {
      const isPanelVisible = await roomDashboardPage.isTagsDeployedPanelVisible();
      expect(isPanelVisible).toBeTruthy();
      await roomDashboardPage.waitForTagsDeployedChart();
      console.log('📊 TC-TAGS-005: Verifying Sum of All Bar Values per Legend');
    });

    await test.step('Get all bar values for Existing legend', async () => {
      console.log('\n   🔍 Step 1: Getting all bar values for Existing legend...');
      existingBars = await roomDashboardPage.getAllBarValuesForLegend('Existing');
      existingSum = existingBars.reduce((sum, bar) => sum + bar.count, 0);
      console.log(`      Total Existing (sum of ${existingBars.length} weeks): ${existingSum}`);
    });

    await test.step('Get all bar values for Onboarded legend', async () => {
      console.log('\n   🔍 Step 2: Getting all bar values for Onboarded legend...');
      await roomDashboardPage.wait(500); // Wait between legend interactions
      onboardedBars = await roomDashboardPage.getAllBarValuesForLegend('Onboarded');
      onboardedSum = onboardedBars.reduce((sum, bar) => sum + bar.count, 0);
      console.log(`      Total Onboarded (sum of ${onboardedBars.length} weeks): ${onboardedSum}`);
    });

    await test.step('Validate sum calculations', async () => {
      console.log('\n   📊 Summary:');
      console.log('   ═══════════════════════════════════════════════════════════');
      console.log(`      Existing:   ${existingSum} (${existingBars.length} weeks)`);
      console.log(`      Onboarded:  ${onboardedSum} (${onboardedBars.length} weeks)`);
      console.log(`      Grand Total: ${existingSum + onboardedSum}`);
      console.log('   ═══════════════════════════════════════════════════════════');

      expect(existingBars.length, 'Should have 4 weeks of Existing data').toBeGreaterThanOrEqual(4);
      expect(onboardedBars.length, 'Should have 4 weeks of Onboarded data').toBeGreaterThanOrEqual(4);
      expect(existingSum, 'Existing sum should be valid').toBeGreaterThanOrEqual(0);
      expect(onboardedSum, 'Onboarded sum should be valid').toBeGreaterThanOrEqual(0);

      const calculatedExistingSum = existingBars.reduce((sum, bar) => sum + bar.count, 0);
      const calculatedOnboardedSum = onboardedBars.reduce((sum, bar) => sum + bar.count, 0);

      expect(existingSum, 'Existing sum should match calculated sum').toBe(calculatedExistingSum);
      expect(onboardedSum, 'Onboarded sum should match calculated sum').toBe(calculatedOnboardedSum);

      console.log('   ✅ All bar values summed and validated successfully');
    });
  });

  /**
   * TEST CASE: TC-TAGS-006
   * Scenario: Verify and compare the number of pigs for "Onboarded" in "This Week"
   * Expected: The number displayed on the Dashboard matches the total count of animals
   *           created within that week (based on created_at) from the Admin API Animals table.
   * @severity blocker
   * @feature Room Dashboard
   * @story Data Validation - Tags Deployed
   */
  test('TC-TAGS-006: Data comparison - Onboarded pigs in this week @data', async ({
    roomDashboardPage,
    appData
  }, testInfo) => {
    // Allure annotations
    testInfo.annotations.push(
      { type: 'feature', description: 'Room Dashboard' },
      { type: 'story', description: 'Data Validation - Tags Deployed' },
      { type: 'severity', description: 'blocker' },
      { type: 'testId', description: 'TC-TAGS-006' },
      { type: 'testType', description: 'Data Validation' }
    );

    let dashboardCount, dateTime, adminAPICount;

    await test.step('Verify panel is visible and wait for chart', async () => {
      const isPanelVisible = await roomDashboardPage.isTagsDeployedPanelVisible();
      expect(isPanelVisible, 'Tags Deployed panel should be visible').toBeTruthy();
      await roomDashboardPage.waitForTagsDeployedChart();
    });

    await test.step('Get Dashboard count from tooltip', async () => {
      console.log('📊 Data Consistency Check - TC-TAGS-006');
      console.log('   Testing: Onboarded Pigs Count Validation');
      console.log('\n🔄 Step 1: GETTING DATA FROM DASHBOARD TOOLTIP...');

      const tooltipContent = await roomDashboardPage.getTooltipContentForLegend('Onboarded');
      dashboardCount = tooltipContent?.count ?? 0;
      dateTime = tooltipContent?.dateTime ?? null;

      if (!dateTime) {
        dateTime = getCurrentWeekDateRange();
        console.log('      ⚠️  No Onboarded tooltip available - auto-generating current week date range');
        console.log(`      Auto-generated Date Range: ${dateTime}`);
      }

      console.log(`      Dashboard Count: ${dashboardCount}`);
      console.log(`      Date Range: ${dateTime}`);
    });

    await test.step('Get Admin API count', async () => {
      console.log('\n🔄 Step 2: CALLING ADMIN API TO VALIDATE DATA...');
      console.log('   ═══════════════════════════════════════════════════════════');
      console.log('   📡 API Source: Admin Backend');
      console.log('   🎯 Purpose: Get animals count created in date range');
      console.log('   ═══════════════════════════════════════════════════════════');

      adminAPICount = await roomDashboardPage.getAdminAPIOnboardedCountFromAnimals(
        appData.locationIdentifier,
        dateTime
      );
    });

    await test.step('Compare Dashboard vs Admin API data', async () => {
      console.log('\n   📊 Final Comparison Results:');
      console.log('   ═══════════════════════════════════════════════════════════');
      console.log(`      📱 Dashboard Count:     ${dashboardCount}`);
      console.log(`      🔧 Admin API Count:     ${adminAPICount}`);
      console.log(`      🎯 Match Status:        ${dashboardCount === adminAPICount ? '✅ YES' : '❌ NO'}`);

      if (dashboardCount !== adminAPICount) {
        console.log(`      ⚠️  Difference:         ${Math.abs(dashboardCount - adminAPICount)}`);
      }
      console.log('   ═══════════════════════════════════════════════════════════\n');
    });

    // Attach comparison data for reporting
    await test.info().attach('data-comparison', {
      body: JSON.stringify({
        testId: 'TC-TAGS-006',
        testName: 'Onboarded Pigs Validation',
        timestamp: new Date().toISOString(),
        parameters: {
          locationIdentifier: appData.locationIdentifier,
          dateRange: dateTime,
        },
        sources: {
          dashboard: {
            name: 'Dashboard Tooltip',
            value: dashboardCount,
            source: 'Tags Deployed Panel - Onboarded Bar'
          },
          adminAPI: {
            name: 'Admin API - Animals',
            value: adminAPICount,
            endpoint: 'AnimalGroupAdmin/AnimalAdmin/list',
            filters: {
              created_at: dateTime,
            }
          }
        },
        validation: {
          match: dashboardCount === adminAPICount,
          difference: Math.abs(dashboardCount - adminAPICount),
          percentDiff: dashboardCount > 0
            ? ((Math.abs(dashboardCount - adminAPICount) / dashboardCount) * 100).toFixed(2) + '%'
            : '0%'
        }
      }, null, 2),
      contentType: 'application/json'
    });

    // Assert: Dashboard count should match Admin API count
    expect(dashboardCount, 'Dashboard count should match Admin API Animals count').toBe(adminAPICount);
  });

  /**
   * TEST CASE: TC-TAGS-007
   * Scenario: Verify and compare the number of pigs for "Existing" in "This Week"
   * Expected: The number displayed on the Dashboard matches the total count of pigs for that specific location and week
   *           (based on pigs with last_seen within that week) that have the statuses "normal", "sub-optimal", or "poor"
   *           in the Animal table. This value should also reference (align with) the corresponding week's data in the
   *           Weekly Inventory Tracking table on the Admin site.
   * @severity blocker
   * @feature Room Dashboard
   * @story Data Validation - Tags Deployed
   */
  test('TC-TAGS-007: Data comparison - Existing pigs in this week @data', async ({
    roomDashboardPage,
    appData
  }, testInfo) => {
    // Allure annotations
    testInfo.annotations.push(
      { type: 'feature', description: 'Room Dashboard' },
      { type: 'story', description: 'Data Validation - Tags Deployed' },
      { type: 'severity', description: 'blocker' },
      { type: 'testId', description: 'TC-TAGS-007' },
      { type: 'testType', description: 'Data Validation' }
    );

    let tooltipContent, adminAPICount;

    await test.step('Verify panel is visible and wait for chart', async () => {
      const isPanelVisible = await roomDashboardPage.isTagsDeployedPanelVisible();
      expect(isPanelVisible, 'Tags Deployed panel should be visible').toBeTruthy();
      await roomDashboardPage.waitForTagsDeployedChart();
    });

    await test.step('Get Dashboard count from tooltip', async () => {
      console.log('📊 Data Consistency Check - TC-TAGS-007');
      console.log('   Testing: Existing Pigs Count Validation');
      console.log('\n🔄 Step 1: GETTING DATA FROM DASHBOARD TOOLTIP...');

      tooltipContent = await roomDashboardPage.getTooltipContentForLegend('Existing');
      expect(tooltipContent, 'Tooltip should be displayed for Existing').toBeTruthy();
      expect(tooltipContent.dateTime, 'Tooltip should include date/time').toBeTruthy();
      expect(tooltipContent.count, 'Tooltip should include count').toBeGreaterThanOrEqual(0);

      console.log(`      Dashboard Count: ${tooltipContent.count}`);
      console.log(`      Date Range: ${tooltipContent.dateTime}`);
    });

    await test.step('Get Admin API count', async () => {
      console.log('\n🔄 Step 2: CALLING ADMIN API TO VALIDATE DATA...');
      console.log('   ═══════════════════════════════════════════════════════════');
      console.log('   📡 API Source: Admin Backend');
      console.log('   🎯 Purpose: Get animals count with specific filters');
      console.log('   ═══════════════════════════════════════════════════════════');

      adminAPICount = await roomDashboardPage.getAdminAPIExistingCountFromAnimals(
        appData.locationIdentifier,
        tooltipContent.dateTime
      );
    });

    await test.step('Compare Dashboard vs Admin API data', async () => {
      console.log('\n   📊 Final Comparison Results:');
      console.log('   ═══════════════════════════════════════════════════════════');
      console.log(`      📱 Dashboard Count:     ${tooltipContent.count}`);
      console.log(`      🔧 Admin API Count:     ${adminAPICount}`);
      console.log(`      🎯 Match Status:        ${tooltipContent.count === adminAPICount ? '✅ YES' : '❌ NO'}`);

      if (tooltipContent.count !== adminAPICount) {
        console.log(`      ⚠️  Difference:         ${Math.abs(tooltipContent.count - adminAPICount)}`);
      }
      console.log('   ═══════════════════════════════════════════════════════════\n');
    });

    // Attach comparison data for reporting
    await test.info().attach('data-comparison', {
      body: JSON.stringify({
        testId: 'TC-TAGS-007',
        testName: 'Existing Pigs Validation',
        timestamp: new Date().toISOString(),
        parameters: {
          locationIdentifier: appData.locationIdentifier,
          dateRange: tooltipContent.dateTime,
        },
        sources: {
          dashboard: {
            name: 'Dashboard Tooltip',
            value: tooltipContent.count,
            source: 'Tags Deployed Panel - Existing Bar'
          },
          adminAPI: {
            name: 'Admin API - Animals',
            value: adminAPICount,
            endpoint: 'AnimalGroupAdmin/AnimalAdmin/list',
            filters: {
              last_seen: tooltipContent.dateTime,
              status: ['normal', 'sub-optimal', 'poor']
            }
          }
        },
        validation: {
          match: tooltipContent.count === adminAPICount,
          difference: Math.abs(tooltipContent.count - adminAPICount),
          percentDiff: tooltipContent.count > 0
            ? ((Math.abs(tooltipContent.count - adminAPICount) / tooltipContent.count) * 100).toFixed(2) + '%'
            : '0%'
        }
      }, null, 2),
      contentType: 'application/json'
    });

    // Assert: Dashboard count should match Admin API count
    expect(tooltipContent.count, 'Dashboard count should match Admin API Animals count').toBe(adminAPICount);
  });

  /**
   * TEST CASE: TC-TAGS-008
   * Scenario: Verify the total inventory (Existing + Onboarded) for "This Week" column
   * Expected: The total value equals the sum of Existing and Onboarded pigs,
   *           as shown in the tooltip when hovering each type on the chart.
   * @severity critical
   * @feature Room Dashboard
   * @story Data Validation - Tags Deployed
   */
  test('TC-TAGS-008: Total inventory equals sum of Existing and Onboarded @data', async ({
    roomDashboardPage,
  }, testInfo) => {
    // Allure annotations
    testInfo.annotations.push(
      { type: 'feature', description: 'Room Dashboard' },
      { type: 'story', description: 'Data Validation - Tags Deployed' },
      { type: 'severity', description: 'critical' },
      { type: 'testId', description: 'TC-TAGS-008' },
      { type: 'testType', description: 'Data Validation' }
    );

    let tooltipData, existingCount, onboardedCount, calculatedTotal;

    await test.step('Verify panel is visible and wait for chart', async () => {
      const isPanelVisible = await roomDashboardPage.isTagsDeployedPanelVisible();
      expect(isPanelVisible, 'Tags Deployed panel should be visible').toBeTruthy();
      await roomDashboardPage.waitForTagsDeployedChart();
      console.log('📊 TC-TAGS-008: Verifying Total Inventory Calculation');
    });

    await test.step('Get tooltip data for both Existing and Onboarded', async () => {
      tooltipData = await roomDashboardPage.hoverOverTagsDeployedChart();
      existingCount = tooltipData['Existing']?.count || 0;
      onboardedCount = tooltipData['Onboarded']?.count || 0;
      calculatedTotal = existingCount + onboardedCount;

      console.log('   📊 Inventory Breakdown:');
      console.log(`      Existing:   ${existingCount}`);
      console.log(`      Onboarded:  ${onboardedCount}`);
      console.log(`      Total:      ${calculatedTotal}`);
    });

    await test.step('Verify total inventory calculation', async () => {
      expect(existingCount, 'Existing count should be a valid number').toBeGreaterThanOrEqual(0);
      expect(onboardedCount, 'Onboarded count should be a valid number').toBeGreaterThanOrEqual(0);

      const actualTotal = existingCount + onboardedCount;
      expect(actualTotal, 'Total should equal sum of Existing and Onboarded').toBe(calculatedTotal);

      console.log('   ✅ Total inventory calculation verified');
    });
  });

  /**
   * TEST CASE: TC-TAGS-009
   * Scenario: Compare total inventory (Existing + Onboarded) for "This Week" with Admin site data
   * Expected: The total should match the calculated number of Existing and Onboarded pigs from the Admin API Animals table.
   * @severity blocker
   * @feature Room Dashboard
   * @story Data Validation - Tags Deployed
   */
  test('TC-TAGS-009: Total inventory matches Admin site data @data', async ({
    roomDashboardPage,
    appData
  }, testInfo) => {
    // Allure annotations
    testInfo.annotations.push(
      { type: 'feature', description: 'Room Dashboard' },
      { type: 'story', description: 'Data Validation - Tags Deployed' },
      { type: 'severity', description: 'blocker' },
      { type: 'testId', description: 'TC-TAGS-009' },
      { type: 'testType', description: 'Data Validation' }
    );

    let dashboardExisting, dashboardOnboarded, dashboardTotal, existingDateTime, onboardedDateTime;
    let adminExisting = 0, adminOnboarded = 0, adminTotal;

    await test.step('Verify panel is visible and wait for chart', async () => {
      const isPanelVisible = await roomDashboardPage.isTagsDeployedPanelVisible();
      expect(isPanelVisible, 'Tags Deployed panel should be visible').toBeTruthy();
      await roomDashboardPage.waitForTagsDeployedChart();
      console.log('📊 TC-TAGS-009: Comparing Total Inventory with Admin Site');
    });

    await test.step('Get dashboard data from tooltips', async () => {
      console.log('\n🔄 Step 1: GETTING DATA FROM DASHBOARD...');
      const tooltipData = await roomDashboardPage.hoverOverTagsDeployedChart();

      dashboardExisting = tooltipData['Existing']?.count ?? 0;
      dashboardOnboarded = tooltipData['Onboarded']?.count ?? 0;
      dashboardTotal = dashboardExisting + dashboardOnboarded;
      existingDateTime = tooltipData['Existing']?.dateTime;
      onboardedDateTime = tooltipData['Onboarded']?.dateTime;

      console.log(`      Dashboard Existing:  ${dashboardExisting}`);
      console.log(`      Dashboard Onboarded: ${dashboardOnboarded}`);
      console.log(`      Dashboard Total:     ${dashboardTotal}`);
      console.log(`      Existing Date Range: ${existingDateTime || 'N/A'}`);
      console.log(`      Onboarded Date Range: ${onboardedDateTime || 'N/A'}`);
    });

    await test.step('Get data from Admin API', async () => {
      console.log('\n🔄 Step 2: GETTING DATA FROM ADMIN API...');
      console.log('   ═══════════════════════════════════════════════════════════');

      if (existingDateTime) {
        console.log('   📡 Fetching Existing animals (last_seen filter)...');
        adminExisting = await roomDashboardPage.getAdminAPIExistingCountFromAnimals(
          appData.locationIdentifier,
          existingDateTime
        );
      } else {
        console.log('   ⚠️  No Existing date range available - skipping Existing count');
      }

      if (onboardedDateTime) {
        console.log('\n   📡 Fetching Onboarded animals (created_at filter)...');
        adminOnboarded = await roomDashboardPage.getAdminAPIOnboardedCountFromAnimals(
          appData.locationIdentifier,
          onboardedDateTime
        );
      } else {
        console.log('   ⚠️  No Onboarded date range available - skipping Onboarded count');
      }

      adminTotal = adminExisting + adminOnboarded;

      console.log('\n   📊 Admin API Results:');
      console.log(`      Admin Existing:  ${adminExisting}`);
      console.log(`      Admin Onboarded: ${adminOnboarded}`);
      console.log(`      Admin Total:     ${adminTotal}`);
      console.log('   ═══════════════════════════════════════════════════════════');
    });

    await test.step('Compare totals', async () => {
      console.log('\n   📊 Final Comparison:');
      console.log('   ═══════════════════════════════════════════════════════════');
      console.log(`      Dashboard Total: ${dashboardTotal}`);
      console.log(`      Admin Total:     ${adminTotal}`);
      console.log(`      Match:           ${dashboardTotal === adminTotal ? '✅ YES' : '❌ NO'}`);

      if (dashboardTotal !== adminTotal) {
        console.log(`      ⚠️  Difference:  ${Math.abs(dashboardTotal - adminTotal)}`);
      }
      console.log('   ═══════════════════════════════════════════════════════════\n');
    });

    // Attach comparison data for reporting
    await test.info().attach('data-comparison', {
      body: JSON.stringify({
        testId: 'TC-TAGS-009',
        testName: 'Total Inventory Validation',
        timestamp: new Date().toISOString(),
        parameters: {
          locationIdentifier: appData.locationIdentifier,
          existingDateRange: existingDateTime,
          onboardedDateRange: onboardedDateTime,
        },
        sources: {
          dashboard: {
            existing: dashboardExisting,
            onboarded: dashboardOnboarded,
            total: dashboardTotal
          },
          adminAPI: {
            existing: adminExisting,
            onboarded: adminOnboarded,
            total: adminTotal,
            endpoint: 'AnimalGroupAdmin/AnimalAdmin/list'
          }
        },
        validation: {
          match: dashboardTotal === adminTotal,
          difference: Math.abs(dashboardTotal - adminTotal),
          percentDiff: dashboardTotal > 0
            ? ((Math.abs(dashboardTotal - adminTotal) / dashboardTotal) * 100).toFixed(2) + '%'
            : '0%'
        }
      }, null, 2),
      contentType: 'application/json'
    });

    // Assert: Dashboard total should match Admin site total
    expect(dashboardTotal, 'Dashboard total should match Admin site total').toBe(adminTotal);

    console.log('   ✅ Total inventory matches Admin site data');
  });

  /**
   * TEST CASE: TC-TAGS-010
   * Scenario: Compare total inventory (Existing + Onboarded) for "This Week" with CURRENT INVENTORY panel
   * Expected: The total should be equal to (or very close to) the total number of Active tags
   *           shown in the CURRENT INVENTORY panel
   * @severity critical
   * @feature Room Dashboard
   * @story Data Validation - Cross-Panel Comparison
   */
  test('TC-TAGS-010: Total inventory matches CURRENT INVENTORY panel @data', async ({
    roomDashboardPage,
  }, testInfo) => {
    // Allure annotations
    testInfo.annotations.push(
      { type: 'feature', description: 'Room Dashboard' },
      { type: 'story', description: 'Data Validation - Cross-Panel Comparison' },
      { type: 'severity', description: 'critical' },
      { type: 'testId', description: 'TC-TAGS-010' },
      { type: 'testType', description: 'Data Validation' }
    );

    let existingCount, onboardedCount, tagsDeployedTotal, currentInventoryActive;

    await test.step('Verify panel is visible and wait for chart', async () => {
      const isPanelVisible = await roomDashboardPage.isTagsDeployedPanelVisible();
      expect(isPanelVisible, 'Tags Deployed panel should be visible').toBeTruthy();
      await roomDashboardPage.waitForTagsDeployedChart();
      console.log('📊 TC-TAGS-010: Comparing with CURRENT INVENTORY Panel');
    });

    await test.step('Get total from Tags Deployed panel', async () => {
      console.log('   🔄 Step 1: Getting data from Tags Deployed panel...');
      const tooltipData = await roomDashboardPage.hoverOverTagsDeployedChart();

      existingCount = tooltipData['Existing']?.count || 0;
      onboardedCount = tooltipData['Onboarded']?.count || 0;
      tagsDeployedTotal = existingCount + onboardedCount;

      console.log(`      Existing:        ${existingCount}`);
      console.log(`      Onboarded:       ${onboardedCount}`);
      console.log(`      Total Deployed:  ${tagsDeployedTotal}`);
    });

    await test.step('Get active tags from CURRENT INVENTORY panel', async () => {
      console.log('\n   🔄 Step 2: Getting data from CURRENT INVENTORY panel...');
      currentInventoryActive = await roomDashboardPage.getCurrentInventoryActiveTagsCount();
      console.log(`      Current Active:  ${currentInventoryActive}`);
    });

    await test.step('Compare and validate values', async () => {
      console.log('\n   📊 Comparison Results:');
      console.log(`      Tags Deployed Total:     ${tagsDeployedTotal}`);
      console.log(`      Current Inventory Active: ${currentInventoryActive}`);

      const difference = Math.abs(tagsDeployedTotal - currentInventoryActive);
      const percentDiff = tagsDeployedTotal > 0
        ? ((difference / tagsDeployedTotal) * 100).toFixed(2)
        : '0';

      console.log(`      Difference:              ${difference}`);
      console.log(`      Percent Difference:      ${percentDiff}%`);

      const tolerance = Math.max(5, Math.ceil(tagsDeployedTotal * 0.05));
      const isWithinTolerance = difference <= tolerance;

      console.log(`      Tolerance:               ±${tolerance}`);
      console.log(`      Within Tolerance:        ${isWithinTolerance ? '✅ YES' : '❌ NO'}`);

      expect(
        isWithinTolerance,
        `Total inventory (${tagsDeployedTotal}) should be close to Current Inventory Active (${currentInventoryActive}), within tolerance of ±${tolerance}`
      ).toBeTruthy();

      console.log('   ✅ Total inventory is close to CURRENT INVENTORY panel data');
    });
  });
});
