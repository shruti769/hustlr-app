import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { PUZZLE, TAB_ROOTS, UPGRADE_DEFS, WHEEL, type CalcKey, type Screen } from './data';

type State = {
  screen: Screen;
  tab: Screen;
  stack: Screen[];
  cat: string;
  dealIndex: number;
  calc: Record<CalcKey, number>;
  credits: number;
  streak: number;
  checkedIn: boolean;
  notified: boolean;
  guess: number;
  guessed: boolean;
  pawnCash: number;
  levels: Record<string, number>;
  spinsLeft: number;
  spinning: boolean;
  angle: number;
  spinResult: (typeof WHEEL)[number] | null;
  challengesOpen: boolean;
  owned: string[];
};

const INITIAL: State = {
  screen: 'splash', tab: 'deals', stack: [], cat: 'All', dealIndex: 0,
  calc: { buy: 120, sell: 330, ship: 18, other: 8, fee: 12.9 },
  credits: 340, streak: 3, checkedIn: false, notified: false,
  guess: 150, guessed: false,
  pawnCash: 210, levels: { polish: 1, case: 1, staff: 0, neon: 0 },
  spinsLeft: 3, spinning: false, angle: 0, spinResult: null, challengesOpen: false,
  owned: [],
};

const isRoot = (s: Screen) => (TAB_ROOTS as readonly string[]).includes(s);

/** Credits paid out for a Price It Right guess. */
export const guessReward = (guess: number) => {
  const diff = Math.abs(guess - PUZZLE.actual);
  return diff <= 5 ? 100 : diff <= 20 ? 40 : diff <= 50 ? 10 : 0;
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

  const pawnRate = UPGRADE_DEFS.reduce((n, u) => n + u.tick * (st.levels[u.key] || 0), 0);
  const pawnClick = 1 + UPGRADE_DEFS.reduce((n, u) => n + u.click * (st.levels[u.key] || 0), 0);

  // The shop only earns while you are standing in it, once a second.
  useEffect(() => {
    if (st.screen !== 'pawn' || pawnRate <= 0) return;
    const id = setInterval(() => set((s) => ({ pawnCash: s.pawnCash + pawnRate })), 1000);
    return () => clearInterval(id);
  }, [st.screen, pawnRate, set]);

  const spinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (spinTimer.current) clearTimeout(spinTimer.current); }, []);

  const spin = useCallback(() => {
    const s = ref.current;
    if (s.spinning || s.spinsLeft < 1) return;
    const total = WHEEL.reduce((n, w) => n + w.weight, 0);
    let roll = Math.random() * total;
    let idx = 0;
    for (let i = 0; i < WHEEL.length; i++) { roll -= WHEEL[i].weight; if (roll <= 0) { idx = i; break; } }
    const seg = 360 / WHEEL.length;
    const target = 360 * 6 - (idx * seg + seg / 2);
    set({ spinning: true, spinResult: null, angle: s.angle + target });
    spinTimer.current = setTimeout(() => {
      const w = WHEEL[idx];
      set((x) => ({ spinning: false, spinsLeft: x.spinsLeft - 1, credits: x.credits + (w.value || 0), spinResult: w }));
    }, 3500);
  }, [set]);

  const checkIn = useCallback(() => {
    set((s) => (s.checkedIn ? {} : { checkedIn: true, credits: s.credits + 10, spinsLeft: s.spinsLeft + 1 }));
  }, [set]);

  const actions = useMemo(() => ({
    set, go, back, spin, checkIn,
    openDeal: (i: number) => { set({ dealIndex: i }); go('detail'); },
    goLogin: () => set({ screen: 'login', stack: [] }),
    openFeatured: () => {
      const s = ref.current;
      if (s.spinsLeft > 0) return go('spin');
      if (!s.checkedIn) { checkIn(); go('spin'); }
    },
    submitGuess: () => set((s) => (s.guessed ? {} : { guessed: true, credits: s.credits + guessReward(s.guess) })),
    hustle: () => set((s) => ({ pawnCash: s.pawnCash + pawnClickOf(s) })),
    buyUpgrade: (key: string, cost: number) => set((s) => (
      s.pawnCash < cost ? {} : { pawnCash: s.pawnCash - cost, levels: { ...s.levels, [key]: (s.levels[key] || 0) + 1 } }
    )),
    cashOut: () => set((s) => (s.pawnCash >= 1000 ? { pawnCash: s.pawnCash - 1000, credits: s.credits + 100 } : {})),
    buyItem: (key: string, cost: number) => set((s) => (
      s.owned.includes(key) || s.credits < cost ? {} : { credits: s.credits - cost, owned: [...s.owned, key] }
    )),
  }), [set, go, back, spin, checkIn]);

  return { st, pawnRate, pawnClick, ...actions };
}

const pawnClickOf = (s: State) => 1 + UPGRADE_DEFS.reduce((n, u) => n + u.click * (s.levels[u.key] || 0), 0);

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
