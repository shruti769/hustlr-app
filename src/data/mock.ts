/**
 * Static content for the prototype. Values, ordering and copy match the
 * prototype exactly — swap this module for a real API later without touching
 * any screen.
 */

export type Risk = 'Low' | 'Med' | 'High';

export type Deal = {
  id: string;
  title: string;
  longTitle: string;
  cat: string;
  specs: string;
  source: string;
  sourceLong: string;
  buy: string;
  resale: string;
  profit: string;
  roi: string;
  score: string;
  risk: Risk;
  buyN: number;
  sellN: number;
};

export const DEALS: Deal[] = [
  {
    id: 'aj4',
    title: 'Air Jordan 4 Retro',
    longTitle: 'Air Jordan 4 Retro ‘White Cement’',
    cat: 'SNEAKERS',
    specs: 'SNEAKERS · US 10 · USED',
    source: 'FB MARKETPLACE · 2.1KM',
    sourceLong: 'FB MARKETPLACE · 2.1KM · 3H AGO',
    buy: '$200',
    resale: '$410',
    profit: '+$210',
    roi: '105%',
    score: '8.7',
    risk: 'Low',
    buyN: 200,
    sellN: 410,
  },
  {
    id: 'dys',
    title: 'Dyson V11 Absolute',
    longTitle: 'Dyson V11 Absolute',
    cat: 'HOME',
    specs: 'HOME · CORDLESS · USED',
    source: 'GUMTREE · 5.4KM',
    sourceLong: 'GUMTREE · 5.4KM · 6H AGO',
    buy: '$240',
    resale: '$335',
    profit: '+$95',
    roi: '40%',
    score: '7.9',
    risk: 'Low',
    buyN: 240,
    sellN: 335,
  },
  {
    id: 'pkm',
    title: 'Pokémon 151 Box',
    longTitle: 'Pokémon 151 Booster Box',
    cat: 'COLLECTIBLES',
    specs: 'COLLECTIBLES · SEALED',
    source: 'EBAY · ONLINE',
    sourceLong: 'EBAY · ONLINE · 1D AGO',
    buy: '$160',
    resale: '$300',
    profit: '+$140',
    roi: '88%',
    score: '9.1',
    risk: 'Med',
    buyN: 160,
    sellN: 300,
  },
  {
    id: 'lgo',
    title: 'LEGO Hogwarts Castle',
    longTitle: 'LEGO Hogwarts Castle 71043',
    cat: 'TOYS',
    specs: 'TOYS · RETIRED SET',
    source: 'FB MARKETPLACE · 8.0KM',
    sourceLong: 'FB MARKETPLACE · 8.0KM · 2D AGO',
    buy: '$280',
    resale: '$352',
    profit: '+$72',
    roi: '26%',
    score: '7.2',
    risk: 'Low',
    buyN: 280,
    sellN: 352,
  },
  {
    id: 'nsw',
    title: 'Nintendo Switch OLED',
    longTitle: 'Nintendo Switch OLED White',
    cat: 'ELECTRONICS',
    specs: 'ELECTRONICS · BOXED',
    source: 'GUMTREE · 3.3KM',
    sourceLong: 'GUMTREE · 3.3KM · 4H AGO',
    buy: '$320',
    resale: '$410',
    profit: '+$90',
    roi: '28%',
    score: '6.8',
    risk: 'Med',
    buyN: 320,
    sellN: 410,
  },
  {
    id: 'apd',
    title: 'Apple AirPods Pro 2',
    longTitle: 'Apple AirPods Pro 2 (USB-C)',
    cat: 'ELECTRONICS',
    specs: 'ELECTRONICS · USED',
    source: 'FB MARKETPLACE · 1.2KM',
    sourceLong: 'FB MARKETPLACE · 1.2KM · 8H AGO',
    buy: '$180',
    resale: '$245',
    profit: '+$65',
    roi: '36%',
    score: '5.4',
    risk: 'High',
    buyN: 180,
    sellN: 245,
  },
];

export const CATEGORIES = ['All', 'Sneakers', 'Electronics', 'Collectibles', 'Home', 'Toys'];

export const COMPS = [
  { cond: 'Used · VNDS', meta: 'eBay · 4d ago', price: '$405' },
  { cond: 'Used · 9/10', meta: 'StockX · 1w ago', price: '$420' },
  { cond: 'Used · 8.5/10', meta: 'FB · 1w ago', price: '$390' },
  { cond: 'Used · 9/10', meta: 'eBay · 2w ago', price: '$415' },
];

export type Flip = {
  id: string;
  initials: string;
  name: string;
  handle: string;
  profit: string;
  bought: string;
  sold: string;
  roi: string;
  item: string;
  caption: string;
  likes: string;
  comments: string;
};

export const FLIPS: Flip[] = [
  {
    id: 'f1',
    initials: 'MR',
    name: 'Marcus R.',
    handle: '@stackking',
    profit: '+$210',
    bought: '$200',
    sold: '$410',
    roi: '105%',
    item: 'AIR JORDAN 4 RETRO',
    caption:
      'Picked these up local, sold same week. Clean 105% flip. AI flagged it before the listing hit the feeds.',
    likes: '1.2k',
    comments: '86',
  },
  {
    id: 'f2',
    initials: 'PN',
    name: 'Priya N.',
    handle: '@flipqueen',
    profit: '+$95',
    bought: '$240',
    sold: '$335',
    roi: '40%',
    item: 'DYSON V11 ABSOLUTE',
    caption: 'Boring flips pay rent. Bought used, deep cleaned, relisted. Done in 3 days.',
    likes: '892',
    comments: '41',
  },
  {
    id: 'f3',
    initials: 'DW',
    name: 'Deon W.',
    handle: '@thedealhunter',
    profit: '+$140',
    bought: '$160',
    sold: '$300',
    roi: '88%',
    item: 'POKÉMON 151 BOX',
    caption: 'Sealed boxes only going up. Holding two, flipped one to fund the next.',
    likes: '2.1k',
    comments: '173',
  },
  {
    id: 'f4',
    initials: 'SK',
    name: 'Sam K.',
    handle: '@sourceandsell',
    profit: '+$72',
    bought: '$280',
    sold: '$352',
    roi: '26%',
    item: 'LEGO HOGWARTS CASTLE',
    caption: 'Retired set. Patience play. Listed at full retail+ and it moved.',
    likes: '640',
    comments: '28',
  },
];

export const LEADERS = [
  { rank: '1', initials: 'DW', name: 'Deon W.', handle: '@thedealhunter', total: '$18,420', streak: '23d streak' },
  { rank: '2', initials: 'PN', name: 'Priya N.', handle: '@flipqueen', total: '$16,890', streak: '19d streak' },
  { rank: '3', initials: 'MR', name: 'Marcus R.', handle: '@stackking', total: '$15,240', streak: '31d streak' },
  { rank: '4', initials: 'SK', name: 'Sam K.', handle: '@sourceandsell', total: '$11,200', streak: '8d streak' },
  { rank: '5', initials: 'AB', name: 'Aisha B.', handle: '@resellraja', total: '$9,870', streak: '12d streak' },
  { rank: '6', initials: 'TM', name: 'Tyler M.', handle: '@flipfast', total: '$8,240', streak: '5d streak' },
  { rank: '7', initials: 'MR', name: 'You', handle: '@mrhustle', total: '$3,240', streak: '4d streak' },
];

export type InventoryStatus = 'LISTED' | 'SOLD' | 'SHIPPED' | 'SOURCED';

export const INVENTORY: { title: string; sku: string; profit: string; status: InventoryStatus }[] = [
  { title: 'Air Jordan 4 Retro', sku: 'AJ4-WHT-10', profit: '+$210', status: 'LISTED' },
  { title: 'Dyson V11 Absolute', sku: 'DYS-V11-02', profit: '+$95', status: 'SOLD' },
  { title: 'Pokémon 151 Box', sku: 'PKM-151-SB', profit: '+$140', status: 'SHIPPED' },
  { title: 'LEGO Hogwarts Castle', sku: 'LGO-HOG-71', profit: '+$72', status: 'LISTED' },
  { title: 'Nintendo Switch OLED', sku: 'NSW-OLED-W', profit: '+$90', status: 'SOURCED' },
];

export const PLATFORMS = ['eBay', 'Facebook', 'Gumtree', 'StockX', 'Depop'];

export const PROFILE_ROWS = (plan: string) => [
  { label: 'Email', value: 'mason@hustlr.app' },
  { label: 'Member since', value: 'Jan 2024' },
  { label: 'Plan', value: `${plan} · $19/mo` },
  { label: 'Region', value: 'Sydney, AU' },
];

export const NOTIFICATIONS = [
  {
    icon: '🔥',
    title: 'New high-score deal found',
    body: 'Pokémon 151 Box · Score 9.1 · +$140 profit',
    time: '2m',
    hot: true,
    iconBg: 'rgba(32,197,101,0.14)',
  },
  {
    icon: '🎯',
    title: 'Price target hit',
    body: 'Air Jordan 4 reached your $380 target — now $410',
    time: '18m',
    hot: true,
    iconBg: 'rgba(32,197,101,0.14)',
  },
  {
    icon: '💸',
    title: 'Item sold',
    body: 'Dyson V11 sold on Facebook for $335 (+$95)',
    time: '1h',
    hot: true,
    iconBg: 'rgba(232,236,233,0.07)',
  },
  {
    icon: '⚠',
    title: 'Scam risk flagged',
    body: 'A watched listing showed red flags. Review before buying.',
    time: '3h',
    hot: false,
    iconBg: 'rgba(255,92,92,0.14)',
  },
  {
    icon: '🎟',
    title: 'Prize entries earned',
    body: '+5 entries for closing a verified flip.',
    time: '5h',
    hot: false,
    iconBg: 'rgba(233,196,106,0.14)',
  },
  {
    icon: '📊',
    title: 'Weekly recap ready',
    body: 'You stacked $420 across 3 flips this week.',
    time: '1d',
    hot: false,
    iconBg: 'rgba(232,236,233,0.07)',
  },
];

export const ENTRY_WAYS = [
  { label: 'Close a verified flip', value: '+5', amt: 5 },
  { label: 'Post on Flip Tok', value: '+2', amt: 2 },
  { label: 'Refer a hustler', value: '+10', amt: 10 },
  { label: 'Daily check-in', value: '+1', amt: 1 },
];

export const PAST_WINNERS = [
  { name: 'Jordan T.', meta: '@jflips · May 2026', prize: '$500' },
  { name: 'Mia C.', meta: '@miasteals · Apr 2026', prize: '$500' },
];

export type PlanKey = 'Scout' | 'Hustler' | 'Mogul';

export const PLANS: {
  key: PlanKey;
  name: string;
  price: string;
  tagline: string;
  popular: boolean;
  features: string[];
}[] = [
  {
    key: 'Scout',
    name: 'SCOUT',
    price: '$0',
    tagline: 'Test the waters',
    popular: false,
    features: [
      '10 AI deal scans / day',
      'Basic profit calculator',
      'Inventory up to 20 items',
      'Community Flip Tok feed',
    ],
  },
  {
    key: 'Hustler',
    name: 'HUSTLER',
    price: '$19',
    tagline: 'For serious flippers',
    popular: true,
    features: [
      'Unlimited AI deal scans',
      'Real-time price tracker + alerts',
      'Scam detection on every listing',
      'Unlimited inventory',
      'Market trend analytics',
      'Prize draw entries x2',
    ],
  },
  {
    key: 'Mogul',
    name: 'MOGUL',
    price: '$49',
    tagline: 'Run it like a business',
    popular: false,
    features: [
      'Everything in Hustler',
      'Multi-account inventory sync',
      'Bulk listing analysis',
      'Priority deal alerts (5 min early)',
      'Dedicated account manager',
      'Prize draw entries x5',
    ],
  },
];

export const DASHBOARD_BARS = [38, 52, 30, 64, 48, 72, 58, 84, 66, 92, 74, 100];

export const TRACKER_BASE = [
  { title: 'Air Jordan 4 Retro', now: '$410', target: '$380', change: '+3.2%', up: true, bar: '82%' },
  { title: 'Pokémon 151 Box', now: '$300', target: '$250', change: '+8.4%', up: true, bar: '94%' },
  { title: 'Dyson V11', now: '$335', target: '$350', change: '-2.1%', up: false, bar: '56%' },
  { title: 'Switch OLED', now: '$410', target: '$400', change: '-1.4%', up: false, bar: '48%' },
];

export const TRACKER_EXTRA = {
  title: 'Apple AirPods Pro 2',
  now: '$245',
  target: '$220',
  change: '+1.1%',
  up: true,
  bar: '40%',
};

export const TRENDS = [
  { title: 'Sneakers', watching: '4.2k', change: '+12.4%', up: true, bar: '62%' },
  { title: 'Trading Cards', watching: '6.8k', change: '+28.1%', up: true, bar: '88%' },
  { title: 'Electronics', watching: '9.1k', change: '-4.2%', up: false, bar: '34%' },
  { title: 'LEGO Sets', watching: '2.1k', change: '+9.8%', up: true, bar: '54%' },
  { title: 'Vintage Tees', watching: '1.4k', change: '+6.3%', up: true, bar: '44%' },
  { title: 'Power Tools', watching: '3.0k', change: '-2.1%', up: false, bar: '28%' },
];

/** The prototype's screen index, used by the in-app screen directory. */
export const SCREEN_INDEX: { label: string; path: string }[] = [
  { label: 'Home', path: '/home' },
  { label: 'Hot Deals', path: '/deals' },
  { label: 'Deal Detail', path: '/deal/aj4' },
  { label: 'Quick Analyser', path: '/quick' },
  { label: 'Analyse Listing', path: '/analyser' },
  { label: 'Flip Tok', path: '/fliptok' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Inventory', path: '/inventory' },
  { label: 'Add Listing', path: '/add-listing' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Calculator', path: '/calculator' },
  { label: 'Price Tracker', path: '/tracker' },
  { label: 'Market Trends', path: '/trends' },
  { label: 'Watchlist', path: '/watchlist' },
  { label: 'Prize Draw', path: '/prize' },
  { label: 'Plans', path: '/plans' },
  { label: 'Notifications', path: '/notifications' },
  { label: 'Profile', path: '/profile' },
];
