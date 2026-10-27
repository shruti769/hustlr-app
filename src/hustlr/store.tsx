import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';

import { PUZZLE, TAB_ROOTS, UPGRADE_DEFS, WHEEL, type CalcKey, type Screen } from './data';
import {
  DEMO_BOARD, DEMO_DEALS, DEMO_FLIPS, DEMO_INVENTORY, DEMO_NOTICES, DEMO_PROFILE, DEMO_PUZZLE, DEMO_STORE,
  DEMO_TRACKED, DEMO_TRENDS,
} from './demo';
import {
  initialsOf, toBoard, toDeal, toFlip, toInv, toNotice, toPuzzle, toStoreItem, toTracked, toTrend,
  type BoardEntry, type Deal, type Flip, type InvItem, type InvStatus, type Notice, type Profile, type ProfileRow,
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

const EMPTY_PROFILE: Profile = { name: '', handle: '', email: '', region: '', plan: 'scout', memberSince: new Date().toISOString() };

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
  credits: 340, streak: 3, checkedIn: false, notified: false,
  guess: 150,
  pawnCash: 210, levels: { polish: 1, case: 1, staff: 0, neon: 0 },
  spinsLeft: 3, spinning: false, angle: 0, spinResult: null, challengesOpen: false,
  owned: [],
  userId: null,
  authEmail: '',
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
};

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
        db.from('deals').select('*').order('id').then(must),
        db.from('inventory_items').select('*').order('created_at', { ascending: false }).then(must),
        db.from('watchlist').select('deal_id').order('created_at').then(must),
        db.from('flips').select('*').order('id').then(must),
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
        inventory: (inventory as any[]).map(toInv),
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
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) return { error: friendly(error.message) };
    return { info: 'Reset link sent — check your inbox.' };
  }, []);

  const goLogin = useCallback(() => set({ screen: 'login', stack: [] }), [set]);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
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

  const toggleWatch = useCallback(async (dealId: number) => {
    const watching = ref.current.watchIds.includes(dealId);
    const flip = (on: boolean) => set((s) => ({
      watchIds: on ? [...s.watchIds.filter((x) => x !== dealId), dealId] : s.watchIds.filter((x) => x !== dealId),
    }));
    flip(!watching);
    if (!supabase) return;
    const { error } = watching
      ? await supabase.from('watchlist').delete().eq('deal_id', dealId)
      : await supabase.from('watchlist').insert({ deal_id: dealId });
    if (error) {
      flip(watching);
      console.warn('[hustlr] watchlist update failed', error.message);
    }
  }, [set]);

  const addInventory = useCallback(async (d: AddDraft): Promise<string | null> => {
    if (!d.name.trim()) return 'Give the item a name.';
    const sku = (d.name.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 3)
      .map((w) => w.slice(0, 3).toUpperCase()).join('-') || 'ITEM') + '-' + String(Math.floor(Math.random() * 90) + 10);
    const deal = ref.current.deals.find((x) => x.id === d.dealId);
    if (!supabase) {
      const item: InvItem = {
        id: Date.now(), name: d.name, sku, buy: d.buy, list: d.list, status: d.status, img: deal?.img ?? null,
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
    if (error) return error.message;
    set((s) => ({ inventory: [toInv(data), ...s.inventory] }));
    return null;
  }, [set]);

  /** Re-fetch everything for the signed-in user. */
  const reload = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getUser();
    if (data.user) await loadAll(data.user.id, data.user.email ?? '');
  }, [loadAll]);

  const actions = useMemo(() => ({
    set, go, back, reload, enter, goLogin, signIn, signUp, resetPassword, signOut,
    spin, checkIn, submitGuess, buyUpgrade, cashOut, buyItem, toggleWatch, addInventory,
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
  }), [set, go, back, reload, enter, goLogin, signIn, signUp, resetPassword, signOut, spin, checkIn, submitGuess, buyUpgrade, cashOut, buyItem, toggleWatch, addInventory]);

  const deal = st.deals.find((d) => d.id === st.dealId) ?? st.deals[0] ?? null;
  const me = useMemo(() => myStats(st), [st]);

  return { st, deal, me, pawnRate, pawnClick, ...actions };
}

/** Figures derived from the signed-in user's inventory. */
function myStats(st: State) {
  const sold = st.inventory.filter((i) => i.status === 'Sold');
  const lifetime = sold.reduce((n, i) => n + i.list - i.buy, 0);
  const avgRoi = sold.length
    ? Math.round(sold.reduce((n, i) => n + (i.buy > 0 ? (i.list - i.buy) / i.buy : 0), 0) / sold.length * 100)
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
