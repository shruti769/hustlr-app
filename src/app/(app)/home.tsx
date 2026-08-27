import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BellIcon } from '@/components/icons';
import { LogoMark } from '@/components/ui/brand';
import { Button } from '@/components/ui/button';
import { Card, StatTile } from '@/components/ui/card';
import { GlowCard } from '@/components/ui/glow-card';
import { Screen } from '@/components/ui/screen';
import { Touch } from '@/components/ui/touch';
import { Colors } from '@/constants/theme';
import { archivo, mono, spaceGroteskBold } from '@/constants/type';
import { useTab } from '@/store/app-store';

/** The three "Your arsenal" entry cards, each with its own accent. */
const ARSENAL = [
  {
    title: 'Deal Finder',
    body: 'AI hunts live marketplace listings and scores every deal before you even blink.',
    cta: 'Hunt Deals →',
    color: Colors.brand,
    href: '/deals',
  },
  {
    title: 'Inventory',
    body: 'Track every item you source, list, and sell. Know your capital and realised profit at a glance.',
    cta: 'My Inventory →',
    color: Colors.blue,
    href: '/inventory',
  },
  {
    title: 'FlipTok & Ranks',
    body: 'A feed of real flips from real hustlers, plus a leaderboard ranking who is stacking the most.',
    cta: 'View Feed →',
    color: Colors.purple,
    href: '/fliptok',
  },
] as const;

export default function HomeScreen() {
  useTab('home');

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <LogoMark size={26} fontSize={15} />
          <Text style={archivo(15, 900, { ls: 0.04, color: Colors.text })}>HUSTLR</Text>
        </View>
        <View style={styles.headerActions}>
          <Touch
            style={styles.iconButton}
            onPress={() => router.push('/notifications')}
            accessibilityRole="button"
            accessibilityLabel="Notifications">
            <BellIcon />
          </Touch>
          <Touch
            style={styles.avatar}
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel="My profile">
            <Text style={mono(11, 700, { color: Colors.brand })}>MR</Text>
          </Touch>
        </View>
      </View>

      <GlowCard>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={archivo(11, 700, { color: Colors.brand })}>⚡ The AI Resale Weapon.</Text>
          </View>
        </View>
        <Text style={[spaceGroteskBold(38, { lh: 1.02, ls: -0.76 / 38, color: Colors.text }), styles.heroTitle]}>
          Stop Browsing.{'\n'}Start Stacking.
        </Text>
        <Text style={[archivo(13, 400, { lh: 1.6, color: Colors.sub }), styles.heroBody]}>
          HUSTLR is your unfair advantage. AI scans the markets, scores every listing, detects scams,
          and shows you the profit before you buy.
        </Text>
        <Button
          label="🔥 Find Hot Deals"
          size={14}
          padding={15}
          onPress={() => router.push('/deals')}
          style={styles.heroCta}
        />
        <Button
          label="📦 My Inventory"
          tone="ghost"
          size={14}
          weight={700}
          padding={15}
          onPress={() => router.push('/inventory')}
          style={styles.heroCtaSecondary}
        />
      </GlowCard>

      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <StatTile label="ACTIVE DEALS" value="5" delta="+12 today" style={styles.cell} />
          <StatTile label="FLIP POSTS" value="5" delta="2 trending" style={styles.cell} />
        </View>
        <View style={styles.gridRow}>
          <StatTile
            label="PRIZE POOL"
            value="$500"
            delta="This month"
            onPress={() => router.push('/prize')}
            style={styles.cell}
          />
          <StatTile
            label="TOP PROFIT"
            value="$45"
            valueColor={Colors.brand}
            delta="this week"
            style={styles.cell}
          />
        </View>
      </View>

      <Text style={[mono(9.5, 500, { ls: 0.22, color: Colors.muted }), styles.sectionLabel]}>
        YOUR ARSENAL
      </Text>
      <View style={styles.arsenal}>
        {ARSENAL.map((item) => (
          <Card key={item.title} radius={17} padding={18} onPress={() => router.push(item.href as never)}>
            <Text style={archivo(16, 800, { color: Colors.text })}>{item.title}</Text>
            <Text style={[archivo(12.5, 400, { lh: 1.55, color: Colors.sub }), styles.arsenalBody]}>
              {item.body}
            </Text>
            <Text style={[archivo(12.5, 700, { color: item.color }), styles.arsenalCta]}>{item.cta}</Text>
          </Card>
        ))}
      </View>

      <Text style={[archivo(10, 400, { lh: 1.6, color: Colors.disclaimer }), styles.disclaimer]}>
        <Text style={archivo(10, 400, { color: Colors.gold })}>⚠ Risk Disclaimer</Text>: HUSTLR
        provides AI-generated deal analysis for informational purposes only. Always verify listings
        independently before purchasing.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 2, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingBottom: 16,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: Colors.avatarBg,
    borderWidth: 1,
    borderColor: Colors.avatarBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: { flexDirection: 'row' },
  badge: {
    borderWidth: 1,
    borderColor: Colors.brandBorder35,
    backgroundColor: Colors.greenGlass,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  heroTitle: { marginTop: 16 },
  heroBody: { marginTop: 12 },
  heroCta: { marginTop: 20 },
  heroCtaSecondary: { marginTop: 10 },
  grid: { gap: 11, marginTop: 14 },
  gridRow: { flexDirection: 'row', gap: 11 },
  cell: { flex: 1 },
  sectionLabel: { marginTop: 24, marginBottom: 12 },
  arsenal: { gap: 12 },
  arsenalBody: { marginTop: 8 },
  arsenalCta: { marginTop: 12 },
  disclaimer: { marginTop: 26, textAlign: 'center', paddingHorizontal: 6 },
});
