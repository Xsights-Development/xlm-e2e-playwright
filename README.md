# XLM E2E Playwright Tests

Automated E2E tests for XLM (xahwm-dashboard) using Playwright.

## Quick start

1. `npm install` && `npm run browsers`
2. Copy `.env.example` → `.env` (credentials, `API_BASE_URL`, `CUBE_API_URL`, …)
3. `npm run test` — full suite (farm + overview projects)

**Run by area (no extra npm scripts):** see [docs/TESTING.md](docs/TESTING.md).

```bash
npx playwright test --project=farm
npx playwright test --project=farm --grep @health
npx playwright test --project=overview --grep "Tags Deployed"
npm run probe -- health
```

## Commands (minimal `package.json`)

| Command | Description |
|---------|-------------|
| `npm run test` | All Playwright projects |
| `npm run test -- --project=farm --grep @contract` | Pass-through CLI |
| `npm run test:headed` | Visible browser |
| `npm run test:ui` / `test:debug` | UI / debug mode |
| `npm run test:report` | HTML report |
| `npm run probe -- <cmd>` | API/Cube/Admin probes (`help`, `health`, `cube`, …) |

Do **not** add one npm script per test suite — use **`--project`** + **`--grep`** + describe **tags** ([configs/test-tags.ts](configs/test-tags.ts)).

## Layout

```
tests/specs/     farm.spec.ts, overview.spec.ts
pages/           Page objects (login selectors in login.page.ts)
fixtures/        auth.fixture, oracles/
lib/             api/, cube/, oracles/, ui/ — see lib/README.md
configs/         app-api, cube-api, cube-queries, test-tags
scripts/         probe.ts (+ lib/)
docs/            TESTING.md, e2e/
```

## Env & fixtures

- **REST:** `appApi` — `lib/api/app-api.client.ts`
- **Cube:** `cubeApi` — `lib/api/cube-api.client.ts`, oracles `lib/cube/dashboard/oracles.ts`
- **Admin:** `adminApi` — `lib/api/admin-api.client.ts` (`@business`)
- **UI session:** `authenticatedDashboardSession` (worker-scoped login)

Details: [docs/E2E-CONTEXT.md](docs/E2E-CONTEXT.md), [docs/TESTING.md](docs/TESTING.md), [docs/PROJECT-STRUCTURE.md](docs/PROJECT-STRUCTURE.md).

## Reports

`npm run test:report`
