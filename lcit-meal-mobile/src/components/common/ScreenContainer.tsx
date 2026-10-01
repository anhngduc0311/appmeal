/**
 * Common Component - ScreenContainer
 * Layout khung chuẩn cho tất cả các màn hình:
 * - Hỗ trợ SafeAreaView
 * - KeyboardAvoidingView thích ứng iOS/Android
 * - Tùy chọn Cuộn (ScrollView) hoặc Cố định (View)
 * - Tối ưu cho màn hình nhỏ và phóng to chữ (Dynamic Type/Font Scaling)
 * - Hỗ trợ RefreshControl
 */

import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  disableTopPadding?: boolean;
  disableBottomPadding?: boolean;
  backgroundColor?: string;
  translucent?: boolean;
  keyboardAvoidingBehavior?: 'padding' | 'height' | 'position';
  keyboardVerticalOffset?: number;
  scrollRef?: React.Ref<ScrollView>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  keyboardDismissMode?: 'none' | 'on-drag' | 'interactive';
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = true,
  refreshing = false,
  onRefresh,
  style,
  contentContainerStyle,
  disableTopPadding = false,
  disableBottomPadding = false,
  backgroundColor = colors.background,
  translucent = false,
  keyboardAvoidingBehavior,
  keyboardVerticalOffset,
  scrollRef,
  keyboardShouldPersistTaps = 'handled',
  keyboardDismissMode = 'on-drag',
}) => {
  const insets = useSafeAreaInsets();

  const containerPadding: ViewStyle = {
    paddingTop: disableTopPadding ? 0 : insets.top,
    paddingBottom: disableBottomPadding ? 0 : insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
    backgroundColor,
  };

  const keyboardBehavior = keyboardAvoidingBehavior !== undefined
    ? keyboardAvoidingBehavior
    : Platform.OS === 'ios' ? 'padding' : undefined;

  return (
    <View style={[styles.root, containerPadding, style]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={backgroundColor}
        translucent={translucent}
      />

      <KeyboardAvoidingView
        behavior={keyboardBehavior}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={keyboardVerticalOffset ?? 0}
      >
        {scrollable ? (
          <ScrollView
            ref={scrollRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              contentContainerStyle,
            ]}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            keyboardDismissMode={keyboardDismissMode}
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                  progressBackgroundColor={colors.surface}
                />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.staticContent, contentContainerStyle]}>
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  staticContent: {
    flex: 1,
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
});
