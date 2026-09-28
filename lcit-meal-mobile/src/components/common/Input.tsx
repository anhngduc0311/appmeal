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
  multiline,
  style,
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
          multiline && styles.inputContainerMultiline,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {leftIcon && (
          <View style={[styles.leftIconWrapper, multiline && styles.leftIconMultiline]}>
            {leftIcon}
          </View>
        )}

        <TextInput
          accessibilityLabel={label}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            leftIcon ? { paddingLeft: spacing.xs } : null,
            rightIcon ? { paddingRight: spacing.xs } : null,
            inputStyle,
            style,
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

        {rightIcon && (
          <View style={[styles.rightIconWrapper, multiline && styles.rightIconMultiline]}>
            {rightIcon}
          </View>
        )}
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
    marginBottom: 6,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
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
    height: 50,
    minHeight: spacing.minTouchTarget,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  inputContainerMultiline: {
    height: undefined,
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
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
    paddingVertical: 0,
  },
  inputMultiline: {
    height: undefined,
    minHeight: 84,
    paddingTop: 4,
    paddingBottom: 4,
    textAlignVertical: 'top',
  },
  leftIconWrapper: {
    marginRight: spacing.sm,
  },
  leftIconMultiline: {
    marginTop: 4,
  },
  rightIconWrapper: {
    marginLeft: spacing.sm,
  },
  rightIconMultiline: {
    marginTop: 4,
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
