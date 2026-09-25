/**
 * Auth Screen - Đăng nhập (Login)
 * Giao diện đăng nhập với tài khoản/mật khẩu, hỗ trợ chọn nhanh tài khoản thử nghiệm
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Input } from '../../src/components/common/Input';
import { PasswordInput } from '../../src/components/common/PasswordInput';
import { Button } from '../../src/components/common/Button';
import { ResultBanner } from '../../src/components/common/ResultBanner';
import { Card } from '../../src/components/common/Card';
import { useAuth } from '../../src/providers/AuthProvider';
import { mockUsers } from '../../src/mocks/fixtures';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { radius } from '../../src/theme/radius';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('nv_an');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await login({ username: username.trim(), password });
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMockAccount = (mockU: (typeof mockUsers)[0]) => {
    setUsername(mockU.username);
    setPassword('123456');
    setErrorMessage(null);
  };

  return (
    <ScreenContainer scrollable backgroundColor={colors.background}>
      <View style={styles.container}>
        {/* Brand Logo & Title */}
        <View style={styles.brandHeader}>
          <View style={styles.logoCircle}>
            <Ionicons name="restaurant" size={38} color={colors.primary} />
          </View>
          <Text style={styles.appName}>LCIT MEAL</Text>
          <Text style={styles.appTagline}>
            Hệ thống Quản lý Suất ăn Cơ quan
          </Text>
        </View>

        {/* Form Đăng nhập */}
        <Card variant="elevated" padding="2xl" style={styles.formCard}>
          <Text style={styles.formTitle}>Đăng nhập</Text>
          <Text style={styles.formSubtitle}>
            Sử dụng tài khoản được cơ quan cấp để tiếp tục
          </Text>

          {errorMessage && (
            <ResultBanner
              variant="error"
              message={errorMessage}
              onDismiss={() => setErrorMessage(null)}
            />
          )}

          <Input
            label="Tên đăng nhập"
            placeholder="Ví dụ: nv_an"
            value={username}
            onChangeText={(txt) => {
              setUsername(txt);
              if (errorMessage) setErrorMessage(null);
            }}
            autoCapitalize="none"
            leftIcon={
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.textSecondary}
              />
            }
          />

          <PasswordInput
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              if (errorMessage) setErrorMessage(null);
            }}
            leftIcon={
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.textSecondary}
              />
            }
          />

          <Button
            title="Đăng nhập"
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleLogin}
            fullWidth
            style={styles.loginBtn}
          />
        </Card>

        {/* Chọn nhanh tài khoản Demo trong giai đoạn phát triển */}
        <Card variant="outlined" padding="lg" style={styles.demoCard}>
          <View style={styles.demoHeader}>
            <Ionicons name="flash-outline" size={18} color={colors.primaryDark} />
            <Text style={styles.demoTitle}>Tài khoản thử nghiệm nhanh (Demo)</Text>
          </View>
          <Text style={styles.demoDesc}>
            Chạm vào tài khoản bên dưới để tự động điền:
          </Text>

          <View style={styles.mockUsersGrid}>
            {mockUsers.map((u) => (
              <TouchableOpacity
                key={u.id}
                activeOpacity={0.7}
                onPress={() => handleSelectMockAccount(u)}
                style={[
                  styles.mockUserButton,
                  username === u.username && styles.mockUserButtonActive,
                ]}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.mockUserRole,
                    username === u.username && styles.mockUserRoleActive,
                  ]}
                >
                  {(u.role || 'employee').toUpperCase()}
                </Text>
                <Text
                  style={[
                    styles.mockUserName,
                    username === u.username && styles.mockUserNameActive,
                  ]}
                >
                  {u.fullName}
                </Text>
                <Text style={styles.mockUserUsername}>({u.username})</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary300,
  },
  appName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.extrabold,
    color: colors.primaryDark,
    letterSpacing: 1,
  },
  appTagline: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  formCard: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  formTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  loginBtn: {
    marginTop: spacing.md,
  },
  demoCard: {
    width: '100%',
    backgroundColor: colors.primary50,
    borderColor: colors.primaryLight,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  demoTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  demoDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  mockUsersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mockUserButton: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 64,
  },
  mockUserButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  mockUserRole: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  mockUserRoleActive: {
    color: colors.primaryDark,
  },
  mockUserName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  mockUserNameActive: {
    color: colors.primaryDark,
  },
  mockUserUsername: {
    fontSize: typography.sizes['2xs'],
    color: colors.textMuted,
  },
});
