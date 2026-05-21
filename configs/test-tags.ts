/**
 * Playwright --grep patterns for npm scripts. Prefer describe tags in specs over new package.json scripts.
 */

/** Farm dashboard panels (describe tags in farm.spec.ts) */
export const FARM_GREP = {
  all: '@farm',
  contract: '@contract',
  business: '@business',
  health: '@health',
  tagsDeployed: '@tags-deployed',
  inventory: '@inventory',
} as const;
