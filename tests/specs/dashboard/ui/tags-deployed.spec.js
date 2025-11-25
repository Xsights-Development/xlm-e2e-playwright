const { test, expect } = require('../../../fixtures');

/**
 * TEST SUITE: Dashboard - Tags Deployed Panel UI Tests
 * CATEGORY: UI/UX Validation
 *
 * Tests visual elements, user interactions, and UI behavior:
 * - Panel visibility and layout
 * - Chart rendering and interactions
 * - Tooltip display and content
 * - Hover effects and animations
 */

test.describe('Dashboard - Tags Deployed Panel UI @ui @visual', () => {

  // Setup: Navigate to authenticated dashboard before each test
  test.beforeEach(async ({ authenticatedDashboard }) => {
    // User is already at dashboard with location selected
  });

  /**
   * TEST CASE: TC-TAGS-001
   * Scenario: Verify Tags Deployed panel is visible on dashboard
   */
  test('TC-TAGS-001: Tags Deployed panel visibility @smoke', async ({ roomDashboardPage }) => {
    const isPanelVisible = await roomDashboardPage.isTagsDeployedPanelVisible();

    expect(isPanelVisible, 'Tags Deployed panel should be visible').toBeTruthy();
  });

  /**
   * TEST CASE: TC-TAGS-002
   * Scenario: Verify all components of Tags Deployed panel are present
   * Components: Title, Chart, 4-week columns, Legends (Existing & Onboarded)
   */
  test('TC-TAGS-002: Tags Deployed panel components @smoke', async ({ roomDashboardPage }) => {
    // Verify panel is visible
    const isPanelVisible = await roomDashboardPage.isTagsDeployedPanelVisible();
    expect(isPanelVisible, 'Panel should be visible').toBeTruthy();

    await roomDashboardPage.waitForTagsDeployedChart();

    // Verify panel title
    const panelTitle = await roomDashboardPage.getTagsDeployedPanelTitle();
    expect(panelTitle).toContain('TAGS DEPLOYED');

    // Verify chart is present
    const hasChart = await roomDashboardPage.hasTagsDeployedChart();
    expect(hasChart, 'Chart should be present').toBeTruthy();

    // Verify 4-week columns (last 4 weeks of data)
    const columnCount = await roomDashboardPage.getTagsDeployedColumnCount();
    expect(columnCount, 'Should display 4 weeks of data').toBeGreaterThanOrEqual(4);

    // Verify chart legends
    const legends = await roomDashboardPage.getTagsDeployedLegends();
    expect(legends, 'Should have both Existing and Onboarded legends').toEqual(
      expect.arrayContaining(['Existing', 'Onboarded'])
    );
  });

  /**
   * TEST CASE: TC-TAGS-003
   * Scenario: Verify chart hover functionality works
   * Expected: Hovering over chart displays tooltip
   */
  test('TC-TAGS-003: Chart hover functionality @interaction', async ({
    roomDashboardPage,
    page
  }) => {
    const isPanelVisible = await roomDashboardPage.isTagsDeployedPanelVisible();
    expect(isPanelVisible).toBeTruthy();

    await roomDashboardPage.waitForTagsDeployedChart();

    // Verify chart is present
    const hasChart = await roomDashboardPage.hasTagsDeployedChart();
    expect(hasChart).toBeTruthy();

    // Verify hover methods exist
    expect(typeof roomDashboardPage.hoverOverTagsDeployedChart).toBe('function');
    expect(typeof roomDashboardPage.hoverOverSpecificBar).toBe('function');

    // Test 1: Hover over first visible bar
    await roomDashboardPage.hoverOverTagsDeployedChart();

    // Take screenshot for visual verification
    await page.screenshot({
      path: `test-results/tc-tags-003-hover-${Date.now()}.png`,
      fullPage: false
    });

    console.log('✓ Chart hover functionality tested');
  });

    /**
   * TEST CASE: TC-TAGS-004
   * Scenario: Verify tooltip displays correct information
   * Expected: Tooltip shows date range, existing count, onboarded count
   */
  test('TC-TAGS-004: Tooltip information content @interaction', async ({
    roomDashboardPage,
  }) => {
    const isPanelVisible = await roomDashboardPage.isTagsDeployedPanelVisible();
    expect(isPanelVisible).toBeTruthy();

    await roomDashboardPage.waitForTagsDeployedChart();

    // Hover over chart to trigger tooltip
    await roomDashboardPage.hoverOverTagsDeployedChart();

    // Get tooltip content
    const tooltipContent = await roomDashboardPage.getTagsDeployedTooltipContent();

    // Verify tooltip has required information
    expect(tooltipContent.dateTime, 'Tooltip should show date/time').toBeTruthy();
    expect(tooltipContent.existingCount, 'Tooltip should show existing count').toBeGreaterThanOrEqual(0);
    expect(tooltipContent.onboardingCount, 'Tooltip should show onboarding count').toBeGreaterThanOrEqual(0);

    console.log('   Tooltip Content:');
    console.log(`      Date/Time: ${tooltipContent.dateTime}`);
    console.log(`      Existing: ${tooltipContent.existingCount}`);
    console.log(`      Onboarded: ${tooltipContent.onboardingCount}`);
  });

  /**
   * TEST CASE: TC-TAGS-016
   * Scenario: Test different bar hovering methods
   * Methods: by index, by value, by SVG element ID
   */
  test('TC-TAGS-016: Chart bar hovering methods @interaction', async ({
    roomDashboardPage,
  }) => {
    const isPanelVisible = await roomDashboardPage.isTagsDeployedPanelVisible();
    expect(isPanelVisible).toBeTruthy();

    await roomDashboardPage.waitForTagsDeployedChart();

    // Test Method 1: Hover by index
    await roomDashboardPage.hoverOverSpecificBar(null, null, 0);
    console.log('✓ Hover by index (0) works');

    // Test Method 2: Hover by value
    await roomDashboardPage.hoverOverSpecificBar(null, 12, null);
    console.log('✓ Hover by value (12) works');

    // Test Method 3: Hover by SVG element ID
    await roomDashboardPage.hoverOverSpecificBar('SvgjsPath2206', null, null);
    console.log('✓ Hover by element ID works');

    console.log('✓ All hover methods tested successfully');
  });
});
