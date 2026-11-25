import { IMG, type Img, type Screen } from './data';

/**
 * Data for the rewards layer from the v2 prototype: XP and levels, tickets,
 * Flash Alert tokens, HUSTLE or HOLD, the Live Deal Stream, Missed
 * Connections, the Reward Spinner, upgrades, cosmetics and achievements.
 */

/** 24px stroke icons, drawn at 1.5 stroke. */
export const IC = {
  spin: ['M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18Z', 'M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4'],
  gift: ['M4 10h16v10H4Z', 'M3 7h18v3H3Z', 'M12 7v13', 'M12 7s-1.5-4-4-4a2 2 0 0 0 0 4Z', 'M12 7s1.5-4 4-4a2 2 0 0 1 0 4Z'],
  trophy: ['M7 4h10v5a5 5 0 0 1-10 0Z', 'M7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3', 'M12 14v3M8 20h8'],
  podium: ['M3 20v-7h6v7M9 20V8h6v12M15 20v-5h6v5', 'M3 20h18'],
  bolt: ['M13 2 4.5 13.5H11L10 22l8.5-11.5H12Z'],
  palette: ['M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.8-1.8 0-1.2-1-1.6-1-2.6 0-1 .8-1.6 1.8-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3Z', 'M7.5 11.5h.01M9.5 7.5h.01M14.5 7.5h.01'],
  target: ['M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18Z', 'M12 7.5a4.5 4.5 0 1 1 0 9a4.5 4.5 0 1 1 0-9Z', 'M12 11.6v.8'],
  radius: ['M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18Z', 'M12 12l5.5-5.5', 'M12 12h.01'],
  scan: ['M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3', 'M4 12h16'],
  hold: ['M4 7h16v4H4Z', 'M5 11v8h14v-8', 'M10 15h4'],
  eye: ['M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z', 'M12 9.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5Z'],
  ghost: ['M6 20V10a6 6 0 0 1 12 0v10l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5Z', 'M10 10h.01M14 10h.01'],
  vault: ['M4 5h16v14H4Z', 'M12 9a3 3 0 1 1 0 6a3 3 0 1 1 0-6Z', 'M4 9h2M4 15h2'],
  script: ['M8 4h8l4 4v12H8Z', 'M16 4v4h4', 'M11 12h6M11 16h4', 'M4 8v12h4'],
  moon: ['M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z'],
  bridge: ['M3 17h18', 'M5 17V9M19 17V9', 'M5 9c2 3 5 4 7 4s5-1 7-4', 'M12 13v4'],
  boxes: ['M3 13h8v7H3Z', 'M13 13h8v7h-8Z', 'M8 4h8v7H8Z'],
  shield: ['M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z', 'M9 12l2 2 4-4'],
  lock: ['M6 11h12v9H6Z', 'M8.5 11V8a3.5 3.5 0 0 1 7 0v3'],
  ticket: ['M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Z', 'M14 6v12'],
  check: ['M5 12.5 10 17l9-10'],
  alert: ['M12 3 2.5 20h19Z', 'M12 9.5v4.5M12 17h.01'],
  speed: ['M12 20a8 8 0 1 1 8-8', 'M12 12l4-4', 'M4 12h2M12 4v2'],
  coin: ['M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18Z', 'M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.5 0-2.5.8-2.5 1.9 0 2.6 5.2 1.4 5.2 4.1 0 1.2-1.1 2-2.7 2-1.2 0-2.2-.5-2.7-1.4', 'M12 6.5v1.5M12 16v1.5'],
  people: ['M9 11a3.5 3.5 0 1 1 0-7a3.5 3.5 0 1 1 0 7Z', 'M2.5 20a6.5 6.5 0 0 1 13 0', 'M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14.5a6.5 6.5 0 0 1 3.5 5.5'],
} satisfies Record<string, string[]>;

export type IconKey = keyof typeof IC;
export type Tone = 'a' | 'gold' | 'neg';

export type HohItem = {
  name: string; img: Img; platform: string; cond: string; loc: string; listed: string; demand: string; tone: Tone;
  price: number; resale: number; net: string; answer: 'hustle' | 'hold'; reason: string;
};

export const HOH: HohItem[] = [
  { name: "Air Jordan 4 Retro 'Military Black' · US 10", img: IMG.jordan, platform: 'FB MARKETPLACE', cond: 'Used 9/10', loc: 'Parramatta · 4.2 km', listed: '12M AGO', demand: 'HIGH DEMAND · 31 SOLD / 30D', tone: 'a', price: 190, resale: 395, net: '+$148', answer: 'hustle', reason: 'Sub-$200 for a near-deadstock pair in a core size. 31 sold in the last 30 days at $380+.' },
  { name: 'Dyson V11 Absolute · 2 batteries', img: IMG.dyson, platform: 'GUMTREE', cond: 'Used 7/10', loc: 'Chatswood · 6.8 km', listed: '34M AGO', demand: 'SATURATED · 58 ACTIVE', tone: 'neg', price: 310, resale: 335, net: '-$22', answer: 'hold', reason: 'Only a $25 spread. After 12.9% fees and postage this loses money, and 58 others are listed.' },
  { name: 'Pokémon 151 Booster Box · Sealed', img: IMG.pokemon, platform: 'EBAY', cond: 'Sealed', loc: 'Newtown · ships', listed: '3M AGO', demand: 'RISING · +28% / 90D', tone: 'a', price: 140, resale: 299, net: '+$118', answer: 'hustle', reason: 'Sealed 151 is still climbing and this is 53% under recent comps. Seal photos check out.' },
  { name: 'LEGO Hogwarts Castle 71043 · Built', img: IMG.lego, platform: 'FB MARKETPLACE', cond: 'Complete', loc: 'Ryde · 11 km', listed: '1H AGO', demand: 'STEADY · 9 SOLD / 30D', tone: 'gold', price: 340, resale: 352, net: '-$38', answer: 'hold', reason: 'A built set with a $12 spread. It needs to be under $250 to clear fees and the drive.' },
  { name: 'Nintendo Switch OLED · White', img: IMG.nswitch, platform: 'GUMTREE', cond: 'Used 9/10', loc: 'Surry Hills · 1.9 km', listed: '6M AGO', demand: 'FAST MOVER · 2–3 DAYS', tone: 'a', price: 220, resale: 410, net: '+$146', answer: 'hustle', reason: 'Seller wants a quick sale. OLEDs clear in 2–3 days and this one is 1.9 km away.' },
  { name: 'Apple AirPods Pro 2 · Sealed', img: IMG.airpods, platform: 'FB MARKETPLACE', cond: 'Sealed', loc: 'Bondi · 4.4 km', listed: '2M AGO', demand: '3 RED FLAGS', tone: 'neg', price: 90, resale: 245, net: 'Likely fake', answer: 'hold', reason: 'Too good to be true: new account, stock photos and no serial number. Classic counterfeit pattern.' },
];

/** `deal` is the index of the matching deal in the deals feed. */
export type StreamListing = { name: string; img: Img; platform: string; loc: string; price: number; resale: number; deal: number };

export const STREAM_POOL: StreamListing[] = [
  { name: "Air Jordan 1 Mid 'Chicago'", img: IMG.jordan, platform: 'FB', loc: 'Newtown · 3.1 km', price: 140, resale: 260, deal: 0 },
  { name: 'Dyson Airwrap Complete', img: IMG.dyson, platform: 'GUMTREE', loc: 'Chatswood · 6.8 km', price: 280, resale: 460, deal: 1 },
  { name: 'Charizard ex SIR · PSA 9', img: IMG.pokemon, platform: 'EBAY', loc: 'Online', price: 95, resale: 190, deal: 2 },
  { name: 'LEGO Millennium Falcon 75257', img: IMG.lego, platform: 'FB', loc: 'Ryde · 11 km', price: 110, resale: 185, deal: 3 },
  { name: 'Switch Lite + 3 games', img: IMG.nswitch, platform: 'GUMTREE', loc: 'Surry Hills · 1.9 km', price: 120, resale: 215, deal: 4 },
  { name: 'AirPods Max · Space Grey', img: IMG.airpods, platform: 'FB', loc: 'Bondi · 4.4 km', price: 260, resale: 410, deal: 5 },
  { name: "Nike Dunk Low 'Panda' · US 9", img: IMG.jordan, platform: 'FB', loc: 'Marrickville · 5.0 km', price: 85, resale: 165, deal: 0 },
  { name: 'Pokémon Evolving Skies ETB', img: IMG.pokemon, platform: 'GUMTREE', loc: 'Parramatta · 18 km', price: 160, resale: 275, deal: 2 },
];

export type MissedListing = {
  name: string; img: Img; price: number; resale: number; profit: number; ago: string; reason: string; fixLabel: string; fix: Screen;
  /** Category a Flash Alert armed from this miss watches, and the deal it came from. */
  category?: string; ref?: string;
};

export const MISSED: MissedListing[] = [
  { name: 'Nintendo Switch OLED', category: 'Electronics', img: IMG.nswitch, price: 210, resale: 410, profit: 150, ago: 'SOLD 41M AGO', reason: 'Another flipper messaged the seller 38 seconds before you saw it.', fixLabel: 'Arm a Flash Alert', fix: 'flash' },
  { name: "Air Jordan 4 'Bred' · US 10", category: 'Sneakers', img: IMG.jordan, price: 180, resale: 390, profit: 158, ago: 'SOLD 2H AGO', reason: 'Listed at 6:12am while your alerts were paused overnight.', fixLabel: 'Try Night Crawler', fix: 'upgrades' },
  { name: 'Pokémon Evolving Skies ETB', img: IMG.pokemon, price: 120, category: 'Collectibles', resale: 260, profit: 106, ago: 'SOLD 3H AGO', reason: '14 km away — just outside your 10 km search radius.', fixLabel: '+50 km radius', fix: 'redeem' },
  { name: 'LEGO Titanic 10294', category: 'Toys', img: IMG.lego, price: 420, resale: 640, profit: 118, ago: 'SOLD 5H AGO', reason: "Collectibles › LEGO isn't in your saved filters.", fixLabel: 'Add to filters', fix: 'deals' },
];

export type RedeemDef = {
  key: string; name: string; desc: string; dur: string; cost: number; icon: IconKey;
  repeat?: boolean; flash?: number; minLevel?: number;
};

export const REDEEM: RedeemDef[] = [
  { key: 'flash1', name: 'Flash Alert Token', desc: 'One instant alert the moment a high-demand deal matching your search appears.', dur: '1 TOKEN', cost: 100, icon: 'bolt', repeat: true, flash: 1 },
  { key: 'radius', name: '+50 KM Search Radius', desc: 'Search beyond your 10 km radius — up to 60 km.', dur: '24 HOURS', cost: 250, icon: 'radius' },
  { key: 'scan', name: 'Faster scanning', desc: 'Listings scanned every 30 s instead of every 2 min.', dur: '12 HOURS', cost: 180, icon: 'scan' },
  { key: 'flash3', name: 'Flash Alert Tokens ×3', desc: 'Three instant, high-priority alerts for listings you care about.', dur: '3 TOKENS', cost: 250, icon: 'bolt', repeat: true, flash: 3 },
  { key: 'hold5', name: 'Extra Hold Slots · +5', desc: 'Save up to 15 listings in your Hold Pile.', dur: '7 DAYS', cost: 300, icon: 'hold' },
  { key: 'sniper', name: 'Sniper Boost', desc: 'Temporary Sniper Mode — auto-alert the instant a listing under your target price goes live.', dur: '1 HOUR', cost: 500, icon: 'target', minLevel: 13 },
  { key: 'intel', name: 'Counter Intel', desc: 'See how many other flippers are watching a listing.', dur: '24 HOURS', cost: 600, icon: 'eye' },
];

export type PremiumDef = {
  name: string; why: string; benefit: string; icon: IconKey;
  via: 'reward' | 'plan' | 'mogul' | 'level'; key?: string; method?: string; level?: number;
};

export const PREMIUM: PremiumDef[] = [
  { name: 'Sniper Mode', why: 'Be first to message on underpriced listings.', benefit: 'Auto-alert the instant a listing under your target price goes live.', icon: 'target', via: 'reward', key: 'sniper', method: 'MOGUL PLAN · OR SNIPER BOOST 500 TICKETS' },
  { name: 'Radius Breach', why: 'More supply when your local market is dry.', benefit: 'Push your search past 50 km — up to 200 km on Mogul.', icon: 'radius', via: 'reward', key: 'radius', method: '250 TICKETS / 24 H' },
  { name: 'Shadow Mode', why: "Sellers can't see you're a reseller.", benefit: 'Browse and message sellers without revealing your profile.', icon: 'ghost', via: 'plan' },
  { name: 'Multi-Vault', why: 'Run several stores without spreadsheets.', benefit: 'Sync inventory across multiple seller accounts.', icon: 'vault', via: 'mogul' },
  { name: 'Ghost Scripts', why: 'Send polished offers in seconds.', benefit: 'Saved offer templates that auto-fill when you message.', icon: 'script', via: 'plan' },
  { name: 'Counter Intel', why: 'Know when to move fast or hold back.', benefit: 'See how many other flippers are watching a listing.', icon: 'eye', via: 'reward', key: 'intel', method: '600 TICKETS / 24 H' },
  { name: 'Night Crawler', why: 'Catch the 2am listings everyone else sleeps through.', benefit: 'Overnight alerts 12–6am with a morning digest.', icon: 'moon', via: 'level', level: 15 },
  { name: 'Platform Bridge', why: 'Reach more buyers and sell faster.', benefit: 'Cross-list to five platforms in one tap.', icon: 'bridge', via: 'mogul' },
  { name: 'Bulk Offloader', why: 'Clear bales and lots in minutes.', benefit: 'List 20+ items from one photo set.', icon: 'boxes', via: 'mogul' },
  { name: 'Price Shield', why: "Sell before a price drop eats your margin.", benefit: "Warns you if a held item's resale value drops 10%.", icon: 'shield', via: 'plan' },
];

/** Cosmetic preview tile: `preview` is a CSS background, `inner*` style the sample chip. */
export type Cosmetic = {
  key: string; name: string; type: string; cost: number; minLevel?: number;
  preview: string; fg: string; sample: string;
  innerBg: string; innerBd: string; innerRadius: string; innerPad: string;
};

const S3 = '#16201A';
const S1 = '#0C0F0D';
const GOLD = '#E9C46A';
const ACC = '#20C565';

export const COSMETICS: Cosmetic[] = [
  { key: 'midnight', name: 'Midnight Hustle Theme', type: 'APP THEME', cost: 400, preview: 'linear-gradient(140deg, #0B1026 0%, #221C52 100%)', fg: '#A9B4FF', sample: 'Aa', innerBg: 'rgba(169,180,255,0.12)', innerBd: '1px solid rgba(169,180,255,0.35)', innerRadius: '12px', innerPad: '10px 14px' },
  { key: 'retro', name: 'Retro Thrifter Theme', type: 'APP THEME', cost: 400, preview: 'linear-gradient(140deg, #2B1D0E 0%, #7A4E1D 100%)', fg: '#F3C77E', sample: 'Aa', innerBg: 'rgba(243,199,126,0.12)', innerBd: '1px solid rgba(243,199,126,0.4)', innerRadius: '12px', innerPad: '10px 14px' },
  { key: 'golden', name: 'Golden Era Border', type: 'AVATAR FRAME', cost: 300, preview: S3, fg: GOLD, sample: 'MR', innerBg: S1, innerBd: `3px solid ${GOLD}`, innerRadius: '50%', innerPad: '14px 12px' },
  { key: 'despair', name: 'Sellers Despair Chat Bubble', type: 'CHAT BUBBLE', cost: 150, preview: S3, fg: '#E7EEF6', sample: 'Is $5 ok?', innerBg: '#3B4A5C', innerBd: 'none', innerRadius: '14px 14px 14px 3px', innerPad: '8px 12px' },
  { key: 'lowball', name: 'Lowball Legend Title', type: 'PROFILE TITLE', cost: 200, preview: S3, fg: GOLD, sample: 'LOWBALL LEGEND', innerBg: 'rgba(233,196,106,0.12)', innerBd: '1px solid rgba(233,196,106,0.4)', innerRadius: '7px', innerPad: '5px 9px' },
  { key: 'neon', name: 'Neon Flare Scraper Grid', type: 'SCANNER SKIN', cost: 350, preview: 'linear-gradient(0deg, rgba(0,255,224,0.12) 1px, transparent 1px) 0 0 / 14px 14px, linear-gradient(90deg, rgba(0,255,224,0.12) 1px, #061214 1px) 0 0 / 14px 14px', fg: '#39FFE0', sample: 'SCANNING', innerBg: 'transparent', innerBd: '1px solid #39FFE0', innerRadius: '6px', innerPad: '5px 9px' },
  { key: 'paper', name: 'Vintage Paper Skin', type: 'CARD SKIN', cost: 350, preview: 'linear-gradient(140deg, #EDE3CC 0%, #D9C9A6 100%)', fg: '#5A4630', sample: '$148', innerBg: 'transparent', innerBd: '1px dashed #8C7550', innerRadius: '6px', innerPad: '6px 11px' },
  { key: 'popper', name: 'Profit Popper Animation', type: 'CELEBRATION', cost: 250, preview: `radial-gradient(circle at 20% 30%, #E9C46A 0 3px, transparent 4px), radial-gradient(circle at 78% 24%, #20C565 0 3px, transparent 4px), radial-gradient(circle at 66% 76%, #FF8A4C 0 3px, transparent 4px), radial-gradient(circle at 30% 78%, #A78BFA 0 3px, transparent 4px), ${S3}`, fg: ACC, sample: '+$148', innerBg: 'transparent', innerBd: 'none', innerRadius: '0', innerPad: '0' },
  { key: 'cyber', name: 'Cyber Broker Accent', type: 'UI ACCENT', cost: 300, preview: 'linear-gradient(140deg, #14001F 0%, #3A0A4F 100%)', fg: '#FF4FD8', sample: 'BUY', innerBg: 'rgba(255,79,216,0.14)', innerBd: '1px solid #FF4FD8', innerRadius: '8px', innerPad: '6px 12px' },
  { key: 'elite', name: 'Elite Badge Indicator', type: 'BADGE', cost: 0, minLevel: 20, preview: S3, fg: '#0B0D0B', sample: 'ELITE', innerBg: 'linear-gradient(135deg, #F5DE9B 0%, #E9C46A 100%)', innerBd: 'none', innerRadius: '7px', innerPad: '5px 10px' },
];

export type Wedge = {
  label: string; name: string; desc: string; kind: 'FUNCTIONAL' | 'COSMETIC'; weight: number;
  left?: string; redeem?: string; flash?: number; cos?: string;
};

/** Reward Spinner wedges, clockwise from the top. */
export const RSW: Wedge[] = [
  { label: '2× SCAN', left: '6H', name: 'Faster scanning · 6 hours', desc: 'Listings are scanned every 30 s instead of every 2 min.', kind: 'FUNCTIONAL', weight: 22, redeem: 'scan' },
  { label: '+50 KM', left: '12H', name: '+50 KM search radius · 12 hours', desc: 'Radius Breach is active — search up to 60 km.', kind: 'FUNCTIONAL', weight: 18, redeem: 'radius' },
  { label: '+2 FLASH', name: '2 Flash Alert Tokens', desc: 'Added to your wallet — use them on any listing or search.', kind: 'FUNCTIONAL', weight: 20, flash: 2 },
  { label: 'SNIPER', left: '30M', name: 'Sniper Mode · 30 minutes', desc: 'Instant auto-alerts on listings under your target price.', kind: 'FUNCTIONAL', weight: 5, redeem: 'sniper' },
  { label: '+5 HOLD', left: '3D', name: 'Hold Pile +5 slots · 3 days', desc: 'Your Hold Pile now holds 15 listings.', kind: 'FUNCTIONAL', weight: 15, redeem: 'hold5' },
  { label: 'BUBBLE', name: 'Sellers Despair Chat Bubble', desc: 'A chat flair for your Flip Tok comments.', kind: 'COSMETIC', weight: 10, cos: 'despair' },
  { label: 'THEME', name: 'Retro Thrifter Theme', desc: 'A theme preview for your profile card.', kind: 'COSMETIC', weight: 6, cos: 'retro' },
  { label: 'ACCENT', name: 'Cyber Broker Accent', desc: 'A UI accent for your profile and posts.', kind: 'COSMETIC', weight: 4, cos: 'cyber' },
];

/** [name, condition, progress, target, xp, icon, lock note] */
type AchRow = [string, string, number, number, number, IconKey, string?];

export const ACH: { cat: string; items: AchRow[] }[] = [
  { cat: 'Sourcing & Speed', items: [
    ['Fastest Finger', 'Message a seller within 60 seconds of a listing going live.', 1, 1, 100, 'speed'],
    ['Ghost Protocol', 'Source 5 deals with Shadow Mode on.', 5, 5, 150, 'ghost'],
    ['Sleepwalking', 'Secure a deal between midnight and 5am.', 1, 1, 100, 'moon'],
    ['The Early Bird', 'Claim a Flash Alert deal before 7am.', 0, 1, 100, 'bolt'],
    ['Marketplace Monopoly', 'Source from 5 different platforms in one week.', 3, 5, 200, 'bridge'],
    ['Zero Friction', 'Complete a flip with no price negotiation.', 1, 1, 80, 'check'],
    ['Sniper Clearance', 'Land 10 deals using Sniper Mode.', 0, 10, 300, 'target', 'Requires Sniper Mode'],
    ['Night Watchman', 'Keep Night Crawler alerts on for 7 nights.', 2, 7, 200, 'moon'],
    ['Speed Demon', 'Answer 10 HUSTLE or HOLD rounds in under 3 seconds each.', 6, 10, 150, 'speed'],
    ['Grid Sweep', 'Scan every category in a single day.', 1, 1, 120, 'scan'],
  ] },
  { cat: 'Profit & Volume', items: [
    ['The Golden Goose', 'Make $500+ profit on a single flip.', 0, 1, 400, 'coin'],
    ['Garage Sale Guru', 'Complete 10 flips sourced from garage sales.', 10, 10, 200, 'hold'],
    ["One Man's Trash", 'Flip a free listing for profit.', 1, 1, 150, 'gift'],
    ['The Kilometre Club', 'Travel 1,000 km in total to source deals.', 640, 1000, 250, 'radius'],
    ['Wheel & Deal', 'Land 25 successful negotiated offers.', 25, 25, 200, 'script'],
    ['Arbitrage Architect', 'Buy on one platform and sell on another 10 times.', 7, 10, 250, 'bridge'],
    ['Centurion Scurry', 'Complete 100 flips.', 38, 100, 500, 'boxes'],
    ['Grandmaster Flipper', 'Reach $10,000 lifetime profit.', 3240, 10000, 1000, 'trophy'],
    ['Bale Out', 'Flip a bulk lot of 20+ items.', 0, 1, 250, 'boxes'],
    ['Penny Pincher', 'Buy 10 items under $10 and resell them.', 10, 10, 120, 'coin'],
  ] },
  { cat: 'Community & Elite', items: [
    ['Local Legend', 'Hold #1 on your regional leaderboard for a week.', 0, 1, 500, 'podium'],
    ['Scam Sniper', 'Report 5 listings that are verified as scams.', 5, 5, 200, 'shield'],
    ['The Oracle', 'Make 50 correct HUSTLE or HOLD calls.', 47, 50, 150, 'eye'],
    ['Syndicate Don', 'Lead a guild of 10+ members.', 0, 10, 400, 'people', 'Unlocks at Level 20'],
    ['Vouch King', 'Receive 25 vouches from other flippers.', 25, 25, 250, 'check'],
    ['Whistleblower', 'Be first to flag a scam that gets removed.', 1, 1, 150, 'alert'],
    ['Market Sage', 'Post 10 Flip Tok breakdowns with 100+ likes.', 4, 10, 300, 'trophy'],
    ['Guild Vanguard', "Be your guild's top contributor for a month.", 0, 1, 300, 'people', 'Join a guild first'],
    ['Patron of the Arcade', 'Play in the Arcade 30 days in a row.', 7, 30, 400, 'spin'],
    ['Flawless Record', 'Complete 50 flips with zero disputes.', 38, 50, 400, 'shield'],
  ] },
];

export const ACH_TOTAL = ACH.reduce((n, c) => n + c.items.length, 0);

export type LbTab = 'Regional' | 'Global' | 'Weekly' | 'Monthly';
export const LB_TABS: LbTab[] = ['Regional', 'Global', 'Weekly', 'Monthly'];
export const LB_SCOPE: Record<LbTab, string> = {
  Regional: 'SYDNEY REGION · ALL TIME', Global: 'GLOBAL · ALL TIME', Weekly: 'SYDNEY · THIS WEEK', Monthly: 'SYDNEY · SEPTEMBER',
};

export type LbRow = {
  rank: string; initials: string; name: string; handle: string; profit: string; streak: string;
  lvl?: number; flips: number; badge: string; me?: boolean;
};

export const LB: Record<LbTab, LbRow[]> = {
  Regional: [
    { rank: '1', initials: 'DW', name: 'Deon W.', handle: '@thedealhunter', profit: '$18,420', streak: '23d streak', lvl: 31, flips: 412, badge: 'LOCAL LEGEND' },
    { rank: '2', initials: 'PN', name: 'Priya N.', handle: '@flipqueen', profit: '$16,890', streak: '17d streak', lvl: 28, flips: 356, badge: 'THE ORACLE' },
    { rank: '3', initials: 'MR', name: 'Marcus R.', handle: '@stackking', profit: '$15,240', streak: '11d streak', lvl: 26, flips: 301, badge: 'GOLDEN GOOSE' },
    { rank: '4', initials: 'SK', name: 'Sam K.', handle: '@sourceandsell', profit: '$11,200', streak: '9d streak', lvl: 22, flips: 244, badge: 'VOUCH KING' },
    { rank: '5', initials: 'AB', name: 'Aisha B.', handle: '@resellraja', profit: '$9,870', streak: '6d streak', lvl: 19, flips: 198, badge: 'SCAM SNIPER' },
    { rank: '6', initials: 'TM', name: 'Tyler M.', handle: '@flipfast', profit: '$8,240', streak: '5d streak', lvl: 17, flips: 170, badge: 'SPEED DEMON' },
    { rank: '7', initials: 'JL', name: 'Jess L.', handle: '@jessflips', profit: '$5,610', streak: '3d streak', lvl: 15, flips: 121, badge: 'PENNY PINCHER' },
    { rank: '8', initials: 'MR', name: 'You', handle: '@mrhustle', profit: '$3,240', streak: '4d streak', flips: 38, badge: 'LOWBALL LEGEND', me: true },
  ],
  Global: [
    { rank: '1', initials: 'KO', name: 'Kai O.', handle: '@kaiflips', profit: '$64,210', streak: '88d streak', lvl: 48, flips: 1320, badge: 'GRANDMASTER' },
    { rank: '2', initials: 'LH', name: 'Lena H.', handle: '@thriftlena', profit: '$58,930', streak: '61d streak', lvl: 45, flips: 1104, badge: 'SYNDICATE DON' },
    { rank: '3', initials: 'RJ', name: 'Ravi J.', handle: '@ravireseller', profit: '$51,400', streak: '40d streak', lvl: 41, flips: 987, badge: 'ARBITRAGE' },
    { rank: '4', initials: 'CT', name: 'Chloe T.', handle: '@chloeflips', profit: '$47,080', streak: '33d streak', lvl: 39, flips: 902, badge: 'MARKET SAGE' },
    { rank: '5', initials: 'DW', name: 'Deon W.', handle: '@thedealhunter', profit: '$18,420', streak: '23d streak', lvl: 31, flips: 412, badge: 'LOCAL LEGEND' },
    { rank: '1,284', initials: 'MR', name: 'You', handle: '@mrhustle', profit: '$3,240', streak: '4d streak', flips: 38, badge: 'LOWBALL LEGEND', me: true },
  ],
  Weekly: [
    { rank: '1', initials: 'PN', name: 'Priya N.', handle: '@flipqueen', profit: '$2,140', streak: '17d streak', lvl: 28, flips: 12, badge: 'THE ORACLE' },
    { rank: '2', initials: 'DW', name: 'Deon W.', handle: '@thedealhunter', profit: '$1,880', streak: '23d streak', lvl: 31, flips: 9, badge: 'LOCAL LEGEND' },
    { rank: '3', initials: 'MR', name: 'You', handle: '@mrhustle', profit: '$420', streak: '4d streak', flips: 3, badge: 'LOWBALL LEGEND', me: true },
    { rank: '4', initials: 'AB', name: 'Aisha B.', handle: '@resellraja', profit: '$395', streak: '6d streak', lvl: 19, flips: 4, badge: 'SCAM SNIPER' },
    { rank: '5', initials: 'TM', name: 'Tyler M.', handle: '@flipfast', profit: '$310', streak: '5d streak', lvl: 17, flips: 5, badge: 'SPEED DEMON' },
  ],
  Monthly: [
    { rank: '1', initials: 'DW', name: 'Deon W.', handle: '@thedealhunter', profit: '$6,920', streak: '23d streak', lvl: 31, flips: 41, badge: 'LOCAL LEGEND' },
    { rank: '2', initials: 'MR', name: 'Marcus R.', handle: '@stackking', profit: '$5,410', streak: '11d streak', lvl: 26, flips: 33, badge: 'GOLDEN GOOSE' },
    { rank: '3', initials: 'PN', name: 'Priya N.', handle: '@flipqueen', profit: '$5,100', streak: '17d streak', lvl: 28, flips: 36, badge: 'THE ORACLE' },
    { rank: '4', initials: 'SK', name: 'Sam K.', handle: '@sourceandsell', profit: '$3,020', streak: '9d streak', lvl: 22, flips: 22, badge: 'VOUCH KING' },
    { rank: '5', initials: 'MR', name: 'You', handle: '@mrhustle', profit: '$1,210', streak: '4d streak', flips: 9, badge: 'LOWBALL LEGEND', me: true },
  ],
};
