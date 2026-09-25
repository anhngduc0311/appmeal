/**
 * Common Component - Input
 * Ô nhập liệu chuẩn với nhãn tiếng Việt, thông báo lỗi, icon đầu/cuối,
 * viền focus xanh lá và chiều cao tối thiểu 48px.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/radius';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  required,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.requiredMark}> *</Text>}
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            leftIcon ? { paddingLeft: spacing.xs } : null,
            rightIcon ? { paddingRight: spacing.xs } : null,
            inputStyle,
          ]}
          placeholderTextColor={colors.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />

        {rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  requiredMark: {
    fontSize: typography.sizes.sm,
    color: colors.status.cancelled.dot,
    fontWeight: typography.weights.bold,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: spacing.minTouchTarget, // Tối thiểu 48px
    minHeight: spacing.minTouchTarget,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  inputFocused: {
    borderColor: colors.borderFocus,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.status.cancelled.dot,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  leftIconWrapper: {
    marginRight: spacing.sm,
  },
  rightIconWrapper: {
    marginLeft: spacing.sm,
  },
  errorText: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.xs,
    color: colors.status.cancelled.dot,
    fontWeight: typography.weights.medium,
  },
  helperText: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
});
