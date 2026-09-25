/**
 * Design Tokens - Shadows
 * Hiệu ứng đổ bóng mềm mại, thanh lịch cho iOS, Android và Web
 */

import { ViewStyle, Platform } from 'react-native';

export const shadows: Record<'none' | 'sm' | 'md' | 'lg' | 'xl', ViewStyle> = {
  none: {
    ...Platform.select({
      web: { boxShadow: 'none' } as any,
      default: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
    }),
  },
  sm: {
    ...Platform.select({
      web: { boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)' } as any,
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
  },
  md: {
    ...Platform.select({
      web: { boxShadow: '0 2px 4px rgba(15, 23, 42, 0.08)' } as any,
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  lg: {
    ...Platform.select({
      web: { boxShadow: '0 4px 8px rgba(15, 23, 42, 0.1)' } as any,
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  xl: {
    ...Platform.select({
      web: { boxShadow: '0 8px 16px rgba(15, 23, 42, 0.12)' } as any,
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
};
