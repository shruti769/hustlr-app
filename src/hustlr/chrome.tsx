import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { HEADER_ACTIONS, TITLES, type Screen } from './data';
import { isTabRoot, useHustlr } from './store';
import { A, C, L, bgImage, bric, mono } from './theme';
import { Press, ScalePress } from './ui';

/** The prototype's fake iOS status bar — only drawn inside the web phone frame. */
export function StatusBarMock() {
  return (
    <View style={s.status}>
      <Text style={mono(14, { w: 600, lh: 1, c: C.t1 })}>9:41</Text>
      <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
        <Svg width={17} height={12} viewBox="0 0 17 12" fill={C.t1}>
          <Rect x={0} y={8} width={3} height={4} rx={1} />
          <Rect x={4.5} y={6} width={3} height={6} rx={1} />
          <Rect x={9} y={3} width={3} height={9} rx={1} />
          <Rect x={13.5} y={0} width={3} height={12} rx={1} />
        </Svg>
        <Svg width={15} height={11} viewBox="0 0 15 11" fill="none" stroke={C.t1} strokeWidth={1.3}>
          <Path d="M1 4.2a9 9 0 0 1 13 0" />
          <Path d="M3.6 6.9a5.4 5.4 0 0 1 7.8 0" />
          <Circle cx={7.5} cy={9.6} r={1} fill={C.t1} stroke="none" />
        </Svg>
        <Svg width={24} height={11} viewBox="0 0 24 11" fill="none">
          <Rect x={0.5} y={0.5} width={20} height={10} rx={3} stroke={C.t1} strokeOpacity={0.5} />
          <Rect x={2} y={2} width={15} height={7} rx={2} fill={C.t1} />
          <Path d="M22 4v3a2 2 0 0 0 0-3z" fill={C.t1} />
        </Svg>
      </View>
    </View>
  );
}

export function Header({ screen }: { screen: Screen }) {
  const { go, back } = useHustlr();
  const action = HEADER_ACTIONS[screen];
  const canBack = !isTabRoot(screen);
  const showBell = screen === 'deals' || screen === 'home';
  return (
    <View style={s.header}>
      {canBack && (
        <Press onPress={back} style={s.back} hover={{ borderColor: A(50) }}>
          {({ hovered }) => (
            <Svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke={hovered ? C.aink : C.t2} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M8.5 2.5 4 7l4.5 4.5" />
            </Svg>
          )}
        </Press>
      )}
      <Text numberOfLines={1} style={[bric(22, { w: 700, lh: 1, ls: -0.4, c: C.t1 }), { flex: 1, minWidth: 0 }]}>
        {TITLES[screen] ?? ''}
      </Text>
      {action && (
        <Press onPress={() => go(action.to)} style={s.action} hover={{ backgroundColor: A(20) }}>
          <Text style={mono(11, { ls: 0.5, c: C.aink })}>{action.label}</Text>
        </Press>
      )}
      {showBell && (
        <Press onPress={() => go('notifications')} style={s.bell} hover={{ borderColor: A(40) }}>
          {({ hovered }) => (
            <>
              <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke={hovered ? C.aink : C.t3} strokeWidth={1.4} strokeLinecap="round">
                <Path d="M4 6.5a4 4 0 0 1 8 0c0 3 1.2 4 1.2 4H2.8S4 9.5 4 6.5Z" />
                <Path d="M6.5 13a1.6 1.6 0 0 0 3 0" />
              </Svg>
              <View style={s.bellDot} />
            </>
          )}
        </Press>
      )}
    </View>
  );
}

const TABS: { key: Screen; label: string; icon: (c: string) => React.ReactNode }[] = [
  {
    key: 'home', label: 'HOME',
    icon: (c) => (
      <>
        <Path d="M3.6 10.4a2 2 0 0 1 .72-1.54l6.4-5.2a2 2 0 0 1 2.56 0l6.4 5.2a2 2 0 0 1 .72 1.54v8.2a2 2 0 0 1-2 2H5.6a2 2 0 0 1-2-2Z" />
        <Path d="M9.6 20.6v-4.4a2.4 2.4 0 0 1 4.8 0v4.4" />
      </>
    ),
  },
  {
    key: 'deals', label: 'DEALS',
    icon: (c) => (
      <>
        <Path d="M12.9 3.2H19a1.8 1.8 0 0 1 1.8 1.8v6.1a2.2 2.2 0 0 1-.64 1.55l-7.1 7.1a1.8 1.8 0 0 1-2.55 0l-5.72-5.72a1.8 1.8 0 0 1 0-2.55l7.1-7.1A2.2 2.2 0 0 1 12.9 3.2Z" />
        <Circle cx={16.4} cy={7.6} r={1.5} fill={c} stroke="none" />
      </>
    ),
  },
  {
    key: 'fliptok', label: 'FLIP TOK',
    icon: () => <Path d="M7.4 4.6a1.2 1.2 0 0 1 1.84-1.02l10 7.4a1.2 1.2 0 0 1 0 2.04l-10 7.4A1.2 1.2 0 0 1 7.4 19.4Z" />,
  },
  {
    key: 'inventory', label: 'INVENTORY',
    icon: () => (
      <>
        <Path d="M12 2.8l8.2 4.6v9.2L12 21.2 3.8 16.6V7.4Z" />
        <Path d="M3.8 7.4 12 12l8.2-4.6M12 12v9.2" />
      </>
    ),
  },
  {
    key: 'profile', label: 'PROFILE',
    icon: () => (
      <>
        <Circle cx={12} cy={8} r={4.2} />
        <Path d="M4.6 20.6a7.4 7.4 0 0 1 14.8 0" />
      </>
    ),
  },
];

const ARCADE_SCREENS: Screen[] = ['arcade', 'priceit', 'pawn', 'spin', 'store'];

export const TAB_BAR_BODY = 9 + 52;

export function TabBar({ bottomPad }: { bottomPad: number }) {
  const { st, go } = useHustlr();
  const inArcade = ARCADE_SCREENS.includes(st.screen);
  return (
    <View style={[s.tabs, { height: TAB_BAR_BODY + bottomPad }]}>
      {TABS.map((t) => {
        const c = st.tab === t.key && !inArcade ? C.a : C.t4;
        return (
          <Press key={t.key} onPress={() => go(t.key)} style={s.tab} pressed={{ opacity: 0.7 }}>
            <Svg width={23} height={23} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              {t.icon(c)}
            </Svg>
            <Text style={mono(9, { ls: 0.5, lh: 1, c })}>{t.label}</Text>
          </Press>
        );
      })}
    </View>
  );
}

const HALO_EASE = Easing.bezier(0, 0, 0.58, 1);
const BOB_EASE = Easing.bezier(0.42, 0, 0.58, 1);

function Halo({ color, delay }: { color: string; delay: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withRepeat(withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: 1680, easing: HALO_EASE }),
      withTiming(1, { duration: 720 }),
    ), -1));
  }, [p, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - p.value),
    transform: [{ scale: 1 + 0.55 * p.value }],
  }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: 37, backgroundColor: color }, style]} />;
}

/** Floating Arcade button: bobs gently, pulses two halos, shows the credit balance. */
export function ArcadeFab({ bottom }: { bottom: number }) {
  const { st, go } = useHustlr();
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(withSequence(
      withTiming(-3, { duration: 1700, easing: BOB_EASE }),
      withTiming(0, { duration: 1700, easing: BOB_EASE }),
    ), -1);
  }, [y]);
  const bob = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View style={[s.fab, { bottom }, bob]}>
      <Halo color={A(45)} delay={0} />
      <Halo color={A(35)} delay={1200} />
      <ScalePress onPress={() => go('arcade')} down={0.96} over={1.06} duration={160} style={s.fabButton}>
        <Svg width={26} height={26} viewBox="0 0 20 20" fill="none" stroke={C.ona} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <Rect x={1.6} y={6} width={16.8} height={10.4} rx={4.2} />
          <Path d="M5.6 9.4v3.6M3.8 11.2h3.6" />
          <Circle cx={13.4} cy={10.2} r={0.9} fill={C.ona} stroke="none" />
          <Circle cx={15.4} cy={12.4} r={0.9} fill={C.ona} stroke="none" />
        </Svg>
        <Text style={mono(9, { w: 700, ls: 0.5, c: C.ona })}>ARCADE</Text>
      </ScalePress>
      <View pointerEvents="none" style={s.fabBadge}>
        <Text numberOfLines={1} style={mono(10, { w: 600, c: C.aink })}>{st.credits}</Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  status: {
    height: 50, backgroundColor: C.bg, flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 24,
    justifyContent: 'space-between', alignItems: 'center',
  },
  header: {
    height: 58, backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: L(6),
    flexDirection: 'row', gap: 12, paddingHorizontal: 16, alignItems: 'center',
  },
  back: {
    width: 32, height: 32, borderRadius: 9, borderWidth: 1, borderColor: L(8),
    alignItems: 'center', justifyContent: 'center',
  },
  action: {
    paddingVertical: 7, paddingHorizontal: 12, borderRadius: 9,
    backgroundColor: A(12), borderWidth: 1, borderColor: A(30),
  },
  bell: {
    width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: L(8),
    alignItems: 'center', justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute', top: 6, right: 7, width: 10, height: 10, borderRadius: 5,
    backgroundColor: C.aink, borderWidth: 2, borderColor: C.bg,
  },
  tabs: {
    backgroundColor: C.s0, borderTopWidth: 1, borderTopColor: L(7),
    flexDirection: 'row', paddingTop: 9, paddingHorizontal: 4, alignItems: 'flex-start',
  },
  tab: { flex: 1, height: 52, gap: 4, paddingVertical: 7, alignItems: 'center' },
  fab: { position: 'absolute', right: 14, zIndex: 5, width: 74, height: 74 },
  fabButton: {
    width: 74, height: 74, borderRadius: 37,
    ...bgImage(`radial-gradient(120% 120% at 30% 20%, ${C.a2} 0%, ${C.a} 58%, rgb(7,43,22) 100%)`),
    backgroundColor: C.a,
    borderWidth: 2, borderColor: L(30),
    boxShadow: `0 16px 40px ${A(55)}, 0 4px 10px rgba(0,0,0,0.55), inset 0 2px 4px ${L(35)}`,
    alignItems: 'center', justifyContent: 'center', gap: 3,
  },
  fabBadge: {
    position: 'absolute', top: -5, right: -7, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 9,
    backgroundColor: C.bg, borderWidth: 1, borderColor: A(45),
  },
});

export const isWeb = Platform.OS === 'web';
