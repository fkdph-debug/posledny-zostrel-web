"use client";

import { useEffect, useState, useTransition } from "react";
import type { AssetView } from "@/lib/types";
import { deleteAsset, getFileUrl, getFileUrls, updateCaption } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CopyButton } from "@/components/copy-button";
import { cn, formatBytes, formatDate, isImage, isVideo } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  FolderDown,
  Loader2,
  MessageSquareText,
  Play,
  Trash2,
} from "lucide-react";

function Tile({ a, onOpen }: { a: AssetView; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group bg-card relative block aspect-square w-full cursor-pointer overflow-hidden rounded-md border text-left"
      title={a.caption ?? a.name}
    >
      {a.thumbUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={a.thumbUrl}
          alt={a.caption ?? a.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-1 p-2">
          <FileText className="size-6" />
          <span className="line-clamp-2 text-center text-[11px] break-all">{a.name}</span>
        </div>
      )}
      {isVideo(a.mime) && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-black/55 text-white">
            <Play className="size-5 fill-current" />
          </span>
        </span>
      )}
      {a.caption && (
        <span className="absolute right-1.5 bottom-1.5 rounded bg-black/55 p-1 text-white" title="Má popis">
          <MessageSquareText className="size-3" />
        </span>
      )}
    </button>
  );
}

function Viewer({
  a,
  onPrev,
  onNext,
  onDeleted,
}: {
  a: AssetView;
  onPrev?: () => void;
  onNext?: () => void;
  onDeleted: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState(a.caption ?? "");
  const [saved, setSaved] = useState(true);
  const [pending, start] = useTransition();

  useEffect(() => {
    let alive = true;
    setUrl(null);
    setCaption(a.caption ?? "");
    setSaved(true);
    if (isImage(a.mime) || isVideo(a.mime))
      getFileUrl(a.path).then((u) => alive && setUrl(u)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [a.id, a.path, a.mime, a.caption]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onNext]);

  async function download() {
    const u = await getFileUrl(a.path, a.name);
    window.location.href = u;
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_280px]">
      <div className="relative flex min-h-56 items-center justify-center overflow-hidden rounded-md bg-neutral-900">
        {isVideo(a.mime) ? (
          url ? (
            <video src={url} controls playsInline poster={a.thumbUrl ?? undefined} className="max-h-[70dvh] w-full" />
          ) : (
            <Loader2 className="size-6 animate-spin text-white/60" />
          )
        ) : isImage(a.mime) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url ?? a.thumbUrl ?? ""}
            alt={a.caption ?? a.name}
            className="max-h-[70dvh] w-auto object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-8 text-white/80">
            <FileText className="size-10" />
            <span className="text-sm">{a.name}</span>
          </div>
        )}
        {onPrev && (
          <button type="button" onClick={onPrev} className="absolute top-1/2 left-2 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-2 text-white hover:bg-black/70" title="Predchádzajúci (←)">
            <ChevronLeft className="size-5" />
          </button>
        )}
        {onNext && (
          <button type="button" onClick={onNext} className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-2 text-white hover:bg-black/70" title="Ďalší (→)">
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div>
          <DialogTitle className="text-sm font-medium break-all">{a.name}</DialogTitle>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {formatBytes(a.size)}
            {a.width && a.height ? ` · ${a.width} × ${a.height} px` : ""} · {formatDate(a.created_at)}
            {a.uploaded_by ? ` · ${a.uploaded_by}` : ""}
          </p>
        </div>

        <Button onClick={download} className="bg-brand-green hover:bg-brand-green-dark text-white">
          <Download /> Stiahnuť originál
        </Button>

        <div className="space-y-1.5">
          <label className="text-muted-foreground text-xs font-medium tracking-wide uppercase" htmlFor={`cap-${a.id}`}>
            Popis
          </label>
          <Textarea
            id={`cap-${a.id}`}
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              setSaved(false);
            }}
            placeholder="Kto, čo, kde, kedy · autor fotky (©)…"
            className="bg-card min-h-24"
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={saved || pending}
              onClick={() =>
                start(async () => {
                  await updateCaption(a.id, caption);
                  setSaved(true);
                })
              }
            >
              {pending ? "Ukladám…" : saved ? "Uložené" : "Uložiť popis"}
            </Button>
            {caption.trim() && <CopyButton text={caption} label="Kopírovať" />}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive mt-auto self-start"
          onClick={() => {
            if (!confirm(`Zmazať „${a.name}“? Nedá sa to vrátiť.`)) return;
            start(async () => {
              await deleteAsset(a.id);
              onDeleted();
            });
          }}
        >
          <Trash2 /> Zmazať súbor
        </Button>
      </div>
    </div>
  );
}

export function Gallery({
  assets,
  zipName,
  empty = "Zatiaľ tu nič nie je.",
  className,
}: {
  assets: AssetView[];
  zipName: string;
  empty?: string;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [zipping, setZipping] = useState<string | null>(null);
  const current = open !== null ? assets[open] : null;

  async function downloadAll() {
    setZipping("Pripravujem…");
    try {
      const { downloadZip } = await import("client-zip");
      const urls = await getFileUrls(assets.map((a) => a.path));
      const used = new Set<string>();
      const uniq = (n: string) => {
        let name = n;
        for (let i = 2; used.has(name); i++) name = n.replace(/(\.[^.]*)?$/, `-${i}$1`);
        used.add(name);
        return name;
      };
      let i = 0;
      async function* files() {
        for (const [k, a] of assets.entries()) {
          i = k + 1;
          setZipping(`Sťahujem ${i}/${assets.length}…`);
          const res = await fetch(urls[k] ?? "");
          yield { name: uniq(a.name), lastModified: new Date(a.created_at), input: res };
        }
        const captions = assets
          .filter((a) => a.caption)
          .map((a) => `${a.name}\n${a.caption}\n`)
          .join("\n");
        if (captions) yield { name: "popisy.txt", input: captions };
      }
      const blob = await downloadZip(files()).blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${zipName}.zip`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 5000);
    } catch (e) {
      alert(`Sťahovanie zlyhalo: ${(e as Error).message}`);
    } finally {
      setZipping(null);
    }
  }

  if (!assets.length)
    return <p className={cn("text-muted-foreground py-4 text-sm", className)}>{empty}</p>;

  const total = assets.reduce((s, a) => s + (a.size || 0), 0);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {assets.map((a, i) => (
          <Tile key={a.id} a={a} onOpen={() => setOpen(i)} />
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs">
          {assets.length} {assets.length === 1 ? "súbor" : assets.length < 5 ? "súbory" : "súborov"} · {formatBytes(total)}
        </span>
        <Button size="sm" variant="outline" className="bg-card" disabled={zipping !== null} onClick={downloadAll}>
          {zipping ? <Loader2 className="animate-spin" /> : <FolderDown />} {zipping ?? "Stiahnuť všetko (ZIP)"}
        </Button>
      </div>

      <Dialog open={current !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[95dvh] overflow-y-auto sm:max-w-5xl">
          {current && (
            <Viewer
              key={current.id}
              a={current}
              onPrev={open! > 0 ? () => setOpen(open! - 1) : undefined}
              onNext={open! < assets.length - 1 ? () => setOpen(open! + 1) : undefined}
              onDeleted={() => setOpen(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
