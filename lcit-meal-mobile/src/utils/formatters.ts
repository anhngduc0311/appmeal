/**
 * Utility Formatters
 * Định dạng ngày giờ chuẩn Việt Nam, tiền tệ VNĐ, thứ trong tuần
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
 * Chuyển đổi Date / string thành YYYY-MM-DD (Business Date)
 */
export function formatBusinessDate(dateInput: string | Date | number): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Định dạng hiển thị dd/MM/yyyy
 */
export function formatDisplayDate(dateInput: string | Date | number): string {
  if (!dateInput) return '';
  // Nếu là dạng YYYY-MM-DD
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, d] = dateInput.split('-');
    return `${d}/${m}/${y}`;
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Định dạng hiển thị ngày có thứ: "Thứ Sáu, 26/09/2026"
 */
export function formatFullDisplayDate(dateInput: string | Date | number): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
    ? new Date(`${dateInput}T00:00:00`)
    : new Date(dateInput);

  if (isNaN(d.getTime())) return String(dateInput);
  const dayOfWeek = DAYS_OF_WEEK_VI[d.getDay()];
  return `${dayOfWeek}, ${formatDisplayDate(d)}`;
}

/**
 * Lấy tên thứ ngắn: "T2", "T3"...
 */
export function getShortDayOfWeek(dateInput: string | Date | number): string {
  const d = typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
    ? new Date(`${dateInput}T00:00:00`)
    : new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return SHORT_DAYS_OF_WEEK_VI[d.getDay()];
}

/**
 * Định dạng ngày giờ: "14:30 25/09/2026"
 */
export function formatDateTime(dateInput: string | Date | number): string {
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
  const today = formatBusinessDate(new Date());
  const targetDate = formatBusinessDate(dateStr);

  if (targetDate === today) return 'Hôm nay';

  const d = new Date();
  d.setDate(d.getDate() + 1);
  const tomorrow = formatBusinessDate(d);
  if (targetDate === tomorrow) return 'Ngày mai';

  d.setDate(d.getDate() - 2);
  const yesterday = formatBusinessDate(d);
  if (targetDate === yesterday) return 'Hôm qua';

  return formatFullDisplayDate(dateStr);
}
