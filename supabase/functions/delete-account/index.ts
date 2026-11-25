// Deletes the calling user's account: their inventory photos in storage, then
// the auth user itself. Every table row the user owns is removed by
// `on delete cascade` from auth.users.
//
// Deploy: supabase functions deploy delete-account

import { createClient } from 'npm:@supabase/supabase-js@2';

import { cors, env, json } from '../_shared/http.ts';

const PHOTO_BUCKET = 'inventory-photos';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const url = env('SUPABASE_URL');
  const authHeader = req.headers.get('Authorization') ?? '';

  // Who is asking? Verify with their own token, never trust a user id from the body.
  const asUser = createClient(url, env('SUPABASE_ANON_KEY'), { global: { headers: { Authorization: authHeader } } });
  const { data: { user }, error: userError } = await asUser.auth.getUser();
  if (userError || !user) return json({ error: 'Not signed in' }, 401);

  const admin = createClient(url, env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });

  // Photos live under `<user id>/`.
  for (;;) {
    const { data: files, error } = await admin.storage.from(PHOTO_BUCKET).list(user.id, { limit: 100 });
    if (error) return json({ error: 'Could not list photos' }, 500);
    if (!files?.length) break;
    const { error: removeError } = await admin.storage.from(PHOTO_BUCKET).remove(files.map((f) => `${user.id}/${f.name}`));
    if (removeError) return json({ error: 'Could not delete photos' }, 500);
    if (files.length < 100) break;
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) return json({ error: 'Could not delete account' }, 500);

  return json({ deleted: true });
});
