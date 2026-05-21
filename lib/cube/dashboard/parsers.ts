/**
 * Farm dashboard Cube pivot parsing and ISO week helpers (tags + health charts).
 */
import moment from 'moment-timezone';
import type { Moment } from 'moment-timezone';
import { CHART_WEEK_KEYS, type ChartWeekKey } from '@/configs/chart-weeks.js';
import { CUBE_MEASURES } from '@/configs/cube-api.js';
import { APP_API } from '@/configs/app-api.js';
import type { CubeDateRange } from '@/configs/cube-queries.js';

const WEEK_COL = 'snowflake_inventory_tracking.timestamp.week';

export type FarmTagsDeployedWeekCounts = {
  existing: number;
  onboarded: number;
  total: number;
};

export type FarmHealthAlertsWeekCounts = {
  triggered: number;
  medicationScheduled: number;
  addedMobile: number;
  addedWeb: number;
  total: number;
};

export type FarmHealthEventsWeekCounts = {
  medicated: number;
  highMedication: number;
  recovered: number;
  euthanised: number;
};

export type FarmHealthAlertsByWeek = Record<ChartWeekKey, FarmHealthAlertsWeekCounts>;
export type FarmHealthEventsByWeek = Record<ChartWeekKey, FarmHealthEventsWeekCounts>;

/** Same format as webapp `formatTimestampQueryCube`. */
export function formatTimestampQueryCube(datetime: Moment): string {
  return datetime.format('YYYY-MM-DDTHH:mm:ss');
}

/** 4 ISO weeks: current week + previous 3 (farm chart dateRange). */
export function buildFarmIsoWeekRange(timezone?: string): CubeDateRange {
  const tz = timezone ?? APP_API.timezone;
  const now = moment.tz(tz);
  const endDate = now.clone().endOf('isoWeek');
  const startDate = endDate.clone().subtract(3, 'weeks').startOf('isoWeek');
  return {
    startDate: formatTimestampQueryCube(startDate),
    endDate: formatTimestampQueryCube(endDate),
  };
}

/** @deprecated alias — use buildFarmIsoWeekRange */
export const buildFarmTagsDeployedIsoWeekRange = buildFarmIsoWeekRange;

/** Four ISO week starts: prev-3 → this-week (oldest first). */
export function buildFarmChartIsoWeekList(timezone?: string): Moment[] {
  const tz = timezone ?? APP_API.timezone;
  const now = moment.tz(tz);
  const endDate = now.clone().endOf('isoWeek');
  const startDate = endDate.clone().subtract(3, 'weeks').startOf('isoWeek');
  return [0, 1, 2, 3].map((i) => startDate.clone().add(i, 'weeks'));
}

function measureValue(row: Record<string, unknown>, key: string): number {
  const raw = row[key];
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

function weekDateKey(m: Moment, timezone: string): string {
  return m.clone().tz(timezone).format('YYYY-MM-DD');
}

function rowWeekDateKey(row: Record<string, unknown>, timezone: string): string {
  const raw = String(row[WEEK_COL] ?? '').trim();
  if (!raw) return '';
  return moment.tz(raw.slice(0, 19), timezone).format('YYYY-MM-DD');
}

function findRowForWeek(
  rows: Record<string, unknown>[],
  date: Moment,
  timezone: string,
): Record<string, unknown> | undefined {
  const target = weekDateKey(date, timezone);
  return rows.find((item) => rowWeekDateKey(item, timezone) === target);
}

/** Latest week bucket (this-week = last row when sorted by week). */
export function parseFarmTagsDeployedThisWeek(
  rows: Record<string, unknown>[],
): FarmTagsDeployedWeekCounts {
  if (rows.length === 0) {
    return { existing: 0, onboarded: 0, total: 0 };
  }

  const sorted = [...rows].sort((a, b) => {
    const ta = new Date(String(a[WEEK_COL] ?? 0)).getTime();
    const tb = new Date(String(b[WEEK_COL] ?? 0)).getTime();
    return ta - tb;
  });

  const last = sorted[sorted.length - 1]!;
  const existing = measureValue(last, CUBE_MEASURES.sumExistingActiveTags);
  const onboarded = measureValue(last, CUBE_MEASURES.sumNewTagsOnboarded);
  return { existing, onboarded, total: existing + onboarded };
}

export function parseFarmHealthAlertsByWeek(
  rows: Record<string, unknown>[],
  listDate: Moment[],
  timezone?: string,
): FarmHealthAlertsByWeek {
  const tz = timezone ?? listDate[0]?.tz() ?? APP_API.timezone;
  const out = {} as FarmHealthAlertsByWeek;

  CHART_WEEK_KEYS.forEach((weekKey, index) => {
    const date = listDate[index]!;
    const row = findRowForWeek(rows, date, tz);
    const triggered = row ? measureValue(row, CUBE_MEASURES.sumAlertGenerated) : 0;
    const medicationScheduled = row
      ? measureValue(row, CUBE_MEASURES.sumMedicationScheduled)
      : 0;
    const addedMobile = row ? measureValue(row, CUBE_MEASURES.sumAddedByMobile) : 0;
    const addedWeb = row ? measureValue(row, CUBE_MEASURES.sumAddedByWeb) : 0;
    out[weekKey] = {
      triggered,
      medicationScheduled,
      addedMobile,
      addedWeb,
      total: triggered + medicationScheduled + addedMobile + addedWeb,
    };
  });

  return out;
}

export function parseFarmHealthEventsByWeek(
  rows: Record<string, unknown>[],
  listDate: Moment[],
  timezone?: string,
): FarmHealthEventsByWeek {
  const tz = timezone ?? listDate[0]?.tz() ?? APP_API.timezone;
  const out = {} as FarmHealthEventsByWeek;

  CHART_WEEK_KEYS.forEach((weekKey, index) => {
    const date = listDate[index]!;
    const row = findRowForWeek(rows, date, tz);
    out[weekKey] = {
      medicated: row ? measureValue(row, CUBE_MEASURES.sumMedicatedPigs) : 0,
      highMedication: row ? measureValue(row, CUBE_MEASURES.sumHighMedicationPigs) : 0,
      recovered: row ? measureValue(row, CUBE_MEASURES.sumRecoveredPigs) : 0,
      euthanised: row ? measureValue(row, CUBE_MEASURES.sumConfirmedDeadPigs) : 0,
    };
  });

  return out;
}
