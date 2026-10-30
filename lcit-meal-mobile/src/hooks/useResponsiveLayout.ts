import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Use available logical width, including the user's text-size preference. */
export function useResponsiveLayout() {
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const availableWidth = Math.max(0, width - insets.left - insets.right);
  const effectiveWidth = availableWidth / Math.max(1, fontScale);

  return {
    compact: effectiveWidth < 380,
    wide: effectiveWidth >= 850,
    horizontalPadding: availableWidth < 360 ? 12 : availableWidth < 600 ? 16 : 20,
    modalMaxHeight: Math.max(0, height - insets.top - insets.bottom - 24),
    insets,
    fontScale,
  };
}
