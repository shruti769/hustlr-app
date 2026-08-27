import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PillButton } from '@/components/ui/button';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { Screen } from '@/components/ui/screen';
import { TopBar } from '@/components/ui/top-bar';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { DEALS } from '@/data/mock';
import { useBack } from '@/hooks/use-back';
import { useApp } from '@/store/app-store';

export default function WatchlistScreen() {
  const back = useBack('/deals');
  const { watch } = useApp();

  const items = watch.map((id) => DEALS.find((d) => d.id === id)).filter((d) => d !== undefined);

  return (
    <Screen contentStyle={styles.content}>
      <TopBar title="Watchlist" onBack={back} />

      <View style={styles.body}>
        <Text style={mono(9, 500, { ls: 0.18, color: Colors.sub })}>
          SAVED DEALS · WATCHING {items.length}
        </Text>

        <View style={styles.list}>
          {items.map((w) => (
            <View key={w.id} style={styles.row}>
              <PhotoSlot light radius={11} style={styles.thumb} />
              <View style={styles.meta}>
                <Text style={archivo(14, 700, { color: Colors.text })} numberOfLines={1}>
                  {w.title}
                </Text>
                <Text style={[mono(9.5, 500, { ls: 0.1, color: Colors.muted }), styles.source]}>
                  {w.source}
                </Text>
              </View>
              <View style={styles.rowEnd}>
                <Text style={archivo(13, 800, { color: Colors.brand })}>{w.profit}</Text>
                <Text style={[mono(11, 600, { color: Colors.brand }), styles.score]}>{w.score}</Text>
              </View>
              <PillButton
                label="View"
                size={12}
                padV={9}
                padH={14}
                radius={9}
                onPress={() => router.push(`/deal/${w.id}`)}
              />
            </View>
          ))}
        </View>

        {items.length === 0 ? (
          <Text style={[archivo(13, 500, { color: Colors.muted }), styles.empty]}>Nothing watched yet.</Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0 },
  body: { borderTopWidth: 1, borderTopColor: Colors.hairline, paddingTop: 14, paddingHorizontal: 16 },
  list: { gap: 11, marginTop: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.hairlineCard,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  thumb: { width: 42, height: 42 },
  meta: { flex: 1, minWidth: 0 },
  source: { marginTop: 4 },
  rowEnd: { alignItems: 'flex-end' },
  score: { marginTop: 3 },
  empty: { marginTop: 40, textAlign: 'center' },
});
