# Cloudflare Worker (Slack → E2E trigger)

Scripts in this folder are **not part of the Playwright test suite**. They are deployed to Cloudflare Workers so Slack slash commands can trigger GitHub Actions for this repo.

They do **not** run locally with `npm test` / Playwright and do **not** affect project behavior.

## Files

| File | Role |
|------|------|
| `worker.origin.js` | Original Worker source — keep as backup / reference |
| `worker.js` | Latest Worker source — deploy this to Cloudflare |

## Purpose

- Receive Slack slash command webhooks
- Dispatch the `e2e-playwright.yml` workflow via GitHub API
- Serve a private HTML report from R2 at `GET /r/<token>/<runId>/<path>`

## Cloudflare Worker secrets / vars

| Name | Role |
|------|------|
| `GH_PAT` | GitHub token for `workflow_dispatch` |
| `HOOK_SECRET` | Auth for slash / curl trigger |
| `XLM_SLACK_NOTIFY` | Optional. `on` (default) or `off` — passed as workflow input `xlm_slack_notify` so result notifications can be disabled without removing `SLACK_WEBHOOK_URL` |
| `E2E_TARGET` | Optional. `dev` (default) or `staging` — passed as workflow input `target` |
| `REPORTS` | R2 bucket binding. Variable name must be `REPORTS`. Bucket: `xlm-e2e-reports` (private, no r2.dev public access). |
| `REPORT_TOKEN` | Secret. Random string (`openssl rand -hex 24`). Required on `GET /r/...`. A wrong or missing token returns 404. |

`GET /r/<token>/<runId>/<path>` reads object `runs/<runId>/<path>`. It does not use `HOOK_SECRET`. `POST /farm`, `/all`, and `/overview` are unchanged.

## R2 setup (dashboard)

Do this once on the Cloudflare account. The repo cannot create the bucket or the token.

1. **R2 → Create bucket** `xlm-e2e-reports`. Leave it private.
2. **Bucket → Settings → Object lifecycle rules.** Rule name `delete-reports-after-14-days`. Prefix `runs/`. Action: delete objects after 14 days. Leave the default multipart-abort rule enabled. Do not add an Infrequent Access transition.
3. **Workers → `xlm-e2e` → Settings → Bindings → R2 bucket.** Variable name `REPORTS`, bucket `xlm-e2e-reports`. Deploy so the binding is live.
4. Same worker → **Variables and Secrets.** Add secret `REPORT_TOKEN`.
5. **My Profile → API Tokens → Create Token → Custom token** named `xlm-e2e-r2-upload`.
   - Account → Workers R2 Storage → Edit
   - Account → Account Settings → Read
   - No Workers script permission
6. Copy **Account ID** from the R2 overview page.
7. GitHub repo → **Settings → Secrets and variables → Actions**:
   - Secret `CLOUDFLARE_API_TOKEN` — the API token
   - Secret `R2_REPORT_TOKEN` — the same string as Worker secret `REPORT_TOKEN`
   - Variable `CLOUDFLARE_ACCOUNT_ID` — Account ID
   - Variable `R2_BUCKET` — `xlm-e2e-reports`
   - Variable `R2_PUBLIC_BASE` — Worker origin, no trailing slash, e.g. `https://xlm-e2e.groove-app-tester.workers.dev`

There is no `wrangler.toml` in this repo. After `worker.js` changes, paste that file into the Cloudflare editor and deploy. Keep `worker.origin.js` unchanged unless you intentionally refresh the baseline backup.
