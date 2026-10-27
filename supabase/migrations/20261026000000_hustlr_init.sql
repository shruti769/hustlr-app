-- HUSTLR — initial schema.
--
-- Run with `supabase db push`, or paste into the Supabase SQL Editor.
--
-- Everything that moves credits, spins or Pawn Empire cash goes through a
-- SECURITY DEFINER function, so a client can never write those columns
-- directly — it can only ask the server to apply a game rule.

-- ─────────────────────────────────────────────────────────────── profiles

create table public.profiles (
  id              uuid primary key references auth.users on delete cascade,
  full_name       text not null default '',
  handle          text,
  region          text not null default 'Sydney, AU',
  plan            text not null default 'scout' check (plan in ('scout', 'hustler', 'mogul')),
  credits         int  not null default 340 check (credits >= 0),
  streak          int  not null default 0,
  last_check_in   date,
  spins_left      int  not null default 3 check (spins_left >= 0),
  spins_day       date not null default current_date,
  pawn_cash       int  not null default 210 check (pawn_cash >= 0),
  pawn_levels     jsonb not null default '{"polish": 1, "case": 1, "staff": 0, "neon": 0}',
  pawn_synced_at  timestamptz not null default now(),
  owned           text[] not null default '{}',
  created_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Only the descriptive columns are client-editable; game columns are not.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, handle, region) on public.profiles to authenticated;

-- ─────────────────────────────────────────────────────────── reference data

create table public.deals (
  id            bigint generated always as identity primary key,
  name          text not null,
  source        text not null,
  category      text not null,
  buy_price     numeric(10, 2) not null,
  resale_price  numeric(10, 2) not null,
  score         numeric(3, 1) not null,
  risk          text not null check (risk in ('Low', 'Med', 'High')),
  image_key     text,
  image_url     text,
  verdict       jsonb not null default '[]',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table public.flips (
  id           bigint generated always as identity primary key,
  author_name  text not null,
  handle       text not null,
  initials     text not null,
  bought       numeric(10, 2) not null,
  sold         numeric(10, 2) not null,
  copy         text not null,
  image_key    text,
  image_url    text,
  likes        int not null default 0,
  shares       int not null default 0,
  created_at   timestamptz not null default now()
);

create table public.leaderboard_entries (
  id           bigint generated always as identity primary key,
  initials     text not null,
  name         text not null,
  handle       text not null,
  profit       numeric(12, 2) not null,
  streak_days  int not null default 0
);

create table public.market_trends (
  id          bigint generated always as identity primary key,
  name        text not null,
  watching    text not null,
  change_pct  numeric(5, 1) not null,
  spark       text not null,
  sort        int not null default 0
);

create table public.store_items (
  key          text primary key,
  group_label  text not null,
  name         text not null,
  description  text not null,
  cost         int not null check (cost > 0),
  sort         int not null default 0
);

alter table public.deals               enable row level security;
alter table public.flips               enable row level security;
alter table public.leaderboard_entries enable row level security;
alter table public.market_trends       enable row level security;
alter table public.store_items         enable row level security;

create policy "deals: signed-in read"   on public.deals               for select to authenticated using (is_active);
create policy "flips: signed-in read"   on public.flips               for select to authenticated using (true);
create policy "board: signed-in read"   on public.leaderboard_entries for select to authenticated using (true);
create policy "trends: signed-in read"  on public.market_trends       for select to authenticated using (true);
create policy "store: signed-in read"   on public.store_items         for select to authenticated using (true);

-- ───────────────────────────────────────────────────────────── user data

create table public.watchlist (
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  deal_id     bigint not null references public.deals on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, deal_id)
);

create table public.inventory_items (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  deal_id     bigint references public.deals on delete set null,
  name        text not null,
  sku         text not null,
  category    text not null default '',
  condition   text not null default '',
  size_spec   text not null default '',
  buy_price   numeric(10, 2) not null default 0,
  list_price  numeric(10, 2) not null default 0,
  status      text not null default 'Listed' check (status in ('Sourcing', 'Listed', 'Sold')),
  platforms   text[] not null default '{}',
  image_key   text,
  image_url   text,
  sold_at     timestamptz,
  created_at  timestamptz not null default now()
);

create table public.tracked_items (
  id            bigint generated always as identity primary key,
  user_id       uuid not null default auth.uid() references auth.users on delete cascade,
  name          text not null,
  now_price     numeric(10, 2) not null,
  target_price  numeric(10, 2) not null,
  change_pct    numeric(5, 1) not null default 0,
  created_at    timestamptz not null default now()
);

create table public.notifications (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users on delete cascade,
  title       text not null,
  body        text not null,
  image_key   text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.watchlist       enable row level security;
alter table public.inventory_items enable row level security;
alter table public.tracked_items   enable row level security;
alter table public.notifications   enable row level security;

create policy "watchlist: own" on public.watchlist
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "inventory: own" on public.inventory_items
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tracked: own" on public.tracked_items
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notifications: read own" on public.notifications
  for select to authenticated using (auth.uid() = user_id);
create policy "notifications: update own" on public.notifications
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notifications: delete own" on public.notifications
  for delete to authenticated using (auth.uid() = user_id);

create index on public.inventory_items (user_id, created_at desc);
create index on public.tracked_items (user_id);
create index on public.notifications (user_id, created_at desc);

-- ──────────────────────────────────────────────────────────── arcade data

create table public.weekly_puzzles (
  id            bigint generated always as identity primary key,
  week_start    date not null unique,
  name          text not null,
  meta          text not null,
  image_key     text,
  image_url     text,
  actual_price  int not null,
  closes_at     timestamptz not null
);

create table public.puzzle_guesses (
  user_id     uuid not null references auth.users on delete cascade,
  puzzle_id   bigint not null references public.weekly_puzzles on delete cascade,
  guess       int not null,
  reward      int not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, puzzle_id)
);

-- Cash wins from Prize Spin, for an admin to pay out.
create table public.prize_wins (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users on delete cascade,
  amount_aud  int not null,
  paid        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- No client policies: the answer price stays server-side and these are only
-- touched through the functions below.
alter table public.weekly_puzzles enable row level security;
alter table public.puzzle_guesses enable row level security;
alter table public.prize_wins     enable row level security;
create policy "prize wins: read own" on public.prize_wins
  for select to authenticated using (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────── table access
--
-- Explicit grants, so the schema works whether or not the project
-- "automatically exposes new tables". RLS above still decides which rows.

grant usage on schema public to anon, authenticated;
revoke all on public.deals, public.flips, public.leaderboard_entries, public.market_trends, public.store_items,
  public.watchlist, public.inventory_items, public.tracked_items, public.notifications,
  public.weekly_puzzles, public.puzzle_guesses, public.prize_wins
  from anon, authenticated;
grant select on public.deals, public.flips, public.leaderboard_entries, public.market_trends, public.store_items
  to authenticated;
grant select, insert, update, delete on public.watchlist, public.inventory_items, public.tracked_items
  to authenticated;
grant select, update, delete on public.notifications to authenticated;
grant select on public.prize_wins to authenticated;

-- ─────────────────────────────────────────────────────────── game rules

create function public._pawn_rate(levels jsonb) returns int
language sql immutable as $$
  select 3 * coalesce((levels ->> 'case')::int, 0)
       + 8 * coalesce((levels ->> 'staff')::int, 0)
       + 2 * coalesce((levels ->> 'neon')::int, 0)
$$;

create function public._pawn_click(levels jsonb) returns int
language sql immutable as $$
  select 1 + 2 * coalesce((levels ->> 'polish')::int, 0)
           + 1 * coalesce((levels ->> 'neon')::int, 0)
$$;

-- Locks the caller's profile row and applies the daily spin reset.
create function public._my_profile() returns public.profiles
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
  return p;
end $$;

create function public.arcade_state() returns public.profiles
language plpgsql security definer set search_path = public as $$
begin
  return public._my_profile();
end $$;

create function public.check_in() returns public.profiles
language plpgsql security definer set search_path = public as $$
declare
  p public.profiles := public._my_profile();
begin
  if p.last_check_in = current_date then
    return p;
  end if;
  update public.profiles
     set streak        = case when p.last_check_in = current_date - 1 then p.streak + 1 else 1 end,
         last_check_in = current_date,
         credits       = credits + 10,
         spins_left    = spins_left + 1
   where id = p.id
  returning * into p;
  return p;
end $$;

create function public.spin_wheel() returns json
language plpgsql security definer set search_path = public as $$
declare
  p       public.profiles := public._my_profile();
  weights int[] := array[300, 260, 200, 120, 70, 32, 8, 1];
  payout  int[] := array[1, 5, 10, 20, 50, 150, 300, 0];
  roll    numeric := random() * 991;
  idx     int := 1;
begin
  if p.spins_left < 1 then
    raise exception 'no spins left today';
  end if;
  for i in 1..8 loop
    roll := roll - weights[i];
    if roll <= 0 then
      idx := i;
      exit;
    end if;
  end loop;
  update public.profiles
     set spins_left = spins_left - 1,
         credits    = credits + payout[idx]
   where id = p.id
  returning * into p;
  if idx = 8 then
    insert into public.prize_wins (user_id, amount_aud) values (p.id, 100);
    insert into public.notifications (user_id, title, body, image_key)
    values (p.id, 'You won $100 AUD', 'Verified winner — paid to your account within 24h.', 'pokemon');
  end if;
  return json_build_object('index', idx - 1, 'profile', row_to_json(p));
end $$;

create function public.current_puzzle() returns json
language plpgsql security definer set search_path = public as $$
declare
  z public.weekly_puzzles;
  g public.puzzle_guesses;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  select * into z from public.weekly_puzzles
   where week_start <= current_date order by week_start desc limit 1;
  if not found then
    return null;
  end if;
  select * into g from public.puzzle_guesses where user_id = auth.uid() and puzzle_id = z.id;
  return json_build_object(
    'id', z.id, 'name', z.name, 'meta', z.meta,
    'image_key', z.image_key, 'image_url', z.image_url, 'closes_at', z.closes_at,
    'guess', g.guess, 'reward', g.reward,
    'actual', case when g.user_id is not null then z.actual_price end
  );
end $$;

create function public.submit_guess(p_guess int) returns json
language plpgsql security definer set search_path = public as $$
declare
  p      public.profiles := public._my_profile();
  z      public.weekly_puzzles;
  diff   int;
  reward int;
begin
  if p_guess < 20 or p_guess > 600 then
    raise exception 'guess out of range';
  end if;
  select * into z from public.weekly_puzzles
   where week_start <= current_date order by week_start desc limit 1;
  if not found then
    raise exception 'no puzzle this week';
  end if;
  if now() > z.closes_at then
    raise exception 'this week has closed';
  end if;
  if exists (select 1 from public.puzzle_guesses where user_id = p.id and puzzle_id = z.id) then
    raise exception 'already locked in';
  end if;
  diff   := abs(p_guess - z.actual_price);
  reward := case when diff <= 5 then 100 when diff <= 20 then 40 when diff <= 50 then 10 else 0 end;
  insert into public.puzzle_guesses (user_id, puzzle_id, guess, reward) values (p.id, z.id, p_guess, reward);
  update public.profiles set credits = credits + reward where id = p.id returning * into p;
  return json_build_object('reward', reward, 'actual', z.actual_price, 'guess', p_guess, 'profile', row_to_json(p));
end $$;

create function public.buy_store_item(p_key text) returns public.profiles
language plpgsql security definer set search_path = public as $$
declare
  p    public.profiles := public._my_profile();
  item public.store_items;
begin
  select * into item from public.store_items where key = p_key;
  if not found then
    raise exception 'unknown item';
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

-- Pawn Empire earns on the client; the server accepts at most what the shop
-- could plausibly have made since the last sync (passive rate plus ~12 taps a
-- second), over a window of at most a minute.
create function public.pawn_sync(p_earned int) returns public.profiles
language plpgsql security definer set search_path = public as $$
declare
  p       public.profiles := public._my_profile();
  elapsed numeric := least(60, greatest(0, extract(epoch from now() - p.pawn_synced_at)));
  cap     int := ceil(elapsed * (public._pawn_rate(p.pawn_levels) + 12 * public._pawn_click(p.pawn_levels)));
begin
  update public.profiles
     set pawn_cash      = pawn_cash + least(greatest(p_earned, 0), cap),
         pawn_synced_at = now()
   where id = p.id
  returning * into p;
  return p;
end $$;

create function public.buy_upgrade(p_key text) returns public.profiles
language plpgsql security definer set search_path = public as $$
declare
  p     public.profiles := public._my_profile();
  base  int := case p_key when 'polish' then 60 when 'case' then 140 when 'staff' then 420 when 'neon' then 900 end;
  level int;
  cost  int;
begin
  if base is null then
    raise exception 'unknown upgrade';
  end if;
  level := coalesce((p.pawn_levels ->> p_key)::int, 0);
  cost  := round(base * power(1.6, level));
  if p.pawn_cash < cost then
    raise exception 'not enough cash';
  end if;
  update public.profiles
     set pawn_cash   = pawn_cash - cost,
         pawn_levels = jsonb_set(pawn_levels, array[p_key], to_jsonb(level + 1))
   where id = p.id
  returning * into p;
  return p;
end $$;

create function public.pawn_cash_out() returns public.profiles
language plpgsql security definer set search_path = public as $$
declare
  p public.profiles := public._my_profile();
begin
  if p.pawn_cash < 1000 then
    raise exception 'need $1,000 to cash out';
  end if;
  update public.profiles
     set pawn_cash = pawn_cash - 1000,
         credits   = credits + 100
   where id = p.id
  returning * into p;
  return p;
end $$;

revoke execute on function public._pawn_rate(jsonb), public._pawn_click(jsonb), public._my_profile() from public, anon, authenticated;
revoke execute on function
  public.arcade_state(), public.check_in(), public.spin_wheel(), public.current_puzzle(),
  public.submit_guess(int), public.buy_store_item(text), public.pawn_sync(int),
  public.buy_upgrade(text), public.pawn_cash_out()
  from public, anon;
grant execute on function
  public.arcade_state(), public.check_in(), public.spin_wheel(), public.current_puzzle(),
  public.submit_guess(int), public.buy_store_item(text), public.pawn_sync(int),
  public.buy_upgrade(text), public.pawn_cash_out()
  to authenticated;

-- ─────────────────────────────────────────────────────── new-user setup

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, handle)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    '@' || split_part(new.email, '@', 1)
  );

  -- Starter watchlist and price alerts so the tools are not empty on day one.
  insert into public.watchlist (user_id, deal_id)
  select new.id, d.id from public.deals d where d.is_active order by d.id limit 4;

  insert into public.tracked_items (user_id, name, now_price, target_price, change_pct) values
    (new.id, 'Air Jordan 4 Retro', 410, 380, 3.2),
    (new.id, 'Pokémon 151 Box', 299, 250, 8.4),
    (new.id, 'Dyson V11', 335, 350, -2.1),
    (new.id, 'Switch OLED', 410, 400, -1.4);

  insert into public.notifications (user_id, title, body, image_key) values
    (new.id, 'Welcome to HUSTLR', 'Your first deals are ready. Open Hot Deals to start stacking.', 'jordan'),
    (new.id, 'New high-score deal found', 'Pokémon 151 Box · Score 9.1 · +$140 profit', 'pokemon');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────────────────────────────────────────── seed data

insert into public.deals (name, source, category, buy_price, resale_price, score, risk, image_key, verdict) values
  ('Air Jordan 4 Retro',   'FB MARKETPLACE · 2.1KM', 'Sneakers',     200, 410, 8.7, 'Low',  'jordan',
   '[{"ok":true,"text":"High demand — 42 recent sales"},{"ok":true,"text":"Priced 38% below market"},{"ok":false,"text":"Request box & receipt photos"},{"ok":true,"text":"Recent comparable sales"}]'),
  ('Dyson V11 Absolute',   'GUMTREE · 5.4KM',        'Home',         240, 335, 7.9, 'Low',  'dyson',
   '[{"ok":true,"text":"Cordless vacuums sell within days"},{"ok":true,"text":"Priced 28% below market"},{"ok":false,"text":"Test battery runtime before paying"},{"ok":true,"text":"Recent comparable sales"}]'),
  ('Pokémon 151 Box',      'EBAY · ONLINE',          'Collectibles', 159, 299, 9.1, 'Med',  'pokemon',
   '[{"ok":true,"text":"Sealed product — 61 recent sales"},{"ok":true,"text":"Priced 47% below market"},{"ok":false,"text":"Check shrink wrap for resealing"},{"ok":true,"text":"Recent comparable sales"}]'),
  ('LEGO Hogwarts Castle', 'FB MARKETPLACE · 8.0KM', 'Toys',         280, 352, 7.2, 'Low',  'lego',
   '[{"ok":true,"text":"Retired set — steady demand"},{"ok":true,"text":"Priced 20% below market"},{"ok":false,"text":"Confirm all bags are sealed"},{"ok":true,"text":"Recent comparable sales"}]'),
  ('Nintendo Switch OLED', 'GUMTREE · 3.3KM',        'Electronics',  320, 410, 6.8, 'Med',  'nswitch',
   '[{"ok":true,"text":"Consoles move fast"},{"ok":true,"text":"Priced 22% below market"},{"ok":false,"text":"Check for Joy-Con drift"},{"ok":true,"text":"Recent comparable sales"}]'),
  ('Apple AirPods Pro 2',  'FB MARKETPLACE · 1.2KM', 'Electronics',  180, 245, 5.4, 'High', null,
   '[{"ok":true,"text":"High demand item"},{"ok":false,"text":"Counterfeits are common — verify serial"},{"ok":false,"text":"Ask for the original receipt"},{"ok":true,"text":"Recent comparable sales"}]');

insert into public.flips (author_name, handle, initials, bought, sold, copy, image_key, likes, shares) values
  ('Marcus R.', '@stackking',     'MR', 200, 410, 'Picked these up local, sold same week. Clean 105% flip. AI flagged it before the listing hit the feeds.', 'flip1',   1200, 86),
  ('Priya N.',  '@flipqueen',     'PN', 240, 335, 'Cordless vacuums never sit. Two days on Gumtree and gone.',                                              'dyson',   870,  41),
  ('Deon W.',   '@thedealhunter', 'DW', 159, 299, 'Sealed boxes only. Score was 9.1 so I bought three.',                                                     'pokemon', 2400, 155),
  ('Sam K.',    '@sourceandsell', 'SK', 280, 352, 'Retired LEGO sets are slow but safe. Every single time.',                                                 'lego',    640,  28);

insert into public.leaderboard_entries (initials, name, handle, profit, streak_days) values
  ('DW', 'Deon W.',   '@thedealhunter', 18420, 23),
  ('PN', 'Priya N.',  '@flipqueen',     16890, 17),
  ('MR', 'Marcus R.', '@stackking',     15240, 11),
  ('SK', 'Sam K.',    '@sourceandsell', 11200, 9),
  ('AB', 'Aisha B.',  '@resellraja',    9870,  6),
  ('TM', 'Tyler M.',  '@flipfast',      8240,  5);

insert into public.market_trends (name, watching, change_pct, spark, sort) values
  ('Sneakers',      '4.2k watching', 12.4, 'M0 22 L15 18 L30 20 L45 12 L60 9 L76 4',   1),
  ('Trading Cards', '6.8k watching', 28.1, 'M0 25 L15 22 L30 15 L45 14 L60 8 L76 2',   2),
  ('Electronics',   '9.1k watching', -4.2, 'M0 8 L15 11 L30 10 L45 16 L60 15 L76 21',  3),
  ('LEGO Sets',     '2.1k watching',  9.8, 'M0 21 L15 19 L30 17 L45 14 L60 12 L76 7',  4),
  ('Vintage Tees',  '1.4k watching',  6.3, 'M0 20 L15 21 L30 16 L45 17 L60 12 L76 10', 5),
  ('Power Tools',   '3.0k watching', -2.1, 'M0 12 L15 10 L30 14 L45 13 L60 17 L76 18', 6);

insert into public.store_items (key, group_label, name, description, cost, sort) values
  ('early', 'POWERUPS', 'Early deal alerts · 15 min', 'See new high-score deals 15 minutes before free users.', 500, 1),
  ('scan',  'POWERUPS', 'Scan burst · 25 extra',      '25 extra AI listing scans, valid 24 hours.',            250, 2),
  ('risk',  'POWERUPS', 'Deep scam check ×5',         'Five full authenticity reports on watched listings.',   300, 3),
  ('b1',    'BADGES',   'Verified Flipper',           'Permanent badge on your Flip Tok posts.',               400, 4),
  ('b2',    'BADGES',   'Appraiser',                  'Awarded for three Price It Right wins.',                600, 5),
  ('t1',    'THEMES',   'Graphite theme',             'Neutral monochrome interface.',                         350, 6),
  ('t2',    'THEMES',   'Slate theme',                'Cool blue-grey interface.',                             350, 7);

insert into public.weekly_puzzles (week_start, name, meta, image_key, actual_price, closes_at) values
  (date_trunc('week', current_date)::date,
   'Pokémon 151 Booster Box · Sealed', 'THRIFTED · $40 PAID · CONDITION 9/10', 'puzzle', 299,
   date_trunc('week', current_date) + interval '7 days');
