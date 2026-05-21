/**
 * Farm dashboard Cube oracles — tags deployed, health alerts, health events.
 */
import {
  buildFarmHealthAlertsQuery,
  buildFarmHealthEventsQuery,
  buildFarmTagsDeployedQuery,
} from '@/configs/cube-queries.js';
import type { AppApiClient } from '@/lib/api/app-api.client.js';
import type { CubeApiClient } from '@/lib/api/cube-api.client.js';
import { loadFarmCubeContext } from './context.js';
import {
  parseFarmHealthAlertsByWeek,
  parseFarmHealthEventsByWeek,
  parseFarmTagsDeployedThisWeek,
  type FarmHealthAlertsByWeek,
  type FarmHealthEventsByWeek,
  type FarmTagsDeployedWeekCounts,
} from './parsers.js';

export type {
  FarmHealthAlertsByWeek,
  FarmHealthAlertsWeekCounts,
  FarmHealthEventsByWeek,
  FarmHealthEventsWeekCounts,
  FarmTagsDeployedWeekCounts,
} from './parsers.js';

export async function getFarmTagsDeployedThisWeekFromCube(
  appApi: AppApiClient,
  cubeApi: CubeApiClient,
): Promise<FarmTagsDeployedWeekCounts> {
  const { farmIdentifier, timezone, dateRange } = await loadFarmCubeContext(appApi);
  const query = buildFarmTagsDeployedQuery({ farmIdentifier, dateRange, timezone });
  const result = await cubeApi.load(query);
  return parseFarmTagsDeployedThisWeek(cubeApi.tablePivot(result));
}

export async function getFarmHealthAlertsFromCube(
  appApi: AppApiClient,
  cubeApi: CubeApiClient,
): Promise<FarmHealthAlertsByWeek> {
  const { farmIdentifier, timezone, dateRange, listDate } = await loadFarmCubeContext(appApi);
  const query = buildFarmHealthAlertsQuery({ farmIdentifier, dateRange, timezone });
  const result = await cubeApi.load(query);
  return parseFarmHealthAlertsByWeek(cubeApi.tablePivot(result), listDate, timezone);
}

export async function getFarmHealthEventsFromCube(
  appApi: AppApiClient,
  cubeApi: CubeApiClient,
): Promise<FarmHealthEventsByWeek> {
  const { farmIdentifier, timezone, dateRange, listDate } = await loadFarmCubeContext(appApi);
  const query = buildFarmHealthEventsQuery({ farmIdentifier, dateRange, timezone });
  const result = await cubeApi.load(query);
  return parseFarmHealthEventsByWeek(cubeApi.tablePivot(result), listDate, timezone);
}
