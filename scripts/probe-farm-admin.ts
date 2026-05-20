/**
 * Verify Admin farm + manager oracles. Run: npx tsx scripts/probe-farm-admin.ts
 */
import 'dotenv/config';
import { AdminApiClient } from '../lib/admin-api.client.js';

async function main(): Promise<void> {
  const farmKey =
    process.env.APP_FARM_IDENTIFIER ?? process.env.APP_FARM ?? '6';
  const managerId = process.env.DEBUG_MANAGER_ID ?? '25';

  const client = new AdminApiClient();
  await client.login();
  console.log('[Admin] Login OK');

  try {
    const farmId = await client.resolveFarmAdminId(farmKey);
    console.log('[Farm] admin id:', farmId);
    const detail = await client.getFarmDetailById(farmId);
    console.log('[Farm] item:', JSON.stringify({ id: detail.id, name: detail.name, manager_id: detail.manager_id }));
    const name = await client.getFarmNameByIdentifier(farmKey);
    console.log('[Farm] oracle name:', name);
  } catch (e) {
    console.error('[Farm]', e);
  }

  try {
    const username = await client.getManagerUsernameById(managerId);
    console.log('[Manager] oracle username for id', managerId, ':', username);
  } catch (e) {
    console.error('[Manager]', e);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
