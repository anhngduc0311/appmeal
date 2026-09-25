/**
 * Hooks - Notifications Data
 * Quản lý queries và mutations cho danh sách thông báo, số lượng chưa đọc, và đánh dấu đã xem (T23)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider';
import { notificationService } from '../services/notificationService';
import { NotificationItem } from '../types';

export const NOTIFICATION_QUERY_KEYS = {
  myNotifications: (useMock: boolean) => ['notifications', 'me', { useMock }] as const,
  unseenCount: (useMock: boolean) => ['notifications', 'unseen-count', { useMock }] as const,
};

export function useMyNotifications() {
  const { useMockData } = useAuth();
  return useQuery<NotificationItem[], Error>({
    queryKey: NOTIFICATION_QUERY_KEYS.myNotifications(useMockData),
    queryFn: () => notificationService.getMyNotifications(useMockData),
  });
}

export function useUnseenNotificationCount() {
  const { useMockData } = useAuth();
  return useQuery<number, Error>({
    queryKey: NOTIFICATION_QUERY_KEYS.unseenCount(useMockData),
    queryFn: () => notificationService.getUnseenCount(useMockData),
    refetchInterval: 30000, // Tự động làm mới mỗi 30 giây
  });
}

export function useMarkNotificationSeenMutation() {
  const queryClient = useQueryClient();
  const { useMockData } = useAuth();

  return useMutation<void, Error, number>({
    mutationFn: (id) => notificationService.markAsSeen(id, useMockData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsSeenMutation() {
  const queryClient = useQueryClient();
  const { useMockData } = useAuth();

  return useMutation<void, Error, void>({
    mutationFn: () => notificationService.markAllAsSeen(useMockData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
