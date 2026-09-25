/**
 * Common Component - ResultBanner
 * Biểu ngữ thông báo kết quả (Thành công, Lỗi, Cảnh báo, Thông tin)
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/radius';

export type BannerVariant = 'success' | 'error' | 'warning' | 'info';

export interface ResultBannerProps {
  variant?: BannerVariant;
  title?: string;
  message: string;
  onDismiss?: () => void;
  actionText?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ResultBanner: React.FC<ResultBannerProps> = ({
  variant = 'info',
  title,
  message,
  onDismiss,
  actionText,
  onAction,
  style,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: colors.status.confirmed.bg,
          border: colors.status.confirmed.border,
          text: colors.status.confirmed.text,
          iconName: 'checkmark-circle' as const,
          iconColor: colors.status.confirmed.dot,
        };
      case 'error':
        return {
          bg: colors.status.cancelled.bg,
          border: colors.status.cancelled.border,
          text: colors.status.cancelled.text,
          iconName: 'alert-circle' as const,
          iconColor: colors.status.cancelled.dot,
        };
      case 'warning':
        return {
          bg: colors.status.pending.bg,
          border: colors.status.pending.border,
          text: colors.status.pending.text,
          iconName: 'warning' as const,
          iconColor: colors.status.pending.dot,
        };
      case 'info':
      default:
        return {
          bg: colors.primary50,
          border: colors.primary300,
          text: colors.primaryDark,
          iconName: 'information-circle' as const,
          iconColor: colors.primary,
        };
    }
  };

  const v = getVariantStyles();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: v.bg, borderColor: v.border },
        style,
      ]}
    >
      <Ionicons name={v.iconName} size={22} color={v.iconColor} style={styles.icon} />

      <View style={styles.content}>
        {title && (
          <Text style={[styles.title, { color: v.text }]}>{title}</Text>
        )}
        <Text style={[styles.message, { color: v.text }]}>{message}</Text>

        {actionText && onAction && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onAction}
            style={styles.actionBtn}
          >
            <Text style={[styles.actionText, { color: v.text }]}>
              {actionText}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {onDismiss && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onDismiss}
          style={styles.dismissBtn}
          accessibilityRole="button"
          accessibilityLabel="Đóng thông báo"
        >
          <Ionicons name="close" size={18} color={v.text} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  icon: {
    marginRight: spacing.sm,
    marginTop: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  message: {
    fontSize: typography.sizes.xs,
    lineHeight: 18,
    fontWeight: typography.weights.medium,
  },
  actionBtn: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  actionText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textDecorationLine: 'underline',
  },
  dismissBtn: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
});
