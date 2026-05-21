# Farm Tags Deployed chart — Cube API for E2E

Standalone guide for Playwright / QA: how to call **Cube.js** the same way as the dashboard **Tags deployed** panel on `/dashboard`.

**Source component:** `src/views/FarmDashboard/components/TagsDeployedChart.js` (xahwm-dashboard)  
**UI route:** `/dashboard` (`APP_URL`)  
**E2E hooks:** `farm-tags-existing-{weekKey}`, `farm-tags-onboarded-{weekKey}` (see [`pages/farm-dashboard.md`](./pages/farm-dashboard.md))

**Updated:** 2026-05-21  
**Synced from:** `docs/webapp/farm-tags-deployed-cube.md`

This panel uses **Cube only** (not REST `/stats/tags`). Dev showcase mocks are **not** documented here — assume **UAT/production** backends.

---

## 1. What you are testing

| Chart series (UI) | Cube measure | E2E hook prefix |
|-------------------|--------------|-----------------|
| Existing active tags | `snowflake_inventory_tracking.sum_existing_active_tags` | `farm-tags-existing-` |
| New tags onboarded | `snowflake_inventory_tracking.sum_new_tags_onboarded` | `farm-tags-onboarded-` |

Week suffixes: `this-week`, `prev-1`, `prev-2`, `prev-3` (4 ISO weeks, oldest → newest in chart `data[]`).

---

## 2. Environment

| Webapp | Playwright `.env` |
|--------|-------------------|
| `REACT_APP_ROOT_API` | `API_BASE_URL` |
| `REACT_APP_CUBE_API` | `CUBE_API_URL` |

Use the **same** REST/Cube hosts as the Web UI build under test.

---

## 3. Authentication (before Cube)

Use the **same tenant, farm, and user** as the browser test.

### 3.1 Login

```http
POST {ROOT_API}/auth/login
Content-Type: application/x-www-form-urlencoded

username=<email>&password=<password>
```

The React `SignInForm` sends `username` + `password` (not JSON `email`). Playwright `AppApiClient.login()` matches that.

### 3.2 Session headers (all following REST + token calls)

| Header | Value |
|--------|--------|
| `Authorization` | `Bearer <dashboard_jwt>` |
| `X-Tenant-Identifier` | `<tenant identifier>` |
| `X-Farm-Identifier` | `<farm identifier>` |

### 3.3 Farm context

```http
GET {ROOT_API}/farms/current
Authorization: Bearer <dashboard_jwt>
X-Tenant-Identifier: <tenant>
X-Farm-Identifier: <farm>
```

From response, keep:

- **`farm.identifier`** — required Cube filter (string slug, not numeric id).
- **`settings.timezone`** (or tenant timezone) — Cube query `timezone` and week boundaries.

Playwright: `appApi.getFarmCurrent()`.

---

## 4. Cube token

```http
POST {ROOT_API}/cube/token
Authorization: Bearer <dashboard_jwt>
X-Tenant-Identifier: <tenant>
X-Farm-Identifier: <farm>
Content-Type: application/json

{ "type": "backend" }
```

**Response (typical):**

```json
{ "token": "<cube_jwt>" }
```

Use **`cube_jwt`** only for Cube `/load` (step 5). Playwright: `appApi.getCubeToken('backend')` → `CubeApiClient.fromAppApi(appApi)`.

---

## 5. Cube load — chart query

### 5.1 HTTP

```http
POST {CUBE_API}/load
Authorization: Bearer <cube_jwt>
Content-Type: application/json

{ "query": { ... } }
```

### 5.2 Date range (must match UI)

The app uses **4 ISO weeks**: current week + previous 3.

```js
// Same timezone as the app after login (moment.tz.setDefault(timezone))
const now = moment.tz(timezone)
const endDate = now.clone().endOf('isoWeek')
const startDate = endDate.clone().subtract(3, 'weeks').startOf('isoWeek')

function formatTimestampQueryCube(datetime) {
  return moment(datetime).format('YYYY-MM-DDTHH:mm:ss')
}
```

`inDateRange` values: `[formatTimestampQueryCube(startDate), formatTimestampQueryCube(endDate)]`.

### 5.3 Query object (copy-paste)

Replace placeholders at run time:

```json
{
  "query": {
    "limit": 100,
    "measures": [
      "snowflake_inventory_tracking.sum_new_tags_onboarded",
      "snowflake_inventory_tracking.sum_existing_active_tags",
      "snowflake_inventory_tracking.sum_undetected_tags"
    ],
    "order": {
      "snowflake_inventory_tracking.timestamp": "asc"
    },
    "timeDimensions": [
      {
        "dimension": "snowflake_inventory_tracking.timestamp",
        "granularity": "week"
      }
    ],
    "filters": [
      {
        "member": "be_location.status",
        "operator": "equals",
        "values": ["active"]
      },
      {
        "member": "snowflake_inventory_tracking.farm",
        "operator": "equals",
        "values": ["<farm.identifier>"]
      },
      {
        "member": "snowflake_inventory_tracking.timestamp",
        "operator": "inDateRange",
        "values": [
          "<startDate YYYY-MM-DDTHH:mm:ss>",
          "<endDate YYYY-MM-DDTHH:mm:ss>"
        ]
      }
    ],
    "timezone": "<timezone>"
  }
}
```

| Field | Source |
|-------|--------|
| `farm.identifier` | `GET /farms/current` |
| `timezone` | Farm or tenant settings |
| `inDateRange` | §5.2 |
| `be_location.status` | Always `"active"` in app |

Playwright builder: `buildFarmTagsDeployedQuery()` in `configs/cube-queries.ts`.

---

## 6. Parse response → expected counts

### 6.1 Pivot rows

The React app uses `resultSet.tablePivot()`. Each row includes at least:

| Pivot key | Used for |
|-----------|----------|
| `snowflake_inventory_tracking.timestamp.week` | Match ISO week bucket |
| `snowflake_inventory_tracking.sum_existing_active_tags` | Existing series |
| `snowflake_inventory_tracking.sum_new_tags_onboarded` | Onboarded series |

### 6.2 Map array index → `weekKey` → `data-testid`

| Index in `series[].data` | `weekKey` | Existing hook | Onboarded hook |
|--------------------------|-----------|---------------|----------------|
| 0 | `prev-3` | `farm-tags-existing-prev-3` | `farm-tags-onboarded-prev-3` |
| 1 | `prev-2` | `farm-tags-existing-prev-2` | `farm-tags-onboarded-prev-2` |
| 2 | `prev-1` | `farm-tags-existing-prev-1` | `farm-tags-onboarded-prev-1` |
| 3 | `this-week` | `farm-tags-existing-this-week` | `farm-tags-onboarded-this-week` |

Dashboard reference: `getChartSeriesCountsByWeek` in webapp `src/utils/chart.js`.

---

## 7. Playwright usage

### 7.1 Read **actual** from UI

```js
await page.goto('/dashboard')
await expect(page.getByTestId('farm-tags-chart')).toBeVisible()

async function readTagCount(page, series, weekKey) {
  const text = await page.getByTestId(`farm-tags-${series}-${weekKey}`).textContent()
  return text === '' ? 0 : Number((text ?? '0').replace(/,/g, '')) || 0
}

const actualExisting = await readTagCount(page, 'existing', 'this-week')
```

### 7.2 **@contract** — compare UI to Cube replay

1. Fixture `appApi` (login) + `cubeApi` (token).
2. `appApi.getFarmCurrent()` → `farm.identifier`, timezone.
3. `cubeApi.load(buildFarmTagsDeployedQuery({ farmIdentifier, dateRange, timezone }))`.
4. Parse pivot §6 → `expected`.
5. Read hooks §7.1 → `actual`.
6. `expect(actual).toBe(expected)` per `weekKey` and series.

### 7.3 **@business** (QC)

Compare UI hooks to **Admin API** expected values, not Cube replay. See [`PLAYWRIGHT-HANDOFF.md`](./PLAYWRIGHT-HANDOFF.md).

---

## 8. Playwright repo helpers

| Helper | Path |
|--------|------|
| Query builder | `configs/cube-queries.ts` — `buildFarmTagsDeployedQuery()` |
| Cube load | `lib/cube-api.client.ts` — `CubeApiClient.load()` |
| Fixtures | `appApi`, `cubeApi` in `fixtures/auth.fixture.ts` |
| Probe | `npm run debug:app-cube` |

```typescript
import { buildFarmTagsDeployedQuery } from '@/configs/cube-queries.js';

const query = buildFarmTagsDeployedQuery({
  farmIdentifier: 'GROOVE',
  dateRange: { startDate: '...', endDate: '...' },
  timezone: process.env.APP_TIMEZONE,
});
const result = await cubeApi.load(query);
const rows = cubeApi.tablePivot(result);
```

Implement pivot → week map in test helpers when adding Tags Deployed `@contract` specs.

---

## 9. Checklist

- [ ] Same **tenant**, **farm**, **timezone** as UI session  
- [ ] `farm.identifier` in filter (not numeric farm id)  
- [ ] Cube token via `POST /cube/token` with `type: "backend"`  
- [ ] `inDateRange` spans exactly **4 ISO weeks**  
- [ ] Compare **Existing** / **Onboarded** separately  
- [ ] Use hook suffix `this-week` … `prev-3`, not calendar dates in testids  

---

## 10. Related docs

| Doc | Content |
|-----|---------|
| [`pages/farm-dashboard.md`](./pages/farm-dashboard.md) | All `farm-tags-*` testids |
| [`api-and-cube.md`](./api-and-cube.md) | General REST + Cube patterns |
| [`PLAYWRIGHT-HANDOFF.md`](./PLAYWRIGHT-HANDOFF.md) | Admin oracle / release tags |
