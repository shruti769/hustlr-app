// Price tracker — runs every 30 minutes from pg_cron (see supabase/cron.sql).
//
// Refreshes the resale value of every watched item (one lookup per distinct
// item name), records the % move, and tells the owner when an item reaches
// the price they want to sell at. A target alerts once; it re-arms if the
// price falls back below it.
//
// Deploy: supabase functions deploy track-prices --no-verify-jwt

import { cors, json } from '../_shared/http.ts';
import { priceKey } from '../_shared/pricing.ts';
import { pushToUsers } from '../_shared/push.ts';
import { adminClient, cachedResale, isPipelineCall, saveResale } from '../_shared/score.ts';
import { pickSource } from '../_shared/sources.ts';

const STALE_MINUTES = 30;
const MAX_ITEMS = 300;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (!isPipelineCall(req)) return json({ error: 'Forbidden' }, 403);

  const admin = adminClient();
  const source = pickSource();
  const cutoff = new Date(Date.now() - STALE_MINUTES * 60_000).toISOString();
  const { data: items, error } = await admin.from('tracked_items')
    .select('id, user_id, name, now_price, target_price, change_pct, alerted_at')
    .or(`last_checked_at.is.null,last_checked_at.lt.${cutoff}`)
    .limit(MAX_ITEMS);
  if (error) return json({ error: error.message }, 500);

  // One resale lookup per distinct item.
  const byKey = new Map<string, typeof items>();
  for (const item of items ?? []) {
    const key = priceKey(item.name);
    byKey.set(key, [...(byKey.get(key) ?? []), item]);
  }

  let updated = 0;
  let hits = 0;
  for (const group of byKey.values()) {
    const name = group[0].name as string;
    let resale = await cachedResale(admin, name);
    if (!resale) {
      try {
        const live = (await source.search({
          id: 0, query: name, category: '', marketplace: 'eBay', min_price: 1, max_price: 100000,
        })).map((l) => l.price);
        resale = await source.resale(name, live);
        if (resale) await saveResale(admin, name, resale);
      } catch (e) {
        console.warn(`price lookup failed for ${name}`, e);
      }
    }
    const now = new Date().toISOString();
    for (const item of group) {
      if (!resale) {
        await admin.from('tracked_items').update({ last_checked_at: now }).eq('id', item.id);
        continue;
      }
      const old = Number(item.now_price);
      const price = Math.round(resale.resale);
      const target = Number(item.target_price);
      const change = old > 0 ? Math.round(((price - old) / old) * 1000) / 10 : 0;
      const hit = price >= target && !item.alerted_at;
      await admin.from('tracked_items').update({
        now_price: price,
        change_pct: price === old ? Number(item.change_pct ?? 0) : change,
        last_checked_at: now,
        alerted_at: hit ? now : price < target ? null : item.alerted_at,
      }).eq('id', item.id);
      updated++;
      if (hit) {
        hits++;
        await admin.from('notifications').insert({
          user_id: item.user_id, kind: 'target', title: 'Price target hit',
          body: `${item.name} reached your $${target} target — now $${price}`,
        });
        await pushToUsers(admin, [item.user_id], {
          title: 'Price target hit 🎯',
          body: `${item.name} is now $${price} (target $${target})`,
          data: { screen: 'tracker' },
        });
      }
    }
  }

  return json({ items: items?.length ?? 0, updated, hits });
});
