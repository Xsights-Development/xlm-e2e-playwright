# XLM E2E Playwright Tests

Automated E2E tests for XLM (xahwm-dashboard) using Playwright.

## Quick start

- **Setup & run:** See **[tests/README.md](tests/README.md)** for install, env (`.env.example` → `.env`), and how to run tests.
- **Context & selectors:** See **docs/** – `E2E-CONTEXT.md`, `selectors/login-flow.md`.

## Commands (from project root)

```bash
npm install
npx playwright install   # or: npm run browsers

npm run test              # run all
npm run test:headed -- overview   # run Overview with browser
npm run test:headed -- auth/login # run by path pattern
npm run test:ui           # UI mode
npm run test:debug -- overview   # debug
npm run report            # open last report
```

## Preconditions & fixtures

Tests use auth fixtures from `@/fixtures/auth.fixture.js`:

- **`authenticatedDashboard`** – Session cleared, then login + tenant + farm; user on dashboard.
- **`authenticatedOnOverview`** – Same, then location selected from Barns (by `APP_LOCATION_IDENTIFIER`); user on Overview.

Set `APP_LOCATION_TYPE` and `APP_LOCATION_IDENTIFIER` in `.env` for Overview tests. Never commit `.env`.

## Structure

- **tests/specs/** – Test files (auth, dashboard, overview, animal).
- **pages/** – Page objects.
- **fixtures/** – Auth fixtures.
- **configs/routes.ts** – Route constants.
- **docs/** – E2E context and selectors.
- **_legacy-js/** – Old JS suite (not run by default).

## Documentation

- [tests/README.md](tests/README.md) – Setup, env, running tests.
- [docs/E2E-CONTEXT.md](docs/E2E-CONTEXT.md) – Env vars, auth flow, Overview.
- [docs/selectors/login-flow.md](docs/selectors/login-flow.md) – Selectors and login/Overview flow.
