/**
 * Design Tokens - Colors
 * Hệ màu chuẩn cho ứng dụng LCIT Meal Mobile
 * Tuân thủ quy định: Nền sáng, xanh lá làm màu chủ đạo, trạng thái có cả nhãn và màu
 */

export const colors = {
  // Brand / Primary Colors (Xanh lá)
  primary: '#16A34A',      // Green 600 - Màu thương hiệu chính
  primaryLight: '#DCFCE7', // Green 100 - Nền nhạt cho badge, highlight
  primaryDark: '#15803D',  // Green 700 - Trạng thái nhấn, active
  primary50: '#F0FDF4',    // Green 50 - Nền thẻ được chọn, tint
  primary300: '#86EFAC',   // Green 300 - Border highlight

  // Secondary / Accent Colors (Teal & Cyan)
  secondary: '#0D9488',    // Teal 600
  secondaryLight: '#CCFBF1',
  accent: '#0284C7',       // Sky 600

  // Neutral / Background Colors (Nền sáng hiện đại)
  background: '#F8FAFC',   // Slate 50 - Nền ứng dụng chính
  surface: '#FFFFFF',      // Pure White - Nền thẻ, sheet, modal
  surfaceSubtle: '#F1F5F9',// Slate 100 - Nền input, header phụ
  surfaceActive: '#E2E8F0',// Slate 200 - Nền khi chạm

  // Text Colors
  text: '#0F172A',         // Slate 900 - Chữ chính, độ tương phản cao
  textSecondary: '#475569',// Slate 600 - Chữ phụ, mô tả
  textMuted: '#94A3B8',    // Slate 400 - Placeholder, nhãn mờ
  textInverse: '#FFFFFF',  // Chữ trên nền tối/xanh

  // Borders & Dividers
  border: '#E2E8F0',       // Slate 200 - Viền thẻ, divider
  borderLight: '#F1F5F9',  // Slate 100
  borderDark: '#CBD5E1',   // Slate 300 - Viền input active
  borderFocus: '#16A34A',  // Viền khi focus ô nhập

  // Semantic Statuses (Có nhãn tiếng Việt & màu tương ứng)
  status: {
    // Đã đăng ký / Đã xác nhận / Đã thanh toán / Thành công
    confirmed: {
      text: '#15803D',
      bg: '#DCFCE7',
      border: '#86EFAC',
      dot: '#16A34A',
    },
    // Chờ duyệt / Đang chờ xử lý / Cảnh báo
    pending: {
      text: '#B45309',
      bg: '#FEF3C7',
      border: '#FCD34D',
      dot: '#D97706',
    },
    // Đã hoàn thành (suất ăn đã diễn ra)
    completed: {
      text: '#1D4ED8',
      bg: '#DBEAFE',
      border: '#93C5FD',
      dot: '#2563EB',
    },
    // Đã hủy / Đã cắt suất / Quá hạn / Thất bại
    cancelled: {
      text: '#B91C1C',
      bg: '#FEE2E2',
      border: '#FCA5A5',
      dot: '#DC2626',
    },
    // Lịch nghỉ / Sự kiện lễ
    holiday: {
      text: '#6D28D9',
      bg: '#EDE9FE',
      border: '#C4B5FD',
      dot: '#7C3AED',
    },
    // Bếp nghỉ / Không phục vụ
    kitchenClosed: {
      text: '#BE123C',
      bg: '#FFE4E6',
      border: '#FDA4AF',
      dot: '#E11D48',
    },
    // Chưa thanh toán
    unpaid: {
      text: '#C2410C',
      bg: '#FFEDD5',
      border: '#FDBA74',
      dot: '#EA580C',
    },
    // Quá hạn thanh toán
    overdue: {
      text: '#991B1B',
      bg: '#FEE2E2',
      border: '#F87171',
      dot: '#DC2626',
    },
  },

  // Role Badge Colors
  roles: {
    admin: {
      text: '#7C2D12',
      bg: '#FFEDD5',
      border: '#FDBA74',
    },
    manager: {
      text: '#1E40AF',
      bg: '#DBEAFE',
      border: '#93C5FD',
    },
    employee: {
      text: '#166534',
      bg: '#DCFCE7',
      border: '#86EFAC',
    },
    kitchen: {
      text: '#86198F',
      bg: '#FAE8FF',
      border: '#F0ABFC',
    },
  },

  // Overlay
  overlay: 'rgba(15, 23, 42, 0.5)',
};
