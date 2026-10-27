import type { ImageSourcePropType } from 'react-native';

import { A, C, G, L } from './theme';

/** Product photography. AirPods has no shot in the prototype, so it stays blank. */
export const IMG = {
  jordan: require('@/assets/images/deals/air-jordan.png'),
  dyson: require('@/assets/images/deals/dyson.png'),
  pokemon: require('@/assets/images/deals/pokemon.png'),
  lego: require('@/assets/images/deals/lego.png'),
  nswitch: require('@/assets/images/deals/nintendo-switch.png'),
  airpods: null,
  flip1: require('@/assets/images/deals/fliptok-air-jordan-white.png'),
  scam: require('@/assets/images/deals/inventory-extra.png'),
  recap: require('@/assets/images/deals/air-jordan-gallery.png'),
} satisfies Record<string, ImageSourcePropType | null>;

export const ART = {
  logo: require('@/assets/images/proto/logo.png'),
  arcadeHeader: require('@/assets/images/proto/arcade-header.png'),
  prizeSpin: require('@/assets/images/proto/prize-spin.png'),
  priceIt: require('@/assets/images/proto/price-it.png'),
  pawn: require('@/assets/images/proto/pawn.png'),
  wheel: require('@/assets/images/proto/wheel.png'),
  puzzle: require('@/assets/images/proto/puzzle.jpg'),
  addPhoto: require('@/assets/images/proto/add-photo.jpg'),
};

export type Img = ImageSourcePropType | null;

export type Risk = 'Low' | 'Med' | 'High';

export const RISK: Record<Risk, string> = { Low: C.a, Med: C.gold, High: C.neg };

export const CATS = ['All', 'Sneakers', 'Electronics', 'Collectibles', 'Home', 'Toys'];

export const TAB_ROOTS = ['home', 'deals', 'fliptok', 'inventory', 'profile'] as const;

export type Screen =
  | 'splash' | 'login' | 'signup' | 'reset'
  | 'home' | 'deals' | 'detail' | 'fliptok' | 'inventory' | 'add' | 'profile'
  | 'dashboard' | 'calculator' | 'tracker' | 'trends' | 'analyse' | 'leaderboard'
  | 'watchlist' | 'prizes' | 'plans' | 'notifications'
  | 'arcade' | 'priceit' | 'pawn' | 'spin' | 'store';

export const TITLES: Partial<Record<Screen, string>> = {
  home: 'HUSTLR', deals: 'Hot Deals', detail: 'Deal Detail', fliptok: 'Flip Tok',
  inventory: 'Inventory', add: 'Add Listing', profile: 'My Profile', dashboard: 'Dashboard',
  calculator: 'Calculator', tracker: 'Price Tracker', trends: 'Market Trends',
  analyse: 'Analyse Listing', leaderboard: 'Leaderboard', watchlist: 'Watchlist',
  prizes: 'Prize Draw', plans: 'Plans', notifications: 'Notifications',
  arcade: 'Arcade', priceit: 'Price It Right', pawn: 'Pawn Empire', spin: 'Prize Spin', store: 'Credit Store',
};

export const HEADER_ACTIONS: Partial<Record<Screen, { label: string; to: Screen }>> = {
  inventory: { label: '+ Add', to: 'add' },
  tracker: { label: '+ Track', to: 'tracker' },
  add: { label: 'AI Fill', to: 'add' },
  fliptok: { label: 'Leaderboard', to: 'leaderboard' },
};

/** Flip the prototype's `showPrizeDraw` switch to reveal the live prize draw. */
export const SHOW_PRIZE_DRAW = false;

export const PUZZLE = { name: 'Pokémon 151 Booster Box · Sealed', meta: 'THRIFTED · $40 PAID · CONDITION 9/10', actual: 299 };

export type Tone = 'a' | 'gold';

export const UPGRADE_DEFS: {
  key: string; name: string; effect: string; desc: string;
  base: number; click: number; tick: number; tone: Tone; paths: string[];
}[] = [
  {
    key: 'polish', name: 'Polishing kit', effect: '+ $2 per haggle', desc: 'Make items look brand new.',
    base: 60, click: 2, tick: 0, tone: 'a',
    paths: ['M5.4 15.6 9.8 5.8a2 2 0 0 1 2.7-1l4.4 2a2 2 0 0 1 1 2.7l-4.4 9.8a2 2 0 0 1-2.7 1l-4.4-2a2 2 0 0 1-1-2.7Z', 'M18.6 3.4v3M17.1 4.9h3M6 19.6v2M5 20.6h2'],
  },
  {
    key: 'case', name: 'Display case', effect: '+ $3 per tick', desc: 'Showcase items, attract more buyers.',
    base: 140, click: 0, tick: 3, tone: 'gold',
    paths: ['M4.4 7.6 12 3.4l7.6 4.2v8.8L12 20.6l-7.6-4.2Z', 'M4.4 7.6 12 11.8l7.6-4.2M12 11.8v8.8', 'M12 14.8v2.4'],
  },
  {
    key: 'staff', name: 'Night staff', effect: '+ $8 per tick', desc: 'Keep the shop running 24/7.',
    base: 420, click: 0, tick: 8, tone: 'gold',
    paths: ['M8.6 4.2a3 3 0 0 1 4 1.4l1.6 3.4-5.4 2.6-1.6-3.4a3 3 0 0 1 1.4-4Z', 'M11.4 11.2 14.6 19a2 2 0 0 0 1.8 1.2h2.2', 'M6.4 20.2h6'],
  },
  {
    key: 'neon', name: 'Neon sign', effect: '+ $1 haggle, +$2 tick', desc: 'Bring in more customers.',
    base: 900, click: 1, tick: 2, tone: 'a',
    paths: ['M3.6 6.6h16.8v8.4H3.6Z', 'M7.2 12.4V9.2l2.6 3.2V9.2M12.6 9.2v3.2h2.2M16.8 9.2v3.2', 'M8.4 15v2.4M15.6 15v2.4'],
  },
];

export const WHEEL: { label: string; value: number; cash?: number; weight: number }[] = [
  { label: '1 CR', value: 1, weight: 300 },
  { label: '5 CR', value: 5, weight: 260 },
  { label: '10 CR', value: 10, weight: 200 },
  { label: '20 CR', value: 20, weight: 120 },
  { label: '50 CR', value: 50, weight: 70 },
  { label: '150 CR', value: 150, weight: 32 },
  { label: '300 CR', value: 300, weight: 8 },
  { label: '$100 AUD', value: 0, cash: 100, weight: 1 },
];

export const WHEEL_ODDS = [
  { label: '$100 AUD cash', odds: '1 in 991', fg: C.goldink },
  { label: '300 credits', odds: '1 in 124', fg: C.t2 },
  { label: '150 credits', odds: '1 in 31', fg: C.t2 },
  { label: '50 credits', odds: '1 in 14', fg: C.t2 },
  { label: '20 credits', odds: '1 in 8', fg: C.t2 },
  { label: '1–10 credits', odds: '3 in 4', fg: C.t3 },
];

export const LADDER = [
  { label: 'Within $5', value: '100 CR' },
  { label: 'Within $20', value: '40 CR' },
  { label: 'Within $50', value: '10 CR' },
];

export const SHORTCUTS: { kicker: string; label: string; to: Screen }[] = [
  { kicker: 'ARCADE', label: 'Play & earn credits', to: 'arcade' },
  { kicker: 'TOOL', label: 'Calculator', to: 'calculator' },
  { kicker: 'TOOL', label: 'Price Tracker', to: 'tracker' },
  { kicker: 'INSIGHT', label: 'Market Trends', to: 'trends' },
  { kicker: 'INSIGHT', label: 'Dashboard', to: 'dashboard' },
  { kicker: 'SAVED', label: 'Watchlist', to: 'watchlist' },
];

export const INV_STATS = [
  { label: 'COST', value: '$1,200', fg: C.t1 },
  { label: 'LISTED', value: '$1,807', fg: C.t1 },
  { label: 'PROFIT', value: '+$607', fg: C.aink },
];

export const PLATFORMS = ['eBay', 'Facebook', 'Gumtree', 'StockX', 'Depop'];

export const KPIS = [
  { label: 'PROFIT', value: '$12.5k', delta: '▲ 18%', fg: C.aink },
  { label: 'DEPLOYED', value: '$3.2k', delta: '▲ 6%', fg: C.aink },
  { label: 'LISTINGS', value: '14', delta: '▲ 3', fg: C.aink },
  { label: 'AVG ROI', value: '94%', delta: '▼ 2%', fg: C.neg },
];

export type CalcKey = 'buy' | 'sell' | 'ship' | 'other' | 'fee';
export const CALC_FIELDS: { label: string; key: CalcKey; min: number; max: number; step: number }[] = [
  { label: 'BUY PRICE', key: 'buy', min: 0, max: 1000, step: 5 },
  { label: 'SELL PRICE', key: 'sell', min: 0, max: 1500, step: 5 },
  { label: 'SHIPPING', key: 'ship', min: 0, max: 100, step: 1 },
  { label: 'OTHER', key: 'other', min: 0, max: 200, step: 1 },
  { label: 'PLATFORM FEE', key: 'fee', min: 0, max: 25, step: 0.1 },
];

export const ENTRY_TASKS = [
  { label: 'Close a verified flip', value: '+5' },
  { label: 'Refer a hustler', value: '+10' },
  { label: 'Post on Flip Tok', value: '+2' },
  { label: 'Daily check-in', value: '+1' },
];

export const WINNERS = [
  { initials: 'JT', name: 'Jordan T.', meta: '@jflips · May 2026' },
  { initials: 'MC', name: 'Mia C.', meta: '@miasteals · Apr 2026' },
];

export const PLANS = [
  {
    key: 'scout', name: 'SCOUT', price: '$0', tagline: 'Test the waters', cta: 'Current plan', badge: '',
    bd: L(8), fg: C.t4, ctaBg: 'transparent', ctaBd: L(12), ctaFg: C.t3,
    features: ['10 AI deal scans / day', 'Basic profit calculator', 'Inventory up to 20 items', 'Community Flip Tok feed'],
  },
  {
    key: 'hustler', name: 'HUSTLER', price: '$19', tagline: 'For serious flippers', cta: 'Upgrade to Hustler', badge: 'MOST POPULAR',
    bd: A(40), fg: C.aink, ctaBg: C.a, ctaBd: C.a, ctaFg: C.ona,
    features: ['Unlimited AI deal scans', 'Real-time price tracker + alerts', 'Scam detection on every listing', 'Unlimited inventory', 'Market trend analytics', 'Prize draw entries x2'],
  },
  {
    key: 'mogul', name: 'MOGUL', price: '$49', tagline: 'Run it like a business', cta: 'Go Mogul', badge: '',
    bd: G(30), fg: C.goldink, ctaBg: G(14), ctaBd: G(40), ctaFg: C.gold,
    features: ['Everything in Hustler', 'Multi-account inventory sync', 'Bulk listing analysis', 'Priority deal alerts (5 min early)', 'Dedicated account manager', 'Prize draw entries x5'],
  },
];

export const PROFILE_STATS = [
  { label: 'TOTAL FLIPS', value: '38' },
  { label: 'LIFETIME PROFIT', value: '$3.2k' },
  { label: 'AVG ROI', value: '94%' },
  { label: 'STREAK', value: '4d' },
];

export const PROFILE_META = [
  { label: 'Email', value: 'mason@hustlr.app' },
  { label: 'Member since', value: 'Jan 2024' },
  { label: 'Plan', value: 'Hustler · $19/mo' },
  { label: 'Region', value: 'Sydney, AU' },
];

export const TOOLS: { label: string; to: Screen }[] = [
  { label: 'Credit Store', to: 'store' },
  { label: 'Dashboard', to: 'dashboard' },
  { label: 'Calculator', to: 'calculator' },
  { label: 'Price Tracker', to: 'tracker' },
  { label: 'Market Trends', to: 'trends' },
  { label: 'Analyse Listing', to: 'analyse' },
  { label: 'Leaderboard', to: 'leaderboard' },
];

