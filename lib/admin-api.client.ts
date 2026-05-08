/**
 * Admin API client: login to get token, then call APIs with Cookie header.
 * Cookie value format: Authorization="bearer <access_token>"
 */
import { ADMIN_API, type AdminLoginResponse } from '@/configs/admin-api.js';
import { buildLastSeenAtString } from '@/lib/helpers.js';

const ANIMAL_ADMIN_LIST_PATH = '/admin/AnimalGroupAdmin/AnimalAdmin/list';

/** Status filter for animal list (poor, normal, sub-optimal; API may support more). */
export type AnimalListStatus = 'poor' | 'normal' | 'sub-optimal';

export class AdminApiClient {
  private baseUrl: string;
  private username: string;
  private password: string;
  private accessToken: string | null = null;
  private tokenType: string = 'bearer';

  constructor(options?: { baseUrl?: string; username?: string; password?: string }) {
    this.baseUrl = options?.baseUrl ?? ADMIN_API.baseUrl;
    this.username = options?.username ?? process.env.ADMIN_USER ?? '';
    this.password = options?.password ?? process.env.ADMIN_PASS ?? '';
  }

  /**
   * POST to login endpoint; store data.access_token and data.token_type.
   * Throws if login fails or data.access_token is missing.
   */
  async login(): Promise<void> {
    if (!this.baseUrl) {
      throw new Error('Admin API: ADMIN_URL is not set in .env');
    }
    const url = ADMIN_API.loginUrl;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: this.username, password: this.password }),
    });
    const text = await res.text();
    let body: AdminLoginResponse;
    try {
      body = (text ? JSON.parse(text) : {}) as AdminLoginResponse;
    } catch {
      throw new Error(
        `Admin API login returned invalid JSON (${res.status}). URL: ${url}. Body: ${text.slice(0, 200)}. Check ADMIN_URL in .env.`,
      );
    }
    if (!res.ok) {
      throw new Error(
        `Admin API login failed (${res.status}): ${body.msg ?? res.statusText}. URL: ${url}. Check ADMIN_URL in .env (use base only, e.g. https://api.staging.xiot.com.au).`,
      );
    }
    if (body.code !== 0 || body.status !== 0) {
      throw new Error(`Admin API login error: ${body.msg ?? 'unknown'}`);
    }
    const token = body.data?.access_token;
    if (!token) {
      throw new Error('Admin API login: response missing data.access_token');
    }
    this.accessToken = token;
    this.tokenType = body.data?.token_type ?? 'bearer';
  }

  /**
   * Build Cookie header value: Authorization="bearer <access_token>"
   */
  private getCookieHeader(): string {
    if (!this.accessToken) {
      throw new Error('Admin API: not logged in; call login() first');
    }
    return `Authorization="${this.tokenType} ${this.accessToken}"`;
  }

  /**
   * GET request with Cookie: Authorization="bearer <access_token>"
   * @param path - e.g. /admin/AnimalGroupAdmin/AnimalAdmin/list
   * @param params - query params (e.g. { page: 1, perPage: 10 })
   */
  async get<T = unknown>(
    path: string,
    params?: Record<string, string | number>,
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new Error('Admin API: ADMIN_URL is not set in .env');
    }
    const url = new URL(path.startsWith('http') ? path : `${this.baseUrl}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, String(v));
      }
    }
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Cookie: this.getCookieHeader(),
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Admin API GET ${path} failed (${res.status}): ${text.slice(0, 200)}`);
    }
    return res.json() as Promise<T>;
  }

  /**
   * POST request with Cookie: Authorization="bearer <access_token>".
   * Use for list/search endpoints that return 405 for GET (e.g. AnimalAdmin/list).
   * @param path - e.g. /admin/AnimalGroupAdmin/AnimalAdmin/list
   * @param body - JSON body (e.g. { page: 1, perPage: 10, location__identifier, last_seen_at })
   */
  async post<T = unknown>(path: string, body?: Record<string, unknown>): Promise<T> {
    if (!this.baseUrl) {
      throw new Error('Admin API: ADMIN_URL is not set in .env');
    }
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Cookie: this.getCookieHeader(),
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Admin API POST ${path} failed (${res.status}): ${text.slice(0, 200)}`);
    }
    return res.json() as Promise<T>;
  }

  /**
   * Get animals for "This Week" (last_seen_at range).
   * Use in Overview specs to align test with Admin API; errors are ignored in specs.
   * @param options.method - HTTP method; default 'GET'.
   * @param options.status - One or more statuses: 'poor' | 'normal' | 'sub-optimal'; pass array to filter by multiple in one call; omit for Onboarded.
   */
  async getAnimalsThisWeek(options?: {
    method?: 'GET' | 'POST';
    status?: AnimalListStatus | AnimalListStatus[];
  }): Promise<unknown> {
    const method = options?.method ?? 'GET';
    const locationIdentifier = process.env.APP_LOCATION_IDENTIFIER ?? '';
    const lastSeenAt = buildLastSeenAtString();
    const statuses: AnimalListStatus[] =
      options?.status == null
        ? []
        : Array.isArray(options.status)
          ? options.status
          : [options.status];
    const statusPayload =
      statuses.length === 0 ? {} : { status: statuses };
    const body: Record<string, unknown> = {
      page: 1,
      perPage: 10,
      last_seen_at: lastSeenAt,
      ...(locationIdentifier && { location__identifier: locationIdentifier }),
      ...statusPayload,
    };
    if (method === 'GET') {
      const params: Record<string, string | number> = {};
      for (const [k, v] of Object.entries(body)) {
        if (v === undefined || v === null) continue;
        if (typeof v === 'string' || typeof v === 'number') {
          params[k] = v;
        } else if (Array.isArray(v)) {
          params[k] = v.join(',');
        }
      }
      return this.get<unknown>(ANIMAL_ADMIN_LIST_PATH, params);
    }
    return this.post<unknown>(ANIMAL_ADMIN_LIST_PATH, body);
  }

  /**
   * Parse count/total from list response (shared by getAnimalsTotal and getAnimalsCountByStatus).
   * Tries common shapes: count, total, data.total, data.count (dashboard uses result + count).
   */
  private parseCountFromListResponse(res: unknown): number | null {
    if (res == null || typeof res !== 'object') return null;
    const o = res as Record<string, unknown>;
    if (typeof o.count === 'number') return o.count;
    if (typeof o.total === 'number') return o.total;
    const data = o.data as Record<string, unknown> | undefined;
    if (data != null) {
      if (typeof data.total === 'number') return data.total;
      if (typeof data.count === 'number') return data.count;
    }
    return null;
  }

  /**
   * Get total animal count (current location, all statuses: poor, normal, sub-optimal).
   * Use in Barn Layout spec to compare zone total with Admin API.
   * @returns Total count from list response, or null if request fails or response has no count/total field.
   */
  async getAnimalsTotal(): Promise<number | null> {
    try {
      const res = await this.getAnimalsThisWeek({
        method: 'POST',
        status: ['poor', 'normal', 'sub-optimal'],
      });
      return this.parseCountFromListResponse(res);
    } catch {
      return null;
    }
  }

  /**
   * Get animal count for a single status (current location).
   * Use in Barn Layout spec to compare popup totals per status with Admin.
   * @returns Count from list response, or null if request fails or response has no count/total field.
   */
  async getAnimalsCountByStatus(status: AnimalListStatus): Promise<number | null> {
    try {
      const res = await this.getAnimalsThisWeek({ method: 'POST', status });
      return this.parseCountFromListResponse(res);
    } catch {
      return null;
    }
  }

  /**
   * Get animal count for a given zone/pen and status (current location).
   * Requires Admin API to support zone/pen filter (e.g. pen__name). Returns null if not supported or request fails.
   * @returns Count from list response, or null if API does not support per-zone or request fails.
   */
  async getAnimalsCountByZoneAndStatus(
    zoneNameOrId: string,
    status: AnimalListStatus,
  ): Promise<number | null> {
    try {
      const locationIdentifier = process.env.APP_LOCATION_IDENTIFIER ?? '';
      const lastSeenAt = buildLastSeenAtString();
      const body: Record<string, unknown> = {
        page: 1,
        perPage: 10,
        last_seen_at: lastSeenAt,
        ...(locationIdentifier && { location__identifier: locationIdentifier }),
        status,
        pen__name: zoneNameOrId,
      };
      const res = await this.post<unknown>(ANIMAL_ADMIN_LIST_PATH, body);
      return this.parseCountFromListResponse(res);
    } catch {
      return null;
    }
  }
}
