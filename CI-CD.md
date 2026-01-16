# CI/CD Configuration Guide

## Overview

The test system is designed to run easily on CI/CD pipelines. You only need to set environment variables - no need to manually create JSON files.

## How It Works

### Test Data Flow

```
.env file → npm run build:data → app-data.json → Tests load JSON
```

**In CI/CD:**

1. Set environment variables
2. Run build script to generate JSON
3. Tests load data from JSON file

```bash
# CI/CD pipeline
export APP_USER=...
export APP_PASS=...
# ... other vars

# Build JSON from env vars
npm run build:data

# Run tests (will load from JSON)
npm test
```

**Benefits:**
- Simple and clear - single source of truth (JSON)
- Easy to debug - see data structure in JSON
- Flexible - easy to switch between test configs

## Configuration Philosophy

**Simplified workflow:**

1. **Local Development**: Manual testing using `.env` file
2. **UAT/Staging**: Automated CI/CD testing after deployment
3. **Production**: No testing (already fully tested in UAT)

**No need for separate config files per environment!** Just set `APP_URL` via environment variable:

```bash
# Local
APP_URL=http://localhost:3000

# UAT/Staging
APP_URL=https://uat.yourdomain.com

# Other configs remain the same, only URL changes
```

## CI/CD Setup

### Required Environment Variables

```bash
# ========================================
# App - Credentials (REQUIRED)
# ========================================
APP_URL=your-app-url
APP_USER=your-email
APP_PASS=your-password
APP_TENANT=your-tenant-name
APP_FARM=your-farm-name

# ========================================
# App - Test Location (REQUIRED)
# CI/CD will use these values to auto-generate test data
# ========================================
APP_LOCATION_CATEGORY=your-location-category
APP_LOCATION_NAME=your-location-name
APP_LOCATION_IDENTIFIER=your-location-identifier

# ========================================
# Admin API - Credentials (for data validation via Admin API)
# ========================================
ADMIN_URL=your-admin-api-url
ADMIN_USER=your-admin-username
ADMIN_PASS=your-admin-password

# ========================================
# Integrations (OPTIONAL)
# ========================================
SLACK_WEBHOOK_URL=your-slack-webhook-url
CUBE_API_URL=your-cube-api-url
CUBE_API_TOKEN=your-cube-api-token
```

## Examples

### GitHub Actions

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          npm install
          npx playwright install --with-deps

      - name: Build test data
        env:
          APP_URL: ${{ secrets.APP_URL }}
          APP_USER: ${{ secrets.APP_USER }}
          APP_PASS: ${{ secrets.APP_PASS }}
          APP_TENANT: ${{ secrets.APP_TENANT }}
          APP_FARM: ${{ secrets.APP_FARM }}
          APP_LOCATION_CATEGORY: ${{ secrets.APP_LOCATION_CATEGORY }}
          APP_LOCATION_NAME: ${{ secrets.APP_LOCATION_NAME }}
          APP_LOCATION_IDENTIFIER: ${{ secrets.APP_LOCATION_IDENTIFIER }}
        run: npm run build:data

      - name: Run E2E tests
        run: npm test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```
## Important Notes

### 1. Security

- **NEVER** commit credentials to git
- Use CI/CD secrets/variables for sensitive data
- `.env` file is already ignored in `.gitignore`

### 2. Test Location

- Test only **1 tenant, 1 farm, 1 location** at a time
- Does not support testing multiple locations simultaneously
- Suitable for smoke tests and regression tests

### 3. Local Development vs CI/CD

**Local Development:**
```bash
# Create .env file from template
cp .env.example .env

# Edit .env with your credentials
# Or use JSON file in test-data/app-data.json
```

**CI/CD:**
```bash
# No need for .env or JSON files
# Just set environment variables in CI/CD pipeline
# System will automatically detect and load
```

### 4. Debugging

Check logs when tests run:

```bash
# When building data:
🔨 Building test data from .env file...
✅ Test data generated successfully!

# When loading data in tests:
📦 Loaded test data from JSON file

# If error:
❌ Failed to load test data: ...
💡 Tip: Run "npm run build:data" to generate JSON from .env
```

## Testing the Setup

Test locally to verify CI/CD config works:

```bash
# Set environment variables
export APP_URL=your-app-url
export APP_USER=your-email
export APP_PASS=your-password
export APP_TENANT=your-tenant-name
export APP_FARM=your-farm-name
export APP_LOCATION_CATEGORY=your-location-category
export APP_LOCATION_NAME=your-location-name
export APP_LOCATION_IDENTIFIER=your-location-identifier

# Build test data
npm run build:data

# Run tests
npm test

# You should see:
# 📦 Loaded test data from JSON file
```

## Troubleshooting

### Tests won't run

1. Check all environment variables are set
2. Run `npm run build:data` to generate JSON
3. Check if `app/test-data/app-data.json` file exists
4. Check logs for specific errors

### Wrong credentials

1. Verify APP_USER, APP_PASS in CI/CD secrets
2. Test login manually first
3. Check if APP_URL points to correct environment

### Location doesn't exist

1. Verify APP_TENANT, APP_FARM have correct names
2. Check if APP_LOCATION_NAME, APP_LOCATION_CATEGORY exist
3. APP_LOCATION_IDENTIFIER must match barn in system
