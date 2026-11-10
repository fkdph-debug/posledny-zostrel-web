import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { withThumbs } from "@/lib/data";
import { KINDS, type Asset, type EventRow } from "@/lib/types";
import { cn, formatDay } from "@/lib/utils";
import { EventFormDialog } from "@/components/event-form";
import { ArrowDownUp, ExternalLink, ImageIcon, MapPin, Video } from "lucide-react";

export const dynamic = "force-dynamic";

const KIND_STYLE: Record<string, string> = {
  nazivo: "bg-brand-green/10 text-brand-green-dark",
  media: "bg-brand-red/10 text-brand-red",
  online: "bg-sky-600/10 text-sky-700",
  ine: "bg-secondary text-secondary-foreground",
};

const MONTHS = ["január", "február", "marec", "apríl", "máj", "jún", "júl", "august", "september", "október", "november", "december"];

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ poradie?: string; typ?: string }>;
}) {
  const { poradie, typ } = await searchParams;
  const oldestFirst = poradie === "najstarsie";
  const supabase = await createClient();

  let q = supabase.from("events").select("*").order("date", { ascending: oldestFirst }).order("created_at");
  if (typ && typ in KINDS) q = q.eq("kind", typ);
  const [{ data: events, error }, { data: assets }] = await Promise.all([
    q,
    supabase
      .from("assets")
      .select("*")
      .not("event_id", "is", null)
      .order("created_at"),
  ]);

  const rows = (events ?? []) as EventRow[];
  const byEvent = new Map<string, Asset[]>();
  for (const a of (assets ?? []) as Asset[]) {
    const list = byEvent.get(a.event_id!) ?? [];
    list.push(a);
    byEvent.set(a.event_id!, list);
  }
  // náhľady: max. 5 na udalosť
  const preview = await withThumbs(rows.flatMap((e) => (byEvent.get(e.id) ?? []).filter((a) => a.thumb_path).slice(0, 5)));
  const previewBy = new Map<string, typeof preview>();
  for (const a of preview) previewBy.set(a.event_id!, [...(previewBy.get(a.event_id!) ?? []), a]);

  const today = new Date().toISOString().slice(0, 10);
  let lastMonth = "";

  const filterLink = (t?: string) => {
    const p = new URLSearchParams();
    if (oldestFirst) p.set("poradie", "najstarsie");
    if (t) p.set("typ", t);
    const s = p.toString();
    return s ? `/?${s}` : "/";
  };
  const orderLink = (() => {
    const p = new URLSearchParams();
    if (!oldestFirst) p.set("poradie", "najstarsie");
    if (typ) p.set("typ", typ);
    const s = p.toString();
    return s ? `/?${s}` : "/";
  })();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold md:text-3xl">Udalosti</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Akcie naživo aj výstupy v médiách – fotky, videá a popisy na stiahnutie.
          </p>
        </div>
        <EventFormDialog />
      </header>

      <div className="-mx-3 flex items-center gap-1.5 overflow-x-auto px-3 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
        {[undefined, ...Object.keys(KINDS)].map((k) => (
          <Link
            key={k ?? "all"}
            href={filterLink(k)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors",
              (typ ?? undefined) === k ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent"
            )}
          >
            {k ? KINDS[k as keyof typeof KINDS] : "Všetko"}
          </Link>
        ))}
        <Link
          href={orderLink}
          className="text-muted-foreground hover:text-foreground ml-auto flex shrink-0 items-center gap-1 py-1.5 pl-2 text-xs"
        >
          <ArrowDownUp className="size-3.5" /> {oldestFirst ? "Od najstarších" : "Od najnovších"}
        </Link>
      </div>

      {error && (
        <p className="text-destructive rounded-md border border-current/30 p-3 text-sm">
          Databáza nie je pripravená: {error.message}. Spusti <code>supabase/schema.sql</code> v Supabase → SQL Editor.
        </p>
      )}

      {!rows.length && !error ? (
        <p className="text-muted-foreground py-10 text-center text-sm">Zatiaľ žiadne udalosti.</p>
      ) : (
        <ol className="space-y-3">
          {rows.map((e) => {
            const [y, m] = e.date.split("-");
            const monthKey = `${y}-${m}`;
            const showMonth = monthKey !== lastMonth;
            lastMonth = monthKey;
            const list = byEvent.get(e.id) ?? [];
            const photos = list.filter((a) => a.mime?.startsWith("image/")).length;
            const videos = list.filter((a) => a.mime?.startsWith("video/")).length;
            const upcoming = e.date >= today;
            return (
              <li key={e.id} className="relative">
                {showMonth && (
                  <p className="text-muted-foreground mb-2 pt-3 text-xs font-semibold tracking-wider uppercase">
                    {MONTHS[Number(m) - 1]} {y}
                  </p>
                )}
                <Link
                  href={`/udalosti/${e.id}`}
                  className={cn("bg-card hover:border-brand-gold/60 block rounded-lg border border-l-4 p-3 transition-colors active:bg-accent/40 md:p-4", upcoming ? "border-l-brand-gold" : "border-l-primary/70")}
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <span className="font-medium">{formatDay(e.date)}</span>
                    <span className={cn("rounded px-1.5 py-0.5 font-medium", KIND_STYLE[e.kind])}>{KINDS[e.kind]}</span>
                    {upcoming && <span className="text-brand-gold font-semibold">pripravuje sa</span>}
                  </div>
                  <h2 className="mt-1.5 font-serif text-base leading-snug font-semibold md:text-lg">{e.title}</h2>
                  <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    {e.place && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" /> {e.place}
                      </span>
                    )}
                    {e.url && (
                      <span className="flex items-center gap-1">
                        <ExternalLink className="size-3" /> odkaz
                      </span>
                    )}
                    {photos > 0 && (
                      <span className="flex items-center gap-1">
                        <ImageIcon className="size-3" /> {photos}
                      </span>
                    )}
                    {videos > 0 && (
                      <span className="flex items-center gap-1">
                        <Video className="size-3" /> {videos}
                      </span>
                    )}
                  </div>
                  {e.description && (
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{e.description}</p>
                  )}
                  {(previewBy.get(e.id)?.length ?? 0) > 0 && (
                    <div className="mt-3 flex gap-1.5 overflow-hidden">
                      {previewBy.get(e.id)!.map((a) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={a.id} src={a.thumbUrl ?? ""} alt="" loading="lazy" className="size-14 shrink-0 rounded object-cover md:size-16" />
                      ))}
                      {list.length > 5 && (
                        <span className="bg-secondary text-muted-foreground flex size-14 shrink-0 items-center justify-center rounded text-xs md:size-16">
                          +{list.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
