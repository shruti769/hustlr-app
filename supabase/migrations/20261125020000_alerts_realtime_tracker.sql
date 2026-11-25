-- Alerts, live updates and the price tracker.
--
--  · push_tokens: each device a user signs in on registers its Expo push token.
--  · profiles.deal_alerts: users can switch Steal alerts off.
--  · notifications gain a kind and an optional deal to open on tap.
--  · fan_out_deal_alert(): one in-app notification per opted-in user for a new
--    Steal, capped at 3 a day each; returns who to push to.
--  · tracked_items gain what the tracker job needs to refresh prices.
--  · deals and notifications are published for Supabase Realtime.

create table public.push_tokens (
  token       text primary key,
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  platform    text not null,
  updated_at  timestamptz not null default now()
);

alter table public.push_tokens enable row level security;
create policy "push tokens: own" on public.push_tokens
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.push_tokens to authenticated;
create index push_tokens_user on public.push_tokens (user_id);

alter table public.profiles add column deal_alerts boolean not null default true;
grant update (deal_alerts) on public.profiles to authenticated;

alter table public.notifications
  add column kind     text not null default 'info',
  add column deal_id  bigint references public.deals on delete set null;

-- ───────────────────────────────────────────────────────── steal alerts

create function public.fan_out_deal_alert(p_deal_id bigint, p_daily_cap int default 3)
returns table (user_id uuid)
language plpgsql security definer set search_path = public as $$
declare
  d public.deals;
begin
  select * into d from public.deals where id = p_deal_id;
  if not found then
    return;
  end if;
  return query
  insert into public.notifications (user_id, title, body, image_key, kind, deal_id)
  select p.id,
         'Steal found: ' || left(d.name, 60),
         d.marketplace || ' · $' || round(d.buy_price) || ' → resells ~$' || round(d.resale_price) || ' · score ' || d.score,
         d.image_key, 'steal', d.id
    from public.profiles p
   where p.deal_alerts
     and (select count(*) from public.notifications n
           where n.user_id = p.id and n.kind = 'steal' and n.created_at > now() - interval '1 day') < p_daily_cap
  returning notifications.user_id;
end $$;

revoke execute on function public.fan_out_deal_alert(bigint, int) from public, anon, authenticated;
grant execute on function public.fan_out_deal_alert(bigint, int) to service_role;

-- ────────────────────────────────────────────────────────── price tracker

alter table public.tracked_items
  add column deal_id          bigint references public.deals on delete set null,
  add column last_checked_at  timestamptz,
  add column alerted_at       timestamptz;

-- ─────────────────────────────────────────────────────────────── realtime

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.deals, public.notifications;
  end if;
end $$;
