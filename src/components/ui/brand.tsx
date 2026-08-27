import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { archivo } from '@/constants/type';

/** The round green "H" mark. */
export function LogoMark({ size = 52, fontSize = 30 }: { size?: number; fontSize?: number }) {
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={archivo(fontSize, 900, { ls: -0.04, color: Colors.onBrand })}>H</Text>
    </View>
  );
}

/** "HUSTLR" wordmark. */
export function Wordmark({ size = 30, ls = 0.02, color = Colors.textStrong }: { size?: number; ls?: number; color?: string }) {
  return <Text style={archivo(size, 900, { ls, color })}>HUSTLR</Text>;
}

/** Mark + wordmark lockup. */
export function Logo({ size = 52, fontSize = 30, wordSize = 30, gap = 13, ls = 0.02, color = Colors.textStrong }) {
  return (
    <View style={[styles.row, { gap }]}>
      <LogoMark size={size} fontSize={fontSize} />
      <Wordmark size={wordSize} ls={ls} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
});
