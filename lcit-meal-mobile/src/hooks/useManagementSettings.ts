/**
 * Hook - Management Settings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemSettingService } from '../services/systemSettingService';
import { useAuth } from '../providers/AuthProvider';
import { MealScheduleDayConfig } from '../types';

export function useSystemSettings() {
  const { isMockMode } = useAuth();

  return useQuery({
    queryKey: ['settings', 'all', isMockMode],
    queryFn: () => systemSettingService.getAllSettings(isMockMode),
  });
}

export function useMealScheduleDays() {
  const { isMockMode } = useAuth();

  return useQuery({
    queryKey: ['settings', 'meal-schedule-days', isMockMode],
    queryFn: () => systemSettingService.getMealScheduleConfig(isMockMode),
  });
}

export function useUpdateSingleSetting() {
  const { isMockMode } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      systemSettingService.updateByKey(key, value, isMockMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-config'] });
    },
  });
}

export function useBulkUpdateSettings() {
  const { isMockMode } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: { settingKey: string; settingValue: string }[]) =>
      systemSettingService.bulkUpdate(settings, isMockMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-config'] });
    },
  });
}

export function useUpdateScheduleDays() {
  const { isMockMode } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (days: MealScheduleDayConfig[]) =>
      systemSettingService.updateMealScheduleConfig(days, isMockMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-config'] });
    },
  });
}

export function useUploadPaymentQr() {
  const { isMockMode } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileUri, mimeType }: { fileUri: string; mimeType?: string }) =>
      systemSettingService.uploadPaymentQr(fileUri, mimeType, isMockMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-config'] });
    },
  });
}
