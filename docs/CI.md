# GitHub Actions — E2E (manual only)

Workflow: [`.github/workflows/e2e-playwright.yml`](../.github/workflows/e2e-playwright.yml)

- **Does not** run on push, pull request, or merge.
- Run from GitHub: **Actions** → **E2E Playwright** → **Run workflow**.

## 1. GitHub Actions config (variables + secrets)

**Settings** → **Secrets and variables** → **Actions**. Names must match exactly.

The workflow maps **`vars.*`** → URLs/identifiers and **`secrets.*`** → credentials (see `.github/workflows/e2e-playwright.yml`).

### Repository variables (required)

| Variable name | Same as local `.env` | Example / notes |
|---------------|----------------------|-----------------|
| `APP_URL` | `APP_URL` | `https://dev.xsightslm.com` — deployed dashboard |
| `APP_TENANT_IDENTIFIER` | `APP_TENANT_IDENTIFIER` | Tenant after login |
| `APP_FARM_IDENTIFIER` | `APP_FARM_IDENTIFIER` | Farm after login |
| `APP_LOCATION_TYPE` | `APP_LOCATION_TYPE` | Barn category (Overview tests) |
| `APP_LOCATION_IDENTIFIER` | `APP_LOCATION_IDENTIFIER` | Room id (Overview tests) |
| `API_BASE_URL` | `API_BASE_URL` | e.g. `https://api.dev.xiot.com.au/api/202312` |
| `CUBE_API_URL` | `CUBE_API_URL` | e.g. `https://cube.dev.xiot.com.au/cubejs-api/v1` |
| `ADMIN_URL` | `ADMIN_URL` | Admin API base (no trailing slash) |

### Repository variables (optional)

| Variable name | When needed |
|-------------|-------------|
| `APP_API_FARM_IDENTIFIER` | REST/Cube farm header when UI farm label ≠ API identifier |
| `APP_TIMEZONE` | Override tenant timezone for Cube |

### Repository secrets (required)

| Secret name | Same as local `.env` |
|-------------|----------------------|
| `APP_USER` | `APP_USER` |
| `APP_PASS` | `APP_PASS` |
| `ADMIN_USER` | `ADMIN_USER` |
| `ADMIN_PASS` | `ADMIN_PASS` |

### Repository secrets (optional — Slack report)

| Secret name | Purpose |
|-------------|---------|
| `SLACK_WEBHOOK_URL` | Incoming Webhook URL (`https://hooks.slack.com/services/...`) for channel `#e2e-xlm-reports`. Job posts pass/fail + link when set; skipped if empty. |

Copy values from your working local `.env` (same UAT/staging target). Do **not** commit webhook URLs to git.

If `APP_URL` is missing, the job fails early with a clear error (avoids `localhost:3000` on the runner).

## 2. Run workflow

1. Push `.github/workflows/e2e-playwright.yml` to the default branch (or the branch you select when running).
2. **Actions** → **E2E Playwright** → **Run workflow**.
3. Choose **branch**, **project** (`all` | `farm` | `overview`), optional **grep** (e.g. `@contract`).
4. Open the run → download **playwright-report-…** artifact if tests fail (HTML under `reports/html`).
5. If `SLACK_WEBHOOK_URL` is set, a summary is posted to the webhook channel after every run (success or failure). Logic lives in [`scripts/slack-e2e-notify.sh`](../scripts/slack-e2e-notify.sh).

**Slack message includes:** colored sidebar (green / red / amber / grey), pass-rate bar (`████░░`), test counts, duration from JUnit, project/grep, target `APP_URL`, branch, who triggered the run, link to the workflow run, and up to 15 failed test names when applicable.

### Test Slack webhook (one-off)

```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"XLM E2E webhook test"}' \
  'https://hooks.slack.com/services/YOUR/WEBHOOK/PATH'
```

## 3. Workflow inputs (not secrets)

| Input | Meaning |
|-------|---------|
| `project` | `all` = both projects; `farm` / `overview` = one spec file |
| `grep` | Passed to Playwright `--grep`; leave empty for full project |

Examples:

- Full farm: `project=farm`, `grep` empty  
- Contract only: `project=all`, `grep=@contract`  
- Health: `project=farm`, `grep=@health`

## 4. Local parity

Same variables as `.env.example`. CI sets `CI=true` automatically (retries, `forbidOnly` in `playwright.config.ts`).

```bash
cp .env.example .env
# fill values, then:
npm ci && npm run browsers && npm run test
```

## 5. Troubleshooting

| Issue | Check |
|-------|--------|
| `APP_URL is empty` | Add **variable** `APP_URL` (Variables tab, not Secrets) |
| Login / tenant failures | `vars` + `secrets` match UAT; app reachable from GitHub runners |
| Cube / contract failures | `API_BASE_URL`, `CUBE_API_URL`, optional `APP_API_FARM_IDENTIFIER` |
| Admin / business failures | `ADMIN_*` secrets; Admin API allows CI runner IPs if restricted |
| Empty report artifact | Job cancelled before tests finished; inspect job logs |
| No Slack message | Add secret `SLACK_WEBHOOK_URL`; check **Notify Slack** step log (curl errors) |

Do not commit `.env` — only store values in GitHub Actions secrets.

## 6. Old workflows still listed in Actions UI

If `main` only has `.github/workflows/e2e-playwright.yml` (no `admin-e2e-*.yml` / `app-e2e-*.yml`) but the Actions sidebar still shows four legacy workflow names, that is normal:

- GitHub keeps **historical workflow entries** and past runs after YAML files are removed.
- Those workflows **cannot start new runs** without a workflow file on the default branch.
- **All workflows** filter still shows old failed runs from earlier pushes.

To reduce clutter (optional):

1. Open each legacy workflow → **⋯** → delete old runs (or bulk-delete from the run list).
2. Hard-refresh the Actions page; the sidebar often drops entries once runs are cleared.
3. Confirm **Code** → branch `main` → `.github/workflows/` contains only `e2e-playwright.yml`.

No extra files need to be deleted in git if `main` already matches the above.
