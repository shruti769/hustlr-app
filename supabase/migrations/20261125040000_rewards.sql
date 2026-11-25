-- The rewards layer (v2 design): XP and levels, tickets, Flash Alert tokens,
-- HUSTLE or HOLD, the Reward Spinner, redeemable boosts, cosmetics,
-- achievements, the Hold Pile, leaderboards and Missed Connections.
--
-- As with credits, a client can never write a balance directly. Every change
-- goes through a SECURITY DEFINER function that applies the game rule.

-- ───────────────────────────────────────────────────────── balances on profiles

alter table public.profiles
  add column xp               int  not null default 0    check (xp >= 0),
  add column xp_max           int  not null default 1000 check (xp_max > 0),
  add column level            int  not null default 1    check (level >= 1),
  add column tickets          int  not null default 50   check (tickets >= 0),
  add column flash_tokens     int  not null default 1    check (flash_tokens >= 0),
  add column hoh_correct      int  not null default 0,
  add column daily_reward_on  date,
  add column ads_day          date not null default current_date,
  add column ad_tickets_used  int  not null default 0,
  add column ad_flash_used    int  not null default 0;

-- Adds XP, tickets and Flash tokens, levelling up as often as the XP allows.
-- Each level costs 200 XP more than the last and pays 50 bonus tickets.
-- Returns the new level when the user levelled up, else 0.
create function public._grant(p_user uuid, p_xp int, p_tickets int, p_flash int) returns int
language plpgsql security definer set search_path = public as $$
declare
  p  public.profiles;
  up int := 0;
begin
  select * into p from public.profiles where id = p_user for update;
  if not found then
    raise exception 'profile missing';
  end if;
  p.xp           := p.xp + greatest(p_xp, 0);
  p.tickets      := p.tickets + p_tickets;
  p.flash_tokens := p.flash_tokens + p_flash;
  if p.tickets < 0 then
    raise exception 'not enough tickets';
  end if;
  if p.flash_tokens < 0 then
    raise exception 'no Flash tokens left';
  end if;
  while p.xp >= p.xp_max loop
    p.xp      := p.xp - p.xp_max;
    p.level   := p.level + 1;
    p.xp_max  := p.xp_max + 200;
    p.tickets := p.tickets + 50;
    up        := p.level;
  end loop;
  update public.profiles
     set xp = p.xp, level = p.level, xp_max = p.xp_max, tickets = p.tickets, flash_tokens = p.flash_tokens
   where id = p_user;
  return up;
end $$;

-- ──────────────────────────────────────────────────────────────── catalogs

-- Boosts and token packs bought with tickets.
create table public.reward_catalog (
  key             text primary key,
  name            text not null,
  description     text not null,
  duration_label  text not null,
  duration        interval,
  cost            int  not null check (cost >= 0),
  icon            text not null,
  repeatable      boolean not null default false,
  flash           int  not null default 0,
  min_level       int,
  sort            int  not null default 0,
  active          boolean not null default true
);

-- Cosmetics: how they look is drawn by the app, keyed by `key`.
create table public.cosmetics (
  key        text primary key,
  name       text not null,
  type       text not null,
  cost       int  not null check (cost >= 0),
  min_level  int,
  sort       int  not null default 0,
  active     boolean not null default true
);

-- Reward Spinner wedges, clockwise from the top (idx 0..7).
create table public.reward_wheel (
  idx             int primary key check (idx between 0 and 7),
  label           text not null,
  name            text not null,
  description     text not null,
  kind            text not null check (kind in ('FUNCTIONAL', 'COSMETIC')),
  weight          int  not null check (weight >= 0),
  boost_key       text,
  boost_duration  interval,
  boost_label     text,
  flash           int  not null default 0,
  cosmetic_key    text references public.cosmetics
);

-- HUSTLE or HOLD cards. The answer stays on the server until the call is made.
create table public.hoh_cards (
  id         bigint generated always as identity primary key,
  name       text not null,
  image_key  text,
  image_url  text,
  platform   text not null,
  condition  text not null,
  location   text not null,
  listed     text not null,
  demand     text not null,
  tone       text not null default 'a' check (tone in ('a', 'gold', 'neg')),
  price      int  not null,
  resale     int  not null,
  net_label  text not null,
  answer     text not null check (answer in ('hustle', 'hold')),
  reason     text not null,
  active     boolean not null default true
);

-- Achievements. `metric` names the figure the server can measure; the rest
-- unlock once those features track progress.
create table public.achievements (
  key        text primary key,
  category   text not null,
  name       text not null,
  condition  text not null,
  target     int  not null check (target > 0),
  xp         int  not null,
  icon       text not null,
  lock_note  text,
  metric     text check (metric in ('hoh_correct', 'streak', 'flips', 'lifetime_profit', 'best_flip_500', 'flash_fired')),
  sort       int  not null default 0
);

alter table public.reward_catalog enable row level security;
alter table public.cosmetics      enable row level security;
alter table public.reward_wheel   enable row level security;
alter table public.hoh_cards      enable row level security;
alter table public.achievements   enable row level security;

create policy "reward catalog: signed-in read" on public.reward_catalog for select to authenticated using (true);
create policy "cosmetics: signed-in read"      on public.cosmetics      for select to authenticated using (true);
create policy "reward wheel: signed-in read"   on public.reward_wheel   for select to authenticated using (true);
create policy "achievements: signed-in read"   on public.achievements   for select to authenticated using (true);
-- hoh_cards has no client policy: cards reach the app through hoh_start().

grant select on public.reward_catalog, public.cosmetics, public.reward_wheel, public.achievements to authenticated;

-- ──────────────────────────────────────────────────────────── per-user rows

create table public.user_boosts (
  user_id     uuid not null references auth.users on delete cascade,
  key         text not null,
  expires_at  timestamptz not null,
  primary key (user_id, key)
);

create table public.user_cosmetics (
  user_id      uuid not null references auth.users on delete cascade,
  key          text not null references public.cosmetics on delete cascade,
  equipped     boolean not null default false,
  acquired_at  timestamptz not null default now(),
  primary key (user_id, key)
);

create table public.user_achievements (
  user_id      uuid not null references auth.users on delete cascade,
  key          text not null references public.achievements on delete cascade,
  unlocked_at  timestamptz not null default now(),
  primary key (user_id, key)
);

create table public.hoh_sessions (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users on delete cascade,
  card_ids     bigint[] not null,
  idx          int  not null default 0,
  results      boolean[] not null default '{}',
  combo        int  not null default 0,
  best_combo   int  not null default 0,
  correct      int  not null default 0,
  xp           int  not null default 0,
  tickets      int  not null default 0,
  ad_used      boolean not null default false,
  created_at   timestamptz not null default now(),
  finished_at  timestamptz
);
create index hoh_sessions_user_day on public.hoh_sessions (user_id, created_at desc);

-- An armed Flash Alert: fires once, on the next new deal in its category.
create table public.flash_alerts (
  id             bigint generated always as identity primary key,
  user_id        uuid not null references auth.users on delete cascade,
  label          text not null,
  category       text,
  source         text not null check (source in ('deal', 'stream', 'missed', 'search')),
  ref            text,
  image_key      text,
  armed_at       timestamptz not null default now(),
  fired_at       timestamptz,
  fired_deal_id  bigint references public.deals on delete set null
);
create index flash_alerts_waiting on public.flash_alerts (category) where fired_at is null;

alter table public.user_boosts       enable row level security;
alter table public.user_cosmetics    enable row level security;
alter table public.user_achievements enable row level security;
alter table public.hoh_sessions      enable row level security;
alter table public.flash_alerts      enable row level security;

create policy "boosts: read own"       on public.user_boosts       for select to authenticated using (auth.uid() = user_id);
create policy "cosmetics: read own"    on public.user_cosmetics    for select to authenticated using (auth.uid() = user_id);
create policy "achievements: read own" on public.user_achievements for select to authenticated using (auth.uid() = user_id);
create policy "flash alerts: read own" on public.flash_alerts      for select to authenticated using (auth.uid() = user_id);

grant select on public.user_boosts, public.user_cosmetics, public.user_achievements, public.flash_alerts to authenticated;

-- ─────────────────────────────────────────────────────────────── Hold Pile

-- Saved deals are the Hold Pile: 10 slots, 15 while the +5 boost is active.
create function public._hold_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  slots int;
  used  int;
begin
  if auth.uid() is null then
    return new;
  end if;
  slots := 10 + case when exists (
    select 1 from public.user_boosts b where b.user_id = new.user_id and b.key = 'hold5' and b.expires_at > now()
  ) then 5 else 0 end;
  select count(*) into used from public.watchlist where user_id = new.user_id;
  if used >= slots then
    raise exception using errcode = 'P0001',
      message = format('Hold Pile full (%s slots). Redeem +5 slots to save more.', slots);
  end if;
  return new;
end $$;

create trigger watchlist_hold_limit before insert on public.watchlist
  for each row execute function public._hold_limit();

-- ─────────────────────────────────────────────── deals: when a listing ended

alter table public.deals add column ended_at timestamptz;

create or replace function public.expire_deals() returns int
language sql security definer set search_path = public as $$
  with gone as (
    update public.deals set is_active = false, ended_at = now()
     where is_active
       and external_id is not null
       and (expires_at < now() or price_checked_at < now() - interval '3 days')
    returning 1
  )
  select count(*)::int from gone;
$$;

-- ──────────────────────────────────────────────────────────── state + rules

-- Unlocks any measurable achievement the user has reached, paying its XP.
-- Returns the keys unlocked by this call.
create function public._unlock_achievements(p_user uuid) returns text[]
language plpgsql security definer set search_path = public as $$
declare
  p       public.profiles;
  flips   int;
  profit  numeric;
  best    numeric;
  fired   int;
  a       record;
  cur     numeric;
  got     text[] := '{}';
begin
  select * into p from public.profiles where id = p_user;
  select count(*), coalesce(sum(sold_price - buy_price), 0), coalesce(max(sold_price - buy_price), 0)
    into flips, profit, best
    from public.inventory_items where user_id = p_user and status = 'Sold';
  select count(*) into fired from public.flash_alerts where user_id = p_user and fired_at is not null;
  for a in
    select * from public.achievements x
     where x.metric is not null
       and not exists (select 1 from public.user_achievements u where u.user_id = p_user and u.key = x.key)
  loop
    cur := case a.metric
      when 'hoh_correct'     then p.hoh_correct
      when 'streak'          then p.streak
      when 'flips'           then flips
      when 'lifetime_profit' then profit
      when 'best_flip_500'   then case when best >= 500 then 1 else 0 end
      when 'flash_fired'     then fired
    end;
    if cur >= a.target then
      insert into public.user_achievements (user_id, key) values (p_user, a.key) on conflict do nothing;
      perform public._grant(p_user, a.xp, 0, 0);
      got := array_append(got, a.key);
    end if;
  end loop;
  return got;
end $$;

-- Everything the rewards screens need, in one call.
create function public.rewards_state() returns json
language plpgsql security definer set search_path = public as $$
declare
  p       public.profiles;
  flips   int;
  profit  numeric;
  best    numeric;
  fired   int;
  fresh   text[];
begin
  perform public._my_profile();
  fresh := public._unlock_achievements(auth.uid());
  update public.profiles set ads_day = current_date, ad_tickets_used = 0, ad_flash_used = 0
   where id = auth.uid() and ads_day < current_date;
  select * into p from public.profiles where id = auth.uid();
  select count(*), coalesce(sum(sold_price - buy_price), 0), coalesce(max(sold_price - buy_price), 0)
    into flips, profit, best
    from public.inventory_items where user_id = p.id and status = 'Sold';
  select count(*) into fired from public.flash_alerts where user_id = p.id and fired_at is not null;

  return json_build_object(
    'xp', p.xp, 'xp_max', p.xp_max, 'level', p.level, 'tickets', p.tickets, 'flash', p.flash_tokens,
    'hoh_correct', p.hoh_correct,
    'daily_claimed', p.daily_reward_on = current_date,
    'ads_left', greatest(0, 2 - p.ad_tickets_used),
    'flash_ad_left', greatest(0, 1 - p.ad_flash_used),
    'hoh_played_today', exists (select 1 from public.hoh_sessions s where s.user_id = p.id and s.created_at >= current_date and cardinality(s.results) > 0),
    'boosts', coalesce((select json_object_agg(b.key, b.expires_at) from public.user_boosts b where b.user_id = p.id and b.expires_at > now()), '{}'::json),
    'cosmetics', coalesce((select json_agg(json_build_object('key', c.key, 'equipped', c.equipped)) from public.user_cosmetics c where c.user_id = p.id), '[]'::json),
    'alerts', coalesce((select json_agg(json_build_object('id', f.id, 'label', f.label, 'category', f.category, 'source', f.source, 'ref', f.ref, 'image_key', f.image_key) order by f.armed_at)
                          from public.flash_alerts f where f.user_id = p.id and f.fired_at is null), '[]'::json),
    'achievements', coalesce((
      select json_agg(json_build_object(
        'key', a.key,
        'cur', least(a.target, case a.metric
          when 'hoh_correct'     then p.hoh_correct
          when 'streak'          then p.streak
          when 'flips'           then flips
          when 'lifetime_profit' then floor(profit)
          when 'best_flip_500'   then case when best >= 500 then 1 else 0 end
          when 'flash_fired'     then fired
          else case when u.key is not null then a.target else 0 end
        end),
        'done', u.key is not null
      ) order by a.sort)
        from public.achievements a
        left join public.user_achievements u on u.key = a.key and u.user_id = p.id), '[]'::json),
    'unlocked_now', to_json(fresh)
  );
end $$;

create function public.claim_daily_reward() returns json
language plpgsql security definer set search_path = public as $$
declare
  p  public.profiles := public._my_profile();
  up int;
begin
  if p.daily_reward_on = current_date then
    raise exception 'daily reward already claimed';
  end if;
  update public.profiles set daily_reward_on = current_date where id = p.id;
  up := public._grant(p.id, 15, 20, 1);
  return json_build_object('level_up', up, 'state', public.rewards_state());
end $$;

-- Rewarded ads: 2 ticket ads and 1 Flash ad a day.
create function public.ad_reward(p_kind text) returns json
language plpgsql security definer set search_path = public as $$
declare
  p  public.profiles := public._my_profile();
  up int;
begin
  if p.ads_day < current_date then
    update public.profiles set ads_day = current_date, ad_tickets_used = 0, ad_flash_used = 0 where id = p.id
    returning * into p;
  end if;
  if p_kind = 'tickets' then
    if p.ad_tickets_used >= 2 then raise exception 'daily ad rewards used'; end if;
    update public.profiles set ad_tickets_used = ad_tickets_used + 1 where id = p.id;
    up := public._grant(p.id, 0, 10, 0);
  elsif p_kind = 'flash' then
    if p.ad_flash_used >= 1 then raise exception 'ad already used today'; end if;
    update public.profiles set ad_flash_used = ad_flash_used + 1 where id = p.id;
    up := public._grant(p.id, 0, 0, 1);
  else
    raise exception 'unknown ad reward';
  end if;
  return json_build_object('level_up', up, 'state', public.rewards_state());
end $$;

create function public.redeem_reward(p_key text) returns json
language plpgsql security definer set search_path = public as $$
declare
  p  public.profiles := public._my_profile();
  r  public.reward_catalog;
begin
  select * into r from public.reward_catalog where key = p_key and active;
  if not found then
    raise exception 'unknown reward';
  end if;
  if r.min_level is not null and p.level < r.min_level then
    raise exception 'reach level % to redeem this', r.min_level;
  end if;
  if not r.repeatable and exists (
    select 1 from public.user_boosts b where b.user_id = p.id and b.key = r.key and b.expires_at > now()
  ) then
    raise exception 'already active';
  end if;
  if p.tickets < r.cost then
    raise exception 'not enough tickets';
  end if;
  perform public._grant(p.id, 0, -r.cost, r.flash);
  if r.duration is not null then
    insert into public.user_boosts (user_id, key, expires_at) values (p.id, r.key, now() + r.duration)
    on conflict (user_id, key) do update set expires_at = greatest(public.user_boosts.expires_at, now()) + r.duration;
  end if;
  return public.rewards_state();
end $$;

create function public.reward_spin() returns json
language plpgsql security definer set search_path = public as $$
declare
  p      public.profiles := public._my_profile();
  w      public.reward_wheel;
  total  int;
  roll   numeric;
begin
  if p.tickets < 50 then
    raise exception 'not enough tickets';
  end if;
  select sum(weight) into total from public.reward_wheel;
  if coalesce(total, 0) = 0 then
    raise exception 'the wheel is not set up';
  end if;
  roll := random() * total;
  for w in select * from public.reward_wheel order by idx loop
    roll := roll - w.weight;
    exit when roll <= 0;
  end loop;
  perform public._grant(p.id, 0, -50, w.flash);
  if w.boost_key is not null and w.boost_duration is not null then
    insert into public.user_boosts (user_id, key, expires_at) values (p.id, w.boost_key, now() + w.boost_duration)
    on conflict (user_id, key) do update set expires_at = greatest(public.user_boosts.expires_at, now()) + w.boost_duration;
  end if;
  if w.cosmetic_key is not null then
    insert into public.user_cosmetics (user_id, key) values (p.id, w.cosmetic_key) on conflict do nothing;
  end if;
  return json_build_object('index', w.idx, 'state', public.rewards_state());
end $$;

create function public.buy_cosmetic(p_key text) returns json
language plpgsql security definer set search_path = public as $$
declare
  p  public.profiles := public._my_profile();
  c  public.cosmetics;
begin
  select * into c from public.cosmetics where key = p_key and active;
  if not found then
    raise exception 'unknown cosmetic';
  end if;
  if exists (select 1 from public.user_cosmetics u where u.user_id = p.id and u.key = p_key) then
    return public.rewards_state();
  end if;
  if c.min_level is not null and p.level < c.min_level then
    raise exception 'reach level % to unlock', c.min_level;
  end if;
  if p.tickets < c.cost then
    raise exception 'not enough tickets';
  end if;
  perform public._grant(p.id, 0, -c.cost, 0);
  insert into public.user_cosmetics (user_id, key) values (p.id, p_key);
  return public.rewards_state();
end $$;

create function public.equip_cosmetic(p_key text, p_on boolean) returns json
language plpgsql security definer set search_path = public as $$
begin
  perform public._my_profile();
  update public.user_cosmetics set equipped = p_on where user_id = auth.uid() and key = p_key;
  if not found then
    raise exception 'you do not own this';
  end if;
  return public.rewards_state();
end $$;

-- Spends one Flash token to arm an alert. Arming the same thing twice is free.
create function public.arm_flash_alert(p_label text, p_category text, p_source text, p_ref text, p_image_key text default null)
returns json
language plpgsql security definer set search_path = public as $$
declare
  p public.profiles := public._my_profile();
begin
  if exists (select 1 from public.flash_alerts f
              where f.user_id = p.id and f.fired_at is null and f.source = p_source and f.ref is not distinct from p_ref) then
    return public.rewards_state();
  end if;
  if p.flash_tokens < 1 then
    raise exception 'no Flash tokens left';
  end if;
  perform public._grant(p.id, 0, 0, -1);
  insert into public.flash_alerts (user_id, label, category, source, ref, image_key)
  values (p.id, left(p_label, 120), nullif(p_category, ''), p_source, p_ref, p_image_key);
  return public.rewards_state();
end $$;

-- ────────────────────────────────────────────────────────── HUSTLE or HOLD

create function public.hoh_start() returns json
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
    select id from public.hoh_cards where active order by random() limit 6
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

create function public.hoh_answer(p_session bigint, p_choice text) returns json
language plpgsql security definer set search_path = public as $$
declare
  p      public.profiles := public._my_profile();
  s      public.hoh_sessions;
  c      public.hoh_cards;
  v_ok     boolean;
  v_combo  int;
  v_bonus  int;
  v_xp     int;
  v_tix    int;
  v_up     int;
  v_done   boolean;
begin
  if p_choice not in ('hustle', 'hold') then
    raise exception 'pick hustle or hold';
  end if;
  select * into s from public.hoh_sessions where id = p_session and user_id = p.id for update;
  if not found then
    raise exception 'session not found';
  end if;
  if s.finished_at is not null or s.idx >= cardinality(s.card_ids) then
    raise exception 'session already finished';
  end if;
  select * into c from public.hoh_cards where id = s.card_ids[s.idx + 1];
  v_ok    := c.answer = p_choice;
  v_combo := case when v_ok then s.combo + 1 else 0 end;
  v_bonus := case when v_ok and v_combo % 3 = 0 then 10 else 0 end;
  v_xp    := case when v_ok then 20 else 2 end;
  v_tix   := case when v_ok then 5 + v_bonus else 0 end;
  v_done  := s.idx + 1 >= cardinality(s.card_ids);
  update public.hoh_sessions h
     set idx = h.idx + 1, results = array_append(h.results, v_ok), combo = v_combo,
         best_combo = greatest(h.best_combo, v_combo),
         correct = h.correct + case when v_ok then 1 else 0 end, xp = h.xp + v_xp, tickets = h.tickets + v_tix,
         finished_at = case when v_done then now() end
   where h.id = s.id;
  if v_ok then
    update public.profiles set hoh_correct = hoh_correct + 1 where id = p.id;
  end if;
  v_up := public._grant(p.id, v_xp, v_tix, 0);
  return json_build_object(
    'ok', v_ok, 'answer', c.answer, 'reason', c.reason, 'net', c.net_label,
    'xp', v_xp, 'tickets', v_tix, 'bonus', v_bonus, 'combo', v_combo, 'done', v_done,
    'level_up', v_up, 'state', public.rewards_state()
  );
end $$;

-- After a session: an optional ad doubles the tickets won (or pays 10).
create function public.hoh_ad(p_session bigint) returns json
language plpgsql security definer set search_path = public as $$
declare
  p  public.profiles := public._my_profile();
  s  public.hoh_sessions;
  t  int;
  up int;
begin
  select * into s from public.hoh_sessions where id = p_session and user_id = p.id for update;
  if not found or s.finished_at is null then
    raise exception 'finish the session first';
  end if;
  if s.ad_used then
    raise exception 'bonus already claimed';
  end if;
  t := case when s.tickets > 0 then s.tickets else 10 end;
  update public.hoh_sessions set ad_used = true where id = s.id;
  up := public._grant(p.id, 0, t, 0);
  return json_build_object('tickets', t, 'level_up', up, 'state', public.rewards_state());
end $$;

-- ───────────────────────────────────────────────────────── leaderboards

-- 'Regional' and the weekly / monthly boards cover the caller's region;
-- 'Global' covers everyone. Profit is from items marked sold.
create function public.leaderboard(p_scope text) returns json
language plpgsql security definer set search_path = public as $$
declare
  me     public.profiles := public._my_profile();
  since  timestamptz := case p_scope
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
      select p.id, p.full_name, p.handle, p.level,
             case when p.last_check_in >= current_date - 1 then p.streak else 0 end as streak,
             coalesce(s.flips, 0) as flips, coalesce(s.profit, 0) as profit
        from public.profiles p
        left join sold s on s.user_id = p.id
       where (p_scope = 'Global' or p.region = me.region)
         and (s.user_id is not null or p.id = me.id)
         and not exists (select 1 from public.blocked_users b where b.user_id = me.id and b.blocked_id = p.id)
    ),
    ranked as (
      select *, rank() over (order by profit desc, id) as rk from board
    )
    select json_agg(json_build_object(
      'rank', r.rk,
      'name', case when r.id = me.id then 'You'
                   else split_part(coalesce(nullif(r.full_name, ''), ltrim(r.handle, '@'), 'Hustler'), ' ', 1)
                        || coalesce(' ' || left(nullif(split_part(r.full_name, ' ', 2), ''), 1) || '.', '') end,
      'initials', upper(left(coalesce(nullif(r.full_name, ''), ltrim(r.handle, '@'), 'H'), 1)
                        || coalesce(left(nullif(split_part(r.full_name, ' ', 2), ''), 1), '')),
      'handle', coalesce(r.handle, ''),
      'profit', r.profit, 'streak', r.streak, 'level', r.level, 'flips', r.flips,
      'badge', coalesce((select upper(a.name) from public.user_achievements u join public.achievements a on a.key = u.key
                          where u.user_id = r.id order by u.unlocked_at desc limit 1), ''),
      'me', r.id = me.id
    ) order by r.rk)
      from ranked r
     where r.rk <= 20 or r.id = me.id
  ), '[]'::json);
end $$;

-- ──────────────────────────────────────────────────── Missed Connections

-- Steals that ended in the last day which the user neither saved nor bought,
-- each with the likeliest reason and the fix the app suggests.
create function public.missed_connections() returns json
language plpgsql security definer set search_path = public as $$
declare
  me public.profiles := public._my_profile();
begin
  return coalesce((
    select json_agg(x order by x.profit desc) from (
      select d.id, d.name, d.category, d.marketplace, d.image_key, d.image_url, d.ended_at,
             round(d.buy_price) as price, round(d.resale_price) as resale,
             round(d.resale_price - d.buy_price - coalesce(d.est_fees, 0) - coalesce(d.est_shipping, 0)) as profit,
             case
               when extract(hour from d.created_at at time zone 'Australia/Sydney') < 6
                 then 'Listed at ' || to_char(d.created_at at time zone 'Australia/Sydney', 'FMHH12:MIam') || ' while your alerts were quiet overnight.'
               when not exists (select 1 from public.flash_alerts f where f.user_id = me.id and f.category = d.category)
                 then d.category || ' isn''t covered by any of your Flash Alerts.'
               else 'Another flipper got there first — it was gone ' ||
                    greatest(1, round(extract(epoch from (coalesce(d.ended_at, now()) - d.created_at)) / 60)) || ' min after listing.'
             end as reason,
             case
               when extract(hour from d.created_at at time zone 'Australia/Sydney') < 6 then 'upgrades'
               when not exists (select 1 from public.flash_alerts f where f.user_id = me.id and f.category = d.category) then 'flash'
               else 'redeem'
             end as fix
        from public.deals d
       where d.badge = 'STEAL'
         and not d.is_active
         and d.ended_at > now() - interval '24 hours'
         and not exists (select 1 from public.watchlist w where w.user_id = me.id and w.deal_id = d.id)
         and not exists (select 1 from public.inventory_items i where i.user_id = me.id and i.deal_id = d.id)
       order by d.resale_price - d.buy_price desc
       limit 4
    ) x
  ), '[]'::json);
end $$;

-- ─────────────────────────────────────────────────── pipeline + webhook

-- A new deal fires every waiting Flash Alert in its category (once each).
-- Returns the users to push to.
create function public.fan_out_flash_alerts(p_deal_id bigint)
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
  with hit as (
    update public.flash_alerts f
       set fired_at = now(), fired_deal_id = d.id
     where f.fired_at is null
       and f.category = d.category
       and f.ref is distinct from d.id::text
    returning f.user_id, f.label
  ),
  one as (
    select distinct on (h.user_id) h.user_id, h.label from hit h
  ),
  noted as (
    insert into public.notifications (user_id, title, body, image_key, kind, deal_id)
    select o.user_id, '⚡ Flash Alert: ' || left(d.name, 60),
           d.marketplace || ' · $' || round(d.buy_price) || ' → resells ~$' || round(d.resale_price) || ' · matches ' || left(o.label, 40),
           d.image_key, 'flash', d.id
      from one o
    returning notifications.user_id
  )
  select n.user_id from noted n;
end $$;

-- For trusted server code (webhooks): pay XP, tickets or Flash tokens.
create function public.admin_grant(p_user uuid, p_xp int, p_tickets int, p_flash int) returns int
language sql security definer set search_path = public as $$
  select public._grant(p_user, p_xp, p_tickets, p_flash);
$$;

-- ─────────────────────────────────────────────────────────────── grants

revoke execute on function public._grant(uuid, int, int, int), public._unlock_achievements(uuid), public._hold_limit()
  from public, anon, authenticated;
revoke execute on function
  public.rewards_state(), public.claim_daily_reward(), public.ad_reward(text), public.redeem_reward(text),
  public.reward_spin(), public.buy_cosmetic(text), public.equip_cosmetic(text, boolean),
  public.arm_flash_alert(text, text, text, text, text), public.hoh_start(), public.hoh_answer(bigint, text),
  public.hoh_ad(bigint), public.leaderboard(text), public.missed_connections()
  from public, anon;
grant execute on function
  public.rewards_state(), public.claim_daily_reward(), public.ad_reward(text), public.redeem_reward(text),
  public.reward_spin(), public.buy_cosmetic(text), public.equip_cosmetic(text, boolean),
  public.arm_flash_alert(text, text, text, text, text), public.hoh_start(), public.hoh_answer(bigint, text),
  public.hoh_ad(bigint), public.leaderboard(text), public.missed_connections()
  to authenticated;
revoke execute on function public.fan_out_flash_alerts(bigint), public.admin_grant(uuid, int, int, int)
  from public, anon, authenticated;
grant execute on function public.fan_out_flash_alerts(bigint), public.admin_grant(uuid, int, int, int) to service_role;

-- ──────────────────────────────────────────────────────────────── seed data

insert into public.reward_catalog (key, name, description, duration_label, duration, cost, icon, repeatable, flash, min_level, sort) values
  ('flash1', 'Flash Alert Token', 'One instant alert the moment a high-demand deal matching your search appears.', '1 TOKEN', null, 100, 'bolt', true, 1, null, 1),
  ('radius', '+50 KM Search Radius', 'Search beyond your 10 km radius — up to 60 km.', '24 HOURS', interval '24 hours', 250, 'radius', false, 0, null, 2),
  ('scan', 'Faster scanning', 'Listings scanned every 30 s instead of every 2 min.', '12 HOURS', interval '12 hours', 180, 'scan', false, 0, null, 3),
  ('flash3', 'Flash Alert Tokens ×3', 'Three instant, high-priority alerts for listings you care about.', '3 TOKENS', null, 250, 'bolt', true, 3, null, 4),
  ('hold5', 'Extra Hold Slots · +5', 'Save up to 15 listings in your Hold Pile.', '7 DAYS', interval '7 days', 300, 'hold', false, 0, null, 5),
  ('sniper', 'Sniper Boost', 'Temporary Sniper Mode — auto-alert the instant a listing under your target price goes live.', '1 HOUR', interval '1 hour', 500, 'target', false, 0, 13, 6),
  ('intel', 'Counter Intel', 'See how many other flippers are watching a listing.', '24 HOURS', interval '24 hours', 600, 'eye', false, 0, null, 7)
on conflict (key) do nothing;

insert into public.cosmetics (key, name, type, cost, min_level, sort) values
  ('midnight', 'Midnight Hustle Theme', 'APP THEME', 400, null, 1),
  ('retro', 'Retro Thrifter Theme', 'APP THEME', 400, null, 2),
  ('golden', 'Golden Era Border', 'AVATAR FRAME', 300, null, 3),
  ('despair', 'Sellers Despair Chat Bubble', 'CHAT BUBBLE', 150, null, 4),
  ('lowball', 'Lowball Legend Title', 'PROFILE TITLE', 200, null, 5),
  ('neon', 'Neon Flare Scraper Grid', 'SCANNER SKIN', 350, null, 6),
  ('paper', 'Vintage Paper Skin', 'CARD SKIN', 350, null, 7),
  ('popper', 'Profit Popper Animation', 'CELEBRATION', 250, null, 8),
  ('cyber', 'Cyber Broker Accent', 'UI ACCENT', 300, null, 9),
  ('elite', 'Elite Badge Indicator', 'BADGE', 0, 20, 10)
on conflict (key) do nothing;

insert into public.reward_wheel (idx, label, name, description, kind, weight, boost_key, boost_duration, boost_label, flash, cosmetic_key) values
  (0, '2× SCAN', 'Faster scanning · 6 hours', 'Listings are scanned every 30 s instead of every 2 min.', 'FUNCTIONAL', 22, 'scan', interval '6 hours', '6H', 0, null),
  (1, '+50 KM', '+50 KM search radius · 12 hours', 'Radius Breach is active — search up to 60 km.', 'FUNCTIONAL', 18, 'radius', interval '12 hours', '12H', 0, null),
  (2, '+2 FLASH', '2 Flash Alert Tokens', 'Added to your wallet — use them on any listing or search.', 'FUNCTIONAL', 20, null, null, null, 2, null),
  (3, 'SNIPER', 'Sniper Mode · 30 minutes', 'Instant auto-alerts on listings under your target price.', 'FUNCTIONAL', 5, 'sniper', interval '30 minutes', '30M', 0, null),
  (4, '+5 HOLD', 'Hold Pile +5 slots · 3 days', 'Your Hold Pile now holds 15 listings.', 'FUNCTIONAL', 15, 'hold5', interval '3 days', '3D', 0, null),
  (5, 'BUBBLE', 'Sellers Despair Chat Bubble', 'A chat flair for your Flip Tok comments.', 'COSMETIC', 10, null, null, null, 0, 'despair'),
  (6, 'THEME', 'Retro Thrifter Theme', 'A theme preview for your profile card.', 'COSMETIC', 6, null, null, null, 0, 'retro'),
  (7, 'ACCENT', 'Cyber Broker Accent', 'A UI accent for your profile and posts.', 'COSMETIC', 4, null, null, null, 0, 'cyber')
on conflict (idx) do nothing;

insert into public.hoh_cards (name, image_key, platform, condition, location, listed, demand, tone, price, resale, net_label, answer, reason) values
  ('Air Jordan 4 Retro ''Military Black'' · US 10', 'jordan', 'FB MARKETPLACE', 'Used 9/10', 'Parramatta · 4.2 km', '12M AGO', 'HIGH DEMAND · 31 SOLD / 30D', 'a', 190, 395, '+$148', 'hustle', 'Sub-$200 for a near-deadstock pair in a core size. 31 sold in the last 30 days at $380+.'),
  ('Dyson V11 Absolute · 2 batteries', 'dyson', 'GUMTREE', 'Used 7/10', 'Chatswood · 6.8 km', '34M AGO', 'SATURATED · 58 ACTIVE', 'neg', 310, 335, '-$22', 'hold', 'Only a $25 spread. After 12.9% fees and postage this loses money, and 58 others are listed.'),
  ('Pokémon 151 Booster Box · Sealed', 'pokemon', 'EBAY', 'Sealed', 'Newtown · ships', '3M AGO', 'RISING · +28% / 90D', 'a', 140, 299, '+$118', 'hustle', 'Sealed 151 is still climbing and this is 53% under recent comps. Seal photos check out.'),
  ('LEGO Hogwarts Castle 71043 · Built', 'lego', 'FB MARKETPLACE', 'Complete', 'Ryde · 11 km', '1H AGO', 'STEADY · 9 SOLD / 30D', 'gold', 340, 352, '-$38', 'hold', 'A built set with a $12 spread. It needs to be under $250 to clear fees and the drive.'),
  ('Nintendo Switch OLED · White', 'nswitch', 'GUMTREE', 'Used 9/10', 'Surry Hills · 1.9 km', '6M AGO', 'FAST MOVER · 2–3 DAYS', 'a', 220, 410, '+$146', 'hustle', 'Seller wants a quick sale. OLEDs clear in 2–3 days and this one is 1.9 km away.'),
  ('Apple AirPods Pro 2 · Sealed', 'airpods', 'FB MARKETPLACE', 'Sealed', 'Bondi · 4.4 km', '2M AGO', '3 RED FLAGS', 'neg', 90, 245, 'Likely fake', 'hold', 'Too good to be true: new account, stock photos and no serial number. Classic counterfeit pattern.');

insert into public.achievements (key, category, name, condition, target, xp, icon, lock_note, metric, sort) values
  ('fastest_finger', 'Sourcing & Speed', 'Fastest Finger', 'Message a seller within 60 seconds of a listing going live.', 1, 100, 'speed', null, null, 1),
  ('ghost_protocol', 'Sourcing & Speed', 'Ghost Protocol', 'Source 5 deals with Shadow Mode on.', 5, 150, 'ghost', null, null, 2),
  ('sleepwalking', 'Sourcing & Speed', 'Sleepwalking', 'Secure a deal between midnight and 5am.', 1, 100, 'moon', null, null, 3),
  ('early_bird', 'Sourcing & Speed', 'The Early Bird', 'Claim a Flash Alert deal before 7am.', 1, 100, 'bolt', null, 'flash_fired', 4),
  ('monopoly', 'Sourcing & Speed', 'Marketplace Monopoly', 'Source from 5 different platforms in one week.', 5, 200, 'bridge', null, null, 5),
  ('zero_friction', 'Sourcing & Speed', 'Zero Friction', 'Complete a flip with no price negotiation.', 1, 80, 'check', null, null, 6),
  ('sniper_clearance', 'Sourcing & Speed', 'Sniper Clearance', 'Land 10 deals using Sniper Mode.', 10, 300, 'target', 'Requires Sniper Mode', null, 7),
  ('night_watchman', 'Sourcing & Speed', 'Night Watchman', 'Keep Night Crawler alerts on for 7 nights.', 7, 200, 'moon', null, null, 8),
  ('speed_demon', 'Sourcing & Speed', 'Speed Demon', 'Answer 10 HUSTLE or HOLD rounds in under 3 seconds each.', 10, 150, 'speed', null, null, 9),
  ('grid_sweep', 'Sourcing & Speed', 'Grid Sweep', 'Scan every category in a single day.', 1, 120, 'scan', null, null, 10),
  ('golden_goose', 'Profit & Volume', 'The Golden Goose', 'Make $500+ profit on a single flip.', 1, 400, 'coin', null, 'best_flip_500', 11),
  ('garage_guru', 'Profit & Volume', 'Garage Sale Guru', 'Complete 10 flips sourced from garage sales.', 10, 200, 'hold', null, null, 12),
  ('mans_trash', 'Profit & Volume', 'One Man''s Trash', 'Flip a free listing for profit.', 1, 150, 'gift', null, null, 13),
  ('km_club', 'Profit & Volume', 'The Kilometre Club', 'Travel 1,000 km in total to source deals.', 1000, 250, 'radius', null, null, 14),
  ('wheel_deal', 'Profit & Volume', 'Wheel & Deal', 'Land 25 successful negotiated offers.', 25, 200, 'script', null, null, 15),
  ('arbitrage', 'Profit & Volume', 'Arbitrage Architect', 'Buy on one platform and sell on another 10 times.', 10, 250, 'bridge', null, null, 16),
  ('centurion', 'Profit & Volume', 'Centurion Scurry', 'Complete 100 flips.', 100, 500, 'boxes', null, 'flips', 17),
  ('grandmaster', 'Profit & Volume', 'Grandmaster Flipper', 'Reach $10,000 lifetime profit.', 10000, 1000, 'trophy', null, 'lifetime_profit', 18),
  ('bale_out', 'Profit & Volume', 'Bale Out', 'Flip a bulk lot of 20+ items.', 1, 250, 'boxes', null, null, 19),
  ('penny_pincher', 'Profit & Volume', 'Penny Pincher', 'Buy 10 items under $10 and resell them.', 10, 120, 'coin', null, null, 20),
  ('local_legend', 'Community & Elite', 'Local Legend', 'Hold #1 on your regional leaderboard for a week.', 1, 500, 'podium', null, null, 21),
  ('scam_sniper', 'Community & Elite', 'Scam Sniper', 'Report 5 listings that are verified as scams.', 5, 200, 'shield', null, null, 22),
  ('oracle', 'Community & Elite', 'The Oracle', 'Make 50 correct HUSTLE or HOLD calls.', 50, 150, 'eye', null, 'hoh_correct', 23),
  ('syndicate_don', 'Community & Elite', 'Syndicate Don', 'Lead a guild of 10+ members.', 10, 400, 'people', 'Unlocks at Level 20', null, 24),
  ('vouch_king', 'Community & Elite', 'Vouch King', 'Receive 25 vouches from other flippers.', 25, 250, 'check', null, null, 25),
  ('whistleblower', 'Community & Elite', 'Whistleblower', 'Be first to flag a scam that gets removed.', 1, 150, 'alert', null, null, 26),
  ('market_sage', 'Community & Elite', 'Market Sage', 'Post 10 Flip Tok breakdowns with 100+ likes.', 10, 300, 'trophy', null, null, 27),
  ('guild_vanguard', 'Community & Elite', 'Guild Vanguard', 'Be your guild''s top contributor for a month.', 1, 300, 'people', 'Join a guild first', null, 28),
  ('arcade_patron', 'Community & Elite', 'Patron of the Arcade', 'Play in the Arcade 30 days in a row.', 30, 400, 'spin', null, 'streak', 29),
  ('flawless', 'Community & Elite', 'Flawless Record', 'Complete 50 flips with zero disputes.', 50, 400, 'shield', null, null, 30)
on conflict (key) do nothing;
