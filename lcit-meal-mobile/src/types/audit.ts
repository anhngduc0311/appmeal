/**
 * Types - Audit Logs
 * Khớp với AuditLog.js và AuditLogController.js
 */

export interface AuditLogItem {
  id: number;
  logActor?: number | null;
  log_actor?: number | null;
  actorName?: string | null;
  actor_name?: string | null;
  actorUsername?: string | null;
  actor_username?: string | null;
  logAction: string;
  log_action?: string;
  logTarget?: string | null;
  log_target?: string | null;
  logResult: 'success' | 'failed' | string;
  log_result?: string;
  logDetail?: string | null;
  log_detail?: string | null;
  ipAddress?: string | null;
  ip_address?: string | null;
  userAgent?: string | null;
  user_agent?: string | null;
  oldData?: unknown;
  old_data?: unknown;
  newData?: unknown;
  new_data?: unknown;
  createdAt: string;
  log_time?: string;
}

export interface AuditLogFilterParams {
  query?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
