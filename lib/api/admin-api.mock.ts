/**
 * Mock Admin API client for E2E tests. Returns values set from UI (no real API calls).
 * Use in Barn Layout tests to assert popup counts without calling Admin API.
 */
import type { AnimalListStatus } from './admin-api.client.js';

export interface MockAdminApiTotals {
  normal: number;
  subOptimal: number;
  poor: number;
}

export interface MockAdminApiZoneRow {
  zoneName: string;
  normal: number;
  subOptimal: number;
  poor: number;
}

/**
 * Mock that implements the Admin API methods used by Barn Layout specs.
 * Set totals from UI before asserting so expected === mock (test passes without real API).
 */
export class MockAdminApiClient {
  private totalsByStatus: MockAdminApiTotals = { normal: 0, subOptimal: 0, poor: 0 };
  private zoneMap = new Map<string, MockAdminApiTotals>();

  setTotalsByStatus(totals: MockAdminApiTotals): void {
    this.totalsByStatus = { ...totals };
  }

  setZoneTotals(zones: MockAdminApiZoneRow[]): void {
    this.zoneMap.clear();
    for (const z of zones) {
      this.zoneMap.set(z.zoneName, {
        normal: z.normal,
        subOptimal: z.subOptimal,
        poor: z.poor,
      });
    }
  }

  async getAnimalsCountByStatus(_status: AnimalListStatus): Promise<number | null> {
    const key = _status === 'sub-optimal' ? 'subOptimal' : _status === 'normal' ? 'normal' : 'poor';
    return this.totalsByStatus[key];
  }

  async getAnimalsCountByZoneAndStatus(
    zoneName: string,
    status: AnimalListStatus,
  ): Promise<number | null> {
    const row = this.zoneMap.get(zoneName);
    if (!row) return null;
    const key = status === 'sub-optimal' ? 'subOptimal' : status === 'normal' ? 'normal' : 'poor';
    return row[key];
  }

  async getAnimalsTotal(): Promise<number | null> {
    return (
      this.totalsByStatus.normal + this.totalsByStatus.subOptimal + this.totalsByStatus.poor
    );
  }
}
