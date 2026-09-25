/**
 * Types - System Settings & Meal Schedule Config
 * Khớp với backend SystemSetting.js và MealScheduleConfigService.js
 */

export interface SystemSettingItem {
  id: number;
  settingKey: string;
  settingValue: string;
  dataType?: 'string' | 'integer' | 'boolean' | 'json' | string;
  displayName?: string;
  description?: string;
  updatedAt?: string;
  updatedBy?: number | null;
}

export interface MealScheduleDayConfig {
  dayOfWeek: number; // 0: CN, 1: T2, 2: T3, 3: T4, 4: T5, 5: T6, 6: T7
  isEnabled: boolean | number;
  notes?: string | null;
}

export interface MealScheduleConfigResponse {
  days: MealScheduleDayConfig[];
  useMealConfig: boolean;
}

export interface MealScheduleConfig {
  autoRegisterEnabled: boolean;
  autoRegisterStartDay: number;
  activeDaysOfWeek: number[];
  cutoffTime: string;
  mealCompletionTime: string;
  paymentDueDay: number;
  mealPrice: number;
  paymentQrImage?: string | null;
}
