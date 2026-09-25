/**
 * Theme Hook
 * Cung cấp theme, màu sắc và typography của LCIT Meal
 */

import { theme, colors, spacing, typography, radius, shadows } from '../theme';

export function useTheme() {
  return {
    theme,
    colors,
    spacing,
    typography,
    radius,
    shadows,
  };
}
