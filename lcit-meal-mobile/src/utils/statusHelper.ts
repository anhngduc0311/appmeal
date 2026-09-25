/**
 * Status Helpers
 * Bản đồ chuyển đổi trạng thái sang nhãn tiếng Việt và cấu hình màu sắc tương ứng
 */

import { colors } from '../theme/colors';
import {
  MealRegistrationStatus,
  MealOptionStatus,
  PaymentStatus,
  UserRole,
} from '../types';

export interface StatusConfig {
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  dotColor?: string;
  iconName?: string;
}

/**
 * Lấy cấu hình nhãn & màu cho trạng thái đăng ký suất ăn (MealRegistration)
 */
export function getMealRegistrationStatusConfig(
  status: MealRegistrationStatus | string | undefined | null,
  isMealCancelled?: boolean | number
): StatusConfig {
  if (isMealCancelled) {
    return {
      label: 'Bếp nghỉ',
      textColor: colors.status.kitchenClosed.text,
      bgColor: colors.status.kitchenClosed.bg,
      borderColor: colors.status.kitchenClosed.border,
      dotColor: colors.status.kitchenClosed.dot,
      iconName: 'restaurant-outline',
    };
  }

  switch (status) {
    case 'confirmed':
      return {
        label: 'Đã đăng ký',
        textColor: colors.status.confirmed.text,
        bgColor: colors.status.confirmed.bg,
        borderColor: colors.status.confirmed.border,
        dotColor: colors.status.confirmed.dot,
        iconName: 'checkmark-circle-outline',
      };
    case 'pending':
      return {
        label: 'Chờ duyệt',
        textColor: colors.status.pending.text,
        bgColor: colors.status.pending.bg,
        borderColor: colors.status.pending.border,
        dotColor: colors.status.pending.dot,
        iconName: 'time-outline',
      };
    case 'completed':
      return {
        label: 'Đã dùng bữa',
        textColor: colors.status.completed.text,
        bgColor: colors.status.completed.bg,
        borderColor: colors.status.completed.border,
        dotColor: colors.status.completed.dot,
        iconName: 'restaurant',
      };
    case 'cancelled':
      return {
        label: 'Đã cắt suất',
        textColor: colors.status.cancelled.text,
        bgColor: colors.status.cancelled.bg,
        borderColor: colors.status.cancelled.border,
        dotColor: colors.status.cancelled.dot,
        iconName: 'close-circle-outline',
      };
    default:
      return {
        label: 'Chưa đăng ký',
        textColor: colors.textSecondary,
        bgColor: colors.surfaceSubtle,
        borderColor: colors.border,
        dotColor: colors.textMuted,
        iconName: 'ellipse-outline',
      };
  }
}

/**
 * Lấy cấu hình nhãn & màu cho trạng thái yêu cầu cắt suất (MealOption)
 */
export function getMealOptionStatusConfig(status: MealOptionStatus | string): StatusConfig {
  switch (status) {
    case 'approved':
      return {
        label: 'Đã duyệt',
        textColor: colors.status.confirmed.text,
        bgColor: colors.status.confirmed.bg,
        borderColor: colors.status.confirmed.border,
        dotColor: colors.status.confirmed.dot,
      };
    case 'pending':
      return {
        label: 'Chờ duyệt',
        textColor: colors.status.pending.text,
        bgColor: colors.status.pending.bg,
        borderColor: colors.status.pending.border,
        dotColor: colors.status.pending.dot,
      };
    case 'rejected':
      return {
        label: 'Từ chối',
        textColor: colors.status.cancelled.text,
        bgColor: colors.status.cancelled.bg,
        borderColor: colors.status.cancelled.border,
        dotColor: colors.status.cancelled.dot,
      };
    default:
      return {
        label: status,
        textColor: colors.textSecondary,
        bgColor: colors.surfaceSubtle,
        borderColor: colors.border,
      };
  }
}

/**
 * Lấy cấu hình nhãn & màu cho trạng thái thanh toán (Payment)
 */
export function getPaymentStatusConfig(status: PaymentStatus | string): StatusConfig {
  switch (status) {
    case 'paid':
      return {
        label: 'Đã thanh toán',
        textColor: colors.status.confirmed.text,
        bgColor: colors.status.confirmed.bg,
        borderColor: colors.status.confirmed.border,
        dotColor: colors.status.confirmed.dot,
        iconName: 'checkmark-circle',
      };
    case 'unpaid':
      return {
        label: 'Chưa thanh toán',
        textColor: colors.status.unpaid.text,
        bgColor: colors.status.unpaid.bg,
        borderColor: colors.status.unpaid.border,
        dotColor: colors.status.unpaid.dot,
        iconName: 'alert-circle-outline',
      };
    case 'overdue':
      return {
        label: 'Quá hạn thanh toán',
        textColor: colors.status.overdue.text,
        bgColor: colors.status.overdue.bg,
        borderColor: colors.status.overdue.border,
        dotColor: colors.status.overdue.dot,
        iconName: 'warning-outline',
      };
    default:
      return {
        label: status,
        textColor: colors.textSecondary,
        bgColor: colors.surfaceSubtle,
        borderColor: colors.border,
      };
  }
}

/**
 * Lấy cấu hình vai trò (Role)
 */
export function getRoleConfig(role: UserRole | string | undefined): StatusConfig {
  switch (role) {
    case 'admin':
      return {
        label: 'Quản trị viên',
        textColor: colors.roles.admin.text,
        bgColor: colors.roles.admin.bg,
        borderColor: colors.roles.admin.border,
        iconName: 'shield-checkmark',
      };
    case 'manager':
      return {
        label: 'Quản lý bếp',
        textColor: colors.roles.manager.text,
        bgColor: colors.roles.manager.bg,
        borderColor: colors.roles.manager.border,
        iconName: 'briefcase',
      };
    case 'kitchen':
      return {
        label: 'Nhân viên bếp',
        textColor: colors.roles.kitchen.text,
        bgColor: colors.roles.kitchen.bg,
        borderColor: colors.roles.kitchen.border,
        iconName: 'restaurant',
      };
    case 'employee':
    default:
      return {
        label: 'Nhân viên',
        textColor: colors.roles.employee.text,
        bgColor: colors.roles.employee.bg,
        borderColor: colors.roles.employee.border,
        iconName: 'person',
      };
  }
}
