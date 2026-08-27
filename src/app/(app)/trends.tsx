import { StyleSheet, Text, View } from 'react-native';

import { Meter } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { BackLink } from '@/components/ui/top-bar';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { TRENDS } from '@/data/mock';
import { useBack } from '@/hooks/use-back';

export default function TrendsScreen() {
  const back = useBack();

  return (
    <Screen contentStyle={styles.content}>
      <BackLink onPress={back} />
      <Text style={[archivo(24, 800, { ls: -0.02, color: Colors.text }), styles.title]}>Market Trends</Text>
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
              <Meter fill={t.bar} color={color} height={6} style={styles.meter} />
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 6, paddingHorizontal: 20 },
  title: { marginTop: 12 },
  subtitle: { marginTop: 8 },
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
  meter: { marginTop: 11 },
});
