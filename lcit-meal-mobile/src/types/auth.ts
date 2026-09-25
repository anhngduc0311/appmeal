/**
 * Types - Authentication and Users
 * Khớp với Role.js và schema qlsa.sql
 */

export type UserRole = 'admin' | 'manager' | 'employee' | 'kitchen';

export type UserStatus = 'active' | 'inactive' | 'locked';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  status: UserStatus;
  roles?: UserRole[];
  role?: UserRole; // Main primary role
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
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}
