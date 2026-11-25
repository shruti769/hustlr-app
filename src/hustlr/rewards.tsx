import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';

import { TAB_ROOTS, type Screen } from './data';
import { image } from './model';
import {
  COSMETICS, HOH, MISSED, REDEEM, RSW, STREAM_POOL,
  type Cosmetic, type HohItem, type LbRow, type LbTab, type MissedListing, type RedeemDef, type StreamListing, type Tone, type Wedge,
} from './rewards-data';
import { LIVE, useHustlr } from './store';

/**
 * The rewards layer: XP and levels, tickets, Flash Alert tokens, HUSTLE or
 * HOLD, the Live Deal Stream, the Reward Spinner, upgrades and cosmetics.
 *
 * Live, every change goes through a Supabase function (see the
 * `20261125040000_rewards` migration) and the app shows what the server
 * returns. In demo mode the same rules run on the device.
 */

export type ToastKind = 'warn' | 'ach' | 'alert' | 'hold' | 'reward';
export type Toast = { kind: ToastKind; kicker: string; title: string };

export type Modal =
  | { kind: 'daily' }
  | { kind: 'levelup'; level: number }
  | { kind: 'prize'; prize: Wedge }
  | { kind: 'redeemed'; r: RedeemDef };

export type HohState = {
  i: number; phase: 'ask' | 'result'; choice: 'hustle' | 'hold' | null; loading: boolean;
  results: boolean[]; correct: number; combo: number; bestCombo: number; xp: number; tickets: number;
  done: boolean; adUsed: boolean; lastOk: boolean; lastXp: number; lastTickets: number; lastBonus: number;
};

export type StreamItem = { id: number; p: number; age: number; fresh: boolean };

/** Profit calculator inputs on a Hold Pile row. */
export type CalcVals = { buy: number; sell: number; fee: number; ship: number; other: number };

/** A Flash Alert the user has armed, as shown under "Armed alerts". */
export type ArmedAlert = { label: string; img: ReturnType<typeof image> };

/** What a Flash Alert is armed on, for the server. */
export type ArmTarget = { label: string; category: string | null; source: 'deal' | 'stream' | 'missed' | 'search'; ref: string; imageKey?: string | null };

type Saved = {
  xp: number; xpMax: number; level: number; tickets: number; flash: number;
  /** Active boosts: key → time left ("6H"), or `true` when it has no clock. */
  redeemed: Record<string, string | true>; cosOwned: string[]; cosEquipped: string[]; oracle: number;
  /** Day the daily reward was last claimed. */
  dailyDay: string | null;
};

type Catalog = {
  redeem: Record<string, { cost: number; minLevel: number | null }>;
  cos: Record<string, { cost: number; minLevel: number | null }>;
  weights: number[];
};

type RewardsState = Saved & {
  adsLeft: number; flashAdLeft: number;
  visited: Partial<Record<Screen, boolean>>;
  hoh: HohState; hohPlayed: boolean;
  /** Direction the answered card is flying off: 1 right, -1 left, 0 at rest. */
  hohFly: number;
  hohCards: HohItem[]; hohSession: number | null;
  streamItems: StreamItem[]; streamNextId: number; streamLive: boolean; streamNew: number;
  streamLoadingMore: boolean; streamLoads: number;
  streamHeld: number[]; streamAlerts: number[]; streamCalc: number | null; streamHustled: number[];
  watchCalc: number | null; watchVals: Record<number, Partial<CalcVals>>;
  lbTab: LbTab; lbLoading: boolean; lbRows: LbRow[] | null; achCat: number;
  toast: Toast | null; modal: Modal | null; dailyShown: boolean;
  rsAngle: number; rsSpinning: boolean; rsResult: Wedge | null;
  missedAlerts: number[]; detailAlerts: number[];
  /** Live only: alerts armed on the server, progress per achievement, catalog prices, the missed report. */
  armed: ArmedAlert[];
  achProgress: { cur: number; done: boolean }[] | null;
  catalog: Catalog | null;
  missed: MissedListing[] | null;
};

const today = () => new Date().toISOString().slice(0, 10);

/** The prototype's sample player. */
const DEMO_SAVED: Saved = {
  xp: 2880, xpMax: 3000, level: 12, tickets: 320, flash: 3,
  redeemed: {}, cosOwned: ['golden', 'lowball'], cosEquipped: ['lowball'], oracle: 47, dailyDay: null,
};

/** Before the server answers, a new account shows the bottom of the ladder. */
const FRESH_SAVED: Saved = {
  xp: 0, xpMax: 1000, level: 1, tickets: 50, flash: 1,
  redeemed: {}, cosOwned: [], cosEquipped: [], oracle: 0, dailyDay: null,
};

const NEW_HOH: HohState = {
  i: 0, phase: 'ask', choice: null, loading: false, results: [], correct: 0, combo: 0, bestCombo: 0,
  xp: 0, tickets: 0, done: false, adUsed: false, lastOk: false, lastXp: 0, lastTickets: 0, lastBonus: 0,
};

const initial = (saved: Saved): RewardsState => ({
  ...saved,
  adsLeft: 2, flashAdLeft: 1, visited: {},
  hoh: NEW_HOH, hohPlayed: false, hohFly: 0, hohCards: HOH, hohSession: null,
  streamItems: [0, 1, 2, 3, 4, 5, 6, 7].map((p, i) => ({ id: i + 1, p, age: [1, 3, 5, 8, 12, 15, 21, 26][i], fresh: false })),
  streamNextId: 9, streamLive: true, streamNew: 0, streamLoadingMore: false, streamLoads: 0,
  streamHeld: [], streamAlerts: [], streamCalc: null, streamHustled: [],
  watchCalc: null, watchVals: {},
  lbTab: 'Regional', lbLoading: false, lbRows: null, achCat: 0,
  toast: null, modal: null, dailyShown: false,
  rsAngle: 0, rsSpinning: false, rsResult: null,
  missedAlerts: [], detailAlerts: [],
  armed: [], achProgress: null, catalog: null, missed: null,
});

const DEMO_KEY = 'hustlr.rewards.v1.demo';

/** "6H", "3D", "30M" until an ISO time. */
const leftLabel = (iso: string) => {
  const ms = Date.parse(iso) - Date.now();
  const h = ms / 3600000;
  if (h >= 48) return `${Math.round(h / 24)}D`;
  if (h >= 1) return `${Math.round(h)}H`;
  return `${Math.max(1, Math.round(ms / 60000))}M`;
};

type ServerState = {
  xp: number; xp_max: number; level: number; tickets: number; flash: number; hoh_correct: number;
  daily_claimed: boolean | null; ads_left: number; flash_ad_left: number; hoh_played_today: boolean;
  boosts: Record<string, string>; cosmetics: { key: string; equipped: boolean }[];
  alerts: { id: number; label: string; image_key: string | null }[];
  achievements: { key: string; cur: number; done: boolean }[];
  unlocked_now: string[] | null;
};

const fromServer = (j: ServerState): Partial<RewardsState> => ({
  xp: j.xp, xpMax: j.xp_max, level: j.level, tickets: j.tickets, flash: j.flash, oracle: j.hoh_correct,
  dailyDay: j.daily_claimed ? today() : null,
  adsLeft: j.ads_left, flashAdLeft: j.flash_ad_left,
  redeemed: Object.fromEntries(Object.entries(j.boosts ?? {}).map(([k, v]) => [k, leftLabel(v)])),
  cosOwned: (j.cosmetics ?? []).map((c) => c.key),
  cosEquipped: (j.cosmetics ?? []).filter((c) => c.equipped).map((c) => c.key),
  armed: (j.alerts ?? []).map((a) => ({ label: a.label, img: image(a.image_key) })),
  achProgress: (j.achievements ?? []).map((a) => ({ cur: Number(a.cur), done: a.done })),
});

const FIX_LABEL: Record<string, string> = { flash: 'Arm a Flash Alert', upgrades: 'Try Night Crawler', redeem: '+50 km radius', deals: 'Add to filters' };

/** Server error text, shortened for a toast. */
const errText = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  if (/fetch|network/i.test(m)) return 'Check your connection and try again';
  return m.charAt(0).toUpperCase() + m.slice(1);
};

async function call<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase!.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

/** Listings the stream shows: live deals when there are any, else the sample pool. */
export function useStreamPool(): StreamListing[] {
  const { st } = useHustlr();
  return useMemo(() => {
    if (!LIVE || st.deals.length === 0) return STREAM_POOL;
    return st.deals.slice(0, 12).map((d, i) => ({
      name: d.name, img: d.img, platform: d.marketplace.toUpperCase(), loc: d.source,
      price: d.buy, resale: d.resale, deal: i,
    }));
  }, [st.deals]);
}

function useRewardsState() {
  const { st: app, go, set: setApp, toggleWatch } = useHustlr();
  const [rs, setRs] = useState<RewardsState>(() => initial(LIVE ? FRESH_SAVED : DEMO_SAVED));
  const ref = useRef(rs);
  ref.current = rs;
  const appRef = useRef(app);
  appRef.current = app;
  const set = useCallback((patch: Partial<RewardsState> | ((s: RewardsState) => Partial<RewardsState>)) => {
    setRs((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));
  }, []);
  const pool = useStreamPool();
  const poolRef = useRef(pool);
  poolRef.current = pool;

  // ─────────────────────────────────────────────────────── toast + grants
  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((t: Toast) => {
    if (toastT.current) clearTimeout(toastT.current);
    set({ toast: t });
    toastT.current = setTimeout(() => set({ toast: null }), 2600);
  }, [set]);
  const warn = useCallback((e: unknown, kicker = "COULDN'T DO THAT") => showToast({ kind: 'warn', kicker, title: errText(e) }), [showToast]);

  const levelUp = useCallback((level: number) => {
    if (level > 0) setTimeout(() => set({ modal: { kind: 'levelup', level } }), 500);
  }, [set]);

  /** Applies a server state, announcing any achievement it just unlocked. */
  const apply = useCallback((j: ServerState) => {
    set(fromServer(j));
    const fresh = j.unlocked_now ?? [];
    if (fresh.length) {
      const names = fresh.map((k) => k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
      showToast({ kind: 'ach', kicker: 'ACHIEVEMENT UNLOCKED', title: names.join(' · ') });
    }
  }, [set, showToast]);

  /** Demo only: XP, tickets and tokens on the device. */
  const grant = useCallback((g: { xp?: number; tickets?: number; flash?: number }, toast?: Toast) => {
    let up = 0;
    setRs((s) => {
      let xp = s.xp + (g.xp || 0);
      let { level, xpMax } = s;
      let tickets = s.tickets + (g.tickets || 0);
      while (xp >= xpMax) { xp -= xpMax; level += 1; xpMax += 200; tickets += 50; up = level; }
      return { ...s, xp, level, xpMax, tickets, flash: s.flash + (g.flash || 0) };
    });
    setTimeout(() => { if (up) set({ modal: { kind: 'levelup', level: up } }); }, 500);
    if (toast) showToast(toast);
  }, [set, showToast]);

  // ──────────────────────────────────────────── loading (live) / saving (demo)
  const refresh = useCallback(async () => {
    if (!LIVE) return;
    try { apply(await call<ServerState>('rewards_state')); } catch (e) { console.warn('[hustlr] rewards state', e); }
  }, [apply]);

  useEffect(() => {
    if (!LIVE) return;
    if (!app.userId || app.dataStatus !== 'ready') {
      if (!app.userId) setRs(initial(FRESH_SAVED));
      return;
    }
    refresh();
    const db = supabase!;
    Promise.all([
      db.from('reward_catalog').select('key, cost, min_level').eq('active', true),
      db.from('cosmetics').select('key, cost, min_level').eq('active', true),
      db.from('reward_wheel').select('idx, weight').order('idx'),
    ]).then(([r, c, w]) => {
      const byKey = (rows: { key: string; cost: number; min_level: number | null }[] | null) =>
        Object.fromEntries((rows ?? []).map((x) => [x.key, { cost: x.cost, minLevel: x.min_level }]));
      set({
        catalog: {
          redeem: byKey(r.data), cos: byKey(c.data),
          weights: RSW.map((_, i) => (w.data ?? []).find((x) => x.idx === i)?.weight ?? RSW[i].weight),
        },
      });
    });
  }, [app.userId, app.dataStatus, refresh, set]);

  useEffect(() => {
    if (LIVE) return;
    AsyncStorage.getItem(DEMO_KEY).then((raw) => {
      if (raw) set({ ...(JSON.parse(raw) as Partial<Saved>) });
    }).catch(() => {});
  }, [set]);

  useEffect(() => {
    if (LIVE) return;
    const { xp, xpMax, level, tickets, flash, redeemed, cosOwned, cosEquipped, oracle, dailyDay } = rs;
    const body: Saved = { xp, xpMax, level, tickets, flash, redeemed, cosOwned, cosEquipped, oracle, dailyDay };
    AsyncStorage.setItem(DEMO_KEY, JSON.stringify(body)).catch(() => {});
  }, [rs.xp, rs.xpMax, rs.level, rs.tickets, rs.flash, rs.redeemed, rs.cosOwned, rs.cosEquipped, rs.oracle, rs.dailyDay]); // eslint-disable-line react-hooks/exhaustive-deps

  // ───────────────────────────────────────── catalog prices, merged in live
  // Live, rewards and cosmetics an admin switched off are not in the catalog and drop out.
  const redeemDefs = useMemo<RedeemDef[]>(() => REDEEM.filter((r) => !rs.catalog || r.key in rs.catalog.redeem).map((r) => {
    const c = rs.catalog?.redeem[r.key];
    return c ? { ...r, cost: c.cost, minLevel: c.minLevel ?? undefined } : r;
  }), [rs.catalog]);
  const cosmeticDefs = useMemo<Cosmetic[]>(() => COSMETICS.filter((x) => !rs.catalog || x.key in rs.catalog.cos).map((x) => {
    const c = rs.catalog?.cos[x.key];
    return c ? { ...x, cost: c.cost, minLevel: c.minLevel ?? undefined } : x;
  }), [rs.catalog]);
  const wedges = useMemo<Wedge[]>(() => RSW.map((w, i) => ({ ...w, weight: rs.catalog?.weights[i] ?? w.weight })), [rs.catalog]);

  const goDeal = useCallback((index: number) => {
    const d = app.deals[index] ?? app.deals[0];
    if (!d) { go('deals'); return; }
    setApp({ dealId: d.id });
    go('detail');
  }, [app.deals, go, setApp]);

  // ─────────────────────────────────────────────────────── HUSTLE or HOLD
  const hohT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hohLock = useRef(false);
  const hohAdvancing = useRef(false);

  const startHoh = useCallback(async () => {
    if (hohT.current) clearTimeout(hohT.current);
    hohLock.current = false;
    set({ hoh: { ...NEW_HOH, loading: true } });
    if (!LIVE) {
      hohT.current = setTimeout(() => set((s) => ({ hoh: { ...s.hoh, loading: false } })), 800);
      return;
    }
    try {
      type Card = { id: number; name: string; image_key: string | null; image_url: string | null; platform: string; condition: string; location: string; listed: string; demand: string; tone: Tone; price: number; resale: number };
      const r = await call<{ session: number; cards: Card[] }>('hoh_start');
      set((s) => ({
        hohSession: r.session,
        hohCards: r.cards.map((c) => ({
          name: c.name, img: image(c.image_key, c.image_url), platform: c.platform, cond: c.condition, loc: c.location,
          listed: c.listed, demand: c.demand, tone: c.tone, price: c.price, resale: c.resale,
          net: '', answer: 'hold', reason: '',
        })),
        hoh: { ...s.hoh, loading: false },
      }));
    } catch (e) {
      warn(e);
      go('arcade');
    }
  }, [set, warn, go]);

  const nextHoh = useCallback(() => {
    if (hohT.current) clearTimeout(hohT.current);
    const h = ref.current.hoh;
    if (h.phase !== 'result' || hohAdvancing.current) return;
    hohAdvancing.current = true;
    setTimeout(() => { hohAdvancing.current = false; }, 320);
    // The card flies off the way it was called, then the next one snaps in.
    set({ hohFly: h.choice === 'hustle' ? 1 : -1 });
    setTimeout(() => {
      const last = h.i + 1 >= ref.current.hohCards.length;
      set((s) => ({ hohFly: 0, hoh: { ...s.hoh, ...(last ? { done: true } : { i: h.i + 1, phase: 'ask' as const, choice: null }) } }));
      hohLock.current = false;
    }, 260);
  }, [set]);

  /** Shows a call's result: feedback card, session totals, then auto-advance. */
  const showResult = useCallback((choice: 'hustle' | 'hold', ok: boolean, xp: number, tickets: number, bonus: number, combo: number) => {
    const h = ref.current.hoh;
    set({
      hohPlayed: true,
      hoh: {
        ...h, phase: 'result', choice, lastOk: ok, lastXp: xp, lastTickets: tickets, lastBonus: bonus,
        results: [...h.results, ok], correct: h.correct + (ok ? 1 : 0), combo, bestCombo: Math.max(h.bestCombo, combo),
        xp: h.xp + xp, tickets: h.tickets + tickets,
      },
    });
    hohT.current = setTimeout(nextHoh, 2600);
  }, [set, nextHoh]);

  const answerHoh = useCallback(async (choice: 'hustle' | 'hold') => {
    const s = ref.current;
    const h = s.hoh;
    if (h.phase !== 'ask' || h.loading || h.done || hohLock.current) return;
    hohLock.current = true;

    if (LIVE) {
      try {
        type Res = { ok: boolean; answer: 'hustle' | 'hold'; reason: string; net: string; xp: number; tickets: number; bonus: number; combo: number; level_up: number; state: ServerState };
        const r = await call<Res>('hoh_answer', { p_session: s.hohSession, p_choice: choice });
        set((x) => ({ hohCards: x.hohCards.map((c, i) => (i === h.i ? { ...c, answer: r.answer, reason: r.reason, net: r.net } : c)) }));
        apply(r.state);
        levelUp(r.level_up);
        showResult(choice, r.ok, r.xp, r.tickets, r.bonus, r.combo);
      } catch (e) {
        hohLock.current = false;
        warn(e);
      }
      return;
    }

    const item = s.hohCards[h.i % s.hohCards.length];
    const ok = item.answer === choice;
    const combo = ok ? h.combo + 1 : 0;
    const bonus = ok && combo % 3 === 0 ? 10 : 0;
    const xp = ok ? 20 : 2;
    const tickets = ok ? 5 + bonus : 0;
    grant({ xp, tickets });
    if (ok) {
      const o = s.oracle + 1;
      set({ oracle: o });
      if (o === 50) { grant({ xp: 150 }); showToast({ kind: 'ach', kicker: 'ACHIEVEMENT UNLOCKED', title: 'The Oracle · +150 XP' }); }
    }
    showResult(choice, ok, xp, tickets, bonus, combo);
  }, [set, apply, levelUp, showResult, warn, grant, showToast]);

  const hohAd = useCallback(async () => {
    const s = ref.current;
    const h = s.hoh;
    if (h.adUsed) return;
    if (LIVE) {
      try {
        const r = await call<{ tickets: number; level_up: number; state: ServerState }>('hoh_ad', { p_session: s.hohSession });
        set((x) => ({ hoh: { ...x.hoh, adUsed: true } }));
        apply(r.state);
        levelUp(r.level_up);
        showToast({ kind: 'reward', kicker: 'THANKS FOR WATCHING', title: `+${r.tickets} tickets added` });
      } catch (e) { warn(e); }
      return;
    }
    const t = h.tickets > 0 ? h.tickets : 10;
    set({ hoh: { ...h, adUsed: true } });
    grant({ tickets: t }, { kind: 'reward', kicker: 'THANKS FOR WATCHING', title: `+${t} tickets added` });
  }, [set, apply, levelUp, showToast, warn, grant]);

  // ───────────────────────────────────────────────────── Live Deal Stream
  const screenRef = useRef(app.screen);
  screenRef.current = app.screen;
  useEffect(() => {
    const t = setInterval(() => {
      const s = ref.current;
      if (screenRef.current !== 'stream' || !s.streamLive) return;
      const id = s.streamNextId;
      const p = Math.floor(Math.random() * poolRef.current.length);
      set((x) => ({
        streamItems: [{ id, p, age: 0, fresh: true }, ...x.streamItems.map((y) => ({ ...y, age: y.age + 1, fresh: false }))],
        streamNextId: id + 1, streamNew: x.streamNew + 1,
      }));
    }, 6000);
    return () => clearInterval(t);
  }, [set]);

  const streamMore = useCallback(() => {
    set({ streamLoadingMore: true });
    setTimeout(() => set((s) => {
      const lastAge = s.streamItems.length ? s.streamItems[s.streamItems.length - 1].age : 0;
      const n = poolRef.current.length;
      const add = [0, 1, 2, 3].map((k) => ({ id: s.streamNextId + k, p: (s.streamLoads * 4 + k + 3) % n, age: lastAge + 4 * (k + 1), fresh: false }));
      return { streamItems: [...s.streamItems, ...add], streamNextId: s.streamNextId + 4, streamLoadingMore: false, streamLoads: s.streamLoads + 1 };
    }), 900);
  }, [set]);

  /** HOLD on a stream row. Live, the Hold Pile is the user's saved deals. */
  const streamHold = useCallback(async (itemId: number, listing: StreamListing) => {
    const s = ref.current;
    if (LIVE) {
      const deal = appRef.current.deals[listing.deal];
      if (!deal) return;
      const wasHeld = appRef.current.watchIds.includes(deal.id);
      const err = await toggleWatch(deal.id);
      if (err) { showToast({ kind: 'warn', kicker: 'HOLD PILE FULL', title: 'Redeem +5 slots to save more' }); return; }
      if (!wasHeld) showToast({ kind: 'hold', kicker: 'ADDED TO HOLD PILE', title: listing.name });
      return;
    }
    if (s.streamHeld.includes(itemId)) { set((y) => ({ streamHeld: y.streamHeld.filter((k) => k !== itemId) })); return; }
    const slots = 10 + (s.redeemed.hold5 ? 5 : 0);
    if (appRef.current.watchIds.length + s.streamHeld.length >= slots) {
      showToast({ kind: 'warn', kicker: 'HOLD PILE FULL', title: 'Redeem +5 slots to save more' });
      return;
    }
    set((y) => ({ streamHeld: [...y.streamHeld, itemId] }));
    showToast({ kind: 'hold', kicker: 'ADDED TO HOLD PILE', title: listing.name });
  }, [set, showToast, toggleWatch]);

  /** Spends one Flash token to arm an alert; nudges to the token screen when there are none. */
  const spendFlash = useCallback(async (onSpend: (s: RewardsState) => Partial<RewardsState>, toast: Toast, target: ArmTarget) => {
    if (ref.current.flash < 1) {
      showToast({ kind: 'warn', kicker: 'NO FLASH TOKENS LEFT', title: 'Earn or redeem more tokens' });
      go('flash');
      return false;
    }
    if (LIVE) {
      try {
        apply(await call<ServerState>('arm_flash_alert', {
          p_label: target.label, p_category: target.category ?? '', p_source: target.source, p_ref: target.ref, p_image_key: target.imageKey ?? null,
        }));
      } catch (e) { warn(e); return false; }
      set((s) => onSpend(s));
    } else {
      set((s) => ({ flash: Math.max(0, s.flash - 1), ...onSpend(s) }));
    }
    showToast(toast);
    return true;
  }, [set, apply, showToast, warn, go]);

  // ───────────────────────────────────────────── daily reward, ads, packs
  const claimDaily = useCallback(async (restore: boolean, lost: boolean) => {
    if (LIVE) {
      try {
        const r = await call<{ level_up: number; state: ServerState }>('claim_daily_reward');
        set({ modal: null });
        apply(r.state);
        levelUp(r.level_up);
        showToast({ kind: 'reward', kicker: 'STREAK MAINTAINED', title: '+1 Flash token · +20 tickets · +15 XP' });
      } catch (e) { set({ modal: null }); warn(e); }
      return;
    }
    if (restore && ref.current.tickets < 100) {
      showToast({ kind: 'warn', kicker: 'NOT ENOUGH TICKETS', title: 'You need 100 tickets to restore' });
      return;
    }
    if (restore) set((s) => ({ tickets: s.tickets - 100 }));
    set({ modal: null, dailyDay: today() });
    const g = lost && !restore ? { flash: 1, tickets: 10, xp: 15 } : { flash: 1, tickets: 20, xp: 15 };
    grant(g, {
      kind: 'reward',
      kicker: restore ? 'STREAK RESTORED' : lost ? 'FRESH START' : 'STREAK MAINTAINED',
      title: `+1 Flash token · +${g.tickets} tickets · +15 XP`,
    });
  }, [set, apply, levelUp, showToast, warn, grant]);

  const watchAd = useCallback(async (kind: 'tickets' | 'flash') => {
    const s = ref.current;
    if (kind === 'tickets' ? s.adsLeft < 1 : s.flashAdLeft < 1) return;
    const toast: Toast = kind === 'tickets'
      ? { kind: 'reward', kicker: 'THANKS FOR WATCHING', title: '+10 tickets added' }
      : { kind: 'alert', kicker: 'THANKS FOR WATCHING', title: '+1 Flash Alert Token' };
    if (LIVE) {
      try {
        const r = await call<{ level_up: number; state: ServerState }>('ad_reward', { p_kind: kind });
        apply(r.state);
        levelUp(r.level_up);
        showToast(toast);
      } catch (e) { warn(e); }
      return;
    }
    if (kind === 'tickets') { set({ adsLeft: s.adsLeft - 1 }); grant({ tickets: 10 }, toast); }
    else { set({ flashAdLeft: 0 }); grant({ flash: 1 }, toast); }
  }, [set, apply, levelUp, showToast, warn, grant]);

  const redeem = useCallback(async (r: RedeemDef, opts?: { silent?: boolean }) => {
    const s = ref.current;
    if (s.tickets < r.cost) {
      showToast({ kind: 'warn', kicker: 'INSUFFICIENT TICKETS', title: `You need ${r.cost - s.tickets} more tickets` });
      return;
    }
    if (LIVE) {
      try { apply(await call<ServerState>('redeem_reward', { p_key: r.key })); } catch (e) { warn(e); return; }
    } else {
      set((x) => ({
        tickets: x.tickets - r.cost,
        redeemed: r.repeat ? x.redeemed : { ...x.redeemed, [r.key]: true },
        flash: x.flash + (r.flash || 0),
      }));
    }
    if (opts?.silent) showToast({ kind: 'alert', kicker: `REDEEMED · -${r.cost} TICKETS`, title: `+${r.flash} Flash Alert Tokens` });
    else set({ modal: { kind: 'redeemed', r } });
  }, [set, apply, showToast, warn]);

  /** Buy, equip or unequip a cosmetic. */
  const cosmeticAct = useCallback(async (c: Cosmetic) => {
    const s = ref.current;
    const owned = s.cosOwned.includes(c.key);
    const eq = s.cosEquipped.includes(c.key);
    if (c.minLevel && s.level < c.minLevel) { showToast({ kind: 'warn', kicker: 'LOCKED', title: `Reach Level ${c.minLevel} to unlock` }); return; }
    if (!owned && s.tickets < c.cost) { showToast({ kind: 'warn', kicker: 'INSUFFICIENT TICKETS', title: `You need ${c.cost - s.tickets} more tickets` }); return; }
    if (LIVE) {
      try {
        apply(await call<ServerState>(owned ? 'equip_cosmetic' : 'buy_cosmetic', owned ? { p_key: c.key, p_on: !eq } : { p_key: c.key }));
      } catch (e) { warn(e); return; }
    } else if (eq) {
      set((x) => ({ cosEquipped: x.cosEquipped.filter((k) => k !== c.key) }));
    } else if (owned) {
      set((x) => ({ cosEquipped: [...x.cosEquipped, c.key] }));
    } else {
      set((x) => ({ tickets: x.tickets - c.cost, cosOwned: [...x.cosOwned, c.key] }));
    }
    if (eq) return;
    showToast(owned
      ? { kind: 'reward', kicker: 'EQUIPPED', title: c.name }
      : { kind: 'reward', kicker: `UNLOCKED · -${c.cost} TICKETS`, title: c.name });
  }, [set, apply, showToast, warn]);

  // ─────────────────────────────────────────────────────── Reward Spinner
  const rsLock = useRef(false);
  const rsSpin = useCallback(async () => {
    const s = ref.current;
    if (s.rsSpinning || rsLock.current) return;
    if (s.tickets < 50) { showToast({ kind: 'warn', kicker: 'INSUFFICIENT TICKETS', title: 'Play HUSTLE or HOLD to earn more' }); return; }
    rsLock.current = true;

    let idx = 0;
    let server: ServerState | null = null;
    if (LIVE) {
      try {
        const r = await call<{ index: number; state: ServerState }>('reward_spin');
        idx = r.index;
        server = r.state;
      } catch (e) { rsLock.current = false; warn(e); return; }
    } else {
      const total = wedges.reduce((n, w) => n + w.weight, 0);
      let roll = Math.random() * total;
      for (let i = 0; i < wedges.length; i++) { roll -= wedges[i].weight; if (roll <= 0) { idx = i; break; } }
    }
    const target = 360 * 6 - (idx * 45 + 22.5);
    const base = s.rsAngle - (s.rsAngle % 360);
    set((x) => ({ rsSpinning: true, rsResult: null, tickets: LIVE ? x.tickets : x.tickets - 50, rsAngle: base + target }));
    setTimeout(() => {
      const w = wedges[idx];
      rsLock.current = false;
      if (server) {
        apply(server);
        set({ rsSpinning: false, rsResult: w, modal: { kind: 'prize', prize: w } });
        return;
      }
      set((x) => {
        const patch: Partial<RewardsState> = { rsSpinning: false, rsResult: w, modal: { kind: 'prize', prize: w } };
        if (w.redeem) patch.redeemed = { ...x.redeemed, [w.redeem]: w.left || true };
        if (w.cos && !x.cosOwned.includes(w.cos)) patch.cosOwned = [...x.cosOwned, w.cos];
        return patch;
      });
      if (w.flash) grant({ flash: w.flash });
    }, 3500);
  }, [set, apply, grant, showToast, warn, wedges]);

  // ──────────────────────────────────────── leaderboard + missed (live)
  const lbT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadBoard = useCallback(async (ms: number, tab?: LbTab) => {
    if (lbT.current) clearTimeout(lbT.current);
    const t = tab ?? ref.current.lbTab;
    set({ lbLoading: true, lbTab: t });
    if (!LIVE) {
      lbT.current = setTimeout(() => set({ lbLoading: false }), ms);
      return;
    }
    try {
      type Row = { rank: number; name: string; initials: string; handle: string; profit: number; streak: number; level: number; flips: number; badge: string; me: boolean };
      const rows = await call<Row[]>('leaderboard', { p_scope: t });
      if (ref.current.lbTab !== t) return;
      set({
        lbLoading: false,
        lbRows: rows.map((r) => ({
          rank: r.rank.toLocaleString(), initials: r.initials, name: r.name, handle: r.handle,
          profit: '$' + Math.round(Number(r.profit)).toLocaleString(), streak: `${r.streak}d streak`,
          lvl: r.level, flips: r.flips, badge: r.badge, me: r.me,
        })),
      });
    } catch (e) {
      set({ lbLoading: false });
      warn(e, "COULDN'T LOAD THE BOARD");
    }
  }, [set, warn]);

  const loadMissed = useCallback(async () => {
    if (!LIVE) return;
    try {
      type Row = { id: number; name: string; category: string; image_key: string | null; image_url: string | null; price: number; resale: number; profit: number; ended_at: string; reason: string; fix: Screen };
      const rows = await call<Row[]>('missed_connections');
      set({
        missed: rows.map((r) => {
          const mins = Math.max(1, Math.round((Date.now() - Date.parse(r.ended_at)) / 60000));
          return {
            name: r.name, img: image(r.image_key, r.image_url), price: Number(r.price), resale: Number(r.resale), profit: Number(r.profit),
            ago: mins < 60 ? `SOLD ${mins}M AGO` : `SOLD ${Math.round(mins / 60)}H AGO`,
            reason: r.reason, fixLabel: FIX_LABEL[r.fix] ?? 'See deals', fix: r.fix, category: r.category, ref: String(r.id),
          };
        }),
      });
    } catch (e) { console.warn('[hustlr] missed connections', e); }
  }, [set]);

  // ───────────────────────────────────────────── reacting to navigation
  const prevScreen = useRef<Screen | null>(null);
  useEffect(() => {
    const screen = app.screen;
    if (prevScreen.current === screen) return;
    prevScreen.current = screen;
    set((s) => ({ visited: { ...s.visited, [screen]: true } }));
    if (screen === 'hoh') startHoh();
    if (screen === 'leaderboard') loadBoard(650);
    if (screen === 'stream') set({ streamNew: 0 });
    if (screen === 'missed' || screen === 'home' || screen === 'notifications') loadMissed();
    if (screen === 'achievements' || screen === 'arcade' || screen === 'profile') refresh();
    const s = ref.current;
    const signedIn = !LIVE || (!!app.userId && app.dataStatus === 'ready');
    if (signedIn && !s.dailyShown && (TAB_ROOTS as readonly string[]).includes(screen)) {
      set({ dailyShown: true });
      if (s.dailyDay !== today()) setTimeout(() => { if (ref.current.dailyDay !== today()) set({ modal: { kind: 'daily' } }); }, 900);
    }
  }, [app.screen, app.userId, app.dataStatus, set, startHoh, loadBoard, loadMissed, refresh]);

  useEffect(() => () => {
    [toastT.current, hohT.current, lbT.current].forEach((t) => t && clearTimeout(t));
  }, []);

  const actions = useMemo(() => ({
    set, showToast, grant, goDeal, startHoh, answerHoh, nextHoh, hohAd, streamMore, streamHold, spendFlash,
    claimDaily, watchAd, redeem, cosmeticAct, rsSpin, loadBoard, refresh,
  }), [set, showToast, grant, goDeal, startHoh, answerHoh, nextHoh, hohAd, streamMore, streamHold, spendFlash,
    claimDaily, watchAd, redeem, cosmeticAct, rsSpin, loadBoard, refresh]);

  const dailyClaimed = rs.dailyDay === today();
  /** Live: the server's missed report; demo: the sample one. */
  const missed = LIVE ? (rs.missed ?? []) : MISSED;
  return { rs, pool, dailyClaimed, redeemDefs, cosmeticDefs, wedges, missed, ...actions };
}

type Rewards = ReturnType<typeof useRewardsState>;
const Ctx = createContext<Rewards | null>(null);

export function RewardsProvider({ children }: { children: ReactNode }) {
  const v = useRewardsState();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useRewards() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useRewards outside RewardsProvider');
  return v;
}
