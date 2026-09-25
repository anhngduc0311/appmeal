/**
 * Notification Service
 * Quản lý thông báo, đếm số thông báo chưa đọc và đánh dấu đã xem
 */

import { apiClient } from './apiClient';
import { mockStore } from './mockStore';
import { NotificationItem, UnseenCountResponse } from '../types';

export const notificationService = {
  /**
   * Lấy danh sách thông báo của tôi: GET /api/notifications/me
   */
  async getMyNotifications(useMock = true): Promise<NotificationItem[]> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return mockStore.getMyNotifications();
    }
    return await apiClient<NotificationItem[]>('/notifications/me');
  },

  /**
   * Lấy số lượng thông báo chưa đọc: GET /api/notifications/me/unseen-count
   */
  async getUnseenCount(useMock = true): Promise<number> {
    if (useMock) {
      return mockStore.getUnseenNotificationCount();
    }
    const res = await apiClient<UnseenCountResponse>('/notifications/me/unseen-count');
    return res.count || 0;
  },

  /**
   * Đánh dấu 1 thông báo đã đọc: PATCH /api/notifications/:id/seen
   */
  async markAsSeen(notificationId: number, useMock = true): Promise<void> {
    if (useMock) {
      mockStore.markNotificationAsSeen(notificationId);
      return;
    }
    await apiClient(`/notifications/${notificationId}/seen`, { method: 'PATCH' });
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
