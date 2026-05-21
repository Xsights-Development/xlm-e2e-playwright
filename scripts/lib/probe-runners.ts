/**
 * Probe command implementations (App API, Cube, Admin).
 */
import { AdminApiClient } from '@/lib/api/admin-api.client.js';
import { ADMIN_API } from '@/configs/admin-api.js';
import { CUBE_COMPONENT_KEYS } from '@/configs/cube-api.js';
import { buildFarmTagsDeployedQuery } from '@/configs/cube-queries.js';
import {
  getFarmHealthAlertsFromCube,
  getFarmHealthEventsFromCube,
} from '@/lib/cube/dashboard/oracles.js';
import { loadFarmCubeContext } from '@/lib/cube/dashboard/context.js';
import { buildLastSeenAtString } from '@/lib/helpers.js';
import {
  createAppAndCube,
  createAppApiLoggedIn,
  logAdminEnv,
  logAppCubeEnv,
} from '@/scripts/lib/probe-shared.js';

const LIST_PATH = '/admin/AnimalGroupAdmin/AnimalAdmin/list';

export async function probeAdmin(): Promise<void> {
  logAdminEnv();
  const client = new AdminApiClient();
  await client.login();
  console.log('[Admin API] POST', ADMIN_API.loginUrl, '-> Login OK');

  const locationIdentifier = process.env.APP_LOCATION_IDENTIFIER ?? '';
  const bodyParams: Record<string, string | number> = {
    page: 1,
    perPage: 10,
    last_seen_at: buildLastSeenAtString(),
  };
  if (locationIdentifier) {
    bodyParams.location__identifier = locationIdentifier;
  }

  const body = await client.post<unknown>(LIST_PATH, bodyParams);
  console.log('[Admin API] POST', ADMIN_API.baseUrl + LIST_PATH, '-> 200');
  const bodyStr = JSON.stringify(body, null, 2);
  console.log(bodyStr.length > 2000 ? `${bodyStr.slice(0, 2000)}\n...` : bodyStr);
}

export async function probeFarmAdmin(): Promise<void> {
  const farmKey = process.env.APP_FARM_IDENTIFIER ?? process.env.APP_FARM ?? '6';
  const managerId = process.env.DEBUG_MANAGER_ID ?? '25';

  logAdminEnv();
  const client = new AdminApiClient();
  await client.login();
  console.log('[Admin] Login OK');

  try {
    const farmId = await client.resolveFarmAdminId(farmKey);
    console.log('[Farm] admin id:', farmId);
    const detail = await client.getFarmDetailById(farmId);
    console.log(
      '[Farm] item:',
      JSON.stringify({ id: detail.id, name: detail.name, manager_id: detail.manager_id }),
    );
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

export async function probeInventory(): Promise<void> {
  logAppCubeEnv();
  const client = await createAppApiLoggedIn();
  const stats = await client.getTagsStats();
  const { g, s } = await client.getActiveTagCounts();
  console.log('[App API] active_tags block:', JSON.stringify(stats.data?.[0]?.active_tags));
  console.log('[Inventory] G-tags (xiot-g):', g);
  console.log('[Inventory] S-tags (xiot-s):', s);
}

export async function probeCube(): Promise<void> {
  const { app, cube } = await createAppAndCube();
  const ctx = await loadFarmCubeContext(app);
  const query = buildFarmTagsDeployedQuery({
    farmIdentifier: ctx.farmIdentifier,
    dateRange: ctx.dateRange,
    timezone: ctx.timezone,
  });
  const result = await cube.load(query);
  const rows = cube.tablePivot(result);
  console.log(`[Cube] ${CUBE_COMPONENT_KEYS.farm.tagsDeployed} rows:`, rows.length);
  console.log('[Cube] dateRange:', ctx.dateRange);
  if (rows[0]) {
    console.log('[Cube] sample row:', JSON.stringify(rows[0]));
  }
}

export async function probeHealth(): Promise<void> {
  const { app, cube } = await createAppAndCube();
  const alerts = await getFarmHealthAlertsFromCube(app, cube);
  console.log(
    `[Cube] ${CUBE_COMPONENT_KEYS.farm.healthAlerts}:`,
    JSON.stringify(alerts, null, 2),
  );
  const events = await getFarmHealthEventsFromCube(app, cube);
  console.log(
    `[Cube] ${CUBE_COMPONENT_KEYS.farm.healthAlertResponses}:`,
    JSON.stringify(events, null, 2),
  );
}

export async function probeAll(): Promise<void> {
  await probeInventory();
  console.log('---');
  await probeCube();
  console.log('---');
  await probeHealth();
}
