/**
 * Admin API config and types.
 * Used for data validation: compare webapp (xahwm-dashboard) with Admin API.
 * Login: POST /admin/auth/form/login/api → then call other APIs with Cookie: Authorization="bearer <token>"
 */

const raw = (process.env.ADMIN_URL ?? '').trim().replace(/\/+$/, '');
// Avoid double /admin: if env is "https://host/admin", baseUrl becomes "https://host"
const baseUrl = raw.replace(/\/admin\/?$/, '');
export const ADMIN_API = {
  baseUrl,
  loginPath: '/admin/auth/form/login/api',
  get loginUrl(): string {
    return `${this.baseUrl}${this.loginPath}`;
  },
} as const;

/** Login response from POST /admin/auth/form/login/api */
export interface AdminLoginResponse {
  status: number;
  msg: string;
  code: number;
  data: {
    email: string;
    password: string;
    username: string;
    delete_time: string | null;
    update_time: string;
    create_time: string;
    id: number;
    is_active: boolean;
    nickname: string | null;
    avatar: string | null;
    token_type: string;
    access_token: string;
  };
}
