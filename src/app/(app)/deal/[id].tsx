import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { BookmarkIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GlowCard } from '@/components/ui/glow-card';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { Screen } from '@/components/ui/screen';
import { TopBar } from '@/components/ui/top-bar';
import { Touch } from '@/components/ui/touch';
import { Colors, FILL } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { COMPS, DEALS } from '@/data/mock';
import { useBack } from '@/hooks/use-back';
import { money, useApp } from '@/store/app-store';

/** Circumference of the r=23 score ring. */
const RING = 144.5;

const VERDICT = [
  { icon: '✓', color: Colors.brand, text: 'High demand — 42 recent sales' },
  { icon: '✓', color: Colors.brand, text: 'Priced 38% below market' },
  { icon: '⚠', color: Colors.gold, text: 'Request box & receipt photos' },
];

export default function DealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deal = DEALS.find((d) => d.id === id) ?? DEALS[0];
  const back = useBack('/deals');
  const { watch, toggleWatch, flash } = useApp();

  const watching = watch.includes(deal.id);
  const fees = deal.sellN * 0.129;
  const net = deal.sellN - deal.buyN - fees - 15;

  const breakdown = [
    { label: 'Est. resale', value: `${deal.resale}.00`, color: Colors.text },
    { label: 'Buy price', value: `−${deal.buy}.00`, color: Colors.red },
    { label: 'Fees (12.9%)', value: `−${money(fees)}`, color: Colors.red },
    { label: 'Shipping', value: '−$15.00', color: Colors.red },
  ];

  const onWatch = () => {
    toggleWatch(deal.id);
    flash(watching ? 'Removed from watchlist' : 'Added to watchlist');
  };

  return (
    <Screen contentStyle={styles.content}>
      <TopBar
        title="Deal Detail"
        onBack={back}
        titleFlex
        right={
          <Touch
            style={[styles.watchButton, watching && styles.watchButtonOn]}
            onPress={onWatch}
            accessibilityRole="button"
            accessibilityState={{ selected: watching }}
            accessibilityLabel={watching ? 'Remove from watchlist' : 'Add to watchlist'}>
            <BookmarkIcon
              size={15}
              color={watching ? Colors.brand : Colors.text}
              fill={watching ? Colors.brand : 'none'}
            />
          </Touch>
        }
      />

      <PhotoSlot hint={`${deal.title} photo`} style={styles.hero}>
        <View style={styles.heroBadge}>
          <Text style={archivo(12.5, 800, { color: Colors.onBrand })}>{deal.profit} PROFIT</Text>
        </View>
        <View style={styles.ring}>
          <Svg width={54} height={54} viewBox="0 0 54 54">
            <Circle cx="27" cy="27" r="23" fill={Colors.scrim} stroke={Colors.border14} strokeWidth={3} />
            <Circle
              cx="27"
              cy="27"
              r="23"
              fill="none"
              stroke={Colors.brand}
              strokeWidth={3.4}
              strokeLinecap="round"
              strokeDasharray={`${((parseFloat(deal.score) / 10) * RING).toFixed(1)} ${RING}`}
              transform="rotate(-90 27 27)"
            />
          </Svg>
          <View style={styles.ringLabel} pointerEvents="none">
            <Text style={archivo(14, 800, { color: Colors.textStrong })}>{deal.score}</Text>
            <Text style={mono(6, 500, { ls: 0.14, color: Colors.sub })}>SCORE</Text>
          </View>
        </View>
      </PhotoSlot>

      <View style={styles.thumbs}>
        {[0, 1, 2, 3].map((i) => (
          <PhotoSlot
            key={i}
            light
            radius={9}
            style={[styles.thumb, { borderColor: i === 0 ? Colors.brand : Colors.border }]}
          />
        ))}
      </View>

      <View style={styles.body}>
        <Text style={mono(9.5, 600, { ls: 0.18, color: Colors.brand })}>{deal.specs}</Text>
        <Text style={[archivo(20, 800, { ls: -0.025, lh: 1.2, color: Colors.text }), styles.longTitle]}>
          {deal.longTitle}
        </Text>
        <Text style={[mono(9.5, 500, { ls: 0.12, color: Colors.muted }), styles.sourceLong]}>
          {deal.sourceLong}
        </Text>

        <View style={styles.priceRow}>
          <View>
            <Text style={mono(8.5, 500, { ls: 0.18, color: Colors.muted })}>ASKING</Text>
            <Text style={[archivo(34, 800, { ls: -0.03, color: Colors.text }), styles.asking]}>
              {deal.buy}
            </Text>
          </View>
          <View style={styles.priceSide}>
            <View style={styles.priceCol}>
              <Text style={mono(8.5, 500, { ls: 0.18, color: Colors.muted })}>RESALE</Text>
              <Text style={[archivo(18, 800, { color: Colors.text }), styles.priceValue]}>
                {deal.resale}
              </Text>
            </View>
            <View style={styles.priceCol}>
              <Text style={mono(8.5, 500, { ls: 0.18, color: Colors.muted })}>PROFIT</Text>
              <Text style={[archivo(18, 800, { color: Colors.brand }), styles.priceValue]}>
                {deal.profit}
              </Text>
            </View>
          </View>
        </View>

        <Card radius={16} padding={15} style={styles.block}>
          <View style={styles.blockHead}>
            <Text style={mono(9, 500, { ls: 0.18, color: Colors.sub })}>RESALE PRICE · 90D</Text>
            <Text style={mono(11, 700, { color: Colors.brand })}>▲ 24%</Text>
          </View>
          <PriceChart />
        </Card>

        <Card radius={16} padding={15} style={styles.block}>
          <Text style={mono(9, 500, { ls: 0.18, color: Colors.sub })}>AI VERDICT</Text>
          <View style={styles.verdictList}>
            {VERDICT.map((v) => (
              <View key={v.text} style={styles.verdictRow}>
                <Text style={archivo(13, 800, { color: v.color })}>{v.icon}</Text>
                <Text style={[archivo(13, 500, { lh: 1.4, color: Colors.textSoft }), styles.verdictText]}>
                  {v.text}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <Card radius={16} style={[styles.block, styles.compsCard]}>
          <Text style={mono(9, 500, { ls: 0.18, color: Colors.sub })}>RECENT COMPARABLE SALES</Text>
          <View style={styles.compsList}>
            {COMPS.map((c, i) => (
              <View key={`${c.cond}-${i}`} style={styles.compRow}>
                <View>
                  <Text style={archivo(13, 700, { color: Colors.text })}>{c.cond}</Text>
                  <Text style={[mono(9.5, 500, { color: Colors.muted }), styles.compMeta]}>{c.meta}</Text>
                </View>
                <Text style={archivo(14.5, 800, { color: Colors.brand })}>{c.price}</Text>
              </View>
            ))}
          </View>
        </Card>

        <GlowCard
          opacity={0.16}
          cx={0.2}
          cy={0.4}
          rx={1.2}
          ry={1.2}
          stop={0.65}
          background={Colors.surface}
          border={Colors.brandBorder22}
          radius={16}
          padding={15}
          style={styles.block}>
          <Text style={mono(9, 500, { ls: 0.18, color: Colors.sub })}>PROFIT BREAKDOWN</Text>
          <View style={styles.breakdownList}>
            {breakdown.map((b) => (
              <View key={b.label} style={styles.breakdownRow}>
                <Text style={archivo(13, 500, { color: Colors.textSoft2 })}>{b.label}</Text>
                <Text style={mono(12.5, 600, { color: b.color })}>{b.value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.netRow}>
            <Text style={archivo(14, 800, { color: Colors.text })}>Net profit</Text>
            <Text style={archivo(26, 800, { ls: -0.02, color: Colors.brand })}>{`+${money(net)}`}</Text>
          </View>
        </GlowCard>

        <Button
          label="Lock this deal"
          radius={13}
          onPress={() => flash(`${deal.title} locked in`)}
          style={styles.lock}
        />
      </View>
    </Screen>
  );
}

/** 90-day resale line with a fading area fill. */
function PriceChart() {
  const line =
    'M0 82 L26 76 L52 78 L78 62 L104 66 L130 50 L156 56 L182 40 L208 44 L234 30 L260 34 L286 20 L320 10';

  return (
    <Svg width="100%" height={96} viewBox="0 0 320 96" preserveAspectRatio="none" style={styles.chart}>
      <Defs>
        <LinearGradient id="dealChartFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={Colors.brand} stopOpacity={0.4} />
          <Stop offset="1" stopColor={Colors.brand} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={`${line} L320 96 L0 96 Z`} fill="url(#dealChartFill)" />
      <Path
        d={line}
        fill="none"
        stroke={Colors.brand}
        strokeWidth={2.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0 },
  watchButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Colors.border12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchButtonOn: { borderColor: Colors.brandBorder45 },

  hero: { height: 200 },
  heroBadge: {
    position: 'absolute',
    top: 12,
    left: 16,
    backgroundColor: Colors.brand,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 9,
  },
  ring: { position: 'absolute', top: 10, right: 14, width: 54, height: 54 },
  ringLabel: { ...FILL, alignItems: 'center', justifyContent: 'center' },

  thumbs: { flexDirection: 'row', gap: 9, paddingTop: 12, paddingHorizontal: 16 },
  thumb: { width: 52, height: 44, borderWidth: 2 },

  body: { paddingTop: 16, paddingHorizontal: 16 },
  longTitle: { marginTop: 9 },
  sourceLong: { marginTop: 8 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  asking: { marginTop: 4 },
  priceSide: { flexDirection: 'row', gap: 22, paddingBottom: 5 },
  priceCol: { alignItems: 'flex-end' },
  priceValue: { marginTop: 4 },

  block: { marginTop: 12 },
  blockHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chart: { marginTop: 12 },

  verdictList: { gap: 13, marginTop: 13 },
  verdictRow: { flexDirection: 'row', gap: 11, alignItems: 'center' },
  verdictText: { flex: 1 },

  compsCard: { paddingTop: 15, paddingHorizontal: 15, paddingBottom: 4 },
  compsList: { marginTop: 6 },
  compRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineSoft,
  },
  compMeta: { marginTop: 4 },

  breakdownList: { gap: 12, marginTop: 14 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border08,
  },
  lock: { marginTop: 16 },
});
