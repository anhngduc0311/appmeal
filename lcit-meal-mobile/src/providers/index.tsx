/**
 * App Providers
 * Tổng hợp các Provider của ứng dụng: SafeAreaProvider, QueryProvider, AuthProvider
 */

import React from 'react';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
};

export * from './AuthProvider';
export * from './QueryProvider';
