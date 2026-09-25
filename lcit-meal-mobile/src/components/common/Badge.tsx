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
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/radius';

export type BadgeType = 'mealRegistration' | 'mealOption' | 'payment' | 'role' | 'custom';

export interface BadgeProps {
  type?: BadgeType;
  value?: MealRegistrationStatus | MealOptionStatus | PaymentStatus | UserRole | string;
  isMealCancelled?: boolean | number;
  customLabel?: string;
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
  customLabel,
  customConfig,
  showDot = true,
  showIcon = false,
  size = 'md',
  style,
  textStyle,
}) => {
  let config: StatusConfig;

  if (type === 'mealRegistration') {
    config = getMealRegistrationStatusConfig(value as MealRegistrationStatus, isMealCancelled);
  } else if (type === 'mealOption') {
    config = getMealOptionStatusConfig(value as MealOptionStatus);
  } else if (type === 'payment') {
    config = getPaymentStatusConfig(value as PaymentStatus);
  } else if (type === 'role') {
    config = getRoleConfig(value as UserRole);
  } else {
    config = {
      label: customLabel || String(value || ''),
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
        {customLabel || config.label}
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
