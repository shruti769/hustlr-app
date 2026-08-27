import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BellIcon, BoltIcon, BookmarkIcon, GiftIcon, GridIcon, LogoutIcon } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { GlowCard } from '@/components/ui/glow-card';
import { Screen } from '@/components/ui/screen';
import { Touch } from '@/components/ui/touch';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { PROFILE_ROWS } from '@/data/mock';
import { useApp, useTab } from '@/store/app-store';

export default function ProfileScreen() {
  useTab('profile');
  const { entries, plan } = useApp();

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={archivo(22, 800, { ls: -0.02, color: Colors.text })}>My Profile</Text>
        <View style={styles.headerActions}>
          <Touch
            style={styles.iconButton}
            onPress={() => router.push('/watchlist')}
            accessibilityRole="button"
            accessibilityLabel="Watchlist">
            <BookmarkIcon size={14} color={Colors.text} />
          </Touch>
          <Touch
            style={styles.iconButton}
            onPress={() => router.push('/notifications')}
            accessibilityRole="button"
            accessibilityLabel="Notifications">
            <BellIcon size={14} />
          </Touch>
        </View>
      </View>

      <GlowCard
        opacity={0.1}
        cx={0.85}
        cy={0}
        rx={1.2}
        ry={1.2}
        stop={0.6}
        background={Colors.surface}
        radius={18}
        padding={18}
        style={styles.identity}>
        <View style={styles.identityRow}>
          <View style={styles.identityAvatar}>
            <Text style={archivo(17, 800, { color: Colors.brand })}>MR</Text>
          </View>
          <View style={styles.identityMeta}>
            <Text style={archivo(20, 800, { ls: -0.02, color: Colors.text })}>Mason Reid</Text>
            <Text style={[mono(10.5, 500, { color: Colors.muted }), styles.handle]}>
              @mrhustle · rank #8
            </Text>
            <View style={styles.planBadgeRow}>
              <View style={styles.planBadge}>
                <Text style={mono(8.5, 700, { ls: 0.14, color: Colors.brand })}>
                  {plan.toUpperCase()} PLAN
                </Text>
              </View>
            </View>
          </View>
        </View>
      </GlowCard>

      <View style={styles.stats}>
        <View style={styles.statsRow}>
          <ProfileStat label="TOTAL FLIPS" value="38" />
          <ProfileStat label="LIFETIME PROFIT" value="$3.2k" color={Colors.brand} />
        </View>
        <View style={styles.statsRow}>
          <ProfileStat label="AVG ROI" value="94%" />
          <ProfileStat label="STREAK" value="4d" color={Colors.gold} />
        </View>
      </View>

      <Card radius={15} style={styles.detailCard}>
        {PROFILE_ROWS(plan).map((row) => (
          <View key={row.label} style={styles.detailRow}>
            <Text style={archivo(13, 500, { color: Colors.textSoft2 })}>{row.label}</Text>
            <Text style={mono(12.5, 500, { color: Colors.text })}>{row.value}</Text>
          </View>
        ))}
      </Card>

      <Card radius={15} style={styles.actionCard}>
        <ActionRow
          icon={<BoltIcon />}
          label="Manage subscription"
          onPress={() => router.push('/plans')}
        />
        <ActionRow
          icon={<GiftIcon />}
          label={`Prize entries (${entries})`}
          onPress={() => router.push('/prize')}
        />
        <ActionRow icon={<GridIcon />} label="All screens" onPress={() => router.push('/screens')} />
        <ActionRow
          icon={<LogoutIcon />}
          label="Log out"
          color={Colors.red}
          last
          onPress={() => router.replace('/login')}
        />
      </Card>
    </Screen>
  );
}

function ProfileStat({ label, value, color = Colors.text }: { label: string; value: string; color?: string }) {
  return (
    <Card radius={15} padding={16} style={styles.statCard}>
      <Text style={mono(8.5, 500, { ls: 0.18, color: Colors.sub })}>{label}</Text>
      <Text style={[archivo(26, 800, { color }), styles.statValue]}>{value}</Text>
    </Card>
  );
}

function ActionRow({
  icon,
  label,
  onPress,
  color = Colors.text,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  color?: string;
  last?: boolean;
}) {
  return (
    <Touch
      style={[styles.actionRow, !last && styles.actionRowDivider]}
      onPress={onPress}
      accessibilityRole="button">
      {icon}
      <Text style={archivo(13.5, 600, { color })}>{label}</Text>
    </Touch>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 2, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerActions: { flexDirection: 'row', gap: 9 },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  identity: { marginTop: 0 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  identityAvatar: {
    width: 56,
    height: 56,
    borderRadius: 15,
    backgroundColor: Colors.avatarBg,
    borderWidth: 1,
    borderColor: Colors.brandBorder40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityMeta: { flex: 1, minWidth: 0 },
  handle: { marginTop: 4 },
  planBadgeRow: { flexDirection: 'row', marginTop: 8 },
  planBadge: {
    borderWidth: 1,
    borderColor: Colors.brandBorder40,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 7,
  },

  stats: { gap: 11, marginTop: 14 },
  statsRow: { flexDirection: 'row', gap: 11 },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { marginTop: 9 },

  detailCard: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 2 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineSoft,
  },

  actionCard: { marginTop: 14, overflow: 'hidden' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  actionRowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.hairlineSoft },
});
