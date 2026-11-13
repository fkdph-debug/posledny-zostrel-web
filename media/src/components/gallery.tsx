"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { AssetView } from "@/lib/types";
import { deleteAsset, getFileUrl, getFileUrls, updateCaption } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CopyButton } from "@/components/copy-button";
import { Comments } from "@/components/comments";
import { ShareButton } from "@/components/share-button";
import { cn, formatBytes, formatDate, isImage, isVideo } from "@/lib/utils";
import {
  ChevronLeft,
  Cloud,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  FolderDown,
  Loader2,
  MessageSquareText,
  Play,
  Trash2,
} from "lucide-react";

const oneDriveView = (url: string) => `/api/onedrive?mode=view&url=${encodeURIComponent(url)}`;

function LinkList({ links, me }: { links: AssetView[]; me?: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [, start] = useTransition();
  return (
    <ul className="divide-y rounded-lg border">
      {links.map((a) => {
        const host = (() => {
          try {
            return new URL(a.external_url!).hostname.replace(/^www\./, "");
          } catch {
            return "";
          }
        })();
        return (
          <li key={a.id} className="bg-card">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Cloud className="text-muted-foreground size-4 shrink-0" />
              <a
                href={a.external_url!}
                target="_blank"
                rel="noopener"
                className="min-w-0 flex-1 hover:underline"
                title={a.external_url!}
              >
                <span className="block truncate text-sm font-medium">{a.name}</span>
                <span className="text-muted-foreground block truncate text-xs">
                  {host} · {formatDate(a.created_at)}
                  {a.uploaded_by ? ` · ${a.uploaded_by}` : ""}
                </span>
              </a>
              <CopyButton text={a.external_url!} label="Kopírovať" size="icon-sm" variant="ghost" />
              <ShareButton path={`${typeof window !== "undefined" ? window.location.pathname : ""}?foto=${a.id}`} title={a.name} iconOnly />
              <Button
                variant="ghost"
                size="icon-sm"
                title="Komentáre"
                className={cn(openId === a.id && "bg-accent")}
                onClick={() => setOpenId(openId === a.id ? null : a.id)}
              >
                <MessageSquareText />
              </Button>
              <Button variant="ghost" size="icon-sm" title="Otvoriť" asChild>
                <a href={a.external_url!} target="_blank" rel="noopener">
                  <ExternalLink />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                title="Zmazať odkaz"
                className="hover:text-destructive"
                onClick={() => {
                  if (!confirm(`Zmazať odkaz „${a.name}“?`)) return;
                  start(() => deleteAsset(a.id));
                }}
              >
                <Trash2 />
              </Button>
            </div>
            {openId === a.id && (
              <div className="border-t px-3 py-3">
                <Comments assetId={a.id} me={me} compact />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

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
      {a.external_url && (
        <span className="absolute top-1.5 left-1.5 rounded bg-black/55 p-1 text-white" title="Z OneDrive">
          <Cloud className="size-3" />
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
  me,
  onPrev,
  onNext,
  onDeleted,
}: {
  a: AssetView;
  me?: string;
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
    if (a.external_url) setUrl(oneDriveView(a.external_url));
    else if (a.path && (isImage(a.mime) || isVideo(a.mime)))
      getFileUrl(a.path).then((u) => alive && setUrl(u)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [a.id, a.path, a.external_url, a.mime, a.caption]);

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
    if (a.external_url) {
      window.open(oneDriveView(a.external_url), "_blank", "noopener");
      return;
    }
    if (!a.path) return;
    const u = await getFileUrl(a.path, a.name);
    window.location.href = u;
  }

  // swipe na mobile
  const touch = useRef<{ x: number; y: number } | null>(null);

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_300px]">
      <div
        className="relative -mx-3 -mt-3 flex min-h-56 items-center justify-center overflow-hidden bg-neutral-900 sm:mx-0 sm:mt-0 sm:rounded-md"
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={(e) => {
          const t = touch.current;
          touch.current = null;
          if (!t) return;
          const dx = e.changedTouches[0].clientX - t.x;
          const dy = e.changedTouches[0].clientY - t.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? onNext : onPrev)?.();
        }}
      >
        {isVideo(a.mime) ? (
          url ? (
            <video src={url} controls playsInline poster={a.thumbUrl ?? undefined} className="max-h-[60dvh] w-full sm:max-h-[70dvh]" />
          ) : (
            <Loader2 className="size-6 animate-spin text-white/60" />
          )
        ) : isImage(a.mime) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url ?? a.thumbUrl ?? ""}
            alt={a.caption ?? a.name}
            className="max-h-[60dvh] w-auto object-contain sm:max-h-[70dvh]"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-8 text-white/80">
            <FileText className="size-10" />
            <span className="text-sm">{a.name}</span>
          </div>
        )}
        {onPrev && (
          <button type="button" onClick={onPrev} className="absolute top-1/2 left-2 hidden -translate-y-1/2 cursor-pointer sm:block rounded-full bg-black/50 p-2 text-white hover:bg-black/70" title="Predchádzajúci (←)">
            <ChevronLeft className="size-5" />
          </button>
        )}
        {onNext && (
          <button type="button" onClick={onNext} className="absolute top-1/2 right-2 hidden -translate-y-1/2 cursor-pointer sm:block rounded-full bg-black/50 p-2 text-white hover:bg-black/70" title="Ďalší (→)">
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div>
          <DialogTitle className="text-sm font-medium break-all">{a.name}</DialogTitle>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {a.external_url ? "OneDrive" : formatBytes(a.size)}
            {a.width && a.height ? ` · ${a.width} × ${a.height} px` : ""} · {formatDate(a.created_at)}
            {a.uploaded_by ? ` · ${a.uploaded_by}` : ""}
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={download} className="bg-brand-green hover:bg-brand-green-dark min-w-0 flex-1 text-white">
            <Download /> {a.external_url ? "Otvoriť / stiahnuť z OneDrive" : "Stiahnuť originál"}
          </Button>
          <ShareButton
            path={`${typeof window !== "undefined" ? window.location.pathname : ""}?foto=${a.id}`}
            title={a.caption ?? a.name}
            iconOnly
            className="bg-card size-9 border"
          />
        </div>
        {a.external_url && (
          <a
            href={a.external_url}
            target="_blank"
            rel="noopener"
            className="text-muted-foreground -mt-1 flex items-center gap-1 text-xs underline-offset-4 hover:underline"
          >
            <Cloud className="size-3.5" /> Zdieľací odkaz OneDrive
          </a>
        )}

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

        <Comments assetId={a.id} me={me} compact />

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
  assets: allAssets,
  zipName,
  empty = "Zatiaľ tu nič nie je.",
  me,
  className,
}: {
  assets: AssetView[];
  zipName: string;
  empty?: string;
  me?: string;
  className?: string;
}) {
  // odkazy (bez súboru v Storage) sa zobrazujú ako zoznam, nie dlaždice
  const assets = allAssets.filter((a) => a.path);
  const [open, setOpenState] = useState<number | null>(null);
  const [zipping, setZipping] = useState<string | null>(null);

  // ?foto=<id> v adrese otvorí konkrétny súbor (zdieľateľný odkaz)
  const setOpen = (i: number | null) => {
    setOpenState(i);
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    if (i === null) u.searchParams.delete("foto");
    else u.searchParams.set("foto", assets[i].id);
    window.history.replaceState(null, "", u.toString());
  };
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("foto");
    if (!id) return;
    const i = assets.findIndex((a) => a.id === id);
    if (i >= 0) setOpenState(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const current = open !== null ? assets[open] : null;

  async function downloadAll() {
    setZipping("Pripravujem…");
    try {
      const { downloadZip } = await import("client-zip");
      const stored = assets.filter((a) => a.path);
      const links = assets.filter((a) => !a.path && a.external_url);
      const urls = stored.length ? await getFileUrls(stored.map((a) => a.path!)) : [];
      const used = new Set<string>();
      const uniq = (n: string) => {
        let name = n;
        for (let i = 2; used.has(name); i++) name = n.replace(/(\.[^.]*)?$/, `-${i}$1`);
        used.add(name);
        return name;
      };
      let i = 0;
      async function* files() {
        for (const [k, a] of stored.entries()) {
          i = k + 1;
          setZipping(`Sťahujem ${i}/${stored.length}…`);
          const res = await fetch(urls[k] ?? "");
          yield { name: uniq(a.name), lastModified: new Date(a.created_at), input: res };
        }
        const captions = assets
          .filter((a) => a.caption)
          .map((a) => `${a.name}\n${a.caption}\n`)
          .join("\n");
        if (captions) yield { name: "popisy.txt", input: captions };
        if (links.length)
          yield {
            name: "onedrive-odkazy.txt",
            input: links.map((a) => `${a.name}\n${a.external_url}\n${a.caption ?? ""}\n`).join("\n"),
          };
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

  const links = allAssets.filter((a) => !a.path && a.external_url);

  if (!assets.length && !links.length)
    return <p className={cn("text-muted-foreground py-4 text-sm", className)}>{empty}</p>;

  const total = assets.reduce((s, a) => s + (a.size || 0), 0);

  return (
    <div className={cn("space-y-3", className)}>
      {links.length > 0 && <LinkList links={links} me={me} />}
      {assets.length > 0 && (
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2 lg:grid-cols-5">
        {assets.map((a, i) => (
          <Tile key={a.id} a={a} onOpen={() => setOpen(i)} />
        ))}
      </div>
      )}
      {assets.length > 0 && (
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs">
          {assets.length} {assets.length === 1 ? "súbor" : assets.length < 5 ? "súbory" : "súborov"} · {formatBytes(total)}
        </span>
        <Button size="sm" variant="outline" className="bg-card" disabled={zipping !== null} onClick={downloadAll}>
          {zipping ? <Loader2 className="animate-spin" /> : <FolderDown />} {zipping ?? "Stiahnuť všetko (ZIP)"}
        </Button>
      </div>
      )}

      <Dialog open={current !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[100dvh] max-w-[calc(100%-0.5rem)] overflow-y-auto p-3 sm:max-h-[95dvh] sm:max-w-5xl sm:p-6">
          {current && (
            <Viewer
              key={current.id}
              a={current}
              me={me}
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
