import { Image, type ImageSource } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SearchIcon } from '@/components/icons';
import { PillButton } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { Screen } from '@/components/ui/screen';
import { Colors } from '@/constants/theme';
import { archivo, mono, screenHeading } from '@/constants/type';
import { CATEGORIES, DEALS, type Deal } from '@/data/mock';
import { riskColor, scoreColor, useApp, useTab } from '@/store/app-store';

const DEAL_IMAGES: Record<string, ImageSource> = {
  aj4: require('../../../assets/images/deals/air-jordan.png'),
  dys: require('../../../assets/images/deals/dyson.png'),
  pkm: require('../../../assets/images/deals/pokemon.png'),
};

export default function DealsScreen() {
  useTab('deals');
  const { search, setSearch, cat, setCat } = useApp();
  const [focused, setFocused] = useState(false);

  const visible = useMemo(
    () =>
      DEALS.filter(
        (d) =>
          (cat === 'All' || d.cat === cat.toUpperCase()) &&
          d.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [cat, search],
  );

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.titleBar}>
        <Text style={[screenHeading(Colors.text), styles.title]}>Hot Deals</Text>
      </View>

      <View style={[styles.searchBar, focused && styles.searchBarFocused]}>
        <SearchIcon />
        <TextInput
          value={search}
          onChangeText={setSearch}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search item, brand…"
          placeholderTextColor={Colors.sub}
          selectionColor={Colors.green}
          autoCorrect={false}
          style={[styles.searchInput, archivo(14, 400, { color: Colors.text })]}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        contentContainerStyle={styles.chipRowContent}>
        {CATEGORIES.map((label) => (
          <Chip key={label} label={label} active={cat === label} onPress={() => setCat(label)} />
        ))}
      </ScrollView>

      <View style={styles.list}>
        {visible.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
        {visible.length === 0 ? (
          <Text style={[archivo(13, 500, { color: Colors.muted }), styles.empty]}>
            No deals match that search.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const risk = riskColor(deal.risk);

  return (
    <View style={styles.card}>
      <PhotoSlot hint={`${deal.title} photo`} style={styles.cardImage}>
        {DEAL_IMAGES[deal.id] ? (
          <Image source={DEAL_IMAGES[deal.id]} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : null}
        <View style={styles.profitBadge}>
          <Text style={archivo(12, 800, { color: Colors.onBrand })}>{deal.profit}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <View style={[styles.scoreDot, { backgroundColor: scoreColor(deal.score) }]} />
          <Text style={mono(12, 700, { color: Colors.text })}>{deal.score}</Text>
        </View>
      </PhotoSlot>

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={[archivo(15.5, 800, { color: Colors.text }), styles.cardTitle]} numberOfLines={1}>
            {deal.title}
          </Text>
          <View style={[styles.riskBadge, { borderColor: risk }]}>
            <Text style={archivo(10.5, 700, { color: risk })}>{deal.risk}</Text>
          </View>
        </View>

        <Text style={[mono(9.5, 500, { ls: 0.12, color: Colors.muted }), styles.cardSource]}>
          {deal.source}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.metrics}>
            <View>
              <Text style={mono(8.5, 500, { ls: 0.16, color: Colors.muted })}>BUY</Text>
              <Text style={[archivo(16, 700, { color: Colors.text }), styles.metricValue]}>{deal.buy}</Text>
            </View>
            <View>
              <Text style={mono(8.5, 500, { ls: 0.16, color: Colors.muted })}>ROI</Text>
              <Text style={[archivo(16, 700, { color: Colors.brand }), styles.metricValue]}>{deal.roi}</Text>
            </View>
          </View>
          <PillButton label="View →" onPress={() => router.push(`/deal/${deal.id}`)} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 2, paddingHorizontal: 12 },
  titleBar: {
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineCard,
  },
  title: { paddingTop: 10, paddingBottom: 14 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.search,
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: Colors.searchBorder,
    marginTop: 14,
    marginHorizontal: 8,
  },
  searchBarFocused: { borderColor: Colors.brandBorder35 },
  searchInput: { flex: 1, minWidth: 0, padding: 0 },
  chipRow: { marginTop: 14 },
  chipRowContent: { gap: 8, paddingBottom: 2 },
  list: { gap: 10, marginTop: 12 },
  empty: { textAlign: 'center', marginTop: 30 },

  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.hairlineCard,
    borderRadius: 17,
    overflow: 'hidden',
  },
  cardImage: { height: 114 },
  profitBadge: {
    position: 'absolute',
    top: 11,
    left: 11,
    backgroundColor: Colors.brand,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  scoreBadge: {
    position: 'absolute',
    top: 11,
    right: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.scrimStrong,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  scoreDot: { width: 6, height: 6, borderRadius: 3 },
  cardBody: { paddingTop: 15, paddingHorizontal: 15, paddingBottom: 16 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  cardTitle: { flexShrink: 1 },
  riskBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1 },
  cardSource: { marginTop: 7 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  metrics: { flexDirection: 'row', gap: 26 },
  metricValue: { marginTop: 4 },
});
