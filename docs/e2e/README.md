# E2E test hooks (`data-testid`)

Playwright-oriented reference for stable selectors on farm and room dashboards. Only documented `data-testid` / `data-*` attributes are listed in screen docs.

**Updated:** 2026-05-21

---

## API & Cube (E2E)

How REST and Cube.js are called, which panels use which backend, and `@contract` replay (real API/Cube only): **[`api-and-cube.md`](./api-and-cube.md)**.

**Farm Tags deployed chart (Cube only):** **[`farm-tags-deployed-cube.md`](./farm-tags-deployed-cube.md)** — `/dashboard` tags panel.

Playwright QC handoff (Admin oracles, tags): **[`PLAYWRIGHT-HANDOFF.md`](./PLAYWRIGHT-HANDOFF.md)**.

Working docs for this Playwright repo are under **`docs/e2e/`**. Refresh from xahwm-dashboard when hooks or Cube queries change upstream.

---

## Screen index

| Route | View | Prefix | Doc |
|-------|------|--------|-----|
| `/dashboard` | `FarmDashboard` | `farm-*` (+ shared `active-tags-xiot-*`) | [`pages/farm-dashboard.md`](./pages/farm-dashboard.md) |
| `/overview` | `RoomDashboard` | `room-*`, shared `active-tags-xiot-*` | [`pages/room-dashboard.md`](./pages/room-dashboard.md) |

Do not use `farm-*` hooks on `/overview` or `room-*` on `/dashboard`.

---

## Prefix conventions

| Prefix | Scope | Example |
|--------|--------|---------|
| `farm-detail-*` | Farm details panel | `farm-detail-name` |
| `farm-tags-*` | Tags deployed (farm) | `farm-tags-existing-this-week` |
| `farm-alerts-*` | Deviation / health alerts chart (stacked) | `farm-alerts-triggered-prev-2` |
| `farm-events-*` | Recorded health events chart (grouped) | `farm-events-medicated-this-week` |
| `room-tags-*` | Tags deployed (room) | `room-tags-existing` |
| `active-tags-xiot-g` / `active-tags-xiot-s` | Active tag counts (farm **and** room statistics) | Shared across both routes |

---

## Chart data shapes (for oracles & hooks)

Two patterns in webapp `utils/chart.js` — do not mix them when reading `series`:

| Style | Charts | `series` = | `data[i]` = |
|-------|--------|------------|-------------|
| **Stacked weekly** | `TagsDeployedChart`, `HealthAlertsChart` | one metric (legend) | week index `i` (oldest → newest) |
| **Grouped weekly** | `HealthAlertsReponsesChart` | one week | category index `i` (medicated, 3+ meds, …) |

Week keys for E2E: `this-week`, `prev-1`, `prev-2`, `prev-3` (`CHART_WEEK_KEYS` in webapp `constants/chart.constant.js`).

---

## Playwright clients (this repo)

| Layer | Config | Client | Fixture |
|-------|--------|--------|---------|
| REST (`API_BASE_URL`) | `configs/app-api.ts` | `lib/api/app-api.client.ts` | `appApi` |
| Cube (`CUBE_API_URL`) | `configs/cube-api.ts`, `configs/cube-queries.ts` | `lib/api/cube-api.client.ts`, `lib/cube/dashboard/oracles.ts` | `cubeApi` |
| Admin (`ADMIN_URL`) | `configs/admin-api.ts` | `lib/api/admin-api.client.ts` | `adminApi` |

Probe: `npm run debug:farm-inventory`, `npm run debug:app-cube`.

---

## Adding hooks

1. Implement `data-testid` in the component under webapp `src/views/…`.
2. Document in the matching file under [`pages/`](./pages/).
3. Refresh from webapp `docs/e2e/` into `docs/webapp/`, then sync changes into `docs/e2e/` here.
4. If a new route or prefix family appears, add a row to this README index.

---

## Related docs

- REST + Cube: [`api-and-cube.md`](./api-and-cube.md)
- Playwright QC: [`PLAYWRIGHT-HANDOFF.md`](./PLAYWRIGHT-HANDOFF.md)
- Login selectors: [`../../pages/login.page.ts`](../../pages/login.page.ts)
- Project context: [`../E2E-CONTEXT.md`](../E2E-CONTEXT.md)
