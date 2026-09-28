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
      web: { boxShadow: '0 1px 3px rgba(13, 92, 70, 0.04), 0 1px 2px rgba(17, 38, 31, 0.03)' } as any,
      default: {
        shadowColor: '#0D5C46',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
      },
    }),
  },
  md: {
    ...Platform.select({
      web: { boxShadow: '0 4px 12px -2px rgba(13, 92, 70, 0.07), 0 2px 6px -1px rgba(17, 38, 31, 0.04)' } as any,
      default: {
        shadowColor: '#0D5C46',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  lg: {
    ...Platform.select({
      web: { boxShadow: '0 10px 24px -4px rgba(13, 92, 70, 0.1), 0 4px 10px -2px rgba(17, 38, 31, 0.05)' } as any,
      default: {
        shadowColor: '#0D5C46',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
  xl: {
    ...Platform.select({
      web: { boxShadow: '0 20px 32px -6px rgba(13, 92, 70, 0.14), 0 8px 16px -4px rgba(17, 38, 31, 0.06)' } as any,
      default: {
        shadowColor: '#0D5C46',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
};
