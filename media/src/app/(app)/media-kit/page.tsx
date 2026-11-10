import { createClient } from "@/lib/supabase/server";
import { withThumbs } from "@/lib/data";
import { KIT_CATEGORIES, type Asset, type Snippet } from "@/lib/types";
import { Uploader } from "@/components/uploader";
import { Gallery } from "@/components/gallery";
import { Snippets } from "./snippets";
import { ShareButton } from "@/components/share-button";
import { emailToUsername } from "@/lib/username";

export const dynamic = "force-dynamic";

export default async function MediaKitPage() {
  const supabase = await createClient();
  const [{ data: assets, error }, { data: snippets }, { data: auth }] = await Promise.all([
    supabase.from("assets").select("*").is("event_id", null).order("created_at"),
    supabase.from("snippets").select("*").order("position"),
    supabase.auth.getUser(),
  ]);
  const me = emailToUsername(auth.user?.email);
  const list = await withThumbs((assets ?? []) as Asset[]);

  return (
    <div className="space-y-8 md:space-y-10">
      <header>
        <h1 className="font-serif text-2xl font-bold md:text-3xl">Media kit</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Oficiálne podklady ku knihe – fotky z knihy, obálka, videá, logá a hotové texty postov. Všetko na stiahnutie v plnej kvalite.
        </p>
        <nav className="-mx-3 mt-4 flex gap-1.5 overflow-x-auto px-3 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
          {[...KIT_CATEGORIES.map((c) => ({ slug: c.slug, name: c.name })), { slug: "texty", name: "Texty postov na FB" }].map((c) => (
            <a key={c.slug} href={`#${c.slug}`} className="bg-card hover:bg-accent shrink-0 rounded-full border px-3 py-1.5 text-xs">
              {c.name}
            </a>
          ))}
        </nav>
      </header>

      {error && (
        <p className="text-destructive rounded-md border border-current/30 p-3 text-sm">
          Databáza nie je pripravená: {error.message}
        </p>
      )}

      {KIT_CATEGORIES.map((c) => (
        <section key={c.slug} id={c.slug} className="scroll-mt-44 space-y-3 md:scroll-mt-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-serif text-xl font-semibold">{c.name}</h2>
              <p className="text-muted-foreground text-xs">{c.hint}</p>
            </div>
            <ShareButton iconOnly path={`/media-kit#${c.slug}`} title={`Posledný zostrel – media kit: ${c.name}`} />
          </div>
          <Uploader kitCategory={c.slug} label="Nahrať" />
          <Gallery
            assets={list.filter((a) => a.kit_category === c.slug)}
            zipName={`posledny-zostrel-${c.slug}`}
            empty="Zatiaľ prázdne."
            me={me}
          />
        </section>
      ))}

      <section id="texty" className="scroll-mt-44 space-y-3 md:scroll-mt-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl font-semibold">Texty postov na FB</h2>
            <p className="text-muted-foreground text-xs">Hotové texty pre správcov FB stránok – skopírovať a vložiť.</p>
          </div>
          <ShareButton iconOnly path="/media-kit#texty" title="Posledný zostrel – texty postov na FB" />
        </div>
        <Snippets snippets={(snippets ?? []) as Snippet[]} />
      </section>
    </div>
  );
}
