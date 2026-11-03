import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { currentTarget } from '@/configs/targets.js';
import { getDashboardLocalesDir, getDashboardRoot } from '@/lib/i18n/locales.js';

const REPO = 'Xsights-Development/xlm-dashboard';
const ORIGIN = `https://github.com/${REPO}.git`;

/** Locale branch for the active E2E_TARGET. Not read from the environment. */
export function resolveDashboardRef(): string {
  return currentTarget().dashboardRef;
}

/**
 * Local i18n: sparse-checkout src/locales/lang with DASHBOARD_CHECKOUT_TOKEN.
 * Missing token throws — do not fall back to a sibling working copy.
 * CI already checks the repo out and sets DASHBOARD_ROOT; this is a no-op there.
 */
export function ensureDashboardLocales(): void {
  if (process.env.CI === 'true') {
    const enJson = path.join(getDashboardLocalesDir(), 'en.json');
    if (!fs.existsSync(enJson)) {
      throw new Error(
        `CI dashboard locales missing at ${enJson}. The workflow must checkout ${REPO} and set DASHBOARD_ROOT.`,
      );
    }
    return;
  }

  const token = process.env.DASHBOARD_CHECKOUT_TOKEN?.trim() ?? '';
  if (!token) {
    throw new Error(
      `DASHBOARD_CHECKOUT_TOKEN is required to run i18n locally. ` +
        `Set a GitHub PAT with Contents: Read on ${REPO} in .env. ` +
        `Locale JSON is not read from a sibling checkout.`,
    );
  }

  const ref = resolveDashboardRef();
  const dest = getDashboardRoot();
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });

  git(['init', '-b', 'main'], dest, token);
  git(['remote', 'add', 'origin', ORIGIN], dest, token);
  git(['sparse-checkout', 'init', '--cone'], dest, token);
  git(['sparse-checkout', 'set', 'src/locales/lang'], dest, token);
  git(['fetch', '--depth', '1', '--filter=blob:none', 'origin', ref], dest, token);
  git(['checkout', '--detach', 'FETCH_HEAD'], dest, token);

  const enJson = path.join(dest, 'src/locales/lang/en.json');
  if (!fs.existsSync(enJson)) {
    throw new Error(
      `Checkout of ${REPO}@${ref} did not include ${enJson}. Check E2E_TARGET.`,
    );
  }
  console.log(`Dashboard locales: ${REPO}@${ref} → ${dest}`);
}

function git(args: string[], cwd: string, token: string): void {
  const basic = Buffer.from(`x-access-token:${token}`).toString('base64');
  const result = spawnSync(
    'git',
    ['-c', `http.extraheader=AUTHORIZATION: basic ${basic}`, ...args],
    {
      cwd,
      encoding: 'utf8',
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    },
  );
  if (result.error) {
    throw new Error(`git ${args[0]} failed to start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const detail = `${result.stderr || ''}\n${result.stdout || ''}`
      .replaceAll(basic, '***')
      .replaceAll(token, '***')
      .trim();
    throw new Error(`git ${args.join(' ')} failed (ref checkout of ${REPO}):\n${detail}`);
  }
}
