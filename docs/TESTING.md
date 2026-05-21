# Running tests — conventions

**Do not add a new `package.json` script for every suite or release.** Use Playwright **`--project`**, **`--grep`**, and describe **tags** in specs.

## Core npm scripts

| Script | Use |
|--------|-----|
| `npm run test` | Full suite (all projects in `playwright.config.ts`) |
| `npm run test -- <args>` | Pass-through (`--project`, `--grep`, `--headed`, …) |
| `npm run test:headed` | All projects, visible browser |
| `npm run probe -- <cmd>` | Debug APIs (`npm run probe -- help`) |

Tag patterns for grep: [configs/test-tags.ts](../configs/test-tags.ts).

## Playwright projects

| Project | Specs | Workers |
|---------|--------|---------|
| `farm` | `farm.spec.ts` | 1 (shared dashboard session) |
| `overview` | `overview.spec.ts` | 1 |

```bash
npx playwright test --project=farm
npx playwright test --project=overview
npx playwright test --project=farm --headed
```

## Farm dashboard

```bash
npx playwright test --project=farm
npx playwright test --project=farm --grep @health
npx playwright test --project=farm --grep @contract
npx playwright test --project=farm --grep "@tags-deployed"
npx playwright test --project=farm --grep "Health Alerts"
```

### Farm tags (describe / test)

| Tag | Scope |
|-----|--------|
| `@farm` | Whole farm spec |
| `@contract` | UI vs App API / Cube |
| `@business` | UI vs Admin API |
| `@health` | Health Alerts + Health Events |
| `@tags-deployed` | Tags Deployed panel |
| `@inventory` | Current Inventory |

**New panel:** add `{ tag: '@your-panel' }` on `test.describe` in `farm.spec.ts`, then `--grep @your-panel`.

## Overview

```bash
npx playwright test --project=overview
npx playwright test --project=overview --grep "Tags Deployed"
npx playwright test --project=overview --grep @contract
```

## Probes (no browser)

```bash
npm run probe -- help
npm run probe -- health
npm run probe -- cube
npm run probe -- all
```

## CI example

```bash
npx playwright test --project=farm --grep @contract
npx playwright test --project=overview --grep @contract
```

Set `CI=true`, `APP_URL`, `API_BASE_URL`, `CUBE_API_URL`, credentials.
