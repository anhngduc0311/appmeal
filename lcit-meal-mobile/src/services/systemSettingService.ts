/**
 * System Setting Service
 * Truy vấn và cập nhật cấu hình hệ thống, lịch ăn trong tuần, giờ đóng và upload QR thanh toán
 */

import { apiClient } from './apiClient';
import { mockStore } from './mockStore';
import {
  SystemSettingItem,
  MealScheduleConfigResponse,
  MealScheduleConfig,
  MealScheduleDayConfig,
} from '../types';

export const systemSettingService = {
  /**
   * Lấy cấu hình theo key: GET /api/system-settings/key/:key
   */
  async getByKey(key: string, useMock = false): Promise<SystemSettingItem | null> {
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
   * Cập nhật cấu hình theo key (Admin only): PUT /api/system-settings/key/:key
   */
  async updateByKey(key: string, value: string, useMock = false): Promise<SystemSettingItem> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return mockStore.updateSettingKey(key, value);
    }
    return await apiClient<SystemSettingItem>(`/system-settings/key/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ settingValue: value }),
    });
  },

  /**
   * Lấy danh sách cấu hình hệ thống: GET /api/system-settings
   */
  async getAllSettings(useMock = false): Promise<SystemSettingItem[]> {
    if (useMock) {
      return mockStore.getRawSystemSettings();
    }
    try {
      const res = await apiClient<SystemSettingItem[]>('/system-settings');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },

  /**
   * Cập nhật nhiều cấu hình cùng lúc (Admin only): PUT /api/system-settings/bulk
   */
  async bulkUpdate(
    settings: { settingKey: string; settingValue: string }[],
    useMock = false
  ): Promise<void> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 300));
      for (const item of settings) {
        mockStore.updateSettingKey(item.settingKey, item.settingValue);
      }
      return;
    }
    await apiClient('/system-settings/bulk', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  },

  /**
   * Lấy cấu hình ngày ăn trong tuần: GET /api/system-settings/meal-schedule-config
   */
  async getMealScheduleConfig(useMock = false): Promise<MealScheduleConfigResponse | null> {
    if (useMock) {
      return mockStore.getMealScheduleConfigDays();
    }
    try {
      return await apiClient<MealScheduleConfigResponse>('/system-settings/meal-schedule-config');
    } catch {
      return null;
    }
  },

  /**
   * Cập nhật cấu hình ngày ăn trong tuần (Admin only): PUT /api/system-settings/meal-schedule-config
   */
  async updateMealScheduleConfig(
    days: MealScheduleDayConfig[],
    useMock = false
  ): Promise<MealScheduleConfigResponse> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 300));
      return mockStore.updateMealScheduleConfigDays(days);
    }
    return await apiClient<MealScheduleConfigResponse>('/system-settings/meal-schedule-config', {
      method: 'PUT',
      body: JSON.stringify({ days }),
    });
  },

  /**
   * Upload ảnh QR thanh toán (Admin only): POST /api/system-settings/payment-qr
   */
  async uploadPaymentQr(
    fileUri: string,
    mimeType = 'image/png',
    useMock = false
  ): Promise<{ url: string }> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 500));
      mockStore.updateSettingKey('payment_qr_image', fileUri);
      return { url: fileUri };
    }

    const formData = new FormData();
    const filename = fileUri.split('/').pop() || 'payment_qr.png';
    formData.append('file', {
      uri: fileUri,
      name: filename,
      type: mimeType,
    } as unknown as Blob);

    const res = await apiClient<any>('/system-settings/payment-qr', {
      method: 'POST',
      body: formData,
    });

    const uploadedUrl =
      res?.url ||
      res?.settingValue ||
      res?.payload?.url ||
      res?.payload?.settingValue ||
      '';

    return { url: uploadedUrl };
  },

  /**
   * Tổng hợp cấu hình hệ thống cho nghiệp vụ mobile
   */
  async getAggregatedConfig(useMock = false): Promise<MealScheduleConfig> {
    if (useMock) {
      return mockStore.getScheduleConfig();
    }

    try {
      const [scheduleRes, qrSetting, priceSetting, guestPriceSetting, closeTimeSetting] = await Promise.all([
        systemSettingService.getMealScheduleConfig(false),
        systemSettingService.getByKey('payment_qr_image', false),
        systemSettingService.getByKey('meal_price', false),
        systemSettingService.getByKey('guest_meal_price', false),
        systemSettingService.getByKey('registration_close_time', false),
      ]);

      const activeDays = scheduleRes?.days
        ? scheduleRes.days.filter((d) => !!d.isEnabled).map((d) => d.dayOfWeek)
        : [1, 2, 3, 4, 5];

      return {
        autoRegisterEnabled: true,
        autoRegisterStartDay: 20,
        activeDaysOfWeek: activeDays,
        cutoffTime: closeTimeSetting?.settingValue || '08:00',
        mealCompletionTime: '12:00',
        paymentDueDay: 25,
        mealPrice: priceSetting?.settingValue ? parseInt(priceSetting.settingValue, 10) : 30000,
        guestMealPrice: guestPriceSetting?.settingValue ? parseInt(guestPriceSetting.settingValue, 10) : 35000,
        paymentQrImage: qrSetting?.settingValue || null,
      };
    } catch {
      return mockStore.getScheduleConfig();
    }
  },
};
