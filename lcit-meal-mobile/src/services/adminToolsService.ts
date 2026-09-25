/**
 * Admin Tools Service
 * Kích hoạt thủ công các job hệ thống (Auto-schedule, Meal Completion)
 */

import { apiClient } from './apiClient';

export interface AdminToolResult {
  message?: string;
  count?: number;
  [key: string]: unknown;
}

export const adminToolsService = {
  /**
   * Chạy job tự động sinh lịch ăn và đăng ký cho tháng: POST /api/admin-tools/run-auto-schedule?month=YYYY-MM
   */
  async runAutoSchedule(month?: string, useMock = false): Promise<AdminToolResult> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 800));
      return {
        message: `Đã sinh lịch và đăng ký ăn tự động thành công cho tháng ${month || 'hiện tại'}.`,
      };
    }
    const query = month ? `?month=${month}` : '';
    return await apiClient<AdminToolResult>(`/admin-tools/run-auto-schedule${query}`, {
      method: 'POST',
    });
  },

  /**
   * Chạy job chốt hoàn thành suất ăn: POST /api/admin-tools/run-meal-completion?date=YYYY-MM-DD
   */
  async runMealCompletion(date?: string, useMock = false): Promise<AdminToolResult> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 800));
      return {
        message: `Đã chốt trạng thái hoàn thành (completed) cho các suất ăn ngày ${date || 'hôm nay'}.`,
      };
    }
    const query = date ? `?date=${date}` : '';
    return await apiClient<AdminToolResult>(`/admin-tools/run-meal-completion${query}`, {
      method: 'POST',
    });
  },
};
