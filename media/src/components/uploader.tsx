"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { registerAsset } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { cn, formatBytes, safeName } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Link2, Loader2, Upload } from "lucide-react";

const MAX_BYTES = 50 * 1024 * 1024; // limit Supabase Free plánu na jeden súbor

type Thumb = { blob: Blob; width: number; height: number } | null;

function drawToJpeg(src: CanvasImageSource, w: number, h: number, max = 900): Promise<Blob | null> {
  const scale = Math.min(1, max / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext("2d")!.drawImage(src, 0, 0, canvas.width, canvas.height);
  return new Promise((res) => canvas.toBlob((b) => res(b), "image/jpeg", 0.82));
}

async function imageThumb(file: File): Promise<Thumb> {
  try {
    const bmp = await createImageBitmap(file);
    const blob = await drawToJpeg(bmp, bmp.width, bmp.height);
    const out = blob ? { blob, width: bmp.width, height: bmp.height } : null;
    bmp.close();
    return out;
  } catch {
    return null;
  }
}

function videoThumb(file: File): Promise<Thumb> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.src = url;
    const done = (t: Thumb) => {
      URL.revokeObjectURL(url);
      resolve(t);
    };
    const timer = setTimeout(() => done(null), 15000);
    v.onloadedmetadata = () => {
      v.currentTime = Math.min(2, (v.duration || 2) / 3);
    };
    v.onseeked = async () => {
      clearTimeout(timer);
      const blob = await drawToJpeg(v, v.videoWidth, v.videoHeight);
      done(blob ? { blob, width: v.videoWidth, height: v.videoHeight } : null);
    };
    v.onerror = () => {
      clearTimeout(timer);
      done(null);
    };
  });
}

export function Uploader({
  eventId = null,
  kitCategory = null,
  label = "Nahrať fotky / videá",
  links = false,
  className,
}: {
  eventId?: string | null;
  kitCategory?: string | null;
  label?: string;
  /** Umožniť ukladať odkazy (OneDrive, YouTube…) – bez náhľadu, len názov + odkaz. */
  links?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [drag, setDrag] = useState(false);

  async function upload(list: FileList | File[] | null) {
    const files = Array.from(list ?? []);
    if (!files.length) return;
    setErrors([]);
    const supabase = createClient();
    const folder = eventId ? `udalosti/${eventId}` : `kit/${kitCategory}`;
    const errs: string[] = [];

    for (const [i, file] of files.entries()) {
      const prefix = files.length > 1 ? `${i + 1}/${files.length} · ` : "";
      if (file.size > MAX_BYTES) {
        errs.push(`${file.name}: ${formatBytes(file.size)} – max. 50 MB na súbor. Video zmenši (napr. HandBrake) alebo daj odkaz do popisu.`);
        continue;
      }
      setStatus(`${prefix}Pripravujem ${file.name}…`);
      const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const path = `${folder}/${stamp}-${safeName(file.name)}`;
      const thumb = file.type.startsWith("image/")
        ? await imageThumb(file)
        : file.type.startsWith("video/")
          ? await videoThumb(file)
          : null;

      setStatus(`${prefix}Nahrávam ${file.name} (${formatBytes(file.size)})…`);
      const { error } = await supabase.storage
        .from("media")
        .upload(path, file, { upsert: false, contentType: file.type || undefined });
      if (error) {
        errs.push(`${file.name}: ${error.message}`);
        continue;
      }
      let thumbPath: string | null = null;
      if (thumb) {
        thumbPath = `nahlady/${stamp}.jpg`;
        const { error: tErr } = await supabase.storage
          .from("media")
          .upload(thumbPath, thumb.blob, { contentType: "image/jpeg" });
        if (tErr) thumbPath = null;
      }
      try {
        await registerAsset({
          event_id: eventId,
          kit_category: eventId ? null : kitCategory,
          name: file.name,
          path,
          thumb_path: thumbPath,
          size: file.size,
          mime: file.type || null,
          width: thumb?.width ?? null,
          height: thumb?.height ?? null,
        });
      } catch (e) {
        errs.push(`${file.name}: ${(e as Error).message}`);
      }
    }
    setStatus(null);
    setErrors(errs);
    if (inputRef.current) inputRef.current.value = "";
  }

  const [link, setLink] = useState("");
  const [linkName, setLinkName] = useState("");
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkFail, setLinkFail] = useState<string | null>(null);

  async function addLink() {
    let url = link.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    try {
      new URL(url);
    } catch {
      setLinkFail("Toto nevyzerá ako odkaz.");
      return;
    }
    setLinkFail(null);
    setLinkBusy(true);
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      await registerAsset({
        event_id: eventId,
        kit_category: eventId ? null : kitCategory,
        name: linkName.trim() || `Odkaz – ${host}`,
        path: null,
        external_url: url,
        thumb_path: null,
        size: 0,
        mime: "text/uri-list",
        width: null,
        height: null,
      });
      setLink("");
      setLinkName("");
    } catch (e) {
      setLinkFail((e as Error).message);
    } finally {
      setLinkBusy(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-dashed p-3 transition-colors",
        drag ? "border-brand-gold bg-brand-gold/10" : "border-border",
        className
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (!status) upload(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,application/pdf,.doc,.docx,.zip"
        className="hidden"
        onChange={(e) => upload(e.target.files)}
      />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="bg-card h-10 sm:h-8"
          disabled={status !== null}
          onClick={() => inputRef.current?.click()}
        >
          <Upload /> {label}
        </Button>
        <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">
          {status ?? (
            <>
              <span className="hidden sm:inline">alebo sem súbory pretiahni myšou · </span>max. 50 MB na súbor
            </>
          )}
        </span>
      </div>
      {links && (
        <form
          className="mt-2 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            addLink();
          }}
        >
          <Input
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            placeholder="Názov (napr. FB video 4:5 – originál)"
            className="bg-card h-10 sm:h-8 sm:max-w-60"
            aria-label="Názov odkazu"
          />
          <div className="relative min-w-0 flex-1">
            <Link2 className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                setLinkFail(null);
              }}
              inputMode="url"
              placeholder="Odkaz (OneDrive, YouTube, Drive…)"
              className="bg-card h-10 pl-8 sm:h-8"
              aria-label="Odkaz"
            />
          </div>
          <Button type="submit" size="sm" className="h-10 sm:h-8" disabled={!link.trim() || linkBusy}>
            {linkBusy ? <Loader2 className="animate-spin" /> : "Pridať odkaz"}
          </Button>
        </form>
      )}
      {linkFail && <p className="text-destructive mt-1.5 text-xs">{linkFail}</p>}
      {errors.length > 0 && (
        <ul className="text-destructive mt-2 space-y-0.5 text-xs">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
