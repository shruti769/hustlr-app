import { Image } from 'expo-image';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { PanResponder, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming, type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { ART, IMG, type Img, type Screen } from '../data';
import { estProfit, money, signed, type Deal } from '../model';
import {
  ACH, ACH_TOTAL, IC, PREMIUM, RSW, type Cosmetic, type IconKey, type Tone,
} from '../rewards-data';
import { useRewards, type CalcVals, type Toast } from '../rewards';
import { LIVE, useHustlr } from '../store';
import { A, C, G, L, N, bgImage, bric, hk, mono } from '../theme';
import { Photo, Press, Slider } from '../ui';

// ───────────────────────────────────────────────────────────── shared bits

export const GRAD = `linear-gradient(135deg, ${C.a2} 0%, ${C.a} 100%)`;
const pad = { paddingTop: 14, paddingHorizontal: 14, paddingBottom: 110 } as const;
export const kick = mono(10, { ls: 1.2, c: C.t4 });

export const tint = (tone: Tone | 'lock', n: number) => (tone === 'gold' ? G(n) : tone === 'neg' ? N(n) : tone === 'lock' ? L(6) : A(n));
export const inkOf = (tone: Tone | 'lock') => (tone === 'gold' ? C.goldink : tone === 'neg' ? C.neg : tone === 'lock' ? C.t4 : C.aink);

/** One of the prototype's 24px line icons. */
export function Icon({ k, c, size = 22, width = 1.5 }: { k: IconKey; c: string; size?: number; width?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      {IC[k].map((d, i) => <Path key={i} d={d} />)}
    </Svg>
  );
}

export function Bolt({ size = 13, c = C.goldink }: { size?: number; c?: string }) {
  return <Icon k="bolt" c={c} size={size} width={1.7} />;
}

export function Moon({ size = 20, c = C.goldink }: { size?: number; c?: string }) {
  return <Icon k="moon" c={c} size={size} width={1.6} />;
}

export function ChevronRight({ c = C.t4 }: { c?: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 3.5 10.5 8 6 12.5" />
    </Svg>
  );
}

/** Rounded tile holding an icon, tinted by tone. */
export function IconTile({ k, tone, size = 46, radius = 12, icon = 22, bg }: {
  k: IconKey; tone: Tone | 'lock'; size?: number; radius?: number; icon?: number; bg?: string;
}) {
  return (
    <View style={[{ width: size, height: size, borderRadius: radius, alignItems: 'center', justifyContent: 'center' },
      bg ? bgImage(bg) : { backgroundColor: tint(tone, 14) }]}>
      <Icon k={k} c={inkOf(tone)} size={icon} />
    </View>
  );
}

/** Inline mono pill. */
export function Chip({ label, bg, fg, icon, size = 10, style }: {
  label: string; bg: string; fg: string; icon?: ReactNode; size?: number; style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.chip, { backgroundColor: bg }, style]}>
      {icon}
      <Text numberOfLines={1} style={mono(size, { w: 600, ls: 0.4, c: fg })}>{label}</Text>
    </View>
  );
}

export function GradButton({ label, onPress, height = 50, size = 15, style }: {
  label: string; onPress?: () => void; height?: number; size?: number; style?: StyleProp<ViewStyle>;
}) {
  return (
    <Press onPress={onPress} style={[s.grad, { height }, bgImage(GRAD), style]}>
      <Text style={hk(size, { w: 700, c: C.ona })}>{label}</Text>
    </Press>
  );
}

export function GhostButton({ label, onPress, height = 48, style }: {
  label: string; onPress?: () => void; height?: number; style?: StyleProp<ViewStyle>;
}) {
  return (
    <Press onPress={onPress} style={[s.ghost, { height }, style]} hover={{ borderColor: A(35) }}>
      <Text style={hk(14, { w: 600, c: C.t2 })}>{label}</Text>
    </Press>
  );
}

/** Optional rewarded-ad row, dashed like an ad slot. */
function AdRow({ label, onPress, kicker = 'REWARDED AD · OPTIONAL', tile = 44, body }: {
  label?: string; onPress?: () => void; kicker?: string; tile?: number; body?: string;
}) {
  return (
    <Press onPress={onPress} style={s.ad}>
      <View style={[s.adTile, { width: tile, height: tile }]}>
        <Text style={mono(10, { c: C.t4 })}>AD</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={kick}>{kicker}</Text>
        {label ? <Text style={[hk(14, { w: 600, c: C.t1 }), { paddingTop: 6 }]}>{label}</Text> : null}
        {body ? <Text style={[hk(12.5, { lh: 17, c: C.t3 }), { paddingTop: 6 }]}>{body}</Text> : null}
      </View>
    </Press>
  );
}

/** Placeholder block that breathes while content loads. */
export function Skel({ h, radius = 16, style }: { h: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  const o = useSharedValue(0.45);
  useEffect(() => { o.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }), -1, true); }, [o]);
  const anim = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ height: h, borderRadius: radius, backgroundColor: L(6) }, anim, style]} />;
}

/** Thin progress bar; `grad` uses the accent gradient. */
export function Bar({ pct, h = 6, fill = C.a, grad, track = L(8), style }: {
  pct: number; h?: number; fill?: string; grad?: boolean; track?: string; style?: StyleProp<ViewStyle>;
}) {
  const w = `${Math.max(0, Math.min(100, pct))}%` as const;
  return (
    <View style={[{ height: h, borderRadius: h / 2, backgroundColor: track, overflow: 'hidden' }, style]}>
      <View style={[{ height: h, borderRadius: h / 2, width: w, backgroundColor: fill }, grad && bgImage(`linear-gradient(90deg, ${C.a} 0%, ${C.a2} 100%)`)]} />
    </View>
  );
}

/** Pulsing live dot. */
export function LiveDot({ size = 7, color = C.a, on = true }: { size?: number; color?: string; on?: boolean }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = on ? withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true) : 0;
  }, [p, on]);
  const anim = useAnimatedStyle(() => ({ opacity: 1 - 0.65 * p.value, transform: [{ scale: 1 - 0.3 * p.value }] }));
  return <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, anim]} />;
}

const stat = (label: string, value: string, fg: string = C.t1, accent = false) => ({ label, value, fg, accent });

function StatBox({ label, value, fg = C.t1, accent, pad: p = '10 11', size = 16, gap = 8 }: {
  label: string; value: string; fg?: string; accent?: boolean; pad?: string; size?: number; gap?: number;
}) {
  const [v, h] = p.split(' ').map(Number);
  return (
    <View style={[s.statBox, { paddingVertical: v, paddingHorizontal: h }, accent && { backgroundColor: A(8), borderColor: A(20) }]}>
      <Text numberOfLines={1} style={mono(8.5, { ls: 1, c: C.t4 })}>{label}</Text>
      <Text numberOfLines={1} style={[mono(size, { w: 600, c: fg }), { paddingTop: gap }]}>{value}</Text>
    </View>
  );
}

// ───────────────────────────────────────────────────────── derived figures

/** Achievement progress: sample figures in demo, real ones where the app knows them. */
export function useAchievements() {
  const { st } = useHustlr();
  const { rs } = useRewards();
  return useMemo(() => {
    let n = 0;
    const all = ACH.map((c) => c.items.map(([name, cond, sample, target, xp, icon, lock]) => {
      // Live progress comes from the server, in the same order as ACH.
      const server = LIVE ? rs.achProgress?.[n++] : undefined;
      let cur = LIVE ? (server?.cur ?? 0) : sample;
      if (!LIVE && name === 'The Oracle') cur = rs.oracle;
      if (!LIVE && name === 'Patron of the Arcade') cur = st.streak + 3;
      const done = server ? server.done || cur >= target : cur >= target;
      return { name, cond, cur: Math.min(cur, target), target, xp, icon, lock, done };
    }));
    const flat = all.flat();
    const done = flat.filter((a) => a.done);
    return { all, done: done.length, xp: done.reduce((k, a) => k + a.xp, 0) };
  }, [rs.oracle, rs.achProgress, st.streak]);
}

/** Profit that slipped past in today's Missed Connections report. */
export function useMissedTotal() {
  const { missed } = useRewards();
  return money(missed.reduce((n, m) => n + m.profit, 0));
}

/** Level, XP and the regional rank, as shown across the rewards cards. */
export function useLevel() {
  const { rs } = useRewards();
  const { me } = useHustlr();
  return {
    level: rs.level,
    xpLabel: `${rs.xp.toLocaleString()} / ${rs.xpMax.toLocaleString()} XP`,
    xpPct: (rs.xp / rs.xpMax) * 100,
    rank: LIVE ? me.rank : 8,
  };
}

export const holdSlotsOf = (redeemed: Record<string, unknown>) => 10 + (redeemed.hold5 ? 5 : 0);

const netOf = (p: number, r: number, fee: number, ship: number, other: number) => r - p - (r * fee) / 100 - ship - other;

// ───────────────────────────────────────────────────────── level cards

/** The LVL tile: gradient square with the level number. */
export function LevelBadge({ level, size = 46 }: { level: number; size?: number }) {
  return (
    <View style={[{ width: size, height: size, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, bgImage(`linear-gradient(140deg, ${C.a2} 0%, ${C.a} 100%)`)]}>
      <Text style={mono(7.5, { ls: 1, c: C.ona })}>LVL</Text>
      <Text style={bric(18, { lh: 1, c: C.ona })}>{level}</Text>
    </View>
  );
}

/** Arcade: level progress with tickets, Flash tokens and achievements. */
export function ArcadeLevelCard() {
  const { go } = useHustlr();
  const { rs } = useRewards();
  const lv = useLevel();
  const ach = useAchievements();
  return (
    <View style={[s.card18, { padding: 16, gap: 14 }]}>
      <View style={s.rowC12}>
        <LevelBadge level={lv.level} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={s.baseline}>
            <Text style={hk(14, { w: 700, c: C.t1 })}>Level {lv.level}</Text>
            <Text style={mono(10.5, { c: C.t3 })}>{lv.xpLabel}</Text>
          </View>
          <Bar pct={lv.xpPct} grad style={{ marginTop: 9 }} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Press onPress={() => go('redeem')} style={s.mini}>
          <Text style={mono(8.5, { ls: 1, c: C.t4 })}>TICKETS</Text>
          <Text style={[mono(14, { w: 600, c: C.t1 }), { paddingTop: 7 }]}>{rs.tickets}</Text>
        </Press>
        <Press onPress={() => go('flash')} style={s.mini}>
          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
            <Bolt size={10} />
            <Text style={mono(8.5, { ls: 1, c: C.t4 })}>FLASH</Text>
          </View>
          <Text style={[mono(14, { w: 600, c: C.t1 }), { paddingTop: 7 }]}>{rs.flash}</Text>
        </Press>
        <Press onPress={() => go('achievements')} style={s.mini}>
          <Text style={mono(8.5, { ls: 1, c: C.t4 })}>ACHIEVED</Text>
          <Text style={[mono(14, { w: 600, c: C.t1 }), { paddingTop: 7 }]}>{ach.done}/{ACH_TOTAL}</Text>
        </Press>
      </View>
    </View>
  );
}

/** Arcade: the HUSTLE or HOLD promo with two fanned listing cards. */
export function HohPromo() {
  const { go } = useHustlr();
  return (
    <Press
      onPress={() => go('hoh')}
      style={[s.hohPromo, bgImage(`radial-gradient(260px 220px at 86% 40%, ${A(18)}, transparent 72%), linear-gradient(140deg, ${C.s3} 0%, ${C.s1} 70%)`)]}>
      <View style={[s.fan, { right: 22, top: 34, transform: [{ rotate: '9deg' }], borderColor: L(14) }]}>
        <Image source={IMG.pokemon} contentFit="cover" style={StyleSheet.absoluteFill} />
      </View>
      <View style={[s.fan, { right: 50, top: 44, transform: [{ rotate: '-7deg' }], borderColor: L(18), boxShadow: '0 14px 30px rgba(0,0,0,0.55)' }]}>
        <Image source={IMG.jordan} contentFit="cover" style={StyleSheet.absoluteFill} />
      </View>
      <View style={s.promoStamp}>
        <Text style={bric(13, { c: C.a })}>HUSTLE</Text>
      </View>
      <View style={{ gap: 10, padding: 20, width: '56%' }}>
        <Chip label="NEW · SWIPE GAME" bg={A(16)} fg={C.aink} style={{ alignSelf: 'flex-start' }} />
        <Text style={bric(29, { lh: 30, ls: -0.9, c: C.t1 })}>HUSTLE or HOLD</Text>
        <Text style={hk(13, { lh: 19, c: C.t3 })}>Real listings. One call. Flip it or pass.</Text>
        <Text style={mono(10, { c: C.aink })}>+20 XP · +5 TICKETS / CALL</Text>
        <View style={[s.playNow, bgImage(GRAD)]}>
          <Text style={hk(14, { w: 700, c: C.ona })}>Play now</Text>
          <Svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke={C.ona} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M3 8h9" />
            <Path d="M8.5 4.5 12 8l-3.5 3.5" />
          </Svg>
        </View>
      </View>
    </Press>
  );
}

/** Arcade: what each currency does, then shortcuts and today's loop. */
export function ArcadeRewardsBlock() {
  const { st, go } = useHustlr();
  const { rs, dailyClaimed, set } = useRewards();
  const lv = useLevel();
  const ach = useAchievements();

  const earn: { label: ReactNode; title: string; body: string; value: string; tone: Tone; to: Screen; last?: boolean }[] = [
    { label: 'XP', title: 'XP levels you up', body: 'Each level unlocks utilities — Sniper Boost at Level 13.', value: lv.xpLabel, tone: 'a', to: 'achievements' },
    { label: 'TIX', title: 'Tickets spin & redeem', body: 'Spin the Prize Spinner or redeem upgrades like +50 km radius.', value: String(rs.tickets), tone: 'gold', to: 'redeem' },
    { label: <Bolt size={15} />, title: 'Flash tokens alert you first', body: 'Instant alerts when a high-demand deal matching your search drops.', value: `${rs.flash} LEFT`, tone: 'gold', to: 'flash' },
    { label: `#${lv.rank}`, title: 'Achievements rank you', body: 'Badges show on the leaderboard and your profile.', value: `${ach.done}/${ACH_TOTAL}`, tone: 'a', to: 'leaderboard', last: true },
  ];

  const links: { label: string; meta: string; icon: IconKey; tone: Tone; to: Screen }[] = [
    { label: 'Reward Spinner', meta: '50 TICKETS / SPIN', icon: 'spin', tone: 'gold', to: 'rspin' },
    { label: 'Redeem Rewards', meta: `${rs.tickets} TICKETS`, icon: 'gift', tone: 'a', to: 'redeem' },
    { label: 'Achievements', meta: `${ach.done} / ${ACH_TOTAL}`, icon: 'trophy', tone: 'gold', to: 'achievements' },
    { label: 'Leaderboard', meta: `#${lv.rank} REGIONAL`, icon: 'podium', tone: 'a', to: 'leaderboard' },
    { label: 'Upgrades', meta: '10 UTILITIES', icon: 'bolt', tone: 'a', to: 'upgrades' },
    { label: 'Customise', meta: `${rs.cosOwned.length} OWNED`, icon: 'palette', tone: 'gold', to: 'customise' },
  ];

  const loop: { label: string; done: boolean; meta: string; to: Screen | 'daily' | null }[] = [
    { label: 'Daily check-in', done: true, meta: `${st.streak}-DAY STREAK`, to: null },
    { label: 'Daily reward', done: dailyClaimed, meta: dailyClaimed ? 'CLAIMED' : 'READY', to: 'daily' },
    { label: 'Flash Alert Tokens', done: dailyClaimed, meta: `${rs.flash} AVAILABLE`, to: 'flash' },
    { label: 'Live Deals', done: !!rs.visited.stream, meta: 'LIVE', to: 'stream' },
    { label: 'HUSTLE or HOLD', done: rs.hohPlayed, meta: '+20 XP / CALL', to: 'hoh' },
    { label: 'Earn XP & tickets', done: rs.hohPlayed, meta: `${rs.tickets} TICKETS`, to: 'hoh' },
    { label: 'Prize Spinner', done: !!rs.rsResult, meta: '50 TICKETS / SPIN', to: 'rspin' },
    { label: 'Redeem useful upgrade', done: Object.keys(rs.redeemed).length > 0, meta: 'FROM 100', to: 'redeem' },
    { label: 'Return tomorrow', done: false, meta: 'STREAK RESETS 12AM', to: null },
  ];
  const firstTodo = loop.findIndex((l) => !l.done);

  // Three across, rows of equal height.
  const rows = [links.slice(0, 3), links.slice(3)];

  return (
    <>
      <View style={[s.card18, { padding: 16 }]}>
        <Text numberOfLines={1} style={kick}>WHAT YOU EARN · WHAT IT UNLOCKS</Text>
        <View style={{ paddingTop: 4 }}>
          {earn.map((e) => (
            <Press key={e.title} onPress={() => go(e.to)} style={[s.earnRow, e.last ? { paddingBottom: 0, borderBottomWidth: 0 } : null]}>
              <View style={[s.earnTile, { backgroundColor: tint(e.tone, 14) }]}>
                {typeof e.label === 'string' ? <Text style={mono(10, { w: 600, c: inkOf(e.tone) })}>{e.label}</Text> : e.label}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={hk(13.5, { w: 700, c: C.t1 })}>{e.title}</Text>
                <Text style={[hk(12, { lh: 16, c: C.t3 }), { paddingTop: 4 }]}>{e.body}</Text>
              </View>
              <Text style={mono(10, { c: inkOf(e.tone) })}>{e.value}</Text>
            </Press>
          ))}
        </View>
      </View>

      <Text style={[kick, { paddingTop: 4 }]}>MORE REWARDS</Text>
      <View style={{ gap: 10 }}>
        {rows.map((row, r) => (
          <View key={r} style={{ flexDirection: 'row', gap: 10, alignItems: 'stretch' }}>
            {row.map((k) => (
              <Press key={k.label} onPress={() => go(k.to)} style={s.linkTile} hover={{ borderColor: A(35) }}>
                <View style={[s.linkIcon, { backgroundColor: tint(k.tone, 14) }]}>
                  <Icon k={k.icon} c={inkOf(k.tone)} size={17} />
                </View>
                <Text style={hk(13, { w: 700, lh: 16, c: C.t1 })}>{k.label}</Text>
                <Text numberOfLines={1} style={mono(8.5, { ls: 0.6, c: C.t4 })}>{k.meta}</Text>
              </Press>
            ))}
          </View>
        ))}
      </View>

      <View style={[s.card18, { padding: 16 }]}>
        <View style={s.between}>
          <Text numberOfLines={1} style={kick}>{"TODAY'S LOOP"}</Text>
          <Text style={mono(10, { c: C.aink })}>{loop.filter((l) => l.done).length} / {loop.length}</Text>
        </View>
        <View style={{ paddingTop: 8 }}>
          {loop.map((l, i) => {
            const cur = i === firstTodo;
            const open = () => {
              if (l.to === 'daily') { if (!dailyClaimed) set({ modal: { kind: 'daily' } }); }
              else if (l.to) go(l.to);
            };
            return (
              <Press key={l.label} onPress={open} style={[s.rowC12, { paddingVertical: 8 }]}>
                <View style={[s.loopDot, {
                  backgroundColor: l.done ? A(16) : cur ? C.a : 'transparent',
                  borderColor: l.done ? A(40) : cur ? C.a : L(14),
                }]}>
                  <Text style={mono(10, { c: l.done ? C.aink : cur ? C.ona : C.t4 })}>{l.done ? '✓' : String(i + 1)}</Text>
                </View>
                <Text style={[hk(13.5, { w: 600, c: l.done ? C.t3 : C.t1 }), { flex: 1, minWidth: 0 }]}>{l.label}</Text>
                <Text style={mono(9.5, { c: C.t4 })}>{l.meta}</Text>
              </Press>
            );
          })}
        </View>
      </View>
    </>
  );
}

/** Profile: level, quick stats and recent badges. */
export function ProfileGamiCard() {
  const { st, go } = useHustlr();
  const { rs } = useRewards();
  const lv = useLevel();
  const ach = useAchievements();
  const stats = [
    stat('STREAK', `${st.streak}d`, '#FF8A4C'),
    stat('ACHIEVED', `${ach.done}/${ACH_TOTAL}`, C.goldink),
    stat('REGIONAL', `#${lv.rank}`),
    stat('TICKETS', String(rs.tickets), C.aink),
  ];
  const badges = LIVE
    ? ach.all.flat().filter((a) => a.done).slice(-3).map((a) => a.name.toUpperCase())
    : ['LOWBALL LEGEND', 'SCAM SNIPER', 'VOUCH KING'];
  return (
    <Press
      onPress={() => go('achievements')}
      style={[s.gami, bgImage(`linear-gradient(150deg, ${A(10)} 0%, ${C.s1} 65%)`)]}
      pressed={{ opacity: 0.94 }}>
      <View style={s.rowC12}>
        <LevelBadge level={lv.level} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={s.baseline}>
            <Text style={mono(10, { ls: 1.2, c: C.aink })}>LEVEL {lv.level}</Text>
            <Text style={mono(10.5, { c: C.t3 })}>{lv.xpLabel}</Text>
          </View>
          <Bar pct={lv.xpPct} grad style={{ marginTop: 9 }} />
        </View>
        <ChevronRight />
      </View>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {stats.map((g) => (
          <View key={g.label} style={s.gamiStat}>
            <Text numberOfLines={1} style={mono(13, { w: 600, c: g.fg })}>{g.value}</Text>
            <Text numberOfLines={1} style={[mono(8, { ls: 0.6, c: C.t4 }), { paddingTop: 5 }]}>{g.label}</Text>
          </View>
        ))}
      </View>
      {badges.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <Text style={mono(9, { ls: 1, c: C.t4 })}>RECENT</Text>
          {badges.map((b) => <Chip key={b} label={b} bg={G(12)} fg={C.goldink} size={9} />)}
        </View>
      )}
    </Press>
  );
}

/** Notifications: Flash token balance, and the nightly Missed Connections report. */
export function NoticeRewardCards() {
  const { go } = useHustlr();
  const { rs } = useRewards();
  const missedTotal = useMissedTotal();
  return (
    <>
      <Press onPress={() => go('flash')} style={[s.noticeFlash, bgImage(`linear-gradient(140deg, ${G(12)} 0%, ${C.s1} 70%)`)]}>
        <View style={[s.tile42, { backgroundColor: G(14) }]}><Bolt size={20} /></View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={hk(13.5, { w: 600, c: C.t1 })}>{rs.flash} Flash Alert Tokens</Text>
          <Text style={[hk(12.5, { c: C.t3 }), { paddingTop: 5 }]}>{"Instant alerts for the deals you can't miss"}</Text>
        </View>
        <View style={s.manage}><Text style={mono(10, { c: C.goldink })}>MANAGE</Text></View>
      </Press>
      <Press onPress={() => go('missed')} style={[s.noticeMissed]} hover={{ borderColor: A(35) }}>
        <View style={[s.tile42, { backgroundColor: G(12) }]}><Moon /></View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={[s.baseline, { gap: 8 }]}>
            <Text style={[hk(13.5, { w: 600, c: C.t1 }), { flexShrink: 1 }]}>Missed Connections is ready</Text>
            <Text style={mono(10, { c: C.t4 })}>7:30pm</Text>
          </View>
          <Text style={[hk(13, { lh: 18, c: C.t3 }), { paddingTop: 6 }]}>{missedTotal} in profit slipped past today. See what sold.</Text>
        </View>
      </Press>
    </>
  );
}

/** Home: entry cards for the Live Deal Stream and Missed Connections. */
export function HomeRewardCards() {
  const { st, go } = useHustlr();
  const { rs } = useRewards();
  const missedTotal = useMissedTotal();
  const liveLabel = LIVE ? `LIVE · ${st.deals.length} DEALS IN YOUR FEED` : `LIVE · ${14 + rs.streamNew} NEW THIS HOUR`;
  return (
    <View style={{ gap: 10, paddingTop: 24 }}>
      <Press onPress={() => go('stream')} style={[s.homeCard, { borderColor: A(26) }, bgImage(`linear-gradient(140deg, ${A(12)} 0%, ${C.s1} 70%)`)]}>
        <View style={[s.homeTile, { backgroundColor: A(14) }]}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.aink} strokeWidth={1.6} strokeLinecap="round">
            <Path d="M4 7h16M4 12h11M4 17h14" />
          </Svg>
          <View style={{ position: 'absolute', top: 7, right: 7 }}><LiveDot /></View>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={mono(9, { ls: 1, c: C.aink })}>{liveLabel}</Text>
          <Text style={[hk(15, { w: 700, c: C.t1 }), { paddingTop: 7 }]}>Live Deal Stream</Text>
          <Text style={[hk(12.5, { c: C.t3 }), { paddingTop: 5 }]}>Fresh listings the second they drop</Text>
        </View>
        <ChevronRight />
      </Press>
      <Press onPress={() => go('missed')} style={[s.homeCard, { borderColor: G(24) }, bgImage(`linear-gradient(140deg, ${G(12)} 0%, ${C.s1} 70%)`)]}>
        <View style={[s.homeTile, { backgroundColor: G(14) }]}><Moon /></View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={mono(9, { ls: 1, c: C.goldink })}>TONIGHT · 7:30 PM REPORT</Text>
          <Text style={[hk(15, { w: 700, c: C.t1 }), { paddingTop: 7 }]}>Missed Connections</Text>
          <Text style={[hk(12.5, { c: C.t3 }), { paddingTop: 5 }]}>{missedTotal} in profit slipped past today</Text>
        </View>
        <ChevronRight />
      </Press>
    </View>
  );
}

/** Deal detail: arm a Flash Alert for similar deals. */
export function DetailFlashCard({ deal }: { deal: Deal }) {
  const { rs, spendFlash } = useRewards();
  const dealId = deal.id;
  const on = rs.detailAlerts.includes(dealId);
  const arm = () => {
    if (on) return;
    spendFlash(
      (x) => ({ detailAlerts: [...x.detailAlerts, dealId] }),
      { kind: 'alert', kicker: 'FLASH ALERT SET · 1 TOKEN', title: 'Instant alerts on similar deals' },
      { label: deal.name, category: deal.category, source: 'deal', ref: String(deal.id), imageKey: deal.imageKey },
    );
  };
  return (
    <View style={[s.detailFlash, bgImage(`linear-gradient(140deg, ${G(12)} 0%, ${C.s1} 70%)`)]}>
      <View style={[s.tile40, { backgroundColor: G(14) }]}><Bolt size={18} /></View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={hk(13.5, { w: 700, c: C.t1 })}>Flash Alerts · {rs.flash} tokens available</Text>
        <Text style={[hk(12, { lh: 17, c: C.t3 }), { paddingTop: 5 }]}>Get an instant alert when a similar high-demand deal appears.</Text>
      </View>
      <Press onPress={arm} style={[s.detailAlertBtn, { backgroundColor: on ? G(14) : 'transparent' }]}>
        <Text style={mono(10, { w: 600, c: C.goldink })}>{on ? 'ON ✓' : 'SET ALERT'}</Text>
      </Press>
    </View>
  );
}

// ──────────────────────────────────────────────────────── HUSTLE or HOLD

const DEMAND_BG: Record<Tone, string> = { neg: 'rgba(255,92,92,0.9)', gold: 'rgba(233,196,106,0.92)', a: 'rgba(32,197,101,0.92)' };

function Stamp({ label, color, side, anim }: {
  label: string; color: string; side: 'left' | 'right'; anim: ReturnType<typeof useAnimatedStyle>;
}) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[s.stamp, { borderColor: color, [side]: 18, transform: [{ rotate: side === 'left' ? '-14deg' : '14deg' }] }, anim]}>
      <Text style={bric(28, { ls: 1, c: color })}>{label}</Text>
    </Animated.View>
  );
}

function Flame() {
  return (
    <Svg width={12} height={12} viewBox="0 0 16 16" fill="none" stroke={C.goldink} strokeWidth={1.4} strokeLinejoin="round">
      <Path d="M8 1.5s3.4 2.8 3.4 6.1A3.4 3.4 0 0 1 8 11a3.4 3.4 0 0 1-3.4-3.4C4.6 4.3 8 1.5 8 1.5Z" />
      <Path d="M8 14.5a3 3 0 0 0 3-3c0-1.6-3-3.4-3-3.4S5 9.9 5 11.5a3 3 0 0 0 3 3Z" fill={C.goldink} stroke="none" />
    </Svg>
  );
}

function Pin() {
  return (
    <Svg width={11} height={11} viewBox="0 0 16 16" fill="none" stroke={C.t4} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8 14.5s4.6-4.3 4.6-8a4.6 4.6 0 0 0-9.2 0c0 3.7 4.6 8 4.6 8Z" />
      <Path d="M8 4.9a1.6 1.6 0 1 1 0 3.2a1.6 1.6 0 1 1 0-3.2Z" />
    </Svg>
  );
}

/** The 2.6 s bar under a result; it runs out as the next card comes in. */
function TimerBar({ k }: { k: number }) {
  const w = useSharedValue(0);
  useEffect(() => { w.value = 0; w.value = withTiming(1, { duration: 2600, easing: Easing.linear }); }, [w, k]);
  const anim = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return <Animated.View style={[{ position: 'absolute', left: 0, bottom: 0, height: 3, backgroundColor: C.a }, anim]} />;
}

export function Hoh() {
  const { go } = useHustlr();
  const { rs, answerHoh, nextHoh, hohAd, startHoh } = useRewards();
  const h = rs.hoh;
  const cards = rs.hohCards;
  const item = cards[h.i % cards.length];
  const nextItem = cards[(h.i + 1) % cards.length];
  const ask = h.phase === 'ask';

  const x = useSharedValue(0);
  const dragging = useSharedValue(0);
  const asking = useSharedValue(ask ? 1 : 0);
  const pick = useSharedValue(0);
  useEffect(() => {
    asking.value = ask ? 1 : 0;
    pick.value = h.choice === 'hustle' ? 1 : h.choice === 'hold' ? -1 : 0;
  }, [ask, h.choice, asking, pick]);

  // Fly out on advance, then snap the new card into place.
  useEffect(() => {
    if (rs.hohFly) x.value = withTiming(480 * rs.hohFly, { duration: 260, easing: Easing.ease });
    else x.value = 0;
  }, [rs.hohFly, x]);

  const askRef = useRef(ask);
  askRef.current = ask && !h.loading;
  const responder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => askRef.current,
    onMoveShouldSetPanResponder: (_e, g) => askRef.current && Math.abs(g.dx) > 4,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: () => { dragging.value = 1; },
    onPanResponderMove: (_e, g) => { x.value = g.dx; },
    onPanResponderRelease: (_e, g) => {
      dragging.value = 0;
      x.value = withTiming(0, { duration: 260, easing: Easing.ease });
      if (g.dx > 90) answerHoh('hustle');
      else if (g.dx < -90) answerHoh('hold');
    },
    onPanResponderTerminate: () => { dragging.value = 0; x.value = withTiming(0, { duration: 260 }); },
  })).current;

  const cardAnim = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { rotate: `${x.value / 24}deg` }],
  }));
  const hustleAnim = useAnimatedStyle(() => ({
    opacity: asking.value ? interpolate(x.value, [0, 110], [0, 1], 'clamp') : pick.value === 1 ? 1 : 0,
  }));
  const holdAnim = useAnimatedStyle(() => ({
    opacity: asking.value ? interpolate(x.value, [-110, 0], [1, 0], 'clamp') : pick.value === -1 ? 1 : 0,
  }));

  if (h.loading) {
    return (
      <View style={[pad, { paddingTop: 12, gap: 12 }]}>
        <Text numberOfLines={1} style={kick}>SHUFFLING LIVE LISTINGS…</Text>
        <Skel h={6} radius={3} />
        <Skel h={430} radius={22} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Skel h={58} style={{ flex: 1 }} />
          <Skel h={58} style={{ flex: 1 }} />
        </View>
      </View>
    );
  }

  if (h.done) {
    const accWord = h.correct >= 5 ? 'sharp eye' : h.correct >= 3 ? 'solid session' : 'keep practising';
    const adLabel = h.adUsed ? 'Bonus claimed ✓' : h.tickets > 0 ? `Watch a 15 s ad · double to +${h.tickets * 2} tickets` : 'Watch a 15 s ad · +10 tickets';
    return (
      <View style={[pad, { gap: 14 }]}>
        <View style={[s.doneHero, bgImage(`radial-gradient(320px 220px at 50% 0%, ${A(20)}, transparent 72%)`)]}>
          <Image source={ART.arcadeHeader} contentFit="contain" style={{ width: 132, height: 104 }} />
          <Text style={[mono(10, { ls: 1.2, c: C.aink }), { paddingTop: 6 }]}>SESSION COMPLETE</Text>
          <Text style={[bric(46, { lh: 1, ls: -1.4, c: C.t1 }), { paddingTop: 10 }]}>{h.correct} / {cards.length}</Text>
          <Text style={[hk(13, { c: C.t3 }), { paddingTop: 8 }]}>{Math.round((h.correct / cards.length) * 100)}% accuracy · {accWord}</Text>
          <View style={{ flexDirection: 'row', gap: 8, alignSelf: 'stretch', paddingTop: 18 }}>
            <StatBox label="XP" value={`+${h.xp}`} fg={C.aink} pad="11 8" size={15} gap={7} />
            <StatBox label="TICKETS" value={`+${h.tickets}`} pad="11 8" size={15} gap={7} />
            <StatBox label="BEST COMBO" value={`${h.bestCombo}×`} fg={C.goldink} pad="11 8" size={15} gap={7} />
          </View>
        </View>
        <AdRow label={adLabel} onPress={hohAd} />
        <GradButton label="Play again" onPress={startHoh} />
        <GhostButton label="Spend tickets · Reward Spinner" onPress={() => go('rspin')} />
      </View>
    );
  }

  const fbOk = h.lastOk;
  const fbTitle = fbOk ? (h.choice === 'hustle' ? 'Good Hustle' : 'Smart Hold') : (h.choice === 'hustle' ? "Should've held" : 'Missed flip');
  const rewards: SheetReward[] = [{ label: `+${h.lastXp} XP`, bg: A(14), fg: C.aink }];
  if (h.lastTickets) rewards.push({ label: `+${h.lastTickets - h.lastBonus} TICKETS`, bg: G(14), fg: C.goldink });
  if (h.lastBonus) rewards.push({ label: `+${h.lastBonus} COMBO BONUS`, bg: G(20), fg: C.goldink });
  const border = h.phase === 'result' ? (fbOk ? A(60) : N(60)) : L(10);

  return (
    <View style={[pad, { paddingTop: 12, gap: 12 }]}>
      <View style={s.between}>
        <Text style={mono(10, { ls: 1.2, c: C.t3 })}>ROUND {Math.min(h.i + 1, cards.length)} / {cards.length}</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Chip label={`+${h.xp} XP`} bg={A(12)} fg={C.aink} />
          <Chip label={`${h.combo}× COMBO`} bg={G(12)} fg={C.goldink} icon={<Flame />} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {cards.map((_, i) => (
          <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < h.results.length ? (h.results[i] ? C.a : C.neg) : i === h.i ? A(40) : L(10) }} />
        ))}
      </View>
      <View style={{ height: 438 }}>
        <View style={[s.hohBack]}>
          <Photo src={nextItem.img} style={{ height: 232 }} />
        </View>
        <Animated.View {...responder.panHandlers} style={[s.hohCard, { borderColor: border }, cardAnim]}>
          <View style={{ height: 232 }}>
            <Photo src={item.img} style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, bgImage('linear-gradient(180deg, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.6) 100%)')]} />
            <Chip label={item.platform} bg="rgba(6,8,7,0.72)" fg={C.white} style={{ position: 'absolute', top: 12, left: 12 }} />
            <Chip label={item.listed} bg="rgba(6,8,7,0.72)" fg={C.white} style={{ position: 'absolute', top: 12, right: 12 }} />
            <View style={[s.demand, { backgroundColor: DEMAND_BG[item.tone] }]}>
              <Text style={mono(9.5, { w: 600, ls: 0.6, c: '#0B0D0B' })}>{item.demand}</Text>
            </View>
            <Stamp label="HUSTLE" color={C.a} side="left" anim={hustleAnim} />
            <Stamp label="HOLD" color={C.neg} side="right" anim={holdAnim} />
          </View>
          <View style={{ gap: 14, padding: 16 }}>
            <View>
              <Text style={hk(18, { w: 700, lh: 23, ls: -0.3, c: C.t1 })}>{item.name}</Text>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', paddingTop: 8 }}>
                <Pin />
                <Text style={mono(10, { c: C.t4 })}>{item.loc} · {item.cond}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <StatBox label="ASKING" value={money(item.price)} />
              <StatBox label="EST. RESALE" value={money(item.resale)} />
              <StatBox label="POTENTIAL" value={'+' + money(item.resale - item.price)} fg={C.aink} accent />
            </View>
          </View>
        </Animated.View>
      </View>

      {ask ? (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Press onPress={() => answerHoh('hold')} style={s.holdBtn} pressed={{ transform: [{ scale: 0.97 }] }}>
              <Text style={bric(18, { ls: 0.6, c: C.neg })}>← HOLD</Text>
            </Press>
            <Press onPress={() => answerHoh('hustle')} style={[s.hustleBtn, bgImage(GRAD)]} pressed={{ transform: [{ scale: 0.97 }] }}>
              <Text style={bric(18, { ls: 0.6, c: C.ona })}>HUSTLE →</Text>
            </Press>
          </View>
          <Text style={[mono(9.5, { ls: 1, c: C.t5 }), { textAlign: 'center' }]}>SWIPE RIGHT TO HUSTLE · LEFT TO HOLD</Text>
        </View>
      ) : (
        <Press onPress={nextHoh} style={[s.fb, { borderColor: fbOk ? A(45) : N(45) }]} pressed={{ opacity: 0.94 }}>
          <View style={[s.between, { gap: 8 }]}>
            <Text style={mono(10, { w: 600, ls: 1.2, c: fbOk ? C.aink : C.neg })}>{fbOk ? '✓ CORRECT CALL' : '✗ WRONG CALL'}</Text>
            <Text style={mono(10, { c: C.t4 })}>ANSWER · {item.answer.toUpperCase()}</Text>
          </View>
          <Text style={[bric(26, { lh: 1, ls: -0.6, c: C.t1 }), { paddingTop: 10 }]}>{fbTitle}</Text>
          <View style={[s.baseline, { paddingTop: 12 }]}>
            <Text style={hk(13, { c: C.t3 })}>Estimated profit</Text>
            <Text style={mono(16, { w: 600, c: item.net.startsWith('+') ? C.aink : C.neg })}>{item.net}</Text>
          </View>
          <Text style={[hk(13, { lh: 19, c: C.t3 }), { paddingTop: 8 }]}>{item.reason}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingTop: 12 }}>
            {rewards.map((r) => (
              <View key={r.label} style={{ paddingVertical: 5, paddingHorizontal: 9, borderRadius: 8, backgroundColor: r.bg }}>
                <Text style={mono(10.5, { w: 600, c: r.fg })}>{r.label}</Text>
              </View>
            ))}
          </View>
          <Text style={[hk(13, { w: 700, c: C.aink }), { textAlign: 'right', paddingTop: 12 }]}>Next listing →</Text>
          <TimerBar k={h.i} />
        </Press>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────── Reward Spinner

const SPIN_EASE = Easing.bezier(0.12, 0.72, 0.06, 1);
const RSW_LABELS = RSW;
const WHEEL = 292;
const LABEL_R = 98;

function RswLabel({ angle, index }: { angle: SharedValue<number>; index: number }) {
  const w = RSW_LABELS[index];
  const base = index * 45 + 22.5;
  const style = useAnimatedStyle(() => {
    const phi = ((angle.value + base) * Math.PI) / 180;
    return { left: WHEEL / 2 + LABEL_R * Math.sin(phi) - 50, top: WHEEL / 2 - LABEL_R * Math.cos(phi) - 15 };
  });
  const gold = w.label === 'SNIPER';
  return (
    <Animated.View pointerEvents="none" style={[s.labelBox, style]}>
      <View style={[s.wheelLabel, gold && { backgroundColor: C.gold }]}>
        <Text style={mono(10.5, { w: 600, lh: 1, c: gold ? 'rgb(56,38,4)' : C.white })}>{w.label}</Text>
      </View>
    </Animated.View>
  );
}

export function Rspin() {
  const { rs, rsSpin, wedges } = useRewards();
  const angle = useSharedValue(rs.rsAngle);
  useEffect(() => { angle.value = withTiming(rs.rsAngle, { duration: 3400, easing: SPIN_EASE }); }, [rs.rsAngle, angle]);
  const rot = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}deg` }] }));
  const poor = rs.tickets < 50 && !rs.rsSpinning;
  const title = rs.rsSpinning ? '…' : rs.rsResult ? rs.rsResult.label : 'Spend tickets, win utility';
  const body = rs.rsResult ? rs.rsResult.name : 'Functional boosts and cosmetics. 50 tickets a spin.';
  const cta = rs.rsSpinning ? 'Spinning…' : rs.tickets < 50 ? `Need ${50 - rs.tickets} more tickets` : 'Spin · 50 tickets';
  return (
    <View style={[pad, { paddingTop: 18, gap: 16, alignItems: 'center' }]}>
      <View style={[s.between, { alignSelf: 'stretch' }]}>
        <Text style={mono(10, { ls: 1, c: C.t4 })}>50 TICKETS PER SPIN</Text>
        <Text style={mono(10, { c: C.aink })}>{rs.tickets} TICKETS</Text>
      </View>
      <View style={{ width: WHEEL, height: WHEEL }}>
        <Animated.View style={[StyleSheet.absoluteFill, rot]}>
          <Image source={ART.wheel} contentFit="contain" style={StyleSheet.absoluteFill} accessibilityLabel="Reward wheel" />
        </Animated.View>
        {wedges.map((_, i) => <RswLabel key={i} angle={angle} index={i} />)}
        <View style={s.pointer} />
      </View>
      <View style={{ minHeight: 50, alignItems: 'center' }}>
        <Text style={[bric(22, { lh: 1, c: C.t1 }), { textAlign: 'center' }]}>{title}</Text>
        <Text style={[hk(13, { c: C.t3 }), { paddingTop: 8, textAlign: 'center' }]}>{body}</Text>
      </View>
      <Press onPress={rsSpin} style={[s.grad, { alignSelf: 'stretch', height: 52 }, poor ? { backgroundColor: L(8) } : bgImage(GRAD)]}>
        <Text style={hk(15, { w: 700, c: poor ? C.t4 : C.ona })}>{cta}</Text>
      </Press>
      <View style={[s.card18, { alignSelf: 'stretch', padding: 16 }]}>
        <Text numberOfLines={1} style={kick}>ON THE WHEEL</Text>
        {wedges.map((w) => {
          const cos = w.kind === 'COSMETIC';
          return (
            <View key={w.label} style={[s.rowC10, s.hair, { paddingVertical: 11 }]}>
              <Text style={[hk(13, { c: C.t2 }), { flex: 1, minWidth: 0 }]}>{w.name}</Text>
              <View style={{ paddingVertical: 3, paddingHorizontal: 7, borderRadius: 6, backgroundColor: cos ? G(14) : A(14) }}>
                <Text style={mono(8.5, { ls: 0.6, c: cos ? C.goldink : C.aink })}>{w.kind}</Text>
              </View>
              <Text style={[mono(11, { c: C.t4 }), { width: 38, textAlign: 'right' }]}>{w.weight}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────── Redeem Rewards

const activeLeft = (dur: string, done: string | true) =>
  typeof done === 'string' ? done : dur.replace('S', '').replace(' HOUR', 'H').replace(' DAY', 'D');

export function Redeem() {
  const { go } = useHustlr();
  const { rs, redeemDefs, redeem, watchAd } = useRewards();
  const adLabel = rs.adsLeft > 0 ? `Watch a 15 s ad · +10 tickets (${rs.adsLeft} left today)` : 'Daily ad rewards used · back tomorrow';
  return (
    <View style={[pad, { gap: 14 }]}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={[s.balance, { borderColor: A(20) }, bgImage(`linear-gradient(150deg, ${A(16)} 0%, ${C.s1} 70%)`)]}>
          <Text numberOfLines={1} style={kick}>TICKETS</Text>
          <Text style={[bric(34, { lh: 1, ls: -1, c: C.t1 }), { paddingTop: 10 }]}>{rs.tickets}</Text>
        </View>
        <Press onPress={() => go('flash')} style={[s.balance, { backgroundColor: C.s1, borderColor: L(8) }]}>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Bolt />
            <Text numberOfLines={1} style={kick}>FLASH TOKENS</Text>
          </View>
          <Text style={[bric(34, { lh: 1, ls: -1, c: C.t1 }), { paddingTop: 10 }]}>{rs.flash}</Text>
        </Press>
      </View>
      <AdRow label={adLabel} onPress={() => watchAd('tickets')} />
      <Text numberOfLines={1} style={kick}>UTILITY REWARDS</Text>
      {redeemDefs.map((r) => {
        const locked = !!r.minLevel && rs.level < r.minLevel;
        const done = !r.repeat ? rs.redeemed[r.key] : undefined;
        const poor = rs.tickets < r.cost;
        const tone: Tone = r.flash ? 'gold' : 'a';
        let status = `BALANCE ${rs.tickets}`, statusFg: string = C.t4, cta = 'Redeem', ctaFg: string = C.ona, ctaBd = 'transparent', bd = L(8);
        let ctaBg: string | null = GRAD;
        if (locked) {
          status = `LEVEL ${r.minLevel} · ${rs.xpMax - rs.xp} XP TO GO`; cta = `Reach Level ${r.minLevel} · play HUSTLE or HOLD`;
          ctaBg = null; ctaFg = C.t2; ctaBd = L(12);
        } else if (done) {
          status = `ACTIVE · ${activeLeft(r.dur, done)} LEFT`; statusFg = C.aink; cta = 'Redeemed ✓';
          ctaBg = A(10); ctaFg = C.aink; ctaBd = A(30); bd = A(30);
        } else if (poor) {
          status = `NEED ${r.cost - rs.tickets} MORE`; statusFg = C.neg; cta = 'Not enough tickets';
          ctaBg = null; ctaFg = C.t5; ctaBd = L(10);
        }
        const onPress = () => {
          if (locked) { go('hoh'); return; }
          if (done) return;
          redeem(r);
        };
        return (
          <View key={r.key} style={[s.card18, { padding: 16, gap: 12, borderColor: bd }]}>
            <View style={{ flexDirection: 'row', gap: 13, alignItems: 'flex-start' }}>
              <IconTile k={locked ? 'lock' : r.icon} tone={locked ? 'lock' : tone} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={hk(15, { w: 700, ls: -0.2, c: C.t1 })}>{r.name}</Text>
                <Text style={[hk(12.5, { lh: 18, c: C.t3 }), { paddingTop: 6 }]}>{r.desc}</Text>
              </View>
            </View>
            <View style={s.rowC8}>
              <Chip label={r.dur} bg={L(6)} fg={C.t2} />
              <Chip label={`${r.cost} TICKETS`} bg={G(12)} fg={C.goldink} />
              <Text numberOfLines={1} style={[mono(10, { c: statusFg }), { flex: 1, minWidth: 0, textAlign: 'right' }]}>{status}</Text>
            </View>
            <Press
              onPress={onPress}
              style={[s.cta44, { borderColor: ctaBd }, ctaBg === GRAD ? bgImage(GRAD) : { backgroundColor: ctaBg ?? 'transparent' }]}>
              <Text style={hk(14, { w: 700, c: ctaFg })}>{cta}</Text>
            </Press>
          </View>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────── Flash Alert Tokens

export function Flash() {
  const { go } = useHustlr();
  const { rs, set, dailyClaimed, pool, redeemDefs, redeem, watchAd, missed } = useRewards();
  const ach = useAchievements();
  const pack = redeemDefs.find((r) => r.key === 'flash3');
  const redeem3 = () => { if (pack) redeem(pack, { silent: true }); };
  const earn = [
    { label: 'Daily login', meta: '+1 token every day you check in', status: dailyClaimed ? 'CLAIMED ✓' : 'CLAIM', fg: dailyClaimed ? C.aink : C.goldink, go: () => { if (!dailyClaimed) set({ modal: { kind: 'daily' } }); } },
    { label: 'Arcade rewards', meta: '1 token for 100 · 3 for 250 tickets', status: 'REDEEM', fg: C.goldink, go: () => go('redeem') },
    { label: 'Achievements', meta: '+2 tokens on selected unlocks', status: `${ach.done}/${ACH_TOTAL}`, fg: C.t4, go: () => go('achievements') },
    { label: 'Reward Spinner', meta: '+2 FLASH wedge · 20% odds', status: 'SPIN', fg: C.goldink, go: () => go('rspin') },
    { label: 'Mogul plan', meta: '+10 tokens every month', status: 'UPGRADE', fg: C.t4, go: () => go('plans') },
  ];
  const { st } = useHustlr();
  const alerts: { name: string; img: Img }[] = LIVE ? rs.armed.map((a) => ({ name: a.label, img: a.img })) : [
    ...rs.streamAlerts.map((id) => {
      const it = rs.streamItems.find((y) => y.id === id);
      const p = pool[it ? it.p % pool.length : 0];
      return { name: p.name, img: p.img };
    }),
    ...rs.missedAlerts.map((i) => ({ name: `${missed[i].name} · similar`, img: missed[i].img })),
    ...rs.detailAlerts.map((id) => {
      const d = st.deals.find((x) => x.id === id);
      return { name: `${d?.name ?? 'Deal'} · similar`, img: d?.img ?? null };
    }),
  ];
  return (
    <View style={[pad, { gap: 14 }]}>
      <View style={[s.flashHero, bgImage(`radial-gradient(300px 220px at 85% 10%, ${G(22)}, transparent 70%)`)]}>
        <View style={s.rowC14}>
          <View style={[s.flashTile, bgImage(`linear-gradient(140deg, ${G(30)} 0%, ${G(8)} 100%)`)]}><Bolt size={28} /></View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={kick}>FLASH ALERT TOKENS</Text>
            <Text style={[bric(40, { lh: 1, ls: -1.2, c: C.t1 }), { paddingTop: 8 }]}>{rs.flash}</Text>
          </View>
        </View>
        <Text style={[hk(13.5, { lh: 20, c: C.t3 }), { paddingTop: 14 }]}>
          One token fires an instant, high-priority alert the second a matching listing goes live — ahead of standard notifications.
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, paddingTop: 16 }}>
          <Press onPress={redeem3} style={[s.cta44, { flex: 1, borderColor: 'transparent' }, bgImage(GRAD)]}>
            <Text style={hk(13, { w: 700, c: C.ona })}>+3 for {pack?.cost ?? 250} tickets</Text>
          </Press>
          <Press onPress={() => watchAd('flash')} style={[s.cta44, { flex: 1, borderColor: L(18), borderStyle: 'dashed' }]}>
            <Text style={hk(13, { w: 600, c: C.t2 })}>{rs.flashAdLeft > 0 ? 'Watch ad · +1 token' : 'Ad used today'}</Text>
          </Press>
        </View>
      </View>
      <View style={[s.card18, { padding: 16 }]}>
        <Text numberOfLines={1} style={kick}>HOW TO EARN</Text>
        {earn.map((e) => (
          <Press key={e.label} onPress={e.go} style={[s.rowC12, s.hair, { paddingVertical: 12 }]}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={hk(13.5, { w: 600, c: C.t1 })}>{e.label}</Text>
              <Text style={[hk(12, { c: C.t3 }), { paddingTop: 4 }]}>{e.meta}</Text>
            </View>
            <Text style={mono(10, { c: e.fg })}>{e.status}</Text>
          </Press>
        ))}
      </View>
      <View style={[s.card18, { padding: 16 }]}>
        <Text numberOfLines={1} style={kick}>HOW TOKENS ARE SPENT</Text>
        <View style={[s.between, s.hair, { gap: 12, paddingVertical: 12 }]}>
          <Text style={hk(13.5, { c: C.t2 })}>Instant alert on one listing</Text>
          <Text style={mono(11, { c: C.goldink })}>1 TOKEN</Text>
        </View>
        <View style={[s.between, { gap: 12, paddingVertical: 12 }]}>
          <Text style={[hk(13.5, { c: C.t2 }), { flexShrink: 1 }]}>Priority alerts on a saved search · 24 h</Text>
          <Text style={mono(11, { c: C.goldink })}>2 TOKENS</Text>
        </View>
      </View>
      <View style={[s.card18, { padding: 16 }]}>
        <Text numberOfLines={1} style={kick}>ARMED ALERTS</Text>
        {alerts.length > 0 ? alerts.map((a, i) => (
          <View key={a.name + i} style={[s.rowC12, s.hair, { paddingVertical: 12 }]}>
            <Photo src={a.img} style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: L(6) }} />
            <Text numberOfLines={1} style={[hk(13, { w: 600, c: C.t1 }), { flex: 1, minWidth: 0 }]}>{a.name}</Text>
            <Chip label="ARMED" bg={G(12)} fg={C.goldink} icon={<Bolt size={10} />} />
          </View>
        )) : (
          <>
            <Text style={[hk(13, { lh: 19, c: C.t3 }), { paddingTop: 12 }]}>
              No alerts armed yet. Tap <Text style={hk(13, { w: 600, c: C.goldink })}>Alert</Text> on any listing in the Live Deal Stream.
            </Text>
            <GhostButton label="Open Live Deal Stream" height={44} onPress={() => go('stream')} style={{ marginTop: 12 }} />
          </>
        )}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────── Missed Connections

export function Missed() {
  const { st, go } = useHustlr();
  const { rs, spendFlash, goDeal, missed } = useRewards();
  const missedTotal = useMissedTotal();
  // Still live: the best open deal in the category of the top miss.
  const top = missed[0];
  const live = LIVE
    ? (st.deals.find((d) => top && d.category === (top.category ?? '')) ?? st.deals[0] ?? null)
    : null;
  if (LIVE && missed.length === 0) {
    return (
      <View style={[pad, { gap: 14, alignItems: 'center', paddingTop: 70, paddingHorizontal: 28 }]}>
        <View style={s.emptyIcon}><Moon size={24} c={C.t4} /></View>
        <Text style={bric(24, { ls: -0.5, c: C.t1 })}>Clean sweep</Text>
        <Text style={[hk(14, { lh: 21, c: C.t3 }), { textAlign: 'center', maxWidth: 290 }]}>{"You didn't miss a single matching deal today. Nice work."}</Text>
        <GhostButton label="Open Live Deal Stream" onPress={() => go('stream')} style={{ alignSelf: 'stretch', marginTop: 6 }} />
      </View>
    );
  }
  return (
    <View style={[pad, { gap: 14 }]}>
      <View style={[s.missedHero, bgImage(`radial-gradient(300px 220px at 90% 0%, ${G(18)}, transparent 70%), linear-gradient(160deg, ${C.s3} 0%, ${C.s1} 70%)`)]}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Moon size={15} />
          <Text style={mono(10, { ls: 1.2, c: C.goldink })}>TONIGHT · 7:30 PM</Text>
        </View>
        <Text style={[hk(14, { c: C.t3 }), { paddingTop: 12 }]}>You missed these tonight</Text>
        <Text style={[bric(44, { lh: 1, ls: -1.4, c: C.t1 }), { paddingTop: 6 }]}>{missedTotal}</Text>
        <Text style={[hk(13, { lh: 19, c: C.t3 }), { paddingTop: 10 }]}>{missed.length} listing{missed.length === 1 ? '' : 's'} matched what you flip and sold before you acted.</Text>
      </View>
      {missed.map((m, i) => {
        const armed = rs.missedAlerts.includes(i);
        const alert = () => {
          if (armed) return;
          spendFlash(
            (x) => ({ missedAlerts: [...x.missedAlerts, i] }),
            { kind: 'alert', kicker: 'FLASH ALERT SET · 1 TOKEN', title: `We'll ping you when the next ${m.name.split(' · ')[0]} drops` },
            { label: m.name, category: m.category ?? null, source: 'missed', ref: m.ref ?? String(i) },
          );
        };
        return (
          <View key={m.name} style={[s.card18, { padding: 14, gap: 12 }]}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={s.soldThumb}>
                <Photo src={m.img} style={StyleSheet.absoluteFill} />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(6,8,7,0.35)' }]} />
                <View style={s.soldTag}><Text style={mono(8.5, { c: C.white })}>SOLD</Text></View>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <Text numberOfLines={1} style={[hk(14, { w: 700, lh: 18, c: C.t1 }), { flex: 1, minWidth: 0 }]}>{m.name}</Text>
                  <Text style={mono(9.5, { lh: 18, c: C.goldink })}>{m.ago}</Text>
                </View>
                <Text numberOfLines={1} style={[mono(11, { c: C.t3 }), { paddingTop: 7 }]}>Listed {money(m.price)} · resale {money(m.resale)}</Text>
                <Text style={[bric(22, { lh: 1, c: C.aink }), { paddingTop: 8 }]}>+{money(m.profit)}</Text>
              </View>
            </View>
            <View style={s.why}>
              <Text style={[mono(9, { ls: 0.8, c: C.t4 }), { paddingTop: 2 }]}>WHY</Text>
              <Text style={[hk(12.5, { lh: 17, c: C.t2 }), { flex: 1 }]}>{m.reason}</Text>
            </View>
            <Press onPress={() => go(m.fix)}>
              <Text numberOfLines={1} style={mono(10, { c: C.goldink })}>FIX · {m.fixLabel} →</Text>
            </Press>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Press onPress={() => go('stream')} style={s.btn40}><Text style={hk(12, { w: 600, c: C.t2 })}>View similar</Text></Press>
              <Press onPress={() => go('deals')} style={s.btn40}><Text style={hk(12, { w: 600, c: C.t2 })}>Search again</Text></Press>
              <Press onPress={alert} style={[s.btn40, { borderColor: G(armed ? 40 : 28), backgroundColor: armed ? G(12) : G(6) }]}>
                <Text style={hk(12, { w: 600, c: C.goldink })}>{armed ? 'Alert on ✓' : 'Set alert'}</Text>
              </Press>
            </View>
          </View>
        );
      })}
      {(!LIVE || live) && (
      <Press onPress={() => goDeal(live ? st.deals.indexOf(live) : 0)} style={[s.stillLive, bgImage(`linear-gradient(140deg, ${A(14)} 0%, ${C.s1} 70%)`)]}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <LiveDot />
          <Text style={mono(10, { ls: 1.2, c: C.aink })}>STILL LIVE · SIMILAR TO WHAT YOU MISSED</Text>
        </View>
        <View style={s.rowC12}>
          <Photo src={live ? live.img : IMG.jordan} style={{ width: 60, height: 60, borderRadius: 12 }} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={hk(14.5, { w: 700, c: C.t1 })}>{live ? live.name : 'Air Jordan 4 Retro'}</Text>
            <Text numberOfLines={1} style={[mono(10.5, { c: C.t3 }), { paddingTop: 6 }]}>
              {live ? `${money(live.buy)} · ${live.marketplace.toUpperCase()} · ${live.source}` : '$200 · FB MARKETPLACE · 2.1 KM'}
            </Text>
          </View>
          <Text style={bric(20, { c: C.aink })}>{live ? signed(Math.round(estProfit(live))) : '+$210'}</Text>
        </View>
        <View style={[s.grad, { height: 46 }, bgImage(GRAD)]}>
          <Text style={hk(15, { w: 700, c: C.ona })}>{"Grab it before it's gone"}</Text>
        </View>
      </Press>
      )}
    </View>
  );
}

// ───────────────────────────────────────────────────── Live Deal Stream

/** One row's action button in the stream. */
function StreamBtn({ label, onPress, on, tone, solid }: { label: string; onPress: () => void; on?: boolean; tone?: 'a' | 'gold'; solid?: boolean }) {
  const t = tone ?? 'a';
  const style: ViewStyle = solid
    ? { backgroundColor: C.a, borderColor: C.a }
    : on ? { backgroundColor: t === 'gold' ? G(12) : A(12), borderColor: t === 'gold' ? G(36) : A(34) } : { borderColor: L(12) };
  const fg = solid ? C.ona : on ? (t === 'gold' ? C.goldink : C.aink) : C.t2;
  return (
    <Press onPress={onPress} style={[s.streamBtn, style]}>
      <Text numberOfLines={1} style={mono(9, { w: 600, ls: 0.3, c: fg })}>{label}</Text>
    </Press>
  );
}

/** Fades a fresh row down into place. */
function RowIn({ fresh, children }: { fresh: boolean; children: ReactNode }) {
  const p = useSharedValue(fresh ? 0 : 1);
  useEffect(() => { if (fresh) p.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.ease) }); }, [fresh, p]);
  const anim = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: (1 - p.value) * -8 }] }));
  return <Animated.View style={anim}>{children}</Animated.View>;
}

export function Stream() {
  const { st } = useHustlr();
  const { rs, set, showToast, spendFlash, streamMore, streamHold, goDeal, pool } = useRewards();

  const rows: ReactNode[] = [];
  rs.streamItems.forEach((x, i) => {
    const p = pool[x.p % pool.length];
    const net = netOf(p.price, p.resale, 12.9, 15, 0);
    const r = net / p.price;
    const deal = LIVE ? st.deals[p.deal] : undefined;
    const held = deal ? st.watchIds.includes(deal.id) : rs.streamHeld.includes(x.id);
    const alerted = rs.streamAlerts.includes(x.id);
    const calcOpen = rs.streamCalc === x.id;
    const hustled = rs.streamHustled.includes(x.id);
    const ind = r >= 0.6 ? ['HOT DEAL', A(16), C.aink] : r >= 0.3 ? ['GOOD', G(14), C.goldink] : ['THIN', L(8), C.t3];
    const hold = () => streamHold(x.id, p);
    const alert = () => {
      if (alerted) return;
      spendFlash(
        (y) => ({ streamAlerts: [...y.streamAlerts, x.id] }),
        { kind: 'alert', kicker: 'FLASH ALERT ARMED · 1 TOKEN', title: "We'll ping you on similar listings" },
        { label: p.name, category: deal?.category ?? null, source: 'stream', ref: deal ? String(deal.id) : `s${x.id}`, imageKey: deal?.imageKey },
      );
    };
    const calc = () => {
      if (hustled) { set({ streamCalc: calcOpen ? null : x.id }); return; }
      set((y) => ({ streamCalc: x.id, streamHustled: [...y.streamHustled, x.id] }));
      showToast({ kind: 'reward', kicker: `HUSTLE! · EST. ${signed(Math.round(net))} PROFIT`, title: 'Hold it to track it in your Hold Pile' });
    };
    rows.push(
      <RowIn key={'i' + x.id} fresh={x.fresh}>
        <View style={[s.streamRow, { borderColor: x.fresh ? A(40) : L(8) }]}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 92, height: 92 }}>
              <Photo src={p.img} style={[StyleSheet.absoluteFill, { borderRadius: 12, backgroundColor: L(6) }]} />
              {(x.fresh || x.age === 0) && (
                <View style={s.newTag}><Text style={mono(8.5, { w: 600, c: C.ona })}>NEW</Text></View>
              )}
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <Text numberOfLines={1} style={[hk(14, { w: 700, c: C.t1 }), { flex: 1, minWidth: 0 }]}>{p.name}</Text>
                <Text style={mono(9.5, { c: C.t4 })}>{x.age === 0 ? 'JUST NOW' : `${x.age}M AGO`}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', minWidth: 0 }}>
                <Pin />
                <Text numberOfLines={1} style={[mono(9.5, { c: C.t4 }), { flex: 1, minWidth: 0 }]}>{p.platform} · {p.loc}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'baseline', paddingTop: 2 }}>
                <Text style={mono(16, { w: 600, c: C.t1 })}>{money(p.price)}</Text>
                <Text style={hk(12, { c: C.t3 })}>→ {money(p.resale)} resale</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Chip label={`${signed(Math.round(net))} PROFIT`} bg={A(13)} fg={C.aink} />
                <View style={{ paddingVertical: 5, paddingHorizontal: 8, borderRadius: 8, backgroundColor: ind[1] }}>
                  <Text style={mono(9, { w: 600, ls: 0.6, c: ind[2] })}>{ind[0]}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, paddingTop: 12 }}>
            <StreamBtn label="VIEW" solid onPress={() => goDeal(p.deal)} />
            <StreamBtn label={held ? 'HELD ✓' : 'HOLD'} on={held} onPress={hold} />
            <StreamBtn label={hustled ? 'HUSTLED' : 'HUSTLE'} on={hustled} onPress={calc} />
            <StreamBtn label={alerted ? 'ALERT ON' : 'ALERT'} on={alerted} tone="gold" onPress={alert} />
          </View>
          {calcOpen && (
            <View style={s.streamCalc}>
              {[
                { label: 'Est. resale', value: money(p.resale) },
                { label: 'Purchase', value: '-' + money(p.price) },
                { label: 'Platform fees (12.9%)', value: '-' + money(Math.round((p.resale * 12.9) / 100)) },
                { label: 'Shipping', value: '-$15' },
              ].map((c) => (
                <View key={c.label} style={[s.between, { paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: L(5) }]}>
                  <Text numberOfLines={1} style={[hk(12.5, { c: C.t3 }), { flex: 1, minWidth: 0 }]}>{c.label}</Text>
                  <Text style={[mono(12, { c: C.t1 }), { paddingLeft: 10 }]}>{c.value}</Text>
                </View>
              ))}
              <View style={[s.baseline, { paddingTop: 11 }]}>
                <Text style={hk(13, { w: 700, c: C.t1 })}>Estimated profit</Text>
                <Text style={mono(15, { w: 600, c: C.aink })}>{signed(Math.round(net))}</Text>
              </View>
              <View style={[s.between, { paddingTop: 6 }]}>
                <Text style={hk(12.5, { c: C.t3 })}>ROI</Text>
                <Text style={mono(12, { c: C.t1 })}>{Math.round(r * 100)}%</Text>
              </View>
            </View>
          )}
        </View>
      </RowIn>,
    );
    if ((i + 1) % 4 === 0) {
      rows.push(
        <AdRow key={'ad' + i} kicker="SPONSORED · AD SLOT" tile={56} body="Native sponsored listing — same card format, always labelled." />,
      );
    }
  });

  return (
    <View style={[pad, { gap: 12 }]}>
      <View style={s.between}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <LiveDot size={8} color={rs.streamLive ? C.a : C.t5} on={rs.streamLive} />
          <Text style={mono(10, { ls: 1.2, c: C.t3 })}>{rs.streamLive ? `LIVE · ${rs.streamItems.length} LISTINGS` : 'PAUSED'}</Text>
        </View>
        <Press onPress={() => set((y) => ({ streamLive: !y.streamLive }))} style={s.pause}>
          <Text style={mono(10, { ls: 0.6, c: C.t2 })}>{rs.streamLive ? 'PAUSE' : 'RESUME'}</Text>
        </Press>
      </View>
      {rs.streamNew > 0 && (
        <Press onPress={() => set({ streamNew: 0 })} style={s.newPill}>
          <Text style={mono(10.5, { w: 600, c: C.ona })}>↑ {rs.streamNew} NEW LISTING{rs.streamNew > 1 ? 'S' : ''}</Text>
        </Press>
      )}
      {rows}
      {rs.streamLoadingMore ? (
        <>
          <Skel h={116} />
          <Skel h={116} style={{ opacity: 0.6 }} />
        </>
      ) : (
        <GhostButton label="Load more listings" onPress={streamMore} />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────── Achievements

export function Achievements() {
  const { rs, set } = useRewards();
  const ach = useAchievements();
  return (
    <View style={[pad, { gap: 12 }]}>
      <View style={[s.achHero, bgImage(`radial-gradient(300px 200px at 90% 0%, ${G(18)}, transparent 70%)`)]}>
        <View style={s.rowC14}>
          <View style={[s.achTile, bgImage(`linear-gradient(140deg, ${G(32)} 0%, ${G(8)} 100%)`)]}>
            <Icon k="trophy" c={C.goldink} size={26} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={kick}>ACHIEVEMENTS</Text>
            <Text style={[bric(30, { lh: 1, ls: -0.8, c: C.t1 }), { paddingTop: 8 }]}>{ach.done} / {ACH_TOTAL}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text numberOfLines={1} style={kick}>XP EARNED</Text>
            <Text style={[mono(14, { w: 600, c: C.aink }), { paddingTop: 8 }]}>+{ach.xp.toLocaleString()} XP</Text>
          </View>
        </View>
        <Bar pct={(ach.done / ACH_TOTAL) * 100} grad style={{ marginTop: 16 }} />
      </View>
      <View style={s.segment}>
        {ACH.map((c, i) => {
          const on = rs.achCat === i;
          return (
            <Press key={c.cat} onPress={() => set({ achCat: i })} style={[s.segItem, on && { backgroundColor: C.s2 }]}>
              <Text style={[hk(12, { w: 700, c: on ? C.t1 : C.t4 }), { textAlign: 'center' }]}>{c.cat}</Text>
            </Press>
          );
        })}
      </View>
      {ach.all[rs.achCat].map((a) => {
        const locked = !!a.lock && !a.done;
        const state = a.done ? 'UNLOCKED' : locked ? 'LOCKED' : 'IN PROGRESS';
        return (
          <View key={a.name} style={[s.achRow, { borderColor: a.done ? G(26) : L(8), opacity: locked ? 0.6 : 1 }]}>
            <IconTile
              k={locked ? 'lock' : a.icon}
              tone={a.done ? 'gold' : locked ? 'lock' : 'a'}
              bg={a.done ? `linear-gradient(140deg, ${G(30)} 0%, ${G(8)} 100%)` : undefined}
            />
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={[s.between, { gap: 8 }]}>
                <Text style={[hk(14, { w: 700, c: C.t1 }), { flexShrink: 1 }]}>{a.name}</Text>
                <View style={{ paddingVertical: 3, paddingHorizontal: 7, borderRadius: 6, backgroundColor: a.done ? G(16) : locked ? L(8) : A(12) }}>
                  <Text style={mono(8.5, { ls: 0.6, c: a.done ? C.goldink : locked ? C.t4 : C.aink })}>{state}</Text>
                </View>
              </View>
              <Text style={[hk(12.5, { lh: 17, c: C.t3 }), { paddingTop: 6 }]}>{locked ? `${a.cond} ${a.lock}.` : a.cond}</Text>
              <View style={[s.rowC10, { paddingTop: 9 }]}>
                <Bar pct={(a.cur / a.target) * 100} h={4} fill={a.done ? C.gold : C.a} style={{ flex: 1 }} />
                <Text style={mono(10, { c: C.t4 })}>{a.cur.toLocaleString()} / {a.target.toLocaleString()}</Text>
                <Text style={mono(10, { c: C.goldink })}>+{a.xp} XP</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ──────────────────────────────────────────────────────── Premium Upgrades

export function Upgrades() {
  const { go } = useHustlr();
  const { rs } = useRewards();
  return (
    <View style={[pad, { gap: 12 }]}>
      <Text style={hk(13.5, { lh: 20, c: C.t3 })}>
        Utilities that give you an edge. Some come with your plan — unlock the rest with a plan upgrade, a level, or tickets from the Arcade.
      </Text>
      {PREMIUM.map((p) => {
        let state: string, stateBg: string, stateFg: string, method: string, cta: string, to: Screen;
        let ctaGrad = false, ctaBg = 'transparent', ctaFg: string = C.t2, ctaBd = L(12), bd = L(8);
        let tone: Tone | 'lock' = 'a';
        if (p.via === 'plan') {
          state = 'ACTIVE'; stateBg = A(14); stateFg = C.aink; method = 'INCLUDED WITH HUSTLER'; cta = 'Manage'; to = 'plans'; bd = A(24);
        } else if (p.via === 'mogul') {
          state = 'MOGUL'; stateBg = G(14); stateFg = C.goldink; method = 'MOGUL PLAN · $49 / MO'; cta = 'Upgrade'; to = 'plans'; tone = 'gold';
        } else if (p.via === 'level') {
          const ok = rs.level >= (p.level ?? 0);
          state = ok ? 'UNLOCKED' : `LVL ${p.level}`; stateBg = ok ? A(14) : L(8); stateFg = ok ? C.aink : C.t4;
          method = ok ? 'LEVEL REWARD' : `REACH LEVEL ${p.level}`; cta = ok ? 'Turn on' : 'View XP'; to = 'achievements'; tone = ok ? 'a' : 'lock';
        } else {
          const on = p.key ? rs.redeemed[p.key] : undefined;
          state = on ? 'ACTIVE · TEMP' : 'LOCKED'; stateBg = on ? A(14) : L(8); stateFg = on ? C.aink : C.t4;
          method = p.method ?? ''; cta = on ? 'Active ✓' : 'Redeem'; to = 'redeem';
          if (!on) { ctaGrad = true; ctaFg = C.ona; ctaBd = 'transparent'; } else bd = A(24);
        }
        return (
          <View key={p.name} style={[s.card18, { padding: 16, gap: 12, borderColor: bd }]}>
            <View style={{ flexDirection: 'row', gap: 13, alignItems: 'flex-start' }}>
              <IconTile k={p.icon} tone={tone} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={[s.between, { gap: 8 }]}>
                  <Text style={[bric(17, { ls: -0.3, c: C.t1 }), { flexShrink: 1 }]}>{p.name}</Text>
                  <View style={{ paddingVertical: 3, paddingHorizontal: 7, borderRadius: 6, backgroundColor: stateBg }}>
                    <Text style={mono(8.5, { ls: 0.6, c: stateFg })}>{state}</Text>
                  </View>
                </View>
                <Text style={[hk(12.5, { lh: 18, c: C.t3 }), { paddingTop: 6 }]}>{p.benefit}</Text>
                <View style={{ flexDirection: 'row', gap: 6, paddingTop: 6 }}>
                  <Text style={[mono(8.5, { ls: 0.8, c: C.aink }), { paddingTop: 3 }]}>WHY</Text>
                  <Text style={[hk(12.5, { lh: 18, c: C.t2 }), { flex: 1 }]}>{p.why}</Text>
                </View>
              </View>
            </View>
            <View style={s.rowC10}>
              <Text style={[mono(10, { c: C.t4 }), { flex: 1, minWidth: 0 }]}>{method}</Text>
              <Press
                onPress={() => go(to)}
                style={[s.upCta, { borderColor: ctaBd }, ctaGrad ? bgImage(GRAD) : { backgroundColor: ctaBg }]}>
                <Text style={hk(12.5, { w: 700, c: ctaFg })}>{cta}</Text>
              </Press>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ──────────────────────────────────────────────────────────── Customise

const cssPad = (p: string) => {
  const [v, h = v] = p.split(' ').map((x) => parseFloat(x));
  return { paddingVertical: v || 0, paddingHorizontal: h || 0 };
};
const cssRadius = (r: string): ViewStyle => {
  if (r === '50%') return { borderRadius: 999 };
  const parts = r.split(' ').map((x) => parseFloat(x));
  if (parts.length === 4) {
    return { borderTopLeftRadius: parts[0], borderTopRightRadius: parts[1], borderBottomRightRadius: parts[2], borderBottomLeftRadius: parts[3] };
  }
  return { borderRadius: parts[0] || 0 };
};
const cssBorder = (b: string): ViewStyle => {
  if (b === 'none') return {};
  const m = b.match(/^([\d.]+)px (solid|dashed) (.+)$/);
  if (!m) return {};
  return { borderWidth: parseFloat(m[1]), borderStyle: m[2] as 'solid' | 'dashed', borderColor: m[3] };
};

/** The preview swatch behind a cosmetic's sample chip. */
function CosPreview({ c }: { c: Cosmetic }) {
  if (c.key === 'neon') {
    return (
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Path d="M0 0H1000V1000H0Z" fill="#061214" />
        {Array.from({ length: 40 }).map((_, i) => (
          <Path key={i} d={`M${i * 14} 0V200M0 ${i * 14}H1000`} stroke="rgba(0,255,224,0.12)" strokeWidth={1} />
        ))}
      </Svg>
    );
  }
  if (c.key === 'popper') {
    const dots: [string, string, string][] = [['20%', '30%', '#E9C46A'], ['78%', '24%', '#20C565'], ['66%', '76%', '#FF8A4C'], ['30%', '78%', '#A78BFA']];
    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: C.s3 }]}>
        {dots.map(([l, t, col]) => (
          <View key={col} style={{ position: 'absolute', left: l as `${number}%`, top: t as `${number}%`, width: 7, height: 7, marginLeft: -3.5, marginTop: -3.5, borderRadius: 4, backgroundColor: col }} />
        ))}
      </View>
    );
  }
  return <View style={[StyleSheet.absoluteFill, c.preview.startsWith('linear') ? bgImage(c.preview) : { backgroundColor: c.preview }]} />;
}

export function Customise() {
  const { rs, cosmeticDefs, cosmeticAct } = useRewards();
  const cells = cosmeticDefs.map((c) => {
    const owned = rs.cosOwned.includes(c.key);
    const eq = rs.cosEquipped.includes(c.key);
    const locked = !!c.minLevel && rs.level < c.minLevel;
    const poor = rs.tickets < c.cost;
    let cta = `${c.cost} TICKETS`, grad = true, ctaBg = 'transparent', ctaFg: string = C.ona, ctaBd = 'transparent', bd = L(8);
    if (locked) { cta = `LVL ${c.minLevel}`; grad = false; ctaFg = C.t5; ctaBd = L(10); }
    else if (eq) { cta = 'EQUIPPED ✓'; grad = false; ctaBg = A(12); ctaFg = C.aink; ctaBd = A(34); bd = A(34); }
    else if (owned) { cta = 'EQUIP'; grad = false; ctaFg = C.t1; ctaBd = L(16); }
    else if (poor) { grad = false; ctaFg = C.t5; ctaBd = L(10); }
    const act = () => cosmeticAct(c);
    const innerBg = c.innerBg.startsWith('linear') ? bgImage(c.innerBg) : { backgroundColor: c.innerBg };
    return (
      <View key={c.key} style={[s.cosCell, { borderColor: bd }]}>
        <View style={s.cosPreview}>
          <CosPreview c={c} />
          <View style={[cssPad(c.innerPad), cssRadius(c.innerRadius), cssBorder(c.innerBd), innerBg]}>
            <Text style={mono(12, { w: 600, ls: 0.6, c: c.fg })}>{c.sample}</Text>
          </View>
          {locked && (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(6,8,7,0.55)', alignItems: 'center', justifyContent: 'center' }]}>
              <Icon k="lock" c={C.white} size={20} width={1.7} />
            </View>
          )}
        </View>
        <View style={{ gap: 6, padding: 12 }}>
          <Text style={hk(13, { w: 700, lh: 17, c: C.t1 })}>{c.name}</Text>
          <Text style={mono(9, { ls: 0.8, c: C.t4 })}>{c.type}</Text>
          <Press onPress={act} style={[s.cosCta, { borderColor: ctaBd }, grad ? bgImage(GRAD) : { backgroundColor: ctaBg }]}>
            <Text style={mono(10, { w: 600, ls: 0.4, c: ctaFg })}>{cta}</Text>
          </Press>
        </View>
      </View>
    );
  });
  const rows: ReactNode[][] = [];
  for (let i = 0; i < cells.length; i += 2) rows.push(cells.slice(i, i + 2));
  return (
    <View style={[pad, { gap: 12 }]}>
      <View style={s.previewNote}>
        <Text style={mono(9, { ls: 1, c: C.t4 })}>PREVIEW</Text>
        <Text style={[hk(12.5, { lh: 17, c: C.t3 }), { flex: 1 }]}>Cosmetics show on your profile and posts. They never change how the app works.</Text>
      </View>
      <View style={{ gap: 10 }}>
        {rows.map((r, i) => <View key={i} style={{ flexDirection: 'row', gap: 10 }}>{r}</View>)}
      </View>
    </View>
  );
}

// ───────────────────────────────────────────────────── toast + reward sheet

const TOAST_ICON: Record<Toast['kind'], IconKey> = { warn: 'alert', ach: 'trophy', alert: 'bolt', hold: 'hold', reward: 'ticket' };

function ToastView({ t, top }: { t: Toast; top: number }) {
  const tone: Tone = t.kind === 'warn' ? 'neg' : t.kind === 'ach' || t.kind === 'alert' ? 'gold' : 'a';
  const p = useSharedValue(0);
  useEffect(() => { p.value = 0; p.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.ease) }); }, [p, t]);
  const anim = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: (1 - p.value) * -10 }] }));
  return (
    <Animated.View pointerEvents="none" style={[s.toast, { top, borderColor: tint(tone, 38) }, anim]}>
      <View style={[s.toastTile, { backgroundColor: tint(tone, 16) }]}>
        <Icon k={TOAST_ICON[t.kind]} c={inkOf(tone)} size={18} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={mono(9.5, { w: 600, ls: 1, c: inkOf(tone) })}>{t.kicker}</Text>
        <Text style={[hk(13.5, { w: 700, c: C.t1 }), { paddingTop: 5 }]}>{t.title}</Text>
      </View>
    </Animated.View>
  );
}

type SheetReward = { label: string; bg: string; fg: string };

function Sheet({ bottomPad }: { bottomPad: number }) {
  const { st, go } = useHustlr();
  const { rs, set, claimDaily, rsSpin } = useRewards();
  const md = rs.modal;
  const fade = useSharedValue(0);
  const up = useSharedValue(0);
  useEffect(() => {
    fade.value = 0; up.value = 0;
    fade.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
    up.value = withTiming(1, { duration: 320, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  }, [md?.kind, fade, up]);
  const backAnim = useAnimatedStyle(() => ({ opacity: fade.value }));
  const sheetAnim = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - up.value) * 500 }] }));
  if (!md) return null;
  const close = () => set({ modal: null });

  let glow = A(18), kicker = '', kickerFg: string = C.aink, title = '', body = '', primary = '', secondary = '';
  let onPrimary = close, onSecondary = close;
  let img: number | null = null, num: string | null = null, icon: { k: IconKey } | null = null;
  let days: { label: string; mark: string; bg: string; bd: string; fg: string }[] | null = null;
  let rewards: SheetReward[] = [];

  if (md.kind === 'daily') {
    const streak = st.checkedIn ? st.streak : st.streak + 1;
    const todayIdx = Math.min(6, Math.max(0, streak - 1));
    days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, i) => {
      const done = i < todayIdx, now = i === todayIdx;
      return { label, mark: done ? '✓' : now ? '+' : '·', bg: now ? A(16) : done ? A(8) : 'transparent', bd: now ? A(50) : done ? A(24) : L(8), fg: done || now ? C.aink : C.t5 };
    });
    img = ART.arcadeHeader;
    kicker = `${streak}-DAY STREAK · MAINTAINED`; title = 'Daily reward';
    body = 'Come back tomorrow to keep it going — day 7 pays 3 Flash Alert Tokens.';
    rewards = [{ label: '+1 FLASH TOKEN', bg: G(14), fg: C.goldink }, { label: '+20 TICKETS', bg: A(14), fg: C.aink }, { label: '+15 XP', bg: A(14), fg: C.aink }];
    primary = 'Claim reward'; onPrimary = () => claimDaily(false, false); secondary = 'Later';
  } else if (md.kind === 'levelup') {
    num = String(md.level); kicker = 'LEVEL UP'; title = `You hit Level ${md.level}`;
    body = md.level === 13 ? 'Sniper Boost is now unlocked in Redeem Rewards. 50 bonus tickets added.' : 'New rewards unlocked in Redeem Rewards. 50 bonus tickets added.';
    rewards = [{ label: '+50 TICKETS', bg: A(14), fg: C.aink }];
    if (md.level === 13) rewards.push({ label: 'SNIPER BOOST UNLOCKED', bg: G(14), fg: C.goldink });
    primary = 'See rewards'; onPrimary = () => { close(); go('redeem'); }; secondary = 'Keep playing';
  } else if (md.kind === 'prize') {
    const w = md.prize, func = w.kind === 'FUNCTIONAL';
    img = ART.prizeSpin; glow = G(20); kicker = `PRIZE WON · ${w.kind}`; kickerFg = C.goldink; title = w.name;
    body = w.desc + (func ? ' Added to your wallet.' : ' Added to your profile in Customise.');
    rewards = [{ label: '✓ REWARD ADDED', bg: A(14), fg: C.aink }];
    primary = func ? 'Use it now' : 'Equip in Customise'; onPrimary = () => { close(); go(func ? 'stream' : 'customise'); };
    secondary = 'Spin again'; onSecondary = () => { close(); rsSpin(); };
  } else {
    const r = md.r;
    icon = { k: r.icon }; kicker = 'REWARD REDEEMED'; title = r.name;
    body = r.repeat ? `Added to your wallet. You now have ${rs.flash} Flash Alert Tokens.` : `Active now · ${r.dur.toLowerCase()}. ${rs.tickets} tickets left.`;
    rewards = [{ label: `-${r.cost} TICKETS`, bg: G(14), fg: C.goldink }];
    primary = 'Done'; secondary = 'View upgrades'; onSecondary = () => { close(); go('upgrades'); };
  }

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 50 }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.62)' }, backAnim]}>
        <Press onPress={close} style={StyleSheet.absoluteFill} pressed={{}} accessibilityLabel="Close" />
      </Animated.View>
      <Animated.View style={[s.sheet, { paddingBottom: 30 + bottomPad }, bgImage(`radial-gradient(380px 240px at 50% 0%, ${glow}, transparent 70%)`), sheetAnim]}>
        <View style={s.grabber} />
        {img != null && <Image source={img} contentFit="contain" style={{ width: 150, height: 118, marginTop: 6 }} />}
        {num != null && (
          <View style={[s.levelUp, bgImage(`linear-gradient(140deg, ${C.a2} 0%, ${C.a} 100%)`)]}>
            <Text style={mono(10, { ls: 1.5, c: C.ona })}>LEVEL</Text>
            <Text style={bric(40, { lh: 1, c: C.ona })}>{num}</Text>
          </View>
        )}
        {icon && (
          <View style={[s.sheetIcon, { backgroundColor: A(14), borderColor: A(34) }]}>
            <Icon k={icon.k} c={C.aink} size={36} />
          </View>
        )}
        <Text style={[mono(10, { w: 600, ls: 1.5, c: kickerFg }), { paddingTop: 4 }]}>{kicker}</Text>
        <Text style={[bric(28, { lh: 31, ls: -0.7, c: C.t1 }), { textAlign: 'center' }]}>{title}</Text>
        <Text style={[hk(14, { lh: 21, c: C.t3 }), { textAlign: 'center', maxWidth: 320 }]}>{body}</Text>
        {days && (
          <View style={{ flexDirection: 'row', gap: 6, alignSelf: 'stretch', paddingTop: 4 }}>
            {days.map((d, i) => (
              <View key={i} style={[s.sheetDay, { backgroundColor: d.bg, borderColor: d.bd }]}>
                <Text style={mono(8.5, { c: C.t4 })}>{d.label}</Text>
                <Text style={mono(11, { w: 600, c: d.fg })}>{d.mark}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
          {rewards.map((r) => (
            <View key={r.label} style={{ paddingVertical: 7, paddingHorizontal: 11, borderRadius: 9, backgroundColor: r.bg }}>
              <Text style={mono(11, { w: 600, c: r.fg })}>{r.label}</Text>
            </View>
          ))}
        </View>
        <GradButton label={primary} onPress={onPrimary} style={{ alignSelf: 'stretch', marginTop: 6 }} />
        <GhostButton label={secondary} onPress={onSecondary} style={{ alignSelf: 'stretch', borderColor: 'transparent' }} />
      </Animated.View>
    </View>
  );
}

/** Toasts and reward sheets, drawn over the phone. */
export function RewardOverlays({ toastTop, bottomPad }: { toastTop: number; bottomPad: number }) {
  const { rs } = useRewards();
  return (
    <>
      {rs.toast && <ToastView t={rs.toast} top={toastTop} />}
      {rs.modal && <Sheet bottomPad={bottomPad} />}
    </>
  );
}

// ─────────────────────────────────────────── Hold Pile profit calculator

const CALC_FIELDS: { label: string; key: keyof CalcVals; min: number; max: number; step: number }[] = [
  { label: 'PURCHASE', key: 'buy', min: 0, max: 1000, step: 5 },
  { label: 'SELLING PRICE', key: 'sell', min: 0, max: 1500, step: 5 },
  { label: 'PLATFORM FEES', key: 'fee', min: 0, max: 25, step: 0.1 },
  { label: 'SHIPPING', key: 'ship', min: 0, max: 100, step: 1 },
  { label: 'OTHER COSTS', key: 'other', min: 0, max: 200, step: 1 },
];

/** The fold-out profit calculator under each Hold Pile row. */
export function HoldCalc({ k, buy, sell }: { k: number; buy: number; sell: number }) {
  const { rs, set } = useRewards();
  const v: CalcVals = { buy, sell, fee: 12.9, ship: 15, other: 0, ...(rs.watchVals[k] || {}) };
  const net = netOf(v.buy, v.sell, v.fee, v.ship, v.other);
  const open = rs.watchCalc === k;
  const roiTxt = v.buy > 0 ? `${Math.round((net / v.buy) * 100)}%` : '—';
  const display = (key: keyof CalcVals) => {
    if (key === 'buy' || key === 'sell') return money(Math.round(v[key]));
    if (key === 'fee') return `${v.fee.toFixed(1)}% · -${money(Math.round((v.sell * v.fee) / 100))}`;
    return '-' + money(Math.round(v[key]));
  };
  const setF = (key: keyof CalcVals) => (n: number) => set((x) => ({ watchVals: { ...x.watchVals, [k]: { ...v, ...(x.watchVals[k] || {}), [key]: n } } }));
  return (
    <>
      <Press onPress={() => set({ watchCalc: open ? null : k })} style={s.calcToggle}>
        <Svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke={C.aink} strokeWidth={1.4} strokeLinecap="round">
          <Path d="M5 1.8h6a2 2 0 0 1 2 2v8.4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3.8a2 2 0 0 1 2-2Z" />
          <Path d="M5.5 5h5M5.5 8.2h1M9.5 8.2h1M5.5 11.2h1M9.5 11.2h1" />
        </Svg>
        <Text style={[hk(12.5, { w: 600, c: C.t2 }), { flex: 1, minWidth: 0 }]}>Profit calculator</Text>
        <Text style={mono(10.5, { c: C.aink })}>{open ? '▾ ' : ''}{signed(Math.round(net))} · {roiTxt} ROI</Text>
      </Press>
      {open && (
        <View style={s.calcBody}>
          {CALC_FIELDS.map((c) => (
            <View key={c.key} style={{ paddingTop: 6, paddingBottom: 8 }}>
              <View style={s.between}>
                <Text style={mono(9.5, { ls: 0.8, c: C.t4 })}>{c.label}</Text>
                <Text style={mono(12.5, { w: 600, c: C.t1 })}>{display(c.key)}</Text>
              </View>
              <Slider min={c.min} max={c.max} step={c.step} value={v[c.key]} onChange={setF(c.key)} style={{ marginTop: 8 }} />
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: 8, paddingTop: 8 }}>
            <View style={[s.calcOut, { backgroundColor: A(10), borderColor: A(24) }]}>
              <Text style={mono(8.5, { ls: 1, c: C.t4 })}>EST. PROFIT</Text>
              <Text style={[mono(17, { w: 600, c: net >= 0 ? C.aink : C.neg }), { paddingTop: 7 }]}>{signed(Math.round(net))}</Text>
            </View>
            <View style={[s.calcOut, { backgroundColor: L(4), borderColor: L(7) }]}>
              <Text style={mono(8.5, { ls: 1, c: C.t4 })}>ROI</Text>
              <Text style={[mono(17, { w: 600, c: C.t1 }), { paddingTop: 7 }]}>{roiTxt}</Text>
            </View>
          </View>
          <Text style={[mono(10, { c: C.t4 }), { paddingTop: 10 }]}>
            FEES -{money(Math.round((v.sell * v.fee) / 100))} · SHIPPING -{money(Math.round(v.ship))} · OTHER -{money(Math.round(v.other))}
          </Text>
        </View>
      )}
    </>
  );
}

const s = StyleSheet.create({
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  baseline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  rowC8: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  rowC10: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  rowC12: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  rowC14: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  hair: { borderBottomWidth: 1, borderBottomColor: L(4) },
  card18: { borderRadius: 18, backgroundColor: C.s1, borderWidth: 1, borderColor: L(8) },
  chip: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingVertical: 5, paddingHorizontal: 9, borderRadius: 8 },
  grad: {
    borderRadius: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    boxShadow: `0 8px 24px ${A(26)}`, backgroundColor: C.a,
  },
  ghost: { borderRadius: 14, borderWidth: 1, borderColor: L(12), alignItems: 'center', justifyContent: 'center' },
  ad: {
    flexDirection: 'row', gap: 12, alignItems: 'center', padding: 14, borderRadius: 16,
    borderWidth: 1, borderStyle: 'dashed', borderColor: L(16), backgroundColor: L(2),
  },
  adTile: { borderRadius: 12, borderWidth: 1, borderColor: L(12), alignItems: 'center', justifyContent: 'center' },
  statBox: { flex: 1, minWidth: 0, borderRadius: 12, backgroundColor: L(4), borderWidth: 1, borderColor: L(7) },
  mini: { flex: 1, paddingVertical: 10, paddingHorizontal: 11, borderRadius: 12, backgroundColor: L(4), borderWidth: 1, borderColor: L(7) },
  hohPromo: { overflow: 'hidden', minHeight: 226, borderRadius: 20, borderWidth: 1, borderColor: A(30) },
  fan: { position: 'absolute', width: 104, height: 136, borderRadius: 14, borderWidth: 2, overflow: 'hidden', boxShadow: '0 12px 26px rgba(0,0,0,0.5)' },
  promoStamp: {
    position: 'absolute', right: 60, top: 60, transform: [{ rotate: '-16deg' }], paddingVertical: 3, paddingHorizontal: 8,
    borderRadius: 7, borderWidth: 2, borderColor: C.a, backgroundColor: 'rgba(6,8,7,0.6)',
  },
  playNow: {
    marginTop: 4, alignSelf: 'flex-start', flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 13, paddingHorizontal: 18,
    borderRadius: 14, boxShadow: `0 8px 22px ${A(30)}`, backgroundColor: C.a,
  },
  earnRow: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: L(4) },
  earnTile: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  linkTile: { flex: 1, minWidth: 0, gap: 10, paddingVertical: 13, paddingHorizontal: 12, borderRadius: 16, backgroundColor: C.s1, borderWidth: 1, borderColor: L(8) },
  linkIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  loopDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  gami: { gap: 14, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: A(22) },
  gamiStat: { flex: 1, minWidth: 0, paddingVertical: 9, paddingHorizontal: 8, borderRadius: 11, backgroundColor: L(4), borderWidth: 1, borderColor: L(7) },
  tile40: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tile42: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  noticeFlash: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 14, borderRadius: 13, borderWidth: 1, borderColor: G(26) },
  noticeMissed: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 14, borderRadius: 13, backgroundColor: C.s1, borderWidth: 1, borderColor: L(8) },
  manage: { paddingVertical: 7, paddingHorizontal: 11, borderRadius: 9, borderWidth: 1, borderColor: G(34) },
  homeCard: { flexDirection: 'row', gap: 14, alignItems: 'center', padding: 15, borderRadius: 14, borderWidth: 1 },
  homeTile: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  detailFlash: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 13, borderWidth: 1, borderColor: G(26) },
  detailAlertBtn: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: G(38) },
  hohBack: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: 22, overflow: 'hidden', backgroundColor: C.s1,
    borderWidth: 1, borderColor: L(6), opacity: 0.5, transform: [{ translateY: 12 }, { scale: 0.94 }],
  },
  hohCard: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: 22, overflow: 'hidden', backgroundColor: C.s1,
    borderWidth: 1.5, boxShadow: '0 18px 44px rgba(0,0,0,0.45)',
  },
  demand: { position: 'absolute', left: 12, bottom: 12, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  stamp: { position: 'absolute', top: 58, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 10, borderWidth: 3, backgroundColor: 'rgba(6,8,7,0.55)' },
  holdBtn: { flex: 1, height: 58, borderRadius: 16, borderWidth: 1.5, borderColor: N(45), backgroundColor: N(8), alignItems: 'center', justifyContent: 'center' },
  hustleBtn: { flex: 1, height: 58, borderRadius: 16, alignItems: 'center', justifyContent: 'center', boxShadow: `0 10px 26px ${A(30)}`, backgroundColor: C.a },
  fb: { overflow: 'hidden', padding: 16, borderRadius: 18, backgroundColor: C.s1, borderWidth: 1 },
  doneHero: {
    overflow: 'hidden', paddingVertical: 22, paddingHorizontal: 18, borderRadius: 20, backgroundColor: C.s1,
    borderWidth: 1, borderColor: A(26), alignItems: 'center',
  },
  labelBox: { position: 'absolute', width: 100, height: 30, alignItems: 'center', justifyContent: 'center' },
  wheelLabel: { paddingVertical: 4, paddingHorizontal: 7, borderRadius: 7, backgroundColor: 'rgba(6,8,7,0.66)' },
  pointer: {
    position: 'absolute', left: WHEEL / 2 - 10, top: -4, width: 0, height: 0, zIndex: 3,
    borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 18,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: C.gold,
    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
  },
  balance: { flex: 1, padding: 16, borderRadius: 18, borderWidth: 1 },
  cta44: { height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  flashHero: { overflow: 'hidden', paddingVertical: 22, paddingHorizontal: 18, borderRadius: 20, backgroundColor: C.s1, borderWidth: 1, borderColor: G(26) },
  flashTile: { width: 60, height: 60, borderRadius: 18, borderWidth: 1, borderColor: G(40), alignItems: 'center', justifyContent: 'center' },
  missedHero: { overflow: 'hidden', paddingVertical: 20, paddingHorizontal: 18, borderRadius: 20, borderWidth: 1, borderColor: G(22) },
  soldThumb: { width: 78, height: 78, borderRadius: 12, overflow: 'hidden', backgroundColor: L(6) },
  soldTag: { position: 'absolute', left: 6, bottom: 6, paddingVertical: 3, paddingHorizontal: 6, borderRadius: 5, backgroundColor: 'rgba(6,8,7,0.8)' },
  why: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: L(4) },
  btn40: { flex: 1, height: 40, borderRadius: 11, borderWidth: 1, borderColor: L(12), alignItems: 'center', justifyContent: 'center' },
  stillLive: { overflow: 'hidden', gap: 12, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: A(34) },
  pause: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 9, borderWidth: 1, borderColor: L(12) },
  newPill: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: C.a, boxShadow: `0 8px 20px ${A(30)}` },
  streamRow: { padding: 12, borderRadius: 16, backgroundColor: C.s1, borderWidth: 1 },
  newTag: { position: 'absolute', top: 6, left: 6, paddingVertical: 3, paddingHorizontal: 6, borderRadius: 6, backgroundColor: C.a },
  streamBtn: { flex: 1, height: 34, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  streamCalc: { marginTop: 12, paddingTop: 4, paddingHorizontal: 12, paddingBottom: 12, borderRadius: 12, backgroundColor: L(3), borderWidth: 1, borderColor: L(6) },
  achHero: { padding: 18, borderRadius: 20, backgroundColor: C.s1, borderWidth: 1, borderColor: G(22) },
  achTile: { width: 56, height: 56, borderRadius: 16, borderWidth: 1, borderColor: G(40), alignItems: 'center', justifyContent: 'center' },
  segment: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 12, backgroundColor: C.s1, borderWidth: 1, borderColor: L(6) },
  segItem: { flex: 1, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  achRow: { flexDirection: 'row', gap: 13, alignItems: 'center', padding: 14, borderRadius: 16, backgroundColor: C.s1, borderWidth: 1 },
  upCta: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 11, borderWidth: 1 },
  previewNote: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 13, backgroundColor: L(4), borderWidth: 1, borderColor: L(7) },
  cosCell: { flex: 1, minWidth: 0, borderRadius: 16, overflow: 'hidden', backgroundColor: C.s1, borderWidth: 1 },
  cosPreview: { height: 96, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cosCta: { marginTop: 4, height: 34, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  toast: {
    position: 'absolute', left: 14, right: 14, zIndex: 40, flexDirection: 'row', gap: 12, alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 15, backgroundColor: C.s2, borderWidth: 1,
    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
  },
  toastTile: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', gap: 12, paddingTop: 14, paddingHorizontal: 20,
    borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: C.s1, borderTopWidth: 1, borderTopColor: L(10),
  },
  grabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: L(18) },
  levelUp: { marginTop: 10, width: 92, height: 92, borderRadius: 28, alignItems: 'center', justifyContent: 'center', boxShadow: `0 16px 40px ${A(40)}` },
  sheetIcon: { marginTop: 10, width: 80, height: 80, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sheetDay: { flex: 1, height: 50, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  calcToggle: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 11, backgroundColor: L(3), borderWidth: 1, borderColor: L(6) },
  calcBody: { padding: 14, borderRadius: 13, backgroundColor: C.s1, borderWidth: 1, borderColor: A(24) },
  calcOut: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1 },
  emptyIcon: { width: 64, height: 64, borderRadius: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: L(16), alignItems: 'center', justifyContent: 'center' },
});
