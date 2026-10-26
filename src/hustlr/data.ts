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

export const DEALS: {
  name: string; source: string; profit: string; score: string; buy: string;
  resale: string; roi: string; risk: Risk; img: Img;
}[] = [
  { name: 'Air Jordan 4 Retro', source: 'FB MARKETPLACE · 2.1KM', profit: '+$210', score: '8.7', buy: '$200', resale: '$410', roi: '105%', risk: 'Low', img: IMG.jordan },
  { name: 'Dyson V11 Absolute', source: 'GUMTREE · 5.4KM', profit: '+$95', score: '7.9', buy: '$240', resale: '$335', roi: '40%', risk: 'Low', img: IMG.dyson },
  { name: 'Pokémon 151 Box', source: 'EBAY · ONLINE', profit: '+$140', score: '9.1', buy: '$159', resale: '$299', roi: '88%', risk: 'Med', img: IMG.pokemon },
  { name: 'LEGO Hogwarts Castle', source: 'FB MARKETPLACE · 8.0KM', profit: '+$72', score: '7.2', buy: '$280', resale: '$352', roi: '26%', risk: 'Low', img: IMG.lego },
  { name: 'Nintendo Switch OLED', source: 'GUMTREE · 3.3KM', profit: '+$90', score: '6.8', buy: '$320', resale: '$410', roi: '28%', risk: 'Med', img: IMG.nswitch },
  { name: 'Apple AirPods Pro 2', source: 'FB MARKETPLACE · 1.2KM', profit: '+$65', score: '5.4', buy: '$180', resale: '$245', roi: '36%', risk: 'High', img: IMG.airpods },
];

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

export const STORE_GROUPS = [
  {
    label: 'POWERUPS', items: [
      { key: 'early', name: 'Early deal alerts · 15 min', desc: 'See new high-score deals 15 minutes before free users.', cost: 500 },
      { key: 'scan', name: 'Scan burst · 25 extra', desc: '25 extra AI listing scans, valid 24 hours.', cost: 250 },
      { key: 'risk', name: 'Deep scam check ×5', desc: 'Five full authenticity reports on watched listings.', cost: 300 },
    ],
  },
  {
    label: 'BADGES', items: [
      { key: 'b1', name: 'Verified Flipper', desc: 'Permanent badge on your Flip Tok posts.', cost: 400 },
      { key: 'b2', name: 'Appraiser', desc: 'Awarded for three Price It Right wins.', cost: 600 },
    ],
  },
  {
    label: 'THEMES', items: [
      { key: 't1', name: 'Graphite theme', desc: 'Neutral monochrome interface.', cost: 350 },
      { key: 't2', name: 'Slate theme', desc: 'Cool blue-grey interface.', cost: 350 },
    ],
  },
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

export const FLIPS = [
  { initials: 'MR', name: 'Marcus R.', handle: '@stackking', profit: '+$210', img: IMG.flip1, bought: '$200', sold: '$410', roi: '105%', likes: '1.2k', shares: '86', copy: 'Picked these up local, sold same week. Clean 105% flip. AI flagged it before the listing hit the feeds.' },
  { initials: 'PN', name: 'Priya N.', handle: '@flipqueen', profit: '+$95', img: IMG.dyson, bought: '$240', sold: '$335', roi: '40%', likes: '870', shares: '41', copy: 'Cordless vacuums never sit. Two days on Gumtree and gone.' },
  { initials: 'DW', name: 'Deon W.', handle: '@thedealhunter', profit: '+$140', img: IMG.pokemon, bought: '$159', sold: '$299', roi: '88%', likes: '2.4k', shares: '155', copy: 'Sealed boxes only. Score was 9.1 so I bought three.' },
  { initials: 'SK', name: 'Sam K.', handle: '@sourceandsell', profit: '+$72', img: IMG.lego, bought: '$280', sold: '$352', roi: '26%', likes: '640', shares: '28', copy: 'Retired LEGO sets are slow but safe. Every single time.' },
];

export const INV_STATS = [
  { label: 'COST', value: '$1,200', fg: C.t1 },
  { label: 'LISTED', value: '$1,807', fg: C.t1 },
  { label: 'PROFIT', value: '+$607', fg: C.aink },
];

const LISTED = { sbg: A(14), sfg: C.aink };
export const INVENTORY = [
  { name: 'Air Jordan 4 Retro', sku: 'AJ4-WHT-10', profit: '+$210', status: 'Listed', img: IMG.jordan, ...LISTED },
  { name: 'Dyson V11 Absolute', sku: 'DYS-V11-02', profit: '+$95', status: 'Listed', img: IMG.dyson, ...LISTED },
  { name: 'Pokémon 151 Box', sku: 'PKM-151-SB', profit: '+$140', status: 'Sold', img: IMG.pokemon, sbg: L(6), sfg: C.t3 },
  { name: 'LEGO Hogwarts Castle', sku: 'LGO-HOG-71', profit: '+$72', status: 'Sourcing', img: IMG.lego, sbg: G(14), sfg: C.goldink },
  { name: 'Nintendo Switch OLED', sku: 'NSW-OLED-W', profit: '+$90', status: 'Listed', img: IMG.nswitch, ...LISTED },
];

export const ADD_FIELDS = [
  { label: 'ITEM NAME', value: "Air Jordan 4 Retro 'White Cement'" },
  { label: 'CATEGORY', value: 'Sneakers' },
  { label: 'CONDITION', value: 'Used · 9/10' },
  { label: 'BUY PRICE', value: '200' },
  { label: 'SIZE / SPEC', value: 'US 10' },
];

export const PLATFORMS = ['eBay', 'Facebook', 'Gumtree', 'StockX', 'Depop'];

export const KPIS = [
  { label: 'PROFIT', value: '$12.5k', delta: '▲ 18%', fg: C.aink },
  { label: 'DEPLOYED', value: '$3.2k', delta: '▲ 6%', fg: C.aink },
  { label: 'LISTINGS', value: '14', delta: '▲ 3', fg: C.aink },
  { label: 'AVG ROI', value: '94%', delta: '▼ 2%', fg: C.neg },
];

export const RECENT = [
  { name: 'Air Jordan 4 Retro', source: 'FB MARKETPLACE · 2.1KM', profit: '+$210', roi: '105%', img: IMG.jordan },
  { name: 'Dyson V11 Absolute', source: 'GUMTREE · 5.4KM', profit: '+$95', roi: '40%', img: IMG.dyson },
  { name: 'Pokémon 151 Box', source: 'EBAY · ONLINE', profit: '+$140', roi: '88%', img: IMG.pokemon },
  { name: 'LEGO Hogwarts Castle', source: 'FB MARKETPLACE · 8.0KM', profit: '+$72', roi: '26%', img: IMG.lego },
];

export type CalcKey = 'buy' | 'sell' | 'ship' | 'other' | 'fee';
export const CALC_FIELDS: { label: string; key: CalcKey; min: number; max: number; step: number }[] = [
  { label: 'BUY PRICE', key: 'buy', min: 0, max: 1000, step: 5 },
  { label: 'SELL PRICE', key: 'sell', min: 0, max: 1500, step: 5 },
  { label: 'SHIPPING', key: 'ship', min: 0, max: 100, step: 1 },
  { label: 'OTHER', key: 'other', min: 0, max: 200, step: 1 },
  { label: 'PLATFORM FEE', key: 'fee', min: 0, max: 25, step: 0.1 },
];

export const TRACKED = [
  { name: 'Air Jordan 4 Retro', change: '+3.2%', now: '$410', target: '$380', pct: 1, fg: C.aink },
  { name: 'Pokémon 151 Box', change: '+8.4%', now: '$299', target: '$250', pct: 1, fg: C.aink },
  { name: 'Dyson V11', change: '-2.1%', now: '$335', target: '$350', pct: 0.78, fg: C.neg },
  { name: 'Switch OLED', change: '-1.4%', now: '$410', target: '$400', pct: 0.88, fg: C.neg },
];

export const TRENDS = [
  { name: 'Sneakers', watching: '4.2k watching', change: '+12.4%', fg: C.aink, path: 'M0 22 L15 18 L30 20 L45 12 L60 9 L76 4' },
  { name: 'Trading Cards', watching: '6.8k watching', change: '+28.1%', fg: C.aink, path: 'M0 25 L15 22 L30 15 L45 14 L60 8 L76 2' },
  { name: 'Electronics', watching: '9.1k watching', change: '-4.2%', fg: C.neg, path: 'M0 8 L15 11 L30 10 L45 16 L60 15 L76 21' },
  { name: 'LEGO Sets', watching: '2.1k watching', change: '+9.8%', fg: C.aink, path: 'M0 21 L15 19 L30 17 L45 14 L60 12 L76 7' },
  { name: 'Vintage Tees', watching: '1.4k watching', change: '+6.3%', fg: C.aink, path: 'M0 20 L15 21 L30 16 L45 17 L60 12 L76 10' },
  { name: 'Power Tools', watching: '3.0k watching', change: '-2.1%', fg: C.neg, path: 'M0 12 L15 10 L30 14 L45 13 L60 17 L76 18' },
];

export const BOARD = [
  { rank: '1', initials: 'DW', name: 'Deon W.', handle: '@thedealhunter', profit: '$18,420', streak: '23d streak' },
  { rank: '2', initials: 'PN', name: 'Priya N.', handle: '@flipqueen', profit: '$16,890', streak: '17d streak' },
  { rank: '3', initials: 'MR', name: 'Marcus R.', handle: '@stackking', profit: '$15,240', streak: '11d streak' },
  { rank: '4', initials: 'SK', name: 'Sam K.', handle: '@sourceandsell', profit: '$11,200', streak: '9d streak' },
  { rank: '5', initials: 'AB', name: 'Aisha B.', handle: '@resellraja', profit: '$9,870', streak: '6d streak' },
  { rank: '6', initials: 'TM', name: 'Tyler M.', handle: '@flipfast', profit: '$8,240', streak: '5d streak' },
  { rank: '7', initials: 'MR', name: 'You', handle: '@mrhustle', profit: '$3,240', streak: '4d streak', me: true },
];

export const WATCH = [
  { name: 'Air Jordan 4 Retro', source: 'FB MARKETPLACE · 2.1KM', score: '8.7', img: IMG.jordan, i: 0 },
  { name: 'Dyson V11 Absolute', source: 'GUMTREE · 5.4KM', score: '7.9', img: IMG.dyson, i: 1 },
  { name: 'Pokémon 151 Box', source: 'EBAY · ONLINE', score: '9.1', img: IMG.pokemon, i: 2 },
  { name: 'LEGO Hogwarts Castle', source: 'FB MARKETPLACE · 8.0KM', score: '7.2', img: IMG.lego, i: 3 },
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
    name: 'SCOUT', price: '$0', tagline: 'Test the waters', cta: 'Current plan', badge: '',
    bd: L(8), fg: C.t4, ctaBg: 'transparent', ctaBd: L(12), ctaFg: C.t3,
    features: ['10 AI deal scans / day', 'Basic profit calculator', 'Inventory up to 20 items', 'Community Flip Tok feed'],
  },
  {
    name: 'HUSTLER', price: '$19', tagline: 'For serious flippers', cta: 'Upgrade to Hustler', badge: 'MOST POPULAR',
    bd: A(40), fg: C.aink, ctaBg: C.a, ctaBd: C.a, ctaFg: C.ona,
    features: ['Unlimited AI deal scans', 'Real-time price tracker + alerts', 'Scam detection on every listing', 'Unlimited inventory', 'Market trend analytics', 'Prize draw entries x2'],
  },
  {
    name: 'MOGUL', price: '$49', tagline: 'Run it like a business', cta: 'Go Mogul', badge: '',
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

export const NOTIFICATIONS = [
  { title: 'New high-score deal found', body: 'Pokémon 151 Box · Score 9.1 · +$140 profit', time: '2m', img: IMG.pokemon },
  { title: 'Price target hit', body: 'Air Jordan 4 reached your $380 target — now $410', time: '26m', img: IMG.jordan },
  { title: 'Item sold', body: 'Dyson V11 sold on Facebook for $335 (+$95)', time: '1h', img: IMG.dyson },
  { title: 'Scam risk flagged', body: 'A watched listing showed red flags. Review before buying.', time: '3h', img: IMG.scam },
  { title: 'Prize entries earned', body: '+5 entries for closing a verified flip', time: '1d', img: IMG.pokemon },
  { title: 'Weekly recap ready', body: 'You stacked $420 across 3 flips this week', time: '2d', img: IMG.recap },
];

export const VERDICT = [
  { mark: '✓', text: 'High demand — 42 recent sales', bg: A(15), fg: C.aink },
  { mark: '✓', text: 'Priced 38% below market', bg: A(15), fg: C.aink },
  { mark: '!', text: 'Request box & receipt photos', bg: 'rgba(233,196,106,0.15)', fg: C.goldink },
  { mark: '✓', text: 'Recent comparable sales', bg: A(15), fg: C.aink },
];
