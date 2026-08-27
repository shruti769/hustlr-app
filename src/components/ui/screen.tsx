import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, NAV_HEIGHT } from '@/constants/theme';

type ScreenProps = {
  children: React.ReactNode;
  /** Horizontal + top padding on the scrolling content. */
  contentStyle?: StyleProp<ViewStyle>;
  /** Auth screens have no bottom nav to clear. */
  withNav?: boolean;
  /** Auth screens stretch their content to fill the viewport. */
  fill?: boolean;
  /** Fallback top inset for environments (notably web previews) reporting zero. */
  minimumTopInset?: number;
};

/**
 * Standard screen body: dark canvas, safe-area top, scrolling content that
 * clears the floating bottom nav.
 */
export function Screen({
  children,
  contentStyle,
  withNav = true,
  fill = false,
  minimumTopInset = 0,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = withNav ? NAV_HEIGHT + insets.bottom : insets.bottom;
  const topInset = Math.max(insets.top, minimumTopInset);

  return (
    <View style={[styles.root, { paddingTop: topInset }]}>
      <ScrollView
        style={styles.scroll}
        // Bottom padding comes last so a screen's own content style can never
        // shrink the space reserved for the nav bar and home indicator.
        contentContainerStyle={[fill && styles.fill, contentStyle, { paddingBottom: bottomPad + 26 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  fill: { flexGrow: 1 },
});
