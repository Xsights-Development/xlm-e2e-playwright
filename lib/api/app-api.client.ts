/**
 * App API client: login for Bearer token, then call dashboard APIs with tenant/farm headers.
 */
import {
  APP_API,
  APP_API_PATHS,
  type AppLoginResponse,
  type CubeTokenResponse,
  type TagsStatsResponse,
} from '@/configs/app-api.js';
import { parseActiveTagCounts } from './app-api.parsers.js';

export class AppApiClient {
  private baseUrl: string;
  private username: string;
  private password: string;
  private tenantIdentifier: string;
  private farmIdentifier: string;
  private accessToken: string | null = null;

  constructor(options?: {
    baseUrl?: string;
    username?: string;
    password?: string;
    tenantIdentifier?: string;
    farmIdentifier?: string;
  }) {
    this.baseUrl = options?.baseUrl ?? APP_API.baseUrl;
    this.username = options?.username ?? process.env.APP_USER ?? '';
    this.password = options?.password ?? process.env.APP_PASS ?? '';
    this.tenantIdentifier =
      options?.tenantIdentifier ?? APP_API.tenantIdentifier;
    this.farmIdentifier = options?.farmIdentifier ?? APP_API.farmIdentifier;
  }

  /**
   * POST /auth/login (OAuth2 form, same as SignInForm).
   */
  async login(): Promise<void> {
    if (!this.baseUrl) {
      throw new Error('App API: API_BASE_URL is not set in .env');
    }
    if (!this.username || !this.password) {
      throw new Error('App API: APP_USER and APP_PASS are required');
    }

    const body = new URLSearchParams({
      username: this.username,
      password: this.password,
    });

    let res = await fetch(APP_API.loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (res.status === 422) {
      res = await fetch(APP_API.loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: this.username, password: this.password }),
      });
    }

    const text = await res.text();
    let parsed: AppLoginResponse;
    try {
      parsed = (text ? JSON.parse(text) : {}) as AppLoginResponse;
    } catch {
      throw new Error(
        `App API login returned invalid JSON (${res.status}). URL: ${APP_API.loginUrl}. Body: ${text.slice(0, 200)}`,
      );
    }

    if (!res.ok) {
      throw new Error(
        `App API login failed (${res.status}): ${text.slice(0, 300)}. Check API_BASE_URL, APP_USER, APP_PASS.`,
      );
    }

    const token = parsed.access_token ?? parsed.data?.access_token;
    if (!token) {
      throw new Error(
        `App API login: no access_token in response. URL: ${APP_API.loginUrl}`,
      );
    }
    this.accessToken = token;
  }

  private authHeaders(): Record<string, string> {
    if (!this.accessToken) {
      throw new Error('App API: call login() first');
    }
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: 'application/json',
    };
    if (this.tenantIdentifier) {
      headers['X-Tenant-Identifier'] = this.tenantIdentifier;
    }
    if (this.farmIdentifier) {
      headers['X-Farm-Identifier'] = this.farmIdentifier;
    }
    return headers;
  }

  private buildUrl(path: string, query?: Record<string, string>): string {
    const base = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    if (!query || Object.keys(query).length === 0) return base;
    const params = new URLSearchParams(query);
    return `${base}?${params.toString()}`;
  }

  private async fetchWithAuth(
    path: string,
    init?: RequestInit & { query?: Record<string, string> },
  ): Promise<Response> {
    const { query, ...rest } = init ?? {};
    const headers = { ...this.authHeaders(), ...(rest.headers as Record<string, string>) };
    return fetch(this.buildUrl(path, query), { ...rest, headers });
  }

  private async postJson<T>(path: string, body: unknown): Promise<T> {
    const res = await this.fetchWithAuth(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let parsed: T;
    try {
      parsed = (text ? JSON.parse(text) : {}) as T;
    } catch {
      throw new Error(
        `App API POST ${path} invalid JSON (${res.status}). Body: ${text.slice(0, 200)}`,
      );
    }
    if (!res.ok) {
      throw new Error(`App API POST ${path} failed (${res.status}): ${text.slice(0, 300)}`);
    }
    return parsed;
  }

  /** GET /users/me — session bootstrap (layout). */
  async fetchMe(): Promise<unknown> {
    const res = await this.fetchWithAuth(APP_API_PATHS.auth.me);
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`App API GET /users/me failed (${res.status}): ${text.slice(0, 300)}`);
    }
    return text ? JSON.parse(text) : {};
  }

  /** GET /farms/current — farm detail panel. */
  async getFarmCurrent(): Promise<{ identifier?: string; id?: number; [key: string]: unknown }> {
    const res = await this.fetchWithAuth(APP_API_PATHS.farms.current);
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`App API GET /farms/current failed (${res.status}): ${text.slice(0, 300)}`);
    }
    const parsed = text ? JSON.parse(text) : {};
    return (parsed as { data?: Record<string, unknown> }).data ?? (parsed as Record<string, unknown>);
  }

  /**
   * POST /cube/token — short-lived JWT for Cube.js (layout uses type `backend`).
   * @see docs/e2e/api-and-cube.md §6.1
   */
  async getCubeToken(type: 'backend' | 'snowflake' = 'backend'): Promise<string> {
    const parsed = await this.postJson<CubeTokenResponse>(APP_API_PATHS.cube.token, { type });
    const token = parsed.token ?? parsed.data?.token;
    if (!token) {
      throw new Error('App API POST /cube/token: no token in response');
    }
    return token;
  }

  private async fetchTagsStats(
    path: string,
    query: Record<string, string> | undefined,
    label: string,
  ): Promise<TagsStatsResponse> {
    const res = await this.fetchWithAuth(path, { query });
    const text = await res.text();
    let body: TagsStatsResponse;
    try {
      body = (text ? JSON.parse(text) : {}) as TagsStatsResponse;
    } catch {
      throw new Error(
        `App API GET ${label} invalid JSON (${res.status}). Body: ${text.slice(0, 200)}`,
      );
    }
    if (!res.ok) {
      throw new Error(
        `App API GET ${label} failed (${res.status}): ${text.slice(0, 300)}. Check tenant/farm headers and query params.`,
      );
    }
    return body;
  }

  /** Resolve numeric location id for room-scoped APIs (GET /locations/). */
  async resolveLocationId(identifier?: string): Promise<number> {
    const key = (identifier ?? APP_API.locationIdentifier).trim();
    if (!key) {
      throw new Error(
        'App API: location identifier is empty (APP_LOCATION_IDENTIFIER)',
      );
    }

    const res = await this.fetchWithAuth(APP_API_PATHS.locations.list);
    const text = await res.text();
    if (!res.ok) {
      throw new Error(
        `App API GET /locations/ failed (${res.status}): ${text.slice(0, 300)}`,
      );
    }

    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`App API GET /locations/ invalid JSON. Body: ${text.slice(0, 200)}`);
    }

    const items: Array<{ id?: number; identifier?: string }> = Array.isArray(parsed)
      ? (parsed as Array<{ id?: number; identifier?: string }>)
      : ((parsed as { result?: Array<{ id?: number; identifier?: string }> }).result ??
        (parsed as { data?: Array<{ id?: number; identifier?: string }> }).data ??
        []);

    const match = items.find(
      (loc) => String(loc.identifier ?? '').toLowerCase() === key.toLowerCase(),
    );
    if (!match?.id) {
      throw new Error(`App API: location not found for identifier "${key}"`);
    }
    return match.id;
  }

  /** Raw GET /stats/tags (farm scope). */
  async getTagsStats(): Promise<TagsStatsResponse> {
    return this.fetchTagsStats(APP_API_PATHS.stats.tags, undefined, '/stats/tags');
  }

  /** Raw GET /stats/room-tags?location_id= (room / overview scope). */
  async getRoomTagsStats(locationId: number): Promise<TagsStatsResponse> {
    return this.fetchTagsStats(APP_API_PATHS.stats.roomTags, {
      location_id: String(locationId),
    }, '/stats/room-tags');
  }

  async getActiveTagCounts(): Promise<{ g: number; s: number }> {
    return parseActiveTagCounts(await this.getTagsStats());
  }

  async getRoomActiveTagCounts(locationId?: number): Promise<{ g: number; s: number }> {
    const id = locationId ?? (await this.resolveLocationId());
    return parseActiveTagCounts(await this.getRoomTagsStats(id));
  }

  /** Farm dashboard Current Inventory — active G-tags. */
  async getCurrentInventoryGCount(): Promise<number> {
    const { g } = await this.getActiveTagCounts();
    return g;
  }

  /** Farm dashboard Current Inventory — active S-tags. */
  async getCurrentInventorySCount(): Promise<number> {
    const { s } = await this.getActiveTagCounts();
    return s;
  }

  /** Room overview Current Inventory — active G-tags. */
  async getRoomCurrentInventoryGCount(locationId?: number): Promise<number> {
    const { g } = await this.getRoomActiveTagCounts(locationId);
    return g;
  }

  /** Room overview Current Inventory — active S-tags. */
  async getRoomCurrentInventorySCount(locationId?: number): Promise<number> {
    const { s } = await this.getRoomActiveTagCounts(locationId);
    return s;
  }
}
