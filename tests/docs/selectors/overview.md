# Overview Page Selectors

## Prompt
When automating overview page tests:
1. Use Playwright MCP Server for browser automation:
```javascript
const mcp = require('@executeautomation/mcp-playwright');
```

2. Prerequisites from .env and previous steps:
```javascript
// Required environment variables already used:
// APP_URL, APP_USER, APP_PASS, APP_TENANT, APP_FARM
// Need to complete login and navigation steps first
```

3. Focus on:
   - Chart interactions and hover states
   - Dynamic data visualization
   - Tooltip verifications
   - Loading states handling
   - Data accuracy verification

These selectors support testing of the Tags Deployed section's interactive charts.

## Page Identification
- Overview Container: `[data-testid="overview-container"]`
- Verify URL contains: `overview`

## TAGS DEPLOYED Section
### Container and Title
- Panel Container: `[data-testid="tags-deployed-panel"]`
- Title: `[data-testid="tags-deployed-title"]`
- Chart Container: `[data-testid="tags-deployed-chart"]`

### Chart Elements
- Inventory Title: `p.text-center.font-bold:has-text("Inventory")`
- Chart Series:
  - Existing Series: `.apexcharts-series[seriesname="Existing"]`
  - Onboarded Series: `.apexcharts-series[seriesname="Onboarded"]`
- Chart Legend:
  - Existing Legend: `.apexcharts-legend-series[seriesname="Existing"]`
  - Onboarded Legend: `.apexcharts-legend-series[seriesname="Onboarded"]`
- Chart Bars:
  - Existing Bars with Values: `.apexcharts-series[seriesname="Existing"] .apexcharts-bar-area[val]:not([val="0"])`
  - Onboarded Bars with Values: `.apexcharts-series[seriesname="Onboarded"] .apexcharts-bar-area[val]:not([val="0"])`

## Example Usage with MCP Server
```javascript
// Verify chart container is visible
await expect(page.locator('[data-testid="tags-deployed-chart"]')).toBeVisible();

// Using MCP Server for chart interactions
await mcp.playwright_hover({
  selector: '.apexcharts-series[seriesname="Existing"] .apexcharts-bar-area[val]:not([val="0"])'
});

await mcp.playwright_hover({
  selector: '.apexcharts-series[seriesname="Onboarded"] .apexcharts-bar-area[val]:not([val="0"])'
});

// Verify tooltips appear
await expect(page.locator('.apexcharts-tooltip')).toBeVisible();
```

## Best Practices
1. Use data-testid attributes where available
2. For chart interactions:
   - Use series name attributes rather than dynamic IDs
   - Filter for bars with non-zero values using [val]:not([val="0"])
   - Wait for tooltips to appear after hovering
3. Verify page URL contains "overview"
4. Allow time for charts to load and render
5. Handle cases where certain series might have no non-zero values
6. Verify tooltip content after hover interactions
7. Consider chart loading states and animations
8. Use MCP Server for consistent chart interactions
9. Handle dynamic data updates in charts
10. Verify data accuracy in tooltips
