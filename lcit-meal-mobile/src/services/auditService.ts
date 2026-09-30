/**
 * Audit Log Service (Admin only)
 * Quản lý nhật ký hoạt động hệ thống
 */

import { apiClient, extractDataList } from './apiClient';
import { mockStore } from './mockStore';
import { AuditLogItem, AuditLogFilterParams, PaginatedData } from '../types';

/**
 * Chuẩn hóa Audit Log từ Backend (snake_case) hoặc Mock (camelCase)
 */
export function normalizeAuditLog(raw: any): AuditLogItem {
  if (!raw) {
    return {
      id: 0,
      logAction: 'system',
      logResult: 'success',
      createdAt: '',
    };
  }

  let oldData = raw.oldData ?? raw.old_data ?? null;
  let newData = raw.newData ?? raw.new_data ?? null;

  if (typeof oldData === 'string' && (oldData.startsWith('{') || oldData.startsWith('['))) {
    try {
      oldData = JSON.parse(oldData);
    } catch {
      // Giữ nguyên chuỗi
    }
  }

  if (typeof newData === 'string' && (newData.startsWith('{') || newData.startsWith('['))) {
    try {
      newData = JSON.parse(newData);
    } catch {
      // Giữ nguyên chuỗi
    }
  }

  const logAction = String(raw.logAction ?? raw.log_action ?? 'system');
  const logDetail = String(raw.logDetail ?? raw.log_detail ?? logAction);
  const actorName = raw.actorName ?? raw.actor_name ?? 'Hệ thống';
  const actorUsername = raw.actorUsername ?? raw.actor_username ?? '';
  const createdAt = String(raw.createdAt ?? raw.log_time ?? raw.created_at ?? '');

  return {
    id: Number(raw.id) || 0,
    logActor: raw.logActor ?? raw.log_actor ?? null,
    actorName,
    actorUsername,
    logAction,
    log_action: logAction,
    logTarget: raw.logTarget ?? raw.log_target ?? null,
    log_target: raw.logTarget ?? raw.log_target ?? null,
    logResult: raw.logResult ?? raw.log_result ?? 'success',
    log_result: raw.logResult ?? raw.log_result ?? 'success',
    logDetail,
    log_detail: logDetail,
    ipAddress: raw.ipAddress ?? raw.ip_address ?? null,
    userAgent: raw.userAgent ?? raw.user_agent ?? null,
    oldData,
    newData,
    createdAt,
    log_time: createdAt,
  };
}

export const auditService = {
  /**
   * Lấy danh sách nhật ký: GET /api/audit-logs
   */
  async list(useMock = false): Promise<AuditLogItem[]> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return mockStore.getAuditLogs().map(normalizeAuditLog);
    }
    const res = await apiClient<any[] | PaginatedData<any>>('/audit-logs');
    const list = extractDataList<any>(res);
    return list.map(normalizeAuditLog);
  },

  /**
   * Lọc nhật ký hệ thống: GET /api/audit-logs/filter
   */
  async filter(params: AuditLogFilterParams, useMock = false): Promise<AuditLogItem[]> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      let logs = mockStore.getAuditLogs().map(normalizeAuditLog);
      if (params.query) {
        const q = params.query.toLowerCase();
        logs = logs.filter(
          (l) =>
            (l.actorName && l.actorName.toLowerCase().includes(q)) ||
            (l.actorUsername && l.actorUsername.toLowerCase().includes(q)) ||
            (l.logDetail && l.logDetail.toLowerCase().includes(q)) ||
            (l.logTarget && l.logTarget.toLowerCase().includes(q))
        );
      }
      if (params.action) {
        logs = logs.filter((l) => l.logAction === params.action);
      }
      return logs;
    }

    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.action) queryParams.append('action', params.action);
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));

    const res = await apiClient<any[] | PaginatedData<any>>(
      `/audit-logs/filter?${queryParams.toString()}`
    );
    const list = extractDataList<any>(res);
    return list.map(normalizeAuditLog);
  },

  /**
   * Xem chi tiết một nhật ký: GET /api/audit-logs/:id
   */
  async get(id: number, useMock = false): Promise<AuditLogItem> {
    if (useMock) {
      const item = mockStore.getAuditLogs().find((l) => l.id === id);
      if (!item) throw new Error('Không tìm thấy nhật ký thao tác');
      return normalizeAuditLog(item);
    }
    const res = await apiClient<any>(`/audit-logs/${id}`);
    return normalizeAuditLog(res);
  },
};

