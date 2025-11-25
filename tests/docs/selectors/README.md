# Selector Documentation

## Overview
This folder contains comprehensive selector documentation for the XLM E2E Playwright test suite. The documentation is organized by page and designed to help AI assistants generate accurate test cases and Page Object Models.

## File Structure
```
tests/app/selectors/
├── README.md                    # This file - overview and guidelines
├── loginPageSelectors.md        # Login page selectors and examples
├── dashboardPageSelectors.md    # Dashboard navigation and context selectors
└── overviewPageSelectors.md     # Overview page chart and data selectors
```

## Purpose
These selector files enable:
1. **AI-Generated Test Cases**: AI can read these files to create automated test scripts
2. **Page Object Model Generation**: Structured format for creating maintainable POM classes
3. **Consistent Selector Usage**: Team-wide standards for element selection
4. **Documentation Reference**: Quick lookup for selectors during development

## How AI Should Use These Files

### For Test Case Generation
When generating test cases, AI should:
1. Read the appropriate selector file(s) for the test flow
2. Use the MCP Server examples as templates
3. Follow the test flow: Login → Dashboard → Overview
4. Reference environment variables from .env
5. Implement best practices listed in each file

### For Page Object Model Generation
When creating POM classes, AI should:
1. Create separate classes for each page (LoginPage, DashboardPage, OverviewPage)
2. Use selectors as class properties
3. Implement methods based on example usage sections
4. Include proper error handling and waiting strategies
5. Add JSDoc comments referencing the selector documentation

## Environment Configuration
All tests require environment variables from `.env`:
```bash
# Application (Static Values)
APP_URL=http://localhost:3000
APP_USER=user@example.com
APP_PASS=password
APP_TENANT=Tenant Name
APP_FARM=Farm Name
```

**Important Distinction**:
- **Static Data** (use in .env): APP_URL, APP_USER, APP_PASS, APP_TENANT, APP_FARM
- **Dynamic Data** (avoid as selectors): Button text, menu labels, form labels that may be translated
  - Examples: "Login", "Đăng nhập", "Next", "BARNS", "Nursery Barns", "Existing", "Onboarded"
  - These can change based on language/localization
  - Always prefer `data-testid` attributes over text selectors for these elements

## Test Flow
The typical test flow follows this sequence:
```
1. Login (loginPageSelectors.md)
   ↓
2. Dashboard Navigation (dashboardPageSelectors.md)
   ↓
3. Select Tenant/Farm
   ↓
4. Navigate to Nursery 2
   ↓
5. Overview Page Interactions (overviewPageSelectors.md)
```

## Playwright MCP Server Integration
All examples use the Playwright MCP Server:
```javascript
// Example initialization
const { use_mcp_tool } = require('@modelcontextprotocol/sdk');

// Navigate
await use_mcp_tool('github.com/executeautomation/mcp-playwright', 'playwright_navigate', {
  url: process.env.APP_URL
});

// Interact
await use_mcp_tool('github.com/executeautomation/mcp-playwright', 'playwright_click', {
  selector: '[data-testid="login-button"]'
});
```

## Page Object Model Template
```javascript
class LoginPage {
  constructor() {
    // Selectors from loginPageSelectors.md
    this.emailInput = '[data-testid="email-input"]';
    this.passwordInput = '[data-testid="password-input"]';
    this.loginButton = '[data-testid="login-button"]';
  }

  async login(email, password) {
    await page.fill(this.emailInput, email);
    await page.fill(this.passwordInput, password);
    await page.click(this.loginButton);
  }
}
```

## Test Case Template
```javascript
test('should login and navigate to overview', async () => {
  // Step 1: Login (using loginPageSelectors.md)
  await page.goto(process.env.APP_URL);
  await page.fill('[data-testid="email-input"]', process.env.APP_USER);
  await page.fill('[data-testid="password-input"]', process.env.APP_PASS);
  await page.click('[data-testid="login-button"]');

  // Step 2: Dashboard (using dashboardPageSelectors.md)
  await expect(page).toHaveURL(/.*dashboard/);
  await page.selectOption('[data-testid="tenant-select"]', process.env.APP_TENANT);
  await page.selectOption('[data-testid="farm-select"]', process.env.APP_FARM);

  // Step 3: Navigate to Nursery 2
  await page.click('text="Nursery Barns"');
  await page.click('text="Nursery 2"');

  // Step 4: Overview (using overviewPageSelectors.md)
  await expect(page).toHaveURL(/.*overview/);
  await expect(page.locator('[data-testid="tags-deployed-chart"]')).toBeVisible();
});
```

## Best Practices
1. **Always reference the selector files** when generating test code
2. **Use data-testid attributes** as the primary selector strategy
3. **Follow the documented test flow** for consistency
4. **Handle loading states** as described in each file
5. **Include proper error handling** for dynamic elements
6. **Document which selector file** is being referenced in comments

## Maintenance
When updating selectors:
1. Update the relevant selector file
2. Test the selectors in the actual application
3. Update examples if selector strategy changes
4. Maintain backward compatibility when possible
5. Document breaking changes

## For AI Assistants
When asked to:
- **"Create a test case"**: Read relevant selector files and use the test case template
- **"Create a Page Object"**: Read selector files and use the POM template
- **"Add a new test"**: Follow the documented test flow and selector patterns
- **"Update selectors"**: Verify changes against actual application

## Questions?
If selectors are unclear or incomplete:
1. Check the specific selector file for detailed examples
2. Verify the element exists in the application
3. Update documentation with new findings
4. Follow naming conventions in existing files
