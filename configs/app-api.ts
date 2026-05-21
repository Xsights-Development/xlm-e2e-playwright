/**
 * App API (REST) — mirrors webapp `REACT_APP_ROOT_API` + `configs/apis.js`.
 * @see docs/e2e/api-and-cube.md
 */

const baseUrl = (process.env.API_BASE_URL ?? '').trim().replace(/\/+$/, '');

/** Path templates (append to API_BASE_URL). */
export const APP_API_PATHS = {
  auth: {
    login: '/auth/login',
    me: '/users/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  cube: {
    token: '/cube/token',
  },
  farms: {
    list: '/farms',
    current: '/farms/current',
    barnCategoriesLayout: '/farms/current/barn-categories-layout',
  },
  locations: {
    list: '/locations/',
    detail: (locationId: number | string) => `/locations/${locationId}`,
  },
  stats: {
    /** Farm dashboard — Current Inventory active tags */
    tags: '/stats/tags',
    /** Room overview — Current Inventory active tags */
    roomTags: '/stats/room-tags',
  },
  animals: {
    list: '/animals/',
    item: (animalId: number | string) => `/animals/${animalId}`,
    byTag: (tagId: string) => `/animals/get-by-tag/${tagId}`,
  },
  alerts: {
    list: '/alerts/',
    alertsList: '/alerts-list/',
  },
  other: {
    weatherForecast: '/weather-forecast',
    eventLogs: '/event-logs',
  },
} as const;

/** Same header names as `BaseService.js` / `api.constant.js`. */
export const APP_API_HEADERS = {
  authorization: 'Authorization',
  tenant: 'X-Tenant-Identifier',
  farm: 'X-Farm-Identifier',
} as const;

export const APP_API = {
  baseUrl,
  paths: APP_API_PATHS,
  headers: APP_API_HEADERS,
  tenantIdentifier:
    process.env.APP_TENANT_IDENTIFIER ?? process.env.APP_TENANT ?? '',
  /** API header value (e.g. GROOVE). Override when APP_FARM_IDENTIFIER is a UI label. */
  farmIdentifier:
    process.env.APP_API_FARM_IDENTIFIER ??
    process.env.APP_FARM_IDENTIFIER ??
    process.env.APP_FARM ??
    '',
  locationIdentifier: process.env.APP_LOCATION_IDENTIFIER ?? '',
  /** Optional; Cube queries use tenant timezone when set */
  timezone: process.env.APP_TIMEZONE ?? 'Australia/Perth',
  get loginUrl(): string {
    return `${this.baseUrl}${APP_API_PATHS.auth.login}`;
  },
  get meUrl(): string {
    return `${this.baseUrl}${APP_API_PATHS.auth.me}`;
  },
  get cubeTokenUrl(): string {
    return `${this.baseUrl}${APP_API_PATHS.cube.token}`;
  },
  get farmCurrentUrl(): string {
    return `${this.baseUrl}${APP_API_PATHS.farms.current}`;
  },
  get tagsStatsUrl(): string {
    return `${this.baseUrl}${APP_API_PATHS.stats.tags}`;
  },
  get roomTagsUrl(): string {
    return `${this.baseUrl}${APP_API_PATHS.stats.roomTags}`;
  },
  get locationsUrl(): string {
    return `${this.baseUrl}${APP_API_PATHS.locations.list}`;
  },
  /** @deprecated use paths.stats.tags */
  tagsStatsPath: APP_API_PATHS.stats.tags,
  roomTagsPath: APP_API_PATHS.stats.roomTags,
  locationsPath: APP_API_PATHS.locations.list,
  loginPath: APP_API_PATHS.auth.login,
} as const;

/** Login response from POST /auth/login (FastAPI Users JWT). */
export interface AppLoginResponse {
  access_token?: string;
  token_type?: string;
  data?: {
    access_token?: string;
    token_type?: string;
  };
}

export interface CubeTokenResponse {
  token?: string;
  data?: { token?: string };
}

export type ActiveTagEntry = Record<string, number>;

export type TagsStatsDataBlock = {
  active_tags?: ActiveTagEntry[];
  [key: string]: unknown;
};

export interface TagsStatsResponse {
  data?: TagsStatsDataBlock[];
}

export type ActiveTagCounts = {
  g: number;
  s: number;
};
