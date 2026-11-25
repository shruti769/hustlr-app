-- Plans, limits and a safe Flip Tok.
--
--  · Plan limits enforced in the database, so no client can skip them:
--    Scout (free) keeps up to 20 inventory items and 3 tracked items.
--    (Analyses are limited to 10 a day in the analyse-listing function.)
--  · profiles.plan is written only by the RevenueCat webhook (service role).
--  · Flip Tok: users share their own wins; anyone can report a post (3
--    reports hide it), block an author, and posts pass a word filter.
--    Posting requires accepting the community rules once.

-- ──────────────────────────────────────────────────────────── plan limits

create function public._plan_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  plan  text;
  cap   int;
  used  int;
begin
  -- Rows created by the system (sign-up starter data) have no signed-in user.
  if auth.uid() is null then
    return new;
  end if;
  select p.plan into plan from public.profiles p where p.id = new.user_id;
  if coalesce(plan, 'scout') <> 'scout' then
    return new;
  end if;
  cap := case tg_table_name when 'inventory_items' then 20 when 'tracked_items' then 3 end;
  execute format('select count(*) from public.%I where user_id = $1', tg_table_name) into used using new.user_id;
  if used >= cap then
    raise exception using
      errcode = 'P0001',
      message = format('Free plan limit reached: %s %s. Upgrade to Hustler for unlimited.',
                       cap, case tg_table_name when 'inventory_items' then 'inventory items' else 'tracked items' end);
  end if;
  return new;
end $$;

create trigger inventory_plan_limit before insert on public.inventory_items
  for each row execute function public._plan_limit();
create trigger tracked_plan_limit before insert on public.tracked_items
  for each row execute function public._plan_limit();

-- When a subscription changes, keep a record of where the plan came from.
alter table public.profiles
  add column plan_expires_at  timestamptz,
  add column plan_source      text,
  add column flip_terms_at    timestamptz;

-- Accepting the community rules is the user's own action.
grant update (flip_terms_at) on public.profiles to authenticated;

-- ────────────────────────────────────────────────────────────── flip tok

alter table public.flips
  add column user_id     uuid references auth.users on delete cascade,
  add column hidden      boolean not null default false,
  add column report_count int not null default 0;

alter table public.flips alter column user_id set default auth.uid();

create table public.flip_reports (
  flip_id     bigint not null references public.flips on delete cascade,
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  reason      text not null check (reason in ('spam', 'scam', 'offensive', 'fake', 'other')),
  created_at  timestamptz not null default now(),
  primary key (flip_id, user_id)
);

create table public.blocked_users (
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  blocked_id  uuid not null references auth.users on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, blocked_id),
  check (user_id <> blocked_id)
);

alter table public.flip_reports  enable row level security;
alter table public.blocked_users enable row level security;

-- Feed: visible posts, minus authors the viewer has blocked.
drop policy "flips: signed-in read" on public.flips;
create policy "flips: feed" on public.flips for select to authenticated using (
  (not hidden or user_id = auth.uid())
  and (user_id is null or not exists (
    select 1 from public.blocked_users b where b.user_id = auth.uid() and b.blocked_id = flips.user_id))
);
create policy "flips: post own" on public.flips for insert to authenticated
  with check (user_id = auth.uid());
create policy "flips: delete own" on public.flips for delete to authenticated
  using (user_id = auth.uid());

create policy "reports: own" on public.flip_reports for insert to authenticated
  with check (user_id = auth.uid());
create policy "reports: read own" on public.flip_reports for select to authenticated
  using (user_id = auth.uid());
create policy "blocks: own" on public.blocked_users for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

grant insert, delete on public.flips to authenticated;
grant select, insert on public.flip_reports to authenticated;
grant select, insert, delete on public.blocked_users to authenticated;

-- Posts are checked before they are saved: community rules accepted, text clean.
create function public._flip_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  banned text[] := array['scam', 'fuck', 'shit', 'bitch', 'cunt', 'nigger', 'faggot', 'retard', 'whatsapp me', 'telegram me', 'cashapp me'];
  word   text;
  me     public.profiles;
begin
  if new.user_id is null then
    return new; -- seeded content
  end if;
  select * into me from public.profiles p where p.id = new.user_id;
  if me.flip_terms_at is null then
    raise exception using errcode = 'P0001', message = 'Accept the Flip Tok community rules before posting.';
  end if;
  if length(trim(new.copy)) < 10 or length(new.copy) > 400 then
    raise exception using errcode = 'P0001', message = 'Write 10–400 characters about your flip.';
  end if;
  foreach word in array banned loop
    if lower(new.copy) like '%' || word || '%' then
      raise exception using errcode = 'P0001', message = 'That post breaks the community rules. Please edit it.';
    end if;
  end loop;
  -- The author shown is always the poster's own profile.
  new.author_name := coalesce(nullif(me.full_name, ''), 'Hustler');
  new.handle := coalesce(me.handle, '@hustler');
  new.initials := upper(left(split_part(new.author_name, ' ', 1), 1) || left(split_part(new.author_name, ' ', 2), 1));
  new.likes := 0;
  new.shares := 0;
  new.hidden := false;
  new.report_count := 0;
  return new;
end $$;

create trigger flip_guard before insert on public.flips
  for each row execute function public._flip_guard();

-- Three reports hide a post until someone reviews it.
create function public._flip_reported() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.flips
     set report_count = report_count + 1,
         hidden = hidden or report_count + 1 >= 3
   where id = new.flip_id;
  return new;
end $$;

create trigger flip_reported after insert on public.flip_reports
  for each row execute function public._flip_reported();

revoke execute on function public._plan_limit(), public._flip_guard(), public._flip_reported() from public, anon, authenticated;

-- ─────────────────────────────────────── starter data within Scout limits

-- New accounts start with three price alerts (the Scout limit), not four.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, handle)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    '@' || split_part(new.email, '@', 1)
  );

  insert into public.watchlist (user_id, deal_id)
  select new.id, d.id from public.deals d where d.is_active order by d.score desc, d.id limit 4;

  insert into public.tracked_items (user_id, name, now_price, target_price, change_pct) values
    (new.id, 'Air Jordan 4 Retro', 0, 380, 0),
    (new.id, 'Pokémon 151 Booster Box', 0, 320, 0),
    (new.id, 'Nintendo Switch OLED', 0, 330, 0);

  insert into public.notifications (user_id, title, body, image_key) values
    (new.id, 'Welcome to HUSTLR', 'Your first deals are ready. Open Hot Deals to start stacking.', 'jordan');
  return new;
end $$;
