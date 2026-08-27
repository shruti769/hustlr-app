import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BottomNav } from '@/components/ui/bottom-nav';
import { Colors } from '@/constants/theme';

/** Root tabs cross-fade between each other; everything else pushes in. */
const TABS = ['home', 'deals', 'fliptok', 'inventory', 'profile'];

const PUSHED = [
  'deal/[id]',
  'add-listing',
  'leaderboard',
  'watchlist',
  'notifications',
  'prize',
  'plans',
  'dashboard',
  'calculator',
  'tracker',
  'trends',
  'analyser',
  'quick',
  'screens',
];

/**
 * The signed-in shell. The nav bar lives outside the navigator so it stays
 * mounted while screens transition — the prototype's fixed chrome.
 */
export default function AppLayout() {
  return (
    <View style={styles.root}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
        }}>
        {TABS.map((name) => (
          <Stack.Screen key={name} name={name} options={{ animation: 'fade', animationDuration: 150 }} />
        ))}
        {PUSHED.map((name) => (
          <Stack.Screen key={name} name={name} options={{ animation: 'slide_from_right' }} />
        ))}
      </Stack>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
});
