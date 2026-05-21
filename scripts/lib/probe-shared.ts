/**
 * Shared helpers for CLI probe scripts.
 */
import { AppApiClient } from '@/lib/api/app-api.client.js';
import { CubeApiClient } from '@/lib/api/cube-api.client.js';
import { APP_API } from '@/configs/app-api.js';
import { CUBE_API } from '@/configs/cube-api.js';
import { ADMIN_API } from '@/configs/admin-api.js';

export function logAppCubeEnv(): void {
  console.log('[App API]', APP_API.baseUrl || '(unset)');
  console.log('[Cube API]', CUBE_API.baseUrl || '(unset)');
  console.log('[Farm]', APP_API.farmIdentifier || '(unset)');
}

export function logAdminEnv(): void {
  console.log('[Admin API]', ADMIN_API.baseUrl || '(unset)');
}

export async function createAppApiLoggedIn(): Promise<AppApiClient> {
  const app = new AppApiClient();
  await app.login();
  console.log('[App API] Login OK');
  return app;
}

export async function createAppAndCube(): Promise<{
  app: AppApiClient;
  cube: CubeApiClient;
  farmIdentifier: string;
}> {
  logAppCubeEnv();
  const app = await createAppApiLoggedIn();
  const farm = await app.getFarmCurrent();
  const farmIdentifier = String(farm.identifier ?? APP_API.farmIdentifier ?? '').trim();
  console.log('[App API] farms/current identifier:', farmIdentifier || '(none)');
  const cube = await CubeApiClient.fromAppApi(app);
  console.log('[Cube] Token OK');
  return { app, cube, farmIdentifier };
}

export function runProbe(main: () => Promise<void>): void {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
