/**
 * Meal Service
 * Quản lý lịch ăn, đăng ký suất ăn, cắt suất, yêu cầu nghỉ ăn và ngày lễ
 */

import { apiClient, extractDataList } from './apiClient';
import { mockStore } from './mockStore';
import { systemSettingService } from './systemSettingService';
import {
  Meal,
  MealRegistration,
  MealOption,
  HolidayEvent,
  MealScheduleConfig,
  RegisterMealRequest,
  CreateMealOptionRequest,
  PaginatedData,
} from '../types';

export const mealService = {
  /**
   * Lấy danh sách lịch bếp: GET /api/meals
   */
  async getMeals(useMock = true): Promise<Meal[]> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return mockStore.getMeals();
    }
    const res = await apiClient<Meal[] | PaginatedData<Meal>>('/meals');
    return extractDataList<Meal>(res);
  },

  /**
   * Lấy danh sách suất ăn cá nhân: GET /api/meal-registrations/me
   */
  async getMyRegistrations(useMock = true): Promise<MealRegistration[]> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return mockStore.getMyRegistrations();
    }
    const res = await apiClient<MealRegistration[] | PaginatedData<MealRegistration>>('/meal-registrations/me');
    return extractDataList<MealRegistration>(res);
  },

  /**
   * Đăng ký / Đăng ký lại suất ăn: POST /api/meal-registrations
   */
  async registerMeal(data: RegisterMealRequest, useMock = true): Promise<MealRegistration> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 300));
      return mockStore.registerMeal(data.mealId, data.guestCount || 0);
    }
    return await apiClient<MealRegistration>('/meal-registrations', {
      method: 'POST',
      body: JSON.stringify({
        mealId: data.mealId,
        guestCount: data.guestCount !== undefined ? data.guestCount : 0,
        userId: data.userId,
      }),
    });
  },

  /**
   * Cập nhật số lượng khách: POST / PUT /api/meal-registrations
   */
  async updateGuestCount(
    mealId: number,
    guestCount: number,
    registrationId?: number,
    useMock = true
  ): Promise<MealRegistration> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return mockStore.updateGuestCount(mealId, guestCount);
    }

    if (registrationId) {
      return await apiClient<MealRegistration>(`/meal-registrations/${registrationId}`, {
        method: 'PUT',
        body: JSON.stringify({ guestCount }),
      });
    }

    return await apiClient<MealRegistration>('/meal-registrations', {
      method: 'POST',
      body: JSON.stringify({ mealId, guestCount }),
    });
  },

  /**
   * Cắt suất trực tiếp: PATCH /api/meal-registrations/:id/cancel
   */
  async cancelRegistration(
    registrationId: number,
    reason?: string,
    useMock = true
  ): Promise<MealRegistration> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 300));
      const res = mockStore.cancelMealRegistration(registrationId);
      if (!res) throw new Error('Không tìm thấy suất ăn để cắt.');
      return res;
    }
    return await apiClient<MealRegistration>(`/meal-registrations/${registrationId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Lấy danh sách yêu cầu cắt suất cá nhân: GET /api/meal-options/me
   */
  async getMyMealOptions(useMock = true): Promise<MealOption[]> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return mockStore.getMyMealOptions();
    }
    const res = await apiClient<MealOption[] | PaginatedData<MealOption>>('/meal-options/me');
    return extractDataList<MealOption>(res);
  },

  /**
   * Tạo yêu cầu cắt suất (hôm nay, theo khoảng, dài hạn): POST /api/meal-options
   */
  async createMealOption(data: CreateMealOptionRequest, useMock = true): Promise<MealOption> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 300));
      return mockStore.createMealOption(data.type, data.fromDate, data.toDate, data.note);
    }
    return await apiClient<MealOption>('/meal-options', {
      method: 'POST',
      body: JSON.stringify({
        type: data.type,
        fromDate: data.fromDate,
        toDate: data.toDate,
        note: data.note || null,
        userId: data.userId,
      }),
    });
  },

  /**
   * Lấy danh sách ngày lễ: GET /api/holiday-events
   */
  async getHolidays(useMock = true): Promise<HolidayEvent[]> {
    if (useMock) {
      return mockStore.getHolidays();
    }
    const res = await apiClient<HolidayEvent[] | PaginatedData<HolidayEvent>>('/holiday-events');
    return extractDataList<HolidayEvent>(res);
  },

  /**
   * Lấy cấu hình lịch ăn: GET /api/system-settings/meal-schedule-config
   */
  async getScheduleConfig(useMock = true): Promise<MealScheduleConfig> {
    return await systemSettingService.getAggregatedConfig(useMock);
  },
};
