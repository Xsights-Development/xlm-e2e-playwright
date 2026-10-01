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

Update Cloudflare with `worker.js` when the trigger logic changes. Keep `worker.origin.js` unchanged unless you intentionally refresh the baseline backup.
