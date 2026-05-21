# Playwright E2E — Handoff (XLM Dashboard)

English reference for the **separate Playwright repository**.  
Copy this file together with the rest of `docs/e2e/` from the dashboard repo (`README.md`, `pages/farm-dashboard.md`, `pages/room-dashboard.md`).

**Updated:** 2026-05-21

---

## 1. System landscape

| Layer | Role |
|--------|------|
| **Web UI** (dashboard repo) | React SPA; uses **REST API** and **Cube** for analytics |
| **API** | FastAPI (Python); operational endpoints |
| **Cube** | Analytics aggregates (most farm dashboard charts) |
| **Admin** | FastAPI + **same database** as API; **QC business source of truth** |
| **Database** | Shared backing store |

Same database does **not** mean the same number on every surface. Charts often use **Cube**; some panels use the **dashboard REST API**. Admin exposes **its own HTTP APIs**.

**Detailed map (endpoints, mocks, component keys, E2E env):** [`api-and-cube.md`](./api-and-cube.md).  
**Playwright:** `appApi` / `cubeApi` fixtures — see `configs/app-api.ts`, `configs/cube-api.ts`, `configs/cube-queries.ts`.

---

## 2. Reading values from the Web UI

### Charts (weekly metrics with sr-only hooks)

- Read counts from **`data-testid`** on **sr-only** wrapper/spans documented in `pages/farm-dashboard.md` (and room doc when applicable).
- Do **not** parse **ApexCharts** SVG/DOM for numbers.

Example:

```js
const el = page
  .getByTestId('farm-tags-existing')
  .getByTestId('farm-tags-existing-this-week')
const actual = Number((await el.textContent() ?? '0').replace(/,/g, '')) || 0
```

### Everything else (panels, tables, details, statistics)

- Locate elements by documented **`data-testid`** (and documented `data-*` where listed).
- Use normal Playwright assertions on visible text or attributes unless the screen doc says otherwise.

### Hook catalogue

| Route | Prefix | Detail doc (dashboard repo) |
|-------|--------|-----------------------------|
| `/dashboard` | `farm-*` | `pages/farm-dashboard.md` |
| `/overview` | `room-*` | `pages/room-dashboard.md` |
| Both routes | `active-tags-xiot-g`, `active-tags-xiot-s` | Both page docs |

Do not use `farm-*` on `/overview` or `room-*` on `/dashboard`.

**Chart data shapes** (stacked vs grouped, week keys, `data[]` indexing) are documented in:

- `docs/e2e/README.md` (overview table)
- `pages/farm-dashboard.md` (per-chart sections)

Use those docs when implementing oracles; this handoff does not repeat them.

---

## 3. Data consistency strategy (QC-aligned)

### QC concern

If tests only compare the Web UI to the **same Cube or dashboard API** the UI already called, a wrong backend can still pass: UI and backend would show the same incorrect value. That only proves **rendering/mapping**, not **business correctness**.

### Agreed approach

| Goal | What to compare | When |
|------|-----------------|------|
| **UAT / business gate** | Web UI **`actual`** vs **Admin API `expected`** | Manual CI trigger before prod; regression by release tag |
| **Optional engineering check** | Web UI vs **Cube or dashboard API** (same query the UI uses) | Optional; see below |

**Source of truth for business acceptance:** **Admin** (when Admin and Cube/UI disagree, treat Admin as correct until BA says otherwise).

**Automation:** Call the **Admin HTTP API** QC uses (capture from browser Network tab). Do not rely on scraping the Admin HTML UI.

### Optional `@contract` tests (engineering only)

These are **extra** tests, **not** the QC UAT gate.

- **What they check:** The number on the UI hook equals what you get if you run the **same Cube query or dashboard API call** the frontend uses (same measures, filters, timezone).
- **What they catch:** Frontend bugs — wrong week index, wrong series name, hook out of sync with chart logic, formatting errors.
- **What they do not catch:** Backend/Cube returning the wrong business value while UI and Cube still match.
- **How to run:** Tag them `@contract` in Playwright. Pipelines focused on QC regression (`@business`) can **skip** `@contract` so release gates only enforce **UI vs Admin**.

### Dynamic data

- Weekly and inventory metrics **change over time** (week rollover, live UAT data).
- **Do not hardcode** expected counts in tests.
- Each run: `actual` = read from UI hooks; `expected` = fetch from **Admin API** at run time with the same tenant, farm, and filters QC defines.

### Alignment (required for every business test)

| Parameter | Web UI | Admin oracle |
|-----------|--------|----------------|
| Tenant | Login / tenant context | Same tenant id |
| Farm | Selected farm on dashboard | Same farm id from Admin Farm table |
| Timezone | Tenant setting (Cube / app) | Same tenant timezone in Admin |
| Week / date filters | Semantic week keys in hooks (`this-week`, …) | Same boundaries QC applies in Admin |

---

## 4. Per-metric oracle spec (QC input)

Before automating a metric, QC documents how they obtain the number in Admin. Engineering captures the HTTP call and stores a **machine-readable spec** in the Playwright repo.

### Checklist (QC + dev)

1. QC: Admin screen + filter steps that produce the expected number.  
2. Dev: Network capture — method, URL, query/body, response JSON path.  
3. Map Admin result to the Web UI `data-testid` (and `weekKey` if applicable).  
4. BA/QC confirm Admin and UI measure the **same business definition**.

### Where to store specs (Playwright repo)

Suggested path:

```text
fixtures/oracles/<metric-id>.json
```

One file per metric (or per small group sharing one Admin endpoint).

### Format (example)

```json
{
  "id": "farm-tags-existing",
  "description": "Tags deployed — Existing active tags per ISO week",
  "businessSourceOfTruth": "admin",
  "ui": {
    "route": "/dashboard",
    "wrapperTestId": "farm-tags-existing",
    "childTestIdPattern": "farm-tags-existing-{weekKey}",
    "weekKeys": ["this-week", "prev-1", "prev-2", "prev-3"]
  },
  "admin": {
    "method": "GET",
    "path": "/api/v1/REPLACE_WITH_QC_ENDPOINT",
    "query": {
      "farm_id": "{farmId}",
      "tenant_id": "{tenantId}",
      "week": "{weekKey}"
    },
    "headers": {
      "Authorization": "Bearer {token}",
      "X-Tenant-Identifier": "{tenantIdentifier}"
    },
    "response": {
      "type": "json",
      "valuePath": "data.count",
      "notes": "Path confirmed from Network tab; adjust after QC capture"
    }
  },
  "alignment": {
    "timezoneFrom": "tenant",
    "farmIdFrom": "admin-farm-table",
    "qcReference": "link or ticket to QC steps"
  },
  "dashboardDataPath": {
    "notes": "UI chart uses Cube — not used as UAT expected; documented for @contract tests only",
    "cubeMeasures": ["snowflake_inventory_tracking.sum_existing_active_tags"]
  }
}
```

**Fields:**

| Field | Purpose |
|-------|---------|
| `id` | Stable key for helpers and test names |
| `ui.*` | How to read `actual` from hooks |
| `admin.*` | How to fetch `expected`; replace placeholders with env/fixture values at runtime |
| `response.valuePath` | Dot path into JSON (or document pagination/total field if QC uses `total`) |
| `alignment` | Tenant, farm, timezone rules |
| `dashboardDataPath` | Optional; only for `@contract` tests |

Implement `getAdminExpectedCount(spec, context)` in the Playwright repo that loads this file and performs the request.

---

## 5. Release / UAT workflow

| Phase | Action |
|--------|--------|
| **R1 on UAT** | QC manual test for R1 features |
| **R2 on UAT** | Manually trigger CI: Playwright **`@release-1`** on current UAT build + QC manual test for R2 |
| **R3 on UAT** | E2E `@release-1` + `@release-2` + manual R3 |
| Later releases | Same pattern: auto regression for prior release tags, manual for the new release |

- E2E always targets the **current UAT deployment** (e.g. R2 code) while running **older release tags** for regression.
- Tag tests: `@release-1`, `@release-2`, …, plus `@smoke`, `@business`, optional `@contract`.

---

## 6. Test pyramid (avoid overload)

| Layer | Purpose |
|-------|---------|
| **Unit** (dashboard repo) | `utils/chart.js` week indexing |
| **Smoke `@smoke`** | Login, main routes, hooks present, numeric smoke — short, every deploy |
| **Business `@business`** | UI vs Admin API — QC gate |
| **Regression `@release-N`** | Prior release scope on new UAT build |
| **Contract `@contract`** (optional) | UI vs Cube/dashboard API — not QC gate |

---

## 7. Suggested Playwright repo layout

```text
tests/
  smoke/
  regression/
    release-1/
    release-2/
helpers/
  auth.ts
  ui-counts.ts          # read data-testid hooks
  (use lib/oracles/loader.ts + admin-api.client.ts)
fixtures/
  oracles/              # one JSON per metric (format above); examples/ for templates
config/
  env.uat.ts            # WEB_BASE_URL, ADMIN_BASE_URL, credentials, tenant/farm ids
```

**Example business test:**

```js
test('@business @release-1 existing tags this week matches Admin', async ({ page, request }) => {
  await loginAndOpenFarmDashboard(page, { tenantId, farmId })
  await expect(page.getByTestId('farm-tags-chart')).toBeVisible()

  const actual = await getUiCount(page, 'farm-tags-existing', 'this-week')
  const expected = await getAdminExpectedCount(request, 'farm-tags-existing', {
    tenantId,
    farmId,
    weekKey: 'this-week',
  })
  expect(actual).toBe(expected)
})
```

---

## 8. Environment / CI notes

- UAT: manual `workflow_dispatch` for regression suites before production.
- Secrets: test user, tenant, farm identifiers, Admin + Web base URLs.
- Reports: record **release version** and **UAT build identifier**.
- Wait for chart load before reading hooks (e.g. `farm-tags-chart` visible, child hook attached).

---

## 9. Documentation index (this Playwright repo)

| Item | Path |
|------|------|
| E2E index & chart shape summary | `docs/e2e/README.md` |
| **REST + Cube call patterns, route → data source** | `docs/e2e/api-and-cube.md` |
| Farm hooks | `docs/e2e/pages/farm-dashboard.md` |
| Farm tags deployed — Cube API | `docs/e2e/farm-tags-deployed-cube.md` |
| Room hooks | `docs/e2e/pages/room-dashboard.md` |
| Webapp mirror (do not edit here) | `docs/webapp/` |
| Chart utilities (webapp source) | `src/utils/chart.js`, `src/constants/chart.constant.js` |
| This handoff | `docs/e2e/PLAYWRIGHT-HANDOFF.md` |

---

## 10. Principles (short)

1. **Charts:** sr-only `data-testid` only — not Apex DOM.  
2. **Other UI:** documented `data-testid`.  
3. **UAT expected:** Admin API (QC-defined), not Cube replay.  
4. **Same tenant, farm, timezone** on both sides.  
5. **No hardcoded** expected counts.  
6. **Tag by release**; keep smoke small.  
7. **Oracle specs** in JSON under `fixtures/oracles/` (see `fixtures/oracles/README.md`).  
8. **`@contract`** = optional UI-vs-pipeline check; **`@business`** = UI vs Admin gate.
