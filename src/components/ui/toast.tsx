import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, NAV_HEIGHT } from '@/constants/theme';
import { archivo } from '@/constants/type';
import { useApp } from '@/store/app-store';

/** Light pill that rises above the nav bar to confirm an action. */
export function Toast() {
  const { toast } = useApp();
  const insets = useSafeAreaInsets();
  if (!toast) return null;

  return (
    <Animated.View
      pointerEvents="none"
      entering={FadeInDown.duration(250)}
      exiting={FadeOutDown.duration(180)}
      style={[styles.toast, { bottom: NAV_HEIGHT + insets.bottom + 16 }]}>
      <Text style={[archivo(13, 700, { color: Colors.textOnLight }), styles.text]}>{toast}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: Colors.text,
    borderRadius: 13,
    paddingVertical: 14,
    paddingHorizontal: 16,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  text: { textAlign: 'center' },
});
