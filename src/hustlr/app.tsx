import { useEffect, type ComponentType } from 'react';
import {
  BackHandler, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArcadeFab, Header, StatusBarMock, TAB_BAR_BODY, TabBar } from './chrome';
import type { Screen } from './data';
import { isTabRoot, useHustlr } from './store';
import { A, C, L, bgImage } from './theme';
import { Arcade, Pawn, PriceIt, Spin, Store } from './screens/arcade';
import { Login, Reset, Signup, Splash } from './screens/auth';
import { AddListing, Deals, Detail, FlipTok, Home, Inventory } from './screens/main';
import {
  Analyse, Calculator, Dashboard, Leaderboard, Notifications, Plans, PrizesScreen, Profile, Tracker, Trends, Watchlist,
} from './screens/tools';

const SCREENS: Record<Exclude<Screen, 'splash'>, ComponentType> = {
  login: Login, signup: Signup, reset: Reset,
  home: Home, deals: Deals, detail: Detail, fliptok: FlipTok, inventory: Inventory, add: AddListing, profile: Profile,
  dashboard: Dashboard, calculator: Calculator, tracker: Tracker, trends: Trends, analyse: Analyse,
  leaderboard: Leaderboard, watchlist: Watchlist, prizes: PrizesScreen, plans: Plans, notifications: Notifications,
  arcade: Arcade, priceit: PriceIt, pawn: Pawn, spin: Spin, store: Store,
};

const AUTH: Screen[] = ['login', 'signup', 'reset'];
const NO_FAB: Screen[] = ['arcade', 'priceit', 'pawn', 'spin', 'store', 'add'];

const FRAME_W = 430;
const FRAME_H = 860;
/** Home-indicator strip inside the prototype's 80.5px tab bar. */
const FRAME_BOTTOM = 19.5;

function Phone({ framed }: { framed: boolean }) {
  const { st, back } = useHustlr();
  const insets = useSafeAreaInsets();
  const screen = st.screen;

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'splash' || isTabRoot(screen)) return false;
      if (screen === 'login' && st.stack.length === 0) return false;
      back();
      return true;
    });
    return () => sub.remove();
  }, [screen, st.stack.length, back]);

  if (screen === 'splash') return <Splash />;

  const auth = AUTH.includes(screen);
  const bottomPad = framed ? FRAME_BOTTOM : Math.max(insets.bottom, FRAME_BOTTOM);
  const Body = SCREENS[screen];

  return (
    <View style={s.phone}>
      {framed ? <StatusBarMock /> : <View style={{ height: insets.top, backgroundColor: C.bg }} />}
      {!auth && <Header screen={screen} />}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          key={screen}
          style={{ flex: 1 }}
          contentContainerStyle={[{ flexGrow: 1 }, auth && !framed && { paddingBottom: insets.bottom }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <Body />
        </ScrollView>
      </KeyboardAvoidingView>
      {!auth && !NO_FAB.includes(screen) && <ArcadeFab bottom={TAB_BAR_BODY + bottomPad + 13.5} />}
      {!auth && <TabBar bottomPad={bottomPad} />}
    </View>
  );
}

/**
 * On a phone the app fills the screen. On a wide web window it sits in the
 * prototype's 430×860 device frame so the two can be compared side by side.
 */
export function HustlrApp() {
  const { width, height } = useWindowDimensions();
  const framed = Platform.OS === 'web' && width >= FRAME_W + 40 && height >= 640;
  if (!framed) return <Phone framed={false} />;
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.page }}
      contentContainerStyle={[s.page, bgImage(`radial-gradient(900px 600px at 50% 0%, ${A(7)}, rgba(0,0,0,0) 70%)`)]}>
      <View style={s.frame}>
        <Phone framed />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  phone: { flex: 1, backgroundColor: C.bg },
  page: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  frame: {
    width: FRAME_W + 2, height: FRAME_H + 2, overflow: 'hidden', borderRadius: 40, backgroundColor: C.bg,
    borderWidth: 1, borderColor: L(8), boxShadow: '0 40px 120px rgba(0,0,0,0.7)',
  },
});
