// Push notifications through Expo's push service, which delivers to both
// APNs (iPhone) and FCM (Android) from one API.

import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.118.0';

export type PushMessage = { title: string; body: string; data?: Record<string, unknown> };

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/** Sends one message to every device of the given users; drops tokens Expo says are dead. */
export async function pushToUsers(admin: SupabaseClient, userIds: string[], msg: PushMessage): Promise<number> {
  if (!userIds.length) return 0;
  const { data: rows } = await admin.from('push_tokens').select('token').in('user_id', userIds);
  const tokens = (rows ?? []).map((r) => r.token as string);
  let sent = 0;
  for (let i = 0; i < tokens.length; i += 100) {
    const batch = tokens.slice(i, i + 100);
    const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
    const accessToken = Deno.env.get('EXPO_ACCESS_TOKEN');
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(batch.map((to) => ({ to, sound: 'default', ...msg }))),
    });
    if (!res.ok) {
      console.warn(`expo push ${res.status}: ${(await res.text()).slice(0, 200)}`);
      continue;
    }
    const tickets = ((await res.json()).data ?? []) as { status: string; details?: { error?: string } }[];
    const dead = batch.filter((_, n) => tickets[n]?.details?.error === 'DeviceNotRegistered');
    if (dead.length) await admin.from('push_tokens').delete().in('token', dead);
    sent += tickets.filter((t) => t.status === 'ok').length;
  }
  return sent;
}
