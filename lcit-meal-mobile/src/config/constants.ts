/**
 * Application Business Constants
 * Đồng bộ với backend lcit-meal-api constants
 */

import { UserRole } from '../types';

export const ROLES: Record<string, UserRole> = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  KITCHEN: 'kitchen',
};

export const STAFF_ROLES: UserRole[] = ['admin', 'manager', 'employee'];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Quản trị viên',
  manager: 'Quản lý bếp / HC',
  employee: 'Nhân viên',
  kitchen: 'Nhân viên bếp',
};

export const MEAL_REGISTRATION_STATUS_LABELS = {
  confirmed: 'Đã đăng ký',
  pending: 'Chờ xử lý',
  completed: 'Đã dùng bữa',
  cancelled: 'Đã cắt suất',
};

export const MEAL_OPTION_TYPE_LABELS = {
  cancel_today: 'Cắt suất hôm nay',
  cancel_schedule: 'Cắt suất theo khoảng ngày',
  cancel_permanent: 'Cắt suất dài hạn',
};

export const MEAL_OPTION_STATUS_LABELS = {
  approved: 'Đã duyệt cắt',
  pending: 'Chờ duyệt',
  rejected: 'Bị từ chối',
};

export const PAYMENT_STATUS_LABELS = {
  unpaid: 'Chưa thanh toán',
  paid: 'Đã thanh toán',
  overdue: 'Quá hạn thanh toán',
};

export const MAX_GUEST_COUNT = 10;
export const MIN_GUEST_COUNT = 0;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'lcit_meal_auth_token',
  USER_DATA: 'lcit_meal_user_data',
  USE_MOCK_DATA: 'lcit_meal_use_mock_data',
  API_URL_OVERRIDE: 'lcit_meal_api_url_override',
};
