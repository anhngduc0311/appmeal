/**
 * User Service (Admin & Manager)
 * Quản lý danh sách người dùng, vai trò, thêm/sửa tài khoản, kiểm tra trùng username
 */

import { apiClient, extractDataList } from './apiClient';
import { mockStore } from './mockStore';
import {
  User,
  RoleObject,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilterParams,
  UserAvailabilityResponse,
  PaginatedData,
} from '../types';

export const userService = {
  /**
   * Lấy danh sách toàn bộ người dùng: GET /api/users
   */
  async list(useMock = true): Promise<User[]> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return mockStore.getAllUsers();
    }
    const res = await apiClient<User[] | PaginatedData<User>>('/users');
    return extractDataList<User>(res);
  },

  /**
   * Lọc và tìm kiếm người dùng: GET /api/users/filter
   */
  async filter(params: UserFilterParams, useMock = true): Promise<User[]> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      let users = mockStore.getAllUsers();
      if (params.query) {
        const q = params.query.toLowerCase();
        users = users.filter(
          (u) =>
            u.fullName.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q) ||
            (u.email && u.email.toLowerCase().includes(q)) ||
            (u.phone && u.phone.includes(q))
        );
      }
      if (params.role) {
        users = users.filter(
          (u) => u.role === params.role || (Array.isArray(u.roles) && u.roles.some((r) => (typeof r === 'string' ? r : r.code) === params.role))
        );
      }
      if (params.status) {
        users = users.filter((u) => String(u.status) === String(params.status));
      }
      return users;
    }

    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', String(params.status));
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));

    const res = await apiClient<User[] | PaginatedData<User>>(`/users/filter?${queryParams.toString()}`);
    return extractDataList<User>(res);
  },

  /**
   * Lấy chi tiết người dùng: GET /api/users/:id
   */
  async get(id: number, useMock = true): Promise<User> {
    if (useMock) {
      const user = mockStore.getAllUsers().find((u) => u.id === id);
      if (!user) throw new Error('Không tìm thấy người dùng');
      return user;
    }
    return await apiClient<User>(`/users/${id}`);
  },

  /**
   * Kiểm tra tính khả dụng của tên đăng nhập: GET /api/users/availability (Admin only)
   */
  async checkAvailability(
    username: string,
    excludeId?: number,
    useMock = true
  ): Promise<UserAvailabilityResponse> {
    if (useMock) {
      const exists = mockStore
        .getAllUsers()
        .some((u) => u.username.toLowerCase() === username.toLowerCase() && u.id !== excludeId);
      return { available: !exists, message: exists ? 'Tên đăng nhập đã tồn tại trong hệ thống' : 'Tên đăng nhập hợp lệ' };
    }
    const params = new URLSearchParams();
    params.append('username', username);
    if (excludeId) params.append('excludeId', String(excludeId));

    return await apiClient<UserAvailabilityResponse>(`/users/availability?${params.toString()}`);
  },

  /**
   * Tạo người dùng mới: POST /api/users (Admin only)
   */
  async create(data: CreateUserRequest, useMock = true): Promise<User> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 300));
      return mockStore.createUser(data);
    }
    return await apiClient<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cập nhật thông tin/vai trò người dùng: PUT /api/users/:id (Admin only)
   */
  async update(id: number, data: UpdateUserRequest, useMock = true): Promise<User> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 300));
      const updated = mockStore.updateUser(id, data);
      if (!updated) throw new Error('Cập nhật người dùng thất bại');
      return updated;
    }
    return await apiClient<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Xóa người dùng: DELETE /api/users/:id (Admin only)
   */
  async delete(id: number, useMock = true): Promise<void> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 300));
      mockStore.deleteUser(id);
      return;
    }
    await apiClient(`/users/${id}`, { method: 'DELETE' });
  },

  /**
   * Lấy danh sách các vai trò hệ thống: GET /api/roles
   */
  async getRoles(useMock = true): Promise<RoleObject[]> {
    if (useMock) {
      return [
        { id: 1, code: 'admin', displayName: 'Quản trị viên', description: 'Toàn quyền cấu hình và quản trị hệ thống' },
        { id: 2, code: 'manager', displayName: 'Quản lý bếp', description: 'Quản lý lịch ăn, duyệt cắt suất và theo dõi thanh toán' },
        { id: 3, code: 'employee', displayName: 'Cán bộ nhân viên', description: 'Đăng ký suất ăn, báo cắt và xem thanh toán cá nhân' },
        { id: 4, code: 'kitchen', displayName: 'Nhân viên bếp', description: 'Xem tổng suất ăn cần chuẩn bị hàng ngày' },
      ];
    }
    const res = await apiClient<RoleObject[] | PaginatedData<RoleObject>>('/roles');
    return extractDataList<RoleObject>(res);
  },
};
