// Collector — runs every 5 minutes from pg_cron (see supabase/cron.sql).
//
// Takes the few search terms that have waited longest, pulls fresh listings
// from the source, queues the new ones in raw_listings, and caches a resale
// estimate per term. Also retires deals that have expired.
//
// Deploy: supabase functions deploy collect-listings --no-verify-jwt

import { cors, json } from '../_shared/http.ts';
import { adminClient, cachedResale, isPipelineCall, saveResale } from '../_shared/score.ts';
import { pickSource, type SearchTerm } from '../_shared/sources.ts';

const TERMS_PER_RUN = Number(Deno.env.get('TERMS_PER_RUN') ?? 3);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (!isPipelineCall(req)) return json({ error: 'Forbidden' }, 403);

  const admin = adminClient();
  const source = pickSource();
  const { data: run } = await admin.from('pipeline_runs').insert({ job: 'collect', note: source.name }).select().single();

  let collected = 0;
  let errors = 0;
  const notes: string[] = [source.name];

  const { data: expired } = await admin.rpc('expire_deals');
  if (expired) notes.push(`expired ${expired}`);

  const { data: terms, error } = await admin.from('search_terms')
    .select('*').eq('enabled', true)
    .order('last_run_at', { ascending: true, nullsFirst: true })
    .limit(TERMS_PER_RUN);
  if (error) return json({ error: error.message }, 500);

  for (const term of (terms ?? []) as SearchTerm[]) {
    try {
      const listings = await source.search(term);
      if (listings.length) {
        const { data: inserted, error: insertError } = await admin.from('raw_listings').upsert(
          listings.map((l) => ({
            marketplace: l.marketplace, external_id: l.externalId, title: l.title, price: l.price, shipping: l.shipping,
            condition: l.condition, image_url: l.imageUrl, image_key: l.imageKey, listing_url: l.listingUrl,
            location: l.location, category: l.category, listed_at: l.listedAt,
            search_term_id: term.id, query: term.query,
          })),
          { onConflict: 'marketplace,external_id', ignoreDuplicates: true },
        ).select('id');
        if (insertError) throw insertError;
        collected += inserted?.length ?? 0;
      }
      // One resale estimate per term, refreshed every few hours.
      if (!(await cachedResale(admin, term.query))) {
        const resale = await source.resale(term.query, listings.map((l) => l.price));
        if (resale) await saveResale(admin, term.query, resale);
      }
      await admin.from('search_terms').update({ last_run_at: new Date().toISOString() }).eq('id', term.id);
    } catch (e) {
      errors++;
      notes.push(`${term.query}: ${e instanceof Error ? e.message : String(e)}`.slice(0, 200));
    }
  }

  if (run) {
    await admin.from('pipeline_runs').update({
      finished_at: new Date().toISOString(), collected, errors, note: notes.join(' | '),
    }).eq('id', run.id);
  }
  return json({ source: source.name, terms: terms?.length ?? 0, collected, errors });
});
