# Farm Dashboard — E2E test hooks (Playwright)

**Route:** `/dashboard` (`FarmDashboard` in `src/views/FarmDashboard/index.js`)  
**Updated:** 2026-05-21  

Quick reference for Playwright. Only elements with `data-testid` / documented `data-*` are listed.

> **Index:** [`../README.md`](../README.md) — E2E hook index and prefix conventions.  
> **Screen prefix:** Hooks in this file use `farm-*` and appear on **`/dashboard`** (farm level) only.  
> Room / barn hooks use `room-*` on **`/overview`** — see [`room-dashboard.md`](./room-dashboard.md). Do not look for `room-tags-*` on `/dashboard` or `farm-tags-*` on `/overview`.

---

## Page layout

| Panel (UI title i18n key) | Component | Hooks in this doc |
|---------------------------|-----------|-------------------|
| Farm details (`titlFarmDetails`) | `FarmDetail.js` | `farm-detail-*` |
| Current inventory (`titleCurrentInventory`) | `FarmStatistics.js` | `active-tags-xiot-*` |
| Tags deployed (`titleTagsDeployed`) | `TagsDeployedChart.js`, `index.js` | `farm-tags-*` |
| Pigs with health alerts (`titlePigsWithHealthAlerts`) | `HealthAlertsChart.js` | `farm-alerts-*` |
| Recorded health events (`subTitleHealthEvents`) | `HealthAlertsReponsesChart.js` | `farm-events-*` |

---

## Farm details panel (`FarmDetail.js`)

### `data-testid`

| testid | What to assert | Visible / DOM text |
|--------|----------------|--------------------|
| `farm-detail-logo-link` | Link around logo | `href`: Google Maps URL or `#` |
| `farm-detail-logo` | Logo image | `src` URL; `alt`: `{farmName} logo` or `Farm logo` |
| `farm-detail-name` | Farm name row | Text: `farm.name` or `-` |
| `farm-detail-manager` | Manager row | Text: `farm.manager.username` or `-` |

Address, phone, and email rows have **no** `data-testid`.

### `data-*` on the same elements

| Attribute | On testid | DOM type | Value |
|-----------|-----------|----------|--------|
| `data-lat` | `farm-detail-logo-link` | string | `farm.lat_position`, or `""` if missing |
| `data-long` | `farm-detail-logo-link` | string | `farm.long_position`, or `""` if missing |
| `data-has-coordinates` | `farm-detail-logo-link` | string (`"true"` / `"false"`) | `"true"` only when both lat and long are set |
| `data-farm-id` | `farm-detail-name` | string (number coerced) | `farm.id`, or attribute omitted when undefined |
| `data-manager-id` | `farm-detail-manager` | string (number coerced) | `farm.manager.id`, or attribute omitted when undefined |

### Playwright snippets

```js
// Farm name
await expect(page.getByTestId('farm-detail-name')).toHaveText('My Farm')

// Maps link when coordinates exist
const link = page.getByTestId('farm-detail-logo-link')
await expect(link).toHaveAttribute('data-has-coordinates', 'true')
await expect(link).toHaveAttribute('href', /google\.com\/maps/)

// Stable IDs without parsing visible text
await expect(page.getByTestId('farm-detail-name')).toHaveAttribute('data-farm-id', '42')
```

---

## Current inventory panel (`FarmStatistics.js`)

**Row:** “Active” (orange background) — G-tag and S-tag **active tag counts**.

### `data-testid`

| testid | What to assert | Visible text |
|--------|----------------|--------------|
| `active-tags-xiot-g` | Grower (G) active tags | Locale-formatted number from API, or `--` while loading / missing |
| `active-tags-xiot-s` | Sow (S) active tags | Same |

**Visibility (column may be absent):**

| Farm `type_of_pigs` | G column (`active-tags-xiot-g`) | S column (`active-tags-xiot-s`) |
|---------------------|--------------------------------|--------------------------------|
| grower | yes | no |
| sow | no | yes |
| mix | yes | yes |

No extra `data-*` on these cells. Same testids on room view — see [Current inventory](./room-dashboard.md#current-inventory-panel-roomstatisticsjs) in `room-dashboard.md`.

**Data source (E2E):** REST `GET /stats/tags` — [`api-and-cube.md`](../api-and-cube.md). Playwright `@contract`: `appApi.getCurrentInventoryGCount()` / `getCurrentInventorySCount()`. Farm details use Admin (`adminApi`, `@business`).

### Playwright snippets

```js
// Parse count (strip commas if locale uses them)
const gText = await page.getByTestId('active-tags-xiot-g').textContent()
const gCount = gText === '--' ? null : Number(gText.replace(/,/g, ''))

await expect(page.getByTestId('active-tags-xiot-g')).toBeVisible() // only if farm shows G column
await expect(page.getByTestId('active-tags-xiot-s')).toHaveText(/\d+/)
```

---

## Tags deployed panel (`TagsDeployedChart.js`, `index.js`)

**Data source (E2E):** **Cube.js** only — full call guide: [`farm-tags-deployed-cube.md`](../farm-tags-deployed-cube.md). Not REST. Playwright: `cubeApi` + `buildFarmTagsDeployedQuery()`.

Naming: `farm-tags-{part}`; weekly counts use semantic week suffixes from `CHART_WEEK_OFFSET` in `constants/chart.constant.js`.

### Week keys (`CHART_WEEK_OFFSET`)

| Key | Meaning |
|-----|---------|
| `this-week` | Current ISO week |
| `prev-1` | Previous week |
| `prev-2` | Two weeks ago |
| `prev-3` | Three weeks ago |

### `data-testid`

| testid | What to assert |
|--------|----------------|
| `farm-tags-panel` | Panel wrapper (`index.js`) |
| `farm-tags-title` | Section title |
| `farm-tags-inventory` | Chart subtitle |
| `farm-tags-chart` | Bar chart |
| `farm-tags-existing` | Wrapper (sr-only); children `farm-tags-existing-{weekKey}` |
| `farm-tags-onboarded` | Wrapper (sr-only); children `farm-tags-onboarded-{weekKey}` |

Example child testids: `farm-tags-existing-this-week`, `farm-tags-existing-prev-1`, … `farm-tags-onboarded-prev-3`.

### Playwright snippets

```js
const existing = page.getByTestId('farm-tags-existing')
await expect(existing.getByTestId('farm-tags-existing-this-week')).toHaveText('58')
await expect(existing.getByTestId('farm-tags-existing-prev-1')).toHaveText('12')
```

### Playwright E2E (`tests/specs/farm.spec.ts` — Tags Deployed)

| Test | Assertion | Oracle |
|------|-----------|--------|
| TC1 `@farm` | sr-only `this-week` = Apex tooltip Existing / Onboarded | UI only |
| TC2 `@contract @farm` | `farm-tags-*-this-week` total vs Cube | `getFarmTagsDeployedThisWeekFromCube(appApi, cubeApi)` — **not** Admin |
| TC3 `@farm` | `existing + onboarded` ≈ Current Inventory (G+S) | REST inventory on same page; tolerance `2`, 10s stabilise loop |

Run: `npx playwright test --project=farm --grep @tags-deployed` (or `--grep "Tags Deployed"`).

Panel locator: `farm-tags-panel` with fallback `tags-deployed-panel`. Helpers: `pages/farm.page.ts`, `lib/cube/dashboard/oracles.ts`, `lib/ui/chart-tooltip.ts`.

---

## Health alerts chart (`HealthAlertsChart.js`)

**Panel:** “Pigs with Health Alerts” (`titlePigsWithHealthAlerts` in `index.js`).  
**Chart shape (same as tags deployed):** each **series** = one metric (stacked segment); `data[]` = one value per week, **oldest → newest** (left bar → right bar). This is **not** the health-events chart (`farm-events-*`), where each series = one week.

**`data[]` index → `weekKey`** (4-week window; example series shape after Cube is formatted):

| `data` index | `weekKey` | Example bar (Week 19) |
|--------------|-----------|------------------------|
| `0` | `prev-3` | all metrics `0` |
| `1` | `prev-2` | Medication Scheduled `6`, Added by Web `3` |
| `2` | `prev-1` | Alert Generated `2`, Added by Web `1` |
| `3` | `this-week` | all metrics `0` |

E2E hooks resolve counts with `getChartSeriesCountsByWeek` (`utils/chart.js`) — same helper as `farm-tags-*`.

| Series (i18n key) | EN legend | testid slug |
|-------------------|-----------|-------------|
| `legendAlertTriggered` | Alert Generated | `triggered` |
| `legendMedicationSchedule` | Medication Scheduled | `medication-scheduled` |
| `legendAddedByMobile` | Added by Mobile | `added-mobile` |
| `legendAddedByWeb` | Added by Web | `added-web` |

**Week keys** — `CHART_WEEK_KEYS` / `CHART_WEEK_OFFSET` in `constants/chart.constant.js`: `this-week`, `prev-1`, `prev-2`, `prev-3` (`this-week` = current ISO week).

### `data-testid`

| testid | What to assert |
|--------|----------------|
| `farm-alerts-title` | Chart subtitle (`subTitleHealthAlerts`) |
| `farm-alerts-chart` | Stacked bar chart |
| `farm-alerts-triggered` | Wrapper (sr-only); children `farm-alerts-triggered-{weekKey}` |
| `farm-alerts-medication-scheduled` | Wrapper (sr-only); children `farm-alerts-medication-scheduled-{weekKey}` |
| `farm-alerts-added-mobile` | Wrapper (sr-only); children `farm-alerts-added-mobile-{weekKey}` |
| `farm-alerts-added-web` | Wrapper (sr-only); children `farm-alerts-added-web-{weekKey}` |

Example child testids: `farm-alerts-triggered-this-week`, `farm-alerts-medication-scheduled-prev-1`, …

### Playwright: read actual from UI

Use the **sr-only** hooks (not the Apex chart DOM). Values are plain numbers; locale may add thousands separators.

**Helper — Alert Generated (copy into Playwright repo):**

```js
/** @param {string} weekKey 'this-week' | 'prev-1' | 'prev-2' | 'prev-3' */
async function getUiAlertTriggeredCount(page, weekKey) {
  const el = page
    .getByTestId('farm-alerts-triggered')
    .getByTestId(`farm-alerts-triggered-${weekKey}`)
  const text = (await el.textContent()) ?? '0'
  return Number(text.replace(/,/g, '')) || 0
}
```

**Preconditions:**

1. Navigate to `/dashboard` with farm context loaded.
2. Wait for chart: `await expect(page.getByTestId('farm-alerts-chart')).toBeVisible()`.
3. Ensure hooks exist: `await expect(page.getByTestId('farm-alerts-triggered-this-week')).toBeAttached()`.

### Playwright: sample test (per week)

Implement `loginAndOpenFarmDashboard` and expected oracles (e.g. `getExpectedAlertTriggeredForWeek`) in the **Playwright repo**. This dashboard repo only defines UI hooks.

```js
test('Alert Generated per week matches expected count', async ({ page }) => {
  await loginAndOpenFarmDashboard(page, { farmId: FIXTURE_FARM })

  await expect(page.getByTestId('farm-alerts-chart')).toBeVisible()

  const weekKeys = ['this-week', 'prev-1', 'prev-2', 'prev-3']

  for (const weekKey of weekKeys) {
    const expected = await getExpectedAlertTriggeredForWeek(FIXTURE_FARM, weekKey)
    const actual = await getUiAlertTriggeredCount(page, weekKey)
    expect(actual, `Alert Generated — ${weekKey}`).toBe(expected)
  }
})
```

**Smoke assert (fixed UI only, no oracle):**

```js
const triggered = page.getByTestId('farm-alerts-triggered')
await expect(triggered.getByTestId('farm-alerts-triggered-this-week')).toHaveText(/\d+/)
```

### Out of scope (this doc)

- **`RoomHealthAlertsChart.js`** (`/overview`): mirror with `room-alerts-*` when needed.
- Per-metric acceptance criteria and Cube oracles: implement in the Playwright repo (same pattern as medicated for `farm-events-*`).

---

## Recorded health events chart (`HealthAlertsReponsesChart.js`)

**Chart shape (different from tags deployed):** each **series** = one week; `data[categoryIndex]` = count for that event type.

| `data` index | X-axis category (i18n key) |
|--------------|----------------------------|
| `0` | `txtPigsMedicated` |
| `1` | `txtMoreThan3Medications` |
| `2` | `txtPigsRecovered` |
| `3` | `txtEuthanisedAndDead` |

Use `getChartCategoryCount(series, categoryIndex, weekOffset)` from `utils/chart.js` (`CHART_WEEK_OFFSET`, `HEALTH_EVENTS_CATEGORY_INDEX` in `constants/chart.constant.js`).

### `data-testid`

| testid | Role |
|--------|------|
| `farm-events-title` | Section title + info tooltip |
| `farm-events-chart` | Grouped bar chart |
| `farm-events-medicated` | Wrapper (sr-only); children `farm-events-medicated-{weekKey}` |
| `farm-events-high-medication` | Wrapper (sr-only); children `farm-events-high-medication-{weekKey}` |
| `farm-events-recovered` | Wrapper (sr-only); children `farm-events-recovered-{weekKey}` (`txtPigsRecovered`) |
| `farm-events-euthanised` | Wrapper (sr-only); children `farm-events-euthanised-{weekKey}` (`txtEuthanisedAndDead`) |

**Week keys** — same as tags deployed (`this-week`, `prev-1`, `prev-2`, `prev-3`):

| weekKey | Meaning | Medicated | 3+ meds | Recovered | Euthanised/dead |
|---------|---------|-----------|---------|-----------|-----------------|
| `this-week` | Current week | `1` | `0` | `0` | `0` |
| `prev-1` | Previous week | `1` | `0` | `0` | `0` |
| `prev-2` | Two weeks ago | `11` | `0` | `10` | `0` |
| `prev-3` | Three weeks ago | `0` | `0` | `0` | `0` |

### Playwright: read actual from UI

Use the **sr-only** hooks under `farm-events-medicated` (not the Apex chart DOM). Values are plain numbers as text; locale may add thousands separators.

**Target acceptance (for E2E in the Playwright repo):** for each week, the count should match the total number of **unique pigs** with status `Normal`, `Sub-optimal`, or `Poor`, medicated with **≤3 doses**, across **all locations** in the farm. The **expected** value comes from an independent Cube/API query in the Playwright repo (not documented here).

**Helper — read actual (copy into Playwright repo):**

```js
/** @param {string} weekKey 'this-week' | 'prev-1' | 'prev-2' | 'prev-3' */
async function getUiMedicatedCount(page, weekKey) {
  const el = page
    .getByTestId('farm-events-medicated')
    .getByTestId(`farm-events-medicated-${weekKey}`)
  const text = (await el.textContent()) ?? '0'
  return Number(text.replace(/,/g, '')) || 0
}
```

**Optional — 3+ medications** (`farm-events-high-medication-{weekKey}`):

```js
async function getUiHighMedicationCount(page, weekKey) {
  const el = page
    .getByTestId('farm-events-high-medication')
    .getByTestId(`farm-events-high-medication-${weekKey}`)
  const text = (await el.textContent()) ?? '0'
  return Number(text.replace(/,/g, '')) || 0
}
```

**Preconditions before reading counts:**

1. Navigate to `/dashboard` with farm context loaded.
2. Wait for chart: `await expect(page.getByTestId('farm-events-chart')).toBeVisible()`.
3. Ensure hooks exist: `await expect(page.getByTestId('farm-events-medicated-this-week')).toBeAttached()`.

### Playwright: sample test (medicated per week)

Implement `loginAndOpenFarmDashboard` and `getExpectedMedicatedPigsForWeek` in the **Playwright repo** (independent oracle). This dashboard repo only defines UI hooks.

```js
test('Pigs Medicated per week matches expected count', async ({ page }) => {
  await loginAndOpenFarmDashboard(page, { farmId: FIXTURE_FARM })

  await expect(page.getByTestId('farm-events-chart')).toBeVisible()

  const weekKeys = ['this-week', 'prev-1', 'prev-2', 'prev-3']

  for (const weekKey of weekKeys) {
    const expected = await getExpectedMedicatedPigsForWeek(FIXTURE_FARM, weekKey)
    const actual = await getUiMedicatedCount(page, weekKey)
    expect(actual, `Pigs Medicated — ${weekKey}`).toBe(expected)
  }
})
```

**Smoke assert (fixed UI only, no oracle):**

```js
const medicated = page.getByTestId('farm-events-medicated')
await expect(medicated.getByTestId('farm-events-medicated-this-week')).toHaveText(/\d+/)
```

---

## Source files

| File | Hooks |
|------|--------|
| `src/views/FarmDashboard/components/FarmDetail.js` | `farm-detail-logo-link`, `farm-detail-logo`, `farm-detail-name`, `farm-detail-manager` |
| `src/views/FarmDashboard/components/FarmStatistics.js` | `active-tags-xiot-g`, `active-tags-xiot-s` (Active row only) |
| `src/views/FarmDashboard/index.js` | `farm-tags-panel`, `farm-tags-title` |
| `src/views/FarmDashboard/components/TagsDeployedChart.js` | `farm-tags-inventory`, `farm-tags-chart`, `farm-tags-existing` (+ `{weekKey}`), `farm-tags-onboarded` (+ `{weekKey}`) |
| `src/views/FarmDashboard/components/HealthAlertsChart.js` | `farm-alerts-title`, `farm-alerts-chart`, `farm-alerts-triggered` / `medication-scheduled` / `added-mobile` / `added-web` (+ `{weekKey}` each) |
| `src/views/FarmDashboard/components/HealthAlertsReponsesChart.js` | `farm-events-title`, `farm-events-chart`, `farm-events-medicated` / `high-medication` / `recovered` / `euthanised` (+ `{weekKey}` each) |
