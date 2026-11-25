import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { supabase, type SocialProvider } from '@/lib/supabase';

import { buyPlan, restorePlans, startBilling, stopBilling, type PaidPlan } from './billing';
import { onPushTap, registerForPush, unregisterPush } from './push';

import { PUZZLE, TAB_ROOTS, UPGRADE_DEFS, WHEEL, type CalcKey, type Screen } from './data';
import {
  DEMO_BOARD, DEMO_DEALS, DEMO_FLIPS, DEMO_INVENTORY, DEMO_NOTICES, DEMO_PROFILE, DEMO_PUZZLE, DEMO_STORE,
  DEMO_TRACKED, DEMO_TRENDS,
} from './demo';
import {
  initialsOf, invProfit, toBoard, toDeal as dealFromRow, toDeal, toFlip, toInv, toNotice, toPuzzle, toStoreItem, toTracked, toTrend,
  type Analysis, type BoardEntry, type ReportReason, type Deal, type Flip, type InvItem, type InvStatus, type Notice, type Profile, type ProfileRow,
  type Puzzle, type StoreItem, type Tracked, type Trend,
} from './model';

/** True when the app talks to Supabase; false runs on the prototype's demo data. */
export const LIVE = supabase !== null;

type State = {
  screen: Screen;
  tab: Screen;
  stack: Screen[];
  cat: string;
  dealId: number;
  calc: Record<CalcKey, number>;
  credits: number;
  /** Days in the current streak, today included once checked in. */
  streak: number;
  checkedIn: boolean;
  notified: boolean;
  guess: number;
  pawnCash: number;
  levels: Record<string, number>;
  spinsLeft: number;
  spinning: boolean;
  angle: number;
  spinResult: (typeof WHEEL)[number] | null;
  challengesOpen: boolean;
  owned: string[];

  userId: string | null;
  /** Email typed on one auth screen, carried to the next. */
  authEmail: string;
  /** Add form open on the Price Tracker. */
  trackForm: boolean;
  /** Link typed on Home, carried to the Analyser. */
  analyseUrl: string;
  /** One-off message for the login screen (expired link, account deleted…). */
  authNotice: string;
  /** Inventory item open on the item screen. */
  itemId: number | null;
  /** Remote data: `ready` once loaded, `error` when the last load failed. */
  dataStatus: 'idle' | 'loading' | 'ready' | 'error';
  profile: Profile;
  deals: Deal[];
  inventory: InvItem[];
  watchIds: number[];
  flips: Flip[];
  board: BoardEntry[];
  trends: Trend[];
  tracked: Tracked[];
  notices: Notice[];
  storeItems: StoreItem[];
  puzzle: Puzzle | null;
};

const EMPTY_PROFILE: Profile = {
  name: '', handle: '', email: '', region: '', plan: 'scout', memberSince: new Date().toISOString(), dealAlerts: true,
  flipRules: false,
};

const DEMO_DATA = {
  profile: DEMO_PROFILE, deals: DEMO_DEALS, inventory: DEMO_INVENTORY, watchIds: [1, 2, 3, 4], flips: DEMO_FLIPS,
  board: DEMO_BOARD, trends: DEMO_TRENDS, tracked: DEMO_TRACKED, notices: DEMO_NOTICES, storeItems: DEMO_STORE,
  puzzle: DEMO_PUZZLE,
};

const EMPTY_DATA = {
  profile: EMPTY_PROFILE, deals: [], inventory: [], watchIds: [], flips: [], board: [], trends: [], tracked: [],
  notices: [], storeItems: [], puzzle: null,
};

const INITIAL: State = {
  screen: 'splash', tab: 'deals', stack: [], cat: 'All', dealId: 1,
  calc: { buy: 120, sell: 330, ship: 18, other: 8, fee: 12.9 },
  credits: 340, streak: 4, checkedIn: false, notified: false,
  guess: 150,
  pawnCash: 210, levels: { polish: 1, case: 1, staff: 0, neon: 0 },
  spinsLeft: 3, spinning: false, angle: 0, spinResult: null, challengesOpen: false,
  owned: [],
  userId: null,
  authEmail: '',
  itemId: null,
  trackForm: false,
  analyseUrl: '',
  authNotice: '',
  dataStatus: LIVE ? 'idle' : 'ready',
  ...(LIVE ? EMPTY_DATA : DEMO_DATA),
};

const isRoot = (s: Screen) => (TAB_ROOTS as readonly string[]).includes(s);

/** Credits paid out for a Price It Right guess (demo mode; the server decides when live). */
export const guessReward = (guess: number, actual = PUZZLE.actual) => {
  const diff = Math.abs(guess - actual);
  return diff <= 5 ? 100 : diff <= 20 ? 40 : diff <= 50 ? 10 : 0;
};

const pawnClickOf = (levels: Record<string, number>) =>
  1 + UPGRADE_DEFS.reduce((n, u) => n + u.click * (levels[u.key] || 0), 0);
const pawnRateOf = (levels: Record<string, number>) =>
  UPGRADE_DEFS.reduce((n, u) => n + u.tick * (levels[u.key] || 0), 0);

const utcDay = (offsetDays = 0) => new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);

/** The arcade + profile slice of state, from a `profiles` row. */
function fromProfileRow(r: ProfileRow, email: string): Partial<State> {
  const checkedIn = r.last_check_in === utcDay();
  const alive = checkedIn || r.last_check_in === utcDay(-1);
  return {
    credits: r.credits,
    streak: alive ? r.streak : 0,
    checkedIn,
    spinsLeft: r.spins_left,
    pawnCash: r.pawn_cash,
    levels: r.pawn_levels,
    owned: r.owned,
    profile: {
      name: r.full_name || email.split('@')[0],
      handle: r.handle ?? '',
      email,
      region: r.region,
      plan: r.plan,
      memberSince: r.created_at,
      dealAlerts: r.deal_alerts ?? true,
      flipRules: !!r.flip_terms_at,
    },
  };
}

async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase!.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

const must = <T,>(res: { data: T | null; error: { message: string } | null }): T => {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
};

/** Auth errors in plain words; network failures read as such. */
const friendly = (msg: string) =>
  /fetch|network/i.test(msg) ? "Can't reach the server — check your connection and try again." : msg;

export type AddDraft = {
  dealId: number | null; name: string; category: string; condition: string; sizeSpec: string;
  buy: number; list: number; platforms: string[]; status: InvStatus;
  /** Local image picked on the device, uploaded after the item is saved. */
  photoUri?: string | null;
};

export type InvPatch = Partial<Pick<InvItem,
  'name' | 'category' | 'condition' | 'sizeSpec' | 'notes' | 'buy' | 'list' | 'status' | 'soldPrice'>>;

const PHOTO_BUCKET = 'inventory-photos';

/** Deep link back into the app, e.g. `hustlrapp://?flow=reset` (or the dev / web equivalent). */
const appLink = (flow: 'reset' | 'oauth') => Linking.createURL('/', { queryParams: { flow } });

/** Query and fragment parameters of a link, merged. */
function linkParams(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  const parts = url.split(/[?#]/).slice(1);
  for (const part of parts) {
    for (const pair of part.split('&')) {
      const [k, v = ''] = pair.split('=');
      if (k) out[decodeURIComponent(k)] = decodeURIComponent(v);
    }
  }
  return out;
}

/** Uploads a picked image to `<user>/<item>-<time>.<ext>` and returns its path and a signed URL. */
async function uploadPhoto(userId: string, itemId: number, uri: string) {
  if (!supabase) return null;
  try {
    const res = await fetch(uri);
    const blob = await res.blob();
    const type = blob.type || 'image/jpeg';
    const ext = type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const path = `${userId}/${itemId}-${Date.now()}.${ext}`;
    const body = await new Response(blob).arrayBuffer();
    const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, body, { contentType: type, upsert: false });
    if (error) throw error;
    const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
    return { path, url: data?.signedUrl ?? null };
  } catch (e) {
    console.warn('[hustlr] photo upload failed', e);
    return null;
  }
}

/** Maps inventory rows, swapping stored photo paths for signed URLs. */
async function withPhotos(rows: any[]): Promise<InvItem[]> {
  const paths = rows.map((r) => r.photo_path).filter(Boolean) as string[];
  const urls: Record<string, string> = {};
  if (supabase && paths.length) {
    const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, 60 * 60 * 24 * 7);
    for (const u of data ?? []) if (u.path && u.signedUrl) urls[u.path] = u.signedUrl;
  }
  return rows.map((r) => toInv(r, r.photo_path ? urls[r.photo_path] : null));
}

function useHustlrState() {
  const [st, setSt] = useState(INITIAL);
  const ref = useRef(st);
  ref.current = st;
  const set = useCallback((patch: Partial<State> | ((s: State) => Partial<State>)) => {
    setSt((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));
  }, []);

  const go = useCallback((screen: Screen) => {
    set((s) => {
      if (s.screen === screen) return {};
      if (isRoot(screen)) return { screen, tab: screen, stack: [] };
      return { screen, stack: [...s.stack, s.screen] };
    });
  }, [set]);

  const back = useCallback(() => {
    set((s) => {
      const stack = s.stack.slice();
      const prev = stack.pop() ?? s.tab;
      return { screen: prev, stack };
    });
  }, [set]);

  // ───────────────────────────────────────────────────────── loading

  const loadAll = useCallback(async (userId: string, email: string) => {
    if (!supabase) return;
    const db = supabase;
    set({ dataStatus: 'loading' });
    try {
      const [profile, deals, inventory, watch, flips, board, trends, tracked, notices, store, puzzle] = await Promise.all([
        rpc<ProfileRow>('arcade_state'),
        db.from('deals').select('*').order('score', { ascending: false }).order('id').then(must),
        db.from('inventory_items').select('*').order('created_at', { ascending: false }).then(must),
        db.from('watchlist').select('deal_id').order('created_at').then(must),
        db.from('flips').select('*').order('created_at', { ascending: false }).then(must),
        db.from('leaderboard_entries').select('*').order('profit', { ascending: false }).then(must),
        db.from('market_trends').select('*').order('sort').then(must),
        db.from('tracked_items').select('*').order('id').then(must),
        db.from('notifications').select('*').order('created_at', { ascending: false }).then(must),
        db.from('store_items').select('*').order('sort').then(must),
        rpc<Record<string, unknown> | null>('current_puzzle'),
      ]);
      const dealList = (deals as any[]).map(toDeal);
      const pz = puzzle ? toPuzzle(puzzle) : null;
      set({
        userId,
        ...fromProfileRow(profile, email),
        deals: dealList,
        dealId: dealList[0]?.id ?? 0,
        inventory: await withPhotos(inventory as any[]),
        watchIds: (watch as any[]).map((w) => w.deal_id),
        flips: (flips as any[]).map(toFlip),
        board: (board as any[]).map(toBoard),
        trends: (trends as any[]).map(toTrend),
        tracked: (tracked as any[]).map(toTracked),
        notices: (notices as any[]).map(toNotice),
        storeItems: (store as any[]).map(toStoreItem),
        puzzle: pz,
        guess: pz?.guess ?? 150,
        dataStatus: 'ready',
      });
    } catch (e) {
      // An admin suspended this account: sign out and say why.
      if (/account suspended/i.test(e instanceof Error ? e.message : String(e))) {
        await db.auth.signOut();
        set({
          ...EMPTY_DATA, userId: null, dataStatus: 'idle', screen: 'login', stack: [],
          authNotice: 'This account has been suspended. Contact support if you think this is a mistake.',
        });
        return;
      }
      console.warn('[hustlr] failed to load data', e);
      set({ dataStatus: 'error' });
    }
  }, [set]);

  // Restore a saved session and follow sign-in / sign-out.
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) {
        set({ userId: u.id });
        loadAll(u.id, u.email ?? '');
      }
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        set({ ...EMPTY_DATA, userId: null, dataStatus: 'idle' });
      }
    });
    return () => data.subscription.unsubscribe();
  }, [set, loadAll]);

  // ──────────────────────────────────────────── push, live updates

  const pushToken = useRef<string | null>(null);

  useEffect(() => {
    if (!LIVE || !st.userId || st.dataStatus !== 'ready') return;
    startBilling(st.userId).catch((e) => console.warn('[hustlr] billing setup failed', e));
    if (!pushToken.current) registerForPush().then((t) => { pushToken.current = t; });
  }, [st.userId, st.dataStatus]);

  // New and re-scored deals, and this user's notifications, arrive without a refresh.
  useEffect(() => {
    if (!supabase || !st.userId) return;
    const db = supabase;
    const channel = db.channel(`hustlr-${st.userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, (payload) => {
        const row = payload.new as Record<string, any>;
        if (!row?.id) return;
        set((s) => {
          const rest = s.deals.filter((d) => d.id !== row.id);
          if (!row.is_active) return { deals: rest };
          return { deals: [...rest, dealFromRow(row)].sort((a, b) => b.score - a.score || a.id - b.id) };
        });
      })
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${st.userId}` },
        (payload) => set((s) => ({ notices: [toNotice(payload.new), ...s.notices.filter((n) => n.id !== payload.new.id)] })))
      .subscribe();
    return () => { db.removeChannel(channel); };
  }, [st.userId, set]);

  // ────────────────────────────────────────────────────────────── auth

  /**
   * `noAccount` is set when the email has never signed up, so the screen can
   * point the user to Create account instead of blaming the password.
   */
  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string; noAccount?: boolean }> => {
    if (!supabase) { go('deals'); return {}; }
    const db = supabase;
    const { data, error } = await db.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      if (/email not confirmed/i.test(error.message)) {
        return { error: 'Confirm your email first — open the link we sent to your inbox.' };
      }
      if (/invalid login credentials/i.test(error.message)) {
        const { data: exists, error: lookupError } = await db.rpc('account_exists', { p_email: email.trim() });
        if (!lookupError && exists === false) {
          return { error: 'No account found with this email. Create an account first.', noAccount: true };
        }
        if (!lookupError && exists === true) {
          return { error: 'Wrong password. Try again or reset it below.' };
        }
        return { error: 'Email or password is incorrect. New here? Create an account first.', noAccount: true };
      }
      return { error: friendly(error.message) };
    }
    await loadAll(data.user.id, data.user.email ?? email);
    go('deals');
    return {};
  }, [go, loadAll]);

  /** Returns an error, or an info message when the email still has to be confirmed. */
  const signUp = useCallback(async (name: string, email: string, password: string): Promise<{ error?: string; info?: string }> => {
    if (!supabase) { go('deals'); return {}; }
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(), password, options: { data: { full_name: name.trim() } },
    });
    if (error) {
      return /already registered|already exists/i.test(error.message)
        ? { error: 'An account with this email already exists. Log in instead.' }
        : { error: friendly(error.message) };
    }
    // With email confirmation on, Supabase answers a repeat sign-up with a user that has no identities.
    if (data.user && data.user.identities?.length === 0) {
      return { error: 'An account with this email already exists. Log in instead.' };
    }
    if (!data.session || !data.user) return { info: 'Check your inbox to confirm your email, then log in.' };
    await loadAll(data.user.id, data.user.email ?? email);
    go('deals');
    return {};
  }, [go, loadAll]);

  const resetPassword = useCallback(async (email: string): Promise<{ error?: string; info?: string }> => {
    if (!supabase) return { info: 'Reset link sent — check your inbox.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: appLink('reset') });
    if (error) return { error: friendly(error.message) };
    return { info: 'Reset link sent — check your inbox.' };
  }, []);

  const goLogin = useCallback(() => set({ screen: 'login', stack: [] }), [set]);

  /**
   * Links back into the app carry a one-time `code` (PKCE). A `flow=reset`
   * link opens the new-password screen; `flow=oauth` finishes Google / Apple.
   */
  const handleAuthLink = useCallback(async (url: string | null) => {
    if (!supabase || !url) return false;
    const params = linkParams(url);
    if (!params.flow && !params.code && !params.error_description) return false;
    if (Platform.OS === 'web' && typeof window !== 'undefined') window.history.replaceState(null, '', '/');
    if (params.error_description) {
      set({ screen: 'login', stack: [], authNotice: params.error_description.replace(/\+/g, ' ') });
      return true;
    }
    if (!params.code) return false;
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error || !data.user) {
      set({ screen: 'login', stack: [], authNotice: 'That link has expired. Request a new one.' });
      return true;
    }
    if (params.flow === 'reset') {
      set({ userId: data.user.id, screen: 'newpass', stack: [] });
      return true;
    }
    await loadAll(data.user.id, data.user.email ?? '');
    set({ screen: 'deals', tab: 'deals', stack: [] });
    return true;
  }, [set, loadAll]);

  useEffect(() => {
    if (!supabase) return;
    Linking.getInitialURL().then(handleAuthLink);
    const sub = Linking.addEventListener('url', ({ url }) => { handleAuthLink(url); });
    return () => sub.remove();
  }, [handleAuthLink]);

  /** Google / Apple sign-in through the provider's own page. */
  const signInWith = useCallback(async (provider: SocialProvider): Promise<string | null> => {
    if (!supabase) return null;
    const redirectTo = appLink('oauth');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider, options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) return friendly(error?.message ?? 'Could not start sign-in.');
    if (Platform.OS === 'web') {
      window.location.assign(data.url);
      return null;
    }
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'success') await handleAuthLink(result.url);
    return null;
  }, [handleAuthLink]);

  /** Sets a new password — after a reset link, or from Settings. */
  const setNewPassword = useCallback(async (password: string): Promise<string | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) return friendly(error.message);
    if (ref.current.screen === 'newpass') {
      await loadAll(data.user.id, data.user.email ?? '');
      set({ screen: 'deals', tab: 'deals', stack: [] });
    }
    return null;
  }, [set, loadAll]);

  const updateProfile = useCallback(async (patch: { name: string; region: string }): Promise<string | null> => {
    const name = patch.name.trim();
    if (!name) return 'Add your name.';
    set((s) => ({ profile: { ...s.profile, name, region: patch.region.trim() } }));
    if (!supabase) return null;
    const { error } = await supabase.from('profiles')
      .update({ full_name: name, region: patch.region.trim() })
      .eq('id', ref.current.userId!);
    return error ? friendly(error.message) : null;
  }, [set]);

  /** Permanently removes the account, its photos and all its data. */
  const deleteAccount = useCallback(async (): Promise<string | null> => {
    if (!supabase) { set({ screen: 'login', stack: [] }); return null; }
    const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
    if (error) return "Couldn't delete your account right now. Try again in a moment.";
    await supabase.auth.signOut({ scope: 'local' });
    set({ ...EMPTY_DATA, userId: null, dataStatus: 'idle', screen: 'login', stack: [], authNotice: 'Your account has been deleted.' });
    return null;
  }, [set]);

  const signOut = useCallback(async () => {
    if (supabase) {
      await unregisterPush(pushToken.current);
      pushToken.current = null;
      await stopBilling();
      await supabase.auth.signOut();
    }
    goLogin();
  }, [goLogin]);

  /** Leaving the splash: straight to deals when a session was restored. */
  const enter = useCallback(() => {
    if (ref.current.screen !== 'splash') return;
    go(LIVE && ref.current.userId ? 'deals' : 'login');
  }, [go]);

  // ─────────────────────────────────────────────────────── pawn empire

  const pawnRate = pawnRateOf(st.levels);
  const pawnClick = pawnClickOf(st.levels);
  /** Cash earned locally and not yet confirmed by the server. */
  const pawnPending = useRef(0);

  const flushPawn = useCallback(async () => {
    if (!supabase) return;
    const earned = pawnPending.current;
    pawnPending.current = 0;
    try {
      const row = await rpc<ProfileRow>('pawn_sync', { p_earned: earned });
      set({ pawnCash: row.pawn_cash + pawnPending.current, levels: row.pawn_levels });
    } catch (e) {
      pawnPending.current += earned;
      console.warn('[hustlr] pawn sync failed', e);
    }
  }, [set]);

  // The shop only earns while you are standing in it, once a second.
  useEffect(() => {
    if (st.screen !== 'pawn') return;
    const tick = setInterval(() => {
      const rate = pawnRateOf(ref.current.levels);
      if (rate <= 0) return;
      pawnPending.current += rate;
      set((s) => ({ pawnCash: s.pawnCash + rate }));
    }, 1000);
    const sync = LIVE ? setInterval(flushPawn, 5000) : null;
    return () => {
      clearInterval(tick);
      if (sync) clearInterval(sync);
      if (LIVE) flushPawn();
    };
  }, [st.screen, set, flushPawn]);

  // ──────────────────────────────────────────────────────── prize spin

  const spinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (spinTimer.current) clearTimeout(spinTimer.current); }, []);

  const spin = useCallback(async () => {
    const s = ref.current;
    if (s.spinning || s.spinsLeft < 1) return;
    set({ spinning: true, spinResult: null });

    let idx = 0;
    let after: Partial<State>;
    if (LIVE) {
      try {
        const res = await rpc<{ index: number; profile: ProfileRow }>('spin_wheel');
        idx = res.index;
        after = { spinsLeft: res.profile.spins_left, credits: res.profile.credits };
      } catch (e) {
        console.warn('[hustlr] spin failed', e);
        set({ spinning: false });
        return;
      }
    } else {
      const total = WHEEL.reduce((n, w) => n + w.weight, 0);
      let roll = Math.random() * total;
      for (let i = 0; i < WHEEL.length; i++) { roll -= WHEEL[i].weight; if (roll <= 0) { idx = i; break; } }
      after = { spinsLeft: s.spinsLeft - 1, credits: s.credits + (WHEEL[idx].value || 0) };
    }

    const seg = 360 / WHEEL.length;
    set((x) => ({ angle: x.angle + 360 * 6 - (idx * seg + seg / 2) }));
    spinTimer.current = setTimeout(() => set({ spinning: false, spinResult: WHEEL[idx], ...after }), 3500);
  }, [set]);

  // ──────────────────────────────────────────────────── arcade actions

  const checkIn = useCallback(async () => {
    const s = ref.current;
    if (s.checkedIn) return;
    if (!LIVE) {
      set({ checkedIn: true, streak: s.streak + 1, credits: s.credits + 10, spinsLeft: s.spinsLeft + 1 });
      return;
    }
    try {
      const row = await rpc<ProfileRow>('check_in');
      set(fromProfileRow(row, s.profile.email));
    } catch (e) {
      console.warn('[hustlr] check-in failed', e);
    }
  }, [set]);

  const submitGuess = useCallback(async () => {
    const s = ref.current;
    if (!s.puzzle || s.puzzle.guess != null) return;
    if (!LIVE) {
      const reward = guessReward(s.guess);
      set({ credits: s.credits + reward, puzzle: { ...s.puzzle, guess: s.guess, reward, actual: PUZZLE.actual } });
      return;
    }
    try {
      const res = await rpc<{ reward: number; actual: number; guess: number; profile: ProfileRow }>('submit_guess', { p_guess: s.guess });
      set((x) => ({
        credits: res.profile.credits,
        puzzle: x.puzzle && { ...x.puzzle, guess: res.guess, reward: res.reward, actual: res.actual },
      }));
    } catch (e) {
      console.warn('[hustlr] guess failed', e);
    }
  }, [set]);

  const buyUpgrade = useCallback(async (key: string, cost: number) => {
    const s = ref.current;
    if (s.pawnCash < cost) return;
    if (!LIVE) {
      set({ pawnCash: s.pawnCash - cost, levels: { ...s.levels, [key]: (s.levels[key] || 0) + 1 } });
      return;
    }
    await flushPawn();
    try {
      const row = await rpc<ProfileRow>('buy_upgrade', { p_key: key });
      set({ pawnCash: row.pawn_cash + pawnPending.current, levels: row.pawn_levels });
    } catch (e) {
      console.warn('[hustlr] upgrade failed', e);
    }
  }, [set, flushPawn]);

  const cashOut = useCallback(async () => {
    const s = ref.current;
    if (s.pawnCash < 1000) return;
    if (!LIVE) {
      set({ pawnCash: s.pawnCash - 1000, credits: s.credits + 100 });
      return;
    }
    await flushPawn();
    try {
      const row = await rpc<ProfileRow>('pawn_cash_out');
      set({ pawnCash: row.pawn_cash + pawnPending.current, credits: row.credits });
    } catch (e) {
      console.warn('[hustlr] cash out failed', e);
    }
  }, [set, flushPawn]);

  const buyItem = useCallback(async (key: string, cost: number) => {
    const s = ref.current;
    if (s.owned.includes(key) || s.credits < cost) return;
    if (!LIVE) {
      set({ credits: s.credits - cost, owned: [...s.owned, key] });
      return;
    }
    try {
      const row = await rpc<ProfileRow>('buy_store_item', { p_key: key });
      set({ credits: row.credits, owned: row.owned });
    } catch (e) {
      console.warn('[hustlr] purchase failed', e);
    }
  }, [set]);

  // ─────────────────────────────────────────────────────── user data

  /** Saves or unsaves a deal (the Hold Pile). Returns an error message, if any. */
  const toggleWatch = useCallback(async (dealId: number): Promise<string | null> => {
    const watching = ref.current.watchIds.includes(dealId);
    const flip = (on: boolean) => set((s) => ({
      watchIds: on ? [...s.watchIds.filter((x) => x !== dealId), dealId] : s.watchIds.filter((x) => x !== dealId),
    }));
    flip(!watching);
    if (!supabase) return null;
    const { error } = watching
      ? await supabase.from('watchlist').delete().eq('deal_id', dealId)
      : await supabase.from('watchlist').insert({ deal_id: dealId });
    if (error) {
      flip(watching);
      console.warn('[hustlr] watchlist update failed', error.message);
      return error.message;
    }
    return null;
  }, [set]);

  const addInventory = useCallback(async (d: AddDraft): Promise<string | null> => {
    if (!d.name.trim()) return 'Give the item a name.';
    const sku = (d.name.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 3)
      .map((w) => w.slice(0, 3).toUpperCase()).join('-') || 'ITEM') + '-' + String(Math.floor(Math.random() * 90) + 10);
    const deal = ref.current.deals.find((x) => x.id === d.dealId);
    if (!supabase) {
      const item: InvItem = {
        id: Date.now(), dealId: d.dealId, name: d.name, sku, category: d.category, condition: d.condition,
        sizeSpec: d.sizeSpec, notes: '', buy: d.buy, list: d.list, status: d.status, soldPrice: null,
        img: d.photoUri ? { uri: d.photoUri } : deal?.img ?? null, photoPath: null,
        createdAt: new Date().toISOString(), soldAt: null,
      };
      set((s) => ({ inventory: [item, ...s.inventory] }));
      return null;
    }
    const { data, error } = await supabase.from('inventory_items').insert({
      deal_id: d.dealId, name: d.name.trim(), sku, category: d.category, condition: d.condition, size_spec: d.sizeSpec,
      buy_price: d.buy, list_price: d.list, status: d.status, platforms: d.platforms,
      image_key: deal?.imageKey ?? null,
    }).select().single();
    if (error) return friendly(error.message);
    let row = data;
    let photoUrl: string | null = null;
    if (d.photoUri) {
      const up = await uploadPhoto(ref.current.userId!, data.id, d.photoUri);
      if (up) {
        const { data: withPhoto } = await supabase.from('inventory_items')
          .update({ photo_path: up.path }).eq('id', data.id).select().single();
        if (withPhoto) { row = withPhoto; photoUrl = up.url; }
      }
    }
    set((s) => ({ inventory: [toInv(row, photoUrl), ...s.inventory] }));
    return null;
  }, [set]);

  const openItem = useCallback((id: number) => { set({ itemId: id }); go('item'); }, [set, go]);

  /** Edits an item; marking it Sold records the sale price (defaults to the listing price). */
  const updateInventory = useCallback(async (id: number, patch: InvPatch): Promise<string | null> => {
    const before = ref.current.inventory.find((i) => i.id === id);
    if (!before) return 'Item not found.';
    const next: InvItem = { ...before, ...patch };
    if (next.status === 'Sold') {
      next.soldPrice = patch.soldPrice ?? before.soldPrice ?? next.list;
      next.soldAt = before.soldAt ?? new Date().toISOString();
    } else {
      next.soldPrice = null;
      next.soldAt = null;
    }
    set((s) => ({ inventory: s.inventory.map((i) => (i.id === id ? next : i)) }));
    if (!supabase) return null;
    const { error } = await supabase.from('inventory_items').update({
      name: next.name, category: next.category, condition: next.condition, size_spec: next.sizeSpec, notes: next.notes,
      buy_price: next.buy, list_price: next.list, status: next.status, sold_price: next.soldPrice,
    }).eq('id', id);
    if (error) {
      set((s) => ({ inventory: s.inventory.map((i) => (i.id === id ? before : i)) }));
      return friendly(error.message);
    }
    return null;
  }, [set]);

  const deleteInventory = useCallback(async (id: number): Promise<string | null> => {
    const before = ref.current.inventory;
    const item = before.find((i) => i.id === id);
    set((s) => ({ inventory: s.inventory.filter((i) => i.id !== id) }));
    if (!supabase) return null;
    const { error } = await supabase.from('inventory_items').delete().eq('id', id);
    if (error) {
      set({ inventory: before });
      return friendly(error.message);
    }
    if (item?.photoPath) await supabase.storage.from(PHOTO_BUCKET).remove([item.photoPath]);
    return null;
  }, [set]);

  /** Replaces an item's photo with one picked on the device. */
  const setInventoryPhoto = useCallback(async (id: number, uri: string): Promise<string | null> => {
    const item = ref.current.inventory.find((i) => i.id === id);
    if (!item) return 'Item not found.';
    if (!supabase) {
      set((s) => ({ inventory: s.inventory.map((i) => (i.id === id ? { ...i, img: { uri } } : i)) }));
      return null;
    }
    const up = await uploadPhoto(ref.current.userId!, id, uri);
    if (!up) return "Couldn't upload the photo. Try again.";
    const { error } = await supabase.from('inventory_items').update({ photo_path: up.path }).eq('id', id);
    if (error) return friendly(error.message);
    if (item.photoPath) await supabase.storage.from(PHOTO_BUCKET).remove([item.photoPath]);
    set((s) => ({
      inventory: s.inventory.map((i) => (i.id === id ? { ...i, photoPath: up.path, img: up.url ? { uri: up.url } : i.img } : i)),
    }));
    return null;
  }, [set]);

  /** Scores a shared listing link (or a typed title and price) on the server. */
  const analyseListing = useCallback(async (input: { url?: string; title?: string; price?: number }):
    Promise<{ result?: Analysis; error?: string }> => {
    if (!supabase) return { error: 'Connect Supabase to analyse real listings.' };
    const { data, error } = await supabase.functions.invoke('analyse-listing', { body: input });
    if (error) {
      let message = "Couldn't analyse that listing. Try again.";
      try {
        const body = await (error as { context?: Response }).context?.json();
        if (body?.error) message = body.error;
      } catch {
        // keep the generic message
      }
      return { error: message };
    }
    return { result: data as Analysis };
  }, []);

  /** Marks every notification read — called when the list is opened. */
  const markNoticesRead = useCallback(async () => {
    if (!ref.current.notices.some((n) => !n.read)) return;
    set((s) => ({ notices: s.notices.map((n) => ({ ...n, read: true })) }));
    if (supabase) await supabase.from('notifications').update({ read: true }).eq('read', false);
  }, [set]);

  const setDealAlerts = useCallback(async (on: boolean): Promise<string | null> => {
    set((s) => ({ profile: { ...s.profile, dealAlerts: on } }));
    if (!supabase) return null;
    const { error } = await supabase.from('profiles').update({ deal_alerts: on }).eq('id', ref.current.userId!);
    if (error) {
      set((s) => ({ profile: { ...s.profile, dealAlerts: !on } }));
      return friendly(error.message);
    }
    return null;
  }, [set]);

  /** Watches an item's resale price; the tracker job refreshes it every 30 minutes. */
  const addTracked = useCallback(async (name: string, target: number, now = 0): Promise<string | null> => {
    if (!name.trim()) return 'Name the item to track.';
    if (!(target > 0)) return 'Set the price you want to sell at.';
    if (!supabase) {
      set((s) => ({ tracked: [...s.tracked, { id: Date.now(), name: name.trim(), now, target, change: 0 }], trackForm: false }));
      return null;
    }
    const { data, error } = await supabase.from('tracked_items')
      .insert({ name: name.trim(), target_price: target, now_price: now }).select().single();
    if (error) return friendly(error.message);
    set((s) => ({ tracked: [...s.tracked, toTracked(data)], trackForm: false }));
    return null;
  }, [set]);

  const removeTracked = useCallback(async (id: number) => {
    const before = ref.current.tracked;
    set((s) => ({ tracked: s.tracked.filter((t) => t.id !== id) }));
    if (!supabase) return;
    const { error } = await supabase.from('tracked_items').delete().eq('id', id);
    if (error) set({ tracked: before });
  }, [set]);

  /** Buys a plan in the App Store / Play Store; the server learns of it from RevenueCat. */
  const upgradePlan = useCallback(async (plan: PaidPlan): Promise<{ error?: string; info?: string }> => {
    if (!LIVE) return { info: 'Connect Supabase and RevenueCat to sell plans.' };
    const res = await buyPlan(plan);
    if (res.cancelled) return {};
    if (res.error) return { error: res.error };
    if (res.plan) set((s) => ({ profile: { ...s.profile, plan: res.plan! } }));
    return { info: `You're on ${plan === 'mogul' ? 'Mogul' : 'Hustler'} — welcome aboard.` };
  }, [set]);

  const restorePurchases = useCallback(async (): Promise<{ error?: string; info?: string }> => {
    const res = await restorePlans();
    if (res.error) return { error: res.error };
    if (res.plan) set((s) => ({ profile: { ...s.profile, plan: res.plan! } }));
    return { info: res.plan === 'scout' ? 'No active subscription found.' : 'Purchases restored.' };
  }, [set]);

  const acceptFlipRules = useCallback(async (): Promise<string | null> => {
    set((s) => ({ profile: { ...s.profile, flipRules: true } }));
    if (!supabase) return null;
    const { error } = await supabase.from('profiles').update({ flip_terms_at: new Date().toISOString() }).eq('id', ref.current.userId!);
    return error ? friendly(error.message) : null;
  }, [set]);

  /** Shares a sold flip to the Flip Tok feed. Author details come from the profile, server-side. */
  const postFlip = useCallback(async (f: { bought: number; sold: number; copy: string; imageKey: string | null }): Promise<string | null> => {
    if (!supabase) return 'Connect Supabase to post on Flip Tok.';
    const { data, error } = await supabase.from('flips').insert({
      bought: f.bought, sold: f.sold, copy: f.copy.trim(), image_key: f.imageKey,
      author_name: '', handle: '', initials: '',
    }).select().single();
    if (error) return friendly(error.message);
    set((s) => ({ flips: [toFlip(data), ...s.flips] }));
    return null;
  }, [set]);

  /** Reports a post; it disappears for the reporter straight away. */
  const reportFlip = useCallback(async (id: number, reason: ReportReason): Promise<string | null> => {
    set((s) => ({ flips: s.flips.filter((f) => f.id !== id) }));
    if (!supabase) return null;
    const { error } = await supabase.from('flip_reports').insert({ flip_id: id, reason });
    return error && error.code !== '23505' ? friendly(error.message) : null;
  }, [set]);

  const blockAuthor = useCallback(async (userId: string): Promise<string | null> => {
    set((s) => ({ flips: s.flips.filter((f) => f.userId !== userId) }));
    if (!supabase) return null;
    const { error } = await supabase.from('blocked_users').insert({ blocked_id: userId });
    return error && error.code !== '23505' ? friendly(error.message) : null;
  }, [set]);

  const deleteFlip = useCallback(async (id: number) => {
    set((s) => ({ flips: s.flips.filter((f) => f.id !== id) }));
    if (supabase) await supabase.from('flips').delete().eq('id', id);
  }, [set]);

  /** Re-fetch everything for the signed-in user. */
  const reload = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getUser();
    if (data.user) await loadAll(data.user.id, data.user.email ?? '');
  }, [loadAll]);

  const actions = useMemo(() => ({
    set, go, back, reload, enter, goLogin, signIn, signUp, resetPassword, signOut,
    signInWith, setNewPassword, updateProfile, deleteAccount,
    spin, checkIn, submitGuess, buyUpgrade, cashOut, buyItem, toggleWatch,
    addInventory, openItem, updateInventory, deleteInventory, setInventoryPhoto, analyseListing,
    markNoticesRead, setDealAlerts, addTracked, removeTracked,
    upgradePlan, restorePurchases, acceptFlipRules, postFlip, reportFlip, blockAuthor, deleteFlip,
    openDeal: (id: number) => { set({ dealId: id }); go('detail'); },
    openFeatured: async () => {
      const s = ref.current;
      if (s.spinsLeft > 0) return go('spin');
      if (!s.checkedIn) { await checkIn(); go('spin'); }
    },
    hustle: () => {
      const click = pawnClickOf(ref.current.levels);
      pawnPending.current += click;
      set((s) => ({ pawnCash: s.pawnCash + click }));
    },
  }), [
    set, go, back, reload, enter, goLogin, signIn, signUp, resetPassword, signOut,
    signInWith, setNewPassword, updateProfile, deleteAccount,
    spin, checkIn, submitGuess, buyUpgrade, cashOut, buyItem, toggleWatch,
    addInventory, openItem, updateInventory, deleteInventory, setInventoryPhoto, analyseListing,
    markNoticesRead, setDealAlerts, addTracked, removeTracked,
    upgradePlan, restorePurchases, acceptFlipRules, postFlip, reportFlip, blockAuthor, deleteFlip,
  ]);

  // A tapped alert opens its deal (or the tracker) once the user is signed in.
  useEffect(() => onPushTap(({ dealId, screen }) => {
    if (!ref.current.userId) return;
    if (dealId) actions.openDeal(dealId);
    else if (screen === 'tracker') go('tracker');
  }), [actions, go]);

  const deal = st.deals.find((d) => d.id === st.dealId) ?? st.deals[0] ?? null;
  const item = st.inventory.find((i) => i.id === st.itemId) ?? null;
  const me = useMemo(() => myStats(st), [st]);

  return { st, deal, item, me, pawnRate, pawnClick, ...actions };
}

/** Figures derived from the signed-in user's inventory. */
function myStats(st: State) {
  const sold = st.inventory.filter((i) => i.status === 'Sold');
  const lifetime = sold.reduce((n, i) => n + invProfit(i), 0);
  const avgRoi = sold.length
    ? Math.round(sold.reduce((n, i) => n + (i.buy > 0 ? invProfit(i) / i.buy : 0), 0) / sold.length * 100)
    : null;
  const board = LIVE
    ? [...st.board, {
        initials: initialsOf(st.profile.name), name: 'You', handle: st.profile.handle,
        profit: lifetime, streakDays: st.streak, me: true,
      }].sort((a, b) => b.profit - a.profit)
    : st.board;
  const rank = board.findIndex((b) => b.me) + 1;
  return { sold, lifetime, avgRoi, board, rank };
}

type Store = ReturnType<typeof useHustlrState>;
const Ctx = createContext<Store | null>(null);

export function HustlrProvider({ children }: { children: ReactNode }) {
  const store = useHustlrState();
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useHustlr() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useHustlr outside HustlrProvider');
  return v;
}

export const isTabRoot = isRoot;
