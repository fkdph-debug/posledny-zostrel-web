import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { withThumbs } from "@/lib/data";
import { KINDS, type Asset, type EventRow } from "@/lib/types";
import { formatDay, safeName } from "@/lib/utils";
import { EventFormDialog } from "@/components/event-form";
import { Uploader } from "@/components/uploader";
import { Gallery } from "@/components/gallery";
import { CopyButton } from "@/components/copy-button";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const [{ data: event }, { data: assets }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).maybeSingle(),
    supabase.from("assets").select("*").eq("event_id", id).order("created_at"),
  ]);
  if (!event) notFound();
  const e = event as EventRow;
  const list = await withThumbs((assets ?? []) as Asset[]);
  const media = list.filter((a) => a.mime?.startsWith("image/") || a.mime?.startsWith("video/"));
  const docs = list.filter((a) => !(a.mime?.startsWith("image/") || a.mime?.startsWith("video/")));

  const summary = [
    `${e.title} (${formatDay(e.date)}${e.place ? `, ${e.place}` : ""})`,
    e.description,
    e.url,
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div className="space-y-8">
      <Link href="/" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
        <ArrowLeft className="size-4" /> Udalosti
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">{formatDay(e.date)}</span>
          <span className="bg-secondary rounded px-1.5 py-0.5 text-xs font-medium">{KINDS[e.kind]}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-serif text-3xl leading-tight font-bold">{e.title}</h1>
          <EventFormDialog event={e} />
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {e.place && (
            <span className="flex items-center gap-1">
              <MapPin className="size-4" /> {e.place}
            </span>
          )}
          {e.url && (
            <a href={e.url} target="_blank" rel="noopener" className="text-foreground flex items-center gap-1 underline-offset-4 hover:underline">
              <ExternalLink className="size-4" /> {e.url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 60)}
            </a>
          )}
        </div>
      </header>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Popis</h2>
          <CopyButton text={summary} label="Kopírovať popis" variant="ghost" />
        </div>
        {e.description ? (
          <p className="bg-card rounded-lg border p-4 text-[15px] leading-relaxed whitespace-pre-line">{e.description}</p>
        ) : (
          <p className="text-muted-foreground text-sm">Bez popisu – doplň cez „Upraviť“.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Fotky a videá</h2>
        <Uploader eventId={e.id} />
        <Gallery
          assets={media}
          zipName={`${e.date}-${safeName(e.title).slice(0, 50)}`}
          empty="Zatiaľ žiadne fotky ani videá."
        />
      </section>

      {docs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Dokumenty</h2>
          <Gallery assets={docs} zipName={`${e.date}-dokumenty`} />
        </section>
      )}
    </div>
  );
}
