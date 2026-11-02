import React from 'react';
import { KeyboardAvoidingView, Platform, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Modal windows have their own safe area and keyboard layout. */
export const ModalBackdrop = React.forwardRef<React.ElementRef<typeof SafeAreaView>, ViewProps>(function ModalBackdrop(
  { children, style, ...props }, ref,
) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
    >
      <SafeAreaView {...props} ref={ref} style={style}>
        {children}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
});
