# GitHub Actions — E2E (manual only)

Workflow: [`.github/workflows/e2e-playwright.yml`](../.github/workflows/e2e-playwright.yml)

- **Does not** run on push, pull request, or merge.
- Run from GitHub: **Actions** → **E2E Playwright** → **Run workflow**.

## 1. GitHub Actions config (variables + secrets)

**Settings** → **Secrets and variables** → **Actions**. Names must match exactly.

The workflow maps **`secrets.*`** → credentials. App URL, API hosts, tenant, farm, location, and timezone come from workflow input **target** via `configs/targets.json` (`tenantIdentifier`, `farmIdentifier`, `apiFarmIdentifier`, `locationType`, `locationIdentifier`, `timezone`).

### Repository variables (required)

| Variable name | Same as local `.env` | Example / notes |
|---------------|----------------------|-----------------|
| `APP_USER` | `APP_USER` | Login email |
| `ADMIN_USER` | `ADMIN_USER` | Admin API username |

### Repository secrets (required)

| Secret name | Same as local `.env` |
|-------------|----------------------|
| `APP_PASS` | `APP_PASS` |
| `ADMIN_PASS` | `ADMIN_PASS` |

### Repository secrets (optional — Slack report)

| Secret name | Purpose |
|-------------|---------|
| `SLACK_WEBHOOK_URL` | Incoming Webhook URL (`https://hooks.slack.com/services/...`) for channel `#e2e-xlm-reports`. Job posts pass/fail + link when set; skipped if empty. |

### Repository secrets (optional — HTML report on R2)

| Secret name | Purpose |
|-------------|---------|
| `CLOUDFLARE_API_TOKEN` | API token `xlm-e2e-r2-upload` (R2 Edit + Account Settings Read). Used by `wrangler r2 object put`. |
| `R2_REPORT_TOKEN` | Same string as Worker secret `REPORT_TOKEN`. This is the unguessable part of the report URL. |

### Repository variables (optional — HTML report on R2)

These are names and a public URL, not credentials. **Settings → Secrets and variables → Actions → Variables.**

| Variable name | Value |
|---------------|--------|
| `CLOUDFLARE_ACCOUNT_ID` | Account ID from the R2 overview page. |
| `R2_BUCKET` | `xlm-e2e-reports` |
| `R2_PUBLIC_BASE` | Worker origin, no trailing slash. Example: `https://xlm-e2e.groove-app-tester.workers.dev` |

Dashboard steps (bucket, lifecycle, binding `REPORTS`) are in [`clouflare/README.md`](../clouflare/README.md). Objects live at `runs/<run id>/...` and the bucket lifecycle deletes that prefix after 14 days. The GitHub artifact upload stays as a 14-day backup. Slack does not link to that artifact.

Toggle (does not remove the secret): set workflow input **xlm_slack_notify** to `off`, or env `XLM_SLACK_NOTIFY=off` in the notify script. Default is `on`.

### Repository secrets (optional — i18n / dashboard locales)

| Secret name | Purpose |
|-------------|---------|
| `DASHBOARD_CHECKOUT_TOKEN` | PAT (or fine-grained token) with **Contents: Read** on `Xsights-Development/xlm-dashboard`. Required when that repo is private — default `GITHUB_TOKEN` cannot clone sibling private repos. |

Copy values from your working local `.env` (same UAT/staging target). Do **not** commit webhook URLs to git.

If `APP_URL` is missing, the job fails early with a clear error (avoids `localhost:3000` on the runner).

## 2. Run workflow

1. Push `.github/workflows/e2e-playwright.yml` to the default branch (or the branch you select when running).
2. **Actions** → **E2E Playwright** → **Run workflow**.
3. Choose **branch**, **project** (`all` | `farm` | `overview` | `i18n`), optional **grep**, **languages** `on`/`off`, and **xlm_slack_notify** `on`/`off`.
   - Slack (URLs cố định, không sửa được App):
     | Slash | Worker path | Chạy |
     |-------|-------------|------|
     | `/xlm-test` | `/all` | farm + overview panels |
     | `/xlm-test-farm` | `/farm` | farm |
     | `/xlm-test-overview` | `/overview` | **shared** — languages (`project=i18n`) |
   - Path `/overview` **không** còn map sang Playwright `overview`; suite overview panel vẫn nằm trong `/all`.
   - `dashboard_ref=auto` maps from `APP_URL` when languages run.
4. Open the run → download **playwright-report-…** only if the Slack **Reports** link is missing (HTML under `reports/html`). When upload succeeds, open **Open report** in Slack instead.
5. If `SLACK_WEBHOOK_URL` is set **and** `xlm_slack_notify`/`XLM_SLACK_NOTIFY` is not `off`, a summary is posted after every run. Logic: [`scripts/slack-e2e-notify.sh`](../scripts/slack-e2e-notify.sh).

**Slack message includes:** colored sidebar (green / red / amber / grey), pass-rate bar (`████░░`), test counts, duration from JUnit, **per-case pass/fail list** (failed cases are marked in that list), target host, project, branch, and who triggered the run. The **Reports** field is added only after `reports/html/index.html` is uploaded to R2. The result color follows the test step, so a missing report does not by itself turn a green run red in Slack.

### Test Slack webhook (one-off)

```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"XLM E2E webhook test"}' \
  'https://hooks.slack.com/services/YOUR/WEBHOOK/PATH'
```

## 3. Workflow inputs (not secrets)

| Input | Meaning |
|-------|---------|
| `project` | `farm` / `overview` / `all` (farm+overview panels); `i18n` = languages only |
| `languages` | `on` / `off` — also add i18n when running farm/overview/all. Slack `/xlm-test-overview` uses `project=i18n` directly. |
| `grep` | Passed to Playwright `--grep`; leave empty for full project |
| `target` | `dev` (default) or `staging`. Sets app URL, APIs, locale branch, tenant, farm, location, and timezone from `configs/targets.json` |
| `xlm_slack_notify` | `on` (default) / `off` — maps to `XLM_SLACK_NOTIFY`; skip result webhook when `off` |

Examples:

- Full farm: `project=farm`, `languages=off`  
- All core (farm + overview panels): `project=all`, `languages=off`  
- Languages only: `project=i18n` (Actions) or Slack `/xlm-test-overview`
- Silent run (no Slack summary): `xlm_slack_notify=off`

```bash
gh workflow run e2e-playwright.yml --ref <e2e-branch> \
  -f project=i18n -f languages=on -f target=dev -f xlm_slack_notify=off
```

Worker (fixed URLs):

```bash
curl -u 'HOOK_SECRET:' -X POST 'https://xlm-e2e.groove-app-tester.workers.dev/all'       # farm + overview
curl -u 'HOOK_SECRET:' -X POST 'https://xlm-e2e.groove-app-tester.workers.dev/farm'      # farm
curl -u 'HOOK_SECRET:' -X POST 'https://xlm-e2e.groove-app-tester.workers.dev/overview'  # languages (shared)
```

## 4. Local parity

Same variables as `.env.example`. CI sets `CI=true` automatically (retries, `forbidOnly` in `playwright.config.ts`).

```bash
cp .env.example .env
# fill values, then:
npm ci && npm run browsers && npm run test
```

For i18n locally, set `DASHBOARD_CHECKOUT_TOKEN` in `.env`. The suite sparse-checks out `xlm-dashboard` locales and stops if the token is missing. CI still checkouts in the workflow (`DASHBOARD_ROOT`); the secret is optional there when `github.token` can read the repo.

## 5. Troubleshooting

| Issue | Check |
|-------|--------|
| `APP_URL is empty` | Workflow input **target** must be `dev` or `staging` so `configs/targets.json` can fill the URL |
| Login / tenant failures | `E2E_TARGET` row in `configs/targets.json` plus `APP_USER` / `APP_PASS`; app reachable from GitHub runners |
| Cube / contract failures | Target `apiBaseUrl`, `cubeApiUrl`, and `apiFarmIdentifier` |
| Admin / business failures | `ADMIN_*` secrets; Admin API allows CI runner IPs if restricted |
| Missing `en.json` / locale checkout | `dashboard_ref` exists; add `DASHBOARD_CHECKOUT_TOKEN` if dashboard is private |
| i18n text mismatches | `dashboard_ref` must match the dashboard build deployed at `APP_URL` |
| Empty report artifact | Job cancelled before tests finished; inspect job logs |
| Slack has no Reports link | `reports/html/index.html` was missing, or an R2 secret/variable above is empty. Check **Upload HTML report to R2**. The Worker must be redeployed from `clouflare/worker.js` with binding `REPORTS` and secret `REPORT_TOKEN`. |
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
