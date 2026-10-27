import { ART, IMG, PUZZLE } from './data';
import type { BoardEntry, Deal, Flip, InvItem, Notice, Profile, Puzzle, StoreItem, Tracked, Trend, Verdict } from './model';

/** The prototype's own data — used whenever no Supabase project is configured. */

const VERDICT: Verdict[] = [
  { ok: true, text: 'High demand — 42 recent sales' },
  { ok: true, text: 'Priced 38% below market' },
  { ok: false, text: 'Request box & receipt photos' },
  { ok: true, text: 'Recent comparable sales' },
];

export const DEMO_DEALS: Deal[] = [
  { id: 1, name: 'Air Jordan 4 Retro', source: 'FB MARKETPLACE · 2.1KM', category: 'Sneakers', buy: 200, resale: 410, score: 8.7, risk: 'Low', img: IMG.jordan, imageKey: 'jordan', verdict: VERDICT },
  { id: 2, name: 'Dyson V11 Absolute', source: 'GUMTREE · 5.4KM', category: 'Home', buy: 240, resale: 335, score: 7.9, risk: 'Low', img: IMG.dyson, imageKey: 'dyson', verdict: VERDICT },
  { id: 3, name: 'Pokémon 151 Box', source: 'EBAY · ONLINE', category: 'Collectibles', buy: 159, resale: 299, score: 9.1, risk: 'Med', img: IMG.pokemon, imageKey: 'pokemon', verdict: VERDICT },
  { id: 4, name: 'LEGO Hogwarts Castle', source: 'FB MARKETPLACE · 8.0KM', category: 'Toys', buy: 280, resale: 352, score: 7.2, risk: 'Low', img: IMG.lego, imageKey: 'lego', verdict: VERDICT },
  { id: 5, name: 'Nintendo Switch OLED', source: 'GUMTREE · 3.3KM', category: 'Electronics', buy: 320, resale: 410, score: 6.8, risk: 'Med', img: IMG.nswitch, imageKey: 'nswitch', verdict: VERDICT },
  { id: 6, name: 'Apple AirPods Pro 2', source: 'FB MARKETPLACE · 1.2KM', category: 'Electronics', buy: 180, resale: 245, score: 5.4, risk: 'High', img: IMG.airpods, imageKey: null, verdict: VERDICT },
];

const at = new Date(0).toISOString();
export const DEMO_INVENTORY: InvItem[] = [
  { id: 1, name: 'Air Jordan 4 Retro', sku: 'AJ4-WHT-10', buy: 200, list: 410, status: 'Listed', img: IMG.jordan, createdAt: at, soldAt: null },
  { id: 2, name: 'Dyson V11 Absolute', sku: 'DYS-V11-02', buy: 240, list: 335, status: 'Listed', img: IMG.dyson, createdAt: at, soldAt: null },
  { id: 3, name: 'Pokémon 151 Box', sku: 'PKM-151-SB', buy: 159, list: 299, status: 'Sold', img: IMG.pokemon, createdAt: at, soldAt: at },
  { id: 4, name: 'LEGO Hogwarts Castle', sku: 'LGO-HOG-71', buy: 280, list: 352, status: 'Sourcing', img: IMG.lego, createdAt: at, soldAt: null },
  { id: 5, name: 'Nintendo Switch OLED', sku: 'NSW-OLED-W', buy: 320, list: 410, status: 'Listed', img: IMG.nswitch, createdAt: at, soldAt: null },
];

export const DEMO_FLIPS: Flip[] = [
  { id: 1, initials: 'MR', name: 'Marcus R.', handle: '@stackking', bought: 200, sold: 410, img: IMG.flip1, likes: 1200, shares: 86, copy: 'Picked these up local, sold same week. Clean 105% flip. AI flagged it before the listing hit the feeds.' },
  { id: 2, initials: 'PN', name: 'Priya N.', handle: '@flipqueen', bought: 240, sold: 335, img: IMG.dyson, likes: 870, shares: 41, copy: 'Cordless vacuums never sit. Two days on Gumtree and gone.' },
  { id: 3, initials: 'DW', name: 'Deon W.', handle: '@thedealhunter', bought: 159, sold: 299, img: IMG.pokemon, likes: 2400, shares: 155, copy: 'Sealed boxes only. Score was 9.1 so I bought three.' },
  { id: 4, initials: 'SK', name: 'Sam K.', handle: '@sourceandsell', bought: 280, sold: 352, img: IMG.lego, likes: 640, shares: 28, copy: 'Retired LEGO sets are slow but safe. Every single time.' },
];

export const DEMO_BOARD: BoardEntry[] = [
  { initials: 'DW', name: 'Deon W.', handle: '@thedealhunter', profit: 18420, streakDays: 23 },
  { initials: 'PN', name: 'Priya N.', handle: '@flipqueen', profit: 16890, streakDays: 17 },
  { initials: 'MR', name: 'Marcus R.', handle: '@stackking', profit: 15240, streakDays: 11 },
  { initials: 'SK', name: 'Sam K.', handle: '@sourceandsell', profit: 11200, streakDays: 9 },
  { initials: 'AB', name: 'Aisha B.', handle: '@resellraja', profit: 9870, streakDays: 6 },
  { initials: 'TM', name: 'Tyler M.', handle: '@flipfast', profit: 8240, streakDays: 5 },
  { initials: 'MR', name: 'You', handle: '@mrhustle', profit: 3240, streakDays: 4, me: true },
];

export const DEMO_TRENDS: Trend[] = [
  { name: 'Sneakers', watching: '4.2k watching', change: 12.4, spark: 'M0 22 L15 18 L30 20 L45 12 L60 9 L76 4' },
  { name: 'Trading Cards', watching: '6.8k watching', change: 28.1, spark: 'M0 25 L15 22 L30 15 L45 14 L60 8 L76 2' },
  { name: 'Electronics', watching: '9.1k watching', change: -4.2, spark: 'M0 8 L15 11 L30 10 L45 16 L60 15 L76 21' },
  { name: 'LEGO Sets', watching: '2.1k watching', change: 9.8, spark: 'M0 21 L15 19 L30 17 L45 14 L60 12 L76 7' },
  { name: 'Vintage Tees', watching: '1.4k watching', change: 6.3, spark: 'M0 20 L15 21 L30 16 L45 17 L60 12 L76 10' },
  { name: 'Power Tools', watching: '3.0k watching', change: -2.1, spark: 'M0 12 L15 10 L30 14 L45 13 L60 17 L76 18' },
];

export const DEMO_TRACKED: Tracked[] = [
  { id: 1, name: 'Air Jordan 4 Retro', now: 410, target: 380, change: 3.2 },
  { id: 2, name: 'Pokémon 151 Box', now: 299, target: 250, change: 8.4 },
  { id: 3, name: 'Dyson V11', now: 335, target: 350, change: -2.1, pct: 0.78 },
  { id: 4, name: 'Switch OLED', now: 410, target: 400, change: -1.4, pct: 0.88 },
];

const minsAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();
export const DEMO_NOTICES: Notice[] = [
  { id: 1, title: 'New high-score deal found', body: 'Pokémon 151 Box · Score 9.1 · +$140 profit', img: IMG.pokemon, createdAt: minsAgo(2) },
  { id: 2, title: 'Price target hit', body: 'Air Jordan 4 reached your $380 target — now $410', img: IMG.jordan, createdAt: minsAgo(26) },
  { id: 3, title: 'Item sold', body: 'Dyson V11 sold on Facebook for $335 (+$95)', img: IMG.dyson, createdAt: minsAgo(60) },
  { id: 4, title: 'Scam risk flagged', body: 'A watched listing showed red flags. Review before buying.', img: IMG.scam, createdAt: minsAgo(180) },
  { id: 5, title: 'Prize entries earned', body: '+5 entries for closing a verified flip', img: IMG.pokemon, createdAt: minsAgo(1440) },
  { id: 6, title: 'Weekly recap ready', body: 'You stacked $420 across 3 flips this week', img: IMG.recap, createdAt: minsAgo(2880) },
];

export const DEMO_STORE: StoreItem[] = [
  { key: 'early', group: 'POWERUPS', name: 'Early deal alerts · 15 min', desc: 'See new high-score deals 15 minutes before free users.', cost: 500 },
  { key: 'scan', group: 'POWERUPS', name: 'Scan burst · 25 extra', desc: '25 extra AI listing scans, valid 24 hours.', cost: 250 },
  { key: 'risk', group: 'POWERUPS', name: 'Deep scam check ×5', desc: 'Five full authenticity reports on watched listings.', cost: 300 },
  { key: 'b1', group: 'BADGES', name: 'Verified Flipper', desc: 'Permanent badge on your Flip Tok posts.', cost: 400 },
  { key: 'b2', group: 'BADGES', name: 'Appraiser', desc: 'Awarded for three Price It Right wins.', cost: 600 },
  { key: 't1', group: 'THEMES', name: 'Graphite theme', desc: 'Neutral monochrome interface.', cost: 350 },
  { key: 't2', group: 'THEMES', name: 'Slate theme', desc: 'Cool blue-grey interface.', cost: 350 },
];

export const DEMO_PUZZLE: Puzzle = {
  name: PUZZLE.name, meta: PUZZLE.meta, img: ART.puzzle,
  closesAt: new Date(Date.now() + (3 * 24 + 4) * 3600000 + 60000).toISOString(),
  guess: null, reward: null, actual: null,
};

export const DEMO_PROFILE: Profile = {
  name: 'Mason Reid', handle: '@mrhustle', email: 'mason@hustlr.app', region: 'Sydney, AU',
  plan: 'hustler', memberSince: new Date(2024, 0, 15).toISOString(),
};
