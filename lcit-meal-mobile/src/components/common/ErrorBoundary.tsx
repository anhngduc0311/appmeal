/**
 * Common Component - ErrorBoundary
 * Bắt các lỗi runtime JavaScript trong cây component React và hiển thị giao diện phục hồi thân thiện
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/radius';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    console.error('Uncaught React Error in ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = __DEV__;

      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.iconCircle}>
              <Ionicons name="warning-outline" size={48} color={colors.danger} />
            </View>

            <Text style={styles.title}>Đã xảy ra sự cố</Text>
            <Text style={styles.message}>
              Rất tiếc, ứng dụng đã gặp lỗi không mong muốn. Dữ liệu của bạn không bị ảnh hưởng.
            </Text>

            {isDev && this.state.error && (
              <ScrollView style={styles.devErrorBox} contentContainerStyle={styles.devErrorContent}>
                <Text style={styles.devErrorTitle}>Chi tiết lỗi kỹ thuật (Dev Mode):</Text>
                <Text style={styles.devErrorText}>{this.state.error.toString()}</Text>
                {this.state.errorInfo && (
                  <Text style={styles.devStackText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}

            <View style={styles.buttonContainer}>
              <Button
                title="Tải lại ứng dụng"
                variant="primary"
                size="lg"
                onPress={this.handleReset}
                leftIcon={<Ionicons name="refresh-outline" size={20} color={colors.textInverse} />}
              />
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    maxWidth: 400,
  },
  devErrorBox: {
    maxHeight: 180,
    width: '100%',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  devErrorContent: {
    padding: spacing.md,
  },
  devErrorTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  devErrorText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  devStackText: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: spacing.xs,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
  },
});
