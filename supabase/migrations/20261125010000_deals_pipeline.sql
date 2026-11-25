-- Deals pipeline: what to search for, a queue of raw listings, cached resale
-- prices, a run log, and per-user listing analyses (Lane C).
--
-- Only the edge functions (service role) touch the pipeline tables; RLS is on
-- with no client policies. Schedules live in supabase/cron.sql because they
-- need this project's URL and a secret.

-- One row per listing per marketplace, so the scorer can upsert deals.
drop index if exists public.deals_marketplace_external_id;
alter table public.deals
  add constraint deals_marketplace_external_id_key unique (marketplace, external_id);

-- ─────────────────────────────────────────────────────────── search terms

create table public.search_terms (
  id           bigint generated always as identity primary key,
  query        text not null,
  category     text not null,
  marketplace  text not null default 'eBay',
  min_price    numeric(10, 2) not null default 20,
  max_price    numeric(10, 2) not null default 1000,
  enabled      boolean not null default true,
  last_run_at  timestamptz,
  created_at   timestamptz not null default now(),
  unique (marketplace, query)
);

-- ───────────────────────────────────────────────────── raw listing queue

create table public.raw_listings (
  id              bigint generated always as identity primary key,
  marketplace     text not null,
  external_id     text not null,
  title           text not null,
  price           numeric(10, 2) not null,
  shipping        numeric(10, 2),
  currency        text not null default 'USD',
  condition       text,
  image_url       text,
  image_key       text,
  listing_url     text not null,
  location        text,
  category        text,
  search_term_id  bigint references public.search_terms on delete set null,
  query           text,
  listed_at       timestamptz,
  status          text not null default 'pending'
                  check (status in ('pending', 'processing', 'scored', 'rejected', 'error')),
  reject_reason   text,
  attempts        int not null default 0,
  collected_at    timestamptz not null default now(),
  claimed_at      timestamptz,
  processed_at    timestamptz,
  unique (marketplace, external_id)
);

create index raw_listings_queue on public.raw_listings (status, collected_at);

-- ──────────────────────────────────────────────────── resale price cache

create table public.market_prices (
  key          text primary key,
  resale       numeric(10, 2) not null,
  sample_size  int not null default 0,
  source       text not null,
  checked_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────── run log

create table public.pipeline_runs (
  id           bigint generated always as identity primary key,
  job          text not null,
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  collected    int not null default 0,
  scored       int not null default 0,
  rejected     int not null default 0,
  errors       int not null default 0,
  note         text
);

-- ───────────────────────────────────────── analyses users run themselves

create table public.listing_analyses (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  input       jsonb not null,
  result      jsonb not null,
  created_at  timestamptz not null default now()
);

create index listing_analyses_user on public.listing_analyses (user_id, created_at desc);

alter table public.search_terms     enable row level security;
alter table public.raw_listings     enable row level security;
alter table public.market_prices    enable row level security;
alter table public.pipeline_runs    enable row level security;
alter table public.listing_analyses enable row level security;

create policy "analyses: read own" on public.listing_analyses
  for select to authenticated using (auth.uid() = user_id);

revoke all on public.search_terms, public.raw_listings, public.market_prices, public.pipeline_runs,
  public.listing_analyses from anon, authenticated;
grant select on public.listing_analyses to authenticated;

-- ─────────────────────────────────────────────────────── queue functions

-- Hands the scorer a batch of listings, skipping rows another run holds.
-- Rows stuck in `processing` for 10 minutes go back in the queue (3 tries max).
create function public.claim_listings(p_limit int) returns setof public.raw_listings
language sql security definer set search_path = public as $$
  update public.raw_listings r
     set status = 'processing', claimed_at = now(), attempts = r.attempts + 1
   where r.id in (
     select id from public.raw_listings
      where (status = 'pending')
         or (status = 'processing' and claimed_at < now() - interval '10 minutes' and attempts < 3)
      order by collected_at
      limit p_limit
      for update skip locked
   )
  returning r.*;
$$;

-- Hides deals whose listing is past its expiry or has not been re-checked in 3 days.
create function public.expire_deals() returns int
language sql security definer set search_path = public as $$
  with gone as (
    update public.deals set is_active = false
     where is_active
       and external_id is not null
       and (expires_at < now() or price_checked_at < now() - interval '3 days')
    returning 1
  )
  select count(*)::int from gone;
$$;

revoke execute on function public.claim_listings(int), public.expire_deals() from public, anon, authenticated;
grant execute on function public.claim_listings(int), public.expire_deals() to service_role;

-- ───────────────────────────────────────────────────── starter searches

insert into public.search_terms (query, category, min_price, max_price) values
  ('Air Jordan 4 Retro', 'Sneakers', 80, 600),
  ('Nike Dunk Low', 'Sneakers', 50, 400),
  ('Pokemon 151 booster box', 'Collectibles', 80, 500),
  ('Nintendo Switch OLED', 'Electronics', 150, 450),
  ('Apple AirPods Pro 2', 'Electronics', 80, 300),
  ('Dyson V11', 'Home', 120, 500),
  ('LEGO Star Wars UCS', 'Toys', 100, 900),
  ('Sony WH-1000XM5', 'Electronics', 120, 400)
on conflict do nothing;
