/**
 * Notification Service
 * Quản lý thông báo, đếm số thông báo chưa đọc và đánh dấu đã xem
 */

import { apiClient, extractDataList } from './apiClient';
import { mockStore } from './mockStore';
import { NotificationItem, UnseenCountResponse, PaginatedData } from '../types';

export const notificationService = {
  /**
   * Lấy danh sách thông báo của tôi: GET /api/notifications/me
   */
  async getMyNotifications(useMock = true): Promise<NotificationItem[]> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return mockStore.getMyNotifications();
    }
    const res = await apiClient<NotificationItem[] | PaginatedData<NotificationItem>>('/notifications/me');
    return extractDataList<NotificationItem>(res);
  },

  /**
   * Lấy số lượng thông báo chưa đọc: GET /api/notifications/me/unseen-count
   */
  async getUnseenCount(useMock = true): Promise<number> {
    if (useMock) {
      return mockStore.getUnseenNotificationCount();
    }
    try {
      const res = await apiClient<UnseenCountResponse>('/notifications/me/unseen-count');
      if (res && typeof res.total === 'number') {
        return res.total;
      }
      if (res && typeof res.count === 'number') {
        return res.count;
      }
      return 0;
    } catch {
      return 0;
    }
  },

  /**
   * Đánh dấu 1 thông báo đã đọc: PATCH /api/notifications/:id/seen
   */
  async markAsSeen(notificationId: number, useMock = true): Promise<void> {
    if (useMock) {
      mockStore.markNotificationAsSeen(notificationId);
      return;
    }
    try {
      await apiClient(`/notifications/${notificationId}/seen`, { method: 'PATCH' });
    } catch {
      // Bỏ qua lỗi mạng nhỏ khi mark seen
    }
  },

  /**
   * Đánh dấu tất cả thông báo đã đọc: PATCH /api/notifications/me/seen-all
   */
  async markAllAsSeen(useMock = true): Promise<void> {
    if (useMock) {
      mockStore.markAllNotificationsAsSeen();
      return;
    }
    await apiClient('/notifications/me/seen-all', { method: 'PATCH' });
  },
};
