import { test, expect } from '@/fixtures/auth.fixture.js';
import { LoginPage } from '@/pages/login.page.js';
import { FarmPage } from '@/pages/farm.page.js';
import { OverviewPage } from '@/pages/overview.page.js';
import { I18nPage } from '@/pages/i18n.page.js';
import { ROUTES } from '@/configs/routes.js';
import { loadLocaleFlat, t, toMomentLocale } from '@/lib/i18n/locales.js';
import moment from 'moment-timezone';
import '@/lib/i18n/moment-locales.js';

const THIS_WEEK_KEY = 'container.FarmViewPage.txtThisWeek';
const WEEK_KEY = 'container.FarmViewPage.txtWeek';

const testUser = process.env.APP_USER ?? 'user@example.com';
const testPass = process.env.APP_PASS ?? 'password123';
const testTenant =
  process.env.APP_TENANT_IDENTIFIER ?? process.env.APP_TENANT ?? '';
const testFarm = process.env.APP_FARM_IDENTIFIER ?? process.env.APP_FARM ?? '';
const testLocationType = process.env.APP_LOCATION_TYPE ?? undefined;
const testLocationIdentifier = process.env.APP_LOCATION_IDENTIFIER ?? undefined;

async function loginAgain(page: import('@playwright/test').Page): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.navigateToLoginPage();
  await loginPage.loginWithTenantAndFarm(testUser, testPass, testTenant, testFarm);
  await loginPage.waitForDashboardLoad();
}

function pickNonEnLocale(locales: string[]): string {
  const nonEn = locales.find((l) => l !== 'en');
  if (!nonEn) {
    throw new Error('No non-English locale in language menu');
  }
  return nonEn;
}

test.describe('i18n', { tag: '@i18n' }, () => {
  // One browser login for the whole suite (worker fixture). Serial order.
  // Logout TCs (TC06, TC09) run last so earlier cases stay on one session without re-auth.
  // Static checks live in i18n-static.spec.ts as TC01/TC02 and run first (alphabetical + workers:1).
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(120_000);

  test('TC03: switching language updates marked farm labels from locale JSON', async ({
    authenticatedDashboardSession,
  }) => {
    const farmPage = new FarmPage(authenticatedDashboardSession);
    const i18n = new I18nPage(authenticatedDashboardSession);

    await farmPage.verifyOnDashboard();
    await expect(i18n.languageSelector).toBeVisible();
    await expect(i18n.farmTagsTitle).toBeVisible();

    const locales = await i18n.listLocalesFromMenu();
    expect(locales.length).toBeGreaterThan(0);

    for (const locale of locales) {
      const loc = loadLocaleFlat(locale);
      await i18n.selectLanguage(locale);
      await i18n.assertAllMarkedI18n(loc, {
        minCount: 1,
        label: `farm dashboard locale=${locale}`,
      });
    }

    await i18n.selectLanguage('en');
  });

  test('TC04: reload keeps selected language', async ({
    authenticatedDashboardSession,
  }) => {
    const farmPage = new FarmPage(authenticatedDashboardSession);
    const i18n = new I18nPage(authenticatedDashboardSession);

    await farmPage.verifyOnDashboard();
    const locales = await i18n.listLocalesFromMenu();
    const locale = pickNonEnLocale(locales);
    const loc = loadLocaleFlat(locale);

    await i18n.selectLanguage(locale);
    await i18n.assertAllMarkedI18n(loc, { label: `before reload locale=${locale}` });

    await authenticatedDashboardSession.reload({ waitUntil: 'domcontentloaded' });
    await farmPage.verifyOnDashboard();
    await expect(i18n.languageSelectorValue).toHaveText(
      new RegExp(locale.replace(/-/g, '[-\\s]?'), 'i')
    );
    await i18n.assertAllMarkedI18n(loc, { label: `after reload locale=${locale}` });

    await i18n.selectLanguage('en');
  });

  test('TC05: side nav labels follow selected language', async ({
    authenticatedDashboardSession,
  }) => {
    const farmPage = new FarmPage(authenticatedDashboardSession);
    const i18n = new I18nPage(authenticatedDashboardSession);
    const overview = new OverviewPage(authenticatedDashboardSession);

    await farmPage.verifyOnDashboard();
    const locales = await i18n.listLocalesFromMenu();
    const locale = pickNonEnLocale(locales);
    const loc = loadLocaleFlat(locale);
    const en = loadLocaleFlat('en');

    await overview.selectLocationAndWaitForOverview(
      undefined,
      testLocationType,
      testLocationIdentifier
    );

    await i18n.selectLanguage(locale);
    await i18n.assertAllMarkedI18n(loc, {
      label: `room view nav locale=${locale}`,
    });

    await i18n.selectLanguage('en');
    await i18n.assertAllMarkedI18n(en, { label: 'room view nav locale=en' });

    await authenticatedDashboardSession.goto(ROUTES.dashboard);
    await farmPage.verifyOnDashboard();
  });

  test('TC07: overview page labels follow selected language', async ({
    authenticatedDashboardSession,
  }) => {
    const farmPage = new FarmPage(authenticatedDashboardSession);
    const i18n = new I18nPage(authenticatedDashboardSession);
    const overview = new OverviewPage(authenticatedDashboardSession);

    await farmPage.verifyOnDashboard();
    const locales = await i18n.listLocalesFromMenu();
    const locale = pickNonEnLocale(locales);
    const loc = loadLocaleFlat(locale);

    await i18n.selectLanguage(locale);
    await overview.selectLocationAndWaitForOverview(
      undefined,
      testLocationType,
      testLocationIdentifier
    );

    const roomTagsTitle = authenticatedDashboardSession.getByTestId('room-tags-title');
    await expect(roomTagsTitle).toBeVisible({ timeout: 20_000 });
    await i18n.assertAllMarkedI18n(loc, {
      label: `overview/room locale=${locale}`,
    });

    await authenticatedDashboardSession.goto(ROUTES.dashboard);
    await farmPage.verifyOnDashboard();
    await i18n.selectLanguage('en');
  });

  test('TC08: pagination total matches interpolated translation pattern', async ({
    authenticatedDashboardSession,
  }) => {
    const page = authenticatedDashboardSession;
    const farmPage = new FarmPage(page);
    const i18n = new I18nPage(page);
    const overview = new OverviewPage(page);

    await farmPage.verifyOnDashboard();
    const locales = await i18n.listLocalesFromMenu();
    const locale = pickNonEnLocale(locales);
    const loc = loadLocaleFlat(locale);

    await overview.selectLocationAndWaitForOverview(
      undefined,
      testLocationType,
      testLocationIdentifier
    );

    const animalNav = i18n.navItem('animalManagement');
    if (await animalNav.isVisible().catch(() => false)) {
      await animalNav.click();
    } else {
      await page.goto(ROUTES.animalManagement);
    }
    await page.waitForURL(new RegExp(ROUTES.animalManagement));

    const barnTitle = page.getByTestId('animal-mgt-barn-details-title');
    await expect(barnTitle).toBeVisible({ timeout: 30_000 });

    await i18n.selectLanguage(locale);

    const totalEl = i18n.paginationTotal;
    await expect(
      totalEl,
      'pagination-total should render even when count is 0'
    ).toBeVisible({ timeout: 30_000 });
    await totalEl.scrollIntoViewIfNeeded();

    await expect(totalEl).toHaveAttribute('data-i18n-key', /global\.txtTotal/);
    await i18n.assertAllMarkedI18n(loc, {
      label: `animal pagination locale=${locale}`,
    });

    await page.goto(ROUTES.dashboard);
    await i18n.selectLanguage('en');
  });

  test('TC10: switching language on animal page updates marked labels', async ({
    authenticatedDashboardSession,
  }) => {
    const farmPage = new FarmPage(authenticatedDashboardSession);
    const i18n = new I18nPage(authenticatedDashboardSession);
    const overview = new OverviewPage(authenticatedDashboardSession);

    await farmPage.verifyOnDashboard();
    await overview.selectLocationAndWaitForOverview(
      undefined,
      testLocationType,
      testLocationIdentifier
    );
    await authenticatedDashboardSession.goto(ROUTES.animalManagement);
    await authenticatedDashboardSession.waitForURL(new RegExp(ROUTES.animalManagement));

    const barnTitle = authenticatedDashboardSession.getByTestId(
      'animal-mgt-barn-details-title'
    );
    await expect(barnTitle).toBeVisible({ timeout: 20_000 });

    const locales = await i18n.listLocalesFromMenu();
    const locale = pickNonEnLocale(locales);
    const loc = loadLocaleFlat(locale);
    const en = loadLocaleFlat('en');

    await i18n.selectLanguage(locale);
    await i18n.assertAllMarkedI18n(loc, { label: `animal locale=${locale}` });

    await i18n.selectLanguage('en');
    await i18n.assertAllMarkedI18n(en, { label: 'animal locale=en' });

    await authenticatedDashboardSession.goto(ROUTES.dashboard);
  });

  test('TC11: chart week labels and weather weekdays follow locale', async ({
    authenticatedDashboardSession,
  }) => {
    const farmPage = new FarmPage(authenticatedDashboardSession);
    const i18n = new I18nPage(authenticatedDashboardSession);

    await farmPage.verifyOnDashboard();
    const locales = await i18n.listLocalesFromMenu();
    const locale = pickNonEnLocale(locales);
    const loc = loadLocaleFlat(locale);

    await i18n.selectLanguage(locale);
    await expect(i18n.farmTagsChart).toBeVisible({ timeout: 20_000 });

    const thisWeek = t(loc, THIS_WEEK_KEY);
    const weekWord = t(loc, WEEK_KEY);
    const xAxis = i18n.farmTagsChart.locator('.apexcharts-xaxis-label, .apexcharts-text');
    await expect
      .poll(async () => {
        const texts = await xAxis.allTextContents();
        const joined = texts.join(' ');
        return joined.includes(thisWeek) || joined.includes(weekWord);
      }, { timeout: 15_000 })
      .toBe(true);

    const weatherEmpty = await i18n.farmWeatherEmpty.isVisible().catch(() => false);
    if (weatherEmpty) {
      test.info().annotations.push({
        type: 'note',
        description: 'Weather has no data; skipped weekday assert',
      });
    } else if (await i18n.farmWeatherPanel.isVisible().catch(() => false)) {
      const momentLocale = toMomentLocale(locale);
      moment.locale(momentLocale);
      const expectedWeekdays = new Set(
        [0, 1, 2, 3, 4, 5, 6].map((d) => {
          const name = moment().day(d).format('dddd');
          return name.charAt(0).toUpperCase() + name.slice(1);
        })
      );
      const actual = await i18n.weatherWeekdays().allTextContents();
      expect(actual.length).toBeGreaterThan(0);
      for (const day of actual) {
        expect(
          expectedWeekdays.has(day.trim()),
          `weekday "${day}" not in moment locale ${momentLocale}`
        ).toBe(true);
      }
    }

    await i18n.selectLanguage('en');
  });

  test('TC12: second tab sees same language after reload', async ({
    authenticatedDashboardSession,
  }) => {
    const farmPage = new FarmPage(authenticatedDashboardSession);
    const i18n = new I18nPage(authenticatedDashboardSession);

    await farmPage.verifyOnDashboard();
    const locales = await i18n.listLocalesFromMenu();
    const locale = pickNonEnLocale(locales);
    const loc = loadLocaleFlat(locale);

    await i18n.selectLanguage(locale);
    await i18n.assertAllMarkedI18n(loc, { label: `tab A locale=${locale}` });

    const context = authenticatedDashboardSession.context();
    const page2 = await context.newPage();
    try {
      await page2.goto(ROUTES.dashboard, { waitUntil: 'domcontentloaded' });
      const i18n2 = new I18nPage(page2);
      const farm2 = new FarmPage(page2);
      await farm2.verifyOnDashboard();
      await expect(i18n2.languageSelectorValue).toHaveText(
        new RegExp(locale.replace(/-/g, '[-\\s]?'), 'i')
      );
      await i18n2.assertAllMarkedI18n(loc, { label: `tab B locale=${locale}` });
    } finally {
      await page2.close();
    }

    await i18n.selectLanguage('en');
  });

  test('TC13: UI does not show raw i18n keys', async ({
    authenticatedDashboardSession,
  }) => {
    const farmPage = new FarmPage(authenticatedDashboardSession);
    const i18n = new I18nPage(authenticatedDashboardSession);

    await farmPage.verifyOnDashboard();
    const locales = await i18n.listLocalesFromMenu();
    const locale = pickNonEnLocale(locales);
    await i18n.selectLanguage(locale);

    const bodyText = await authenticatedDashboardSession.locator('body').innerText();
    const rawKeyPattern = /\b(nav|container|global|validation)\.[A-Za-z0-9_.]+\b/;
    expect(bodyText, 'UI must not expose raw i18n key paths').not.toMatch(rawKeyPattern);

    await i18n.selectLanguage('en');
  });

  test('TC14: tags chart tooltip still shows week date range after language switch', async ({
    authenticatedDashboardSession,
  }) => {
    const farmPage = new FarmPage(authenticatedDashboardSession);
    const i18n = new I18nPage(authenticatedDashboardSession);

    await farmPage.verifyOnDashboard();
    const locales = await i18n.listLocalesFromMenu();
    const locale = pickNonEnLocale(locales);
    await i18n.selectLanguage(locale);

    const chart = i18n.farmTagsChart;
    await expect(chart).toBeVisible({ timeout: 20_000 });
    await chart.scrollIntoViewIfNeeded();

    const paths = chart.locator('.apexcharts-bar-series path');
    const pathCount = await paths.count();
    if (pathCount < 1) {
      test.skip(true, 'No apexcharts bar paths to hover');
    }

    await paths.nth(Math.min(3, pathCount - 1)).hover({ force: true });
    const tooltip = chart.locator('.apexcharts-tooltip').first();
    await expect(tooltip).toBeVisible({ timeout: 8_000 });
    const tipText = (await tooltip.innerText()).replace(/\s+/g, ' ');
    expect(tipText).toMatch(/\d{2}\/\d{2}\/\d{4}/);

    await i18n.selectLanguage('en');
  });

  test('TC06: sign-in screen follows persisted language after logout', async ({
    authenticatedDashboardSession: page,
  }) => {
    const farmPage = new FarmPage(page);
    const i18n = new I18nPage(page);

    await farmPage.verifyOnDashboard();
    const locales = await i18n.listLocalesFromMenu();
    const locale = pickNonEnLocale(locales);
    const loc = loadLocaleFlat(locale);

    await i18n.selectLanguage(locale);
    await i18n.signOut();

    const loginButton = page.getByTestId('login-button');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toHaveAttribute(
      'data-i18n-key',
      'container.PageSignIn.btnSignIn'
    );
    await i18n.assertAllMarkedI18n(loc, {
      minCount: 1,
      label: `sign-in locale=${locale}`,
    });

    const emailInput = page.getByTestId('email-input');
    await expect(emailInput).toHaveAttribute(
      'placeholder',
      t(loc, 'container.PageSignIn.labelEmail')
    );

    await loginAgain(page);
    await farmPage.verifyOnDashboard();
  });

  test('TC09: language persists after logout and login', async ({
    authenticatedDashboardSession: page,
  }) => {
    const farmPage = new FarmPage(page);
    const i18n = new I18nPage(page);

    await farmPage.verifyOnDashboard();
    const locales = await i18n.listLocalesFromMenu();
    const locale = pickNonEnLocale(locales);
    const loc = loadLocaleFlat(locale);

    await i18n.selectLanguage(locale);
    await i18n.assertAllMarkedI18n(loc, { label: `before logout locale=${locale}` });

    await i18n.signOut();
    await loginAgain(page);

    await farmPage.verifyOnDashboard();
    await expect(i18n.languageSelectorValue).toHaveText(
      new RegExp(locale.replace(/-/g, '[-\\s]?'), 'i')
    );
    await i18n.assertAllMarkedI18n(loc, { label: `after re-login locale=${locale}` });
  });
});
