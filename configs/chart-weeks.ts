/**
 * Semantic week keys for farm/room dashboard charts (oldest → newest in data[]).
 * @see docs/webapp/farm-health-charts-cube.md §3
 */
export const CHART_WEEK_KEYS = ['prev-3', 'prev-2', 'prev-1', 'this-week'] as const;

export type ChartWeekKey = (typeof CHART_WEEK_KEYS)[number];

/** Pivot / data[] index 0 = prev-3, index 3 = this-week. */
export const WEEK_KEY_TO_INDEX: Record<ChartWeekKey, number> = {
  'prev-3': 0,
  'prev-2': 1,
  'prev-1': 2,
  'this-week': 3,
};
