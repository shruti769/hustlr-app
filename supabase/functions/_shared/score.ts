// Turning a listing into a scored deal — shared by the pipeline and by
// user-shared links (analyse-listing).

import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.118.0';

import { scoreWithAi } from './ai.ts';
import { env } from './http.ts';
import {
  economics, finalBadge, priceKey, ruleBadge, ruleScore, sourceLine,
  type Badge, type Economics, type Listing,
} from './pricing.ts';
import type { Resale } from './sources.ts';

export const adminClient = (): SupabaseClient =>
  createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });

/** Scheduled jobs are called by pg_cron with a shared secret, not a user token. */
export function isPipelineCall(req: Request): boolean {
  const secret = Deno.env.get('PIPELINE_SECRET');
  return !!secret && req.headers.get('x-pipeline-secret') === secret;
}

const PRICE_TTL_MS = 6 * 60 * 60 * 1000;

/** Cached resale estimate for a search query, or null when stale / missing. */
export async function cachedResale(admin: SupabaseClient, query: string): Promise<Resale | null> {
  const { data } = await admin.from('market_prices').select('*').eq('key', priceKey(query)).maybeSingle();
  if (!data || Date.now() - new Date(data.checked_at).getTime() > PRICE_TTL_MS) return null;
  return { resale: Number(data.resale), sampleSize: data.sample_size, source: data.source };
}

export async function saveResale(admin: SupabaseClient, query: string, r: Resale) {
  await admin.from('market_prices').upsert({
    key: priceKey(query), resale: r.resale, sample_size: r.sampleSize, source: r.source, checked_at: new Date().toISOString(),
  });
}

export type Scored = {
  economics: Economics;
  badge: Badge;
  score: number;
  reason: string;
  checks: { ok: boolean; text: string }[];
  by: 'ai' | 'rules';
};

/** AI verdict when available, rules otherwise; the numbers always cap the badge. */
export async function scoreListing(listing: Listing, resale: number): Promise<Scored> {
  const e = economics(listing, resale);
  const ai = await scoreWithAi(listing, e);
  if (ai) {
    return { economics: e, badge: finalBadge(ai.badge, e), score: ai.score, reason: ai.reason, checks: ai.checks, by: 'ai' };
  }
  const badge = ruleBadge(e);
  return {
    economics: e,
    badge,
    score: ruleScore(e),
    reason: badge === 'STEAL'
      ? `Asking $${listing.price} against ~$${Math.round(e.resale)} resale — strong margin after fees.`
      : badge === 'CAUTION'
        ? `Profitable at ~$${Math.round(e.profit)} after fees; check condition and authenticity first.`
        : 'Fees and postage leave little or no profit at this price.',
    checks: [
      { ok: e.margin >= 0.3, text: `${Math.round(e.margin * 100)}% margin on cost` },
      { ok: true, text: `Resale estimate ~$${Math.round(e.resale)}` },
      { ok: false, text: 'Ask for recent photos and proof of purchase' },
    ],
    by: 'rules',
  };
}

/** Row for the `deals` table; upserted on (marketplace, external_id). */
export function dealRow(listing: Listing, s: Scored) {
  const listed = listing.listedAt ? new Date(listing.listedAt).getTime() : Date.now();
  return {
    name: listing.title.slice(0, 120),
    source: sourceLine(listing),
    category: listing.category ?? 'Other',
    buy_price: s.economics.cost,
    resale_price: s.economics.resale,
    score: s.score,
    badge: s.badge,
    image_url: listing.imageUrl,
    image_key: listing.imageKey,
    verdict: s.checks,
    marketplace: listing.marketplace,
    listing_url: listing.listingUrl,
    external_id: listing.externalId,
    est_fees: s.economics.fees,
    est_shipping: s.economics.shipping,
    reason: s.reason,
    price_checked_at: new Date().toISOString(),
    expires_at: new Date(Math.max(listed, Date.now()) + 14 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
  };
}

/** A raw_listings row back into a Listing. */
export function fromRaw(r: Record<string, any>): Listing {
  return {
    marketplace: r.marketplace, externalId: r.external_id, title: r.title, price: Number(r.price),
    shipping: r.shipping == null ? null : Number(r.shipping), condition: r.condition, imageUrl: r.image_url,
    imageKey: r.image_key, listingUrl: r.listing_url, location: r.location, category: r.category, listedAt: r.listed_at,
  };
}
