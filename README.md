# XLM Dashboard E2E Test Project Documentation

## Overview

This project provides comprehensive end-to-end (E2E) testing for the XLM Dashboard, a modern livestock management platform. The test suite ensures reliability, scalability, and quality for multi-tenant, multi-farm operations.

---

## 1. Modern Testing Frameworks: Why Playwright?

### Leading E2E Testing Frameworks

- **Playwright**
- **Cypress**
- **Selenium**
- **TestCafe**
- **WebdriverIO**
- **Puppeteer**

### Comparison & Rationale

| Framework    | Cross-Browser | Parallelism | Network/Device Emulation | API Testing | Headless | Auto-wait | Modern API | AI/Cloud Integration |
|--------------|---------------|-------------|-------------------------|-------------|----------|-----------|------------|---------------------|
| Playwright   | ✅             | ✅           | ✅                       | ✅           | ✅        | ✅         | ✅          | ✅                 |
| Cypress      | Partial        | ✅           | Partial                  | ✅           | ✅        | ✅         | ✅          | Partial            |
| Selenium     | ✅             | Partial      | Partial                  | Partial      | ✅        | ❌         | Legacy      | Partial            |
| TestCafe     | ✅             | ✅           | Partial                  | Partial      | ✅        | ✅         | ✅          | ❌                 |
| WebdriverIO  | ✅             | ✅           | Partial                  | ✅           | ✅        | Partial    | ✅          | Partial            |
| Puppeteer    | Chromium-only  | Partial      | ✅                       | Partial      | ✅        | ✅         | ✅          | ❌                 |

**Why Playwright?**
- True cross-browser support (Chromium, Firefox, WebKit)
- Powerful parallel execution and test isolation
- Native support for modern web features (network mocking, device emulation, multi-tab)
- Auto-waiting and robust selectors reduce flaky tests
- First-class TypeScript/JavaScript API
- Excellent integration with CI/CD and cloud/AI tools
- Open source, actively maintained by Microsoft

---

## 2. Technologies, Tools, AI & MCP Used

- **Playwright**: Core E2E testing framework
- **Node.js**: Runtime for test execution
- **Playwright MCP Server**: AI-powered test orchestration and documentation
- **AI Integration**: Automated test generation, code review, and documentation via MCP servers
- **Cube.js**: Analytics integration for dashboard validation
- **ESLint & Prettier**: Code quality and formatting
- **GitHub Actions**: CI/CD pipelines

---

## 3. Project Structure

```
xlm-e2e-playwright/
├── .gitignore
├── .sample.env
├── package.json
├── playwright.config.js
├── README.md
├── tests/
│   ├── app/
│   │   ├── data/            # Test data and fixtures
│   │   ├── fixtures/        # Playwright fixtures
│   │   ├── memory-bank/     # Project documentation & context
│   │   ├── pages/           # Page Object Models
│   │   ├── selectors/       # Selector documentation
│   │   └── specs/           # Test specifications
│   │       ├── auth/        # Authentication tests
│   │       └── dashboard/   # Dashboard feature tests
│   │           ├── ui/      # UI interaction tests
│   │           └── data/    # Data consistency tests
│   ├── cross/               # Cross-functional tests
│   ├── reports/             # Test reports and artifacts
│   └── shared/
│       ├── core/
│       │   ├── api.js       # API helpers (App, Admin, CubeJS)
│       │   ├── base.fixture.js
│       │   ├── cubejs.js    # CubeJS client configuration
│       │   └── env.js       # Environment configuration
│       ├── fixtures/        # Shared fixtures
│       ├── helpers/         # Utility functions
│       └── pages/           # Shared page objects
└── ...
```

### Directory Overview

- **tests/app/**: Main application E2E tests (dashboard, analytics, login, reporting)
- **tests/app/specs/dashboard/ui/**: UI interaction tests (visibility, tooltips, charts, interactions)
- **tests/app/specs/dashboard/data/**: Data consistency tests (API comparisons, data validation)
- **tests/app/memory-bank/**: Project documentation, architecture, and context (AI Memory Bank)
- **tests/shared/core/**: Core infrastructure (API layer, CubeJS client, environment config)
- **tests/shared/**: Shared utilities, fixtures, helpers, and page objects
- **tests/cross/**: Cross-domain or data consistency tests
- **tests/reports/**: Test reports and artifacts

### API Layer Architecture

The project uses a centralized API layer in `tests/shared/core/api.js` for:

- **AppAPI**: Application endpoints (user operations, dashboard data)
- **AdminAPI**: Admin operations via REST API (user management, settings)
- **CubeAPI**: Analytics queries via CubeJS (inventory tracking, reporting)

This approach eliminates the need for a separate admin test module by handling admin operations through API calls, making tests faster and more maintainable.

---

## 4. CI/CD Pipeline

- **GitHub Actions** or **AWS CodeBuild** for automated test execution
- **Steps:**
  1. Install dependencies (`npm ci`)
  2. Lint and format code (`npm run lint`, `npm run format`)
  3. Run unit and E2E tests (`npm test`, `npx playwright test`)
  4. Generate and upload test reports
  5. Deploy artifacts (if needed)
- **Artifacts:** HTML reports, screenshots, logs

---

## 5. Additional Notes

- **Memory Bank**: All project context, architecture, and progress are documented in `tests/app/memory-bank/` for onboarding, maintenance, and auditability.
- **Best Practices**: Modular test design, DRY principles, robust selectors, and clear separation between data, fixtures, and test logic.
- **Extensibility**: Easy to add new test suites, integrate new AI/MCP tools, or expand coverage.
- **Scalability**: Designed for large-scale, multi-tenant, multi-farm scenarios.
- **Security**: Test data isolation, secure handling of credentials, and compliance with best practices.

---

## 6. Test Organization & Reporting

### Test Categorization

Tests are organized by **feature** and **type** for better maintainability and execution flexibility:

#### UI Tests (`tests/app/specs/dashboard/ui/`)
- **Purpose**: Test user interface interactions, visual elements, and UI behavior
- **Examples**: Panel visibility, chart rendering, tooltips, hover effects, animations
- **Tag**: `@ui`
- **Speed**: Fast (typically < 5 seconds per test)
- **Run frequently**: After UI changes, in development

#### Data Tests (`tests/app/specs/dashboard/data/`)
- **Purpose**: Validate data consistency between different data sources
- **Examples**: CubeJS API vs Admin API comparisons, data accuracy validation
- **Tag**: `@data`
- **Speed**: Slower (requires API calls, data processing)
- **Run strategically**: Before releases, in CI/CD, for data validation

### Test Tags

Tests use tags for flexible filtering and execution:

- `@ui` - UI interaction tests
- `@data` - Data consistency tests
- `@smoke` - Critical smoke tests (run first)
- `@critical` - High-priority tests
- `@interaction` - User interaction tests
- `@visual` - Visual/appearance tests

### Allure Reporting

The project uses **Allure** for comprehensive visual test reporting:

#### Features:
- **Visual Dashboard**: Charts, graphs, and trends
- **Test History**: Track test execution over time
- **Data Attachments**: View detailed data comparisons
- **Environment Info**: Test environment details
- **Screenshots**: Automated screenshot capture on failures
- **Test Categorization**: Group tests by feature, tag, or suite

#### Generate and View Reports:

```bash
# Option 1: Generate and open report
npm run report:allure

# Option 2: Generate report only
npm run allure:generate

# Option 3: Open existing report
npm run allure:open

# Option 4: Serve report with live reload
npm run allure:serve
```

#### Report Location:
- **Results**: `allure-results/` (raw test results, JSON format)
- **Report**: `allure-report/` (HTML report)

#### Data Attachments in Tests:

Data consistency tests automatically attach comparison data for visual tracking:

```javascript
// Example: Data comparison attachment
await test.info().attach('data-comparison', {
  body: JSON.stringify({
    testId: 'TC-TAGS-006',
    testName: 'Onboarded Pigs Validation',
    timestamp: new Date().toISOString(),
    sources: {
      cubeJS: { name: 'CubeJS Analytics API', value: 1234 },
      adminAPI: { name: 'Admin Backend API', value: 1234 }
    },
    validation: {
      match: true,
      difference: 0,
      percentDiff: '0%'
    }
  }, null, 2),
  contentType: 'application/json'
});
```

In Allure reports, click on a test to view attached data comparisons.

---

## 7. Getting Started

### Setup Environment

1. Copy the sample environment file:
```bash
cp .sample.env .env
```

2. Update `.env` with your configuration:
```env
# App Configuration
APP_URL=https://staging.app.xlm.vn
APP_USER=your_test_user@app.com
APP_PASS=your_password
APP_TENANT=Your Tenant
APP_FARM=Your Farm

# Admin Configuration (for API calls)
ADMIN_URL=https://staging.admin.xlm.vn
ADMIN_USER=admin@xlm.vn
ADMIN_PASS=admin_password

# CubeJS Configuration
CUBE_API_URL=https://cube.staging.xiot.com.au/cubejs-api/v1
CUBE_API_TOKEN=your_cube_api_token

# Slack Notifications (optional)
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

### Install Dependencies

```bash
npm install
```

### Run Tests

#### Basic Execution

```bash
# Run all tests
npm test
# or
npx playwright test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests with Playwright UI mode (interactive)
npm run test:playwright-ui
```

#### Run by Test Category

```bash
# Run only UI tests
npm run test:ui

# Run only data consistency tests
npm run test:data

# Run smoke tests (critical flows)
npm run test:smoke

# Run critical tests
npm run test:critical
```

#### Run Specific Test Suites

```bash
# Run all authentication tests
npm run test:auth

# Run all dashboard tests (UI + data)
npm run test:dashboard

# Run only dashboard UI tests
npm run test:dashboard:ui

# Run only dashboard data tests
npm run test:dashboard:data

# Run specific test case (e.g., TC-TAGS-006)
npm run test:006
```

#### Run Specific Files or Folders

```bash
# Run tests in a specific folder
npx playwright test tests/app/specs/

# Run a specific test file
npx playwright test tests/app/specs/login.spec.js

# Run specific test by name pattern
npx playwright test -g "TC-TAGS-001"
```

#### View Test Reports

```bash
# View Playwright HTML report
npm run test:report
# or
npx playwright show-report

# Generate and view Allure report
npm run report:allure

# Serve Allure report with live reload
npm run allure:serve
```

#### Clean Test Artifacts

```bash
# Remove all reports and test results
npm run clean
```

### Using the API Layer

The API layer provides convenient helpers for making API calls in your tests:

```javascript
import { AppAPI, AdminAPI, CubeAPI } from '../../shared/core/api';

// App API example
const data = await AppAPI.get('/api/dashboard');
await AppAPI.post('/api/users', { name: 'Test User' });

// Admin API example (auto-authenticates on first call)
const animals = await AdminAPI.getAnimals({ page: 1, perPage: 10 });
const animal = await AdminAPI.getAnimal('animal-id');
const locations = await AdminAPI.getLocations();
const users = await AdminAPI.getUsers();

// Get weekly inventory tracking data
const weeklyInventory = await AdminAPI.getWeeklyInventoryTracking({
  locationId: 'nursery-2',
  startDate: '2025-11-03 00:00:00',
  endDate: '2025-11-30 23:59:59',
  page: 1,
  perPage: 10
});

// Manual login if needed (usually automatic)
await AdminAPI.login();

// CubeJS API example
const inventoryData = await CubeAPI.getInventoryTracking({
  locationId: 'f-nov23',
  startDate: '2025-10-01T00:00:00',
  endDate: '2025-11-30T23:59:59',
  timezone: 'Australia/Perth',
  granularity: 'week'
});

const tagsDeployed = await CubeAPI.getTagsDeployed('f-nov23', {
  granularity: 'week',
  limit: 100
});
```

### Admin API Authentication

The AdminAPI automatically handles authentication:

1. **Automatic Login**: First API call automatically logs in using credentials from `.env`
2. **Token Caching**: Token is cached and reused for subsequent calls
3. **Auto Retry**: If token expires (401), automatically re-authenticates and retries
4. **Available Methods**:
   - `getAnimals(params)` - Get list of animals
   - `getAnimal(id)` - Get single animal details
   - `getLocations(params)` - Get list of locations
   - `getUsers(params)` - Get list of users
   - `getWeeklyInventoryTracking(filters)` - Get weekly inventory tracking data
   - `login()` - Manual login (if needed)
   - `logout()` - Clear authentication token

---

## 8. References

- [Playwright Documentation](https://playwright.dev/)
- [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol)
- [Cube.js Analytics](https://cube.dev/)
- [GitHub Actions](https://docs.github.com/en/actions)
