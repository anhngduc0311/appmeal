/**
 * Mock Store
 * Quản lý trạng thái dữ liệu mẫu trong bộ nhớ khi chạy chế độ Mock
 * Cho phép thực hiện các thao tác: Đăng ký, Cắt suất, Cập nhật số khách,
 * Đánh dấu đã đọc thông báo... và duy trì tính nhất quán giữa các màn hình.
 */

import {
  User,
  Meal,
  MealRegistration,
  MealOption,
  Payment,
  NotificationItem,
  HolidayEvent,
  MealScheduleConfig,
  MealOptionType,
} from '../types';
import {
  mockUsers,
  mockMeals,
  mockRegistrations,
  mockMealOptions,
  mockPayments,
  mockNotifications,
  mockHolidays,
  mockScheduleConfig,
} from '../mocks/fixtures';

class MockStore {
  private users: User[] = [...mockUsers];
  private meals: Meal[] = [...mockMeals];
  private registrations: MealRegistration[] = [...mockRegistrations];
  private mealOptions: MealOption[] = [...mockMealOptions];
  private payments: Payment[] = [...mockPayments];
  private notifications: NotificationItem[] = [...mockNotifications];
  private holidays: HolidayEvent[] = [...mockHolidays];
  private scheduleConfig: MealScheduleConfig = { ...mockScheduleConfig };
  private currentUserId: number = 1; // Default to An (employee)

  // Subscriptions for state changes
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- User & Auth ---
  getCurrentUser(): User {
    return this.users.find((u) => u.id === this.currentUserId) || this.users[0];
  }

  setCurrentUser(userId: number) {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      this.currentUserId = userId;
      this.notify();
    }
  }

  getAllUsers(): User[] {
    return [...this.users];
  }

  // --- Meals & Calendar ---
  getMeals(): Meal[] {
    return [...this.meals];
  }

  getMealById(id: number): Meal | undefined {
    return this.meals.find((m) => m.id === id);
  }

  getHolidays(): HolidayEvent[] {
    return [...this.holidays];
  }

  getScheduleConfig(): MealScheduleConfig {
    return { ...this.scheduleConfig };
  }

  // --- Registrations ---
  getMyRegistrations(userId = this.currentUserId): MealRegistration[] {
    return this.registrations
      .filter((r) => r.userId === userId)
      .map((r) => {
        const meal = this.meals.find((m) => m.id === r.mealId);
        return {
          ...r,
          meal,
          mealDate: meal?.mealDate || r.mealDate,
        };
      });
  }

  getRegistrationForMeal(mealId: number, userId = this.currentUserId): MealRegistration | undefined {
    const reg = this.registrations.find((r) => r.mealId === mealId && r.userId === userId);
    if (!reg) return undefined;
    const meal = this.meals.find((m) => m.id === mealId);
    return { ...reg, meal };
  }

  registerMeal(mealId: number, guestCount = 0, userId = this.currentUserId): MealRegistration {
    const existingIndex = this.registrations.findIndex(
      (r) => r.mealId === mealId && r.userId === userId
    );

    const meal = this.meals.find((m) => m.id === mealId);
    const mealDate = meal?.mealDate;

    if (existingIndex >= 0) {
      // Đã có hàng cũ (vd: đã từng cancelled) -> Cập nhật sang confirmed
      const updated: MealRegistration = {
        ...this.registrations[existingIndex],
        status: 'confirmed',
        guestCount,
        mealDate,
      };
      this.registrations[existingIndex] = updated;
      this.notify();
      return updated;
    }

    // Tạo mới
    const newReg: MealRegistration = {
      id: Date.now(),
      userId,
      mealId,
      guestCount,
      status: 'confirmed',
      mealDate,
      createdAt: new Date().toISOString(),
    };
    this.registrations.push(newReg);
    this.notify();
    return newReg;
  }

  updateGuestCount(mealId: number, guestCount: number, userId = this.currentUserId): MealRegistration {
    const reg = this.registrations.find((r) => r.mealId === mealId && r.userId === userId);
    if (reg) {
      reg.guestCount = Math.max(0, Math.min(10, guestCount));
      this.notify();
      return reg;
    }
    return this.registerMeal(mealId, guestCount, userId);
  }

  cancelMealRegistration(registrationId: number): MealRegistration | null {
    const reg = this.registrations.find((r) => r.id === registrationId);
    if (!reg) return null;

    reg.status = 'cancelled';
    this.notify();
    return reg;
  }

  cancelMealByMealId(mealId: number, userId = this.currentUserId): MealRegistration | null {
    const reg = this.registrations.find((r) => r.mealId === mealId && r.userId === userId);
    if (!reg) return null;

    reg.status = 'cancelled';
    this.notify();
    return reg;
  }

  // --- Meal Options (Yêu cầu cắt suất) ---
  getMyMealOptions(userId = this.currentUserId): MealOption[] {
    return this.mealOptions.filter((o) => o.userId === userId);
  }

  createMealOption(
    type: MealOptionType,
    fromDate: string,
    toDate: string,
    note?: string,
    userId = this.currentUserId
  ): MealOption {
    const newOption: MealOption = {
      id: Date.now(),
      userId,
      type,
      fromDate,
      toDate,
      note,
      status: 'approved', // Khớp nghiệp vụ hiện tại: cả 3 loại tự approved
      createdAt: new Date().toISOString(),
    };
    this.mealOptions.unshift(newOption);

    // Đồng bộ hủy các suất ăn trong khoảng fromDate..toDate
    const from = new Date(fromDate).getTime();
    const to = new Date(toDate).getTime();

    this.registrations.forEach((r) => {
      if (r.userId === userId) {
        const meal = this.meals.find((m) => m.id === r.mealId);
        if (meal) {
          const mealTime = new Date(meal.mealDate).getTime();
          if (mealTime >= from && mealTime <= to && r.status !== 'completed') {
            r.status = 'cancelled';
          }
        }
      }
    });

    this.notify();
    return newOption;
  }

  // --- Payments ---
  getMyPayments(userId = this.currentUserId): Payment[] {
    return this.payments.filter((p) => p.userId === userId);
  }

  getAllPayments(): Payment[] {
    return [...this.payments];
  }

  // --- Notifications ---
  getMyNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  getUnseenNotificationCount(): number {
    return this.notifications.filter((n) => !n.isSeen).length;
  }

  markNotificationAsSeen(notificationId: number) {
    const notif = this.notifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.isSeen = true;
      notif.seenAt = new Date().toISOString();
      this.notify();
    }
  }

  markAllNotificationsAsSeen() {
    this.notifications.forEach((n) => {
      n.isSeen = true;
      n.seenAt = new Date().toISOString();
    });
    this.notify();
  }
}

export const mockStore = new MockStore();
