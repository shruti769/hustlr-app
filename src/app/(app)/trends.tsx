import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Screen } from '@/components/ui/screen';
import { TopBar } from '@/components/ui/top-bar';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { TRENDS } from '@/data/mock';
import { useBack } from '@/hooks/use-back';

export default function TrendsScreen() {
  const back = useBack();

  return (
    <Screen contentStyle={styles.content}>
      <TopBar title="Market Trends" onBack={back} style={styles.topBar} />
      <Text style={[mono(9, 500, { ls: 0.18, color: Colors.muted }), styles.subtitle]}>
        WHAT IS MOVING · LAST 90 DAYS
      </Text>

      <View style={styles.list}>
        {TRENDS.map((t) => {
          const color = t.up ? Colors.green : Colors.red;
          return (
            <View key={t.title} style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={archivo(14.5, 700, { color: Colors.text })}>{t.title}</Text>
                <Text style={mono(13, 800, { color })}>{t.change}</Text>
              </View>
              <Text style={[mono(10, 500, { color: Colors.muted }), styles.watching]}>
                {t.watching} watching
              </Text>
              <TrendLine up={t.up} />
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

function TrendLine({ up }: { up: boolean }) {
  const color = up ? Colors.green : Colors.red;
  const line = up ? 'M0 39 L9 37 L18 38 L27 33 L36 34 L45 29 L54 24 L63 25 L72 19 L81 15 L90 10 L100 2' : 'M0 3 L9 10 L18 7 L27 16 L36 22 L45 25 L54 32 L63 29 L72 38 L81 42 L90 45 L100 51';
  return (
    <View style={styles.trendLine}>
      <Svg width="100%" height="100%" viewBox="0 0 100 54" preserveAspectRatio="none">
        <Path d={`${line} L100 54 L0 54 Z`} fill={color} opacity={0.14} />
        <Path d={line} fill="none" stroke={color} strokeWidth="2.2" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0, paddingHorizontal: 20 },
  topBar: { marginHorizontal: -20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: Colors.hairline },
  subtitle: { marginTop: 16 },
  list: { gap: 10, marginTop: 16 },
  card: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border08,
    borderRadius: 15,
    padding: 14,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  watching: { marginTop: 5 },
  trendLine: { height: 54, marginTop: 9 },
});
