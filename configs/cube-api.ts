/**
 * Cube.js — mirrors webapp `REACT_APP_CUBE_API` + `useShowcaseCubeData` component keys.
 * Token issued via REST POST {API_BASE_URL}/cube/token (see AppApiClient).
 * @see docs/e2e/api-and-cube.md
 */

const baseUrl = (process.env.CUBE_API_URL ?? '').trim().replace(/\/+$/, '');

/** Last argument to `useShowcaseCubeData(..., componentKey)` in dashboard repo. */
export const CUBE_COMPONENT_KEYS = {
  farm: {
    tagsDeployed: 'farm-tags-deployed',
    healthAlerts: 'farm-health-alerts',
    healthAlertResponses: 'farm-health-alert-responses',
  },
  room: {
    tagsDeployed: 'room-tags-deployed',
    healthAlerts: 'room-health-alerts',
    healthAlertResponses: 'room-health-alert-responses',
    conditions: 'room-conditions',
    conditionsToday: 'room-conditions-today',
  },
} as const;

/** Snowflake inventory tracking measures used by farm/room tag charts. */
export const CUBE_MEASURES = {
  sumNewTagsOnboarded: 'snowflake_inventory_tracking.sum_new_tags_onboarded',
  sumExistingActiveTags: 'snowflake_inventory_tracking.sum_existing_active_tags',
  sumUndetectedTags: 'snowflake_inventory_tracking.sum_undetected_tags',
  sumAlertGenerated: 'snowflake_inventory_tracking.sum_alert_generated',
  sumMedicationScheduled: 'snowflake_inventory_tracking.sum_medication_scheduled',
  sumAddedByWeb: 'snowflake_inventory_tracking.sum_added_by_web',
  sumAddedByMobile: 'snowflake_inventory_tracking.sum_added_by_mobile',
  sumMedicatedPigs: 'snowflake_inventory_tracking.sum_medicated_pigs',
  sumHighMedicationPigs: 'snowflake_inventory_tracking.sum_high_medication_pigs',
  sumRecoveredPigs: 'snowflake_inventory_tracking.sum_recovered_pigs',
  sumConfirmedDeadPigs: 'snowflake_inventory_tracking.sum_confirmed_dead_pigs',
} as const;

export const CUBE_DIMENSIONS = {
  timestamp: 'snowflake_inventory_tracking.timestamp',
  farm: 'snowflake_inventory_tracking.farm',
  locationId: 'snowflake_inventory_tracking.location_id',
  beLocationStatus: 'be_location.status',
} as const;

export const CUBE_API = {
  baseUrl,
  /** Cube.js REST load endpoint (browser uses POST {CUBE_API}/load). */
  loadPath: '/load',
  componentKeys: CUBE_COMPONENT_KEYS,
  measures: CUBE_MEASURES,
  dimensions: CUBE_DIMENSIONS,
  get loadUrl(): string {
    return `${this.baseUrl}${this.loadPath}`;
  },
} as const;

/** Cube.js query object (subset used in E2E). */
export type CubeQuery = {
  limit?: number;
  measures?: string[];
  dimensions?: string[];
  timeDimensions?: Array<{
    dimension: string;
    granularity?: string;
    dateRange?: string[];
  }>;
  filters?: Array<{
    member: string;
    operator: string;
    values: (string | number)[];
  }>;
  order?: Record<string, 'asc' | 'desc'>;
  timezone?: string;
};

/** Single result set from POST /load (browser + Cube.js REST v1). */
export type CubeLoadResultSet = {
  data?: unknown[];
  annotation?: unknown;
  query?: unknown;
};

export type CubeLoadResponse = {
  /** Legacy / alternate shape — some deployments return rows at root. */
  data?: unknown[];
  annotation?: unknown;
  error?: string;
  queryType?: string;
  /** Standard Cube.js load response — pivot rows live in results[0].data. */
  results?: CubeLoadResultSet[];
};
