import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { BackLink } from '@/components/ui/top-bar';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { LEADERS } from '@/data/mock';
import { useBack } from '@/hooks/use-back';

const [FIRST, SECOND, THIRD] = LEADERS;

export default function LeaderboardScreen() {
  const back = useBack('/fliptok');

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.headRow}>
        <BackLink label="← FLIP TOK" onPress={back} />
      </View>

      <Text style={[archivo(24, 800, { ls: -0.02, color: Colors.text }), styles.title]}>Leaderboard</Text>

      <View style={styles.podium}>
        <PodiumCard entry={SECOND} place="2" />
        <PodiumCard entry={FIRST} place="1" winner />
        <PodiumCard entry={THIRD} place="3" />
      </View>

      <View style={styles.list}>
        {LEADERS.map((l) => (
          <View
            key={l.rank}
            style={[styles.row, { backgroundColor: l.name === 'You' ? Colors.rowSelf : Colors.surfaceAlt }]}>
            <Text style={[mono(12, 700, { color: Colors.muted }), styles.rank]}>{l.rank}</Text>
            <View style={styles.rowAvatar}>
              <Text style={mono(10, 700, { color: Colors.green })}>{l.initials}</Text>
            </View>
            <View style={styles.rowMeta}>
              <Text style={archivo(13, 700, { color: Colors.text })}>{l.name}</Text>
              <Text style={mono(10, 500, { color: Colors.muted })}>{l.handle}</Text>
            </View>
            <View style={styles.rowEnd}>
              <Text style={mono(13, 700, { color: Colors.text })}>{l.total}</Text>
              <Text style={mono(9.5, 500, { color: Colors.green })}>{l.streak}</Text>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

function PodiumCard({
  entry,
  place,
  winner = false,
}: {
  entry: (typeof LEADERS)[number];
  place: string;
  winner?: boolean;
}) {
  return (
    <View style={[styles.podiumCard, winner ? styles.podiumWinner : styles.podiumRunnerUp]}>
      <Text style={mono(winner ? 12 : 11, 700, { color: winner ? Colors.gold : Colors.sub })}>{place}</Text>
      <View
        style={[
          styles.podiumAvatar,
          winner ? styles.podiumAvatarWinner : styles.podiumAvatarRunnerUp,
        ]}>
        <Text style={mono(winner ? 12 : 11, 700, { color: winner ? Colors.gold : Colors.green })}>
          {entry.initials}
        </Text>
      </View>
      <Text
        style={[
          winner
            ? archivo(13.5, 800, { color: Colors.text })
            : archivo(12.5, 700, { color: Colors.text }),
          styles.podiumName,
        ]}>
        {entry.name}
      </Text>
      <Text
        style={[
          winner ? mono(15, 800, { color: Colors.gold }) : mono(13, 700, { color: Colors.green }),
          styles.podiumTotal,
        ]}>
        {shorten(entry.total)}
      </Text>
    </View>
  );
}

/** `$18,420` → `$18.4k`, matching the podium's compact figures. */
function shorten(total: string) {
  const n = parseFloat(total.replace(/[^0-9.]/g, ''));
  return `$${(n / 1000).toFixed(1)}k`;
}

const styles = StyleSheet.create({
  content: { paddingTop: 6, paddingHorizontal: 20 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { marginTop: 12 },

  podium: { flexDirection: 'row', gap: 9, alignItems: 'flex-end', marginTop: 20 },
  podiumCard: { borderRadius: 15, alignItems: 'center', borderWidth: 1 },
  podiumRunnerUp: {
    flex: 1,
    backgroundColor: Colors.surfaceDim,
    borderColor: Colors.border09,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  podiumWinner: {
    flex: 1.15,
    backgroundColor: Colors.goldGlass,
    borderColor: Colors.goldBorder32,
    paddingVertical: 18,
    paddingHorizontal: 10,
  },
  podiumAvatar: { marginTop: 8, alignItems: 'center', justifyContent: 'center' },
  podiumAvatarRunnerUp: { width: 38, height: 38, borderRadius: 13, backgroundColor: Colors.rankBg },
  podiumAvatarWinner: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.goldRankBg },
  podiumName: { marginTop: 8 },
  podiumTotal: { marginTop: 3 },

  list: { gap: 1, marginTop: 16, backgroundColor: Colors.hairlineCard, borderRadius: 15, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 13, paddingHorizontal: 14 },
  rank: { width: 14 },
  rowAvatar: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: Colors.rankBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMeta: { flex: 1 },
  rowEnd: { alignItems: 'flex-end' },
});
