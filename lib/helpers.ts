/**
 * Shared helpers for E2E (specs, page objects, API client).
 */

// --- Admin API last_seen_at ---

/** Format date as YYYY-MM-DD HH:mm:ss for Admin API last_seen_at. */
export function formatDateTime(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}:${s}`;
}

/** Range for last_seen_at: today 00:00:00 -> tomorrow 23:00:00 */
export function getLastSeenAtRange(): { start: string; end: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 0, 0, 0);
  return { start: formatDateTime(today), end: formatDateTime(tomorrow) };
}

/** Build last_seen_at string: "[-]start,end" */
export function buildLastSeenAtString(): string {
  const { start, end } = getLastSeenAtRange();
  return `[-]${start},${end}`;
}

// --- Barn Layout / zone diagram ---

const ZONE_ROW_RE = /Normal=(\d+),\s*Sub-optimal=(\d+),\s*Poor=(\d+)/;

/**
 * Parse zone diagram row strings "ZoneName: Normal=X, Sub-optimal=Y, Poor=Z"
 * and return sum of all zone totals (X + Y + Z per row, summed).
 */
export function sumZoneDiagramTotals(zoneDiagramRows: string[]): number {
  let total = 0;
  for (const row of zoneDiagramRows) {
    const m = row.match(ZONE_ROW_RE);
    if (m) total += parseInt(m[1], 10) + parseInt(m[2], 10) + parseInt(m[3], 10);
  }
  return total;
}

/**
 * Parse zone diagram row strings "ZoneName: Normal=X, Sub-optimal=Y, Poor=Z"
 * and return totals by status (summed across all zones).
 */
export function getZoneDiagramTotalsByStatus(zoneDiagramRows: string[]): {
  normal: number;
  subOptimal: number;
  poor: number;
} {
  let normal = 0;
  let subOptimal = 0;
  let poor = 0;
  for (const row of zoneDiagramRows) {
    const m = row.match(ZONE_ROW_RE);
    if (m) {
      normal += parseInt(m[1], 10);
      subOptimal += parseInt(m[2], 10);
      poor += parseInt(m[3], 10);
    }
  }
  return { normal, subOptimal, poor };
}

/**
 * Parse zone diagram row strings "ZoneName: Normal=X, Sub-optimal=Y, Poor=Z"
 * and return per-zone breakdown.
 */
export function parseZoneDiagramRows(zoneDiagramRows: string[]): Array<{
  zoneName: string;
  normal: number;
  subOptimal: number;
  poor: number;
}> {
  const re = /^(.+?):\s*Normal=(\d+),\s*Sub-optimal=(\d+),\s*Poor=(\d+)$/;
  const result: Array<{ zoneName: string; normal: number; subOptimal: number; poor: number }> = [];
  for (const row of zoneDiagramRows) {
    const m = row.match(re);
    if (m) {
      result.push({
        zoneName: m[1].trim(),
        normal: parseInt(m[2], 10),
        subOptimal: parseInt(m[3], 10),
        poor: parseInt(m[4], 10),
      });
    }
  }
  return result;
}
