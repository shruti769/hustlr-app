import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

/** Show alerts as banners even while the app is open. */
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Asks for permission and saves this device's Expo push token for the signed-in
 * user. Returns the token, or null on web, simulators, a refusal, or before
 * the app has an EAS project id (`eas init`).
 */
export async function registerForPush(): Promise<string | null> {
  if (!supabase || Platform.OS === 'web' || !Device.isDevice) return null;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Deal alerts',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
    if (status !== 'granted') return null;
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await supabase.from('push_tokens').upsert({ token, platform: Platform.OS, updated_at: new Date().toISOString() });
    return token;
  } catch (e) {
    console.warn('[hustlr] push registration skipped', e);
    return null;
  }
}

/** Stops alerts to this device, e.g. on log out. */
export async function unregisterPush(token: string | null) {
  if (!supabase || !token) return;
  await supabase.from('push_tokens').delete().eq('token', token);
}

/** Where a tapped notification should take the user. */
export type PushTarget = { dealId?: number; screen?: string };

/** Calls `open` for alerts tapped now, and for the one that launched the app. */
export function onPushTap(open: (target: PushTarget) => void): () => void {
  if (Platform.OS === 'web') return () => {};
  const read = (r: Notifications.NotificationResponse | null) => {
    const data = r?.notification.request.content.data as Record<string, unknown> | undefined;
    if (!data) return;
    open({ dealId: data.dealId ? Number(data.dealId) : undefined, screen: data.screen as string | undefined });
  };
  Notifications.getLastNotificationResponseAsync().then(read);
  const sub = Notifications.addNotificationResponseReceivedListener(read);
  return () => sub.remove();
}
