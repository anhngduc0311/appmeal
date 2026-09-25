/**
 * Utility Formatters
 * Định dạng ngày giờ chuẩn nghiệp vụ Việt Nam, tiền tệ VNĐ, thứ trong tuần.
 * TUÂN THỦ T24: Tuyệt đối không dùng chuyển đổi UTC gây lệch ngày ăn (YYYY-MM-DD).
 */

const DAYS_OF_WEEK_VI = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

const SHORT_DAYS_OF_WEEK_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/**
 * Phân tích chuỗi ngày hoặc đối tượng Date thành các thành phần { year, month, day }
 * An toàn với múi giờ Việt Nam và định dạng YYYY-MM-DD
 */
export function parseDateParts(
  dateInput: string | Date | number | null | undefined
): { year: number; month: number; day: number } | null {
  if (!dateInput) return null;

  if (typeof dateInput === 'string') {
    const match = dateInput.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return {
        year: parseInt(match[1], 10),
        month: parseInt(match[2], 10),
        day: parseInt(match[3], 10),
      };
    }
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

/**
 * Chuyển đổi Date / string thành YYYY-MM-DD (Business Date)
 */
export function formatBusinessDate(
  dateInput: string | Date | number | null | undefined
): string {
  const parts = parseDateParts(dateInput);
  if (!parts) return '';
  const y = String(parts.year);
  const m = String(parts.month).padStart(2, '0');
  const d = String(parts.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Định dạng hiển thị dd/MM/yyyy
 */
export function formatDisplayDate(
  dateInput: string | Date | number | null | undefined
): string {
  const parts = parseDateParts(dateInput);
  if (!parts) return '';
  const d = String(parts.day).padStart(2, '0');
  const m = String(parts.month).padStart(2, '0');
  const y = String(parts.year);
  return `${d}/${m}/${y}`;
}

/**
 * Alias cho formatDisplayDate
 */
export const formatBusinessDateDisplay = formatDisplayDate;

/**
 * Định dạng hiển thị ngày có thứ: "Thứ Sáu, 26/09/2026"
 */
export function formatFullDisplayDate(
  dateInput: string | Date | number | null | undefined
): string {
  const parts = parseDateParts(dateInput);
  if (!parts) return '';

  const localDate = new Date(parts.year, parts.month - 1, parts.day);
  const dayOfWeek = DAYS_OF_WEEK_VI[localDate.getDay()];
  const displayDate = formatDisplayDate(dateInput);

  return `${dayOfWeek}, ${displayDate}`;
}

/**
 * Lấy tên thứ ngắn: "T2", "T3", "CN"...
 */
export function getShortDayOfWeek(
  dateInput: string | Date | number | null | undefined
): string {
  const parts = parseDateParts(dateInput);
  if (!parts) return '';

  const localDate = new Date(parts.year, parts.month - 1, parts.day);
  return SHORT_DAYS_OF_WEEK_VI[localDate.getDay()];
}

/**
 * Lấy thứ đầy đủ: "Thứ Hai", "Chủ Nhật"...
 */
export function getFullDayOfWeek(
  dateInput: string | Date | number | null | undefined
): string {
  const parts = parseDateParts(dateInput);
  if (!parts) return '';

  const localDate = new Date(parts.year, parts.month - 1, parts.day);
  return DAYS_OF_WEEK_VI[localDate.getDay()];
}

/**
 * Định dạng ngày giờ: "14:30 25/09/2026"
 */
export function formatDateTime(
  dateInput: string | Date | number | null | undefined
): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} ${formatDisplayDate(d)}`;
}

/**
 * Định dạng tiền tệ VNĐ: "660.000 đ"
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '0 đ';
  }
  const num = Number(amount);
  return `${num.toLocaleString('vi-VN')} đ`;
}

/**
 * Mô tả ngày tương đối (Hôm nay, Ngày mai, Hôm qua)
 */
export function getRelativeDateLabel(dateStr: string): string {
  const now = new Date();
  const today = formatBusinessDate(now);
  const targetDate = formatBusinessDate(dateStr);

  if (targetDate === today) return 'Hôm nay';

  const tomorrowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrow = formatBusinessDate(tomorrowDate);
  if (targetDate === tomorrow) return 'Ngày mai';

  const yesterdayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterday = formatBusinessDate(yesterdayDate);
  if (targetDate === yesterday) return 'Hôm qua';

  return formatFullDisplayDate(dateStr);
}

/**
 * So sánh 2 ngày nghiệp vụ (YYYY-MM-DD)
 * @returns 0 nếu bằng nhau, < 0 nếu d1 trước d2, > 0 nếu d1 sau d2
 */
export function compareBusinessDates(d1: string, d2: string): number {
  const b1 = formatBusinessDate(d1);
  const b2 = formatBusinessDate(d2);
  return b1.localeCompare(b2);
}

/**
 * Lấy ngày hôm nay theo định dạng chuẩn YYYY-MM-DD
 */
export function getTodayBusinessDate(): string {
  return formatBusinessDate(new Date());
}
