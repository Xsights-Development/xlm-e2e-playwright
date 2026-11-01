import { test, expect } from '@playwright/test';
import {
  assertLocaleParity,
  assertSourceKeysInEn,
  listLocaleFiles,
} from '@/lib/i18n/assert-marked.js';
import { getDashboardLocalesDir } from '@/lib/i18n/locales.js';

/**
 * Static i18n checks (no browser). Runs before UI suite when project=i18n is serial across files
 * via Playwright project workers=1 — keep this file listed first alphabetically vs i18n.spec.ts
 * is not guaranteed; call order within a single worker is by file discovery.
 * Prefer running with --project=i18n so both files execute; UI suite stays in i18n.spec.ts.
 */
test.describe('i18n static', { tag: '@i18n' }, () => {
  test('TC01: locale JSON files share the same keys as en', () => {
    const dir = getDashboardLocalesDir();
    test.info().annotations.push({
      type: 'note',
      description: `DASHBOARD locales: ${dir}`,
    });
    const { locales, enKeys } = assertLocaleParity();
    expect(locales.length).toBeGreaterThan(1);
    expect(enKeys.length).toBeGreaterThan(0);
    expect(listLocaleFiles()).toEqual(locales);
  });

  test('TC02: source t()/i18nKey literals exist in en.json when dashboard src is present', () => {
    const { enKeys } = assertLocaleParity();
    assertSourceKeysInEn(enKeys);
  });
});
