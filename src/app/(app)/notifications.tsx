import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { FireEmojiIcon } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TopBar } from '@/components/ui/top-bar';
import { Colors } from '@/constants/theme';
import { archivo, bricolageBold, mono } from '@/constants/type';
import { NOTIFICATIONS } from '@/data/mock';
import { useBack } from '@/hooks/use-back';
import { useTab } from '@/store/app-store';

function NotificationGlyph({ icon }: { icon: string }) {
  if (icon === '🔥') return <FireEmojiIcon size={22} />;

  const common = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
      {icon === '🎯' ? (
        <>
          <Circle cx="12" cy="12" r="8" stroke="#5CC96B" strokeWidth="2" />
          <Circle cx="12" cy="12" r="3" fill="#E8ECE9" />
          <Path d="M14 10l6-6M16 4h4v4" stroke="#E8ECE9" strokeWidth="1.8" {...common} />
        </>
      ) : icon === '💸' ? (
        <>
          <Circle cx="12" cy="12" r="9" fill="#5CC96B" />
          <Path d="M15 8.5c-.8-.6-1.7-.8-2.8-.8-1.7 0-2.8.7-2.8 1.8 0 2.8 5.4 1.2 5.4 4.2 0 1.2-1.1 2-2.9 2-1.2 0-2.3-.3-3.1-1M12 6.5v11" stroke="#0B2F16" strokeWidth="1.7" {...common} />
        </>
      ) : icon === '⚠' ? (
        <>
          <Path d="M12 3L22 20H2L12 3z" fill="#FF5C5C" />
          <Path d="M12 9v5M12 17.2v.1" stroke="#2B1010" strokeWidth="2" {...common} />
        </>
      ) : icon === '🎟' ? (
        <Path d="M4 7h16v3a2 2 0 000 4v3H4v-3a2 2 0 000-4V7z" fill="#E9C46A" stroke="#E9C46A" strokeWidth="1.5" {...common} />
      ) : (
        <>
          <Path d="M5 5h14v14H5z" fill="#7AA2FF" stroke="#B9C8FF" strokeWidth="1.5" {...common} />
          <Path d="M8 12l2.5 2.5L16 9" stroke="#08101F" strokeWidth="2" {...common} />
        </>
      )}
    </Svg>
  );
}

export default function NotificationsScreen() {
  const back = useBack();
  useTab('profile');

  return (
    <Screen minimumTopInset={44} contentStyle={styles.content}>
      <TopBar
        title="Notifications"
        onBack={back}
        titleStyle={bricolageBold(22, { lh: 1, ls: -0.4 / 22, color: Colors.text })}
        style={styles.topBar}
      />

      <View style={styles.body}>
        <Card radius={15} background={Colors.surfaceAlt} style={styles.list}>
          {NOTIFICATIONS.map((n) => (
            <View key={n.title} style={styles.row}>
              <View style={[styles.tile, { backgroundColor: n.iconBg }]}>
                <NotificationGlyph icon={n.icon} />
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
  topBar: { paddingHorizontal: 7 },
  body: {
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    paddingTop: 14,
    paddingHorizontal: 6,
  },
  list: { overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineSoft,
  },
  tile: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  meta: { flex: 1, minWidth: 0 },
  metaHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unread: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.brand },
  time: { marginLeft: 'auto' },
  body2: { marginTop: 5 },
});
