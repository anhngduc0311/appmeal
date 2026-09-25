/**
 * Hook - Management Notifications
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../providers/AuthProvider';
import { SendNotificationRequest } from '../types';

export function useAllNotifications(query?: string, status?: string) {
  const { isMockMode } = useAuth();

  return useQuery({
    queryKey: ['management', 'notifications', query, status, isMockMode],
    queryFn: () => notificationService.filterNotifications(query, status, isMockMode),
  });
}

export function useSendNotification() {
  const { isMockMode } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendNotificationRequest) =>
      notificationService.sendNotification(data, isMockMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const { isMockMode } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationService.deleteNotification(id, isMockMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
