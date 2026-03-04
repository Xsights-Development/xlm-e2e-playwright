/**
 * E2E constants: stable values for test ids, tab keys, etc.
 * Aligned with data-testid and identifiers in the app (xahwm-dashboard).
 */

// --- Overview page ---

/** Overview tab keys (suffix for data-testid "overview-{key}"). */
export const OVERVIEW_TAB = {
  INVENTORY: 'inventory',
  HEALTH_STATUS: 'health-status',
  LOCATION_CONDITION: 'location-condition',
} as const;

export type OverviewTabKey = (typeof OVERVIEW_TAB)[keyof typeof OVERVIEW_TAB];

/** Full data-testid for Overview tabs. */
export const OVERVIEW_TAB_TEST_ID: Record<OverviewTabKey, string> = {
  [OVERVIEW_TAB.INVENTORY]: 'overview-inventory',
  [OVERVIEW_TAB.HEALTH_STATUS]: 'overview-health-status',
  [OVERVIEW_TAB.LOCATION_CONDITION]: 'overview-location-condition',
};
