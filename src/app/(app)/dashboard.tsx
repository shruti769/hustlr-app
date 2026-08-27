import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { PhotoSlot } from '@/components/ui/photo-slot';
import { Screen } from '@/components/ui/screen';
import { Touch } from '@/components/ui/touch';
import { TopBar } from '@/components/ui/top-bar';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { DEALS } from '@/data/mock';
import { useBack } from '@/hooks/use-back';

export default function DashboardScreen() {
  const back = useBack();
  const recent = DEALS.slice(0, 4);

  return (
    <Screen contentStyle={styles.content}>
      <TopBar title="Dashboard" onBack={back} style={styles.topBar} />

      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <Metric label="P R O F I T" value="$12.5k" delta="▲ 18%" />
          <Metric label="D E P L O Y E D" value="$3.2k" delta="▲ 6%" />
        </View>
        <View style={styles.gridRow}>
          <Metric label="L I S T I N G S" value="14" delta="▲ 3" />
          <Metric label="A V G   R O I" value="94%" delta="▼ 2%" deltaColor={Colors.red} />
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={mono(9, 500, { ls: 0.18, color: Colors.muted })}>PROFIT · 30D</Text>
        <Text style={[archivo(26, 800, { color: Colors.green }), styles.chartValue]}>$12,480</Text>
        <View style={styles.lineChart}>
          <View style={[styles.gridLine, { top: '34%' }]} />
          <View style={[styles.gridLine, { top: '68%' }]} />
          <Svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="profitArea" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={Colors.green} stopOpacity="0.22" />
                <Stop offset="1" stopColor={Colors.green} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Path
              d="M0 92 L20 89 L40 92 L60 82 L80 77 L100 81 L120 70 L140 72 L160 59 L180 50 L200 42 L220 32 L240 36 L260 24 L280 16 L300 8 L320 13 L340 1 L360 -5 L380 -10 L400 -18 L400 100 L0 100 Z"
              fill="url(#profitArea)"
            />
            <Path
              d="M0 92 L20 89 L40 92 L60 82 L80 77 L100 81 L120 70 L140 72 L160 59 L180 50 L200 42 L220 32 L240 36 L260 24 L280 16 L300 8 L320 13 L340 1 L360 -5 L380 -10 L400 -18"
              fill="none"
              stroke={Colors.green}
              strokeWidth="2.5"
            />
          </Svg>
        </View>
      </View>

      <View style={styles.list}>
        <Text style={[mono(9, 500, { ls: 0.18, color: Colors.muted }), styles.sectionLabel]}>
          RECENT DEALS
        </Text>
        {recent.map((d) => (
          <Touch
            key={d.id}
            style={styles.row}
            onPress={() => router.push(`/deal/${d.id}`)}
            accessibilityRole="button">
            <PhotoSlot radius={12} style={styles.rowThumb} />
            <View style={styles.rowMeta}>
              <Text style={archivo(13, 700, { color: Colors.text })} numberOfLines={1}>
                {d.title}
              </Text>
              <Text style={[mono(9.5, 500, { color: Colors.muted }), styles.rowSource]}>{d.source}</Text>
            </View>
            <View style={styles.rowEnd}>
              <Text style={archivo(13, 700, { color: Colors.green })}>{d.profit}</Text>
              <Text style={mono(10, 500, { color: Colors.muted })}>{d.roi}</Text>
            </View>
          </Touch>
        ))}
      </View>
    </Screen>
  );
}

function Metric({
  label,
  value,
  delta,
  valueColor = Colors.text,
  deltaColor = Colors.green,
}: {
  label: string;
  value: string;
  delta: string;
  valueColor?: string;
  deltaColor?: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={mono(8, 500, { ls: 0.2, color: Colors.muted })}>{label}</Text>
      <Text style={[archivo(24, 800, { color: valueColor }), styles.metricValue]}>{value}</Text>
      <Text style={[mono(10, 700, { color: deltaColor }), styles.metricDelta]}>{delta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0, paddingHorizontal: 20 },
  topBar: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },

  grid: { gap: 9, marginTop: 16 },
  gridRow: { flexDirection: 'row', gap: 9 },
  metric: {
    flex: 1,
    backgroundColor: Colors.surfaceDim,
    borderWidth: 1,
    borderColor: Colors.border08,
    borderRadius: 14,
    padding: 14,
  },
  metricValue: { marginTop: 5 },
  metricDelta: { marginTop: 2 },

  chartCard: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border08,
    borderRadius: 16,
    padding: 15,
    marginTop: 12,
  },
  chartValue: { marginTop: 7 },
  lineChart: { height: 112, marginTop: 5, overflow: 'hidden' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: Colors.hairline },

  sectionLabel: { paddingHorizontal: 14, paddingTop: 15, paddingBottom: 9 },
  list: {
    marginTop: 12,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border08,
    borderRadius: 15,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineSoft,
  },
  rowThumb: { width: 36, height: 36 },
  rowMeta: { flex: 1, minWidth: 0 },
  rowSource: { marginTop: 3 },
  rowEnd: { alignItems: 'flex-end' },
});
