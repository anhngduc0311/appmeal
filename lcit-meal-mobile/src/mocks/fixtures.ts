/**
 * Mock Fixtures
 * Bộ dữ liệu mẫu phong phú và sát thực tế nghiệp vụ LCIT Meal
 * Đáp ứng T08: Employee, Manager, Admin, Kitchen; ngày ăn bình thường, ngày nghỉ,
 * suất pending/completed/cancelled, khoản thanh toán chưa trả, thông báo chưa đọc.
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
} from '../types';
import { formatBusinessDate } from '../utils/formatters';

// 1. Danh sách người dùng mẫu
export const mockUsers: User[] = [
  {
    id: 1,
    username: 'nv_an',
    fullName: 'Nguyễn Văn An',
    email: 'an.nv@lcit.vn',
    phone: '0901234567',
    status: 'active',
    role: 'employee',
    roles: ['employee'],
  },
  {
    id: 2,
    username: 'ql_minh',
    fullName: 'Trần Quang Minh',
    email: 'minh.tq@lcit.vn',
    phone: '0912345678',
    status: 'active',
    role: 'manager',
    roles: ['manager', 'employee'],
  },
  {
    id: 3,
    username: 'admin',
    fullName: 'Quản Trị Hệ Thống',
    email: 'admin@lcit.vn',
    phone: '0988888888',
    status: 'active',
    role: 'admin',
    roles: ['admin', 'manager', 'employee'],
  },
  {
    id: 4,
    username: 'bep_truong',
    fullName: 'Lê Thị Bếp',
    email: 'bep@lcit.vn',
    phone: '0933333333',
    status: 'active',
    role: 'kitchen',
    roles: ['kitchen'],
  },
];

// Sinh danh sách ngày xoay quanh hôm nay
const getDatesAroundToday = () => {
  const dates: { offset: number; dateStr: string }[] = [];
  for (let i = -7; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push({
      offset: i,
      dateStr: formatBusinessDate(d),
    });
  }
  return dates;
};

const dateList = getDatesAroundToday();
const findDate = (offset: number) => {
  const found = dateList.find((d) => d.offset === offset);
  return found ? found.dateStr : formatBusinessDate(new Date());
};

// 2. Danh sách ngày bếp (Meals)
export const mockMeals: Meal[] = [
  // Quá khứ (-5 đến -1)
  {
    id: 101,
    mealDate: findDate(-5),
    isCancelled: false,
    status: 'active',
    note: 'Bữa trưa: Thịt kho trứng, Rau muống luộc, Canh cải',
  },
  {
    id: 102,
    mealDate: findDate(-4),
    isCancelled: false,
    status: 'active',
    note: 'Bữa trưa: Cá basa phi lê sốt cà, Đậu sốt, Canh bầu',
  },
  {
    id: 103,
    mealDate: findDate(-3),
    isCancelled: true, // Ngày bếp nghỉ đột xuất
    cancelledBy: 2,
    status: 'cancelled',
    note: 'Bếp tạm nghỉ bảo trì hệ thống gas công nghiệp',
  },
  {
    id: 104,
    mealDate: findDate(-2),
    isCancelled: false,
    status: 'active',
    note: 'Bữa trưa: Gà chiên nước mắm, Bắp cải xào, Canh bí đỏ',
  },
  {
    id: 105,
    mealDate: findDate(-1),
    isCancelled: false,
    status: 'active',
    note: 'Bữa trưa: Sườn xào chua ngọt, Cải chíp xào tỏi, Canh mồng tơi',
  },
  // Hôm nay (0)
  {
    id: 106,
    mealDate: findDate(0),
    isCancelled: false,
    status: 'active',
    note: 'Bữa trưa: Thịt bò xào cần tỏi, Trứng chiên hành, Canh chua cá',
  },
  // Tương lai (+1 đến +7)
  {
    id: 107,
    mealDate: findDate(1),
    isCancelled: false,
    status: 'active',
    note: 'Bữa trưa: Tôm rim thịt, Đậu phụ luộc, Canh rau ngót thịt băm',
  },
  {
    id: 108,
    mealDate: findDate(2),
    isCancelled: false,
    status: 'active',
    note: 'Bữa trưa: Đùi gà rô ti, Su su xào trứng, Canh cải cúc',
  },
  {
    id: 109,
    mealDate: findDate(3),
    isCancelled: false,
    status: 'active',
    note: 'Bữa trưa: Chả giò chiên giòn, Rau củ luộc thập cẩm, Canh ngao',
  },
  {
    id: 110,
    mealDate: findDate(4),
    isCancelled: false,
    status: 'active',
    note: 'Bữa trưa: Cá thu sốt tiêu, Mướp đắng xào trứng, Canh sườn hầm',
  },
  {
    id: 111,
    mealDate: findDate(5),
    isCancelled: true, // Nghỉ lễ hoặc bếp nghỉ
    cancelledBy: 3,
    status: 'cancelled',
    note: 'Nghỉ lễ định kỳ của cơ quan',
  },
  {
    id: 112,
    mealDate: findDate(6),
    isCancelled: false,
    status: 'active',
    note: 'Bữa trưa: Thịt quay giòn bì, Cà tím xào lá lốt, Canh cua rau đay',
  },
  {
    id: 113,
    mealDate: findDate(7),
    isCancelled: false,
    status: 'active',
    note: 'Bữa trưa: Mực xào ớt chuông, Trứng hấp vân hoa, Canh bí đao',
  },
];

// 3. Đăng ký suất ăn của nhân viên An (User ID: 1)
export const mockRegistrations: MealRegistration[] = [
  // Quá khứ: Đã hoàn thành (completed)
  {
    id: 1001,
    userId: 1,
    mealId: 101,
    guestCount: 0,
    status: 'completed',
    mealDate: findDate(-5),
  },
  {
    id: 1002,
    userId: 1,
    mealId: 102,
    guestCount: 2, // Đăng ký có 2 khách
    status: 'completed',
    mealDate: findDate(-4),
  },
  {
    id: 1003,
    userId: 1,
    mealId: 103, // Ngày bếp nghỉ -> registration cancelled
    guestCount: 0,
    status: 'cancelled',
    mealDate: findDate(-3),
  },
  {
    id: 1004,
    userId: 1,
    mealId: 104,
    guestCount: 0,
    status: 'completed',
    mealDate: findDate(-2),
  },
  {
    id: 1005,
    userId: 1,
    mealId: 105,
    guestCount: 0,
    status: 'completed',
    mealDate: findDate(-1),
  },
  // Hôm nay: Đã đăng ký (confirmed)
  {
    id: 1006,
    userId: 1,
    mealId: 106,
    guestCount: 1, // Kèm 1 khách
    status: 'confirmed',
    mealDate: findDate(0),
  },
  // Tương lai
  {
    id: 1007,
    userId: 1,
    mealId: 107,
    guestCount: 0,
    status: 'confirmed',
    mealDate: findDate(1),
  },
  {
    id: 1008,
    userId: 1,
    mealId: 108,
    guestCount: 0,
    status: 'cancelled', // Đã tự cắt suất
    mealDate: findDate(2),
  },
  {
    id: 1009,
    userId: 1,
    mealId: 109,
    guestCount: 3,
    status: 'pending', // Suất đăng ký muộn hoặc chờ xác nhận
    mealDate: findDate(3),
  },
  {
    id: 1010,
    userId: 1,
    mealId: 110,
    guestCount: 0,
    status: 'confirmed',
    mealDate: findDate(4),
  },
  {
    id: 1011,
    userId: 1,
    mealId: 112,
    guestCount: 0,
    status: 'confirmed',
    mealDate: findDate(6),
  },
];

// 4. Lịch sử yêu cầu cắt suất (Meal Options)
export const mockMealOptions: MealOption[] = [
  {
    id: 501,
    userId: 1,
    type: 'cancel_today',
    fromDate: findDate(-3),
    toDate: findDate(-3),
    note: 'Bận đi công tác đột xuất tại cảng',
    status: 'approved',
    createdAt: `${findDate(-3)} 08:15:00`,
  },
  {
    id: 502,
    userId: 1,
    type: 'cancel_schedule',
    fromDate: findDate(2),
    toDate: findDate(2),
    note: 'Gặp khách hàng bên ngoài văn phòng',
    status: 'approved',
    createdAt: `${findDate(0)} 08:30:00`,
  },
  {
    id: 503,
    userId: 1,
    type: 'cancel_permanent',
    fromDate: findDate(10),
    toDate: findDate(20),
    note: 'Nghỉ phép thường niên',
    status: 'pending',
    createdAt: `${findDate(0)} 09:10:00`,
  },
];

// 5. Khoản thanh toán (Payments)
export const mockPayments: Payment[] = [
  {
    id: 901,
    userId: 1,
    paymentDate: '2026-09-25',
    amount: 660000,
    isPaid: false,
    status: 'unpaid',
    user: {
      id: 1,
      fullName: 'Nguyễn Văn An',
      username: 'nv_an',
    },
  },
  {
    id: 902,
    userId: 1,
    paymentDate: '2026-08-25',
    amount: 600000,
    isPaid: true,
    paidAmount: 600000,
    paidAt: '2026-08-26 10:20:00',
    billImg: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    status: 'paid',
    user: {
      id: 1,
      fullName: 'Nguyễn Văn An',
      username: 'nv_an',
    },
  },
  {
    id: 903,
    userId: 1,
    paymentDate: '2026-07-25',
    amount: 540000,
    isPaid: true,
    paidAmount: 540000,
    paidAt: '2026-07-27 15:45:00',
    status: 'paid',
    user: {
      id: 1,
      fullName: 'Nguyễn Văn An',
      username: 'nv_an',
    },
  },
  // Khoản quá hạn cho user mẫu khác để test
  {
    id: 904,
    userId: 2,
    paymentDate: '2026-06-25',
    amount: 720000,
    isPaid: false,
    status: 'overdue',
    user: {
      id: 2,
      fullName: 'Trần Quang Minh',
      username: 'ql_minh',
    },
  },
];

// 6. Thông báo (Notifications)
export const mockNotifications: NotificationItem[] = [
  {
    id: 701,
    title: 'Nhắc nhở đóng đăng ký suất ăn hôm nay',
    content: 'Hệ thống sẽ khóa đăng ký và cắt suất ăn trưa hôm nay vào lúc 09:00. Vui lòng kiểm tra lại số lượng khách và suất ăn của bạn.',
    type: 'SYSTEM',
    createdAt: '2026-09-25 08:00:00',
    isSeen: false,
  },
  {
    id: 702,
    title: 'Thông báo tiền ăn kỳ tháng 09/2026',
    content: 'Khoản tiền ăn tháng 09/2026 của bạn là 660.000 đ (22 suất). Vui lòng quét mã QR chuyển khoản trước ngày 30/09/2026.',
    type: 'PAYMENT_DUE',
    createdAt: '2026-09-24 16:30:00',
    isSeen: false,
  },
  {
    id: 703,
    title: 'Xác nhận cắt suất ăn ngày ' + findDate(2) + ' thành công',
    content: 'Yêu cầu cắt suất ăn ngày ' + findDate(2) + ' của bạn đã được hệ thống tự động duyệt thành công.',
    type: 'APPROVAL',
    createdAt: '2026-09-23 10:15:00',
    isSeen: true,
    seenAt: '2026-09-23 11:00:00',
  },
  {
    id: 704,
    title: 'Thông báo thực đơn tuần mới',
    content: 'Thực đơn tuần từ ngày ' + findDate(1) + ' đến ' + findDate(7) + ' đã được nhà bếp cập nhật trên hệ thống.',
    type: 'SYSTEM',
    createdAt: '2026-09-22 09:00:00',
    isSeen: true,
    seenAt: '2026-09-22 14:20:00',
  },
];

// 7. Lịch sự kiện / Nghỉ lễ (Holidays)
export const mockHolidays: HolidayEvent[] = [
  {
    id: 301,
    name: 'Nghỉ Lễ Quốc Khánh',
    fromDate: '2026-09-01',
    toDate: '2026-09-03',
    reason: 'Nghỉ lễ theo quy định nhà nước',
    status: 'active',
  },
  {
    id: 302,
    name: 'Bảo dưỡng bếp ăn định kỳ',
    fromDate: findDate(5),
    toDate: findDate(5),
    reason: 'Vệ sinh và bảo dưỡng thiết bị hút mùi',
    status: 'active',
  },
];

// 8. Cấu hình hệ thống (Settings)
export const mockScheduleConfig: MealScheduleConfig = {
  autoRegisterEnabled: true,
  autoRegisterStartDay: 20,
  activeDaysOfWeek: [1, 2, 3, 4, 5], // Thứ 2 đến Thứ 6
  cutoffTime: '09:00',
  mealCompletionTime: '12:00',
  paymentDueDay: 25,
  mealPrice: 30000,
  paymentQrImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500',
};
