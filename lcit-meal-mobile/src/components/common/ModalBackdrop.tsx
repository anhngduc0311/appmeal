import React from 'react';
import { KeyboardAvoidingView, Platform, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Modal windows have their own safe area and keyboard layout. */
export function ModalBackdrop({ children, style, ...props }: ViewProps) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
    >
      <SafeAreaView {...props} style={style}>
        {children}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
