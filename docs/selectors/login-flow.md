# Login & Overview Flow – Selectors & Elements (E2E Reference)

Collected via Playwright MCP against `APP_URL` from `.env`. Use with credentials and location vars for full auth and Overview precondition.

**Preconditions:** Login, tenant selection, and farm selection are **preconditions** for tests (via fixtures `authenticatedDashboard`, `authenticatedOnOverview`). Do not add extra tests for this flow; use these preconditions to write tests for the **next steps** (dashboard, overview, etc.). Each precondition **clears session** (cookies + storage) before running, so every test starts from a clean state.

## 1. Environment (`.env`)

Values below are examples only; do not commit real credentials. Set these in `.env` (see `.env.example`).

| Variable               | Purpose                                      | Example                    |
|------------------------|----------------------------------------------|----------------------------|
| `APP_URL`              | Base URL to open and test                    | `http://localhost:3000`    |
| `APP_USER`             | Login email                                  | `your-email@example.com`  |
| `APP_PASS`             | Login password                               | `your-password`           |
| `APP_TENANT_IDENTIFIER` | Tenant identifier to select (fallback: `APP_TENANT`) | `your-tenant-id`           |
| `APP_FARM_IDENTIFIER`  | Farm identifier to select (fallback: `APP_FARM`). Must match `data-farm-identifier` in app (API may return number; app uses `String(value)`). | `your-farm-id` or numeric id |
| `APP_LOCATION_TYPE`    | Barn group type (normalized to lowercase). **i18n-safe:** selected via `data-location-type`. | `general`                  |
| `APP_LOCATION_IDENTIFIER` | Room identifier. **i18n-safe:** selected via `data-location-identifier`. | `your-location-id`         |

## 2. Login page (`/sign-in`)

The sign-in page uses a **step form**: the URL stays on `/sign-in` for the whole flow until the user clicks "Go to Dashboard". After clicking Login, the same page switches to the tenant selection step; after selecting tenant and clicking Next, it switches to the farm selection step; only after selecting farm and clicking "Go to Dashboard" does the app navigate to `/dashboard`. E2E must wait for `tenant-select` or `farm-select` to appear (not for a URL change) after login.

| Element         | Selector (E2E)                 | Role / Notes              |
|-----------------|---------------------------------|---------------------------|
| Email           | `data-testid="email-input"`     | textbox "Email"           |
| Password        | `data-testid="password-input"`  | textbox "Password"        |
| Sign In         | `data-testid="login-button"`   | button "Sign In"          |
| Forgot Password | link href `/forgot-password`   | link "Forgot Password?"   |
| Error message   | `role="alert"` (first)         | Shown on invalid login    |

**Page object:** `pages/login.page.ts` — `emailInput`, `passwordInput`, `loginButton`, `errorMessage`.

## 3. Tenant selection (after login, same URL `/sign-in`)

**Selection approach:** (1) Click `tenant-select` first to open the dropdown, (2) then click option `[data-tenant-identifier="..."]`. Do not click the option before the dropdown is open. Use identifier for stability (independent of label/i18n). Only run this step when the tenant selector screen is shown (user has multiple tenants).

| Element | Selector (E2E)                          | Notes                       |
|---------|----------------------------------------|-----------------------------|
| Tenant  | `data-testid="tenant-select"`          | Click first to open dropdown |
| Option  | `[data-tenant-identifier="..."]`       | Click after dropdown is open |
| Next    | `data-testid="next-button"`             | Proceed to farm selection  |

**Page object:** `LoginPage.selectTenant(tenantIdentifier)`, `LoginPage.clickNext()`.

## 4. Farm selection (after tenant, same URL `/sign-in`)

**Selection approach:** (1) Click `farm-select` first to open the dropdown, (2) then click option `[data-farm-identifier="..."]`. Do not click the option before the dropdown is open. Farm identifier is normalized to string; may be a number from API.

| Element   | Selector (E2E)                          | Notes                       |
|-----------|----------------------------------------|-----------------------------|
| Farm      | `data-testid="farm-select"`            | Click first to open dropdown |
| Option    | `[data-farm-identifier="..."]`          | Click after dropdown is open |
| Dashboard | `data-testid="dashboard-button"`        | Go to dashboard             |

**Page object:** `LoginPage.selectFarm(farmIdentifier)`, `LoginPage.clickDashboard()`.

**Skipping tenant/farm selection:** If the user belongs to only one tenant and that tenant has only one farm, the app does not show tenant/farm selection and redirects straight to `/dashboard`. E2E uses an adaptive flow: after login, if already on dashboard do nothing; if tenant-select is visible select tenant then Next; if farm-select is visible select farm then Go to Dashboard (see `LoginPage.ensureDashboardAfterLogin` / `loginWithTenantAndFarm`).

## 5. Dashboard (`/dashboard`)

- **URL:** `ROUTES.dashboard` → `/dashboard`
- **Assert:** `page.waitForURL(/\/dashboard/)`
- **Key areas (for smoke):** FARM DETAILS (farm name, address), CURRENT INVENTORY, TAGS DEPLOYED, **Barns menu (FarmNavigation)** on the right.

**Full flow:** `LoginPage.loginWithTenantAndFarm(email, password, tenantIdentifier, farmIdentifier)` (handles skip when 1 tenant + 1 farm) then `LoginPage.waitForDashboardLoad()`.

## 6. Barns menu (FarmNavigation) → Overview

Right-hand panel on dashboard. Categories (e.g. "General Barns") are collapsible and **translated (i18n)**; room names (e.g. "Room A") are **data, not translated**. Selection uses **data attributes** so E2E works in any locale.

| Element          | Selector (E2E)             | Notes                                                        |
|------------------|---------------------------|--------------------------------------------------------------|
| Barns title      | `data-testid="barns-menu"` | "BARNS" header (i18n)                                        |
| Category section | `data-location-type` | One per type (e.g. `general`). **i18n-safe:** select by `[data-location-type="..."]` only. |
| Room item        | `data-testid="barns-item"` + optional `data-location-identifier` (on item and on inner `span`) | Click to go to Overview. **Preferred:** click `span[data-location-identifier="..."]` (avoids overlay); fallback: by name on barns-item. |

**Flow for Overview precondition:** Expand category by `data-location-type` (e.g. `APP_LOCATION_TYPE` "General" normalized to `general`) → click room by `data-location-identifier` (e.g. `APP_LOCATION_IDENTIFIER`) → wait for `/overview`.

**Page object:** `OverviewPage.expandBarnsCategory(category)`, `OverviewPage.selectLocationAndWaitForOverview(locationName?, category?, locationIdentifier?)`. Prefer `locationIdentifier` for i18n-safe selection.

**Overview assertions (i18n-safe):** The "TAGS DEPLOYED" heading is translated. To assert the TAGS DEPLOYED area, use `data-testid="tags-deployed-panel"` and `data-testid="tags-deployed-title"` (do not assert by visible text). See `OverviewPage.tagsDeployedPanel`, `OverviewPage.tagsDeployedTitle`.

## 7. Flow summary

```
APP_URL/sign-in  (URL stays here until "Go to Dashboard")
  → fill email (APP_USER), password (APP_PASS)
  → click Sign In
  → same page: content switches to tenant step (wait for tenant-select, do not expect URL change)
  → [adaptive]
      - If already on /dashboard (1 tenant + 1 farm): skip tenant/farm selection
      - If tenant-select visible: click tenant-select → select by APP_TENANT_IDENTIFIER → Next
  → same page: content switches to farm step (wait for farm-select)
      - If farm-select visible: click farm-select → select by APP_FARM_IDENTIFIER → Go to Dashboard
  → now URL changes to /dashboard
  [authenticatedDashboard]

  → open Barns menu (right), expand by data-location-type (APP_LOCATION_TYPE), click room by data-location-identifier (APP_LOCATION_IDENTIFIER)
  → wait for /overview
  [authenticatedOnOverview]
```

**Fixtures:** `authenticatedDashboard` and `authenticatedOnOverview` in `fixtures/auth.fixture.ts` use env credentials and (for Overview) `APP_LOCATION_TYPE` and `APP_LOCATION_IDENTIFIER`.

## 8. Playwright MCP – Overview flow test

Use Playwright MCP Server with `browser_run_code`: clear session → login → wait for tenant step (URL remains `/sign-in`; wait for `tenant-select` to be visible) → click tenant-select, select option by identifier, Next → wait for farm step (`farm-select` visible) → click farm-select, select option by identifier, Go to Dashboard → wait for `/dashboard` → open Barns, expand by `data-location-type`, select room by `data-location-identifier` (APP_LOCATION_IDENTIFIER) → wait for `/overview`. The sign-in page is a step form: after Login the URL stays `/sign-in` until "Go to Dashboard".
