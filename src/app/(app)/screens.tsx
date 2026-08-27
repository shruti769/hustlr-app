import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TopBar } from '@/components/ui/top-bar';
import { Touch } from '@/components/ui/touch';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { SCREEN_INDEX } from '@/data/mock';
import { useBack } from '@/hooks/use-back';

/**
 * Directory of every screen, mirroring the prototype's side index. It is the
 * only way to reach the tool screens (Dashboard, Calculator, Price Tracker,
 * Market Trends, Quick Analyser, Analyse Listing), which the prototype exposed
 * through that index rather than from inside the app.
 */
export default function ScreensIndex() {
  const back = useBack('/profile');

  return (
    <Screen contentStyle={styles.content}>
      <TopBar title="All screens" onBack={back} />

      <View style={styles.body}>
        <Text style={mono(9, 500, { ls: 0.18, color: Colors.sub })}>
          {SCREEN_INDEX.length} SCREENS
        </Text>

        <Card radius={15} style={styles.list}>
          {SCREEN_INDEX.map((s, i) => (
            <Touch
              key={s.path}
              style={[styles.row, i < SCREEN_INDEX.length - 1 && styles.divider]}
              onPress={() => router.push(s.path as never)}
              accessibilityRole="button">
              <Text style={archivo(13.5, 600, { color: Colors.text })}>{s.label}</Text>
              <Text style={mono(10, 500, { ls: 0.06, color: Colors.muted })}>{s.path}</Text>
            </Touch>
          ))}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0 },
  body: { borderTopWidth: 1, borderTopColor: Colors.hairline, padding: 16 },
  list: { marginTop: 14, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.hairlineSoft },
});
