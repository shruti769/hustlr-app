import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * The Supabase client, or `null` when no project is configured — the app then
 * runs on its built-in demo data so it stays usable without a backend.
 */
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          // Static web rendering runs without `window`; there is no session to keep there.
          storage: Platform.OS === 'web' && typeof window === 'undefined' ? undefined : AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          // Links back into the app (password reset, Google / Apple) are handled by the store.
          detectSessionInUrl: false,
          flowType: 'pkce',
        },
      })
    : null;

// Refresh tokens only while the app is in the foreground.
if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

export type SocialProvider = 'google' | 'apple';

/** Which social logins are switched on in the Supabase dashboard. */
export async function enabledProviders(): Promise<Record<SocialProvider, boolean>> {
  const none = { google: false, apple: false };
  if (!url || !anonKey) return none;
  try {
    const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: anonKey } });
    const body = await res.json();
    return { google: !!body?.external?.google, apple: !!body?.external?.apple };
  } catch {
    return none;
  }
}
