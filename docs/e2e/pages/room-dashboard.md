# Room Dashboard — E2E test hooks (Playwright)

**Route:** `/overview` (`RoomDashboard` in `src/views/RoomDashboard/index.js`)  
**Updated:** 2026-05-21  

Room-level UI after selecting a barn/location (not the farm dashboard).

> **Index:** [`../README.md`](../README.md) — E2E hook index and prefix conventions.  
> **Screen prefix:** Hooks here use `room-*` and appear on **`/overview`** only.  
> Farm-level hooks use `farm-*` on **`/dashboard`** — see [`farm-dashboard.md`](./farm-dashboard.md).

**Prerequisite for E2E:** User authenticated, tenant/farm selected, and a **location** loaded (`currentLocation` in Redux). Navigate via barn selection in `FarmNavigation` (often lands on `/overview`).

---

## Page layout

| UI area | Component | Hooks |
|---------|-----------|--------|
| Current inventory (`titleCurrentInventory`) | `RoomStatistics.js` | `active-tags-xiot-*` (shared with farm) |
| Tags deployed (`titleTagsDeployed`) | `RoomTagsDeployedChart.js`, `index.js` | `room-tags-*` |

Naming mirrors farm: `room-tags-{part}` ↔ `farm-tags-{part}`.

---

## Current inventory panel (`RoomStatistics.js`)

**Row:** “Active” — G-tag and S-tag **active tag counts**. Same `data-testid` values as farm dashboard; selectors work on both `/dashboard` and `/overview`.

### `data-testid`

| testid | What to assert | Visible text |
|--------|----------------|--------------|
| `active-tags-xiot-g` | Grower (G) active tags | Locale-formatted number, or `--` while loading / missing |
| `active-tags-xiot-s` | Sow (S) active tags | Same |

**Visibility (column may be absent):** depends on farm `type_of_pigs` (`grower` / `sow` / `mix`) — same rules as [farm dashboard — Current inventory](./farm-dashboard.md#current-inventory-panel-farmstatisticsjs).

**Data source (E2E):** REST `GET /stats/room-tags` (location scope) — [`api-and-cube.md`](../api-and-cube.md). Playwright `@contract`: `appApi.getRoomCurrentInventoryGCount()` / `getRoomCurrentInventorySCount()`.

### Playwright snippets

```js
await page.goto('/overview')

const gText = await page.getByTestId('active-tags-xiot-g').textContent()
const gCount = gText === '--' ? null : Number(gText.replace(/,/g, ''))

await expect(page.getByTestId('active-tags-xiot-s')).toHaveText(/\d+/)
```

---

## Tags deployed panel (`RoomTagsDeployedChart.js`, `index.js`)

**Data source (E2E):** **Cube.js** — component key `room-tags-deployed`; filter `snowflake_inventory_tracking.location_id`. See [`api-and-cube.md`](../api-and-cube.md). Playwright: `buildRoomTagsDeployedQuery()` in `configs/cube-queries.ts`.

Count hooks are **this week only** (last bar in each weekly series). Data from `getChartSeriesCountByName` (webapp `utils/chart.js`).

### `data-testid`

| testid | What to assert | Visible text |
|--------|----------------|--------------|
| `room-tags-panel` | Panel wrapper | — (`index.js`) |
| `room-tags-title` | Section title | i18n `titleTagsDeployed` |
| `room-tags-inventory` | Chart subtitle | i18n `subTitleInventory` |
| `room-tags-chart` | Bar chart (ApexCharts) | Stacked weekly series |
| `room-tags-existing` | Existing tags, this week | Number (`legendExisting`, last `data` point) |
| `room-tags-onboarded` | Onboarded tags, this week | Number (`legendNewTagsOnboarded`, last point) |

### Playwright snippets

```js
await page.goto('/overview')

await expect(page.getByTestId('room-tags-panel')).toBeVisible()
await expect(page.getByTestId('room-tags-existing')).toHaveText('58')
await expect(page.getByTestId('room-tags-onboarded')).toHaveText('0')
await expect(page.getByTestId('room-tags-chart')).toBeVisible()
```

---

## Farm vs room tags hooks

| Role | Farm (`/dashboard`) | Room (`/overview`) |
|------|---------------------|---------------------|
| Panel | `farm-tags-panel` | `room-tags-panel` |
| Title | `farm-tags-title` | `room-tags-title` |
| Subtitle | `farm-tags-inventory` | `room-tags-inventory` |
| Chart | `farm-tags-chart` | `room-tags-chart` |
| Existing (this week) | `farm-tags-existing` | `room-tags-existing` |
| Onboarded (this week) | `farm-tags-onboarded` | `room-tags-onboarded` |

---

## Source files

| File | Hooks |
|------|--------|
| `src/views/RoomDashboard/components/RoomStatistics.js` | `active-tags-xiot-g`, `active-tags-xiot-s` |
| `src/views/RoomDashboard/index.js` | `room-tags-panel`, `room-tags-title` |
| `src/views/RoomDashboard/components/RoomTagsDeployedChart.js` | `room-tags-inventory`, `room-tags-chart`, `room-tags-existing`, `room-tags-onboarded` |
