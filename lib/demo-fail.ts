import { expect } from '@playwright/test';

/**
 * When E2E_DEMO_FAIL=1, fails the current test if its id is listed in E2E_DEMO_FAIL_TESTS
 * (comma-separated), or if E2E_DEMO_FAIL_TESTS is empty (fail all tagged callers).
 * Use only for demos / recordings to show failures in HTML report — not for CI.
 */
export function failDemoIfEnabled(testId: string): void {
  if (process.env.E2E_DEMO_FAIL !== '1') return;

  const raw = process.env.E2E_DEMO_FAIL_TESTS ?? '';
  const allow = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (allow.length > 0 && !allow.includes(testId)) return;

  expect(
    1,
    `Demo-only intentional failure (set E2E_DEMO_FAIL=0 for real runs): ${testId}`,
  ).toBe(2);
}
