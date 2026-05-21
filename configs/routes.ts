/**
 * Shared route paths for E2E tests.
 * Aligned with xahwm-dashboard PATH_ROUTING (route.constant.js).
 * xahwm-docs 02: E2E uses URLs without trailing slash.
 */
export const ROUTES = {
  signIn: '/sign-in',
  signUp: '/sign-up',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
  overview: '/overview',
  animalManagement: '/animal',
  /** Use with replace: ROUTES.animalDetail.replace(':tagId', tagId) */
  animalDetail: '/animal/:tagId',
  locationManagement: '/location',
  penManagement: '/pen',
  alerts: '/alerts',
  report: '/report',
  home: '/home',
} as const;

export function animalDetailUrl(tagId: string): string {
  return `/animal/${tagId}`;
}
