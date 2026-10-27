import type { ImageSourcePropType } from 'react-native';

import { ART, IMG, type Img, type Risk } from './data';

export type Verdict = { ok: boolean; text: string };

export type Deal = {
  id: number; name: string; source: string; category: string;
  buy: number; resale: number; score: number; risk: Risk; img: Img; imageKey: string | null; verdict: Verdict[];
};

export type InvStatus = 'Sourcing' | 'Listed' | 'Sold';
export type InvItem = {
  id: number; name: string; sku: string; buy: number; list: number; status: InvStatus;
  img: Img; createdAt: string; soldAt: string | null;
};

export type Flip = {
  id: number; initials: string; name: string; handle: string; bought: number; sold: number;
  copy: string; img: Img; likes: number; shares: number;
};

export type BoardEntry = { initials: string; name: string; handle: string; profit: number; streakDays: number; me?: boolean };
export type Trend = { name: string; watching: string; change: number; spark: string };
export type Tracked = { id: number; name: string; now: number; target: number; change: number; pct?: number };
export type Notice = { id: number; title: string; body: string; img: Img; createdAt: string };
export type StoreItem = { key: string; group: string; name: string; desc: string; cost: number };
export type Puzzle = {
  name: string; meta: string; img: Img; closesAt: string;
  guess: number | null; reward: number | null; actual: number | null;
};
export type Profile = { name: string; handle: string; email: string; region: string; plan: string; memberSince: string };

/** The arcade columns of a `profiles` row. */
export type ProfileRow = {
  full_name: string; handle: string | null; region: string; plan: string; created_at: string;
  credits: number; streak: number; last_check_in: string | null; spins_left: number;
  pawn_cash: number; pawn_levels: Record<string, number>; owned: string[];
};

// ───────────────────────────────────────────────────────────── formatting

const commas = (n: number) => {
  const [int, dec] = Math.abs(n).toFixed(Number.isInteger(n) ? 0 : 2).split('.');
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (dec ? '.' + dec : '');
};

/** `$1,200` — whole dollars stay whole, cents keep two places. */
export const money = (n: number) => (n < 0 ? '-$' : '$') + commas(n);
/** `+$210` / `-$40` */
export const signed = (n: number) => (n >= 0 ? '+$' : '-$') + commas(Math.abs(n));
/** `$12.5k` once past a thousand. */
export const compact = (n: number) => (Math.abs(n) >= 1000 ? '$' + (n / 1000).toFixed(1) + 'k' : money(Math.round(n)));
/** `1.2k` for counts. */
export const count = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n));
/** `+3.2%` / `-2.1%` */
export const pct = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
export const roi = (buy: number, sell: number) => (buy > 0 ? Math.round(((sell - buy) / buy) * 100) : 0) + '%';

/** `2m`, `3h`, `1d` since an ISO time. */
export const ago = (iso: string) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return Math.max(1, Math.floor(s / 60)) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  return Math.floor(s / 86400) + 'd';
};

/** `3D 04H` until an ISO time. */
export const until = (iso: string) => {
  const s = Math.max(0, (new Date(iso).getTime() - Date.now()) / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  return `${d}D ${String(h).padStart(2, '0')}H`;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const monthYear = (iso: string) => {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

// ───────────────────────────────────────────────────────────── row mapping

const IMAGES: Record<string, ImageSourcePropType | null> = { ...IMG, puzzle: ART.puzzle };

/** Remote URL wins; otherwise a bundled asset by key. */
export const image = (key?: string | null, url?: string | null): Img =>
  url ? { uri: url } : key ? IMAGES[key] ?? null : null;

type Row = Record<string, any>;
const num = (v: unknown) => Number(v ?? 0);

export const toDeal = (r: Row): Deal => ({
  id: r.id, name: r.name, source: r.source, category: r.category,
  buy: num(r.buy_price), resale: num(r.resale_price), score: num(r.score), risk: r.risk,
  img: image(r.image_key, r.image_url), imageKey: r.image_key ?? null, verdict: r.verdict ?? [],
});

export const toInv = (r: Row): InvItem => ({
  id: r.id, name: r.name, sku: r.sku, buy: num(r.buy_price), list: num(r.list_price), status: r.status,
  img: image(r.image_key, r.image_url), createdAt: r.created_at, soldAt: r.sold_at,
});

export const toFlip = (r: Row): Flip => ({
  id: r.id, initials: r.initials, name: r.author_name, handle: r.handle, bought: num(r.bought), sold: num(r.sold),
  copy: r.copy, img: image(r.image_key, r.image_url), likes: r.likes, shares: r.shares,
});

export const toBoard = (r: Row): BoardEntry => ({
  initials: r.initials, name: r.name, handle: r.handle, profit: num(r.profit), streakDays: r.streak_days,
});

export const toTrend = (r: Row): Trend => ({ name: r.name, watching: r.watching, change: num(r.change_pct), spark: r.spark });
export const toTracked = (r: Row): Tracked => ({
  id: r.id, name: r.name, now: num(r.now_price), target: num(r.target_price), change: num(r.change_pct),
});
export const toNotice = (r: Row): Notice => ({
  id: r.id, title: r.title, body: r.body, img: image(r.image_key), createdAt: r.created_at,
});
export const toStoreItem = (r: Row): StoreItem => ({ key: r.key, group: r.group_label, name: r.name, desc: r.description, cost: r.cost });
export const toPuzzle = (r: Row): Puzzle => ({
  name: r.name, meta: r.meta, img: image(r.image_key, r.image_url), closesAt: r.closes_at,
  guess: r.guess ?? null, reward: r.reward ?? null, actual: r.actual ?? null,
});

export const PLAN_LABEL: Record<string, string> = { scout: 'Scout · Free', hustler: 'Hustler · $19/mo', mogul: 'Mogul · $49/mo' };

/** Stable initials from a display name. */
export const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || 'ME';
