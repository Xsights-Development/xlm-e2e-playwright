# E2E Tests (xahwm-dashboard)

## Overview
Test suite for the xahwm-dashboard app: auth, dashboard, overview, animal management. Routes, flows, and selectors are documented in **[xahwm-docs/](../xahwm-docs/README.md)**.

## Test Structure

**Active suite (Playwright `testDir`):** TypeScript specs under `tests/specs/` and page objects in `pages/`. Fixtures in `fixtures/` provide `authenticatedDashboard` (page after full login on dashboard). Routes are in `configs/routes.ts` (ROUTES).

```
tests/
└── specs/
    ├── auth/
    │   └── login.spec.ts       # Login, tenant/farm, accessibility, edge cases
    ├── dashboard/
    │   └── dashboard.spec.ts   # Post-login dashboard smoke
    ├── overview/
    │   └── overview.spec.ts    # Room overview page
    └── animal/
        ├── animal-list.spec.ts # Animal management list
        └── animal-detail.spec.ts # Animal detail by tagId
```

The **`_legacy-js/`** folder contains the old JavaScript suite (fixtures, pages, specs). It is not run by the default Playwright config. See `_legacy-js/README.md`.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env` and set at least:
   - `APP_URL` – base URL (e.g. `http://localhost:3000`)
   - `APP_USER`, `APP_PASS`, `APP_TENANT`, `APP_FARM` – used by login and authenticated fixtures

   Optional:
   - `APP_TAG_ID` – tag ID for animal detail tests (defaults to `demo-tag`)

## Running Tests

Run all commands from the **xlm-e2e-playwright** directory (where `playwright.config.ts` lives). Running from a parent folder can load the wrong specs and cause errors.

### Run all tests
```bash
npx playwright test
```

### Run by area
```bash
npx playwright test tests/specs/auth/
npx playwright test tests/specs/dashboard/
npx playwright test tests/specs/overview/
npx playwright test tests/specs/animal/
```

### Run by tag (@smoke, @auth)
- **@smoke** – Critical path; use in CI: `npx playwright test --grep @smoke`
- **@auth** – Auth-related tests only: `npx playwright test --grep @auth`

### Headed mode
```bash
HEADED=true npx playwright test
```

### Debug
```bash
npx playwright test tests/specs/auth/login.spec.ts --debug
```

## Test Cases

- **Auth:** Load sign-in, invalid/valid login, full flow (tenant + farm), accessibility (data-testid, ARIA), edge cases (empty fields, network delay).
- **Dashboard:** Smoke – land on dashboard after login, verify tags-deployed panel.
- **Overview:** Load /overview after login; reach overview via nav link.
- **Animal list:** Load /animal after login; reach via nav.
- **Animal detail:** Load /animal/:tagId, assert back link to /animal (uses `APP_TAG_ID` when set).

## Reports

```bash
npx playwright show-report reports/html
```

## Troubleshooting

- **Element not found:** App must be running at `APP_URL`; check `data-testid` in UI and credentials in `.env`.
- **Timeouts:** Increase in `playwright.config.ts` or check network/app.
- **CI:** Set `CI=true`, `APP_URL`, and credential env vars in your pipeline.

## Best Practices

1. Prefer **data-testid** (see xahwm-docs/06-selectors.md); fallback to role/text/link href.
2. Use **configs/routes.ts** (ROUTES) for URLs (no trailing slash).
3. Use **fixtures** (`authenticatedDashboard`) for specs that need a logged-in session.
4. Keep tests **independent** and use **Page Objects** for interactions.
