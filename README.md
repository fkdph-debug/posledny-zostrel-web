# Posledný zostrel – web knihy

Statická jednostránková webstránka (HTML + CSS, bez buildu). Vydavateľ: flink s. r. o.

## Štruktúra
- `index.html` – celá stránka (texty, štýly, skripty)
- `assets/img/` – obrázky (obálka, maľba, ukážky strán, OG obrázok)
- `vercel.json` – hlavičky a cache pre Vercel

## Nasadenie: GitHub → Vercel
1. Na GitHube vytvorte nový repozitár, napr. `posledny-zostrel-web`.
2. V tomto priečinku:
   ```
   git init
   git add .
   git commit -m "Web knihy Posledný zostrel"
   git branch -M main
   git remote add origin https://github.com/<vas-ucet>/posledny-zostrel-web.git
   git push -u origin main
   ```
3. Na vercel.com → **Add New… → Project** → importujte repozitár.
   Framework Preset: **Other**, Build Command: prázdne, Output Directory: prázdne (koreň). → **Deploy**.
4. Každý ďalší `git push` na `main` sa nasadí automaticky.

## Doména z Webglobe
1. Vo Verceli: Project → **Settings → Domains** → pridajte `vasadomena.sk` aj `www.vasadomena.sk`.
2. Vo Webglobe (Admin → Domény → DNS záznamy) nastavte:
   | Typ   | Názov | Hodnota                |
   |-------|-------|------------------------|
   | A     | @     | `76.76.21.21`          |
   | CNAME | www   | `cname.vercel-dns.com.` |
   Existujúce A/AAAA záznamy pre `@` a `www` odstráňte. Presné hodnoty vám Vercel zobrazí pri doméne – ak sa líšia, platia tie z Vercelu.
3. Po propagácii DNS (minúty až hodiny) Vercel sám vystaví SSL certifikát.

## Po pripojení domény
V `index.html` zmeňte `og:image` na absolútnu adresu
(`https://vasadomena.sk/assets/img/og-image.jpg`), aby sa náhľad správne zobrazoval na Facebooku.

## Úpravy
- Odkaz na kúpu: hľadajte `luc.sk/posledny-zostrel` (5 výskytov).
- Video: premenná `VIDEO_ID` v skripte na konci `index.html`.
- Články v médiách: sekcia `id="media"`.
