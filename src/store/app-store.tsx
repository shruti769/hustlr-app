import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Colors } from '@/constants/theme';
import type { PlanKey, Risk } from '@/data/mock';

export type TabId = 'home' | 'deals' | 'fliptok' | 'inventory' | 'profile';

type Calc = { buy: string; sell: string; ship: string; other: string; fee: string };
type Listing = { name: string; buy: string; sell: string; size: string; notes: string };
type Analyse = { url: string; notes: string; done: boolean; loading: boolean };
type Quick = { title: string; price: string; notes: string };

const DEFAULT_LISTING: Listing = {
  name: "Air Jordan 4 Retro 'White Cement'",
  buy: '200',
  sell: '410',
  size: 'US 10',
  notes: 'Box included. Minor creasing on toe box. Insoles are clean.',
};

type AppState = {
  /** Bottom-nav tab the user is "inside", kept while browsing sub-screens. */
  tab: TabId;
  setTab: (tab: TabId) => void;

  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  fullName: string;
  setFullName: (v: string) => void;

  search: string;
  setSearch: (v: string) => void;
  cat: string;
  setCat: (v: string) => void;

  watch: string[];
  toggleWatch: (id: string) => void;

  likes: Record<string, boolean>;
  toggleLike: (id: string) => void;
  saved: Record<string, boolean>;
  toggleSave: (id: string) => void;

  calc: Calc;
  setCalc: (patch: Partial<Calc>) => void;

  listing: Listing;
  setListing: (patch: Partial<Listing>) => void;
  resetListingFromAi: () => void;

  platforms: string[];
  togglePlatform: (label: string) => void;

  analyse: Analyse;
  setAnalyse: (patch: Partial<Analyse>) => void;
  runAnalyse: () => void;

  quick: Quick;
  setQuick: (patch: Partial<Quick>) => void;

  entries: number;
  addEntries: (n: number) => void;

  trackerExtra: boolean;
  addTracker: () => boolean;

  plan: PlanKey;
  setPlan: (plan: PlanKey) => void;

  toast: string;
  flash: (msg: string) => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<TabId>('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [watch, setWatch] = useState<string[]>(['aj4', 'pkm', 'dys', 'lgo']);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [calc, setCalcState] = useState<Calc>({
    buy: '120',
    sell: '330',
    ship: '18',
    other: '8',
    fee: '12.9',
  });
  const [listing, setListingState] = useState<Listing>(DEFAULT_LISTING);
  const [platforms, setPlatforms] = useState<string[]>(['eBay', 'Facebook']);
  const [analyse, setAnalyseState] = useState<Analyse>({
    url: '',
    notes: '',
    done: true,
    loading: false,
  });
  const [quick, setQuickState] = useState<Quick>({ title: '', price: '', notes: '' });
  const [entries, setEntries] = useState(12);
  const [trackerExtra, setTrackerExtra] = useState(false);
  const [plan, setPlan] = useState<PlanKey>('Hustler');
  const [toast, setToast] = useState('');

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (analyseTimer.current) clearTimeout(analyseTimer.current);
    },
    [],
  );

  const flash = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(''), 1900);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      tab,
      setTab,
      email,
      setEmail,
      password,
      setPassword,
      fullName,
      setFullName,
      search,
      setSearch,
      cat,
      setCat,
      watch,
      toggleWatch: (id) =>
        setWatch((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      likes,
      toggleLike: (id) => setLikes((prev) => ({ ...prev, [id]: !prev[id] })),
      saved,
      toggleSave: (id) => setSaved((prev) => ({ ...prev, [id]: !prev[id] })),
      calc,
      setCalc: (patch) => setCalcState((prev) => ({ ...prev, ...patch })),
      listing,
      setListing: (patch) => setListingState((prev) => ({ ...prev, ...patch })),
      resetListingFromAi: () => setListingState(DEFAULT_LISTING),
      platforms,
      togglePlatform: (label) =>
        setPlatforms((prev) =>
          prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
        ),
      analyse,
      setAnalyse: (patch) => setAnalyseState((prev) => ({ ...prev, ...patch })),
      runAnalyse: () => {
        setAnalyseState((prev) => {
          if (prev.loading) return prev;
          if (analyseTimer.current) clearTimeout(analyseTimer.current);
          analyseTimer.current = setTimeout(
            () => setAnalyseState((s) => ({ ...s, loading: false, done: true })),
            900,
          );
          return { ...prev, loading: true, done: false };
        });
      },
      quick,
      setQuick: (patch) => setQuickState((prev) => ({ ...prev, ...patch })),
      entries,
      addEntries: (n) => setEntries((prev) => prev + n),
      trackerExtra,
      addTracker: () => {
        if (trackerExtra) return false;
        setTrackerExtra(true);
        return true;
      },
      plan,
      setPlan,
      toast,
      flash,
    }),
    [
      tab,
      email,
      password,
      fullName,
      search,
      cat,
      watch,
      likes,
      saved,
      calc,
      listing,
      platforms,
      analyse,
      quick,
      entries,
      trackerExtra,
      plan,
      toast,
      flash,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

/** Marks the tab a screen belongs to, so the bottom nav keeps it lit. */
export function useTab(id: TabId) {
  const { setTab } = useApp();
  useEffect(() => setTab(id), [id, setTab]);
}

/* ---------- shared derivations ---------- */

export const scoreColor = (score: string) => {
  const n = parseFloat(score);
  return n >= 8 ? Colors.green : n >= 7 ? Colors.gold : Colors.red;
};

export const riskColor = (risk: Risk) =>
  risk === 'Low' ? Colors.green : risk === 'Med' ? Colors.gold : Colors.red;

export const num = (v: string | number) => {
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ''));
  return Number.isNaN(n) ? 0 : n;
};

export const money = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
