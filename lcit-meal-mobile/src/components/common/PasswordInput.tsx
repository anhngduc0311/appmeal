/**
 * Common Component - PasswordInput
 * Ô nhập mật khẩu có nút bấm ẩn/hiện mật khẩu, bảo đảm vùng chạm tối thiểu 48px.
 */

import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input, InputProps } from './Input';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export interface PasswordInputProps extends Omit<InputProps, 'rightIcon' | 'secureTextEntry'> {
  showToggle?: boolean;
}

export const PasswordInput = React.forwardRef<TextInput, PasswordInputProps>(({
  showToggle = true,
  ...props
}, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const toggleVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const eyeIcon = showToggle ? (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={toggleVisibility}
      style={styles.toggleButton}
      accessibilityRole="button"
      accessibilityLabel={isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
    >
      <Ionicons
        name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
        size={22}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  ) : undefined;

  return (
    <Input
      ref={ref}
      secureTextEntry={!isPasswordVisible}
      rightIcon={eyeIcon}
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

const styles = StyleSheet.create({
  toggleButton: {
    height: spacing.minTouchTarget,
    width: spacing.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.sm,
  },
});
