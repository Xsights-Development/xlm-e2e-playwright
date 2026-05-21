# Oracle specs (Admin expected values)

One JSON file per metric under this directory. Files in `examples/` are templates only — not loaded by tests.

## Adding a metric

1. Copy an example from `examples/` to `fixtures/oracles/<metric-id>.json` (filename must match `id`).
2. Set `admin.method`, `admin.path` (use `{farmId}`, `{managerId}`, etc.), and `admin.response.valuePath` from QC / Network tab.
3. Call via `AdminApiClient.fetchOracleValue` (private) or add a typed helper on `lib/api/admin-api.client.ts`.
4. Assert UI `data-testid` values in specs (`@business` = Admin oracle; `@contract` = Cube in `lib/cube/dashboard/`).

## Loader

- `lib/oracles/loader.ts` — `loadOracleSpec(id)`, `resolveAdminPath`, `getValueByPath`
- Constants: `lib/oracles/admin-paths.ts` — `ORACLE_SPEC_IDS`, `ADMIN_FARM_PATHS`

See `docs/e2e/PLAYWRIGHT-HANDOFF.md` for the full field glossary and UAT workflow.
