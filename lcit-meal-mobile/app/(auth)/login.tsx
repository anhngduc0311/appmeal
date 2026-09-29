/**
 * Auth Screen - Đăng nhập (Login)
 * Giao diện đăng nhập với tài khoản/mật khẩu, hỗ trợ chọn nhanh tài khoản thử nghiệm
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
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
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const wide = useWindowDimensions().width >= 850;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <ScreenContainer scrollable backgroundColor={colors.background}>
      <View style={[styles.container, wide && styles.desktop]}>
        {/* Brand Logo & Title */}
        <View style={[styles.brandHeader, wide && styles.brandDesktop]}>
          <View style={styles.logoCircle}>
            <Ionicons name="restaurant" size={30} color="#DCEAA0" />
          </View>
          <Text style={styles.appName}>LCIT MEAL</Text>
          <Text style={styles.appTagline}>
            BỮA TRƯA TẠI CƠ QUAN
          </Text>
          <Text style={[styles.brandHeadline, wide && {fontSize: 42, lineHeight: 54}]}>Một bữa ăn tốt.{'\n'}Một ngày hiệu quả.</Text>
          <Text style={styles.brandDescription}>Đăng ký bữa trưa, theo dõi lịch ăn và thanh toán trong cùng một nơi.</Text>
          {wide && <View style={styles.brandArtwork}><Ionicons name="leaf-outline" size={80} color="#DCEAA0" /><Text style={styles.artworkCaption}>CHĂM CHÚT TỪNG BỮA ĂN</Text></View>}
        </View>
        <View style={styles.formColumn}>
        {/* Form Đăng nhập */}
        <Card variant="elevated" padding="2xl" style={styles.formCard}>
          <Text style={styles.formEyebrow}>CHÀO MỪNG TRỞ LẠI</Text>
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

        <Text style={styles.footer}>LCIT MEAL · Quản lý suất ăn cơ quan</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  desktop: { flexDirection: 'row', alignItems: 'stretch', paddingVertical: 40 },
  brandDesktop: { flex: 1, padding: 36 },
  formColumn: { flex: 1, minWidth: 0 },
  brandHeadline: { fontSize: 26, lineHeight: 36, color: '#FFFFFF', fontWeight: '800', marginTop: 24, letterSpacing: -0.8 },
  brandDescription: { fontSize: 13, lineHeight: 22, color: '#D5E4D8', marginTop: 14, maxWidth: 320 },
  brandArtwork: { flex: 1, minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 32, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)' },
  artworkCaption: { fontSize: 10, letterSpacing: 2, fontWeight: '700', color: '#DCEAA0' },
  formEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.6, color: colors.primary, marginBottom: 8 },
  footer: { textAlign: 'center', color: colors.textMuted, fontSize: 11, marginTop: 16, fontWeight: '500' },
  container: {
    paddingVertical: spacing.lg,
    gap: 20,
  },
  brandHeader: {
    padding: 24,
    backgroundColor: colors.primaryDark,
    borderRadius: radius['2xl'],
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.xl,
    backgroundColor: '#164839',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#2F6B58',
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  appTagline: {
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: '700',
    color: '#B2D8C6',
    marginTop: 4,
  },
  formCard: {
    width: '100%',
    marginBottom: spacing.md,
    borderRadius: radius['2xl'],
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  loginBtn: {
    marginTop: spacing.md,
  },
});
