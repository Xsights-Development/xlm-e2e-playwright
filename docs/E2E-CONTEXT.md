# XLM E2E Playwright – Project Context

This document describes configuration, auth flow, and selectors so Cursor or a new developer can run and modify E2E tests after pulling the code.

## 1. Purpose

- **Project:** `xlm-e2e-playwright` – Playwright E2E test suite for the XLM app (xahwm-dashboard).
- **Running tests:** The app must be running at `APP_URL` (e.g. `http://localhost:3000`). Credentials and location come from `.env`.

## 2. Environment variables (`.env`)

Copy `.env.example` to `.env` and set at least:

| Variable | Purpose |
|----------|---------|
| `APP_URL` | Base URL of the app (e.g. `http://localhost:3000`) |
| `APP_USER`, `APP_PASS` | Login email and password |
| `APP_TENANT_IDENTIFIER`, `APP_FARM_IDENTIFIER` | Tenant and farm identifiers to select after login (fallback: `APP_TENANT`, `APP_FARM`) |
| `APP_LOCATION_TYPE` | Barn group type (e.g. `General` or `general`); selected via `data-location-type` (i18n-safe). |
| `APP_LOCATION_IDENTIFIER` | Room identifier for selection via `data-location-identifier` (i18n-safe). |

For detailed selectors and flows, see **[selectors/login-flow.md](./selectors/login-flow.md)**.

## 3. Auth and Overview flow

1. **Login:** `/sign-in` → enter email/password → select tenant → Next → select farm → Go to Dashboard → `/dashboard`.
2. **Dashboard:** The **Barns** panel (FarmNavigation) is on the right; categories (e.g. General Barns) can be expanded/collapsed.
3. **Reaching Overview:** Expand the category per `APP_LOCATION_TYPE` (via `data-location-type`), click the room per `APP_LOCATION_IDENTIFIER` → `/overview`.

**Fixture `authenticatedDashboard`:** Session cleared, then login + tenant + farm; user on dashboard. Use for tests that need a logged-in user on dashboard.  
**Fixture `authenticatedOnOverview`:** Session cleared, then login + tenant + farm + dashboard + location selected from Barns; user on Overview. Use for tests that need Overview context.  
Each precondition clears session (cookies + storage) so tests always start from a clean state.

## 4. Relevant code structure

- **Fixtures:** `fixtures/auth.fixture.ts` – defines `authenticatedDashboard` and `authenticatedOnOverview` (using the env vars above).
- **Page objects:** `pages/login.page.ts`, `pages/overview.page.ts`, `pages/dashboard.page.ts`.
- **Barns → Overview:** `OverviewPage.expandBarnsCategory(category)` (uses `data-location-type`), `OverviewPage.selectLocationAndWaitForOverview(locationName?, category?, locationIdentifier?)`.

## 5. Running tests

From the **xlm-e2e-playwright** directory:

```bash
npm install
npx playwright test
```

Run by area: `npx playwright test tests/specs/auth/`, `tests/specs/overview/`, etc.  
See **README.md** (project root) for more.

---

When editing E2E or adding new tests, prefer **data-testid** and refer to **docs/selectors/login-flow.md** to avoid breakage when the UI changes.
