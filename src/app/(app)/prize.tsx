import { StyleSheet, Text, View } from 'react-native';

import { TrophyIcon } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { GlowCard } from '@/components/ui/glow-card';
import { Screen } from '@/components/ui/screen';
import { TopBar } from '@/components/ui/top-bar';
import { Touch } from '@/components/ui/touch';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { ENTRY_WAYS, PAST_WINNERS } from '@/data/mock';
import { useBack } from '@/hooks/use-back';
import { useApp } from '@/store/app-store';

export default function PrizeScreen() {
  const back = useBack();
  const { entries, addEntries, flash } = useApp();
  const winChance = `${(entries * 0.05).toFixed(1)}%`;

  return (
    <Screen contentStyle={styles.content}>
      <TopBar title="Prize Draw" onBack={back} />

      <View style={styles.body}>
        <GlowCard
          color={Colors.gold}
          opacity={0.14}
          cx={0.8}
          cy={0}
          rx={1.3}
          ry={1.2}
          stop={0.65}
          background={Colors.surfaceDim2}
          border={Colors.goldBorder18}
          radius={18}
          padding={0}
          style={styles.hero}>
          <View style={styles.heroInner}>
            <View style={styles.countdown}>
              <View style={styles.countdownDot} />
              <Text style={mono(9, 600, { ls: 0.16, color: Colors.gold })}>DRAWS IN 14D 06H 22M</Text>
            </View>

            <Text style={[mono(9.5, 600, { ls: 0.2, color: Colors.gold }), styles.poolLabel]}>
              THIS MONTH’S POOL
            </Text>
            <Text style={[archivo(52, 800, { ls: -0.04, color: Colors.text }), styles.pool]}>$500</Text>
            <Text style={[mono(11, 500, { color: Colors.sub }), styles.poolNote]}>
              AUD · paid instantly
            </Text>

            <View style={styles.entryRow}>
              <View style={styles.entryCol}>
                <Text style={mono(8.5, 500, { ls: 0.18, color: Colors.sub })}>YOUR ENTRIES</Text>
                <Text style={[archivo(26, 800, { color: Colors.brand }), styles.entryValue]}>
                  {entries}
                </Text>
              </View>
              <View style={styles.entryCol}>
                <Text style={mono(8.5, 500, { ls: 0.18, color: Colors.sub })}>WIN CHANCE</Text>
                <Text style={[archivo(26, 800, { color: Colors.text }), styles.entryValue]}>
                  {winChance}
                </Text>
              </View>
            </View>
          </View>
        </GlowCard>

        <Card radius={16} background={Colors.surfaceDim2} style={styles.earnCard}>
          <Text style={mono(9, 500, { ls: 0.18, color: Colors.sub })}>EARN MORE ENTRIES</Text>
          <View style={styles.earnList}>
            {ENTRY_WAYS.map((e) => (
              <Touch
                key={e.label}
                style={styles.earnRow}
                onPress={() => {
                  addEntries(e.amt);
                  flash(`+${e.amt} entries earned`);
                }}
                accessibilityRole="button">
                <Text style={archivo(13, 500, { color: Colors.text })}>{e.label}</Text>
                <Text style={archivo(13, 700, { color: Colors.brand })}>{e.value}</Text>
              </Touch>
            ))}
          </View>
        </Card>

        <Card radius={16} padding={15} background={Colors.surfaceDim2} style={styles.winnersCard}>
          <Text style={mono(9, 500, { ls: 0.18, color: Colors.sub })}>PAST WINNERS</Text>
          <View style={styles.winnersList}>
            {PAST_WINNERS.map((w) => (
              <View key={w.name} style={styles.winnerRow}>
                <View style={styles.winnerIcon}>
                  <TrophyIcon />
                </View>
                <View style={styles.winnerMeta}>
                  <Text style={archivo(13, 700, { color: Colors.text })}>{w.name}</Text>
                  <Text style={[mono(9.5, 500, { color: Colors.muted }), styles.winnerHandle]}>
                    {w.meta}
                  </Text>
                </View>
                <Text style={archivo(13.5, 800, { color: Colors.gold })}>{w.prize}</Text>
              </View>
            ))}
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0 },
  body: { borderTopWidth: 1, borderTopColor: Colors.hairline, padding: 16 },

  hero: { overflow: 'hidden' },
  heroInner: { paddingVertical: 22, paddingHorizontal: 18, alignItems: 'center' },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: Colors.goldBorder40,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  countdownDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.gold },
  poolLabel: { marginTop: 18 },
  pool: { marginTop: 6 },
  poolNote: { marginTop: 2 },
  entryRow: { flexDirection: 'row', alignSelf: 'stretch', marginTop: 22 },
  entryCol: { flex: 1, alignItems: 'center' },
  entryValue: { marginTop: 6 },

  earnCard: { marginTop: 14, paddingTop: 15, paddingHorizontal: 15, paddingBottom: 4 },
  earnList: { marginTop: 6 },
  earnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineSoft,
  },

  winnersCard: { marginTop: 14 },
  winnersList: { gap: 14, marginTop: 14 },
  winnerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  winnerIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: Colors.goldGlass12,
    borderWidth: 1,
    borderColor: Colors.goldBorder30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerMeta: { flex: 1 },
  winnerHandle: { marginTop: 3 },
});
