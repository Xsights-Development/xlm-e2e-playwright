import type { ActiveTagCounts, TagsStatsResponse } from '@/configs/app-api.js';

const XIOT_G = 'xiot-g';
const XIOT_S = 'xiot-s';

/**
 * Extract active G/S counts from GET /stats/tags payload.
 * @see xahwm_api/api/v1/statistic.py tags()
 */
export function parseActiveTagCounts(payload: TagsStatsResponse): ActiveTagCounts {
  let g = 0;
  let s = 0;

  for (const block of payload.data ?? []) {
    const tags = block.active_tags;
    if (!Array.isArray(tags)) continue;

    for (const entry of tags) {
      if (XIOT_G in entry) {
        g = Number(entry[XIOT_G]) || 0;
      }
      if (XIOT_S in entry) {
        s = Number(entry[XIOT_S]) || 0;
      }
    }
  }

  return { g, s };
}
