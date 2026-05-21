/**
 * Load oracle spec JSON and read values from Admin API responses.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import type { OracleSpec } from './types.js';

const SPECS_DIR = join(process.cwd(), 'fixtures', 'oracles');

export function loadOracleSpec(id: string): OracleSpec {
  const path = join(SPECS_DIR, `${id}.json`);
  const raw = readFileSync(path, 'utf8');
  return JSON.parse(raw) as OracleSpec;
}

/** Replace `{farmId}`, `{managerId}`, etc. in oracle admin.path. */
export function resolveAdminPath(
  pathTemplate: string,
  params: Record<string, string | number>,
): string {
  return pathTemplate.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined || value === null || String(value).trim() === '') {
      throw new Error(`Oracle path param "{${key}}" is missing for path: ${pathTemplate}`);
    }
    return String(value);
  });
}

/** Dot-path into JSON (e.g. "data.items.0.name"). */
export function getValueByPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    if (part.match(/^\d+$/)) {
      const index = Number(part);
      current = Array.isArray(current) ? current[index] : undefined;
    } else {
      current = (current as Record<string, unknown>)[part];
    }
  }
  return current;
}
