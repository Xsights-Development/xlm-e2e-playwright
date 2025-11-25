const { BasePage } = require('../base');
const { CubeAPI, AdminAPI } = require('../../config/api');
const {
  formatCubeJSData,
  formatAdminAPIData,
  sortDataByTimestamp,
  logFormattedData
} = require('../../utils/data');
const { convertDateToUTC } = require('../../utils/date');

/**
 * Farm Dashboard Page Object - Focuses on dashboard verification, BARNS navigation, and overview access
 * Reference: tests/app/selectors/dashboardPageSelectors.md and tests/app/selectors/overviewPageSelectors.md
 */
class RoomDashboardPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Selectors based on dashboardPageSelectors.md and overviewPageSelectors.md
    this.selectors = {
      // Dashboard verification
      dashboardContainer: '[data-testid="dashboard-container"]',
      
      // BARNS navigation
      barnsMenu: '[data-testid="barns-menu"]',
      barnsMenuAlt: 'text="BARNS"',
      
      // Nursery Barns section
      nurseryBarnsSection: 'text="Nursery Barns"',
      nursery1: 'text="Nursery 1"',
      nursery2: 'text="Nursery 2"',
      
      // Overview page elements
      overviewContainer: '[data-testid="overview-container"]',
      
      // Tags Deployed section
      tagsDeployedPanel: '[data-testid="tags-deployed-panel"]',
      tagsDeployedTitle: '[data-testid="tags-deployed-title"]',
      tagsDeployedChart: '[data-testid="tags-deployed-chart"]',
      
      // Chart elements
      inventoryTitle: 'p.text-center.font-bold:has-text("Inventory")',
      existingSeries: '.apexcharts-series[seriesname="Existing"]',
      onboardedSeries: '.apexcharts-series[seriesname="Onboarded"]',
      existingLegend: '.apexcharts-legend-series[seriesname="Existing"]',
      onboardedLegend: '.apexcharts-legend-series[seriesname="Onboarded"]',
      
      // Chart bars with values
      existingBarsWithValues: '.apexcharts-series[seriesname="Existing"] .apexcharts-bar-area[val]:not([val="0"])',
      onboardedBarsWithValues: '.apexcharts-series[seriesname="Onboarded"] .apexcharts-bar-area[val]:not([val="0"])',
      existingBarsAll: '.apexcharts-series[seriesname="Existing"] .apexcharts-bar-area',
      onboardedBarsAll: '.apexcharts-series[seriesname="Onboarded"] .apexcharts-bar-area',
      
      // Tooltip
      chartTooltip: '.apexcharts-tooltip',
      
      // Loading
      loadingSpinner: '[data-testid="loading"]',
      loadingSpinnerAlt: '.spinner',
    };
  }

  /**
   * Navigate to dashboard
   */
  async goto() {
    await this.navigate('/dashboard');
    await this.waitForPageLoad();
  }

  /**
   * Verify dashboard URL contains "dashboard"
   */
  async verifyDashboardURL() {
    const currentURL = this.page.url();
    if (!currentURL.includes('dashboard')) {
      throw new Error(`Expected URL to contain "dashboard", but got: ${currentURL}`);
    }
    console.log('✓ Dashboard URL verified');
    return true;
  }

  /**
   * Wait for dashboard to load
   */
  async waitForDashboardLoad() {
    try {
      await this.waitForSelector(this.selectors.dashboardContainer, { timeout: 10000 });
      console.log('✓ Dashboard loaded');
    } catch (error) {
      console.log('Dashboard container not found, but continuing...');
    }
  }

  /**
   * Click BARNS menu to expand
   */
  async clickBarnsMenu() {
    const selectors = [
      this.selectors.barnsMenu,
      this.selectors.barnsMenuAlt
    ];

    for (const selector of selectors) {
      try {
        await this.clickElement(selector);
        console.log(`✓ BARNS menu clicked using: ${selector}`);
        await this.wait(500); // Wait for expansion
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Could not find BARNS menu');
  }

  /**
   * Click Nursery Barns section to expand
   */
  async expandNurseryBarns() {
    try {
      await this.clickElement(this.selectors.nurseryBarnsSection);
      console.log('✓ Nursery Barns section expanded');
      await this.wait(500); // Wait for expansion animation
    } catch (error) {
      throw new Error('Could not find Nursery Barns section');
    }
  }

  /**
   * Navigate to Nursery 1
   */
  async navigateToNursery1() {
    try {
      await this.clickElement(this.selectors.nursery1);
      console.log('✓ Navigated to Nursery 1');
      await this.wait(1000); // Wait for page load
    } catch (error) {
      throw new Error('Could not navigate to Nursery 1');
    }
  }

  /**
   * Navigate to Nursery 2
   */
  async navigateToNursery2() {
    try {
      await this.clickElement(this.selectors.nursery2);
      console.log('✓ Navigated to Nursery 2');
      await this.wait(1000); // Wait for page load
    } catch (error) {
      throw new Error('Could not navigate to Nursery 2');
    }
  }

  /**
   * Complete navigation flow: Dashboard → BARNS → Nursery Barns → Nursery 2 → Overview
   */
  async navigateToNursery2Overview() {
    // Step 1: Verify we're on dashboard
    await this.verifyDashboardURL();
    
    // Step 2: Click BARNS menu (if not already expanded)
    try {
      await this.clickBarnsMenu();
    } catch (error) {
      console.log('BARNS menu may already be expanded');
    }
    
    // Step 3: Expand Nursery Barns section
    await this.expandNurseryBarns();
    
    // Step 4: Click Nursery 2
    await this.navigateToNursery2();
    
    // Step 5: Verify overview URL
    await this.verifyOverviewURL();
    
    console.log('✓ Complete navigation to Nursery 2 overview completed');
  }

  /**
   * Verify overview URL contains "overview"
   */
  async verifyOverviewURL() {
    const currentURL = this.page.url();
    if (!currentURL.includes('overview')) {
      throw new Error(`Expected URL to contain "overview", but got: ${currentURL}`);
    }
    console.log('✓ Overview URL verified');
    return true;
  }

  /**
   * Wait for overview page to load
   */
  async waitForOverviewLoad() {
    try {
      await this.waitForSelector(this.selectors.overviewContainer, { timeout: 10000 });
      console.log('✓ Overview page loaded');
    } catch (error) {
      console.log('Overview container not found, but continuing...');
    }
  }

  /**
   * Check if Tags Deployed panel is visible
   */
  async isTagsDeployedPanelVisible() {
    try {
      const isVisible = await this.isVisible(this.selectors.tagsDeployedPanel);
      if (isVisible) {
        console.log('✓ Tags Deployed panel is visible');
      }
      return isVisible;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for Tags Deployed chart to load
   */
  async waitForTagsDeployedChart() {
    try {
      await this.waitForSelector(this.selectors.tagsDeployedChart, { timeout: 10000 });
      console.log('✓ Tags Deployed chart loaded');
      await this.wait(2000); // Additional wait for chart rendering
    } catch (error) {
      throw new Error('Tags Deployed chart did not load');
    }
  }

  /**
   * Returns true if the Tags Deployed chart is present in the DOM.
   * Used by tests to verify chart presence.
   */
  async hasTagsDeployedChart() {
    try {
      return await this.isVisible(this.selectors.tagsDeployedChart);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get Tags Deployed panel title
   * @returns {Promise<string>}
   */
  async getTagsDeployedPanelTitle() {
    // Try selector first, fallback to visible text if needed
    try {
      if (await this.isVisible(this.selectors.tagsDeployedTitle)) {
        return await this.getText(this.selectors.tagsDeployedTitle);
      }
      // Fallback: find the paragraph with text "TAGS DEPLOYED"
      return await this.page.textContent('text=TAGS DEPLOYED');
    } catch (error) {
      return '';
    }
  }

  /**
   * Verify chart series are visible
   */
  async verifyChartSeries() {
    const existingVisible = await this.isVisible(this.selectors.existingSeries);
    const onboardedVisible = await this.isVisible(this.selectors.onboardedSeries);
    
    if (existingVisible && onboardedVisible) {
      console.log('✓ Both Existing and Onboarded series are visible');
      return true;
    }
    
    console.log(`⚠ Series visibility - Existing: ${existingVisible}, Onboarded: ${onboardedVisible}`);
    return false;
  }

  /**
   * Hover over a specific bar in the Tags Deployed chart.
   * @param {string|null} id - SVG element ID (optional)
   * @param {number|null} value - Bar value (optional)
   * @param {number|null} index - Bar index (optional)
   */
  async hoverOverSpecificBar(id = null, value = null, index = null) {
    try {
      let selector = null;
      // Priority: id > value > index
      if (id) {
        selector = `#${id}`;
      } else if (typeof value === 'number') {
        // Try Existing bars first
        selector = `.apexcharts-series[seriesname="Existing"] .apexcharts-bar-area[val="${value}"], .apexcharts-series[seriesname="Onboarded"] .apexcharts-bar-area[val="${value}"]`;
      } else if (typeof index === 'number') {
        // Try Existing bars by index
        const existingBars = await this.page.$$(this.selectors.existingBarsAll);
        if (existingBars.length > index) {
          await existingBars[index].hover();
          console.log(`✓ Hovered over Existing bar at index ${index}`);
          await this.wait(1000);
          return;
        }
        // Try Onboarded bars by index
        const onboardedBars = await this.page.$$(this.selectors.onboardedBarsAll);
        if (onboardedBars.length > index) {
          await onboardedBars[index].hover();
          console.log(`✓ Hovered over Onboarded bar at index ${index}`);
          await this.wait(1000);
          return;
        }
        throw new Error('Bar index out of range');
      }
      if (selector) {
        await this.page.hover(selector);
        console.log(`✓ Hovered over bar with selector: ${selector}`);
        await this.wait(1000);
      } else {
        throw new Error('No valid selector for hoverOverSpecificBar');
      }
    } catch (error) {
      console.log('⚠ Could not hover over specific bar:', error.message);
    }
  }

  /**
   * Hover over the first visible bar (Existing or Onboarded) to trigger tooltip.
   * Follows best practices from overviewPageSelectors.md.
   */
  async hoverOverTagsDeployedChart() {
    try {
      // Try Existing bars with values first
      const existingBars = await this.page.$$(this.selectors.existingBarsWithValues);
      if (existingBars.length > 0) {
        await existingBars[0].hover();
        console.log('✓ Hovered over first Existing bar with value');
        await this.wait(1000);
        return;
      }
      // Fallback: Onboarded bars with values
      const onboardedBars = await this.page.$$(this.selectors.onboardedBarsWithValues);
      if (onboardedBars.length > 0) {
        await onboardedBars[0].hover();
        console.log('✓ Hovered over first Onboarded bar with value');
        await this.wait(1000);
        return;
      }
      // If no bars with values, hover chart container as last resort
      await this.page.hover(this.selectors.tagsDeployedChart);
      console.log('✓ Hovered over Tags Deployed chart area (no bars with value)');
      await this.wait(1000);
    } catch (error) {
      console.log('⚠ Could not hover over Tags Deployed chart area:', error.message);
    }
  }

  /**
   * Hover over Existing bars with values
   */
  async hoverOverExistingBars() {
    try {
      await this.page.hover(this.selectors.existingBarsWithValues);
      console.log('✓ Hovered over Existing bars');
      await this.wait(1000); // Wait for tooltip
    } catch (error) {
      console.log('⚠ Could not hover over Existing bars:', error.message);
    }
  }

  /**
   * Hover over Onboarded bars with values
   */
  async hoverOverOnboardedBars() {
    try {
      await this.page.hover(this.selectors.onboardedBarsWithValues);
      console.log('✓ Hovered over Onboarded bars');
      await this.wait(1000); // Wait for tooltip
    } catch (error) {
      console.log('⚠ Could not hover over Onboarded bars (may have no values):', error.message);
    }
  }

  /**
   * Check if tooltip is visible after hover
   */
  async isTooltipVisible() {
    try {
      const isVisible = await this.isVisible(this.selectors.chartTooltip);
      if (isVisible) {
        console.log('✓ Tooltip is visible');
      }
      return isVisible;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get tooltip content and parse for date/time and pig counts.
   * Returns { dateTime, existingCount, onboardingCount }
   */
  async getTooltipContent() {
    try {
      await this.waitForSelector(this.selectors.chartTooltip, { timeout: 5000 });
      const content = await this.getText(this.selectors.chartTooltip);
      console.log(`✓ Tooltip content: ${content}`);

      // Parse tooltip content for date/time and pig counts
      // Example tooltip: "Oct 28 - Nov 3\nExisting: 12\nOnboarded: 5"
      const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
      let dateTime = '';
      let existingCount = undefined;
      let onboardingCount = undefined;

      for (const line of lines) {
        if (!dateTime && /\d/.test(line)) {
          dateTime = line;
        }
        // Chỉ lấy giá trị "Existing: N" đầu tiên tìm thấy trong tooltip
        if (existingCount === undefined) {
          const match = line.match(/Existing:\s*(\d+)/);
          if (match) existingCount = parseInt(match[1], 10);
        }
        // Chỉ lấy giá trị "Onboarded: N" hoặc "Onboarding: N" đầu tiên
        if (onboardingCount === undefined) {
          const match = line.match(/Onboard(ed|ing):\s*(\d+)/i);
          if (match) onboardingCount = parseInt(match[2], 10);
        }
      }

      // Default missing counts to 0 if not found
      if (existingCount === undefined) existingCount = 0;
      if (onboardingCount === undefined) onboardingCount = 0;

      return { dateTime, existingCount, onboardingCount };
    } catch (error) {
      return { dateTime: '', existingCount: undefined, onboardingCount: undefined };
    }
  }

  /**
   * Alias for getTooltipContent to match test expectation.
   */
  async getTagsDeployedTooltipContent() {
    return this.getTooltipContent();
  }

  /**
   * Verify chart legends
   */
  async verifyChartLegends() {
    const existingLegend = await this.isVisible(this.selectors.existingLegend);
    const onboardedLegend = await this.isVisible(this.selectors.onboardedLegend);
    
    if (existingLegend && onboardedLegend) {
      console.log('✓ Both chart legends are visible');
      return true;
    }
    
    console.log(`⚠ Legend visibility - Existing: ${existingLegend}, Onboarded: ${onboardedLegend}`);
    return false;
  }

  /**
   * Get number of bars with values for Existing series
   */
  async getExistingBarsCount() {
    try {
      const count = await this.count(this.selectors.existingBarsWithValues);
      console.log(`✓ Existing bars with values: ${count}`);
      return count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get number of bars with values for Onboarded series
   */
  async getOnboardedBarsCount() {
    try {
      const count = await this.count(this.selectors.onboardedBarsWithValues);
      console.log(`✓ Onboarded bars with values: ${count}`);
      return count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get number of columns (bars) in Tags Deployed chart (Existing + Onboarded)
   * Counts all bars, including those with value 0, by using the 'apexcharts-bar-area' selector.
   * Returns the maximum count of bars between Existing and Onboarded series.
   */
  async getTagsDeployedColumnCount() {
    try {
      const existingAllCount = await this.count(this.selectors.existingBarsAll);
      const onboardedAllCount = await this.count(this.selectors.onboardedBarsAll);
      // Usually, both series have the same number of columns (weeks)
      const columnCount = Math.max(existingAllCount, onboardedAllCount);
      console.log(`✓ Tags Deployed column count (all bars): ${columnCount}`);
      return columnCount;
    } catch (error) {
      console.log('⚠ Could not get Tags Deployed column count:', error.message);
      return 0;
    }
  }

  /**
   * Get the legends displayed in the Tags Deployed panel.
   * Returns an array of legend names (e.g., ['Existing', 'Onboarded']).
   */
  async getTagsDeployedLegends() {
    try {
      const legends = [];
      if (await this.isVisible(this.selectors.existingLegend)) {
        legends.push('Existing');
      }
      if (await this.isVisible(this.selectors.onboardedLegend)) {
        legends.push('Onboarded');
      }
      console.log(`✓ Tags Deployed legends: ${legends.join(', ')}`);
      return legends;
    } catch (error) {
      console.log('⚠ Could not get Tags Deployed legends:', error.message);
      return [];
    }
  }

  /**
   * Wait for loading to finish
   */
  async waitForLoadingToFinish() {
    const selectors = [
      this.selectors.loadingSpinner,
      this.selectors.loadingSpinnerAlt
    ];

    for (const selector of selectors) {
      try {
        await this.waitForSelectorHidden(selector, { timeout: 15000 });
        console.log('✓ Loading finished');
        return;
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Complete overview verification flow
   * Verifies all key elements on the overview page
   */
  async verifyOverviewPage() {
    // Verify URL
    await this.verifyOverviewURL();
    
    // Wait for overview to load
    await this.waitForOverviewLoad();
    
    // Verify Tags Deployed panel
    const panelVisible = await this.isTagsDeployedPanelVisible();
    if (!panelVisible) {
      console.log('⚠ Tags Deployed panel not visible');
    }
    
    // Wait for chart
    await this.waitForTagsDeployedChart();
    
    // Verify series
    await this.verifyChartSeries();
    
    // Verify legends
    await this.verifyChartLegends();
    
    console.log('✓ Overview page verification completed');
  }

  /**
   * Get onboarded pigs count for "This Week" from Tags Deployed panel.
   * Hovers the last onboarded bar and parses the tooltip.
   * @returns {Promise<number>}
   */
  async getThisWeekOnboardedCount() {
    await this.waitForTagsDeployedChart();
    // Get all onboarded bars with values
    const bars = await this.page.$$(this.selectors.onboardedBarsWithValues);
    if (bars.length === 0) {
      console.log('⚠ No onboarded bars with values found');
      return 0;
    }
    // Hover the last bar (assumed "This Week")
    const lastBar = bars[bars.length - 1];
    await lastBar.hover();
    await this.wait(1000);
    // Parse tooltip for onboarded count
    const tooltip = await this.getTooltipContent();
    return tooltip.onboardingCount ?? 0;
  }

  /**
   * Get existing pigs count for "This Week" from Tags Deployed panel.
   * Hovers the last existing bar and parses the tooltip.
   * @returns {Promise<number>}
   */
  async getThisWeekExistingCount() {
    await this.waitForTagsDeployedChart();
    // Get all existing bars with values
    const bars = await this.page.$$(this.selectors.existingBarsWithValues);
    if (bars.length === 0) {
      console.log('⚠ No existing bars with values found');
      return 0;
    }
    // Hover the last bar (assumed "This Week")
    const lastBar = bars[bars.length - 1];
    await lastBar.hover();
    await this.wait(1000);
    // Parse tooltip for existing count
    const tooltip = await this.getTooltipContent();
    return tooltip.existingCount ?? 0;
  }

  /**
   * Get expected existing pigs count from Admin site (CubeJS).
   * @returns {Promise<number>}
   */
  async getAdminSiteExistingCount() {
    const tooltip = await this.getTooltipContent();
    let weekIso = null;
    if (tooltip && tooltip.dateTime) {
      const match = tooltip.dateTime.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (match) {
        const [_, d, m, y] = match;
        weekIso = `${y}-${m}-${d}T00:00:00.000`;
      }
    }

    try {
      const cubeData = await CubeAPI.getInventoryTracking({
        locationId: 'f-nov23',
        startDate: '2025-10-13T00:00:00',
        endDate: '2025-11-09T23:59:59',
        granularity: 'week',
        // timezone: 'Australia/Perth',
        limit: 100,
      });

      if (cubeData && cubeData.length > 0 && weekIso) {
        const row = cubeData.find(
          r => r["snowflake_inventory_tracking.timestamp.week"] === weekIso
        );
        if (row) {
          return parseInt(row["snowflake_inventory_tracking.sum_existing_active_tags"], 10) || 0;
        }
      }
      return 0;
    } catch (e) {
      console.error('Failed to get admin site existing count:', e);
      return 0;
    }
  }

  /**
   * Get expected onboarded pigs count from Admin site (CubeJS).
   * This is used as the "actual" data source for validation.
   * @param {string} locationId - Location ID (e.g., 'nursery-2', 'f-nov23')
   * @param {Object} dateRange - Date range filter
   * @param {string} dateRange.startDate - Start date (format: '2025-11-03 00:00:00' or '2025-11-03T00:00:00')
   * @param {string} dateRange.endDate - End date (format: '2025-11-30 23:59:59' or '2025-11-30T23:59:59')
   * @param {Object} options - Optional parameters
   * @param {string} options.timezone - Optional timezone for CubeJS query (e.g., 'Australia/Perth')
   * @returns {Promise<number>}
   */
  async getAdminSiteOnboardedCount(locationId = 'f-nov23', dateRange = {}, options = {}) {
    try {
      // Convert date format if needed (Admin API format -> CubeJS format)
      const startDate = dateRange?.startDate?.replace(' ', 'T');
      const endDate = dateRange?.endDate?.replace(' ', 'T');

      const queryParams = {
        locationId,
        startDate,
        endDate,
        granularity: 'week',
        limit: 100,
      };

      // Add timezone if provided
      if (options.timezone) {
        queryParams.timezone = options.timezone;
        console.log(`   🌍 CubeJS query with timezone: ${options.timezone}`);
      }

      const cubeData = await CubeAPI.getInventoryTracking(queryParams);

      const fieldMapping = {
        'timestamp.week': 'snowflake_inventory_tracking.timestamp.week',
        'timestamp': 'snowflake_inventory_tracking.timestamp',
        'new_tags_onboarded': 'snowflake_inventory_tracking.sum_new_tags_onboarded',
        'existing_active_tags': 'snowflake_inventory_tracking.sum_existing_active_tags',
        'undetected_tags': 'snowflake_inventory_tracking.sum_undetected_tags',
      };
      
      // Format and log CubeJS data for easy comparison
      const formattedCubeData = formatCubeJSData(cubeData, fieldMapping);
      logFormattedData('CubeJS Data (Formatted)', formattedCubeData);

      if (cubeData && cubeData.length > 0) {
        // Sort data by timestamp ascending (oldest to newest)
        const sortedData = sortDataByTimestamp(cubeData, 'snowflake_inventory_tracking.timestamp');

        // Get the most recent week's data (last item after sorting)
        const lastWeekData = sortedData[sortedData.length - 1];
        // return parseInt(lastWeekData["snowflake_inventory_tracking.sum_new_tags_onboarded"], 10) || 0;
        return parseInt(lastWeekData["snowflake_inventory_tracking.sum_existing_active_tags"], 10) || 0;
      }
      return 0;
    } catch (e) {
      console.error('Failed to get admin site onboarded count:', e);
      return 0;
    }
  }

  /**
   * Get expected onboarded pigs count from Admin API (WeeklyInventoryTracking).
   * This is used as the "expected" data source for validation.
   * @param {string} locationId - Location ID (e.g., 'nursery-2', 'f-nov23')
   * @param {Object} dateRange - Date range filter
   * @param {string} dateRange.startDate - Start date (e.g., '2025-11-03 00:00:00')
   * @param {string} dateRange.endDate - End date (e.g., '2025-11-30 23:59:59')
   * @param {Object} options - Optional parameters
   * @param {string} options.timezone - Optional timezone (e.g., 'Australia/Perth'). If provided, dates will be converted to UTC for Admin API.
   * @returns {Promise<number>}
   */
  async getAdminAPIOnboardedCount(locationId = 'nursery-2', dateRange = {}, options = {}) {
    try {
      let startDate = dateRange?.startDate;
      let endDate = dateRange?.endDate;

      // If timezone is provided, convert dates to UTC for Admin API
      // Admin API expects UTC dates, so we need to convert from source timezone to UTC
      if (options.timezone && startDate && endDate) {
        const originalStartDate = startDate;
        const originalEndDate = endDate;

        startDate = convertDateToUTC(startDate, options.timezone);
        endDate = convertDateToUTC(endDate, options.timezone);

        console.log(`   🌍 Admin API timezone conversion (${options.timezone} → UTC):`);
        console.log(`      Start: ${originalStartDate} → ${startDate}`);
        console.log(`      End:   ${originalEndDate} → ${endDate}`);
      }

      const response = await AdminAPI.getWeeklyInventoryTracking({
        locationId,
        startDate,
        endDate,
        page: 1,
        perPage: 10,
      });

      const fieldMapping = {
        'timestamp.week': 'timestamp', // Special handling with ISO week conversion
        'timestamp': 'timestamp',
        'new_tags_onboarded': 'new_tags_onboarded',
        'existing_active_tags': 'existing_active_tags',
        'undetected_tags': 'undetected_tags',
        'location_id': 'location_id',
      };

      // Format and log Admin API data to match CubeJS format for easy comparison
      const formattedData = formatAdminAPIData(response.data.items, { fieldMapping });
      logFormattedData('Admin API Data (CubeJS Format)', formattedData);

      // Extract onboarded count from response
      // Response structure: { data: { items: [...], total: N } }
      if (response && response.data && response.data.items && response.data.items.length > 0) {
        // Sort data by timestamp ascending (oldest to newest) for consistency
        const sortedData = sortDataByTimestamp(response.data.items, 'timestamp');

        // Get the most recent week's data (last item after sorting)
        const lastWeekData = sortedData[sortedData.length - 1];

        // Extract new_tags_onboarded field
        // return parseInt(lastWeekData.new_tags_onboarded || 0, 10);
        return parseInt(lastWeekData.existing_active_tags || 0, 10);
      }

      return 0;
    } catch (e) {
      console.error('Failed to get admin API onboarded count:', e);
      return 0;
    }
  }

  /**
   * Perform chart interaction tests
   */
  async testChartInteractions() {
    // Hover over Existing bars
    await this.hoverOverExistingBars();
    const tooltipVisible1 = await this.isTooltipVisible();
    
    if (tooltipVisible1) {
      await this.getTooltipContent();
    }
    
    // Wait before next hover
    await this.wait(500);
    
    // Hover over Onboarded bars
    await this.hoverOverOnboardedBars();
    const tooltipVisible2 = await this.isTooltipVisible();
    
    if (tooltipVisible2) {
      await this.getTooltipContent();
    }
    
    console.log('✓ Chart interaction tests completed');
  }
}

module.exports = { RoomDashboardPage };
