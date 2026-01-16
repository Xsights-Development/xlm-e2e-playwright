# Setup Guide

## Quick Start

### For Local Development

1. Copy the example env file:
```bash
cp .env.example .env
```

2. Edit `.env` with your credentials (see [.env.example](.env.example))

3. Install and run:
```bash
npm install
npm run install:browsers
npm test
```

### For CI/CD

See [CI-CD.md](CI-CD.md) for complete CI/CD setup guide.

**TL;DR:** Just set environment variables in your CI/CD pipeline. No need to create `.env` or JSON files.

## Environment Configuration

### 1. Setup Environment Variables

Copy the example env file and configure your credentials:

```bash
cp .env.example .env
```

Then edit `.env` file with your actual credentials:

```env
# App Credentials (REQUIRED)
APP_URL=https://dev.xsightslm.com
APP_USER=your-email@example.com          # ⚠️ KEEP SECRET
APP_PASS=your-password                    # ⚠️ KEEP SECRET
APP_TENANT=Your Tenant Name
APP_FARM=Your Farm Name

# Test Location (REQUIRED)
APP_LOCATION_CATEGORY=Sow
APP_LOCATION_NAME=Dry Sow Shed 1
APP_LOCATION_IDENTIFIER=dry-sow-shed-1
```

**Important:**
- `.env` file is already in `.gitignore` - NEVER commit this file
- All sensitive credentials (emails, passwords) are stored in `.env`
- Test data is loaded directly from `.env` via `shared/utils/test-config.js` - no build step required!

### 2. How Test Configuration Works

Test configuration is centralized in `shared/utils/test-config.js` which loads directly from environment variables:

**Environment Variables → Test Config:**

| ENV Variable | Test Config Property | Description |
|-------------|---------------------|-------------|
| `APP_USER` | `testConfig.credentials.username` | User email/username |
| `APP_PASS` | `testConfig.credentials.password` | User password |
| `APP_TENANT` | `testConfig.organization.tenant` | Tenant name |
| `APP_FARM` | `testConfig.organization.farm` | Farm name |
| `APP_LOCATION_CATEGORY` | `testConfig.location.category` | Location category |
| `APP_LOCATION_NAME` | `testConfig.location.name` | Location/barn name |
| `APP_LOCATION_IDENTIFIER` | `testConfig.location.identifier` | Location identifier |

**Example usage in tests:**

```javascript
const testConfig = require('../../shared/utils/test-config');

// Use credentials
await loginPage.login(
  testConfig.credentials.username,
  testConfig.credentials.password
);

// Use organization data
await loginPage.selectTenantAndWait(testConfig.organization.tenant);
await loginPage.selectFarmAndWait(testConfig.organization.farm);

// Use location data
await dashboardPage.navigateToLocation(testConfig.location.name);
```

**Benefits:**
- ✅ No build step needed - configuration loads automatically
- ✅ Centralized validation - missing env vars are caught at startup
- ✅ Type-safe access through structured properties
- ✅ Single source of truth for test configuration

### 3. Install Dependencies

```bash
npm install
npm run install:browsers
```

### 4. Run Tests

```bash
# Run all tests (default: uses APP_URL from .env)
npm test

# Run with UI mode
npm run test:ui

# Run specific test
npm run test:tc "TC-TAGS-001"

# Run on different environment (override APP_URL)
APP_URL=https://uat.yourdomain.com npm test
```

## Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use `.env.example`** - Update this when adding new env variables
3. **Keep credentials secure**:
   - All credentials are in `.env` (gitignored)
   - Test config loads directly from environment variables
   - No intermediate files containing credentials
4. **Rotate credentials** - Change passwords regularly
5. **Use different credentials** - Don't use production credentials for testing

## Troubleshooting

### Missing environment variables
If you see errors about missing credentials, make sure:
1. `.env` file exists in the root directory
2. All required variables are set (check `.env.example`)
3. Run `npm test` from the root directory (not subdirectories)

### Authentication failures
- Verify credentials in `.env` are correct
- Check if tenant and farm names match exactly (case-sensitive)
- Ensure APP_URL points to the correct environment
