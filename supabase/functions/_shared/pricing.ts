// Profit maths and the rules-based deal badge. Pure functions, no I/O.

export type Badge = 'STEAL' | 'CAUTION' | 'RISK';

/** A listing as every source hands it over, before scoring. */
export type Listing = {
  marketplace: string;
  externalId: string;
  title: string;
  price: number;
  shipping: number | null;
  condition: string | null;
  imageUrl: string | null;
  imageKey: string | null;
  listingUrl: string;
  location: string | null;
  category: string | null;
  listedAt: string | null;
};

/**
 * Seller fees on the marketplace the item is resold on (eBay by default).
 * Rough published rates — always shown to users as estimates.
 */
export const RESALE_FEE_RATE: Record<string, number> = {
  eBay: 0.1325,
  Amazon: 0.15,
  Etsy: 0.095,
  StockX: 0.12,
  Facebook: 0.05,
  Gumtree: 0,
};
export const DEFAULT_FEE_RATE = 0.129;

/** Typical outbound postage per category. */
export const SHIPPING_BY_CATEGORY: Record<string, number> = {
  Sneakers: 15,
  Electronics: 12,
  Collectibles: 10,
  Home: 25,
  Toys: 18,
};
export const DEFAULT_SHIPPING = 15;

/** Below either of these, a listing is not worth an AI call. */
export const MIN_PROFIT = 20;
export const MIN_MARGIN = 0.15;

export type Economics = {
  /** What the flipper pays: price plus inbound postage. */
  cost: number;
  resale: number;
  fees: number;
  shipping: number;
  profit: number;
  /** profit / cost */
  margin: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function economics(listing: Pick<Listing, 'price' | 'shipping' | 'category'>, resale: number, resaleOn = 'eBay'): Economics {
  const cost = round2(listing.price + (listing.shipping ?? 0));
  const fees = round2(resale * (RESALE_FEE_RATE[resaleOn] ?? DEFAULT_FEE_RATE));
  const shipping = SHIPPING_BY_CATEGORY[listing.category ?? ''] ?? DEFAULT_SHIPPING;
  const profit = round2(resale - cost - fees - shipping);
  return { cost, resale: round2(resale), fees, shipping, profit, margin: cost > 0 ? profit / cost : 0 };
}

/** Why a listing should be dropped before scoring, or null to keep it. */
export function rejectReason(e: Economics, sampleSize: number | null): string | null {
  if (!(e.resale > 0)) return 'no resale price';
  if (sampleSize !== null && sampleSize < 3) return 'too few comparable sales';
  if (e.profit < MIN_PROFIT) return `profit under $${MIN_PROFIT}`;
  if (e.margin < MIN_MARGIN) return `margin under ${Math.round(MIN_MARGIN * 100)}%`;
  return null;
}

/** Badge from the numbers alone — used without an AI key, and as a floor on the AI's answer. */
export function ruleBadge(e: Economics): Badge {
  if (e.profit <= 0) return 'RISK';
  if (e.margin >= 0.5 && e.profit >= 50) return 'STEAL';
  return 'CAUTION';
}

/** 0–10 score from the numbers alone. */
export function ruleScore(e: Economics): number {
  if (e.profit <= 0) return Math.max(1, round1(3 + e.margin * 4));
  return Math.min(9.6, round1(5 + e.margin * 5 + Math.min(e.profit, 300) / 150));
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** A negative-profit deal is never a Steal, whatever the AI says. */
export function finalBadge(ai: Badge, e: Economics): Badge {
  if (e.profit <= 0) return 'RISK';
  if (ai === 'STEAL' && e.margin < 0.25) return 'CAUTION';
  return ai;
}

/** Profit as a whole-number percentage of cost. */
export const roiPct = (e: Economics) => (e.cost > 0 ? Math.round((e.profit / e.cost) * 100) : 0);

export function median(values: number[]): number | null {
  const v = values.filter((x) => Number.isFinite(x) && x > 0).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

/** Cache key for resale prices: lower-case words, sorted, de-duplicated. */
export function priceKey(query: string): string {
  return [...new Set(query.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean))].sort().join(' ');
}

/** Short human source line shown on the deal card, e.g. "EBAY · LOS ANGELES". */
export function sourceLine(l: Pick<Listing, 'marketplace' | 'location'>): string {
  return [l.marketplace.toUpperCase(), (l.location ?? 'ONLINE').toUpperCase()].join(' · ');
}
