/**
 * Admin API paths for Farm dashboard E2E oracles.
 * Item routes: GET .../item/{id} (see fixtures/oracles/*.json).
 */
export const ADMIN_FARM_PATHS = {
  farmList: '/admin/FarmGroupAdmin/FarmAdmin/list',
  /** GET /admin/FarmGroupAdmin/FarmAdmin/item/{farmId} */
  farmItem: '/admin/FarmGroupAdmin/FarmAdmin/item',
  /** GET /admin/auth/XAHWMUserAdmin/item/{managerId} */
  managerItem: '/admin/auth/XAHWMUserAdmin/item',
} as const;

export const ORACLE_SPEC_IDS = {
  farmName: 'farm-detail-name',
  farmManager: 'farm-detail-manager',
} as const;

export type AdminFarmListItem = {
  id: number;
  name: string;
  identifier?: string;
  status?: string;
  client_id?: number;
  client__name?: string;
  manager_id?: number;
  [key: string]: unknown;
};

export type AdminFarmDetail = AdminFarmListItem & {
  manager_id?: number;
  lat_position?: number;
  long_position?: number;
  address?: string;
  [key: string]: unknown;
};

export type AdminUserDetail = {
  id: number;
  username: string;
  email?: string;
  is_active?: boolean;
  [key: string]: unknown;
};
