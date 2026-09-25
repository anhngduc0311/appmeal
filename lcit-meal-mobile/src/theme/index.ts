/**
 * LCIT Meal Theme Export
 */

import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { radius } from './radius';
import { shadows } from './shadows';

export const theme = {
  colors,
  spacing,
  typography,
  radius,
  shadows,
};

export type Theme = typeof theme;

export { colors, spacing, typography, radius, shadows };
