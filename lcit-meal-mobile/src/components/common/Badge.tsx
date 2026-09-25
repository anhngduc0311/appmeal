/**
 * Common Component - Badge / StatusBadge
 * Nhãn trạng thái trực quan: Bắt buộc có cả TÊN NHÃN TIẾNG VIỆT và MÀU SẮC tương ứng
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getMealRegistrationStatusConfig,
  getMealOptionStatusConfig,
  getPaymentStatusConfig,
  getRoleConfig,
  StatusConfig,
} from '../../utils/statusHelper';
import {
  MealRegistrationStatus,
  MealOptionStatus,
  PaymentStatus,
  UserRole,
} from '../../types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/radius';

export type BadgeType = 'mealRegistration' | 'mealOption' | 'payment' | 'role' | 'custom';

export interface BadgeProps {
  type?: BadgeType;
  value?: MealRegistrationStatus | MealOptionStatus | PaymentStatus | UserRole | string;
  isMealCancelled?: boolean | number;
  label?: string;
  customLabel?: string;
  variant?: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'danger' | 'warning' | 'success' | string;
  customConfig?: Partial<StatusConfig>;
  showDot?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  type = 'custom',
  value,
  isMealCancelled,
  label,
  customLabel,
  variant,
  customConfig,
  showDot = true,
  showIcon = false,
  size = 'md',
  style,
  textStyle,
}) => {
  let config: StatusConfig;

  const displayLabel = label || customLabel || String(value || '');

  if (variant) {
    if (variant === 'confirmed' || variant === 'success') {
      config = {
        label: displayLabel,
        textColor: colors.status.confirmed.text,
        bgColor: colors.status.confirmed.bg,
        borderColor: colors.status.confirmed.border,
        dotColor: colors.status.confirmed.dot,
      };
    } else if (variant === 'pending' || variant === 'warning') {
      config = {
        label: displayLabel,
        textColor: colors.status.pending.text,
        bgColor: colors.status.pending.bg,
        borderColor: colors.status.pending.border,
        dotColor: colors.status.pending.dot,
      };
    } else if (variant === 'cancelled' || variant === 'danger') {
      config = {
        label: displayLabel,
        textColor: colors.status.cancelled.text,
        bgColor: colors.status.cancelled.bg,
        borderColor: colors.status.cancelled.border,
        dotColor: colors.status.cancelled.dot,
      };
    } else if (variant === 'completed') {
      config = {
        label: displayLabel,
        textColor: colors.status.completed.text,
        bgColor: colors.status.completed.bg,
        borderColor: colors.status.completed.border,
        dotColor: colors.status.completed.dot,
      };
    } else {
      config = {
        label: displayLabel,
        textColor: customConfig?.textColor || '#475569',
        bgColor: customConfig?.bgColor || '#F1F5F9',
        borderColor: customConfig?.borderColor || '#E2E8F0',
        dotColor: customConfig?.dotColor || '#94A3B8',
      };
    }
  } else if (type === 'mealRegistration') {
    config = getMealRegistrationStatusConfig(value as MealRegistrationStatus, isMealCancelled);
  } else if (type === 'mealOption') {
    config = getMealOptionStatusConfig(value as MealOptionStatus);
  } else if (type === 'payment') {
    config = getPaymentStatusConfig(value as PaymentStatus);
  } else if (type === 'role') {
    config = getRoleConfig(value as UserRole);
  } else {
    config = {
      label: displayLabel,
      textColor: customConfig?.textColor || '#475569',
      bgColor: customConfig?.bgColor || '#F1F5F9',
      borderColor: customConfig?.borderColor || '#E2E8F0',
      dotColor: customConfig?.dotColor || '#94A3B8',
      iconName: customConfig?.iconName,
    };
  }

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        },
        isSmall && styles.containerSmall,
        style,
      ]}
    >
      {showDot && config.dotColor && (
        <View
          style={[
            styles.dot,
            { backgroundColor: config.dotColor },
            isSmall && styles.dotSmall,
          ]}
        />
      )}

      {showIcon && config.iconName && (
        <Ionicons
          name={config.iconName as any}
          size={isSmall ? 12 : 14}
          color={config.textColor}
          style={styles.icon}
        />
      )}

      <Text
        style={[
          styles.text,
          { color: config.textColor },
          isSmall && styles.textSmall,
          textStyle,
        ]}
      >
        {label || customLabel || config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  containerSmall: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  textSmall: {
    fontSize: typography.sizes['2xs'],
  },
});
