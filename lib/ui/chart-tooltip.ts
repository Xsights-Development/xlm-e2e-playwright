import type { Locator, Page } from '@playwright/test';

export type ChartTooltipCounts = {
  existing: number;
  onboarded: number;
};

/**
 * Read Existing / Onboarded for the last chart column (this week) via ApexCharts tooltip hover.
 * Farm stacked chart: path 3 = Existing bar, path 7 = Onboarded bar (4 weeks × 2 series).
 */
export async function getExistingAndOnboardedFromChartTooltip(
  page: Page,
  panel: Locator,
  waitMs: (ms: number) => Promise<void>,
): Promise<ChartTooltipCounts> {
  await panel.waitFor({ state: 'visible', timeout: 15000 });
  await panel.scrollIntoViewIfNeeded();
  await waitMs(1500);

  const paths = panel.locator('.apexcharts-bar-series path');
  const pathsTimeout = 20000;
  const deadline = Date.now() + pathsTimeout;
  let count = await paths.count();
  while (count < 8 && Date.now() < deadline) {
    await waitMs(300);
    count = await paths.count();
  }
  if (count < 8) {
    return { existing: 0, onboarded: 0 };
  }

  const tooltipLocator = panel.locator('.apexcharts-tooltip').first();
  const hoverTimeout = 5000;
  const tooltipTimeout = 5000;

  await paths.nth(3).hover({ timeout: hoverTimeout, force: true });
  await waitMs(600);
  const existingText = (await tooltipLocator.textContent({ timeout: tooltipTimeout })) ?? '';
  const existingMatch = existingText.match(/Existing:\s*(\d+)/i);
  const existing = existingMatch ? parseInt(existingMatch[1], 10) : 0;

  let onboarded = 0;
  try {
    await paths.nth(7).hover({ timeout: hoverTimeout, force: true });
    await waitMs(600);
    const onboardedText = (await tooltipLocator.textContent({ timeout: tooltipTimeout })) ?? '';
    const onboardedMatch = onboardedText.match(/Onboarded:\s*(\d+)/i);
    onboarded = onboardedMatch ? parseInt(onboardedMatch[1], 10) : 0;
  } catch {
    onboarded = 0;
  }

  return { existing, onboarded };
}
