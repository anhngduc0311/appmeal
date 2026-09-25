/**
 * Types - Notifications
 * Khớp với backend Notification.js và schema database
 */

export type NotificationType =
  | 'LATE_REGISTRATION'
  | 'PAYMENT_DUE'
  | 'PAYMENT_OVERDUE'
  | 'APPROVAL'
  | 'SYSTEM'
  | string;

export interface NotificationItem {
  id: number;
  title: string;
  content: string;
  url?: string | null;
  type?: NotificationType;
  status?: string;
  createdAt: string;
  createdBy?: number | null;
  // Khi query inbox /me:
  isSeen?: boolean | number;
  seenAt?: string | null;
}

export interface UnseenCountResponse {
  count: number;
}
