-- Blueprint alignment, part 1: deal cards, inventory flipping, photo storage.
--
--  · deals get the blueprint's STEAL / CAUTION / RISK badge (replacing the
--    prototype's Low / Med / High risk), the marketplace they live on, a link
--    out to the original listing, and the fields the deals pipeline fills in.
--  · inventory items can be marked sold at a real price, and carry a photo.
--  · a private storage bucket holds those photos, one folder per user.

-- ─────────────────────────────────────────────────────────────────── deals

alter table public.deals
  add column badge             text not null default 'CAUTION',
  add column marketplace       text not null default 'eBay',
  add column listing_url       text,
  add column external_id       text,
  add column est_fees          numeric(10, 2),
  add column est_shipping      numeric(10, 2),
  add column reason            text,
  add column price_checked_at  timestamptz not null default now(),
  add column expires_at        timestamptz;

update public.deals
   set badge = case risk when 'Low' then 'STEAL' when 'Med' then 'CAUTION' else 'RISK' end;

alter table public.deals
  add constraint deals_badge_check check (badge in ('STEAL', 'CAUTION', 'RISK')),
  drop column risk;

-- One row per listing per marketplace, so the pipeline can upsert.
create unique index deals_marketplace_external_id on public.deals (marketplace, external_id)
  where external_id is not null;
create index deals_feed on public.deals (is_active, score desc);

-- ─────────────────────────────────────────────────────────────── inventory

alter table public.inventory_items
  add column sold_price  numeric(10, 2),
  add column photo_path  text,
  add column notes       text not null default '';

-- Keep sold_at / sold_price consistent with the status.
create function public._inventory_status() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.status = 'Sold' then
    new.sold_at    := coalesce(new.sold_at, now());
    new.sold_price := coalesce(new.sold_price, new.list_price);
  else
    new.sold_at    := null;
    new.sold_price := null;
  end if;
  return new;
end $$;

create trigger inventory_status
  before insert or update of status, sold_price on public.inventory_items
  for each row execute function public._inventory_status();

-- ─────────────────────────────────────────────────────────── photo storage

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('inventory-photos', 'inventory-photos', false, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

-- Files live under `<user id>/…`; each user can only touch their own folder.
create policy "inventory photos: read own" on storage.objects
  for select to authenticated
  using (bucket_id = 'inventory-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "inventory photos: upload own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'inventory-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "inventory photos: update own" on storage.objects
  for update to authenticated
  using (bucket_id = 'inventory-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "inventory photos: delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'inventory-photos' and (storage.foldername(name))[1] = auth.uid()::text);
