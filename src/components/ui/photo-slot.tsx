import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, FILL } from '@/constants/theme';
import { mono } from '@/constants/type';

type PhotoSlotProps = {
  /** Caption shown while the slot has no photo. */
  hint?: string;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  /** Lighter gradient variant used by watchlist / detail thumbnails. */
  light?: boolean;
  children?: React.ReactNode;
};

/**
 * Product-image placeholder. Mirrors the prototype's `<image-slot>`: a 135°
 * dark-green gradient that a real photo drops into later.
 */
export function PhotoSlot({ hint, style, radius = 0, light = false, children }: PhotoSlotProps) {
  return (
    <View style={[styles.wrap, { borderRadius: radius }, style]}>
      <LinearGradient
        colors={[light ? Colors.photoFromLight : Colors.photoFrom, Colors.photoTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {hint ? (
        <View style={styles.hintWrap} pointerEvents="none">
          <Text style={[mono(8.5, 500, { ls: 0.14, color: Colors.faint }), styles.hint]}>
            {hint.toUpperCase()}
          </Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  hintWrap: { ...FILL, alignItems: 'center', justifyContent: 'center', padding: 12 },
  hint: { textAlign: 'center' },
});
