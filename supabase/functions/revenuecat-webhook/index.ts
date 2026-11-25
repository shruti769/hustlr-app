// RevenueCat → profiles.plan. The only writer of a user's plan.
//
// In RevenueCat: Project → Integrations → Webhooks, URL
//   https://<ref>.supabase.co/functions/v1/revenuecat-webhook
// and an Authorization header value equal to REVENUECAT_WEBHOOK_SECRET.
// The app logs users in to RevenueCat with their Supabase user id, so
// `app_user_id` is that id.
//
// Deploy: supabase functions deploy revenuecat-webhook --no-verify-jwt

import { cors, json } from '../_shared/http.ts';
import { adminClient } from '../_shared/score.ts';

type RcEvent = {
  type: string;
  app_user_id: string;
  original_app_user_id?: string;
  aliases?: string[];
  entitlement_ids?: string[] | null;
  expiration_at_ms?: number | null;
  store?: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Events that change what the user is entitled to right now. */
const GRANTS = new Set(['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE', 'NON_RENEWING_PURCHASE', 'SUBSCRIPTION_EXTENDED']);
const ENDS = new Set(['EXPIRATION']);

const planOf = (ids: string[] | null | undefined) =>
  ids?.includes('mogul') ? 'mogul' : ids?.includes('hustler') ? 'hustler' : 'scout';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const secret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
  if (!secret || req.headers.get('Authorization') !== secret) return json({ error: 'Forbidden' }, 403);

  let event: RcEvent;
  try {
    event = (await req.json()).event;
  } catch {
    return json({ error: 'Bad payload' }, 400);
  }
  if (!event?.type) return json({ error: 'Bad payload' }, 400);

  // Cancellations, billing issues and the like keep access until EXPIRATION arrives.
  if (!GRANTS.has(event.type) && !ENDS.has(event.type)) return json({ ignored: event.type });

  const userId = [event.app_user_id, event.original_app_user_id, ...(event.aliases ?? [])].find((id) => id && UUID.test(id));
  if (!userId) return json({ ignored: 'no Supabase user id' });

  const plan = ENDS.has(event.type) ? 'scout' : planOf(event.entitlement_ids);
  const { error } = await adminClient().from('profiles').update({
    plan,
    plan_expires_at: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
    plan_source: event.store ?? 'revenuecat',
  }).eq('id', userId);
  if (error) return json({ error: error.message }, 500);

  // Mogul pays 10 Flash Alert tokens with each month it's bought or renewed.
  if (plan === 'mogul' && (event.type === 'INITIAL_PURCHASE' || event.type === 'RENEWAL')) {
    const { error: grantError } = await adminClient().rpc('admin_grant', { p_user: userId, p_xp: 0, p_tickets: 0, p_flash: 10 });
    if (grantError) console.warn('flash grant failed', grantError.message);
  }
  return json({ userId, plan });
});
