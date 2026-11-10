-- Migrácia: súbory môžu byť aj odkazy (OneDrive) – originál ostáva na OneDrive,
-- v Storage je len náhľad. Spusti raz v Supabase → SQL Editor. Spustené 10. 11. 2026.
alter table public.assets alter column path drop not null;
alter table public.assets add column if not exists external_url text;
alter table public.assets drop constraint if exists assets_source_check;
alter table public.assets add constraint assets_source_check
  check (path is not null or external_url is not null);
