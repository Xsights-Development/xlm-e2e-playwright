import { test, expect } from '@/fixtures/auth.fixture.js';
import { LoginPage } from '@/pages/login.page.js';
import { FarmPage } from '@/pages/farm.page.js';
import { OverviewPage } from '@/pages/overview.page.js';
import { I18nPage } from '@/pages/i18n.page.js';
import { ROUTES } from '@/configs/routes.js';
import {
  loadLocaleFlat,
  t,
  tInterp,
  toMomentLocale,
} from '@/lib/i18n/locales.js';
import moment from 'moment-timezone';
import '@/lib/i18n/moment-locales.js';

const TAGS_TITLE_KEY = 'container.FarmViewPage.titleTagsDeployed';
const TAGS_INVENTORY_KEY = 'container.FarmViewPage.subTitleInventory';
const THIS_WEEK_KEY = 'container.FarmViewPage.txtThisWeek';
const WEEK_KEY = 'container.FarmViewPage.txtWeek';
const NAV_OVERVIEW_KEY = 'nav.overview';
const NAV_ANIMAL_KEY = 'nav.animalManagement';
const SIGN_IN_KEY = 'container.PageSignIn.btnSignIn';
const ROOM_TAGS_TITLE_KEY = 'container.RoomViewPage.titleTagsDeployed';
const BARN_DETAILS_KEY = 'container.RoomViewPage.titlBarnDetails';
const TOTAL_MULTI_KEY = 'global.txtTotalMultipleItems';
const TOTAL_SINGLE_KEY = 'global.txtTotalSingleItem';

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
  // Logout TCs (TC04, TC07) run last so earlier cases stay on one session without re-auth.
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(120_000);

  // --- Easy ---

  test('TC01: switching language updates farm labels from locale JSON', async ({
    authenticatedDashboardSession,
  }) => {
    // For every language in the menu, UI strings match that locale's JSON.
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
      await expect(
        i18n.farmTagsTitle,
        `farm-tags-title for locale=${locale}`
      ).toHaveText(t(loc, TAGS_TITLE_KEY));

      if (await i18n.farmTagsInventory.isVisible().catch(() => false)) {
        await expect(i18n.farmTagsInventory).toHaveText(t(loc, TAGS_INVENTORY_KEY));
      }
    }

    await i18n.selectLanguage('en');
  });

  test('TC02: reload keeps selected language', async ({
    authenticatedDashboardSession,
  }) => {
    // After switch, F5/reload still shows same locale and matching labels.
    const farmPage = new FarmPage(authenticatedDashboardSession);
    const i18n = new I18nPage(authenticatedDashboardSession);

    await farmPage.verifyOnDashboard();
    const locales = await i18n.listLocalesFromMenu();
    const locale = pickNonEnLocale(locales);
    const loc = loadLocaleFlat(locale);

    await i18n.selectLanguage(locale);
    await expect(i18n.farmTagsTitle).toHaveText(t(loc, TAGS_TITLE_KEY));

    await authenticatedDashboardSession.reload({ waitUntil: 'domcontentloaded' });
    await farmPage.verifyOnDashboard();
    await expect(i18n.languageSelectorValue).toHaveText(
      new RegExp(locale.replace(/-/g, '[-\\s]?'), 'i')
    );
    await expect(i18n.farmTagsTitle).toHaveText(t(loc, TAGS_TITLE_KEY));

    await i18n.selectLanguage('en');
  });

  test('TC03: side nav labels follow selected language', async ({
    authenticatedDashboardSession,
  }) => {
    // Simple layout: Overview / Animal Management sit in header HorizontalNav (room view only).
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
    await expect(i18n.navItem('overview')).toContainText(t(loc, NAV_OVERVIEW_KEY));
    await expect(i18n.navItem('animalManagement')).toContainText(
      t(loc, NAV_ANIMAL_KEY)
    );

    await i18n.selectLanguage('en');
    await expect(i18n.navItem('overview')).toContainText(t(en, NAV_OVERVIEW_KEY));

    await authenticatedDashboardSession.goto(ROUTES.dashboard);
    await farmPage.verifyOnDashboard();
  });

  // --- Medium (no logout) ---

  test('TC05: overview page labels follow selected language', async ({
    authenticatedDashboardSession,
  }) => {
    // Open /overview; room tags title matches RoomViewPage JSON.
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
    await expect(roomTagsTitle).toHaveText(t(loc, ROOM_TAGS_TITLE_KEY));

    await authenticatedDashboardSession.goto(ROUTES.dashboard);
    await farmPage.verifyOnDashboard();
    await i18n.selectLanguage('en');
  });

  test('TC06: pagination total uses interpolated translation', async ({
    authenticatedDashboardSession,
  }) => {
    // pagination-total matches txtTotalMultipleItems / txtTotalSingleItem with {{total}}
    // (including "Total 0 item" when the list is empty).
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

    // Prefer header nav (room view) so location context stays mounted.
    const animalNav = i18n.navItem('animalManagement');
    if (await animalNav.isVisible().catch(() => false)) {
      await animalNav.click();
    } else {
      await page.goto(ROUTES.animalManagement);
    }
    await page.waitForURL(new RegExp(ROUTES.animalManagement));

    // Barn title proves Animal Management content (and currentLocation) is mounted.
    const barnTitle = page.getByTestId('animal-mgt-barn-details-title');
    await expect(barnTitle).toBeVisible({ timeout: 30_000 });

    await i18n.selectLanguage(locale);

    const totalEl = i18n.paginationTotal;
    await expect(
      totalEl,
      'pagination-total should render even when count is 0'
    ).toBeVisible({ timeout: 30_000 });
    await totalEl.scrollIntoViewIfNeeded();

    const text = (await totalEl.innerText()).trim();
    const numMatch = text.match(/(\d+)/);
    expect(numMatch, `expected a number in pagination total: ${text}`).toBeTruthy();
    const total = Number(numMatch![1]);
    const expected =
      total > 1
        ? tInterp(loc, TOTAL_MULTI_KEY, { total })
        : tInterp(loc, TOTAL_SINGLE_KEY, { total });
    expect(text).toBe(expected);

    await page.goto(ROUTES.dashboard);
    await i18n.selectLanguage('en');
  });

  test('TC08: switching language on animal or alerts page updates that page', async ({
    authenticatedDashboardSession,
  }) => {
    // From Animal Management, change language; assert copy on that page.
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
    await expect(barnTitle).toHaveText(t(loc, BARN_DETAILS_KEY));

    await i18n.selectLanguage('en');
    await expect(barnTitle).toHaveText(t(en, BARN_DETAILS_KEY));

    await authenticatedDashboardSession.goto(ROUTES.dashboard);
  });

  // --- Harder ---

  test('TC09: chart week labels and weather weekdays follow locale', async ({
    authenticatedDashboardSession,
  }) => {
    // Tags chart x-axis uses txtThisWeek/txtWeek; weather weekdays match moment dddd.
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
      // App uses lodash upperFirst on moment format('dddd').
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

  test('TC10: second tab sees same language after reload', async ({
    authenticatedDashboardSession,
  }) => {
    // Same browser context: change locale on tab A; tab B reload shows same language.
    const farmPage = new FarmPage(authenticatedDashboardSession);
    const i18n = new I18nPage(authenticatedDashboardSession);

    await farmPage.verifyOnDashboard();
    const locales = await i18n.listLocalesFromMenu();
    const locale = pickNonEnLocale(locales);
    const loc = loadLocaleFlat(locale);

    await i18n.selectLanguage(locale);
    await expect(i18n.farmTagsTitle).toHaveText(t(loc, TAGS_TITLE_KEY));

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
      await expect(i18n2.farmTagsTitle).toHaveText(t(loc, TAGS_TITLE_KEY));
    } finally {
      await page2.close();
    }

    await i18n.selectLanguage('en');
  });

  test('TC11: UI does not show raw i18n keys', async ({
    authenticatedDashboardSession,
  }) => {
    // After a language switch, visible text must not look like raw keys (nav./container./global.).
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

  test('TC12: tags chart tooltip still shows week date range after language switch', async ({
    authenticatedDashboardSession,
  }) => {
    // Hover a bar; tooltip visible and contains DD/MM/YYYY range (formatDate).
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
    // formatDate uses DD/MM/YYYY HH:mm — range often "DD/MM/YYYY HH:mm - DD/MM/YYYY HH:mm"
    expect(tipText).toMatch(/\d{2}\/\d{2}\/\d{4}/);

    await i18n.selectLanguage('en');
  });

  // --- Logout / re-auth last (intentional full login flow) ---

  test('TC04: sign-in screen follows persisted language after logout', async ({
    authenticatedDashboardSession: page,
  }) => {
    // Logout; login button text matches persisted locale JSON (auth screens).
    // Placed last-but-one so earlier TCs never re-select tenant/farm mid-suite.
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
    await expect(loginButton).toHaveText(t(loc, SIGN_IN_KEY));

    const emailInput = page.getByTestId('email-input');
    await expect(emailInput).toHaveAttribute(
      'placeholder',
      t(loc, 'container.PageSignIn.labelEmail')
    );

    await loginAgain(page);
    await farmPage.verifyOnDashboard();
  });

  test('TC07: language persists after logout and login', async ({
    authenticatedDashboardSession: page,
  }) => {
    // Switch locale → logout → login → dashboard still that locale + JSON labels.
    // Last TC: full re-auth is part of the assertion.
    const farmPage = new FarmPage(page);
    const i18n = new I18nPage(page);

    await farmPage.verifyOnDashboard();
    const locales = await i18n.listLocalesFromMenu();
    const locale = pickNonEnLocale(locales);
    const loc = loadLocaleFlat(locale);

    await i18n.selectLanguage(locale);
    await expect(i18n.farmTagsTitle).toHaveText(t(loc, TAGS_TITLE_KEY));

    await i18n.signOut();
    await loginAgain(page);

    await farmPage.verifyOnDashboard();
    await expect(i18n.languageSelectorValue).toHaveText(
      new RegExp(locale.replace(/-/g, '[-\\s]?'), 'i')
    );
    await expect(i18n.farmTagsTitle).toHaveText(t(loc, TAGS_TITLE_KEY));
  });

  // Temporary: remove after verifying Slack failure UI.
  test('TC99: force fail for Slack notify UI check', { tag: '@force-fail' }, async () => {
    expect(
      false,
      'Intentional failure — check Slack shows ❌ case list + Failed tests block'
    ).toBe(true);
  });
});
