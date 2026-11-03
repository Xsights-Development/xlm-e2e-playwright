import fs from 'node:fs';
import path from 'node:path';

export type TargetName = 'dev' | 'staging';

export type Target = {
  appUrl: string;
  apiBaseUrl: string;
  cubeApiUrl: string;
  adminUrl: string;
  dashboardRef: string;
  /** Tenant selected after login and sent as X-Tenant-Identifier. */
  tenantIdentifier: string;
  /** Farm option after login (data-farm-identifier or display name). */
  farmIdentifier: string;
  /** X-Farm-Identifier when farmIdentifier is a UI label. */
  apiFarmIdentifier: string;
  /** Barn category (data-location-type). */
  locationType: string;
  /** Room selected for Overview (data-location-identifier). */
  locationIdentifier: string;
  /** Cube timezone when the farm payload has none. */
  timezone: string;
};

const file = path.resolve(process.cwd(), 'configs/targets.json');
const all = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<TargetName, Target>;

export function targetName(): TargetName {
  const name = (process.env.E2E_TARGET || 'dev').trim().toLowerCase();
  if (name !== 'dev' && name !== 'staging') {
    throw new Error(`E2E_TARGET must be "dev" or "staging", got "${name}".`);
  }
  return name;
}

export function currentTarget(): Target {
  return all[targetName()];
}
