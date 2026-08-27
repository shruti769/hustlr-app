import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Screen } from '@/components/ui/screen';
import { TopBar } from '@/components/ui/top-bar';
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
      <TopBar
        title="Price Tracker"
        onBack={back}
        titleFlex
        style={styles.topBar}
        right={
          <Touch style={styles.trackButton} onPress={onTrack} accessibilityRole="button">
            <Text style={archivo(11.5, 700, { color: Colors.onGreen })}>+ Track</Text>
          </Touch>
        }
      />
      <Text style={[mono(9, 500, { ls: 0.18, color: Colors.muted }), styles.subtitle]}>
        5 ITEMS WATCHED · ALERTS ON
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
              <Sparkline up={t.up} />
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
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

function Sparkline({ up }: { up: boolean }) {
  const color = up ? Colors.green : Colors.red;
  const line = up ? 'M1 42 L15 34 L29 37 L43 25 L57 18 L71 21 L85 10 L99 3' : 'M1 4 L15 13 L29 22 L43 25 L57 35 L71 39 L85 43 L99 48';
  const area = `${line} L99 52 L1 52 Z`;
  return (
    <View style={styles.sparkline}>
      <Svg width="100%" height="100%" viewBox="0 0 100 52" preserveAspectRatio="none">
        <Path d={area} fill={color} opacity={0.14} />
        <Path d={line} fill="none" stroke={color} strokeWidth="2.2" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0, paddingHorizontal: 20 },
  topBar: { marginHorizontal: -20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: Colors.hairline },
  trackButton: {
    backgroundColor: Colors.green,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
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
  sparkline: { position: 'absolute', left: 14, bottom: 14, width: 80, height: 36 },
  prices: { flexDirection: 'row', justifyContent: 'flex-end', gap: 22, marginTop: 11 },
  priceValue: { marginTop: 3 },
});
