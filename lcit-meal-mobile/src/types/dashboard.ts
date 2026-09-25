/**
 * Types - Dashboard Data
 * Khớp với backend DashboardRepository.js và DashboardController.js
 */

export interface TodayMealStat {
  meal_id?: number;
  mealDate?: string;
  meal_date?: string;
  isCancelled?: boolean | number;
  is_cancelled?: boolean | number;
  cancelNote?: string | null;
  cancel_note?: string | null;
  totalMealSlots?: number;
  total_meal_slots?: number;
  mealPrice?: number | string;
  meal_price?: number | string;
  guestMealPrice?: number | string;
  guest_meal_price?: number | string;
}

export interface TodayStaffStat {
  registeredStaffCount?: number;
  registered_staff_count?: number;
  totalGuestCount?: number;
  total_guest_count?: number;
  totalMealSlots?: number;
  total_meal_slots?: number;
}

export interface WeeklyChartItem {
  meal_date: string;
  is_cancelled?: number | boolean;
  total_meal_slots: number;
  registered_staff_count: number;
}

export interface DashboardPaymentItem {
  userId?: number;
  user_id?: number;
  fullName?: string;
  full_name?: string;
  username?: string;
  paymentDate?: string;
  payment_date?: string;
  amount: number;
  paidAmount?: number | null;
  paid_amount?: number | null;
  isPaid?: number | boolean;
  is_paid?: number | boolean;
  paymentStatus?: string;
  payment_status?: string;
}

export interface DashboardOutstanding {
  unpaidRecordCount?: number;
  unpaid_record_count?: number;
  totalOutstandingAmount?: number;
  total_outstanding_amount?: number;
}

export interface DashboardHomeData {
  todayMeal?: TodayMealStat | null;
  todayStaff?: TodayStaffStat | null;
  weeklyChart?: WeeklyChartItem[];
  paymentList?: DashboardPaymentItem[];
  outstanding?: DashboardOutstanding | null;
  pendingMealOptionCount?: number;
  unseenNotificationCount?: number;
}

export interface DashboardChartPoint {
  meal_date: string;
  is_cancelled?: number | boolean;
  total_meal_slots: number;
  registered_staff_count: number;
}

export interface DashboardChartResponse {
  period: 'week' | 'month' | 'year';
  granularity: 'day' | 'month';
  from: string;
  to: string;
  data: DashboardChartPoint[];
}
