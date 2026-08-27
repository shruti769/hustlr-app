import { router } from 'expo-router';
import { StyleSheet, Text, View, type DimensionValue } from 'react-native';

import { PhotoSlot } from '@/components/ui/photo-slot';
import { Screen } from '@/components/ui/screen';
import { Touch } from '@/components/ui/touch';
import { BackLink } from '@/components/ui/top-bar';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { DASHBOARD_BARS, DEALS } from '@/data/mock';
import { useBack } from '@/hooks/use-back';

export default function DashboardScreen() {
  const back = useBack();
  const recent = DEALS.slice(0, 4);

  return (
    <Screen contentStyle={styles.content}>
      <BackLink onPress={back} />
      <Text style={[archivo(24, 800, { ls: -0.02, color: Colors.text }), styles.title]}>Dashboard</Text>

      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <Metric label="P R O F I T" value="$12.5k" valueColor={Colors.green} delta="▲ 18%" />
          <Metric label="L I S T I N G S" value="14" delta="▲ 3" />
        </View>
        <View style={styles.gridRow}>
          <Metric label="D E P L O Y E D" value="$3.2k" delta="▲ 6%" />
          <Metric label="A V G   R O I" value="94%" delta="▼ 2%" deltaColor={Colors.red} />
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartHead}>
          <Text style={mono(9, 500, { ls: 0.18, color: Colors.muted })}>PROFIT · 30D</Text>
          <Text style={archivo(15, 800, { color: Colors.green })}>$12,480</Text>
        </View>
        <View style={styles.bars}>
          {DASHBOARD_BARS.map((h, i) => (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  height: `${h}%` as DimensionValue,
                  backgroundColor: h >= 90 ? Colors.green : 'rgba(32,197,101,0.35)',
                },
              ]}
            />
          ))}
        </View>
      </View>

      <Text style={[mono(9, 500, { ls: 0.22, color: Colors.muted }), styles.sectionLabel]}>
        R E C E N T   D E A L S
      </Text>

      <View style={styles.list}>
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
  content: { paddingTop: 6, paddingHorizontal: 20 },
  title: { marginTop: 12 },

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
  chartHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 86, marginTop: 14 },
  bar: { flex: 1, borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },

  sectionLabel: { marginTop: 20, marginBottom: 10 },
  list: { gap: 1, backgroundColor: Colors.hairlineCard, borderRadius: 15, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  rowThumb: { width: 36, height: 36 },
  rowMeta: { flex: 1, minWidth: 0 },
  rowSource: { marginTop: 3 },
  rowEnd: { alignItems: 'flex-end' },
});
