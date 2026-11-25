-- Admin panel access, on the same Supabase project as the app.
--
-- Admins sign in with a normal Supabase account; only accounts listed in
-- admin_users get admin rights. Roles match the panel: 'Super admin',
-- 'Moderator', 'Support'.
--
--  · Admins can read the tables they manage, and edit catalogs / content
--    directly (RLS: is_admin()).
--  · Money-like changes (tickets, Flash tokens, credits, suspensions,
--    payouts) go through admin_* functions that check the role.
--  · Every admin action is written to admin_audit_log.
--
-- First admin (run once in the SQL Editor, with your email):
--   insert into public.admin_users (user_id, role)
--   select id, 'Super admin' from auth.users where email = 'you@example.com';

create table public.admin_users (
  user_id   uuid primary key references auth.users on delete cascade,
  role      text not null default 'Super admin' check (role in ('Super admin', 'Moderator', 'Support')),
  added_at  timestamptz not null default now()
);
alter table public.admin_users enable row level security;
-- No client policies: read through admin_me().

create function public.admin_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.admin_users where user_id = auth.uid();
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- Raises unless the caller is an admin with one of the given roles (any role when null).
create function public._require_admin(p_roles text[] default null) returns text
language plpgsql stable security definer set search_path = public as $$
declare
  r text := public.admin_role();
begin
  if r is null then
    raise exception 'admins only';
  end if;
  if p_roles is not null and not (r = any (p_roles)) then
    raise exception 'your role (%) cannot do this', r;
  end if;
  return r;
end $$;

-- ───────────────────────────────────────────────────────────── audit log

create table public.admin_audit_log (
  id          bigint generated always as identity primary key,
  admin_id    uuid references auth.users on delete set null,
  admin_name  text not null,
  action      text not null,
  target      text not null default '',
  created_at  timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;
create policy "audit: admins read" on public.admin_audit_log for select to authenticated using (public.is_admin());
grant select on public.admin_audit_log to authenticated;

create function public.admin_log(p_action text, p_target text) returns void
language plpgsql security definer set search_path = public as $$
declare
  who text;
begin
  perform public._require_admin();
  select coalesce(nullif(p.full_name, ''), u.email) into who
    from auth.users u left join public.profiles p on p.id = u.id where u.id = auth.uid();
  insert into public.admin_audit_log (admin_id, admin_name, action, target)
  values (auth.uid(), coalesce(who, 'Admin'), left(p_action, 120), left(coalesce(p_target, ''), 300));
end $$;

-- ─────────────────────────────────────────── account status (flag / suspend)

alter table public.profiles
  add column status        text not null default 'Active' check (status in ('Active', 'Flagged', 'Suspended')),
  add column status_note   text,
  add column board_hidden  boolean not null default false;

-- A suspended account can't play or earn: every game rule starts here.
create or replace function public._my_profile() returns public.profiles
language plpgsql security definer set search_path = public as $$
declare
  p public.profiles;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  update public.profiles
     set spins_left = 3, spins_day = current_date
   where id = auth.uid() and spins_day < current_date;
  select * into p from public.profiles where id = auth.uid() for update;
  if not found then
    raise exception 'profile missing';
  end if;
  if p.status = 'Suspended' then
    raise exception 'account suspended';
  end if;
  return p;
end $$;

-- Hidden users drop off every board (but still see their own rank).
create or replace function public.leaderboard(p_scope text) returns json
language plpgsql security definer set search_path = public as $$
declare
  me public.profiles := public._my_profile();
begin
  return public._board(p_scope, me.region, me.id);
end $$;

create function public._board(p_scope text, p_region text, p_me uuid) returns json
language plpgsql stable security definer set search_path = public as $$
declare
  since timestamptz := case p_scope
                         when 'Weekly'  then date_trunc('week', now())
                         when 'Monthly' then date_trunc('month', now())
                       end;
begin
  if p_scope not in ('Regional', 'Global', 'Weekly', 'Monthly') then
    raise exception 'unknown board';
  end if;
  return coalesce((
    with sold as (
      select i.user_id, count(*) as flips, sum(i.sold_price - i.buy_price) as profit
        from public.inventory_items i
       where i.status = 'Sold' and (since is null or i.sold_at >= since)
       group by i.user_id
    ),
    board as (
      select p.id, p.full_name, p.handle, p.level, p.board_hidden,
             case when p.last_check_in >= current_date - 1 then p.streak else 0 end as streak,
             coalesce(s.flips, 0) as flips, coalesce(s.profit, 0) as profit
        from public.profiles p
        left join sold s on s.user_id = p.id
       where (p_scope = 'Global' or p.region = p_region)
         and (s.user_id is not null or p.id = p_me)
         and p.status <> 'Suspended'
         and (not p.board_hidden or p.id = p_me or p_me is null)
         and (p_me is null or not exists (select 1 from public.blocked_users b where b.user_id = p_me and b.blocked_id = p.id))
    ),
    ranked as (
      select *, rank() over (order by profit desc, id) as rk from board
    )
    select json_agg(json_build_object(
      'user_id', case when p_me is null then r.id end,
      'rank', r.rk,
      'name', case when r.id = p_me then 'You'
                   else split_part(coalesce(nullif(r.full_name, ''), ltrim(r.handle, '@'), 'Hustler'), ' ', 1)
                        || coalesce(' ' || left(nullif(split_part(r.full_name, ' ', 2), ''), 1) || '.', '') end,
      'initials', upper(left(coalesce(nullif(r.full_name, ''), ltrim(r.handle, '@'), 'H'), 1)
                        || coalesce(left(nullif(split_part(r.full_name, ' ', 2), ''), 1), '')),
      'handle', coalesce(r.handle, ''),
      'profit', r.profit, 'streak', r.streak, 'level', r.level, 'flips', r.flips,
      'hidden', r.board_hidden,
      'badge', coalesce((select upper(a.name) from public.user_achievements u join public.achievements a on a.key = u.key
                          where u.user_id = r.id order by u.unlocked_at desc limit 1), ''),
      'me', r.id = p_me
    ) order by r.rk)
      from ranked r
     where r.rk <= case when p_me is null then 100 else 20 end or r.id = p_me
  ), '[]'::json);
end $$;

-- ───────────────────────────────────────────────── payouts: a status trail

alter table public.prize_wins
  add column status       text not null default 'Pending' check (status in ('Pending', 'Approved', 'Paid', 'Rejected')),
  add column reason       text,
  add column reviewed_by  uuid references auth.users on delete set null,
  add column reviewed_at  timestamptz;
update public.prize_wins set status = 'Paid' where paid;

-- ───────────────────────────────────────────── what admins can read / edit

-- Read everything they manage.
create policy "profiles: admins read"      on public.profiles        for select to authenticated using (public.is_admin());
create policy "inventory: admins read"     on public.inventory_items for select to authenticated using (public.is_admin());
create policy "deals: admins read"         on public.deals           for select to authenticated using (public.is_admin());
create policy "flips: admins read"         on public.flips           for select to authenticated using (public.is_admin());
create policy "reports: admins read"       on public.flip_reports    for select to authenticated using (public.is_admin());
create policy "prize wins: admins read"    on public.prize_wins      for select to authenticated using (public.is_admin());
create policy "hoh sessions: admins read"  on public.hoh_sessions    for select to authenticated using (public.is_admin());
create policy "cosmetics owned: admins read" on public.user_cosmetics for select to authenticated using (public.is_admin());
create policy "pipeline runs: admins read" on public.pipeline_runs   for select to authenticated using (public.is_admin());

-- Edit catalogs and content directly.
create policy "hoh cards: admins"        on public.hoh_cards      for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "reward catalog: admins"   on public.reward_catalog for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "reward wheel: admins"     on public.reward_wheel   for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "cosmetics: admins"        on public.cosmetics      for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "store: admins"            on public.store_items    for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "puzzles: admins"          on public.weekly_puzzles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "search terms: admins"     on public.search_terms   for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "deals: admins edit"       on public.deals          for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "flips: admins edit"       on public.flips          for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "flips: admins delete"     on public.flips          for delete to authenticated using (public.is_admin());
create policy "reports: admins delete"   on public.flip_reports   for delete to authenticated using (public.is_admin());

grant select, insert, update, delete on
  public.hoh_cards, public.reward_catalog, public.reward_wheel, public.cosmetics, public.store_items,
  public.weekly_puzzles, public.search_terms
  to authenticated;
grant select on public.hoh_sessions, public.user_cosmetics, public.pipeline_runs, public.flip_reports to authenticated;
grant update (is_active, badge) on public.deals to authenticated;
grant update (hidden, report_count) on public.flips to authenticated;
grant delete on public.flip_reports to authenticated;

-- ───────────────────────────────────────────────────────── admin functions

create function public.admin_me() returns json
language sql stable security definer set search_path = public as $$
  select case when a.user_id is null then null else json_build_object(
    'role', a.role,
    'name', coalesce(nullif(p.full_name, ''), u.email),
    'email', u.email
  ) end
    from auth.users u
    left join public.admin_users a on a.user_id = u.id
    left join public.profiles p on p.id = u.id
   where u.id = auth.uid();
$$;

-- Every user with the figures the Users screen shows.
create function public.admin_users_list() returns json
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_admin();
  return coalesce((
    with sold as (
      select user_id, count(*) as flips, sum(sold_price - buy_price) as profit
        from public.inventory_items where status = 'Sold' group by user_id
    ),
    base as (
      select p.*, u.email, u.last_sign_in_at,
             coalesce(s.flips, 0) as flips, coalesce(s.profit, 0) as profit,
             (select count(*) from public.user_achievements a where a.user_id = p.id) as ach
        from public.profiles p
        join auth.users u on u.id = p.id
        left join sold s on s.user_id = p.id
    ),
    ranked as (
      select b.*, case when b.flips > 0 then rank() over (partition by b.region order by b.profit desc) end as region_rank
        from base b
    )
    select json_agg(json_build_object(
      'id', r.id, 'name', r.full_name, 'handle', r.handle, 'email', r.email, 'region', r.region,
      'plan', r.plan, 'level', r.level, 'xp', r.xp, 'xp_max', r.xp_max,
      'streak', case when r.last_check_in >= current_date - 1 then r.streak else 0 end,
      'tickets', r.tickets, 'flash', r.flash_tokens, 'credits', r.credits,
      'flips', r.flips, 'profit', r.profit, 'rank', r.region_rank, 'ach', r.ach,
      'status', r.status, 'note', r.status_note, 'owned', r.owned,
      'last_sign_in_at', r.last_sign_in_at, 'created_at', r.created_at
    ) order by r.profit desc, r.created_at desc)
      from ranked r
  ), '[]'::json);
end $$;

-- Add (or remove, with negatives) tickets, Flash tokens and credits.
create function public.admin_adjust_wallet(p_user uuid, p_tickets int, p_flash int, p_credits int) returns json
language plpgsql security definer set search_path = public as $$
declare
  p public.profiles;
begin
  perform public._require_admin(array['Super admin', 'Support']);
  select * into p from public.profiles where id = p_user for update;
  if not found then
    raise exception 'user not found';
  end if;
  update public.profiles
     set tickets      = greatest(0, tickets + coalesce(p_tickets, 0)),
         flash_tokens = greatest(0, flash_tokens + coalesce(p_flash, 0)),
         credits      = greatest(0, credits + coalesce(p_credits, 0))
   where id = p_user
  returning * into p;
  return json_build_object('tickets', p.tickets, 'flash', p.flash_tokens, 'credits', p.credits);
end $$;

-- Keeps a lapsed streak alive (as if they checked in yesterday).
create function public.admin_restore_streak(p_user uuid, p_days int) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin(array['Super admin', 'Support']);
  update public.profiles
     set streak = greatest(coalesce(p_days, streak), 1), last_check_in = current_date - 1
   where id = p_user and (last_check_in is null or last_check_in < current_date);
end $$;

create function public.admin_set_status(p_user uuid, p_status text, p_note text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin();
  if p_status not in ('Active', 'Flagged', 'Suspended') then
    raise exception 'unknown status';
  end if;
  update public.profiles
     set status = p_status,
         status_note = case when p_status = 'Active' then null else coalesce(p_note, status_note) end
   where id = p_user;
end $$;

create function public.admin_set_board_hidden(p_user uuid, p_hidden boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin(array['Super admin', 'Moderator']);
  update public.profiles set board_hidden = p_hidden where id = p_user;
end $$;

create function public.admin_leaderboard(p_scope text, p_region text) returns json
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_admin();
  return public._board(p_scope, p_region, null);
end $$;

create function public.admin_review_payout(p_id bigint, p_status text, p_reason text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._require_admin(array['Super admin', 'Support']);
  if p_status not in ('Pending', 'Approved', 'Paid', 'Rejected') then
    raise exception 'unknown status';
  end if;
  update public.prize_wins
     set status = p_status, paid = (p_status = 'Paid'), reason = p_reason,
         reviewed_by = auth.uid(), reviewed_at = now()
   where id = p_id;
  if not found then
    raise exception 'payout not found';
  end if;
end $$;

create function public.admin_payouts() returns json
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_admin(array['Super admin', 'Support']);
  return coalesce((
    select json_agg(json_build_object(
      'id', w.id, 'user_id', w.user_id, 'name', p.full_name, 'handle', p.handle, 'email', u.email,
      'amount', w.amount_aud, 'status', w.status, 'reason', w.reason, 'created_at', w.created_at,
      'user_status', p.status
    ) order by w.created_at desc)
      from public.prize_wins w
      join public.profiles p on p.id = w.user_id
      join auth.users u on u.id = w.user_id
  ), '[]'::json);
end $$;

-- Plays and accuracy per HUSTLE or HOLD card.
create function public.admin_hoh_stats() returns json
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_admin();
  return coalesce((
    select json_object_agg(card_id, json_build_object('plays', plays, 'acc', acc))
      from (
        select x.card_id, count(*) as plays, round(100.0 * avg(case when x.ok then 1 else 0 end)) as acc
          from public.hoh_sessions s
          cross join lateral unnest(s.card_ids[1:cardinality(s.results)], s.results) as x(card_id, ok)
         group by x.card_id
      ) t
  ), '{}'::json);
end $$;

-- Headline numbers for the Overview screen.
create function public.admin_overview() returns json
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_admin();
  return json_build_object(
    'users', (select count(*) from public.profiles),
    'new_7d', (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'active_24h', (select count(*) from auth.users where last_sign_in_at > now() - interval '24 hours'),
    'plans', (select json_object_agg(plan, n) from (select plan, count(*) n from public.profiles group by plan) x),
    'deals_live', (select count(*) from public.deals where is_active),
    'steals_24h', (select count(*) from public.deals where badge = 'STEAL' and created_at > now() - interval '24 hours'),
    'payouts_pending', (select count(*) from public.prize_wins where status = 'Pending'),
    'flips_reported', (select count(*) from public.flips where report_count > 0),
    'flagged', (select count(*) from public.profiles where status = 'Flagged'),
    'hoh_sessions_24h', (select count(*) from public.hoh_sessions where created_at > now() - interval '24 hours'),
    'tickets_out', (select coalesce(sum(tickets), 0) from public.profiles),
    'last_runs', (select json_agg(r) from (select job, started_at, finished_at, collected, scored, errors, note
                                            from public.pipeline_runs order by started_at desc limit 6) r)
  );
end $$;

revoke execute on function
  public._require_admin(text[]), public._board(text, text, uuid)
  from public, anon, authenticated;
revoke execute on function
  public.admin_role(), public.is_admin(), public.admin_log(text, text), public.admin_me(), public.admin_users_list(),
  public.admin_adjust_wallet(uuid, int, int, int), public.admin_restore_streak(uuid, int),
  public.admin_set_status(uuid, text, text), public.admin_set_board_hidden(uuid, boolean),
  public.admin_leaderboard(text, text), public.admin_review_payout(bigint, text, text), public.admin_payouts(),
  public.admin_hoh_stats(), public.admin_overview()
  from public, anon;
grant execute on function
  public.admin_role(), public.is_admin(), public.admin_log(text, text), public.admin_me(), public.admin_users_list(),
  public.admin_adjust_wallet(uuid, int, int, int), public.admin_restore_streak(uuid, int),
  public.admin_set_status(uuid, text, text), public.admin_set_board_hidden(uuid, boolean),
  public.admin_leaderboard(text, text), public.admin_review_payout(bigint, text, text), public.admin_payouts(),
  public.admin_hoh_stats(), public.admin_overview()
  to authenticated;

-- ──────────────────────────────────────── round scheduling + store switches

-- HUSTLE or HOLD rounds can be drafted or scheduled for a day.
alter table public.hoh_cards
  add column status   text not null default 'Live' check (status in ('Live', 'Scheduled', 'Draft')),
  add column live_on  date;

create or replace function public.hoh_start() returns json
language plpgsql security definer set search_path = public as $$
declare
  p     public.profiles := public._my_profile();
  ids   bigint[];
  sid   bigint;
begin
  if (select count(*) from public.hoh_sessions s where s.user_id = p.id and s.created_at >= current_date) >= 20 then
    raise exception 'that''s 20 sessions today — come back tomorrow';
  end if;
  select array_agg(id) into ids from (
    select id from public.hoh_cards
     where active and (status = 'Live' or (status = 'Scheduled' and live_on <= current_date))
     order by random() limit 6
  ) c;
  if ids is null then
    raise exception 'no listings to judge';
  end if;
  insert into public.hoh_sessions (user_id, card_ids) values (p.id, ids) returning id into sid;
  return json_build_object(
    'session', sid,
    'cards', (
      select json_agg(json_build_object(
        'id', c.id, 'name', c.name, 'image_key', c.image_key, 'image_url', c.image_url,
        'platform', c.platform, 'condition', c.condition, 'location', c.location, 'listed', c.listed,
        'demand', c.demand, 'tone', c.tone, 'price', c.price, 'resale', c.resale
      ) order by array_position(ids, c.id))
        from public.hoh_cards c where c.id = any (ids)
    )
  );
end $$;

-- Credit Store items an admin switched off disappear from the app.
alter table public.store_items add column active boolean not null default true;
drop policy "store: signed-in read" on public.store_items;
create policy "store: signed-in read" on public.store_items for select to authenticated using (active);

-- Photos admins upload for rounds and puzzles. Public to read, admins to write.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('admin-media', 'admin-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "admin media: admins upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'admin-media' and public.is_admin());
create policy "admin media: admins replace" on storage.objects for update to authenticated
  using (bucket_id = 'admin-media' and public.is_admin());
create policy "admin media: admins delete" on storage.objects for delete to authenticated
  using (bucket_id = 'admin-media' and public.is_admin());

create or replace function public.buy_store_item(p_key text) returns public.profiles
language plpgsql security definer set search_path = public as $$
declare
  p    public.profiles := public._my_profile();
  item public.store_items;
begin
  select * into item from public.store_items where key = p_key and active;
  if not found then
    raise exception 'this item is not on sale';
  end if;
  if p_key = any (p.owned) then
    return p;
  end if;
  if p.credits < item.cost then
    raise exception 'not enough credits';
  end if;
  update public.profiles
     set credits = credits - item.cost,
         owned   = array_append(owned, p_key)
   where id = p.id
  returning * into p;
  return p;
end $$;
