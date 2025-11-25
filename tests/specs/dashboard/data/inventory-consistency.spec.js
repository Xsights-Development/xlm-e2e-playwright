const { test, expect } = require('../../../fixtures');
const { getTestDateRange } = require('../../../utils/date');

/**
 * TEST SUITE: Dashboard - Data Consistency Tests
 * CATEGORY: Data Validation & API Comparison
 *
 * Tests data accuracy and consistency between different data sources:
 * - CubeJS Analytics API
 * - Admin Backend API
 *
 * These tests verify that data displayed in the UI matches the source of truth
 * from backend systems.
 */

test.describe('Dashboard - Data Consistency @data @api', () => {

  // Setup: Navigate to authenticated dashboard before each test
  test.beforeEach(async ({ authenticatedDashboard }) => {
    // User is already at dashboard with location selected
  });

  /**
   * TEST CASE: TC-TAGS-006
   * Scenario: Validate onboarded pigs count matches between CubeJS and Admin API
   *
   * Data Sources:
   * - CubeJS: Analytics aggregation (actual display data)
   * - Admin API: Weekly inventory tracking (source of truth)
   *
   * Expected: Both sources should return identical counts for the same time period
   */
  test('TC-TAGS-006: Onboarded pigs - CubeJS vs Admin API @critical', async ({
    roomDashboardPage,
  }) => {
    // Define common parameters for both data sources
    // Date range: Last 4 weeks (current week + 3 weeks back)
    const { startDate, endDate } = getTestDateRange();
    const testParams = {
      locationId: 'nursery-2',
      startDate,
      endDate,
    };

    console.log('📊 Data Consistency Check - TC-TAGS-006');
    console.log('   📍 Test Parameters:');
    console.log(`      Location: ${testParams.locationId}`);
    console.log(`      Date Range: ${testParams.startDate} to ${testParams.endDate}`);

    // Fetch data from CubeJS (actual displayed data)
    console.log('   🔄 Fetching CubeJS data...');
    const cubeJSCount = await roomDashboardPage.getAdminSiteOnboardedCount(
      testParams.locationId,
      {
        startDate: testParams.startDate,
        endDate: testParams.endDate,
      }
    );

    // Fetch data from Admin API (source of truth)
    console.log('   🔄 Fetching Admin API data...');
    const adminAPICount = await roomDashboardPage.getAdminAPIOnboardedCount(
      testParams.locationId,
      {
        startDate: testParams.startDate,
        endDate: testParams.endDate,
      }
    );

    // Log comparison results
    console.log('   📊 Comparison Results:');
    console.log(`      CubeJS Count:    ${cubeJSCount}`);
    console.log(`      Admin API Count: ${adminAPICount}`);
    console.log(`      Match: ${cubeJSCount === adminAPICount ? '✅ YES' : '❌ NO'}`);

    if (cubeJSCount !== adminAPICount) {
      console.log(`      ⚠️  Difference: ${Math.abs(cubeJSCount - adminAPICount)}`);
    }

    // Attach comparison data for reporting
    await test.info().attach('data-comparison', {
      body: JSON.stringify({
        testId: 'TC-TAGS-006',
        testName: 'Onboarded Pigs Validation',
        timestamp: new Date().toISOString(),
        parameters: testParams,
        sources: {
          cubeJS: {
            name: 'CubeJS Analytics API',
            value: cubeJSCount,
            endpoint: 'snowflake_inventory_tracking'
          },
          adminAPI: {
            name: 'Admin Backend API',
            value: adminAPICount,
            endpoint: 'WeeklyInventoryTrackingAdmin'
          }
        },
        validation: {
          match: cubeJSCount === adminAPICount,
          difference: Math.abs(cubeJSCount - adminAPICount),
          percentDiff: cubeJSCount > 0
            ? ((Math.abs(cubeJSCount - adminAPICount) / cubeJSCount) * 100).toFixed(2) + '%'
            : '0%'
        }
      }, null, 2),
      contentType: 'application/json'
    });

    // Assert: Both sources must match exactly
    expect(cubeJSCount, 'CubeJS count should match Admin API count').toBe(adminAPICount);
  });
});
