/**
 * Types - Payments
 * Khớp với backend Payment.js và schema database
 */

export type PaymentStatus = 'unpaid' | 'paid' | 'overdue';

export interface Payment {
  id: number;
  userId: number;
  paymentDate: string; // YYYY-MM-DD
  amount: number;
  isPaid: boolean | number;
  paidAmount?: number | null;
  paidAt?: string | null;
  billImg?: string | null;
  status: PaymentStatus;
  user?: {
    id: number;
    fullName: string;
    username: string;
  };
}

export interface PaymentSummary {
  totalUnpaidAmount: number;
  unpaidCount: number;
  overdueCount: number;
  latestPaymentDate?: string;
}
