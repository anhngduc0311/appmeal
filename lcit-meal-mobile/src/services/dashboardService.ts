/**
 * Dashboard Service
 * Lấy dữ liệu tổng quan quản lý và biểu đồ theo chu kỳ (Tuần / Tháng / Năm)
 */

import { apiClient } from './apiClient';
import { mockStore } from './mockStore';
import { DashboardHomeData, DashboardChartResponse } from '../types';

export const dashboardService = {
  /**
   * Lấy dữ liệu tổng quan trang chủ quản lý: GET /api/dashboard/home
   */
  async getHome(useMock = true): Promise<DashboardHomeData> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return mockStore.getDashboardHome();
    }
    return await apiClient<DashboardHomeData>('/dashboard/home');
  },

  /**
   * Lấy biểu đồ theo chu kỳ: GET /api/dashboard/chart?period=week|month|year&date=YYYY-MM-DD
   */
  async getChart(
    period: 'week' | 'month' | 'year' = 'week',
    date?: string,
    useMock = true
  ): Promise<DashboardChartResponse> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return mockStore.getDashboardChart(period, date);
    }
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (date) params.append('date', date);

    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiClient<DashboardChartResponse>(`/dashboard/chart${query}`);
  },
};
