/**
 * Hook: useNetworkStatus
 * Theo dõi trạng thái kết nối mạng (Online / Offline)
 * Hoạt động trơn tru trên cả Web, iOS và Android
 */

import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.navigator.onLine;
    }
    return true;
  });
  const [isReconnected, setIsReconnected] = useState<boolean>(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        const handleOnline = () => {
          setIsConnected(true);
          setIsReconnected(true);
          const timer = setTimeout(() => setIsReconnected(false), 3000);
          return () => clearTimeout(timer);
        };

        const handleOffline = () => {
          setIsConnected(false);
          setIsReconnected(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }
    } else {
      // Native fallback: Periodic connectivity check
      let isMounted = true;

      const checkConnectivity = async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          const res = await fetch('https://www.google.com/generate_204', {
            method: 'HEAD',
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (isMounted) {
            if (!isConnected && (res.ok || res.status === 204)) {
              setIsReconnected(true);
              setTimeout(() => {
                if (isMounted) setIsReconnected(false);
              }, 3000);
            }
            setIsConnected(true);
          }
        } catch {
          if (isMounted) {
            setIsConnected(false);
          }
        }
      };

      const interval = setInterval(checkConnectivity, 15000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [isConnected]);

  return { isConnected, isReconnected };
}
