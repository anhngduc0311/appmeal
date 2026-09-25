/**
 * useMockStore Hook
 * Sử dụng useSyncExternalStore chuẩn của React 18/19 để đồng bộ dữ liệu reactive từ MockStore
 * mà không gây ra cascading render hay cảnh báo setState trong useEffect.
 */

import { useSyncExternalStore, useCallback } from 'react';
import { mockStore } from '../services/mockStore';

export function useMockStore<T>(selector: () => T): T {
  const subscribe = useCallback((callback: () => void) => {
    return mockStore.subscribe(callback);
  }, []);

  return useSyncExternalStore(subscribe, selector, selector);
}
