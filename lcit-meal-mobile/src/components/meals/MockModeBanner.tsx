/**
 * Meal Component - MockModeBanner
 * Biểu ngữ tương tác chế độ Dữ liệu Mẫu (Demo Mode)
 * Cho phép chuyển nhanh tài khoản Nhân viên (An) / Quản lý (Minh) / Quản trị (Admin) / Bếp
 * để kiểm thử giao diện phân quyền trong Giai đoạn 1 và Giai đoạn 2.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { mockUsers } from '../../mocks/fixtures';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/radius';

export const MockModeBanner: React.FC = () => {
  const { user, useMockData, switchMockUser } = useAuth();

  if (!useMockData) return null;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>CHẾ ĐỘ DỮ LIỆU MẪU (DEMO)</Text>
        </View>
        <Text style={styles.hintText}>Chọn tài khoản thử nghiệm:</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.usersList}
      >
        {mockUsers.map((u) => {
          const isSelected = user?.id === u.id;
          return (
            <TouchableOpacity
              key={u.id}
              activeOpacity={0.7}
              onPress={() => switchMockUser(u.id)}
              style={[
                styles.userChip,
                isSelected && styles.userChipSelected,
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.userName,
                  isSelected && styles.userNameSelected,
                ]}
              >
                {u.fullName.split(' ').slice(-1)[0]} ({u.role})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ECFDF5',
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badge: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.textInverse,
  },
  hintText: {
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: typography.weights.medium,
  },
  usersList: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: 2,
  },
  userChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    minHeight: 28,
    justifyContent: 'center',
  },
  userChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  userName: {
    fontSize: 11,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  userNameSelected: {
    color: colors.textInverse,
    fontWeight: typography.weights.bold,
  },
});
