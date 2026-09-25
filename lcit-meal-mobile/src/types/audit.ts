/**
 * Types - Audit Logs
 * Khớp với AuditLog.js và AuditLogController.js
 */

export interface AuditLogItem {
  id: number;
  logActor?: number | null;
  actorName?: string | null;
  actorUsername?: string | null;
  logAction: string;
  logTarget?: string | null;
  logResult: 'success' | 'failed' | string;
  logDetail?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  oldData?: unknown;
  newData?: unknown;
  createdAt: string;
}

export interface AuditLogFilterParams {
  query?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
