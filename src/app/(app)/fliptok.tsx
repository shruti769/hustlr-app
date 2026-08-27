import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BookmarkIcon, CommentIcon, HeartIcon } from '@/components/icons';
import { PillButton } from '@/components/ui/button';
import { PhotoSlot } from '@/components/ui/photo-slot';
import { Screen } from '@/components/ui/screen';
import { Touch } from '@/components/ui/touch';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { FLIPS, type Flip } from '@/data/mock';
import { useApp, useTab } from '@/store/app-store';

export default function FlipTokScreen() {
  useTab('fliptok');

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={archivo(22, 800, { ls: -0.02, color: Colors.text })}>Flip Tok</Text>
        <PillButton label="Leaderboard" padH={16} onPress={() => router.push('/leaderboard')} />
      </View>

      <View>
        {FLIPS.map((flip) => (
          <FlipPost key={flip.id} flip={flip} />
        ))}
      </View>
    </Screen>
  );
}

function FlipPost({ flip }: { flip: Flip }) {
  const { likes, toggleLike, saved, toggleSave } = useApp();
  const liked = !!likes[flip.id];
  const isSaved = !!saved[flip.id];
  const likeColor = liked ? Colors.brand : Colors.sub;

  return (
    <View style={styles.post}>
      <View style={styles.userRow}>
        <View style={styles.avatar}>
          <Text style={mono(10.5, 700, { color: Colors.brand })}>{flip.initials}</Text>
        </View>
        <View style={styles.userMeta}>
          <Text style={archivo(14, 800, { color: Colors.text })}>{flip.name}</Text>
          <Text style={[mono(10.5, 500, { color: Colors.muted }), styles.handle]}>{flip.handle}</Text>
        </View>
        <View style={styles.profitBadge}>
          <Text style={archivo(12, 800, { color: Colors.brand })}>{flip.profit}</Text>
        </View>
      </View>

      <PhotoSlot hint={`${flip.item} photo`} style={styles.image}>
        <View style={styles.statsBar} pointerEvents="none">
          <View style={styles.statCol}>
            <Text style={mono(8.5, 500, { ls: 0.16, color: Colors.subLight })}>BOUGHT</Text>
            <Text style={[archivo(16, 800, { color: Colors.textStrong }), styles.statValue]}>
              {flip.bought}
            </Text>
          </View>
          <View style={styles.statCol}>
            <Text style={mono(8.5, 500, { ls: 0.16, color: Colors.subLight })}>SOLD</Text>
            <Text style={[archivo(16, 800, { color: Colors.textStrong }), styles.statValue]}>
              {flip.sold}
            </Text>
          </View>
          <View style={styles.statColEnd}>
            <Text style={mono(8.5, 500, { ls: 0.16, color: Colors.subLight })}>ROI</Text>
            <Text style={[archivo(16, 800, { color: Colors.brand }), styles.statValue]}>{flip.roi}</Text>
          </View>
        </View>
      </PhotoSlot>

      <Text style={[archivo(13, 400, { lh: 1.5, color: Colors.textSoft }), styles.caption]}>
        {flip.caption}
      </Text>

      <View style={styles.actions}>
        <Touch
          style={styles.action}
          onPress={() => toggleLike(flip.id)}
          accessibilityRole="button"
          accessibilityLabel={liked ? 'Unlike' : 'Like'}>
          <HeartIcon color={likeColor} fill={liked ? likeColor : 'none'} />
          <Text style={archivo(12.5, 600, { color: likeColor })}>{flip.likes}</Text>
        </Touch>

        <View style={styles.action}>
          <CommentIcon />
          <Text style={archivo(12.5, 600, { color: Colors.sub })}>{flip.comments}</Text>
        </View>

        <Touch
          style={styles.save}
          onPress={() => toggleSave(flip.id)}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Unsave' : 'Save'}>
          <BookmarkIcon
            color={isSaved ? Colors.brand : Colors.sub}
            fill={isSaved ? Colors.brand : 'none'}
          />
        </Touch>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 2 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },

  post: { borderTopWidth: 1, borderTopColor: Colors.hairline, paddingBottom: 6 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 13, paddingHorizontal: 16 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.avatarBg,
    borderWidth: 1,
    borderColor: Colors.brandBorder30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMeta: { flex: 1, minWidth: 0 },
  handle: { marginTop: 2 },
  profitBadge: {
    borderWidth: 1,
    borderColor: Colors.brandBorder45,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  image: { height: 250 },
  statsBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: Colors.scrim,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  statCol: { flex: 1 },
  statColEnd: { alignItems: 'flex-end' },
  statValue: { marginTop: 3 },

  caption: { paddingTop: 13, paddingHorizontal: 16 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  save: { marginLeft: 'auto' },
});
