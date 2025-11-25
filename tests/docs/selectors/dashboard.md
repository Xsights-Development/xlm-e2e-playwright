# Dashboard Page Selectors

## Prompt
When automating dashboard page tests:
1. Use Playwright MCP Server for browser automation:
```javascript
const mcp = require('@executeautomation/mcp-playwright');
```

2. Read tenant and farm information from .env file:
```javascript
// Required environment variables from .env
// APP_TENANT=Groove Technology
// APP_FARM=Groove Farm
```

3. Focus on:
   - Navigation between sections
   - Tenant and farm selection
   - Menu interactions
   - Loading states
   - Page transitions

These selectors enable testing of the main dashboard interface and context management.

## Navigation
- Dashboard Container: `[data-testid="dashboard-container"]`
- Barns Menu: `[data-testid="barns-menu"]` or `text="BARNS"`

## Tenant Selection
- Tenant Dropdown: `[data-testid="tenant-select"]`
- Farm Dropdown: `[data-testid="farm-select"]`

## Side Menu Items
- Nursery Barns Section: `text="Nursery Barns"`
- Nursery Items:
  - Nursery 1: `text="Nursery 1"`
  - Nursery 2: `text="Nursery 2"`

**Important**: Text selectors like "Nursery Barns", "Nursery 1", "BARNS" are dynamic and may be translated. These should only be used as fallback selectors when data-testid attributes are not available. Always prefer data-testid attributes for stable, language-independent selectors.

## Example Usage with MCP Server
```javascript
// Select tenant from .env
await page.selectOption('[data-testid="tenant-select"]', process.env.APP_TENANT);

// Select farm from .env
await page.selectOption('[data-testid="farm-select"]', process.env.APP_FARM);

// Navigate to Nursery 2
await page.click('text="Nursery Barns"');
await page.click('text="Nursery 2"');

// Wait for navigation
await expect(page).toHaveURL(/.*dashboard/);
```

## Best Practices
1. Use data-testid attributes when available
2. For menu items without data-testid, use text selectors
3. Wait for elements to be visible before interacting
4. Verify URL contains "dashboard" after navigation
5. Ensure dropdowns are fully loaded before selection
6. Allow time for page transitions
7. Handle loading states during context changes
8. Use environment variables for tenant/farm selection
9. Verify MCP Server operations complete successfully
