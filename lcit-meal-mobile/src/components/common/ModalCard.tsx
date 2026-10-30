import React from 'react';
import { ScrollView, StyleSheet, View, ViewProps } from 'react-native';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

/** Keep long dialogs reachable on short screens and with enlarged text. */
export function ModalCard({ children, style, ...props }: ViewProps) {
  const { modalMaxHeight } = useResponsiveLayout();
  const {
    padding, paddingHorizontal, paddingVertical,
    paddingTop, paddingBottom, paddingLeft, paddingRight,
    alignItems, gap, rowGap, columnGap,
    ...frame
  } = StyleSheet.flatten(style) || {};

  return (
    <View {...props} style={[frame, { maxHeight: modalMaxHeight, flexShrink: 1 }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          padding, paddingHorizontal, paddingVertical,
          paddingTop, paddingBottom, paddingLeft, paddingRight,
          alignItems, gap, rowGap, columnGap,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        bounces={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexShrink: 1, width: '100%' },
});
