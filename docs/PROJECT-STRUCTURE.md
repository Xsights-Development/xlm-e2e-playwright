# Project structure & what to keep

## Keep (source of truth)

| Path | Role |
|------|------|
| `tests/specs/*.spec.ts` | E2E tests |
| `pages/`, `fixtures/` | Page objects, auth, oracle JSON (`fixtures/oracles/`) |
| `lib/api/`, `lib/cube/dashboard/`, `lib/oracles/`, `lib/ui/` | Clients, parsers, oracles |
| `configs/` | Env-aligned API paths, Cube queries, tags |
| `scripts/probe.ts` | Single debug CLI |
| `docs/e2e/` | Working E2E docs (hooks, Cube guides) |
| `docs/TESTING.md` | How to run tests without script sprawl |

## Generated / local (gitignored)

`node_modules/`, `.env`, `results/`, `reports/`, `test-results/`, `example/` (optional Cube captures)

## Avoid adding

- One `package.json` script per panel or release → use `--project` + `--grep` + tags
- Duplicate doc trees (`docs/e2e/e2e/`, copied `docs/webapp/` under e2e) — sync one `docs/e2e/` only
- Extra probe scripts — extend `scripts/probe.ts` commands
- Flat `lib/cube-farm-*.ts` files — use `lib/cube/dashboard/` module

## Extending

1. New farm panel → `farm.spec.ts` + describe tag + optional `lib/cube/dashboard/` parser/oracle
2. New page → `tests/specs/<area>.spec.ts` + `playwright.config.ts` project if it needs `workers: 1`
3. New Admin oracle → `fixtures/oracles/<id>.json` + helper on `admin-api.client.ts`
4. New probe → `scripts/lib/probe-runners.ts` + register in `scripts/probe.ts`
