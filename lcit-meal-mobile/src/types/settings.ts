/**
 * Types - System Settings & Meal Schedule Config
 * Khớp với backend SystemSetting.js và schema database
 */

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  dataType?: 'string' | 'number' | 'boolean' | 'json';
  displayName?: string;
  description?: string;
  updatedAt?: string;
  updatedBy?: number | null;
}

export interface MealScheduleConfig {
  autoRegisterEnabled: boolean;
  autoRegisterStartDay: number; // e.g. 20 (ngày 20 hàng tháng)
  activeDaysOfWeek: number[];   // 1: T2, 2: T3, 3: T4, 4: T5, 5: T6, 6: T7, 0: CN
  cutoffTime: string;           // e.g. "09:00"
  mealCompletionTime: string;   // e.g. "12:00"
  paymentDueDay: number;        // e.g. 25
  mealPrice: number;            // e.g. 30000 VND
  paymentQrImage?: string | null;
}
