import { test as base } from '@playwright/test';
import { AdminApiClient } from '@/lib/admin-api.client.js';

type AdminApiFixtures = {
  /** Admin API client; already logged in. Use for comparing webapp data with Admin API (e.g. adminApi.get('/admin/...')). */
  adminApi: AdminApiClient;
};

export const test = base.extend<AdminApiFixtures>({
  adminApi: async ({}, use) => {
    const client = new AdminApiClient();
    await client.login();
    await use(client);
  },
});

export { expect } from '@playwright/test';
