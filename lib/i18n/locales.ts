import fs from 'node:fs';
import path from 'node:path';

/** Local sparse-checkout of xlm-dashboard (see lib/i18n/dashboard-checkout.ts). CI sets DASHBOARD_ROOT. */
export function getDashboardRoot(): string {
  return process.env.DASHBOARD_ROOT || path.resolve(process.cwd(), '.cache/xlm-dashboard');
}

/** Locale JSON directory: CI checkout or the local PAT sparse-checkout. */
export function getDashboardLocalesDir(): string {
  return path.join(getDashboardRoot(), 'src/locales/lang');
}

export function loadLocaleFlat(locale: string): Record<string, string> {
  const filePath = path.join(getDashboardLocalesDir(), `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Locale file not found: ${filePath}. Local i18n requires DASHBOARD_CHECKOUT_TOKEN to checkout Xsights-Development/xlm-dashboard.`
    );
  }
  return flatten(JSON.parse(fs.readFileSync(filePath, 'utf8')));
}

export function t(localeMap: Record<string, string>, key: string): string {
  const value = localeMap[key];
  if (value == null || value === '') {
    throw new Error(`Missing translation key: ${key}`);
  }
  return value;
}

/** Interpolate simple {{name}} placeholders (i18next-style). */
export function tInterp(
  localeMap: Record<string, string>,
  key: string,
  vars: Record<string, string | number>
): string {
  let text = t(localeMap, key);
  for (const [name, value] of Object.entries(vars)) {
    text = text.replace(new RegExp(`\\{\\{${name}\\}\\}`, 'g'), String(value));
  }
  return text;
}

/**
 * Map app locale (LanguageSelector value) to moment/dayjs package locale id.
 * Mirrors xahwm-dashboard LanguageSelector dateLibLocale.
 */
export function toMomentLocale(appLocale: string): string {
  const map: Record<string, string> = {
    'zh-CN': 'zh-cn',
    'de-CH': 'de-ch',
    'nl-BE': 'nl-be',
  };
  return map[appLocale] || appLocale;
}

function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v as Record<string, unknown>, key));
    } else {
      out[key] = String(v);
    }
  }
  return out;
}
