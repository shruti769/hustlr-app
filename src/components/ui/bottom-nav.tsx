import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  NavDealsIcon,
  NavFlipTokIcon,
  NavHomeIcon,
  NavInventoryIcon,
  NavProfileIcon,
  type IconProps,
} from '@/components/icons';
import { Touch } from '@/components/ui/touch';
import { Colors, NAV_HEIGHT } from '@/constants/theme';
import { mono } from '@/constants/type';
import { useApp, type TabId } from '@/store/app-store';

const ITEMS: { id: TabId; label: string; Icon: (p: IconProps) => React.ReactElement; href: string }[] = [
  { id: 'home', label: 'HOME', Icon: NavHomeIcon, href: '/home' },
  { id: 'deals', label: 'DEALS', Icon: NavDealsIcon, href: '/deals' },
  { id: 'fliptok', label: 'FLIP TOK', Icon: NavFlipTokIcon, href: '/fliptok' },
  { id: 'inventory', label: 'INVENTORY', Icon: NavInventoryIcon, href: '/inventory' },
  { id: 'profile', label: 'PROFILE', Icon: NavProfileIcon, href: '/profile' },
];

/**
 * Persistent bottom navigation. Sits above the screen stack so it stays put
 * while sub-screens push and pop, exactly like the prototype.
 */
export function BottomNav() {
  const { tab } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { height: NAV_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}>
      {ITEMS.map(({ id, label, Icon, href }) => {
        const active = tab === id;
        const color = active ? Colors.navActive : Colors.navInactive;
        return (
          <Touch
            key={id}
            style={styles.item}
            onPress={() => router.replace(href as never)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={label}>
            <Icon size={21} color={color} width={1.74167} />
            <Text style={mono(7.5, 700, { ls: 0.04, color })} numberOfLines={1}>
              {label}
            </Text>
          </Touch>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineCard,
    backgroundColor: Colors.nav,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 3,
  },
  item: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
  },
});
