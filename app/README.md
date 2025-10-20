# App E2E Tests

E2E tests for my-react-app.

## 📁 Structure
```
app/
├── tests/
│   ├── pages/          # Page Object Models
│   ├── specs/          # Test specifications
│   ├── fixtures/       # Test fixtures
│   └── utils/          # Utilities
├── test-data/          # Test data
├── config/             # Environment configs
└── scripts/            # Utility scripts
```

## 🚀 Running Tests
```bash
# From root directory
npm run test:app

# From app directory
cd app
playwright test

# Run specific test
playwright test tests/specs/auth/login.spec.js

# Run with specific browser
playwright test --project=chromium
playwright test --project=firefox

# Run tests matching pattern
playwright test --grep @smoke
playwright test --grep @regression
```

## 🌍 Environment Setup

Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

## 📝 Writing Tests

Example test structure:
```javascript
const { test, expect } = require('../../fixtures/app-fixture');

test.describe('Feature Name @app', () => {
  
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('Test case description @smoke', async ({ page, loginPage }) => {
    // Test implementation
  });
});
```

## 🏷️ Available Fixtures

- `loginPage` - Login page object
- `dashboardPage` - Dashboard page object
- `testData` - Test data from JSON files
- `authenticatedPage` - Page with user already logged in
- `fastAuthPage` - Page with saved authentication

## 📊 Test Reports
```bash
# View HTML report
playwright show-report

# From root
npm run test:app:report
```

## 🐛 Debugging
```bash
# Debug mode
playwright test --debug

# Headed mode
playwright test --headed

# UI mode
playwright test --ui
```