import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { TopBar } from '@/components/ui/top-bar';
import { Colors } from '@/constants/theme';
import { archivo, bricolageBold, bricolageExtraBold, mono } from '@/constants/type';
import { LEADERS } from '@/data/mock';
import { useBack } from '@/hooks/use-back';

const [FIRST, SECOND, THIRD] = LEADERS;

export default function LeaderboardScreen() {
  const back = useBack('/fliptok');

  return (
    <Screen contentStyle={styles.content}>
      <TopBar
        title="Leaderboard"
        onBack={back}
        titleStyle={bricolageBold(22, { lh: 1, ls: -0.4 / 22, color: Colors.text })}
      />

      <View style={styles.body}>
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
            <Text
              style={[
                mono(12, 700, {
                  color: l.rank === '1' ? Colors.gold : l.rank === '3' ? Colors.orange : Colors.muted,
                }),
                styles.rank,
              ]}>
              {l.rank}
            </Text>
            <View style={styles.rowAvatar}>
              <Text style={mono(10, 700, { color: Colors.green })}>{l.initials}</Text>
            </View>
            <View style={styles.rowMeta}>
              <Text style={archivo(13, 700, { color: Colors.text })}>{l.name}</Text>
              <Text style={mono(10, 500, { color: Colors.muted })}>{l.handle}</Text>
            </View>
            <View style={styles.rowEnd}>
              <Text style={mono(13, 700, { color: Colors.green })}>{l.total}</Text>
              <Text style={mono(9.5, 500, { color: Colors.gold })}>{l.streak}</Text>
            </View>
            </View>
          ))}
        </View>
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
  const accent = winner ? Colors.gold : place === '3' ? Colors.orange : Colors.subLight;

  return (
    <View
      style={[
        styles.podiumCard,
        winner ? styles.podiumWinner : styles.podiumRunnerUp,
        place === '3' && styles.podiumBronze,
      ]}>
      {winner && (
        <LinearGradient
          colors={['rgba(233,196,106,0.09)', '#0C0F0D']}
          locations={[0, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        />
      )}
      <Text style={mono(winner ? 17 : 15, 700, { color: accent })}>{place}</Text>
      <View
        style={[
          styles.podiumAvatar,
          winner ? styles.podiumAvatarWinner : styles.podiumAvatarRunnerUp,
        ]}>
        <Text style={mono(winner ? 12 : 11, 700, { color: accent })}>
          {entry.initials}
        </Text>
      </View>
      <Text
        style={[
          winner
            ? archivo(14.5, 800, { color: Colors.text })
            : archivo(13.5, 700, { color: Colors.text }),
          styles.podiumName,
        ]}>
        {entry.name}
      </Text>
      <Text
        style={[
          bricolageExtraBold(18, {
            lh: 1,
            ls: 0,
            color: winner ? Colors.gold : Colors.green,
          }),
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
  content: { paddingTop: 0 },
  body: { borderTopWidth: 1, borderTopColor: Colors.hairlineCard, paddingHorizontal: 12 },

  podium: { flexDirection: 'row', gap: 9, alignItems: 'flex-end', marginTop: 20 },
  podiumCard: { borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  podiumRunnerUp: {
    flex: 1,
    backgroundColor: Colors.surfaceDim,
    borderColor: Colors.border09,
    paddingVertical: 14,
    paddingHorizontal: 10,
    minHeight: 142,
    justifyContent: 'center',
  },
  podiumWinner: {
    flex: 1.1,
    backgroundColor: '#0C0F0D',
    borderColor: 'rgba(233,196,106,0.35)',
    overflow: 'hidden',
    paddingVertical: 18,
    paddingHorizontal: 10,
    minHeight: 166,
    justifyContent: 'center',
  },
  podiumBronze: {
    shadowColor: '#CD7F45',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  podiumAvatar: { marginTop: 8, alignItems: 'center', justifyContent: 'center' },
  podiumAvatarRunnerUp: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.rankBg,
    borderWidth: 1,
    borderColor: Colors.brandBorder22,
  },
  podiumAvatarWinner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.goldRankBg,
    borderWidth: 1,
    borderColor: Colors.goldBorder32,
  },
  podiumName: { marginTop: 8 },
  podiumTotal: { marginTop: 3, textAlign: 'center' },

  list: { gap: 1, marginTop: 16, backgroundColor: Colors.hairlineCard, borderRadius: 17, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 11, paddingHorizontal: 14 },
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
