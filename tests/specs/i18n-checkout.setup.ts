import { test as setup } from '@playwright/test';
import { ensureDashboardLocales } from '@/lib/i18n/dashboard-checkout.js';

setup.setTimeout(120_000);

setup('checkout dashboard locales', () => {
  ensureDashboardLocales();
});
