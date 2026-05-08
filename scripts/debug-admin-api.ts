/**
 * Standalone script to verify Admin API: login + get list.
 * Run: npm run debug:admin-api (or npx tsx scripts/debug-admin-api.ts)
 */
import 'dotenv/config';
import { AdminApiClient } from '../lib/admin-api.client.js';
import { ADMIN_API } from '../configs/admin-api.js';
import { buildLastSeenAtString } from '../lib/helpers.js';

const LIST_PATH = '/admin/AnimalGroupAdmin/AnimalAdmin/list';

async function main(): Promise<void> {
  try {
    const client = new AdminApiClient();
    const loginUrl = ADMIN_API.loginUrl;
    await client.login();
    console.log('[Admin API] POST', loginUrl, '-> Login OK');

    const locationIdentifier = process.env.APP_LOCATION_IDENTIFIER ?? '';
    const lastSeenAt = buildLastSeenAtString();
    const bodyParams: Record<string, string | number> = {
      page: 1,
      perPage: 10,
      last_seen_at: lastSeenAt,
    };
    if (locationIdentifier) {
      bodyParams['location__identifier'] = locationIdentifier;
    }

    const body = await client.post<unknown>(LIST_PATH, bodyParams as Record<string, unknown>);
    console.log('[Admin API] POST', ADMIN_API.baseUrl + LIST_PATH, '-> 200');
    const bodyStr = JSON.stringify(body, null, 2);
    console.log(bodyStr.length > 2000 ? bodyStr.slice(0, 2000) + '\n...' : bodyStr);
  } catch (err) {
    console.error('[Admin API] Error:', err);
    process.exit(1);
  }
}

main();
