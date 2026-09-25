/**
 * Secure Storage Utility
 * Sử dụng Expo SecureStore trên native và localStorage / Memory fallback trên Web
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const memoryFallbackStore = new Map<string, string>();

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        }
        return memoryFallbackStore.get(key) || null;
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return memoryFallbackStore.get(key) || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
        memoryFallbackStore.set(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch {
      memoryFallbackStore.set(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
        memoryFallbackStore.delete(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch {
      memoryFallbackStore.delete(key);
    }
  },

  async getObject<T>(key: string): Promise<T | null> {
    const raw = await this.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async setObject<T>(key: string, value: T): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  },
};
