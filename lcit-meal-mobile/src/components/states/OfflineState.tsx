/**
 * State Component - OfflineState
 * Trạng thái mất kết nối mạng hoặc không truy cập được server
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../common/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface OfflineStateProps {
  onRetry?: () => void;
  onEnableMock?: () => void;
  style?: ViewStyle;
}

export const OfflineState: React.FC<OfflineStateProps> = ({
  onRetry,
  onEnableMock,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name="cloud-offline-outline" size={36} color={colors.textSecondary} />
      </View>
      <Text style={styles.title}>Mất kết nối mạng</Text>
      <Text style={styles.message}>
        Thiết bị chưa kết nối Internet hoặc không thể kết nối đến máy chủ LCIT Meal.
      </Text>

      <View style={styles.btnRow}>
        {onRetry && (
          <Button
            title="Kết nối lại"
            variant="primary"
            size="md"
            onPress={onRetry}
            style={styles.btn}
          />
        )}
        {onEnableMock && (
          <Button
            title="Dùng bản Demo"
            variant="secondary"
            size="md"
            onPress={onEnableMock}
            style={styles.btn}
          />
        )}
      </View>
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
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
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
  btnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  btn: {
    flex: 1,
  },
});
