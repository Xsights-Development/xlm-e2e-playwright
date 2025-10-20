# XLM E2E Playwright Tests

Automated E2E testing repository for XLM projects using Playwright.

## 📁 Structure
```
xlm-e2e-playwright/
├── app/          # Tests for my-react-app
├── admin/        # Tests for my-react-admin
└── shared/       # Shared utilities
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run install:browsers
```

### Running Tests

#### App Tests
```bash
# Run all app tests
npm run test:app

# Run with UI mode
npm run test:app:ui

# Run on specific environment
npm run test:app:local
npm run test:app:staging
npm run test:app:prod
```

#### Admin Tests
```bash
# Run all admin tests
npm run test:admin

# Run with UI mode
npm run test:admin:ui

# Run on specific environment
npm run test:admin:local
npm run test:admin:staging
npm run test:admin:prod
```

#### Run Both
```bash
# Run all tests (app + admin)
npm run test:all

# Run smoke tests only
npm run test:all:smoke
```

## 📝 Converting Manual Tests
```bash
# Convert app manual tests
npm run convert:app

# Convert admin manual tests
npm run convert:admin
```

## 🏷️ Test Tags

- `@smoke` - Critical flows (runs on all environments including production)
- `@regression` - Full regression tests (local & staging only)
- `@local` - Local environment only
- `@staging` - Staging environment only
- `@production` - Production-safe tests
- `@app` - App-specific tests
- `@admin` - Admin-specific tests

## 🌍 Environments

- **local** - http://localhost:3000 (app), http://localhost:4000 (admin)
- **staging** - https://app-staging.xlm.com, https://admin-staging.xlm.com
- **prod** - https://app.xlm.com, https://admin.xlm.com

## 📊 Reports

Test reports are generated in:
- `app/reports/` - App test reports
- `admin/reports/` - Admin test reports

View reports:
```bash
npm run test:app:report
npm run test:admin:report
```

## 🧹 Cleaning
```bash
# Clean all test artifacts
npm run clean

# Clean app artifacts only
npm run clean:app

# Clean admin artifacts only
npm run clean:admin
```

## 📖 Documentation

- [App Tests README](./app/README.md)
- [Admin Tests README](./admin/README.md)

## 🤝 Contributing

1. Create feature branch
2. Write tests
3. Run tests locally
4. Create PR

## 📧 Contact

XLM Team - support@xlm.com