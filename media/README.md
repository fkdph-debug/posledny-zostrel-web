# media.poslednyzostrel.sk – media hub

Zdroj pre všetky mediálne výstupy knihy *Posledný zostrel*. Správcovia FB stránok a ľudia z marketingu si odtiaľto sťahujú podklady.

- **Udalosti** – chronologicky zoradené akcie naživo aj mediálne výstupy; ku každej dátum, typ, miesto, odkaz, popis, fotky a videá (stiahnutie po jednom aj ako ZIP s popismi).
- **Media kit** – fotky z knihy, obálka a vizuály, videá, logá, autor, tlačové správy + hotové texty postov (SK/CZ) na skopírovanie.
- Odkaz na predaj **www.luc.sk/poslednyzostrel** (presmerovaný s UTM na Shoptet) je v bočnom paneli s tlačidlom na skopírovanie.

**Stack:** Next.js 15 · Tailwind 4 · Supabase (auth, Postgres, Storage) · Vercel. Štruktúra prevzatá z grafika.kolek.at.

Aplikácia žije v priečinku `media/` repozitára `posledny-zostrel-web` a na Verceli je to **samostatný projekt** s *Root Directory* = `media`.
Statický web v koreni repozitára ju ignoruje (`/.vercelignore`), media projekt sa prebuilduje len pri zmene v `media/` (`media/vercel.json`).

## Nasadenie

### 1. Supabase
1. Nový projekt `posledny-zostrel-media`, región Frankfurt.
2. **SQL Editor → New query** → vlož `supabase/schema.sql` → **Run** (tabuľky, oprávnenia, bucket `media`, úvodné udalosti a texty).
3. **Authentication → Users → Add user → Create new user** (zaškrtni *Auto Confirm User*) pre každého:
   `frk@media.poslednyzostrel.sk`, `mik@media.poslednyzostrel.sk`, `civ@media.poslednyzostrel.sk` – heslo podľa dohody.
4. **Authentication → Sign In / Providers → Email**: vypni *Allow new users to sign up*.
5. **Project Settings → API**: skopíruj `Project URL` a `anon public` key.

### 2. Vercel
1. **Add New → Project** → import `posledny-zostrel-web` → **Root Directory: `media`** (Framework: Next.js).
2. Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy → **Settings → Domains → Add** `media.poslednyzostrel.sk`.

### 3. Webglobe – DNS
Doména `poslednyzostrel.sk` → DNS záznamy → pridaj:

| Typ | Názov | Hodnota |
|---|---|---|
| CNAME | `media` | hodnota, ktorú ukáže Vercel (napr. `xxxx.vercel-dns-017.com.` alebo `cname.vercel-dns.com.`) |

## Prihlásenie
Tlačidlá **FRK / MIK / CIV** + heslo. Meno sa mapuje na `<meno>@media.poslednyzostrel.sk` (`src/lib/username.ts`).
Nový človek: pridaj ho v Supabase (Users → Add user) a jeho skratku do poľa `USERS` v `src/lib/username.ts`.

## Limity
Supabase Free: 1 GB úložiska, **max. 50 MB na jeden súbor**. Dlhšie videá pred nahraním zmenši (HandBrake, preset *Fast 1080p30*) –
na FB/IG to stačí. Pri väčšom objeme zvážte Pro plán (25 $/mes., 100 GB).

Náhľady fotiek a videí vytvára prehliadač pri nahrávaní (`nahlady/…` v buckete), originály ostávajú nedotknuté.

## Lokálny vývoj
```bash
cp .env.example .env.local   # doplň hodnoty zo Supabase
npm install
npm run dev
```
