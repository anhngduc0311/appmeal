/**
 * Audit Log Service (Admin only)
 * Quản lý nhật ký hoạt động hệ thống
 */

import { apiClient, extractDataList } from './apiClient';
import { mockStore } from './mockStore';
import { AuditLogItem, AuditLogFilterParams, PaginatedData } from '../types';

export const auditService = {
  /**
   * Lấy danh sách nhật ký: GET /api/audit-logs
   */
  async list(useMock = false): Promise<AuditLogItem[]> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      return mockStore.getAuditLogs();
    }
    const res = await apiClient<AuditLogItem[] | PaginatedData<AuditLogItem>>('/audit-logs');
    return extractDataList<AuditLogItem>(res);
  },

  /**
   * Lọc nhật ký hệ thống: GET /api/audit-logs/filter
   */
  async filter(params: AuditLogFilterParams, useMock = false): Promise<AuditLogItem[]> {
    if (useMock) {
      await new Promise((res) => setTimeout(res, 200));
      let logs = mockStore.getAuditLogs();
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

    const res = await apiClient<AuditLogItem[] | PaginatedData<AuditLogItem>>(
      `/audit-logs/filter?${queryParams.toString()}`
    );
    return extractDataList<AuditLogItem>(res);
  },

  /**
   * Xem chi tiết một nhật ký: GET /api/audit-logs/:id
   */
  async get(id: number, useMock = false): Promise<AuditLogItem> {
    if (useMock) {
      const item = mockStore.getAuditLogs().find((l) => l.id === id);
      if (!item) throw new Error('Không tìm thấy nhật ký thao tác');
      return item;
    }
    return await apiClient<AuditLogItem>(`/audit-logs/${id}`);
  },
};
