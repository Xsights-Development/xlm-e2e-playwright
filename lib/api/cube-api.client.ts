/**
 * Cube.js client — POST /load with token from REST POST /cube/token.
 * @see docs/e2e/api-and-cube.md §6
 */
import { CUBE_API, type CubeLoadResponse, type CubeQuery } from '@/configs/cube-api.js';
import type { AppApiClient } from '@/lib/api/app-api.client.js';

export class CubeApiClient {
  private apiUrl: string;
  private token: string;

  constructor(apiUrl: string, token: string) {
    this.apiUrl = apiUrl.replace(/\/+$/, '');
    this.token = token;
  }

  /** Login via App API, then issue Cube token (`type: backend` — same as layout bootstrap). */
  static async fromAppApi(appApi: AppApiClient): Promise<CubeApiClient> {
    if (!CUBE_API.baseUrl) {
      throw new Error('Cube API: CUBE_API_URL is not set in .env');
    }
    const token = await appApi.getCubeToken('backend');
    return new CubeApiClient(CUBE_API.baseUrl, token);
  }

  /**
   * POST {CUBE_API_URL}/load — same query JSON the UI sends via @cubejs-client.
   */
  async load(query: CubeQuery): Promise<CubeLoadResponse> {
    const res = await fetch(CUBE_API.loadUrl, {
      method: 'POST',
      headers: {
        Authorization: this.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const text = await res.text();
    let body: CubeLoadResponse;
    try {
      body = (text ? JSON.parse(text) : {}) as CubeLoadResponse;
    } catch {
      throw new Error(
        `Cube load invalid JSON (${res.status}). URL: ${CUBE_API.loadUrl}. Body: ${text.slice(0, 300)}`,
      );
    }

    if (!res.ok) {
      throw new Error(
        `Cube load failed (${res.status}): ${body.error ?? text.slice(0, 300)}`,
      );
    }

    return body;
  }

  /**
   * Pivot rows (same shape as @cubejs-client resultSet.tablePivot()).
   * Cube REST v1 returns rows under results[0].data, not top-level data.
   */
  tablePivot(loadResponse: CubeLoadResponse): Record<string, unknown>[] {
    const fromResults = loadResponse.results?.[0]?.data;
    if (Array.isArray(fromResults)) {
      return fromResults as Record<string, unknown>[];
    }
    const fromRoot = loadResponse.data;
    if (Array.isArray(fromRoot)) {
      return fromRoot as Record<string, unknown>[];
    }
    return [];
  }
}
