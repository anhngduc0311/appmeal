/**
 * State Component - ErrorState
 * Trạng thái xảy ra lỗi có nút bấm "Thử lại" (Retry)
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../common/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Đã có lỗi xảy ra',
  message = 'Không thể tải dữ liệu từ máy chủ. Vui lòng kiểm tra lại kết nối và thử lại.',
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons
          name="alert-circle-outline"
          size={36}
          color={colors.status.cancelled.dot}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {onRetry && (
        <Button
          title="Thử lại"
          variant="primary"
          size="md"
          leftIcon={
            <Ionicons
              name="refresh-outline"
              size={18}
              color={colors.textInverse}
            />
          }
          onPress={onRetry}
          style={styles.retryBtn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    minHeight: 260,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.status.cancelled.bg,
    borderWidth: 1,
    borderColor: colors.status.cancelled.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 290,
    marginBottom: spacing.lg,
  },
  retryBtn: {
    minWidth: 140,
  },
});
