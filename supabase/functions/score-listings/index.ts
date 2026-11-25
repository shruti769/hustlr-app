// Scorer — runs every minute from pg_cron (see supabase/cron.sql).
//
// Claims a small batch from the raw_listings queue, works out profit against
// the cached resale price, drops anything not worth a look, asks the AI about
// the rest, and upserts the survivors into `deals`. Small batches keep each
// run well inside the edge-function time limit; a backlog just takes a few
// more runs to clear.
//
// Deploy: supabase functions deploy score-listings --no-verify-jwt

import { cors, json } from '../_shared/http.ts';
import { rejectReason, economics, priceKey } from '../_shared/pricing.ts';
import { pushToUsers } from '../_shared/push.ts';
import { adminClient, dealRow, fromRaw, isPipelineCall, scoreListing } from '../_shared/score.ts';

const BATCH = Number(Deno.env.get('SCORE_BATCH') ?? 25);
const PARALLEL = 5;
/** New Steals at or above this score alert opted-in users. */
const ALERT_MIN_SCORE = Number(Deno.env.get('ALERT_MIN_SCORE') ?? 8);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (!isPipelineCall(req)) return json({ error: 'Forbidden' }, 403);

  const admin = adminClient();
  const { data: claimed, error } = await admin.rpc('claim_listings', { p_limit: BATCH });
  if (error) return json({ error: error.message }, 500);
  const rows = (claimed ?? []) as Record<string, any>[];
  if (!rows.length) return json({ scored: 0, rejected: 0, errors: 0 });

  const { data: run } = await admin.from('pipeline_runs').insert({ job: 'score' }).select().single();

  // Resale estimates for every query in the batch, in one read.
  const keys = [...new Set(rows.map((r) => priceKey(r.query ?? r.title)))];
  const { data: prices } = await admin.from('market_prices').select('*').in('key', keys);
  const priceByKey = new Map((prices ?? []).map((p) => [p.key, p]));

  // Which of these listings are already deals — only brand-new Steals alert anyone.
  const { data: existing } = await admin.from('deals').select('external_id')
    .in('external_id', rows.map((r) => r.external_id));
  const known = new Set((existing ?? []).map((d) => d.external_id));
  const newSteals: { id: number; name: string; marketplace: string }[] = [];
  const newDeals: { id: number; name: string; marketplace: string }[] = [];

  let scored = 0;
  let rejected = 0;
  let errors = 0;

  const finish = (id: number, status: string, reason: string | null = null) =>
    admin.from('raw_listings').update({ status, reject_reason: reason, processed_at: new Date().toISOString() }).eq('id', id);

  const work = async (row: Record<string, any>) => {
    try {
      const listing = fromRaw(row);
      const price = priceByKey.get(priceKey(row.query ?? row.title));
      const reason = price
        ? rejectReason(economics(listing, Number(price.resale)), price.sample_size)
        : 'no resale price';
      if (reason || !price) {
        rejected++;
        await finish(row.id, 'rejected', reason);
        return;
      }

      const s = await scoreListing(listing, Number(price.resale));
      const { data: deal, error: dealError } = await admin.from('deals')
        .upsert(dealRow(listing, s), { onConflict: 'marketplace,external_id' }).select('id').single();
      if (dealError) throw dealError;
      if (!known.has(listing.externalId)) {
        newDeals.push({ id: deal.id, name: listing.title, marketplace: listing.marketplace });
        if (s.badge === 'STEAL' && s.score >= ALERT_MIN_SCORE) {
          newSteals.push({ id: deal.id, name: listing.title, marketplace: listing.marketplace });
        }
      }
      scored++;
      await finish(row.id, 'scored', s.by);
    } catch (e) {
      errors++;
      await finish(row.id, row.attempts >= 3 ? 'error' : 'pending', e instanceof Error ? e.message.slice(0, 200) : String(e));
    }
  };

  for (let i = 0; i < rows.length; i += PARALLEL) {
    await Promise.all(rows.slice(i, i + PARALLEL).map(work));
  }

  // Alert opted-in users: an in-app notification each (capped per day), then a push.
  let alerted = 0;
  for (const steal of newSteals) {
    const { data: users, error: fanError } = await admin.rpc('fan_out_deal_alert', { p_deal_id: steal.id });
    if (fanError) {
      console.warn('alert fan-out failed', fanError.message);
      continue;
    }
    const ids = ((users ?? []) as { user_id: string }[]).map((u) => u.user_id);
    alerted += await pushToUsers(admin, ids, {
      title: 'Steal found 🔥',
      body: `${steal.name.slice(0, 60)} on ${steal.marketplace}`,
      data: { dealId: steal.id },
    });
  }

  // Armed Flash Alerts fire on any new deal in their category, ahead of the daily cap.
  let flashed = 0;
  for (const d of newDeals) {
    const { data: users, error: flashError } = await admin.rpc('fan_out_flash_alerts', { p_deal_id: d.id });
    if (flashError) {
      console.warn('flash fan-out failed', flashError.message);
      continue;
    }
    const ids = ((users ?? []) as { user_id: string }[]).map((u) => u.user_id);
    if (!ids.length) continue;
    flashed += await pushToUsers(admin, ids, {
      title: '⚡ Flash Alert',
      body: `${d.name.slice(0, 60)} just listed on ${d.marketplace}`,
      data: { dealId: d.id },
    });
  }
  alerted += flashed;

  if (run) {
    await admin.from('pipeline_runs').update({
      finished_at: new Date().toISOString(), scored, rejected, errors,
      note: newSteals.length ? `${newSteals.length} new steals, ${alerted} pushes` : null,
    }).eq('id', run.id);
  }
  return json({ scored, rejected, errors, newSteals: newSteals.length, pushes: alerted });
});
