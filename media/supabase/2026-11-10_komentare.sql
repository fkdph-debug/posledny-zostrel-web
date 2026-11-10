-- Migrácia: komentáre k udalostiam a súborom. Spusti raz v Supabase → SQL Editor.
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid references public.events(id) on delete cascade,
  asset_id   uuid references public.assets(id) on delete cascade,
  body       text not null,
  author     text,                       -- prihlasovacie meno, napr. FRK
  created_at timestamptz not null default now(),
  check (event_id is not null or asset_id is not null)
);
create index if not exists comments_event_idx on public.comments(event_id, created_at);
create index if not exists comments_asset_idx on public.comments(asset_id, created_at);
alter table public.comments enable row level security;
drop policy if exists "auth all comments" on public.comments;
create policy "auth all comments" on public.comments
  for all to authenticated using (true) with check (true);
