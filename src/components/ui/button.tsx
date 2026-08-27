import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Touch } from '@/components/ui/touch';
import { Colors } from '@/constants/theme';
import { archivo } from '@/constants/type';

export type ButtonTone = 'brand' | 'green' | 'ghost';

const TONES: Record<ButtonTone, { bg: string; fg: string; border?: string }> = {
  /** Primary CTA — the soft brand green. */
  brand: { bg: Colors.brand, fg: Colors.onBrand },
  /** Saturated green, used by the auth + tool CTAs. */
  green: { bg: Colors.green, fg: Colors.onGreen },
  /** Outlined secondary. */
  ghost: { bg: Colors.surfaceButton, fg: Colors.text, border: Colors.border },
};

export function Button({
  label,
  onPress,
  tone = 'brand',
  radius = 11,
  padding = 17,
  size = 15,
  weight = 800,
  icon,
  style,
}: {
  label: string;
  onPress?: () => void;
  tone?: ButtonTone;
  radius?: number;
  padding?: number;
  size?: number;
  weight?: 700 | 800;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const t = TONES[tone];
  return (
    <Touch
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.base,
        {
          backgroundColor: t.bg,
          borderRadius: radius,
          paddingVertical: padding,
          paddingHorizontal: 14,
          borderWidth: t.border ? 1 : 0,
          borderColor: t.border,
        },
        style,
      ]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={archivo(size, weight, { ls: 0.01, color: t.fg })}>{label}</Text>
    </Touch>
  );
}

/** Small solid pill button — "View →", "+ Add", "Leaderboard". */
export function PillButton({
  label,
  onPress,
  tone = 'brand',
  style,
  size = 12.5,
  padV = 10,
  padH = 18,
  radius = 10,
}: {
  label: string;
  onPress?: () => void;
  tone?: ButtonTone;
  style?: StyleProp<ViewStyle>;
  size?: number;
  padV?: number;
  padH?: number;
  radius?: number;
}) {
  const t = TONES[tone];
  return (
    <Touch
      onPress={onPress}
      accessibilityRole="button"
      style={[
        {
          backgroundColor: t.bg,
          borderRadius: radius,
          paddingVertical: padV,
          paddingHorizontal: padH,
          borderWidth: t.border ? 1 : 0,
          borderColor: t.border,
        },
        style,
      ]}>
      <Text style={archivo(size, 800, { color: t.fg })}>{label}</Text>
    </Touch>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  icon: { alignItems: 'center', justifyContent: 'center' },
});
