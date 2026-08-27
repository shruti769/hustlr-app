import { StyleSheet, Text, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { Touch } from '@/components/ui/touch';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';

/** Raised surface with the standard hairline. */
export function Card({
  children,
  style,
  onPress,
  radius = 15,
  padding,
  background = Colors.surface,
  border = Colors.hairlineCard,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  radius?: number;
  padding?: number;
  background?: string;
  border?: string;
}) {
  const base: ViewStyle = {
    backgroundColor: background,
    borderWidth: 1,
    borderColor: border,
    borderRadius: radius,
    ...(padding !== undefined ? { padding } : null),
  };
  if (onPress) {
    return (
      <Touch onPress={onPress} style={[base, style]} accessibilityRole="button">
        {children}
      </Touch>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}

/**
 * Metric tile: mono eyebrow over a big number, with an optional delta line.
 * Shared by Home, Inventory, Profile and Dashboard.
 */
export function StatTile({
  label,
  value,
  delta,
  valueColor = Colors.text,
  deltaColor = Colors.brand,
  onPress,
  center = false,
  style,
  labelSize = 9,
  labelLs = 0.16,
  valueSize = 24,
  padding = 16,
  radius = 15,
  background = Colors.surface,
  border = Colors.hairlineCard,
}: {
  label: string;
  value: string;
  delta?: string;
  valueColor?: string;
  deltaColor?: string;
  onPress?: () => void;
  center?: boolean;
  style?: StyleProp<ViewStyle>;
  labelSize?: number;
  labelLs?: number;
  valueSize?: number;
  padding?: number;
  radius?: number;
  background?: string;
  border?: string;
}) {
  return (
    <Card onPress={onPress} radius={radius} padding={padding} background={background} border={border} style={style}>
      <View style={center && styles.center}>
        <Text style={mono(labelSize, 500, { ls: labelLs, color: Colors.sub })}>{label}</Text>
        <Text style={[archivo(valueSize, 800, { color: valueColor }), styles.value]}>{value}</Text>
        {delta ? (
          <Text style={[mono(10, 500, { color: deltaColor }), styles.delta]}>{delta}</Text>
        ) : null}
      </View>
    </Card>
  );
}

/** Thin horizontal meter used by Price Tracker and Market Trends. */
export function Meter({
  fill,
  color,
  height = 6,
  style,
}: {
  /** Percentage string, e.g. `"62%"`. */
  fill: string;
  color: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.meter, { height, borderRadius: height / 2 }, style]}>
      <View
        style={{
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: color,
          width: fill as DimensionValue,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  value: { marginTop: 8 },
  delta: { marginTop: 6 },
  meter: { backgroundColor: Colors.border08, overflow: 'hidden' },
});
