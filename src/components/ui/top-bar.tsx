import { StyleSheet, Text, View } from 'react-native';

import { ChevronLeftIcon } from '@/components/icons';
import { Touch } from '@/components/ui/touch';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';

/** Boxed chevron + title header used by every pushed sub-screen. */
export function TopBar({
  title,
  onBack,
  right,
  titleFlex = false,
}: {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
  /** Let the title take the free space so `right` sits at the edge. */
  titleFlex?: boolean;
}) {
  return (
    <View style={styles.bar}>
      <Touch style={styles.backBox} onPress={onBack} hitSlop={8} accessibilityRole="button" accessibilityLabel="Go back">
        <ChevronLeftIcon />
      </Touch>
      <Text style={[archivo(19, 800, { ls: -0.02, color: Colors.text }), titleFlex && styles.grow]}>
        {title}
      </Text>
      {right}
    </View>
  );
}

/** Bare `← BACK` link used by the tool screens. */
export function BackLink({ label = '← BACK', onPress }: { label?: string; onPress: () => void }) {
  return (
    <Touch onPress={onPress} hitSlop={10} accessibilityRole="button">
      <Text style={mono(11, 500, { ls: 0.12, color: Colors.muted })}>{label}</Text>
    </Touch>
  );
}

/** Section eyebrow: tiny uppercase mono label above a group. */
export function Eyebrow({
  children,
  style,
  color = Colors.sub,
  size = 9,
  ls = 0.18,
}: {
  children: React.ReactNode;
  style?: object;
  color?: string;
  size?: number;
  ls?: number;
}) {
  return <Text style={[mono(size, 500, { ls, color }), style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Colors.border12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: { flex: 1 },
});
