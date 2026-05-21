/**
 * Shared farm identifier, timezone, and ISO week range for Cube oracles.
 */
import { APP_API } from '@/configs/app-api.js';
import type { CubeDateRange } from '@/configs/cube-queries.js';
import type { AppApiClient } from '@/lib/api/app-api.client.js';
import {
  buildFarmChartIsoWeekList,
  buildFarmIsoWeekRange,
} from './parsers.js';
import type { Moment } from 'moment-timezone';

export type FarmCubeContext = {
  farmIdentifier: string;
  timezone: string;
  dateRange: CubeDateRange;
  listDate: Moment[];
};

function resolveTimezone(farmDetail: Record<string, unknown>): string {
  const settings = farmDetail.settings as { timezone?: string } | undefined;
  const fromSettings = settings?.timezone?.trim();
  if (fromSettings) return fromSettings;
  return APP_API.timezone;
}

export async function loadFarmCubeContext(appApi: AppApiClient): Promise<FarmCubeContext> {
  const farmDetail = await appApi.getFarmCurrent();
  const farmIdentifier =
    String(farmDetail.identifier ?? '').trim() ||
    process.env.APP_API_FARM_IDENTIFIER ||
    APP_API.farmIdentifier;

  if (!farmIdentifier) {
    throw new Error(
      'Farm Cube context: farm.identifier is empty (GET /farms/current or APP_API_FARM_IDENTIFIER)',
    );
  }

  const timezone = resolveTimezone(farmDetail);
  return {
    farmIdentifier,
    timezone,
    dateRange: buildFarmIsoWeekRange(timezone),
    listDate: buildFarmChartIsoWeekList(timezone),
  };
}
