/**
 * Payment Service
 * Quản lý các khoản thanh toán cá nhân và thông tin tài chính
 */

import { apiClient } from './apiClient';
import { mockStore } from './mockStore';
import { Payment } from '../types';

export const paymentService = {
  /**
   * Lấy danh sách thanh toán của tôi: GET /api/payments/me
   */
  async getMyPayments(useMock = true): Promise<Payment[]> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return mockStore.getMyPayments();
    }
    return await apiClient<Payment[]>('/payments/me');
  },

  /**
   * Lấy toàn bộ danh sách thanh toán (Admin/Manager): GET /api/payments
   */
  async getAllPayments(useMock = true): Promise<Payment[]> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return mockStore.getAllPayments();
    }
    return await apiClient<Payment[]>('/payments');
  },
};
