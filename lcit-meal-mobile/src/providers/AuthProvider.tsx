/**
 * Auth Provider
 * Quản lý phiên đăng nhập, vai trò người dùng (Role),
 * Chuyển đổi nhanh tài khoản thử nghiệm (Demo) và toggle chế độ Mock.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole, LoginRequest } from '../types';
import { authService } from '../services/authService';
import { mockStore } from '../services/mockStore';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../config/constants';
import { env } from '../config/env';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  useMockData: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  switchMockUser: (userId: number) => Promise<void>;
  setUseMockData: (enabled: boolean) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [useMockData, setUseMockDataState] = useState<boolean>(env.defaultUseMock);

  // Khởi động và khôi phục phiên
  useEffect(() => {
    async function initAuth() {
      try {
        // Đọc cài đặt mock
        const savedMockSetting = await storage.getItem(STORAGE_KEYS.USE_MOCK_DATA);
        const isMock = savedMockSetting !== null ? savedMockSetting === 'true' : env.defaultUseMock;
        setUseMockDataState(isMock);

        // Khôi phục session
        const session = await authService.getStoredSession();
        if (session.user && session.token) {
          setUser(session.user);
          setToken(session.token);
          if (isMock) {
            mockStore.setCurrentUser(session.user.id);
          }
        } else if (isMock) {
          // Mặc định đăng nhập An (employee) trong mock mode
          const defaultUser = mockStore.getCurrentUser();
          const mockToken = `mock_token_${defaultUser.id}`;
          setUser(defaultUser);
          setToken(mockToken);
          await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);
          await storage.setObject(STORAGE_KEYS.USER_DATA, defaultUser);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      try {
        const res = await authService.login(credentials, useMockData);
        setUser(res.user);
        setToken(res.token);
      } finally {
        setIsLoading(false);
      }
    },
    [useMockData]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout(useMockData);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [useMockData]);

  const switchMockUser = useCallback(
    async (userId: number) => {
      mockStore.setCurrentUser(userId);
      const newUser = mockStore.getCurrentUser();
      const mockToken = `mock_token_${newUser.id}`;
      setUser(newUser);
      setToken(mockToken);
      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);
      await storage.setObject(STORAGE_KEYS.USER_DATA, newUser);
    },
    []
  );

  const setUseMockData = useCallback(async (enabled: boolean) => {
    setUseMockDataState(enabled);
    await storage.setItem(STORAGE_KEYS.USE_MOCK_DATA, enabled ? 'true' : 'false');
  }, []);

  const updateUserProfile = useCallback((data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  const role: UserRole | null = useMemo(() => {
    if (!user) return null;
    return user.role || (user.roles && user.roles[0]) || 'employee';
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      role,
      token,
      isAuthenticated: !!user && !!token,
      isLoading,
      useMockData,
      login,
      logout,
      switchMockUser,
      setUseMockData,
      updateUserProfile,
    }),
    [user, role, token, isLoading, useMockData, login, logout, switchMockUser, setUseMockData, updateUserProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
