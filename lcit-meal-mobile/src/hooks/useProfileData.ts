/**
 * Hooks - Profile Data
 * Quản lý mutation cập nhật hồ sơ và đổi mật khẩu (T23)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/AuthProvider';
import { authService } from '../services/authService';
import { User, UpdateProfileRequest } from '../types';

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const { useMockData, updateUserProfile } = useAuth();

  return useMutation<User, Error, UpdateProfileRequest>({
    mutationFn: (data) => authService.updateProfile(data, useMockData),
    onSuccess: (updatedUser) => {
      updateUserProfile(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
