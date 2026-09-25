/**
 * Auth Service
 * Xử lý Đăng nhập, Đăng xuất, Lưu phiên và Cập nhật hồ sơ
 */

import { apiClient } from './apiClient';
import { mockStore } from './mockStore';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../config/constants';
import {
  User,
  LoginRequest,
  LoginResponsePayload,
  UpdateProfileRequest,
} from '../types';

export const authService = {
  /**
   * Đăng nhập
   */
  async login(credentials: LoginRequest, useMock = true): Promise<{ user: User; token: string }> {
    if (useMock) {
      // Giả lập độ trễ mạng
      await new Promise((res) => setTimeout(res, 400));
      const users = mockStore.getAllUsers();
      const matched = users.find(
        (u) =>
          u.username.toLowerCase() === credentials.username.toLowerCase()
      );

      if (!matched) {
        // Cho phép đăng nhập demo với bất kỳ user nào trong danh sách
        throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác.');
      }

      const mockToken = `mock_token_${matched.id}_${Date.now()}`;
      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);
      await storage.setObject(STORAGE_KEYS.USER_DATA, matched);
      mockStore.setCurrentUser(matched.id);

      return { user: matched, token: mockToken };
    }

    // Gọi API thật: POST /api/auth/login
    const payload = await apiClient<LoginResponsePayload>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuth: true,
    });

    const token = payload.accessToken || payload.token || '';
    const user = payload.user;

    await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    await storage.setObject(STORAGE_KEYS.USER_DATA, user);

    return { user, token };
  },

  /**
   * Đăng xuất
   */
  async logout(useMock = true): Promise<void> {
    if (!useMock) {
      try {
        await apiClient('/auth/logout', { method: 'POST' });
      } catch {
        // Bỏ qua lỗi server khi logout
      }
    }
    await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await storage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  /**
   * Khôi phục phiên đã lưu
   */
  async getStoredSession(): Promise<{ user: User | null; token: string | null }> {
    const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const user = await storage.getObject<User>(STORAGE_KEYS.USER_DATA);
    return { user, token };
  },

  /**
   * Cập nhật thông tin cá nhân: PATCH /api/users/me
   */
  async updateProfile(data: UpdateProfileRequest, useMock = true): Promise<User> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 300));
      const currentUser = mockStore.getCurrentUser();
      const updated: User = {
        ...currentUser,
        fullName: data.fullName || currentUser.fullName,
        email: data.email !== undefined ? data.email : currentUser.email,
        phone: data.phone !== undefined ? data.phone : currentUser.phone,
      };
      await storage.setObject(STORAGE_KEYS.USER_DATA, updated);
      return updated;
    }

    const updatedUser = await apiClient<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    await storage.setObject(STORAGE_KEYS.USER_DATA, updatedUser);
    return updatedUser;
  },
};
