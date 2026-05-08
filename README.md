# XLM E2E Playwright Tests

Automated E2E tests for XLM (xahwm-dashboard) using Playwright: auth, dashboard, overview, animal management.

## Quick start

1. **Install:** `npm install` then `npx playwright install` (or `npm run browsers`).
2. **Env:** Copy `.env.example` to `.env`, set `APP_URL`, `APP_USER`, `APP_PASS`, `APP_TENANT_IDENTIFIER`, `APP_FARM_IDENTIFIER`; for Overview add `APP_LOCATION_TYPE`, `APP_LOCATION_IDENTIFIER`. Never commit `.env`.
3. **Run:** `npm run test`. See [Commands](#commands) and [docs/](docs/) for context and selectors.

## Setup

**Dependencies**

```bash
npm install
npx playwright install
```

**Environment**

- Copy `.env.example` to `.env`.
- Required: `APP_URL`, `APP_USER`, `APP_PASS`, `APP_TENANT_IDENTIFIER`, `APP_FARM_IDENTIFIER` (or `APP_TENANT`, `APP_FARM`).
- For Overview tests: `APP_LOCATION_TYPE`, `APP_LOCATION_IDENTIFIER` (Barns → room).
- Optional: `APP_TAG_ID` for animal tests (default `demo-tag`).
- **Admin API (data comparison):** `ADMIN_URL`, `ADMIN_USER`, `ADMIN_PASS` – used by fixture `adminApi` to compare webapp data with Admin API (login → token in Cookie header `Authorization="bearer <token>"`).

`.env` is gitignored; do not commit it.

## Commands

Run from the project root (where `playwright.config.ts` is).

| Command | Description |
|--------|-------------|
| `npm run test` | Run all tests |
| `npm run test:headed` | Run with browser visible |
| `npm run test:debug` | Debug mode |
| `npm run test:ui` | Playwright UI mode |
| `npm run report` | Open last HTML report |
| `npx playwright test <path-or-pattern>` | Run by path or pattern |

**By tag:** `npx playwright test --grep @smoke`, `--grep @auth`.

## Structure

- **tests/specs/** – Specs (auth, dashboard, overview, animal).
- **pages/** – Page objects. **fixtures/** – Auth and Admin API fixtures.
- **lib/admin-api.client.ts** – Admin API client (login, get with Cookie auth). **configs/routes.ts**, **configs/admin-api.ts** – Route and Admin API config. **docs/** – Context and selectors.

```
tests/specs/
├── auth/        # Login, tenant/farm, accessibility
├── dashboard/   # Post-login smoke
├── overview/    # Room overview (TAGS DEPLOYED)
└── animal/      # List & detail by tag
```

## Preconditions & fixtures

Auth fixtures in `@/fixtures/auth.fixture.js`:

- **authenticatedDashboard** – Login + tenant + farm; user on dashboard.
- **authenticatedOnOverview** – Same, then location from Barns (`APP_LOCATION_IDENTIFIER`); user on Overview.
- **adminApi** – Admin API client (logged in). Use to compare webapp data with Admin API: `adminApi.get('/admin/AnimalGroupAdmin/AnimalAdmin/list', { page: 1, perPage: 10 })`. Token sent via header **Cookie:** `Authorization="bearer <access_token>"`. See `lib/admin-api.client.ts` and `configs/admin-api.ts`.

For Admin-only specs (no browser) use `@/fixtures/admin-api.fixture.js`. Set `APP_LOCATION_TYPE` and `APP_LOCATION_IDENTIFIER` in `.env` for Overview specs.

## Test cases

- **Auth:** Sign-in, invalid/valid login, tenant + farm flow, accessibility.
- **Dashboard:** Smoke – land on dashboard, tags-deployed panel.
- **Overview:** Load /overview; TAGS DEPLOYED (data-testid).
- **Animal:** List and detail by tag (`APP_TAG_ID`).

## Reports

```bash
npm run report
# or
npx playwright show-report reports/html
```

## Troubleshooting

- **Element not found:** App running at `APP_URL`? Check `data-testid` and credentials in `.env`.
- **Timeouts:** Tune in `playwright.config.ts` or check network/app.
- **CI:** Set `CI=true`, `APP_URL`, and credential env vars.

## Best practices

1. Prefer **data-testid** (see docs); fallback to role / link href.
2. Use **configs/routes.ts** (ROUTES) for URLs.
3. Use fixtures (`authenticatedDashboard`, `authenticatedOnOverview`) for logged-in specs.
4. Keep tests **independent**; use **Page Objects** for interactions.

## Documentation

- [docs/E2E-CONTEXT.md](docs/E2E-CONTEXT.md) – Env vars, auth flow, Overview.
- [docs/selectors/login-flow.md](docs/selectors/login-flow.md) – Selectors and login/Overview flow.
