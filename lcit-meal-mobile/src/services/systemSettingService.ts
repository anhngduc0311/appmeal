/**
 * System Setting Service
 * Truy vấn cấu hình hệ thống và lịch ăn trong tuần từ backend
 */

import { apiClient } from './apiClient';
import { mockStore } from './mockStore';
import {
  SystemSettingItem,
  MealScheduleConfigResponse,
  MealScheduleConfig,
} from '../types';

export const systemSettingService = {
  /**
   * Lấy cấu hình theo key: GET /api/system-settings/key/:key
   */
  async getByKey(key: string, useMock = true): Promise<SystemSettingItem | null> {
    if (useMock) {
      return null;
    }
    try {
      return await apiClient<SystemSettingItem>(`/system-settings/key/${key}`);
    } catch {
      return null;
    }
  },

  /**
   * Lấy danh sách cấu hình hệ thống: GET /api/system-settings
   */
  async getAllSettings(useMock = true): Promise<SystemSettingItem[]> {
    if (useMock) {
      return [];
    }
    try {
      const res = await apiClient<SystemSettingItem[]>('/system-settings');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },

  /**
   * Lấy cấu hình ngày ăn trong tuần: GET /api/system-settings/meal-schedule-config
   */
  async getMealScheduleConfig(useMock = true): Promise<MealScheduleConfigResponse | null> {
    if (useMock) {
      return null;
    }
    try {
      return await apiClient<MealScheduleConfigResponse>('/system-settings/meal-schedule-config');
    } catch {
      return null;
    }
  },

  /**
   * Tổng hợp cấu hình hệ thống cho nghiệp vụ mobile
   */
  async getAggregatedConfig(useMock = true): Promise<MealScheduleConfig> {
    if (useMock) {
      return mockStore.getScheduleConfig();
    }

    try {
      const [scheduleRes, qrSetting, priceSetting, closeTimeSetting] = await Promise.all([
        systemSettingService.getMealScheduleConfig(false),
        systemSettingService.getByKey('payment_qr_image', false),
        systemSettingService.getByKey('meal_price', false),
        systemSettingService.getByKey('registration_close_time', false),
      ]);

      const activeDays = scheduleRes?.days
        ? scheduleRes.days.filter((d) => !!d.isEnabled).map((d) => d.dayOfWeek)
        : [1, 2, 3, 4, 5];

      return {
        autoRegisterEnabled: true,
        autoRegisterStartDay: 20,
        activeDaysOfWeek: activeDays,
        cutoffTime: closeTimeSetting?.settingValue || '09:00',
        mealCompletionTime: '12:00',
        paymentDueDay: 25,
        mealPrice: priceSetting?.settingValue ? parseInt(priceSetting.settingValue, 10) : 30000,
        paymentQrImage: qrSetting?.settingValue || null,
      };
    } catch {
      return mockStore.getScheduleConfig();
    }
  },
};
