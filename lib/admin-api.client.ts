/**
 * Admin API client: login to get token, then call APIs with Cookie header.
 * Cookie value format: Authorization="bearer <access_token>"
 */
import { ADMIN_API, type AdminLoginResponse } from '@/configs/admin-api.js';

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
    const body = (await res.json()) as AdminLoginResponse;
    if (!res.ok) {
      throw new Error(`Admin API login failed (${res.status}): ${body.msg ?? res.statusText}`);
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
}
