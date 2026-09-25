/**
 * State Component - ForbiddenState
 * Trạng thái không có quyền truy cập (403 Forbidden)
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../common/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface ForbiddenStateProps {
  title?: string;
  message?: string;
  onGoBack?: () => void;
  style?: ViewStyle;
}

export const ForbiddenState: React.FC<ForbiddenStateProps> = ({
  title = 'Không có quyền truy cập',
  message = 'Tài khoản của bạn không được phân quyền để thực hiện chức năng này.',
  onGoBack,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons
          name="shield-outline"
          size={36}
          color={colors.status.cancelled.dot}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {onGoBack && (
        <Button
          title="Quay lại trang chủ"
          variant="outline"
          size="md"
          onPress={onGoBack}
          style={styles.backBtn}
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
  backBtn: {
    minWidth: 160,
  },
});
