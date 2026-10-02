import fs from 'node:fs';
import path from 'node:path';
import { expect, type Page } from '@playwright/test';
import { getDashboardLocalesDir, loadLocaleFlat, t } from '@/lib/i18n/locales.js';

const NUMERIC_PLACEHOLDERS = new Set(['total', 'count', 'number']);

/** Escape a string for use inside a RegExp. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Turn an i18next template into a regex that ignores placeholder values.
 * `{{total}}` / `{{count}}` / `{{number}}` → \\d+; other placeholders → .+
 */
export function templateToPattern(template: string): RegExp {
  const parts = template.split(/(\{\{\w+\}\})/g);
  let source = '^';
  for (const part of parts) {
    const m = part.match(/^\{\{(\w+)\}\}$/);
    if (m) {
      source += NUMERIC_PLACEHOLDERS.has(m[1]) ? '\\d+' : '.+';
    } else {
      source += escapeRegExp(part);
    }
  }
  source += '$';
  return new RegExp(source);
}

export function normalizeUiText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export type MarkedI18nHit = {
  key: string;
  text: string;
};

/** Collect visible `[data-i18n-key]` nodes on the page. */
export async function collectMarkedI18n(page: Page): Promise<MarkedI18nHit[]> {
  return page.locator('[data-i18n-key]:visible').evaluateAll((nodes) =>
    nodes
      .map((el) => {
        const key = el.getAttribute('data-i18n-key')?.trim() ?? '';
        const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
        return { key, text };
      })
      .filter((row) => row.key.length > 0 && row.text.length > 0)
  );
}

/**
 * Assert every visible marked node matches the locale map (exact or placeholder pattern).
 */
export async function assertAllMarkedI18n(
  page: Page,
  localeMap: Record<string, string>,
  options?: { minCount?: number; label?: string }
): Promise<number> {
  const label = options?.label ?? 'marked i18n';
  const minCount = options?.minCount ?? 1;
  const hits = await collectMarkedI18n(page);
  expect(
    hits.length,
    `${label}: expected at least ${minCount} [data-i18n-key] node(s), got ${hits.length}`
  ).toBeGreaterThanOrEqual(minCount);

  for (const { key, text } of hits) {
    const expected = t(localeMap, key);
    const actual = normalizeUiText(text);
    if (/\{\{\w+\}\}/.test(expected)) {
      expect(
        actual,
        `${label}: key=${key} pattern from "${expected}"`
      ).toMatch(templateToPattern(expected));
    } else {
      expect(actual, `${label}: key=${key}`).toBe(normalizeUiText(expected));
    }
  }
  return hits.length;
}

export function listLocaleFiles(): string[] {
  const dir = getDashboardLocalesDir();
  if (!fs.existsSync(dir)) {
    throw new Error(`Locale dir not found: ${dir}`);
  }
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.replace(/\.json$/, ''))
    .sort();
}

export function getDashboardSrcDir(): string {
  const dashboardRoot =
    process.env.DASHBOARD_ROOT ||
    path.resolve(process.cwd(), '../xahwm-dashboard');
  return path.join(dashboardRoot, 'src');
}

/** Literal keys from t("…") / t('…') / i18nKey="…" / i18nKey={'…'} in dashboard src. */
export function scanSourceI18nKeys(srcRoot: string): string[] {
  if (!fs.existsSync(srcRoot)) {
    throw new Error(`Dashboard src not found: ${srcRoot}`);
  }
  const keys = new Set<string>();
  const patterns = [
    /\bt\(\s*['"]([^'"]+)['"]/g,
    /\bi18nKey\s*=\s*\{?\s*['"]([^'"]+)['"]/g,
  ];

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === 'locales') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(js|jsx|ts|tsx)$/.test(entry.name)) continue;
      const text = fs.readFileSync(full, 'utf8');
      for (const re of patterns) {
        re.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(text))) {
          const key = m[1];
          if (key.includes('.') && !key.includes('${')) {
            keys.add(key);
          }
        }
      }
    }
  };
  walk(srcRoot);
  return [...keys].sort();
}

export function assertLocaleParity(): {
  locales: string[];
  enKeys: string[];
} {
  const locales = listLocaleFiles();
  expect(locales.includes('en'), 'en.json must exist').toBe(true);
  const en = loadLocaleFlat('en');
  const enKeys = Object.keys(en).sort();
  expect(enKeys.length, 'en.json must have keys').toBeGreaterThan(0);

  for (const locale of locales) {
    if (locale === 'en') continue;
    const map = loadLocaleFlat(locale);
    const missing: string[] = [];
    const empty: string[] = [];
    for (const key of enKeys) {
      if (!(key in map)) {
        missing.push(key);
      } else if (String(map[key]).trim() === '') {
        empty.push(key);
      }
    }
    expect(
      missing,
      `${locale}.json missing ${missing.length} key(s) vs en (sample: ${missing.slice(0, 5).join(', ')})`
    ).toEqual([]);
    expect(
      empty,
      `${locale}.json has empty value for ${empty.length} key(s) (sample: ${empty.slice(0, 5).join(', ')})`
    ).toEqual([]);
  }
  return { locales, enKeys };
}

export function assertSourceKeysInEn(enKeys: Set<string> | string[]): void {
  const enSet = enKeys instanceof Set ? enKeys : new Set(enKeys);
  const srcRoot = getDashboardSrcDir();
  // Sparse CI checkout may only have locales/ — skip scan when src is incomplete.
  const hasViews = fs.existsSync(path.join(srcRoot, 'views'));
  if (!hasViews) {
    return;
  }
  const used = scanSourceI18nKeys(srcRoot);
  const missing = used.filter((k) => !enSet.has(k));
  expect(
    missing,
    `Source t()/i18nKey literals missing from en.json (${missing.length}): ${missing.slice(0, 10).join(', ')}`
  ).toEqual([]);
}
