"use client";

import { useEffect, useState, useTransition } from "react";
import type { Comment } from "@/lib/types";
import { addComment, deleteComment, listComments } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MessageSquare, Send, Trash2 } from "lucide-react";

function when(iso: string) {
  return new Date(iso).toLocaleString("sk-SK", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });
}

/**
 * Komentáre k udalosti (initial = zo servera) alebo k súboru (načítajú sa po otvorení).
 */
export function Comments({
  eventId,
  assetId,
  initial,
  me,
  compact = false,
  className,
}: {
  eventId?: string;
  assetId?: string;
  initial?: Comment[];
  me?: string;
  compact?: boolean;
  className?: string;
}) {
  const [items, setItems] = useState<Comment[]>(initial ?? []);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const [loading, setLoading] = useState(!initial && !!assetId);

  useEffect(() => {
    if (initial) setItems(initial);
  }, [initial]);

  useEffect(() => {
    if (!assetId || initial) return;
    let alive = true;
    setLoading(true);
    listComments(assetId)
      .then((d) => alive && setItems(d as Comment[]))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [assetId, initial]);

  function submit() {
    const body = text.trim();
    if (!body) return;
    start(async () => {
      const c = (await addComment({ event_id: eventId ?? null, asset_id: assetId ?? null, body })) as Comment;
      setItems((l) => [...l, c]);
      setText("");
    });
  }

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
        <MessageSquare className="size-3.5" /> Komentáre
        {items.length > 0 && <span className="bg-secondary rounded px-1.5 py-0.5 text-[10px]">{items.length}</span>}
      </h3>

      {loading ? (
        <p className="text-muted-foreground text-xs">Načítavam…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-xs">Zatiaľ bez komentára.</p>
      ) : (
        <ul className={cn("space-y-1.5", compact && "max-h-48 overflow-y-auto pr-1")}>
          {items.map((c) => (
            <li key={c.id} className="group bg-card rounded-md border px-3 py-2 text-sm">
              <div className="text-muted-foreground mb-0.5 flex items-center justify-between gap-2 text-[11px]">
                <span>
                  <b className="text-foreground">{c.author ?? "—"}</b> · {when(c.created_at)}
                </span>
                {(me && c.author === me) || !c.author ? (
                  <button
                    type="button"
                    title="Zmazať"
                    className="hover:text-destructive cursor-pointer opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      if (!confirm("Zmazať komentár?")) return;
                      start(async () => {
                        await deleteComment(c.id, eventId);
                        setItems((l) => l.filter((x) => x.id !== c.id));
                      });
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                ) : null}
              </div>
              <p className="whitespace-pre-line">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          placeholder="Napísať komentár… (Ctrl/⌘+Enter odošle)"
          className="bg-card min-h-10 flex-1"
          rows={1}
        />
        <Button type="submit" size="icon" title="Odoslať" disabled={pending || !text.trim()} className="size-10">
          <Send />
        </Button>
      </form>
    </div>
  );
}
