// Lane C — a signed-in user shares a listing link (or types its title and
// price) and gets a deal score back in seconds. Results are kept per user in
// listing_analyses; free (Scout) accounts get 10 a day.
//
// Deploy: supabase functions deploy analyse-listing

import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

import { cors, env, json } from '../_shared/http.ts';
import { roiPct } from '../_shared/pricing.ts';
import { adminClient, cachedResale, saveResale, scoreListing } from '../_shared/score.ts';
import { EbaySource, pickSource, type Resale } from '../_shared/sources.ts';
import type { Listing } from '../_shared/pricing.ts';

const FREE_DAILY = 10;

type Body = { url?: string; title?: string; price?: number; category?: string };

const marketplaceOf = (url: string | undefined): string => {
  const host = url?.match(/^https?:\/\/([^/]+)/i)?.[1]?.toLowerCase() ?? '';
  if (host.includes('ebay.')) return 'eBay';
  if (host.includes('amazon.')) return 'Amazon';
  if (host.includes('etsy.')) return 'Etsy';
  if (host.includes('facebook.')) return 'Facebook';
  if (host.includes('gumtree.')) return 'Gumtree';
  if (host.includes('depop.')) return 'Depop';
  return url ? 'Other' : 'Manual';
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const asUser = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: { user } } = await asUser.auth.getUser();
  if (!user) return json({ error: 'Not signed in' }, 401);

  const admin = adminClient();

  // Free plan: 10 analyses per UTC day.
  const { data: profile } = await admin.from('profiles').select('plan').eq('id', user.id).single();
  if ((profile?.plan ?? 'scout') === 'scout') {
    const since = new Date(new Date().toISOString().slice(0, 10)).toISOString();
    const { count } = await admin.from('listing_analyses').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).gte('created_at', since);
    if ((count ?? 0) >= FREE_DAILY) {
      return json({ error: `Free plan includes ${FREE_DAILY} analyses a day. Upgrade for unlimited.`, limit: true }, 429);
    }
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Send a listing link, or a title and price.' }, 400);
  }
  const url = body.url?.trim() || undefined;
  const source = pickSource();

  // eBay links are looked up directly; anything else needs a title and price.
  let listing: Listing | null = null;
  if (url && source instanceof EbaySource && marketplaceOf(url) === 'eBay') {
    try {
      listing = await source.itemFromUrl(url, body.category ?? null);
    } catch (e) {
      console.warn('eBay lookup failed', e);
    }
  }
  if (!listing) {
    const title = body.title?.trim();
    const price = Number(body.price);
    if (!title || !(price > 0)) {
      return json({ error: url ? "We can't read that site directly yet — add the item's title and price." : 'Add the item title and asking price.' }, 422);
    }
    listing = {
      marketplace: marketplaceOf(url), externalId: `manual-${Date.now()}`, title, price, shipping: null, condition: null,
      imageUrl: null, imageKey: null, listingUrl: url ?? '', location: null, category: body.category ?? null, listedAt: null,
    };
  }

  // Resale: cached for the title, otherwise from comparable listings.
  let resale: Resale | null = await cachedResale(admin, listing.title);
  if (!resale) {
    let live: number[] = [];
    try {
      live = (await source.search({
        id: 0, query: listing.title, category: listing.category ?? '', marketplace: 'eBay', min_price: 1, max_price: 100000,
      })).map((l) => l.price);
    } catch (e) {
      console.warn('comparable search failed', e);
    }
    resale = await source.resale(listing.title, live);
    if (resale) await saveResale(admin, listing.title, resale);
  }
  if (!resale) return json({ error: "Not enough recent sales to price this item yet." }, 422);

  const s = await scoreListing(listing, resale.resale);
  const result = {
    title: listing.title,
    marketplace: listing.marketplace,
    url: listing.listingUrl || null,
    imageUrl: listing.imageUrl,
    price: listing.price,
    cost: s.economics.cost,
    resale: s.economics.resale,
    fees: s.economics.fees,
    shipping: s.economics.shipping,
    profit: s.economics.profit,
    roi: roiPct(s.economics),
    badge: s.badge,
    score: s.score,
    reason: s.reason,
    checks: s.checks,
    resaleSource: resale.source,
    sampleSize: resale.sampleSize,
    by: s.by,
  };
  await admin.from('listing_analyses').insert({ user_id: user.id, input: body, result });
  return json(result);
});
