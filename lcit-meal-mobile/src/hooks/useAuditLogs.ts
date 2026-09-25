/**
 * Hook - Audit Logs (Admin only)
 */

import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/auditService';
import { useAuth } from '../providers/AuthProvider';
import { AuditLogFilterParams } from '../types';

export function useAuditLogs(params: AuditLogFilterParams = {}) {
  const { isMockMode } = useAuth();

  return useQuery({
    queryKey: ['audit-logs', params, isMockMode],
    queryFn: () => auditService.filter(params, isMockMode),
  });
}
