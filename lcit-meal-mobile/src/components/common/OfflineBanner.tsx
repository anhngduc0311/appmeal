/**
 * Common Component - OfflineBanner
 * Banner thông báo trạng thái kết nối mạng trên đỉnh màn hình
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const OfflineBanner: React.FC = () => {
  const { isConnected, isReconnected } = useNetworkStatus();

  if (isConnected && !isReconnected) {
    return null;
  }

  if (isReconnected) {
    return (
      <View style={[styles.container, styles.onlineContainer]}>
        <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
        <Text style={styles.text}>Đã kết nối lại Internet</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.offlineContainer]}>
      <Ionicons name="cloud-offline" size={16} color="#FFFFFF" />
      <Text style={styles.text}>
        Đang mất kết nối mạng. Đang sử dụng dữ liệu tạm.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    zIndex: 9999,
  },
  offlineContainer: {
    backgroundColor: colors.danger,
  },
  onlineContainer: {
    backgroundColor: colors.primary,
  },
  text: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
});
