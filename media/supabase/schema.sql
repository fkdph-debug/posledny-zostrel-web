-- media.poslednyzostrel.sk — schéma databázy
-- Spusti celý súbor v Supabase → SQL Editor → New query → Run (dá sa spustiť aj opakovane)

create extension if not exists "pgcrypto";

-- ---------- Udalosti (naživo aj mediálne), chronologicky ----------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  title       text not null,
  kind        text not null default 'nazivo' check (kind in ('nazivo', 'media', 'online', 'ine')),
  place       text,                       -- miesto konania / médium
  url         text,                       -- odkaz na článok, reportáž, FB event…
  description text,                       -- popis udalosti
  created_by  text,                       -- prihlasovacie meno, napr. FRK
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists events_date_idx on public.events(date desc);

-- ---------- Súbory: fotky a videá k udalosti alebo v media kite ----------
create table if not exists public.assets (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid references public.events(id) on delete cascade,
  kit_category text,                      -- kniha | vizualy | videa | logo | autor | tlac (ak nie je pri udalosti)
  name         text not null,
  path         text not null unique,      -- cesta v Storage buckete "media"
  thumb_path   text,                      -- náhľad (vytvára prehliadač pri nahrávaní)
  size         bigint not null default 0,
  mime         text,
  width        int,
  height       int,
  caption      text,                      -- popis fotky / videa
  uploaded_by  text,
  created_at   timestamptz not null default now(),
  check (event_id is not null or kit_category is not null)
);
create index if not exists assets_event_idx on public.assets(event_id, created_at);
create index if not exists assets_kit_idx   on public.assets(kit_category, created_at);

-- ---------- Hotové texty postov (media kit) ----------
create table if not exists public.snippets (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null,
  lang        text not null default 'sk',
  position    int not null default 0,
  updated_by  text,
  updated_at  timestamptz not null default now()
);

create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

drop trigger if exists events_touch on public.events;
create trigger events_touch before update on public.events
  for each row execute function public.touch_updated_at();
drop trigger if exists snippets_touch on public.snippets;
create trigger snippets_touch before update on public.snippets
  for each row execute function public.touch_updated_at();

-- ---------- RLS: každý prihlásený vidí a upravuje všetko ----------
alter table public.events   enable row level security;
alter table public.assets   enable row level security;
alter table public.snippets enable row level security;

drop policy if exists "auth all events" on public.events;
create policy "auth all events" on public.events
  for all to authenticated using (true) with check (true);
drop policy if exists "auth all assets" on public.assets;
create policy "auth all assets" on public.assets
  for all to authenticated using (true) with check (true);
drop policy if exists "auth all snippets" on public.snippets;
create policy "auth all snippets" on public.snippets
  for all to authenticated using (true) with check (true);

-- ---------- Storage bucket ----------
insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

drop policy if exists "auth read media"   on storage.objects;
drop policy if exists "auth insert media" on storage.objects;
drop policy if exists "auth update media" on storage.objects;
drop policy if exists "auth delete media" on storage.objects;
create policy "auth read media" on storage.objects
  for select to authenticated using (bucket_id = 'media');
create policy "auth insert media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');
create policy "auth update media" on storage.objects
  for update to authenticated using (bucket_id = 'media');
create policy "auth delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media');

-- ---------- Úvodné dáta (len ak sú tabuľky prázdne) ----------
insert into public.events (date, title, kind, place, url, description, created_by)
select * from (values
  ('2026-09-10'::date, 'Historická revue / SME: Unikátny hrdina SNP Matej Beznák', 'media', 'SME – Historická revue',
   'https://www.sme.sk/historicka-revue/c/unikatny-hrdina-snp-matej-beznak-zostrelil-nemecke-lietadlo-z-platenneho-dvojplosnika',
   'Článok Tomáša Mrvu: Zostrelil nemecké lietadlo z plátenného dvojplošníka.', 'FRK'),
  ('2026-09-21'::date, 'RTVS: reportáž z krstu knihy', 'media', 'RTVS',
   'https://www.youtube.com/watch?v=fd_BDC10NKk',
   'Výnimočný príbeh slovenského letca Mateja Beznáka – reportáž z krstu na IMAD Piešťany 2026.', 'FRK'),
  ('2026-09-20'::date, 'Krst knihy na IMAD Piešťany 2026', 'nazivo', 'Letisko Piešťany – Medzinárodné letecké dni',
   null,
   'Slávnostný krst knihy za účasti náčelníka Generálneho štábu OS SR gen. Miroslava Lorinca. POZOR: dátum treba overiť a opraviť.', 'FRK')
) as v(date, title, kind, place, url, description, created_by)
where not exists (select 1 from public.events);

insert into public.snippets (title, body, lang, position, updated_by)
select * from (values
  ('Post na FB – krátky (SK)',
   E'✈️ Posledný zostrel z dvojplošníka v 2. svetovej vojne má slovenský príbeh. 7. septembra 1944 zostrelil letec SNP Matej Beznák z plátenného dvojplošníka Letov Š-328 moderné nemecké lietadlo Focke-Wulf Fw 189.\n\nKniha Posledný zostrel – 328 strán, vyše 250 dobových fotografií, mapy Luftwaffe.\n\n👉 www.luc.sk/poslednyzostrel',
   'sk', 1, 'FRK'),
  ('Příspěvek na FB – krátký (CZ)',
   E'✈️ Poslední sestřel z dvouplošníku ve 2. světové válce má slovenský příběh. 7. září 1944 sestřelil letec SNP Matej Beznák z plátěného dvouplošníku Letov Š-328 moderní německý letoun Focke-Wulf Fw 189.\n\nKniha Posledný zostrel – 328 stran, přes 250 dobových fotografií, mapy Luftwaffe.\n\n👉 www.luc.sk/poslednyzostrel',
   'cz', 2, 'FRK'),
  ('Anotácia knihy (SK)',
   E'Posledný zostrel – Jakub Prokeš, Matej Beznák. Druhé, doplnené vydanie knihy Takmer pravdivý príbeh (1997). Skutočný príbeh letca SNP z Trenčianskych Teplíc, ktorý 7. 9. 1944 zostrelil z dvojplošníka Letov Š-328 nemecký Focke-Wulf Fw 189 – zrejme posledný zostrel z dvojplošníka v 2. svetovej vojne. Pevná väzba, 328 strán, vyše 250 dobových fotografií. ISBN 978-80-975299-0-1. Vydal flink s. r. o.',
   'sk', 3, 'FRK')
) as v(title, body, lang, position, updated_by)
where not exists (select 1 from public.snippets);
