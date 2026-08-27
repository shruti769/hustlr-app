import { StyleSheet, Text, View } from 'react-native';

import { Meter } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { BackLink } from '@/components/ui/top-bar';
import { Touch } from '@/components/ui/touch';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { TRACKER_BASE, TRACKER_EXTRA } from '@/data/mock';
import { useBack } from '@/hooks/use-back';
import { useApp } from '@/store/app-store';

export default function TrackerScreen() {
  const back = useBack();
  const { trackerExtra, addTracker, flash } = useApp();

  const trackers = trackerExtra ? [...TRACKER_BASE, TRACKER_EXTRA] : TRACKER_BASE;

  const onTrack = () => {
    if (addTracker()) flash('AirPods Pro 2 added to tracker');
    else flash('Already tracking 5 items');
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.head}>
        <BackLink onPress={back} />
        <Touch style={styles.trackButton} onPress={onTrack} accessibilityRole="button">
          <Text style={archivo(11.5, 700, { color: Colors.green })}>+ Track</Text>
        </Touch>
      </View>

      <Text style={[archivo(24, 800, { ls: -0.02, color: Colors.text }), styles.title]}>Price Tracker</Text>
      <Text style={[mono(9, 500, { ls: 0.18, color: Colors.muted }), styles.subtitle]}>
        {trackers.length} ITEMS WATCHED · ALERTS ON
      </Text>

      <View style={styles.list}>
        {trackers.map((t) => {
          const color = t.up ? Colors.green : Colors.red;
          return (
            <View key={t.title} style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={archivo(14, 700, { color: Colors.text })}>{t.title}</Text>
                <Text style={mono(12.5, 800, { color })}>{t.change}</Text>
              </View>
              <View style={styles.prices}>
                <View>
                  <Text style={mono(8, 500, { ls: 0.16, color: Colors.muted })}>NOW</Text>
                  <Text style={[archivo(14, 700, { color: Colors.text }), styles.priceValue]}>{t.now}</Text>
                </View>
                <View>
                  <Text style={mono(8, 500, { ls: 0.16, color: Colors.muted })}>TARGET</Text>
                  <Text style={[archivo(14, 700, { color: Colors.sub }), styles.priceValue]}>
                    {t.target}
                  </Text>
                </View>
              </View>
              <Meter fill={t.bar} color={color} height={5} style={styles.meter} />
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 6, paddingHorizontal: 20 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trackButton: {
    borderWidth: 1,
    borderColor: Colors.greenBorder35,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
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
  prices: { flexDirection: 'row', gap: 22, marginTop: 11 },
  priceValue: { marginTop: 3 },
  meter: { marginTop: 12 },
});
