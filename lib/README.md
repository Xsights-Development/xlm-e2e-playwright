# lib — shared E2E libraries

| Path | Role |
|------|------|
| `api/` | REST clients — App (`app-api.client`), Cube (`cube-api.client`), Admin (`admin-api.client`, `admin-api.mock`) |
| `cube/dashboard/` | Farm dashboard Cube — `context`, `parsers`, `oracles` |
| `oracles/` | Admin oracle JSON loader + farm Admin paths (`loader.ts`, `admin-paths.ts`) |
| `ui/` | UI helpers (`chart-tooltip.ts`) |
| `helpers.ts` | Cross-cutting spec helpers |

## Configs

Env and query builders: `configs/app-api.ts`, `configs/cube-api.ts`, `configs/cube-queries.ts`, `configs/admin-api.ts`.

## Oracle JSON

`fixtures/oracles/` — see `fixtures/oracles/README.md`.

## Probes

`npm run probe -- <command>` — see `scripts/probe.ts`.
