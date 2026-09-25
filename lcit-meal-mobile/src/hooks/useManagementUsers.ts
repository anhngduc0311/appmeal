/**
 * Hook - Management Users & Roles
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { useAuth } from '../providers/AuthProvider';
import { UserFilterParams, CreateUserRequest, UpdateUserRequest } from '../types';

export function useUsersList(params: UserFilterParams = {}) {
  const { isMockMode } = useAuth();

  return useQuery({
    queryKey: ['management', 'users', params, isMockMode],
    queryFn: () => userService.filter(params, isMockMode),
  });
}

export function useRolesList() {
  const { isMockMode } = useAuth();

  return useQuery({
    queryKey: ['roles', isMockMode],
    queryFn: () => userService.getRoles(isMockMode),
  });
}

export function useCreateUser() {
  const { isMockMode } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.create(data, isMockMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const { isMockMode } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
      userService.update(id, data, isMockMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const { isMockMode } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.delete(id, isMockMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
