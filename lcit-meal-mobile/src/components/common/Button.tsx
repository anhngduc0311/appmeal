/**
 * Common Component - Button
 * Nút bấm chuẩn với các biến thể (primary, secondary, outline, danger, ghost),
 * hiệu ứng nhấn, loading spinner và bảo đảm vùng chạm tối thiểu 48px.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  TouchableOpacityProps,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = false,
  ...props
}) => {
  const isInteractive = !disabled && !loading;

  // Lấy kiểu dáng theo biến thể
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.surfaceSubtle,
            borderColor: colors.border,
            borderWidth: 1,
          },
          text: {
            color: colors.text,
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderColor: colors.primary,
            borderWidth: 1.5,
          },
          text: {
            color: colors.primary,
          },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: colors.status.cancelled.dot,
            borderColor: colors.status.cancelled.dot,
            borderWidth: 1,
          },
          text: {
            color: colors.textInverse,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: colors.primary,
          },
        };
      case 'primary':
      default:
        return {
          container: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
            borderWidth: 1,
            ...shadows.sm,
          },
          text: {
            color: colors.textInverse,
          },
        };
    }
  };

  // Lấy kích thước
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            height: 40,
            minHeight: 40,
            paddingHorizontal: spacing.md,
            borderRadius: radius.md,
          },
          text: {
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.semibold,
          },
        };
      case 'lg':
        return {
          container: {
            height: 52,
            minHeight: 52,
            paddingHorizontal: spacing['2xl'],
            borderRadius: radius.xl,
          },
          text: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.bold,
          },
        };
      case 'md':
      default:
        return {
          container: {
            height: spacing.minTouchTarget, // 48px
            minHeight: spacing.minTouchTarget,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.lg,
          },
          text: {
            fontSize: typography.sizes.sm + 1,
            fontWeight: typography.weights.semibold,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!isInteractive}
      style={[
        styles.baseContainer,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabledContainer,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? colors.textInverse : colors.primary}
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            style={[
              styles.baseText,
              variantStyles.text,
              sizeStyles.text,
              disabled && styles.disabledText,
              leftIcon ? { marginLeft: spacing.sm } : null,
              rightIcon ? { marginRight: spacing.sm } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    paddingVertical: spacing.xs,
  },
  fullWidth: {
    width: '100%',
  },
  baseText: {
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  disabledContainer: {
    opacity: 0.5,
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
  },
  disabledText: {
    color: colors.textMuted,
  },
});
