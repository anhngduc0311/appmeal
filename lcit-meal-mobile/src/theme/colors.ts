/**
 * Design Tokens - Colors
 * Hệ màu chuẩn cho ứng dụng LCIT Meal Mobile
 * Tuân thủ quy định: Nền sáng, xanh lá làm màu chủ đạo, trạng thái có cả nhãn và màu
 */

export const colors = {
  // Brand / Primary Colors (Emerald Forest & Mint)
  primary: '#0D5C46',      // Premium Deep Emerald
  primaryLight: '#E6F4EA', // Soft Mint for badges & highlights
  primaryDark: '#093F30',  // Darker Forest for hero banners & deep accents
  primary50: '#F2F9F5',    // Lightest tint for active cards & selection
  primary100: '#E1F2E8',
  primary200: '#C3E5D1',
  primary300: '#9FD5B7',   // Crisp border highlight
  primary400: '#34A853',
  primary500: '#147A5D',
  primary600: '#0D5C46',
  primary700: '#093F30',

  // Secondary / Accent Colors (Teal, Cyan, Gold)
  secondary: '#0F766E',    // Teal 700
  secondaryLight: '#CCFBF1',
  accent: '#0284C7',       // Sky 600
  accentGold: '#D97706',   // Warm Gold for highlights & notifications

  // Neutral / Canvas Colors (Nền sáng hiện đại, thoáng đãng)
  background: '#F8FAF8',     // Ultra-clean canvas
  backgroundDark: '#EFF3F0', // Card secondary & chip bg
  surface: '#FFFFFF',        // Pure White
  surfaceSubtle: '#F1F5F2',  // Subtle inputs & containers
  surfaceActive: '#E2EBE5',  // Pressed state feedback

  // Text Colors (High legibility, elegant dark emerald charcoal)
  text: '#11261F',           // Slate Charcoal Dark - Độ tương phản cao
  textSecondary: '#4E655C',  // Medium Slate Green - Chữ phụ, mô tả rõ ràng
  textMuted: '#7B8F87',      // Placeholder, nhãn thời gian
  textInverse: '#FFFFFF',    // Chữ trên nền tối/xanh

  // Borders & Dividers
  border: '#E3EBE5',         // Viền thẻ sắc nét nhẹ
  borderLight: '#EDF3EF',
  borderDark: '#CBD8D0',
  borderFocus: '#0D5C46',

  // Helpers
  warning: '#D97706',
  danger: '#DC2626',

  // Semantic Statuses (Có nhãn tiếng Việt & màu tương ứng)
  status: {
    // Đã đăng ký / Đã xác nhận / Đã thanh toán / Thành công
    confirmed: {
      text: '#093F30',
      bg: '#E6F4EA',
      border: '#B6E0C7',
      dot: '#0D5C46',
    },
    // Chờ duyệt / Đang chờ xử lý / Cảnh báo
    pending: {
      text: '#92400E',
      bg: '#FEF3C7',
      border: '#FDE68A',
      dot: '#D97706',
    },
    // Đã hoàn thành (suất ăn đã diễn ra)
    completed: {
      text: '#1E40AF',
      bg: '#DBEAFE',
      border: '#93C5FD',
      dot: '#2563EB',
    },
    // Đã hủy / Đã cắt suất / Quá hạn / Thất bại
    cancelled: {
      text: '#991B1B',
      bg: '#FEE2E2',
      border: '#FECACA',
      dot: '#DC2626',
    },
    // Lịch nghỉ / Sự kiện lễ
    holiday: {
      text: '#5B21B6',
      bg: '#EDE9FE',
      border: '#DDD6FE',
      dot: '#7C3AED',
    },
    // Bếp nghỉ / Không phục vụ
    kitchenClosed: {
      text: '#9F1239',
      bg: '#FFE4E6',
      border: '#FECDD3',
      dot: '#E11D48',
    },
    // Chưa thanh toán
    unpaid: {
      text: '#9A3412',
      bg: '#FFEDD5',
      border: '#FED7AA',
      dot: '#EA580C',
    },
    // Quá hạn thanh toán
    overdue: {
      text: '#991B1B',
      bg: '#FEE2E2',
      border: '#FCA5A5',
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
      text: '#093F30',
      bg: '#E6F4EA',
      border: '#B6E0C7',
    },
    kitchen: {
      text: '#86198F',
      bg: '#FAE8FF',
      border: '#F0ABFC',
    },
  },

  // Overlay
  overlay: 'rgba(11, 38, 31, 0.45)',
};
