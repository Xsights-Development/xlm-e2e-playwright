# XLM E2E Playwright Tests

Automated E2E testing repository for XLM projects using Playwright.

## 📁 Structure
```
xlm-e2e-playwright/
├── app/          # Tests for my-react-app
└── shared/       # Shared utilities
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 2. Install dependencies
npm install
npm run install:browsers
```

**Important:** Test configuration is loaded directly from `.env` file - no build step required!

See [SETUP.md](SETUP.md) for detailed setup instructions.

### Running Tests

```bash
# Run all tests
npm test

# Run with UI mode
npm run test:ui

# Run with headed mode
npm run test:headed

# Run in debug mode
npm run test:debug

# Run specific test by tag
npm run test:tc "TC-TAGS-001"

# Show test report
npm run test:report
```

## 🏷️ Test Tags

- `@ui` - UI interaction tests
- `@data` - Data validation tests
- `@smoke` - Critical flows (runs on all environments including production)
- `@regression` - Full regression tests (local & staging only)

## Preconditions & fixtures

Many test cases assume these preconditions:

1. **Precondition 1:** User is logged in, tenant and farm are selected, and the app is on the dashboard (or "go to dashboard" page).
2. **Precondition 2:** A location (barn/room) is selected so the app stays on the **Overview** page of that location.

Use the auth fixtures from `@/fixtures/auth.fixture.js`:

- **`authenticatedDashboard`** – Ensures precondition 1 only. Use when the test starts from the dashboard (e.g. testing navigation to Overview, or other dashboard flows).
- **`authenticatedOnOverview`** – Ensures preconditions 1 and 2. Use when the test should start already on the Overview page of a location (e.g. testing Overview tabs, inventory, or room-level features).

Optional env `APP_LOCATION_NAME` selects a specific location by name; if unset, the first barn in the list is selected.

## 🌍 Environments

**Simple configuration - just use environment variables!**

No need for separate config files per environment. Just set `APP_URL`:

- **Local**: `APP_URL=http://localhost:3000` (in `.env` file)
- **UAT/Staging**: `APP_URL=https://uat.yourdomain.com` (in CI/CD)
- **Prod**: Skip testing (already tested in UAT)

Other variables (credentials, test data) remain the same across environments.

## 📊 Reports

Test reports are generated in:
- `reports/` - Test reports

View reports:
```bash
npm run test:report
```

## 🧹 Cleaning
```bash
# Clean all test artifacts
npm run clean
```

## 🔄 Test Data Flow

```
.env file → test-config.js → Tests
```

Test data is loaded directly from environment variables via `shared/utils/test-config.js`:

**Environment Variables:**

| ENV Variable | Description | Usage in Tests |
|-------------|-------------|----------------|
| `APP_USER` | User email/username | `testConfig.credentials.username` |
| `APP_PASS` | User password | `testConfig.credentials.password` |
| `APP_TENANT` | Tenant name | `testConfig.organization.tenant` |
| `APP_FARM` | Farm name | `testConfig.organization.farm` |
| `APP_LOCATION_CATEGORY` | Location category | `testConfig.location.category` |
| `APP_LOCATION_NAME` | Location/barn name | `testConfig.location.name` |
| `APP_LOCATION_IDENTIFIER` | Location identifier | `testConfig.location.identifier` |

**Example usage in tests:**
```javascript
const testConfig = require('../../shared/utils/test-config');

await loginPage.login(testConfig.credentials.username, testConfig.credentials.password);
await loginPage.selectTenantAndWait(testConfig.organization.tenant);
```

⚠️ **Security:** The `.env` file is gitignored and contains credentials - **NEVER commit it**.

## 📖 Documentation

- [SETUP.md](SETUP.md) - Local development setup
- [CI-CD.md](CI-CD.md) - CI/CD configuration guide
- [App Tests README](./app/README.md)

## 🤝 Contributing

1. Create feature branch
2. Write tests
3. Run tests locally
4. Create PR

## 📧 Contact

XLM Team - support@xlm.com