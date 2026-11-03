import fs from 'node:fs';
import path from 'node:path';

export type TargetName = 'dev' | 'staging';

export type Target = {
  appUrl: string;
  apiBaseUrl: string;
  cubeApiUrl: string;
  adminUrl: string;
  dashboardRef: string;
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
