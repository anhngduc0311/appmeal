/**
 * Query Provider
 * Thiết lập TanStack React Query Client với cấu hình cache và an toàn mutation
 * TUÂN THỦ T25: retry = 0 cho mutation để không tự động retry thao tác có tác dụng phụ.
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 phút
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0, // Không tự retry mutation
    },
  },
});

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export { queryClient };
