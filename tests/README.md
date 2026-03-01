# E2E Tests (xahwm-dashboard)

## Overview

Test suite for the xahwm-dashboard app: auth, dashboard, overview, animal management. For env, auth flow, and selectors see **[docs/](../docs/)** (`E2E-CONTEXT.md`, `selectors/login-flow.md`).

## Setup

1. **Install dependencies**
   ```bash
   npm install
   npx playwright install
   ```
   (Or use the `browsers` script from package.json.)

2. **Configure environment**
   - Copy `.env.example` to `.env`.
   - Set at least:
     - `APP_URL` – base URL (e.g. `http://localhost:3000`)
     - `APP_USER`, `APP_PASS` – login credentials
     - `APP_TENANT_IDENTIFIER`, `APP_FARM_IDENTIFIER` – tenant/farm selection (fallback: `APP_TENANT`, `APP_FARM` if identifiers not set)
     - `APP_LOCATION_TYPE`, `APP_LOCATION_IDENTIFIER` – for Overview precondition (Barns → room selection)
   - Optional: `APP_TAG_ID` for animal detail tests (defaults to `demo-tag`).

   **Security:** `.env` is gitignored; never commit it.

## Test structure

**Active suite:** TypeScript specs under `tests/specs/`, page objects in `pages/`, fixtures in `fixtures/`. Routes in `configs/routes.ts`.

```
tests/
└── specs/
    ├── auth/           # Login, tenant/farm, accessibility
    ├── dashboard/      # Post-login dashboard smoke
    ├── overview/       # Room overview (TAGS DEPLOYED, etc.)
    └── animal/         # Animal list & detail
```

The **`_legacy-js/`** folder is the old JavaScript suite and is not run by the default Playwright config.

## Running tests

Run from the **xlm-e2e-playwright** directory (where `playwright.config.ts` lives).

| Command | Description |
|--------|-------------|
| `npm run test` | Run all tests |
| `npm run test:headed -- overview` | Run Overview specs with browser visible |
| `npm run test:headed -- auth/login` | Run a specific area by path pattern |
| `npm run test:debug -- overview` | Debug mode |
| `npx playwright test tests/specs/overview/` | Run by directory |

**By tag:** `npx playwright test --grep @smoke` (critical path), `--grep @auth` (auth only).

## Test cases

- **Auth:** Sign-in, invalid/valid login, tenant + farm flow, accessibility, edge cases.
- **Dashboard:** Smoke – land on dashboard, verify tags-deployed panel.
- **Overview:** Load /overview; TAGS DEPLOYED area (i18n-safe via data-testid).
- **Animal:** List and detail by tag (uses `APP_TAG_ID` when set).

## Reports

```bash
npm run report
# or
npx playwright show-report reports/html
```

## Troubleshooting

- **Element not found:** App must be running at `APP_URL`; check `data-testid` in UI and credentials in `.env`.
- **Timeouts:** Adjust in `playwright.config.ts` or check network/app.
- **CI:** Set `CI=true`, `APP_URL`, and credential env vars in the pipeline.

## Best practices

1. Prefer **data-testid** (see docs); fallback to role / link href.
2. Use **configs/routes.ts** (ROUTES) for URLs.
3. Use **fixtures** (`authenticatedDashboard`, `authenticatedOnOverview`) for specs that need a logged-in session.
4. Keep tests **independent** and use **Page Objects** for interactions.
