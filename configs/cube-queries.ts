/**
 * Cube query builders aligned with dashboard components.
 * @see docs/e2e/api-and-cube.md §6.3–6.5
 */
import { APP_API } from '@/configs/app-api.js';
import { CUBE_DIMENSIONS, CUBE_MEASURES, type CubeQuery } from '@/configs/cube-api.js';

export type CubeDateRange = {
  startDate: string;
  endDate: string;
};

/** Farm TagsDeployedChart — componentKey `farm-tags-deployed`. */
export function buildFarmTagsDeployedQuery(options: {
  farmIdentifier: string;
  dateRange: CubeDateRange;
  timezone?: string;
}): CubeQuery {
  const timezone = options.timezone ?? APP_API.timezone;
  return {
    limit: 100,
    measures: [
      CUBE_MEASURES.sumNewTagsOnboarded,
      CUBE_MEASURES.sumExistingActiveTags,
      CUBE_MEASURES.sumUndetectedTags,
    ],
    order: {
      [CUBE_DIMENSIONS.timestamp]: 'asc',
    },
    timeDimensions: [
      {
        dimension: CUBE_DIMENSIONS.timestamp,
        granularity: 'week',
      },
    ],
    filters: [
      {
        member: CUBE_DIMENSIONS.beLocationStatus,
        operator: 'equals',
        values: ['active'],
      },
      {
        member: CUBE_DIMENSIONS.farm,
        operator: 'equals',
        values: [options.farmIdentifier],
      },
      {
        member: CUBE_DIMENSIONS.timestamp,
        operator: 'inDateRange',
        values: [options.dateRange.startDate, options.dateRange.endDate],
      },
    ],
    timezone,
  };
}

/** Farm HealthAlertsChart — componentKey `farm-health-alerts`. */
export function buildFarmHealthAlertsQuery(options: {
  farmIdentifier: string;
  dateRange: CubeDateRange;
  timezone?: string;
}): CubeQuery {
  const timezone = options.timezone ?? APP_API.timezone;
  return {
    measures: [
      CUBE_MEASURES.sumAddedByMobile,
      CUBE_MEASURES.sumAddedByWeb,
      CUBE_MEASURES.sumAlertGenerated,
      CUBE_MEASURES.sumMedicationScheduled,
    ],
    order: {
      [CUBE_DIMENSIONS.timestamp]: 'desc',
    },
    timeDimensions: [
      {
        dimension: CUBE_DIMENSIONS.timestamp,
        granularity: 'week',
      },
    ],
    filters: [
      {
        member: CUBE_DIMENSIONS.beLocationStatus,
        operator: 'equals',
        values: ['active'],
      },
      {
        member: CUBE_DIMENSIONS.farm,
        operator: 'equals',
        values: [options.farmIdentifier],
      },
      {
        member: CUBE_DIMENSIONS.timestamp,
        operator: 'inDateRange',
        values: [options.dateRange.startDate, options.dateRange.endDate],
      },
    ],
    timezone,
  };
}

/** Farm HealthAlertsReponsesChart — componentKey `farm-health-alert-responses`. */
export function buildFarmHealthEventsQuery(options: {
  farmIdentifier: string;
  dateRange: CubeDateRange;
  timezone?: string;
}): CubeQuery {
  const timezone = options.timezone ?? APP_API.timezone;
  return {
    limit: 100,
    measures: [
      CUBE_MEASURES.sumMedicatedPigs,
      CUBE_MEASURES.sumHighMedicationPigs,
      CUBE_MEASURES.sumRecoveredPigs,
      CUBE_MEASURES.sumConfirmedDeadPigs,
    ],
    order: {
      [CUBE_DIMENSIONS.timestamp]: 'asc',
    },
    timeDimensions: [
      {
        dimension: CUBE_DIMENSIONS.timestamp,
        granularity: 'week',
      },
    ],
    filters: [
      {
        member: CUBE_DIMENSIONS.beLocationStatus,
        operator: 'equals',
        values: ['active'],
      },
      {
        member: CUBE_DIMENSIONS.farm,
        operator: 'equals',
        values: [options.farmIdentifier],
      },
      {
        member: CUBE_DIMENSIONS.timestamp,
        operator: 'inDateRange',
        values: [options.dateRange.startDate, options.dateRange.endDate],
      },
    ],
    timezone,
  };
}

/** Room TagsDeployedChart — componentKey `room-tags-deployed`. */
export function buildRoomTagsDeployedQuery(options: {
  locationId: number;
  dateRange: CubeDateRange;
  timezone?: string;
}): CubeQuery {
  const timezone = options.timezone ?? APP_API.timezone;
  return {
    limit: 100,
    measures: [
      CUBE_MEASURES.sumNewTagsOnboarded,
      CUBE_MEASURES.sumExistingActiveTags,
    ],
    order: {
      [CUBE_DIMENSIONS.timestamp]: 'asc',
    },
    timeDimensions: [
      {
        dimension: CUBE_DIMENSIONS.timestamp,
        granularity: 'week',
      },
    ],
    filters: [
      {
        member: CUBE_DIMENSIONS.beLocationStatus,
        operator: 'equals',
        values: ['active'],
      },
      {
        member: CUBE_DIMENSIONS.locationId,
        operator: 'equals',
        values: [options.locationId],
      },
      {
        member: CUBE_DIMENSIONS.timestamp,
        operator: 'inDateRange',
        values: [options.dateRange.startDate, options.dateRange.endDate],
      },
    ],
    timezone,
  };
}
