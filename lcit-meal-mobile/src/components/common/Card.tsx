import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TouchableOpacityProps,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';

export interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: keyof typeof spacing;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'lg',
  style,
  onPress,
  ...props
}) => {
  const paddingValue = spacing[padding] || spacing.lg;

  const cardStyle: ViewStyle = {
    padding: paddingValue,
    ...(variant === 'elevated' ? { ...styles.elevated, ...shadows.sm } : null),
    ...(variant === 'outlined' ? styles.outlined : null),
    ...(variant === 'flat' ? styles.flat : null),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        style={[styles.base, cardStyle, style]}
        accessibilityRole="button"
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.base, cardStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  outlined: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
  },
  flat: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 0,
  },
});
