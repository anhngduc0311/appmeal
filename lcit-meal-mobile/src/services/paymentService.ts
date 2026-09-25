/**
 * Payment Service
 * Quản lý các khoản thanh toán cá nhân và thông tin tài chính
 * TUÂN THỦ GAP-01: Chỉ truy vấn /payments/me cho nhân viên, không tính tổng toàn cơ quan.
 */

import { apiClient, extractDataList } from './apiClient';
import { mockStore } from './mockStore';
import { Payment, PaymentSummary, PaginatedData } from '../types';

export const paymentService = {
  /**
   * Lấy danh sách thanh toán của tôi: GET /api/payments/me
   */
  async getMyPayments(useMock = true): Promise<Payment[]> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return mockStore.getMyPayments();
    }
    const res = await apiClient<Payment[] | PaginatedData<Payment>>('/payments/me');
    return extractDataList<Payment>(res);
  },

  /**
   * Tính toán tóm tắt thanh toán cá nhân từ /payments/me
   */
  async getMyPaymentSummary(useMock = true): Promise<PaymentSummary> {
    const payments = await this.getMyPayments(useMock);

    let totalUnpaidAmount = 0;
    let unpaidCount = 0;
    let overdueCount = 0;
    let latestPaymentDate: string | undefined = undefined;

    for (const p of payments) {
      const isPaid = p.status === 'paid' || p.isPaid === 1 || p.isPaid === true;
      if (!isPaid) {
        totalUnpaidAmount += Number(p.amount) || 0;
        unpaidCount += 1;
        if (p.status === 'overdue') {
          overdueCount += 1;
        }
      }
      if (!latestPaymentDate || (p.paymentDate && p.paymentDate > latestPaymentDate)) {
        latestPaymentDate = p.paymentDate;
      }
    }

    return {
      totalUnpaidAmount,
      unpaidCount,
      overdueCount,
      latestPaymentDate,
    };
  },

  /**
   * Lấy toàn bộ danh sách thanh toán (Admin/Manager): GET /api/payments
   */
  async getAllPayments(useMock = true): Promise<Payment[]> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return mockStore.getAllPayments();
    }
    const res = await apiClient<Payment[] | PaginatedData<Payment>>('/payments');
    return extractDataList<Payment>(res);
  },
};
