import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TopBar } from '@/components/ui/top-bar';
import { Colors } from '@/constants/theme';
import { archivo, mono } from '@/constants/type';
import { NOTIFICATIONS } from '@/data/mock';
import { useBack } from '@/hooks/use-back';

export default function NotificationsScreen() {
  const back = useBack();

  return (
    <Screen contentStyle={styles.content}>
      <TopBar title="Notifications" onBack={back} />

      <View style={styles.body}>
        <Card radius={15} style={styles.list}>
          {NOTIFICATIONS.map((n) => (
            <View key={n.title} style={styles.row}>
              <View style={[styles.tile, { backgroundColor: n.iconBg }]}>
                <Text style={styles.emoji}>{n.icon}</Text>
              </View>
              <View style={styles.meta}>
                <View style={styles.metaHead}>
                  <Text style={archivo(13.5, 700, { color: Colors.text })}>{n.title}</Text>
                  {n.hot ? <View style={styles.unread} /> : null}
                  <Text style={[mono(9.5, 500, { color: Colors.muted }), styles.time]}>{n.time}</Text>
                </View>
                <Text style={[archivo(12, 400, { lh: 1.45, color: Colors.sub }), styles.body2]}>
                  {n.body}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0 },
  body: { borderTopWidth: 1, borderTopColor: Colors.hairline, padding: 16 },
  list: { overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineSoft,
  },
  tile: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 15 },
  meta: { flex: 1, minWidth: 0 },
  metaHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unread: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.brand },
  time: { marginLeft: 'auto' },
  body2: { marginTop: 5 },
});
