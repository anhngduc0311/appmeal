/**
 * Design Tokens - Typography & Fonts
 * Cỡ chữ, độ dày và khoảng cách dòng chuẩn
 */

import { TextStyle } from 'react-native';

export const typography = {
  // Font sizes
  sizes: {
    '2xs': 10,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },

  // Font weights
  weights: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    extrabold: '800' as TextStyle['fontWeight'],
  },

  // Line heights
  lineHeights: {
    tight: 1.25,
    normal: 1.45,
    relaxed: 1.65,
  },

  // Android typography optimization helper
  androidText: {
    includeFontPadding: false,
  } as TextStyle,
};

