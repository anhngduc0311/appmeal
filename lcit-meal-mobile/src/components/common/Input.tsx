/**
 * Common Component - Input
 * Ô nhập liệu chuẩn với nhãn tiếng Việt, thông báo lỗi, icon đầu/cuối,
 * viền focus xanh lá và chiều cao tối thiểu 48px.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Platform,
  Pressable,
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

export const Input = React.forwardRef<TextInput, InputProps>(({
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
  autoCorrect = false,
  spellCheck = false,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput | null>(null);

  const handleRef = (node: TextInput | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<TextInput | null>).current = node;
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label} onPress={focusInput}>{label}</Text>
          {required && <Text style={styles.requiredMark}> *</Text>}
        </View>
      )}

      <Pressable
        onPress={focusInput}
        style={[
          styles.inputContainer,
          multiline && styles.inputContainerMultiline,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
          Platform.OS === 'web' && ({ cursor: 'text' } as any),
        ]}
      >
        {leftIcon && (
          <View style={[styles.leftIconWrapper, multiline && styles.leftIconMultiline]}>
            {leftIcon}
          </View>
        )}

        <TextInput
          ref={handleRef}
          accessibilityLabel={label}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          autoCorrect={autoCorrect}
          spellCheck={spellCheck}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            leftIcon ? { paddingLeft: spacing.xs } : null,
            rightIcon ? { paddingRight: spacing.xs } : null,
            Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
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
      </Pressable>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
});

Input.displayName = 'Input';

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
    includeFontPadding: false,
  },
  inputMultiline: {
    height: undefined,
    minHeight: 84,
    paddingTop: 8,
    paddingBottom: 8,
    textAlignVertical: 'top',
    includeFontPadding: false,
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
