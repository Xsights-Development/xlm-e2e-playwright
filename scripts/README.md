# Scripts

Placeholder directory for utility scripts.

## Test Configuration

**Note:** This project previously used a `build-test-data.js` script to generate JSON from environment variables. This has been simplified!

### Current Approach: Direct Environment Variable Loading

Test configuration is now loaded directly from environment variables via `shared/utils/test-config.js` - no build step required!

### How It Works

The `shared/utils/test-config.js` module:
- ✅ Loads environment variables from `.env` file automatically
- ✅ Validates all required variables on startup
- ✅ Provides structured access through organized properties
- ✅ No intermediate JSON files needed

### Environment Variables

| Environment Variable | Test Config Property | Description |
|---------------------|---------------------|-------------|
| `APP_USER` | `testConfig.credentials.username` | User email |
| `APP_PASS` | `testConfig.credentials.password` | User password |
| `APP_TENANT` | `testConfig.organization.tenant` | Tenant name |
| `APP_FARM` | `testConfig.organization.farm` | Farm name |
| `APP_LOCATION_CATEGORY` | `testConfig.location.category` | Location type/category |
| `APP_LOCATION_NAME` | `testConfig.location.name` | Location name |
| `APP_LOCATION_IDENTIFIER` | `testConfig.location.identifier` | Location identifier |

### Usage Example

**Setup (.env file):**
```env
APP_USER=your-email@example.com
APP_PASS=your-password
APP_TENANT=Your Tenant Name
APP_FARM=Your Farm Name
APP_LOCATION_CATEGORY=Finishing
APP_LOCATION_NAME=Finishing Barn 1
APP_LOCATION_IDENTIFIER=finishing-barn-1
```

**In your tests:**
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

### Benefits

✅ **Simpler workflow** - No build step to remember
✅ **Immediate updates** - Changes in `.env` take effect immediately
✅ **Type safety** - Structured properties instead of flat JSON
✅ **Validation** - Missing variables are caught at startup with helpful error messages
✅ **Secure** - Only `.env` file needs to be protected (no generated files)

### For CI/CD

Simply set environment variables in your CI/CD pipeline:

```yaml
env:
  APP_USER: ${{ secrets.APP_USER }}
  APP_PASS: ${{ secrets.APP_PASS }}
  APP_TENANT: "Your Tenant"
  APP_FARM: "Your Farm"
  # ... other variables
```

No additional build steps required!
