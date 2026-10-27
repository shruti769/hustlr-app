-- HUSTLR content seed — safe to run any number of times.
--
-- Refills the shared tables (deals, Flip Tok posts, leaderboard, trends,
-- store, this week's Price It Right item) only where they are empty, and gives
-- a starter watchlist to anyone who signed up while there were no deals.
-- Run in the Supabase SQL Editor, or `supabase db reset` locally.

do $$
begin
  if not exists (select 1 from public.deals) then
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
  end if;
end $$;

do $$
begin
  if not exists (select 1 from public.flips) then
    insert into public.flips (author_name, handle, initials, bought, sold, copy, image_key, likes, shares) values
      ('Marcus R.', '@stackking',     'MR', 200, 410, 'Picked these up local, sold same week. Clean 105% flip. AI flagged it before the listing hit the feeds.', 'flip1',   1200, 86),
      ('Priya N.',  '@flipqueen',     'PN', 240, 335, 'Cordless vacuums never sit. Two days on Gumtree and gone.',                                              'dyson',   870,  41),
      ('Deon W.',   '@thedealhunter', 'DW', 159, 299, 'Sealed boxes only. Score was 9.1 so I bought three.',                                                     'pokemon', 2400, 155),
      ('Sam K.',    '@sourceandsell', 'SK', 280, 352, 'Retired LEGO sets are slow but safe. Every single time.',                                                 'lego',    640,  28);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from public.leaderboard_entries) then
    insert into public.leaderboard_entries (initials, name, handle, profit, streak_days) values
      ('DW', 'Deon W.',   '@thedealhunter', 18420, 23),
      ('PN', 'Priya N.',  '@flipqueen',     16890, 17),
      ('MR', 'Marcus R.', '@stackking',     15240, 11),
      ('SK', 'Sam K.',    '@sourceandsell', 11200, 9),
      ('AB', 'Aisha B.',  '@resellraja',    9870,  6),
      ('TM', 'Tyler M.',  '@flipfast',      8240,  5);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from public.market_trends) then
    insert into public.market_trends (name, watching, change_pct, spark, sort) values
      ('Sneakers',      '4.2k watching', 12.4, 'M0 22 L15 18 L30 20 L45 12 L60 9 L76 4',   1),
      ('Trading Cards', '6.8k watching', 28.1, 'M0 25 L15 22 L30 15 L45 14 L60 8 L76 2',   2),
      ('Electronics',   '9.1k watching', -4.2, 'M0 8 L15 11 L30 10 L45 16 L60 15 L76 21',  3),
      ('LEGO Sets',     '2.1k watching',  9.8, 'M0 21 L15 19 L30 17 L45 14 L60 12 L76 7',  4),
      ('Vintage Tees',  '1.4k watching',  6.3, 'M0 20 L15 21 L30 16 L45 17 L60 12 L76 10', 5),
      ('Power Tools',   '3.0k watching', -2.1, 'M0 12 L15 10 L30 14 L45 13 L60 17 L76 18', 6);
  end if;
end $$;

insert into public.store_items (key, group_label, name, description, cost, sort) values
  ('early', 'POWERUPS', 'Early deal alerts · 15 min', 'See new high-score deals 15 minutes before free users.', 500, 1),
  ('scan',  'POWERUPS', 'Scan burst · 25 extra',      '25 extra AI listing scans, valid 24 hours.',            250, 2),
  ('risk',  'POWERUPS', 'Deep scam check ×5',         'Five full authenticity reports on watched listings.',   300, 3),
  ('b1',    'BADGES',   'Verified Flipper',           'Permanent badge on your Flip Tok posts.',               400, 4),
  ('b2',    'BADGES',   'Appraiser',                  'Awarded for three Price It Right wins.',                600, 5),
  ('t1',    'THEMES',   'Graphite theme',             'Neutral monochrome interface.',                         350, 6),
  ('t2',    'THEMES',   'Slate theme',                'Cool blue-grey interface.',                             350, 7)
on conflict (key) do nothing;

insert into public.weekly_puzzles (week_start, name, meta, image_key, actual_price, closes_at) values
  (date_trunc('week', current_date)::date,
   'Pokémon 151 Booster Box · Sealed', 'THRIFTED · $40 PAID · CONDITION 9/10', 'puzzle', 299,
   date_trunc('week', current_date) + interval '7 days')
on conflict (week_start) do nothing;

-- Starter watchlist for accounts created while the deals table was empty.
insert into public.watchlist (user_id, deal_id)
select p.id, d.id
from public.profiles p
cross join lateral (select id from public.deals where is_active order by id limit 4) d
where not exists (select 1 from public.watchlist w where w.user_id = p.id)
on conflict do nothing;
