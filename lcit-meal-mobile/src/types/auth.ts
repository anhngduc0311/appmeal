/**
 * Types - Authentication and Users
 * Khớp với Role.js, User.js và schema database
 */

export type UserRole = 'admin' | 'manager' | 'employee' | 'kitchen';

export type UserStatus = 'active' | 'inactive' | 'locked' | 'deleted' | string | number;

export interface RoleObject {
  id: number;
  displayName?: string;
  code: UserRole;
  description?: string;
  status?: string;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  status: UserStatus;
  roles?: (RoleObject | UserRole)[];
  role?: UserRole; // Normalized primary role
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponsePayload {
  user: User;
  token?: string;
  accessToken?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  password?: string;
  currentPassword?: string;
  email?: string;
  phone?: string;
}

export interface CreateUserRequest {
  fullName: string;
  username: string;
  password?: string;
  roleId?: number;
  status?: string | number;
  email?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  password?: string;
  roleId?: number;
  status?: string | number;
  email?: string;
  phone?: string;
}

export interface UserFilterParams {
  query?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface UserAvailabilityResponse {
  available: boolean;
  message?: string;
}

/**
 * Trích xuất role chuẩn từ đối tượng User (hỗ trợ cả mảng chuỗi và mảng RoleObject từ backend)
 */
export function extractUserRole(user: User | null | undefined): UserRole {
  if (!user) return 'employee';
  if (user.role) return user.role;

  if (Array.isArray(user.roles) && user.roles.length > 0) {
    const firstRole = user.roles[0];
    if (typeof firstRole === 'string') {
      return firstRole as UserRole;
    }
    if (typeof firstRole === 'object' && firstRole !== null && 'code' in firstRole) {
      return (firstRole as RoleObject).code;
    }
  }

  return 'employee';
}
